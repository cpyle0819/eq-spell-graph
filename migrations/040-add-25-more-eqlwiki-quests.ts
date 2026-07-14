/**
 * Migration 040: 25 more quests off GitHub issue #26's checklist -- the 8
 * per-city "Become PvP" quests (Ak'Anon, Erudin, Freeport, Halas, Neriak,
 * Oggok, Paineel, Qeynos), Animal Skin Armor, Armor of the Priest Quests,
 * Azzar's Dreadful Hat Part 2, Bat Fur and Beetle Legs, Bat Wings and Snake
 * Fangs, Bone Chips Grobb/Qeynos/Felwithe/Field of Bone, Bvellos' Bounty,
 * Guild Summons - Abbey of Deep Musing Cleric, and the Cazic Thule/
 * Innoruuk/Quellious/Rallos Zek/Bertoxxulous/Tunare Symbol Quests.
 * Researched directly against eqlwiki.com (each quest's own page, plus
 * reward items' pages where the quest page didn't already state exact
 * stats), following decisions/eqlwiki-quest-research-method.md.
 *
 * Picked for existing-zone coverage, same rule as migrations 034/036/037.
 * Skipped this pass for missing-zone reasons: 10th Coldain Ring Quest
 * (Icewell Keep), Aid the Dar Brood (Western Wastes), Ancient Dragon Tome
 * (Tower of Frozen Shadow/Cobalt Scar, and its own giver's zone is
 * unstated on the page), Become PvP (Kaladim) and Brell Serilis Symbol
 * Quests (both South Kaladim -- only North Kaladim exists in the graph),
 * Bulthar Trunks (Cobalt Scar). Skipped as disproportionate to one
 * migration entry: 10th Coldain Ring Quest is also a raid-scale event
 * requiring a prerequisite "Ring 9" from an even longer chain, same reason
 * migration 037 skipped Captain Nalot's Triple Strength Rum. Skipped as not
 * real/currently obtainable, per the wiki pages themselves: Boysenberry Pie
 * Quest ("never fully implemented ... impossible to complete"), Blood Ink
 * ("unsolved or broken"), Burynai Bundt Cake ("confirmed that this is not a
 * quest at this time, but is simply a storyline"). "Blessed Oil" was
 * skipped as a duplicate checklist entry, not researched independently --
 * its own page (giver Brother Estle in Western Karana, same relay through
 * North Qeynos and Splitpaw Lair) describes the same real quest already in
 * the graph as `quest:blessed-oil-quest` (checklist's separately-listed
 * "Blessed Oil Quest").
 *
 * Azzar Habbib (Part 2's giver) already exists in the graph from an
 * earlier migration -- reused directly. Yeolarn Bronzeleaf gives both Bone
 * Chips Felwithe and Tunare Symbol Quests on eqlwiki.com, so one npc node
 * covers both.
 *
 * Deliberately NOT modeled:
 * - Animal Skin Armor's five armor-piece rewards and Armor of the Priest
 *   Quests' six armor-piece rewards -- both are Armor-of-Ro-shaped
 *   (decisions/eqlwiki-quest-research-method.md's "one wiki page, many
 *   sub-quests" gotcha), compressed into one quest node per page with the
 *   pieces listed in `steps`; modeling every piece as its own item node
 *   with full stats would need 5-6 more fetches per quest, disproportionate
 *   to one migration entry (same reasoning migration 037 used to skip
 *   Chalice of Conquest's 13-leg fetch chain).
 * - Innoruuk Symbol Quests' and Quellious Symbol Quests' neck-item rewards
 *   -- both pages only gave approximate/progression stats ("increasing AC,
 *   wisdom/mana bonuses", "AC 3->5->7") rather than a full per-tier stat
 *   line the way Cazic Thule/Rallos Zek/Bertoxxulous/Tunare's pages did;
 *   left as prose rather than fabricating the missing exact numbers.
 * - Bvellos' Bounty's three optional Ranger/Warrior-only mask/tunic
 *   rewards -- a 3-option pool restricted to 2 classes, left as prose
 *   rather than fetching 3 more item pages for one quest entry.
 * - "Locate Corpse" (Bat Wings and Snake Fangs' second spell-choice
 *   reward) -- no spell node with that exact label exists in the graph;
 *   only the other option (Cavorting Bones) is modeled as a reward edge.
 * - Every quest's *worsened* faction (Deepwater Knights, Gate Callers,
 *   Craftkeepers, Crimson Hands, Claws of Veeshan, Ulthork, Bloodsabers,
 *   Eldritch Collective, and others each quest also states) -- `rewards`
 *   only models a positive reward (decisions/quest-reward-modeling.md);
 *   left as prose.
 * - Coin/platinum/silver payouts -- no coin field on `quest` nodes.
 * - `era` -- unset except Bone Chips Field of Bone, the only one of these
 *   25 whose own page states a content era ("Kunark Era").
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
// Become PvP (x8) -- each city's "Priest of Discord" hands over a Tome of
// Order and Discord; returning it flags the player for PvP. Same item
// across all eight, so one shared item node is reused by every quest.
// ---------------------------------------------------------------------
{
  const tomeId = "item:tome-of-order-and-discord";
  addNode({
    id: tomeId,
    label: "Tome of Order and Discord",
    type: "item",
    lore: true,
    weight: 0.0,
    size: "Tiny",
    source: "Become PvP quest reward (Priest of Discord)",
  });

  const cities: Array<[string, string, string]> = [
    ["akanon", "Ak'Anon", "zone:ak-anon"],
    ["erudin", "Erudin", "zone:erudin"],
    ["freeport", "Freeport", "zone:east-freeport"],
    ["halas", "Halas", "zone:halas"],
    ["neriak", "Neriak", "zone:neriak-commons"],
    ["oggok", "Oggok", "zone:oggok"],
    ["paineel", "Paineel", "zone:paineel"],
    ["qeynos", "Qeynos", "zone:north-qeynos"],
  ];

  for (const [slugCity, cityLabel, zoneId] of cities) {
    const giverId = `npc:${slugCity}:priest-of-discord`;
    addGiver(giverId, "Priest of Discord", zoneId);

    const questId = `quest:become-pvp-${slugCity}`;
    addNode({
      id: questId,
      label: `Become PvP (${cityLabel})`,
      type: "quest",
      description:
        `The Priest of Discord in ${cityLabel} offers the Tome of Order and Discord -- reading it and handing it back flags your character for player-versus-player combat: your name displays in red instead of blue, you become vulnerable to other PvP-flagged players, and you lose access to beneficial spells from non-PvP characters.`,
      minLevel: 1,
      steps: [
        "Hail the Priest of Discord",
        "Request to read the Tome of Order and Discord",
        "Hand the tome back to the Priest of Discord to complete the quest",
      ],
      wiki_title: `Become PvP (${cityLabel})`,
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, tomeId, "rewards");
  }
}

// ---------------------------------------------------------------------
// Animal Skin Armor
// ---------------------------------------------------------------------
{
  const zoneId = "zone:iceclad-ocean";
  const giverId = "npc:iceclad-ocean:ergrez-shortpaw";
  addGiver(giverId, "Ergrez Shortpaw", zoneId);

  const questId = "quest:animal-skin-armor";
  addNode({
    id: questId,
    label: "Animal Skin Armor",
    type: "quest",
    description:
      "Ergrez Shortpaw in Iceclad Ocean trades hunted pelts and reinforcing materials for five separate pieces of animal-skin armor -- each piece its own turn-in. All rewards are NO DROP.",
    classes: ["bard", "beastlord", "berserker", "cleric", "druid", "monk", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"],
    minLevel: 27,
    steps: [
      "Cougarskin Sleeves: give 1 Low Quality Cougarskin + 1 Fatty Walrus Meat",
      "Cougarskin Boots: give 1 Medium Quality Cougarskin + 2 Cutting Shells",
      "Cougarskin Mask: give 1 High Quality Cougarskin + 2 Mammoth Meats",
      "Direwolf Fur Hood: give 1 Low Quality Dire Wolf Fur + 2 Bark Bindings",
      "Direwolf Fur Cloak: give 1 Medium Quality Dire Wolf Fur + 2 Skinning Rocks",
    ],
    wiki_title: "Animal Skin Armor",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Armor of the Priest Quests
// ---------------------------------------------------------------------
{
  const zoneId = "zone:temple-of-solusek-ro";
  const blaizeId = "npc:temple-of-solusek-ro:blaize-the-radiant";
  const gavelId = "npc:temple-of-solusek-ro:gavel-the-temperant";
  addGiver(blaizeId, "Blaize the Radiant", zoneId);
  addGiver(gavelId, "Gavel the Temperant", zoneId);

  const questId = "quest:armor-of-the-priest-quests";
  addNode({
    id: questId,
    label: "Armor of the Priest Quests",
    type: "quest",
    description:
      "Blaize the Radiant and Gavel the Temperant in the Temple of Solusek Ro each offer cleric armor-piece turn-ins; the full set (all six pieces) gives AC +85, STA +8, WIS +10, DEX +5, AGI +5, INT +5, plus elemental resistances and disease protection.",
    classes: ["cleric"],
    minLevel: 35,
    steps: [
      "Blaize the Radiant: Greaves of the Penitent",
      "Blaize the Radiant: Vambraces of the Fervent",
      "Blaize the Radiant: Boots of the Reliant",
      "Blaize the Radiant: Gauntlets of the Ardent",
      "Gavel the Temperant: Chestplate of the Constant (needs 2x Galvanized Platinum Bar, an icon from Sludge Dankmire in Clan Runnyeye, and an ingot from Dwigus Lowater in Dagnor's Cauldron)",
      "Gavel the Temperant: Bracers of the Reverent",
    ],
    wiki_title: "Armor of the Priest Quests",
  });
  addEdge(blaizeId, questId, "starts");
  addEdge(gavelId, questId, "starts");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Azzar's Dreadful Hat, Part 2
// ---------------------------------------------------------------------
{
  const zoneId = "zone:paineel";
  const giverId = "npc:paineel:azzar-habbib";
  addGiver(giverId, "Azzar Habbib", zoneId); // already in graph; no-op if so

  const questId = "quest:azzars-dreadful-hat-part-2";
  addNode({
    id: questId,
    label: "Azzar's Dreadful Hat, Part 2",
    type: "quest",
    description:
      "Azzar Habbib, a Heretic overlooking the newbie grounds in Paineel, wants a feared beast's pelt, gold thread, and an imbued amber in exchange for the Dreadful Cap.",
    classes: ["cleric", "necromancer", "shadow knight", "shaman", "warrior"],
    minLevel: 20,
    steps: [
      "Obtain a pelt from The Mighty Bear Paw, deep in The Warrens",
      "Purchase gold thread from a tailoring vendor",
      "Obtain an imbued amber, prepared by a shaman or cleric of Cazic Thule",
      "Deliver all three items to Azzar Habbib",
    ],
    wiki_title: "Azzar's Dreadful Hat, Part 2",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const capId = "item:dreadful-cap";
  addNode({
    id: capId,
    label: "Dreadful Cap",
    type: "item",
    slots: ["Head"],
    ac: 2,
    stats: { sta: 5 },
    mana: 10,
    resists: { magic: 2 },
    weight: 0.4,
    size: "Small",
    magic: true,
    lore: true,
    source: "Azzar's Dreadful Hat, Part 2 reward (Azzar Habbib, Paineel)",
  });
  addEdge(questId, capId, "rewards");
}

// ---------------------------------------------------------------------
// Bat Fur and Beetle Legs
// ---------------------------------------------------------------------
{
  const zoneId = "zone:paineel";
  const giverId = "npc:paineel:dzan-amo";
  addGiver(giverId, "Dzan Amo", zoneId);

  const questId = "quest:bat-fur-and-beetle-legs";
  addNode({
    id: questId,
    label: "Bat Fur and Beetle Legs",
    type: "quest",
    description:
      "Dzan Amo in the Tabernacle of Terror (Paineel) trades two tufts of bat fur and two fire beetle legs -- then, unexpectedly, four infected rat livers -- for a bundle of cleric spells.",
    classes: ["cleric"],
    minLevel: 1,
    steps: [
      "Deliver two tufts of bat fur and two fire beetle legs to Dzan Amo",
      "Deliver four infected rat livers to Dzan Amo",
    ],
    wiki_title: "Bat Fur and Beetle Legs",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");
  for (const spellId of [
    "spell:cure-poison",
    "spell:divine-aura",
    "spell:flash-of-light",
    "spell:lull",
    "spell:spook-the-dead",
    "spell:strike",
    "spell:true-north",
    "spell:yaulp",
  ]) {
    addEdge(questId, spellId, "rewards");
  }
  addFactionReward(questId, "Heretics");
}

// ---------------------------------------------------------------------
// Bat Wings and Snake Fangs
// ---------------------------------------------------------------------
{
  const zoneId = "zone:paineel";
  const giverId = "npc:paineel:coriante-verisue";
  addGiver(giverId, "Coriante Verisue", zoneId);

  const questId = "quest:bat-wings-and-snake-fangs";
  addNode({
    id: questId,
    label: "Bat Wings and Snake Fangs",
    type: "quest",
    description:
      "Coriante Verisue in Paineel trades two bat wings and two snake fangs, gathered from outside the city, for a choice of an early necromancer spell.",
    classes: ["necromancer"],
    minLevel: 1,
    steps: ["Gather two bat wings and two snake fangs from outside Paineel", "Deliver all four to Coriante Verisue"],
    wiki_title: "Bat Wings and Snake Fangs",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "spell:cavorting-bones", "rewards");
  addFactionReward(questId, "Heretics");
}

// ---------------------------------------------------------------------
// Bone Chips Grobb
// ---------------------------------------------------------------------
{
  const zoneId = "zone:grobb";
  const giverId = "npc:grobb:hukulk";
  addGiver(giverId, "Hukulk", zoneId);

  const questId = "quest:bone-chips-grobb";
  addNode({
    id: questId,
    label: "Bone Chips Grobb",
    type: "quest",
    description: "Hukulk, at the Shadowknight guild (Nightkeep) in Grobb, trades four bone chips for a Rusty Two Handed Sword.",
    minLevel: 1,
    steps: ["Hail Hukulk and express interest in joining Nightkeep", "Gather and deliver four Bone Chips"],
    wiki_title: "Bone Chips Grobb",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const swordId = "item:rusty-two-handed-sword";
  addNode({
    id: swordId,
    label: "Rusty Two Handed Sword",
    type: "item",
    slots: ["Primary"],
    skill: "2H Slashing",
    damage: 9,
    delay: 50,
    weight: 12.0,
    size: "Large",
    classes: ["warrior", "paladin", "ranger", "shadow knight"],
    source: "Bone Chips Grobb reward (Hukulk, Grobb)",
  });
  addEdge(questId, swordId, "rewards");
}

// ---------------------------------------------------------------------
// Bone Chips Qeynos
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-qeynos";
  const giverId = "npc:north-qeynos:lashun-novashine";
  addGiver(giverId, "Lashun Novashine", zoneId);

  const questId = "quest:bone-chips-qeynos";
  addNode({
    id: questId,
    label: "Bone Chips Qeynos",
    type: "quest",
    description: "Lashun Novashine in North Qeynos trades two unstacked bone chips and 2 gold pieces for faction and a small heal.",
    minLevel: 1,
    steps: ["Hail Lashun Novashine", "Turn in two unstacked bone chips", "Hand over 2 gold pieces"],
    wiki_title: "Bone Chips Qeynos",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");
  for (const faction of ["Priests of Life", "Knights of Thunder", "Guards of Qeynos", "Antonius Bayle"]) {
    addFactionReward(questId, faction);
  }
}

// ---------------------------------------------------------------------
// Bone Chips Felwithe
// ---------------------------------------------------------------------
{
  const zoneId = "zone:northern-felwithe";
  const giverId = "npc:northern-felwithe:yeolarn-bronzeleaf";
  addGiver(giverId, "Yeolarn Bronzeleaf", zoneId);

  const questId = "quest:bone-chips-felwithe";
  addNode({
    id: questId,
    label: "Bone Chips Felwithe",
    type: "quest",
    description:
      "Yeolarn Bronzeleaf in Northern Felwithe asks clerics to protect the Great Mother by collecting four bone chips from decaying skeletons outside the gates.",
    classes: ["cleric"],
    minLevel: 1,
    steps: [
      "Hail Yeolarn Bronzeleaf and accept the quest to protect the Great Mother",
      "Collect 4 unstacked bone chips from decaying skeletons outside Felwithe's gates",
      "Return the bone chips to Yeolarn Bronzeleaf",
    ],
    wiki_title: "Bone Chips Felwithe",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "spell:strike", "rewards");

  const swordId = "item:fine-steel-short-sword";
  addNode({
    id: swordId,
    label: "Fine Steel Short Sword",
    type: "item",
    slots: ["Primary", "Secondary"],
    skill: "1H Slashing",
    damage: 4,
    delay: 23,
    weight: 4.0,
    size: "Medium",
    classes: ["warrior", "paladin", "ranger", "shadow knight", "bard", "rogue"],
    source: "Bone Chips Felwithe reward (Yeolarn Bronzeleaf, Northern Felwithe)",
  });
  addEdge(questId, swordId, "rewards");
  for (const faction of ["Clerics of Tunare", "King Tearis Thex", "Anti-Mage"]) {
    addFactionReward(questId, faction);
  }
}

// ---------------------------------------------------------------------
// Bone Chips Field of Bone
// ---------------------------------------------------------------------
{
  const zoneId = "zone:field-of-bone";
  const giverId = "npc:field-of-bone:trooper-mozo";
  addGiver(giverId, "Trooper Mozo", zoneId);

  const questId = "quest:bone-chips-field-of-bone";
  addNode({
    id: questId,
    label: "Bone Chips Field of Bone",
    type: "quest",
    description:
      "Trooper Mozo, near the East Cabilis zone-in in Field of Bone, trades four unstacked bone chips (from decaying skeletons) for coin and faction.",
    minLevel: 1,
    era: "Kunark",
    steps: [
      "Hail Trooper Mozo and agree to collect bone chips",
      "Gather four unstacked Bone Chips from decaying skeletons",
      "Return the four chips to Trooper Mozo",
    ],
    wiki_title: "Bone Chips Field of Bone",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");
  for (const faction of ["Legion of Cabilis", "Cabilis Residents", "Scaled Mystics", "Crusaders Of Greenmist", "Swift Tails"]) {
    addFactionReward(questId, faction);
  }
}

// ---------------------------------------------------------------------
// Guild Summons - Abbey of Deep Musing Cleric
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ak-anon";
  const giverId = "npc:ak-anon:iony-gredlong";
  addGiver(giverId, "Iony Gredlong", zoneId);

  const questId = "quest:guild-summons-abbey-of-deep-musing-cleric";
  addNode({
    id: questId,
    label: "Guild Summons - Abbey of Deep Musing Cleric",
    type: "quest",
    description:
      "A tattered note directs new Gnome clerics of the Abbey of Deep Musing (Ak'Anon) to deliver it to Iony Gredlong, joining the guild.",
    classes: ["cleric"],
    minLevel: 1,
    steps: ["Deliver the tattered note to Iony Gredlong in the Abbey of Deep Musing"],
    wiki_title: "Guild Summons - Abbey of Deep Musing Cleric",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const tunicId = "item:worn-felt-tunic";
  addNode({
    id: tunicId,
    label: "Worn Felt Tunic",
    type: "item",
    slots: ["Chest"],
    ac: 2,
    source: "Guild Summons - Abbey of Deep Musing Cleric reward (Iony Gredlong, Ak'Anon)",
  });
  addEdge(questId, tunicId, "rewards");
  // "Merchants of AkAnon" (no apostrophe/space) matches the label an
  // earlier migration already used for this faction -- kept as-is so
  // slug() resolves to the same existing faction:merchants-of-akanon node.
  for (const faction of ["Dark Reflection", "Merchants of AkAnon", "Gem Choppers", "Deep Muses"]) {
    addFactionReward(questId, faction);
  }
}

// ---------------------------------------------------------------------
// Bvellos' Bounty
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const giverId = "npc:kael-drakkal:captain-bvellos";
  addGiver(giverId, "Captain Bvellos", zoneId);

  const questId = "quest:bvellos-bounty";
  addNode({
    id: questId,
    label: "Bvellos' Bounty",
    type: "quest",
    description:
      "Captain Bvellos in Kael Drakkel offers two repeatable bounty turn-ins: Coldain Heads for platinum and faction, or four Icepaw Kobold's Paws for a Ranger/Warrior mask or tunic reward.",
    minLevel: 50,
    steps: [
      "Hail Captain Bvellos and discuss mercenary work",
      "Turn in Coldain Heads for platinum and faction, or four Icepaw Kobold's Paws for a Ranger/Warrior armor piece (Silvery Mask, Antlered Mask, or Giant Scalemail Tunic)",
    ],
    wiki_title: "Bvellos' Bounty",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");
  for (const faction of ["Kromzek", "Kromrif", "King Tormax"]) {
    addFactionReward(questId, faction);
  }
}

// ---------------------------------------------------------------------
// Cazic Thule Symbol Quests
// ---------------------------------------------------------------------
{
  const zoneId = "zone:paineel";
  const sernId = "npc:paineel:sern-adolia";
  const atdehimId = "npc:paineel:atdehim-sqonci";
  addGiver(sernId, "Sern Adolia", zoneId);
  addGiver(atdehimId, "Atdehim Sqonci", zoneId);

  const questId = "quest:cazic-thule-symbol-quests";
  addNode({
    id: questId,
    label: "Cazic Thule Symbol Quests",
    type: "quest",
    description:
      "Sern Adolia and Atdehim Sqonci, in Paineel's Tabernacle of Terror, promote Cazic-Thule clerics and shamans through Initiate and Disciple symbol turn-ins.",
    classes: ["cleric", "shaman"],
    minLevel: 1,
    steps: [
      "Initiate Symbol: kill undead rats in Paineel or infected rats in Toxxulia Forest for four livers",
      "Disciple Symbol: turn in a Kerran priestess doll, giant wooly spider ichor, your Initiate Symbol of Cazic Thule, and a giant snake fang",
    ],
    wiki_title: "Cazic Thule Symbol Quests",
  });
  addEdge(sernId, questId, "starts");
  addEdge(atdehimId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const initiateId = "item:initiate-symbol-of-cazic-thule";
  addNode({
    id: initiateId,
    label: "Initiate Symbol of Cazic Thule",
    type: "item",
    slots: ["Neck"],
    ac: 3,
    stats: { wis: 1 },
    mana: 3,
    source: "Cazic Thule Symbol Quests reward (Paineel)",
  });
  const discipleId = "item:disciple-symbol-of-cazic-thule";
  addNode({
    id: discipleId,
    label: "Disciple Symbol of Cazic Thule",
    type: "item",
    slots: ["Neck"],
    ac: 5,
    stats: { str: 1, wis: 2 },
    mana: 7,
    source: "Cazic Thule Symbol Quests reward (Paineel)",
  });
  addEdge(questId, initiateId, "rewards");
  addEdge(questId, discipleId, "rewards");
  addFactionReward(questId, "Heretics");
}

// ---------------------------------------------------------------------
// Innoruuk Symbol Quests
// ---------------------------------------------------------------------
{
  const zoneId = "zone:neriak-3rd-gate";
  const perrirId = "npc:neriak-3rd-gate:perrir-zexus";
  const ithvolId = "npc:neriak-3rd-gate:ithvol-k-jasn";
  addGiver(perrirId, "Perrir Zexus", zoneId);
  addGiver(ithvolId, "Ithvol K`Jasn", zoneId);

  const questId = "quest:innoruuk-symbol-quests";
  addNode({
    id: questId,
    label: "Innoruuk Symbol Quests",
    type: "quest",
    description:
      "Perrir Zexus and Ithvol K`Jasn, in Neriak Third Gate, promote Innoruuk clergy (clerics and shamans) through three tiers -- Initiate, Disciple, and Regent Symbol -- each with progressively richer neck-item rewards.",
    classes: ["cleric", "shaman"],
    minLevel: 5,
    steps: [
      "Initiate Symbol: collect four Woven Grass Amulets from halfling druids in Nektulos Forest",
      "Disciple Symbol: kill Master Whoopal for his head, retrieve halfling spy orders in disguise, then kill the spy",
      "Regent Symbol: craft steel bonings, deliver provisions to a Lesser Faydark camp, spawn and kill Crusader Swiftmoon, return items to complete the promotion",
    ],
    wiki_title: "Innoruuk Symbol Quests",
  });
  addEdge(perrirId, questId, "starts");
  addEdge(ithvolId, questId, "starts");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Quellious Symbol Quests
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const giverId = "npc:erudin:leraena-shelyrak";
  addGiver(giverId, "Leraena Shelyrak", zoneId);

  const questId = "quest:quellious-symbol-quests";
  addNode({
    id: questId,
    label: "Quellious Symbol Quests",
    type: "quest",
    description:
      "Leraena Shelyrak, at the Temple of Peace (Quellious) in Erudin, promotes Erudite clerics of Quellious through three tiers -- Initiate, Disciple, and Regent Symbol -- each with progressively richer neck-item rewards.",
    classes: ["cleric"],
    minLevel: 10,
    steps: [
      "Initiate Symbol: collect 8 odd bone necklaces from lesser kobold shamans in The Warrens",
      "Disciple Symbol (level 20+): collect 8 odd bronze necklaces from greater shamans",
      "Regent Symbol: obtain an odd cold iron necklace, travel to Freeport and Ak'Anon for information, then retrieve an encrypted document from Steamfont Mountains",
    ],
    wiki_title: "Quellious Symbol Quests",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Rallos Zek Symbol Quests
// ---------------------------------------------------------------------
{
  const zoneId = "zone:oggok";
  const giverId = "npc:oggok:zulort";
  addGiver(giverId, "Zulort", zoneId);

  const questId = "quest:rallos-zek-symbol-quests";
  addNode({
    id: questId,
    label: "Rallos Zek Symbol Quests",
    type: "quest",
    description:
      "Zulort in Oggok, after the prerequisite Froglock Tadpole Fleshies quest, sends Ogre shamans of Rallos Zek to hunt lizardman mystics for the Initiate Symbol of Rallos Zek.",
    classes: ["shaman"],
    minLevel: 10,
    steps: [
      "Complete the prerequisite Froglock Tadpole Fleshies quest",
      "Speak to Zulort about becoming a better shaman",
      "Hunt lizardman mystics in The Feerrott and Rathe Mountains for three Mystic Dolls and one Allize Volew Medicine Bag",
      "Return the items to Zulort",
    ],
    wiki_title: "Rallos Zek Symbol Quests",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const symbolId = "item:initiate-symbol-of-rallos-zek";
  addNode({
    id: symbolId,
    label: "Initiate Symbol of Rallos Zek",
    type: "item",
    slots: ["Neck"],
    ac: 3,
    stats: { wis: 1 },
    mana: 3,
    effect: "Yaulp",
    source: "Rallos Zek Symbol Quests reward (Zulort, Oggok)",
  });
  addEdge(questId, symbolId, "rewards");
  addFactionReward(questId, "Shamen of War");
}

// ---------------------------------------------------------------------
// Bertoxxulous Symbol Quests
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ak-anon";
  const giverId = "npc:ak-anon:evah-xokez";
  addGiver(giverId, "Evah Xokez", zoneId);

  const questId = "quest:bertoxxulous-symbol-quests";
  addNode({
    id: questId,
    label: "Bertoxxulous Symbol Quests",
    type: "quest",
    description:
      "Evah Xokez in Ak'Anon sends clerics of Bertoxxulous to spread plague to a pregnant rodent in Steamfont Mountains, then combine diseased bone marrow, wormwood, and gnomish spirits for the Initiate Symbol of Bertoxxulous.",
    classes: ["cleric"],
    minLevel: 8,
    steps: [
      "Use a vial to spread plague to a pregnant rodent in Steamfont Mountains",
      "Collect diseased bone marrow, wormwood, and gnomish spirits and combine them in a container",
      "Return the combined item to Evah Xokez",
    ],
    wiki_title: "Bertoxxulous Symbol Quests",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const symbolId = "item:initiate-symbol-of-bertoxxulous";
  addNode({
    id: symbolId,
    label: "Initiate Symbol of Bertoxxulous",
    type: "item",
    slots: ["Neck"],
    ac: 3,
    stats: { wis: 1 },
    mana: 3,
    effect: "Disease Cloud",
    source: "Bertoxxulous Symbol Quests reward (Evah Xokez, Ak'Anon)",
  });
  addEdge(questId, symbolId, "rewards");
  addFactionReward(questId, "Dark Reflection");
}

// ---------------------------------------------------------------------
// Tunare Symbol Quests
// ---------------------------------------------------------------------
{
  const zoneId = "zone:northern-felwithe";
  const giverId = "npc:northern-felwithe:yeolarn-bronzeleaf"; // shared with Bone Chips Felwithe
  addGiver(giverId, "Yeolarn Bronzeleaf", zoneId);

  const questId = "quest:tunare-symbol-quests";
  addNode({
    id: questId,
    label: "Tunare Symbol Quests",
    type: "quest",
    description:
      "Yeolarn Bronzeleaf in Northern Felwithe promotes clerics and druids of Tunare through three tiers -- Initiate, Disciple, and Warden Symbol -- each with progressively richer neck-item rewards.",
    classes: ["cleric", "druid"],
    minLevel: 8,
    steps: [
      "Initiate Symbol: collect 4 Bone Chips, then hunt 4 Putrescent Hearts from rancorous ghasts in Lesser Faydark (nighttime only)",
      "Disciple Symbol: kill the necromancer Larik Z'Vole and a dark elf courier in Lesser Faydark, retrieve their heads and a crate",
      "Warden Symbol: gather components from Split Paw, Solusek A, and Unrest, then brew a concoction with Trilani Parlone in Erudin Palace",
    ],
    wiki_title: "Tunare Symbol Quests",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const initiateId = "item:initiate-symbol-of-tunare";
  addNode({
    id: initiateId,
    label: "Initiate Symbol of Tunare",
    type: "item",
    slots: ["Neck"],
    ac: 3,
    stats: { wis: 1 },
    mana: 3,
    source: "Tunare Symbol Quests reward (Yeolarn Bronzeleaf, Northern Felwithe)",
  });
  const discipleId = "item:disciple-symbol-of-tunare";
  addNode({
    id: discipleId,
    label: "Disciple Symbol of Tunare",
    type: "item",
    slots: ["Neck"],
    ac: 5,
    stats: { cha: 1, wis: 2 },
    mana: 7,
    source: "Tunare Symbol Quests reward (Yeolarn Bronzeleaf, Northern Felwithe)",
  });
  const wardenId = "item:warden-symbol-of-tunare";
  addNode({
    id: wardenId,
    label: "Warden Symbol of Tunare",
    type: "item",
    slots: ["Neck"],
    ac: 7,
    stats: { cha: 2, wis: 3 },
    mana: 15,
    source: "Tunare Symbol Quests reward (Yeolarn Bronzeleaf, Northern Felwithe)",
  });
  addEdge(questId, initiateId, "rewards");
  addEdge(questId, discipleId, "rewards");
  addEdge(questId, wardenId, "rewards");
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 040 complete: added 25 more quests from GitHub issue #26's checklist");
