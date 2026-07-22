/**
 * Migration 100: models "Darkforge Armor Quests" from GitHub issue #26's
 * "Quest Groups" tracking section -- a 7-piece Shadow Knight armor set,
 * two undead knight givers in the Temple of Solusek Ro (left NPC makes
 * Helm/Breastplate/Vambraces/Bracer, right NPC makes Gauntlets/Greaves/
 * Boots), same unordered quest_group shape as migration 099's Crafted
 * Armor Quests (decisions/quest-group-node-type.md). Researched directly
 * against eqlwiki.com, following decisions/eqlwiki-quest-research-method.md.
 *
 * Neither NPC has a proper name on the wiki page -- both are called "an
 * undead knight," distinguished only by which side of the room they stand
 * on and which pieces they make -- so they're modeled as
 * npc:temple-of-solusek-ro:an-undead-knight-left/-right, following the
 * "an-" descriptive-id convention already used for other nameless givers
 * (e.g. migration 093's "an undead foreman").
 *
 * The wiki states the armor "could not originally be used by Iksar, but
 * this racial restriction has been removed" -- unlike migration 099's
 * Crafted Armor Quests (which still excludes Iksar), no race field is set
 * here, matching this graph's "empty/absent = everyone" convention.
 *
 * No new zone needed -- Temple of Solusek Ro already exists in the graph.
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, addGiver, save, slug } = loadGraph(import.meta.dir);

const zoneId = "zone:temple-of-solusek-ro";
const leftId = "npc:temple-of-solusek-ro:an-undead-knight-left";
const rightId = "npc:temple-of-solusek-ro:an-undead-knight-right";
addGiver(leftId, "An Undead Knight (Left)", zoneId);
addGiver(rightId, "An Undead Knight (Right)", zoneId);

const groupId = "quest_group:darkforge-armor-quests";
addNode({
  id: groupId,
  label: "Darkforge Armor Quests",
  type: "quest_group",
  classes: ["shadow knight"],
  minLevel: 33,
  description:
    "Two undead knights in the Temple of Solusek Ro each trade a set of quest items for one piece of Darkforge armor. Seven independent sub-quests, no ordering between them (the left knight has four pieces, the right knight has three).",
  wiki_title: "Darkforge Armor Quests",
});
addEdge(leftId, groupId, "starts");
addEdge(rightId, groupId, "starts");
addEdge(groupId, zoneId, "located_in");

const pieces = [
  { label: "Helm", giverId: leftId, giverLabel: "An Undead Knight (Left)", items: "a Decayed Helm, a Decayed Visor, and 2 Damaged Militia Helms", reward: "Darkforge Helm", slots: ["Head"], ac: 13, stats: { int: 5 }, resists: { fire: 5, disease: 5, cold: 5, magic: 5, poison: 5 }, weight: 3.0 },
  { label: "Breastplate", giverId: leftId, giverLabel: "An Undead Knight (Left)", items: "a Decayed Chainmail, a Decayed Breastplate, and 2 Enchanted Platinum Bars", reward: "Darkforge Breastplate", slots: ["Chest"], ac: 20, stats: { sta: 10 }, resists: { magic: 3 }, weight: 5.0 },
  { label: "Vambraces", giverId: leftId, giverLabel: "An Undead Knight (Left)", items: "a Decayed Left Vambrace, a Decayed Right Vambrace, and a Qeynos Kite Shield", reward: "Darkforge Vambraces", slots: ["Arms"], ac: 11, stats: { str: 4 }, weight: 3.2 },
  { label: "Bracer", giverId: leftId, giverLabel: "An Undead Knight (Left)", items: "a Decayed Left Bracer, a Decayed Right Bracer, and a Broken Minotaur Lord's Horn", reward: "Darkforge Bracer", slots: ["Wrist"], ac: 9, stats: { dex: 3 }, weight: 2.0 },
  { label: "Gauntlets", giverId: rightId, giverLabel: "An Undead Knight (Right)", items: "a Decayed Left Gauntlet, a Decayed Right Gauntlet, and an Enchanted Platinum Bar", reward: "Darkforge Gauntlets", slots: ["Hands"], ac: 12, stats: { dex: 2 }, resists: { magic: 5 }, weight: 2.5 },
  { label: "Greaves", giverId: rightId, giverLabel: "An Undead Knight (Right)", items: "a Decayed Left Legplate, a Decayed Right Legplate, and 2 Melatite", reward: "Darkforge Greaves", slots: ["Legs"], ac: 13, stats: { sta: 9 }, resists: { magic: 3 }, weight: 3.7 },
  { label: "Boots", giverId: rightId, giverLabel: "An Undead Knight (Right)", items: "a Decayed Left Boot, a Decayed Right Boot, and 2 Fairy Dust", reward: "Darkforge Boots", slots: ["Feet"], ac: 11, stats: { sta: 3 }, weight: 1.5 },
] as const;

for (const piece of pieces) {
  const questId = `quest:darkforge-armor-quests-${slug(piece.label)}`;
  addNode({
    id: questId,
    label: `Darkforge Armor Quests: ${piece.label}`,
    type: "quest",
    classes: ["shadow knight"],
    minLevel: 33,
    description: `Turn in ${piece.items} to ${piece.giverLabel} in the Temple of Solusek Ro for the ${piece.reward}.`,
    steps: [`Gather ${piece.items}`, `Turn them in to ${piece.giverLabel} in the Temple of Solusek Ro`],
    wiki_title: "Darkforge Armor Quests",
  });
  addEdge(piece.giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, groupId, "member_of");

  const rewardId = `item:${slug(piece.reward)}`;
  addNode({
    id: rewardId,
    label: piece.reward,
    type: "item",
    classes: ["shadow knight"],
    slots: piece.slots,
    magic: true,
    ac: piece.ac,
    stats: piece.stats,
    ...("resists" in piece ? { resists: piece.resists } : {}),
    weight: piece.weight,
    source: `Darkforge Armor Quests: ${piece.label} reward (${piece.giverLabel}, Temple of Solusek Ro)`,
  });
  addEdge(questId, rewardId, "rewards");
}

save();

console.log(
  "Migration 100 complete: added Darkforge Armor Quests as a 7-piece quest_group (an undead knight (left) x4, an undead knight (right) x3, Temple of Solusek Ro)."
);
