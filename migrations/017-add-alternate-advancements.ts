/**
 * Migration 017: Add Alternate Advancement (AA) nodes.
 *
 * New node type (per decisions/'s "node types are generic and extensible"
 * rule): "aa". Carries `label`, `description`, `ranks`, `cost` (a raw
 * "N/N/N"-per-rank string — some ranks are still "?" in the source wiki, so
 * this is kept as text rather than parsed into numbers), `classes: string[]`,
 * and `category` ("general" | "archetype" | "class" | "special" — the wiki
 * section the entry came from, used to group the Class Browser UI).
 *
 * Source: data/aa.json, produced by scripts/scrape-aa.ts from the single
 * eqlwiki.com "Alternate Advancement" page (same one-page-covers-everything
 * shape as stances/invocations — see decisions/).
 *
 * Node id is `aa:{slug(name)}`, except for "class" category entries, which
 * are `aa:{slug(class)}:{slug(name)}` — a handful of class-specific AA names
 * (e.g. "Quick Evacuation") are reused independently by more than one class,
 * so the plain name slug isn't unique for that category.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const SOURCE_PATH = resolve(import.meta.dir, "../data/aa.json");

type AACategory = "general" | "archetype" | "class" | "special";

interface AAEntry {
  name: string;
  ranks: number;
  cost: string;
  description: string;
  classes: string[];
  category: AACategory;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));
const source: { classes: string[]; entries: AAEntry[] } = JSON.parse(readFileSync(SOURCE_PATH, "utf-8"));

let added = 0;

for (const entry of source.entries) {
  const id = entry.category === "class"
    ? `aa:${slugify(entry.classes[0])}:${slugify(entry.name)}`
    : `aa:${slugify(entry.name)}`;
  if (graph.nodes.some((n: { data: { id: string } }) => n.data.id === id)) continue;
  graph.nodes.push({
    data: {
      id,
      label: entry.name,
      type: "aa",
      description: entry.description,
      ranks: entry.ranks,
      cost: entry.cost,
      classes: entry.classes,
      category: entry.category,
    },
  });
  added++;
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log(`Migration 017 complete: ${added} AA nodes added`);
