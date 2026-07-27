/**
 * Migration 354: backfill stats for the 48 items that motivated a follow-up
 * to migration 353's audit. Unlike 353's targets, these 48 had no `slots`
 * field at all (not just missing stats), so the slots-based audit query
 * missed them entirely -- caught only when a user spotted the Cleric Plane
 * of Sky Tests' item rewards showing no data.
 *
 * Cross-checking every class's Kael/Skyshrine/Thurgadin armor-quest reward
 * items (`Armor Quests` quests, 7 pieces each: Helm/Breastplate/Vambraces/
 * Bracer/Gauntlets/Greaves/Boots) showed only Cleric (21 pieces) and Bard
 * (21 of 28 -- Bard's separate Lambent Armor Quests line was already
 * complete) were affected; every other class already had full stats. Plus
 * the 6 Cleric Plane of Sky Test rewards themselves. All 48 backfilled from
 * eqlwiki.com's own item pages, fetched directly (see decisions/
 * eql-vs-classic-eq-zone-connectivity.md on sourcing EQL facts).
 *
 * The Bard Kael set's graph labels ("Kael Bard Helm" etc.) turned out to be
 * placeholder names, not the wiki's real item names ("Troubadour's Helm"
 * etc, confirmed via the Bard_Kael_Armor_Quests page) -- relabeled here
 * alongside the stat backfill. Bard's Skyshrine (Twilight) and Thurgadin
 * (Resonant) labels were already correct.
 */

import { loadGraph } from "./_lib";

const { updateNode, save } = loadGraph(import.meta.dir);

// --- Cleric Kael Armor Quests: Templar's set ---
updateNode("item:templar-s-crown", {
  slots: ["Head"], ac: 28, stats: { str: 2, wis: 3 }, mana: 35,
  resists: { fire: 1, disease: 1, cold: 1, magic: 8, poison: 1 },
  weight: 5.5, size: "Small", magic: true, noTrade: true,
});
updateNode("item:templar-s-chestplate", {
  slots: ["Chest"], ac: 54, stats: { str: 5, sta: 8, wis: 15 }, hp: 40, mana: 90,
  resists: { fire: 4, disease: 3, cold: 3, magic: 7, poison: 4 },
  effect: "Mark of Karn (Must Equip, Casting Time: 9.0) at Level 46",
  weight: 8.0, size: "Large", magic: true, noTrade: true,
});
updateNode("item:templar-s-vambraces", {
  slots: ["Arms"], ac: 29, stats: { str: 3, wis: 2 }, hp: 40,
  resists: { magic: 4 }, weight: 6.0, size: "Small", magic: true, noTrade: true,
});
updateNode("item:templar-s-bracer", {
  slots: ["Wrist"], ac: 21, stats: { str: 5, wis: 2 }, hp: 35, mana: 20,
  resists: { disease: 2 },
  effect: "Abundant Food (Must Equip, Casting Time: 10.0) at Level 50",
  weight: 3.5, size: "Small", magic: true, noTrade: true,
});
updateNode("item:templar-s-gauntlets", {
  slots: ["Hands"], ac: 21, stats: { str: 2, cha: 7 }, mana: 40,
  resists: { cold: 4, magic: 2 }, weight: 4.5, size: "Small", magic: true, noTrade: true,
});
updateNode("item:templar-s-leggings", {
  slots: ["Legs"], ac: 36, stats: { wis: 10 }, hp: 90, mana: 50,
  resists: { fire: 5, disease: 5 },
  effect: "Word of Health (Must Equip, Casting Time: 12.0) at Level 50",
  weight: 7.0, size: "Large", magic: true, noTrade: true,
});
updateNode("item:templar-s-boots", {
  slots: ["Feet"], ac: 27, stats: { str: 2, sta: 5, wis: 3 },
  resists: { fire: 1, cold: 1, magic: 1 },
  effect: "Abundant Drink (Must Equip, Casting Time: 10.0) at Level 50",
  weight: 6.0, size: "Medium", magic: true, noTrade: true,
});

