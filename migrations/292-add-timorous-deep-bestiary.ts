/**
 * Migration 292: add npc nodes (roles: ["mob"]) for zone:timorous-deep,
 * per the unified `npc`/`roles` schema from migration 265
 * (decisions/npc-mob-unification-and-zone-groups.md) -- see issue #36.
 *
 * `Category:Timorous Deep` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 39
 * `{{Namedmobpage}}` candidates: the ogre raider camp, spiroc aviary,
 * bandit/fallen-iksar camps, raptor islands, golra iceberg (Halara), elven
 * outpost, and several epic-quest NPCs (Faydedar the water dragon and its
 * quest-triggered spawn, Omat Vastsea/Jhassad Oceanson for the Cleric
 * epic, Alrik Farsight/Xiblin Fizzlebik for Druid/Ranger epics).
 *
 * Four exclusions:
 * - "An Iksar Master" is a `GM [[Monk]]` guildmaster (real name "Master
 *   Rinmark") -- excluded per CLAUDE.md, same call as South Qeynos/Qeynos
 *   Catacombs.
 * - "Bloated Belly", "Captains skiff", and "Maidens Voyage" are all boats
 *   (`"You can't consider that."` level, no `zone` field, own descriptions
 *   confirm they're ferries/shuttles) -- same non-creature call as prior
 *   batches' excluded "A Boat".
 *
 * "Faydedar" and "Faydedar (triggered)" are the same dragon's two spawn
 * variants (the triggered version only drops a quest item) -- both kept
 * as separate nodes, same both-versions-real precedent as other zones'
 * regular/triggered pairs. "A bandit (Timorous Deep)" carries a
 * disambiguating suffix in its own page title (a generic "A bandit" name
 * also exists elsewhere); label stored without the suffix, id keeps the
 * zone namespace anyway so no collision risk.
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const LABEL_OVERRIDES: Record<string, string> = {
  "A bandit (Timorous Deep)": "A bandit",
  "Faydedar (triggered)": "Faydedar (Triggered)",
};

const MOBS: { label: string; minLevel: number; maxLevel: number }[] = [
  { label: "Faydedar", minLevel: 55, maxLevel: 55 },
  { label: "The Great Oowomp", minLevel: 34, maxLevel: 34 },
  { label: "A Spiroc Proven", minLevel: 39, maxLevel: 44 },
  { label: "Ugrak da Raider", minLevel: 24, maxLevel: 24 },
  { label: "A Fallen Deckhand", minLevel: 21, maxLevel: 21 },
  { label: "Alrik Farsight", minLevel: 50, maxLevel: 50 },
  { label: "Omat Vastsea", minLevel: 60, maxLevel: 60 },
  { label: "Halara", minLevel: 40, maxLevel: 40 },
  { label: "Raider Watchman", minLevel: 19, maxLevel: 21 },
  { label: "A Raptor", minLevel: 41, maxLevel: 44 },
  { label: "A Vicious Raptor", minLevel: 43, maxLevel: 45 },
  { label: "Ogre Wise One", minLevel: 18, maxLevel: 19 },
  { label: "A bandit leader", minLevel: 18, maxLevel: 20 },
  { label: "A bandit (Timorous Deep)", minLevel: 14, maxLevel: 18 },
  { label: "Xiblin Fizzlebik", minLevel: 30, maxLevel: 30 },
  { label: "A Spiroc Lightfoot", minLevel: 35, maxLevel: 37 },
  { label: "A Spiroc Watcher", minLevel: 37, maxLevel: 39 },
  { label: "A dancing skeleton", minLevel: 27, maxLevel: 27 },
  { label: "An Ogre Raider", minLevel: 16, maxLevel: 19 },
  { label: "Dinus", minLevel: 46, maxLevel: 47 },
  { label: "Lheao", minLevel: 50, maxLevel: 50 },
  { label: "A Spiroc Lightbringer", minLevel: 50, maxLevel: 50 },
  { label: "A spiroc warrior", minLevel: 41, maxLevel: 42 },
  { label: "Fire Gator", minLevel: 26, maxLevel: 26 },
  { label: "A hulking golra", minLevel: 34, maxLevel: 35 },
  { label: "A golra", minLevel: 24, maxLevel: 28 },
  { label: "An elven scout", minLevel: 16, maxLevel: 16 },
  { label: "An elven war scout", minLevel: 21, maxLevel: 21 },
  { label: "An elven ranger", minLevel: 16, maxLevel: 17 },
  { label: "Drendico Metalbones", minLevel: 56, maxLevel: 56 },
  { label: "A fallen iksar", minLevel: 13, maxLevel: 16 },
  { label: "An elven overseer", minLevel: 24, maxLevel: 24 },
  { label: "Dolgin Codslayer", minLevel: 30, maxLevel: 30 },
  { label: "Faydedar (triggered)", minLevel: 55, maxLevel: 55 },
  { label: "Jhassad Oceanson", minLevel: 50, maxLevel: 50 },
];

let added = 0;
let merged = 0;
for (const mob of MOBS) {
  const id = `npc:timorous-deep:${slug(mob.label)}`;
  const label = LABEL_OVERRIDES[mob.label] ?? mob.label;

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
  addNode({ id, label, type: "npc", roles: ["mob"], minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, "zone:timorous-deep", "located_in");
  added++;
}

save();
console.log(`Migration 292 complete: ${added} npc node(s) added, ${merged} existing npc(s) merged with a mob role, for zone:timorous-deep`);
