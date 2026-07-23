/**
 * Migration 146: add mob nodes for zone:dagnor-s-cauldron, per the `mob`
 * node type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Same sourcing method as migration 145 (Cobalt Scar): eqlwiki.com's
 * Dagnor's Cauldron page has no per-creature level table, so each entry is
 * sourced from that creature's own page under Category:Dagnor's Cauldron
 * carrying the {{Namedmobpage}} template, using its `level` field. The
 * page's "Types of Monsters" list also names "Aqua Goblin Shamans", but no
 * page for that creature exists in the category with a stated level, so
 * it's excluded rather than guessed.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:dagnor-s-cauldron";

const MOBS = [
  { slug: "cauldron-rat", label: "A Cauldron Rat", minLevel: 5, maxLevel: 5 },
  { slug: "sandbar-serpent", label: "A Sandbar Serpent", minLevel: 14, maxLevel: 16 },
  { slug: "scalded-rat", label: "A Scalded Rat", minLevel: 8, maxLevel: 8 },
  { slug: "shoal-serpent", label: "A Shoal Serpent", minLevel: 8, maxLevel: 8 },
  { slug: "orc-scout", label: "An Orc Scout", minLevel: 10, maxLevel: 18 },
  { slug: "undertow-skeleton", label: "An Undertow Skeleton", minLevel: 13, maxLevel: 13 },
  { slug: "aqua-goblin-bosun", label: "Aqua Goblin Bosun", minLevel: 17, maxLevel: 19 },
  { slug: "aqua-goblin-mariner", label: "Aqua Goblin Mariner", minLevel: 13, maxLevel: 13 },
  { slug: "aqua-goblin-tidal-lord", label: "Aqua Goblin Tidal Lord", minLevel: 22, maxLevel: 24 },
  { slug: "barnacle-bones", label: "Barnacle Bones", minLevel: 16, maxLevel: 16 },
  { slug: "bilge-farfathom", label: "Bilge Farfathom", minLevel: 30, maxLevel: 30 },
  { slug: "captain-klunga", label: "Captain Klunga", minLevel: 35, maxLevel: 35 },
  { slug: "dwigus-lowater", label: "Dwigus Lowater", minLevel: 36, maxLevel: 36 },
  { slug: "elmion-hendrys", label: "Elmion Hendrys", minLevel: 31, maxLevel: 31 },
  { slug: "exiled-legionnaire", label: "An Exiled Legionnaire", minLevel: 20, maxLevel: 20 },
  { slug: "flotsam", label: "Flotsam", minLevel: 10, maxLevel: 10 },
  { slug: "ghilanbiddle-nylwadil", label: "Ghilanbiddle Nylwadil", minLevel: 29, maxLevel: 29 },
  { slug: "gundalthur-izuran", label: "Gundalthur Izuran", minLevel: 42, maxLevel: 42 },
  { slug: "jetsam", label: "Jetsam", minLevel: 12, maxLevel: 12 },
  { slug: "jinalis-andir", label: "Jinalis Andir", minLevel: 61, maxLevel: 61 },
  { slug: "llara", label: "Llara", minLevel: 32, maxLevel: 33 },
  { slug: "nyrien-lyrdarniel", label: "Nyrien Lyrdarniel", minLevel: 20, maxLevel: 20 },
  { slug: "sigan-ilbirkun", label: "Sigan Ilbirkun", minLevel: 33, maxLevel: 33 },
  { slug: "squallslither", label: "Squallslither", minLevel: 14, maxLevel: 14 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:dagnor-s-cauldron:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 146 complete: ${added} mob node(s) added for Dagnor's Cauldron`);
