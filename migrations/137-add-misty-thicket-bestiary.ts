/**
 * Migration 137: add mob nodes for zone:misty-thicket, per the `mob` node
 * type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Sourced from eqlwiki.com's Misty Thicket NPC table: generic trash plus
 * three named creatures with real loot/spawn framing (Mooto, Slaythe,
 * Gunrich). Excluded: Rivervale-citizen merchants wandering the zone, all
 * "Deputy" rows (guards, same convention as migration 122's Rivervale
 * exclusions), the zone's peaceful halfling druids and flavor NPCs
 * (Blixkin Entopop and his pet Ember, the two wall-tower halflings, Faano/
 * Joogl/Lil/Relia), and Fajio Knejo (a sentry on the "safe side" of the
 * wall, read as a guard rather than a creature).
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:misty-thicket";

const MOBS = [
  { slug: "bixie", label: "A Bixie", minLevel: 1, maxLevel: 5 },
  { slug: "bixie-drone", label: "A Bixie Drone", minLevel: 2, maxLevel: 2 },
  { slug: "black-bear", label: "A Black Bear", minLevel: 4, maxLevel: 5 },
  { slug: "black-wolf", label: "A Black Wolf", minLevel: 1, maxLevel: 1 },
  { slug: "fire-beetle", label: "A Fire Beetle", minLevel: 2, maxLevel: 2 },
  { slug: "giant-rat", label: "A Giant Rat", minLevel: 2, maxLevel: 4 },
  { slug: "giant-scarab", label: "A Giant Scarab", minLevel: 7, maxLevel: 11 },
  { slug: "giant-spider", label: "A Giant Spider", minLevel: 7, maxLevel: 9 },
  { slug: "goblin-shaman", label: "A Goblin Shaman", minLevel: 9, maxLevel: 10 },
  { slug: "goblin-warrior", label: "A Goblin Warrior", minLevel: 4, maxLevel: 10 },
  { slug: "goblin-whelp", label: "A Goblin Whelp", minLevel: 1, maxLevel: 1 },
  { slug: "goblin-worker", label: "A Goblin Worker", minLevel: 1, maxLevel: 1 },
  { slug: "klaknak-drone", label: "A Klaknak Drone", minLevel: 2, maxLevel: 2 },
  { slug: "large-rat", label: "A Large Rat", minLevel: 1, maxLevel: 1 },
  { slug: "lesser-mummy", label: "A Lesser Mummy", minLevel: 10, maxLevel: 12 },
  { slug: "moss-snake", label: "A Moss Snake", minLevel: 1, maxLevel: 1 },
  { slug: "spiderling", label: "A Spiderling", minLevel: 1, maxLevel: 4 },
  { slug: "young-kodiak", label: "A Young Kodiak", minLevel: 10, maxLevel: 10 },
  { slug: "zombie", label: "A Zombie", minLevel: 7, maxLevel: 10 },
  { slug: "bat", label: "A Bat", minLevel: 1, maxLevel: 1 },
  { slug: "bixie-queen", label: "A Bixie Queen", minLevel: 4, maxLevel: 5 },
  { slug: "diseased-rat", label: "A Diseased Rat", minLevel: 3, maxLevel: 5 },
  { slug: "dread-corpse", label: "A Dread Corpse", minLevel: 8, maxLevel: 10 },
  { slug: "giant-bat", label: "A Giant Bat", minLevel: 5, maxLevel: 7 },
  { slug: "giant-fruit-bat", label: "A Giant Fruit Bat", minLevel: 9, maxLevel: 9 },
  { slug: "giant-thicket-rat", label: "A Giant Thicket Rat", minLevel: 9, maxLevel: 9 },
  { slug: "giant-wasp", label: "A Giant Wasp", minLevel: 8, maxLevel: 10 },
  { slug: "goblin-alchemist", label: "A Goblin Alchemist", minLevel: 16, maxLevel: 21 },
  { slug: "klaknak-warrior", label: "A Klaknak Warrior", minLevel: 2, maxLevel: 2 },
  { slug: "large-bat", label: "A Large Bat", minLevel: 3, maxLevel: 5 },
  { slug: "large-thicket-rat", label: "A Large Thicket Rat", minLevel: 3, maxLevel: 3 },
  { slug: "large-wood-spider", label: "A Large Wood Spider", minLevel: 3, maxLevel: 5 },
  { slug: "shadow-wolf", label: "A Shadow Wolf", minLevel: 3, maxLevel: 5 },
  { slug: "skeleton", label: "A Skeleton", minLevel: 4, maxLevel: 18 },
  { slug: "orc-centurion", label: "Orc Centurion", minLevel: 3, maxLevel: 10 },
  { slug: "orc-legionnaire", label: "Orc Legionnaire", minLevel: 15, maxLevel: 15 },
  { slug: "orc-pawn", label: "Orc Pawn", minLevel: 1, maxLevel: 2 },
  { slug: "prince-klaknak", label: "Prince Klaknak", minLevel: 2, maxLevel: 2 },
  { slug: "princess-klaknak", label: "Princess Klaknak", minLevel: 2, maxLevel: 2 },
  { slug: "mooto", label: "Mooto", minLevel: 10, maxLevel: 11 },
  { slug: "slaythe", label: "Slaythe", minLevel: 20, maxLevel: 20 },
  { slug: "gunrich", label: "Gunrich", minLevel: 5, maxLevel: 5 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:misty-thicket:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 137 complete: ${added} mob node(s) added for Misty Thicket`);
