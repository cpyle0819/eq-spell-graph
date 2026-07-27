/**
 * Migration 288: add npc nodes (roles: ["mob"]) for
 * zone:stonebrunt-mountains, per the unified `npc`/`roles` schema from
 * migration 265 (decisions/npc-mob-unification-and-zone-groups.md) -- see
 * issue #36.
 *
 * `Category:Stonebrunt Mountains` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 76
 * `{{Namedmobpage}}` candidates: kobold camps (Highland/regular), the
 * Kejekan cat-people (fishermen, archers, miners, guards, the Peace
 * Keepers-faction amir/awrat/ghazi/pasdar), granitebacks, pandas,
 * spiritlings, and a Shadow Knight epic-quest cluster (Jelquar the
 * Soulslayer/Heretic Invader/Ghost of Ridossan/Ridossan the
 * Unliving/apparitions). Every candidate's own `zone` field names
 * Stonebrunt Mountains and carries a stated numeric level -- no
 * miscategorized-candidate exclusions this batch, unlike most prior ones.
 * No guildmasters (this is a hostile-wilderness zone per its own "Types of
 * Monsters"/"Notable NPCs" tables, not a city), so CLAUDE.md's guildmaster
 * rule never comes into play here.
 *
 * Six candidates (Shazda Kaekwon, Jali Kaliio, Miranda, Khonza Ayssla,
 * Saemey Wirewhisker, "a spirit") already existed as `npc:` quest-giver
 * nodes -- same both-roles-legitimate shape as The Warrens' Aderius
 * Rhenar/Koajin -- so this batch unions the `mob` role and level data onto
 * them rather than skipping.
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const MOBS: { label: string; minLevel: number; maxLevel: number }[] = [
  { label: "Jelquar the Soulslayer", minLevel: 34, maxLevel: 45 },
  { label: "A Greater Kobold Shaman", minLevel: 18, maxLevel: 18 },
  { label: "Shazda Kaekwon", minLevel: 35, maxLevel: 35 },
  { label: "Rognarog the Infuriated", minLevel: 30, maxLevel: 30 },
  { label: "An Elder Panda", minLevel: 34, maxLevel: 34 },
  { label: "A Burly Kobold", minLevel: 4, maxLevel: 4 },
  { label: "Jali Kaliio", minLevel: 27, maxLevel: 27 },
  { label: "A hunting kobold", minLevel: 16, maxLevel: 18 },
  { label: "Giang Yin", minLevel: 44, maxLevel: 44 },
  { label: "Slyder the Ancient", minLevel: 40, maxLevel: 40 },
  { label: "Snowbeast", minLevel: 40, maxLevel: 40 },
  { label: "Old Ghostback", minLevel: 42, maxLevel: 42 },
  { label: "A mature panda", minLevel: 31, maxLevel: 34 },
  { label: "Prowler of the Jungle", minLevel: 37, maxLevel: 37 },
  { label: "A greater shaman", minLevel: 18, maxLevel: 18 },
  { label: "A raging kobold savage", minLevel: 20, maxLevel: 20 },
  { label: "Miranda", minLevel: 10, maxLevel: 10 },
  { label: "A lesser kobold shaman", minLevel: 17, maxLevel: 17 },
  { label: "Arglar the Tormentor", minLevel: 22, maxLevel: 22 },
  { label: "Ghost of Ridossan", minLevel: 35, maxLevel: 35 },
  { label: "Heretic Invader", minLevel: 24, maxLevel: 24 },
  { label: "Hurglak the Destroyer", minLevel: 22, maxLevel: 22 },
  { label: "Mirabai", minLevel: 10, maxLevel: 10 },
  { label: "Khonza Ayssla", minLevel: 35, maxLevel: 35 },
  { label: "Saemey Wirewhisker", minLevel: 28, maxLevel: 28 },
  { label: "Mrowro Wirewhisker", minLevel: 22, maxLevel: 22 },
  { label: "A young panda", minLevel: 31, maxLevel: 31 },
  { label: "An emerald adder", minLevel: 21, maxLevel: 23 },
  { label: "A savage kobold", minLevel: 18, maxLevel: 18 },
  { label: "Merow", minLevel: 21, maxLevel: 21 },
  { label: "An elder graniteback", minLevel: 25, maxLevel: 25 },
  { label: "A panda cub", minLevel: 27, maxLevel: 30 },
  { label: "Fishmaster Jajoshi", minLevel: 21, maxLevel: 21 },
  { label: "A kejek tiger", minLevel: 26, maxLevel: 28 },
  { label: "Disciple Okarote", minLevel: 35, maxLevel: 35 },
  { label: "A kejekan amir", minLevel: 25, maxLevel: 25 },
  { label: "A highland kobold shaman", minLevel: 25, maxLevel: 25 },
  { label: "A mature graniteback", minLevel: 24, maxLevel: 24 },
  { label: "A young gorilla", minLevel: 21, maxLevel: 21 },
  { label: "A highland graniteback", minLevel: 28, maxLevel: 30 },
  { label: "Emylie Steelclaws", minLevel: 22, maxLevel: 22 },
  { label: "A heretic apparition", minLevel: 25, maxLevel: 25 },
  { label: "A fading erudite apparition", minLevel: 25, maxLevel: 25 },
  { label: "A fading heretic apparition", minLevel: 25, maxLevel: 25 },
  { label: "A mountain spiritling", minLevel: 25, maxLevel: 25 },
  { label: "A valley spiritling", minLevel: 15, maxLevel: 15 },
  { label: "A jungle spiritling", minLevel: 21, maxLevel: 21 },
  { label: "Ridossan the Unliving", minLevel: 50, maxLevel: 50 },
  { label: "A spirit", minLevel: 1, maxLevel: 1 },
  { label: "A feral leopard", minLevel: 20, maxLevel: 22 },
  { label: "A ferocious kobold", minLevel: 17, maxLevel: 18 },
  { label: "A highland kobold", minLevel: 22, maxLevel: 24 },
  { label: "A highland tiger", minLevel: 32, maxLevel: 35 },
  { label: "A Highland Tigress", minLevel: 29, maxLevel: 31 },
  { label: "A kejek leopard", minLevel: 17, maxLevel: 19 },
  { label: "A kejek leopardess", minLevel: 16, maxLevel: 16 },
  { label: "A kejek tigress", minLevel: 21, maxLevel: 21 },
  { label: "A kejekan archer", minLevel: 16, maxLevel: 18 },
  { label: "A kejekan awrat", minLevel: 25, maxLevel: 25 },
  { label: "A kejekan fisherman", minLevel: 17, maxLevel: 19 },
  { label: "A kejekan ghazi", minLevel: 25, maxLevel: 25 },
  { label: "A kejekan ghulam", minLevel: 19, maxLevel: 21 },
  { label: "A kejekan ispusar", minLevel: 19, maxLevel: 21 },
  { label: "A kejekan mamluk", minLevel: 16, maxLevel: 18 },
  { label: "A kejekan miner", minLevel: 16, maxLevel: 18 },
  { label: "A kejekan pasdar", minLevel: 25, maxLevel: 25 },
  { label: "A kobold spiritslaver", minLevel: 18, maxLevel: 21 },
  { label: "A kobold wanderer", minLevel: 13, maxLevel: 16 },
  { label: "A rabbit", minLevel: 5, maxLevel: 5 },
  { label: "A raging highland kobold", minLevel: 25, maxLevel: 27 },
  { label: "A raging kobold", minLevel: 21, maxLevel: 21 },
  { label: "A scouting kobold", minLevel: 13, maxLevel: 15 },
  { label: "Girgak the Bloody", minLevel: 23, maxLevel: 24 },
  { label: "Rendolr the Maimer", minLevel: 22, maxLevel: 22 },
  { label: "Spowry", minLevel: 18, maxLevel: 18 },
  { label: "Yuio Kaliio", minLevel: 20, maxLevel: 20 },
];

let added = 0;
let merged = 0;
for (const mob of MOBS) {
  const id = `npc:stonebrunt-mountains:${slug(mob.label)}`;
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
  addEdge(id, "zone:stonebrunt-mountains", "located_in");
  added++;
}

save();
console.log(`Migration 288 complete: ${added} npc node(s) added, ${merged} existing npc(s) merged with a mob role, for zone:stonebrunt-mountains`);
