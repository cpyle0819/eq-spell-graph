/**
 * Migration 029: Fix a modeling bug from migration 028. "Armor of Ro" and
 * "Mold of Ro Bracer" were built as two independent quest nodes, but
 * eqlwiki.com's Armor_of_Ro_Quests page is actually ONE questline with
 * seven independent sub-quests (different NPC/faction/turn-in each,
 * sharing one page, one class/level gate, and one final crafting step) --
 * see decisions/quest-line-node-type.md for the fix (a `quest_line` node,
 * reusing the `member_of`/`starts` edge types) and decisions/
 * eqlwiki-quest-research-method.md for how "one wiki page, many sub-quests"
 * was already flagged as a scraper gotcha.
 *
 * - Removes the old generic quest:armor-of-ro node and its edges.
 * - Adds quest_line:armor-of-ro (the shared frame: Lord Searfire, Temple of
 *   Solusek Ro, Bar of Ronium crafting).
 * - Updates the existing quest:mold-of-ro-bracer to join the line and to
 *   also reward the finished Bracer of Ro (it previously only rewarded the
 *   raw mold).
 * - Adds the other 6 sub-quests (Boots/Breastplate/Gauntlets/Greaves/Helm/
 *   Vambrace), each rewarding both its raw Mold of Ro piece (the sub-
 *   quest's literal stated reward) and the finished armor piece (one more
 *   step away -- combine the mold with a Bar of Ronium at a forge; see
 *   decisions/quest-line-node-type.md for why both are modeled as
 *   `rewards` edges on the same quest rather than a separate crafting
 *   edge).
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

function updateNode(id: string, updates: Record<string, unknown>) {
  const node = graph.nodes.find((n: { data: { id: string } }) => n.data.id === id);
  if (node) Object.assign(node.data, updates);
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

// --- Remove the old, wrong "Armor of Ro" generic quest node ---
const staleQuestId = "quest:armor-of-ro";
graph.nodes = graph.nodes.filter((n: { data: { id: string } }) => n.data.id !== staleQuestId);
graph.edges = graph.edges.filter(
  (e: { data: { source: string; target: string } }) => e.data.source !== staleQuestId && e.data.target !== staleQuestId
);

const zoneId = (label: string) => `zone:${slugify(label)}`;
const RATHE_MOUNTAINS = "Rathe Mountains";
const TEMPLE_SOL_RO = "Temple of Solusek Ro";

// --- The questline itself ---
const questLineId = "quest_line:armor-of-ro";
addNode({
  id: questLineId,
  label: "Armor of Ro",
  type: "quest_line",
  description: "A Paladin-only armor set. Each piece has its own independent faction-gated turn-in at the Rathe Mountains paladin camp for a Mold of Ro; combine any mold with a hand-crafted Bar of Ronium at a non-cultural forge for the finished piece. There's no need to do all seven.",
  classes: ["paladin"],
  minLevel: 30,
  steps: [
    "Reach Amiable faction with Lord Searfire in the Temple of Solusek Ro",
    "Gather the five Bar of Ronium ingredients: 2x Enchanted Platinum Bar, Melatite (from clockworks in Solusek's Eye), Mistmoore Granite (from gargoyles in Mistmoore Castle), Sand of Ro (from sand giants in the Ro zones), and Soil of Underfoot (from Priestess Ghalea in Kaladim)",
    "Combine the ingredients into a Bar of Ronium at a Sol Cauldron",
    "Complete any of the seven Mold of Ro sub-quests at the Rathe Mountains paladin camp",
    "Combine the mold and the Bar of Ronium at a non-cultural forge for the matching finished piece",
  ],
});
const searfireId = "npc:temple-of-solusek-ro:lord-searfire";
addNode({ id: searfireId, label: "Lord Searfire", type: "npc", roles: ["quest_giver"] });
addEdge(searfireId, zoneId(TEMPLE_SOL_RO), "located_in");
addEdge(searfireId, questLineId, "starts");
addEdge(questLineId, zoneId(TEMPLE_SOL_RO), "located_in");

interface Piece {
  slug: string; // e.g. "bracer" -- used to build quest/item ids and labels
  giver: string;
  faction: string;
  turnIn: string;
  finished: Record<string, unknown>; // ItemDetails for the finished piece (label added below)
}

const PIECES: Piece[] = [
  {
    slug: "boots",
    giver: "Nicholas",
    faction: "Clerics of Underfoot",
    turnIn: "Kilij Plans (from Sandgiant Husam, South Ro)",
    finished: { slots: ["Feet"], ac: 11, hp: 35, weight: 1.5, size: "Medium", classes: ["paladin"], magic: true, lore: true },
  },
  {
    slug: "bracer",
    giver: "David",
    faction: "Deepwater Knights",
    turnIn: "2x Deepwater Goblin Nets (from a goblin net master, Lake Rathetear)",
    finished: { slots: ["Wrist"], ac: 9, resists: { magic: 5 }, weight: 2.0, size: "Small", classes: ["paladin"], magic: true },
  },
  {
    slug: "breastplate",
    giver: "Abigail",
    faction: "Clerics of Tunare",
    turnIn: "2x Dark Cauldron (from an ancille cook, Mistmoore Castle)",
    finished: { slots: ["Chest"], ac: 20, stats: { str: 4 }, resists: { fire: 10 }, weight: 5.0, size: "Large", classes: ["paladin"], magic: true, lore: true },
  },
  {
    slug: "gauntlets",
    giver: "Sentry Joanna",
    faction: "Priests of Marr",
    turnIn: "A Locket (from Sentry Alechin or a werewolf, Southern Karana -- killing the werewolf form avoids faction damage)",
    finished: { slots: ["Hands"], ac: 12, stats: { dex: 6 }, resists: { poison: 10 }, weight: 2.5, size: "Small", classes: ["paladin"], magic: true, lore: true },
  },
  {
    slug: "greaves",
    giver: "Elisabeth",
    faction: "Knights of Truth",
    turnIn: "Nightfall Giant's Head (from a nightfall giant, West Commonlands)",
    finished: { slots: ["Legs"], ac: 13, stats: { sta: 6 }, resists: { cold: 10 }, weight: 3.7, size: "Large", classes: ["paladin"], magic: true, lore: true },
  },
  {
    slug: "helm",
    giver: "Thomas",
    faction: "Knights of Thunder",
    turnIn: "2x Cyclops Skull (from an undead cyclops, Southern Karana)",
    finished: { slots: ["Head"], ac: 13, stats: { wis: 8 }, weight: 3.0, size: "Small", classes: ["paladin"], magic: true, lore: true },
  },
  {
    slug: "vambrace",
    giver: "Marianna",
    faction: "Priests of Life",
    turnIn: "2x Rotten Shark Meat (from a plague shark, Erud's Crossing)",
    finished: { slots: ["Arms"], ac: 11, stats: { wis: 6 }, resists: { disease: 10 }, weight: 3.2, size: "Small", classes: ["paladin"], magic: true, lore: true },
  },
];

const FINISHED_LABEL: Record<string, string> = {
  boots: "Boots of Ro",
  bracer: "Bracer of Ro",
  breastplate: "Breastplate of Ro",
  gauntlets: "Gauntlets of Ro",
  greaves: "Greaves of Ro",
  helm: "Helm of Ro",
  vambrace: "Vambraces of Ro",
};

let questsAdded = 0;
let itemsAdded = 0;

for (const piece of PIECES) {
  const questId = `quest:mold-of-ro-${piece.slug}`;
  const moldItemId = `item:mold-of-ro-${piece.slug}`;
  const finishedItemId = `item:${slugify(FINISHED_LABEL[piece.slug])}`;
  const giverId = `npc:${slugify(RATHE_MOUNTAINS)}:${slugify(piece.giver)}`;

  addNode({ id: giverId, label: piece.giver, type: "npc", roles: ["quest_giver"] });
  addEdge(giverId, zoneId(RATHE_MOUNTAINS), "located_in");

  const moldLabel = `Mold of Ro ${piece.slug.charAt(0).toUpperCase()}${piece.slug.slice(1)}`;
  const steps = [
    `Reach Amiable faction with the ${piece.faction}`,
    `Obtain ${piece.turnIn}`,
    `Turn it in to ${piece.giver} in Rathe Mountains for a ${moldLabel}`,
    `Combine the mold with a Bar of Ronium at a non-cultural forge for the finished ${FINISHED_LABEL[piece.slug]}`,
  ];

  const questData = {
    label: moldLabel,
    type: "quest",
    description: `${piece.giver}'s share of the Armor of Ro questline, trading proof of ${piece.faction} standing for a mold that becomes the ${FINISHED_LABEL[piece.slug]}.`,
    classes: ["paladin"],
    minLevel: 30,
    steps,
  };
  // quest:mold-of-ro-bracer already existed from migration 028, with an
  // older 3-step version that predates the finished-piece reward below --
  // update it to the same shape the other 6 get, rather than leaving it
  // inconsistent (see decisions/quest-line-node-type.md).
  if (!hasNode(questId)) {
    addNode({ id: questId, ...questData });
    questsAdded++;
  } else {
    updateNode(questId, questData);
  }
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId(RATHE_MOUNTAINS), "located_in");
  addEdge(questId, questLineId, "member_of");

  if (!hasNode(moldItemId)) {
    addNode({
      id: moldItemId,
      label: moldLabel,
      type: "item",
      lore: true,
      noTrade: true,
      source: `Reward for turning in ${piece.turnIn.replace(/\s*\(.*?\)\s*/g, "")} to ${piece.giver} (Rathe Mountains, ${piece.faction} faction)`,
    });
    itemsAdded++;
  }
  addEdge(questId, moldItemId, "rewards");

  if (!hasNode(finishedItemId)) {
    addNode({
      id: finishedItemId,
      label: FINISHED_LABEL[piece.slug],
      type: "item",
      ...piece.finished,
      source: `Armor of Ro questline reward, combined at a forge from a ${moldLabel} + Bar of Ronium`,
    });
    itemsAdded++;
  }
  addEdge(questId, finishedItemId, "rewards");
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log(`Migration 029 complete: removed stale quest:armor-of-ro, added quest_line + ${questsAdded} new sub-quests, ${itemsAdded} new items`);
