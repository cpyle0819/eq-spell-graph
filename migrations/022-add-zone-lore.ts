/**
 * Migration 022: Add a short `lore` field (1-3 sentences) to existing zone
 * nodes, sourced from data/zone-lore.json (produced by
 * scripts/scrape-zone-lore.ts, which fetches raw wikitext from each zone's
 * actual eqlwiki.com page via the MediaWiki API — see decisions/
 * eql-vs-classic-eq-zone-connectivity.md's rule against assuming classic-EQ
 * lore applies here).
 *
 * Issue #18: Route Finder's result already shows a vendor-count/level-range
 * badge on the stone card header (previous pass); this adds flavor text —
 * "what would a guidebook say about this place" — rendered on the
 * parchment route-path scroll instead, alongside the step-by-step
 * directions, not on the badge's header.
 *
 * All 89 zone labels resolved to a real eqlwiki.com page (several via
 * MediaWiki redirects — e.g. "West Freeport"/"East Freeport"/"North
 * Freeport" all redirect to one combined "Freeport" page, as do all four
 * Felwithe nodes to "Felwithe" and all three Neriak sub-zone nodes to
 * "Neriak" — those sibling zones intentionally carry identical lore text
 * since eqlwiki.com itself treats them as one place). No zone had to be
 * omitted for lacking a page, including the migration-015 P1999-sourced
 * classic dungeons (decisions/dungeon-zones-use-p1999-not-eqlwiki.md) —
 * their connectivity comes from P1999, but eqlwiki.com does have a
 * lore-bearing page for every one of them.
 *
 * Idempotent: skips any zone that already has a `lore` field.
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
let skippedNoLore = 0;

for (const node of graph.nodes) {
  if (node.data.type !== "zone") continue;
  if (node.data.lore !== undefined) {
    skippedAlready++;
    continue;
  }
  const entry = loreByLabel.get(node.data.label);
  if (!entry?.lore) {
    skippedNoLore++;
    console.log(`No lore available for zone "${node.data.label}" — leaving field unset.`);
    continue;
  }
  node.data.lore = entry.lore;
  added++;
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log(`Migration 022 complete: ${added} zones got a lore field, ${skippedAlready} already had one, ${skippedNoLore} had no lore available.`);
