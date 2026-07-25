/**
 * Migration 248: add mob nodes for zone:western-karana, per the `mob` node
 * type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 * Migration 246 merged zone:west-karana into this node as the same zone
 * under two names, so this is the only bestiary needed for either name.
 *
 * `Category:Western Plains of Karana` (the wiki's own category name, from
 * the zone's lore text -- not "West Karana" or "Western Karana", neither of
 * which exist as categories) narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 91
 * unique `{{Namedmobpage}}` candidates: the zone's wildlife (bears, lions,
 * wolves, spiders, beetles -- several shared as placeholders for A Hill
 * Giant's own spawn), its bandit/undead camps, the Ogre Shrine tribe (Chief
 * Goonda's shamans and guards), the corrupt guard tower duo (McCluskey/
 * Donlan, tied to the existing `Corrupt Guards` quest), the McMannus fishing
 * village and Miller farm families, a cluster of Guards of Qeynos-aligned
 * Paladins (Habastash Gikin, Parcil Vinder, Kobot Dellin, Gomo Limerin,
 * Grebin Sneztop, Kyle Rinlin, Lander Billkin, Quegin Hadder, Ronly Jogmill,
 * Tolony Marle -- all level 5, same faction/loot shape), and several
 * epic-quest fights (Bard: Konia Swiftfoot, Vilnius the Small; Shaman: A
 * wandering spirit; the Langseax quest's Basil/Paglan; Maligar and his
 * doppleganger/guards for the "Note to Maligar" chain).
 *
 * Spot-checked AC/HP for the four candidates that double as existing
 * `npc:western-karana:*` quest-giver nodes (Brother Estle, Yiz Pon, Ryshon
 * Hunsti, A wandering spirit) -- all four carry real combat stat blocks
 * (45-181 AC, 56-875 HP), not blank placeholders, so all four get a
 * matching `mob:` node alongside their existing `npc:` node, same
 * both-roles-legitimate call as The Warrens' Aderius Rhenar/Koajin
 * (migration 209-212's batch note).
 *
 * No exclusions this batch: every one of the 91 candidates has a stated
 * numeric level and a real stat block, unlike the blank-stat/GM-guildmaster
 * cases excluded in prior city-zone batches. Two cross-zone mobs (A skeleton,
 * A Hill Giant) use their base level range rather than a zone-specific
 * breakout, since neither's `level` string singles out Western Karana --
 * same call as migration 212's Estate of Unrest "A Greater Skeleton".
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const MOBS = [
  { slug: "frostbite", label: "Frostbite", minLevel: 10, maxLevel: 12 },
  { slug: "a-skeleton", label: "A skeleton", minLevel: 4, maxLevel: 18 },
  { slug: "brother-estle", label: "Brother Estle", minLevel: 4, maxLevel: 4 },
  { slug: "brother-trintle", label: "Brother Trintle", minLevel: 6, maxLevel: 6 },
  { slug: "linaya-sowlin", label: "Linaya Sowlin", minLevel: 7, maxLevel: 7 },
  { slug: "ghoul-messenger", label: "Ghoul Messenger", minLevel: 27, maxLevel: 27 },
  { slug: "ulrich-mcmannus", label: "Ulrich McMannus", minLevel: 30, maxLevel: 30 },
  { slug: "a-hill-giant", label: "A Hill Giant", minLevel: 33, maxLevel: 37 },
  { slug: "misty-storyswapper", label: "Misty Storyswapper", minLevel: 13, maxLevel: 15 },
  { slug: "lempeck-hargrin", label: "Lempeck Hargrin", minLevel: 20, maxLevel: 20 },
  { slug: "tiny-miller", label: "Tiny Miller", minLevel: 37, maxLevel: 37 },
  { slug: "oobnopterbevny-biddilets", label: "Oobnopterbevny Biddilets", minLevel: 40, maxLevel: 40 },
  { slug: "thrackin-griften", label: "Thrackin Griften", minLevel: 55, maxLevel: 55 },
  { slug: "guard-mccluskey", label: "Guard McCluskey", minLevel: 34, maxLevel: 38 },
  { slug: "guard-donlan", label: "Guard Donlan", minLevel: 27, maxLevel: 30 },
  { slug: "a-treant", label: "A Treant", minLevel: 23, maxLevel: 27 },
  { slug: "anderia", label: "Anderia", minLevel: 5, maxLevel: 5 },
  { slug: "brother-chintle", label: "Brother Chintle", minLevel: 6, maxLevel: 6 },
  { slug: "furball-miller", label: "Furball Miller", minLevel: 7, maxLevel: 7 },
  { slug: "guard-justyn", label: "Guard Justyn", minLevel: 35, maxLevel: 35 },
  { slug: "guard-kilson", label: "Guard Kilson", minLevel: 30, maxLevel: 30 },
  { slug: "guard-pryde", label: "Guard Pryde", minLevel: 30, maxLevel: 30 },
  { slug: "chief-goonda", label: "Chief Goonda", minLevel: 34, maxLevel: 34 },
  { slug: "einhorst-mcmannus", label: "Einhorst McMannus", minLevel: 35, maxLevel: 35 },
  { slug: "lars-mcmannus", label: "Lars McMannus", minLevel: 20, maxLevel: 20 },
  { slug: "a-willowisp", label: "A Willowisp", minLevel: 9, maxLevel: 11 },
  { slug: "junth-mcmannus", label: "Junth McMannus", minLevel: 20, maxLevel: 20 },
  { slug: "minda", label: "Minda", minLevel: 6, maxLevel: 6 },
  { slug: "mistrana-two-notes", label: "Mistrana Two Notes", minLevel: 25, maxLevel: 25 },
  { slug: "rongol", label: "Rongol", minLevel: 4, maxLevel: 4 },
  { slug: "tukk", label: "Tukk", minLevel: 7, maxLevel: 7 },
  { slug: "an-ogre-priestess", label: "An Ogre Priestess", minLevel: 27, maxLevel: 27 },
  { slug: "an-ogre-shamaness", label: "An Ogre Shamaness", minLevel: 25, maxLevel: 25 },
  { slug: "a-black-wolf", label: "A Black Wolf", minLevel: 1, maxLevel: 1 },
  { slug: "a-shadow-wolf", label: "A shadow wolf", minLevel: 3, maxLevel: 5 },
  { slug: "guard-gregor", label: "Guard Gregor", minLevel: 12, maxLevel: 12 },
  { slug: "a-werewolf", label: "A Werewolf", minLevel: 22, maxLevel: 32 },
  { slug: "a-grizzly-bear", label: "A Grizzly Bear", minLevel: 9, maxLevel: 11 },
  { slug: "an-ogre-shaman", label: "An Ogre Shaman", minLevel: 27, maxLevel: 27 },
  { slug: "a-fire-beetle", label: "A Fire Beetle", minLevel: 2, maxLevel: 2 },
  { slug: "a-mist-wolf", label: "A Mist Wolf", minLevel: 3, maxLevel: 3 },
  { slug: "a-brown-bear", label: "A Brown Bear", minLevel: 3, maxLevel: 8 },
  { slug: "a-lion", label: "A Lion", minLevel: 10, maxLevel: 10 },
  { slug: "a-giant-spider", label: "A Giant Spider", minLevel: 7, maxLevel: 9 },
  { slug: "maligars-enraged-doppleganger", label: "Maligar's Enraged Doppleganger", minLevel: 45, maxLevel: 45 },
  { slug: "a-giant-beetle", label: "A giant beetle", minLevel: 6, maxLevel: 8 },
  { slug: "yiz-pon", label: "Yiz Pon", minLevel: 5, maxLevel: 5 },
  { slug: "choon", label: "Choon", minLevel: 30, maxLevel: 30 },
  { slug: "froon", label: "Froon", minLevel: 30, maxLevel: 30 },
  { slug: "an-ogre-guard", label: "An ogre guard (Karana)", minLevel: 20, maxLevel: 23 },
  { slug: "a-wandering-spirit", label: "A wandering spirit", minLevel: 25, maxLevel: 25 },
  { slug: "an-animated-scarecrow", label: "An animated scarecrow", minLevel: 15, maxLevel: 15 },
  { slug: "a-brigand", label: "A brigand", minLevel: 12, maxLevel: 16 },
  { slug: "a-scarecrow", label: "A scarecrow", minLevel: 14, maxLevel: 17 },
  { slug: "konia-swiftfoot", label: "Konia Swiftfoot", minLevel: 40, maxLevel: 40 },
  { slug: "vilnius-the-small", label: "Vilnius the Small", minLevel: 46, maxLevel: 46 },
  { slug: "ryshon-hunsti", label: "Ryshon Hunsti", minLevel: 23, maxLevel: 23 },
  { slug: "a-rabid-grizzly", label: "A Rabid Grizzly", minLevel: 7, maxLevel: 10 },
  { slug: "a-swarmling", label: "A swarmling", minLevel: 10, maxLevel: 10 },
  { slug: "a-splitpaw-assassin", label: "A Splitpaw assassin", minLevel: 15, maxLevel: 15 },
  { slug: "maligar", label: "Maligar", minLevel: 45, maxLevel: 45 },
  { slug: "caninel", label: "Caninel", minLevel: 45, maxLevel: 45 },
  { slug: "habastash-gikin", label: "Habastash Gikin", minLevel: 5, maxLevel: 5 },
  { slug: "parcil-vinder", label: "Parcil Vinder", minLevel: 5, maxLevel: 5 },
  { slug: "kobot-dellin", label: "Kobot Dellin", minLevel: 5, maxLevel: 5 },
  { slug: "draze-slashyn", label: "Draze Slashyn", minLevel: 8, maxLevel: 8 },
  { slug: "a-young-plains-lioness", label: "A young plains lioness", minLevel: 3, maxLevel: 3 },
  { slug: "a-young-plains-lion", label: "A young plains lion", minLevel: 5, maxLevel: 5 },
  { slug: "a-farmer", label: "A farmer", minLevel: 4, maxLevel: 4 },
  { slug: "a-skeletal-soldier", label: "A skeletal soldier", minLevel: 6, maxLevel: 6 },
  { slug: "a-zombie-yeoman", label: "A zombie yeoman", minLevel: 6, maxLevel: 6 },
  { slug: "a-ghoul-yeoman", label: "A ghoul yeoman", minLevel: 13, maxLevel: 16 },
  { slug: "a-bandit", label: "A bandit (Western Karana)", minLevel: 9, maxLevel: 12 },
  { slug: "a-plains-lion", label: "A plains lion", minLevel: 8, maxLevel: 10 },
  { slug: "a-plains-lioness", label: "A plains lioness", minLevel: 6, maxLevel: 8 },
  { slug: "a-young-lion", label: "A young lion", minLevel: 5, maxLevel: 5 },
  { slug: "a-young-lioness", label: "A young lioness", minLevel: 5, maxLevel: 5 },
  { slug: "alzekar-kerda", label: "Alzekar Kerda", minLevel: 25, maxLevel: 25 },
  { slug: "basil", label: "Basil", minLevel: 20, maxLevel: 20 },
  { slug: "gomo-limerin", label: "Gomo Limerin", minLevel: 5, maxLevel: 5 },
  { slug: "grebin-sneztop", label: "Grebin Sneztop", minLevel: 5, maxLevel: 5 },
  { slug: "guard-ason", label: "Guard Ason", minLevel: 30, maxLevel: 30 },
  { slug: "kyle-rinlin", label: "Kyle Rinlin", minLevel: 5, maxLevel: 5 },
  { slug: "lander-billkin", label: "Lander Billkin", minLevel: 5, maxLevel: 5 },
  { slug: "nenika-lightfoot", label: "Nenika Lightfoot", minLevel: 25, maxLevel: 25 },
  { slug: "paglan", label: "Paglan", minLevel: 24, maxLevel: 24 },
  { slug: "quegin-hadder", label: "Quegin Hadder", minLevel: 5, maxLevel: 5 },
  { slug: "ronly-jogmill", label: "Ronly Jogmill", minLevel: 5, maxLevel: 5 },
  { slug: "the-swarm-mother", label: "The Swarm Mother", minLevel: 35, maxLevel: 36 },
  { slug: "thurgen-thunderhead", label: "Thurgen Thunderhead", minLevel: 25, maxLevel: 25 },
  { slug: "tolony-marle", label: "Tolony Marle", minLevel: 5, maxLevel: 5 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:western-karana:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, "zone:western-karana", "located_in");
}

save();
console.log(`Migration 248 complete: ${added} mob node(s) added to zone:western-karana`);
