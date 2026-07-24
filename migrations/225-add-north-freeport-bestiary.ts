/**
 * Migration 225: add mob nodes for zone:north-freeport, per the `mob` node
 * type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * `Category:North Freeport` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 57
 * `{{Namedmobpage}}`-tagged candidates, but -- same as East Freeport
 * (migration 214) -- nearly all of them are the city's own loyalist
 * establishment: GM Cleric/Paladin/Bard guildmasters, "Sentry"/"Sir" city
 * guards, and named citizens, all confirmed loyalist by their own `factions`
 * field (Knights of Truth/Priests of Marr, not the corrupt Freeport
 * Militia -- see migration 227's West Freeport writeup for how that split
 * was found). None of those are combat targets, consistent with North
 * Qeynos/East Freeport precedent of excluding a friendly city's own
 * guard/guildmaster roster wholesale.
 *
 * Only 3 candidates read as real fights:
 * - "A minnow": a real leveled fish (1) in the moat around the Hall of
 *   Truth, tied to local factions and the `Marr Minnows for Palon` quest.
 * - "Bondl Felligan": a level-45 barbarian warrior hidden in the sewers,
 *   part of the shaman epic quest -- an epic-quest boss, not a civic NPC,
 *   same "hidden epic-quest fight" shape as Temple of Solusek Ro's kept
 *   candidates.
 * - "A piranha": its own `zone` field says "Various Zones", but its own
 *   description names North Freeport specifically ("Piranha located in
 *   North Freeport next to the Hall of Truth are part of the local
 *   factions") despite being categorized under West Freeport -- same
 *   "target zone's own page/description outranks a stale category tag"
 *   rule as Splitpaw's "The Ishva Mal".
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:north-freeport";

const MOBS = [
  { slug: "a-minnow", label: "A minnow", minLevel: 1, maxLevel: 1 },
  { slug: "bondl-felligan", label: "Bondl Felligan", minLevel: 45, maxLevel: 45 },
  { slug: "a-piranha", label: "A piranha", minLevel: 2, maxLevel: 2 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:north-freeport:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 225 complete: ${added} mob node(s) added for North Freeport`);
