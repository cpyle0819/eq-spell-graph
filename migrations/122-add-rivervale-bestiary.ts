/**
 * Migration 122: add mob nodes for zone:rivervale, per the `mob` node type
 * from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Rivervale is a peaceful halfling hometown zone -- eqlwiki.com's NPC table
 * for it is almost entirely deputies (guards), innkeeps, guildmasters, and
 * merchants. Only a handful of rows are actual hostile creatures; everything
 * else is excluded as a functional NPC per the issue's bestiary definition.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:rivervale";

const MOBS = [
  { slug: "large-piranha", label: "A Large Piranha", minLevel: 6, maxLevel: 6 },
  { slug: "trout", label: "A Trout", minLevel: 1, maxLevel: 1 },
  { slug: "chomper", label: "Chomper", minLevel: 3, maxLevel: 3 },
  { slug: "mangler", label: "Mangler", minLevel: 2, maxLevel: 2 },
  { slug: "nillipuss", label: "Nillipuss", minLevel: 17, maxLevel: 17 },
  { slug: "shakey-scarecrow", label: "Shakey Scarecrow", minLevel: 30, maxLevel: 30 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:rivervale:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 122 complete: ${added} mob node(s) added for Rivervale`);
