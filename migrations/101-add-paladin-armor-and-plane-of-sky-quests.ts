/**
 * Migration 101: models Paladin Kael Armor Quests, Paladin Skyshrine Armor
 * Quests, Paladin Thurgadin Armor Quests, and Paladin Plane of Sky Tests --
 * four entries from GitHub issue #26's "Quest Groups" tracking section,
 * grouped together there as "Paladin Kael/Plane of Sky/Skyshrine/Thurgadin
 * Armor Quests (Paladin Epic Quest already modeled standalone; these four
 * follow the usual per-class armor/test progression pattern)". Same
 * unordered quest_group shape (decisions/quest-group-node-type.md) already
 * used for the equivalent Warrior/Cleric/Rogue/Shadowknight/Shaman/Wizard/
 * Bard sets. Researched directly against eqlwiki.com, following
 * decisions/eqlwiki-quest-research-method.md.
 *
 * No new zones or minLevel fields -- matching the established
 * Kael/Skyshrine/Thurgadin Armor Quests pattern across other classes
 * (unlike migrations 099/100's Crafted/Darkforge Armor Quests, none of
 * those quest_groups carry a minLevel field even though their wiki pages
 * state one; kept consistent with siblings rather than the two outliers).
 * Plane of Sky Tests likewise follows the Rogue/Shadow Knight/Warrior
 * pattern: a zone-level giver (Dason Goldblade) starts the group, and two
 * named sub-testers (Gregori Lightbringer x3, Dirkog Steelhand x1) each
 * start their own tests.
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, addGiver, save, slug } = loadGraph(import.meta.dir);

// --- Paladin Kael Armor Quests ---
{
  const zoneId = "zone:kael-drakkal";
  const giverId = "npc:kael-drakkal:barlek-stonefist";
  addGiver(giverId, "Barlek Stonefist", zoneId);

  const groupId = "quest_group:paladin-kael-armor-quests";
  addNode({
    id: groupId,
    label: "Paladin Kael Armor Quests",
    type: "quest_group",
    classes: ["paladin"],
    description:
      "Barlek Stonefist in Kael Drakkal trades a set of quest items for one piece of Shining armor. Seven independent sub-quests, no ordering between them.",
    wiki_title: "Paladin Kael Armor Quests",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const pieces = [
    { label: "Helm", items: "an Ancient Tarnished Plate Helmet and 3 Crushed Coral", reward: "Shining Helm", slots: ["Head"], ac: 27, stats: { str: 3, dex: 3, sta: 3, wis: 4 }, resists: { disease: 3, magic: 2 }, mana: 30, weight: 5.5 },
    { label: "Breastplate", items: "an Ancient Tarnished Breastplate and 3 Flawless Diamonds", reward: "Shining Breastplate", slots: ["Chest"], ac: 54, stats: { str: 14, dex: 7, sta: 7, wis: 7, agi: 7 }, resists: { cold: 4, magic: 8 }, hp: 50, mana: 50, weight: 9.0, size: "Large" },
    { label: "Vambraces", items: "Ancient Tarnished Vambraces and 3 Flawed Emeralds", reward: "Shining Vambraces", slots: ["Arms"], ac: 29, stats: { str: 2, dex: 2, wis: 7 }, resists: { magic: 3, poison: 2 }, mana: 30, weight: 6.0 },
    { label: "Bracer", items: "an Ancient Tarnished Plate Bracelet and 3 Crushed Flame Emeralds", reward: "Shining Bracer", slots: ["Wrist"], ac: 21, stats: { str: 3, dex: 1, sta: 2, wis: 2, agi: 1 }, resists: { fire: 1, disease: 1 }, hp: 10, mana: 10, weight: 3.5, size: "Small" },
    { label: "Gauntlets", items: "Ancient Tarnished Plate Gauntlets and 3 Crushed Topaz", reward: "Shining Gauntlets", slots: ["Hands"], ac: 21, stats: { str: 4, dex: 1, sta: 1, wis: 2, agi: 1 }, resists: { magic: 2 }, mana: 10, weight: 4.5 },
    { label: "Greaves", items: "Ancient Tarnished Greaves and 3 Flawed Sea Sapphires", reward: "Shining Greaves", slots: ["Legs"], ac: 36, stats: { str: 10, sta: 6, wis: 6 }, resists: { fire: 1, disease: 1, cold: 1, magic: 1, poison: 1 }, weight: 7.0 },
    { label: "Boots", items: "Ancient Tarnished Plate Boots and 3 Crushed Black Marble", reward: "Shining Boots", slots: ["Feet"], ac: 28, stats: { str: 4, wis: 4 }, weight: 6.0, size: "Medium" },
  ] as const;

  for (const piece of pieces) {
    const questId = `quest:paladin-kael-armor-quests-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `Paladin Kael Armor Quests: ${piece.label}`,
      type: "quest",
      classes: ["paladin"],
      description: `Turn in ${piece.items} to Barlek Stonefist in Kael Drakkal for the ${piece.reward}.`,
      steps: [`Gather ${piece.items}`, "Turn them in to Barlek Stonefist in Kael Drakkal"],
      wiki_title: "Paladin Kael Armor Quests",
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, groupId, "member_of");

    const rewardId = `item:${slug(piece.reward)}`;
    addNode({
      id: rewardId,
      label: piece.reward,
      type: "item",
      classes: ["paladin"],
      slots: piece.slots,
      magic: true,
      ac: piece.ac,
      stats: piece.stats,
      ...("resists" in piece ? { resists: piece.resists } : {}),
      ...("hp" in piece ? { hp: piece.hp } : {}),
      ...("mana" in piece ? { mana: piece.mana } : {}),
      weight: piece.weight,
      ...("size" in piece ? { size: piece.size } : {}),
      source: `Paladin Kael Armor Quests: ${piece.label} reward (Barlek Stonefist, Kael Drakkal)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// --- Paladin Skyshrine Armor Quests ---
{
  const zoneId = "zone:skyshrine";
  const giverId = "npc:skyshrine:adwetram-fe-dhar";
  addGiver(giverId, "Adwetram Fe`Dhar", zoneId);

  const groupId = "quest_group:paladin-skyshrine-armor-quests";
  addNode({
    id: groupId,
    label: "Paladin Skyshrine Armor Quests",
    type: "quest_group",
    classes: ["paladin"],
    description:
      "Adwetram Fe`Dhar in Skyshrine trades a set of quest items for one piece of Scaled Knight's armor. Seven independent sub-quests, no ordering between them.",
    wiki_title: "Paladin Skyshrine Armor Quests",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const pieces = [
    { label: "Helm", items: "an Unadorned Plate Helmet and 3 Crushed Coral", reward: "Scaled Knight's Helm", slots: ["Head"], ac: 22, stats: { str: 3, sta: 6, wis: 6 }, hp: 30, resists: { cold: 5, magic: 5 }, weight: 5.5, size: "Small" },
    { label: "Breastplate", items: "an Unadorned Breastplate and 3 Flawless Diamonds", reward: "Scaled Knight's Breastplate", slots: ["Chest"], ac: 50, stats: { str: 14, dex: 8, sta: 8, wis: 9, agi: 8 }, hp: 70, mana: 60, resists: { disease: 5, magic: 9 }, weight: 9.0, size: "Large" },
    { label: "Vambraces", items: "Unadorned Plate Vambraces and 3 Flawed Emeralds", reward: "Scaled Knight's Vambraces", slots: ["Arms"], ac: 25, stats: { str: 4, dex: 3, sta: 7 }, hp: 50, resists: { fire: 3, magic: 5 }, weight: 6.0 },
    { label: "Bracer", items: "an Unadorned Plate Bracer and 3 Crushed Flame Emeralds", reward: "Scaled Knight's Bracer", slots: ["Wrist"], ac: 18, stats: { str: 3, dex: 2, sta: 4, wis: 3, agi: 2 }, hp: 10, mana: 10, resists: { poison: 1 }, weight: 3.5, size: "Small" },
    { label: "Gauntlets", items: "Unadorned Plate Gauntlets and 3 Crushed Topaz", reward: "Scaled Knight's Gauntlets", slots: ["Hands"], ac: 18, stats: { str: 3, dex: 1, sta: 3, wis: 2, agi: 1 }, hp: 40, mana: 10, resists: { magic: 5 }, weight: 4.5, size: "Small" },
    { label: "Greaves", items: "Unadorned Plate Greaves and 3 Flawed Sea Sapphires", reward: "Scaled Knight's Greaves", slots: ["Legs"], ac: 31, stats: { str: 7, dex: 10, sta: 5, wis: 7 }, hp: 60, resists: { fire: 4, disease: 4, cold: 4, magic: 4, poison: 4 }, weight: 7.0, size: "Large" },
    { label: "Boots", items: "Unadorned Plate Boots and 3 Crushed Black Marble", reward: "Scaled Knight's Boots", slots: ["Feet"], ac: 24, stats: { str: 3, dex: 2, sta: 6, wis: 2, agi: 2 }, resists: { disease: 3, poison: 3 }, weight: 6.0 },
  ] as const;

  for (const piece of pieces) {
    const questId = `quest:paladin-skyshrine-armor-quests-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `Paladin Skyshrine Armor Quests: ${piece.label}`,
      type: "quest",
      classes: ["paladin"],
      description: `Turn in ${piece.items} to Adwetram Fe\`Dhar in Skyshrine for the ${piece.reward}.`,
      steps: [`Gather ${piece.items}`, "Turn them in to Adwetram Fe`Dhar in Skyshrine"],
      wiki_title: "Paladin Skyshrine Armor Quests",
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, groupId, "member_of");

    const rewardId = `item:${slug(piece.reward)}`;
    addNode({
      id: rewardId,
      label: piece.reward,
      type: "item",
      classes: ["paladin"],
      slots: piece.slots,
      magic: true,
      ac: piece.ac,
      stats: piece.stats,
      ...("hp" in piece ? { hp: piece.hp } : {}),
      ...("mana" in piece ? { mana: piece.mana } : {}),
      ...("resists" in piece ? { resists: piece.resists } : {}),
      weight: piece.weight,
      ...("size" in piece ? { size: piece.size } : {}),
      source: `Paladin Skyshrine Armor Quests: ${piece.label} reward (Adwetram Fe\`Dhar, Skyshrine)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// --- Paladin Thurgadin Armor Quests ---
{
  const zoneId = "zone:thurgadin";
  const giverId = "npc:thurgadin:battlepriest-daragor";
  addGiver(giverId, "Battlepriest Daragor", zoneId);

  const groupId = "quest_group:paladin-thurgadin-armor-quests";
  addNode({
    id: groupId,
    label: "Paladin Thurgadin Armor Quests",
    type: "quest_group",
    classes: ["paladin"],
    description:
      "Battlepriest Daragor in Thurgadin trades a set of quest items for one piece of Runed Protector's armor. Seven independent sub-quests, no ordering between them.",
    wiki_title: "Paladin Thurgadin Armor Quests",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const pieces = [
    { label: "Helm", items: "a Corroded Plate Helmet and 3 Crushed Coral", reward: "Runed Protector's Helm", slots: ["Head"], ac: 19, stats: { str: 4, dex: 3, sta: 3 }, hp: 15, mana: 15, resists: { fire: 3, magic: 2 }, weight: 5.5 },
    { label: "Breastplate", items: "a Corroded Breastplate and 3 Flawless Diamonds", reward: "Runed Protector's Breastplate", slots: ["Chest"], ac: 42, stats: { str: 6, dex: 8, sta: 8, wis: 8, agi: 8 }, hp: 40, mana: 60, resists: { magic: 7, poison: 3 }, weight: 9.0 },
    { label: "Vambraces", items: "Corroded Plate Vambraces and 3 Flawed Emeralds", reward: "Runed Protector's Vambraces", slots: ["Arms"], ac: 19, stats: { str: 7 }, mana: 30, resists: { cold: 2, magic: 3 }, weight: 6.0, size: "Small" },
    { label: "Bracer", items: "a Corroded Plate Bracer and 3 Crushed Flame Emeralds", reward: "Runed Protector's Bracer", slots: ["Wrist"], ac: 15, stats: { str: 2, dex: 1, sta: 1, wis: 2, agi: 1 }, hp: 10, mana: 10, resists: { cold: 1 }, weight: 3.5, size: "Small" },
    { label: "Gauntlets", items: "Corroded Plate Gauntlets and 3 Crushed Topaz", reward: "Runed Protector's Gauntlets", slots: ["Hands"], ac: 15, stats: { str: 2, dex: 1, sta: 1, wis: 2, agi: 1 }, mana: 10, resists: { magic: 2 }, weight: 4.5, size: "Small" },
    { label: "Greaves", items: "Corroded Plate Greaves and 3 Flawed Sea Sapphires", reward: "Runed Protector's Greaves", slots: ["Legs"], ac: 24, stats: { str: 10, dex: 4, sta: 4 }, hp: 60, resists: { fire: 1, disease: 1, cold: 1, magic: 1, poison: 1 }, weight: 7.0, size: "Large" },
    { label: "Boots", items: "Corroded Plate Boots and 3 Crushed Black Marble", reward: "Runed Protector's Boots", slots: ["Feet"], ac: 21, stats: { str: 3, wis: 2 }, weight: 6.0, size: "Medium" },
  ] as const;

  for (const piece of pieces) {
    const questId = `quest:paladin-thurgadin-armor-quests-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `Paladin Thurgadin Armor Quests: ${piece.label}`,
      type: "quest",
      classes: ["paladin"],
      description: `Turn in ${piece.items} to Battlepriest Daragor in Thurgadin for the ${piece.reward}.`,
      steps: [`Gather ${piece.items}`, "Turn them in to Battlepriest Daragor in Thurgadin"],
      wiki_title: "Paladin Thurgadin Armor Quests",
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, groupId, "member_of");

    const rewardId = `item:${slug(piece.reward)}`;
    addNode({
      id: rewardId,
      label: piece.reward,
      type: "item",
      classes: ["paladin"],
      slots: piece.slots,
      magic: true,
      ac: piece.ac,
      stats: piece.stats,
      ...("hp" in piece ? { hp: piece.hp } : {}),
      ...("mana" in piece ? { mana: piece.mana } : {}),
      ...("resists" in piece ? { resists: piece.resists } : {}),
      weight: piece.weight,
      ...("size" in piece ? { size: piece.size } : {}),
      source: `Paladin Thurgadin Armor Quests: ${piece.label} reward (Battlepriest Daragor, Thurgadin)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// --- Paladin Plane of Sky Tests ---
{
  const zoneId = "zone:plane-of-sky";
  const overviewGiverId = "npc:plane-of-sky:dason-goldblade";
  const lightbringerId = "npc:plane-of-sky:gregori-lightbringer";
  const steelhandId = "npc:plane-of-sky:dirkog-steelhand";
  addGiver(overviewGiverId, "Dason Goldblade", zoneId);
  addGiver(lightbringerId, "Gregori Lightbringer", zoneId);
  addGiver(steelhandId, "Dirkog Steelhand", zoneId);

  const groupId = "quest_group:paladin-plane-of-sky-tests";
  addNode({
    id: groupId,
    label: "Paladin Plane of Sky Tests",
    type: "quest_group",
    classes: ["paladin"],
    description:
      "Dason Goldblade in the Plane of Sky directs Paladins to two testers, Gregori Lightbringer (Sacrifice, Love, Compassion) or Dirkog Steelhand (Spirit), each offering independent item-turn-in tests for a named reward. Four independent sub-quests, no ordering between them.",
    wiki_title: "Paladin Plane of Sky Tests",
  });
  addEdge(overviewGiverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const tests = [
    { label: "Test of Sacrifice", giverId: lightbringerId, giverLabel: "Gregori Lightbringer", items: "a griffon statuette, a spiroc peace totem, and a bixie sword blade", reward: "Aldryn, Blade of the Ocean", item: { slots: ["Primary"], damage: 20, delay: 26, skill: "1H Slashing", stats: { str: 10, sta: 10, wis: 8 }, weight: 2.0, size: "Medium", lore: true, noTrade: true } },
    { label: "Test of Love", giverId: lightbringerId, giverLabel: "Gregori Lightbringer", items: "a dark spiroc feather, ethereal topaz, and a sphinxian claw", reward: "Thelvorn, Blade of Light", item: { slots: ["Primary"], damage: 20, delay: 26, skill: "1H Slashing", stats: { wis: 15 }, effect: "Dismiss Summoned at Level 45", weight: 3.0, size: "Medium", lore: true, noTrade: true } },
    { label: "Test of Compassion", giverId: lightbringerId, giverLabel: "Gregori Lightbringer", items: "an efreeti two handed sword, dulcet nectar, a golden hilt, and a large sky diamond", reward: "Truvinan", item: { slots: ["Primary"], damage: 32, delay: 40, skill: "2H Slashing", effect: "Dismiss Undead at Level 45", weight: 8.0, size: "Large", noTrade: true } },
    { label: "Test of Spirit", giverId: steelhandId, giverLabel: "Dirkog Steelhand", items: "a silvery girdle, a diaphanous globe, and an ivory sky diamond", reward: "Girdle of Faith", item: { slots: ["Waist"], ac: 10, stats: { str: 6, wis: 6, agi: 6 }, effect: "Haste +41%", weight: 1.0, size: "Small" } },
  ] as const;

  for (const test of tests) {
    const questId = `quest:paladin-plane-of-sky-${slug(test.label)}`;
    addNode({
      id: questId,
      label: `Paladin Plane of Sky Tests: ${test.label}`,
      type: "quest",
      classes: ["paladin"],
      description: `Bring ${test.items} to ${test.giverLabel} in the Plane of Sky for ${test.reward}.`,
      steps: [`Gather ${test.items}`, `Turn them in to ${test.giverLabel} in the Plane of Sky`],
      wiki_title: "Paladin Plane of Sky Tests",
    });
    addEdge(test.giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, groupId, "member_of");

    const rewardId = `item:${slug(test.reward)}`;
    addNode({
      id: rewardId,
      label: test.reward,
      type: "item",
      classes: ["paladin"],
      magic: true,
      ...test.item,
      source: `Paladin Plane of Sky Tests: ${test.label} reward (${test.giverLabel}, Plane of Sky)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

save();

console.log(
  "Migration 101 complete: added Paladin Kael/Skyshrine/Thurgadin Armor Quests (7 pieces each) and Paladin Plane of Sky Tests (4 tests) as quest_groups."
);
