/**
 * Migration 073: 25 more quests off GitHub issue #26's checklist -- Key to
 * Sleeper's Tomb through Recharge Prayer Beads. Researched directly against
 * eqlwiki.com, following decisions/eqlwiki-quest-research-method.md and
 * using migrations/_lib.ts.
 *
 * Skipped (wiki itself confirms broken/unfinished/non-quest, per the issue's
 * "only skip when the wiki confirms it" guardrail), left unchecked on the
 * issue for a future look if the wiki content ever changes:
 * - Legion Lager Quest: "the Trooper was possibly removed from the game"
 *   (giver Trooper Neozite likely gone; quest marked unsolved).
 * - Long Iron Rod Quest: "unsolved or broken", missing dialogue/faction/NPC
 *   location info.
 * - Lord Grimlot's Love: "an unsolved or broken quest" -- reward item no
 *   longer applies per the wiki's own correction note.
 * - Mooto's Proof: "unsolved or broken", turn-in items yield no results per
 *   the wiki's own testing note.
 * - Odd Items: wiki editor's own note says "I think this was just stand in
 *   dialogue without actual quests attached."
 *
 * Not modeled as graph edges (consistent with decisions/quest-reward-
 * modeling.md): Porlos' Fury Quest's spell reward ("Spell: Porlos' Fury")
 * has no matching spell node in this graph's corpus -- left prose-only
 * rather than fabricate one. Rathmana's Traveling Offer's reward is an
 * explicit random draw from a pool of ~6 spells plus a fallback scroll --
 * modeling every possible spell as a guaranteed `rewards` edge would
 * misrepresent a gamble as a sure thing, so it stays prose-only too.
 *
 * Reused existing items (same item, different quest hands it out):
 * `item:rat-pelt-cape` (previously only Rat Pelts) for Rat Pelt Cape Quest;
 * `item:rusty-two-handed-battle-axe` (previously only Lizard Meat Quest) for
 * Ranjor's Test, now with damage/delay filled in; `item:prayer-beads`
 * (previously only Errand for Wolten) for Recharge Prayer Beads, since that
 * quest is a recharge service for the same item, not a new one;
 * `item:potion-of-light-healing` and `item:potion-of-disease-warding`
 * (already modeled from other quests) as two of Putrid Skeletons' four
 * tiered rewards. Reused existing NPCs already in the graph from other
 * quests at the same zone: Roesager Thusten, Priestess Caulria, Suuspa
 * Clanim, Chef Dooga. New NPC "Menkes Tabolet" (South Qeynos) is reused
 * across three separate quests in this batch (Rat Fur Cap, Rat Pelt Cape,
 * Rat's Foot Necklace), all real distinct quests per their own wiki pages.
 *
 * Not chased down as new zones (incidental farming/vendor stops, not the
 * quest giver's own zone, per decisions/quest-reward-modeling.md's
 * disproportionate-research carve-out): Kaesora (one of six ancient-coin
 * drop spots in Rare Coins) and Siren's Grotto (one reagent stop in Porlos'
 * Fury Quest) -- both stay prose-only in `steps`.
 *
 * Deliberately NOT modeled (consistent with every migration so far): coin
 * rewards, negative faction changes, race/deity restrictions -- decisions/
 * quest-reward-modeling.md and decisions/item-node-schema.md.
 */

import { loadGraph } from "./_lib";

const { graph, addNode, addEdge, addFactionReward, addGiver, save } = loadGraph(import.meta.dir);

