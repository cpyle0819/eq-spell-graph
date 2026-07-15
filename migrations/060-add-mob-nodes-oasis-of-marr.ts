/**
 * Migration 060: add the `mob` node type, and the first real mob data --
 * Oasis of Marr's creature roster -- so Maps' Bestiary section (issue #28)
 * has something real to show instead of the placeholder mock data it
 * shipped with. See decisions/mob-node-type.md for the node shape and why
 * `located_in` (not a new edge type) links a mob to its zone.
 *
 * Confirmed directly against eqlwiki.com's Oasis of Marr page (not classic
 * EQ / P1999 -- Oasis of Marr isn't in the migration-015 dungeon exception
 * list, so it follows the default eqlwiki.com-only sourcing rule, CLAUDE.md).
 *
 * The wiki's own "NPC table" for this zone mixes real hostile creatures with
 * friendly townsfolk (Qeynos Citizen innkeeps/merchants) and quest NPCs
 * (Taldrik Stumpystout, a Brell Serilis Symbol quest giver) -- a leveled row
 * isn't automatically a mob. Every row below was checked individually
 * against the page's own text (spawn coordinates / loot / "carries a
 * fishing pole, for [quest]"-style notes, not just presence in the table) to
 * confirm it's a real hostile encounter before inclusion. Excluded:
 * Gadallion, Innkeep Marnan, Innkeep Tizzy, Isslana, Synthan, Transan (all
 * "Qeynos Citizen" merchants/innkeeps), Taldrik Stumpystout (quest giver).
 * Creatures with no level at all (Dune Tarantulas, Dry Bone Skeletons, Sand
 * Scarabs, Dervishes, Desert Madmen, Lesser/Shriveled Mummies, generic "Orc
 * Warriors") are also left out rather than guessed -- there's nothing to
 * verify a level against for those.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

function hasNode(id: string): boolean {
  return graph.nodes.some((n: { data: { id: string } }) => n.data.id === id);
}

function hasEdge(source: string, target: string, type: string): boolean {
  return graph.edges.some(
    (e: { data: { source: string; target: string; type: string } }) =>
      e.data.source === source && e.data.target === target && e.data.type === type
  );
}

function addEdge(source: string, target: string, type: string) {
  if (hasEdge(source, target, type)) return;
  graph.edges.push({ data: { id: `e-${type}-${graph.edges.length + 1}`, source, target, type } });
}

const ZONE_ID = "zone:oasis-of-marr";

const MOBS = [
  // Common/roaming trash mobs -- generic "a/an <name>" wiki entries, no
  // individual identity.
  { slug: "asp", label: "Asp", minLevel: 10, maxLevel: 10 },
  { slug: "cistern-asp", label: "Cistern Asp", minLevel: 9, maxLevel: 13 },
  { slug: "puma", label: "Puma", minLevel: 5, maxLevel: 10 },
  { slug: "crypt-mummy", label: "Crypt Mummy", minLevel: 13, maxLevel: 15 },
  { slug: "ghoul", label: "Ghoul", minLevel: 13, maxLevel: 17 },
  { slug: "young-ronin", label: "Young Ronin", minLevel: 13, maxLevel: 16 },
  { slug: "caiman", label: "Caiman", minLevel: 11, maxLevel: 13 },
  { slug: "crocodile", label: "Crocodile", minLevel: 13, maxLevel: 15 },
  { slug: "deepwater-caiman", label: "Deepwater Caiman", minLevel: 15, maxLevel: 17 },
  { slug: "deepwater-crocodile", label: "Deepwater Crocodile", minLevel: 17, maxLevel: 22 },
  // The wiki notes real level variation on this one ("some light blue to a
  // 52 mage others not") beyond the single 36 it states as the base --
  // stored as the one number actually given, not a guessed range.
  { slug: "deepwater-goblin", label: "Deepwater Goblin", minLevel: 36, maxLevel: 36 },
  { slug: "orc-priest", label: "Orc Priest", minLevel: 15, maxLevel: 15 },
  { slug: "sand-giant", label: "Sand Giant", minLevel: 33, maxLevel: 37 },
  { slug: "spectre", label: "Spectre", minLevel: 33, maxLevel: 37 },
  // Named/unique camp mobs -- individually identified on the wiki (spawn
  // coordinates, no article), not repeating trash spawns.
  { slug: "hurgo-felcind", label: "Hurgo Felcind", minLevel: 7, maxLevel: 7 },
  { slug: "mantrek-needlebender", label: "Mantrek Needlebender", minLevel: 7, maxLevel: 8 },
  { slug: "ranzall-netcaster", label: "Ranzall Netcaster", minLevel: 9, maxLevel: 9 },
  { slug: "hatar", label: "Hatar", minLevel: 21, maxLevel: 21 },
  { slug: "lockjaw", label: "Lockjaw", minLevel: 25, maxLevel: 25 },
  { slug: "cazel", label: "Cazel", minLevel: 51, maxLevel: 51 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:oasis-of-marr:${mob.slug}`;
  if (!hasNode(id)) {
    graph.nodes.push({
      data: { id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel },
    });
    added++;
  }
  addEdge(id, ZONE_ID, "located_in");
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log(`Migration 060 complete: ${added} mob node(s) added for Oasis of Marr`);
