/**
 * Migration 165: add mob nodes for zone:eastern-wastes, per the `mob` node
 * type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Same sourcing method as migrations 160-163: eqlwiki.com's
 * Category:Eastern Wastes, filtered to {{Namedmobpage}}-tagged pages via the
 * MediaWiki API technique
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md). 78
 * candidates total; 4 excluded:
 * - "Isolde Winterveil" and "Dreamspeaker Lyssiara" are dialogue-only NPCs
 *   for a 2025 holiday event (all combat fields blank/"??", no known_loot,
 *   description is just flavor emotes) -- no evidence either is fought.
 * - "Tain Hammerfrost" is a "wounded dwarf lying on the ground" whose only
 *   function is a talk trigger that spawns a real ambush encounter; his
 *   infobox is a copy-paste of Boridain Glacierbane's (identical emu_id/
 *   illia_id/AC/HP) and he has no known_loot/faction fields at all.
 * - "Kromrif Soldier"'s only level data is "Dark blue to 59", a relative
 *   con description with no resolvable numeric bound (unlike "A Spirit
 *   Stalker" in migration 163, which had two data points to narrow a range
 *   from) -- excluded per mob-node-type.md's stated-level-only rule.
 *
 * Named Coldain individuals (Boridain Glacierbane, Corbin Blackwell, Dobbin
 * Crossaxe, Garadain Glacierbane, Deaen Greyforge, Gloradin Coldheart,
 * Loremaster Derrin) all carry full combat stats (real AC/HP/damage, not
 * "???") and Kromrif/Kromzek opposing-faction entries confirming they're
 * killable for faction credit -- included despite Coldain being a
 * generally-friendly race, consistent with this app's worst-of faction
 * model meaning they're real combat content for opposing-faction players.
 * "Guard"-named entries here (A Kromrif Prison Guard, Kromrif Prison Guard,
 * Kromrif Guardsman, A/Ry`Gorr Prison Guard, Ry`Gorr Elite Guard) are
 * hostile monster types within enemy camps, not functional town guards --
 * unlike migration 163's excluded "Guard <Name>" pages in Eastern Karana,
 * nothing here patrols on behalf of the player's own faction.
 *
 * Two distinct pages share a near-identical name: "A Ry`Gorr messenger"
 * (generic trash, level 27, part of the zone's "Types of Monsters" list)
 * and "Ry'Gorr Messenger" (a separate named page, level 25) -- kept as two
 * mob nodes with disambiguated slugs.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:eastern-wastes";

const MOBS = [
  { slug: "frost-giant", label: "A Frost Giant", minLevel: 35, maxLevel: 43 },
  { slug: "frost-giant-savage", label: "A Frost Giant Savage", minLevel: 37, maxLevel: 39 },
  { slug: "a-kromrif-prison-guard", label: "A Kromrif Prison Guard", minLevel: 38, maxLevel: 38 },
  { slug: "ry-gorr-avenger", label: "A Ry`Gorr Avenger", minLevel: 45, maxLevel: 45 },
  { slug: "ry-gorr-centurion", label: "A Ry`Gorr Centurion", minLevel: 29, maxLevel: 34 },
  { slug: "ry-gorr-legionaire", label: "A Ry`Gorr Legionaire", minLevel: 37, maxLevel: 40 },
  { slug: "ry-gorr-prison-guard", label: "A Ry`Gorr Prison Guard", minLevel: 33, maxLevel: 33 },
  { slug: "ry-gorr-snow-trooper", label: "A Ry`Gorr Snow Trooper", minLevel: 33, maxLevel: 35 },
  { slug: "ry-gorr-clan-lookout", label: "A Ry`Gorr Clan Lookout", minLevel: 28, maxLevel: 28 },
  { slug: "ry-gorr-clan-scout", label: "A Ry`Gorr Clan Scout", minLevel: 27, maxLevel: 30 },
  { slug: "ry-gorr-invader", label: "A Ry`Gorr Invader", minLevel: 43, maxLevel: 46 },
  { slug: "a-ry-gorr-messenger", label: "A Ry`Gorr Messenger", minLevel: 27, maxLevel: 27 },
  { slug: "ry-gorr-oracle", label: "A Ry`Gorr Oracle", minLevel: 42, maxLevel: 44 },
  { slug: "wooly-rhino", label: "A Wooly Rhino", minLevel: 35, maxLevel: 42 },
  { slug: "blacksmith-of-ry-gorr", label: "A Blacksmith of Ry`Gorr", minLevel: 38, maxLevel: 38 },
  { slug: "blizzard-dervish", label: "A Blizzard Dervish", minLevel: 39, maxLevel: 40 },
  { slug: "coldain-cook", label: "A Coldain Cook", minLevel: 35, maxLevel: 38 },
  { slug: "coldain-hunter", label: "A Coldain Hunter", minLevel: 35, maxLevel: 35 },
  { slug: "coldain-lookout", label: "A Coldain Lookout", minLevel: 35, maxLevel: 35 },
  { slug: "coldain-missionary", label: "A Coldain Missionary", minLevel: 39, maxLevel: 42 },
  { slug: "coldain-skinner", label: "A Coldain Skinner", minLevel: 31, maxLevel: 31 },
  { slug: "coldain-warrior", label: "A Coldain Warrior", minLevel: 33, maxLevel: 33 },
  { slug: "dire-wolf", label: "A Dire Wolf", minLevel: 31, maxLevel: 33 },
  { slug: "elder-snow-griffin", label: "A Elder Snow Griffin", minLevel: 42, maxLevel: 45 },
  { slug: "frost-giant-captain", label: "A Frost Giant Captain", minLevel: 43, maxLevel: 45 },
  { slug: "manticore", label: "A Manticore", minLevel: 36, maxLevel: 42 },
  { slug: "savage-dire-wolf", label: "A Savage Dire Wolf", minLevel: 34, maxLevel: 38 },
  { slug: "snow-bunny", label: "A Snow Bunny", minLevel: 2, maxLevel: 3 },
  { slug: "snow-cougar", label: "A Snow Cougar", minLevel: 27, maxLevel: 38 },
  { slug: "snow-griffin", label: "A Snow Griffin", minLevel: 36, maxLevel: 40 },
  { slug: "tundra-kodiak", label: "A Tundra Kodiak", minLevel: 31, maxLevel: 34 },
  { slug: "tundra-mammoth", label: "A Tundra Mammoth", minLevel: 36, maxLevel: 38 },
  { slug: "walrus", label: "A Walrus", minLevel: 29, maxLevel: 38 },
  { slug: "ulthork-hunter", label: "An Ulthork Hunter", minLevel: 30, maxLevel: 32 },
  { slug: "ulthork-man-o-war", label: "An Ulthork Man O War", minLevel: 41, maxLevel: 42 },
  { slug: "ulthork-warrior", label: "An Ulthork Warrior", minLevel: 33, maxLevel: 35 },
  { slug: "injured-warrior", label: "An Injured Warrior", minLevel: 35, maxLevel: 35 },
  { slug: "ogre-mercenary", label: "An Ogre Mercenary", minLevel: 38, maxLevel: 38 },
  { slug: "bodyguard-nergan", label: "Bodyguard Nergan", minLevel: 50, maxLevel: 50 },
  { slug: "bodyguard-persevil", label: "Bodyguard Persevil", minLevel: 50, maxLevel: 50 },
  { slug: "bodyguard-stoneberg", label: "Bodyguard Stoneberg", minLevel: 50, maxLevel: 50 },
  { slug: "boridain-glacierbane", label: "Boridain Glacierbane", minLevel: 21, maxLevel: 21 },
  { slug: "captain-berradin", label: "Captain Berradin", minLevel: 42, maxLevel: 42 },
  { slug: "chief-ry-gorr", label: "Chief Ry`Gorr", minLevel: 45, maxLevel: 45 },
  { slug: "commander-bahreck", label: "Commander Bahreck", minLevel: 45, maxLevel: 45 },
  { slug: "corbin-blackwell", label: "Corbin Blackwell", minLevel: 41, maxLevel: 41 },
  { slug: "deaen-greyforge", label: "Deaen Greyforge", minLevel: 45, maxLevel: 45 },
  { slug: "dobbin-crossaxe", label: "Dobbin Crossaxe", minLevel: 42, maxLevel: 42 },
  { slug: "ekelng-thunderstone", label: "Ekelng Thunderstone", minLevel: 48, maxLevel: 48 },
  { slug: "firbrand-the-black", label: "Firbrand the Black", minLevel: 35, maxLevel: 35 },
  { slug: "fjloaren-icebane", label: "Fjloaren Icebane", minLevel: 39, maxLevel: 39 },
  { slug: "garadain-glacierbane", label: "Garadain Glacierbane", minLevel: 42, maxLevel: 42 },
  { slug: "garath-the-trader", label: "Garath the Trader", minLevel: 60, maxLevel: 60 },
  { slug: "ghrek-squatnot", label: "Ghrek Squatnot", minLevel: 44, maxLevel: 44 },
  { slug: "gloradin-coldheart", label: "Gloradin Coldheart", minLevel: 41, maxLevel: 41 },
  { slug: "icefang", label: "IceFang", minLevel: 39, maxLevel: 39 },
  { slug: "interrogator-of-ry-gorr", label: "Interrogator of Ry`Gorr", minLevel: 36, maxLevel: 36 },
  { slug: "korrigain", label: "Korrigain", minLevel: 42, maxLevel: 42 },
  { slug: "kromrif-guardsman", label: "Kromrif Guardsman", minLevel: 43, maxLevel: 45 },
  { slug: "kromrif-prison-guard", label: "Kromrif Prison Guard", minLevel: 38, maxLevel: 40 },
  { slug: "loremaster-derrin", label: "Loremaster Derrin", minLevel: 42, maxLevel: 42 },
  { slug: "mystic-of-ry-gorr", label: "Mystic of Ry`Gorr", minLevel: 31, maxLevel: 31 },
  { slug: "oracle-of-ry-gorr", label: "Oracle of Ry`Gorr", minLevel: 44, maxLevel: 50 },
  { slug: "peffin-ambersnow", label: "Peffin Ambersnow", minLevel: 50, maxLevel: 50 },
  { slug: "poxbreath-yellowfang", label: "Poxbreath Yellowfang", minLevel: 46, maxLevel: 47 },
  { slug: "rabid-tundra-kodiak", label: "Rabid Tundra Kodiak", minLevel: 37, maxLevel: 37 },
  { slug: "rodrick-tardok", label: "Rodrick Tardok", minLevel: 39, maxLevel: 42 },
  { slug: "ry-gorr-basher", label: "Ry`Gorr Basher", minLevel: 35, maxLevel: 35 },
  { slug: "ry-gorr-elite-guard", label: "Ry`Gorr Elite Guard", minLevel: 42, maxLevel: 45 },
  { slug: "ry-gorr-emissary", label: "Ry`Gorr Emissary", minLevel: 35, maxLevel: 35 },
  { slug: "ry-gorr-messenger", label: "Ry'Gorr Messenger", minLevel: 25, maxLevel: 25 },
  { slug: "scarbrow-ga-hruk", label: "Scarbrow Ga`Hruk", minLevel: 45, maxLevel: 46 },
  { slug: "ulthork-raider", label: "Ulthork Raider", minLevel: 66, maxLevel: 66 },
  { slug: "warden-bruke", label: "Warden Bruke", minLevel: 45, maxLevel: 45 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:eastern-wastes:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 165 complete: ${added} mob node(s) added for Eastern Wastes`);
