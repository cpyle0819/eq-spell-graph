/**
 * Migration 223: add mob nodes for zone:high-keep, per the `mob` node type
 * from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * `Category:High Keep` narrowed via the MediaWiki API method (decisions/
 * eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 82
 * `{{Namedmobpage}}`-tagged candidates. Same "stats over name" call as
 * Felwithe/Grobb (migrations 217/219/221): the zone's own "Guard Placement
 * and Leveling Guide" section confirms every named guard is a real,
 * farmed fight ("Each guard drops a sword which sells for 5pp"), and every
 * candidate here -- guards, the pickclaw goblin camp (Lookouts,
 * Spiritists, Cabalists, Warriors, Visionaries, Raiders, Seers, a generic
 * Guard), bankers/clerks, nobles, and named quest NPCs alike -- carries a
 * full combat stat block. "Lozani", "Captain Bosec", and "Captain
 * Boshinko" already exist as `npc:high-keep:...` quest-giver nodes; each
 * gets a `mob:` counterpart too, same established "can legitimately be
 * both" overlap as prior batches. Trimmed the wiki's own disambiguation
 * suffixes off two labels ("A prisoner (HK)", "Princess Lenya (NPC)") --
 * page-naming artifacts, not in-game names.
 *
 * Excluded: "Tolon Nurbyte" -- its own `zone` field names North Felwithe,
 * not High Keep, despite sharing this category (same miscategorized-
 * candidate pattern as Lower Guk's "A froglok tsu shaman"). "Dulcyna
 * Blackhand"'s level is hedged (`44? (needs confirmation)`) but still a
 * real number, so kept per the existing "hedge alongside a real number"
 * rule.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:high-keep";

const MOBS = [
  { slug: "a-crazed-goblin", label: "A Crazed Goblin", minLevel: 23, maxLevel: 23 },
  { slug: "captain-bosec", label: "Captain Bosec", minLevel: 34, maxLevel: 34 },
  { slug: "lozani", label: "Lozani", minLevel: 30, maxLevel: 30 },
  { slug: "isabella-cellus", label: "Isabella Cellus", minLevel: 38, maxLevel: 42 },
  { slug: "bank-clerk-jaylin", label: "Bank Clerk Jaylin", minLevel: 25, maxLevel: 25 },
  { slug: "lady-mccabe", label: "Lady McCabe", minLevel: 37, maxLevel: 37 },
  { slug: "purchin-oddsbot", label: "Purchin Oddsbot", minLevel: 33, maxLevel: 35 },
  { slug: "ran-flamespinner", label: "Ran Flamespinner", minLevel: 61, maxLevel: 61 },
  { slug: "rodrick-marslett", label: "Rodrick Marslett", minLevel: 13, maxLevel: 13 },
  { slug: "a-maid", label: "A Maid", minLevel: 9, maxLevel: 11 },
  { slug: "carson-mccabe", label: "Carson Mccabe", minLevel: 40, maxLevel: 40 },
  { slug: "dyrna-nlith", label: "Dyrna Nlith", minLevel: 38, maxLevel: 42 },
  { slug: "flayer-hopkins", label: "Flayer Hopkins", minLevel: 25, maxLevel: 25 },
  { slug: "guard-bicker", label: "Guard Bicker", minLevel: 23, maxLevel: 27 },
  { slug: "guard-blayle", label: "Guard Blayle", minLevel: 20, maxLevel: 20 },
  { slug: "guard-rance", label: "Guard Rance", minLevel: 28, maxLevel: 30 },
  { slug: "guard-duras", label: "Guard Duras", minLevel: 27, maxLevel: 29 },
  { slug: "guard-folton", label: "Guard Folton", minLevel: 21, maxLevel: 24 },
  { slug: "guard-lancel", label: "Guard Lancel", minLevel: 24, maxLevel: 27 },
  { slug: "guard-lorton", label: "Guard Lorton", minLevel: 26, maxLevel: 29 },
  { slug: "tyrana-slil", label: "Tyrana Slil", minLevel: 32, maxLevel: 32 },
  { slug: "mistress-anna", label: "Mistress Anna", minLevel: 35, maxLevel: 35 },
  { slug: "tearon-bleanix", label: "Tearon Bleanix", minLevel: 30, maxLevel: 30 },
  { slug: "guard-chin", label: "Guard Chin", minLevel: 28, maxLevel: 31 },
  { slug: "guard-handy", label: "Guard Handy", minLevel: 31, maxLevel: 32 },
  { slug: "guard-onto", label: "Guard Onto", minLevel: 23, maxLevel: 26 },
  { slug: "a-goblin-thief", label: "A Goblin Thief", minLevel: 26, maxLevel: 26 },
  { slug: "lislia-goldtune", label: "Lislia Goldtune", minLevel: 25, maxLevel: 25 },
  { slug: "starr-dreamspinner", label: "Starr Dreamspinner", minLevel: 40, maxLevel: 40 },
  { slug: "storm-dragonchaser", label: "Storm Dragonchaser", minLevel: 40, maxLevel: 40 },
  { slug: "a-pickclaw-visionary", label: "A Pickclaw Visionary", minLevel: 25, maxLevel: 25 },
  { slug: "a-pickclaw-raider", label: "A Pickclaw Raider", minLevel: 31, maxLevel: 31 },
  { slug: "a-pickclaw-warrior", label: "A pickclaw warrior", minLevel: 28, maxLevel: 32 },
  { slug: "assistant-kiolna", label: "Assistant Kiolna", minLevel: 25, maxLevel: 25 },
  { slug: "aeris-greymalkyn", label: "Aeris Greymalkyn", minLevel: 37, maxLevel: 37 },
  { slug: "osargen", label: "Osargen", minLevel: 22, maxLevel: 22 },
  { slug: "a-prisoner-hk", label: "A prisoner", minLevel: 8, maxLevel: 12 },
  { slug: "a-noble", label: "A noble", minLevel: 39, maxLevel: 42 },
  { slug: "captain-boshinko", label: "Captain Boshinko", minLevel: 40, maxLevel: 40 },
  { slug: "a-pickclaw-seer", label: "A Pickclaw seer", minLevel: 29, maxLevel: 30 },
  { slug: "princess-lenia-pet", label: "Princess lenia pet", minLevel: 20, maxLevel: 20 },
  { slug: "a-pickclaw-lookout", label: "A Pickclaw Lookout", minLevel: 23, maxLevel: 24 },
  { slug: "princess-lenia", label: "Princess Lenia", minLevel: 20, maxLevel: 22 },
  { slug: "a-pickclaw-cabalist", label: "A Pickclaw Cabalist", minLevel: 23, maxLevel: 25 },
  { slug: "a-pickclaw-guard", label: "A pickclaw guard", minLevel: 25, maxLevel: 27 },
  { slug: "a-pickclaw-spiritist", label: "A Pickclaw Spiritist", minLevel: 22, maxLevel: 22 },
  { slug: "lucky-the-beggar", label: "Lucky the Beggar", minLevel: 4, maxLevel: 6 },
  { slug: "fenn-kaedrick", label: "Fenn Kaedrick", minLevel: 7, maxLevel: 7 },
  { slug: "xentil-herkanon", label: "Xentil Herkanon", minLevel: 16, maxLevel: 16 },
  { slug: "jail-clerk-maryl", label: "Jail Clerk Maryl", minLevel: 40, maxLevel: 40 },
  { slug: "a-body-guard", label: "A body guard", minLevel: 45, maxLevel: 45 },
  { slug: "a-lady-in-waiting", label: "A lady in waiting", minLevel: 8, maxLevel: 12 },
  { slug: "dulcyna-blackhand", label: "Dulcyna Blackhand", minLevel: 44, maxLevel: 44 },
  { slug: "grez", label: "Grez", minLevel: 11, maxLevel: 11 },
  { slug: "guard-anleal", label: "Guard Anleal", minLevel: 30, maxLevel: 31 },
  { slug: "guard-antilles", label: "Guard Antilles", minLevel: 27, maxLevel: 30 },
  { slug: "guard-bach", label: "Guard Bach", minLevel: 24, maxLevel: 26 },
  { slug: "guard-bolton", label: "Guard Bolton", minLevel: 23, maxLevel: 26 },
  { slug: "guard-bonner", label: "Guard Bonner", minLevel: 24, maxLevel: 26 },
  { slug: "guard-chopin", label: "Guard Chopin", minLevel: 23, maxLevel: 24 },
  { slug: "guard-clyzen", label: "Guard Clyzen", minLevel: 24, maxLevel: 27 },
  { slug: "guard-diff", label: "Guard Diff", minLevel: 26, maxLevel: 27 },
  { slug: "guard-dister", label: "Guard Dister", minLevel: 22, maxLevel: 24 },
  { slug: "guard-drugan", label: "Guard Drugan", minLevel: 25, maxLevel: 26 },
  { slug: "guard-dwight", label: "Guard Dwight", minLevel: 29, maxLevel: 32 },
  { slug: "guard-gechop", label: "Guard Gechop", minLevel: 28, maxLevel: 29 },
  { slug: "guard-golgon", label: "Guard Golgon", minLevel: 23, maxLevel: 27 },
  { slug: "guard-heltch", label: "Guard Heltch", minLevel: 23, maxLevel: 24 },
  { slug: "guard-jaxon", label: "Guard Jaxon", minLevel: 26, maxLevel: 28 },
  { slug: "guard-kheb", label: "Guard Kheb", minLevel: 29, maxLevel: 32 },
  { slug: "guard-kovan", label: "Guard Kovan", minLevel: 25, maxLevel: 27 },
  { slug: "guard-mytin", label: "Guard Mytin", minLevel: 30, maxLevel: 32 },
  { slug: "guard-queztin", label: "Guard Queztin", minLevel: 23, maxLevel: 27 },
  { slug: "guard-sintra", label: "Guard Sintra", minLevel: 28, maxLevel: 32 },
  { slug: "guard-sydl", label: "Guard Sydl", minLevel: 28, maxLevel: 32 },
  { slug: "guard-wextr", label: "Guard Wextr", minLevel: 24, maxLevel: 27 },
  { slug: "guard-xantar", label: "Guard Xantar", minLevel: 24, maxLevel: 27 },
  { slug: "guard-yeltin", label: "Guard Yeltin", minLevel: 25, maxLevel: 27 },
  { slug: "lartin", label: "Lartin", minLevel: 11, maxLevel: 11 },
  { slug: "princess-lenya-npc", label: "Princess Lenya", minLevel: 25, maxLevel: 25 },
  { slug: "tsaria-jnarus", label: "Tsaria Jnarus", minLevel: 43, maxLevel: 43 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:high-keep:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 223 complete: ${added} mob node(s) added for High Keep`);
