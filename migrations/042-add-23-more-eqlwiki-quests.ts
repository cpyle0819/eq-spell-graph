/**
 * Migration 042: 23 more quests off GitHub issue #26's checklist -- the 9
 * per-city Bread Shipment deliveries (East Freeport, Erudin, Feerrott,
 * Halas, N Karana, Neriak, Qeynos, W Karana Danin, W Karana Rislarn),
 * Runnyeye Warbeads (Kaladim Rogue, Rivervale), Poacher's Head Quest
 * (Erudin, Surefall Glade), Bone Chips (Kaladim), Guild Summons - Abbey of
 * Deep Musing Rogue, Cure Disease (Qeynos), Cure Poison (Qeynos), Fresh
 * Baked Muffins (Qeynos), Newbie Quest: Halfling Druid, Newbie Quest: Troll
 * Warrior, Kobold Molars (Good), Skeleton Killing, Gnoll Bounty. Researched
 * directly against eqlwiki.com (each quest's own page, plus reward and
 * turn-in items' pages), following decisions/eqlwiki-quest-research-method.md.
 * `located_in` follows the broadened rule from migration 041 -- any zone a
 * step sends the player to for a required item, even when it's one of
 * several valid sources (decisions/quest-reward-modeling.md).
 *
 * Skipped this pass for missing-zone reasons (South Kaladim doesn't exist
 * in this graph, only North Kaladim does): Runnyeye Warbeads (Kaladim
 * Warrior, giver Byzar Bloodforge), The Bread Shipment (Kaladim) and Fresh
 * Baked Muffins (Kaladim) (both giver Gretta Mottle at Irontoe's Eats --
 * confirmed South Kaladim by Fresh Baked Muffins' own page, despite The
 * Bread Shipment (Kaladim)'s page only saying "Kaladim"), and Rat Pelts
 * (giver Beno Targnarle). Bone Chips (Kaladim) and Runnyeye Warbeads
 * (Kaladim Rogue) are NOT skipped -- their own pages explicitly place
 * their givers (Gunlok Jure, Diggins) in North Kaladim specifically, a
 * different in-city location from Irontoe's Eats.
 *
 * Also skipped: Cannibalize II (Evil) -- unlike its already-added "Good"
 * counterpart, this version's turn-in chain requires four zones this graph
 * doesn't have at all (Timorous Deep, City of Mist, Trakanon's Teeth,
 * Karnor's Castle), a much bigger scope than one missing zone. Cabilis Pale
 * Ale (Firiona Vie) -- its own page states the quest is "unsolved and
 * broken" with reward "UNKNOWN," matching migration 040's precedent for
 * skipping confirmed-non-functional quests (Boysenberry Pie Quest, Blood
 * Ink, Burynai Bundt Cake).
 *
 * The Bread Shipment quests all share one mechanic (buy a Bag of Bread
 * Loaves from Jarlen Meadowgreen in Southern Karana for 2 gold, deliver it
 * to a city innkeeper) -- modeled as a data-driven loop rather than 9
 * near-identical blocks. The Bag of Bread Loaves itself isn't modeled as an
 * item node (a purchased turn-in requirement, not a reward -- same
 * treatment as Fire Opal in migration 041). Coin rewards and negative
 * faction changes (Circle of Unseen Hands worsens on several variants)
 * aren't modeled, consistent with every migration so far.
 *
 * Deliberately NOT modeled:
 * - Bone Chips (Kaladim)'s reward pool ("one item from... weapons like
 *   Rusty Axe/Mace, armor pieces, or utility items") -- too vague to name
 *   specific items without guessing.
 * - Skeleton Killing's non-spell reward pool (backpack, belt pouch, several
 *   armor/weapon pieces) -- same reasoning; only the 8 named cleric spells
 *   (already real spell nodes, reused from migration 040's Bat Fur and
 *   Beetle Legs) are modeled as rewards.
 * - Poacher's Head Quest (Erudin)'s Fishing Spear and Malachite -- no
 *   stats stated on the quest page; Copper Band and Rusty Rapier reuse
 *   this graph's existing item nodes (`item:copper-band`,
 *   `item:rusty-dagger` for the Runnyeye Warbeads weapon set) where the
 *   name matches an item already modeled elsewhere. Small Lantern reuses
 *   the existing `item:small-lantern` node.
 * - Kobold Molars (Good)'s "about a one in four chance" Ringmail Armor or
 *   minor weapon -- randomized, unnamed pool.
 * - Gnoll Bounty's "minor item reward" -- unnamed.
 * - era -- unset; none of these quests' own pages state a content era tag.
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
// The Bread Shipment (x9 cities)
// ---------------------------------------------------------------------
{
  const southernKaranaId = "zone:southern-karana";

  const cities: Array<{
    slug: string;
    label: string;
    giverName: string;
    giverZoneId: string;
    goodAligned?: boolean;
    factions: string[];
  }> = [
    {
      slug: "east-freeport",
      label: "East Freeport",
      giverName: "Innkeep Nasumi",
      giverZoneId: "zone:east-freeport",
      factions: ["Merchants of Qeynos", "Coalition of Tradefolk", "Knights of Truth", "Coalition of Tradefolk Ill"],
    },
    {
      slug: "erudin",
      label: "Erudin",
      giverName: "Beth Breadmaker",
      giverZoneId: "zone:erudin",
      goodAligned: true,
      factions: ["Merchants of Erudin", "High Council of Erudin", "High Guard of Erudin"],
    },
    {
      slug: "feerrott",
      label: "Feerrott",
      giverName: "Innkeep Morpa",
      giverZoneId: "zone:the-feerrott",
      factions: ["Merchants of Ogguk", "Clurg", "Oggok Guards"],
    },
    {
      slug: "halas",
      label: "Halas",
      giverName: "Hetie McDonald",
      giverZoneId: "zone:halas",
      factions: ["Merchants of Halas", "Wolves of the North", "Shamen of Justice"],
    },
    {
      slug: "n-karana",
      label: "N Karana",
      giverName: "Innkeep James",
      giverZoneId: "zone:northern-karana",
      factions: ["Merchants of Qeynos", "Antonius Bayle", "Coalition of Tradefolk", "Guards of Qeynos"],
    },
    {
      slug: "neriak",
      label: "Neriak",
      giverName: "Sal Drana",
      giverZoneId: "zone:neriak-foreign-quarter",
      factions: ["Dark Bargainers", "Dreadguard Outer", "Dreadguard Inner"],
    },
    {
      slug: "qeynos",
      label: "Qeynos",
      giverName: "Karn Tassen",
      giverZoneId: "zone:south-qeynos",
      factions: ["Merchants of Qeynos", "Antonius Bayle", "Coalition of Tradefolk", "Guards of Qeynos"],
    },
    {
      slug: "w-karana-danin",
      label: "W Karana Danin",
      giverName: "Innkeep Danin",
      giverZoneId: "zone:west-karana",
      factions: ["Merchants of Qeynos", "Antonius Bayle", "Coalition of Tradefolk", "Guards of Qeynos"],
    },
    {
      slug: "w-karana-rislarn",
      label: "W Karana Rislarn",
      giverName: "Innkeep Rislarn",
      giverZoneId: "zone:west-karana",
      factions: ["Merchants of Qeynos", "Antonius Bayle", "Coalition of Tradefolk", "Guards of Qeynos"],
    },
  ];

  for (const city of cities) {
    const giverId = `npc:${city.giverZoneId.replace("zone:", "")}:${slug(city.giverName)}`;
    addGiver(giverId, city.giverName, city.giverZoneId);

    const questId = `quest:the-bread-shipment-${city.slug}`;
    addNode({
      id: questId,
      label: `The Bread Shipment (${city.label})`,
      type: "quest",
      description:
        `${city.giverName} trades a Bag of Bread Loaves, purchased from Jarlen Meadowgreen in Southern Karana for 2 gold, for experience, coin, and faction.` +
        (city.goodAligned ? " Good-aligned characters only." : ""),
      minLevel: 1,
      steps: [
        "Purchase a Bag of Bread Loaves from Jarlen Meadowgreen in Southern Karana for 2 gold",
        `Deliver the bread to ${city.giverName}`,
      ],
      wiki_title: `The Bread Shipment (${city.label})`,
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, city.giverZoneId, "starts_in");
    addEdge(questId, city.giverZoneId, "located_in");
    addEdge(questId, southernKaranaId, "located_in");
    for (const faction of city.factions) addFactionReward(questId, faction);
  }
}

// ---------------------------------------------------------------------
// Runnyeye Warbeads (Kaladim Rogue)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-kaladim";
  const butcherblockId = "zone:butcherblock-mountains";
  const mistyThicketId = "zone:misty-thicket";
  const giverId = "npc:north-kaladim:diggins";
  addGiver(giverId, "Diggins", zoneId);

  const questId = "quest:runnyeye-warbeads-kaladim-rogue";
  addNode({
    id: questId,
    label: "Runnyeye Warbeads (Kaladim Rogue)",
    type: "quest",
    description:
      "Diggins in North Kaladim's mining tunnels trades four RunnyEye Warbeads, looted from goblins in Butcherblock Mountains or Misty Thicket, for a choice of piercing weapon.",
    classes: ["bard", "enchanter", "magician", "necromancer", "ranger", "rogue", "shadow knight", "shaman", "warrior", "wizard"],
    minLevel: 9,
    steps: ["Collect four RunnyEye Warbeads from goblins in Butcherblock Mountains or Misty Thicket", "Turn them in to Diggins for a choice of piercing weapon"],
    wiki_title: "Runnyeye Warbeads (Kaladim Rogue)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, butcherblockId, "located_in");
  addEdge(questId, mistyThicketId, "located_in");

  addEdge(questId, "item:rusty-dagger", "rewards");
  const rapierId = "item:rusty-rapier";
  addNode({ id: rapierId, label: "Rusty Rapier", type: "item", slots: ["Primary", "Secondary"], skill: "Piercing", damage: 4, delay: 31, source: "Runnyeye Warbeads (Kaladim Rogue) reward (Diggins, North Kaladim)" });
  addEdge(questId, rapierId, "rewards");
  const spearId = "item:rusty-shortened-spear";
  addNode({ id: spearId, label: "Rusty Shortened Spear", type: "item", slots: ["Primary", "Secondary"], skill: "Piercing", damage: 4, delay: 32, source: "Runnyeye Warbeads (Kaladim Rogue) reward (Diggins, North Kaladim)" });
  addEdge(questId, spearId, "rewards");
  const longSpearId = "item:rusty-spear";
  addNode({ id: longSpearId, label: "Rusty Spear", type: "item", slots: ["Primary", "Secondary"], skill: "Piercing", damage: 5, delay: 38, source: "Runnyeye Warbeads (Kaladim Rogue) reward (Diggins, North Kaladim)" });
  addEdge(questId, longSpearId, "rewards");
}

// ---------------------------------------------------------------------
// Runnyeye Warbeads (Rivervale)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:rivervale";
  const butcherblockId = "zone:butcherblock-mountains";
  const mistyThicketId = "zone:misty-thicket";
  const giverId = "npc:rivervale:sheriff-roglio";
  addGiver(giverId, "Sheriff Roglio", zoneId);

  const questId = "quest:runnyeye-warbeads-rivervale";
  addNode({
    id: questId,
    label: "Runnyeye Warbeads (Rivervale)",
    type: "quest",
    description:
      "Sheriff Roglio in Rivervale trades four RunnyEye Warbeads, looted from goblins in Butcherblock Mountains or Misty Thicket, for Bixie Berry Buns and a Tagglefoot Tingle Drink. Requires Amiable faction or better.",
    minLevel: 5,
    steps: ["Collect four RunnyEye Warbeads from goblins in Butcherblock Mountains or Misty Thicket", "Turn them in to Sheriff Roglio"],
    wiki_title: "Runnyeye Warbeads (Rivervale)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, butcherblockId, "located_in");
  addEdge(questId, mistyThicketId, "located_in");

  const bunsId = "item:bixie-berry-buns";
  addNode({ id: bunsId, label: "Bixie Berry Buns", type: "item", weight: 1.0, size: "Small", source: "Runnyeye Warbeads (Rivervale) reward (Sheriff Roglio, Rivervale)" });
  addEdge(questId, bunsId, "rewards");
  const drinkId = "item:tagglefoot-tingle-drink";
  addNode({ id: drinkId, label: "Tagglefoot Tingle Drink", type: "item", weight: 0.4, size: "Small", source: "Runnyeye Warbeads (Rivervale) reward (Sheriff Roglio, Rivervale)" });
  addEdge(questId, drinkId, "rewards");
}

// ---------------------------------------------------------------------
// Poacher's Head Quest (Erudin)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const toxxuliaId = "zone:toxxulia-forest";
  const surefallId = "zone:surefall-glade";
  const giverId = "npc:erudin:jras-solsier";
  addGiver(giverId, "Jras Solsier", zoneId);

  const questId = "quest:poachers-head-quest-erudin";
  addNode({
    id: questId,
    label: "Poacher's Head Quest (Erudin)",
    type: "quest",
    description:
      "Jras Solsier, outside the Temple of Divine Light in Erudin, trades a Poacher's Head (from a poacher in Toxxulia Forest or Surefall Glade) for a choice of reward. Requires Amiable faction or better with the Peace Keepers.",
    minLevel: 4,
    steps: ["Obtain a Poacher's Head from a poacher in Toxxulia Forest or Surefall Glade", "Deliver it to Jras Solsier for a choice of Copper Band, Malachite, Fishing Spear, Rusty Rapier, or Small Lantern"],
    wiki_title: "Poacher's Head Quest (Erudin)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, toxxuliaId, "located_in");
  addEdge(questId, surefallId, "located_in");

  addEdge(questId, "item:copper-band", "rewards");
  addEdge(questId, "item:small-lantern", "rewards");
  addEdge(questId, "item:rusty-rapier", "rewards");
  const malachiteId = "item:malachite";
  addNode({ id: malachiteId, label: "Malachite", type: "item", source: "Poacher's Head Quest (Erudin) reward (Jras Solsier, Erudin)" });
  addEdge(questId, malachiteId, "rewards");
  const spearId = "item:fishing-spear";
  addNode({ id: spearId, label: "Fishing Spear", type: "item", slots: ["Primary"], source: "Poacher's Head Quest (Erudin) reward (Jras Solsier, Erudin)" });
  addEdge(questId, spearId, "rewards");
  addFactionReward(questId, "Peace Keepers");
  addFactionReward(questId, "High Council of Erudin");
}

// ---------------------------------------------------------------------
// Poacher's Head Quest (Surefall Glade)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:surefall-glade";
  const toxxuliaId = "zone:toxxulia-forest";
  const giverId = "npc:surefall-glade:gillarian-naelev";
  addGiver(giverId, "Gillarian Naelev", zoneId);

  const questId = "quest:poachers-head-quest-surefall-glade";
  addNode({
    id: questId,
    label: "Poacher's Head Quest (Surefall Glade)",
    type: "quest",
    description:
      "Gillarian Naelev in Surefall Glade trades a Gnoll Poacher Head for a Rough Elm Recurve Bow and coin, or a plain Poacher's Head (from Surefall Glade or Toxxulia Forest) for lesser coin and the same faction gains.",
    minLevel: 5,
    steps: [
      "Hand Gillarian Naelev a Gnoll Poacher Head for a Rough Elm Recurve Bow and 7 gold",
      "Or hand him a Poacher's Head from Surefall Glade or Toxxulia Forest for 3-6 gold and faction only",
    ],
    wiki_title: "Poacher's Head Quest (Surefall Glade)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, toxxuliaId, "located_in");

  const bowId = "item:rough-elm-recurve-bow";
  addNode({
    id: bowId,
    label: "Rough Elm Recurve Bow",
    type: "item",
    slots: ["Range"],
    damage: 13,
    classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"],
    source: "Poacher's Head Quest (Surefall Glade) reward (Gillarian Naelev, Surefall Glade)",
  });
  addEdge(questId, bowId, "rewards");
  addFactionReward(questId, "Protectors of Pine");
  addFactionReward(questId, "Jaggedpine Treefolk");
  addFactionReward(questId, "Guards of Qeynos");
}

// ---------------------------------------------------------------------
// Bone Chips (Kaladim)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-kaladim";
  const giverId = "npc:north-kaladim:gunlok-jure";
  addGiver(giverId, "Gunlok Jure", zoneId);

  const questId = "quest:bone-chips-kaladim";
  addNode({
    id: questId,
    label: "Bone Chips (Kaladim)",
    type: "quest",
    description: "Gunlok Jure, at the Paladin guild in North Kaladim, trades four unstacked Bone Chips for a random item and coin.",
    minLevel: 1,
    steps: ["Gather four unstacked Bone Chips", "Turn them in to Gunlok Jure for a random reward item"],
    wiki_title: "Bone Chips (Kaladim)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Clerics of Underfoot");
  addFactionReward(questId, "Kazon Stormhammer");
  addFactionReward(questId, "Miners Guild 249");
}

// ---------------------------------------------------------------------
// Guild Summons - Abbey of Deep Musing Rogue
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ak-anon";
  const giverId = "npc:ak-anon:welno-tanboots";
  addGiver(giverId, "Welno Tanboots", zoneId);

  const questId = "quest:guild-summons-abbey-of-deep-musing-rogue";
  addNode({
    id: questId,
    label: "Guild Summons - Abbey of Deep Musing Rogue",
    type: "quest",
    description:
      "A note directs new Gnome rogues (who don't follow Bertoxxulous) of the Abbey of Deep Musing (Ak'Anon) to deliver it to Welno Tanboots, joining the guild.",
    classes: ["rogue"],
    minLevel: 1,
    steps: ["Deliver the note to Welno Tanboots in the Abbey of Deep Musing"],
    wiki_title: "Guild Summons - Abbey of Deep Musing Rogue",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const tunicId = "item:scuffed-tunic";
  addNode({ id: tunicId, label: "Scuffed Tunic", type: "item", slots: ["Chest"], ac: 2, classes: ["rogue"], source: "Guild Summons - Abbey of Deep Musing Rogue reward (Welno Tanboots, Ak'Anon)" });
  addEdge(questId, tunicId, "rewards");
  addFactionReward(questId, "Deep Muses");
  addFactionReward(questId, "Merchants of AkAnon");
  addFactionReward(questId, "Gem Choppers");
}

// ---------------------------------------------------------------------
// Cure Disease (Qeynos) / Cure Poison (Qeynos) -- same giver
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-qeynos";
  const giverId = "npc:north-qeynos:tonmerk-plorsin";
  addGiver(giverId, "Tonmerk Plorsin", zoneId);

  const diseaseId = "quest:cure-disease-qeynos";
  addNode({
    id: diseaseId,
    label: "Cure Disease (Qeynos)",
    type: "quest",
    description: "Tonmerk Plorsin at the Temple of Life in North Qeynos casts Cure Disease on anyone who brings him bandages and bog juice.",
    minLevel: 1,
    steps: ["Gather bandages and bog juice", "Give them to Tonmerk Plorsin, who casts Cure Disease on you"],
    wiki_title: "Cure Disease (Qeynos)",
  });
  addEdge(giverId, diseaseId, "starts");
  addEdge(diseaseId, zoneId, "starts_in");
  addEdge(diseaseId, zoneId, "located_in");

  const poisonId = "quest:cure-poison-qeynos";
  addNode({
    id: poisonId,
    label: "Cure Poison (Qeynos)",
    type: "quest",
    description: "Tonmerk Plorsin at the Temple of Life in North Qeynos casts Cure Poison on anyone who brings him a snake fang.",
    minLevel: 1,
    steps: ["Obtain a snake fang", "Give it to Tonmerk Plorsin, who casts Cure Poison on you"],
    wiki_title: "Cure Poison (Qeynos)",
  });
  addEdge(giverId, poisonId, "starts");
  addEdge(poisonId, zoneId, "starts_in");
  addEdge(poisonId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Fresh Baked Muffins (Qeynos)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:karn-tassen";
  addGiver(giverId, "Karn Tassen", zoneId);

  const questId = "quest:fresh-baked-muffins-qeynos";
  addNode({
    id: questId,
    label: "Fresh Baked Muffins (Qeynos)",
    type: "quest",
    description: "Karn Tassen in South Qeynos trades a Full Muffin Crate (10 unstacked baked muffins combined in a Muffin Crate) for coin and faction.",
    minLevel: 1,
    steps: ["Combine 10 unstacked baked muffins in a Muffin Crate to make a Full Muffin Crate", "Deliver it to Karn Tassen"],
    wiki_title: "Fresh Baked Muffins (Qeynos)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Merchants of Qeynos");
  addFactionReward(questId, "Coalition of Tradefolk");
  addFactionReward(questId, "Guards of Qeynos");
}

// ---------------------------------------------------------------------
// Newbie Quest: Halfling Druid
// ---------------------------------------------------------------------
{
  const zoneId = "zone:rivervale";
  const giverId = "npc:rivervale:hibbs-rootenpaw";
  addGiver(giverId, "Hibbs Rootenpaw", zoneId);

  const questId = "quest:newbie-quest-halfling-druid";
  addNode({
    id: questId,
    label: "Newbie Quest: Halfling Druid",
    type: "quest",
    description: "A tattered note found in a new Halfling druid's inventory directs them to Hibbs Rootenpaw in Rivervale.",
    classes: ["druid"],
    minLevel: 1,
    steps: ["Deliver the tattered note to Hibbs Rootenpaw in Rivervale"],
    wiki_title: "Newbie Quest: Halfling Druid",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const tunicId = "item:jumjum-sack-tunic";
  addNode({ id: tunicId, label: "Jumjum Sack Tunic", type: "item", slots: ["Chest"], ac: 2, classes: ["druid"], source: "Newbie Quest: Halfling Druid reward (Hibbs Rootenpaw, Rivervale)" });
  addEdge(questId, tunicId, "rewards");
  addFactionReward(questId, "Merchants of Rivervale");
}

// ---------------------------------------------------------------------
// Newbie Quest: Troll Warrior
// ---------------------------------------------------------------------
{
  const zoneId = "zone:grobb";
  const giverId = "npc:grobb:ranjor";
  addGiver(giverId, "Ranjor", zoneId);

  const questId = "quest:newbie-quest-troll-warrior";
  addNode({
    id: questId,
    label: "Newbie Quest: Troll Warrior",
    type: "quest",
    description: "A tattered note found in a new Troll warrior's inventory directs them to Ranjor in Grobb.",
    classes: ["warrior"],
    minLevel: 1,
    steps: ["Deliver the tattered note to Ranjor in Grobb"],
    wiki_title: "Newbie Quest: Troll Warrior",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const tunicId = "item:mud-covered-tunic";
  addNode({ id: tunicId, label: "Mud Covered Tunic", type: "item", slots: ["Chest"], ac: 4, classes: ["warrior"], source: "Newbie Quest: Troll Warrior reward (Ranjor, Grobb)" });
  addEdge(questId, tunicId, "rewards");
  addFactionReward(questId, "Da Bashers");
}

// ---------------------------------------------------------------------
// Kobold Molars (Good)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const warrensId = "zone:the-warrens";
  const giverId = "npc:erudin:tiam-khonsir";
  addGiver(giverId, "Tiam Khonsir", zoneId);

  const questId = "quest:kobold-molars-good";
  addNode({
    id: questId,
    label: "Kobold Molars (Good)",
    type: "quest",
    description: "Tiam Khonsir, behind the Temple of Deepwater Knights in Erudin, trades 1-4 Kobold Molars (from any kobold in The Warrens) for coin, with a chance at Ringmail Armor or a minor weapon.",
    classes: ["paladin"],
    minLevel: 6,
    steps: ["Gather 1-4 Kobold Molars from kobolds in The Warrens", "Turn them in to Tiam Khonsir"],
    wiki_title: "Kobold Molars (Good)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, warrensId, "located_in");
  addFactionReward(questId, "Deepwater Knights");
  addFactionReward(questId, "High Council of Erudin");
}

// ---------------------------------------------------------------------
// Skeleton Killing
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const toxxuliaId = "zone:toxxulia-forest";
  const giverId = "npc:erudin:lumi-stergnon";
  addGiver(giverId, "Lumi Stergnon", zoneId);

  const questId = "quest:skeleton-killing";
  addNode({
    id: questId,
    label: "Skeleton Killing",
    type: "quest",
    description:
      "Lumi Stergnon, in Erudin's Temple of Divine Light, trades a Box of Bones (a Box For Bones filled with Bone Chips from undead in Toxxulia Forest) for a bundle of cleric spells, containers, armor, weapons, and coin.",
    classes: ["cleric"],
    minLevel: 1,
    steps: ["Collect Bone Chips from undead in Toxxulia Forest and combine them in a Box For Bones to make a Box of Bones", "Turn it in to Lumi Stergnon"],
    wiki_title: "Skeleton Killing",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, toxxuliaId, "located_in");
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
}

// ---------------------------------------------------------------------
// Gnoll Bounty
// ---------------------------------------------------------------------
{
  const zoneId = "zone:halas";
  const blackburrowId = "zone:blackburrow";
  const everfrostId = "zone:everfrost-peaks";
  const giverId = "npc:halas:lysbith-mcnaff";
  addGiver(giverId, "Lysbith McNaff", zoneId);

  const questId = "quest:gnoll-bounty";
  addNode({
    id: questId,
    label: "Gnoll Bounty",
    type: "quest",
    description: "Lysbith McNaff, at the Pit of Doom in Halas, trades three Gnoll Fangs (dropped by gnolls in Blackburrow or Everfrost Peaks) for coin, a minor item, and faction.",
    minLevel: 1,
    steps: ["Collect three Gnoll Fangs from gnolls in Blackburrow or Everfrost Peaks", "Turn them in to Lysbith McNaff"],
    wiki_title: "Gnoll Bounty",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, blackburrowId, "located_in");
  addEdge(questId, everfrostId, "located_in");
  addFactionReward(questId, "Wolves of the North");
  addFactionReward(questId, "Shamen of Justice");
  addFactionReward(questId, "Merchants of Halas");
  addFactionReward(questId, "Rogues of the White Rose");
  addFactionReward(questId, "Steel Warriors");
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 042 complete: added 23 more quests from GitHub issue #26's checklist");
