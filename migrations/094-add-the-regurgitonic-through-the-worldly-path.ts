/**
 * Migration 094: next standalone batch off GitHub issue #26's checklist --
 * "The Regurgitonic" through "The Worldly Path". Researched directly against
 * eqlwiki.com, following decisions/eqlwiki-quest-research-method.md.
 *
 * New zones added (all confirmed via their own eqlwiki.com page: their own
 * zone-line/succor point, and each appears as a peer in a neighboring zone's
 * own adjacency list):
 * - Crystal Caverns -- "Adjacent Zones: Eastern Wastes," zone-lines back to
 *   Eastern Wastes; the Great Divide Supply Run's Klezendian Crystal drops
 *   here. Modeled with a `connects_to` edge to zone:eastern-wastes, following
 *   migration 020/052's template.
 * - Kaesora -- The Tome Raider's own giver's zone (a tortured librarian);
 *   its own page: "Zone line to Field of Bone," Field of Bone as its only
 *   adjacent zone. Modeled with a `connects_to` edge to zone:field-of-bone.
 * - The Wakening Land -- needed for The Velium Focus's Phenocryst step; its
 *   own page names Kael Drakkal, Plane of Sky Growth, and Skyshrine as
 *   adjacent zones. Modeled with `connects_to` edges to zone:kael-drakkal,
 *   zone:plane-of-growth, and zone:skyshrine.
 *
 * Skipped and tagged broken/not-a-quest (not modeled, per the issue's own
 * guardrail, quoting the wiki's own disclaimer):
 * - The Supply Run - Wakening Land -- wiki's own disclaimer: "This is an
 *   unsolved or broken quest" / "This seems to be a broken quest with no
 *   reward."
 * - The Test of the Green and Blue -- wiki's own disclaimer: "THE ARTICLE
 *   CONTAINS NON-LEGENDS CONTENT" / "This quest was removed from Live EQ.
 *   Marking it as 'Does Not Exist.'"
 * - The Worldly Path -- wiki's own description: "This custom quest is
 *   designed to send you to every dungeon in Norrath..." authored by
 *   User:Jaruden, not an official quest with an NPC giver/mechanic -- same
 *   player-authored-index exclusion as "Popular Quests by Level" in the
 *   issue's own checklist header.
 *
 * Deliberately NOT modeled as `item` nodes (consistent with prior batches):
 * - The Restraining Order's random class-dependent library book -- wiki's
 *   own wording: "a random book from his library... Books given out so far
 *   are:" followed by an open, not-closed list ("Presumably there is more
 *   after this"), same vague-pool carve-out as migration 090's Taskmaster
 *   Earring.
 * - The Vengeful Musicians' "Garsen's Brewing List," a ~1sp vendor-trash
 *   flavor item with no stat infobox.
 * - The Waylaid Courier's reward, listed on its own page only as "Blackened
 *   Iron Armor" with no specific piece named -- the actual "Blackened Iron
 *   Armor Set" is an unrelated 10-piece Runnyeye drop set, so this is kept
 *   as a vague, unspecified single-piece reward in prose only.
 * - The Unnamed Gift's "Chapter II, Of Bards and Bitter Winters" and Holiday
 *   Gift -- same no-stat-infobox carve-out as migration 092/093's other
 *   Chapter/Holiday Gift rewards.
 * - Coin rewards and negative faction changes throughout, as usual.
 *
 * The Rogue Take's reward, Rat Pelt Cape (AC 1, SV Cold +2, Back), is an
 * exact stat match for the existing item:rat-pelt-cape node (Rat Pelts /
 * Rat Pelt Cape Quest) -- reused rather than duplicated, same as migration
 * 090's Soil of Underfoot Quest handling.
 *
 * The Summoning of Dread/Fright/Terror are three independent (not chained)
 * Cleric-only reward quests sharing one Paineel Tabernacle of Terror
 * mechanic (deliver components for a "Mundane" item, hand it to an Avatar
 * of Dread/Fright/Terror) -- each already its own standalone checklist
 * entry, so modeled as three separate quests, not a group.
 *
 * The Spirit of Garzicor's final reward is class-dependent (not random
 * chance) across three item options -- modeled as one quest with three
 * `rewards` edges, each target item's own `classes` field restricting it,
 * no randomGroup, same pattern as migration 093's The Penance.
 *
 * Reused existing zones: Ak'Anon, East Cabilis, Neriak 3rd Gate, Halas,
 * Skyshrine, Paineel, Kael Drakkal, Great Divide, Western Karana, South
 * Qeynos, Steamfont Mountains, Runnyeye Citadel, Emerald Jungle, The
 * Overthere, Rivervale, West Freeport, Gorge of King Xorbb, Misty Thicket,
 * Iceclad Ocean, Thurgadin, Najena, Southern Desert of Ro, East Freeport,
 * Surefall Glade.
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, addFactionReward, addGiver, save } = loadGraph(import.meta.dir);

// ---------------------------------------------------------------------
// The Regurgitonic
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ak-anon";
  const surefallId = "zone:surefall-glade";
  const giverId = "npc:ak-anon:kimble-nogflop";
  addGiver(giverId, "Kimble Nogflop", zoneId);

  const questId = "quest:the-regurgitonic";
  addNode({
    id: questId,
    label: "The Regurgitonic",
    type: "quest",
    minLevel: 1,
    description:
      "Kimble Nogflop in Ak'Anon's zoo trades a Flask of Nitrates (obtained from Te'Anara in Surefall Glade) for the Regurgitonic, a lore item used in a further step with Frostbite; there is a chance of receiving a non-functional \"bad\" version.",
    steps: [
      "Obtain a Flask of Nitrates from Te'Anara in Surefall Glade",
      "Deliver the flask to Kimble Nogflop in Ak'Anon's zoo",
    ],
    wiki_title: "The Regurgitonic",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, surefallId, "located_in");
  addFactionReward(questId, "Gem Choppers");
  addFactionReward(questId, "Merchants of AkAnon");
  addFactionReward(questId, "King AkAnon");

  const tonicId = "item:regurgitonic";
  addNode({
    id: tonicId,
    label: "Regurgitonic",
    type: "item",
    lore: true,
    noTrade: true,
    weight: 0.4,
    size: "Small",
    source: "The Regurgitonic reward (Kimble Nogflop, Ak'Anon)",
  });
  addEdge(questId, tonicId, "rewards");
}

// ---------------------------------------------------------------------
// The Restraining Order
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-cabilis";
  const giverId = "npc:east-cabilis:clerk-doval";
  addGiver(giverId, "Clerk Doval", zoneId);

  const questId = "quest:the-restraining-order";
  addNode({
    id: questId,
    label: "The Restraining Order",
    type: "quest",
    minLevel: 1,
    description:
      "Clerk Doval in East Cabilis sends players to collect ten troopers' signatures, in alphabetical order, on a Legion Order -- a Quill for Trooper Fryp, Legion Lager for Trooper Gummin, a Skipping Stone for Trooper Inkin, two Barracuda Teeth for Trooper Nishnish, two Sabertooth Kitten Canines for Trooper Ozlot, and Goblin Scout Beads for Trooper Roklon -- returned to Doval for coin, faction, and a random book from his library (documented so far: The Book of Knowledge, The Code of Combat, The History of Combat, The Tome of Combat; the wiki itself notes there are presumably more).",
    steps: [
      "Collect a Quill, Legion Lager, Skipping Stone, two Barracuda Teeth, two Sabertooth Kitten Canines, and Goblin Scout Beads",
      "Deliver each item to its named trooper in alphabetical order to sign the Legion Order",
      "Return the completed Legion Order to Clerk Doval in East Cabilis",
    ],
    wiki_title: "The Restraining Order",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Legion of Cabilis");
  addFactionReward(questId, "Cabilis Residents");
  addFactionReward(questId, "Scaled Mystics");
  addFactionReward(questId, "Crusaders of Greenmist");
  addFactionReward(questId, "Swift Tails");
}

// ---------------------------------------------------------------------
// The Rogue Take
// ---------------------------------------------------------------------
{
  const zoneId = "zone:neriak-3rd-gate";
  const freeportId = "zone:east-freeport";
  const giverId = "npc:neriak-3rd-gate:eolorn-jaxx";
  addGiver(giverId, "Eolorn J`Axx", zoneId);

  const questId = "quest:the-rogue-take";
  addNode({
    id: questId,
    label: "The Rogue Take",
    type: "quest",
    minLevel: 1,
    description:
      "Eolorn J`Axx in Neriak Third Gate sends a Sealed Letter to Giz Dinree in East Freeport (spawns at night); Giz's reply leads to A Locked Chest at an offshore location, returned to Eolorn for coin and the Rat Pelt Cape.",
    steps: [
      "Receive a Sealed Letter from Eolorn J`Axx",
      "Deliver the letter to Giz Dinree in East Freeport (spawns at night)",
      "Retrieve A Locked Chest from the offshore location (-406, -1150)",
      "Return the chest to Eolorn J`Axx in Neriak Third Gate",
    ],
    wiki_title: "The Rogue Take",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, freeportId, "located_in");
  addFactionReward(questId, "Ebon Mask");

  addEdge(questId, "item:rat-pelt-cape", "rewards");
}

// ---------------------------------------------------------------------
// The Seax
// ---------------------------------------------------------------------
{
  const zoneId = "zone:halas";
  const giverId = "npc:halas:lysbith-mcnaff";
  addGiver(giverId, "Lysbith McNaff", zoneId);

  const questId = "quest:the-seax";
  addNode({
    id: questId,
    label: "The Seax",
    type: "quest",
    classes: ["warrior", "rogue"],
    minLevel: 1,
    description:
      "Lysbith McNaff in Halas trades four Wrath Orc Wristbands, looted from snow orc troopers, for the Seax.",
    steps: [
      "Collect four Wrath Orc Wristbands from snow orc troopers",
      "Turn them in to Lysbith McNaff in Halas",
    ],
    wiki_title: "The Seax",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Wolves of the North");
  addFactionReward(questId, "Shamen of Justice");
  addFactionReward(questId, "Merchants of Halas");
  addFactionReward(questId, "Steel Warriors");

  const seaxId = "item:seax";
  addNode({
    id: seaxId,
    label: "Seax",
    type: "item",
    slots: ["Primary", "Secondary"],
    classes: ["warrior", "rogue"],
    skill: "Piercing",
    damage: 3,
    delay: 21,
    backstab: 3,
    weight: 3.0,
    size: "Small",
    source: "The Seax reward (Lysbith McNaff, Halas)",
  });
  addEdge(questId, seaxId, "rewards");
}

// ---------------------------------------------------------------------
// The Spirit of Garzicor
// ---------------------------------------------------------------------
{
  const zoneId = "zone:skyshrine";
  const giverId = "npc:skyshrine:oglard";
  addGiver(giverId, "Oglard", zoneId);

  const questId = "quest:the-spirit-of-garzicor";
  addNode({
    id: questId,
    label: "The Spirit of Garzicor",
    type: "quest",
    classes: [
      "warrior", "paladin", "ranger", "shadow knight",
      "cleric", "druid", "monk", "shaman",
      "necromancer", "wizard", "magician", "enchanter",
    ],
    description:
      "Oglard in Skyshrine (via Loremaster Sarl in Thurgadin's Statue Room) requires Ally faction with Citizens of Froststone; players trade an Onyxbrand for a Dragon Crafted Urn, then bring a Finished Naginata Blade, Bronzewood Staff, and Finished Tsuba to Eldriaks Fe'Dhar; a Vial of Kromzek blood given to a Ghostly Presence spawns a raid encounter, and a Blackened and Gold Tinted diamond are combined with the Assembled Naginata in a final forge combine, turned in to Eldriaks Fe'Dhar for a class-dependent reward: the Ethereal Bladed Naginata (Warrior/Paladin/Ranger/Shadow Knight), Sanctum Guardian's Earring (Cleric/Druid/Monk/Shaman), or Pitted Iron Ring (Necromancer/Wizard/Magician/Enchanter).",
    steps: [
      "Reach Ally faction with Citizens of Froststone",
      "Trade an Onyxbrand to Oglard for a Dragon Crafted Urn",
      "Bring a Finished Naginata Blade, Bronzewood Staff, and Finished Tsuba to Eldriaks Fe'Dhar",
      "Give a Vial of Kromzek blood to a Ghostly Presence to spawn a raid encounter",
      "Combine a Blackened Diamond, Gold Tinted Diamond, and Assembled Naginata in a final forge combine",
      "Turn in the finished weapon to Eldriaks Fe'Dhar for a class-dependent reward",
    ],
    wiki_title: "The Spirit of Garzicor",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const naginataId = "item:ethereal-bladed-naginata";
  addNode({
    id: naginataId,
    label: "Ethereal Bladed Naginata",
    type: "item",
    classes: ["warrior", "paladin", "ranger", "shadow knight"],
    damage: 37,
    ac: 15,
    stats: { str: 5, dex: 10, agi: 15 },
    hp: 50,
    magic: true,
    lore: true,
    noTrade: true,
    source: "The Spirit of Garzicor reward (Eldriaks Fe'Dhar, Skyshrine)",
  });
  addEdge(questId, naginataId, "rewards");

  const earringId = "item:sanctum-guardians-earring";
  addNode({
    id: earringId,
    label: "Sanctum Guardian's Earring",
    type: "item",
    classes: ["cleric", "druid", "monk", "shaman"],
    ac: 5,
    stats: { str: 10, sta: 10, cha: 10 },
    hp: 50,
    mana: 80,
    magic: true,
    lore: true,
    noTrade: true,
    source: "The Spirit of Garzicor reward (Eldriaks Fe'Dhar, Skyshrine)",
  });
  addEdge(questId, earringId, "rewards");

  const ringId = "item:pitted-iron-ring";
  addNode({
    id: ringId,
    label: "Pitted Iron Ring",
    type: "item",
    classes: ["necromancer", "wizard", "magician", "enchanter"],
    ac: 4,
    stats: { sta: 5, int: 10 },
    hp: 50,
    mana: 50,
    magic: true,
    lore: true,
    noTrade: true,
    source: "The Spirit of Garzicor reward (Eldriaks Fe'Dhar, Skyshrine)",
  });
  addEdge(questId, ringId, "rewards");
}

// ---------------------------------------------------------------------
// The Summoning of Dread
// ---------------------------------------------------------------------
{
  const zoneId = "zone:paineel";
  const giverId = "npc:paineel:nivold-predd";
  addGiver(giverId, "Nivold Predd", zoneId);

  const questId = "quest:the-summoning-of-dread";
  addNode({
    id: questId,
    label: "The Summoning of Dread",
    type: "quest",
    classes: ["cleric"],
    minLevel: 1,
    description:
      "Nivold Predd in Paineel's Tabernacle of Terror collects a Brain of the Ishva Mal, Fire Beetle Eye, Griffon Eye, Ice Giant Toes, and Powder of Reanimation, exchanged for a Mundane Shield delivered to the Avatar of Dread for the Dread Forged Shield.",
    steps: [
      "Collect a Brain of the Ishva Mal, Fire Beetle Eye, Griffon Eye, Ice Giant Toes, and Powder of Reanimation",
      "Turn them in to Nivold Predd for a Mundane Shield",
      "Deliver the Mundane Shield to the Avatar of Dread",
    ],
    wiki_title: "The Summoning of Dread",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Dark Reflection");
  addFactionReward(questId, "Heretics");

  const shieldId = "item:dread-forged-shield";
  addNode({
    id: shieldId,
    label: "Dread Forged Shield",
    type: "item",
    slots: ["Secondary"],
    classes: ["cleric"],
    race: ["human", "erudite"],
    ac: 17,
    stats: { str: 5, cha: 10, wis: 5 },
    mana: 20,
    resists: { magic: 10 },
    magic: true,
    lore: true,
    noTrade: true,
    size: "Medium",
    source: "The Summoning of Dread reward (Avatar of Dread, Paineel)",
  });
  addEdge(questId, shieldId, "rewards");
}

// ---------------------------------------------------------------------
// The Summoning of Fright
// ---------------------------------------------------------------------
{
  const zoneId = "zone:paineel";
  const southRoId = "zone:southern-desert-of-ro";
  const lesserFaydarkId = "zone:lesser-faydark";
  const giverId = "npc:paineel:sern-adolia";
  addGiver(giverId, "Sern Adolia", zoneId);

  const questId = "quest:the-summoning-of-fright";
  addNode({
    id: questId,
    label: "The Summoning of Fright",
    type: "quest",
    classes: ["cleric"],
    minLevel: 1,
    description:
      "Sern Adolia in Paineel collects Zombie Skin (zombies), Embalming Dust (mummies/zombies, Southern Desert of Ro), Charred Bone Chips (a skeleton named Obretl, Southern Desert of Ro), and a Vial of Tunare's Breath (a druid named Kalayia Woodwhisper, Lesser Faydark), exchanged for a Mundane Helm delivered to the Avatar of Fright for the Fright Forged Helm.",
    steps: [
      "Collect Zombie Skin, Embalming Dust, Charred Bone Chips, and a Vial of Tunare's Breath",
      "Turn them in to Sern Adolia for a Mundane Helm",
      "Deliver the Mundane Helm to the Avatar of Fright",
    ],
    wiki_title: "The Summoning of Fright",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, southRoId, "located_in");
  addEdge(questId, lesserFaydarkId, "located_in");
  addFactionReward(questId, "Heretics");

  const helmId = "item:fright-forged-helm";
  addNode({
    id: helmId,
    label: "Fright Forged Helm",
    type: "item",
    slots: ["Head"],
    classes: ["cleric"],
    race: ["human", "erudite"],
    ac: 11,
    stats: { str: 2, cha: -5, wis: 4 },
    magic: true,
    lore: true,
    noTrade: true,
    weight: 5.5,
    size: "Small",
    effect: "Deadeye (Must Equip, instant cast) at Level 10",
    source: "The Summoning of Fright reward (Avatar of Fright, Paineel)",
  });
  addEdge(questId, helmId, "rewards");
}

// ---------------------------------------------------------------------
// The Summoning of Terror
// ---------------------------------------------------------------------
{
  const zoneId = "zone:paineel";
  const lowerGukId = "zone:lower-guk";
  const ratheId = "zone:rathe-mountains";
  const gorgeId = "zone:gorge-of-king-xorbb";
  const najenaId = "zone:najena";
  const giverId = "npc:paineel:miadera-shadowfyre";
  addGiver(giverId, "Miadera Shadowfyre", zoneId);

  const questId = "quest:the-summoning-of-terror";
  addNode({
    id: questId,
    label: "The Summoning of Terror",
    type: "quest",
    classes: ["cleric"],
    minLevel: 1,
    description:
      "Miadera Shadowfyre in Paineel collects an Eye of Urd (an urd ghoul wizard, Lower Guk), Basalt Drake Scales (Rathe Mountains), Lens of Lord Soptyvr (Lord Soptyvr, Gorge of King Xorbb), and Widowmistress Hair (The Widowmistress, Najena), exchanged for a Mundane Mask delivered to the Avatar of Terror for the Terror Forged Mask.",
    steps: [
      "Collect an Eye of Urd, Basalt Drake Scales, Lens of Lord Soptyvr, and Widowmistress Hair",
      "Turn them in to Miadera Shadowfyre for a Mundane Mask",
      "Deliver the Mundane Mask to the Avatar of Terror",
    ],
    wiki_title: "The Summoning of Terror",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, lowerGukId, "located_in");
  addEdge(questId, ratheId, "located_in");
  addEdge(questId, gorgeId, "located_in");
  addEdge(questId, najenaId, "located_in");
  addFactionReward(questId, "Heretics");

  const maskId = "item:terror-forged-mask";
  addNode({
    id: maskId,
    label: "Terror Forged Mask",
    type: "item",
    slots: ["Face"],
    classes: ["cleric"],
    race: ["human", "erudite"],
    ac: 4,
    stats: { cha: -5, wis: 7 },
    resists: { magic: 5 },
    magic: true,
    lore: true,
    noTrade: true,
    weight: 1.5,
    size: "Small",
    effect: "Fear (Any Slot/Can Equip, 6.0 sec cast) at Level 25",
    source: "The Summoning of Terror reward (Avatar of Terror, Paineel)",
  });
  addEdge(questId, maskId, "rewards");
}

// ---------------------------------------------------------------------
// The Supply Run - Eastern Wastes
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const easternWastesId = "zone:eastern-wastes";
  const giverId = "npc:kael-drakkal:svekk-fangbinder";
  addGiver(giverId, "Svekk Fangbinder", zoneId);

  const questId = "quest:the-supply-run-eastern-wastes";
  addNode({
    id: questId,
    label: "The Supply Run - Eastern Wastes",
    type: "quest",
    minLevel: 1,
    description:
      "Svekk Fangbinder in Kael Drakkal sells a Giant Sack of Supplies for 500 gold, delivered to Fjloaren at the Giant Fort in Eastern Wastes; Fjloaren's Velium Torque is returned to Svekk for roughly 100 gold and faction.",
    steps: [
      "Buy a Giant Sack of Supplies from Svekk Fangbinder for 500 gold",
      "Deliver the supplies to Fjloaren at the Giant Fort in Eastern Wastes",
      "Return the Velium Torque received from Fjloaren to Svekk Fangbinder",
    ],
    wiki_title: "The Supply Run - Eastern Wastes",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, easternWastesId, "located_in");
  addFactionReward(questId, "Kromrif");
  addFactionReward(questId, "Kromzek");
}

// ---------------------------------------------------------------------
// Crystal Caverns (new zone -- Great Divide Supply Run's crystal source)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:crystal-caverns";
  addNode({
    id: zoneId,
    label: "Crystal Caverns",
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
    lore: "The Crystal Caverns are the ancient home of the Coldain, named Froststone, long since overrun by giants and now orcs and other creatures.",
    wiki_title: "Crystal Caverns",
    era: "Velious",
  });
  addEdge(zoneId, "zone:eastern-wastes", "connects_to");
  addEdge("zone:eastern-wastes", zoneId, "connects_to");
}

// ---------------------------------------------------------------------
// The Supply Run - Great Divide
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const greatDivideId = "zone:great-divide";
  const crystalCavernsId = "zone:crystal-caverns";
  const giverId = "npc:kael-drakkal:svekk-fangbinder";
  addGiver(giverId, "Svekk Fangbinder", zoneId);

  const questId = "quest:the-supply-run-great-divide";
  addNode({
    id: questId,
    label: "The Supply Run - Great Divide",
    type: "quest",
    minLevel: 1,
    description:
      "Svekk Fangbinder in Kael Drakkal sells a Giant Sack of Supplies for 50 platinum, delivered to Bekerak Coldbones at the Great Divide's Giant Fort; his note plus a Klezendian Crystal (orcs/geonids, Crystal Caverns) trade for a Large Supply Sack, delivered back to Bekerak for the Kromrif Battle Totem.",
    steps: [
      "Buy a Giant Sack of Supplies from Svekk Fangbinder for 50 platinum",
      "Deliver the supplies to Bekerak Coldbones at the Giant Fort in Great Divide",
      "Return with Bekerak's note to Svekk Fangbinder",
      "Obtain a Klezendian Crystal from orcs or geonids in Crystal Caverns",
      "Give the note and crystal to Svekk Fangbinder for a Large Supply Sack",
      "Deliver the Large Supply Sack to Bekerak Coldbones",
    ],
    wiki_title: "The Supply Run - Great Divide",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, greatDivideId, "located_in");
  addEdge(questId, crystalCavernsId, "located_in");

  const totemId = "item:kromrif-battle-totem";
  addNode({
    id: totemId,
    label: "Kromrif Battle Totem",
    type: "item",
    slots: ["Secondary"],
    ac: 4,
    stats: { str: 2, wis: 3, int: 3 },
    hp: 5,
    mana: 5,
    magic: true,
    lore: true,
    noTrade: true,
    weight: 5.0,
    source: "The Supply Run - Great Divide reward (Bekerak Coldbones, Great Divide)",
  });
  addEdge(questId, totemId, "rewards");
}

// ---------------------------------------------------------------------
// The Supply Run - Wakening Land -- SKIPPED, broken/unfinished per the
// wiki's own disclaimer: "This is an unsolved or broken quest" / "This
// seems to be a broken quest with no reward."
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// The Sword of Nobility
// ---------------------------------------------------------------------
{
  const zoneId = "zone:western-karana";
  const giverId = "npc:western-karana:ryshon-hunsti";
  addGiver(giverId, "Ryshon Hunsti", zoneId);

  const questId = "quest:the-sword-of-nobility";
  addNode({
    id: questId,
    label: "The Sword of Nobility",
    type: "quest",
    classes: ["paladin"],
    minLevel: 20,
    description:
      "Ryshon Hunsti in Western Karana relays a note through Kanthuk Ogrebane, Llara, and Ruathey, who provides a Nobleman's Bag; combining an Amstaf's Scroll, Blade of Nobility, Ghoul's Heart, and Hilt of the Nobleman in the bag yields Ghoulbane.",
    steps: [
      "Trade Ryshon's note to Kanthuk Ogrebane for a Pendant",
      "Give the Pendant to Llara for a note to Ruathey",
      "Give the note to Ruathey for a Nobleman's Bag",
      "Gather an Amstaf's Scroll, Blade of Nobility, Ghoul's Heart, and Hilt of the Nobleman",
      "Combine all four items in the Nobleman's Bag for Ghoulbane",
    ],
    wiki_title: "The Sword of Nobility",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const swordId = "item:ghoulbane";
  addNode({
    id: swordId,
    label: "Ghoulbane",
    type: "item",
    slots: ["Primary"],
    classes: ["paladin"],
    race: ["human", "erudite", "high elf", "half elf", "dwarf", "halfling", "gnome"],
    skill: "1H Slashing",
    damage: 15,
    delay: 34,
    magic: true,
    lore: true,
    noTrade: true,
    weight: 9.5,
    size: "Large",
    effect: "Dismiss Undead (Combat, instant cast) at Level 20",
    source: "The Sword of Nobility reward (Ryshon Hunsti, Western Karana)",
  });
  addEdge(questId, swordId, "rewards");
}

// ---------------------------------------------------------------------
// The Tattered Pouch
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const northQeynosId = "zone:north-qeynos";
  const giverId = "npc:south-qeynos:raz-the-rat-misk";
  addGiver(giverId, "Raz The Rat Misk", zoneId);

  const questId = "quest:the-tattered-pouch";
  addNode({
    id: questId,
    label: "The Tattered Pouch",
    type: "quest",
    minLevel: 1,
    description:
      "Raz The Rat Misk in South Qeynos sells a tattered leather pouch for 8 gold total, delivered to Crow in North Qeynos for Crow's Special Brew and 3-5 gold.",
    steps: [
      "Give Raz The Rat Misk 3 gold, then 5 more gold for a tattered leather pouch",
      "Deliver the pouch to Crow in North Qeynos",
    ],
    wiki_title: "The Tattered Pouch",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, northQeynosId, "located_in");
  addFactionReward(questId, "Circle Of Unseen Hands");
  addFactionReward(questId, "Corrupt Qeynos Guards");
  addFactionReward(questId, "Kane Bayle");
}

// ---------------------------------------------------------------------
// The Telescope
// ---------------------------------------------------------------------
{
  const zoneId = "zone:steamfont-mountains";
  const runnyeyeId = "zone:runnyeye-citadel";
  const giverId = "npc:steamfont-mountains:brona-frugrin";
  addGiver(giverId, "Brona Frugrin", zoneId);

  const questId = "quest:the-telescope";
  addNode({
    id: questId,
    label: "The Telescope",
    type: "quest",
    minLevel: 1,
    description:
      "Brona Frugrin in Steamfont Mountains trades an Evil Eye Lens, dropped by Borxx on the fourth floor of Clan Runnyeye, for the Staff of the Observers.",
    steps: [
      "Kill Borxx on the fourth floor of Clan Runnyeye for an Evil Eye Lens",
      "Deliver the lens to Brona Frugrin in Steamfont Mountains",
    ],
    wiki_title: "The Telescope",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, runnyeyeId, "located_in");
  addFactionReward(questId, "King AkAnon");
  addFactionReward(questId, "Eldritch Collective");

  const staffId = "item:staff-of-the-observers";
  addNode({
    id: staffId,
    label: "Staff of the Observers",
    type: "item",
    slots: ["Primary"],
    classes: ["cleric", "druid", "shaman", "wizard", "magician", "enchanter"],
    skill: "2H Blunt",
    damage: 12,
    delay: 35,
    stats: { wis: 5, int: 5 },
    mana: 30,
    magic: true,
    lore: true,
    charges: 20,
    weight: 10.0,
    size: "Large",
    effect: "Sentinel (Any Slot, instant cast)",
    source: "The Telescope reward (Brona Frugrin, Steamfont Mountains)",
  });
  addEdge(questId, staffId, "rewards");
}

// ---------------------------------------------------------------------
// The Test of the Green and Blue -- SKIPPED, wiki's own disclaimer:
// "THE ARTICLE CONTAINS NON-LEGENDS CONTENT" / "This quest was removed
// from Live EQ. Marking it as 'Does Not Exist.'"
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// Kaesora (new zone -- The Tome Raider's giver's zone)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kaesora";
  addNode({
    id: zoneId,
    label: "Kaesora",
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
    lore: "The history behind the ruins of Kaesora is lost, however most believe that the same cataclysm that struck down the wurm and permanently scoured the surface of the Field of Bone above it laid waste to Kaesora as well. Now only the dead walk these halls.",
    wiki_title: "Kaesora",
    era: "Kunark",
  });
  addEdge(zoneId, "zone:field-of-bone", "connects_to");
  addEdge("zone:field-of-bone", zoneId, "connects_to");
}

// ---------------------------------------------------------------------
// The Tome Raider
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kaesora";
  const emeraldJungleId = "zone:emerald-jungle";
  const overthereId = "zone:the-overthere";
  const giverId = "npc:kaesora:tortured-librarian";
  addGiver(giverId, "tortured librarian", zoneId);

  const questId = "quest:the-tome-raider";
  addNode({
    id: questId,
    label: "The Tome Raider",
    type: "quest",
    classes: ["necromancer"],
    race: ["iksar"],
    minLevel: 1,
    description:
      "The tortured librarian in Kaesora needs a book from an iksar tomb raider (a rare spawn in Emerald Jungle) and an Emerald traded to Dom K`Perl at The Overthere's Dark Elf outpost for a tradeable \"Before Green\" book; both books returned to the librarian yield the Large Tassel Bookmark, an ingredient of the Necromancer 8th Rank Skullcap Quest.",
    steps: [
      "Obtain a book from an iksar tomb raider in Emerald Jungle",
      "Trade an Emerald to Dom K`Perl at The Overthere's Dark Elf outpost for \"Before Green\"",
      "Return both books to the tortured librarian in Kaesora",
    ],
    wiki_title: "The Tome Raider",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, emeraldJungleId, "located_in");
  addEdge(questId, overthereId, "located_in");
  addFactionReward(questId, "Brood of Kotiz");

  const bookmarkId = "item:large-tassel-bookmark";
  addNode({
    id: bookmarkId,
    label: "Large Tassel Bookmark",
    type: "item",
    slots: ["Waist"],
    classes: [
      "warrior", "cleric", "paladin", "ranger", "shadow knight",
      "bard", "rogue", "shaman", "monk", "beastlord", "druid",
    ],
    race: ["human", "barbarian", "erudite", "wood elf", "high elf", "dark elf", "iksar"],
    ac: 2,
    lore: true,
    noTrade: true,
    weight: 1.0,
    size: "Small",
    source: "The Tome Raider reward (tortured librarian, Kaesora)",
  });
  addEdge(questId, bookmarkId, "rewards");
}

// ---------------------------------------------------------------------
// The Torn Pouch
// ---------------------------------------------------------------------
{
  const zoneId = "zone:rivervale";
  const giverId = "npc:rivervale:toelia-snuckery";
  addGiver(giverId, "Toelia Snuckery", zoneId);

  const questId = "quest:the-torn-pouch";
  addNode({
    id: questId,
    label: "The Torn Pouch",
    type: "quest",
    minLevel: 1,
    description:
      "Toelia Snuckery in Rivervale sends players for a Torn Old Pouch (a lake-bottom spawn near 90, -356), then to slay Chomper for a Large Ruby, both delivered to Toelia for coin and faction.",
    steps: [
      "Obtain a Torn Old Pouch from the lake bottom near (90, -356)",
      "Deliver it to Toelia Snuckery",
      "Slay Chomper and loot the Large Ruby",
      "Return the ruby to Toelia Snuckery",
    ],
    wiki_title: "The Torn Pouch",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Deeppockets");
  addFactionReward(questId, "Circle Of Unseen Hands");
  addFactionReward(questId, "Coalition of Tradefolk Underground");
  addFactionReward(questId, "Carson McCabe");
}

// ---------------------------------------------------------------------
// The Traitor
// ---------------------------------------------------------------------
{
  const zoneId = "zone:west-freeport";
  const giverId = "npc:west-freeport:sir-lucan-dlere";
  addGiver(giverId, "Sir Lucan D`Lere", zoneId);

  const questId = "quest:the-traitor";
  addNode({
    id: questId,
    label: "The Traitor",
    type: "quest",
    minLevel: 10,
    description:
      "Sir Lucan D`Lere in West Freeport sends players to obtain a Slashed Militia Tunic from Guard Alayle in the Freeport Militia House's backyard, returned for 7 gold and faction.",
    steps: [
      "Obtain a Slashed Militia Tunic from Guard Alayle",
      "Return it to Sir Lucan D`Lere in West Freeport",
    ],
    wiki_title: "The Traitor",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Freeport Militia");
  addFactionReward(questId, "Coalition of Tradefolk Underground");
}

// ---------------------------------------------------------------------
// The Treant Fists
// ---------------------------------------------------------------------
{
  const zoneId = "zone:west-freeport";
  const gorgeId = "zone:gorge-of-king-xorbb";
  const mistyId = "zone:misty-thicket";
  const runnyeyeId = "zone:runnyeye-citadel";
  const giverId = "npc:west-freeport:puab-closk";
  addGiver(giverId, "Puab Closk", zoneId);

  const questId = "quest:the-treant-fists";
  addNode({
    id: questId,
    label: "The Treant Fists",
    type: "quest",
    classes: ["monk"],
    minLevel: 1,
    description:
      "Puab Closk, at the Ashen Order guild house in West Freeport, sends players to collect fallen comrade Thipt's remains -- a Humerus Handled Mace (Gorge of King Xorbb), Ribcage Chest Armor (Misty Thicket), Cat Skull Cap and Fractured Femur (Runnyeye Citadel) -- combined in a Box With Pawprints for A Box of Cat Bones, given to a banished kerran for a Tattered Parchment, delivered back to Puab Closk for the Treant Fists.",
    steps: [
      "Collect a Humerus Handled Mace, Ribcage Chest Armor, Cat Skull Cap, and Fractured Femur",
      "Combine them in the Box With Pawprints for A Box of Cat Bones",
      "Give the box to the banished kerran for a Tattered Parchment",
      "Deliver the parchment to Puab Closk in West Freeport",
    ],
    wiki_title: "The Treant Fists",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, gorgeId, "located_in");
  addEdge(questId, mistyId, "located_in");
  addEdge(questId, runnyeyeId, "located_in");

  const fistsId = "item:treant-fists";
  addNode({
    id: fistsId,
    label: "Treant Fists",
    type: "item",
    slots: ["Hands"],
    classes: ["monk"],
    race: [
      "human", "barbarian", "erudite", "wood elf", "high elf",
      "dark elf", "half elf", "dwarf", "troll", "ogre", "halfling", "gnome",
    ],
    ac: 8,
    stats: { dex: 3 },
    hp: 5,
    magic: true,
    lore: true,
    noTrade: true,
    weight: 0.7,
    size: "Small",
    source: "The Treant Fists reward (Puab Closk, West Freeport)",
  });
  addEdge(questId, fistsId, "rewards");
}

// ---------------------------------------------------------------------
// The Unnamed Gift
// ---------------------------------------------------------------------
{
  const zoneId = "zone:iceclad-ocean";
  const thurgadinId = "zone:thurgadin";
  const giverId = "npc:iceclad-ocean:archivist-tyriele";
  addGiver(giverId, "Archivist Tyriele", zoneId);

  const questId = "quest:the-unnamed-gift";
  addNode({
    id: questId,
    label: "The Unnamed Gift",
    type: "quest",
    minLevel: 1,
    description:
      "Archivist Tyriele in Iceclad Ocean gives a Lost Gift Box, delivered to Kirvil Snowstring in Thurgadin's bar; the Discarded Packaging received in exchange, returned to Tyriele, grants Chapter II, Of Bards and Bitter Winters, plus a Holiday Gift. No stat infobox is documented for either reward.",
    steps: [
      "Receive a Lost Gift Box from Archivist Tyriele",
      "Deliver the box to Kirvil Snowstring in Thurgadin's bar",
      "Return the Discarded Packaging received to Archivist Tyriele",
    ],
    wiki_title: "The Unnamed Gift",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, thurgadinId, "located_in");
}

// ---------------------------------------------------------------------
// The Wakening Land (new zone -- The Velium Focus's Phenocryst step)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:the-wakening-land";
  addNode({
    id: zoneId,
    label: "The Wakening Land",
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
    lore: "The Wakening Land is a large forested valley on this otherwise frozen continent. The goddess Tunare has a very palpable presence here, and is the reason that the area is so full of life.",
    wiki_title: "The Wakening Land",
    era: "Velious",
  });
  addEdge(zoneId, "zone:kael-drakkal", "connects_to");
  addEdge("zone:kael-drakkal", zoneId, "connects_to");
  addEdge(zoneId, "zone:plane-of-growth", "connects_to");
  addEdge("zone:plane-of-growth", zoneId, "connects_to");
  addEdge(zoneId, "zone:skyshrine", "connects_to");
  addEdge("zone:skyshrine", zoneId, "connects_to");
}

// ---------------------------------------------------------------------
// The Velium Focus
// ---------------------------------------------------------------------
{
  const zoneId = "zone:thurgadin";
  const wakeningId = "zone:the-wakening-land";
  const crystalCavernsId = "zone:crystal-caverns";
  const giverId = "npc:thurgadin:normon-stonetooth";
  addGiver(giverId, "Normon Stonetooth", zoneId);

  const questId = "quest:the-velium-focus";
  addNode({
    id: questId,
    label: "The Velium Focus",
    type: "quest",
    classes: ["necromancer", "wizard", "magician", "enchanter"],
    description:
      "Normon Stonetooth in Thurgadin starts a long forge/turn-in chain -- his axe and a Small Piece of Velium sharpened by Hakon Brightsteel into a Velium Focus, refined twice by Phenocryst (The Wakening Land) and a geonid (Crystal Caverns) into an Elbaite Focus, then three ground-spawn crystals plus three slain giants' Holy Symbol of Zek medals upgrade it through an Azurite Focus into the final Phenocryst's Focus.",
    steps: [
      "Receive Normon's axe from Normon Stonetooth",
      "Give the axe and a Small Piece of Velium to Hakon Brightsteel for a sharpened pick",
      "Return the pick to Normon Stonetooth for a Velium Focus",
      "Give the focus to Phenocryst in The Wakening Land for an altered focus",
      "Give the focus to a geonid in Crystal Caverns for a modified focus",
      "Return to Phenocryst for the Elbaite Focus",
      "Collect a Bent Metallic, Heavy Metallic, and Reddish crystal",
      "Turn in the crystals and Elbaite Focus to Phenocryst for the Azurite Focus",
      "Defeat three spawned giants and loot their Holy Symbol of Zek medals",
      "Submit the medals and Azurite Focus to Phenocryst for Phenocryst's Focus",
    ],
    wiki_title: "The Velium Focus",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, wakeningId, "located_in");
  addEdge(questId, crystalCavernsId, "located_in");
  addFactionReward(questId, "Geonid Collective");

  const focusId = "item:phenocrysts-focus";
  addNode({
    id: focusId,
    label: "Phenocryst's Focus",
    type: "item",
    slots: ["Primary", "Secondary"],
    classes: ["necromancer", "wizard", "magician", "enchanter"],
    race: ["human", "erudite", "high elf", "dark elf", "gnome", "iksar"],
    ac: 5,
    stats: { dex: 3, cha: 3, int: 10 },
    mana: 40,
    resists: { fire: 3, disease: 3, cold: 3, magic: 5, poison: 3 },
    magic: true,
    lore: true,
    noTrade: true,
    weight: 0.5,
    size: "Small",
    source: "The Velium Focus reward (Phenocryst, The Wakening Land)",
  });
  addEdge(questId, focusId, "rewards");
}

// ---------------------------------------------------------------------
// The Vengeful Musicians
// ---------------------------------------------------------------------
{
  const zoneId = "zone:halas";
  const everfrostId = "zone:everfrost-peaks";
  const giverId = "npc:halas:thadres-thyme";
  addGiver(giverId, "Thadres Thyme", zoneId);

  const questId = "quest:the-vengeful-musicians";
  addNode({
    id: questId,
    label: "The Vengeful Musicians",
    type: "quest",
    minLevel: 1,
    description:
      "Thadres Thyme in Halas collects three diary pages (74-76), looted from the vengeful soloist, vengeful composer, and vengeful lyricist in Everfrost Peaks and turned in simultaneously, for Garsen's Brewing List, a vendor-flavor item with no stat infobox. Killing Thadres instead worsens faction.",
    steps: [
      "Defeat the vengeful soloist, vengeful composer, and vengeful lyricist in Everfrost Peaks",
      "Loot diary pages 74, 75, and 76",
      "Turn in all three pages simultaneously to Thadres Thyme in Halas",
    ],
    wiki_title: "The Vengeful Musicians",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, everfrostId, "located_in");
}

// ---------------------------------------------------------------------
// The Visiting Priestess
// ---------------------------------------------------------------------
{
  const zoneId = "zone:najena";
  const giverId = "npc:najena:a-visiting-priestess";
  addGiver(giverId, "A Visiting Priestess", zoneId);

  const questId = "quest:the-visiting-priestess";
  addNode({
    id: questId,
    label: "The Visiting Priestess",
    type: "quest",
    minLevel: 1,
    description:
      "A Visiting Priestess in Najena collects an Ice Crystal Staff, Water Crystal Staff, Slime Crystal Staff, and Fire Crystal Staff; after she despawns, a Scroll of Flayed Goblin Skin is looted and given with a Star Ruby to Nallar Q'Tentu, then a Vial of Noble's Blood is given to Zanotix Ixtaz for the Blued Two-Handed Hammer.",
    steps: [
      "Give the four crystal staves to A Visiting Priestess in Najena",
      "Loot the Scroll of Flayed Goblin Skin after she despawns",
      "Give the scroll and a Star Ruby to Nallar Q'Tentu",
      "Give a Vial of Noble's Blood to Zanotix Ixtaz for the Blued Two-Handed Hammer",
    ],
    wiki_title: "The Visiting Priestess",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Dark Bargainers");

  const hammerId = "item:blued-two-handed-hammer";
  addNode({
    id: hammerId,
    label: "Blued Two-Handed Hammer",
    type: "item",
    slots: ["Primary"],
    classes: ["warrior", "cleric", "paladin", "ranger", "shadow knight", "druid", "shaman", "monk", "beastlord"],
    skill: "2H Blunt",
    damage: 21,
    delay: 44,
    stats: { dex: 3, sta: 3 },
    mana: 30,
    resists: { fire: 10 },
    magic: true,
    lore: true,
    noTrade: true,
    weight: 11.0,
    size: "Large",
    effect: "Project Lightning (instant cast) at Level 30",
    source: "The Visiting Priestess reward (Zanotix Ixtaz, Najena)",
  });
  addEdge(questId, hammerId, "rewards");
}

// ---------------------------------------------------------------------
// The Waylaid Courier
// ---------------------------------------------------------------------
{
  const zoneId = "zone:paineel";
  const giverId = "npc:paineel:shevra-kollintar";
  addGiver(giverId, "Shevra Kollintar", zoneId);

  const questId = "quest:the-waylaid-courier";
  addNode({
    id: questId,
    label: "The Waylaid Courier",
    type: "quest",
    minLevel: 1,
    description:
      "Shevra Kollintar in Paineel sends players to kill Malik Zaren at the Golden Rooster Inn in Highpass Hold for a Sealed Letter, returned to Shevra for a piece of Blackened Iron Armor (the specific piece is not named on the wiki) and faction.",
    steps: [
      "Kill Malik Zaren at the Golden Rooster Inn, Highpass Hold, for a Sealed Letter",
      "Return the letter to Shevra Kollintar in Paineel",
    ],
    wiki_title: "The Waylaid Courier",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Heretics");
}

// ---------------------------------------------------------------------
// The Worldly Path -- SKIPPED, not a real quest per eqlwiki.com's own
// description: "This custom quest is designed to send you to every
// dungeon in Norrath..." -- a player-authored (User:Jaruden) personal
// challenge list, not an official quest with an NPC giver/mechanic.
// ---------------------------------------------------------------------

save();
