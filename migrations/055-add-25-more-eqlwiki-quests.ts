/**
 * Migration 055: 25 more quests off GitHub issue #26's checklist -- the
 * rest of L (Lupine Claw Gauntlets Quest onward) and most of M (through
 * Mining Caps). Researched directly against eqlwiki.com, following
 * decisions/eqlwiki-quest-research-method.md.
 *
 * Skipped this pass (left unchecked on the issue, not modeled):
 * - Long Iron Rod Quest -- its own page states "This is an unsolved or
 *   broken quest" with no confirmed giver, dialogue, or faction effects.
 * - Lord Grimlot's Love -- marked "unsolved or broken," and the wiki
 *   explicitly says the quest "no longer results in" its old reward and
 *   the author isn't sure what, if anything, it gives now.
 *
 * Deferred to the Questlines section, not modeled as flat quests (doesn't
 * count against this batch's 25-standalone cap):
 * - Magician Epic Quest -- a 10-part progression (Words of Magi'Kot,
 *   Power of the Elements, Words of Mastery, Power of the Orb, four
 *   elemental sub-quests, final Orb of Mastery turn-in).
 * - Magician Kael Armor Quests, Magician Skyshrine Armor Quests, Magician
 *   Thurgadin Armor Quests -- each a 7-piece armor set (Summoner's /
 *   Prestidigitator's / Arch Mage's), one sub-quest per piece, single
 *   giver (Mjeldor Felstorm / Ocoenydd Fe'Dhar / Kyla Frostbeard).
 * - Magician Plane of Sky Tests -- two alternate quest givers (Frederic
 *   Calermin, Roanis Elindar), each gating a separate multi-test series
 *   (Clarification/Empowerment/Gesticulation/Shielding vs.
 *   Summoning/Interpretation/Displacement).
 *
 * Magician Spells (Evil Version) is a duplicate wiki page of Magician
 * Spells (Evil) -- both describe the identical giver (Slicia J`Singe),
 * zone (The Overthere), minimum level (51+), and scroll-trade mechanic.
 * Checked off on the issue alongside "Magician Spells (Evil)" rather than
 * modeled as a second quest node.
 *
 * Two new zones added (giver's zone missing from the graph, per the
 * issue's zone-creation guardrail), both confirmed real via their own
 * eqlwiki.com page and adjacency to an existing neighbor, and both
 * confirmed `{{Kunark Era}}` via raw wikitext (decisions/quest-era-flagging.md):
 * - Timorous Deep (Medallion of the Jarsath Quest's giver, Xiblin
 *   Fizzlebik) -- connects to Firiona Vie (also Butcherblock Mountains,
 *   Oasis of Marr, The Overthere, per the wiki, but only one connects_to
 *   edge is needed).
 * - Burning Woods (Medallion of the Obulus Quest's giver, Slixin Klex) --
 *   connects to Chardok (also Frontier Mountains, Dreadlands, Skyfire
 *   Mountains, per the wiki).
 * Neither zone's own page states a race/class/deity faction table, so
 * both reuse the "uninhabited wilderness" WILDERNESS_FACTION template
 * from migration 052 (Kerra Island) rather than fabricating one.
 *
 * Farming-only zones that aren't a quest's giver zone and don't already
 * exist in this graph, left as prose only (no zone node created, no
 * `located_in` edge), same treatment as migration 054's Warsliks Woods:
 * - Karnor's Castle, Kaesora (Medallion of the Kylong Quest)
 * - Warsliks Woods, Dreadlands, Trakanon's Teeth (Medallion of the Obulus
 *   Quest)
 * - Dragon Necropolis (Mask of War Quest)
 * - Erud's Crossing (Mammoth Tusks Quest)
 * - Butcherblock Mountains, as an *optional intel stop* rather than a
 *   required turn-in location (Miners Pick)
 *
 * Deliberately NOT modeled (consistent with every migration so far):
 * - Every vague/random reward, including "choice of one from a list" /
 *   random-selection mechanics: Lynuga's Gem Collection's 3-item random
 *   draw, Magic Elixir for the Warriors' 7-item random draw, both
 *   Magician Spells quests' random scroll draw, Marauder Armor's random
 *   Leech Husk piece, Merona's Brother's Band of Tunare/Ring of
 *   Pine/supplies choice, and Mining Caps' NPC-dependent random rewards.
 * - Coin rewards throughout -- no coin field on `quest` nodes.
 * - Negative faction changes throughout -- `rewards` only models positive
 *   rewards (decisions/quest-reward-modeling.md).
 * - Marda's Secret Mission's spell reward -- the wiki's own walkthrough is
 *   flagged "MISSING INFO! Please expand the content" and only says "You
 *   receive a low level spell" at multiple points without confirming
 *   which of the four listed spells (or how many) are actually given;
 *   left as prose rather than guessing an edge.
 * - Message Intercept's faction reward -- the wiki states faction changes
 *   "vary based on recipient choice" without naming which factions move
 *   which way; left as prose.
 * - Race restrictions stated only in an item's infobox `Race:` line
 *   (Miner's Cap and Mining Pick's Dwarf-only gate): noted in
 *   `description` only -- `quest`/`item` schema has no race field.
 * - Marda's Secret Mission's and Message Intercept's prerequisite quest
 *   ("The Emissary") -- not yet modeled (unchecked, alphabetically later
 *   on the issue's own checklist); noted in `description` only, no
 *   dependency edge type exists yet (same treatment as migration 053's
 *   Jillin's Stew / Reebo's Carrots).
 * - Mammoth Tusks Quest's prerequisite (Fire Beetle Eyes, already a real
 *   quest node in this graph) -- still no dependency edge type, so this
 *   stays prose too, same as above.
 *
 * Miners Pick's own page lists "Diggins" as the infobox quest giver but
 * has the player actually transact with "Mater" (found separately outside
 * the Kaladim bank) for both the turn-in and the reward -- same
 * referral-NPC-vs-actual-giver split as migration 053's Journal Strongbox
 * and migration 054's Kobold Shaman Artifacts; only Mater gets the
 * `starts` edge.
 *
 * Messages For Neriak reuses Mammoth Tusks Quest's giver (Noxhil V`Sek,
 * Neriak 3rd Gate) and its Torch reward reuses the existing `item:torch`
 * node (already in the graph from Catfish Tail) rather than duplicating
 * it.
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
// New zones: Timorous Deep, Burning Woods
// ---------------------------------------------------------------------
const WILDERNESS_FACTION = {
  race: {
    barbarian: "neutral",
    "dark elf": "neutral",
    dwarf: "neutral",
    erudite: "neutral",
    gnome: "neutral",
    "half elf": "neutral",
    halfling: "neutral",
    "high elf": "neutral",
    human: "neutral",
    iksar: "neutral",
    ogre: "neutral",
    troll: "neutral",
    "wood elf": "neutral",
  },
  class: {
    bard: "safe",
    beastlord: "safe",
    cleric: "safe",
    druid: "safe",
    enchanter: "safe",
    magician: "safe",
    monk: "safe",
    necromancer: "safe",
    paladin: "safe",
    ranger: "safe",
    rogue: "safe",
    "shadow knight": "safe",
    shaman: "safe",
    warrior: "safe",
    wizard: "safe",
  },
  deity: {
    agnostic: "neutral",
    bertoxxulous: "neutral",
    "brell serilis": "neutral",
    bristlebane: "neutral",
    "cazic-thule": "neutral",
    "erollisi marr": "neutral",
    innoruuk: "neutral",
    karana: "neutral",
    "mithaniel marr": "neutral",
    prexus: "neutral",
    quellious: "neutral",
    "rallos zek": "neutral",
    "rodcet nife": "neutral",
    "solusek ro": "neutral",
    "the tribunal": "neutral",
    tunare: "neutral",
    veeshan: "neutral",
  },
};

const timorousDeepId = "zone:timorous-deep";
addNode({
  id: timorousDeepId,
  label: "Timorous Deep",
  type: "zone",
  faction: structuredClone(WILDERNESS_FACTION),
  lore: "The Timorous Deep is the name of the ocean that lies between Kunark and the other continents of Norrath. The Deep is dotted with islands that stretch across it, and these islands contain a mixture of the modern powers on Norrath, those that have fallen out of their societies, natural predators, and ancient civilizations.",
  era: "Kunark",
  wiki_title: "Timorous Deep",
});
addEdge(timorousDeepId, "zone:firiona-vie", "connects_to");
addEdge("zone:firiona-vie", timorousDeepId, "connects_to");

const burningWoodsId = "zone:burning-woods";
addNode({
  id: burningWoodsId,
  label: "Burning Woods",
  type: "zone",
  faction: structuredClone(WILDERNESS_FACTION),
  lore: "The Burning Wood (normally called Burning Woods by players, or very rarely The Burned Woods) was once an ancient, beautiful forest. Now, however, its surface has been scarred by the fiery meteors that have stricken this area in the recent centuries, leaving its surface marred and aflame.",
  era: "Kunark",
  wiki_title: "Burning Woods",
});
addEdge(burningWoodsId, "zone:chardok", "connects_to");
addEdge("zone:chardok", burningWoodsId, "connects_to");

// ---------------------------------------------------------------------
// Lupine Claw Gauntlets Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:everfrost-peaks";
  const giverId = "npc:everfrost-peaks:karg-icebear";
  addGiver(giverId, "Karg IceBear", zoneId);

  const questId = "quest:lupine-claw-gauntlets-quest";
  addNode({
    id: questId,
    label: "Lupine Claw Gauntlets Quest",
    type: "quest",
    description: "Karg IceBear in Everfrost Peaks trades Werewolf Claws -- from a werewolf -- plus 75 platinum for the Lupine Claw Gauntlets.",
    minLevel: 25,
    steps: [
      "Kill a werewolf in Everfrost Peaks for Werewolf Claws",
      "Give the claws and 75 platinum to Karg IceBear",
    ],
    wiki_title: "Lupine Claw Gauntlets Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const gauntletsId = "item:lupine-claw-gauntlets";
  addNode({
    id: gauntletsId,
    label: "Lupine Claw Gauntlets",
    type: "item",
    slots: ["Hands"],
    magic: true,
    ac: 4,
    stats: { dex: 3, agi: 3 },
    effect: "Improved Damage I (focus)",
    source: "Lupine Claw Gauntlets Quest reward (Karg IceBear, Everfrost Peaks)",
  });
  addEdge(questId, gauntletsId, "rewards");
}

// ---------------------------------------------------------------------
// Lydl Mastat
// ---------------------------------------------------------------------
{
  const zoneId = "zone:west-freeport";
  const eastFreeportId = "zone:east-freeport";
  const giverId = "npc:west-freeport:hemia-skemner";
  addGiver(giverId, "Hemia Skemner", zoneId);

  const questId = "quest:lydl-mastat";
  addNode({
    id: questId,
    label: "Lydl Mastat",
    type: "quest",
    description: "Hemia Skemner, on the top floor of the Academy of Arcane Science in West Freeport, requiring Amiable or better faction, trades a Locked Book -- looted from Lydl Mastat (Lydl the Great), a level 4 NPC invulnerable to non-magic weapons found near the gates of East Freeport -- for coin, experience, and faction.",
    minLevel: 5,
    steps: [
      "Kill Lydl Mastat near the gates of East Freeport (requires magic damage) for a Locked Book",
      "Turn it in to Hemia Skemner in West Freeport",
    ],
    wiki_title: "Lydl Mastat",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, eastFreeportId, "located_in");
  addFactionReward(questId, "Arcane Scientists");
  addFactionReward(questId, "Knights of Truth");
}

// ---------------------------------------------------------------------
// Lynuga's Gem Collection
// ---------------------------------------------------------------------
{
  const zoneId = "zone:innothule-swamp";
  const giverId = "npc:innothule-swamp:lynuga";
  addGiver(giverId, "Lynuga", zoneId);

  const questId = "quest:lynugas-gem-collection";
  addNode({
    id: questId,
    label: "Lynuga's Gem Collection",
    type: "quest",
    description: "Lynuga, near the entrance to Guk in Innothule Swamp, trades a Ruby -- purchasable from jewelry vendors for about 131 platinum -- for a random one of the Midnight Mallet (2H Blunt, CLR/SHM/BST/BER), the Brutechopper (2H Slashing, WAR/PAL/SHD/ROG), or Ivandyr's Hoop (ear, AC +6, WIS +6, INT +6, HP +6, Spirit Tap effect). All lore items -- don't turn in more than one Ruby at a time, or the duplicate reward is lost.",
    minLevel: 1,
    steps: [
      "Buy a Ruby from a jewelry vendor",
      "Turn it in to Lynuga near the entrance to Guk in Innothule Swamp",
    ],
    wiki_title: "Lynuga's Gem Collection",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Madame Serena Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:madame-serena";
  addGiver(giverId, "Madame Serena", zoneId);

  const questId = "quest:madame-serena-quest";
  addNode({
    id: questId,
    label: "Madame Serena Quest",
    type: "quest",
    description: "Madame Serena, by the docks in South Qeynos, responds to \"I follow [deity name]\" with a riddle-like clue for whichever of the 16 gods is named -- background/lore only, no confirmed tangible reward.",
    minLevel: 1,
    steps: ["Say \"I follow [deity name]\" to Madame Serena in South Qeynos"],
    wiki_title: "Madame Serena Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Magic Elixir for the Warriors
// ---------------------------------------------------------------------
{
  const zoneId = "zone:halas";
  const everfrostId = "zone:everfrost-peaks";
  const giverId = "npc:halas:dargon-mcpherson";
  addGiver(giverId, "Dargon McPherson", zoneId);

  const questId = "quest:magic-elixir-for-the-warriors";
  addNode({
    id: questId,
    label: "Magic Elixir for the Warriors",
    type: "quest",
    description: "Dargon McPherson, in northeast Halas, requiring Apprehensive or better faction, sends players to deliver a Full Bottle of Elixir to each of four warriors in Everfrost Peaks (Talin O'Donal, Bryndin McMill, Arnis McLish, Megan O'Reilly), then return the Empty Bottle of Elixir to him for coin, experience, and a random one of several minor items (Copper Band, Lapis Lazuli, Tattered Cloth Sandal, Turquoise, Large Patchwork Pants, Leather Boots, or a Rusty Axe).",
    minLevel: 1,
    steps: [
      "Receive a Full Bottle of Elixir from Dargon McPherson in Halas",
      "Deliver it to Talin O'Donal, Bryndin McMill, Arnis McLish, and Megan O'Reilly in Everfrost Peaks",
      "Return the Empty Bottle of Elixir to Dargon McPherson",
    ],
    wiki_title: "Magic Elixir for the Warriors",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, everfrostId, "located_in");
}

// ---------------------------------------------------------------------
// Magician Spells (Good)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:firiona-vie";
  const giverId = "npc:firiona-vie:hiptal-frizzleboth";
  addGiver(giverId, "Hiptal Frizzleboth", zoneId);

  const questId = "quest:magician-spells-good";
  addNode({
    id: questId,
    label: "Magician Spells (Good)",
    type: "quest",
    description: "Hiptal Frizzleboth in Firiona Vie trades any one of four spell scrolls (Bristlebane's Bundle, Gift of Xev, Quiver of Marr, Scars of Sigil) for a random one of four rarer spells (Boon of Immolation, Scintillation, Vocarate: Air, Vocarate: Fire). Magician only.",
    classes: ["magician"],
    minLevel: 51,
    steps: ["Bring one of the four common scrolls to Hiptal Frizzleboth in Firiona Vie"],
    wiki_title: "Magician Spells (Good)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Magician Spells (Evil)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:the-overthere";
  const giverId = "npc:the-overthere:slicia-jsinge";
  addGiver(giverId, "Slicia J`Singe", zoneId);

  const questId = "quest:magician-spells-evil";
  addNode({
    id: questId,
    label: "Magician Spells (Evil)",
    type: "quest",
    description: "Slicia J`Singe, at the caster circle in The Overthere, trades any one of four spell scrolls (Bristlebane's Bundle, Gift of Xev, Quiver of Marr, Scars of Sigil) for a random one of four rarer spells (Boon of Immolation, Scintillation, Vocarate: Air, Vocarate: Fire). Magician only. Also listed on the wiki under the duplicate title \"Magician Spells (Evil Version)\".",
    classes: ["magician"],
    minLevel: 51,
    steps: ["Bring one of the four common scrolls to Slicia J`Singe in The Overthere"],
    wiki_title: "Magician Spells (Evil)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Majik Power
// ---------------------------------------------------------------------
{
  const zoneId = "zone:grobb";
  const innothuleId = "zone:innothule-swamp";
  const giverId = "npc:grobb:kaglari";
  addGiver(giverId, "Kaglari", zoneId);

  const questId = "quest:majik-power";
  addNode({
    id: questId,
    label: "Majik Power",
    type: "quest",
    description: "Kaglari in Grobb, requiring Amiable or better faction, trades two Froglok Tadpole Flesh (from a froglok tad) and two Bone Chips (from a decaying skeleton), both in Innothule Swamp, for the spell Burst of Flame, coin, and experience. Ogres normally cannot complete it (or the follow-on Orc Belt quest); Dark Elves usually can.",
    minLevel: 1,
    steps: [
      "Kill a froglok tad in Innothule Swamp for 2 Froglok Tadpole Flesh",
      "Kill a decaying skeleton in Innothule Swamp for 2 Bone Chips",
      "Turn both in to Kaglari in Grobb",
    ],
    wiki_title: "Majik Power",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, innothuleId, "located_in");
  addEdge(questId, "spell:burst-of-flame", "rewards");
  addFactionReward(questId, "Dark Ones");
  addFactionReward(questId, "Shadowknights of Night Keep");
}

// ---------------------------------------------------------------------
// Mammoth Calf Hides
// ---------------------------------------------------------------------
{
  const zoneId = "zone:halas";
  const everfrostId = "zone:everfrost-peaks";
  const giverId = "npc:halas:cappi-mctarnigal";
  addGiver(giverId, "Cappi McTarnigal", zoneId);

  const questId = "quest:mammoth-calf-hides";
  addNode({
    id: questId,
    label: "Mammoth Calf Hides",
    type: "quest",
    description: "Cappi McTarnigal in Halas trades 4 Mammoth Calf Hides -- from a wooly mammoth calf in Everfrost Peaks -- for a full 12-piece set of Black Wolf armor, coin, and experience. Rogue only, requires White Rose faction membership.",
    classes: ["rogue"],
    minLevel: 10,
    steps: [
      "Kill wooly mammoth calves in Everfrost Peaks for 4 Mammoth Calf Hides",
      "Turn them in to Cappi McTarnigal in Halas",
    ],
    wiki_title: "Mammoth Calf Hides",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, everfrostId, "located_in");

  const pieces: Array<{ id: string; label: string; slot: string; ac: number; stats?: Record<string, number> }> = [
    { id: "item:black-wolf-armplates", label: "Black Wolf Armplates", slot: "Arms", ac: 6 },
    { id: "item:black-wolf-boots", label: "Black Wolf Boots", slot: "Feet", ac: 5 },
    { id: "item:black-wolf-bracers", label: "Black Wolf Bracers", slot: "Wrist", ac: 5 },
    { id: "item:black-wolf-cape", label: "Black Wolf Cape", slot: "Back", ac: 6 },
    { id: "item:black-wolf-collar", label: "Black Wolf Collar", slot: "Neck", ac: 5 },
    { id: "item:black-wolf-crown", label: "Black Wolf Crown", slot: "Head", ac: 5 },
    { id: "item:black-wolf-gloves", label: "Black Wolf Gloves", slot: "Hands", ac: 6 },
    { id: "item:black-wolf-legplates", label: "Black Wolf Legplates", slot: "Legs", ac: 7 },
    { id: "item:black-wolf-mail", label: "Black Wolf Mail", slot: "Chest", ac: 12 },
    { id: "item:black-wolf-mask", label: "Black Wolf Mask", slot: "Face", ac: 3, stats: { dex: 7, cha: -9 } },
    { id: "item:black-wolf-pauldrons", label: "Black Wolf Pauldrons", slot: "Shoulders", ac: 5 },
    { id: "item:black-wolf-waistband", label: "Black Wolf Waistband", slot: "Waist", ac: 5 },
  ];
  for (const piece of pieces) {
    addNode({
      id: piece.id,
      label: piece.label,
      type: "item",
      slots: [piece.slot],
      classes: ["rogue"],
      ac: piece.ac,
      ...(piece.stats ? { stats: piece.stats } : {}),
      source: "Mammoth Calf Hides reward (Cappi McTarnigal, Halas)",
    });
    addEdge(questId, piece.id, "rewards");
  }
  addFactionReward(questId, "Rogues of the White Rose");
}

// ---------------------------------------------------------------------
// Mammoth Tusks Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:neriak-3rd-gate";
  const everfrostId = "zone:everfrost-peaks";
  const giverId = "npc:neriak-3rd-gate:noxhil-vsek";
  addGiver(giverId, "Noxhil V`Sek", zoneId);

  const questId = "quest:mammoth-tusks-quest";
  addNode({
    id: questId,
    label: "Mammoth Tusks Quest",
    type: "quest",
    description: "Noxhil V`Sek in Neriak 3rd Gate, after completing the Fire Beetle Eyes quest, gives an Empty Chest to fill with Kerra Isle Beetle eyes; that Beetle Eye Chest plus a Mammoth Tusk (from a wooly mammoth in Everfrost Peaks) trades for the spell Engulfing Darkness. Necromancer or Shadow Knight only.",
    classes: ["necromancer", "shadow knight"],
    minLevel: 20,
    steps: [
      "Complete the Fire Beetle Eyes quest and receive an Empty Chest from Noxhil V`Sek",
      "Fill the chest with Kerra Isle Beetle eyes",
      "Kill a wooly mammoth in Everfrost Peaks for a Mammoth Tusk",
      "Turn both in to Noxhil V`Sek in Neriak 3rd Gate",
    ],
    wiki_title: "Mammoth Tusks Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, everfrostId, "located_in");
  addEdge(questId, "spell:engulfing-darkness", "rewards");
  addFactionReward(questId, "The Dead");
  addFactionReward(questId, "Queen Cristanos Thex");
}

// ---------------------------------------------------------------------
// Marauder Armor
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-cabilis";
  const fieldOfBoneId = "zone:field-of-bone";
  const giverId = "npc:east-cabilis:drill-master-dal";
  addGiver(giverId, "Drill Master Dal", zoneId);

  const questId = "quest:marauder-armor";
  addNode({
    id: questId,
    label: "Marauder Armor",
    type: "quest",
    description: "Drill Master Dal in East Cabilis trades 4 Marauder Snout Ring 'MM' -- proof of slaying Marrtail's Marauders, iksar marauders found in the zones surrounding Cabilis including Field of Bone -- for a random piece of Leech Husk armor, coin, and experience.",
    minLevel: 14,
    steps: [
      "Kill 4 iksar marauders (Marrtail's Marauders) around Cabilis, including Field of Bone, for a Marauder Snout Ring 'MM' each",
      "Turn them in to Drill Master Dal in East Cabilis",
    ],
    wiki_title: "Marauder Armor",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, fieldOfBoneId, "located_in");
  addFactionReward(questId, "Legion of Cabilis");
  addFactionReward(questId, "Cabilis Residents");
  addFactionReward(questId, "Scaled Mystics");
  addFactionReward(questId, "Crusaders Of Greenmist");
  addFactionReward(questId, "Swift Tails");
}

// ---------------------------------------------------------------------
// Marda's Secret Mission
// ---------------------------------------------------------------------
{
  const zoneId = "zone:oggok";
  const grobbId = "zone:grobb";
  const innothuleId = "zone:innothule-swamp";
  const giverId = "npc:oggok:marda";
  addGiver(giverId, "Marda", zoneId);

  const questId = "quest:mardas-secret-mission";
  addNode({
    id: questId,
    label: "Marda's Secret Mission",
    type: "quest",
    description: "Marda in Oggok, after completing The Emissary, sends players to a prisoner in Grobb; an Intestine Necklace (from Basher guards in Grobb or Innothule Swamp) proves legitimacy, earning an Empty Vial to trade Forager Grikk for Ochre Liquid, which the prisoner exchanges for a note. Killing Zimbittle in Innothule Swamp and delivering her pouch to Marda grants a low-level spell (one of Drowsy, Endure Disease, Spirit of Bear, or Summon Drink per the wiki, exact selection unclear), coin, and experience.",
    minLevel: 9,
    steps: [
      "Complete The Emissary",
      "Visit the prisoner in Grobb and show an Intestine Necklace as proof",
      "Trade the Empty Vial to Forager Grikk for Ochre Liquid",
      "Return to the prisoner for a note",
      "Kill Zimbittle in Innothule Swamp for Zimbittle's Pouch",
      "Deliver the pouch to Marda in Oggok",
    ],
    wiki_title: "Marda's Secret Mission",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, grobbId, "located_in");
  addEdge(questId, innothuleId, "located_in");
  addFactionReward(questId, "Oggok Citizens");
  addFactionReward(questId, "Shamen of War");
}

// ---------------------------------------------------------------------
// Marr Minnows for Palon
// ---------------------------------------------------------------------
{
  const zoneId = "zone:west-freeport";
  const northFreeportId = "zone:north-freeport";
  const giverId = "npc:west-freeport:palon-deskeb";
  addGiver(giverId, "Palon Deskeb", zoneId);

  const questId = "quest:marr-minnows-for-palon";
  addNode({
    id: questId,
    label: "Marr Minnows for Palon",
    type: "quest",
    description: "Palon Deskeb, on the 2nd floor of the Academy of Arcane Sciences in West Freeport, hands out a Jar of Liquid to offer to a minnow in the river near the Hall of Truth in North Freeport; a resulting Fish in a Jar trades for a Ration, coin, and experience.",
    minLevel: 1,
    steps: [
      "Receive a Jar of Liquid from Palon Deskeb in West Freeport",
      "Offer it to a minnow near the Hall of Truth in North Freeport for a Fish in a Jar",
      "Return the Fish in a Jar to Palon Deskeb",
    ],
    wiki_title: "Marr Minnows for Palon",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, northFreeportId, "located_in");

  const rationId = "item:ration";
  addNode({
    id: rationId,
    label: "Ration",
    type: "item",
    weight: 1.0,
    size: "Small",
    source: "Marr Minnows for Palon reward (Palon Deskeb, West Freeport) -- a meal",
  });
  addEdge(questId, rationId, "rewards");
}

// ---------------------------------------------------------------------
// Mask of War Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const giverId = "npc:kael-drakkal:captain-bvellos";
  addGiver(giverId, "Captain Bvellos", zoneId);

  const questId = "quest:mask-of-war-quest";
  addNode({
    id: questId,
    label: "Mask of War Quest",
    type: "quest",
    description: "Captain Bvellos in Kael Drakkal, requiring better than Indifferent faction, trades a Wurmscale Scroll -- proof of Wenglawk's treachery, dropped by a Chetari Courier in Dragon Necropolis -- for the Mask of War.",
    minLevel: 45,
    steps: [
      "Say \"I am looking for work\" to Captain Bvellos in Kael Drakkal",
      "Kill a Chetari Courier in Dragon Necropolis for a Wurmscale Scroll",
      "Return the scroll to Captain Bvellos",
    ],
    wiki_title: "Mask of War Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const maskId = "item:mask-of-war";
  addNode({
    id: maskId,
    label: "Mask of War",
    type: "item",
    slots: ["Face"],
    magic: true,
    ac: 9,
    stats: { str: 2, sta: 5, wis: 9 },
    effect: "Yaulp II (Combat) at Level 35",
    source: "Mask of War Quest reward (Captain Bvellos, Kael Drakkal)",
  });
  addEdge(questId, maskId, "rewards");
}

// ---------------------------------------------------------------------
// Mechanical Net Delivery
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const cobaltScarId = "zone:cobalt-scar";
  const giverId = "npc:kael-drakkal:wenglawks-kkeak";
  addGiver(giverId, "Wenglawks Kkeak", zoneId);

  const questId = "quest:mechanical-net-delivery";
  addNode({
    id: questId,
    label: "Mechanical Net Delivery",
    type: "quest",
    description: "Wenglawks Kkeak, in a back room of Kael Drakkal, trades a Voucher for Mechanical Net (from Kellek Felhammer) delivered to an outcast siren in Cobalt Scar, then 3 Excellent Siren Scales (from sirens in Cobalt Scar) traded to that same outcast siren for a Giant Siren Scale Cloak, returned to Wenglawks for Wenglawks Manly Purse.",
    minLevel: 50,
    steps: [
      "Say \"You can trust me\" to Wenglawks Kkeak in Kael Drakkal",
      "Trade the resulting voucher to Kellek Felhammer for a Mechanical Net",
      "Give the net to an outcast siren in Cobalt Scar",
      "Kill sirens in Cobalt Scar for 3 Excellent Siren Scales",
      "Return the scales to the outcast siren for a Giant Siren Scale Cloak",
      "Return the cloak to Wenglawks Kkeak",
    ],
    wiki_title: "Mechanical Net Delivery",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, cobaltScarId, "located_in");

  const purseId = "item:wenglawks-manly-purse";
  addNode({
    id: purseId,
    label: "Wenglawks Manly Purse",
    type: "item",
    lore: true,
    noTrade: true,
    weight: 0.1,
    capacity: 8,
    containerSize: "Giant",
    source: "Mechanical Net Delivery reward (Wenglawks Kkeak, Kael Drakkal) -- 70% weight reduction",
  });
  addEdge(questId, purseId, "rewards");
}

// ---------------------------------------------------------------------
// Medallion of the Jarsath Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:timorous-deep";
  const swampOfNoHopeId = "zone:swamp-of-no-hope";
  const firionaVieId = "zone:firiona-vie";
  const lakeOfIllOmenId = "zone:lake-of-ill-omen";
  const giverId = "npc:timorous-deep:xiblin-fizzlebik";
  addGiver(giverId, "Xiblin Fizzlebik", zoneId);

  const questId = "quest:medallion-of-the-jarsath-quest";
  addNode({
    id: questId,
    label: "Medallion of the Jarsath Quest",
    type: "quest",
    description: "Xiblin Fizzlebik, on the chessboard island in Timorous Deep, assembles an Upper Portion (found in Swamp of No Hope), a Middle Portion (from an ancient Jarsath, an Iksar monk skeleton in Firiona Vie), and a Bottom Portion (from a bloodgill marauder guarding the Sunken Temple of Veksar in Lake of Ill Omen) into the Medallion of the Jarsath -- cursed, and one of three medallions needed for the Rune of Scale Quest to access Veeshan's Peak.",
    minLevel: 51,
    steps: [
      "Find the Upper Portion in Swamp of No Hope",
      "Kill an ancient Jarsath in Firiona Vie for the Middle Portion",
      "Kill a bloodgill marauder guarding the Sunken Temple of Veksar in Lake of Ill Omen for the Bottom Portion",
      "Give all three to Xiblin Fizzlebik in Timorous Deep",
    ],
    wiki_title: "Medallion of the Jarsath Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, swampOfNoHopeId, "located_in");
  addEdge(questId, firionaVieId, "located_in");
  addEdge(questId, lakeOfIllOmenId, "located_in");

  const medallionId = "item:medallion-of-the-jarsath";
  addNode({
    id: medallionId,
    label: "Medallion of the Jarsath",
    type: "item",
    slots: ["Neck"],
    magic: true,
    noTrade: true,
    weight: 0.1,
    size: "Tiny",
    source: "Medallion of the Jarsath Quest reward (Xiblin Fizzlebik, Timorous Deep)",
  });
  addEdge(questId, medallionId, "rewards");
}

// ---------------------------------------------------------------------
// Medallion of the Kylong Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:lake-of-ill-omen";
  const chardokId = "zone:chardok";
  const giverId = "npc:lake-of-ill-omen:professor-akabao";
  addGiver(giverId, "Professor Akabao", zoneId);

  const questId = "quest:medallion-of-the-kylong-quest";
  addNode({
    id: questId,
    label: "Medallion of the Kylong Quest",
    type: "quest",
    description: "Professor Akabao, in a tower southeast of Lake of Ill Omen, assembles an Upper Portion (from the Niblek's Gems quest in Chardok), a Middle Portion (from Verix Kyloxs Remains in the Karnor's Castle sewers), and a Bottom Portion (on the floor of the library in Kaesora) into the Medallion of the Kylong. One of three medallions needed for the Rune of Scale Quest to access Veeshan's Peak.",
    minLevel: 51,
    steps: [
      "Complete the Niblek's Gems quest in Chardok for the Upper Portion",
      "Kill Verix Kyloxs Remains in the Karnor's Castle sewers for the Middle Portion",
      "Find the Bottom Portion on the library floor in Kaesora",
      "Give all three to Professor Akabao in Lake of Ill Omen",
    ],
    wiki_title: "Medallion of the Kylong Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, chardokId, "located_in");

  const medallionId = "item:medallion-of-the-kylong";
  addNode({
    id: medallionId,
    label: "Medallion of the Kylong",
    type: "item",
    slots: ["Neck"],
    magic: true,
    noTrade: true,
    weight: 0.1,
    source: "Medallion of the Kylong Quest reward (Professor Akabao, Lake of Ill Omen)",
  });
  addEdge(questId, medallionId, "rewards");
}

// ---------------------------------------------------------------------
// Medallion of the Obulus Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:burning-woods";
  const giverId = "npc:burning-woods:slixin-klex";
  addGiver(giverId, "Slixin Klex", zoneId);

  const questId = "quest:medallion-of-the-obulus-quest";
  addNode({
    id: questId,
    label: "Medallion of the Obulus Quest",
    type: "quest",
    description: "Slixin Klex in Burning Woods assembles an Upper Portion (given by Ssolet Dnaas on the island in Warsliks Woods), a Middle Portion (from a rotting skeleton in Dreadlands), and a Bottom Portion (from a Pained Soul in Trakanon's Teeth near the Old Sebilis entrance) into the Medallion of the Obulus. One of three medallions needed for the Rune of Scale Quest to access Veeshan's Peak.",
    minLevel: 51,
    steps: [
      "Receive the Upper Portion from Ssolet Dnaas on the island in Warsliks Woods",
      "Kill a rotting skeleton in Dreadlands for the Middle Portion",
      "Kill a Pained Soul near the Old Sebilis entrance in Trakanon's Teeth for the Bottom Portion",
      "Give all three to Slixin Klex in Burning Woods",
    ],
    wiki_title: "Medallion of the Obulus Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const medallionId = "item:medallion-of-the-obulus";
  addNode({
    id: medallionId,
    label: "Medallion of the Obulus",
    type: "item",
    slots: ["Neck"],
    magic: true,
    lore: true,
    noTrade: true,
    weight: 0.1,
    size: "Tiny",
    source: "Medallion of the Obulus Quest reward (Slixin Klex, Burning Woods)",
  });
  addEdge(questId, medallionId, "rewards");
}

// ---------------------------------------------------------------------
// Mercenary Assignments Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:skyshrine";
  const giverId = "npc:skyshrine:sentry-kcor";
  addGiver(giverId, "Sentry Kcor", zoneId);

  const questId = "quest:mercenary-assignments-quest";
  addNode({
    id: questId,
    label: "Mercenary Assignments Quest",
    type: "quest",
    description: "Sentry Kcor in Skyshrine, working even at Dubious faction, trades 1-4 Mercenary Assignments at a time for coin and Claws of Veeshan / Yelinak faction; roughly 14 hand-ins and 6 mercenary kills moves faction from Indifferent to Amiable. Repeatable.",
    steps: ["Turn in 1-4 Mercenary Assignments to Sentry Kcor in Skyshrine"],
    wiki_title: "Mercenary Assignments Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Claws of Veeshan");
  addFactionReward(questId, "Yelinak");
}

// ---------------------------------------------------------------------
// Merona's Brother
// ---------------------------------------------------------------------
{
  const zoneId = "zone:surefall-glade";
  const qeynosCatacombsId = "zone:qeynos-catacombs";
  const northQeynosId = "zone:north-qeynos";
  const giverId = "npc:surefall-glade:merona-castekin";
  addGiver(giverId, "Merona Castekin", zoneId);

  const questId = "quest:meronas-brother";
  addNode({
    id: questId,
    label: "Merona's Brother",
    type: "quest",
    description: "Merona Castekin in Surefall Glade sends players to North Qeynos to question Sneed Galliway about her missing brother Ronn, who directs them to the Qeynos Catacombs; Ronn has become an undead Bloodsaber there, and his corpse carries a Torn Parchment. Returning it to Merona rewards a random one of the Band of Tunare (wrist, AC +1, WIS +1, MANA +2), Ring of Pine (finger, AC +1, STA +1), or assorted newbie supplies (bandages, rations, bread, water, mead).",
    minLevel: 4,
    steps: [
      "Speak with Merona Castekin in Surefall Glade",
      "Question Sneed Galliway in North Qeynos about Ronn's whereabouts",
      "Kill Ronn Castekin (an undead Bloodsaber) in the Qeynos Catacombs for a Torn Parchment",
      "Return the parchment to Merona Castekin",
    ],
    wiki_title: "Merona's Brother",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, qeynosCatacombsId, "located_in");
  addEdge(questId, northQeynosId, "located_in");
}

// ---------------------------------------------------------------------
// Message Intercept
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-freeport";
  const westCommonlandsId = "zone:west-commonlands";
  const giverId = "npc:east-freeport:raltur-caliskon";
  addGiver(giverId, "Raltur Caliskon", zoneId);

  const questId = "quest:message-intercept";
  addNode({
    id: questId,
    label: "Message Intercept",
    type: "quest",
    description: "Raltur Caliskon in East Freeport, for players willing to serve Innoruuk, sends players to Sir Lucan D'Lere and on to kill the messenger Mojax Hikspin in West Commonlands for an intercepted note; returning it to Sir Lucan or Raltur pays coin, experience, and faction that varies by which recipient is chosen. Evil-aligned classes only.",
    minLevel: 5,
    steps: [
      "Speak with Raltur Caliskon in East Freeport and agree to serve Innoruuk",
      "Report to Sir Lucan D'Lere",
      "Kill the messenger Mojax Hikspin in West Commonlands for the intercepted note",
      "Return the note to Sir Lucan D'Lere or Raltur Caliskon",
    ],
    wiki_title: "Message Intercept",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, westCommonlandsId, "located_in");
}

// ---------------------------------------------------------------------
// Messages For Neriak
// ---------------------------------------------------------------------
{
  const zoneId = "zone:neriak-3rd-gate";
  const westCommonlandsId = "zone:west-commonlands";
  const highpassHoldId = "zone:highpass-hold";
  const giverId = "npc:neriak-3rd-gate:noxhil-vsek";
  addGiver(giverId, "Noxhil V`Sek", zoneId);

  const questId = "quest:messages-for-neriak";
  addNode({
    id: questId,
    label: "Messages For Neriak",
    type: "quest",
    description: "Noxhil V`Sek, on the top floor of the Lodge of the Dead in Neriak 3rd Gate, requiring Amiable or better faction, sends players to retrieve A Sealed Letter from expedition agent Kizdean Gix in West Commonlands (and, per the wiki, a second agent, Cytodl Krish, in Highpass Hold) for delivery to Loveal S`Nez back in Neriak 3rd Gate, for 2 Bandages, 2 Iron Rations, a Torch, coin, experience, and faction.",
    minLevel: 15,
    steps: [
      "Receive A Sealed List from Noxhil V`Sek in Neriak 3rd Gate",
      "Retrieve A Sealed Letter from Kizdean Gix in West Commonlands",
      "Visit Cytodl Krish in Highpass Hold",
      "Return the letter(s) to Loveal S`Nez in Neriak 3rd Gate",
    ],
    wiki_title: "Messages For Neriak",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, westCommonlandsId, "located_in");
  addEdge(questId, highpassHoldId, "located_in");

  const bandagesId = "item:bandages";
  addNode({
    id: bandagesId,
    label: "Bandages",
    type: "item",
    weight: 0.5,
    size: "Small",
    source: "Messages For Neriak reward (Noxhil V`Sek, Neriak 3rd Gate) -- used in Bind Wound skill",
  });
  addEdge(questId, bandagesId, "rewards");

  const ironRationId = "item:iron-ration";
  addNode({
    id: ironRationId,
    label: "Iron Ration",
    type: "item",
    weight: 0.6,
    size: "Small",
    source: "Messages For Neriak reward (Noxhil V`Sek, Neriak 3rd Gate) -- a hearty meal",
  });
  addEdge(questId, ironRationId, "rewards");
  addEdge(questId, "item:torch", "rewards");

  addFactionReward(questId, "The Dead");
  addFactionReward(questId, "Queen Cristanos Thex");
}

// ---------------------------------------------------------------------
// Miner's Cap
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-kaladim";
  const giverId = "npc:north-kaladim:jeet";
  addGiver(giverId, "Jeet", zoneId);

  const questId = "quest:miners-cap";
  addNode({
    id: questId,
    label: "Miner's Cap",
    type: "quest",
    description: "Jeet, outside the Ratsbone Treasury & Assay Office in North Kaladim, requiring Indifferent or better faction, trades Scrap Metal -- from Cleaner VII, one of three Giant Rats in the mines beneath the North Kaladim bank -- for the Miners Cap 628. Rogue, Dwarf only.",
    classes: ["rogue"],
    minLevel: 4,
    steps: [
      "Kill Cleaner VII in the mines beneath the North Kaladim bank for Scrap Metal",
      "Turn it in to Jeet in North Kaladim",
    ],
    wiki_title: "Miner's Cap",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const capId = "item:miners-cap-628";
  addNode({
    id: capId,
    label: "Miners Cap 628",
    type: "item",
    slots: ["Head"],
    classes: ["rogue"],
    magic: true,
    lore: true,
    ac: 3,
    stats: { cha: 2 },
    weight: 3.0,
    size: "Small",
    source: "Miner's Cap reward (Jeet, North Kaladim) -- Dwarf race only",
  });
  addEdge(questId, capId, "rewards");
  addFactionReward(questId, "Miners Guild 628");
  addFactionReward(questId, "DeepPockets");
}

// ---------------------------------------------------------------------
// Miners Pick
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-kaladim";
  const oceanId = "zone:ocean-of-tears";
  const giverId = "npc:north-kaladim:mater";
  addGiver(giverId, "Mater", zoneId);

  const questId = "quest:miners-pick";
  addNode({
    id: questId,
    label: "Miners Pick",
    type: "quest",
    description: "Mater, just outside the Kaladim bank (referred by Diggins, North Kaladim's quest giver of record), trades an Ogre Head -- from Boog Mudtoe on Ancient Cyclops Island in Ocean of Tears, not his brother Goob -- plus 300 gold for the Mining Pick 628. Rogue, Dwarf only.",
    classes: ["rogue"],
    minLevel: 18,
    steps: [
      "Find Mater outside the Kaladim bank in North Kaladim",
      "Kill Boog Mudtoe on Ancient Cyclops Island in Ocean of Tears for an Ogre Head",
      "Return it with 300 gold to Mater",
    ],
    wiki_title: "Miners Pick",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, oceanId, "located_in");

  const pickId = "item:mining-pick-628";
  addNode({
    id: pickId,
    label: "Mining Pick 628",
    type: "item",
    slots: ["Primary"],
    classes: ["rogue"],
    skill: "Piercing",
    damage: 7,
    delay: 31,
    weight: 6.5,
    size: "Medium",
    source: "Miners Pick reward (Mater, North Kaladim) -- Dwarf race only; also carries a +7 backstab bonus",
  });
  addEdge(questId, pickId, "rewards");
}

// ---------------------------------------------------------------------
// Mining Caps
// ---------------------------------------------------------------------
{
  const zoneId = "zone:toxxulia-forest";
  const giverId = "npc:toxxulia-forest:skeleton-miner";
  addGiver(giverId, "a skeleton (miner)", zoneId);

  const questId = "quest:mining-caps";
  addNode({
    id: questId,
    label: "Mining Caps",
    type: "quest",
    description: "A skeleton (miner) at the Paineel zone line in southern Toxxulia Forest trades a Useless Cloth Cap -- from kobold scouts -- for experience and a random low-level gem. Talrigar Eklorin (2 caps, seeking necromancers) and a right-hand skeleton offer separate random rewards for the same item.",
    minLevel: 2,
    steps: [
      "Kill kobold scouts in Toxxulia Forest for a Useless Cloth Cap",
      "Turn it in to a skeleton (miner) near the Paineel zone line",
    ],
    wiki_title: "Mining Caps",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 055 complete: added 25 more quests from GitHub issue #26's checklist");
