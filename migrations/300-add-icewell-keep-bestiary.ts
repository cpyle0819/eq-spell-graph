/**
 * Migration 300: add npc nodes (roles: ["mob"]) for zone:icewell-keep, per
 * the unified `npc`/`roles` schema from migration 265
 * (decisions/npc-mob-unification-and-zone-groups.md) -- see issue #36.
 *
 * `Category:Icewell Keep` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 43
 * `{{Namedmobpage}}` candidates: this is a friendly Coldain dwarf keep
 * (Dain Frostreaver IV's court) layered over a hostile monster pit
 * beneath it. No exclusions at all this batch -- every named Guardsman,
 * Sentinel, Watcher, and Councilor carries a full stated level with no
 * `GM` guildmaster tell, and the zone's own prose confirms several are
 * real farmed drops (Councilor Coldember's Ornate Velium Pendant, Royal
 * Armorer Slade's Thurgadin helm quest, Glucose's Incandescent Bracer),
 * consistent with Kaladim's "check known_loot/description before a
 * wholesale civic-roster exclusion" precedent -- this keep just never had
 * a guildmaster-shaped candidate to begin with.
 *
 * "Dain Frostreaver IV" and "Chamberlain Krystorf" already existed as
 * `npc:` quest-giver nodes -- same both-roles-legitimate shape as The
 * Warrens' Aderius Rhenar/Koajin, so this batch unions the `mob` role and
 * level data onto them rather than skipping.
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const MOBS: { label: string; minLevel: number; maxLevel: number }[] = [
  { label: "Dain Frostreaver IV", minLevel: 70, maxLevel: 70 },
  { label: "Frosticube", minLevel: 51, maxLevel: 54 },
  { label: "An Avalanche Golem", minLevel: 55, maxLevel: 55 },
  { label: "A Frost Spike", minLevel: 54, maxLevel: 54 },
  { label: "A Coldain Skeleton", minLevel: 49, maxLevel: 51 },
  { label: "An Icewell Sentry", minLevel: 47, maxLevel: 49 },
  { label: "Royal Guardsman Braxis", minLevel: 57, maxLevel: 57 },
  { label: "Royal Guardsman Hauten", minLevel: 57, maxLevel: 57 },
  { label: "Royal Guardsman Horix", minLevel: 57, maxLevel: 57 },
  { label: "Royal Guardsman Nial", minLevel: 57, maxLevel: 57 },
  { label: "Royal Guardsman Raxine", minLevel: 57, maxLevel: 57 },
  { label: "Royal Guardsman Rhion", minLevel: 57, maxLevel: 57 },
  { label: "Watcher Devin", minLevel: 55, maxLevel: 55 },
  { label: "Sentinel Anderin", minLevel: 53, maxLevel: 53 },
  { label: "Sentinel Fridmar", minLevel: 51, maxLevel: 51 },
  { label: "Sentinel Paxin", minLevel: 51, maxLevel: 51 },
  { label: "Sentinel Saedis", minLevel: 51, maxLevel: 51 },
  { label: "Sentinel Sheila", minLevel: 51, maxLevel: 51 },
  { label: "Sentry Ellison", minLevel: 48, maxLevel: 48 },
  { label: "An Icewell Sentinel", minLevel: 51, maxLevel: 53 },
  { label: "Chamberlain Krystorf", minLevel: 60, maxLevel: 60 },
  { label: "Grand Huntsman Darral", minLevel: 49, maxLevel: 49 },
  { label: "Royal Scribe Kaavin", minLevel: 49, maxLevel: 49 },
  { label: "Loremaster Solstrin", minLevel: 50, maxLevel: 50 },
  { label: "Seneschal Aldikar (Icewell Keep)", minLevel: 65, maxLevel: 65 },
  { label: "Councilor Dirkins", minLevel: 46, maxLevel: 46 },
  { label: "Royal Armorer Slade", minLevel: 49, maxLevel: 49 },
  { label: "Councilor Coldember", minLevel: 45, maxLevel: 45 },
  { label: "Councilor Darakor", minLevel: 47, maxLevel: 47 },
  { label: "Councilor Darkfrost", minLevel: 44, maxLevel: 44 },
  { label: "Councilor Icelok", minLevel: 45, maxLevel: 45 },
  { label: "Councilor Amberfeld", minLevel: 46, maxLevel: 46 },
  { label: "Councilor Deynekn", minLevel: 46, maxLevel: 46 },
  { label: "Councilor Glacierbane", minLevel: 43, maxLevel: 43 },
  { label: "Councilor Icepike", minLevel: 43, maxLevel: 43 },
  { label: "Councilor Wintershade", minLevel: 47, maxLevel: 47 },
  { label: "Councilor Thubins", minLevel: 47, maxLevel: 47 },
  { label: "Grizznot", minLevel: 60, maxLevel: 60 },
  { label: "Glucose", minLevel: 57, maxLevel: 57 },
  { label: "Councilor Juliash Lockhear", minLevel: 55, maxLevel: 55 },
  { label: "Staff Sergeant Bayard", minLevel: 55, maxLevel: 55 },
  { label: "Watcher Scots", minLevel: 57, maxLevel: 57 },
  { label: "Watcher Sprin", minLevel: 55, maxLevel: 55 },
];

let added = 0;
let merged = 0;
for (const mob of MOBS) {
  const id = `npc:icewell-keep:${slug(mob.label)}`;
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
  addEdge(id, "zone:icewell-keep", "located_in");
  added++;
}

save();
console.log(`Migration 300 complete: ${added} npc node(s) added, ${merged} existing npc(s) merged with a mob role, for zone:icewell-keep`);
