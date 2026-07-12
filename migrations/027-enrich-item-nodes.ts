/**
 * Migration 027: Enrich item nodes with a real stat schema (ItemDetails in
 * src/graph.ts), modeled on eqlwiki.com item pages -- Small Scarab Helm,
 * Abjurer's Earring, Acid Etched War Sword, Gnome Glow Rod (see
 * decisions/item-node-schema.md for the field-by-field mapping). Adds a
 * second item reward (a weapon) to the migration-026 test quest so both
 * observed archetypes -- armor with ac/resists/weight, and a weapon with
 * damage/delay/skill -- are exercised in the UI, not just a bare container.
 *
 * No scraping (per CLAUDE.md) -- these are two hand-authored sample items
 * shaped like real wiki items, not imported wiki data.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");

const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

function node(id: string) {
  return graph.nodes.find((n: { data: { id: string } }) => n.data.id === id)?.data;
}

const sack = node("item:sturdy-ore-sack");
if (sack) {
  Object.assign(sack, {
    slots: ["Waist"],
    ac: 1,
    weight: 2.0,
    size: "Small",
    magic: false,
    source: "Quest reward: Ore for the Anvil",
  });
}

const hammerId = "item:anvil-forged-warhammer";
if (!graph.nodes.some((n: { data: { id: string } }) => n.data.id === hammerId)) {
  graph.nodes.push({
    data: {
      id: hammerId,
      label: "Anvil-Forged Warhammer",
      type: "item",
      slots: ["Primary"],
      damage: 7,
      delay: 26,
      skill: "1H Blunt",
      stats: { str: 2 },
      classes: ["warrior", "cleric", "paladin", "shadow knight"],
      weight: 4.2,
      size: "Medium",
      magic: true,
      source: "Quest reward: Ore for the Anvil",
    },
  });
}

const hasHammerReward = graph.edges.some(
  (e: { data: { source: string; target: string; type: string } }) =>
    e.data.source === "quest:ore-for-the-anvil" && e.data.target === hammerId && e.data.type === "rewards"
);
if (!hasHammerReward) {
  graph.edges.push({
    data: { id: `e-rewards-${graph.edges.length + 1}`, source: "quest:ore-for-the-anvil", target: hammerId, type: "rewards" },
  });
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 027 complete: enriched item:sturdy-ore-sack, added item:anvil-forged-warhammer + reward edge");