// --- Cleric Skyshrine Armor Quests: Akkirus' set ---
updateNode("item:akkirus-crown-of-the-risen", {
  slots: ["Head"], ac: 22, stats: { str: 3, sta: 2, wis: 6 }, hp: 30, mana: 35,
  resists: { disease: 3, cold: 3, magic: 4 }, weight: 5.5, size: "Small", magic: true, noTrade: true,
});
updateNode("item:akkirus-chestplate-of-the-risen", {
  slots: ["Chest"], ac: 50, stats: { sta: 9, wis: 15, agi: 5 }, hp: 50, mana: 90,
  resists: { fire: 8, disease: 9, cold: 8, magic: 9, poison: 8 },
  effect: "Mark of Karn (Must Equip, Casting Time: 9.0) at Level 46",
  weight: 8.0, size: "Large", magic: true, noTrade: true,
});
updateNode("item:akkirus-vambraces-of-the-risen", {
  slots: ["Arms"], ac: 25, stats: { sta: 3, wis: 5 }, hp: 35, mana: 20,
  resists: { fire: 1, disease: 1, cold: 1, magic: 1, poison: 1 },
  weight: 6.0, size: "Small", magic: true, noTrade: true,
});
updateNode("item:akkirus-bracelet-of-the-risen", {
  slots: ["Wrist"], ac: 19, stats: { str: 2, sta: 5, wis: 6 }, hp: 35, mana: 20,
  resists: { cold: 5 },
  effect: "Abundant Food (Must Equip, Casting Time: 10.0)",
  weight: 3.5, size: "Small", magic: true, noTrade: true,
});
updateNode("item:akkirus-gauntlets-of-the-risen", {
  slots: ["Hands"], ac: 19, stats: { dex: 3, cha: 7, wis: 3 }, hp: 20, mana: 40,
  resists: { disease: 3, magic: 5 }, weight: 4.5, size: "Small", magic: true, noTrade: true,
});
updateNode("item:akkirus-greaves-of-the-risen", {
  slots: ["Legs"], ac: 31, stats: { sta: 5, wis: 10 }, hp: 80, mana: 70,
  resists: { fire: 1, disease: 1, cold: 1, magic: 1, poison: 5 },
  effect: "Word of Health (Must Equip, Casting Time: 12.0)",
  weight: 7.0, size: "Large", magic: true, noTrade: true,
});
updateNode("item:akkirus-boots-of-the-risen", {
  slots: ["Feet"], ac: 24, stats: { str: 3, sta: 6, cha: 2 }, hp: 20, mana: 20,
  resists: { fire: 2, cold: 2, magic: 2 },
  effect: "Abundant Drink (Must Equip, Casting Time: 10.0)",
  weight: 6.0, size: "Medium", magic: true, noTrade: true,
});

// --- Cleric Thurgadin Armor Quests: Forbidden Rites set ---
updateNode("item:crown-of-forbidden-rites", {
  slots: ["Head"], ac: 19, stats: { str: 2, wis: 3 }, mana: 35,
  resists: { fire: 2, magic: 3, poison: 2 }, weight: 5.5, size: "Small", magic: true, noTrade: true,
});
updateNode("item:breastplate-of-forbidden-rites", {
  slots: ["Chest"], ac: 42, stats: { dex: 5, sta: 7, wis: 13 }, hp: 30, mana: 80,
  resists: { disease: 5, cold: 5, magic: 7 },
  effect: "Mark of Karn (Must Equip, Casting Time: 9.0) at Level 46",
  weight: 8.0, size: "Large", magic: true, noTrade: true,
});
updateNode("item:vambraces-of-forbidden-rites", {
  slots: ["Arms"], ac: 19, stats: { dex: 3, wis: 2 }, hp: 35,
  weight: 6.0, size: "Small", magic: true, noTrade: true,
});
updateNode("item:bracers-of-forbidden-rites", {
  slots: ["Wrist"], ac: 15, stats: { wis: 2, agi: 5 }, hp: 35,
  resists: { fire: 2 },
  effect: "Abundant Food (Must Equip, Casting Time: 10.0)",
  weight: 3.5, size: "Small", magic: true, noTrade: true,
});
updateNode("item:gauntlets-of-forbidden-rites", {
  slots: ["Hands"], ac: 15, stats: { cha: 7, agi: 2 }, mana: 40,
  resists: { magic: 2, poison: 1 }, weight: 4.5, size: "Small", magic: true, noTrade: true,
});
updateNode("item:greaves-of-forbidden-rites", {
  slots: ["Legs"], ac: 24, stats: { wis: 10 }, hp: 80, mana: 40,
  resists: { cold: 3 },
  effect: "Word of Health (Must Equip, Casting Time: 12.0)",
  weight: 7.0, size: "Large", magic: true, noTrade: true,
});
updateNode("item:boots-of-forbidden-rites", {
  slots: ["Feet"], ac: 21, stats: { str: 2, sta: 5 },
  resists: { fire: 1, cold: 1, magic: 1 },
  effect: "Abundant Drink (Must Equip, Casting Time: 10.0)",
  weight: 6.0, size: "Medium", magic: true, noTrade: true,
});

