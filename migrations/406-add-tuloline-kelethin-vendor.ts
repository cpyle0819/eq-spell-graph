/**
 * Migration 406: adds Tuloline, the 17th "Adventuring Supply Merchant"
 * archetype vendor (see migration 404) -- skipped there because her
 * eqlwiki zone, "Kelethin," wasn't resolvable to a zone in this graph.
 * Per user clarification, Kelethin is Greater Faydark for this graph's
 * purposes (the elven treehouse city is part of that zone, not modeled
 * separately here) -- so she's placed in zone:greater-faydark alongside
 * this graph's existing Greater Faydark merchants.
 *
 * The only other "Kelethin"-tagged entry seen across migrations 404/405's
 * source data (Merchant Kwein selling Bottle of Milk) was a duplicate of
 * an already-processed "Merchant Kwein - Greater Faydark" row and needed
 * no further action -- confirmed her sells edges already include Bottle
 * of Milk.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const CATALOG = [
  "item:backpack",
  "item:bandages",
  "item:boots-of-the-long-road",
  "item:bottle-of-milk",
  "item:fishing-bait",
  "item:fishing-pole",
  "item:iron-ration",
  "item:large-harness",
  "item:malachite",
  "item:ration",
  "item:tiny-dagger",
  "item:trinket-pouch",
  "item:water-flask",
];

const npcId = "npc:greater-faydark:tuloline";
const zoneId = "zone:greater-faydark";

if (!hasNode(zoneId)) throw new Error(`zone not found: ${zoneId}`);
if (hasNode(npcId)) throw new Error(`npc already exists: ${npcId}`);

addNode({ id: npcId, label: "Tuloline", type: "npc", roles: ["vendor"] });
addEdge(npcId, zoneId, "located_in");
for (const itemId of CATALOG) {
  if (!hasNode(itemId)) throw new Error(`item not found: ${itemId}`);
  addEdge(npcId, itemId, "sells");
}

save();
console.log(`Migration 406 complete: added Tuloline (Greater Faydark) with the ${CATALOG.length}-item Adventuring Supply Merchant catalog.`);
