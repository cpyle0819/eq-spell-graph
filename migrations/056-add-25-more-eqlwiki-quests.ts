/**
 * Migration 056: 25 more quests off GitHub issue #26's checklist -- the
 * rest of M (Mining Picks onward) through most of O (through Orc Hatchets).
 * Researched directly against eqlwiki.com, following
 * decisions/eqlwiki-quest-research-method.md.
 *
 * Skipped this pass (left unchecked on the issue, not modeled):
 * - Mooto's Proof -- the wiki itself calls it "an unsolved" quest; one
 *   player's attempted turn-in (Deathfist Slashed Belt + Pawn Scalp)
 *   "did not result in anything," and no reward is documented.
 * - Odd Items -- the wiki's own editor note says "I don't actually think
 *   you give him anything... I think this was just stand in dialogue
 *   without actual quests attached."
 *
 * Non-quest disambiguation/index pages that showed up in the checklist
 * (same treatment as the issue's own two excluded miscategorized pages --
 * checked off, nothing to model):
 * - Muffin Quests -- an index of separate muffin turn-ins at different
 *   zones (Muffin for Pandos among them, modeled below on its own).
 * - Orc Belt Quests -- an index pointing to Deathfist Slashed Belts, Orc
 *   Belts, Crushbone Belts, and More Help for Innoruuk (all already
 *   modeled, individually, elsewhere).
 *
 * Deferred to the Questlines section, not modeled as flat quests (doesn't
 * count against this batch's 25-standalone cap):
 * - Necromancer Words - X`Ta Tempi / X`Ta Timpi / X`Ta Tompi -- three
 *   "sister" NPCs in Neriak Foreign Quarter, each offering several
 *   different item-set-to-word turn-in combinations (Tempi alone offers
 *   at least 4: Words of Possession, Words of Haunting, and two Words of
 *   Collection variants), same one-page-hides-many-subquests shape as
 *   Armor of Ro.
 *
 * One new zone added (giver's zone missing from the graph, per the
 * issue's zone-creation guardrail):
 * - Kurn's Tower (Mirgon Dower's Head's giver, a skeletal cook) --
 *   confirmed real via its own eqlwiki.com page, Kunark Era, connects to
 *   the already-present Field of Bone. No race/class/deity faction table
 *   on its own page (focuses on monsters/drops), so it reuses the
 *   "uninhabited wilderness" WILDERNESS_FACTION template from migration
 *   052 (Kerra Island) rather than fabricating one.
 *
 * Deliberately NOT modeled (consistent with every migration so far):
 * - Every vague/random reward: Odus Pearls' 4-item random armor draw,
 *   Nillipuss the Brownie's random magic-item draw, Necro Spells' /
 *   Necromancer Spells' / Necromancer Spells (Cabilis)'s random low-level
 *   spell draws, Noble Hunters' ambiguous "large bronze weapon" (only its
 *   confirmed final reward, Ogre War Maul, is modeled), and Note to
 *   Neclo Quest's unclear Gate-vs-Shielding spell selection.
 * - Coin rewards throughout -- no coin field on `quest` nodes.
 * - Negative faction changes throughout -- `rewards` only models positive
 *   changes (decisions/quest-reward-modeling.md): e.g. Moss Snakes'
 *   Ebon Mask gain is modeled, its Guards of Qeynos/Wolves of the
 *   North/Guardians of the Vale/Carson McCabe losses are not; same
 *   pattern for More Help for Innoruuk, Necro Spells, Note to Neclo
 *   Quest, and Nesiff's Statue.
 * - Mirgon Dower's Head's own page flags a formerly-broken multi-item
 *   version "not fixed on Live until October 2003" -- modeled using the
 *   current (single Glowing Skull) version only.
 * - Niblek's Gems' reward (a medallion shard feeding the already-modeled
 *   Medallion of the Kylong Quest, migration 055) -- no dependency edge
 *   type exists yet, so the relationship stays prose only, same treatment
 *   as migration 053/054/055's other prerequisite chains.
 * - Ogre Heads' exact turn-in mechanics -- the wiki's own walkthrough
 *   section says "MISSING INFO! Please expand the content"; modeled as
 *   one flat quest/turn-in awarding the full confirmed Bloodforge set,
 *   same default the research method doc recommends when a scraper can't
 *   tell one-turn-in-per-piece from one-turn-in-for-everything.
 * - Race restrictions stated only in an item's own infobox `Race:` line
 *   (Dark Shield of Ebon lists all races on its item page, but Moss
 *   Snakes' own quest page states Dark Elf only) -- noted in the quest
 *   `description` only, not modeled as an item-level field.
 *
 * Rusty Spear (from Runnyeye Warbeads (Kaladim Rogue), migration 053) and
 * Rusty Two Handed Sword (from Bone Chips Grobb, already in the graph)
 * are reused as-is for Orc Hatchets' weapon-choice reward, rather than
 * duplicated. Tagglefoot Tingle Drink (from Runnyeye Warbeads) is reused
 * for Orc Belts' reward the same way.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

function hasNode(id: string): boolean {
  return graph.nodes.some((n: { data: { id: string } }) => n.data.id === id);
}

function addNode(data: Record<string, unknown>) {
  if (!hasNode(data.id as string)) graph.nodes.push({ data });
}

function hasEdge(source: string, target: string, type: string): boolean {
  return graph.edges.some(
    (e: { data: { source: string; target: string; type: string } }) =>
      e.data.source === source && e.data.target === target && e.data.type === type
  );
}

function addEdge(source: string, target: string, type: string) {
  if (hasEdge(source, target, type)) return;
  graph.edges.push({ data: { id: `e-${type}-${graph.edges.length + 1}`, source, target, type } });
}

function slug(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function addFactionReward(questId: string, label: string) {
  const id = `faction:${slug(label)}`;
  addNode({ id, label, type: "faction" });
  addEdge(questId, id, "rewards");
}

function addGiver(id: string, label: string, zoneId: string) {
  addNode({ id, label, type: "npc", roles: ["quest_giver"] });
  addEdge(id, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// New zone: Kurn's Tower
// ---------------------------------------------------------------------
const WILDERNESS_FACTION = {
  race: {
    barbarian: "neutral",
    "dark elf": "neutral",
    dwarf: "neutral",
    erudite: "neutral",
    gnome: "neutral",
    "half elf": "neutral",
    halfling: "neutral",
    "high elf": "neutral",
    human: "neutral",
    iksar: "neutral",
    ogre: "neutral",
    troll: "neutral",
    "wood elf": "neutral",
  },
  class: {
    bard: "safe",
    beastlord: "safe",
    cleric: "safe",
    druid: "safe",
    enchanter: "safe",
    magician: "safe",
    monk: "safe",
    necromancer: "safe",
    paladin: "safe",
    ranger: "safe",
    rogue: "safe",
    "shadow knight": "safe",
    shaman: "safe",
    warrior: "safe",
    wizard: "safe",
  },
  deity: {
    agnostic: "neutral",
    bertoxxulous: "neutral",
    "brell serilis": "neutral",
    bristlebane: "neutral",
    "cazic-thule": "neutral",
    "erollisi marr": "neutral",
    innoruuk: "neutral",
    karana: "neutral",
    "mithaniel marr": "neutral",
    prexus: "neutral",
    quellious: "neutral",
    "rallos zek": "neutral",
    "rodcet nife": "neutral",
    "solusek ro": "neutral",
    "the tribunal": "neutral",
    tunare: "neutral",
    veeshan: "neutral",
  },
};

const kurnsTowerId = "zone:kurns-tower";
addNode({
  id: kurnsTowerId,
  label: "Kurn's Tower",
  type: "zone",
  faction: structuredClone(WILDERNESS_FACTION),
  lore: "The history of Kurn's Tower is a convoluted one. The tower is named after Kurn Machta, a warlord of the Sebilisian empire during Rile's reign.",
  era: "Kunark",
  wiki_title: "Kurn's Tower",
});
addEdge(kurnsTowerId, "zone:field-of-bone", "connects_to");
addEdge("zone:field-of-bone", kurnsTowerId, "connects_to");

// ---------------------------------------------------------------------
// Mining Picks
// ---------------------------------------------------------------------
{
  const zoneId = "zone:great-divide";
  const giverId = "npc:great-divide:relik";
  addGiver(giverId, "Relik", zoneId);

  const questId = "quest:mining-picks";
  addNode({
    id: questId,
    label: "Mining Picks",
    type: "quest",
    description: "Relik in Great Divide trades 4 Shardwurm Claws -- from shardwurms -- for the Coldain Velium-Pick. Warrior, Paladin, Ranger, Shadow Knight, Bard, or Rogue; Elf, Half-Elf, Dark Elf, Dwarf, Halfling, or Gnome only.",
    classes: ["warrior", "paladin", "ranger", "shadow knight", "bard", "rogue"],
    minLevel: 35,
    steps: [
      "Kill shardwurms in Great Divide for 4 Shardwurm Claws",
      "Turn them in to Relik in Great Divide",
    ],
    wiki_title: "Mining Picks",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const pickId = "item:coldain-velium-pick";
  addNode({
    id: pickId,
    label: "Coldain Velium-Pick",
    type: "item",
    slots: ["Primary", "Secondary"],
    magic: true,
    lore: true,
    noTrade: true,
    skill: "1H Slashing",
    damage: 12,
    delay: 29,
    stats: { sta: 7 },
    effect: "Velium Shards (Combat) at Level 30",
    weight: 10.0,
    size: "Medium",
    source: "Mining Picks reward (Relik, Great Divide)",
  });
  addEdge(questId, pickId, "rewards");
}

// ---------------------------------------------------------------------
// Minotaur Horns
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ak-anon";
  const giverId = "npc:ak-anon:larkon-theardor";
  addGiver(giverId, "Larkon Theardor", zoneId);

  const questId = "quest:minotaur-horns";
  addNode({
    id: questId,
    label: "Minotaur Horns",
    type: "quest",
    description: "Larkon Theardor in Ak'Anon, requiring Indifferent or better faction, trades 2 Minotaur Horns for coin, experience, and faction. All classes.",
    minLevel: 10,
    steps: [
      "Kill minotaurs for 2 Minotaur Horns",
      "Turn them in to Larkon Theardor in Ak'Anon",
    ],
    wiki_title: "Minotaur Horns",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Eldritch Collective");
  addFactionReward(questId, "Gem Choppers");
  addFactionReward(questId, "King Ak'Anon");
}

// ---------------------------------------------------------------------
// Miranda's Chocolate
// ---------------------------------------------------------------------
{
  const zoneId = "zone:stonebrunt-mountains";
  const giverId = "npc:stonebrunt-mountains:miranda";
  addGiver(giverId, "Miranda", zoneId);

  const questId = "quest:mirandas-chocolate";
  addNode({
    id: questId,
    label: "Miranda's Chocolate",
    type: "quest",
    description: "Miranda, at the Kejekan camp in Stonebrunt Mountains, trades one Chocolate Marr Cherry -- crafted from 3 Marr Cherries and 1 Winter Chocolate -- for a Pouch of Kejek Catnip and faction. Turn in only one at a time -- she eats the rest without paying out.",
    minLevel: 1,
    steps: [
      "Craft a Chocolate Marr Cherry from 3 Marr Cherries and 1 Winter Chocolate",
      "Give one at a time to Miranda in Stonebrunt Mountains",
    ],
    wiki_title: "Miranda's Chocolate",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const catnipId = "item:pouch-of-kejek-catnip";
  addNode({
    id: catnipId,
    label: "Pouch of Kejek Catnip",
    type: "item",
    stats: { sta: -1, wis: 5 },
    weight: 0.1,
    size: "Tiny",
    source: "Miranda's Chocolate reward (Miranda, Stonebrunt Mountains) -- a meal",
  });
  addEdge(questId, catnipId, "rewards");
  addFactionReward(questId, "Kejek Village");
  addFactionReward(questId, "Peace Keepers");
}

// ---------------------------------------------------------------------
// Miranda's Dice
// ---------------------------------------------------------------------
{
  const zoneId = "zone:stonebrunt-mountains";
  const theWarrensId = "zone:the-warrens";
  const giverId = "npc:stonebrunt-mountains:miranda";

  const questId = "quest:mirandas-dice";
  addNode({
    id: questId,
    label: "Miranda's Dice",
    type: "quest",
    description: "Miranda, in Kejek (Stonebrunt Mountains), trades a Tiny Pouch of Bone Dice -- from Prince Bragnar in The Warrens -- for a Ball of Burlap Yarn and faction.",
    minLevel: 18,
    steps: [
      "Kill Prince Bragnar in The Warrens for a Tiny Pouch of Bone Dice",
      "Turn it in to Miranda in Stonebrunt Mountains",
    ],
    wiki_title: "Miranda's Dice",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, theWarrensId, "located_in");

  const yarnId = "item:ball-of-burlap-yarn";
  addNode({
    id: yarnId,
    label: "Ball of Burlap Yarn",
    type: "item",
    noTrade: true,
    charges: 4,
    effect: "Snare (Any Slot) at Level 5",
    weight: 0.0,
    size: "Tiny",
    source: "Miranda's Dice reward (Miranda, Stonebrunt Mountains)",
  });
  addEdge(questId, yarnId, "rewards");
  addFactionReward(questId, "Kejek Village");
  addFactionReward(questId, "Peace Keepers");
}

// ---------------------------------------------------------------------
// Mirgon Dower's Head
// ---------------------------------------------------------------------
{
  const zoneId = kurnsTowerId;
  const giverId = "npc:kurns-tower:a-skeletal-cook";
  addGiver(giverId, "a skeletal cook", zoneId);

  const questId = "quest:mirgon-dowers-head";
  addNode({
    id: questId,
    label: "Mirgon Dower's Head",
    type: "quest",
    description: "A skeletal cook in Kurn's Tower trades a Glowing Skull for the Skull of Torture. No faction hits. All classes; all races except Elf, High Elf, Dwarf, and Halfling.",
    minLevel: 20,
    steps: [
      "Find a Glowing Skull in Kurn's Tower",
      "Turn it in to a skeletal cook in Kurn's Tower",
    ],
    wiki_title: "Mirgon Dower's Head",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const skullId = "item:skull-of-torture";
  addNode({
    id: skullId,
    label: "Skull of Torture",
    type: "item",
    slots: ["Neck"],
    ac: 2,
    stats: { int: 5, hp: 10, mana: 10 },
    source: "Mirgon Dower's Head reward (a skeletal cook, Kurn's Tower)",
  });
  addEdge(questId, skullId, "rewards");
}

// ---------------------------------------------------------------------
// Moonstones Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:mcneal-jocub";
  addGiver(giverId, "McNeal Jocub", zoneId);

  const questId = "quest:moonstones-quest";
  addNode({
    id: questId,
    label: "Moonstones Quest",
    type: "quest",
    description: "McNeal Jocub in South Qeynos accepts Moonstones -- traded from Captain Tillin for Gnoll Fangs -- for experience, faction, coin, and optionally Black Burrow Stout.",
    minLevel: 4,
    steps: [
      "Kill gnolls for Gnoll Fangs",
      "Trade the fangs to Captain Tillin for Moonstones",
      "Give the Moonstones to McNeal Jocub in South Qeynos",
    ],
    wiki_title: "Moonstones Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// More Help for Innoruuk
// ---------------------------------------------------------------------
{
  const zoneId = "zone:grobb";
  const giverId = "npc:grobb:kaglari";

  const questId = "quest:more-help-for-innoruuk";
  addNode({
    id: questId,
    label: "More Help for Innoruuk",
    type: "quest",
    description: "Kaglari in Grobb, requiring Apprehensive or better Innoruuk faction (Ogres typically cannot complete it; Agnostic and Innoruuk-worshipping Dark Elves can), trades a Deathfist Slashed Belt for the spell Spirit Pouch and faction.",
    minLevel: 1,
    steps: ["Turn in a Deathfist Slashed Belt to Kaglari in Grobb"],
    wiki_title: "More Help for Innoruuk",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "spell:spirit-pouch", "rewards");
  addFactionReward(questId, "Dark Ones");
  addFactionReward(questId, "Shadowknights of Night Keep");
}

// ---------------------------------------------------------------------
// Morin's Sword
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kithicor-forest";
  const giverId = "npc:kithicor-forest:morin-shadowbane";
  addGiver(giverId, "Morin Shadowbane", zoneId);

  const questId = "quest:morins-sword";
  addNode({
    id: questId,
    label: "Morin's Sword",
    type: "quest",
    description: "Morin Shadowbane in Kithicor Forest trades either a Strategic Map of Kithicor (from a ghoul messenger) or an Ebony Bladed Sword (from a minotaur patriarch) for the Short Sword of Morin. Ranger only.",
    classes: ["ranger"],
    minLevel: 28,
    steps: [
      "Kill a ghoul messenger for a Strategic Map of Kithicor, or a minotaur patriarch for an Ebony Bladed Sword, in Kithicor Forest",
      "Turn it in to Morin Shadowbane in Kithicor Forest",
    ],
    wiki_title: "Morin's Sword",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const swordId = "item:short-sword-of-morin";
  addNode({
    id: swordId,
    label: "Short Sword of Morin",
    type: "item",
    slots: ["Primary", "Secondary"],
    classes: ["ranger"],
    magic: true,
    lore: true,
    noTrade: true,
    skill: "1H Slashing",
    damage: 6,
    delay: 22,
    stats: { str: 3, agi: 3 },
    weight: 3.0,
    size: "Medium",
    source: "Morin's Sword reward (Morin Shadowbane, Kithicor Forest) -- Human, Elf, Half-Elf, Halfling only",
  });
  addEdge(questId, swordId, "rewards");
}

// ---------------------------------------------------------------------
// Moss Snakes
// ---------------------------------------------------------------------
{
  const zoneId = "zone:neriak-3rd-gate";
  const giverId = "npc:neriak-3rd-gate:hekzin-gzule";
  addGiver(giverId, "Hekzin G`Zule", zoneId);

  const questId = "quest:moss-snakes";
  addNode({
    id: questId,
    label: "Moss Snakes",
    type: "quest",
    description: "Hekzin G`Zule, in the rogue guild at Neriak 3rd Gate, trades a Bag of Snake Parts -- 3 snake scales and 3 snake fangs combined in an empty bag -- for the Dark Shield of Ebon and faction. Warrior, Cleric, Shadow Knight, or Rogue; Dark Elf only.",
    classes: ["warrior", "cleric", "shadow knight", "rogue"],
    minLevel: 1,
    steps: [
      "Kill snakes for 3 snake scales and 3 snake fangs",
      "Combine them in an empty bag for a Bag of Snake Parts",
      "Turn it in to Hekzin G`Zule in Neriak 3rd Gate",
    ],
    wiki_title: "Moss Snakes",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const shieldId = "item:dark-shield-of-ebon";
  addNode({
    id: shieldId,
    label: "Dark Shield of Ebon",
    type: "item",
    slots: ["Back", "Secondary"],
    classes: ["warrior", "cleric", "shadow knight", "rogue"],
    lore: true,
    ac: 3,
    weight: 2.5,
    size: "Small",
    source: "Moss Snakes reward (Hekzin G`Zule, Neriak 3rd Gate) -- earned via a Dark Elf-only quest",
  });
  addEdge(questId, shieldId, "rewards");
  addFactionReward(questId, "Ebon Mask");
}

// ---------------------------------------------------------------------
// Muffin for Pandos
// ---------------------------------------------------------------------
{
  const zoneId = "zone:west-freeport";
  const giverId = "npc:west-freeport:pandos-flintside";
  addGiver(giverId, "Pandos Flintside", zoneId);

  const questId = "quest:muffin-for-pandos";
  addNode({
    id: questId,
    label: "Muffin for Pandos",
    type: "quest",
    description: "Pandos Flintside in West Freeport takes up to 4 Muffins at a time for experience and +5 faction per muffin with Faydark's Champions, King Tearis Thex, Clerics of Tunare, and Soldiers of Tunare. Repeatable -- roughly 660 muffins to go from Apprehensive to Kindly.",
    minLevel: 1,
    steps: ["Turn in up to 4 Muffins at a time to Pandos Flintside in West Freeport"],
    wiki_title: "Muffin for Pandos",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Faydark's Champions");
  addFactionReward(questId, "King Tearis Thex");
  addFactionReward(questId, "Clerics of Tunare");
  addFactionReward(questId, "Soldiers of Tunare");
}

// ---------------------------------------------------------------------
// Natures Defender Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:plane-of-growth";
  const giverId = "npc:plane-of-growth:guardian-of-takish";
  addGiver(giverId, "Guardian of Takish", zoneId);

  const questId = "quest:natures-defender-quest";
  addNode({
    id: questId,
    label: "Nature's Defender Quest",
    type: "quest",
    description: "Guardian of Takish in the Plane of Growth assembles a Fleshless Skull (from the Corrupter of Life in Plane of Hate), a Corrupted Faun's Skin, a Corrupted Panther Skin, and a Corrupted Unicorn Skin (all from corrupted animals in the Wakening Lands) into Nature's Defender. No faction hits (confirmed 08/20/2021). Paladin only; High Elf or Human only.",
    classes: ["paladin"],
    minLevel: 46,
    steps: [
      "Kill the Corrupter of Life in Plane of Hate for a Fleshless Skull",
      "Kill corrupted fauns, panthers, and unicorns in the Wakening Lands for their skins",
      "Give all four to Guardian of Takish in the Plane of Growth",
    ],
    wiki_title: "Natures Defender Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const weaponId = "item:natures-defender";
  addNode({
    id: weaponId,
    label: "Nature's Defender",
    type: "item",
    slots: ["Primary"],
    classes: ["paladin"],
    magic: true,
    lore: true,
    noTrade: true,
    skill: "2H Slashing",
    stats: { str: 10, dex: 10, wis: 10, hp: 25, mana: 25 },
    effect: "disease and poison resistance, plus a special combat effect",
    source: "Nature's Defender Quest reward (Guardian of Takish, Plane of Growth) -- High Elf or Human only",
  });
  addEdge(questId, weaponId, "rewards");
}

// ---------------------------------------------------------------------
// Necro Spells
// ---------------------------------------------------------------------
{
  const zoneId = "zone:west-cabilis";
  const giverId = "npc:west-cabilis:keeper-bile";
  addGiver(giverId, "Keeper Bile", zoneId);

  const questId = "quest:necro-spells";
  addNode({
    id: questId,
    label: "Necro Spells",
    type: "quest",
    description: "Keeper Bile in West Cabilis trades a large scorpion pincer, a sabertooth cub canine, and 2 brittle skulls for coin and a random low-level Necromancer spell. Necromancer only.",
    classes: ["necromancer"],
    minLevel: 6,
    steps: [
      "Gather a large scorpion pincer, a sabertooth cub canine, and 2 brittle skulls",
      "Turn them in to Keeper Bile in West Cabilis",
    ],
    wiki_title: "Necro Spells",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Brood of Kotiz");
  addFactionReward(questId, "Legion of Cabilis");
}

// ---------------------------------------------------------------------
// Necromancer Spells
// ---------------------------------------------------------------------
{
  const zoneId = "zone:the-overthere";
  const giverId = "npc:the-overthere:vaean-the-night";
  addGiver(giverId, "Vaean the Night", zoneId);

  const questId = "quest:necromancer-spells";
  addNode({
    id: questId,
    label: "Necromancer Spells",
    type: "quest",
    description: "Vaean the Night in The Overthere trades any one of four spell scrolls (Convergence, Defoliation, Splurt, Thrall of Bones) for a random one of four rarer spell scrolls (Minion of Shadows, Sacrifice, Scent of Terris, Shadowbond). Necromancer only. Distinct from the Necromancer Spells (Cabilis) quest.",
    classes: ["necromancer"],
    minLevel: 51,
    steps: ["Bring one of the four common scrolls to Vaean the Night in The Overthere"],
    wiki_title: "Necromancer Spells",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Necromancer Spells (Cabilis)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:west-cabilis";
  const giverId = "npc:west-cabilis:izarod-fristan";
  addGiver(giverId, "Izarod Fristan", zoneId);

  const questId = "quest:necromancer-spells-cabilis";
  addNode({
    id: questId,
    label: "Necromancer Spells (Cabilis)",
    type: "quest",
    description: "Izarod Fristan, in the necromancer guild tower in West Cabilis, trades any one of four spell scrolls (Convergence, Defoliation, Splurt, Thrall of Bones) for a random one of four rarer spell scrolls (Minion of Shadows, Sacrifice, Scent of Terris, Shadowbond). Necromancer only.",
    classes: ["necromancer"],
    minLevel: 1,
    steps: ["Bring one of the four common scrolls to Izarod Fristan in West Cabilis"],
    wiki_title: "Necromancer Spells (Cabilis)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Neonate Cowardice
// ---------------------------------------------------------------------
{
  const zoneId = "zone:paineel";
  const giverId = "npc:paineel:davorre-bloodthorn";
  addGiver(giverId, "Davorre Bloodthorn", zoneId);

  const questId = "quest:neonate-cowardice";
  addNode({
    id: questId,
    label: "Neonate Cowardice",
    type: "quest",
    description: "Davorre Bloodthorn, at the Fell Blade shadow knight guild in Paineel, trades a Small Sealed Bag (a Bat Wing, Rat Ears, a Snake Egg, and a Fire Beetle Eye) for experience and coin. Kindly or better faction. All classes.",
    minLevel: 2,
    steps: [
      "Gather a Bat Wing, Rat Ears, a Snake Egg, and a Fire Beetle Eye into a Small Sealed Bag",
      "Turn it in to Davorre Bloodthorn in Paineel",
    ],
    wiki_title: "Neonate Cowardice",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Nesiff's Statue
// ---------------------------------------------------------------------
{
  const zoneId = "zone:surefall-glade";
  const southQeynosId = "zone:south-qeynos";
  const giverId = "npc:surefall-glade:vesteri-nomanoi";
  addGiver(giverId, "Vesteri Nomanoi", zoneId);

  const questId = "quest:nesiffs-statue";
  addNode({
    id: questId,
    label: "Nesiff's Statue",
    type: "quest",
    description: "Vesteri Nomanoi in Surefall Glade sends players to deliver Vesteri's Claim Check to Nesiff Tallaherd in South Qeynos for a Wooden Statue of Tunare, returned to Vesteri for coin, experience, and faction.",
    minLevel: 1,
    steps: [
      "Receive Vesteri's Claim Check from Vesteri Nomanoi in Surefall Glade",
      "Give it to Nesiff Tallaherd in South Qeynos for a Wooden Statue of Tunare",
      "Return the statue to Vesteri Nomanoi in Surefall Glade",
    ],
    wiki_title: "Nesiff's Statue",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, southQeynosId, "located_in");
  addFactionReward(questId, "Merchants of Qeynos");
  addFactionReward(questId, "Antonius Bayle");
  addFactionReward(questId, "Coalition of Tradefolk");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Jaggedpine Treefolk");
  addFactionReward(questId, "Protectors of Pine");
  addFactionReward(questId, "QRG Protected Animals");
}

// ---------------------------------------------------------------------
// Niblek's Gems
// ---------------------------------------------------------------------
{
  const zoneId = "zone:chardok";
  const giverId = "npc:chardok:niblek";
  addGiver(giverId, "Niblek", zoneId);

  const questId = "quest:nibleks-gems";
  addNode({
    id: questId,
    label: "Niblek's Gems",
    type: "quest",
    description: "Niblek, in the slave area of Chardok, trades a Black Sapphire and a Ruby for experience and the Top Shard of the Kylong Medallion -- one of the three pieces needed for the (already-modeled) Medallion of the Kylong Quest.",
    minLevel: 39,
    steps: [
      "Gather a Black Sapphire and a Ruby",
      "Turn them in to Niblek in Chardok",
    ],
    wiki_title: "Niblek's Gems",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Nillipuss the Brownie
// ---------------------------------------------------------------------
{
  const zoneId = "zone:rivervale";
  const giverId = "npc:rivervale:reebo-leafsway";
  addGiver(giverId, "Reebo Leafsway", zoneId);

  const questId = "quest:nillipuss-the-brownie";
  addNode({
    id: questId,
    label: "Nillipuss the Brownie",
    type: "quest",
    description: "Reebo Leafsway in Rivervale trades 4 Nillipus' Jumjum Stalks -- from repeatedly killing Nillipuss, a brownie -- for coin, experience, and a random magic item (earrings, amulets, pouches, wands, rings, and others).",
    minLevel: 17,
    steps: [
      "Kill Nillipuss (a brownie) in Rivervale, repeatedly, for 4 Jumjum Stalks",
      "Turn them in to Reebo Leafsway in Rivervale",
    ],
    wiki_title: "Nillipuss the Brownie",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Storm Reapers");
  addFactionReward(questId, "Mayor Gubbin");
  addFactionReward(questId, "Merchants of Rivervale");
}

// ---------------------------------------------------------------------
// Noble Hunters
// ---------------------------------------------------------------------
{
  const zoneId = "zone:oggok";
  const giverId = "npc:oggok:guntrik";
  addGiver(giverId, "Guntrik", zoneId);

  const questId = "quest:noble-hunters";
  addNode({
    id: questId,
    label: "Noble Hunters",
    type: "quest",
    description: "Guntrik in Oggok, requiring Amiable or better faction, runs two turn-ins: a Noble's Crest (from noble hunters) for a large bronze weapon (exact piece unclear), and 2 Human Scalps (from Sven and Philicia Drinn) for an Ogre War Maul. Both pay coin, experience, and faction.",
    minLevel: 14,
    steps: [
      "Kill noble hunters for a Noble's Crest, or kill Sven and Philicia Drinn for 2 Human Scalps",
      "Turn them in to Guntrik in Oggok",
    ],
    wiki_title: "Noble Hunters",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const maulId = "item:ogre-war-maul";
  addNode({
    id: maulId,
    label: "Ogre War Maul",
    type: "item",
    slots: ["Primary"],
    classes: ["warrior", "paladin", "shadow knight", "cleric", "druid", "monk", "ranger", "shaman", "beastlord"],
    skill: "2H Blunt",
    damage: 17,
    delay: 50,
    weight: 13.0,
    size: "Large",
    source: "Noble Hunters reward (Guntrik, Oggok) -- excludes Bard, Rogue, Necromancer, Wizard, Magician, Enchanter",
  });
  addEdge(questId, maulId, "rewards");
  addFactionReward(questId, "Craknek Warriors");
  addFactionReward(questId, "Clurg");
}

// ---------------------------------------------------------------------
// Note to Neclo Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const qeynosHillsId = "zone:qeynos-hills";
  const giverId = "npc:south-qeynos:daenor-casthopur";
  addGiver(giverId, "Daenor Casthopur", zoneId);

  const questId = "quest:note-to-neclo-quest";
  addNode({
    id: questId,
    label: "Note to Neclo Quest",
    type: "quest",
    description: "Daenor Casthopur in South Qeynos sends a note to Neclo Rheslar in Qeynos Hills; delivering it pays experience, faction, and a low-level spell (the wiki lists Gate or Minor Shielding without clarifying which).",
    minLevel: 1,
    steps: [
      "Receive a note from Daenor Casthopur in South Qeynos",
      "Deliver it to Neclo Rheslar in Qeynos Hills",
    ],
    wiki_title: "Note to Neclo Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, qeynosHillsId, "located_in");
  addFactionReward(questId, "Order of Three");
  addFactionReward(questId, "Guards of Qeynos");
}

// ---------------------------------------------------------------------
// Odus Pearls
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const giverId = "npc:erudin:weligon-steelherder";
  addGiver(giverId, "Weligon Steelherder", zoneId);

  const questId = "quest:odus-pearls";
  addNode({
    id: questId,
    label: "Odus Pearls",
    type: "quest",
    description: "Weligon Steelherder in Erudin, requiring Amiable or better faction, trades a Full Bag of Pearls -- 4 Pearl of Odus ground spawns from Erudin's harbor -- for coin, experience, and a random armor piece (Patchwork Sleeves, Small Bag, Tattered Skullcap, or Worn Great Staff).",
    minLevel: 10,
    steps: [
      "Gather 4 Pearl of Odus from Erudin's harbor into a Full Bag of Pearls",
      "Turn it in to Weligon Steelherder in Erudin",
    ],
    wiki_title: "Odus Pearls",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Ogre Heads
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-kaladim";
  const giverId = "npc:south-kaladim:byzar-bloodforge";
  addGiver(giverId, "Byzar Bloodforge", zoneId);

  const questId = "quest:ogre-heads";
  addNode({
    id: questId,
    label: "Ogre Heads",
    type: "quest",
    description: "Byzar Bloodforge in South Kaladim trades Ogre Heads -- looted from Corflunk and Zarchoomi -- for the Bloodforge armor set. Cleric, Paladin, or Warrior; Dwarf only.",
    classes: ["cleric", "paladin", "warrior"],
    minLevel: 7,
    steps: [
      "Kill Corflunk and Zarchoomi for Ogre Heads",
      "Turn them in to Byzar Bloodforge in South Kaladim",
    ],
    wiki_title: "Ogre Heads",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const pieces: Array<{ id: string; label: string; slot: string; ac: number; stats?: Record<string, number>; effect?: string }> = [
    { id: "item:bloodforge-armplates", label: "Bloodforge Armplates", slot: "Arms", ac: 6 },
    { id: "item:bloodforge-boots", label: "Bloodforge Boots", slot: "Feet", ac: 5 },
    { id: "item:bloodforge-bracers", label: "Bloodforge Bracers", slot: "Wrist", ac: 5 },
    { id: "item:bloodforge-gauntlets", label: "Bloodforge Gauntlets", slot: "Hands", ac: 6 },
    {
      id: "item:bloodforge-helm",
      label: "Bloodforge Helm",
      slot: "Head",
      ac: 5,
      stats: { str: 5 },
      effect: "SV Fire +5, SV Disease +5, SV Cold +5, SV Magic +5, SV Poison +5",
    },
    { id: "item:bloodforge-legplates", label: "Bloodforge Legplates", slot: "Legs", ac: 7 },
    { id: "item:bloodforge-mail", label: "Bloodforge Mail", slot: "Chest", ac: 12 },
  ];
  for (const piece of pieces) {
    addNode({
      id: piece.id,
      label: piece.label,
      type: "item",
      slots: [piece.slot],
      classes: ["cleric", "paladin", "warrior"],
      ac: piece.ac,
      ...(piece.stats ? { stats: piece.stats } : {}),
      ...(piece.effect ? { effect: piece.effect } : {}),
      source: "Ogre Heads reward (Byzar Bloodforge, South Kaladim) -- Dwarf only",
    });
    addEdge(questId, piece.id, "rewards");
  }
}

// ---------------------------------------------------------------------
// Old Dreams
// ---------------------------------------------------------------------
{
  const zoneId = "zone:eastern-wastes";
  const giverId = "npc:eastern-wastes:dreamspeaker-lyssiara";
  addGiver(giverId, "Dreamspeaker Lyssiara", zoneId);

  const questId = "quest:old-dreams";
  addNode({
    id: questId,
    label: "Old Dreams",
    type: "quest",
    description: "Dreamspeaker Lyssiara in Eastern Wastes trades a Goblin Ice Necklace (from Everfrost Peaks goblins), a Fire Goblin Skin (from Solusek's Eye goblins), and an unopened Holiday Gift for Chapter VI, The First Frost and a Holiday Gift. Seasonal (Frostmas).",
    minLevel: 1,
    steps: [
      "Kill goblins in Everfrost Peaks for a Goblin Ice Necklace",
      "Kill goblins in Solusek's Eye for a Fire Goblin Skin",
      "Bring both plus an unopened Holiday Gift to Dreamspeaker Lyssiara in Eastern Wastes",
    ],
    wiki_title: "Old Dreams",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Orc Belts
// ---------------------------------------------------------------------
{
  const zoneId = "zone:misty-thicket";
  const giverId = "npc:misty-thicket:deputy-budo";
  addGiver(giverId, "Deputy Budo", zoneId);

  const questId = "quest:orc-belts";
  addNode({
    id: questId,
    label: "Orc Belts",
    type: "quest",
    description: "Deputy Budo in Misty Thicket trades a Deathfist Slashed Belt for coin, experience, faction, and a Tagglefoot Tingle Drink.",
    minLevel: 2,
    steps: ["Turn in a Deathfist Slashed Belt to Deputy Budo in Misty Thicket"],
    wiki_title: "Orc Belts",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "item:tagglefoot-tingle-drink", "rewards");
  addFactionReward(questId, "Guardians of the Vale");
  addFactionReward(questId, "Mayor Gubbin");
  addFactionReward(questId, "Storm Reapers");
  addFactionReward(questId, "Merchants of Rivervale");
}

// ---------------------------------------------------------------------
// Orc Hatchets
// ---------------------------------------------------------------------
{
  const zoneId = "zone:greater-faydark";
  const giverId = "npc:greater-faydark:dill-fireshine";
  addGiver(giverId, "Dill Fireshine", zoneId);

  const questId = "quest:orc-hatchets";
  addNode({
    id: questId,
    label: "Orc Hatchets",
    type: "quest",
    description: "Dill Fireshine in Kelethin (Greater Faydark), requiring Amiable faction, trades 2 Orc Hatchets -- from orc hatchetmen and orc pawns -- for coin, experience, and a choice of weapon (Rusty Short Sword, Rusty Spear, Rusty Two Handed Sword, Tarnished Bastard Sword, or Tarnished Scimitar). Bard, Druid, Paladin, Ranger, Rogue, Shadow Knight, Shaman, or Warrior.",
    classes: ["bard", "druid", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"],
    minLevel: 2,
    steps: [
      "Kill orc hatchetmen and orc pawns in Greater Faydark for 2 Orc Hatchets",
      "Turn them in to Dill Fireshine in Kelethin",
    ],
    wiki_title: "Orc Hatchets",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const rustyShortSwordId = "item:rusty-short-sword";
  addNode({
    id: rustyShortSwordId,
    label: "Rusty Short Sword",
    type: "item",
    slots: ["Primary", "Secondary"],
    classes: ["warrior", "paladin", "ranger", "shadow knight", "bard", "rogue"],
    skill: "1H Slashing",
    damage: 4,
    delay: 28,
    weight: 5.0,
    size: "Medium",
    source: "Orc Hatchets reward (Dill Fireshine, Greater Faydark)",
  });
  addEdge(questId, rustyShortSwordId, "rewards");
  addEdge(questId, "item:rusty-spear", "rewards");
  addEdge(questId, "item:rusty-two-handed-sword", "rewards");

  const tarnishedBastardSwordId = "item:tarnished-bastard-sword";
  addNode({
    id: tarnishedBastardSwordId,
    label: "Tarnished Bastard Sword",
    type: "item",
    slots: ["Primary", "Secondary"],
    classes: ["warrior", "paladin", "ranger", "shadow knight", "bard", "rogue"],
    skill: "1H Slashing",
    damage: 6,
    delay: 40,
    weight: 9.0,
    size: "Medium",
    source: "Orc Hatchets reward (Dill Fireshine, Greater Faydark)",
  });
  addEdge(questId, tarnishedBastardSwordId, "rewards");

  const tarnishedScimitarId = "item:tarnished-scimitar";
  addNode({
    id: tarnishedScimitarId,
    label: "Tarnished Scimitar",
    type: "item",
    slots: ["Primary", "Secondary"],
    classes: ["warrior", "paladin", "ranger", "shadow knight", "druid", "bard", "rogue"],
    skill: "1H Slashing",
    damage: 5,
    delay: 33,
    weight: 7.5,
    size: "Medium",
    source: "Orc Hatchets reward (Dill Fireshine, Greater Faydark)",
  });
  addEdge(questId, tarnishedScimitarId, "rewards");
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 056 complete: added 25 more quests from GitHub issue #26's checklist");
