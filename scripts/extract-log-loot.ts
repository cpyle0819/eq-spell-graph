/**
 * Extracts {zone, mob, item} loot records from a raw EQL chat log
 * (`eqlog_<Character>_<Server>.txt`), by tracking "You have entered <Zone>."
 * lines to know which zone every subsequent loot line happened in. Mob and
 * item names come straight off the loot line itself (both formats below
 * self-contain "from <mob>'s corpse"), no correlation with a separate death
 * line needed.
 *
 * Loot line formats seen in a real log:
 *   "--You have looted a Pristine Giant Scarab Carapace from Ankhesenaten's corpse.--"
 *   "You looted a Rain Water from a gnoll guard's corpse and sold it for 1 gold and 7 copper."
 *   "You looted 2 Snake Venom Sac from a giant snake's corpse and sold it for 7 gold, 1 silver and 4 copper."
 *   "You looted a Snake Egg from a giant snake's corpse and stored it in your tradeskill depot"
 * The tail after "'s corpse" varies (sold/stored/kept) and isn't captured --
 * this is a loot table, not a disposition log.
 *
 * A log's zone name doesn't always match this graph's zone label 1:1 (e.g.
 * "Southern Plains of Karana" in-game vs "Southern Karana" here) -- resolved
 * via a small alias table below plus two generic transforms (drop a leading
 * "The ", drop a trailing " N (Adaptive)" instance suffix). Anything still
 * unresolved is kept in the output with zoneId: null and reported separately
 * rather than guessed at or silently dropped.
 *
 * EQL's "+N" suffix (e.g. "Rusty Rapier +2") marks an upgraded tier of the
 * same base item, not a distinct item -- stripped from every item name here,
 * up front, so "Rusty Rapier" and "Rusty Rapier +2" collapse to one record
 * before anything downstream (the graph migration, its dedup-by-slug) ever
 * sees them as two different things.
 *
 * Cursor: a real EQL log file only ever grows (the client appends, never
 * rewrites), and a player isn't expected to clear it between sessions just
 * to keep this pipeline sane. So this script tracks how much of the file
 * it's already read via a sibling `<input>.cursor.json`, written after every
 * run, and resumes from there next time -- rerunning against an unchanged
 * tail produces an empty (not re-duplicated) record set, and a grown file
 * only yields the new lines. The cursor is a raw character offset into the
 * file, not a line count or a timestamp: EQL's own
 * `[Www Mmm dd hh:mm:ss yyyy]` format has no timezone and is fragile to
 * parse back into a comparable value, and a line count runs into its own
 * off-by-one trap -- `raw.split(/\r?\n/)` on a file that (like every real
 * EQL log write) ends in a trailing newline produces one extra empty-string
 * element that doesn't correspond to a real line, so a *count* of split()
 * results silently overshoots by exactly the width of whatever gets
 * appended next. Slicing the raw string by character offset first, then
 * splitting only the new remainder, has no such artifact to miscount. The
 * cursor also carries the last-known zone forward, since a resumed run's
 * first new lines may be loot lines with no fresh "You have entered" line
 * of their own yet (still in the same zone from last time) -- without this
 * they'd resolve to no zone and get silently dropped. A cursor offset
 * that's now *past* the file's current length (a log that got
 * rotated/cleared, not just appended to) is treated as stale and reset to a
 * fresh parse from the start, since the file it refers to no longer exists
 * in any meaningful sense.
 *
 * Usage: bun run scripts/extract-log-loot.ts <path-to-eqlog.txt> [output-path]
 * Default output: <input>.loot.json next to the source log.
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

const LINE = /^\[(.+?)\] (.*)$/;
const ENTER_ZONE = /^You have entered (.+)\.$/;
const LOOT = /^(?:--)?You (?:have looted|looted) (?:(\d+) )?(?:an? )?(.+?) from (.+?)'s corpse/;

// Known log-name -> graph-zone-label mismatches. Extend as more logs surface more.
const ZONE_ALIASES: Record<string, string> = {
  "Northern Plains of Karana": "Northern Karana",
  "Southern Plains of Karana": "Southern Karana",
  "Western Plains of Karana": "Western Karana",
  "Eastern Plains of Karana": "Eastern Karana",
  "The Liberated Citadel of Runnyeye": "Runnyeye Citadel",
  "Liberated Citadel of Runnyeye": "Runnyeye Citadel",
  "Lair of the Splitpaw": "Splitpaw",
};

type LootRecord = {
  timestamp: string;
  zoneId: string | null;
  zoneLabel: string; // raw log zone name, kept even when zoneId resolved, for auditing
  mob: string;
  item: string;
  quantity: number;
};

function stripUpgradeTier(itemLabel: string): string {
  return itemLabel.replace(/ \+\d+$/, "");
}

function resolveZoneId(rawLabel: string, labelToId: Map<string, string>): string | null {
  const stripped = rawLabel.replace(/^The /, "").replace(/ \d+ \(\w+\)$/, "");
  const candidates = [rawLabel, stripped, ZONE_ALIASES[rawLabel], ZONE_ALIASES[stripped]];
  for (const c of candidates) {
    if (c && labelToId.has(c)) return labelToId.get(c)!;
  }
  return null;
}

type Cursor = { bytesProcessed: number; zoneId: string | null; zoneLabel: string };

function cursorPath(logPath: string): string {
  return `${logPath}.cursor.json`;
}

function loadCursor(logPath: string): Cursor {
  const path = cursorPath(logPath);
  if (!existsSync(path)) return { bytesProcessed: 0, zoneId: null, zoneLabel: "" };
  try {
    const c = JSON.parse(readFileSync(path, "utf-8"));
    return { bytesProcessed: c.bytesProcessed ?? 0, zoneId: c.zoneId ?? null, zoneLabel: c.zoneLabel ?? "" };
  } catch {
    return { bytesProcessed: 0, zoneId: null, zoneLabel: "" };
  }
}

function saveCursor(logPath: string, cursor: Cursor) {
  writeFileSync(cursorPath(logPath), JSON.stringify(cursor, null, 2) + "\n");
}

const [inputPath, outputPathArg] = process.argv.slice(2);
if (!inputPath) {
  console.error("Usage: bun run scripts/extract-log-loot.ts <path-to-eqlog.txt> [output-path]");
  process.exit(1);
}

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));
const labelToId = new Map<string, string>(
  graph.nodes.filter((n: { type: string }) => n.type === "zone").map((n: { id: string; label: string }) => [n.label, n.id])
);

const resolvedInputPath = resolve(inputPath);
const raw = readFileSync(resolvedInputPath, "utf-8");

let cursor = loadCursor(resolvedInputPath);
if (cursor.bytesProcessed > raw.length) {
  console.log(`Cursor (${cursor.bytesProcessed} chars) is past the current file's length (${raw.length}) -- log appears to have been rotated/cleared; parsing from the start.`);
  cursor = { bytesProcessed: 0, zoneId: null, zoneLabel: "" };
}

let currentZoneId: string | null = cursor.zoneId;
let currentZoneLabel: string = cursor.zoneLabel;
const records: LootRecord[] = [];
const unresolvedZoneLabels = new Set<string>();

for (const line of raw.slice(cursor.bytesProcessed).split(/\r?\n/)) {
  if (!line.trim()) continue;
  const m = line.match(LINE);
  if (!m) continue;
  const [, timestamp, text] = m;

  const enter = text.match(ENTER_ZONE);
  if (enter) {
    currentZoneLabel = enter[1];
    currentZoneId = resolveZoneId(currentZoneLabel, labelToId);
    if (!currentZoneId) unresolvedZoneLabels.add(currentZoneLabel);
    continue;
  }

  const loot = text.match(LOOT);
  if (loot) {
    const [, qty, item, mob] = loot;
    records.push({
      timestamp,
      zoneId: currentZoneId,
      zoneLabel: currentZoneLabel,
      mob,
      item: stripUpgradeTier(item),
      quantity: qty ? Number(qty) : 1,
    });
  }
}

const outputPath = resolve(outputPathArg ?? `${inputPath}.loot.json`);
writeFileSync(outputPath, JSON.stringify(records, null, 2) + "\n");
saveCursor(resolvedInputPath, { bytesProcessed: raw.length, zoneId: currentZoneId, zoneLabel: currentZoneLabel });

const resolved = records.filter((r) => r.zoneId);
const uniquePairs = new Set(resolved.map((r) => `${r.zoneId}::${r.mob}`));
console.log(`${records.length} new loot record(s) since the last run -> ${outputPath}`);
console.log(`  ${resolved.length} with a resolved zone, ${records.length - resolved.length} unresolved`);
console.log(`  ${uniquePairs.size} unique (zone, mob) pair(s)`);
console.log(`  cursor advanced to char ${raw.length} (${cursorPath(resolvedInputPath)})`);
if (unresolvedZoneLabels.size) {
  console.log(`  Unresolved zone label(s) seen (add to ZONE_ALIASES or the graph is missing this zone):`);
  for (const z of unresolvedZoneLabels) console.log(`    - ${z}`);
}
