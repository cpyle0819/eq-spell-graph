/**
 * Shared helpers for migrations that add graph nodes/edges (quest batches,
 * item batches, etc). Not itself a numbered migration -- the leading
 * underscore keeps it out of `migrations/NNN-*.ts` glob matches, and it's
 * only ever imported, never run directly.
 *
 * Existing migrations predating this file keep their own copy-pasted
 * versions of these functions (they're historical, run-once records --
 * see CLAUDE.md); only new migrations need to import from here.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

export function loadGraph(migrationDir: string) {
  const GRAPH_PATH = resolve(migrationDir, "../data/graph.json");
  const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

  function hasNode(id: string): boolean {
    return graph.nodes.some((n: { data: { id: string } }) => n.data.id === id);
  }

  function addNode(data: Record<string, unknown>) {
    if (!hasNode(data.id as string)) graph.nodes.push({ data });
  }

  function hasEdge(source: string, target: string, type: string): boolean {
    return graph.edges.some(
      (e: { data: { source: string; target: string; type: string } }) =>
        e.data.source === source && e.data.target === target && e.data.type === type
    );
  }

  function addEdge(source: string, target: string, type: string, attrs?: Record<string, unknown>) {
    if (hasEdge(source, target, type)) return;
    graph.edges.push({ data: { id: `e-${type}-${graph.edges.length + 1}`, source, target, type, ...attrs } });
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

  return { graph, hasNode, addNode, hasEdge, addEdge, slug, addFactionReward, addGiver, save };
}
