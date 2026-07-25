/**
 * Migration 260: add mob nodes for zone:rathe-mountains, per the `mob`
 * node type from migration 060 (decisions/mob-node-type.md) -- see issue
 * #36.
 *
 * `Category:Rathe Mountains` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 94
 * `{{Namedmobpage}}` candidates: the zone's wildlife (bears, kodiaks,
 * basilisks, fire beetles), an undead cluster (several skeleton variants,
 * zombies), the orc/lizard man camps, two named-beetle sphinx guard camps
 * (Ankhefenmut's Ankh beetles, Zazamoukh's Zaza beetles), a drake cluster
 * (Blackwing, Shardwing, generic drakes), the Unkempt Druids stone-ring
 * camp, a Paladin camp (Abigail/David/Elisabeth/etc.), Carson McCabe's
 * bandit gang (Brill/Kathryn/Kedryll Tindle/etc.), the Findlegrob/
 * Bindlegrob/Sindlegrob necromancer trio, hill giants, and several other
 * standalone named NPCs (Rharzar, Glaron the Wicked, Maldyn the Unkempt,
 * Kazzel D`Leryt, Broog Bloodbeard, Tarskuk, Petrifin, Oculys Ogrefiend).
 *
 * Three exclusions:
 * - "Thomas" (GM Paladin), "Brother Zephyl" (GM Monk), and "Sugal the
 *   Fist" (`special = Monk Guildmaster`) -- guildmasters excluded per
 *   CLAUDE.md, same call as the South Qeynos/Qeynos Catacombs batch.
 * - "Sir Edwin Motte" -- its own `zone` field names only "various
 *   ([[Qeynos Hills]])" despite the Rathe Mountains category tag, and its
 *   description confirms it's a wandering multi-zone caravan spawn with no
 *   Rathe-specific presence -- same miscategorized-candidate pattern as
 *   Lower Guk's excluded "A froglok tsu shaman".
 * - "A Decaying Skeleton" -- its `level` field's only per-zone breakout is
 *   "(Steamfont Mountains)", with no Rathe-specific data; it belongs to
 *   this batch's Steamfont Mountains bestiary instead (migration 264),
 *   where that breakout applies.
 *
 * Two ambiguous multi-segment `level` strings with no per-zone breakout at
 * all (unlike the Steamfont-tagged case above): "An Orc Warrior"
 * ("6-8, 12-15, 15-18" across 5 zones, own description doesn't say which
 * segment is Rathe's) and "A Giant Skeleton" ("23-26 or 30", a red-boned
 * vs. white-boned variant both native to Rathe alone) -- both recorded
 * using the full min-to-max span rather than guessing a segment.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const MOBS = [
  { label: "A skeleton", minLevel: 4, maxLevel: 18 },
  { label: "A Zombie", minLevel: 7, maxLevel: 10 },
  { label: "A Hill Giant", minLevel: 33, maxLevel: 37 },
  { label: "A Lizardman Robber", minLevel: 17, maxLevel: 17 },
  { label: "Abigail", minLevel: 28, maxLevel: 28 },
  { label: "Albain Tinderbrand", minLevel: 16, maxLevel: 16 },
  { label: "An Orc Priest", minLevel: 15, maxLevel: 15 },
  { label: "A Cyclops", minLevel: 29, maxLevel: 32 },
  { label: "A barbed bone skeleton", minLevel: 24, maxLevel: 26 },
  { label: "An Orc Warrior", minLevel: 6, maxLevel: 18 },
  { label: "A Skeletal Monk", minLevel: 23, maxLevel: 25 },
  { label: "A Grizzly Bear", minLevel: 9, maxLevel: 11 },
  { label: "A Black Bear", minLevel: 4, maxLevel: 5 },
  { label: "A Kodiak", minLevel: 14, maxLevel: 15 },
  { label: "A Fire Beetle", minLevel: 2, maxLevel: 2 },
  { label: "A Dry Bone Skeleton", minLevel: 15, maxLevel: 19 },
  { label: "A Brown Bear", minLevel: 3, maxLevel: 8 },
  { label: "A Basalt Drake", minLevel: 23, maxLevel: 23 },
  { label: "A drake", minLevel: 24, maxLevel: 27 },
  { label: "A Giant Skeleton", minLevel: 23, maxLevel: 30 },
  { label: "Ankhefenmut", minLevel: 40, maxLevel: 40 },
  { label: "A basilisk", minLevel: 13, maxLevel: 17 },
  { label: "A lizard man warrior", minLevel: 8, maxLevel: 12 },
  { label: "An onyx drake", minLevel: 9, maxLevel: 9 },
  { label: "A kodiak bear", minLevel: 13, maxLevel: 16 },
  { label: "An ebon drake", minLevel: 18, maxLevel: 22 },
  { label: "A bandit (Rathe Mountains)", minLevel: 9, maxLevel: 12 },
  { label: "A lizard man guard", minLevel: 12, maxLevel: 12 },
  { label: "A lizard man mystic", minLevel: 9, maxLevel: 11 },
  { label: "Grazhak the Berzerker", minLevel: 31, maxLevel: 31 },
  { label: "Findlegrob", minLevel: 25, maxLevel: 25 },
  { label: "Cynthia", minLevel: 30, maxLevel: 30 },
  { label: "Delila", minLevel: 10, maxLevel: 10 },
  { label: "Blackwing", minLevel: 35, maxLevel: 35 },
  { label: "Guard Carnita", minLevel: 15, maxLevel: 15 },
  { label: "Guard Fernaldo", minLevel: 15, maxLevel: 15 },
  { label: "Hasten Bootstrutter", minLevel: 40, maxLevel: 40 },
  { label: "Guard Dykalin", minLevel: 19, maxLevel: 21 },
  { label: "Glaron the Wicked", minLevel: 32, maxLevel: 32 },
  { label: "Maldyn the Unkempt", minLevel: 33, maxLevel: 33 },
  { label: "Kazzel D`Leryt", minLevel: 50, maxLevel: 50 },
  { label: "Broog Bloodbeard", minLevel: 46, maxLevel: 46 },
  { label: "Guard Shiznak", minLevel: 35, maxLevel: 35 },
  { label: "Blinde the Cutpurse", minLevel: 20, maxLevel: 20 },
  { label: "Bindlegrob", minLevel: 25, maxLevel: 25 },
  { label: "Corrupted hill giant", minLevel: 40, maxLevel: 40 },
  { label: "Kindra Farseer", minLevel: 30, maxLevel: 30 },
  { label: "Ice bone skeleton", minLevel: 14, maxLevel: 14 },
  { label: "Ankhetperure", minLevel: 7, maxLevel: 8 },
  { label: "Ankhnesmerira", minLevel: 7, maxLevel: 9 },
  { label: "Ankhesenaten", minLevel: 9, maxLevel: 9 },
  { label: "Brill", minLevel: 10, maxLevel: 10 },
  { label: "David", minLevel: 26, maxLevel: 26 },
  { label: "Elisabeth", minLevel: 20, maxLevel: 20 },
  { label: "Guard Gruilka", minLevel: 35, maxLevel: 35 },
  { label: "Kathryn", minLevel: 10, maxLevel: 10 },
  { label: "Kedryll Tindle", minLevel: 10, maxLevel: 10 },
  { label: "Lysandra", minLevel: 10, maxLevel: 10 },
  { label: "Mortificator Syythrak", minLevel: 40, maxLevel: 40 },
  { label: "Nicholas", minLevel: 21, maxLevel: 21 },
  { label: "Sindlegrob", minLevel: 25, maxLevel: 25 },
  { label: "Meridith Tindle", minLevel: 10, maxLevel: 10 },
  { label: "Nola Thistleborn", minLevel: 15, maxLevel: 15 },
  { label: "Solvedi Aldeberan", minLevel: 45, maxLevel: 45 },
  { label: "Tholia Fastbond", minLevel: 50, maxLevel: 50 },
  { label: "Unkempt Preserver", minLevel: 22, maxLevel: 22 },
  { label: "Nancine", minLevel: 14, maxLevel: 14 },
  { label: "Rharzar", minLevel: 55, maxLevel: 55 },
  { label: "Tibrinn Ember", minLevel: 45, maxLevel: 45 },
  { label: "Xenyari Lisariel", minLevel: 40, maxLevel: 40 },
  { label: "Tabien the Goodly", minLevel: 32, maxLevel: 32 },
  { label: "Tarskuk", minLevel: 33, maxLevel: 33 },
  { label: "Shardwing", minLevel: 40, maxLevel: 42 },
  { label: "Tainted hill giant", minLevel: 37, maxLevel: 37 },
  { label: "Theodast Wuggmump", minLevel: 36, maxLevel: 36 },
  { label: "Quid Rilstone", minLevel: 35, maxLevel: 35 },
  { label: "Oculys Ogrefiend", minLevel: 44, maxLevel: 44 },
  { label: "Monstrous zombie", minLevel: 53, maxLevel: 53 },
  { label: "Marianna", minLevel: 26, maxLevel: 26 },
  { label: "Meelana", minLevel: 10, maxLevel: 10 },
  { label: "Petrifin", minLevel: 40, maxLevel: 40 },
  { label: "Sentry Joanna", minLevel: 22, maxLevel: 22 },
  { label: "Sheldon", minLevel: 10, maxLevel: 10 },
  { label: "Sylp Tyanathin", minLevel: 13, maxLevel: 13 },
  { label: "Tomas", minLevel: 18, maxLevel: 18 },
  { label: "Zazamoukh", minLevel: 40, maxLevel: 40 },
  { label: "Zazamaharet", minLevel: 7, maxLevel: 9 },
  { label: "Zazamenhu", minLevel: 7, maxLevel: 9 },
  { label: "Zazaphenebti", minLevel: 8, maxLevel: 9 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:rathe-mountains:${slug(mob.label)}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, "zone:rathe-mountains", "located_in");
}

save();
console.log(`Migration 260 complete: ${added} mob node(s) added to zone:rathe-mountains`);
