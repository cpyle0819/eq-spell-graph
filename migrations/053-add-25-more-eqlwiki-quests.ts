/**
 * Migration 053: 25 more quests off GitHub issue #26's checklist -- the
 * remainder of H (Hurrieta's Tunic Quest), all of I, all of J, and the
 * start of K (Karana Clovers through Kilij's Plans). Researched directly
 * against eqlwiki.com, following decisions/eqlwiki-quest-research-method.md.
 *
 * Skipped this pass (left unchecked on the issue, not modeled):
 * - Iksar Prisoner Quest -- its own page calls it "the 'bad ending' of what
 *   begins as the Trooper Scale Bracers quest" (part of the still-unchecked
 *   Trooper Scale Armor Quests progression) and cites an "Old Thread on
 *   this quest being 'Unsolved'" -- too tied into an unmodeled questline
 *   and too uncertain to model standalone.
 *
 * Deferred to the Questlines section, not modeled as a flat quest:
 * - Ivy Etched Armor Quests -- two Kithicor Forest givers (Gandari, Leaf
 *   Falldim), 7 independent Ranger armor pieces total, same shape as Armor
 *   of Ro. Doesn't count against this batch's 25-standalone cap.
 *
 * Already fully covered by existing content, checked off with no new
 * migration content (doesn't count against the cap either way):
 * - Incandescent Mask quest -- same giver (Sultin, Temple of Solusek Ro),
 *   same item stats (AC 3, INT +5, CHA +7, WT 0.4, Small) as the
 *   `item:incandescent-mask` migration 028's Incandescent Armor Quests
 *   already added. This checklist entry is just a duplicate title for
 *   content already in the graph.
 *
 * Deliberately NOT modeled (consistent with every migration so far):
 * - Every vague/random reward, including "choice of one from a list"
 *   mechanics: Hurrieta's Tunic Quest's "a piece of Patchwork armor" (the
 *   named-and-stated Rat Shaped Ring alternative IS modeled), Ice Goblin
 *   Necklaces' six-item supply menu, Illegible Cantrip Quest's and
 *   Illegible Scrolls' random spell-from-a-list rewards (same
 *   choice-of-spell shape as migration 051's Healing Spells from Hendi),
 *   Illegible Scrolls (Felwithe)'s four-item supply menu, Ivan McMannus'
 *   Remains' "random minor item" (confirmed via a second fetch that the
 *   page's headline Purse/Wrist Pouch listing are themselves just examples
 *   of that random pool, not a guaranteed double reward), Karana Clovers'
 *   spell-or-leather-or-cloak menu, and Karana's Blessing's random spell.
 * - Coin rewards throughout -- no coin field on `quest` nodes.
 * - Negative faction changes throughout -- `rewards` only models positive
 *   rewards (decisions/quest-reward-modeling.md).
 * - Only the quest-starting giver becomes an `npc` node with a `starts`
 *   edge; other named NPCs a quest chain routes through (Garuc Anehm,
 *   Perrir Zexus, Wenglawks Kkeak, Minda, Deputy Lowmot, etc.) stay prose
 *   in `steps`, same as migration 051's Hogcaller's Inn -- but the zones
 *   they're in still earn a `located_in` edge per decisions/quest-reward-
 *   modeling.md's broadened rule.
 * - Farming-only zones that aren't the giver's zone and don't exist in
 *   this graph (Kerra Isle Beetles aside): Dreadlands (Icestar's Eve
 *   Snowdrift Feast's Chilled Berries), Warsliks Woods (Keeper Rott's
 *   Pages' notepages), Siren's Grotto (Kelorek's Scales' shell necklace),
 *   Kaesora (Key to Charasis Quest's vampire's fang) -- left as prose only,
 *   no zone added, since none of them are the quest's own giver's zone
 *   (the bar this issue's guardrails actually set).
 * - Class/race restrictions the wiki states only informally, not as a
 *   resolved abbreviation list: Illegible Scrolls' "Casters and Priests"
 *   (ambiguous which of the 12 classes that resolves to) and Keeper Rott's
 *   Pages' Necromancer note (the page itself says "you don't have to be a
 *   necromancer to complete the quest") are left as prose only, `classes`
 *   unset.
 *
 * Innoruuk Recommendation has two distinct named starting NPCs (Savarixsa
 * Zexus in Grobb, Saxarivza Zaxun in East Freeport) rather than one NPC
 * with an uncertain spawn zone, so both get `starts` edges. Illegible
 * Scrolls' single NPC (Lozani) is quoted as "High Keep (or East Freeport)"
 * -- read as one NPC with an uncertain spawn location, not two -- so it
 * gets one `starts` edge (High Keep) plus a `located_in` edge for the
 * alternate zone, with the alternate noted in `description`.
 *
 * Jillin's Stew's own page states it requires having completed "Reebo's
 * Carrots" first (still unchecked on the issue) -- noted in `description`
 * only, not modeled as its own quest this batch.
 *
 * Deferred, not researched this batch: Knight Card Quest onward (kept this
 * batch at exactly 25 standalone quests, the issue's cap).
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
// Hurrieta's Tunic Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const aqueductsId = "zone:qeynos-catacombs";
  const giverId = "npc:south-qeynos:ton-firepride";
  addGiver(giverId, "Ton Firepride", zoneId);

  const questId = "quest:hurrietas-tunic-quest";
  addNode({
    id: questId,
    label: "Hurrieta's Tunic Quest",
    type: "quest",
    description: "Ton Firepride in South Qeynos trades Hurrieta's Tunic (received from completing Faren's Tacklebox) for Hurrieta's Bloody Dress, then Garuc Anehm in the Qeynos Aqueducts trades that dress for coin, experience, and a piece of Patchwork armor or a Rat Shaped Ring.",
    minLevel: 1,
    steps: [
      "Complete Faren's Tacklebox to receive Hurrieta's Tunic",
      "Give Hurrieta's Tunic to Ton Firepride in South Qeynos, receiving Hurrieta's Bloody Dress",
      "Travel to the Qeynos Aqueducts and give the dress to Garuc Anehm",
    ],
    wiki_title: "Hurrieta's Tunic Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, aqueductsId, "located_in");

  const ringId = "item:rat-shaped-ring";
  addNode({
    id: ringId,
    label: "Rat Shaped Ring",
    type: "item",
    resists: { disease: 10, poison: 10 },
    source: "Hurrieta's Tunic Quest reward (Garuc Anehm, Qeynos Aqueducts)",
  });
  addEdge(questId, ringId, "rewards");
}

// ---------------------------------------------------------------------
// Ice Goblin Beads
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const everfrostId = "zone:everfrost-peaks";
  const giverId = "npc:erudin:josper-kenshed";
  addGiver(giverId, "Josper Kenshed", zoneId);

  const questId = "quest:ice-goblin-beads";
  addNode({
    id: questId,
    label: "Ice Goblin Beads",
    type: "quest",
    description: "Josper Kenshed, in the Tower of the Crimson Hands in Erudin Palace, requiring Amiable or better faction, trades a Bag of Ice Necklaces -- 6 Goblin Ice Necklaces combined in an Empty Bag he provides -- for a caster weapon and coin. Enchanter, Magician, Necromancer, and Wizard only.",
    classes: ["enchanter", "magician", "necromancer", "wizard"],
    minLevel: 1,
    steps: [
      "Receive an Empty Bag from Josper Kenshed",
      "Collect 6 Goblin Ice Necklaces from ice goblins",
      "Combine them into a Bag of Ice Necklaces and turn it in to Josper Kenshed",
    ],
    wiki_title: "Ice Goblin Beads",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, everfrostId, "located_in");

  const staffId = "item:servants-staff";
  addNode({
    id: staffId,
    label: "Servant's Staff",
    type: "item",
    slots: ["Primary"],
    classes: ["necromancer", "wizard", "magician", "enchanter"],
    skill: "1H Blunt",
    damage: 4,
    delay: 28,
    mana: 5,
    weight: 8.5,
    size: "Large",
    source: "Ice Goblin Beads reward (Josper Kenshed, Erudin)",
  });
  addEdge(questId, staffId, "rewards");
}

// ---------------------------------------------------------------------
// Ice Goblin Necklaces
// ---------------------------------------------------------------------
{
  const zoneId = "zone:everfrost-peaks";
  const giverId = "npc:everfrost-peaks:lysbith-mcnaff";
  addGiver(giverId, "Lysbith McNaff", zoneId);

  const questId = "quest:ice-goblin-necklaces";
  addNode({
    id: questId,
    label: "Ice Goblin Necklaces",
    type: "quest",
    description: "Lysbith McNaff, at the Pit of Doom in Everfrost Peaks, requiring Indifferent or better faction, trades a Goblin Ice Necklace -- looted from ice goblin whelps or scouts -- for a random minor supply item and coin.",
    minLevel: 2,
    steps: ["Kill an ice goblin whelp or scout in Everfrost Peaks for a Goblin Ice Necklace", "Turn it in to Lysbith McNaff"],
    wiki_title: "Ice Goblin Necklaces",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Icestar's Eve Snowdrift Feast
// ---------------------------------------------------------------------
{
  const zoneId = "zone:northern-karana";
  const everfrostId = "zone:everfrost-peaks";
  const easternWastesId = "zone:eastern-wastes";
  const giverId = "npc:northern-karana:quartermaster-nellian";
  addGiver(giverId, "Quartermaster Nellian", zoneId);

  const questId = "quest:icestars-eve-snowdrift-feast";
  addNode({
    id: questId,
    label: "Icestar's Eve Snowdrift Feast",
    type: "quest",
    description: "A seasonal 'Cracking of the Icestar' event quest -- Quartermaster Nellian in Northern Karana trades Mammoth Meat (from mammoths in Eastern Wastes or Everfrost Peaks), Snow Bunny Stew (baked), and Chilled Berries (from a tundra yeti in Dreadlands) for Aurillias' Winter Broth and a Holiday Gift.",
    minLevel: 1,
    steps: [
      "Collect Mammoth Meat from a mammoth in Eastern Wastes or Everfrost Peaks",
      "Bake Snow Bunny Stew",
      "Collect Chilled Berries from a tundra yeti in Dreadlands",
      "Turn all three in to Quartermaster Nellian",
    ],
    wiki_title: "Icestar's Eve Snowdrift Feast",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, everfrostId, "located_in");
  addEdge(questId, easternWastesId, "located_in");

  const brothId = "item:aurillias-winter-broth";
  addNode({ id: brothId, label: "Aurillias' Winter Broth", type: "item", source: "Icestar's Eve Snowdrift Feast reward (Quartermaster Nellian, Northern Karana)" });
  addEdge(questId, brothId, "rewards");

  const giftId = "item:holiday-gift";
  addNode({ id: giftId, label: "Holiday Gift", type: "item", source: "Icestar's Eve Snowdrift Feast reward (Quartermaster Nellian, Northern Karana)" });
  addEdge(questId, giftId, "rewards");
}

// ---------------------------------------------------------------------
// Ilanic's Scroll
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const toxxuliaId = "zone:toxxulia-forest";
  const giverId = "npc:erudin:josper-kenshed";
  addGiver(giverId, "Josper Kenshed", zoneId);

  const questId = "quest:ilanics-scroll";
  addNode({
    id: questId,
    label: "Ilanic's Scroll",
    type: "quest",
    description: "Josper Kenshed, in Erudin Palace, requiring Amiable or better faction, trades Half of a Spell -- looted from A Kobold Caster, a rare spawn in Toxxulia Forest -- for the Wizard spell Column of Frost and coin.",
    classes: ["wizard"],
    minLevel: 5,
    steps: ["Kill A Kobold Caster in Toxxulia Forest for Half of a Spell", "Turn it in to Josper Kenshed"],
    wiki_title: "Ilanic's Scroll",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, toxxuliaId, "located_in");
  addEdge(questId, "spell:column-of-frost", "rewards");
}

// ---------------------------------------------------------------------
// Illegible Cantrip Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:west-freeport";
  const commonlandsId = "zone:east-commonlands";
  const giverId = "npc:west-freeport:tara-neklene";
  addGiver(giverId, "Tara Neklene", zoneId);

  const questId = "quest:illegible-cantrip-quest";
  addNode({
    id: questId,
    label: "Illegible Cantrip Quest",
    type: "quest",
    description: "Tara Neklene, at the Academy of Arcane Sciences in West Freeport, trades an Illegible Cantrip (looted from an orc apprentice in East Commonlands) for a random Elementalkin spell, minor items, and coin. A second phase, requiring Amiable or better faction with the Arcane Scientists, trades an Illegible Scroll (from orc oracles) for another random Elementalkin spell.",
    minLevel: 5,
    steps: [
      "Kill an orc apprentice in East Commonlands for an Illegible Cantrip",
      "Turn it in to Tara Neklene",
      "At Amiable or better faction, turn in an Illegible Scroll from an orc oracle for a second reward",
    ],
    wiki_title: "Illegible Cantrip Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, commonlandsId, "located_in");
}

// ---------------------------------------------------------------------
// Illegible Scrolls
// ---------------------------------------------------------------------
{
  const zoneId = "zone:high-keep";
  const eastFreeportId = "zone:east-freeport";
  const giverId = "npc:high-keep:lozani";
  addGiver(giverId, "Lozani", zoneId);

  const questId = "quest:illegible-scrolls";
  addNode({
    id: questId,
    label: "Illegible Scrolls",
    type: "quest",
    description: "Lozani, in High Keep (occasionally found in East Freeport instead), requiring Amiable or better faction, trades either an illegible scroll and 4 gold (from orc oracles) or two illegible cantrips (from orc apprentices) for a random low-level spell. Restricted to Casters and Priests.",
    minLevel: 5,
    steps: ["Collect an illegible scroll from an orc oracle, or two illegible cantrips from orc apprentices", "Turn them in to Lozani for a random spell"],
    wiki_title: "Illegible Scrolls",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, eastFreeportId, "located_in");
}

// ---------------------------------------------------------------------
// Illegible Scrolls (Felwithe)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:northern-felwithe";
  const crushboneId = "zone:crushbone";
  const giverId = "npc:northern-felwithe:general-jyleel";
  addGiver(giverId, "General Jyleel", zoneId);

  const questId = "quest:illegible-scrolls-felwithe";
  addNode({
    id: questId,
    label: "Illegible Scrolls (Felwithe)",
    type: "quest",
    description: "General Jyleel, downstairs in the Paladin Guild Hall in Northern Felwithe, trades an Illegible Scroll -- a random drop from an Orc Oracle in Crushbone -- for a random minor supply item.",
    minLevel: 9,
    steps: ["Kill an Orc Oracle in Crushbone for an Illegible Scroll", "Turn it in to General Jyleel"],
    wiki_title: "Illegible Scrolls (Felwithe)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, crushboneId, "located_in");
}

// ---------------------------------------------------------------------
// Illusion: Iksar Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:firiona-vie";
  const lakeOfIllOmenId = "zone:lake-of-ill-omen";
  const swampId = "zone:swamp-of-no-hope";
  const giverId = "npc:firiona-vie:luminare-pasinia";
  addGiver(giverId, "Luminare Pasinia", zoneId);

  const questId = "quest:illusion-iksar-quest";
  addNode({
    id: questId,
    label: "Illusion: Iksar Quest",
    type: "quest",
    description: "Luminare Pasinia in Firiona Vie, requiring Enchanter, trades powder of Nok (froglok nok shaman, Firiona Vie), heart of ice (icebone skeletons, Lake of Ill Omen), a Ton warrior totem (frogloks, Swamp of No Hope), and a sabertooth tiger mane (Lake of Ill Omen) for the Visions of Sebilite scroll, which scribes as Illusion: Iksar.",
    classes: ["enchanter"],
    minLevel: 25,
    steps: [
      "Collect powder of Nok from a froglok nok shaman in Firiona Vie",
      "Collect a heart of ice from an icebone skeleton in Lake of Ill Omen",
      "Collect a Ton warrior totem from a froglok in Swamp of No Hope",
      "Collect a sabertooth tiger mane from a sabertooth tiger in Lake of Ill Omen",
      "Turn in all four to Luminare Pasinia for the Visions of Sebilite scroll",
    ],
    wiki_title: "Illusion: Iksar Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, lakeOfIllOmenId, "located_in");
  addEdge(questId, swampId, "located_in");
  addEdge(questId, "spell:illusion-iksar", "rewards");
  addFactionReward(questId, "Inhabitants of Firiona Vie");
  addFactionReward(questId, "Emerald Warriors");
  addFactionReward(questId, "Storm Guard");
}

// ---------------------------------------------------------------------
// Illweed Parchment Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-cabilis";
  const lakeOfIllOmenId = "zone:lake-of-ill-omen";
  const giverId = "npc:east-cabilis:war-historian-kobl";
  addGiver(giverId, "War Historian Kobl", zoneId);

  const questId = "quest:illweed-parchment-quest";
  addNode({
    id: questId,
    label: "Illweed Parchment Quest",
    type: "quest",
    description: "War Historian Kobl, at the Warriors Guild in East Cabilis, trades four illweed reeds -- fished from Lake of Ill Omen -- for an Illweed Parchment and faction standing.",
    minLevel: 1,
    steps: ["Fish 4 illweed reeds from Lake of Ill Omen", "Turn them in to War Historian Kobl"],
    wiki_title: "Illweed Parchment Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, lakeOfIllOmenId, "located_in");

  const parchmentId = "item:illweed-parchment";
  addNode({ id: parchmentId, label: "Illweed Parchment", type: "item", weight: 0.1, size: "Tiny", source: "Illweed Parchment Quest reward (War Historian Kobl, East Cabilis)" });
  addEdge(questId, parchmentId, "rewards");
  addFactionReward(questId, "Legion of Cabilis");
  addFactionReward(questId, "Cabilis Residents");
  addFactionReward(questId, "Scaled Mystics");
  addFactionReward(questId, "Crusaders of Greenmist");
  addFactionReward(questId, "Swift Tails");
}

// ---------------------------------------------------------------------
// Indaria's Doll
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const aqueductsId = "zone:qeynos-catacombs";
  const erudinId = "zone:erudin";
  const giverId = "npc:south-qeynos:indaria";
  addGiver(giverId, "Indaria", zoneId);

  const questId = "quest:indarias-doll";
  addNode({
    id: questId,
    label: "Indaria's Doll",
    type: "quest",
    description: "Indaria, at the Office of the People behind the bank in South Qeynos, trades A Doll -- looted off a shark in the Qeynos Aqueducts, near the South Qeynos docks, in Erudin harbor, or near the Freeport Harbor -- for a Velvet Choker, coin, and experience.",
    classes: ["bard", "cleric", "druid", "enchanter", "magician", "necromancer", "shaman", "wizard"],
    minLevel: 15,
    steps: ["Kill a shark for A Doll", "Turn it in to Indaria in South Qeynos"],
    wiki_title: "Indaria's Doll",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, aqueductsId, "located_in");
  addEdge(questId, erudinId, "located_in");

  const chokerId = "item:velvet-choker";
  addNode({
    id: chokerId,
    label: "Velvet Choker",
    type: "item",
    slots: ["Neck"],
    ac: 3,
    hp: 5,
    weight: 0.5,
    size: "Small",
    source: "Indaria's Doll reward (Indaria, South Qeynos)",
  });
  addEdge(questId, chokerId, "rewards");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Antonius Bayle");
  addFactionReward(questId, "Merchants of Qeynos");
}

// ---------------------------------------------------------------------
// Inert Potion Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const giverId = "npc:erudin:toresian-fhabel";
  addGiver(giverId, "Toresian Fhabel", zoneId);

  const questId = "quest:inert-potion-quest";
  addNode({
    id: questId,
    label: "Inert Potion Quest",
    type: "quest",
    description: "Toresian Fhabel, in Erudin Palace, requiring Amiable or better faction, hands out an Inert Potion to deliver to either Slansin or Slansin Denvin at the Vials of Vitality shop downstairs -- each choice adjusts a different set of Erudin factions.",
    minLevel: 1,
    steps: ["Receive an Inert Potion from Toresian Fhabel", "Deliver it to Slansin or Slansin Denvin at Vials of Vitality"],
    wiki_title: "Inert Potion Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Innoruuk Recommendation
// ---------------------------------------------------------------------
{
  const grobbId = "zone:grobb";
  const eastFreeportId = "zone:east-freeport";
  const thirdGateId = "zone:neriak-3rd-gate";
  const nektulosId = "zone:nektulos-forest";
  const grobbGiverId = "npc:grobb:savarixsa-zexus";
  addGiver(grobbGiverId, "Savarixsa Zexus", grobbId);
  const freeportGiverId = "npc:east-freeport:saxarivza-zaxun";
  addGiver(freeportGiverId, "Saxarivza Zaxun", eastFreeportId);

  const questId = "quest:innoruuk-recommendation";
  addNode({
    id: questId,
    label: "Innoruuk Recommendation",
    type: "quest",
    description: "Savarixsa Zexus in the Grobb Shaman guild (requiring Dubious or better faction), or Saxarivza Zaxun in the tunnels under East Freeport, hands out a note for Perrir Zexus in Neriak Third Gate. Perrir then trades a Leatherfoot Raider Skullcap, dropped by Leatherfoot halflings in Nektulos Forest, for minor coin and faction.",
    minLevel: 1,
    steps: [
      "Hail Savarixsa Zexus (Grobb) or Saxarivza Zaxun (East Freeport) and say 'I am devoted to Innoruuk'",
      "Deliver the note received to Perrir Zexus in Neriak Third Gate",
      "Kill a Leatherfoot halfling in Nektulos Forest for a Leatherfoot Raider Skullcap",
      "Turn the skullcap in to Perrir Zexus",
    ],
    wiki_title: "Innoruuk Recommendation",
  });
  addEdge(grobbGiverId, questId, "starts");
  addEdge(freeportGiverId, questId, "starts");
  addEdge(questId, grobbId, "starts_in");
  addEdge(questId, eastFreeportId, "starts_in");
  addEdge(questId, grobbId, "located_in");
  addEdge(questId, eastFreeportId, "located_in");
  addEdge(questId, thirdGateId, "located_in");
  addEdge(questId, nektulosId, "located_in");
}

// ---------------------------------------------------------------------
// Ivan McMannus' Remains
// ---------------------------------------------------------------------
{
  const zoneId = "zone:halas";
  const everfrostId = "zone:everfrost-peaks";
  const giverId = "npc:halas:renth-mclanis";
  addGiver(giverId, "Renth McLanis", zoneId);

  const questId = "quest:ivan-mcmannus-remains";
  addNode({
    id: questId,
    label: "Ivan McMannus' Remains",
    type: "quest",
    description: "Renth McLanis, the Warrior Guildmaster at McDaniels Smokes & Spirits in Halas, trades a Box of Remains -- a Barbarian Femur, Jaw, Skull, and Rib, ground spawns found diving beneath the ice in an Everfrost Peaks river -- for a random minor item and coin.",
    minLevel: 10,
    steps: [
      "Dive beneath the frozen river in Everfrost Peaks for a Barbarian Femur, Jaw, Skull, and Rib",
      "Combine them into a Box of Remains",
      "Turn it in to Renth McLanis",
    ],
    wiki_title: "Ivan McMannus' Remains",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, everfrostId, "located_in");
}

// ---------------------------------------------------------------------
// Jagged Pine Crook Staff
// ---------------------------------------------------------------------
{
  const zoneId = "zone:surefall-glade";
  const blackburrowId = "zone:blackburrow";
  const giverId = "npc:surefall-glade:corun-finisc";
  addGiver(giverId, "Corun Finisc", zoneId);

  const questId = "quest:jagged-pine-crook-staff";
  addNode({
    id: questId,
    label: "Jagged Pine Crook Staff",
    type: "quest",
    description: "Corun Finisc in Surefall Glade, requiring Amiable or better faction, trades the Bottom and Top of a Broken Staff -- an extremely rare drop from a gnoll hunter wandering between Surefall Glade and Blackburrow -- for the Jaggedpine Crook. Druid and Ranger only.",
    classes: ["druid", "ranger"],
    minLevel: 5,
    steps: ["Kill a gnoll hunter between Surefall Glade and Blackburrow for the Bottom and Top of Broken Staff", "Turn both in to Corun Finisc"],
    wiki_title: "Jagged Pine Crook Staff",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, blackburrowId, "located_in");

  const crookId = "item:jaggedpine-crook";
  addNode({
    id: crookId,
    label: "Jaggedpine Crook",
    type: "item",
    slots: ["Primary"],
    classes: ["druid", "ranger"],
    skill: "1H Blunt",
    damage: 5,
    delay: 31,
    stats: { str: 1 },
    hp: 5,
    resists: { fire: 5 },
    source: "Jagged Pine Crook Staff reward (Corun Finisc, Surefall Glade)",
  });
  addEdge(questId, crookId, "rewards");
}

// ---------------------------------------------------------------------
// Jillin's Stew
// ---------------------------------------------------------------------
{
  const zoneId = "zone:rivervale";
  const giverId = "npc:rivervale:blinza-toepopal";
  addGiver(giverId, "Blinza Toepopal", zoneId);

  const questId = "quest:jillins-stew";
  addNode({
    id: questId,
    label: "Jillin's Stew",
    type: "quest",
    description: "Blinza Toepopal in Rivervale, after completing Reebo's Carrots, hands out Carrot Stew to deliver to Deputy Lowmot, also in Rivervale, for coin, experience, and faction. Repeatable.",
    minLevel: 1,
    steps: ["Complete Reebo's Carrots", "Receive Carrot Stew from Blinza Toepopal", "Deliver it to Deputy Lowmot"],
    wiki_title: "Jillin's Stew",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Guardians of the Vale");
  addFactionReward(questId, "Merchants of Rivervale");
}

// ---------------------------------------------------------------------
// Journal Strongbox
// ---------------------------------------------------------------------
{
  const zoneId = "zone:west-freeport";
  const eastFreeportId = "zone:east-freeport";
  const oceanOfTearsId = "zone:ocean-of-tears";
  const giverId = "npc:west-freeport:nusk-treton";
  addGiver(giverId, "Nusk Treton", zoneId);

  const questId = "quest:journal-strongbox";
  addNode({
    id: questId,
    label: "Journal Strongbox",
    type: "quest",
    description: "Nusk Treton, at the Magic Users Guild in West Freeport, requiring Amiable or better faction, sends players to Lenka Stoutheart at the Seafarer's Roost in East Freeport for directions to a Journal Strongbox in the Ocean of Tears, tradeable for coin and experience.",
    minLevel: 1,
    steps: [
      "Speak with Lenka Stoutheart at the Seafarer's Roost in East Freeport",
      "Retrieve the Journal Strongbox from the Ocean of Tears",
      "Return it to Nusk Treton",
    ],
    wiki_title: "Journal Strongbox",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, eastFreeportId, "located_in");
  addEdge(questId, oceanOfTearsId, "located_in");
}

// ---------------------------------------------------------------------
// Karana Clovers
// ---------------------------------------------------------------------
{
  const zoneId = "zone:halas";
  const giverId = "npc:halas:jinkus-felligan";
  addGiver(giverId, "Jinkus Felligan", zoneId);

  const questId = "quest:karana-clovers";
  addNode({
    id: questId,
    label: "Karana Clovers",
    type: "quest",
    description: "Jinkus Felligan, at the Temple of the Tribunal in Halas, requiring Amiable or better faction, runs a repeatable delivery chain -- a tattered note from Holana Oleary to Einhorst McMannus, then a Karana Clover Shipment from Einhorst back to Holana -- for coin plus a random low-level Shaman spell, a piece of leather gear, or possibly a Polar Bear Cloak.",
    minLevel: 1,
    steps: [
      "Receive a tattered note from Holana Oleary",
      "Deliver it to Einhorst McMannus",
      "Receive a Karana Clover Shipment from Einhorst",
      "Return it to Holana Oleary",
    ],
    wiki_title: "Karana Clovers",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Karana's Blessing
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const westernKaranaId = "zone:western-karana";
  const giverId = "npc:south-qeynos:gehna-solbenya";
  addGiver(giverId, "Gehna Solbenya", zoneId);

  const questId = "quest:karanas-blessing";
  addNode({
    id: questId,
    label: "Karana's Blessing",
    type: "quest",
    description: "Gehna Solbenya, in the Knights of Thunder building in South Qeynos, sends players to deliver a Full Chalice to Minda, a follower of Karana on a farm along the southern edge of the Western Plains of Karana, then return with the empty chalice for a random low-level spell. Repeatable.",
    minLevel: 1,
    steps: [
      "Receive the Full Chalice from Gehna Solbenya",
      "Deliver it to Minda in the Western Plains of Karana",
      "Return the empty chalice to Gehna Solbenya",
    ],
    wiki_title: "Karana's Blessing",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, westernKaranaId, "located_in");
}

// ---------------------------------------------------------------------
// Keeper Rott's Pages
// ---------------------------------------------------------------------
{
  const zoneId = "zone:west-cabilis";
  const giverId = "npc:west-cabilis:keeper-rott";
  addGiver(giverId, "Keeper Rott", zoneId);

  const questId = "quest:keeper-rotts-pages";
  addNode({
    id: questId,
    label: "Keeper Rott's Pages",
    type: "quest",
    description: "Keeper Rott, in an alcove near the West Cabilis arena, requiring high Amiable faction with the Brood of Kotiz, trades 4 Illegible Notes (Notepages 1-4 of Rott, dropped by Goblin Soothsayers and Goblin Spirit Callers) for the spell Intensify Death. You don't have to be a Necromancer to complete it, though the reward favors that class.",
    minLevel: 18,
    steps: ["Collect Notepages 1-4 of Rott from goblin soothsayers and spirit callers", "Turn all 4 in to Keeper Rott"],
    wiki_title: "Keeper Rott's Pages",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "spell:intensify-death", "rewards");
  addFactionReward(questId, "Brood of Kotiz");
}

// ---------------------------------------------------------------------
// Kelorek's Scales
// ---------------------------------------------------------------------
{
  const zoneId = "zone:cobalt-scar";
  const giverId = "npc:cobalt-scar:qarrgy-scallopgobbler";
  addGiver(giverId, "Qarrgy Scallopgobbler", zoneId);

  const questId = "quest:keloreks-scales";
  addNode({
    id: questId,
    label: "Kelorek's Scales",
    type: "quest",
    description: "Qarrgy Scallopgobbler in Cobalt Scar trades an Ornately Runed Shell Necklace (a rare neriad-weaver drop from Siren's Grotto), Sea Dragon Scales (dropped by Kelorek`Dar), and a crafted Fine Plate Bracer for a Sea Dragonscale Bracer.",
    classes: ["bard", "cleric", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"],
    minLevel: 50,
    steps: [
      "Loot an Ornately Runed Shell Necklace from a neriad weaver in Siren's Grotto",
      "Kill Kelorek`Dar for Sea Dragon Scales",
      "Craft a Fine Plate Bracer",
      "Turn all three in to Qarrgy Scallopgobbler in Cobalt Scar",
    ],
    wiki_title: "Kelorek's Scales",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const braceletId = "item:sea-dragonscale-bracer";
  addNode({
    id: braceletId,
    label: "Sea Dragonscale Bracer",
    type: "item",
    classes: ["bard", "cleric", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"],
    ac: 10,
    mana: 20,
    resists: { fire: 10, cold: 10, magic: 5 },
    source: "Kelorek's Scales reward (Qarrgy Scallopgobbler, Cobalt Scar)",
  });
  addEdge(questId, braceletId, "rewards");
  addFactionReward(questId, "Othmir");
}

// ---------------------------------------------------------------------
// Kevlin Diggs' Debt
// ---------------------------------------------------------------------
{
  const zoneId = "zone:rivervale";
  const giverId = "npc:rivervale:ace-slighthand";
  addGiver(giverId, "Ace Slighthand", zoneId);

  const questId = "quest:kevlin-diggs-debt";
  addNode({
    id: questId,
    label: "Kevlin Diggs' Debt",
    type: "quest",
    description: "Ace Slighthand, in the Fools Gold casino above the rogues' guild in Rivervale, requiring better than Apprehensive faction, sends players to retrieve Kevlin's Debt -- guarded by an NPC named Mangler, not recommended to kill -- for coin and experience.",
    minLevel: 1,
    steps: ["Retrieve Kevlin's Debt", "Return it to Ace Slighthand"],
    wiki_title: "Kevlin Diggs' Debt",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Key to Charasis Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:swamp-of-no-hope";
  const lakeOfIllOmenId = "zone:lake-of-ill-omen";
  const giverId = "npc:swamp-of-no-hope:dugroz";
  addGiver(giverId, "Dugroz", zoneId);

  const questId = "quest:key-to-charasis-quest";
  addNode({
    id: questId,
    label: "Key to Charasis Quest",
    type: "quest",
    description: "Dugroz in the Swamp of No Hope trades a Xalgozian Fang (dropped by Xalgoz in Kaesora) and a Jade Chokidai Prod (dropped by the Chancellor of Di`Zok at the Sarnak fort by Lake of Ill Omen) for a soulbound Key to Charasis. Hand the items to Dugroz, not his nearby pet.",
    minLevel: 40,
    steps: [
      "Kill Xalgoz in Kaesora for a Xalgozian Fang",
      "Kill the Chancellor of Di`Zok at the Sarnak fort near Lake of Ill Omen for a Jade Chokidai Prod",
      "Turn both in to Dugroz",
    ],
    wiki_title: "Key to Charasis Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, lakeOfIllOmenId, "located_in");

  const keyId = "item:key-to-charasis";
  addNode({ id: keyId, label: "Key to Charasis", type: "item", weight: 0.1, size: "Tiny", noTrade: true, source: "Key to Charasis Quest reward (Dugroz, Swamp of No Hope)" });
  addEdge(questId, keyId, "rewards");
}

// ---------------------------------------------------------------------
// Key to Cobalt Scar
// ---------------------------------------------------------------------
{
  const zoneId = "zone:skyshrine";
  const kaelId = "zone:kael-drakkal";
  const giverId = "npc:skyshrine:ziglark-whisperwing";
  addGiver(giverId, "Ziglark Whisperwing", zoneId);

  const questId = "quest:key-to-cobalt-scar";
  addNode({
    id: questId,
    label: "Key to Cobalt Scar",
    type: "quest",
    description: "Ziglark Whisperwing in Skyshrine hands out a Message to Wenglawks and requires 200 platinum to deliver to Wenglawks Kkeak in Kael Drakkel; returning with the Message to Herald he gives back earns a Shrine Key.",
    minLevel: 35,
    steps: [
      "Receive the Message to Wenglawks from Ziglark Whisperwing",
      "Deliver it with 200 platinum to Wenglawks Kkeak in Kael Drakkel",
      "Receive the Message to Herald and return it to Ziglark Whisperwing",
    ],
    wiki_title: "Key to Cobalt Scar",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, kaelId, "located_in");

  const keyId = "item:shrine-key";
  addNode({ id: keyId, label: "Shrine Key", type: "item", magic: true, lore: true, noTrade: true, source: "Key to Cobalt Scar reward (Ziglark Whisperwing, Skyshrine)" });
  addEdge(questId, keyId, "rewards");
}

// ---------------------------------------------------------------------
// Kilij's Plans
// ---------------------------------------------------------------------
{
  const zoneId = "zone:greater-faydark";
  const southRoId = "zone:southern-desert-of-ro";
  const giverId = "npc:greater-faydark:bilrio-surecut";
  addGiver(giverId, "Bilrio Surecut", zoneId);

  const questId = "quest:kilijs-plans";
  addNode({
    id: questId,
    label: "Kilij's Plans",
    type: "quest",
    description: "Bilrio Surecut, on the Kelethin platform shared with the Druid guild, trades Kilij Plans -- looted from Sandgiant Husam in Southern Desert of Ro -- and 3 Enchanted Gold Bars for a Brazen Brass Kilij. Bard, Rogue, and Warrior only.",
    classes: ["bard", "rogue", "warrior"],
    minLevel: 26,
    steps: [
      "Kill Sandgiant Husam in Southern Desert of Ro for Kilij Plans",
      "Gather 3 Enchanted Gold Bars",
      "Turn both in to Bilrio Surecut in Kelethin",
    ],
    wiki_title: "Kilij's Plans",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, southRoId, "located_in");

  const kilijId = "item:brazen-brass-kilij";
  addNode({
    id: kilijId,
    label: "Brazen Brass Kilij",
    type: "item",
    slots: ["Primary", "Secondary"],
    classes: ["bard", "rogue", "warrior"],
    skill: "1H Slashing",
    damage: 10,
    delay: 35,
    magic: true,
    source: "Kilij's Plans reward (Bilrio Surecut, Kelethin/Greater Faydark)",
  });
  addEdge(questId, kilijId, "rewards");
  addFactionReward(questId, "Kelethin Merchants");
  addFactionReward(questId, "Faydark's Champions");
  addFactionReward(questId, "Emerald Warriors");
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 053 complete: added 25 more quests from GitHub issue #26's checklist");
