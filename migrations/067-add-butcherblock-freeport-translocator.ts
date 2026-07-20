/**
 * Migration 067: Add Butcherblock Mountains <-> Ocean of Tears <-> East
 * Freeport translocator routes (GitHub issue #34).
 *
 * Migration 010 originally modeled these two legs as boat-only, with a
 * comment stating "No translocator exists at these docks in this game" --
 * but that finding named the classic-EverQuest translocator NPCs (Narrik,
 * Fithop, Setikan) specifically as the ones that don't apply here, which is
 * exactly the classic-EQ/EQL mixup decisions/eql-vs-classic-eq-zone-
 * connectivity.md warns about. eqlwiki.com's own zone pages for both zones
 * still only describe boat service (re-checked for this migration, no
 * "translocat" text on either page) -- confirmed with the issue reporter
 * that they mean a distinct, real EQL translocator they've used in-game, not
 * the classic-EQ one migration 010 already ruled out. Not independently
 * wiki-verifiable at the time of this migration; recorded as an in-game
 * report per the issue, same as any other user-reported correction.
 *
 * Added *alongside* the existing boat edges, not replacing them (same
 * "distinct transport option between the same two zones" shape decisions/
 * translocator-wins-hop-ties.md already anticipated) -- shortestPath()'s
 * existing translocator-first tie-break means routes through these zones
 * now show the translocator, with the boat still modeled as a real
 * alternative.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const DATA_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(DATA_PATH, "utf-8"));

function nextId(prefix: string): string {
  return `${prefix}-${graph.edges.length + 1}-${Date.now().toString(36)}`;
}

function hasEdge(src: string, tgt: string, transport: string): boolean {
  return graph.edges.some(
    (e: { data: { type: string; source: string; target: string; transport?: string } }) =>
      e.data.type === "connects_to" && e.data.source === src && e.data.target === tgt && e.data.transport === transport
  );
}

function addEdge(src: string, tgt: string, transport: "translocator"): void {
  if (hasEdge(src, tgt, transport)) return;
  graph.edges.push({
    data: { id: nextId("e-conn"), source: src, target: tgt, type: "connects_to", transport },
  });
}

addEdge("zone:butcherblock-mountains", "zone:ocean-of-tears", "translocator");
addEdge("zone:ocean-of-tears", "zone:butcherblock-mountains", "translocator");
addEdge("zone:ocean-of-tears", "zone:east-freeport", "translocator");
addEdge("zone:east-freeport", "zone:ocean-of-tears", "translocator");

writeFileSync(DATA_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 067 complete: Butcherblock <-> Ocean of Tears <-> East Freeport translocator routes added");
