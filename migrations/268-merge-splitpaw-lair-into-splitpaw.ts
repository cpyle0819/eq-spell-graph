/**
 * Migration 268: merge `zone:splitpaw-lair` into `zone:splitpaw` -- the same
 * naming-mismatch-duplicate-zone shape as Felwithe's old zone:felwithe/
 * zone:south-felwithe (migration 215), Neriak's zone:neriak (migration 232),
 * and Qeynos Aqueducts (migration 239), all documented in issue #36's own
 * comments. `zone:splitpaw` is the original, issue-#36-sourced node (30-mob
 * bestiary, 1 map, wiki_title "Splitpaw Lair" already recorded separately
 * from its own label, same split as Qeynos Catacombs/Aqueducts). Migration
 * 267 picked `zone:splitpaw-lair` by matching the leveling guide's own
 * "Splitpaw Lair" prose against zone *labels* without checking for an
 * existing zone sharing the same wiki_title under a different label --
 * this migration is the fix, not a redo of 267's item data.
 *
 * Moves 267's 3 item `located_in` edges plus 2 pre-existing quest
 * `located_in` edges onto `zone:splitpaw`, drops the duplicate
 * `connects_to` pair (zone:splitpaw already has its own identical two-way
 * edge to zone:southern-karana), then deletes `zone:splitpaw-lair`.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const SURVIVOR = "zone:splitpaw";
const DUPLICATE = "zone:splitpaw-lair";

let retargeted = 0;
let dropped = 0;
graph.edges = graph.edges.filter((e: any) => {
  if (e.data.type === "connects_to" && (e.data.source === DUPLICATE || e.data.target === DUPLICATE)) {
    dropped++;
    return false;
  }
  if (e.data.type === "located_in" && e.data.target === DUPLICATE) {
    e.data.target = SURVIVOR;
    retargeted++;
  }
  return true;
});

graph.nodes = graph.nodes.filter((n: any) => n.data.id !== DUPLICATE);

save();
console.log(`Migration 268 complete: ${retargeted} located_in edge(s) retargeted to ${SURVIVOR}, ${dropped} duplicate connects_to edge(s) dropped, ${DUPLICATE} node deleted`);
