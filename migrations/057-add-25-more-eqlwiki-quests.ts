/**
 * Migration 057: 25 more quests off GitHub issue #26's checklist -- the
 * rest of O (Orc Pawn Picks onward) through most of P (through Poison
 * Sales). Researched directly against eqlwiki.com, following
 * decisions/eqlwiki-quest-research-method.md.
 *
 * Order of Thunder (from Drosco) and Paladin Hunting are the same quest
 * under two checklist entries -- "Order of Thunder" is an item dropped by
 * the zombie Drosco, and Paladin Hunting is the actual quest page that
 * turns it in. Modeled once, both checklist boxes checked.
 *
 * Deferred to the Questlines section, not modeled as a flat quest (doesn't
 * count against this batch's 25-standalone cap):
 * - Plane of Sky Keys -- not a single turn-in-for-reward quest but a whole
 *   raid-progression system (Sirran the Lunatic gates access to each of
 *   Plane of Sky's 7 islands behind a boss-kill-then-key-turn-in on the
 *   previous island), same "whole progression" shape as the epic/armor
 *   questlines already deferred there.
 *
 * One new zone added (giver's zone missing from the graph, per the
 * issue's zone-creation guardrail):
 * - Qeynos Aqueducts (Garuc Anehm's zone for Paladin Hunting, also used by
 *   Paw of Opolla Quest's Vin Moltor... except Vin Moltor's own detailed
 *   walkthrough places him in the already-modeled Qeynos Catacombs instead
 *   -- the wiki's own infobox and prose disagree, so Paw of Opolla uses
 *   Qeynos Catacombs, the more specific of the two sources). Confirmed a
 *   real zone via its own eqlwiki.com page: has its own zone-line/succor
 *   point (214, -315) and is listed as a real neighbor of Qeynos. No
 *   race/class/deity faction table on its own page, so left without a
 *   `faction` field (consistent with 13 other zones already in the graph
 *   that lack one, e.g. Chardok, Plane of Fear).
 *
 * Deliberately NOT modeled (consistent with every migration so far):
 * - Negative faction changes throughout -- `rewards` only models positive
 *   changes (decisions/quest-reward-modeling.md): Oven Mittens' Broken
 *   Skull Clan loss, Ortallius' Cutthroat Rings' Shadowed Men loss, Pirate
 *   Earrings' and both Pixie Dust quests' Crushbone Orcs loss, Poacher
 *   Leader's Heretics loss.
 * - Package from Lomarc's faction impact -- the wiki's own two summaries
 *   of the "kill Lomarc" step and the "turn in to Renux" step directly
 *   contradict each other about which of Circle of Unseen Hands,
 *   Merchants of Qeynos, Corrupt Qeynos Guards, Guards of Qeynos, and Kane
 *   Bayle go up vs. down at each step -- noted as mixed/step-dependent in
 *   the quest description rather than guessed at.
 * - Every vague/random reward: Peacekeeper Staff Quest's "random piece of
 *   Patchwork Armor," Piranha Hunting's "occasionally a cleric spell or
 *   potion," Poacher Leader's "random low level spell," and Plane of
 *   Mischief Armor Quest's class-dependent armor-set choice (8 different
 *   sets keyed to which Plane of Mischief Doll is combined in -- modeling
 *   even one set's pieces without the other 7 would be arbitrary, so the
 *   quest is modeled with the mechanic in `steps`/`description` only).
 * - Plaguebringer Proof's "evil path" reward -- only the good-path Potion
 *   of Light Healing is confirmed by name; the evil path's faction/coin
 *   specifics aren't clearly stated.
 * - Pirate Earrings' "one random item" reward (Aviak Feather, Fishing
 *   Spear, Kiola Nut, or Conch Shell) -- same treatment as Odus Pearls in
 *   migration 056, even though Fishing Spear already exists as a node
 *   from another quest; modeling just that one would misrepresent the
 *   reward as guaranteed rather than a 1-in-4 draw.
 * - Pure ingredient/intermediate items that are never themselves a quest
 *   reward: Runner Pouch, A Sealed Letter, Kerran Doll, Note To Hall Of
 *   Truth, Treant Resin, Pearl of Odus, Sack of Piranha -- same treatment
 *   as Deathfist Slashed Belt and Bag of Snake Parts in prior migrations.
 * - Coin rewards throughout -- no coin field on `quest` nodes.
 *
 * Reused across quests: Rusty Short Sword, Rusty Spear, Rusty Two Handed
 * Sword, Tarnished Bastard Sword (all from migration 056's Orc Hatchets)
 * for Orc Runner (Kelethin)'s weapon choice; Bandages, Iron Ration,
 * Ration, Water Flask (already in the graph) for Orc Runner (Felwithe);
 * Rat Ear Pie (already in the graph) for Paw of Opolla Quest; the
 * existing Cure Poison spell for Poison Cures; the existing Courage spell
 * for Paladin Message; the same Dill Fireshine (Kelethin) giver from Orc
 * Hatchets for Orc Runner (Kelethin).
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
// New zone: Qeynos Aqueducts
// ---------------------------------------------------------------------
const qeynosAqueductsId = "zone:qeynos-aqueducts";
addNode({
  id: qeynosAqueductsId,
  label: "Qeynos Aqueducts",
  type: "zone",
  lore: "The vast ancient water supply to the city of Qeynos. The area was long ago walled off when it was no longer used, but then became the haven of the seedier elements of area, including the beggars and thieves, smugglers and thugs, and up to the members who worship the Plague Bringer himself.",
  wiki_title: "Qeynos Aqueducts",
});
addEdge(qeynosAqueductsId, "zone:north-qeynos", "connects_to");
addEdge("zone:north-qeynos", qeynosAqueductsId, "connects_to");
addEdge(qeynosAqueductsId, "zone:south-qeynos", "connects_to");
addEdge("zone:south-qeynos", qeynosAqueductsId, "connects_to");

// ---------------------------------------------------------------------
// Orc Pawn Picks
// ---------------------------------------------------------------------
{
  const zoneId = "zone:neriak-commons";
  const giverId = "npc:neriak-commons:trizam-ntan";
  addGiver(giverId, "Trizam N`Tan", zoneId);

  const questId = "quest:orc-pawn-picks";
  addNode({
    id: questId,
    label: "Orc Pawn Picks",
    type: "quest",
    description: "Trizam N`Tan in Neriak Commons trades 4 Orc Pawn Picks for faction, coin, 2 Neriak Nectar, a Rotgrub Rye, and experience. All classes.",
    minLevel: 5,
    steps: [
      "Kill orc pawns in Neriak Commons for 4 Orc Pawn Picks",
      "Turn them in to Trizam N`Tan in Neriak Commons",
    ],
    wiki_title: "Orc Pawn Picks",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Indigo Brotherhood");

  const nectarId = "item:neriak-nectar";
  addNode({
    id: nectarId,
    label: "Neriak Nectar",
    type: "item",
    weight: 0.4,
    size: "Small",
    source: "Orc Pawn Picks reward (Trizam N`Tan, Neriak Commons) -- a drink",
  });
  addEdge(questId, nectarId, "rewards");

  const ryeId = "item:rotgrub-rye";
  addNode({
    id: ryeId,
    label: "Rotgrub Rye",
    type: "item",
    weight: 0.5,
    size: "Small",
    source: "Orc Pawn Picks reward (Trizam N`Tan, Neriak Commons) -- a snack",
  });
  addEdge(questId, ryeId, "rewards");
}

// ---------------------------------------------------------------------
// Orc Picks
// ---------------------------------------------------------------------
{
  const zoneId = "zone:west-commonlands";
  const giverId = "npc:west-commonlands:guard-valon";
  addGiver(giverId, "Guard Valon", zoneId);

  const questId = "quest:orc-picks";
  addNode({
    id: questId,
    label: "Orc Picks",
    type: "quest",
    description: "Guard Valon in West Commonlands trades Orc Pawn Picks -- four at a time -- for coin, faction, and experience. Dubious or better faction with Guard Valon is sufficient to start. All classes.",
    minLevel: 1,
    steps: [
      "Kill orc pawns in West Commonlands for Orc Pawn Picks",
      "Turn in up to 4 at a time to Guard Valon in West Commonlands",
    ],
    wiki_title: "Orc Picks",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Orc Runner (Felwithe)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:northern-felwithe";
  const giverId = "npc:northern-felwithe:general-jyleel";
  addGiver(giverId, "General Jyleel", zoneId);

  const questId = "quest:orc-runner-felwithe";
  addNode({
    id: questId,
    label: "Orc Runner (Felwithe)",
    type: "quest",
    description: "General Jyleel, at the Paladin Guild Hall in Northern Felwithe, requiring Amiable faction, sends a Runner Pouch and A Sealed Letter recovered from a slain orc runner back and forth, rewarding Bandages, an Iron Ration, a Ration, a Water Flask, coin (paid out twice), and experience. All classes.",
    minLevel: 8,
    steps: [
      "Kill an orc runner for a Runner Pouch and A Sealed Letter",
      "Deliver them per General Jyleel's instructions in Northern Felwithe",
    ],
    wiki_title: "Orc Runner (Felwithe)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "item:bandages", "rewards");
  addEdge(questId, "item:iron-ration", "rewards");
  addEdge(questId, "item:ration", "rewards");
  addEdge(questId, "item:water-flask", "rewards");
}

// ---------------------------------------------------------------------
// Orc Runner (Kelethin)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:greater-faydark";
  const giverId = "npc:greater-faydark:dill-fireshine";
  addGiver(giverId, "Dill Fireshine", zoneId);

  const questId = "quest:orc-runner-kelethin";
  addNode({
    id: questId,
    label: "Orc Runner (Kelethin)",
    type: "quest",
    description: "Dill Fireshine, at the Ranger Guild Hall in Kelethin (Greater Faydark), trades a Runner Pouch and A Sealed Letter recovered from a slain orc runner for coin, experience, and a choice of weapon (Longbow, Rusty Short Sword, Rusty Spear, Rusty Two Handed Sword, or Tarnished Bastard Sword). Bard, Paladin, Ranger, Rogue, Shadow Knight, Shaman, or Warrior.",
    classes: ["bard", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"],
    minLevel: 8,
    steps: [
      "Kill an orc runner for a Runner Pouch and A Sealed Letter",
      "Turn them in to Dill Fireshine in Kelethin",
    ],
    wiki_title: "Orc Runner (Kelethin)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "item:rusty-short-sword", "rewards");
  addEdge(questId, "item:rusty-spear", "rewards");
  addEdge(questId, "item:rusty-two-handed-sword", "rewards");
  addEdge(questId, "item:tarnished-bastard-sword", "rewards");

  const longbowId = "item:longbow";
  addNode({
    id: longbowId,
    label: "Longbow",
    type: "item",
    slots: ["Range"],
    classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"],
    skill: "Archery",
    damage: 8,
    delay: 51,
    weight: 5.0,
    size: "Large",
    source: "Orc Runner (Kelethin) reward (Dill Fireshine, Kelethin)",
  });
  addEdge(questId, longbowId, "rewards");
}

// ---------------------------------------------------------------------
// Orc Scalp Collecting
// ---------------------------------------------------------------------
{
  const zoneId = "zone:highpass-hold";
  const giverId = "npc:highpass-hold:captain-ashlan";
  addGiver(giverId, "Captain Ashlan", zoneId);

  const questId = "quest:orc-scalp-collecting";
  addNode({
    id: questId,
    label: "Orc Scalp Collecting",
    type: "quest",
    description: "Captain Ashlan in Highpass Hold trades an Orc Scalp -- up to four at once -- for faction, coin, and experience. All classes.",
    minLevel: 1,
    steps: [
      "Kill orcs in Highpass Hold for Orc Scalps",
      "Turn in up to 4 at once to Captain Ashlan in Highpass Hold",
    ],
    wiki_title: "Orc Scalp Collecting",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Highpass Guards");
  addFactionReward(questId, "Carson McCabe");
  addFactionReward(questId, "Merchants of Highpass");
  addFactionReward(questId, "Corrupt Qeynos Guards");
  addFactionReward(questId, "The Freeport Militia");
}

// ---------------------------------------------------------------------
// Orc Vest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:greater-faydark";
  const giverId = "npc:greater-faydark:linadian";
  addGiver(giverId, "Linadian", zoneId);
  addEdge(giverId, "zone:west-freeport", "located_in");

  const questId = "quest:orc-vest";
  addNode({
    id: questId,
    label: "Orc Vest",
    type: "quest",
    description: "Linadian, in Kelethin (Greater Faydark) or West Freeport, requiring Indifferent or better faction with Kelethin Merchants, trades either two legionnaire pads from Clan Crushbone plus a Crushbone Belt plus 10 gold, or two legionnaire pads from Clan Deathfist plus a Deathfist Slashed Belt plus 10 gold, for a Banded Orc Vest. Bard, Cleric, Paladin, Ranger, Rogue, Shadow Knight, Shaman, or Warrior; Wood Elf, High Elf, Dark Elf, or Half-Elf only.",
    classes: ["bard", "cleric", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"],
    minLevel: 12,
    steps: [
      "Gather two Clan Crushbone legionnaire pads and a Crushbone Belt, or two Clan Deathfist legionnaire pads and a Deathfist Slashed Belt, plus 10 gold",
      "Turn them in to Linadian in Kelethin or West Freeport",
    ],
    wiki_title: "Orc Vest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:west-freeport", "located_in");

  const vestId = "item:banded-orc-vest";
  addNode({
    id: vestId,
    label: "Banded Orc Vest",
    type: "item",
    slots: ["Chest"],
    classes: ["warrior", "cleric", "paladin", "ranger", "shadow knight", "bard", "rogue", "shaman"],
    magic: true,
    ac: 8,
    stats: { cha: -3 },
    effect: "SV Disease +3",
    weight: 5.5,
    size: "Medium",
    source: "Orc Vest reward (Linadian, Kelethin or West Freeport) -- Wood Elf, High Elf, Dark Elf, Half-Elf only",
  });
  addEdge(questId, vestId, "rewards");
}

// ---------------------------------------------------------------------
// Order of Thunder (from Drosco) / Paladin Hunting
// ---------------------------------------------------------------------
{
  const zoneId = qeynosAqueductsId;
  const giverId = "npc:qeynos-aqueducts:garuc-anehm";
  addGiver(giverId, "Garuc Anehm", zoneId);

  const questId = "quest:paladin-hunting";
  addNode({
    id: questId,
    label: "Paladin Hunting",
    type: "quest",
    description: "Garuc Anehm in Qeynos Aqueducts, requiring Indifferent or better faction, trades an Order of Thunder (dropped by Knights of Thunder paladins, or looted from the zombie Drosco) or a Prayer Beads (from Priests of Life clerics) for a rusty weapon, a Wrist Pouch, and experience. Turning in Brother Trintle's busted prayer beads instead -- he is a mole within the Priests of Life -- triggers severe faction loss and combat with Garuc. All classes.",
    minLevel: 5,
    steps: [
      "Kill a Knights of Thunder paladin for an Order of Thunder, or a Priests of Life cleric for Prayer Beads, in Qeynos Aqueducts",
      "Turn it in to Garuc Anehm in Qeynos Aqueducts",
    ],
    wiki_title: "Paladin Hunting",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const pouchId = "item:wrist-pouch";
  addNode({
    id: pouchId,
    label: "Wrist Pouch",
    type: "item",
    capacity: 4,
    weight: 0.4,
    size: "Tiny",
    source: "Paladin Hunting reward (Garuc Anehm, Qeynos Aqueducts) -- holds tiny items only",
  });
  addEdge(questId, pouchId, "rewards");
}

// ---------------------------------------------------------------------
// Ortallius' Cutthroat Rings
// ---------------------------------------------------------------------
{
  const zoneId = "zone:southern-desert-of-ro";
  const giverId = "npc:southern-desert-of-ro:ortallius";
  addGiver(giverId, "Ortallius", zoneId);

  const questId = "quest:ortallius-cutthroat-rings";
  addNode({
    id: questId,
    label: "Ortallius' Cutthroat Rings",
    type: "quest",
    description: "Ortallius in Southern Desert of Ro trades 3 Cutthroat Insignia Rings -- from dervish cutthroats -- for coin, experience, and faction with the Temple Of Sol Ro. All classes.",
    minLevel: 7,
    steps: [
      "Kill dervish cutthroats in Southern Desert of Ro for 3 Cutthroat Insignia Rings",
      "Turn them in to Ortallius in Southern Desert of Ro",
    ],
    wiki_title: "Ortallius' Cutthroat Rings",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Temple Of Sol Ro");
}

// ---------------------------------------------------------------------
// Oven Mittens
// ---------------------------------------------------------------------
{
  const zoneId = "zone:grobb";
  const giverId = "npc:grobb:carver-cagrek";
  addGiver(giverId, "Carver Cagrek", zoneId);

  const questId = "quest:oven-mittens";
  addNode({
    id: questId,
    label: "Oven Mittens",
    type: "quest",
    description: "Carver Cagrek in Grobb trades three unstacked Froglok Meat plus 10 gold for Grobb Oven Mittens, faction with Da Bashers, and experience. All classes except Necromancer, Wizard, Magician, Enchanter; Barbarian, Troll, Ogre, or Iksar only.",
    classes: ["warrior", "cleric", "paladin", "ranger", "shadow knight", "druid", "bard", "rogue", "shaman", "monk", "beastlord"],
    minLevel: 1,
    steps: [
      "Gather 3 unstacked Froglok Meat",
      "Turn them in with 10 gold to Carver Cagrek in Grobb",
    ],
    wiki_title: "Oven Mittens",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Da Bashers");

  const mittensId = "item:grobb-oven-mittens";
  addNode({
    id: mittensId,
    label: "Grobb Oven Mittens",
    type: "item",
    slots: ["Hands"],
    classes: ["warrior", "cleric", "paladin", "ranger", "shadow knight", "druid", "bard", "rogue", "shaman", "monk", "beastlord"],
    magic: true,
    lore: true,
    ac: 4,
    effect: "SV Fire +5",
    weight: 3.0,
    size: "Small",
    source: "Oven Mittens reward (Carver Cagrek, Grobb) -- Barbarian, Troll, Ogre, Iksar only",
  });
  addEdge(questId, mittensId, "rewards");
}

// ---------------------------------------------------------------------
// Package from Lomarc
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-qeynos";
  const southQeynosId = "zone:south-qeynos";
  const giverId = "npc:north-qeynos:renux-herkanor";
  addGiver(giverId, "Renux Herkanor", zoneId);

  const questId = "quest:package-from-lomarc";
  addNode({
    id: questId,
    label: "Package from Lomarc",
    type: "quest",
    description: "Renux Herkanor, in the Qeynos rogue guild in North Qeynos, sends players to kill Lomarc (a night-only spawn behind the Mermaid's Lure in South Qeynos) for a Kerran Doll, then return it for experience. Faction impact is mixed and step-dependent -- the wiki's own account of the kill-Lomarc step and the turn-in-to-Renux step disagrees about which of Circle of Unseen Hands, Merchants of Qeynos, Corrupt Qeynos Guards, Guards of Qeynos, and Kane Bayle rise vs. fall. All classes.",
    minLevel: 2,
    steps: [
      "Accept the quest from Renux Herkanor in North Qeynos",
      "Kill Lomarc behind the Mermaid's Lure in South Qeynos (night only) for a Kerran Doll",
      "Return the doll to Renux Herkanor in North Qeynos",
    ],
    wiki_title: "Package from Lomarc",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, southQeynosId, "located_in");
}

// ---------------------------------------------------------------------
// Paladin Message
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-freeport";
  const giverId = "npc:north-freeport:theron-rolius";
  addGiver(giverId, "Theron Rolius", zoneId);

  const questId = "quest:paladin-message";
  addNode({
    id: questId,
    label: "Paladin Message",
    type: "quest",
    description: "Theron Rolius in North Freeport sends a Note To Hall Of Truth to Eestyana Naestra on the third floor of the Hall of Truth. The note is stolen by Duggin Scumber after Mojax Hikspin rests, requiring combat or crowd control to recover it. Reward is the spell Courage, a Wrist Pouch, a Buckler, a Potion of Disease Warding, Marr's Sustenance, and coin. Amiable or better standing with Knights of Truth appears to be required, though the exact threshold isn't stated. All classes.",
    minLevel: 1,
    steps: [
      "Receive the Note To Hall Of Truth from Theron Rolius in North Freeport",
      "Recover it from Duggin Scumber if he steals it from Mojax Hikspin",
      "Deliver it to Eestyana Naestra on the third floor of the Hall of Truth, North Freeport",
    ],
    wiki_title: "Paladin Message",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "spell:courage", "rewards");
  addEdge(questId, "item:wrist-pouch", "rewards");

  const sustenanceId = "item:marrs-sustenance";
  addNode({
    id: sustenanceId,
    label: "Marr's Sustenance",
    type: "item",
    magic: true,
    charges: 1,
    effect: "Regeneration (Any Slot) at Level 15",
    weight: 0.4,
    size: "Small",
    source: "Paladin Message reward (Theron Rolius, North Freeport)",
  });
  addEdge(questId, sustenanceId, "rewards");

  const bucklerId = "item:buckler";
  addNode({
    id: bucklerId,
    label: "Buckler",
    type: "item",
    slots: ["Secondary"],
    classes: ["warrior", "cleric", "paladin", "ranger", "shadow knight", "druid", "bard", "rogue", "shaman", "monk", "beastlord"],
    ac: 4,
    weight: 3.0,
    size: "Small",
    source: "Paladin Message reward (Theron Rolius, North Freeport) -- all races except Dwarf, Halfling, Gnome",
  });
  addEdge(questId, bucklerId, "rewards");

  const potionId = "item:potion-of-disease-warding";
  addNode({
    id: potionId,
    label: "Potion of Disease Warding",
    type: "item",
    weight: 0.4,
    size: "Small",
    source: "Paladin Message reward (Theron Rolius, North Freeport)",
  });
  addEdge(questId, potionId, "rewards");
}

// ---------------------------------------------------------------------
// Parrying Pick Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-kaladim";
  const giverId = "npc:north-kaladim:diggins";
  addGiver(giverId, "Diggins", zoneId);

  const questId = "quest:parrying-pick-quest";
  addNode({
    id: questId,
    label: "Parrying Pick Quest",
    type: "quest",
    description: "Diggins in North Kaladim, requiring Friendly faction with the Miners Guild 628, trades four bandit tongues (Barma's Tongue, Crytil's Tongue, Keldyn's Tongue, and Rondo's Tongue) for a Parrying Pick 628. Rogue; Dwarf only.",
    classes: ["rogue"],
    minLevel: 13,
    steps: [
      "Kill Barma, Crytil, Keldyn, and Rondo for their tongues",
      "Turn them in to Diggins in North Kaladim",
    ],
    wiki_title: "Parrying Pick Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const pickId = "item:parrying-pick-628";
  addNode({
    id: pickId,
    label: "Parrying Pick 628",
    type: "item",
    slots: ["Secondary"],
    classes: ["rogue"],
    magic: true,
    lore: true,
    ac: 7,
    weight: 4.0,
    size: "Medium",
    source: "Parrying Pick Quest reward (Diggins, North Kaladim) -- Dwarf only",
  });
  addEdge(questId, pickId, "rewards");
}

// ---------------------------------------------------------------------
// Paw of Opolla Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:qeynos-catacombs";
  const befallenId = "zone:befallen";
  const runnyeyeId = "zone:runnyeye-citadel";
  const giverId = "npc:qeynos-catacombs:vin-moltor";
  addGiver(giverId, "Vin Moltor", zoneId);

  const questId = "quest:paw-of-opolla-quest";
  addNode({
    id: questId,
    label: "Paw of Opolla Quest",
    type: "quest",
    description: "Vin Moltor in Qeynos Catacombs gives a Severed Paw for a Rat Ear Pie, or drops it (25% chance) when killed. Killing Vin Moltor costs faction with Antonius Bayle, Coalition of Tradefolk, Guards of Qeynos, and Merchants of Qeynos. Gynok Moltor in Befallen drops a Platinum Ring, Gold Ring, and Copper Ring; a Silver Ring is found at the bottom of the pond in Runnyeye. Combining all four in the Severed Paw yields the Paw of Opolla. Cleric, Druid, or Shaman; Solo level 29, Duo level 24.",
    classes: ["cleric", "druid", "shaman"],
    minLevel: 24,
    steps: [
      "Get a Severed Paw from Vin Moltor in Qeynos Catacombs (bake him a Rat Ear Pie, or kill him for a chance at one)",
      "Kill Gynok Moltor in Befallen for a Platinum Ring, Gold Ring, and Copper Ring",
      "Retrieve a Silver Ring from the bottom of the pond in Runnyeye",
      "Combine all four rings into the Severed Paw",
    ],
    wiki_title: "Paw of Opolla Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, befallenId, "located_in");
  addEdge(questId, runnyeyeId, "located_in");

  const pawId = "item:paw-of-opolla";
  addNode({
    id: pawId,
    label: "Paw of Opolla",
    type: "item",
    slots: ["Primary", "Secondary"],
    classes: ["cleric", "druid", "shaman"],
    magic: true,
    lore: true,
    ac: 9,
    stats: { sta: 5, cha: -5, wis: 9, agi: 9, mana: 5 },
    effect: "SV Disease -5",
    weight: 0.2,
    size: "Small",
    source: "Paw of Opolla Quest reward (Vin Moltor, Qeynos Catacombs)",
  });
  addEdge(questId, pawId, "rewards");
}

// ---------------------------------------------------------------------
// Peacekeeper Staff Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const giverId = "npc:erudin:lumi-stergnon";
  addGiver(giverId, "Lumi Stergnon", zoneId);

  const questId = "quest:peacekeeper-staff-quest";
  addNode({
    id: questId,
    label: "Peacekeeper Staff Quest",
    type: "quest",
    description: "Lumi Stergnon, at the Temple of Divine Light in Erudin, requiring High Amiable faction with the Peacekeepers, sends a Sealed Letter to Emil Parsini, then combines Treant Resin and a Pearl of Odus in a Peacekeeper Staff container; turning the finished staff back in to Lumi Stergnon yields the Peacekeeper Staff, coin, experience, and a random Patchwork Armor piece. Cleric or Paladin.",
    classes: ["cleric", "paladin"],
    minLevel: 10,
    steps: [
      "Deliver a Sealed Letter from Lumi Stergnon to Emil Parsini",
      "Combine Treant Resin and a Pearl of Odus in a Peacekeeper Staff container",
      "Turn in the finished staff to Lumi Stergnon in Erudin",
    ],
    wiki_title: "Peacekeeper Staff Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const staffId = "item:peacekeeper-staff";
  addNode({
    id: staffId,
    label: "Peacekeeper Staff",
    type: "item",
    slots: ["Primary"],
    classes: ["cleric", "paladin"],
    lore: true,
    skill: "1H Blunt",
    damage: 4,
    delay: 30,
    weight: 6.5,
    size: "Large",
    source: "Peacekeeper Staff Quest reward (Lumi Stergnon, Erudin)",
  });
  addEdge(questId, staffId, "rewards");
}

// ---------------------------------------------------------------------
// Pickled Frogloks
// ---------------------------------------------------------------------
{
  const zoneId = "zone:oggok";
  const giverId = "npc:oggok:chef-dooga";
  addGiver(giverId, "Chef Dooga", zoneId);

  const questId = "quest:pickled-frogloks";
  addNode({
    id: questId,
    label: "Pickled Frogloks",
    type: "quest",
    description: "Chef Dooga in Oggok trades 3 Pickled Froglok plus 10 gold (or 1 platinum) for an Ogre Butcher Apron, faction with Clurg, Green Blood Knights, Craknek Warriors, and Oggok Guards, and experience. All classes except Necromancer, Wizard, Magician, Enchanter; Barbarian, Troll, Ogre, or Iksar only.",
    classes: ["warrior", "cleric", "paladin", "ranger", "shadow knight", "druid", "bard", "rogue", "shaman", "monk", "beastlord"],
    minLevel: 2,
    steps: [
      "Gather 3 Pickled Froglok",
      "Turn them in with 10 gold (or 1 platinum) to Chef Dooga in Oggok",
    ],
    wiki_title: "Pickled Frogloks",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Clurg");
  addFactionReward(questId, "Green Blood Knights");
  addFactionReward(questId, "Craknek Warriors");
  addFactionReward(questId, "Oggok Guards");

  const apronId = "item:ogre-butcher-apron";
  addNode({
    id: apronId,
    label: "Ogre Butcher Apron",
    type: "item",
    slots: ["Chest"],
    classes: ["warrior", "cleric", "paladin", "ranger", "shadow knight", "druid", "bard", "rogue", "shaman", "monk", "beastlord"],
    lore: true,
    ac: 5,
    effect: "SV Fire +5",
    weight: 6.6,
    size: "Medium",
    source: "Pickled Frogloks reward (Chef Dooga, Oggok) -- Barbarian, Troll, Ogre, Iksar only",
  });
  addEdge(questId, apronId, "rewards");
}

// ---------------------------------------------------------------------
// Piranha Hunting
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-freeport";
  const giverId = "npc:north-freeport:celsar-vestagon";
  addGiver(giverId, "Celsar Vestagon", zoneId);

  const questId = "quest:piranha-hunting";
  addNode({
    id: questId,
    label: "Piranha Hunting",
    type: "quest",
    description: "Celsar Vestagon, at the Temple of Marr in North Freeport, trades a Sack of Piranha -- 4 Fresh Piranha combined in an Empty Fish Sack -- for coin, experience, faction with Knights of Truth, Priests of Marr, and Steel Warriors, and occasionally a cleric spell or potion. All classes (good alignment).",
    minLevel: 2,
    steps: [
      "Gather 4 Fresh Piranha and combine them in an Empty Fish Sack",
      "Turn in the Sack of Piranha to Celsar Vestagon in North Freeport",
    ],
    wiki_title: "Piranha Hunting",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Knights of Truth");
  addFactionReward(questId, "Priests of Marr");
  addFactionReward(questId, "Steel Warriors");
}

// ---------------------------------------------------------------------
// Pirate Earrings
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ocean-of-tears";
  const giverId = "npc:ocean-of-tears:styria-fearnon";
  addGiver(giverId, "Styria Fearnon", zoneId);

  const questId = "quest:pirate-earrings";
  addNode({
    id: questId,
    label: "Pirate Earrings",
    type: "quest",
    description: "Styria Fearnon, on Erollisi Isle in Ocean of Tears, trades Pirate's Earrings -- looted from pirates on Seafury Island -- for one random item (an Aviak Feather, Fishing Spear, Kiola Nut, or Conch Shell), faction with Faydark's Champions, King Tearis Thex, Clerics of Tunare, and Soldiers of Tunare, and experience. All classes.",
    minLevel: 20,
    steps: [
      "Kill pirates on Seafury Island in Ocean of Tears for Pirate's Earrings",
      "Turn them in to Styria Fearnon on Erollisi Isle",
    ],
    wiki_title: "Pirate Earrings",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Faydark's Champions");
  addFactionReward(questId, "King Tearis Thex");
  addFactionReward(questId, "Clerics of Tunare");
  addFactionReward(questId, "Soldiers of Tunare");
}

// ---------------------------------------------------------------------
// Pixie Dust (Kelethin Ranger)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:greater-faydark";
  const giverId = "npc:greater-faydark:ran-sunfire";
  addGiver(giverId, "Ran Sunfire", zoneId);

  const questId = "quest:pixie-dust-kelethin-ranger";
  addNode({
    id: questId,
    label: "Pixie Dust (Kelethin Ranger)",
    type: "quest",
    description: "Ran Sunfire, at the Ranger Guild Hall in Kelethin (Greater Faydark), trades a pouch of 6 unstacked Pixie Dusts for one of five armor pieces (Patchwork Boots, Patchwork Cloak, Patchwork Pants, Patchwork Sleeves, or Leather Skullcap), faction with Faydark's Champions, King Tearis Thex, Clerics of Tunare, and Soldiers of Tunare, coin, and experience. Bard, Cleric, Druid, Monk, Paladin, Ranger, Rogue, Shadow Knight, Shaman, or Warrior.",
    classes: ["bard", "cleric", "druid", "monk", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"],
    minLevel: 1,
    steps: [
      "Kill pixie tricksters in Greater Faydark for 6 unstacked Pixie Dusts",
      "Combine them into a pouch and turn it in to Ran Sunfire in Kelethin",
    ],
    wiki_title: "Pixie Dust (Kelethin Ranger)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Faydark's Champions");
  addFactionReward(questId, "King Tearis Thex");
  addFactionReward(questId, "Clerics of Tunare");
  addFactionReward(questId, "Soldiers of Tunare");

  const patchworkClasses = ["warrior", "cleric", "paladin", "ranger", "shadow knight", "druid", "bard", "rogue", "shaman", "monk", "beastlord"];
  const pieces: Array<{ id: string; label: string; slot: string; ac: number; weight: number; size: string }> = [
    { id: "item:patchwork-boots", label: "Patchwork Boots", slot: "Feet", ac: 3, weight: 2.5, size: "Small" },
    { id: "item:patchwork-cloak", label: "Patchwork Cloak", slot: "Back", ac: 3, weight: 2.0, size: "Medium" },
    { id: "item:patchwork-pants", label: "Patchwork Pants", slot: "Legs", ac: 4, weight: 4.0, size: "Medium" },
    { id: "item:patchwork-sleeves", label: "Patchwork Sleeves", slot: "Arms", ac: 3, weight: 1.5, size: "Small" },
  ];
  for (const piece of pieces) {
    addNode({
      id: piece.id,
      label: piece.label,
      type: "item",
      slots: [piece.slot],
      classes: patchworkClasses,
      ac: piece.ac,
      weight: piece.weight,
      size: piece.size,
      source: "Pixie Dust (Kelethin Ranger) reward (Ran Sunfire, Kelethin); player-craftable via Tailoring -- part of the Patchwork Armor Set",
    });
    addEdge(questId, piece.id, "rewards");
  }

  const skullcapId = "item:leather-skullcap";
  addNode({
    id: skullcapId,
    label: "Leather Skullcap",
    type: "item",
    slots: ["Head"],
    classes: patchworkClasses,
    ac: 4,
    weight: 0.6,
    size: "Small",
    source: "Pixie Dust (Kelethin Ranger) reward (Ran Sunfire, Kelethin); part of the Leather Armor Set",
  });
  addEdge(questId, skullcapId, "rewards");
}

// ---------------------------------------------------------------------
// Pixie Dust (Kelethin Rogue)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:greater-faydark";
  const giverId = "npc:greater-faydark:expin";
  addGiver(giverId, "Expin", zoneId);

  const questId = "quest:pixie-dust-kelethin-rogue";
  addNode({
    id: questId,
    label: "Pixie Dust (Kelethin Rogue)",
    type: "quest",
    description: "Expin in Kelethin (Greater Faydark) trades a Pouch of Pixie Dust -- 6 unstacked Pixie Dusts, looted from pixie tricksters -- for a Patchwork Tunic, faction with Tunare's Scouts, coin, and experience. Bard, Cleric, Druid, Monk, Paladin, Ranger, Rogue, Shadow Knight, Shaman, or Warrior.",
    classes: ["bard", "cleric", "druid", "monk", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"],
    minLevel: 1,
    steps: [
      "Kill pixie tricksters in Greater Faydark for 6 unstacked Pixie Dusts",
      "Combine them into a pouch and turn it in to Expin in Kelethin",
    ],
    wiki_title: "Pixie Dust (Kelethin Rogue)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Tunare's Scouts");

  const tunicId = "item:patchwork-tunic";
  addNode({
    id: tunicId,
    label: "Patchwork Tunic",
    type: "item",
    slots: ["Chest"],
    classes: ["warrior", "cleric", "paladin", "ranger", "shadow knight", "druid", "bard", "rogue", "shaman", "monk", "beastlord"],
    ac: 6,
    weight: 3.5,
    size: "Medium",
    source: "Pixie Dust (Kelethin Rogue) reward (Expin, Kelethin); player-craftable via Tailoring -- part of the Patchwork Armor Set",
  });
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Plaguebringer Proof
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-qeynos";
  const giverId = "npc:north-qeynos:roesager-thusten";
  addGiver(giverId, "Roesager Thusten", zoneId);

  const questId = "quest:plaguebringer-proof";
  addNode({
    id: questId,
    label: "Plaguebringer Proof",
    type: "quest",
    description: "Roesager Thusten in North Qeynos trades a sealed letter from Tovax Vmar (\"A Letter to Opal\"), evidence of Plaguebringer activity, for a Potion of Light Healing, coin, and experience on the good path (an evil path pays different faction and coin, not clearly detailed). All classes.",
    minLevel: 10,
    steps: [
      "Receive A Letter to Opal from Tovax Vmar",
      "Turn it in to Roesager Thusten in North Qeynos",
    ],
    wiki_title: "Plaguebringer Proof",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const potionId = "item:potion-of-light-healing";
  addNode({
    id: potionId,
    label: "Potion of Light Healing",
    type: "item",
    magic: true,
    charges: 1,
    effect: "Light Healing (Any Slot) at Level 15",
    weight: 0.4,
    size: "Small",
    source: "Plaguebringer Proof reward (Roesager Thusten, North Qeynos) -- good path",
  });
  addEdge(questId, potionId, "rewards");
}

// ---------------------------------------------------------------------
// Plane of Mischief Armor Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:plane-of-mischief";
  const giverId = "npc:plane-of-mischief:bob-the-painter";
  addGiver(giverId, "Bob the Painter", zoneId);

  const questId = "quest:plane-of-mischief-armor-quest";
  addNode({
    id: questId,
    label: "Plane of Mischief Armor Quest",
    type: "quest",
    description: "Bob the Painter in the Plane of Mischief trades Words of Wealth for an Empty Pot of Gold container. Combining an Armor of Distraction piece with a Plane of Mischief Doll inside it produces the corresponding armor piece from one of eight class-specific sets (Cleric, Druid, Bard, Enchanter, Monk, Necromancer, Shaman, or Wizard), depending on which doll is used. All classes.",
    minLevel: 55,
    steps: [
      "Trade Words of Wealth to Bob the Painter in the Plane of Mischief for an Empty Pot of Gold",
      "Combine an Armor of Distraction piece and a Plane of Mischief Doll inside it",
    ],
    wiki_title: "Plane of Mischief Armor Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Plane of Mischief Faction Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:plane-of-mischief";
  const giverId = "npc:plane-of-mischief:debbis-the-fish";
  addGiver(giverId, "Debbis the Fish", zoneId);
  const vinnyId = "npc:plane-of-mischief:vinny-v-dvicci";
  addGiver(vinnyId, "Vinny V. D'vicci", zoneId);

  const questId = "quest:plane-of-mischief-faction-quest";
  addNode({
    id: questId,
    label: "Plane of Mischief Faction Quest",
    type: "quest",
    description: "Debbis the Fish, in the Plane of Mischief, trades a Rabbit Foot; Vinny V. D'vicci, also in the Plane of Mischief, trades a Lucky Skunk Foot. Both pay faction with Denizens of Mischief and experience. All classes.",
    minLevel: 55,
    steps: [
      "Give a Rabbit Foot to Debbis the Fish in the Plane of Mischief",
      "Give a Lucky Skunk Foot to Vinny V. D'vicci in the Plane of Mischief",
    ],
    wiki_title: "Plane of Mischief Faction Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(vinnyId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Denizens of Mischief");
}

// ---------------------------------------------------------------------
// Poacher Leader
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const giverId = "npc:erudin:jras-solsier";
  addGiver(giverId, "Jras Solsier", zoneId);

  const questId = "quest:poacher-leader";
  addNode({
    id: questId,
    label: "Poacher Leader",
    type: "quest",
    description: "Jras Solsier, outside the Temple of Divine Light in Erudin, trades a Poacher Head, then a Barbarian Head (dropped by Talym Shoontar), for a random low-level spell and experience, plus faction with Peace Keepers and High Council of Erudin. Cleric or Paladin.",
    classes: ["cleric", "paladin"],
    minLevel: 15,
    steps: [
      "Turn in a Poacher Head to Jras Solsier in Erudin",
      "Kill Talym Shoontar for a Barbarian Head and turn it in to Jras Solsier",
    ],
    wiki_title: "Poacher Leader",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Peace Keepers");
  addFactionReward(questId, "High Council of Erudin");
}

// ---------------------------------------------------------------------
// Poison Cures
// ---------------------------------------------------------------------
{
  const zoneId = "zone:halas";
  const giverId = "npc:halas:waltor-felligan";
  addGiver(giverId, "Waltor Felligan", zoneId);

  const questId = "quest:poison-cures";
  addNode({
    id: questId,
    label: "Poison Cures",
    type: "quest",
    description: "Waltor Felligan in Halas trades Mammoth Steaks for the Cure Poison spell, cast on the player. All classes.",
    minLevel: 1,
    steps: [
      "Gather Mammoth Steaks",
      "Turn them in to Waltor Felligan in Halas",
    ],
    wiki_title: "Poison Cures",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "spell:cure-poison", "rewards");
}

// ---------------------------------------------------------------------
// Poison Sales
// ---------------------------------------------------------------------
{
  const zoneId = "zone:dagnor-s-cauldron";
  const giverId = "npc:dagnor-s-cauldron:conium-darkblade";
  addGiver(giverId, "Conium Darkblade", zoneId);

  const questId = "quest:poison-sales";
  addNode({
    id: questId,
    label: "Poison Sales",
    type: "quest",
    description: "Conium Darkblade in Dagnor's Cauldron trades 3 Giant Wasp Venom Sacs plus 30 gold for a Giant Wasp Venom. Rogue only.",
    classes: ["rogue"],
    minLevel: 8,
    steps: [
      "Gather 3 Giant Wasp Venom Sacs",
      "Turn them in with 30 gold to Conium Darkblade in Dagnor's Cauldron",
    ],
    wiki_title: "Poison Sales",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const venomId = "item:giant-wasp-venom";
  addNode({
    id: venomId,
    label: "Giant Wasp Venom",
    type: "item",
    classes: ["rogue"],
    charges: 1,
    effect: "Contact Poison I (Combat) at Level 5",
    weight: 0.2,
    size: "Small",
    source: "Poison Sales reward (Conium Darkblade, Dagnor's Cauldron)",
  });
  addEdge(questId, venomId, "rewards");
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 057 complete: added 25 more quests from GitHub issue #26's checklist");
