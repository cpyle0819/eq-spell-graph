/**
 * Migration 232: `zone:neriak` was a leftover duplicate zone node -- issue
 * #36's Neriak batch. eqlwiki.com's combined Neriak page only describes
 * three real sub-zones, already modeled here as `zone:neriak-foreign-
 * quarter`, `zone:neriak-commons`, and `zone:neriak-3rd-gate`. `zone:neriak`
 * had no `connects_to` link to the real entry point (`zone:neriak-foreign-
 * quarter` <-> `zone:nektulos-forest`); its only edges were 20 vendor nodes
 * (a `<name>-3rd-gate-<guild>`/`<name>-commons-<guild>` suffixed import,
 * same naming-mismatch artifact as Felwithe's migration 215) and two
 * `connects_to` pairs to `zone:neriak-commons`/`zone:neriak-3rd-gate` that
 * are redundant with those zones' own direct connection to each other.
 *
 * Unlike Felwithe's merge, every one of the 20 duplicate vendors is an
 * exact `sells`-edge subset of its already-correctly-homed counterpart
 * (e.g. `vendor:neriak:sol-punox-3rd-gate-cleric-guild`'s 8 spells are all
 * present in `vendor:neriak-3rd-gate:sol-punox`'s 15) -- no union needed,
 * just drop the duplicates. "Neriak" drops off issue #36's checklist
 * rather than getting its own map/bestiary, same call as "South Felwithe".
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const removeNodeIds = new Set(
  graph.edges
    .filter((e: { data: { target: string; type: string; source: string } }) => e.data.target === "zone:neriak" && e.data.type === "located_in")
    .map((e: { data: { source: string } }) => e.data.source)
);
removeNodeIds.add("zone:neriak");

graph.nodes = graph.nodes.filter((n: { data: { id: string } }) => !removeNodeIds.has(n.data.id));
graph.edges = graph.edges.filter((e: { data: { source: string; target: string } }) => {
  return !removeNodeIds.has(e.data.source) && !removeNodeIds.has(e.data.target);
});

save();
console.log("Migration 232 complete: removed duplicate zone:neriak and its 20 redundant vendor nodes");
