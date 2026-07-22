/**
 * Migration 103: models 12 quest_groups from GitHub issue #26's "Quest
 * Groups" tracking section (decisions/quest-group-node-type.md):
 *
 * - Magician Kael/Skyshrine/Thurgadin Armor Quests + Plane of Sky Tests
 * - Ranger Kael/Skyshrine/Thurgadin Armor Quests + Plane of Sky Tests
 * - Necromancer Kael/Skyshrine/Thurgadin Armor Quests + Plane of Sky Tests
 *
 * Same unordered per-class armor/test progression pattern already modeled
 * for Bard/Cleric/Paladin/Rogue/Shadowknight/Shaman/Warrior/Wizard/Druid/
 * Enchanter -- no minLevel field, matching that majority (see migration
 * 101's note on the two Crafted/Darkforge outliers that do carry one).
 * Magician/Ranger/Necromancer Epic Quests, and Necromancer's separate
 * Skullcap Quests / Words Quests clusters, are untouched here -- issue #26
 * defers those to the Questlines section for their own research pass.
 *
 * Plane of Sky Tests follows the Druid/Paladin/Rogue/Shadow Knight/Warrior
 * shape: a zone-level facilitator NPC starts the group and directs the
 * player to one of two named sub-testers (Magician: Frederic Calermin x4 /
 * Roanis Elindar x3; Ranger: Relinin Skyrunner x3 / Gordon Treecaller x3),
 * except Necromancer, where a single NPC (Drakis Bloodcaster) runs all six
 * tests directly with no facilitator/sub-tester split.
 *
 * Researched directly against eqlwiki.com, following
 * decisions/eqlwiki-quest-research-method.md. No new zones needed -- Kael
 * Drakkal, Skyshrine, Thurgadin, and Plane of Sky all already exist in the
 * graph. Necromancer Thurgadin's giver, Lorekeeper Zorik, already exists as
 * a separate `vendor:thurgadin:lorekeeper-zorik` node from an earlier
 * migration; per established convention (e.g. Druid/Cobi Frostbeard),
 * quest givers get their own `npc:` node rather than merging into an
 * existing `vendor:` node for the same person.
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, addGiver, save, slug } = loadGraph(import.meta.dir);

function addArmorSet(opts: {
  classId: string;
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
    effect?: string;
  }[];
}) {
  addGiver(opts.giverId, opts.giverLabel, opts.zoneId);

  const groupId = `quest_group:${opts.groupSlug}`;
  addNode({
    id: groupId,
    label: opts.groupLabel,
    type: "quest_group",
    classes: [opts.classId],
    description: `${opts.giverLabel} in ${opts.zoneLabel} trades a set of quest items for one piece of ${opts.rewardPrefix} armor. ${opts.pieces.length} independent sub-quests, no ordering between them.`,
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
      ...(piece.effect ? { effect: piece.effect } : {}),
      source: `${opts.groupLabel}: ${piece.label} reward (${opts.giverLabel}, ${opts.zoneLabel})`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

function addPlaneOfSkyTests(opts: {
  classId: string;
  groupSlug: string;
  groupLabel: string;
  description: string;
  facilitator?: { id: string; label: string };
  tests: readonly {
    label: string;
    giverId: string;
    giverLabel: string;
    items: string;
    reward: string;
    slots: string[];
    ac?: number;
    stats?: Record<string, number>;
    resists?: Record<string, number>;
    hp?: number;
    mana?: number;
    weight: number;
    effect?: string;
    damage?: number;
    skill?: string;
  }[];
}) {
  const zoneId = "zone:plane-of-sky";
  const zoneLabel = "the Plane of Sky";

  if (opts.facilitator) addGiver(opts.facilitator.id, opts.facilitator.label, zoneId);
  const testerIds = new Set(opts.tests.map((t) => t.giverId));
  for (const testerId of testerIds) {
    const tester = opts.tests.find((t) => t.giverId === testerId)!;
    addGiver(tester.giverId, tester.giverLabel, zoneId);
  }

  const groupId = `quest_group:${opts.groupSlug}`;
  addNode({
    id: groupId,
    label: opts.groupLabel,
    type: "quest_group",
    classes: [opts.classId],
    description: opts.description,
    wiki_title: opts.groupLabel,
  });
  addEdge(opts.facilitator ? opts.facilitator.id : opts.tests[0].giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  for (const test of opts.tests) {
    const questId = `quest:${opts.groupSlug}-${slug(test.label)}`;
    addNode({
      id: questId,
      label: `${opts.groupLabel}: ${test.label}`,
      type: "quest",
      classes: [opts.classId],
      description: `Bring ${test.items} to ${test.giverLabel} in ${zoneLabel} for the ${test.reward}.`,
      steps: [`Gather ${test.items}`, `Turn them in to ${test.giverLabel} in ${zoneLabel}`],
      wiki_title: opts.groupLabel,
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
      classes: [opts.classId],
      slots: test.slots,
      magic: true,
      ...(test.ac !== undefined ? { ac: test.ac } : {}),
      ...(test.stats ? { stats: test.stats } : {}),
      ...(test.resists ? { resists: test.resists } : {}),
      ...(test.hp !== undefined ? { hp: test.hp } : {}),
      ...(test.mana !== undefined ? { mana: test.mana } : {}),
      weight: test.weight,
      ...(test.effect ? { effect: test.effect } : {}),
      ...(test.damage !== undefined ? { damage: test.damage } : {}),
      ...(test.skill ? { skill: test.skill } : {}),
      source: `${opts.groupLabel}: ${test.label} reward (${test.giverLabel}, ${zoneLabel})`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// --- Magician Kael Armor Quests ---
addArmorSet({
  classId: "magician",
  zoneId: "zone:kael-drakkal",
  zoneLabel: "Kael Drakkal",
  giverId: "npc:kael-drakkal:mjeldor-felstorm",
  giverLabel: "Mjeldor Felstorm",
  groupSlug: "magician-kael-armor-quests",
  groupLabel: "Magician Kael Armor Quests",
  rewardPrefix: "Summoner's",
  pieces: [
    { label: "Circlet", items: "an Ancient Silk Turban and 3 Crushed Flame Opals", reward: "Summoner's Circlet", slots: ["Head"], ac: 8, stats: { int: 10 }, resists: { disease: 5, magic: 7 }, hp: 25, mana: 25, weight: 0.2 },
    { label: "Robe", items: "an Ancient Silk Robe and 3 Pristine Emeralds", reward: "Summoner's Robe", slots: ["Chest"], ac: 14, stats: { sta: 15, int: 15 }, resists: { fire: 10, disease: 10, magic: 10, poison: 7 }, hp: 40, mana: 90, weight: 0.5, effect: "Shield of Lava" },
    { label: "Sleeves", items: "Ancient Silk Sleeves and 3 Flawed Topaz", reward: "Summoner's Sleeves", slots: ["Arms"], ac: 8, stats: { sta: 4, int: 7 }, resists: { cold: 4 }, hp: 25, mana: 25, weight: 0.4 },
    { label: "Wristband", items: "an Ancient Silk Wristband and 3 Crushed Onyx Sapphires", reward: "Summoner's Warband", slots: ["Wrist"], ac: 6, stats: { int: 2, agi: 5 }, resists: { fire: 3, disease: 4, cold: 3, magic: 4 }, hp: 10, mana: 10, weight: 0.3, effect: "Reclaim Energy" },
    { label: "Gloves", items: "Ancient Silk Gloves and 3 Crushed Topaz", reward: "Summoner's Gloves", slots: ["Hands"], ac: 7, stats: { int: 10, agi: 10 }, resists: { fire: 3, disease: 3, cold: 3 }, hp: 25, mana: 20, weight: 0.4 },
    { label: "Leggings", items: "Ancient Silk Pantaloons and 3 Nephrite", reward: "Summoner's Pantaloons", slots: ["Legs"], ac: 8, stats: { sta: 5, int: 5 }, resists: { fire: 2, disease: 3, cold: 2, magic: 3 }, mana: 20, weight: 0.5, effect: "Burnout III" },
    { label: "Boots", items: "Ancient Silk Boots and 3 Crushed Jaundice Gems", reward: "Summoner's Boots", slots: ["Feet"], ac: 7, stats: { sta: 3, int: 4 }, resists: { fire: 3, disease: 3, magic: 3 }, hp: 15, mana: 20, weight: 0.4, effect: "Summon Bandages" },
  ],
});

// --- Magician Skyshrine Armor Quests ---
addArmorSet({
  classId: "magician",
  zoneId: "zone:skyshrine",
  zoneLabel: "Skyshrine",
  giverId: "npc:skyshrine:ocoenydd-fedhar",
  giverLabel: "Ocoenydd Fe`Dhar",
  groupSlug: "magician-skyshrine-armor-quests",
  groupLabel: "Magician Skyshrine Armor Quests",
  rewardPrefix: "Prestidigitator's",
  pieces: [
    { label: "Headband", items: "a Tattered Silk Turban and 3 Crushed Flame Opals", reward: "Prestidigitator's Headband", slots: ["Head"], ac: 6, stats: { sta: 5, int: 10 }, resists: { disease: 4, cold: 4, magic: 4, poison: 4 }, hp: 35, mana: 35, weight: 0.2 },
    { label: "Robe", items: "a Tattered Silk Robe and 3 Pristine Emeralds", reward: "Prestidigitator's Robe", slots: ["Chest"], ac: 12, stats: { sta: 15, int: 15 }, resists: { fire: 8, disease: 8, cold: 8, magic: 8, poison: 8 }, hp: 60, mana: 90, weight: 0.5, effect: "Shield of Lava" },
    { label: "Sleeves", items: "Tattered Silk Sleeves and 3 Flawed Topaz", reward: "Prestidigitator's Sleeves", slots: ["Arms"], ac: 6, stats: { sta: 5, int: 5 }, resists: { fire: 3, disease: 3, cold: 3 }, hp: 50, mana: 25, weight: 0.4 },
    { label: "Wristband", items: "a Tattered Silk Wristband and 3 Crushed Onyx Sapphires", reward: "Prestidigitator's Wristband", slots: ["Wrist"], ac: 4, stats: { sta: 3, int: 6, agi: 5 }, hp: 25, mana: 20, weight: 0.3, effect: "Reclaim Energy" },
    { label: "Gloves", items: "Tattered Silk Gloves and 3 Crushed Topaz", reward: "Prestidigitator's Gloves", slots: ["Hands"], ac: 5, stats: { str: 3, int: 10, agi: 10 }, resists: { fire: 3, disease: 3, cold: 3, magic: 3, poison: 3 }, hp: 35, mana: 25, weight: 0.4 },
    { label: "Trousers", items: "Tattered Silk Pantaloons and 3 Nephrite", reward: "Prestidigitator's Trousers", slots: ["Legs"], ac: 7, stats: { sta: 5, int: 3 }, hp: 45, mana: 50, weight: 0.5, effect: "Burnout III" },
    { label: "Boots", items: "Tattered Silk Boots and 3 Crushed Jaundice Gems", reward: "Prestidigitator's Boots", slots: ["Feet"], ac: 5, stats: { sta: 3 }, resists: { fire: 5, disease: 5, cold: 5, magic: 5, poison: 5 }, hp: 15, mana: 40, weight: 0.4, effect: "Summon Bandages" },
  ],
});

// --- Magician Thurgadin Armor Quests ---
addArmorSet({
  classId: "magician",
  zoneId: "zone:thurgadin",
  zoneLabel: "Thurgadin",
  giverId: "npc:thurgadin:kyla-frostbeard",
  giverLabel: "Kyla Frostbeard",
  groupSlug: "magician-thurgadin-armor-quests",
  groupLabel: "Magician Thurgadin Armor Quests",
  rewardPrefix: "Arch Mage's",
  pieces: [
    { label: "Crown", items: "a Torn Enchanted Silk Turban and 3 Crushed Flame Opals", reward: "Arch Mage's Crown", slots: ["Head"], ac: 6, stats: { int: 9 }, resists: { fire: 2, magic: 7 }, hp: 15, mana: 15, weight: 0.2 },
    { label: "Robe", items: "a Torn Enchanted Silk Robe and 3 Pristine Emeralds", reward: "Arch Mage's Robe", slots: ["Chest"], ac: 12, stats: { sta: 14, int: 15 }, resists: { fire: 5, disease: 5, cold: 5, magic: 5, poison: 5 }, hp: 40, mana: 80, weight: 0.5, effect: "Shield of Lava" },
    { label: "Sleeves", items: "Torn Enchanted Silk Sleeves and 3 Flawed Topaz", reward: "Arch Mage's Sleeves", slots: ["Arms"], ac: 6, stats: { sta: 4, int: 5 }, resists: { poison: 2 }, hp: 15, mana: 15, weight: 0.4 },
    { label: "Warband", items: "a Torn Enchanted Silk Wristband and 3 Crushed Onyx Sapphires", reward: "Arch Mage's Warband", slots: ["Wrist"], ac: 4, stats: { int: 2, agi: 5 }, hp: 10, mana: 10, weight: 0.3, effect: "Reclaim Energy" },
    { label: "Gloves", items: "Torn Enchanted Silk Gloves and 3 Crushed Topaz", reward: "Arch Mage's Gloves", slots: ["Hands"], ac: 5, stats: { int: 9, agi: 9 }, hp: 15, mana: 20, weight: 0.4 },
    { label: "Pantaloons", items: "Torn Enchanted Silk Pantaloons and 3 Nephrite", reward: "Arch Mage's Pantaloons", slots: ["Legs"], ac: 7, stats: { sta: 5, int: 2 }, weight: 0.5, effect: "Burnout III" },
    { label: "Boots", items: "Torn Enchanted Silk Boots and 3 Crushed Jaundice Gems", reward: "Arch Mage's Boots", slots: ["Feet"], ac: 5, stats: { sta: 3 }, hp: 15, mana: 20, weight: 0.4, effect: "Summon Bandages" },
  ],
});

// --- Magician Plane of Sky Tests ---
addPlaneOfSkyTests({
  classId: "magician",
  groupSlug: "magician-plane-of-sky-tests",
  groupLabel: "Magician Plane of Sky Tests",
  description:
    "Magi Frinon in the Plane of Sky directs Magicians to two testers, Frederic Calermin (Clarification, Empowerment, Gesticulation, Shielding) or Roanis Elindar (Summoning, Interpretation, Displacement), each offering independent item-turn-in tests for a named reward. Seven independent sub-quests, no ordering between them.",
  facilitator: { id: "npc:plane-of-sky:magi-frinon", label: "Magi Frinon" },
  tests: [
    { label: "Test of Clarification", giverId: "npc:plane-of-sky:frederic-calermin", giverLabel: "Frederic Calermin", items: "a Crimson Tessera, an Ethereal Sapphire, and a Feathered Cape", reward: "Bracelet of Clarification", slots: ["Back", "Wrist"], ac: 6, stats: { cha: 1, int: 9 }, mana: 10, weight: 0.5 },
    { label: "Test of Empowerment", giverId: "npc:plane-of-sky:frederic-calermin", giverLabel: "Frederic Calermin", items: "an Iron Disc, a Gem of Empowerment, and a Ceramic Mask", reward: "Mask of Empowerment", slots: ["Face"], ac: 4, stats: { dex: 7, agi: 7 }, weight: 0.4, effect: "Burnout III" },
    { label: "Test of Gesticulation", giverId: "npc:plane-of-sky:frederic-calermin", giverLabel: "Frederic Calermin", items: "Sweet Nectar, an Efreeti Magi Staff, a Sphinx Crown, and a Hazy Opal", reward: "Staff of The Magister", slots: ["Primary"], damage: 16, skill: "2H Blunt", stats: { int: 15 }, resists: { fire: 10, cold: 20, poison: 10 }, mana: 75, weight: 4.0 },
    { label: "Test of Shielding", giverId: "npc:plane-of-sky:frederic-calermin", giverLabel: "Frederic Calermin", items: "a Hyaline Globe, an Ivory Pendant, and a Golden Coffer", reward: "Gold White Pendant", slots: ["Neck"], ac: 2, stats: { int: 5 }, mana: 50, weight: 0.1 },
    { label: "Test of Summoning", giverId: "npc:plane-of-sky:roanis-elindar", giverLabel: "Roanis Elindar", items: "a Harpy Statuette, a Finely Woven Cloth Amice, and a Large Diamond", reward: "Drake-Hide Amice", slots: ["Shoulders"], ac: 6, stats: { sta: 5 }, hp: 50, mana: 50, weight: 2.5, effect: "Malaise" },
    { label: "Test of Interpretation", giverId: "npc:plane-of-sky:roanis-elindar", giverLabel: "Roanis Elindar", items: "a Carmine Spiroc Feather, a Blood Sky Amethyst, and a Golden Efreeti Ring", reward: "Duennan Shielding Ring", slots: ["Finger"], ac: 4, stats: { wis: 5, int: 5 }, mana: 30, weight: 0.1, effect: "Harmshield" },
    { label: "Test of Displacement", giverId: "npc:plane-of-sky:roanis-elindar", giverLabel: "Roanis Elindar", items: "Sweet Nectar, a Crown of Elemental Mastery, a Large Opal, and a Djinni Stave", reward: "Staff of Elemental Mastery: Air", slots: ["Primary"], damage: 15, skill: "2H Blunt", weight: 5.0, effect: "Reclaim Energy" },
  ],
});

// --- Ranger Kael Armor Quests ---
addArmorSet({
  classId: "ranger",
  zoneId: "zone:kael-drakkal",
  zoneLabel: "Kael Drakkal",
  giverId: "npc:kael-drakkal:gragek-mjlorkigar",
  giverLabel: "Gragek Mjlorkigar",
  groupSlug: "ranger-kael-armor-quests",
  groupLabel: "Ranger Kael Armor Quests",
  rewardPrefix: "Forest Stalker's",
  pieces: [
    { label: "Coif", items: "an Ancient Tarnished Chain Coif and 3 Crushed Coral", reward: "Forest Stalker's Coif", slots: ["Head"], ac: 24, stats: { str: 3, dex: 5, sta: 5 }, resists: { disease: 1, magic: 1 }, mana: 30, weight: 5.0 },
    { label: "Breastplate", items: "an Ancient Tarnished Chain Tunic and 3 Flawless Diamonds", reward: "Forest Stalker's Breastplate", slots: ["Chest"], ac: 48, stats: { str: 14, dex: 7, sta: 7, wis: 7, agi: 7 }, resists: { cold: 1, magic: 1 }, hp: 50, mana: 50, weight: 8.0, effect: "Call of Earth" },
    { label: "Vambraces", items: "Ancient Tarnished Chain Sleeves and 3 Flawed Emeralds", reward: "Forest Stalker's Vambraces", slots: ["Arms"], ac: 24, stats: { str: 2, wis: 7, agi: 2 }, resists: { magic: 1, poison: 1 }, mana: 30, weight: 6.0 },
    { label: "Bracer", items: "an Ancient Tarnished Chain Bracer and 3 Crushed Flame Emeralds", reward: "Forest Stalker's Bracer", slots: ["Wrist"], ac: 17, stats: { str: 3, dex: 4 }, resists: { fire: 1, disease: 1 }, hp: 10, mana: 10, weight: 4.5 },
    { label: "Gauntlets", items: "Ancient Tarnished Chain Gauntlets and 3 Crushed Topaz", reward: "Forest Stalker's Gauntlets", slots: ["Hands"], ac: 17, stats: { str: 2, dex: 1, sta: 3, wis: 2, agi: 1 }, resists: { magic: 1 }, mana: 10, weight: 4.5 },
    { label: "Greaves", items: "Ancient Tarnished Chain Leggings and 3 Flawed Sea Sapphires", reward: "Forest Stalker's Greaves", slots: ["Legs"], ac: 32, stats: { str: 5, dex: 4, wis: 14 }, resists: { fire: 1, disease: 1, cold: 1, magic: 1, poison: 1 }, hp: 60, weight: 7.0 },
    { label: "Boots", items: "Ancient Tarnished Chain Boots and 3 Crushed Black Marble", reward: "Forest Stalker's Boots", slots: ["Feet"], ac: 24, stats: { str: 3, dex: 2, agi: 3 }, weight: 6.0 },
  ],
});

// --- Ranger Skyshrine Armor Quests ---
addArmorSet({
  classId: "ranger",
  zoneId: "zone:skyshrine",
  zoneLabel: "Skyshrine",
  giverId: "npc:skyshrine:nalelin-fedhar",
  giverLabel: "Nalelin Fe`Dhar",
  groupSlug: "ranger-skyshrine-armor-quests",
  groupLabel: "Ranger Skyshrine Armor Quests",
  rewardPrefix: "Golden Leaf",
  pieces: [
    { label: "Helm", items: "an Unadorned Chain Coif and 3 Crushed Coral", reward: "Golden Leaf Helm", slots: ["Head"], ac: 19, stats: { str: 5, dex: 5, wis: 5 }, resists: { cold: 4, magic: 5 }, hp: 40, mana: 20, weight: 5.0 },
    { label: "Breastplate", items: "an Unadorned Chain Tunic and 3 Flawless Diamonds", reward: "Golden Leaf Breastplate", slots: ["Chest"], ac: 43, stats: { str: 10, dex: 8, sta: 8, wis: 10, agi: 10 }, resists: { fire: 2, disease: 5, cold: 2, magic: 10, poison: 1 }, hp: 70, mana: 30, weight: 8.0, effect: "Call of Earth" },
    { label: "Sleeves", items: "Unadorned Chain Sleeves and 3 Flawed Emeralds", reward: "Golden Leaf Vambraces", slots: ["Arms"], ac: 19, stats: { str: 5, sta: 10 }, resists: { fire: 4, magic: 4 }, hp: 30, weight: 6.0 },
    { label: "Bracer", items: "an Unadorned Chain Bracer and 3 Crushed Flame Emeralds", reward: "Golden Leaf Bracer", slots: ["Wrist"], ac: 16, stats: { str: 7, wis: 3 }, resists: { poison: 3 }, hp: 10, mana: 10, weight: 4.5 },
    { label: "Gauntlets", items: "Unadorned Chain Gauntlets and 3 Crushed Topaz", reward: "Golden Leaf Gauntlets", slots: ["Hands"], ac: 16, stats: { str: 3, dex: 2, sta: 2, wis: 3, agi: 2 }, resists: { fire: 1, disease: 1, cold: 1, magic: 4, poison: 1 }, mana: 10, weight: 4.5 },
    { label: "Leggings", items: "Unadorned Chain Leggings and 3 Flawed Sea Sapphires", reward: "Golden Leaf Greaves", slots: ["Legs"], ac: 26, stats: { str: 8, dex: 10, sta: 5 }, resists: { fire: 3, disease: 2, cold: 3, magic: 3, poison: 2 }, hp: 60, mana: 20, weight: 7.0 },
    { label: "Boots", items: "Unadorned Chain Boots and 3 Crushed Black Marble", reward: "Golden Leaf Boots", slots: ["Feet"], ac: 21, stats: { str: 4, dex: 4, sta: 4 }, hp: 20, weight: 6.0 },
  ],
});

// --- Ranger Thurgadin Armor Quests ---
addArmorSet({
  classId: "ranger",
  zoneId: "zone:thurgadin",
  zoneLabel: "Thurgadin",
  giverId: "npc:thurgadin:argash",
  giverLabel: "Argash",
  groupSlug: "ranger-thurgadin-armor-quests",
  groupLabel: "Ranger Thurgadin Armor Quests",
  rewardPrefix: "Runed Scout's",
  pieces: [
    { label: "Helm", items: "a Corroded Chain Coif and 3 Crushed Coral", reward: "Runed Scout's Helm", slots: ["Head"], ac: 16, stats: { str: 4, dex: 3, sta: 3 }, resists: { fire: 3, magic: 2 }, hp: 15, mana: 15, weight: 5.0 },
    { label: "Breastplate", items: "a Corroded Chain Tunic and 3 Flawless Diamonds", reward: "Runed Scout's Breastplate", slots: ["Chest"], ac: 37, stats: { str: 6, dex: 6, sta: 6, wis: 14, agi: 6 }, resists: { magic: 7, poison: 3 }, hp: 40, mana: 60, weight: 8.0, effect: "Call of Earth" },
    { label: "Vambraces", items: "Corroded Chain Sleeves and 3 Flawed Emeralds", reward: "Runed Scout's Vambraces", slots: ["Arms"], ac: 16, stats: { str: 7 }, resists: { cold: 2, magic: 3 }, mana: 30, weight: 6.0 },
    { label: "Bracer", items: "a Corroded Chain Bracer and 3 Crushed Flame Emeralds", reward: "Runed Scout's Bracer", slots: ["Wrist"], ac: 13, stats: { sta: 2, wis: 3 }, resists: { cold: 1 }, hp: 10, mana: 10, weight: 4.5 },
    { label: "Gauntlets", items: "Corroded Chain Gauntlets and 3 Crushed Topaz", reward: "Runed Scout's Gauntlets", slots: ["Hands"], ac: 13, stats: { str: 2, dex: 1, sta: 1, wis: 2, agi: 1 }, resists: { magic: 2 }, mana: 10, weight: 4.5 },
    { label: "Greaves", items: "Corroded Chain Leggings and 3 Flawed Sea Sapphires", reward: "Runed Scout's Greaves", slots: ["Legs"], ac: 22, stats: { dex: 4, sta: 10, wis: 4 }, resists: { fire: 1, disease: 1, cold: 1, magic: 1, poison: 1 }, hp: 60, weight: 7.0 },
    { label: "Boots", items: "Corroded Chain Boots and 3 Crushed Black Marble", reward: "Runed Scout's Boots", slots: ["Feet"], ac: 18, stats: { str: 3, dex: 2 }, weight: 6.0 },
  ],
});

// --- Ranger Plane of Sky Tests ---
addPlaneOfSkyTests({
  classId: "ranger",
  groupSlug: "ranger-plane-of-sky-tests",
  groupLabel: "Ranger Plane of Sky Tests",
  description:
    "The Ranger Spirit in the Plane of Sky directs Rangers to two testers, Relinin Skyrunner (Body, Defense, The Earth) or Gordon Treecaller (Thunder, Blade, Ranged Attack), each offering independent item-turn-in tests for a named reward. Six independent sub-quests, no ordering between them.",
  facilitator: { id: "npc:plane-of-sky:ranger-spirit", label: "Ranger Spirit" },
  tests: [
    { label: "Test of Body", giverId: "npc:plane-of-sky:relinin-skyrunner", giverLabel: "Relinin Skyrunner", items: "an Auburn Tessera, Ysgaril Root, and a Griffon Talon", reward: "Griffon Talon Necklace", slots: ["Neck"], ac: 4, stats: { str: 4, sta: 4, wis: 5 }, resists: { fire: 5, cold: 5 }, weight: 0.1 },
    { label: "Test of Defense", giverId: "npc:plane-of-sky:relinin-skyrunner", giverLabel: "Relinin Skyrunner", items: "a Mithril Disc, a Harpy Tongue, and a Fine Velvet Cloak", reward: "Dark Cloak of the Sky", slots: ["Back"], ac: 6, stats: { str: 7, dex: 7, wis: 7, agi: 7 }, hp: 55, weight: 0.5, effect: "Haste at Level 40" },
    { label: "Test of The Earth", giverId: "npc:plane-of-sky:relinin-skyrunner", giverLabel: "Relinin Skyrunner", items: "a Gridelin Globe, a Dragon-hide Mantle, and a Spiroc Earth Totem", reward: "Earthshaker's Mantle", slots: ["Shoulders"], ac: 9, stats: { str: 8, dex: 8, wis: 8 }, resists: { fire: 10, magic: 10 }, weight: 2.5, effect: "Earthquake at Level 49" },
    { label: "Test of Thunder", giverId: "npc:plane-of-sky:gordon-treecaller", giverLabel: "Gordon Treecaller", items: "a Djinni Statuette, a Spiroc Thunder Totem, and a White Gold Earring", reward: "Thunderforged Earring", slots: ["Ear"], ac: 8, stats: { dex: 8, wis: 8, agi: 8 }, mana: 25, weight: 0.1, effect: "Careless Lightning at Level 45" },
    { label: "Test of Blade", giverId: "npc:plane-of-sky:gordon-treecaller", giverLabel: "Gordon Treecaller", items: "an Efreeti Long Sword, an Emerald Spiroc Feather, Bitter Honey, and a Circlet of Brambles", reward: "Arydryidriyorn", slots: ["Primary", "Secondary"], damage: 12, skill: "1H Slashing", stats: { str: 8, wis: 8 }, hp: 50, weight: 4.0, effect: "Shield of Brambles at Level 45" },
    { label: "Test of Ranged Attack", giverId: "npc:plane-of-sky:gordon-treecaller", giverLabel: "Gordon Treecaller", items: "an Efreeti War Bow, Thickened Nectar, Sphinx Tallow, and a Shimmering Pearl", reward: "Windstriker", slots: ["Range"], damage: 45, skill: "Archery", stats: { str: 5, dex: 5, agi: 5 }, hp: 50, weight: 4.0, effect: "Whirlwind at Level 50" },
  ],
});

// --- Necromancer Kael Armor Quests ---
addArmorSet({
  classId: "necromancer",
  zoneId: "zone:kael-drakkal",
  zoneLabel: "Kael Drakkal",
  giverId: "npc:kael-drakkal:bjarorm-mjlorn",
  giverLabel: "Bjarorm Mjlorn",
  groupSlug: "necromancer-kael-armor-quests",
  groupLabel: "Necromancer Kael Armor Quests",
  rewardPrefix: "Plague Bearer's",
  pieces: [
    { label: "Circlet", items: "an Ancient Silk Turban and 3 Crushed Flame Opals", reward: "Plague Bearer's Circlet", slots: ["Head"], ac: 8, stats: { sta: 7, int: 4, cha: 3 }, resists: { disease: 6, magic: 5 }, hp: 30, mana: 20, weight: 0.2 },
    { label: "Robe", items: "an Ancient Silk Robe and 3 Pristine Emeralds", reward: "Plague Bearer's Robe", slots: ["Chest"], ac: 14, stats: { sta: 15, int: 14 }, resists: { fire: 10, disease: 4, cold: 4, magic: 5, poison: 14 }, hp: 70, mana: 50, weight: 0.5, effect: "Conjure Corpse" },
    { label: "Sleeves", items: "Ancient Silk Sleeves and 3 Flawed Topaz", reward: "Plague Bearer's Sleeves", slots: ["Arms"], ac: 8, stats: { sta: 4, int: 7 }, resists: { cold: 8 }, hp: 30, weight: 0.2 },
    { label: "Wristguard", items: "an Ancient Silk Wristband and 3 Crushed Onyx Sapphires", reward: "Plague Bearer's Wristguard", slots: ["Wrist"], ac: 6, stats: { dex: 5, int: 3 }, resists: { fire: 3, disease: 3, cold: 2, magic: 1, poison: 1 }, hp: 25, mana: 10, weight: 0.2, effect: "Reclaim Energy" },
    { label: "Gloves", items: "Ancient Silk Gloves and 3 Crushed Topaz", reward: "Plague Bearer's Gloves", slots: ["Hands"], ac: 7, stats: { sta: 5, int: 10, cha: 4 }, resists: { fire: 3, disease: 3, cold: 3, magic: 3, poison: 3 }, hp: 25, weight: 0.2 },
    { label: "Trousers", items: "Ancient Silk Pantaloons and 3 Nephrite", reward: "Plague Bearer's Trousers", slots: ["Legs"], ac: 9, stats: { sta: 5, int: 5 }, resists: { fire: 3, disease: 3, cold: 3, magic: 3, poison: 3 }, weight: 0.4, effect: "Augment Death" },
    { label: "Boots", items: "Ancient Silk Boots and 3 Crushed Jaundice Gems", reward: "Plague Bearer's Boots", slots: ["Feet"], ac: 7, stats: { sta: 3 }, resists: { fire: 4, disease: 4, cold: 4, magic: 3, poison: 4 }, hp: 35, weight: 0.4, effect: "Invisibility versus Undead" },
  ],
});

// --- Necromancer Skyshrine Armor Quests ---
addArmorSet({
  classId: "necromancer",
  zoneId: "zone:skyshrine",
  zoneLabel: "Skyshrine",
  giverId: "npc:skyshrine:abudan-fedhar",
  giverLabel: "Abudan Fe`Dhar",
  groupSlug: "necromancer-skyshrine-armor-quests",
  groupLabel: "Necromancer Skyshrine Armor Quests",
  rewardPrefix: "Rotting",
  pieces: [
    { label: "Cap", items: "a Tattered Silk Turban and 3 Crushed Flame Opals", reward: "Rotting Crown", slots: ["Head"], ac: 6, stats: { sta: 8, int: 5 }, resists: { cold: 4, magic: 10 }, hp: 35, mana: 30, weight: 0.2 },
    { label: "Robe", items: "a Tattered Silk Robe and 3 Pristine Emeralds", reward: "Rotting Robe", slots: ["Chest"], ac: 12, stats: { sta: 15, cha: 7, int: 15 }, resists: { fire: 5, disease: 5, cold: 5, magic: 5, poison: 5 }, hp: 70, mana: 50, weight: 0.5, effect: "Conjure Corpse" },
    { label: "Sleeves", items: "Tattered Silk Sleeves and 3 Flawed Topaz", reward: "Rotting Sleeves", slots: ["Arms"], ac: 6, stats: { dex: 2, sta: 5, int: 8 }, resists: { fire: 2, disease: 2, cold: 2, magic: 2, poison: 2 }, hp: 35, mana: 10, weight: 0.2 },
    { label: "Wristguard", items: "a Tattered Silk Wristband and 3 Crushed Onyx Sapphires", reward: "Rotting Wristguard", slots: ["Wrist"], ac: 4, stats: { dex: 5, int: 3 }, resists: { fire: 3, disease: 3, cold: 3, magic: 3, poison: 3 }, hp: 20, mana: 20, weight: 0.2, effect: "Reclaim Energy" },
    { label: "Gloves", items: "Tattered Silk Gloves and 3 Crushed Topaz", reward: "Rotting Gloves", slots: ["Hands"], ac: 5, stats: { str: 2, sta: 6, cha: 6, int: 10 }, resists: { fire: 3, disease: 3, cold: 3, magic: 3, poison: 3 }, hp: 25, mana: 10, weight: 0.2 },
    { label: "Leggings", items: "Tattered Silk Pantaloons and 3 Nephrite", reward: "Rotting Trousers", slots: ["Legs"], ac: 7, stats: { sta: 6, int: 3 }, resists: { fire: 3, disease: 3, cold: 3, magic: 3, poison: 3 }, hp: 45, mana: 50, weight: 0.4, effect: "Augment Death" },
    { label: "Boots", items: "Tattered Silk Boots and 3 Crushed Jaundice Gems", reward: "Rotting Boots", slots: ["Feet"], ac: 5, stats: { sta: 4, int: 6 }, resists: { fire: 3, disease: 3, cold: 3, magic: 3, poison: 3 }, hp: 50, weight: 0.4, effect: "Invisibility versus Undead" },
  ],
});

// --- Necromancer Thurgadin Armor Quests ---
addArmorSet({
  classId: "necromancer",
  zoneId: "zone:thurgadin",
  zoneLabel: "Thurgadin",
  giverId: "npc:thurgadin:lorekeeper-zorik",
  giverLabel: "Lorekeeper Zorik",
  groupSlug: "necromancer-thurgadin-armor-quests",
  groupLabel: "Necromancer Thurgadin Armor Quests",
  rewardPrefix: "Warlock's",
  pieces: [
    { label: "Crown", items: "a Torn Enchanted Silk Turban and 3 Crushed Flame Opals", reward: "Warlock's Crown", slots: ["Head"], ac: 6, stats: { sta: 7, int: 4 }, resists: { fire: 4, magic: 5 }, hp: 20, mana: 10, weight: 0.2 },
    { label: "Robe", items: "a Torn Enchanted Silk Robe and 3 Pristine Emeralds", reward: "Warlock's Robe", slots: ["Chest"], ac: 12, stats: { sta: 15, int: 14 }, resists: { fire: 5, disease: 5, cold: 5, magic: 5, poison: 5 }, hp: 70, mana: 50, weight: 0.5, effect: "Conjure Corpse" },
    { label: "Sleeves", items: "Torn Enchanted Silk Sleeves and 3 Flawed Topaz", reward: "Warlock's Sleeves", slots: ["Arms"], ac: 6, stats: { sta: 4, int: 5 }, resists: { poison: 2 }, hp: 30, weight: 0.2 },
    { label: "Wristguard", items: "a Torn Enchanted Silk Wristband and 3 Crushed Onyx Sapphires", reward: "Warlock's Wristguard", slots: ["Wrist"], ac: 4, stats: { dex: 5, int: 2 }, resists: { fire: 2, disease: 2, cold: 2, magic: 2, poison: 2 }, hp: 20, weight: 0.2, effect: "Reclaim Energy" },
    { label: "Gloves", items: "Torn Enchanted Silk Gloves and 3 Crushed Topaz", reward: "Warlock's Gloves", slots: ["Hands"], ac: 5, stats: { sta: 4, cha: 4, int: 9 }, resists: { fire: 3, disease: 3, cold: 3, magic: 3, poison: 3 }, hp: 25, weight: 0.2 },
    { label: "Pantaloons", items: "Torn Enchanted Silk Pantaloons and 3 Nephrite", reward: "Warlock's Pantaloons", slots: ["Legs"], ac: 7, stats: { sta: 5, int: 2 }, resists: { fire: 3, disease: 3, cold: 3, magic: 3, poison: 3 }, weight: 0.5, effect: "Augment Death" },
    { label: "Boots", items: "Torn Enchanted Silk Boots and 3 Crushed Jaundice Gems", reward: "Warlock's Boots", slots: ["Feet"], ac: 5, stats: { sta: 3 }, resists: { fire: 3, disease: 3, cold: 3, magic: 3, poison: 3 }, hp: 35, weight: 0.4, effect: "Invisibility versus Undead" },
  ],
});

// --- Necromancer Plane of Sky Tests ---
addPlaneOfSkyTests({
  classId: "necromancer",
  groupSlug: "necromancer-plane-of-sky-tests",
  groupLabel: "Necromancer Plane of Sky Tests",
  description:
    "Drakis Bloodcaster in the Plane of Sky offers six independent item-turn-in tests (Flight, Power, Mind, Heart, Hands, Finger), each for a named reward. No ordering between them, no sub-tester split (unlike the two-tester Magician/Ranger pattern).",
  tests: [
    { label: "Test of Flight", giverId: "npc:plane-of-sky:drakis-bloodcaster", giverLabel: "Drakis Bloodcaster", items: "a Griffon's Beak and a Wind Rune Lena", reward: "Bloody Griffon-Hide Wrist Guard", slots: ["Wrist"], ac: 5, stats: { dex: 5, cha: 10, int: 5, agi: 5 }, mana: 25, weight: 1.0, effect: "Levitate" },
    { label: "Test of Power", giverId: "npc:plane-of-sky:drakis-bloodcaster", giverLabel: "Drakis Bloodcaster", items: "a Black Silk Cape and a Wind Rune Neza", reward: "Cloak of Spiroc Feathers", slots: ["Back"], ac: 6, stats: { str: 5, sta: 6, int: 5 }, mana: 50, weight: 0.5 },
    { label: "Test of Mind", giverId: "npc:plane-of-sky:drakis-bloodcaster", giverLabel: "Drakis Bloodcaster", items: "a Fine Cloth Raiment and a Wind Rune Ozah", reward: "Bloodsoaked Raiment", slots: ["Shoulders"], ac: 4, stats: { dex: 3, int: 5 }, hp: 30, mana: 65, weight: 0.3 },
    { label: "Test of Heart", giverId: "npc:plane-of-sky:drakis-bloodcaster", giverLabel: "Drakis Bloodcaster", items: "a Pulsating Ruby and a Wind Rune Azia", reward: "Sphinx Heart Amulet", slots: ["Neck"], ac: 4, stats: { str: 10, cha: -5, int: 10 }, resists: { disease: 5 }, mana: 25, weight: 0.1, effect: "Ultravision" },
    { label: "Test of Hands", giverId: "npc:plane-of-sky:drakis-bloodcaster", giverLabel: "Drakis Bloodcaster", items: "a Gorgon Head, an Efreeti Great Staff, and a Wind Rune Fana", reward: "Gorgon Head Staff", slots: ["Primary"], damage: 14, skill: "2H Blunt", stats: { int: 15 }, resists: { disease: 25 }, mana: 75, weight: 5.0, effect: "Tishan's Clash" },
    { label: "Test of Finger", giverId: "npc:plane-of-sky:drakis-bloodcaster", giverLabel: "Drakis Bloodcaster", items: "a Ring of Veeshan and a Wind Rune Caza", reward: "Band of Wailing Winds", slots: ["Finger"], ac: 2, stats: { int: 5 }, mana: 50, weight: 0.1, effect: "Invoke Fear" },
  ],
});

save();

console.log(
  "Migration 103 complete: added 12 quest_groups -- Magician, Ranger & Necromancer Kael/Skyshrine/Thurgadin Armor Quests + Plane of Sky Tests."
);
