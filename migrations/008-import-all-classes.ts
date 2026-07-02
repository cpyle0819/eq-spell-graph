/**
 * Migration 008: Import spell/vendor data for all classes.
 *
 * Reads data/scraped-spells.json (produced by scripts/scrape-spells.ts) and merges
 * into graph.json. Handles:
 *   - Shared spells: appends new class/level entry to class_levels (no duplicate nodes)
 *   - New spells: creates spell node
 *   - Existing NPCs (same zone+name slug): reused, no duplicate created
 *   - New NPCs: created with type npc, roles: ["vendor"]
 *   - All edges deduplicated
 *
 * Usage:
 *   bun run scripts/scrape-spells.ts   # produce scraped-spells.json first
 *   bun run migrations/008-import-all-classes.ts
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import type { ClassSpellData } from "../scripts/scrape-spells";

const DATA_PATH = resolve(import.meta.dir, "../data/graph.json");
const SCRAPED_PATH = resolve(import.meta.dir, "../data/scraped-spells.json");

if (!existsSync(SCRAPED_PATH)) {
  console.error("data/scraped-spells.json not found — run scripts/scrape-spells.ts first");
  process.exit(1);
}

const graph = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
const scraped: Record<string, ClassSpellData> = JSON.parse(readFileSync(SCRAPED_PATH, "utf-8"));

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Index existing nodes for fast lookup
const nodeById = new Map<string, any>(graph.nodes.map((n: any) => [n.data.id, n]));

// Zones missing from graph that have real spell vendors — add them
const MISSING_ZONES: { label: string; id: string }[] = [
  { label: "High Keep", id: "zone:high-keep" },
  { label: "Ocean of Tears", id: "zone:ocean-of-tears" },
];
for (const z of MISSING_ZONES) {
  if (!nodeById.has(z.id)) {
    const node = { data: { id: z.id, label: z.label, type: "zone" } };
    graph.nodes.push(node);
    nodeById.set(z.id, node);
  }
}

// Zone lookup: normalized label → zone id
const zoneByLabel = new Map<string, string>();
for (const n of graph.nodes) {
  if (n.data.type === "zone") {
    zoneByLabel.set(n.data.label.toLowerCase(), n.data.id);
    zoneByLabel.set(n.data.label.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim(), n.data.id);
  }
}

// Explicit aliases: wiki name variants → graph zone id
const ZONE_ALIASES: Record<string, string> = {
  "erudin palace":           "zone:erudin",
  "felwithe (south)":        "zone:southern-felwithe",
  "freeport (west)":         "zone:west-freeport",
  "kaladim":                 "zone:north-kaladim",
  "kelethin":                "zone:greater-faydark",
  "neriak - 3rd gate":       "zone:neriak-3rd-gate",
  "neriak - commons":        "zone:neriak-commons",
  "northern kaladim":        "zone:north-kaladim",
  "northern plains of karana": "zone:northern-karana",
  "overthere":               "zone:the-overthere",
  "qeynos (south)":          "zone:south-qeynos",
};

function resolveZone(zoneName: string): string | null {
  // Silently drop scraper artifacts (URLs, item names)
  if (zoneName.startsWith("http") || zoneName.includes("Pg.") || zoneName.includes("Tome")) return null;

  const lower = zoneName.toLowerCase();
  if (ZONE_ALIASES[lower]) return ZONE_ALIASES[lower];
  if (zoneByLabel.has(lower)) return zoneByLabel.get(lower)!;
  const stripped = lower.replace(/[^a-z0-9 ]/g, "").trim();
  return zoneByLabel.get(stripped) ?? null;
}

// Deduplicate edges by source→type→target key
const edgeKeys = new Set<string>(
  graph.edges.map((e: any) => `${e.data.source}|${e.data.type}|${e.data.target}`)
);

let edgeSeq = 0;

function addEdge(source: string, target: string, type: string) {
  const key = `${source}|${type}|${target}`;
  if (edgeKeys.has(key)) return;
  edgeKeys.add(key);
  graph.edges.push({ data: { id: `e-008-${type}-${++edgeSeq}`, source, target, type } });
}

// Stats
const initialNodeCount = graph.nodes.length;
const initialEdgeCount = graph.edges.length;
const unknownZones = new Set<string>();

for (const [className, data] of Object.entries(scraped)) {
  let classSpellsNew = 0, classLevelsAdded = 0;
  console.log(`\n[${className}] ${data.spells.length} spells`);

  for (const spell of data.spells) {
    const spellId = `spell:${slugify(spell.name)}`;

    if (!nodeById.has(spellId)) {
      const node = { data: { id: spellId, label: spell.name, type: "spell", class_levels: [] } };
      graph.nodes.push(node);
      nodeById.set(spellId, node);
      classSpellsNew++;
    }

    const spellNode = nodeById.get(spellId)!;
    if (!spellNode.data.class_levels) spellNode.data.class_levels = [];

    const alreadyHasLevel = spellNode.data.class_levels.some(
      (cl: any) => cl.class === className && cl.level === spell.level
    );
    if (!alreadyHasLevel) {
      spellNode.data.class_levels.push({ class: className, level: spell.level });
      classLevelsAdded++;
    }

    for (const v of spell.vendors) {
      const zoneId = resolveZone(v.zone);
      if (!zoneId) {
        unknownZones.add(v.zone);
        continue;
      }

      const npcId = `vendor:${slugify(v.zone)}:${slugify(v.npc)}`;
      if (!nodeById.has(npcId)) {
        const node = { data: { id: npcId, label: v.npc, type: "npc", roles: ["vendor"] } };
        graph.nodes.push(node);
        nodeById.set(npcId, node);
      }

      addEdge(npcId, spellId, "sells");
      addEdge(npcId, zoneId, "located_in");
    }
  }

  console.log(`  +${classSpellsNew} new spells, +${classLevelsAdded} class_levels entries`);
}

writeFileSync(DATA_PATH, JSON.stringify(graph, null, 2));

console.log("\nMigration 008 complete:");
console.log(`  New nodes: ${graph.nodes.length - initialNodeCount}`);
console.log(`  New edges: ${graph.edges.length - initialEdgeCount}`);
if (unknownZones.size > 0) {
  console.log(`  Unknown zones (vendors skipped):`);
  for (const z of [...unknownZones].sort()) console.log(`    - ${z}`);
}
