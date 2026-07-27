/**
 * Migration 274: add mob nodes for zone:northern-desert-of-ro, per the
 * `mob` node type from migration 060 (decisions/mob-node-type.md) -- see
 * issue #36.
 *
 * `Category:Northern Desert of Ro` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 28
 * `{{Namedmobpage}}` candidates: the desert wildlife (tarantulas, sand
 * scarabs, coyotes, jackals, armadillos, pumas, rattlesnakes), the undead
 * (skeletons, zombies, mummies of several tiers), the dervish camps, an orc
 * camp, three "Guard `<name>`" spawns (full stat blocks, known Short Sword
 * loot, an 11:40 spawn timer -- real farm targets in this open-world zone,
 * not a city civic roster), and named standalones (Dorn B`Dynn, Rahotep,
 * Dunedigger, Puntar Sandfisher, Frankel the Pirate).
 *
 * `Category:Northern Desert of Ro` doesn't match the zone's own page title
 * ("The Northern Desert of Ro") -- confirmed via `list=allcategories`, same
 * title/category mismatch flagged in the Western Karana batch.
 *
 * One exclusion: "A ghoul" carries the category tag but its own `zone`
 * field names only Befallen/Estate of Unrest/Neriak Third Gate/West
 * Commonlands, no Northern Desert of Ro at all -- same miscategorized-
 * candidate pattern as Lower Guk's excluded "A froglok tsu shaman".
 *
 * Level-string notes:
 * - "A skeleton" ("4-18 / 4-6 (Befallen) / 1-6 (Qeynos Aqueducts)") has no
 *   Northern Desert of Ro-specific breakout -- used the base 4-18 span,
 *   same precedent as Rathe Mountains' "An Orc Warrior".
 * - "A Decaying Skeleton" ("1, 7-10 (Steamfont Mountains)") is confirmed
 *   in-zone by its own description ("especially common near the East
 *   Freeport zoneline in [[North Ro]]") -- used the base value (1, not the
 *   Steamfont-specific 7-10 breakout, which belongs to Steamfont's own
 *   bestiary per migration 264).
 * - `[[North Ro]]`/`[[South Ro]]` are eqlwiki redirects to Northern/
 *   Southern Desert of Ro respectively (confirmed via the API's own
 *   `redirects` resolution) -- treated as this zone whenever a `zone`
 *   field names them.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const MOBS = [
  { label: "Dorn B`Dynn", minLevel: 14, maxLevel: 16 },
  { label: "A skeleton", minLevel: 4, maxLevel: 18 },
  { label: "A Decaying Skeleton", minLevel: 1, maxLevel: 1 },
  { label: "Guard Brendyl", minLevel: 40, maxLevel: 40 },
  { label: "Guard Fintran", minLevel: 40, maxLevel: 40 },
  { label: "Guard Stoutman", minLevel: 40, maxLevel: 40 },
  { label: "Puntar Sandfisher", minLevel: 6, maxLevel: 6 },
  { label: "A Shriveled Mummy", minLevel: 10, maxLevel: 10 },
  { label: "A Sand Giant", minLevel: 33, maxLevel: 37 },
  { label: "A Crypt Mummy", minLevel: 13, maxLevel: 15 },
  { label: "An Armadillo", minLevel: 2, maxLevel: 2 },
  { label: "A Madman", minLevel: 8, maxLevel: 10 },
  { label: "A Dervish Cutthroat", minLevel: 11, maxLevel: 13 },
  { label: "A Fire Beetle", minLevel: 2, maxLevel: 2 },
  { label: "A Dune Tarantula", minLevel: 11, maxLevel: 13 },
  { label: "A Parched Zombie", minLevel: 6, maxLevel: 10 },
  { label: "A Puma", minLevel: 5, maxLevel: 10 },
  { label: "A Desert Tarantula", minLevel: 7, maxLevel: 9 },
  { label: "Rahotep", minLevel: 16, maxLevel: 16 },
  { label: "A Sand Scarab", minLevel: 9, maxLevel: 11 },
  { label: "Dunedigger", minLevel: 14, maxLevel: 14 },
  { label: "Orc Centurion (Deathfist)", minLevel: 3, maxLevel: 10 },
  { label: "A coyote", minLevel: 1, maxLevel: 1 },
  { label: "A jackal", minLevel: 3, maxLevel: 4 },
  { label: "An orc raider", minLevel: 5, maxLevel: 5 },
  { label: "Frankel the Pirate", minLevel: 30, maxLevel: 30 },
  { label: "A rattlesnake", minLevel: 3, maxLevel: 7 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:northern-desert-of-ro:${slug(mob.label)}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, "zone:northern-desert-of-ro", "located_in");
}

save();
console.log(`Migration 274 complete: ${added} mob node(s) added to zone:northern-desert-of-ro`);
