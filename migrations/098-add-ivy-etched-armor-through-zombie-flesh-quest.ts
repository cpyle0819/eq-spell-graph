/**
 * Migration 098: closes out the rest of GitHub issue #26's alphabetical
 * checklist -- "Ivy Etched Armor Quests" through "Zombie Flesh Quest" (I, W,
 * Y, and Z sections). Researched directly against eqlwiki.com, following
 * decisions/eqlwiki-quest-research-method.md.
 *
 * Modeled as `quest_group`s (don't count against the standalone cap),
 * following migration 096's Warrior Kael/Skyshrine/Thurgadin Armor Quests
 * and Plane of Sky Tests pattern -- these are the last four per-class
 * armor/test clusters flagged unresearched in the issue's own "Quest
 * Groups" tracking section:
 * - Ivy Etched Armor Quests -- 7-piece Ranger armor set, two givers in
 *   Kithicor Forest (Gandari has 4 pieces, Leaf Falldim has 3).
 * - Wizard Kael Armor Quests -- 7 pieces, one giver (Ulkar Jollkarek).
 * - Wizard Skyshrine Armor Quests -- 7 pieces, one giver (Elaend Fe`Dhar).
 * - Wizard Thurgadin Armor Quests -- 7 pieces, one giver (Mauren
 *   Frostbeard).
 * - Wizard Plane of Sky Tests -- 6 sub-quests behind two apprentices
 *   (Neasin Leornic, Abec Lanor), gated by Wizard Schrock's initial
 *   dialogue.
 *
 * Modeled standalone with a `requires` edge (decisions/quest-prerequisite-
 * requires-edge.md), not deferred to the Questlines section -- a simple
 * two-stage chain, not a multi-zone/multi-boss progression:
 * - Yegek's Test, Part 1 -> Yegek's Test, Part 2 (Yegek B`Larin, Neriak
 *   Commons; Part 2's own page: "When Part 1 has been completed, Yegek may
 *   ask if you are ready for the second test").
 *
 * Modeled with a `randomGroup` spell reward (decisions/quest-reward-
 * modeling.md), same shape as Rathmana's Traveling Offer:
 * - Wizard Spells (Evil), Wizard Spells (Good) -- trade one of four common
 *   scrolls for a random one of four rarer scrolls (Abscond, Tears of
 *   Solusek, Thunderbold, Tishan`s Discord), Wizard only, level 51+; a
 *   first-pass WebFetch summary of the quest page mis-stated the reward
 *   pool as identical to the turn-in pool, caught by re-fetching the raw
 *   MediaWiki wikitext (same trick as migration 085) which quoted the NPC's
 *   own dialogue naming the turn-ins and confirmed the actual reward names
 *   via each spell's own infobox page. All four reward spells were new to
 *   the graph and added with real infobox stats, not stubs.
 * - Zombie Flesh Quest -- own page lists four spell rewards (Divine Aura,
 *   Flash of Light, Lull, Spook the Dead) under one "Reward" section with
 *   no stated turn-in count or selection rule beyond "you also receive a
 *   minor item"; modeled the four spells as one randomGroup rather than
 *   claiming all four are guaranteed. The three tradeable item rewards
 *   (Backpack, Belt Pouch, Raw-hide Sleeves) share a second randomGroup for
 *   the same reason.
 *
 * Deferred to the Questlines section (new entry), not modeled standalone --
 * a genuinely ordered, multi-zone chain, not a simple quest or quest_group:
 * - Zimel's Blades (SoulFire) -- Kalatrina Plossen in North Freeport starts
 *   an 18-step chain through Freeport Militia House, Office of the People,
 *   Groflah's Forge, Seafarer's Roost, the West Freeport Arena jail,
 *   Highpass Keep, Hall of Truth, East Commons, Mistmoore Castle, and
 *   Splitpaw Lair, ending in a SoulFire hand-in from Brother Hayle; far
 *   past the standalone/two-stage-chain bar and would need several new
 *   zone/NPC nodes to model properly.
 *
 * Reused existing nodes rather than duplicating:
 * - npc:kael-drakkal:king-tormax (already the Vkjor's Major Task /
 *   Wage War Upon The Coldain faction NPC) as Yelinak's Head Quest's giver.
 * - npc:erudin:dleria-mausrel (already Erudin's Vasty Deep Water-adjacent
 *   giver) as Zombie Flesh Quest's giver.
 * - faction:coldain, faction:dain-frostreaver-iv, faction:claws-of-veeshan
 *   for Wizard Thurgadin Armor Quests' and Yelinak's Head Quest's positive
 *   faction deltas (Kromzek/Kromrif's negative deltas not modeled, per
 *   decisions/quest-reward-modeling.md).
 *
 * No new zones needed -- every giver's zone (Kithicor Forest, Kael
 * Drakkal, Skyshrine, Thurgadin, Plane of Sky, The Overthere, Firiona Vie,
 * Neriak Commons, Stonebrunt Mountains, Erudin) already exists in the
 * graph.
 *
 * This closes out every remaining alphabetical entry on the issue's main
 * checklist (A-Z) -- everything left unchecked from here on lives in the
 * issue's "Quest Groups (and one real Questline)" tracking section.
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, addFactionReward, addGiver, save, slug } = loadGraph(import.meta.dir);

// ---------------------------------------------------------------------
// Ivy Etched Armor Quests (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kithicor-forest";
  const gandariId = "npc:kithicor-forest:gandari";
  const falldimId = "npc:kithicor-forest:leaf-falldim";
  addGiver(gandariId, "Gandari", zoneId);
  addGiver(falldimId, "Leaf Falldim", zoneId);

  const groupId = "quest_group:ivy-etched-armor-quests";
  addNode({
    id: groupId,
    label: "Ivy Etched Armor Quests",
    type: "quest_group",
    classes: ["ranger"],
    minLevel: 35,
    description:
      "Gandari and Leaf Falldim in Kithicor Forest, at Indifferent or better faction, each trade a set of quest items for one piece of Ivy Etched armor. Seven independent sub-quests, no ordering between them (Gandari has four pieces, Leaf Falldim has three).",
    wiki_title: "Ivy Etched Armor Quests",
  });
  addEdge(gandariId, groupId, "starts");
  addEdge(falldimId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const pieces = [
    { label: "Tunic", giverId: gandariId, giverLabel: "Gandari", items: "the Skull of Meldrath, Right Rune of Ivy, and two Rubies", reward: "Ivy Etched Tunic", slots: ["Chest"], ac: 19, stats: { str: 3, wis: 3 }, hp: 30, weight: 6.0, size: "Large" },
    { label: "Helm", giverId: gandariId, giverLabel: "Gandari", items: "a Cyclops Charm, Top Rune of Ivy, and one Sapphire", reward: "Ivy Etched Helm", slots: ["Head"], ac: 12, stats: { wis: 5 }, resists: { disease: 5 }, weight: 3.5, size: "Small" },
    { label: "Bracer", giverId: gandariId, giverLabel: "Gandari", items: "the Bottom Rune of Ivy, a Water Ring, and one Fire Emerald", reward: "Ivy Etched Bracer", slots: ["Wrist"], ac: 9, stats: { dex: 2 }, resists: { poison: 3 }, weight: 2.3, size: "Small" },
    { label: "Sleeves", giverId: gandariId, giverLabel: "Gandari", items: "the Heart of Fire, Left Rune of Ivy, and two Star Rubies", reward: "Ivy Etched Sleeves", slots: ["Arms"], ac: 10, stats: { str: 4 }, weight: 3.7, size: "Small" },
    { label: "Boots", giverId: falldimId, giverLabel: "Leaf Falldim", items: "a Bar of Ronium, Mistmoore Granite, and 2000 gold (must be gold, not platinum)", reward: "Ivy Etched Boots", slots: ["Feet"], ac: 10, stats: { sta: 5 }, weight: 3.6, size: "Medium" },
    { label: "Gauntlets", giverId: falldimId, giverLabel: "Leaf Falldim", items: "Broken Bow Part A and Broken Bow Part B", reward: "Ivy Etched Gauntlets", slots: ["Hands"], ac: 11, resists: { fire: 7, cold: 7 }, weight: 2.8, size: "Small" },
    { label: "Leggings", giverId: falldimId, giverLabel: "Leaf Falldim", items: "six specific arrows (from Brownie Outcasts), the Quiver of Kithicor, and the Star of Odus", reward: "Ivy Etched Leggings", slots: ["Legs"], ac: 12, stats: { agi: 5 }, resists: { fire: 5, cold: 5 }, weight: 4.2, size: "Large" },
  ] as const;

  for (const piece of pieces) {
    const questId = `quest:ivy-etched-armor-quests-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `Ivy Etched Armor Quests: ${piece.label}`,
      type: "quest",
      classes: ["ranger"],
      minLevel: 35,
      description: `Turn in ${piece.items} to ${piece.giverLabel} in Kithicor Forest for the ${piece.reward}.`,
      steps: [`Gather ${piece.items}`, `Turn them in to ${piece.giverLabel} in Kithicor Forest`],
      wiki_title: "Ivy Etched Armor Quests",
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
      classes: ["ranger"],
      slots: piece.slots,
      magic: true,
      lore: true,
      ac: piece.ac,
      stats: piece.stats,
      ...("hp" in piece ? { hp: piece.hp } : {}),
      ...("resists" in piece ? { resists: piece.resists } : {}),
      weight: piece.weight,
      size: piece.size,
      source: `Ivy Etched Armor Quests: ${piece.label} reward (${piece.giverLabel}, Kithicor Forest)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// ---------------------------------------------------------------------
// Wizard Kael Armor Quests (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const giverId = "npc:kael-drakkal:ulkar-jollkarek";
  addGiver(giverId, "Ulkar Jollkarek", zoneId);

  const groupId = "quest_group:wizard-kael-armor-quests";
  addNode({
    id: groupId,
    label: "Wizard Kael Armor Quests",
    type: "quest_group",
    classes: ["wizard"],
    description:
      "Ulkar Jollkarek in Kael Drakkel, at Ally faction, trades an Ancient Silk armor piece plus three matching gems for its Invoker counterpart. Seven independent sub-quests, no ordering between them.",
    wiki_title: "Wizard Kael Armor Quests",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const pieces = [
    { label: "Helm", base: "Ancient Silk Turban", gem: "Crushed Flame Opal", reward: "Circlet of the Invoker", slots: ["Head"], ac: 8, stats: { sta: 7, int: 6 }, mana: 45, resists: { disease: 5, magic: 8 } },
    { label: "Robe", base: "Ancient Silk Robe", gem: "Pristine Emerald", reward: "Robe of the Invoker", slots: ["Chest"], ac: 14, stats: { sta: 15, int: 14 }, hp: 50, mana: 90, resists: { fire: 10, disease: 7, magic: 7, poison: 7 } },
    { label: "Sleeves", base: "Ancient Silk Sleeves", gem: "Flawed Topaz", reward: "Sleeves of the Invoker", slots: ["Arms"], ac: 8, stats: { sta: 8, int: 5 }, hp: 20, mana: 35, resists: { cold: 4 } },
    { label: "Bracer", base: "Ancient Silk Wristband", gem: "Crushed Onyx Sapphire", reward: "Bangle of the Invoker", slots: ["Wrist"], ac: 6, stats: { int: 2, agi: 5 }, hp: 10, mana: 20, resists: { fire: 4, disease: 4, cold: 3, magic: 2, poison: 2 } },
    { label: "Gloves", base: "Ancient Silk Gloves", gem: "Crushed Topaz", reward: "Gloves of the Invoker", slots: ["Hands"], ac: 7, stats: { int: 10, agi: 9 }, hp: 20, mana: 35, resists: { fire: 3, disease: 3, cold: 3, magic: 2, poison: 3 } },
    { label: "Leggings", base: "Ancient Silk Pantaloons", gem: "Nephrite", reward: "Pants of the Invoker", slots: ["Legs"], ac: 9, stats: { sta: 5, int: 5 }, hp: 10, mana: 10, resists: { fire: 3, disease: 3, cold: 3, magic: 3, poison: 3 } },
    { label: "Boots", base: "Ancient Silk Boots", gem: "Crushed Jaundice Gem", reward: "Boots of the Invoker", slots: ["Feet"], ac: 7, stats: { sta: 3, int: 2 }, hp: 20, mana: 35, resists: { fire: 3, disease: 3, cold: 3, magic: 3, poison: 3 } },
  ] as const;

  for (const piece of pieces) {
    const questId = `quest:wizard-kael-armor-quests-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `Wizard Kael Armor Quests: ${piece.label}`,
      type: "quest",
      classes: ["wizard"],
      description: `Turn in an ${piece.base} plus 3 ${piece.gem} to Ulkar Jollkarek in Kael Drakkel for the ${piece.reward}.`,
      steps: [`Gather an ${piece.base} and 3 ${piece.gem}`, "Turn them in to Ulkar Jollkarek in Kael Drakkel"],
      wiki_title: "Wizard Kael Armor Quests",
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
      classes: ["wizard"],
      slots: piece.slots,
      magic: true,
      ac: piece.ac,
      stats: piece.stats,
      mana: piece.mana,
      ...("hp" in piece ? { hp: piece.hp } : {}),
      resists: piece.resists,
      weight: 0.1,
      source: `Wizard Kael Armor Quests: ${piece.label} reward (Ulkar Jollkarek, Kael Drakkal)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// ---------------------------------------------------------------------
// Wizard Skyshrine Armor Quests (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:skyshrine";
  const giverId = "npc:skyshrine:elaend-fedhar";
  addGiver(giverId, "Elaend Fe`Dhar", zoneId);

  const groupId = "quest_group:wizard-skyshrine-armor-quests";
  addNode({
    id: groupId,
    label: "Wizard Skyshrine Armor Quests",
    type: "quest_group",
    classes: ["wizard"],
    description:
      "Elaend Fe`Dhar, in a room atop the Skyshrine Tower, at Ally faction, trades a Tattered Silk armor piece plus three matching gems for its Icicle counterpart. Seven independent sub-quests, no ordering between them.",
    wiki_title: "Wizard Skyshrine Armor Quests",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const pieces = [
    { label: "Cap", base: "Tattered Silk Turban", gem: "Crushed Flame Opal", reward: "Icicle Circlet", slots: ["Head"], ac: 6, stats: { sta: 7, int: 7 }, hp: 30, mana: 35 },
    { label: "Robe", base: "Tattered Silk Robe", gem: "Pristine Emerald", reward: "Robe of Icicles", slots: ["Chest"], ac: 12, stats: { str: 2, sta: 15, int: 15 }, hp: 60, mana: 90 },
    { label: "Sleeves", base: "Tattered Silk Sleeves", gem: "Flawed Topaz", reward: "Icicle Sleeves", slots: ["Arms"], ac: 6, stats: { sta: 9, int: 6 }, hp: 35, mana: 35 },
    { label: "Wristbands", base: "Tattered Silk Wristband", gem: "Crushed Onyx Sapphire", reward: "Icicle Bracelet", slots: ["Wrist"], ac: 4, stats: { int: 6, agi: 5 }, hp: 15, mana: 25 },
    { label: "Gloves", base: "Tattered Silk Gloves", gem: "Crushed Topaz", reward: "Icicle Gloves", slots: ["Hands"], ac: 5, stats: { sta: 3, int: 10, agi: 9 }, hp: 15, mana: 35 },
    { label: "Leggings", base: "Tattered Silk Pantaloons", gem: "Nephrite", reward: "Icicle Pantaloons", slots: ["Legs"], ac: 7, stats: { sta: 8, int: 3 }, hp: 25, mana: 40 },
    { label: "Boots", base: "Tattered Silk Boots", gem: "Crushed Jaundice Gem", reward: "Icicle Boots", slots: ["Feet"], ac: 5, stats: { sta: 5 }, hp: 25, mana: 45 },
  ] as const;

  for (const piece of pieces) {
    const questId = `quest:wizard-skyshrine-armor-quests-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `Wizard Skyshrine Armor Quests: ${piece.label}`,
      type: "quest",
      classes: ["wizard"],
      description: `Turn in a ${piece.base} plus 3 ${piece.gem} to Elaend Fe\`Dhar in Skyshrine for the ${piece.reward}.`,
      steps: [`Gather a ${piece.base} and 3 ${piece.gem}`, "Turn them in to Elaend Fe`Dhar in Skyshrine"],
      wiki_title: "Wizard Skyshrine Armor Quests",
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
      classes: ["wizard"],
      slots: piece.slots,
      magic: true,
      ac: piece.ac,
      stats: piece.stats,
      hp: piece.hp,
      mana: piece.mana,
      weight: 0.1,
      source: `Wizard Skyshrine Armor Quests: ${piece.label} reward (Elaend Fe\`Dhar, Skyshrine)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// ---------------------------------------------------------------------
// Wizard Thurgadin Armor Quests (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:thurgadin";
  const giverId = "npc:thurgadin:mauren-frostbeard";
  addGiver(giverId, "Mauren Frostbeard", zoneId);

  const groupId = "quest_group:wizard-thurgadin-armor-quests";
  addNode({
    id: groupId,
    label: "Wizard Thurgadin Armor Quests",
    type: "quest_group",
    classes: ["wizard"],
    description:
      "Mauren Frostbeard in Thurgadin trades a Torn Enchanted Silk armor piece plus three matching gems for its Sage's counterpart. Seven independent sub-quests, no ordering between them.",
    wiki_title: "Wizard Thurgadin Armor Quests",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const pieces = [
    { label: "Helm", base: "Torn Enchanted Silk Turban", gem: "Crushed Flame Opal", reward: "Sage's Crown", slots: ["Head"], ac: 6, stats: { sta: 6, int: 5 }, mana: 35, resists: { fire: 2, magic: 7 } },
    { label: "Robe", base: "Torn Enchanted Silk Robe", gem: "Pristine Emerald", reward: "Sage's Robe", slots: ["Chest"], ac: 12, stats: { sta: 15, int: 14 }, hp: 30, mana: 90, resists: { fire: 5, disease: 5, cold: 5, magic: 5, poison: 5 } },
    { label: "Sleeves", base: "Torn Enchanted Silk Sleeves", gem: "Flawed Topaz", reward: "Sage's Sleeves", slots: ["Arms"], ac: 6, stats: { sta: 4, int: 5 }, mana: 35, resists: { poison: 2 } },
    { label: "Wristbands", base: "Torn Enchanted Silk Wristband", gem: "Crushed Onyx Sapphire", reward: "Sage's Bracelet", slots: ["Wrist"], ac: 4, stats: { int: 2, agi: 5 }, mana: 20, resists: { fire: 2, disease: 1, cold: 2, magic: 1, poison: 1 } },
    { label: "Gloves", base: "Torn Enchanted Silk Gloves", gem: "Crushed Topaz", reward: "Sage's Gloves", slots: ["Hands"], ac: 5, stats: { int: 9, agi: 9 }, mana: 35, resists: { fire: 2, disease: 2, cold: 2, magic: 1, poison: 2 } },
    { label: "Leggings", base: "Torn Enchanted Silk Pantaloons", gem: "Nephrite", reward: "Sage's Pantaloons", slots: ["Legs"], ac: 7, stats: { sta: 5, int: 2 }, resists: { fire: 2, disease: 1, cold: 2, magic: 3, poison: 1 } },
    { label: "Boots", base: "Torn Enchanted Silk Boots", gem: "Crushed Jaundice Gem", reward: "Sage's Boots", slots: ["Feet"], ac: 5, stats: { sta: 3 }, mana: 35, resists: { fire: 2, disease: 2, cold: 2, magic: 2, poison: 2 } },
  ] as const;

  for (const piece of pieces) {
    const questId = `quest:wizard-thurgadin-armor-quests-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `Wizard Thurgadin Armor Quests: ${piece.label}`,
      type: "quest",
      classes: ["wizard"],
      description: `Turn in a ${piece.base} plus 3 ${piece.gem} to Mauren Frostbeard in Thurgadin for the ${piece.reward}.`,
      steps: [`Gather a ${piece.base} and 3 ${piece.gem}`, "Turn them in to Mauren Frostbeard in Thurgadin"],
      wiki_title: "Wizard Thurgadin Armor Quests",
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
      classes: ["wizard"],
      slots: piece.slots,
      magic: true,
      ac: piece.ac,
      stats: piece.stats,
      ...("hp" in piece ? { hp: piece.hp } : {}),
      ...("mana" in piece ? { mana: piece.mana } : {}),
      resists: piece.resists,
      weight: 0.1,
      source: `Wizard Thurgadin Armor Quests: ${piece.label} reward (Mauren Frostbeard, Thurgadin)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
  addFactionReward(groupId, "Coldain");
  addFactionReward(groupId, "Dain Frostreaver IV");
}

// ---------------------------------------------------------------------
// Wizard Plane of Sky Tests (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:plane-of-sky";
  const schrockId = "npc:plane-of-sky:wizard-schrock";
  const neasinId = "npc:plane-of-sky:neasin-leornic";
  const abecId = "npc:plane-of-sky:abec-lanor";
  addGiver(schrockId, "Wizard Schrock", zoneId);
  addGiver(neasinId, "Neasin Leornic", zoneId);
  addGiver(abecId, "Abec Lanor", zoneId);

  const groupId = "quest_group:wizard-plane-of-sky-tests";
  addNode({
    id: groupId,
    label: "Wizard Plane of Sky Tests",
    type: "quest_group",
    classes: ["wizard"],
    description:
      "Wizard Schrock in the Plane of Sky directs players to Neasin Leornic or Abec Lanor; each offers three independent item-turn-in tests for a named reward. Six independent sub-quests, no ordering between them.",
    wiki_title: "Wizard Plane of Sky Tests",
  });
  addEdge(schrockId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const tests = [
    { label: "Test of Concentration", giverId: neasinId, giverLabel: "Neasin Leornic", items: "an azure tessera, an augmentor's gem, and a grey damask cloak", reward: "Augmentor's Mask", slots: ["Face"], ac: 6, stats: { dex: 4, int: 9, agi: 8 }, mana: 9 },
    { label: "Test of Focus", giverId: neasinId, giverLabel: "Neasin Leornic", items: "an iron disk, an ethereal opal, and a woven skull cap", reward: "Al'Kabor's Cap of Binding", slots: ["Head"], ac: 6, stats: { str: 5, int: 8 }, hp: 40, mana: 20 },
    { label: "Test of Meditation", giverId: neasinId, giverLabel: "Neasin Leornic", items: "a hyaline globe, a sky topaz, and high quality raiment", reward: "Raiment of Thunder", slots: ["Chest"], ac: 4, stats: { str: 5, int: 5 }, mana: 15 },
    { label: "Test of Conception", giverId: abecId, giverLabel: "Abec Lanor", items: "an efreeti statuette, a mithril air ring, and a box of winds", reward: "Solidate Mithril Ring", slots: ["Finger"], ac: 4, stats: { str: 5, int: 5, agi: 6 }, mana: 50 },
    { label: "Test of Visualization", giverId: abecId, giverLabel: "Abec Lanor", items: "a white-tipped spiroc feather, a pulsating sapphire, and an amethyst amulet", reward: "Amulet of the Void", slots: ["Neck"], ac: 4, stats: { dex: 5, cha: 5, int: 5, agi: 5 }, mana: 50 },
    { label: "Test of Preparation", giverId: abecId, giverLabel: "Abec Lanor", items: "an efreeti war staff, lush nectar, a copper air band, and a large sky sapphire", reward: "Nargon's Staff", slots: ["Primary"], skill: "2H Blunt", damage: 16, stats: { int: 15 }, mana: 75 },
  ] as const;

  for (const test of tests) {
    const questId = `quest:wizard-plane-of-sky-${slug(test.label)}`;
    addNode({
      id: questId,
      label: `Wizard Plane of Sky Tests: ${test.label}`,
      type: "quest",
      classes: ["wizard"],
      description: `Bring ${test.items} to ${test.giverLabel} in the Plane of Sky for the ${test.reward}.`,
      steps: [`Gather ${test.items}`, `Turn them in to ${test.giverLabel} in the Plane of Sky`],
      wiki_title: "Wizard Plane of Sky Tests",
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
      classes: ["wizard"],
      slots: test.slots,
      magic: true,
      lore: true,
      noTrade: true,
      ...("skill" in test ? { skill: test.skill } : {}),
      ...("damage" in test ? { damage: test.damage } : {}),
      ac: test.ac,
      stats: test.stats,
      mana: test.mana,
      source: `Wizard Plane of Sky Tests: ${test.label} reward (${test.giverLabel}, Plane of Sky)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// ---------------------------------------------------------------------
// Wizard Spells (Evil) / Wizard Spells (Good) shared reward pool
// ---------------------------------------------------------------------
addNode({
  id: "spell:abscond",
  label: "Abscond",
  type: "spell",
  class_levels: [{ class: "wizard", level: 52 }],
  description: "Teleports you to a relatively safe location in the current zone.",
  mana: 600,
  skill: "Alteration",
  castTime: 7.0,
  recastTime: 10.0,
  duration: "Instant",
  targetType: "Self",
  spellType: "Beneficial",
  resist: "Unresistable",
  icon: "G",
});
addNode({
  id: "spell:tears-of-solusek",
  label: "Tears of Solusek",
  type: "spell",
  class_levels: [{ class: "wizard", level: 55 }],
  description: "Tears of searing flame fall around your target, causing three waves of 645 damage.",
  mana: 408,
  skill: "Evocation",
  castTime: 5.0,
  recastTime: 12.0,
  duration: "Instant",
  targetType: "Targeted AE",
  spellType: "Detrimental",
  resist: "Fire (-10)",
  range: 150,
  icon: "O",
});
addNode({
  id: "spell:thunderbold",
  label: "Thunderbold",
  type: "spell",
  class_levels: [{ class: "wizard", level: 54 }],
  description:
    "Calls down a bolt of thunderous energy, causing 600 damage, and briefly stunning up to four creatures in the vicinity of your target.",
  mana: 300,
  skill: "Evocation",
  castTime: 3.0,
  recastTime: 18.0,
  duration: "Instant",
  targetType: "Targeted AE",
  spellType: "Detrimental",
  resist: "Magic (0)",
  range: 200,
  icon: "O",
});
addNode({
  id: "spell:tishans-discord",
  label: "Tishan`s Discord",
  type: "spell",
  class_levels: [{ class: "wizard", level: 51 }],
  description: "Strikes your target with energy, stunning them briefly and causing 260 damage.",
  mana: 130,
  skill: "Evocation",
  castTime: 2.25,
  recastTime: 18.0,
  fizzleTime: 2.5,
  duration: "Instant",
  targetType: "Single",
  spellType: "Detrimental",
  resist: "Magic (0)",
  range: 200,
  icon: "D",
});

// ---------------------------------------------------------------------
// Wizard Spells (Evil)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:the-overthere";
  const giverId = "npc:the-overthere:utandar-rizndown";
  addGiver(giverId, "Utandar Rizndown", zoneId);

  const questId = "quest:wizard-spells-evil";
  addNode({
    id: questId,
    label: "Wizard Spells (Evil)",
    type: "quest",
    classes: ["wizard"],
    minLevel: 51,
    description:
      "Utandar Rizndown in The Overthere trades any one of four spell scrolls (Atol's Spectral Shackles, Inferno of Al'Kabor, Pillar of Frost, Tears of Druzzil) for a random one of four rarer spells (Abscond, Tears of Solusek, Thunderbold, Tishan`s Discord). Wizard only.",
    steps: ["Bring one of the four scrolls to Utandar Rizndown in The Overthere"],
    wiki_title: "Wizard Spells (Evil)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "spell:abscond", "rewards", { randomGroup: "wizard-spells-evil" });
  addEdge(questId, "spell:tears-of-solusek", "rewards", { randomGroup: "wizard-spells-evil" });
  addEdge(questId, "spell:thunderbold", "rewards", { randomGroup: "wizard-spells-evil" });
  addEdge(questId, "spell:tishans-discord", "rewards", { randomGroup: "wizard-spells-evil" });
}

// ---------------------------------------------------------------------
// Wizard Spells (Good)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:firiona-vie";
  const giverId = "npc:firiona-vie:barnal-flamehand";
  addGiver(giverId, "Barnal Flamehand", zoneId);

  const questId = "quest:wizard-spells-good";
  addNode({
    id: questId,
    label: "Wizard Spells (Good)",
    type: "quest",
    classes: ["wizard"],
    minLevel: 51,
    description:
      "Barnal Flamehand in Firiona Vie trades any one of four spell scrolls (Atol's Spectral Shackles, Inferno of Al'Kabor, Pillar of Frost, Tears of Druzzil) for a random one of four rarer spells (Abscond, Tears of Solusek, Thunderbold, Tishan`s Discord). Wizard only.",
    steps: ["Bring one of the four scrolls to Barnal Flamehand in Firiona Vie"],
    wiki_title: "Wizard Spells (Good)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "spell:abscond", "rewards", { randomGroup: "wizard-spells-good" });
  addEdge(questId, "spell:tears-of-solusek", "rewards", { randomGroup: "wizard-spells-good" });
  addEdge(questId, "spell:thunderbold", "rewards", { randomGroup: "wizard-spells-good" });
  addEdge(questId, "spell:tishans-discord", "rewards", { randomGroup: "wizard-spells-good" });
}

// ---------------------------------------------------------------------
// Yegek's Test, Part 1
// ---------------------------------------------------------------------
{
  const zoneId = "zone:neriak-commons";
  const giverId = "npc:neriak-commons:yegek-blarin";
  addGiver(giverId, "Yegek B`Larin", zoneId);

  const part1Id = "quest:yegeks-test-part-1";
  addNode({
    id: part1Id,
    label: "Yegek's Test, Part 1",
    type: "quest",
    minLevel: 1,
    description:
      "Yegek B`Larin, inside the arena at the Indigo Brotherhood guild hall in Neriak Commons, requires Amiable or better faction. Fill an Empty Bag with 3 fire beetle eyes and 3 Bone Chips, combine them into a Bag of Eyes n Bones, and turn it in for coin and experience.",
    steps: [
      "Reach at least Amiable faction with the Indigo Brotherhood",
      "Fill an Empty Bag with 3 fire beetle eyes and 3 Bone Chips",
      "Turn in the Bag of Eyes n Bones to Yegek B`Larin in Neriak Commons",
    ],
    wiki_title: "Yegek's Test, Part 1",
  });
  addEdge(giverId, part1Id, "starts");
  addEdge(part1Id, zoneId, "starts_in");
  addEdge(part1Id, zoneId, "located_in");

  const part2Id = "quest:yegeks-test-part-2";
  addNode({
    id: part2Id,
    label: "Yegek's Test, Part 2",
    type: "quest",
    classes: ["warrior"],
    minLevel: 1,
    description:
      "After Yegek's Test, Part 1, Yegek B`Larin in Neriak Commons takes the player's starting no-drop shortsword; a Teir`Dal Coward spawns to fight. Killing it and returning its Teir`Dal Head to Yegek yields the Sullied Two Handed Sword.",
    steps: [
      "Complete Yegek's Test, Part 1",
      "Hand your starting shortsword to Yegek B`Larin",
      "Defeat the Teir`Dal Coward that spawns and loot its Teir`Dal Head",
      "Return the head to Yegek B`Larin for the Sullied Two Handed Sword",
    ],
    wiki_title: "Yegek's Test, Part 2",
  });
  addEdge(giverId, part2Id, "starts");
  addEdge(part2Id, zoneId, "starts_in");
  addEdge(part2Id, zoneId, "located_in");
  addEdge(part2Id, part1Id, "requires");
  addFactionReward(part2Id, "Indigo Brotherhood");

  const swordId = "item:sullied-two-handed-sword";
  addNode({
    id: swordId,
    label: "Sullied Two Handed Sword",
    type: "item",
    slots: ["Primary"],
    classes: ["warrior"],
    race: ["dark elf"],
    skill: "2H Slashing",
    damage: 9,
    delay: 46,
    weight: 11.5,
    source: "Yegek's Test, Part 2 reward (Yegek B`Larin, Neriak Commons)",
  });
  addEdge(part2Id, swordId, "rewards");
}

// ---------------------------------------------------------------------
// Yelinak's Head Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const skyshrineId = "zone:skyshrine";
  const giverId = "npc:kael-drakkal:king-tormax";
  addGiver(giverId, "King Tormax", zoneId);

  const questId = "quest:yelinaks-head-quest";
  addNode({
    id: questId,
    label: "Yelinak's Head Quest",
    type: "quest",
    minLevel: 53,
    description:
      "King Tormax in Kael Drakkel, at Indifferent or better faction (minimum Dubious): \"If you are able to destroy either of my mortal foes, bring me proof of your exploits and you will be known as the hero of Kael Drakkel.\" Defeating Lord Yelinak in Skyshrine and returning his head earns the Gauntlets of Dragon Slaying.",
    steps: [
      "Reach at least Dubious faction with King Tormax",
      "Defeat Lord Yelinak in Skyshrine and loot his head",
      "Return the head to King Tormax in Kael Drakkel",
    ],
    wiki_title: "Yelinak's Head Quest",
    era: "Velious",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, skyshrineId, "located_in");
  addFactionReward(questId, "King Tormax");
  addFactionReward(questId, "Claws of Veeshan");

  const gauntletsId = "item:gauntlets-of-dragon-slaying";
  addNode({
    id: gauntletsId,
    label: "Gauntlets of Dragon Slaying",
    type: "item",
    slots: ["Hands"],
    ac: 30,
    stats: { str: 9, wis: 9, int: 9 },
    hp: 75,
    mana: 75,
    resists: { magic: 9, fire: 9, cold: 9, poison: 9, disease: 9 },
    magic: true,
    lore: true,
    noTrade: true,
    effect: "Haste +41%",
    source: "Yelinak's Head Quest reward (King Tormax, Kael Drakkel)",
  });
  addEdge(questId, gauntletsId, "rewards");
}

// ---------------------------------------------------------------------
// Yuio's Illness
// ---------------------------------------------------------------------
{
  const zoneId = "zone:stonebrunt-mountains";
  const jaliId = "npc:stonebrunt-mountains:jali-kaliio";
  const khonzaId = "npc:stonebrunt-mountains:khonza-ayssla";
  addGiver(jaliId, "Jali Kaliio", zoneId);
  addGiver(khonzaId, "Khonza Ayssla", zoneId);

  const questId = "quest:yuios-illness";
  addNode({
    id: questId,
    label: "Yuio's Illness",
    type: "quest",
    classes: ["warrior", "paladin", "ranger", "shadow knight", "bard", "rogue"],
    minLevel: 1,
    description:
      "Jali Kaliio in Stonebrunt Mountains asks for help with his ill wife Yuio; Khonza Ayssla, the High Shaman, agrees to prepare a remedy from 2 Panda Claws, 2 Tiger Skins, 2 Asp Poison Sacs, 1 Bamboo Shoot, and 1 Kejekan Palm Fruit, combined in a provided satchel. Returning the Full Gathering Satchel to Khonza and delivering her Vial of Healing Liquid to Jali completes the quest for the Wakizashi of the Frozen Skies.",
    steps: [
      "Speak to Jali Kaliio and agree to help his wife Yuio",
      "Speak to Khonza Ayssla and agree to gather ingredients",
      "Collect 2 Panda Claws, 2 Tiger Skins, 2 Asp Poison Sacs, 1 Bamboo Shoot, and 1 Kejekan Palm Fruit",
      "Combine the ingredients in Khonza's satchel and return the Full Gathering Satchel to her",
      "Deliver the Vial of Healing Liquid she gives you to Jali Kaliio",
    ],
    wiki_title: "Yuio's Illness",
  });
  addEdge(jaliId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Kejek Village");
  addFactionReward(questId, "Peace Keepers");

  const wakizashiId = "item:wakizashi-of-the-frozen-skies";
  addNode({
    id: wakizashiId,
    label: "Wakizashi of the Frozen Skies",
    type: "item",
    slots: ["Primary"],
    classes: ["warrior", "paladin", "ranger", "shadow knight", "bard", "rogue"],
    skill: "1H Slashing",
    damage: 6,
    delay: 22,
    magic: true,
    effect: "Spirit Strike (Combat, instant cast) at Level 35",
    source: "Yuio's Illness reward (Jali Kaliio, Stonebrunt Mountains)",
  });
  addEdge(questId, wakizashiId, "rewards");
}

// ---------------------------------------------------------------------
// Zombie Flesh Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const giverId = "npc:erudin:dleria-mausrel";
  addGiver(giverId, "Dleria Mausrel", zoneId);

  const questId = "quest:zombie-flesh-quest";
  addNode({
    id: questId,
    label: "Zombie Flesh Quest",
    type: "quest",
    classes: ["cleric", "paladin"],
    minLevel: 10,
    description:
      "Dleria Mausrel in Erudin, at Amiable or better faction, has players combine four Zombie Skins in a Zombie Flesh Bag into a Bag of Zombie Flesh; turning it in yields one of three tradeable items (Backpack, Belt Pouch, Raw-hide Sleeves) and one of four spells (Divine Aura, Flash of Light, Lull, Spook the Dead) -- the wiki lists both reward groups under one \"Reward\" section without specifying an exact selection rule.",
    steps: [
      "Collect four Zombie Skins",
      "Combine them in a Zombie Flesh Bag to create a Bag of Zombie Flesh",
      "Return the Bag of Zombie Flesh to Dleria Mausrel in Erudin",
    ],
    wiki_title: "Zombie Flesh Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "spell:divine-aura", "rewards", { randomGroup: "zombie-flesh-quest-spell" });
  addEdge(questId, "spell:flash-of-light", "rewards", { randomGroup: "zombie-flesh-quest-spell" });
  addEdge(questId, "spell:lull", "rewards", { randomGroup: "zombie-flesh-quest-spell" });
  addEdge(questId, "spell:spook-the-dead", "rewards", { randomGroup: "zombie-flesh-quest-spell" });

  const backpackId = "item:backpack";
  addNode({
    id: backpackId,
    label: "Backpack",
    type: "item",
    weight: 3.0,
    source: "Zombie Flesh Quest reward (Dleria Mausrel, Erudin)",
  });
  const pouchId = "item:belt-pouch";
  addNode({
    id: pouchId,
    label: "Belt Pouch",
    type: "item",
    weight: 0.4,
    source: "Zombie Flesh Quest reward (Dleria Mausrel, Erudin)",
  });
  const sleevesId = "item:raw-hide-sleeves";
  addNode({
    id: sleevesId,
    label: "Raw-hide Sleeves",
    type: "item",
    slots: ["Arms"],
    ac: 4,
    weight: 2.2,
    source: "Zombie Flesh Quest reward (Dleria Mausrel, Erudin)",
  });
  addEdge(questId, backpackId, "rewards", { randomGroup: "zombie-flesh-quest-item" });
  addEdge(questId, pouchId, "rewards", { randomGroup: "zombie-flesh-quest-item" });
  addEdge(questId, sleevesId, "rewards", { randomGroup: "zombie-flesh-quest-item" });
}

save();

console.log(
  "Migration 098 complete: added 5 standalone quests (Wizard Spells Evil/Good, Yegek's Test Part 1/2, Yelinak's Head Quest, Yuio's Illness, Zombie Flesh Quest) plus Ivy Etched/Wizard Kael/Wizard Skyshrine/Wizard Thurgadin Armor Quests and Wizard Plane of Sky Tests as quest_groups (34 sub-quests total); linked Yegek's Test Part 2 to Part 1 via a requires edge; deferred Zimel's Blades (SoulFire) to the Questlines section as a genuinely ordered multi-zone chain. This closes out every remaining alphabetical entry (A-Z) on GitHub issue #26's main checklist."
);