// ---------------------------------------------------------------------
// Key to Sleeper's Tomb
// ---------------------------------------------------------------------
{
  const zoneId = "zone:dragon-necropolis";
  const giverId = "npc:dragon-necropolis:jaled-dars-shade";
  addGiver(giverId, "Jaled Dar`s shade", zoneId);

  const keyId = "item:sleepers-key";
  addNode({ id: keyId, label: "Sleeper's Key", type: "item", weight: 0, size: "Tiny", magic: true, noTrade: true, source: "Key to Sleeper's Tomb reward (Jaled Dar`s shade, Dragon Necropolis) -- opens the door at the dragon statue in Eastern Wastes" });

  const questId = "quest:key-to-sleepers-tomb";
  addNode({
    id: questId,
    label: "Key to Sleeper's Tomb",
    type: "quest",
    description: "Bring a talisman from any of the five First Brood dragons (Sontalak's, Lendiniara's, Klandicar's, Yelinak's, or Zlandicar's) to Jaled Dar`s shade in Dragon Necropolis, who trades it for a Sleeper's Key that opens the door at a great dragon statue in Eastern Wastes.",
    steps: ["Obtain a talisman from Sontalak, Lendiniara, Klandicar, Yelinak, or Zlandicar", "Deliver the talisman to Jaled Dar`s shade in Dragon Necropolis", "Use the Sleeper's Key at the dragon statue in Eastern Wastes"],
    wiki_title: "Key to Sleeper's Tomb",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:eastern-wastes", "located_in");
  addEdge(questId, keyId, "rewards");
}

// ---------------------------------------------------------------------
// Polar Bear Cloak Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:everfrost-peaks";
  const giverId = "npc:everfrost-peaks:karg-icebear";
  addGiver(giverId, "Karg IceBear", zoneId);

  const cloakId = "item:polar-bear-cloak";
  addNode({ id: cloakId, label: "Polar Bear Cloak", type: "item", slots: ["Back"], ac: 5, resists: { cold: 15 }, weight: 3.5, size: "Large", source: "Polar Bear Cloak Quest reward (Karg IceBear, Everfrost Peaks)" });

  const questId = "quest:polar-bear-cloak-quest";
  addNode({
    id: questId,
    label: "Polar Bear Cloak Quest",
    type: "quest",
    description: "Karg IceBear wanders the tundra outside the Permafrost gates in Everfrost Peaks, trading a Polar Bear Skin and 5 platinum pieces for a cloak he makes from the pelts.",
    steps: ["Locate Karg IceBear in Everfrost Peaks", "Give him a Polar Bear Skin and 5 platinum"],
    wiki_title: "Polar Bear Cloak Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, cloakId, "rewards");
}

// ---------------------------------------------------------------------
// Porlos' Fury Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:western-wastes";
  const giverId = "npc:western-wastes:the-dragon-sage";
  addGiver(giverId, "The Dragon Sage", zoneId);

  const questId = "quest:porlos-fury-quest";
  addNode({
    id: questId,
    label: "Porlos' Fury Quest",
    type: "quest",
    description: "The Dragon Sage, a High Elf in Western Wastes, sends the player through a multi-step reagent chase -- Tomekeeper Bjordnessin in The Wakening Land, Dragonbane Herb from Siren's Grotto, Dragon Blood from Myga in Western Wastes -- culminating in Spell: Porlos' Fury (requiring two peridots to cast). Not modeled as a graph reward edge since this graph's spell corpus has no matching node.",
    steps: [
      "Receive a Giant Loyalist Token from The Dragon Sage",
      "Trade it to Tomekeeper Bjordnessin in The Wakening Land for a Giant Scalebound Tome",
      "Return the tome to The Dragon Sage for an Ornate Reagent Box",
      "Obtain Dragonbane Herb from Siren's Grotto and Dragon Blood from Myga in Western Wastes",
      "Combine the herb and blood in the box to make a Sealed Reagent Box",
      "Give the sealed box to The Dragon Sage for Spell: Porlos' Fury",
    ],
    wiki_title: "Porlos' Fury Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:the-wakening-land", "located_in");
}

// ---------------------------------------------------------------------
// Preserved Meat Delivery
// ---------------------------------------------------------------------
{
  const zoneId = "zone:oggok";
  const giverId = "npc:oggok:chef-dooga";
  addGiver(giverId, "Chef Dooga", zoneId);

  const glovesId = "item:ogre-butcher-gloves";
  addNode({ id: glovesId, label: "Ogre Butcher Gloves", type: "item", slots: ["Hands"], ac: 1, resists: { disease: 25, poison: 25 }, classes: ["warrior", "shadow knight", "shaman"], weight: 1.9, size: "Small", source: "Preserved Meat Delivery rare reward (The Gobbler, Neriak Foreign Quarter) -- restricted to Troll or Ogre race; other possible outcomes are an Ogre Meat Cleaver, a Star Rose Quartz, or 1-5 gold" });

  const dorbId = "npc:neriak-foreign-quarter:the-gobbler";
  addNode({ id: dorbId, label: "The Gobbler", type: "npc", roles: ["quest_giver"] });
  addEdge(dorbId, "zone:neriak-foreign-quarter", "located_in");

  const questId = "quest:preserved-meat-delivery";
  addNode({
    id: questId,
    label: "Preserved Meat Delivery",
    type: "quest",
    description: "Chef Dooga in the Oggok tavern hands over a Preserved Leg to be delivered to The Gobbler in Neriak Foreign Quarter, who improves Neriak Ogre faction standing and gives a random reward -- most often coin, occasionally an Ogre Meat Cleaver or Star Rose Quartz, rarely the prized Ogre Butcher Gloves. Also completable as part of the broader HEHE Meat Quest line.",
    minLevel: 4,
    steps: ["Receive a Preserved Leg from Chef Dooga in the Oggok tavern", "Deliver it to The Gobbler in Neriak Foreign Quarter"],
    wiki_title: "Preserved Meat Delivery",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:neriak-foreign-quarter", "located_in");
  addFactionReward(questId, "Neriak Ogre");
  addEdge(questId, glovesId, "rewards");
}

// ---------------------------------------------------------------------
// Princess Lenya (Quest)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:northern-felwithe";
  const giverId = "npc:northern-felwithe:tynkale";
  addGiver(giverId, "Tynkale", zoneId);

  const shieldId = "item:silent-watch-shield";
  addNode({ id: shieldId, label: "Silent Watch Shield", type: "item", slots: ["Back", "Secondary"], ac: 10, stats: { wis: 10 }, classes: ["paladin"], weight: 9.5, size: "Large", magic: true, noTrade: true, source: "Princess Lenya (Quest) reward (Tynkale, Northern Felwithe) -- excludes Troll, Ogre, and Iksar race" });

  const questId = "quest:princess-lenya-quest";
  addNode({
    id: questId,
    label: "Princess Lenya (Quest)",
    type: "quest",
    description: "A long chain starting with Tynkale in Northern Felwithe: retrieve a Very Large Pelt from Jojongua, meet Tolon Nurbyte at the Travelers Home Inn, defeat Tyrana Slil for a Fish Food Vial, trade a Silk Evening Tunic to Marlin Shirtov for a Brass Key, feed the prepared fish food to a royal fish in Lake Rathetear to transform Princess Lenya, give her the Brass Key and Tearon's Bracer, then return the Highkeep Royal Suite key and Royal Amulet of Thex to Tearon Bleanix for a Silent Watch Shield.",
    steps: [
      "Obtain a Very Large Pelt from Jojongua and return it to Tynkale",
      "Meet Tolon Nurbyte at the Travelers Home Inn",
      "Defeat Tyrana Slil and collect the Fish Food Vial",
      "Acquire a Silk Evening Tunic and trade it to Marlin Shirtov for the Brass Key",
      "Feed prepared fish food to a royal fish in Lake Rathetear to transform Princess Lenya",
      "Give the princess the Brass Key and Tearon's Bracer",
      "Return the Highkeep Royal Suite key and Royal Amulet of Thex to Tearon Bleanix",
    ],
    wiki_title: "Princess Lenya (Quest)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:lake-rathetear", "located_in");
  addEdge(questId, shieldId, "rewards");
}

// ---------------------------------------------------------------------
// Protect the Shipyard
// ---------------------------------------------------------------------
{
  const zoneId = "zone:the-overthere";
  const giverId = "npc:the-overthere:captain-rottgrime";
  addGiver(giverId, "Captain Rottgrime", zoneId);

  const shieldId = "item:guard-of-the-marines";
  addNode({ id: shieldId, label: "Guard of the Marines", type: "item", slots: ["Secondary"], ac: 8, resists: { magic: 10 }, classes: ["warrior", "cleric", "paladin", "ranger", "shadow knight", "bard", "rogue", "shaman"], weight: 10.0, size: "Large", source: "Protect the Shipyard reward (Captain Rottgrime, The Overthere)" });

  const questId = "quest:protect-the-shipyard";
  addNode({
    id: questId,
    label: "Protect the Shipyard",
    type: "quest",
    description: "Collect four Sarnak War Braids from Sarnak berzerkers in The Overthere and Frontier Mountains and hand them to Captain Rottgrime for a Guard of the Marines shield and improved Venril Sathir faction. Any previously earned Guard of the Marines must be destroyed first, or the turn-in fails.",
    steps: ["Collect 4 Sarnak War Braids from Sarnak berzerkers", "Hand them to Captain Rottgrime in The Overthere"],
    wiki_title: "Protect the Shipyard",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:frontier-mountains", "located_in");
  addFactionReward(questId, "Venril Sathir");
  addEdge(questId, shieldId, "rewards");
}

// ---------------------------------------------------------------------
// Putrid Skeletons
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-qeynos";
  const giverId = "npc:north-qeynos:roesager-thusten";
  addGiver(giverId, "Roesager Thusten", zoneId);

  const shieldId = "item:shield-of-nife";
  addNode({ id: shieldId, label: "Shield of Nife", type: "item", slots: ["Secondary"], ac: 11, stats: { str: -1, sta: 1, wis: 1, cha: 1 }, hp: 10, resists: { disease: 3, magic: 10, poison: 3 }, classes: ["cleric", "paladin"], weight: 7.5, size: "Large", magic: true, source: "Putrid Skeletons rare reward (Priestess Jahnda, Temple of Life) -- restricted to Human or Half-Elf race, 2/24 odds" });

  const skullcapId = "item:skullcap-of-rodcet-nife";
  addNode({ id: skullcapId, label: "Skullcap of Rodcet Nife", type: "item", slots: ["Head"], ac: 1, hp: 4, resists: { disease: 4 }, classes: ["warrior", "cleric", "paladin", "ranger", "druid", "monk", "bard", "rogue", "shaman", "wizard", "magician", "enchanter"], weight: 0.2, size: "Small", lore: true, source: "Putrid Skeletons ultra-rare reward (Priestess Jahnda, Temple of Life) -- restricted to High Elf or Half-Elf race, 0/24 odds observed" });

  const questId = "quest:putrid-skeletons";
  addNode({
    id: questId,
    label: "Putrid Skeletons",
    type: "quest",
    description: "Roesager Thusten in North Qeynos sends a Note to Niclaus Ressinn in Qeynos Hills; killing a putrid skeleton for its Putrid Rib Bone and returning it to Niclaus earns a Pouch of Evidence, which Priestess Jahnda at the Temple of Life exchanges for one of four tiered rewards: a common Potion of Light Healing, a less common Potion of Disease Warding, a rare Shield of Nife, or an ultra-rare Skullcap of Rodcet Nife.",
    steps: [
      "Receive a Note to Niclaus from Roesager Thusten",
      "Deliver the note to Niclaus Ressinn in Qeynos Hills",
      "Kill a putrid skeleton and loot a Putrid Rib Bone",
      "Return the rib bone to Niclaus Ressinn for a Pouch of Evidence",
      "Deliver the Pouch of Evidence to Priestess Jahnda in the Temple of Life",
    ],
    wiki_title: "Putrid Skeletons",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:qeynos-hills", "located_in");
  addEdge(questId, "item:potion-of-light-healing", "rewards");
  addEdge(questId, "item:potion-of-disease-warding", "rewards");
  addEdge(questId, shieldId, "rewards");
  addEdge(questId, skullcapId, "rewards");
}

// ---------------------------------------------------------------------
// Quench Lasen's Thirst
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:guard-lasen";
  addGiver(giverId, "Guard Lasen", zoneId);

  const questId = "quest:quench-lasens-thirst";
  addNode({
    id: questId,
    label: "Quench Lasen's Thirst",
    type: "quest",
    description: "Bring a Water Flask to Guard Lasen in South Qeynos for a few copper and a faction shift: standing improves with Merchants of Qeynos, Kane Bayle, and Guards of Qeynos, but worsens with Circle of Unseen Hands and Corrupt Qeynos Guards.",
    steps: ["Bring a Water Flask to Guard Lasen"],
    wiki_title: "Quench Lasen's Thirst",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Merchants of Qeynos");
  addFactionReward(questId, "Kane Bayle");
  addFactionReward(questId, "Guards of Qeynos");
}

// ---------------------------------------------------------------------
// Rabid Grizzlies
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-qeynos";
  const giverId = "npc:north-qeynos:priestess-caulria";
  addGiver(giverId, "Priestess Caulria", zoneId);

  const questId = "quest:rabid-grizzlies";
  addNode({
    id: questId,
    label: "Rabid Grizzlies",
    type: "quest",
    description: "Priestess Caulria at the Temple of Life in North Qeynos asks for help hunting rabid grizzlies in Qeynos Hills and Western Karana; return a Putrid Bear Hide for Spell: Endure Disease, a disease cure, coin, and improved standing with Antonius Bayle, Guards of Qeynos, Knights of Thunder, and Priests of Life.",
    steps: ["Speak with Priestess Caulria in the Temple of Life", "Hunt rabid grizzlies in Qeynos Hills or Western Karana for a Putrid Bear Hide", "Return the hide to Priestess Caulria"],
    wiki_title: "Rabid Grizzlies",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:qeynos-hills", "located_in");
  addEdge(questId, "zone:western-karana", "located_in");
  addFactionReward(questId, "Antonius Bayle");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Knights of Thunder");
  addFactionReward(questId, "Priests of Life");
  addEdge(questId, "spell:endure-disease", "rewards");
}

// ---------------------------------------------------------------------
// Rabid Wolves
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-qeynos";
  const giverId = "npc:north-qeynos:priestess-caulria";
  addGiver(giverId, "Priestess Caulria", zoneId);

  const questId = "quest:rabid-wolves";
  addNode({
    id: questId,
    label: "Rabid Wolves",
    type: "quest",
    description: "Priestess Caulria at the North Qeynos Temple of Life asks for help hunting rabid wolves in Qeynos Hills; return a Diseased Wolf Pelt for a free Cure Disease casting, coin, and improved standing with Priests of Life, Knights of Thunder, Guards of Qeynos, and Antonius Bayle, at the cost of Bloodsaber standing.",
    steps: ["Speak with Priestess Caulria in the Temple of Life", "Hunt rabid wolves in Qeynos Hills for a Diseased Wolf Pelt", "Return the pelt to Priestess Caulria"],
    wiki_title: "Rabid Wolves",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:qeynos-hills", "located_in");
  addFactionReward(questId, "Priests of Life");
  addFactionReward(questId, "Knights of Thunder");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Antonius Bayle");
  addFactionReward(questId, "Bloodsabers");
}

// ---------------------------------------------------------------------
// Rain Caller Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:greater-faydark";
  const giverId = "npc:greater-faydark:maesyn-trueshot";
  addGiver(giverId, "Maesyn Trueshot", zoneId);

  const bowId = "item:rain-caller";
  addNode({ id: bowId, label: "Rain Caller", type: "item", slots: ["Range"], skill: "Bow", damage: 20, delay: 45, stats: { str: 6, dex: 6 }, effect: "Firestrike (Any Slot/Can Equip, Instant) at Level 40", weight: 3.0, size: "Large", classes: ["ranger"], magic: true, lore: true, source: "Rain Caller Quest reward (Maesyn Trueshot, Greater Faydark) -- restricted to Human, Elf, or Half-Elf race; 5 charges, 610pp to recharge" });

  const helmId = "item:mane-attraction";
  addNode({ id: helmId, label: "Mane Attraction", type: "item", slots: ["Head"], ac: 4, stats: { cha: 10 }, effect: "Focus: Mana Preservation II", weight: 3.5, size: "Small", lore: true, noTrade: true, source: "Rain Caller Quest interim reward (Sanfyrd Featherhead, Greater Faydark)" });

  const questId = "quest:rain-caller-quest";
  addNode({
    id: questId,
    label: "Rain Caller Quest",
    type: "quest",
    description: "A long crafting chain starting with Maesyn Trueshot in Greater Faydark: fill a Crate for Tonics with 10 Fuzzlecutter Formula 5000 for Sanfyrd Featherhead, trade a wooden heart, hair, and other components through Ping Fuzzlecutter and Princess Joleena, then finally hand over the gathered ingredients plus a Trueshot Longbow and 3000 gold to Kinool Goldsinger for the Rain Caller bow. An intermediate turn-in to Sanfyrd Featherhead also grants the Mane Attraction helmet along the way.",
    classes: ["ranger"],
    steps: [
      "Fill a Crate for Tonics with 10x Fuzzlecutter Formula 5000 and combine it into a Crate of Tonic",
      "Acquire a wooden heart from treants or Jyle Windshot",
      "Turn in the tonic crate to Sanfyrd Featherhead for a Tattered Toupee",
      "Collect 2x Clump of Gorilla Hair and 1x Lock of Hair",
      "Trade the toupee and hair to Ping Fuzzlecutter for Mane Attraction",
      "Return Mane Attraction to Sanfyrd Featherhead for a Glimmering Fairie Wing",
      "Give the wing to Princess Joleena for a Pouch of Gold Dust",
      "Deliver the gold dust, wooden heart, a Trueshot Longbow, and 3000 gold to Kinool Goldsinger",
    ],
    wiki_title: "Rain Caller Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, bowId, "rewards");
  addEdge(questId, helmId, "rewards");
}

// ---------------------------------------------------------------------
// Ralgyn's Promise
// ---------------------------------------------------------------------
{
  const zoneId = "zone:skyshrine";
  const giverId = "npc:skyshrine:ralgyn";
  addGiver(giverId, "Ralgyn", zoneId);

  const circletId = "item:circlet-of-the-falinkan";
  addNode({ id: circletId, label: "Circlet of the Falinkan", type: "item", slots: ["Head"], ac: 12, stats: { str: 7, dex: 5, wis: 5, int: 5 }, hp: 50, mana: 75, resists: { fire: 5, cold: 5, magic: 5 }, weight: 0.1, size: "Small", magic: true, noTrade: true, source: "Ralgyn's Promise reward (Ralgyn, Skyshrine)" });

  const questId = "quest:ralgyns-promise";
  addNode({
    id: questId,
    label: "Ralgyn's Promise",
    type: "quest",
    description: "Ralgyn in Skyshrine sends the player after three items -- the Head of Staff Sergeant Drioc (Kael Drakkal bank), Teachings of Gkrean (Kael Drakkal arena), and a chipped fang from Vilefang (Dragon Necropolis) -- which Rolandal in The Wakening Land converts into Glanitar's Imbued Talisman; returning the talisman to Ralgyn earns the Circlet of the Falinkan.",
    steps: [
      "Obtain the Head of Staff Sergeant Drioc from Staff Sergeant Drioc in the Kael Drakkal bank",
      "Obtain Teachings of Gkrean from Gkrean Prophet of Tallon in the Kael Drakkal arena",
      "Obtain a chipped fang from Vilefang in Dragon Necropolis",
      "Give all three items to Rolandal in The Wakening Land for Glanitar's Imbued Talisman",
      "Return the talisman to Ralgyn in Skyshrine",
    ],
    wiki_title: "Ralgyn's Promise",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:kael-drakkal", "located_in");
  addEdge(questId, "zone:dragon-necropolis", "located_in");
  addEdge(questId, "zone:the-wakening-land", "located_in");
  addEdge(questId, circletId, "rewards");
}

// ---------------------------------------------------------------------
// Ranjor's Test
// ---------------------------------------------------------------------
{
  const zoneId = "zone:grobb";
  const giverId = "npc:grobb:ranjor";
  addGiver(giverId, "Ranjor", zoneId);

  const axe = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "item:rusty-two-handed-battle-axe");
  if (axe) {
    axe.data.damage = 9;
    axe.data.delay = 49;
    axe.data.source = "Lizard Meat Quest reward (Kogna, Oggok) / Ranjor's Test reward (Ranjor, Grobb)";
  }

  const questId = "quest:ranjors-test";
  addNode({
    id: questId,
    label: "Ranjor's Test",
    type: "quest",
    description: "Bring Froglok Meat and two froglok tadpole fleshes to Ranjor in Grobb for a Rusty Two Handed Battle Axe and improved Da Bashers faction.",
    minLevel: 2,
    steps: ["Obtain Froglok Meat and 2 froglok tadpole fleshes", "Deliver them to Ranjor in Grobb"],
    wiki_title: "Ranjor's Test",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Da Bashers");
  addEdge(questId, "item:rusty-two-handed-battle-axe", "rewards");
}

// ---------------------------------------------------------------------
// Rare Coins
// ---------------------------------------------------------------------
{
  const zoneId = "zone:firiona-vie";
  const giverId = "npc:firiona-vie:assistant-buford";
  addGiver(giverId, "Assistant Buford", zoneId);

  const tambourineId = "item:nostrolo-tambourine";
  addNode({ id: tambourineId, label: "Nostrolo Tambourine", type: "item", slots: ["Secondary"], stats: { int: 5 }, effect: "Percussion Resonance 12", classes: ["bard"], weight: 0.5, size: "Small", magic: true, lore: true, noTrade: true, source: "Rare Coins reward (Assistant Buford, Firiona Vie)" });

  const questId = "quest:rare-coins";
  addNode({
    id: questId,
    label: "Rare Coins",
    type: "quest",
    description: "Buy a Star of Odus in Erudin and trade it to Assistant Buford in Firiona Vie for a Tin Box, then fill it with six Ancient Coins looted across Kunark and Velious: Torsis Ton (foraged in Emerald Jungle), Royal Crown of Dalnir (A Kly Imprecator, Crypt of Dalnir/Kaesora), Terraz Ton (Failed crypt raider, Kaesora), Veksar Gran (Bloodgill Goblins, Lake of Ill Omen), Danak Gran (scorpikis scrounger, The Overthere), and Ik Gran (Captain of the Guard, City of Mist). Combining and returning the filled box earns a Nostrolo Tambourine.",
    classes: ["bard"],
    steps: [
      "Buy a Star of Odus in Erudin and trade it to Assistant Buford for a Tin Box",
      "Collect Torsis Ton, Royal Crown of Dalnir, Terraz Ton, Veksar Gran, Danak Gran, and Ik Gran",
      "Combine all six coins into the Tin Box",
      "Return the filled box to Assistant Buford",
    ],
    wiki_title: "Rare Coins",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:emerald-jungle", "located_in");
  addEdge(questId, "zone:lake-of-ill-omen", "located_in");
  addEdge(questId, "zone:the-overthere", "located_in");
  addEdge(questId, "zone:city-of-mist", "located_in");
  addEdge(questId, tambourineId, "rewards");
}

// ---------------------------------------------------------------------
// Rat Ear Pie Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:qeynos-hills";
  const giverId = "npc:qeynos-hills:rephas";
  addGiver(giverId, "Rephas", zoneId);

  const questId = "quest:rat-ear-pie-quest";
  addNode({
    id: questId,
    label: "Rat Ear Pie Quest",
    type: "quest",
    description: "Rephas in Qeynos Hills trades Rat Ears for Grilled Rat Ears, then Grilled Rat Ears for Fish Scales, then 3 Giant Rat Ears for the Rat Ear Pie recipe (Giant Rat Ear + Baking Spirits + Cup of Flour in a mixing bowl). Faction improves with Arcane Scientists and Knights of Truth, worsens with Opal Dark Briar and Freeport Militia.",
    steps: ["Bring Rat Ears to Rephas for Grilled Rat Ears", "Return Grilled Rat Ears for Fish Scales", "Deliver 3 Giant Rat Ears for the Rat Ear Pie recipe"],
    wiki_title: "Rat Ear Pie Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Arcane Scientists");
  addFactionReward(questId, "Knights of Truth");
}

// ---------------------------------------------------------------------
// Rat Fur Cap Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:menkes-tabolet";
  addGiver(giverId, "Menkes Tabolet", zoneId);

  const capId = "item:rat-fur-cap";
  addNode({ id: capId, label: "Rat Fur Cap", type: "item", slots: ["Head"], ac: 1, weight: 0.3, size: "Small", source: "Rat Fur Cap Quest reward (Menkes Tabolet, South Qeynos)" });

  const questId = "quest:rat-fur-cap-quest";
  addNode({
    id: questId,
    label: "Rat Fur Cap Quest",
    type: "quest",
    description: "Menkes Tabolet in South Qeynos trades 2 pieces of rat fur and 3 gold for a Rat Fur Cap.",
    steps: ["Gather 2 pieces of rat fur", "Give them and 3 gold to Menkes Tabolet"],
    wiki_title: "Rat Fur Cap Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Qeynos Citizens");
  addEdge(questId, capId, "rewards");
}

// ---------------------------------------------------------------------
// Rat Patrol
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-kaladim";
  const giverId = "npc:north-kaladim:jeet";
  addGiver(giverId, "Jeet", zoneId);

  const beltId = "item:small-tattered-belt";
  addNode({ id: beltId, label: "Small Tattered Belt", type: "item", slots: ["Waist"], ac: 2, classes: ["warrior", "cleric", "paladin", "ranger", "shadow knight", "druid", "bard", "rogue", "shaman", "beastlord"], weight: 0.8, size: "Small", source: "Rat Patrol reward (Jeet, North Kaladim); also craftable via Tailoring (trivial 26)" });

  const glovesId = "item:small-tattered-gloves";
  addNode({ id: glovesId, label: "Small Tattered Gloves", type: "item", slots: ["Hands"], ac: 3, classes: ["warrior", "cleric", "paladin", "ranger", "shadow knight", "druid", "bard", "rogue", "shaman", "beastlord"], weight: 1.1, size: "Small", source: "Rat Patrol reward (Jeet, North Kaladim); also craftable via Tailoring (trivial 26), or a Bone Chips Kaladim reward" });

  const maskId = "item:small-tattered-mask";
  addNode({ id: maskId, label: "Small Tattered Mask", type: "item", slots: ["Face"], ac: 2, classes: ["warrior", "cleric", "paladin", "ranger", "shadow knight", "druid", "bard", "rogue", "shaman", "beastlord"], weight: 0.3, size: "Small", source: "Rat Patrol reward (Jeet, North Kaladim); also craftable via Tailoring (trivial 26)" });

  const skullcapId = "item:small-tattered-skullcap";
  addNode({ id: skullcapId, label: "Small Tattered Skullcap", type: "item", slots: ["Head"], ac: 3, classes: ["warrior", "cleric", "paladin", "ranger", "shadow knight", "druid", "bard", "rogue", "shaman", "beastlord"], weight: 0.5, size: "Small", source: "Rat Patrol reward (Jeet, North Kaladim); also craftable via Tailoring (trivial 26)" });

  const wristId = "item:small-tattered-wristbands";
  addNode({ id: wristId, label: "Small Tattered Wristbands", type: "item", slots: ["Wrist"], ac: 2, classes: ["warrior", "cleric", "paladin", "ranger", "shadow knight", "druid", "bard", "rogue", "shaman", "beastlord"], weight: 0.8, size: "Small", source: "Rat Patrol reward (Jeet, North Kaladim); also craftable via Tailoring (trivial 26)" });

  const questId = "quest:rat-patrol";
  addNode({
    id: questId,
    label: "Rat Patrol",
    type: "quest",
    description: "Jeet in North Kaladim trades four Rat Pelts, looted from Giant Rats in the mines, for a piece of the Small Tattered armor set. Improves Miners Guild 628 faction; worsens standing with other unnamed factions per the wiki.",
    steps: ["Collect 4 Rat Pelts from Giant Rats in the North Kaladim mines", "Return them to Jeet"],
    wiki_title: "Rat Patrol",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Miners Guild 628");
  addEdge(questId, beltId, "rewards");
  addEdge(questId, glovesId, "rewards");
  addEdge(questId, maskId, "rewards");
  addEdge(questId, skullcapId, "rewards");
  addEdge(questId, wristId, "rewards");
}

// ---------------------------------------------------------------------
// Rat Pelt Cape Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:menkes-tabolet";
  addGiver(giverId, "Menkes Tabolet", zoneId);

  const cape = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "item:rat-pelt-cape");
  if (cape) {
    cape.data.source = "Rat Pelts reward (Beno Targnarle, South Kaladim) / Rat Pelt Cape Quest reward (Menkes Tabolet, South Qeynos)";
  }

  const questId = "quest:rat-pelt-cape-quest";
  addNode({
    id: questId,
    label: "Rat Pelt Cape Quest",
    type: "quest",
    description: "Menkes Tabolet in South Qeynos trades three Giant Rat Pelts and 4 gold for a Rat Pelt Cape.",
    steps: ["Gather 3 Giant Rat Pelts", "Give them and 4 gold to Menkes Tabolet"],
    wiki_title: "Rat Pelt Cape Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Qeynos Citizens");
  addEdge(questId, "item:rat-pelt-cape", "rewards");
}

// ---------------------------------------------------------------------
// Rat Shaped Rings
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-qeynos";
  const giverId = "npc:north-qeynos:suuspa-clanim";
  addGiver(giverId, "Suuspa Clanim", zoneId);

  const questId = "quest:rat-shaped-rings";
  addNode({
    id: questId,
    label: "Rat Shaped Rings",
    type: "quest",
    description: "Suuspa Clanim at the North Qeynos Temple of Life buys Rat Shaped Rings looted from Bloodsaber members (such as Brother Trintle) -- rings from Hurrieta's Tunic Quest work too -- for coin and improved standing with Antonius Bayle, Guards of Qeynos, Priests of Life, and Knights of Thunder, at the cost of Bloodsaber standing.",
    steps: ["Obtain a Rat Shaped Ring from a Bloodsaber member", "Return it to Suuspa Clanim at the Temple of Life"],
    wiki_title: "Rat Shaped Rings",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Antonius Bayle");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Priests of Life");
  addFactionReward(questId, "Knights of Thunder");
  addFactionReward(questId, "Bloodsabers");
}

// ---------------------------------------------------------------------
// Rat Teeth
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kerra-island";
  const giverId = "npc:kerra-island:thalith-mamluk";
  addGiver(giverId, "Thalith Mamluk", zoneId);

  const necklaceId = "item:fishbone-necklace";
  addNode({ id: necklaceId, label: "Fishbone Necklace", type: "item", slots: ["Neck"], ac: 3, stats: { agi: 2 }, weight: 0.5, size: "Tiny", source: "Rat Teeth reward (Thalith Mamluk, Kerra Island) -- excludes Erudite race" });

  const questId = "quest:rat-teeth";
  addNode({
    id: questId,
    label: "Rat Teeth",
    type: "quest",
    description: "Thalith Mamluk on Kerra Island, plagued by rats disrupting his fishing, trades a Sharp Tooth (dropped by Fang Tooth or the level 15 wharf rat) for a Fishbone Necklace.",
    steps: ["Obtain a Sharp Tooth from Fang Tooth or the wharf rat", "Return it to Thalith Mamluk"],
    wiki_title: "Rat Teeth",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Kerra Isle");
  addEdge(questId, necklaceId, "rewards");
}

// ---------------------------------------------------------------------
// Rat's Foot Necklace Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:menkes-tabolet";
  addGiver(giverId, "Menkes Tabolet", zoneId);

  const necklaceId = "item:rats-foot-necklace";
  addNode({ id: necklaceId, label: "Rat's Foot Necklace", type: "item", slots: ["Neck"], stats: { cha: -1 }, hp: 2, weight: 0.1, size: "Tiny", magic: true, source: "Rat's Foot Necklace Quest reward (Menkes Tabolet, South Qeynos)" });

  const questId = "quest:rats-foot-necklace-quest";
  addNode({
    id: questId,
    label: "Rat's Foot Necklace Quest",
    type: "quest",
    description: "Menkes Tabolet in South Qeynos trades a Rat Foot, Rat Whiskers, and a Honey Mead for a Rat's Foot Necklace.",
    steps: ["Gather a Rat Foot, Rat Whiskers, and a Honey Mead", "Give them to Menkes Tabolet"],
    wiki_title: "Rat's Foot Necklace Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, necklaceId, "rewards");
}

// ---------------------------------------------------------------------
// Rathmana's Traveling Offer
// ---------------------------------------------------------------------
{
  const zoneId = "zone:southern-desert-of-ro";
  const giverId = "npc:southern-desert-of-ro:rathmana-allin";
  addGiver(giverId, "Rathmana Allin", zoneId);

  const questId = "quest:rathmanas-traveling-offer";
  addNode({
    id: questId,
    label: "Rathmana's Traveling Offer",
    type: "quest",
    description: "Rathmana Allin in the Southern Desert of Ro offers a magical gamble: pay 30 gold and receive one random spell scroll from a rotating pool (options seen include Quickness, Lightning Bolt, Lifedraw, Charm, and Column of Fire) or, failing that, a Rotted Illegible Scroll -- no exchanges. Improves Temple Of Sol Ro faction. The specific spell is a random draw, not a guaranteed reward, so it isn't modeled as a graph reward edge.",
    steps: ["Hail Rathmana Allin and indicate you are traveling", "Pay 30 gold for a random spell scroll"],
    wiki_title: "Rathmana's Traveling Offer",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Temple Of Sol Ro");
}

// ---------------------------------------------------------------------
// Ratskin Gloves Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kithicor-forest";
  const giverId = "npc:kithicor-forest:ged-twigborn";
  addGiver(giverId, "Ged Twigborn", zoneId);

  const glovesId = "item:ratskin-gloves";
  addNode({ id: glovesId, label: "Ratskin Gloves", type: "item", slots: ["Hands"], ac: 3, stats: { cha: -5 }, weight: 2.0, size: "Small", source: "Ratskin Gloves Quest reward (Ged Twigborn, Kithicor Forest) -- excludes Necromancer, Wizard, Magician, and Enchanter classes" });

  const questId = "quest:ratskin-gloves-quest";
  addNode({
    id: questId,
    label: "Ratskin Gloves Quest",
    type: "quest",
    description: "Ged Twigborn in Kithicor Forest trades a giant rat pelt and 6 gold for a pair of Ratskin Gloves. Improves Kithicor Residents, Protectors of Pine, and Jaggedpine Treefolk standing; worsens Unkempt Druids standing.",
    steps: ["Obtain a giant rat pelt", "Give it and 6 gold to Ged Twigborn"],
    wiki_title: "Ratskin Gloves Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Kithicor Residents");
  addFactionReward(questId, "Protectors of Pine");
  addFactionReward(questId, "Jaggedpine Treefolk");
  addFactionReward(questId, "Unkempt Druids");
  addEdge(questId, glovesId, "rewards");
}

// ---------------------------------------------------------------------
// Razortooth
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kerra-island";
  const giverId = "npc:kerra-island:feren";
  addGiver(giverId, "Feren", zoneId);

  const poleId = "item:kerran-fishingpole";
  addNode({ id: poleId, label: "Kerran Fishingpole", type: "item", slots: ["Primary"], skill: "1H Blunt", damage: 3, delay: 17, stats: { str: 2 }, weight: 4.0, size: "Tiny", magic: true, lore: true, noTrade: true, source: "Razortooth reward (Feren, Kerra Island) -- excludes Erudite and Dark Elf race; a weapon despite the name, not a working fishing pole" });

  const questId = "quest:razortooth";
  addNode({
    id: questId,
    label: "Razortooth",
    type: "quest",
    description: "Feren, on a boat in the Kerra Island wharf, asks the player to hunt down the rare-spawn Razortooth (Spikefish are placeholders) and bring back its remains for a Kerran Fishingpole.",
    steps: ["Hail Feren and ask who Razortooth is", "Hunt down and kill Razortooth", "Return its remains to Feren"],
    wiki_title: "Razortooth",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, poleId, "rewards");
}

// ---------------------------------------------------------------------
// Recharge Prayer Beads
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-qeynos";
  const giverId = "npc:north-qeynos:tyokan-mekase";
  addGiver(giverId, "Tyokan Mekase", zoneId);

  const questId = "quest:recharge-prayer-beads";
  addNode({
    id: questId,
    label: "Recharge Prayer Beads",
    type: "quest",
    description: "Tyokan Mekase in North Qeynos recharges a depleted set of Prayer Beads for 100 gold. Repeatable.",
    steps: ["Hand over a used set of Prayer Beads and 100 gold", "Receive a fully charged set back"],
    wiki_title: "Recharge Prayer Beads",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "item:prayer-beads", "rewards");
}

save();
console.log("Migration 073 complete: added 25 quests + 5 skipped (broken/non-quest) from GitHub issue #26's checklist, batch 1 of 2");
