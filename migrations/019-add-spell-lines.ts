/**
 * Migration 019: Add "spell_line" nodes grouping spells into progression
 * lines (e.g. Minor Healing -> Light Healing -> ... -> Superior Healing;
 * Yaulp -> Yaulp II -> Yaulp III), with spell --member_of--> spell_line
 * edges.
 *
 * Source: data/spell-lines.json, produced by
 * scripts/extract-spell-lines.ts from the locally installed EverQuest
 * Legends client's spells_us.txt (an undocumented per-spell "spell group"
 * field, verified empirically against known lines — see that script's
 * comments). Not from eqlwiki.com; the wiki has no equivalent concept.
 *
 * A new node type (per DECISIONS.md's "node types are generic and
 * extensible" rule) rather than a flat field on spell, so a line's full
 * membership is a normal graph traversal rather than a manual scan over
 * every spell's raw group id.
 *
 * The line's label is derived from whichever member has the lowest
 * class_levels level (e.g. "Minor Healing line"), since the source group
 * id itself (e.g. "100020020") is an opaque internal number with no
 * human meaning.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const SPELL_LINES_PATH = resolve(import.meta.dir, "../data/spell-lines.json");

interface SpellLineMember {
  graphId: string;
  label: string;
  minLevel: number;
}

interface SpellLineInput {
  spellGroup: string;
  members: SpellLineMember[];
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));
const spellLines: SpellLineInput[] = JSON.parse(readFileSync(SPELL_LINES_PATH, "utf-8"));

let nodesAdded = 0;
let edgesAdded = 0;

for (const line of spellLines) {
  const base = [...line.members].sort((a, b) => a.minLevel - b.minLevel)[0];
  const lineId = `spellline:${slugify(base.label)}`;
  const lineLabel = `${base.label} line`;

  if (!graph.nodes.some((n: { data: { id: string } }) => n.data.id === lineId)) {
    graph.nodes.push({
      data: {
        id: lineId,
        label: lineLabel,
        type: "spell_line",
      },
    });
    nodesAdded++;
  }

  for (const member of line.members) {
    const edgeId = `e-member_of-${member.graphId}-${lineId}`;
    if (graph.edges.some((e: { data: { id: string } }) => e.data.id === edgeId)) continue;
    graph.edges.push({
      data: {
        id: edgeId,
        source: member.graphId,
        target: lineId,
        type: "member_of",
      },
    });
    edgesAdded++;
  }
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log(`Migration 019 complete: ${nodesAdded} spell_line nodes, ${edgesAdded} member_of edges added`);
