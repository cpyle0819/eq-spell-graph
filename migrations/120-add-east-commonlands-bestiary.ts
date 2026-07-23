/**
 * Migration 120: add mob nodes for zone:east-commonlands, per the `mob`
 * node type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Sourced from eqlwiki.com's East Commonlands NPC table, filtered to
 * generic hostile trash mobs and the zone's Deathfist orc camp, excluding
 * the zone's many named innkeeps, guards, and merchants (Bubar, Rinna
 * Lightshadow, Sergeant Slate, Guard Reskin/Tolus, etc.) which are
 * functional NPCs, not creatures a player fights.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:east-commonlands";

const MOBS = [
  { slug: "black-bear", label: "A Black Bear", minLevel: 4, maxLevel: 5 },
  { slug: "black-wolf", label: "A Black Wolf", minLevel: 1, maxLevel: 1 },
  { slug: "darkweed-snake", label: "A Darkweed Snake", minLevel: 8, maxLevel: 10 },
  { slug: "decaying-skeleton", label: "A Decaying Skeleton", minLevel: 1, maxLevel: 10 },
  { slug: "fire-beetle", label: "A Fire Beetle", minLevel: 2, maxLevel: 2 },
  { slug: "giant-spider", label: "A Giant Spider", minLevel: 7, maxLevel: 9 },
  { slug: "griffin", label: "A Griffin", minLevel: 36, maxLevel: 36 },
  { slug: "kodiak", label: "A Kodiak", minLevel: 14, maxLevel: 15 },
  { slug: "lesser-mummy", label: "A Lesser Mummy", minLevel: 10, maxLevel: 12 },
  { slug: "moss-snake", label: "A Moss Snake", minLevel: 1, maxLevel: 1 },
  { slug: "plains-cat", label: "A Plains Cat", minLevel: 6, maxLevel: 6 },
  { slug: "puma", label: "A Puma", minLevel: 5, maxLevel: 10 },
  { slug: "willowisp", label: "A Willowisp", minLevel: 9, maxLevel: 11 },
  { slug: "young-kodiak", label: "A Young Kodiak", minLevel: 10, maxLevel: 10 },
  { slug: "young-plains-cat", label: "A Young Plains Cat", minLevel: 3, maxLevel: 5 },
  { slug: "ghoul", label: "A Ghoul", minLevel: 13, maxLevel: 17 },
  { slug: "rattlesnake", label: "A Rattlesnake", minLevel: 3, maxLevel: 7 },
  { slug: "skeleton", label: "A Skeleton", minLevel: 4, maxLevel: 18 },
  { slug: "asp", label: "An Asp", minLevel: 10, maxLevel: 10 },
  { slug: "orc-centurion", label: "Orc Centurion (Deathfist)", minLevel: 3, maxLevel: 10 },
  { slug: "orc-legionnaire", label: "Orc Legionnaire (Deathfist)", minLevel: 15, maxLevel: 15 },
  { slug: "orc-oracle", label: "Orc Oracle (Deathfist)", minLevel: 9, maxLevel: 9 },
  { slug: "orc-pawn", label: "Orc Pawn (Deathfist)", minLevel: 1, maxLevel: 2 },
  { slug: "orc-weaponsmith", label: "Orc Weaponsmith", minLevel: 9, maxLevel: 9 },
  { slug: "lord-shin-ree", label: "Lord Shin Ree", minLevel: 17, maxLevel: 22 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:east-commonlands:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 120 complete: ${added} mob node(s) added for East Commonlands`);
