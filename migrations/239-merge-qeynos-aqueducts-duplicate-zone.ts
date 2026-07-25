/**
 * Migration 239: `zone:qeynos-aqueducts` was a leftover duplicate zone node
 * -- issue #36's Qeynos batch. eqlwiki.com only has one page for this zone
 * (titled "Qeynos Aqueducts", but its own prose calls the zone "Qeynos
 * Catacombs" throughout -- "also known as Qeynos Aqueduct System, Qeynos
 * Underground or Qeynos Sewers"), one map image, one "Level of Monsters"
 * line, one bestiary category. P99's wiki (an independent source for the
 * same classic-EQ-derived zone table) confirms the same: single zone,
 * single `/who` shortname (`qcat`). `zone:qeynos-catacombs` is the original
 * node (migration 003's connectivity import); `zone:qeynos-aqueducts` was
 * created later by quest-import migrations (048 on) that referenced the
 * zone by its eqlwiki page title instead -- the same naming-mismatch
 * pattern as Felwithe's `zone:felwithe`/`zone:south-felwithe` (migration
 * 215) and Neriak's `zone:neriak` (migration 232).
 *
 * Two NPCs (`kurne-rextula`, `lyris-moonbane`) exist as exact duplicates
 * under both namespaces -- same person, same role, split across two quest-
 * import passes. Merged onto the `qeynos-catacombs` survivor, unioning
 * `starts` edges. The other five `qeynos-aqueducts` NPCs have no
 * counterpart and are clean renames. `zone:qeynos-aqueducts` connected to
 * both `zone:north-qeynos` and `zone:south-qeynos`; `zone:qeynos-catacombs`
 * already had a `south-qeynos` link (now a duplicate, dropped) but no
 * `north-qeynos` link (kept after retargeting).
 *
 * "Qeynos Aqueducts" drops off issue #36's checklist rather than getting
 * its own map/bestiary, same call as "South Felwithe"/"Neriak".
 */

import { loadGraph } from "./_lib";

const { graph, hasEdge, save } = loadGraph(import.meta.dir);

// Same-person NPC pairs: union `starts` edges onto the survivor, drop the duplicate.
const NPC_MERGES: [string, string][] = [
  ["npc:qeynos-aqueducts:kurne-rextula", "npc:qeynos-catacombs:kurne-rextula"],
  ["npc:qeynos-aqueducts:lyris-moonbane", "npc:qeynos-catacombs:lyris-moonbane"],
];

// No existing counterpart: clean id rename into the real zone's namespace.
const NODE_RENAMES: [string, string][] = [
  ["npc:qeynos-aqueducts:garuc-anehm", "npc:qeynos-catacombs:garuc-anehm"],
  ["npc:qeynos-aqueducts:commander-kane", "npc:qeynos-catacombs:commander-kane"],
  ["npc:qeynos-aqueducts:nomaria-doseniar", "npc:qeynos-catacombs:nomaria-doseniar"],
  ["npc:qeynos-aqueducts:rihtur-fullome", "npc:qeynos-catacombs:rihtur-fullome"],
  ["npc:qeynos-aqueducts:malka-rale", "npc:qeynos-catacombs:malka-rale"],
];

const ZONE_RETARGETS: Record<string, string> = {
  "zone:qeynos-aqueducts": "zone:qeynos-catacombs",
};

for (const [oldId, newId] of NPC_MERGES) {
  for (const edge of graph.edges) {
    if (edge.data.source === oldId) {
      if (edge.data.type === "located_in") {
        edge.data._drop = true;
      } else if (hasEdge(newId, edge.data.target, edge.data.type)) {
        edge.data._drop = true;
      } else {
        edge.data.source = newId;
      }
    }
    if (edge.data.target === oldId) edge.data.target = newId;
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

const removeNodeIds = new Set([...NPC_MERGES.map(([oldId]) => oldId), "zone:qeynos-aqueducts"]);

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
console.log("Migration 239 complete: merged zone:qeynos-aqueducts into zone:qeynos-catacombs");
