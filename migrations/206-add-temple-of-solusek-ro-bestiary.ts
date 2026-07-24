/**
 * Migration 206: add mob nodes for zone:temple-of-solusek-ro, per the
 * `mob` node type from migration 060 (decisions/mob-node-type.md) -- see
 * issue #36.
 *
 * Sourced via the MediaWiki API technique
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md).
 * `Category:Temple of Solusek Ro` narrowed to 27 `{{Namedmobpage}}`-tagged
 * candidates, but 20 of those are the zone's own "Inhabitants and Quests"
 * table -- dialogue-only quest givers the zone's own text says the zone
 * exists for ("not for adventuring and hunting, killing monsters... but
 * for interacting with the inhabitants"), excluded here as functional
 * NPCs same as every other zone's vendors/guards/guildmasters, even though
 * their pages carry the same stat-block template. Kept as this migration's
 * bestiary are the 7 candidates that are actual fight targets: two epic
 * quest kill-mobs (A Seeker / A Plasmatic Priest, Cleric epic; Solomen,
 * Wizard epic), two unaffiliated elemental/guardian mobs (A ward of ro, A
 * blazing elemental), one out-of-era quest kill-mob with always-drop loot
 * (Torzan Searfire), and Moltak -- included despite its own page calling
 * it "a completely unused NPC," since it still carries real combat stats
 * (level 1, 11 HP) rather than being a flavor-only description.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:temple-of-solusek-ro";

const MOBS = [
  { slug: "a-seeker", label: "A Seeker", minLevel: 34, maxLevel: 36 },
  { slug: "a-plasmatic-priest", label: "A Plasmatic Priest", minLevel: 55, maxLevel: 55 },
  { slug: "solomen", label: "Solomen", minLevel: 35, maxLevel: 35 },
  { slug: "a-ward-of-ro", label: "A ward of ro", minLevel: 34, maxLevel: 34 },
  { slug: "a-blazing-elemental", label: "A blazing elemental", minLevel: 35, maxLevel: 35 },
  { slug: "moltak", label: "Moltak", minLevel: 1, maxLevel: 1 },
  { slug: "torzan-searfire", label: "Torzan Searfire", minLevel: 34, maxLevel: 34 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:temple-of-solusek-ro:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 206 complete: ${added} mob node(s) added for Temple of Solusek Ro`);
