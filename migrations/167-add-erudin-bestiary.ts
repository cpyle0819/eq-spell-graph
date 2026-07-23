/**
 * Migration 167: add mob nodes for zone:erudin, per the `mob` node type
 * from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Sourced via the MediaWiki API technique
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md):
 * Category:Erudin's 131 pages narrowed to 50 {{Namedmobpage}}-tagged
 * candidates. Erudin is a peaceful home city -- 48 of the 50 are guild
 * masters ("GM Cleric"/"GM Paladin"), trainers, or "Sentinel"-named city
 * guards, none of them real combat content, consistent with North Qeynos's
 * exclusions (migration 139). "Priest of Discord" is a shared cross-city
 * PvP-flagging service NPC (its own related_quests list nine different
 * cities' "Become PvP" quests), functional rather than a creature. Only
 * "a young shark" (level 1) and "a fish" (level 1, the same generic
 * template used across many zones' waterways) have a stated level and no
 * service function -- both found in the water off the Erudin docks.
 * "A diseased shark" ("Blue to 13", no second data point to narrow a
 * minimum) and "a sand shark" (no level field at all) are excluded per
 * mob-node-type.md's stated-level-only rule, same as migration 165's
 * "Kromrif Soldier" precedent.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:erudin";

const MOBS = [
  { slug: "a-young-shark", label: "A Young Shark", minLevel: 1, maxLevel: 1 },
  { slug: "a-fish", label: "A Fish", minLevel: 1, maxLevel: 1 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:erudin:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 167 complete: ${added} mob node(s) added for Erudin`);
