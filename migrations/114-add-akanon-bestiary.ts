/**
 * Migration 114: add mob nodes for zone:ak-anon, per the `mob` node type
 * from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Sourced from eqlwiki.com's Ak'Anon NPC table, filtered to rows that are
 * actual hostile creatures (excludes the zone's many Clockwork Gnome
 * guards/merchants and other citizen/functional NPCs, and any row with no
 * stated level). Includes the rock snake/rock spider from the Mines of
 * Malfunction, a sub-area beneath Ak'Anon rather than its own zone node.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

function hasNode(id: string): boolean {
  return graph.nodes.some((n: { data: { id: string } }) => n.data.id === id);
}

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

const ZONE_ID = "zone:ak-anon";

const MOBS = [
  { slug: "brown-bear", label: "Brown Bear", minLevel: 3, maxLevel: 8 },
  { slug: "decaying-gnome-skeleton", label: "Decaying Gnome Skeleton", minLevel: 1, maxLevel: 1 },
  { slug: "rock-snake", label: "Rock Snake", minLevel: 1, maxLevel: 1 },
  { slug: "rock-spider", label: "Rock Spider", minLevel: 2, maxLevel: 2 },
  { slug: "tiger", label: "Tiger", minLevel: 8, maxLevel: 8 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:ak-anon:${mob.slug}`;
  if (!hasNode(id)) {
    graph.nodes.push({
      data: { id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel },
    });
    added++;
  }
  addEdge(id, ZONE_ID, "located_in");
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log(`Migration 114 complete: ${added} mob node(s) added for Ak'Anon`);
