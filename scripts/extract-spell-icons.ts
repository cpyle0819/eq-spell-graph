/**
 * Downloads each spell's real icon ("spell gem") image directly from its
 * eqlwiki.com page, matched against spells already in data/graph.json.
 * Outputs data/spell-icons.json (graph spell id -> icon key) for migration
 * 024, and saves the actual icon art to public/icons/gem-<key>.png, one
 * file per distinct icon key actually used (spells sharing an icon share a
 * file).
 *
 * **Deliberate, documented exception to this repo's usual local-client-data
 * policy** — every local-client extraction elsewhere in this repo
 * (scripts/extract-spell-lines.ts, scripts/scrape-spell-details.ts) outputs
 * only small derived facts and never copies Daybreak's actual proprietary
 * asset files into the repo. Real spell-gem art is the art itself, not a
 * fact derived from it, so committing these images is a knowing departure
 * from that policy, not an accidental one — see decisions/
 * spell-icons-real-client-art-exception.md, including its correction
 * history (two earlier, wrong approaches: guessing which spells_us.txt
 * field held the icon id, then guessing the local sprite sheet's grid
 * layout — both looked plausible and were both wrong).
 *
 * Why not crop the local client's Spells<NN>.tga sprite sheets directly
 * (as public/uifiles' EQUI_SpellIcons.xml implies a Grid=true, 40x40-cell
 * layout should allow)? Brute-force pixel search against eqlwiki.com's own
 * reference images proved icons are NOT packed into the sheets in a
 * sequential/arithmetic order recoverable from spells_us.txt's icon-id
 * field — e.g. id 99 sits at sheet 1's very first cell while id 23 sits
 * three rows into the same sheet. That mapping lives in a lookup table
 * inside the compiled client this repo has no access to. eqlwiki.com
 * already hosts the correctly-cropped image per spell (that's how the
 * three ground-truth mismatches above were found), so this script fetches
 * from there directly instead of re-deriving a layout that isn't
 * recoverable from available data.
 *
 * Each spell's wiki page is fetched by title (same URL convention as
 * public/components/card-base.js's wikiUrl(): https://eqlwiki.com/ +
 * encodeURIComponent(title.replace(/ /g, "_"))), and its `Spellicon_<key>`
 * image reference is read from the page's raw HTML — not an AI-summarized
 * fetch, after one previous attempt at this via a summarizing fetch tool
 * reported a plausible-looking but wrong filename. `<key>` is usually
 * numeric (e.g. "99") but is sometimes a single letter (e.g. "K") for
 * spells — mostly buffs — the wiki itself apparently couldn't pin a
 * confident numeric icon to either, and shows a generic placeholder for
 * instead. Both are downloaded and used as-is: whatever eqlwiki.com
 * displays for a spell is, by construction, what this feature is trying to
 * mirror.
 *
 * Usage: bun run scripts/extract-spell-icons.ts
 * (no local client install needed for this script specifically, unlike its
 * siblings — kept in the same family since it's the same
 * matched-against-graph.json, local-client-adjacent shape, and shares this
 * repo's "no hardcoded local path" spirit by not needing one at all.)
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const OUT_PATH = resolve(import.meta.dir, "../data/spell-icons.json");
const ICONS_DIR = resolve(import.meta.dir, "../public/icons");
const WIKI_BASE = "https://eqlwiki.com/";
const DELAY_MS = 250;

function wikiUrl(pageTitle: string): string {
  return WIKI_BASE + encodeURIComponent(pageTitle.replace(/ /g, "_"));
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface GraphSpell {
  id: string;
  label: string;
}

function loadGraphSpells(): GraphSpell[] {
  const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));
  return graph.nodes
    .filter((n: { data: { type: string } }) => n.data.type === "spell")
    .map((n: { data: { id: string; label: string } }) => ({ id: n.data.id, label: n.data.label }));
}

const ICON_RE = /(\/images\/\w\/\w\w\/Spellicon_([^."]+)\.png)/;

async function findSpellIcon(label: string): Promise<{ key: string; path: string } | null> {
  const res = await fetch(wikiUrl(label), { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) return null;
  const html = await res.text();
  const m = html.match(ICON_RE);
  if (!m) return null;
  return { key: m[2], path: m[1] };
}

function sanitizeKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9]+/g, "-");
}

const graphSpells = loadGraphSpells();
mkdirSync(ICONS_DIR, { recursive: true });

const iconBySpell: Record<string, string> = {};
const downloadedKeys = new Set<string>();
let matched = 0;
let failed = 0;

for (const [i, spell] of graphSpells.entries()) {
  const found = await findSpellIcon(spell.label);
  if (!found) {
    failed++;
  } else {
    const safeKey = sanitizeKey(found.key);
    iconBySpell[spell.id] = safeKey;
    matched++;

    if (!downloadedKeys.has(safeKey)) {
      downloadedKeys.add(safeKey);
      try {
        const imgRes = await fetch(WIKI_BASE.replace(/\/$/, "") + found.path, { headers: { "User-Agent": "Mozilla/5.0" } });
        if (imgRes.ok) {
          const buf = Buffer.from(await imgRes.arrayBuffer());
          writeFileSync(resolve(ICONS_DIR, `gem-${safeKey}.png`), buf);
        }
      } catch {
        // Image fetch failed independently of the page fetch — leave
        // iconBySpell entry as-is; the spell just won't have art on disk.
      }
    }
  }

  if ((i + 1) % 50 === 0 || i === graphSpells.length - 1) {
    console.log(`  ${i + 1}/${graphSpells.length} spells checked (${matched} matched, ${downloadedKeys.size} distinct icons downloaded)`);
    writeFileSync(OUT_PATH, JSON.stringify(iconBySpell, null, 2));
  }

  await sleep(DELAY_MS);
}

writeFileSync(OUT_PATH, JSON.stringify(iconBySpell, null, 2));
console.log(`\nDone. ${matched}/${graphSpells.length} spells matched to a wiki icon (${failed} failed), ${downloadedKeys.size} distinct icon images downloaded.`);
console.log(`Written to data/spell-icons.json and public/icons/`);
