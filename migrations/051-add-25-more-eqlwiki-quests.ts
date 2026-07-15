/**
 * Migration 051: 25 more quests off GitHub issue #26's checklist -- the H
 * section (Halfling Raider Helms through Hungry Deputy). Researched
 * directly against eqlwiki.com, following
 * decisions/eqlwiki-quest-research-method.md.
 *
 * Skipped this pass (left unchecked on the issue, not modeled):
 * - Hate Tail Guard Shield -- its own page states "Appears this quest was
 *   never finished on live, perhaps no 'Giant Hate Tail Scorpions' exist,"
 *   matching the confirmed-non-functional precedent (migration 040's
 *   Bloodboil Quest, migration 050's Gretta's Baking Supplies Quest).
 * - Health Potion -- its giver (Errrak Thickshank) and turn-in items are
 *   all in "Kerra Island"/"Kerra Isle," which doesn't exist as a zone in
 *   this graph -- not a farming-stop tie, the quest's *entire* location is
 *   missing, same bar as migration 045's Dain's Head.
 * - High Guard Battlestaff -- the wiki's own page flags it as "an unsolved
 *   or broken quest" with the final combine/turn-in step undocumented; too
 *   incomplete to model without fabricating the missing step.
 * - Hopeless Love, Part 2 -- its own page states outright "this is not a
 *   quest, but merely a story line," with rewards listed as "None?" and a
 *   MISSING INFO banner. Part 1 (a real, separate turn-in quest with its
 *   own reward) is modeled; Part 2 is not a quest to model.
 *
 * Deliberately NOT modeled:
 * - Every vague/random reward (Help Hergor Get Fatter's "random piece of
 *   Large Raw-Hide or Large Tattered Armor Set," Healing Spells from
 *   Hendi's own choice-of-spell mechanic) -- consistent with every
 *   migration so far.
 * - Hsagra's Wrath Quest's own namesake spell reward -- "Hsagra's Wrath"
 *   has no matching spell node in this graph's Wizard spell data (unlike
 *   Head of Granin O'Gill's Spirit of Bear and Holy Armor Scroll's Holy
 *   Armor, both of which do), so it's left as prose in `steps` rather than
 *   a `rewards` edge to a node this migration would have to invent.
 * - Coin rewards throughout -- no coin field on `quest` nodes, consistent
 *   with every migration so far.
 * - Negative faction changes throughout (e.g. Handy Shillelagh's Legion of
 *   Cabilis/Pirates Of Gunthak, Helms of Giant Warriors' Kromzek, Hukulk's
 *   Love implies none stated) -- `rewards` only models positive rewards
 *   (decisions/quest-reward-modeling.md).
 * - Race requirements (Hukulk's Love restricted to evil races, Helm of the
 *   Tracker Quest's Tunare-deity gate) -- no race/deity field on `quest`,
 *   noted in `description` prose only where stated.
 * - Heal Yourself / Healing (Dismal Rage) / Healing Quest / Healing Spells
 *   from Hendi / Holy Armor Buff Quest are modeled with no `rewards` edges
 *   at all -- repeatable NPC cast-a-spell-on-you services paid for in
 *   gold, same shape as migration 042's Cure Disease (Qeynos)/Cure Poison
 *   (Qeynos) and migration 047's Disease Cures/Erudin Cures. Holy Armor
 *   Scroll is the separate, real permanent-spell-reward version of the
 *   Holy Armor pair (same giver, different page) and does get a `rewards`
 *   edge to `spell:holy-armor`.
 * - Herb Shop has no turn-in and no reward at all -- its own page reads as
 *   pure lore dialogue ("Seems like this quest is just for lore?"). Still
 *   modeled (real wiki quest-category page, checklist credit) with no
 *   `rewards` edges and steps describing the dialogue.
 * - Hero Bracers Quest's first sub-objective (killing Nomala on Wisp Isle)
 *   is in "Erud's Crossing," which doesn't exist as a zone in this graph
 *   -- left as prose only, no `located_in` edge for it, while the second
 *   sub-objective's zone (Steamfont Mountains) does get one. Holy Armor
 *   Scroll's beetle-eye sources ("Erud's Crossing and nearby island
 *   territories," including "Kerra Isle Beetles") get the same treatment.
 *
 * Hero Bracers Quest, Hollow Skull Quest, and Hsagra's Wrath Quest are
 * genuinely single quests despite spanning multiple named sub-objectives
 * and NPCs across zones -- not the Armor-of-Ro-style independent-parallel-
 * quests shape that belongs in the issue's Questlines section, just one
 * quest chain with several turn-in steps feeding one final reward.
 *
 * Deferred, not researched this batch: Hurrieta's Tunic Quest onward
 * (kept the H section at exactly 25 standalone quests, the issue's cap).
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
// Halfling Raider Helms
// ---------------------------------------------------------------------
{
  const zoneId = "zone:neriak-commons";
  const nektulosId = "zone:nektulos-forest";
  const giverId = "npc:neriak-commons:narex-tvem";
  addGiver(giverId, "Narex T`Vem", zoneId);

  const questId = "quest:halfling-raider-helms";
  addNode({
    id: questId,
    label: "Halfling Raider Helms",
    type: "quest",
    description: "Narex T`Vem in Neriak Commons, requiring Indifferent or better faction, trades four Leatherfoot Raider Skullcaps -- an occasional drop from Leatherfoot halflings in Nektulos Forest -- for experience and coin.",
    minLevel: 2,
    steps: ["Hunt Leatherfoot halflings in Nektulos Forest for 4 Leatherfoot Raider Skullcaps", "Return the skullcaps to Narex T`Vem"],
    wiki_title: "Halfling Raider Helms",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, nektulosId, "located_in");
  addFactionReward(questId, "Indigo Brotherhood");
}

// ---------------------------------------------------------------------
// Handy Shillelagh
// ---------------------------------------------------------------------
{
  const zoneId = "zone:firiona-vie";
  const burningWoodId = "zone:burning-wood";
  const frontierMountainsId = "zone:frontier-mountains";
  const emeraldJungleId = "zone:emerald-jungle";
  const swampId = "zone:swamp-of-no-hope";
  const giverId = "npc:firiona-vie:shrub-marwood";
  addGiver(giverId, "Shrub Marwood", zoneId);

  const questId = "quest:handy-shillelagh";
  addNode({
    id: questId,
    label: "Handy Shillelagh",
    type: "quest",
    description: "Shrub Marwood, at the eastern hideout of the Firiona Vie outpost, trades a Kromdul Stump (forest giants, Burning Woods or Firiona Vie), a Kromdek Stump (forest giants, Frontier Mountains), and a Mantrap Root (erollisi mantrap in Emerald Jungle or weeping mantrap in Swamp of No Hope) for a druid weapon.",
    classes: ["druid"],
    minLevel: 30,
    era: "Kunark",
    steps: [
      "Collect a Kromdul Stump from a forest giant in Burning Woods or Firiona Vie",
      "Collect a Kromdek Stump from a forest giant in Frontier Mountains",
      "Collect a Mantrap Root from an erollisi mantrap in Emerald Jungle or a weeping mantrap in Swamp of No Hope",
      "Return all three to Shrub Marwood",
    ],
    wiki_title: "Handy Shillelagh",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, burningWoodId, "located_in");
  addEdge(questId, frontierMountainsId, "located_in");
  addEdge(questId, emeraldJungleId, "located_in");
  addEdge(questId, swampId, "located_in");

  const shillelaghId = "item:dark-oak-shillelagh";
  addNode({
    id: shillelaghId,
    label: "Dark Oak Shillelagh",
    type: "item",
    slots: ["Primary"],
    classes: ["druid"],
    skill: "2H Blunt",
    effect: "Beguile Plants (3 charges)",
    magic: true,
    source: "Handy Shillelagh reward (Shrub Marwood, Firiona Vie)",
  });
  addEdge(questId, shillelaghId, "rewards");
  addFactionReward(questId, "Inhabitants of Firiona Vie");
  addFactionReward(questId, "Emerald Warriors");
  addFactionReward(questId, "Storm Guard");
}

// ---------------------------------------------------------------------
// Head of Granin O'Gill
// ---------------------------------------------------------------------
{
  const zoneId = "zone:halas";
  const everfrostId = "zone:everfrost-peaks";
  const giverId = "npc:halas:margyn-mccann";
  addGiver(giverId, "Margyn McCann", zoneId);

  const questId = "quest:head-of-granin-ogill";
  addNode({
    id: questId,
    label: "Head of Granin O'Gill",
    type: "quest",
    description: "Margyn McCann at the Shaman Guild in Halas sends young shamans to kill Granin O'Gill in eastern Everfrost Peaks and return his head, for a spell.",
    classes: ["shaman"],
    minLevel: 5,
    steps: ["Kill Granin O'Gill in eastern Everfrost Peaks and loot his Barbarian Head", "Return the head to Margyn McCann"],
    wiki_title: "Head of Granin O'Gill",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, everfrostId, "located_in");
  addEdge(questId, "spell:spirit-of-bear", "rewards");
  addFactionReward(questId, "Shamen of Justice");
  addFactionReward(questId, "Merchants of Halas");
}

// ---------------------------------------------------------------------
// Heal Yourself
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-qeynos";
  const giverId = "npc:north-qeynos:tonmerk-plorsin";
  addGiver(giverId, "Tonmerk Plorsin", zoneId);

  const questId = "quest:heal-yourself";
  addNode({
    id: questId,
    label: "Heal Yourself",
    type: "quest",
    description: "Tonmerk Plorsin at the Temple of Life in North Qeynos casts a healing spell (65 HP) on anyone who pays him 5 gold.",
    minLevel: 1,
    steps: ["Hail Tonmerk Plorsin at the Temple of Life", "Pay him 5 gold pieces to have a healing spell cast on you"],
    wiki_title: "Heal Yourself",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Healing (Dismal Rage)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-freeport";
  const giverId = "npc:east-freeport:vesagar-nekio";
  addGiver(giverId, "Vesagar Nekio", zoneId);

  const questId = "quest:healing-dismal-rage";
  addNode({
    id: questId,
    label: "Healing (Dismal Rage)",
    type: "quest",
    description: "Vesagar Nekio in East Freeport, requiring Indifferent or better faction with Dismal Rage, casts a light healing spell on anyone who pays him 10 gold.",
    minLevel: 1,
    steps: ["Hail Vesagar Nekio in East Freeport", "Pay him 10 gold pieces to have a healing spell cast on you"],
    wiki_title: "Healing (Dismal Rage)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Healing Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-kaladim";
  const giverId = "npc:north-kaladim:nultal-malfoot";
  addGiver(giverId, "Nultal Malfoot", zoneId);

  const questId = "quest:healing-quest";
  addNode({
    id: questId,
    label: "Healing Quest",
    type: "quest",
    description: "Nultal Malfoot at the Cleric Guild in North Kaladim casts the Healing spell (65 HP) on anyone who pays him 3 gold.",
    minLevel: 1,
    steps: ["Hail Nultal Malfoot at the Cleric Guild", "Pay him 3 gold pieces to have the Healing spell cast on you"],
    wiki_title: "Healing Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Healing Spells from Hendi
// ---------------------------------------------------------------------
{
  const zoneId = "zone:rivervale";
  const giverId = "npc:rivervale:hendi-mrubble";
  addGiver(giverId, "Hendi Mrubble", zoneId);

  const questId = "quest:healing-spells-from-hendi";
  addNode({
    id: questId,
    label: "Healing Spells from Hendi",
    type: "quest",
    description: "Hendi Mrubble in Rivervale casts one of three spells on request: Healing (for a Rivervale piranha tooth), Cure Poison (for three bixie stingers), or Cure Disease (for 10 gold).",
    minLevel: 1,
    steps: [
      "Hand Hendi Mrubble a Rivervale piranha tooth for Healing, three bixie stingers for Cure Poison, or 10 gold for Cure Disease",
    ],
    wiki_title: "Healing Spells from Hendi",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// HEHE Meat Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:grobb";
  const oggokId = "zone:oggok";
  const oceanOfTearsId = "zone:ocean-of-tears";
  const foreignQuarterId = "zone:neriak-foreign-quarter";
  const giverId = "npc:grobb:carver-cagrek";
  addGiver(giverId, "Carver Cagrek", zoneId);

  const questId = "quest:hehe-meat-quest";
  addNode({
    id: questId,
    label: "HEHE Meat Quest",
    type: "quest",
    description: "Carver Cagrek in Grobb trades 3 HEHE Meat (purchased from Chef Dooga in Oggok) and a Tattered Recipe -- obtained through a trading chain with Chef Dooga and The Gobbler in Neriak Foreign Quarter, ending in a drop from Nerbilik in Ocean of Tears -- for a weapon and coin.",
    classes: ["warrior", "shadow knight"],
    minLevel: 20,
    steps: [
      "Buy 3 HEHE Meat from Chef Dooga in Oggok",
      "Trade with Chef Dooga and The Gobbler in Neriak Foreign Quarter to work toward a Tattered Recipe",
      "Kill Nerbilik in Ocean of Tears and loot the Tattered Recipe",
      "Hand the meat and recipe to Carver Cagrek",
    ],
    wiki_title: "HEHE Meat Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, oggokId, "located_in");
  addEdge(questId, oceanOfTearsId, "located_in");
  addEdge(questId, foreignQuarterId, "located_in");

  const cleaverId = "item:grobb-cleaver";
  addNode({
    id: cleaverId,
    label: "Grobb Cleaver",
    type: "item",
    slots: ["Primary"],
    skill: "2H Slashing",
    damage: 15,
    delay: 45,
    stats: { str: 3, dex: 3, int: 3 },
    magic: true,
    source: "HEHE Meat Quest reward (Carver Cagrek, Grobb)",
  });
  addEdge(questId, cleaverId, "rewards");
}

// ---------------------------------------------------------------------
// Helm of the Tracker Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:plane-of-growth";
  const wakeningLandId = "zone:the-wakening-land";
  const giverId = "npc:plane-of-growth:tunarean-earthmelder";
  addGiver(giverId, "Tunarean Earthmelder", zoneId);

  const questId = "quest:helm-of-the-tracker-quest";
  addNode({
    id: questId,
    label: "Helm of the Tracker Quest",
    type: "quest",
    description: "Tunarean Earthmelder in the Plane of Growth, requiring Ranger, Tunare deity, and Indifferent or better faction, trades a Frostgiant Overseer's Head (Frostgiant Overseer, Wakening Land), Kallis' Head (Kallis Stormcaller), and a Smashed and Bloody Protector of Zek's Head (two Protectors of Zek) for a head-slot item.",
    classes: ["ranger"],
    minLevel: 46,
    era: "Velious",
    steps: [
      "Kill the Frostgiant Overseer in the Wakening Land and loot its head",
      "Kill Kallis Stormcaller and loot her head",
      "Kill two Protectors of Zek and loot a Smashed and a Bloody head",
      "Return all four heads to Tunarean Earthmelder",
    ],
    wiki_title: "Helm of the Tracker Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, wakeningLandId, "located_in");

  const helmId = "item:helm-of-the-tracker";
  addNode({
    id: helmId,
    label: "Helm of the Tracker",
    type: "item",
    slots: ["Head"],
    classes: ["ranger"],
    ac: 20,
    stats: { str: 12, sta: 12 },
    resists: { fire: 1, cold: 1 },
    effect: "Truesight",
    magic: true,
    source: "Helm of the Tracker Quest reward (Tunarean Earthmelder, Plane of Growth)",
  });
  addEdge(questId, helmId, "rewards");
}

// ---------------------------------------------------------------------
// Helms of Giant Warriors
// ---------------------------------------------------------------------
{
  const zoneId = "zone:skyshrine";
  const kaelId = "zone:kael-drakkal";
  const giverId = "npc:skyshrine:sentry-kcor";
  addGiver(giverId, "Sentry Kcor", zoneId);

  const questId = "quest:helms-of-giant-warriors";
  addNode({
    id: questId,
    label: "Helms of Giant Warriors",
    type: "quest",
    description: "Sentry Kcor in Skyshrine, accepted at Dubious or better faction, trades Giant Warrior Helmets looted from giants in Kael Drakkel (one or four at a time) for faction standing.",
    minLevel: 45,
    era: "Velious",
    steps: ["Collect Giant Warrior Helmets from giants in Kael Drakkel", "Turn them in to Sentry Kcor in Skyshrine"],
    wiki_title: "Helms of Giant Warriors",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, kaelId, "located_in");
  addFactionReward(questId, "Claws of Veeshan");
  addFactionReward(questId, "Yelinak");
}

// ---------------------------------------------------------------------
// Help Hergor Get Fatter
// ---------------------------------------------------------------------
{
  const zoneId = "zone:grobb";
  const innothuleId = "zone:innothule-swamp";
  const hergorId = "npc:grobb:hergor";
  addGiver(hergorId, "Hergor", zoneId);
  const cagrekId = "npc:grobb:carver-cagrek";
  addGiver(cagrekId, "Carver Cagrek", zoneId);

  const questId = "quest:help-hergor-get-fatter";
  addNode({
    id: questId,
    label: "Help Hergor Get Fatter",
    type: "quest",
    description: "Hergor in Grobb wants a Fungus Dung Pie -- made by Carver Cagrek from 4 Spore Mushrooms collected in Innothule Swamp -- for a random piece of armor and coin. Warrior only.",
    classes: ["warrior"],
    minLevel: 1,
    steps: [
      "Collect 4 Spore Mushrooms in Innothule Swamp",
      "Trade them to Carver Cagrek for a Fungus Dung Pie",
      "Hand the pie to Hergor",
    ],
    wiki_title: "Help Hergor Get Fatter",
  });
  addEdge(hergorId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, innothuleId, "located_in");
  addFactionReward(questId, "DaBashers");
}

// ---------------------------------------------------------------------
// Herb Shop
// ---------------------------------------------------------------------
{
  const zoneId = "zone:paineel";
  const giverId = "npc:paineel:yvonne-ani";
  addGiver(giverId, "Yvonne Ani", zoneId);

  const questId = "quest:herb-shop";
  addNode({
    id: questId,
    label: "Herb Shop",
    type: "quest",
    description: "Yvonne Ani in Paineel talks about her herb shop and the Seekers of Dark Truth necromancer guild -- a lore-only conversation with no turn-in or reward.",
    minLevel: 1,
    steps: ["Hail Yvonne Ani in Paineel and ask about her herb shop"],
    wiki_title: "Herb Shop",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Hero Bracers Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const steamfontId = "zone:steamfont-mountains";
  const giverId = "npc:south-qeynos:grahan-rothkar";
  addGiver(giverId, "Grahan Rothkar", zoneId);

  const questId = "quest:hero-bracers-quest";
  addNode({
    id: questId,
    label: "Hero Bracers Quest",
    type: "quest",
    description: "Grahan Rothkar, in the basement of the South Qeynos arena, requiring Amiable or better faction, sends players to kill Nomala on Wisp Isle for a Pen Key, then the Minotaur Hero in Steamfont Mountains for Minotaur Hero Shackles, for a wrist item. Lore item -- turning in shackles while already holding Hero Bracers loses the shackles with no second reward.",
    classes: ["warrior", "rogue", "monk", "paladin", "shadow knight", "cleric", "ranger", "bard"],
    minLevel: 30,
    steps: [
      "Kill Nomala on Wisp Isle and return the Pen Key to Grahan Rothkar",
      "Kill the Minotaur Hero in Steamfont Mountains and return the Minotaur Hero Shackles to Grahan Rothkar",
    ],
    wiki_title: "Hero Bracers Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, steamfontId, "located_in");

  const bracersId = "item:hero-bracers";
  addNode({
    id: bracersId,
    label: "Hero Bracers",
    type: "item",
    slots: ["Wrist"],
    ac: 9,
    stats: { str: 10 },
    resists: { disease: 5, poison: 5 },
    magic: true,
    lore: true,
    source: "Hero Bracers Quest reward (Grahan Rothkar, South Qeynos)",
  });
  addEdge(questId, bracersId, "rewards");
}

// ---------------------------------------------------------------------
// Hogcaller's Inn
// ---------------------------------------------------------------------
{
  const zoneId = "zone:west-freeport";
  const giverId = "npc:west-freeport:plagus-ladeson";
  addGiver(giverId, "Plagus Ladeson", zoneId);

  const questId = "quest:hogcallers-inn";
  addNode({
    id: questId,
    label: "Hogcaller's Inn",
    type: "quest",
    description: "Plagus Ladeson, at the Steel Warriors' Guild in West Freeport, requiring Amiable or better faction, sends players through a multi-stage delivery chain (White Wine to Lady Shae, a Hog Key to Swin Blackeye, a Sealed Letter and a combined Box with Two Heads to Toala Nehron) for coin and faction.",
    minLevel: 14,
    steps: [
      "Buy White Wine from Swin Blackeye and deliver it to Lady Shae",
      "Loot a Hog Key No 2 from Shintl Lowbrew and deliver it to Swin Blackeye",
      "Take the Sealed Letter from Shintl Lowbrew to Toala Nehron",
      "Combine Shintl Lowbrew's and Hollish Tnoops's heads into a Box with Two Heads and return it to Toala Nehron",
    ],
    wiki_title: "Hogcaller's Inn",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Steel Warriors");
}

// ---------------------------------------------------------------------
// Hollow Skull Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:western-karana";
  const innothuleId = "zone:innothule-swamp";
  const splitpawId = "zone:splitpaw";
  const giverId = "npc:western-karana:yiz-pon";
  addGiver(giverId, "Yiz Pon", zoneId);

  const questId = "quest:hollow-skull-quest";
  addNode({
    id: questId,
    label: "Hollow Skull Quest",
    type: "quest",
    description: "Yiz Pon, on a hillside about halfway across Western Karana, trades a Hollow Skull (from a Splitpaw assassin), a Large Ruby (Lynuga, Innothule Swamp), and a Ruby Pendant (Kurrpok Splitpaw, Splitpaw Lair) -- the rubies combined inside the skull -- for a held item. Restricted to Enchanter, Magician, Necromancer, and Wizard.",
    classes: ["enchanter", "magician", "necromancer", "wizard"],
    minLevel: 30,
    steps: [
      "Kill a Splitpaw assassin for a Hollow Skull",
      "Kill Lynuga in Innothule Swamp for a Large Ruby",
      "Kill Kurrpok Splitpaw in Splitpaw Lair for a Ruby Pendant",
      "Combine both rubies inside the Hollow Skull and turn it in to Yiz Pon",
    ],
    wiki_title: "Hollow Skull Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, innothuleId, "located_in");
  addEdge(questId, splitpawId, "located_in");

  const jeweledSkullId = "item:jeweled-skull";
  addNode({
    id: jeweledSkullId,
    label: "Jeweled Skull",
    type: "item",
    classes: ["enchanter", "magician", "necromancer", "wizard"],
    stats: { int: 5 },
    hp: 20,
    mana: 20,
    magic: true,
    source: "Hollow Skull Quest reward (Yiz Pon, Western Karana)",
  });
  addEdge(questId, jeweledSkullId, "rewards");
}

// ---------------------------------------------------------------------
// Holy Armor Buff Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:daedet-losaren";
  addGiver(giverId, "Daedet Losaren", zoneId);

  const questId = "quest:holy-armor-buff-quest";
  addNode({
    id: questId,
    label: "Holy Armor Buff Quest",
    type: "quest",
    description: "Daedet Losaren, at the Temple of Thunder in South Qeynos, requiring good faction with the Knights of Thunder, casts Holy Armor on anyone who pays him 10 gold.",
    minLevel: 1,
    steps: ["Hail Daedet Losaren at the Temple of Thunder", "Pay him 10 gold pieces to have Holy Armor cast on you"],
    wiki_title: "Holy Armor Buff Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Holy Armor Scroll
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:daedet-losaren";
  addGiver(giverId, "Daedet Losaren", zoneId);

  const questId = "quest:holy-armor-scroll";
  addNode({
    id: questId,
    label: "Holy Armor Scroll",
    type: "quest",
    description: "Daedet Losaren, at the Temple of Thunder in South Qeynos, requiring Indifferent or better faction, trades an 8-slot Beetle Eye Chest of 4 Fire Beetle Eyes and 4 Kerra Isle Beetle eyes for the Holy Armor spell. Cleric and Paladin only.",
    classes: ["cleric", "paladin"],
    minLevel: 2,
    steps: [
      "Combine 4 Fire Beetle Eyes and 4 Kerra Isle Beetle eyes into an 8-slot Beetle Eye Chest",
      "Turn the chest in to Daedet Losaren",
    ],
    wiki_title: "Holy Armor Scroll",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "spell:holy-armor", "rewards");
  addFactionReward(questId, "Knights of Thunder");
  addFactionReward(questId, "Priests of Life");
  addFactionReward(questId, "Guards of Qeynos");
}

// ---------------------------------------------------------------------
// Honey Jum Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:rivervale";
  const mistyId = "zone:misty-thicket";
  const kithicorId = "zone:kithicor-forest";
  const giverId = "npc:rivervale:kizzie-mintopp";
  addGiver(giverId, "Kizzie Mintopp", zoneId);

  const questId = "quest:honey-jum-quest";
  addNode({
    id: questId,
    label: "Honey Jum Quest",
    type: "quest",
    description: "Kizzie Mintopp in Rivervale, after Joogl Honeybugger in Misty Thicket is given a bandage, trades three honeycombs (looted from bixies in Misty Thicket or Kithicor Forest) and coin for a Honey Jum.",
    minLevel: 1,
    steps: [
      "Give Joogl Honeybugger a bandage in Misty Thicket",
      "Collect 3 honeycombs from bixies in Misty Thicket or Kithicor Forest",
      "Turn the honeycombs and coin in to Kizzie Mintopp in Rivervale",
    ],
    wiki_title: "Honey Jum Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, mistyId, "located_in");
  addEdge(questId, kithicorId, "located_in");

  const jumId = "item:honey-jum";
  addNode({ id: jumId, label: "Honey Jum", type: "item", weight: 0.2, lore: true, source: "Honey Jum Quest reward (Kizzie Mintopp, Rivervale)" });
  addEdge(questId, jumId, "rewards");
}

// ---------------------------------------------------------------------
// Honey Mead for Trumpy
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:trumpy-irontoe";
  addGiver(giverId, "Trumpy Irontoe", zoneId);

  const questId = "quest:honey-mead-for-trumpy";
  addNode({
    id: questId,
    label: "Honey Mead for Trumpy",
    type: "quest",
    description: "Trumpy Irontoe, at Fish's Ale in South Qeynos, trades 4 Honey Mead handed in all at once (not multiquestable) for faction standing.",
    minLevel: 1,
    steps: ["Collect 4 Honey Mead", "Hand all 4 to Trumpy Irontoe at once"],
    wiki_title: "Honey Mead for Trumpy",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Circle Of Unseen Hands");
  addFactionReward(questId, "Corrupt Qeynos Guards");
  addFactionReward(questId, "Kane Bayle");
}

// ---------------------------------------------------------------------
// Honeybugger Assassin
// ---------------------------------------------------------------------
{
  const zoneId = "zone:neriak-3rd-gate";
  const mistyId = "zone:misty-thicket";
  const giverId = "npc:neriak-3rd-gate:pazin-punox";
  addGiver(giverId, "Pazin Punox", zoneId);

  const questId = "quest:honeybugger-assassin";
  addNode({
    id: questId,
    label: "Honeybugger Assassin",
    type: "quest",
    description: "Pazin Punox, in the Rogue Guild at Neriak Third Gate, requiring Amiable or better faction, sends Rogues to kill Lil Honeybugger in Misty Thicket and return her head -- the promised 'king's contract' reward turns out to be a joke.",
    classes: ["rogue"],
    minLevel: 15,
    steps: ["Kill Lil Honeybugger in Misty Thicket and loot her Halfling Head", "Return the head to Pazin Punox"],
    wiki_title: "Honeybugger Assassin",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, mistyId, "located_in");
}

// ---------------------------------------------------------------------
// Hopeless Love, Part 1
// ---------------------------------------------------------------------
{
  const zoneId = "zone:west-freeport";
  const easternKaranaId = "zone:eastern-karana";
  const giverId = "npc:west-freeport:plagus-ladeson";
  addGiver(giverId, "Plagus Ladeson", zoneId);

  const questId = "quest:hopeless-love-part-1";
  addNode({
    id: questId,
    label: "Hopeless Love, Part 1",
    type: "quest",
    description: "Plagus Ladeson, in the courtyard behind the Steel Warriors' building in West Freeport, hands out a Sealed Note to deliver to Milea Clothspinner in Eastern Karana, rewarding a cloak.",
    minLevel: 1,
    steps: ["Receive a Sealed Note from Plagus Ladeson", "Deliver it to Milea Clothspinner in Eastern Karana"],
    wiki_title: "Hopeless Love, Part 1",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, easternKaranaId, "located_in");

  const cloakId = "item:grizzly-hide-cloak";
  addNode({ id: cloakId, label: "Grizzly Hide Cloak", type: "item", slots: ["Back"], source: "Hopeless Love, Part 1 reward (Milea Clothspinner, Eastern Karana)" });
  addEdge(questId, cloakId, "rewards");
}

// ---------------------------------------------------------------------
// How the Goblins Stole Frostmas
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-commonlands";
  const runnyeyeId = "zone:runnyeye-citadel";
  const giverId = "npc:east-commonlands:merry-snowgleam";
  addGiver(giverId, "Merry Snowgleam", zoneId);

  const questId = "quest:how-the-goblins-stole-frostmas";
  addNode({
    id: questId,
    label: "How the Goblins Stole Frostmas",
    type: "quest",
    description: "Merry Snowgleam in East Commonlands trades three Frostmas Baubles, looted from goblins in Runnyeye Citadel, for a holiday cookie and gift.",
    minLevel: 1,
    steps: ["Collect 3 Frostmas Baubles from goblins in Runnyeye Citadel", "Return them to Merry Snowgleam"],
    wiki_title: "How the Goblins Stole Frostmas",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, runnyeyeId, "located_in");

  const cookieId = "item:gnome-shaped-cookie";
  addNode({ id: cookieId, label: "Gnome Shaped Cookie", type: "item", source: "How the Goblins Stole Frostmas reward (Merry Snowgleam, East Commonlands)" });
  addEdge(questId, cookieId, "rewards");

  const giftId = "item:holiday-gift";
  addNode({ id: giftId, label: "Holiday Gift", type: "item", source: "How the Goblins Stole Frostmas reward (Merry Snowgleam, East Commonlands)" });
  addEdge(questId, giftId, "rewards");
}

// ---------------------------------------------------------------------
// Hsagra's Wrath Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:skyshrine";
  const kaelId = "zone:kael-drakkal";
  const giverId = "npc:skyshrine:lawyla";
  addGiver(giverId, "Lawyla", zoneId);

  const questId = "quest:hsagras-wrath-quest";
  addNode({
    id: questId,
    label: "Hsagra's Wrath Quest",
    type: "quest",
    description: "Lawyla, atop Skyshrine near Yelinak, requiring Amiable or better faction, trades a Kromzek Spy's Head (Skyshrine's icy path), a Scale of Hsagra (Noble Helssen, Kael Drakkel), and Teachings of Relinar (combined from four runes in the Lexicon of Relinar) for the level 60 Wizard spell Hsagra's Wrath.",
    classes: ["wizard"],
    minLevel: 60,
    era: "Velious",
    steps: [
      "Kill a Kromzek Spy on Skyshrine's icy path for its head",
      "Kill Noble Helssen in Kael Drakkel for a Scale of Hsagra",
      "Combine four Lexicon of Relinar runes into Teachings of Relinar",
      "Return all three items to Lawyla for Hsagra's Wrath",
    ],
    wiki_title: "Hsagra's Wrath Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, kaelId, "located_in");
}

// ---------------------------------------------------------------------
// Hukulk's Love
// ---------------------------------------------------------------------
{
  const zoneId = "zone:grobb";
  const foreignQuarterId = "zone:neriak-foreign-quarter";
  const thirdGateId = "zone:neriak-3rd-gate";
  const giverId = "npc:grobb:hukulk";
  addGiver(giverId, "Hukulk", zoneId);

  const questId = "quest:hukulks-love";
  addNode({
    id: questId,
    label: "Hukulk's Love",
    type: "quest",
    description: "Hukulk, of the Shadowknights of Night Keep in Grobb, requiring Amiable or better faction, trades Guard Lumpin's Troll Head (Guard Lumpin, Neriak Foreign Quarter) and Happy Love Bracers (Ratraz, Neriak Third Gate) for a helm. Warrior, Cleric, Paladin, and Shadow Knight only.",
    classes: ["warrior", "cleric", "paladin", "shadow knight"],
    minLevel: 20,
    steps: [
      "Kill Guard Lumpin in Neriak Foreign Quarter and loot his troll head",
      "Kill Ratraz in Neriak Third Gate and loot the Happy Love Bracers",
      "Return both to Hukulk",
    ],
    wiki_title: "Hukulk's Love",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, foreignQuarterId, "located_in");
  addEdge(questId, thirdGateId, "located_in");

  const helmId = "item:helm-of-hukulk";
  addNode({
    id: helmId,
    label: "Helm of Hukulk",
    type: "item",
    classes: ["warrior", "cleric", "paladin", "shadow knight"],
    slots: ["Head"],
    ac: 5,
    stats: { str: 3, agi: 3 },
    magic: true,
    source: "Hukulk's Love reward (Hukulk, Grobb)",
  });
  addEdge(questId, helmId, "rewards");
  addFactionReward(questId, "Shadowknights of Night Keep");
}

// ---------------------------------------------------------------------
// Hungry Deputy
// ---------------------------------------------------------------------
{
  const zoneId = "zone:rivervale";
  const mistyId = "zone:misty-thicket";
  const giverId = "npc:rivervale:daleen-leafsway";
  addGiver(giverId, "Daleen Leafsway", zoneId);

  const questId = "quest:hungry-deputy";
  addNode({
    id: questId,
    label: "Hungry Deputy",
    type: "quest",
    description: "Daleen Leafsway, in the garden outside the Druid Guild in Rivervale, requiring Amiable or better faction, hands out a Sack of Turnips to deliver to Deputy Eigon in Misty Thicket, for coin and experience.",
    minLevel: 1,
    steps: ["Receive a Sack of Turnips from Daleen Leafsway", "Deliver it to Deputy Eigon in Misty Thicket"],
    wiki_title: "Hungry Deputy",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, mistyId, "located_in");
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 051 complete: added 25 more quests from GitHub issue #26's checklist");
