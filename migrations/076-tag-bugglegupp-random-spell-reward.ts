/**
 * Migration 076: tags Bugglegupp (Quest)'s four `quest --rewards--> spell`
 * edges with `randomGroup` (decisions/quest-reward-modeling.md). Predates
 * that attribute -- its own description already said "in exchange for a
 * random starter caster spell," but the reward edges themselves (added
 * before migration 074/075 introduced randomGroup) had no way to say so,
 * so they rendered as four guaranteed spells instead of a pick-one pool.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const questId = "quest:bugglegupp-quest";
const group = "bugglegupp-starter-spell";
const spellIds = ["spell:elementalkin-air", "spell:elementalkin-earth", "spell:elementaling-fire", "spell:elementaling-water"];

for (const e of graph.edges) {
  if (e.data.source === questId && e.data.type === "rewards" && spellIds.includes(e.data.target)) {
    e.data.randomGroup = group;
  }
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 076 complete: tagged Bugglegupp's 4 spell reward edges with randomGroup");
