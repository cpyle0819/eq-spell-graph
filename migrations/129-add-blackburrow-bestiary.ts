/**
 * Migration 129: add mob nodes for zone:blackburrow, per the `mob` node
 * type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Sourced from eqlwiki.com's Blackburrow NPC table. Like Befallen, this is
 * a pure dungeon with no vendors/guards of its own -- every row is a
 * hostile creature (gnolls throughout, plus a handful of generic animals),
 * so nothing was excluded as a functional NPC.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:blackburrow";

const MOBS = [
  { slug: "burly-gnoll", label: "A Burly Gnoll", minLevel: 7, maxLevel: 9 },
  { slug: "giant-snake", label: "A Giant Snake", minLevel: 7, maxLevel: 9 },
  { slug: "gnoll", label: "A Gnoll", minLevel: 5, maxLevel: 7 },
  { slug: "gnoll-brewer", label: "A Gnoll Brewer", minLevel: 17, maxLevel: 17 },
  { slug: "gnoll-commander", label: "A Gnoll Commander", minLevel: 13, maxLevel: 15 },
  { slug: "gnoll-guardsman", label: "A Gnoll Guardsman", minLevel: 5, maxLevel: 15 },
  { slug: "gnoll-tactician", label: "A Gnoll Tactician", minLevel: 13, maxLevel: 15 },
  { slug: "grizzly-bear", label: "A Grizzly Bear", minLevel: 9, maxLevel: 11 },
  { slug: "patrolling-gnoll", label: "A Patrolling Gnoll", minLevel: 5, maxLevel: 7 },
  { slug: "razorgill", label: "A Razorgill", minLevel: 4, maxLevel: 8 },
  { slug: "scrawny-gnoll", label: "A Scrawny Gnoll", minLevel: 3, maxLevel: 5 },
  { slug: "giant-plague-rat", label: "A Giant Plague Rat", minLevel: 10, maxLevel: 10 },
  { slug: "gnoll-pup", label: "A Gnoll Pup", minLevel: 1, maxLevel: 1 },
  { slug: "gnoll-shaman", label: "A Gnoll Shaman", minLevel: 7, maxLevel: 11 },
  { slug: "elite-gnoll-guard", label: "An Elite Gnoll Guard", minLevel: 11, maxLevel: 13 },
  { slug: "lord-elgnub", label: "Lord Elgnub", minLevel: 22, maxLevel: 22 },
  { slug: "mannan-of-the-sabertooth", label: "Mannan of the Sabertooth", minLevel: 15, maxLevel: 15 },
  { slug: "master-brewer", label: "Master Brewer", minLevel: 18, maxLevel: 18 },
  { slug: "refugee-splitpaw", label: "Refugee Splitpaw", minLevel: 14, maxLevel: 14 },
  { slug: "refugee-splitpaw-monk", label: "Refugee Splitpaw (Monk)", minLevel: 18, maxLevel: 18 },
  { slug: "sabertooth-clan-necromancer", label: "Sabertooth Clan Necromancer", minLevel: 15, maxLevel: 15 },
  { slug: "sabertooth-overseer", label: "Sabertooth Overseer", minLevel: 20, maxLevel: 20 },
  { slug: "socho-darkpaw", label: "Socho Darkpaw", minLevel: 13, maxLevel: 13 },
  { slug: "splitpaw-commander", label: "Splitpaw Commander", minLevel: 14, maxLevel: 14 },
  { slug: "splitpaw-explorer", label: "Splitpaw Explorer", minLevel: 18, maxLevel: 18 },
  { slug: "splitpaw-sentry", label: "Splitpaw Sentry", minLevel: 10, maxLevel: 10 },
  { slug: "splitpaw-sharpshooter", label: "Splitpaw Sharpshooter", minLevel: 20, maxLevel: 20 },
  { slug: "gnoll-high-shaman", label: "The Gnoll High Shaman", minLevel: 15, maxLevel: 15 },
  { slug: "tranixx-darkpaw", label: "Tranixx Darkpaw", minLevel: 10, maxLevel: 10 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:blackburrow:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 129 complete: ${added} mob node(s) added for Blackburrow`);
