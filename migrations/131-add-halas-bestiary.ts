/**
 * Migration 131: add mob nodes for zone:halas, per the `mob` node type
 * from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Halas is a peaceful barbarian hometown -- eqlwiki.com's NPC table for it
 * is almost entirely guildmasters, merchants, bankers, and guards. Only
 * two rows read as real creatures: the sled dogs kept at the Kennels, and
 * Elgar Donbrand, the one named NPC described with a spawn rate rather
 * than a shop/guild role.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:halas";

const MOBS = [
  { slug: "sled-dog", label: "A Sled Dog", minLevel: 3, maxLevel: 5 },
  { slug: "elgar-donbrand", label: "Elgar Donbrand", minLevel: 61, maxLevel: 61 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:halas:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 131 complete: ${added} mob node(s) added for Halas`);
