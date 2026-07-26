/**
 * Migration 270: "Tak Whistler" (the druid at the Northern Karana druid
 * ring) was split across three vendor nodes from three different import
 * passes -- the same shape as West Karana's "Analya" 3-way merge (migration
 * 246): `vendor:northern-karana:tak-whistler-druid-ring`, `vendor:northern-
 * karana:tak-whistler`, and `vendor:northern-plains-of-karana:tak-whistler`
 * (a zone-slug variant of the same "Northern Karana" zone -- all three
 * already share the single `zone:northern-karana` node via their located_in
 * edges). `vendor:northern-karana:tak-whistler` is the survivor: it already
 * carries the largest sells list, a strict superset of the druid-ring
 * variant's 5 spells. Only the plains-of-karana variant contributes two
 * spells (`imbue-plains-pebble`, `skin-like-steel`) not already present.
 */

import { loadGraph } from "./_lib";

const { graph, hasEdge, save } = loadGraph(import.meta.dir);

const SURVIVOR = "vendor:northern-karana:tak-whistler";
const DUPLICATES = [
  "vendor:northern-karana:tak-whistler-druid-ring",
  "vendor:northern-plains-of-karana:tak-whistler",
];

for (const oldId of DUPLICATES) {
  for (const edge of graph.edges) {
    if (edge.data.source === oldId) {
      if (edge.data.type === "located_in") {
        edge.data._drop = true;
      } else if (hasEdge(SURVIVOR, edge.data.target, edge.data.type)) {
        edge.data._drop = true;
      } else {
        edge.data.source = SURVIVOR;
      }
    }
    if (edge.data.target === oldId) edge.data.target = SURVIVOR;
  }
}

const removeNodeIds = new Set(DUPLICATES);

graph.nodes = graph.nodes.filter((n: { data: { id: string } }) => !removeNodeIds.has(n.data.id));
graph.edges = graph.edges.filter((e: { data: { source: string; target: string; _drop?: boolean } }) => {
  if (e.data._drop) return false;
  if (removeNodeIds.has(e.data.source) || removeNodeIds.has(e.data.target)) return false;
  return true;
});

save();
console.log("Migration 270 complete: merged 2 duplicate Tak Whistler vendor nodes into vendor:northern-karana:tak-whistler");
