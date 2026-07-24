/**
 * Migration 186: add mob nodes for zone:najena, per the `mob` node type
 * from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Sourced via the MediaWiki API technique
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md), but
 * with per-mob level data pulled the same mechanical way: `Category:Najena`'s
 * 119 pages narrowed to 36 `{{Namedmobpage}}`-tagged candidates, then each
 * candidate's raw wikitext (`prop=revisions`) was batch-fetched to read its
 * own `level`/`zone` template params directly -- exact data straight from
 * the template, cheaper and more reliable than 36 individual `WebFetch`
 * summarization calls.
 *
 * "A Goblin Warrior" is tagged into `Category:Najena` but its own `zone`
 * field says only Misty Thicket and Butcherblock Mountains -- excluded as
 * miscategorized, not actually a Najena mob (the separate "A goblin warrior
 * (Najena)" page is the real Najena-specific entry, included below). "A
 * Greater Skeleton" and "A Necromancer" both give a combined level string
 * covering multiple zones they're reused in ("7-20 / 11-13 (Befallen /
 * Najena)", "18-24 (Najena), ? (Qeynos Catacombs)") -- only the Najena
 * segment of each is kept (11-13, 18-24), consistent with how Lake
 * Rathetear's own multi-zone "A Greater Skeleton" was handled (migration
 * 184). Every other candidate's `zone` field names Najena and gives one
 * clean level or range, including guard/officer/priestess names that read
 * as functional NPCs by name alone (An Ogre Guard, A guard officer, The
 * guard captain, A Visiting Priestess, An Injured Halfling, Linara
 * Parlone) -- each was checked and has full AC/HP/attack combat stats and
 * (where stated) a hostile faction hit, consistent with this zone's own
 * page describing them as Najena's undead-allied garrison, not a town's
 * civil population.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:najena";

const MOBS = [
  { slug: "an-injured-halfling", label: "An Injured Halfling", minLevel: 20, maxLevel: 20 },
  { slug: "an-ogre-guard", label: "An Ogre Guard", minLevel: 10, maxLevel: 20 },
  { slug: "a-greater-skeleton", label: "A Greater Skeleton", minLevel: 11, maxLevel: 13 },
  { slug: "a-visiting-priestess", label: "A Visiting Priestess", minLevel: 25, maxLevel: 25 },
  { slug: "bonecracker", label: "BoneCracker", minLevel: 24, maxLevel: 24 },
  { slug: "an-earth-elemental", label: "An Earth Elemental", minLevel: 9, maxLevel: 17 },
  { slug: "a-magician", label: "A Magician", minLevel: 9, maxLevel: 23 },
  { slug: "a-goblin-magician", label: "A Goblin Magician", minLevel: 17, maxLevel: 19 },
  { slug: "a-necromancer", label: "A Necromancer", minLevel: 18, maxLevel: 24 },
  { slug: "akksstaff", label: "Akksstaff", minLevel: 30, maxLevel: 32 },
  { slug: "dark-boned-skeleton", label: "Dark-boned skeleton", minLevel: 15, maxLevel: 19 },
  { slug: "a-mist-elemental", label: "A mist elemental", minLevel: 9, maxLevel: 16 },
  { slug: "a-large-skeleton", label: "A large skeleton", minLevel: 8, maxLevel: 10 },
  { slug: "a-froglok-ghoul", label: "A froglok ghoul", minLevel: 20, maxLevel: 20 },
  { slug: "a-giant-black-widow", label: "A Giant Black Widow", minLevel: 18, maxLevel: 22 },
  { slug: "a-goblin-warrior-najena", label: "A goblin warrior (Najena)", minLevel: 15, maxLevel: 17 },
  { slug: "a-guard-officer", label: "A guard officer", minLevel: 22, maxLevel: 25 },
  { slug: "a-minotaur", label: "A Minotaur", minLevel: 29, maxLevel: 29 },
  { slug: "a-skeleton-najena", label: "A Skeleton (Najena)", minLevel: 21, maxLevel: 22 },
  { slug: "rathyl", label: "Rathyl", minLevel: 27, maxLevel: 27 },
  { slug: "moosh", label: "Moosh", minLevel: 18, maxLevel: 18 },
  { slug: "the-guard-captain", label: "The guard captain", minLevel: 25, maxLevel: 25 },
  { slug: "linara-parlone", label: "Linara Parlone", minLevel: 25, maxLevel: 25 },
  { slug: "rathyl-reincarnate", label: "Rathyl reincarnate", minLevel: 30, maxLevel: 30 },
  { slug: "drelzna", label: "Drelzna", minLevel: 25, maxLevel: 25 },
  { slug: "ekeros", label: "Ekeros", minLevel: 26, maxLevel: 26 },
  { slug: "najena-npc", label: "Najena", minLevel: 35, maxLevel: 35 },
  { slug: "the-widowmistress", label: "The Widowmistress", minLevel: 34, maxLevel: 34 },
  { slug: "tentacle-terror", label: "Tentacle Terror", minLevel: 20, maxLevel: 22 },
  { slug: "officer-grush", label: "Officer Grush", minLevel: 24, maxLevel: 24 },
  { slug: "trazdon", label: "Trazdon", minLevel: 24, maxLevel: 24 },
  { slug: "unbound-flame", label: "Unbound Flame", minLevel: 25, maxLevel: 25 },
  { slug: "the-tenderizer", label: "The Tenderizer", minLevel: 22, maxLevel: 22 },
  { slug: "lost-crusader", label: "Lost Crusader", minLevel: 25, maxLevel: 25 },
  { slug: "the-blood-artist", label: "The Blood Artist", minLevel: 27, maxLevel: 27 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:najena:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 186 complete: ${added} mob node(s) added for Najena`);
