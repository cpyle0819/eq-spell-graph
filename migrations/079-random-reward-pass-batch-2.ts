/**
 * Migration 079: second batch of the "random-reward followup" sweep
 * (random-reward-followup.md). Each reward pool re-verified against the
 * quest's own eqlwiki.com page (and each new item's own page) per
 * decisions/eqlwiki-quest-research-method.md.
 *
 * - Bone Chips (Kaladim): 18-item pool from Gunlok Jure -- 4 weapons, a
 *   Small Lantern/Torch, and the full Small Patchwork + Small Tattered
 *   armor sets (most already modeled by earlier quest batches; only the 3
 *   weapons and 2 tattered pieces were missing).
 * - Crushbone Belts: Canloe Nusback's "choice of starter armor" turns out
 *   to be the exact same Small Patchwork/Small Tattered set as Bone Chips
 *   (Kaladim) above, minus the weapons/lantern/torch -- confirmed by
 *   separately fetching both pages, not assumed from the name overlap.
 * - Coldain Skulls: "a random piece of Giant Scalemail Armor" resolves, via
 *   the set's own wiki page, to a named 13-piece list with full stat lines.
 * - Cindl's Polar Bear Collection: Large Patchwork armor set (5 pieces),
 *   Large Tattered armor set (7 pieces), and the already-modeled Raw-hide
 *   Leggings.
 * - Cleric Supplies: 19 named low-level cleric spells, all already present
 *   in the spell corpus -- no new spell nodes needed, just reward edges.
 *
 * Corrupt Guards (Cleric version) is NOT included -- same gap as Bozinite
 * Pestle Quest (migration 078): the wiki page states only "a random cleric
 * spell scroll" with no options enumerated anywhere on the page.
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, save } = loadGraph(import.meta.dir);

const NON_CASTER = ["bard", "beastlord", "berserker", "cleric", "druid", "monk", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"];
const NON_CASTER_NO_MONK = ["bard", "beastlord", "berserker", "cleric", "druid", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"];

// -- Bone Chips (Kaladim) / Crushbone Belts: shared Small Patchwork/Tattered pool --
addNode({ id: "item:rusty-axe", label: "Rusty Axe", type: "item", slots: ["Primary", "Secondary"], skill: "1H Slashing", delay: 36, damage: 5, classes: ["warrior", "paladin", "ranger", "shadow knight", "bard", "rogue", "shaman"], weight: 6.5, size: "Medium", source: "Bone Chips (Kaladim) reward (Gunlok Jure, North Kaladim)" });
addNode({ id: "item:rusty-broad-sword", label: "Rusty Broad Sword", type: "item", slots: ["Primary", "Secondary"], skill: "1H Slashing", delay: 36, damage: 5, classes: ["warrior", "paladin", "ranger", "shadow knight", "bard", "rogue"], weight: 7.5, size: "Medium", source: "Bone Chips (Kaladim) reward (Gunlok Jure, North Kaladim)" });
addNode({ id: "item:rusty-mace", label: "Rusty Mace", type: "item", slots: ["Primary", "Secondary"], skill: "1H Blunt", delay: 38, damage: 5, classes: NON_CASTER, weight: 8.0, size: "Medium", source: "Bone Chips (Kaladim) reward (Gunlok Jure, North Kaladim); also a Blacksmithing tradeskill ingredient" });
addNode({ id: "item:small-tattered-gorget", label: "Small Tattered Gorget", type: "item", slots: ["Neck"], ac: 2, classes: NON_CASTER_NO_MONK, weight: 0.4, size: "Small", source: "Bone Chips (Kaladim) / Crushbone Belts reward; part of the Small Tattered Armor Set; also craftable via Tailoring (trivial 26)" });
addNode({ id: "item:small-tattered-shoulderpads", label: "Small Tattered Shoulderpads", type: "item", slots: ["Shoulders"], ac: 2, classes: NON_CASTER_NO_MONK, weight: 1.1, size: "Small", source: "Bone Chips (Kaladim) / Crushbone Belts reward; part of the Small Tattered Armor Set; also craftable via Tailoring (trivial 26)" });

const boneChipsPool = [
  "item:rusty-axe",
  "item:rusty-broad-sword",
  "item:rusty-mace",
  "item:rusty-two-handed-sword",
  "item:small-lantern",
  "item:small-patchwork-boots",
  "item:small-patchwork-cloak",
  "item:small-patchwork-pants",
  "item:small-patchwork-sleeves",
  "item:small-patchwork-tunic",
  "item:small-tattered-belt",
  "item:small-tattered-gloves",
  "item:small-tattered-gorget",
  "item:small-tattered-mask",
  "item:small-tattered-shoulderpads",
  "item:small-tattered-skullcap",
  "item:small-tattered-wristbands",
  "item:torch",
];
for (const id of boneChipsPool) {
  addEdge("quest:bone-chips-kaladim", id, "rewards", { randomGroup: "bone-chips-kaladim-drop" });
}

const crushboneBeltsPool = [
  "item:small-patchwork-boots",
  "item:small-patchwork-cloak",
  "item:small-patchwork-pants",
  "item:small-patchwork-sleeves",
  "item:small-patchwork-tunic",
  "item:small-tattered-belt",
  "item:small-tattered-gloves",
  "item:small-tattered-gorget",
  "item:small-tattered-mask",
  "item:small-tattered-shoulderpads",
  "item:small-tattered-skullcap",
  "item:small-tattered-wristbands",
];
for (const id of crushboneBeltsPool) {
  addEdge("quest:crushbone-belts", id, "rewards", { randomGroup: "crushbone-belts-drop" });
}

// -- Coldain Skulls: Giant Scalemail Armor set --
const SCALEMAIL_CLASSES = ["warrior", "cleric", "paladin", "ranger", "shadow knight", "bard", "rogue", "shaman"];
const scalemailSource = "Coldain Skulls reward (Slaggak the Trainer, Kael Drakkal); also drops from giants in Kael Drakkal (Protector of Zek, Legionnaire Alveyrem, and others)";

addNode({ id: "item:giant-scalemail-helm", label: "Giant Scalemail Helm", type: "item", slots: ["Head"], ac: 8, stats: { dex: 5 }, hp: 10, mana: 10, classes: SCALEMAIL_CLASSES, source: scalemailSource });
addNode({ id: "item:giant-scalemail-mask", label: "Giant Scalemail Mask", type: "item", slots: ["Face"], ac: 4, stats: { cha: 3, int: 3 }, classes: SCALEMAIL_CLASSES, source: scalemailSource });
addNode({ id: "item:giant-scalemail-gorget", label: "Giant Scalemail Gorget", type: "item", slots: ["Neck"], ac: 5, stats: { str: 1, dex: 1, wis: 1, agi: 1 }, hp: 15, classes: SCALEMAIL_CLASSES, source: scalemailSource });
addNode({ id: "item:giant-scalemail-mantle", label: "Giant Scalemail Mantle", type: "item", slots: ["Shoulders"], ac: 6, stats: { dex: 2 }, hp: 10, mana: 10, resists: { fire: 2, cold: 2, disease: 2, poison: 2, magic: 2 }, classes: SCALEMAIL_CLASSES, source: scalemailSource });
addNode({ id: "item:giant-scalemail-cloak", label: "Giant Scalemail Cloak", type: "item", slots: ["Back"], ac: 7, stats: { sta: 5 }, hp: 30, mana: 10, classes: SCALEMAIL_CLASSES, source: scalemailSource });
addNode({ id: "item:giant-scalemail-belt", label: "Giant Scalemail Belt", type: "item", slots: ["Waist"], ac: 6, stats: { wis: 1, int: 1 }, hp: 10, classes: SCALEMAIL_CLASSES, source: scalemailSource });
addNode({ id: "item:giant-scalemail-sleeves", label: "Giant Scalemail Sleeves", type: "item", slots: ["Arms"], ac: 11, stats: { wis: 3, int: -3 }, hp: 20, classes: SCALEMAIL_CLASSES, source: scalemailSource });
addNode({ id: "item:giant-scalemail-bracer", label: "Giant Scalemail Bracer", type: "item", slots: ["Wrist"], ac: 6, stats: { agi: 5 }, hp: 10, classes: SCALEMAIL_CLASSES, source: scalemailSource });
addNode({ id: "item:giant-scalemail-gloves", label: "Giant Scalemail Gloves", type: "item", slots: ["Hands"], ac: 7, stats: { wis: 1, int: 1 }, classes: SCALEMAIL_CLASSES, source: scalemailSource });
addNode({ id: "item:giant-scalemail-leggings", label: "Giant Scalemail Leggings", type: "item", slots: ["Legs"], ac: 11, stats: { int: 3, wis: -3 }, hp: 20, classes: SCALEMAIL_CLASSES, source: scalemailSource });
addNode({ id: "item:giant-scalemail-boots", label: "Giant Scalemail Boots", type: "item", slots: ["Feet"], ac: 7, stats: { agi: 2 }, classes: SCALEMAIL_CLASSES, source: scalemailSource });
addNode({ id: "item:giant-scalemail-gauntlets", label: "Giant Scalemail Gauntlets", type: "item", slots: ["Hands"], ac: 7, stats: { str: 1, wis: 1 }, classes: SCALEMAIL_CLASSES, source: scalemailSource });
addNode({ id: "item:giant-scalemail-tunic", label: "Giant Scalemail Tunic", type: "item", slots: ["Chest"], ac: 18, hp: 40, classes: SCALEMAIL_CLASSES, source: scalemailSource });

const scalemailPool = [
  "item:giant-scalemail-helm",
  "item:giant-scalemail-mask",
  "item:giant-scalemail-gorget",
  "item:giant-scalemail-mantle",
  "item:giant-scalemail-cloak",
  "item:giant-scalemail-belt",
  "item:giant-scalemail-sleeves",
  "item:giant-scalemail-bracer",
  "item:giant-scalemail-gloves",
  "item:giant-scalemail-leggings",
  "item:giant-scalemail-boots",
  "item:giant-scalemail-gauntlets",
  "item:giant-scalemail-tunic",
];
for (const id of scalemailPool) {
  addEdge("quest:coldain-skulls", id, "rewards", { randomGroup: "coldain-skulls-drop" });
}

// -- Cindl's Polar Bear Collection: Large Patchwork + Large Tattered sets --
const LARGE_ARMOR_CLASSES = NON_CASTER;
const cindlSource = "Cindl's Polar Bear Collection reward (Cindl, inside Mac's Kilts, Halas); also craftable via Tailoring (trivial 26)";

addNode({ id: "item:large-patchwork-boots", label: "Large Patchwork Boots", type: "item", slots: ["Feet"], ac: 3, classes: LARGE_ARMOR_CLASSES, weight: 3.1, size: "Small", source: cindlSource });
addNode({ id: "item:large-patchwork-cloak", label: "Large Patchwork Cloak", type: "item", slots: ["Back"], ac: 3, classes: LARGE_ARMOR_CLASSES, weight: 2.5, size: "Medium", source: cindlSource });
addNode({ id: "item:large-patchwork-pants", label: "Large Patchwork Pants", type: "item", slots: ["Legs"], ac: 4, classes: LARGE_ARMOR_CLASSES, weight: 5.0, size: "Medium", source: cindlSource });
addNode({ id: "item:large-patchwork-sleeves", label: "Large Patchwork Sleeves", type: "item", slots: ["Arms"], ac: 3, classes: LARGE_ARMOR_CLASSES, weight: 1.9, size: "Small", source: cindlSource });
addNode({ id: "item:large-patchwork-tunic", label: "Large Patchwork Tunic", type: "item", slots: ["Chest"], ac: 6, classes: LARGE_ARMOR_CLASSES, weight: 4.4, size: "Medium", source: cindlSource + "; also drops from a fat alligator in Innothule Swamp" });
addNode({ id: "item:large-tattered-belt", label: "Large Tattered Belt", type: "item", slots: ["Waist"], ac: 2, classes: LARGE_ARMOR_CLASSES, weight: 1.3, size: "Small", source: cindlSource });
addNode({ id: "item:large-tattered-gloves", label: "Large Tattered Gloves", type: "item", slots: ["Hands"], ac: 3, classes: LARGE_ARMOR_CLASSES, weight: 1.9, size: "Small", source: cindlSource });
addNode({ id: "item:large-tattered-gorget", label: "Large Tattered Gorget", type: "item", slots: ["Neck"], ac: 2, classes: LARGE_ARMOR_CLASSES, weight: 0.6, size: "Small", source: cindlSource });
addNode({ id: "item:large-tattered-mask", label: "Large Tattered Mask", type: "item", slots: ["Face"], ac: 2, classes: LARGE_ARMOR_CLASSES, weight: 0.5, size: "Small", source: cindlSource });
addNode({ id: "item:large-tattered-shoulderpads", label: "Large Tattered Shoulderpads", type: "item", slots: ["Shoulders"], ac: 2, classes: LARGE_ARMOR_CLASSES, weight: 1.9, size: "Small", source: cindlSource });
addNode({ id: "item:large-tattered-skullcap", label: "Large Tattered Skullcap", type: "item", slots: ["Head"], ac: 3, classes: LARGE_ARMOR_CLASSES, weight: 0.8, size: "Small", source: cindlSource });
addNode({ id: "item:large-tattered-wristbands", label: "Large Tattered Wristbands", type: "item", slots: ["Wrist"], ac: 2, classes: LARGE_ARMOR_CLASSES, weight: 1.3, size: "Small", source: cindlSource });

const cindlPool = [
  "item:large-patchwork-boots",
  "item:large-patchwork-cloak",
  "item:large-patchwork-pants",
  "item:large-patchwork-sleeves",
  "item:large-patchwork-tunic",
  "item:large-tattered-belt",
  "item:large-tattered-gloves",
  "item:large-tattered-gorget",
  "item:large-tattered-mask",
  "item:large-tattered-shoulderpads",
  "item:large-tattered-skullcap",
  "item:large-tattered-wristbands",
  "item:raw-hide-leggings",
];
for (const id of cindlPool) {
  addEdge("quest:cindls-polar-bear-collection", id, "rewards", { randomGroup: "cindls-polar-bear-collection-drop" });
}

// -- Cleric Supplies: 19 named low-level cleric spells, all already modeled --
const clericSuppliesPool = [
  "spell:courage",
  "spell:cure-poison",
  "spell:divine-aura",
  "spell:flash-of-light",
  "spell:minor-healing",
  "spell:spook-the-dead",
  "spell:strike",
  "spell:true-north",
  "spell:yaulp",
  "spell:cure-blindness",
  "spell:cure-disease",
  "spell:furor",
  "spell:gate",
  "spell:holy-armor",
  "spell:light-healing",
  "spell:reckless-strength",
  "spell:stun",
  "spell:summon-drink",
  "spell:ward-undead",
];
for (const id of clericSuppliesPool) {
  addEdge("quest:cleric-supplies", id, "rewards", { randomGroup: "cleric-supplies-drop" });
}

save();
console.log("Migration 079 complete: modeled random-reward pools for Bone Chips (Kaladim), Crushbone Belts, Coldain Skulls, Cindl's Polar Bear Collection, and Cleric Supplies");
