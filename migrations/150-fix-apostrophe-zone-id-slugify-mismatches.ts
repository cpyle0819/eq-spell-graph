/**
 * Migration 150: rename 4 zone node ids (and every node namespaced under
 * them) so they match this app's own `zone:slugify(label)` convention.
 *
 * Found while verifying migration 142's new Kurn's Tower map/bestiary data
 * in the browser: `/api/route?from=X&to=Y` (src/api.ts) resolves a zone by
 * recomputing `zone:${slugify(label)}` rather than looking up a real id,
 * and `slugify()` turns an apostrophe into its own `-` (`"Kurn's Tower"` ->
 * `"kurn-s-tower"`). Every other zone's id already equals slugify(its own
 * label) exactly -- these 4 were created (long before this migration) with
 * a different slug function that just stripped the apostrophe instead,
 * leaving them the only zones `/api/route` (and `/api/plan`'s `from=`)
 * could never resolve. Confirmed via a full-graph scan: exactly these 4
 * zone ids mismatch `zone:slugify(label)`; every other zone node is already
 * consistent.
 *
 *   zone:sleepers-tomb    -> zone:sleeper-s-tomb    (Sleeper's Tomb)
 *   zone:trakanons-teeth  -> zone:trakanon-s-teeth  (Trakanon's Teeth)
 *   zone:karnors-castle   -> zone:karnor-s-castle   (Karnor's Castle)
 *   zone:kurns-tower      -> zone:kurn-s-tower      (Kurn's Tower)
 *
 * Fixing the id (rather than teaching `/api/route`/`/api/plan` to look up
 * zones by label) keeps the "id = zone:slugify(label)" invariant true
 * everywhere with no special-casing in the shared, deployed API layer.
 *
 * Every other node namespaced under one of these zone slugs (`mob:`, `npc:`,
 * etc. — e.g. `mob:kurns-tower:bargynn`) is renamed the same way, and every
 * edge referencing any renamed id (as `source` or `target`) is rewritten to
 * match. `quest:key-to-sleepers-tomb` is untouched — it's a quest's own
 * slugified title that happens to contain the substring, not a node
 * namespaced under the zone id.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const SLUG_RENAMES: Record<string, string> = {
  "sleepers-tomb": "sleeper-s-tomb",
  "trakanons-teeth": "trakanon-s-teeth",
  "karnors-castle": "karnor-s-castle",
  "kurns-tower": "kurn-s-tower",
};

function renameId(id: string): string {
  for (const [oldSlug, newSlug] of Object.entries(SLUG_RENAMES)) {
    if (id === `zone:${oldSlug}`) return `zone:${newSlug}`;
    const prefixMatch = id.match(/^([a-z]+):/);
    if (prefixMatch && id.startsWith(`${prefixMatch[1]}:${oldSlug}:`)) {
      return id.replace(`${prefixMatch[1]}:${oldSlug}:`, `${prefixMatch[1]}:${newSlug}:`);
    }
  }
  return id;
}

let nodesRenamed = 0;
for (const node of graph.nodes as { data: { id: string } }[]) {
  const renamed = renameId(node.data.id);
  if (renamed !== node.data.id) {
    node.data.id = renamed;
    nodesRenamed++;
  }
}

let edgesUpdated = 0;
for (const edge of graph.edges as { data: { source: string; target: string } }[]) {
  const source = renameId(edge.data.source);
  const target = renameId(edge.data.target);
  if (source !== edge.data.source || target !== edge.data.target) {
    edge.data.source = source;
    edge.data.target = target;
    edgesUpdated++;
  }
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log(`Migration 150 complete: ${nodesRenamed} node id(s) renamed, ${edgesUpdated} edge(s) updated`);
