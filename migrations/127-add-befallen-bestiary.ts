/**
 * Migration 127: add mob nodes for zone:befallen, per the `mob` node type
 * from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Sourced from eqlwiki.com's Befallen NPC table. Unlike most zones, every
 * row here is a hostile creature (an undead/shadowknight dungeon with no
 * vendors or guards of its own) -- nothing was excluded as a functional
 * NPC. Where the wiki gave a creature two overlapping level bands (it
 * reuses several generic skeleton/rat names across many zones, each with
 * its own stated range), the wider of the two is kept.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:befallen";

const MOBS = [
  { slug: "dread-bone", label: "A Dread Bone", minLevel: 8, maxLevel: 10 },
  { slug: "giant-rat", label: "A Giant Rat", minLevel: 2, maxLevel: 4 },
  { slug: "greater-skeleton", label: "A Greater Skeleton", minLevel: 7, maxLevel: 20 },
  { slug: "lesser-mummy", label: "A Lesser Mummy", minLevel: 10, maxLevel: 12 },
  { slug: "necro-theurgist", label: "A Necro Theurgist", minLevel: 16, maxLevel: 17 },
  { slug: "putrid-skeleton", label: "A Putrid Skeleton", minLevel: 5, maxLevel: 12 },
  { slug: "teirdal-priestess", label: "A Teir`Dal Priestess", minLevel: 22, maxLevel: 25 },
  { slug: "teirdal-ranger", label: "A Teir`Dal Ranger", minLevel: 22, maxLevel: 25 },
  { slug: "teirdal-rogue", label: "A Teir`Dal Rogue", minLevel: 22, maxLevel: 25 },
  { slug: "teirdal-shadowknight", label: "A Teir`Dal Shadowknight", minLevel: 22, maxLevel: 25 },
  { slug: "willowisp", label: "A Willowisp", minLevel: 9, maxLevel: 11 },
  { slug: "zombie", label: "A Zombie", minLevel: 7, maxLevel: 10 },
  { slug: "ghoul", label: "A Ghoul", minLevel: 13, maxLevel: 17 },
  { slug: "large-skeleton", label: "A Large Skeleton", minLevel: 8, maxLevel: 10 },
  { slug: "necro-acolyte", label: "A Necro Acolyte", minLevel: 13, maxLevel: 15 },
  { slug: "necro-neophyte", label: "A Necro Neophyte", minLevel: 5, maxLevel: 6 },
  { slug: "plague-rat", label: "A Plague Rat", minLevel: 4, maxLevel: 6 },
  { slug: "shadowknight-dark-elf-female", label: "A Shadowknight (Dark Elf Female)", minLevel: 10, maxLevel: 14 },
  { slug: "shadowknight-dark-elf-male", label: "A Shadowknight (Dark Elf Male)", minLevel: 6, maxLevel: 9 },
  { slug: "shadowknight-human", label: "A Shadowknight (Human)", minLevel: 9, maxLevel: 11 },
  { slug: "shadowknight-ogre", label: "A Shadowknight (Ogre)", minLevel: 12, maxLevel: 13 },
  { slug: "shadowknight-troll", label: "A Shadowknight (Troll)", minLevel: 15, maxLevel: 15 },
  { slug: "skeleton", label: "A Skeleton", minLevel: 4, maxLevel: 18 },
  { slug: "elf-skeleton", label: "An Elf Skeleton", minLevel: 17, maxLevel: 18 },
  { slug: "arisen-thaumaturgist", label: "Arisen Thaumaturgist", minLevel: 20, maxLevel: 20 },
  { slug: "asaka-lrei", label: "Asaka L`Rei", minLevel: 16, maxLevel: 16 },
  { slug: "baron-telyx-vzher", label: "Baron Telyx V`Zher", minLevel: 28, maxLevel: 28 },
  { slug: "boondin-babbinsbort", label: "Boondin Babbinsbort", minLevel: 25, maxLevel: 25 },
  { slug: "cmdr-windstream", label: "Cmdr Windstream", minLevel: 26, maxLevel: 26 },
  { slug: "footman-of-vzher", label: "Footman of V`Zher", minLevel: 20, maxLevel: 20 },
  { slug: "gynok-moltor", label: "Gynok Moltor", minLevel: 24, maxLevel: 24 },
  { slug: "ice-boned-skeleton", label: "Ice Boned Skeleton", minLevel: 12, maxLevel: 14 },
  { slug: "kahaptra-ztaj", label: "Kahaptra Z`Taj", minLevel: 22, maxLevel: 22 },
  { slug: "knight-vtal", label: "Knight V`Tal", minLevel: 24, maxLevel: 24 },
  { slug: "korven-nisere", label: "Korven Nisere", minLevel: 24, maxLevel: 24 },
  { slug: "priest-amiaz", label: "Priest Amiaz", minLevel: 17, maxLevel: 17 },
  { slug: "skeleton-lrodd", label: "Skeleton L`rodd", minLevel: 11, maxLevel: 13 },
  { slug: "soldier-of-vzher", label: "Soldier of V`Zher", minLevel: 26, maxLevel: 26 },
  { slug: "the-thaumaturgist", label: "The Thaumaturgist", minLevel: 18, maxLevel: 19 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:befallen:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 127 complete: ${added} mob node(s) added for Befallen`);
