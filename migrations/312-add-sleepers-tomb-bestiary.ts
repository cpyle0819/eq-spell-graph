/**
 * Migration 312: add npc nodes (roles: ["mob"]) for
 * zone:sleeper-s-tomb, per the unified `npc`/`roles` schema from
 * migration 265 (decisions/npc-mob-unification-and-zone-groups.md) -- see
 * issue #36.
 *
 * `Category:Sleeper's Tomb` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to
 * 12 `{{Namedmobpage}}` candidates: the four First Brood Warders guarding
 * Kerafyrm, three named golem guard-bosses (Master of the Guard, The
 * Progenitor, The Final Arbiter), trash golems/casters, and Kerafyrm
 * himself (level 99 -- "the most powerful known being in Norrath" per his
 * own page, consistent with the zone's own lore of a First Brood-imposed
 * imprisonment). No exclusions -- every candidate carries a stated
 * numeric level and confirms this zone in its own `zone` field.
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const MOBS: { label: string; minLevel: number; maxLevel: number }[] = [
  { label: "Tukaarak the Warder", minLevel: 70, maxLevel: 70 },
  { label: "Nanzata the Warder", minLevel: 70, maxLevel: 70 },
  { label: "Hraashna the Warder", minLevel: 70, maxLevel: 70 },
  { label: "Ventani the Warder", minLevel: 70, maxLevel: 70 },
  { label: "Kerafyrm", minLevel: 99, maxLevel: 99 },
  { label: "Master of the Guard", minLevel: 69, maxLevel: 69 },
  { label: "The Progenitor", minLevel: 70, maxLevel: 70 },
  { label: "The Final Arbiter", minLevel: 70, maxLevel: 70 },
  { label: "A newly created sentry", minLevel: 45, maxLevel: 45 },
  { label: "A tireless servitor", minLevel: 61, maxLevel: 62 },
  { label: "An aged caretaker", minLevel: 66, maxLevel: 66 },
  { label: "An ancient sentry", minLevel: 66, maxLevel: 66 },
];

let added = 0;
let merged = 0;
for (const mob of MOBS) {
  const id = `npc:sleeper-s-tomb:${slug(mob.label)}`;
  const label = mob.label.replace(/ \([^)]*\)$/, "");

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
  addEdge(id, "zone:sleeper-s-tomb", "located_in");
  added++;
}

save();
console.log(`Migration 312 complete: ${added} npc node(s) added, ${merged} existing npc(s) merged with a mob role, for zone:sleeper-s-tomb`);
