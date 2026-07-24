/**
 * Migration 229: add mob nodes for zone:oggok, per the `mob` node type from
 * migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * `Category:Oggok` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 33
 * `{{Namedmobpage}}`-tagged candidates. Oggok is an evil ogre city, same
 * shape as Grobb/Felwithe/High Keep -- the zone's own text confirms its
 * "Bouncers of Oggok" guard force is farmed by players ("loot off the
 * Bouncers as some rubbish-inferior-races are there killing them all the
 * time"), so, per that precedent, every stat-blocked candidate was kept
 * regardless of role rather than defaulting to the friendly-city wholesale
 * exclusion (that call is specific to good-race cities like Freeport/North
 * Qeynos -- see migration 227's writeup).
 *
 * Kept: all 15 named "Bouncer <name>" guards (level ~29-37, real Fine Steel
 * Long Sword drops); "Ambassador K`Ryn" (explicit kill target of the
 * zone's own `Gatorsmash Maul` quest, always drops a Dragoon Dirk);
 * "Exterminator Glurg" (level 36, `Oggok Guards` faction -- same
 * guard-tier profile as the Bouncers); "Ungral Silverstomp" (the Oggok
 * banker -- a real combat stat block plus a first-hand account of being
 * attacked by him and his guard, same "stats over name" call as Runnyeye
 * Citadel's banker); "Fuga" and "Jargo" (level 61, 20000 HP, each casts
 * `Pox of Bertoxxulous` -- boss-tier guild leaders, same "GM guildmasters
 * are real kills in an evil city" call as Grobb/High Keep); "An Armadillo"
 * (level 2, generic wildlife, zone field names Oggok explicitly).
 *
 * Excluded: "Priest of Discord" (recurring cross-city PvP-flagging NPC,
 * same call as East Freeport); the zone's own named guild quest-givers
 * (Zulort, Soonog, Grevak, Kogna, Guntrik, Marda, Bonlarg, Lork, Horgus --
 * all identified by the zone page's own "Newbie Quests" walkthrough as
 * fetch-quest contacts, not fights) and "Emissary Glib" (a summonable
 * quest contact the same walkthrough has *asking* the player to fetch an
 * item, not a kill target, despite "Guards will assist" implying he's
 * technically attackable). "Goobert" was excluded as non-canonical: its
 * own description frames it as a leftover "Bard Ogre from the Qeynos
 * server (pre-order beta era)", not a normal designed spawn.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:oggok";

const MOBS = [
  { slug: "bouncer-bak", label: "Bouncer Bak", minLevel: 33, maxLevel: 37 },
  { slug: "bouncer-druk", label: "Bouncer Druk", minLevel: 33, maxLevel: 36 },
  { slug: "bouncer-gronk", label: "Bouncer Gronk", minLevel: 29, maxLevel: 29 },
  { slug: "bouncer-haraan", label: "Bouncer Haraan", minLevel: 35, maxLevel: 37 },
  { slug: "bouncer-krik", label: "Bouncer Krik", minLevel: 37, maxLevel: 37 },
  { slug: "bouncer-mrang", label: "Bouncer Mrang", minLevel: 33, maxLevel: 37 },
  { slug: "bouncer-praag", label: "Bouncer Praag", minLevel: 33, maxLevel: 37 },
  { slug: "bouncer-raan", label: "Bouncer Raan", minLevel: 33, maxLevel: 37 },
  { slug: "bouncer-scaar", label: "Bouncer Scaar", minLevel: 33, maxLevel: 37 },
  { slug: "bouncer-skon", label: "Bouncer Skon", minLevel: 33, maxLevel: 37 },
  { slug: "bouncer-skuk", label: "Bouncer Skuk", minLevel: 33, maxLevel: 37 },
  { slug: "bouncer-tazak", label: "Bouncer Tazak", minLevel: 33, maxLevel: 37 },
  { slug: "bouncer-thrang", label: "Bouncer Thrang", minLevel: 33, maxLevel: 37 },
  { slug: "bouncer-wrok", label: "Bouncer Wrok", minLevel: 33, maxLevel: 37 },
  { slug: "bouncer-xak", label: "Bouncer Xak", minLevel: 33, maxLevel: 37 },
  { slug: "ambassador-kryn", label: "Ambassador K`Ryn", minLevel: 24, maxLevel: 26 },
  { slug: "exterminator-glurg", label: "Exterminator Glurg", minLevel: 36, maxLevel: 36 },
  { slug: "ungral-silverstomp", label: "Ungral Silverstomp", minLevel: 40, maxLevel: 40 },
  { slug: "fuga", label: "Fuga", minLevel: 61, maxLevel: 61 },
  { slug: "jargo", label: "Jargo", minLevel: 61, maxLevel: 61 },
  { slug: "an-armadillo", label: "An Armadillo", minLevel: 2, maxLevel: 2 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:oggok:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 229 complete: ${added} mob node(s) added for Oggok`);
