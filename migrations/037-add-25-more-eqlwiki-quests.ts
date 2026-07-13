/**
 * Migration 037: 25 more quests off GitHub issue #26's checklist -- Acumen
 * Mask Quest, Aegis of Life Quest, Assist the Great Xelha, Azraxs' Legacy,
 * Azzar's Dreadful Hat Quest, Bandit Sisters, Bard Reports, Bat Fur Quest,
 * Bear Hide Armor, Beguile Plants Quest, Behead the Freeport Militia,
 * Black Wolf Skin Quest, Blackburrow Brewers, Blank Scrolls, Broom Of
 * Trilon Quest, Bugglegupp (Quest), Caduceus of Sacrament Quest, Catfish
 * Croak Sandwich Quest, Catman Alliance, Cindl's Polar Bear Collection,
 * Clay Bracelet Quest, Cleanse the Ocean, Coin of Tash (Tashania), Cold
 * Iron, Collect Drops of Shadow. Researched directly against eqlwiki.com
 * (each quest's own page plus its reward items' pages), following
 * decisions/eqlwiki-quest-research-method.md.
 *
 * Picked for existing-zone coverage, same rule as migrations 034/036.
 * Skipped this pass for missing-zone reasons: Bladed Weapons (Kelethin),
 * Burnished Wooden Staff Quest (Warsliks Woods), Cleaner Clockwork (South
 * Kaladim), Clear Water Quest (Erudin Palace). Skipped as not real/
 * verifiable/currently obtainable, per the wiki pages themselves: Bloodboil
 * Quest ("This quest is no longer active"), Cabilis Pale Ale (Firiona Vie)
 * ("UNKNOWN! Please correct", "an unsolved or broken quest"). Captain
 * Nalot's Triple Strength Rum was skipped for the same reason Chalice of
 * Conquest Quest was in migration 036 -- a 13-leg fetch chain disproportionate
 * to one migration entry.
 *
 * Caleah Herblender (Bat Fur Quest's giver) already exists in the graph as
 * a spell vendor (`vendor:south-qeynos:caleah-herblender`) from earlier
 * spell-scraping work -- reused directly rather than creating a duplicate
 * `npc:...` node for the same person, with "quest_giver" added to her
 * existing `roles`.
 *
 * Deliberately NOT modeled:
 * - Large random-reward pools (6+ options) where cataloging every option
 *   would be disproportionate to one quest entry: Bandit Sisters (8 items),
 *   Cindl's Polar Bear Collection (13 items) -- left as prose. This is a
 *   practical size cutoff, not a new rule about randomness itself --
 *   smaller pools (this migration's own Black Wolf Skin Quest and Bugglegupp,
 *   migration 036's Basilisk Tongues) are still modeled item-by-item/
 *   spell-by-spell, same as always.
 * - Cleanse the Ocean's "a random piece of Patchwork Armor" -- this is the
 *   same Small Patchwork armor set migration 036's Aviak Chicks already
 *   modeled in full (Small Patchwork Boots/Cloak/Pants/Sleeves/Tunic), so
 *   those five existing item nodes are reused as this quest's rewards too
 *   rather than re-fetched or left as prose.
 * - "Penumbral Rod" (Collect Drops of Shadow's reward) -- every title
 *   guessed for its own item page 404'd, the same "guessed title can 404"
 *   gotcha as Research Aid's "Runes and Research" (migration 028); left as
 *   prose, not fabricated as a node.
 * - Bandages (Black Wolf Skin Quest's first-listed reward option) --
 *   generic consumable, not a distinct piece of equipment; prose only,
 *   same treatment as migration 033's "Rusty Weapons."
 * - Every *worsened* faction each quest also states (Shadowed Men, Ring of
 *   Scale, Mayong Mistmoore, Bloodsabers, Opal Dark Briar, Knights of
 *   Truth, Deepwater Knights/Gate Callers/Craftkeepers/Crimson Hands,
 *   Legion of Cabilis, Pirates of Gunthak, The Dead, Sabertooths of
 *   Blackburrow, Heretics, The Freeport Militia, Dismal Rage, Craknek
 *   Warriors) -- `rewards` only models a positive reward (decisions/
 *   quest-reward-modeling.md); left as prose.
 * - Coin/platinum/gold payouts -- no coin field on `quest` nodes.
 * - `era` -- no era tag stated on any of these 25 quests' own pages, so
 *   left unset rather than guessed (decisions/quest-era-flagging.md).
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
// Acumen Mask Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:temple-of-solusek-ro";
  const giverId = "npc:temple-of-solusek-ro:vilissia";
  addGiver(giverId, "Vilissia", zoneId);

  const questId = "quest:acumen-mask-quest";
  addNode({
    id: questId,
    label: "Acumen Mask Quest",
    type: "quest",
    description: "Vilissia in the Temple of Solusek Ro sends wizards after four cursed relics -- a Glowing Mask, a Patch of Shadow, a Darkbone Skull, and a Bonechipped Mask -- for the Acumen Mask.",
    classes: ["wizard"],
    minLevel: 26,
    steps: [
      "Obtain a Glowing Mask from a skeleton monk or A Froglok Scryer in Upper Guk",
      "Obtain a Patch of Shadow from a shadowed man",
      "Obtain a Darkbone Skull from a greater dark bone in The Estate of Unrest",
      "Obtain a Bonechipped Mask from A Goblin Headmaster in Ocean of Tears",
      "Return all four items to Vilissia",
    ],
    wiki_title: "Acumen Mask Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const maskId = "item:acumen-mask";
  addNode({
    id: maskId,
    label: "Acumen Mask",
    type: "item",
    slots: ["Face"],
    ac: 4,
    stats: { wis: 2, int: 5 },
    magic: true,
    lore: true,
    noTrade: true,
    effect: "Gaze (Any Slot/Can Equip, Casting Time: Instant) at Level 20",
    source: "Acumen Mask Quest reward (Vilissia, Temple of Solusek Ro)",
  });
  addEdge(questId, maskId, "rewards");

  addFactionReward(questId, "Temple Of Sol Ro");
}

// ---------------------------------------------------------------------
// Aegis of Life Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:northern-karana";
  const giverId = "npc:northern-karana:capt-linarius";
  addGiver(giverId, "Capt Linarius", zoneId);

  const questId = "quest:aegis-of-life-quest";
  addNode({
    id: questId,
    label: "Aegis of Life Quest",
    type: "quest",
    description: "Capt Linarius, on the bridge to South Karana, sends clerics and paladins after Lord Grimrot -- requires Warmly faction with Camlend Serbold in Qeynos to complete the turn-in, or the quest items are lost.",
    classes: ["cleric", "paladin"],
    minLevel: 35,
    steps: [
      "Speak with Capt Linarius on the bridge to South Karana and travel to Qeynos to tell Camlend Serbold of Lord Grimrot",
      "Find Lord Grimrot in the Plains of Karana and defeat both his living and undead forms",
      "Loot the Pestilence Scythe (living) and Decaying Heart (undead)",
      "Return both items to Camlend Serbold in the Qeynos priest guild (requires Warmly faction)",
    ],
    wiki_title: "Aegis of Life Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const aegisId = "item:aegis-of-life";
  addNode({
    id: aegisId,
    label: "Aegis of Life",
    type: "item",
    slots: ["Back", "Secondary"],
    ac: 12,
    stats: { wis: 10 },
    resists: { disease: 25 },
    weight: 9.5,
    size: "Large",
    classes: ["cleric", "paladin"],
    magic: true,
    lore: true,
    noTrade: true,
    effect: "Superior Healing (Instant) at Level 30",
    source: "Aegis of Life Quest reward (Capt Linarius / Camlend Serbold)",
  });
  addEdge(questId, aegisId, "rewards");

  for (const label of ["Priests of Life", "Knights of Thunder", "Guards of Qeynos", "Antonius Bayle"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Assist the Great Xelha
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-freeport";
  const giverId = "npc:east-freeport:xelha-nevagon";
  addGiver(giverId, "Xelha Nevagon", zoneId);

  const questId = "quest:assist-the-great-xelha";
  addNode({
    id: questId,
    label: "Assist the Great Xelha",
    type: "quest",
    description: "Xelha Nevagon in East Freeport trades bone chips, fire beetle eyes, and spiderling silk for starter necromancer spells and a trinket.",
    classes: ["necromancer"],
    minLevel: 1,
    steps: [
      "Collect 4 Bone Chips (unstacked), 4 Fire Beetle Eyes, and 4 Spiderling Silk",
      "Hand all three turn-ins to Xelha Nevagon in East Freeport",
    ],
    wiki_title: "Assist the Great Xelha",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const sparklerId = "item:xelhas-sparkler";
  addNode({
    id: sparklerId,
    label: "Xelha's Sparkler",
    type: "item",
    slots: ["Primary", "Secondary"],
    mana: 2,
    weight: 0.8,
    size: "Small",
    magic: true,
    lore: true,
    noTrade: true,
    source: "Assist the Great Xelha reward (Xelha Nevagon, East Freeport)",
  });
  addEdge(questId, sparklerId, "rewards");

  addEdge(questId, "spell:cavorting-bones", "rewards");
  addEdge(questId, "spell:reclaim-energy", "rewards");

  for (const label of ["Dismal Rage", "Opal Dark Briar"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Azraxs' Legacy
// ---------------------------------------------------------------------
{
  const zoneId = "zone:paineel";
  const giverId = "npc:paineel:ernax-the-scholar";
  addGiver(giverId, "Ernax the Scholar", zoneId);

  const questId = "quest:azraxs-legacy";
  addNode({
    id: questId,
    label: "Azraxs' Legacy",
    type: "quest",
    description: "Ernax the Scholar in Paineel sends high-level Erudite necromancers of at least Kindly faction with the Heretics on a three-relic hunt for the Mantle of Souls, ending at a Tormented Soul in Paineel.",
    classes: ["necromancer"],
    minLevel: 50,
    steps: [
      "Receive A Tattered Book from Ernax and return it for a Soul Trap, a 4-slot container",
      "Obtain a Bloody Mantle from a Dark Assassin",
      "Obtain the Heart of the Pure Druid from Alania Peaceheart",
      "Obtain an Empty Crystal Sphere from Jalen Goldsinger (via the Crystal sub-quest: 500 gold to Gorth Bearsoul, then 1000 gold plus a Potion of Sorrow to Jalen Goldsinger)",
      "Combine the Bloody Mantle, Heart of the Pure Druid, and Empty Crystal Sphere in the Soul Trap",
      "Give the completed Soul Trap to a Tormented Soul in Paineel",
    ],
    wiki_title: "Azraxs' Legacy",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const mantleId = "item:mantle-of-souls";
  addNode({
    id: mantleId,
    label: "Mantle of Souls",
    type: "item",
    slots: ["Shoulders"],
    ac: 1,
    stats: { str: -5, sta: -5, int: 10 },
    mana: 75,
    classes: ["necromancer"],
    source: "Azraxs' Legacy reward (Ernax the Scholar, Paineel)",
  });
  addEdge(questId, mantleId, "rewards");

  addFactionReward(questId, "Heretics");
}

// ---------------------------------------------------------------------
// Azzar's Dreadful Hat Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:paineel";
  const giverId = "npc:paineel:azzar-habbib";
  addGiver(giverId, "Azzar Habbib", zoneId);

  const questId = "quest:azzars-dreadful-hat-quest";
  addNode({
    id: questId,
    label: "Azzar's Dreadful Hat Quest",
    type: "quest",
    description: "Azzar Habbib, a Heretic overlooking Paineel's newbie grounds, sends adventurers of at least Indifferent faction to The Warrens for the Cave Bat Lord's dropped hat.",
    classes: [],
    minLevel: 20,
    steps: [
      "Hail Azzar Habbib in Paineel",
      "Travel to The Warrens and find the Cave Bat Lord past the King's Throne Room",
      "Kill the Cave Bat Lord and loot Azzar's Dreadful Hat",
      "Return the hat to Azzar Habbib",
    ],
    wiki_title: "Azzar's Dreadful Hat Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const sashId = "item:black-lace-sash";
  addNode({
    id: sashId,
    label: "Black Lace Sash",
    type: "item",
    slots: ["Waist"],
    ac: 2,
    stats: { dex: 2, int: 2, agi: 2 },
    source: "Azzar's Dreadful Hat Quest reward (Azzar Habbib, Paineel)",
  });
  addEdge(questId, sashId, "rewards");

  addFactionReward(questId, "Heretics");
}

// ---------------------------------------------------------------------
// Bandit Sisters
// ---------------------------------------------------------------------
{
  const zoneId = "zone:northern-felwithe";
  const giverId = "npc:northern-felwithe:tynkale";
  addGiver(giverId, "Tynkale", zoneId);

  const questId = "quest:bandit-sisters";
  addNode({
    id: questId,
    label: "Bandit Sisters",
    type: "quest",
    description: "Tynkale in Northern Felwithe sends adventurers to Kelethin, then the Nybright sisters' bandit camp in Lesser Faydark, for a random piece of leather or patchwork armor.",
    classes: ["bard", "cleric", "druid", "monk", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"],
    minLevel: 12,
    steps: [
      "Travel to Kelethin and speak with Tandan Nybright, who reeks of elven wine",
      "Find the Nybright sisters' camp in Lesser Faydark, near the entrance to Mistmoore Castle",
      "Kill Jayla, Kayla, Shayla, and Tayla Nybright for a chance at a Dull Pearl Necklace each",
      "Return to Kelethin and hand a drunkard 4 Dull Pearl Necklaces for a random reward (Bearskin Gloves, Leather Belt, Leather Leggings, Leather Shoulderpads, Targ Shield, Small Leather Gorget, Small Leather Mask, or Small Leather Shoulderpads)",
    ],
    wiki_title: "Bandit Sisters",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  for (const label of ["Clerics of Tunare", "King Tearis Thex", "Anti-Mage"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Bard Reports
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:jusean-evanesque";
  addGiver(giverId, "Jusean Evanesque", zoneId);

  const questId = "quest:bard-reports";
  addNode({
    id: questId,
    label: "Bard Reports",
    type: "quest",
    description: "Jusean Evanesque in South Qeynos relays watch reports between the docks and North Qeynos's gate guards -- a simple two-leg courier errand.",
    classes: [],
    minLevel: 1,
    steps: [
      "Speak with Jusean Evanesque in South Qeynos and receive a Watch Report Request",
      "Carry it to the requested guard (Behroe Dlexon or Anehan Treol at the docks, or Leanon Ruksey/Quinon Hulleaf at North Qeynos's gate) and receive their report",
      "Return the report to Jusean Evanesque",
    ],
    wiki_title: "Bard Reports",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  for (const label of ["League of Antonican Bards", "Knights of Truth", "Guards of Qeynos"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Bat Fur Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "vendor:south-qeynos:caleah-herblender";
  const giverNode = graph.nodes.find((n: { data: { id: string } }) => n.data.id === giverId);
  if (giverNode && !(giverNode.data.roles as string[]).includes("quest_giver")) {
    (giverNode.data.roles as string[]).push("quest_giver");
  }
  addEdge(giverId, zoneId, "located_in");

  const questId = "quest:bat-fur-quest";
  addNode({
    id: questId,
    label: "Bat Fur Quest",
    type: "quest",
    description: "Caleah Herblender in South Qeynos's Herb Jar trades newbie-zone drops -- two Bat Fur, a Rat Whisker, and a Fire Beetle Eye, handed in that exact order -- for coin and faction.",
    classes: [],
    minLevel: 2,
    steps: [
      "Collect two Bat Fur, a Rat Whisker, and a Fire Beetle Eye from the newbie mobs outside Qeynos's north gate",
      "Hand the items to Caleah Herblender in South Qeynos's Herb Jar, in that order",
    ],
    wiki_title: "Bat Fur Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  for (const label of ["Order of Three", "Guards of Qeynos"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Bear Hide Armor
// ---------------------------------------------------------------------
{
  const zoneId = "zone:surefall-glade";
  const giverId = "npc:surefall-glade:chanda-miller";
  addGiver(giverId, "Chanda Miller", zoneId);

  const questId = "quest:bear-hide-armor";
  addNode({
    id: questId,
    label: "Bear Hide Armor",
    type: "quest",
    description: "Chanda Miller, camped outside Surefall Glade, crafts bear-hide armor pieces for gold plus a matching-quality bear skin.",
    classes: [],
    minLevel: 8,
    steps: [
      "Pay Chanda Miller 5 gold and a Low Quality Bear Skin for Bear-hide Boots",
      "Pay 15 gold and a Medium Quality Bear Skin for Bear-hide Boots",
      "Pay 21 gold and a High Quality Bear Skin for a Bear-hide Cape",
    ],
    wiki_title: "Bear Hide Armor",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const beltId = "item:bear-hide-belt";
  addNode({ id: beltId, label: "Bear-hide Belt", type: "item", slots: ["Waist"], ac: 4, weight: 1.0, size: "Small", source: "Bear Hide Armor reward (Chanda Miller, Surefall Glade)" });
  addEdge(questId, beltId, "rewards");

  const bootsId = "item:bear-hide-boots";
  addNode({ id: bootsId, label: "Bear-hide Boots", type: "item", slots: ["Feet"], ac: 5, weight: 2.5, size: "Small", source: "Bear Hide Armor reward (Chanda Miller, Surefall Glade)" });
  addEdge(questId, bootsId, "rewards");

  const capeId = "item:bear-hide-cape";
  addNode({ id: capeId, label: "Bear-hide Cape", type: "item", slots: ["Back"], ac: 6, weight: 2.5, size: "Medium", source: "Bear Hide Armor reward (Chanda Miller, Surefall Glade)" });
  addEdge(questId, capeId, "rewards");

  for (const label of ["Karana Residents", "Guards of Qeynos", "Priests of Life", "Knights of Thunder"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Beguile Plants Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:firiona-vie";
  const giverId = "npc:firiona-vie:shrub-marwood";
  addGiver(giverId, "Shrub Marwood", zoneId);

  const questId = "quest:beguile-plants-quest";
  addNode({
    id: questId,
    label: "Beguile Plants Quest",
    type: "quest",
    description: "Shrub Marwood, in Firiona Vie's eastern outpost hideout, sends high-level druids across Lake of Ill Omen, Frontier Mountains, Firiona Vie, and the Sebilis-area zones for four reagents that teach Beguile Plants.",
    classes: ["druid"],
    minLevel: 35,
    steps: [
      "Obtain a Farsight Crystal from a Sarnak revealer at the Sarnak Fort, Lake of Ill Omen",
      "Obtain a Pouch of Dust from a sarnak partisan in Frontier Mountains",
      "Obtain Tsu Shaman Powder from a Froglok Tsu Shaman in Firiona Vie",
      "Obtain Strathbone Silk from a strathbone spider in Kaesora, Droga, or Nurga",
      "Turn all four items in to Shrub Marwood for a Fertile Crop and the Beguile Plants spell scroll",
    ],
    wiki_title: "Beguile Plants Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  addEdge(questId, "spell:beguile-plants", "rewards");

  for (const label of ["Inhabitants of Firiona Vie", "Emerald Warriors", "Storm Guard"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Behead the Freeport Militia
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-freeport";
  const giverId = "npc:north-freeport:jemoz-lerkarson";
  addGiver(giverId, "Jemoz Lerkarson", zoneId);

  const questId = "quest:behead-the-freeport-militia";
  addNode({
    id: questId,
    label: "Behead the Freeport Militia",
    type: "quest",
    description: "Jemoz Lerkarson, a cleric guildmaster in North Freeport's Temple of Marr, sends clerics to West Freeport to defeat the Militia's own Captain Hazran for a random cleric spell.",
    classes: ["cleric"],
    steps: [
      "Hand a Damaged Militia Helm to Jemoz Lerkarson in the Temple of Marr, North Freeport",
      "Travel to West Freeport and defeat Captain Hazran, the Militia House's Warrior guildmaster",
      "Loot his Human Head and return it to Jemoz Lerkarson",
    ],
    wiki_title: "Behead the Freeport Militia",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  for (const spellId of ["spell:abundant-food", "spell:atone", "spell:word-of-health"]) {
    addEdge(questId, spellId, "rewards");
  }

  for (const label of ["Knights of Truth", "Priests of Marr", "Steel Warriors"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Black Wolf Skin Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:southern-felwithe";
  const giverId = "npc:southern-felwithe:tarker-blazetoss";
  addGiver(giverId, "Tarker Blazetoss", zoneId);

  const questId = "quest:black-wolf-skin-quest";
  addNode({
    id: questId,
    label: "Black Wolf Skin Quest",
    type: "quest",
    description: "Tarker Blazetoss in Southern Felwithe's Wizard's Guild trades a single Black Wolf Skin for a random reward -- he eats any extras for nothing.",
    classes: [],
    minLevel: 1,
    steps: [
      "Hail Tarker Blazetoss in the Southern Felwithe Wizard's Guild and agree to perform a task",
      "Hand him one Black Wolf Skin at a time for a random reward",
    ],
    wiki_title: "Black Wolf Skin Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const bandId = "item:copper-band";
  addNode({ id: bandId, label: "Copper Band", type: "item", slots: ["Finger"], weight: 0.1, size: "Tiny", source: "Black Wolf Skin Quest reward (Tarker Blazetoss, Southern Felwithe)" });
  addEdge(questId, bandId, "rewards");

  const daggerId = "item:rusty-dagger";
  addNode({
    id: daggerId, label: "Rusty Dagger", type: "item", slots: ["Primary", "Secondary"], skill: "Piercing", damage: 3, delay: 24, weight: 2.5, size: "Small",
    classes: ["warrior", "beastlord", "berserker", "necromancer", "ranger", "rogue", "shadow knight", "wizard", "magician", "enchanter", "bard"],
    source: "Black Wolf Skin Quest reward (Tarker Blazetoss, Southern Felwithe)",
  });
  addEdge(questId, daggerId, "rewards");

  const staffId = "item:worn-great-staff";
  addNode({
    id: staffId, label: "Worn Great Staff", type: "item", slots: ["Primary"], skill: "2H Blunt", damage: 6, delay: 40, weight: 10.0, size: "Large",
    classes: ["warrior", "cleric", "paladin", "ranger", "druid", "monk", "shadow knight", "shaman", "necromancer", "wizard", "magician", "enchanter", "beastlord", "berserker"],
    source: "Black Wolf Skin Quest reward (Tarker Blazetoss, Southern Felwithe)",
  });
  addEdge(questId, staffId, "rewards");

  addEdge(questId, "spell:numbing-cold", "rewards");

  for (const label of ["Keepers of the Art", "King Tearis Thex", "Faydarks Champions"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Blackburrow Brewers
// ---------------------------------------------------------------------
{
  const zoneId = "zone:surefall-glade";
  const giverId = "npc:surefall-glade:larsk-juton";
  addGiver(giverId, "Larsk Juton", zoneId);

  const questId = "quest:blackburrow-brewers";
  addNode({
    id: questId,
    label: "Blackburrow Brewers",
    type: "quest",
    description: "Larsk Juton in Surefall Glade sends druids and rangers into Blackburrow's third level for three Blackburrow Casks -- a rare drop from gnoll brewers, guaranteed from the Master Brewer.",
    classes: ["druid", "ranger"],
    minLevel: 12,
    steps: [
      "Collect 3 Blackburrow Casks from gnoll brewers on Blackburrow's third level (guaranteed from the Master Brewer)",
      "Turn the casks in to Larsk Juton in Surefall Glade for a Cloak of Jaggedpine",
    ],
    wiki_title: "Blackburrow Brewers",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const cloakId = "item:cloak-of-jaggedpine";
  addNode({
    id: cloakId,
    label: "Cloak of Jaggedpine",
    type: "item",
    slots: ["Back"],
    ac: 6,
    stats: { dex: 3 },
    weight: 1.5,
    size: "Medium",
    classes: ["ranger", "druid"],
    magic: true,
    lore: true,
    noTrade: true,
    source: "Blackburrow Brewers reward (Larsk Juton, Surefall Glade)",
  });
  addEdge(questId, cloakId, "rewards");

  for (const label of ["Protectors of Pine", "Jaggedpine Treefolk", "Guards of Qeynos"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Blank Scrolls
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:kazlo-naedra";
  addGiver(giverId, "Kazlo Naedra", zoneId);

  const questId = "quest:blank-scrolls";
  addNode({
    id: questId,
    label: "Blank Scrolls",
    type: "quest",
    description: "Kazlo Naedra of the Order of Three, in South Qeynos, is short on blank scroll sheets and pays for a supply run to Sequea Erthinon in Surefall Glade.",
    classes: [],
    minLevel: 1,
    steps: [
      "Hail Kazlo Naedra in South Qeynos and learn of the blank scroll sheet shortage",
      "Travel to Surefall Glade and buy sheets from Sequea Erthinon for 1 silver 5 copper",
      "Return the sheets to Kazlo Naedra for reimbursement and faction",
    ],
    wiki_title: "Blank Scrolls",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  addFactionReward(questId, "Order of Three");
}

// ---------------------------------------------------------------------
// Broom Of Trilon Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:temple-of-solusek-ro";
  const giverId = "npc:temple-of-solusek-ro:vira";
  addGiver(giverId, "Vira", zoneId);

  const questId = "quest:broom-of-trilon-quest";
  addNode({
    id: questId,
    label: "Broom Of Trilon Quest",
    type: "quest",
    description: "Vira, on the Temple of Solusek Ro's balcony, sends magicians after a star ruby, a griffon feather, a Najena magician's broom, and cyclops toes for the Broom of Trilon.",
    classes: ["magician"],
    minLevel: 33,
    steps: [
      "Collect a star ruby, a feather from a griffon, a broom from a magician in Najena, and the toes of a cyclops",
      "Return all four items to Vira on the Temple of Solusek Ro's balcony",
    ],
    wiki_title: "Broom Of Trilon Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const broomId = "item:broom-of-trilon";
  addNode({
    id: broomId,
    label: "Broom of Trilon",
    type: "item",
    slots: ["Primary"],
    damage: 6,
    stats: { int: 2, agi: 3 },
    magic: true,
    lore: true,
    noTrade: true,
    effect: "Reclaim Energy (Any Slot, Casting Time: Instant) at Level 20",
    source: "Broom Of Trilon Quest reward (Vira, Temple of Solusek Ro); Minion of Air focus effect",
  });
  addEdge(questId, broomId, "rewards");

  addFactionReward(questId, "Temple Of Sol Ro");
}

// ---------------------------------------------------------------------
// Bugglegupp (Quest)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ak-anon";
  const giverId = "npc:ak-anon:tergon-brenclog";
  addGiver(giverId, "Tergon Brenclog", zoneId);

  const questId = "quest:bugglegupp-quest";
  addNode({
    id: questId,
    label: "Bugglegupp (Quest)",
    type: "quest",
    description: "Tergon Brenclog in Ak'Anon's Library Mechanamagica sends magicians to Steamfont Mountains to kill the troll Bugglegupp for its Iron Pellet, in exchange for a random starter caster spell.",
    classes: ["magician"],
    minLevel: 10,
    steps: [
      "Hail Tergon Brenclog in Ak'Anon and agree to help",
      "Travel to Steamfont Mountains and kill the troll Bugglegupp",
      "Loot the Iron Pellet and return it to Tergon Brenclog",
    ],
    wiki_title: "Bugglegupp (Quest)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  for (const spellId of ["spell:elementalkin-air", "spell:elementalkin-earth", "spell:elementaling-fire", "spell:elementaling-water"]) {
    addEdge(questId, spellId, "rewards");
  }

  for (const label of ["Eldritch Collective", "Gem Choppers", "King AkAnon"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Caduceus of Sacrament Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:temple-of-solusek-ro";
  const giverId = "npc:temple-of-solusek-ro:gavel-the-temperant";
  addGiver(giverId, "Gavel the Temperant", zoneId);

  const questId = "quest:caduceus-of-sacrament-quest";
  addNode({
    id: questId,
    label: "Caduceus of Sacrament Quest",
    type: "quest",
    description: "Gavel the Temperant in the Temple of Solusek Ro sends clerics after two Magnetized Platinum Bars, an Icon of Sacrament from Mistmoore Castle's jail, and an Ingot of Sacrament from Rathe Mountains for the Caduceus of Sacrament.",
    classes: ["cleric"],
    minLevel: 1,
    steps: [
      "Obtain 2 Magnetized Platinum Bars",
      "Obtain the Icon of Sacrament, a ground spawn in Mistmoore Castle's jail",
      "Obtain the Ingot of Sacrament, dropped by a Giant Skeleton in the Rathe Mountains ruins",
      "Turn in all three items to Gavel the Temperant in the Temple of Solusek Ro",
    ],
    wiki_title: "Caduceus of Sacrament Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const caduceusId = "item:caduceus-of-sacrament";
  addNode({
    id: caduceusId,
    label: "Caduceus of Sacrament",
    type: "item",
    slots: ["Primary"],
    skill: "1H Blunt",
    damage: 12,
    delay: 32,
    weight: 8.0,
    source: "Caduceus of Sacrament Quest reward (Gavel the Temperant, Temple of Solusek Ro)",
  });
  addEdge(questId, caduceusId, "rewards");
}

// ---------------------------------------------------------------------
// Catfish Croak Sandwich Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:lake-of-ill-omen";
  const giverId = "npc:lake-of-ill-omen:klok-foob";
  addGiver(giverId, "Klok Foob", zoneId);

  const questId = "quest:catfish-croak-sandwich-quest";
  addNode({
    id: questId,
    label: "Catfish Croak Sandwich Quest",
    type: "quest",
    description: "Klok Foob in Lake of Ill Omen wants two Catfish Croak Sandwiches, each combined from a sewer catfish, thin sliced froglok, shrub lettuce, and honey mush bread.",
    classes: ["warrior", "cleric", "shadow knight"],
    minLevel: 10,
    steps: [
      "Catch a Sewer Catfish (fishable in Cabilis and Firiona Vie)",
      "Obtain thin sliced froglok from a lizard, Shrub Lettuce from Man Eating Shrubs in Swamp of No Hope, and Honey Mush Bread from Klok Bygle",
      "Combine a sharpening stone with the ingredients in a forge (Trivial 26) to make a Sharp Cutting Disk, then combine all four into a Catfish Croak Sandwich",
      "Give two sandwiches to Klok Foob",
    ],
    wiki_title: "Catfish Croak Sandwich Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const coifId = "item:foobscale-coif";
  addNode({
    id: coifId,
    label: "Foobscale Coif",
    type: "item",
    slots: ["Head"],
    ac: 7,
    stats: { str: 1, wis: 1, int: 1 },
    weight: 3.0,
    size: "Small",
    classes: ["warrior", "cleric", "paladin", "shadow knight", "shaman"],
    magic: true,
    lore: true,
    noTrade: true,
    source: "Catfish Croak Sandwich Quest reward (Klok Foob, Lake of Ill Omen)",
  });
  addEdge(questId, coifId, "rewards");

  for (const label of ["Cabilis Residents", "Legion of Cabilis"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Catman Alliance
// ---------------------------------------------------------------------
{
  const zoneId = "zone:the-warrens";
  const giverId = "npc:the-warrens:aderius-rhenar";
  addGiver(giverId, "Aderius Rhenar", zoneId);

  const questId = "quest:catman-alliance";
  addNode({
    id: questId,
    label: "Catman Alliance",
    type: "quest",
    description: "Aderius Rhenar, in The Warrens' prison area, sends a message ahead of his return to Erudin -- deliver it to Leraena Shelyrak in the Temple of Divine Light.",
    classes: [],
    minLevel: 1,
    steps: [
      "Hail Aderius Rhenar in The Warrens and agree to help him return to Erudin",
      "Receive a Rolled Up Strip of Cloth",
      "Deliver it to Leraena Shelyrak in Erudin's Temple of Divine Light",
    ],
    wiki_title: "Catman Alliance",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  for (const label of ["Peace Keepers", "High Council of Erudin"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Cindl's Polar Bear Collection
// ---------------------------------------------------------------------
{
  const zoneId = "zone:halas";
  const giverId = "npc:halas:cindl";
  addGiver(giverId, "Cindl", zoneId);

  const questId = "quest:cindls-polar-bear-collection";
  addNode({
    id: questId,
    label: "Cindl's Polar Bear Collection",
    type: "quest",
    description: "Cindl, inside Mac's Kilts in Halas, trades a Polar Bear Skin for a random piece of used armor -- repeatable, and doable even at dubious faction.",
    classes: [],
    minLevel: 3,
    steps: [
      "Collect a Polar Bear Skin from a glacier bear, polar bear, or polar bear cub in Everfrost Peaks",
      "Hand the skin to Cindl inside Mac's Kilts, Halas, for a random piece of armor (Large Patchwork or Large Tattered armor set pieces, or Raw-hide Leggings) and a gold piece",
    ],
    wiki_title: "Cindl's Polar Bear Collection",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  for (const label of ["Merchants of Halas", "Wolves of the North", "Shamen of Justice"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Clay Bracelet Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:temple-of-solusek-ro";
  const giverId = "npc:temple-of-solusek-ro:joyce";
  addGiver(giverId, "Joyce", zoneId);

  const questId = "quest:clay-bracelet-quest";
  addNode({
    id: questId,
    label: "Clay Bracelet Quest",
    type: "quest",
    description: "Joyce, guardian of the elementalist's relics in the Temple of Solusek Ro, sends magicians after four Runes of Clay -- three from gnomish necromancers in Rathe Mountains, one from a goblin headmaster in Ocean of Tears.",
    classes: ["magician"],
    minLevel: 25,
    steps: [
      "Obtain the Top rune from Findlegrob in Rathe Mountains",
      "Obtain the Right rune from Bindlegrob in Rathe Mountains",
      "Obtain the Left rune from Sindlegrob in Rathe Mountains",
      "Obtain the Bottom rune from a goblin headmaster in Ocean of Tears",
      "Return all four Runes of Clay to Joyce for a Clay Bracelet",
    ],
    wiki_title: "Clay Bracelet Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const braceletId = "item:clay-bracelet";
  addNode({
    id: braceletId,
    label: "Clay Bracelet",
    type: "item",
    slots: ["Wrist"],
    ac: 4,
    resists: { magic: 5 },
    weight: 1.0,
    size: "Small",
    classes: ["magician"],
    magic: true,
    lore: true,
    noTrade: true,
    effect: "Eye of Zomm (Any Slot/Can Equip, Casting Time: Instant) at Level 20",
    source: "Clay Bracelet Quest reward (Joyce, Temple of Solusek Ro)",
  });
  addEdge(questId, braceletId, "rewards");
}

// ---------------------------------------------------------------------
// Cleanse the Ocean
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const giverId = "npc:erudin:laoni-reista";
  addGiver(giverId, "Laoni Reista", zoneId);

  const questId = "quest:cleanse-the-ocean";
  addNode({
    id: questId,
    label: "Cleanse the Ocean",
    type: "quest",
    description: "Laoni Reista, on the Deepwater Knights' first floor in Erudin, sends adventurers into Erudin Bay to intercept Qeynosian smugglers for a random piece of Small Patchwork armor.",
    classes: ["bard", "cleric", "druid", "monk", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"],
    minLevel: 10,
    steps: [
      "Kill smugglers in the waters near Erudin's harbor for a chance at A Nicked Coin",
      "Hand the coin to Laoni Reista for coin, faction, and a random piece of Small Patchwork armor",
    ],
    wiki_title: "Cleanse the Ocean",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  for (const itemId of ["item:small-patchwork-boots", "item:small-patchwork-cloak", "item:small-patchwork-pants", "item:small-patchwork-sleeves", "item:small-patchwork-tunic"]) {
    addEdge(questId, itemId, "rewards");
  }

  for (const label of ["Deepwater Knights", "High Council of Erudin"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Coin of Tash (Tashania)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:temple-of-solusek-ro";
  const giverId = "npc:temple-of-solusek-ro:romar-sunto";
  addGiver(giverId, "Romar Sunto", zoneId);

  const questId = "quest:coin-of-tash-tashania";
  addNode({
    id: questId,
    label: "Coin of Tash (Tashania)",
    type: "quest",
    description: "Romar Sunto in the Temple of Solusek Ro sends enchanters on a ten-city coin collection, three librarian hand-offs, and a final return for the Tashania spell.",
    classes: ["enchanter"],
    minLevel: 35,
    steps: [
      "Get a Coin Pouch from Romar Sunto in the Temple of Solusek Ro",
      "Collect An Old Silver Coin from each of ten cities: Ak'Anon, Erudin Palace, Northern Felwithe, West Freeport, Grobb, Halas, South Kaladim, Neriak Commons, Oggok, and North Qeynos",
      "Combine the 10 coins in the coin pouch for a Coin of Tash",
      "Give it to Tarn Visilin in High Keep's library for a Glowing Coin of Tash",
      "Give that to Mizr N'Mar in Neriak 3rd Gate's library for a Gleaming Coin of Tash",
      "Give that to Raine Beteria in Erudin's library for a Radiant Coin of Tash",
      "Return to Romar Sunto for the Tashania spell",
    ],
    wiki_title: "Coin of Tash (Tashania)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  addEdge(questId, "spell:tashania", "rewards");
}

// ---------------------------------------------------------------------
// Cold Iron
// ---------------------------------------------------------------------
{
  const zoneId = "zone:paineel";
  const giverId = "npc:paineel:royal-guard-sheltuin";
  addGiver(giverId, "Royal Guard Sheltuin", zoneId);

  const questId = "quest:cold-iron";
  addNode({
    id: questId,
    label: "Cold Iron",
    type: "quest",
    description: "Royal Guard Sheltuin in Paineel sends shadow knights through The Warrens, Keletha Nightweaver, Qeynos Hills, and Everfrost's Eichvul for the Leggings of Ridossan.",
    classes: ["shadow knight"],
    minLevel: 20,
    steps: [
      "Loot a Large Empty Crate from Smithy Rrarrgin in The Warrens and return it to Royal Guard Sheltuin",
      "Take the sample to Keletha Nightweaver",
      "Travel to Qeynos Hills and kill the erudite traveler by the lake for a Courier's Head, Crate full of Ore, and a Note from Eichvul",
      "Find and kill Eichvul, a dark elf near Everfrost's Permafrost entrance, for a Supplier's Head and Sealed Letter",
      "Return all four items to Royal Guard Sheltuin in Paineel",
    ],
    wiki_title: "Cold Iron",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const leggingsId = "item:leggings-of-ridossan";
  addNode({
    id: leggingsId,
    label: "Leggings of Ridossan",
    type: "item",
    slots: ["Legs"],
    ac: 9,
    stats: { agi: 2 },
    mana: 10,
    resists: { fire: 3, magic: 1 },
    weight: 4.2,
    size: "Medium",
    classes: ["shadow knight"],
    magic: true,
    lore: true,
    noTrade: true,
    source: "Cold Iron reward (Royal Guard Sheltuin, Paineel)",
  });
  addEdge(questId, leggingsId, "rewards");

  addFactionReward(questId, "Heretics");
}

// ---------------------------------------------------------------------
// Collect Drops of Shadow
// ---------------------------------------------------------------------
{
  const zoneId = "zone:mistmoore-castle";
  const giverId = "npc:mistmoore-castle:ssynthi";
  addGiver(giverId, "Ssynthi", zoneId);

  const questId = "quest:collect-drops-of-shadow";
  addNode({
    id: questId,
    label: "Collect Drops of Shadow",
    type: "quest",
    description: "Ssynthi, in the graveyard behind Mistmoore Castle's mausoleum, sends adventurers to every shadowed-men camp across Norrath, then to Rathe Mountains' Ytyrs the Reborn, for a Penumbral Rod.",
    classes: [],
    minLevel: 35,
    steps: [
      "Receive an 8-slot Cauldron of Shadow Essence from Ssynthi",
      "Collect a vial from each shadowed men camp: Innothule Swamp, Nektulos Forest, Lavastorm Mountains, Lesser Faydark, South Karana, Commonlands, and Kithicor Forest",
      "Find and kill Ytyrs the Reborn in Rathe Mountains",
      "Combine all eight vials in the cauldron to craft a Concoction of Shadow",
      "Give the Concoction to Ssynthi",
    ],
    wiki_title: "Collect Drops of Shadow",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 037 complete: 25 more quests added");
