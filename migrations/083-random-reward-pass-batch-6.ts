/**
 * Migration 083: sixth batch of the "random-reward followup" sweep
 * (random-reward-followup.md). Each reward pool re-verified against the
 * quest's own eqlwiki.com page (and each new item's own page) per
 * decisions/eqlwiki-quest-research-method.md.
 *
 * - Marauder Armor: unhedged "random piece of Leech Husk armor" -- 5 new
 *   item nodes (Boots, Gloves, Leggings, Tunic, Wrist Bands), each fetched
 *   from its own page.
 * - Merona's Brother: only Band of Tunare and Ring of Pine are named with
 *   full stat lines; "assorted newbie supplies" (bandages, rations, bread,
 *   water, mead) stays hedge text per decisions/quest-reward-modeling.md's
 *   non-exhaustive-pool rule -- same treatment as Karana Clovers (migration
 *   081).
 * - Mining Caps: the wiki page actually covers four separate NPCs trading
 *   the same Useless Cloth Cap for four *independent* reward pools, not one
 *   shared pool -- confirms the followup note's own suspicion. Each named
 *   item gets its own NPC-scoped randomGroup: Abandoned Heretic Pet
 *   (Amber), Lefthand Busy Skeleton (Onyx), Righthand Skeleton (Bone Chips,
 *   Zombie Skin). Talrigar Eklorin's reward ("a low-level item, possibly a
 *   Necromancer spell?") names nothing concrete -- left unmodeled, same gap
 *   as Necro Spells below. The graph's existing giver edge
 *   (npc:toxxulia-forest:skeleton-miner) doesn't map cleanly to one of the
 *   four wiki NPCs; reward edges attach to the quest node regardless, so
 *   this doesn't block modeling the pools themselves.
 *
 * Not modeled this batch (checked 2026-07-20):
 * - Necro Spells: wiki states only "a random low-level Necromancer spell,"
 *   no options enumerated anywhere on the page -- same gap as Bozinite
 *   Pestle Quest / Corrupt Guards (Cleric version).
 * - Necromancer Spells / Necromancer Spells (Cabilis): both confirmed as
 *   the same real 4-spell reward pool (Minion of Shadows, Sacrifice, Scent
 *   of Terris, Shadowbond) -- but none of the four exist in this repo's
 *   spell corpus yet. Same reasoning as Magician Spells (Good)/(Evil) in
 *   migration 082: hand-authoring spell nodes from a WebFetch summary risks
 *   fabricating fields (fizzleTime, targetType, resist, range, icon) a
 *   summary doesn't reliably supply. Belongs to the actual spell-scrape
 *   pipeline (scripts/scrape-spell-details.ts), not a quest migration.
 * - Poacher Leader: wiki states only "a random low level spell," no options
 *   enumerated -- same gap as Necro Spells.
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, save } = loadGraph(import.meta.dir);

// -- Marauder Armor: unhedged 5-piece Leech Husk armor pool --
const LEECH_HUSK_BROAD = [
  "bard", "beastlord", "berserker", "cleric", "druid", "monk",
  "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior",
];
const LEECH_HUSK_NARROW = [
  "warrior", "cleric", "paladin", "ranger", "shadow knight", "bard", "rogue", "shaman",
];
const marauderSource = "Marauder Armor reward (Drill Master Dal, East Cabilis)";

addNode({ id: "item:leech-husk-boots", label: "Leech Husk Boots", type: "item", slots: ["Feet"], ac: 3, classes: LEECH_HUSK_BROAD, weight: 2.5, size: "Small", source: marauderSource });
addNode({ id: "item:leech-husk-gloves", label: "Leech Husk Gloves", type: "item", slots: ["Hands"], ac: 3, classes: LEECH_HUSK_BROAD, weight: 1.5, size: "Small", source: marauderSource });
addNode({ id: "item:leech-husk-leggings", label: "Leech Husk Leggings", type: "item", slots: ["Legs"], ac: 4, classes: LEECH_HUSK_NARROW, weight: 4.0, size: "Medium", source: marauderSource });
addNode({ id: "item:leech-husk-tunic", label: "Leech Husk Tunic", type: "item", slots: ["Chest"], ac: 7, classes: LEECH_HUSK_NARROW, weight: 3.5, size: "Medium", source: marauderSource });
addNode({ id: "item:leech-husk-wrist-bands", label: "Leech Husk Wrist Bands", type: "item", slots: ["Wrist"], ac: 2, classes: LEECH_HUSK_NARROW, weight: 1.0, size: "Small", source: marauderSource });

const marauderArmorPool = [
  "item:leech-husk-boots",
  "item:leech-husk-gloves",
  "item:leech-husk-leggings",
  "item:leech-husk-tunic",
  "item:leech-husk-wrist-bands",
];
for (const id of marauderArmorPool) {
  addEdge("quest:marauder-armor", id, "rewards", { randomGroup: "marauder-armor-drop" });
}

// -- Merona's Brother: Band of Tunare / Ring of Pine (newbie supplies stay hedge text) --
const MERONAS_CLASSES = ["warrior", "cleric", "paladin", "ranger", "druid"];
const meronasSource = "Merona's Brother reward (Merona Castekin, Surefall Glade)";

addNode({ id: "item:band-of-tunare", label: "Band of Tunare", type: "item", slots: ["Wrist"], ac: 1, stats: { wis: 1 }, mana: 2, resists: { fire: -5 }, classes: MERONAS_CLASSES, weight: 0.2, size: "Small", magic: true, lore: true, source: meronasSource });
addNode({ id: "item:ring-of-pine", label: "Ring of Pine", type: "item", slots: ["Finger"], ac: 1, stats: { sta: 1 }, resists: { fire: -10 }, classes: MERONAS_CLASSES, weight: 0.2, size: "Small", magic: true, lore: true, source: meronasSource });

const meronasBrotherPool = ["item:band-of-tunare", "item:ring-of-pine"];
for (const id of meronasBrotherPool) {
  addEdge("quest:meronas-brother", id, "rewards", { randomGroup: "meronas-brother-drop" });
}

// -- Mining Caps: three independent, NPC-scoped single-item pools --
addNode({ id: "item:amber", label: "Amber", type: "item", weight: 0.1, size: "Tiny", source: "Mining Caps reward (Abandoned Heretic Pet, Toxxulia Forest); also a common jewelcrafting tradeskill ingredient" });
addNode({ id: "item:onyx", label: "Onyx", type: "item", weight: 0.1, size: "Tiny", source: "Mining Caps reward (Lefthand Busy Skeleton, Toxxulia Forest); also a common jewelcrafting tradeskill ingredient" });
addNode({ id: "item:bone-chips", label: "Bone Chips", type: "item", weight: 0.1, size: "Small", source: "Mining Caps reward (Righthand Skeleton, Toxxulia Forest)" });
addNode({ id: "item:zombie-skin", label: "Zombie Skin", type: "item", weight: 0.1, size: "Small", source: "Mining Caps reward (Righthand Skeleton, Toxxulia Forest)" });

addEdge("quest:mining-caps", "item:amber", "rewards", { randomGroup: "mining-caps-heretic-pet-drop" });
addEdge("quest:mining-caps", "item:onyx", "rewards", { randomGroup: "mining-caps-lefthand-skeleton-drop" });
addEdge("quest:mining-caps", "item:bone-chips", "rewards", { randomGroup: "mining-caps-righthand-skeleton-drop" });
addEdge("quest:mining-caps", "item:zombie-skin", "rewards", { randomGroup: "mining-caps-righthand-skeleton-drop" });

save();
console.log("Migration 083 complete: modeled random-reward pools for Marauder Armor, Merona's Brother, and Mining Caps");
