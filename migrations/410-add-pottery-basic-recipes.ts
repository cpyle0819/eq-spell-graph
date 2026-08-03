/**
 * Migration 410: Pottery's full "Basic" recipe list (issue #51's own ask --
 * "the full recipe list, not just a leveling-path subset") plus the sketch/
 * template ingredient vendors. Continues migration 409's two-stage Wheel/
 * Kiln pattern: every finished item here is a Wheel recipe (produces an
 * "Unfired X" item) chained into a Kiln recipe (Unfired X + Firing Sheet ->
 * the finished item). `recipe.levelingGuide` flags the Wheel recipes that
 * match the wiki's own "Leveling Guide" section step list -- leveling stops
 * at the unfired stage (discarding the result) since firing is a trivial
 * afterthought at those skill levels, per the wiki's own Step 1/2 notes.
 *
 * Six of these finished items were already Blacksmithing recipes in this
 * graph (Pot, Smoker, Skewers, Cake Round, Pie Tin, Muffin Tin) -- Pottery's
 * own combo gets `variant_of` back to that existing anchor rather than a
 * disconnected duplicate, per decisions/tradeskill-recipe-node-schema.md's
 * "Recipe variants" section. The four Shaped Cookie Cutters get the same
 * treatment against the Blacksmithing anchors migration 408 just added.
 *
 * The three Small ___ Deity items share a single "Unfired Deity" wiki page,
 * but the item's own page and the Basic table disagree with each other and
 * with the finished items' own pages in ways that read as copy/paste drift
 * between three near-identical pages (Small Wisdom Deity's own page lists
 * "Trivial: 122" for its Kiln step, which is actually Small Resisting
 * Deity's own Wheel trivial per the table). The Basic table's own per-row
 * Wheel/Kiln columns are used instead, since they're laid out as three
 * distinct rows rather than three separately-edited pages. The three Wheel
 * combos are modeled as a `variant_of` family (same shared output, three
 * different gem/clay combos), then three independent Kiln recipes each
 * consume that shared unfired item to produce their own distinct finished
 * item -- not a variant family itself, since the outputs differ.
 *
 * A few other item-page-vs-table trivial disagreements, resolved the same
 * "item's own page wins" way migrations 357/365/375 already established:
 * Cake Round's Kiln step (item page: 15, table: 17), Large Bowl's Kiln step
 * (item page: 15, table: 17), Pot's Kiln step (item page states the
 * unparseable "Trivial: 56, 31" -- 56 is actually Unfired Pot's own Wheel
 * trivial restated, so the table's Kiln value of 17 is used instead), and
 * Small Bowl's Kiln step (item page: the non-numeric "<50" -- table's 17
 * used instead).
 *
 * The Poison Vial family's pelt/skin ingredient is one of nine wiki-listed
 * interchangeable substitutes (Low/Medium/High Quality Wolf Skin, Mist Wolf
 * Pelt, White/Black Wolf Skin, various Cat Pelts, various Bear Skins,
 * Zombie Skin, Crow's Special Brew) -- modeling all nine as a variant family
 * per vial would triple this migration's size for a flavor-equivalent
 * ingredient swap, so one representative substitute is used per vial (the
 * first-listed, cheapest common one) with the full substitute list recorded
 * on the ingredient item's own `source` field instead.
 *
 * Sourced from eqlwiki.com's raw wikitext via its MediaWiki API (batched
 * multi-title queries against the `Skill Pottery` page and every finished/
 * unfired item's own page), not a summarizer. Vendor tables are each
 * sketch/template's own eqlwiki `soldby` table in full, no capped subset,
 * per issue #51.
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
  station: "container:pottery-wheel" | "container:kiln",
  opts: Record<string, unknown> = {}
) {
  addNode({ id, label, type: "recipe", tradeskill: "Pottery", trivial, ...opts });
  recipesAdded++;
  for (const ing of uses) {
    addEdge(id, ing.id, "uses", ing.quantity && ing.quantity !== 1 ? { quantity: ing.quantity } : undefined);
  }
  addEdge(id, produces, "produces");
  addEdge(id, station, "crafted_in");
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
// Skewers -- variant_of Blacksmithing's recipe:skewers
// ---------------------------------------------------------------------
addItem("item:unfired-skewers", "Unfired Skewers", { weight: 0.1, size: "Tiny" });
addRecipe("recipe:unfired-skewers", "Unfired Skewers", 21,
  [{ id: "item:block-of-clay" }, { id: "item:skewers-sketch" }, { id: "item:water-flask" }], "item:unfired-skewers", "container:pottery-wheel");
addRecipe("recipe:skewers-pottery", "Skewers", 17,
  [{ id: "item:unfired-skewers" }, { id: "item:quality-firing-sheet" }], "item:skewers", "container:kiln");
addEdge("recipe:skewers-pottery", "recipe:skewers", "variant_of");

// ---------------------------------------------------------------------
// Small Clay Jar
// ---------------------------------------------------------------------
addItem("item:unfired-small-container", "Unfired Small Container", { weight: 0.1, size: "Tiny" });
addItem("item:small-clay-jar", "Small Clay Jar", { weight: 3.0, capacity: 2, containerSize: "Medium" });
addRecipe("recipe:unfired-small-container", "Unfired Small Container", 31,
  [{ id: "item:block-of-clay" }, { id: "item:small-jar-sketch" }, { id: "item:water-flask" }], "item:unfired-small-container", "container:pottery-wheel");
addRecipe("recipe:small-clay-jar", "Small Clay Jar", 17,
  [{ id: "item:unfired-small-container" }, { id: "item:quality-firing-sheet" }], "item:small-clay-jar", "container:kiln");

// ---------------------------------------------------------------------
// Ceramic Lining -- item already exists (migration 375, consumed by
// Blacksmithing's Muffin Tin/Pie Tin/Cake Round/Bread Tin); this is the
// first recipe that actually produces it.
// ---------------------------------------------------------------------
addItem("item:unfired-ceramic-lining", "Unfired Ceramic Lining", { weight: 0.1, size: "Tiny" });
addRecipe("recipe:unfired-ceramic-lining", "Unfired Ceramic Lining", 36,
  [{ id: "item:small-block-of-clay" }, { id: "item:ceramic-lining-sketch" }, { id: "item:water-flask" }], "item:unfired-ceramic-lining", "container:pottery-wheel");
addRecipe("recipe:ceramic-lining", "Ceramic Lining", 17,
  [{ id: "item:unfired-ceramic-lining" }, { id: "item:quality-firing-sheet" }], "item:ceramic-lining", "container:kiln");

// ---------------------------------------------------------------------
// Medium Clay Jar -- levelingGuide (21 to 36 step)
// ---------------------------------------------------------------------
addItem("item:unfired-medium-container", "Unfired Medium Container", { weight: 0.1, size: "Tiny" });
addItem("item:medium-clay-jar", "Medium Clay Jar", { weight: 4.5, capacity: 4, containerSize: "Medium", source: "Combineable container used to make Fine Plate Armor dyes; lost on combine" });
addRecipe("recipe:unfired-medium-container", "Unfired Medium Container", 36,
  [{ id: "item:block-of-clay" }, { id: "item:medium-jar-sketch" }, { id: "item:water-flask" }], "item:unfired-medium-container", "container:pottery-wheel",
  { levelingGuide: true });
addRecipe("recipe:medium-clay-jar", "Medium Clay Jar", 17,
  [{ id: "item:unfired-medium-container" }, { id: "item:quality-firing-sheet" }], "item:medium-clay-jar", "container:kiln");

// ---------------------------------------------------------------------
// Cake Round -- variant_of Blacksmithing's recipe:cake-round. Kiln trivial
// 15 per item's own page (table says 17).
// ---------------------------------------------------------------------
addItem("item:unfired-cake-round", "Unfired Cake Round", { weight: 0.1, size: "Tiny" });
addRecipe("recipe:unfired-cake-round", "Unfired Cake Round", 15,
  [{ id: "item:block-of-clay" }, { id: "item:cake-round-sketch" }, { id: "item:glass-shard" }, { id: "item:water-flask" }], "item:unfired-cake-round", "container:pottery-wheel");
addRecipe("recipe:cake-round-pottery", "Cake Round", 15,
  [{ id: "item:unfired-cake-round" }, { id: "item:high-quality-firing-sheet" }], "item:cake-round", "container:kiln");
addEdge("recipe:cake-round-pottery", "recipe:cake-round", "variant_of");

// ---------------------------------------------------------------------
// Large Clay Jar -- levelingGuide (36 to 41 step)
// ---------------------------------------------------------------------
addItem("item:unfired-large-container", "Unfired Large Container", { weight: 0.1, size: "Tiny" });
addItem("item:large-clay-jar", "Large Clay Jar", { weight: 6.0, capacity: 8, containerSize: "Medium" });
addRecipe("recipe:unfired-large-container", "Unfired Large Container", 41,
  [{ id: "item:block-of-clay" }, { id: "item:large-jar-sketch" }, { id: "item:water-flask" }], "item:unfired-large-container", "container:pottery-wheel",
  { levelingGuide: true });
addRecipe("recipe:large-clay-jar", "Large Clay Jar", 17,
  [{ id: "item:unfired-large-container" }, { id: "item:quality-firing-sheet" }], "item:large-clay-jar", "container:kiln");

// ---------------------------------------------------------------------
// Pot -- variant_of Blacksmithing's recipe:pot. Item's own Kiln-step
// trivial ("56, 31") doesn't parse cleanly against anything else on the
// page -- 56 duplicates Unfired Pot's own Wheel trivial, so the table's
// Kiln value of 17 is used.
// ---------------------------------------------------------------------
addItem("item:unfired-pot", "Unfired Pot", { weight: 0.1, size: "Tiny" });
addRecipe("recipe:unfired-pot", "Unfired Pot", 56,
  [{ id: "item:large-block-of-clay" }, { id: "item:metal-bits" }, { id: "item:pot-sketch" }, { id: "item:water-flask" }], "item:unfired-pot", "container:pottery-wheel");
addRecipe("recipe:pot-pottery", "Pot", 17,
  [{ id: "item:unfired-pot" }, { id: "item:high-quality-firing-sheet" }], "container:pot", "container:kiln");
addEdge("recipe:pot-pottery", "recipe:pot", "variant_of");

// ---------------------------------------------------------------------
// Smoker -- variant_of Blacksmithing's recipe:smoker
// ---------------------------------------------------------------------
addItem("item:unfired-smoker", "Unfired Smoker", { weight: 0.1, size: "Tiny" });
addRecipe("recipe:unfired-smoker", "Unfired Smoker", 82,
  [{ id: "item:large-block-of-clay" }, { id: "item:smoker-sketch" }, { id: "item:water-flask" }], "item:unfired-smoker", "container:pottery-wheel");
addRecipe("recipe:smoker-pottery", "Smoker", 17,
  [{ id: "item:unfired-smoker" }, { id: "item:high-quality-firing-sheet", quantity: 2 }], "container:smoker", "container:kiln");
addEdge("recipe:smoker-pottery", "recipe:smoker", "variant_of");

// ---------------------------------------------------------------------
// Shaped Cookie Cutters (4) -- variant_of the Blacksmithing anchors
// migration 408 just added.
// ---------------------------------------------------------------------
const COOKIE_CUTTERS: [string, string, string][] = [
  ["animal", "Animal", "item:animal-template"],
  ["barbarian", "Barbarian", "item:barbarian-template"],
  ["gnome", "Gnome", "item:gnome-template"],
  ["troll", "Troll", "item:troll-template"],
];
for (const [key, name, templateId] of COOKIE_CUTTERS) {
  addItem(`item:unfired-${key}-cookie-cutter`, `Unfired ${name} Cookie Cutter`, { weight: 0.1, size: "Tiny" });
  addRecipe(`recipe:unfired-${key}-cookie-cutter`, `Unfired ${name} Cookie Cutter`, 102,
    [{ id: templateId }, { id: "item:small-block-of-clay" }, { id: "item:water-flask" }], `item:unfired-${key}-cookie-cutter`, "container:pottery-wheel");
  addRecipe(`recipe:${key}-shaped-cookie-cutter-pottery`, `${name} Shaped Cookie Cutter`, 17,
    [{ id: `item:unfired-${key}-cookie-cutter` }, { id: "item:high-quality-firing-sheet" }], `item:${key}-shaped-cookie-cutter`, "container:kiln");
  addEdge(`recipe:${key}-shaped-cookie-cutter-pottery`, `recipe:${key}-shaped-cookie-cutter`, "variant_of");
}

// ---------------------------------------------------------------------
// Small Bowl -- levelingGuide (41 to 102 step). Kiln trivial: item's own
// page says the non-numeric "<50"; table's 17 used instead.
// ---------------------------------------------------------------------
addItem("item:unfired-small-bowl", "Unfired Small Bowl", { weight: 0.1, size: "Tiny" });
addItem("item:small-bowl", "Small Bowl", { weight: 0.1, size: "Tiny" });
addRecipe("recipe:unfired-small-bowl", "Unfired Small Bowl", 102,
  [{ id: "item:bowl-sketch" }, { id: "item:small-block-of-clay" }, { id: "item:water-flask" }], "item:unfired-small-bowl", "container:pottery-wheel",
  { levelingGuide: true });
addRecipe("recipe:small-bowl", "Small Bowl", 17,
  [{ id: "item:unfired-small-bowl" }, { id: "item:high-quality-firing-sheet" }], "item:small-bowl", "container:kiln");

// ---------------------------------------------------------------------
// Pie Tin -- variant_of Blacksmithing's recipe:pie-tin
// ---------------------------------------------------------------------
addItem("item:unfired-pie-tin", "Unfired Pie Tin", { weight: 0.1, size: "Tiny" });
addRecipe("recipe:unfired-pie-tin", "Unfired Pie Tin", 115,
  [{ id: "item:block-of-clay", quantity: 2 }, { id: "item:pie-tin-sketch" }, { id: "item:water-flask" }], "item:unfired-pie-tin", "container:pottery-wheel");
addRecipe("recipe:pie-tin-pottery", "Pie Tin", 17,
  [{ id: "item:unfired-pie-tin" }, { id: "item:high-quality-firing-sheet" }], "item:pie-tin", "container:kiln");
addEdge("recipe:pie-tin-pottery", "recipe:pie-tin", "variant_of");

// ---------------------------------------------------------------------
// Medium Bowl -- levelingGuide (102 to 122 step)
// ---------------------------------------------------------------------
addItem("item:unfired-medium-bowl", "Unfired Medium Bowl", { weight: 0.1, size: "Tiny" });
addItem("item:medium-bowl", "Medium Bowl", { weight: 0.1, size: "Tiny" });
addRecipe("recipe:unfired-medium-bowl", "Unfired Medium Bowl", 122,
  [{ id: "item:block-of-clay" }, { id: "item:medium-bowl-sketch" }, { id: "item:water-flask" }], "item:unfired-medium-bowl", "container:pottery-wheel",
  { levelingGuide: true });
addRecipe("recipe:medium-bowl", "Medium Bowl", 17,
  [{ id: "item:unfired-medium-bowl" }, { id: "item:high-quality-firing-sheet", quantity: 2 }], "item:medium-bowl", "container:kiln");

// ---------------------------------------------------------------------
// Muffin Tin -- variant_of Blacksmithing's recipe:muffin-tin
// ---------------------------------------------------------------------
addItem("item:unfired-muffin-tin", "Unfired Muffin Tin", { weight: 0.1, size: "Tiny" });
addRecipe("recipe:unfired-muffin-tin", "Unfired Muffin Tin", 122,
  [{ id: "item:block-of-clay" }, { id: "item:metal-bits" }, { id: "item:muffin-tin-sketch" }, { id: "item:water-flask" }], "item:unfired-muffin-tin", "container:pottery-wheel");
addRecipe("recipe:muffin-tin-pottery", "Muffin Tin", 17,
  [{ id: "item:unfired-muffin-tin" }, { id: "item:high-quality-firing-sheet" }], "item:muffin-tin", "container:kiln");
addEdge("recipe:muffin-tin-pottery", "recipe:muffin-tin", "variant_of");

// ---------------------------------------------------------------------
// Mixing Bowl -- item already exists (Baking); this is the first recipe
// that actually produces it.
// ---------------------------------------------------------------------
addItem("item:unfired-mixing-bowl", "Unfired Mixing Bowl", { weight: 0.1, size: "Tiny" });
addRecipe("recipe:unfired-mixing-bowl", "Unfired Mixing Bowl", 128,
  [{ id: "item:large-block-of-clay", quantity: 2 }, { id: "item:large-bowl-sketch" }, { id: "item:water-flask" }], "item:unfired-mixing-bowl", "container:pottery-wheel");
addRecipe("recipe:mixing-bowl", "Mixing Bowl", 17,
  [{ id: "item:unfired-mixing-bowl" }, { id: "item:firing-sheet" }], "container:mixing-bowl", "container:kiln");

// ---------------------------------------------------------------------
// Small Wisdom/Resisting/Protection Deity -- one shared "Unfired Deity"
// wheel-stage output (variant family, three gem/clay combos), then three
// independent Kiln recipes producing three distinct finished items.
// Cleric/Druid/Shaman range/primary/secondary equippable trinkets.
// ---------------------------------------------------------------------
addItem("item:sand-of-ro", "Sand of Ro", { weight: 0.1, size: "Tiny", source: "Loot drop (sand giants in Oasis of Marr, Northern/Southern Desert of Ro, West Commonlands); not vendor-sold per its own eqlwiki page" });
addItem("item:unfired-deity", "Unfired Deity", { weight: 0.1, size: "Tiny" });
addRecipe("recipe:unfired-deity-wisdom", "Unfired Deity", 135,
  [{ id: "item:large-block-of-clay" }, { id: "item:sand-of-ro" }, { id: "item:small-deity-sketch" }, { id: "item:water-flask" }], "item:unfired-deity", "container:pottery-wheel");
addRecipe("recipe:unfired-deity-resisting", "Unfired Deity", 122,
  [{ id: "item:small-block-of-clay" }, { id: "item:wolfs-eye-agate" }, { id: "item:small-deity-sketch" }, { id: "item:water-flask" }], "item:unfired-deity", "container:pottery-wheel");
addEdge("recipe:unfired-deity-resisting", "recipe:unfired-deity-wisdom", "variant_of");
addRecipe("recipe:unfired-deity-protection", "Unfired Deity", 68,
  [{ id: "item:block-of-clay" }, { id: "item:carnelian" }, { id: "item:small-deity-sketch" }, { id: "item:water-flask" }], "item:unfired-deity", "container:pottery-wheel");
addEdge("recipe:unfired-deity-protection", "recipe:unfired-deity-wisdom", "variant_of");

addItem("item:small-wisdom-deity", "Small Wisdom Deity", {
  slots: ["Range", "Primary", "Secondary"], stats: { wis: 2 }, weight: 0.1, size: "Tiny", classes: ["Cleric", "Druid"],
});
addItem("item:small-resisting-deity", "Small Resisting Deity", {
  slots: ["Range", "Primary", "Secondary"], stats: { cha: 2 }, resists: { disease: 2, magic: 2 }, weight: 0.1, size: "Tiny", classes: ["Cleric", "Druid", "Shaman"],
});
addItem("item:small-protection-deity", "Small Protection Deity", {
  slots: ["Range", "Primary", "Secondary"], ac: 3, weight: 0.1, size: "Tiny", classes: ["Cleric", "Druid", "Shaman"],
});
addRecipe("recipe:small-wisdom-deity", "Small Wisdom Deity", 17,
  [{ id: "item:unfired-deity" }, { id: "item:high-quality-firing-sheet" }], "item:small-wisdom-deity", "container:kiln");
addRecipe("recipe:small-resisting-deity", "Small Resisting Deity", 17,
  [{ id: "item:unfired-deity" }, { id: "item:high-quality-firing-sheet" }], "item:small-resisting-deity", "container:kiln");
addRecipe("recipe:small-protection-deity", "Small Protection Deity", 17,
  [{ id: "item:unfired-deity" }, { id: "item:high-quality-firing-sheet" }], "item:small-protection-deity", "container:kiln");

// ---------------------------------------------------------------------
// Large Bowl -- levelingGuide (122 to 148 step). Kiln trivial: item's own
// page says 15 (table says 17).
// ---------------------------------------------------------------------
addItem("item:unfired-large-bowl", "Unfired Large Bowl", { weight: 0.1, size: "Tiny" });
addItem("item:large-bowl", "Large Bowl", { weight: 0.1, size: "Tiny" });
addRecipe("recipe:unfired-large-bowl", "Unfired Large Bowl", 148,
  [{ id: "item:large-block-of-clay" }, { id: "item:glass-shard" }, { id: "item:large-bowl-sketch" }, { id: "item:water-flask" }], "item:unfired-large-bowl", "container:pottery-wheel",
  { levelingGuide: true });
addRecipe("recipe:large-bowl", "Large Bowl", 15,
  [{ id: "item:unfired-large-bowl" }, { id: "item:high-quality-firing-sheet" }], "item:large-bowl", "container:kiln");

// ---------------------------------------------------------------------
// Poison Vial family -- levelingGuide on all three Wheel steps (122 to 148/
// 168/188 branches). Pelt/skin ingredient: one representative substitute
// per vial, full OR list on the ingredient's own `source`.
// ---------------------------------------------------------------------
addItem("item:low-quality-wolf-skin", "Low Quality Wolf Skin", {
  weight: 0.1, size: "Small",
  source: "Loot drop (wolves); one of several interchangeable Pottery pelt/skin substitutes -- Medium/High Quality Wolf Skin, Mist Wolf Pelt, White/Black Wolf Skin, Low/Medium/High Quality Cat Pelt, Low/Medium/High Quality Bear Skin, Polar Bear Skin, Zombie Skin, and Crow's Special Brew all also work per eqlwiki",
});
addItem("item:thick-grizzly-bear-skin", "Thick Grizzly Bear Skin", {
  weight: 0.1, size: "Small",
  source: "Loot drop (bears); one of several interchangeable Pottery pelt/skin substitutes for Sealed Poison Vial -- see Low Quality Wolf Skin for the full list",
});

addItem("item:unfired-poison-vial", "Unfired Poison Vial", { weight: 0.1, size: "Tiny" });
addItem("item:poison-vial", "Poison Vial", { weight: 0.1, size: "Tiny", value: "1p 5g (buy)" });
addRecipe("recipe:unfired-poison-vial", "Unfired Poison Vial", 148,
  [{ id: "item:small-block-of-clay" }, { id: "item:low-quality-wolf-skin" }, { id: "item:vial-sketch" }, { id: "item:water-flask" }], "item:unfired-poison-vial", "container:pottery-wheel",
  { levelingGuide: true });
addRecipe("recipe:poison-vial", "Poison Vial", 17,
  [{ id: "item:unfired-poison-vial" }, { id: "item:high-quality-firing-sheet" }], "item:poison-vial", "container:kiln");

addItem("item:unfired-lined-poison-vial", "Unfired Lined Poison Vial", { weight: 0.1, size: "Tiny" });
addItem("item:lined-poison-vial", "Lined Poison Vial", { weight: 0.1, size: "Tiny" });
addRecipe("recipe:unfired-lined-poison-vial", "Unfired Lined Poison Vial", 168,
  [{ id: "item:small-block-of-clay" }, { id: "item:low-quality-wolf-skin" }, { id: "item:lined-vial-sketch" }, { id: "item:water-flask" }], "item:unfired-lined-poison-vial", "container:pottery-wheel",
  { levelingGuide: true });
addRecipe("recipe:lined-poison-vial", "Lined Poison Vial", 17,
  [{ id: "item:unfired-lined-poison-vial" }, { id: "item:high-quality-firing-sheet" }], "item:lined-poison-vial", "container:kiln");

addItem("item:unfired-sealed-poison-vial", "Unfired Sealed Poison Vial", { weight: 0.1, size: "Tiny" });
addItem("item:sealed-poison-vial", "Sealed Poison Vial", { weight: 0.1, size: "Tiny" });
addRecipe("recipe:unfired-sealed-poison-vial", "Unfired Sealed Poison Vial", 188,
  [{ id: "item:small-block-of-clay" }, { id: "item:thick-grizzly-bear-skin" }, { id: "item:sealed-vial-sketch" }, { id: "item:water-flask" }], "item:unfired-sealed-poison-vial", "container:pottery-wheel",
  { levelingGuide: true });
addRecipe("recipe:sealed-poison-vial", "Sealed Poison Vial", 17,
  [{ id: "item:unfired-sealed-poison-vial" }, { id: "item:high-quality-firing-sheet" }], "item:sealed-poison-vial", "container:kiln");

// ---------------------------------------------------------------------
// Velium Vial -- NO DROP, no Water Flask in the Wheel combo (matches its
// own page exactly). Its own further combine into "Vial of Velium Vapors"
// (Thurg Port Pot) is a non-tradeskill combine, not modeled.
// ---------------------------------------------------------------------
addItem("item:crystalline-silk", "Crystalline Silk", { weight: 0.0, size: "Tiny", source: "Loot drop (Crystal Caverns, Thurgadin, Velketor's Labyrinth crystal-type mobs)" });
addItem("item:unfired-velium-vial", "Unfired Velium Vial", { weight: 1.0, size: "Small", noTrade: true });
addItem("item:velium-vial", "Velium Vial", { weight: 1.0, size: "Small", noTrade: true, source: "Combines further into Vial of Velium Vapors (\"Thurg Port Pot\"), a non-tradeskill combine -- not modeled" });
addRecipe("recipe:unfired-velium-vial", "Unfired Velium Vial", 122,
  [{ id: "item:small-brick-of-velium" }, { id: "item:crystalline-silk", quantity: 3 }, { id: "item:glass-shard", quantity: 2 }], "item:unfired-velium-vial", "container:pottery-wheel");
addRecipe("recipe:velium-vial", "Velium Vial", 122,
  [{ id: "item:unfired-velium-vial" }, { id: "item:high-quality-firing-sheet" }], "item:velium-vial", "container:kiln");

// ---------------------------------------------------------------------
// Blank Rune -- LORE ITEM NO TRADE, part of Coldain Shawl #7.
// ---------------------------------------------------------------------
addItem("item:enchanted-velium-powder", "Enchanted Velium Powder", { weight: 0.1, size: "Small", lore: true, source: "Crafted via Baking (No-Fail) in a Mixing Bowl from a Runed Sea Shell and a Small Brick of Velium" });
addItem("item:unfired-rune", "Unfired Rune", { weight: 0.1, size: "Small", lore: true });
addItem("item:blank-rune", "Blank Rune", { weight: 0.1, size: "Small", lore: true, noTrade: true, source: "Part of Coldain Prayer Shawl 7: Runed" });
addRecipe("recipe:unfired-rune", "Unfired Rune", 162,
  [{ id: "item:enchanted-velium-powder" }, { id: "item:water-flask" }], "item:unfired-rune", "container:pottery-wheel");
addRecipe("recipe:blank-rune", "Blank Rune", 15,
  [{ id: "item:unfired-rune" }, { id: "item:high-quality-firing-sheet" }, { id: "item:water-flask" }], "item:blank-rune", "container:kiln");

// ---------------------------------------------------------------------
// Sketch/template/pelt ingredient items + vendors.
// ---------------------------------------------------------------------
addItem("item:skewers-sketch", "Skewers Sketch");
addItem("item:small-jar-sketch", "Small Jar Sketch");
addItem("item:ceramic-lining-sketch", "Ceramic Lining Sketch");
addItem("item:medium-jar-sketch", "Medium Jar Sketch");
addItem("item:cake-round-sketch", "Cake Round Sketch");
addItem("item:large-jar-sketch", "Large Jar Sketch");
addItem("item:pot-sketch", "Pot Sketch");
addItem("item:smoker-sketch", "Smoker Sketch");
addItem("item:animal-template", "Animal Template");
addItem("item:barbarian-template", "Barbarian Template");
addItem("item:gnome-template", "Gnome Template");
addItem("item:troll-template", "Troll Template");
addItem("item:bowl-sketch", "Bowl Sketch");
addItem("item:pie-tin-sketch", "Pie Tin Sketch");
addItem("item:medium-bowl-sketch", "Medium Bowl Sketch");
addItem("item:muffin-tin-sketch", "Muffin Tin Sketch");
addItem("item:large-bowl-sketch", "Large Bowl Sketch");
addItem("item:small-deity-sketch", "Small Deity Sketch");
addItem("item:vial-sketch", "Vial Sketch");
addItem("item:lined-vial-sketch", "Lined Vial Sketch");
addItem("item:sealed-vial-sketch", "Sealed Vial Sketch");
addItem("item:wolfs-eye-agate", "Wolf's Eye Agate", { weight: 0.1, size: "Tiny" });
addItem("item:carnelian", "Carnelian", { weight: 0.1, size: "Tiny", value: "7g 9s 2c" });

// 14-vendor "sketcher" set, reused by every simple single-purpose sketch/template.
const SKETCH_VENDORS: [string, string][] = [
  ["a clockwork sketcher", "Ak'Anon"],
  ["Klok Grots", "East Cabilis"],
  ["Winoyn", "North Freeport"],
  ["Jynsa Smithson", "West Freeport"],
  ["Merchant Nildar", "Greater Faydark"],
  ["Vynugga", "Grobb"],
  ["Skoni", "Halas"],
  ["Min Greyeagle", "Highpass Hold"],
  ["Petra D`Dbth", "Neriak 3rd Gate"],
  ["Kerplooe Dirtcarver", "Oggok"],
  ["Marta Claytoe", "Rivervale"],
  ["Ruru the Cook", "Skyshrine"],
  ["Artist Passia", "Southern Desert of Ro"],
  ["Brina Snowfox", "Thurgadin"],
];
for (const [vendor, zone] of SKETCH_VENDORS) {
  addVendor(vendor, zone, [
    "item:skewers-sketch", "item:small-jar-sketch", "item:medium-jar-sketch", "item:cake-round-sketch",
    "item:large-jar-sketch", "item:pot-sketch", "item:animal-template", "item:barbarian-template",
    "item:gnome-template", "item:troll-template", "item:bowl-sketch", "item:pie-tin-sketch",
    "item:medium-bowl-sketch", "item:large-bowl-sketch", "item:muffin-tin-sketch",
  ]);
}
// Smoker Sketch: same 14-vendor set minus Rivervale's Marta Claytoe.
const SMOKER_SKETCH_VENDORS = SKETCH_VENDORS.filter(([v]) => v !== "Marta Claytoe");
for (const [vendor, zone] of SMOKER_SKETCH_VENDORS) {
  addVendor(vendor, zone, ["item:smoker-sketch"]);
}

// 19-vendor "potter supply" set, reused by Vial/Lined Vial/Sealed Vial
// Sketch and Sculpting Tools (also used by container/deity items above).
const VIAL_SKETCH_VENDORS: [string, string][] = [
  ["a clockwork potter", "Ak'Anon"],
  ["Izbal Brightblaze", "Butcherblock Mountains"],
  ["Klok Hoga", "East Cabilis"],
  ["Merra Clayfinger", "East Commonlands"],
  ["Gurb Smithson", "West Freeport"],
  ["Merchant Legweien", "Greater Faydark"],
  ["Merin", "Halas"],
  ["Winn Greenbane", "Highpass Hold"],
  ["Dooni", "South Kaladim"],
  ["Topper Drodo", "Misty Thicket"],
  ["ChonChon", "Neriak Foreign Quarter"],
  ["Helgara Dirtcarver", "Oggok"],
  ["Tin Merchant VI", "The Overthere"],
  ["Evus Doracmal", "Paineel"], ["Taria Clayspinner", "Paineel"],
  ["Tarnar", "Western Karana"],
  ["Merchant Ulyssa", "Southern Desert of Ro"],
  ["Jaimiou Claypaws", "Stonebrunt Mountains"],
  ["Gilthan Brittleblade", "Thurgadin"],
];
addItem("item:sculpting-tools", "Sculpting Tools", { weight: 0.1, size: "Tiny" });
for (const [vendor, zone] of VIAL_SKETCH_VENDORS) {
  addVendor(vendor, zone, ["item:vial-sketch", "item:sealed-vial-sketch", "item:sculpting-tools"]);
}
// Lined Vial Sketch: same 19 plus Rivervale's Marta Claytoe.
for (const [vendor, zone] of VIAL_SKETCH_VENDORS) {
  addVendor(vendor, zone, ["item:lined-vial-sketch"]);
}
addVendor("Marta Claytoe", "Rivervale", ["item:lined-vial-sketch"]);

// 32-vendor "full potter supply" set: SKETCH_VENDORS union VIAL_SKETCH_VENDORS
// plus Skyshrine's Ruru the Cook. Ceramic Lining Sketch, Small Deity Sketch.
const FULL_POTTER_VENDORS_32: [string, string][] = [
  ...SKETCH_VENDORS,
  ...VIAL_SKETCH_VENDORS,
];
for (const [vendor, zone] of FULL_POTTER_VENDORS_32) {
  addVendor(vendor, zone, ["item:ceramic-lining-sketch", "item:small-deity-sketch"]);
}

// 31-vendor set for Idol Sketch: same union minus Skyshrine's Ruru the Cook
// (already present via SKETCH_VENDORS, so this is FULL_POTTER_VENDORS_32
// filtered down by one).
addItem("item:idol-sketch", "Idol Sketch");
const IDOL_SKETCH_VENDORS = FULL_POTTER_VENDORS_32.filter(([v]) => v !== "Ruru the Cook");
for (const [vendor, zone] of IDOL_SKETCH_VENDORS) {
  addVendor(vendor, zone, ["item:idol-sketch"]);
}

// Wolf's Eye Agate (11 vendors, Felwithe skipped -- zone not catalogued).
const WOLFS_EYE_AGATE_VENDORS: [string, string][] = [
  ["a clockwork merchant", "Ak'Anon"],
  ["Lyth Spellstar", "East Commonlands"],
  ["Frena Runeflash", "Erudin Palace"], ["Harban Ranflash", "Erudin Palace"],
  ["Mekoma Buma", "West Freeport"], ["Lysin Smokkan", "West Freeport"],
  ["Genzal R`Jyen", "Neriak Commons"],
  ["Hanlore Escaval", "South Qeynos"],
  ["Tran Lilspin", "Toxxulia Forest"], ["Cyria Lorewhisper", "Toxxulia Forest"],
];
for (const [vendor, zone] of WOLFS_EYE_AGATE_VENDORS) {
  addVendor(vendor, zone, ["item:wolfs-eye-agate"]);
}

// Carnelian (28 vendors kept, Felwithe x2 + Highpass Keep skipped -- zones
// not catalogued).
const CARNELIAN_VENDORS: [string, string][] = [
  ["a clockwork jeweler", "Ak'Anon"],
  ["Klok Oxmod", "East Cabilis"],
  ["Katha Firespinner", "East Commonlands"],
  ["Frena Runeflash", "Erudin Palace"], ["Anite Gemcutter", "Erudin Palace"], ["Glysin Denuen", "Erudin Palace"],
  ["Myrcin Denuen", "Erudin Palace"], ["Elbsin Denuen", "Erudin Palace"],
  ["Drake Mountainstorm", "Firiona Vie"],
  ["Aimie Moonspin", "North Freeport"], ["Jade", "North Freeport"],
  ["Lysin Smokkan", "West Freeport"],
  ["Merchant Laedar", "Greater Faydark"],
  ["Rezslog", "Grobb"], ["Uzak", "Grobb"],
  ["Coldain Outcast", "Icewell Keep"],
  ["Banaf Norkhitter", "North Kaladim"],
  ["Nekola N`Ryt", "Neriak Commons"],
  ["Telnor D`Unnar", "Neriak 3rd Gate"],
  ["Tran", "Oasis of Marr"], ["Innkeep Tizzy", "Oasis of Marr"],
  ["Svena Ironforge", "North Qeynos"],
  ["Darfumpel Zirubbel", "Rathe Mountains"],
  ["Smith Tv`ysa", "Southern Desert of Ro"], ["Rathmana Allin", "Southern Desert of Ro"],
  ["Torodrane Frompwaddle", "Steamfont Mountains"],
  ["Meg Tucter", "Thurgadin"],
  ["Cyria Lorewhisper", "Toxxulia Forest"],
];
for (const [vendor, zone] of CARNELIAN_VENDORS) {
  addVendor(vendor, zone, ["item:carnelian"]);
}

// Poison Vial family -- all three share the same 5-vendor set.
const POISON_VIAL_VENDORS: [string, string][] = [
  ["Conium Darkblade", "Dagnor's Cauldron"],
  ["Brak Daggermist", "Firiona Vie"],
  ["Nubs Blackgranite", "Lake of Ill Omen"],
  ["Toxdil", "West Freeport"],
  ["Gindlin Toxfodder", "Western Karana"],
];
for (const [vendor, zone] of POISON_VIAL_VENDORS) {
  addVendor(vendor, zone, ["item:poison-vial", "item:lined-poison-vial", "item:sealed-poison-vial"]);
}

// Mixing Bowl (27 vendors) -- item already exists; adding its own vendors
// since migration 375/Baking never did.
const MIXING_BOWL_VENDORS: [string, string][] = [
  ["a clockwork baker", "Ak'Anon"],
  ["Klok Unlar", "East Cabilis"],
  ["Beth Breadmaker", "Erudin"], ["Helia BlueHawk", "Erudin"],
  ["Bup", "The Feerrott"],
  ["Glinya Sweetpie", "Firiona Vie"],
  ["Rashinda Elore", "North Freeport"],
  ["Olyna Mudel", "West Freeport"], ["Pincia Brownloe", "West Freeport"],
  ["Teria O`Danos", "Halas"],
  ["Baker Jena", "High Keep"],
  ["Tissin Greybloom", "North Kaladim"], ["Serenk Greybloom", "North Kaladim"],
  ["Tal Drana", "Neriak Foreign Quarter"], ["Sal Drana", "Neriak Foreign Quarter"],
  ["Niz L`Crit", "Neriak Commons"],
  ["Gorng Alusnein", "Paineel"], ["Iva Tersala", "Paineel"],
  ["Henina Miller", "Western Karana"], ["Cleet Miller Jr", "Western Karana"],
  ["Karn Tassen", "South Qeynos"], ["Voleen Tassen", "South Qeynos"],
  ["Bartle Barnick", "Rivervale"],
  ["Grudash the Baker", "Skyshrine"], ["Ruru the Cook", "Skyshrine"],
  ["Petcas Coldbeard", "Thurgadin"],
];
for (const [vendor, zone] of MIXING_BOWL_VENDORS) {
  addVendor(vendor, zone, ["container:mixing-bowl"]);
}
// RunnyEye Citadel's "A goblin merchant" -- zone not catalogued in this graph.
skippedVendors.push("A goblin merchant (RunnyEye Citadel) -- zone not catalogued in this graph");

save();
console.log(`Migration 410 complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s), ${vendorsAdded} new vendor npc(s), ${sellsEdgesAdded} sells edge(s) added for Pottery's Basic recipe list`);
if (skippedVendors.length) {
  console.log(`Skipped ${skippedVendors.length} vendor row(s) (zone not catalogued):`);
  for (const s of skippedVendors) console.log(`  - ${s}`);
}
