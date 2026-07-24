/**
 * Migration 200: add mob nodes for zone:nagafen-s-lair, per the `mob` node
 * type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Sourced via the MediaWiki API technique
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md), with
 * per-mob levels read directly from each candidate's own `{{Namedmobpage}}`
 * wikitext (batch `prop=revisions` fetch). `Category:Nagafen's Lair`
 * narrowed to 27 `{{Namedmobpage}}`-tagged candidates, all combat classes
 * (Warrior/Cleric/Wizard/Shadow Knight/Rogue/Enchanter/Shaman/Monk) with a
 * clean numeric level or range -- no functional-NPC exclusions needed.
 *
 * "Greater Kobold"'s own page covers two named variants on one page ("a
 * greater kobold" / "greater kobold", the former stated as the "lower
 * version") with two level ranges (32-34 / 33-37) rather than a per-zone
 * split; modeled as a single mob spanning both (32-37) since there's no
 * separate page to split it onto.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:nagafen-s-lair";

const MOBS = [
  { slug: "lord-nagafen", label: "Lord Nagafen", minLevel: 55, maxLevel: 55 },
  { slug: "kobold-priest", label: "Kobold priest", minLevel: 40, maxLevel: 40 },
  { slug: "efreeti-lord-djarn", label: "Efreeti Lord Djarn", minLevel: 50, maxLevel: 50 },
  { slug: "magi-rokyl", label: "Magi Rokyl", minLevel: 51, maxLevel: 51 },
  { slug: "warlord-skarlon", label: "Warlord Skarlon", minLevel: 53, maxLevel: 53 },
  { slug: "king-tranix", label: "King Tranix", minLevel: 52, maxLevel: 52 },
  { slug: "guano-harvester", label: "Guano harvester", minLevel: 25, maxLevel: 25 },
  { slug: "stone-spider", label: "Stone spider", minLevel: 44, maxLevel: 46 },
  { slug: "noxious-spider", label: "Noxious spider", minLevel: 43, maxLevel: 45 },
  { slug: "kobold-champion", label: "Kobold champion", minLevel: 39, maxLevel: 39 },
  { slug: "solusek-kobold-king", label: "Solusek kobold king", minLevel: 42, maxLevel: 42 },
  { slug: "kobold-noble", label: "Kobold noble", minLevel: 38, maxLevel: 38 },
  { slug: "targin-the-rock", label: "Targin the Rock", minLevel: 35, maxLevel: 39 },
  { slug: "death-beetle", label: "Death beetle", minLevel: 40, maxLevel: 42 },
  { slug: "zordakalicus-ragefire", label: "Zordakalicus Ragefire", minLevel: 54, maxLevel: 54 },
  { slug: "imp-protector", label: "Imp Protector", minLevel: 44, maxLevel: 48 },
  { slug: "fire-giant-warrior", label: "Fire Giant Warrior", minLevel: 47, maxLevel: 51 },
  { slug: "greater-kobold", label: "Greater Kobold", minLevel: 32, maxLevel: 37 },
  { slug: "fire-giant-wizard", label: "Fire Giant Wizard", minLevel: 47, maxLevel: 51 },
  { slug: "solusek-kobold", label: "Solusek Kobold", minLevel: 36, maxLevel: 38 },
  { slug: "solusek-kobold-shaman", label: "Solusek Kobold Shaman", minLevel: 36, maxLevel: 38 },
  { slug: "midghh-the-dark", label: "Midghh the Dark", minLevel: 35, maxLevel: 35 },
  { slug: "lava-beetle", label: "Lava beetle", minLevel: 38, maxLevel: 42 },
  { slug: "lava-duct-crawler", label: "Lava duct crawler", minLevel: 43, maxLevel: 45 },
  { slug: "sonic-bat", label: "Sonic bat", minLevel: 38, maxLevel: 42 },
  { slug: "lava-guardian", label: "Lava guardian", minLevel: 42, maxLevel: 46 },
  { slug: "greater-kobold-shaman", label: "Greater kobold shaman", minLevel: 33, maxLevel: 37 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:nagafen-s-lair:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 200 complete: ${added} mob node(s) added for Nagafen's Lair`);
