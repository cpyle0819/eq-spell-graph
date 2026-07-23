/**
 * Migration 174: add mob nodes for zone:great-divide, per the `mob` node
 * type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Sourced via the MediaWiki API technique
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md):
 * Category:Great Divide's 142 pages narrowed to 74 {{Namedmobpage}}-tagged
 * candidates. Same Velious Coldain/Kromrif zone family as Eastern Wastes
 * (migration 165) -- named Coldain individuals (Guard Krag/Korik, Davin
 * Fatfist, Gerton Dumkin, Lapker Geynion, Royal Archer, Seneschal Aldikar,
 * Sentry Badain, the Wolfmasters, Korf Brokenhammer, Vores the Hunter,
 * Relik, Captain Stonefist) and "Guard"/"Tower Guard"/"Expedition Guard"
 * entries are included despite Coldain being generally friendly, same
 * worst-of-faction reasoning as that migration. All Kromrif- and
 * Tizmak-clan-tagged mobs, frost giants, drakkel wolves, shardwurms, and
 * cave kodiaks are explicit "Types of Monsters" entries on the zone's own
 * page.
 *
 * "A Frost Giant Scout" states three different per-zone ranges ("Iceclad
 * Ocean 30-34, Great Divide: 34-36, Eastern Wastes 35-36") -- only the
 * Great Divide figure (34-36) is used here, not the other zones' numbers.
 * "Royal Archer" states "36 or 50" (two known spawn levels, not a
 * continuous range) -- stored as minLevel 36/maxLevel 50 to bound both.
 *
 * Excluded: "Bloody gnome captive" and "Gnomish captive" are quest props
 * (the former's own description: "Telling him 'map' will make him
 * despawn"), not real combat targets despite carrying a level. "Windscribe
 * Thaloria" is a 2025 holiday-event NPC with no combat evidence, same
 * exclusion basis as migration 165's "Isolde Winterveil"/"Dreamspeaker
 * Lyssiara".
 *
 * No accompanying `maps` migration: eqlwiki.com's Great Divide page embeds
 * `File:Map great divide.jpg`, but the MediaWiki API's own `imageinfo`
 * reports it `missing` -- a broken upload, same blocker as Chardok
 * (migration 157). Issue #36's Great Divide checkbox stays unchecked until
 * eqlwiki.com's own upload is fixed or another source turns up.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:great-divide";

const MOBS = [
  { slug: "gnomish-deserter", label: "Gnomish Deserter", minLevel: 60, maxLevel: 60 },
  { slug: "bekerak-coldbones", label: "Bekerak Coldbones", minLevel: 35, maxLevel: 35 },
  { slug: "a-frost-giant-scout", label: "A Frost Giant Scout", minLevel: 34, maxLevel: 36 },
  { slug: "a-frost-giant-elite", label: "A Frost Giant Elite", minLevel: 34, maxLevel: 45 },
  { slug: "shardtooth", label: "Shardtooth", minLevel: 42, maxLevel: 42 },
  { slug: "a-tizmak-champion", label: "A Tizmak Champion", minLevel: 29, maxLevel: 29 },
  { slug: "a-furious-tizmak-warrior", label: "A Furious Tizmak Warrior", minLevel: 31, maxLevel: 31 },
  { slug: "a-tizmak-warrior", label: "A Tizmak Warrior", minLevel: 25, maxLevel: 25 },
  { slug: "korf-brokenhammer", label: "Korf Brokenhammer", minLevel: 55, maxLevel: 55 },
  { slug: "fergul-frostsky", label: "Fergul Frostsky", minLevel: 40, maxLevel: 40 },
  { slug: "gralk-dwarfkiller", label: "Gralk Dwarfkiller", minLevel: 40, maxLevel: 40 },
  { slug: "vores-the-hunter", label: "Vores the Hunter", minLevel: 60, maxLevel: 60 },
  { slug: "a-frost-giant-berserker", label: "A Frost Giant Berserker", minLevel: 37, maxLevel: 40 },
  { slug: "bloodmaw", label: "Bloodmaw", minLevel: 1, maxLevel: 1 },
  { slug: "a-tizmak-shaman", label: "A Tizmak Shaman", minLevel: 27, maxLevel: 27 },
  { slug: "a-tizmak-spiritcaller", label: "A Tizmak Spiritcaller", minLevel: 31, maxLevel: 31 },
  { slug: "a-tizmak-augur", label: "A Tizmak Augur", minLevel: 28, maxLevel: 28 },
  { slug: "a-drakkel-dire-wolf", label: "A Drakkel Dire Wolf", minLevel: 31, maxLevel: 34 },
  { slug: "narandi-the-wretched", label: "Narandi the Wretched", minLevel: 65, maxLevel: 65 },
  { slug: "shardwurm-broodmother", label: "Shardwurm Broodmother", minLevel: 50, maxLevel: 50 },
  { slug: "a-crystaline-shardwurm", label: "A Crystaline Shardwurm", minLevel: 40, maxLevel: 40 },
  { slug: "an-ancient-shardwurm", label: "An Ancient Shardwurm", minLevel: 36, maxLevel: 40 },
  { slug: "an-elder-shardwurm", label: "An Elder Shardwurm", minLevel: 33, maxLevel: 36 },
  { slug: "a-young-shardwurm", label: "A Young Shardwurm", minLevel: 28, maxLevel: 33 },
  { slug: "relik", label: "Relik", minLevel: 40, maxLevel: 40 },
  { slug: "drakkel-blood-wolf", label: "Drakkel Blood Wolf", minLevel: 37, maxLevel: 37 },
  { slug: "a-drakkel-blood-wolf", label: "A Drakkel Blood Wolf", minLevel: 31, maxLevel: 36 },
  { slug: "captain-stonefist", label: "Captain Stonefist", minLevel: 65, maxLevel: 65 },
  { slug: "blizzent", label: "Blizzent", minLevel: 45, maxLevel: 45 },
  { slug: "a-coldain-wolfmaster", label: "A Coldain Wolfmaster", minLevel: 30, maxLevel: 35 },
  { slug: "gorul-longshanks", label: "Gorul Longshanks", minLevel: 47, maxLevel: 47 },
  { slug: "a-coldain-miner", label: "A Coldain Miner", minLevel: 35, maxLevel: 35 },
  { slug: "an-expedition-guard", label: "An Expedition Guard", minLevel: 50, maxLevel: 50 },
  { slug: "fomgrut-borkel", label: "Fomgrut Borkel", minLevel: 50, maxLevel: 50 },
  { slug: "a-velium-miner", label: "A Velium Miner", minLevel: 35, maxLevel: 35 },
  { slug: "yaka-razorhoof", label: "Yaka Razorhoof", minLevel: 36, maxLevel: 36 },
  { slug: "shardwurm-matriarch", label: "Shardwurm Matriarch", minLevel: 45, maxLevel: 45 },
  { slug: "vluudeen", label: "Vluudeen", minLevel: 49, maxLevel: 49 },
  { slug: "murdrick-tardok", label: "Murdrick Tardok", minLevel: 50, maxLevel: 50 },
  { slug: "icetooth", label: "Icetooth", minLevel: 38, maxLevel: 38 },
  { slug: "kardakor", label: "Kardakor", minLevel: 60, maxLevel: 60 },
  { slug: "a-ferocious-cave-kodiak", label: "A Ferocious Cave Kodiak", minLevel: 34, maxLevel: 36 },
  { slug: "a-savage-cave-kodiak", label: "A Savage Cave Kodiak", minLevel: 32, maxLevel: 34 },
  { slug: "a-feral-cave-kodiak", label: "A Feral Cave Kodiak", minLevel: 30, maxLevel: 32 },
  { slug: "taskmaster-abyott", label: "Taskmaster Abyott", minLevel: 62, maxLevel: 62 },
  { slug: "guard-krag", label: "Guard Krag", minLevel: 55, maxLevel: 55 },
  { slug: "guard-korik", label: "Guard Korik", minLevel: 55, maxLevel: 55 },
  { slug: "davin-fatfist", label: "Davin Fatfist", minLevel: 50, maxLevel: 50 },
  { slug: "herga-ratgur", label: "Herga Ratgur", minLevel: 50, maxLevel: 50 },
  { slug: "gerton-dumkin", label: "Gerton Dumkin", minLevel: 50, maxLevel: 50 },
  { slug: "lapker-geynion", label: "Lapker Geynion", minLevel: 50, maxLevel: 50 },
  { slug: "laima-ratgur", label: "Laima Ratgur", minLevel: 50, maxLevel: 50 },
  { slug: "a-guardian-shardwurm", label: "A Guardian Shardwurm", minLevel: 38, maxLevel: 38 },
  { slug: "a-coldain-tracking-wolf", label: "A Coldain Tracking Wolf", minLevel: 29, maxLevel: 33 },
  { slug: "a-tower-guard", label: "A Tower Guard", minLevel: 55, maxLevel: 55 },
  { slug: "an-angry-shardwurm", label: "An Angry Shardwurm", minLevel: 40, maxLevel: 40 },
  { slug: "cleric-of-zek", label: "Cleric of Zek", minLevel: 45, maxLevel: 45 },
  { slug: "high-priest-of-zek", label: "High Priest of Zek", minLevel: 58, maxLevel: 58 },
  { slug: "kromrif-captain", label: "Kromrif Captain", minLevel: 52, maxLevel: 52 },
  { slug: "kromrif-general", label: "Kromrif General", minLevel: 56, maxLevel: 56 },
  { slug: "kromrif-recruit", label: "Kromrif Recruit", minLevel: 48, maxLevel: 48 },
  { slug: "kromrif-spearman", label: "Kromrif Spearman", minLevel: 52, maxLevel: 52 },
  { slug: "kromrif-veteran", label: "Kromrif Veteran", minLevel: 58, maxLevel: 58 },
  { slug: "kromrif-warlord", label: "Kromrif Warlord", minLevel: 60, maxLevel: 60 },
  { slug: "kromrif-warrior", label: "Kromrif Warrior", minLevel: 53, maxLevel: 53 },
  { slug: "priest-of-zek", label: "Priest of Zek", minLevel: 53, maxLevel: 53 },
  { slug: "royal-archer", label: "Royal Archer", minLevel: 36, maxLevel: 50 },
  { slug: "seneschal-aldikar", label: "Seneschal Aldikar", minLevel: 65, maxLevel: 65 },
  { slug: "sentry-badain", label: "Sentry Badain", minLevel: 55, maxLevel: 55 },
  { slug: "wolfmaster-berglind", label: "Wolfmaster Berglind", minLevel: 38, maxLevel: 38 },
  { slug: "wolfmaster-gunnar", label: "Wolfmaster Gunnar", minLevel: 37, maxLevel: 37 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:great-divide:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 174 complete: ${added} mob node(s) added for Great Divide`);
