/**
 * Migration 046: Blackburrow Stout Quest, off GitHub issue #26's checklist.
 * Researched directly against eqlwiki.com, following
 * decisions/eqlwiki-quest-research-method.md.
 *
 * No item reward -- the page states only coin (4 silver, 4 copper, not
 * modeled, consistent with every migration so far) and faction/experience.
 * Negative faction change (Merchants of Rivervale worsens) not modeled,
 * consistent with decisions/quest-reward-modeling.md.
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

function addGiver(id: string, label: string, zoneId: string) {
  addNode({ id, label, type: "npc", roles: ["quest_giver"] });
  addEdge(id, zoneId, "located_in");
}

const zoneId = "zone:rivervale";
const mistyThicketId = "zone:misty-thicket";
const giverId = "npc:rivervale:rueppy-kutpurse";
addGiver(giverId, "Rueppy Kutpurse", zoneId);

const questId = "quest:blackburrow-stout-quest";
addNode({
  id: questId,
  label: "Blackburrow Stout Quest",
  type: "quest",
  description:
    "Rueppy Kutpurse, in the back of Fool's Gold in Rivervale, sends players to fetch a Short Beer from Burtle Barrelbelly upstairs, then to Gunrich in the Misty Thicket ruins for a Case of Blackburrow Stout.",
  minLevel: 1,
  steps: [
    "Speak with Rueppy Kutpurse and obtain a Short Beer from Burtle Barrelbelly upstairs",
    "Give the Short Beer to Rueppy Kutpurse",
    "Travel to the Misty Thicket ruins, north past the tunnel on the undead hill",
    "Find Gunrich and say 'Dark Rivers Flow East'",
    "Receive a Case of Blackburrow Stout from Gunrich",
    "Return to Rueppy Kutpurse and give her the case",
  ],
  wiki_title: "Blackburrow Stout Quest",
});
addEdge(giverId, questId, "starts");
addEdge(questId, zoneId, "starts_in");
addEdge(questId, zoneId, "located_in");
addEdge(questId, mistyThicketId, "located_in");
addFactionReward(questId, "DeepPockets");
addFactionReward(questId, "Circle of Unseen Hands");
addFactionReward(questId, "Coalition of Tradefolk Underground");
addFactionReward(questId, "Carson McCabe");

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 046 complete: added Blackburrow Stout Quest from GitHub issue #26's checklist");
