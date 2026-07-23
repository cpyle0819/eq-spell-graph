/**
 * Migration 135: add mob nodes for zone:kithicor-forest, per the `mob`
 * node type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Sourced from eqlwiki.com's Kithicor Forest NPC table: generic trash,
 * the zone's own Shralok-clan orcs (map legend item #12, "the
 * Gan'Shraloks"), and its large undead-at-night roster (Decaying/Risen/
 * Rotting/Skeleton/Zombie/Undead-titled rows, consistent with Kithicor's
 * known day/night mob shift). Excluded: merchants and innkeeps, the
 * zone's peaceful wandering druids (Eenot/Kobb/Reggit), Ged Twigborn
 * ("makes gloves for a price" -- a crafter, not a creature), and Morin
 * Shadowbane/"Kithicor" (both explicitly Ranger guildmasters despite the
 * latter sharing the zone's name) with their companion Thumper.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:kithicor-forest";

const MOBS = [
  { slug: "bixie", label: "A Bixie", minLevel: 1, maxLevel: 5 },
  { slug: "bixie-drone", label: "A Bixie Drone", minLevel: 2, maxLevel: 2 },
  { slug: "black-bear", label: "A Black Bear", minLevel: 4, maxLevel: 5 },
  { slug: "darkweed-snake", label: "A Darkweed Snake", minLevel: 8, maxLevel: 10 },
  { slug: "fire-beetle", label: "A Fire Beetle", minLevel: 2, maxLevel: 2 },
  { slug: "giant-scarab", label: "A Giant Scarab", minLevel: 7, maxLevel: 11 },
  { slug: "giant-spider", label: "A Giant Spider", minLevel: 7, maxLevel: 9 },
  { slug: "goblin", label: "A Goblin", minLevel: 4, maxLevel: 28 },
  { slug: "goblin-worker", label: "A Goblin Worker", minLevel: 1, maxLevel: 1 },
  { slug: "grizzly-bear", label: "A Grizzly Bear", minLevel: 9, maxLevel: 11 },
  { slug: "large-rat", label: "A Large Rat", minLevel: 1, maxLevel: 1 },
  { slug: "lesser-mummy", label: "A Lesser Mummy", minLevel: 10, maxLevel: 12 },
  { slug: "moss-snake", label: "A Moss Snake", minLevel: 1, maxLevel: 1 },
  { slug: "werewolf", label: "A Werewolf", minLevel: 22, maxLevel: 32 },
  { slug: "young-kodiak", label: "A Young Kodiak", minLevel: 10, maxLevel: 10 },
  { slug: "zombie", label: "A Zombie", minLevel: 7, maxLevel: 10 },
  { slug: "bat", label: "A Bat", minLevel: 1, maxLevel: 1 },
  { slug: "cliff-spider", label: "A Cliff Spider", minLevel: 8, maxLevel: 8 },
  { slug: "giant-bat", label: "A Giant Bat", minLevel: 5, maxLevel: 7 },
  { slug: "klaknak-warrior", label: "A Klaknak Warrior", minLevel: 2, maxLevel: 2 },
  { slug: "mummy", label: "A Mummy", minLevel: 12, maxLevel: 12 },
  { slug: "skeleton", label: "A Skeleton", minLevel: 4, maxLevel: 18 },
  { slug: "tree-snake", label: "A Tree Snake", minLevel: 4, maxLevel: 6 },
  { slug: "orc-warrior", label: "An Orc Warrior", minLevel: 6, maxLevel: 18 },
  { slug: "orc-scout", label: "An Orc Scout", minLevel: 10, maxLevel: 18 },
  { slug: "barg-shralok", label: "Barg Shralok", minLevel: 13, maxLevel: 13 },
  { slug: "bashil-shralok", label: "Bashil Shralok", minLevel: 15, maxLevel: 15 },
  { slug: "bevlok-shralok", label: "Bevlok Shralok", minLevel: 12, maxLevel: 12 },
  { slug: "chabrel-shralok", label: "C`Habrel Shralok", minLevel: 16, maxLevel: 16 },
  { slug: "captain-shralok", label: "Captain Shralok", minLevel: 17, maxLevel: 17 },
  { slug: "chief-ganshralok", label: "Chief Gan`Shralok", minLevel: 19, maxLevel: 19 },
  { slug: "curkur-shralok", label: "Curkur Shralok", minLevel: 16, maxLevel: 16 },
  { slug: "grigga-shralok", label: "Grigga Shralok", minLevel: 12, maxLevel: 12 },
  { slug: "hargvex-shralok", label: "Hargvex Shralok", minLevel: 17, maxLevel: 17 },
  { slug: "kladnog-shralok", label: "Kladnog Shralok", minLevel: 11, maxLevel: 11 },
  { slug: "kornek-shralok", label: "Kornek Shralok", minLevel: 12, maxLevel: 12 },
  { slug: "recfek-shralok", label: "Recfek Shralok", minLevel: 12, maxLevel: 12 },
  { slug: "renkil-shralok", label: "Renkil Shralok", minLevel: 13, maxLevel: 13 },
  { slug: "talok-shralok", label: "Talok Shralok", minLevel: 14, maxLevel: 14 },
  { slug: "tulonk-shralok", label: "Tulonk Shralok", minLevel: 13, maxLevel: 13 },
  { slug: "vehgar-shralok", label: "Vehgar Shralok", minLevel: 13, maxLevel: 13 },
  { slug: "vopuk-shralok", label: "Vopuk Shralok", minLevel: 15, maxLevel: 22 },
  { slug: "wrek-shralok", label: "Wrek Shralok", minLevel: 12, maxLevel: 12 },
  { slug: "wrom-shralok", label: "Wrom Shralok", minLevel: 15, maxLevel: 15 },
  { slug: "unked-shralok", label: "Unked Shralok", minLevel: 15, maxLevel: 15 },
  { slug: "adjutant-dkan", label: "Adjutant D`kan", minLevel: 53, maxLevel: 53 },
  { slug: "advisor-czatl", label: "Advisor C`Zatl", minLevel: 55, maxLevel: 55 },
  { slug: "brigadier-gtav", label: "Brigadier G`tav", minLevel: 58, maxLevel: 58 },
  { slug: "coercer-qioul", label: "Coercer Q`ioul", minLevel: 58, maxLevel: 58 },
  { slug: "decaying-healer", label: "Decaying Healer", minLevel: 35, maxLevel: 35 },
  { slug: "decaying-swordsman", label: "Decaying Swordsman", minLevel: 35, maxLevel: 35 },
  { slug: "decaying-commander", label: "Decaying Commander", minLevel: 37, maxLevel: 37 },
  { slug: "decaying-footman", label: "Decaying Footman", minLevel: 33, maxLevel: 34 },
  { slug: "decaying-officer", label: "Decaying Officer", minLevel: 35, maxLevel: 35 },
  { slug: "enraged-dread-wolf", label: "Enraged Dread Wolf", minLevel: 40, maxLevel: 40 },
  { slug: "fallen-advisor", label: "Fallen Advisor", minLevel: 30, maxLevel: 30 },
  { slug: "general-vghera", label: "General V`ghera", minLevel: 65, maxLevel: 65 },
  { slug: "giz-xtin", label: "Giz X`Tin", minLevel: 50, maxLevel: 50 },
  { slug: "grim-oakfist", label: "Grim Oakfist", minLevel: 30, maxLevel: 30 },
  { slug: "ioltos-vghera", label: "Ioltos V`ghera", minLevel: 54, maxLevel: 54 },
  { slug: "risen-corporal", label: "Risen Corporal", minLevel: 35, maxLevel: 35 },
  { slug: "risen-squad-leader", label: "Risen Squad Leader", minLevel: 38, maxLevel: 38 },
  { slug: "rotting-knight", label: "Rotting Knight", minLevel: 36, maxLevel: 37 },
  { slug: "rotting-priest", label: "Rotting Priest", minLevel: 36, maxLevel: 36 },
  { slug: "skeleton-infantry", label: "Skeleton Infantry", minLevel: 32, maxLevel: 35 },
  { slug: "skeleton-officer", label: "Skeleton Officer", minLevel: 36, maxLevel: 36 },
  { slug: "skeleton-squad-leader", label: "Skeleton Squad Leader", minLevel: 33, maxLevel: 33 },
  { slug: "skeleton-trooper", label: "Skeleton Trooper", minLevel: 33, maxLevel: 33 },
  { slug: "skeleton-advisor", label: "Skeleton Advisor", minLevel: 37, maxLevel: 37 },
  { slug: "skeleton-private", label: "Skeleton Private", minLevel: 29, maxLevel: 29 },
  { slug: "tainted-swordsman", label: "Tainted Swordsman", minLevel: 29, maxLevel: 31 },
  { slug: "tasi-vghera", label: "Tasi V`ghera", minLevel: 56, maxLevel: 56 },
  { slug: "teirdal-reaver", label: "Teir`Dal Reaver", minLevel: 50, maxLevel: 50 },
  { slug: "undead-cleric", label: "Undead Cleric", minLevel: 33, maxLevel: 33 },
  { slug: "undead-mendicant", label: "Undead Mendicant", minLevel: 34, maxLevel: 34 },
  { slug: "war-priestess-tzan", label: "War Priestess T`zan", minLevel: 59, maxLevel: 59 },
  { slug: "zombie-advisor", label: "Zombie Advisor", minLevel: 35, maxLevel: 35 },
  { slug: "zombie-commander", label: "Zombie Commander", minLevel: 36, maxLevel: 36 },
  { slug: "zombie-infantry", label: "Zombie Infantry", minLevel: 31, maxLevel: 31 },
  { slug: "zombie-trooper", label: "Zombie Trooper", minLevel: 30, maxLevel: 30 },
  { slug: "zombie-guard", label: "Zombie Guard", minLevel: 36, maxLevel: 36 },
  { slug: "tortured-healer", label: "Tortured Healer", minLevel: 35, maxLevel: 35 },
  { slug: "laarthik-kshin", label: "Laarthik K`Shin", minLevel: 45, maxLevel: 45 },
  { slug: "queen-klaknak", label: "Queen Klaknak", minLevel: 9, maxLevel: 9 },
  { slug: "irin-lunis", label: "Irin Lunis", minLevel: 25, maxLevel: 25 },
  { slug: "leaf-falldim", label: "Leaf Falldim", minLevel: 35, maxLevel: 35 },
  { slug: "gandari", label: "Gandari", minLevel: 35, maxLevel: 35 },
  { slug: "brollus-hoost", label: "Brollus Hoost", minLevel: 20, maxLevel: 20 },
  { slug: "tallyn-starwatch", label: "Tallyn Starwatch", minLevel: 30, maxLevel: 30 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:kithicor-forest:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 135 complete: ${added} mob node(s) added for Kithicor Forest`);
