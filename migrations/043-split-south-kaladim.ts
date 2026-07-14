/**
 * Migration 043: add `zone:south-kaladim`, and fix Kaladim's connects_to
 * edges to match. eqlwiki.com/Kaladim covers North and South Kaladim as
 * one page (one shared infobox, one "Adjacent Zones: Butcherblock
 * Mountains" field, one faction table) even though they're two real
 * playable zones in-game (confirmed by the page's own "Name in /who:
 * kaladima (South), kaladimb (North)" and separate succor-point lines) --
 * exactly the same one-page/two-zones shape this graph already models for
 * Qeynos, Freeport, and Felwithe (both halves sharing the same wiki_title
 * and lore text). `zone:north-kaladim` was already correctly modeled this
 * way; it just had no South counterpart yet, and its one connects_to edge
 * was pointed at the wrong half.
 *
 * The page's succor-point text is the deciding evidence for which half
 * the zone line actually sits on: "South Kaladim -18, -2 (Zone line to
 * Butcherblock Mountains)" states the zone line explicitly; "North
 * Kaladim 494, 300 (South of the Pottery Wheel)" has no such note. This
 * graph's existing North/South Qeynos precedent also splits external
 * connections between the two halves rather than duplicating them onto
 * both (North Qeynos -> South Qeynos + Qeynos Hills; South Qeynos ->
 * North Qeynos + Qeynos Catacombs + Erudin + East Freeport) -- so
 * Butcherblock Mountains moves to South Kaladim alone, and North<->South
 * Kaladim get a direct connects_to edge the same way every other split
 * city here connects its two halves.
 *
 * No `located_in` edges are touched -- every NPC/quest already attached
 * to zone:north-kaladim (the Cleric/Paladin guild vendors, Diggins, Gunlok
 * Jure, Bumle Reminjar, and their quests) was individually checked against
 * its own quest/vendor source text and is genuinely North-specific, not a
 * case of South-side content wrongly parked on North.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

function hasNode(id: string): boolean {
  return graph.nodes.some((n: { data: { id: string } }) => n.data.id === id);
}

function addNode(data: Record<string, unknown>) {
  if (!hasNode(data.id as string)) graph.nodes.push({ data });
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

function removeEdge(source: string, target: string, type: string) {
  graph.edges = graph.edges.filter(
    (e: { data: { source: string; target: string; type: string } }) =>
      !(e.data.source === source && e.data.target === target && e.data.type === type)
  );
}

const northId = "zone:north-kaladim";
const north = graph.nodes.find((n: { data: { id: string } }) => n.data.id === northId).data;

const southId = "zone:south-kaladim";
addNode({
  id: southId,
  label: "South Kaladim",
  type: "zone",
  faction: north.faction,
  lore: north.lore,
  wiki_title: north.wiki_title,
});

removeEdge(northId, "zone:butcherblock-mountains", "connects_to");
removeEdge("zone:butcherblock-mountains", northId, "connects_to");
addEdge(southId, "zone:butcherblock-mountains", "connects_to");
addEdge("zone:butcherblock-mountains", southId, "connects_to");
addEdge(northId, southId, "connects_to");
addEdge(southId, northId, "connects_to");

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 043 complete: added zone:south-kaladim and fixed Kaladim's connects_to edges");
