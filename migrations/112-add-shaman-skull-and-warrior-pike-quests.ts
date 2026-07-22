/**
 * Migration 112: eighth and final batch of GitHub issue #26's "Questlines"
 * section. Researched against eqlwiki.com per
 * decisions/eqlwiki-quest-research-method.md.
 *
 * Covers: Shaman Skull Quests (requires-chain, 5 ranks, East Cabilis) and
 * Warrior Pike Quests (requires-chain, 6 tiers, East Cabilis).
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, addGiver, save } = loadGraph(import.meta.dir);

// ---------------------------------------------------------------------
// Shaman Skull Quests
// ---------------------------------------------------------------------
{
  const cabilisId = "zone:east-cabilis";
  const warskliksId = "zone:warsliks-woods";
  const boneId = "zone:field-of-bone";
  const illOmenId = "zone:lake-of-ill-omen";
  const kurnsId = "zone:kurns-tower";

  const oxynId = "npc:east-cabilis:hierophant-oxyn";
  addGiver(oxynId, "Hierophant Oxyn", cabilisId);

  const clairvoyantId = "quest:shaman-skull-clairvoyant";
  addNode({
    id: clairvoyantId, label: "Shaman Skull Quests: Clairvoyant", type: "quest", classes: ["shaman"],
    description: "Gather Logrin, Morgl, and Waz skulls from an iksar outcast and turn them in with the Iron Cudgel of the Petitioner to Hierophant Oxyn in East Cabilis for the Iron Cudgel of the Clairvoyant.",
    steps: ["Gather Logrin, Morgl, Waz skulls from an iksar outcast", "Turn in with Iron Cudgel of the Petitioner to Hierophant Oxyn, East Cabilis"], wiki_title: "Shaman Skull Quests",
  });
  addEdge(oxynId, clairvoyantId, "starts");
  addEdge(clairvoyantId, cabilisId, "starts_in");

  const seerId = "quest:shaman-skull-seer";
  addNode({
    id: seerId, label: "Shaman Skull Quests: Seer", type: "quest", classes: ["shaman"],
    description: "Collect a restored skull from a rogue shaman (Warslik's Woods/Field of Bone, combined with Mendglow Clay at a pottery wheel) and a skull from a stuffed barracuda in Lake of Ill Omen, then turn both in with the Iron Cudgel of the Clairvoyant to Hierophant Oxyn for the Iron Cudgel of the Seer.",
    steps: ["Gather restored skull from rogue shaman, Warslik's Woods/Field of Bone (pottery wheel combine with Mendglow Clay)", "Gather skull from stuffed barracuda, Lake of Ill Omen", "Turn in with Iron Cudgel of the Clairvoyant to Hierophant Oxyn"], wiki_title: "Shaman Skull Quests",
  });
  addEdge(oxynId, seerId, "starts");
  addEdge(seerId, cabilisId, "starts_in");
  addEdge(seerId, warskliksId, "located_in");
  addEdge(seerId, boneId, "located_in");
  addEdge(seerId, illOmenId, "located_in");
  addEdge(seerId, clairvoyantId, "requires");

  const mysticId = "quest:shaman-skull-mystic";
  addNode({
    id: mysticId, label: "Shaman Skull Quests: Mystic", type: "quest", classes: ["shaman"],
    description: "Obtain a Froglok Hex Doll from a goblin hextracer in Warslik's Woods, collect six skulls (one leader plus five caste members) from undead crusaders in Kurn's Tower, combine them in a chest, and turn them in with the Iron Cudgel of the Seer to Hierophant Oxyn for the Iron Cudgel of the Mystic.",
    steps: ["Obtain Froglok Hex Doll from goblin hextracer, Warslik's Woods", "Gather six skulls from undead crusaders, Kurn's Tower", "Combine in a chest", "Turn in with Iron Cudgel of the Seer to Hierophant Oxyn"], wiki_title: "Shaman Skull Quests",
  });
  addEdge(oxynId, mysticId, "starts");
  addEdge(mysticId, cabilisId, "starts_in");
  addEdge(mysticId, warskliksId, "located_in");
  addEdge(mysticId, kurnsId, "located_in");
  addEdge(mysticId, seerId, "requires");

  const prophetId = "quest:shaman-skull-prophet";
  addNode({
    id: prophetId, label: "Shaman Skull Quests: Prophet", type: "quest", classes: ["shaman"],
    description: "Gather six tiny glowing skulls from goblin bloodtracers at three ruin locations in Warslik's Woods, combine them, and turn them in with the Iron Cudgel of the Mystic to Hierophant Oxyn for the Iron Cudgel of the Prophet.",
    steps: ["Gather six tiny glowing skulls from goblin bloodtracers, three ruins in Warslik's Woods", "Combine skulls", "Turn in with Iron Cudgel of the Mystic to Hierophant Oxyn"], wiki_title: "Shaman Skull Quests",
  });
  addEdge(oxynId, prophetId, "starts");
  addEdge(prophetId, cabilisId, "starts_in");
  addEdge(prophetId, warskliksId, "located_in");
  addEdge(prophetId, mysticId, "requires");

  const channelerId = "quest:shaman-skull-channeler";
  addNode({
    id: channelerId, label: "Shaman Skull Quests: Channeler", type: "quest", classes: ["shaman"],
    description: "Collect two Di Nozok skulls -- one from Sarnak adherents in Lake of Ill Omen, another through a chain involving Froglok Ton Warriors and Overseer Dlubish -- then turn them in with the Iron Cudgel of the Prophet to Hierophant Oxyn for the final reward, Iron Cudgel of the Channeler.",
    steps: ["Gather Di Nozok skull from Sarnak adherents, Lake of Ill Omen", "Gather second Di Nozok skull via Froglok Ton Warriors and Overseer Dlubish", "Turn in with Iron Cudgel of the Prophet to Hierophant Oxyn"], wiki_title: "Shaman Skull Quests",
  });
  addEdge(oxynId, channelerId, "starts");
  addEdge(channelerId, cabilisId, "starts_in");
  addEdge(channelerId, illOmenId, "located_in");
  addEdge(channelerId, prophetId, "requires");

  const cudgelId = "item:iron-cudgel-of-the-channeler";
  addNode({
    id: cudgelId, label: "Iron Cudgel of the Channeler", type: "item", slots: ["Primary"], classes: ["shaman"],
    stats: { wis: 5 }, saves: { disease: 5, poison: 5 }, magic: true, lore: true, noDrop: true,
    source: "Shaman Skull Quests reward (Hierophant Oxyn, East Cabilis)",
  });
  addEdge(channelerId, cudgelId, "rewards");
}

// ---------------------------------------------------------------------
// Warrior Pike Quests
// ---------------------------------------------------------------------
{
  const cabilisId = "zone:east-cabilis";
  const noHopeId = "zone:swamp-of-no-hope";
  const kurnsId = "zone:kurns-tower";

  const vyganId = "npc:east-cabilis:drill-master-vygan";
  addGiver(vyganId, "Drill Master Vygan", cabilisId);
  const eatorId = "npc:east-cabilis:war-baron-eator";
  addGiver(eatorId, "War Baron Eator", cabilisId);
  const gruglId = "npc:east-cabilis:weaponsmith-grugl";
  addGiver(gruglId, "Weaponsmith Grugl", cabilisId);

  const partisansId = "quest:warrior-pike-0-partisans";
  addNode({
    id: partisansId, label: "Warrior Pike 0: Partisan's Pike", type: "quest", classes: ["warrior"],
    description: "Hand a note to Drill Master Vygan in East Cabilis for the Partisan's Pike.",
    steps: ["Hand note to Drill Master Vygan, East Cabilis"], wiki_title: "Warrior Pike Quests",
  });
  addEdge(vyganId, partisansId, "starts");
  addEdge(partisansId, cabilisId, "starts_in");

  const militiasId = "quest:warrior-pike-1-militias";
  addNode({
    id: militiasId, label: "Warrior Pike 1: Militia's Pike", type: "quest", classes: ["warrior"],
    description: "Gather a froglok escort's whistle and an Iksar traitor's head, and turn them in with the Partisan's Pike to Drill Master Vygan for the Militia's Pike.",
    steps: ["Gather froglok escort's whistle and Iksar traitor's head", "Turn in with Partisan's Pike to Drill Master Vygan"], wiki_title: "Warrior Pike Quests",
  });
  addEdge(vyganId, militiasId, "starts");
  addEdge(militiasId, cabilisId, "starts_in");
  addEdge(militiasId, partisansId, "requires");

  const footmansId = "quest:warrior-pike-2-footmans";
  addNode({
    id: footmansId, label: "Warrior Pike 2: Footman's Pike", type: "quest", classes: ["warrior"],
    description: "Gather four javelins (two from froglok bounders, two from goblin hunters), combine them in a pack, and turn it in with the Militia's Pike to Weaponsmith Grugl for the Footman's Pike.",
    steps: ["Gather two javelins from froglok bounders, two from goblin hunters", "Combine in a pack", "Turn in with Militia's Pike to Weaponsmith Grugl"], wiki_title: "Warrior Pike Quests",
  });
  addEdge(gruglId, footmansId, "starts");
  addEdge(footmansId, cabilisId, "starts_in");
  addEdge(footmansId, militiasId, "requires");

  const soldiersId = "quest:warrior-pike-3-soldiers";
  addNode({
    id: soldiersId, label: "Warrior Pike 3: Soldier's Pike", type: "quest", classes: ["warrior"],
    description: "Gather an emerald, sapphire, and ruby from skeletons in Kurn's Tower, and turn them in with the Footman's Pike to Weaponsmith Grugl for the Soldier's Pike.",
    steps: ["Gather emerald, sapphire, ruby gems from skeletons, Kurn's Tower", "Turn in with Footman's Pike to Weaponsmith Grugl"], wiki_title: "Warrior Pike Quests",
  });
  addEdge(gruglId, soldiersId, "starts");
  addEdge(soldiersId, cabilisId, "starts_in");
  addEdge(soldiersId, kurnsId, "located_in");
  addEdge(soldiersId, footmansId, "requires");

  const troopersId = "quest:warrior-pike-4-troopers";
  addNode({
    id: troopersId, label: "Warrior Pike 4: Trooper's Pike", type: "quest", classes: ["warrior"],
    description: "Gather three froglok heads from the Gubbnubb triplets, and turn them in with the Soldier's Pike to War Baron Eator for the Trooper's Pike.",
    steps: ["Gather three froglok heads from the Gubbnubb triplets", "Turn in with Soldier's Pike to War Baron Eator"], wiki_title: "Warrior Pike Quests",
  });
  addEdge(eatorId, troopersId, "starts");
  addEdge(troopersId, cabilisId, "starts_in");
  addEdge(troopersId, noHopeId, "located_in");
  addEdge(troopersId, soldiersId, "requires");

  const mancatcherQuestId = "quest:warrior-pike-5-legionnaires-mancatcher";
  addNode({
    id: mancatcherQuestId, label: "Warrior Pike 5: Legionnaire's Mancatcher", type: "quest", classes: ["warrior"],
    description: "Gather three garrison recommendations from three different warlords across multiple zones, forge with Weaponsmith Grugl using a geozite tool, and turn them in with the Trooper's Pike for the final reward, Legionnaire's Mancatcher.",
    steps: ["Gather three garrison recommendations from three warlords", "Forge with Weaponsmith Grugl using a geozite tool", "Turn in with Trooper's Pike"], wiki_title: "Warrior Pike Quests",
  });
  addEdge(gruglId, mancatcherQuestId, "starts");
  addEdge(mancatcherQuestId, cabilisId, "starts_in");
  addEdge(mancatcherQuestId, troopersId, "requires");

  const mancatcherItemId = "item:legionnaires-mancatcher";
  addNode({
    id: mancatcherItemId, label: "Legionnaire's Mancatcher", type: "item", slots: ["Primary"], classes: ["warrior"],
    skill: "1H Piercing", magic: true, lore: true, noDrop: true,
    source: "Warrior Pike Quests reward (Weaponsmith Grugl, East Cabilis)",
  });
  addEdge(mancatcherQuestId, mancatcherItemId, "rewards");
}

save();

console.log(
  "Migration 112 complete: modeled the final 2 GitHub issue #26 questline entries -- Shaman Skull Quests (5-rank requires-chain) and Warrior Pike Quests (6-tier requires-chain)."
);
