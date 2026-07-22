/**
 * Migration 110: sixth batch of GitHub issue #26's "Questlines" section --
 * the "Monk Armor & Sash/Shackle/Headband Progression" entry.
 * Researched against eqlwiki.com per decisions/eqlwiki-quest-research-method.md.
 *
 * Covers: Monk Epic Quest (with its Robe of the Lost Circle and Robe of the
 * Whistling Fists sub-quests folded in as stages), Monk Sash Quests (Freeport,
 * 4 tiers), Monk Headband Quests (Qeynos, 5 tiers), Monk Shackle Quests (East
 * Cabilis, 7 tiers) -- all requires-chains. "Mines of Nurga" and "Court of Pain"
 * have no standalone zone node yet; folded into prose (same call as migration 106).
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, addGiver, save } = loadGraph(import.meta.dir);

// ---------------------------------------------------------------------
// Monk Epic Quest
// ---------------------------------------------------------------------
{
  const erudinId = "zone:erudin";
  const sKaranaId = "zone:southern-karana";
  const ratheId = "zone:rathe-mountains";
  const dreadlandsId = "zone:dreadlands";
  const lavastormId = "zone:lavastorm-mountains";
  const skyId = "zone:plane-of-sky";
  const overthereId = "zone:the-overthere";
  const illOmenId = "zone:lake-of-ill-omen";
  const skyfireId = "zone:skyfire-mountains";
  const trakanonsId = "zone:trakanons-teeth";
  const timorousId = "zone:timorous-deep";

  const danlId = "npc:erudin:tomekeeper-danl";
  addGiver(danlId, "Tomekeeper Danl", erudinId);
  const balatinId = "npc:dreadlands:brother-balatin";
  addGiver(balatinId, "Brother Balatin", dreadlandsId);
  const lheaoId = "npc:timorous-deep:lheao";
  addGiver(lheaoId, "Lheao", timorousId);

  const lostCircleId = "quest:monk-epic-robe-of-the-lost-circle";
  addNode({
    id: lostCircleId, label: "Monk Epic Quest: Robe of the Lost Circle", type: "quest", classes: ["monk"], minLevel: 46,
    description: "Gather a Purple Headband, Red Sash of Order, Code of Zan Fi (from Targin the Rock in Nagafen's Lair), and The Idol (from Raster of Guk in Lower Guk); turn-ins to Brother Qwinn (Southern Karana) and Brother Zephyl (Rathe Mountains) yield a Needle of the Void and Rare Robe Pattern, which combine with Shadow Silk and a song scroll in a sewing kit for the Robe of the Lost Circle.",
    steps: ["Gather Purple Headband, Red Sash of Order, Code of Zan Fi (Nagafen's Lair), The Idol (Lower Guk)", "Turn in to Brother Qwinn, Southern Karana, and Brother Zephyl, Rathe Mountains, for Needle of the Void and Rare Robe Pattern", "Combine with Shadow Silk and song scroll in a sewing kit"], wiki_title: "Monk Epic Quest",
  });
  addEdge(lostCircleId, sKaranaId, "starts_in");
  addEdge(lostCircleId, ratheId, "located_in");

  const whistlingFistsId = "quest:monk-epic-robe-of-the-whistling-fists";
  addNode({
    id: whistlingFistsId, label: "Monk Epic Quest: Robe of the Whistling Fists", type: "quest", classes: ["monk"], minLevel: 46,
    description: "Gather two Metal Pipes (Chardok and Karnor's Castle) and turn them in with the Robe of the Lost Circle to a non-aggressive Brother Balatin in Dreadlands.",
    steps: ["Gather Metal Pipe from Chardok and Metal Pipe from Karnor's Castle", "Turn in with Robe of the Lost Circle to Brother Balatin, Dreadlands"], wiki_title: "Monk Epic Quest",
  });
  addEdge(balatinId, whistlingFistsId, "starts");
  addEdge(whistlingFistsId, dreadlandsId, "starts_in");
  addEdge(whistlingFistsId, lostCircleId, "requires");

  const eejagId = "quest:monk-epic-eejag";
  addNode({
    id: eejagId, label: "Monk Epic Quest: Eejag (Fire)", type: "quest", classes: ["monk"], minLevel: 46,
    description: "Say 'I challenge Eejag' to a fire sprite in Lavastorm Mountains to spawn Eejag; defeat him for a Charred Scale.",
    steps: ["Say 'I challenge Eejag' to the fire sprite, Lavastorm Mountains", "Defeat Eejag for Charred Scale"], wiki_title: "Monk Epic Quest",
  });
  addEdge(eejagId, lavastormId, "starts_in");

  const gwanId = "quest:monk-epic-gwan";
  addNode({
    id: gwanId, label: "Monk Epic Quest: Gwan (Air)", type: "quest", classes: ["monk"], minLevel: 46,
    description: "Give the Charred Scale to A Presence on Dojorn's Island in the Plane of Sky to spawn Gwan; defeat him for Breath of Gwan.",
    steps: ["Give Charred Scale to A Presence, Dojorn's Island, Plane of Sky", "Defeat Gwan for Breath of Gwan"], wiki_title: "Monk Epic Quest",
  });
  addEdge(gwanId, skyId, "starts_in");
  addEdge(gwanId, eejagId, "requires");

  const truntId = "quest:monk-epic-trunt";
  addNode({
    id: truntId, label: "Monk Epic Quest: Trunt (Earth)", type: "quest", classes: ["monk"], minLevel: 46,
    description: "Give the Breath of Gwan to A Sleeping Ogre in the Mines of Nurga to spawn Trunt; defeat him for Trunt's Head.",
    steps: ["Give Breath of Gwan to A Sleeping Ogre, Mines of Nurga", "Defeat Trunt for Trunt's Head"], wiki_title: "Monk Epic Quest",
  });
  addEdge(truntId, gwanId, "requires");

  const vorashId = "quest:monk-epic-vorash";
  addNode({
    id: vorashId, label: "Monk Epic Quest: Vorash/Xenevorash (Water)", type: "quest", classes: ["monk"], minLevel: 46,
    description: "Obtain the Eye of Kaiaren from an Astral Projection in The Overthere and turn it in at Lake of Ill Omen to spawn Xenevorash; defeat it for Demon Fangs.",
    steps: ["Obtain Eye of Kaiaren from Astral Projection, The Overthere", "Turn in at Lake of Ill Omen to spawn Xenevorash", "Defeat Xenevorash for Demon Fangs"], wiki_title: "Monk Epic Quest",
  });
  addEdge(vorashId, overthereId, "starts_in");
  addEdge(vorashId, illOmenId, "located_in");
  addEdge(vorashId, truntId, "requires");

  const bookId = "quest:monk-epic-book-conversion";
  addNode({
    id: bookId, label: "Monk Epic Quest: Book Conversion", type: "quest", classes: ["monk"], minLevel: 46,
    description: "Trade the Immortals book (Skyfire Mountains named mobs) to Tomekeeper Danl for Danl's Reference; combine with the Robe of the Whistling Fists and give to Lheao in Timorous Deep for Celestial Fists (book); give that to 'mad' Kaiaren in Trakanon's Teeth, then to 'sane' Kaiaren by the lake for the Book of Celestial Fists.",
    steps: ["Trade the Immortals book (Skyfire Mountains) to Tomekeeper Danl, Erudin, for Danl's Reference", "Combine with Robe of the Whistling Fists, give to Lheao, Timorous Deep, for Celestial Fists (book)", "Give to 'mad' Kaiaren, Trakanon's Teeth", "Give to 'sane' Kaiaren by the lake for Book of Celestial Fists"], wiki_title: "Monk Epic Quest",
  });
  addEdge(danlId, bookId, "starts");
  addEdge(lheaoId, bookId, "starts");
  addEdge(bookId, erudinId, "starts_in");
  addEdge(bookId, skyfireId, "located_in");
  addEdge(bookId, trakanonsId, "located_in");
  addEdge(bookId, timorousId, "located_in");
  addEdge(bookId, whistlingFistsId, "requires");

  const epicId = "quest:monk-epic-quest";
  addNode({
    id: epicId, label: "Monk Epic Quest", type: "quest", classes: ["monk"], minLevel: 46,
    description: "Turn in the Book of Celestial Fists plus Demon Fangs to 'sane' Kaiaren in Trakanon's Teeth for the final reward, Celestial Fists.",
    steps: ["Turn in Book of Celestial Fists and Demon Fangs to 'sane' Kaiaren, Trakanon's Teeth"], wiki_title: "Monk Epic Quest",
  });
  addEdge(epicId, trakanonsId, "starts_in");
  addEdge(epicId, bookId, "requires");
  addEdge(epicId, vorashId, "requires");

  const fistsId = "item:celestial-fists";
  addNode({
    id: fistsId, label: "Celestial Fists", type: "item", slots: ["Hands"], classes: ["monk"],
    ac: 20, stats: { str: 20, dex: 10, sta: 10, agi: 10, hp: 100 }, saves: { fire: 10, cold: 10, disease: 10, magic: 10, poison: 10 },
    minLevel: 46, magic: true, lore: true, noDrop: true, source: "Monk Epic Quest reward ('sane' Kaiaren, Trakanon's Teeth)",
  });
  addEdge(epicId, fistsId, "rewards");

  const robe1Id = "item:robe-of-the-lost-circle";
  addNode({
    id: robe1Id, label: "Robe of the Lost Circle", type: "item", slots: ["Chest"], classes: ["monk"],
    ac: 15, stats: { str: 5, dex: 5, sta: 5, agi: 5, hp: 50 }, magic: true, lore: true, noDrop: true,
    source: "Monk Epic Quest sub-reward (sewing kit combine)",
  });
  addEdge(lostCircleId, robe1Id, "rewards");

  const robe2Id = "item:robe-of-the-whistling-fists";
  addNode({
    id: robe2Id, label: "Robe of the Whistling Fists", type: "item", slots: ["Chest"], classes: ["monk"],
    ac: 15, stats: { hp: 50 }, saves: { magic: 10 }, effect: "Clickable song buff", magic: true, lore: true, noDrop: true,
    source: "Monk Epic Quest sub-reward (Brother Balatin, Dreadlands)",
  });
  addEdge(whistlingFistsId, robe2Id, "rewards");
}

// ---------------------------------------------------------------------
// Monk Sash Quests (Freeport)
// ---------------------------------------------------------------------
{
  const westFreeportId = "zone:west-freeport";
  const befallenId = "zone:befallen";
  const najenaId = "zone:najena";

  const velanId = "npc:west-freeport:velan-torresk";
  addGiver(velanId, "Velan Torresk", westFreeportId);
  const reyiaId = "npc:west-freeport:reyia-beslin";
  addGiver(reyiaId, "Reyia Beslin", westFreeportId);

  const whiteId = "quest:monk-sash-white-training";
  addNode({
    id: whiteId, label: "Monk Sash: White Training Sash", type: "quest", classes: ["monk"],
    description: "Turn in 2 Deathfist Pawn Scalps, a Snake Fang, and Bone Chips to Velan Torresk in West Freeport for the White Training Sash.",
    steps: ["Gather 2 Deathfist Pawn Scalps, Snake Fang, Bone Chips", "Turn in to Velan Torresk, West Freeport"], wiki_title: "Monk Sash Quests",
  });
  addEdge(velanId, whiteId, "starts");
  addEdge(whiteId, westFreeportId, "starts_in");

  const yellowId = "quest:monk-sash-yellow";
  addNode({
    id: yellowId, label: "Monk Sash: Yellow Sash of Order", type: "quest", classes: ["monk"],
    description: "Turn in a Giant Snake Rattle, Deathfist Slashed Belt, Desert Tarantula Chitin, and the White Training Sash to Velan Torresk.",
    steps: ["Gather Giant Snake Rattle, Deathfist Slashed Belt, Desert Tarantula Chitin", "Turn in with White Training Sash to Velan Torresk"], wiki_title: "Monk Sash Quests",
  });
  addEdge(velanId, yellowId, "starts");
  addEdge(yellowId, westFreeportId, "starts_in");
  addEdge(yellowId, whiteId, "requires");

  const orangeId = "quest:monk-sash-orange";
  addNode({
    id: orangeId, label: "Monk Sash: Orange Sash of Order", type: "quest", classes: ["monk"],
    description: "Turn in a Legionnaire's Bracer, Greater Lightstone, Cutthroat Insignia Ring, and the Yellow Sash of Order to Reyia Beslin.",
    steps: ["Gather Legionnaire's Bracer, Greater Lightstone, Cutthroat Insignia Ring", "Turn in with Yellow Sash of Order to Reyia Beslin"], wiki_title: "Monk Sash Quests",
  });
  addEdge(reyiaId, orangeId, "starts");
  addEdge(orangeId, westFreeportId, "starts_in");
  addEdge(orangeId, yellowId, "requires");

  const redId = "quest:monk-sash-red";
  addNode({
    id: redId, label: "Monk Sash: Red Sash of Order", type: "quest", classes: ["monk"],
    description: "Turn in a Blackened Wand (from Priest Amiaz in Befallen), a Blackened Sapphire (from Ekeros in Najena), and the Orange Sash of Order to Reyia Beslin.",
    steps: ["Get Blackened Wand from Priest Amiaz, Befallen", "Get Blackened Sapphire from Ekeros, Najena", "Turn in with Orange Sash of Order to Reyia Beslin"], wiki_title: "Monk Sash Quests",
  });
  addEdge(reyiaId, redId, "starts");
  addEdge(redId, westFreeportId, "starts_in");
  addEdge(redId, befallenId, "located_in");
  addEdge(redId, najenaId, "located_in");
  addEdge(redId, orangeId, "requires");
}

// ---------------------------------------------------------------------
// Monk Headband Quests (Qeynos)
// ---------------------------------------------------------------------
{
  const nQeynosId = "zone:north-qeynos";

  const phinId = "npc:north-qeynos:phin-esrinap";
  addGiver(phinId, "Phin Esrinap", nQeynosId);
  const togahnId = "npc:north-qeynos:togahn-sorast";
  addGiver(togahnId, "Togahn Sorast", nQeynosId);

  const whiteId = "quest:monk-headband-white";
  addNode({
    id: whiteId, label: "Monk Headband: White Headband", type: "quest", classes: ["monk"],
    description: "Turn in 4 Gnoll Pup Scalps to Phin Esrinap in the Silent Fist Clan House, North Qeynos, for the White Headband.",
    steps: ["Gather 4 Gnoll Pup Scalps", "Turn in to Phin Esrinap, Silent Fist Clan House, North Qeynos"], wiki_title: "Monk Headband Quests",
  });
  addEdge(phinId, whiteId, "starts");
  addEdge(whiteId, nQeynosId, "starts_in");

  const yellowId = "quest:monk-headband-yellow";
  addNode({
    id: yellowId, label: "Monk Headband: Yellow Headband", type: "quest", classes: ["monk"],
    description: "Turn in 3 Putrid Rib Bones and the White Headband to Phin Esrinap.",
    steps: ["Gather 3 Putrid Rib Bones", "Turn in with White Headband to Phin Esrinap"], wiki_title: "Monk Headband Quests",
  });
  addEdge(phinId, yellowId, "starts");
  addEdge(yellowId, nQeynosId, "starts_in");
  addEdge(yellowId, whiteId, "requires");

  const orangeId = "quest:monk-headband-orange";
  addNode({
    id: orangeId, label: "Monk Headband: Orange Headband", type: "quest", classes: ["monk"],
    description: "Turn in 2 Blackburrow Gnoll Pelts, a Blackburrow Gnoll Skin, and the Yellow Headband to Phin Esrinap -- the last quest with him.",
    steps: ["Gather 2 Blackburrow Gnoll Pelts, Blackburrow Gnoll Skin", "Turn in with Yellow Headband to Phin Esrinap"], wiki_title: "Monk Headband Quests",
  });
  addEdge(phinId, orangeId, "starts");
  addEdge(orangeId, nQeynosId, "starts_in");
  addEdge(orangeId, yellowId, "requires");

  const redId = "quest:monk-headband-red";
  addNode({
    id: redId, label: "Monk Headband: Red Headband", type: "quest", classes: ["monk"],
    description: "Turn in Dareb's Skull, Head of Shen, Head of Ghanex Drah, and the Orange Headband to Togahn Sorast, Silent Fist Clan House.",
    steps: ["Gather Dareb's Skull, Head of Shen, Head of Ghanex Drah", "Turn in with Orange Headband to Togahn Sorast"], wiki_title: "Monk Headband Quests",
  });
  addEdge(togahnId, redId, "starts");
  addEdge(redId, nQeynosId, "starts_in");
  addEdge(redId, orangeId, "requires");

  const purpleId = "quest:monk-headband-purple";
  addNode({
    id: purpleId, label: "Monk Headband: Purple Headband", type: "quest", classes: ["monk"],
    description: "Turn in Skull of Jhen'Tra, Dagger of Marnek, Zaharn's Coronet, and the Red Headband to Togahn Sorast.",
    steps: ["Gather Skull of Jhen'Tra, Dagger of Marnek, Zaharn's Coronet", "Turn in with Red Headband to Togahn Sorast"], wiki_title: "Monk Headband Quests",
  });
  addEdge(togahnId, purpleId, "starts");
  addEdge(purpleId, nQeynosId, "starts_in");
  addEdge(purpleId, redId, "requires");
}

// ---------------------------------------------------------------------
// Monk Shackle Quests (East Cabilis)
// ---------------------------------------------------------------------
{
  const cabilisId = "zone:east-cabilis";
  const illOmenId = "zone:lake-of-ill-omen";
  const warskliksId = "zone:warsliks-woods";
  const noHopeId = "zone:swamp-of-no-hope";
  const boneId = "zone:field-of-bone";
  const kaesoraId = "zone:kaesora";
  const kurnsId = "zone:kurns-tower";
  const timorousId = "zone:timorous-deep";
  const oasisId = "zone:oasis-of-marr";
  const firionaId = "zone:firiona-vie";
  const overthereId = "zone:the-overthere";
  const burningWoodId = "zone:burning-wood";
  const frontierId = "zone:frontier-mountains";
  const permafrostId = "zone:permafrost";
  const dalnirId = "zone:dalnir";

  const gloxId = "npc:east-cabilis:grand-master-glox";
  addGiver(gloxId, "Grand Master Glox", cabilisId);
  const raskaId = "npc:east-cabilis:master-raska";
  addGiver(raskaId, "Master Raska", cabilisId);
  const niskaId = "npc:east-cabilis:master-niska";
  addGiver(niskaId, "Master Niska", cabilisId);
  const rinmarkId = "npc:timorous-deep:rinmark";
  addGiver(rinmarkId, "Rinmark", timorousId);
  const veltarId = "npc:frontier-mountains:veltar";
  addGiver(veltarId, "Veltar", frontierId);

  const dustId = "quest:monk-shackle-0-dust";
  addNode({
    id: dustId, label: "Monk Shackle 0: Shackle of Dust", type: "quest", classes: ["monk"], minLevel: 1,
    description: "Turn in a Guild Summons note to Grand Master Glox in the East Cabilis Court of Pain for the Shackle of Dust.",
    steps: ["Turn in Guild Summons note to Grand Master Glox, East Cabilis Court of Pain"], wiki_title: "Monk Shackle Quests",
  });
  addEdge(gloxId, dustId, "starts");
  addEdge(dustId, cabilisId, "starts_in");

  const clayId = "quest:monk-shackle-1-clay";
  addNode({
    id: clayId, label: "Monk Shackle 1: Shackle of Clay", type: "quest", classes: ["monk"],
    description: "With amiable faction with Swifttails, gather Goblin Scout Beads (Lake of Ill Omen/Warsliks Woods/Lavastorm), a Large Scorpion Pincer (Field of Bone), a Skipping Stone (Swamp of No Hope), and a Sabertooth Cub Canine (Lake of Ill Omen); combine into a Full First Rite Pack and turn it in to Master Raska.",
    steps: ["Gather Goblin Scout Beads, Large Scorpion Pincer, Skipping Stone, Sabertooth Cub Canine", "Combine into Full First Rite Pack", "Turn in to Master Raska, East Cabilis"], wiki_title: "Monk Shackle Quests",
  });
  addEdge(raskaId, clayId, "starts");
  addEdge(clayId, cabilisId, "starts_in");
  addEdge(clayId, illOmenId, "located_in");
  addEdge(clayId, warskliksId, "located_in");
  addEdge(clayId, boneId, "located_in");
  addEdge(clayId, noHopeId, "located_in");
  addEdge(clayId, dustId, "requires");

  const stoneId = "quest:monk-shackle-2-stone";
  addNode({
    id: stoneId, label: "Monk Shackle 2: Shackle of Stone", type: "quest", classes: ["monk"],
    description: "Gather two Iksar Bandit Masks (Field of Bone, near Kaesora) and turn them in with the Shackle of Dust and Shackle of Clay to Master Raska.",
    steps: ["Gather two Iksar Bandit Masks, near Kaesora / Field of Bone", "Turn in with Shackle of Dust and Shackle of Clay to Master Raska"], wiki_title: "Monk Shackle Quests",
  });
  addEdge(raskaId, stoneId, "starts");
  addEdge(stoneId, cabilisId, "starts_in");
  addEdge(stoneId, boneId, "located_in");
  addEdge(stoneId, kaesoraId, "located_in");
  addEdge(stoneId, clayId, "requires");

  const rockId = "quest:monk-shackle-3-rock";
  addNode({
    id: rockId, label: "Monk Shackle 3: Shackle of Rock", type: "quest", classes: ["monk"],
    description: "Assemble three hand components -- a right hand from four items combined in a Tattered Sack from Rinmark (Excavator Claws, Intact Brutling Choppers, Torn Sash, Goblin Sparring Gloves), a left hand via The Great Oowomp/dancing skeleton/Fingered Skeleton in Kurn's Tower, and a Sarnak Courier kill in Lake of Ill Omen -- and turn all three in to Master Niska.",
    steps: ["Combine Excavator Claws, Intact Brutling Choppers, Torn Sash, Goblin Sparring Gloves in Tattered Sack from Rinmark", "Get Hand With Only a Thumb and 4 fingers from Fingered Skeleton, Kurn's Tower", "Kill a Sarnak Courier, Lake of Ill Omen", "Turn in all three hands to Master Niska, East Cabilis Court of Pain"], wiki_title: "Monk Shackle Quests",
  });
  addEdge(niskaId, rockId, "starts");
  addEdge(rockId, cabilisId, "starts_in");
  addEdge(rockId, timorousId, "located_in");
  addEdge(rockId, kurnsId, "located_in");
  addEdge(rockId, illOmenId, "located_in");
  addEdge(rockId, warskliksId, "located_in");
  addEdge(rockId, oasisId, "located_in");
  addEdge(rockId, stoneId, "requires");

  const copperId = "quest:monk-shackle-4-copper";
  addNode({
    id: copperId, label: "Monk Shackle 4: Shackle of Copper", type: "quest", classes: ["monk"],
    description: "Kill Kwinn the Outlander in Firiona Vie for an Outlander's Head and turn it in with the Shackle of Stone and Shackle of Rock to Master Niska.",
    steps: ["Kill Kwinn the Outlander, Firiona Vie, for Outlander's Head", "Turn in with Shackle of Stone and Shackle of Rock to Master Niska"], wiki_title: "Monk Shackle Quests",
  });
  addEdge(niskaId, copperId, "starts");
  addEdge(copperId, cabilisId, "starts_in");
  addEdge(copperId, firionaId, "located_in");
  addEdge(copperId, rockId, "requires");

  const bronzeId = "quest:monk-shackle-5-bronze";
  addNode({
    id: bronzeId, label: "Monk Shackle 5: Shackle of Bronze", type: "quest", classes: ["monk"],
    description: "Gather 10 pebbles across Burning Wood, Frontier Mountains, Timorous Deep, the Karana plains, The Overthere, Warsliks Woods, Firiona Vie, Swamp of No Hope, Lake of Ill Omen, and Permafrost, combine them in a Pebble Filled Box, and turn it in to Rinmark in Timorous Deep.",
    steps: ["Gather Radiant Meteorite (Burning Wood), Gold Nugget (Frontier Mountains), Rile's Sand Coin (Timorous Deep), Plains Pebble (Karana), Petrified Redwood (The Overthere/Warsliks Woods), Scarlet Stone (Firiona Vie), Jade Magma (Frontier Mountains), Heart of Ice (Swamp of No Hope/Lake of Ill Omen), Unholy Coldstone (Permafrost), Tektite Fragment (The Overthere quest)", "Combine into Pebble Filled Box", "Turn in to Rinmark, Timorous Deep"], wiki_title: "Monk Shackle Quests",
  });
  addEdge(rinmarkId, bronzeId, "starts");
  addEdge(bronzeId, timorousId, "starts_in");
  addEdge(bronzeId, burningWoodId, "located_in");
  addEdge(bronzeId, frontierId, "located_in");
  addEdge(bronzeId, overthereId, "located_in");
  addEdge(bronzeId, warskliksId, "located_in");
  addEdge(bronzeId, firionaId, "located_in");
  addEdge(bronzeId, noHopeId, "located_in");
  addEdge(bronzeId, illOmenId, "located_in");
  addEdge(bronzeId, permafrostId, "located_in");
  addEdge(bronzeId, copperId, "requires");

  const steelId = "quest:monk-shackle-6-steel";
  addNode({
    id: steelId, label: "Monk Shackle 6: Shackle of Steel", type: "quest", classes: ["monk"],
    description: "Assemble a Coppernickel Key from a Large Key base (Rinmark), a Copper Key (Temple of Droga interrogator), and a Nickel Key (Dalnir level 3 coerced penkeeper), then turn it in with the Shackle of Copper and Shackle of Bronze to the Iksar slave Veltar in the Frontier Mountains goblin caves.",
    steps: ["Get Large Key base from Rinmark", "Get Copper Key from Temple of Droga interrogator", "Get Nickel Key from Dalnir level 3 coerced penkeeper", "Combine into Coppernickel Key", "Turn in with Shackle of Copper and Shackle of Bronze to Veltar, Frontier Mountains goblin caves"], wiki_title: "Monk Shackle Quests",
  });
  addEdge(veltarId, steelId, "starts");
  addEdge(steelId, frontierId, "starts_in");
  addEdge(steelId, dalnirId, "located_in");
  addEdge(steelId, bronzeId, "requires");
}

save();

console.log(
  "Migration 110 complete: modeled the GitHub issue #26 'Monk Armor & Sash/Shackle/Headband Progression' cluster -- Monk Epic Quest (9 stages), Monk Sash Quests (4 tiers), Monk Headband Quests (5 tiers), Monk Shackle Quests (7 tiers), all as requires-chains."
);
