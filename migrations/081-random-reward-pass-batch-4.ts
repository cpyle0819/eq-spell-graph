/**
 * Migration 081: fourth batch of the "random-reward followup" sweep
 * (random-reward-followup.md). Each reward pool re-verified against the
 * quest's own eqlwiki.com page (and each new item/spell's own page) per
 * decisions/eqlwiki-quest-research-method.md.
 *
 * - Ivan McMannus' Remains: "random minor item" resolves to a 2-item pool
 *   (Purse, Wrist Pouch) -- both confirmed under the page's own "Reward"
 *   heading. Wrist Pouch already modeled; Purse is a new node (distinct
 *   from the already-modeled Wenglawks Manly Purse).
 * - Karana Clovers: only the Polar Bear Cloak (already modeled) is a named
 *   item on the page -- "Low-level Shaman Spells" and "low-level leather
 *   gear" are never enumerated anywhere on the page, so per
 *   decisions/quest-reward-modeling.md's non-exhaustive-pool rule, only the
 *   Polar Bear Cloak gets a randomGroup edge; the hedge stays in the
 *   quest's existing description prose.
 * - Karana's Blessing: unhedged 4-spell pool (Center, Root, Soothe, Hammer
 *   of Wrath), all already in the spell corpus.
 * - Kobold Killing: "random piece of Medium Raw-hide Armor" links straight
 *   to the same Raw-hide Armor Set already fully modeled in migration 080
 *   (Help Hergor Get Fatter) -- no new nodes, just reward edges to all 12
 *   existing pieces.
 * - Kobold Molars (Evil): "random ringmail armor piece" links to the
 *   Ringmail Armor Set's own page -- a generic 12-piece set distinct from
 *   the Faydark-specific Ringmail Armor already modeled in migration 080
 *   (no CHA bonus, different weights/sizes, plain "Ringmail" naming).
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, save } = loadGraph(import.meta.dir);

// -- Ivan McMannus' Remains: Purse / Wrist Pouch --
addNode({ id: "item:purse", label: "Purse", type: "item", slots: ["Secondary"], weight: 0.2, size: "Small", capacity: 4, source: "Ivan McMannus' Remains reward (Renth McLanis, Halas); also sold by numerous merchants" });

const ivanMcMannusPool = ["item:purse", "item:wrist-pouch"];
for (const id of ivanMcMannusPool) {
  addEdge("quest:ivan-mcmannus-remains", id, "rewards", { randomGroup: "ivan-mcmannus-remains-drop" });
}

// -- Karana Clovers: only Polar Bear Cloak is a named, confirmable option --
addEdge("quest:karana-clovers", "item:polar-bear-cloak", "rewards", { randomGroup: "karana-clovers-drop" });

// -- Karana's Blessing: unhedged 4-spell pool --
const karanasBlessingPool = ["spell:center", "spell:root", "spell:soothe", "spell:hammer-of-wrath"];
for (const id of karanasBlessingPool) {
  addEdge("quest:karanas-blessing", id, "rewards", { randomGroup: "karanas-blessing-drop" });
}

// -- Kobold Killing: same Raw-hide Armor Set modeled in migration 080 --
const kobolKillingPool = [
  "item:raw-hide-belt",
  "item:raw-hide-boots",
  "item:raw-hide-cloak",
  "item:raw-hide-gloves",
  "item:raw-hide-gorget",
  "item:raw-hide-mask",
  "item:raw-hide-shoulderpads",
  "item:raw-hide-skullcap",
  "item:raw-hide-sleeves",
  "item:raw-hide-tunic",
  "item:raw-hide-wristbands",
];
for (const id of kobolKillingPool) {
  addEdge("quest:kobold-killing", id, "rewards", { randomGroup: "kobold-killing-drop" });
}
// item:raw-hide-leggings is part of the same set (AC 5, Legs slot) but its
// only recorded source is Cindl's Wristband Collection -- still the same
// item, so it joins this pool too.
addEdge("quest:kobold-killing", "item:raw-hide-leggings", "rewards", { randomGroup: "kobold-killing-drop" });

// -- Kobold Molars (Evil): Ringmail Armor Set (generic, distinct from Faydark Ringmail) --
const RINGMAIL_CLASSES = ["warrior", "cleric", "paladin", "ranger", "shadow knight", "bard", "rogue", "shaman"];
const ringmailSource = "Kobold Molars (Evil) reward (Royal Guard Lilkus, Paineel Palace)";

addNode({ id: "item:ringmail-boots", label: "Ringmail Boots", type: "item", slots: ["Feet"], ac: 5, weight: 6.7, size: "Medium", classes: RINGMAIL_CLASSES, source: ringmailSource });
addNode({ id: "item:ringmail-bracelet", label: "Ringmail Bracelet", type: "item", slots: ["Wrist"], ac: 5, weight: 2.7, size: "Small", classes: RINGMAIL_CLASSES, source: ringmailSource });
addNode({ id: "item:ringmail-cape", label: "Ringmail Cape", type: "item", slots: ["Back"], ac: 6, weight: 4.0, size: "Large", classes: RINGMAIL_CLASSES, source: ringmailSource });
addNode({ id: "item:ringmail-coat", label: "Ringmail Coat", type: "item", slots: ["Chest"], ac: 12, weight: 10.0, size: "Medium", classes: RINGMAIL_CLASSES, source: ringmailSource });
addNode({ id: "item:ringmail-coif", label: "Ringmail Coif", type: "item", slots: ["Head"], ac: 7, weight: 6.0, size: "Small", classes: RINGMAIL_CLASSES, source: ringmailSource });
addNode({ id: "item:ringmail-gloves", label: "Ringmail Gloves", type: "item", slots: ["Hands"], ac: 6, weight: 5.3, size: "Small", classes: RINGMAIL_CLASSES, source: ringmailSource });
addNode({ id: "item:ringmail-mantle", label: "Ringmail Mantle", type: "item", slots: ["Shoulders"], ac: 5, weight: 4.7, size: "Small", classes: RINGMAIL_CLASSES, source: ringmailSource });
addNode({ id: "item:ringmail-neckguard", label: "Ringmail Neckguard", type: "item", slots: ["Neck"], ac: 5, weight: 2.7, size: "Small", classes: RINGMAIL_CLASSES, source: ringmailSource });
addNode({ id: "item:ringmail-pants", label: "Ringmail Pants", type: "item", slots: ["Legs"], ac: 7, weight: 7.3, size: "Medium", classes: RINGMAIL_CLASSES, source: ringmailSource });
addNode({ id: "item:ringmail-skirt", label: "Ringmail Skirt", type: "item", slots: ["Waist"], ac: 5, weight: 3.3, size: "Small", classes: RINGMAIL_CLASSES, source: ringmailSource });
addNode({ id: "item:ringmail-sleeves", label: "Ringmail Sleeves", type: "item", slots: ["Arms"], ac: 6, weight: 4.7, size: "Small", classes: RINGMAIL_CLASSES, source: ringmailSource });
addNode({ id: "item:ringmail-visor", label: "Ringmail Visor", type: "item", slots: ["Face"], ac: 3, weight: 1.1, size: "Small", classes: RINGMAIL_CLASSES, source: ringmailSource });

const ringmailPool = [
  "item:ringmail-boots",
  "item:ringmail-bracelet",
  "item:ringmail-cape",
  "item:ringmail-coat",
  "item:ringmail-coif",
  "item:ringmail-gloves",
  "item:ringmail-mantle",
  "item:ringmail-neckguard",
  "item:ringmail-pants",
  "item:ringmail-skirt",
  "item:ringmail-sleeves",
  "item:ringmail-visor",
];
for (const id of ringmailPool) {
  addEdge("quest:kobold-molars-evil", id, "rewards", { randomGroup: "kobold-molars-evil-drop" });
}

save();
console.log("Migration 081 complete: modeled random-reward pools for Ivan McMannus' Remains, Karana Clovers, Karana's Blessing, Kobold Killing, and Kobold Molars (Evil)");
