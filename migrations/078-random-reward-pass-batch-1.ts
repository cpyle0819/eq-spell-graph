/**
 * Migration 078: first batch of the "random-reward followup" sweep
 * (random-reward-followup.md) -- quests whose description names a random
 * item/spell reward that was never modeled as item/spell nodes at all, so
 * there was nothing for migrations 074-077 to tag. Each reward pool below
 * was re-verified against the quest's own eqlwiki.com page (and each new
 * item's own page) per decisions/eqlwiki-quest-research-method.md.
 *
 * - A Job for Nanrum: the wiki's reward line only says "da shiny... random
 *   low-level gems and other vendor fodder," but the quest's own `steps`
 *   (predating this migration) already names the four -- Cat's Eye Agate,
 *   Chunk of Metal Ore, Hematite, Turquoise -- as the *other* half of the
 *   pool alongside the already-tagged Brass/Silver Earring, so those four
 *   join the existing "a-job-for-nanrum-drop" randomGroup rather than
 *   starting a new one.
 * - Bandit Sisters: 8 named armor pieces confirmed on the wiki page.
 * - Bracers of Erollisi Quest and Pirate Earrings: both given by Styria
 *   Fearnon at the same Ocean of Tears location with the same faction
 *   changes, and both wiki pages list the identical 4-item trinket pool
 *   (Aviak Feather, Fishing Spear, Kiola Nut, Conch Shell) -- confirmed via
 *   a full verbatim refetch of both pages, not assumed from the overlap.
 *   They're two separate quests (different turn-in item) sharing one
 *   reward table, so each gets its own randomGroup over the same targets.
 *
 * Bozinite Pestle Quest ("a random mage spell") is NOT included -- its wiki
 * page states the reward only as "a random mage spell" with no options
 * enumerated anywhere on the page, so there's nothing concrete to model yet
 * (left in random-reward-followup.md for a future pass, same as Nillipuss
 * the Brownie's non-enumerable pool).
 */

import { loadGraph } from "./_lib";

const { graph, addNode, addEdge, save } = loadGraph(import.meta.dir);

// -- A Job for Nanrum: raw gem/ore half of the existing earring pool --
addNode({ id: "item:cat-s-eye-agate", label: "Cat's Eye Agate", type: "item", weight: 0.1, size: "Tiny", source: "A Job for Nanrum reward (Basher Nanrum, Grobb); also a common tradeskill/jewelcrafting ingredient" });
addNode({ id: "item:chunk-of-metal-ore", label: "Chunk of Metal Ore", type: "item", weight: 4.0, size: "Small", source: "A Job for Nanrum reward (Basher Nanrum, Grobb)" });
addNode({ id: "item:hematite", label: "Hematite", type: "item", weight: 0.1, size: "Tiny", source: "A Job for Nanrum reward (Basher Nanrum, Grobb); also a common tradeskill/jewelcrafting ingredient" });
addNode({ id: "item:turquoise", label: "Turquoise", type: "item", weight: 0.1, size: "Tiny", source: "A Job for Nanrum reward (Basher Nanrum, Grobb); also a common tradeskill/jewelcrafting ingredient" });

for (const id of ["item:cat-s-eye-agate", "item:chunk-of-metal-ore", "item:hematite", "item:turquoise"]) {
  addEdge("quest:a-job-for-nanrum", id, "rewards", { randomGroup: "a-job-for-nanrum-drop" });
}