// --- Bard Kael Armor Quests: Troubadour's set (also fixes placeholder labels) ---
updateNode("item:kael-bard-helm", {
  label: "Troubadour's Helm",
  slots: ["Head"], ac: 27, stats: { str: 6, sta: 2, cha: 5 }, hp: 30,
  resists: { fire: 1, disease: 1, cold: 1, magic: 1, poison: 1 },
  weight: 5.5, size: "Small", magic: true, noTrade: true,
});
updateNode("item:kael-bard-breastplate", {
  label: "Troubadour's Breastplate",
  slots: ["Chest"], ac: 54, stats: { str: 14, cha: 10, agi: 10 }, hp: 50,
  resists: { fire: 2, disease: 2, cold: 2, magic: 8, poison: 2 },
  effect: "Selo's Song of Travel (Any Slot/Can Equip, Casting Time: 5.5) at Level 46",
  weight: 9.0, size: "Large", magic: true, noTrade: true,
});
updateNode("item:kael-bard-vambraces", {
  label: "Troubadour's Vambraces",
  slots: ["Arms"], ac: 29, stats: { str: 4, dex: 4, cha: 4, agi: 3 }, hp: 20,
  resists: { fire: 1, disease: 1, cold: 1, magic: 1, poison: 1 },
  weight: 6.0, size: "Small", magic: true, noTrade: true,
});
updateNode("item:kael-bard-bracer", {
  label: "Troubadour's Bracer",
  slots: ["Wrist"], ac: 21, stats: { str: 3, agi: 3 }, resists: { magic: 3 },
  weight: 3.5, size: "Small", magic: true, noTrade: true,
});
updateNode("item:kael-bard-gauntlets", {
  label: "Troubadour's Gauntlets",
  slots: ["Hands"], ac: 21, stats: { str: 2, dex: 1, cha: 5, agi: 1 }, hp: 15,
  resists: { fire: 1, cold: 1, magic: 1 }, weight: 4.5, size: "Small", magic: true, noTrade: true,
});
updateNode("item:kael-bard-greaves", {
  label: "Troubadour's Greaves",
  slots: ["Legs"], ac: 36, stats: { str: 10, dex: 5, sta: 5, cha: 4, agi: 5 }, hp: 60,
  resists: { fire: 2, disease: 2, cold: 2, magic: 2, poison: 2 },
  weight: 7.0, size: "Large", magic: true, noTrade: true,
});
updateNode("item:kael-bard-boots", {
  label: "Troubadour's Boots",
  slots: ["Feet"], ac: 25, stats: { str: 3, cha: 5 },
  weight: 6.0, size: "Medium", magic: true, noTrade: true,
});

// --- Bard Skyshrine Armor Quests: Twilight set ---
updateNode("item:helm-of-twilight", {
  slots: ["Head"], ac: 22, stats: { dex: 5, sta: 5, cha: 5 }, hp: 45,
  resists: { fire: 3, disease: 3, cold: 3, magic: 3, poison: 3 },
  weight: 5.5, size: "Small", magic: true, noTrade: true,
});
updateNode("item:breastplate-of-twilight", {
  slots: ["Chest"], ac: 50, stats: { str: 11, sta: 11, cha: 11, agi: 11 }, hp: 60,
  resists: { fire: 5, disease: 5, cold: 5, magic: 10, poison: 5 },
  effect: "Selo's Song of Travel (Must Equip, Casting Time: 5.5) at Level 46",
  weight: 9.0, size: "Large", magic: true, noTrade: true,
});
updateNode("item:vambraces-of-twilight", {
  slots: ["Arms"], ac: 25, stats: { str: 5, sta: 4, cha: 4 }, hp: 20,
  resists: { fire: 4, disease: 4, cold: 4, magic: 4, poison: 4 },
  weight: 6.0, size: "Small", magic: true, noTrade: true,
});
updateNode("item:bracer-of-twilight", {
  slots: ["Wrist"], ac: 18, stats: { str: 3, sta: 2, agi: 5 },
  resists: { fire: 1, disease: 1, cold: 1, magic: 5, poison: 1 },
  weight: 3.5, size: "Small", magic: true, noTrade: true,
});
updateNode("item:gauntlets-of-twilight", {
  slots: ["Hands"], ac: 17, stats: { str: 4, dex: 3, sta: 3, cha: 3, agi: 3 }, hp: 15,
  resists: { fire: 2, cold: 2, magic: 2 }, weight: 4.5, size: "Small", magic: true, noTrade: true,
});
updateNode("item:greaves-of-twilight", {
  slots: ["Legs"], ac: 31, stats: { str: 7, dex: 7, sta: 7, cha: 5, agi: 7 }, hp: 60,
  resists: { fire: 3, disease: 3, cold: 3, magic: 3, poison: 3 },
  weight: 7.0, size: "Large", magic: true, noTrade: true,
});
updateNode("item:boots-of-twilight", {
  slots: ["Feet"], ac: 22, stats: { str: 4, cha: 4 },
  resists: { fire: 2, cold: 2, magic: 3 }, weight: 6.0, size: "Medium", magic: true, noTrade: true,
});

