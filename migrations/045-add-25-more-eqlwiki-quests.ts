/**
 * Migration 045: 25 more quests off GitHub issue #26's checklist -- Blyle
 * Bundin's Head, Blizzent's Fang Quest, Bonethunder Staff Quest, Captain
 * Nalot's Triple Strength Rum, Chalice of Conquest Quest, Cindl's Wristband
 * Collection, Circlet of Mist Quest, Clurg's New Creation, Coldain
 * Military Wristguard Quest, Corrupt Guards, Cougarskin Boots/Mask/Sleeves
 * Quests, Crude Stein Quest, Crush the Undead, Crushbone Belts, Crushbone
 * Shoulderpads Quest, Cure for Lempeck Hargrin, Curscale Armor Quest,
 * Curscale Shield, Cursed Wafers Quest, Cutthroat Rings, Darkwood Staff
 * Quest, Drosco the Zombie (good), Drosco the Zombie (evil). Researched
 * directly against eqlwiki.com (each quest's own page), following
 * decisions/eqlwiki-quest-research-method.md. `located_in` follows the
 * broadened rule from migration 041 (decisions/quest-reward-modeling.md).
 *
 * Skipped this pass for missing-zone reasons: Bulthar Trunks and
 * Crustacean Shell Armor Quest (both centered on Cobalt Scar, which
 * doesn't exist in this graph -- Cobalt Scar is the *giver's* zone for
 * both, not just a farming stop); Burnished Wooden Staff Quest (giver in
 * Warsliks Woods, reward item drops in Chardok, neither zone exists);
 * Brain Bite (Evil)/(Good) (both require Trakanon's Teeth, Karnor's
 * Castle, and City of Mist, none of which exist); Dain's Head (the actual
 * kill target, Dain Frostreaver IV, is in Icewell Keep, which doesn't
 * exist -- unlike a farming stop, this is the quest's entire point).
 *
 * Also skipped: Bloodboil Quest -- its own page states "This quest is no
 * longer active," matching migration 040's precedent for skipping
 * confirmed-non-functional quests. Cutthroat Rings' "The Orc Picks"
 * prerequisite and Cure for Lempeck Hargrin's "Honey Jum Quest"
 * prerequisite are both still open items on the issue's own checklist --
 * left as prose-only prerequisite mentions here rather than modeled as
 * their own quest nodes in this batch (same "a scraper needs a human
 * decision, not a mechanical rule" reasoning as migration 028's Mold of Ro
 * Bracer). Clurg's Revenge and Collier's Weapon Treatment were both
 * researched but skipped -- their reward text didn't resolve to a clean,
 * unambiguous item (Clurg's Revenge lists four disconnected item names
 * with no stated selection rule; Collier's Weapon Treatment's reward
 * depends on a player-chosen forged weapon this graph has no crafting
 * model for). Cromil's Remains was skipped -- its own page states
 * conflicting information about the actual reward ("Hammer of Wrath" vs.
 * "Spook the Dead"), too unreliable a source to commit either way.
 *
 * Deliberately NOT modeled:
 * - Every vague/randomized "one item from a pool" reward (Blyle Bundin's
 *   Head's "one Bronze Weapon", Drosco the Zombie (evil)'s "a minor item
 *   (ex. Belt Pouch)", Corrupt Guards' 9-item random pool, Crushbone
 *   Belts' generic armor-slot list, Crushbone Shoulderpads Quest's 8-item
 *   pool, Curscale Armor Quest's unnamed "one piece of curscale armor",
 *   Coldain Military Wristguard Quest's exact cold/magic save numbers
 *   which its own page never states) -- consistent with every migration
 *   so far skipping rewards too vague or too broad to name confidently.
 *   Cindl's Wristband Collection and Crude Stein Quest are the exceptions:
 *   both name a small (2-3), fully concrete/statted set of alternatives,
 *   modeled as multiple `rewards` edges the same way migration 044's Rat
 *   Pelts modeled its 4-way choice.
 * - Negative faction changes throughout (e.g. Blizzent's Fang Quest's
 *   Coldain/Claws of Veeshan, Circlet of Mist Quest's Shadowed Men,
 *   Clurg's New Creation's Kazon Stormhammer) -- `rewards` only models
 *   positive rewards (decisions/quest-reward-modeling.md).
 * - Coin rewards -- no coin field on `quest` nodes, consistent with every
 *   migration so far.
 * - Trivial consumable/vendor-junk rewards with no real stats (Crush the
 *   Undead's Water Flask/Loaf of Bread, Cursed Wafers Quest's Cursed
 *   Wafers) -- not worth an item node.
 * - era -- unset; none of these quests' own pages state a content era tag.
 * - Faction *requirements* (e.g. Bonethunder Staff Quest's "follower of
 *   Karana", Cougarskin Boots Quest's "no faction hits") -- `quest` has no
 *   requirement field for this, same as every migration so far; noted in
 *   `description` prose only where it materially gates the quest.
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

const CASTER_EXCLUDED_CLASSES = [
  "bard", "beastlord", "berserker", "cleric", "druid", "monk",
  "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior",
];

// ---------------------------------------------------------------------
// Blyle Bundin's Head
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-kaladim";
  const butcherblockId = "zone:butcherblock-mountains";
  const giverId = "npc:south-kaladim:hogunk-ventille";
  addGiver(giverId, "Hogunk Ventille", zoneId);

  const questId = "quest:blyle-bundins-head";
  addNode({
    id: questId,
    label: "Blyle Bundin's Head",
    type: "quest",
    description:
      "Hogunk Ventille, in the spectator stands of the Kaladim Warrior's Guild arena in South Kaladim, sends anyone claiming to be a warrior of the Stormguard after Blyle Bundin, who patrols four spots in Butcherblock Mountains.",
    minLevel: 7,
    steps: [
      "Hail Hogunk Ventille and claim to be a warrior of the Stormguard",
      "Travel to Butcherblock Mountains and defeat Blyle Bundin, who patrols four locations",
      "Loot Blyle Bundin's Head and his rusty 'Stormguard' axe from his corpse",
      "Return both items to Hogunk Ventille",
    ],
    wiki_title: "Blyle Bundin's Head",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, butcherblockId, "located_in");
  addFactionReward(questId, "Storm Guard");
  addFactionReward(questId, "Kazon Stormhammer");
  addFactionReward(questId, "Miners Guild 249");
  addFactionReward(questId, "Merchants of Kaladim");
}

// ---------------------------------------------------------------------
// Blizzent's Fang Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const greatDivideId = "zone:great-divide";
  const giverId = "npc:kael-drakkal:reivaj-the-battlerager";
  addGiver(giverId, "Reivaj the Battlerager", zoneId);

  const questId = "quest:blizzents-fang-quest";
  addNode({
    id: questId,
    label: "Blizzent's Fang Quest",
    type: "quest",
    description:
      "Reivaj the Battlerager, in the Iceshard house in Kael Drakkal, sends anyone he's Amiable or better toward the wurm Blizzent in southern Great Divide. Open to all classes despite favoring warrior/paladin/shadow knight.",
    minLevel: 46,
    steps: [
      "Speak with Reivaj the Battlerager about Rallos Zek and Blizzent",
      "Travel to the southern Great Divide, near the young shard wurms, and defeat Blizzent",
      "Loot Blizzent's Fang",
      "Return the fang to Reivaj the Battlerager",
    ],
    wiki_title: "Blizzent's Fang Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, greatDivideId, "located_in");

  const swordId = "item:vehement-sword-of-reivaj";
  addNode({
    id: swordId,
    label: "Vehement Sword of Reivaj",
    type: "item",
    slots: ["Primary"],
    skill: "2H Slashing",
    damage: 27,
    stats: { str: 6, int: 6 },
    source: "Blizzent's Fang Quest reward (Reivaj the Battlerager, Kael Drakkal)",
  });
  addEdge(questId, swordId, "rewards");
  addFactionReward(questId, "Kromrif");
  addFactionReward(questId, "Kromzek");
}

// ---------------------------------------------------------------------
// Bonethunder Staff Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const surefallId = "zone:surefall-glade";
  const catacombsId = "zone:qeynos-catacombs";
  const giverId = "npc:south-qeynos:runethar-hamest";
  addGiver(giverId, "Runethar Hamest", zoneId);

  const questId = "quest:bonethunder-staff-quest";
  addNode({
    id: questId,
    label: "Bonethunder Staff Quest",
    type: "quest",
    description:
      "Runethar Hamest, at the Temple of Thunder in South Qeynos, sends followers of Karana to help Lord Bayle by combining a farmed Thunder Staff with a Bayle List II obtained in Surefall Glade.",
    classes: ["cleric", "paladin"],
    minLevel: 20,
    steps: [
      "Speak with Runethar Hamest at the Temple of Thunder in South Qeynos and agree to help Lord Bayle",
      "Travel to Surefall Glade and find Frenway Marthank",
      "Slay the bear Mammoth, or give it a Regurgitonic, to obtain the Bayle List II",
      "Complete Drosco the Zombie (good) in the Qeynos Catacombs to obtain a Thunder Staff",
      "Return the Thunder Staff and Bayle List II to Runethar Hamest",
    ],
    wiki_title: "Bonethunder Staff Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, surefallId, "located_in");
  addEdge(questId, catacombsId, "located_in");

  const staffId = "item:bonethunder-staff";
  addNode({
    id: staffId,
    label: "Bonethunder Staff",
    type: "item",
    slots: ["Primary"],
    skill: "2H Blunt",
    damage: 9,
    stats: { wis: 3 },
    effect: "Ward Undead",
    source: "Bonethunder Staff Quest reward (Runethar Hamest, South Qeynos)",
  });
  addEdge(questId, staffId, "rewards");
  addFactionReward(questId, "Knights of Thunder");
  addFactionReward(questId, "Priests of Life");
  addFactionReward(questId, "Guards of Qeynos");
}

// ---------------------------------------------------------------------
// Captain Nalot's Triple Strength Rum
// ---------------------------------------------------------------------
{
  const zoneId = "zone:iceclad-ocean";
  const wakeningId = "zone:the-wakening-land";
  const thurgadinId = "zone:thurgadin";
  const greatDivideId = "zone:great-divide";
  const easternWastesId = "zone:eastern-wastes";
  const giverId = "npc:iceclad-ocean:nilham-the-chef";
  addGiver(giverId, "Nilham the Chef", zoneId);

  const questId = "quest:captain-nalots-triple-strength-rum";
  addNode({
    id: questId,
    label: "Captain Nalot's Triple Strength Rum",
    type: "quest",
    description:
      "Nilham the Chef in Iceclad Ocean sends players on a long fetch-and-craft chain across the frozen north, trading components up through several NPCs to finally deliver rum to Captain Nalot and get a reward from Nelet Durzit at the docks. Requires Amiable or better with Thurgadin residents for one step.",
    minLevel: 40,
    classes: ["cleric", "druid", "enchanter", "magician", "necromancer", "shaman", "wizard"],
    steps: [
      "Collect two Barracuda Livers from coldwater barracudas in Cobalt Scar; trade to Qarrgy Scallopgobbler for a Bladder of Acidic Ooze",
      "Forage Fresh Tree Sap in The Wakening Land",
      "Give the sap and bladder to Pythic Urson in Thurgadin for Dissolving Liquid",
      "Give the dissolving liquid to a gnomish deserter in Great Divide for a Locked Rum Box",
      "Collect four Fresh Chunks of Wooly Rhino from Eastern Wastes; trade to Mist Panther in The Wakening Land for a Golden Broken Key",
      "Obtain a High Quality Dire Wolf Fur; trade to Errgriz in Iceclad Ocean for Wolf Fur Earcovers",
      "Give the earcovers to Sojan the Sleepless for a Fine Gold Chain",
      "Give the chain and key to Sojan the Sleepless for a Rum Box Key",
      "Give the key and locked box to Captain Nalot for Capt. Nalot's Triple Strength Rum",
      "Give the rum to Nelet Durzit at the docks for the final reward",
    ],
    wiki_title: "Captain Nalot's Triple Strength Rum",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, wakeningId, "located_in");
  addEdge(questId, thurgadinId, "located_in");
  addEdge(questId, greatDivideId, "located_in");
  addEdge(questId, easternWastesId, "located_in");

  const chainId = "item:rough-silver-chain";
  addNode({
    id: chainId,
    label: "Rough Silver Chain",
    type: "item",
    slots: ["Neck"],
    ac: 5,
    hp: 30,
    mana: 30,
    resists: { fire: 5, cold: 5, disease: 5, poison: 5, magic: 5 },
    lore: true,
    noTrade: true,
    source: "Captain Nalot's Triple Strength Rum reward (Nelet Durzit, Iceclad Ocean docks)",
  });
  addEdge(questId, chainId, "rewards");
}

// ---------------------------------------------------------------------
// Chalice of Conquest Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:butcherblock-mountains";
  const ratheId = "zone:rathe-mountains";
  const lakeRatheId = "zone:lake-rathetear";
  const halasId = "zone:halas";
  const dagnorId = "zone:dagnor-s-cauldron";
  const giverId = "npc:butcherblock-mountains:dru-razbind";
  addGiver(giverId, "Dru Razbind", zoneId);

  const questId = "quest:chalice-of-conquest-quest";
  addNode({
    id: questId,
    label: "Chalice of Conquest Quest",
    type: "quest",
    description:
      "Dru Razbind in Butcherblock Mountains sends paladins Amiable or better with the Paladins of Underfoot through a long chain: assemble and combine candlestick pieces into a Candle of Bravery, resurrect Captain Klunga to obtain the Chalice of Conquest, then trade up through two more NPCs for the final reward.",
    classes: ["paladin"],
    minLevel: 35,
    steps: [
      "Obtain the Stem and Foot of Candlestick from Nicholas and the Unkempt Druids in Rathe Mountains",
      "Collect an Abandoned Orc Shovel from Lake Rathetear and acquire Klunga's Bracelet from Nicholas",
      "Obtain Soil of Underfoot via a sub-quest with Priestess Ghalea, and a Honeycomb",
      "Combine the candlestick pieces with the Soil of Underfoot and Honeycomb at Dok in Halas for a Candle of Bravery",
      "Loot a Blood Stained Note from an Exiled Legionnaire in Dagnor's Cauldron",
      "Trade the note, Klunga's Bracelet, and 100 gold to Ghilanbiddle Nylwadil to resurrect Captain Klunga",
      "Give the Abandoned Orc Shovel to Captain Klunga, follow him, and defeat him for the Chalice of Conquest",
      "Combine the Chalice of Conquest with the Candle of Bravery in a Chalice Case",
      "Turn in the Chalice Case to Datur Nightseer for a Cape of Underfoot",
      "Return the cape to Dru Razbind for the final reward",
    ],
    wiki_title: "Chalice of Conquest Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, ratheId, "located_in");
  addEdge(questId, lakeRatheId, "located_in");
  addEdge(questId, halasId, "located_in");
  addEdge(questId, dagnorId, "located_in");

  const weaponId = "item:holy-partisan-of-underfoot";
  addNode({
    id: weaponId,
    label: "Holy Partisan of Underfoot",
    type: "item",
    slots: ["Primary"],
    skill: "2H Slashing",
    damage: 14,
    delay: 46,
    hp: 25,
    resists: { magic: 5 },
    source: "Chalice of Conquest Quest reward (Dru Razbind, Butcherblock Mountains)",
  });
  addEdge(questId, weaponId, "rewards");
}

// ---------------------------------------------------------------------
// Cindl's Wristband Collection
// ---------------------------------------------------------------------
{
  const zoneId = "zone:halas";
  const everfrostId = "zone:everfrost-peaks";
  const giverId = "npc:halas:cindl";
  addGiver(giverId, "Cindl", zoneId);

  const questId = "quest:cindls-wristband-collection";
  addNode({
    id: questId,
    label: "Cindl's Wristband Collection",
    type: "quest",
    description: "Cindl, inside Mac's Kilts in Halas, trades 2 Wrath Orc Wristbands from Everfrost Peaks snow orcs for a choice of starter armor.",
    minLevel: 7,
    steps: [
      "Speak with Cindl about her second job",
      "Collect 2 Wrath Orc Wristbands from snow orc troopers and shamans in Everfrost Peaks",
      "Return the wristbands to Cindl for a choice of reward",
    ],
    wiki_title: "Cindl's Wristband Collection",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, everfrostId, "located_in");

  const glovesId = "item:leather-gloves-cindl";
  addNode({ id: glovesId, label: "Leather Gloves", type: "item", slots: ["Hands"], ac: 4, source: "Cindl's Wristband Collection reward choice (Cindl, Halas)" });
  const leggingsId = "item:raw-hide-leggings";
  addNode({ id: leggingsId, label: "Raw-hide Leggings", type: "item", slots: ["Legs"], ac: 5, source: "Cindl's Wristband Collection reward choice (Cindl, Halas)" });
  const tunicId = "item:raw-hide-tunic";
  addNode({ id: tunicId, label: "Raw-hide Tunic", type: "item", slots: ["Chest"], ac: 8, source: "Cindl's Wristband Collection reward choice (Cindl, Halas)" });
  addEdge(questId, glovesId, "rewards");
  addEdge(questId, leggingsId, "rewards");
  addEdge(questId, tunicId, "rewards");
  addFactionReward(questId, "Merchants of Halas");
  addFactionReward(questId, "Wolves of the North");
  addFactionReward(questId, "Shamen of Justice");
}

// ---------------------------------------------------------------------
// Circlet of Mist Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:temple-of-solusek-ro";
  const unrestId = "zone:the-estate-of-unrest";
  const dagnorId = "zone:dagnor-s-cauldron";
  const cazicId = "zone:temple-of-cazic-thule";
  const giverId = "npc:temple-of-solusek-ro:joyce";
  addGiver(giverId, "Joyce", zoneId);

  const questId = "quest:circlet-of-mist-quest";
  addNode({
    id: questId,
    label: "Circlet of Mist Quest",
    type: "quest",
    description: "Joyce, on a balcony in the upper Temple of Solusek Ro, trades three farmed reagents plus a purchased Sapphire for a magician headpiece.",
    classes: ["magician"],
    minLevel: 30,
    steps: [
      "Obtain a Globe of Mist from a festering hag in The Estate of Unrest",
      "Obtain a Water Ring from a Tidal Lord in Dagnor's Cauldron",
      "Obtain a Ring of Evoluoy from an alligator in Temple of Cazic Thule",
      "Purchase a Sapphire from a jewelry merchant (roughly 105 platinum)",
      "Return all items to Joyce",
    ],
    wiki_title: "Circlet of Mist Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, unrestId, "located_in");
  addEdge(questId, dagnorId, "located_in");
  addEdge(questId, cazicId, "located_in");

  const circletId = "item:circlet-of-mist";
  addNode({
    id: circletId,
    label: "Circlet of Mist",
    type: "item",
    slots: ["Head"],
    ac: 5,
    stats: { wis: 3, int: 3, agi: 3 },
    source: "Circlet of Mist Quest reward (Joyce, Temple of Solusek Ro)",
  });
  addEdge(questId, circletId, "rewards");
  addFactionReward(questId, "Temple of Sol Ro");
}

// ---------------------------------------------------------------------
// Drosco the Zombie (good)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const catacombsId = "zone:qeynos-catacombs";
  const giverId = "npc:south-qeynos:wolten-grafe";
  addGiver(giverId, "Wolten Grafe", zoneId);

  const questId = "quest:drosco-the-zombie-good";
  addNode({
    id: questId,
    label: "Drosco the Zombie (good)",
    type: "quest",
    description: "Wolten Grafe in South Qeynos sends good-aligned players after Drosco in room 7 of the Qeynos Catacombs for a rare Thunder Staff drop; feeds into the Bonethunder Staff Quest.",
    classes: ["cleric", "paladin"],
    minLevel: 8,
    steps: [
      "Receive a Tattered Note from Wolten Grafe",
      "Find and defeat Drosco in room 7 of the Qeynos Catacombs",
      "Loot A Sealed Letter (occasional drop) and return it to Wolten Grafe",
      "Loot Drosco's rare Order of Thunder drop and return it to Wolten Grafe for the final reward",
    ],
    wiki_title: "Drosco the Zombie (good)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, catacombsId, "located_in");

  const staffId = "item:thunder-staff";
  addNode({
    id: staffId,
    label: "Thunder Staff",
    type: "item",
    slots: ["Primary"],
    skill: "2H Blunt",
    damage: 5,
    stats: { wis: 3 },
    classes: ["cleric", "paladin"],
    source: "Drosco the Zombie (good) reward (Wolten Grafe, South Qeynos)",
  });
  addEdge(questId, staffId, "rewards");
  addFactionReward(questId, "Knights of Thunder");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Priests of Life");
}

// ---------------------------------------------------------------------
// Drosco the Zombie (evil)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:qeynos-catacombs";
  const giverId = "npc:qeynos-catacombs:kurne-rextula";
  addGiver(giverId, "Kurne Rextula", zoneId);

  const questId = "quest:drosco-the-zombie-evil";
  addNode({
    id: questId,
    label: "Drosco the Zombie (evil)",
    type: "quest",
    description: "Kurne Rextula, in the Bloodsabers Guild inside the Qeynos Catacombs, sends players after Drosco (or his placeholder, A Gelatinous Cube) for a Sealed Letter turn-in.",
    minLevel: 1,
    steps: [
      "Hail Kurne Rextula in the Bloodsabers Guild and ask about Drosco",
      "Locate and defeat Drosco, or his placeholder A Gelatinous Cube, roaming west from spawn",
      "Loot A Sealed Letter from the corpse",
      "Return the letter to Kurne Rextula",
    ],
    wiki_title: "Drosco the Zombie (evil)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Bloodsabers");
}

// ---------------------------------------------------------------------
// Clurg's New Creation
// ---------------------------------------------------------------------
{
  const zoneId = "zone:oggok";
  const cazicId = "zone:temple-of-cazic-thule";
  const feerrottId = "zone:the-feerrott";
  const ratheId = "zone:rathe-mountains";
  const giverId = "npc:oggok:clurg";
  addGiver(giverId, "Clurg", zoneId);

  const questId = "quest:clurgs-new-creation";
  addNode({
    id: questId,
    label: "Clurg's New Creation",
    type: "quest",
    description: "Clurg, the Oggok bartender, trades 2 Lizard Tails from lizardmen for faction and experience.",
    minLevel: 1,
    steps: ["Collect 2 Lizard Tails from lizardmen in Temple of Cazic Thule, The Feerrott, or Rathe Mountains", "Return the tails to Clurg"],
    wiki_title: "Clurg's New Creation",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, cazicId, "located_in");
  addEdge(questId, feerrottId, "located_in");
  addEdge(questId, ratheId, "located_in");
  addFactionReward(questId, "Clurg");
  addFactionReward(questId, "Green Blood Knights");
  addFactionReward(questId, "Craknek Warriors");
  addFactionReward(questId, "Oggok Guards");
}

// ---------------------------------------------------------------------
// Coldain Military Wristguard Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const thurgadinId = "zone:thurgadin";
  const greatDivideId = "zone:great-divide";
  const giverId = "npc:kael-drakkal:a-frost-giant-wolf-tamer";
  addGiver(giverId, "a frost giant wolf tamer", zoneId);

  const questId = "quest:coldain-military-wristguard-quest";
  addNode({
    id: questId,
    label: "Coldain Military Wristguard Quest",
    type: "quest",
    description:
      "A frost giant wolf tamer under the bridge to King Tormax's throne room in Kael Drakkal trades up a chain of gems and harnesses, ending with a kill in Great Divide's Coldain mining caves. Requires at least Dubious faction with both the Coldain and the Kromrif/Kromzek.",
    minLevel: 50,
    steps: [
      "Obtain a Bottle of Karsin Acid from orcs or geonids in Crystal Caverns",
      "Deliver the acid to Erdarf Restil in Thurgadin for a Gem of Persuasion",
      "Trade the gem to the frost giant wolf tamer for a Giant's Gem of Persuasion",
      "Trade the Giant's Gem back for a Giants Harness of Control",
      "Give the harness to the Shardwurm Broodmother in Great Divide's wurm caves",
      "Locate and kill Korf Brokenhammer at the Coldain mining caves in southeast Great Divide",
    ],
    wiki_title: "Coldain Military Wristguard Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, thurgadinId, "located_in");
  addEdge(questId, greatDivideId, "located_in");

  const wristguardId = "item:coldain-military-wristguard";
  addNode({
    id: wristguardId,
    label: "Coldain Military Wristguard",
    type: "item",
    slots: ["Wrist"],
    ac: 10,
    stats: { str: 5, wis: 6 },
    lore: true,
    noTrade: true,
    source: "Coldain Military Wristguard Quest reward (a frost giant wolf tamer, Kael Drakkal)",
  });
  addEdge(questId, wristguardId, "rewards");
}

// ---------------------------------------------------------------------
// Corrupt Guards
// ---------------------------------------------------------------------
{
  const zoneId = "zone:northern-karana";
  const westKaranaId = "zone:west-karana";
  const giverId = "npc:northern-karana:capt-linarius";
  addGiver(giverId, "Capt Linarius", zoneId);

  const questId = "quest:corrupt-guards";
  addNode({
    id: questId,
    label: "Corrupt Guards",
    type: "quest",
    description: "Capt Linarius in Northern Karana sends players after corrupt guards McCluskey and Donlan in West Karana; requires better than Dubious faction to turn in.",
    minLevel: 15,
    steps: [
      "Hail Capt Linarius and inquire about corrupt guards",
      "Locate Guard McCluskey or Guard Donlan in West Karana",
      "Defeat them to obtain a Corrupt Guard Bracelet",
      "Return the bracelet to Capt Linarius",
    ],
    wiki_title: "Corrupt Guards",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, westKaranaId, "located_in");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Antonius Bayle");
  addFactionReward(questId, "Merchants of Qeynos");
}

// ---------------------------------------------------------------------
// Cougarskin Boots Quest / Cougarskin Mask Quest / Cougarskin Sleeves Quest
// (same giver, Ergrez Shortpaw in Iceclad Ocean)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:iceclad-ocean";
  const easternWastesId = "zone:eastern-wastes";
  const giverId = "npc:iceclad-ocean:ergrez-shortpaw";
  addGiver(giverId, "Ergrez Shortpaw", zoneId);

  {
    const questId = "quest:cougarskin-boots-quest";
    addNode({
      id: questId,
      label: "Cougarskin Boots Quest",
      type: "quest",
      description: "Ergrez Shortpaw in Iceclad Ocean trades a Medium Quality Cougarskin and 2 Cutting Shells for a pair of boots. No faction hits.",
      classes: CASTER_EXCLUDED_CLASSES,
      minLevel: 30,
      steps: [
        "Collect a Medium Quality Cougarskin from snow cougars in Eastern Wastes or Iceclad Ocean",
        "Collect 2 Cutting Shells, a ground spawn in the water in Cobalt Scar",
        "Turn both in to Ergrez Shortpaw",
      ],
      wiki_title: "Cougarskin Boots Quest",
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, easternWastesId, "located_in");

    const bootsId = "item:cougarskin-boots";
    addNode({ id: bootsId, label: "Cougarskin Boots", type: "item", slots: ["Feet"], classes: CASTER_EXCLUDED_CLASSES, ac: 4, stats: { str: 3, sta: 4 }, source: "Cougarskin Boots Quest reward (Ergrez Shortpaw, Iceclad Ocean)" });
    addEdge(questId, bootsId, "rewards");
  }

  {
    const questId = "quest:cougarskin-mask-quest";
    addNode({
      id: questId,
      label: "Cougarskin Mask Quest",
      type: "quest",
      description: "Ergrez Shortpaw in Iceclad Ocean trades a High Quality Cougarskin and 2 Mammoth Meat for a face mask.",
      classes: CASTER_EXCLUDED_CLASSES,
      minLevel: 33,
      steps: [
        "Collect a High Quality Cougarskin from snow cougars in Eastern Wastes",
        "Collect 2 Mammoth Meat",
        "Deliver both to Ergrez Shortpaw",
      ],
      wiki_title: "Cougarskin Mask Quest",
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, easternWastesId, "located_in");

    const maskId = "item:cougarskin-mask";
    addNode({ id: maskId, label: "Cougarskin Mask", type: "item", slots: ["Face"], classes: CASTER_EXCLUDED_CLASSES, ac: 6, stats: { dex: 2, agi: 2 }, hp: 10, magic: true, noTrade: true, source: "Cougarskin Mask Quest reward (Ergrez Shortpaw, Iceclad Ocean)" });
    addEdge(questId, maskId, "rewards");
  }

  {
    const questId = "quest:cougarskin-sleeves-quest";
    addNode({
      id: questId,
      label: "Cougarskin Sleeves Quest",
      type: "quest",
      description: "Ergrez Shortpaw in Iceclad Ocean trades a Low Quality Cougarskin and Fatty Walrus Meat for arm armor.",
      classes: CASTER_EXCLUDED_CLASSES,
      minLevel: 30,
      steps: [
        "Collect a Low Quality Cougarskin from snow cougars in Eastern Wastes or Iceclad Ocean",
        "Collect Fatty Walrus Meat from walrus or Ulthork in Eastern Wastes, Cobalt Scar, or Siren's Grotto",
        "Hand both to Ergrez Shortpaw",
      ],
      wiki_title: "Cougarskin Sleeves Quest",
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, easternWastesId, "located_in");

    const sleevesId = "item:cougarskin-sleeves";
    addNode({ id: sleevesId, label: "Cougarskin Sleeves", type: "item", slots: ["Arms"], classes: CASTER_EXCLUDED_CLASSES, ac: 6, stats: { dex: 3, sta: 3, wis: 3 }, magic: true, noTrade: true, source: "Cougarskin Sleeves Quest reward (Ergrez Shortpaw, Iceclad Ocean)" });
    addEdge(questId, sleevesId, "rewards");
  }
}

// ---------------------------------------------------------------------
// Crude Stein Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:oggok";
  const innothuleId = "zone:innothule-swamp";
  const neriakForeignId = "zone:neriak-foreign-quarter";
  const nektulosId = "zone:nektulos-forest";
  const crushboneId = "zone:crushbone";
  const giverId = "npc:oggok:lork";
  addGiver(giverId, "Lork", zoneId);

  const questId = "quest:crude-stein-quest";
  addNode({
    id: questId,
    label: "Crude Stein Quest",
    type: "quest",
    description: "Lork, at the Oggok warrior guild, sends players through a multi-zone fetch-and-kill chain ending in two Ambassador kills for a rare weapon or drinkware reward.",
    minLevel: 26,
    steps: [
      "Kill a fat alligator in Innothule Swamp, loot an Ogre Arm, and return it to Lork",
      "Bring A Cracked Stein to Uglan in Neriak Foreign Quarter",
      "Intercept and kill an orc runner in Nektulos Forest for a Sealed Letter",
      "Return the letter to Lork in Oggok",
      "Kill Ambassador K'Ryn in Oggok's shaman guild tunnels and loot his heart",
      "Kill Ambassador DVinn (Lord Crushbone) in Crushbone and loot his Black Heart",
      "Return both hearts to Lork",
    ],
    wiki_title: "Crude Stein Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, innothuleId, "located_in");
  addEdge(questId, neriakForeignId, "located_in");
  addEdge(questId, nektulosId, "located_in");
  addEdge(questId, crushboneId, "located_in");

  const steinId = "item:a-crude-stein";
  addNode({ id: steinId, label: "A Crude Stein", type: "item", slots: ["Secondary"], stats: { sta: 10, cha: 15 }, effect: "Minor Healing", source: "Crude Stein Quest rare reward (Lork, Oggok)" });
  const maulId = "item:gatorsmash-maul";
  addNode({ id: maulId, label: "Gatorsmash Maul", type: "item", slots: ["Primary"], skill: "2H Blunt", damage: 30, source: "Crude Stein Quest rare reward (Lork, Oggok)" });
  addEdge(questId, steinId, "rewards");
  addEdge(questId, maulId, "rewards");
}

// ---------------------------------------------------------------------
// Crush the Undead
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:wolten-grafe";
  addGiver(giverId, "Wolten Grafe", zoneId);

  const questId = "quest:crush-the-undead";
  addNode({
    id: questId,
    label: "Crush the Undead",
    type: "quest",
    description: "Wolten Grafe in South Qeynos hands out a Box For Bones and trades a completed Box of Bones (6 normal Bone Chips) for a snack and faction. Doesn't work at Indifferent faction.",
    minLevel: 1,
    steps: [
      "Hail Wolten Grafe and choose the 'crush the undead' mission",
      "Receive a Box For Bones (6-slot container)",
      "Collect 6 normal Bone Chips and combine them in the box",
      "Return the Box of Bones to Wolten Grafe",
    ],
    wiki_title: "Crush the Undead",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Knights of Thunder");
  addFactionReward(questId, "Priests of Life");
  addFactionReward(questId, "Guards of Qeynos");
}

// ---------------------------------------------------------------------
// Crushbone Belts / Crushbone Shoulderpads Quest
// (same giver, Canloe Nusback in South Kaladim)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-kaladim";
  const giverId = "npc:south-kaladim:canloe-nusback";
  addGiver(giverId, "Canloe Nusback", zoneId);

  {
    const questId = "quest:crushbone-belts";
    addNode({
      id: questId,
      label: "Crushbone Belts",
      type: "quest",
      description: "Canloe Nusback in the South Kaladim Warrior's Guild trades a Crushbone Belt, looted from Orc Centurions around Faydwer, for coin, experience, and a choice of starter armor. Requires at least Dubious with Storm Guard.",
      classes: ["bard", "cleric", "druid", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"],
      minLevel: 2,
      steps: [
        "Hail Canloe Nusback and offer to serve Kaladim",
        "Hand over a Crushbone Belt, randomly looted from Orc Centurions around Faydwer",
        "Optionally turn in two Orc Legionnaire Shoulderpads for an additional reward",
      ],
      wiki_title: "Crushbone Belts",
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addFactionReward(questId, "Storm Guard");
    addFactionReward(questId, "Kazon Stormhammer");
    addFactionReward(questId, "Miners Guild 249");
    addFactionReward(questId, "Merchants of Kaladim");
  }

  {
    const questId = "quest:crushbone-shoulderpads-quest";
    addNode({
      id: questId,
      label: "Crushbone Shoulderpads Quest",
      type: "quest",
      description: "Canloe Nusback in the South Kaladim Warrior's Guild trades 2 Crushbone Shoulderpads, looted from Orc Legionnaires around Faydwer, for coin and experience. Repeatable turn-in.",
      minLevel: 6,
      steps: [
        "Speak with Canloe Nusback and accept the mission to destroy Crushbone orcs",
        "Hand over 2 Crushbone Shoulderpads, randomly looted from Orc Legionnaires around Faydwer",
      ],
      wiki_title: "Crushbone Shoulderpads Quest",
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addFactionReward(questId, "Storm Guard");
    addFactionReward(questId, "Kazon Stormhammer");
    addFactionReward(questId, "Miners Guild 249");
    addFactionReward(questId, "Merchants of Kaladim");
  }
}

// ---------------------------------------------------------------------
// Cure for Lempeck Hargrin
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-qeynos";
  const rivervaleId = "zone:rivervale";
  const westKaranaId = "zone:west-karana";
  const giverId = "npc:north-qeynos:astaed-wemor";
  addGiver(giverId, "Astaed Wemor", zoneId);

  const questId = "quest:cure-for-lempeck-hargrin";
  addNode({
    id: questId,
    label: "Cure for Lempeck Hargrin",
    type: "quest",
    description:
      "Astaed Wemor of the Paladins of the Temple of Life, in North Qeynos, sends players on a delivery chain through Rivervale (via the Honey Jum Quest) and West Karana. Requires Amiable faction or better.",
    classes: ["cleric", "paladin"],
    minLevel: 1,
    steps: [
      "Complete the Honey Jum Quest in Rivervale with Kizzie Mintopp to obtain Honey Jum",
      "Return to North Qeynos and give Honey Jum to Astaed Wemor for a Prime Healer Potion",
      "Travel to West Karana and deliver the potion to Lempeck Hargrin for a Rusty Scythe",
      "Return the Rusty Scythe to Astaed Wemor for the final reward",
    ],
    wiki_title: "Cure for Lempeck Hargrin",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, rivervaleId, "located_in");
  addEdge(questId, westKaranaId, "located_in");

  const swordId = "item:shining-star-of-light";
  addNode({
    id: swordId,
    label: "Shining Star of Light",
    type: "item",
    slots: ["Primary"],
    skill: "1H Blunt",
    damage: 6,
    effect: "Cleanse",
    magic: true,
    source: "Cure for Lempeck Hargrin reward (Astaed Wemor, North Qeynos)",
  });
  addEdge(questId, swordId, "rewards");
  addFactionReward(questId, "Priests of Life");
  addFactionReward(questId, "Knights of Thunder");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Antonius Bayle");
}

// ---------------------------------------------------------------------
// Curscale Shield / Curscale Armor Quest
// (same giver zone, East Cabilis, different NPCs)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-cabilis";
  const fieldOfBoneId = "zone:field-of-bone";

  {
    const giverId = "npc:east-cabilis:drill-master-dal";
    addGiver(giverId, "Drill Master Dal", zoneId);

    const questId = "quest:curscale-shield";
    addNode({
      id: questId,
      label: "Curscale Shield",
      type: "quest",
      description: "Drill Master Dal, at Fortress Talishan in East Cabilis, hands new recruits a Partisan Pack to fill with four farmed items and trade back for a shield.",
      classes: ["warrior", "shadow knight", "monk", "shaman"],
      minLevel: 5,
      steps: [
        "Hail Drill Master Dal and indicate you're a new recruit",
        "Receive a Partisan Pack",
        "Collect Goblin Scout Beads, a sabertooth kitten canine, a giant blood sac from a giant leech, and three Bone Chips from skeletons",
        "Combine the items in the pack to create a Full Partisan Pack",
        "Return the completed pack to Drill Master Dal",
      ],
      wiki_title: "Curscale Shield",
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");

    const bucklerId = "item:curscale-buckler";
    addNode({ id: bucklerId, label: "Curscale Buckler", type: "item", slots: ["Secondary"], ac: 4, resists: { fire: 1 }, lore: true, source: "Curscale Shield reward (Drill Master Dal, East Cabilis)" });
    addEdge(questId, bucklerId, "rewards");
    addFactionReward(questId, "Legion of Cabilis");
    addFactionReward(questId, "Cabilis Residents");
    addFactionReward(questId, "Scaled Mystics");
    addFactionReward(questId, "Crusaders Of Greenmist");
    addFactionReward(questId, "Swift Tails");
  }

  {
    const giverId = "npc:east-cabilis:klok-mugruk";
    addGiver(giverId, "Klok Mugruk", zoneId);

    const questId = "quest:curscale-armor-quest";
    addNode({
      id: questId,
      label: "Curscale Armor Quest",
      type: "quest",
      description: "Klok Mugruk, at the Haggle Baron in East Cabilis, hands out an Empty Curskin Bag to fill with scaled curskin from Field of Bone wolf pups and cubs; repeatable for additional armor pieces.",
      minLevel: 1,
      steps: [
        "Receive an Empty Curskin Bag from Klok Mugruk",
        "Hunt scaled wolf pups and cubs in Field of Bone and fill the bag with eight scaled curskin",
        "Combine the skins into a Full Curskin Bag",
        "Return the Full Curskin Bag to Klok Mugruk",
      ],
      wiki_title: "Curscale Armor Quest",
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, fieldOfBoneId, "located_in");
    addFactionReward(questId, "Cabilis Residents");
    addFactionReward(questId, "Legion of Cabilis");
  }
}

// ---------------------------------------------------------------------
// Cursed Wafers Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-cabilis";
  const lakeOfIllOmenId = "zone:lake-of-ill-omen";
  const giverId = "npc:east-cabilis:hierophant-oxyn";
  addGiver(giverId, "Hierophant Oxyn", zoneId);

  const questId = "quest:cursed-wafers-quest";
  addNode({
    id: questId,
    label: "Cursed Wafers Quest",
    type: "quest",
    description: "Hierophant Oxyn, at the Temple of Terror in East Cabilis, trades a Full Component Mortar (small mosquito wings, a bone chip, and foraged Lake of Ill Omen mud crabs) for a snack and faction.",
    classes: ["shaman"],
    minLevel: 1,
    steps: [
      "Collect two Small Mosquito Wings and one Bone Chips",
      "Forage one Mud Crabs in Lake of Ill Omen",
      "Combine all four unstacked items in a Component Mortar to make a Full Component Mortar",
      "Return the filled mortar to Hierophant Oxyn",
    ],
    wiki_title: "Cursed Wafers Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, lakeOfIllOmenId, "located_in");
  addFactionReward(questId, "Scaled Mystics");
  addFactionReward(questId, "Legion of Cabilis");
}

// ---------------------------------------------------------------------
// Cutthroat Rings
// ---------------------------------------------------------------------
{
  const zoneId = "zone:west-commonlands";
  const northRoId = "zone:northern-desert-of-ro";
  const southRoId = "zone:southern-desert-of-ro";
  const giverId = "npc:west-commonlands:guard-valon";
  addGiver(giverId, "Guard Valon", zoneId);

  const questId = "quest:cutthroat-rings";
  addNode({
    id: questId,
    label: "Cutthroat Rings",
    type: "quest",
    description:
      "Guard Valon at the West Commonlands toll booth trades a filled Bag for Cutthroat Rings, farmed from dervish cutthroats, for a Militia Armory Token. Requires the Orc Picks quest first and at least Indifferent faction with the Freeport Militia.",
    minLevel: 10,
    steps: [
      "Complete the Orc Picks quest (turn in 4 Orc Pawn Picks) first",
      "Request to hunt dervish cutthroats from Guard Valon and receive an 8-slot Bag for Cutthroat Rings",
      "Hunt dervish cutthroats in West Commonlands, Northern Desert of Ro, and Southern Desert of Ro for Cutthroat Insignia Rings",
      "Combine the rings in the container and turn in the result to Guard Valon",
    ],
    wiki_title: "Cutthroat Rings",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, northRoId, "located_in");
  addEdge(questId, southRoId, "located_in");

  const tokenId = "item:militia-armory-token";
  addNode({ id: tokenId, label: "Militia Armory Token", type: "item", source: "Cutthroat Rings reward (Guard Valon, West Commonlands)" });
  addEdge(questId, tokenId, "rewards");
  addEdge(questId, "faction:coalition-of-tradefolk-underground", "rewards");
  addNode({ id: "faction:the-freeport-militia", label: "The Freeport Militia", type: "faction" });
  addEdge(questId, "faction:the-freeport-militia", "rewards");
}

// ---------------------------------------------------------------------
// Darkwood Staff Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:temple-of-solusek-ro";
  const giverId = "npc:temple-of-solusek-ro:romar-sunto";
  addGiver(giverId, "Romar Sunto", zoneId);

  const questId = "quest:darkwood-staff-quest";
  addNode({
    id: questId,
    label: "Darkwood Staff Quest",
    type: "quest",
    description: "Romar Sunto, in a library room in Temple of Solusek Ro, trades a Lambent Stone (from a hill giant, sand giant, or griffin) for a wizard staff.",
    classes: ["wizard"],
    minLevel: 30,
    steps: ["Hail Romar Sunto and ask about darkwood staves", "Obtain a Lambent Stone from a hill giant, sand giant, or griffin", "Return the Lambent Stone to Romar Sunto"],
    wiki_title: "Darkwood Staff Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const staffId = "item:darkwood-staff";
  addNode({ id: staffId, label: "Darkwood Staff", type: "item", slots: ["Primary"], skill: "1H Blunt", damage: 5, delay: 28, source: "Darkwood Staff Quest reward (Romar Sunto, Temple of Solusek Ro)" });
  addEdge(questId, staffId, "rewards");
  addFactionReward(questId, "Temple of Sol Ro");
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 045 complete: added 25 more quests from GitHub issue #26's checklist");
