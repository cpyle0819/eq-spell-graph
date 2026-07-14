/**
 * Migration 044: 5 more quests off GitHub issue #26's checklist -- Brell
 * Serilis Symbol Quests, Runnyeye Warbeads (Kaladim Warrior), The Bread
 * Shipment (Kaladim), Fresh Baked Muffins (Kaladim), Rat Pelts. All five
 * were skipped in earlier migrations (040/041/042) for lacking a South
 * Kaladim zone; migration 043 added `zone:south-kaladim`, so these are
 * picked up now. Researched directly against eqlwiki.com (each quest's own
 * page, plus reward/turn-in items' pages), following
 * decisions/eqlwiki-quest-research-method.md. `located_in` follows the
 * broadened rule from migration 041 (decisions/quest-reward-modeling.md).
 *
 * Brell Serilis Symbol Quests: Bronlor Lightblade (South Kaladim) is the
 * sole `starts` giver, same "one overview giver, tiers folded into steps"
 * treatment as every other Symbol Quests pair already in this graph
 * (Cazic Thule, Innoruuk, Tunare, Quellious, Rallos Zek, Bertoxxulous) --
 * Taldrik Stumpystout (Oasis of Marr), who receives the Disciple tier's
 * actual turn-in, is prose-only rather than a second `starts` node, same
 * reasoning. `located_in` picks up every zone a step names: Butcherblock
 * Mountains (Initiate turn-in farm), East Freeport (three purchased
 * drinks), Oasis of Marr (Taldrik's own location), The Estate of Unrest
 * (Preserved Hops, Battleworn Canteen), Kithicor Forest (Forest Barley).
 *
 * Runnyeye Warbeads (Kaladim Warrior) and Rat Pelts both reuse the same
 * RunnyEye Warbeads / Giant Rat Pelt turn-in shapes already modeled in
 * migration 042 for their Rogue/generic counterparts (Butcherblock
 * Mountains + Misty Thicket for RunnyEye Warbeads; the mines below North
 * Kaladim -- zone:north-kaladim -- for Giant Rat Pelts, confirmed by Rat
 * Pelts' own page).
 *
 * Deliberately NOT modeled:
 * - Runnyeye Warbeads (Kaladim Warrior)'s reward ("a piece of small
 *   tattered armor from the equipment set") -- no specific piece or stats
 *   named on the page.
 * - Negative faction changes (Craknek Warriors worsens on both Runnyeye
 *   Warbeads (Kaladim Warrior) and Rat Pelts; Miners Guild 628 worsens on
 *   Fresh Baked Muffins (Kaladim)) -- `rewards` only models positive
 *   rewards (decisions/quest-reward-modeling.md).
 * - Coin rewards -- no coin field on `quest` nodes, consistent with every
 *   migration so far.
 * - era -- unset; none of these five quests' own pages state a content
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
// Brell Serilis Symbol Quests
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-kaladim";
  const butcherblockId = "zone:butcherblock-mountains";
  const eastFreeportId = "zone:east-freeport";
  const oasisId = "zone:oasis-of-marr";
  const unrestId = "zone:the-estate-of-unrest";
  const kithicorId = "zone:kithicor-forest";
  const giverId = "npc:south-kaladim:bronlor-lightblade";
  addGiver(giverId, "Bronlor Lightblade", zoneId);

  const questId = "quest:brell-serilis-symbol-quests";
  addNode({
    id: questId,
    label: "Brell Serilis Symbol Quests",
    type: "quest",
    description:
      "Bronlor Lightblade, in a back room of the Kaladim Warrior's Guild Hall in South Kaladim, promotes clerics of Brell Serilis through Initiate and Disciple Symbol tiers.",
    classes: ["cleric"],
    minLevel: 14,
    steps: [
      "Initiate Symbol: speak with Bronlor Lightblade about enraged goblins, travel to Butcherblock Mountains, slay them for four Enraged Goblin Beads, and return the beads to Bronlor Lightblade",
      "Disciple Symbol: receive a Note to Taldrik, purchase Elven Wine, Dwarven Ale, and Freeport Stout in East Freeport, deliver them to Taldrik Stumpystout in Oasis of Marr, then gather Preserved Hops and a Battleworn Canteen (both The Estate of Unrest), Forest Barley (Kithicor Forest), and a Summoned Globe of Water",
      "Combine the four Disciple components in a Holy Cask to craft a Keg of Brells Blessed Stout, then return to Taldrik Stumpystout with the keg, a Rat Sandwich, and the Initiate Symbol",
    ],
    wiki_title: "Brell Serilis Symbol Quests",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, butcherblockId, "located_in");
  addEdge(questId, eastFreeportId, "located_in");
  addEdge(questId, oasisId, "located_in");
  addEdge(questId, unrestId, "located_in");
  addEdge(questId, kithicorId, "located_in");

  const initiateId = "item:initiate-symbol-of-brell-serilis";
  addNode({
    id: initiateId,
    label: "Initiate Symbol of Brell Serilis",
    type: "item",
    slots: ["Neck"],
    ac: 3,
    stats: { wis: 1 },
    mana: 3,
    source: "Brell Serilis Symbol Quests reward (Bronlor Lightblade, South Kaladim)",
  });
  const discipleId = "item:disciple-symbol-of-brell-serilis";
  addNode({
    id: discipleId,
    label: "Disciple Symbol of Brell Serilis",
    type: "item",
    slots: ["Neck"],
    ac: 5,
    stats: { sta: 1, wis: 2 },
    mana: 7,
    source: "Brell Serilis Symbol Quests reward (Bronlor Lightblade, South Kaladim)",
  });
  addEdge(questId, initiateId, "rewards");
  addEdge(questId, discipleId, "rewards");
}

// ---------------------------------------------------------------------
// Runnyeye Warbeads (Kaladim Warrior)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-kaladim";
  const butcherblockId = "zone:butcherblock-mountains";
  const mistyThicketId = "zone:misty-thicket";
  const giverId = "npc:south-kaladim:byzar-bloodforge";
  addGiver(giverId, "Byzar Bloodforge", zoneId);

  const questId = "quest:runnyeye-warbeads-kaladim-warrior";
  addNode({
    id: questId,
    label: "Runnyeye Warbeads (Kaladim Warrior)",
    type: "quest",
    description:
      "Byzar Bloodforge in South Kaladim trades four RunnyEye Warbeads, looted from goblins in Butcherblock Mountains or Misty Thicket, for a piece of small tattered armor.",
    classes: ["bard", "cleric", "druid", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"],
    minLevel: 9,
    steps: ["Collect four RunnyEye Warbeads from goblins in Butcherblock Mountains or Misty Thicket", "Turn them in to Byzar Bloodforge for a piece of small tattered armor"],
    wiki_title: "Runnyeye Warbeads (Kaladim Warrior)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, butcherblockId, "located_in");
  addEdge(questId, mistyThicketId, "located_in");
  addFactionReward(questId, "Storm Guard");
  addFactionReward(questId, "Kazon Stormhammer");
  addFactionReward(questId, "Miners Guild 249");
  addFactionReward(questId, "Merchants of Kaladim");
}

// ---------------------------------------------------------------------
// The Bread Shipment (Kaladim)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-kaladim";
  const southernKaranaId = "zone:southern-karana";
  const giverId = "npc:south-kaladim:gretta-mottle";
  addGiver(giverId, "Gretta Mottle", zoneId);

  const questId = "quest:the-bread-shipment-kaladim";
  addNode({
    id: questId,
    label: "The Bread Shipment (Kaladim)",
    type: "quest",
    description:
      "Gretta Mottle, at Irontoe's Eats in South Kaladim, trades a Bag of Bread Loaves, purchased from Jarlen Meadowgreen in Southern Karana for 2 gold, for experience, coin, and faction. Good-aligned characters only.",
    minLevel: 1,
    steps: ["Purchase a Bag of Bread Loaves from Jarlen Meadowgreen in Southern Karana for 2 gold", "Deliver the bread to Gretta Mottle"],
    wiki_title: "The Bread Shipment (Kaladim)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, southernKaranaId, "located_in");
  addFactionReward(questId, "Merchants of Kaladim");
  addFactionReward(questId, "Storm Guard");
  addFactionReward(questId, "Miners Guild 249");
  addFactionReward(questId, "Kazon Stormhammer");
}

// ---------------------------------------------------------------------
// Fresh Baked Muffins (Kaladim) -- same giver as The Bread Shipment (Kaladim)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-kaladim";
  const giverId = "npc:south-kaladim:gretta-mottle";
  addGiver(giverId, "Gretta Mottle", zoneId);

  const questId = "quest:fresh-baked-muffins-kaladim";
  addNode({
    id: questId,
    label: "Fresh Baked Muffins (Kaladim)",
    type: "quest",
    description: "Gretta Mottle, at Irontoe's Eats in South Kaladim, trades a Full Muffin Crate (10 unstacked baked muffins combined in a Muffin Crate) for coin and faction.",
    minLevel: 1,
    steps: ["Combine 10 unstacked baked muffins in a Muffin Crate to make a Full Muffin Crate", "Deliver it to Gretta Mottle"],
    wiki_title: "Fresh Baked Muffins (Kaladim)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Merchants of Kaladim");
  addFactionReward(questId, "Storm Guard");
  addFactionReward(questId, "Miners Guild 249");
  addFactionReward(questId, "Kazon Stormhammer");
}

// ---------------------------------------------------------------------
// Rat Pelts
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-kaladim";
  const minesId = "zone:north-kaladim";
  const giverId = "npc:south-kaladim:beno-targnarle";
  addGiver(giverId, "Beno Targnarle", zoneId);

  const questId = "quest:rat-pelts";
  addNode({
    id: questId,
    label: "Rat Pelts",
    type: "quest",
    description:
      "Beno Targnarle in South Kaladim trades four Giant Rat Pelts, from giant rats in the mines below North Kaladim, for a choice of Rat Pelt Cape, Small Lantern, Torch, or Malachite. Multiquestable; requires Amiable faction or better.",
    minLevel: 1,
    steps: ["Collect four Giant Rat Pelts from giant rats in the mines below North Kaladim", "Turn them in to Beno Targnarle for a choice of reward"],
    wiki_title: "Rat Pelts",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, minesId, "located_in");

  const capeId = "item:rat-pelt-cape";
  addNode({ id: capeId, label: "Rat Pelt Cape", type: "item", slots: ["Back"], ac: 1, resists: { cold: 2 }, source: "Rat Pelts reward (Beno Targnarle, South Kaladim)" });
  addEdge(questId, capeId, "rewards");
  addEdge(questId, "item:small-lantern", "rewards");
  addEdge(questId, "item:torch", "rewards");
  addEdge(questId, "item:malachite", "rewards");
  addFactionReward(questId, "Storm Guard");
  addFactionReward(questId, "Kazon Stormhammer");
  addFactionReward(questId, "Miners Guild 249");
  addFactionReward(questId, "Merchants of Kaladim");
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 044 complete: added 5 South Kaladim quests from GitHub issue #26's checklist");
