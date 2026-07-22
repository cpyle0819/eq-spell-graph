/**
 * Migration 099: models "Crafted Armor Quests" from GitHub issue #26's
 * "Quest Groups" tracking section -- an 8-piece Warrior armor set, two
 * givers in Southern Karana (Shakrn Meadowgreen has 4 pieces, Ulan
 * Meadowgreen has 4), same unordered quest_group shape as migration 098's
 * Ivy Etched Armor Quests (decisions/quest-group-node-type.md). Researched
 * directly against eqlwiki.com, following
 * decisions/eqlwiki-quest-research-method.md.
 *
 * No faction requirement stated on the wiki page (unlike most other
 * per-class armor quest_groups modeled so far), so no addFactionReward
 * call. Race restriction "ALL except IKS" on 7 of the 8 pieces modeled as
 * an explicit race list (all 13 playable races minus iksar); the
 * Breastplate is the one piece stated as "ALL" with no exclusion.
 *
 * No new zone needed -- Southern Karana already exists in the graph
 * (referenced by the Bread Shipment quests). Shakrn/Ulan Meadowgreen are
 * new NPC nodes, distinct from the already-modeled Jarlen Meadowgreen
 * (Bread Shipment's vendor, not a node itself, just narrative text).
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, addGiver, save, slug } = loadGraph(import.meta.dir);

const ALL_RACES_EXCEPT_IKSAR = [
  "barbarian", "dark elf", "dwarf", "erudite", "gnome", "half elf",
  "halfling", "high elf", "human", "ogre", "troll", "wood elf",
];

const zoneId = "zone:southern-karana";
const shakrnId = "npc:southern-karana:shakrn-meadowgreen";
const ulanId = "npc:southern-karana:ulan-meadowgreen";
addGiver(shakrnId, "Shakrn Meadowgreen", zoneId);
addGiver(ulanId, "Ulan Meadowgreen", zoneId);

const groupId = "quest_group:crafted-armor-quests";
addNode({
  id: groupId,
  label: "Crafted Armor Quests",
  type: "quest_group",
  classes: ["warrior"],
  minLevel: 25,
  description:
    "Shakrn Meadowgreen and Ulan Meadowgreen in Southern Karana each trade a set of quest items for one piece of Crafted armor. Eight independent sub-quests, no ordering between them (Shakrn has four pieces, Ulan has four).",
  wiki_title: "Crafted Armor Quests",
});
addEdge(shakrnId, groupId, "starts");
addEdge(ulanId, groupId, "starts");
addEdge(groupId, zoneId, "located_in");

const pieces = [
  { label: "Vambraces", giverId: shakrnId, giverLabel: "Shakrn Meadowgreen", items: "2 Fire Emeralds and 1 Griffon Eye", reward: "Crafted Vambraces", slots: ["Arms"], ac: 12, stats: { str: 1 }, resists: { disease: 2, poison: 2 }, weight: 6.5, size: "Small", race: ALL_RACES_EXCEPT_IKSAR },
  { label: "Plate Boots", giverId: shakrnId, giverLabel: "Shakrn Meadowgreen", items: "2 Sapphires and 1 Goblin Frost Totem", reward: "Crafted Plate Boots", slots: ["Feet"], ac: 12, stats: { agi: 5 }, weight: 6.5, size: "Medium", race: ALL_RACES_EXCEPT_IKSAR },
  { label: "Gauntlets", giverId: shakrnId, giverLabel: "Shakrn Meadowgreen", items: "2 Star Rubies and 1 Aviak Charm", reward: "Crafted Gauntlets", slots: ["Hands"], ac: 12, stats: { str: 5 }, weight: 5.0, size: "Small", race: ALL_RACES_EXCEPT_IKSAR },
  { label: "Helm", giverId: shakrnId, giverLabel: "Shakrn Meadowgreen", items: "1 Ruby and 1 Goblin Fire Totem", reward: "Crafted Helm", slots: ["Head"], ac: 14, stats: { cha: 5, wis: 5 }, resists: { magic: 2 }, weight: 6.0, size: "Small", race: ALL_RACES_EXCEPT_IKSAR },
  { label: "Breastplate", giverId: ulanId, giverLabel: "Ulan Meadowgreen", items: "3 Rubies and 1 Werewolf Talon", reward: "Crafted Breastplate", slots: ["Chest"], ac: 22, stats: { sta: 5 }, hp: 25, weight: 10.0, size: "Large" },
  { label: "Bracers", giverId: ulanId, giverLabel: "Ulan Meadowgreen", items: "1 Sapphire and 1 Bunch of Optic Nerves", reward: "Crafted Bracers", slots: ["Wrist"], ac: 10, stats: { dex: 2, int: 2 }, weight: 4.0, size: "Small", race: ALL_RACES_EXCEPT_IKSAR },
  { label: "Greaves", giverId: ulanId, giverLabel: "Ulan Meadowgreen", items: "2 Star Rubies and 1 Dark Circlet", reward: "Crafted Greaves", slots: ["Legs"], ac: 14, stats: { str: 1 }, resists: { fire: 2, cold: 2 }, weight: 7.5, size: "Large", race: ALL_RACES_EXCEPT_IKSAR },
  { label: "Pauldron", giverId: ulanId, giverLabel: "Ulan Meadowgreen", items: "1 Fire Emerald and three fractured rune pieces", reward: "Crafted Pauldron", slots: ["Shoulders"], ac: 12, stats: { str: 2 }, resists: { magic: 2 }, weight: 4.5, size: "Small", race: ALL_RACES_EXCEPT_IKSAR },
] as const;

for (const piece of pieces) {
  const questId = `quest:crafted-armor-quests-${slug(piece.label)}`;
  addNode({
    id: questId,
    label: `Crafted Armor Quests: ${piece.label}`,
    type: "quest",
    classes: ["warrior"],
    minLevel: 25,
    description: `Turn in ${piece.items} to ${piece.giverLabel} in Southern Karana for the ${piece.reward}.`,
    steps: [`Gather ${piece.items}`, `Turn them in to ${piece.giverLabel} in Southern Karana`],
    wiki_title: "Crafted Armor Quests",
  });
  addEdge(piece.giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, groupId, "member_of");

  const rewardId = `item:${slug(piece.reward)}`;
  addNode({
    id: rewardId,
    label: piece.reward,
    type: "item",
    classes: ["warrior"],
    ...("race" in piece ? { race: piece.race } : {}),
    slots: piece.slots,
    magic: true,
    ac: piece.ac,
    stats: piece.stats,
    ...("hp" in piece ? { hp: piece.hp } : {}),
    ...("resists" in piece ? { resists: piece.resists } : {}),
    weight: piece.weight,
    size: piece.size,
    source: `Crafted Armor Quests: ${piece.label} reward (${piece.giverLabel}, Southern Karana)`,
  });
  addEdge(questId, rewardId, "rewards");
}

save();

console.log(
  "Migration 099 complete: added Crafted Armor Quests as an 8-piece quest_group (Shakrn Meadowgreen x4, Ulan Meadowgreen x4, Southern Karana)."
);
