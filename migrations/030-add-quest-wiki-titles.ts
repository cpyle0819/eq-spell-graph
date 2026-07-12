/**
 * Migration 030: Add `wiki_title` to the real (non-test) quest and
 * quest_line nodes -- same field/convention migration 023 added for zones
 * (decisions/wiki-links-per-entity-vs-shared-page.md): the exact
 * eqlwiki.com page title, stored human-readable (spaces, apostrophes as
 * typed) since wikiUrl() (public/components/card-base.js) does the
 * underscoring/percent-encoding at render time, not stored pre-encoded.
 *
 * All 7 Armor of Ro sub-quests (and the quest_line itself) share ONE page
 * title -- same "shared page" pattern as stances/invocations/AAs, not a
 * fabricated per-sub-quest URL (none of the 7 pieces has its own page;
 * confirmed while researching migration 029 -- "Mold of Ro Bracer" is an
 * item-page stub, not a quest page, per decisions/
 * eqlwiki-quest-research-method.md).
 *
 * quest:ore-for-the-anvil (the migration-026 test quest) intentionally
 * gets no wiki_title -- it's fictional, there's no real page to point at.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

function node(id: string) {
  return graph.nodes.find((n: { data: { id: string } }) => n.data.id === id)?.data;
}

const WIKI_TITLES: Record<string, string> = {
  "quest_line:armor-of-ro": "Armor of Ro Quests",
  "quest:mold-of-ro-boots": "Armor of Ro Quests",
  "quest:mold-of-ro-bracer": "Armor of Ro Quests",
  "quest:mold-of-ro-breastplate": "Armor of Ro Quests",
  "quest:mold-of-ro-gauntlets": "Armor of Ro Quests",
  "quest:mold-of-ro-greaves": "Armor of Ro Quests",
  "quest:mold-of-ro-helm": "Armor of Ro Quests",
  "quest:mold-of-ro-vambrace": "Armor of Ro Quests",
  "quest:journeyman-s-boots": "Journeyman's Boots Quest",
  "quest:research-aid": "Research Aid",
  "quest:paladin-epic-quest": "Paladin Epic Quest",
  "quest:cleric-epic-quest": "Cleric Epic Quest",
};

let updated = 0;
for (const [id, wikiTitle] of Object.entries(WIKI_TITLES)) {
  const n = node(id);
  if (!n) {
    console.warn(`Migration 030: node not found, skipping: ${id}`);
    continue;
  }
  n.wiki_title = wikiTitle;
  updated++;
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log(`Migration 030 complete: wiki_title set on ${updated} nodes`);
