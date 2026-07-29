/**
 * Migration 365: model Baking as a tradeskill (issue #47), via the same
 * `recipe`/`uses`/`produces` shapes Brewing established (decisions/
 * tradeskill-recipe-node-schema.md). This first pass covers only the wiki's
 * own hand-picked leveling path -- the "Quick Leveling Guide" table on
 * eqlwiki.com's `Skill Baking` page (7 rows: Batwing Crunchies through
 * Dragon Steak) plus one extra stop its own prose "Baking Leveling Guide
 * (Detailed)" section walks through as Step 6 (Pixie Powder Cinnesticks,
 * triv 202) that the summary table omits -- 8 recipes total. `crafted_in`
 * container edges land in migration 366 (matching Brewing's 355/356 split);
 * the full ~90-recipe remainder (classic + Velious + quest recipes, plus
 * variant_of families) lands in migration 367+.
 *
 * Sourced the same way as Brewing: eqlwiki.com's raw wikitext via its
 * MediaWiki API (`action=query&prop=revisions`, batched multi-title
 * queries), not WebFetch's summarizer -- both the recipe-list page itself
 * and every new item's own page (for weight/size/stats/vendor data).
 *
 * Two sourcing notes:
 * - Dragon Steak's trivial is a real conflict between eqlwiki sources: the
 *   Skill Baking page's own recipe tables say 242 (both the classic and
 *   Velious sections), but Dragon Steak's own item page states "Baking
 *   (Trivial: 200)". Modeled here at 200, the item's own page, same
 *   "re-check each produced item's own page rather than trust the general
 *   list" precedent migration 357 used for Brewing.
 * - Cake Round and Pie Tin are cross-tradeskill tool items (Pottery/
 *   Blacksmithing outputs, not Baking's own) that several Baking recipes
 *   `uses` and get back regardless of success/failure -- modeled as plain
 *   items with a source note, same as Brewing's Bottle/Cask/Shotglass
 *   (decisions/tradeskill-recipe-node-schema.md's "container ingredient"
 *   note), no recipe node of their own since neither tradeskill is modeled
 *   in this graph yet.
 *
 * Vendors: Bat Wing and Jug of Sauces both have real `soldby` tables on
 * their own pages, modeled in full (every vendor listed, not a capped
 * subset, per issue #47). Several of these vendor npcs already exist from
 * Brewing's own migrations (355/358) -- reused by id via
 * extendExistingVendor rather than duplicated. Fish Fillets is unusual for
 * this batch: it's both a produced item *and* directly vendor-sold as a
 * finished meal per its own page, so it gets sells edges too. Clump of
 * Dough, White/Winter Chocolate, Dragon Meat, Pixie Dust, and Cinnamon
 * Sticks have no `soldby` table at all (craft/drop/forage only per their
 * own pages) -- that absence is itself the real fact, not a gap to fill in
 * later, same precedent as Brewing's Rat Ears/Vegetables/Berries/Fruit.
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

function addRecipe(id: string, label: string, trivial: number, uses: Ingredient[], produces: string, produceQty?: number) {
  addNode({ id, label, type: "recipe", tradeskill: "Baking", trivial });
  recipesAdded++;
  for (const ing of uses) {
    addEdge(id, ing.id, "uses", ing.quantity && ing.quantity !== 1 ? { quantity: ing.quantity } : undefined);
  }
  addEdge(id, produces, "produces", produceQty && produceQty !== 1 ? { quantity: produceQty } : undefined);
}

// Zone names eqlwiki.com's own vendor tables use that differ from this
// graph's own zone labels for the same real place (decisions/
// zone-naming-mismatches.md), same alias map migration 358 used.
const ZONE_ALIASES: Record<string, string> = {
  "Kael Drakkel": "Kael Drakkal",
  "Western Plains of Karana": "Western Karana",
};

function addVendor(vendorLabel: string, zoneLabel: string, sells: string[]) {
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
// New base/tool items. Weight/size/flags from each item's own eqlwiki.com
// statsblock. Fresh Fish, Frosting, and Spices already exist from Brewing
// (item:fresh-fish, item:frosting, item:spices) -- reused as-is.
// ---------------------------------------------------------------------
addItem("item:bat-wing", "Bat Wing", { weight: 0, size: "Small", source: "Quest Item; dropped by bats across many zones; also sold by several vendors" });
addItem("item:jug-of-sauces", "Jug of Sauces", { weight: 0.1, size: "Small", source: "Sold by bakery/tradeskill-supply vendors across many zones" });
addItem("item:clump-of-dough", "Clump of Dough", { weight: 0.8, size: "Small", source: "Snack; crafted via Baking (trivial 17) from Bottle of Milk, Cup of Flour, and one of several egg types (yield varies by egg)" });
addItem("item:white-chocolate", "White Chocolate", { weight: 0.1, size: "Small", source: "Quest Item; snack; crafted via Baking (trivial 95) from Brownie Parts, Frosting, and Spices" });
addItem("item:winter-chocolate", "Winter Chocolate", { weight: 0.1, size: "Small", source: "Snack; crafted via Baking (trivial 95) from Brownie Parts and Frosting" });
addItem("item:cake-round", "Cake Round", { weight: 0.1, size: "Small", source: "Crafted via Pottery (trivial 15) or Blacksmithing (trivial 38), not Baking itself; returned on both success and failure when used in a Baking recipe" });
addItem("item:pie-tin", "Pie Tin", { weight: 0.1, size: "Small", source: "Crafted via Blacksmithing (trivial 35) or Pottery (trivial 115/17), not Baking itself; returned on both success and failure when used in a Baking recipe" });
addItem("item:dragon-meat", "Dragon Meat", { weight: 1.0, size: "Small", source: "Dropped by dragons in Temple of Veeshan, The Wakening Land, and Western Wastes (Velious era)" });
addItem("item:pixie-dust", "Pixie Dust", { weight: 0.1, size: "Tiny", source: "Quest Item; dropped by pixies in Greater Faydark, Lesser Faydark, and Toxxulia Forest" });
addItem("item:cinnamon-sticks", "Cinnamon Sticks", { weight: 0.6, size: "Small", source: "Foraged in Greater Faydark" });

// ---------------------------------------------------------------------
// Produced items (this batch's 8 leveling-path recipes' own results).
// ---------------------------------------------------------------------
addItem("item:batwing-crunchies", "Batwing Crunchies", { weight: 0.1, size: "Small", source: "Quest Item; meal; baked via Baking (trivial 46)" });
addItem("item:fish-fillets", "Fish Fillets", { weight: 0.1, size: "Small", source: "Quest Item; meal; baked via Baking (trivial 82); also sold directly by a couple of vendors" });
addItem("item:fish-rolls", "Fish Rolls", { weight: 0.1, size: "Small", source: "Banquet-sized meal; baked via Baking (trivial 135)" });
addItem("item:batwing-pie", "Batwing Pie", { weight: 0.1, size: "Small", source: "Meal; baked via Baking (trivial 142)" });
addItem("item:wedding-cake", "Wedding Cake", { weight: 1.0, size: "Small", source: "Meal; baked via Baking (trivial 157); also an ingredient in Wedding Cake Slices" });
addItem("item:birthday-cake", "Birthday Cake", { weight: 1.0, size: "Small", source: "Meal; baked via Baking (trivial 162); also an ingredient in Birthday Cake Slice" });
addItem("item:pixie-powder-cinnesticks", "Pixie Powder Cinnesticks", { weight: 0.1, size: "Small", source: "Snack; baked via Baking (trivial 202)", stats: { agi: 2 }, resists: { magic: 2 } });
addItem("item:dragon-steak", "Dragon Steak", {
  weight: 0.1, size: "Small",
  source: "Hearty meal; baked via Baking. Trivial conflict between eqlwiki sources: this item's own page states 200 (used here); the Skill Baking recipe tables both say 242",
  stats: { str: 4, dex: 4, sta: 4, cha: 4, wis: 4, int: 4, agi: 4 },
});

// ---------------------------------------------------------------------
// Recipes -- the wiki's own "Quick Leveling Guide" 7 rows plus the
// Detailed guide's extra Step 6 (Pixie Powder Cinnesticks), flagged
// levelingGuide in a later migration once the full recipe list exists.
// ---------------------------------------------------------------------
addRecipe("recipe:batwing-crunchies", "Batwing Crunchies", 46,
  [{ id: "item:bat-wing" }, { id: "item:frosting" }], "item:batwing-crunchies");
addRecipe("recipe:fish-fillets", "Fish Fillets", 82,
  [{ id: "item:fresh-fish" }, { id: "item:jug-of-sauces" }], "item:fish-fillets", 2);
addRecipe("recipe:fish-rolls", "Fish Rolls", 135,
  [{ id: "item:bat-wing" }, { id: "item:fresh-fish" }], "item:fish-rolls");
addRecipe("recipe:batwing-pie", "Batwing Pie", 142,
  [{ id: "item:bat-wing" }, { id: "item:clump-of-dough" }, { id: "item:pie-tin" }, { id: "item:spices" }], "item:batwing-pie", 4);
addRecipe("recipe:wedding-cake", "Wedding Cake", 157,
  [{ id: "item:cake-round" }, { id: "item:clump-of-dough" }, { id: "item:frosting" }, { id: "item:white-chocolate" }], "item:wedding-cake", 2);
addRecipe("recipe:birthday-cake", "Birthday Cake", 162,
  [{ id: "item:cake-round" }, { id: "item:clump-of-dough" }, { id: "item:frosting" }, { id: "item:winter-chocolate" }], "item:birthday-cake", 2);
addRecipe("recipe:pixie-powder-cinnesticks", "Pixie Powder Cinnesticks", 202,
  [{ id: "item:cinnamon-sticks" }, { id: "item:pixie-dust", quantity: 3 }], "item:pixie-powder-cinnesticks", 6);
addRecipe("recipe:dragon-steak", "Dragon Steak", 200,
  [{ id: "item:dragon-meat" }, { id: "item:jug-of-sauces" }, { id: "item:spices" }], "item:dragon-steak", 5);

// ---------------------------------------------------------------------
// Vendors. Bat Wing and Jug of Sauces get their full soldby tables (issue
// #47: no capped/representative subset); Fish Fillets gets its own two
// direct-sale vendors. Several already exist from Brewing's own migrations
// -- addVendor() no-ops the node creation and just adds the new sells edge.
// ---------------------------------------------------------------------
addVendor("Katha Firespinner", "East Commonlands", ["item:bat-wing"]);
addVendor("Jeliala Glimmercharm", "Erudin Palace", ["item:bat-wing"]);
addVendor("Tika Shockstep", "Erudin Palace", ["item:bat-wing"]);
addVendor("Klok Acet", "Field of Bone", ["item:bat-wing"]);
addVendor("Lindie Rains", "West Freeport", ["item:bat-wing"]);
addVendor("Lysa Truegreen", "West Freeport", ["item:bat-wing"]);
addVendor("Zasrin Blueflame", "West Freeport", ["item:bat-wing"]);
addVendor("Ymik", "Kael Drakkel", ["item:bat-wing"]);
addVendor("Jeena Firechaser", "Kithicor Forest", ["item:bat-wing"]);
addVendor("Hrak", "Oggok", ["item:bat-wing"]);
addVendor("Klok Gragin", "Warsliks Woods", ["item:bat-wing"]);
addVendor("Klok Rogalin", "Warsliks Woods", ["item:bat-wing"]);

addVendor("a clockwork baker", "Ak'Anon", ["item:jug-of-sauces"]);
addVendor("Urazun Thranon", "Butcherblock Mountains", ["item:jug-of-sauces"]);
addVendor("Klok Sweetzie", "East Cabilis", ["item:jug-of-sauces"]);
addVendor("Praps Gemshard", "Crystal Caverns", ["item:jug-of-sauces"]);
addVendor("Parthar", "East Commonlands", ["item:jug-of-sauces"]);
addVendor("Bup", "The Feerrott", ["item:jug-of-sauces"]);
addVendor("Pincia Brownloe", "West Freeport", ["item:jug-of-sauces"]);
addVendor("Sissia", "Halas", ["item:jug-of-sauces"]);
addVendor("Bim Buskin", "Misty Thicket", ["item:jug-of-sauces"]);
addVendor("Niz L`Crit", "Neriak Commons", ["item:jug-of-sauces"]);
addVendor("Tin Merchant XI", "The Overthere", ["item:jug-of-sauces"]);
addVendor("Chrislin Baker", "Western Plains of Karana", ["item:jug-of-sauces"]);
addVendor("Chef Kollof", "Skyshrine", ["item:jug-of-sauces"]);
addVendor("Finkel Rardobaen", "Steamfont Mountains", ["item:jug-of-sauces"]);
addVendor("Chef Stead", "Stonebrunt Mountains", ["item:jug-of-sauces"]);
addVendor("Perkins Doughbeard", "Thurgadin", ["item:jug-of-sauces"]);
addVendor("Petcas Coldbeard", "Thurgadin", ["item:jug-of-sauces"]);
addVendor("Quana Rainsparkle", "Toxxulia Forest", ["item:jug-of-sauces"]);

addVendor("Klok Foxmyr", "East Cabilis", ["item:fish-fillets"]);
addVendor("Roary Fishpouncer", "Kerra Island", ["item:fish-fillets"]);

save();
console.log(`Migration 365 complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s), ${vendorsAdded} new vendor npc(s), ${sellsEdgesAdded} sells edge(s) added for Baking`);
if (skippedVendors.length) {
  console.log(`Skipped ${skippedVendors.length} vendor(s) (zone not catalogued):`);
  for (const s of skippedVendors) console.log(`  - ${s}`);
}
