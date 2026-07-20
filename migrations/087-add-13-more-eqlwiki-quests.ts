/**
 * Migration 087: 13 more standalone quests off GitHub issue #26's checklist
 * -- the "Rogue Errands" through "Scouts Leggings" run -- plus 6 quest_group
 * clusters (decisions/quest-group-node-type.md) surfaced along the way.
 * Researched directly against eqlwiki.com, following
 * decisions/eqlwiki-quest-research-method.md.
 *
 * New zone (per the issue's own zone-creation guardrail -- confirmed a real
 * separate zone, not a sub-location): Erudin Palace. eqlwiki.com's own
 * Erudin page lists "Erudin Palace (a separate zone)" under Adjacent Zones,
 * reachable only by teleporter from Erudin proper, with its own /who
 * shortname ("erudnint") distinct from Erudin's, its own bank, and three
 * guild towers (Crimson Hands, Gate Callers, Craft Keepers). No faction
 * table quoted on either page, so it gets the same "uninhabited wilderness"
 * template migrations 020/052 use when eqlwiki.com documents no specific
 * race/class/deity gate.
 *
 * `quest_group` (six sibling-set clusters, no ordering between members,
 * same shape as migration 062's Bard armor quests and migration 063's
 * Cleric armor/Plane of Sky Tests):
 * - Rogue Kael Armor Quests, Rogue Skyshrine Armor Quests, Rogue Thurgadin
 *   Armor Quests (7 independent piece turn-ins each, one giver per zone)
 * - Rogue Plane of Sky Tests (6 independent tests, 2 givers x 3 each)
 * - Scarab Armor Quests (3 independent piece turn-ins, one giver)
 * - Scaled Mystic Armor Quests (8 independent piece turn-ins, two givers)
 *
 * Deferred, not modeled (per the issue's own guardrail: a standalone
 * checklist entry that turns out to be a genuine multi-stage questline gets
 * deferred to the Questlines section for a dedicated pass, not modeled
 * piecemeal):
 * - Rogue Epic Quest -- eqlwiki.com confirms a long ordered chain (pickpocket
 *   two parchment pieces in Kaladim/Neriak, retrieve the Book of Souls from
 *   Plane of Hate, defeat Renux Herkanor and General V'ghera, final turn-in
 *   to Stanos Herkanor for Ragebringer) -- the same dedicated multi-node
 *   quest_line treatment Armor of Ro / Crusader's Tests got, not a
 *   single migration-entry afterthought.
 *
 * Skipped and tagged broken (not modeled, per the issue's own guardrail):
 * - Sad Klandicar -- eqlwiki.com's own page says "No one knows how to
 *   continue this quest," with only initial NPC dialogue documented and no
 *   completion steps or reward.
 *
 * Deliberately NOT modeled (consistent with every migration so far):
 * - Negative faction changes throughout (decisions/quest-reward-modeling.md
 *   only models positive rewards): Rogue Errands' Ring of Scale/Guards of
 *   Qeynos loss, Rohand's Brandy's Circle Of Unseen Hands loss, Runescale
 *   Cloak's Shadowed Men loss, Rungupp's Dark Ones/Shadowknights of Night
 *   Keep/Heretics loss, Scout Blade's Circle Of Unseen Hands/Corrupt Qeynos
 *   Guards/Kane Bayle loss, Saucy Salted Seadragon Steak's Ulthork loss,
 *   Scarab Armor Quests' Craknek Warriors loss.
 * - Coin rewards throughout (Rusted Black Boxes' 1-2g3s1c, Scorpion Pincers'
 *   2 silver, Scarab Armor's gold costs) -- no coin field on `quest` nodes.
 * - Rogue Redemption's Runescale Cloak Quest-adjacent Never Stop
 *   Chopping/Case of Spirits intermediate trade items -- prose-only in
 *   `steps`, not modeled as reward/intermediate item nodes, since they're
 *   pass-through trade goods rather than a kept reward (consistent with
 *   how migration 086 treated Reinforcements' intermediate mask/cloak,
 *   which *did* get nodes since they were named, standalone-useful items;
 *   these are named but immediately consumed toward the next step).
 * - Rungupp's "Spell: Fire Flux (or Burn, depending on availability)" --
 *   wiki itself is uncertain which spell is actually granted, so left
 *   prose-only rather than guessing a `rewards` edge to either spell node.
 * - Scholar Darnath's Help's Round Robin reward list (Zombie Flesh Bracer,
 *   Paebala Fetish, Cloak of Confusion, plus unspecified lower-level
 *   alternates) -- the "alternative items for lower levels" aren't named,
 *   so only the three confirmed level-46+ choices get `rewards` edges.
 *
 * Random-choice reward (decisions/quest-reward-modeling.md's `randomGroup`):
 * none this batch -- Scholar Darnath's three named rewards are a real
 * player choice ("Round Robin selection"), modeled as ordinary guaranteed
 * `rewards` edges, same treatment as migration 062's Bladed Weapons.
 *
 * Reused existing nodes: Manik Compolten (npc:ak-anon:manik-compolten,
 * from migration 086's Red V Clockwork) for Rusted Black Boxes; Vilissia
 * (npc:temple-of-solusek-ro:vilissia, from migration 086's Rod of Insidious
 * Glamour Quest) for Runescale Cloak Quest; Tylfon
 * (npc:greater-faydark:tylfon) for Scouts Leggings.
 *
 * No other new zone stubs needed -- every other zone touched (North
 * Qeynos, Temple of Solusek Ro, South Qeynos, Toxxulia Forest, Ak'Anon,
 * Steamfont Mountains, Lake of Ill Omen, Cobalt Scar, East Commonlands,
 * Field of Bone, Greater Faydark, High Keep, Crushbone, Dagnor's Cauldron,
 * Kael Drakkal, Skyshrine, Thurgadin, Plane of Sky, South Kaladim, East
 * Cabilis) already exists in the graph.
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, addFactionReward, addGiver, slug, save } = loadGraph(import.meta.dir);

// ---------------------------------------------------------------------
// Erudin Palace (zone) -- new, real separate zone, no documented faction
// table, so it gets the "uninhabited wilderness" default
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

const erudinPalaceId = "zone:erudin-palace";
addNode({ id: erudinPalaceId, label: "Erudin Palace", type: "zone", faction: structuredClone(WILDERNESS_FACTION) });
addEdge(erudinPalaceId, "zone:erudin", "connects_to", { transport: "translocator" });
addEdge("zone:erudin", erudinPalaceId, "connects_to", { transport: "translocator" });

// ---------------------------------------------------------------------
// Rogue Errands
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-qeynos";
  const giverId = "npc:north-qeynos:knargon-lanenda";
  addGiver(giverId, "Knargon Lanenda", zoneId);

  const questId = "quest:rogue-errands";
  addNode({
    id: questId,
    label: "Rogue Errands",
    type: "quest",
    classes: ["rogue"],
    description:
      "Knargon Lanenda in North Qeynos sends Rogues through a chain of deliveries and coded messages -- a Bent Playing Card to Jracol Brestiage outside the north gate, a note relayed through Hanns Krieghor and Zannsin Resdinet, a letter to Prak at the Golden Rooster in Highpass, and finally Guard Stald's badge -- for the Black Leather Cloak. Faction gains with Carson McCabe, Highpass Guards, and Circle of Unseen Hands.",
    minLevel: 1,
    steps: [
      "Receive a Bent Playing Card from Knargon Lanenda in North Qeynos",
      "Find Jracol Brestiage outside the north gate (spawns 8 PM-5 AM) and say \"Lovely night for a stroll\"",
      "Hand him the card and receive a note back",
      "Return the note to Knargon Lanenda",
      "Deliver a message to Hanns Krieghor, then relay instructions to Zannsin Resdinet",
      "Take a letter to Prak at the Golden Rooster in Highpass",
      "Kill Guard Stald and retrieve his badge",
      "Return the badge to Knargon Lanenda",
    ],
    wiki_title: "Rogue Errands",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Carson McCabe");
  addFactionReward(questId, "Highpass Guards");
  addFactionReward(questId, "Circle of Unseen Hands");

  const cloakId = "item:black-leather-cloak";
  addNode({
    id: cloakId,
    label: "Black Leather Cloak",
    type: "item",
    slots: ["Back"],
    ac: 1,
    stats: { dex: 2, agi: 2 },
    source: "Rogue Errands reward (Knargon Lanenda, North Qeynos)",
  });
  addEdge(questId, cloakId, "rewards");
}

// ---------------------------------------------------------------------
// Rogue Redemption
// ---------------------------------------------------------------------
{
  const zoneId = "zone:temple-of-solusek-ro";
  const giverId = "npc:temple-of-solusek-ro:lon-the-redeemed";
  addGiver(giverId, "Lon the Redeemed", zoneId);

  const questId = "quest:rogue-redemption";
  addNode({
    id: questId,
    label: "Rogue Redemption",
    type: "quest",
    classes: ["rogue"],
    description:
      "Lon the Redeemed in Temple of Solusek Ro sends a sealed note through Conium Darkblade in Dagnor's Cauldron and Bryan McGee in Highpass Hold, trading toward 10 different alcoholic beverages combined into a Case of Spirits for a Gem of Stamina, then a Gem Case and two tiny keys given to Ortallius in South Ro for the Burning Rapier. Faction gains with Coalition of Tradefolk Underground, Coalition of Tradefolk, Carson McCabe, Corrupt Qeynos Guards, The Freeport Militia, King Tearis Thex, and Temple Of Sol Ro; faction losses with Mayong Mistmoore and Shadowed Men.",
    minLevel: 30,
    steps: [
      "Obtain a sealed note from Lon the Redeemed in Temple of Solusek Ro",
      "Deliver the note to Conium Darkblade in Dagnor's Cauldron for an axe",
      "Trade the axe to Bryan McGee in Highpass Hold for a Bottle Crate",
      "Collect 10 different alcoholic beverages and combine them in the Bottle Crate for a Case of Spirits",
      "Turn the Case of Spirits in to Bryan McGee for a Gem of Stamina",
      "Obtain a Gem Case and two tiny keys through separate tasks",
      "Give both gems to Ortallius in South Ro for the Burning Rapier",
    ],
    wiki_title: "Rogue Redemption",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:dagnor-s-cauldron", "located_in");
  addFactionReward(questId, "Coalition of Tradefolk Underground");
  addFactionReward(questId, "Coalition of Tradefolk");
  addFactionReward(questId, "Carson McCabe");
  addFactionReward(questId, "Corrupt Qeynos Guards");
  addFactionReward(questId, "The Freeport Militia");
  addFactionReward(questId, "King Tearis Thex");
  addFactionReward(questId, "Temple Of Sol Ro");

  const rapierId = "item:burning-rapier";
  addNode({
    id: rapierId,
    label: "Burning Rapier",
    type: "item",
    slots: ["Primary"],
    skill: "1H Piercing",
    magic: true,
    stats: { dex: 5, agi: 5 },
    effect: "Ignite, usable at level 30",
    source: "Rogue Redemption reward (Lon the Redeemed, Temple of Solusek Ro)",
  });
  addEdge(questId, rapierId, "rewards");
}

// ---------------------------------------------------------------------
// Rohand's Brandy
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:captain-rohand";
  addGiver(giverId, "Captain Rohand", zoneId);

  const questId = "quest:rohands-brandy";
  addNode({
    id: questId,
    label: "Rohand's Brandy",
    type: "quest",
    description:
      "Captain Rohand at the Mermaid's Lure tavern in South Qeynos takes Brandy (sold in many bars and taverns) for experience and faction with Merchants of Qeynos, Antonius Bayle, Coalition of Tradefolk, and Guards of Qeynos. Repeatable per bottle.",
    minLevel: 1,
    steps: [
      "Buy Brandy from a tavern (e.g. the Lion's Mane Inn)",
      "Hail Captain Rohand at the Mermaid's Lure in South Qeynos and give him the Brandy",
    ],
    wiki_title: "Rohand's Brandy",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Merchants of Qeynos");
  addFactionReward(questId, "Antonius Bayle");
  addFactionReward(questId, "Coalition of Tradefolk");
  addFactionReward(questId, "Guards of Qeynos");
}

// ---------------------------------------------------------------------
// Runescale Cloak Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:temple-of-solusek-ro";
  const giverId = "npc:temple-of-solusek-ro:vilissia";
  addGiver(giverId, "Vilissia", zoneId);

  const questId = "quest:runescale-cloak-quest";
  addNode({
    id: questId,
    label: "Runescale Cloak Quest",
    type: "quest",
    classes: ["wizard"],
    description:
      "Vilissia in Temple of Solusek Ro trades a Lizardscale Cloak (from a Tae Ew Templar in Cazic Thule) plus three Runes of Scale (saltwater crocodile in Upper Guk, deepwater crocodile in Oasis of Marr, firescale crocodile in Lavastorm Mountains) for the Runescale Cloak. Faction gain with Temple Of Sol Ro, loss with Shadowed Men.",
    minLevel: 25,
    steps: [
      "Obtain a Lizardscale Cloak from a Tae Ew Templar in Temple of Cazic Thule",
      "Collect a Rune of Scale from a saltwater crocodile in Upper Guk",
      "Collect a Rune of Scale from a deepwater crocodile in Oasis of Marr",
      "Collect a Rune of Scale from a firescale crocodile in Lavastorm Mountains",
      "Turn everything in to Vilissia in Temple of Solusek Ro",
    ],
    wiki_title: "Runescale Cloak Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:temple-of-cazic-thule", "located_in");
  addEdge(questId, "zone:upper-guk", "located_in");
  addEdge(questId, "zone:oasis-of-marr", "located_in");
  addEdge(questId, "zone:lavastorm-mountains", "located_in");
  addFactionReward(questId, "Temple Of Sol Ro");

  const cloakId = "item:runescale-cloak";
  addNode({
    id: cloakId,
    label: "Runescale Cloak",
    type: "item",
    slots: ["Back"],
    classes: ["wizard"],
    race: ["human", "erudite", "high elf", "dark elf", "gnome"],
    magic: true,
    ac: 5,
    stats: { int: 3, agi: 3 },
    resists: { disease: 1, poison: 1 },
    source: "Runescale Cloak Quest reward (Vilissia, Temple of Solusek Ro)",
  });
  addEdge(questId, cloakId, "rewards");
}

// ---------------------------------------------------------------------
// Rungupp (Quest)
// ---------------------------------------------------------------------
{
  const zoneId = erudinPalaceId;
  const giverId = "npc:erudin-palace:vasile-jahnir";
  addGiver(giverId, "Vasile Jahnir", zoneId);

  const questId = "quest:rungupp-quest";
  addNode({
    id: questId,
    label: "Rungupp (Quest)",
    type: "quest",
    description:
      "Vasile Jahnir at the Tower of the Gate Callers in Erudin Palace sends players to Toxxulia Forest to slay Rungupp the troll and return with his head. Faction gains with Frogloks of Guk, Gate Callers, High Guard of Erudin, and High Council of Erudin; losses with Dark Ones, Shadowknights of Night Keep, and Heretics.",
    minLevel: 1,
    steps: [
      "Receive the quest from Vasile Jahnir at the Tower of the Gate Callers in Erudin Palace",
      "Travel to Toxxulia Forest and slay Rungupp",
      "Loot the Troll Head from Rungupp's corpse",
      "Return the head to Vasile Jahnir",
    ],
    wiki_title: "Rungupp (Quest)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:toxxulia-forest", "located_in");
  addFactionReward(questId, "Frogloks of Guk");
  addFactionReward(questId, "Gate Callers");
  addFactionReward(questId, "High Guard of Erudin");
  addFactionReward(questId, "High Council of Erudin");
}

// ---------------------------------------------------------------------
// Rusted Black Boxes
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ak-anon";
  const giverId = "npc:ak-anon:manik-compolten";
  addGiver(giverId, "Manik Compolten", zoneId);

  const questId = "quest:rusted-black-boxes";
  addNode({
    id: questId,
    label: "Rusted Black Boxes",
    type: "quest",
    description:
      "Manik Compolten at the Gem Choppers guild hall in Ak'Anon trades two rusted blackboxes, looted from rogue clockworks in Steamfont Mountains, for experience and faction with Gem Choppers, King Ak'Anon, and Merchants of Ak'Anon (loss with Clan Grikbar and Dark Reflection).",
    minLevel: 1,
    steps: [
      "Kill rogue clockworks in Steamfont Mountains for two rusted blackboxes",
      "Return them to Manik Compolten in Ak'Anon",
    ],
    wiki_title: "Rusted Black Boxes",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:steamfont-mountains", "located_in");
  addFactionReward(questId, "Gem Choppers");
  addFactionReward(questId, "King AkAnon");
  addFactionReward(questId, "Merchants of AkAnon");
}

// ---------------------------------------------------------------------
// Sarnak Hatchling Brains
// ---------------------------------------------------------------------
{
  const zoneId = "zone:lake-of-ill-omen";
  const giverId = "npc:lake-of-ill-omen:warlord-geot";
  addGiver(giverId, "Warlord Geot", zoneId);

  const questId = "quest:sarnak-hatchling-brains";
  addNode({
    id: questId,
    label: "Sarnak Hatchling Brains",
    type: "quest",
    description:
      "Warlord Geot in Lake of Ill Omen trades four Sarnak Hatchling Brains, from sarnak hatchlings in the zone, for a Dried Froglok Leg and faction with Legion of Cabilis, Cabilis Residents, Scaled Mystics, Crusaders Of Greenmist, and Swift Tails. Repeatable.",
    minLevel: 4,
    steps: [
      "Kill sarnak hatchlings in Lake of Ill Omen for Sarnak Hatchling Brains",
      "Turn in four brains to Warlord Geot",
    ],
    wiki_title: "Sarnak Hatchling Brains",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Legion of Cabilis");
  addFactionReward(questId, "Cabilis Residents");
  addFactionReward(questId, "Scaled Mystics");
  addFactionReward(questId, "Crusaders Of Greenmist");
  addFactionReward(questId, "Swift Tails");

  const legId = "item:dried-froglok-leg";
  addNode({
    id: legId,
    label: "Dried Froglok Leg",
    type: "item",
    source: "Sarnak Hatchling Brains reward (Warlord Geot, Lake of Ill Omen)",
  });
  addEdge(questId, legId, "rewards");
}

// ---------------------------------------------------------------------
// Saucy Salted Seadragon Steak
// ---------------------------------------------------------------------
{
  const zoneId = "zone:cobalt-scar";
  const giverId = "npc:cobalt-scar:bloogy-shellcracker";
  addGiver(giverId, "Bloogy Shellcracker", zoneId);

  const questId = "quest:saucy-salted-seadragon-steak";
  addNode({
    id: questId,
    label: "Saucy Salted Seadragon Steak",
    type: "quest",
    description:
      "Bloogy Shellcracker in Cobalt Scar trades Sea Dragon Meat (from Kelorek'dar, Faydedar, or Lord Koi'Doken), two Saltwater Seaweed (fished in Ocean of Tears, Timorous Deep, or Butcherblock Mountains), and Fish Eggs (combine a Thunder Salmon or Greengill Salmon with a Skinning Knife in a Tackle Box) for the Othmir Prexus Totem. Faction gain with Othmir, loss with Ulthork.",
    minLevel: 1,
    steps: [
      "Obtain Sea Dragon Meat from Kelorek'dar, Faydedar, or Lord Koi'Doken",
      "Fish two Saltwater Seaweed in Ocean of Tears, Timorous Deep, or Butcherblock Mountains",
      "Combine a Thunder Salmon or Greengill Salmon with a Skinning Knife in a Tackle Box for Fish Eggs",
      "Turn everything in to Bloogy Shellcracker in Cobalt Scar",
    ],
    wiki_title: "Saucy Salted Seadragon Steak",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Othmir");

  const totemId = "item:othmir-prexus-totem";
  addNode({
    id: totemId,
    label: "Othmir Prexus Totem",
    type: "item",
    magic: true,
    ac: 5,
    stats: { sta: 20, wis: 18, cha: -8 },
    source: "Saucy Salted Seadragon Steak reward (Bloogy Shellcracker, Cobalt Scar)",
  });
  addEdge(questId, totemId, "rewards");
}

// ---------------------------------------------------------------------
// Scholar Darnath's Help
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-commonlands";
  const giverId = "npc:east-commonlands:scholar-darnath";
  addGiver(giverId, "Scholar Darnath", zoneId);

  const questId = "quest:scholar-darnaths-help";
  addNode({
    id: questId,
    label: "Scholar Darnath's Help",
    type: "quest",
    description:
      "Scholar Darnath in East Commonlands sends players after six chapters from Snowdrift Elves across Norrath, three resonance crystals (Permafrost, Thurgadin, Dreadlands), four lost pages from the Tower of Frozen Shadows, and assorted ingredients (Frostbitten Hide, Emberberry Cluster, Dew of First Light, Goblin Ice Necklace, Fire Goblin Skin), combined with a sewing kit into the Whispers of the Icestar tome. Turning the completed tome in grants a Holiday Gift and a choice of the Zombie Flesh Bracer, Paebala Fetish, or Cloak of Confusion (level 46+).",
    minLevel: 46,
    steps: [
      "Gather six chapters (I-VI) from Snowdrift Elves across Norrath",
      "Gather three resonance crystals (Permafrost, Thurgadin, Dreadlands)",
      "Gather four lost pages from the Tower of Frozen Shadows",
      "Gather a Frostbitten Hide, Emberberry Cluster, Dew of First Light, Goblin Ice Necklace, and Fire Goblin Skin",
      "Combine all chapters with a sewing kit into the Whispers of the Icestar",
      "Turn the completed tome in to Scholar Darnath for a Holiday Gift and a choice of reward",
    ],
    wiki_title: "Scholar Darnath's Help",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:thurgadin", "located_in");
  addEdge(questId, "zone:dreadlands", "located_in");

  const giftId = "item:holiday-gift";
  addNode({
    id: giftId,
    label: "Holiday Gift",
    type: "item",
    source: "Scholar Darnath's Help reward (Scholar Darnath, East Commonlands)",
  });
  addEdge(questId, giftId, "rewards");

  const bracerId = "item:zombie-flesh-bracer";
  addNode({
    id: bracerId,
    label: "Zombie Flesh Bracer",
    type: "item",
    slots: ["Wrist"],
    source: "Scholar Darnath's Help reward choice (Scholar Darnath, East Commonlands)",
  });
  addEdge(questId, bracerId, "rewards");

  const fetishId = "item:paebala-fetish";
  addNode({
    id: fetishId,
    label: "Paebala Fetish",
    type: "item",
    source: "Scholar Darnath's Help reward choice (Scholar Darnath, East Commonlands)",
  });
  addEdge(questId, fetishId, "rewards");

  const cloakId = "item:cloak-of-confusion";
  addNode({
    id: cloakId,
    label: "Cloak of Confusion",
    type: "item",
    slots: ["Back"],
    source: "Scholar Darnath's Help reward choice (Scholar Darnath, East Commonlands)",
  });
  addEdge(questId, cloakId, "rewards");
}

// ---------------------------------------------------------------------
// Scorpion Pincers
// ---------------------------------------------------------------------
{
  const zoneId = "zone:field-of-bone";
  const giverId = "npc:field-of-bone:warlord-zyzz";
  addGiver(giverId, "Warlord Zyzz", zoneId);

  const questId = "quest:scorpion-pincers";
  addNode({
    id: questId,
    label: "Scorpion Pincers",
    type: "quest",
    description:
      "Warlord Zyzz in Field of Bone pays a bounty for four scorpion pincers, collected from small scorpions in the zone. Faction gains with Legion of Cabilis, Cabilis Residents, Scaled Mystics, Crusaders Of Greenmist, and Swift Tails. Repeatable.",
    minLevel: 1,
    steps: [
      "Kill small scorpions in Field of Bone for scorpion pincers",
      "Turn in four pincers to Warlord Zyzz",
    ],
    wiki_title: "Scorpion Pincers",
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
// Scout Blade
// ---------------------------------------------------------------------
{
  const zoneId = "zone:greater-faydark";
  const giverId = "npc:greater-faydark:laren";
  addGiver(giverId, "Laren", zoneId);

  const questId = "quest:scout-blade";
  addNode({
    id: questId,
    label: "Scout Blade",
    type: "quest",
    classes: ["rogue"],
    race: ["wood elf", "half elf"],
    description:
      "Laren in Kelethin (Greater Faydark) sends elf/half-elf Rogues to High Keep -- a Useless Token relayed through Jail Clerk Maryl, Rodrick Marslett, and Fenn Kaedrick leads to slaying Xentil Herkanon and his bodyguards for a Half Elf Head -- traded back for the Scouts Blade. Faction gains with Merchants of Qeynos, Guards of Qeynos, and Tunare's Scouts; losses with Circle Of Unseen Hands, Corrupt Qeynos Guards, and Kane Bayle.",
    minLevel: 1,
    steps: [
      "Receive a Useless Token from Laren in Kelethin",
      "Find Jail Clerk Maryl in High Keep's basement",
      "Speak with Rodrick Marslett in an adjacent cell",
      "Travel to High Keep's roof and give the token to Fenn Kaedrick",
      "Slay Xentil Herkanon and his two bodyguards on the main floor",
      "Loot the Half Elf Head from Xentil Herkanon's corpse",
      "Return the head to Laren",
    ],
    wiki_title: "Scout Blade",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:high-keep", "located_in");
  addFactionReward(questId, "Merchants of Qeynos");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Tunares Scouts");

  const bladeId = "item:scouts-blade";
  addNode({
    id: bladeId,
    label: "Scouts Blade",
    type: "item",
    slots: ["Primary"],
    skill: "1H Piercing",
    classes: ["rogue"],
    race: ["wood elf", "half elf"],
    magic: true,
    damage: 5,
    stats: { str: 2, int: 2 },
    effect: "Backstab +5",
    source: "Scout Blade reward (Laren, Greater Faydark)",
  });
  addEdge(questId, bladeId, "rewards");
}

// ---------------------------------------------------------------------
// Scouts Cape Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:greater-faydark";
  const giverId = "npc:greater-faydark:geeda";
  addGiver(giverId, "Geeda", zoneId);

  const questId = "quest:scouts-cape-quest";
  addNode({
    id: questId,
    label: "Scouts Cape Quest",
    type: "quest",
    classes: ["rogue"],
    race: ["wood elf"],
    description:
      "Geeda, behind the Scouts of Tunare Guild Hall in Kelethin (Greater Faydark), sends a Useless Token to Kelynn in the Crushbone slave mines for a Sealed Note, returned to Geeda for the Scouts Cape. Faction gain with Tunare's Scouts.",
    minLevel: 1,
    steps: [
      "Receive a Useless Token from Geeda in Kelethin",
      "Travel to the Crushbone slave mines and give the token to Kelynn",
      "Receive a Sealed Note from Kelynn",
      "Return the Sealed Note to Geeda",
    ],
    wiki_title: "Scouts Cape Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:crushbone", "located_in");
  addFactionReward(questId, "Tunares Scouts");

  const capeId = "item:scouts-cape";
  addNode({
    id: capeId,
    label: "Scouts Cape",
    type: "item",
    slots: ["Back"],
    classes: ["rogue"],
    race: ["wood elf"],
    magic: true,
    ac: 5,
    stats: { dex: 2 },
    source: "Scouts Cape Quest reward (Geeda, Greater Faydark)",
  });
  addEdge(questId, capeId, "rewards");
}

// ---------------------------------------------------------------------
// Scouts Leggings
// ---------------------------------------------------------------------
{
  const zoneId = "zone:greater-faydark";
  const giverId = "npc:greater-faydark:tylfon";
  addGiver(giverId, "Tylfon", zoneId);

  const questId = "quest:scouts-leggings";
  addNode({
    id: questId,
    label: "Scouts Leggings",
    type: "quest",
    classes: ["rogue"],
    race: ["wood elf", "half elf"],
    description:
      "Tylfon, guildmaster of the Scouts of Tunare in Kelethin's Rogues Guild (Greater Faydark), sends players to Elmion Hendrys in Dagnor's Cauldron, then to North Qeynos to defeat Faldor Hendrys for an Emerald Shard, traded for the Silvermesh Leggings.",
    minLevel: 1,
    steps: [
      "Speak with Tylfon in the Rogues Guild at Kelethin",
      "Talk to Elmion Hendrys in Dagnor's Cauldron to learn his brother's location",
      "Travel to North Qeynos and find Faldor Hendrys",
      "Defeat Faldor Hendrys and loot the Emerald Shard",
      "Return the shard to Tylfon",
    ],
    wiki_title: "Scouts Leggings",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:dagnor-s-cauldron", "located_in");
  addEdge(questId, "zone:north-qeynos", "located_in");

  const leggingsId = "item:silvermesh-leggings";
  addNode({
    id: leggingsId,
    label: "Silvermesh Leggings",
    type: "item",
    slots: ["Legs"],
    classes: ["rogue"],
    race: ["wood elf", "half elf"],
    magic: true,
    ac: 7,
    stats: { agi: 3 },
    resists: { magic: 5 },
    source: "Scouts Leggings reward (Tylfon, Greater Faydark)",
  });
  addEdge(questId, leggingsId, "rewards");
}

// ---------------------------------------------------------------------
// Rogue Kael Armor Quests (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const giverId = "npc:kael-drakkal:kelenek-bluadfeth";
  addGiver(giverId, "Kelenek Bluadfeth", zoneId);

  const groupId = "quest_group:rogue-kael-armor-quests";
  addNode({
    id: groupId,
    label: "Rogue Kael Armor Quests",
    type: "quest_group",
    description:
      "Kelenek Bluadfeth in Kael Drakkel trades an Ancient Tarnished Chain armor piece plus 3 matching gems for its corresponding piece of Deceiver's armor. Seven independent sub-quests, no ordering between them.",
    classes: ["rogue"],
    wiki_title: "Rogue Kael Armor Quests",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const pieces = [
    { label: "Crown", base: "Ancient Tarnished Chain Coif", gem: "3 Crushed Coral", reward: "Deceiver's Crown", ac: 22, stats: { str: 3, dex: 5, sta: 5, hp: 15 } },
    { label: "Chestguard", base: "Ancient Tarnished Chain Tunic", gem: "3 Flawless Diamond", reward: "Deceiver's Chestguard", ac: 48, stats: { str: 15, dex: 8, sta: 6, agi: 14, hp: 60 } },
    { label: "Vambraces", base: "Ancient Tarnished Chain Sleeves", gem: "3 Flawed Emerald", reward: "Deceiver's Vambraces", ac: 24, stats: { str: 2, agi: 7, hp: 50 } },
    { label: "Bracer", base: "Ancient Tarnished Chain Bracer", gem: "3 Crushed Flame Emerald", reward: "Deceiver's Bracer", ac: 17, stats: { str: 4, dex: 4, hp: 15 } },
    { label: "Gauntlets", base: "Ancient Tarnished Chain Gauntlets", gem: "3 Crushed Topaz", reward: "Deceiver's Gauntlets", ac: 17, stats: { str: 3, dex: 1, sta: 1, agi: 5 } },
    { label: "Greaves", base: "Ancient Tarnished Chain Leggings", gem: "3 Flawed Sea Sapphire", reward: "Deceiver's Greaves", ac: 32, stats: { str: 6, dex: 7, agi: 10, hp: 60 } },
    { label: "Boots", base: "Ancient Tarnished Chain Boots", gem: "3 Crushed Black Marble", reward: "Deceiver's Boots", ac: 24, stats: { str: 2, sta: 5, agi: 4, hp: 20 } },
  ];
  for (const piece of pieces) {
    const questId = `quest:rogue-kael-armor-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `Rogue Kael Armor Quests: ${piece.label}`,
      type: "quest",
      classes: ["rogue"],
      description: `Trade a ${piece.base} plus ${piece.gem} to Kelenek Bluadfeth in Kael Drakkel for the ${piece.reward}.`,
      steps: [`Gather a ${piece.base} and ${piece.gem}`, "Turn them in to Kelenek Bluadfeth in Kael Drakkel"],
      wiki_title: "Rogue Kael Armor Quests",
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, groupId, "member_of");

    const rewardId = `item:${slug(piece.reward)}`;
    addNode({
      id: rewardId,
      label: piece.reward,
      type: "item",
      classes: ["rogue"],
      magic: true,
      ac: piece.ac,
      stats: piece.stats,
      source: `Rogue Kael Armor Quests: ${piece.label} reward (Kelenek Bluadfeth, Kael Drakkal)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// ---------------------------------------------------------------------
// Rogue Skyshrine Armor Quests (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:skyshrine";
  const giverId = "npc:skyshrine:crendatha-fedhar";
  addGiver(giverId, "Crendatha Fe`Dhar", zoneId);

  const groupId = "quest_group:rogue-skyshrine-armor-quests";
  addNode({
    id: groupId,
    label: "Rogue Skyshrine Armor Quests",
    type: "quest_group",
    description:
      "Crendatha Fe`Dhar in Skyshrine trades an Unadorned Chain armor piece plus 3 matching gems for its corresponding piece of Shadow armor. Seven independent sub-quests, no ordering between them.",
    classes: ["rogue"],
    wiki_title: "Rogue Skyshrine Armor Quests",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const pieces = [
    { label: "Crown", base: "Unadorned Chain Coif", gem: "3 Crushed Coral", reward: "Shadow Crown", ac: 19, stats: { str: 6, dex: 6, agi: 6, hp: 20 } },
    { label: "Chestguard", base: "Unadorned Chain Tunic", gem: "3 Flawless Diamond", reward: "Shadow Chestguard", ac: 43, stats: { str: 12, dex: 12, sta: 8, agi: 16, hp: 90 } },
    { label: "Vambraces", base: "Unadorned Chain Sleeves", gem: "3 Flawed Emerald", reward: "Shadow Vambraces", ac: 19, stats: { str: 3, dex: 3, sta: 7, hp: 25 } },
    { label: "Bracer", base: "Unadorned Chain Bracer", gem: "3 Crushed Flame Emerald", reward: "Shadow Bracer", ac: 16, stats: { str: 6, agi: 5, hp: 25 } },
    { label: "Gauntlets", base: "Unadorned Chain Gauntlets", gem: "3 Crushed Topaz", reward: "Shadow Gauntlets", ac: 16, stats: { str: 5, dex: 3, sta: 2, agi: 5 } },
    { label: "Greaves", base: "Unadorned Chain Leggings", gem: "3 Flawed Sea Sapphire", reward: "Shadow Greaves", ac: 26, stats: { str: 5, dex: 10, sta: 5, hp: 60 } },
    { label: "Boots", base: "Unadorned Chain Boots", gem: "3 Crushed Black Marble", reward: "Shadow Boots", ac: 21, stats: { str: 3, sta: 6, agi: 4, hp: 20 } },
  ];
  for (const piece of pieces) {
    const questId = `quest:rogue-skyshrine-armor-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `Rogue Skyshrine Armor Quests: ${piece.label}`,
      type: "quest",
      classes: ["rogue"],
      description: `Trade an ${piece.base} plus ${piece.gem} to Crendatha Fe\`Dhar in Skyshrine for the ${piece.reward}.`,
      steps: [`Gather an ${piece.base} and ${piece.gem}`, "Turn them in to Crendatha Fe`Dhar in Skyshrine"],
      wiki_title: "Rogue Skyshrine Armor Quests",
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, groupId, "member_of");

    const rewardId = `item:${slug(piece.reward)}`;
    addNode({
      id: rewardId,
      label: piece.reward,
      type: "item",
      classes: ["rogue"],
      magic: true,
      ac: piece.ac,
      stats: piece.stats,
      source: `Rogue Skyshrine Armor Quests: ${piece.label} reward (Crendatha Fe\`Dhar, Skyshrine)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// ---------------------------------------------------------------------
// Rogue Thurgadin Armor Quests (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:thurgadin";
  const giverId = "npc:thurgadin:foreman-felspar";
  addGiver(giverId, "Foreman Felspar", zoneId);

  const groupId = "quest_group:rogue-thurgadin-armor-quests";
  addNode({
    id: groupId,
    label: "Rogue Thurgadin Armor Quests",
    type: "quest_group",
    description:
      "Foreman Felspar in Thurgadin trades a Corroded Chain armor piece plus 3 matching gems for its corresponding piece of Brigand's armor. Seven independent sub-quests (one piece, the Bracer, comes in two), no ordering between them.",
    classes: ["rogue"],
    wiki_title: "Rogue Thurgadin Armor Quests",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const pieces = [
    { label: "Circlet", base: "Corroded Chain Coif", gem: "3 Crushed Coral", reward: "Brigand's Circlet", ac: 16, stats: { str: 4, dex: 3, sta: 3, hp: 15 } },
    { label: "Chestguard", base: "Corroded Chain Tunic", gem: "3 Flawless Diamond", reward: "Brigand's Chestguard", ac: 37, stats: { str: 6, dex: 12, sta: 6, agi: 14, hp: 60 } },
    { label: "Vambraces", base: "Corroded Chain Sleeves", gem: "3 Flawed Emerald", reward: "Brigand's Vambraces", ac: 16, stats: { str: 7, hp: 25 } },
    { label: "Bracer", base: "Corroded Chain Bracer", gem: "3 Crushed Flame Emerald", reward: "Brigand's Bracer", ac: 13, stats: { sta: 2, agi: 4, hp: 15 } },
    { label: "Gauntlets", base: "Corroded Chain Gauntlets", gem: "3 Crushed Topaz", reward: "Brigand's Gauntlets", ac: 13, stats: { str: 3, dex: 1, sta: 1, agi: 3 } },
    { label: "Greaves", base: "Corroded Chain Leggings", gem: "3 Flawed Sea Sapphire", reward: "Brigand's Greaves", ac: 22, stats: { str: 4, dex: 4, sta: 10, hp: 60 } },
    { label: "Boots", base: "Corroded Chain Boots", gem: "3 Crushed Black Marble", reward: "Brigand's Boots", ac: 18, stats: { sta: 5, agi: 3, hp: 20 } },
  ];
  for (const piece of pieces) {
    const questId = `quest:rogue-thurgadin-armor-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `Rogue Thurgadin Armor Quests: ${piece.label}`,
      type: "quest",
      classes: ["rogue"],
      description: `Trade a ${piece.base} plus ${piece.gem} to Foreman Felspar in Thurgadin for the ${piece.reward}.`,
      steps: [`Gather a ${piece.base} and ${piece.gem}`, "Turn them in to Foreman Felspar in Thurgadin"],
      wiki_title: "Rogue Thurgadin Armor Quests",
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, groupId, "member_of");

    const rewardId = `item:${slug(piece.reward)}`;
    addNode({
      id: rewardId,
      label: piece.reward,
      type: "item",
      classes: ["rogue"],
      magic: true,
      ac: piece.ac,
      stats: piece.stats,
      source: `Rogue Thurgadin Armor Quests: ${piece.label} reward (Foreman Felspar, Thurgadin)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// ---------------------------------------------------------------------
// Rogue Plane of Sky Tests (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:plane-of-sky";
  const thalikId = "npc:plane-of-sky:thalik-silenthand";
  const kendrickId = "npc:plane-of-sky:kendrick-the-great";
  const rayneId = "npc:plane-of-sky:rayne";
  addGiver(thalikId, "Thalik Silenthand", zoneId);
  addGiver(kendrickId, "Kendrick the Great", zoneId);
  addGiver(rayneId, "Rayne", zoneId);

  const groupId = "quest_group:rogue-plane-of-sky-tests";
  addNode({
    id: groupId,
    label: "Rogue Plane of Sky Tests",
    type: "quest_group",
    description:
      "Thalik Silenthand in the Plane of Sky directs Rogues to choose between two apprentices, Kendrick the Great or Rayne, each offering three independent item-turn-in tests for a named reward. Six independent sub-quests, no ordering between them.",
    classes: ["rogue"],
    wiki_title: "Rogue Plane of Sky Tests",
  });
  addEdge(thalikId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const tests: Array<{
    label: string;
    giverId: string;
    giverLabel: string;
    items: string;
    reward: string;
    ac?: number;
    stats: Record<string, number>;
    effect?: string;
  }> = [
    { label: "Test of Thievery", giverId: kendrickId, giverLabel: "Kendrick the Great", items: "an Ivory Tessera, Gem of Invigoration, and Inlaid Choker", reward: "Wispy Choker of Vigor", ac: 5, stats: { str: 9, dex: 9, agi: 3, hp: 20 } },
    { label: "Test of Silence", giverId: kendrickId, giverLabel: "Kendrick the Great", items: "a Spiroc Sky Totem, Pearlescent Globe, and Black Griffon Feather", reward: "Griffon Wing Spauldors", ac: 9, stats: { str: 6, dex: 6, agi: 4, hp: 30 }, effect: "Levitate" },
    { label: "Test of Trickery", giverId: kendrickId, giverLabel: "Kendrick the Great", items: "a Mottled Spiroc Feather, Cracked Leather Belt, and Sphinxian Circlet", reward: "Renard's Belt of Quickness", ac: 6, stats: { str: 5, dex: 12, cha: 5, agi: 12 }, effect: "Haste +41%" },
    { label: "Test of Cunning", giverId: rayneId, giverLabel: "Rayne", items: "a Bronze Disc, Red Face Paint, and Jester's Mask", reward: "Crystal Mask", ac: 8, stats: { str: 6, dex: 8 }, effect: "SV Magic +10, Gather Shadows" },
    { label: "Test of Stealth", giverId: rayneId, giverLabel: "Rayne", items: "a Pegasus Statuette, Prismatic Sphere, and Fine Wool Cloak", reward: "Scintillating Bracer of Protection", ac: 9, stats: { str: 3, dex: 3, wis: 2 }, effect: "+8 all saving throws" },
    { label: "Test of Deception", giverId: rayneId, giverLabel: "Rayne", items: "Honeyed Nectar, a Bixie Stinger, Lightning Rod, and Bloodsky Sapphire", reward: "Thornstinger", stats: { str: 5, dex: 5, agi: 5, hp: 50 }, effect: "Rampage, DMG 12, Backstab 12" },
  ];
  for (const test of tests) {
    const questId = `quest:rogue-plane-of-sky-${slug(test.label)}`;
    addNode({
      id: questId,
      label: `Rogue Plane of Sky Tests: ${test.label}`,
      type: "quest",
      classes: ["rogue"],
      description: `Bring ${test.items} to ${test.giverLabel} in the Plane of Sky for the ${test.reward}.`,
      steps: [`Gather ${test.items}`, `Turn them in to ${test.giverLabel} in the Plane of Sky`],
      wiki_title: "Rogue Plane of Sky Tests",
    });
    addEdge(test.giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, groupId, "member_of");

    const rewardId = `item:${slug(test.reward)}`;
    addNode({
      id: rewardId,
      label: test.reward,
      type: "item",
      classes: ["rogue"],
      magic: true,
      ...(test.ac !== undefined ? { ac: test.ac } : {}),
      stats: test.stats,
      ...(test.effect ? { effect: test.effect } : {}),
      source: `Rogue Plane of Sky Tests: ${test.label} reward (${test.giverLabel}, Plane of Sky)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// ---------------------------------------------------------------------
// Scarab Armor Quests (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-kaladim";
  const giverId = "npc:south-kaladim:vacto-molunel";
  addGiver(giverId, "Vacto Molunel", zoneId);

  const groupId = "quest_group:scarab-armor-quests";
  addNode({
    id: groupId,
    label: "Scarab Armor Quests",
    type: "quest_group",
    description:
      "Vacto Molunel in South Kaladim crafts three small-size Scarab armor pieces from giant scarab remains plus gold. Three independent sub-quests, no ordering between them. Faction gains with Storm Guard, Kazon Stormhammer, Miners Guild 249, and Merchants of Kaladim.",
    wiki_title: "Scarab Armor Quests",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");
  addFactionReward(groupId, "Storm Guard");
  addFactionReward(groupId, "Kazon Stormhammer");
  addFactionReward(groupId, "Miners Guild 249");
  addFactionReward(groupId, "Merchants of Kaladim");

  const pieces: Array<{
    label: string;
    base: string;
    reward: string;
    ac: number;
    stats?: Record<string, number>;
    resists?: Record<string, number>;
    classes: string[];
  }> = [
    { label: "Helm", base: "2 Scarab Carapaces and 5 gold", reward: "Small Scarab Helm", ac: 4, stats: { cha: -1 }, classes: ["warrior", "cleric", "paladin", "ranger", "shadow knight", "druid", "monk", "bard", "rogue", "shaman"] },
    { label: "Breastplate", base: "a pristine giant scarab carapace and 23 gold", reward: "Small Scarab Breastplate", ac: 14, stats: { str: 1, dex: -1, sta: 1, hp: 10 }, resists: { disease: 2 }, classes: ["warrior", "cleric", "paladin", "ranger", "shadow knight", "druid", "monk", "bard", "rogue", "shaman"] },
    { label: "Boots", base: "a cracked giant scarab shell, 2 scarab legs, and 17 gold", reward: "Small Scarab Boots", ac: 4, classes: ["warrior", "cleric", "paladin", "ranger", "druid", "rogue"] },
  ];
  for (const piece of pieces) {
    const questId = `quest:scarab-armor-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `Scarab Armor Quests: ${piece.label}`,
      type: "quest",
      classes: piece.classes,
      description: `Trade ${piece.base} to Vacto Molunel in South Kaladim for the ${piece.reward}.`,
      steps: [`Gather ${piece.base}`, "Turn them in to Vacto Molunel in South Kaladim"],
      wiki_title: "Scarab Armor Quests",
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, groupId, "member_of");

    const rewardId = `item:${slug(piece.reward)}`;
    addNode({
      id: rewardId,
      label: piece.reward,
      type: "item",
      classes: piece.classes,
      size: "Small",
      ac: piece.ac,
      ...(piece.stats ? { stats: piece.stats } : {}),
      ...(piece.resists ? { resists: piece.resists } : {}),
      source: `Scarab Armor Quests: ${piece.label} reward (Vacto Molunel, South Kaladim)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// ---------------------------------------------------------------------
// Scaled Mystic Armor Quests (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-cabilis";
  const shezlieId = "npc:east-cabilis:shezlie-furscale";
  const zazlanId = "npc:east-cabilis:zazlan-furscale";
  addGiver(shezlieId, "Shezlie Furscale", zoneId);
  addGiver(zazlanId, "Zazlan Furscale", zoneId);

  const groupId = "quest_group:scaled-mystic-armor-quests";
  addNode({
    id: groupId,
    label: "Scaled Mystic Armor Quests",
    type: "quest_group",
    description:
      "Shezlie Furscale (Breastplate, Greaves, Gauntlets, Helm) and Zazlan Furscale (Cloak, Boots, Bracers, Vambraces) in East Cabilis each trade a banded armor piece plus assorted gems/quest items for a piece of Scaled Mystic armor, a quested set for Iksar Shamans. Eight independent sub-quests, no ordering between them.",
    classes: ["shaman"],
    race: ["iksar"],
    wiki_title: "Scaled Mystic Armor Quests",
  });
  addEdge(shezlieId, groupId, "starts");
  addEdge(zazlanId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const pieces = [
    { label: "Breastplate", giverId: shezlieId, giverLabel: "Shezlie Furscale", base: "a Banded Mail, Star Ruby, Watchman's Spectacles, and Nectar of Isolation", reward: "Scaled Mystic Breastplate", ac: 17, stats: { hp: 10, agi: 3 } },
    { label: "Greaves", giverId: shezlieId, giverLabel: "Shezlie Furscale", base: "Banded Leggings, a Fire Emerald, Sarnak Recruitment Letter, and Exiled Iksar Head", reward: "Scaled Mystic Greaves", ac: 10, stats: { mana: 5, cha: 5 } },
    { label: "Gauntlets", giverId: shezlieId, giverLabel: "Shezlie Furscale", base: "Banded Gauntlets, a Ruby, Venomous Parchment, and Warlord Drawing Pen", reward: "Scaled Mystic Gauntlets", ac: 9, stats: { hp: 20, int: 5 } },
    { label: "Helm", giverId: shezlieId, giverLabel: "Shezlie Furscale", base: "a Banded Helm, Sapphire, Bargynn's Digger, and Sythrax Building Plans", reward: "Scaled Mystic Helm", ac: 10, stats: { wis: 5, mana: 5 } },
    { label: "Cloak", giverId: zazlanId, giverLabel: "Zazlan Furscale", base: "a Banded Cloak, Star Ruby, Forest Giant Hammer, and Worn Charbone", reward: "Scaled Mystic Cloak", ac: 9, stats: { mana: 10, sta: 5 } },
    { label: "Boots", giverId: zazlanId, giverLabel: "Zazlan Furscale", base: "Banded Boots, a Fire Emerald, Spirit Caller Beads, and Rhino Hoof", reward: "Scaled Mystic Boots", ac: 9, stats: { str: 5 } },
    { label: "Bracers", giverId: zazlanId, giverLabel: "Zazlan Furscale", base: "a Banded Bracer, Ruby, Coercion Implant, and Gooey Adhesive", reward: "Scaled Mystic Bracers", ac: 7, stats: { str: 2, wis: 2 } },
    { label: "Vambraces", giverId: zazlanId, giverLabel: "Zazlan Furscale", base: "Banded Sleeves, a Sapphire, Frenzied Gnawer Tail, and Froglok Treated Planks", reward: "Scaled Mystic Vambraces", ac: 8, stats: { sta: 5, agi: 5, wis: 2 } },
  ];
  for (const piece of pieces) {
    const questId = `quest:scaled-mystic-armor-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `Scaled Mystic Armor Quests: ${piece.label}`,
      type: "quest",
      classes: ["shaman"],
      race: ["iksar"],
      description: `Trade ${piece.base} to ${piece.giverLabel} in East Cabilis for the ${piece.reward}.`,
      steps: [`Gather ${piece.base}`, `Turn them in to ${piece.giverLabel} in East Cabilis`],
      wiki_title: "Scaled Mystic Armor Quests",
    });
    addEdge(piece.giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, groupId, "member_of");

    const rewardId = `item:${slug(piece.reward)}`;
    addNode({
      id: rewardId,
      label: piece.reward,
      type: "item",
      classes: ["shaman"],
      race: ["iksar"],
      magic: true,
      ac: piece.ac,
      stats: piece.stats,
      source: `Scaled Mystic Armor Quests: ${piece.label} reward (${piece.giverLabel}, East Cabilis)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

save();
console.log(
  "Migration 087 complete: added Erudin Palace zone; 13 more standalone quests from GitHub issue #26's checklist (Rogue Errands through Scouts Leggings); 6 quest_group clusters (Rogue Kael/Skyshrine/Thurgadin Armor Quests, Rogue Plane of Sky Tests, Scarab Armor Quests, Scaled Mystic Armor Quests); deferred Rogue Epic Quest to the Questlines section; skipped broken Sad Klandicar"
);
