/**
 * Migration 180: add mob nodes for zone:iceclad-ocean, per the `mob` node
 * type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Sourced via the MediaWiki API technique
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md):
 * Category:Iceclad Ocean's 105 pages narrowed to 49 {{Namedmobpage}}-
 * tagged candidates. Despite the zone's own "Gnome Pirate Outpost" reading
 * like a friendly vendor camp, its named individuals all carry the hostile
 * "Pirates of Iceclad" faction -- the page's own prose confirms this ("the
 * original gnomes who drove Icebreaker here are now busy becoming
 * pirates"), so Nilham the Chef, Ritap, Captain Nalot, Adisson Stubblechin,
 * Nelet Durzit, Feld, Bilf, Madan Eflik, Masurt Dok, Relit, Rendap, Traboh,
 * Tsilos the Swabby, Blik, Gnomish Pirate, Pirate Sentry, Pirate Lookout,
 * Patrolling Sentry, and A Lost Pirate are all included as real combat
 * content, not the outpost's shopkeepers (those aren't Namedmobpage pages
 * at all). Snowfang-prefixed entries (Fisher/Icehunter/Spearguard, An
 * Agitated Snowfang) carry the "Snowfang Gnolls" hostile faction. Cougars,
 * dire wolves, and A Shadow Guardian/A Snow Dervish match the zone's own
 * "Types of Monsters" field.
 *
 * Corudoth ("Mini-Lodi... Good punching bag for Melee testing DPS") and
 * Keref Spiritspear ("Way more than 1500hp... in excess of 2630hp") were
 * confirmed real kill targets via their own description text despite
 * blank factions. Grizlin Bloodfang and Graktar Bluehammer ("Factionless")
 * have no confirming description but also no functional-NPC signal (no
 * GM/Banker/Merchant class, no friendly-town faction) -- included on the
 * same basis as this zone's other full-stat-block named individuals.
 *
 * Excluded: "Ratop" (Pirates of Iceclad faction, but level "?", no
 * resolvable number). "Archivist Tyriele" is a 2025 holiday-event NPC, no
 * combat evidence, same exclusion basis as migration 165's "Isolde
 * Winterveil". "Icebreaker" is the zone's own ferry boat, not a creature
 * (its own stated level: "You can't consider that."), same as Firiona
 * Vie's "Maidens Voyage" (migration 171).
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:iceclad-ocean";

const MOBS = [
  { slug: "nilham-the-chef", label: "Nilham the Chef", minLevel: 26, maxLevel: 26 },
  { slug: "a-frost-giant-scout", label: "A Frost Giant Scout", minLevel: 30, maxLevel: 34 },
  { slug: "keref-spiritspear", label: "Keref Spiritspear", minLevel: 35, maxLevel: 35 },
  { slug: "ritap", label: "Ritap", minLevel: 31, maxLevel: 31 },
  { slug: "grizlin-bloodfang", label: "Grizlin Bloodfang", minLevel: 51, maxLevel: 51 },
  { slug: "corudoth", label: "Corudoth", minLevel: 5, maxLevel: 5 },
  { slug: "a-frost-giant-elite", label: "A Frost Giant Elite", minLevel: 34, maxLevel: 45 },
  { slug: "ami", label: "Ami", minLevel: 31, maxLevel: 31 },
  { slug: "captain-nalot", label: "Captain Nalot", minLevel: 51, maxLevel: 51 },
  { slug: "lodizal", label: "Lodizal", minLevel: 60, maxLevel: 60 },
  { slug: "stormfeather", label: "Stormfeather", minLevel: 34, maxLevel: 34 },
  { slug: "graktar-bluehammer", label: "Graktar Bluehammer", minLevel: 33, maxLevel: 35 },
  { slug: "pulsating-icestorm", label: "Pulsating Icestorm", minLevel: 34, maxLevel: 34 },
  { slug: "a-snow-dervish", label: "A Snow Dervish", minLevel: 27, maxLevel: 34 },
  { slug: "errgriz", label: "Errgriz", minLevel: 28, maxLevel: 28 },
  { slug: "a-dire-wolf", label: "A Dire Wolf", minLevel: 31, maxLevel: 33 },
  { slug: "garou", label: "Garou", minLevel: 38, maxLevel: 38 },
  { slug: "midnight", label: "Midnight", minLevel: 32, maxLevel: 32 },
  { slug: "balix-misteyes", label: "Balix Misteyes", minLevel: 51, maxLevel: 51 },
  { slug: "snowfang-fisher", label: "Snowfang Fisher", minLevel: 28, maxLevel: 28 },
  { slug: "a-lost-pirate", label: "A Lost Pirate", minLevel: 1, maxLevel: 1 },
  { slug: "an-agitated-snowfang", label: "An Agitated Snowfang", minLevel: 29, maxLevel: 29 },
  { slug: "a-snow-cougar", label: "A Snow Cougar", minLevel: 27, maxLevel: 31 },
  { slug: "adisson-stubblechin", label: "Adisson Stubblechin", minLevel: 45, maxLevel: 45 },
  { slug: "elder-spearguard", label: "Elder Spearguard", minLevel: 37, maxLevel: 37 },
  { slug: "dire-wolf-stalker", label: "Dire Wolf Stalker", minLevel: 35, maxLevel: 35 },
  { slug: "rabid-snow-cougar", label: "Rabid Snow Cougar", minLevel: 27, maxLevel: 31 },
  { slug: "a-shadow-guardian", label: "A Shadow Guardian", minLevel: 29, maxLevel: 33 },
  { slug: "nelet-durzit", label: "Nelet Durzit", minLevel: 30, maxLevel: 30 },
  { slug: "snowfang-icehunter", label: "Snowfang Icehunter", minLevel: 27, maxLevel: 33 },
  { slug: "feld", label: "Feld", minLevel: 26, maxLevel: 26 },
  { slug: "bilf", label: "Bilf", minLevel: 26, maxLevel: 26 },
  { slug: "madan-eflik", label: "Madan Eflik", minLevel: 30, maxLevel: 30 },
  { slug: "masurt-dok", label: "Masurt Dok", minLevel: 30, maxLevel: 30 },
  { slug: "relit", label: "Relit", minLevel: 30, maxLevel: 30 },
  { slug: "rendap", label: "Rendap", minLevel: 30, maxLevel: 30 },
  { slug: "traboh", label: "Traboh", minLevel: 30, maxLevel: 30 },
  { slug: "tsilos-the-swabby", label: "Tsilos the Swabby", minLevel: 26, maxLevel: 26 },
  { slug: "blik", label: "Blik", minLevel: 26, maxLevel: 26 },
  { slug: "gnomish-pirate", label: "Gnomish Pirate", minLevel: 30, maxLevel: 30 },
  { slug: "pirate-sentry", label: "Pirate Sentry", minLevel: 30, maxLevel: 30 },
  { slug: "pirate-lookout", label: "Pirate Lookout", minLevel: 26, maxLevel: 26 },
  { slug: "patrolling-sentry", label: "Patrolling Sentry", minLevel: 30, maxLevel: 30 },
  { slug: "snowfang-spearguard", label: "Snowfang Spearguard", minLevel: 29, maxLevel: 31 },
  { slug: "a-sea-walrus", label: "A Sea Walrus", minLevel: 1, maxLevel: 1 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:iceclad-ocean:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 180 complete: ${added} mob node(s) added for Iceclad Ocean`);
