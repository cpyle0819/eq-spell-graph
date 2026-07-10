/**
 * Fetches a short lore blurb for every `type: "zone"` node in data/graph.json
 * from that zone's actual eqlwiki.com page, via the real MediaWiki API
 * (raw wikitext, same fetch()+parse pattern as scrape-disciplines.ts/
 * scrape-aa.ts — not the WebFetch/WebSearch AI summarizer).
 *
 * Zone graph labels don't always match eqlwiki.com page titles exactly
 * (decisions/zone-naming-mismatches.md) — e.g. several distinct zone nodes
 * here (West/East/North Freeport; the four Felwithe nodes; West Karana vs.
 * Western Karana; three Neriak nodes) share a single combined eqlwiki.com
 * page. The API's `redirects=1` param resolves these automatically, so
 * every zone label is queried as-is and whatever page it resolves to
 * supplies the blurb — multiple graph zones legitimately end up with the
 * same lore text when eqlwiki.com itself treats them as one place.
 *
 * Extraction: eqlwiki.com zone pages open with leading templates (e.g.
 * "{{Classic Era}}"), sometimes a flavor quote + "-Attribution" line, then
 * the real descriptive prose, then a "{|" wikitable (infobox/map legend).
 * This strips templates/magic words/image lines, drops quote+attribution
 * line pairs, takes what's left before the first table, cleans remaining
 * wikitext markup, and trims to the first ~2 sentences.
 *
 * Resumable: skips zones that already have a `lore` field or previously
 * failed and got logged (re-run backfills only what's missing).
 *
 * Usage: bun run scripts/scrape-zone-lore.ts
 * Outputs data/zone-lore.json for migration 022.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

const API = "https://eqlwiki.com/api.php";
const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const OUT_PATH = resolve(import.meta.dir, "../data/zone-lore.json");
const CHUNK_SIZE = 30; // conservative; MediaWiki's default titles= cap is 50 for non-bots
const DELAY_MS = 300;

interface ZoneLoreResult {
  label: string;
  wikiTitle: string | null; // final resolved title, or null if unresolved/no lore found
  lore: string | null;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

function cleanWikitext(text: string): string {
  return text
    .replace(/\[\[:?[^\]|]*\|\s*([^\]]+?)\s*\]\]/g, "$1") // [[link|Display]] -> Display
    .replace(/\[\[:?([^\]]+?)\]\]/g, "$1") // [[Link]] -> Link
    // Lazy `.+?` (not `[^']+`) — zone names routinely contain a single
    // apostrophe inside bold markup (e.g. "'''Nagafen's Lair'''"), which a
    // character-class exclusion can't match through.
    .replace(/'''''(.+?)'''''/g, "$1") // bold-italic
    .replace(/'''(.+?)'''/g, "$1") // bold
    .replace(/''(.+?)''/g, "$1") // italic
    .replace(/<[^>]+>/g, " ") // stray HTML tags (<br>, etc.)
    .replace(/\.{2,}/g, ".") // collapse source typos like "creatures.."
    .replace(/^\s*\d+(?=[A-Z])/, "") // strip stray leading digit artifacts, e.g. "33The Ruins..."
    .replace(/\s+/g, " ")
    .trim();
}

// Extracts a 1-3 sentence lore blurb from a zone page's raw wikitext.
// Returns null if no substantial prose could be isolated.
function extractLore(wikitext: string): string | null {
  const tableIdx = wikitext.indexOf("{|");
  let intro = tableIdx === -1 ? wikitext.slice(0, 3000) : wikitext.slice(0, tableIdx);

  // Strip leading/embedded simple (non-nested) templates, e.g. "{{Classic
  // Era}}", "{{revamped}}", "{{Disambig3|[[Clan Runnyeye (Faction)]]}}".
  intro = intro.replace(/\{\{[^{}]*\}\}/g, "");
  // Strip magic words.
  intro = intro.replace(/__[A-Z]+__/g, "");

  const rawLines = intro.split("\n");
  // Strip inline File:/Image: links (these are often immediately followed
  // by real prose on the same line with no separating whitespace, e.g.
  // "[[File:befallen-well.png|right]]Befallen was once...") rather than
  // dropping the whole line, then drop any line left empty by that. Also
  // drop lines that are a single bolded callout with nothing else on the
  // line (e.g. "'''Mob pathing is buggy in parts of this zone...'''") —
  // an editorial warning, not descriptive prose; recognized by having
  // exactly one '''...''' span covering the entire trimmed line.
  const lines = rawLines
    .map((l) => l.replace(/\[\[(File|Image):[^\]]*\]\]/gi, ""))
    .filter((l) => l.trim().length > 0)
    .filter((l) => {
      const t = l.trim();
      const boldMarkers = (t.match(/'''/g) || []).length;
      return !(t.startsWith("'''") && t.endsWith("'''") && boldMarkers === 2);
    });

  // Drop a leading flavor quote + attribution, e.g. Felwithe's epigraph
  // ending "-Captain Rohand", Runnyeye's "- May 30, 2001 patch notes"
  // teaser, or Skyfire's multi-line quote ending "-Todd Schmidt...". These
  // always end with a line starting with "-"; look for the first such line
  // within the first several lines of the intro and drop everything up to
  // and including it (real prose never opens with a line starting "-").
  let dashIdx = -1;
  for (let i = 0; i < Math.min(lines.length, 8); i++) {
    if (lines[i].trim().startsWith("-")) {
      dashIdx = i;
      break;
    }
  }
  const kept = dashIdx === -1 ? lines : lines.slice(dashIdx + 1);

  const joined = cleanWikitext(kept.join(" "));
  if (joined.length < 40) return null;

  // Trim to roughly the first two sentences, capped so it stays blurb-sized.
  const sentences = joined.match(/[^.!?]+[.!?]+/g) || [joined];
  let blurb = "";
  for (const s of sentences) {
    const next = blurb ? `${blurb} ${s.trim()}` : s.trim();
    if (blurb && next.length > 320) break;
    blurb = next;
    if (blurb.length > 160) break; // two solid sentences is plenty
  }
  blurb = blurb.trim();
  return blurb.length >= 40 ? blurb : null;
}

async function fetchBatch(titles: string[]): Promise<{
  pagesByTitle: Map<string, string>; // resolved title -> wikitext
  resolve: Map<string, string>; // original title -> resolved title
}> {
  const url = `${API}?action=query&titles=${encodeURIComponent(titles.join("|"))}&prop=revisions&rvprop=content&format=json&rvslots=main&redirects=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching batch`);
  const data = await res.json();

  const pagesByTitle = new Map<string, string>();
  for (const p of Object.values(data.query.pages) as any[]) {
    if (p.missing !== undefined) continue;
    const wt = p.revisions?.[0]?.slots?.main?.["*"];
    if (wt) pagesByTitle.set(p.title, wt);
  }

  // original -> normalized -> redirect-target chain
  const resolveMap = new Map<string, string>();
  for (const t of titles) resolveMap.set(t, t);
  for (const n of data.query.normalized || []) {
    for (const [orig, cur] of resolveMap) {
      if (cur === n.from) resolveMap.set(orig, n.to);
    }
  }
  for (const r of data.query.redirects || []) {
    for (const [orig, cur] of resolveMap) {
      if (cur === r.from) resolveMap.set(orig, r.to);
    }
  }

  return { pagesByTitle, resolve: resolveMap };
}

async function main() {
  const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));
  const zoneLabels: string[] = graph.nodes
    .filter((n: any) => n.data.type === "zone")
    .map((n: any) => n.data.label);

  let prior: ZoneLoreResult[] = [];
  if (existsSync(OUT_PATH)) {
    prior = JSON.parse(readFileSync(OUT_PATH, "utf-8"));
  }
  const done = new Map(prior.map((r) => [r.label, r]));

  const remaining = zoneLabels.filter((l) => !done.has(l));
  console.log(`${zoneLabels.length} zones total, ${done.size} already resolved, ${remaining.length} to fetch.`);

  const results: ZoneLoreResult[] = [...prior];

  const batches = chunk(remaining, CHUNK_SIZE);
  for (let bi = 0; bi < batches.length; bi++) {
    const batch = batches[bi];
    console.log(`Batch ${bi + 1}/${batches.length} (${batch.length} titles)...`);
    const { pagesByTitle, resolve: resolveMap } = await fetchBatch(batch);

    for (const label of batch) {
      const finalTitle = resolveMap.get(label) || label;
      const wikitext = pagesByTitle.get(finalTitle);
      if (!wikitext) {
        console.log(`  NO PAGE: "${label}" (tried "${finalTitle}")`);
        results.push({ label, wikiTitle: null, lore: null });
        continue;
      }
      const lore = extractLore(wikitext);
      if (!lore) {
        console.log(`  NO EXTRACTABLE PROSE: "${label}" -> "${finalTitle}"`);
        results.push({ label, wikiTitle: finalTitle, lore: null });
        continue;
      }
      console.log(`  OK: "${label}" -> "${finalTitle}"`);
      results.push({ label, wikiTitle: finalTitle, lore });
    }

    writeFileSync(OUT_PATH, JSON.stringify(results, null, 2));
    if (bi < batches.length - 1) await sleep(DELAY_MS);
  }

  const withLore = results.filter((r) => r.lore).length;
  console.log(`\nDone — ${withLore}/${results.length} zones got a lore blurb → data/zone-lore.json`);
  const failed = results.filter((r) => !r.lore);
  if (failed.length) {
    console.log(`No lore for ${failed.length}:`);
    for (const f of failed) console.log(`  - ${f.label}${f.wikiTitle ? ` (page "${f.wikiTitle}" had no extractable prose)` : " (no page found)"}`);
  }
}

main();
