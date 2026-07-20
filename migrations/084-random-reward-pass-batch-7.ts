/**
 * Migration 084: seventh (and final) batch of the "random-reward followup"
 * sweep (random-reward-followup.md). Each reward pool re-verified against
 * the quest's own eqlwiki.com page (and each new item's own page) per
 * decisions/eqlwiki-quest-research-method.md.
 *
 * - Nillipuss the Brownie: the quest's own description called this "random
 *   magic item (earrings, amulets, pouches, wands, rings, and others)" --
 *   but the wiki page's own Reward section enumerates a closed, unhedged
 *   16-item table (confirmed by re-checking the exact closing sentence:
 *   "You may also randomly receive one of several items (listed above)" --
 *   "(listed above)" bounds the pool to the table itself, unlike Karana
 *   Clovers' "and several others" which pointed at unlisted items). 15 new
 *   item nodes; Earring of Fire Reflection already existed.
 * - Odus Pearls: unhedged 4-item pool named on the quest's own page.
 *   Patchwork Sleeves and Worn Great Staff already modeled; Small Bag and
 *   Tattered Skullcap are new nodes.
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, save } = loadGraph(import.meta.dir);

// -- Nillipuss the Brownie: closed 16-item pool --
const nillipussSource = "Nillipuss the Brownie reward (Reebo Leafsway, Rivervale)";

addNode({ id: "item:anti-poison-amulet", label: "Anti-Poison Amulet", type: "item", slots: ["Neck"], resists: { poison: 15 }, weight: 0.1, size: "Small", magic: true, source: nillipussSource });
addNode({ id: "item:arrow-of-contagion", label: "Arrow of Contagion", type: "item", slots: ["Ammo"], damage: 4, classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"], weight: 0.1, size: "Small", magic: true, source: nillipussSource });
addNode({ id: "item:arrow-of-frost", label: "Arrow of Frost", type: "item", slots: ["Ammo"], damage: 4, classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"], weight: 0.1, size: "Small", magic: true, source: nillipussSource });
addNode({ id: "item:compass", label: "Compass", type: "item", weight: 0.1, size: "Tiny", magic: true, source: nillipussSource });
addNode({ id: "item:earring-of-disease-reflection", label: "Earring of Disease Reflection", type: "item", slots: ["Ear"], ac: 1, resists: { disease: 5 }, weight: 0.0, size: "Tiny", magic: true, source: nillipussSource + "; also drops from Drelzna (Najena) and an erudite madman (Erud's Crossing)" });
addNode({ id: "item:earring-of-frost-reflection", label: "Earring of Frost Reflection", type: "item", slots: ["Ear"], ac: 1, resists: { cold: 5 }, weight: 0.0, size: "Tiny", magic: true, source: nillipussSource + "; also drops from an erudite madman (Erud's Crossing)" });
addNode({ id: "item:earring-of-magic-reflection", label: "Earring of Magic Reflection", type: "item", slots: ["Ear"], ac: 1, resists: { magic: 5 }, weight: 0.0, size: "Tiny", magic: true, source: nillipussSource + "; also drops from an erudite madman (Erud's Crossing)" });
addNode({ id: "item:earring-of-poison-reflection", label: "Earring of Poison Reflection", type: "item", slots: ["Ear"], ac: 1, resists: { poison: 5 }, weight: 0.0, size: "Tiny", magic: true, source: nillipussSource });
addNode({ id: "item:eye-of-disvan", label: "Eye of Disvan", type: "item", weight: 0.1, size: "Tiny", magic: true, source: nillipussSource });
addNode({ id: "item:pierces-pouch-of-storing", label: "Pierce's Pouch of Storing", type: "item", weight: 0.4, capacity: 8, containerSize: "Large", source: nillipussSource });
addNode({ id: "item:rod-of-identification", label: "Rod of Identification", type: "item", slots: ["Primary", "Secondary"], effect: "Identify (Must Equip)", weight: 2.0, size: "Medium", source: nillipussSource });
addNode({ id: "item:runners-ring", label: "Runners Ring", type: "item", slots: ["Finger"], stats: { sta: 2, agi: 2 }, weight: 0.1, size: "Tiny", magic: true, source: nillipussSource });
addNode({ id: "item:travelers-pack", label: "Travelers Pack", type: "item", weight: 0.4, capacity: 8, containerSize: "Large", source: nillipussSource });
addNode({ id: "item:travelers-pouch", label: "Travelers Pouch", type: "item", weight: 0.4, capacity: 4, containerSize: "Small", source: nillipussSource + "; also drops from Nareja (Rathyl)" });
addNode({ id: "item:wand-of-frost-bolts", label: "Wand of Frost Bolts", type: "item", slots: ["Primary", "Secondary"], effect: "Shock of Frost (5 charges)", classes: ["necromancer", "wizard", "magician", "enchanter"], weight: 1.0, size: "Small", source: nillipussSource });

const nillipussPool = [
  "item:anti-poison-amulet",
  "item:arrow-of-contagion",
  "item:arrow-of-frost",
  "item:compass",
  "item:earring-of-disease-reflection",
  "item:earring-of-fire-reflection",
  "item:earring-of-frost-reflection",
  "item:earring-of-magic-reflection",
  "item:earring-of-poison-reflection",
  "item:eye-of-disvan",
  "item:pierces-pouch-of-storing",
  "item:rod-of-identification",
  "item:runners-ring",
  "item:travelers-pack",
  "item:travelers-pouch",
  "item:wand-of-frost-bolts",
];
for (const id of nillipussPool) {
  addEdge("quest:nillipuss-the-brownie", id, "rewards", { randomGroup: "nillipuss-the-brownie-drop" });
}

// -- Odus Pearls: unhedged 4-item pool, 2 new nodes --
const TATTERED_SKULLCAP_CLASSES = [
  "bard", "beastlord", "berserker", "cleric", "druid", "monk",
  "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior",
];
addNode({ id: "item:small-bag", label: "Small Bag", type: "item", weight: 0.5, capacity: 4, containerSize: "Medium", source: "Odus Pearls reward (Weligon Steelherder, Erudin)" });
addNode({ id: "item:tattered-skullcap", label: "Tattered Skullcap", type: "item", slots: ["Head"], ac: 3, classes: TATTERED_SKULLCAP_CLASSES, weight: 0.6, size: "Small", source: "Odus Pearls reward (Weligon Steelherder, Erudin)" });

const odusPearlsPool = [
  "item:patchwork-sleeves",
  "item:small-bag",
  "item:tattered-skullcap",
  "item:worn-great-staff",
];
for (const id of odusPearlsPool) {
  addEdge("quest:odus-pearls", id, "rewards", { randomGroup: "odus-pearls-drop" });
}

save();
console.log("Migration 084 complete: modeled random-reward pools for Nillipuss the Brownie and Odus Pearls");
