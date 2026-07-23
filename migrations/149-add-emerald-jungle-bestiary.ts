/**
 * Migration 149: add mob nodes for zone:emerald-jungle, per the `mob` node
 * type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Same sourcing method as migration 145-148: each entry is sourced from
 * that creature's own page under Category:Emerald Jungle carrying the
 * {{Namedmobpage}} template, using its `level` field. Two creatures in the
 * category -- "a moldering gorilla" and "A Tatterback Ape" -- state their
 * own `zone` as Burning Woods only (despite both being named in Emerald
 * Jungle's "Types of Monsters" prose list), so they're excluded here and
 * left to Burning Wood's own bestiary; "Moldering Ape" is a separate page
 * whose zone field is Emerald Jungle and is included. "Errolisi bloodthorn"
 * is a duplicate page of "Erollisi Bloodthorn" (identical name/level/zone)
 * -- folded into one entry.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:emerald-jungle";

const MOBS = [
  { slug: "frenzied-ape", label: "A Frenzied Ape", minLevel: 36, maxLevel: 39 },
  { slug: "frenzied-gorilla", label: "A Frenzied Gorilla", minLevel: 31, maxLevel: 39 },
  { slug: "frenzied-leech", label: "A Frenzied Leech", minLevel: 31, maxLevel: 34 },
  { slug: "frenzied-tiger", label: "A Frenzied Tiger", minLevel: 31, maxLevel: 38 },
  { slug: "giant-frenzied-leech", label: "A Giant Frenzied Leech", minLevel: 36, maxLevel: 40 },
  { slug: "huge-gorilla", label: "A Huge Gorilla", minLevel: 40, maxLevel: 40 },
  { slug: "raging-gorilla", label: "A Raging Gorilla", minLevel: 35, maxLevel: 39 },
  { slug: "raging-tiger", label: "A Raging Tiger", minLevel: 38, maxLevel: 38 },
  { slug: "soulsipper", label: "A Soulsipper", minLevel: 39, maxLevel: 39 },
  { slug: "tottering-gorilla", label: "A Tottering Gorilla", minLevel: 37, maxLevel: 41 },
  { slug: "trakanasaur", label: "A Trakanasaur", minLevel: 32, maxLevel: 35 },
  { slug: "trakaraptor", label: "A Trakaraptor", minLevel: 36, maxLevel: 40 },
  { slug: "iksar-abductor", label: "An Iksar Abductor", minLevel: 35, maxLevel: 35 },
  { slug: "iksar-anchoret", label: "An Iksar Anchoret", minLevel: 34, maxLevel: 34 },
  { slug: "iksar-anchorite", label: "An Iksar Anchorite", minLevel: 37, maxLevel: 37 },
  { slug: "iksar-picaroon", label: "An Iksar Picaroon", minLevel: 34, maxLevel: 34 },
  { slug: "iksar-tomb-raider", label: "An Iksar Tomb Raider", minLevel: 35, maxLevel: 35 },
  { slug: "corrupted-gorilla", label: "Corrupted Gorilla", minLevel: 47, maxLevel: 47 },
  { slug: "emerald-stalker", label: "Emerald Stalker", minLevel: 30, maxLevel: 33 },
  { slug: "engorged-soulsipper", label: "Engorged Soulsipper", minLevel: 38, maxLevel: 38 },
  { slug: "erollisi-bloodthorn", label: "Erollisi Bloodthorn", minLevel: 40, maxLevel: 41 },
  { slug: "erollisi-mantrap", label: "Erollisi Mantrap", minLevel: 33, maxLevel: 33 },
  { slug: "giant-scourgewing-mosquito", label: "Giant Scourgewing Mosquito", minLevel: 30, maxLevel: 32 },
  { slug: "greater-charbone", label: "Greater Charbone", minLevel: 32, maxLevel: 32 },
  { slug: "greater-plaguebone", label: "Greater Plaguebone", minLevel: 39, maxLevel: 43 },
  { slug: "greater-spurbone", label: "Greater Spurbone", minLevel: 36, maxLevel: 40 },
  { slug: "moldering-ape", label: "Moldering Ape", minLevel: 35, maxLevel: 35 },
  { slug: "severilous", label: "Severilous", minLevel: 60, maxLevel: 60 },
  { slug: "spirit-sentinel", label: "Spirit Sentinel", minLevel: 65, maxLevel: 65 },
  { slug: "spurbone-skeleton", label: "Spurbone Skeleton", minLevel: 31, maxLevel: 34 },
  { slug: "tainted-gorilla", label: "Tainted Gorilla", minLevel: 39, maxLevel: 41 },
  { slug: "totem-fiendling", label: "Totem Fiendling", minLevel: 39, maxLevel: 39 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:emerald-jungle:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 149 complete: ${added} mob node(s) added for Emerald Jungle`);
