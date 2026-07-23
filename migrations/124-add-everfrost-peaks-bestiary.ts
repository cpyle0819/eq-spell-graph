/**
 * Migration 124: add mob nodes for zone:everfrost-peaks, per the `mob`
 * node type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Sourced from eqlwiki.com's Everfrost Peaks NPC table (including its Bear
 * Caves sub-area, folded in the same way migration 114 folded Ak'Anon's
 * Mines of Malfunction into that zone's bestiary), filtered against the
 * page's own per-entry text to exclude the zone's Halas-citizen "McMarrin"
 * family, Tundra Jack's companion cluster, and named vendors/quest givers
 * (Karg IceBear, Sulgar, Ristia, Trankia, Starn Bearjumper, etc.), none of
 * which are combat targets despite several sharing names with real mobs.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:everfrost-peaks";

const MOBS = [
  { slug: "decaying-skeleton", label: "A Decaying Skeleton", minLevel: 1, maxLevel: 10 },
  { slug: "glacier-bear", label: "A Glacier Bear", minLevel: 27, maxLevel: 27 },
  { slug: "polar-bear", label: "A Polar Bear", minLevel: 8, maxLevel: 8 },
  { slug: "polar-bear-cub", label: "A Polar Bear Cub", minLevel: 2, maxLevel: 2 },
  { slug: "snow-orc-shaman", label: "A Snow Orc Shaman", minLevel: 15, maxLevel: 15 },
  { slug: "snow-orc-trooper", label: "A Snow Orc Trooper", minLevel: 7, maxLevel: 9 },
  { slug: "wooly-mammoth-calf", label: "A Wooly Mammoth Calf", minLevel: 12, maxLevel: 12 },
  { slug: "wooly-spiderling", label: "A Wooly Spiderling", minLevel: 1, maxLevel: 3 },
  { slug: "giant-wooly-spider", label: "A Giant Wooly Spider", minLevel: 8, maxLevel: 8 },
  { slug: "gnoll-guard", label: "A Gnoll Guard", minLevel: 4, maxLevel: 4 },
  { slug: "gnoll-pup", label: "A Gnoll Pup", minLevel: 1, maxLevel: 1 },
  { slug: "goblin-caster", label: "A Goblin Caster", minLevel: 2, maxLevel: 4 },
  { slug: "large-wooly-spider", label: "A Large Wooly Spider", minLevel: 4, maxLevel: 4 },
  { slug: "mammoth-calf", label: "A Mammoth Calf", minLevel: 10, maxLevel: 14 },
  { slug: "scrawny-gnoll-guard", label: "A Scrawny Gnoll Guard", minLevel: 5, maxLevel: 5 },
  { slug: "snow-leopard", label: "A Snow Leopard", minLevel: 7, maxLevel: 7 },
  { slug: "white-wolf", label: "A White Wolf", minLevel: 2, maxLevel: 2 },
  { slug: "wooly-mammoth", label: "A Wooly Mammoth", minLevel: 22, maxLevel: 36 },
  { slug: "ice-giant", label: "An Ice Giant", minLevel: 38, maxLevel: 42 },
  { slug: "ice-goblin-whelp", label: "An Ice Goblin Whelp", minLevel: 1, maxLevel: 1 },
  { slug: "orcish-mountaineer", label: "An Orcish Mountaineer", minLevel: 13, maxLevel: 13 },
  { slug: "ice-goblin-scout", label: "An Ice Goblin Scout", minLevel: 3, maxLevel: 3 },
  { slug: "icy-orc", label: "An Icy Orc", minLevel: 24, maxLevel: 25 },
  { slug: "corrupted-wooly-mammoth", label: "Corrupted Wooly Mammoth", minLevel: 30, maxLevel: 30 },
  { slug: "goblin-diver", label: "Goblin Diver", minLevel: 3, maxLevel: 3 },
  { slug: "ice-goblin-diver", label: "Ice Goblin Diver", minLevel: 3, maxLevel: 3 },
  { slug: "goblin-lackey", label: "Goblin Lackey", minLevel: 22, maxLevel: 22 },
  { slug: "goblin-miner", label: "Goblin Miner", minLevel: 10, maxLevel: 10 },
  { slug: "ice-boned-skeleton", label: "Ice Boned Skeleton", minLevel: 12, maxLevel: 14 },
  { slug: "tainted-wooly-mammoth", label: "Tainted Wooly Mammoth", minLevel: 25, maxLevel: 29 },
  { slug: "vengeful-composer", label: "Vengeful Composer", minLevel: 8, maxLevel: 8 },
  { slug: "vengeful-lyricist", label: "Vengeful Lyricist", minLevel: 10, maxLevel: 10 },
  { slug: "vengeful-soloist", label: "Vengeful Soloist", minLevel: 12, maxLevel: 12 },
  { slug: "dark-assassin", label: "Dark Assassin", minLevel: 50, maxLevel: 50 },
  { slug: "eichvul", label: "Eichvul", minLevel: 22, maxLevel: 22 },
  { slug: "granin-ogill", label: "Granin O'Gill", minLevel: 3, maxLevel: 3 },
  { slug: "lich-of-miragul", label: "Lich of Miragul", minLevel: 45, maxLevel: 45 },
  { slug: "martar-icebear", label: "Martar IceBear", minLevel: 32, maxLevel: 32 },
  { slug: "miragul", label: "Miragul", minLevel: 53, maxLevel: 53 },
  { slug: "redwind", label: "Redwind", minLevel: 27, maxLevel: 27 },
  { slug: "sulon-mcmoor", label: "Sulon McMoor", minLevel: 61, maxLevel: 61 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:everfrost-peaks:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 124 complete: ${added} mob node(s) added for Everfrost Peaks`);
