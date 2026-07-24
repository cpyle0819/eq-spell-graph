/**
 * Migration 202: add mob nodes for zone:permafrost, per the `mob` node
 * type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Sourced via the MediaWiki API technique
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md), with
 * per-mob levels read directly from each candidate's own `{{Namedmobpage}}`
 * wikitext (batch `prop=revisions` fetch). `Category:Permafrost` narrowed
 * to 36 `{{Namedmobpage}}`-tagged candidates, all with a clean numeric
 * level or range and a `zone` field naming only Permafrost -- no
 * miscategorized candidates or functional-NPC exclusions found this batch.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:permafrost";

const MOBS = [
  { slug: "lady-vox", label: "Lady Vox", minLevel: 55, maxLevel: 55 },
  { slug: "high-priest-zaharn", label: "High Priest Zaharn", minLevel: 30, maxLevel: 30 },
  { slug: "an-elite-goblin-guard", label: "An Elite Goblin Guard", minLevel: 25, maxLevel: 29 },
  { slug: "an-icy-terror", label: "An Icy Terror", minLevel: 48, maxLevel: 50 },
  { slug: "an-ice-goblin", label: "An Ice Goblin", minLevel: 11, maxLevel: 24 },
  { slug: "the-goblin-sage", label: "The Goblin Sage", minLevel: 28, maxLevel: 28 },
  { slug: "a-giant-dire-wolf", label: "A Giant Dire Wolf", minLevel: 43, maxLevel: 47 },
  { slug: "an-ice-giant-magi", label: "An ice giant magi", minLevel: 43, maxLevel: 43 },
  { slug: "a-goblin-preacher", label: "A Goblin Preacher", minLevel: 24, maxLevel: 24 },
  { slug: "a-goblin-evoker", label: "A Goblin Evoker", minLevel: 18, maxLevel: 22 },
  { slug: "an-ice-giant-priest", label: "An Ice Giant Priest", minLevel: 48, maxLevel: 50 },
  { slug: "a-goblin-archeologist", label: "A Goblin Archeologist", minLevel: 24, maxLevel: 27 },
  { slug: "an-injured-polar-bear", label: "An injured polar bear", minLevel: 46, maxLevel: 46 },
  { slug: "ice-giant-diplomat", label: "Ice Giant Diplomat", minLevel: 35, maxLevel: 35 },
  { slug: "a-goblin-champion", label: "A goblin champion", minLevel: 35, maxLevel: 35 },
  { slug: "king-thexka-iv", label: "King Thex'Ka IV", minLevel: 31, maxLevel: 31 },
  { slug: "a-goblin-patriarch", label: "A goblin patriarch", minLevel: 30, maxLevel: 30 },
  { slug: "a-goblin-alchemist-permafrost", label: "A goblin alchemist (Permafrost)", minLevel: 27, maxLevel: 27 },
  { slug: "a-goblin-jailmaster", label: "A goblin jailmaster", minLevel: 20, maxLevel: 20 },
  { slug: "a-goblin-scryer", label: "A goblin scryer", minLevel: 25, maxLevel: 25 },
  { slug: "an-elite-honor-guard", label: "An elite honor guard", minLevel: 30, maxLevel: 30 },
  { slug: "a-priest-of-nagafen", label: "A priest of Nagafen", minLevel: 49, maxLevel: 49 },
  { slug: "an-icy-goblin", label: "An icy goblin", minLevel: 25, maxLevel: 25 },
  { slug: "a-goblin-priest", label: "A goblin priest", minLevel: 18, maxLevel: 22 },
  { slug: "a-goblin-wizard-permafrost", label: "A goblin wizard (Permafrost)", minLevel: 24, maxLevel: 25 },
  { slug: "a-dire-wolf-permafrost", label: "A dire wolf (Permafrost)", minLevel: 17, maxLevel: 20 },
  { slug: "a-giant-polar-bear", label: "A giant polar bear", minLevel: 43, maxLevel: 47 },
  { slug: "an-ice-giant-youth", label: "An ice giant youth", minLevel: 30, maxLevel: 30 },
  { slug: "a-goblin-prelate", label: "A goblin prelate", minLevel: 22, maxLevel: 23 },
  { slug: "a-goblin-diviner", label: "A goblin diviner", minLevel: 14, maxLevel: 18 },
  { slug: "a-large-dire-wolf", label: "A large dire wolf", minLevel: 22, maxLevel: 24 },
  { slug: "a-goblin-mendicant", label: "A goblin mendicant", minLevel: 14, maxLevel: 17 },
  { slug: "a-dire-pup", label: "A dire pup", minLevel: 12, maxLevel: 13 },
  { slug: "a-young-dire-wolf", label: "A young dire wolf", minLevel: 15, maxLevel: 17 },
  { slug: "an-ice-giant-permafrost", label: "An Ice Giant (Permafrost)", minLevel: 35, maxLevel: 50 },
  { slug: "giant-wooly-spider", label: "Giant wooly spider", minLevel: 43, maxLevel: 47 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:permafrost:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 202 complete: ${added} mob node(s) added for Permafrost`);
