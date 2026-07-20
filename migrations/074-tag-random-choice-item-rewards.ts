/**
 * Migration 074: tags existing `quest --rewards--> item` edges with the new
 * `randomGroup` attribute (decisions/quest-reward-modeling.md) on the two
 * quests already in the graph whose item rewards are a random-choice pool,
 * not a guaranteed set: Heretic Heads (common headband vs. rare sash) and
 * Putrid Skeletons (four-tier drop table). No new nodes; both quests' item
 * rewards already exist from migrations 072 and 073.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

function tagRandomGroup(questId: string, itemIds: string[], group: string) {
  for (const e of graph.edges) {
    if (e.data.source === questId && e.data.type === "rewards" && itemIds.includes(e.data.target)) {
      e.data.randomGroup = group;
    }
  }
}

tagRandomGroup("quest:heretic-heads", ["item:kejekan-tribal-headband", "item:swiftclaw-sash"], "heretic-heads-drop");
tagRandomGroup(
  "quest:putrid-skeletons",
  ["item:potion-of-light-healing", "item:potion-of-disease-warding", "item:shield-of-nife", "item:skullcap-of-rodcet-nife"],
  "putrid-skeletons-drop"
);

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 074 complete: tagged 6 reward edges across 2 quests with randomGroup");