// --- Bard Thurgadin Armor Quests: Resonant set ---
updateNode("item:resonant-helm", {
  slots: ["Head"], ac: 19, stats: { str: 5, agi: 5 }, hp: 30,
  resists: { fire: 1, disease: 1, cold: 1, magic: 1, poison: 1 },
  weight: 5.5, size: "Small", magic: true, noTrade: true,
});
updateNode("item:resonant-breastplate", {
  slots: ["Chest"], ac: 42, stats: { str: 8, dex: 10, sta: 10, cha: 10 }, hp: 50,
  resists: { fire: 2, disease: 2, cold: 2, magic: 8, poison: 2 },
  effect: "Selo's Song of Travel (Any Slot/Can Equip, Casting Time: 5.5) at Level 46",
  weight: 9.0, size: "Large", magic: true, noTrade: true,
});
updateNode("item:resonant-vambraces", {
  slots: ["Arms"], ac: 19, stats: { str: 4, sta: 3, agi: 4 }, hp: 20,
  resists: { fire: 1, disease: 1, cold: 1, magic: 1, poison: 1 },
  weight: 6.0, size: "Small", magic: true, noTrade: true,
});
updateNode("item:resonant-bracer", {
  slots: ["Wrist"], ac: 15, stats: { cha: 2, agi: 3 }, resists: { magic: 2 },
  weight: 3.5, size: "Small", magic: true, noTrade: true,
});
updateNode("item:resonant-gauntlets", {
  slots: ["Hands"], ac: 14, stats: { str: 2, dex: 1, cha: 3, agi: 1 }, hp: 15,
  resists: { fire: 1, cold: 1, magic: 1 }, weight: 4.5, size: "Small", magic: true, noTrade: true,
});
updateNode("item:resonant-greaves", {
  slots: ["Legs"], ac: 24, stats: { str: 5, dex: 5, sta: 4, cha: 5, agi: 4 }, hp: 60,
  resists: { fire: 2, disease: 2, cold: 2, magic: 2, poison: 2 },
  weight: 7.0, size: "Large", magic: true, noTrade: true,
});
updateNode("item:resonant-boots", {
  slots: ["Feet"], ac: 19, stats: { str: 2, cha: 3 },
  weight: 6.0, size: "Medium", magic: true, noTrade: true,
});

// --- Cleric Plane of Sky Tests item rewards ---
updateNode("item:truewind-earring", {
  slots: ["Ear"], stats: { dex: 5, wis: 9 }, resists: { cold: 10 },
  weight: 0.1, size: "Tiny", magic: true, lore: true, noTrade: true,
});
updateNode("item:aegis-of-the-wind", {
  slots: ["Secondary"], ac: 25, stats: { wis: 9 }, mana: 60,
  resists: { disease: 10 }, weight: 9.5, size: "Large", magic: true, lore: true, noTrade: true,
});
updateNode("item:pauldrons-of-piety", {
  slots: ["Shoulders"], ac: 11, stats: { sta: 8, cha: 2, wis: 12 }, mana: 35,
  weight: 4.5, size: "Small", magic: true, lore: true, noTrade: true,
});
updateNode("item:necklace-of-resolution", {
  slots: ["Neck"], ac: 4, stats: { str: 5, wis: 7 }, hp: 30, mana: 15,
  effect: "Promised Renewal (Must Equip, Casting Time: Instant) at Level 45",
  weight: 0.1, size: "Tiny", magic: true, lore: true, noTrade: true,
});
updateNode("item:theurgist-s-star", {
  slots: ["Primary"], skill: "1H Blunt", damage: 15, delay: 25,
  stats: { wis: 10 }, mana: 40, resists: { disease: 25, poison: 25 },
  effect: "Blessing of the Theurgist (Combat, Casting Time: Instant) at Level 50",
  weight: 4.0, size: "Medium", magic: true, lore: true, noTrade: true,
});
updateNode("item:truwian-baton", {
  slots: ["Primary"], ac: 25, stats: { str: 10, wis: 15 }, mana: 75,
  damage: 1, delay: 40, skill: "2H Blunt",
  effect: "Resurrection (Must Equip, Casting Time: Instant) at Level 49",
  weight: 8.0, size: "Medium", magic: true, lore: true, noTrade: true,
});

save();
console.log("Migration 354 complete: backfilled stats for 48 Cleric/Bard armor + Cleric PoS Test item nodes");
