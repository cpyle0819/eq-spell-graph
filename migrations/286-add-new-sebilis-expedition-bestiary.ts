/**
 * Migration 286: add npc nodes (roles: ["mob"]) for
 * zone:new-sebilis-expedition, per the unified `npc`/`roles` schema from
 * migration 265 (decisions/npc-mob-unification-and-zone-groups.md) -- see
 * issue #36.
 *
 * `Category:New Sebilis Expedition` (28 pages) narrowed via the MediaWiki
 * API method (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md)
 * to 8 `{{Namedmobpage}}` candidates -- every one of them a `GM <class>`
 * guildmaster except "Trooper Kraer", a patrolling Warrior with no
 * guildmaster tell. Per CLAUDE.md's guildmaster exclusion (also applied to
 * South Qeynos/Qeynos Catacombs), all 7 guildmasters were excluded --
 * they're the zone's own map legend content instead, same call as Temple
 * of Solusek Ro. "Hierophant Oxylin" and "Hierophant Oxyln" are duplicate
 * pages for the same Shaman guildmaster (near-identical stat blocks,
 * different image filenames) -- moot here since both are excluded anyway.
 * Trooper Kraer has no AC/HP/loot listed, but a stated level (50) and an
 * explicit patrol description ("from the far end of the entrance room
 * through several halls and rooms further in") -- kept as the zone's one
 * real bestiary entry, consistent with the zone's own prose flagging how
 * few guards it actually has.
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const MOBS: { label: string; minLevel: number; maxLevel: number }[] = [
  { label: "Trooper Kraer", minLevel: 50, maxLevel: 50 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `npc:new-sebilis-expedition:${slug(mob.label)}`;
  if (hasNode(id)) continue;
  addNode({ id, label: mob.label, type: "npc", roles: ["mob"], minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, "zone:new-sebilis-expedition", "located_in");
  added++;
}

save();
console.log(`Migration 286 complete: ${added} npc node(s) added for zone:new-sebilis-expedition`);
