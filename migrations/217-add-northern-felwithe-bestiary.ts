/**
 * Migration 217: add mob nodes for zone:northern-felwithe, per the `mob`
 * node type from migration 060 (decisions/mob-node-type.md) -- see issue
 * #36.
 *
 * `Category:Northern Felwithe` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 24
 * `{{Namedmobpage}}`-tagged candidates. Unlike North Qeynos's guard/
 * guildmaster roster (migration 139, excluded wholesale), every guard,
 * banker, and guildmaster candidate here carries a full stat block (real
 * AC/HP/damage) and several list actual weapon/armor drops (e.g. Guard
 * Meadom's Two Handed Sword/Ringmail Armor/Fine Steel Weapons) -- same
 * "stats over name" rule as the dungeon batches' "banker"/"guard" edge
 * cases, so all 22 are kept as real fights rather than excluded by role.
 * This lines up with the zone's own race-faction table (dark elf/iksar/
 * ogre/troll are KOS here), which is why even guildmasters and bankers
 * attack on sight for large swaths of players.
 *
 * Excluded: "Priest of Discord" (`zone = Various`; a recurring cross-city
 * PvP-flagging service NPC, not a kill target, same call as East Freeport's
 * batch) and "Soulbinder Elendalira" (every combat stat field is blank,
 * and Soulbinders are a purely functional corpse-recovery-bind service
 * across all of Norrath, not fought). "Guard Mystan (Northern Felwithe)"
 * is a near-duplicate wiki page of plain "Guard Mystan" (same location,
 * level 40-41 vs. 42) -- used the plain page, skipped the disambiguated
 * duplicate to avoid double-counting one guard.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:northern-felwithe";

const MOBS = [
  { slug: "yeolarn-bronzeleaf", label: "Yeolarn Bronzeleaf", minLevel: 61, maxLevel: 61 },
  { slug: "guard-meadom", label: "Guard Meadom", minLevel: 41, maxLevel: 41 },
  { slug: "guard-kiston", label: "Guard Kiston", minLevel: 40, maxLevel: 41 },
  { slug: "lieutenant-rosaed", label: "Lieutenant Rosaed", minLevel: 41, maxLevel: 41 },
  { slug: "general-jyleel", label: "General Jyleel", minLevel: 61, maxLevel: 61 },
  { slug: "tolkar-parlone", label: "Tolkar Parlone", minLevel: 35, maxLevel: 35 },
  { slug: "elia-the-pure", label: "Elia the Pure", minLevel: 55, maxLevel: 55 },
  { slug: "tynkale", label: "Tynkale", minLevel: 61, maxLevel: 61 },
  { slug: "arrias-arcanum", label: "Arrias Arcanum", minLevel: 40, maxLevel: 40 },
  { slug: "challice", label: "Challice", minLevel: 30, maxLevel: 30 },
  { slug: "guard-settine", label: "Guard Settine", minLevel: 38, maxLevel: 38 },
  { slug: "tacar-tissleplay", label: "Tacar Tissleplay", minLevel: 25, maxLevel: 25 },
  { slug: "banker-rylisan", label: "Banker Rylisan", minLevel: 40, maxLevel: 40 },
  { slug: "banker-tintal", label: "Banker Tintal", minLevel: 40, maxLevel: 40 },
  { slug: "guard-allmayn", label: "Guard Allmayn", minLevel: 39, maxLevel: 39 },
  { slug: "guard-crucorn", label: "Guard Crucorn", minLevel: 39, maxLevel: 39 },
  { slug: "guard-hutian", label: "Guard Hutian", minLevel: 40, maxLevel: 41 },
  { slug: "guard-jassong", label: "Guard Jassong", minLevel: 40, maxLevel: 41 },
  { slug: "guard-legver", label: "Guard Legver", minLevel: 42, maxLevel: 42 },
  { slug: "guard-lovayn", label: "Guard Lovayn", minLevel: 40, maxLevel: 41 },
  { slug: "guard-mystan", label: "Guard Mystan", minLevel: 42, maxLevel: 42 },
  { slug: "guard-trerun", label: "Guard Trerun", minLevel: 41, maxLevel: 41 },
  { slug: "guard-wisnyw", label: "Guard Wisnyw", minLevel: 39, maxLevel: 39 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:northern-felwithe:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 217 complete: ${added} mob node(s) added for Northern Felwithe`);
