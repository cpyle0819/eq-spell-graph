/**
 * Migration 400: adds a `category` field to every item/container node that
 * actually has a `sells` edge (127 of them) -- issue: Vendors page needs a
 * Type filter, and "type" has to be a real per-item fact, not guessed from
 * stat shape at read time. Scoped to sold nodes only: the other ~2,390 item
 * nodes (drops/quest rewards never sold by any vendor) have no bearing on
 * what a vendor's Type filter can offer, so they're left uncategorized.
 *
 * Three categories, picked to match what's actually in the sold set today
 * (a "Weapons" bucket would be empty -- nothing with damage/skill has a
 * sells edge yet):
 *   - Armor: the 3 vendor-sellable shields (Secondary slot, real AC/classes)
 *   - Adventuring Supplies: general-purpose consumables an adventurer (not
 *     a crafter) buys -- food, drink, bandages, fishing bait
 *   - Tradeskill Supplies: everything else -- raw materials, blacksmithing
 *     molds/tools, brewing/baking ingredients, portable tradeskill
 *     containers (Mixing Bowl, Spit)
 *
 * Several of these (Water Flask, Elven Wine, Mead) are *also* consumed as
 * recipe ingredients elsewhere in the graph -- category reflects the item's
 * primary real-world identity to a player, not "is it ever a `uses` edge
 * target," since nearly everything sold is technically that.
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, updateNode, save } = loadGraph(import.meta.dir);

const ARMOR = ["item:kite-shield", "item:targ-shield", "item:tower-shield"];

const ADVENTURING_SUPPLIES = [
  "item:bandages",
  "item:ration",
  "item:water-flask",
  "item:dwarven-ale",
  "item:elven-wine",
  "item:mead",
  "item:bottle-of-milk",
  "item:fishing-bait",
];

const TRADESKILL_SUPPLIES = [
  "item:algae-spices",
  "item:allspice",
  "item:axe-head-mold",
  "item:azure-algae",
  "item:baking-spirits",
  "item:barley",
  "item:bat-wing",
  "item:belt-sectional-mold",
  "item:block-of-medium-quality-ore",
  "item:boot-mold",
  "item:bottle",
  "item:bracer-sectional-mold",
  "item:bread-tin-mold",
  "item:brimstone",
  "item:brown-algae",
  "item:buckler-mold",
  "item:bundle-of-wormwood",
  "item:cake-round-mold",
  "item:cask",
  "item:cloak-sectional-mold",
  "item:coldain-velium-temper",
  "item:container-base-mold",
  "item:container-lid-mold",
  "item:cup-of-flour",
  "item:curved-blade-mold",
  "item:dagger-blade-mold",
  "item:dual-edged-blade-mold",
  "item:fer-esh-blade-mold",
  "item:file-mold",
  "item:fish-fillets",
  "item:flask-of-bloodwater",
  "item:fresh-fish",
  "item:frosting",
  "item:garnish",
  "item:gauntlet-mold",
  "item:gorget-mold",
  "item:grapes",
  "item:halberd-head-mold",
  "item:hammer-head-mold",
  "item:heavy-steel-blade-mold",
  "item:helm-mold",
  "item:hilt-mold",
  "item:hinge-mold",
  "item:hops",
  "item:javelin-mold",
  "item:jug-of-oyster-sauces",
  "item:jug-of-sauces",
  "item:kiola-nut",
  "item:kite-shield-mold",
  "item:lantern-casing-mold",
  "item:large-brick-of-medium-quality-ore",
  "item:large-container-base-mold",
  "item:large-container-lid-mold",
  "item:large-leather-boots",
  "item:leggings-sectional-mold",
  "item:long-blade-mold",
  "item:mace-head-mold",
  "item:mail-sectional-mold",
  "item:malt",
  "item:mask-mold",
  "item:medium-quality-folded-sheet-metal",
  "item:medium-quality-sheet-metal",
  "container:mixing-bowl",
  "item:muffin-tin-mold",
  "item:needle-mold",
  "item:neriak-nectar",
  "item:oak-shaft",
  "item:ochre-algae",
  "item:packet-of-kiola-sap",
  "item:pick-head-mold",
  "item:pie-tin-mold",
  "item:plankton-frosting",
  "item:pommel-mold",
  "item:pot-mold",
  "item:rice",
  "item:round-shield-mold",
  "item:royal-jelly",
  "item:rubbing-alcohol",
  "item:scaler-mold",
  "item:seaweed-vinegar",
  "item:shan-tok-blade-mold",
  "item:sharpening-stone",
  "item:sheer-blade-mold",
  "item:sheet-metal",
  "item:short-blade-mold",
  "item:shotglass",
  "item:shuriken-mold",
  "item:silver-bar",
  "item:skewer-mold",
  "item:sleeves-sectional-mold",
  "item:small-brick-of-high-quality-ore",
  "item:small-brick-of-medium-quality-ore",
  "item:small-brick-of-ore",
  "item:small-container-base-mold",
  "item:small-container-lid-mold",
  "item:small-piece-of-ore",
  "item:smithy-hammer",
  "item:smoker-base-mold",
  "item:smoker-support-mold",
  "item:snake-scales",
  "item:spear-head-mold",
  "item:spices",
  "item:spiked-ball-mold",
  "container:spit",
  "item:standing-legs-mold",
  "item:targ-shield-mold",
  "item:thimble-mold",
  "item:thin-blade-mold",
  "item:throwing-axe-mold",
  "item:throwing-knife-mold",
  "item:toolbox-mold",
  "item:tower-shield-mold",
  "item:vinegar",
  "item:white-algae",
  "item:wine-yeast",
  "item:yeast",
];

let updated = 0;
for (const [category, ids] of [
  ["Armor", ARMOR],
  ["Adventuring Supplies", ADVENTURING_SUPPLIES],
  ["Tradeskill Supplies", TRADESKILL_SUPPLIES],
] as const) {
  for (const id of ids) {
    if (!hasNode(id)) throw new Error(`node not found: ${id}`);
    updateNode(id, { category });
    updated++;
  }
}

const expectedTotal = ARMOR.length + ADVENTURING_SUPPLIES.length + TRADESKILL_SUPPLIES.length;
const soldItemIds = new Set(
  graph.edges
    .filter((e: { type: string }) => e.type === "sells")
    .map((e: { target: string }) => e.target)
    .filter((id: string) => {
      const n = graph.nodes.find((n: { id: string }) => n.id === id);
      return n && (n.type === "item" || n.type === "container");
    })
);
if (soldItemIds.size !== expectedTotal) {
  throw new Error(
    `sold item/container count (${soldItemIds.size}) doesn't match categorized count (${expectedTotal}) -- a new sells edge landed on an uncategorized node since this migration was written`
  );
}

save();
console.log(`Migration 400 complete: categorized ${updated} sold item/container node(s)`);
