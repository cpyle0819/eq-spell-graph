/**
 * Migration 323: fixes migration 322, which wrongly excluded zone:crystal-
 * caverns's entire Froststone (Coldain settlement) roster wholesale instead
 * of adding each one under the role it actually fits -- see issue #41 and
 * decisions/friendly-town-npcs-inside-a-hostile-dungeon.md for the corrected
 * rule and the reasoning behind every call below.
 *
 * New role introduced here: "banker" (Kramble Gemshard, the wiki's own
 * "Banker in FrostStone" description) -- distinct from "vendor" because he
 * has no `sells` edges, same non-selling-service-NPC shape a future zone's
 * own banker would need.
 *
 * "A geonid"/mob roster from 322 is untouched; this only adds what 322 left
 * out:
 * - 8 named "Guard <name>" NPCs (all level 35) plus "Captain Dunstan
 *   Coldheart" (title implies the same guard role, despite no stated level
 *   -- guards are kept even with no level, unlike mobs).
 * - "Soren Coldheart" (level 28, class Warrior, "Citizens of Froststone"
 *   faction) -- same defender role as the named guards despite lacking the
 *   "Guard" name prefix.
 * - "Historian Baenek" (level 40) as a quest_giver -- his own wiki
 *   description ties him to the Worn Coldain Tome turn-in with a stated
 *   respawn timer, a real quest role, not just flavor.
 * - "Cassia Gemshard", "Derron Coldmist", "Flint Velweaver", "Fuller
 *   Velweaver", "Nadalia Coldmist" -- named Froststone residents with no
 *   level, description, or role signal beyond their name; added bare
 *   (no roles) rather than left out of the graph entirely.
 * - "Tacy MistHeart" (level 30) and "Vevina Velweaver" (level 28) -- same
 *   bare treatment, but their level is real wiki data and kept.
 * - 4 unnamed "Merchant" NPCs from the zone's own room-by-room map key (2
 *   sell Alcohol, 2 sell "Food, Water, Bandages, and other Goods") --
 *   labeled "?" since eqlwiki.com never gave them a name or page of their
 *   own, one node per NPC (not collapsed by goods type). `sells` edges
 *   point at the item nodes matching what the zone page states they carry
 *   (item:mead for Alcohol; item:ration/item:water-flask/item:bandages for
 *   the general-goods pair) -- the first `vendor` nodes in this graph whose
 *   `sells` edges target items instead of spells, extending the existing
 *   pattern rather than inventing a new one.
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:crystal-caverns";

const GUARDS: { label: string; minLevel?: number; maxLevel?: number }[] = [
  { label: "Guard Evercold", minLevel: 35, maxLevel: 35 },
  { label: "Guard Grabadin", minLevel: 35, maxLevel: 35 },
  { label: "Guard Hollander", minLevel: 35, maxLevel: 35 },
  { label: "Guard Justik", minLevel: 35, maxLevel: 35 },
  { label: "Guard Kevin", minLevel: 35, maxLevel: 35 },
  { label: "Guard Kristen", minLevel: 35, maxLevel: 35 },
  { label: "Guard Slacey", minLevel: 35, maxLevel: 35 },
  { label: "Guard Solistak", minLevel: 35, maxLevel: 35 },
  { label: "Captain Dunstan Coldheart" },
  { label: "Soren Coldheart", minLevel: 28, maxLevel: 28 },
];

const BARE_TOWNSFOLK: { label: string; minLevel?: number; maxLevel?: number }[] = [
  { label: "Cassia Gemshard" },
  { label: "Derron Coldmist" },
  { label: "Flint Velweaver" },
  { label: "Fuller Velweaver" },
  { label: "Nadalia Coldmist" },
  { label: "Tacy MistHeart", minLevel: 30, maxLevel: 30 },
  { label: "Vevina Velweaver", minLevel: 28, maxLevel: 28 },
];

function slugOf(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

for (const g of GUARDS) {
  const id = `npc:crystal-caverns:${slugOf(g.label)}`;
  addNode({
    id,
    label: g.label,
    type: "npc",
    roles: ["guard"],
    ...(g.minLevel != null ? { minLevel: g.minLevel, maxLevel: g.maxLevel } : {}),
  });
  addEdge(id, ZONE_ID, "located_in");
}

for (const t of BARE_TOWNSFOLK) {
  const id = `npc:crystal-caverns:${slugOf(t.label)}`;
  addNode({
    id,
    label: t.label,
    type: "npc",
    roles: [],
    ...(t.minLevel != null ? { minLevel: t.minLevel, maxLevel: t.maxLevel } : {}),
  });
  addEdge(id, ZONE_ID, "located_in");
}

const BANKER_ID = "npc:crystal-caverns:kramble-gemshard";
addNode({ id: BANKER_ID, label: "Kramble Gemshard", type: "npc", roles: ["banker"], minLevel: 30, maxLevel: 30 });
addEdge(BANKER_ID, ZONE_ID, "located_in");

const HISTORIAN_ID = "npc:crystal-caverns:historian-baenek";
addNode({ id: HISTORIAN_ID, label: "Historian Baenek", type: "npc", roles: ["quest_giver"], minLevel: 40, maxLevel: 40 });
addEdge(HISTORIAN_ID, ZONE_ID, "located_in");

const MERCHANTS: { id: string; sells: string[] }[] = [
  { id: "npc:crystal-caverns:merchant-alcohol-1", sells: ["item:mead"] },
  { id: "npc:crystal-caverns:merchant-alcohol-2", sells: ["item:mead"] },
  { id: "npc:crystal-caverns:merchant-supplies-1", sells: ["item:ration", "item:water-flask", "item:bandages"] },
  { id: "npc:crystal-caverns:merchant-supplies-2", sells: ["item:ration", "item:water-flask", "item:bandages"] },
];

for (const m of MERCHANTS) {
  addNode({ id: m.id, label: "?", type: "npc", roles: ["vendor"] });
  addEdge(m.id, ZONE_ID, "located_in");
  for (const itemId of m.sells) addEdge(m.id, itemId, "sells");
}

save();
console.log(`Migration 323 complete: added ${GUARDS.length} guards, ${BARE_TOWNSFOLK.length} bare townsfolk, 1 banker, 1 quest_giver, and ${MERCHANTS.length} vendors for zone:crystal-caverns`);
