/**
 * Migration 308: add npc nodes (roles: ["mob"]) for zone:plane-of-growth,
 * per the unified `npc`/`roles` schema from migration 265
 * (decisions/npc-mob-unification-and-zone-groups.md) -- see issue #36.
 *
 * Tunare's home plane -- an open outdoor raid zone shaped like Plane of
 * Fear (generic-named creature types rather than individually-named
 * NPCs, no numbered map legend). `Category:Plane of Growth` narrowed via
 * the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to
 * 49 `{{Namedmobpage}}` candidates: the thifling/entoling/treant common
 * roster, several named mini-bosses (Ancient Totem, Prince Thirneg,
 * Guardian of Takish), and Tunare herself. No exclusions -- every
 * candidate carries a stated numeric level, no guildmasters, no
 * miscategorized zone fields ("A Phase Puma" co-lists Wakening Lands
 * explicitly, same both-zones-real pattern as prior shared-mob cases).
 *
 * "Guardian of Takish", "Tunarean Earthmelder", "Ancient Totem", and "a
 * mosscovered treant" already existed as `npc:` quest-giver nodes -- same
 * both-roles-legitimate shape as The Warrens' Aderius Rhenar/Koajin, so
 * this batch unions the `mob` role and level data onto them rather than
 * skipping.
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const MOBS: { label: string; minLevel: number; maxLevel: number }[] = [
  { label: "Guardian of Takish", minLevel: 70, maxLevel: 70 },
  { label: "Tunarean Earthmelder", minLevel: 60, maxLevel: 60 },
  { label: "Ancient Totem", minLevel: 60, maxLevel: 60 },
  { label: "Prince Thirneg", minLevel: 65, maxLevel: 65 },
  { label: "Galiel Spirithoof", minLevel: 55, maxLevel: 55 },
  { label: "Undogo Digolo", minLevel: 65, maxLevel: 65 },
  { label: "A Feral Amalgam", minLevel: 54, maxLevel: 54 },
  { label: "Ail the Elder", minLevel: 60, maxLevel: 60 },
  { label: "Fayl Everstrong", minLevel: 60, maxLevel: 60 },
  { label: "Grahl Strongback", minLevel: 57, maxLevel: 57 },
  { label: "Rumbleroot", minLevel: 60, maxLevel: 60 },
  { label: "Sarik the Fang", minLevel: 55, maxLevel: 55 },
  { label: "Ordro", minLevel: 56, maxLevel: 56 },
  { label: "Treah Greenroot", minLevel: 60, maxLevel: 60 },
  { label: "A Sylvan Protector", minLevel: 53, maxLevel: 53 },
  { label: "A Rolling Plains Steed", minLevel: 48, maxLevel: 52 },
  { label: "A Gleaming Sphere of Light", minLevel: 65, maxLevel: 65 },
  { label: "A Contemplative Thifling", minLevel: 52, maxLevel: 52 },
  { label: "A Thifling Sprite", minLevel: 52, maxLevel: 52 },
  { label: "A Gale Wolf", minLevel: 51, maxLevel: 51 },
  { label: "A Phase Puma", minLevel: 60, maxLevel: 60 },
  { label: "A Serene Forest Spirit", minLevel: 60, maxLevel: 60 },
  { label: "A spirit stalker", minLevel: 55, maxLevel: 55 },
  { label: "A sanguine kodiak", minLevel: 52, maxLevel: 53 },
  { label: "A mosscovered treant", minLevel: 56, maxLevel: 56 },
  { label: "A spirit flux wolf", minLevel: 53, maxLevel: 53 },
  { label: "Tunare (God)", minLevel: 70, maxLevel: 70 },
  { label: "A glade stalker", minLevel: 51, maxLevel: 51 },
  { label: "A tranquil treant", minLevel: 56, maxLevel: 56 },
  { label: "An entoling harvester", minLevel: 56, maxLevel: 56 },
  { label: "A protector of growth", minLevel: 53, maxLevel: 53 },
  { label: "A thifling lord", minLevel: 59, maxLevel: 59 },
  { label: "A whorl of natural energy", minLevel: 50, maxLevel: 50 },
  { label: "An abstruse phantasm", minLevel: 65, maxLevel: 65 },
  { label: "An entoling culler", minLevel: 56, maxLevel: 56 },
  { label: "A bloodthorned spectre", minLevel: 57, maxLevel: 57 },
  { label: "A guardian power", minLevel: 61, maxLevel: 61 },
  { label: "A mumbling totem man", minLevel: 53, maxLevel: 53 },
  { label: "A thifling focuser", minLevel: 65, maxLevel: 65 },
  { label: "A thifling orator", minLevel: 56, maxLevel: 56 },
  { label: "A vigilant convoker", minLevel: 55, maxLevel: 55 },
  { label: "A warm light", minLevel: 1, maxLevel: 1 },
  { label: "An entoling essence channeler", minLevel: 60, maxLevel: 60 },
  { label: "An entoling essence conduit", minLevel: 60, maxLevel: 60 },
  { label: "Entrancing water nymph", minLevel: 60, maxLevel: 60 },
  { label: "Farstride Unicorn", minLevel: 55, maxLevel: 55 },
  { label: "Guardian of Tunare", minLevel: 60, maxLevel: 60 },
  { label: "Keeper of the glades", minLevel: 65, maxLevel: 65 },
  { label: "Ordros assistant", minLevel: 52, maxLevel: 52 },
];

let added = 0;
let merged = 0;
for (const mob of MOBS) {
  const id = `npc:plane-of-growth:${slug(mob.label)}`;
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
  addEdge(id, "zone:plane-of-growth", "located_in");
  added++;
}

save();
console.log(`Migration 308 complete: ${added} npc node(s) added, ${merged} existing npc(s) merged with a mob role, for zone:plane-of-growth`);
