/**
 * Migration 246: `zone:west-karana` was a leftover duplicate zone node --
 * issue #36's Karana batch. eqlwiki.com's "West Karana" page is a bare
 * redirect to "Western Karana" (confirmed via WebFetch), one map image
 * (`Zone_westkarana.jpg`), one zone. `zone:western-karana` is the original
 * node -- migration 003's connectivity import already used "Western Karana"
 * as the zone label -- while `zone:west-karana` was introduced later by
 * quest-import migrations that referenced the zone by its shorter in-game
 * name instead. Same naming-mismatch-duplicate-zone shape as Felwithe's
 * `zone:felwithe`/`zone:south-felwithe` (migration 215), Neriak's
 * `zone:neriak` (migration 232), and Qeynos Aqueducts' `zone:qeynos-
 * aqueducts` (migration 239).
 *
 * "Analya" turned out to be a single vendor split across *three* duplicate
 * nodes from three different import passes, each capturing a different
 * subset of her sold spells (`vendor:west-karana:analya-barbarian-village`,
 * `vendor:west-karana:analya`, `vendor:western-karana:analya`) -- a three-
 * way merge rather than the usual two-way. All three `sells` edges union
 * onto the `western-karana` survivor. The other five `west-karana` NPCs
 * have no counterpart under `western-karana` and are clean renames.
 *
 * "West Karana" drops off issue #36's checklist rather than getting its own
 * map/bestiary, same call as "South Felwithe"/"Neriak"/"Qeynos Aqueducts".
 */

import { loadGraph } from "./_lib";

const { graph, hasEdge, save } = loadGraph(import.meta.dir);

// Same-vendor pairs: union `sells` edges onto the survivor, drop the duplicates.
const NPC_MERGES: string[] = [
  "vendor:west-karana:analya-barbarian-village",
  "vendor:west-karana:analya",
];
const ANALYA_SURVIVOR = "vendor:western-karana:analya";

// No existing counterpart: clean id rename into the real zone's namespace.
const NODE_RENAMES: [string, string][] = [
  ["npc:west-karana:innkeep-danin", "npc:western-karana:innkeep-danin"],
  ["npc:west-karana:innkeep-rislarn", "npc:western-karana:innkeep-rislarn"],
  ["npc:west-karana:henina-miller", "npc:western-karana:henina-miller"],
  ["npc:west-karana:gindlin-toxfodder", "npc:western-karana:gindlin-toxfodder"],
  ["npc:west-karana:a-wandering-spirit", "npc:western-karana:a-wandering-spirit"],
];

const ZONE_RETARGETS: Record<string, string> = {
  "zone:west-karana": "zone:western-karana",
};

for (const oldId of NPC_MERGES) {
  for (const edge of graph.edges) {
    if (edge.data.source === oldId) {
      if (edge.data.type === "located_in") {
        edge.data._drop = true;
      } else if (hasEdge(ANALYA_SURVIVOR, edge.data.target, edge.data.type)) {
        edge.data._drop = true;
      } else {
        edge.data.source = ANALYA_SURVIVOR;
      }
    }
    if (edge.data.target === oldId) edge.data.target = ANALYA_SURVIVOR;
  }
}

for (const [oldId, newId] of NODE_RENAMES) {
  const node = graph.nodes.find((n: { data: { id: string } }) => n.data.id === oldId);
  if (!node) throw new Error(`Expected node ${oldId} to exist`);
  node.data.id = newId;
  for (const edge of graph.edges) {
    if (edge.data.source === oldId) edge.data.source = newId;
    if (edge.data.target === oldId) edge.data.target = newId;
  }
}

for (const edge of graph.edges) {
  if (edge.data.source in ZONE_RETARGETS) edge.data.source = ZONE_RETARGETS[edge.data.source];
  if (edge.data.target in ZONE_RETARGETS) edge.data.target = ZONE_RETARGETS[edge.data.target];
}

const removeNodeIds = new Set([...NPC_MERGES, "zone:west-karana"]);

const seenEdges = new Set<string>();
graph.nodes = graph.nodes.filter((n: { data: { id: string } }) => !removeNodeIds.has(n.data.id));
graph.edges = graph.edges.filter((e: { data: { source: string; target: string; type: string; _drop?: boolean } }) => {
  if (e.data._drop) return false;
  if (removeNodeIds.has(e.data.source) || removeNodeIds.has(e.data.target)) return false;
  if (e.data.type === "connects_to" && e.data.source === e.data.target) return false;
  const key = `${e.data.source}|${e.data.target}|${e.data.type}`;
  if (seenEdges.has(key)) return false;
  seenEdges.add(key);
  return true;
});

save();
console.log("Migration 246 complete: merged zone:west-karana into zone:western-karana");
