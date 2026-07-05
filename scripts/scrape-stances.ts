/**
 * Fetches the "Stances & Invocations" page from the EQL wiki (a single page
 * covering all classes, unlike the per-spell scrape in scrape-spell-details.ts)
 * and parses its two summary wikitables (Stances, Invocations).
 *
 * Outputs data/stances-invocations.json for migration 016.
 *
 * Usage: bun run scripts/scrape-stances.ts
 */

import { writeFileSync } from "fs";
import { resolve } from "path";

const API = "https://eqlwiki.com/api.php";
const PAGE_TITLE = "Stances & Invocations";

const OUT_PATH = resolve(import.meta.dir, "../data/stances-invocations.json");

// Abbreviations as used in the wiki's "Classes" column, mapped to the same
// lowercase full-name convention spell.class_levels uses (see migration 007's
// ALL_CLASSES) — e.g. "shadow knight" with a space, not an underscore.
const CLASS_ABBREVIATIONS: Record<string, string> = {
  BER: "berserker",
  BRD: "bard",
  BST: "beastlord",
  CLR: "cleric",
  DRU: "druid",
  ENC: "enchanter",
  MAG: "magician",
  MNK: "monk",
  NEC: "necromancer",
  PAL: "paladin",
  RNG: "ranger",
  ROG: "rogue",
  SHD: "shadow knight",
  SHM: "shaman",
  WAR: "warrior",
  WIZ: "wizard",
};

export interface StanceOrInvocation {
  name: string;
  description: string;
  classes: string[];
}

// Strips <section begin=X />, <section end=X /> markers and [[wikilinks]] —
// the Invocations table wraps each description in a <section> so the same
// text can be transcluded onto per-class subsections elsewhere on the page.
function cleanDescription(text: string): string {
  return text
    .replace(/<section\s+(?:begin|end)=\S*\s*\/>/gi, "")
    .replace(/\[\[:?[^\]|]*\|\s*([^\]]+?)\s*\]\]/g, "$1")
    .replace(/\[\[:?([^\]]+?)\]\]/g, "$1")
    .replace(/'''([^']+)'''/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function parseClasses(cell: string): string[] {
  return cell
    .split(/&nbsp;|<br\s*\/?>/i)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((abbr) => {
      const full = CLASS_ABBREVIATIONS[abbr];
      if (!full) throw new Error(`Unknown class abbreviation "${abbr}" — update CLASS_ABBREVIATIONS`);
      return full;
    });
}

// Extracts the wikitext of the first {| ... |} table found within `section`.
function extractFirstTable(section: string): string | null {
  const start = section.indexOf("{|");
  if (start === -1) return null;
  const end = section.indexOf("\n|}", start);
  if (end === -1) return null;
  return section.slice(start, end);
}

// Parses a summary table shaped like:
//   |+
//   !Name
//   !Description
//   !Classes
//   |-
//   |RowName
//   |Row description text
//   |ABC&nbsp;DEF<br>GHI
//   |-
//   ...
// A cell's content can itself contain a literal newline (e.g. Divine's
// description has a mid-sentence "\n" in the source), so a plain "split on
// newline, keep lines starting with |" would silently drop that continuation
// text. Only a line starting with "|" begins a new cell — any other line is
// a continuation of the previous cell and must be appended to it, not dropped.
function splitRowIntoCells(row: string): string[] {
  const cells: string[] = [];
  for (const line of row.split("\n")) {
    if (line.startsWith("|")) {
      cells.push(line.slice(1));
    } else if (cells.length > 0) {
      cells[cells.length - 1] += " " + line;
    }
  }
  return cells;
}

function parseSummaryTable(tableWikitext: string): StanceOrInvocation[] {
  const rows = tableWikitext.split(/\n\|-\n/).slice(1); // drop header block before first |-
  const results: StanceOrInvocation[] = [];
  for (const row of rows) {
    const cells = splitRowIntoCells(row);
    if (cells.length < 3) continue; // skip malformed/header rows
    const [name, description, classesCell] = cells;
    results.push({
      name: name.trim(),
      description: cleanDescription(description),
      classes: parseClasses(classesCell),
    });
  }
  return results;
}

function extractSection(wikitext: string, startHeading: string, endHeading: string): string {
  const start = wikitext.indexOf(startHeading);
  if (start === -1) throw new Error(`Could not find heading "${startHeading}"`);
  const end = wikitext.indexOf(endHeading, start);
  if (end === -1) throw new Error(`Could not find heading "${endHeading}"`);
  return wikitext.slice(start, end);
}

async function main() {
  const url = `${API}?action=query&titles=${encodeURIComponent(PAGE_TITLE)}&prop=revisions&rvprop=content&format=json&rvslots=main`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching "${PAGE_TITLE}"`);
  const data = await res.json();
  const page = Object.values(data.query.pages)[0] as {
    missing?: string;
    revisions?: { slots: { main: { "*": string } } }[];
  };
  if (page.missing !== undefined) throw new Error(`Page "${PAGE_TITLE}" not found`);
  const wikitext = page.revisions?.[0]?.slots?.main?.["*"];
  if (!wikitext) throw new Error("No wikitext content returned");

  const stancesSection = extractSection(wikitext, "== Stances ==", "=== Stances by Class ===");
  const invocationsSection = extractSection(wikitext, "== Invocations ==", "=== Invocations by Class ===");

  const stancesTable = extractFirstTable(stancesSection);
  const invocationsTable = extractFirstTable(invocationsSection);
  if (!stancesTable) throw new Error("Could not locate Stances summary table");
  if (!invocationsTable) throw new Error("Could not locate Invocations summary table");

  const stances = parseSummaryTable(stancesTable);
  const invocations = parseSummaryTable(invocationsTable);

  if (stances.length === 0) throw new Error("Parsed zero stances — page structure may have changed");
  if (invocations.length === 0) throw new Error("Parsed zero invocations — page structure may have changed");

  writeFileSync(OUT_PATH, JSON.stringify({ stances, invocations }, null, 2));
  console.log(`Done — ${stances.length} stances, ${invocations.length} invocations → data/stances-invocations.json`);
}

main();
