/**
 * Migration 010: Connect orphaned vendor zones
 *
 * Ocean of Tears and High Keep both have spell vendors but no connects_to edges,
 * making them unreachable in the route planner.
 *
 * - Ocean of Tears: midpoint on the Freeport–Faydwer boat route (Sisters' Isle).
 *   Add boat edges to East Freeport and Butcherblock Mountains.
 * - High Keep: subzone inside Highpass Hold. Add walk edge to Highpass Hold.
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

function addEdge(src: string, tgt: string, transport?: "boat"): void {
  if (hasEdge(src, tgt)) return;
  const data: { id: string; source: string; target: string; type: string; transport?: "boat" } = {
    id: nextId("e-conn"),
    source: src,
    target: tgt,
    type: "connects_to",
  };
  if (transport) data.transport = transport;
  graph.edges.push({ data });
}

// Ocean of Tears — boat connections (translocator NPCs Narrik, Fithop, Setikan operate here)
addEdge("zone:ocean-of-tears", "zone:east-freeport", "boat");
addEdge("zone:east-freeport", "zone:ocean-of-tears", "boat");
addEdge("zone:ocean-of-tears", "zone:butcherblock-mountains", "boat");
addEdge("zone:butcherblock-mountains", "zone:ocean-of-tears", "boat");

// High Keep — zone entrance is inside Highpass Hold
addEdge("zone:high-keep", "zone:highpass-hold");
addEdge("zone:highpass-hold", "zone:high-keep");

writeFileSync(DATA_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 010 complete: Ocean of Tears and High Keep connected");
