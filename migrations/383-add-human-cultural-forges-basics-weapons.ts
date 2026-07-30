/**
 * Migration 383: Human Cultural Tradeskills (issue #65), first pass -- the
 * two cultural forges, the ore/sheet-metal precursor chain, and the
 * Weapons/Shields catalogs from both Freeport and Qeynos smithing.
 *
 * Sourced from eqlwiki.com's "Cultural Tradeskills: Human" page raw
 * wikitext (`action=query&prop=revisions`, not the summarized fetch),
 * cross-checked against each precursor item's own page for exact
 * trivial/component/yield data and sourcing.
 *
 * Two forges, not one: humans have a Freeport (Antonican) and a Qeynos
 * (Royal Qeynos) cultural forge, and "must use the proper forge with the
 * proper recipe" per the page's own text -- these are new `container`
 * nodes distinct from the generic `container:forge` regular Blacksmithing
 * already uses (decisions/tradeskill-recipe-node-schema.md's "container"
 * pattern), since recipes here are gated to a specific cultural forge, not
 * "any forge, many locations" like Blacksmithing's own.
 *
 * The page's own top-of-section "Basics" (High Quality Ore chain) carries
 * an explicit author note: "Not positive on the separation of these
 * basics for Qeynos-cultural or Freeport-cultural forges" -- modeled as
 * craftable at *both* cultural forges rather than guessing one. Qeynos's
 * own "Qeynos Basics" carries a different uncertainty ("Not sure if these
 * basics are normal forge or Qeynos-cultural forge") -- modeled at the
 * existing generic `container:forge` instead of Royal Qeynos Forge, since
 * the doubt is about cultural-exclusivity, not which cultural forge.
 *
 * Block of Enchanted Ore and Enchanted Folded Sheet Metal appear in both
 * the Freeport and Qeynos basics tables with identical components/trivial
 * -- one recipe node, `crafted_in` edges to both forges, not two
 * duplicate recipes.
 *
 * Vendor data included only where a precursor item's own eqlwiki page
 * showed one (Mar Sedder, South Qeynos, selling Small Brick of High
 * Quality Ore). Everything else -- molds, gems, Leather Padding, base
 * Chain Jointing -- follows migration 373's own precedent of deferring
 * vendor sourcing to a follow-up pass; this pass is about getting the
 * recipe/ingredient graph right first.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

let recipesAdded = 0;
let itemsAdded = 0;
let containersAdded = 0;
let vendorsAdded = 0;
let sellsEdgesAdded = 0;

function addItem(id: string, label: string, opts: Record<string, unknown> = {}) {
  if (hasNode(id)) return;
  addNode({ id, label, type: "item", ...opts });
  itemsAdded++;
}

function addContainer(id: string, label: string, zoneId: string) {
  if (hasNode(id)) return;
  addNode({ id, label, type: "container" });
  addEdge(id, zoneId, "located_in");
  containersAdded++;
}

interface Ingredient {
  id: string;
  quantity?: number;
}

function addRecipe(
  id: string,
  label: string,
  trivial: number | undefined,
  uses: Ingredient[],
  produces: string,
  craftedIn: string[],
  produceQty?: number
) {
  const node: Record<string, unknown> = { id, label, type: "recipe", tradeskill: "Blacksmithing" };
  if (trivial !== undefined) node.trivial = trivial;
  addNode(node);
  recipesAdded++;
  for (const ing of uses) {
    addEdge(id, ing.id, "uses", ing.quantity && ing.quantity !== 1 ? { quantity: ing.quantity } : undefined);
  }
  addEdge(id, produces, "produces", produceQty && produceQty !== 1 ? { quantity: produceQty } : undefined);
  for (const c of craftedIn) addEdge(id, c, "crafted_in");
}

function addVendor(vendorLabel: string, zoneId: string, sells: string[]) {
  const npcId = `npc:${slug(vendorLabel)}`;
  if (!hasNode(npcId)) {
    addNode({ id: npcId, label: vendorLabel, type: "npc", roles: ["vendor"] });
    addEdge(npcId, zoneId, "located_in");
    vendorsAdded++;
  }
  for (const itemId of sells) {
    addEdge(npcId, itemId, "sells");
    sellsEdgesAdded++;
  }
}

// ---------------------------------------------------------------------
// Cultural forges
// ---------------------------------------------------------------------
const ANTONICAN_FORGE = "container:antonican-forge";
const ROYAL_QEYNOS_FORGE = "container:royal-qeynos-forge";
addContainer(ANTONICAN_FORGE, "Antonican Forge", "zone:west-freeport");
addContainer(ROYAL_QEYNOS_FORGE, "Royal Qeynos Forge", "zone:south-qeynos");

// ---------------------------------------------------------------------
// High Quality Ore chain -- top-of-page "Basics", forge unconfirmed
// between the two cultural forges (see docblock), modeled at both.
// ---------------------------------------------------------------------
addItem("item:small-piece-of-high-quality-ore", "Small Piece of High Quality Ore", {
  weight: 0.5, size: "Small", source: "Drops from Goblin Janitor in Runnyeye",
});
addItem("item:large-brick-of-high-quality-ore", "Large Brick of High Quality Ore", {
  weight: 14, size: "Small",
  source: "Drops from goblins in High Keep, Permafrost, Solusek's Eye, and Runnyeye; no longer drops as of 2/10/19 per eqlwiki",
});
addItem("item:small-brick-of-high-quality-ore", "Small Brick of High Quality Ore", {
  weight: 7, size: "Small",
  source: "Crafted via Blacksmithing (trivial 27, yield 2) from 3x Small Piece of High Quality Ore + Water Flask; also drops from goblins; also sold by Mar Sedder in South Qeynos",
});
addItem("item:block-of-high-quality-ore", "Block of High Quality Ore", {
  weight: 18, size: "Small", source: "Crafted via Blacksmithing (trivial 55) from 3x Large Brick of High Quality Ore + Water Flask",
});
addItem("item:high-quality-sheet-metal", "High Quality Sheet Metal", {
  weight: 15, size: "Small", source: "Crafted via Blacksmithing (trivial 36) from 2x Small Brick of High Quality Ore + Water Flask",
});

addRecipe("recipe:small-brick-of-high-quality-ore", "Small Brick of High Quality Ore", 27,
  [{ id: "item:small-piece-of-high-quality-ore", quantity: 3 }, { id: "item:water-flask" }],
  "item:small-brick-of-high-quality-ore", [ANTONICAN_FORGE, ROYAL_QEYNOS_FORGE], 2);
addRecipe("recipe:block-of-high-quality-ore", "Block of High Quality Ore", 55,
  [{ id: "item:large-brick-of-high-quality-ore", quantity: 3 }, { id: "item:water-flask" }],
  "item:block-of-high-quality-ore", [ANTONICAN_FORGE, ROYAL_QEYNOS_FORGE]);
addRecipe("recipe:high-quality-sheet-metal", "High Quality Sheet Metal", 36,
  [{ id: "item:small-brick-of-high-quality-ore", quantity: 2 }, { id: "item:water-flask" }],
  "item:high-quality-sheet-metal", [ANTONICAN_FORGE, ROYAL_QEYNOS_FORGE]);

addVendor("Mar Sedder", "zone:south-qeynos", ["item:small-brick-of-high-quality-ore"]);

// ---------------------------------------------------------------------
// Freeport Forge Basics (Enchanted Ore chain + folded sheet metals)
// ---------------------------------------------------------------------
addItem("item:high-quality-folded-sheet-metal", "High Quality Folded Sheet Metal", {
  weight: 15, size: "Small", source: "Crafted via Blacksmithing (trivial 39) from a Smithy Hammer + Block of High Quality Ore + Water Flask",
});
addItem("item:small-brick-of-enchanted-ore", "Small Brick of Enchanted Ore", {
  weight: 7, size: "Small", source: "Crafted via Blacksmithing (trivial 21, yield 3) from a Large Brick of Enchanted Ore + Water Flask",
});
addItem("item:large-brick-of-enchanted-ore", "Large Brick of Enchanted Ore", {
  weight: 14, size: "Small", source: "Created from a Large Brick of High Quality Ore via the Enchant Steel spell",
});
addItem("item:enchanted-sheet-metal", "Enchanted Sheet Metal", {
  weight: 15, size: "Small", source: "Crafted via Blacksmithing (trivial 42) from 2x Small Brick of Enchanted Ore + Water Flask",
});
addItem("item:block-of-enchanted-ore", "Block of Enchanted Ore", {
  weight: 18, size: "Small", source: "Crafted via Blacksmithing (trivial 32) from 3x Large Brick of Enchanted Ore + Water Flask",
});
addItem("item:enchanted-folded-sheet-metal", "Enchanted Folded Sheet Metal", {
  weight: 15, size: "Small", source: "Crafted via Blacksmithing (trivial 44) from a Water Flask + Smithy Hammer + Block of Enchanted Ore",
});

addRecipe("recipe:high-quality-folded-sheet-metal", "High Quality Folded Sheet Metal", 39,
  [{ id: "item:smithy-hammer" }, { id: "item:block-of-high-quality-ore" }, { id: "item:water-flask" }],
  "item:high-quality-folded-sheet-metal", [ANTONICAN_FORGE]);
addRecipe("recipe:small-brick-of-enchanted-ore", "Small Brick of Enchanted Ore", 21,
  [{ id: "item:large-brick-of-enchanted-ore" }, { id: "item:water-flask" }],
  "item:small-brick-of-enchanted-ore", [ANTONICAN_FORGE], 3);
addRecipe("recipe:enchanted-sheet-metal", "Enchanted Sheet Metal", 42,
  [{ id: "item:small-brick-of-enchanted-ore", quantity: 2 }, { id: "item:water-flask" }],
  "item:enchanted-sheet-metal", [ANTONICAN_FORGE]);
addRecipe("recipe:block-of-enchanted-ore", "Block of Enchanted Ore", 32,
  [{ id: "item:large-brick-of-enchanted-ore", quantity: 3 }, { id: "item:water-flask" }],
  "item:block-of-enchanted-ore", [ANTONICAN_FORGE, ROYAL_QEYNOS_FORGE]);
addRecipe("recipe:enchanted-folded-sheet-metal", "Enchanted Folded Sheet Metal", 44,
  [{ id: "item:block-of-enchanted-ore" }, { id: "item:smithy-hammer" }, { id: "item:water-flask" }],
  "item:enchanted-folded-sheet-metal", [ANTONICAN_FORGE, ROYAL_QEYNOS_FORGE]);

// ---------------------------------------------------------------------
// Freeport Weapons and Shields
// ---------------------------------------------------------------------
addItem("item:medium-quality-sheet-metal", "Medium Quality Sheet Metal");
addItem("item:medium-quality-folded-sheet-metal", "Medium Quality Folded Sheet Metal");
addItem("item:spear-head-mold", "Spear Head Mold");
addItem("item:dagger-blade-mold", "Dagger Blade Mold");
addItem("item:hilt-mold", "Hilt Mold");
addItem("item:pommel-mold", "Pommel Mold");
addItem("item:curved-blade-mold", "Curved Blade Mold");
addItem("item:buckler-mold", "Buckler Mold");
addItem("item:black-pearl", "Black Pearl");
addItem("item:flawless-aquamarine", "Flawless Aquamarine");

addItem("item:seafarers-harpoon", "Seafarers Harpoon", { source: "Crafted via Blacksmithing (trivial 112) at the Antonican Forge" });
addItem("item:seafarers-dirk", "Seafarers Dirk", { source: "Crafted via Blacksmithing (trivial 95) at the Antonican Forge" });
addItem("item:seafarers-cutlass", "Seafarers Cutlass", { source: "Crafted via Blacksmithing (trivial 115) at the Antonican Forge" });
addItem("item:seafarers-buckler-shield", "Seafarers Buckler Shield", { source: "Crafted via Blacksmithing (trivial 88) at the Antonican Forge" });
addItem("item:enchanted-seafarers-cutlass", "Enchanted Seafarers Cutlass", { source: "Crafted via Blacksmithing (trivial 142) at the Antonican Forge" });
addItem("item:enchanted-seafarers-dirk", "Enchanted Seafarers Dirk", { source: "Crafted via Blacksmithing (trivial 122) at the Antonican Forge" });
addItem("item:enchanted-seafarers-harpoon", "Enchanted Seafarers Harpoon", { source: "Crafted via Blacksmithing (trivial 139) at the Antonican Forge" });

addRecipe("recipe:seafarers-harpoon", "Seafarers Harpoon", 112,
  [{ id: "item:medium-quality-sheet-metal" }, { id: "item:oak-shaft" }, { id: "item:spear-head-mold" }, { id: "item:water-flask" }],
  "item:seafarers-harpoon", [ANTONICAN_FORGE]);
addRecipe("recipe:seafarers-dirk", "Seafarers Dirk", 95,
  [{ id: "item:medium-quality-sheet-metal" }, { id: "item:dagger-blade-mold" }, { id: "item:hilt-mold" }, { id: "item:pommel-mold" }, { id: "item:water-flask" }],
  "item:seafarers-dirk", [ANTONICAN_FORGE]);
addRecipe("recipe:seafarers-cutlass", "Seafarers Cutlass", 115,
  [{ id: "item:medium-quality-folded-sheet-metal" }, { id: "item:curved-blade-mold" }, { id: "item:hilt-mold" }, { id: "item:pommel-mold" }, { id: "item:water-flask" }],
  "item:seafarers-cutlass", [ANTONICAN_FORGE]);
addRecipe("recipe:seafarers-buckler-shield", "Seafarers Buckler Shield", 88,
  [{ id: "item:smithy-hammer" }, { id: "item:high-quality-sheet-metal" }, { id: "item:buckler-mold" }, { id: "item:water-flask" }],
  "item:seafarers-buckler-shield", [ANTONICAN_FORGE]);
addRecipe("recipe:enchanted-seafarers-cutlass", "Enchanted Seafarers Cutlass", 142,
  [{ id: "item:enchanted-folded-sheet-metal" }, { id: "item:black-pearl" }, { id: "item:curved-blade-mold" }, { id: "item:hilt-mold" }, { id: "item:pommel-mold" }, { id: "item:sea-temper" }],
  "item:enchanted-seafarers-cutlass", [ANTONICAN_FORGE]);
addRecipe("recipe:enchanted-seafarers-dirk", "Enchanted Seafarers Dirk", 122,
  [{ id: "item:enchanted-sheet-metal" }, { id: "item:black-pearl" }, { id: "item:dagger-blade-mold" }, { id: "item:hilt-mold" }, { id: "item:pommel-mold" }, { id: "item:sea-temper" }],
  "item:enchanted-seafarers-dirk", [ANTONICAN_FORGE]);
addRecipe("recipe:enchanted-seafarers-harpoon", "Enchanted Seafarers Harpoon", 139,
  [{ id: "item:enchanted-sheet-metal" }, { id: "item:flawless-aquamarine" }, { id: "item:oak-shaft" }, { id: "item:spear-head-mold" }, { id: "item:sea-temper" }],
  "item:enchanted-seafarers-harpoon", [ANTONICAN_FORGE]);

// ---------------------------------------------------------------------
// Qeynos Basics -- page's own note doubts cultural-exclusivity, modeled
// at the generic container:forge instead of Royal Qeynos Forge.
// ---------------------------------------------------------------------
addItem("item:high-quality-metal-rings", "High Quality Metal Rings", {
  source: "Crafted via Blacksmithing (trivial 46) from a Large Brick of High Quality Ore + Water Flask + File",
});
addItem("item:enchanted-metal-rings", "Enchanted Metal Rings");
addItem("item:enchanted-chain-jointing", "Enchanted Chain Jointing", {
  source: "Crafted via Blacksmithing (trivial 106) from Enchanted Metal Rings + Water Flask + Smithy Hammer + File",
});
addItem("item:file", "File");

addRecipe("recipe:high-quality-metal-rings", "High Quality Metal Rings", 46,
  [{ id: "item:large-brick-of-high-quality-ore" }, { id: "item:water-flask" }, { id: "item:file" }],
  "item:high-quality-metal-rings", ["container:forge"]);
addRecipe("recipe:enchanted-chain-jointing", "Enchanted Chain Jointing", 106,
  [{ id: "item:enchanted-metal-rings" }, { id: "item:water-flask" }, { id: "item:smithy-hammer" }, { id: "item:file" }],
  "item:enchanted-chain-jointing", ["container:forge"]);

// ---------------------------------------------------------------------
// Qeynos Weapons
// ---------------------------------------------------------------------
addItem("item:folded-sheet-metal", "Folded Sheet Metal");
addItem("item:long-blade-mold", "Long Blade Mold");
addItem("item:javelin-mold", "Javelin Mold");
// Fire Emerald / Star Ruby already exist (item:fire-emerald-ulthork,
// item:star-ruby-ulthork) from an earlier quest-reward migration -- same
// real gem, reused directly rather than creating a duplicate node.

addItem("item:antonian-javelin", "Antonian Javelin", { source: "Crafted via Blacksmithing (trivial 112) at the Royal Qeynos Forge" });
addItem("item:antonian-long-sword", "Antonian Long Sword", { source: "Crafted via Blacksmithing (trivial 125) at the Royal Qeynos Forge" });
addItem("item:enchanted-antonian-long-sword-fire-emerald", "Enchanted Antonian Long Sword (Fire Emerald)", { source: "Crafted via Blacksmithing (trivial 142) at the Royal Qeynos Forge" });
addItem("item:enchanted-antonian-long-sword-star-ruby", "Enchanted Antonian Long Sword (Star Ruby)", { source: "Crafted via Blacksmithing (trivial 142) at the Royal Qeynos Forge" });

addRecipe("recipe:antonian-javelin", "Antonian Javelin", 112,
  [{ id: "item:medium-quality-sheet-metal" }, { id: "item:javelin-mold" }, { id: "item:water-flask" }],
  "item:antonian-javelin", [ROYAL_QEYNOS_FORGE]);
addRecipe("recipe:antonian-long-sword", "Antonian Long Sword", 125,
  [{ id: "item:folded-sheet-metal" }, { id: "item:long-blade-mold" }, { id: "item:hilt-mold" }, { id: "item:pommel-mold" }, { id: "item:water-flask" }],
  "item:antonian-long-sword", [ROYAL_QEYNOS_FORGE]);
addRecipe("recipe:enchanted-antonian-long-sword-fire-emerald", "Enchanted Antonian Long Sword (Fire Emerald)", 142,
  [{ id: "item:enchanted-folded-sheet-metal" }, { id: "item:fire-emerald-ulthork" }, { id: "item:long-blade-mold" }, { id: "item:hilt-mold" }, { id: "item:pommel-mold" }, { id: "item:royal-temper" }],
  "item:enchanted-antonian-long-sword-fire-emerald", [ROYAL_QEYNOS_FORGE]);
addRecipe("recipe:enchanted-antonian-long-sword-star-ruby", "Enchanted Antonian Long Sword (Star Ruby)", 142,
  [{ id: "item:enchanted-folded-sheet-metal" }, { id: "item:star-ruby-ulthork" }, { id: "item:long-blade-mold" }, { id: "item:hilt-mold" }, { id: "item:pommel-mold" }, { id: "item:royal-temper" }],
  "item:enchanted-antonian-long-sword-star-ruby", [ROYAL_QEYNOS_FORGE]);
addEdge("recipe:enchanted-antonian-long-sword-fire-emerald", "recipe:enchanted-antonian-long-sword-star-ruby", "variant_of");

save();
console.log(
  `Migration 383 complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s), ${containersAdded} container(s), ` +
  `${vendorsAdded} vendor(s), ${sellsEdgesAdded} sells edge(s) added for Human Cultural Tradeskills`
);
