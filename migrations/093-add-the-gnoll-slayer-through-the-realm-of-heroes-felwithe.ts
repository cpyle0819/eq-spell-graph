/**
 * Migration 093: next standalone batch off GitHub issue #26's checklist --
 * "The Gnoll Slayer" through "The Realm of Heroes -- Felwithe". Researched
 * directly against eqlwiki.com, following decisions/eqlwiki-quest-research-method.md.
 *
 * New zone added (giver's zone was already missing from the graph, per the
 * issue's own guardrail -- a real separate zone, confirmed via its own
 * eqlwiki.com page: its own zone-line/succor point, and it appears as a peer
 * in Southern Karana's own neighbor list):
 * - Splitpaw Lair -- The Gnoll Slayer's farm zone for two of its four turn-in
 *   items ("a one eyed gnoll" and "a Lteth Val Scribe"). Wiki's own page:
 *   "Adjacent Zones: Southern Plains of Karana," succor point leading to the
 *   South Karana zone line. Modeled with a `connects_to` edge to
 *   zone:southern-karana, following migration 020/052's template.
 *
 * Skipped and tagged broken (not modeled, per the issue's own guardrail,
 * quoting the wiki's own disclaimer):
 * - The Loom -- wiki's own disclaimer: "MISSING INFO! Please expand the
 *   content," reward itself listed only as "UNKNOWN! Please correct."
 * - The Realm of Heroes -- Felwithe -- wiki's own disclaimer: "This quest was
 *   for a GM Event on live" -- a one-time developer-run event, not standard
 *   repeatable content any current player can complete; reward listed as
 *   "None (GM event)."
 *
 * Deferred, not modeled (matches an already-deferred cluster's own shape,
 * per the issue's "a cluster can hide behind alphabetically unrelated names"
 * guardrail):
 * - The Lost Circle -- Brother Balatin's "Robe of the Lost Circle" ->
 *   "Robe of the Whistling Fists" turn-in chain is the exact sub-quest the
 *   Quest Groups section's "Monk Armor & Sash/Shackle/Headband Progression"
 *   entry already names ("Monk Epic Quest itself chains through Monks of The
 *   Whistling Fist's 'Robe of the Lost Circle' sub-quest plus a 'Robe of the
 *   Whistling Fists' sub-quest"); not modeled standalone here, tracked under
 *   that existing Questlines-section entry instead.
 *
 * Deliberately NOT modeled as `item` nodes (consistent with prior batches):
 * - Chapter I/The Shatter Sky + Holiday Gift (The Icestar Dims) and Chapter
 *   V/Ashes in the Margins + Holiday Gift (The Icestar Remembers) -- same
 *   no-stat-infobox carve-out as migration 092's Four Fragments chapter/gift
 *   rewards; kept as prose lore rewards only, no reward item edges.
 * - The Nitrates and the Assassin's "low-level Druid spell scrolls" -- vague,
 *   unnamed pool, same carve-out as migration 090's Taskmaster Earring.
 * - The Rat King's "a piece of leather armor" -- vague, unnamed on the wiki.
 * - The Lottery Ticket's six numbered lottery tickets and Highkeep Royal
 *   Suite key -- flavor/access items with no stat infobox, kept as prose.
 * - Coin rewards and negative faction changes throughout, as usual.
 *
 * The Gnome Take's reward pool is a genuinely closed, exhaustive list --
 * wiki's own wording: "Equal chance of one of the following:" (20 named
 * items) -- so all 20 get `randomGroup` reward edges per
 * decisions/quest-reward-modeling.md, not just a sample. 10 of the 20
 * (Copper Amulet, Copper Band, Golden Ear Stud, Hematite, Iony's Absorber,
 * Lapis Lazuli, Malachite, Onyx, Silver Earring, Turquoise) already exist as
 * item nodes from prior quests and are reused; the other 10 are new,
 * unstatted tradeskill/jewelry items with no confirmed slot data on the wiki.
 *
 * The Painting has two mutually exclusive turn-in endings (player's choice
 * of NPC, not a random draw) -- both reward+faction sets are modeled as
 * plain guaranteed edges (no randomGroup, since it's not chance), with the
 * choice documented in the description.
 *
 * The Penance is one turn-in mechanic (Crusader Zixo, East Cabilis) whose
 * reward is determined by the player's own class, not chance -- modeled as
 * one quest with five `rewards` edges, each target item's own `classes`
 * field restricting it to its class, no randomGroup.
 *
 * Reused existing nodes: zones (Qeynos Hills, Blackburrow, North Kaladim,
 * Ak'Anon, Iceclad Ocean, Everfrost Peaks, Eastern Wastes, Erudin, The
 * Warrens, Plane of Growth, Skyshrine, East Freeport, High Keep, South
 * Kaladim, Butcherblock Mountains, Ocean of Tears, Northern Felwithe,
 * Najena, The Overthere, Surefall Glade, Western Karana,
 * South Qeynos, North Qeynos, Kithicor Forest, East Cabilis, Erudin Palace,
 * Qeynos Aqueducts, Permafrost, Icewell Keep, Dreadlands, Cobalt Scar,
 * Southern Karana). Reused existing NPCs: Furtog Ogrebane, Wolten Grafe,
 * Vasile Jahnir.
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, addFactionReward, addGiver, save } = loadGraph(import.meta.dir);

// ---------------------------------------------------------------------
// Splitpaw Lair (new zone -- The Gnoll Slayer's farm zone)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:splitpaw-lair";
  addNode({
    id: zoneId,
    label: "Splitpaw Lair",
    type: "zone",
    faction: {
      race: {
        barbarian: "neutral", "dark elf": "neutral", dwarf: "neutral", erudite: "neutral",
        gnome: "neutral", "half elf": "neutral", halfling: "neutral", "high elf": "neutral",
        human: "neutral", iksar: "neutral", ogre: "neutral", troll: "neutral", "wood elf": "neutral",
      },
      class: {
        bard: "safe", beastlord: "safe", cleric: "safe", druid: "safe", enchanter: "safe",
        magician: "safe", monk: "safe", necromancer: "safe", paladin: "safe", ranger: "safe",
        rogue: "safe", "shadow knight": "safe", shaman: "safe", warrior: "safe", wizard: "safe",
      },
      deity: {
        agnostic: "neutral", bertoxxulous: "neutral", "brell serilis": "neutral", bristlebane: "neutral",
        "cazic-thule": "neutral", "erollisi marr": "neutral", innoruuk: "neutral", karana: "neutral",
        "mithaniel marr": "neutral", prexus: "neutral", quellious: "neutral", "rallos zek": "neutral",
        "rodcet nife": "neutral", "solusek ro": "neutral", "the tribunal": "neutral", tunare: "neutral",
        veeshan: "neutral",
      },
    },
    lore: "Splitpaw Lair (formerly Infected Paw) used to be the home of the Splitpaw clan of gnolls. Now their tribal home has been overrun by another more powerful clan of gnolls.",
    wiki_title: "Splitpaw Lair",
  });
  addEdge(zoneId, "zone:southern-karana", "connects_to");
  addEdge("zone:southern-karana", zoneId, "connects_to");
}

// ---------------------------------------------------------------------
// The Gnoll Slayer
// ---------------------------------------------------------------------
{
  const zoneId = "zone:qeynos-hills";
  const blackburrowId = "zone:blackburrow";
  const splitpawId = "zone:splitpaw-lair";
  const giverId = "npc:qeynos-hills:marton-sayer";
  addGiver(giverId, "Marton Sayer", zoneId);

  const questId = "quest:the-gnoll-slayer";
  addNode({
    id: questId,
    label: "The Gnoll Slayer",
    type: "quest",
    classes: ["bard", "paladin", "ranger", "rogue", "shadow knight", "warrior"],
    minLevel: 30,
    description:
      "Marton Sayer in Qeynos Hills sends players to kill Lord Elgnub in Blackburrow and retrieve Baby Joseph Sayer, rewarding an intermediate Gnoll Slayer weapon; a Gnoll's Eye and Journal of Greater Enchantment from Splitpaw Lair mobs (a one-eyed gnoll and a Lteth Val Scribe), turned in with the intermediate weapon, upgrade it into the final Gnoll Slayer.",
    steps: [
      "Kill Lord Elgnub in Blackburrow and retrieve Baby Joseph Sayer",
      "Return the baby to Marton Sayer for an intermediate Gnoll Slayer",
      "Kill a one-eyed gnoll in Splitpaw Lair for a Gnoll's Eye",
      "Kill a Lteth Val Scribe in Splitpaw Lair for a Journal of Greater Enchantment",
      "Return both items plus the intermediate Gnoll Slayer to Marton Sayer for the final Gnoll Slayer",
    ],
    wiki_title: "The Gnoll Slayer",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, blackburrowId, "located_in");
  addEdge(questId, splitpawId, "located_in");
  addFactionReward(questId, "Merchants of Qeynos");
  addFactionReward(questId, "Antonius Bayle");
  addFactionReward(questId, "Coalition of Tradefolk");
  addFactionReward(questId, "Guards of Qeynos");

  const slayerId = "item:gnoll-slayer";
  addNode({
    id: slayerId,
    label: "Gnoll Slayer",
    type: "item",
    slots: ["Primary", "Secondary"],
    classes: ["warrior", "paladin", "ranger", "shadow knight", "bard", "rogue"],
    skill: "1H Slashing",
    damage: 15,
    delay: 40,
    resists: { disease: 25 },
    charges: 2,
    magic: true,
    lore: true,
    noTrade: true,
    weight: 5.0,
    size: "Medium",
    effect: "Companion Spirit (Any Slot/Can Equip, instant cast) at Level 34",
    source: "The Gnoll Slayer final reward (Marton Sayer, Qeynos Hills); bane damage 10 vs gnolls",
  });
  addEdge(questId, slayerId, "rewards");
}

// ---------------------------------------------------------------------
// The Gnome Take
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-kaladim";
  const akanonId = "zone:ak-anon";
  const giverId = "npc:north-kaladim:jeet";
  addGiver(giverId, "Jeet", zoneId);

  const questId = "quest:the-gnome-take";
  addNode({
    id: questId,
    label: "The Gnome Take",
    type: "quest",
    minLevel: 1,
    description:
      "Jeet in North Kaladim hands over a key; giving it to the correct clockwork scrubber in Ak'Anon (identified by hailing and saying \"628\") yields the Gnome Take, returned to Jeet for an equal chance of one of 20 named jewelry/gem items.",
    steps: [
      "Receive a key from Jeet in North Kaladim",
      "Travel to Ak'Anon and hail clockwork scrubbers, saying \"628\" to find the correct one",
      "Give the key to that scrubber to receive the Gnome Take",
      "Return the Gnome Take to Jeet",
    ],
    wiki_title: "The Gnome Take",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, akanonId, "located_in");
  addFactionReward(questId, "Miners Guild 628");
  addFactionReward(questId, "Deeppockets");

  const groupId = "the-gnome-take";
  const existingRewards: [string, string][] = [
    ["item:copper-amulet", "Copper Amulet"],
    ["item:copper-band", "Copper Band"],
    ["item:golden-ear-stud", "Golden Ear Stud"],
    ["item:hematite", "Hematite"],
    ["item:ionys-absorber", "Iony's Absorber"],
    ["item:lapis-lazuli", "Lapis Lazuli"],
    ["item:malachite", "Malachite"],
    ["item:onyx", "Onyx"],
    ["item:silver-earring", "Silver Earring"],
    ["item:turquoise", "Turquoise"],
  ];
  for (const [id] of existingRewards) {
    addEdge(questId, id, "rewards", { randomGroup: groupId });
  }

  const newRewards: [string, string][] = [
    ["item:bead-necklace", "Bead Necklace"],
    ["item:bloodstone", "Bloodstone"],
    ["item:engagement-ring", "Engagement Ring"],
    ["item:fire-beetle-eye", "Fire Beetle Eye"],
    ["item:jasper", "Jasper"],
    ["item:moonstone", "Moonstone"],
    ["item:royal-jelly", "Royal Jelly"],
    ["item:silver-stud", "Silver Stud"],
    ["item:silver-ring", "Silver Ring"],
    ["item:small-piece-of-ore", "Small Piece of Ore"],
  ];
  for (const [id, label] of newRewards) {
    addNode({
      id,
      label,
      type: "item",
      weight: 0.1,
      size: "Tiny",
      source: "The Gnome Take random reward (Jeet, North Kaladim / clockwork scrubber 628, Ak'Anon)",
    });
    addEdge(questId, id, "rewards", { randomGroup: groupId });
  }
}

// ---------------------------------------------------------------------
// The Grammar Manual
// ---------------------------------------------------------------------
{
  const zoneId = "zone:iceclad-ocean";
  const giverId = "npc:iceclad-ocean:ami";
  addGiver(giverId, "Ami", zoneId);

  const questId = "quest:the-grammar-manual";
  addNode({
    id: questId,
    label: "The Grammar Manual",
    type: "quest",
    classes: ["warrior", "cleric", "paladin", "ranger", "shadow knight", "bard"],
    minLevel: 35,
    description:
      "Ami in Iceclad Ocean starts a chain requiring a Strong Wooden Branch (holgreshes) and Strong Raptor Gut (tigeraptors), given to a Snowfang fisher to spawn an enraged walrus; defeating it and hailing the agitated snowfang with \"I want the magic thing\" yields Chapter P, traded to Ami for the Pirate Grammar Manual, then given to Nilham the Chef for the Ice Forged Shackles.",
    steps: [
      "Gather a Strong Wooden Branch (holgreshes) and Strong Raptor Gut (tigeraptors)",
      "Give both to a Snowfang fisher to spawn an enraged walrus",
      "Defeat the walrus",
      "Hail the agitated snowfang and say \"I want the magic thing\" for Chapter P",
      "Give Chapter P to Ami for the Pirate Grammar Manual",
      "Give the manual to Nilham the Chef for the Ice Forged Shackles",
    ],
    wiki_title: "The Grammar Manual",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const shacklesId = "item:ice-forged-shackles";
  addNode({
    id: shacklesId,
    label: "Ice Forged Shackles",
    type: "item",
    slots: ["Wrist"],
    classes: ["warrior", "cleric", "paladin", "ranger", "shadow knight", "bard", "rogue"],
    race: ["human", "dark elf", "erudite", "gnome", "half elf", "halfling", "high elf", "wood elf"],
    ac: 10,
    stats: { str: 5, dex: 5, agi: 5 },
    hp: 30,
    magic: true,
    lore: true,
    noTrade: true,
    weight: 0.5,
    size: "Small",
    effect: "Velium Shards (Must Equip, 3.0 sec cast) at Level 35",
    source: "The Grammar Manual reward (Ami / Nilham the Chef, Iceclad Ocean)",
  });
  addEdge(questId, shacklesId, "rewards");
}

// ---------------------------------------------------------------------
// The Icestar Dims
// ---------------------------------------------------------------------
{
  const zoneId = "zone:everfrost-peaks";
  const permafrostId = "zone:permafrost";
  const icewellId = "zone:icewell-keep";
  const dreadlandsId = "zone:dreadlands";
  const giverId = "npc:everfrost-peaks:watcher-aenwen";
  addGiver(giverId, "Watcher Aenwen", zoneId);

  const questId = "quest:the-icestar-dims";
  addNode({
    id: questId,
    label: "The Icestar Dims",
    type: "quest",
    minLevel: 1,
    description:
      "Watcher Aenwen in Everfrost Peaks collects three resonance crystals -- a Permafrost Resonance Crystal (King Thex'Ka IV spawn, Permafrost), a Thurgadin Resonance Crystal (a statue near the Icewell Keep entrance), and a Dreadlands Resonance Crystal (Yeti Caves Crossroads, Dreadlands) -- for Chapter I, The Shatter Sky, and a Holiday Gift. No stat infobox is documented for either reward.",
    steps: [
      "Obtain the Permafrost Resonance Crystal from the King Thex'Ka IV spawn in Permafrost",
      "Obtain the Thurgadin Resonance Crystal from the statue near the Icewell Keep entrance",
      "Obtain the Dreadlands Resonance Crystal at Yeti Caves Crossroads in Dreadlands",
      "Deliver all three crystals to Watcher Aenwen in Everfrost Peaks",
    ],
    wiki_title: "The Icestar Dims",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, permafrostId, "located_in");
  addEdge(questId, icewellId, "located_in");
  addEdge(questId, dreadlandsId, "located_in");
}

// ---------------------------------------------------------------------
// The Icestar Remembers
// ---------------------------------------------------------------------
{
  const zoneId = "zone:eastern-wastes";
  const qeynosHillsId = "zone:qeynos-hills";
  const giverId = "npc:eastern-wastes:isolde-winterveil";
  addGiver(giverId, "Isolde Winterveil", zoneId);

  const questId = "quest:the-icestar-remembers";
  addNode({
    id: questId,
    label: "The Icestar Remembers",
    type: "quest",
    minLevel: 1,
    description:
      "Isolde Winterveil in Eastern Wastes gives a Frosted Memory Shard, delivered to Guard Lammel in Qeynos Hills for a Frosted Broach; returning it to Isolde grants Chapter V, Ashes in the Margins, plus a Holiday Gift on first completion only (removed from repeats due to abuse). No stat infobox is documented for either reward.",
    steps: [
      "Receive a Frosted Memory Shard from Isolde Winterveil",
      "Give the shard to Guard Lammel in Qeynos Hills",
      "Receive a Frosted Broach from Guard Lammel",
      "Return the broach to Isolde Winterveil in Eastern Wastes",
    ],
    wiki_title: "The Icestar Remembers",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, qeynosHillsId, "located_in");
}

// ---------------------------------------------------------------------
// The Loom -- SKIPPED, broken/unfinished per the wiki's own disclaimer:
// "MISSING INFO! Please expand the content"; reward itself listed only as
// "UNKNOWN! Please correct."
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// The Lorekeeper's Scrolls
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const warrensId = "zone:the-warrens";
  const giverId = "npc:erudin:weltria-ostriss";
  addGiver(giverId, "Weltria Ostriss", zoneId);

  const questId = "quest:the-lorekeepers-scrolls";
  addNode({
    id: questId,
    label: "The Lorekeeper's Scrolls",
    type: "quest",
    minLevel: 22,
    description:
      "Weltria Ostriss on the top floor of the Erudin City Library collects seven unique Dusty Kobold Scrolls from Lorekeeper Roggik in The Warrens, combined in a Large Scroll Case into the Kobold History Collection, for 50 platinum plus faction.",
    steps: [
      "Collect seven unique Dusty Kobold Scrolls from Lorekeeper Roggik in The Warrens",
      "Combine them in the Large Scroll Case for the Kobold History Collection",
      "Hand the collection to Weltria Ostriss in Erudin",
    ],
    wiki_title: "The Lorekeeper's Scrolls",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, warrensId, "located_in");
  addFactionReward(questId, "Merchants of Erudin");
  addFactionReward(questId, "High Council of Erudin");
  addFactionReward(questId, "High Guard of Erudin");
}

// ---------------------------------------------------------------------
// The Lost Circle -- DEFERRED, matches the Monk Armor & Sash/Shackle/
// Headband Progression cluster already in the Quest Groups section:
// Brother Balatin's "Robe of the Lost Circle" -> "Robe of the Whistling
// Fists" turn-in chain is that entry's own named sub-quest. Not modeled
// standalone here.
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// The Lost Map
// ---------------------------------------------------------------------
{
  const zoneId = "zone:iceclad-ocean";
  const giverId = "npc:iceclad-ocean:ami";
  addGiver(giverId, "Ami", zoneId);
  const nalotId = "npc:iceclad-ocean:captain-nalot";
  addGiver(nalotId, "Captain Nalot", zoneId);

  const questId = "quest:the-lost-map";
  addNode({
    id: questId,
    label: "The Lost Map",
    type: "quest",
    minLevel: 1,
    description:
      "Ami in Iceclad Ocean sends players after four map pieces -- from a dire wolf stalker, Stormfeather, Bloodmaw (via a Yakman Parts side step), and Lodizal -- combined in a Map Binding into Pieces of the Iceclad Map; given to a lost pirate for a Completed Map of Iceclad, handed to Captain Nalot for the Eyepatch of Plunder. A rabid snow cougar may spawn during the final exchange.",
    steps: [
      "Collect four map pieces: dire wolf stalker, Stormfeather, Bloodmaw (via Yakman Parts), and Lodizal",
      "Combine the pieces in a Map Binding for Pieces of the Iceclad Map",
      "Give the combined map to the lost pirate for a Completed Map of Iceclad",
      "Hand the Completed Map to Captain Nalot",
    ],
    wiki_title: "The Lost Map",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const eyepatchId = "item:eyepatch-of-plunder";
  addNode({
    id: eyepatchId,
    label: "Eyepatch of Plunder",
    type: "item",
    slots: ["Face"],
    ac: 10,
    stats: { str: 10, dex: 10 },
    hp: 50,
    resists: { fire: 6, disease: 6, cold: 6, magic: 6, poison: 6 },
    magic: true,
    lore: true,
    noTrade: true,
    weight: 0.5,
    size: "Small",
    effect: "Captain Nalot's Quickening (Must Equip, 3.5 sec cast)",
    source: "The Lost Map reward (Captain Nalot, Iceclad Ocean)",
  });
  addEdge(questId, eyepatchId, "rewards");
}

// ---------------------------------------------------------------------
// The Lost Pet
// ---------------------------------------------------------------------
{
  const zoneId = "zone:paineel";
  const giverId = "npc:paineel:noclin-saah";
  addGiver(giverId, "Noclin Saah", zoneId);

  const questId = "quest:the-lost-pet";
  addNode({
    id: questId,
    label: "The Lost Pet",
    type: "quest",
    classes: ["necromancer"],
    minLevel: 1,
    description:
      "Noclin Saah in Paineel sends players to slay his own pet and return with the Rotting Femur, for Noclin's Femur. Requires Dubious or better faction -- his own page warns \"MUST BE ABOVE DUBIOUS OR HE WILL EAT THE TURN IN!\"",
    steps: ["Slay Noclin's Pet", "Loot the Rotting Femur", "Return it to Noclin Saah in Paineel"],
    wiki_title: "The Lost Pet",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Heretics");

  const femurId = "item:noclins-femur";
  addNode({
    id: femurId,
    label: "Noclin's Femur",
    type: "item",
    slots: ["Primary"],
    classes: ["necromancer"],
    race: ["erudite"],
    skill: "1H Blunt",
    damage: 5,
    delay: 24,
    mana: 10,
    stats: { cha: -5 },
    magic: true,
    lore: true,
    noTrade: true,
    effect: "Sicken (Combat, instant cast) at Level 10",
    source: "The Lost Pet reward (Noclin Saah, Paineel)",
  });
  addEdge(questId, femurId, "rewards");
}

// ---------------------------------------------------------------------
// The Lost Tome
// ---------------------------------------------------------------------
{
  const zoneId = "zone:plane-of-growth";
  const skyshrineId = "zone:skyshrine";
  const giverId = "npc:plane-of-growth:a-mosscovered-treant";
  addGiver(giverId, "a mosscovered treant", zoneId);

  const questId = "quest:the-lost-tome";
  addNode({
    id: questId,
    label: "The Lost Tome",
    type: "quest",
    classes: ["magician"],
    minLevel: 55,
    description:
      "A mosscovered treant in the Plane of Growth trades four tomes -- Tome of Elemental Cognizance, Contemplation, Thought, and Understanding, dropped by named wurms (Jaelk, Lararith, Oglard, Ralgyn, Jualicn) in Skyshrine -- for the Chord of Vines.",
    steps: [
      "Collect Tome of Elemental Cognizance, Contemplation, Thought, and Understanding from named wurms in Skyshrine",
      "Turn in all four tomes to the mosscovered treant in the Plane of Growth",
    ],
    wiki_title: "The Lost Tome",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, skyshrineId, "located_in");

  const chordId = "item:chord-of-vines";
  addNode({
    id: chordId,
    label: "Chord of Vines",
    type: "item",
    slots: ["Waist"],
    classes: ["magician"],
    race: ["high elf"],
    deity: ["Tunare"],
    ac: 8,
    stats: { sta: 5, int: 10 },
    mana: 40,
    magic: true,
    lore: true,
    noTrade: true,
    source: "The Lost Tome reward (a mosscovered treant, Plane of Growth)",
  });
  addEdge(questId, chordId, "rewards");
}

// ---------------------------------------------------------------------
// The Lottery Ticket
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-freeport";
  const highKeepId = "zone:high-keep";
  const giverId = "npc:east-freeport:tohsan-hallard";
  addGiver(giverId, "Tohsan Hallard", zoneId);

  const questId = "quest:the-lottery-ticket";
  addNode({
    id: questId,
    label: "The Lottery Ticket",
    type: "quest",
    minLevel: 1,
    description:
      "Tohsan Hallard in East Freeport trades four Orc Pawn Picks at a time for coin, experience, and one of six lottery tickets (#14001, 14350, 15600, 15601, 15602, or 16568); some tickets earn extra rewards from Treasurer Lynn in High Keep, including experience and gold for #15600 and a Highkeep Royal Suite key for #16568.",
    steps: [
      "Gather four Orc Pawn Picks",
      "Turn them in to Tohsan Hallard in East Freeport for a lottery ticket",
      "Redeem certain tickets with Treasurer Lynn in High Keep",
    ],
    wiki_title: "The Lottery Ticket",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, highKeepId, "located_in");
  addFactionReward(questId, "Coalition of Tradefolk Underground");
  addFactionReward(questId, "Coalition of Tradefolk");
  addFactionReward(questId, "Knights of Truth");
  addFactionReward(questId, "Merchants of Qeynos");
}

// ---------------------------------------------------------------------
// The Mighty Garou
// ---------------------------------------------------------------------
{
  const zoneId = "zone:iceclad-ocean";
  const giverId = "npc:iceclad-ocean:balix-misteyes";
  addGiver(giverId, "Balix Misteyes", zoneId);

  const questId = "quest:the-mighty-garou";
  addNode({
    id: questId,
    label: "The Mighty Garou",
    type: "quest",
    classes: ["cleric", "shadow knight", "druid", "shaman"],
    minLevel: 35,
    description:
      "Balix Misteyes in Iceclad Ocean trades the Skin of the Garou (a named spawn, Garou) and Bloody Cougar Bone (a named cougar, Midnight, near the Tower of Frozen Shadow) for the Garou Bone Club. Cannot be multi-quested -- turning the items in separately gets them eaten.",
    steps: [
      "Kill Garou for the Skin of the Garou",
      "Kill Midnight, near the Tower of Frozen Shadow, for the Bloody Cougar Bone",
      "Turn in both items simultaneously to Balix Misteyes",
    ],
    wiki_title: "The Mighty Garou",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const clubId = "item:garou-bone-club";
  addNode({
    id: clubId,
    label: "Garou Bone Club",
    type: "item",
    slots: ["Primary", "Secondary"],
    classes: ["cleric", "shadow knight", "druid", "shaman"],
    skill: "1H Blunt",
    damage: 5,
    delay: 25,
    stats: { wis: 7, int: 7 },
    magic: true,
    lore: true,
    weight: 4.0,
    size: "Medium",
    effect: "Curse of the Garou (Combat, instant cast) at Level 32",
    source: "The Mighty Garou reward (Balix Misteyes, Iceclad Ocean)",
  });
  addEdge(questId, clubId, "rewards");
}

// ---------------------------------------------------------------------
// The Mighty Snowfang Hero
// ---------------------------------------------------------------------
{
  const zoneId = "zone:iceclad-ocean";
  const cobaltId = "zone:cobalt-scar";
  const giverId = "npc:iceclad-ocean:keref-spiritspear";
  addGiver(giverId, "Keref Spiritspear", zoneId);

  const questId = "quest:the-mighty-snowfang-hero";
  addNode({
    id: questId,
    label: "The Mighty Snowfang Hero",
    type: "quest",
    classes: ["cleric", "druid", "shaman"],
    minLevel: 35,
    description:
      "Keref Spiritspear in Iceclad Ocean assembles a Runed Totem Staff (gnolls), Whale Bone (sharks, Cobalt Scar), and a Tinkered Rope (traded from Ritap for a Frost Giant Scout Beard) into a Rune Shafted Harpoon via Grizlin Bloodfang, delivered to Keref for the Icy Totem of Protection.",
    steps: [
      "Obtain a Runed Totem Staff from gnolls",
      "Obtain a Whale Bone from sharks in Cobalt Scar",
      "Give a Frost Giant Scout Beard to Ritap for a Tinkered Rope",
      "Give the staff, bone, and rope to Grizlin Bloodfang for a Rune Shafted Harpoon",
      "Deliver the harpoon to Keref Spiritspear",
    ],
    wiki_title: "The Mighty Snowfang Hero",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, cobaltId, "located_in");
  addFactionReward(questId, "SnowfangGnolls");
  addFactionReward(questId, "Pirates of Iceclad");

  const totemId = "item:icy-totem-of-protection";
  addNode({
    id: totemId,
    label: "Icy Totem of Protection",
    type: "item",
    slots: ["Secondary"],
    classes: ["cleric", "druid", "shaman"],
    ac: 8,
    stats: { wis: 5 },
    hp: 20,
    resists: { cold: 5 },
    magic: true,
    lore: true,
    noTrade: true,
    weight: 0.5,
    size: "Small",
    source: "The Mighty Snowfang Hero reward (Keref Spiritspear, Iceclad Ocean)",
  });
  addEdge(questId, totemId, "rewards");
}

// ---------------------------------------------------------------------
// The Mudtoes
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-kaladim";
  const butcherblockId = "zone:butcherblock-mountains";
  const oceanId = "zone:ocean-of-tears";
  const giverId = "npc:south-kaladim:furtog-ogrebane";
  addGiver(giverId, "Furtog Ogrebane", zoneId);

  const questId = "quest:the-mudtoes";
  addNode({
    id: questId,
    label: "The Mudtoes",
    type: "quest",
    minLevel: 20,
    description:
      "Furtog Ogrebane in South Kaladim sends players to Glorin Binfurr at the Butcherblock docks, then to Ocean of Tears to defeat Boog Mudtoe and Goob Mudtoe, returning their heads to Furtog for the Ogre War Maul.",
    steps: [
      "Speak with Furtog Ogrebane about the Mudtoes",
      "Find Glorin Binfurr at the Butcherblock docks",
      "Defeat Boog Mudtoe and Goob Mudtoe in Ocean of Tears",
      "Return their heads to Furtog Ogrebane in South Kaladim",
    ],
    wiki_title: "The Mudtoes",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, butcherblockId, "located_in");
  addEdge(questId, oceanId, "located_in");
  addFactionReward(questId, "Storm Guard");
  addFactionReward(questId, "Kazon Stormhammer");
  addFactionReward(questId, "Miners Guild 249");

  const maulId = "item:ogre-war-maul";
  addNode({
    id: maulId,
    label: "Ogre War Maul",
    type: "item",
    slots: ["Primary"],
    classes: ["warrior", "cleric", "paladin", "ranger", "shadow knight", "shaman", "monk"],
    skill: "2H Blunt",
    damage: 17,
    delay: 50,
    weight: 13.0,
    size: "Large",
    source: "The Mudtoes reward (Furtog Ogrebane, South Kaladim)",
  });
  addEdge(questId, maulId, "rewards");
}

// ---------------------------------------------------------------------
// The Mystic Cloak
// ---------------------------------------------------------------------
{
  const zoneId = "zone:northern-felwithe";
  const najenaId = "zone:najena";
  const erudinId = "zone:erudin";
  const giverId = "npc:northern-felwithe:tolkar-parlone";
  addGiver(giverId, "Tolkar Parlone", zoneId);

  const questId = "quest:the-mystic-cloak";
  addNode({
    id: questId,
    label: "The Mystic Cloak",
    type: "quest",
    classes: ["enchanter", "magician", "necromancer", "wizard"],
    minLevel: 30,
    description:
      "Tolkar Parlone in Northern Felwithe sends players to defeat the Priest of Najena in Najena for a Tarnished Bronze Key, given to the imprisoned Linara Parlone for a Sealed Letter, delivered back to Tolkar for a Faded Cloak; the cloak is given to Trilani Parlone at Erudin's Enchanter Guild for the Mystic Cloak.",
    steps: [
      "Kill the Priest of Najena in Najena for a Tarnished Bronze Key",
      "Give the key to Linara Parlone (imprisoned in Najena) for a Sealed Letter",
      "Deliver the letter to Tolkar Parlone in Northern Felwithe for a Faded Cloak",
      "Give the Faded Cloak to Trilani Parlone at Erudin's Enchanter Guild",
    ],
    wiki_title: "The Mystic Cloak",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, najenaId, "located_in");
  addEdge(questId, erudinId, "located_in");
  addFactionReward(questId, "Keepers of the Art");
  addFactionReward(questId, "King Tearis Thex");
  addFactionReward(questId, "Faydarks Champions");

  const cloakId = "item:mystic-cloak";
  addNode({
    id: cloakId,
    label: "Mystic Cloak",
    type: "item",
    slots: ["Back"],
    classes: ["enchanter", "magician", "necromancer", "wizard"],
    ac: 8,
    stats: { int: 5 },
    resists: { magic: 5 },
    magic: true,
    lore: true,
    noTrade: true,
    charges: 10,
    effect: "Steelskin",
    source: "The Mystic Cloak reward (Tolkar Parlone / Trilani Parlone, Northern Felwithe / Erudin)",
  });
  addEdge(questId, cloakId, "rewards");
}

// ---------------------------------------------------------------------
// The New Worker
// ---------------------------------------------------------------------
{
  const zoneId = "zone:the-overthere";
  const giverId = "npc:the-overthere:an-undead-foreman";
  addGiver(giverId, "an undead foreman", zoneId);

  const questId = "quest:the-new-worker";
  addNode({
    id: questId,
    label: "The New Worker",
    type: "quest",
    minLevel: 1,
    description:
      "An undead foreman in The Overthere trades a purchased Jade gem for the Worker Sledgemallet. Requires Amiable or better faction with Venril Sathir. The wiki's own page notes the quest itself grants \"no experience, faction hits, or coin.\"",
    steps: [
      "Reach Amiable or better faction with Venril Sathir",
      "Purchase a Jade gem",
      "Give the Jade to the undead foreman in The Overthere",
    ],
    wiki_title: "The New Worker",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const malletId = "item:worker-sledgemallet";
  addNode({
    id: malletId,
    label: "Worker Sledgemallet",
    type: "item",
    slots: ["Primary"],
    skill: "2H Blunt",
    damage: 6,
    delay: 50,
    magic: true,
    lore: true,
    noTrade: true,
    weight: 3.2,
    size: "Giant",
    effect: "Overthere (Combat, instant cast) at Level 50",
    source: "The New Worker reward (an undead foreman, The Overthere)",
  });
  addEdge(questId, malletId, "rewards");
}

// ---------------------------------------------------------------------
// The Nitrates and the Assassin
// ---------------------------------------------------------------------
{
  const zoneId = "zone:surefall-glade";
  const westernKaranaId = "zone:western-karana";
  const southQeynosId = "zone:south-qeynos";
  const northQeynosId = "zone:north-qeynos";
  const giverId = "npc:surefall-glade:gerael-woodone";
  addGiver(giverId, "Gerael Woodone", zoneId);

  const questId = "quest:the-nitrates-and-the-assassin";
  addNode({
    id: questId,
    label: "The Nitrates and the Assassin",
    type: "quest",
    minLevel: 10,
    description:
      "Gerael Woodone in Surefall Glade sends a Flask of Nitrates to Linaya Sowlin in Western Karana; the assassin Draze Slashyn spawns and drops A Tattered Cloth Note, relayed through Captain Tillin in South Qeynos to warn Gash Flockwalker, then a second assassin, Raffel Minnmorn in North Qeynos, drops a Black Wood Chip returned to Gerael for faction, coin, and low-level Druid spell scrolls. Requires Amiable or better faction.",
    steps: [
      "Deliver a Flask of Nitrates to Linaya Sowlin in Western Karana",
      "Slay the assassin Draze Slashyn and loot A Tattered Cloth Note",
      "Return the note to Gerael Woodone",
      "Give the note to Captain Tillin in South Qeynos",
      "Slay the assassin Raffel Minnmorn in North Qeynos and loot a Black Wood Chip",
      "Return the chip to Gerael Woodone",
    ],
    wiki_title: "The Nitrates and the Assassin",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, westernKaranaId, "located_in");
  addEdge(questId, southQeynosId, "located_in");
  addEdge(questId, northQeynosId, "located_in");
  addFactionReward(questId, "Jaggedpine Treefolk");
  addFactionReward(questId, "Guards of Qeynos");
}

// ---------------------------------------------------------------------
// The Orc Impaler
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kithicor-forest";
  const giverId = "npc:kithicor-forest:morin-shadowbane";
  addGiver(giverId, "Morin Shadowbane", zoneId);

  const questId = "quest:the-orc-impaler";
  addNode({
    id: questId,
    label: "The Orc Impaler",
    type: "quest",
    classes: ["ranger"],
    minLevel: 35,
    description:
      "Morin Shadowbane in Kithicor Forest sends players to recover a Shadowed Code Book from the Shadowman Leader and deliver it to Bryn Fynndel; Bryn's note leads to Glidara Myllar and a Glidara's Ring, then a ghoul boss drops a Ghoul Boss' Log Book -- both returned to Glidara, sealed, and relayed through Morin and back to Bryn for the Orc Impaler.",
    steps: [
      "Recover the Shadowed Code Book from the Shadowman Leader",
      "Deliver it to Bryn Fynndel for a note and Glidara's Ring",
      "Kill the ghoul boss for the Ghoul Boss' Log Book",
      "Return the ring and log book to Glidara Myllar",
      "Deliver the sealed Ghoul Boss' Log Book to Morin Shadowbane",
      "Return the Orders for Bryn to Bryn Fynndel for the Orc Impaler",
    ],
    wiki_title: "The Orc Impaler",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const impalerId = "item:orc-impaler";
  addNode({
    id: impalerId,
    label: "Orc Impaler",
    type: "item",
    slots: ["Primary"],
    classes: ["ranger"],
    skill: "Piercing",
    damage: 7,
    stats: { str: 3, wis: 4 },
    hp: 10,
    lore: true,
    noTrade: true,
    source: "The Orc Impaler reward (Morin Shadowbane / Bryn Fynndel, Kithicor Forest)",
  });
  addEdge(questId, impalerId, "rewards");
}

// ---------------------------------------------------------------------
// The Package
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-qeynos";
  const giverId = "npc:north-qeynos:ghil-starn";
  addGiver(giverId, "Ghil Starn", zoneId);

  const questId = "quest:the-package";
  addNode({
    id: questId,
    label: "The Package",
    type: "quest",
    classes: ["rogue"],
    minLevel: 3,
    description:
      "Ghil Starn in North Qeynos sends a package to Den Magason at the docks or Mermaid's Lure; Den's note back to Ghil comes after collecting Snake Scales, a High Quality Bear Skin, a High Quality Wolf Skin, and Bat Fur, and turning them in for the Brown Leather Gloves. Requires Amiable or better faction.",
    steps: [
      "Deliver the package to Den Magason",
      "Collect Snake Scales, High Quality Bear Skin, High Quality Wolf Skin, and Bat Fur",
      "Turn in the items to Den Magason",
      "Return Den's note to Ghil Starn in North Qeynos",
    ],
    wiki_title: "The Package",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Merchants of Qeynos");
  addFactionReward(questId, "Antonius Bayle");
  addFactionReward(questId, "Coalition of Tradefolk");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Circle of Unseen Hands");
  addFactionReward(questId, "Corrupt Qeynos Guards");
  addFactionReward(questId, "Kane Bayle");

  const glovesId = "item:brown-leather-gloves";
  addNode({
    id: glovesId,
    label: "Brown Leather Gloves",
    type: "item",
    slots: ["Hands"],
    ac: 1,
    stats: { dex: 2 },
    weight: 0.5,
    size: "Small",
    source: "The Package reward (Ghil Starn, North Qeynos)",
  });
  addEdge(questId, glovesId, "rewards");
}

// ---------------------------------------------------------------------
// The Painting
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const freeportId = "zone:east-freeport";
  const giverId = "npc:south-qeynos:danaria-hollin";
  addGiver(giverId, "Danaria Hollin", zoneId);
  const palatosId = "npc:east-freeport:palatos-kynarn";
  addGiver(palatosId, "Palatos Kynarn", freeportId);
  const lenkaId = "npc:east-freeport:lenka-stoutheart";
  addGiver(lenkaId, "Lenka Stoutheart", freeportId);

  const questId = "quest:the-painting";
  addNode({
    id: questId,
    label: "The Painting",
    type: "quest",
    minLevel: 10,
    description:
      "Danaria Hollin, roaming the South Qeynos docks, sends players for Capt. Orlin's Spiced Ale (4 drinks, Nesin Tapper) and a Beacon Mount (Palatos Kynarn), plus a Greater Lightstone, Metal Disk, and Copper Band, combined in a forge into a Boat Beacon. Turning the Boat Beacon in to Palatos Kynarn in East Freeport grants experience/platinum and Craftkeepers/High Council of Erudin/High Guard of Erudin faction; turning it in instead to Lenka Stoutheart (found occasionally at the Grub 'n Grog Tavern, East Freeport docks) grants experience/platinum, the Portrait of King Ak'Anon, and Wolves of the North/Shamen of Justice/Merchants of Halas/Steel Warriors faction.",
    steps: [
      "Obtain 4 drinks of Capt. Orlin's Spiced Ale from Nesin Tapper",
      "Receive a Beacon Mount from Palatos Kynarn",
      "Gather a Greater Lightstone, Metal Disk, and Copper Band",
      "Combine all items in a forge for a Boat Beacon",
      "Turn in the Boat Beacon to either Palatos Kynarn or Lenka Stoutheart",
    ],
    wiki_title: "The Painting",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, freeportId, "located_in");
  addFactionReward(questId, "Craftkeepers");
  addFactionReward(questId, "High Council of Erudin");
  addFactionReward(questId, "High Guard of Erudin");
  addFactionReward(questId, "Wolves of the North");
  addFactionReward(questId, "Shamen of Justice");
  addFactionReward(questId, "Merchants of Halas");
  addFactionReward(questId, "Steel Warriors");
}

// ---------------------------------------------------------------------
// The Penance
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-cabilis";
  const giverId = "npc:east-cabilis:crusader-zixo";
  addGiver(giverId, "Crusader Zixo", zoneId);

  const questId = "quest:the-penance";
  addNode({
    id: questId,
    label: "The Penance",
    type: "quest",
    classes: ["monk", "necromancer", "shaman", "shadow knight", "warrior"],
    minLevel: 1,
    description:
      "Crusader Zixo in East Cabilis directs players to their own class guild master for a Ragged Book, read and given to the Toilmaster for the Rites of Exoneration, a Hammer of Exoneration, and a Penance Bag; the hammer's proc collects Bone Fragments, combined 8-at-a-time into Powdered Bone (x7), then combined with a Flask of Bloodwater into a Filled Penance Bag, turned in with the Rites of Exoneration to the player's class quest giver for a class-specific reward -- Drape of the Brood (Necromancer), Shackle of Dust (Monk), Pawn's Khukri (Shadow Knight), Iron Cudgel of the Petitioner (Shaman), or Partisan's Pike (Warrior).",
    steps: [
      "Receive a Ragged Book from your class guild master",
      "Give the book to the Toilmaster for the Rites of Exoneration, Hammer of Exoneration, and Penance Bag",
      "Proc the hammer 56 times to collect Bone Fragments",
      "Combine 8 Bone Fragments in the Grotesque Mortar and Pestle for Powdered Bone (x7)",
      "Combine 7 Powdered Bones and a Flask of Bloodwater in the Penance Bag for a Filled Penance Bag",
      "Hand the Filled Penance Bag and Rites of Exoneration to your class quest giver",
    ],
    wiki_title: "The Penance",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Cabilis Residents");
  addFactionReward(questId, "Legion of Cabilis");
  addFactionReward(questId, "Swift Tails");

  const drapeId = "item:drape-of-the-brood";
  addNode({
    id: drapeId,
    label: "Drape of the Brood",
    type: "item",
    slots: ["Chest"],
    classes: ["necromancer"],
    race: ["iksar"],
    ac: 4,
    weight: 0.7,
    size: "Medium",
    magic: true,
    lore: true,
    noTrade: true,
    source: "The Penance Necromancer reward (Crusader Zixo, East Cabilis)",
  });
  addEdge(questId, drapeId, "rewards");

  const shackleId = "item:shackle-of-dust";
  addNode({
    id: shackleId,
    label: "Shackle of Dust",
    type: "item",
    slots: ["Wrist"],
    classes: ["monk"],
    race: ["human", "iksar"],
    ac: 2,
    weight: 0.8,
    size: "Small",
    lore: true,
    noTrade: true,
    source: "The Penance Monk reward (Crusader Zixo, East Cabilis)",
  });
  addEdge(questId, shackleId, "rewards");

  const khukriId = "item:pawns-khukri";
  addNode({
    id: khukriId,
    label: "Pawn's Khukri",
    type: "item",
    slots: ["Primary"],
    classes: ["shadow knight"],
    race: ["human", "erudite", "dark elf", "troll", "ogre", "gnome", "iksar"],
    skill: "1H Slashing",
    damage: 4,
    delay: 26,
    weight: 5.5,
    size: "Medium",
    lore: true,
    noTrade: true,
    source: "The Penance Shadow Knight reward (Crusader Zixo, East Cabilis)",
  });
  addEdge(questId, khukriId, "rewards");

  const cudgelId = "item:iron-cudgel-of-the-petitioner";
  addNode({
    id: cudgelId,
    label: "Iron Cudgel of the Petitioner",
    type: "item",
    slots: ["Range", "Primary"],
    classes: ["shaman"],
    race: ["barbarian", "dark elf", "troll", "ogre", "iksar"],
    skill: "1H Blunt",
    damage: 4,
    delay: 25,
    weight: 5.0,
    size: "Medium",
    lore: true,
    noTrade: true,
    source: "The Penance Shaman reward (Crusader Zixo, East Cabilis)",
  });
  addEdge(questId, cudgelId, "rewards");

  const pikeId = "item:partisans-pike";
  addNode({
    id: pikeId,
    label: "Partisan's Pike",
    type: "item",
    slots: ["Back", "Primary"],
    classes: ["warrior"],
    race: ["iksar"],
    skill: "Piercing",
    damage: 8,
    delay: 46,
    ac: 1,
    weight: 13.5,
    size: "Giant",
    lore: true,
    noTrade: true,
    source: "The Penance Warrior reward (Crusader Zixo, East Cabilis)",
  });
  addEdge(questId, pikeId, "rewards");
}

// ---------------------------------------------------------------------
// The Power of the Gatecallers
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin-palace";
  const giverId = "npc:erudin-palace:vasile-jahnir";
  addGiver(giverId, "Vasile Jahnir", zoneId);

  const questId = "quest:the-power-of-the-gatecallers";
  addNode({
    id: questId,
    label: "The Power of the Gatecallers",
    type: "quest",
    classes: ["magician"],
    minLevel: 1,
    description:
      "Vasile Jahnir in Erudin Palace trades 2 Summoned: Dagger and 2 Summoned: Black Bread for the Gloves of the Gatecaller. Requires Amiable or better faction.",
    steps: ["Summon 2 Summoned: Dagger and 2 Summoned: Black Bread", "Turn them in to Vasile Jahnir in Erudin Palace"],
    wiki_title: "The Power of the Gatecallers",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Gate Callers");
  addFactionReward(questId, "High Guard of Erudin");
  addFactionReward(questId, "High Council of Erudin");

  const glovesId = "item:gloves-of-the-gatecaller";
  addNode({
    id: glovesId,
    label: "Gloves of the Gatecaller",
    type: "item",
    slots: ["Hands"],
    classes: ["necromancer", "wizard", "magician", "enchanter"],
    ac: 3,
    magic: true,
    lore: true,
    noTrade: true,
    weight: 5.5,
    size: "Small",
    source: "The Power of the Gatecallers reward (Vasile Jahnir, Erudin Palace)",
  });
  addEdge(questId, glovesId, "rewards");
}

// ---------------------------------------------------------------------
// The Rat King
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const aqueductsId = "zone:qeynos-aqueducts";
  const giverId = "npc:south-qeynos:wolten-grafe";
  addGiver(giverId, "Wolten Grafe", zoneId);

  const questId = "quest:the-rat-king";
  addNode({
    id: questId,
    label: "The Rat King",
    type: "quest",
    minLevel: 5,
    description:
      "Wolten Grafe in South Qeynos sends players to defeat Beggar Wyllin in the Qeynos Aqueducts and return with a Human Head, for coin, a piece of leather armor (unnamed on the wiki), and faction.",
    steps: [
      "Locate Beggar Wyllin in the Qeynos Aqueducts",
      "Defeat Beggar Wyllin and loot the Human Head",
      "Return the head to Wolten Grafe in South Qeynos",
    ],
    wiki_title: "The Rat King",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, aqueductsId, "located_in");
  addFactionReward(questId, "Knights of Thunder");
  addFactionReward(questId, "Priests of Life");
  addFactionReward(questId, "Guards of Qeynos");
}

// ---------------------------------------------------------------------
// The Realm of Heroes -- Felwithe -- SKIPPED, wiki's own disclaimer:
// "This quest was for a GM Event on live" -- a one-time developer-run
// event, not standard repeatable content; reward listed as "None (GM
// event)."
// ---------------------------------------------------------------------

save();
