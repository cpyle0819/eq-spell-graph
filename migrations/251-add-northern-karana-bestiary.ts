/**
 * Migration 251: add mob nodes for zone:northern-karana, per the `mob`
 * node type from migration 060 (decisions/mob-node-type.md) -- see issue
 * #36.
 *
 * `Category:Northern Karana` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 56
 * unique `{{Namedmobpage}}` candidates: the zone's wildlife (bears, wolves,
 * beetles, griffins/griffawns/griffennes and their "rabid" Karana-Plague-
 * event variants), the Qeynos guard-tower duo pairs (Bartley/Fredrick/
 * Stanard/Oystin/Oystind/Westyn), the Fangbreakers werewolf-hunting gang
 * (Nul Aleswiller, Bunu Stoutheart, Fixxin Followig), the gypsy camp's own
 * NPCs (Ezmirella, Shiel Glimmerspindle), and several epic-quest fights
 * (Druid: Xanuusus, Withered treant; Zahal the Vile/Regis the Reverent's
 * kill-chain).
 *
 * Three exclusions: "Briana Treewhisper" (`class` = `GM [[Druid]]`, a
 * guildmaster excluded per CLAUDE.md -- see migration 245's Qeynos
 * Catacombs batch for the same call), "A ghoul" (`zone` field names only
 * Befallen/Estate of Unrest/Neriak Third Gate/West Commonlands, no mention
 * of Northern Karana at all -- miscategorized, same call as Lower Guk's
 * excluded "A froglok tsu shaman"), and "Quartermaster Nellian" (level
 * "??", no stated numeric level, a Holiday 2025 event NPC). "Merry
 * Snowgleam" (same Holiday 2025 event) was also excluded: its own `zone`
 * field names only East Commonlands despite the Northern Karana category
 * tag, same miscategorization call as "A ghoul".
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const MOBS = [
  { slug: "a-skeleton", label: "A skeleton", minLevel: 4, maxLevel: 18 },
  { slug: "capt-linarius", label: "Capt Linarius", minLevel: 45, maxLevel: 45 },
  { slug: "cordelia-minster", label: "Cordelia Minster", minLevel: 18, maxLevel: 22 },
  { slug: "watchman-dexlin", label: "Watchman Dexlin", minLevel: 35, maxLevel: 35 },
  { slug: "a-zombie", label: "A Zombie", minLevel: 7, maxLevel: 10 },
  { slug: "zahal-the-vile", label: "Zahal the Vile", minLevel: 30, maxLevel: 30 },
  { slug: "lieutenant-midraim", label: "Lieutenant Midraim", minLevel: 14, maxLevel: 14 },
  { slug: "a-raider", label: "A Raider", minLevel: 9, maxLevel: 12 },
  { slug: "guard-shilster", label: "Guard Shilster", minLevel: 17, maxLevel: 17 },
  { slug: "brother-nallin", label: "Brother Nallin", minLevel: 31, maxLevel: 31 },
  { slug: "guard-bartley", label: "Guard Bartley", minLevel: 30, maxLevel: 30 },
  { slug: "guard-fredrick", label: "Guard Fredrick", minLevel: 30, maxLevel: 30 },
  { slug: "guard-stanard", label: "Guard Stanard", minLevel: 30, maxLevel: 30 },
  { slug: "xanuusus", label: "Xanuusus", minLevel: 50, maxLevel: 50 },
  { slug: "regis-the-reverent", label: "Regis the Reverent", minLevel: 27, maxLevel: 27 },
  { slug: "callowwing", label: "Callowwing", minLevel: 18, maxLevel: 18 },
  { slug: "swiftclaw", label: "Swiftclaw", minLevel: 12, maxLevel: 12 },
  { slug: "a-willowisp", label: "A Willowisp", minLevel: 9, maxLevel: 11 },
  { slug: "nul-aleswiller", label: "Nul Aleswiller", minLevel: 35, maxLevel: 35 },
  { slug: "guard-oystin", label: "Guard Oystin", minLevel: 30, maxLevel: 30 },
  { slug: "a-griffon", label: "A Griffon", minLevel: 35, maxLevel: 35 },
  { slug: "grimfeather", label: "GrimFeather", minLevel: 37, maxLevel: 37 },
  { slug: "ashenpaw", label: "Ashenpaw", minLevel: 11, maxLevel: 11 },
  { slug: "a-silvermist-wolf", label: "A Silvermist Wolf", minLevel: 8, maxLevel: 10 },
  { slug: "a-grizzly-bear", label: "A Grizzly Bear", minLevel: 9, maxLevel: 11 },
  { slug: "grimtooth", label: "Grimtooth", minLevel: 22, maxLevel: 22 },
  { slug: "korvik-the-cursed", label: "Korvik the Cursed", minLevel: 15, maxLevel: 16 },
  { slug: "a-griffawn", label: "A Griffawn", minLevel: 13, maxLevel: 17 },
  { slug: "a-lioness", label: "A Lioness", minLevel: 7, maxLevel: 7 },
  { slug: "a-highland-lion", label: "A Highland Lion", minLevel: 14, maxLevel: 14 },
  { slug: "bristletoe", label: "Bristletoe", minLevel: 13, maxLevel: 13 },
  { slug: "a-griffenne", label: "A griffenne", minLevel: 25, maxLevel: 27 },
  { slug: "fixxin-followig", label: "Fixxin Followig", minLevel: 30, maxLevel: 30 },
  { slug: "withered-treant", label: "Withered treant", minLevel: 60, maxLevel: 60 },
  { slug: "ezmirella", label: "Ezmirella", minLevel: 30, maxLevel: 30 },
  { slug: "a-pincer-beetle", label: "A pincer beetle", minLevel: 10, maxLevel: 12 },
  { slug: "a-borer-beetle", label: "A borer beetle", minLevel: 14, maxLevel: 16 },
  { slug: "a-scythe-beetle", label: "A scythe beetle", minLevel: 17, maxLevel: 19 },
  { slug: "a-rabid-grizzly", label: "A Rabid Grizzly", minLevel: 7, maxLevel: 10 },
  { slug: "bunu-stoutheart", label: "Bunu Stoutheart", minLevel: 31, maxLevel: 31 },
  { slug: "the-silver-griffon", label: "The Silver Griffon", minLevel: 40, maxLevel: 40 },
  { slug: "a-tiny-skeleton", label: "A tiny skeleton", minLevel: 15, maxLevel: 15 },
  { slug: "a-farmer", label: "A farmer", minLevel: 4, maxLevel: 4 },
  { slug: "a-rabid-griffawn", label: "A rabid griffawn", minLevel: 13, maxLevel: 17 },
  { slug: "a-rabid-griffenne", label: "A rabid griffenne", minLevel: 23, maxLevel: 27 },
  { slug: "a-rabid-griffon", label: "A rabid griffon", minLevel: 35, maxLevel: 35 },
  { slug: "guard-oystind", label: "Guard Oystind", minLevel: 30, maxLevel: 30 },
  { slug: "guard-westyn", label: "Guard Westyn", minLevel: 30, maxLevel: 30 },
  { slug: "the-swarm-mother", label: "The Swarm Mother", minLevel: 35, maxLevel: 36 },
  { slug: "timbur-the-tiny", label: "Timbur the Tiny", minLevel: 20, maxLevel: 20 },
  { slug: "talionn-forsyth", label: "Talionn Forsyth", minLevel: 35, maxLevel: 35 },
  { slug: "shiel-glimmerspindle", label: "Shiel Glimmerspindle", minLevel: 40, maxLevel: 40 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:northern-karana:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, "zone:northern-karana", "located_in");
}

save();
console.log(`Migration 251 complete: ${added} mob node(s) added to zone:northern-karana`);
