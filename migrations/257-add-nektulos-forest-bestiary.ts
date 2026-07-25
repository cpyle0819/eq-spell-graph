/**
 * Migration 257: add mob nodes for zone:nektulos-forest, per the `mob` node
 * type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * `Category:Nektulos Forest` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 84
 * unique `{{Namedmobpage}}` candidates: the zone's wildlife (skeletons,
 * spiders, snakes, kodiaks, a black bear, beetles), the Leatherfoot halfling
 * roster (a full military rank ladder -- Scout/Corporal/Sergeant/Captain/
 * Deputy -- plus Guardians of the Vale druid initiates/questers and Mayor
 * Gubbin-aligned neophytes, all tied to the zone's own Innoruuk Symbol/
 * Words of Darkness quest chains), and a large Dark Bargainers dark elf
 * guard garrison (a long "Guard `<letter>`Backtick`<name>`" roster plus
 * Corporal/Sergeant ranks and three named Dragoons/a Captain), a shadowed
 * man, and Venenzi Oberzendi's Necromancer Epic questline starter.
 *
 * Two exclusions, both no stated numeric level: "A large arachneidae"
 * (level "?", its own page flagged `{{delete}}{{DNE}}` as possibly not a
 * real mob under this name) and "Venenzi Oberzendi" (level "??", despite
 * being a real quest-chain NPC -- consistent with the established
 * no-stated-level exclusion rule over role/notability).
 *
 * Two cross-zone level reads: "A skeleton" and "A Greater Skeleton" use
 * their base level range (`4-18`, `7-20`) since neither singles out
 * Nektulos Forest in its own `level` string, same call as migration 212's
 * Estate of Unrest "A Greater Skeleton" and migration 248's Western Karana
 * "A skeleton".
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const MOBS = [
  { slug: "a-skeleton", label: "A skeleton", minLevel: 4, maxLevel: 18 },
  { slug: "a-decaying-skeleton", label: "A Decaying Skeleton", minLevel: 1, maxLevel: 10 },
  { slug: "a-zombie", label: "A Zombie", minLevel: 7, maxLevel: 10 },
  { slug: "forley", label: "Forley", minLevel: 7, maxLevel: 7 },
  { slug: "initiate-guanin", label: "Initiate Guanin", minLevel: 8, maxLevel: 8 },
  { slug: "leatherfoot-captain", label: "Leatherfoot Captain", minLevel: 10, maxLevel: 10 },
  { slug: "leatherfoot-corporal", label: "Leatherfoot Corporal", minLevel: 3, maxLevel: 3 },
  { slug: "leatherfoot-scout", label: "Leatherfoot Scout", minLevel: 1, maxLevel: 1 },
  { slug: "leatherfoot-sergeant", label: "Leatherfoot Sergeant", minLevel: 8, maxLevel: 10 },
  { slug: "neophyte-hazel", label: "Neophyte Hazel", minLevel: 4, maxLevel: 4 },
  { slug: "quester-dunden", label: "Quester Dunden", minLevel: 9, maxLevel: 12 },
  { slug: "quester-hannil", label: "Quester Hannil", minLevel: 10, maxLevel: 10 },
  { slug: "a-deathfist-legionnaire", label: "A Deathfist Legionnaire", minLevel: 7, maxLevel: 9 },
  { slug: "a-greater-skeleton", label: "A Greater Skeleton", minLevel: 7, maxLevel: 20 },
  { slug: "kirak-vil", label: "Kirak Vil", minLevel: 56, maxLevel: 56 },
  { slug: "dragoon-tsanne", label: "Dragoon Tsanne", minLevel: 50, maxLevel: 50 },
  { slug: "dragoon-j-len", label: "Dragoon J`Len", minLevel: 50, maxLevel: 50 },
  { slug: "initiate-rambel", label: "Initiate Rambel", minLevel: 5, maxLevel: 5 },
  { slug: "neophyte-edel", label: "Neophyte Edel", minLevel: 4, maxLevel: 4 },
  { slug: "neophyte-halle", label: "Neophyte Halle", minLevel: 4, maxLevel: 4 },
  { slug: "master-whoopal", label: "Master Whoopal", minLevel: 13, maxLevel: 13 },
  { slug: "guard-z-den", label: "Guard Z`Den", minLevel: 13, maxLevel: 13 },
  { slug: "a-spiderling", label: "A Spiderling", minLevel: 1, maxLevel: 4 },
  { slug: "orc-runner", label: "Orc runner", minLevel: 7, maxLevel: 7 },
  { slug: "a-rotting-citizen", label: "A Rotting Citizen", minLevel: 7, maxLevel: 7 },
  { slug: "a-willowisp", label: "A Willowisp", minLevel: 9, maxLevel: 11 },
  { slug: "a-rotting-initiate", label: "A Rotting Initiate", minLevel: 7, maxLevel: 7 },
  { slug: "an-undead-annalkeeper", label: "An Undead Annalkeeper", minLevel: 10, maxLevel: 10 },
  { slug: "corporal-j-rais", label: "Corporal J`Rais", minLevel: 21, maxLevel: 21 },
  { slug: "guard-n-lan", label: "Guard N`Lan", minLevel: 15, maxLevel: 15 },
  { slug: "corporal-x-horn", label: "Corporal X`Horn", minLevel: 22, maxLevel: 22 },
  { slug: "guard-f-losta", label: "Guard F`Losta", minLevel: 17, maxLevel: 17 },
  { slug: "a-stone-guardian", label: "A Stone Guardian", minLevel: 13, maxLevel: 15 },
  { slug: "an-undead-steward", label: "An Undead Steward", minLevel: 10, maxLevel: 10 },
  { slug: "a-black-wolf", label: "A Black Wolf", minLevel: 1, maxLevel: 1 },
  { slug: "a-shadow-wolf", label: "A shadow wolf", minLevel: 3, maxLevel: 5 },
  { slug: "initiate-pool", label: "Initiate Pool", minLevel: 7, maxLevel: 7 },
  { slug: "initiate-abber", label: "Initiate Abber", minLevel: 5, maxLevel: 5 },
  { slug: "initiate-hart", label: "Initiate Hart", minLevel: 5, maxLevel: 5 },
  { slug: "initiate-umbra", label: "Initiate Umbra", minLevel: 9, maxLevel: 9 },
  { slug: "gollee", label: "Gollee", minLevel: 7, maxLevel: 7 },
  { slug: "leatherfoot-deputy", label: "Leatherfoot Deputy", minLevel: 20, maxLevel: 29 },
  { slug: "himmel", label: "Himmel", minLevel: 7, maxLevel: 7 },
  { slug: "a-young-kodiak", label: "A Young Kodiak", minLevel: 10, maxLevel: 10 },
  { slug: "captain-n-farre", label: "Captain N`Farre", minLevel: 50, maxLevel: 50 },
  { slug: "a-black-bear", label: "A Black Bear", minLevel: 4, maxLevel: 5 },
  { slug: "bink", label: "Bink", minLevel: 6, maxLevel: 6 },
  { slug: "hamer", label: "Hamer", minLevel: 7, maxLevel: 7 },
  { slug: "jossle", label: "Jossle", minLevel: 8, maxLevel: 8 },
  { slug: "klimmer", label: "Klimmer", minLevel: 11, maxLevel: 11 },
  { slug: "quester-hannin", label: "Quester Hannin", minLevel: 9, maxLevel: 9 },
  { slug: "a-fire-beetle", label: "A Fire Beetle", minLevel: 2, maxLevel: 2 },
  { slug: "sergeant-c-orm", label: "Sergeant C`orm", minLevel: 60, maxLevel: 62 },
  { slug: "guard-x-onnu", label: "Guard X`Onnu", minLevel: 15, maxLevel: 15 },
  { slug: "guard-e-tru", label: "Guard E`Tru", minLevel: 50, maxLevel: 50 },
  { slug: "snitch", label: "Snitch", minLevel: 9, maxLevel: 9 },
  { slug: "corporal-d-abth", label: "Corporal D`Abth", minLevel: 21, maxLevel: 21 },
  { slug: "travis-two-tone", label: "Travis Two Tone", minLevel: 25, maxLevel: 25 },
  { slug: "guard-e-brona", label: "Guard E`Brona", minLevel: 17, maxLevel: 17 },
  { slug: "corporal-x-tis", label: "Corporal X`Tis", minLevel: 19, maxLevel: 19 },
  { slug: "guard-t-aba", label: "Guard T`Aba", minLevel: 14, maxLevel: 14 },
  { slug: "guard-v-ehn", label: "Guard V`Ehn", minLevel: 17, maxLevel: 17 },
  { slug: "an-iron-guardian", label: "An Iron Guardian", minLevel: 20, maxLevel: 22 },
  { slug: "leatherfoot-medic", label: "Leatherfoot Medic", minLevel: 20, maxLevel: 20 },
  { slug: "a-large-spider", label: "A large spider", minLevel: 2, maxLevel: 4 },
  { slug: "a-giant-widow", label: "A giant widow", minLevel: 10, maxLevel: 14 },
  { slug: "a-darkwater-piranha", label: "A darkwater piranha", minLevel: 14, maxLevel: 14 },
  { slug: "sergeant-j-narus", label: "Sergeant J`Narus", minLevel: 25, maxLevel: 25 },
  { slug: "guard-g-varr", label: "Guard G`Varr", minLevel: 14, maxLevel: 14 },
  { slug: "an-araneidae-spiderling", label: "An araneidae spiderling", minLevel: 1, maxLevel: 1 },
  { slug: "rollis", label: "Rollis", minLevel: 8, maxLevel: 8 },
  { slug: "guard-t-quetal", label: "Guard T`Quetal", minLevel: 13, maxLevel: 13 },
  { slug: "guard-v-lex", label: "Guard V`Lex", minLevel: 13, maxLevel: 13 },
  { slug: "guard-d-zel", label: "Guard D`Zel", minLevel: 14, maxLevel: 14 },
  { slug: "a-garter-snake", label: "A garter snake", minLevel: 1, maxLevel: 1 },
  { slug: "a-black-mamba", label: "A black mamba", minLevel: 7, maxLevel: 7 },
  { slug: "a-pyre-beetle", label: "A pyre beetle", minLevel: 2, maxLevel: 2 },
  { slug: "a-shadowed-man-nektulos-forest", label: "A shadowed man (Nektulos Forest)", minLevel: 24, maxLevel: 26 },
  { slug: "cannix", label: "Cannix", minLevel: 7, maxLevel: 7 },
  { slug: "dragoon-v-tai", label: "Dragoon V`tai", minLevel: 36, maxLevel: 36 },
  { slug: "foley", label: "Foley", minLevel: 7, maxLevel: 11 },
  { slug: "gammer", label: "Gammer", minLevel: 8, maxLevel: 8 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:nektulos-forest:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, "zone:nektulos-forest", "located_in");
}

save();
console.log(`Migration 257 complete: ${added} mob node(s) added to zone:nektulos-forest`);
