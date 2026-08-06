/**
 * Shared helpers for one-off scripts that add graph nodes/edges (quest
 * batches, item batches, etc) -- see CLAUDE.md's "Updating the graph". Only
 * ever imported, never run directly.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

export function loadGraph(scriptDir: string) {
  const GRAPH_PATH = resolve(scriptDir, "../data/graph.json");
  const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

  function hasNode(id: string): boolean {
    return graph.nodes.some((n: { id: string }) => n.id === id);
  }

  function addNode(data: Record<string, unknown>) {
    if (!hasNode(data.id as string)) graph.nodes.push(data);
  }

  function hasEdge(source: string, target: string, type: string): boolean {
    return graph.edges.some(
      (e: { source: string; target: string; type: string }) =>
        e.source === source && e.target === target && e.type === type
    );
  }

  function addEdge(source: string, target: string, type: string, attrs?: Record<string, unknown>) {
    if (hasEdge(source, target, type)) return;
    graph.edges.push({ id: `e-${type}-${graph.edges.length + 1}`, source, target, type, ...attrs });
  }

  function updateNode(id: string, updates: Record<string, unknown>) {
    const node = graph.nodes.find((n: { id: string }) => n.id === id);
    if (node) Object.assign(node, updates);
  }

  function slug(label: string): string {
    return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function addFactionReward(questId: string, label: string) {
    const id = `faction:${slug(label)}`;
    addNode({ id, label, type: "faction" });
    addEdge(questId, id, "rewards");
  }

  function addGiver(id: string, label: string, zoneId: string) {
    addNode({ id, label, type: "npc", roles: ["quest_giver"] });
    addEdge(id, zoneId, "located_in");
  }

  function save() {
    writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
  }

  return { graph, hasNode, addNode, hasEdge, addEdge, updateNode, slug, addFactionReward, addGiver, save };
}
