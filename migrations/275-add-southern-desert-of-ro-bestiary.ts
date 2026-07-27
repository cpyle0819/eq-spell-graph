/**
 * Migration 275: add mob nodes for zone:southern-desert-of-ro, per the
 * `mob` node type from migration 060 (decisions/mob-node-type.md) -- see
 * issue #36.
 *
 * `Category:Southern Desert of Ro` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 31
 * `{{Namedmobpage}}` candidates: desert wildlife (snakes, asps, tarantula,
 * scarabs, coyotes, jackals), undead (skeletons, zombies, several mummy
 * tiers), the orc town's cleric/warrior roster, and named standalones from
 * the zone's own "Notable NPCs" list (Ortallius, Obretl, Terrorantula, Erg
 * Bluntbruiser, Sandgiant Husam, Andad Filla, Scrounge).
 *
 * One exclusion: "Tran" carries the category tag, but its own `zone` field
 * names only Oasis of Marr and its description states "Killing does not
 * provide experience" -- a gypsy merchant with a combat stat block for
 * flavor, not a real fight, same non-fight call as Paineel's excluded
 * Avatar of Dread/Fright.
 *
 * Level-string notes, same rules as the Northern Desert of Ro batch
 * (migration 274) this pairs with:
 * - "A skeleton" and "A Fire Beetle" both report `zone = Various` with
 *   generic "found in various zones" descriptions and no zone-specific
 *   breakout -- kept via their base level span, category membership being
 *   the only (and sufficient) signal, same as Rathe Mountains' "An Orc
 *   Warrior" precedent. Contrast with "Tran" above, whose `zone` field
 *   names a *specific different* zone rather than reading as generically
 *   ambiguous.
 * - "An Orc Warrior" ("6-8, 12-15, 15-18" across 5 zones with no per-zone
 *   breakout) used the full min-to-max span (6-18), same call as Rathe's
 *   own "An Orc Warrior".
 * - `[[North Ro]]`/`[[South Ro]]` are eqlwiki redirects to Northern/
 *   Southern Desert of Ro respectively (see migration 274's note); several
 *   candidates here (A Puma, A Giant Rattlesnake, A Sand Scarab, A Cistern
 *   Asp, An Asp) are shared with Northern Desert of Ro's bestiary via that
 *   naming, a legitimate both-zones overlap like Rathe/Steamfont's shared
 *   "A Decaying Skeleton" precedent.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const MOBS = [
  { label: "A skeleton", minLevel: 4, maxLevel: 18 },
  { label: "Ortallius", minLevel: 30, maxLevel: 30 },
  { label: "A Zombie", minLevel: 7, maxLevel: 10 },
  { label: "Obretl", minLevel: 22, maxLevel: 22 },
  { label: "Terrorantula", minLevel: 37, maxLevel: 40 },
  { label: "A Desert Madman", minLevel: 9, maxLevel: 11 },
  { label: "A Sand Giant", minLevel: 33, maxLevel: 37 },
  { label: "An Orc Cleric", minLevel: 8, maxLevel: 10 },
  { label: "Dry Bones Skeleton", minLevel: 16, maxLevel: 18 },
  { label: "An Orc Warrior", minLevel: 6, maxLevel: 18 },
  { label: "Andad Filla", minLevel: 51, maxLevel: 51 },
  { label: "Erg Bluntbruiser", minLevel: 10, maxLevel: 10 },
  { label: "Sandgiant Husam", minLevel: 29, maxLevel: 29 },
  { label: "A Dervish Cutthroat", minLevel: 11, maxLevel: 13 },
  { label: "A Fire Beetle", minLevel: 2, maxLevel: 2 },
  { label: "A Puma", minLevel: 5, maxLevel: 10 },
  { label: "A Moss Snake", minLevel: 1, maxLevel: 1 },
  { label: "A Giant Rattlesnake", minLevel: 8, maxLevel: 8 },
  { label: "A Sand Scarab", minLevel: 9, maxLevel: 11 },
  { label: "A Cistern Asp", minLevel: 9, maxLevel: 13 },
  { label: "Scrounge", minLevel: 8, maxLevel: 8 },
  { label: "A sand mummy", minLevel: 14, maxLevel: 16 },
  { label: "Crypt mummy", minLevel: 13, maxLevel: 13 },
  { label: "A tree snake", minLevel: 4, maxLevel: 6 },
  { label: "A coyote", minLevel: 1, maxLevel: 1 },
  { label: "A jackal", minLevel: 3, maxLevel: 4 },
  { label: "An Asp", minLevel: 10, maxLevel: 10 },
  { label: "A mummy", minLevel: 12, maxLevel: 12 },
  { label: "A rattlesnake", minLevel: 3, maxLevel: 7 },
  { label: "A Darkweed Snake", minLevel: 8, maxLevel: 10 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:southern-desert-of-ro:${slug(mob.label)}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, "zone:southern-desert-of-ro", "located_in");
}

save();
console.log(`Migration 275 complete: ${added} mob node(s) added to zone:southern-desert-of-ro`);
