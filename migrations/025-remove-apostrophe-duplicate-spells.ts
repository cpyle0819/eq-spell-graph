/**
 * Migration 025: Remove two bad duplicate spell nodes — "Snail's Healing"
 * (spell:snail-s-healing) and "Slug's Healing" (spell:slug-s-healing) — that
 * duplicate "Snails Healing" and "Slugs Healing" (no apostrophe) at the same
 * class/level. Surfaced by issue #21's spell-icon work: the apostrophe
 * variants never matched a real eqlwiki.com page (404 for both
 * "Snail's_Healing" and "Slug's_Healing"; 200 for the no-apostrophe titles),
 * so they never got an icon, description, or any other detail data — they
 * were already flagged as one of the 11 graph spells with no client-data
 * match in decisions/spell-lines-from-local-client.md, just never removed.
 * Both are fully orphaned (zero edges — no vendor sells either, no
 * spell_line membership), so this is a plain node removal, no edge
 * retargeting needed.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const DATA_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(DATA_PATH, "utf-8"));

const BAD_IDS = new Set(["spell:snail-s-healing", "spell:slug-s-healing"]);

const before = graph.nodes.length;
graph.nodes = graph.nodes.filter((n: { data: { id: string } }) => !BAD_IDS.has(n.data.id));

writeFileSync(DATA_PATH, JSON.stringify(graph, null, 2));
console.log(`Migration 025 complete: removed ${before - graph.nodes.length} duplicate spell node(s)`);
