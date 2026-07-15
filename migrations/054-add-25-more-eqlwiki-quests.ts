/**
 * Migration 054: 25 more quests off GitHub issue #26's checklist -- the
 * remainder of K (Knight Card Quest through Kwint's Kwest) and most of L
 * (Langseax Quest through Lodizal Shell Shield Quest). Researched directly
 * against eqlwiki.com, following decisions/eqlwiki-quest-research-method.md.
 *
 * Skipped this pass (left unchecked on the issue, not modeled):
 * - Legion Lager Quest -- its own page calls the quest "unsolved/broken"
 *   and notes the giver "was possibly removed from the game." Too
 *   uncertain to model as live content.
 *
 * Deferred to the Questlines section, not modeled as a flat quest:
 * - Lambent Armor Quests -- a 7-piece Bard armor set split across two
 *   Temple of Solusek Ro givers (Cryssia Stardreamer x4, Walthin
 *   Fireweaver x3), same shape as Armor of Ro. Doesn't count against this
 *   batch's 25-standalone cap.
 *
 * Data-quality note, not fixed here: this batch needed "Western Plains of
 * Karana" (Lion Meat Shipment Quest, Langseax Quest). The graph already
 * has two zone nodes for it -- `zone:west-karana` (label "West Karana",
 * `wiki_title: "Western Karana"`) and `zone:western-karana` (label
 * "Western Karana", same wiki_title, same lore text verbatim) -- both
 * introduced by earlier quest-batch migrations pointing at the same wiki
 * page under different ids. This migration uses `zone:western-karana`
 * (matching migration 053's Karana's Blessing, the most recent precedent)
 * rather than picking a side; deduping the two nodes touches edges added
 * across several prior migrations and is out of scope for a quest batch.
 *
 * Deliberately NOT modeled (consistent with every migration so far):
 * - Every vague/random reward, including "choice of one from a list"
 *   mechanics: Knight Card Quest's armor menu, Kobold Killing's random
 *   Raw-hide Armor piece, Kobold Molars (Evil)'s "small chance of random
 *   ringmail," Lenka's Pouch's Snapped Pole-or-Moggok's-Right-Eye choice,
 *   Lizard Dolls' random spell choice, and Lizard Tails / Lizard Tails No
 *   2's random armor piece.
 * - Coin rewards throughout -- no coin field on `quest` nodes.
 * - Negative faction changes throughout -- `rewards` only models positive
 *   rewards (decisions/quest-reward-modeling.md).
 * - Leuz's Task's three class-gated "Benevolence" items (Robe/Bracer/
 *   Talisman) and their further optional exchange chain -- no stats
 *   quoted on the fetched page for any of the three, and the exchange
 *   options are open-ended; left as prose only.
 * - Class-exclusion lists stated only as "all except X, Y, Z" (Leatherfoot
 *   Raiders' and Lionskin Gloves' "all except Necromancer, Wizard,
 *   Magician, Enchanter"): left as prose on the quest, not computed into
 *   an explicit `classes` array on the reward item, since fabricating the
 *   complement risks baking in an assumption about the full class roster
 *   the wiki page never actually states.
 * - Race restrictions (Kobold Shaman Artifacts' Erudite-only reward,
 *   Kwinn's Quest/Lizard-line quests' race gates): noted in `description`
 *   only -- `quest`/`item` schema has no race field.
 * - Farming-only zones that aren't the giver's zone and don't exist in
 *   this graph: Warsliks Woods (Kwinn's Quest's Stoneglint Lime Plume).
 *
 * Kobold Shaman Artifacts' own page names two NPCs (Tiam Khonsir for the
 * initial referral, Breya Nostulia for the actual turn-in/reward) -- only
 * Breya gets the `starts` edge, same treatment as Journal Strongbox's
 * Nusk Treton/Lenka Stoutheart split in migration 053: the referral NPC
 * stays prose, the NPC who actually hands out the quest and reward is the
 * graph's `starts` giver.
 *
 * Lizard Meat No 2's reward (Rusty Two Handed Sword, 2H Slashing, 9 DMG,
 * WAR/PAL/RNG/SHD) is stat-for-stat identical to the existing
 * `item:rusty-two-handed-sword` node from migration ~042's Bone Chips
 * Grobb -- reused via a second `rewards` edge rather than creating a
 * duplicate item node, same generic-newbie-reward pattern as the two
 * "Rusty" Oggok weapons being distinct items with distinct stats
 * (Battle Axe here vs. that Sword).
 *
 * Langseax Quest depends on Lion Meat Shipment Quest (also modeled this
 * batch, for its Lion Delight reward) -- noted in `description`/`steps`
 * only, no dependency edge type exists yet (same treatment as migration
 * 053's Jillin's Stew / Reebo's Carrots).
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
// Knight Card Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-kaladim";
  const oceanId = "zone:ocean-of-tears";
  const giverId = "npc:south-kaladim:beno-targnarle";
  addGiver(giverId, "Beno Targnarle", zoneId);

  const questId = "quest:knight-card-quest";
  addNode({
    id: questId,
    label: "Knight Card Quest",
    type: "quest",
    description: "Beno Targnarle, in the north turret of the Kaladim Warrior's Guild in South Kaladim, requiring Amiable or better faction, hands out a Knight Card to deliver to Doran Vargnus, camped on the west side of the Island of the Sisters of Erollisi in the Ocean of Tears, for a choice of Blackened Iron, Bronze, Cloth, or Ringmail armor. Multiquestable.",
    minLevel: 4,
    steps: [
      "Ask Beno Targnarle where Doran Vargnus can be found",
      "Travel to the Island of the Sisters of Erollisi in the Ocean of Tears",
      "Hand the Knight Card to Doran Vargnus for a reward",
    ],
    wiki_title: "Knight Card Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, oceanId, "located_in");
  addFactionReward(questId, "Storm Guard");
  addFactionReward(questId, "Kazon Stormhammer");
  addFactionReward(questId, "Miners Guild 249");
  addFactionReward(questId, "Merchants of Kaladim");
}

// ---------------------------------------------------------------------
// Kobold Killing
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const toxxuliaId = "zone:toxxulia-forest";
  const giverId = "npc:south-qeynos:tabure-ahendle";
  addGiver(giverId, "Tabure Ahendle", zoneId);

  const questId = "quest:kobold-killing";
  addNode({
    id: questId,
    label: "Kobold Killing",
    type: "quest",
    description: "Tabure Ahendle, at the Steel Warriors Arena in South Qeynos, requiring Amiable faction, trades 4 Kobold Hides -- from kobolds in Toxxulia Forest -- for a random piece of Medium Raw-hide Armor, coin, and experience. Completing it opens access to the Blurred Map Quest.",
    minLevel: 4,
    steps: ["Kill kobolds in Toxxulia Forest for 4 Kobold Hides", "Turn them in to Tabure Ahendle"],
    wiki_title: "Kobold Killing",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, toxxuliaId, "located_in");
  addFactionReward(questId, "Steel Warriors");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Knights of Truth");
}

// ---------------------------------------------------------------------
// Kobold Molars (Evil)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:paineel";
  const warrensId = "zone:the-warrens";
  const giverId = "npc:paineel:royal-guard-lilkus";
  addGiver(giverId, "Royal Guard Lilkus", zoneId);

  const questId = "quest:kobold-molars-evil";
  addNode({
    id: questId,
    label: "Kobold Molars (Evil)",
    type: "quest",
    description: "Royal Guard Lilkus, in Paineel Palace, requiring Indifferent or better faction with the Heretics, trades Kobold Molars -- from kobolds in The Warrens -- for coin, experience, a small chance of a random ringmail armor piece, and Heretics faction. Repeatable.",
    minLevel: 6,
    steps: ["Kill kobolds in The Warrens for Kobold Molars", "Turn them in to Royal Guard Lilkus"],
    wiki_title: "Kobold Molars (Evil)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, warrensId, "located_in");
  addFactionReward(questId, "Heretics");
}

// ---------------------------------------------------------------------
// Kobold Shaman Artifacts
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const warrensId = "zone:the-warrens";
  const giverId = "npc:erudin:breya-nostulia";
  addGiver(giverId, "Breya Nostulia", zoneId);

  const questId = "quest:kobold-shaman-artifacts";
  addNode({
    id: questId,
    label: "Kobold Shaman Artifacts",
    type: "quest",
    description: "After completing Kobold Molars (Good) and speaking with Tiam Khonsir in Erudin, Breya Nostulia on the second floor of the Temple of Deepwater Knights trades a Kobold Shaman's Pouch (from a greater shaman) and a Diviner's Bowl (from Krode the Diviner), both in The Warrens, for Midnight Sea Mail Leggings. Cleric or Paladin, Erudite race only.",
    classes: ["cleric", "paladin"],
    minLevel: 14,
    steps: [
      "Complete Kobold Molars (Good) and speak with Tiam Khonsir in Erudin",
      "Kill a greater shaman in The Warrens for a Kobold Shaman's Pouch",
      "Kill Krode the Diviner in The Warrens for a Diviner's Bowl",
      "Turn both in to Breya Nostulia in the Temple of Deepwater Knights",
    ],
    wiki_title: "Kobold Shaman Artifacts",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, warrensId, "located_in");

  const leggingsId = "item:midnight-sea-mail-leggings";
  addNode({
    id: leggingsId,
    label: "Midnight Sea Mail Leggings",
    type: "item",
    classes: ["cleric", "paladin"],
    ac: 9,
    stats: { str: 1, wis: 1, agi: 3 },
    source: "Kobold Shaman Artifacts reward (Breya Nostulia, Erudin) -- also carries unquantified cold resistance",
  });
  addEdge(questId, leggingsId, "rewards");
}

// ---------------------------------------------------------------------
// Kobold Shaman Paws
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const toxxuliaId = "zone:toxxulia-forest";
  const giverId = "npc:erudin:leraena-shelyrak";
  addGiver(giverId, "Leraena Shelyrak", zoneId);

  const questId = "quest:kobold-shaman-paws";
  addNode({
    id: questId,
    label: "Kobold Shaman Paws",
    type: "quest",
    description: "Leraena Shelyrak, at the Temple of Light in Erudin, requiring Amiable or better faction, trades 3 Odd Kobold Paws -- from kobold shamans in Toxxulia Forest -- for the spells Cure Disease and Holy Armor, coin, and experience.",
    minLevel: 5,
    steps: ["Kill kobold shamans in Toxxulia Forest for 3 Odd Kobold Paws", "Turn them in to Leraena Shelyrak"],
    wiki_title: "Kobold Shaman Paws",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, toxxuliaId, "located_in");
  addEdge(questId, "spell:cure-disease", "rewards");
  addEdge(questId, "spell:holy-armor", "rewards");
  addFactionReward(questId, "Peace Keepers");
  addFactionReward(questId, "High Council of Erudin");
}

// ---------------------------------------------------------------------
// Kwinn's Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:firiona-vie";
  const lakeOfIllOmenId = "zone:lake-of-ill-omen";
  const overthereId = "zone:the-overthere";
  const giverId = "npc:firiona-vie:kwinn-the-outlander";
  addGiver(giverId, "Kwinn the Outlander", zoneId);

  const questId = "quest:kwinns-quest";
  addNode({
    id: questId,
    label: "Kwinn's Quest",
    type: "quest",
    description: "Kwinn the Outlander in Firiona Vie trades a pack combining a Sabertooth Tiger Mane, a pair of Intact Pygmy Brute Choppers, a Stoneglint Lime Plume, and a Skeleton Fist -- dropped by sabertooth tigers and war boned skeletons (Lake of Ill Omen), pygmy skulking brutes (The Overthere), and stoneglint cockatrices (Warsliks Woods) -- for a Mechanical Iksar Tail.",
    minLevel: 25,
    steps: [
      "Collect a Sabertooth Tiger Mane and Skeleton Fist in Lake of Ill Omen",
      "Collect a pair of Intact Pygmy Brute Choppers in The Overthere",
      "Collect a Stoneglint Lime Plume from a stoneglint cockatrice in Warsliks Woods",
      "Combine all four into the pack Kwinn provides and turn it in to him",
    ],
    wiki_title: "Kwinn's Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, lakeOfIllOmenId, "located_in");
  addEdge(questId, overthereId, "located_in");

  const tailId = "item:mechanical-iksar-tail";
  addNode({
    id: tailId,
    label: "Mechanical Iksar Tail",
    type: "item",
    magic: true,
    lore: true,
    weight: 2.0,
    size: "Medium",
    source: "Kwinn's Quest reward (Kwinn the Outlander, Firiona Vie)",
  });
  addEdge(questId, tailId, "rewards");
}

// ---------------------------------------------------------------------
// Kwint's Kwest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:guard-kwint";
  addGiver(giverId, "Guard Kwint", zoneId);

  const questId = "quest:kwints-kwest";
  addNode({
    id: questId,
    label: "Kwint's Kwest",
    type: "quest",
    description: "Guard Kwint in South Qeynos sends players to Earron Huntlan at the Lion's Mane Tavern for a voucher good for one free ale, which is returned to Kwint for coin, experience, and faction. Keeping the voucher or giving it to a bartender instead incurs a faction penalty.",
    minLevel: 1,
    steps: [
      "Hail Guard Kwint in South Qeynos",
      "Find Earron Huntlan at the Lion's Mane Tavern and mention Kwint sent you",
      "Return the voucher to Guard Kwint",
    ],
    wiki_title: "Kwint's Kwest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Antonius Bayle");
  addFactionReward(questId, "Merchants of Qeynos");
}

// ---------------------------------------------------------------------
// Langseax Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:halas";
  const westernKaranaId = "zone:western-karana";
  const giverId = "npc:halas:renth-mclanis";
  addGiver(giverId, "Renth McLanis", zoneId);

  const questId = "quest:langseax-quest";
  addNode({
    id: questId,
    label: "Langseax Quest",
    type: "quest",
    description: "Renth McLanis in Halas, requiring Kindly or better faction with the Wolves of the North, sends Warriors who've completed the Lion Meat Shipment Quest to trade its Lion Delight reward to Iceberg for a Sweaty Shirt, deliver that to Frostbite at the McMannus fishing village in Western Karana, then kill Paglan or Basil and return their head for a Langseax (Basil) or the superior Langseax of the Wolves (Paglan). Warrior only.",
    classes: ["warrior"],
    minLevel: 20,
    steps: [
      "Complete the Lion Meat Shipment Quest for Lion Delight",
      "Trade Lion Delight to Iceberg for a Sweaty Shirt",
      "Give the Sweaty Shirt to Frostbite at the McMannus fishing village in Western Karana",
      "Kill Paglan or Basil and return their head to Renth McLanis",
    ],
    wiki_title: "Langseax Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, westernKaranaId, "located_in");

  const langseaxId = "item:langseax";
  addNode({
    id: langseaxId,
    label: "Langseax",
    type: "item",
    slots: ["Primary"],
    classes: ["warrior"],
    skill: "1H Slashing",
    damage: 6,
    source: "Langseax Quest reward for Basil's head (Renth McLanis, Halas)",
  });
  addEdge(questId, langseaxId, "rewards");

  const langseaxWolvesId = "item:langseax-of-the-wolves";
  addNode({
    id: langseaxWolvesId,
    label: "Langseax of the Wolves",
    type: "item",
    slots: ["Primary"],
    classes: ["warrior"],
    skill: "2H Slashing",
    damage: 19,
    stats: { str: 5, dex: 5 },
    source: "Langseax Quest reward for Paglan's head (Renth McLanis, Halas)",
  });
  addEdge(questId, langseaxWolvesId, "rewards");
}

// ---------------------------------------------------------------------
// Learn the Ways of Skinning and Tailoring
// ---------------------------------------------------------------------
{
  const zoneId = "zone:iceclad-ocean";
  const easternWastesId = "zone:eastern-wastes";
  const greatDivideId = "zone:great-divide";
  const giverId = "npc:iceclad-ocean:errgriz";
  addGiver(giverId, "Errgriz", zoneId);

  const questId = "quest:learn-the-ways-of-skinning-and-tailoring";
  addNode({
    id: questId,
    label: "Learn the Ways of Skinning and Tailoring",
    type: "quest",
    description: "Errgriz, near the Tower of Frozen Shadow in Iceclad Ocean, trades a High Quality Dire Wolf Fur -- from dire wolves in Eastern Wastes or Great Divide -- for Wolf Fur Earcovers, admitting he wasn't actually able to craft anything with the fur himself. Part of the Captain Nalot's Triple Strength Rum questline.",
    minLevel: 1,
    steps: [
      "Kill a dire wolf in Eastern Wastes or Great Divide for a High Quality Dire Wolf Fur",
      "Give it to Errgriz near the Tower of Frozen Shadow in Iceclad Ocean",
    ],
    wiki_title: "Learn the Ways of Skinning and Tailoring",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, easternWastesId, "located_in");
  addEdge(questId, greatDivideId, "located_in");

  const earcoversId = "item:wolf-fur-earcovers";
  addNode({
    id: earcoversId,
    label: "Wolf Fur Earcovers",
    type: "item",
    magic: true,
    lore: true,
    noTrade: true,
    source: "Learn the Ways of Skinning and Tailoring reward (Errgriz, Iceclad Ocean)",
  });
  addEdge(questId, earcoversId, "rewards");
}

// ---------------------------------------------------------------------
// Leatherfoot Raiders
// ---------------------------------------------------------------------
{
  const zoneId = "zone:rivervale";
  const oceanId = "zone:ocean-of-tears";
  const eastFreeportId = "zone:east-freeport";
  const aqueductsId = "zone:qeynos-catacombs";
  const erudinId = "zone:erudin";
  const northernKaranaId = "zone:northern-karana";
  const everfrostId = "zone:everfrost-peaks";
  const innothuleId = "zone:innothule-swamp";
  const crushboneId = "zone:crushbone";
  const northRoId = "zone:northern-desert-of-ro";
  const giverId = "npc:rivervale:marshal-anrey";
  addGiver(giverId, "Marshal Anrey", zoneId);

  const questId = "quest:leatherfoot-raiders";
  addNode({
    id: questId,
    label: "Leatherfoot Raiders",
    type: "quest",
    description: "Marshal Anrey, on the second floor of the Rivervale bank, requiring Amiable or better faction, trades a Shark Skin (Ocean of Tears, East Freeport, Qeynos Catacombs, or Erudin harbor), a Grizzly Bear Skin (Northern Karana), a Polar Bear Skin (Everfrost Peaks), and an Alligator Skin (Innothule Swamp) for a Leatherfoot Skullcap; that skullcap plus a Dragoon Dirk (Crushbone's Ambassador DVinn, Northern Desert of Ro's Dorn B'Dynn, or other dragoon variants) upgrades to the Leatherfoot Raider Skullcap. All classes except Necromancer, Wizard, Magician, and Enchanter for the first reward.",
    minLevel: 1,
    steps: [
      "Collect a Shark Skin, Grizzly Bear Skin, Polar Bear Skin, and Alligator Skin",
      "Turn all four in to Marshal Anrey for the Leatherfoot Skullcap",
      "Kill a dragoon (e.g. Ambassador DVinn in Crushbone or Dorn B'Dynn in Northern Desert of Ro) for a Dragoon Dirk",
      "Return the Leatherfoot Skullcap and Dragoon Dirk to Marshal Anrey for the upgraded Leatherfoot Raider Skullcap",
    ],
    wiki_title: "Leatherfoot Raiders",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, oceanId, "located_in");
  addEdge(questId, eastFreeportId, "located_in");
  addEdge(questId, aqueductsId, "located_in");
  addEdge(questId, erudinId, "located_in");
  addEdge(questId, northernKaranaId, "located_in");
  addEdge(questId, everfrostId, "located_in");
  addEdge(questId, innothuleId, "located_in");
  addEdge(questId, crushboneId, "located_in");
  addEdge(questId, northRoId, "located_in");

  const skullcapId = "item:leatherfoot-skullcap";
  addNode({
    id: skullcapId,
    label: "Leatherfoot Skullcap",
    type: "item",
    ac: 4,
    stats: { cha: 10 },
    source: "Leatherfoot Raiders reward (Marshal Anrey, Rivervale)",
  });
  addEdge(questId, skullcapId, "rewards");

  const raiderSkullcapId = "item:leatherfoot-raider-skullcap";
  addNode({
    id: raiderSkullcapId,
    label: "Leatherfoot Raider Skullcap",
    type: "item",
    ac: 7,
    stats: { str: 5, cha: 10, agi: 5 },
    effect: "Instant Gate",
    source: "Leatherfoot Raiders reward, upgraded from Leatherfoot Skullcap (Marshal Anrey, Rivervale)",
  });
  addEdge(questId, raiderSkullcapId, "rewards");
}

// ---------------------------------------------------------------------
// Left Goblin Ears
// ---------------------------------------------------------------------
{
  const zoneId = "zone:high-keep";
  const giverId = "npc:high-keep:captain-bosec";
  addGiver(giverId, "Captain Bosec", zoneId);

  const questId = "quest:left-goblin-ears";
  addNode({
    id: questId,
    label: "Left Goblin Ears",
    type: "quest",
    description: "Captain Bosec, near the cellars/bank entrance in High Keep, trades up to four Left Goblin Ears per turn-in -- from Pickclaw clan goblins infesting High Keep's tunnels -- for coin, experience, and faction.",
    minLevel: 9,
    steps: ["Kill Pickclaw clan goblins in High Keep for Left Goblin Ears", "Turn in up to four at a time to Captain Bosec"],
    wiki_title: "Left Goblin Ears",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Highpass Guards");
  addFactionReward(questId, "Carson McCabe");
  addFactionReward(questId, "Merchants of Highpass");
  addFactionReward(questId, "Corrupt Qeynos Guards");
  addFactionReward(questId, "The Freeport Militia");
}

// ---------------------------------------------------------------------
// Lenka's Pouch
// ---------------------------------------------------------------------
{
  const zoneId = "zone:west-freeport";
  const eastFreeportId = "zone:east-freeport";
  const giverId = "npc:west-freeport:toala-nehron";
  addGiver(giverId, "Toala Nehron", zoneId);

  const questId = "quest:lenkas-pouch";
  addNode({
    id: questId,
    label: "Lenka's Pouch",
    type: "quest",
    description: "Toala Nehron in West Freeport sends players to Lenka Stoutheart and Bronto Thudfoot at the Seafarer's Roost in East Freeport (daytime only), and on to Brunar Rankin under the docks, to recover the L.S. Pouch -- a groundspawn in a hidden underground guild area behind the Seafarer's Roost's basement crates -- for experience and a choice of the Snapped Pole or Moggok's Right Eye. A Snapped Pole can be handed to Olunea Miltin for a Fishing Pole.",
    minLevel: 1,
    steps: [
      "Speak with Toala Nehron in West Freeport",
      "Find Lenka Stoutheart and Bronto Thudfoot at the Seafarer's Roost in East Freeport",
      "Question Brunar Rankin under the docks",
      "Retrieve the L.S. Pouch from the hidden basement area behind the Seafarer's Roost",
      "Return the pouch to Lenka Stoutheart",
    ],
    wiki_title: "Lenka's Pouch",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, eastFreeportId, "located_in");
  addFactionReward(questId, "Steel Warriors");
}

// ---------------------------------------------------------------------
// Letter to Master Whoopal
// ---------------------------------------------------------------------
{
  const zoneId = "zone:west-commonlands";
  const nektulosId = "zone:nektulos-forest";
  const giverId = "npc:west-commonlands:wallin-slyfoot";
  addGiver(giverId, "Wallin Slyfoot", zoneId);

  const questId = "quest:letter-to-master-whoopal";
  addNode({
    id: questId,
    label: "Letter to Master Whoopal",
    type: "quest",
    description: "Wallin Slyfoot in West Commonlands hands out the Leatherfoot Raider Orders to deliver to Master Whoopal in Nektulos Forest, for coin, experience, and faction.",
    minLevel: 1,
    steps: ["Receive the Leatherfoot Raider Orders from Wallin Slyfoot", "Deliver it to Master Whoopal in Nektulos Forest"],
    wiki_title: "Letter to Master Whoopal",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, nektulosId, "located_in");
  addFactionReward(questId, "Mayor Gubbin");
  addFactionReward(questId, "Storm Reapers");
  addFactionReward(questId, "Merchants of Rivervale");
}

// ---------------------------------------------------------------------
// Leuz's Task
// ---------------------------------------------------------------------
{
  const zoneId = "zone:skyshrine";
  const westernWastesId = "zone:western-wastes";
  const giverId = "npc:skyshrine:commander-leuz";
  addGiver(giverId, "Commander Leuz", zoneId);

  const questId = "quest:leuzs-task";
  addNode({
    id: questId,
    label: "Leuz's Task",
    type: "quest",
    description: "Commander Leuz in Skyshrine, requiring Warmly or better faction with the Claws of Veeshan, hands out Scout Tools to deliver to Scout Charisa south of Sirens Grotto in Western Wastes; delivering them spawns a Kromzek Captain who drops a Broken Disk, tradeable back to Charisa for a Robe, Bracer, or Talisman of Benevolence depending on class, with further optional exchanges available.",
    minLevel: 46,
    steps: [
      "Receive Scout Tools from Commander Leuz in Skyshrine",
      "Deliver them to Scout Charisa south of Sirens Grotto in Western Wastes",
      "Kill the Kromzek Captain that spawns for a Broken Disk",
      "Return the Broken Disk to Scout Charisa for a class-appropriate reward",
    ],
    wiki_title: "Leuz's Task",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, westernWastesId, "located_in");
}

// ---------------------------------------------------------------------
// Library Book
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const highpassId = "zone:highpass-hold";
  const northQeynosId = "zone:north-qeynos";
  const giverId = "npc:erudin:rarnan-lapice";
  addGiver(giverId, "Rarnan Lapice", zoneId);

  const questId = "quest:library-book";
  addNode({
    id: questId,
    label: "Library Book",
    type: "quest",
    description: "Rarnan Lapice, outside the Temple of Divine Light in Erudin, requiring a cleric of Quellious above Indifferent faction, sends players via Illithi Nollith and Tol Nicelot to Moodoro Finharn in North Qeynos for an incomplete Testament of Vanear, then to Dyllin Starsine in Highpass Hold for Page 30 and back to Moodoro for Page 34 (won in a card game), for the completed Testament of Vanear and the spell Languid Pace.",
    classes: ["cleric"],
    minLevel: 16,
    steps: [
      "Speak with Illithi Nollith at the Erudin library, then Tol Nicelot",
      "Purchase the incomplete Testament of Vanear from Moodoro Finharn in North Qeynos",
      "Kill Dyllin Starsine in Highpass Hold for Page 30",
      "Win Page 34 from Moodoro Finharn in a card game",
      "Combine all pages in the Testament container and return it to Rarnan Lapice",
    ],
    wiki_title: "Library Book",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, highpassId, "located_in");
  addEdge(questId, northQeynosId, "located_in");
  addEdge(questId, "spell:languid-pace", "rewards");

  const testamentId = "item:testament-of-vanear";
  addNode({
    id: testamentId,
    label: "Testament of Vanear",
    type: "item",
    slots: ["Secondary"],
    stats: { wis: 10 },
    mana: 10,
    effect: "Mana Preservation I (focus)",
    source: "Library Book reward (Rarnan Lapice, Erudin)",
  });
  addEdge(questId, testamentId, "rewards");
}

// ---------------------------------------------------------------------
// Lion Meat Shipment Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:halas";
  const westernKaranaId = "zone:western-karana";
  const giverId = "npc:halas:teria-odanos";
  addGiver(giverId, "Teria O`Danos", zoneId);

  const questId = "quest:lion-meat-shipment-quest";
  addNode({
    id: questId,
    label: "Lion Meat Shipment Quest",
    type: "quest",
    description: "Teria O`Danos in Halas sends players to the McMannus fishing village in Western Karana -- Einhorst McMannus, then Misla McMannus -- to retrieve a Lion Meat Shipment, returned to Teria for Lion Delight, coin, experience, and faction.",
    minLevel: 1,
    steps: [
      "Hail Teria O`Danos in Halas",
      "Travel to the McMannus fishing village in Western Karana",
      "Speak with Einhorst McMannus, then Misla McMannus, to receive the Lion Meat Shipment",
      "Return it to Teria O`Danos",
    ],
    wiki_title: "Lion Meat Shipment Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, westernKaranaId, "located_in");

  const delightId = "item:lion-delight";
  addNode({ id: delightId, label: "Lion Delight", type: "item", source: "Lion Meat Shipment Quest reward (Teria O`Danos, Halas)" });
  addEdge(questId, delightId, "rewards");
  addFactionReward(questId, "Merchants of Halas");
  addFactionReward(questId, "Wolves of the North");
  addFactionReward(questId, "Shamen of Justice");
  addFactionReward(questId, "Rogues of the White Rose");
}

// ---------------------------------------------------------------------
// Lionskin Gloves Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kithicor-forest";
  const easternKaranaId = "zone:eastern-karana";
  const giverId = "npc:kithicor-forest:ged-twigborn";
  addGiver(giverId, "Ged Twigborn", zoneId);

  const questId = "quest:lionskin-gloves-quest";
  addNode({
    id: questId,
    label: "Lionskin Gloves Quest",
    type: "quest",
    description: "Ged Twigborn in Kithicor Forest, requiring high faction (raised by killing Shralok Orcs in the forest), trades 96 gold plus a high quality lion skin -- from Highland Lions in Eastern Karana, or occasionally a tiger in Kithicor Forest's southwestern corner -- for Lionskin Gloves. All classes except Necromancer, Wizard, Magician, and Enchanter.",
    minLevel: 14,
    steps: [
      "Kill Shralok Orcs in Kithicor Forest to raise faction with Ged Twigborn",
      "Kill a Highland Lion in Eastern Karana (or a tiger in Kithicor Forest) for a high quality lion skin",
      "Turn in the skin and 96 gold to Ged Twigborn",
    ],
    wiki_title: "Lionskin Gloves Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, easternKaranaId, "located_in");

  const glovesId = "item:lionskin-gloves";
  addNode({
    id: glovesId,
    label: "Lionskin Gloves",
    type: "item",
    slots: ["Hands"],
    ac: 5,
    resists: { cold: 2 },
    weight: 1.1,
    source: "Lionskin Gloves Quest reward (Ged Twigborn, Kithicor Forest)",
  });
  addEdge(questId, glovesId, "rewards");
}

// ---------------------------------------------------------------------
// Living Dragons
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const westernWastesId = "zone:western-wastes";
  const giverId = "npc:kael-drakkal:kyenka";
  addGiver(giverId, "Kyenka", zoneId);

  const questId = "quest:living-dragons";
  addNode({
    id: questId,
    label: "Living Dragons",
    type: "quest",
    description: "Kyenka, in Tormax's throne room in Kael Drakkal, requiring Warmly or better faction with Kromzek, trades a Greater Dragon's Head for Barbed Dragonscale Pauldrons, or a Great Dragon's Head for Barbed Dragonscale Boots -- both dropped by elder dragons in Western Wastes.",
    minLevel: 50,
    steps: ["Kill an elder dragon in Western Wastes for a Greater or Great Dragon's Head", "Turn it in to Kyenka in Kael Drakkal"],
    wiki_title: "Living Dragons",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, westernWastesId, "located_in");

  const pauldronsId = "item:barbed-dragonscale-pauldrons";
  addNode({
    id: pauldronsId,
    label: "Barbed Dragonscale Pauldrons",
    type: "item",
    ac: 9,
    stats: { str: 5, sta: 10, agi: 9 },
    source: "Living Dragons reward for a Greater Dragon's Head (Kyenka, Kael Drakkal) -- also carries unquantified poison resistance",
  });
  addEdge(questId, pauldronsId, "rewards");

  const bootsId = "item:barbed-dragonscale-boots";
  addNode({
    id: bootsId,
    label: "Barbed Dragonscale Boots",
    type: "item",
    slots: ["Feet"],
    ac: 19,
    stats: { sta: 9 },
    hp: 30,
    source: "Living Dragons reward for a Great Dragon's Head (Kyenka, Kael Drakkal)",
  });
  addEdge(questId, bootsId, "rewards");
  addFactionReward(questId, "Kromzek");
  addFactionReward(questId, "Kromrif");
  addFactionReward(questId, "King Tormax");
}

// ---------------------------------------------------------------------
// Living Granite
// ---------------------------------------------------------------------
{
  const zoneId = "zone:the-wakening-land";
  const giverId = "npc:the-wakening-land:storm-giant-architect";
  addGiver(giverId, "a storm giant architect", zoneId);

  const questId = "quest:living-granite";
  addNode({
    id: questId,
    label: "Living Granite",
    type: "quest",
    description: "A storm giant architect in The Wakening Land, requiring only dubious faction, trades four Blocks of Living Granite -- from geonid shamans in the geonid caverns -- for A Gigantic Kromzek Pick. Warrior, Paladin, Ranger, or Shadow Knight only.",
    classes: ["warrior", "paladin", "ranger", "shadow knight"],
    minLevel: 45,
    steps: ["Kill geonid shamans in the geonid caverns for 4 Blocks of Living Granite", "Turn them in to the storm giant architect"],
    wiki_title: "Living Granite",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const pickId = "item:a-gigantic-kromzek-pick";
  addNode({
    id: pickId,
    label: "A Gigantic Kromzek Pick",
    type: "item",
    slots: ["Primary"],
    classes: ["warrior", "paladin", "ranger", "shadow knight"],
    skill: "2H Slashing",
    damage: 21,
    delay: 41,
    source: "Living Granite reward (storm giant architect, The Wakening Land)",
  });
  addEdge(questId, pickId, "rewards");
  addFactionReward(questId, "Kromzek");
  addFactionReward(questId, "Kromrif");
  addFactionReward(questId, "King Tormax");
}

// ---------------------------------------------------------------------
// Lizard Dolls
// ---------------------------------------------------------------------
{
  const zoneId = "zone:oggok";
  const giverId = "npc:oggok:grevak";
  addGiver(giverId, "Grevak", zoneId);

  const questId = "quest:lizard-dolls";
  addNode({
    id: questId,
    label: "Lizard Dolls",
    type: "quest",
    description: "Grevak, at the Greenblood guild in Oggok, trades two Mystic Dolls for a Backpack, a choice of the spells Disease Cloud, Invisibility versus Undead, or Leering Corpse, coin, and experience.",
    minLevel: 1,
    steps: ["Bring two Mystic Dolls to Grevak at the Greenblood guild in Oggok"],
    wiki_title: "Lizard Dolls",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const backpackId = "item:backpack";
  addNode({
    id: backpackId,
    label: "Backpack",
    type: "item",
    slots: ["Secondary"],
    capacity: 8,
    source: "Lizard Dolls reward (Grevak, Oggok) -- 8-slot container, 0% weight reduction",
  });
  addEdge(questId, backpackId, "rewards");
  addFactionReward(questId, "Clurg");
  addFactionReward(questId, "Green Blood Knights");
}

// ---------------------------------------------------------------------
// Lizard Meat No 2
// ---------------------------------------------------------------------
{
  const zoneId = "zone:oggok";
  const feerrottId = "zone:the-feerrott";
  const giverId = "npc:oggok:soonog";
  addGiver(giverId, "Soonog", zoneId);

  const questId = "quest:lizard-meat-no-2";
  addNode({
    id: questId,
    label: "Lizard Meat No 2",
    type: "quest",
    description: "Soonog, at the Greenblood guild in Oggok, requiring Ogre race, trades 4 lizard meat -- from lizardmen in The Feerrott -- for a Rusty Two Handed Sword, coin, and experience.",
    minLevel: 1,
    steps: ["Kill lizardmen in The Feerrott for 4 lizard meat", "Turn them in to Soonog at the Greenblood guild in Oggok"],
    wiki_title: "Lizard Meat No 2",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, feerrottId, "located_in");
  addEdge(questId, "item:rusty-two-handed-sword", "rewards");
  addFactionReward(questId, "Clurg");
  addFactionReward(questId, "Green Blood Knights");
}

// ---------------------------------------------------------------------
// Lizard Meat Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:oggok";
  const feerrottId = "zone:the-feerrott";
  const giverId = "npc:oggok:kogna";
  addGiver(giverId, "Kogna", zoneId);

  const questId = "quest:lizard-meat-quest";
  addNode({
    id: questId,
    label: "Lizard Meat Quest",
    type: "quest",
    description: "Kogna in Oggok, requiring Ogre race and Amiable or better faction, trades 4 pieces of lizard meat -- handed over unstacked, not one at a time, from lizardmen in The Feerrott -- for a Rusty Two Handed Battle Axe and experience.",
    minLevel: 1,
    steps: ["Kill lizardmen in The Feerrott for 4 unstacked pieces of lizard meat", "Turn them in to Kogna in Oggok"],
    wiki_title: "Lizard Meat Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, feerrottId, "located_in");

  const axeId = "item:rusty-two-handed-battle-axe";
  addNode({
    id: axeId,
    label: "Rusty Two Handed Battle Axe",
    type: "item",
    slots: ["Primary"],
    skill: "2H Slashing",
    source: "Lizard Meat Quest reward (Kogna, Oggok)",
  });
  addEdge(questId, axeId, "rewards");
  addFactionReward(questId, "Clurg");
  addFactionReward(questId, "Craknek Warriors");
}

// ---------------------------------------------------------------------
// Lizard Tails
// ---------------------------------------------------------------------
{
  const zoneId = "zone:oggok";
  const feerrottId = "zone:the-feerrott";
  const giverId = "npc:oggok:horgus";
  addGiver(giverId, "Horgus", zoneId);

  const questId = "quest:lizard-tails";
  addNode({
    id: questId,
    label: "Lizard Tails",
    type: "quest",
    description: "Horgus in Oggok, requiring Ogre race, trades four tails from newbie lizards in The Feerrott for a random piece of Raw-Hide Armor, coin, and experience.",
    minLevel: 1,
    steps: ["Kill newbie lizards in The Feerrott for 4 tails", "Turn them in to Horgus in Oggok"],
    wiki_title: "Lizard Tails",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, feerrottId, "located_in");
  addFactionReward(questId, "Clurg");
  addFactionReward(questId, "Craknek Warriors");
}

// ---------------------------------------------------------------------
// Lizard Tails No 2
// ---------------------------------------------------------------------
{
  const zoneId = "zone:oggok";
  const feerrottId = "zone:the-feerrott";
  const giverId = "npc:oggok:grevak";
  addGiver(giverId, "Grevak", zoneId);

  const questId = "quest:lizard-tails-no-2";
  addNode({
    id: questId,
    label: "Lizard Tails No 2",
    type: "quest",
    description: "Grevak, at the Greenblood guild in Oggok, trades four lizard tails -- from lizardmen in The Feerrott -- for a random piece of Tattered armor, coin, and experience.",
    minLevel: 1,
    steps: ["Kill lizardmen in The Feerrott for 4 lizard tails", "Turn them in to Grevak at the Greenblood guild in Oggok"],
    wiki_title: "Lizard Tails No 2",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, feerrottId, "located_in");
  addFactionReward(questId, "Clurg");
  addFactionReward(questId, "Green Blood Knights");
}

// ---------------------------------------------------------------------
// Lodizal Shell Shield Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:cobalt-scar";
  const iceclad = "zone:iceclad-ocean";
  const giverId = "npc:cobalt-scar:bungre-crawcrusher";
  addGiver(giverId, "Bungre Crawcrusher", zoneId);

  const questId = "quest:lodizal-shell-shield-quest";
  addNode({
    id: questId,
    label: "Lodizal Shell Shield Quest",
    type: "quest",
    description: "Bungre Crawcrusher, an Othmir in Cobalt Scar near the Skyshrine zone line, requiring Apprehensive or better faction with the Othmir, crafts a Section of Lodizal's Shell -- dropped by the giant sea turtle Lodizal in Iceclad Ocean -- plus 10,000 gold into a Lodizal Shell Shield. Bard, Cleric, Druid, Paladin, Ranger, Rogue, Shadow Knight, Shaman, or Warrior only.",
    classes: ["bard", "cleric", "druid", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"],
    minLevel: 50,
    steps: ["Kill Lodizal in Iceclad Ocean for a Section of Lodizal's Shell", "Turn it in with 10,000 gold to Bungre Crawcrusher in Cobalt Scar"],
    wiki_title: "Lodizal Shell Shield Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, iceclad, "located_in");

  const shieldId = "item:lodizal-shell-shield";
  addNode({
    id: shieldId,
    label: "Lodizal Shell Shield",
    type: "item",
    slots: ["Secondary"],
    classes: ["bard", "cleric", "druid", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"],
    ac: 23,
    stats: { str: 10, cha: 5, wis: 10 },
    effect: "Underwater breathing",
    source: "Lodizal Shell Shield Quest reward (Bungre Crawcrusher, Cobalt Scar) -- also carries unquantified fire, cold, and magic resistance",
  });
  addEdge(questId, shieldId, "rewards");
  addFactionReward(questId, "Othmir");
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 054 complete: added 25 more quests from GitHub issue #26's checklist");
