/**
 * Migration 215: `zone:felwithe` and `zone:south-felwithe` were leftover
 * duplicate zone nodes -- eqlwiki.com's combined Felwithe page (`Northern
 * Felwithe`, `South Felwithe`, and `Southern Felwithe` all redirect there)
 * only describes two real sub-zones, North Felwithe and South Felwithe,
 * already modeled here as `zone:northern-felwithe` and `zone:southern-
 * felwithe`. Per user direction while working issue #36 ("zone wise it's
 * only the north and south zones... make it in scope"), this retires the
 * two extras rather than giving them their own map/bestiary content.
 *
 * Most of `zone:felwithe`'s vendor nodes are the exact same named NPC
 * (Celest Palestream, Wellin Brookleap, Allia Moondancer, Assa Leafwind,
 * Seria Woodwind, each in both a bare and `-cleric-guild`/`-paladin-guild`
 * suffixed form) already present under `zone:northern-felwithe` with a
 * *different*, non-overlapping subset of `sells` edges -- an artifact of
 * two separate spell-import passes tagging the same city under two
 * differently-spelled zone ids (`decisions/zone-naming-mismatches.md`).
 * Those pairs are merged (sells edges unioned onto the `northern-felwithe`
 * node, `felwithe` duplicate dropped) rather than renamed, to avoid two
 * vendor cards for the same NPC. Same for `zone:south-felwithe`'s bare
 * "Xista Finder" merging into `zone:southern-felwithe`'s existing one
 * (Xista Finder's Enchanter Guild sits in South Felwithe).
 *
 * `zone:felwithe`'s "Terren Starwatcher" and "Terri Woodshape" (bare +
 * guild-suffixed) and `zone:south-felwithe`'s "Xista Finder, Enchanter
 * Guild" and "Alicia Starshimmer" have no existing counterpart, so those
 * are clean renames into the `northern-felwithe`/`southern-felwithe`
 * namespace, no merge needed. `npc:felwithe:challice` (a Wizard Epic quest
 * NPC in "the Felwithe Paladin guild basement" per `quest:wizard-epic-
 * arantirs-ring`'s own description -- the Paladin Guild is on the North
 * Felwithe map) is renamed the same way. `quest:bone-chips-quests` and
 * `quest:wizard-epic-arantirs-ring` aren't zone-prefixed, so only their
 * `located_in`/`starts_in` edges need retargeting.
 *
 * The six `connects_to` "fix" edges bridging the two stale zones to the
 * real ones become self-loops once retargeted and are dropped.
 */

import { loadGraph } from "./_lib";

const { graph, hasEdge, save } = loadGraph(import.meta.dir);

// Same-named vendor pairs: union `sells` edges onto the survivor, drop the duplicate.
const VENDOR_MERGES: [string, string][] = [
  ["vendor:felwithe:celest-palestream-cleric-guild", "vendor:northern-felwithe:celest-palestream-cleric-guild"],
  ["vendor:felwithe:celest-palestream", "vendor:northern-felwithe:celest-palestream"],
  ["vendor:felwithe:wellin-brookleap-cleric-guild", "vendor:northern-felwithe:wellin-brookleap-cleric-guild"],
  ["vendor:felwithe:wellin-brookleap", "vendor:northern-felwithe:wellin-brookleap"],
  ["vendor:felwithe:allia-moondancer-cleric-guild", "vendor:northern-felwithe:allia-moondancer-cleric-guild"],
  ["vendor:felwithe:allia-moondancer", "vendor:northern-felwithe:allia-moondancer"],
  ["vendor:felwithe:assa-leafwind-cleric-guild", "vendor:northern-felwithe:assa-leafwind-cleric-guild"],
  ["vendor:felwithe:assa-leafwind", "vendor:northern-felwithe:assa-leafwind"],
  ["vendor:felwithe:seria-woodwind-paladin-guild", "vendor:northern-felwithe:seria-woodwind-paladin-guild"],
  ["vendor:felwithe:seria-woodwind", "vendor:northern-felwithe:seria-woodwind"],
  ["vendor:felwithe:porra", "vendor:southern-felwithe:porra"],
  ["vendor:felwithe:xista-finder", "vendor:southern-felwithe:xista-finder"],
  ["vendor:south-felwithe:xista-finder", "vendor:southern-felwithe:xista-finder"],
];

// No existing counterpart: clean id rename into the real zone's namespace.
const NODE_RENAMES: [string, string][] = [
  ["vendor:felwithe:terren-starwatcher-cleric-guild", "vendor:northern-felwithe:terren-starwatcher-cleric-guild"],
  ["vendor:felwithe:terren-starwatcher", "vendor:northern-felwithe:terren-starwatcher"],
  ["vendor:felwithe:terri-woodshape-cleric-guild", "vendor:northern-felwithe:terri-woodshape-cleric-guild"],
  ["vendor:felwithe:terri-woodshape", "vendor:northern-felwithe:terri-woodshape"],
  ["npc:felwithe:challice", "npc:northern-felwithe:challice"],
  ["vendor:south-felwithe:xista-finder-enchanter-guild", "vendor:southern-felwithe:xista-finder-enchanter-guild"],
  ["vendor:south-felwithe:alicia-starshimmer", "vendor:southern-felwithe:alicia-starshimmer"],
];

// Zone-prefix-free nodes (quests) only need their edges retargeted, below.
const ZONE_RETARGETS: Record<string, string> = {
  "zone:felwithe": "zone:northern-felwithe",
  "zone:south-felwithe": "zone:southern-felwithe",
};

for (const [oldId, newId] of VENDOR_MERGES) {
  for (const edge of graph.edges) {
    if (edge.data.source === oldId && edge.data.type === "sells") {
      if (hasEdge(newId, edge.data.target, "sells")) {
        edge.data._drop = true;
      } else {
        edge.data.source = newId;
      }
    }
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

const removeNodeIds = new Set([...VENDOR_MERGES.map(([oldId]) => oldId), "zone:felwithe", "zone:south-felwithe"]);

graph.nodes = graph.nodes.filter((n: { data: { id: string } }) => !removeNodeIds.has(n.data.id));
graph.edges = graph.edges.filter((e: { data: { source: string; target: string; type: string; _drop?: boolean } }) => {
  if (e.data._drop) return false;
  if (removeNodeIds.has(e.data.source) || removeNodeIds.has(e.data.target)) return false;
  if (e.data.type === "connects_to" && e.data.source === e.data.target) return false;
  return true;
});

save();
console.log("Migration 215 complete: merged zone:felwithe and zone:south-felwithe into zone:northern-felwithe/zone:southern-felwithe");
