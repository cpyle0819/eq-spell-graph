/**
 * Migration 005: Fix zone connectivity gaps.
 *
 * Problem: Some vendor zones use different slugs than the adjacency data:
 * - "Felwithe" (vendor data) vs "Northern Felwithe"/"Southern Felwithe" (adjacency)
 * - "Neriak" (vendor data) vs "Neriak Foreign Quarter"/"Neriak Commons"/"Neriak 3rd Gate" (adjacency)
 * - "South Felwithe" (vendor data) vs "Southern Felwithe" (adjacency)
 * - "West Karana" (vendor data) vs "Western Karana" (adjacency)
 *
 * Fix: Add connects_to edges to bridge these naming gaps.
 * These represent that "Felwithe" is reachable via Northern Felwithe, etc.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const DATA_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(DATA_PATH, "utf-8"));

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function addBidirectionalEdge(sourceId: string, targetId: string) {
  const hasAB = graph.edges.some(
    (e: any) => e.data.type === "connects_to" && e.data.source === sourceId && e.data.target === targetId
  );
  const hasBA = graph.edges.some(
    (e: any) => e.data.type === "connects_to" && e.data.source === targetId && e.data.target === sourceId
  );
  let added = 0;
  if (!hasAB) {
    graph.edges.push({ data: { id: `e-conn-fix-${graph.edges.length}`, source: sourceId, target: targetId, type: "connects_to" } });
    added++;
  }
  if (!hasBA) {
    graph.edges.push({ data: { id: `e-conn-fix-${graph.edges.length}`, source: targetId, target: sourceId, type: "connects_to" } });
    added++;
  }
  return added;
}

// Bridges to add:
const FIXES: [string, string][] = [
  // "Felwithe" connects to Northern Felwithe (they're the same city, different zone lines)
  ["Felwithe", "Northern Felwithe"],
  // "South Felwithe" is the same as "Southern Felwithe" — connect them
  ["South Felwithe", "Southern Felwithe"],
  // Also connect Felwithe to Southern Felwithe since vendors reference both
  ["Felwithe", "Southern Felwithe"],
  // "Neriak" (used in vendor data) connects to the Neriak zone chain
  ["Neriak", "Neriak 3rd Gate"],
  ["Neriak", "Neriak Commons"],
  // "West Karana" connects to "Western Karana" (same zone, different name used)
  ["West Karana", "Western Karana"],
];

let totalAdded = 0;
for (const [a, b] of FIXES) {
  const idA = `zone:${slugify(a)}`;
  const idB = `zone:${slugify(b)}`;

  // Ensure both nodes exist
  for (const [id, label] of [[idA, a], [idB, b]] as [string, string][]) {
    if (!graph.nodes.some((n: any) => n.data.id === id)) {
      graph.nodes.push({ data: { id, label, type: "zone", faction: { barbarian: "neutral", troll: "neutral", ogre: "neutral", iksar: "neutral" } } });
    }
  }

  totalAdded += addBidirectionalEdge(idA, idB);
}

// Also ensure Neriak zone has proper faction (it's a dark elf city)
const neriakNode = graph.nodes.find((n: any) => n.data.id === "zone:neriak");
if (neriakNode) {
  neriakNode.data.faction = { barbarian: "unsafe", troll: "safe", ogre: "safe", iksar: "unsafe" };
}

writeFileSync(DATA_PATH, JSON.stringify(graph, null, 2));

// Verify connectivity
const adj: Record<string, Set<string>> = {};
for (const e of graph.edges) {
  if (e.data.type !== "connects_to") continue;
  if (!adj[e.data.source]) adj[e.data.source] = new Set();
  if (!adj[e.data.target]) adj[e.data.target] = new Set();
  adj[e.data.source].add(e.data.target);
  adj[e.data.target].add(e.data.source);
}

const zones = new Set(graph.nodes.filter((n: any) => n.data.type === "zone").map((n: any) => n.data.id));
const visited = new Set<string>();
const queue = ["zone:halas"];
visited.add("zone:halas");
while (queue.length) {
  const cur = queue.shift()!;
  for (const n of adj[cur] || []) {
    if (!visited.has(n)) { visited.add(n); queue.push(n); }
  }
}

const vendorZones = new Set(
  graph.edges.filter((e: any) => e.data.type === "located_in").map((e: any) => e.data.target)
);
const unreachableVendor = [...vendorZones].filter((z) => !visited.has(z));

console.log(`Migration 005 complete: added ${totalAdded} edges`);
console.log(`  Vendor zones reachable from Halas: ${vendorZones.size - unreachableVendor.length}/${vendorZones.size}`);
if (unreachableVendor.length) {
  console.log(`  Still unreachable: ${unreachableVendor.join(", ")}`);
} else {
  console.log(`  All vendor zones are now reachable!`);
}
