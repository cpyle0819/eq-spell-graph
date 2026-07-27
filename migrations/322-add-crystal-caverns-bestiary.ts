/**
 * Migration 322: add npc nodes (roles: ["mob"]) for zone:crystal-caverns,
 * per the unified `npc`/`roles` schema from migration 265
 * (decisions/npc-mob-unification-and-zone-groups.md) -- see issue #41
 * (data-quality audit flagged this zone as having zero NPCs at all).
 *
 * Sourced via the MediaWiki API technique
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md):
 * `Category:Crystal Caverns`'s 97 pages narrowed to 42 `{{Namedmobpage}}`-
 * tagged candidates.
 *
 * Crystal Caverns is a dungeon with an embedded friendly Coldain
 * settlement (Froststone) -- the zone's own page confirms this directly:
 * "The dwarves who live there, while not friendly, won't attack any
 * visitors there unless they've been hunted," and its guards ("about
 * level 34 or 35") can be used as allies against the zone's real hostiles.
 * 19 of the 42 candidates are this Froststone roster and were excluded as
 * a wholesale civic/vendor population, not individually stat-checked:
 * 8 "Guard <name>" NPCs, a banker ("Kramble Gemshard", desc "Banker in
 * FrostStone"), unlabeled townsfolk (Captain Dunstan Coldheart, Cassia
 * Gemshard, Derron Coldmist, Flint Velweaver, Fuller Velweaver, Nadalia
 * Coldmist, Tacy MistHeart, Vevina Velweaver -- matching the zone page's
 * "Merchant"/room-roster descriptions), and two named Coldain (Soren
 * Coldheart, Historian Baenek) who share the same "Citizens of Froststone"
 * faction tag as the rest. All 19 carry `factions: None` or Citizens of
 * Froststone, versus the real bestiary below, which the zone's own "Types
 * of Monsters"/"Notable NPCs" table names explicitly.
 *
 * "Ghost of Burdael" isn't on the zone's Notable NPCs table but is kept:
 * the zone page's own map key names it as a real kill target ("Ghost of
 * Burdael who drops Onyxbrand Quest: The Spirit of Garzicor").
 *
 * "A geonid (CC)" is the wiki's own disambiguation suffix (geonids also
 * exist in other zones, e.g. Great Divide) -- its actual in-game name is
 * just "A geonid", used as the node label, same call as Old Sebilis's
 * "Froglok repairer" (migration 321).
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:crystal-caverns";

const MOBS: { label: string; minLevel: number; maxLevel: number }[] = [
  { label: "A Stalag Terror", minLevel: 29, maxLevel: 37 },
  { label: "A Ry`Gorr miner", minLevel: 26, maxLevel: 29 },
  { label: "Queen Dracnia", minLevel: 40, maxLevel: 40 },
  { label: "A Ry`Gorr watchman", minLevel: 29, maxLevel: 31 },
  { label: "Foreman Smason", minLevel: 33, maxLevel: 33 },
  { label: "Foreman Rixact", minLevel: 33, maxLevel: 35 },
  { label: "A Crystal Crawler", minLevel: 32, maxLevel: 33 },
  { label: "A life leech", minLevel: 38, maxLevel: 42 },
  { label: "A dracnid retainer", minLevel: 33, maxLevel: 36 },
  { label: "A Ry`Gorr herbalist", minLevel: 30, maxLevel: 30 },
  { label: "A Ry`Gorr inspector", minLevel: 30, maxLevel: 30 },
  { label: "A crystal webmaster", minLevel: 33, maxLevel: 34 },
  { label: "A crystal spiderling", minLevel: 20, maxLevel: 25 },
  { label: "A crystal grinder", minLevel: 33, maxLevel: 33 },
  { label: "A velium crawler", minLevel: 30, maxLevel: 30 },
  { label: "A hollow crystal", minLevel: 38, maxLevel: 38 },
  { label: "A terror carver", minLevel: 38, maxLevel: 38 },
  { label: "A crystal lurker", minLevel: 37, maxLevel: 37 },
  { label: "A crystal purifier", minLevel: 32, maxLevel: 35 },
  { label: "A focus gem", minLevel: 37, maxLevel: 37 },
  { label: "A gem collector", minLevel: 35, maxLevel: 35 },
  { label: "A geonid", minLevel: 31, maxLevel: 37 },
  { label: "Ghost of Burdael", minLevel: 50, maxLevel: 50 },
];

let added = 0;
let merged = 0;
for (const mob of MOBS) {
  const id = `npc:crystal-caverns:${slug(mob.label)}`;

  if (hasNode(id)) {
    const node = graph.nodes.find((n: { id: string }) => n.id === id);
    const roles: string[] = node.roles || [];
    if (!roles.includes("mob")) roles.push("mob");
    node.roles = roles;
    node.minLevel = mob.minLevel;
    node.maxLevel = mob.maxLevel;
    merged++;
    continue;
  }
  addNode({ id, label: mob.label, type: "npc", roles: ["mob"], minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
  added++;
}

save();
console.log(`Migration 322 complete: ${added} npc node(s) added, ${merged} existing npc(s) merged with a mob role, for zone:crystal-caverns`);
