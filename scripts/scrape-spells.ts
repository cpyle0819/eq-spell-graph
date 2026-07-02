/**
 * Scrapes eqlwiki.com for spell/vendor data for all classes with purchasable spells.
 * Outputs data/scraped-spells.json for consumption by migration 008.
 *
 * Usage: bun run scripts/scrape-spells.ts
 */

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE = "https://www.eqlwiki.com";
const DELAY_MS = 400;

// Classes with purchasable spells (Monk/Warrior/Rogue skipped — no vendor spells)
const CLASSES = [
  { name: "bard", slug: "Bard" },
  { name: "beastlord", slug: "Beastlord" },
  { name: "cleric", slug: "Cleric" },
  { name: "druid", slug: "Druid" },
  { name: "enchanter", slug: "Enchanter" },
  { name: "magician", slug: "Magician" },
  { name: "necromancer", slug: "Necromancer" },
  { name: "paladin", slug: "Paladin" },
  { name: "ranger", slug: "Ranger" },
  { name: "shadow knight", slug: "Shadow_Knight" },
  { name: "shaman", slug: "Shaman" },
  { name: "wizard", slug: "Wizard" },
];

function decodeHtml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface SpellEntry {
  name: string;
  urlSlug: string;
  level: number;
}

interface VendorEntry {
  zone: string;
  npc: string;
}

export interface ScrapedSpell {
  name: string;
  level: number;
  vendors: VendorEntry[];
}

export interface ClassSpellData {
  class: string;
  spells: ScrapedSpell[];
}

function parseClassPage(html: string): SpellEntry[] {
  const spells: SpellEntry[] = [];
  // Each spell entry: class="hbdiv spell-hbdiv"><a href="/SlugName" title="Display Name">
  // followed by: spell-examine-classline">ABC(N)</div>
  const re =
    /class="hbdiv spell-hbdiv"><a href="\/([^"]+)" title="([^"]+)"[^>]*>[\s\S]*?spell-examine-classline">(?:[A-Z]+)\((\d+)\)<\/div>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    spells.push({
      urlSlug: m[1],
      name: decodeHtml(m[2]),
      level: parseInt(m[3], 10),
    });
  }
  return spells;
}

function parseSpellPage(html: string): VendorEntry[] {
  const vendors: VendorEntry[] = [];
  const obtainIdx = html.indexOf("eql-spellpage-obtain");
  if (obtainIdx === -1) return vendors;

  const section = html.slice(obtainIdx, obtainIdx + 30000);
  // Split by <tr and extract zone (col 1) + npc (col 2) link text from data rows
  const rows = section.split("<tr");
  for (const row of rows.slice(1)) {
    if (row.includes("<th")) continue; // skip header row
    const linkRe = /<a[^>]*>([^<]+)<\/a>/g;
    const links: string[] = [];
    let lm: RegExpExecArray | null;
    while ((lm = linkRe.exec(row)) !== null) {
      links.push(decodeHtml(lm[1].trim()));
    }
    if (links.length >= 2) {
      vendors.push({ zone: links[0], npc: links[1] });
    }
  }
  return vendors;
}

const output: Record<string, ClassSpellData> = {};
const vendorCache = new Map<string, VendorEntry[]>();

for (const cls of CLASSES) {
  console.log(`\n[${cls.name}] Fetching class page...`);
  const classRes = await fetch(`${BASE}/${cls.slug}`);
  if (!classRes.ok) {
    console.error(`  HTTP ${classRes.status} — skipping`);
    continue;
  }
  const classHtml = await classRes.text();
  const entries = parseClassPage(classHtml);
  console.log(`  ${entries.length} spells`);

  const clsSpells: ScrapedSpell[] = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (i > 0 && i % 20 === 0) console.log(`  ${i}/${entries.length}...`);

    if (!vendorCache.has(entry.urlSlug)) {
      await sleep(DELAY_MS);
      try {
        const res = await fetch(`${BASE}/${entry.urlSlug}`);
        vendorCache.set(entry.urlSlug, res.ok ? parseSpellPage(await res.text()) : []);
      } catch {
        console.error(`  Error fetching /${entry.urlSlug}`);
        vendorCache.set(entry.urlSlug, []);
      }
    }

    clsSpells.push({
      name: entry.name,
      level: entry.level,
      vendors: vendorCache.get(entry.urlSlug)!,
    });
  }

  output[cls.name] = { class: cls.name, spells: clsSpells };
}

const outPath = resolve(import.meta.dir, "../data/scraped-spells.json");
writeFileSync(outPath, JSON.stringify(output, null, 2));
console.log(`\nDone — ${Object.keys(output).length} classes written to data/scraped-spells.json`);
