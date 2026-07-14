/**
 * Migration 039: Strip wiki-scraper boilerplate from AA descriptions
 * (issue #30).
 *
 * AA descriptions scraped from eqlwiki.com's ability infobox carry a raw
 * "Ability Activation ID: N - Refresh Time: H:MM:SS - Ability Timer(s): N."
 * prefix (sometimes followed by "Expendable Charges: N.") ahead of the
 * actual prose description -- internal wiki/game-data plumbing, not
 * player-facing text, and not parsed into any structured field elsewhere
 * in the AA node (unlike spells, which have dedicated duration/mana
 * fields). Removed outright rather than reshaped into a new field: 48 of
 * ~many AA nodes have it, the rest (passive AAs) have no such data at all,
 * so there's nothing to unify it with.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const DATA_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(DATA_PATH, "utf-8"));

const PREFIX_RE =
  /^Ability Activation ID:\s*\d+\s*-\s*Refresh Time:\s*[\d:]+\s*-\s*Ability Timer\(s\):\s*\d+\.\s*(Expendable Charges:\s*\d+\.\s*)?/;

let fixed = 0;
for (const node of graph.nodes) {
  if (node.data.type !== "aa") continue;
  const desc = node.data.description;
  if (typeof desc !== "string" || !PREFIX_RE.test(desc)) continue;
  node.data.description = desc.replace(PREFIX_RE, "");
  fixed++;
}

if (fixed === 0) throw new Error("Expected to find AA descriptions with the boilerplate prefix, found none");

writeFileSync(DATA_PATH, JSON.stringify(graph, null, 2));
console.log(`Migration 039 complete: stripped Ability Activation ID boilerplate from ${fixed} AA descriptions`);
