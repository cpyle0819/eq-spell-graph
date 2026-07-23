/**
 * Migration 156: add mob nodes for zone:frontier-mountains, per the `mob`
 * node type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Same sourcing method as migrations 145-149, 152, 154: each entry is
 * sourced from that creature's own page under eqlwiki.com's Category:Frontier
 * Mountains carrying the {{Namedmobpage}} combat-stats template, using its
 * `level` field. Many of this zone's goblins/sarnaks are shared with Temple
 * of Droga and Mines of Nurga (dungeons that connect to this outdoor zone)
 * and state one level range across all of them -- used as-is since the wiki
 * gives no Frontier-Mountains-specific override. "A goblin seer" and
 * "Burynai treasure seeker" turned up in the category with no level stated
 * at all (literal "?" or an empty field) and are excluded, consistent with
 * the sourced-facts-only policy; "Burynai Leg Ripper" is an item page, not
 * a mob, and is also excluded.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:frontier-mountains";

const MOBS = [
  { slug: "berserk-brute", label: "A Berserk Brute", minLevel: 28, maxLevel: 28 },
  { slug: "burynai-cenobite", label: "A Burynai Cenobite", minLevel: 32, maxLevel: 36 },
  { slug: "burynai-digmaster", label: "A Burynai Digmaster", minLevel: 32, maxLevel: 32 },
  { slug: "burynai-miner", label: "A Burynai Miner", minLevel: 25, maxLevel: 25 },
  { slug: "burynai-rockshaper", label: "A Burynai Rockshaper", minLevel: 33, maxLevel: 36 },
  { slug: "diseased-brute", label: "A Diseased Brute", minLevel: 22, maxLevel: 22 },
  { slug: "goblin-blightcaller", label: "A Goblin Blightcaller", minLevel: 31, maxLevel: 33 },
  { slug: "goblin-bonecharmer", label: "A Goblin Bonecharmer", minLevel: 29, maxLevel: 31 },
  { slug: "goblin-boneseer", label: "A Goblin Boneseer", minLevel: 31, maxLevel: 33 },
  { slug: "goblin-boneslaver", label: "A Goblin Boneslaver", minLevel: 33, maxLevel: 35 },
  { slug: "goblin-coward", label: "A Goblin Coward", minLevel: 25, maxLevel: 25 },
  { slug: "goblin-dirtcaller", label: "A Goblin Dirtcaller", minLevel: 29, maxLevel: 31 },
  { slug: "goblin-dirttracer", label: "A Goblin Dirttracer", minLevel: 31, maxLevel: 33 },
  { slug: "goblin-dustscryer", label: "A Goblin Dustscryer", minLevel: 35, maxLevel: 35 },
  { slug: "goblin-firedrowser", label: "A Goblin Firedrowser", minLevel: 29, maxLevel: 31 },
  { slug: "goblin-herbcollector", label: "A Goblin Herbcollector", minLevel: 38, maxLevel: 38 },
  { slug: "goblin-legate", label: "A Goblin Legate", minLevel: 33, maxLevel: 35 },
  { slug: "goblin-plaguebringer", label: "A Goblin Plaguebringer", minLevel: 29, maxLevel: 31 },
  { slug: "goblin-prospector", label: "A Goblin Prospector", minLevel: 33, maxLevel: 33 },
  { slug: "goblin-raider", label: "A Goblin Raider", minLevel: 28, maxLevel: 28 },
  { slug: "goblin-rockchanter", label: "A Goblin Rockchanter", minLevel: 29, maxLevel: 31 },
  { slug: "goblin-slavedriver", label: "A Goblin Slavedriver", minLevel: 31, maxLevel: 33 },
  { slug: "goblin-slinker", label: "A Goblin Slinker", minLevel: 29, maxLevel: 35 },
  { slug: "goblin-stonechanter", label: "A Goblin Stonechanter", minLevel: 31, maxLevel: 33 },
  { slug: "goblin-taskmaster", label: "A Goblin Taskmaster", minLevel: 33, maxLevel: 35 },
  { slug: "goblin-trailblazer", label: "A Goblin Trailblazer", minLevel: 35, maxLevel: 35 },
  { slug: "gorging-brute", label: "A Gorging Brute", minLevel: 27, maxLevel: 30 },
  { slug: "human-skeleton", label: "A Human Skeleton", minLevel: 39, maxLevel: 40 },
  { slug: "mangy-brute", label: "A Mangy Brute", minLevel: 27, maxLevel: 28 },
  { slug: "mountain-giant-brae", label: "A Mountain Giant Brae", minLevel: 30, maxLevel: 34 },
  { slug: "mountain-giant-hillock", label: "A Mountain Giant Hillock", minLevel: 26, maxLevel: 30 },
  { slug: "mountain-giant-tump", label: "A Mountain Giant Tump", minLevel: 28, maxLevel: 31 },
  { slug: "rabid-brute", label: "A Rabid Brute", minLevel: 27, maxLevel: 27 },
  { slug: "ravenous-brute", label: "A Ravenous Brute", minLevel: 30, maxLevel: 35 },
  { slug: "sarnak-assassin", label: "A Sarnak Assassin", minLevel: 30, maxLevel: 30 },
  { slug: "sarnak-berzerker", label: "A Sarnak Berzerker", minLevel: 29, maxLevel: 33 },
  { slug: "sarnak-bloodbinder", label: "A Sarnak Bloodbinder", minLevel: 36, maxLevel: 36 },
  { slug: "sarnak-mystic", label: "A Sarnak Mystic", minLevel: 30, maxLevel: 30 },
  { slug: "sarnak-partisan", label: "A Sarnak Partisan", minLevel: 29, maxLevel: 32 },
  { slug: "sarnak-rebel", label: "A Sarnak Rebel", minLevel: 33, maxLevel: 33 },
  { slug: "sarnak-scavenger", label: "A Sarnak Scavenger", minLevel: 28, maxLevel: 29 },
  { slug: "sarnak-spy", label: "A Sarnak Spy", minLevel: 40, maxLevel: 40 },
  { slug: "sarnak-warlord", label: "A Sarnak Warlord", minLevel: 40, maxLevel: 42 },
  { slug: "bloodscale-the-vicious", label: "Bloodscale the Vicious", minLevel: 43, maxLevel: 43 },
  { slug: "blugtigin", label: "Blugtigin", minLevel: 32, maxLevel: 32 },
  { slug: "boogoog", label: "Boogoog", minLevel: 23, maxLevel: 23 },
  { slug: "burynai-grand-cenobite", label: "Burynai Grand Cenobite", minLevel: 35, maxLevel: 38 },
  { slug: "burynai-squad-leader", label: "Burynai Squad Leader", minLevel: 30, maxLevel: 30 },
  { slug: "clazxiss", label: "Clazxiss", minLevel: 39, maxLevel: 39 },
  { slug: "draketamer", label: "Draketamer", minLevel: 36, maxLevel: 37 },
  { slug: "dustback", label: "Dustback", minLevel: 23, maxLevel: 23 },
  { slug: "eldak-howlingbear", label: "Eldak Howlingbear", minLevel: 50, maxLevel: 50 },
  { slug: "finrin-talister", label: "Finrin Talister", minLevel: 61, maxLevel: 61 },
  { slug: "gemeye", label: "Gemeye", minLevel: 30, maxLevel: 30 },
  { slug: "gromlok", label: "Gromlok", minLevel: 32, maxLevel: 32 },
  { slug: "joojooga", label: "Joojooga", minLevel: 38, maxLevel: 38 },
  { slug: "krenlek", label: "Krenlek", minLevel: 34, maxLevel: 38 },
  { slug: "mentrax-mountainbone", label: "Mentrax Mountainbone", minLevel: 50, maxLevel: 50 },
  { slug: "miner-bordakn", label: "Miner Bordakn", minLevel: 40, maxLevel: 40 },
  { slug: "mountain-giant-prospector", label: "Mountain Giant Prospector", minLevel: 26, maxLevel: 26 },
  { slug: "overseer-miklek", label: "Overseer Miklek", minLevel: 40, maxLevel: 40 },
  { slug: "rockwolf", label: "Rockwolf", minLevel: 34, maxLevel: 34 },
  { slug: "slithinis", label: "Slithinis", minLevel: 28, maxLevel: 28 },
  { slug: "snaorf", label: "Snaorf", minLevel: 37, maxLevel: 37 },
  { slug: "varithyx", label: "Varithyx", minLevel: 28, maxLevel: 28 },
  { slug: "wandering-stonehealer", label: "Wandering Stonehealer", minLevel: 30, maxLevel: 30 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:frontier-mountains:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 156 complete: ${added} mob node(s) added for Frontier Mountains`);
