/**
 * Migration 256: add mob nodes for zone:west-commonlands, per the `mob`
 * node type from migration 060 (decisions/mob-node-type.md) -- see issue
 * #36.
 *
 * `Category:West Commonlands` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 44
 * unique `{{Namedmobpage}}` candidates: the zone's wildlife (kodiaks, pumas,
 * plains cats, griffins, rattlesnakes, asps), an undead cluster (skeletons,
 * ghouls, a hill giant, a willowisp, a tortured revenant), the Deathfist orc
 * camp (Apprentice/Pawn/Centurion/Legionnaire/Oracle), the Cutthroat Dervish
 * camp, the Jaggedpine Treefolk druid ring (Cei Sunjumper, Sil Silverstar,
 * Ceel Moonwhisper, Shadow Treebright), the Coalition of Tradefolk
 * Underground's tollbooth guards (Valon, Colin, the two Tonsmiths), Dragoon
 * Zytl's Dark Bargainers camp, a shadowed man, and several standalone named
 * NPCs (Nightfall Giant, Jahsohn Aksot, Simon Aldicott, Wallin Slyfoot,
 * Duggin Scumber, Modren Fishcatcher).
 *
 * Two exclusions, both no stated numeric level (`level = ??` / `?`):
 * "Kizdean Gix Pet" and "Skipynn Stoneshear" -- same call as Northern
 * Karana's excluded Quartermaster Nellian. Everything else kept regardless
 * of a "Guard"/"Banker"/fisherman-flavored name, per the established "stats
 * over name" rule -- e.g. Modren Fishcatcher's loot is just a fishing pole,
 * but it carries a full AC/HP/damage stat block like every other candidate
 * here.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const MOBS = [
  { slug: "a-skeleton", label: "A skeleton", minLevel: 4, maxLevel: 18 },
  { slug: "a-ghoul", label: "A ghoul", minLevel: 13, maxLevel: 17 },
  { slug: "mojax-hikspin", label: "Mojax Hikspin", minLevel: 3, maxLevel: 3 },
  { slug: "a-hill-giant", label: "A Hill Giant", minLevel: 33, maxLevel: 37 },
  { slug: "guard-valon", label: "Guard Valon", minLevel: 30, maxLevel: 30 },
  { slug: "kizdean-gix", label: "Kizdean Gix", minLevel: 18, maxLevel: 18 },
  { slug: "guard-colin", label: "Guard Colin", minLevel: 31, maxLevel: 31 },
  { slug: "timtok-tonsmith", label: "Timtok Tonsmith", minLevel: 29, maxLevel: 29 },
  { slug: "ranvigoz-tonsmith", label: "Ranvigoz Tonsmith", minLevel: 31, maxLevel: 31 },
  { slug: "cei-sunjumper", label: "Cei Sunjumper", minLevel: 30, maxLevel: 30 },
  { slug: "sil-silverstar", label: "Sil Silverstar", minLevel: 30, maxLevel: 30 },
  { slug: "ceel-moonwhisper", label: "Ceel Moonwhisper", minLevel: 30, maxLevel: 30 },
  { slug: "a-dervish-thug", label: "A Dervish Thug", minLevel: 15, maxLevel: 15 },
  { slug: "shadow-treebright", label: "Shadow Treebright", minLevel: 30, maxLevel: 30 },
  { slug: "a-willowisp", label: "A Willowisp", minLevel: 9, maxLevel: 11 },
  { slug: "nightfall-giant", label: "Nightfall Giant", minLevel: 34, maxLevel: 37 },
  { slug: "a-black-wolf", label: "A Black Wolf", minLevel: 1, maxLevel: 1 },
  { slug: "a-dervish-cutthroat", label: "A Dervish Cutthroat", minLevel: 11, maxLevel: 13 },
  { slug: "orc-apprentice", label: "Orc Apprentice", minLevel: 2, maxLevel: 2 },
  { slug: "a-werewolf", label: "A Werewolf", minLevel: 22, maxLevel: 32 },
  { slug: "a-young-kodiak", label: "A Young Kodiak", minLevel: 10, maxLevel: 10 },
  { slug: "dragoon-zytl", label: "Dragoon Zytl", minLevel: 29, maxLevel: 29 },
  { slug: "a-kodiak", label: "A Kodiak", minLevel: 14, maxLevel: 15 },
  { slug: "a-puma", label: "A Puma", minLevel: 5, maxLevel: 10 },
  { slug: "a-bixie", label: "A Bixie", minLevel: 1, maxLevel: 5 },
  { slug: "a-plains-cat", label: "A Plains Cat", minLevel: 6, maxLevel: 6 },
  { slug: "jahsohn-aksot", label: "Jahsohn Aksot", minLevel: 29, maxLevel: 29 },
  { slug: "a-tortured-revenant", label: "A Tortured Revenant", minLevel: 49, maxLevel: 49 },
  { slug: "simon-aldicott", label: "Simon Aldicott", minLevel: 65, maxLevel: 65 },
  { slug: "a-griffin", label: "A Griffin", minLevel: 36, maxLevel: 36 },
  { slug: "orc-centurion-deathfist", label: "Orc Centurion (Deathfist)", minLevel: 3, maxLevel: 10 },
  { slug: "orc-pawn-deathfist", label: "Orc Pawn (Deathfist)", minLevel: 1, maxLevel: 2 },
  { slug: "orc-legionnaire-deathfist", label: "Orc Legionnaire (Deathfist)", minLevel: 15, maxLevel: 15 },
  { slug: "an-asp", label: "An Asp", minLevel: 10, maxLevel: 10 },
  { slug: "wallin-slyfoot", label: "Wallin Slyfoot", minLevel: 25, maxLevel: 25 },
  { slug: "orc-oracle-deathfist", label: "Orc Oracle (Deathfist)", minLevel: 9, maxLevel: 9 },
  { slug: "duggin-scumber", label: "Duggin Scumber", minLevel: 3, maxLevel: 3 },
  { slug: "a-large-rattlesnake", label: "A large rattlesnake", minLevel: 5, maxLevel: 5 },
  { slug: "a-rattlesnake", label: "A rattlesnake", minLevel: 3, maxLevel: 7 },
  { slug: "a-darkweed-snake", label: "A Darkweed Snake", minLevel: 8, maxLevel: 10 },
  { slug: "a-shadowed-man-west-commonlands", label: "A shadowed man (West Commonlands)", minLevel: 24, maxLevel: 26 },
  { slug: "modren-fishcatcher", label: "Modren Fishcatcher", minLevel: 5, maxLevel: 6 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:west-commonlands:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, "zone:west-commonlands", "located_in");
}

save();
console.log(`Migration 256 complete: ${added} mob node(s) added to zone:west-commonlands`);