// -- Bandit Sisters: 8-piece random armor pool --
const NON_CASTER_CLASSES = ["bard", "beastlord", "berserker", "cleric", "druid", "monk", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"];

addNode({ id: "item:leather-belt", label: "Leather Belt", type: "item", slots: ["Waist"], ac: 3, classes: NON_CASTER_CLASSES, weight: 1.0, size: "Small", source: "Bandit Sisters reward (drunkard, Kelethin); part of the Leather Armor Set" });
addNode({ id: "item:leather-leggings", label: "Leather Leggings", type: "item", slots: ["Legs"], ac: 5, classes: NON_CASTER_CLASSES, weight: 4.0, size: "Medium", source: "Bandit Sisters reward (drunkard, Kelethin); part of the Leather Armor Set" });
addNode({ id: "item:leather-shoulderpads", label: "Leather Shoulderpads", type: "item", slots: ["Shoulders"], ac: 3, classes: NON_CASTER_CLASSES, weight: 1.5, size: "Small", source: "Bandit Sisters reward (drunkard, Kelethin); part of the Leather Armor Set" });
addNode({ id: "item:targ-shield", label: "Targ Shield", type: "item", slots: ["Secondary"], ac: 7, classes: ["warrior", "cleric", "paladin", "ranger", "shadow knight", "bard", "rogue", "shaman"], weight: 7.5, size: "Medium", source: "Bandit Sisters reward (drunkard, Kelethin); also craftable via Blacksmithing" });
addNode({ id: "item:small-leather-gorget", label: "Small Leather Gorget", type: "item", slots: ["Neck"], ac: 3, classes: NON_CASTER_CLASSES, weight: 0.4, size: "Small", source: "Bandit Sisters reward (drunkard, Kelethin)" });
addNode({ id: "item:small-leather-mask", label: "Small Leather Mask", type: "item", slots: ["Face"], ac: 2, classes: NON_CASTER_CLASSES, weight: 0.3, size: "Small", source: "Bandit Sisters reward (drunkard, Kelethin); also drops from Whimsy Larktwitter in Lesser Faydark" });
addNode({ id: "item:small-leather-shoulderpads", label: "Small Leather Shoulderpads", type: "item", slots: ["Shoulders"], ac: 3, classes: NON_CASTER_CLASSES, weight: 1.1, size: "Small", source: "Bandit Sisters reward (drunkard, Kelethin)" });

for (const id of [
  "item:bearskin-gloves",
  "item:leather-belt",
  "item:leather-leggings",
  "item:leather-shoulderpads",
  "item:targ-shield",
  "item:small-leather-gorget",
  "item:small-leather-mask",
  "item:small-leather-shoulderpads",
]) {
  addEdge("quest:bandit-sisters", id, "rewards", { randomGroup: "bandit-sisters-drop" });
}

// -- Bracers of Erollisi Quest / Pirate Earrings: shared Styria Fearnon trinket pool --
addNode({ id: "item:aviak-feather", label: "Aviak Feather", type: "item", weight: 0.5, size: "Small", source: "Bracers of Erollisi Quest / Pirate Earrings reward (Styria Fearnon, Ocean of Tears); also a Minor Summoning: Air tradeskill ingredient" });
addNode({ id: "item:kiola-nut", label: "Kiola Nut", type: "item", weight: 0.5, size: "Small", source: "Bracers of Erollisi Quest / Pirate Earrings reward (Styria Fearnon, Ocean of Tears)" });
addNode({ id: "item:conch-shell", label: "Conch Shell", type: "item", weight: 0.5, size: "Tiny", source: "Bracers of Erollisi Quest / Pirate Earrings reward (Styria Fearnon, Ocean of Tears)" });

for (const id of ["item:aviak-feather", "item:fishing-spear", "item:kiola-nut", "item:conch-shell"]) {
  addEdge("quest:bracers-of-erollisi-quest", id, "rewards", { randomGroup: "bracers-of-erollisi-quest-drop" });
  addEdge("quest:pirate-earrings", id, "rewards", { randomGroup: "pirate-earrings-drop" });
}

// item:fishing-spear predates this migration with only a `slots` field; the
// Pirate Earrings wiki page's infobox has its full stat line, so fill in
// the gaps without touching its existing `source` (a different quest already owns it).
const fishingSpear = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "item:fishing-spear");
if (fishingSpear) {
  Object.assign(fishingSpear.data, {
    skill: "Piercing",
    damage: 5,
    delay: 32,
    classes: ["warrior", "ranger", "shadow knight", "bard", "rogue", "shaman"],
    weight: 5.0,
    size: "Medium",
  });
}

save();
console.log("Migration 078 complete: modeled random-reward pools for A Job for Nanrum, Bandit Sisters, Bracers of Erollisi Quest, and Pirate Earrings");
