/**
 * Migration 091: add the two "Orc Warrior" trash mobs to Oasis of Marr's
 * bestiary, closing a gap left by migration 060.
 *
 * Migration 060 only pulled levels from eqlwiki.com's Oasis of Marr NPC
 * *table* and explicitly excluded "generic Orc Warriors" as having no level
 * to verify against. That was too strict -- the same page's own "Orc
 * Highway" prose section does give levels for these, just as an approximate
 * band rather than a table row: "there is a slight naming difference between
 * 'a orc warrior' and '[An Orc Warrior].' The 'an' orcs are in their
 * mid-teens in level, while the 'a' orc is more like 20th." Confirmed
 * directly against eqlwiki.com (not classic EQ / P1999).
 *
 * Stored as narrow ranges around the wiki's own wording, not single-level
 * guesses -- "mid-teens" and "more like 20th" are themselves approximations,
 * so a range better represents what's actually known than a fabricated
 * single number would. Distinct ids/labels for the two, since the wiki
 * treats "a orc warrior" and "An Orc Warrior" as different mobs (different
 * level bands under the same base name), following the same
 * distinct-node-per-instance precedent migration 060 already set for
 * same-named creatures.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:oasis-of-marr";

const MOBS = [
  { slug: "orc-warrior-a", label: "Orc Warrior", minLevel: 19, maxLevel: 21 },
  { slug: "orc-warrior-an", label: "An Orc Warrior", minLevel: 13, maxLevel: 16 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:oasis-of-marr:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 091 complete: ${added} mob node(s) added for Oasis of Marr`);
