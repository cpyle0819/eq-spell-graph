/**
 * Migration 009: Tag boat edges with transport: "boat"
 *
 * Adds transport: "boat" to connects_to edges between zones connected by boat,
 * enabling the route display to distinguish boat crossings from zone lines.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const DATA_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(DATA_PATH, "utf-8"));

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const BOAT_PAIRS: [string, string][] = [
  ["East Freeport", "Butcherblock Mountains"],
  ["South Qeynos", "Erudin"],
  ["Oasis of Marr", "Firiona Vie"],
  ["Butcherblock Mountains", "Firiona Vie"],
  ["Butcherblock Mountains", "The Overthere"],
  ["Northern Desert of Ro", "Iceclad Ocean"],
];

// Build set of directed pairs to tag (both directions)
const boatEdgeKeys = new Set<string>();
for (const [a, b] of BOAT_PAIRS) {
  boatEdgeKeys.add(`zone:${slugify(a)}|zone:${slugify(b)}`);
  boatEdgeKeys.add(`zone:${slugify(b)}|zone:${slugify(a)}`);
}

let tagged = 0;
for (const e of graph.edges) {
  if (e.data.type !== "connects_to") continue;
  const key = `${e.data.source}|${e.data.target}`;
  if (boatEdgeKeys.has(key)) {
    e.data.transport = "boat";
    tagged++;
  }
}

writeFileSync(DATA_PATH, JSON.stringify(graph, null, 2));
console.log(`Migration 009 complete: ${tagged} boat edges tagged`);
