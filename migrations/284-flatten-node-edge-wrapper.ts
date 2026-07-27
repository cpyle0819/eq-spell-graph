/**
 * Migration 284: flatten every node/edge from `{ data: {...} }` to the
 * inner object directly -- `{ nodes: [{data:{id,...}}] }` was the
 * Cytoscape.js elements format (decisions/tech-stack.md's graph-view tab),
 * which no longer exists anywhere in public/ (removed by the "Redesign UI"
 * UI overhaul, commit 21f40c9). Nothing else required that shape, so it was
 * pure overhead on every node/edge access in src/graph.ts. See
 * decisions/flat-node-edge-shape.md.
 *
 * Bypasses migrations/_lib.ts's loadGraph() deliberately: that helper's
 * own hasNode/addNode/etc. assume the pre-flatten `{data:{...}}` shape
 * this migration retires, and gets updated for the new flat shape
 * immediately after this migration runs (it's for migrations written after
 * this one, not this one itself).
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const nodes = graph.nodes.map((n: { data: unknown }) => n.data);
const edges = graph.edges.map((e: { data: unknown }) => e.data);

writeFileSync(GRAPH_PATH, JSON.stringify({ nodes, edges }, null, 2));

console.log(`Flattened ${nodes.length} nodes and ${edges.length} edges.`);
