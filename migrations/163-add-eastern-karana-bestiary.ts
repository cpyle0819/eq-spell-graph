/**
 * Migration 163: add mob nodes for zone:eastern-karana, per the `mob` node
 * type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Same sourcing method as migrations 160-161: eqlwiki.com's
 * Category:Eastern_Plains_of_Karana, filtered to {{Namedmobpage}}-tagged
 * pages via the MediaWiki API technique
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md). 84
 * candidates total; 24 excluded as functional NPCs despite carrying the
 * template and a level:
 * - The 17 "Guard <Name>" pages and "Leon" all read "Guards the ... camp /
 *   village" in their own description -- city/camp guards, excluded per this
 *   issue's own functional-NPC rule, same as Klok Margar/Klok Rakra in
 *   migration 160.
 * - "Sir Morgan" ("This wandering guard is KOS to evil characters...") and
 *   his escort "Squire Wimbley" are the same guard exclusion, not player
 *   content to fight.
 * - "Althele", "Nuien", "Sionae", "Teloa" are the Druid/Ranger Epic Quest's
 *   sequential hand-in chain (own description: "hand in to Athele, the
 *   other druids spawn one by one as you do your hand-ins") -- friendly
 *   quest facilitators, not hostile creatures, despite carrying combat stats
 *   in the same infobox template.
 *
 * "A spirit stalker (eastern karana)" has no clean numeric level field ("Exact
 * level unknown") but the page's own prose gives a bound ("blue to a level
 * 16... conned white at level 14") -- used as minLevel 14/maxLevel 16,
 * consistent with migration 060's "check prose, not just the table" lesson
 * (decisions/mob-node-type.md).
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:eastern-karana";

const MOBS = [
  { slug: "black-wolf", label: "A Black Wolf", minLevel: 1, maxLevel: 1 },
  { slug: "druid", label: "A Druid", minLevel: 23, maxLevel: 27 },
  { slug: "griffawn", label: "A Griffawn", minLevel: 13, maxLevel: 17 },
  { slug: "griffon", label: "A Griffon", minLevel: 35, maxLevel: 37 },
  { slug: "highwayman", label: "A Highwayman", minLevel: 11, maxLevel: 16 },
  { slug: "hill-giant", label: "A Hill Giant", minLevel: 33, maxLevel: 37 },
  { slug: "lion", label: "A Lion", minLevel: 10, maxLevel: 10 },
  { slug: "lion-patriarch", label: "A Lion Patriarch", minLevel: 12, maxLevel: 14 },
  { slug: "rogue-lion", label: "A Rogue Lion", minLevel: 12, maxLevel: 14 },
  { slug: "treant", label: "A Treant", minLevel: 23, maxLevel: 27 },
  { slug: "war-wolf", label: "A War Wolf", minLevel: 11, maxLevel: 15 },
  { slug: "willowisp", label: "A Willowisp", minLevel: 9, maxLevel: 11 },
  { slug: "bandit", label: "A Bandit", minLevel: 9, maxLevel: 12 },
  { slug: "bullnose-snake", label: "A Bullnose Snake", minLevel: 7, maxLevel: 9 },
  { slug: "carrion-spider", label: "A Carrion Spider", minLevel: 10, maxLevel: 12 },
  { slug: "chasm-crawler", label: "A Chasm Crawler", minLevel: 11, maxLevel: 14 },
  { slug: "crag-spider", label: "A Crag Spider", minLevel: 18, maxLevel: 21 },
  { slug: "dark-stalker", label: "A Dark Stalker", minLevel: 15, maxLevel: 17 },
  { slug: "gnoll-reaver", label: "A Gnoll Reaver", minLevel: 14, maxLevel: 17 },
  { slug: "gorge-hound", label: "A Gorge Hound", minLevel: 15, maxLevel: 17 },
  { slug: "lioness-matriarch", label: "A Lioness Matriarch", minLevel: 10, maxLevel: 12 },
  { slug: "spirit-stalker", label: "A Spirit Stalker", minLevel: 14, maxLevel: 16 },
  { slug: "evil-eye", label: "An Evil Eye", minLevel: 17, maxLevel: 19 },
  { slug: "undead-reaver", label: "An Undead Reaver", minLevel: 15, maxLevel: 16 },
  { slug: "aagron", label: "Aagron", minLevel: 35, maxLevel: 35 },
  { slug: "adrian", label: "Adrian", minLevel: 35, maxLevel: 35 },
  { slug: "beanu-mucktail", label: "Beanu Mucktail", minLevel: 9, maxLevel: 9 },
  { slug: "broon", label: "Broon", minLevel: 23, maxLevel: 23 },
  { slug: "burah-mucktail", label: "Burah Mucktail", minLevel: 9, maxLevel: 9 },
  { slug: "chief-sanre-rexsa", label: "Chief Sanre`Rexsa", minLevel: 21, maxLevel: 21 },
  { slug: "dark-elf-corruptor", label: "Dark Elf Corruptor", minLevel: 45, maxLevel: 45 },
  { slug: "dark-elf-reaver", label: "Dark Elf Reaver", minLevel: 45, maxLevel: 45 },
  { slug: "droon", label: "Droon", minLevel: 30, maxLevel: 33 },
  { slug: "emhu-mucktail", label: "Emhu Mucktail", minLevel: 9, maxLevel: 9 },
  { slug: "fang", label: "Fang", minLevel: 51, maxLevel: 51 },
  { slug: "felodius-sworddancer", label: "Felodius Sworddancer", minLevel: 55, maxLevel: 55 },
  { slug: "ganelorn-oast", label: "Ganelorn Oast", minLevel: 50, maxLevel: 50 },
  { slug: "hibber-mucktail", label: "Hibber Mucktail", minLevel: 11, maxLevel: 11 },
  { slug: "hukex-mucktail", label: "Hukex Mucktail", minLevel: 15, maxLevel: 15 },
  { slug: "jekca-mucktail", label: "Jekca Mucktail", minLevel: 12, maxLevel: 12 },
  { slug: "klage-mucktail", label: "Klage Mucktail", minLevel: 10, maxLevel: 10 },
  { slug: "mechi-mucktail", label: "Mechi Mucktail", minLevel: 11, maxLevel: 11 },
  { slug: "milea-clothspinner", label: "Milea Clothspinner", minLevel: 16, maxLevel: 16 },
  { slug: "nra-brox-mucktail", label: "Nra`Brox Mucktail", minLevel: 17, maxLevel: 17 },
  { slug: "nra-vren-mucktail", label: "Nra`Vren Mucktail", minLevel: 15, maxLevel: 15 },
  { slug: "nre-glega-mucktail", label: "Nre`Glega Mucktail", minLevel: 12, maxLevel: 12 },
  { slug: "nre-loxe-mucktail", label: "Nre`Loxe Mucktail", minLevel: 13, maxLevel: 13 },
  { slug: "olixen-mucktail", label: "Olixen Mucktail", minLevel: 10, maxLevel: 10 },
  { slug: "plur-mucktail", label: "Plur Mucktail", minLevel: 16, maxLevel: 16 },
  { slug: "prark-mucktail", label: "Prark Mucktail", minLevel: 13, maxLevel: 13 },
  { slug: "proon", label: "Proon", minLevel: 42, maxLevel: 42 },
  { slug: "shalena-roan", label: "Shalena Roan", minLevel: 13, maxLevel: 15 },
  { slug: "splintered-claw", label: "Splintered Claw", minLevel: 20, maxLevel: 20 },
  { slug: "tallus-holton", label: "Tallus Holton", minLevel: 15, maxLevel: 15 },
  { slug: "tarbul-earthstrider", label: "Tarbul Earthstrider", minLevel: 48, maxLevel: 48 },
  { slug: "tenal-redblade", label: "Tenal Redblade", minLevel: 50, maxLevel: 50 },
  { slug: "tholris", label: "Tholris", minLevel: 51, maxLevel: 51 },
  { slug: "tregil-mucktail", label: "Tregil Mucktail", minLevel: 12, maxLevel: 12 },
  { slug: "vance-bearstalker", label: "Vance Bearstalker", minLevel: 53, maxLevel: 53 },
  { slug: "yahg-mucktail", label: "Yahg Mucktail", minLevel: 10, maxLevel: 10 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:eastern-karana:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 163 complete: ${added} mob node(s) added for Eastern Karana`);
