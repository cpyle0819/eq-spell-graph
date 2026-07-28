/**
 * Migration 356: model the Brew Barrel as Brewing's `container` node --
 * see decisions/tradeskill-recipe-node-schema.md for why this is a distinct
 * node type/edge from the `uses`-edge Bottle/Cask/Shotglass ingredients
 * migration 355 already added (those stay as-is, unchanged here).
 *
 * eqlwiki.com's own Brew Barrel page: "A brew barrel is a stationary object
 * with which players can interact in order to attempt a Brewing recipe.
 * They are available in many locations around Norrath." Skill Brewing's own
 * basics section: "All combines are made in a brew barrel which can be
 * found in most towns."
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const BREWING_RECIPE_IDS = [
  "recipe:bog-juice",
  "recipe:short-beer",
  "recipe:heady-kiola",
  "recipe:short-ale",
  "recipe:fish-wine",
  "recipe:ale",
  "recipe:gnomish-spirits",
  "recipe:ol-tujims-fierce-brew",
  "recipe:ginesh",
  "recipe:faydwer-shaker",
  "recipe:minotaur-heros-brew",
];

let containersAdded = 0;
let edgesAdded = 0;

if (!hasNode("container:brew-barrel")) {
  addNode({
    id: "container:brew-barrel",
    label: "Brew Barrel",
    type: "container",
    source: "Stationary object found in most towns; interact with it to attempt a Brewing recipe.",
  });
  containersAdded++;
}

for (const recipeId of BREWING_RECIPE_IDS) {
  addEdge(recipeId, "container:brew-barrel", "crafted_in");
  edgesAdded++;
}

save();
console.log(`Migration 356 complete: ${containersAdded} container(s), ${edgesAdded} crafted_in edge(s) added for Brewing`);
