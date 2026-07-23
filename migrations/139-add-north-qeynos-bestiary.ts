/**
 * Migration 139: add mob nodes for zone:north-qeynos, per the `mob` node
 * type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Sourced from eqlwiki.com's North Qeynos NPC table: generic trash, the
 * Darkpaw gnoll clan that assaults the city gates, and Lylanthian (an
 * explicitly aggressive city sentry). Excluded: the zone's large roster of
 * merchants, guards, and guildmasters (GM Rogue/Bard/Monk/Wizard/Cleric),
 * and its many named quest-giver NPCs, none of which are combat targets.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:north-qeynos";

const MOBS = [
  { slug: "decaying-skeleton", label: "A Decaying Skeleton", minLevel: 1, maxLevel: 10 },
  { slug: "fire-beetle", label: "A Fire Beetle", minLevel: 2, maxLevel: 2 },
  { slug: "klicnik-drone", label: "A Klicnik Drone", minLevel: 2, maxLevel: 2 },
  { slug: "klicnik-worker", label: "A Klicnik Worker", minLevel: 2, maxLevel: 3 },
  { slug: "koalindl", label: "A Koalindl", minLevel: 1, maxLevel: 1 },
  { slug: "large-rat", label: "A Large Rat", minLevel: 1, maxLevel: 1 },
  { slug: "mangy-rat", label: "A Mangy Rat", minLevel: 1, maxLevel: 1 },
  { slug: "zombie", label: "A Zombie", minLevel: 7, maxLevel: 10 },
  { slug: "bat", label: "A Bat", minLevel: 1, maxLevel: 1 },
  { slug: "gnoll-pup", label: "A Gnoll Pup", minLevel: 1, maxLevel: 1 },
  { slug: "sewer-rat", label: "A Sewer Rat", minLevel: 1, maxLevel: 3 },
  { slug: "skeleton", label: "A Skeleton", minLevel: 4, maxLevel: 18 },
  { slug: "snake", label: "A Snake", minLevel: 1, maxLevel: 1 },
  { slug: "fippy-darkpaw", label: "Fippy Darkpaw", minLevel: 4, maxLevel: 4 },
  { slug: "djerr-darkpaw", label: "Djerr Darkpaw", minLevel: 4, maxLevel: 4 },
  { slug: "grarrax-darkpaw", label: "Grarrax Darkpaw", minLevel: 4, maxLevel: 4 },
  { slug: "holinix-darkpaw", label: "Holinix Darkpaw", minLevel: 4, maxLevel: 4 },
  { slug: "tranixx-darkpaw", label: "Tranixx Darkpaw", minLevel: 10, maxLevel: 10 },
  { slug: "lylanthian", label: "Lylanthian", minLevel: 25, maxLevel: 25 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:north-qeynos:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 139 complete: ${added} mob node(s) added for North Qeynos`);
