/**
 * Migration 157: add mob nodes for zone:chardok, per the `mob` node type
 * from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Sourced using the technique in
 * decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md: queried
 * eqlwiki.com's raw MediaWiki API (api.php) for every page under
 * Category:Chardok's `templates` list, filtered to the 151 pages carrying
 * {{Namedmobpage}}, then pulled each of those 151 pages' raw wikitext in
 * bulk (prop=revisions) and regex-extracted each `level` field directly --
 * mechanical and lossless, unlike WebFetch's per-page summarization. One
 * page ("Vault Master Shu`zo") states no level at all (its own infobox
 * lists `class = Banker`, i.e. a vendor, not a combat mob) and is excluded.
 * "A Dizok Sergeant" and "A Di`zok Sergeant" are duplicate pages for the
 * same NPC (identical level 53) and are folded into the one entry, same as
 * migration 149's "Errolisi bloodthorn"/"Erollisi Bloodthorn" precedent.
 *
 * No `maps` migration accompanies this one: eqlwiki.com's Chardok page
 * embeds two map images (`chardok_top.png`, `chardok_b_draelon.gif`), but
 * both are broken uploads -- the MediaWiki API's own `imageinfo` reports
 * `"missing": ""` for both filenames on both the Post-Revamp and
 * Pre-Revamp zone pages. There is currently no usable map image to source
 * for this zone; issue #36's Chardok checkbox stays unchecked until
 * eqlwiki.com's own upload is fixed (or another source is found).
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:chardok";

const MOBS = [
  { slug: "a-alchemist-s-acolyte", label: "A Alchemist`s Acolyte", minLevel: 56, maxLevel: 56 },
  { slug: "a-block-foreman", label: "A Block Foreman", minLevel: 55, maxLevel: 55 },
  { slug: "a-chardoki-golem", label: "A Chardoki Golem", minLevel: 44, maxLevel: 44 },
  { slug: "a-chokidai-bloodhound", label: "A Chokidai Bloodhound", minLevel: 53, maxLevel: 55 },
  { slug: "a-chokidai-bonesnapper", label: "A Chokidai Bonesnapper", minLevel: 53, maxLevel: 55 },
  { slug: "a-chokidai-fleshripper", label: "A Chokidai Fleshripper", minLevel: 49, maxLevel: 49 },
  { slug: "a-chokidai-growler", label: "A Chokidai Growler", minLevel: 44, maxLevel: 44 },
  { slug: "a-chokidai-herbsniffer", label: "A Chokidai Herbsniffer", minLevel: 54, maxLevel: 54 },
  { slug: "a-chokidai-lacerator", label: "A Chokidai Lacerator", minLevel: 47, maxLevel: 51 },
  { slug: "a-chokidai-lasher", label: "A Chokidai Lasher", minLevel: 55, maxLevel: 55 },
  { slug: "a-chokidai-mangler", label: "A Chokidai Mangler", minLevel: 49, maxLevel: 51 },
  { slug: "a-chokidai-mauler", label: "A Chokidai Mauler", minLevel: 55, maxLevel: 55 },
  { slug: "a-chokidai-pitfighter", label: "A Chokidai Pitfighter", minLevel: 55, maxLevel: 55 },
  { slug: "a-chokidai-rootdigger", label: "A Chokidai Rootdigger", minLevel: 55, maxLevel: 55 },
  { slug: "a-chokidai-sniffer", label: "A Chokidai Sniffer", minLevel: 45, maxLevel: 45 },
  { slug: "a-chokidai-sunderfiend", label: "A Chokidai Sunderfiend", minLevel: 56, maxLevel: 56 },
  { slug: "a-chokidai-tearer", label: "A Chokidai Tearer", minLevel: 49, maxLevel: 49 },
  { slug: "a-chokidai-terror", label: "A Chokidai Terror", minLevel: 55, maxLevel: 55 },
  { slug: "a-chokidai-wardog", label: "A Chokidai Wardog", minLevel: 50, maxLevel: 50 },
  { slug: "a-chokidai-whelp", label: "A Chokidai Whelp", minLevel: 42, maxLevel: 42 },
  { slug: "a-di-zok-aruspex", label: "A Di`zok Aruspex", minLevel: 46, maxLevel: 47 },
  { slug: "a-di-zok-captain", label: "A Di`Zok Captain", minLevel: 55, maxLevel: 55 },
  { slug: "a-di-zok-channeler", label: "A Di`zok Channeler", minLevel: 44, maxLevel: 45 },
  { slug: "a-di-zok-conscript", label: "A Di`Zok Conscript", minLevel: 49, maxLevel: 49 },
  { slug: "a-di-zok-cryptmaster", label: "A Di`Zok Cryptmaster", minLevel: 53, maxLevel: 53 },
  { slug: "a-di-zok-dragoon", label: "A Di`Zok Dragoon", minLevel: 53, maxLevel: 53 },
  { slug: "a-di-zok-evoker", label: "A Di`zok Evoker", minLevel: 49, maxLevel: 49 },
  { slug: "a-di-zok-gravebinder", label: "A Di`zok Gravebinder", minLevel: 49, maxLevel: 51 },
  { slug: "a-di-zok-guardian", label: "A Di`zok Guardian", minLevel: 55, maxLevel: 55 },
  { slug: "a-di-zok-herbalist", label: "A Di`zok Herbalist", minLevel: 55, maxLevel: 55 },
  { slug: "a-di-zok-invoker", label: "A Di`zok Invoker", minLevel: 44, maxLevel: 44 },
  { slug: "a-di-zok-jannisary", label: "A Di`zok Jannisary", minLevel: 55, maxLevel: 55 },
  { slug: "a-di-zok-legionnaire", label: "A Di`Zok Legionnaire", minLevel: 49, maxLevel: 49 },
  { slug: "a-di-zok-librarian", label: "A Di`zok Librarian", minLevel: 55, maxLevel: 55 },
  { slug: "a-di-zok-myrmidon", label: "A Di`zok Myrmidon", minLevel: 53, maxLevel: 53 },
  { slug: "a-di-zok-observer", label: "A Di`zok Observer", minLevel: 55, maxLevel: 55 },
  { slug: "a-di-zok-partisan", label: "A Di`Zok Partisan", minLevel: 49, maxLevel: 49 },
  { slug: "a-di-zok-recruit", label: "A Di`zok Recruit", minLevel: 45, maxLevel: 45 },
  { slug: "a-di-zok-revealer", label: "A Di`zok Revealer", minLevel: 48, maxLevel: 48 },
  { slug: "a-di-zok-seer", label: "A Di`zok Seer", minLevel: 53, maxLevel: 53 },
  { slug: "a-di-zok-sergeant", label: "A Di`zok Sergeant", minLevel: 53, maxLevel: 53 },
  { slug: "a-di-zok-underling", label: "A Di`zok Underling", minLevel: 43, maxLevel: 43 },
  { slug: "a-droopy-slave", label: "A Droopy Slave", minLevel: 1, maxLevel: 1 },
  { slug: "a-greater-guardian", label: "A Greater Guardian", minLevel: 55, maxLevel: 55 },
  { slug: "a-lesser-guardian", label: "A Lesser Guardian", minLevel: 53, maxLevel: 53 },
  { slug: "a-miserable-slave", label: "A Miserable Slave", minLevel: 1, maxLevel: 1 },
  { slug: "a-reanimated-berserker", label: "A Reanimated Berserker", minLevel: 55, maxLevel: 55 },
  { slug: "a-reanimated-champion", label: "A Reanimated Champion", minLevel: 50, maxLevel: 52 },
  { slug: "a-reanimated-conscript", label: "A Reanimated Conscript", minLevel: 48, maxLevel: 53 },
  { slug: "a-reanimated-dragoon", label: "A Reanimated Dragoon", minLevel: 49, maxLevel: 53 },
  { slug: "a-reanimated-partisan", label: "A Reanimated Partisan", minLevel: 50, maxLevel: 55 },
  { slug: "a-sad-ratman-slave", label: "A Sad Ratman Slave", minLevel: 6, maxLevel: 8 },
  { slug: "a-sad-slave", label: "A Sad Slave", minLevel: 6, maxLevel: 8 },
  { slug: "a-sarnak-accoucheur", label: "A Sarnak Accoucheur", minLevel: 51, maxLevel: 51 },
  { slug: "a-sarnak-aruspex", label: "A Sarnak Aruspex", minLevel: 45, maxLevel: 48 },
  { slug: "a-sarnak-caedosaur", label: "A Sarnak Caedosaur", minLevel: 46, maxLevel: 49 },
  { slug: "a-sarnak-dog-handler", label: "A Sarnak Dog Handler", minLevel: 55, maxLevel: 55 },
  { slug: "a-sarnak-foreman", label: "A Sarnak Foreman", minLevel: 56, maxLevel: 56 },
  { slug: "a-sarnak-herb-collector", label: "A Sarnak Herb Collector", minLevel: 55, maxLevel: 55 },
  { slug: "a-sarnak-janissary", label: "A Sarnak Janissary", minLevel: 49, maxLevel: 49 },
  { slug: "a-sarnak-manager", label: "A Sarnak Manager", minLevel: 55, maxLevel: 55 },
  { slug: "a-sarnak-myrmidon", label: "A Sarnak Myrmidon", minLevel: 52, maxLevel: 52 },
  { slug: "a-sarnak-overseer", label: "A Sarnak Overseer", minLevel: 55, maxLevel: 55 },
  { slug: "a-sarnak-physician", label: "A Sarnak Physician", minLevel: 55, maxLevel: 55 },
  { slug: "a-sarnak-pitboss", label: "A Sarnak Pitboss", minLevel: 55, maxLevel: 55 },
  { slug: "a-sarnak-slavedriver", label: "A Sarnak Slavedriver", minLevel: 51, maxLevel: 51 },
  { slug: "a-sarnak-slavemaster", label: "A Sarnak Slavemaster", minLevel: 51, maxLevel: 52 },
  { slug: "a-sarnak-underboss", label: "A Sarnak Underboss", minLevel: 55, maxLevel: 55 },
  { slug: "a-sarnak-vindicator", label: "A Sarnak Vindicator", minLevel: 51, maxLevel: 51 },
  { slug: "a-sarnak-whipcracker", label: "A Sarnak Whipcracker", minLevel: 55, maxLevel: 55 },
  { slug: "a-scarred-overseer", label: "A Scarred Overseer", minLevel: 55, maxLevel: 55 },
  { slug: "a-security-advisor", label: "A Security Advisor", minLevel: 58, maxLevel: 58 },
  { slug: "a-shai-din-bonecollector", label: "A Shai`din Bonecollector", minLevel: 47, maxLevel: 47 },
  { slug: "a-shai-din-conscript", label: "A Shai`din Conscript", minLevel: 46, maxLevel: 48 },
  { slug: "a-shai-din-follower", label: "A Shai`din Follower", minLevel: 45, maxLevel: 45 },
  { slug: "a-shai-din-hemlock", label: "A Shai`din Hemlock", minLevel: 45, maxLevel: 46 },
  { slug: "a-shai-din-jannisary", label: "A Shai`din Jannisary", minLevel: 55, maxLevel: 55 },
  { slug: "a-shai-din-nightfear", label: "A Shai`din Nightfear", minLevel: 45, maxLevel: 48 },
  { slug: "a-shai-din-partisan", label: "A Shai`din Partisan", minLevel: 41, maxLevel: 45 },
  { slug: "a-shai-din-soldier", label: "A Shai`din Soldier", minLevel: 47, maxLevel: 49 },
  { slug: "a-shai-din-soultrapper", label: "A Shai`din Soultrapper", minLevel: 44, maxLevel: 44 },
  { slug: "a-skinny-slave", label: "A Skinny Slave", minLevel: 6, maxLevel: 8 },
  { slug: "a-slaveblock-guard", label: "A Slaveblock Guard", minLevel: 51, maxLevel: 51 },
  { slug: "a-smelly-slave", label: "A Smelly Slave", minLevel: 6, maxLevel: 8 },
  { slug: "a-sullen-slave", label: "A Sullen Slave", minLevel: 1, maxLevel: 1 },
  { slug: "a-tortured-iksar-miner", label: "A Tortured Iksar Miner", minLevel: 56, maxLevel: 56 },
  { slug: "a-treasury-guard", label: "A Treasury Guard", minLevel: 51, maxLevel: 51 },
  { slug: "a-veteran-drillmaster", label: "A Veteran Drillmaster", minLevel: 55, maxLevel: 55 },
  { slug: "a-veteran-overseer", label: "A Veteran Overseer", minLevel: 56, maxLevel: 56 },
  { slug: "a-veteran-underboss", label: "A Veteran Underboss", minLevel: 56, maxLevel: 56 },
  { slug: "a-wizened-herb-collector", label: "A Wizened Herb Collector", minLevel: 56, maxLevel: 56 },
  { slug: "an-ancient-guardian", label: "An Ancient Guardian", minLevel: 56, maxLevel: 56 },
  { slug: "an-apprentice-herbalist", label: "An Apprentice Herbalist", minLevel: 53, maxLevel: 53 },
  { slug: "an-apprentice-kennelmaster", label: "An Apprentice Kennelmaster", minLevel: 56, maxLevel: 56 },
  { slug: "an-enraged-slave", label: "An Enraged Slave", minLevel: 1, maxLevel: 1 },
  { slug: "an-enslaved-iksar-miner", label: "An Enslaved Iksar Miner", minLevel: 55, maxLevel: 55 },
  { slug: "an-iksar-betrayer", label: "An Iksar Betrayer", minLevel: 52, maxLevel: 53 },
  { slug: "an-iksar-collaborator", label: "An Iksar Collaborator", minLevel: 52, maxLevel: 55 },
  { slug: "an-iksar-trustee", label: "An Iksar Trustee", minLevel: 56, maxLevel: 56 },
  { slug: "an-imperial-construct", label: "An Imperial Construct", minLevel: 50, maxLevel: 51 },
  { slug: "an-imperial-courier", label: "An Imperial Courier", minLevel: 46, maxLevel: 47 },
  { slug: "an-imperial-gravemaster", label: "An Imperial Gravemaster", minLevel: 53, maxLevel: 53 },
  { slug: "an-imperial-inspector", label: "An Imperial Inspector", minLevel: 57, maxLevel: 57 },
  { slug: "an-imperial-interrogator", label: "An Imperial Interrogator", minLevel: 56, maxLevel: 56 },
  { slug: "an-imperial-officer", label: "An Imperial Officer", minLevel: 57, maxLevel: 57 },
  { slug: "an-imperial-wardog", label: "An Imperial Wardog", minLevel: 54, maxLevel: 55 },
  { slug: "an-insane-slave", label: "An Insane Slave", minLevel: 1, maxLevel: 1 },
  { slug: "an-off-duty-accountant", label: "An Off Duty Accountant", minLevel: 56, maxLevel: 56 },
  { slug: "an-off-duty-overseer", label: "An Off Duty Overseer", minLevel: 55, maxLevel: 55 },
  { slug: "an-off-duty-pitboss", label: "An Off Duty Pitboss", minLevel: 55, maxLevel: 55 },
  { slug: "an-off-duty-researcher", label: "An Off Duty Researcher", minLevel: 55, maxLevel: 55 },
  { slug: "an-off-duty-scribe", label: "An Off Duty Scribe", minLevel: 53, maxLevel: 54 },
  { slug: "an-off-duty-slavemaster", label: "An Off Duty Slavemaster", minLevel: 52, maxLevel: 53 },
  { slug: "an-unhappy-slave", label: "An Unhappy Slave", minLevel: 6, maxLevel: 8 },
  { slug: "ancient-guardian", label: "Ancient Guardian", minLevel: 57, maxLevel: 57 },
  { slug: "arch-inspector-nibi-zi", label: "Arch Inspector Nibi`zi", minLevel: 56, maxLevel: 56 },
  { slug: "battle-master-ska-tu", label: "Battle Master Ska`tu", minLevel: 54, maxLevel: 54 },
  { slug: "captain-di-ouz", label: "Captain Di`ouz", minLevel: 53, maxLevel: 53 },
  { slug: "deathfang", label: "Deathfang", minLevel: 56, maxLevel: 56 },
  { slug: "di-zok-elite-guard", label: "Di`zok Elite Guard", minLevel: 57, maxLevel: 57 },
  { slug: "di-zok-royal-guard", label: "Di`zok Royal Guard", minLevel: 52, maxLevel: 52 },
  { slug: "drill-master-dih-roul", label: "Drill Master Dih`roul", minLevel: 54, maxLevel: 54 },
  { slug: "foreman-ku-lul", label: "Foreman Ku`lul", minLevel: 57, maxLevel: 57 },
  { slug: "foreman-mirt-akk", label: "Foreman Mirt`akk", minLevel: 56, maxLevel: 56 },
  { slug: "grand-advisor-zum-uul", label: "Grand Advisor Zum`uul", minLevel: 58, maxLevel: 58 },
  { slug: "grand-herbalist-mak-ha", label: "Grand Herbalist Mak`ha", minLevel: 56, maxLevel: 56 },
  { slug: "grand-lorekeeper-kino-shai-din", label: "Grand Lorekeeper Kino Shai`din", minLevel: 58, maxLevel: 58 },
  { slug: "grave-master-zo-lun", label: "Grave Master Zo`lun", minLevel: 54, maxLevel: 54 },
  { slug: "herald-telcha", label: "Herald Telcha", minLevel: 4, maxLevel: 4 },
  { slug: "interrogator-gi-mok", label: "Interrogator Gi`mok", minLevel: 55, maxLevel: 55 },
  { slug: "judicator-of-di-zok", label: "Judicator of Di`zok", minLevel: 53, maxLevel: 53 },
  { slug: "kennel-master-al-ele", label: "Kennel Master Al`ele", minLevel: 56, maxLevel: 56 },
  { slug: "korocust", label: "Korocust", minLevel: 56, maxLevel: 56 },
  { slug: "korucust-s-courier", label: "Korucust`s Courier", minLevel: 56, maxLevel: 56 },
  { slug: "loremaster-piza-tak", label: "Loremaster Piza`tak", minLevel: 58, maxLevel: 58 },
  { slug: "niblek", label: "Niblek", minLevel: 10, maxLevel: 10 },
  { slug: "observer-aq-touz", label: "Observer Aq`touz", minLevel: 52, maxLevel: 52 },
  { slug: "overking-bathezid", label: "Overking Bathezid", minLevel: 65, maxLevel: 65 },
  { slug: "overseer-dal-guur", label: "Overseer Dal`guur", minLevel: 57, maxLevel: 57 },
  { slug: "prince-selrach-di-zok", label: "Prince Selrach Di'zok", minLevel: 61, maxLevel: 61 },
  { slug: "queen-velazul-di-zok", label: "Queen Velazul Di`zok", minLevel: 62, maxLevel: 62 },
  { slug: "royal-sarnak-herbalist", label: "Royal Sarnak Herbalist", minLevel: 51, maxLevel: 52 },
  { slug: "sarnak-collective-auditor", label: "Sarnak Collective Auditor", minLevel: 56, maxLevel: 56 },
  { slug: "sorcerer-of-di-zok", label: "Sorcerer of Di`zok", minLevel: 52, maxLevel: 52 },
  { slug: "the-bridge-keeper", label: "The Bridge Keeper", minLevel: 57, maxLevel: 57 },
  { slug: "underboss-myli-ki", label: "Underboss Myli`ki", minLevel: 57, maxLevel: 57 },
  { slug: "watch-captain-hir-roul", label: "Watch Captain Hir`roul", minLevel: 54, maxLevel: 54 },
  { slug: "watch-sergeant-riz-oul", label: "Watch Sergeant Riz`oul", minLevel: 52, maxLevel: 52 },
  { slug: "wraith-of-a-di-zok-hero", label: "Wraith of a Di`zok Hero", minLevel: 53, maxLevel: 54 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:chardok:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 157 complete: ${added} mob node(s) added for Chardok`);
