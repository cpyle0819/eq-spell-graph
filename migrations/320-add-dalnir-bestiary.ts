/**
 * Migration 320: add npc nodes (roles: ["mob"]) for zone:dalnir,
 * per the unified `npc`/`roles` schema from migration 265
 * (decisions/npc-mob-unification-and-zone-groups.md) -- see issue #41
 * (data-quality audit flagged this zone as having zero NPCs at all; its 5
 * existing `located_in` edges are all quest nodes, not NPCs).
 *
 * No `Category:Dalnir` exists on eqlwiki -- the zone's own page (titled
 * "Dalnir", covering "The Crypt of Dalnir") redirects there, and its
 * bestiary pages instead sit under `Category:Crypt of Dalnir`. Queried that
 * category via the MediaWiki API method (decisions/eqlwiki-mediawiki-api-
 * for-messy-bestiary-categories.md) and filtered for `{{Namedmobpage}}` --
 * 29 candidates, all confirmed by their own `zone` field as Crypt of
 * Dalnir (or, for "Gyrating goo", Crypt of Dalnir alongside City of Mist).
 *
 * "Gyrating goo" is shared with City of Mist and reports one un-split
 * level range (35-47) covering both zones, unlike the split
 * "X-Y / A-B (Zone1/Zone2)" format the cross-zone-reuse precedent expects --
 * kept the full range as stated since there's no per-zone breakdown to
 * select from, and 35-47 still fits the zone's own "25-35+" top table entry.
 *
 * "A tormented tradesman" and "Haggle Baron Dalnir" are a two-stage quest
 * encounter (killing/triggering the former via the Mirror of Self-loathing
 * quest item spawns the latter) -- both carry their own full stat blocks
 * and are kept as separate nodes, same "separately named, separately
 * fought" call as prior zones' placeholder/phase mobs.
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:dalnir";

const MOBS: { label: string; minLevel: number; maxLevel: number }[] = [
  { label: "A coerced channeler", minLevel: 28, maxLevel: 32 },
  { label: "A coerced crusader", minLevel: 30, maxLevel: 32 },
  { label: "A coerced dwarf", minLevel: 26, maxLevel: 29 },
  { label: "A coerced Erudite", minLevel: 26, maxLevel: 28 },
  { label: "A coerced gnome", minLevel: 26, maxLevel: 29 },
  { label: "A Coerced Goblin", minLevel: 29, maxLevel: 29 },
  { label: "A Coerced Iksar", minLevel: 26, maxLevel: 26 },
  { label: "A coerced penkeeper", minLevel: 27, maxLevel: 28 },
  { label: "A coerced revenant", minLevel: 29, maxLevel: 30 },
  { label: "A coerced smith", minLevel: 25, maxLevel: 27 },
  { label: "A coerced Teir`Dal", minLevel: 25, maxLevel: 29 },
  { label: "A Kly Acolyte", minLevel: 25, maxLevel: 31 },
  { label: "A kly believer", minLevel: 29, maxLevel: 33 },
  { label: "A kly cohort", minLevel: 29, maxLevel: 33 },
  { label: "A kly evoker", minLevel: 25, maxLevel: 29 },
  { label: "A kly follower", minLevel: 25, maxLevel: 29 },
  { label: "A Kly Imprecator", minLevel: 30, maxLevel: 33 },
  { label: "A Kly Invoker", minLevel: 29, maxLevel: 32 },
  { label: "A ravenous nibbler", minLevel: 25, maxLevel: 29 },
  { label: "A Spectral Crusader", minLevel: 24, maxLevel: 24 },
  { label: "A tormented tradesman", minLevel: 26, maxLevel: 26 },
  { label: "An Iksar prisoner", minLevel: 28, maxLevel: 28 },
  { label: "An Undead Blacksmith", minLevel: 25, maxLevel: 27 },
  { label: "Gyrating goo", minLevel: 35, maxLevel: 47 },
  { label: "Haggle Baron Dalnir", minLevel: 40, maxLevel: 40 },
  { label: "Lumpy goo", minLevel: 28, maxLevel: 29 },
  { label: "Smoldering goo", minLevel: 25, maxLevel: 29 },
  { label: "The Kly", minLevel: 42, maxLevel: 42 },
  { label: "The Kly Overseer", minLevel: 35, maxLevel: 36 },
];

let added = 0;
let merged = 0;
for (const mob of MOBS) {
  const id = `npc:dalnir:${slug(mob.label)}`;

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
console.log(`Migration 320 complete: ${added} npc node(s) added, ${merged} existing npc(s) merged with a mob role, for zone:dalnir`);
