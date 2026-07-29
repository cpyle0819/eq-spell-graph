/**
 * Migration 361: add the missing `item:troll-head` node (issue #54).
 *
 * `Hukulk's Love` and `Rungupp (Quest)` (migration 051) both reference a
 * "Troll Head" turn-in item in their prose `steps`, but no `item:troll-head`
 * node was ever created for it -- the item side of those quests was never
 * modeled at all. Sourced from eqlwiki.com's "Troll Head" page raw wikitext
 * (`action=query&prop=revisions`): LORE ITEM, NO DROP, WT 1.0, SMALL, usable
 * by all classes/races, dropped by three named mobs already in the graph
 * (Ratraz, Guard Lumpin, Rungupp) across three zones. The wiki's own note
 * ("There are three items with this identical name") reads as the same item
 * with per-source flavor text, not three distinct items -- one node, three
 * `drops`/`located_in` edges, consistent with how the two quests already
 * treat it as a single turn-in.
 *
 * Rathe Mountains' own zone page shows an unlisted troll camp (map spots
 * 10/11) not reflected in its bestiary or "Types of Monsters" list, raised
 * while investigating issue #54 -- but Troll Head's own wiki page doesn't
 * name Rathe Mountains as a drop source, so no edge is added there. Per
 * user direction, left alone rather than guessed at.
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, save } = loadGraph(import.meta.dir);

const itemId = "item:troll-head";
addNode({
  id: itemId,
  label: "Troll Head",
  type: "item",
  weight: 1.0,
  size: "Small",
  lore: true,
  noTrade: true,
  source:
    "Dropped by Ratraz (Neriak Third Gate), Guard Lumpin (Neriak Foreign Quarter), and Rungupp (Toxxulia Forest); turn-in item for Hukulk's Love and Rungupp (Quest)",
});

const drops: Array<[npcId: string, zoneId: string]> = [
  ["mob:neriak-3rd-gate:ratraz", "zone:neriak-3rd-gate"],
  ["mob:neriak-foreign-quarter:guard-lumpin", "zone:neriak-foreign-quarter"],
  ["mob:toxxulia-forest:rungupp", "zone:toxxulia-forest"],
];

for (const [npcId, zoneId] of drops) {
  addEdge(npcId, itemId, "drops");
  addEdge(itemId, zoneId, "located_in");
}

save();
console.log("Added item:troll-head with 3 drops edges and 3 located_in edges.");
