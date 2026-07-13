/**
 * Migration 035: Errand for Tonmerk's Smite reward, modeled as a real
 * `quest --rewards--> spell` edge now that getQuests() (src/graph.ts) and
 * the Quests UI (quest-shared.js's spellFinderPinUrl()) both resolve
 * spell-type reward targets -- migration 034 left this prose-only because
 * that support didn't exist yet at the time. Also drops the prose step
 * migration 034 added as a stand-in ("Reward: the Smite spell (not modeled
 * as a graph edge...)"), since the real edge now covers it.
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

const questId = "quest:errand-for-tonmerk";
addEdge(questId, "spell:smite", "rewards");

const quest = graph.nodes.find((n: { data: { id: string } }) => n.data.id === questId);
if (quest) {
  quest.data.steps = quest.data.steps.filter(
    (s: string) => s !== "Reward: the Smite spell (not modeled as a graph edge -- see migration header)"
  );
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 035 complete: Errand for Tonmerk now rewards spell:smite as a real edge");
