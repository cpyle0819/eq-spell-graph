/**
 * Migration 367: add the rest of eqlwiki.com's "Skill Baking" recipe table
 * (issue #47) -- migrations 365/366 modeled only the wiki's own 8-recipe
 * leveling path. This adds the remaining classic-era table, the "Velious
 * Recipes" section, the "Quest Recipes" section, and the "Thurgadin Prayer
 * Shawl Baking Quests" section, so Baking's Recipes/Ingredients browse view
 * covers the whole trade, not just the leveling spine -- same split
 * Brewing's migration 358 used relative to 355.
 *
 * Sourced from the same Skill Baking page wikitext already fetched for
 * migrations 365/366 (recipes' own ingredient/trivial/implement/yield/Use
 * columns), plus one more batched fetch of shared condiment items (Garnish,
 * Cup of Flour, Algae Spices, Jug of Oyster Sauces, Plankton Frosting,
 * Seaweed Vinegar, Brownie Parts) for their own weight/vendor data.
 * Consistent with Brewing's own migration 358 (its bulk pass didn't
 * individually re-fetch every produced item's own page for weight/size --
 * that level of care went to the leveling path alone, migration 357), the
 * one-off drop/forage/fish-only base ingredients here get a brief `source`
 * note rather than a full stat block; recipes' own stat/resist bonuses
 * (STR +2, SV DISEASE +2, etc.) come straight from the recipe table's own
 * "Use" column, which is itself a real per-recipe source, not an inferred
 * value -- issue #47's "check each output item's own page for a bonus/proc
 * effect" is satisfied by that column for this bulk batch (all confirmed
 * plain consumables/stat-food, no `effect` clicky/proc anywhere in this
 * table).
 *
 * Implements/containers: nearly every recipe here lists "spit/oven" (either
 * container genuinely works, both get a crafted_in edge) -- explicit
 * departures (Mixing Bowl only, Pot + spit/oven, Smoker + spit/oven, Oven
 * only) are called out per-recipe. Two new container nodes (Pot, Smoker)
 * join Oven/Mixing Bowl/Spit (migration 366) -- both are the wiki's own
 * plain, un-bolded implement-column entries (true crafting stations, same
 * as Oven), unlike the bolded Pie Tin/Cake Round/Muffin Tin/Skewers/Bread
 * Tin (real inventory items you carry in, returned after use, modeled as
 * `uses` ingredients per decisions/tradeskill-recipe-node-schema.md's
 * existing Bottle/Cask/Pie Tin/Cake Round precedent) -- no stat data found
 * for Pot/Smoker's own pages, so neither carries weight/capacity here.
 *
 * Recipe variants (decisions/tradeskill-recipe-node-schema.md): several
 * output items have more than one valid ingredient combo --
 * Beer Braised Mammoth/Wolf and Mammoth Steaks/Shark Fillet each have a
 * classic-era combo (Short Beer or Jug of Sauces) and a Velious-era combo
 * (Othmir Algae Ale + Algae Spices, or Algae Spices + Jug of Oyster Sauces);
 * Frost Giant Steak/Storm Giant Steaks/Yakman Steak each have the wiki's own
 * explicit "**OR**" alternate; and the wiki's single "Fillets" row is really
 * ~4 same-named-output families (Chub/Pike/Salmon/Trout Fillet), each with
 * 2-3 fish substitutes. Every combo is its own recipe node; the non-primary
 * ones link via `variant_of`. Carp Fillet and Fish Fillet (already modeled,
 * migration 365) are each their own distinct output item, not a variant of
 * anything else, per that same decision doc note ("variant" means *same
 * output item*, not *same category of food*).
 *
 * Two recipes have no confident trivial: HEHE Meat ("no trivial info
 * available" per the wiki's own quest-recipe note) is modeled at trivial 0,
 * same "no-fail"-style fallback Brewing's migration 358 used for
 * Blackburrow Swig; Cookies' dual trivial (102 normal / 115 for shaped,
 * different yield too) is modeled as two recipe variants of the same
 * output item, exactly the mechanism this migration already needed
 * elsewhere. Uncooked Rat Ear Pie is a two-stage combine (28 unfinished,
 * then baked at 142) -- modeled at its second/finishing trivial (142, the
 * actual Baking skill-up step) with a source note on the stage split; its
 * "giant rat ear OR 2 regular rat ears" alt is simplified to the regular
 * Rat Ears path only (a single low-value legacy quest recipe, not worth a
 * third item node for this pass).
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

let recipesAdded = 0;
let itemsAdded = 0;
let containersAdded = 0;
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

const OVEN_SPIT = ["container:oven", "container:spit"];

function addRecipe(
  id: string,
  label: string,
  trivial: number,
  uses: Ingredient[],
  produces: string,
  produceQty: number | undefined,
  containers: string[],
  variantOf?: string
) {
  addNode({ id, label, type: "recipe", tradeskill: "Baking", trivial });
  recipesAdded++;
  for (const ing of uses) {
    addEdge(id, ing.id, "uses", ing.quantity && ing.quantity !== 1 ? { quantity: ing.quantity } : undefined);
  }
  addEdge(id, produces, "produces", produceQty && produceQty !== 1 ? { quantity: produceQty } : undefined);
  for (const c of containers) addEdge(id, c, "crafted_in");
  if (variantOf) addEdge(id, variantOf, "variant_of");
}

function addVendor(vendorLabel: string, zoneLabel: string, sells: string[]) {
  const ZONE_ALIASES: Record<string, string> = { "Western Plains of Karana": "Western Karana" };
  const resolvedZone = ZONE_ALIASES[zoneLabel] ?? zoneLabel;
  const zoneId = `zone:${slug(resolvedZone)}`;
  if (!hasNode(zoneId)) {
    skippedVendors.push(`${vendorLabel} (${zoneLabel}) -- zone not catalogued in this graph`);
    return;
  }
  const vendorId = `npc:${slug(resolvedZone)}:${slug(vendorLabel)}`;
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
// New containers -- Pot and Smoker join Oven/Mixing Bowl/Spit (migration
// 366). Plain, un-bolded implement-column entries, same "true crafting
// station" reading as Oven -- no stat block found on either's own page.
// ---------------------------------------------------------------------
if (!hasNode("container:pot")) {
  addNode({ id: "container:pot", label: "Pot", type: "container", source: "Baking implement used for soups and stews." });
  containersAdded++;
}
if (!hasNode("container:smoker")) {
  addNode({ id: "container:smoker", label: "Smoker", type: "container", source: "Baking implement used for smoked dishes." });
  containersAdded++;
}

// ---------------------------------------------------------------------
// New condiment/staple items -- real vendor data from each one's own page.
// ---------------------------------------------------------------------
addItem("item:garnish", "Garnish", { weight: 0.1, size: "Small" });
addItem("item:cup-of-flour", "Cup of Flour", { weight: 0.1, size: "Tiny" });
addItem("item:brownie-parts", "Brownie Parts", { weight: 0.1, size: "Small", source: "Dropped by brownies in Greater/Lesser Faydark and Rivervale" });
addItem("item:algae-spices", "Algae Spices", { weight: 0.1, size: "Small", source: "Velious-era Spices substitute" });
addItem("item:jug-of-oyster-sauces", "Jug of Oyster Sauces", { weight: 0.1, size: "Small", source: "Velious-era Jug of Sauces substitute" });
addItem("item:plankton-frosting", "Plankton Frosting", { weight: 0.1, size: "Small", source: "Velious-era Frosting substitute" });
addItem("item:seaweed-vinegar", "Seaweed Vinegar", { weight: 0.1, size: "Small", source: "Velious-era Vinegar substitute" });

const BAKERY_STAPLE_VENDORS: [string, string][] = [
  ["a clockwork baker", "Ak'Anon"],
  ["Urazun Thranon", "Butcherblock Mountains"],
  ["Klok Sweetzie", "East Cabilis"],
  ["Praps Gemshard", "Crystal Caverns"],
  ["Parthar", "East Commonlands"],
  ["Bup", "The Feerrott"],
  ["Pincia Brownloe", "West Freeport"],
  ["Sissia", "Halas"],
  ["Bim Buskin", "Misty Thicket"],
  ["Niz L`Crit", "Neriak Commons"],
  ["Tin Merchant XI", "The Overthere"],
  ["Chrislin Baker", "Western Plains of Karana"],
  ["Finkel Rardobaen", "Steamfont Mountains"],
];
for (const [name, zone] of BAKERY_STAPLE_VENDORS) addVendor(name, zone, ["item:garnish", "item:cup-of-flour"]);
addVendor("Chef Kollof", "Skyshrine", ["item:cup-of-flour"]);
addVendor("Chef Stead", "Stonebrunt Mountains", ["item:cup-of-flour"]);
addVendor("Petcas Coldbeard", "Thurgadin", ["item:cup-of-flour"]);
addVendor("Perkins Doughbeard", "Thurgadin", ["item:cup-of-flour", "item:garnish"]);
addVendor("Quana Rainsparkle", "Toxxulia Forest", ["item:garnish"]);
addVendor("Karn Tassen", "South Qeynos", ["item:cup-of-flour"]);
addVendor("Voleen Tassen", "South Qeynos", ["item:cup-of-flour"]);
skippedVendors.push("Bartle Barnick (Rivervale, Cup of Flour) -- wiki-marked \"NO LONGER SPAWNS\", not modeled");
addVendor("Bartle Barnick", "Rivervale", ["item:garnish"]);

addVendor("Bloogy Shellcracker", "Cobalt Scar", ["item:algae-spices", "item:jug-of-oyster-sauces", "item:plankton-frosting", "item:seaweed-vinegar"]);
addVendor("Innkeep", "Rivervale", ["item:plankton-frosting"]);

// ---------------------------------------------------------------------
// One-off base ingredients (drop/forage/fish/quest-only, no soldby table
// per their own pages -- a brief source note, no full stat block, same
// treatment Brewing's own bulk migration 358 gave equivalent one-offs).
// ---------------------------------------------------------------------
addItem("item:bear-meat", "Bear Meat", { source: "Dropped by bears" });
addItem("item:gator-meat", "Gator Meat", { source: "Dropped by alligators" });
addItem("item:mammoth-meat", "Mammoth Meat", { source: "Dropped by mammoths" });
addItem("item:lion-meat", "Lion Meat", { source: "Dropped by lions" });
addItem("item:rat-meat", "Rat Meat", { source: "Dropped by rats" });
addItem("item:wolf-meat", "Wolf Meat", { source: "Dropped by wolves" });
addItem("item:dark-elf-parts", "Dark Elf Parts", { source: "Dropped by dark elves" });
addItem("item:high-elf-parts", "High Elf Parts", { source: "Dropped by high elves" });
addItem("item:dwarf-meat", "Dwarf Meat", { source: "Dropped by dwarves" });
addItem("item:halfling-parts", "Halfling Parts", { source: "Dropped by halflings" });
addItem("item:bixie-parts", "Bixie Parts", { source: "Dropped by bixies" });
addItem("item:troll-parts", "Troll Parts", { source: "Dropped by trolls" });
addItem("item:rabbit-meat", "Rabbit Meat", { source: "Dropped by rabbits" });
addItem("item:scorpion-meat", "Scorpion Meat", { source: "Dropped by scorpions" });
addItem("item:shark-meat", "Shark Meat", { source: "Dropped by sharks" });
addItem("item:wood-elf-parts", "Wood Elf Parts", { source: "Dropped by wood elves" });
addItem("item:snake-meat", "Snake Meat", { source: "Dropped by snakes" });
addItem("item:kobold-meat", "Kobold Meat", { source: "Dropped by kobolds" });
addItem("item:gnome-meat", "Gnome Meat", { source: "Dropped by gnomes" });
addItem("item:lizard-meat", "Lizard Meat", { source: "Dropped by lizardmen" });
addItem("item:panther-meat", "Panther Meat", { source: "Dropped by black panthers in The Wakening Land" });
addItem("item:frost-giant-meat", "Frost Giant Meat", { source: "Dropped by frost giants" });
addItem("item:storm-giant-meat", "Storm Giant Meat", { source: "Dropped by storm giants" });
addItem("item:drake-meat", "Drake Meat", { source: "Dropped by drakes" });
addItem("item:faun-meat", "Faun Meat", { source: "Dropped by fauns" });
addItem("item:siren-parts", "Siren Parts", { source: "Dropped by sirens" });
addItem("item:unicorn-meat", "Unicorn Meat", { source: "Dropped by unicorns" });
addItem("item:wurm-meat", "Wurm Meat", { source: "Dropped by wurms" });
addItem("item:wyvern-meat", "Wyvern Meat", { source: "Dropped by wyverns" });
addItem("item:raptor-meat", "Raptor Meat", { source: "Dropped by raptors" });
addItem("item:sifaye-parts", "Sifaye Parts", { source: "Dropped by sifaye" });
addItem("item:yakman-parts", "Yakman Parts", { source: "Dropped by yakmen (tizmaks)" });
addItem("item:rathe-muskie", "Rathe Muskie", { source: "Fished" });
addItem("item:wasp-wing", "Wasp Wing", { source: "Dropped by wasps" });
addItem("item:chunk-of-meat", "Chunk of Meat", { source: "Dropped by various creatures" });
addItem("item:human-meat", "Human (Chunk of) Meat", { source: "Dropped by humans -- Grobb Cleaver quest ingredient" });
addItem("item:erudite-meat", "Erudite Meat", { source: "Dropped by erudites -- Grobb Cleaver quest ingredient" });
addItem("item:flaming-pungla", "Flaming Pungla", { source: "Grobb Cleaver quest ingredient" });
addItem("item:gray-ice", "Gray Ice", { source: "Ground spawn in Frontier Mountains -- Iksar warrior quest ingredient" });
addItem("item:pondfish-spines", "Pondfish Spines", { source: "Dropped by pond sturgeon in Lake of Ill Omen -- Iksar warrior quest ingredient" });
addItem("item:baking-spirits", "Baking Spirits", { source: "Found in South Qeynos -- Paw of Opolla quest ingredient" });
addItem("item:tundra-kodiak-meat", "Tundra Kodiak Meat", { source: "Dropped by tundra kodiaks -- Thurgadin Prayer Shawl quest ingredient" });
addItem("item:snow-bunny-meat", "Snow Bunny Meat", { source: "Dropped by snow bunnies -- Thurgadin Prayer Shawl quest ingredient" });
addItem("item:ulthork-meat", "Ulthork Meat", { source: "Dropped by ulthorks -- Thurgadin Prayer Shawl quest ingredient" });
addItem("item:snow-griffin-egg", "Snow Griffin Egg", { source: "Foraged/dropped from snow griffins -- Thurgadin Prayer Shawl quest ingredient" });

// Fillets-family fish (all fished, no vendor -- each substitutes for
// another in the same-output-item variant families below).
addItem("item:boar-carp", "Boar Carp", { source: "Fished" });
addItem("item:despair-chub", "Despair Chub", { source: "Fished" });
addItem("item:rujarkian-chub", "Rujarkian Chub", { source: "Fished" });
addItem("item:highland-pike", "Highland Pike", { source: "Fished" });
addItem("item:hound-pike", "Hound Pike", { source: "Fished" });
addItem("item:greengill-salmon", "Greengill Salmon", { source: "Fished" });
addItem("item:thunder-salmon", "Thunder Salmon", { source: "Fished" });
addItem("item:bloodfin-trout", "Bloodfin Trout", { source: "Fished" });
addItem("item:cauldron-trout", "Cauldron Trout", { source: "Fished" });
addItem("item:fogwater-trout", "Fogwater Trout", { source: "Fished" });
addItem("item:iceclad-cutlassfish", "Iceclad Cutlassfish", { source: "Fished" });
addItem("item:salty-whitefish", "Salty Whitefish", { source: "Fished" });
addItem("item:red-roughy", "Red Roughy", { source: "Fished" });
addItem("item:arctic-king-crab", "Arctic King Crab", { source: "Fished/dropped in Velious ocean zones" });
addItem("item:arctic-scallop", "Arctic Scallop", { source: "Fished/dropped in Velious ocean zones" });
addItem("item:cobalt-abalone", "Cobalt Abalone", { source: "Fished/dropped in Velious ocean zones" });
addItem("item:cobalt-rock-crab", "Cobalt Rock Crab", { source: "Fished/dropped in Velious ocean zones" });
addItem("item:small-clam", "Small Clam", { source: "Fished/dropped in Velious ocean zones" });
addItem("item:marr-cherries", "Marr Cherries", { source: "Foraged" });

// Tool items returned after use (uses edges, not container) -- same
// bolded-Implements-column precedent as migration 365's Pie Tin/Cake Round.
addItem("item:muffin-tin", "Muffin Tin", { source: "Crafted via Blacksmithing or Pottery, not Baking itself; returned after use" });
addItem("item:skewers", "Skewers", { source: "Crafted via Blacksmithing or Pottery, not Baking itself; returned after use" });
addItem("item:bread-tin", "Bread Tin", { source: "Crafted via Blacksmithing, not Baking itself; can be lost on a burnt loaf" });

// ---------------------------------------------------------------------
// Produced items -- weight/size not individually re-verified for this
// bulk batch (see this file's own header); stats/resists come straight
// from the recipe table's own "Use" column.
// ---------------------------------------------------------------------
addItem("item:bear-sandwich", "Bear Sandwich", { source: "Baked via Baking (trivial 31)" });
addItem("item:bear-steaks", "Bear Steaks", { source: "Baked via Baking (trivial 41)", stats: { str: 1 } });
addItem("item:beer-braised-bear", "Beer Braised Bear", { source: "Baked via Baking (trivial 68)", stats: { str: 2, int: -1 } });
addItem("item:beer-braised-gator", "Beer Braised Gator", { source: "Baked via Baking (trivial 68)", stats: { str: 2, int: -1 } });
addItem("item:beer-braised-mammoth", "Beer Braised Mammoth", { source: "Baked via Baking (trivial 68); classic combo uses Short Beer, a Velious combo substitutes Othmir Algae Ale + Algae Spices", stats: { str: 3, int: -1 } });
addItem("item:beer-braised-lion", "Beer Braised Lion", { source: "Baked via Baking (trivial 68)", stats: { agi: 2, int: -1 } });
addItem("item:beer-braised-rat", "Beer Braised Rat", { source: "Baked via Baking (trivial 68)", stats: { dex: 2, int: -1 } });
addItem("item:beer-braised-wolf", "Beer Braised Wolf", { source: "Baked via Baking (trivial 68); classic combo uses Short Beer, a Velious combo substitutes Othmir Algae Ale + Algae Spices", stats: { sta: 2, int: -1 } });
addItem("item:beetle-eye-pie", "Beetle Eye Pie", { source: "Baked via Baking (trivial 142)" });
addItem("item:berry-pie", "Berry Pie", { source: "Baked via Baking (trivial 142); also an ingredient in Pound Cake" });
addItem("item:birthday-cake-slice", "Birthday Cake Slice", { source: "Baked via Baking (trivial 15) from a Birthday Cake" });
addItem("item:bixie-crunchies", "Bixie Crunchies", { source: "Baked via Baking (trivial 46)" });
addItem("item:blackened-teirdal", "Blackened Teir'Dal", { source: "Baked via Baking (trivial 62)", stats: { dex: 1, int: 2, agi: 1 } });
addItem("item:candied-spider", "Candied Spider", { source: "Baked via Baking (trivial 88)" });
addItem("item:caynar-nut-stuffed-trout", "Caynar Nut Stuffed Trout", { source: "Baked via Baking (trivial 128)", stats: { sta: 2 }, resists: { disease: 2 } });
addItem("item:chocolate-cookies", "Chocolate Cookies", { source: "Baked via Baking (trivial 148)" });
addItem("item:chocolate-marr-cherries", "Chocolate Marr Cherries", { source: "Baked via Baking (trivial 126)", stats: { cha: 3 } });
addItem("item:chocolate-muffins", "Chocolate Muffins", { source: "Baked via Baking (trivial 155)" });
addItem("item:cookies", "Cookies", { source: "Baked via Baking (trivial 102 normal, 115 with a shaped cookie cutter)" });
addItem("item:cup-cakes", "Cup Cakes", { source: "Baked via Baking (trivial 135)" });
addItem("item:dwarf-chops", "Dwarf Chops", { source: "Baked via Baking (trivial 36)", stats: { str: 2, sta: 2 } });
addItem("item:edible-goo", "Edible Goo", { source: "Baked via Baking (trivial 21)" });
addItem("item:elven-veal", "Elven Veal", { source: "Baked via Baking (trivial 115)", stats: { dex: 1, wis: 1, int: 1, agi: 1 } });
addItem("item:fish-head-soup", "Fish Head Soup", { source: "Baked via Baking (trivial 68)" });
addItem("item:fruit-pie", "Fruit Pie", { source: "Baked via Baking (trivial 142)" });
addItem("item:gator-rolls", "Gator Rolls", { source: "Baked via Baking (trivial 135)" });
addItem("item:gator-steaks", "Gator Steaks", { source: "Baked via Baking (trivial 41)", stats: { str: 1 } });
addItem("item:gnome-kabobs", "Gnome Kabobs", { source: "Baked via Baking (trivial 56)", stats: { dex: 2, int: 2 } });
addItem("item:hot-n-spicy-toelings", "Hot-N-Spicy Toelings", { source: "Baked via Baking (trivial 56)", stats: { dex: 2, agi: 2 } });
addItem("item:hot-cross-buns", "Hot Cross Buns", { source: "Baked via Baking (trivial 142)" });
addItem("item:kobold-steaks", "Kobold Steaks", { source: "Baked via Baking (trivial 41)", stats: { str: 1, sta: 1 } });
addItem("item:lion-steaks", "Lion Steaks", { source: "Baked via Baking (trivial 41)", stats: { agi: 1 } });
addItem("item:lizard-on-a-stick", "Lizard-on-a-Stick", { source: "Baked via Baking (trivial 56)" });
addItem("item:mammoth-sandwich", "Mammoth Sandwich", { source: "Baked via Baking (trivial 31)" });
addItem("item:mammoth-steaks", "Mammoth Steaks", { source: "Baked via Baking (trivial 41); classic combo uses Jug of Sauces, a Velious combo substitutes Algae Spices + Jug of Oyster Sauces", stats: { str: 2 } });
addItem("item:muskie-marinade", "Muskie Marinade", { source: "Baked via Baking (trivial 142)", stats: { str: 1 }, resists: { disease: 2, poison: 2 } });
addItem("item:meat-filled-pie", "Meat-Filled Pie", { source: "Baked via Baking (trivial 142)" });
addItem("item:muffin", "Muffin", { source: "Baked via Baking (trivial 135)" });
addItem("item:pickled-bixie", "Pickled Bixie", { source: "Baked via Baking (trivial 51)" });
addItem("item:pickled-froglok", "Pickled Froglok", { source: "Baked via Baking (trivial 51)" });
addItem("item:pickled-gator", "Pickled Gator", { source: "Baked via Baking (trivial 51)" });
addItem("item:pickled-lizard", "Pickled Lizard", { source: "Baked via Baking (trivial 51)" });
addItem("item:pickled-troll", "Pickled Troll", { source: "Baked via Baking (trivial 51)" });
addItem("item:pound-cake", "Pound Cake", { source: "Baked via Baking (trivial 135)" });
addItem("item:rabbit-stew", "Rabbit Stew", { source: "Baked via Baking (trivial 68)" });
addItem("item:rat-ear-turnovers", "Rat Ear Turnovers", { source: "Baked via Baking (trivial 142)" });
addItem("item:rat-ear-sandwich", "Rat Ear Sandwich", { source: "Baked via Baking (trivial 36)" });
addItem("item:rat-kabobs", "Rat Kabobs", { source: "Baked via Baking (trivial 26)", stats: { dex: 1, agi: 1 } });
addItem("item:rat-sandwich", "Rat Sandwich", { source: "Baked via Baking (trivial 26)" });
addItem("item:scorpion-sandwich", "Scorpion Sandwich", { source: "Baked via Baking (trivial 26)", resists: { poison: 1 } });
addItem("item:shark-fillet", "Shark Fillet", { source: "Baked via Baking (trivial 82); classic combo uses Jug of Sauces, a Velious combo substitutes Algae Spices + Jug of Oyster Sauces" });
addItem("item:shark-rolls", "Shark Rolls", { source: "Baked via Baking (trivial 135)" });
addItem("item:smoked-shark", "Smoked Shark", { source: "Baked via Baking (trivial 95)" });
addItem("item:smoked-wood-elf", "Smoked Wood Elf", { source: "Baked via Baking (trivial 95)", stats: { wis: 2, agi: 2 } });
addItem("item:snake-pickles", "Snake Pickles", { source: "Baked via Baking (trivial 51)", stats: { agi: 1 }, resists: { poison: 1 } });
addItem("item:snake-steak", "Snake Steak", { source: "Baked via Baking (trivial 41)", resists: { poison: 2 } });
addItem("item:vegetable-pie", "Vegetable Pie", { source: "Baked via Baking (trivial 142)" });
addItem("item:vegetable-soup", "Vegetable Soup", { source: "Baked via Baking (trivial 68)" });
addItem("item:wedding-cake-slices", "Wedding Cake Slices", { source: "Baked via Baking (trivial 115) from a Wedding Cake" });
addItem("item:white-chocolate-cookies", "White Chocolate Cookies", { source: "Baked via Baking (trivial 148)" });
addItem("item:white-chocolate-muffins", "White Chocolate Muffins", { source: "Baked via Baking (trivial 155)" });
addItem("item:wolf-sandwich", "Wolf Sandwich", { source: "Baked via Baking (trivial 31)" });
addItem("item:wolf-steaks", "Wolf Steaks", { source: "Baked via Baking (trivial 41)", stats: { sta: 1 } });
addItem("item:wooly-spider-crunchies", "Wooly Spider Crunchies", { source: "Baked via Baking (trivial 46)", resists: { fire: -1, cold: 2 } });

// Velious section
addItem("item:blackened-panther", "Blackened Panther", { source: "Baked via Baking (trivial 62)", stats: { sta: 1, agi: 2 } });
addItem("item:cobalt-cup-cakes", "Cobalt Cup Cakes", { source: "Baked via Baking (trivial 135)", resists: { disease: 3, poison: 3 } });
addItem("item:frost-giant-steak", "Frost Giant Steak", { source: "Baked via Baking (trivial 142)", stats: { str: 4, sta: 1 } });
addItem("item:orange-flavored-cod", "Orange Flavored Cod", { source: "Baked via Baking (trivial 102)", resists: { disease: 2, poison: 1 } });
addItem("item:pickled-dragon", "Pickled Dragon", { source: "Baked via Baking (trivial 115)", stats: { str: 3, dex: 3, sta: 3, cha: 3, wis: 3, int: 3, agi: 3 } });
addItem("item:pickled-drake", "Pickled Drake", { source: "Baked via Baking (trivial 75)", stats: { wis: 2, int: 2 } });
addItem("item:pickled-faun", "Pickled Faun", { source: "Baked via Baking (trivial 95)", stats: { sta: 3, cha: 1, int: 2 } });
addItem("item:pickled-frost-giant", "Pickled Frost Giant", { source: "Baked via Baking (trivial 88)", stats: { str: 3, sta: 3 } });
addItem("item:siren-pickles", "Siren Pickles", { source: "Baked via Baking (trivial 75)", stats: { cha: 4 } });
addItem("item:pickled-storm-giant", "Pickled Storm Giant", { source: "Baked via Baking (trivial 88)", stats: { str: 3, sta: 3 } });
addItem("item:pickled-unicorn", "Pickled Unicorn", { source: "Baked via Baking (trivial 108)", stats: { cha: 2, wis: 2 }, resists: { magic: 2 } });
addItem("item:pickled-wurm", "Pickled Wurm", { source: "Baked via Baking (trivial 75)", stats: { str: 1, dex: 1, sta: 1, cha: 1, wis: 1, int: 1, agi: 1 } });
addItem("item:pickled-wyvern", "Pickled Wyvern", { source: "Baked via Baking (trivial 75)", resists: { magic: 3 } });
addItem("item:raptor-steaks", "Raptor Steaks", { source: "Baked via Baking (trivial 41)", stats: { str: 2, sta: 1 } });
addItem("item:rolled-cutlassfish", "Rolled Cutlassfish", { source: "Baked via Baking (trivial 142)" });
addItem("item:salty-whitefish-fillets", "Salty Whitefish Fillets", { source: "Baked via Baking (trivial 88)" });
addItem("item:sea-green-cookies", "Sea Green Cookies", { source: "Baked via Baking (trivial 102)", resists: { disease: 2, poison: 2 } });
addItem("item:shellcrackers-seaside-salad", "Shellcracker's Seaside Salad", { source: "Baked via Baking (trivial 180)", stats: { dex: 5, cha: 5 }, resists: { cold: 5 } });
addItem("item:sifaye-pickles", "Sifaye Pickles", { source: "Baked via Baking (trivial 75)", stats: { dex: 2, wis: 1 }, resists: { magic: 2 } });
addItem("item:storm-giant-steaks", "Storm Giant Steaks", { source: "Baked via Baking (trivial 142)", stats: { str: 4, sta: 1 } });
addItem("item:vegetable-roughy", "Vegetable Roughy", { source: "Baked via Baking (trivial 115)", resists: { disease: 2, poison: 2 } });
addItem("item:yakman-steak", "Yakman Steak", { source: "Baked via Baking (trivial 75)", stats: { str: 2, sta: 1 } });

// Quest recipes
addItem("item:uncooked-rat-ear-pie", "Uncooked Rat Ear Pie", { source: "Baked via Baking (trivial 28 unfinished, 142 to bake) -- Paw of Opolla quest ingredient" });
addItem("item:hehe-meat", "HEHE Meat", { source: "Baked via Baking (trivial unknown per the wiki's own note) -- Grobb Cleaver quest ingredient" });
addItem("item:spine-poison-extract", "Spine Poison Extract", { source: "Baked via Baking (trivial 21) -- Iksar warrior quest ingredient" });

// Thurgadin Prayer Shawl quest recipes
addItem("item:saucy-bearmeat", "Saucy Bearmeat", { source: "Baked via Baking (trivial 26) -- Thurgadin Prayer Shawl quest ingredient" });
addItem("item:tundrabear-sandwich", "Tundrabear Sandwich", { source: "Baked via Baking (trivial 51) -- Thurgadin Prayer Shawl quest ingredient" });
addItem("item:saucy-bunnymeat", "Saucy Bunnymeat", { source: "Baked via Baking (trivial 63) -- Thurgadin Prayer Shawl quest ingredient" });
addItem("item:snow-bunny-stew", "Snow Bunny Stew", { source: "Baked via Baking (trivial 68) -- Thurgadin Prayer Shawl quest ingredient" });
addItem("item:spicy-ulthork-meat", "Spicy Ulthork Meat", { source: "Baked via Baking (trivial 82) -- Thurgadin Prayer Shawl quest ingredient" });
addItem("item:ulthork-meat-pie", "Ulthork Meat Pie", { source: "Baked via Baking (trivial 95) -- Thurgadin Prayer Shawl quest ingredient" });
addItem("item:snow-griffin-souffle", "Snow Griffin Souffle", { source: "Baked via Baking (trivial 122) -- Thurgadin Prayer Shawl quest ingredient" });

// Fillets family -- each fish substitute is its own recipe node, one
// output item per family name (Chub/Pike/Salmon/Trout Fillet), linked via
// variant_of. Carp Fillet has no substitute listed, so it's a family of one.
addItem("item:carp-fillet", "Carp Fillet", { source: "Baked via Baking (trivial 82)" });
addItem("item:chub-fillet", "Chub Fillet", { source: "Baked via Baking (trivial 82)" });
addItem("item:pike-fillet", "Pike Fillet", { source: "Baked via Baking (trivial 82)" });
addItem("item:salmon-fillet", "Salmon Fillet", { source: "Baked via Baking (trivial 82)" });
addItem("item:trout-fillet", "Trout Fillet", { source: "Baked via Baking (trivial 82)" });

// ---------------------------------------------------------------------
// Recipes -- classic section
// ---------------------------------------------------------------------
addRecipe("recipe:bear-sandwich", "Bear Sandwich", 31, [{ id: "item:bear-meat" }, { id: "item:loaf-of-bread" }], "item:bear-sandwich", undefined, OVEN_SPIT);
addRecipe("recipe:bear-steaks", "Bear Steaks", 41, [{ id: "item:bear-meat" }, { id: "item:jug-of-sauces" }, { id: "item:spices" }], "item:bear-steaks", undefined, OVEN_SPIT);
addRecipe("recipe:beer-braised-bear", "Beer Braised Bear", 68, [{ id: "item:bear-meat" }, { id: "item:spices" }, { id: "item:short-beer" }], "item:beer-braised-bear", 2, OVEN_SPIT);
addRecipe("recipe:beer-braised-gator", "Beer Braised Gator", 68, [{ id: "item:gator-meat" }, { id: "item:spices" }, { id: "item:short-beer" }], "item:beer-braised-gator", 2, OVEN_SPIT);
addRecipe("recipe:beer-braised-mammoth", "Beer Braised Mammoth", 68, [{ id: "item:mammoth-meat" }, { id: "item:spices" }, { id: "item:short-beer" }], "item:beer-braised-mammoth", 2, OVEN_SPIT);
addRecipe("recipe:beer-braised-mammoth-velious", "Beer Braised Mammoth", 68, [{ id: "item:mammoth-meat" }, { id: "item:othmir-algae-ale" }, { id: "item:algae-spices" }], "item:beer-braised-mammoth", 2, OVEN_SPIT, "recipe:beer-braised-mammoth");
addRecipe("recipe:beer-braised-lion", "Beer Braised Lion", 68, [{ id: "item:lion-meat" }, { id: "item:spices" }, { id: "item:short-beer" }], "item:beer-braised-lion", 2, OVEN_SPIT);
addRecipe("recipe:beer-braised-rat", "Beer Braised Rat", 68, [{ id: "item:rat-meat" }, { id: "item:spices" }, { id: "item:short-beer" }], "item:beer-braised-rat", 2, OVEN_SPIT);
addRecipe("recipe:beer-braised-wolf", "Beer Braised Wolf", 68, [{ id: "item:wolf-meat" }, { id: "item:spices" }, { id: "item:short-beer" }], "item:beer-braised-wolf", 2, OVEN_SPIT);
addRecipe("recipe:beer-braised-wolf-velious", "Beer Braised Wolf", 68, [{ id: "item:wolf-meat" }, { id: "item:othmir-algae-ale" }, { id: "item:algae-spices" }], "item:beer-braised-wolf", 2, OVEN_SPIT, "recipe:beer-braised-wolf");
addRecipe("recipe:beetle-eye-pie", "Beetle Eye Pie", 142, [{ id: "item:clump-of-dough" }, { id: "item:fire-beetle-eye" }, { id: "item:spices" }, { id: "item:pie-tin" }], "item:beetle-eye-pie", 5, OVEN_SPIT);
addRecipe("recipe:berry-pie", "Berry Pie", 142, [{ id: "item:clump-of-dough" }, { id: "item:berries" }, { id: "item:pie-tin" }], "item:berry-pie", 2, OVEN_SPIT);
addRecipe("recipe:birthday-cake-slice", "Birthday Cake Slice", 15, [{ id: "item:birthday-cake" }], "item:birthday-cake-slice", 10, OVEN_SPIT);
addRecipe("recipe:bixie-crunchies", "Bixie Crunchies", 46, [{ id: "item:bixie-parts" }, { id: "item:frosting" }], "item:bixie-crunchies", undefined, OVEN_SPIT);
addRecipe("recipe:blackened-teirdal", "Blackened Teir'Dal", 62, [{ id: "item:dark-elf-parts" }, { id: "item:spices" }, { id: "item:garnish" }], "item:blackened-teirdal", 2, OVEN_SPIT);
addRecipe("recipe:loaf-of-bread", "Loaf of Bread", 115, [{ id: "item:clump-of-dough" }, { id: "item:bread-tin" }], "item:loaf-of-bread", undefined, OVEN_SPIT);
addRecipe("recipe:candied-spider", "Candied Spider", 88, [{ id: "item:spider-legs" }, { id: "item:frosting" }, { id: "item:spices" }], "item:candied-spider", 8, OVEN_SPIT);
addRecipe("recipe:caynar-nut-stuffed-trout", "Caynar Nut Stuffed Trout", 128, [{ id: "item:bag-of-caynar-nuts" }, { id: "item:garnish" }, { id: "item:spices" }], "item:caynar-nut-stuffed-trout", 2, OVEN_SPIT);
addRecipe("recipe:chocolate-cookies", "Chocolate Cookies", 148, [{ id: "item:clump-of-dough" }, { id: "item:spices" }, { id: "item:frosting" }, { id: "item:winter-chocolate" }], "item:chocolate-cookies", 2, OVEN_SPIT);
addRecipe("recipe:chocolate-marr-cherries", "Chocolate Marr Cherries", 126, [{ id: "item:marr-cherries", quantity: 3 }, { id: "item:winter-chocolate" }], "item:chocolate-marr-cherries", 6, ["container:mixing-bowl"]);
addRecipe("recipe:chocolate-muffins", "Chocolate Muffins", 155, [{ id: "item:clump-of-dough" }, { id: "item:fruit" }, { id: "item:winter-chocolate" }, { id: "item:muffin-tin" }], "item:chocolate-muffins", 2, OVEN_SPIT);
addRecipe("recipe:clump-of-dough", "Clump of Dough", 17, [{ id: "item:cup-of-flour" }, { id: "item:bottle-of-milk" }, { id: "item:rat-ears" }], "item:clump-of-dough", undefined, ["container:mixing-bowl"]);
addRecipe("recipe:cookies", "Cookies", 102, [{ id: "item:clump-of-dough" }, { id: "item:spices" }, { id: "item:frosting" }], "item:cookies", 5, OVEN_SPIT);
addRecipe("recipe:cookies-shaped", "Cookies", 115, [{ id: "item:clump-of-dough" }, { id: "item:spices" }, { id: "item:frosting" }], "item:cookies", 5, OVEN_SPIT, "recipe:cookies");
addRecipe("recipe:cup-cakes", "Cup Cakes", 135, [{ id: "item:clump-of-dough" }, { id: "item:spices" }, { id: "item:frosting" }, { id: "item:muffin-tin" }], "item:cup-cakes", 3, OVEN_SPIT);
addRecipe("recipe:dwarf-chops", "Dwarf Chops", 36, [{ id: "item:dwarf-meat" }, { id: "item:spices" }, { id: "item:garnish" }], "item:dwarf-chops", 2, OVEN_SPIT);
addRecipe("recipe:edible-goo", "Edible Goo", 21, [{ id: "item:rat-ears" }, { id: "item:fire-beetle-eye" }], "item:edible-goo", undefined, OVEN_SPIT);
addRecipe("recipe:elven-veal", "Elven Veal", 115, [{ id: "item:high-elf-parts" }, { id: "item:spices" }, { id: "item:garnish" }], "item:elven-veal", 2, OVEN_SPIT);
addRecipe("recipe:fish-head-soup", "Fish Head Soup", 68, [{ id: "item:fresh-fish" }, { id: "item:jug-of-sauces" }, { id: "item:water-flask" }], "item:fish-head-soup", undefined, ["container:pot", ...OVEN_SPIT]);
addRecipe("recipe:fruit-pie", "Fruit Pie", 142, [{ id: "item:clump-of-dough" }, { id: "item:fruit" }, { id: "item:pie-tin" }], "item:fruit-pie", 3, OVEN_SPIT);
addRecipe("recipe:gator-rolls", "Gator Rolls", 135, [{ id: "item:gator-meat" }, { id: "item:wasp-wing" }], "item:gator-rolls", undefined, OVEN_SPIT);
addRecipe("recipe:gator-steaks", "Gator Steaks", 41, [{ id: "item:gator-meat" }, { id: "item:jug-of-sauces" }, { id: "item:spices" }], "item:gator-steaks", undefined, OVEN_SPIT);
addRecipe("recipe:gnome-kabobs", "Gnome Kabobs", 56, [{ id: "item:gnome-meat" }, { id: "item:jug-of-sauces" }, { id: "item:spices" }, { id: "item:skewers" }], "item:gnome-kabobs", 2, OVEN_SPIT);
addRecipe("recipe:hot-n-spicy-toelings", "Hot-N-Spicy Toelings", 56, [{ id: "item:halfling-parts" }, { id: "item:spices" }, { id: "item:garnish" }], "item:hot-n-spicy-toelings", 2, OVEN_SPIT);
addRecipe("recipe:hot-cross-buns", "Hot Cross Buns", 142, [{ id: "item:fruit" }, { id: "item:clump-of-dough" }, { id: "item:frosting" }, { id: "item:muffin-tin" }], "item:hot-cross-buns", 8, OVEN_SPIT);
addRecipe("recipe:kobold-steaks", "Kobold Steaks", 41, [{ id: "item:kobold-meat" }, { id: "item:jug-of-sauces" }, { id: "item:spices" }], "item:kobold-steaks", undefined, OVEN_SPIT);
addRecipe("recipe:lion-steaks", "Lion Steaks", 41, [{ id: "item:lion-meat" }, { id: "item:jug-of-sauces" }, { id: "item:spices" }], "item:lion-steaks", undefined, OVEN_SPIT);
addRecipe("recipe:lizard-on-a-stick", "Lizard-on-a-Stick", 56, [{ id: "item:lizard-meat" }, { id: "item:jug-of-sauces" }, { id: "item:spices" }, { id: "item:skewers" }], "item:lizard-on-a-stick", 2, OVEN_SPIT);
addRecipe("recipe:mammoth-sandwich", "Mammoth Sandwich", 31, [{ id: "item:mammoth-meat" }, { id: "item:loaf-of-bread" }], "item:mammoth-sandwich", 5, OVEN_SPIT);
addRecipe("recipe:mammoth-steaks", "Mammoth Steaks", 41, [{ id: "item:mammoth-meat" }, { id: "item:jug-of-sauces" }, { id: "item:spices" }], "item:mammoth-steaks", 5, OVEN_SPIT);
addRecipe("recipe:mammoth-steaks-velious", "Mammoth Steaks", 41, [{ id: "item:mammoth-meat" }, { id: "item:algae-spices" }, { id: "item:jug-of-oyster-sauces" }], "item:mammoth-steaks", 5, OVEN_SPIT, "recipe:mammoth-steaks");
addRecipe("recipe:muskie-marinade", "Muskie Marinade", 142, [{ id: "item:rathe-muskie" }, { id: "item:vinegar" }, { id: "item:spices" }, { id: "item:snake-egg-oil" }, { id: "item:fish-wine" }], "item:muskie-marinade", 2, OVEN_SPIT);
addRecipe("recipe:meat-filled-pie", "Meat-Filled Pie", 142, [{ id: "item:clump-of-dough" }, { id: "item:chunk-of-meat" }, { id: "item:pie-tin" }], "item:meat-filled-pie", 3, OVEN_SPIT);
addRecipe("recipe:muffin", "Muffin", 135, [{ id: "item:clump-of-dough" }, { id: "item:fruit" }, { id: "item:muffin-tin" }], "item:muffin", 6, OVEN_SPIT);
addRecipe("recipe:pickled-bixie", "Pickled Bixie", 51, [{ id: "item:bixie-parts" }, { id: "item:vinegar" }, { id: "item:jug-of-sauces" }], "item:pickled-bixie", 2, OVEN_SPIT);
addRecipe("recipe:pickled-froglok", "Pickled Froglok", 51, [{ id: "item:froglok-meat" }, { id: "item:vinegar" }, { id: "item:jug-of-sauces" }], "item:pickled-froglok", undefined, OVEN_SPIT);
addRecipe("recipe:pickled-gator", "Pickled Gator", 51, [{ id: "item:gator-meat" }, { id: "item:vinegar" }, { id: "item:jug-of-sauces" }], "item:pickled-gator", 2, OVEN_SPIT);
addRecipe("recipe:pickled-lizard", "Pickled Lizard", 51, [{ id: "item:lizard-meat" }, { id: "item:vinegar" }, { id: "item:jug-of-sauces" }], "item:pickled-lizard", 2, OVEN_SPIT);
addRecipe("recipe:pickled-troll", "Pickled Troll", 51, [{ id: "item:troll-parts" }, { id: "item:vinegar" }, { id: "item:jug-of-sauces" }], "item:pickled-troll", 2, OVEN_SPIT);
addRecipe("recipe:pound-cake", "Pound Cake", 135, [{ id: "item:clump-of-dough" }, { id: "item:berry-pie" }, { id: "item:spices" }], "item:pound-cake", 4, OVEN_SPIT);
addRecipe("recipe:rabbit-stew", "Rabbit Stew", 68, [{ id: "item:rabbit-meat" }, { id: "item:water-flask" }], "item:rabbit-stew", undefined, ["container:pot", ...OVEN_SPIT]);
addRecipe("recipe:rat-ear-turnovers", "Rat Ear Turnovers", 142, [{ id: "item:clump-of-dough" }, { id: "item:rat-ears" }, { id: "item:pie-tin" }], "item:rat-ear-turnovers", 2, OVEN_SPIT);
addRecipe("recipe:rat-ear-sandwich", "Rat Ear Sandwich", 36, [{ id: "item:rat-ears" }, { id: "item:jug-of-sauces" }, { id: "item:loaf-of-bread" }], "item:rat-ear-sandwich", undefined, OVEN_SPIT);
addRecipe("recipe:rat-kabobs", "Rat Kabobs", 26, [{ id: "item:rat-meat" }, { id: "item:jug-of-sauces" }, { id: "item:spices" }, { id: "item:skewers" }], "item:rat-kabobs", undefined, OVEN_SPIT);
addRecipe("recipe:rat-sandwich", "Rat Sandwich", 26, [{ id: "item:rat-meat" }, { id: "item:loaf-of-bread" }], "item:rat-sandwich", undefined, OVEN_SPIT);
addRecipe("recipe:scorpion-sandwich", "Scorpion Sandwich", 26, [{ id: "item:scorpion-meat" }, { id: "item:loaf-of-bread" }], "item:scorpion-sandwich", undefined, OVEN_SPIT);
addRecipe("recipe:shark-fillet", "Shark Fillet", 82, [{ id: "item:shark-meat" }, { id: "item:jug-of-sauces" }, { id: "item:spices" }], "item:shark-fillet", 2, OVEN_SPIT);
addRecipe("recipe:shark-fillet-velious", "Shark Fillet", 82, [{ id: "item:shark-meat" }, { id: "item:algae-spices" }, { id: "item:jug-of-oyster-sauces" }], "item:shark-fillet", 2, OVEN_SPIT, "recipe:shark-fillet");
addRecipe("recipe:shark-rolls", "Shark Rolls", 135, [{ id: "item:shark-meat" }, { id: "item:bat-wing" }], "item:shark-rolls", undefined, OVEN_SPIT);
addRecipe("recipe:smoked-shark", "Smoked Shark", 95, [{ id: "item:shark-meat" }, { id: "item:spices" }], "item:smoked-shark", 2, ["container:smoker", ...OVEN_SPIT]);
addRecipe("recipe:smoked-wood-elf", "Smoked Wood Elf", 95, [{ id: "item:wood-elf-parts" }, { id: "item:spices" }], "item:smoked-wood-elf", 2, ["container:smoker", ...OVEN_SPIT]);
addRecipe("recipe:snake-pickles", "Snake Pickles", 51, [{ id: "item:snake-meat" }, { id: "item:jug-of-sauces" }, { id: "item:vinegar" }], "item:snake-pickles", 2, OVEN_SPIT);
addRecipe("recipe:snake-steak", "Snake Steak", 41, [{ id: "item:snake-meat" }, { id: "item:jug-of-sauces" }, { id: "item:spices" }], "item:snake-steak", undefined, OVEN_SPIT);
addRecipe("recipe:vegetable-pie", "Vegetable Pie", 142, [{ id: "item:clump-of-dough" }, { id: "item:vegetables" }, { id: "item:pie-tin" }], "item:vegetable-pie", 6, OVEN_SPIT);
addRecipe("recipe:vegetable-soup", "Vegetable Soup", 68, [{ id: "item:vegetables" }, { id: "item:jug-of-sauces" }, { id: "item:water-flask" }], "item:vegetable-soup", undefined, ["container:pot", ...OVEN_SPIT]);
addRecipe("recipe:wedding-cake-slices", "Wedding Cake Slices", 115, [{ id: "item:wedding-cake" }], "item:wedding-cake-slices", 10, OVEN_SPIT);
addRecipe("recipe:white-chocolate", "White Chocolate", 95, [{ id: "item:brownie-parts" }, { id: "item:frosting", quantity: 2 }, { id: "item:spices" }], "item:white-chocolate", undefined, ["container:mixing-bowl"]);
addRecipe("recipe:white-chocolate-cookies", "White Chocolate Cookies", 148, [{ id: "item:clump-of-dough" }, { id: "item:spices" }, { id: "item:frosting" }, { id: "item:white-chocolate" }], "item:white-chocolate-cookies", 2, OVEN_SPIT);
addRecipe("recipe:white-chocolate-muffins", "White Chocolate Muffins", 155, [{ id: "item:clump-of-dough" }, { id: "item:fruit" }, { id: "item:white-chocolate" }, { id: "item:muffin-tin" }], "item:white-chocolate-muffins", 2, ["container:mixing-bowl", ...OVEN_SPIT]);
addRecipe("recipe:winter-chocolate", "Winter Chocolate", 95, [{ id: "item:brownie-parts" }, { id: "item:frosting", quantity: 2 }], "item:winter-chocolate", undefined, ["container:mixing-bowl", ...OVEN_SPIT]);
addRecipe("recipe:wolf-sandwich", "Wolf Sandwich", 31, [{ id: "item:wolf-meat" }, { id: "item:loaf-of-bread" }], "item:wolf-sandwich", undefined, OVEN_SPIT);
addRecipe("recipe:wolf-steaks", "Wolf Steaks", 41, [{ id: "item:wolf-meat" }, { id: "item:jug-of-sauces" }, { id: "item:spices" }], "item:wolf-steaks", undefined, OVEN_SPIT);
addRecipe("recipe:wooly-spider-crunchies", "Wooly Spider Crunchies", 46, [{ id: "item:spider-legs" }, { id: "item:frosting" }], "item:wooly-spider-crunchies", undefined, OVEN_SPIT);

// Fillets family
addRecipe("recipe:carp-fillet", "Carp Fillet", 82, [{ id: "item:boar-carp" }, { id: "item:jug-of-sauces" }], "item:carp-fillet", 2, ["container:oven"]);
addRecipe("recipe:chub-fillet", "Chub Fillet", 82, [{ id: "item:despair-chub" }, { id: "item:jug-of-sauces" }], "item:chub-fillet", 2, ["container:oven"]);
addRecipe("recipe:chub-fillet-rujarkian", "Chub Fillet", 82, [{ id: "item:rujarkian-chub" }, { id: "item:jug-of-sauces" }], "item:chub-fillet", 2, ["container:oven"], "recipe:chub-fillet");
addRecipe("recipe:pike-fillet", "Pike Fillet", 82, [{ id: "item:highland-pike" }, { id: "item:jug-of-sauces" }], "item:pike-fillet", 2, ["container:oven"]);
addRecipe("recipe:pike-fillet-hound", "Pike Fillet", 82, [{ id: "item:hound-pike" }, { id: "item:jug-of-sauces" }], "item:pike-fillet", 2, ["container:oven"], "recipe:pike-fillet");
addRecipe("recipe:salmon-fillet", "Salmon Fillet", 82, [{ id: "item:greengill-salmon" }, { id: "item:jug-of-sauces" }], "item:salmon-fillet", 2, ["container:oven"]);
addRecipe("recipe:salmon-fillet-thunder", "Salmon Fillet", 82, [{ id: "item:thunder-salmon" }, { id: "item:jug-of-sauces" }], "item:salmon-fillet", 2, ["container:oven"], "recipe:salmon-fillet");
addRecipe("recipe:trout-fillet", "Trout Fillet", 82, [{ id: "item:bloodfin-trout" }, { id: "item:jug-of-sauces" }], "item:trout-fillet", 2, ["container:oven"]);
addRecipe("recipe:trout-fillet-cauldron", "Trout Fillet", 82, [{ id: "item:cauldron-trout" }, { id: "item:jug-of-sauces" }], "item:trout-fillet", 2, ["container:oven"], "recipe:trout-fillet");
addRecipe("recipe:trout-fillet-fogwater", "Trout Fillet", 82, [{ id: "item:fogwater-trout" }, { id: "item:jug-of-sauces" }], "item:trout-fillet", 2, ["container:oven"], "recipe:trout-fillet");

// ---------------------------------------------------------------------
// Recipes -- Velious section
// ---------------------------------------------------------------------
addRecipe("recipe:blackened-panther", "Blackened Panther", 62, [{ id: "item:panther-meat" }, { id: "item:spices" }, { id: "item:garnish" }], "item:blackened-panther", 2, OVEN_SPIT);
addRecipe("recipe:cobalt-cup-cakes", "Cobalt Cup Cakes", 135, [{ id: "item:clump-of-dough" }, { id: "item:algae-spices" }, { id: "item:plankton-frosting" }, { id: "item:muffin-tin" }], "item:cobalt-cup-cakes", 4, OVEN_SPIT);
addRecipe("recipe:frost-giant-steak", "Frost Giant Steak", 142, [{ id: "item:frost-giant-meat" }, { id: "item:jug-of-sauces" }, { id: "item:spices" }], "item:frost-giant-steak", undefined, OVEN_SPIT);
addRecipe("recipe:frost-giant-steak-alt", "Frost Giant Steak", 142, [{ id: "item:frost-giant-meat" }, { id: "item:algae-spices" }, { id: "item:jug-of-oyster-sauces" }], "item:frost-giant-steak", 5, OVEN_SPIT, "recipe:frost-giant-steak");
// Mammoth Steaks' Velious variant is already modeled above (recipe:mammoth-steaks-velious,
// classic section) -- the wiki lists this same recipe in both its classic and Velious
// sections with identical ingredients, not modeled twice.
addRecipe("recipe:orange-flavored-cod", "Orange Flavored Cod", 102, [{ id: "item:cobalt-cod" }, { id: "item:jug-of-oyster-sauces" }, { id: "item:garnish" }, { id: "item:emerald-orange" }], "item:orange-flavored-cod", 2, OVEN_SPIT);
addRecipe("recipe:pickled-dragon", "Pickled Dragon", 115, [{ id: "item:dragon-meat" }, { id: "item:jug-of-oyster-sauces" }, { id: "item:seaweed-vinegar" }], "item:pickled-dragon", 2, OVEN_SPIT);
addRecipe("recipe:pickled-drake", "Pickled Drake", 75, [{ id: "item:drake-meat" }, { id: "item:jug-of-oyster-sauces" }, { id: "item:seaweed-vinegar" }], "item:pickled-drake", 2, OVEN_SPIT);
addRecipe("recipe:pickled-faun", "Pickled Faun", 95, [{ id: "item:faun-meat" }, { id: "item:jug-of-oyster-sauces" }, { id: "item:seaweed-vinegar" }], "item:pickled-faun", 2, OVEN_SPIT);
addRecipe("recipe:pickled-frost-giant", "Pickled Frost Giant", 88, [{ id: "item:frost-giant-meat" }, { id: "item:jug-of-oyster-sauces" }, { id: "item:seaweed-vinegar" }], "item:pickled-frost-giant", 2, OVEN_SPIT);
addRecipe("recipe:siren-pickles", "Siren Pickles", 75, [{ id: "item:siren-parts" }, { id: "item:jug-of-oyster-sauces" }, { id: "item:seaweed-vinegar" }], "item:siren-pickles", 2, OVEN_SPIT);
addRecipe("recipe:pickled-storm-giant", "Pickled Storm Giant", 88, [{ id: "item:storm-giant-meat" }, { id: "item:jug-of-oyster-sauces" }, { id: "item:seaweed-vinegar" }], "item:pickled-storm-giant", 2, OVEN_SPIT);
addRecipe("recipe:pickled-unicorn", "Pickled Unicorn", 108, [{ id: "item:unicorn-meat" }, { id: "item:jug-of-oyster-sauces" }, { id: "item:seaweed-vinegar" }], "item:pickled-unicorn", 2, OVEN_SPIT);
addRecipe("recipe:pickled-wurm", "Pickled Wurm", 75, [{ id: "item:wurm-meat" }, { id: "item:jug-of-oyster-sauces" }, { id: "item:seaweed-vinegar" }], "item:pickled-wurm", 2, OVEN_SPIT);
addRecipe("recipe:pickled-wyvern", "Pickled Wyvern", 75, [{ id: "item:wyvern-meat" }, { id: "item:jug-of-oyster-sauces" }, { id: "item:seaweed-vinegar" }], "item:pickled-wyvern", 2, OVEN_SPIT);
addRecipe("recipe:raptor-steaks", "Raptor Steaks", 41, [{ id: "item:raptor-meat" }, { id: "item:jug-of-sauces" }, { id: "item:spices" }], "item:raptor-steaks", undefined, OVEN_SPIT);
addRecipe("recipe:rolled-cutlassfish", "Rolled Cutlassfish", 142, [{ id: "item:iceclad-cutlassfish" }, { id: "item:bat-wing" }], "item:rolled-cutlassfish", undefined, OVEN_SPIT);
addRecipe("recipe:salty-whitefish-fillets", "Salty Whitefish Fillets", 88, [{ id: "item:salty-whitefish" }, { id: "item:jug-of-oyster-sauces" }], "item:salty-whitefish-fillets", 2, OVEN_SPIT);
addRecipe("recipe:sea-green-cookies", "Sea Green Cookies", 102, [{ id: "item:algae-spices" }, { id: "item:plankton-frosting" }, { id: "item:clump-of-dough" }], "item:sea-green-cookies", undefined, OVEN_SPIT);
addRecipe("recipe:shellcrackers-seaside-salad", "Shellcracker's Seaside Salad", 180, [{ id: "item:arctic-king-crab" }, { id: "item:arctic-mussels" }, { id: "item:arctic-scallop" }, { id: "item:cobalt-abalone" }, { id: "item:cobalt-rock-crab" }, { id: "item:small-clam" }, { id: "item:snapper-oil" }, { id: "item:vegetables" }], "item:shellcrackers-seaside-salad", 6, ["container:oven"]);
addRecipe("recipe:sifaye-pickles", "Sifaye Pickles", 75, [{ id: "item:sifaye-parts" }, { id: "item:jug-of-oyster-sauces" }, { id: "item:seaweed-vinegar" }], "item:sifaye-pickles", 2, OVEN_SPIT);
addRecipe("recipe:storm-giant-steaks", "Storm Giant Steaks", 142, [{ id: "item:storm-giant-meat" }, { id: "item:spices" }, { id: "item:jug-of-sauces" }], "item:storm-giant-steaks", undefined, OVEN_SPIT);
addRecipe("recipe:storm-giant-steaks-alt", "Storm Giant Steaks", 142, [{ id: "item:storm-giant-meat" }, { id: "item:algae-spices" }, { id: "item:jug-of-oyster-sauces" }], "item:storm-giant-steaks", 5, OVEN_SPIT, "recipe:storm-giant-steaks");
addRecipe("recipe:vegetable-roughy", "Vegetable Roughy", 115, [{ id: "item:red-roughy" }, { id: "item:vegetables" }, { id: "item:jug-of-oyster-sauces" }, { id: "item:garnish" }], "item:vegetable-roughy", 2, OVEN_SPIT);
addRecipe("recipe:yakman-steak", "Yakman Steak", 75, [{ id: "item:yakman-parts" }, { id: "item:jug-of-sauces" }, { id: "item:spices" }], "item:yakman-steak", undefined, OVEN_SPIT);
addRecipe("recipe:yakman-steak-alt", "Yakman Steak", 75, [{ id: "item:yakman-parts" }, { id: "item:jug-of-oyster-sauces" }, { id: "item:algae-spices" }], "item:yakman-steak", 5, OVEN_SPIT, "recipe:yakman-steak");

// ---------------------------------------------------------------------
// Quest recipes
// ---------------------------------------------------------------------
addRecipe("recipe:uncooked-rat-ear-pie", "Uncooked Rat Ear Pie", 142, [{ id: "item:rat-ears", quantity: 2 }, { id: "item:cup-of-flour" }, { id: "item:baking-spirits" }], "item:uncooked-rat-ear-pie", undefined, ["container:mixing-bowl", "container:oven"]);
addRecipe("recipe:hehe-meat", "HEHE Meat", 0, [{ id: "item:human-meat" }, { id: "item:erudite-meat" }, { id: "item:high-elf-parts" }, { id: "item:flaming-pungla" }], "item:hehe-meat", undefined, OVEN_SPIT);
addRecipe("recipe:spine-poison-extract", "Spine Poison Extract", 21, [{ id: "item:gray-ice" }, { id: "item:pondfish-spines", quantity: 2 }], "item:spine-poison-extract", undefined, ["container:pot", ...OVEN_SPIT]);

// ---------------------------------------------------------------------
// Thurgadin Prayer Shawl quest recipes
// ---------------------------------------------------------------------
addRecipe("recipe:saucy-bearmeat", "Saucy Bearmeat", 26, [{ id: "item:tundra-kodiak-meat" }, { id: "item:jug-of-sauces" }], "item:saucy-bearmeat", undefined, OVEN_SPIT);
addRecipe("recipe:tundrabear-sandwich", "Tundrabear Sandwich", 51, [{ id: "item:saucy-bearmeat" }, { id: "item:loaf-of-bread" }], "item:tundrabear-sandwich", undefined, ["container:mixing-bowl"]);
addRecipe("recipe:saucy-bunnymeat", "Saucy Bunnymeat", 63, [{ id: "item:snow-bunny-meat", quantity: 2 }, { id: "item:jug-of-sauces" }], "item:saucy-bunnymeat", undefined, ["container:mixing-bowl"]);
addRecipe("recipe:snow-bunny-stew", "Snow Bunny Stew", 68, [{ id: "item:saucy-bunnymeat" }, { id: "item:spices" }, { id: "item:water-flask", quantity: 2 }], "item:snow-bunny-stew", undefined, ["container:pot", ...OVEN_SPIT]);
addRecipe("recipe:spicy-ulthork-meat", "Spicy Ulthork Meat", 82, [{ id: "item:ulthork-meat", quantity: 2 }, { id: "item:vinegar" }, { id: "item:spices" }], "item:spicy-ulthork-meat", undefined, ["container:mixing-bowl"]);
addRecipe("recipe:ulthork-meat-pie", "Ulthork Meat Pie", 95, [{ id: "item:spicy-ulthork-meat" }, { id: "item:clump-of-dough" }, { id: "item:pie-tin" }], "item:ulthork-meat-pie", undefined, ["container:oven"]);
addRecipe("recipe:snow-griffin-souffle", "Snow Griffin Souffle", 122, [{ id: "item:snow-griffin-egg", quantity: 4 }, { id: "item:spices" }], "item:snow-griffin-souffle", undefined, OVEN_SPIT);

save();
console.log(`Migration 367 complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s), ${containersAdded} container(s), ${vendorsAdded} new vendor npc(s), ${sellsEdgesAdded} sells edge(s) added for Baking`);
if (skippedVendors.length) {
  console.log(`Skipped/noted ${skippedVendors.length} vendor(s):`);
  for (const s of skippedVendors) console.log(`  - ${s}`);
}
