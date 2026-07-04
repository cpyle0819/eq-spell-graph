/**
 * Migration 012: Normalize spell skill names.
 * Strips "Skill " / "Skill:" prefix left over from wikitext parsing.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

let fixed = 0;
for (const node of graph.nodes) {
  if (node.data.type !== "spell" || !node.data.skill) continue;
  const clean = node.data.skill.replace(/^Skill[:\s]+/i, "").trim();
  if (clean !== node.data.skill) { node.data.skill = clean; fixed++; }
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log(`Migration 012 complete: ${fixed} skill names normalized`);
