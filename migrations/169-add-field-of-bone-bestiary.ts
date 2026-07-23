/**
 * Migration 169: add mob nodes for zone:field-of-bone, per the `mob` node
 * type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Sourced via the MediaWiki API technique
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md):
 * Category:Field of Bone's 115 pages narrowed to 66 {{Namedmobpage}}-tagged
 * candidates, all wildlife/undead/hostile Iksar or Sythrax-cult creatures --
 * an open wilderness zone with no functional NPCs to filter out, unlike a
 * city bestiary. "Servant of Sythrax" states level "26ish to 29ish"; the
 * two numeric endpoints are used as minLevel/maxLevel same as an ordinary
 * stated range. All 66 candidates had a resolvable numeric level.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:field-of-bone";

const MOBS = [
  { slug: "a-burynai-cutter", label: "A Burynai Cutter", minLevel: 22, maxLevel: 22 },
  { slug: "a-scourgetail-scorpion", label: "A Scourgetail Scorpion", minLevel: 14, maxLevel: 14 },
  { slug: "trooper-mozo", label: "Trooper Mozo", minLevel: 50, maxLevel: 50 },
  { slug: "warlord-zyzz", label: "Warlord Zyzz", minLevel: 51, maxLevel: 51 },
  { slug: "an-iksar-bandit", label: "An Iksar Bandit", minLevel: 8, maxLevel: 10 },
  { slug: "an-iksar-marauder", label: "An Iksar Marauder", minLevel: 14, maxLevel: 16 },
  { slug: "an-iksar-footpad", label: "An Iksar Footpad", minLevel: 5, maxLevel: 7 },
  { slug: "scalebone-skeleton", label: "Scalebone Skeleton", minLevel: 9, maxLevel: 9 },
  { slug: "a-scorpion", label: "A Scorpion", minLevel: 2, maxLevel: 2 },
  { slug: "pendle-dashinger", label: "Pendle Dashinger", minLevel: 30, maxLevel: 30 },
  { slug: "targishin", label: "Targishin", minLevel: 32, maxLevel: 35 },
  { slug: "trooper-taer", label: "Trooper Taer", minLevel: 50, maxLevel: 50 },
  { slug: "a-scaled-prowler", label: "A Scaled Prowler", minLevel: 8, maxLevel: 9 },
  { slug: "kerosh-blackhand", label: "Kerosh Blackhand", minLevel: 33, maxLevel: 33 },
  { slug: "lesser-icebone-skeleton", label: "Lesser Icebone Skeleton", minLevel: 17, maxLevel: 18 },
  { slug: "a-heartsting-scorpion", label: "A Heartsting Scorpion", minLevel: 12, maxLevel: 14 },
  { slug: "the-tangrin", label: "The Tangrin", minLevel: 54, maxLevel: 54 },
  { slug: "bonecrawler", label: "Bonecrawler", minLevel: 5, maxLevel: 7 },
  { slug: "crusader-bodli", label: "Crusader Bodli", minLevel: 50, maxLevel: 50 },
  { slug: "crusader-quarg", label: "Crusader Quarg", minLevel: 50, maxLevel: 50 },
  { slug: "an-iksar-manslayer", label: "An Iksar Manslayer", minLevel: 18, maxLevel: 19 },
  { slug: "greater-scalebone", label: "Greater Scalebone", minLevel: 14, maxLevel: 15 },
  { slug: "burynaibane-spider", label: "Burynaibane Spider", minLevel: 4, maxLevel: 4 },
  { slug: "burynai-excavator", label: "Burynai Excavator", minLevel: 12, maxLevel: 16 },
  { slug: "gharg-oberbord", label: "Gharg Oberbord", minLevel: 31, maxLevel: 31 },
  { slug: "servant-of-sythrax", label: "Servant of Sythrax", minLevel: 26, maxLevel: 29 },
  { slug: "jairnel-marfury", label: "Jairnel Marfury", minLevel: 30, maxLevel: 30 },
  { slug: "a-scaled-wolf-cub", label: "A Scaled Wolf Cub", minLevel: 2, maxLevel: 4 },
  { slug: "a-scaled-wolf-pup", label: "A Scaled Wolf Pup", minLevel: 1, maxLevel: 1 },
  { slug: "carrion-queen", label: "Carrion Queen", minLevel: 12, maxLevel: 12 },
  { slug: "a-lesser-charbone-skeleton", label: "A Lesser Charbone Skeleton", minLevel: 17, maxLevel: 17 },
  { slug: "an-iksar-brigand", label: "An Iksar Brigand", minLevel: 11, maxLevel: 13 },
  { slug: "a-decaying-skeleton-iksar", label: "A Decaying Skeleton (Iksar)", minLevel: 1, maxLevel: 1 },
  { slug: "a-skeleton-iksar", label: "A Skeleton (Iksar)", minLevel: 4, maxLevel: 4 },
  { slug: "decaying-skeleton", label: "Decaying Skeleton", minLevel: 1, maxLevel: 1 },
  { slug: "a-large-scorpion", label: "A Large Scorpion", minLevel: 4, maxLevel: 6 },
  { slug: "a-skeletal-jester", label: "A Skeletal Jester", minLevel: 28, maxLevel: 30 },
  { slug: "a-militia-skeleton", label: "A Militia Skeleton", minLevel: 4, maxLevel: 6 },
  { slug: "a-scaled-wolf-prowler", label: "A Scaled Wolf Prowler", minLevel: 19, maxLevel: 22 },
  { slug: "oracle-qulin", label: "Oracle Qulin", minLevel: 40, maxLevel: 40 },
  { slug: "a-rogue-shaman", label: "A Rogue Shaman", minLevel: 8, maxLevel: 9 },
  { slug: "an-iksar-pariah", label: "An Iksar Pariah", minLevel: 21, maxLevel: 21 },
  { slug: "a-giant-scorpion", label: "A Giant Scorpion", minLevel: 8, maxLevel: 10 },
  { slug: "a-scaled-wolf-tracker", label: "A Scaled Wolf Tracker", minLevel: 17, maxLevel: 19 },
  { slug: "trooper-gummin", label: "Trooper Gummin", minLevel: 50, maxLevel: 50 },
  { slug: "iksar-dakoit", label: "Iksar Dakoit", minLevel: 18, maxLevel: 18 },
  { slug: "carrion-shredder", label: "Carrion Shredder", minLevel: 6, maxLevel: 6 },
  { slug: "a-carrion-beetle-hatchling", label: "A Carrion Beetle Hatchling", minLevel: 2, maxLevel: 3 },
  { slug: "a-large-heartsting-scorpion", label: "A Large Heartsting Scorpion", minLevel: 17, maxLevel: 17 },
  { slug: "burynai-burrower", label: "Burynai Burrower", minLevel: 10, maxLevel: 12 },
  { slug: "burynai-sapper", label: "Burynai Sapper", minLevel: 16, maxLevel: 18 },
  { slug: "a-scaled-wolf", label: "A Scaled Wolf", minLevel: 6, maxLevel: 8 },
  { slug: "a-bonebinder", label: "A Bonebinder", minLevel: 12, maxLevel: 14 },
  { slug: "a-lesser-icebone-skeleton", label: "A Lesser Icebone Skeleton", minLevel: 17, maxLevel: 17 },
  { slug: "a-scaled-wolf-hunter", label: "A Scaled Wolf Hunter", minLevel: 9, maxLevel: 11 },
  { slug: "a-scaled-wolf-stalker", label: "A Scaled Wolf Stalker", minLevel: 12, maxLevel: 16 },
  { slug: "a-young-scaled-wolf", label: "A Young Scaled Wolf", minLevel: 1, maxLevel: 1 },
  { slug: "an-emerald-scarab", label: "An Emerald Scarab", minLevel: 1, maxLevel: 3 },
  { slug: "bonecrawler-hatchling", label: "Bonecrawler Hatchling", minLevel: 2, maxLevel: 4 },
  { slug: "cudgel-ping", label: "Cudgel Ping", minLevel: 1, maxLevel: 1 },
  { slug: "emerald-fencer", label: "Emerald Fencer", minLevel: 12, maxLevel: 14 },
  { slug: "greater-skeleton-iksar", label: "Greater Skeleton (Iksar)", minLevel: 11, maxLevel: 13 },
  { slug: "sythrax-guardian", label: "Sythrax Guardian", minLevel: 28, maxLevel: 29 },
  { slug: "trooper-chikzik", label: "Trooper Chikzik", minLevel: 50, maxLevel: 50 },
  { slug: "trooper-grouko", label: "Trooper Grouko", minLevel: 50, maxLevel: 50 },
  { slug: "trooper-harpin", label: "Trooper Harpin", minLevel: 50, maxLevel: 50 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:field-of-bone:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 169 complete: ${added} mob node(s) added for Field of Bone`);
