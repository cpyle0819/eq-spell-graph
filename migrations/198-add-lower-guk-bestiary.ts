/**
 * Migration 198: add mob nodes for zone:lower-guk, per the `mob` node type
 * from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Sourced via the MediaWiki API technique
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md), with
 * per-mob levels read directly from each candidate's own `{{Namedmobpage}}`
 * wikitext (batch `prop=revisions` fetch, paginated across 3 rounds).
 * `Category:Lower Guk` narrowed to 64 `{{Namedmobpage}}`-tagged candidates,
 * all combat classes (Warrior/Paladin/Shaman/Wizard/Cleric/etc) -- no
 * functional-NPC exclusions needed this batch.
 *
 * "A froglok tsu shaman" is excluded: its own `zone` field names only
 * Upper Guk, not Lower Guk, despite being categorized here -- same
 * miscategorized-candidate pattern as the Najena batch's "A Goblin
 * Warrior" (eqlwiki-mediawiki-api-for-messy-bestiary-categories.md).
 * "A Froglok Shin Knight" legitimately spans both Upper Guk and Lower Guk
 * (a single stated level, not a per-zone split) and is kept.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:lower-guk";

const MOBS = [
  { slug: "a-basalt-gargoyle", label: "A basalt gargoyle", minLevel: 30, maxLevel: 34 },
  { slug: "a-frenzied-ghoul", label: "A frenzied ghoul", minLevel: 42, maxLevel: 42 },
  { slug: "a-froglok-crusader", label: "A froglok crusader", minLevel: 42, maxLevel: 42 },
  { slug: "a-froglok-herbalist", label: "A froglok herbalist", minLevel: 43, maxLevel: 43 },
  { slug: "the-froglok-king", label: "The froglok king", minLevel: 47, maxLevel: 47 },
  { slug: "a-ghoul-cavalier", label: "A ghoul cavalier", minLevel: 36, maxLevel: 36 },
  { slug: "a-ghoul-savant", label: "A ghoul savant", minLevel: 35, maxLevel: 35 },
  { slug: "a-ghoul-sage", label: "A ghoul sage", minLevel: 37, maxLevel: 37 },
  { slug: "a-ghoul-scribe", label: "A ghoul scribe", minLevel: 35, maxLevel: 35 },
  { slug: "a-ghoul-sentinel", label: "A ghoul sentinel", minLevel: 42, maxLevel: 42 },
  { slug: "a-ghoul-supplier", label: "A ghoul supplier", minLevel: 36, maxLevel: 36 },
  { slug: "a-ghoul-assassin", label: "A ghoul assassin", minLevel: 35, maxLevel: 35 },
  { slug: "a-ghoul-executioner", label: "A ghoul executioner", minLevel: 35, maxLevel: 35 },
  { slug: "a-huge-water-elemental", label: "A huge water elemental", minLevel: 35, maxLevel: 39 },
  { slug: "a-froglok-tactician", label: "A froglok tactician", minLevel: 45, maxLevel: 45 },
  { slug: "a-vis-ghoul-knight", label: "A Vis Ghoul Knight", minLevel: 30, maxLevel: 34 },
  { slug: "a-shin-ghoul-knight", label: "A Shin Ghoul Knight", minLevel: 27, maxLevel: 31 },
  { slug: "a-nok-ghoul-wizard", label: "A Nok Ghoul Wizard", minLevel: 24, maxLevel: 28 },
  { slug: "a-tsu-ghoul-wizard", label: "A Tsu Ghoul Wizard", minLevel: 27, maxLevel: 31 },
  { slug: "a-shin-ghoul-warrior", label: "A Shin Ghoul Warrior", minLevel: 24, maxLevel: 28 },
  { slug: "a-froglok-shin-knight", label: "A Froglok Shin Knight", minLevel: 27, maxLevel: 31 },
  { slug: "raster-of-guk", label: "Raster of Guk", minLevel: 35, maxLevel: 35 },
  { slug: "the-ghoul-lord", label: "The Ghoul Lord", minLevel: 47, maxLevel: 47 },
  { slug: "a-deadly-black-widow", label: "A Deadly Black Widow", minLevel: 30, maxLevel: 32 },
  { slug: "a-bloodthirsty-ghoul", label: "A bloodthirsty ghoul", minLevel: 38, maxLevel: 42 },
  { slug: "a-froglok-noble", label: "A Froglok Noble", minLevel: 39, maxLevel: 40 },
  { slug: "a-froglok-shin-warrior", label: "A Froglok Shin Warrior", minLevel: 24, maxLevel: 28 },
  { slug: "an-evil-eye-lower-guk", label: "An Evil Eye (Lower Guk)", minLevel: 34, maxLevel: 36 },
  { slug: "a-froglok-wan-knight", label: "A Froglok Wan Knight", minLevel: 33, maxLevel: 37 },
  { slug: "a-froglok-urd-shaman", label: "A Froglok Urd Shaman", minLevel: 33, maxLevel: 37 },
  { slug: "a-froglok-yun-priest", label: "A Froglok Yun Priest", minLevel: 38, maxLevel: 38 },
  { slug: "a-minotaur-elder", label: "A Minotaur Elder", minLevel: 33, maxLevel: 33 },
  { slug: "a-kor-ghoul-wizard", label: "A Kor Ghoul Wizard", minLevel: 41, maxLevel: 43 },
  { slug: "a-reanimated-hand-lower-guk", label: "A reanimated hand (Lower Guk)", minLevel: 39, maxLevel: 41 },
  { slug: "a-froglok-slave", label: "A Froglok Slave", minLevel: 2, maxLevel: 4 },
  { slug: "a-clay-gargoyle", label: "A clay gargoyle", minLevel: 27, maxLevel: 31 },
  { slug: "a-bok-ghoul-knight", label: "A bok ghoul knight", minLevel: 42, maxLevel: 46 },
  { slug: "an-urd-ghoul-wizard", label: "An urd ghoul wizard", minLevel: 33, maxLevel: 37 },
  { slug: "a-wan-ghoul-knight", label: "A wan ghoul knight", minLevel: 33, maxLevel: 37 },
  { slug: "a-greater-ice-bones", label: "A greater ice bones", minLevel: 30, maxLevel: 34 },
  { slug: "slaythe-the-slayer", label: "Slaythe the Slayer", minLevel: 32, maxLevel: 32 },
  { slug: "a-guk-ghoul-knight", label: "A guk ghoul knight", minLevel: 45, maxLevel: 49 },
  { slug: "a-guk-ghoul-wizard", label: "A guk ghoul wizard", minLevel: 46, maxLevel: 49 },
  { slug: "a-froglok-bok-knight", label: "A Froglok Bok Knight", minLevel: 42, maxLevel: 46 },
  { slug: "a-jin-ghoul-wizard", label: "A jin ghoul wizard", minLevel: 42, maxLevel: 46 },
  { slug: "a-froglok-guk-knight", label: "A froglok guk knight", minLevel: 47, maxLevel: 49 },
  { slug: "a-froglok-kor-shaman", label: "A froglok kor shaman", minLevel: 39, maxLevel: 43 },
  { slug: "a-froglok-vis-knight", label: "A froglok vis knight", minLevel: 30, maxLevel: 34 },
  { slug: "a-dar-ghoul-knight", label: "A dar ghoul knight", minLevel: 39, maxLevel: 43 },
  { slug: "a-basilisk-lower-guk", label: "A basilisk (Lower Guk)", minLevel: 28, maxLevel: 32 },
  { slug: "a-froglok-dar-knight", label: "A froglok dar knight", minLevel: 39, maxLevel: 43 },
  { slug: "a-froglok-guk-shaman", label: "A froglok guk shaman", minLevel: 45, maxLevel: 47 },
  { slug: "a-froglok-jin-shaman", label: "A froglok jin shaman", minLevel: 42, maxLevel: 46 },
  { slug: "a-froglok-yun-shaman", label: "A froglok yun shaman", minLevel: 36, maxLevel: 40 },
  { slug: "a-froglok-zol-knight", label: "A froglok zol knight", minLevel: 36, maxLevel: 40 },
  { slug: "a-ghoul-ritualist", label: "A ghoul ritualist", minLevel: 34, maxLevel: 34 },
  { slug: "a-granite-gargoyle", label: "A granite gargoyle", minLevel: 38, maxLevel: 42 },
  { slug: "a-greater-minotaur", label: "A greater minotaur", minLevel: 32, maxLevel: 36 },
  { slug: "a-minotaur-patriarch", label: "A minotaur patriarch", minLevel: 34, maxLevel: 34 },
  { slug: "a-tal-ghoul-wizard", label: "A tal ghoul wizard", minLevel: 30, maxLevel: 34 },
  { slug: "a-yun-ghoul-wizard", label: "A yun ghoul wizard", minLevel: 36, maxLevel: 40 },
  { slug: "a-zol-ghoul-knight", label: "A zol ghoul knight", minLevel: 36, maxLevel: 40 },
  { slug: "the-ghoul-arch-magi", label: "The ghoul arch magi", minLevel: 45, maxLevel: 45 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:lower-guk:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 198 complete: ${added} mob node(s) added for Lower Guk`);
