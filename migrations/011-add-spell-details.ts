/**
 * Migration 011: Enrich spell nodes with detail data from the EQL wiki.
 *
 * Adds description, mana, skill, castTime, recastTime, fizzleTime,
 * duration, targetType, spellType, resist, and range to each spell node.
 *
 * Requires data/spell-details.json (produced by scripts/scrape-spell-details.ts).
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const DETAILS_PATH = resolve(import.meta.dir, "../data/spell-details.json");

const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));
const details: Record<string, Record<string, unknown>> = JSON.parse(readFileSync(DETAILS_PATH, "utf-8"));

let updated = 0;
for (const node of graph.nodes) {
  if (node.data.type !== "spell") continue;
  const d = details[node.data.id];
  if (!d) continue;
  Object.assign(node.data, d);
  updated++;
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log(`Migration 011 complete: ${updated} spell nodes enriched`);
