/**
 * Migration 096: next standalone batch off GitHub issue #26's checklist --
 * "Tunare Scouts Dagger" through "Watcher Torches". Researched directly
 * against eqlwiki.com, following decisions/eqlwiki-quest-research-method.md.
 *
 * Skipped and tagged (not modeled, per the issue's own guardrail, quoting
 * the wiki's own disclaimer):
 * - Unkempt Druids (Quest) -- wiki's own disclaimer: "This is an unsolved
 *   or broken quest," reward listed only as "Unknown."
 *
 * Checked off but not modeled as quests -- wiki cross-class reference/index
 * pages, same shape as migration 063's "Class Race Quest List":
 * - Velious Class Armor -- own page: "The tables below exist to provide a
 *   quick side-by-side statistical comparison" of class armor sets, links
 *   out to individual quest pages rather than describing one.
 * - Velious Class Armor Comparisons -- same shape, a comparison table page.
 *
 * Unser's Call is the same quest as Unsar's Glory under a second wiki page
 * (same giver Unsar Koldhagon, same three turn-in items, same faction
 * deltas) -- modeled once under quest:unsars-glory, same reuse pattern as
 * migration 090's Soil of Underfoot.
 *
 * Deferred to the Questlines section (new entries), not modeled standalone:
 * - Warrior Epic Quest -- real multi-stage ordered chain (two hilts, two
 *   blades, a Red Scabbard built through multiple dragon/planar boss
 *   turn-ins, final Jagged Blade of War).
 * - Warrior Pike Quests -- real ordered chain, six sequential pike tiers
 *   (Partisan's -> Militia's -> Footman's -> Soldier's -> Trooper's ->
 *   Legionnaire's Mancatcher), each stage building on the last.
 *
 * Modeled as `quest_group`s (don't count against the standalone cap),
 * following migration 088's Shadow Knight/Shaman Plane of Sky Tests and
 * Skyshrine/Thurgadin Armor Quests pattern:
 * - Warrior Kael Armor Quests -- 7 pieces, one giver (Kragek Thunderforge).
 * - Warrior Plane of Sky Tests -- 6 sub-quests behind two apprentices
 *   (Falorn, Ogog), gated by Torgon Blademaster's initial dialogue/book.
 * - Warrior Skyshrine Armor Quests -- 7 pieces, one giver (Jendavudd
 *   Fe`Dhar).
 * - Warrior Thurgadin Armor Quests -- 7 pieces, one giver (Captain Njall).
 *
 * Reused existing nodes rather than duplicating:
 * - item:eruds-tonic (from the already-modeled Erud's Tonic Quest) for
 *   Vasty Deep Water's tradeable Erud's Tonic reward.
 * - npc:greater-faydark:tylfon, npc:paineel:royal-guard-sheltuin,
 *   npc:cobalt-scar:chief-kalan, npc:kael-drakkal:vorken-iceshard,
 *   npc:erudin:rarnan-lapice, npc:skyshrine:sentry-kale -- all already
 *   exist as quest givers for other quests in this graph; this batch adds
 *   new `starts` edges to them rather than new NPC nodes.
 * - faction:tunare-s-scouts ("Tunare's Scouts"), faction:craftkeepers
 *   ("Craftkeepers") -- reused the existing label spelling over a
 *   near-duplicate that also exists in the graph (Tunares Scouts / Craft
 *   Keepers) to avoid adding a third variant.
 *
 * Zone note: Tunic of Ridossan Quest's wiki page places Lyris Moonbane in
 * Qeynos Aqueducts, but the graph's existing npc:qeynos-catacombs:lyris-moonbane
 * (from a Guild Summons quest) is located in Qeynos Catacombs, a real
 * separate zone. Rather than assume a wiki error, modeled this as a second
 * NPC node (npc:qeynos-aqueducts:lyris-moonbane) trusting each quest's own
 * stated zone.
 *
 * No new zones needed -- every giver's zone (Greater Faydark, Paineel,
 * Cobalt Scar, South Qeynos, Grobb, Kael Drakkal, Erudin, Skyshrine,
 * Thurgadin, East Cabilis, Iceclad Ocean, Rivervale, Warsliks Woods, Plane
 * of Sky, Surefall Glade) already exists in the graph.
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, addFactionReward, addGiver, save, slug } = loadGraph(import.meta.dir);

// ---------------------------------------------------------------------
// Tunare Scouts Dagger
// ---------------------------------------------------------------------
{
  const zoneId = "zone:greater-faydark";
  const giverId = "npc:greater-faydark:tylfon";
  addGiver(giverId, "Tylfon", zoneId);

  const questId = "quest:tunare-scouts-dagger";
  addNode({
    id: questId,
    label: "Tunare Scouts Dagger",
    type: "quest",
    classes: ["rogue"],
    minLevel: 1,
    description:
      "Tylfon at the Scouts of Tunare (Rogue) Guild Hall in Kelethin trades 2 gold and 2 Rusty Daggers for the Tarnished Dagger.",
    steps: [
      "Collect 2 gold and 2 Rusty Daggers",
      "Turn them in to Tylfon at the Scouts of Tunare Guild Hall in Kelethin",
    ],
    wiki_title: "Tunare Scouts Dagger",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Tunare's Scouts");

  const daggerId = "item:tarnished-dagger";
  addNode({
    id: daggerId,
    label: "Tarnished Dagger",
    type: "item",
    slots: ["Primary", "Secondary"],
    skill: "Piercing",
    damage: 3,
    delay: 22,
    weight: 2.5,
    size: "Small",
    effect: "Backstab: 3",
    source: "Tunare Scouts Dagger reward (Tylfon, Kelethin)",
  });
  addEdge(questId, daggerId, "rewards");
}

// ---------------------------------------------------------------------
// Tunic of Ridossan Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:paineel";
  const aqueductsId = "zone:qeynos-aqueducts";
  const feerrottId = "zone:the-feerrott";
  const warrensId = "zone:the-warrens";
  const giverId = "npc:paineel:royal-guard-sheltuin";
  addGiver(giverId, "Royal Guard Sheltuin", zoneId);
  const lyrisId = "npc:qeynos-aqueducts:lyris-moonbane";
  addGiver(lyrisId, "Lyris Moonbane", aqueductsId);

  const questId = "quest:tunic-of-ridossan-quest";
  addNode({
    id: questId,
    label: "Tunic of Ridossan Quest",
    type: "quest",
    classes: ["shadow knight"],
    minLevel: 1,
    description:
      "Royal Guard Sheltuin in Paineel sends a heavy locked chest to Lyris Moonbane in Qeynos Aqueducts; players gather vile substance (goblin janitor, x2), green river sludge (The Feerrott), and putrid substance (Driana Poxsbourne, via 3 reagent pouches), combine them in a thick glass jar, and trade the sealed jar to Lyris Moonbane for the Harbinger of Bertoxxulous. Pouring it into the river source in The Warrens and returning the empty jar to Royal Guard Sheltuin completes the quest for the Tunic of Ridossan.",
    steps: [
      "Deliver the heavy locked chest to Lyris Moonbane in Qeynos Aqueducts",
      "Collect 2 vile substance from a goblin janitor, green river sludge in The Feerrott, and putrid substance from Driana Poxsbourne (requires 3 reagent pouches)",
      "Combine the substances in a thick glass jar",
      "Trade the sealed jar to Lyris Moonbane for the Harbinger of Bertoxxulous",
      "Pour the substance into the river source in The Warrens",
      "Return the empty jar to Royal Guard Sheltuin in Paineel",
    ],
    wiki_title: "Tunic of Ridossan Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, aqueductsId, "located_in");
  addEdge(questId, feerrottId, "located_in");
  addEdge(questId, warrensId, "located_in");
  addFactionReward(questId, "Heretics");
  addFactionReward(questId, "Bloodsabers");
  addFactionReward(questId, "Opal Dark Briar");
  addFactionReward(questId, "Corrupt Qeynos Guards");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Priests of Life");
  addFactionReward(questId, "Deepwater Knights");

  const tunicId = "item:tunic-of-ridossan";
  addNode({
    id: tunicId,
    label: "Tunic of Ridossan",
    type: "item",
    slots: ["Chest"],
    classes: ["shadow knight"],
    race: ["erudite"],
    ac: 15,
    stats: { dex: 2, sta: 2, int: 1 },
    resists: { fire: 3, disease: 3 },
    magic: true,
    lore: true,
    noTrade: true,
    source: "Tunic of Ridossan Quest reward (Royal Guard Sheltuin, Paineel)",
  });
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Ulthork Tusks Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:cobalt-scar";
  const giverId = "npc:cobalt-scar:chief-kalan";
  addGiver(giverId, "Chief Kalan", zoneId);

  const questId = "quest:ulthork-tusks-quest";
  addNode({
    id: questId,
    label: "Ulthork Tusks Quest",
    type: "quest",
    minLevel: 1,
    description:
      "Chief Kalan in Cobalt Scar barters for no less than four pairs of Ulthork tusks, in exchange for a random gem or piece of jewelry.",
    steps: [
      "Collect four pairs of Ulthork tusks",
      "Turn them in to Chief Kalan in Cobalt Scar",
    ],
    wiki_title: "Ulthork Tusks Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Othmir");
  addFactionReward(questId, "Ulthork");

  const gems = [
    "Black Sapphire", "Blue Diamond", "Crystallized Sulfur", "Diamond",
    "Fire Emerald", "Fire Emerald Ring", "Jacinth", "Ruby", "Ruby Crown",
    "Sapphire", "Sapphire Necklace", "Star Ruby", "Star Ruby Earring",
  ];
  for (const gem of gems) {
    const gemId = `item:${slug(gem)}-ulthork`;
    addNode({
      id: gemId,
      label: gem,
      type: "item",
      weight: 0.1,
      size: "Tiny",
      source: "Ulthork Tusks Quest reward (Chief Kalan, Cobalt Scar)",
    });
    addEdge(questId, gemId, "rewards", { randomGroup: "ulthork-tusks-quest-drop" });
  }
}

// ---------------------------------------------------------------------
// Unsar's Glory (also covers Unser's Call -- same giver, same three
// turn-in items, same faction deltas, two wiki pages for one quest)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:unsar-koldhagon";
  addGiver(giverId, "Unsar Koldhagon", zoneId);

  const questId = "quest:unsars-glory";
  addNode({
    id: questId,
    label: "Unsar's Glory",
    type: "quest",
    minLevel: 1,
    description:
      "Unsar Koldhagon at the Hall of Sorcery in South Qeynos, available at Dubious or better Order of Three faction, trades Rat Whiskers, Snake Scales, and two Bat Wings -- common drops in the newbie yard outside the North Gate -- for experience and faction.",
    steps: [
      "Reach at least Dubious faction with Order of Three",
      "Collect Rat Whiskers, Snake Scales, and two Bat Wings",
      "Turn them in to Unsar Koldhagon at the Hall of Sorcery in South Qeynos",
    ],
    wiki_title: "Unsar's Glory",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Order of Three");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Bloodsabers");
  addFactionReward(questId, "Opal Dark Briar");
}

// ---------------------------------------------------------------------
// Urako's Big Mistake
// ---------------------------------------------------------------------
{
  const zoneId = "zone:grobb";
  const oggokId = "zone:oggok";
  const feerrottId = "zone:the-feerrott";
  const giverId = "npc:grobb:urako";
  addGiver(giverId, "Urako", zoneId);

  const questId = "quest:urakos-big-mistake";
  addNode({
    id: questId,
    label: "Urako's Big Mistake",
    type: "quest",
    minLevel: 1,
    description:
      "Urako in Grobb collects four skeleton-building pieces: Grobb Oven Mittens (Carver Cagrek, for 3 Froglok Meat + 10 gold), Ogre Butcher Apron (Chef Dooga in Oggok, for 3 Pickled Froglok + 10 gold), Ship in a Bottle (Clurg in Oggok), and 4 Lizardman Scout Fifes (lizardman scouts, The Feerrott); trading them for the Kaglari Mana Doll.",
    steps: [
      "Trade 3 Froglok Meat and 10 gold to Carver Cagrek for Grobb Oven Mittens",
      "Trade 3 Pickled Froglok and 10 gold to Chef Dooga in Oggok for an Ogre Butcher Apron",
      "Obtain a Ship in a Bottle from Clurg in Oggok",
      "Collect 4 Lizardman Scout Fifes from lizardman scouts in The Feerrott",
      "Turn in all four items to Urako in Grobb",
    ],
    wiki_title: "Urako's Big Mistake",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, oggokId, "located_in");
  addEdge(questId, feerrottId, "located_in");
  addFactionReward(questId, "Dark Ones");
  addFactionReward(questId, "Shadowknights of Night Keep");

  const dollId = "item:kaglari-mana-doll";
  addNode({
    id: dollId,
    label: "Kaglari Mana Doll",
    type: "item",
    ac: 4,
    mana: 15,
    weight: 0.8,
    source: "Urako's Big Mistake reward (Urako, Grobb)",
  });
  addEdge(questId, dollId, "rewards");
}

// ---------------------------------------------------------------------
// Vambraces of Avoidance Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const wastesId = "zone:eastern-wastes";
  const giverId = "npc:kael-drakkal:vorken-iceshard";
  addGiver(giverId, "Vorken Iceshard", zoneId);

  const questId = "quest:vambraces-of-avoidance-quest";
  addNode({
    id: questId,
    label: "Vambraces of Avoidance Quest",
    type: "quest",
    minLevel: 1,
    description:
      "Vorken Iceshard, inside the plate house in Kael Drakkel, trades the Head of Ekelng Thunderstone (killed in the northeast corner of Eastern Wastes) for the Vambraces of Avoidance.",
    steps: [
      "Defeat Ekelng Thunderstone in the northeast corner of Eastern Wastes and loot his head",
      "Return the head to Vorken Iceshard in Kael Drakkel",
    ],
    wiki_title: "Vambraces of Avoidance Quest",
    era: "Velious",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, wastesId, "located_in");
  addFactionReward(questId, "Kromrif");
  addFactionReward(questId, "Kromzek");
  addFactionReward(questId, "Coldain");
  addFactionReward(questId, "Claws of Veeshan");

  const vambracesId = "item:vambraces-of-avoidance";
  addNode({
    id: vambracesId,
    label: "Vambraces of Avoidance",
    type: "item",
    slots: ["Arms"],
    ac: 12,
    stats: { str: 3 },
    resists: { magic: 5 },
    magic: true,
    weight: 3.2,
    size: "Small",
    source: "Vambraces of Avoidance Quest reward (Vorken Iceshard, Kael Drakkel)",
  });
  addEdge(questId, vambracesId, "rewards");
}

// ---------------------------------------------------------------------
// Vasty Deep Water
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const northQeynosId = "zone:north-qeynos";
  const giverId = "npc:erudin:rarnan-lapice";
  addGiver(giverId, "Rarnan Lapice", zoneId);

  const questId = "quest:vasty-deep-water";
  addNode({
    id: questId,
    label: "Vasty Deep Water",
    type: "quest",
    minLevel: 1,
    description:
      "Rarnan Lapice in Erudin requests the Testament of Vanear, chaining through Illithi Nollith, Tol Nicelot, and Nolusia Finharn to obtain and deliver Erud's Tonic (a no-trade and a tradeable version) to Moodoro Finharn and Flynn Merrington, a poisoned tonic meant to eliminate a criminal's associate; the Label of Erud's Tonic returned to Nolusia Finharn completes the chain.",
    steps: [
      "Obtain the Testament of Vanear for Rarnan Lapice",
      "Follow the chain through Illithi Nollith and Tol Nicelot to Nolusia Finharn",
      "Obtain Erud's Tonic via Sinnkin Highbrow and deliver the no-trade version to Nolusia Finharn",
      "Receive a tradeable Erud's Tonic and instructions; deliver the no-trade tonic to Moodoro Finharn and the tradeable tonic to Flynn Merrington",
      "Return the Label of Erud's Tonic from Flynn Merrington to Nolusia Finharn",
    ],
    wiki_title: "Vasty Deep Water",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, northQeynosId, "located_in");
  addFactionReward(questId, "Craftkeepers");
  addFactionReward(questId, "High Council of Erudin");
  addFactionReward(questId, "Heretics");
  addFactionReward(questId, "High Guard of Erudin");

  const clubId = "item:splintering-club";
  addNode({
    id: clubId,
    label: "Splintering Club",
    type: "item",
    slots: ["Primary"],
    skill: "1H Blunt",
    damage: 4,
    weight: 1.0,
    size: "Small",
    source: "Vasty Deep Water reward (Rarnan Lapice, Erudin)",
  });
  addEdge(questId, clubId, "rewards");
  addEdge(questId, "item:eruds-tonic", "rewards");
}

// ---------------------------------------------------------------------
// Velium Retrieval
// ---------------------------------------------------------------------
{
  const zoneId = "zone:skyshrine";
  const thurgadinId = "zone:thurgadin";
  const giverId = "npc:skyshrine:sentry-kale";
  addGiver(giverId, "Sentry Kale", zoneId);
  const ungdinId = "npc:thurgadin:ungdin";
  addGiver(ungdinId, "Ungdin", thurgadinId);

  const questId = "quest:velium-retrieval";
  addNode({
    id: questId,
    label: "Velium Retrieval",
    type: "quest",
    minLevel: 1,
    description:
      "Sentry Kale in Skyshrine gives a Velium Delivery Note for Ungdin in the Thurgadin mines; paying Ungdin 50 platinum for a Shipment of Velium Ore and returning it to Sentry Kale occasionally yields the Bracer of Hammerfal.",
    steps: [
      "Receive a Velium Delivery Note from Sentry Kale in Skyshrine",
      "Deliver the note to Ungdin in the Thurgadin mines and pay 50 platinum",
      "Receive a Shipment of Velium Ore",
      "Return the shipment to Sentry Kale in Skyshrine",
    ],
    wiki_title: "Velium Retrieval",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, thurgadinId, "located_in");
  addFactionReward(questId, "Claws of Veeshan");
  addFactionReward(questId, "Yelinak");
  addFactionReward(questId, "Kromzek");

  const bracerId = "item:bracer-of-hammerfal";
  addNode({
    id: bracerId,
    label: "Bracer of Hammerfal",
    type: "item",
    slots: ["Wrist"],
    ac: 6,
    stats: { sta: 5, wis: 3 },
    hp: 25,
    magic: true,
    noTrade: true,
    effect: "Summon Throwing Hammer",
    source: "Velium Retrieval reward (Sentry Kale, Skyshrine); not always given",
  });
  addEdge(questId, bracerId, "rewards");
}

// ---------------------------------------------------------------------
// Vengeance for Frenway
// ---------------------------------------------------------------------
{
  const zoneId = "zone:surefall-glade";
  const giverId = "npc:surefall-glade:frenway-marthank";
  addGiver(giverId, "Frenway Marthank", zoneId);

  const questId = "quest:vengeance-for-frenway";
  addNode({
    id: questId,
    label: "Vengeance for Frenway",
    type: "quest",
    minLevel: 1,
    description:
      "Frenway Marthank in Surefall Glade takes a Mammoth's Hide, looted alongside a Bayle List II from a Mammoth, for coin and faction. Killing the Mammoth incurs a large negative faction hit with Surefall's residents that the hide turn-in only partly recovers.",
    steps: [
      "Defeat a Mammoth and loot its Mammoth's Hide and Bayle List II",
      "Turn in the hide to Frenway Marthank in Surefall Glade",
    ],
    wiki_title: "Vengeance for Frenway",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Protectors of the Pine");
  addFactionReward(questId, "Jaggedpine Treefolk");
  addFactionReward(questId, "Sabertooths of Blackburrow");
  addFactionReward(questId, "Guards of Qeynos");
}

// ---------------------------------------------------------------------
// Visceral Dagger
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-cabilis";
  const giverId = "npc:east-cabilis:lord-qyzar";
  addGiver(giverId, "Lord Qyzar", zoneId);

  const questId = "quest:visceral-dagger";
  addNode({
    id: questId,
    label: "Visceral Dagger",
    type: "quest",
    classes: ["shadow knight", "necromancer"],
    minLevel: 1,
    description:
      "Lord Qyzar in East Cabilis collects a Dagger Hilt, Sharp Metal Shard, and Jagged Metal Shard (each from a different a kly imprecator) plus a Forge Hammer of Dalnir (undead blacksmith), combined at the Grand Forge for the Visceral Dagger.",
    steps: [
      "Defeat three a kly imprecators for a Dagger Hilt, Sharp Metal Shard, and Jagged Metal Shard",
      "Defeat an undead blacksmith for the Forge Hammer of Dalnir",
      "Combine the pieces at the Grand Forge",
      "Return to Lord Qyzar in East Cabilis",
    ],
    wiki_title: "Visceral Dagger",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const daggerId = "item:visceral-dagger";
  addNode({
    id: daggerId,
    label: "The Visceral Dagger",
    type: "item",
    slots: ["Primary"],
    classes: ["shadow knight", "necromancer"],
    skill: "Piercing",
    damage: 6,
    delay: 21,
    stats: { int: 8 },
    magic: true,
    lore: true,
    noTrade: true,
    source: "Visceral Dagger reward (Lord Qyzar, East Cabilis)",
  });
  addEdge(questId, daggerId, "rewards");
}

// ---------------------------------------------------------------------
// Vkjor's Major Task
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const westernWastesId = "zone:western-wastes";
  const giverId = "npc:kael-drakkal:vkjor";
  addGiver(giverId, "Vkjor", zoneId);

  const questId = "quest:vkjors-major-task";
  addNode({
    id: questId,
    label: "Vkjor's Major Task",
    type: "quest",
    classes: ["warrior"],
    minLevel: 1,
    description:
      "Vkjor in Kael Drakkel sends warriors to slay three dragons in Western Wastes -- Draazak, Jerigozia, and Veredenia -- and loot a claw from each, for the Silver Steel Gauntlets.",
    steps: [
      "Defeat Draazak, Jerigozia, and Veredenia in Western Wastes for a claw each",
      "Return the three claws to Vkjor in Kael Drakkel",
    ],
    wiki_title: "Vkjor's Major Task",
    era: "Velious",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, westernWastesId, "located_in");
  addFactionReward(questId, "Kromzek");
  addFactionReward(questId, "Kromrif");
  addFactionReward(questId, "King Tormax");
  addFactionReward(questId, "Claws of Veeshan");

  const gauntletsId = "item:silver-steel-gauntlets";
  addNode({
    id: gauntletsId,
    label: "Silver Steel Gauntlets",
    type: "item",
    slots: ["Hands"],
    classes: ["warrior"],
    ac: 16,
    stats: { str: 7 },
    hp: 80,
    resists: { disease: 10, cold: 10 },
    magic: true,
    noTrade: true,
    source: "Vkjor's Major Task reward (Vkjor, Kael Drakkel)",
  });
  addEdge(questId, gauntletsId, "rewards");
}

// ---------------------------------------------------------------------
// Vkjor's Minor Task
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const iceCladId = "zone:iceclad-ocean";
  const giverId = "npc:kael-drakkal:vkjor";
  addGiver(giverId, "Vkjor", zoneId);
  const graktarId = "npc:iceclad-ocean:graktar-bluehammer";
  addGiver(graktarId, "Graktar Bluehammer", iceCladId);

  const questId = "quest:vkjors-minor-task";
  addNode({
    id: questId,
    label: "Vkjor's Minor Task",
    type: "quest",
    minLevel: 1,
    description:
      "Vkjor in Kael Drakkel gives a Large Note for Graktar Bluehammer in Iceclad Ocean; Graktar's Signet Ring, retrieved from a wedding at the Tower of Frozen Shadow, is returned to Graktar for coin and faction.",
    steps: [
      "Receive a Large Note from Vkjor in Kael Drakkel",
      "Deliver the note to Graktar Bluehammer in Iceclad Ocean",
      "Retrieve Graktar's Signet Ring from the Tower of Frozen Shadow",
      "Return the ring to Graktar Bluehammer",
    ],
    wiki_title: "Vkjor's Minor Task",
    era: "Velious",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, iceCladId, "located_in");
  addFactionReward(questId, "Kromrif");
  addFactionReward(questId, "Kromzek");
  addFactionReward(questId, "Coldain");
  addFactionReward(questId, "Claws of Veeshan");
}

// ---------------------------------------------------------------------
// Wage War Upon The Coldain
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const giverId = "npc:kael-drakkal:kromrif-recruiter";
  addGiver(giverId, "A Kromrif Recruiter", zoneId);

  const questId = "quest:wage-war-upon-the-coldain";
  addNode({
    id: questId,
    label: "Wage War Upon The Coldain",
    type: "quest",
    minLevel: 1,
    description:
      "A Kromrif recruiter in Kael Drakkel, available at Dubious or better faction, buys Coldain Heads (up to 4 per turn-in) for experience and faction with the Kromrif and Kromzek.",
    steps: [
      "Reach at least Dubious faction with the Kromrif recruiter",
      "Defeat Coldain and loot their heads",
      "Turn in up to 4 heads at a time to the Kromrif recruiter in Kael Drakkel",
    ],
    wiki_title: "Wage War Upon The Coldain",
    era: "Velious",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Kromrif");
  addFactionReward(questId, "Kromzek");
  addFactionReward(questId, "Coldain");
  addFactionReward(questId, "Claws of Veeshan");
}

// ---------------------------------------------------------------------
// Wall Squad Ring
// ---------------------------------------------------------------------
{
  const zoneId = "zone:rivervale";
  const giverId = "npc:rivervale:marshal-ghobber";
  addGiver(giverId, "Marshal Ghobber", zoneId);
  const hendiId = "npc:rivervale:hendi-mrubble";
  addGiver(hendiId, "Hendi Mrubble", zoneId);

  const questId = "quest:wall-squad-ring";
  addNode({
    id: questId,
    label: "Wall Squad Ring",
    type: "quest",
    minLevel: 1,
    description:
      "After completing the Orc Belts quest, Marshal Ghobber at the Rivervale bank gives the Squad Ring to players at Warmly or better Guardians of the Vale faction; Hendi Mrubble recharges it at Amiable faction.",
    steps: [
      "Complete the Orc Belts quest",
      "Reach at least Warmly faction with Guardians of the Vale",
      "Ask Marshal Ghobber \"Am I one with the Wall?\" at the Rivervale bank",
      "Bring the ring to Hendi Mrubble to recharge it (requires Amiable faction)",
    ],
    wiki_title: "Wall Squad Ring",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "quest:orc-belts", "requires");
  addFactionReward(questId, "Guardians of the Vale");

  const ringId = "item:squad-ring";
  addNode({
    id: ringId,
    label: "Squad Ring",
    type: "item",
    slots: ["Finger"],
    charges: 1,
    lore: true,
    noTrade: true,
    weight: 0.1,
    size: "Tiny",
    effect: "Healing (Any Slot, instant cast)",
    source: "Wall Squad Ring reward (Marshal Ghobber, Rivervale)",
  });
  addEdge(questId, ringId, "rewards");
}

// ---------------------------------------------------------------------
// Watcher Torches
// ---------------------------------------------------------------------
{
  const zoneId = "zone:warsliks-woods";
  const giverId = "npc:warsliks-woods:captain-gideen";
  addGiver(giverId, "Captain Gideen", zoneId);

  const questId = "quest:watcher-torches";
  addNode({
    id: questId,
    label: "Watcher Torches",
    type: "quest",
    minLevel: 1,
    description:
      "Captain Gideen in Warsliks Woods rewards no fewer than three Watcher Signal Torches with an Aloe Swatch.",
    steps: [
      "Collect three Watcher Signal Torches",
      "Turn them in to Captain Gideen in Warsliks Woods",
    ],
    wiki_title: "Watcher Torches",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Legion of Cabilis");
  addFactionReward(questId, "Cabilis Residents");
  addFactionReward(questId, "Scaled Mystics");
  addFactionReward(questId, "Crusaders Of Greenmist");
  addFactionReward(questId, "Swift Tails");

  const swatchId = "item:aloe-swatch";
  addNode({
    id: swatchId,
    label: "Aloe Swatch",
    type: "item",
    weight: 0.5,
    size: "Small",
    source: "Watcher Torches reward (Captain Gideen, Warsliks Woods)",
  });
  addEdge(questId, swatchId, "rewards");
}

// ---------------------------------------------------------------------
// Warrior Kael Armor Quests (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const giverId = "npc:kael-drakkal:kragek-thunderforge";
  addGiver(giverId, "Kragek Thunderforge", zoneId);

  const groupId = "quest_group:warrior-kael-armor-quests";
  addNode({
    id: groupId,
    label: "Warrior Kael Armor Quests",
    type: "quest_group",
    classes: ["warrior"],
    description:
      "Kragek Thunderforge in Kael Drakkel trades an Ancient Tarnished armor piece plus three matching gems for its Warlord's counterpart. Seven independent sub-quests, no ordering between them.",
    wiki_title: "Warrior Kael Armor Quests",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const pieces = [
    { label: "Crown", base: "Ancient Tarnished Plate Helmet", gem: "Crushed Coral", reward: "Warlord's Crown", slots: ["Head"], ac: 30, stats: { str: 4, dex: 3, sta: 7 }, hp: 35 },
    { label: "Breastplate", base: "Ancient Tarnished Breastplate", gem: "Flawless Diamond", reward: "Warlord's Breastplate", slots: ["Chest"], ac: 59, stats: { str: 16, dex: 7, sta: 10, agi: 7 }, hp: 90 },
    { label: "Vambraces", base: "Ancient Tarnished Vambraces", gem: "Flawed Emerald", reward: "Warlord's Vambraces", slots: ["Arms"], ac: 33, stats: { str: 5, sta: 6 }, hp: 25 },
    { label: "Bracer", base: "Ancient Tarnished Plate Bracelet", gem: "Crushed Flame Emerald", reward: "Warlord's Bracer", slots: ["Wrist"], ac: 25, stats: { sta: 2, agi: 7 }, hp: 35 },
    { label: "Gauntlets", base: "Ancient Tarnished Plate Gauntlets", gem: "Crushed Topaz", reward: "Warlord's Gauntlets", slots: ["Hands"], ac: 30, stats: { sta: 5 }, hp: 60 },
    { label: "Greaves", base: "Ancient Tarnished Greaves", gem: "Flawed Sea Sapphire", reward: "Warlord's Greaves", slots: ["Legs"], ac: 45, stats: { str: 9, dex: 7, sta: 5 } },
    { label: "Boots", base: "Ancient Tarnished Plate Boots", gem: "Crushed Black Marble", reward: "Warlord's Boots", slots: ["Feet"], ac: 32, stats: { sta: 3, agi: 2 }, hp: 30 },
  ] as const;

  for (const piece of pieces) {
    const questId = `quest:warrior-kael-armor-quests-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `Warrior Kael Armor Quests: ${piece.label}`,
      type: "quest",
      classes: ["warrior"],
      description: `Turn in a ${piece.base} plus 3 ${piece.gem} to Kragek Thunderforge in Kael Drakkel for the ${piece.reward}.`,
      steps: [`Gather a ${piece.base} and 3 ${piece.gem}`, "Turn them in to Kragek Thunderforge in Kael Drakkel"],
      wiki_title: "Warrior Kael Armor Quests",
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
      classes: ["warrior"],
      slots: piece.slots,
      magic: true,
      ac: piece.ac,
      stats: piece.stats,
      ...("hp" in piece ? { hp: piece.hp } : {}),
      source: `Warrior Kael Armor Quests: ${piece.label} reward (Kragek Thunderforge, Kael Drakkel)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// ---------------------------------------------------------------------
// Warrior Skyshrine Armor Quests (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:skyshrine";
  const giverId = "npc:skyshrine:jendavudd-fedhar";
  addGiver(giverId, "Jendavudd Fe`Dhar", zoneId);

  const groupId = "quest_group:warrior-skyshrine-armor-quests";
  addNode({
    id: groupId,
    label: "Warrior Skyshrine Armor Quests",
    type: "quest_group",
    classes: ["warrior"],
    description:
      "Jendavudd Fe`Dhar in Skyshrine trades an Unadorned Plate armor piece plus three matching gems for its Myrmidon counterpart. Seven independent sub-quests, no ordering between them (Bracer of the Myrmidon has two independent turn-ins for the same reward).",
    wiki_title: "Warrior Skyshrine Armor Quests",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const pieces = [
    { label: "Crown", base: "Unadorned Plate Helmet", gem: "Crushed Coral", reward: "Crown of the Myrmidon", slots: ["Head"], ac: 27, stats: { str: 3, dex: 12 }, hp: 35 },
    { label: "Breastplate", base: "Unadorned Breastplate", gem: "Flawless Diamond", reward: "Breastplate of the Myrmidon", slots: ["Chest"], ac: 54, stats: { str: 15, dex: 7, sta: 10, agi: 7 }, hp: 90 },
    { label: "Vambraces", base: "Unadorned Plate Vambraces", gem: "Flawed Emerald", reward: "Vambraces of the Myrmidon", slots: ["Arms"], ac: 30, stats: { str: 5, sta: 5, agi: 5 }, hp: 25 },
    { label: "Bracer", base: "Unadorned Plate Bracer", gem: "Crushed Flame Emerald", reward: "Bracer of the Myrmidon", slots: ["Wrist"], ac: 22, stats: { str: 2, dex: 2, sta: 5, agi: 9 }, hp: 15 },
    { label: "Gauntlets", base: "Unadorned Plate Gauntlets", gem: "Crushed Topaz", reward: "Gauntlets of the Myrmidon", slots: ["Hands"], ac: 27, stats: { dex: 8 }, hp: 90 },
    { label: "Greaves", base: "Unadorned Plate Greaves", gem: "Flawed Sea Sapphire", reward: "Greaves of the Myrmidon", slots: ["Legs"], ac: 40, stats: { str: 9, dex: 9, agi: 9 }, hp: 40 },
    { label: "Boots", base: "Unadorned Plate Boots", gem: "Crushed Black Marble", reward: "Boots of the Myrmidon", slots: ["Feet"], ac: 28, stats: { sta: 4, dex: 2 }, hp: 25 },
  ] as const;

  for (const piece of pieces) {
    const questId = `quest:warrior-skyshrine-armor-quests-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `Warrior Skyshrine Armor Quests: ${piece.label}`,
      type: "quest",
      classes: ["warrior"],
      description: `Turn in a ${piece.base} plus 3 ${piece.gem} to Jendavudd Fe\`Dhar in Skyshrine for the ${piece.reward}.`,
      steps: [`Gather a ${piece.base} and 3 ${piece.gem}`, "Turn them in to Jendavudd Fe`Dhar in Skyshrine"],
      wiki_title: "Warrior Skyshrine Armor Quests",
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
      classes: ["warrior"],
      slots: piece.slots,
      magic: true,
      ac: piece.ac,
      stats: piece.stats,
      ...("hp" in piece ? { hp: piece.hp } : {}),
      source: `Warrior Skyshrine Armor Quests: ${piece.label} reward (Jendavudd Fe\`Dhar, Skyshrine)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// ---------------------------------------------------------------------
// Warrior Thurgadin Armor Quests (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:thurgadin";
  const giverId = "npc:thurgadin:captain-njall";
  addGiver(giverId, "Captain Njall", zoneId);

  const groupId = "quest_group:warrior-thurgadin-armor-quests";
  addNode({
    id: groupId,
    label: "Warrior Thurgadin Armor Quests",
    type: "quest_group",
    classes: ["warrior"],
    description:
      "Captain Njall in Thurgadin trades a Corroded Plate armor piece plus three matching gems for its Champion's counterpart. Seven independent sub-quests, no ordering between them (Champion's Bracer has two independent turn-ins for the same reward).",
    wiki_title: "Warrior Thurgadin Armor Quests",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const pieces = [
    { label: "Helm", base: "Corroded Plate Helmet", gem: "Crushed Coral", reward: "Champion's Crown", slots: ["Head"], ac: 24, stats: { str: 2, sta: 7 }, hp: 35 },
    { label: "Breastplate", base: "Corroded Breastplate", gem: "Flawless Diamond", reward: "Champion's Breastplate", slots: ["Chest"], ac: 47, stats: { str: 14 }, hp: 90, resists: { magic: 4 } },
    { label: "Arm Plates", base: "Corroded Plate Vambraces", gem: "Flawed Emerald", reward: "Champion's Vambraces", slots: ["Arms"], ac: 24, stats: { str: 4 }, hp: 25 },
    { label: "Bracers", base: "Corroded Plate Bracer", gem: "Crushed Flame Emerald", reward: "Champion's Bracer", slots: ["Wrist"], ac: 19, stats: { agi: 7 }, hp: 15 },
    { label: "Gauntlets", base: "Corroded Plate Gauntlets", gem: "Crushed Topaz", reward: "Champion's Gauntlets", slots: ["Hands"], ac: 24, stats: { agi: 5 }, hp: 40 },
    { label: "Greaves", base: "Corroded Plate Greaves", gem: "Flawed Sea Sapphire", reward: "Champion's Greaves", slots: ["Legs"], ac: 34, stats: { str: 9, sta: 7 } },
    { label: "Boots", base: "Corroded Plate Boots", gem: "Crushed Black Marble", reward: "Champion's Boots", slots: ["Feet"], ac: 25, stats: { str: 1, sta: 3 } },
  ] as const;

  for (const piece of pieces) {
    const questId = `quest:warrior-thurgadin-armor-quests-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `Warrior Thurgadin Armor Quests: ${piece.label}`,
      type: "quest",
      classes: ["warrior"],
      description: `Turn in a ${piece.base} plus 3 ${piece.gem} to Captain Njall in Thurgadin for the ${piece.reward}.`,
      steps: [`Gather a ${piece.base} and 3 ${piece.gem}`, "Turn them in to Captain Njall in Thurgadin"],
      wiki_title: "Warrior Thurgadin Armor Quests",
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
      classes: ["warrior"],
      slots: piece.slots,
      magic: true,
      ac: piece.ac,
      stats: piece.stats,
      ...("hp" in piece ? { hp: piece.hp } : {}),
      ...("resists" in piece ? { resists: piece.resists } : {}),
      source: `Warrior Thurgadin Armor Quests: ${piece.label} reward (Captain Njall, Thurgadin)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// ---------------------------------------------------------------------
// Warrior Plane of Sky Tests (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:plane-of-sky";
  const torgonId = "npc:plane-of-sky:torgon-blademaster";
  const falornId = "npc:plane-of-sky:falorn";
  const ogogId = "npc:plane-of-sky:ogog";
  addGiver(torgonId, "Torgon Blademaster", zoneId);
  addGiver(falornId, "Falorn", zoneId);
  addGiver(ogogId, "Ogog", zoneId);

  const groupId = "quest_group:warrior-plane-of-sky-tests";
  addNode({
    id: groupId,
    label: "Warrior Plane of Sky Tests",
    type: "quest_group",
    classes: ["warrior"],
    description:
      "Torgon Blademaster in the Plane of Sky hands warriors a book to read, then summons either Falorn or Ogog based on the player's choice; each apprentice offers three independent item-turn-in tests for a named reward. Six independent sub-quests, no ordering between them.",
    wiki_title: "Warrior Plane of Sky Tests",
  });
  addEdge(torgonId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const tests = [
    { label: "Test of Strength", giverId: falornId, giverLabel: "Falorn", items: "a bronze disc, small pick, and stone amulet", reward: "Runed Wind Amulet", slots: ["Neck"], ac: 6, stats: { str: 7, agi: 7 }, hp: 40, weight: 0.1, size: "Tiny" },
    { label: "Test of Force", giverId: falornId, giverLabel: "Falorn", items: "a pearlescent globe, silver mesh, and spiroc air totem", reward: "Pauldrons of the Blue Sky", slots: ["Shoulders"], ac: 12, stats: { str: 8, dex: 10, sta: 7, agi: 10 }, effect: "Spirit of Cheetah (Must Equip, instant cast) at Level 45", weight: 4.5, size: "Medium" },
    { label: "Test of Skill", giverId: falornId, giverLabel: "Falorn", items: "an ivory tessera, small ruby, and azure ring", reward: "Azure Ruby Ring", slots: ["Finger"], ac: 5, stats: { str: 6, dex: 9, sta: 6 }, weight: 0.1, size: "Tiny" },
    { label: "Test of Bash", giverId: ogogId, giverLabel: "Ogog", items: "an efreeti battle axe, honeyed nectar, bottled djinni, and ethereal emerald", reward: "Fangol", slots: ["Primary"], skill: "2H Slashing", damage: 29, delay: 35, stats: { str: 3, dex: 10, sta: 10 }, resists: { poison: 5 }, effect: "Fangol's Breath (Combat, instant cast) at Level 50", weight: 8.0, size: "Giant" },
    { label: "Test of Smash", giverId: ogogId, giverLabel: "Ogog", items: "a djinni war blade, virulent poison, and mottled spiroc feather", reward: "Dagas", slots: ["Primary", "Secondary"], skill: "1H Slashing", damage: 11, delay: 21, ac: 20, stats: { str: 3, agi: 2 }, hp: 100, weight: 2.5, size: "Medium" },
    { label: "Test of Think", giverId: ogogId, giverLabel: "Ogog", items: "an efreeti belt, pegasus statuette, spiroc wind totem, and wind tablet", reward: "Belt of the Four Winds", slots: ["Waist"], ac: 5, stats: { str: 12, dex: 6, sta: 12, agi: 6 }, resists: { magic: 5 }, effect: "Haste +41%", weight: 2.0, size: "Medium" },
  ] as const;

  for (const test of tests) {
    const questId = `quest:warrior-plane-of-sky-${slug(test.label)}`;
    addNode({
      id: questId,
      label: `Warrior Plane of Sky Tests: ${test.label}`,
      type: "quest",
      classes: ["warrior"],
      description: `Bring ${test.items} to ${test.giverLabel} in the Plane of Sky for the ${test.reward}.`,
      steps: [`Gather ${test.items}`, `Turn them in to ${test.giverLabel} in the Plane of Sky`],
      wiki_title: "Warrior Plane of Sky Tests",
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
      classes: ["warrior"],
      slots: test.slots,
      magic: true,
      lore: true,
      noTrade: true,
      ...("skill" in test ? { skill: test.skill } : {}),
      ...("damage" in test ? { damage: test.damage } : {}),
      ...("delay" in test ? { delay: test.delay } : {}),
      ...(test.ac ? { ac: test.ac } : {}),
      stats: test.stats,
      ...("hp" in test ? { hp: test.hp } : {}),
      ...("resists" in test ? { resists: test.resists } : {}),
      ...("effect" in test ? { effect: test.effect } : {}),
      weight: test.weight,
      size: test.size,
      source: `Warrior Plane of Sky Tests: ${test.label} reward (${test.giverLabel}, Plane of Sky)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

save();

console.log(
  "Migration 096 complete: added 15 standalone quests from GitHub issue #26's checklist (Tunare Scouts Dagger through Watcher Torches); modeled Warrior Kael/Skyshrine/Thurgadin Armor Quests and Warrior Plane of Sky Tests as quest_groups (27 sub-quests total); skipped Unkempt Druids Quest (broken/unsolved); excluded Velious Class Armor and Velious Class Armor Comparisons (non-quest index pages); folded Unser's Call into Unsar's Glory (duplicate wiki page); deferred Warrior Epic Quest and Warrior Pike Quests to the Questlines section."
);
