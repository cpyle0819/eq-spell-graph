/**
 * Migration 152: add mob nodes for zone:burning-wood, per the `mob` node
 * type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Same sourcing method as migrations 145-149: each entry is sourced from
 * that creature's own page under eqlwiki.com's Category:Burning Woods
 * (the wiki's page/category title predates the singular `zone:burning-wood`
 * reconciliation) carrying the {{Namedmobpage}} combat-stats template, using
 * its `level` field. "A Tump Stump" turned up in the category but is an
 * item page, not a mob, and is excluded. "A Tatterback Ape" and "A moldering
 * gorilla" state Burning Woods as their only zone despite also being named
 * in Emerald Jungle's "Types of Monsters" prose list -- migration 149 left
 * both to this zone's bestiary instead, per its own docblock.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:burning-wood";

const MOBS = [
  { slug: "cinder-hornet", label: "A Cinder Hornet", minLevel: 37, maxLevel: 39 },
  { slug: "forest-giant-ancient", label: "A Forest Giant Ancient", minLevel: 42, maxLevel: 46 },
  { slug: "forest-giant-verdant", label: "A Forest Giant Verdant", minLevel: 38, maxLevel: 42 },
  { slug: "moldering-gorilla", label: "A Moldering Gorilla", minLevel: 37, maxLevel: 41 },
  { slug: "sarnak-avenger", label: "A Sarnak Avenger", minLevel: 41, maxLevel: 45 },
  { slug: "sarnak-champion", label: "A Sarnak Champion", minLevel: 37, maxLevel: 41 },
  { slug: "sarnak-enthusiast", label: "A Sarnak Enthusiast", minLevel: 36, maxLevel: 36 },
  { slug: "sarnak-extremist", label: "A Sarnak Extremist", minLevel: 38, maxLevel: 38 },
  { slug: "sarnak-imitator", label: "A Sarnak Imitator", minLevel: 55, maxLevel: 55 },
  { slug: "sarnak-knight", label: "A Sarnak Knight", minLevel: 33, maxLevel: 37 },
  { slug: "sarnak-zealot", label: "A Sarnak Zealot", minLevel: 41, maxLevel: 45 },
  { slug: "scoriae-hornet", label: "A Scoriae Hornet", minLevel: 44, maxLevel: 46 },
  { slug: "tatterback-ape", label: "A Tatterback Ape", minLevel: 34, maxLevel: 34 },
  { slug: "tatterback-gorilla", label: "A Tatterback Gorilla", minLevel: 44, maxLevel: 47 },
  { slug: "tottering-gorilla", label: "A Tottering Gorilla", minLevel: 37, maxLevel: 41 },
  { slug: "wurm", label: "A Wurm", minLevel: 40, maxLevel: 44 },
  { slug: "ash-hornet", label: "An Ash Hornet", minLevel: 37, maxLevel: 37 },
  { slug: "ember-hornet", label: "An Ember Hornet", minLevel: 42, maxLevel: 42 },
  { slug: "greater-barbed-skeleton", label: "Greater Barbed Skeleton", minLevel: 36, maxLevel: 40 },
  { slug: "greater-plague-skeleton", label: "Greater Plague Skeleton", minLevel: 40, maxLevel: 40 },
  { slug: "greater-war-boned-skeleton", label: "Greater War Boned Skeleton", minLevel: 42, maxLevel: 49 },
  { slug: "gullerback", label: "Gullerback", minLevel: 47, maxLevel: 51 },
  { slug: "plague-bone-skeleton", label: "Plague Bone Skeleton", minLevel: 33, maxLevel: 37 },
  { slug: "azdalin", label: "Azdalin", minLevel: 42, maxLevel: 42 },
  { slug: "carpenter-grundo", label: "Carpenter Grundo", minLevel: 47, maxLevel: 47 },
  { slug: "entalon", label: "Entalon", minLevel: 41, maxLevel: 41 },
  { slug: "gorgul-paclock", label: "Gorgul Paclock", minLevel: 46, maxLevel: 50 },
  { slug: "gylton", label: "Gylton", minLevel: 41, maxLevel: 41 },
  { slug: "ixiblat-fer", label: "Ixiblat Fer", minLevel: 62, maxLevel: 62 },
  { slug: "korasal-klyseer", label: "Korasal Klyseer", minLevel: 47, maxLevel: 48 },
  { slug: "naxot-deepwater", label: "Naxot Deepwater", minLevel: 20, maxLevel: 20 },
  { slug: "nezekezena", label: "Nezekezena", minLevel: 51, maxLevel: 51 },
  { slug: "phurzikon", label: "Phurzikon", minLevel: 47, maxLevel: 47 },
  { slug: "slixin-klex", label: "Slixin Klex", minLevel: 50, maxLevel: 50 },
  { slug: "telin-darkforest", label: "Telin Darkforest", minLevel: 55, maxLevel: 55 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:burning-wood:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 152 complete: ${added} mob node(s) added for Burning Wood`);
