/**
 * Migration 154: add mob nodes for zone:innothule-swamp, per the `mob` node
 * type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Same sourcing method as migrations 145-149, 152: each entry is sourced
 * from that creature's own page under eqlwiki.com's Category:Innothule Swamp
 * carrying the {{Namedmobpage}} combat-stats template, using its `level`
 * field. Several creature pages (A Decaying Skeleton, A Froglok Guard, A
 * froglok tad, A skeleton, A Giant Rat) are shared across multiple zones and
 * state one non-zone-specific level with per-zone overrides for other zones
 * only -- Innothule Swamp's own level is the page's general/unqualified
 * range in those cases. "Sithgok" carries a level in its infobox but the
 * page itself identifies it as a Merchant selling alchemy supplies (matches
 * the zone map's own legend, migration 153), so it's excluded as a vendor,
 * not a mob, consistent with the mob-node-type decision's Oasis of Marr
 * precedent.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:innothule-swamp";

const MOBS = [
  { slug: "bull-alligator", label: "A Bull Alligator", minLevel: 8, maxLevel: 10 },
  { slug: "decaying-skeleton", label: "A Decaying Skeleton", minLevel: 1, maxLevel: 1 },
  { slug: "fat-alligator", label: "A Fat Alligator", minLevel: 9, maxLevel: 9 },
  { slug: "froglok", label: "A Froglok", minLevel: 3, maxLevel: 3 },
  { slug: "froglok-fisherman", label: "A Froglok Fisherman", minLevel: 4, maxLevel: 6 },
  { slug: "froglok-forager", label: "A Froglok Forager", minLevel: 6, maxLevel: 6 },
  { slug: "froglok-guard", label: "A Froglok Guard", minLevel: 4, maxLevel: 6 },
  { slug: "froglok-tad", label: "A Froglok Tad", minLevel: 1, maxLevel: 2 },
  { slug: "fungus-man-watcher", label: "A Fungus Man Watcher", minLevel: 8, maxLevel: 8 },
  { slug: "fungus-man-tracker", label: "A Fungus Man Tracker", minLevel: 4, maxLevel: 6 },
  { slug: "giant-moccasin", label: "A Giant Moccasin", minLevel: 7, maxLevel: 9 },
  { slug: "giant-water-moccasin", label: "A Giant Water Moccasin", minLevel: 9, maxLevel: 9 },
  { slug: "giant-rat", label: "A Giant Rat", minLevel: 2, maxLevel: 4 },
  { slug: "kobold-hunter", label: "A Kobold Hunter", minLevel: 7, maxLevel: 8 },
  { slug: "large-rat", label: "A Large Rat", minLevel: 1, maxLevel: 1 },
  { slug: "lesser-kobold", label: "A Lesser Kobold", minLevel: 2, maxLevel: 2 },
  { slug: "shadowed-man", label: "A Shadowed Man", minLevel: 24, maxLevel: 26 },
  { slug: "skeleton", label: "A Skeleton", minLevel: 4, maxLevel: 18 },
  { slug: "snake", label: "A Snake", minLevel: 1, maxLevel: 1 },
  { slug: "swamp-alligator", label: "A Swamp Alligator", minLevel: 4, maxLevel: 4 },
  { slug: "troll-slayer", label: "A Troll Slayer", minLevel: 7, maxLevel: 11 },
  { slug: "water-moccasin", label: "A Water Moccasin", minLevel: 6, maxLevel: 6 },
  { slug: "young-water-moccasin", label: "A Young Water Moccasin", minLevel: 1, maxLevel: 1 },
  { slug: "basher-nkekta", label: "Basher Nkekta", minLevel: 50, maxLevel: 50 },
  { slug: "basher-oggrik", label: "Basher Oggrik", minLevel: 50, maxLevel: 50 },
  { slug: "basher-sklama", label: "Basher Sklama", minLevel: 50, maxLevel: 50 },
  { slug: "basher-smag", label: "Basher Smag", minLevel: 50, maxLevel: 50 },
  { slug: "basher-trak", label: "Basher Trak", minLevel: 50, maxLevel: 50 },
  { slug: "bunk-odon", label: "Bunk Odon", minLevel: 13, maxLevel: 13 },
  { slug: "clork", label: "Clork", minLevel: 45, maxLevel: 45 },
  { slug: "dark-deathsinger", label: "Dark Deathsinger", minLevel: 25, maxLevel: 25 },
  { slug: "fandl-arathin", label: "Fandl Arathin", minLevel: 10, maxLevel: 12 },
  { slug: "forager-grikk", label: "Forager Grikk", minLevel: 3, maxLevel: 3 },
  { slug: "gwynn-marthank", label: "Gwynn Marthank", minLevel: 11, maxLevel: 11 },
  { slug: "hogus-durmas", label: "Hogus Durmas", minLevel: 12, maxLevel: 12 },
  { slug: "jars-legola", label: "Jars Legola", minLevel: 11, maxLevel: 11 },
  { slug: "jojongua", label: "Jojongua", minLevel: 17, maxLevel: 17 },
  { slug: "jyle-windstorm", label: "Jyle Windstorm", minLevel: 8, maxLevel: 8 },
  { slug: "lynuga", label: "Lynuga", minLevel: 32, maxLevel: 32 },
  { slug: "murak", label: "Murak", minLevel: 45, maxLevel: 45 },
  { slug: "rell-ostodl", label: "Rell Ostodl", minLevel: 14, maxLevel: 14 },
  { slug: "slayer-captain", label: "Slayer Captain", minLevel: 14, maxLevel: 16 },
  { slug: "spore-guardian", label: "Spore Guardian", minLevel: 10, maxLevel: 10 },
  { slug: "stragak", label: "Stragak", minLevel: 45, maxLevel: 45 },
  { slug: "tal-godin", label: "Tal Godin", minLevel: 14, maxLevel: 14 },
  { slug: "tann-cellus", label: "Tann Cellus", minLevel: 13, maxLevel: 13 },
  { slug: "zepin-winsle", label: "Zepin Winsle", minLevel: 9, maxLevel: 9 },
  { slug: "zimbittle", label: "Zimbittle", minLevel: 10, maxLevel: 10 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:innothule-swamp:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 154 complete: ${added} mob node(s) added for Innothule Swamp`);
