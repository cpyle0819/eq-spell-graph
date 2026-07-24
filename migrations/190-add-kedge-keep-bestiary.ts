/**
 * Migration 190: add mob nodes for zone:kedge-keep, per the `mob` node type
 * from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Sourced via the MediaWiki API technique
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md), with
 * per-mob levels read directly from each candidate's own `{{Namedmobpage}}`
 * wikitext (batch `prop=revisions` fetch, same approach as migration 186):
 * `Category:Kedge Keep`'s 79 pages narrowed to 40 `{{Namedmobpage}}`-tagged
 * candidates. "A Gloomstalker Mermaid" states its level as "??-43" -- the
 * page's own description adds "these vary in level a small amount, though I
 * am not sure by how much", so the lower bound isn't actually known, not
 * just unstated -- excluded on the same basis as Gorge of King Xorbb's "An
 * Evil Eye Pet" (migration 173): a fully missing endpoint means nothing to
 * verify a level against, unlike a stated range with a hedge attached.
 * Every other candidate's `zone` field names Kedge Keep with one clean
 * level or range.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:kedge-keep";

const MOBS = [
  { slug: "a-ferocious-hammerhead", label: "A ferocious hammerhead", minLevel: 45, maxLevel: 45 },
  { slug: "a-swirlspine-seahorse", label: "A Swirlspine Seahorse", minLevel: 51, maxLevel: 51 },
  { slug: "a-seahorse-patriarch", label: "A seahorse patriarch", minLevel: 47, maxLevel: 47 },
  { slug: "a-gloomwater-mermaid", label: "A Gloomwater Mermaid", minLevel: 38, maxLevel: 45 },
  { slug: "a-cauldron-hammerhead", label: "A Cauldron Hammerhead", minLevel: 37, maxLevel: 45 },
  { slug: "a-lancer-swordfish", label: "A Lancer Swordfish", minLevel: 28, maxLevel: 32 },
  { slug: "a-piercer-swordfish", label: "A Piercer Swordfish", minLevel: 35, maxLevel: 37 },
  { slug: "a-cauldron-shark", label: "A cauldron shark", minLevel: 34, maxLevel: 42 },
  { slug: "a-fierce-impaler", label: "A fierce impaler", minLevel: 42, maxLevel: 42 },
  { slug: "a-seahorse-matriarch", label: "A seahorse matriarch", minLevel: 47, maxLevel: 47 },
  { slug: "a-frenzied-bull-shark", label: "A frenzied bull shark", minLevel: 32, maxLevel: 32 },
  { slug: "a-soothebrine-seahorse", label: "A soothebrine seahorse", minLevel: 41, maxLevel: 41 },
  { slug: "a-cerulean-sailfin", label: "A cerulean sailfin", minLevel: 1, maxLevel: 1 },
  { slug: "a-bull-shark", label: "A bull shark", minLevel: 35, maxLevel: 35 },
  { slug: "a-cobalt-sailfin", label: "A cobalt sailfin", minLevel: 1, maxLevel: 1 },
  { slug: "a-crimson-sailfin", label: "A crimson sailfin", minLevel: 1, maxLevel: 1 },
  { slug: "a-frenzied-cauldron-shark", label: "A frenzied cauldron shark", minLevel: 42, maxLevel: 42 },
  { slug: "a-golden-haired-mermaid", label: "A Golden Haired Mermaid", minLevel: 40, maxLevel: 40 },
  { slug: "a-shimmering-sailfin", label: "A shimmering sailfin", minLevel: 1, maxLevel: 1 },
  { slug: "phinigel-autropos", label: "Phinigel Autropos", minLevel: 53, maxLevel: 53 },
  { slug: "swirlspine-guardian", label: "Swirlspine Guardian", minLevel: 51, maxLevel: 51 },
  { slug: "shellara-ebbhunter", label: "Shellara Ebbhunter", minLevel: 46, maxLevel: 46 },
  { slug: "estrella-of-gloomwater", label: "Estrella of Gloomwater", minLevel: 51, maxLevel: 51 },
  { slug: "cauldronboil", label: "Cauldronboil", minLevel: 49, maxLevel: 49 },
  { slug: "cauldronbubble", label: "Cauldronbubble", minLevel: 49, maxLevel: 49 },
  { slug: "coralyn-kelpmaiden", label: "Coralyn Kelpmaiden", minLevel: 46, maxLevel: 46 },
  { slug: "undertow", label: "Undertow", minLevel: 49, maxLevel: 49 },
  { slug: "stiletto-fang-piranha", label: "Stiletto Fang Piranha", minLevel: 41, maxLevel: 41 },
  { slug: "stiletto-tooth-piranha", label: "Stiletto Tooth Piranha", minLevel: 40, maxLevel: 40 },
  { slug: "an-impaler-swordfish", label: "An impaler swordfish", minLevel: 39, maxLevel: 39 },
  { slug: "corrupted-seahorse", label: "Corrupted Seahorse", minLevel: 53, maxLevel: 53 },
  { slug: "a-spinereef-seahorse", label: "A spinereef seahorse", minLevel: 43, maxLevel: 46 },
  { slug: "a-squallsurge-seahorse", label: "A squallsurge seahorse", minLevel: 39, maxLevel: 39 },
  { slug: "tainted-seahorse", label: "Tainted seahorse", minLevel: 51, maxLevel: 51 },
  { slug: "aqua-goblin-prisoner", label: "Aqua goblin prisoner", minLevel: 10, maxLevel: 10 },
  { slug: "a-swordfish", label: "A swordfish", minLevel: 28, maxLevel: 28 },
  { slug: "a-stingtooth-piranha", label: "A stingtooth piranha", minLevel: 29, maxLevel: 37 },
  { slug: "an-emerald-sailfin", label: "An emerald sailfin", minLevel: 1, maxLevel: 1 },
  { slug: "ravenous-stiletto-fang-piranha", label: "Ravenous stiletto fang piranha", minLevel: 45, maxLevel: 45 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:kedge-keep:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 190 complete: ${added} mob node(s) added for Kedge Keep`);
