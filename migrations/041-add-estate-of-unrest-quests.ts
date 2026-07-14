/**
 * Migration 041: 3 quests off GitHub issue #26's checklist -- Harvester
 * Quest, Incandescent Armor Quests, Totemic Armor Quests. Researched
 * directly against eqlwiki.com (each quest's own page, plus reward and
 * turn-in items' pages), following decisions/eqlwiki-quest-research-method.md.
 *
 * Picked by working backwards from The Estate of Unrest's own NPC/item
 * roster (see its own wiki page) to find which unchecked checklist quests
 * actually touch that zone -- a fourth candidate, Brell Serilis Symbol
 * Quests, was ruled out: its giver (Bronlor Lightblade) is in South
 * Kaladim, a zone this graph doesn't have yet, matching the exact reason
 * migration 040 already skipped it.
 *
 * This batch is also why decisions/quest-reward-modeling.md's `located_in`
 * meaning changed: all three quests' givers sit elsewhere (Temple of
 * Solusek Ro, Lake Rathetear), with Unrest (and other zones) only ever
 * showing up as a farming stop for a reagent. The old rule (`located_in` =
 * giver's zone only, farming stops stay prose) would have added real
 * content but left Estate of Unrest's own Quests tab empty -- the whole
 * point of this pass. `located_in` is now "any zone a step sends the
 * player to for a required item or sub-turn-in," even when a zone is only
 * one of several valid options for that item -- the goal is surfacing
 * quests you might already be gathering for while in a given zone, not
 * just quests that demand an exclusive trip there. Every zone listed below
 * is a direct quote off the relevant item's own "drops from" wiki section,
 * not a guess. `starts_in` is the new, narrower edge for the actual
 * giver's zone, feeding the Quests UI's "Starts In" card same as before.
 *
 * Not chased for more `located_in` zones: purchased-for-coin components
 * (Fire Opal, Runes of Fortune, Enchanted Gloves, Gleaming Gloves) whose
 * vendor's own zone isn't stated on the quest page -- tracking down five
 * more NPCs' locations for one migration entry is disproportionate (same
 * restraint migration 037 used skipping Chalice of Conquest's 13-leg
 * fetch chain); left as prose.
 *
 * Harvester Quest: Fungus Eye (Estate of Unrest) and Shadowed Knife (Ocean
 * of Tears) are each single-sourced. Shadowed Scythe drops from "a
 * shadowed man" in four zones (West Commonlands, Lavastorm Mountains,
 * Lesser Faydark, Nektulos Forest) -- all four get edges under the
 * broadened rule. Fire Opal's other source, Oasis of Marr, gets one too.
 *
 * Incandescent Armor Quests: Glowing Mask (Upper Guk), Silver Wand (Temple
 * of Cazic Thule), and Pouch of Silver Dust (Estate of Unrest) are each
 * single-sourced. Glowing Gloves drops from "a shadowed man" in Lavastorm
 * Mountains, Lesser Faydark, Innothule Swamp, and West Commonlands -- all
 * four get edges too. Radiant Gloves' "Radiant" is already covered by the
 * Wand's Cazic Thule edge.
 *
 * Totemic Armor Quests: Totemic Boots' Terror Spines has two valid
 * sources, Najena and Estate of Unrest -- both get edges under the
 * broadened rule (this is the quest that prompted broadening it: an
 * earlier, stricter pass required an exclusive source and left Unrest
 * off). Chief's Tongue (Lesser Faydark, orc chief) gets one too. The other
 * 7 armor pieces (gauntlets, sleeves, leggings, bracers, breastplate,
 * helm, cloak) are compressed into `steps` rather than modeled as
 * individual item nodes -- same reasoning migration 040 used for Animal
 * Skin Armor and Armor of the Priest Quests (Armor-of-Ro-shaped: one page,
 * many sub-quests, and the wiki only gives aggregate full-set stats, not
 * an exact per-piece line to quote).
 *
 * Deliberately NOT modeled:
 * - Harvester Quest's negative faction (Shadowed Men worsens) -- `rewards`
 *   only models a positive reward (decisions/quest-reward-modeling.md).
 * - Incandescent Mask's "requires good faction to turn in" gate -- no field
 *   for a turn-in faction requirement distinct from a reward.
 * - era -- unset; none of these three quests' own pages state a content
 *   era tag.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

function hasNode(id: string): boolean {
  return graph.nodes.some((n: { data: { id: string } }) => n.data.id === id);
}

function addNode(data: Record<string, unknown>) {
  if (!hasNode(data.id as string)) graph.nodes.push({ data });
}

function hasEdge(source: string, target: string, type: string): boolean {
  return graph.edges.some(
    (e: { data: { source: string; target: string; type: string } }) =>
      e.data.source === source && e.data.target === target && e.data.type === type
  );
}

function addEdge(source: string, target: string, type: string) {
  if (hasEdge(source, target, type)) return;
  graph.edges.push({ data: { id: `e-${type}-${graph.edges.length + 1}`, source, target, type } });
}

function slug(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function addFactionReward(questId: string, label: string) {
  const id = `faction:${slug(label)}`;
  addNode({ id, label, type: "faction" });
  addEdge(questId, id, "rewards");
}

function addGiver(id: string, label: string, zoneId: string) {
  addNode({ id, label, type: "npc", roles: ["quest_giver"] });
  addEdge(id, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Harvester Quest
// ---------------------------------------------------------------------
{
  const solRoId = "zone:temple-of-solusek-ro";
  const unrestId = "zone:the-estate-of-unrest";
  const oceanId = "zone:ocean-of-tears";
  const westCommonsId = "zone:west-commonlands";
  const lavastormId = "zone:lavastorm-mountains";
  const lesserFaydarkId = "zone:lesser-faydark";
  const nektulosId = "zone:nektulos-forest";
  const oasisId = "zone:oasis-of-marr";
  const giverId = "npc:temple-of-solusek-ro:vurgo";
  addGiver(giverId, "Vurgo", solRoId);

  const questId = "quest:harvester-quest";
  addNode({
    id: questId,
    label: "Harvester Quest",
    type: "quest",
    description:
      "Vurgo in the Temple of Solusek Ro sends necromancers after a Shadowed Scythe, then a Fungus Eye, a Shadowed Knife, and a Fire Opal, in exchange for the Harvester.",
    classes: ["necromancer"],
    minLevel: 25,
    steps: [
      "Obtain a Shadowed Scythe from a shadowed man (found in West Commonlands, Lavastorm Mountains, Lesser Faydark, or Nektulos Forest) and give it to Vurgo",
      "Collect a Fungus Eye from a Mortuary Fungus in The Estate of Unrest and a Shadowed Knife from a goblin headmaster in Ocean of Tears",
      "Obtain a Fire Opal, either purchased for 550gp from Genni in the temple or as a drop in Oasis of Marr",
      "Turn in Vurgo's note plus the Fungus Eye, Shadowed Knife, and Fire Opal simultaneously",
    ],
    wiki_title: "The Harvester",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, solRoId, "starts_in");
  addEdge(questId, solRoId, "located_in");
  addEdge(questId, unrestId, "located_in");
  addEdge(questId, oceanId, "located_in");
  addEdge(questId, westCommonsId, "located_in");
  addEdge(questId, lavastormId, "located_in");
  addEdge(questId, lesserFaydarkId, "located_in");
  addEdge(questId, nektulosId, "located_in");
  addEdge(questId, oasisId, "located_in");

  const weaponId = "item:harvester";
  addNode({
    id: weaponId,
    label: "Harvester",
    type: "item",
    slots: ["Primary", "Secondary"],
    ac: 4,
    stats: { str: 5, int: 5, cha: -5 },
    effect: "Deadeye (Worn)",
    weight: 8.0,
    size: "Large",
    classes: ["necromancer"],
    magic: true,
    lore: true,
    source: "Harvester Quest reward (Vurgo, Temple of Solusek Ro)",
  });
  addEdge(questId, weaponId, "rewards");
  addFactionReward(questId, "Temple Of Sol Ro");
}

// ---------------------------------------------------------------------
// Incandescent Armor Quests
// ---------------------------------------------------------------------
{
  const solRoId = "zone:temple-of-solusek-ro";
  const gukId = "zone:upper-guk";
  const czId = "zone:temple-of-cazic-thule";
  const unrestId = "zone:the-estate-of-unrest";
  const lavastormId = "zone:lavastorm-mountains";
  const lesserFaydarkId = "zone:lesser-faydark";
  const innothuleId = "zone:innothule-swamp";
  const westCommonsId = "zone:west-commonlands";
  const giverId = "npc:temple-of-solusek-ro:sultin";
  addGiver(giverId, "Sultin", solRoId);

  const questId = "quest:incandescent-armor-quests";
  addNode({
    id: questId,
    label: "Incandescent Armor Quests",
    type: "quest",
    description:
      "Sultin in the Temple of Solusek Ro trades enchanters three separate item bundles for the Incandescent Mask, Incandescent Gloves, and Incandescent Wand.",
    classes: ["enchanter"],
    minLevel: 25,
    steps: [
      "Mask: obtain a Glowing Mask (a skeleton monk or a froglok scryer, Upper Guk) and three Runes of Fortune (one from Enynti, two purchased for 50gp each from Mizr N'Mar and Madame Serena); turn in to Sultin, who requires good faction to complete this trade",
      "Gloves: obtain Glowing Gloves (a shadowed man), Radiant Gloves (Radiant, in the Temple of Cazic Thule), Enchanted Gloves (50gp to Tizina), and Gleaming Gloves (a bloodstone to Tarn Visilin); turn all four in to Sultin",
      "Wand: retrieve a Pouch of Silver Dust from a dusty werebat in The Estate of Unrest and a Silver Wand from a silvered guard in the Temple of Cazic Thule, have Ezmirella and Raine Beteria enchant it, then return both items to Sultin",
    ],
    wiki_title: "Incandescent Armor Quests",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, solRoId, "starts_in");
  addEdge(questId, solRoId, "located_in");
  addEdge(questId, gukId, "located_in");
  addEdge(questId, czId, "located_in");
  addEdge(questId, unrestId, "located_in");
  addEdge(questId, lavastormId, "located_in");
  addEdge(questId, lesserFaydarkId, "located_in");
  addEdge(questId, innothuleId, "located_in");
  addEdge(questId, westCommonsId, "located_in");

  const maskId = "item:incandescent-mask";
  addNode({
    id: maskId,
    label: "Incandescent Mask",
    type: "item",
    slots: ["Face"],
    ac: 3,
    stats: { int: 5, cha: 7 },
    effect: "Focus: Summoning Haste II",
    weight: 0.4,
    size: "Small",
    classes: ["monk", "enchanter"],
    magic: true,
    lore: true,
    source: "Incandescent Armor Quests reward (Sultin, Temple of Solusek Ro)",
  });
  const glovesId = "item:incandescent-gloves";
  addNode({
    id: glovesId,
    label: "Incandescent Gloves",
    type: "item",
    slots: ["Hands"],
    ac: 6,
    stats: { str: 3, cha: 3, agi: 3 },
    mana: 3,
    weight: 1.5,
    size: "Small",
    classes: ["enchanter"],
    magic: true,
    lore: true,
    source: "Incandescent Armor Quests reward (Sultin, Temple of Solusek Ro)",
  });
  const wandId = "item:incandescent-wand";
  addNode({
    id: wandId,
    label: "Incandescent Wand",
    type: "item",
    slots: ["Primary"],
    skill: "1H Blunt",
    damage: 5,
    delay: 25,
    ac: 3,
    stats: { dex: 2 },
    resists: { magic: 5 },
    effect: "Color Shift (Combat) at Level 20",
    weight: 1.0,
    size: "Medium",
    classes: ["enchanter"],
    magic: true,
    lore: true,
    source: "Incandescent Armor Quests reward (Sultin, Temple of Solusek Ro)",
  });
  addEdge(questId, maskId, "rewards");
  addEdge(questId, glovesId, "rewards");
  addEdge(questId, wandId, "rewards");
}

// ---------------------------------------------------------------------
// Totemic Armor Quests
// ---------------------------------------------------------------------
{
  const zoneId = "zone:lake-rathetear";
  const unrestId = "zone:the-estate-of-unrest";
  const najenaId = "zone:najena";
  const lesserFaydarkId = "zone:lesser-faydark";
  const vrynnId = "npc:lake-rathetear:vrynn";
  const kyralynnId = "npc:lake-rathetear:kyralynn";
  addGiver(vrynnId, "Vrynn", zoneId);
  addGiver(kyralynnId, "Kyralynn", zoneId);

  const questId = "quest:totemic-armor-quests";
  addNode({
    id: questId,
    label: "Totemic Armor Quests",
    type: "quest",
    description:
      "Vrynn and Kyralynn, Barbarian shamans at the Barbarian Village in Lake Rathetear, each trade four medium-sized banded armor pieces plus processed dufrenite and a rare creature drop for a piece of Totemic armor; the full 8-piece set gives +102 AC and +5 to every attribute plus elemental resistances.",
    classes: ["shaman"],
    minLevel: 15,
    steps: [
      "Vrynn: Totemic Boots (Banded Boots, Dufrenite, Terror Spines -- from a tentacle terror in either Najena or The Estate of Unrest -- and a Chief's Tongue from an orc chief in Lesser Faydark)",
      "Vrynn: Totemic Gauntlets, Totemic Sleeves, Totemic Leggings",
      "Kyralynn: Totemic Bracers, Totemic Breastplate, Totemic Helm, Totemic Cloak",
      "Each piece needs its own medium-sized banded armor piece plus processed dufrenite and a rare drop -- wrong item size or type is refused at turn-in",
    ],
    wiki_title: "Totemic Armor Quests",
  });
  addEdge(vrynnId, questId, "starts");
  addEdge(kyralynnId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, unrestId, "located_in");
  addEdge(questId, najenaId, "located_in");
  addEdge(questId, lesserFaydarkId, "located_in");
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 041 complete: added 3 more quests from GitHub issue #26's checklist (Estate of Unrest batch)");
