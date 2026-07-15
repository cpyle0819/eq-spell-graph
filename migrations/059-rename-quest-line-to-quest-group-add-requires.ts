/**
 * Migration 059: rename the `quest_line` node type to `quest_group`, and
 * add a real `requires` edge type for ordered quest prerequisites.
 *
 * Prompted by a user review of migration 057/058's work: Cutthroat Rings
 * (migration 045) states in its own steps "Complete the Orc Picks quest
 * ... first" -- a real prerequisite that had no edge to express it, since
 * Orc Picks didn't exist as a quest node until migration 057. That
 * surfaced a naming collision -- "questline" was being used loosely for
 * two different shapes: Armor of Ro's 7 *unordered* sibling sub-quests
 * (the actual `quest_line` node type), and this *ordered* two-quest chain.
 * See decisions/quest-group-node-type.md and decisions/
 * quest-prerequisite-requires-edge.md for the full reasoning -- this
 * migration is purely the mechanical data change those decisions describe:
 *
 * 1. Rename every `quest_line`-typed node's `type` to `quest_group` (only
 *    one exists: Armor of Ro), and its id prefix from `quest_line:` to
 *    `quest_group:` to match the `type:slug` convention every other node
 *    id already follows -- along with every edge that references the old id.
 * 2. Add `quest:cutthroat-rings --requires--> quest:orc-picks`.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

function hasEdge(source: string, target: string, type: string): boolean {
  return graph.edges.some(
    (e: { data: { source: string; target: string; type: string } }) =>
      e.data.source === source && e.data.target === target && e.data.type === type
  );
}

function addEdge(source: string, target: string, type: string) {
  if (hasEdge(source, target, type)) return;
  graph.edges.push({ data: { id: `e-${type}-${graph.edges.length + 1}`, source, target, type } });
}

// --- 1. Rename quest_line -> quest_group ---
let renamed = 0;
for (const node of graph.nodes as Array<{ data: { id: string; type: string } }>) {
  if (node.data.type !== "quest_line") continue;
  const oldId = node.data.id;
  const newId = oldId.replace(/^quest_line:/, "quest_group:");
  node.data.type = "quest_group";
  node.data.id = newId;
  for (const edge of graph.edges as Array<{ data: { source: string; target: string } }>) {
    if (edge.data.source === oldId) edge.data.source = newId;
    if (edge.data.target === oldId) edge.data.target = newId;
  }
  renamed++;
}

// --- 2. Add the real prerequisite edge ---
addEdge("quest:cutthroat-rings", "quest:orc-picks", "requires");

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log(`Migration 059 complete: renamed ${renamed} quest_line node(s) to quest_group, added Cutthroat Rings --requires--> Orc Picks`);
