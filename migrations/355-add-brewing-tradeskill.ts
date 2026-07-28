/**
 * Migration 355: model Brewing as the first tradeskill (issue #32), via the
 * new `recipe` node type and `uses`/`produces` edges — see decisions/
 * tradeskill-recipe-node-schema.md for the schema and sourcing method.
 *
 * Recipes are eqlwiki.com's "Skill Brewing" page's own "Antonica Biased
 * Brewers" leveling path (11 stops, triv 21 through 248) — the bold/
 * unskippable steps plus the non-bold optional ones in between, i.e. the
 * whole path as written, not just the bold subset. Ingredient/trivial/
 * container/yield data and each ingredient's own vendor list came from the
 * wiki's raw wikitext via its MediaWiki API (not WebFetch's summarizer).
 *
 * item:water-flask and item:mead already existed (quest-reward and
 * tavern-vendor items respectively) — reused as-is rather than duplicated.
 * npc:south-qeynos:captain-rohand and npc:south-qeynos:karn-tassen already
 * existed as quest_giver npcs — given an added "vendor" role and sells
 * edges rather than duplicated under a new id.
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

let recipesAdded = 0;
let itemsAdded = 0;
let npcsAdded = 0;

function addItem(id: string, label: string, opts: { weight?: number; size?: string; source?: string } = {}) {
  if (hasNode(id)) return;
  addNode({ id, label, type: "item", ...opts });
  itemsAdded++;
}

interface Ingredient {
  id: string;
  quantity?: number;
}

function addRecipe(id: string, label: string, trivial: number, uses: Ingredient[], produces: string) {
  addNode({ id, label, type: "recipe", tradeskill: "Brewing", trivial });
  recipesAdded++;
  for (const ing of uses) {
    addEdge(id, ing.id, "uses", ing.quantity && ing.quantity !== 1 ? { quantity: ing.quantity } : undefined);
  }
  addEdge(id, produces, "produces");
}

// Base ingredients/containers -- weight/size straight off each item's own
// eqlwiki.com page (WT/Size in its statsblock). Rat Ears and Vegetables get
// no `sells` edges below (their own pages have no `soldby` table at all --
// loot/forage only), consistent with the rest of this batch.
addItem("item:snake-scales", "Snake Scales", { weight: 0.1, size: "Small", source: "Dropped by snakes across many zones" });
addItem("item:barley", "Barley", { weight: 0.2, size: "Small" });
addItem("item:hops", "Hops", { weight: 0.2, size: "Small" });
addItem("item:malt", "Malt", { weight: 0.1, size: "Small" });
addItem("item:packet-of-kiola-sap", "Packet of Kiola Sap", { weight: 0.1, size: "Small" });
addItem("item:grapes", "Grapes", { weight: 0.1, size: "Small" });
addItem("item:fresh-fish", "Fresh Fish", { weight: 1.0, size: "Small" });
addItem("item:rice", "Rice", { weight: 0.1, size: "Small" });
addItem("item:spider-legs", "Spider Legs", { weight: 0.5, size: "Small", source: "Dropped by spiders across many zones" });
addItem("item:rat-ears", "Rat Ears", { weight: 0.1, size: "Small", source: "Dropped by rats across many zones" });
addItem("item:yeast", "Yeast", { weight: 0.2, size: "Small" });
addItem("item:vegetables", "Vegetables", { weight: 0.6, size: "Small", source: "Foraged" });
addItem("item:dwarven-ale", "Dwarven Ale", { weight: 0.4, size: "Small", source: "Vendor-purchased only -- no known player recipe" });
addItem("item:elven-wine", "Elven Wine", { weight: 0.4, size: "Small" });
addItem("item:bottle", "Bottle", { weight: 0.1, size: "Small" });
addItem("item:cask", "Cask", { weight: 0.1, size: "Small" });
addItem("item:shotglass", "Shotglass", { weight: 0.1, size: "Small" });

// Recipe-produced items -- Short Beer and Gnomish Spirits double as
// ingredients further up this same leveling path (Ginesh/Minotaur Hero's
// Brew, Faydwer Shaker), same as any other item node.
addItem("item:bog-juice", "Bog Juice", { source: "Brewed via Brewing (trivial 21) -- Quest Item" });
addItem("item:short-beer", "Short Beer", { source: "Brewed via Brewing (trivial 31)" });
addItem("item:heady-kiola", "Heady Kiola", { source: "Brewed via Brewing (trivial 46) -- used in Tailoring" });
addItem("item:short-ale", "Short Ale", { source: "Brewed via Brewing (trivial 51)" });
addItem("item:fish-wine", "Fish Wine", { source: "Brewed via Brewing (trivial 62)" });
addItem("item:ale", "Ale", { source: "Brewed via Brewing (trivial 68)" });
addItem("item:gnomish-spirits", "Gnomish Spirits", { source: "Brewed via Brewing (trivial 102)" });
addItem("item:ol-tujims-fierce-brew", "Ol'Tujim's Fierce Brew", { source: "Brewed via Brewing (trivial 135) -- Quest Item" });
addItem("item:ginesh", "Ginesh", { source: "Brewed via Brewing (trivial 168)" });
addItem("item:faydwer-shaker", "Faydwer Shaker", { source: "Brewed via Brewing (trivial 188)" });
addItem("item:minotaur-heros-brew", "Minotaur Hero's Brew", { source: "Brewed via Brewing (trivial 248) -- Quest Item" });

addRecipe("recipe:bog-juice", "Bog Juice", 21,
  [{ id: "item:water-flask" }, { id: "item:snake-scales" }, { id: "item:bottle" }], "item:bog-juice");
addRecipe("recipe:short-beer", "Short Beer", 31,
  [{ id: "item:barley" }, { id: "item:hops" }, { id: "item:malt" }, { id: "item:cask" }], "item:short-beer");
addRecipe("recipe:heady-kiola", "Heady Kiola", 46,
  [{ id: "item:packet-of-kiola-sap", quantity: 2 }, { id: "item:water-flask" }, { id: "item:bottle" }], "item:heady-kiola");
addRecipe("recipe:short-ale", "Short Ale", 51,
  [{ id: "item:barley" }, { id: "item:hops" }, { id: "item:water-flask" }, { id: "item:cask" }], "item:short-ale");
addRecipe("recipe:fish-wine", "Fish Wine", 62,
  [{ id: "item:water-flask" }, { id: "item:grapes" }, { id: "item:fresh-fish" }, { id: "item:bottle" }], "item:fish-wine");
addRecipe("recipe:ale", "Ale", 68,
  [{ id: "item:barley" }, { id: "item:malt" }, { id: "item:water-flask" }, { id: "item:cask" }], "item:ale");
addRecipe("recipe:gnomish-spirits", "Gnomish Spirits", 102,
  [{ id: "item:rice" }, { id: "item:spider-legs" }, { id: "item:rat-ears" }, { id: "item:bottle" }], "item:gnomish-spirits");
addRecipe("recipe:ol-tujims-fierce-brew", "Ol'Tujim's Fierce Brew", 135,
  [{ id: "item:barley" }, { id: "item:hops" }, { id: "item:yeast" }, { id: "item:malt" }, { id: "item:cask" }], "item:ol-tujims-fierce-brew");
addRecipe("recipe:ginesh", "Ginesh", 168,
  [{ id: "item:vegetables" }, { id: "item:water-flask" }, { id: "item:short-beer" }, { id: "item:shotglass" }], "item:ginesh");
addRecipe("recipe:faydwer-shaker", "Faydwer Shaker", 188,
  [{ id: "item:dwarven-ale" }, { id: "item:elven-wine" }, { id: "item:gnomish-spirits" }, { id: "item:mead" }, { id: "item:cask" }], "item:faydwer-shaker");
addRecipe("recipe:minotaur-heros-brew", "Minotaur Hero's Brew", 248,
  [{ id: "item:malt", quantity: 3 }, { id: "item:short-beer", quantity: 2 }, { id: "item:water-flask", quantity: 2 }, { id: "item:yeast" }, { id: "item:cask" }], "item:minotaur-heros-brew");

// Vendors, sourced from each ingredient item's own eqlwiki.com page's
// `soldby` table -- one representative vendor per zone actually cataloged
// in this graph already, not every merchant the wiki lists.
function addVendor(id: string, label: string, zoneId: string, sells: string[]) {
  if (!hasNode(id)) {
    addNode({ id, label, type: "npc", roles: ["vendor"] });
    addEdge(id, zoneId, "located_in");
    npcsAdded++;
  }
  for (const itemId of sells) addEdge(id, itemId, "sells");
}

addVendor("npc:field-of-bone:klok-acet", "Klok Acet", "zone:field-of-bone", ["item:snake-scales"]);
addVendor("npc:east-freeport:rolfic-gohar", "Rolfic Gohar", "zone:east-freeport", ["item:water-flask", "item:fresh-fish"]);
addVendor("npc:east-freeport:henna-treghost", "Henna Treghost", "zone:east-freeport", ["item:dwarven-ale", "item:elven-wine", "item:mead"]);
addVendor("npc:east-freeport:cloud-alemaker", "Cloud Alemaker", "zone:east-freeport", ["item:grapes", "item:bottle", "item:cask", "item:shotglass", "item:packet-of-kiola-sap"]);
addVendor("npc:west-freeport:krystin-charcoal", "Krystin Charcoal", "zone:west-freeport", ["item:barley", "item:hops", "item:malt", "item:rice", "item:yeast", "item:bottle", "item:cask", "item:shotglass", "item:grapes", "item:packet-of-kiola-sap"]);
addVendor("npc:south-qeynos:heidi-grainsifter", "Heidi Grainsifter", "zone:south-qeynos", ["item:barley", "item:hops", "item:malt", "item:rice", "item:yeast"]);
addVendor("npc:south-qeynos:sunsa-jocub", "Sunsa Jocub", "zone:south-qeynos", ["item:bottle", "item:cask", "item:shotglass", "item:packet-of-kiola-sap", "item:grapes", "item:mead"]);

// Existing quest_giver npcs, given an added vendor role -- see this file's
// own header.
for (const [id, sells] of [
  ["npc:south-qeynos:captain-rohand", ["item:fresh-fish"]],
  ["npc:south-qeynos:karn-tassen", ["item:water-flask"]],
] as [string, string[]][]) {
  const node = graph.nodes.find((n: { id: string }) => n.id === id);
  if (node && !(node.roles as string[]).includes("vendor")) (node.roles as string[]).push("vendor");
  for (const itemId of sells) addEdge(id, itemId, "sells");
}

save();
console.log(`Migration 355 complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s), ${npcsAdded} new vendor npc(s) added for Brewing`);
