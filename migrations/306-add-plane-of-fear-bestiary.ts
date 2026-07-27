/**
 * Migration 306: add npc nodes (roles: ["mob"]) for zone:plane-of-fear,
 * per the unified `npc`/`roles` schema from migration 265
 * (decisions/npc-mob-unification-and-zone-groups.md) -- see issue #36.
 *
 * A raid/planar zone shaped differently from every overland/dungeon zone
 * sourced so far: its own page organizes content into "Common Mobs" and
 * "Raid Targets" tables rather than a numbered map legend, and its named
 * creatures are generic type names (`a boogeyman`, `amygdalan knight`)
 * rather than individually-named NPCs -- there is no placeholder/named
 * distinction here, unlike every dungeon zone before it. `Category:Plane
 * of Fear` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to
 * 27 `{{Namedmobpage}}` candidates: the zone's common-mob roster, the
 * three golem raid bosses (Fright/Dread/Terror), a dracoliche, and Cazic
 * Thule himself.
 *
 * One exclusion: "A thought bleeder" has no stated numeric level at all
 * -- just a relative con description ("Blue @ lvl50") -- and its own
 * `zone` field spans three unrelated zones (Erud's Crossing, Lavastorm
 * Mountains) with no per-zone breakout, so there's nothing concrete to
 * record here even setting the vague level aside.
 *
 * "Irak Altil" already existed as an `npc:` quest-giver node -- same
 * both-roles-legitimate shape as The Warrens' Aderius Rhenar/Koajin, so
 * this batch unions the `mob` role and level data onto it rather than
 * skipping.
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const MOBS: { label: string; minLevel: number; maxLevel: number }[] = [
  { label: "Cazic Thule (God)", minLevel: 70, maxLevel: 70 },
  { label: "A dracoliche", minLevel: 58, maxLevel: 58 },
  { label: "A tentacle tormentor", minLevel: 50, maxLevel: 50 },
  { label: "A fetid fiend", minLevel: 51, maxLevel: 51 },
  { label: "Wraith of a Shissir", minLevel: 55, maxLevel: 55 },
  { label: "A turmoil toad", minLevel: 51, maxLevel: 51 },
  { label: "Irak Altil", minLevel: 51, maxLevel: 51 },
  { label: "Amygdalan knight", minLevel: 49, maxLevel: 51 },
  { label: "A Boogeyman", minLevel: 49, maxLevel: 51 },
  { label: "Phoboplasm", minLevel: 48, maxLevel: 51 },
  { label: "A Glare Lord", minLevel: 51, maxLevel: 51 },
  { label: "A Samhain", minLevel: 51, maxLevel: 51 },
  { label: "Amygdalan Warrior", minLevel: 48, maxLevel: 51 },
  { label: "A Spinechiller Spider", minLevel: 48, maxLevel: 52 },
  { label: "A Nightmare", minLevel: 49, maxLevel: 51 },
  { label: "Dread", minLevel: 55, maxLevel: 55 },
  { label: "Fright", minLevel: 55, maxLevel: 55 },
  { label: "Terror", minLevel: 55, maxLevel: 55 },
  { label: "A Gorgon", minLevel: 49, maxLevel: 49 },
  { label: "A Shiverback", minLevel: 49, maxLevel: 51 },
  { label: "A Frightfinger", minLevel: 51, maxLevel: 51 },
  { label: "A Scareling", minLevel: 49, maxLevel: 51 },
  { label: "A worry wraith", minLevel: 50, maxLevel: 51 },
  { label: "A broken golem", minLevel: 20, maxLevel: 20 },
  { label: "An enraged golem", minLevel: 65, maxLevel: 65 },
  { label: "A phantasm", minLevel: 49, maxLevel: 51 },
];

let added = 0;
let merged = 0;
for (const mob of MOBS) {
  const id = `npc:plane-of-fear:${slug(mob.label)}`;
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
  addEdge(id, "zone:plane-of-fear", "located_in");
  added++;
}

save();
console.log(`Migration 306 complete: ${added} npc node(s) added, ${merged} existing npc(s) merged with a mob role, for zone:plane-of-fear`);
