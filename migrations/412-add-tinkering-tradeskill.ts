/**
 * Migration 412: models Tinkering as a tradeskill (issue #53), the same
 * `recipe`/`uses`/`produces`/`crafted_in` shapes established by Brewing/
 * Baking/Blacksmithing/Pottery (decisions/tradeskill-recipe-node-schema.md).
 *
 * eqlwiki confirms Tinkering keeps its classic-EQ gnome-only restriction in
 * EQL too: "Tinkering is a gnome-only trade skill. Gnomes start out with a
 * tinkering skill of 50 and a gnome character cannot raise tinker until he
 * reaches level 16." Not modeled as a graph field -- nothing in this schema
 * currently gates a recipe/tradeskill by race, and the Tradeskills page is
 * explicitly skill-agnostic -- but worth recording here since issue #53
 * flagged it as worth confirming.
 *
 * All 16 recipes on eqlwiki's own `Skill Tinkering` page share one station,
 * a Toolbox ("Combine ingredients in a Toolbox"). Toolbox already existed
 * in this graph as `item:toolbox` (a Blacksmithing-crafted good, migration
 * 386/387) -- a plain `item`, not a `container`, because nothing had yet
 * needed it as a crafting station. eqlwiki's own Toolbox page files it
 * under "Category:Tradeskill Containers" alongside Brew Barrel/Oven/Kiln,
 * so this migration retypes it in place to `container:toolbox` (same
 * portable-container shape as Mixing Bowl/Spit/Pot/Smoker: keeps its
 * item-like weight/capacity/containerSize fields and gains its own soldby
 * vendor table) rather than leaving a `container`-shaped hole. Its sole
 * existing edge (`recipe:toolbox --produces-->`) is repointed at the new id.
 *
 * One recipe (Mana Battery - Class Five, trivial 84) is referenced by name
 * on its own item page's "playercrafted" line but that page gives no
 * ingredient list at all -- modeled as a plain vendor-sold `item` with a
 * source note, not a fabricated recipe (decisions/tradeskill-recipe-node-
 * schema.md's "don't invent data" bar).
 *
 * Footwarming Boots (trivial 235), cross-referenced from Firewater's own
 * "recipes" list but absent from the main Tinkering Recipes table, is
 * deliberately excluded: eqlwiki tags its own ingredient chain "Small Fine
 * Plate Boots" page with `{{delete}} not relevant in EQ legends` -- an
 * explicit signal from the wiki itself that this branch doesn't belong in
 * EQL, not just an incomplete listing (decisions/eql-vs-classic-eq-zone-
 * connectivity.md's broader "verify against eqlwiki.com for EQL, not
 * classic EQ" principle applies the same way to items/recipes).
 *
 * Two recipes (Gnomish Vanishing Device trivial 302, and the excluded
 * Footwarming Boots) are separately tagged by eqlwiki "Made with gnome
 * cultural tinkering" and crafted in a "Deluxe Toolbox" -- but that name is
 * only ever a piped display label on a `[[Toolboxes]]` link (itself just a
 * pluralized alias for the same Toolbox page, confirmed by querying
 * "Toolboxes" directly and getting no page). No separate Deluxe Toolbox
 * item/page exists anywhere on eqlwiki, so Gnomish Vanishing Device is
 * still modeled with `crafted_in: container:toolbox` like every other
 * recipe here, same "don't invent a node for an undocumented distinction"
 * call Pottery's decision doc already established.
 *
 * Compass and Stalking Probe already existed as quest-reward items
 * (migrations predating this one); both are also directly craftable via
 * Tinkering per eqlwiki, so this migration reuses those nodes, updates
 * their `source` to note the Tinkering path, and adds their own soldby
 * vendor tables (neither had one before). Diamond already existed
 * (`item:diamond-ulthork`, added narrowly for one quest reward) but
 * eqlwiki's own Diamond page shows it's the single canonical gem --
 * drops from level 50+ mobs everywhere, feeds several quests, and is a
 * Jewelcrafting/Tinkering ingredient -- so its `source` is broadened here
 * rather than creating a second "Diamond" node for the same real item.
 * Shaped Ashwood Recurve Bow (Hemp), a Fletching product (issue #49, not
 * yet modeled), gets a plain `item` node with a prose `source` describing
 * how it's actually made, no recipe/vendor backing -- same cross-trade
 * handling Pottery's Deity Idols used for its own unmodeled-tradeskill
 * ingredients.
 *
 * Sourced from eqlwiki.com's raw wikitext via its MediaWiki API (batched
 * multi-title queries against `Skill Tinkering` and each ingredient/output
 * item's own page), not a summarizer. Every vendor eqlwiki lists is
 * included (no capped/representative subset, per issue #53's own ask,
 * matching Pottery/Blacksmithing precedent) -- skipping only rows in zones
 * not yet catalogued in this graph (Kael Drakkel, Felwithe, Southern
 * Plains of Karana), same "zone not catalogued" precedent migration 381
 * used.
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, addNode, addEdge, updateNode, slug, save } = loadGraph(import.meta.dir);

let recipesAdded = 0;
let itemsAdded = 0;
let vendorsAdded = 0;
let sellsEdgesAdded = 0;
const skippedVendors: string[] = [];

function addItem(id: string, label: string, opts: Record<string, unknown> = {}) {
  if (hasNode(id)) return;
  addNode({ id, label, type: "item", ...opts });
  itemsAdded++;
}

interface Ingredient {
  id: string;
  quantity?: number;
}

function addRecipe(
  id: string,
  label: string,
  trivial: number,
  uses: Ingredient[],
  produces: string,
  opts: Record<string, unknown> = {},
  produceQuantity?: number
) {
  addNode({ id, label, type: "recipe", tradeskill: "Tinkering", trivial, ...opts });
  recipesAdded++;
  for (const ing of uses) {
    addEdge(id, ing.id, "uses", ing.quantity && ing.quantity !== 1 ? { quantity: ing.quantity } : undefined);
  }
  addEdge(id, produces, "produces", produceQuantity && produceQuantity !== 1 ? { quantity: produceQuantity } : undefined);
  addEdge(id, "container:toolbox", "crafted_in");
}

function addVendor(vendorLabel: string, zoneLabel: string, sells: string[]) {
  const zoneId = `zone:${slug(zoneLabel)}`;
  if (!hasNode(zoneId)) {
    skippedVendors.push(`${vendorLabel} (${zoneLabel}) -- zone not catalogued in this graph`);
    return;
  }
  const vendorId = `npc:${slug(zoneLabel)}:${slug(vendorLabel)}`;
  if (!hasNode(vendorId)) {
    addNode({ id: vendorId, label: vendorLabel, type: "npc", roles: ["vendor"] });
    addEdge(vendorId, zoneId, "located_in");
    vendorsAdded++;
  }
  for (const itemId of sells) {
    addEdge(vendorId, itemId, "sells");
    sellsEdgesAdded++;
  }
}

// ---------------------------------------------------------------------
// Retype the existing Toolbox item into a `container` node -- it's
// Tinkering's crafting station, matching eqlwiki's own "Tradeskill
// Containers" category for it.
// ---------------------------------------------------------------------
{
  const toolbox = graph.nodes.find((n: { id: string }) => n.id === "item:toolbox");
  if (toolbox) {
    toolbox.id = "container:toolbox";
    toolbox.type = "container";
    for (const e of graph.edges) {
      if (e.source === "item:toolbox") e.source = "container:toolbox";
      if (e.target === "item:toolbox") e.target = "container:toolbox";
    }
  } else if (!hasNode("container:toolbox")) {
    addNode({ id: "container:toolbox", label: "Toolbox", type: "container", weight: 3, capacity: 8, containerSize: "Giant", classes: [] });
  }
}
addVendor("Rylin Coil", "Ak'Anon", ["container:toolbox"]);
addVendor("Tin Merchant V", "The Overthere", ["container:toolbox"]);
addVendor("Bom Knotwood", "Steamfont Mountains", ["container:toolbox"]);
addVendor("a mechanical merchant", "Steamfont Mountains", ["container:toolbox"]);
addVendor("Bendad the Trader", "Kael Drakkel", ["container:toolbox"]);
addVendor("Krak Windchaser", "Southern Plains of Karana", ["container:toolbox"]);

// ---------------------------------------------------------------------
// New ingredient items (no existing node) -- weight/size from eqlwiki's
// own item pages.
// ---------------------------------------------------------------------
addItem("item:cork", "Cork", { weight: 0.1, size: "Tiny" });
addItem("item:spriket", "Spriket", { weight: 0.1, size: "Tiny" });
addItem("item:metal-shaft", "Metal Shaft", { weight: 0.1, size: "Tiny" });
addItem("item:metal-rod", "Metal Rod", { weight: 0.1, size: "Tiny" });
addItem("item:gnomish-bolts", "Gnomish Bolts", { weight: 0.1, size: "Tiny" });
addItem("item:static-orb", "Static Orb", { weight: 0.1, size: "Small" });
addItem("item:gears", "Gears", { weight: 0.1, size: "Tiny" });
addItem("item:sprockets", "Sprockets", { weight: 0.1, size: "Tiny", source: "Dropped by a mechanic (Ak'Anon); also sold by several vendors" });
addItem("item:metal-twine", "Metal Twine", { weight: 0.1, size: "Tiny" });
addItem("item:grease", "Grease", { weight: 0.1, size: "Tiny" });
addItem("item:tattered-gnomish-cloak", "Tattered Gnomish Cloak", {
  slots: ["Chest"], ac: 2, weight: 0.7, size: "Medium", classes: [],
  source: "Dropped by several mobs in Solusek's Eye (fire goblin bartender, goblin drunkard, goblin high shaman, inferno goblin captain, Solusek goblin king, Flame Goblin Foreman)",
});
addItem("item:reflective-shard", "Reflective Shard", { weight: 0.1, size: "Tiny" });
addItem("item:steel-lined-gloves", "Steel Lined Gloves", { slots: ["Hands"], weight: 0.1, size: "Tiny" });
addItem("item:shaped-ashwood-recurve-bow-hemp", "Shaped Ashwood Recurve Bow (Hemp)", {
  slots: ["Range"], skill: "Archery", damage: 14, delay: 49, weight: 4, size: "Large",
  classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"],
  source: "Crafted via Fletching (trivial 148, not yet modeled in this graph) from Ashwood Bow Staff + Hemp Twine + Planing Tool",
});
addItem("item:fine-coral-mesh", "Fine Coral Mesh", { weight: 0.7, size: "Small" });
addItem("item:silk-lined-steel-helm", "Silk Lined Steel Helm", {
  slots: ["Head"], ac: 4, magic: true, weight: 0.2, size: "Small",
  classes: ["warrior", "cleric", "paladin", "rogue"],
});
addItem("item:lime-coated-meshing", "Lime Coated Meshing", { weight: 1.0, size: "Small" });
addItem("item:metal-fastening", "Metal Fastening", { weight: 5.0, size: "Small" });
addItem("item:platemail-helm", "Platemail Helm", {
  slots: ["Head"], ac: 10, weight: 6.0, size: "Small",
  classes: ["warrior", "cleric", "paladin", "shadow knight", "bard"],
});
addItem("item:sharkskin-tubing", "Sharkskin Tubing", { weight: 1.0, size: "Small" });
addItem("item:haze-panther-eye", "Haze Panther Eye", { weight: 0.2, size: "Tiny", source: "Dropped by a haze panther (The Wakening Land)" });
addItem("item:steel-wire", "Steel Wire", { weight: 1.0, size: "Tiny", noTrade: true });
addItem("item:mana-battery-class-five", "Mana Battery - Class Five", {
  magic: true, weight: 1.0, size: "Tiny",
  source: "Also craftable via Tinkering (trivial 84) -- eqlwiki's own item page names the tradeskill but gives no ingredient list",
});

// ---------------------------------------------------------------------
// Produced items (new).
// ---------------------------------------------------------------------
addItem("item:firewater", "Firewater", { weight: 0.1, size: "Small" });
addItem("item:animated-bait", "Animated Bait", { weight: 0.1, size: "Tiny" });
addItem("item:gnomish-firework", "Gnomish Firework", {
  magic: true, charges: 1,
  effect: "One of four random effects (Angry Bee, Blazing Comet, Ground Bloom Flower, Happy Panda; Any Slot, Casting Time: 1.5s)",
  weight: 0.1, size: "Small",
});
addItem("item:collapsible-fishing-pole", "Collapsible Fishing Pole", {
  slots: ["Primary"], effect: "Fishing Skill +5%", weight: 0.3, size: "Tiny",
});
addItem("item:mechanized-lockpicks", "Mechanized Lockpicks", {
  slots: ["Primary"], effect: "Pick Lock Skill +2%", weight: 0.1, size: "Tiny",
  classes: ["bard", "rogue"],
});
addItem("item:flameless-lantern", "Flameless Lantern", { slots: ["Secondary"], lightSource: true, weight: 0.2, size: "Small" });
addItem("item:standard-bow-cam", "Standard Bow Cam", { weight: 0.3, size: "Small", source: "Also used in several Fletching recipes (not yet modeled in this graph)" });
addItem("item:thermal-cloak", "Thermal Cloak", {
  slots: ["Back"], ac: 6, resists: { cold: 20 }, weight: 0.7, size: "Medium",
  classes: ["warrior", "cleric", "paladin", "shadow knight", "rogue", "necromancer", "wizard", "magician", "enchanter"],
});
addItem("item:spyglass", "Spyglass", { effect: "Telescope (Any Slot, Casting Time: Instant)", weight: 0.2, size: "Small" });
addItem("item:powered-gloves", "Powered Gloves", { slots: ["Hands"], stats: { str: 5 }, weight: 0.1, size: "Tiny" });
addItem("item:tinkered-catapult", "Tinkered Catapult", { slots: ["Secondary"], weight: 0.1, size: "Small" });
addItem("item:aqualung", "Aqualung", {
  slots: ["Head"], ac: 1, charges: 50, magic: true,
  effect: "Breath of the Dead (Any Slot, Casting Time: Instant)",
  weight: 10.0, size: "Giant",
});
addItem("item:rebreather", "Rebreather", {
  slots: ["Head"], ac: 1, effect: "Enduring Breath (Worn)", weight: 10.0, size: "Giant",
});
addItem("item:gnomish-vanishing-device", "Gnomish Vanishing Device", {
  slots: ["Secondary"], charges: 5, effect: "Invisibility Cloak (Any Slot/Can Equip, Casting Time: 5.0s)",
  weight: 0.8, size: "Small",
});

// ---------------------------------------------------------------------
// Reuse existing items, broaden their `source` to note Tinkering.
// ---------------------------------------------------------------------
updateNode("item:compass", { source: "Nillipuss the Brownie reward (Reebo Leafsway, Rivervale); also craftable via Tinkering (trivial 50); also sold by merchants across many zones" });
updateNode("item:stalking-probe", { source: "Bug Collection quest reward (Blixkin Entopop, Misty Thicket); also craftable via Tinkering (trivial 102)" });
updateNode("item:diamond-ulthork", { source: "Ulthork Tusks Quest reward (Chief Kalan, Cobalt Scar); also drops from level 50+ mobs across many zones; used in several quests, Jewelcrafting recipes, and Tinkering's Gnomish Vanishing Device (trivial 302)" });

// ---------------------------------------------------------------------
// Recipes -- eqlwiki's own "Tinkering Recipes" table order.
// ---------------------------------------------------------------------
addRecipe("recipe:firewater", "Firewater", 17,
  [{ id: "item:gnomish-spirits" }, { id: "item:water-flask" }], "item:firewater");

addRecipe("recipe:animated-bait", "Animated Bait", 26,
  [{ id: "item:cork" }, { id: "item:spriket" }], "item:animated-bait");

addRecipe("recipe:gnomish-firework", "Gnomish Firework", 21,
  [{ id: "item:metal-shaft" }, { id: "item:bat-wing" }, { id: "item:firewater" }], "item:gnomish-firework", {}, 4);

addRecipe("recipe:collapsible-fishing-pole", "Collapsible Fishing Pole", 31,
  [{ id: "item:metal-rod", quantity: 3 }, { id: "item:gnomish-bolts" }], "item:collapsible-fishing-pole");

addRecipe("recipe:compass", "Compass", 50,
  [{ id: "item:static-orb" }, { id: "item:water-flask" }, { id: "item:pie-tin" }, { id: "item:cork" }, { id: "item:skewers" }], "item:compass");

addRecipe("recipe:mechanized-lockpicks", "Mechanized Lockpicks", 62,
  [{ id: "item:gears" }, { id: "item:sprockets" }, { id: "item:lockpicks" }, { id: "item:rat-ears" }], "item:mechanized-lockpicks");

addRecipe("recipe:flameless-lantern-tinkering", "Flameless Lantern", 68,
  [{ id: "item:large-lantern" }, { id: "item:metal-twine" }, { id: "item:firewater" }], "item:flameless-lantern", { levelingGuide: true });

addRecipe("recipe:standard-bow-cam", "Standard Bow Cam", 75,
  [{ id: "item:gears" }, { id: "item:grease" }, { id: "item:gnomish-bolts" }], "item:standard-bow-cam");

addRecipe("recipe:thermal-cloak", "Thermal Cloak", 82,
  [{ id: "item:tattered-gnomish-cloak" }, { id: "item:metal-rod" }, { id: "item:firewater" }], "item:thermal-cloak");

addRecipe("recipe:spyglass", "Spyglass", 95,
  [{ id: "item:collapsible-fishing-pole" }, { id: "item:bottle" }, { id: "item:metal-twine" }, { id: "item:metal-rod" }, { id: "item:reflective-shard" }], "item:spyglass");

addRecipe("recipe:stalking-probe-tinkering", "Stalking Probe", 102,
  [{ id: "item:gears", quantity: 2 }, { id: "item:bottle" }, { id: "item:metal-rod" }, { id: "item:firewater" }], "item:stalking-probe", { levelingGuide: true });

addRecipe("recipe:powered-gloves", "Powered Gloves", 122,
  [{ id: "item:gears" }, { id: "item:firewater" }, { id: "item:metal-twine" }, { id: "item:sprockets" }, { id: "item:steel-lined-gloves" }], "item:powered-gloves", { levelingGuide: true });

addRecipe("recipe:tinkered-catapult", "Tinkered Catapult", 135,
  [{ id: "item:firewater" }, { id: "item:gears" }, { id: "item:metal-twine" }, { id: "item:shaped-ashwood-recurve-bow-hemp" }, { id: "item:sprockets" }], "item:tinkered-catapult");

addRecipe("recipe:aqualung", "Aqualung", 148,
  [{ id: "item:fine-coral-mesh" }, { id: "item:fresh-fish" }, { id: "item:gnomish-bolts" }, { id: "item:metal-rod" }, { id: "item:metal-twine" }, { id: "item:silk-lined-steel-helm" }], "item:aqualung", { levelingGuide: true });

addRecipe("recipe:rebreather", "Rebreather", 175,
  [{ id: "item:aqualung" }, { id: "item:firewater" }, { id: "item:lime-coated-meshing" }, { id: "item:metal-fastening" }, { id: "item:platemail-helm" }, { id: "item:sharkskin-tubing" }], "item:rebreather", { levelingGuide: true });

addRecipe("recipe:gnomish-vanishing-device", "Gnomish Vanishing Device", 302,
  [{ id: "item:diamond-ulthork" }, { id: "item:gnomish-bolts" }, { id: "item:haze-panther-eye" }, { id: "item:reflective-shard" }, { id: "item:small-lantern" }, { id: "item:steel-wire" }, { id: "item:mana-battery-class-five" }], "item:gnomish-vanishing-device");

// ---------------------------------------------------------------------
// Vendors -- each ingredient/output item's own soldby table, in full.
// ---------------------------------------------------------------------
addVendor("Tin Merchant V", "The Overthere", ["item:cork", "item:spriket", "item:metal-shaft", "item:metal-rod", "item:gnomish-bolts", "item:static-orb", "item:gears", "item:sprockets", "item:metal-twine", "item:grease", "item:reflective-shard", "item:steel-lined-gloves", "item:fine-coral-mesh", "item:silk-lined-steel-helm", "item:lime-coated-meshing", "item:metal-fastening", "item:sharkskin-tubing"]);
addVendor("Bom Knotwood", "Steamfont Mountains", ["item:cork", "item:spriket", "item:metal-shaft", "item:metal-rod", "item:gnomish-bolts", "item:static-orb", "item:gears", "item:sprockets", "item:metal-twine", "item:grease", "item:reflective-shard", "item:steel-lined-gloves", "item:fine-coral-mesh", "item:silk-lined-steel-helm", "item:lime-coated-meshing", "item:metal-fastening", "item:sharkskin-tubing"]);
addVendor("a mechanical merchant", "Steamfont Mountains", ["item:metal-rod", "item:grease"]);
addVendor("Rylin Coil", "Ak'Anon", ["item:static-orb", "item:gears", "item:grease", "item:steel-lined-gloves", "item:lime-coated-meshing", "item:metal-fastening", "item:sharkskin-tubing", "item:steel-wire"]);
addVendor("Leala Swiftarrow", "Firiona Vie", ["item:spriket", "item:metal-shaft", "item:static-orb", "item:gears", "item:reflective-shard", "item:steel-lined-gloves", "item:fine-coral-mesh", "item:metal-fastening", "item:sharkskin-tubing", "item:platemail-helm"]);
addVendor("Bendad the Trader", "Kael Drakkel", ["item:spriket", "item:metal-shaft", "item:metal-rod", "item:static-orb", "item:gears", "item:reflective-shard", "item:steel-lined-gloves", "item:fine-coral-mesh", "item:metal-fastening", "item:sharkskin-tubing"]);
addVendor("Adinel Jailbar", "Iceclad Ocean", ["item:steel-wire", "item:mana-battery-class-five"]);
addVendor("Godbin Strumharp", "Steamfont Mountains", ["item:steel-wire"]);
addVendor("Key Master", "Plane of Sky", ["item:mana-battery-class-five"]);

// Platemail Helm's own vendor table.
addVendor("Jagen Kindlor", "Erudin", ["item:platemail-helm"]);
addVendor("Merchant Irontree", "Felwithe", ["item:platemail-helm"]);
addVendor("Gearin Gaxx", "Firiona Vie", ["item:platemail-helm"]);
addVendor("Ikthar Fireheart", "East Freeport", ["item:platemail-helm"]);
addVendor("Merchant Tananie", "Greater Faydark", ["item:platemail-helm"]);
addVendor("Merchant Tegdian", "Greater Faydark", ["item:platemail-helm"]);
addVendor("Faratain", "Paineel", ["item:platemail-helm"]);
addVendor("Meera Lylon", "South Qeynos", ["item:platemail-helm"]);
addVendor("Lanhern Firepride", "South Qeynos", ["item:platemail-helm"]);
addVendor("Zok Kilikko", "Rathe Mountains", ["item:platemail-helm"]);

// Compass's own vendor table (also directly purchasable, not just crafted).
addVendor("Rylin Coil", "Ak'Anon", ["item:compass"]);
addVendor("Bubar", "East Commonlands", ["item:compass"]);
addVendor("Elsbyth", "Kithicor Forest", ["item:compass"]);
addVendor("Dreana", "Lake Rathetear", ["item:compass"]);
addVendor("Jenah Wheelspinner", "Lavastorm Mountains", ["item:compass"]);
addVendor("Romella", "Northern Karana", ["item:compass"]);
addVendor("Murissa Sandwhisper", "Northern Desert of Ro", ["item:compass"]);
addVendor("Isslana", "Oasis of Marr", ["item:compass"]);
addVendor("Ghul Rustem", "South Qeynos", ["item:compass"]);
addVendor("Viira Bali", "Rathe Mountains", ["item:compass"]);
addVendor("Susanna", "Rathe Mountains", ["item:compass"]);
addVendor("Chandra Kali", "Rathe Mountains", ["item:compass"]);

// Standard Bow Cam's own vendor table (also directly purchasable).
addVendor("Klok Gogon", "East Cabilis", ["item:standard-bow-cam"]);
addVendor("Fugla", "The Feerrott", ["item:standard-bow-cam"]);
addVendor("Jessica Winter", "Firiona Vie", ["item:standard-bow-cam"]);
addVendor("Timor Strongbranch", "North Freeport", ["item:standard-bow-cam"]);
addVendor("Merchant Sylnis", "Greater Faydark", ["item:standard-bow-cam"]);
addVendor("Dianax C`Luzz", "Neriak Commons", ["item:standard-bow-cam"]);
addVendor("Tonsia", "Surefall Glade", ["item:standard-bow-cam"]);
addVendor("Gerb Jinklebelly", "Rivervale", ["item:standard-bow-cam"]);
addVendor("Argash", "Thurgadin", ["item:standard-bow-cam"]);

save();
console.log(`Migration 412 complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s), ${vendorsAdded} new vendor npc(s), ${sellsEdgesAdded} sells edge(s) added for Tinkering`);
if (skippedVendors.length) {
  console.log(`Skipped ${skippedVendors.length} vendor row(s) (zone not catalogued):`);
  for (const s of skippedVendors) console.log(`  - ${s}`);
}
