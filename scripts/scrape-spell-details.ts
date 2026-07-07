/**
 * Builds spell detail data for migration 011, sourcing what it reliably can
 * from the locally installed EverQuest Legends client's spells_us.txt
 * instead of the wiki, and falling back to the EQL wiki MediaWiki API for
 * everything else. Outputs data/spell-details.json.
 *
 * Field split (see DECISIONS.md's "Spell details sourced from the local
 * client where verified" entry for how each local mapping was verified):
 *   - mana, castTime, recastTime: read directly from spells_us.txt numeric
 *     fields — verified as exact matches across many spells.
 *   - range: field 4 (range), falling back to field 5 (aoerange) when range
 *     is 0 — a plain "prefer field 4" rule undercounted self/AE spells
 *     whose meaningful distance is their AE radius, not their (zero) target
 *     range. Together these two fields explain 99.1% of wiki range values.
 *   - skill: read via a lookup table built from a statistically-verified
 *     field/category correlation (99.4% accuracy, and cross-checked against
 *     EQ's real canonical skill ID table). Diffing against the prior
 *     wiki-only data showed this mostly *fixing* wiki-scraper parsing bugs
 *     (garbled multi-field bleed, leftover "†" footnote markers), not
 *     introducing regressions.
 *   - targetType: tried the same approach (90.5% "accuracy"), but that
 *     metric only measures "most common category wins" — diffing the
 *     output found it silently collapsing real distinctions the wiki
 *     preserves (e.g. "PB AE" → "Single", which is a materially wrong
 *     answer, not a simplification: point-blank-AE hits everyone around the
 *     caster, nothing like a single target). Reverted to wiki-only.
 *   - description, spellType, resist, fizzleTime, duration: still wiki-only.
 *     No reliable local source was found for these — resist's numeric
 *     modifier, spellType's fine-grained categories (Heal/Cure/DoT/etc, as
 *     opposed to just beneficial/detrimental), fizzleTime, and duration's
 *     exact text all depend on the client's effect-slot fields
 *     (effectid/base/base2/max[12]), which statistical correlation couldn't
 *     locate reliably (see DECISIONS.md).
 *
 * Usage: bun run scripts/scrape-spell-details.ts <path-to-EQ-install-dir>
 * (or set EQ_INSTALL_DIR — no default path is hardcoded, since this repo is
 * public and an install path can vary by machine/user).
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { loadClientSpells, buildNameIndex, bestMatch, type ClientSpell } from "./lib/client-spells";

const API = "https://eqlwiki.com/api.php";
const BATCH_SIZE = 50;
const DELAY_MS = 300;

const EQ_DIR = process.argv[2] ?? process.env.EQ_INSTALL_DIR;
if (!EQ_DIR) {
  console.error("Usage: bun run scripts/scrape-spell-details.ts <path-to-EQ-install-dir>");
  console.error("(or set the EQ_INSTALL_DIR environment variable)");
  process.exit(1);
}
const DATA_PATH = resolve(import.meta.dir, "../data/graph.json");
const OUT_PATH = resolve(import.meta.dir, "../data/spell-details.json");

export interface SpellDetail {
  description?: string;
  mana?: number;
  skill?: string;
  castTime?: number;
  recastTime?: number;
  fizzleTime?: number;
  duration?: string;
  targetType?: string;
  spellType?: string;
  resist?: string;
  range?: number;
}

// Field offsets verified empirically (see scripts/lib/client-spells.ts and
// DECISIONS.md) — this file's layout is an older two-file client format
// that doesn't match modern EQEmu documentation 1:1.
const FIELD = { range: 4, aoerange: 5, castTime: 8, recastTime: 10, mana: 14, skill: 32 };

const SKILL_BY_ID: Record<number, string> = {
  4: "Abjuration", 5: "Alteration", 12: "Brass", 14: "Conjuration",
  18: "Divination", 24: "Evocation", 41: "Singing", 49: "Stringed",
  54: "Wind", 70: "Percussion",
};

function localDetail(match: ClientSpell): Partial<SpellDetail> {
  const d: Partial<SpellDetail> = {};
  const mana = Number(match.fields[FIELD.mana]);
  if (!Number.isNaN(mana)) d.mana = mana;
  const castTime = Number(match.fields[FIELD.castTime]);
  if (!Number.isNaN(castTime)) d.castTime = castTime / 1000;
  const recastTime = Number(match.fields[FIELD.recastTime]);
  if (!Number.isNaN(recastTime)) d.recastTime = recastTime / 1000;
  const range = Number(match.fields[FIELD.range]);
  const aoerange = Number(match.fields[FIELD.aoerange]);
  if (range) d.range = range;
  else if (aoerange) d.range = aoerange;
  else if (!Number.isNaN(range)) d.range = range;
  const skillId = Number(match.fields[FIELD.skill]);
  if (SKILL_BY_ID[skillId]) d.skill = SKILL_BY_ID[skillId];
  return d;
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function extractField(wikitext: string, field: string): string | null {
  // Field values can span a wikilink with its own "|" (e.g. [[Category:Animal | animal]]),
  // so this can't just stop at the first "|" — that would truncate the value right there,
  // losing the link's closing "]]" and everything after. Instead it looks ahead for the
  // start of the *next* "| field = " line, or the closing "}}", whichever comes first.
  const re = new RegExp(`\\|\\s*${field}\\s*=\\s*([\\s\\S]+?)(?=\\n\\s*\\|\\s*\\w+\\s*=|\\n*\\}\\})`, "i");
  const m = wikitext.match(re);
  return m ? m[1].trim() : null;
}

// [[Target|Display text]] → Display text; [[Target]] → Target
function stripWikiLinks(text: string): string {
  return text
    .replace(/\[\[:?[^\]|]*\|\s*([^\]]+?)\s*\]\]/g, "$1")
    .replace(/\[\[:?([^\]]+?)\]\]/g, "$1");
}

function extractSkill(value: string): string {
  return stripWikiLinks(value).replace(/^Skill\s+/i, "").trim();
}

function parseWikitext(wikitext: string): SpellDetail {
  const d: SpellDetail = {};

  const desc = extractField(wikitext, "description");
  if (desc) d.description = stripWikiLinks(desc);

  const mana = extractField(wikitext, "mana");
  if (mana) d.mana = parseInt(mana, 10) || undefined;

  const skillRaw = extractField(wikitext, "skill");
  if (skillRaw) d.skill = extractSkill(skillRaw);

  const castTime = extractField(wikitext, "casting_time");
  if (castTime) d.castTime = parseFloat(castTime) || undefined;

  const recastTime = extractField(wikitext, "recast_time");
  if (recastTime) d.recastTime = parseFloat(recastTime) || undefined;

  const fizzleTime = extractField(wikitext, "fizzle_time");
  if (fizzleTime) d.fizzleTime = parseFloat(fizzleTime) || undefined;

  const duration = extractField(wikitext, "duration");
  if (duration) d.duration = duration;

  const targetType = extractField(wikitext, "target_type");
  if (targetType) d.targetType = targetType;

  const spellType = extractField(wikitext, "spell_type");
  if (spellType) d.spellType = spellType;

  const resist = extractField(wikitext, "resist");
  if (resist) d.resist = resist;

  const range = extractField(wikitext, "range");
  if (range) d.range = parseFloat(range) || undefined;

  return d;
}

const graph = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
const spells: { id: string; label: string; classLevels: { class: string; level?: number }[] }[] = graph.nodes
  .filter((n: { data: { type: string } }) => n.data.type === "spell")
  .map((n: { data: { id: string; label: string; class_levels: { class: string; level?: number }[] } }) => ({
    id: n.data.id,
    label: n.data.label,
    classLevels: n.data.class_levels,
  }));

// --- Local pass: mana/castTime/recastTime/range/skill/targetType from spells_us.txt ---
const clientSpells = loadClientSpells(EQ_DIR);
const byNameLower = buildNameIndex(clientSpells);
const localDetails: Record<string, Partial<SpellDetail>> = {};
let localMatched = 0;
for (const s of spells) {
  const candidates = byNameLower.get(s.label.toLowerCase()) ?? [];
  const match = bestMatch(s.classLevels, candidates);
  if (!match) continue;
  localDetails[s.id] = localDetail(match);
  localMatched++;
}
console.log(`Local pass: ${localMatched}/${spells.length} spells matched to client data.`);

// --- Wiki pass: description/spellType/resist/fizzleTime/duration, and a
// fallback for skill/targetType/mana/castTime/recastTime/range when the
// local pass didn't find a confident value ---
console.log(`Fetching wiki details for ${spells.length} spells in batches of ${BATCH_SIZE}...`);

let existing: Record<string, SpellDetail> = {};
try {
  existing = JSON.parse(readFileSync(OUT_PATH, "utf-8"));
  console.log(`Resuming from existing file (${Object.keys(existing).length} already fetched)`);
} catch {
  // no existing file
}

const results: Record<string, SpellDetail> = { ...existing };
const todo = spells.filter((s) => !results[s.id]);
console.log(`${todo.length} remaining to fetch from wiki`);

const batches: typeof spells[] = [];
for (let i = 0; i < todo.length; i += BATCH_SIZE) {
  batches.push(todo.slice(i, i + BATCH_SIZE));
}

let fetched = 0;
for (const batch of batches) {
  const titles = batch.map((s) => s.label.replace(/ /g, "_")).join("|");
  const url = `${API}?action=query&titles=${titles}&prop=revisions&rvprop=content&format=json&rvslots=main`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: { query: { pages: Record<string, { title: string; missing?: string; revisions?: { slots: { main: { "*": string } } }[] }> } } = await res.json();

    for (const page of Object.values(data.query.pages)) {
      if (page.missing !== undefined) continue;
      const wikitext = page.revisions?.[0]?.slots?.main?.["*"];
      if (!wikitext) continue;

      const matchingSpell = batch.find(
        (s) => s.label.replace(/ /g, "_") === page.title.replace(/ /g, "_")
      );
      if (!matchingSpell) continue;

      const wikiDetail = parseWikitext(wikitext);
      const merged: SpellDetail = { ...wikiDetail, ...localDetails[matchingSpell.id] };
      if (Object.keys(merged).length > 0) {
        results[matchingSpell.id] = merged;
      }
    }

    fetched += batch.length;
    if (fetched % 100 === 0 || fetched === todo.length) {
      writeFileSync(OUT_PATH, JSON.stringify(results, null, 2));
      console.log(`  ${fetched}/${todo.length} fetched, ${Object.keys(results).length} with data`);
    }
  } catch (err) {
    console.error(`  Batch error: ${err}`);
  }

  if (batches.indexOf(batch) < batches.length - 1) await sleep(DELAY_MS);
}

// Apply local overrides to *every* spell, not just ones fetched this run —
// otherwise entries already cached from a previous (wiki-only) run would
// never pick up the newer local-sourced fields.
let localApplied = 0;
for (const s of spells) {
  const local = localDetails[s.id];
  if (!local || !results[s.id]) continue;
  results[s.id] = { ...results[s.id], ...local };
  localApplied++;
}
console.log(`Applied local overrides to ${localApplied} spells.`);

writeFileSync(OUT_PATH, JSON.stringify(results, null, 2));
console.log(`\nDone — ${Object.keys(results).length} spells with data → data/spell-details.json`);
