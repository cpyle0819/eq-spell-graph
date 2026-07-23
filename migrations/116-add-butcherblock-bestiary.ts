/**
 * Migration 116: add mob nodes for zone:butcherblock-mountains, per the `mob`
 * node type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Sourced from eqlwiki.com's Butcherblock Mountains NPC table, filtered to
 * rows confirmed as hostile combat targets against the page's own
 * per-entry description text. Excludes named dwarven merchants/guards
 * (e.g. Alga Bruntbuckler, Alun Bilgum, Durkis Battlemore) and non-creature
 * rows (A Boat, Captains skiff) that share the table with real mobs.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:butcherblock-mountains";

const MOBS = [
  { slug: "decaying-dwarf-skeleton", label: "A Decaying Dwarf Skeleton", minLevel: 1, maxLevel: 1 },
  { slug: "dwarf-skeleton", label: "A Dwarf Skeleton", minLevel: 5, maxLevel: 7 },
  { slug: "dwarven-bandit", label: "A Dwarven Bandit", minLevel: 4, maxLevel: 7 },
  { slug: "giant-scarab", label: "A Giant Scarab", minLevel: 7, maxLevel: 11 },
  { slug: "goblin", label: "A Goblin", minLevel: 4, maxLevel: 28 },
  { slug: "goblin-shaman", label: "A Goblin Shaman", minLevel: 9, maxLevel: 10 },
  { slug: "goblin-warrior", label: "A Goblin Warrior", minLevel: 4, maxLevel: 10 },
  { slug: "goblin-whelp", label: "A Goblin Whelp", minLevel: 1, maxLevel: 1 },
  { slug: "goblin-wizard", label: "A Goblin Wizard", minLevel: 11, maxLevel: 11 },
  { slug: "greedy-beggar", label: "A Greedy Beggar", minLevel: 1, maxLevel: 1 },
  { slug: "krag-chick", label: "A Krag Chick", minLevel: 4, maxLevel: 4 },
  { slug: "krag-elder", label: "A Krag Elder", minLevel: 13, maxLevel: 13 },
  { slug: "large-skunk", label: "A Large Skunk", minLevel: 2, maxLevel: 2 },
  { slug: "rock-spiderling", label: "A Rock Spiderling", minLevel: 2, maxLevel: 2 },
  { slug: "bat", label: "A Bat", minLevel: 1, maxLevel: 1 },
  { slug: "crazed-goblin", label: "A Crazed Goblin", minLevel: 28, maxLevel: 30 },
  { slug: "giant-bat", label: "A Giant Bat", minLevel: 5, maxLevel: 7 },
  { slug: "goblin-grunt", label: "A Goblin Grunt", minLevel: 2, maxLevel: 4 },
  { slug: "large-snake", label: "A Large Snake", minLevel: 3, maxLevel: 5 },
  { slug: "large-spider", label: "A Large Spider", minLevel: 2, maxLevel: 4 },
  { slug: "lowland-basilisk", label: "A Lowland Basilisk", minLevel: 7, maxLevel: 11 },
  { slug: "skunk", label: "A Skunk", minLevel: 2, maxLevel: 2 },
  { slug: "snake", label: "A Snake", minLevel: 1, maxLevel: 1 },
  { slug: "worker-scarab", label: "A Worker Scarab", minLevel: 2, maxLevel: 2 },
  { slug: "aqua-goblin", label: "An Aqua Goblin", minLevel: 9, maxLevel: 11 },
  { slug: "aqua-goblin-shaman", label: "An Aqua Goblin Shaman", minLevel: 9, maxLevel: 11 },
  { slug: "enraged-goblin", label: "An Enraged Goblin", minLevel: 14, maxLevel: 15 },
  { slug: "orc-scoutsman", label: "An Orc Scoutsman", minLevel: 11, maxLevel: 11 },
  { slug: "aqua-goblin-wizard", label: "An Aqua Goblin Wizard", minLevel: 14, maxLevel: 17 },
  { slug: "aviak-chick", label: "An Aviak Chick", minLevel: 4, maxLevel: 4 },
  { slug: "emerald-drake", label: "An Emerald Drake", minLevel: 8, maxLevel: 14 },
  { slug: "undead-bishop", label: "An Undead Bishop", minLevel: 10, maxLevel: 10 },
  { slug: "undead-king", label: "An Undead King", minLevel: 15, maxLevel: 15 },
  { slug: "undead-knight", label: "An Undead Knight", minLevel: 11, maxLevel: 11 },
  { slug: "undead-pawn", label: "An Undead Pawn", minLevel: 9, maxLevel: 12 },
  { slug: "undead-rook", label: "An Undead Rook", minLevel: 9, maxLevel: 9 },
  { slug: "aqua-goblin-marauder", label: "Aqua Goblin Marauder", minLevel: 7, maxLevel: 7 },
  { slug: "barma-dunfire", label: "Barma Dunfire", minLevel: 11, maxLevel: 11 },
  { slug: "blyle-bundin", label: "Blyle Bundin", minLevel: 7, maxLevel: 7 },
  { slug: "corflunk", label: "Corflunk", minLevel: 7, maxLevel: 7 },
  { slug: "crytil-dunfire", label: "Crytil Dunfire", minLevel: 9, maxLevel: 11 },
  { slug: "dalbar-tarbrind", label: "Dalbar Tarbrind", minLevel: 35, maxLevel: 35 },
  { slug: "deldryn-splendyr", label: "Deldryn Splendyr", minLevel: 25, maxLevel: 25 },
  { slug: "glubbsink", label: "Glubbsink", minLevel: 15, maxLevel: 15 },
  { slug: "glynda-smeltpot", label: "Glynda Smeltpot", minLevel: 11, maxLevel: 11 },
  { slug: "glynn-smeltpot", label: "Glynn Smeltpot", minLevel: 9, maxLevel: 10 },
  { slug: "gundl", label: "Gundl", minLevel: 9, maxLevel: 11 },
  { slug: "happ-findlefinn", label: "Happ Findlefinn", minLevel: 35, maxLevel: 35 },
  { slug: "kandin-firepot", label: "Kandin Firepot", minLevel: 54, maxLevel: 54 },
  { slug: "kanthuk-ogrebane", label: "Kanthuk Ogrebane", minLevel: 23, maxLevel: 23 },
  { slug: "keldyn-dunfire", label: "Keldyn Dunfire", minLevel: 7, maxLevel: 8 },
  { slug: "lann-dabldrin", label: "Lann Dabldrin", minLevel: 35, maxLevel: 35 },
  { slug: "magnus-boran", label: "Magnus Boran", minLevel: 35, maxLevel: 35 },
  { slug: "margyl-darklin", label: "Margyl Darklin", minLevel: 8, maxLevel: 11 },
  { slug: "nyzil-bloodforge", label: "Nyzil Bloodforge", minLevel: 45, maxLevel: 45 },
  { slug: "orc-centurion", label: "Orc Centurion", minLevel: 3, maxLevel: 10 },
  { slug: "orc-oracle", label: "Orc Oracle", minLevel: 9, maxLevel: 9 },
  { slug: "orc-runner", label: "Orc Runner", minLevel: 7, maxLevel: 7 },
  { slug: "peg-leg", label: "Peg Leg", minLevel: 13, maxLevel: 15 },
  { slug: "qued", label: "Qued", minLevel: 9, maxLevel: 9 },
  { slug: "renell-bekea", label: "Renell Bekea", minLevel: 65, maxLevel: 65 },
  { slug: "signus-boran", label: "Signus Boran", minLevel: 35, maxLevel: 35 },
  { slug: "siltria-marwind", label: "Siltria Marwind", minLevel: 25, maxLevel: 25 },
  { slug: "stump-rundl", label: "Stump Rundl", minLevel: 11, maxLevel: 13 },
  { slug: "tagnis-ginfarr", label: "Tagnis Ginfarr", minLevel: 35, maxLevel: 35 },
  { slug: "thar-kelgand", label: "Thar Kelgand", minLevel: 35, maxLevel: 35 },
  { slug: "walnan", label: "Walnan", minLevel: 47, maxLevel: 47 },
  { slug: "zarchoomi", label: "Zarchoomi", minLevel: 10, maxLevel: 10 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:butcherblock-mountains:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 116 complete: ${added} mob node(s) added for Butcherblock Mountains`);
