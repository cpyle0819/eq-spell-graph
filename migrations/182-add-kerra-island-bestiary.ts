/**
 * Migration 182: add mob nodes for zone:kerra-island, per the `mob` node
 * type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Sourced via the MediaWiki API technique
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md):
 * Category:Kerra Island's 110 pages narrowed to 74 {{Namedmobpage}}-tagged
 * candidates. This whole island is Kerran territory with no player-faction
 * town of its own (the page's own framing: Kerrans are "peaceful until you
 * make enemies of them," i.e. hostile combat content once engaged) -- the
 * zone's "Types of Monsters" field already names nearly every candidate
 * directly, so almost all 74 are real creatures. "A kobold captive"/"A
 * kobold prisoner" are kept (full level range and Warrior class stated, map
 * legend #1 "Prison with kobold captives" is one of the zone's own named
 * points of interest) -- unlike Firiona Vie's "Bloody gnome captive"
 * (migration 171), neither page's own text confirms a quest-dialogue-only
 * function. "A kerran pazdar" states "19 - 17" (reversed) -- normalized to
 * 17-19, matching its own shaman variant's stated range.
 *
 * Excluded for no resolvable numeric level: "A kerran keeper", "Erfer
 * Longclaw", "Graalf Sharpclaw", "Iffrir Soulcaller", and "Kerran high
 * guard" (all blank "?"). "A kerran priestess" states only "<13" -- a
 * single bound with no second data point to anchor a minimum, same
 * exclusion basis as migration 165's "Kromrif Soldier".
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:kerra-island";

const MOBS = [
  { slug: "lord-gongo", label: "Lord Gongo", minLevel: 20, maxLevel: 20 },
  { slug: "khonza-mitty-of-kerra", label: "Khonza Mitty of Kerra", minLevel: 23, maxLevel: 23 },
  { slug: "a-skeleton", label: "A Skeleton", minLevel: 4, maxLevel: 18 },
  { slug: "a-decaying-skeleton", label: "A Decaying Skeleton", minLevel: 1, maxLevel: 1 },
  { slug: "maugarim", label: "Maugarim", minLevel: 25, maxLevel: 25 },
  { slug: "the-kerran-sha-rr", label: "The Kerran Sha`rr", minLevel: 22, maxLevel: 22 },
  { slug: "marl-kastane", label: "Marl Kastane", minLevel: 60, maxLevel: 60 },
  { slug: "feskr-drinkmaker", label: "Feskr Drinkmaker", minLevel: 15, maxLevel: 15 },
  { slug: "urkath-greyface", label: "Urkath Greyface", minLevel: 18, maxLevel: 18 },
  { slug: "a-catfisher", label: "A Catfisher", minLevel: 2, maxLevel: 2 },
  { slug: "errrak-thickshank", label: "Errrak Thickshank", minLevel: 17, maxLevel: 17 },
  { slug: "wharf-rat", label: "Wharf Rat", minLevel: 11, maxLevel: 16 },
  { slug: "fang-tooth", label: "Fang Tooth", minLevel: 15, maxLevel: 15 },
  { slug: "thalith-mamluk", label: "Thalith Mamluk", minLevel: 14, maxLevel: 14 },
  { slug: "kerran-tseq", label: "Kerran Tseq", minLevel: 12, maxLevel: 12 },
  { slug: "jo-jo", label: "Jo Jo", minLevel: 18, maxLevel: 20 },
  { slug: "hamed-grarr", label: "Hamed Grarr", minLevel: 21, maxLevel: 21 },
  { slug: "kerran-tiger-spahi", label: "Kerran Tiger Spahi", minLevel: 22, maxLevel: 22 },
  { slug: "feren", label: "Feren", minLevel: 14, maxLevel: 14 },
  { slug: "razortooth", label: "Razortooth", minLevel: 25, maxLevel: 25 },
  { slug: "allix", label: "Allix", minLevel: 13, maxLevel: 13 },
  { slug: "a-kerran-amira-priestess", label: "A Kerran Amira Priestess", minLevel: 23, maxLevel: 23 },
  { slug: "a-banished-kerran", label: "A Banished Kerran", minLevel: 20, maxLevel: 20 },
  { slug: "a-gorilla-guard", label: "A Gorilla Guard", minLevel: 17, maxLevel: 18 },
  { slug: "a-gorilla-protector", label: "A Gorilla Protector", minLevel: 17, maxLevel: 18 },
  { slug: "a-heretic-necromancer", label: "A Heretic Necromancer", minLevel: 10, maxLevel: 17 },
  { slug: "a-kerra-lion", label: "A Kerra Lion", minLevel: 19, maxLevel: 21 },
  { slug: "a-kerra-puma", label: "A Kerra Puma", minLevel: 15, maxLevel: 17 },
  { slug: "a-kerran-amir", label: "A Kerran `amir", minLevel: 20, maxLevel: 21 },
  { slug: "a-kerran-ademzada", label: "A Kerran Ademzada", minLevel: 17, maxLevel: 18 },
  { slug: "a-kerran-ademzada-shaman", label: "A Kerran Ademzada Shaman", minLevel: 17, maxLevel: 18 },
  { slug: "a-kerran-ademzada-amir", label: "A Kerran Ademzada`amir", minLevel: 19, maxLevel: 21 },
  { slug: "a-kerran-ahmad-shaman", label: "A Kerran Ahmad Shaman", minLevel: 19, maxLevel: 20 },
  { slug: "a-kerran-amira-guardian", label: "A Kerran Amira Guardian", minLevel: 19, maxLevel: 21 },
  { slug: "a-kerran-amira-protector", label: "A Kerran Amira Protector", minLevel: 20, maxLevel: 20 },
  { slug: "a-kerran-awrat", label: "A Kerran Awrat", minLevel: 11, maxLevel: 13 },
  { slug: "a-kerran-female", label: "A Kerran Female", minLevel: 4, maxLevel: 6 },
  { slug: "a-kerran-ghazi", label: "A Kerran Ghazi", minLevel: 17, maxLevel: 18 },
  { slug: "a-kerran-ghazi-shaman", label: "A Kerran Ghazi Shaman", minLevel: 17, maxLevel: 19 },
  { slug: "a-kerran-ghazi-amir", label: "A Kerran Ghazi`amir", minLevel: 19, maxLevel: 21 },
  { slug: "a-kerran-ghulam", label: "A Kerran Ghulam", minLevel: 14, maxLevel: 17 },
  { slug: "a-kerran-gorilla", label: "A Kerran Gorilla", minLevel: 16, maxLevel: 18 },
  { slug: "a-kerran-gorilla-shaman", label: "A Kerran Gorilla Shaman", minLevel: 17, maxLevel: 18 },
  { slug: "a-kerran-huntress", label: "A Kerran Huntress", minLevel: 9, maxLevel: 11 },
  { slug: "a-kerran-ispusar", label: "A Kerran Ispusar", minLevel: 14, maxLevel: 16 },
  { slug: "a-kerran-male", label: "A Kerran Male", minLevel: 4, maxLevel: 6 },
  { slug: "a-kerran-mamluk", label: "A Kerran Mamluk", minLevel: 11, maxLevel: 13 },
  { slug: "a-kerran-mujahed", label: "A Kerran Mujahed", minLevel: 19, maxLevel: 21 },
  { slug: "a-kerran-pasdar", label: "A Kerran Pasdar", minLevel: 17, maxLevel: 19 },
  { slug: "a-kerran-pazdar", label: "A Kerran Pazdar", minLevel: 17, maxLevel: 19 },
  { slug: "a-kerran-pazdar-shaman", label: "A Kerran Pazdar Shaman", minLevel: 17, maxLevel: 19 },
  { slug: "a-kerran-pridesman", label: "A Kerran Pridesman", minLevel: 9, maxLevel: 10 },
  { slug: "a-kerran-puzhal", label: "A Kerran Puzhal", minLevel: 16, maxLevel: 16 },
  { slug: "a-kerran-sha-rr-apprentice", label: "A Kerran Sha`rr Apprentice", minLevel: 22, maxLevel: 22 },
  { slug: "a-kobold-captive", label: "A Kobold Captive", minLevel: 3, maxLevel: 5 },
  { slug: "a-kobold-prisoner", label: "A Kobold Prisoner", minLevel: 3, maxLevel: 5 },
  { slug: "a-patrolling-tiger", label: "A Patrolling Tiger", minLevel: 17, maxLevel: 17 },
  { slug: "a-tiger", label: "A Tiger", minLevel: 17, maxLevel: 17 },
  { slug: "a-venomous-spikefish", label: "A Venomous Spikefish", minLevel: 13, maxLevel: 13 },
  { slug: "a-wild-tiger", label: "A Wild Tiger", minLevel: 17, maxLevel: 17 },
  { slug: "dozing-ghulam", label: "Dozing Ghulam", minLevel: 17, maxLevel: 17 },
  { slug: "drunken-ghulam", label: "Drunken Ghulam", minLevel: 17, maxLevel: 17 },
  { slug: "falthrik-lothoro", label: "Falthrik Lothoro", minLevel: 17, maxLevel: 19 },
  { slug: "high-priestess-mitty", label: "High Priestess Mitty", minLevel: 17, maxLevel: 17 },
  { slug: "kerran-chieftain", label: "Kerran Chieftain", minLevel: 17, maxLevel: 17 },
  { slug: "kirran-mirrah", label: "Kirran Mirrah", minLevel: 14, maxLevel: 16 },
  { slug: "spikefish", label: "Spikefish", minLevel: 13, maxLevel: 13 },
  { slug: "wislen-mamluk", label: "Wislen Mamluk", minLevel: 14, maxLevel: 15 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:kerra-island:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 182 complete: ${added} mob node(s) added for Kerra Island`);
