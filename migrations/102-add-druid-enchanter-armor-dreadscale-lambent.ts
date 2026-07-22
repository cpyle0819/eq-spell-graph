/**
 * Migration 102: models 10 quest_groups from GitHub issue #26's "Quest
 * Groups" tracking section (decisions/quest-group-node-type.md):
 *
 * - Druid Kael/Skyshrine/Thurgadin Armor Quests + Plane of Sky Tests
 * - Enchanter Kael/Skyshrine/Thurgadin Armor Quests + Plane of Sky Tests
 * - Dreadscale Armor (8-piece Shadow Knight set, East Cabilis)
 * - Lambent Armor Quests (7-piece Bard set, Temple of Solusek Ro)
 *
 * The Druid/Enchanter sets follow the same per-class armor/test progression
 * pattern already modeled for Bard/Cleric/Paladin/Rogue/Shadowknight/Shaman/
 * Warrior/Wizard -- no minLevel field, matching that majority (see
 * migration 101's note on the two Crafted/Darkforge outliers that do carry
 * one). Druid/Enchanter Epic Quests are untouched here -- issue #26 defers
 * those to the Questlines section for their own research pass.
 *
 * Dreadscale and Lambent are the same two-giver-split shape as Crafted/
 * Darkforge Armor Quests (migrations 099/100), so they keep the minLevel
 * field their wiki pages state, consistent with that pair.
 *
 * Researched directly against eqlwiki.com, following
 * decisions/eqlwiki-quest-research-method.md. No new zones needed -- Kael
 * Drakkal, Skyshrine, Thurgadin, Plane of Sky, East Cabilis, and Temple of
 * Solusek Ro all already exist in the graph.
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, addGiver, save, slug } = loadGraph(import.meta.dir);

function addArmorSet(opts: {
  classId: string;
  className: string;
  zoneId: string;
  zoneLabel: string;
  giverId: string;
  giverLabel: string;
  groupSlug: string;
  groupLabel: string;
  rewardPrefix: string;
  pieces: readonly {
    label: string;
    items: string;
    reward: string;
    slots: string[];
    ac: number;
    stats?: Record<string, number>;
    resists?: Record<string, number>;
    hp?: number;
    mana?: number;
    weight: number;
    size?: string;
  }[];
}) {
  addGiver(opts.giverId, opts.giverLabel, opts.zoneId);

  const groupId = `quest_group:${opts.groupSlug}`;
  addNode({
    id: groupId,
    label: opts.groupLabel,
    type: "quest_group",
    classes: [opts.classId],
    description: `${opts.giverLabel} in ${opts.zoneLabel} trades a set of quest items for one piece of ${opts.rewardPrefix} armor. Seven independent sub-quests, no ordering between them.`,
    wiki_title: opts.groupLabel,
  });
  addEdge(opts.giverId, groupId, "starts");
  addEdge(groupId, opts.zoneId, "located_in");

  for (const piece of opts.pieces) {
    const questId = `quest:${opts.groupSlug}-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `${opts.groupLabel}: ${piece.label}`,
      type: "quest",
      classes: [opts.classId],
      description: `Turn in ${piece.items} to ${opts.giverLabel} in ${opts.zoneLabel} for the ${piece.reward}.`,
      steps: [`Gather ${piece.items}`, `Turn them in to ${opts.giverLabel} in ${opts.zoneLabel}`],
      wiki_title: opts.groupLabel,
    });
    addEdge(opts.giverId, questId, "starts");
    addEdge(questId, opts.zoneId, "starts_in");
    addEdge(questId, opts.zoneId, "located_in");
    addEdge(questId, groupId, "member_of");

    const rewardId = `item:${slug(piece.reward)}`;
    addNode({
      id: rewardId,
      label: piece.reward,
      type: "item",
      classes: [opts.classId],
      slots: piece.slots,
      magic: true,
      ac: piece.ac,
      ...(piece.stats ? { stats: piece.stats } : {}),
      ...(piece.resists ? { resists: piece.resists } : {}),
      ...(piece.hp !== undefined ? { hp: piece.hp } : {}),
      ...(piece.mana !== undefined ? { mana: piece.mana } : {}),
      weight: piece.weight,
      ...(piece.size ? { size: piece.size } : {}),
      source: `${opts.groupLabel}: ${piece.label} reward (${opts.giverLabel}, ${opts.zoneLabel})`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// --- Druid Kael Armor Quests ---
addArmorSet({
  classId: "druid",
  className: "Druid",
  zoneId: "zone:kael-drakkal",
  zoneLabel: "Kael Drakkal",
  giverId: "npc:kael-drakkal:jaglorm-ygorr",
  giverLabel: "Jaglorm Ygorr",
  groupSlug: "druid-kael-armor-quests",
  groupLabel: "Druid Kael Armor Quests",
  rewardPrefix: "Nature Walker's",
  pieces: [
    { label: "Circlet", items: "an Ancient Leather Cap and 3 Crushed Onyx Sapphires", reward: "Nature Walker's Circlet", slots: ["Head"], ac: 11, stats: { wis: 9, agi: 2 }, resists: { fire: 1, disease: 1, cold: 1, magic: 3, poison: 1 }, mana: 20, weight: 0.6 },
    { label: "Chestguard", items: "an Ancient Leather Tunic and 3 Black Marble", reward: "Nature Walker's Chestguard", slots: ["Chest"], ac: 27, stats: { str: 5, dex: 5, wis: 15 }, resists: { fire: 3, disease: 2, cold: 2, magic: 10, poison: 3 }, hp: 40, mana: 80, weight: 3.5 },
    { label: "Vambraces", items: "Ancient Leather Sleeves and 3 Jaundice Gems", reward: "Nature Walker's Vambraces", slots: ["Arms"], ac: 10, stats: { wis: 2 }, resists: { magic: 2 }, hp: 20, mana: 30, weight: 1.5 },
    { label: "Bracer", items: "an Ancient Leather Bracelet and 3 Crushed Opals", reward: "Nature Walker's Bracer", slots: ["Wrist"], ac: 9, stats: { wis: 9 }, resists: { disease: 2 }, mana: 20, weight: 1.0 },
    { label: "Gauntlets", items: "Ancient Leather Gloves and 3 Crushed Lava Rubies", reward: "Nature Walker's Gauntlets", slots: ["Hands"], ac: 10, stats: { sta: 2, wis: 2, agi: 2 }, resists: { cold: 1, magic: 2 }, mana: 25, weight: 1.5 },
    { label: "Greaves", items: "Ancient Leather Leggings and 3 Chipped Onyx Sapphires", reward: "Nature Walker's Greaves", slots: ["Legs"], ac: 14, stats: { dex: 6, wis: 7 }, resists: { fire: 3, cold: 3 }, hp: 20, mana: 70, weight: 4.0 },
    { label: "Boots", items: "Ancient Leather Boots and 3 Crushed Flame Emeralds", reward: "Nature Walker's Boots", slots: ["Feet"], ac: 11, stats: { agi: 13 }, resists: { fire: 2, cold: 2, magic: 2 }, mana: 10, weight: 2.5 },
  ],
});

// --- Druid Skyshrine Armor Quests ---
addArmorSet({
  classId: "druid",
  className: "Druid",
  zoneId: "zone:skyshrine",
  zoneLabel: "Skyshrine",
  giverId: "npc:skyshrine:qynydd-fedhar",
  giverLabel: "Qynydd Fe`Dhar",
  groupSlug: "druid-skyshrine-armor-quests",
  groupLabel: "Druid Skyshrine Armor Quests",
  rewardPrefix: "Woven Grass",
  pieces: [
    { label: "Headband", items: "an Unadorned Leather Cap and 3 Crushed Onyx Sapphires", reward: "Woven Grass Headband", slots: ["Head"], ac: 8, stats: { str: 3, dex: 3, wis: 10 }, resists: { disease: 3, cold: 3, magic: 5 }, mana: 15, weight: 0.6 },
    { label: "Chestguard", items: "an Unadorned Leather Tunic and 3 Black Marble", reward: "Woven Grass Chestguard", slots: ["Chest"], ac: 20, stats: { str: 5, sta: 7, wis: 14 }, resists: { fire: 9, magic: 9, poison: 9 }, hp: 50, mana: 80, weight: 3.5 },
    { label: "Vambraces", items: "Unadorned Leather Sleeves and 3 Jaundice Gems", reward: "Woven Grass Vambraces", slots: ["Arms"], ac: 7, stats: { sta: 2, wis: 5 }, hp: 30, mana: 30, weight: 1.5 },
    { label: "Bracelet", items: "an Unadorned Leather Bracelet and 3 Crushed Opals", reward: "Woven Grass Bracelet", slots: ["Wrist"], ac: 7, stats: { wis: 9 }, resists: { cold: 4, magic: 4, poison: 4 }, hp: 30, mana: 30, weight: 1.0 },
    { label: "Gauntlets", items: "Unadorned Leather Gloves and 3 Crushed Lava Rubies", reward: "Woven Grass Gauntlets", slots: ["Hands"], ac: 8, stats: { dex: 2, sta: 2, wis: 3 }, resists: { disease: 5, magic: 5 }, mana: 45, weight: 1.5 },
    { label: "Greaves", items: "Unadorned Leather Leggings and 3 Chipped Onyx Sapphires", reward: "Woven Grass Greaves", slots: ["Legs"], ac: 9, stats: { sta: 5, wis: 9, agi: 6 }, resists: { poison: 3 }, hp: 20, mana: 90, weight: 4.0 },
    { label: "Boots", items: "Unadorned Leather Boots and 3 Crushed Flame Emeralds", reward: "Woven Grass Boots", slots: ["Feet"], ac: 8, stats: { dex: 15 }, resists: { fire: 2, disease: 2, cold: 2, magic: 2, poison: 2 }, mana: 50, weight: 2.5 },
  ],
});

// --- Druid Thurgadin Armor Quests ---
addArmorSet({
  classId: "druid",
  className: "Druid",
  zoneId: "zone:thurgadin",
  zoneLabel: "Thurgadin",
  giverId: "npc:thurgadin:cobi-frostbeard",
  giverLabel: "Cobi Frostbeard",
  groupSlug: "druid-thurgadin-armor-quests",
  groupLabel: "Druid Thurgadin Armor Quests",
  rewardPrefix: "Rowyl's",
  pieces: [
    { label: "Circlet", items: "an Eroded Leather Cap and 3 Crushed Onyx Sapphires", reward: "Rowyl's Circlet of Nature", slots: ["Head"], ac: 8, stats: { sta: 2, wis: 8 }, resists: { fire: 2, magic: 3, poison: 2 }, weight: 0.6 },
    { label: "Tunic", items: "an Eroded Leather Tunic and 3 Black Marble", reward: "Rowyl's Chestguard of Nature", slots: ["Chest"], ac: 20, stats: { str: 5, cha: 4, wis: 14 }, resists: { disease: 5, cold: 5, magic: 7 }, hp: 30, mana: 80, weight: 3.5 },
    { label: "Sleeves", items: "3 Jaundice Gems and a set of Eroded Leather Sleeves", reward: "Rowyl's Vambraces of Nature", slots: ["Arms"], ac: 7, stats: { wis: 2 }, mana: 30, weight: 1.5 },
    { label: "Bracers", items: "3 Crushed Opals and an Eroded Leather Bracer", reward: "Rowyl's Bracer of Nature", slots: ["Wrist"], ac: 7, stats: { wis: 7 }, resists: { fire: 2 }, mana: 20, weight: 1.0 },
    { label: "Gloves", items: "a set of Eroded Leather Gloves and 3 Crushed Lava Rubies", reward: "Rowyl's Gauntlets of Nature", slots: ["Hands"], ac: 8, stats: { sta: 2, wis: 2 }, resists: { magic: 2, poison: 1 }, mana: 25, weight: 1.5 },
    { label: "Leggings", items: "3 Chipped Onyx Sapphires and Eroded Leather Leggings", reward: "Rowyl's Greaves of Nature", slots: ["Legs"], ac: 9, stats: { str: 6, wis: 7 }, resists: { cold: 3 }, mana: 70, weight: 4.0 },
    { label: "Boots", items: "3 Crushed Flame Emeralds and a pair of Eroded Leather Boots", reward: "Rowyl's Boots of Nature", slots: ["Feet"], ac: 8, stats: { cha: 13 }, resists: { fire: 1, cold: 1, magic: 1 }, mana: 10, weight: 2.5 },
  ],
});

// --- Enchanter Kael Armor Quests ---
addArmorSet({
  classId: "enchanter",
  className: "Enchanter",
  zoneId: "zone:kael-drakkal",
  zoneLabel: "Kael Drakkal",
  giverId: "npc:kael-drakkal:stoem-lekbar",
  giverLabel: "Stoem Lekbar",
  groupSlug: "enchanter-kael-armor-quests",
  groupLabel: "Enchanter Kael Armor Quests",
  rewardPrefix: "Dazzling",
  pieces: [
    { label: "Helm", items: "an Ancient Silk Turban and 3 Crushed Flame Opals", reward: "Dazzling Circlet", slots: ["Head"], ac: 8, stats: { cha: 15, int: 10 }, resists: { disease: 2, magic: 7 }, hp: 30, mana: 20, weight: 0.2 },
    { label: "Robe", items: "an Ancient Silk Robe and 3 Pristine Emeralds", reward: "Dazzling Robe", slots: ["Chest"], ac: 14, stats: { sta: 7, cha: 7, int: 14 }, resists: { fire: 10, disease: 8, magic: 8, poison: 8 }, hp: 60, mana: 60, weight: 0.5 },
    { label: "Sleeves", items: "Ancient Silk Sleeves and 3 Flawed Topaz", reward: "Dazzling Sleeves", slots: ["Arms"], ac: 8, stats: { cha: 4, int: 5 }, resists: { fire: 4, cold: 4, magic: 2 }, hp: 10, mana: 20, weight: 0.2 },
    { label: "Wristguard", items: "an Ancient Silk Wristband and 3 Crushed Onyx Sapphires", reward: "Dazzling Wristguard", slots: ["Wrist"], ac: 6, stats: { cha: 2, int: 2, agi: 5 }, resists: { fire: 3, disease: 4, cold: 3, magic: 1, poison: 3 }, mana: 20, weight: 0.2 },
    { label: "Gloves", items: "Ancient Silk Gloves and 3 Crushed Topaz", reward: "Dazzling Gloves", slots: ["Hands"], ac: 7, stats: { int: 10, agi: 10 }, resists: { fire: 3, disease: 3, cold: 3, magic: 3, poison: 3 }, mana: 35, weight: 0.2 },
    { label: "Trousers", items: "Ancient Silk Pantaloons and 3 Nephrite", reward: "Dazzling Trousers", slots: ["Legs"], ac: 9, stats: { sta: 4, cha: 6 }, resists: { fire: 3, disease: 2, cold: 3, magic: 3, poison: 2 }, hp: 20, mana: 15, weight: 0.5 },
    { label: "Slippers", items: "Ancient Silk Boots and 3 Crushed Jaundice Gems", reward: "Dazzling Slippers", slots: ["Feet"], ac: 7, stats: { cha: 4, int: 5 }, resists: { fire: 3, disease: 3, cold: 3, magic: 2, poison: 3 }, mana: 35, weight: 0.5 },
  ],
});

// --- Enchanter Skyshrine Armor Quests ---
addArmorSet({
  classId: "enchanter",
  className: "Enchanter",
  zoneId: "zone:skyshrine",
  zoneLabel: "Skyshrine",
  giverId: "npc:skyshrine:lothieder-fedhar",
  giverLabel: "Lothieder Fe`Dhar",
  groupSlug: "enchanter-skyshrine-armor-quests",
  groupLabel: "Enchanter Skyshrine Armor Quests",
  rewardPrefix: "Illusionist's",
  pieces: [
    { label: "Headband", items: "a Tattered Silk Turban and 3 Crushed Flame Opals", reward: "Illusionist's Headband", slots: ["Head"], ac: 6, stats: { sta: 7, cha: 15, int: 10 }, resists: { fire: 2, disease: 2, cold: 2, magic: 7, poison: 2 }, hp: 15, weight: 0.2 },
    { label: "Robe", items: "a Tattered Silk Robe and 3 Pristine Emeralds", reward: "Illusionist's Robe", slots: ["Chest"], ac: 12, stats: { sta: 5, cha: 7, int: 15 }, resists: { fire: 6, disease: 6, cold: 10, magic: 6, poison: 6 }, hp: 80, mana: 80, weight: 0.5 },
    { label: "Sleeves", items: "Tattered Silk Sleeves and 3 Flawed Topaz", reward: "Illusionist's Sleeves", slots: ["Arms"], ac: 6, stats: { int: 5 }, resists: { fire: 1, disease: 4, cold: 1, magic: 1, poison: 1 }, hp: 10, mana: 20, weight: 0.2 },
    { label: "Wristguard", items: "a Tattered Silk Wristband and 3 Crushed Onyx Sapphires", reward: "Illusionist's Wristguard", slots: ["Wrist"], ac: 4, stats: { sta: 5, int: 5, agi: 5 }, resists: { magic: 1, poison: 1 }, hp: 40, mana: 20, weight: 0.2 },
    { label: "Gloves", items: "Tattered Silk Gloves and 3 Crushed Topaz", reward: "Illusionist's Gloves", slots: ["Hands"], ac: 5, stats: { int: 10, agi: 10 }, resists: { fire: 3, disease: 3, magic: 3, poison: 3 }, hp: 30, mana: 45, weight: 0.2 },
    { label: "Pantaloons", items: "Tattered Silk Pantaloons and 3 Nephrite", reward: "Illusionist's Pantaloons", slots: ["Legs"], ac: 7, stats: { sta: 5, int: 2 }, resists: { magic: 3, poison: 1 }, hp: 20, mana: 50, weight: 0.5 },
    { label: "Slippers", items: "Tattered Silk Boots and 3 Crushed Jaundice Gems", reward: "Illusionist's Slippers", slots: ["Feet"], ac: 5, stats: { sta: 7, cha: 5 }, resists: { magic: 3, poison: 3 }, hp: 30, mana: 35, weight: 0.5 },
  ],
});

// --- Enchanter Thurgadin Armor Quests ---
addArmorSet({
  classId: "enchanter",
  className: "Enchanter",
  zoneId: "zone:thurgadin",
  zoneLabel: "Thurgadin",
  giverId: "npc:thurgadin:lorekeeper-brita",
  giverLabel: "Lorekeeper Brita",
  groupSlug: "enchanter-thurgadin-armor-quests",
  groupLabel: "Enchanter Thurgadin Armor Quests",
  rewardPrefix: "Beguiler's",
  pieces: [
    { label: "Helm", items: "a Torn Enchanted Silk Turban and 3 Crushed Flame Opals", reward: "Beguiler's Crown", slots: ["Head"], ac: 6, stats: { cha: 15, int: 10 }, resists: { fire: 2, magic: 7 }, weight: 0.2 },
    { label: "Robe", items: "a Torn Enchanted Silk Robe and 3 Pristine Emeralds", reward: "Beguiler's Robe", slots: ["Chest"], ac: 12, stats: { sta: 5, cha: 7, int: 14 }, hp: 60, mana: 60, weight: 0.5 },
    { label: "Sleeves", items: "Torn Enchanted Silk Sleeves and 3 Flawed Topaz", reward: "Beguiler's Sleeves", slots: ["Arms"], ac: 6, stats: { cha: 4, int: 5 }, resists: { poison: 2 }, hp: 10, mana: 20, weight: 0.2 },
    { label: "Wristguard", items: "a Torn Enchanted Silk Wristband and 3 Crushed Onyx Sapphires", reward: "Beguiler's Wristguard", slots: ["Wrist"], ac: 4, stats: { int: 2, agi: 5 }, mana: 20, weight: 0.2 },
    { label: "Gloves", items: "Torn Enchanted Silk Gloves and 3 Crushed Topaz", reward: "Beguiler's Gloves", slots: ["Hands"], ac: 5, stats: { int: 9, agi: 9 }, mana: 35, weight: 0.2 },
    { label: "Trousers", items: "Torn Enchanted Silk Pantaloons and 3 Nephrite", reward: "Beguiler's Trousers", slots: ["Legs"], ac: 7, stats: { sta: 4, cha: 3 }, weight: 0.5 },
    { label: "Slippers", items: "Torn Enchanted Silk Boots and 3 Crushed Jaundice Gems", reward: "Beguiler's Slippers", slots: ["Feet"], ac: 5, stats: { cha: 4 }, mana: 35, weight: 0.5 },
  ],
});

// --- Druid Plane of Sky Tests ---
{
  const zoneId = "zone:plane-of-sky";
  const overviewGiverId = "npc:plane-of-sky:strandar-pinemist";
  const treewalkerId = "npc:plane-of-sky:will-treewalker";
  const moonshadowId = "npc:plane-of-sky:fenalla-moonshadow";
  addGiver(overviewGiverId, "Strandar Pinemist", zoneId);
  addGiver(treewalkerId, "Will Treewalker", zoneId);
  addGiver(moonshadowId, "Fenalla Moonshadow", zoneId);

  const groupId = "quest_group:druid-plane-of-sky-tests";
  addNode({
    id: groupId,
    label: "Druid Plane of Sky Tests",
    type: "quest_group",
    classes: ["druid"],
    description:
      "Strandar Pinemist in the Plane of Sky directs Druids to two testers, Will Treewalker (Wolf, Bear, Tree) or Fenalla Moonshadow (Bee, Eagle, Nature), each offering independent item-turn-in tests for a named reward. Six independent sub-quests, no ordering between them.",
    wiki_title: "Druid Plane of Sky Tests",
  });
  addEdge(overviewGiverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const tests = [
    { label: "Test of Wolf", giverId: treewalkerId, giverLabel: "Will Treewalker", items: "an azure tessera, black face paint, and a worn leather mask", reward: "Drake-Hide Mask", item: { slots: ["Face"], ac: 4, stats: { str: 10, dex: 10, wis: 10, agi: 10 }, resists: { magic: 7 }, mana: 10, weight: 0.4 } },
    { label: "Test of Bear", giverId: treewalkerId, giverLabel: "Will Treewalker", items: "a copper disc, Nature Walker's Sky Emerald, and a Mantle of Woven Grass", reward: "Nature Walker's Mantle", item: { slots: ["Shoulders"], ac: 6, stats: { dex: 4, wis: 4, agi: 4 }, mana: 50, weight: 2.5 } },
    { label: "Test of Tree", giverId: treewalkerId, giverLabel: "Will Treewalker", items: "a diaphanous globe, hardened clay, and a spiroc battle staff", reward: "Shillelagh", item: { slots: ["Primary"], damage: 10, ac: 2, skill: "1H Blunt", stats: { cha: 4, wis: 9, agi: 2 }, resists: { fire: 5 }, mana: 50, weight: 4.0 } },
    { label: "Test of Bee", giverId: moonshadowId, giverLabel: "Fenalla Moonshadow", items: "an efreeti statuette, a wilder's girdle, and divine honeycomb", reward: "Honeycomb Belt", item: { slots: ["Waist"], ac: 6, stats: { cha: 2, wis: 8 }, effect: "Haste +26%", mana: 75, weight: 2.0 } },
    { label: "Test of Eagle", giverId: moonshadowId, giverLabel: "Fenalla Moonshadow", items: "a white-tipped spiroc feather, acidic venom, an ethereal ruby, and a spiroc elder's totem", reward: "Spiroc Banisher Focus", item: { slots: ["Primary", "Secondary"], stats: { wis: 20 }, mana: 10, weight: 1.0 } },
    { label: "Test of Nature", giverId: moonshadowId, giverLabel: "Fenalla Moonshadow", items: "an efreeti scimitar, lush nectar, a fire sky ruby, and a storm sky opal", reward: "Espri", item: { slots: ["Primary"], damage: 10, skill: "1H Slashing", stats: { dex: 9, wis: 9 }, effect: "Combust at Level 45", mana: 50, weight: 2.0 } },
  ] as const;

  for (const test of tests) {
    const questId = `quest:druid-plane-of-sky-${slug(test.label)}`;
    addNode({
      id: questId,
      label: `Druid Plane of Sky Tests: ${test.label}`,
      type: "quest",
      classes: ["druid"],
      description: `Bring ${test.items} to ${test.giverLabel} in the Plane of Sky for ${test.reward}.`,
      steps: [`Gather ${test.items}`, `Turn them in to ${test.giverLabel} in the Plane of Sky`],
      wiki_title: "Druid Plane of Sky Tests",
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
      classes: ["druid"],
      magic: true,
      ...test.item,
      source: `Druid Plane of Sky Tests: ${test.label} reward (${test.giverLabel}, Plane of Sky)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// --- Enchanter Plane of Sky Tests ---
{
  const zoneId = "zone:plane-of-sky";
  const giverId = "npc:plane-of-sky:enchanter-jolas";
  addGiver(giverId, "Enchanter Jolas", zoneId);

  const groupId = "quest_group:enchanter-plane-of-sky-tests";
  addNode({
    id: groupId,
    label: "Enchanter Plane of Sky Tests",
    type: "quest_group",
    classes: ["enchanter"],
    description:
      "Enchanter Jolas in the Plane of Sky offers six independent item-turn-in tests (Illusion, Metamorphism, Deception, Disillusion, Memorization, Incapacitation), each for a named reward. No ordering between them.",
    wiki_title: "Enchanter Plane of Sky Tests",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const tests = [
    { label: "Test of Illusion", items: "a Wind Rune Meda and a Finely Woven Cloth Cord", reward: "Sphinx Hair Cord", item: { slots: ["Waist"], ac: 4, stats: { cha: 5, int: 5 }, resists: { fire: 10, disease: 10, cold: 10 }, weight: 0.2, size: "Small" } },
    { label: "Test of Metamorphism", items: "a Wind Rune Ozah and a Light Cloth Mantle", reward: "Wind Walker's Mantle", item: { slots: ["Shoulders"], ac: 6, stats: { str: 5, dex: 5, cha: 10, agi: 2 }, hp: 50, weight: 0.3, size: "Small" } },
    { label: "Test of Deception", items: "a Wind Rune Beza and a Silken Mask", reward: "Ivory Mask", item: { slots: ["Face"], ac: 6, stats: { cha: 6, int: 6 }, mana: 30, weight: 0.5, size: "Medium" } },
    { label: "Test of Disillusion", items: "a Wind Rune Caza and an Adamantium Earring", reward: "Earring of Displacement", item: { slots: ["Ear"], ac: 6, stats: { cha: 4, int: 4 }, effect: "Gravity Flux", mana: 25, weight: 0.1, size: "Tiny" } },
    { label: "Test of Memorization", items: "a Wind Rune Fana and a Glowing Necklace", reward: "Necklace of Whispering Winds", item: { slots: ["Neck"], ac: 4, stats: { sta: 5, cha: 10, int: 5 }, effect: "Cajoling Whispers", mana: 35, weight: 0.1, size: "Tiny" } },
    { label: "Test of Incapacitation", items: "a Wind Rune Izah, a Large Sky Sapphire, and an Efreeti Wind Staff", reward: "Rod of the Protecting Winds", item: { slots: ["Primary"], ac: 10, damage: 35, stats: { cha: 15, int: 15 }, effect: "Rune III", mana: 75, weight: 5.0, size: "Large" } },
  ] as const;

  for (const test of tests) {
    const questId = `quest:enchanter-plane-of-sky-${slug(test.label)}`;
    addNode({
      id: questId,
      label: `Enchanter Plane of Sky Tests: ${test.label}`,
      type: "quest",
      classes: ["enchanter"],
      description: `Bring ${test.items} to Enchanter Jolas in the Plane of Sky for ${test.reward}.`,
      steps: [`Gather ${test.items}`, "Turn them in to Enchanter Jolas in the Plane of Sky"],
      wiki_title: "Enchanter Plane of Sky Tests",
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, groupId, "member_of");

    const rewardId = `item:${slug(test.reward)}`;
    addNode({
      id: rewardId,
      label: test.reward,
      type: "item",
      classes: ["enchanter"],
      magic: true,
      ...test.item,
      source: `Enchanter Plane of Sky Tests: ${test.label} reward (Enchanter Jolas, Plane of Sky)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// --- Dreadscale Armor (Shadow Knight, East Cabilis, two givers) ---
{
  const zoneId = "zone:east-cabilis";
  const sirthaId = "npc:east-cabilis:sirtha-scarscale";
  const sarthId = "npc:east-cabilis:sarth-scarscale";
  addGiver(sirthaId, "Sirtha Scarscale", zoneId);
  addGiver(sarthId, "Sarth Scarscale", zoneId);

  const groupId = "quest_group:dreadscale-armor";
  addNode({
    id: groupId,
    label: "Dreadscale Armor",
    type: "quest_group",
    classes: ["shadow knight"],
    minLevel: 23,
    description:
      "Sirtha Scarscale and Sarth Scarscale in East Cabilis each trade a set of quest items for one piece of Dreadscale armor. Eight independent sub-quests, no ordering between them (Sirtha has four pieces, Sarth has four).",
    wiki_title: "Dreadscale Armor",
  });
  addEdge(sirthaId, groupId, "starts");
  addEdge(sarthId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const pieces = [
    { label: "Helm", giverId: sirthaId, giverLabel: "Sirtha Scarscale", items: "a Sarnak Berserker Head, a Sarnak Knight's Sword, a Ruby, and a Banded Helm", reward: "Dreadscale Helm", slots: ["Head"], ac: 11, stats: { int: 5 }, resists: { fire: 5, disease: 5, cold: 5, magic: 5, poison: 5 }, weight: 3.0 },
    { label: "Gauntlets", giverId: sirthaId, giverLabel: "Sirtha Scarscale", items: "a Skeletal Hand, 2 Star Rubies, and Banded Gauntlets", reward: "Dreadscale Gauntlets", slots: ["Hands"], ac: 10, stats: { dex: 4, int: 2 }, resists: { magic: 5 }, weight: 3.0 },
    { label: "Boots", giverId: sirthaId, giverLabel: "Sirtha Scarscale", items: "Cactus Quills, Skeletal Feet, a Fire Emerald, and Banded Boots", reward: "Dreadscale Boots", slots: ["Feet"], ac: 10, stats: { str: 3, sta: 3 }, weight: 3.5 },
    { label: "Vambraces", giverId: sirthaId, giverLabel: "Sirtha Scarscale", items: "Golra Skin, 2 Sapphires, and Banded Sleeves", reward: "Dreadscale Vambraces", slots: ["Arms"], ac: 9, stats: { str: 4, dex: 3 }, hp: 10, weight: 3.5 },
    { label: "Bracer", giverId: sarthId, giverLabel: "Sarth Scarscale", items: "Bloodgill Scales, a Sapphire, and a Banded Bracer", reward: "Dreadscale Bracer", slots: ["Wrist"], ac: 8, stats: { dex: 3 }, resists: { fire: 2, cold: 2 }, weight: 1.8 },
    { label: "Greaves", giverId: sarthId, giverLabel: "Sarth Scarscale", items: "Grachnist's Head, Boots of Zorash, a Star Ruby, and Banded Leggings", reward: "Dreadscale Greaves", slots: ["Legs"], ac: 11, stats: { sta: 9, agi: 3 }, resists: { magic: 3 }, weight: 4.0 },
    { label: "Mask", giverId: sarthId, giverLabel: "Sarth Scarscale", items: "Wings of the Drixie Queen, a Fire Emerald, and a Banded Mask", reward: "Dreadscale Mask", slots: ["Face"], ac: 6, stats: { str: 3, int: 3 }, resists: { disease: 5, poison: 5 }, weight: 1.0 },
    { label: "Breastplate", giverId: sarthId, giverLabel: "Sarth Scarscale", items: "Scorpion Chitin, a Sarnak War Braid, a Ruby, and Banded Mail", reward: "Dreadscale Breastplate", slots: ["Chest"], ac: 18, stats: { str: 2, sta: 10 }, resists: { magic: 3 }, weight: 6.0 },
  ] as const;

  for (const piece of pieces) {
    const questId = `quest:dreadscale-armor-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `Dreadscale Armor: ${piece.label}`,
      type: "quest",
      classes: ["shadow knight"],
      minLevel: 23,
      description: `Turn in ${piece.items} to ${piece.giverLabel} in East Cabilis for the ${piece.reward}.`,
      steps: [`Gather ${piece.items}`, `Turn them in to ${piece.giverLabel} in East Cabilis`],
      wiki_title: "Dreadscale Armor",
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
      classes: ["shadow knight"],
      slots: piece.slots,
      magic: true,
      ac: piece.ac,
      stats: piece.stats,
      ...("resists" in piece ? { resists: piece.resists } : {}),
      ...("hp" in piece ? { hp: piece.hp } : {}),
      weight: piece.weight,
      source: `Dreadscale Armor: ${piece.label} reward (${piece.giverLabel}, East Cabilis)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// --- Lambent Armor Quests (Bard, Temple of Solusek Ro, two givers) ---
{
  const zoneId = "zone:temple-of-solusek-ro";
  const cryssiaId = "npc:temple-of-solusek-ro:cryssia-stardreamer";
  const walthinId = "npc:temple-of-solusek-ro:walthin-fireweaver";
  addGiver(cryssiaId, "Cryssia Stardreamer", zoneId);
  addGiver(walthinId, "Walthin Fireweaver", zoneId);

  const groupId = "quest_group:lambent-armor-quests";
  addNode({
    id: groupId,
    label: "Lambent Armor Quests",
    type: "quest_group",
    classes: ["bard"],
    minLevel: 30,
    description:
      "Cryssia Stardreamer and Walthin Fireweaver in the Temple of Solusek Ro each trade a set of quest items for one piece of Lambent armor. Seven independent sub-quests, no ordering between them (Cryssia has four pieces, Walthin has three).",
    wiki_title: "Lambent Armor Quests",
  });
  addEdge(cryssiaId, groupId, "starts");
  addEdge(walthinId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const pieces = [
    { label: "Breastplate", giverId: cryssiaId, giverLabel: "Cryssia Stardreamer", items: "a Gypsy Lute, a Basalt Carapace, and a Lambent Ruby", reward: "Lambent Breastplate", slots: ["Chest"], ac: 20, stats: { sta: 5, cha: 1 }, hp: 25, weight: 5.8 },
    { label: "Helm", giverId: cryssiaId, giverLabel: "Cryssia Stardreamer", items: "a Mudwater Rune, an Opoline Helm, and a Lambent Star Ruby", reward: "Lambent Helm", slots: ["Head"], ac: 13, stats: { cha: 3, int: 5 }, weight: 3.8 },
    { label: "Vambraces", giverId: cryssiaId, giverLabel: "Cryssia Stardreamer", items: "Fiery Vambraces, a Rune of the One Eye (Top), and a Lambent Sapphire", reward: "Lambent Vambraces", slots: ["Arms"], ac: 11, stats: { cha: 1 }, resists: { fire: 2, disease: 2, cold: 2, magic: 2, poison: 2 }, weight: 3.5 },
    { label: "Bracers", giverId: cryssiaId, giverLabel: "Cryssia Stardreamer", items: "a Dark-boned Bracelet, a Griffenne Charm, and a Lambent Fire Opal", reward: "Lambent Bracers", slots: ["Wrist"], ac: 9, stats: { str: 4, cha: 1 }, weight: 2.5 },
    { label: "Greaves", giverId: walthinId, giverLabel: "Walthin Fireweaver", items: "Icy Greaves, Shin Greaves, and a Lambent Fire Opal", reward: "Lambent Greaves", slots: ["Legs"], ac: 13, stats: { cha: 1, agi: 5 }, weight: 4.0 },
    { label: "Boots", giverId: walthinId, giverLabel: "Walthin Fireweaver", items: "Firewalker Boots, a Rune of the One Eye (Middle), and a Lambent Sapphire", reward: "Lambent Boots", slots: ["Feet"], ac: 11, stats: { cha: 1 }, resists: { fire: 2, disease: 2, cold: 2, magic: 2, poison: 2 }, weight: 3.5 },
    { label: "Gauntlets", giverId: walthinId, giverLabel: "Walthin Fireweaver", items: "Shin Gauntlets, Black Silk Gloves, and a Lambent Star Ruby", reward: "Lambent Gauntlets", slots: ["Hands"], ac: 12, stats: { dex: 5, cha: 1 }, weight: 2.8 },
  ] as const;

  for (const piece of pieces) {
    const questId = `quest:lambent-armor-quests-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `Lambent Armor Quests: ${piece.label}`,
      type: "quest",
      classes: ["bard"],
      minLevel: 30,
      description: `Turn in ${piece.items} to ${piece.giverLabel} in the Temple of Solusek Ro for the ${piece.reward}.`,
      steps: [`Gather ${piece.items}`, `Turn them in to ${piece.giverLabel} in the Temple of Solusek Ro`],
      wiki_title: "Lambent Armor Quests",
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
      classes: ["bard"],
      slots: piece.slots,
      magic: true,
      ac: piece.ac,
      stats: piece.stats,
      ...("resists" in piece ? { resists: piece.resists } : {}),
      weight: piece.weight,
      source: `Lambent Armor Quests: ${piece.label} reward (${piece.giverLabel}, Temple of Solusek Ro)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

save();

console.log(
  "Migration 102 complete: added 10 quest_groups -- Druid & Enchanter Kael/Skyshrine/Thurgadin Armor Quests + Plane of Sky Tests, Dreadscale Armor (8 pieces), and Lambent Armor Quests (7 pieces)."
);
