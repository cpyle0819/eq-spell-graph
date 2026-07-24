/**
 * Migration 194: add mob nodes for zone:temple-of-cazic-thule, per the
 * `mob` node type from migration 060 (decisions/mob-node-type.md) -- see
 * issue #36.
 *
 * Sourced via the MediaWiki API technique
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md), with
 * per-mob levels read directly from each candidate's own `{{Namedmobpage}}`
 * wikitext (batch `prop=revisions` fetch). `Category:Cazic Thule`'s 55
 * pages narrowed to 30 `{{Namedmobpage}}`-tagged candidates, all with a
 * clean Cazic Thule `zone` field. "A dwarven mercenary" and "A gnomish
 * mage" are both real level-1 mobs (a jailed placeholder and its
 * low-level replacement, per their own page descriptions), not vendors --
 * both have combat stats (HP) and factions, so both are kept.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:temple-of-cazic-thule";

const MOBS = [
  { slug: "a-clay-golem", label: "A clay golem", minLevel: 23, maxLevel: 25 },
  { slug: "a-dwarven-mercenary", label: "A dwarven mercenary", minLevel: 1, maxLevel: 1 },
  { slug: "a-gnomish-mage", label: "A gnomish mage", minLevel: 1, maxLevel: 1 },
  { slug: "a-hulking-gorilla", label: "A hulking gorilla", minLevel: 24, maxLevel: 28 },
  { slug: "a-lizard-broodling", label: "A lizard broodling", minLevel: 9, maxLevel: 11 },
  { slug: "a-lizard-champion", label: "A lizard champion", minLevel: 35, maxLevel: 35 },
  { slug: "a-lizard-crusader", label: "A lizard crusader", minLevel: 30, maxLevel: 32 },
  { slug: "a-lizard-defender", label: "A lizard defender", minLevel: 21, maxLevel: 23 },
  { slug: "a-lizard-fanatic", label: "A lizard fanatic", minLevel: 30, maxLevel: 32 },
  { slug: "a-lizard-herald", label: "A lizard herald", minLevel: 26, maxLevel: 28 },
  { slug: "a-lizard-judicator", label: "A lizard judicator", minLevel: 32, maxLevel: 34 },
  { slug: "a-lizard-justicar", label: "A lizard justicar", minLevel: 29, maxLevel: 31 },
  { slug: "a-lizard-page", label: "A lizard page", minLevel: 23, maxLevel: 25 },
  { slug: "a-lizard-probationer", label: "A lizard probationer", minLevel: 20, maxLevel: 22 },
  { slug: "a-lizard-proselyte", label: "A lizard proselyte", minLevel: 14, maxLevel: 16 },
  { slug: "a-lizard-protector", label: "A lizard protector", minLevel: 27, maxLevel: 29 },
  { slug: "a-lizard-ritualist", label: "A lizard ritualist", minLevel: 30, maxLevel: 31 },
  { slug: "a-lizard-sentinel", label: "A lizard sentinel", minLevel: 24, maxLevel: 26 },
  { slug: "a-lizard-warder", label: "A lizard warder", minLevel: 18, maxLevel: 20 },
  { slug: "a-lizard-zealot", label: "A lizard zealot", minLevel: 32, maxLevel: 34 },
  { slug: "a-silvered-guard", label: "A silvered guard", minLevel: 25, maxLevel: 27 },
  { slug: "a-steel-golem", label: "A steel golem", minLevel: 35, maxLevel: 37 },
  { slug: "a-stone-golem", label: "A Stone Golem", minLevel: 29, maxLevel: 31 },
  { slug: "an-alligator", label: "An alligator", minLevel: 20, maxLevel: 33 },
  { slug: "avatar-of-fear", label: "Avatar of Fear", minLevel: 38, maxLevel: 38 },
  { slug: "cazic-cenobite", label: "Cazic Cenobite", minLevel: 35, maxLevel: 37 },
  { slug: "radiant", label: "Radiant", minLevel: 21, maxLevel: 23 },
  { slug: "tae-ew-archon", label: "Tae Ew Archon", minLevel: 34, maxLevel: 34 },
  { slug: "tae-ew-diviner", label: "Tae Ew Diviner", minLevel: 28, maxLevel: 28 },
  { slug: "tae-ew-templar", label: "Tae Ew Templar", minLevel: 30, maxLevel: 30 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:temple-of-cazic-thule:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 194 complete: ${added} mob node(s) added for Temple of Cazic Thule`);
