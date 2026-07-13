/**
 * Migration 036: 25 more quests off GitHub issue #26's checklist -- Aenia
 * and Behroe, Air Tight Box Quest, Aviak Chicks, Aviak Talons, Bandit
 * Sashes, Bandit Spectacles, Barnacle Breastplate Quest, Basilisk Tongues,
 * Bat Wings, Bearskin Gloves Quest, Blessed Oil Quest, Blurred Map Quest,
 * Bone Granite Powder Quest, Bottle of Red Wine, Book of Turmoil Quest,
 * Bozinite Pestle Quest, Bracers of Erollisi Quest, Broken Lute, Brother
 * Trintle (Quest), Cabilis Pale Ale (Cabilis), Call of Flame Quest,
 * Captain Nealith's Brother, Catfish Tail, Cannibalize II (Good),
 * Cheslin's Illusion Cards. Researched directly against eqlwiki.com (each
 * quest's own page plus its reward items' pages), following
 * decisions/eqlwiki-quest-research-method.md.
 *
 * Picked for existing-zone coverage, same rule as migration 034: every
 * quest giver sits in a zone this graph already has. Skipped this pass for
 * missing-zone reasons: Ancient Dragon Tome (no stated giver zone at all),
 * Blyle Bundin's Head (South Kaladim), Bulthar Trunks (Cobalt Scar),
 * Bvellos' Bounty (Kael Drakkel), Chalice of Conquest Quest (references
 * South Kaladim mid-chain; also an 8-leg fetch chain disproportionate to
 * one migration entry), Cannibalize II (Evil) (Timorous Deep). Skipped as
 * not real/verifiable quests, per the wiki pages themselves: Boysenberry
 * Pie Quest ("never been implemented," reward "Unsolved/broken") and
 * Burynai Bundt Cake ("confirmed that this is not a quest at this time,
 * but is simply a storyline"). Blood Ink was skipped for the same reason
 * back in migration 034's research pass (page marked "still... unsolved").
 *
 * Several quests share a giver already added by an earlier migration or
 * earlier in this one -- Larkon Theardor (Ak'Anon) gives Air Tight Box,
 * Basilisk Tongues, and Bozinite Pestle Quest; Bumle Reminjar (North
 * Kaladim) gives both Aviak Chicks and Aviak Talons; Lokar To`Biath
 * (Neriak 3rd Gate) gives both Bottle of Red Wine and Book of Turmoil;
 * Chesgard Sydwen (South Qeynos) gives both Bandit Sashes and Cheslin's
 * Illusion Cards -- one npc node each, reused across their quest edges.
 *
 * Deliberately NOT modeled:
 * - Generic/unspecified reward pools with no distinct identity: Bandit
 *   Sashes' "a bronze weapon," Bracers of Erollisi's tradeskill/junk pool
 *   (Aviak Feather, Conch Shell, Fishing Spear, Kiola Nut), Cheslin's
 *   Illusion Cards' "a piece of Raw Hide armor" -- same treatment as
 *   migration 033's "Rusty Weapons," left as prose in steps.
 * - "A random mage spell" (Bozinite Pestle Quest) / "a random cleric
 *   spell" (Blessed Oil Quest) -- unlike Bandit Spectacles/Basilisk
 *   Tongues/Blurred Map Quest (which name every option in the random
 *   pool), these two don't state which spells are actually possible, so
 *   there's nothing concrete to model; left as prose.
 * - Every *worsened* faction each quest also states (Ring of Scale, Mayong
 *   Mistmoore, Dark Reflection, The Dead, Bloodsabers, Freeport Militia,
 *   Corrupt Qeynos Guards, Crushbone Orcs, Heretics, Pirates of Gunthak,
 *   Legion of Cabilis, Circle Of Unseen Hands) -- `rewards` only models a
 *   positive reward (decisions/quest-reward-modeling.md); left as prose.
 * - Coin/platinum/gold payouts and one-off "no reward" trivia (Cabilis
 *   Pale Ale's "1 Copper and a Burp") -- no coin field on `quest` nodes.
 * - Book of Turmoil's own title item and Air Tight Box's container --
 *   both are consumed/turned in as part of the quest chain, not a kept
 *   reward, so they stay prose in steps rather than becoming item nodes
 *   with no real stat block.
 * - Cannibalize II (Good)'s reward is nominally "McMerin's Feast," but
 *   that's a spell scroll ("Teaches the spell Cannibalize II when
 *   scribed") -- modeled as a direct `rewards` edge to the existing
 *   spell:cannibalize-ii node, same "target node's own type disambiguates"
 *   treatment Errand for Tonmerk's Smite reward already uses (migration
 *   035), not as a separate scroll item node.
 * - `era` -- no era tag stated on any of these 25 quests' own pages, so
 *   left unset rather than guessed (decisions/quest-era-flagging.md).
 *
 * Random-pool rewards (Aviak Chicks' 5 patchwork pieces, Bandit
 * Spectacles' 2 spells, Basilisk Tongues' 6 spells, Bat Wings' 2 spells,
 * Blurred Map Quest's 2 weapons) are modeled as multiple `rewards` edges
 * on the same quest, same pattern migration 033's Scrap Metal Quest and
 * migration 034's Bug Collection/Errand for Wolten already use for "pick
 * one of these" wiki pages.
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
// Aenia and Behroe
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:behroe-dlexon";
  addGiver(giverId, "Behroe Dlexon", zoneId);

  const questId = "quest:aenia-and-behroe";
  addNode({
    id: questId,
    label: "Aenia and Behroe",
    type: "quest",
    description: "Behroe Dlexon in South Qeynos asks a bard to carry a ballad to Aenia Ghenson in North Qeynos and bring back her reply.",
    classes: ["bard"],
    minLevel: 1,
    steps: [
      "Hail Behroe Dlexon in South Qeynos and receive the ballad 'The Thornless Rose'",
      "Travel to North Qeynos and recite the ballad to Aenia Ghenson",
      "Receive a Letter to Behroe and return it to Behroe Dlexon",
    ],
    wiki_title: "Aenia and Behroe",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const shawlId = "item:shawl-of-the-wind-spirit";
  addNode({
    id: shawlId,
    label: "Shawl of the Wind Spirit",
    type: "item",
    slots: ["Shoulders"],
    ac: 1,
    resists: { cold: 2 },
    weight: 0.4,
    size: "Small",
    classes: ["bard"],
    source: "Aenia and Behroe reward (Behroe Dlexon, South Qeynos)",
  });
  addEdge(questId, shawlId, "rewards");

  for (const label of ["League of Antonican Bards", "Knights of Truth", "Guards of Qeynos"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Air Tight Box Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ak-anon";
  const giverId = "npc:ak-anon:larkon-theardor";
  addGiver(giverId, "Larkon Theardor", zoneId);

  const questId = "quest:air-tight-box-quest";
  addNode({
    id: questId,
    label: "Air Tight Box Quest",
    type: "quest",
    description: "Larkon Theardor in Ak'Anon sends adventurers to Fodin Frugrin at the Steamfont Mountains observatory for an Air Tight Box, then to fill it with infected rat livers and bring it back.",
    classes: [],
    minLevel: 3,
    steps: [
      "Hail Larkon Theardor in Ak'Anon and ask for the clean tasks",
      "Travel to Steamfont Mountains and find Fodin Frugrin at the observatory",
      "Receive an Air Tight Box and combine 10 Infected Rat Livers (looted from infected rats in Steamfont Mountains) inside it",
      "Return the completed box to Larkon Theardor",
    ],
    wiki_title: "Air Tight Box Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  for (const label of ["Eldritch Collective", "Gem Choppers", "King AkAnon"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Aviak Chicks
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-kaladim";
  const giverId = "npc:north-kaladim:bumle-reminjar";
  addGiver(giverId, "Bumle Reminjar", zoneId);

  const questId = "quest:aviak-chicks";
  addNode({
    id: questId,
    label: "Aviak Chicks",
    type: "quest",
    description: "Bumle Reminjar in North Kaladim's Paladin guild trades krag chick talons for a random piece of Small Patchwork armor.",
    classes: ["bard", "cleric", "druid", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"],
    minLevel: 4,
    steps: [
      "Hail Bumle Reminjar in the Paladin guild dining hall, North Kaladim, and agree to destroy the krag chicks",
      "Collect 4 Aviak Chick Talons, looted from a Krag Chick or aviak chick in Butcherblock Mountains",
      "Hand over the talons for a random reward",
    ],
    wiki_title: "Aviak Chicks",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const pieces = [
    ["item:small-patchwork-boots", "Small Patchwork Boots", ["Feet"], 3, 1.9, "Small"],
    ["item:small-patchwork-cloak", "Small Patchwork Cloak", ["Back"], 3, 1.5, "Medium"],
    ["item:small-patchwork-pants", "Small Patchwork Pants", ["Legs"], 4, 3.0, "Medium"],
    ["item:small-patchwork-sleeves", "Small Patchwork Sleeves", ["Arms"], 3, 1.1, "Small"],
    ["item:small-patchwork-tunic", "Small Patchwork Tunic", ["Chest"], 6, 2.6, "Medium"],
  ] as const;
  const patchworkClasses = ["bard", "cleric", "druid", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"];
  for (const [id, label, slots, ac, weight, size] of pieces) {
    addNode({ id, label, type: "item", slots: [...slots], ac, weight, size, classes: patchworkClasses, source: "Aviak Chicks reward (Bumle Reminjar, North Kaladim); part of the Small Patchwork Armor Set" });
    addEdge(questId, id, "rewards");
  }

  for (const label of ["Clerics of Underfoot", "Kazon Stormhammer", "Miners Guild 249"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Aviak Talons
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-kaladim";
  const giverId = "npc:north-kaladim:bumle-reminjar";
  addGiver(giverId, "Bumle Reminjar", zoneId);

  const questId = "quest:aviak-talons";
  addNode({
    id: questId,
    label: "Aviak Talons",
    type: "quest",
    description: "Bumle Reminjar in North Kaladim also buys krag elder talons off adventurers, for coin and faction rather than gear.",
    classes: [],
    minLevel: 8,
    steps: [
      "Collect 4 Aviak Talons, looted from a krag elder in southern Butcherblock Mountains between Greater Faydark and Dagnor's Cauldron",
      "Hand the talons to Bumle Reminjar in North Kaladim",
    ],
    wiki_title: "Aviak Talons",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  for (const label of ["Clerics of Underfoot", "Kazon Stormhammer", "Miners Guild 249"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Bandit Sashes
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:chesgard-sydwen";
  addGiver(giverId, "Chesgard Sydwen", zoneId);

  const questId = "quest:bandit-sashes";
  addNode({
    id: questId,
    label: "Bandit Sashes",
    type: "quest",
    description: "Chesgard Sydwen, in South Qeynos's house of thunder, rewards adventurers for thinning out the bandits, brigands, highwaymen, and raiders of the Karanas -- repeatable, one bronze weapon per sash.",
    classes: [],
    minLevel: 8,
    steps: [
      "Kill bandits, brigands, highwaymen, or raiders in the Karanas and loot a Bandit Sash",
      "Turn the sash in to Chesgard Sydwen in South Qeynos for a bronze weapon, coin, and faction (repeatable for more of each)",
    ],
    wiki_title: "Bandit Sashes",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  for (const label of ["Guards of Qeynos", "Priests of Life", "Knights of Thunder"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Bandit Spectacles
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:gehna-solbenya";
  addGiver(giverId, "Gehna Solbenya", zoneId);

  const questId = "quest:bandit-spectacles";
  addNode({
    id: questId,
    label: "Bandit Spectacles",
    type: "quest",
    description: "Gehna Solbenya in South Qeynos sends adventurers to hunt bandit healers in the Plains of Karana for their spectacles, paying out coin and a choice of starter spell per hand-in.",
    classes: [],
    minLevel: 10,
    steps: [
      "Hail Gehna Solbenya in South Qeynos and agree to hunt bandit binders",
      "Travel to the Plains of Karana and collect spectacles from bandit healers",
      "Return two spectacles to Gehna Solbenya for coin, faction, and a random spell scroll",
    ],
    wiki_title: "Bandit Spectacles",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  addEdge(questId, "spell:center", "rewards");
  addEdge(questId, "spell:endure-poison", "rewards");

  for (const label of ["Knights of Thunder", "Priests of Life", "Guards of Qeynos"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Barnacle Breastplate Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const giverId = "npc:erudin:weligon-steelherder";
  addGiver(giverId, "Weligon Steelherder", zoneId);

  const questId = "quest:barnacle-breastplate-quest";
  addNode({
    id: questId,
    label: "Barnacle Breastplate Quest",
    type: "quest",
    description: "Weligon Steelherder, in Erudin's Deepwater Knights guild, sends adventurers of at least Amiable faction to hunt a diseased shark and her young for a Barnacle Breastplate.",
    classes: ["bard", "cleric", "paladin", "ranger", "shadow knight", "shaman", "warrior"],
    minLevel: 10,
    steps: [
      "Speak to Weligon Steelherder about ocean protection and agree to hunt the diseased shark",
      "Receive an Empty Shark Bag, a 4-slot Small container",
      "Collect the Heretic Shark Skin and three Baby Shark Remains, and combine them in the bag",
      "Return the Bag of Shark Remains to Weligon Steelherder",
    ],
    wiki_title: "Barnacle Breastplate Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const breastplateId = "item:barnacle-breastplate";
  addNode({
    id: breastplateId,
    label: "Barnacle Breastplate",
    type: "item",
    slots: ["Chest"],
    ac: 8,
    resists: { fire: 3, cold: 3 },
    weight: 5.0,
    size: "Large",
    classes: ["bard", "cleric", "paladin", "ranger", "shadow knight", "shaman", "warrior"],
    lore: true,
    source: "Barnacle Breastplate Quest reward (Weligon Steelherder, Erudin)",
  });
  addEdge(questId, breastplateId, "rewards");

  for (const label of ["Deepwater Knights", "High Council of Erudin"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Basilisk Tongues
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ak-anon";
  const giverId = "npc:ak-anon:larkon-theardor";
  addGiver(giverId, "Larkon Theardor", zoneId);

  const questId = "quest:basilisk-tongues";
  addNode({
    id: questId,
    label: "Basilisk Tongues",
    type: "quest",
    description: "Larkon Theardor in Ak'Anon trades four basilisk tongues for a random starter caster spell.",
    classes: ["cleric", "druid", "enchanter", "magician", "necromancer", "paladin", "shaman", "wizard"],
    minLevel: 10,
    steps: [
      "Travel beyond Ak'Anon and hunt basilisks for their tongues",
      "Return 4 Basilisk Tongues to Larkon Theardor for a random spell",
    ],
    wiki_title: "Basilisk Tongues",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  for (const spellId of ["spell:burst-of-flame", "spell:elementaling-water", "spell:elementalkin-earth", "spell:fire-flux", "spell:gate", "spell:true-north"]) {
    addEdge(questId, spellId, "rewards");
  }

  for (const label of ["Eldritch Collective", "Gem Choppers", "King AkAnon"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Bat Wings
// ---------------------------------------------------------------------
{
  const zoneId = "zone:southern-felwithe";
  const giverId = "npc:southern-felwithe:niola-impholder";
  addGiver(giverId, "Niola Impholder", zoneId);

  const questId = "quest:bat-wings";
  addNode({
    id: questId,
    label: "Bat Wings",
    type: "quest",
    description: "Niola Impholder in the Felwithe Magician's Guild trades four bat wings for a starter spell.",
    classes: ["magician"],
    minLevel: 1,
    steps: [
      "Hail Niola Impholder in the Felwithe Magician's Guild, Southern Felwithe",
      "Collect 4 Bat Wings (unstacked) and hand them over for a spell",
    ],
    wiki_title: "Bat Wings",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  addEdge(questId, "spell:flare", "rewards");
  addEdge(questId, "spell:shield-of-fire", "rewards");

  for (const label of ["Keepers of the Art", "King Tearis Thex", "Faydarks Champions"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Bearskin Gloves Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kithicor-forest";
  const giverId = "npc:kithicor-forest:ged-twigborn";
  addGiver(giverId, "Ged Twigborn", zoneId);

  const questId = "quest:bearskin-gloves-quest";
  addNode({
    id: questId,
    label: "Bearskin Gloves Quest",
    type: "quest",
    description: "Ged Twigborn in Kithicor Forest crafts Bearskin Gloves for 25 gold plus a High Quality Bear Skin.",
    classes: [],
    minLevel: 7,
    steps: [
      "Collect a High Quality Bear Skin (from a brown bear, bear cub, black bear, or polar bear)",
      "Pay Ged Twigborn 25 gold and hand over the bear skin for a pair of Bearskin Gloves",
    ],
    wiki_title: "Bearskin Gloves Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const glovesId = "item:bearskin-gloves";
  addNode({
    id: glovesId,
    label: "Bearskin Gloves",
    type: "item",
    slots: ["Hands"],
    ac: 5,
    weight: 2.1,
    size: "Small",
    classes: ["bard", "beastlord", "berserker", "cleric", "druid", "monk", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"],
    source: "Bearskin Gloves Quest reward (Ged Twigborn, Kithicor Forest)",
  });
  addEdge(questId, glovesId, "rewards");
}

// ---------------------------------------------------------------------
// Blessed Oil Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:western-karana";
  const giverId = "npc:western-karana:brother-estle";
  addGiver(giverId, "Brother Estle", zoneId);

  const questId = "quest:blessed-oil-quest";
  addNode({
    id: questId,
    label: "Blessed Oil Quest",
    type: "quest",
    description: "Brother Estle, on the road in Western Karana, sends clerics of at least Amiable faction on a relay through North Qeynos's Temple of Life and Splitpaw Lair for spells and a final Temple reward.",
    classes: ["cleric"],
    minLevel: 1,
    steps: [
      "Find Brother Estle on the road in Western Karana and discuss the blessed oil",
      "Travel to the Temple of Life in North Qeynos and speak with Priestess Jahnda, who directs you to Nomsoe Jusagta",
      "Accept the Blessed Oil Flask from Nomsoe and deliver it to Brother Estle, receiving Prayer Beads in return",
      "Deliver the beads to Priestess Jahnda and receive a Temple Summons",
      "Carry the summons to Brother Hayle in Splitpaw Lair and receive a key",
      "Trade the key with Tyokan Mekase at the Temple shop for a final random cleric spell",
    ],
    wiki_title: "Blessed Oil Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  addEdge(questId, "spell:inspire-fear", "rewards");
  addEdge(questId, "spell:ward-summoned", "rewards");

  for (const label of ["Priests of Life", "Knights of Thunder", "Guards of Qeynos", "Antonius Bayle"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Blurred Map Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:tabure-ahendle";
  addGiver(giverId, "Tabure Ahendle", zoneId);

  const questId = "quest:blurred-map-quest";
  addNode({
    id: questId,
    label: "Blurred Map Quest",
    type: "quest",
    description: "Tabure Ahendle in South Qeynos's Steel Warriors Arena trades a blurred map, looted from a zombie sailor in Erud's Crossing, for coin and a random weapon -- requires at least Amiable faction.",
    classes: [],
    minLevel: 10,
    steps: [
      "Loot a Blurred Map from a zombie sailor in Erud's Crossing",
      "Hand the map to Tabure Ahendle in the South Qeynos Steel Warriors Arena",
    ],
    wiki_title: "Blurred Map Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const swordId = "item:cast-iron-long-sword";
  addNode({
    id: swordId,
    label: "Cast-Iron Long Sword",
    type: "item",
    slots: ["Primary", "Secondary"],
    skill: "1H Slashing",
    damage: 6,
    delay: 32,
    weight: 7.5,
    size: "Medium",
    classes: ["warrior", "paladin", "ranger", "shadow knight", "bard", "rogue"],
    source: "Blurred Map Quest reward (Tabure Ahendle, South Qeynos)",
  });
  addEdge(questId, swordId, "rewards");

  const maceId = "item:cast-iron-mace";
  addNode({
    id: maceId,
    label: "Cast-Iron Mace",
    type: "item",
    slots: ["Primary", "Secondary"],
    skill: "1H Blunt",
    damage: 5,
    delay: 38,
    weight: 19.0,
    size: "Medium",
    classes: ["bard", "beastlord", "berserker", "cleric", "druid", "monk", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"],
    source: "Blurred Map Quest reward (Tabure Ahendle, South Qeynos)",
  });
  addEdge(questId, maceId, "rewards");

  for (const label of ["Steel Warriors", "Guards of Qeynos", "Knights of Truth"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Bone Granite Powder Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:west-cabilis";
  const giverId = "npc:west-cabilis:jondin";
  addGiver(giverId, "Jondin", zoneId);

  const questId = "quest:bone-granite-powder-quest";
  addNode({
    id: questId,
    label: "Bone Granite Powder Quest",
    type: "quest",
    description: "Jondin in West Cabilis trades a forged Bone Granite Powder for the Kromdul Toothpick, a shaman piercing weapon.",
    classes: ["shaman"],
    minLevel: 3,
    steps: [
      "Hail Jondin in West Cabilis",
      "Combine 1 Pile of Granite Pebbles, 2 Bone Chips, and 1 Forging Hammer in a Forge (Trivial: 21) to produce Bone Granite Powder",
      "Give the Bone Granite Powder to Jondin",
    ],
    wiki_title: "Bone Granite Powder Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const toothpickId = "item:kromdul-toothpick";
  addNode({
    id: toothpickId,
    label: "Kromdul Toothpick",
    type: "item",
    slots: ["Back", "Primary"],
    skill: "Piercing",
    damage: 5,
    delay: 38,
    ac: 1,
    weight: 7.0,
    size: "Large",
    classes: ["shaman"],
    source: "Bone Granite Powder Quest reward (Jondin, West Cabilis)",
  });
  addEdge(questId, toothpickId, "rewards");

  for (const label of ["Brood of Kotiz", "Legion of Cabilis"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Bottle of Red Wine
// ---------------------------------------------------------------------
{
  const zoneId = "zone:neriak-3rd-gate";
  const giverId = "npc:neriak-3rd-gate:lokar-to-biath";
  addGiver(giverId, "Lokar To`Biath", zoneId);

  const questId = "quest:bottle-of-red-wine";
  addNode({
    id: questId,
    label: "Bottle of Red Wine",
    type: "quest",
    description: "Lokar To`Biath, in the library of Neriak's 3rd Gate, trades up to four bottles of Red Wine for coin-free faction -- no negative faction consequences.",
    classes: [],
    minLevel: 1,
    steps: [
      "Find Lokar To`Biath in the library of Neriak 3rd Gate",
      "Hand her a Red Wine (up to 4, unstacked)",
    ],
    wiki_title: "Bottle of Red Wine",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  for (const label of ["Dreadguard Outer", "Dreadguard Inner", "Dark Bargainers"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Book of Turmoil Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:neriak-3rd-gate";
  const giverId = "npc:neriak-3rd-gate:lokar-to-biath";
  addGiver(giverId, "Lokar To`Biath", zoneId);

  const questId = "quest:book-of-turmoil-quest";
  addNode({
    id: questId,
    label: "Book of Turmoil Quest",
    type: "quest",
    description: "Lokar To`Biath in Neriak's 3rd Gate library sends paladins on a dark chain through his own sister Rysva and the Oracle of K`Arnon at Ocean of Tears, culminating in slaying Lokar himself.",
    classes: ["paladin"],
    minLevel: 40,
    steps: [
      "Hand Lokar To`Biath 70 gold in the library of Neriak 3rd Gate",
      "Give the note from her brother to Rysva To`Biath in the Blind Fish Tavern",
      "Return to Lokar and slay him, then loot his Decapitated Head",
      "Hand the head and note to Rysva",
      "Travel to Ocean of Tears and give the Book of Turmoil to the Oracle of K`Arnon",
    ],
    wiki_title: "Book of Turmoil Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const torchId = "item:glowing-torch";
  addNode({
    id: torchId,
    label: "Glowing Torch",
    type: "item",
    slots: ["Primary", "Secondary"],
    ac: 7,
    stats: { cha: 5 },
    weight: 0.1,
    size: "Tiny",
    magic: true,
    lightSource: true,
    source: "Book of Turmoil Quest reward; also drops from Tisella in Lavastorm Mountains",
  });
  addEdge(questId, torchId, "rewards");

  addFactionReward(questId, "Oracle Of Karnon");
}

// ---------------------------------------------------------------------
// Bozinite Pestle Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ak-anon";
  const giverId = "npc:ak-anon:larkon-theardor";
  addGiver(giverId, "Larkon Theardor", zoneId);

  const questId = "quest:bozinite-pestle-quest";
  addNode({
    id: questId,
    label: "Bozinite Pestle Quest",
    type: "quest",
    description: "Larkon Theardor in Ak'Anon sends adventurers to Myre in North Kaladim for a Bozinite Pestle, taken off a mining-bridge mob, for coin and a random mage spell.",
    classes: ["bard", "cleric", "druid", "enchanter", "magician", "monk", "necromancer", "paladin", "shadow knight", "shaman", "warrior", "wizard"],
    minLevel: 10,
    steps: [
      "Speak with Larkon Theardor in Ak'Anon and agree to visit Myre in North Kaladim",
      "Find Myre in North Kaladim and ask for the bozinite pestles",
      "Kill Cleaner VII on the North Kaladim mining bridge to obtain the Bozinite Pestle",
      "Return the pestle to Larkon Theardor",
    ],
    wiki_title: "Bozinite Pestle Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  for (const label of ["Eldritch Collective", "Gem Choppers", "King AkAnon"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Bracers of Erollisi Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ocean-of-tears";
  const giverId = "npc:ocean-of-tears:styria-fearnon";
  addGiver(giverId, "Styria Fearnon", zoneId);

  const questId = "quest:bracers-of-erollisi-quest";
  addNode({
    id: questId,
    label: "Bracers of Erollisi Quest",
    type: "quest",
    description: "Styria Fearnon, on the hill above the Sisters of Erollisi dock in Ocean of Tears, sends adventurers two islands west to Capt Surestout on the Isle of the Seafoam Cyclops for the Bracers of Erollisi.",
    classes: [],
    minLevel: 20,
    steps: [
      "Find Styria Fearnon on the hill next to the dock, Ocean of Tears",
      "Travel two islands west to the Isle of the Seafoam Cyclops and obtain the Bracers of Erollisi from Capt Surestout",
      "Return the bracers to Styria Fearnon for a random trinket reward",
    ],
    wiki_title: "Bracers of Erollisi Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  for (const label of ["Faydarks Champions", "King Tearis Thex", "Clerics of Tunare", "Soldiers of Tunare"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Broken Lute
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:cassius-messus";
  addGiver(giverId, "Cassius Messus", zoneId);

  const questId = "quest:broken-lute";
  addNode({
    id: questId,
    label: "Broken Lute",
    type: "quest",
    description: "Cassius Messus, in South Qeynos's bard guild, sends bards to deliver the Lisera Lute to Vhalen Nostrolo in Southern Karana and carry his reply back for the Hymn of Restoration.",
    classes: ["bard"],
    minLevel: 1,
    steps: [
      "Take the Lisera Lute to Vhalen Nostrolo, composing in the Southern Karana plains near the well",
      "Give him the lute and receive a note",
      "Return the note to Cassius Messus in South Qeynos",
    ],
    wiki_title: "Broken Lute",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  addEdge(questId, "spell:hymn-of-restoration", "rewards");

  for (const label of ["League of Antonican Bards", "Knights of Truth", "Guards of Qeynos"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Brother Trintle (Quest)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-qeynos";
  const giverId = "npc:north-qeynos:suuspa-clanim";
  addGiver(giverId, "Suuspa Clanim", zoneId);

  const questId = "quest:brother-trintle-quest";
  addNode({
    id: questId,
    label: "Brother Trintle (Quest)",
    type: "quest",
    description: "Suuspa Clanim, in North Qeynos's Temple of Life, sends adventurers to hunt down Brother Trintle, a temple member gone bad, in West Karana.",
    classes: [],
    minLevel: 5,
    steps: [
      "Tell Suuspa Clanim in the Temple of Life, North Qeynos, that Brother Trintle attacked Brother Estle",
      "Kill Brother Trintle in West Karana and loot his Busted Prayer Beads",
      "Return the beads to Suuspa Clanim",
    ],
    wiki_title: "Brother Trintle (Quest)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  for (const label of ["Priests of Life", "Knights of Thunder", "Guards of Qeynos", "Antonius Bayle"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Cabilis Pale Ale (Cabilis)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-cabilis";
  const giverId = "npc:east-cabilis:grype";
  addGiver(giverId, "Grype", zoneId);

  const questId = "quest:cabilis-pale-ale-cabilis";
  addNode({
    id: questId,
    label: "Cabilis Pale Ale (Cabilis)",
    type: "quest",
    description: "Grype, found at night in East Cabilis's Tink 'N Babble, trades four Cabilis Pale Ales for a copper piece and a burp -- no faction or experience.",
    classes: [],
    minLevel: 1,
    steps: [
      "Find Grype in the Tink 'N Babble at night, East Cabilis",
      "Buy four Cabilis Pale Ales and give them to him",
    ],
    wiki_title: "Cabilis Pale Ale (Cabilis)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Call of Flame Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:greater-faydark";
  const giverId = "npc:greater-faydark:lily-ashwood";
  addGiver(giverId, "Lily Ashwood", zoneId);

  const questId = "quest:call-of-flame-quest";
  addNode({
    id: questId,
    label: "Call of Flame Quest",
    type: "quest",
    description: "Lily Ashwood in Greater Faydark sends high-level rangers on a long relay through Ganelorn Oast in East Karana, Kithicor Forest, North Kaladim, Nagafen's Lair, and Lower Guk, ending with the Call of Flame spell.",
    classes: ["ranger"],
    minLevel: 50,
    steps: [
      "Get a sealed Love Letter from Lily Ashwood in Greater Faydark",
      "Give the letter to Ganelorn Oast in East Karana and receive Albino Rattlesnake Eggs",
      "Take the eggs to Kithicor in Kithicor Forest and receive a Symbol of Achievement",
      "Return the symbol to Ganelorn Oast and receive a Note of Credit",
      "Take the note to Aanina Rockfinder in North Kaladim and receive a Gift",
      "Collect a Burnt Sash from Nagafen's Lair, an Adamantite Band from Lower Guk, and an Electrum-Bladed Wakizashi",
      "Give the sash, band, wakizashi, and gift to Ganelorn Oast",
      "Kill Vance Bearstalker and loot his head",
      "Give the head to Ganelorn Oast and receive the Call of Flame spell",
    ],
    wiki_title: "Call of Flame Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  addEdge(questId, "spell:call-of-flame", "rewards");
}

// ---------------------------------------------------------------------
// Captain Nealith's Brother
// ---------------------------------------------------------------------
{
  const zoneId = "zone:firiona-vie";
  const giverId = "npc:firiona-vie:captain-nealith";
  addGiver(giverId, "Captain Nealith", zoneId);

  const questId = "quest:captain-nealiths-brother";
  addNode({
    id: questId,
    label: "Captain Nealith's Brother",
    type: "quest",
    description: "Captain Nealith in Firiona Vie, first met during the Drolvarg Teeth quest, sends adventurers after a drolvarg scavenger for word of his missing siblings.",
    classes: ["warrior", "ranger", "druid", "rogue"],
    minLevel: 26,
    steps: [
      "Clear the fixed drolvarg spawns at the twin tents until a drolvarg scavenger appears",
      "Kill the scavenger and loot a Bloodsoaked Note",
      "Give the note to Captain Nealith in Firiona Vie",
    ],
    wiki_title: "Captain Nealith's Brother",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const glaiveId = "item:glaive-of-marltek";
  addNode({
    id: glaiveId,
    label: "Glaive of Marltek",
    type: "item",
    slots: ["Primary", "Secondary"],
    skill: "1H Slashing",
    damage: 5,
    delay: 24,
    weight: 5.0,
    size: "Medium",
    classes: ["warrior", "ranger", "druid", "rogue"],
    magic: true,
    lore: true,
    effect: "Snare (Combat, Instant) at Level 15",
    source: "Captain Nealith's Brother reward (Captain Nealith, Firiona Vie)",
  });
  addEdge(questId, glaiveId, "rewards");

  for (const label of ["Inhabitants of Firiona Vie", "Emerald Warriors", "Storm Guard"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Catfish Tail
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const giverId = "npc:erudin:vynon-estaliun";
  addGiver(giverId, "Vynon Estaliun", zoneId);

  const questId = "quest:catfish-tail";
  addNode({
    id: questId,
    label: "Catfish Tail",
    type: "quest",
    description: "Vynon Estaliun in Erudin sends adventurers to Kerra Ridge in Toxxulia Forest to slay a catfisher for its tail.",
    classes: [],
    minLevel: 7,
    steps: [
      "Hail Vynon Estaliun in Erudin and agree to face fear",
      "Travel to Kerra Ridge in Toxxulia Forest and slay a catfisher",
      "Loot a Fishy Cat Tail and hand it in to Vynon Estaliun",
    ],
    wiki_title: "Catfish Tail",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  const ringId = "item:brass-ring";
  addNode({
    id: ringId,
    label: "Brass Ring",
    type: "item",
    slots: ["Finger"],
    stats: { cha: 1 },
    weight: 0,
    size: "Tiny",
    lore: true,
    noTrade: true,
    source: "Catfish Tail reward (Vynon Estaliun, Erudin); also a reward of Taxes and Wenbie's Muffins",
  });
  addEdge(questId, ringId, "rewards");

  const torchId2 = "item:torch";
  addNode({
    id: torchId2,
    label: "Torch",
    type: "item",
    slots: ["Secondary"],
    weight: 0.5,
    size: "Small",
    lightSource: true,
    value: "1s",
    source: "Catfish Tail reward (Vynon Estaliun, Erudin); also sold by merchants across many zones",
  });
  addEdge(questId, torchId2, "rewards");

  for (const label of ["Peace Keepers", "High Council of Erudin"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Cannibalize II (Good)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:firiona-vie";
  const giverId = "npc:firiona-vie:marlyn-mcmerin";
  addGiver(giverId, "Marlyn McMerin", zoneId);

  const questId = "quest:cannibalize-ii-good";
  addNode({
    id: questId,
    label: "Cannibalize II (Good)",
    type: "quest",
    description: "Marlyn McMerin in Firiona Vie sends high-level shamans across City of Mist, Timorous Deep, Trakanon's Teeth, and Karnor's Castle for four reagents that teach Cannibalize II.",
    classes: ["shaman"],
    minLevel: 40,
    steps: [
      "Obtain Strange Ochre Clay from an army behemoth in City of Mist",
      "Obtain Crushed Diamonds, a ground spawn in Timorous Deep",
      "Obtain Yun Shaman Powder from a froglok yun shaman in Trakanon's Teeth",
      "Obtain Greyish Bone Chips from a skeletal warlord in Karnor's Castle",
      "Give all four items to Marlyn McMerin in Firiona Vie",
    ],
    wiki_title: "Cannibalize II (Good)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  addEdge(questId, "spell:cannibalize-ii", "rewards");

  for (const label of ["Firiona Vie", "Emerald Warriors", "Storm Guard"]) {
    addFactionReward(questId, label);
  }
}

// ---------------------------------------------------------------------
// Cheslin's Illusion Cards
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:chesgard-sydwen";
  addGiver(giverId, "Chesgard Sydwen", zoneId);

  const questId = "quest:cheslins-illusion-cards";
  addNode({
    id: questId,
    label: "Cheslin's Illusion Cards",
    type: "quest",
    description: "Chesgard Sydwen in South Qeynos sends adventurers to escort his son, Guard Cheslin, on patrol through Qeynos Hills and collect the illusion cards he drops along the way.",
    classes: [],
    minLevel: 5,
    steps: [
      "Hail Chesgard Sydwen in South Qeynos and learn about his son Cheslin",
      "Find Guard Cheslin in a tower in Qeynos Hills and escort him on patrol",
      "Collect the four illusion cards he drops (Chrono Cyclone, Diamond Vale, Ebon Lotus, Library of Erudin) and return them to him",
      "Deliver Cheslin's letter back to Chesgard Sydwen for a piece of Raw Hide armor",
    ],
    wiki_title: "Cheslin's Illusion Cards",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "located_in");

  for (const label of ["Guards of Qeynos", "Antonius Bayle", "Merchants of Qeynos", "Knights of Thunder"]) {
    addFactionReward(questId, label);
  }
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 036 complete: 25 more quests added");
