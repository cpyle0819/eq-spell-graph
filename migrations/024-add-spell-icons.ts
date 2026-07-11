/**
 * Migration 024: Add a numeric `icon` field to spell nodes, referencing
 * public/icons/gem-<icon>.png.
 *
 * Source: data/spell-icons.json, produced by scripts/extract-spell-icons.ts
 * from the locally installed EverQuest Legends client's spells_us.txt (an
 * undocumented per-spell icon id field, verified empirically — see that
 * script's comments and decisions/spell-icons-real-client-art-exception.md).
 *
 * A plain top-level field on the spell node (not a new node type or edge)
 * since it's a single scalar attribute of the spell itself, the same shape
 * as `mana`/`skill`/`castTime` already are — unlike spell_line, there's no
 * membership/grouping relationship to model here.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const SPELL_ICONS_PATH = resolve(import.meta.dir, "../data/spell-icons.json");

const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));
const spellIcons: Record<string, number> = JSON.parse(readFileSync(SPELL_ICONS_PATH, "utf-8"));

let updated = 0;
for (const node of graph.nodes) {
  const iconId = spellIcons[node.data.id];
  if (iconId === undefined) continue;
  node.data.icon = iconId;
  updated++;
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log(`Migration 024 complete: icon field added to ${updated} spell nodes`);
