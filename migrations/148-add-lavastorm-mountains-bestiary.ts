/**
 * Migration 148: add mob nodes for zone:lavastorm-mountains, per the `mob`
 * node type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Same sourcing method as migration 145-147: each entry is sourced from
 * that creature's own page under Category:Lavastorm Mountains carrying the
 * {{Namedmobpage}} template, using its `level` field. "A thought bleeder"
 * is also in this category but its own page states no numeric level at
 * all (only "Blue @ lvl50", a relative con color, not a level or range) --
 * excluded rather than guessed, consistent with migration 060's policy.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:lavastorm-mountains";

const MOBS = [
  { slug: "fire-drake", label: "A Fire Drake", minLevel: 9, maxLevel: 11 },
  { slug: "fire-elemental", label: "A Fire Elemental", minLevel: 9, maxLevel: 16 },
  { slug: "fire-goblin", label: "A Fire Goblin", minLevel: 11, maxLevel: 11 },
  { slug: "fire-goblin-scout", label: "A Fire Goblin Scout", minLevel: 11, maxLevel: 11 },
  { slug: "fire-goblin-warrior", label: "A Fire Goblin Warrior", minLevel: 10, maxLevel: 10 },
  { slug: "fire-goblin-wizard", label: "A Fire Goblin Wizard", minLevel: 12, maxLevel: 12 },
  { slug: "fire-imp", label: "A Fire Imp", minLevel: 11, maxLevel: 12 },
  { slug: "fire-sprite", label: "A Fire Sprite", minLevel: 15, maxLevel: 15 },
  { slug: "firescale-crocodile", label: "A Firescale Crocodile", minLevel: 26, maxLevel: 30 },
  { slug: "lava-basilisk", label: "A Lava Basilisk", minLevel: 13, maxLevel: 18 },
  { slug: "lava-crawler", label: "A Lava Crawler", minLevel: 13, maxLevel: 17 },
  { slug: "lesser-nightmare", label: "A Lesser Nightmare", minLevel: 16, maxLevel: 20 },
  { slug: "rock-dervish", label: "A Rock Dervish", minLevel: 12, maxLevel: 16 },
  { slug: "shadowed-man", label: "A Shadowed Man", minLevel: 24, maxLevel: 26 },
  { slug: "warbone-monk", label: "A Warbone Monk", minLevel: 18, maxLevel: 20 },
  { slug: "warbone-spearman", label: "A Warbone Spearman", minLevel: 14, maxLevel: 14 },
  { slug: "deep-lava-basilisk", label: "Deep Lava Basilisk", minLevel: 11, maxLevel: 15 },
  { slug: "eejag", label: "Eejag", minLevel: 55, maxLevel: 55 },
  { slug: "goblin-runner", label: "Goblin Runner", minLevel: 5, maxLevel: 6 },
  { slug: "goblin-scout", label: "Goblin Scout", minLevel: 11, maxLevel: 11 },
  { slug: "goblin-warrior", label: "Goblin Warrior", minLevel: 9, maxLevel: 11 },
  { slug: "hykallen", label: "Hykallen", minLevel: 16, maxLevel: 16 },
  { slug: "ruathey", label: "Ruathey", minLevel: 32, maxLevel: 32 },
  { slug: "sir-lindeal", label: "Sir Lindeal", minLevel: 8, maxLevel: 8 },
  { slug: "tisella", label: "Tisella", minLevel: 12, maxLevel: 14 },
  { slug: "tizina", label: "Tizina", minLevel: 30, maxLevel: 30 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:lavastorm-mountains:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 148 complete: ${added} mob node(s) added for Lavastorm Mountains`);
