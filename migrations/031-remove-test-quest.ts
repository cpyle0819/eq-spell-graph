/**
 * Migration 031: Remove the migration-026 test quest ("Ore for the Anvil")
 * now that real quest data exists (migrations 028-030). Removes the quest
 * node itself plus every node built solely to support it (NPC, both
 * reward items, the faction) -- confirmed none of the four are referenced
 * by anything outside this quest before removing them. zone:ak-anon is
 * left alone: it's a real zone with its own vendor data, not something
 * this migration created.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const NODES_TO_REMOVE = [
  "quest:ore-for-the-anvil",
  "npc:ak-anon:grimbold-ironhand",
  "item:sturdy-ore-sack",
  "item:anvil-forged-warhammer",
  "faction:steel-warriors-of-ak-anon",
];

const before = { nodes: graph.nodes.length, edges: graph.edges.length };

const removeSet = new Set(NODES_TO_REMOVE);
graph.nodes = graph.nodes.filter((n: { data: { id: string } }) => !removeSet.has(n.data.id));
graph.edges = graph.edges.filter(
  (e: { data: { source: string; target: string } }) => !removeSet.has(e.data.source) && !removeSet.has(e.data.target)
);

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log(
  `Migration 031 complete: removed ${before.nodes - graph.nodes.length} nodes, ${before.edges - graph.edges.length} edges`
);
