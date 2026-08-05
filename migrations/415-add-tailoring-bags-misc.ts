/**
 * Migration 415 (issue #52, batch 3/N): `Skill Tailoring`'s own "Bags and
 * Miscellaneous" section -- 7 bags (+ Fleeting Quiver, itself a container)
 * and ~11 misc combines (silk processing chain, the pelt/skin quality-
 * reduction chain, Leather Padding, Tailor-made Whip).
 *
 * **Crafting station picked per recipe, not modeled as "any of 4."** Most
 * of these items' own eqlwiki pages just say "In Sewing Kit" or "In Loom
 * or Large Sewing Kit" -- the game accepts any container from the
 * "Getting Started" list (migration 413) for these low/mid-tier combines,
 * but `crafted_in` is one edge per recipe (decisions/tradeskill-recipe-
 * node-schema.md). The item's own first-listed station is used as the
 * representative: `container:small-sewing-kit` for recipes whose page says
 * generic "Sewing Kit", `container:loom` for "Loom" or "Loom or Large
 * Sewing Kit".
 *
 * **Leather Padding is a 3-way variant family** (decisions/tradeskill-
 * recipe-node-schema.md's "Recipe variants" section) -- same output item,
 * same trivial (31), same Silk Thread half of the combine, but the pelt
 * half swaps between Low Quality Cat Pelt / Low Quality Wolf Skin / Low
 * Quality Bear Skin depending on eqlwiki's own three separately-listed
 * combines on Leather Padding's own item page. Cat is the anchor
 * (first-listed).
 *
 * **The pelt/skin quality-reduction chain** (Ruined <- Low <- Medium <-
 * High, for Wolf/Cat/Bear) all use a shared Skinning Knife ingredient that
 * eqlwiki explicitly marks "Returned on Failure, Returned on Success" --
 * never actually consumed, unlike every other `uses` ingredient modeled so
 * far. Still modeled as a plain `uses` edge: the schema's own definition
 * ("what this recipe needs") never promised consumption, and the
 * Container-column precedent already established that a `uses` edge
 * doesn't imply the ingredient survives or not either way -- no new edge
 * type introduced for this distinction. `item:skinning-knife` and
 * `item:heady-kiola` are reused from their own pre-existing Blacksmithing/
 * Brewing recipes; `item:aviak-egg-oil` and `item:vial-of-clear-mana`
 * (unused here but confirmed) are likewise pre-existing reuses.
 *
 * Hand Made Backpack is one of the Leveling Guide's own rows (as "Hand
 * Made Backpack", trivial 88) -- flagged `levelingGuide: true` here rather
 * than in migration 414, since this is the batch that actually creates its
 * recipe node. Tailored Quiver (115) and Fleeting Quiver (222) are also
 * Leveling Guide rows, flagged the same way.
 *
 * Sourced from eqlwiki.com's raw wikitext via its MediaWiki API (batched
 * multi-title queries against the Bags/Miscellaneous section's own items
 * and their individual item pages), not a summarizer. Ingredient items
 * with no `soldby` table (every raw pelt/skin/silk -- forage/drop only per
 * the wiki) get no `sells` edge; that absence is itself the real fact.
 * Patterns (Backpack, Fleeting Quiver, Quiver, Whip) do have full vendor
 * tables, included in full per issue #52's own ask.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

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
  craftedIn: string,
  opts: Record<string, unknown> = {}
) {
  addNode({ id, label, type: "recipe", tradeskill: "Tailoring", trivial, ...opts });
  recipesAdded++;
  for (const ing of uses) {
    addEdge(id, ing.id, "uses", ing.quantity && ing.quantity !== 1 ? { quantity: ing.quantity } : undefined);
  }
  addEdge(id, produces, "produces");
  addEdge(id, craftedIn, "crafted_in");
}

const ZONE_ALIASES: Record<string, string> = {
  "Neriak Third Gate": "Neriak 3rd Gate",
  "Eastern Plains of Karana": "Eastern Karana",
  "Western Plains of Karana": "Western Karana",
  "Northern Plains of Karana": "Northern Karana",
  "Southern Plains of Karana": "Southern Karana",
};

function addVendor(vendorLabel: string, zoneLabelRaw: string, sells: string[]) {
  const zoneLabel = ZONE_ALIASES[zoneLabelRaw] || zoneLabelRaw;
  const zoneId = `zone:${slug(zoneLabel)}`;
  if (!hasNode(zoneId)) {
    skippedVendors.push(`${vendorLabel} (${zoneLabelRaw}) -- zone not catalogued in this graph`);
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
// Raw silk / thread chain.
// ---------------------------------------------------------------------
addItem("item:spider-silk", "Spider Silk", { weight: 0.1, size: "Small", source: "Dropped by adult spiders/drachnids across many zones; foraged in Mistmoore Castle, Erud's Crossing, Everfrost Peaks, Field of Bone, Nektulos Forest, Southern Desert of Ro, Steamfont Mountains" });
addItem("item:spiderling-silk", "Spiderling Silk", { weight: 0.1, size: "Small", source: "Dropped by spiderlings across many zones; foraged in Commonlands, Steamfont Mountains, Western Plains of Karana" });
addItem("item:silk-thread", "Silk Thread", { weight: 0.1, size: "Small" });
addItem("item:silk-swatch", "Silk Swatch", { weight: 0.1, size: "Small", source: "Made from Spider Silk, not Spiderling Silk -- also used across Raw Silk/Cured Silk/Wu's Fighting Armor and several quest items" });
addItem("item:silk-cord", "Silk Cord", { weight: 0.1, size: "Small" });
addItem("item:silk-bandage", "Silk Bandage", { weight: 0.2, size: "Small", source: "Lighter than store-bought Bandages" });

addRecipe("recipe:silk-thread", "Silk Thread", 15, [{ id: "item:spiderling-silk", quantity: 2 }], "item:silk-thread", "container:small-sewing-kit");
addRecipe("recipe:silk-swatch", "Silk Swatch", 15, [{ id: "item:spider-silk", quantity: 2 }], "item:silk-swatch", "container:small-sewing-kit", { levelingGuide: true });
addRecipe("recipe:silk-cord", "Silk Cord", 26, [{ id: "item:silk-thread", quantity: 3 }], "item:silk-cord", "container:loom");
addRecipe("recipe:silk-bandage", "Silk Bandage", 21, [{ id: "item:silk-thread", quantity: 2 }], "item:silk-bandage", "container:loom");

// ---------------------------------------------------------------------
// Pelt/skin quality-reduction chain (Skinning Knife, returned not
// consumed -- still a plain `uses` edge, see docblock).
// ---------------------------------------------------------------------
addItem("item:high-quality-wolf-skin", "High Quality Wolf Skin", { weight: 3.5, size: "Large", source: "Dropped by wolves across many zones" });
addItem("item:medium-quality-wolf-skin", "Medium Quality Wolf Skin", { weight: 3.5, size: "Large" });
addItem("item:low-quality-wolf-skin", "Low Quality Wolf Skin", { weight: 3.5, size: "Large" });
addItem("item:ruined-wolf-pelt", "Ruined Wolf Pelt", { weight: 3.5, size: "Large" });
addItem("item:high-quality-cat-pelt", "High Quality Cat Pelt", { weight: 3.5, size: "Large", source: "Dropped by cats across many zones" });
addItem("item:medium-quality-cat-pelt", "Medium Quality Cat Pelt", { weight: 3.5, size: "Large" });
addItem("item:low-quality-cat-pelt", "Low Quality Cat Pelt", { weight: 3.5, size: "Large" });
addItem("item:ruined-cat-pelt", "Ruined Cat Pelt", { weight: 3.5, size: "Large" });
addItem("item:high-quality-bear-skin", "High Quality Bear Skin", { weight: 4.0, size: "Large", source: "Dropped by bears across many zones" });
addItem("item:medium-quality-bear-skin", "Medium Quality Bear Skin", { weight: 4.0, size: "Large" });
addItem("item:low-quality-bear-skin", "Low Quality Bear Skin", { weight: 4.0, size: "Large" });
addItem("item:ruined-bear-pelt", "Ruined Bear Pelt", { weight: 3.5, size: "Large" });

addRecipe("recipe:medium-quality-wolf-skin", "Medium Quality Wolf Skin", 15, [{ id: "item:high-quality-wolf-skin" }, { id: "item:skinning-knife" }], "item:medium-quality-wolf-skin", "container:small-sewing-kit");
addRecipe("recipe:low-quality-wolf-skin", "Low Quality Wolf Skin", 15, [{ id: "item:medium-quality-wolf-skin" }, { id: "item:skinning-knife" }], "item:low-quality-wolf-skin", "container:small-sewing-kit");
addRecipe("recipe:ruined-wolf-pelt", "Ruined Wolf Pelt", 15, [{ id: "item:low-quality-wolf-skin" }, { id: "item:skinning-knife" }], "item:ruined-wolf-pelt", "container:small-sewing-kit");
addRecipe("recipe:medium-quality-cat-pelt", "Medium Quality Cat Pelt", 15, [{ id: "item:high-quality-cat-pelt" }, { id: "item:skinning-knife" }], "item:medium-quality-cat-pelt", "container:small-sewing-kit");
addRecipe("recipe:low-quality-cat-pelt", "Low Quality Cat Pelt", 15, [{ id: "item:medium-quality-cat-pelt" }, { id: "item:skinning-knife" }], "item:low-quality-cat-pelt", "container:small-sewing-kit");
addRecipe("recipe:ruined-cat-pelt", "Ruined Cat Pelt", 15, [{ id: "item:low-quality-cat-pelt" }, { id: "item:skinning-knife" }], "item:ruined-cat-pelt", "container:small-sewing-kit");
addRecipe("recipe:medium-quality-bear-skin", "Medium Quality Bear Skin", 15, [{ id: "item:high-quality-bear-skin" }, { id: "item:skinning-knife" }], "item:medium-quality-bear-skin", "container:small-sewing-kit");
addRecipe("recipe:low-quality-bear-skin", "Low Quality Bear Skin", 15, [{ id: "item:medium-quality-bear-skin" }, { id: "item:skinning-knife" }], "item:low-quality-bear-skin", "container:small-sewing-kit");
addRecipe("recipe:ruined-bear-pelt", "Ruined Bear Pelt", 15, [{ id: "item:low-quality-bear-skin" }, { id: "item:skinning-knife" }], "item:ruined-bear-pelt", "container:small-sewing-kit");

// ---------------------------------------------------------------------
// Leather Padding -- 3-way variant family (same output, swappable pelt).
// ---------------------------------------------------------------------
addItem("item:leather-padding", "Leather Padding", { weight: 0.1, size: "Small" });
addRecipe("recipe:leather-padding-cat", "Leather Padding (Cat)", 31, [{ id: "item:low-quality-cat-pelt" }, { id: "item:silk-thread" }], "item:leather-padding", "container:small-sewing-kit");
addRecipe("recipe:leather-padding-wolf", "Leather Padding (Wolf)", 31, [{ id: "item:low-quality-wolf-skin" }, { id: "item:silk-thread" }], "item:leather-padding", "container:small-sewing-kit");
addRecipe("recipe:leather-padding-bear", "Leather Padding (Bear)", 31, [{ id: "item:low-quality-bear-skin" }, { id: "item:silk-thread" }], "item:leather-padding", "container:small-sewing-kit");
addEdge("recipe:leather-padding-wolf", "recipe:leather-padding-cat", "variant_of");
addEdge("recipe:leather-padding-bear", "recipe:leather-padding-cat", "variant_of");

// ---------------------------------------------------------------------
// Tailor-made Whip.
// ---------------------------------------------------------------------
addItem("item:whip-pattern", "Whip Pattern", { weight: 0.1, size: "Small" });
addItem("item:tailor-made-whip", "Tailor-made Whip", {
  slots: ["Primary", "Secondary"], skill: "1H Slashing", damage: 7, delay: 33, weight: 6.0, size: "Medium",
  classes: ["warrior", "paladin", "ranger", "shadow knight", "bard", "rogue"],
});
addRecipe("recipe:tailor-made-whip", "Tailor-made Whip", 36,
  [{ id: "item:heady-kiola", quantity: 4 }, { id: "item:medium-quality-cat-pelt" }, { id: "item:whip-pattern" }], "item:tailor-made-whip", "container:loom");

// ---------------------------------------------------------------------
// Crystalline Silk swatch/fiber (Velious).
// ---------------------------------------------------------------------
addItem("item:crystalline-silk-thread", "Crystalline Silk Thread", { weight: 0.1, size: "Tiny", magic: true, noTrade: true, source: "Dropped in Velketor's Labyrinth; not stackable" });
addItem("item:crystalline-silk-swatch", "Crystalline Silk Swatch", { weight: 0.1, size: "Small" });
addItem("item:crystalline-silk-fiber", "Crystalline Silk Fiber", { weight: 0.1, size: "Small", magic: true, noTrade: true });
addRecipe("recipe:crystalline-silk-swatch", "Crystalline Silk Swatch", 15, [{ id: "item:crystalline-silk", quantity: 2 }], "item:crystalline-silk-swatch", "container:small-sewing-kit");
addRecipe("recipe:crystalline-silk-fiber", "Crystalline Silk Fiber", 51, [{ id: "item:crystalline-silk-thread", quantity: 5 }], "item:crystalline-silk-fiber", "container:loom");

// ---------------------------------------------------------------------
// Bags and quivers.
// ---------------------------------------------------------------------
addItem("item:thick-grizzly-bear-skin", "Thick Grizzly Bear Skin", { weight: 5.0, size: "Large", source: "Dropped by bears in Blackburrow, Commonlands, Misty Thicket, Rathe Mountains, Nektulos Forest, Northern Karana, Qeynos Hills, The Feerrott" });
addItem("item:high-quality-lion-skin", "High Quality Lion Skin", { weight: 3.5, size: "Large", source: "Dropped by a highland lion (Northern Karana)" });
addItem("item:vial-of-distilled-mana", "Vial of Distilled Mana", {
  slots: ["Primary", "Secondary"], magic: true, weight: 0.1, size: "Tiny",
  source: "Created via the level 39 Enchanter spell Distill Mana, consuming 2 sapphires and a poison vial -- not a tradeskill combine",
});
addItem("item:backpack-pattern", "Backpack Pattern", { weight: 0.1, size: "Tiny" });
addItem("item:quiver-pattern", "Quiver Pattern", { weight: 0.1, size: "Tiny" });
addItem("item:fleeting-quiver-pattern", "Fleeting Quiver Pattern", { weight: 0.1, size: "Tiny" });
addItem("item:griffon-feathers", "Griffon Feathers", { weight: 0.1, size: "Small", source: "Dropped by griffins/griffons in West/East Commonlands, Northern Karana" });

addItem("item:tailored-wrist-pouch", "Tailored Wrist Pouch", { weight: 0.3, capacity: 4, containerSize: "Tiny" });
addItem("item:tailored-small-bag", "Tailored Small Bag", { weight: 0.4, capacity: 4, containerSize: "Medium" });
addItem("item:tailored-large-belt-pouch", "Tailored Large Belt Pouch", { weight: 0.6, capacity: 6, containerSize: "Medium" });
addItem("item:tailored-large-bag", "Tailored Large Bag", { weight: 0.8, capacity: 6, containerSize: "Large" });
addItem("item:reinforced-medicine-bag", "Reinforced Medicine Bag", { weight: 2.5, capacity: 10, containerSize: "Giant" });
addItem("item:hand-made-backpack", "Hand Made Backpack", { weight: 3.0, capacity: 10, containerSize: "Large", source: "Cheap and often available in East Commonlands" });
addItem("item:tailored-quiver", "Tailored Quiver", { weight: 0.4, capacity: 6, containerSize: "Medium", source: "Provides 7.3% bow haste" });
addItem("item:fleeting-quiver", "Fleeting Quiver", { weight: 0.4, capacity: 6, containerSize: "Medium", source: "Velious-added; provides 20% bow haste" });

addRecipe("recipe:tailored-wrist-pouch", "Tailored Wrist Pouch", 26, [{ id: "item:ruined-wolf-pelt" }, { id: "item:silk-cord" }], "item:tailored-wrist-pouch", "container:loom");
addRecipe("recipe:tailored-small-bag", "Tailored Small Bag", 31, [{ id: "item:low-quality-wolf-skin" }, { id: "item:silk-cord" }], "item:tailored-small-bag", "container:loom");
addRecipe("recipe:tailored-large-belt-pouch", "Tailored Large Belt Pouch", 36, [{ id: "item:low-quality-cat-pelt" }, { id: "item:silk-cord" }], "item:tailored-large-belt-pouch", "container:loom");
addRecipe("recipe:tailored-large-bag", "Tailored Large Bag", 41, [{ id: "item:low-quality-bear-skin" }, { id: "item:silk-cord" }], "item:tailored-large-bag", "container:loom");
addRecipe("recipe:reinforced-medicine-bag", "Reinforced Medicine Bag", 68, [{ id: "item:thick-grizzly-bear-skin" }, { id: "item:silk-cord" }], "item:reinforced-medicine-bag", "container:loom");
addRecipe("recipe:hand-made-backpack", "Hand Made Backpack", 88, [{ id: "item:backpack-pattern" }, { id: "item:high-quality-bear-skin" }], "item:hand-made-backpack", "container:loom", { levelingGuide: true });
addRecipe("recipe:tailored-quiver", "Tailored Quiver", 115, [{ id: "item:high-quality-cat-pelt" }, { id: "item:quiver-pattern" }], "item:tailored-quiver", "container:loom", { levelingGuide: true });
addRecipe("recipe:fleeting-quiver", "Fleeting Quiver", 222,
  [{ id: "item:aviak-egg-oil" }, { id: "item:fleeting-quiver-pattern" }, { id: "item:griffon-feathers" }, { id: "item:high-quality-lion-skin" }, { id: "item:vial-of-distilled-mana" }],
  "item:fleeting-quiver", "container:loom", { levelingGuide: true });

// ---------------------------------------------------------------------
// Vendors -- pattern items' own soldby tables, in full.
// ---------------------------------------------------------------------
const PATTERN_VENDOR_ZONES: Array<[string, string]> = [
  ["a clockwork tailor", "Ak'Anon"],
  ["Alga Bruntbuckler", "Butcherblock Mountains"],
  ["Klok Stitch", "East Cabilis"],
  ["Gayle Weaven", "Erudin"],
  ["Seria O`Danos", "Everfrost Peaks"],
  ["Murga", "The Feerrott"],
  ["Dionin Needlespin", "Firiona Vie"],
  ["Winsa Tanner", "East Freeport"],
  ["Merchant Gaeadin", "Greater Faydark"],
  ["Dyona Rossook", "Highpass Hold"],
  ["Tipa Lighten", "Misty Thicket"],
  ["Freed Fimplefur", "Steamfont Mountains"],
  ["Rexx Frostweaver", "Thurgadin"],
];
for (const [vendor, zone] of PATTERN_VENDOR_ZONES) addVendor(vendor, zone, ["item:backpack-pattern", "item:whip-pattern"]);
addVendor("Innkeep Tozie", "Northern Desert of Ro", ["item:backpack-pattern"]);
addVendor("Gretamog", "Oggok", ["item:backpack-pattern", "item:quiver-pattern", "item:whip-pattern"]);
addVendor("Tin Merchant IX", "The Overthere", ["item:backpack-pattern", "item:quiver-pattern"]);
addVendor("Alysa", "Western Plains of Karana", ["item:backpack-pattern", "item:quiver-pattern", "item:whip-pattern"]);
addVendor("Iala Lenard", "South Qeynos", ["item:backpack-pattern", "item:quiver-pattern"]);
addVendor("Garren D`Vek", "Neriak Commons", ["item:backpack-pattern", "item:quiver-pattern", "item:whip-pattern"]);
addVendor("Hutyn L`Lozz", "Neriak Third Gate", ["item:backpack-pattern", "item:quiver-pattern", "item:whip-pattern"]);
addVendor("Spoolie Gee", "Northern Desert of Ro", ["item:whip-pattern"]);
addVendor("Cleet Miller", "Western Plains of Karana", ["item:quiver-pattern", "item:whip-pattern"]);
addVendor("Klok Stitch", "East Cabilis", ["item:fleeting-quiver-pattern"]);
addVendor("Dyona Rossook", "Highpass Hold", ["item:fleeting-quiver-pattern"]);
addVendor("Tipa Lighten", "Misty Thicket", ["item:fleeting-quiver-pattern"]);
addVendor("Tin Merchant IX", "The Overthere", ["item:fleeting-quiver-pattern"]);
addVendor("Zok Gleeup", "Rathe Mountains", ["item:fleeting-quiver-pattern"]);
addVendor("Zok Lubump", "Rathe Mountains", ["item:fleeting-quiver-pattern"]);

save();
console.log(`Migration 415 complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s), ${vendorsAdded} new vendor npc(s), ${sellsEdgesAdded} sells edge(s) added for Tailoring bags/misc`);
if (skippedVendors.length) {
  console.log(`Skipped ${skippedVendors.length} vendor row(s) (zone not catalogued):`);
  for (const s of skippedVendors) console.log(`  - ${s}`);
}
