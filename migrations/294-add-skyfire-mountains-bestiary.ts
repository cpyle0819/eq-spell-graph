/**
 * Migration 294: add npc nodes (roles: ["mob"]) for
 * zone:skyfire-mountains, per the unified `npc`/`roles` schema from
 * migration 265 (decisions/npc-mob-unification-and-zone-groups.md) -- see
 * issue #36.
 *
 * `Category:Skyfire Mountains` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 28
 * `{{Namedmobpage}}` candidates: wyverns/wurms/drakes/chromadracs/devourers
 * guarding Veeshan's Peak, the Skyfire Named Cycle roster (Eldrig the
 * Old/Felia Goldenwing/Guardian of Felia/Black Scar/Faerie of
 * Dismay/Wandering Wurm/Soul Devourer/Wurm Spirit), and Talendor the
 * dragon. No exclusions this batch -- no guildmasters (a hostile dragon
 * stronghold, not a city), no miscategorized candidates, no non-creature
 * pages.
 *
 * "A Bottomless Devourer" is shared with Howling Stones -- its own level
 * string breaks the two zones out separately (`46-54(HS), 45-48(SF)`), so
 * the Skyfire-specific 45-48 segment was used. "A Wurm" is shared with
 * Burning Woods with one combined `40-44` range covering both, same
 * both-zones-real pattern as Rathe/Steamfont's shared "A Decaying
 * Skeleton". "A bottomless feaster (Skyfire Mountains)" carries a
 * disambiguating suffix in its own page title; label stored without it,
 * id keeps the zone namespace anyway.
 *
 * "Jennus Lyklobar" already existed as an npc quest-giver node (rewards
 * the Element of Fire) -- same both-roles-legitimate shape as The
 * Warrens' Aderius Rhenar/Koajin, so this batch unions the mob role and
 * level data onto it rather than skipping.
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const LABEL_OVERRIDES: Record<string, string> = {
  "A bottomless feaster (Skyfire Mountains)": "A bottomless feaster",
};

const MOBS: { label: string; minLevel: number; maxLevel: number }[] = [
  { label: "Talendor", minLevel: 60, maxLevel: 60 },
  { label: "Eldrig the Old", minLevel: 51, maxLevel: 51 },
  { label: "Felia Goldenwing", minLevel: 45, maxLevel: 45 },
  { label: "Guardian of Felia", minLevel: 44, maxLevel: 44 },
  { label: "Black Scar", minLevel: 45, maxLevel: 45 },
  { label: "Faerie of Dismay", minLevel: 47, maxLevel: 47 },
  { label: "A Mature Wyvern", minLevel: 44, maxLevel: 47 },
  { label: "A Wandering Wurm", minLevel: 47, maxLevel: 47 },
  { label: "A Mature Wurm", minLevel: 45, maxLevel: 45 },
  { label: "An Elder Wyvern", minLevel: 48, maxLevel: 52 },
  { label: "A Bottomless Devourer", minLevel: 45, maxLevel: 48 },
  { label: "A Wyvern", minLevel: 40, maxLevel: 44 },
  { label: "A Skycinder Drake", minLevel: 43, maxLevel: 47 },
  { label: "A Guardian Wurm", minLevel: 60, maxLevel: 60 },
  { label: "A Wurm", minLevel: 40, maxLevel: 44 },
  { label: "A Chromadrac", minLevel: 44, maxLevel: 44 },
  { label: "An Ancient Wyvern", minLevel: 60, maxLevel: 60 },
  { label: "A Soul Devourer", minLevel: 47, maxLevel: 47 },
  { label: "A Wurm Spirit", minLevel: 47, maxLevel: 47 },
  { label: "An Old Wurm", minLevel: 47, maxLevel: 47 },
  { label: "A Mature Chromadrac", minLevel: 45, maxLevel: 49 },
  { label: "A Shadow Drake", minLevel: 47, maxLevel: 51 },
  { label: "A Skyash Drake", minLevel: 39, maxLevel: 46 },
  { label: "Jennus Lyklobar", minLevel: 61, maxLevel: 61 },
  { label: "A bottomless gnawer", minLevel: 42, maxLevel: 42 },
  { label: "A lava walker", minLevel: 52, maxLevel: 52 },
  { label: "A skyfire drake", minLevel: 47, maxLevel: 51 },
  { label: "A bottomless feaster (Skyfire Mountains)", minLevel: 45, maxLevel: 45 },
];

let added = 0;
let merged = 0;
for (const mob of MOBS) {
  const id = `npc:skyfire-mountains:${slug(mob.label)}`;
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
  addEdge(id, "zone:skyfire-mountains", "located_in");
  added++;
}

save();
console.log(`Migration 294 complete: ${added} npc node(s) added, ${merged} existing npc(s) merged with a mob role, for zone:skyfire-mountains`);
