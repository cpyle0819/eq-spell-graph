/**
 * Migration 080: third batch of the "random-reward followup" sweep
 * (random-reward-followup.md). Each reward pool re-verified against the
 * quest's own eqlwiki.com page (and each new item/spell's own page) per
 * decisions/eqlwiki-quest-research-method.md.
 *
 * - Goblin Battlemasters: 10-piece Faydark Ringmail Armor set, each piece's
 *   own wiki page fetched individually (no single set page exists at
 *   Faydark_Ringmail_Armor or _Armor_Set -- both 404).
 * - Help Hergor Get Fatter: "random piece of Large Raw-Hide Armor Set, or
 *   Large Tattered Armor Set" -- confirmed a closed 2-set choice (no hedge
 *   language). Large Tattered's own set page confirms it's exactly the
 *   7 pieces already modeled in migration 079 (belt/gloves/gorget/mask/
 *   shoulderpads/skullcap/wristbands) -- no new nodes there. Large Raw-Hide
 *   Armor Set redirects to "Raw-Hide Armor Set" (no "Large" in the item
 *   names themselves, same as the already-modeled item:raw-hide-leggings) --
 *   11 new pieces needed.
 * - Ice Goblin Necklaces: 5-item pool (ration, iron ration, torch, water
 *   flask, small lantern), all 5 already modeled by earlier batches -- just
 *   new reward edges.
 * - Illegible Cantrip Quest: two independent random pools confirmed on one
 *   page -- phase 1 (cantrip turn-in) is a hedged "for the most part..."
 *   4-item pool (ration, iron ration, torch, Cracked Staff -- only Cracked
 *   Staff is new), phase 2 (scroll turn-in, Amiable+ faction) is an
 *   unhedged closed 4-spell pool (Elementalkin: Air/Earth/Fire/Water, all
 *   already in the spell corpus).
 * - Illegible Scrolls: "such as" hedged 4-spell pool (Bone Walk, Cure
 *   Blindness, Spirit Sight, Tainted Breath), all already in the spell
 *   corpus -- named options modeled per decisions/quest-reward-modeling.md,
 *   hedge stays in the quest's own description prose (already there).
 * - Illegible Scrolls (Felwithe): unhedged 4-item pool (Iron Ration, Large
 *   Lantern, Mead, Lockpicks) -- 3 new item nodes.
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, save } = loadGraph(import.meta.dir);

const FAYDARK_CLASSES = ["warrior", "cleric", "paladin", "ranger", "shadow knight", "bard", "rogue", "shaman"];
const faydarkSource = "Goblin Battlemasters reward (Captain Keatar, Firiona Vie)";

// -- Goblin Battlemasters: Faydark Ringmail Armor set --
addNode({ id: "item:faydark-ringmail-boots", label: "Faydark Ringmail Boots", type: "item", slots: ["Feet"], ac: 5, stats: { cha: 2 }, weight: 3.5, size: "Medium", classes: FAYDARK_CLASSES, source: faydarkSource });
addNode({ id: "item:faydark-ringmail-bracer", label: "Faydark Ringmail Bracer", type: "item", slots: ["Wrist"], ac: 5, stats: { cha: 2 }, weight: 0.9, size: "Small", classes: FAYDARK_CLASSES, source: faydarkSource });
addNode({ id: "item:faydark-ringmail-coat", label: "Faydark Ringmail Coat", type: "item", slots: ["Chest"], ac: 12, stats: { cha: 5 }, weight: 6.0, size: "Medium", classes: FAYDARK_CLASSES, source: faydarkSource });
addNode({ id: "item:faydark-ringmail-coif", label: "Faydark Ringmail Coif", type: "item", slots: ["Head"], ac: 7, stats: { cha: 3 }, weight: 3.0, size: "Small", classes: FAYDARK_CLASSES, source: faydarkSource });
addNode({ id: "item:faydark-ringmail-collar", label: "Faydark Ringmail Collar", type: "item", slots: ["Neck"], ac: 5, stats: { cha: 1 }, weight: 1.0, size: "Small", classes: FAYDARK_CLASSES, source: faydarkSource });
addNode({ id: "item:faydark-ringmail-gloves", label: "Faydark Ringmail Gloves", type: "item", slots: ["Hands"], ac: 6, stats: { cha: 2 }, weight: 2.5, size: "Small", classes: FAYDARK_CLASSES, source: faydarkSource });
addNode({ id: "item:faydark-ringmail-mantle", label: "Faydark Ringmail Mantle", type: "item", slots: ["Shoulders"], ac: 5, stats: { cha: 2 }, weight: 2.0, size: "Small", classes: FAYDARK_CLASSES, source: faydarkSource });
addNode({ id: "item:faydark-ringmail-pants", label: "Faydark Ringmail Pants", type: "item", slots: ["Legs"], ac: 7, stats: { cha: 4 }, weight: 4.0, size: "Medium", classes: FAYDARK_CLASSES, source: faydarkSource });
addNode({ id: "item:faydark-ringmail-skirt", label: "Faydark Ringmail Skirt", type: "item", slots: ["Waist"], ac: 5, stats: { cha: 2 }, weight: 1.0, size: "Small", classes: FAYDARK_CLASSES, source: faydarkSource });
addNode({ id: "item:faydark-ringmail-sleeves", label: "Faydark Ringmail Sleeves", type: "item", slots: ["Arms"], ac: 6, stats: { cha: 2 }, weight: 2.5, size: "Small", classes: FAYDARK_CLASSES, source: faydarkSource });

const faydarkPool = [
  "item:faydark-ringmail-boots",
  "item:faydark-ringmail-bracer",
  "item:faydark-ringmail-coat",
  "item:faydark-ringmail-coif",
  "item:faydark-ringmail-collar",
  "item:faydark-ringmail-gloves",
  "item:faydark-ringmail-mantle",
  "item:faydark-ringmail-pants",
  "item:faydark-ringmail-skirt",
  "item:faydark-ringmail-sleeves",
];
for (const id of faydarkPool) {
  addEdge("quest:goblin-battlemasters", id, "rewards", { randomGroup: "goblin-battlemasters-drop" });
}

// -- Help Hergor Get Fatter: Raw-Hide Armor Set (Large Tattered's 7 pieces already modeled) --
const RAW_HIDE_CLASSES = ["bard", "beastlord", "berserker", "cleric", "druid", "monk", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"];
const rawHideSource = "Help Hergor Get Fatter reward (Hergor, Grobb); part of the Raw-Hide Armor Set";

addNode({ id: "item:raw-hide-belt", label: "Raw-hide Belt", type: "item", slots: ["Waist"], ac: 3, weight: 1.5, size: "Small", classes: RAW_HIDE_CLASSES, source: rawHideSource });
addNode({ id: "item:raw-hide-boots", label: "Raw-hide Boots", type: "item", slots: ["Feet"], ac: 4, weight: 3.8, size: "Small", classes: RAW_HIDE_CLASSES, source: rawHideSource });
addNode({ id: "item:raw-hide-cloak", label: "Raw-hide Cloak", type: "item", slots: ["Back"], ac: 4, weight: 3.0, size: "Medium", classes: RAW_HIDE_CLASSES, source: rawHideSource });
addNode({ id: "item:raw-hide-gloves", label: "Raw-hide Gloves", type: "item", slots: ["Hands"], ac: 4, weight: 2.2, size: "Small", classes: RAW_HIDE_CLASSES, source: rawHideSource });
addNode({ id: "item:raw-hide-gorget", label: "Raw-hide Gorget", type: "item", slots: ["Neck"], ac: 3, weight: 0.8, size: "Small", classes: RAW_HIDE_CLASSES, source: rawHideSource });
addNode({ id: "item:raw-hide-mask", label: "Raw-hide Mask", type: "item", slots: ["Face"], ac: 2, weight: 0.6, size: "Small", classes: RAW_HIDE_CLASSES, source: rawHideSource });
addNode({ id: "item:raw-hide-shoulderpads", label: "Raw-hide Shoulderpads", type: "item", slots: ["Shoulders"], ac: 3, weight: 2.2, size: "Small", classes: RAW_HIDE_CLASSES, source: rawHideSource });
addNode({ id: "item:raw-hide-skullcap", label: "Raw-hide Skullcap", type: "item", slots: ["Head"], ac: 4, weight: 0.9, size: "Small", classes: RAW_HIDE_CLASSES, source: rawHideSource });
addNode({ id: "item:raw-hide-sleeves", label: "Raw-hide Sleeves", type: "item", slots: ["Arms"], ac: 4, weight: 2.2, size: "Small", classes: RAW_HIDE_CLASSES, source: rawHideSource });
addNode({ id: "item:raw-hide-tunic", label: "Raw-hide Tunic", type: "item", slots: ["Chest"], ac: 8, weight: 5.3, size: "Medium", classes: RAW_HIDE_CLASSES, source: rawHideSource });
addNode({ id: "item:raw-hide-wristbands", label: "Raw-hide Wristbands", type: "item", slots: ["Wrist"], ac: 3, weight: 1.5, size: "Small", classes: RAW_HIDE_CLASSES, source: rawHideSource });

const hergorPool = [
  "item:raw-hide-belt",
  "item:raw-hide-boots",
  "item:raw-hide-cloak",
  "item:raw-hide-gloves",
  "item:raw-hide-gorget",
  "item:raw-hide-leggings",
  "item:raw-hide-mask",
  "item:raw-hide-shoulderpads",
  "item:raw-hide-skullcap",
  "item:raw-hide-sleeves",
  "item:raw-hide-tunic",
  "item:raw-hide-wristbands",
  "item:large-tattered-belt",
  "item:large-tattered-gloves",
  "item:large-tattered-gorget",
  "item:large-tattered-mask",
  "item:large-tattered-shoulderpads",
  "item:large-tattered-skullcap",
  "item:large-tattered-wristbands",
];
for (const id of hergorPool) {
  addEdge("quest:help-hergor-get-fatter", id, "rewards", { randomGroup: "help-hergor-get-fatter-drop" });
}

// -- Ice Goblin Necklaces: all 5 pieces already modeled --
const iceGoblinPool = ["item:ration", "item:iron-ration", "item:torch", "item:water-flask", "item:small-lantern"];
for (const id of iceGoblinPool) {
  addEdge("quest:ice-goblin-necklaces", id, "rewards", { randomGroup: "ice-goblin-necklaces-drop" });
}

// -- Illegible Cantrip Quest: two independent pools --
addNode({ id: "item:cracked-staff", label: "Cracked Staff", type: "item", slots: ["Primary", "Secondary"], skill: "1H Blunt", delay: 32, damage: 5, weight: 8.5, size: "Large", value: "1p 2g", source: "Illegible Cantrip Quest reward (Tara Neklene, West Freeport)" });

const illegibleCantripPhase1Pool = ["item:ration", "item:iron-ration", "item:torch", "item:cracked-staff"];
for (const id of illegibleCantripPhase1Pool) {
  addEdge("quest:illegible-cantrip-quest", id, "rewards", { randomGroup: "illegible-cantrip-quest-phase1-drop" });
}

const illegibleCantripPhase2Pool = ["spell:elementalkin-air", "spell:elementalkin-earth", "spell:elementalkin-fire", "spell:elementalkin-water"];
for (const id of illegibleCantripPhase2Pool) {
  addEdge("quest:illegible-cantrip-quest", id, "rewards", { randomGroup: "illegible-cantrip-quest-phase2-drop" });
}

// -- Illegible Scrolls: hedged ("such as") 4-spell pool, all already modeled --
const illegibleScrollsPool = ["spell:bone-walk", "spell:cure-blindness", "spell:spirit-sight", "spell:tainted-breath"];
for (const id of illegibleScrollsPool) {
  addEdge("quest:illegible-scrolls", id, "rewards", { randomGroup: "illegible-scrolls-drop" });
}

// -- Illegible Scrolls (Felwithe): unhedged 4-item pool --
addNode({ id: "item:large-lantern", label: "Large Lantern", type: "item", slots: ["Secondary"], weight: 1.0, size: "Small", lightSource: true, source: "Illegible Scrolls (Felwithe) reward (General Jyleel, Northern Felwithe)" });
addNode({ id: "item:mead", label: "Mead", type: "item", weight: 0.4, size: "Small", source: "Illegible Scrolls (Felwithe) reward (General Jyleel, Northern Felwithe) -- a beverage" });
addNode({ id: "item:lockpicks", label: "Lockpicks", type: "item", weight: 0.1, size: "Tiny", classes: ["bard", "rogue"], source: "Illegible Scrolls (Felwithe) reward (General Jyleel, Northern Felwithe); used for picking locks" });

const illegibleScrollsFelwithePool = ["item:iron-ration", "item:large-lantern", "item:mead", "item:lockpicks"];
for (const id of illegibleScrollsFelwithePool) {
  addEdge("quest:illegible-scrolls-felwithe", id, "rewards", { randomGroup: "illegible-scrolls-felwithe-drop" });
}

save();
console.log("Migration 080 complete: modeled random-reward pools for Goblin Battlemasters, Help Hergor Get Fatter, Ice Goblin Necklaces, Illegible Cantrip Quest, Illegible Scrolls, and Illegible Scrolls (Felwithe)");
