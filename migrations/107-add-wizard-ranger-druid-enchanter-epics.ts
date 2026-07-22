/**
 * Migration 107: third batch of GitHub issue #26's "Questlines" section --
 * real ordered `quest --requires--> quest` chains (decisions/quest-prerequisite-requires-edge.md).
 * Researched against eqlwiki.com per decisions/eqlwiki-quest-research-method.md.
 *
 * Covers: Wizard Epic Quest, Ranger Epic Quest, Druid Epic Quest, Enchanter Epic Quest.
 *
 * Ranger and Druid epics share the same first four stages on eqlwiki.com (Telin
 * Darkforest -> Faelin Bloodbriar -> Giz X'Tin -> Althele) but are modeled as two
 * separate chains under their own class-scoped ids, matching how every other
 * per-class questline in this graph stays independent even when NPCs/items overlap.
 * "Plane of Hate" has no standalone zone node yet (same call as migration 106).
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, addGiver, save } = loadGraph(import.meta.dir);

// ---------------------------------------------------------------------
// Wizard Epic Quest
// ---------------------------------------------------------------------
{
  const soluTempleId = "zone:temple-of-solusek-ro";
  const erudinId = "zone:erudin";
  const halasId = "zone:halas";
  const felwitheId = "zone:felwithe";
  const kedgeId = "zone:kedge-keep";
  const karnorsId = "zone:karnors-castle";
  const butcherblockId = "zone:butcherblock-mountains";
  const fearId = "zone:plane-of-fear";

  const solomenId = "npc:temple-of-solusek-ro:solomen";
  addGiver(solomenId, "Solomen", soluTempleId);
  const caminId = "npc:erudin:camin";
  addGiver(caminId, "Camin", erudinId);
  const dargonId = "npc:halas:dargon";
  addGiver(dargonId, "Dargon", halasId);
  const challiceId = "npc:felwithe:challice";
  addGiver(challiceId, "Challice", felwitheId);
  const kandinId = "npc:butcherblock-mountains:kandin-firepot";
  addGiver(kandinId, "Kandin Firepot", butcherblockId);

  const noteId = "quest:wizard-epic-note-to-camin";
  addNode({
    id: noteId, label: "Wizard Epic Quest: Note to Camin", type: "quest", classes: ["wizard"], minLevel: 46,
    description: "Obtain a note from Solomen in the Temple of Solusek Ro, deliver it to Camin in Erudin, and give Camin 1000 platinum.",
    steps: ["Get a note from Solomen, Temple of Solusek Ro", "Deliver the note and 1000pp to Camin, Erudin"], wiki_title: "Wizard Epic Quest",
  });
  addEdge(solomenId, noteId, "starts");
  addEdge(noteId, soluTempleId, "starts_in");
  addEdge(noteId, erudinId, "located_in");

  const breathId = "quest:wizard-epic-ros-breath";
  addNode({
    id: breathId, label: "Wizard Epic Quest: Ro's Breath", type: "quest", classes: ["wizard"], minLevel: 46,
    description: "Buy a Ro's Breath potion from Dargon in Halas, take it to Camin in Erudin, then return the used potion to Dargon; Dargon transforms into Arantir Karondor and gives Arantir's Ring.",
    steps: ["Buy Ro's Breath potion from Dargon, Halas", "Take potion to Camin, Erudin", "Return used potion to Dargon, who transforms into Arantir Karondor and gives Arantir's Ring"], wiki_title: "Wizard Epic Quest",
  });
  addEdge(dargonId, breathId, "starts");
  addEdge(breathId, halasId, "starts_in");
  addEdge(breathId, erudinId, "located_in");
  addEdge(breathId, noteId, "requires");

  const ringId = "quest:wizard-epic-arantirs-ring";
  addNode({
    id: ringId, label: "Wizard Epic Quest: Arantir's Ring", type: "quest", classes: ["wizard"], minLevel: 46,
    description: "Deliver Arantir's Ring to Challice in the Felwithe Paladin guild basement, then return the ring to Arantir and hear his story of four wizards.",
    steps: ["Deliver Arantir's Ring to Challice, Felwithe Paladin guild basement", "Return ring to Arantir Karondor for the story of four wizards"], wiki_title: "Wizard Epic Quest",
  });
  addEdge(challiceId, ringId, "starts");
  addEdge(ringId, felwitheId, "starts_in");
  addEdge(ringId, breathId, "requires");

  const bluestaffId = "quest:wizard-epic-blue-crystal-staff";
  addNode({
    id: bluestaffId, label: "Wizard Epic Quest: Blue Crystal Staff", type: "quest", classes: ["wizard"], minLevel: 46,
    description: "Kill Phinigel Autropos in Kedge Keep and loot the Blue Crystal Staff.",
    steps: ["Kill Phinigel Autropos, Kedge Keep", "Loot Blue Crystal Staff"], wiki_title: "Wizard Epic Quest",
  });
  addEdge(bluestaffId, kedgeId, "starts_in");
  addEdge(bluestaffId, ringId, "requires");

  const gnarledstaffId = "quest:wizard-epic-gnarled-staff";
  addNode({
    id: gnarledstaffId, label: "Wizard Epic Quest: Gnarled Staff", type: "quest", classes: ["wizard"], minLevel: 46,
    description: "Kill Venril Sathir in Karnor's Castle and loot the Gnarled Staff.",
    steps: ["Kill Venril Sathir, Karnor's Castle", "Loot Gnarled Staff"], wiki_title: "Wizard Epic Quest",
  });
  addEdge(gnarledstaffId, karnorsId, "starts_in");
  addEdge(gnarledstaffId, ringId, "requires");

  const gabstikId = "quest:wizard-epic-staff-of-gabstik";
  addNode({
    id: gabstikId, label: "Wizard Epic Quest: Staff of Gabstik", type: "quest", classes: ["wizard"], minLevel: 46,
    description: "Get a Golem Sprocket from Kandin Firepot in Butcherblock Mountains, give it to the broken golem in Plane of Fear, kill the resulting enraged golem, retrieve Green Oil, and return it to Kandin for the Staff of Gabstik and a note.",
    steps: ["Get Golem Sprocket from Kandin Firepot, Butcherblock Mountains", "Give sprocket to the broken golem, Plane of Fear", "Kill the enraged golem, retrieve Green Oil", "Return Green Oil to Kandin Firepot for Staff of Gabstik and a note"], wiki_title: "Wizard Epic Quest",
  });
  addEdge(kandinId, gabstikId, "starts");
  addEdge(gabstikId, butcherblockId, "starts_in");
  addEdge(gabstikId, fearId, "located_in");
  addEdge(gabstikId, ringId, "requires");

  const bagId = "quest:wizard-epic-sealed-bag";
  addNode({
    id: bagId, label: "Wizard Epic Quest: Sealed Bag", type: "quest", classes: ["wizard"], minLevel: 46,
    description: "Give Kandin's note to Dargon in Halas, then hand Arantir all three staves (Blue Crystal Staff, Gnarled Staff, Staff of Gabstik) for a sealed bag.",
    steps: ["Give note to Dargon, Halas", "Hand Arantir Karondor all three staves for a sealed bag"], wiki_title: "Wizard Epic Quest",
  });
  addEdge(dargonId, bagId, "starts");
  addEdge(bagId, halasId, "starts_in");
  addEdge(bagId, bluestaffId, "requires");
  addEdge(bagId, gnarledstaffId, "requires");
  addEdge(bagId, gabstikId, "requires");

  const epicId = "quest:wizard-epic-quest";
  addNode({
    id: epicId, label: "Wizard Epic Quest", type: "quest", classes: ["wizard"], minLevel: 46,
    description: "Deliver the sealed bag to Solomen in the Temple of Solusek Ro for the final reward, Staff of the Four.",
    steps: ["Deliver sealed bag to Solomen, Temple of Solusek Ro"], wiki_title: "Wizard Epic Quest",
  });
  addEdge(solomenId, epicId, "starts");
  addEdge(epicId, soluTempleId, "starts_in");
  addEdge(epicId, bagId, "requires");

  const staffId = "item:staff-of-the-four";
  addNode({
    id: staffId, label: "Staff of the Four", type: "item", slots: ["Primary"], classes: ["wizard"],
    skill: "1H Blunt", damage: 20, stats: { str: 10, dex: 5, sta: 10, int: 25, mana: 100 },
    saves: { fire: 10, cold: 10, disease: 10, magic: 10, poison: 10 }, minLevel: 46,
    effect: "Barrier of Force at Level 50", magic: true, lore: true, noDrop: true,
    source: "Wizard Epic Quest reward (Solomen, Temple of Solusek Ro)",
  });
  addEdge(epicId, staffId, "rewards");
}

// ---------------------------------------------------------------------
// Ranger Epic Quest
// ---------------------------------------------------------------------
{
  const burningWoodId = "zone:burning-wood";
  const faydarkId = "zone:greater-faydark";
  const kithicorId = "zone:kithicor-forest";
  const eKaranaId = "zone:eastern-karana";
  const mistyId = "zone:misty-thicket";
  const everfrostId = "zone:everfrost-peaks";
  const innothuleId = "zone:innothule-swamp";
  const timorousId = "zone:timorous-deep";
  const skyId = "zone:plane-of-sky";
  const hateId = "zone:the-hole";

  const telinId = "npc:burning-wood:telin-darkforest";
  addGiver(telinId, "Telin Darkforest", burningWoodId);
  const faelinId = "npc:greater-faydark:faelin-bloodbriar";
  addGiver(faelinId, "Faelin Bloodbriar", faydarkId);
  const gizId = "npc:kithicor-forest:giz-xtin";
  addGiver(gizId, "Giz X'Tin", kithicorId);
  const altheleId = "npc:eastern-karana:althele";
  addGiver(altheleId, "Althele", eKaranaId);
  const ellaId = "npc:misty-thicket:ella-foodcrafter";
  addGiver(ellaId, "Ella Foodcrafter", mistyId);
  const alrikId = "npc:timorous-deep:alrik-farsight";
  addGiver(alrikId, "Alrik Farsight", timorousId);
  const foloalId = "npc:greater-faydark:foloal-stormforest";
  addGiver(foloalId, "Foloal Stormforest", faydarkId);
  const maireeId = "npc:plane-of-sky:mairee-silentone";
  addGiver(maireeId, "Mairee Silentone", skyId);
  const kinloId = "npc:greater-faydark:kinlo";
  addGiver(kinloId, "Kinlo", faydarkId);
  const xanuususId = "npc:greater-faydark:xanuusus";
  addGiver(xanuususId, "Xanuusus", faydarkId);

  const noteId = "quest:ranger-epic-worn-note";
  addNode({
    id: noteId, label: "Ranger Epic Quest: Worn Note", type: "quest", classes: ["ranger"], minLevel: 46,
    description: "Obtain a Worn Note from Telin Darkforest in Burning Wood and deliver it to Faelin Bloodbriar in Greater Faydark for Faelin's Ring.",
    steps: ["Get Worn Note from Telin Darkforest, Burning Wood", "Deliver note to Faelin Bloodbriar, Greater Faydark, for Faelin's Ring"], wiki_title: "Ranger Epic Quest",
  });
  addEdge(telinId, noteId, "starts");
  addEdge(noteId, burningWoodId, "starts_in");
  addEdge(noteId, faydarkId, "located_in");

  const coinId = "quest:ranger-epic-dark-metal-coin";
  addNode({
    id: coinId, label: "Ranger Epic Quest: Dark Metal Coin", type: "quest", classes: ["ranger"], minLevel: 46,
    description: "Give Faelin's Ring to Giz X'Tin in Kithicor Forest for a Dark Metal Coin, then return the coin to Telin Darkforest for a Worn Dark Metal Coin.",
    steps: ["Give Faelin's Ring to Giz X'Tin, Kithicor Forest, for Dark Metal Coin", "Return coin to Telin Darkforest for Worn Dark Metal Coin"], wiki_title: "Ranger Epic Quest",
  });
  addEdge(gizId, coinId, "starts");
  addEdge(coinId, kithicorId, "starts_in");
  addEdge(coinId, burningWoodId, "located_in");
  addEdge(coinId, noteId, "requires");

  const amuletId = "quest:ranger-epic-fleshbound-tome";
  addNode({
    id: amuletId, label: "Ranger Epic Quest: Fleshbound Tome", type: "quest", classes: ["ranger"], minLevel: 46,
    description: "Give the Worn Dark Metal Coin to Althele in East Karana; the resulting amulet passes through Sionae, Nuien, and Teloa. Kill the Dark Elf Corruptor for a Fleshbound Tome and return it to Althele.",
    steps: ["Give Worn Dark Metal Coin to Althele, East Karana", "Pass amulet through Sionae, Nuien, Teloa", "Kill Dark Elf Corruptor for Fleshbound Tome", "Return Fleshbound Tome to Althele"], wiki_title: "Ranger Epic Quest",
  });
  addEdge(altheleId, amuletId, "starts");
  addEdge(amuletId, eKaranaId, "starts_in");
  addEdge(amuletId, coinId, "requires");

  const bowlId = "quest:ranger-epic-runecrested-bowl";
  addNode({
    id: bowlId, label: "Ranger Epic Quest: Runecrested Bowl", type: "quest", classes: ["ranger"], minLevel: 46,
    description: "Deliver an Earth Stained Note to Ella Foodcrafter in Misty Thicket for a Shiny Tin Bowl. Forage Chilled Tundra Root (Everfrost), Ripened Heartfruit (Greater Faydark), Speckled Molded Mushroom (Innothule Swamp), and Sweetened Mudroot (Misty Thicket), and combine them in the bowl. Gather an Ancient Pattern from Alrik Farsight in Timorous Deep, plus Platinum Speckled Powder and Enchanted Clay, and combine all three at a pottery wheel for a Runecrested Bowl.",
    steps: ["Deliver Earth Stained Note to Ella Foodcrafter, Misty Thicket, for Shiny Tin Bowl", "Forage Chilled Tundra Root (Everfrost), Ripened Heartfruit (Greater Faydark), Speckled Molded Mushroom (Innothule Swamp), Sweetened Mudroot (Misty Thicket) and combine in bowl", "Get Ancient Pattern from Alrik Farsight, Timorous Deep", "Gather Platinum Speckled Powder and Enchanted Clay, combine at pottery wheel for Runecrested Bowl"], wiki_title: "Ranger Epic Quest",
  });
  addEdge(ellaId, bowlId, "starts");
  addEdge(bowlId, mistyId, "starts_in");
  addEdge(bowlId, everfrostId, "located_in");
  addEdge(bowlId, faydarkId, "located_in");
  addEdge(bowlId, innothuleId, "located_in");
  addEdge(bowlId, timorousId, "located_in");
  addEdge(bowlId, amuletId, "requires");

  const swiftwindPreId = "quest:ranger-epic-warmly-glowing-stone";
  addNode({
    id: swiftwindPreId, label: "Ranger Epic Quest: Warmly Glowing Stone", type: "quest", classes: ["ranger"], minLevel: 46,
    description: "Give the Runecrested Bowl mixture to Ella Foodcrafter for a Softly Glowing Stone. Spawn and kill Venril Sathir for a Pulsing Green Stone, then combine the stones with Foloal Stormforest in Greater Faydark for a Warmly Glowing Stone.",
    steps: ["Give bowl mixture to Ella Foodcrafter for Softly Glowing Stone", "Spawn and kill Venril Sathir for Pulsing Green Stone", "Combine stones with Foloal Stormforest, Greater Faydark, for Warmly Glowing Stone"], wiki_title: "Ranger Epic Quest",
  });
  addEdge(ellaId, swiftwindPreId, "starts");
  addEdge(foloalId, swiftwindPreId, "starts");
  addEdge(swiftwindPreId, mistyId, "starts_in");
  addEdge(swiftwindPreId, faydarkId, "located_in");
  addEdge(swiftwindPreId, bowlId, "requires");

  const ancientSwordId = "quest:ranger-epic-ancient-longsword";
  addNode({
    id: ancientSwordId, label: "Ranger Epic Quest: Ancient Longsword", type: "quest", classes: ["ranger"], minLevel: 46,
    description: "Trade the Warmly Glowing Stone to Telin Darkforest for an Ancient Longsword.",
    steps: ["Trade Warmly Glowing Stone to Telin Darkforest, Burning Wood, for Ancient Longsword"], wiki_title: "Ranger Epic Quest",
  });
  addEdge(telinId, ancientSwordId, "starts");
  addEdge(ancientSwordId, burningWoodId, "starts_in");
  addEdge(ancientSwordId, swiftwindPreId, "requires");

  const hammerId = "quest:ranger-epic-hammer-of-the-ancients";
  addNode({
    id: hammerId, label: "Ranger Epic Quest: Hammer of the Ancients", type: "quest", classes: ["ranger"], minLevel: 46,
    description: "Spawn Jaeil the Insane via the bowl, kill him and loot a Soulbound Hammer. Quest through Mairee Silentone in Plane of Sky for a Hammer of the Ancients.",
    steps: ["Spawn and kill Jaeil the Insane for Soulbound Hammer", "Quest through Mairee Silentone, Plane of Sky, for Hammer of the Ancients"], wiki_title: "Ranger Epic Quest",
  });
  addEdge(maireeId, hammerId, "starts");
  addEdge(hammerId, skyId, "starts_in");
  addEdge(hammerId, ancientSwordId, "requires");

  const swiftwindId = "quest:ranger-epic-swiftwind";
  addNode({
    id: swiftwindId, label: "Ranger Epic Quest: Swiftwind", type: "quest", classes: ["ranger"], minLevel: 46,
    description: "Trade the Hammer of the Ancients to Kinlo for a small bit of Mithril Ore, spawn and defeat Usbak the Old, refine the Ancient Longsword through Usbak and Kinlo, then give the refined sword to Faelin Bloodbriar for the first epic reward, Swiftwind.",
    steps: ["Trade hammer to Kinlo, Greater Faydark, for Mithril Ore; spawn Usbak the Old", "Refine Ancient Longsword through Usbak the Old and Kinlo", "Give refined sword to Faelin Bloodbriar for Swiftwind"], wiki_title: "Ranger Epic Quest",
  });
  addEdge(kinloId, swiftwindId, "starts");
  addEdge(faelinId, swiftwindId, "starts");
  addEdge(swiftwindId, faydarkId, "starts_in");
  addEdge(swiftwindId, hammerId, "requires");

  const earthcallerId = "quest:ranger-epic-earthcaller";
  addNode({
    id: earthcallerId, label: "Ranger Epic Quest: Earthcaller", type: "quest", classes: ["ranger"], minLevel: 46,
    description: "Obtain a Shattered Emerald of Corruption from the Plane of Hate, then trade the refined mithril blade and the emerald to Xanuusus for the second epic reward, Earthcaller.",
    steps: ["Obtain Shattered Emerald of Corruption, Plane of Hate", "Trade refined mithril blade and emerald to Xanuusus, Greater Faydark, for Earthcaller"], wiki_title: "Ranger Epic Quest",
  });
  addEdge(xanuususId, earthcallerId, "starts");
  addEdge(earthcallerId, faydarkId, "starts_in");
  addEdge(earthcallerId, hateId, "located_in");
  addEdge(earthcallerId, swiftwindId, "requires");

  const swiftwindItemId = "item:swiftwind";
  addNode({
    id: swiftwindItemId, label: "Swiftwind", type: "item", slots: ["Secondary"], classes: ["ranger"],
    skill: "1H Slashing", damage: 13, stats: { str: 15, dex: 5, sta: 10, hp: 50 },
    saves: { fire: 5, cold: 5, disease: 5, magic: 5, poison: 5 }, minLevel: 46, magic: true, lore: true, noDrop: true,
    source: "Ranger Epic Quest reward (Faelin Bloodbriar, Greater Faydark)",
  });
  addEdge(swiftwindId, swiftwindItemId, "rewards");

  const earthcallerItemId = "item:earthcaller";
  addNode({
    id: earthcallerItemId, label: "Earthcaller", type: "item", slots: ["Primary"], classes: ["ranger"],
    skill: "1H Slashing", damage: 14, stats: { str: 15, dex: 10, sta: 5, hp: 50 },
    saves: { fire: 5, cold: 5, disease: 5, magic: 5, poison: 5 }, minLevel: 46, magic: true, lore: true, noDrop: true,
    source: "Ranger Epic Quest reward (Xanuusus, Greater Faydark)",
  });
  addEdge(earthcallerId, earthcallerItemId, "rewards");
}

// ---------------------------------------------------------------------
// Druid Epic Quest
// ---------------------------------------------------------------------
{
  const burningWoodId = "zone:burning-wood";
  const faydarkId = "zone:greater-faydark";
  const kithicorId = "zone:kithicor-forest";
  const eKaranaId = "zone:eastern-karana";

  const telinId = "npc:burning-wood:telin-darkforest";
  addGiver(telinId, "Telin Darkforest", burningWoodId);
  const faelinId = "npc:greater-faydark:faelin-bloodbriar";
  addGiver(faelinId, "Faelin Bloodbriar", faydarkId);
  const gizId = "npc:kithicor-forest:giz-xtin";
  addGiver(gizId, "Giz X'Tin", kithicorId);
  const altheleId = "npc:eastern-karana:althele";
  addGiver(altheleId, "Althele", eKaranaId);

  const noteId = "quest:druid-epic-worn-note";
  addNode({
    id: noteId, label: "Druid Epic Quest: Worn Note", type: "quest", classes: ["druid"], minLevel: 46,
    description: "Speak with Telin Darkforest in Burning Wood and say 'I will take action' to receive a Worn Note.",
    steps: ["Speak to Telin Darkforest, Burning Wood, and say 'I will take action' for Worn Note"], wiki_title: "Druid Epic Quest",
  });
  addEdge(telinId, noteId, "starts");
  addEdge(noteId, burningWoodId, "starts_in");

  const ringId = "quest:druid-epic-faelins-ring";
  addNode({
    id: ringId, label: "Druid Epic Quest: Faelin's Ring", type: "quest", classes: ["druid"], minLevel: 46,
    description: "Spawn Faelin Bloodbriar in Greater Faydark and give her the Worn Note for Faelin's Ring.",
    steps: ["Spawn Faelin Bloodbriar, Greater Faydark", "Give her the Worn Note for Faelin's Ring"], wiki_title: "Druid Epic Quest",
  });
  addEdge(faelinId, ringId, "starts");
  addEdge(ringId, faydarkId, "starts_in");
  addEdge(ringId, noteId, "requires");

  const coinId = "quest:druid-epic-dark-metal-coin";
  addNode({
    id: coinId, label: "Druid Epic Quest: Dark Metal Coin", type: "quest", classes: ["druid"], minLevel: 46,
    description: "Give Giz X'Tin in Kithicor Forest Faelin's Ring for a Dark Metal Coin.",
    steps: ["Give Faelin's Ring to Giz X'Tin, Kithicor Forest, for Dark Metal Coin"], wiki_title: "Druid Epic Quest",
  });
  addEdge(gizId, coinId, "starts");
  addEdge(coinId, kithicorId, "starts_in");
  addEdge(coinId, ringId, "requires");

  const amuletId = "quest:druid-epic-braided-grass-amulet";
  addNode({
    id: amuletId, label: "Druid Epic Quest: Braided Grass Amulet", type: "quest", classes: ["druid"], minLevel: 46,
    description: "Give Althele in East Karana the Worn Dark Metal Coin for a Braided Grass Amulet, then pass it through Sionae, Nuien, and Teloa before confronting the Dark Elf Corruptor.",
    steps: ["Give Worn Dark Metal Coin to Althele, East Karana, for Braided Grass Amulet", "Pass amulet through Sionae, Nuien, Teloa", "Confront the Dark Elf Corruptor"], wiki_title: "Druid Epic Quest",
  });
  addEdge(altheleId, amuletId, "starts");
  addEdge(amuletId, eKaranaId, "starts_in");
  addEdge(amuletId, coinId, "requires");

  const epicId = "quest:druid-epic-quest";
  addNode({
    id: epicId, label: "Druid Epic Quest", type: "quest", classes: ["druid"], minLevel: 46,
    description: "Complete the Braided Grass Amulet chain for the final reward, Nature Walkers Scimitar.",
    steps: ["Complete the amulet chain through the Dark Elf Corruptor confrontation"], wiki_title: "Druid Epic Quest",
  });
  addEdge(epicId, amuletId, "requires");

  const scimitarId = "item:nature-walkers-scimitar";
  addNode({
    id: scimitarId, label: "Nature Walkers Scimitar", type: "item", slots: ["Primary"], classes: ["druid"],
    skill: "1H Slashing", damage: 20, delay: 30, stats: { str: 15, sta: 15, wis: 20, hp: 10, mana: 90 },
    saves: { fire: 10, disease: 10, cold: 10, magic: 10, poison: 10 }, minLevel: 46,
    effect: "Wrath of Nature at Level 50", magic: true, lore: true, noDrop: true,
    source: "Druid Epic Quest reward",
  });
  addEdge(epicId, scimitarId, "rewards");
}

// ---------------------------------------------------------------------
// Enchanter Epic Quest
// ---------------------------------------------------------------------
{
  const erudinId = "zone:erudin";
  const burningWoodId = "zone:burning-wood";
  const overthereId = "zone:the-overthere";
  const akanonId = "zone:ak-anon";
  const firionaId = "zone:firiona-vie";
  const holeId = "zone:the-hole";

  const stofoId = "npc:erudin:stofo-olan";
  addGiver(stofoId, "Stofo Olan", erudinId);
  const jebId = "npc:burning-wood:jeb-lumsed";
  addGiver(jebId, "Jeb Lumsed", burningWoodId);
  const modaniId = "npc:the-overthere:modani-quloni";
  addGiver(modaniId, "Modani Qu'Loni", overthereId);
  const mizzleId = "npc:ak-anon:mizzle-gepple";
  addGiver(mizzleId, "Mizzle Gepple", akanonId);
  const nadiaId = "npc:firiona-vie:nadia-starfeast";
  addGiver(nadiaId, "Nadia Starfeast", firionaId);
  const polzinId = "npc:the-hole:polzin-mrid";
  addGiver(polzinId, "Polzin Mrid", holeId);

  const sealId = "quest:enchanter-epic-jebs-seal";
  addNode({
    id: sealId, label: "Enchanter Epic Quest: Jeb's Seal", type: "quest", classes: ["enchanter"], minLevel: 50,
    description: "Gather a mechanical pen, ink of the dark, and white paper, return them to Stofo Olan in Erudin for a Copy of Notes, then give the Copy of Notes to Jeb Lumsed (a sarnak imitator) in Burning Wood.",
    steps: ["Gather mechanical pen, ink of the dark, white paper", "Return to Stofo Olan, Erudin, for Copy of Notes", "Give Copy of Notes to Jeb Lumsed, Burning Wood"], wiki_title: "Enchanter Epic Quest",
  });
  addEdge(stofoId, sealId, "starts");
  addEdge(sealId, erudinId, "starts_in");
  addEdge(sealId, burningWoodId, "located_in");

  const masterOneId = "quest:enchanter-epic-master-one";
  addNode({
    id: masterOneId, label: "Enchanter Epic Quest: Master One", type: "quest", classes: ["enchanter"], minLevel: 50,
    description: "Collect a Xolion Rod, Innoruuk's Word, Chalice of Kings, and Snow Blossoms for Modani Qu'Loni in The Overthere.",
    steps: ["Collect Xolion Rod, Innoruuk's Word, Chalice of Kings, Snow Blossoms", "Turn in to Modani Qu'Loni, The Overthere"], wiki_title: "Enchanter Epic Quest",
  });
  addEdge(modaniId, masterOneId, "starts");
  addEdge(masterOneId, overthereId, "starts_in");
  addEdge(masterOneId, sealId, "requires");

  const masterTwoId = "quest:enchanter-epic-master-two";
  addNode({
    id: masterTwoId, label: "Enchanter Epic Quest: Master Two", type: "quest", classes: ["enchanter"], minLevel: 50,
    description: "Collect a Spoon, The One Key, Lost Scroll, and Book of Charm and Sacrifice for Mizzle Gepple in Ak'Anon.",
    steps: ["Collect Spoon, The One Key, Lost Scroll, Book of Charm and Sacrifice", "Turn in to Mizzle Gepple, Ak'Anon"], wiki_title: "Enchanter Epic Quest",
  });
  addEdge(mizzleId, masterTwoId, "starts");
  addEdge(masterTwoId, akanonId, "starts_in");
  addEdge(masterTwoId, sealId, "requires");

  const masterThreeId = "quest:enchanter-epic-master-three";
  addNode({
    id: masterThreeId, label: "Enchanter Epic Quest: Master Three", type: "quest", classes: ["enchanter"], minLevel: 50,
    description: "Obtain four enchanted gems, Diamond, Sapphire, Ruby, and Emerald, for Nadia Starfeast in Firiona Vie.",
    steps: ["Obtain Diamond, Sapphire, Ruby, Emerald gems", "Turn in to Nadia Starfeast, Firiona Vie"], wiki_title: "Enchanter Epic Quest",
  });
  addEdge(nadiaId, masterThreeId, "starts");
  addEdge(masterThreeId, firionaId, "starts_in");
  addEdge(masterThreeId, sealId, "requires");

  const masterFourId = "quest:enchanter-epic-master-four";
  addNode({
    id: masterFourId, label: "Enchanter Epic Quest: Master Four", type: "quest", classes: ["enchanter"], minLevel: 50,
    description: "Collect the Head of the Serpent, essence of a ghost, essence of a vampire, and sands of the mystics for Polzin Mrid in The Hole.",
    steps: ["Collect Head of the Serpent, essence of a ghost, essence of a vampire, sands of the mystics", "Turn in to Polzin Mrid, The Hole"], wiki_title: "Enchanter Epic Quest",
  });
  addEdge(polzinId, masterFourId, "starts");
  addEdge(masterFourId, holeId, "starts_in");
  addEdge(masterFourId, sealId, "requires");

  const epicId = "quest:enchanter-epic-quest";
  addNode({
    id: epicId, label: "Enchanter Epic Quest", type: "quest", classes: ["enchanter"], minLevel: 50,
    description: "Combine the four staff pieces from the Master quests in an Enchanter's Bag and deliver the Bundle of Staves to Jeb Lumsed for the final reward, Staff of the Serpent.",
    steps: ["Combine four staff pieces in Enchanter's Bag", "Deliver Bundle of Staves to Jeb Lumsed, Burning Wood"], wiki_title: "Enchanter Epic Quest",
  });
  addEdge(jebId, epicId, "starts");
  addEdge(epicId, burningWoodId, "starts_in");
  addEdge(epicId, masterOneId, "requires");
  addEdge(epicId, masterTwoId, "requires");
  addEdge(epicId, masterThreeId, "requires");
  addEdge(epicId, masterFourId, "requires");

  const staffId = "item:staff-of-the-serpent";
  addNode({
    id: staffId, label: "Staff of the Serpent", type: "item", slots: ["Primary"], classes: ["enchanter"],
    skill: "1H Blunt", damage: 11, stats: { str: 5, sta: 10, cha: 15, int: 20, hp: 40, mana: 60 },
    saves: { fire: 10, cold: 10, disease: 10, magic: 10, poison: 10 }, minLevel: 50, magic: true, lore: true, noDrop: true,
    source: "Enchanter Epic Quest reward (Jeb Lumsed, Burning Wood)",
  });
  addEdge(epicId, staffId, "rewards");
}

save();

console.log(
  "Migration 107 complete: modeled 4 more GitHub issue #26 questline entries as requires-chains -- Wizard Epic Quest (9 stages), Ranger Epic Quest (10 stages), Druid Epic Quest (5 stages), Enchanter Epic Quest (6 stages)."
);
