/**
 * Migration 173: add mob nodes for zone:gorge-of-king-xorbb, per the `mob`
 * node type from migration 060 (decisions/mob-node-type.md) -- see issue
 * #36.
 *
 * Sourced via the MediaWiki API technique
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md):
 * Category:Beholder's Maze's 57 pages narrowed to 20 {{Namedmobpage}}-tagged
 * candidates -- every one of them is either a "Types of Monsters" entry or
 * a "Notable NPC" on the zone's own page (goblins, muddites, minotaurs,
 * evil eyes, and their named bosses), a hostile wilderness zone with no
 * vendor/guard NPCs of its own to filter out. "An Evil Eye (Beholder's
 * Maze)" states level "18 - 20? (lt blue to lvl 27)" -- the hedge and the
 * extra "lt blue to 27" prose don't override the two clean numeric
 * endpoints already given, used as minLevel/maxLevel same as any other
 * stated range. "An Evil Eye Pet" has no stated level ("??") and is
 * excluded.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:gorge-of-king-xorbb";

const MOBS = [
  { slug: "lord-soptyvr", label: "Lord Soptyvr", minLevel: 30, maxLevel: 30 },
  { slug: "king-xorbb", label: "King Xorbb", minLevel: 35, maxLevel: 35 },
  { slug: "lord-sviir", label: "Lord Sviir", minLevel: 20, maxLevel: 20 },
  { slug: "lord-syrkl", label: "Lord Syrkl", minLevel: 20, maxLevel: 20 },
  { slug: "a-goblin-lookout", label: "A Goblin Lookout", minLevel: 8, maxLevel: 8 },
  { slug: "spinflint", label: "Spinflint", minLevel: 12, maxLevel: 12 },
  { slug: "yymp-the-infernal", label: "Yymp the Infernal", minLevel: 17, maxLevel: 19 },
  { slug: "a-chasm-minotaur", label: "A Chasm Minotaur", minLevel: 19, maxLevel: 20 },
  { slug: "a-goblin-sentry", label: "A Goblin Sentry", minLevel: 8, maxLevel: 10 },
  { slug: "diggs-duggun", label: "Diggs Duggun", minLevel: 61, maxLevel: 61 },
  { slug: "a-muddite-elder", label: "A Muddite Elder", minLevel: 15, maxLevel: 15 },
  { slug: "a-muddite-minor", label: "A Muddite Minor", minLevel: 10, maxLevel: 11 },
  { slug: "a-muddite-recordkeeper", label: "A Muddite Recordkeeper", minLevel: 10, maxLevel: 10 },
  { slug: "a-goblin-veteran", label: "A Goblin Veteran", minLevel: 12, maxLevel: 12 },
  { slug: "a-gorge-minotaur", label: "A Gorge Minotaur", minLevel: 15, maxLevel: 16 },
  { slug: "brahhm", label: "Brahhm", minLevel: 17, maxLevel: 17 },
  { slug: "qlei", label: "Qlei", minLevel: 18, maxLevel: 18 },
  { slug: "a-goblin-alchemist", label: "A Goblin Alchemist", minLevel: 16, maxLevel: 21 },
  { slug: "an-evil-eye", label: "An Evil Eye", minLevel: 18, maxLevel: 20 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:gorge-of-king-xorbb:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 173 complete: ${added} mob node(s) added for Gorge of King Xorbb`);
