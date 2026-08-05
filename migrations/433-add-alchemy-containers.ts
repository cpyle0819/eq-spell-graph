/**
 * Migration 433: model Alchemy's crafting containers (issue #46), via the
 * `container` node type -- see decisions/tradeskill-recipe-node-schema.md
 * for the schema.
 *
 * eqlwiki.com's `Medicine Bag` page gives it a real statsblock (WT 0.4,
 * Capacity 6, Size Capacity LARGE) and a `soldby` table of ~28 vendors --
 * a portable, vendor-purchased container like Jewelcrafting's Jeweler's
 * Kit, not a Brew-Barrel-style world fixture. Every vendor eqlwiki lists is
 * included; all 18 of its zones already exist as zone nodes in this graph.
 *
 * `Reinforced Medicine Bag` (WT 2.5, 10% Weight Reduction, Capacity 10,
 * Size Capacity GIANT) was already added as an `item` node by Tailoring's
 * migration 415 (its own recipe: Thick Grizzly Bear Skin + Silk Cord,
 * trivial 68, crafted in a Loom) -- but nothing had pointed a `crafted_in`
 * edge at it yet, so it was never corrected to `container` type the way
 * Baking's Mixing Bowl/Spit were. Alchemy's own recipes need to point
 * `crafted_in` at it, so this migration retypes and re-ids it
 * (item:reinforced-medicine-bag -> container:reinforced-medicine-bag,
 * updating its one `produces` edge target) rather than leaving a second,
 * inconsistent representation of the same "what recipes are made in" role
 * Medicine Bag itself has. No `sells` edges point at it either way -- it's
 * purely player-crafted, never vendor-sold, so no `category` field.
 *
 * Sourced from each page's raw wikitext via eqlwiki's MediaWiki API, not
 * WebFetch's summarizer.
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

addNode({
  id: "container:medicine-bag",
  label: "Medicine Bag",
  type: "container",
  weight: 0.4,
  containerSize: "Large",
  capacity: 6,
  category: "Tradeskill Supplies",
});

const medicineBagVendors: [string, string, string][] = [
  ["a clockwork weaponsmith", "npc:ak-anon:a-clockwork-weaponsmith", "zone:ak-anon"],
  ["Klan Smith", "npc:east-freeport:klan-smith", "zone:east-freeport"],
  ["Gord Smith", "npc:east-freeport:gord-smith", "zone:east-freeport"],
  ["Grabah", "npc:grobb:grabah", "zone:grobb"],
  ["Blergagg", "npc:grobb:blergagg", "zone:grobb"],
  ["Zumzal", "npc:grobb:zumzal", "zone:grobb"],
  ["Dargon", "npc:halas:dargon", "zone:halas"],
  ["Spirita", "npc:halas:spirita", "zone:halas"],
  ["Holana Oleary", "npc:halas:holana-oleary", "zone:halas"],
  ["Mardon Smith", "npc:highpass-hold:mardon-smith", "zone:highpass-hold"],
  ["Hindaek Stormhammer", "npc:south-kaladim:hindaek-stormhammer", "zone:south-kaladim"],
  ["Klok Sargin", "npc:lake-of-ill-omen:klok-sargin", "zone:lake-of-ill-omen"],
  ["Opal H'Rugla", "npc:neriak-commons:opal-hrugla", "zone:neriak-commons"],
  ["Garakbar", "npc:oggok:garakbar", "zone:oggok"],
  ["Rora Dirtstamp", "npc:oggok:rora-dirtstamp", "zone:oggok"],
  ["Pordopa", "npc:oggok:pordopa", "zone:oggok"],
  ["Yvonne Ani", "npc:paineel:yvonne-ani", "zone:paineel"],
  ["Smithy Qag", "npc:east-cabilis:smithy-qag", "zone:east-cabilis"],
  ["Smithy Ygen", "npc:east-cabilis:smithy-ygen", "zone:east-cabilis"],
  ["Jaxxtz", "npc:west-cabilis:jaxxtz", "zone:west-cabilis"],
  ["Klok Scaleroot", "npc:west-cabilis:klok-scaleroot", "zone:west-cabilis"],
  ["Klok Canip", "npc:field-of-bone:klok-canip", "zone:field-of-bone"],
  ["Marlyn McMerin", "npc:firiona-vie:marlyn-mcmerin", "zone:firiona-vie"],
  ["Quizan Gaxx", "npc:firiona-vie:quizan-gaxx", "zone:firiona-vie"],
  ["Klok Bygle", "npc:swamp-of-no-hope:klok-bygle", "zone:swamp-of-no-hope"],
  ["Brynjar", "npc:thurgadin:brynjar", "zone:thurgadin"],
  ["Hulda", "npc:thurgadin:hulda", "zone:thurgadin"],
  ["Klok Nogolin", "npc:warsliks-woods:klok-nogolin", "zone:warsliks-woods"],
];

let npcsAdded = 0;
for (const [label, id, zoneId] of medicineBagVendors) {
  if (!hasNode(id)) {
    addNode({ id, label, type: "npc", roles: ["vendor"] });
    addEdge(id, zoneId, "located_in");
    npcsAdded++;
  }
  addEdge(id, "container:medicine-bag", "sells");
}

// Retype Reinforced Medicine Bag: item -> container (see docblock above).
const rmb = graph.nodes.find((n: { id: string }) => n.id === "item:reinforced-medicine-bag");
if (rmb) {
  rmb.id = "container:reinforced-medicine-bag";
  rmb.type = "container";
  for (const e of graph.edges) {
    if (e.source === "item:reinforced-medicine-bag") e.source = "container:reinforced-medicine-bag";
    if (e.target === "item:reinforced-medicine-bag") e.target = "container:reinforced-medicine-bag";
  }
}

save();
console.log(
  `Migration 433 complete: container:medicine-bag added, ${medicineBagVendors.length} vendor sells edges (${npcsAdded} new npc(s)); Reinforced Medicine Bag retyped to container:reinforced-medicine-bag`
);
