/**
 * Migration 048: 25 more quests off GitHub issue #26's checklist -- Fern
 * Flower Collection, Field Supplies Quest, Find Lucie Elron, Fire Beetle
 * Eyes, Fire Goblin Runner, Fisherman Convert, Fleshy Orbs, Friend of the
 * Kin, Friend of the Tunarean Court, Froglock Tadpole Fleshies, Froglok
 * Skin Mask Quest, Frostbite's Fish, Garath's Weapons to Trade, Gathering
 * Grain, Gearheart (Quest), Gem Inlaid Gauntlets Quest, Geozite Tool
 * Quest, Gharin's Note (good), Gindlin's Poison, Gleed's Bow, Gnasher's
 * Head, Gnoll Fur, Gnoll Paws, Gnoll Scalp Collecting, Goblin
 * Battlemasters. Researched directly against eqlwiki.com (each quest's own
 * page), following decisions/eqlwiki-quest-research-method.md.
 * `located_in` follows the broadened rule from migration 041
 * (decisions/quest-reward-modeling.md). This batch hit the new 25-quest
 * cap and Questlines-deferral rule from the issue's own process
 * guardrails for the first time -- no questline showed up this pass, so
 * nothing was added to the `## Questlines` section.
 *
 * Skipped this pass for missing-zone reasons, same "giver's own zone is
 * the blocker, not a farming stop" bar as migration 045's Dain's Head:
 * Feskr's Supplies, First Test of Kejaar, Fish Dinner, and Gnomish Toy
 * (all four give from Kerra Island, which doesn't exist here -- the
 * fourth Kerra Island quest hit this pass); Froglok Tad Tongues (Swamp of
 * No Hope); Fusibility Research (Western Wastes -- same zone that blocked
 * Essence Lens Quest in migration 047); Gharin's Note (evil) (Qeynos
 * Aqueducts -- its good-aligned counterpart's giver, Gharin himself, is in
 * South Qeynos instead, so that half is modeled here); Giant Helmets
 * (Icewell Keep, same zone that blocked migration 045's Dain's Head);
 * Gloves of Earthcrafting Quest (Plane of Growth).
 *
 * Also deliberately not touched this pass: the ~90-entry "Guild Summons -
 * <guild>" cluster in the G section. Each is its own wiki page (not a
 * shared multi-part page like Armor of Ro), so it's not a Questlines-
 * section case -- it's just a very long run of similarly-shaped quests
 * better worked as its own dedicated batch than folded into a 25-quest
 * mixed batch.
 *
 * Geozite Tool Quest (three warlord-specific turn-ins) and Friend of the
 * Tunarean Court (six crest sub-collections) both branch internally but
 * resolve to one shared final reward -- modeled as a single quest with
 * branching `steps` prose, not moved to Questlines, since (unlike Armor of
 * Ro) there's no independent per-branch reward to justify separate
 * quest/quest_line nodes.
 *
 * Deliberately NOT modeled:
 * - Every vague/randomized or unnamed reward (Fisherman Convert's "a minor
 *   item", Fleshy Orbs' "a fine steel weapon", Goblin Battlemasters'
 *   random Faydark Ringmail piece, Gearheart's "random low-level item",
 *   Garath's Weapons to Trade's redundant "Priceless" weapon tier
 *   alongside the "Primal" tier already modeled) -- consistent with every
 *   migration so far.
 * - Coin rewards -- no coin field on `quest` nodes, consistent with every
 *   migration so far.
 * - Negative faction changes throughout (e.g. Fire Beetle Eyes' King
 *   Naythox Thex, Gleed's Bow's Claws of Veeshan/Coldain) -- `rewards`
 *   only models positive rewards (decisions/quest-reward-modeling.md).
 * - Prerequisite quests still open on the issue's own checklist (Friend of
 *   the Tunarean Court's six crest sub-collections, Goblin Battlemasters'
 *   Goblin Raiders, Fire Goblin Runner's evil-alignment gate) -- left as
 *   prose in `steps`/`description`, same "a scraper needs a human
 *   decision" reasoning as migration 028's Mold of Ro Bracer.
 * - Race requirements (Fisherman Convert's Erudite-only, Geozite Tool
 *   Quest's Iksar-only, Fire Goblin Runner's evil-only) -- no race field on
 *   `quest`, noted in `description` prose only.
 * - era -- unset; none of these quests' own pages state a content era tag.
 * - Froglock Tadpole Fleshies rewards `spell:burst-of-flame` as a real
 *   `rewards` edge (existing node, same spell-reward support migration 035
 *   added for Errand for Tonmerk's Smite).
 * - Gnasher's Head reuses the existing `item:raw-hide-tunic` node
 *   (migration 045's Cindl's Wristband Collection reward choice) instead
 *   of creating a duplicate -- same label, same Chest/AC 8 stat line.
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
// Fern Flower Collection
// ---------------------------------------------------------------------
{
  const zoneId = "zone:west-cabilis";
  const giverId = "npc:west-cabilis:jondin";
  addGiver(giverId, "Jondin", zoneId);

  const questId = "quest:fern-flower-collection";
  addNode({
    id: questId,
    label: "Fern Flower Collection",
    type: "quest",
    description: "Jondin in West Cabilis hands out a Fern Flower Pouch to fill with 4 Fern Flowers.",
    minLevel: 8,
    steps: ["Receive a Fern Flower Pouch from Jondin", "Collect 4 Fern Flowers and combine them into a Full Fern Flower Pouch", "Return the pouch to Jondin"],
    wiki_title: "Fern Flower Collection",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const shieldId = "item:frogskin-shield";
  addNode({
    id: shieldId,
    label: "Frogskin Shield",
    type: "item",
    slots: ["Secondary"],
    ac: 3,
    weight: 3.0,
    size: "Small",
    source: "Fern Flower Collection reward (Jondin, West Cabilis)",
  });
  addEdge(questId, shieldId, "rewards");
  addFactionReward(questId, "Brood of Kotiz");
  addFactionReward(questId, "Legion of Cabilis");
}

// ---------------------------------------------------------------------
// Field Supplies Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const wakeningId = "zone:the-wakening-land";
  const giverId = "npc:kael-drakkal:noble-helssen";
  addGiver(giverId, "Noble Helssen", zoneId);

  const questId = "quest:field-supplies-quest";
  addNode({
    id: questId,
    label: "Field Supplies Quest",
    type: "quest",
    description: "Noble Helssen in Kael Drakkal hands out Field Supplies packages to deliver to any of six mercenary types wandering The Wakening Land or Kael Drakkal, then return for more -- a repeatable coin/faction turn-in.",
    minLevel: 50,
    steps: ["Hail Noble Helssen and receive Field Supplies", "Deliver the package to a wandering mercenary in The Wakening Land or Kael Drakkal", "Return to Noble Helssen for another package"],
    wiki_title: "Field Supplies Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, wakeningId, "located_in");
  addFactionReward(questId, "Kromrif");
  addFactionReward(questId, "Kromzek");
  addFactionReward(questId, "King Tormax");
}

// ---------------------------------------------------------------------
// Find Lucie Elron
// ---------------------------------------------------------------------
{
  const southZoneId = "zone:south-qeynos";
  const northZoneId = "zone:north-qeynos";
  const zamelId = "npc:south-qeynos:zamel";
  const endricId = "npc:south-qeynos:endric";
  const elronId = "npc:north-qeynos:guard-elron";
  addGiver(zamelId, "Zamel", southZoneId);
  addGiver(endricId, "Endric", southZoneId);
  addGiver(elronId, "Guard Elron", northZoneId);

  const questId = "quest:find-lucie-elron";
  addNode({
    id: questId,
    label: "Find Lucie Elron",
    type: "quest",
    description: "Zamel or Endric in South Qeynos, or Guard Elron in North Qeynos, all trade a Small Tattered Dress (dropped by Cuburt in the Qeynos Aqueducts) for a reward -- Guard Elron gives a locket, Zamel/Endric a stud.",
    minLevel: 4,
    steps: ["Obtain a Small Tattered Dress, dropped by Cuburt in the Qeynos Aqueducts", "Return the dress to Zamel, Endric, or Guard Elron"],
    wiki_title: "Find Lucie Elron",
  });
  addEdge(zamelId, questId, "starts");
  addEdge(endricId, questId, "starts");
  addEdge(elronId, questId, "starts");
  addEdge(questId, southZoneId, "starts_in");
  addEdge(questId, southZoneId, "located_in");
  addEdge(questId, northZoneId, "located_in");

  const locketId = "item:golden-locket";
  addNode({
    id: locketId,
    label: "Golden Locket",
    type: "item",
    slots: ["Neck"],
    charges: 5,
    effect: "Courage",
    source: "Find Lucie Elron reward from Guard Elron (North Qeynos)",
  });
  const studId = "item:golden-ear-stud";
  addNode({
    id: studId,
    label: "Golden Ear Stud",
    type: "item",
    slots: ["Ear"],
    stats: { int: 3 },
    effect: "Burning Affliction I (focus)",
    source: "Find Lucie Elron rare reward from Zamel or Endric (South Qeynos)",
  });
  addEdge(questId, locketId, "rewards");
  addEdge(questId, studId, "rewards");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Antonius Bayle");
  addFactionReward(questId, "Merchants of Qeynos");
}

// ---------------------------------------------------------------------
// Fire Beetle Eyes
// ---------------------------------------------------------------------
{
  const zoneId = "zone:neriak-3rd-gate";
  const giverId = "npc:neriak-3rd-gate:noxhil-v-sek";
  addGiver(giverId, "Noxhil V`Sek", zoneId);

  const questId = "quest:fire-beetle-eyes";
  addNode({
    id: questId,
    label: "Fire Beetle Eyes",
    type: "quest",
    description: "Noxhil V`Sek in Neriak Third Gate, requiring Amiable or better faction, hands out an Empty Box to fill with 10 Fire Beetle Eyes.",
    minLevel: 1,
    steps: ["Receive an Empty Box from Noxhil V`Sek", "Combine 10 Fire Beetle Eyes in the box to craft a Box of Beetle Eyes", "Return the box to Noxhil V`Sek"],
    wiki_title: "Fire Beetle Eyes",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "The Dead");
  addFactionReward(questId, "Queen Cristanos Thex");
}

// ---------------------------------------------------------------------
// Fire Goblin Runner
// ---------------------------------------------------------------------
{
  const zoneId = "zone:neriak-commons";
  const lavastormId = "zone:lavastorm-mountains";
  const giverId = "npc:neriak-commons:narex-t-vem";
  addGiver(giverId, "Narex T`Vem", zoneId);

  const questId = "quest:fire-goblin-runner";
  addNode({
    id: questId,
    label: "Fire Goblin Runner",
    type: "quest",
    description: "Narex T`Vem in Neriak Commons, requiring Amiable or better faction, sends evil-aligned players after a Goblin Runner in Lavastorm Mountains.",
    minLevel: 12,
    steps: ["Travel to Lavastorm Mountains and kill a Goblin Runner", "Loot its Goblin Supply Pouch", "Return the pouch to Narex T`Vem"],
    wiki_title: "Fire Goblin Runner",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, lavastormId, "located_in");

  const pouchId = "item:featherweight-pouch";
  addNode({
    id: pouchId,
    label: "Featherweight Pouch",
    type: "item",
    weight: 0.2,
    capacity: 6,
    lore: true,
    noTrade: true,
    source: "Fire Goblin Runner reward (Narex T`Vem, Neriak Commons)",
  });
  addEdge(questId, pouchId, "rewards");
  addFactionReward(questId, "Indigo Brotherhood");
}

// ---------------------------------------------------------------------
// Fisherman Convert
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const southQeynosId = "zone:south-qeynos";
  const catacombsId = "zone:qeynos-catacombs";
  const giverId = "npc:erudin:dleria-mausrel";
  addGiver(giverId, "Dleria Mausrel", zoneId);

  const questId = "quest:fisherman-convert";
  addNode({
    id: questId,
    label: "Fisherman Convert",
    type: "quest",
    description: "Dleria Mausrel in Erudin sends Erudite paladins on a multi-zone chain to convert fishermen, through Marlin Bizmite in South Qeynos and Bait Masterson in Qeynos Catacombs.",
    classes: ["paladin"],
    minLevel: 1,
    steps: [
      "Speak with Dleria Mausrel and agree to convert fishermen",
      "Travel to South Qeynos and locate Marlin Bizmite",
      "Visit Bait Masterson in Qeynos Catacombs",
      "Give Bait Masterson an Old Blue Tunic (obtained by handing A Tattered Note to your Deepwater guildmaster)",
      "Return to Dleria Mausrel and hand in the Snapped Pole",
    ],
    wiki_title: "Fisherman Convert",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, southQeynosId, "located_in");
  addEdge(questId, catacombsId, "located_in");
  addFactionReward(questId, "Deepwater Knights");
  addFactionReward(questId, "High Council of Erudin");
}

// ---------------------------------------------------------------------
// Fleshy Orbs
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-qeynos";
  const qeynosHillsId = "zone:qeynos-hills";
  const westKaranaId = "zone:west-karana";
  const westFreeportId = "zone:west-freeport";
  const giverId = "npc:north-qeynos:priestess-caulria";
  addGiver(giverId, "Priestess Caulria", zoneId);

  const questId = "quest:fleshy-orbs";
  addNode({
    id: questId,
    label: "Fleshy Orbs",
    type: "quest",
    description: "Priestess Caulria in North Qeynos, requiring Amiable or better faction, sends players to deliver a Fleshy Orb to Lorme Tredore at the Academy of Arcane Science in West Freeport.",
    minLevel: 5,
    steps: [
      "Obtain a Fleshy Orb from rabid wolves or bears in Qeynos Hills or West Karana",
      "Return the orb to Priestess Caulria",
      "Deliver it to Lorme Tredore at the Academy of Arcane Science in West Freeport",
    ],
    wiki_title: "Fleshy Orbs",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, qeynosHillsId, "located_in");
  addEdge(questId, westKaranaId, "located_in");
  addEdge(questId, westFreeportId, "located_in");
  addFactionReward(questId, "Priests of Life");
  addFactionReward(questId, "Knights of Thunder");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Antonius Bayle");
}

// ---------------------------------------------------------------------
// Friend of the Kin
// ---------------------------------------------------------------------
{
  const zoneId = "zone:skyshrine";
  const kaelId = "zone:kael-drakkal";
  const giverId = "npc:skyshrine:sentry-kale";
  addGiver(giverId, "Sentry Kale", zoneId);

  const questId = "quest:friend-of-the-kin";
  addNode({
    id: questId,
    label: "Friend of the Kin",
    type: "quest",
    description: "Sentry Kale in Skyshrine sends players to Wenglawks Kkeak in Kael Drakkal with a note and 100 platinum, then back to expose Sentry Rotiart as a Kromzek spy.",
    classes: ["bard", "monk", "paladin", "ranger", "rogue", "shadow knight", "warrior"],
    minLevel: 53,
    steps: [
      "Receive a note from Sentry Kale and 100 platinum",
      "Deliver the note and platinum to Wenglawks Kkeak in Kael Drakkal for a Dispelling Device",
      "Return to Skyshrine and give the device to Sentry Rotiart",
      "Defeat Rotiart when he's revealed as a Kromzek spy",
      "Loot the Spy Report and return it to Sentry Kale",
    ],
    wiki_title: "Friend of the Kin",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, kaelId, "located_in");

  const chokerId = "item:dragon-tooth-choker";
  addNode({
    id: chokerId,
    label: "Dragon Tooth Choker",
    type: "item",
    slots: ["Neck"],
    ac: 8,
    stats: { str: 5 },
    hp: 30,
    resists: { fire: 10, cold: 5, magic: 5, poison: 5 },
    source: "Friend of the Kin reward (Sentry Kale, Skyshrine)",
  });
  addEdge(questId, chokerId, "rewards");
  addFactionReward(questId, "Claws of Veeshan");
  addFactionReward(questId, "Yelinak");
}

// ---------------------------------------------------------------------
// Friend of the Tunarean Court
// ---------------------------------------------------------------------
{
  const zoneId = "zone:the-wakening-land";
  const giverId = "npc:the-wakening-land:shamus-aghllsews";
  addGiver(giverId, "Shamus Aghllsews", zoneId);

  const questId = "quest:friend-of-the-tunarean-court";
  addNode({
    id: questId,
    label: "Friend of the Tunarean Court",
    type: "quest",
    description: "Shamus Aghllsews in The Wakening Land sends Ranger/Druid players to collect Kromrif Laborer picks and six crests from separate sub-quests (Wood Nymphs, Unicorn, Sifaye, Fauns, Drixie, Faerie Dragons -- each still its own open checklist item), combined into one case.",
    classes: ["ranger", "druid"],
    minLevel: 50,
    steps: [
      "Collect four picks used by the Kromrif Laborers",
      "Complete the six crest sub-quests (Wood Nymphs, Unicorn, Sifaye, Fauns, Drixie, Faerie Dragons) and combine all crests in the empty case",
      "Return the completed Case of Tunarean Crests to Shamus Aghllsews",
    ],
    wiki_title: "Friend of the Tunarean Court",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const ringId = "item:tunarean-signet-ring";
  addNode({
    id: ringId,
    label: "Tunarean Signet Ring",
    type: "item",
    slots: ["Finger"],
    ac: 2,
    stats: { cha: 10, wis: 10 },
    hp: 15,
    magic: true,
    noTrade: true,
    source: "Friend of the Tunarean Court reward (Shamus Aghllsews, The Wakening Land)",
  });
  addEdge(questId, ringId, "rewards");
}

// ---------------------------------------------------------------------
// Froglock Tadpole Fleshies
// ---------------------------------------------------------------------
{
  const zoneId = "zone:oggok";
  const giverId = "npc:oggok:zulort";
  addGiver(giverId, "Zulort", zoneId);

  const questId = "quest:froglock-tadpole-fleshies";
  addNode({
    id: questId,
    label: "Froglock Tadpole Fleshies",
    type: "quest",
    description: "Zulort, the Oggok Shaman Master, requiring better than Indifferent faction, trades 4 Froglok Tadpole Flesh for the Burst of Flame spell.",
    classes: ["shaman"],
    minLevel: 1,
    steps: ["Tell Zulort \"me Gonna Help!\"", "Hand him 4 Froglok Tadpole Flesh (not stacked)"],
    wiki_title: "Froglock Tadpole Fleshies",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "spell:burst-of-flame", "rewards");
  addFactionReward(questId, "Shamen of War");
}

// ---------------------------------------------------------------------
// Froglok Skin Mask Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:grobb";
  const innothuleId = "zone:innothule-swamp";
  const giverId = "npc:grobb:treskar";
  addGiver(giverId, "Treskar", zoneId);

  const questId = "quest:froglok-skin-mask-quest";
  addNode({
    id: questId,
    label: "Froglok Skin Mask Quest",
    type: "quest",
    description: "Treskar, in the Shadowknights Guild in Grobb, sends players after the spore guardian in Innothule Swamp for its Huge Mushroom Head.",
    classes: ["warrior", "cleric", "shadow knight", "rogue", "shaman", "wizard", "necromancer", "magician", "enchanter"],
    minLevel: 10,
    steps: ["Speak with Treskar about Hukulk", "Find the spore guardian in Innothule Swamp and defeat it", "Hand in its Huge Mushroom Head"],
    wiki_title: "Froglok Skin Mask Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, innothuleId, "located_in");

  const maskId = "item:froglok-skin-mask";
  addNode({
    id: maskId,
    label: "Froglok Skin Mask",
    type: "item",
    slots: ["Face"],
    ac: 2,
    stats: { dex: 2, int: 2 },
    source: "Froglok Skin Mask Quest reward (Treskar, Grobb)",
  });
  addEdge(questId, maskId, "rewards");
  addFactionReward(questId, "Shadowknights of Night Keep");
}

// ---------------------------------------------------------------------
// Frostbite's Fish
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-qeynos";
  const westKaranaId = "zone:west-karana";
  const giverId = "npc:north-qeynos:enic-ruklin";
  addGiver(giverId, "Enic Ruklin", zoneId);

  const questId = "quest:frostbites-fish";
  addNode({
    id: questId,
    label: "Frostbite's Fish",
    type: "quest",
    description: "Enic Ruklin, at the Temple of Life in North Qeynos, requiring Amiable or better faction, trades a Koalindl Fish corpse (from Frostbite in West Karana, a Koalindl fish directly, or via The Regurgitonic quest) for a reward.",
    minLevel: 3,
    steps: ["Obtain a Koalindl Fish corpse", "Return it to Enic Ruklin"],
    wiki_title: "Frostbite's Fish",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, westKaranaId, "located_in");

  const beadsId = "item:prayer-beads";
  addNode({
    id: beadsId,
    label: "Prayer Beads",
    type: "item",
    slots: ["Neck"],
    effect: "Healing",
    magic: true,
    source: "Frostbite's Fish reward (Enic Ruklin, North Qeynos)",
  });
  const bandId = "item:band-of-rodcet-nife";
  addNode({
    id: bandId,
    label: "Band of Rodcet Nife",
    type: "item",
    slots: ["Finger"],
    stats: { int: 3 },
    mana: 10,
    source: "Frostbite's Fish rare reward (Enic Ruklin, North Qeynos)",
  });
  addEdge(questId, beadsId, "rewards");
  addEdge(questId, bandId, "rewards");
  addFactionReward(questId, "Priests of Life");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Knights of Thunder");
  addFactionReward(questId, "Antonius Bayle");
}

// ---------------------------------------------------------------------
// Garath's Weapons to Trade
// ---------------------------------------------------------------------
{
  const zoneId = "zone:eastern-wastes";
  const giverId = "npc:eastern-wastes:garath-the-trader";
  addGiver(giverId, "Garath the Trader", zoneId);

  const questId = "quest:garaths-weapons-to-trade";
  addNode({
    id: questId,
    label: "Garath's Weapons to Trade",
    type: "quest",
    description: "Garath the Trader in Eastern Wastes trades a Primal Velium Battlehammer (monks) or Primal Velium Warsword (paladins/shadow knights) for a matching class weapon.",
    classes: ["monk", "paladin", "shadow knight"],
    minLevel: 55,
    steps: ["Monks: trade a Primal Velium Battlehammer for Primal Velium Fist Wraps", "Paladins/Shadow Knights: trade a Primal Velium Warsword for a Primal Velium Knight's Sword"],
    wiki_title: "Garath's Weapons to Trade",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const wrapsId = "item:primal-velium-fist-wraps";
  addNode({
    id: wrapsId,
    label: "Primal Velium Fist Wraps",
    type: "item",
    slots: ["Primary"],
    classes: ["monk"],
    damage: 15,
    ac: 10,
    stats: { str: 5, sta: 5, dex: 5, agi: 5, wis: 5, int: 5, cha: 5 },
    hp: 50,
    mana: 50,
    effect: "Avatar",
    source: "Garath's Weapons to Trade reward for monks (Garath the Trader, Eastern Wastes)",
  });
  const swordId = "item:primal-velium-knights-sword";
  addNode({
    id: swordId,
    label: "Primal Velium Knight's Sword",
    type: "item",
    slots: ["Primary"],
    classes: ["paladin", "shadow knight"],
    damage: 20,
    ac: 10,
    stats: { str: 5, sta: 5, dex: 5, agi: 5, wis: 5, int: 5, cha: 5 },
    hp: 50,
    mana: 50,
    effect: "Avatar",
    source: "Garath's Weapons to Trade reward for paladins/shadow knights (Garath the Trader, Eastern Wastes)",
  });
  addEdge(questId, wrapsId, "rewards");
  addEdge(questId, swordId, "rewards");
}

// ---------------------------------------------------------------------
// Gathering Grain
// ---------------------------------------------------------------------
{
  const zoneId = "zone:west-karana";
  const giverId = "npc:west-karana:henina-miller";
  addGiver(giverId, "Henina Miller", zoneId);

  const questId = "quest:gathering-grain";
  addNode({
    id: questId,
    label: "Gathering Grain",
    type: "quest",
    description: "Henina Miller in West Karana, at Dubious faction or better, trades a Sack of Hay (from Cleet Miller or scarecrows) for coin, faction, and experience.",
    minLevel: 1,
    steps: ["Hail Henina Miller", "Obtain a Sack of Hay from Cleet Miller or a scarecrow", "Turn in the Sack of Hay"],
    wiki_title: "Gathering Grain",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Karana Residents");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Priests of Life");
  addFactionReward(questId, "Knights of Thunder");
}

// ---------------------------------------------------------------------
// Gearheart (Quest)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ak-anon";
  const lesserFaydarkId = "zone:lesser-faydark";
  const giverId = "npc:ak-anon:baxok-curhunter";
  addGiver(giverId, "Baxok Curhunter", zoneId);

  const questId = "quest:gearheart-quest";
  addNode({
    id: questId,
    label: "Gearheart (Quest)",
    type: "quest",
    description: "Baxok Curhunter in Ak'Anon sends players to Lesser Faydark to defeat Gearheart, a clockwork gnome, for proof of the kill.",
    minLevel: 25,
    steps: ["Travel to Lesser Faydark and defeat Gearheart", "Loot the Blackbox XIVD from its corpse", "Return the Blackbox XIVD to Baxok Curhunter"],
    wiki_title: "Gearheart (Quest)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, lesserFaydarkId, "located_in");

  const wristbandsId = "item:small-leather-wristbands";
  addNode({
    id: wristbandsId,
    label: "Small Leather Wristbands",
    type: "item",
    slots: ["Wrist"],
    classes: CASTER_EXCLUDED_CLASSES,
    ac: 3,
    weight: 0.8,
    source: "Gearheart (Quest) reward (Baxok Curhunter, Ak'Anon)",
  });
  addEdge(questId, wristbandsId, "rewards");
}

// ---------------------------------------------------------------------
// Gem Inlaid Gauntlets Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-qeynos";
  const southernKaranaId = "zone:southern-karana";
  const eastFreeportId = "zone:east-freeport";
  const butcherblockId = "zone:butcherblock-mountains";
  const giverId = "npc:north-qeynos:umvera-dekash";
  addGiver(giverId, "Umvera Dekash", zoneId);

  const questId = "quest:gem-inlaid-gauntlets-quest";
  addNode({
    id: questId,
    label: "Gem Inlaid Gauntlets Quest",
    type: "quest",
    description: "Umvera Dekash, at Crow's Tavern in North Qeynos, runs a multi-zone delivery chain through Jheron Felkis in East Freeport and Durkis Battlemore in Butcherblock Mountains.",
    minLevel: 30,
    steps: [
      "Collect four Tanned Split Paw Skin scrolls (Volumes 1-4) from Southern Karana",
      "Return the scrolls to Umvera Dekash for a Tesch Val Compilation",
      "Take the compilation to Jheron Felkis in East Freeport for a Pawbook",
      "Return the Pawbook to Umvera Dekash for a note",
      "Take the note to Durkis Battlemore in Butcherblock Mountains for the final reward",
    ],
    wiki_title: "Gem Inlaid Gauntlets Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, southernKaranaId, "located_in");
  addEdge(questId, eastFreeportId, "located_in");
  addEdge(questId, butcherblockId, "located_in");

  const gauntletsId = "item:gem-inlaid-gauntlets";
  addNode({
    id: gauntletsId,
    label: "Gem Inlaid Gauntlets",
    type: "item",
    slots: ["Hands"],
    ac: 8,
    stats: { dex: 3, sta: 3 },
    weight: 1.0,
    size: "Small",
    source: "Gem Inlaid Gauntlets Quest reward (Durkis Battlemore, Butcherblock Mountains)",
  });
  addEdge(questId, gauntletsId, "rewards");
}

// ---------------------------------------------------------------------
// Geozite Tool Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-cabilis";
  const giverId = "npc:east-cabilis:drill-master-vygan";
  addGiver(giverId, "Drill Master Vygan", zoneId);

  const questId = "quest:geozite-tool-quest";
  addNode({
    id: questId,
    label: "Geozite Tool Quest",
    type: "quest",
    description: "Drill Master Vygan in East Cabilis sends Iksar warriors after scorpion pincers on the outer walls of Cabilis, then one of three warlord-specific sub-tasks (Hikyg's shackles, Zyzz's bone shards, or Vyzer's binder pages).",
    classes: ["warrior"],
    minLevel: 8,
    steps: [
      "Fill a satchel with scorpion pincers from large scorpions on the outer walls of Cabilis",
      "Receive a note directing you to Warlord Hikyg, Zyzz, or Vyzer",
      "Complete that warlord's sub-task: fill the Slave Shackle Bag with 8 Busted Froglok Slave Shackles (Hikyg), fill and combine charred bone shards in a box (Zyzz), or combine four pages in a binder (Vyzer)",
      "Return to Drill Master Vygan for the Geozite Tool",
    ],
    wiki_title: "Geozite Tool Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const toolId = "item:geozite-tool";
  addNode({
    id: toolId,
    label: "Geozite Tool",
    type: "item",
    weight: 0.5,
    size: "Small",
    lore: true,
    noTrade: true,
    source: "Geozite Tool Quest reward (Drill Master Vygan, East Cabilis)",
  });
  addEdge(questId, toolId, "rewards");
}

// ---------------------------------------------------------------------
// Gharin's Note (good)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const surefallId = "zone:surefall-glade";
  const giverId = "npc:south-qeynos:gharin";
  addGiver(giverId, "Gharin", zoneId);

  const questId = "quest:gharins-note-good";
  addNode({
    id: questId,
    label: "Gharin's Note (good)",
    type: "quest",
    description: "Gharin in South Qeynos trades 4 Crows Special Brew for a sealed letter, delivered to Te'Anara in Surefall Glade.",
    minLevel: 1,
    steps: ["Give Gharin 4 Crows Special Brew", "Receive A Sealed Letter (Note To Jaggedpine)", "Travel to Surefall Glade and give the letter to Te'Anara"],
    wiki_title: "Gharin's Note (good)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, surefallId, "located_in");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Antonius Bayle");
  addFactionReward(questId, "Merchants of Qeynos");
  addFactionReward(questId, "Jaggedpine Treefolk");
  addFactionReward(questId, "Protectors of Pine");
  addFactionReward(questId, "QRG Protected Animals");
}

// ---------------------------------------------------------------------
// Gindlin's Poison
// ---------------------------------------------------------------------
{
  const zoneId = "zone:west-karana";
  const giverId = "npc:west-karana:gindlin-toxfodder";
  addGiver(giverId, "Gindlin Toxfodder", zoneId);

  const questId = "quest:gindlins-poison";
  addNode({
    id: questId,
    label: "Gindlin's Poison",
    type: "quest",
    description: "Gindlin Toxfodder, in a hut in West Karana, trades 2 Spider Venom Sacs, a Crows Special Brew, and 20 gold for a poison.",
    minLevel: 8,
    steps: ["Collect 2 Spider Venom Sacs from giant spiders", "Purchase a Crows Special Brew from Crow in North Qeynos", "Give both plus 20 gold to Gindlin Toxfodder"],
    wiki_title: "Gindlin's Poison",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const poisonId = "item:spider-venom";
  addNode({
    id: poisonId,
    label: "Spider Venom",
    type: "item",
    charges: 1,
    effect: "Weakening Poison I",
    weight: 0.2,
    size: "Small",
    source: "Gindlin's Poison reward (Gindlin Toxfodder, West Karana)",
  });
  addEdge(questId, poisonId, "rewards");
}

// ---------------------------------------------------------------------
// Gleed's Bow
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const greatDivideId = "zone:great-divide";
  const giverId = "npc:kael-drakkal:gleed-dragonhunter";
  addGiver(giverId, "Gleed Dragonhunter", zoneId);

  const questId = "quest:gleeds-bow";
  addNode({
    id: questId,
    label: "Gleed's Bow",
    type: "quest",
    description: "Gleed Dragonhunter in Kael Drakkal, requiring Indifferent or better faction, sends players after Vluudeen's Tail from the wurm Vluudeen in Great Divide.",
    minLevel: 50,
    steps: ["Hail Gleed Dragonhunter and agree to hunt", "Kill Vluudeen in Great Divide and loot Vluudeen's Tail", "Return the tail to Gleed Dragonhunter"],
    wiki_title: "Gleed's Bow",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, greatDivideId, "located_in");

  const bowId = "item:bow-of-the-huntsman";
  addNode({
    id: bowId,
    label: "Bow of the Huntsman",
    type: "item",
    slots: ["Range"],
    classes: ["warrior", "ranger"],
    skill: "Archery",
    damage: 20,
    delay: 30,
    effect: "Spirit Strike",
    weight: 2.0,
    magic: true,
    lore: true,
    noTrade: true,
    source: "Gleed's Bow reward (Gleed Dragonhunter, Kael Drakkal)",
  });
  addEdge(questId, bowId, "rewards");
  addFactionReward(questId, "Kromrif");
  addFactionReward(questId, "Kromzek");
}

// ---------------------------------------------------------------------
// Gnasher's Head
// ---------------------------------------------------------------------
{
  const zoneId = "zone:surefall-glade";
  const qeynosHillsId = "zone:qeynos-hills";
  const southQeynosId = "zone:south-qeynos";
  const larskId = "npc:surefall-glade:larsk-juton";
  const tillinId = "npc:south-qeynos:captain-tillin";
  addGiver(larskId, "Larsk Juton", zoneId);
  addGiver(tillinId, "Captain Tillin", southQeynosId);

  const questId = "quest:gnashers-head";
  addNode({
    id: questId,
    label: "Gnasher's Head",
    type: "quest",
    description: "Larsk Juton in Surefall Glade sends players after Gnasher Furgutt in Qeynos Hills; an optional note drop leads to a second reward from Captain Tillin at the South Qeynos Arena.",
    minLevel: 10,
    steps: [
      "Kill Gnasher Furgutt in Qeynos Hills and loot his Gnoll Head",
      "Optionally loot A Tattered Note if it drops",
      "Turn in the Gnoll Head to Larsk Juton for a Raw-hide Tunic",
      "If the note dropped, turn it in to Captain Tillin at the South Qeynos Arena for a Medal of Merit",
    ],
    wiki_title: "Gnasher's Head",
  });
  addEdge(larskId, questId, "starts");
  addEdge(tillinId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, qeynosHillsId, "located_in");
  addEdge(questId, southQeynosId, "located_in");

  addNode({ id: "item:raw-hide-tunic", label: "Raw-hide Tunic", type: "item", slots: ["Chest"], ac: 8, source: "Gnasher's Head reward (Larsk Juton, Surefall Glade)" });
  addEdge(questId, "item:raw-hide-tunic", "rewards");

  const medalId = "item:medal-of-merit";
  addNode({
    id: medalId,
    label: "Medal of Merit",
    type: "item",
    slots: ["Neck"],
    stats: { cha: 5 },
    weight: 0.1,
    source: "Gnasher's Head reward (Captain Tillin, South Qeynos Arena)",
  });
  addEdge(questId, medalId, "rewards");
}

// ---------------------------------------------------------------------
// Gnoll Fur
// ---------------------------------------------------------------------
{
  const zoneId = "zone:halas";
  const everfrostId = "zone:everfrost-peaks";
  const blackburrowId = "zone:blackburrow";
  const giverId = "npc:halas:ysanna-macgibbon";
  addGiver(giverId, "Ysanna MacGibbon", zoneId);

  const questId = "quest:gnoll-fur";
  addNode({
    id: questId,
    label: "Gnoll Fur",
    type: "quest",
    description: "Ysanna MacGibbon in Halas, via Cappi McTarnigal at the Halas bank, requires Indifferent or better faction with White Rose and a Tailoring-crafted bundle of 64 Patches of Gnoll Fur from Everfrost Peaks or Blackburrow gnolls.",
    classes: ["rogue", "shaman", "warrior"],
    minLevel: 1,
    steps: [
      "Speak with Cappi McTarnigal on the second floor of the Halas bank",
      "Collect 64 Patches of Gnoll Fur from gnolls in Everfrost Peaks or Blackburrow",
      "Use Tailoring to combine 4 patches into a Gnoll Fur Patch, 4 patches into a Quarter, then 4 quarters into a Patched Gnoll Fur Bundle",
      "Turn in the bundle to Ysanna MacGibbon",
    ],
    wiki_title: "Gnoll Fur",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, everfrostId, "located_in");
  addEdge(questId, blackburrowId, "located_in");

  const fangId = "item:fang-of-the-wolf";
  addNode({
    id: fangId,
    label: "Fang of the Wolf",
    type: "item",
    slots: ["Ear", "Primary", "Secondary"],
    damage: 5,
    magic: true,
    source: "Gnoll Fur reward (Ysanna MacGibbon, Halas)",
  });
  addEdge(questId, fangId, "rewards");
  addFactionReward(questId, "Rogues of the White Rose");
}

// ---------------------------------------------------------------------
// Gnoll Paws
// ---------------------------------------------------------------------
{
  const zoneId = "zone:surefall-glade";
  const giverId = "npc:surefall-glade:corun-finisc";
  addGiver(giverId, "Corun Finisc", zoneId);

  const questId = "quest:gnoll-paws";
  addNode({
    id: questId,
    label: "Gnoll Paws",
    type: "quest",
    description: "Corun Finisc in Surefall Glade trades the Gnoll Paw of the skulking gnoll in the Surefall Glade caves for coin, faction, and experience. Bren Treeclimber competes for the same kill.",
    minLevel: 10,
    steps: ["Slay the skulking gnoll in the Surefall Glade caves before Bren Treeclimber does", "Return its Gnoll Paw to Corun Finisc"],
    wiki_title: "Gnoll Paws",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Jaggedpine Treefolk");
  addFactionReward(questId, "Protectors of Pine");
  addFactionReward(questId, "QRG Protected Animals");
  addFactionReward(questId, "Guards of Qeynos");
}

// ---------------------------------------------------------------------
// Gnoll Scalp Collecting
// ---------------------------------------------------------------------
{
  const zoneId = "zone:highpass-hold";
  const giverId = "npc:highpass-hold:captain-orben";
  addGiver(giverId, "Captain Orben", zoneId);

  const questId = "quest:gnoll-scalp-collecting";
  addNode({
    id: questId,
    label: "Gnoll Scalp Collecting",
    type: "quest",
    description: "Captain Orben, near the northern guard lookout in Highpass Hold, requiring Dubious or better faction, buys up to four Gnoll Scalps at a time.",
    minLevel: 11,
    steps: ["Collect up to 4 Gnoll Scalps", "Turn them in to Captain Orben"],
    wiki_title: "Gnoll Scalp Collecting",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Corrupt Qeynos Guards");
  addFactionReward(questId, "Freeport Militia");
  addFactionReward(questId, "Highpass Guards");
  addFactionReward(questId, "Merchants of Highpass");
  addFactionReward(questId, "Carson McCabe");
}

// ---------------------------------------------------------------------
// Goblin Battlemasters
// ---------------------------------------------------------------------
{
  const zoneId = "zone:firiona-vie";
  const giverId = "npc:firiona-vie:captain-keatar";
  addGiver(giverId, "Captain Keatar", zoneId);

  const questId = "quest:goblin-battlemasters";
  addNode({
    id: questId,
    label: "Goblin Battlemasters",
    type: "quest",
    description: "Captain Keatar, at the Ranger guild building in Firiona Vie, requires completing the Goblin Raiders quest first, then trades 4 Goblin Bracers from goblin battlemasters for a random piece of Faydark Ringmail Armor.",
    classes: ["warrior", "cleric", "paladin", "ranger", "shadow knight", "bard", "rogue", "shaman"],
    minLevel: 20,
    steps: ["Complete the Goblin Raiders quest first", "Hunt goblin battlemasters for Goblin Bracers", "Bring 4 Goblin Bracers to Captain Keatar"],
    wiki_title: "Goblin Battlemasters",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Inhabitants of Firiona Vie");
  addFactionReward(questId, "Emerald Warriors");
  addFactionReward(questId, "Storm Guard");
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 048 complete: added 25 more quests from GitHub issue #26's checklist");
