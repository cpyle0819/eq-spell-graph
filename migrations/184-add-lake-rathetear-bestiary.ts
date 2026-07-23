/**
 * Migration 184: add mob nodes for zone:lake-rathetear, per the `mob` node
 * type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Sourced via the MediaWiki API technique
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md):
 * Category:Lake Rathetear's 106 pages narrowed to 71 {{Namedmobpage}}-
 * tagged candidates. Excluded as functional/quest NPCs rather than
 * creatures: "Guard Rianna"/"Guard Treal" (Guards of Qeynos faction, city
 * guards physically stationed here); the map's own "Couple in Hut" --
 * Turgan, Jorna, and Shmendrik Lavawalker -- all three explicitly part of
 * the Cleric Epic quest chain rather than kill targets; eight barbarian
 * individuals (Aija, Brundar, Grinda, Hruthgar, Lorud, Rondel, Tabitha,
 * Tralinda) sharing the "Guards of Qeynos"/"Knights of Thunder" friendly
 * faction tag and the zone's own "Barbarian Village" (map legend #12); "A
 * Boat" (an `NPC Non-quest` whose own level is "You can't consider that.",
 * same non-creature exclusion as Firiona Vie's "Maidens Voyage" and
 * Iceclad Ocean's "Icebreaker"); and "A gnoll shaman (Lake Rathetear)" for
 * having no stated level.
 *
 * By contrast, five "Rogues of the White Rose" individuals (Groethar,
 * Gunhedra, Hulga, Lenklo, Deillia) share a hostile bandit-gang faction,
 * not a town's own, and are included as the zone's own bandit camp (map
 * legend #5/#7). Deep and Lord Bergurgle are both explicit Notable NPCs
 * and named together on the map (legend #14, "tower is where Deep and
 * Lord Bergurgle are"); Eldreth is likewise a Notable NPC and the map's
 * own "Eldreth for the Rogue Epic can also be found here" -- a real
 * fightable epic encounter, same basis as Firiona Vie's "Hero Goxnok"
 * (migration 171). Several named individuals (Kanthurn, Vrynn-family
 * Shamans Kyralynn/Derg/Punga/Grud/Trug, Natasha Whitewater, Rykas, Taia
 * Lyfol, Misty Tekcihta, Emkel Kabae) have full combat stats and no
 * town-faction or vendor/trainer signal -- included as this zone's other
 * ungrouped hostile individuals, consistent with how similarly-ambiguous
 * full-stat-block mobs were handled in migrations 174 and 180.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:lake-rathetear";

const MOBS = [
  { slug: "a-skeleton", label: "A Skeleton", minLevel: 4, maxLevel: 18 },
  { slug: "kanthurn", label: "Kanthurn", minLevel: 37, maxLevel: 37 },
  { slug: "cyanelle", label: "Cyanelle", minLevel: 22, maxLevel: 22 },
  { slug: "eldreth", label: "Eldreth", minLevel: 49, maxLevel: 49 },
  { slug: "princess-lenya-thex", label: "Princess Lenya Thex", minLevel: 26, maxLevel: 26 },
  { slug: "a-royal-fish", label: "A Royal Fish", minLevel: 20, maxLevel: 20 },
  { slug: "a-deepwater-goblin", label: "A Deepwater Goblin", minLevel: 36, maxLevel: 36 },
  { slug: "a-gnoll-high-shaman", label: "A Gnoll High Shaman", minLevel: 15, maxLevel: 17 },
  { slug: "an-aqua-goblin", label: "An Aqua Goblin", minLevel: 9, maxLevel: 11 },
  { slug: "lord-bergurgle", label: "Lord Bergurgle", minLevel: 40, maxLevel: 40 },
  { slug: "a-bone-golem", label: "A Bone Golem", minLevel: 55, maxLevel: 55 },
  { slug: "webclaw-murkwave", label: "Webclaw Murkwave", minLevel: 25, maxLevel: 25 },
  { slug: "a-gnoll", label: "A Gnoll", minLevel: 5, maxLevel: 7 },
  { slug: "kyralynn", label: "Kyralynn", minLevel: 35, maxLevel: 35 },
  { slug: "an-aqua-goblin-shaman", label: "An Aqua Goblin Shaman", minLevel: 9, maxLevel: 11 },
  { slug: "tainted-aquagoblin", label: "Tainted Aquagoblin", minLevel: 36, maxLevel: 36 },
  { slug: "a-gnoll-embalmer", label: "A Gnoll Embalmer", minLevel: 17, maxLevel: 17 },
  { slug: "deep", label: "Deep", minLevel: 57, maxLevel: 58 },
  { slug: "a-spirit-of-flame", label: "A Spirit of Flame", minLevel: 40, maxLevel: 40 },
  { slug: "natasha-whitewater", label: "Natasha Whitewater", minLevel: 40, maxLevel: 40 },
  { slug: "rykas", label: "Rykas", minLevel: 37, maxLevel: 37 },
  { slug: "a-goblin-net-master", label: "A Goblin Net Master", minLevel: 32, maxLevel: 32 },
  { slug: "jonah-brucker", label: "Jonah Brucker", minLevel: 15, maxLevel: 15 },
  { slug: "a-stone-skeleton", label: "A Stone Skeleton", minLevel: 26, maxLevel: 29 },
  { slug: "prince-kyrmt-keroppi", label: "Prince Kyrmt Keroppi", minLevel: 35, maxLevel: 35 },
  { slug: "a-freshwater-shark", label: "A Freshwater Shark", minLevel: 17, maxLevel: 17 },
  { slug: "an-aviak-guard", label: "An Aviak Guard", minLevel: 16, maxLevel: 20 },
  { slug: "a-failed-apprentice", label: "A Failed Apprentice", minLevel: 48, maxLevel: 48 },
  { slug: "a-tortured-soul", label: "A Tortured Soul", minLevel: 55, maxLevel: 55 },
  { slug: "kazen-fecae", label: "Kazen Fecae", minLevel: 59, maxLevel: 59 },
  { slug: "derg", label: "Derg", minLevel: 35, maxLevel: 35 },
  { slug: "an-exhumed-gnoll", label: "An Exhumed Gnoll", minLevel: 19, maxLevel: 21 },
  { slug: "a-greater-zombie", label: "A Greater Zombie", minLevel: 18, maxLevel: 19 },
  { slug: "an-aviak", label: "An Aviak", minLevel: 8, maxLevel: 12 },
  { slug: "punga", label: "Punga", minLevel: 35, maxLevel: 35 },
  { slug: "grud", label: "Grud", minLevel: 35, maxLevel: 35 },
  { slug: "trug", label: "Trug", minLevel: 35, maxLevel: 35 },
  { slug: "corrupted-shaman", label: "Corrupted Shaman", minLevel: 40, maxLevel: 40 },
  { slug: "aqua-goblin-shaman", label: "Aqua Goblin Shaman", minLevel: 11, maxLevel: 11 },
  { slug: "a-gnoll-noble", label: "A Gnoll Noble", minLevel: 10, maxLevel: 14 },
  { slug: "taia-lyfol", label: "Taia Lyfol", minLevel: 37, maxLevel: 37 },
  { slug: "deillia", label: "Deillia", minLevel: 11, maxLevel: 11 },
  { slug: "a-water-snake", label: "A Water Snake", minLevel: 7, maxLevel: 7 },
  { slug: "an-algae-snake", label: "An Algae Snake", minLevel: 6, maxLevel: 6 },
  { slug: "a-bandit", label: "A Bandit", minLevel: 9, maxLevel: 12 },
  { slug: "a-crocodile", label: "A Crocodile", minLevel: 16, maxLevel: 16 },
  { slug: "a-fish", label: "A Fish", minLevel: 1, maxLevel: 1 },
  { slug: "a-froglok", label: "A Froglok", minLevel: 6, maxLevel: 6 },
  { slug: "groethar", label: "Groethar", minLevel: 7, maxLevel: 8 },
  { slug: "gunhedra", label: "Gunhedra", minLevel: 15, maxLevel: 15 },
  { slug: "hulga", label: "Hulga", minLevel: 7, maxLevel: 9 },
  { slug: "lenklo", label: "Lenklo", minLevel: 7, maxLevel: 9 },
  { slug: "misty-tekcihta", label: "Misty Tekcihta", minLevel: 51, maxLevel: 51 },
  { slug: "emkel-kabae", label: "Emkel Kabae", minLevel: 55, maxLevel: 55 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:lake-rathetear:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 184 complete: ${added} mob node(s) added for Lake Rathetear`);
