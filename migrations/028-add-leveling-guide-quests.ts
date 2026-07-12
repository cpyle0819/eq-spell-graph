/**
 * Migration 028: Add the 6 real quests linked from public/leveling-guide.html's
 * "Notable Finds Along the Way" and "Beyond the Kill Count" sections --
 * Armor of Ro, Mold of Ro Bracer, Journeyman's Boots, Research Aid,
 * Paladin Epic Quest, and Cleric Epic Quest -- researched directly against
 * eqlwiki.com (see decisions/eqlwiki-quest-research-method.md for exactly
 * how, with an eye toward eventually automating this).
 *
 * The migration-026 test quest (Ore for the Anvil) is left in place --
 * remove it in its own migration when asked, not bundled into this one.
 *
 * Notes on fidelity:
 * - No faction-reward edges here: none of the 6 source pages stated a
 *   faction *reward* for these specific quests (Armor of Ro's "Faction
 *   Methods" section is prerequisites to reach faction, not a reward for
 *   completing the quest) -- see decisions/quest-reward-modeling.md on not
 *   inventing data a field merely supports.
 * - No total_experience: not stated anywhere in the source pages.
 * - Research Aid's lesser reward ("Runes and Research" tome, for a plain
 *   Lightstone) has no item node -- its wiki page 404'd under every title
 *   guessed, so it's just prose in the quest's steps, not a fabricated
 *   node. Only the Greater Lightstone's reward (Concordance of Research,
 *   confirmed real) gets a rewards edge.
 * - Plane of Fear (Paladin Epic Quest's start zone) didn't exist in the
 *   graph -- added here as a bare zone node, same as 015-add-missing-
 *   dungeons.ts did for other absent zones.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

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

function zoneId(label: string): string {
  return `zone:${slugify(label)}`;
}

// Plane of Fear doesn't exist in the graph yet -- bare zone node, same
// pattern as 015-add-missing-dungeons.ts.
addNode({ id: zoneId("Plane of Fear"), label: "Plane of Fear", type: "zone" });

interface QuestSpec {
  name: string;
  description: string;
  classes?: string[];
  minLevel?: number;
  steps: string[];
  giverName: string;
  giverZone: string;
  extraZones?: string[];
  item: Record<string, unknown>;
}

const quests: QuestSpec[] = [
  {
    name: "Armor of Ro",
    description: "Paladins of sufficient standing can craft a full set of Ro-forged armor by combining a Mold of Ro with a Bar of Ronium at a non-cultural forge.",
    classes: ["paladin"],
    minLevel: 30,
    steps: [
      "Reach Amiable faction with Lord Searfire in the Temple of Solusek Ro",
      "Gather the five Bar of Ronium ingredients: 2x Enchanted Platinum Bar, Melatite (from clockworks in Solusek's Eye), Mistmoore Granite (from gargoyles in Mistmoore Castle), Sand of Ro (from sand giants in the Ro zones), and Soil of Underfoot (from Priestess Ghalea in Kaladim)",
      "Combine the ingredients into a Bar of Ronium at a Sol Cauldron",
      "Acquire a Mold of Ro piece from its own sub-quest in Rathe Mountains",
      "Combine the Mold of Ro and Bar of Ronium at a non-cultural forge",
    ],
    giverName: "Lord Searfire",
    giverZone: "Temple of Solusek Ro",
    extraZones: ["Rathe Mountains"],
    item: {
      label: "Breastplate of Ro",
      slots: ["Chest"],
      classes: ["paladin"],
      ac: 20,
      stats: { str: 4 },
      resists: { fire: 10 },
      weight: 5.0,
      size: "Large",
      magic: true,
      lore: true,
      source: "Armor of Ro questline reward, combined at a forge from a Mold of Ro + Bar of Ronium",
    },
  },
  {
    name: "Mold of Ro Bracer",
    description: "David keeps the Bracers of Ro at the Rathe Mountains paladin camp, trading a mold for proof you've cleared out the local goblin net-masters at Lake Rathetear.",
    classes: ["paladin"],
    minLevel: 30,
    steps: [
      "Reach Amiable faction with the Deepwater Knights",
      "Kill a goblin net master at Lake Rathetear for 2x Deepwater Goblin Nets",
      "Turn in the nets to David in Rathe Mountains",
    ],
    giverName: "David",
    giverZone: "Rathe Mountains",
    item: {
      label: "Mold of Ro Bracer",
      classes: [],
      weight: 3.0,
      size: "Small",
      lore: true,
      noTrade: true,
      source: "Reward for turning in 2x Deepwater Goblin Nets to David (Rathe Mountains, Deepwater Knights faction)",
    },
  },
  {
    name: "Journeyman's Boots",
    description: "Hasten Bootstrutter, a gnome who never stops wandering Rathe Mountains, trades a permanent movement-speed clicky for a Ring of the Ancients, a borrowed Shadowed Rapier, and a small fortune in gold.",
    minLevel: 30,
    steps: [
      "Obtain a Ring of the Ancients",
      "Kill an Ancient Cyclops (found in Ocean of Tears, Southern Desert of Ro, South Karana, or East Karana) for a Shadowed Rapier -- it vanishes 30 minutes after logging off, so don't dawdle turning it in",
      "Gather 3,250 gold pieces (actual gold coin, not platinum)",
      "Track down Hasten Bootstrutter in Rathe Mountains and turn in all three before he wanders off",
    ],
    giverName: "Hasten Bootstrutter",
    giverZone: "Rathe Mountains",
    item: {
      label: "Journeyman's Boots",
      slots: ["Feet"],
      classes: [],
      ac: 1,
      effect: "JourneymanBoots (movement speed, Instant cast, outdoor use only)",
      weight: 2.5,
      size: "Small",
      magic: true,
      noTrade: true,
      source: "Journeyman's Boots quest reward (Hasten Bootstrutter, Rathe Mountains)",
    },
  },
  {
    name: "Research Aid",
    description: "Mrysila, Northern Karana's resident scholar, trades lightstones for spell-research aids -- a repeatable turn-in, not a one-time quest.",
    classes: ["enchanter", "magician", "necromancer", "wizard"],
    minLevel: 10,
    steps: [
      "Reach at least Apprehensive faction with Mrysila (Dubious or worse consumes your items without reward)",
      "Turn in a Lightstone (a common willowisp drop) for a Runes and Research tome",
      "Turn in a Greater Lightstone for a Concordance of Research",
    ],
    giverName: "Mrysila",
    giverZone: "Northern Karana",
    item: {
      label: "Concordance of Research",
      classes: [],
      capacity: 6,
      containerSize: "Giant",
      weight: 0.2,
      source: "Tradeskill container for spell research; reward for turning in a Greater Lightstone to Mrysila (Research Aid quest)",
    },
  },
  {
    name: "Paladin Epic Quest",
    description: "The long road to a Fiery Defender: purify three tainted darksteel pieces across three separate zone-spanning sub-quests, then combine them with a Fiery Avenger for Irak Altil in the Plane of Fear.",
    classes: ["paladin"],
    minLevel: 46,
    steps: [
      "Obtain the Tainted Darksteel Breastplate from Thought Destroyer in the Plane of Hate, then purify it via Jark and Nella Stonebraids in Kaladim for a Pure Crystal",
      "Obtain the Tainted Darksteel Sword from the Keeper of the Tombs in The Hole, then purify it by helping a peasant woman and her brother Joshua in West Freeport for a Bucket of Pure Water",
      "Obtain the Tainted Darksteel Shield from Kirak Vil in Nektulos Forest, then purify it through Elia the Pure in Felwithe",
      "Return all three purified pieces to Reklon Gnallen in Erudin's Temple of Quellious for the Mark of Atonement",
      "Complete the separate Fiery Avenger prerequisite quest",
      "Turn in the Mark of Atonement and the Fiery Avenger to Irak Altil in the Plane of Fear",
    ],
    giverName: "Irak Altil",
    giverZone: "Plane of Fear",
    item: {
      label: "Fiery Defender",
      slots: ["Primary"],
      classes: ["paladin"],
      ac: 15,
      stats: { str: 20, sta: 10, wis: 15 },
      resists: { fire: 10, disease: 10, cold: 10, magic: 10, poison: 10 },
      hp: 70,
      mana: 30,
      damage: 35,
      delay: 40,
      skill: "2H Slashing",
      effect: "Holy Shock at Level 50",
      magic: true,
      lore: true,
      noTrade: true,
      source: "Paladin Epic Quest final reward (Irak Altil, Plane of Fear)",
    },
  },
  {
    name: "Cleric Epic Quest",
    description: "A three-orb odyssey across Norrath's oceans and volcanoes, ending with the Water Sprinkler of Nem Ankh from the Avatar of Water.",
    classes: ["cleric"],
    minLevel: 46,
    steps: [
      "Orb of Frozen Water: kill Lord Bergurgle and trade his crown to Shmendrik Lavawalker, defeat the Spirit of Flame, trade its Damaged Goblin Crown to Natasha Whitewater for an Ornate Sea Shell, give the shell to Omat Vastsea in Timorous Deep for a Coral Statue, present the statue to A Seeker in the Temple of Solusek Ro (it becomes A Plasmatic Priest -- defeat it), kill Lord Gimblox in Solusek's Eye, then return the Plasmatic Priest Robe to Omat",
      "Orb of Clear Water: trade Lord Gimblox's Signet Ring to Natasha for a second Ornate Sea Shell, give it to Naxot Deepwater in Burning Woods to spawn Ixiblat Fer, kill it for a Sceptre, kill Overking Bathezid in Chardok for a Singed Scroll, then trade both to Omat",
      "Orb of Vapor: give a Message to Natasha for a Shimmering Pearl, present it to Zordak Ragefire in Nagafen's Lair (it becomes Zordakalicus Ragefire), kill it and loot its Heart, then trade the heart to Omat",
      "Give all three orbs to Jhassad Oceanson for the Orb of Triumvirate",
      "Present the Orb of Triumvirate to the Avatar of Water",
    ],
    giverName: "Shmendrik Lavawalker",
    giverZone: "Lake Rathetear",
    item: {
      label: "Water Sprinkler of Nem Ankh",
      slots: ["Primary"],
      classes: ["cleric"],
      stats: { sta: 10, cha: 15, wis: 25 },
      resists: { fire: 10, disease: 10, cold: 10, magic: 10, poison: 10 },
      mana: 100,
      damage: 20,
      delay: 32,
      skill: "1H Blunt",
      effect: "Reviviscence at Level 50 (Must Equip, 10.0s cast)",
      source: "Cleric Epic Quest final reward (the Avatar of Water)",
    },
  },
];

let questsAdded = 0;
let itemsAdded = 0;

for (const q of quests) {
  const questId = `quest:${slugify(q.name)}`;
  const itemId = `item:${slugify(q.item.label as string)}`;
  const giverId = `npc:${slugify(q.giverZone)}:${slugify(q.giverName)}`;
  const giverZoneId = zoneId(q.giverZone);

  addNode({ id: giverZoneId, label: q.giverZone, type: "zone" });
  addNode({ id: giverId, label: q.giverName, type: "npc", roles: ["quest_giver"] });
  addEdge(giverId, giverZoneId, "located_in");

  if (!hasNode(questId)) {
    addNode({
      id: questId,
      label: q.name,
      type: "quest",
      description: q.description,
      classes: q.classes || [],
      ...(q.minLevel !== undefined ? { minLevel: q.minLevel } : {}),
      steps: q.steps,
    });
    questsAdded++;
  }
  addEdge(giverId, questId, "starts");
  addEdge(questId, giverZoneId, "located_in");
  for (const extra of q.extraZones || []) {
    const extraId = zoneId(extra);
    addNode({ id: extraId, label: extra, type: "zone" });
    addEdge(questId, extraId, "located_in");
  }

  if (!hasNode(itemId)) {
    addNode({ id: itemId, type: "item", ...q.item });
    itemsAdded++;
  }
  addEdge(questId, itemId, "rewards");
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log(`Migration 028 complete: ${questsAdded} quests, ${itemsAdded} items added (plus NPCs/zones/edges)`);
