/**
 * Migration 016: Add stance and invocation nodes.
 *
 * New node types (per decisions/'s "node types are generic and
 * extensible" rule): "stance" and "invocation". Each carries a `classes`
 * array of full lowercase class names — the same shape convention as
 * spell.class_levels' `class` field, but with no `level` since stances and
 * invocations are all granted at level 1.
 *
 * Source: data/stances-invocations.json, produced by
 * scripts/scrape-stances.ts from a single eqlwiki.com page (unlike spell
 * data, which is scraped per-spell — see decisions/).
 *
 * Note: the class roster here includes "berserker", which has no spell
 * data and is absent from ALL_CLASSES in migration 007 / the spell-derived
 * /api/classes roster. Stances/invocations and spells are tracked
 * independently — see decisions/.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const SOURCE_PATH = resolve(import.meta.dir, "../data/stances-invocations.json");

interface StanceOrInvocation {
  name: string;
  description: string;
  classes: string[];
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));
const source: { stances: StanceOrInvocation[]; invocations: StanceOrInvocation[] } =
  JSON.parse(readFileSync(SOURCE_PATH, "utf-8"));

let added = 0;

function addNodes(entries: StanceOrInvocation[], type: "stance" | "invocation") {
  for (const entry of entries) {
    const id = `${type}:${slugify(entry.name)}`;
    if (graph.nodes.some((n: { data: { id: string } }) => n.data.id === id)) continue;
    graph.nodes.push({
      data: {
        id,
        label: entry.name,
        type,
        description: entry.description,
        classes: entry.classes,
      },
    });
    added++;
  }
}

addNodes(source.stances, "stance");
addNodes(source.invocations, "invocation");

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log(`Migration 016 complete: ${added} stance/invocation nodes added`);
