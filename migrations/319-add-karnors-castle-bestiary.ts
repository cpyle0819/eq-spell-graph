/**
 * Migration 319: add npc nodes (roles: ["mob"]) for zone:karnor-s-castle,
 * per the unified `npc`/`roles` schema from migration 265
 * (decisions/npc-mob-unification-and-zone-groups.md) -- see issue #41
 * (data-quality audit flagged this zone as having zero NPCs at all).
 *
 * `Category:Karnor's Castle` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 36
 * `{{Namedmobpage}}` candidates -- every one confirmed by its own `zone`
 * field as belonging here (35 exclusively; "A human skeleton" is shared
 * with Trakanon's Teeth/City of Mist/Frontier Mountains but its own field
 * lists Karnor's Castle too, so it's kept). No hedged/missing levels, no
 * miscategorized candidates -- a clean batch, unlike some earlier zones.
 *
 * "Venril Sathir"/"Venril Sathir (Triggered)"/"Venril Sathirs remains"/
 * "Spirit of Venril Sathir" are four separate pages for the same epic
 * encounter's distinct phases (the boss, a scripted retrigger, its corpse,
 * and the spirit that rises from it) -- each carries its own stat block
 * and is kept as its own node, same "separately named, separately fought"
 * call as prior zones' placeholder/phase mobs.
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:karnor-s-castle";

const MOBS: { label: string; minLevel: number; maxLevel: number }[] = [
  { label: "A construct", minLevel: 49, maxLevel: 50 },
  { label: "A cursed hand", minLevel: 44, maxLevel: 48 },
  { label: "A Drolvarg Bodyguard", minLevel: 48, maxLevel: 52 },
  { label: "A Drolvarg Captain", minLevel: 48, maxLevel: 48 },
  { label: "A Drolvarg Guardian", minLevel: 43, maxLevel: 47 },
  { label: "A Drolvarg Pawbuster", minLevel: 51, maxLevel: 51 },
  { label: "A Drolvarg Sentry", minLevel: 40, maxLevel: 44 },
  { label: "A Drolvarg warlord", minLevel: 52, maxLevel: 52 },
  { label: "A human skeleton", minLevel: 39, maxLevel: 40 },
  { label: "Caller of Sathir", minLevel: 47, maxLevel: 48 },
  { label: "Construct of Sathir", minLevel: 52, maxLevel: 52 },
  { label: "Decayed Kylong Iksar", minLevel: 46, maxLevel: 48 },
  { label: "Decayed prisoner", minLevel: 41, maxLevel: 46 },
  { label: "Decayed Soldier", minLevel: 45, maxLevel: 50 },
  { label: "Hangnail", minLevel: 50, maxLevel: 50 },
  { label: "Knight of Sathir", minLevel: 51, maxLevel: 51 },
  { label: "Sentry of Sathir", minLevel: 46, maxLevel: 46 },
  { label: "Skeletal Berserker", minLevel: 48, maxLevel: 48 },
  { label: "Skeletal Captain", minLevel: 47, maxLevel: 47 },
  { label: "Skeletal Caretaker", minLevel: 49, maxLevel: 49 },
  { label: "Skeletal lookout", minLevel: 39, maxLevel: 41 },
  { label: "Skeletal Protector", minLevel: 43, maxLevel: 50 },
  { label: "Skeletal Scryer", minLevel: 46, maxLevel: 47 },
  { label: "Skeletal warlord", minLevel: 44, maxLevel: 44 },
  { label: "Skeletal watcher", minLevel: 47, maxLevel: 50 },
  { label: "Spectral caller", minLevel: 40, maxLevel: 44 },
  { label: "Spectral Curate", minLevel: 40, maxLevel: 45 },
  { label: "Spectral Knight", minLevel: 49, maxLevel: 51 },
  { label: "Spectral protector", minLevel: 44, maxLevel: 50 },
  { label: "Spectral Turnkey", minLevel: 47, maxLevel: 53 },
  { label: "Spirit of Venril Sathir", minLevel: 55, maxLevel: 55 },
  { label: "Undead Jailer", minLevel: 51, maxLevel: 51 },
  { label: "Venril Sathir", minLevel: 55, maxLevel: 55 },
  { label: "Venril Sathir (Triggered)", minLevel: 55, maxLevel: 55 },
  { label: "Venril Sathirs remains", minLevel: 50, maxLevel: 51 },
  { label: "Verix Kyloxs Remains", minLevel: 52, maxLevel: 52 },
];

let added = 0;
let merged = 0;
for (const mob of MOBS) {
  const id = `npc:karnor-s-castle:${slug(mob.label)}`;

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
console.log(`Migration 319 complete: ${added} npc node(s) added, ${merged} existing npc(s) merged with a mob role, for zone:karnor-s-castle`);
