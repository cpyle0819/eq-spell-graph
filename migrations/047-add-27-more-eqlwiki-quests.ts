/**
 * Migration 047: 27 more quests off GitHub issue #26's checklist -- Death
 * of Lyda Nasin, Deathfist Slashed Belts, Demise of Blizzent, Deputy
 * Tagil's Debt, Dire Wolf-Hide Cloak Quest, Direwolf Fur Cloak Quest,
 * Direwolf Fur Hood Quest, Disease Cures, Divine Duty, Dragon Heads,
 * Drolvarg Teeth, Duster Models, Earthen Boots Quest, Emerald Warriors'
 * Items, Emil's Report, Erud's Tonic Quest, Erudin Cures, Erudite
 * Prisoners, Evil Research, Exotic Drinks, Experienced Courier, Explorer
 * Survival Knives, Eye of Stormhammer, Fabian's Strings, Faerie Dragon
 * Wings, Faren's Tacklebox, Feeding Dooga. Researched directly against
 * eqlwiki.com (each quest's own page), following
 * decisions/eqlwiki-quest-research-method.md. `located_in` follows the
 * broadened rule from migration 041 (decisions/quest-reward-modeling.md).
 *
 * Emerald Warriors' Items was initially assumed blocked on a missing
 * "Kelethin" zone, but Kelethin is a location *within* Greater Faydark
 * (which does exist here), not its own zone -- same "city inside a zone"
 * shape as every other giver location in this graph, so it's modeled
 * under zone:greater-faydark instead of skipped.
 *
 * Skipped this pass for missing-zone reasons: Deck of Spontaneous
 * Generation Quest and Essence Lens Quest (Plane of Mischief and Western
 * Wastes/Sleeper's Tomb, none of which exist here); Di'Zok Signet of
 * Service Quest (Chardok); Dozekar Tear Quests (Temple of Veeshan, also a
 * whole cluster of "Tests" -- not a single quest); Dragon Scales Quest
 * (Azdalin and Gylton, the actual scale sources, live in Burning
 * Wood/Burwood, which doesn't exist -- unlike a farming stop, this is the
 * quest's entire point, same reasoning as migration 045's Dain's Head);
 * Emberfold Exchange (Dreadlands, plus its reward is a holiday-event lore
 * book, not a normal persistent item); Emerald Dragonscale Quest (Cobalt
 * Scar is the giver's own zone, not just a farming stop, same reasoning as
 * migration 045's Bulthar Trunks); Entalon's Quest (Burning Woods; also
 * its only reward is a teleport effect, no persistent item). Most of these
 * missing zones are Kunark-era content this graph hasn't reached yet, not
 * a permanent gap -- worth revisiting once those zones exist.
 *
 * Also skipped: Enchant Bonethunder -- the wiki's own page states the
 * quest is pointless since the turned-in item and the reward are
 * identical (Bonethunder Staff, already modeled in migration 045). Darkforge
 * Armor Quests and Dreadscale Armor -- both real 7/8-piece class armor
 * sets (Shadow Knight, Shadow Knight/Iksar respectively) needing the same
 * dedicated multi-node quest_line treatment Armor of Ro got
 * (decisions/quest-line-node-type.md), not a single migration-entry
 * afterthought. For the same reason, deferred the entire Druid and
 * Enchanter class-progression clusters (Epic Quest, Kael/Skyshrine/
 * Thurgadin Armor Quests, Plane of Sky Tests, Spells (Good/Evil)) --
 * each is a large multi-part progression, not a standalone quest.
 *
 * Evil Research reuses the existing `item:concordance-of-research` node
 * (migration 028's Research Aid quest, Mrysila in Northern Karana) --
 * Smith Tv`ysa in Southern Desert of Ro runs the same Lightstone/Greater
 * Lightstone trade-up mechanic for evil-aligned races, evidently a second
 * NPC offering the identical exchange. "Runes and Research Volume I" *is*
 * modeled here (unlike migration 028's "Runes and Research", which 404'd
 * under every guessed title) -- this exact title, with its WT/Size line,
 * is quoted directly from the Evil Research page's own text, not a
 * separately-guessed URL.
 *
 * Deliberately NOT modeled:
 * - Every vague/randomized or stats-free reward text (Deathfist Slashed
 *   Belts' unnamed "Faction", Deputy Tagil's Debt's Carrot/Fishing Pole/
 *   Pine Needles/Potion of Wisdom, Drolvarg Teeth's Elven Trail Mix,
 *   Emerald Warriors' Items' 20-option Rusty/Tarnished weapon-choice
 *   catalog) -- consistent with every migration so far skipping trivial/
 *   vendor-junk, unnamed, or too-broad-to-name-confidently rewards. Erud's
 *   Tonic and Hurrieta's Tunic (Faren's Tacklebox) are kept as item nodes
 *   despite having no stat block -- both are explicitly flagged LORE/NO
 *   DROP on their own pages, i.e. real singular items, not stackable
 *   consumables like Cursed Wafers.
 * - Coin rewards -- no coin field on `quest` nodes, consistent with every
 *   migration so far.
 * - Negative faction changes throughout (e.g. Faerie Dragon Wings' Claws of
 *   Veeshan, Dragon Heads' Yelinak/Dain Frostreaver IV) -- `rewards` only
 *   models positive rewards (decisions/quest-reward-modeling.md).
 * - Race requirements/restrictions (Drolvarg Teeth's "Good Races",
 *   Experienced Courier's Erudite-only reward) -- no race field on `quest`
 *   or `item`, noted in `description` prose only where stated.
 * - era -- unset; none of these quests' own pages state a content era tag.
 * - Disease Cures, Divine Duty, and Erudin Cures are modeled with no
 *   `rewards` edges at all -- all three are repeatable NPC cure/heal
 *   services paid for in gold, with no item or named-faction reward on
 *   their own pages. Still real, distinct wiki quest pages worth the
 *   checklist credit.
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
// Death of Lyda Nasin
// ---------------------------------------------------------------------
{
  const zoneId = "zone:neriak-3rd-gate";
  const freeportId = "zone:west-freeport";
  const giverId = "npc:neriak-3rd-gate:tani-n-mar";
  addGiver(giverId, "Tani N`Mar", zoneId);

  const questId = "quest:death-of-lyda-nasin";
  addNode({
    id: questId,
    label: "Death of Lyda Nasin",
    type: "quest",
    description:
      "Tani N`Mar, in Neriak Third Gate, sends players Amiable or better to Freeport to help Giz Dinree deal with Lyda Nasin, hiding in the Seafarer's Roost near the docks.",
    classes: ["bard", "rogue", "shadow knight"],
    minLevel: 4,
    steps: [
      "Hail Tani N`Mar and agree to venture to Freeport",
      "Travel to Freeport and find Giz Dinree near the docks",
      "Tell her \"Tani sent me\" to receive the mission",
      "Enter the Seafarer's Roost at 9pm (a high-level ogre roams during the day)",
      "Kill Lyda Nasin on the second floor behind the bar",
      "Loot the Human Head from her corpse and return it to Tani N`Mar in Neriak",
    ],
    wiki_title: "Death of Lyda Nasin",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, freeportId, "located_in");

  const whipId = "item:cinctured-whip";
  addNode({
    id: whipId,
    label: "Cinctured Whip",
    type: "item",
    slots: ["Primary", "Secondary", "Waist"],
    skill: "Piercing",
    delay: 30,
    weight: 5.0,
    lore: true,
    source: "Death of Lyda Nasin reward (Tani N`Mar, Neriak Third Gate)",
  });
  addEdge(questId, whipId, "rewards");
}

// ---------------------------------------------------------------------
// Deathfist Slashed Belts
// ---------------------------------------------------------------------
{
  const zoneId = "zone:west-freeport";
  const goodGiverId = "npc:west-freeport:cain-darkmoore";
  const evilGiverId = "npc:west-freeport:captain-hazran";
  addGiver(goodGiverId, "Cain Darkmoore", zoneId);
  addGiver(evilGiverId, "Captain Hazran", zoneId);

  const questId = "quest:deathfist-slashed-belts";
  addNode({
    id: questId,
    label: "Deathfist Slashed Belts",
    type: "quest",
    description:
      "West Freeport runs two parallel repeatable turn-ins for Deathfist Slashed Belts: Cain Darkmoore takes two at a time from Dubious-or-better good-aligned players, Captain Hazran takes one at a time for evil-aligned players. Reward is coin, faction, and experience only -- no item.",
    minLevel: 1,
    steps: [
      "Good-aligned: hand Cain Darkmoore two Deathfist Slashed Belts at a time",
      "Evil-aligned: hand Captain Hazran one Deathfist Slashed Belt at a time",
    ],
    wiki_title: "Deathfist Slashed Belts",
  });
  addEdge(goodGiverId, questId, "starts");
  addEdge(evilGiverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Demise of Blizzent
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const greatDivideId = "zone:great-divide";
  const giverId = "npc:kael-drakkal:vorken-iceshard";
  addGiver(giverId, "Vorken Iceshard", zoneId);

  const questId = "quest:demise-of-blizzent";
  addNode({
    id: questId,
    label: "Demise of Blizzent",
    type: "quest",
    description: "Vorken Iceshard in Kael Drakkal sends players after the wurm Blizzent in Great Divide for a belt reward -- a parallel to Blizzent's Fang Quest with a different giver and reward.",
    classes: ["bard", "cleric", "druid", "monk", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"],
    minLevel: 50,
    steps: ["Speak with Vorken Iceshard in Kael Drakkal", "Slay Blizzent in Great Divide", "Return Blizzent's Fang to Vorken Iceshard"],
    wiki_title: "Demise of Blizzent",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, greatDivideId, "located_in");

  const beltId = "item:dragonhide-belt";
  addNode({
    id: beltId,
    label: "Dragonhide Belt",
    type: "item",
    slots: ["Waist"],
    classes: CASTER_EXCLUDED_CLASSES,
    ac: 6,
    stats: { sta: 10 },
    source: "Demise of Blizzent reward (Vorken Iceshard, Kael Drakkal)",
  });
  addEdge(questId, beltId, "rewards");
  addFactionReward(questId, "Kromrif");
  addFactionReward(questId, "Kromzek");
}

// ---------------------------------------------------------------------
// Deputy Tagil's Debt
// ---------------------------------------------------------------------
{
  const zoneId = "zone:rivervale";
  const mistyId = "zone:misty-thicket";
  const giverId = "npc:rivervale:uner-gnarltrunk";
  addGiver(giverId, "Uner Gnarltrunk", zoneId);

  const questId = "quest:deputy-tagils-debt";
  addNode({
    id: questId,
    label: "Deputy Tagil's Debt",
    type: "quest",
    description: "Uner Gnarltrunk, at Tagglefoot's Farmstead in Rivervale, sends players Amiable or better with the Storm Reapers on a note-delivery errand to Deputy Tagil at Rivervale's entrance in Misty Thicket.",
    minLevel: 1,
    steps: [
      "Receive A Note from Uner Gnarltrunk at Tagglefoot's Farmstead",
      "Deliver the note to Deputy Tagil at Rivervale's entrance in Misty Thicket",
      "Receive Deputy Tagil's Payment from Deputy Tagil",
      "Return the payment to Uner Gnarltrunk",
    ],
    wiki_title: "Deputy Tagil's Debt",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, mistyId, "located_in");
  addFactionReward(questId, "Storm Reapers");
  addFactionReward(questId, "Mayor Gubbin");
  addFactionReward(questId, "Merchants of Rivervale");
}

// ---------------------------------------------------------------------
// Dire Wolf-Hide Cloak Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const giverId = "npc:kael-drakkal:captain-bvellos";
  addGiver(giverId, "Captain Bvellos", zoneId);

  const questId = "quest:dire-wolf-hide-cloak-quest";
  addNode({
    id: questId,
    label: "Dire Wolf-Hide Cloak Quest",
    type: "quest",
    description: "Captain Bvellos in Kael Drakkal trades a Sealed Letter, dropped by the Shardwing Courier, for a cloak. Requires better than Amiable faction.",
    minLevel: 50,
    steps: ["Obtain a Sealed Letter dropped by the Shardwing Courier", "Hand the letter to Captain Bvellos"],
    wiki_title: "Dire Wolf-Hide Cloak Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const cloakId = "item:dire-wolf-hide-cloak";
  addNode({
    id: cloakId,
    label: "Dire Wolf-Hide Cloak",
    type: "item",
    slots: ["Back"],
    ac: 8,
    stats: { str: 6, sta: 6 },
    hp: 35,
    source: "Dire Wolf-Hide Cloak Quest reward (Captain Bvellos, Kael Drakkal)",
  });
  addEdge(questId, cloakId, "rewards");
  addFactionReward(questId, "King Tormax");
  addFactionReward(questId, "Kromzek");
}

// ---------------------------------------------------------------------
// Direwolf Fur Cloak Quest / Direwolf Fur Hood Quest
// (same giver, Ergrez Shortpaw in Iceclad Ocean)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:iceclad-ocean";
  const giverId = "npc:iceclad-ocean:ergrez-shortpaw";
  addGiver(giverId, "Ergrez Shortpaw", zoneId);

  {
    const questId = "quest:direwolf-fur-cloak-quest";
    addNode({
      id: questId,
      label: "Direwolf Fur Cloak Quest",
      type: "quest",
      description: "Ergrez Shortpaw in Iceclad Ocean trades a Medium Quality Dire Wolf Fur and 2 Skinning Rocks for a cloak. Does not respond to hails at Indifferent faction.",
      classes: ["warrior", "paladin", "shadow knight", "ranger", "monk", "rogue"],
      minLevel: 30,
      steps: ["Collect a Medium Quality Dire Wolf Fur", "Collect 2 Skinning Rocks", "Turn both in to Ergrez Shortpaw"],
      wiki_title: "Direwolf Fur Cloak Quest",
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");

    const cloakId = "item:direwolf-fur-cloak";
    addNode({
      id: cloakId,
      label: "Direwolf Fur Cloak",
      type: "item",
      slots: ["Back"],
      classes: ["warrior", "paladin", "shadow knight", "ranger", "monk", "rogue"],
      ac: 7,
      stats: { str: 5 },
      weight: 2.5,
      magic: true,
      noTrade: true,
      source: "Direwolf Fur Cloak Quest reward (Ergrez Shortpaw, Iceclad Ocean)",
    });
    addEdge(questId, cloakId, "rewards");
  }

  {
    const questId = "quest:direwolf-fur-hood-quest";
    addNode({
      id: questId,
      label: "Direwolf Fur Hood Quest",
      type: "quest",
      description: "Ergrez Shortpaw in Iceclad Ocean trades a Low Quality Dire Wolf Fur and 2 Bark Bindings for a hood.",
      classes: CASTER_EXCLUDED_CLASSES,
      minLevel: 30,
      steps: ["Collect a Low Quality Dire Wolf Fur", "Collect 2 Bark Bindings", "Bring both to Ergrez Shortpaw"],
      wiki_title: "Direwolf Fur Hood Quest",
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");

    const hoodId = "item:direwolf-fur-hood";
    addNode({
      id: hoodId,
      label: "Direwolf Fur Hood",
      type: "item",
      slots: ["Head"],
      classes: CASTER_EXCLUDED_CLASSES,
      ac: 6,
      stats: { dex: 5 },
      hp: 20,
      weight: 1.0,
      magic: true,
      noTrade: true,
      source: "Direwolf Fur Hood Quest reward (Ergrez Shortpaw, Iceclad Ocean)",
    });
    addEdge(questId, hoodId, "rewards");
  }
}

// ---------------------------------------------------------------------
// Disease Cures
// ---------------------------------------------------------------------
{
  const zoneId = "zone:halas";
  const giverId = "npc:halas:waltor-felligan";
  addGiver(giverId, "Waltor Felligan", zoneId);

  const questId = "quest:disease-cures";
  addNode({
    id: questId,
    label: "Disease Cures",
    type: "quest",
    description: "Waltor Felligan in Halas casts Cure Disease on anyone who hands over 2 Wooly Fungus. A repeatable service, not a one-time quest -- no item or faction reward.",
    minLevel: 1,
    steps: ["Hand Waltor Felligan 2 Wooly Fungus", "Receive Cure Disease"],
    wiki_title: "Disease Cures",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Divine Duty
// ---------------------------------------------------------------------
{
  const zoneId = "zone:neriak-3rd-gate";
  const giverId = "npc:neriak-3rd-gate:ulazia-w-selo";
  addGiver(giverId, "Ulazia W`Selo", zoneId);

  const questId = "quest:divine-duty";
  addNode({
    id: questId,
    label: "Divine Duty",
    type: "quest",
    description: "Ulazia W`Selo in Neriak Third Gate sells healing (10 gold), disease cures (6 gold), and poison cures (8 gold) for coin. A repeatable service -- no item or faction reward.",
    minLevel: 1,
    steps: ["Pay Ulazia W`Selo for healing, disease cure, or poison cure"],
    wiki_title: "Divine Duty",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Dragon Heads
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const giverId = "npc:kael-drakkal:dlammaz-stormslayer";
  addGiver(giverId, "Dlammaz Stormslayer", zoneId);

  const questId = "quest:dragon-heads";
  addNode({
    id: questId,
    label: "Dragon Heads",
    type: "quest",
    description: "Dlammaz Stormslayer in Kael Drakkal, requiring Amiable faction with King Tormax, trades either of two dragon heads for a different reward.",
    minLevel: 50,
    steps: ["Turn in a Greater Dragon's Head to Dlammaz Stormslayer for Frostbringer", "Or turn in a Great Dragon's Head for Cloak of the Maelstrom"],
    wiki_title: "Dragon Heads",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const swordId = "item:frostbringer";
  addNode({
    id: swordId,
    label: "Frostbringer",
    type: "item",
    slots: ["Primary"],
    skill: "1H Slashing",
    damage: 12,
    ac: 7,
    effect: "Frostbite",
    source: "Dragon Heads reward for a Greater Dragon's Head (Dlammaz Stormslayer, Kael Drakkal)",
  });
  const cloakId = "item:cloak-of-the-maelstrom";
  addNode({
    id: cloakId,
    label: "Cloak of the Maelstrom",
    type: "item",
    slots: ["Back"],
    ac: 11,
    stats: { str: 3, dex: 10, sta: 6, int: 5 },
    hp: 55,
    source: "Dragon Heads reward for a Great Dragon's Head (Dlammaz Stormslayer, Kael Drakkal)",
  });
  addEdge(questId, swordId, "rewards");
  addEdge(questId, cloakId, "rewards");
  addFactionReward(questId, "King Tormax");
  addFactionReward(questId, "Kromzek");
}

// ---------------------------------------------------------------------
// Drolvarg Teeth
// ---------------------------------------------------------------------
{
  const zoneId = "zone:firiona-vie";
  const giverId = "npc:firiona-vie:captain-nealith";
  addGiver(giverId, "Captain Nealith", zoneId);

  const questId = "quest:drolvarg-teeth";
  addNode({
    id: questId,
    label: "Drolvarg Teeth",
    type: "quest",
    description: "Captain Nealith in Firiona Vie sends good-race players after Drolvarg Teeth (dropped as \"A Canine\") from drolvargs in various zones, four at a time.",
    minLevel: 27,
    steps: ["Hail Captain Nealith and agree to join the defense", "Collect 4 Drolvarg Teeth from drolvargs", "Hand in all four"],
    wiki_title: "Drolvarg Teeth",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Inhabitants of Firiona Vie");
  addFactionReward(questId, "Emerald Warriors");
  addFactionReward(questId, "Storm Guard");
}

// ---------------------------------------------------------------------
// Duster Models
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ak-anon";
  const giverId = "npc:ak-anon:drekon-vebnebber";
  addGiver(giverId, "Drekon Vebnebber", zoneId);

  const questId = "quest:duster-models";
  addNode({
    id: questId,
    label: "Duster Models",
    type: "quest",
    description: "Drekon Vebnebber, in the Gemchoppers Hall in Ak'Anon, hands out a Daily Log to hunt obsolete Duster models for scrap metal, turned in to Sanfyrd Featherhead at the scrapyard.",
    minLevel: 6,
    steps: [
      "Receive a Daily Log from Drekon Vebnebber",
      "Defeat Duster V and Duster X and loot Scrap Metal",
      "Deliver the scrap to Sanfyrd Featherhead at the scrapyard west of the Mines of Malfunction",
    ],
    wiki_title: "Duster Models",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const packId = "item:bootstrutters-framed-pack";
  addNode({
    id: packId,
    label: "Bootstrutter's Framed Pack",
    type: "item",
    weight: 2.5,
    capacity: 10,
    lore: true,
    noTrade: true,
    source: "Duster Models reward (Sanfyrd Featherhead, Ak'Anon)",
  });
  const hammerId = "item:forging-hammer";
  addNode({
    id: hammerId,
    label: "Forging Hammer",
    type: "item",
    slots: ["Primary", "Secondary"],
    classes: CASTER_EXCLUDED_CLASSES,
    skill: "1H Blunt",
    damage: 4,
    delay: 38,
    source: "Duster Models reward (Sanfyrd Featherhead, Ak'Anon)",
  });
  addEdge(questId, packId, "rewards");
  addEdge(questId, hammerId, "rewards");
  addFactionReward(questId, "Gem Choppers");
  addFactionReward(questId, "Merchants of Ak'Anon");
  addFactionReward(questId, "King Ak'Anon");
}

// ---------------------------------------------------------------------
// Earthen Boots Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:temple-of-solusek-ro";
  const mistmooreId = "zone:mistmoore-castle";
  const lakeRatheId = "zone:lake-rathetear";
  const gukId = "zone:lower-guk";
  const giverId = "npc:temple-of-solusek-ro:joyce";
  addGiver(giverId, "Joyce", zoneId);

  const questId = "quest:earthen-boots-quest";
  addNode({
    id: questId,
    label: "Earthen Boots Quest",
    type: "quest",
    description: "Joyce in Temple of Solusek Ro trades four farmed/purchased reagents for a magician's boots.",
    classes: ["magician"],
    minLevel: 28,
    steps: [
      "Obtain a Stone Marker from a glyphed guard in Castle Mistmoore",
      "Obtain a Heart of Stone from the stone skeleton near Lake Rathetear",
      "Obtain Soiled Boots from a froglok tonta knight in the caverns of Guk",
      "Purchase a Cat's Eye Agate",
      "Return all four to Joyce",
    ],
    wiki_title: "Earthen Boots Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, mistmooreId, "located_in");
  addEdge(questId, lakeRatheId, "located_in");
  addEdge(questId, gukId, "located_in");

  const bootsId = "item:earthen-boots";
  addNode({
    id: bootsId,
    label: "Earthen Boots",
    type: "item",
    slots: ["Feet"],
    ac: 5,
    stats: { sta: 5 },
    hp: 15,
    weight: 2.0,
    size: "Small",
    effect: "Invisibility versus Animal",
    source: "Earthen Boots Quest reward (Joyce, Temple of Solusek Ro)",
  });
  addEdge(questId, bootsId, "rewards");
  addFactionReward(questId, "Temple of Sol Ro");
}

// ---------------------------------------------------------------------
// Emerald Warriors' Items
// ---------------------------------------------------------------------
{
  const zoneId = "zone:greater-faydark";
  const giverId = "npc:greater-faydark:regren";
  addGiver(giverId, "Regren", zoneId);

  const questId = "quest:emerald-warriors-items";
  addNode({
    id: questId,
    label: "Emerald Warriors' Items",
    type: "quest",
    description:
      "Regren, inside the Emerald Warriors Guild in Kelethin (Greater Faydark), trades one each of four common drops for a choice of Rusty/Tarnished starter weapon. Requires Amiable or better faction.",
    classes: ["bard", "cleric", "druid", "monk", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"],
    minLevel: 1,
    steps: [
      "Collect one Ruined Wolf Pelt, one Bat Fur, one Bone Chips, and one Spiderling Eye",
      "Turn all four in to Regren for a choice of starter weapon",
    ],
    wiki_title: "Emerald Warriors' Items",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Emerald Warriors");
  addFactionReward(questId, "Kelethin Merchants");
  addFactionReward(questId, "Merchants of Felwithe");
}

// ---------------------------------------------------------------------
// Emil's Report
// ---------------------------------------------------------------------
{
  const zoneId = "zone:skyshrine";
  const wakeningId = "zone:the-wakening-land";
  const giverId = "npc:skyshrine:sentry-emil";
  addGiver(giverId, "Sentry Emil", zoneId);

  const questId = "quest:emils-report";
  addNode({
    id: questId,
    label: "Emil's Report",
    type: "quest",
    description: "Sentry Emil in Skyshrine, at Indifferent faction or better, sends players on a note-delivery errand to Eysa Florawhisper in The Wakening Land.",
    minLevel: 1,
    steps: [
      "Receive a Note to Tunare's Court from Sentry Emil",
      "Deliver it to Eysa Florawhisper in The Wakening Land",
      "Return Eysa's Token to Sentry Emil",
    ],
    wiki_title: "Emil's Report",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, wakeningId, "located_in");
  addFactionReward(questId, "Claws of Veeshan");
  addFactionReward(questId, "Yelinak");
  addFactionReward(questId, "Tunarean Court");
}

// ---------------------------------------------------------------------
// Erud's Tonic Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const giverId = "npc:erudin:geoard-bluehawk";
  addGiver(giverId, "Geoard BlueHawk", zoneId);

  const questId = "quest:eruds-tonic-quest";
  addNode({
    id: questId,
    label: "Erud's Tonic Quest",
    type: "quest",
    description: "Geoard BlueHawk, at BlueHawk's in Erudin, sells an Innoruuk's Kiss of Death that Sinnkin Highbrow in the Erudin City Library trades for a tonic.",
    minLevel: 1,
    steps: [
      "Hail Geoard BlueHawk and ask about Erud's Tonic",
      "Purchase an Innoruuk's Kiss of Death from Geoard",
      "Give it to Sinnkin Highbrow in the Erudin City Library",
    ],
    wiki_title: "Erud's Tonic Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const tonicId = "item:eruds-tonic";
  addNode({
    id: tonicId,
    label: "Erud's Tonic",
    type: "item",
    weight: 0.4,
    size: "Small",
    lore: true,
    noTrade: true,
    source: "Erud's Tonic Quest reward (Sinnkin Highbrow, Erudin)",
  });
  addEdge(questId, tonicId, "rewards");
  addFactionReward(questId, "Erudite Citizen");
}

// ---------------------------------------------------------------------
// Erudin Cures
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const giverId = "npc:erudin:cipse-tospyr";
  addGiver(giverId, "Cipse Tospyr", zoneId);

  const questId = "quest:erudin-cures";
  addNode({
    id: questId,
    label: "Erudin Cures",
    type: "quest",
    description: "Cipse Tospyr, at the Temple of Divine Light in Erudin, sells bind wounds (4 gold), disease cure (2 gold), and poison cure (3 gold) for coin. A repeatable service -- no item or faction reward.",
    minLevel: 1,
    steps: ["Pay Cipse Tospyr for bind wounds, disease cure, or poison cure"],
    wiki_title: "Erudin Cures",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Erudite Prisoners
// ---------------------------------------------------------------------
{
  const zoneId = "zone:the-warrens";
  const giverId = "npc:the-warrens:an-erudite-prisoner";
  addGiver(giverId, "An Erudite Prisoner", zoneId);

  const questId = "quest:erudite-prisoners";
  addNode({
    id: questId,
    label: "Erudite Prisoners",
    type: "quest",
    description: "An Erudite Prisoner in The Warrens sends players after Jailer Mkrarrg's Bronze Shackle Key to free them.",
    minLevel: 10,
    steps: ["Hail An Erudite Prisoner", "Kill Jailer Mkrarrg and obtain the Bronze Shackle Key", "Return the key to the prisoner"],
    wiki_title: "Erudite Prisoners",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Heretics");
  addFactionReward(questId, "High Guard of Erudin");
}

// ---------------------------------------------------------------------
// Evil Research
// ---------------------------------------------------------------------
{
  const zoneId = "zone:southern-desert-of-ro";
  const giverId = "npc:southern-desert-of-ro:smith-tvysa";
  addGiver(giverId, "Smith Tv`ysa", zoneId);

  const questId = "quest:evil-research";
  addNode({
    id: questId,
    label: "Evil Research",
    type: "quest",
    description: "Smith Tv`ysa in Southern Desert of Ro runs the evil-aligned counterpart to Research Aid's Lightstone/Greater Lightstone trade-up, for Indifferent-or-better faction.",
    classes: ["enchanter", "magician", "necromancer", "wizard"],
    minLevel: 10,
    steps: ["Turn in a Lightstone to Smith Tv`ysa for a Runes and Research Volume I", "Turn in a Greater Lightstone for a Concordance of Research"],
    wiki_title: "Evil Research",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const tomeId = "item:runes-and-research-volume-i";
  addNode({
    id: tomeId,
    label: "Runes and Research Volume I",
    type: "item",
    weight: 0.1,
    size: "Tiny",
    source: "Evil Research reward for a Lightstone (Smith Tv`ysa, Southern Desert of Ro)",
  });
  addEdge(questId, tomeId, "rewards");
  addEdge(questId, "item:concordance-of-research", "rewards");
  addFactionReward(questId, "Dark Bargainers");
  addFactionReward(questId, "Dreadguard Outer");
  addFactionReward(questId, "Dreadguard Inner");
}

// ---------------------------------------------------------------------
// Exotic Drinks
// ---------------------------------------------------------------------
{
  const zoneId = "zone:oggok";
  const freeportId = "zone:east-freeport";
  const giverId = "npc:oggok:clurg";
  addGiver(giverId, "Clurg", zoneId);

  const questId = "quest:exotic-drinks";
  addNode({
    id: questId,
    label: "Exotic Drinks",
    type: "quest",
    description: "Clurg, the Oggok bartender, sends players to Gregor Nasin in East Freeport with four exotic ingredients (including Erud's Tonic and Honey Jum) for a Barkeep Compendium, traded back to Clurg for a stein. Nominally aimed at Enchanter/Rogue/Bard, but open to all.",
    minLevel: 4,
    steps: [
      "Collect a Kiola Nut, Erud's Tonic, Honey Jum, and a Koalindl Fish",
      "Deliver all four to Gregor Nasin in East Freeport for a Barkeep Compendium",
      "Return the compendium to Clurg",
    ],
    wiki_title: "Exotic Drinks",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, freeportId, "located_in");

  const steinId = "item:stein-of-moggok";
  addNode({
    id: steinId,
    label: "Stein of Moggok",
    type: "item",
    slots: ["Primary", "Secondary"],
    stats: { dex: 5, int: 10 },
    hp: 10,
    resists: { disease: 25 },
    effect: "Light Healing",
    magic: true,
    lore: true,
    source: "Exotic Drinks reward (Clurg, Oggok)",
  });
  addEdge(questId, steinId, "rewards");
}

// ---------------------------------------------------------------------
// Experienced Courier
// ---------------------------------------------------------------------
{
  const zoneId = "zone:paineel";
  const toxxuliaId = "zone:toxxulia-forest";
  const giverId = "npc:paineel:davorre-bloodthorn";
  addGiver(giverId, "Davorre Bloodthorn", zoneId);

  const questId = "quest:experienced-courier";
  addNode({
    id: questId,
    label: "Experienced Courier",
    type: "quest",
    description: "Davorre Bloodthorn, in the Fell Blade shadow knight guild in Paineel, sends players Amiable or better on a delivery chain to Veisha Fathomwalker in Toxxulia Forest that ends in her betrayal and death.",
    classes: ["shadow knight"],
    minLevel: 30,
    steps: [
      "Deliver a Rolled up Note to Veisha Fathomwalker in Toxxulia Forest",
      "Return Veisha's Engagement Ring to Davorre",
      "Kill Phaeril Nightshire and loot Phaeril Nightshire's Head",
      "Deliver A Locked Chest to Veisha, triggering combat",
      "Kill Veisha and return Veisha Fathomwalker's Head to Davorre",
    ],
    wiki_title: "Experienced Courier",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, toxxuliaId, "located_in");

  const halberdId = "item:battle-worn-halberd";
  addNode({
    id: halberdId,
    label: "Battle Worn Halberd",
    type: "item",
    slots: ["Primary"],
    classes: ["shadow knight"],
    skill: "2H Slashing",
    damage: 16,
    delay: 41,
    stats: { sta: 5, agi: 5 },
    resists: { disease: 5 },
    weight: 8.0,
    magic: true,
    noTrade: true,
    source: "Experienced Courier reward (Davorre Bloodthorn, Paineel)",
  });
  addEdge(questId, halberdId, "rewards");
  addFactionReward(questId, "Heretics");
}

// ---------------------------------------------------------------------
// Explorer Survival Knives
// ---------------------------------------------------------------------
{
  const zoneId = "zone:lake-of-ill-omen";
  const giverId = "npc:lake-of-ill-omen:trooper-vaurk";
  addGiver(giverId, "Trooper Vaurk", zoneId);

  const questId = "quest:explorer-survival-knives";
  addNode({
    id: questId,
    label: "Explorer Survival Knives",
    type: "quest",
    description: "Trooper Vaurk, near Lake of Ill Omen between Cabilis and the lake shore, sends players after four Explorer Survival Knives from trespassing explorers. No item reward, just faction and experience.",
    minLevel: 30,
    steps: ["Hunt explorers near the lake for their stackable Explorer Survival Knife drops", "Turn in four knives to Trooper Vaurk"],
    wiki_title: "Explorer Survival Knives",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Legion of Cabilis");
  addFactionReward(questId, "Cabilis Residents");
  addFactionReward(questId, "Scaled Mystics");
  addFactionReward(questId, "Crusaders Of Greenmist");
  addFactionReward(questId, "Swift Tails");
}

// ---------------------------------------------------------------------
// Eye of Stormhammer
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-kaladim";
  const highKeepId = "zone:high-keep";
  const mistyId = "zone:misty-thicket";
  const northQeynosId = "zone:north-qeynos";
  const giverId = "npc:south-kaladim:beno-targnarle";
  addGiver(giverId, "Beno Targnarle", zoneId);

  const questId = "quest:eye-of-stormhammer";
  addNode({
    id: questId,
    label: "Eye of Stormhammer",
    type: "quest",
    description: "Beno Targnarle in South Kaladim, requiring Amiable warrior faction, sends players on a multi-zone chain trading up notes and gems into a combined Eye of Stormhammer.",
    classes: ["warrior"],
    minLevel: 20,
    steps: [
      "Receive A Sealed Note from Beno and give it to Jail Clerk Maryl at High Keep",
      "Obtain a Froglok Leg from Slaythe in Misty Thicket and trade it to Bronin Higginsbot",
      "Receive H.K. 106, trade it to Bank Clerk Jaylin for an Emerald Shard",
      "Obtain a second Emerald Shard from Faldor Hendrys in North Qeynos",
      "Combine both shards to create the Eye of Stormhammer and return it to Beno",
    ],
    wiki_title: "Eye of Stormhammer",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, highKeepId, "located_in");
  addEdge(questId, mistyId, "located_in");
  addEdge(questId, northQeynosId, "located_in");

  const axeId = "item:avenger-battle-axe";
  addNode({
    id: axeId,
    label: "Avenger Battle Axe",
    type: "item",
    slots: ["Primary"],
    classes: ["warrior"],
    skill: "2H Slashing",
    damage: 15,
    stats: { str: 3, sta: 3, agi: 3 },
    resists: { magic: 5 },
    magic: true,
    lore: true,
    source: "Eye of Stormhammer reward (Beno Targnarle, South Kaladim)",
  });
  addEdge(questId, axeId, "rewards");
}

// ---------------------------------------------------------------------
// Fabian's Strings
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-freeport";
  const southQeynosId = "zone:south-qeynos";
  const northernKaranaId = "zone:northern-karana";
  const giverId = "npc:east-freeport:fabian";
  addGiver(giverId, "Fabian", zoneId);

  const questId = "quest:fabians-strings";
  addNode({
    id: questId,
    label: "Fabian's Strings",
    type: "quest",
    description: "Fabian, in the Grub 'n Grog Tavern in East Freeport, sends players on a multi-zone fetch chain for lute strings.",
    minLevel: 30,
    steps: [
      "Give Fabian 2 gold pieces",
      "Travel to Wind Spirit's Song in South Qeynos",
      "Obtain a Bag of Troll Guts, dropped by Zahal the Vile in Northern Karana",
      "Hand the troll guts to Sansa Nusk for Lute Strings",
      "Return the Lute Strings to Fabian",
    ],
    wiki_title: "Fabian's Strings",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, southQeynosId, "located_in");
  addEdge(questId, northernKaranaId, "located_in");
  addFactionReward(questId, "League of Antonican Bards");
  addFactionReward(questId, "Knights of Truth");
  addFactionReward(questId, "Guards of Qeynos");
}

// ---------------------------------------------------------------------
// Faerie Dragon Wings
// ---------------------------------------------------------------------
{
  const zoneId = "zone:the-wakening-land";
  const giverId = "npc:the-wakening-land:a-storm-giant-foreman";
  addGiver(giverId, "a Storm Giant Foreman", zoneId);

  const questId = "quest:faerie-dragon-wings";
  addNode({
    id: questId,
    label: "Faerie Dragon Wings",
    type: "quest",
    description: "A Storm Giant Foreman in The Wakening Land trades the wings of Lord Gossimerwind and Lord Prismwing for a caster's mojo stick.",
    minLevel: 50,
    steps: ["Kill Lord Gossimerwind and Lord Prismwing", "Loot both dragons' wings", "Turn in both wings to the Storm Giant Foreman"],
    wiki_title: "Faerie Dragon Wings",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const stickId = "item:holgresh-mojo-stick-air";
  addNode({
    id: stickId,
    label: "Holgresh Mojo Stick (Air)",
    type: "item",
    classes: ["wizard", "magician"],
    effect: "Cast Force",
    charges: 5,
    source: "Faerie Dragon Wings reward (a Storm Giant Foreman, The Wakening Land)",
  });
  addEdge(questId, stickId, "rewards");
  addFactionReward(questId, "Kromzek");
  addFactionReward(questId, "Kromrif");
  addFactionReward(questId, "King Tormax");
}

// ---------------------------------------------------------------------
// Faren's Tacklebox
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:guard-beren";
  addGiver(giverId, "Guard Beren", zoneId);

  const questId = "quest:farens-tacklebox";
  addNode({
    id: questId,
    label: "Faren's Tacklebox",
    type: "quest",
    description: "Guard Beren in South Qeynos sends players to help his brother Faren retrieve a tacklebox knocked into the water at the East Dock.",
    minLevel: 1,
    steps: [
      "Hail Guard Beren and learn about his brother Faren",
      "Speak with Faren at the East Dock",
      "Retrieve the tacklebox from the water after Trumpy knocks it in",
      "Return the Wooden Fishing Tackle to Faren",
    ],
    wiki_title: "Faren's Tacklebox",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const tunicId = "item:hurrietas-tunic";
  addNode({
    id: tunicId,
    label: "Hurrieta's Tunic",
    type: "item",
    weight: 1.0,
    size: "Medium",
    lore: true,
    noTrade: true,
    source: "Faren's Tacklebox reward (Faren, South Qeynos)",
  });
  addEdge(questId, tunicId, "rewards");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Antonius Bayle");
  addFactionReward(questId, "Merchants of Qeynos");
}

// ---------------------------------------------------------------------
// Feeding Dooga
// ---------------------------------------------------------------------
{
  const zoneId = "zone:oggok";
  const innothuleId = "zone:innothule-swamp";
  const ratheId = "zone:rathe-mountains";
  const giverId = "npc:oggok:chef-dooga";
  addGiver(giverId, "Chef Dooga", zoneId);

  const questId = "quest:feeding-dooga";
  addNode({
    id: questId,
    label: "Feeding Dooga",
    type: "quest",
    description: "Chef Dooga, at the Meet and Drink Tew Bie tavern in Oggok, buys Human Flesh or High Elf Flesh (not the more common Parts variants) for coin, faction, and experience.",
    minLevel: 14,
    steps: ["Collect Human Flesh or High Elf Flesh from named NPCs in Innothule Swamp or Rathe Mountains", "Hand it to Chef Dooga"],
    wiki_title: "Feeding Dooga",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, innothuleId, "located_in");
  addEdge(questId, ratheId, "located_in");
  addFactionReward(questId, "Clurg");
  addFactionReward(questId, "Green Blood Knights");
  addFactionReward(questId, "Craknek Warriors");
  addFactionReward(questId, "Oggok Guards");
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 047 complete: added 27 more quests from GitHub issue #26's checklist");
