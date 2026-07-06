/**
 * Fetches the "Disciplines" page from the EQL wiki (a single page covering
 * every class's discipline table, same shape as scrape-stances.ts) and
 * parses the Rogue section only.
 *
 * Every other class's table on this page is either empty or entirely
 * struck-through (wrapped in <s>...</s>, the wiki's own convention for
 * "not yet implemented on Legends") — confirmed by fetching the raw
 * wikitext directly via the MediaWiki API. Only Rogue has real, live rows.
 * Re-run this if the wiki ever unstrikes another class's table.
 *
 * Outputs data/disciplines.json for migration 018.
 *
 * Usage: bun run scripts/scrape-disciplines.ts
 */

import { writeFileSync } from "fs";
import { resolve } from "path";

const API = "https://eqlwiki.com/api.php";
const PAGE_TITLE = "Disciplines";

const OUT_PATH = resolve(import.meta.dir, "../data/disciplines.json");

export interface Discipline {
  name: string;
  level: number;
  description: string;
  duration: string;
  reuseTime: string;
  category: "combat" | "utility";
}

// Rogue discipline names are prefixed with a colored <span> tag reading
// "Combat" or "Utility" (poison type) — strip it into its own field rather
// than leaving markup in the name.
function parseNameCell(cell: string): { name: string; category: "combat" | "utility" } {
  const spanMatch = cell.match(/<span[^>]*>(Combat|Utility)<\/span>\s*(.+)/i);
  if (!spanMatch) throw new Error(`Rogue discipline row missing Combat/Utility tag: "${cell}"`);
  return { category: spanMatch[1].toLowerCase() as "combat" | "utility", name: spanMatch[2].trim() };
}

function cleanDescription(text: string): string {
  return text
    .replace(/\[\[:?[^\]|]*\|\s*([^\]]+?)\s*\]\]/g, "$1")
    .replace(/\[\[:?([^\]]+?)\]\]/g, "$1")
    .replace(/'''([^']+)'''/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

// Same continuation-line handling as scrape-stances.ts's splitRowIntoCells —
// a cell's wikitext can wrap across multiple source lines.
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

function parseRogueTable(tableWikitext: string): Discipline[] {
  const rows = tableWikitext.split(/\n\|-\s*\n/).slice(1); // drop header block before first |-
  const results: Discipline[] = [];
  for (const row of rows) {
    const cells = splitRowIntoCells(row);
    if (cells.length < 5) continue; // skip malformed/empty rows
    const [nameCell, levelCell, descCell, durationCell, reuseCell] = cells;
    if (/<s>/i.test(nameCell)) continue; // struck-through = not implemented
    const { name, category } = parseNameCell(nameCell.trim());
    results.push({
      name,
      level: parseInt(levelCell.trim(), 10),
      description: cleanDescription(descCell),
      duration: durationCell.trim(),
      reuseTime: reuseCell.trim(),
      category,
    });
  }
  return results;
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

  const rogueStart = wikitext.indexOf("=== [[Rogue]] ===");
  if (rogueStart === -1) throw new Error("Could not find Rogue section");
  const rogueEnd = wikitext.indexOf("\n=== ", rogueStart + 1);
  const rogueSection = wikitext.slice(rogueStart, rogueEnd === -1 ? undefined : rogueEnd);

  const tableStart = rogueSection.indexOf("{|");
  const tableEnd = rogueSection.indexOf("\n|}", tableStart);
  if (tableStart === -1 || tableEnd === -1) throw new Error("Could not locate Rogue discipline table");
  const table = rogueSection.slice(tableStart, tableEnd);

  const disciplines = parseRogueTable(table);
  if (disciplines.length === 0) throw new Error("Parsed zero disciplines — page structure may have changed");

  writeFileSync(OUT_PATH, JSON.stringify(disciplines, null, 2));
  console.log(`Done — ${disciplines.length} Rogue disciplines → data/disciplines.json`);
}

main();
