/**
 * Migration 058: fill in Orc Picks' (migration 057) missing faction
 * rewards. The original research pass only captured "faction increases"
 * generically; a closer re-read of eqlwiki.com's own Orc Picks page names
 * Coalition of Tradefolk Underground and Freeport Militia as the two
 * positive changes (Knights of Truth and Priests of Marr both worsen --
 * skipped, consistent with every migration's negative-faction policy).
 *
 * Also folds the "(Freeport Militia)" distinction eqlwiki.com itself uses
 * to tell this quest apart from Orc Pawn Picks (Indigo Brotherhood) into
 * the description -- the two are deliberately separate, disambiguation-
 * linked pages (same shape as Become PvP (Ak'Anon) vs. (Freeport)), not a
 * duplicate.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
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

function addEdge(source: string, target: string, type: string) {
  if (hasEdge(source, target, type)) return;
  graph.edges.push({ data: { id: `e-${type}-${graph.edges.length + 1}`, source, target, type } });
}

function slug(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function addFactionReward(questId: string, label: string) {
  const id = `faction:${slug(label)}`;
  addNode({ id, label, type: "faction" });
  addEdge(questId, id, "rewards");
}

const questId = "quest:orc-picks";
const quest = graph.nodes.find((n: { data: { id: string } }) => n.data.id === questId);
if (!quest) throw new Error(`${questId} not found -- did migration 057 run?`);

quest.data.description =
  "Guard Valon in West Commonlands trades Orc Pawn Picks -- four at a time -- for coin, experience, and faction with Coalition of Tradefolk Underground and Freeport Militia (Knights of Truth and Priests of Marr both worsen). Dubious or better faction with Guard Valon is sufficient to start. Disambiguated on eqlwiki.com from Orc Pawn Picks (Indigo Brotherhood), a separate quest with the same turn-in item at a different NPC. All classes.";

addFactionReward(questId, "Coalition of Tradefolk Underground");
addFactionReward(questId, "Freeport Militia");

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 058 complete: added Orc Picks' missing faction rewards");
