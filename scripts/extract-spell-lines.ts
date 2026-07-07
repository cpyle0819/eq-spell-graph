/**
 * Extracts spell-line (progression) groupings from the locally installed
 * EverQuest Legends client's spells_us.txt, matched against spells already
 * in data/graph.json. Outputs data/spell-lines.json for migration 019.
 *
 * spells_us.txt is Daybreak's proprietary client data file and is never
 * copied into this repo — only the small derived fact (which graph spell
 * belongs to which line) is written out, the same way the wiki scrapers
 * extract facts rather than storing raw HTML.
 *
 * Usage: bun run scripts/extract-spell-lines.ts <path-to-EQ-install-dir>
 * (or set EQ_INSTALL_DIR — no default path is hardcoded, since this repo is
 * public and an install path can vary by machine/user).
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { loadClientSpells, buildNameIndex, bestMatch } from "./lib/client-spells";

const EQ_DIR = process.argv[2] ?? process.env.EQ_INSTALL_DIR;
if (!EQ_DIR) {
  console.error("Usage: bun run scripts/extract-spell-lines.ts <path-to-EQ-install-dir>");
  console.error("(or set the EQ_INSTALL_DIR environment variable)");
  process.exit(1);
}
const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const OUT_PATH = resolve(import.meta.dir, "../data/spell-lines.json");

// Undocumented publicly, but confirmed empirically: every member of the
// classic heal line shares one value at field 165, every member of
// Yaulp/Yaulp II/Yaulp III shares another, and unrelated spells differ. Not
// 100% complete — Yaulp IV breaks from its line's value — so treat
// groupings as strong evidence, not gospel.
const SPELL_GROUP_FIELD = 165;

interface GraphSpell {
  id: string;
  label: string;
  classLevels: { class: string; level?: number }[];
}

function loadGraphSpells(): GraphSpell[] {
  const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));
  return graph.nodes
    .filter((n: { data: { type: string } }) => n.data.type === "spell")
    .map((n: { data: { id: string; label: string; class_levels: { class: string; level?: number }[] } }) => ({
      id: n.data.id,
      label: n.data.label,
      classLevels: n.data.class_levels,
    }));
}

const clientSpells = loadClientSpells(EQ_DIR);
const byNameLower = buildNameIndex(clientSpells);
const graphSpells = loadGraphSpells();

interface SpellLineOutput {
  spellGroup: string;
  members: { graphId: string; label: string; minLevel: number }[];
}

const groups = new Map<string, SpellLineOutput>();
let matched = 0;
let unmatched = 0;

for (const gs of graphSpells) {
  const candidates = byNameLower.get(gs.label.toLowerCase()) ?? [];
  const match = bestMatch(gs.classLevels, candidates);
  if (!match) {
    unmatched++;
    continue;
  }
  matched++;
  const minLevel = Math.min(...gs.classLevels.map((cl) => cl.level ?? Infinity));
  const key = match.fields[SPELL_GROUP_FIELD];
  if (!groups.has(key)) groups.set(key, { spellGroup: key, members: [] });
  groups.get(key)!.members.push({ graphId: gs.id, label: gs.label, minLevel });
}

// Only real lines — a "line" of one spell isn't a progression
const lines = [...groups.values()].filter((g) => g.members.length >= 2);

writeFileSync(OUT_PATH, JSON.stringify(lines, null, 2));
console.log(
  `Matched ${matched}/${graphSpells.length} graph spells to client data (${unmatched} unmatched).`
);
console.log(`${lines.length} spell lines (2+ members) covering ${lines.reduce((n, l) => n + l.members.length, 0)} spells.`);
console.log(`Written to data/spell-lines.json`);
