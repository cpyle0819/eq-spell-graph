/**
 * Migration 252: add mob nodes for zone:southern-karana, per the `mob`
 * node type from migration 060 (decisions/mob-node-type.md) -- see issue
 * #36.
 *
 * `Category:Southern Karana` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 69
 * unique `{{Namedmobpage}}` candidates: the Aviak Village roster (harrier/
 * avocet/darter/rook/egret/ruffian), the Centaur village (Charger/Archer/
 * courser/foal/sheltie plus named Meadowgreen/Thunderhoof centaurs), the
 * elephant herd (bull/adult/calf), the undead camp at Ghanex Drah's ruins,
 * the Splitpaw gnoll spawns tied to the neighboring lair, and several
 * epic-quest fights (Necromancer 1.5: Sir Telian Mottsworth; Druid: Yeka
 * Ias/Withered treant's Northern Karana counterpart chain; Quillmane, the
 * zone's own legendary unicorn).
 *
 * Three exclusions: "Jale Phlintoes" (`class` = `GM [[Druid]]`, a
 * guildmaster excluded per CLAUDE.md, same call as migration 251's
 * Northern Karana "Briana Treewhisper"), "Brother Qwinn" (no `GM` class
 * prefix, but its own description explicitly reads "Monk Guildmaster
 * involved in the Robe of the Lost Circle Quest" -- the same CLAUDE.md
 * rule applies by explicit role even without the mechanical class-field
 * tell; its placeholder "Narra Tanith" is a real wildlife fight in its own
 * right and stays), and "A Gnoll" (`zone` field names only Blackburrow/
 * Qeynos Hills/Lake Rathetear/South Qeynos, no mention of Southern Karana
 * at all -- miscategorized, same call as Northern Karana's "A ghoul").
 * "Shakrn Meadowgreen" (`class` = `Merchant`) was spot-checked for AC/HP
 * rather than excluded on the class label alone -- 220 AC / 1271 HP, a
 * real fight despite the vendor-sounding class field.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const MOBS = [
  { slug: "lord-grimrot", label: "Lord Grimrot", minLevel: 35, maxLevel: 35 },
  { slug: "lord-grimrot-undead", label: "Lord Grimrot (undead)", minLevel: 29, maxLevel: 29 },
  { slug: "vhalen-nostrolo", label: "Vhalen Nostrolo", minLevel: 31, maxLevel: 31 },
  { slug: "quillmane", label: "Quillmane", minLevel: 30, maxLevel: 30 },
  { slug: "a-dwarf-skeleton", label: "A Dwarf Skeleton", minLevel: 5, maxLevel: 7 },
  { slug: "a-skeleton", label: "A skeleton", minLevel: 4, maxLevel: 18 },
  { slug: "a-hermit", label: "A Hermit", minLevel: 20, maxLevel: 20 },
  { slug: "a-zombie", label: "A Zombie", minLevel: 7, maxLevel: 10 },
  { slug: "a-putrid-skeleton", label: "A Putrid Skeleton", minLevel: 5, maxLevel: 12 },
  { slug: "ghanex-drah", label: "Ghanex Drah", minLevel: 15, maxLevel: 15 },
  { slug: "grizzleknot", label: "Grizzleknot", minLevel: 28, maxLevel: 28 },
  { slug: "shaman-lenrel", label: "Shaman Lenrel", minLevel: 16, maxLevel: 16 },
  { slug: "groi-gutblade", label: "Groi Gutblade", minLevel: 25, maxLevel: 25 },
  { slug: "an-escaped-splitpaw-gnoll", label: "An Escaped Splitpaw Gnoll", minLevel: 4, maxLevel: 4 },
  { slug: "a-treant", label: "A Treant", minLevel: 23, maxLevel: 27 },
  { slug: "brother-drash", label: "Brother Drash", minLevel: 3, maxLevel: 3 },
  { slug: "shakrn-meadowgreen", label: "Shakrn Meadowgreen", minLevel: 31, maxLevel: 31 },
  { slug: "a-cyclops", label: "A Cyclops", minLevel: 29, maxLevel: 32 },
  { slug: "synger-foxfyre", label: "Synger Foxfyre", minLevel: 26, maxLevel: 26 },
  { slug: "knari-morawk", label: "Knari Morawk", minLevel: 17, maxLevel: 17 },
  { slug: "marik-clubthorn", label: "Marik Clubthorn", minLevel: 16, maxLevel: 16 },
  { slug: "a-tesch-mas-gnoll", label: "A Tesch Mas Gnoll", minLevel: 25, maxLevel: 33 },
  { slug: "centaur-charger", label: "Centaur Charger", minLevel: 29, maxLevel: 30 },
  { slug: "sir-telian-mottsworth", label: "Sir Telian Mottsworth", minLevel: 70, maxLevel: 70 },
  { slug: "coloth-meadowgreen", label: "Coloth Meadowgreen", minLevel: 34, maxLevel: 35 },
  { slug: "kroldir-thunderhoof", label: "Kroldir Thunderhoof", minLevel: 20, maxLevel: 20 },
  { slug: "a-shadow-wolf", label: "A shadow wolf", minLevel: 3, maxLevel: 5 },
  { slug: "narra-tanith", label: "Narra Tanith", minLevel: 22, maxLevel: 22 },
  { slug: "a-werewolf", label: "A Werewolf", minLevel: 22, maxLevel: 32 },
  { slug: "sentry-alechin", label: "Sentry Alechin", minLevel: 28, maxLevel: 30 },
  { slug: "high-shaman-grisok", label: "High Shaman Grisok", minLevel: 24, maxLevel: 24 },
  { slug: "mroon", label: "Mroon", minLevel: 20, maxLevel: 20 },
  { slug: "a-mist-wolf", label: "A Mist Wolf", minLevel: 3, maxLevel: 3 },
  { slug: "centaur-archer", label: "Centaur Archer", minLevel: 21, maxLevel: 23 },
  { slug: "a-lioness", label: "A Lioness", minLevel: 7, maxLevel: 7 },
  { slug: "a-lion", label: "A Lion", minLevel: 10, maxLevel: 10 },
  { slug: "gnawfang", label: "Gnawfang", minLevel: 15, maxLevel: 15 },
  { slug: "baenar-swiftsong", label: "Baenar Swiftsong", minLevel: 50, maxLevel: 50 },
  { slug: "cracktusk", label: "Cracktusk", minLevel: 23, maxLevel: 25 },
  { slug: "gnashmaw", label: "Gnashmaw", minLevel: 18, maxLevel: 18 },
  { slug: "an-undead-cyclops", label: "An Undead Cyclops", minLevel: 31, maxLevel: 35 },
  { slug: "high-shaman-phido", label: "High Shaman Phido", minLevel: 22, maxLevel: 22 },
  { slug: "aviak-harrier", label: "Aviak harrier", minLevel: 24, maxLevel: 26 },
  { slug: "aviak-avocet", label: "Aviak avocet", minLevel: 28, maxLevel: 30 },
  { slug: "a-bull-elephant", label: "A bull elephant", minLevel: 19, maxLevel: 22 },
  { slug: "an-elephant", label: "An elephant", minLevel: 14, maxLevel: 18 },
  { slug: "an-adult-elephant", label: "An adult elephant", minLevel: 14, maxLevel: 19 },
  { slug: "an-elephant-calf", label: "An elephant calf", minLevel: 10, maxLevel: 14 },
  { slug: "shaman-ren-rex", label: "Shaman Ren`Rex", minLevel: 15, maxLevel: 17 },
  { slug: "aviak-darter", label: "Aviak darter", minLevel: 17, maxLevel: 19 },
  { slug: "aviak-rook", label: "Aviak rook", minLevel: 20, maxLevel: 22 },
  { slug: "aviak-egret", label: "Aviak egret", minLevel: 13, maxLevel: 15 },
  { slug: "kelkim-menkia", label: "Kelkim Menkia", minLevel: 51, maxLevel: 51 },
  { slug: "yeka-ias", label: "Yeka Ias", minLevel: 60, maxLevel: 60 },
  { slug: "centaur-courser", label: "Centaur courser", minLevel: 25, maxLevel: 27 },
  { slug: "an-ishva-lteth-gnoll", label: "An Ishva Lteth gnoll", minLevel: 36, maxLevel: 37 },
  { slug: "centaur-foal", label: "Centaur foal", minLevel: 14, maxLevel: 14 },
  { slug: "centaur-sheltie", label: "Centaur sheltie", minLevel: 17, maxLevel: 19 },
  { slug: "an-interrogator", label: "An interrogator", minLevel: 25, maxLevel: 25 },
  { slug: "markus-cachexia", label: "Markus Cachexia", minLevel: 27, maxLevel: 27 },
  { slug: "morley-murrain", label: "Morley Murrain", minLevel: 26, maxLevel: 26 },
  { slug: "master-ashikur", label: "Master Ashikur", minLevel: 45, maxLevel: 45 },
  { slug: "a-putrid-skeleton-cromil", label: "A putrid skeleton (Cromil)", minLevel: 12, maxLevel: 12 },
  { slug: "a-shadowed-man-south-karana", label: "A shadowed man (South Karana)", minLevel: 24, maxLevel: 26 },
  { slug: "a-splitpaw-gnoll", label: "A Splitpaw gnoll", minLevel: 5, maxLevel: 5 },
  { slug: "an-aviak-ruffian", label: "An aviak ruffian", minLevel: 17, maxLevel: 18 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:southern-karana:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, "zone:southern-karana", "located_in");
}

save();
console.log(`Migration 252 complete: ${added} mob node(s) added to zone:southern-karana`);
