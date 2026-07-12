/**
 * Migration 033: Add Scrap Metal Quest -- the first quest picked off
 * GitHub issue #26's checklist. Researched directly against eqlwiki.com
 * (Scrap Metal Quest, Earring of Fire Reflection, Gnome Glow Rod, Small
 * Scarab Helm), following decisions/eqlwiki-quest-research-method.md.
 *
 * Deliberately NOT modeled:
 * - "Rusty Weapons" -- a generic loot-category mention, not a specific
 *   named item; left as prose in the quest's own steps, not fabricated
 *   as an item node.
 * - "Tinmizer's Fabulous Compactor" -- every title guessed for its own
 *   item page 404'd (same gotcha as Research Aid's "Runes and Research"
 *   in migration 028); left as prose, not a node, since it can't be
 *   verified.
 * - The "Worsened" faction changes (Dark Reflection, Clan Grikbar) --
 *   this graph's `rewards` edge only models a positive reward (see
 *   decisions/quest-reward-modeling.md); there's no edge type yet for
 *   "this quest costs you standing," so those are prose-only too, not
 *   forced into `rewards`.
 * - `era` -- no era tag was found stated on this quest's own page, so
 *   it's left unset rather than guessed (decisions/quest-era-flagging.md).
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

const zoneId = "zone:ak-anon";
const giverId = "npc:ak-anon:sanfyrd-featherhead";
addNode({ id: giverId, label: "Sanfyrd Featherhead", type: "npc", roles: ["quest_giver"] });
addEdge(giverId, zoneId, "located_in");

const questId = "quest:scrap-metal-quest";
addNode({
  id: questId,
  label: "Scrap Metal Quest",
  type: "quest",
  description: "Sanfyrd Featherhead buys scrap metal off Ak'Anon's adventurers four pieces at a time for experience, coin, and a chance at real gear -- a repeatable turn-in, not a one-time quest.",
  classes: [],
  minLevel: 5,
  steps: [
    "Collect scrap metal, four pieces at a time (dropped by rogue clockworks in Steamfont Mountains)",
    "Turn the scrap metal in to Sanfyrd Featherhead in Ak'Anon for experience, coin, and a chance at a named reward -- an Earring of Fire Reflection, a Gnome Glow Rod, a Small Scarab Helm, generic Rusty Weapons, or (rarely) a Tinmizer's Fabulous Compactor",
  ],
  wiki_title: "Scrap Metal Quest",
});
addEdge(giverId, questId, "starts");
addEdge(questId, zoneId, "located_in");

const earringId = "item:earring-of-fire-reflection";
addNode({
  id: earringId,
  label: "Earring of Fire Reflection",
  type: "item",
  slots: ["Ear"],
  ac: 1,
  resists: { fire: 5 },
  weight: 0,
  size: "Tiny",
  source: "Scrap Metal Quest reward (Sanfyrd Featherhead, Ak'Anon)",
});
addEdge(questId, earringId, "rewards");

const glowRodId = "item:gnome-glow-rod";
addNode({
  id: glowRodId,
  label: "Gnome Glow Rod",
  type: "item",
  slots: ["Primary", "Secondary"],
  weight: 0.3,
  size: "Tiny",
  lightSource: true,
  magic: true,
  source: "Scrap Metal Quest reward (Sanfyrd Featherhead, Ak'Anon)",
});
addEdge(questId, glowRodId, "rewards");

const helmId = "item:small-scarab-helm";
addNode({
  id: helmId,
  label: "Small Scarab Helm",
  type: "item",
  slots: ["Head"],
  ac: 4,
  stats: { cha: -1 },
  weight: 1.5,
  size: "Small",
  classes: ["bard", "cleric", "druid", "monk", "paladin", "ranger", "rogue", "shaman", "shadow knight", "warrior"],
  source: "Scrap Metal Quest reward (Sanfyrd Featherhead, Ak'Anon); also a reward of the Scarab Armor Quests",
});
addEdge(questId, helmId, "rewards");

const IMPROVED_FACTIONS = ["King AkAnon", "Merchants of AkAnon", "Gem Choppers"];
for (const label of IMPROVED_FACTIONS) {
  const id = `faction:${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
  addNode({ id, label, type: "faction" });
  addEdge(questId, id, "rewards");
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 033 complete: Scrap Metal Quest added");
