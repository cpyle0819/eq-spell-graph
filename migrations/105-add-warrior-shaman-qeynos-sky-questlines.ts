/**
 * Migration 105: first batch of GitHub issue #26's "Questlines" section --
 * real ordered `quest --requires--> quest` chains (decisions/quest-prerequisite-requires-edge.md),
 * not unordered quest_groups. Researched against eqlwiki.com per
 * decisions/eqlwiki-quest-research-method.md.
 *
 * Covers: Warrior Epic Quest, Warrior Pike Quests, Shaman Skull Quests,
 * Qeynos Badge Quests, Plane of Sky Keys.
 *
 * Warrior Epic Quest's four gear branches (Jeweled/Finely Crafted Dragon
 * Head Hilt, Ancient Sword Blade+Ancient Blade, Red Scabbard) are
 * independent of each other but all required before the final assembly --
 * modeled as one `requires` edge per branch on the final quest, not a
 * quest_group (there IS a real order: branches before assembly).
 *
 * Warrior Pike Quests: tiers #6-#8 are documented on eqlwiki.com itself as
 * never finished/implemented pre-Luclin -- only tiers #0-#5 modeled here.
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, addFactionReward, addGiver, save } = loadGraph(import.meta.dir);

// ---------------------------------------------------------------------
// Warrior Epic Quest
// ---------------------------------------------------------------------
{
  const eastFreeportId = "zone:east-freeport";
  const oceanId = "zone:ocean-of-tears";
  const chardokId = "zone:chardok";

  const wendenId = "npc:east-freeport:wenden-blackhammer";
  addGiver(wendenId, "Wenden Blackhammer", eastFreeportId);
  const denkenId = "npc:ocean-of-tears:denken-strongpick";
  addGiver(denkenId, "Denken Strongpick", oceanId);
  const queenId = "npc:chardok:queen-velazul-dizok";
  addGiver(queenId, "Queen Velazul Di'zok", chardokId);
  const kargekId = "npc:east-freeport:kargek-redblade";
  addGiver(kargekId, "Kargek Redblade", eastFreeportId);
  const oknogginId = "npc:east-freeport:oknoggin-stonesmacker";
  addGiver(oknogginId, "Oknoggin Stonesmacker", eastFreeportId);
  const tenalId = "npc:east-freeport:tenal-redblade";
  addGiver(tenalId, "Tenal Redblade", eastFreeportId);

  const jeweledId = "quest:jeweled-dragon-head-hilt-quest";
  addNode({
    id: jeweledId,
    label: "Jeweled Dragon Head Hilt Quest",
    type: "quest",
    classes: ["warrior"],
    description:
      "Trade an Unjeweled Dragon Head Hilt, a Diamond, a Jacinth, and a Black Sapphire to Wenden Blackhammer in East Freeport for a Jeweled Dragon Head Hilt, one of the Warrior Epic Quest's four component branches.",
    steps: ["Gather Unjeweled Dragon Head Hilt, Diamond, Jacinth, Black Sapphire", "Turn them in to Wenden Blackhammer in East Freeport"],
    wiki_title: "Warrior Epic Quest",
  });
  addEdge(wendenId, jeweledId, "starts");
  addEdge(jeweledId, eastFreeportId, "starts_in");

  const finelyId = "quest:finely-crafted-dragon-head-hilt-quest";
  addNode({
    id: finelyId,
    label: "Finely Crafted Dragon Head Hilt Quest",
    type: "quest",
    classes: ["warrior"],
    description:
      "Trade a Severely Damaged Dragon Head Hilt, a Ball of Everliving Golem, and Rejesiam Ore to Wenden Blackhammer in East Freeport for a Finely Crafted Dragon Head Hilt, one of the Warrior Epic Quest's four component branches.",
    steps: ["Gather Severely Damaged Dragon Head Hilt, Ball of Everliving Golem, Rejesiam Ore", "Turn them in to Wenden Blackhammer in East Freeport"],
    wiki_title: "Warrior Epic Quest",
  });
  addEdge(wendenId, finelyId, "starts");
  addEdge(finelyId, eastFreeportId, "starts_in");

  const ancientId = "quest:ancient-sword-blade-quest";
  addNode({
    id: ancientId,
    label: "Ancient Sword Blade Quest",
    type: "quest",
    classes: ["warrior"],
    description:
      "Trade a Keg of Vox Tail Ale, a Block of Permafrost, and two Rebreathers to Denken Strongpick in Ocean of Tears for an Ancient Sword Blade, then obtain an Ancient Blade from Queen Velazul Di'zok in Chardok -- one of the Warrior Epic Quest's four component branches.",
    steps: [
      "Gather Keg of Vox Tail Ale, Block of Permafrost, two Rebreathers",
      "Turn them in to Denken Strongpick in Ocean of Tears for an Ancient Sword Blade",
      "Obtain an Ancient Blade from Queen Velazul Di'zok in Chardok",
    ],
    wiki_title: "Warrior Epic Quest",
  });
  addEdge(denkenId, ancientId, "starts");
  addEdge(ancientId, oceanId, "starts_in");
  addEdge(ancientId, chardokId, "located_in");
  addEdge(queenId, ancientId, "starts");

  const scabbardId = "quest:red-scabbard-quest";
  addNode({
    id: scabbardId,
    label: "Red Scabbard Quest",
    type: "quest",
    classes: ["warrior"],
    description:
      "Turn in a Heart of Frost, Red Dragon Scales, Green Dragon Scales, Hand of the Maestro, and a Spiroc Wingblade to Kargek Redblade, Oknoggin Stonesmacker, and Tenal Redblade in East Freeport for a Red Scabbard -- one of the Warrior Epic Quest's four component branches.",
    steps: ["Gather Heart of Frost, Red Dragon Scales, Green Dragon Scales, Hand of the Maestro, Spiroc Wingblade", "Turn them in to Kargek Redblade / Oknoggin Stonesmacker / Tenal Redblade in East Freeport"],
    wiki_title: "Warrior Epic Quest",
  });
  addEdge(kargekId, scabbardId, "starts");
  addEdge(scabbardId, eastFreeportId, "starts_in");

  const epicId = "quest:warrior-epic-quest";
  addNode({
    id: epicId,
    label: "Warrior Epic Quest",
    type: "quest",
    classes: ["warrior"],
    minLevel: 50,
    description:
      "Combine the Jeweled Dragon Head Hilt, Finely Crafted Dragon Head Hilt, Ancient Sword Blade + Ancient Blade, and Red Scabbard into the Red Scabbard for the final Jagged Blade of War, which splits into Blade of Strategy and Blade of Tactics.",
    steps: ["Complete all four component branches", "Combine them in the Red Scabbard for the Jagged Blade of War"],
    wiki_title: "Warrior Epic Quest",
  });
  addEdge(epicId, jeweledId, "requires");
  addEdge(epicId, finelyId, "requires");
  addEdge(epicId, ancientId, "requires");
  addEdge(epicId, scabbardId, "requires");

  const jaggedId = "item:jagged-blade-of-war";
  addNode({
    id: jaggedId,
    label: "Jagged Blade of War",
    type: "item",
    slots: ["Primary"],
    classes: ["warrior"],
    skill: "2H Slashing",
    damage: 36,
    delay: 41,
    stats: { str: 20, dex: 15, sta: 15, hp: 100 },
    saves: { all: 10 },
    magic: true,
    lore: true,
    noDrop: true,
    weight: 6.0,
    size: "Medium",
    effect: "Rage of Zek (instant cast) at Level 50",
    source: "Warrior Epic Quest reward",
  });
  addEdge(epicId, jaggedId, "rewards");

  const tacticsId = "item:blade-of-tactics";
  addNode({
    id: tacticsId,
    label: "Blade of Tactics",
    type: "item",
    slots: ["Primary", "Secondary"],
    classes: ["warrior"],
    skill: "1H Slashing",
    damage: 14,
    delay: 24,
    stats: { str: 10, dex: 15, hp: 50 },
    saves: { all: 5 },
    magic: true,
    lore: true,
    noDrop: true,
    weight: 2.5,
    size: "Small",
    effect: "Rage of Tallon (worn)",
    source: "Warrior Epic Quest reward (split from Jagged Blade of War)",
  });
  addEdge(epicId, tacticsId, "rewards");

  const strategyId = "item:blade-of-strategy";
  addNode({
    id: strategyId,
    label: "Blade of Strategy",
    type: "item",
    slots: ["Primary", "Secondary"],
    classes: ["warrior"],
    skill: "1H Slashing",
    damage: 14,
    delay: 24,
    stats: { str: 10, sta: 15, hp: 50 },
    saves: { all: 5 },
    magic: true,
    lore: true,
    noDrop: true,
    weight: 2.5,
    size: "Small",
    effect: "Rage of Vallon (instant cast) at Level 50",
    source: "Warrior Epic Quest reward (split from Jagged Blade of War)",
  });
  addEdge(epicId, strategyId, "rewards");
}

// ---------------------------------------------------------------------
// Warrior Pike Quests -- tiers #6-#8 never finished/implemented pre-Luclin
// per eqlwiki.com itself, so only #0-#5 modeled.
// ---------------------------------------------------------------------
{
  const cabilisId = "zone:east-cabilis";
  const vyganId = "npc:east-cabilis:drill-master-vygan";
  addGiver(vyganId, "Drill Master Vygan", cabilisId);
  const kygId = "npc:east-cabilis:drill-master-kyg";
  addGiver(kygId, "Drill Master Kyg", cabilisId);
  const eatorId = "npc:east-cabilis:war-baron-eator";
  addGiver(eatorId, "War Baron Eator", cabilisId);

  const partisansId = "quest:partisans-pike-quest";
  addNode({
    id: partisansId,
    label: "Partisan's Pike Quest",
    type: "quest",
    classes: ["warrior"],
    description: "Turn in a note to Drill Master Vygan in East Cabilis for a Partisan's Pike, the first tier of the Warrior Pike Quests chain.",
    steps: ["Turn in a note to Drill Master Vygan in East Cabilis"],
    wiki_title: "Warrior Pike Quests",
  });
  addEdge(vyganId, partisansId, "starts");
  addEdge(partisansId, cabilisId, "starts_in");

  const militiasId = "quest:militias-pike-quest";
  addNode({
    id: militiasId,
    label: "Militia's Pike Quest",
    type: "quest",
    classes: ["warrior"],
    description: "Turn in a Partisan's Pike, an Iksar Head, and a Froglok Escort Fife to Drill Master Vygan in East Cabilis for a Militia's Pike.",
    steps: ["Gather Partisan's Pike, Iksar Head, Froglok Escort Fife", "Turn them in to Drill Master Vygan in East Cabilis"],
    wiki_title: "Warrior Pike Quests",
  });
  addEdge(vyganId, militiasId, "starts");
  addEdge(militiasId, cabilisId, "starts_in");
  addEdge(militiasId, partisansId, "requires");

  const footmansId = "quest:footmans-pike-quest";
  addNode({
    id: footmansId,
    label: "Footman's Pike Quest",
    type: "quest",
    classes: ["warrior"],
    description: "Turn in a Full Footman's Pack and a Militia's Pike to Drill Master Kyg in East Cabilis for a Footman's Pike.",
    steps: ["Gather Full Footman's Pack", "Turn it in with the Militia's Pike to Drill Master Kyg in East Cabilis"],
    wiki_title: "Warrior Pike Quests",
  });
  addEdge(kygId, footmansId, "starts");
  addEdge(footmansId, cabilisId, "starts_in");
  addEdge(footmansId, militiasId, "requires");

  const soldiersId = "quest:soldiers-pike-quest";
  addNode({
    id: soldiersId,
    label: "Soldier's Pike Quest",
    type: "quest",
    classes: ["warrior"],
    description: "Turn in an Emerald, a Sapphire, a Ruby, and a Footman's Pike to War Baron Eator in East Cabilis for a Soldier's Pike.",
    steps: ["Gather Emerald, Sapphire, Ruby", "Turn them in with the Footman's Pike to War Baron Eator in East Cabilis"],
    wiki_title: "Warrior Pike Quests",
  });
  addEdge(eatorId, soldiersId, "starts");
  addEdge(soldiersId, cabilisId, "starts_in");
  addEdge(soldiersId, footmansId, "requires");

  const troopersId = "quest:troopers-pike-quest";
  addNode({
    id: troopersId,
    label: "Trooper's Pike Quest",
    type: "quest",
    classes: ["warrior"],
    description: "Turn in three Froglok Heads and a Soldier's Pike to Drill Master Kyg in East Cabilis for a Trooper's Pike.",
    steps: ["Gather three Froglok Heads", "Turn them in with the Soldier's Pike to Drill Master Kyg in East Cabilis"],
    wiki_title: "Warrior Pike Quests",
  });
  addEdge(kygId, troopersId, "starts");
  addEdge(troopersId, cabilisId, "starts_in");
  addEdge(troopersId, soldiersId, "requires");

  const legionnairesId = "quest:legionnaires-mancatcher-quest";
  addNode({
    id: legionnairesId,
    label: "Legionnaire's Mancatcher Quest",
    type: "quest",
    classes: ["warrior"],
    description: "Turn in three recommendations and a Trooper's Pike to War Baron Eator in East Cabilis for a Legionnaire's Mancatcher, the final tier modeled from the Warrior Pike Quests chain.",
    steps: ["Gather three recommendations", "Turn them in with the Trooper's Pike to War Baron Eator in East Cabilis"],
    wiki_title: "Warrior Pike Quests",
  });
  addEdge(eatorId, legionnairesId, "starts");
  addEdge(legionnairesId, cabilisId, "starts_in");
  addEdge(legionnairesId, troopersId, "requires");
}

// ---------------------------------------------------------------------
// Shaman Skull Quests
// ---------------------------------------------------------------------
{
  const cabilisId = "zone:east-cabilis";
  const boneId = "zone:field-of-bone";
  const swampId = "zone:swamp-of-no-hope";

  const oxynId = "npc:east-cabilis:hierophant-oxyn";
  addGiver(oxynId, "Hierophant Oxyn", cabilisId);
  const zandId = "npc:east-cabilis:hierophant-zand";
  addGiver(zandId, "Hierophant Zand", cabilisId);
  const quargId = "npc:field-of-bone:crusader-quarg";
  addGiver(quargId, "Crusader Quarg", boneId);
  const dovanId = "npc:swamp-of-no-hope:mystic-dovan";
  addGiver(dovanId, "Mystic Dovan", swampId);

  const clairvoyantId = "quest:shaman-skull-clairvoyant-quest";
  addNode({
    id: clairvoyantId,
    label: "Shaman Skull Quests: Clairvoyant",
    type: "quest",
    classes: ["shaman"],
    description: "Turn in three skulls (Logrin, Morgl, Waz) and an Iron Cudgel of the Petitioner to Hierophant Oxyn in East Cabilis for an Iron Cudgel of the Clairvoyant.",
    steps: ["Gather three skulls (Logrin, Morgl, Waz) and Iron Cudgel of the Petitioner", "Turn them in to Hierophant Oxyn in East Cabilis"],
    wiki_title: "Shaman Skull Quests",
  });
  addEdge(oxynId, clairvoyantId, "starts");
  addEdge(clairvoyantId, cabilisId, "starts_in");

  const seerId = "quest:shaman-skull-seer-quest";
  addNode({
    id: seerId,
    label: "Shaman Skull Quests: Seer",
    type: "quest",
    classes: ["shaman"],
    description: "Turn in Skull with I, Skull with II, and an Iron Cudgel of the Clairvoyant to Hierophant Oxyn in East Cabilis for an Iron Cudgel of the Seer.",
    steps: ["Gather Skull with I, Skull with II", "Turn them in with the Iron Cudgel of the Clairvoyant to Hierophant Oxyn in East Cabilis"],
    wiki_title: "Shaman Skull Quests",
  });
  addEdge(oxynId, seerId, "starts");
  addEdge(seerId, cabilisId, "starts_in");
  addEdge(seerId, clairvoyantId, "requires");

  const mysticId = "quest:shaman-skull-mystic-quest";
  addNode({
    id: mysticId,
    label: "Shaman Skull Quests: Mystic",
    type: "quest",
    classes: ["shaman"],
    description: "Turn in a Froglok Hex Doll to Hierophant Zand in East Cabilis, then a Full C.O.B.B. Chest and an Iron Cudgel of the Seer to Crusader Quarg in Field of Bone for an Iron Cudgel of the Mystic.",
    steps: [
      "Turn in a Froglok Hex Doll to Hierophant Zand in East Cabilis",
      "Turn in a Full C.O.B.B. Chest and the Iron Cudgel of the Seer to Crusader Quarg in Field of Bone",
    ],
    wiki_title: "Shaman Skull Quests",
  });
  addEdge(zandId, mysticId, "starts");
  addEdge(quargId, mysticId, "starts");
  addEdge(mysticId, cabilisId, "starts_in");
  addEdge(mysticId, boneId, "located_in");
  addEdge(mysticId, seerId, "requires");

  const prophetId = "quest:shaman-skull-prophet-quest";
  addNode({
    id: prophetId,
    label: "Shaman Skull Quests: Prophet",
    type: "quest",
    classes: ["shaman"],
    description: "Turn in a Full C.O.R.N. Chest and an Iron Cudgel of the Mystic to Mystic Dovan in Swamp of No Hope for an Iron Cudgel of the Prophet.",
    steps: ["Gather Full C.O.R.N. Chest", "Turn it in with the Iron Cudgel of the Mystic to Mystic Dovan in Swamp of No Hope"],
    wiki_title: "Shaman Skull Quests",
  });
  addEdge(dovanId, prophetId, "starts");
  addEdge(prophetId, swampId, "starts_in");
  addEdge(prophetId, mysticId, "requires");

  const channelerId = "quest:shaman-skull-channeler-quest";
  addNode({
    id: channelerId,
    label: "Shaman Skull Quests: Channeler",
    type: "quest",
    classes: ["shaman"],
    description: "Turn in an Iksar Skull Helm, an Iksar Skull (Dai Nozok), and an Iron Cudgel of the Prophet to Hierophant Zand in East Cabilis for the final Iron Cudgel of the Channeler.",
    steps: ["Gather Iksar Skull Helm, Iksar Skull (Dai Nozok)", "Turn them in with the Iron Cudgel of the Prophet to Hierophant Zand in East Cabilis"],
    wiki_title: "Shaman Skull Quests",
  });
  addEdge(zandId, channelerId, "starts");
  addEdge(channelerId, cabilisId, "starts_in");
  addEdge(channelerId, prophetId, "requires");

  const cudgelId = "item:iron-cudgel-of-the-channeler";
  addNode({
    id: cudgelId,
    label: "Iron Cudgel of the Channeler",
    type: "item",
    slots: ["Primary"],
    classes: ["shaman"],
    damage: 6,
    stats: { wis: 5 },
    saves: { disease: 3, poison: 3 },
    source: "Shaman Skull Quests: Channeler reward (Hierophant Zand, East Cabilis)",
  });
  addEdge(channelerId, cudgelId, "rewards");
}

// ---------------------------------------------------------------------
// Qeynos Badge Quests
// ---------------------------------------------------------------------
{
  const northQeynosId = "zone:north-qeynos";
  const vegalysId = "npc:north-qeynos:vegalys-keldrane";
  addGiver(vegalysId, "Vegalys Keldrane", northQeynosId);
  const velarteId = "npc:north-qeynos:velarte-selire";
  addGiver(velarteId, "Velarte Selire", northQeynosId);

  const investigatorsId = "quest:investigators-badge-quest";
  addNode({
    id: investigatorsId,
    label: "Investigator's Badge Quest",
    type: "quest",
    minLevel: 24,
    description:
      "Turn in a Cracked Corrupt Guard Helm, Riley's Confession, Willie's Confession, and the Head of Donally Stultz to Vegalys Keldrane in North Qeynos for an Investigator's Badge (AC 1, +1 all stats, +5 HP/Mana).",
    steps: ["Gather Cracked Corrupt Guard Helm, Riley's Confession, Willie's Confession, Head of Donally Stultz", "Turn them in to Vegalys Keldrane in North Qeynos"],
    wiki_title: "Qeynos Badge Quests",
  });
  addEdge(vegalysId, investigatorsId, "starts");
  addEdge(investigatorsId, northQeynosId, "starts_in");

  const interrogatorsId = "quest:interrogators-badge-quest";
  addNode({
    id: interrogatorsId,
    label: "Interrogator's Badge Quest",
    type: "quest",
    minLevel: 30,
    description:
      "Turn in an Investigator's Badge, an unsigned Confession Document, Theodore's Confession, the Head of Morley Murrain, and the Head of Markus Cachexia to Vegalys Keldrane in North Qeynos for an Interrogator's Badge (AC 2, +2 all stats, +10 HP/Mana).",
    steps: ["Gather unsigned Confession Document, Theodore's Confession, Head of Morley Murrain, Head of Markus Cachexia", "Turn them in with the Investigator's Badge to Vegalys Keldrane in North Qeynos"],
    wiki_title: "Qeynos Badge Quests",
  });
  addEdge(vegalysId, interrogatorsId, "starts");
  addEdge(interrogatorsId, northQeynosId, "starts_in");
  addEdge(interrogatorsId, investigatorsId, "requires");

  const researchersId = "quest:researchers-badge-quest";
  addNode({
    id: researchersId,
    label: "Researcher's Badge Quest",
    type: "quest",
    minLevel: 40,
    description:
      "Retrieve three Enchanted Rat Jars, cure the rats for three Empty Enchanted Jars and a Research Briefing, then turn all of it in with an Interrogator's Badge to Velarte Selire at the Temple of Life in North Qeynos for a Researcher's Badge (AC 4, +3 all stats, +15 HP/Mana).",
    steps: ["Retrieve three Enchanted Rat Jars and cure the rats for three Empty Enchanted Jars and a Research Briefing", "Turn them in with the Interrogator's Badge to Velarte Selire at the Temple of Life, North Qeynos"],
    wiki_title: "Qeynos Badge Quests",
  });
  addEdge(velarteId, researchersId, "starts");
  addEdge(researchersId, northQeynosId, "starts_in");
  addEdge(researchersId, interrogatorsId, "requires");

  const honorId = "quest:qeynos-badge-of-honor-quest";
  addNode({
    id: honorId,
    label: "Qeynos Badge of Honor Quest",
    type: "quest",
    minLevel: 40,
    description:
      "Turn in a Researcher's Badge, a Seal of Vegalys, and the Head of Azibelle Spavin to Vegalys Keldrane in North Qeynos for the final Qeynos Badge of Honor (AC 5, +4 all stats, +25 HP/Mana, See Invisible effect). Improves standing with Antonius Bayle, Guards of Qeynos, and Merchants of Qeynos; worsens standing with Ring of Scale and Kane Bayle.",
    steps: ["Gather Seal of Vegalys, Head of Azibelle Spavin", "Turn them in with the Researcher's Badge to Vegalys Keldrane in North Qeynos"],
    wiki_title: "Qeynos Badge Quests",
  });
  addEdge(vegalysId, honorId, "starts");
  addEdge(honorId, northQeynosId, "starts_in");
  addEdge(honorId, researchersId, "requires");
  addFactionReward(honorId, "Antonius Bayle");
  addFactionReward(honorId, "Guards of Qeynos");
  addFactionReward(honorId, "Merchants of Qeynos");

  addNode({ id: "item:investigators-badge", label: "Investigator's Badge", type: "item", slots: ["Chest"], stats: { ac: 1, str: 1, sta: 1, agi: 1, dex: 1, wis: 1, int: 1, cha: 1, hp: 5, mana: 5 }, source: "Investigator's Badge Quest reward" });
  addEdge(investigatorsId, "item:investigators-badge", "rewards");
  addNode({ id: "item:interrogators-badge", label: "Interrogator's Badge", type: "item", slots: ["Chest"], stats: { ac: 2, str: 2, sta: 2, agi: 2, dex: 2, wis: 2, int: 2, cha: 2, hp: 10, mana: 10 }, source: "Interrogator's Badge Quest reward" });
  addEdge(interrogatorsId, "item:interrogators-badge", "rewards");
  addNode({ id: "item:researchers-badge", label: "Researcher's Badge", type: "item", slots: ["Chest"], stats: { ac: 4, str: 3, sta: 3, agi: 3, dex: 3, wis: 3, int: 3, cha: 3, hp: 15, mana: 15 }, source: "Researcher's Badge Quest reward" });
  addEdge(researchersId, "item:researchers-badge", "rewards");
  addNode({ id: "item:qeynos-badge-of-honor", label: "Qeynos Badge of Honor", type: "item", slots: ["Chest"], stats: { ac: 5, str: 4, sta: 4, agi: 4, dex: 4, wis: 4, int: 4, cha: 4, hp: 25, mana: 25 }, effect: "See Invisible (worn)", source: "Qeynos Badge of Honor Quest reward" });
  addEdge(honorId, "item:qeynos-badge-of-honor", "rewards");
}

// ---------------------------------------------------------------------
// Plane of Sky Keys -- the one real questline explicitly flagged in
// decisions/quest-prerequisite-requires-edge.md (Sirran the Lunatic gates
// each island behind a boss-kill-then-key-turn-in on the previous one).
// ---------------------------------------------------------------------
{
  const skyId = "zone:plane-of-sky";
  const sirranId = "npc:plane-of-sky:sirran-the-lunatic";
  addGiver(sirranId, "Sirran the Lunatic", skyId);

  const stages: Array<{ id: string; label: string; boss: string; key: string }> = [
    { id: "quest:plane-of-sky-key-thunder-spirit-princess", label: "Plane of Sky Keys: Thunder Spirit Princess", boss: "Thunder Spirit Princess", key: "Key of Swords" },
    { id: "quest:plane-of-sky-key-protector-of-sky", label: "Plane of Sky Keys: Protector of Sky", boss: "Protector of Sky", key: "Key of Misfortune" },
    { id: "quest:plane-of-sky-key-gorgalosk", label: "Plane of Sky Keys: Gorgalosk", boss: "Gorgalosk", key: "Key of Beasts" },
    { id: "quest:plane-of-sky-key-keeper-of-souls", label: "Plane of Sky Keys: Keeper of Souls", boss: "Keeper of Souls", key: "Avian Key" },
    { id: "quest:plane-of-sky-key-spiroc-lord", label: "Plane of Sky Keys: The Spiroc Lord", boss: "The Spiroc Lord", key: "Key of the Swarm" },
    { id: "quest:plane-of-sky-key-bazzt-zzzt", label: "Plane of Sky Keys: Bazzt Zzzt", boss: "Bazzt Zzzt", key: "Key of Scale" },
    { id: "quest:plane-of-sky-key-sister-of-the-spire", label: "Plane of Sky Keys: Sister of the Spire", boss: "Sister of the Spire", key: "Veeshan's Key" },
  ];

  let previousId: string | null = null;
  for (const stage of stages) {
    addNode({
      id: stage.id,
      label: stage.label,
      type: "quest",
      description: `Defeat ${stage.boss} in the Plane of Sky and turn in the drop to Sirran the Lunatic for the ${stage.key}, which unlocks the next island.`,
      steps: [`Defeat ${stage.boss}`, `Turn in the drop to Sirran the Lunatic for the ${stage.key}`],
      wiki_title: "Plane of Sky Keys",
    });
    addEdge(sirranId, stage.id, "starts");
    addEdge(stage.id, skyId, "starts_in");
    if (previousId) addEdge(stage.id, previousId, "requires");
    previousId = stage.id;
  }
}

save();

console.log(
  "Migration 105 complete: modeled 5 GitHub issue #26 questline entries as requires-chains -- Warrior Epic Quest (4 branches + final assembly), Warrior Pike Quests (6 tiers), Shaman Skull Quests (5 ranks), Qeynos Badge Quests (4 badges), Plane of Sky Keys (7 islands)."
);
