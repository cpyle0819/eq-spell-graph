/**
 * Migration 227: add mob nodes for zone:west-freeport, per the `mob` node
 * type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * `Category:West Freeport` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 83
 * `{{Namedmobpage}}`-tagged candidates. New split for this zone, folded
 * into that decision doc: West Freeport's own zone history section
 * describes a civil war -- Sir Lucan D'Lere staged a coup with a band of
 * mercenaries (the "Freeport Militia") and still holds half the city in a
 * "cold war" against the loyal Knights of Truth/Priests of Marr. Every
 * candidate's own `factions` field (which side it belongs to, i.e. which
 * faction takes a hit when it's killed) cleanly sorts along that split:
 *
 * - Loyalist establishment (own `factions` = Knights of Truth/Priests of
 *   Marr/Guards of Qeynos/Steel Warriors/Arcane Scientists/Ashen Order):
 *   the GM guildmasters, the regular-numbered "Guard <name>" city guards,
 *   and named citizens -- excluded wholesale, same call as North Qeynos/
 *   East Freeport/North Freeport's own loyalist rosters.
 * - Militia occupiers (own `factions` = Freeport Militia/Coalition of
 *   Tradefolk Underground/Bloodsabers/Corrupt Qeynos Guards): a real,
 *   designed kill-target roster confirmed by real weapon/armor drops
 *   (Damaged Militia Helm, Rusty/Fine Steel weapons, Kite Shield) --
 *   including all 24 of the zone's "Guard <name>" mercenaries (despite
 *   sharing the exact naming pattern of the excluded loyalist guards one
 *   bullet up; only the `factions` field tells them apart).
 *
 * Two named exceptions the faction split alone doesn't cover:
 * - "Guard Alayle": own `factions` is loyalist (Steel Warriors), but he's
 *   the actual target of `The Traitor` quest -- a double agent planted in
 *   the Militia's ranks, confirmed by his own page's description and his
 *   drop (Slashed Militia Tunic, the quest turn-in item). Kept as a real
 *   fight despite reading loyalist on the faction split alone.
 * - "Knight of Truth": loyalist by the same faction split, no quest tie,
 *   no distinguishing description ("Description Needed", every combat
 *   stat literally "???") -- excluded, unlike Alayle.
 *
 * Also kept: "Sir Lucan Dlere" (the coup leader himself, living GM form)
 * and "Sir Lucan D`Lere" (his undead form, spawns immediately on the
 * living form's death) as two separate mob nodes -- distinct stats/loot
 * per the wiki's own two pages, same "two-stage boss" shape as a re-spawn
 * mechanic, not a duplicate. "Brother Jentry" (Militia cleric who
 * "automatically assist[s] Sir Lucan no matter where he is") is kept
 * alongside him as part of that fight. "Jyle Windshot" (a Ranger hidden in
 * a Hogcaller's Inn room, tied to the Ranger epic-line `Trueshot Longbow
 * Quest`) is kept as another hidden epic-quest encounter, same shape as
 * North Freeport's "Bondl Felligan" (migration 225).
 *
 * Generic creatures: only "A wolf", "Orc Centurion (Deathfist)", and
 * "Deathfist Pawn" have their own `zone` field naming West Freeport
 * explicitly. "A Decaying Skeleton", "A Fire Beetle", "A bat", "A Large
 * Rat", "A sewer rat", and "A snake" all read `zone = Various` with no
 * West-Freeport-specific mention in their own description -- excluded,
 * same "must confirm zone" rule as Lower Guk's "A froglok tsu shaman".
 * "A Drowned Citizen" is the exception among the shared-name mobs: its own
 * `zone` field names West Freeport explicitly, and it's the map's own
 * Tunnels legend calling out "four A Drowned Citizens" in the flooded
 * cistern -- kept. "A piranha" reads the opposite way: categorized under
 * West Freeport, but its own description names North Freeport specifically
 * -- excluded here and added to North Freeport's bestiary instead
 * (migration 225), same "description outranks stale category" call as
 * Splitpaw's "The Ishva Mal".
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:west-freeport";

const MOBS = [
  // Freeport Militia occupiers -- the "Guard <name>" mercenary roster
  { slug: "guard-fikus", label: "Guard Fikus", minLevel: 37, maxLevel: 37 },
  { slug: "guard-effel", label: "Guard Effel", minLevel: 36, maxLevel: 36 },
  { slug: "guard-drazden", label: "Guard Drazden", minLevel: 40, maxLevel: 40 },
  { slug: "guard-fralldo", label: "Guard Fralldo", minLevel: 35, maxLevel: 35 },
  { slug: "guard-greedin", label: "Guard Greedin", minLevel: 37, maxLevel: 37 },
  { slug: "guard-hiron", label: "Guard Hiron", minLevel: 35, maxLevel: 35 },
  { slug: "guard-jup", label: "Guard Jup", minLevel: 30, maxLevel: 30 },
  { slug: "guard-kroon", label: "Guard Kroon", minLevel: 40, maxLevel: 40 },
  { slug: "guard-lithnon", label: "Guard Lithnon", minLevel: 30, maxLevel: 30 },
  { slug: "guard-ogo", label: "Guard Ogo", minLevel: 35, maxLevel: 35 },
  { slug: "guard-doolin", label: "Guard Doolin", minLevel: 61, maxLevel: 61 },
  { slug: "guard-hrakin", label: "Guard Hrakin", minLevel: 30, maxLevel: 30 },
  { slug: "guard-imillin", label: "Guard Imillin", minLevel: 35, maxLevel: 35 },
  { slug: "guard-jacsen", label: "Guard Jacsen", minLevel: 61, maxLevel: 61 },
  { slug: "guard-munden", label: "Guard Munden", minLevel: 61, maxLevel: 61 },
  { slug: "guard-jendl", label: "Guard Jendl", minLevel: 37, maxLevel: 37 },
  { slug: "guard-gollus", label: "Guard Gollus", minLevel: 37, maxLevel: 37 },
  { slug: "guard-cozak", label: "Guard Cozak", minLevel: 32, maxLevel: 33 },
  { slug: "guard-mizraen", label: "Guard Mizraen", minLevel: 35, maxLevel: 35 },
  { slug: "guard-dungwatch", label: "Guard Dungwatch", minLevel: 40, maxLevel: 40 },
  { slug: "guard-corpillius", label: "Guard Corpillius", minLevel: 34, maxLevel: 35 },
  { slug: "guard-ledshin", label: "Guard Ledshin", minLevel: 27, maxLevel: 27 },
  { slug: "guard-inofus", label: "Guard Inofus", minLevel: 40, maxLevel: 40 },
  { slug: "guard-bonlo", label: "Guard Bonlo", minLevel: 61, maxLevel: 62 },

  // Freeport Militia occupiers -- named leadership and agents
  { slug: "sir-lucan-dlere", label: "Sir Lucan Dlere", minLevel: 48, maxLevel: 48 },
  { slug: "sir-lucan-dlere-undead", label: "Sir Lucan D'Lere (Undead)", minLevel: 46, maxLevel: 46 },
  { slug: "brother-jentry", label: "Brother Jentry", minLevel: 40, maxLevel: 40 },
  { slug: "captain-hazran", label: "Captain Hazran", minLevel: 61, maxLevel: 61 },
  { slug: "hollish-tnoops", label: "Hollish Tnoops", minLevel: 14, maxLevel: 14 },
  { slug: "driana-poxsbourne", label: "Driana Poxsbourne", minLevel: 25, maxLevel: 25 },
  { slug: "rebby-willend", label: "Rebby Willend", minLevel: 27, maxLevel: 27 },
  { slug: "janam-rekish", label: "Janam Rekish", minLevel: 14, maxLevel: 14 },

  // Loyalist double agent -- The Traitor quest target
  { slug: "guard-alayle", label: "Guard Alayle", minLevel: 9, maxLevel: 9 },

  // Hidden epic-quest encounter
  { slug: "jyle-windshot", label: "Jyle Windshot", minLevel: 30, maxLevel: 30 },

  // Generic creatures confirmed for this zone
  { slug: "deathfist-pawn", label: "Deathfist Pawn", minLevel: 1, maxLevel: 1 },
  { slug: "orc-centurion-deathfist", label: "Orc Centurion (Deathfist)", minLevel: 3, maxLevel: 10 },
  { slug: "a-wolf", label: "A wolf", minLevel: 5, maxLevel: 5 },
  { slug: "a-drowned-citizen", label: "A Drowned Citizen", minLevel: 11, maxLevel: 11 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:west-freeport:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 227 complete: ${added} mob node(s) added for West Freeport`);
