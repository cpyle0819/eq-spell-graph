/**
 * Migration 097: next standalone batch off GitHub issue #26's checklist --
 * "Weapons Delivery" through "Xelha's Cyclops Eye" (kept to 15 standalone
 * quests per this batch's token budget, smaller than the usual 25 cap).
 * Researched directly against eqlwiki.com, following
 * decisions/eqlwiki-quest-research-method.md.
 *
 * Deferred to the Questlines section (not modeled standalone):
 * - Wisdom - The Long Battle, Wisdom - The Short Battle -- both run through
 *   Gozzrem in the Temple of Veeshan, the same tear/symbol turn-in mechanic
 *   as the already-deferred Dozekar Tear Quests cluster and its Arcane
 *   Tests entry (Gozzrem's own line: "If you seek wisdom or the arcane...
 *   the short battle or the long battle?"). Not modeled standalone; folded
 *   into the Dozekar Tear Quests entry as a third giver.
 * - Wizard Epic Quest -- confirmed multi-stage ordered chain (Solomen in
 *   Temple of Solusek Ro through Arantir Karondor's three-staff gauntlet,
 *   ending in the Staff of the Four), same shape as the other class epics
 *   already deferred (Rogue/Shadowknight/Shaman/Warrior). New Questlines
 *   entry.
 *
 * Modeled as a `quest_group` (doesn't count against the standalone cap):
 * - Wolf Hide Armor -- 3 independent pieces (belt/boots/cape), one giver
 *   (Baobob Miller, Qeynos Hills), no ordering between them.
 *
 * Reused existing nodes rather than duplicating:
 * - npc:temple-of-solusek-ro:gardern, npc:everfrost-peaks:karg-icebear,
 *   npc:rathe-mountains:karam-dragonforge, npc:kithicor-forest:ged-twigborn,
 *   npc:halas:waltor-felligan, npc:temple-of-solusek-ro:vurgo,
 *   npc:east-freeport:xelha-nevagon -- all already exist as multi-quest
 *   givers in this graph; this batch adds new `starts` edges rather than
 *   new NPC nodes.
 * - item:brass-ring (Wenbie's Muffins reward, not-always-given per the
 *   wiki's own ~1/10 rate) -- its `source` field already documented this
 *   quest from a prior batch's cross-reference, so reused as-is.
 * - spell:frost-bolt, spell:minor-shielding, spell:sphere-of-light (Wizard's
 *   First Assignment reward pool) and spell:beguile-undead,
 *   spell:call-of-bones, spell:invoke-shadow, spell:greater-shielding,
 *   spell:resist-disease, spell:venom-of-the-snake (Xelha's Cyclops Eye
 *   reward pool, all necromancer-class spells per their own class_levels)
 *   and spell:cure-poison, spell:drowsy, spell:endure-fire,
 *   spell:feet-like-cat, spell:fleeting-fury, spell:frost-rift, spell:gate,
 *   spell:sicken (Wooly Fungus Quest reward pool) -- all already existed as
 *   spell nodes; wired as randomGroup reward pools rather than duplicating.
 * - spell:jaxan-s-jig-o-vigor (Winds of Karana reward) -- already existed.
 * - faction:the-freeport-militia (over the graph's near-duplicate
 *   "Freeport Militia"), faction:temple-of-sol-ro, faction:shadowed-men,
 *   faction:kerra-isle -- reused existing labels/spellings over creating
 *   variants.
 *
 * Wolfskin Gloves Quest's "usable by all classes except Necromancer,
 * Wizard, Magician, Enchanter" is resolved to an explicit allow-list per
 * decisions/item-node-schema.md ("classes is resolved to an explicit
 * allow-list at authoring time, not stored as an exclusion").
 *
 * Weeping Wand Quest's turn-in items are sourced from Cazic Thule and
 * Castle Mistmoore, neither of which exists as a zone node in this graph;
 * per the issue's zone guardrail (which applies to a quest's own giver
 * zone), only the giver's zone (Temple of Solusek Ro, already in the
 * graph) is linked -- the flavor-text source zones are left as prose in
 * the description rather than triggering new zone research out of scope
 * for this batch.
 *
 * No new zones needed for any other quest -- every giver's zone (West
 * Freeport, South Qeynos, Kael Drakkal, Northern Karana [wiki's "North
 * Karana"], Everfrost Peaks, Rathe Mountains, Southern Karana, Greater
 * Faydark, Kerra Island, Erudin Palace, Kithicor Forest, Qeynos Hills,
 * Halas, East Freeport) already exists in the graph.
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, addFactionReward, addGiver, save, slug } = loadGraph(import.meta.dir);

// ---------------------------------------------------------------------
// Weapons Delivery
// ---------------------------------------------------------------------
{
  const zoneId = "zone:west-freeport";
  const giverId = "npc:west-freeport:larn-brugal";
  addGiver(giverId, "Larn Brugal", zoneId);

  const questId = "quest:weapons-delivery";
  addNode({
    id: questId,
    label: "Weapons Delivery",
    type: "quest",
    minLevel: 1,
    description:
      "Larn Brugal in West Freeport trades four raw short swords -- three found on the ground in orc tents, one a rare drop from an Orc Weaponsmith -- for Groflah's Stoutbite.",
    steps: [
      "Collect four raw short swords (three ground drops in orc tents, one rare drop from an Orc Weaponsmith)",
      "Turn them in to Larn Brugal in West Freeport",
    ],
    wiki_title: "Weapons Delivery",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Steel Warriors");
  addFactionReward(questId, "Knights of Truth");
  addFactionReward(questId, "Guardians of the Vale");
  addFactionReward(questId, "Ashen Order");
  addFactionReward(questId, "Commons Residents");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Coalition of Tradefolk");
  addFactionReward(questId, "Merchants of Qeynos");
  addFactionReward(questId, "Coalition of Tradefolk Underground");
  addFactionReward(questId, "Death Fist Orcs");
  addFactionReward(questId, "Corrupt Qeynos Guards");
  addFactionReward(questId, "The Freeport Militia");

  const swordId = "item:groflahs-stoutbite";
  addNode({
    id: swordId,
    label: "Groflah's Stoutbite",
    type: "item",
    slots: ["Primary", "Secondary"],
    skill: "1H Slashing",
    damage: 5,
    delay: 28,
    source: "Weapons Delivery reward (Larn Brugal, West Freeport)",
  });
  addEdge(questId, swordId, "rewards");
}

// ---------------------------------------------------------------------
// Weeping Wand Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:temple-of-solusek-ro";
  const giverId = "npc:temple-of-solusek-ro:gardern";
  addGiver(giverId, "Gardern", zoneId);

  const questId = "quest:weeping-wand-quest";
  addNode({
    id: questId,
    label: "Weeping Wand Quest",
    type: "quest",
    classes: ["wizard"],
    minLevel: 1,
    description:
      "Gardern in the Temple of Solusek Ro trades a Silver Wand (from a silvered guard in Cazic Thule), a Bloodblack Wand (from giant skeletons in Mount Rathe), Twice-Woven Silk (from fairies), and a Scepter (from the Tomb in Castle Mistmoore) for the Weeping Wand.",
    steps: [
      "Collect a Silver Wand, a Bloodblack Wand, Twice-Woven Silk, and a Scepter",
      "Turn them in to Gardern in the Temple of Solusek Ro",
    ],
    wiki_title: "Weeping Wand Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Temple Of Sol Ro");
  addFactionReward(questId, "Shadowed Men");

  const wandId = "item:weeping-wand";
  addNode({
    id: wandId,
    label: "Weeping Wand",
    type: "item",
    classes: ["wizard"],
    slots: ["Primary"],
    skill: "1H Blunt",
    damage: 5,
    delay: 25,
    stats: { int: 3 },
    effect: "Strip Enchantment (Any Slot/Can Equip, instant cast) at Level 20",
    magic: true,
    lore: true,
    noTrade: true,
    weight: 1.0,
    size: "Medium",
    source: "Weeping Wand Quest reward (Gardern, Temple of Solusek Ro)",
  });
  addEdge(questId, wandId, "rewards");
}

// ---------------------------------------------------------------------
// Wenbie's Muffins
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:guard-wenbie";
  addGiver(giverId, "Guard Wenbie", zoneId);

  const questId = "quest:wenbies-muffins";
  addNode({
    id: questId,
    label: "Wenbie's Muffins",
    type: "quest",
    minLevel: 1,
    description:
      "Guard Wenbie in South Qeynos takes 1-4 individual (not stacked) Muffins for experience, faction, and a small amount of coin; roughly 1 in 10 turn-ins also yields a Brass Ring.",
    steps: [
      "Collect 1-4 individual Muffins",
      "Turn them in to Guard Wenbie in South Qeynos",
    ],
    wiki_title: "Wenbie's Muffins",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Antonius Bayle");
  addFactionReward(questId, "Merchants of Qeynos");
  addFactionReward(questId, "Corrupt Qeynos Guards");
  addFactionReward(questId, "Circle of Unseen Hands");
  addEdge(questId, "item:brass-ring", "rewards");
}

// ---------------------------------------------------------------------
// Wenglawks The Traitor
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const wastesId = "zone:western-wastes";
  const giverId = "npc:kael-drakkal:fjokar-frozenshard";
  addGiver(giverId, "Fjokar Frozenshard", zoneId);

  const questId = "quest:wenglawks-the-traitor";
  addNode({
    id: questId,
    label: "Wenglawks The Traitor",
    type: "quest",
    classes: ["rogue"],
    minLevel: 1,
    description:
      "Fjokar Frozenshard, in the halls behind King Tormax in Kael Drakkal, takes a Sealed Letter dropped by a Shardwing Courier in Western Wastes and trades it for the Frozen Shard.",
    steps: [
      "Defeat a Shardwing Courier in Western Wastes for a Sealed Letter",
      "Return the letter to Fjokar Frozenshard in Kael Drakkal",
    ],
    wiki_title: "Wenglawks The Traitor",
    era: "Velious",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, wastesId, "located_in");
  addFactionReward(questId, "Kromzek");
  addFactionReward(questId, "King Tormax");
  addFactionReward(questId, "Dain Frostreaver IV");
  addFactionReward(questId, "Yelinak");

  const daggerId = "item:frozen-shard";
  addNode({
    id: daggerId,
    label: "Frozen Shard",
    type: "item",
    classes: ["rogue"],
    slots: ["Primary", "Secondary"],
    skill: "Piercing",
    damage: 13,
    delay: 26,
    effect: "Affliction (Combat, instant cast) at Level 44",
    magic: true,
    lore: true,
    weight: 2.5,
    size: "Medium",
    source: "Wenglawks The Traitor reward (Fjokar Frozenshard, Kael Drakkal)",
  });
  addEdge(questId, daggerId, "rewards");
}

// ---------------------------------------------------------------------
// Werewolf Hunters
// ---------------------------------------------------------------------
{
  const zoneId = "zone:northern-karana";
  const giverId = "npc:northern-karana:fixxin-followig";
  addGiver(giverId, "Fixxin Followig", zoneId);

  const questId = "quest:werewolf-hunters";
  addNode({
    id: questId,
    label: "Werewolf Hunters",
    type: "quest",
    minLevel: 1,
    description:
      "Fixxin Followig in Northern Karana accepts one silver bar at a time (and only one) in exchange for the lore book Fixxin Followigs Silvery Blades, detailing how to craft silver weapons.",
    steps: [
      "Collect a silver bar",
      "Turn it in to Fixxin Followig in Northern Karana",
    ],
    wiki_title: "Werewolf Hunters",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Karana Residents");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Priests of Life");
  addFactionReward(questId, "Knights of Thunder");

  const bookId = "item:fixxin-followigs-silvery-blades";
  addNode({
    id: bookId,
    label: "Fixxin Followigs Silvery Blades",
    type: "item",
    lore: true,
    source: "Werewolf Hunters reward (Fixxin Followig, Northern Karana)",
  });
  addEdge(questId, bookId, "rewards");
}

// ---------------------------------------------------------------------
// Werewolf Skin Cloak Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:everfrost-peaks";
  const giverId = "npc:everfrost-peaks:karg-icebear";
  addGiver(giverId, "Karg IceBear", zoneId);

  const questId = "quest:werewolf-skin-cloak-quest";
  addNode({
    id: questId,
    label: "Werewolf Skin Cloak Quest",
    type: "quest",
    minLevel: 1,
    description:
      "Karg IceBear in Everfrost Peaks trades a Werewolf Pelt plus 100 platinum, handed in together in a single trade, for the Werewolf Skin Cloak.",
    steps: [
      "Collect a Werewolf Pelt and 100 platinum",
      "Turn in both together to Karg IceBear in Everfrost Peaks",
    ],
    wiki_title: "Werewolf Skin Cloak Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const cloakId = "item:werewolf-skin-cloak";
  addNode({
    id: cloakId,
    label: "Werewolf Skin Cloak",
    type: "item",
    slots: ["Back"],
    ac: 5,
    stats: { str: 3, sta: 3 },
    magic: true,
    source: "Werewolf Skin Cloak Quest reward (Karg IceBear, Everfrost Peaks)",
  });
  addEdge(questId, cloakId, "rewards");
}

// ---------------------------------------------------------------------
// White Dragonscale Cloak Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:rathe-mountains";
  const permafrostId = "zone:permafrost";
  const giverId = "npc:rathe-mountains:karam-dragonforge";
  addGiver(giverId, "Karam Dragonforge", zoneId);

  const questId = "quest:white-dragonscale-cloak-quest";
  addNode({
    id: questId,
    label: "White Dragonscale Cloak Quest",
    type: "quest",
    minLevel: 1,
    description:
      "Karam Dragonforge in Rathe Mountains trades a White Dragon Hide (from Lady Vox), a magical Platinum Diamond Wedding Ring, and a magical Black Sapphire Platinum Necklace (both Jewelcrafted) for the White Dragonscale Cloak.",
    steps: [
      "Defeat Lady Vox for a White Dragon Hide",
      "Craft a magical Platinum Diamond Wedding Ring and a magical Black Sapphire Platinum Necklace via Jewelcrafting",
      "Turn in all three items to Karam Dragonforge in Rathe Mountains",
    ],
    wiki_title: "White Dragonscale Cloak Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, permafrostId, "located_in");

  const cloakId = "item:white-dragonscale-cloak";
  addNode({
    id: cloakId,
    label: "White Dragonscale Cloak",
    type: "item",
    slots: ["Back"],
    ac: 10,
    stats: { wis: 9, int: 9 },
    mana: 75,
    resists: { cold: 25 },
    magic: true,
    source: "White Dragonscale Cloak Quest reward (Karam Dragonforge, Rathe Mountains)",
  });
  addEdge(questId, cloakId, "rewards");
}

// ---------------------------------------------------------------------
// Winds of Karana
// ---------------------------------------------------------------------
{
  const zoneId = "zone:southern-karana";
  const giverId = "npc:southern-karana:vhalen-nostrolo";
  addGiver(giverId, "Vhalen Nostrolo", zoneId);

  const questId = "quest:winds-of-karana";
  addNode({
    id: questId,
    label: "Winds of Karana",
    type: "quest",
    classes: ["bard"],
    minLevel: 1,
    description:
      "Vhalen Nostrolo in Southern Karana takes two song sheets, obtained from the hermit and from Cordelia Minster, and teaches Jaxan's Jig o' Vigor in exchange, plus 1 silver.",
    steps: [
      "Obtain two song sheets from the hermit and Cordelia Minster",
      "Turn them in to Vhalen Nostrolo in Southern Karana",
    ],
    wiki_title: "Winds of Karana",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Knights of Truth");
  addFactionReward(questId, "League of Antonican Bards");
  addFactionReward(questId, "Mayong Mistmoore");
  addFactionReward(questId, "Ring of Scale");
  addEdge(questId, "spell:jaxan-s-jig-o-vigor", "rewards");
}

// ---------------------------------------------------------------------
// Wino
// ---------------------------------------------------------------------
{
  const zoneId = "zone:greater-faydark";
  const giverId = "npc:greater-faydark:a-drunkard";
  addGiver(giverId, "A Drunkard", zoneId);

  const questId = "quest:wino";
  addNode({
    id: questId,
    label: "Wino",
    type: "quest",
    minLevel: 1,
    description:
      "A drunkard in Kelethin (Greater Faydark) accepts an Elven Wine, purchasable from most any barkeep in Kelethin, in exchange for no reward -- an alternate path to discover the Bandit Sisters quest.",
    steps: [
      "Purchase an Elven Wine from a Kelethin barkeep",
      "Hand it to a drunkard in Kelethin",
    ],
    wiki_title: "Wino",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Wislen Mamluk's Catfish
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kerra-island";
  const giverId = "npc:kerra-island:wislen-mamluk";
  addGiver(giverId, "Wislen Mamluk", zoneId);

  const questId = "quest:wislen-mamluks-catfish";
  addNode({
    id: questId,
    label: "Wislen Mamluk's Catfish",
    type: "quest",
    minLevel: 1,
    description:
      "Wislen Mamluk on Kerra Island trades a Kerra Catfish for the Kerran Fishing Pole.",
    steps: [
      "Catch a Kerra Catfish",
      "Turn it in to Wislen Mamluk on Kerra Island",
    ],
    wiki_title: "Wislen Mamluk's Catfish",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Kerra Isle");

  const poleId = "item:kerran-fishing-pole";
  addNode({
    id: poleId,
    label: "Kerran Fishing Pole",
    type: "item",
    noTrade: true,
    source: "Wislen Mamluk's Catfish reward (Wislen Mamluk, Kerra Island)",
  });
  addEdge(questId, poleId, "rewards");
}

// ---------------------------------------------------------------------
// Wizard's First Assignment
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin-palace";
  const giverId = "npc:erudin-palace:raskena-djor";
  addGiver(giverId, "Raskena Djor", zoneId);

  const questId = "quest:wizards-first-assignment";
  addNode({
    id: questId,
    label: "Wizard's First Assignment",
    type: "quest",
    classes: ["wizard"],
    minLevel: 1,
    description:
      "Raskena Djor in Erudin Palace takes two fire beetle legs and two fire beetle eyes and teaches a random low-level wizard spell in return.",
    steps: [
      "Collect two fire beetle legs and two fire beetle eyes",
      "Turn them in to Raskena Djor in Erudin Palace",
    ],
    wiki_title: "Wizard's First Assignment",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const spellPool = ["spell:frost-bolt", "spell:minor-shielding", "spell:sphere-of-light"];
  for (const spellId of spellPool) {
    addEdge(questId, spellId, "rewards", { randomGroup: "wizards-first-assignment-drop" });
  }
}

// ---------------------------------------------------------------------
// Wolfskin Gloves Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kithicor-forest";
  const giverId = "npc:kithicor-forest:ged-twigborn";
  addGiver(giverId, "Ged Twigborn", zoneId);

  const questId = "quest:wolfskin-gloves-quest";
  addNode({
    id: questId,
    label: "Wolfskin Gloves Quest",
    type: "quest",
    minLevel: 1,
    description:
      "Ged Twigborn in Kithicor Forest trades 13 gold and a high quality wolf pelt for a pair of Wolfskin Gloves.",
    steps: [
      "Collect 13 gold and a high quality wolf pelt",
      "Turn them in to Ged Twigborn in Kithicor Forest",
    ],
    wiki_title: "Wolfskin Gloves Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const glovesId = "item:wolfskin-gloves";
  addNode({
    id: glovesId,
    label: "Wolfskin Gloves",
    type: "item",
    classes: [
      "bard", "beastlord", "berserker", "cleric", "druid", "monk",
      "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior",
    ],
    slots: ["Hands"],
    ac: 4,
    source: "Wolfskin Gloves Quest reward (Ged Twigborn, Kithicor Forest)",
  });
  addEdge(questId, glovesId, "rewards");
}

// ---------------------------------------------------------------------
// Wooly Fungus Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:halas";
  const giverId = "npc:halas:waltor-felligan";
  addGiver(giverId, "Waltor Felligan", zoneId);

  const questId = "quest:wooly-fungus-quest";
  addNode({
    id: questId,
    label: "Wooly Fungus Quest",
    type: "quest",
    minLevel: 1,
    description:
      "Waltor Felligan in Halas takes a Jar of Fungus, made by combining 8 Wooly Fungus in an Empty Jar, and teaches a random low-level spell in return.",
    steps: [
      "Combine 8 Wooly Fungus in an Empty Jar to make a Jar of Fungus",
      "Turn it in to Waltor Felligan in Halas",
    ],
    wiki_title: "Wooly Fungus Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Shamen of Justice");
  addFactionReward(questId, "Merchants of Halas");
  addFactionReward(questId, "Circle of Unseen Hands");
  addFactionReward(questId, "Coalition of Tradefolk Underground");
  addFactionReward(questId, "Hall of the Ebon Mask");

  const spellPool = [
    "spell:cure-poison", "spell:drowsy", "spell:endure-fire", "spell:feet-like-cat",
    "spell:fleeting-fury", "spell:frost-rift", "spell:gate", "spell:sicken",
  ];
  for (const spellId of spellPool) {
    addEdge(questId, spellId, "rewards", { randomGroup: "wooly-fungus-quest-drop" });
  }
}

// ---------------------------------------------------------------------
// Words of Darkness Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:temple-of-solusek-ro";
  const giverId = "npc:temple-of-solusek-ro:vurgo";
  addGiver(giverId, "Vurgo", zoneId);

  const questId = "quest:words-of-darkness-quest";
  addNode({
    id: questId,
    label: "Words of Darkness Quest",
    type: "quest",
    classes: ["necromancer"],
    minLevel: 1,
    description:
      "Vurgo in the Temple of Solusek Ro takes a Shadowed Book, Book of Darkness, and Book of Frost plus 300 gold, then a note he provides, in exchange for the Words of Darkness.",
    steps: [
      "Collect a Shadowed Book, Book of Darkness, Book of Frost, and 300 gold",
      "Turn them in to Vurgo in the Temple of Solusek Ro",
      "Return the note Vurgo provides",
    ],
    wiki_title: "Words of Darkness Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Temple Of Sol Ro");
  addFactionReward(questId, "Shadowed Men");

  const weaponId = "item:words-of-darkness";
  addNode({
    id: weaponId,
    label: "Words of Darkness",
    type: "item",
    classes: ["necromancer"],
    slots: ["Primary", "Secondary"],
    mana: 45,
    effect: "Allure of Death (instant cast) at Level 20",
    magic: true,
    lore: true,
    noTrade: true,
    weight: 0.4,
    size: "Small",
    source: "Words of Darkness Quest reward (Vurgo, Temple of Solusek Ro)",
  });
  addEdge(questId, weaponId, "rewards");
}

// ---------------------------------------------------------------------
// Xelha's Cyclops Eye
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-freeport";
  const giverId = "npc:east-freeport:xelha-nevagon";
  addGiver(giverId, "Xelha Nevagon", zoneId);

  const questId = "quest:xelhas-cyclops-eye";
  addNode({
    id: questId,
    label: "Xelha's Cyclops Eye",
    type: "quest",
    classes: ["necromancer"],
    minLevel: 1,
    description:
      "Xelha Nevagon in East Freeport takes a cyclops eye and teaches a random necromancer spell in return, plus 7 gold 12 silver.",
    steps: [
      "Collect a cyclops eye",
      "Turn it in to Xelha Nevagon in East Freeport",
    ],
    wiki_title: "Xelha's Cyclops Eye",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Dismal Rage");
  addFactionReward(questId, "Opal Dark Briar");
  addFactionReward(questId, "Knights of Truth");

  const spellPool = [
    "spell:beguile-undead", "spell:call-of-bones", "spell:invoke-shadow",
    "spell:greater-shielding", "spell:resist-disease", "spell:venom-of-the-snake",
  ];
  for (const spellId of spellPool) {
    addEdge(questId, spellId, "rewards", { randomGroup: "xelhas-cyclops-eye-drop" });
  }
}

// ---------------------------------------------------------------------
// Wolf Hide Armor (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:qeynos-hills";
  const giverId = "npc:qeynos-hills:baobob-miller";
  addGiver(giverId, "Baobob Miller", zoneId);

  const groupId = "quest_group:wolf-hide-armor";
  addNode({
    id: groupId,
    label: "Wolf Hide Armor",
    type: "quest_group",
    description:
      "Baobob Miller in Qeynos Hills trades a wolf skin of the matching quality plus coin for a wolf-hide armor piece. Three independent sub-quests, no ordering between them.",
    wiki_title: "Wolf Hide Armor",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const pieces = [
    { label: "Belt", skin: "Low Quality Wolf Skin", gold: 5, reward: "Wolf-hide Belt", slots: ["Waist"], ac: 3 },
    { label: "Boots", skin: "Medium Quality Wolf Skin", gold: 15, reward: "Wolf-hide Boots", slots: ["Feet"], ac: 4 },
    { label: "Cape", skin: "High Quality Wolf Skin", gold: 21, reward: "Wolf-hide Cape", slots: ["Back"], ac: 5 },
  ] as const;

  for (const piece of pieces) {
    const questId = `quest:wolf-hide-armor-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `Wolf Hide Armor: ${piece.label}`,
      type: "quest",
      description: `Turn in a ${piece.skin} plus ${piece.gold} gold to Baobob Miller in Qeynos Hills for the ${piece.reward}.`,
      steps: [`Gather a ${piece.skin} and ${piece.gold} gold`, "Turn them in to Baobob Miller in Qeynos Hills"],
      wiki_title: "Wolf Hide Armor",
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
      slots: piece.slots,
      ac: piece.ac,
      source: `Wolf Hide Armor: ${piece.label} reward (Baobob Miller, Qeynos Hills)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

save();

console.log(
  "Migration 097 complete: added 15 standalone quests from GitHub issue #26's checklist (Weapons Delivery through Xelha's Cyclops Eye); modeled Wolf Hide Armor as a quest_group (3 sub-quests); deferred Wisdom - The Long Battle and Wisdom - The Short Battle into the Dozekar Tear Quests cluster entry, and Wizard Epic Quest as a new Questlines entry."
);
