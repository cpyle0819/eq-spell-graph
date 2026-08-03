/**
 * Migration 403: removes the `alignment` field migration 401 added to city
 * zones -- superseded by deriveCityAlignment() (src/graph.ts), which computes
 * good/evil from the zone's own already-sourced `faction.deity` table
 * instead of a hand-guessed classic-EQ convention.
 *
 * Migration 401's guess got Freeport wrong: it hardcoded Freeport as evil
 * (classic EQ's well-known convention), but this graph's own faction data
 * shows Freeport's three zones treating good-/evil-deity worshippers exactly
 * like Qeynos/Kaladim/Halas/etc. do (safe vs. wont_sell) -- i.e. good, not
 * evil. Deriving from real per-zone data sidesteps that whole class of
 * mistake and needs no future eqlwiki-verification pass. See
 * decisions/city-alignment-good-evil.md.
 */

import { loadGraph } from "./_lib";

const { graph, updateNode, save } = loadGraph(import.meta.dir);

let count = 0;
for (const n of graph.nodes as { id: string; alignment?: unknown }[]) {
  if (n.alignment === undefined) continue;
  updateNode(n.id, { alignment: undefined });
  count++;
}

save();

console.log(`Removed the stored alignment field from ${count} zones.`);
