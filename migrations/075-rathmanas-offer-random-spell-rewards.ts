/**
 * Migration 075: gives Rathmana's Traveling Offer (migration 073) real
 * `quest --rewards--> spell` edges, tagged with the new `randomGroup`
 * attribute (decisions/quest-reward-modeling.md), for the five named spells
 * on its own eqlwiki.com page: Quickness, Lightning Bolt, Lifedraw, Charm,
 * Column of Fire. Migration 073 left this quest's reward prose-only because
 * randomGroup didn't exist yet. The wiki's own wording ("options seen
 * include... and several others") states the pool isn't exhaustive, so only
 * the five confirmed spells get edges -- the quest's description keeps the
 * "and others" caveat in prose rather than the graph implying a closed set.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const questId = "quest:rathmanas-traveling-offer";
const group = "rathmanas-traveling-offer-drop";
const spellIds = ["spell:quickness", "spell:lightning-bolt", "spell:lifedraw", "spell:charm", "spell:column-of-fire"];

for (const spellId of spellIds) {
  graph.edges.push({
    data: { id: `e-rewards-${graph.edges.length + 1}`, source: questId, target: spellId, type: "rewards", randomGroup: group },
  });
}

const quest = graph.nodes.find((n: { data: { id: string } }) => n.data.id === questId);
if (quest) {
  quest.data.description =
    "Rathmana Allin in the Southern Desert of Ro offers a magical gamble: pay 30 gold for one random spell scroll, or, failing that, a Rotted Illegible Scroll -- no exchanges. Confirmed spells in the pool include Quickness, Lightning Bolt, Lifedraw, Charm, and Column of Fire, though the wiki notes there are several others not individually confirmed. Improves Temple Of Sol Ro faction.";
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 075 complete: Rathmana's Traveling Offer now rewards 5 spells as a real randomGroup");
