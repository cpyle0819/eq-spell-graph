/**
 * Migration 104: next standalone batch off GitHub issue #26's checklist --
 * the remaining unresearched plain quest names in the U-Z range not already
 * covered by migrations 095-098 (Thex Mallet through Zombie Flesh Quest).
 * Researched directly against eqlwiki.com, following
 * decisions/eqlwiki-quest-research-method.md.
 *
 * Skipped, not modeled:
 * - Velious Class Armor -- confirmed non-quest index/comparison page, same
 *   shape as the already-excluded "Monk Quests"/"Class Race Quest List":
 *   its own opening line points elsewhere for the checklist ("Velious Armor
 *   Checklist for a checklist you can use to track your gems/armor pieces...
 *   For a direct row by row stat comparison of each set, see Velious Class
 *   Armor Comparisons").
 * - Velious Class Armor Comparisons -- same non-quest shape: "The tables
 *   below exist to provide a quick side-by-side statistical comparison of
 *   the three tiers of class-specific quest reward armor from the Velious
 *   expansion."
 * - Unser's Call -- duplicate eqlwiki.com page for the already-modeled
 *   quest:unsars-glory (same giver Unsar Koldhagon, same Hall of Sorcery/
 *   South Qeynos location, same Rat Whiskers/Snake Scales/two Bat Wings
 *   turn-in, same Order of Three faction gate), same "two pages, one quest"
 *   shape as migration 095's Soil of Underfoot Quest.
 *
 * Deferred to the Questlines section (ordered chains, not standalone quests
 * or quest_groups):
 * - Warrior Epic Quest -- confirmed ordered chain: four parallel components
 *   (Jeweled Dragon Head Hilt, Finely Crafted Dragon Head Hilt, Ancient Sword
 *   Blade + Ancient Blade, Red Scabbard) must all be placed into the Red
 *   Scabbard for the final Jagged Blade of War.
 * - Warrior Pike Quests -- confirmed ordered chain, 6 sequential tiers each
 *   requiring the previous tier's pike as a turn-in item (Partisan's Pike ->
 *   Militia's Pike -> Footman's Pike -> Soldier's Pike -> Trooper's Pike ->
 *   Legionnaire's Mancatcher).
 * - Wisdom - The Long Battle, Wisdom - The Short Battle -- both confirmed as
 *   part of the Dozekar Tear Quests cluster: same Gozzrem/Temple of Veeshan
 *   tear-turn-in mechanic already tracked there, but for Cleric/Druid/Shaman
 *   (a third giver-segment alongside Lendiniara's all-class three tasks and
 *   Telkorenar's melee four tests) -- Long Battle needs Runed Tear + Flame
 *   Kissed Tear + Black Symbol + Glowing Drake Orb for Boots of Silent
 *   Striding; Short Battle needs Platinum Tear + Platinum/Silver/Emerald
 *   Symbol for the White Dragon Idol. Confirmed Gozzrem also runs The First/
 *   Second Arcane Test for Enchanter/Magician/Necromancer/Wizard (Poison Tear
 *   + Poison/Serrated/Runed Symbol for the White Dragon Statue) -- so Gozzrem
 *   alone covers both a caster and a priest segment, on top of Lendiniara and
 *   Telkorenar.
 *
 * Modeled standalone:
 * - Unkempt Druids (Quest): a hermit in Southern Karana trades Linaya
 *   Sowlin's heart for faction only -- the wiki's own Reward field states
 *   "Unknown", so no item node (same no-item-reward shape as migration 095's
 *   Tomer's Rescue/Tonics for Groflah/Toxdil's Poison).
 * - Zimel's Blades (SoulFire): a single long multi-stage quest (one giver
 *   chain of turn-ins across many zones, one final reward), not a
 *   quest_group or ordered multi-quest chain -- same shape as Trueshot
 *   Longbow Quest or Torch Of Alna Quest, just with more steps. "Freeport
 *   Sewers", mentioned mid-chain for one kill step, has no standalone
 *   eqlwiki.com page (404) and isn't modeled as its own zone, same as
 *   Kelethin-inside-Greater-Faydark; folded into the West Freeport step
 *   text instead. All other zones touched (East/West/North Freeport, East
 *   Commonlands, Highpass Hold, Mistmoore Castle, Splitpaw Lair) already
 *   exist in the graph.
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, addFactionReward, addGiver, save } = loadGraph(import.meta.dir);

// ---------------------------------------------------------------------
// Velious Class Armor -- SKIPPED, non-quest index/comparison page.
// Velious Class Armor Comparisons -- SKIPPED, non-quest stat comparison page.
// Unser's Call -- SKIPPED, duplicate eqlwiki.com page for quest:unsars-glory.
// Warrior Epic Quest -- DEFERRED to Questlines (ordered chain).
// Warrior Pike Quests -- DEFERRED to Questlines (ordered chain).
// Wisdom - The Long Battle -- DEFERRED to Questlines (Dozekar Tear Quests cluster).
// Wisdom - The Short Battle -- DEFERRED to Questlines (Dozekar Tear Quests cluster).
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// Unkempt Druids (Quest)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:southern-karana";
  const westKaranaId = "zone:western-karana";
  const giverId = "npc:southern-karana:a-hermit";
  addGiver(giverId, "a hermit", zoneId);

  const questId = "quest:unkempt-druids-quest";
  addNode({
    id: questId,
    label: "Unkempt Druids (Quest)",
    type: "quest",
    minLevel: 1,
    description:
      "A hermit inside a hut in Southern Karana wants Linaya Sowlin's heart, obtained in Western Karana, in exchange for one of her stolen song sheets ('Bring me her heart. A heart for a song sheet.'). No item reward is documented on the wiki (Reward: Unknown).",
    steps: [
      "Speak to the hermit inside the hut in Southern Karana",
      "Travel to Western Karana and obtain Linaya Sowlin's heart",
      "Return the heart to the hermit",
    ],
    wiki_title: "Unkempt Druids (Quest)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, westKaranaId, "located_in");
  addFactionReward(questId, "Unkempt Druids");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Jaggedpine Treefolk");
  addFactionReward(questId, "QRG Protected Animals");
}

// ---------------------------------------------------------------------
// Zimel's Blades (SoulFire)
// ---------------------------------------------------------------------
{
  const northFreeportId = "zone:north-freeport";
  const eastFreeportId = "zone:east-freeport";
  const westFreeportId = "zone:west-freeport";
  const eastCommonlandsId = "zone:east-commonlands";
  const highpassId = "zone:highpass-hold";
  const mistmooreId = "zone:mistmoore-castle";
  const splitpawId = "zone:splitpaw-lair";
  const giverId = "npc:north-freeport:kalatrina-plossen";
  addGiver(giverId, "Kalatrina Plossen", northFreeportId);

  const questId = "quest:zimels-blades-soulfire";
  addNode({
    id: questId,
    label: "Zimel's Blades (SoulFire)",
    type: "quest",
    classes: ["paladin"],
    minLevel: 1,
    description:
      "A long multi-stage Paladin quest requiring high Knights of Truth and Priests of Life faction: assemble a Sealed Note (via brewed Bog Juice/Edible Goo and a West Freeport Arena prisoner turn-in), a Paladin's Testimony (via East Commonlands and North Freeport Hall of Truth token turn-ins culminating in defeating Guard Willia in the Freeport sewers), a Glowing Sword Hilt (Xicotl, Mistmoore Castle), and a Brilliant Sword of Faith (from Sir Lucan D'Lere's Testimony of Truth, traded at the Hall of Truth); all four are turned in to Brother Hayle in Splitpaw Lair for SoulFire. Realistically requires level 50 to fight the required NPCs.",
    steps: [
      "Brew Bog Juice and Edible Goo",
      "Trade 4 Drom's Champagne to Tykar Renlin at the Seafarer's Roost, East Freeport, for Bunker Cell #1",
      "Trade Bog Juice, Edible Goo, and Bunker Cell #1 to a prisoner in the West Freeport Arena for H.K. 102",
      "Trade H.K. 102 to Assistant Kiolna at the Highpass Hold bank for A Sealed Note",
      "Trade a Cloth Shirt to Altunic Jartin in East Commonlands for a Token of Generosity",
      "Trade a Spider Venom Sac to Merko Quetalis at the North Freeport Hall of Truth for a Token of Bravery",
      "Turn in both tokens to Merko Quetalis to spawn Guard Willia in the Freeport sewers",
      "Defeat Guard Willia and loot the Token of Truth",
      "Return the Token of Truth to Merko Quetalis for a Testimony",
      "Defeat Xicotl in the Mistmoore Castle pool room for a Glowing Sword Hilt",
      "Defeat Sir Lucan D'Lere in West Freeport for a Testimony of Truth",
      "Trade the Testimony of Truth to Valeron Dushire at the Hall of Truth for a Brilliant Sword of Faith",
      "Turn in A Sealed Note, the Testimony, the Glowing Sword Hilt, and the Brilliant Sword of Faith to Brother Hayle in Splitpaw Lair",
    ],
    wiki_title: "Zimel's Blades (SoulFire)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, northFreeportId, "starts_in");
  addEdge(questId, northFreeportId, "located_in");
  addEdge(questId, eastFreeportId, "located_in");
  addEdge(questId, westFreeportId, "located_in");
  addEdge(questId, eastCommonlandsId, "located_in");
  addEdge(questId, highpassId, "located_in");
  addEdge(questId, mistmooreId, "located_in");
  addEdge(questId, splitpawId, "located_in");
  addFactionReward(questId, "Knights of Truth");
  addFactionReward(questId, "Priests of Life");

  const swordId = "item:soulfire";
  addNode({
    id: swordId,
    label: "SoulFire",
    type: "item",
    slots: ["Primary"],
    classes: ["paladin"],
    race: ["human", "erudite", "high elf", "half elf", "dwarf", "halfling", "gnome"],
    skill: "2H Slashing",
    damage: 23,
    delay: 45,
    stats: { str: 7, wis: 7 },
    magic: true,
    lore: true,
    noTrade: true,
    weight: 5.0,
    size: "Large",
    effect: "Promised Renewal (Any Slot, instant cast) at Level 40",
    source: "Zimel's Blades (SoulFire) reward (Brother Hayle, Splitpaw Lair)",
  });
  addEdge(questId, swordId, "rewards");
}

save();

console.log(
  "Migration 104 complete: added 2 standalone quests (Unkempt Druids (Quest), Zimel's Blades (SoulFire)) from GitHub issue #26's checklist; skipped Velious Class Armor / Velious Class Armor Comparisons (non-quest index pages) and Unser's Call (duplicate of quest:unsars-glory); deferred Warrior Epic Quest, Warrior Pike Quests, Wisdom - The Long Battle, and Wisdom - The Short Battle to the Questlines section."
);
