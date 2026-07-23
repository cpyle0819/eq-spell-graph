/**
 * Migration 118: add mob nodes for zone:crushbone, per the `mob` node type
 * from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Sourced from eqlwiki.com's Crushbone NPC table, filtered to rows that are
 * hostile orcs and named combat encounters. Excludes the zone's captive
 * dwarven/elven slaves and the Elven Priest tied to them (prisoners, not
 * creatures a player fights) per the issue's bestiary definition.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:crushbone";

const MOBS = [
  { slug: "ambassador-dvinn", label: "Ambassador DVinn", minLevel: 20, maxLevel: 20 },
  { slug: "bloodgurgler", label: "Bloodgurgler", minLevel: 19, maxLevel: 19 },
  { slug: "bonefire", label: "Bonefire", minLevel: 18, maxLevel: 18 },
  { slug: "chokehold", label: "Chokehold", minLevel: 20, maxLevel: 20 },
  { slug: "emperor-crush", label: "Emperor Crush", minLevel: 18, maxLevel: 18 },
  { slug: "kelynn", label: "Kelynn", minLevel: 9, maxLevel: 9 },
  { slug: "lord-darish", label: "Lord Darish", minLevel: 14, maxLevel: 17 },
  { slug: "marrowbane", label: "Marrowbane", minLevel: 19, maxLevel: 21 },
  { slug: "orc-centurion", label: "Orc Centurion", minLevel: 3, maxLevel: 10 },
  { slug: "orc-emissary", label: "Orc Emissary", minLevel: 15, maxLevel: 15 },
  { slug: "orc-legionnaire", label: "Orc Legionnaire", minLevel: 12, maxLevel: 13 },
  { slug: "orc-oracle", label: "Orc Oracle", minLevel: 9, maxLevel: 9 },
  { slug: "orc-pawn", label: "Orc Pawn", minLevel: 1, maxLevel: 2 },
  { slug: "orc-slaver", label: "Orc Slaver", minLevel: 10, maxLevel: 12 },
  { slug: "orc-taskmaster", label: "Orc Taskmaster", minLevel: 12, maxLevel: 12 },
  { slug: "orc-trainer", label: "Orc Trainer", minLevel: 13, maxLevel: 13 },
  { slug: "orc-warden", label: "Orc Warden", minLevel: 15, maxLevel: 15 },
  { slug: "orc-warlord", label: "Orc Warlord", minLevel: 16, maxLevel: 16 },
  { slug: "orc-scoutsman", label: "Orc Scoutsman", minLevel: 12, maxLevel: 12 },
  { slug: "orc-thaumaturgist", label: "Orc Thaumaturgist", minLevel: 14, maxLevel: 16 },
  { slug: "retlon-brenclog", label: "Retlon Brenclog", minLevel: 16, maxLevel: 16 },
  { slug: "rondo-dunfire", label: "Rondo Dunfire", minLevel: 9, maxLevel: 9 },
  { slug: "royal-guard", label: "Royal Guard", minLevel: 15, maxLevel: 15 },
  { slug: "the-prophet", label: "The Prophet", minLevel: 17, maxLevel: 17 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:crushbone:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 118 complete: ${added} mob node(s) added for Crushbone`);
