/**
 * Migration 262: add mob nodes for zone:surefall-glade, per the `mob`
 * node type from migration 060 (decisions/mob-node-type.md) -- see issue
 * #36.
 *
 * `Category:Surefall Glade` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 27
 * `{{Namedmobpage}}` candidates. This is a small friendly Ranger/Druid
 * guild-hall zone, not a hostile city like Grobb/Felwithe/Kaladim -- its
 * own zone-top-table "Types of Monsters" field lists exactly the wildlife
 * roster kept here (a fish, a piranha, a bear cub, a brown bear, a grizzly
 * bear, poachers, Mammoth, Talym Shoontar), which doesn't include any of
 * the zone's Ranger/Druid-classed named NPCs. Those NPCs' own pages
 * confirm they're real kill-targets despite reading as trainer-adjacent
 * (Ran Walker: "good money mob"; Corun Finisc: "Casts low level druid
 * spells... Always drops staff"; Krystal Aspen: "great solo spot... drops
 * 2 fine steel short swords"; Bren Treeclimber: "roams between several
 * locations and sits down" like the zone's other wandering NPCs) -- kept
 * per the established "stats over name/role" rule. "Gnoll Poacher" isn't
 * in the top-table list either, but fits the zone's poacher theme with a
 * full stat block and real loot (Patch of Gnoll Fur) -- kept on the same
 * "stats over name" basis, consistent with West Commonlands' Modren
 * Fishcatcher precedent.
 *
 * Excluded: the zone's 9 GM-prefixed guildmasters (Gerael Woodone, Vesteri
 * Nomanoi, Hager Sureshot, Gillarian Naelev, Larsk Juton, Merona Castekin,
 * Errin Pinewhisper, Te`Anara, Salmekia Treherth) -- guildmasters don't
 * count per CLAUDE.md, same call as the South Qeynos/Qeynos Catacombs
 * batch. Their trainer roles are already covered by the map's own legend
 * (migration 261).
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const MOBS = [
  { label: "Ran Walker", minLevel: 30, maxLevel: 30 },
  { label: "Talym Shoontar", minLevel: 15, maxLevel: 15 },
  { label: "A Poacher", minLevel: 7, maxLevel: 9 },
  { label: "A Bear Cub", minLevel: 2, maxLevel: 2 },
  { label: "Bren Treeclimber", minLevel: 7, maxLevel: 7 },
  { label: "Frenway Marthank", minLevel: 31, maxLevel: 31 },
  { label: "Corun Finisc", minLevel: 6, maxLevel: 6 },
  { label: "Sivina Lutewhisper", minLevel: 25, maxLevel: 25 },
  { label: "A Grizzly Bear", minLevel: 9, maxLevel: 11 },
  { label: "A Brown Bear", minLevel: 3, maxLevel: 8 },
  { label: "Niera Farbreeze", minLevel: 40, maxLevel: 40 },
  { label: "Mammoth", minLevel: 20, maxLevel: 25 },
  { label: "Poacher", minLevel: 6, maxLevel: 9 },
  { label: "Gnoll Poacher", minLevel: 5, maxLevel: 5 },
  { label: "Krystal Aspen", minLevel: 30, maxLevel: 30 },
  { label: "A piranha", minLevel: 2, maxLevel: 2 },
  { label: "Merdan Fleetfoot", minLevel: 38, maxLevel: 38 },
  { label: "A fish", minLevel: 1, maxLevel: 1 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:surefall-glade:${slug(mob.label)}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, "zone:surefall-glade", "located_in");
}

save();
console.log(`Migration 262 complete: ${added} mob node(s) added to zone:surefall-glade`);
