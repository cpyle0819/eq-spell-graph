/**
 * Migration 238: add mob nodes for zone:north-kaladim and zone:south-
 * kaladim, per the `mob` node type from migration 060
 * (decisions/mob-node-type.md) -- see issue #36.
 *
 * `Category:North Kaladim`/`Category:South Kaladim` narrowed via the
 * MediaWiki API method (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-
 * categories.md) to 26/34 unique `{{Namedmobpage}}` candidates. Kaladim is
 * a friendly dwarf city, but unlike North Qeynos's wholesale guard/
 * guildmaster exclusion (migration 139, pre-dating this method), every
 * candidate here carries a full stat block *and* real known_loot (e.g.
 * Guard Dalammer's Dwarven Axe) -- and Guard Anathur/Guard Cardaff/Guard
 * Humkor/Guard Stump's own descriptions confirm the front-gate guards are
 * "sometimes hunted for experience." Kept all of them, same "stats (and
 * loot) over name" rule as Felwithe/Grobb/High Keep/Oggok/Paineel/Neriak,
 * extended here to a friendly city with no civil-war faction split.
 *
 * Excluded: "Priest of Discord" (`zone` = Various, the same recurring
 * cross-city service NPC excluded in Felwithe/Neriak). Every remaining
 * candidate's own `zone` field confirmed its category (North vs South), no
 * miscategorized or dual-sub-zone-patrol cases this batch.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const NORTH = [
  { slug: "gunlok-jure", label: "Gunlok Jure", minLevel: 61, maxLevel: 61 },
  { slug: "cleaner-vii", label: "Cleaner VII", minLevel: 4, maxLevel: 4 },
  { slug: "guard-dalammer", label: "Guard Dalammer", minLevel: 41, maxLevel: 41 },
  { slug: "guard-dalthur", label: "Guard Dalthur", minLevel: 38, maxLevel: 38 },
  { slug: "guard-doradek", label: "Guard Doradek", minLevel: 38, maxLevel: 38 },
  { slug: "guard-kaldolar", label: "Guard Kaldolar", minLevel: 41, maxLevel: 41 },
  { slug: "kinlo-strongarm", label: "Kinlo Strongarm", minLevel: 50, maxLevel: 50 },
  { slug: "trantor-everhot", label: "Trantor Everhot", minLevel: 35, maxLevel: 35 },
  { slug: "datur-nightseer", label: "Datur Nightseer", minLevel: 61, maxLevel: 61 },
  { slug: "priestess-ghalea", label: "Priestess Ghalea", minLevel: 61, maxLevel: 61 },
  { slug: "guard-ainamar", label: "Guard Ainamar", minLevel: 39, maxLevel: 39 },
  { slug: "diggins", label: "Diggins", minLevel: 61, maxLevel: 61 },
  { slug: "bumle-reminjar", label: "Bumle Reminjar", minLevel: 61, maxLevel: 61 },
  { slug: "founy-jestands", label: "Founy Jestands", minLevel: 45, maxLevel: 45 },
  { slug: "nultal-malfoot", label: "Nultal Malfoot", minLevel: 61, maxLevel: 61 },
  { slug: "dunony-chestire", label: "Dunony Chestire", minLevel: 61, maxLevel: 61 },
  { slug: "resron-silvern", label: "Resron Silvern", minLevel: 61, maxLevel: 61 },
  { slug: "donnel-ratsbome", label: "Donnel Ratsbome", minLevel: 42, maxLevel: 42 },
  { slug: "jark", label: "Jark", minLevel: 50, maxLevel: 50 },
  { slug: "jeet", label: "Jeet", minLevel: 61, maxLevel: 61 },
  { slug: "mater", label: "Mater", minLevel: 61, maxLevel: 61 },
  { slug: "infected-rat", label: "Infected Rat", minLevel: 2, maxLevel: 2 },
  { slug: "atheki-norkhitter", label: "Atheki Norkhitter", minLevel: 9, maxLevel: 11 },
  { slug: "giant-rat", label: "Giant Rat", minLevel: 2, maxLevel: 2 },
  { slug: "kalamin-norkhitter", label: "Kalamin Norkhitter", minLevel: 9, maxLevel: 11 },
  { slug: "usbak-the-old", label: "Usbak the Old", minLevel: 55, maxLevel: 55 },
];

const SOUTH = [
  { slug: "hogunk-ventille", label: "Hogunk Ventille", minLevel: 61, maxLevel: 61 },
  { slug: "beno-targnarle", label: "Beno Targnarle", minLevel: 61, maxLevel: 61 },
  { slug: "canloe-nusback", label: "Canloe Nusback", minLevel: 61, maxLevel: 61 },
  { slug: "byzar-bloodforge", label: "Byzar Bloodforge", minLevel: 61, maxLevel: 61 },
  { slug: "furtog-ogrebane", label: "Furtog Ogrebane", minLevel: 61, maxLevel: 61 },
  { slug: "guard-adolar", label: "Guard Adolar", minLevel: 41, maxLevel: 41 },
  { slug: "guard-adolmer", label: "Guard Adolmer", minLevel: 40, maxLevel: 40 },
  { slug: "guard-anathur", label: "Guard Anathur", minLevel: 40, maxLevel: 40 },
  { slug: "guard-badmer", label: "Guard Badmer", minLevel: 42, maxLevel: 42 },
  { slug: "guard-bobbin", label: "Guard Bobbin", minLevel: 41, maxLevel: 41 },
  { slug: "guard-cardaff", label: "Guard Cardaff", minLevel: 38, maxLevel: 42 },
  { slug: "guard-didek", label: "Guard Didek", minLevel: 39, maxLevel: 39 },
  { slug: "guard-dinamin", label: "Guard Dinamin", minLevel: 41, maxLevel: 41 },
  { slug: "guard-dinler", label: "Guard Dinler", minLevel: 40, maxLevel: 41 },
  { slug: "guard-gabbles", label: "Guard Gabbles", minLevel: 38, maxLevel: 38 },
  { slug: "guard-hinolmer", label: "Guard Hinolmer", minLevel: 41, maxLevel: 41 },
  { slug: "guard-humkor", label: "Guard Humkor", minLevel: 39, maxLevel: 41 },
  { slug: "guard-humphet", label: "Guard Humphet", minLevel: 38, maxLevel: 38 },
  { slug: "guard-kanuf", label: "Guard Kanuf", minLevel: 40, maxLevel: 40 },
  { slug: "guard-kathur", label: "Guard Kathur", minLevel: 40, maxLevel: 40 },
  { slug: "guard-kindor", label: "Guard Kindor", minLevel: 40, maxLevel: 40 },
  { slug: "guard-koranin", label: "Guard Koranin", minLevel: 42, maxLevel: 42 },
  { slug: "guard-ninadek", label: "Guard Ninadek", minLevel: 41, maxLevel: 41 },
  { slug: "guard-ninaf", label: "Guard Ninaf", minLevel: 38, maxLevel: 38 },
  { slug: "guard-stump", label: "Guard Stump", minLevel: 38, maxLevel: 41 },
  { slug: "guard-tantan", label: "Guard Tantan", minLevel: 42, maxLevel: 42 },
  { slug: "king-kazon-stormhammer", label: "King Kazon Stormhammer", minLevel: 50, maxLevel: 50 },
  { slug: "bronlor-lightblade", label: "Bronlor Lightblade", minLevel: 61, maxLevel: 61 },
  { slug: "kilam-oresinger", label: "Kilam Oresinger", minLevel: 25, maxLevel: 25 },
  { slug: "a-bloodforge-captain", label: "A Bloodforge Captain", minLevel: 50, maxLevel: 50 },
  { slug: "barrith-the-brave", label: "Barrith the Brave", minLevel: 61, maxLevel: 61 },
  { slug: "bloodforge-brigade", label: "Bloodforge Brigade", minLevel: 49, maxLevel: 49 },
  { slug: "dirjadak-barbrawler", label: "Dirjadak Barbrawler", minLevel: 61, maxLevel: 61 },
];

const BATCHES: [string, string, typeof NORTH][] = [
  ["north-kaladim", "zone:north-kaladim", NORTH],
  ["south-kaladim", "zone:south-kaladim", SOUTH],
];

let added = 0;
for (const [zoneSlug, zoneId, mobs] of BATCHES) {
  for (const mob of mobs) {
    const id = `mob:${zoneSlug}:${mob.slug}`;
    if (!hasNode(id)) added++;
    addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
    addEdge(id, zoneId, "located_in");
  }
}

save();
console.log(`Migration 238 complete: ${added} mob node(s) added across North Kaladim/South Kaladim`);
