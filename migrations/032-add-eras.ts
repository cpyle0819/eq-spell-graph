/**
 * Migration 032: Add the `era` node type -- the game's real content-release
 * order, with exactly one marked `current` (the era the live game is
 * actually in right now). See decisions/quest-era-flagging.md.
 *
 * Confirmed directly against eqlwiki.com (not guessed from classic-EQ
 * expansion history, which EQL doesn't necessarily follow -- see CLAUDE.md):
 * the Zones hub page lists "Classic", "Kunark (Out of Era)", and
 * "Velious (Out of Era)", and the wiki's own site-wide "Era Filter" /
 * {{Classic Era}} template system confirms Classic is the one currently
 * live. No era after Velious is documented anywhere on the wiki yet --
 * this list gets appended to, not guessed ahead of, as EQL's progression
 * actually advances and the wiki documents it.
 *
 * Existing quest nodes are NOT backfilled with a real `era` value here --
 * that requires per-quest wiki verification (an explicit "Out of Era"/
 * {{Whichever Era}} tag on that quest's own page), which is exactly the
 * kind of per-page research this migration's sibling GitHub issue exists
 * to track, not something to guess in bulk.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

function hasNode(id: string): boolean {
  return graph.nodes.some((n: { data: { id: string } }) => n.data.id === id);
}

const ERAS = [
  { id: "era:classic", label: "Classic", order: 1, current: true },
  { id: "era:kunark", label: "Kunark", order: 2, current: false },
  { id: "era:velious", label: "Velious", order: 3, current: false },
];

let added = 0;
for (const era of ERAS) {
  if (hasNode(era.id)) continue;
  graph.nodes.push({ data: { ...era, type: "era" } });
  added++;
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log(`Migration 032 complete: ${added} era nodes added`);
