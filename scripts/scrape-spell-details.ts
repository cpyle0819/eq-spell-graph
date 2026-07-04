/**
 * Fetches spell detail data from the EQL wiki MediaWiki API in batches.
 * Outputs data/spell-details.json for migration 011.
 *
 * Usage: bun run scripts/scrape-spell-details.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const API = "https://eqlwiki.com/api.php";
const BATCH_SIZE = 50;
const DELAY_MS = 300;

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

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function extractField(wikitext: string, field: string): string | null {
  const re = new RegExp(`\\|\\s*${field}\\s*=\\s*([^\\n|{}]+)`, "i");
  const m = wikitext.match(re);
  return m ? m[1].trim() : null;
}

function extractSkill(value: string): string {
  // [[Skill Alteration | Alteration]] → Alteration
  const m = value.match(/\[\[.*?\|\s*(.+?)\s*\]\]/);
  if (m) return m[1].trim();
  // [[Alteration]] → Alteration
  const m2 = value.match(/\[\[(.+?)\]\]/);
  if (m2) return m2[1].replace(/^Skill\s+/i, "").trim();
  return value.replace(/\[\[|\]\]/g, "").trim();
}

function parseWikitext(wikitext: string): SpellDetail {
  const d: SpellDetail = {};

  const desc = extractField(wikitext, "description");
  if (desc) d.description = desc;

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
const spells: { id: string; label: string }[] = graph.nodes
  .filter((n: { data: { type: string } }) => n.data.type === "spell")
  .map((n: { data: { id: string; label: string } }) => ({ id: n.data.id, label: n.data.label }));

console.log(`Fetching details for ${spells.length} spells in batches of ${BATCH_SIZE}...`);

// Load existing output so we can resume if interrupted
let existing: Record<string, SpellDetail> = {};
try {
  existing = JSON.parse(readFileSync(OUT_PATH, "utf-8"));
  const done = Object.keys(existing).length;
  console.log(`Resuming from existing file (${done} already fetched)`);
} catch {
  // no existing file
}

const results: Record<string, SpellDetail> = { ...existing };

// Filter out already-fetched spells
const todo = spells.filter((s) => !results[s.id]);
console.log(`${todo.length} remaining to fetch`);

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

      // Find the corresponding spell ID by matching the title back to a spell
      const matchingSpell = batch.find(
        (s) => s.label.replace(/ /g, "_") === page.title.replace(/ /g, "_")
      );
      if (!matchingSpell) continue;

      const detail = parseWikitext(wikitext);
      if (Object.keys(detail).length > 0) {
        results[matchingSpell.id] = detail;
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

writeFileSync(OUT_PATH, JSON.stringify(results, null, 2));
console.log(`\nDone — ${Object.keys(results).length} spells with data → data/spell-details.json`);
