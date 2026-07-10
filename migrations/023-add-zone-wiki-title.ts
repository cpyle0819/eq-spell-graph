/**
 * Migration 023: Add a `wiki_title` field to existing zone nodes — the
 * exact eqlwiki.com page title each zone's lore (migration 022) was
 * actually sourced from, via data/zone-lore.json's already-resolved
 * `wikiTitle` (scripts/scrape-zone-lore.ts resolved MediaWiki redirects at
 * fetch time — see decisions/zone-naming-mismatches.md).
 *
 * Issue #14: a zone-card/route-card wiki link built naively from the
 * zone's own `label` (e.g. "East Cabilis".replace(" ", "_")) would 404 for
 * the 24 zones whose graph label differs from the page eqlwiki.com
 * actually serves them from (e.g. "East Cabilis"/"West Cabilis" ->
 * "Cabilis", the three Freeport nodes -> "Freeport", the four Felwithe
 * nodes -> "Felwithe", etc.). This field lets callers build a correct link
 * without re-deriving that resolution.
 *
 * All 89 zones in data/zone-lore.json resolved to a real page (see
 * migration 022's header comment), so every zone node gets this field.
 *
 * Idempotent: skips any zone that already has a `wiki_title` field.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const LORE_PATH = resolve(import.meta.dir, "../data/zone-lore.json");

interface ZoneLoreEntry {
  label: string;
  wikiTitle: string | null;
  lore: string | null;
}

const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));
const loreEntries: ZoneLoreEntry[] = JSON.parse(readFileSync(LORE_PATH, "utf-8"));
const loreByLabel = new Map(loreEntries.map((e) => [e.label, e]));

let added = 0;
let skippedAlready = 0;
let skippedNoTitle = 0;

for (const node of graph.nodes) {
  if (node.data.type !== "zone") continue;
  if (node.data.wiki_title !== undefined) {
    skippedAlready++;
    continue;
  }
  const entry = loreByLabel.get(node.data.label);
  if (!entry?.wikiTitle) {
    skippedNoTitle++;
    console.log(`No wiki title available for zone "${node.data.label}" — leaving field unset.`);
    continue;
  }
  node.data.wiki_title = entry.wikiTitle;
  added++;
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log(`Migration 023 complete: ${added} zones got a wiki_title field, ${skippedAlready} already had one, ${skippedNoTitle} had no title available.`);
