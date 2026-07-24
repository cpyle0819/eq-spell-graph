/**
 * Migration 214: add mob nodes for zone:east-freeport, per the `mob` node
 * type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * `Category:East Freeport` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to
 * ~90 `{{Namedmobpage}}`-tagged candidates, but this wiki tags every named
 * page that way regardless of role (same caveat as Temple of Solusek Ro) --
 * nearly all of them are city guards (`Guard <name>`) or named human
 * quest-giver/vendor NPCs, none of which are combat targets, consistent
 * with North Qeynos's precedent (migration 139) of excluding a city's
 * guard/quest-giver roster wholesale. Only 4 candidates read as real fights
 * once checked individually:
 * - "Scraps": a KOS wolf (level 20, real HP/damage) the map's own legend
 *   already calls out by name ("KOS dog named Scraps").
 * - "A stonesnake" and "Orc Centurion (Deathfist)": generic newbie trash,
 *   `zone` field explicitly names East Freeport (Orc Centurion's zone list
 *   uses the "EFP" abbreviation).
 * - "A Shark": `zone` field lists Ocean of Tears/East Freeport/Erudin/
 *   Qeynos Aqueducts with a combined level string (`3-17 / 13-17 (Qeynos
 *   Aqueducts)`); East Freeport isn't one of the explicitly broken-out
 *   segments, so used the base 3-17 range, same "pick base if not named"
 *   rule as the Najena/Estate of Unrest batches' cross-zone mobs. The
 *   page's own description confirms a single shark actually spawns in
 *   East Freeport, not just a stale category tag.
 *
 * Excluded despite a full stat block: "Priest of Discord" (`zone = Various`;
 * a recurring cross-city PvP-flagging NPC, functionally a service NPC like
 * a guard, not a kill target) and "A Decaying Skeleton" (`zone = Various`;
 * its own description places East Freeport-adjacent spawns in North Ro,
 * near the zone line, not inside East Freeport itself). "A prisoner"'s
 * `zone` field names West Freeport only, despite sharing this category --
 * same miscategorized-candidate pattern as Lower Guk's "A froglok tsu
 * shaman"; belongs to West Freeport's bestiary instead.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:east-freeport";

const MOBS = [
  { slug: "scraps", label: "Scraps", minLevel: 20, maxLevel: 20 },
  { slug: "a-stonesnake", label: "A stonesnake", minLevel: 1, maxLevel: 1 },
  { slug: "orc-centurion-deathfist", label: "Orc Centurion (Deathfist)", minLevel: 3, maxLevel: 10 },
  { slug: "a-shark", label: "A Shark", minLevel: 3, maxLevel: 17 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:east-freeport:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 214 complete: ${added} mob node(s) added for East Freeport`);
