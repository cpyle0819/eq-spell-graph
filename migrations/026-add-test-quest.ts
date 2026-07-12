/**
 * Migration 026: Add "quest", "item", and "faction" node types, plus one
 * hand-authored test quest exercising every new node and edge type.
 *
 * New node types (per decisions/'s "node types are generic and extensible"
 * rule): "quest", "item", "faction". New edge types: "starts" (npc starts
 * quest) and "rewards" (quest rewards item or faction — a single edge type
 * for both, disambiguated by the target node's own `type`, rather than
 * separate `rewards_item`/`rewards_faction` types). Quest location reuses
 * the existing "located_in" edge type — same relationship as
 * npc --located_in--> zone. Full rationale: decisions/quest-reward-modeling.md.
 *
 * No scraping yet (per CLAUDE.md) — this is one manually authored quest to
 * prove out the shape before any real data gets attached to it.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

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
  graph.edges.push({
    data: { id: `e-${type}-${graph.edges.length + 1}`, source, target, type },
  });
}

const zoneId = "zone:ak-anon";

const npcId = "npc:ak-anon:grimbold-ironhand";
if (!hasNode(npcId)) {
  graph.nodes.push({
    data: { id: npcId, label: "Grimbold Ironhand", type: "npc", roles: ["quest_giver"] },
  });
}
addEdge(npcId, zoneId, "located_in");

const itemId = `item:${slugify("Sturdy Ore Sack")}`;
if (!hasNode(itemId)) {
  graph.nodes.push({ data: { id: itemId, label: "Sturdy Ore Sack", type: "item" } });
}

const factionId = `faction:${slugify("Steel Warriors of Ak'Anon")}`;
if (!hasNode(factionId)) {
  graph.nodes.push({ data: { id: factionId, label: "Steel Warriors of Ak'Anon", type: "faction" } });
}

const questId = `quest:${slugify("Ore for the Anvil")}`;
if (!hasNode(questId)) {
  graph.nodes.push({
    data: {
      id: questId,
      label: "Ore for the Anvil",
      type: "quest",
      description: "The town blacksmith needs ore hauled up from the mines below Ak'Anon.",
      classes: ["warrior"],
      minLevel: 5,
      maxLevel: 15,
      steps: [
        "Speak with Grimbold Ironhand in Ak'Anon",
        "Collect 5 Raw Ore from the Ak'Anon mines",
        "Return the ore to Grimbold Ironhand",
      ],
      total_experience: 500,
    },
  });
}
addEdge(npcId, questId, "starts");
addEdge(questId, zoneId, "located_in");
addEdge(questId, itemId, "rewards");
addEdge(questId, factionId, "rewards");

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 026 complete: quest/item/faction node types added, 1 test quest created");
