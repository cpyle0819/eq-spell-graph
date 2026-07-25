/**
 * Migration 235: Backfill `minLevel` on quest nodes that never had it
 * researched, sourced from eqlwiki.com's own "Minimum Level" infobox line
 * (via WebFetch, verbatim-quote method per decisions/
 * eqlwiki-quest-research-method.md) for each of the 106 distinct wiki_title
 * pages behind the ~479 quest nodes that had no level data at all.
 *
 * Only sets minLevel where the wiki gave one clean, unambiguous per-quest
 * number -- 328 quest nodes across 34 wiki_title pages. Two categories were
 * deliberately left alone rather than guessed at:
 *
 * - No level stated on the wiki itself (its own infobox reads "Minimum
 *   Level: ?" or has no level field at all) -- e.g. Behead the Freeport
 *   Militia, Mercenary Assignments Quest, 10th Coldain Ring Quest, and all
 *   12 "<class> Plane of Sky Tests" pages (confirmed absent on Cleric,
 *   Warrior, and Shaman's pages; the other 9 share the same template).
 * - The wiki states one blanket range/minimum for an entire multi-tier
 *   progression (e.g. Coldain Ring Quests: "30+ to start" covers all 9
 *   tiers from Copper to Hero's Insignia; Monk Sash Quests: "1-25
 *   (progresses)"), which would misrepresent later tiers if applied
 *   per-quest -- same "technically-true-but-useless" problem
 *   eqlwiki-quest-research-method.md already flags for Journeyman's Boots,
 *   but here there's no single practical number to substitute either.
 *   Left for a future pass that researches each tier individually:
 *   Crusader's Tests, Warrior Pike Quests, Shaman Skull Quests,
 *   Necromancer Skullcap Quests, Coldain Prayer Shawl Quests, Coldain Ring
 *   Quests, Monk Sash/Headband/Shackle Quests, Scaled Mystic Armor Quests.
 *
 * A couple of entries use the wiki's own "practical" number over its
 * "technical" one, same convention as Journeyman's Boots: Rare Coins
 * ("Minimum Level: 1 (35+ recommended)" -> 35) and Sebilis and Veeshan's
 * Peak Key Quest ("Minimum Level: 1 (must be 5 to zone into Sebilis)" -> 5).
 * The four class Epic Quests (Warrior/Shadowknight/Shaman/Magician) have no
 * "Minimum Level" field at all, only "Recommended Level: 46+" -- used
 * directly since it's the only number the page gives.
 */

import { loadGraph } from "./_lib";

const { graph, updateNode, save } = loadGraph(import.meta.dir);

const LEVEL_BY_WIKI_TITLE: Record<string, number> = {
  "Bard Kael Armor Quests": 50, "Cleric Kael Armor Quests": 50, "Rogue Kael Armor Quests": 50,
  "Shadowknight Kael Armor Quests": 50, "Warrior Kael Armor Quests": 50, "Paladin Kael Armor Quests": 50,
  "Druid Kael Armor Quests": 50, "Enchanter Kael Armor Quests": 50, "Magician Kael Armor Quests": 50,
  "Ranger Kael Armor Quests": 50, "Necromancer Kael Armor Quests": 50, "Wizard Kael Armor Quests": 50,

  "Bard Skyshrine Armor Quests": 50, "Cleric Skyshrine Armor Quests": 50, "Rogue Skyshrine Armor Quests": 50,
  "Shadowknight Skyshrine Armor Quests": 50, "Warrior Skyshrine Armor Quests": 50, "Paladin Skyshrine Armor Quests": 50,
  "Druid Skyshrine Armor Quests": 50, "Enchanter Skyshrine Armor Quests": 50, "Magician Skyshrine Armor Quests": 50,
  "Ranger Skyshrine Armor Quests": 50, "Necromancer Skyshrine Armor Quests": 50, "Wizard Skyshrine Armor Quests": 50,

  "Bard Thurgadin Armor Quests": 45, "Cleric Thurgadin Armor Quests": 45, "Rogue Thurgadin Armor Quests": 45,
  "Warrior Thurgadin Armor Quests": 45, "Paladin Thurgadin Armor Quests": 45,
  "Druid Thurgadin Armor Quests": 45, "Enchanter Thurgadin Armor Quests": 45, "Magician Thurgadin Armor Quests": 45,
  "Ranger Thurgadin Armor Quests": 45, "Necromancer Thurgadin Armor Quests": 45, "Wizard Thurgadin Armor Quests": 45,

  "Request of the Arcane": 55, "Request of the Strong": 55, "Test of the Emerald Tear": 55,
  "Test of the Platinum Tear": 55, "Test of the Ruby Tear": 55, "Test of Protection": 55,
  "Test of the Fire Storm": 55, "Test of the Living Flame": 55, "Test of the Tooth": 55,
  "The First Arcane Test": 55, "The Second Arcane Test": 55, "Wisdom - The Long Battle": 55,
  "Wisdom - The Short Battle": 55,

  "Plane of Sky Keys": 46,
  "Warrior Epic Quest": 46, "Shadowknight Epic Quest": 46, "Shaman Epic Quest": 46, "Magician Epic Quest": 46,

  "Key to Sleeper's Tomb": 55, "Polar Bear Cloak Quest": 6, "Porlos' Fury Quest": 60,
  "Princess Lenya (Quest)": 40, "Protect the Shipyard": 30, "Putrid Skeletons": 5,
  "Quench Lasen's Thirst": 1, "Rabid Grizzlies": 8, "Rabid Wolves": 4, "Rain Caller Quest": 35,
  "Ralgyn's Promise": 5, "Rare Coins": 35, "Rat Ear Pie Quest": 4, "Rat Fur Cap Quest": 1,
  "Rat Patrol": 1, "Rat Pelt Cape Quest": 1, "Rat Shaped Rings": 25, "Rat Teeth": 15,
  "Rat's Foot Necklace Quest": 1, "Rathmana's Traveling Offer": 1, "Ratskin Gloves Quest": 1,
  "Razortooth": 18, "Recharge Prayer Beads": 2, "Scarab Armor Quests": 2,
  "Sebilis and Veeshan's Peak Key Quest": 5, "The Spirit of Garzicor": 50, "The Velium Focus": 45,
  "Wolf Hide Armor": 5,
};

let updated = 0;
for (const node of graph.nodes) {
  if (node.data.type !== "quest") continue;
  if (node.data.minLevel !== undefined) continue;
  const level = LEVEL_BY_WIKI_TITLE[node.data.wiki_title as string];
  if (level === undefined) continue;
  updateNode(node.data.id as string, { minLevel: level });
  updated++;
}

save();
console.log(`Backfilled minLevel on ${updated} quest nodes.`);
