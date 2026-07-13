/**
 * Migration 034: 10 more quests off GitHub issue #26's checklist -- A Job
 * for Nanrum, Ale for Beur, Bandages for Honeybugger, Bug Collection, Cat
 * Courier, Errand for Tonmerk, Errand for Wolten, Note for Janam, Note for
 * Konem, Note for Rebby. Researched directly against eqlwiki.com (each
 * quest's own page plus its reward items' pages), following
 * decisions/eqlwiki-quest-research-method.md.
 *
 * Picked deliberately for existing-zone coverage: every quest giver sits in
 * a zone this graph already has (Grobb, East Freeport, Misty Thicket,
 * Paineel, North/South Qeynos). West Freeport and Qeynos Hills show up as
 * mid-quest travel steps (prose only, same as any other in-quest waypoint)
 * -- not modeled as `located_in` edges, since the giver's zone is what that
 * edge means per decisions/quest-reward-modeling.md. Kerra Island (Cat
 * Courier's turn-in stop) is the same case. Quests whose giver lives in a
 * zone with no node yet (Aid the Dar Brood -> Western Wastes, Fish Dinner
 * -> Kerra Island) were skipped this pass rather than bundling a whole new
 * zone's faction template into a quest migration.
 *
 * Deliberately NOT modeled:
 * - Raw gem/ore "shiny" rewards from A Job for Nanrum (Cat's Eye Agate,
 *   Chunk of Metal Ore, Hematite, Turquoise) -- generic tradeskill/junk
 *   loot, not distinct equipment; left as prose in the quest's own steps,
 *   same treatment as "Rusty Weapons" in migration 033.
 * - Every *worsened* faction each quest also states (Broken Skull Clan,
 *   Coalition of Tradefolk Underground, Deepwater Knights, Gate Callers,
 *   Craftkeepers, Crimson Hands, Bloodsabers, Dismal Rage, The Freeport
 *   Militia in Errand for Wolten specifically) -- `rewards` only models a
 *   positive reward (decisions/quest-reward-modeling.md); left as prose.
 * - Coin/platinum payouts (Cat Courier, Errand for Tonmerk, Errand for
 *   Wolten, Note for Konem, Note for Rebby) -- no coin field on `quest`
 *   nodes; left as prose in steps.
 * - "Rebby's Rat Whiskers" (Note for Rebby) -- the wiki page names it under
 *   both "turn-in" and "reward," but reading the step order it's handed to
 *   the player by Rebby only to be turned back in to Nestral TGaza one step
 *   later; modeled as a turn-in item in steps, not a kept `rewards` edge.
 * - `era` -- no era tag stated on any of these 10 quests' own pages, so
 *   left unset rather than guessed (decisions/quest-era-flagging.md).
 *
 * Errand for Tonmerk's reward is a spell (Smite), not an item or faction --
 * `getQuests()` in src/graph.ts only resolves `rewards` edges into
 * `itemRewards`/`factionRewards` buckets, so a `rewards` edge to a `spell`
 * node would sit in the graph but never render anywhere. Rather than
 * quietly extend that resolver (a real code change decisions/ hasn't
 * sanctioned) just to model one quest, the spell reward stays prose-only
 * in this quest's description/steps, same treatment as coin payouts below.
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

// ---------------------------------------------------------------------
// A Job for Nanrum
// ---------------------------------------------------------------------
{
  const zoneId = "zone:grobb";
  const giverId = "npc:grobb:basher-nanrum";
  addNode({ id: giverId, label: "Basher Nanrum", type: "npc", roles: ["quest_giver"] });
  addEdge(giverId, zoneId, "located_in");

  const questId = "quest:a-job-for-nanrum";
  addNode({
    id: questId,
    label: "A Job for Nanrum",
    type: "quest",
    description: "Basher Nanrum in Grobb trades three Fire Beetle Eyes at a time for a random 'shiny' reward, while improving your standing with DaBashers at the cost of the Broken Skull Clan.",
    classes: [],
    minLevel: 1,
    steps: [
      "Hail Basher Nanrum in Grobb and ask 'What job?'",
      "Collect three Fire Beetle Eyes and hand them over",
      "Receive a random reward: a Brass Earring, a Silver Earring, or a raw gem/ore (Cat's Eye Agate, Chunk of Metal Ore, Hematite, or Turquoise)",
    ],
    wiki_title: "A Job for Nanrum",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const brassEarringId = "item:brass-earring";
  addNode({
    id: brassEarringId,
    label: "Brass Earring",
    type: "item",
    slots: ["Ear"],
    ac: 2,
    weight: 0.1,
    size: "Tiny",
    source: "A Job for Nanrum reward (Basher Nanrum, Grobb); also drops from the orc taskmaster in Crushbone",
  });
  addEdge(questId, brassEarringId, "rewards");

  const silverEarringId = "item:silver-earring";
  addNode({
    id: silverEarringId,
    label: "Silver Earring",
    type: "item",
    slots: ["Ear"],
    weight: 0.1,
    size: "Tiny",
    source: "A Job for Nanrum reward (Basher Nanrum, Grobb)",
  });
  addEdge(questId, silverEarringId, "rewards");

  addFactionReward(questId, "DaBashers");
}

// ---------------------------------------------------------------------
// Ale for Beur
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-freeport";
  const giverId = "npc:east-freeport:beur-tenlah";
  addNode({ id: giverId, label: "Beur Tenlah", type: "npc", roles: ["quest_giver"] });
  addEdge(giverId, zoneId, "located_in");

  const questId = "quest:ale-for-beur";
  addNode({
    id: questId,
    label: "Ale for Beur",
    type: "quest",
    description: "Beur Tenlah in East Freeport wants Dwarven Ale delivered -- a fetch quest that also kicks off the Note for Janam chain through Harkin Duskfoot.",
    classes: ["warrior", "ranger", "bard", "rogue"],
    minLevel: 1,
    steps: [
      "Find Beur Tenlah in East Freeport",
      "Obtain Dwarven Ale and deliver it to Beur Tenlah",
    ],
    wiki_title: "Ale for Beur",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const glovesId = "item:used-merchants-gloves";
  addNode({
    id: glovesId,
    label: "Used Merchants Gloves",
    type: "item",
    slots: ["Hands"],
    stats: { agi: 1 },
    weight: 0.2,
    size: "Small",
    source: "Ale for Beur / Note for Janam reward",
  });
  addEdge(questId, glovesId, "rewards");
}

// ---------------------------------------------------------------------
// Bandages for Honeybugger
// ---------------------------------------------------------------------
{
  const zoneId = "zone:misty-thicket";
  const giverId = "npc:misty-thicket:joogl-honeybugger";
  addNode({ id: giverId, label: "Joogl Honeybugger", type: "npc", roles: ["quest_giver"] });
  addEdge(giverId, zoneId, "located_in");

  const questId = "quest:bandages-for-honeybugger";
  addNode({
    id: questId,
    label: "Bandages for Honeybugger",
    type: "quest",
    description: "Joogl Honeybugger in Misty Thicket was stung collecting bixie honeycombs and needs a bandage -- a one-item turn-in, no combat required, no experience paid.",
    classes: [],
    minLevel: 1,
    steps: [
      "Hail Joogl Honeybugger in Misty Thicket and ask 'What hurts?'",
      "Give him 1 Bandages",
    ],
    wiki_title: "Bandages for Honeybugger",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  for (const label of ["Merchants of Rivervale", "Deeppockets", "Guardians of the Vale", "Mayor Gubbin"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Bug Collection
// ---------------------------------------------------------------------
{
  const zoneId = "zone:misty-thicket";
  const giverId = "npc:misty-thicket:blixkin-entopop";
  addNode({ id: giverId, label: "Blixkin Entopop", type: "npc", roles: ["quest_giver"] });
  addEdge(giverId, zoneId, "located_in");

  const questId = "quest:bug-collection";
  addNode({
    id: questId,
    label: "Bug Collection",
    type: "quest",
    description: "Blixkin Entopop in Misty Thicket sends adventurers out for six specific bug parts, combined into a box for a random charged trinket reward.",
    classes: [],
    minLevel: 14,
    steps: [
      "Hail Blixkin Entopop in Misty Thicket to make him stop walking, then work through his dialogue about bugs",
      "Collect a Spiderling Eye, Spiderling Silk, Fire Beetle Eye, Giant Scarab Egg Sack, Giant Fire Beetle Leg, and Giant Wasp Wing",
      "Combine the items into the box he gave you and turn it back in to Blixkin Entopop",
    ],
    wiki_title: "Bug Collection",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const braceletId = "item:bracelet-of-beetlekind";
  addNode({
    id: braceletId,
    label: "Bracelet of Beetlekind",
    type: "item",
    slots: ["Wrist"],
    ac: 2,
    stats: { str: 3, int: -3 },
    resists: { fire: 10 },
    weight: 1.0,
    size: "Small",
    magic: true,
    lore: true,
    effect: "Strengthen (Any Slot, Casting Time: Instant)",
    source: "Bug Collection quest reward (Blixkin Entopop, Misty Thicket)",
  });
  addEdge(questId, braceletId, "rewards");

  const potionId = "item:potion-of-poison-warding";
  addNode({
    id: potionId,
    label: "Potion of Poison Warding",
    type: "item",
    weight: 0.4,
    size: "Small",
    effect: "Counteract Poison (Any Slot, Casting Time: 6.0)",
    source: "Bug Collection quest reward (Blixkin Entopop, Misty Thicket)",
  });
  addEdge(questId, potionId, "rewards");

  const silverBraceletId = "item:silver-bracelet";
  addNode({
    id: silverBraceletId,
    label: "Silver Bracelet",
    type: "item",
    slots: ["Wrist"],
    ac: 2,
    stats: { int: -3, agi: 3 },
    resists: { poison: 10 },
    weight: 1.0,
    size: "Small",
    magic: true,
    lore: true,
    effect: "Cure Poison (Any Slot, Casting Time: 6.0)",
    source: "Bug Collection quest reward (Blixkin Entopop, Misty Thicket)",
  });
  addEdge(questId, silverBraceletId, "rewards");

  const spiderVenomId = "item:spider-venom";
  addNode({
    id: spiderVenomId,
    label: "Spider Venom",
    type: "item",
    weight: 0.2,
    size: "Small",
    effect: "Weakening Poison I (Combat) at Level 5",
    source: "Bug Collection quest reward; also drops from a large widow in Toxxulia Forest",
  });
  addEdge(questId, spiderVenomId, "rewards");

  const stalkingProbeId = "item:stalking-probe";
  addNode({
    id: stalkingProbeId,
    label: "Stalking Probe",
    type: "item",
    slots: ["Primary"],
    weight: 0.1,
    size: "Small",
    effect: "Stalking Probe (Any Slot, Casting Time: Instant)",
    source: "Bug Collection quest reward (Blixkin Entopop, Misty Thicket)",
  });
  addEdge(questId, stalkingProbeId, "rewards");

  for (const label of ["Merchants of Rivervale", "Deeppockets", "Guardians of the Vale", "Mayor Gubbin"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Cat Courier
// ---------------------------------------------------------------------
{
  const zoneId = "zone:paineel";
  const giverId = "npc:paineel:antus-shelbra";
  addNode({ id: giverId, label: "Antus Shelbra", type: "npc", roles: ["quest_giver"] });
  addEdge(giverId, zoneId, "located_in");

  const questId = "quest:cat-courier";
  addNode({
    id: questId,
    label: "Cat Courier",
    type: "quest",
    description: "Antus Shelbra in Paineel's Abattoir sends necromancers to deliver a sealed bag to a contact on Kerra Island and bring back what's handed over in return.",
    classes: ["necromancer"],
    minLevel: 15,
    steps: [
      "Hail Antus Shelbra on the third floor of the Abattoir in Paineel and receive A Smelly Sealed Bag",
      "Travel to Kerra Island and hand the bag to Kirran Mirrah",
      "Return Karran's Head to Antus Shelbra in Paineel",
    ],
    wiki_title: "Cat Courier",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  addFactionReward(questId, "Heretics");
}

// ---------------------------------------------------------------------
// Errand for Tonmerk
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-qeynos";
  const giverId = "npc:north-qeynos:tonmerk-plorsin";
  addNode({ id: giverId, label: "Tonmerk Plorsin", type: "npc", roles: ["quest_giver"] });
  addEdge(giverId, zoneId, "located_in");

  const questId = "quest:errand-for-tonmerk";
  addNode({
    id: questId,
    label: "Errand for Tonmerk",
    type: "quest",
    description: "Tonmerk Plorsin in North Qeynos's Temple of Life sends clerics to fetch a reagent flask from Serna Tasknon at the Temple of Marr in Freeport, then back with shark bones and gold for Shark Powder -- a multi-leg errand that pays out the Smite spell.",
    classes: ["cleric"],
    minLevel: 13,
    steps: [
      "Speak with Tonmerk Plorsin inside the Temple of Life in North Qeynos and agree to pick up a reagent",
      "Travel to the Temple of Marr in Freeport and give the flask to Serna Tasknon",
      "Gather three shark bones and pay Serna Tasknon ten gold pieces for Shark Powder",
      "Return the Shark Powder to Tonmerk Plorsin in North Qeynos",
      "Reward: the Smite spell (not modeled as a graph edge -- see migration header)",
    ],
    wiki_title: "Errand for Tonmerk",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  for (const label of ["Priests of Life", "Knights of Thunder", "Guards of Qeynos"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Errand for Wolten
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:wolten-grafe";
  addNode({ id: giverId, label: "Wolten Grafe", type: "npc", roles: ["quest_giver"] });
  addEdge(giverId, zoneId, "located_in");

  const questId = "quest:errand-for-wolten";
  addNode({
    id: questId,
    label: "Errand for Wolten",
    type: "quest",
    description: "Wolten Grafe in South Qeynos hands over a scroll for delivery to Eestyana Naestra in West Freeport's Hall of Truth, trading standing with the Freeport Militia and Dismal Rage for goodwill with the Knights of Truth, Priests of Marr, and Steel Warriors.",
    classes: [],
    minLevel: 1,
    steps: [
      "Receive a scroll from Wolten Grafe in South Qeynos",
      "Deliver the scroll to Eestyana Naestra in the Hall of Truth, West Freeport",
    ],
    wiki_title: "Errand for Wolten",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const prayerBeadsId = "item:prayer-beads";
  addNode({
    id: prayerBeadsId,
    label: "Prayer Beads",
    type: "item",
    slots: ["Neck"],
    weight: 0.2,
    size: "Small",
    classes: ["warrior", "cleric", "paladin", "ranger", "druid", "monk", "bard", "rogue", "wizard", "magician", "enchanter"],
    magic: true,
    lore: true,
    effect: "Healing (Instant)",
    source: "Errand for Wolten reward (Eestyana Naestra, West Freeport); also drops from Parcil Vinder in Western Plains of Karana",
  });
  addEdge(questId, prayerBeadsId, "rewards");

  const morningStarId = "item:rusty-morning-star";
  addNode({
    id: morningStarId,
    label: "Rusty Morning Star",
    type: "item",
    slots: ["Primary", "Secondary"],
    skill: "1H Blunt",
    damage: 6,
    delay: 44,
    weight: 10.0,
    size: "Medium",
    classes: ["warrior", "cleric", "paladin", "ranger", "druid", "monk", "bard", "rogue", "shaman", "shadow knight", "beastlord", "berserker"],
    source: "Errand for Wolten reward (Eestyana Naestra, West Freeport); drops from low-level humanoids in various zones",
  });
  addEdge(questId, morningStarId, "rewards");

  const lanternId = "item:small-lantern";
  addNode({
    id: lanternId,
    label: "Small Lantern",
    type: "item",
    slots: ["Secondary"],
    weight: 0.7,
    size: "Small",
    lightSource: true,
    source: "Errand for Wolten reward (Eestyana Naestra, West Freeport); also sold by merchants across many zones",
  });
  addEdge(questId, lanternId, "rewards");

  for (const label of ["Knights of Truth", "Priests of Marr", "Steel Warriors"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Note for Janam
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-freeport";
  const giverId = "npc:east-freeport:harkin-duskfoot";
  addNode({ id: giverId, label: "Harkin Duskfoot", type: "npc", roles: ["quest_giver"] });
  addEdge(giverId, zoneId, "located_in");

  const questId = "quest:note-for-janam";
  addNode({
    id: questId,
    label: "Note for Janam",
    type: "quest",
    description: "Harkin Duskfoot in the East Freeport tunnels continues the Ale for Beur chain -- deliver ale to Beur Tenlah first, then carry sealed notes between Harkin and Janam Rekish in West Freeport.",
    classes: [],
    minLevel: 1,
    steps: [
      "Purchase and deliver Dwarven Ale to Beur Tenlah (see Ale for Beur)",
      "Ask Harkin Duskfoot 'What message?' and receive a Note to Janam",
      "Travel to West Freeport and give the note to Janam Rekish",
      "Return Janam's reply note to Harkin Duskfoot in East Freeport",
    ],
    wiki_title: "Note for Janam",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  addEdge(questId, "item:used-merchants-gloves", "rewards");

  for (const label of ["Coalition of Tradefolk Underground", "Coalition of Tradefolk", "Carson McCabe", "Corrupt Qeynos Guards", "The Freeport Militia"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Note for Konem
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-qeynos";
  const giverId = "npc:north-qeynos:phin-esrinap";
  addNode({ id: giverId, label: "Phin Esrinap", type: "npc", roles: ["quest_giver"] });
  addEdge(giverId, zoneId, "located_in");

  const questId = "quest:note-for-konem";
  addNode({
    id: questId,
    label: "Note for Konem",
    type: "quest",
    description: "Phin Esrinap in North Qeynos's monk guild relays notes between himself and Konem Matse in Qeynos Hills and back again -- a two-leg courier errand for monks (or those not already hated by the guild).",
    classes: ["monk"],
    minLevel: 1,
    steps: [
      "Ask Phin Esrinap in the North Qeynos monk's guild 'Where is Konem?' and receive a Message to Konem",
      "Find Konem Matse in Qeynos Hills and give him the note",
      "Receive Grathin's Invoice from Konem Matse and return it to Phin",
    ],
    wiki_title: "Note for Konem",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const waterFlaskId = "item:water-flask";
  addNode({
    id: waterFlaskId,
    label: "Water Flask",
    type: "item",
    weight: 0.4,
    size: "Small",
    value: "1s 1c",
    source: "Note for Konem reward (Phin Esrinap, North Qeynos); also sold by merchants across many zones",
  });
  addEdge(questId, waterFlaskId, "rewards");

  for (const label of ["Silent Fist Clan", "Guards of Qeynos", "Ashen Order"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Note for Rebby
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-freeport";
  const giverId = "npc:east-freeport:nestral-tgaza";
  addNode({ id: giverId, label: "Nestral TGaza", type: "npc", roles: ["quest_giver"] });
  addEdge(giverId, zoneId, "located_in");

  const questId = "quest:note-for-rebby";
  addNode({
    id: questId,
    label: "Note for Rebby",
    type: "quest",
    description: "Nestral TGaza in the East Freeport tunnels sends a runner to Rebby and Janam in West Freeport with a message, then back with Rebby's Rat Whiskers -- geared toward evil and neutral classes.",
    classes: [],
    minLevel: 1,
    steps: [
      "Hail Nestral TGaza in the East Freeport tunnels and agree to help",
      "Carry a Message to Rebby to Rebby and Janam in West Freeport",
      "Receive Rebby's Rat Whiskers and return them to Nestral TGaza",
    ],
    wiki_title: "Note for Rebby",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  for (const label of ["Coalition of Tradefolk Ill", "Coalition of Tradefolk", "Carson McCabe", "Corrupt Qeynos Guards", "The Freeport Militia"]) {
    addFactionReward(questId, label);
  }
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 034 complete: 10 more quests added");
