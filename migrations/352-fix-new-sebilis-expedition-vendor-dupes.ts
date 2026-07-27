/**
 * Migration 352: fixes issue #41's low-mob-ratio flag for
 * zone:new-sebilis-expedition (previously counted 1 mob / 12 npcs) by
 * removing 2 redundant duplicate vendor nodes -- the same
 * partial-import-duplicate pattern already fixed for Erudin Palace
 * (migration 349) and its own precedent (migration 324).
 *
 * "Crusader Silulika, Shadow Knight Spells" (6 sells edges) and "Zealot
 * Zorshais, Bank Room" (1 sells edge) are each a strict subset of the
 * fuller "Crusader Silulika" (51 sells edges) and "Zealot Zorshais" (3 sells
 * edges) nodes for the same NPC -- same roles, same zone, no other edges.
 * Dropped outright, no data to preserve.
 *
 * This brings the zone to 1 mob / 10 npcs. The ratio itself is not a bug:
 * this is a small spell-vendor camp ("little more than a door on the side of
 * a hill" per its own lore text), not a monster-dense dungeon, so a
 * vendor-heavy NPC list is expected and left as-is.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const DUPLICATE_IDS = [
  "vendor:new-sebilis-expedition:crusader-silulika-shadow-knight-spells",
  "vendor:new-sebilis-expedition:zealot-zorshais-bank-room",
];

let dropped = 0;

for (const id of DUPLICATE_IDS) {
  graph.edges = graph.edges.filter((e: { source: string }) => e.source !== id);
  const before = graph.nodes.length;
  graph.nodes = graph.nodes.filter((n: { id: string }) => n.id !== id);
  if (graph.nodes.length !== before) dropped++;
}

save();
console.log(`Migration 352 complete: dropped ${dropped} duplicate npc node(s)`);
