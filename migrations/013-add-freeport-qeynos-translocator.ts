/**
 * Migration 013: Add the Freeport–Qeynos translocator route
 *
 * Per eqlwiki.com patch notes (May 28, 2026): "A new translocator route has
 * been added between Freeport and Qeynos," run by Academy of Arcane Sciences
 * NPCs charging 1pp/level. Translocators are dock-based — East Freeport and
 * South Qeynos are the existing dock zones on each side (East Freeport
 * already hosts the Ocean of Tears/Butcherblock translocators from
 * migration 010; South Qeynos hosts the Erudin boat dock).
 *
 * Modeled as a distinct "translocator" transport (not "boat") since it's a
 * different mechanic in-game — an instant, paid teleport rather than a
 * timed boat ride — and the route UI should show them differently.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const DATA_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(DATA_PATH, "utf-8"));

function nextId(prefix: string): string {
  return `${prefix}-${graph.edges.length + 1}-${Date.now().toString(36)}`;
}

function hasEdge(src: string, tgt: string): boolean {
  return graph.edges.some(
    (e: { data: { type: string; source: string; target: string } }) =>
      e.data.type === "connects_to" && e.data.source === src && e.data.target === tgt
  );
}

function addEdge(src: string, tgt: string, transport: "boat" | "translocator"): void {
  if (hasEdge(src, tgt)) return;
  graph.edges.push({
    data: { id: nextId("e-conn"), source: src, target: tgt, type: "connects_to", transport },
  });
}

addEdge("zone:east-freeport", "zone:south-qeynos", "translocator");
addEdge("zone:south-qeynos", "zone:east-freeport", "translocator");

writeFileSync(DATA_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 013 complete: East Freeport <-> South Qeynos translocator route added");
