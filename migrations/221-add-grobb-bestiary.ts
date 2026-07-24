/**
 * Migration 221: add mob nodes for zone:grobb, per the `mob` node type
 * from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * `Category:Grobb` narrowed via the MediaWiki API method (decisions/
 * eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 41
 * `{{Namedmobpage}}`-tagged candidates. Same "stats over name" call as
 * Felwithe (migrations 217/219): the "Da Bashers" troll warrior guild --
 * whose faction description explicitly doubles as "the guards of Grobb" --
 * all carry full combat stat blocks, as do the level 61 GM guildmasters
 * (Hukulk, Ranjor, Kaglari, Hergor, Urako, Rohga, Vergad), the banker
 * (Spinkit), and a faction-restricted cleric (Savarixsa Zexus, KOS to most
 * players per the zone's own "How To Become Non-KOS" section). "A froglok
 * prisoner" matches the map's own item 13 callout and has real stats
 * (level 4-6, 75 HP).
 *
 * Excluded: "Priest of Discord" (`zone = Various`, the same recurring
 * cross-city service NPC excluded from every other batch) and "Basher
 * Ganbaku" -- every stat field (level, class, AC, HP, damage) is
 * unfilled on its own page, unlike its 22 Basher siblings which all have
 * a real level in the 35-40 range; rather than guess a level from its
 * peers, it's left out until eqlwiki records one.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:grobb";

const MOBS = [
  { slug: "carver-cagrek", label: "Carver Cagrek", minLevel: 40, maxLevel: 40 },
  { slug: "bregna", label: "Bregna", minLevel: 40, maxLevel: 40 },
  { slug: "hukulk", label: "Hukulk", minLevel: 61, maxLevel: 61 },
  { slug: "ranjor", label: "Ranjor", minLevel: 61, maxLevel: 61 },
  { slug: "basher-nanrum", label: "Basher Nanrum", minLevel: 45, maxLevel: 45 },
  { slug: "exterminator-filrog", label: "Exterminator Filrog", minLevel: 40, maxLevel: 40 },
  { slug: "treskar", label: "Treskar", minLevel: 40, maxLevel: 40 },
  { slug: "kaglari", label: "Kaglari", minLevel: 61, maxLevel: 61 },
  { slug: "spinkit", label: "Spinkit", minLevel: 40, maxLevel: 40 },
  { slug: "hergor", label: "Hergor", minLevel: 61, maxLevel: 61 },
  { slug: "urako", label: "Urako", minLevel: 61, maxLevel: 61 },
  { slug: "basher-avisk", label: "Basher Avisk", minLevel: 39, maxLevel: 39 },
  { slug: "savarixsa-zexus", label: "Savarixsa Zexus", minLevel: 40, maxLevel: 40 },
  { slug: "basher-kankuk", label: "Basher Kankuk", minLevel: 35, maxLevel: 35 },
  { slug: "basher-kigak", label: "Basher Kigak", minLevel: 36, maxLevel: 36 },
  { slug: "basher-nagkuma", label: "Basher Nagkuma", minLevel: 35, maxLevel: 35 },
  { slug: "basher-rakguk", label: "Basher Rakguk", minLevel: 36, maxLevel: 36 },
  { slug: "basher-razbaz", label: "Basher Razbaz", minLevel: 39, maxLevel: 39 },
  { slug: "basher-roruma", label: "Basher Roruma", minLevel: 38, maxLevel: 38 },
  { slug: "basher-scintok", label: "Basher Scintok", minLevel: 36, maxLevel: 36 },
  { slug: "basher-stizik", label: "Basher Stizik", minLevel: 36, maxLevel: 36 },
  { slug: "basher-sutok", label: "Basher Sutok", minLevel: 39, maxLevel: 39 },
  { slug: "basher-gubaku", label: "Basher Gubaku", minLevel: 36, maxLevel: 36 },
  { slug: "basher-gobzin", label: "Basher Gobzin", minLevel: 39, maxLevel: 39 },
  { slug: "basher-glaum", label: "Basher Glaum", minLevel: 38, maxLevel: 38 },
  { slug: "basher-bugak", label: "Basher Bugak", minLevel: 35, maxLevel: 35 },
  { slug: "basher-thintan", label: "Basher Thintan", minLevel: 37, maxLevel: 37 },
  { slug: "basher-zabaak", label: "Basher Zabaak", minLevel: 35, maxLevel: 35 },
  { slug: "basher-wisthak", label: "Basher Wisthak", minLevel: 35, maxLevel: 35 },
  { slug: "basher-zazluk", label: "Basher Zazluk", minLevel: 39, maxLevel: 39 },
  { slug: "kragia", label: "Kragia", minLevel: 45, maxLevel: 45 },
  { slug: "basher-banzuk", label: "Basher Banzuk", minLevel: 39, maxLevel: 39 },
  { slug: "basher-bibeka", label: "Basher Bibeka", minLevel: 39, maxLevel: 39 },
  { slug: "basher-uvgin", label: "Basher Uvgin", minLevel: 40, maxLevel: 40 },
  { slug: "basher-kumek", label: "Basher Kumek", minLevel: 40, maxLevel: 40 },
  { slug: "a-froglok-prisoner", label: "A froglok prisoner", minLevel: 4, maxLevel: 6 },
  { slug: "basher-gamuk", label: "Basher Gamuk", minLevel: 39, maxLevel: 39 },
  { slug: "gralok", label: "Gralok", minLevel: 61, maxLevel: 61 },
  { slug: "jokca", label: "Jokca", minLevel: 50, maxLevel: 50 },
  { slug: "rohga", label: "Rohga", minLevel: 61, maxLevel: 61 },
  { slug: "vergad", label: "Vergad", minLevel: 61, maxLevel: 61 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:grobb:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 221 complete: ${added} mob node(s) added for Grobb`);
