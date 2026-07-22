/**
 * Migration 106: second batch of GitHub issue #26's "Questlines" section --
 * real ordered `quest --requires--> quest` chains (decisions/quest-prerequisite-requires-edge.md).
 * Researched against eqlwiki.com per decisions/eqlwiki-quest-research-method.md.
 *
 * Covers: Rogue Epic Quest, Shadowknight Epic Quest, Crusader's Tests,
 * Shaman Epic Quest, Magician Epic Quest.
 *
 * A few stage locations (Plane of Hate, Plane of Air, Jade Tiger's Den,
 * Erud's Crossing, Droga) have no standalone zone node in this graph yet --
 * same "no node for an unmodeled zone, fold into prose" call as Freeport
 * Sewers in migration 104. "Howling Stones" is mapped to the existing
 * zone:old-sebilis (its classic-EQ predecessor name).
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, addGiver, save } = loadGraph(import.meta.dir);

function addGiverNoZone(id: string, label: string) {
  addNode({ id, label, type: "npc", roles: ["quest_giver"] });
}

// ---------------------------------------------------------------------
// Rogue Epic Quest
// ---------------------------------------------------------------------
{
  const aqueductsId = "zone:qeynos-aqueducts";
  const kaladimId = "zone:north-kaladim";
  const neriakId = "zone:neriak-3rd-gate";
  const highpassId = "zone:highpass-hold";
  const rathetearId = "zone:lake-rathetear";
  const steamfontId = "zone:steamfont-mountains";
  const kithicorId = "zone:kithicor-forest";

  const malkaId = "npc:qeynos-aqueducts:malka-rale";
  addGiver(malkaId, "Malka Rale", aqueductsId);
  const founyId = "npc:north-kaladim:founy-jestands";
  addGiver(founyId, "Founy Jestands", kaladimId);
  const taniId = "npc:neriak-3rd-gate:tani-nmar";
  addGiver(taniId, "Tani N'Mar", neriakId);
  const stanosId = "npc:highpass-hold:stanos-herkanor";
  addGiver(stanosId, "Stanos Herkanor", highpassId);
  const eldrethId = "npc:lake-rathetear:eldreth";
  addGiver(eldrethId, "Eldreth", rathetearId);
  const yendarId = "npc:steamfont-mountains:yendar-starpyre";
  addGiver(yendarId, "Yendar Starpyre", steamfontId);

  const pouchId = "quest:rogue-epic-stanos-pouch";
  addNode({
    id: pouchId, label: "Rogue Epic Quest: Stanos' Pouch", type: "quest", classes: ["rogue"], minLevel: 46,
    description: "Speak to Malka Rale in the Qeynos Aqueducts to receive Stanos' Pouch and begin the Rogue Epic Quest.",
    steps: ["Speak to Malka Rale in the Qeynos Aqueducts"], wiki_title: "Rogue Epic Quest",
  });
  addEdge(malkaId, pouchId, "starts");
  addEdge(pouchId, aqueductsId, "starts_in");

  const parchmentsId = "quest:rogue-epic-parchment-collection";
  addNode({
    id: parchmentsId, label: "Rogue Epic Quest: Parchment Collection", type: "quest", classes: ["rogue"], minLevel: 46,
    description: "Pickpocket a Stained Parchment Top from Founy Jestands at the North Kaladim bank and a Stained Parchment Bottom from Tani N'Mar at Neriak Third Gate.",
    steps: ["Pickpocket Stained Parchment Top from Founy Jestands, North Kaladim bank", "Pickpocket Stained Parchment Bottom from Tani N'Mar, Neriak Third Gate"], wiki_title: "Rogue Epic Quest",
  });
  addEdge(parchmentsId, kaladimId, "located_in");
  addEdge(parchmentsId, neriakId, "located_in");
  addEdge(parchmentsId, pouchId, "requires");

  const combinedId = "quest:rogue-epic-combined-parchment";
  addNode({
    id: combinedId, label: "Rogue Epic Quest: Combined Parchment", type: "quest", classes: ["rogue"], minLevel: 46,
    description: "Turn in Stanos' Pouch plus both parchment pieces to Stanos Herkanor in Highpass Hold for a Combined Parchment.",
    steps: ["Turn in Stanos' Pouch and both parchment pieces to Stanos Herkanor, Highpass Hold"], wiki_title: "Rogue Epic Quest",
  });
  addEdge(stanosId, combinedId, "starts");
  addEdge(combinedId, highpassId, "starts_in");
  addEdge(combinedId, parchmentsId, "requires");

  const translationId = "quest:rogue-epic-translation-chain";
  addNode({
    id: translationId, label: "Rogue Epic Quest: Translation Chain", type: "quest", classes: ["rogue"], minLevel: 46,
    description: "Turn in the Combined Parchment, 100 platinum, and two Bottles of Milk to Eldreth at Lake Rathetear for a Scribbled Parchment, then turn that in to Yendar Starpyre in Steamfont Mountains for a Tattered Parchment.",
    steps: ["Turn in Combined Parchment, 100pp, two Bottles of Milk to Eldreth, Lake Rathetear, for Scribbled Parchment", "Turn in Scribbled Parchment to Yendar Starpyre, Steamfont Mountains, for Tattered Parchment"], wiki_title: "Rogue Epic Quest",
  });
  addEdge(eldrethId, translationId, "starts");
  addEdge(yendarId, translationId, "starts");
  addEdge(translationId, rathetearId, "starts_in");
  addEdge(translationId, steamfontId, "located_in");
  addEdge(translationId, combinedId, "requires");

  const bookId = "quest:rogue-epic-book-of-souls";
  addNode({
    id: bookId, label: "Rogue Epic Quest: Book of Souls", type: "quest", classes: ["rogue"], minLevel: 46,
    description: "Find the Book of Souls, a 10-hour ground spawn on a dresser in the Plane of Hate.",
    steps: ["Find the Book of Souls ground spawn in the Plane of Hate"], wiki_title: "Rogue Epic Quest",
  });

  const renuxId = "quest:rogue-epic-renux";
  addNode({
    id: renuxId, label: "Rogue Epic Quest: Renux Herkanor", type: "quest", classes: ["rogue"], minLevel: 46,
    description: "Turn in the Tattered Parchment and Book of Souls to Yendar Starpyre in Steamfont Mountains to spawn Renux Herkanor (level 50 rogue); defeat him for Translated Parchment and a Jagged Diamond Dagger.",
    steps: ["Turn in Tattered Parchment and Book of Souls to Yendar Starpyre, Steamfont Mountains", "Defeat Renux Herkanor for Translated Parchment and Jagged Diamond Dagger"], wiki_title: "Rogue Epic Quest",
  });
  addEdge(yendarId, renuxId, "starts");
  addEdge(renuxId, steamfontId, "starts_in");
  addEdge(renuxId, translationId, "requires");
  addEdge(renuxId, bookId, "requires");

  const vgheraId = "quest:rogue-epic-general-vghera";
  addNode({
    id: vgheraId, label: "Rogue Epic Quest: General V'Ghera", type: "quest", classes: ["rogue"], minLevel: 46,
    description: "Turn in Translated Parchment to Stanos Herkanor in Highpass Hold for a Sealed Box, then turn that in to any dark elf at the dark elf cabin in Kithicor Forest at night to spawn General V'Ghera (level 60); defeat him for a General's Pouch and possibly a Cazic Quill.",
    steps: ["Turn in Translated Parchment to Stanos Herkanor, Highpass Hold, for Sealed Box", "Turn in Sealed Box to a dark elf at the Kithicor Forest cabin (night) to spawn General V'Ghera", "Defeat General V'Ghera for General's Pouch (and possibly Cazic Quill)"], wiki_title: "Rogue Epic Quest",
  });
  addEdge(stanosId, vgheraId, "starts");
  addEdge(vgheraId, highpassId, "starts_in");
  addEdge(vgheraId, kithicorId, "located_in");
  addEdge(vgheraId, renuxId, "requires");

  const epicId = "quest:rogue-epic-quest";
  addNode({
    id: epicId, label: "Rogue Epic Quest", type: "quest", classes: ["rogue"], minLevel: 46,
    description: "Turn in General's Pouch, Jagged Diamond Dagger, and Cazic Quill to Stanos Herkanor in Highpass Hold for Ragebringer. If Jagged Diamond Dagger or Cazic Quill didn't drop, they can be substituted by turning 4 of the relevant item (blades or robes) to Vilnius the Small in Western Plains of Karana.",
    steps: ["(If needed) Turn 4 blades or 4 robes to Vilnius the Small, Western Plains of Karana, for a replacement Jagged Diamond Dagger or Cazic Quill", "Turn in General's Pouch, Jagged Diamond Dagger, and Cazic Quill to Stanos Herkanor, Highpass Hold"], wiki_title: "Rogue Epic Quest",
  });
  addEdge(stanosId, epicId, "starts");
  addEdge(epicId, highpassId, "starts_in");
  addEdge(epicId, vgheraId, "requires");

  const ragebringerId = "item:ragebringer";
  addNode({
    id: ragebringerId, label: "Ragebringer", type: "item", slots: ["Primary", "Secondary"], classes: ["rogue"],
    race: ["human", "wood elf", "half elf", "dwarf", "halfling", "gnome", "barbarian", "dark elf"],
    skill: "Piercing", damage: 15, delay: 25, backstab: 15,
    stats: { str: 20, dex: 10, sta: 10, agi: 10, hp: 100 }, saves: { disease: 10, magic: 20, poison: 20 },
    haste: "40%", minLevel: 46, magic: true, lore: true, noDrop: true,
    source: "Rogue Epic Quest reward (Stanos Herkanor, Highpass Hold)",
  });
  addEdge(epicId, ragebringerId, "rewards");
}

// ---------------------------------------------------------------------
// Shadowknight Epic Quest
// ---------------------------------------------------------------------
{
  const overthereId = "zone:the-overthere";
  const paineelId = "zone:paineel";
  const holeId = "zone:the-hole";
  const kerraId = "zone:kerra-island";
  const cityOfMistId = "zone:city-of-mist";

  const kurronId = "npc:the-overthere:kurron-ni";
  addGiver(kurronId, "Kurron Ni", overthereId);
  const duriekId = "npc:paineel:duriek-bloodpool";
  addGiver(duriekId, "Duriek Bloodpool", paineelId);
  const marlId = "npc:kerra-island:marl-kastane";
  addGiver(marlId, "Marl Kastane", kerraId);
  const lhrancId = "npc:city-of-mist:lhranc";
  addGiver(lhrancId, "Lhranc", cityOfMistId);

  const letterId = "quest:shadowknight-epic-letter-to-duriek";
  addNode({
    id: letterId, label: "Shadowknight Epic Quest: Letter to Duriek", type: "quest", classes: ["shadow knight"],
    description: "Turn in a Darkforge Breastplate, Darkforge Greaves, Darkforge Helm, and 900 platinum to Kurron Ni in The Overthere, then defeat him for a Letter to Duriek.",
    steps: ["Turn in Darkforge Breastplate, Darkforge Greaves, Darkforge Helm, 900pp to Kurron Ni, The Overthere", "Defeat Kurron Ni for the Letter to Duriek"], wiki_title: "Shadowknight Epic Quest",
  });
  addEdge(kurronId, letterId, "starts");
  addEdge(letterId, overthereId, "starts_in");

  const tomeId = "quest:shadowknight-epic-dusty-tome";
  addNode({
    id: tomeId, label: "Shadowknight Epic Quest: Dusty Tome", type: "quest", classes: ["shadow knight"],
    description: "Buy a Cough Elixir from Smaka (1000 platinum), then turn it in with the Letter to Duriek to Duriek Bloodpool in Paineel, farming in The Hole toward the next stage.",
    steps: ["Buy a Cough Elixir from Smaka for 1000pp", "Turn in Cough Elixir and Letter to Duriek to Duriek Bloodpool, Paineel"], wiki_title: "Shadowknight Epic Quest",
  });
  addEdge(duriekId, tomeId, "starts");
  addEdge(tomeId, paineelId, "starts_in");
  addEdge(tomeId, holeId, "located_in");
  addEdge(tomeId, letterId, "requires");

  const ghoulbaneId = "quest:shadowknight-epic-corrupted-ghoulbane";
  addNode({
    id: ghoulbaneId, label: "Shadowknight Epic Quest: Corrupted Ghoulbane", type: "quest", classes: ["shadow knight"],
    description: "Turn in Ghoulbane, Soul Leech Dark Sword of Blood, Blade of Abrogation, and a Decrepit Sheath to Duriek Bloodpool in Paineel for a Corrupted Ghoulbane.",
    steps: ["Gather Ghoulbane, Soul Leech Dark Sword of Blood, Blade of Abrogation, Decrepit Sheath", "Turn them in to Duriek Bloodpool, Paineel"], wiki_title: "Shadowknight Epic Quest",
  });
  addEdge(duriekId, ghoulbaneId, "starts");
  addEdge(ghoulbaneId, paineelId, "starts_in");
  addEdge(ghoulbaneId, tomeId, "requires");

  const shroudId = "quest:shadowknight-epic-dark-shroud";
  addNode({
    id: shroudId, label: "Shadowknight Epic Quest: Dark Shroud", type: "quest", classes: ["shadow knight"],
    description: "Defeat Kyrenna (Kerra Island / The Hole) for the Blood of Kyrenna, then turn it in to Marl Kastane for a Dark Shroud.",
    steps: ["Defeat Kyrenna for Blood of Kyrenna", "Turn in Blood of Kyrenna to Marl Kastane"], wiki_title: "Shadowknight Epic Quest",
  });
  addEdge(marlId, shroudId, "starts");
  addEdge(shroudId, kerraId, "starts_in");
  addEdge(shroudId, holeId, "located_in");
  addEdge(shroudId, ghoulbaneId, "requires");

  const coinId = "quest:shadowknight-epic-lhrancs-coin";
  addNode({
    id: coinId, label: "Shadowknight Epic Quest: Lhranc's Coin", type: "quest", classes: ["shadow knight"],
    description: "Turn in the Corrupted Ghoulbane, Heart of the Innocent, Head of the Valiant, and Will of Innoruuk to Lhranc in City of Mist for Lhranc's Coin.",
    steps: ["Gather Heart of the Innocent, Head of the Valiant, Will of Innoruuk", "Turn them in with Corrupted Ghoulbane to Lhranc, City of Mist"], wiki_title: "Shadowknight Epic Quest",
  });
  addEdge(lhrancId, coinId, "starts");
  addEdge(coinId, cityOfMistId, "starts_in");
  addEdge(coinId, shroudId, "requires");

  const epicId = "quest:shadowknight-epic-quest";
  addNode({
    id: epicId, label: "Shadowknight Epic Quest", type: "quest", classes: ["shadow knight"],
    description: "Defeat Lhranc in City of Mist, then turn in Lhranc's Coin to Marl Kastane for the final reward, Innoruuk's Curse.",
    steps: ["Defeat Lhranc, City of Mist", "Turn in Lhranc's Coin to Marl Kastane"], wiki_title: "Shadowknight Epic Quest",
  });
  addEdge(marlId, epicId, "starts");
  addEdge(epicId, cityOfMistId, "located_in");
  addEdge(epicId, coinId, "requires");

  const curseId = "item:innoruuks-curse";
  addNode({
    id: curseId, label: "Innoruuk's Curse", type: "item", slots: ["Primary"], classes: ["shadow knight"],
    damage: 40, stats: { str: 20, dex: 15, int: 15, hp: 60, mana: 40 }, magic: true, lore: true, noDrop: true,
    source: "Shadowknight Epic Quest reward (Marl Kastane)",
  });
  addEdge(epicId, curseId, "rewards");
}

// ---------------------------------------------------------------------
// Crusader's Tests
// ---------------------------------------------------------------------
{
  const cabilisId = "zone:east-cabilis";
  const illOmenId = "zone:lake-of-ill-omen";
  const swampId = "zone:swamp-of-no-hope";
  const kurnsId = "zone:kurns-tower";
  const warskliksId = "zone:warsliks-woods";
  const firionaId = "zone:firiona-vie";
  const dalnirId = "zone:dalnir";
  const kaesoraId = "zone:kaesora";
  const cityOfMistId = "zone:city-of-mist";
  const mistmooreId = "zone:mistmoore-castle";
  const chardokId = "zone:chardok";
  const karnorsId = "zone:karnors-castle";
  const howlingStonesId = "zone:old-sebilis";

  const xogId = "npc:east-cabilis:arch-duke-xog";
  addGiver(xogId, "Arch Duke Xog", cabilisId);
  const gikzicId = "npc:east-cabilis:lord-gikzic";
  addGiver(gikzicId, "Lord Gikzic", cabilisId);
  const korzinId = "npc:east-cabilis:lord-korzin";
  addGiver(korzinId, "Lord Korzin", cabilisId);
  const qyzarId = "npc:east-cabilis:lord-qyzar";
  addGiver(qyzarId, "Lord Qyzar", cabilisId);
  const zimorId = "npc:east-cabilis:librarian-zimor";
  addGiver(zimorId, "Librarian Zimor", cabilisId);

  const newbieId = "quest:crusaders-test-of-the-newbie";
  addNode({
    id: newbieId, label: "Crusader's Test of the Newbie", type: "quest", classes: ["shadow knight"], minLevel: 1,
    description: "Turn in a Guild Summons note to Arch Duke Xog in East Cabilis for a Pawn's Khukri, the first stage of Crusader's Tests.",
    steps: ["Turn in a Guild Summons note to Arch Duke Xog, East Cabilis"], wiki_title: "Crusader's Tests",
  });
  addEdge(xogId, newbieId, "starts");
  addEdge(newbieId, cabilisId, "starts_in");

  const pawnId = "quest:crusaders-test-of-the-pawn";
  addNode({
    id: pawnId, label: "Crusader's Test of the Pawn", type: "quest", classes: ["shadow knight"],
    description: "Turn in a Full Pack of Sarnak Heads and the Pawn's Khukri to Lord Gikzic in Lake of Ill Omen for a Knave's Khukri.",
    steps: ["Gather Full Pack of Sarnak Heads", "Turn them in with the Pawn's Khukri to Lord Gikzic, Lake of Ill Omen"], wiki_title: "Crusader's Tests",
  });
  addEdge(gikzicId, pawnId, "starts");
  addEdge(pawnId, illOmenId, "starts_in");
  addEdge(pawnId, newbieId, "requires");

  const painId = "quest:crusaders-test-of-pain";
  addNode({
    id: painId, label: "Crusader's Test of Pain", type: "quest", classes: ["shadow knight"],
    description: "Turn in a Magically Locked Tome and the Knave's Khukri to Lord Gikzic in Swamp of No Hope for a Squire's Khukri.",
    steps: ["Gather Magically Locked Tome", "Turn it in with the Knave's Khukri to Lord Gikzic, Swamp of No Hope"], wiki_title: "Crusader's Tests",
  });
  addEdge(gikzicId, painId, "starts");
  addEdge(painId, swampId, "starts_in");
  addEdge(painId, pawnId, "requires");

  const sufferingId = "quest:crusaders-test-of-suffering";
  addNode({
    id: sufferingId, label: "Crusader's Test of Suffering", type: "quest", classes: ["shadow knight"],
    description: "Turn in a Glowing Skull and the Squire's Khukri to Lord Korzin in Kurn's Tower for a Knight's Khukri.",
    steps: ["Gather Glowing Skull", "Turn it in with the Squire's Khukri to Lord Korzin, Kurn's Tower"], wiki_title: "Crusader's Tests",
  });
  addEdge(korzinId, sufferingId, "starts");
  addEdge(sufferingId, kurnsId, "starts_in");
  addEdge(sufferingId, painId, "requires");

  const zealotId = "quest:crusaders-test-of-the-zealot";
  addNode({
    id: zealotId, label: "Crusader's Test of the Zealot", type: "quest", classes: ["shadow knight"],
    description: "Turn in a Chalp Diagram and the Knight's Khukri to Lord Qyzar in Warsliks Woods for a Zealot's Khukri.",
    steps: ["Gather Chalp Diagram", "Turn it in with the Knight's Khukri to Lord Qyzar, Warsliks Woods"], wiki_title: "Crusader's Tests",
  });
  addEdge(qyzarId, zealotId, "starts");
  addEdge(zealotId, warskliksId, "starts_in");
  addEdge(zealotId, sufferingId, "requires");

  const betrayalId = "quest:crusaders-test-of-betrayal";
  addNode({
    id: betrayalId, label: "Crusader's Test of Betrayal", type: "quest", classes: ["shadow knight"],
    description: "Turn in a Charasis Tome, a Charasis Tome Copy, and the Zealot's Khukri to Lord Qyzar in Firiona Vie for a Crusader's Khukri.",
    steps: ["Gather Charasis Tome and Charasis Tome Copy", "Turn them in with the Zealot's Khukri to Lord Qyzar, Firiona Vie"], wiki_title: "Crusader's Tests",
  });
  addEdge(qyzarId, betrayalId, "starts");
  addEdge(betrayalId, firionaId, "starts_in");
  addEdge(betrayalId, zealotId, "requires");

  const heroId = "quest:crusaders-test-of-the-hero";
  addNode({
    id: heroId, label: "Crusader's Test of the Hero", type: "quest", classes: ["shadow knight"],
    description: "Turn in The Visceral Dagger and the Crusader's Khukri to Lord Qyzar in Dalnir for a Hero's Khukri.",
    steps: ["Gather The Visceral Dagger", "Turn it in with the Crusader's Khukri to Lord Qyzar, Dalnir"], wiki_title: "Crusader's Tests",
  });
  addEdge(qyzarId, heroId, "starts");
  addEdge(heroId, dalnirId, "starts_in");
  addEdge(heroId, betrayalId, "requires");

  const lordId = "quest:crusaders-test-of-the-lord";
  addNode({
    id: lordId, label: "Crusader's Test of the Lord", type: "quest", classes: ["shadow knight"],
    description: "Retrieve a Stupendous Tome (Kaesora, City of Mist, Castle Mistmoore, or Droga Jail) and turn it in with the Hero's Khukri to Arch Duke Xog in East Cabilis for a Lord of Pain's Khukri.",
    steps: ["Gather Stupendous Tome (Kaesora / City of Mist / Castle Mistmoore / Droga Jail)", "Turn it in with the Hero's Khukri to Arch Duke Xog, East Cabilis"], wiki_title: "Crusader's Tests",
  });
  addEdge(xogId, lordId, "starts");
  addEdge(lordId, cabilisId, "starts_in");
  addEdge(lordId, kaesoraId, "located_in");
  addEdge(lordId, cityOfMistId, "located_in");
  addEdge(lordId, mistmooreId, "located_in");
  addEdge(lordId, heroId, "requires");

  const greenmistQuestId = "quest:crusaders-of-greenmist";
  addNode({
    id: greenmistQuestId, label: "Crusaders of Greenmist", type: "quest", classes: ["shadow knight"],
    description: "Gather components from Chardok, Lake of Ill Omen, Karnor's Castle, Howling Stones, and Dalnir, then combine them with the Lord of Pain's Khukri at the Dalnir Forge for the final Greenmist.",
    steps: ["Gather components across Chardok / Lake of Ill Omen / Karnor's Castle / Howling Stones / Dalnir", "Combine them with the Lord of Pain's Khukri at the Dalnir Forge (Librarian Zimor, East Cabilis)"], wiki_title: "Crusader's Tests",
  });
  addEdge(zimorId, greenmistQuestId, "starts");
  addEdge(greenmistQuestId, cabilisId, "starts_in");
  addEdge(greenmistQuestId, chardokId, "located_in");
  addEdge(greenmistQuestId, illOmenId, "located_in");
  addEdge(greenmistQuestId, karnorsId, "located_in");
  addEdge(greenmistQuestId, howlingStonesId, "located_in");
  addEdge(greenmistQuestId, dalnirId, "located_in");
  addEdge(greenmistQuestId, lordId, "requires");

  const greenmistItemId = "item:greenmist";
  addNode({
    id: greenmistItemId, label: "Greenmist", type: "item", slots: ["Primary"], classes: ["shadow knight"], race: ["iksar"],
    skill: "1H Slashing", damage: 18, delay: 22, ac: 5, baneDamage: { shissar: 6 }, effect: "Greenmist at Level 45",
    stats: { str: 5, dex: 5, int: 10 }, saves: { disease: 10, magic: 25, poison: 5 }, weight: 4.0, size: "Medium",
    source: "Crusaders of Greenmist reward (Librarian Zimor, East Cabilis)",
  });
  addEdge(greenmistQuestId, greenmistItemId, "rewards");
}

// ---------------------------------------------------------------------
// Shaman Epic Quest
// ---------------------------------------------------------------------
{
  const oceanId = "zone:ocean-of-tears";
  const ratheId = "zone:rathe-mountains";
  const butcherblockId = "zone:butcherblock-mountains";
  const boneId = "zone:field-of-bone";
  const northFreeportId = "zone:north-freeport";
  const westKaranaId = "zone:west-karana";
  const emeraldId = "zone:emerald-jungle";
  const mistmooreId = "zone:mistmoore-castle";
  const cityOfMistId = "zone:city-of-mist";
  const holeId = "zone:the-hole";
  const fearId = "zone:plane-of-fear";

  const lesserSpiritId = "npc:ocean-of-tears:a-lesser-spirit";
  addGiver(lesserSpiritId, "A Lesser Spirit", oceanId);
  const bondlId = "npc:north-freeport:bondl-felligan";
  addGiver(bondlId, "Bondl Felligan", northFreeportId);
  const greaterSpiritId = "npc:jade-tigers-den:a-greater-spirit";
  addGiverNoZone(greaterSpiritId, "A Greater Spirit");
  const wanderingSpiritId = "npc:west-karana:a-wandering-spirit";
  addGiver(wanderingSpiritId, "A Wandering Spirit", westKaranaId);
  const sentinelId = "npc:emerald-jungle:spirit-sentinel";
  addGiver(sentinelId, "Spirit Sentinel", emeraldId);
  const kirnId = "npc:the-hole:high-scale-kirn";
  addGiver(kirnId, "High Scale Kirn", holeId);
  const nehashiirId = "npc:city-of-mist:nehashiir";
  addGiver(nehashiirId, "Neh'Ashiir", cityOfMistId);
  const rakashiirId = "npc:city-of-mist:lord-rakashiir";
  addGiver(rakashiirId, "Lord Rak'Ashiir", cityOfMistId);

  const gemId = "quest:shaman-epic-tiny-gem";
  addNode({
    id: gemId, label: "Shaman Epic Quest: Tiny Gem", type: "quest", classes: ["shaman"],
    description: "Kill one of four specific mobs in Ocean of Tears, Rathe Mountains, Butcherblock Mountains, or Field of Bone to spawn A Lesser Spirit, who gives a Tiny Gem.",
    steps: ["Kill the designated mob in Ocean of Tears / Rathe Mountains / Butcherblock Mountains / Field of Bone", "Receive a Tiny Gem from A Lesser Spirit"], wiki_title: "Shaman Epic Quest",
  });
  addEdge(lesserSpiritId, gemId, "starts");
  addEdge(gemId, oceanId, "starts_in");
  addEdge(gemId, ratheId, "located_in");
  addEdge(gemId, butcherblockId, "located_in");
  addEdge(gemId, boneId, "located_in");

  const drunkenId = "quest:shaman-epic-drunken-shaman";
  addNode({
    id: drunkenId, label: "Shaman Epic Quest: The Drunken Shaman", type: "quest", classes: ["shaman"],
    description: "Turn in the Tiny Gem to Bondl Felligan in the North Freeport sewers for an Opaque Gem and access to the Greater Spirits in Jade Tiger's Den.",
    steps: ["Turn in Tiny Gem to Bondl Felligan, North Freeport sewers"], wiki_title: "Shaman Epic Quest",
  });
  addEdge(bondlId, drunkenId, "starts");
  addEdge(drunkenId, northFreeportId, "starts_in");
  addEdge(drunkenId, gemId, "requires");

  const patienceId = "quest:shaman-epic-test-of-patience";
  addNode({
    id: patienceId, label: "Shaman Epic Quest: Test of Patience", type: "quest", classes: ["shaman"],
    description: "Turn in the Opaque Gem to A Greater Spirit in Jade Tiger's Den (guided by Ooglyn, a female ogre shaman); after a waiting sequence, receive a Small Gem.",
    steps: ["Turn in Opaque Gem to A Greater Spirit in Jade Tiger's Den", "Wait out the sequence for a Small Gem"], wiki_title: "Shaman Epic Quest",
  });
  addEdge(greaterSpiritId, patienceId, "starts");
  addEdge(patienceId, drunkenId, "requires");

  const wisdomId = "quest:shaman-epic-test-of-wisdom";
  addNode({
    id: wisdomId, label: "Shaman Epic Quest: Test of Wisdom", type: "quest", classes: ["shaman"],
    description: "Kill Tabien the Goodly and Glaron the Wicked in Rathe Mountains for Envy and Woe, then turn those in with Marr's Promise to A Wandering Spirit in West Karana for a Shield of Falsehood and Sparkling Gem.",
    steps: ["Kill Tabien the Goodly and Glaron the Wicked, Rathe Mountains, for Envy and Woe", "Turn in Envy, Woe, and Marr's Promise to A Wandering Spirit, West Karana"], wiki_title: "Shaman Epic Quest",
  });
  addEdge(wanderingSpiritId, wisdomId, "starts");
  addEdge(wisdomId, westKaranaId, "starts_in");
  addEdge(wisdomId, ratheId, "located_in");
  addEdge(wisdomId, patienceId, "requires");

  const mightId = "quest:shaman-epic-test-of-might";
  addNode({
    id: mightId, label: "Shaman Epic Quest: Test of Might", type: "quest", classes: ["shaman"],
    description: "Kill an Advisor then Black Dire in Mistmoore Castle for a Black Dire Pelt, and turn it in to the Spirit Sentinel in Emerald Jungle for Black Fur Boots and a 6-slot booklet.",
    steps: ["Kill an Advisor, then Black Dire, in Mistmoore Castle, for Black Dire Pelt", "Turn in Black Dire Pelt to Spirit Sentinel, Emerald Jungle"], wiki_title: "Shaman Epic Quest",
  });
  addEdge(sentinelId, mightId, "starts");
  addEdge(mightId, emeraldId, "starts_in");
  addEdge(mightId, mistmooreId, "located_in");
  addEdge(mightId, wisdomId, "requires");

  const reportsId = "quest:shaman-epic-city-of-mist-reports";
  addNode({
    id: reportsId, label: "Shaman Epic Quest: City of Mist Reports", type: "quest", classes: ["shaman"],
    description: "Collect a Personal Diary Page, Crier's Scroll, Merchant's Letter, Written Announcement, Priest's Diary Page, and Student's Log in City of Mist to fill a 6-page booklet, then turn it in to the Spirit Sentinel for a faction increase and instructions to find Lord Ghiosk's books.",
    steps: ["Collect all 6 pages/documents in City of Mist", "Turn in the completed booklet to Spirit Sentinel, Emerald Jungle"], wiki_title: "Shaman Epic Quest",
  });
  addEdge(sentinelId, reportsId, "starts");
  addEdge(reportsId, cityOfMistId, "located_in");
  addEdge(reportsId, mightId, "requires");

  const booksId = "quest:shaman-epic-books-of-lord-ghiosk";
  addNode({
    id: booksId, label: "Shaman Epic Quest: Three Books of Lord Ghiosk", type: "quest", classes: ["shaman"],
    description: "Kill Lord Ghiosk in City of Mist for a Historic Article, Head Housekeeper's Log, and Crusades of the High Scale, then turn them in to the Spirit Sentinel at the pond in Emerald Jungle for instructions to find the Icon of the High Scale.",
    steps: ["Kill Lord Ghiosk, City of Mist, for the three books", "Turn them in to Spirit Sentinel, Emerald Jungle"], wiki_title: "Shaman Epic Quest",
  });
  addEdge(sentinelId, booksId, "starts");
  addEdge(booksId, cityOfMistId, "located_in");
  addEdge(booksId, reportsId, "requires");

  const iconId = "quest:shaman-epic-icon-of-high-scale";
  addNode({
    id: iconId, label: "Shaman Epic Quest: Icon of the High Scale", type: "quest", classes: ["shaman"],
    description: "Find the Icon of the High Scale, a ground spawn in the temple in City of Mist.",
    steps: ["Find the Icon of the High Scale ground spawn in the City of Mist temple"], wiki_title: "Shaman Epic Quest",
  });
  addEdge(iconId, cityOfMistId, "starts_in");
  addEdge(iconId, booksId, "requires");

  const kirnQuestId = "quest:shaman-epic-high-scale-kirn";
  addNode({
    id: kirnQuestId, label: "Shaman Epic Quest: High Scale Kirn", type: "quest", classes: ["shaman"],
    description: "Turn in the Icon of the High Scale to High Scale Kirn in The Hole for an Engraved Ring (the Promise Ring of Neh'Ashiir).",
    steps: ["Turn in Icon of the High Scale to High Scale Kirn, The Hole"], wiki_title: "Shaman Epic Quest",
  });
  addEdge(kirnId, kirnQuestId, "starts");
  addEdge(kirnQuestId, holeId, "starts_in");
  addEdge(kirnQuestId, iconId, "requires");

  const nehashiirQuestId = "quest:shaman-epic-nehashiir";
  addNode({
    id: nehashiirQuestId, label: "Shaman Epic Quest: Neh'Ashiir", type: "quest", classes: ["shaman"],
    description: "Turn in the Engraved Ring to Neh'Ashiir in City of Mist for Neh'Ashiir's Diary.",
    steps: ["Turn in the Engraved Ring to Neh'Ashiir, City of Mist"], wiki_title: "Shaman Epic Quest",
  });
  addEdge(nehashiirId, nehashiirQuestId, "starts");
  addEdge(nehashiirQuestId, cityOfMistId, "starts_in");
  addEdge(nehashiirQuestId, kirnQuestId, "requires");

  const tearId = "quest:shaman-epic-childs-tear";
  addNode({
    id: tearId, label: "Shaman Epic Quest: Child's Tear", type: "quest", classes: ["shaman"],
    description: "Kill Dread, Fright, or Terror in the Plane of Fear; loot a Child's Tear from an Iksar Broodling.",
    steps: ["Kill Dread, Fright, or Terror in the Plane of Fear", "Loot Child's Tear from an Iksar Broodling"], wiki_title: "Shaman Epic Quest",
  });
  addEdge(tearId, fearId, "starts_in");
  addEdge(tearId, nehashiirQuestId, "requires");

  const rakashiirQuestId = "quest:shaman-epic-rakashiir";
  addNode({
    id: rakashiirQuestId, label: "Shaman Epic Quest: Lord Rak'Ashiir", type: "quest", classes: ["shaman"],
    description: "Turn in the Child's Tear to Lord Rak'Ashiir in City of Mist for an Iksar Scale.",
    steps: ["Turn in Child's Tear to Lord Rak'Ashiir, City of Mist"], wiki_title: "Shaman Epic Quest",
  });
  addEdge(rakashiirId, rakashiirQuestId, "starts");
  addEdge(rakashiirQuestId, cityOfMistId, "starts_in");
  addEdge(rakashiirQuestId, tearId, "requires");

  const epicId = "quest:shaman-epic-quest";
  addNode({
    id: epicId, label: "Shaman Epic Quest", type: "quest", classes: ["shaman"], minLevel: 46,
    description: "Turn in the Iksar Scale to the Spirit Sentinel at the pond in Emerald Jungle for the final reward, Spear of Fate.",
    steps: ["Turn in Iksar Scale to Spirit Sentinel, pond in Emerald Jungle"], wiki_title: "Shaman Epic Quest",
  });
  addEdge(sentinelId, epicId, "starts");
  addEdge(epicId, emeraldId, "starts_in");
  addEdge(epicId, rakashiirQuestId, "requires");

  const spearId = "item:spear-of-fate";
  addNode({
    id: spearId, label: "Spear of Fate", type: "item", slots: ["Primary"], classes: ["shaman"],
    skill: "Piercing", delay: 30, damage: 20, stats: { str: 10, dex: 10, sta: 10, wis: 20, hp: 30, mana: 70 },
    saves: { fire: 10, disease: 10, cold: 10, magic: 10, poison: 10 }, minLevel: 46,
    effect: "Curse of the Spirits at Level 50", magic: true, lore: true, noDrop: true,
    source: "Shaman Epic Quest reward (Spirit Sentinel, Emerald Jungle)",
  });
  addEdge(epicId, spearId, "rewards");
}

// ---------------------------------------------------------------------
// Magician Epic Quest
// ---------------------------------------------------------------------
{
  const westCommonsId = "zone:west-commonlands";
  const butcherblockId = "zone:butcherblock-mountains";
  const najenaId = "zone:najena";
  const rathetearId = "zone:lake-rathetear";
  const skyfireId = "zone:skyfire-mountains";
  const firionaId = "zone:firiona-vie";
  const dagnorsId = "zone:dagnor-s-cauldron";

  const jahsohnId = "npc:west-commonlands:jahsohn-aksot";
  addGiver(jahsohnId, "Jahsohn Aksot", westCommonsId);
  const walnanId = "npc:butcherblock-mountains:walnan";
  addGiver(walnanId, "Walnan", butcherblockId);
  const akksstaffId = "npc:najena:akksstaff";
  addGiver(akksstaffId, "Akksstaff", najenaId);
  const rykasId = "npc:lake-rathetear:rykas";
  addGiver(rykasId, "Rykas", rathetearId);
  const jennusId = "npc:skyfire-mountains:jennus-lyklobar";
  addGiver(jennusId, "Jennus Lyklobar", skyfireId);
  const tiblnerId = "npc:firiona-vie:tiblner-milnik";
  addGiver(tiblnerId, "Tiblner Milnik", firionaId);
  const jinalisId = "npc:dagnor-s-cauldron:jinalis-andir";
  addGiver(jinalisId, "Jinalis Andir", dagnorsId);
  const kihunId = "npc:plane-of-air:kihun-solstin";
  addGiverNoZone(kihunId, "Kihun Solstin");
  const masterId = "npc:plane-of-air:master-of-elements";
  addGiverNoZone(masterId, "Master of Elements");

  const wordsMagikotId = "quest:magician-epic-words-of-magikot";
  addNode({
    id: wordsMagikotId, label: "Magician Epic Quest: Words of Magi'Kot", type: "quest", classes: ["magician"],
    description: "Turn in three torn pages looted from an enraged dread wolf (Kithicor Forest), tentacle terrors (Estate of Unrest), and a bloodthirsty ghoul (Lower Guk) to Jahsohn Aksot in West Commonlands for Words of Magi'Kot.",
    steps: ["Loot three torn pages from Kithicor Forest / Estate of Unrest / Lower Guk", "Turn them in to Jahsohn Aksot, West Commonlands"], wiki_title: "Magician Epic Quest",
  });
  addEdge(jahsohnId, wordsMagikotId, "starts");
  addEdge(wordsMagikotId, westCommonsId, "starts_in");

  const elementsId = "quest:magician-epic-power-of-the-elements";
  addNode({
    id: elementsId, label: "Magician Epic Quest: Power of the Elements", type: "quest", classes: ["magician"],
    description: "Turn in Power of Wind, Fire, Water, and Earth (looted from various zone mobs) to Walnan in Butcherblock Mountains for Power of the Elements.",
    steps: ["Gather Power of Wind, Fire, Water, Earth", "Turn them in to Walnan, Butcherblock Mountains"], wiki_title: "Magician Epic Quest",
  });
  addEdge(walnanId, elementsId, "starts");
  addEdge(elementsId, butcherblockId, "starts_in");
  addEdge(elementsId, wordsMagikotId, "requires");

  const masteryId = "quest:magician-epic-words-of-mastery";
  addNode({
    id: masteryId, label: "Magician Epic Quest: Words of Mastery", type: "quest", classes: ["magician"],
    description: "Turn in four torn pages of Mastery, looted from female dark elf magicians/goblin magicians in Najena or alligators in Temple of Cazic Thule, to Akksstaff in Najena for Words of Mastery.",
    steps: ["Loot four torn pages of Mastery (Najena or Temple of Cazic Thule)", "Turn them in to Akksstaff, Najena"], wiki_title: "Magician Epic Quest",
  });
  addEdge(akksstaffId, masteryId, "starts");
  addEdge(masteryId, najenaId, "starts_in");
  addEdge(masteryId, elementsId, "requires");

  const orbId = "quest:magician-epic-power-of-the-orb";
  addNode({
    id: orbId, label: "Magician Epic Quest: Power of the Orb", type: "quest", classes: ["magician"],
    description: "Turn in Words of Magi'Kot, Power of the Elements, and Words of Mastery to Rykas at Lake Rathetear for Power of the Orb.",
    steps: ["Turn in Words of Magi'Kot, Power of the Elements, Words of Mastery to Rykas, Lake Rathetear"], wiki_title: "Magician Epic Quest",
  });
  addEdge(rykasId, orbId, "starts");
  addEdge(orbId, rathetearId, "starts_in");
  addEdge(orbId, masteryId, "requires");

  const fireId = "quest:magician-epic-elemental-fire";
  addNode({
    id: fireId, label: "Magician Epic Quest: Fire Component", type: "quest", classes: ["magician"],
    description: "Complete Jennus Lyklobar's task in Skyfire Mountains for the Fire component.",
    steps: ["Complete Jennus Lyklobar's task, Skyfire Mountains"], wiki_title: "Magician Epic Quest",
  });
  addEdge(jennusId, fireId, "starts");
  addEdge(fireId, skyfireId, "starts_in");
  addEdge(fireId, orbId, "requires");

  const earthId = "quest:magician-epic-elemental-earth";
  addNode({
    id: earthId, label: "Magician Epic Quest: Earth Component", type: "quest", classes: ["magician"],
    description: "Complete Tiblner Milnik's task in Firiona Vie for the Earth component.",
    steps: ["Complete Tiblner Milnik's task, Firiona Vie"], wiki_title: "Magician Epic Quest",
  });
  addEdge(tiblnerId, earthId, "starts");
  addEdge(earthId, firionaId, "starts_in");
  addEdge(earthId, orbId, "requires");

  const waterId = "quest:magician-epic-elemental-water";
  addNode({
    id: waterId, label: "Magician Epic Quest: Water Component", type: "quest", classes: ["magician"],
    description: "Complete Jinalis Andir's task in Dagnor's Cauldron for the Water component.",
    steps: ["Complete Jinalis Andir's task, Dagnor's Cauldron"], wiki_title: "Magician Epic Quest",
  });
  addEdge(jinalisId, waterId, "starts");
  addEdge(waterId, dagnorsId, "starts_in");
  addEdge(waterId, orbId, "requires");

  const windId = "quest:magician-epic-elemental-wind";
  addNode({
    id: windId, label: "Magician Epic Quest: Wind Component", type: "quest", classes: ["magician"],
    description: "Complete Kihun Solstin's task in the Plane of Air for the Wind component.",
    steps: ["Complete Kihun Solstin's task, Plane of Air"], wiki_title: "Magician Epic Quest",
  });
  addEdge(kihunId, windId, "starts");
  addEdge(windId, orbId, "requires");

  const epicId = "quest:magician-epic-quest";
  addNode({
    id: epicId, label: "Magician Epic Quest", type: "quest", classes: ["magician"], minLevel: 46,
    description: "Turn in the Fire, Earth, Water, and Wind components to the Master of Elements in the Plane of Air for the final reward, Orb of Mastery.",
    steps: ["Turn in all four elemental components to the Master of Elements, Plane of Air"], wiki_title: "Magician Epic Quest",
  });
  addEdge(masterId, epicId, "starts");
  addEdge(epicId, fireId, "requires");
  addEdge(epicId, earthId, "requires");
  addEdge(epicId, waterId, "requires");
  addEdge(epicId, windId, "requires");

  const orbItemId = "item:orb-of-mastery";
  addNode({
    id: orbItemId, label: "Orb of Mastery", type: "item", classes: ["magician"],
    stats: { str: 15, int: 20, mana: 100 }, effect: "Manifest Elements", magic: true, lore: true, noDrop: true,
    source: "Magician Epic Quest reward (Master of Elements, Plane of Air)",
  });
  addEdge(epicId, orbItemId, "rewards");
}

save();

console.log(
  "Migration 106 complete: modeled 5 more GitHub issue #26 questline entries as requires-chains -- Rogue Epic Quest (7 stages), Shadowknight Epic Quest (6 stages), Crusader's Tests (9 stages), Shaman Epic Quest (13 stages), Magician Epic Quest (9 stages)."
);
