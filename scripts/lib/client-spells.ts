/**
 * Shared parsing/matching logic for the locally installed EverQuest Legends
 * client's spells_us.txt, used by both scripts/extract-spell-lines.ts and
 * scripts/scrape-spell-details.ts. See DECISIONS.md's "Spell lines sourced
 * from the locally installed client" entry for how these field offsets were
 * verified — this file's layout is an older two-file format (message text
 * lives separately in spells_us_str.txt) that doesn't match modern EQEmu
 * documentation 1:1, so offsets here are empirically confirmed, not
 * transcribed from a spec.
 */

import { readFileSync } from "fs";
import { resolve } from "path";

export const CLASS_ORDER = [
  "warrior", "cleric", "paladin", "ranger", "shadow knight", "druid",
  "monk", "bard", "rogue", "shaman", "necromancer", "wizard",
  "magician", "enchanter", "beastlord", "berserker",
];
const CLASS_ARRAY_START = 36;

export interface ClientSpell {
  id: string;
  name: string;
  classLevels: Record<string, number>;
  fields: string[];
}

export function loadClientSpells(eqDir: string): ClientSpell[] {
  const path = resolve(eqDir, "spells_us.txt");
  const raw = readFileSync(path, "utf8");
  return raw
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const fields = line.split("^");
      const classLevels: Record<string, number> = {};
      for (let i = 0; i < CLASS_ORDER.length; i++) {
        const v = Number(fields[CLASS_ARRAY_START + i]);
        if (v !== 255 && v !== -1) classLevels[CLASS_ORDER[i]] = v;
      }
      return { id: fields[0], name: fields[1], classLevels, fields };
    });
}

export function buildNameIndex(spells: ClientSpell[]): Map<string, ClientSpell[]> {
  const byNameLower = new Map<string, ClientSpell[]>();
  for (const s of spells) {
    const key = s.name.toLowerCase();
    if (!byNameLower.has(key)) byNameLower.set(key, []);
    byNameLower.get(key)!.push(s);
  }
  return byNameLower;
}

// Picks the client-data candidate whose class/level array best matches a
// graph spell's own class_levels — needed because some spell names have
// multiple client entries (e.g. an NPC-only variant with the same name and
// an all-unusable class array). Score rewards exact class+level agreement,
// penalizes candidate classes the graph spell doesn't have.
export function bestMatch(
  graphClassLevels: { class: string; level?: number }[],
  candidates: ClientSpell[]
): ClientSpell | null {
  let best: { spell: ClientSpell; score: number } | null = null;
  for (const c of candidates) {
    let score = 0;
    for (const cl of graphClassLevels) {
      if (c.classLevels[cl.class] !== undefined) {
        score += c.classLevels[cl.class] === cl.level ? 2 : 1;
      }
    }
    const graphClasses = new Set(graphClassLevels.map((cl) => cl.class));
    for (const cls of Object.keys(c.classLevels)) {
      if (!graphClasses.has(cls)) score -= 1;
    }
    if (!best || score > best.score) best = { spell: c, score };
  }
  return best && best.score > 0 ? best.spell : null;
}
