/**
 * Fetches the "Alternate Advancement" page from the EQL wiki (a single page
 * covering all classes, unlike the per-spell scrape in scrape-spell-details.ts
 * — same shape of source as scrape-stances.ts) and parses its four category
 * wikitables: General AAs, Archetype AAs, Class AAs (one subsection+table per
 * class), and Special AAs.
 *
 * Outputs data/aa.json for migration 017.
 *
 * Usage: bun run scripts/scrape-aa.ts
 */

import { writeFileSync } from "fs";
import { resolve } from "path";

const API = "https://eqlwiki.com/api.php";
const PAGE_TITLE = "Alternate Advancement";

const OUT_PATH = resolve(import.meta.dir, "../data/aa.json");

export type AACategory = "general" | "archetype" | "class" | "special";

export interface AAEntry {
  name: string;
  ranks: number;
  cost: string;
  description: string;
  classes: string[];
  category: AACategory;
}

// Strips [[wikilinks]] and '''bold''' markup — same approach as
// scrape-stances.ts's cleanDescription.
function cleanDescription(text: string): string {
  return text
    .replace(/\[\[:?[^\]|]*\|\s*([^\]]+?)\s*\]\]/g, "$1")
    .replace(/\[\[:?([^\]]+?)\]\]/g, "$1")
    .replace(/'''([^']+)'''/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

// Unlike the Stances & Invocations summary tables (one "|" per line per
// cell), each AA row is a single wikitext line with cells separated by
// "||" — e.g. "| Adamant Will || 4 || 2/4/?/? || This passive ability...".
// Any stray line break inside a cell (none observed in practice, but cheap
// to guard) is folded into a space before splitting on "||".
function splitRowIntoCells(row: string): string[] {
  const line = row.replace(/\n/g, " ").trim();
  return line
    .replace(/^\|/, "")
    .split(/\|\|/)
    .map((c) => c.trim());
}

// Extracts the wikitext of the first {| ... |} table found within `section`.
function extractFirstTable(section: string): string | null {
  const start = section.indexOf("{|");
  if (start === -1) return null;
  const end = section.indexOf("\n|}", start);
  if (end === -1) return null;
  return section.slice(start, end);
}

// Parses a table shaped like:
//   {| class="wikitable sortable"
//   ! Name !! Ranks !! Cost !! Description
//   |-
//   | Foo || 3 || 2/4/6 || Does a thing. Requirements: level 1.
//   |-
//   ...
// An optional leading `! colspan="4" | ...` row (used for Class/Special AA
// section titles) sits before the real header row — since we drop everything
// before the first "|-" anyway, it's harmless.
function parseTable(tableWikitext: string, classes: string[], category: AACategory): AAEntry[] {
  const rows = tableWikitext.split(/\n\|-\n/).slice(1); // drop header block before first |-
  const results: AAEntry[] = [];
  for (const row of rows) {
    const cells = splitRowIntoCells(row);
    if (cells.length < 4) continue; // skip malformed/header rows
    const [name, ranks, cost, description] = cells;
    const ranksNum = parseInt(ranks.trim(), 10);
    if (!name.trim() || Number.isNaN(ranksNum)) continue;
    results.push({
      name: name.trim(),
      ranks: ranksNum,
      cost: cost.trim(),
      description: cleanDescription(description),
      classes,
      category,
    });
  }
  return results;
}

function extractSection(wikitext: string, startHeading: string, endHeading: string | null): string {
  const start = wikitext.indexOf(startHeading);
  if (start === -1) throw new Error(`Could not find heading "${startHeading}"`);
  const end = endHeading ? wikitext.indexOf(endHeading, start) : wikitext.length;
  if (endHeading && end === -1) throw new Error(`Could not find heading "${endHeading}"`);
  return wikitext.slice(start, end);
}

// Splits the "Class AAs" section into one { className, tableWikitext } pair
// per "=== X Class AAs ===" subsection.
function splitClassSubsections(classSection: string): { className: string; table: string }[] {
  const headingRe = /=== (.+?) Class AAs ===/g;
  const matches = [...classSection.matchAll(headingRe)];
  const out: { className: string; table: string }[] = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index! + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : classSection.length;
    const table = extractFirstTable(classSection.slice(start, end));
    if (!table) throw new Error(`Could not locate table for "${matches[i][1]} Class AAs"`);
    out.push({ className: matches[i][1].toLowerCase(), table });
  }
  return out;
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

  const generalSection = extractSection(wikitext, "== General AAs ==", "== Archetype AAs ==");
  const archetypeSection = extractSection(wikitext, "== Archetype AAs ==", "== Class AAs ==");
  const classSection = extractSection(wikitext, "== Class AAs ==", "== Special AAs ==");
  const specialSection = extractSection(wikitext, "== Special AAs ==", null);

  const classSubsections = splitClassSubsections(classSection);
  // The class roster is derived from the "Class AAs" subsection headings
  // themselves (16 classes, including Berserker/Monk/Warrior/Rogue, which
  // have no purchasable spells — see DECISIONS.md) rather than hardcoded,
  // so General/Archetype/Special AAs (which apply to every class) stay in
  // sync with whatever classes the wiki actually documents.
  const allClasses = classSubsections.map((c) => c.className).sort();

  const generalTable = extractFirstTable(generalSection);
  // The wiki's Archetype AAs table has no per-class breakdown — its own prose
  // says "every class ... has Archetype AAs, some classes have more than
  // others" but doesn't say which. There's no per-ability source to subset
  // by class, so (like General/Special) these are tagged all-classes; see
  // DECISIONS.md for the approximation this makes.
  const archetypeTable = extractFirstTable(archetypeSection);
  const specialTable = extractFirstTable(specialSection);
  if (!generalTable) throw new Error("Could not locate General AAs table");
  if (!archetypeTable) throw new Error("Could not locate Archetype AAs table");
  if (!specialTable) throw new Error("Could not locate Special AAs table");

  const entries: AAEntry[] = [
    ...parseTable(generalTable, allClasses, "general"),
    ...parseTable(archetypeTable, allClasses, "archetype"),
    ...parseTable(specialTable, allClasses, "special"),
    ...classSubsections.flatMap((c) => parseTable(c.table, [c.className], "class")),
  ];

  if (entries.length === 0) throw new Error("Parsed zero AA entries — page structure may have changed");

  writeFileSync(OUT_PATH, JSON.stringify({ classes: allClasses, entries }, null, 2));
  console.log(`Done — ${entries.length} AA entries across ${allClasses.length} classes → data/aa.json`);
}

main();
