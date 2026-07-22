/**
 * Migration 108: fourth batch of GitHub issue #26's "Questlines" section.
 * Researched against eqlwiki.com per decisions/eqlwiki-quest-research-method.md.
 *
 * Covers: Necromancer Epic Quest (requires-chain), Necromancer Skullcap Quests
 * (requires-chain, 7 ranks), Necromancer Words Quests (quest_group of 12 sibling
 * turn-ins across three sister NPCs, per decisions/quest-group-node-type.md --
 * unordered parallel options, not a chain).
 *
 * "Plane of Hate" has no standalone zone node yet (same call as migration 106).
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, addGiver, save } = loadGraph(import.meta.dir);

// ---------------------------------------------------------------------
// Necromancer Epic Quest
// ---------------------------------------------------------------------
{
  const nektulosId = "zone:nektulos-forest";
  const rathetearId = "zone:lake-rathetear";
  const noHopeId = "zone:swamp-of-no-hope";
  const chardokId = "zone:chardok";
  const timorousId = "zone:timorous-deep";
  const fearId = "zone:plane-of-fear";
  const skyId = "zone:plane-of-sky";

  const venenziId = "npc:nektulos-forest:venenzi-oberzendi";
  addGiver(venenziId, "Venenzi Oberzendi", nektulosId);
  const kazenId = "npc:lake-rathetear:kazen-fecae";
  addGiver(kazenId, "Kazen Fecae", rathetearId);
  const emkelId = "npc:lake-rathetear:emkel-kabae";
  addGiver(emkelId, "Emkel Kabae", rathetearId);
  const ssessthrassId = "npc:swamp-of-no-hope:ssessthrass";
  addGiver(ssessthrassId, "Ssessthrass", noHopeId);
  const drendicoId = "npc:timorous-deep:drendico-metalbones";
  addGiver(drendicoId, "Drendico Metalbones", timorousId);
  const gkzzallkId = "npc:plane-of-sky:gkzzallk";
  addGiver(gkzzallkId, "Gkzzallk", skyId);

  const apprenticeId = "quest:necromancer-epic-symbol-of-the-apprentice";
  addNode({
    id: apprenticeId, label: "Necromancer Epic Quest: Symbol of the Apprentice", type: "quest", classes: ["necromancer"], minLevel: 46,
    description: "Hail Kazen Fecae in Lake Rathetear, kill Sir Edwin Motte (level 33 Paladin), and bring his head to Kazen for the Symbol of the Apprentice.",
    steps: ["Hail Kazen Fecae, Lake Rathetear", "Kill Sir Edwin Motte for his head", "Return head to Kazen for Symbol of the Apprentice"], wiki_title: "Necromancer Epic Quest",
  });
  addEdge(kazenId, apprenticeId, "starts");
  addEdge(apprenticeId, rathetearId, "starts_in");

  const serpentId = "quest:necromancer-epic-symbol-of-the-serpent";
  addNode({
    id: serpentId, label: "Necromancer Epic Quest: Symbol of the Serpent", type: "quest", classes: ["necromancer"], minLevel: 46,
    description: "Give the Symbol of the Apprentice to Venenzi in Nektulos Forest, kill Najena and loot a Flowing Black Robe, trade the robe to Venenzi for moss, then give the moss and twisted symbol to Emkel Kabae in Lake Rathetear.",
    steps: ["Give symbol to Venenzi, Nektulos Forest", "Kill Najena for Flowing Black Robe", "Trade robe to Venenzi for moss", "Give moss and twisted symbol to Emkel Kabae, Lake Rathetear"], wiki_title: "Necromancer Epic Quest",
  });
  addEdge(venenziId, serpentId, "starts");
  addEdge(serpentId, nektulosId, "starts_in");
  addEdge(serpentId, rathetearId, "located_in");
  addEdge(serpentId, apprenticeId, "requires");

  const testingId = "quest:necromancer-epic-symbol-of-testing";
  addNode({
    id: testingId, label: "Necromancer Epic Quest: Symbol of Testing", type: "quest", classes: ["necromancer"], minLevel: 46,
    description: "Give the symbol to Ssessthrass in Swamp of No Hope, obtain a Manisi Herb from Grand Herbalist Mak'ha in Chardok, return the herb to Ssessthrass, then give the refined herb to Emkel.",
    steps: ["Give symbol to Ssessthrass, Swamp of No Hope", "Obtain Manisi Herb from Grand Herbalist Mak'ha, Chardok", "Return herb to Ssessthrass", "Give refined herb to Emkel Kabae"], wiki_title: "Necromancer Epic Quest",
  });
  addEdge(ssessthrassId, testingId, "starts");
  addEdge(testingId, noHopeId, "starts_in");
  addEdge(testingId, chardokId, "located_in");
  addEdge(testingId, serpentId, "requires");

  const insanityId = "quest:necromancer-epic-symbol-of-insanity";
  addNode({
    id: insanityId, label: "Necromancer Epic Quest: Symbol of Insanity", type: "quest", classes: ["necromancer"], minLevel: 46,
    description: "Give the symbol to Kazen; three mobs spawn near Emkel (a bone golem, a failed apprentice, and a tortured soul); loot the next symbol from the final mob.",
    steps: ["Give symbol to Kazen Fecae, Lake Rathetear", "Defeat bone golem, failed apprentice, and tortured soul near Emkel", "Loot symbol from the tortured soul"], wiki_title: "Necromancer Epic Quest",
  });
  addEdge(kazenId, insanityId, "starts");
  addEdge(insanityId, rathetearId, "starts_in");
  addEdge(insanityId, testingId, "requires");

  const reagentsId = "quest:necromancer-epic-reagent-collection";
  addNode({
    id: reagentsId, label: "Necromancer Epic Quest: Reagent Collection", type: "quest", classes: ["necromancer"], minLevel: 46,
    description: "Deliver the symbol to Drendico Metalbones in Timorous Deep, then gather the Eye of Innoruuk (Plane of Hate), Slime Blood of Cazic Thule (Plane of Fear), and a Cloak of Spiroc Feathers (Plane of Sky quest).",
    steps: ["Deliver symbol to Drendico Metalbones, Timorous Deep", "Gather Eye of Innoruuk, Plane of Hate", "Gather Slime Blood of Cazic Thule, Plane of Fear", "Gather Cloak of Spiroc Feathers via Plane of Sky quest"], wiki_title: "Necromancer Epic Quest",
  });
  addEdge(drendicoId, reagentsId, "starts");
  addEdge(reagentsId, timorousId, "starts_in");
  addEdge(reagentsId, fearId, "located_in");
  addEdge(reagentsId, skyId, "located_in");
  addEdge(reagentsId, insanityId, "requires");

  const epicId = "quest:necromancer-epic-quest";
  addNode({
    id: epicId, label: "Necromancer Epic Quest", type: "quest", classes: ["necromancer"], minLevel: 46,
    description: "Return the reagents to Drendico for a prepared box, trade it to Kazen for a Tome, pay the Thunder Spirit Princess 10 gold in the Plane of Sky, then give the tome to Gkzzallk on island 3 for the final reward, Scythe of the Shadowed Soul.",
    steps: ["Return components to Drendico Metalbones for prepared box", "Trade box to Kazen Fecae for Tome", "Pay Thunder Spirit Princess 10 gold, Plane of Sky", "Give tome to Gkzzallk on island 3, Plane of Sky"], wiki_title: "Necromancer Epic Quest",
  });
  addEdge(gkzzallkId, epicId, "starts");
  addEdge(epicId, skyId, "starts_in");
  addEdge(epicId, reagentsId, "requires");

  const scytheId = "item:scythe-of-the-shadowed-soul";
  addNode({
    id: scytheId, label: "Scythe of the Shadowed Soul", type: "item", slots: ["Primary"], classes: ["necromancer"],
    skill: "1H Blunt", damage: 22, delay: 34, stats: { str: 5, sta: 10, cha: 5, int: 20, hp: 20, mana: 80 },
    minLevel: 46, magic: true, lore: true, noDrop: true,
    source: "Necromancer Epic Quest reward (Gkzzallk, Plane of Sky)",
  });
  addEdge(epicId, scytheId, "rewards");
}

// ---------------------------------------------------------------------
// Necromancer Skullcap Quests
// ---------------------------------------------------------------------
{
  const cabilisId = "zone:west-cabilis";
  const illOmenId = "zone:lake-of-ill-omen";
  const noHopeId = "zone:swamp-of-no-hope";
  const boneId = "zone:field-of-bone";
  const warskliksId = "zone:warsliks-woods";
  const kurnsId = "zone:kurns-tower";
  const overthereId = "zone:the-overthere";
  const firionaId = "zone:firiona-vie";
  const emeraldId = "zone:emerald-jungle";
  const dalnirId = "zone:dalnir";

  const xydozId = "npc:west-cabilis:master-xydoz";
  addGiver(xydozId, "Master Xydoz", cabilisId);
  const rixizId = "npc:west-cabilis:master-rixiz";
  addGiver(rixizId, "Master Rixiz", cabilisId);
  const kyvixId = "npc:west-cabilis:master-kyvix";
  addGiver(kyvixId, "Master Kyvix", cabilisId);
  const ryxId = "npc:the-overthere:ryx";
  addGiver(ryxId, "Ryx", overthereId);
  const rottId = "npc:west-cabilis:keeper-rott";
  addGiver(rottId, "Keeper Rott", cabilisId);
  const gloskId = "npc:west-cabilis:harbinger-glosk";
  addGiver(gloskId, "Harbinger Glosk", cabilisId);

  const rank1Id = "quest:necromancer-skullcap-rank1";
  addNode({
    id: rank1Id, label: "Necromancer Skullcap: Apprentice Skullcap, 1st Rank", type: "quest", classes: ["necromancer"],
    description: "Turn in four Sarnak Hatchling Brains (Lake of Ill Omen) to Master Xydoz in West Cabilis for Apprentice Skullcap - 1st Rank.",
    steps: ["Gather four Sarnak Hatchling Brains, Lake of Ill Omen", "Turn in to Master Xydoz, West Cabilis"], wiki_title: "Necromancer Skullcap Quests",
  });
  addEdge(xydozId, rank1Id, "starts");
  addEdge(rank1Id, cabilisId, "starts_in");
  addEdge(rank1Id, illOmenId, "located_in");

  const rank2Id = "quest:necromancer-skullcap-rank2";
  addNode({
    id: rank2Id, label: "Necromancer Skullcap: Apprentice Skullcap, 2nd Rank", type: "quest", classes: ["necromancer"],
    description: "Gather a Torn Tapestry and Ripped Tapestry from Sarnak Hatchlings, tailor them together, and turn in with the 1st Rank skullcap to Master Xydoz.",
    steps: ["Gather Torn Tapestry and Ripped Tapestry from Sarnak Hatchlings", "Tailor the two pieces together", "Turn in with 1st Rank skullcap to Master Xydoz"], wiki_title: "Necromancer Skullcap Quests",
  });
  addEdge(xydozId, rank2Id, "starts");
  addEdge(rank2Id, cabilisId, "starts_in");
  addEdge(rank2Id, rank1Id, "requires");

  const rank3Id = "quest:necromancer-skullcap-rank3";
  addNode({
    id: rank3Id, label: "Necromancer Skullcap: Apprentice Skullcap, 3rd Rank", type: "quest", classes: ["necromancer"],
    description: "Craft Bone Granite Powder and Embalming Fluid, gather a Sarnak Raider Brain from a Sarnak Crypt Raider in Lake of Ill Omen, and turn in with the 2nd Rank skullcap to Master Rixiz.",
    steps: ["Craft Bone Granite Powder (blacksmithing) and Embalming Fluid (brewing)", "Gather Sarnak Raider Brain, Lake of Ill Omen", "Turn in with 2nd Rank skullcap to Master Rixiz"], wiki_title: "Necromancer Skullcap Quests",
  });
  addEdge(rixizId, rank3Id, "starts");
  addEdge(rank3Id, cabilisId, "starts_in");
  addEdge(rank3Id, illOmenId, "located_in");
  addEdge(rank3Id, rank2Id, "requires");

  const rank4Id = "quest:necromancer-skullcap-rank4";
  addNode({
    id: rank4Id, label: "Necromancer Skullcap: Dark Binder Skullcap", type: "quest", classes: ["necromancer"],
    description: "Gather Creeper Cabbage (Swamp of No Hope), Scorpion Telson (Field of Bone), Intact Brutling Choppers (Warsliks Woods), and a Cracked Femur (Field of Bone/Kurn's Tower area), then turn in with the 3rd Rank skullcap to Master Kyvix.",
    steps: ["Gather Creeper Cabbage, Swamp of No Hope", "Gather Scorpion Telson, Field of Bone", "Gather Intact Brutling Choppers, Warsliks Woods", "Gather Cracked Femur", "Turn in with 3rd Rank skullcap to Master Kyvix"], wiki_title: "Necromancer Skullcap Quests",
  });
  addEdge(kyvixId, rank4Id, "starts");
  addEdge(rank4Id, cabilisId, "starts_in");
  addEdge(rank4Id, noHopeId, "located_in");
  addEdge(rank4Id, boneId, "located_in");
  addEdge(rank4Id, warskliksId, "located_in");
  addEdge(rank4Id, kurnsId, "located_in");
  addEdge(rank4Id, rank3Id, "requires");

  const rank5Id = "quest:necromancer-skullcap-rank5";
  addNode({
    id: rank5Id, label: "Necromancer Skullcap: Occultist Skullcap", type: "quest", classes: ["necromancer"],
    description: "Gather Green Death Rum, a Forsaken Pariah Mask (Iksar Pariahs), and an Evergreen Ivy Ringband (Forest Giants), turn in a Metal Key to the Tin Banker Assistant, then deliver the Dark Binder Skullcap and journal to Ryx at the Overthere Dark Elf Outpost.",
    steps: ["Gather Green Death Rum, Forsaken Pariah Mask, Evergreen Ivy Ringband", "Turn in Metal Key to Tin Banker Assistant", "Deliver Dark Binder Skullcap and journal to Ryx, The Overthere"], wiki_title: "Necromancer Skullcap Quests",
  });
  addEdge(ryxId, rank5Id, "starts");
  addEdge(rank5Id, overthereId, "starts_in");
  addEdge(rank5Id, rank4Id, "requires");

  const rank6Id = "quest:necromancer-skullcap-rank6";
  addNode({
    id: rank6Id, label: "Necromancer Skullcap: Revenant Skullcap", type: "quest", classes: ["necromancer"],
    description: "With high amiable faction with Brood of Kotiz, gather a Stem of Candlestick (Sarnak Revenants, Lake of Ill Omen), a Stein (from a halfling swashbuckler), and a Foot of Candlestick (from Grype, East Cabilis), then turn in with the current skullcap to Keeper Rott.",
    steps: ["Gather Stem of Candlestick, Lake of Ill Omen", "Gather Stein from halfling swashbuckler", "Gather Foot of Candlestick from Grype, East Cabilis", "Turn in with current skullcap to Keeper Rott"], wiki_title: "Necromancer Skullcap Quests",
  });
  addEdge(rottId, rank6Id, "starts");
  addEdge(rank6Id, cabilisId, "starts_in");
  addEdge(rank6Id, illOmenId, "located_in");
  addEdge(rank6Id, rank5Id, "requires");

  const rank7Id = "quest:necromancer-skullcap-rank7";
  addNode({
    id: rank7Id, label: "Necromancer Skullcap: Sorcerer Skullcap", type: "quest", classes: ["necromancer"],
    description: "With kindly faction with Brood of Kotiz, gather the Eye of RokGus (Mines of Nurga), Gem of Yet to Come (Lake of Ill Omen), Jewel of Ganak (Firiona Vie), and a Shiny Emerald (Emerald Jungle), forge a Forge Hammer of Dalnir with the Undead Blacksmith on Dalnir Level 3, then turn everything in to Harbinger Glosk.",
    steps: ["Gather Eye of RokGus, Mines of Nurga", "Gather Gem of Yet to Come, Lake of Ill Omen", "Gather Jewel of Ganak, Firiona Vie", "Gather Shiny Emerald, Emerald Jungle", "Forge Forge Hammer of Dalnir with Undead Blacksmith, Dalnir Level 3", "Turn in to Harbinger Glosk"], wiki_title: "Necromancer Skullcap Quests",
  });
  addEdge(gloskId, rank7Id, "starts");
  addEdge(rank7Id, cabilisId, "starts_in");
  addEdge(rank7Id, illOmenId, "located_in");
  addEdge(rank7Id, firionaId, "located_in");
  addEdge(rank7Id, emeraldId, "located_in");
  addEdge(rank7Id, dalnirId, "located_in");
  addEdge(rank7Id, rank6Id, "requires");
}

// ---------------------------------------------------------------------
// Necromancer Words Quests
// ---------------------------------------------------------------------
{
  const neriakId = "zone:neriak-foreign-quarter";

  const tempiId = "npc:neriak-foreign-quarter:xta-tempi";
  addGiver(tempiId, "X`Ta Tempi", neriakId);
  const timpiId = "npc:neriak-foreign-quarter:xta-timpi";
  addGiver(timpiId, "X`Ta Timpi", neriakId);
  const tompiId = "npc:neriak-foreign-quarter:xta-tompi";
  addGiver(tompiId, "X`Ta Tompi", neriakId);

  const groupId = "quest_group:necromancer-words-quests";
  addNode({
    id: groupId, label: "Necromancer Words Quests", type: "quest_group", classes: ["necromancer"], minLevel: 25,
    description: "Three sister NPCs (X`Ta Tempi, X`Ta Timpi, X`Ta Tompi) in Neriak Foreign Quarter each trade component items for one of the 12 pet-research 'Words of...' items, for high-level Necromancer pet research. Any of the 12 can be turned in independently.",
    wiki_title: "Necromancer Words Quests",
  });
  addEdge(groupId, neriakId, "located_in");

  const words: [string, string, string, string][] = [
    ["possession", "Words of Possession", "tempi", "two Barbed Bone Chips, Charred Dagger, Bloodstone"],
    ["haunting", "Words of Haunting", "tempi", "two Dark Bone Chips, Ebon Dagger, Jasper"],
    ["collection-beza", "Words of Collection (Beza)", "tempi", "Sphere of Unrest, Eye of Kor, Amber"],
    ["collection-caza", "Words of Collection (Caza)", "tempi", "Globe of Fear, Eye of Guk, Jade"],
    ["detachment", "Words of Detachment", "timpi", "two Dull Bone Chips, Charred Dagger, Bloodstone"],
    ["rupturing", "Words of Rupturing", "timpi", "Festering Cloak, two Ebon Wands, Jasper"],
    ["suffering", "Words of the Suffering", "timpi", "Globe of Fear, two Iced Bone Chips, Star Rose Quartz"],
    ["requisition", "Words of Requisition", "timpi", "Eye of Fright, Stone of the Wraith, Pearl"],
    ["allure", "Words of Allure", "tompi", "Charred Pearl, Ruby, Wand, Bloodstone"],
    ["dark-paths", "Words of Dark Paths", "tompi", "Sphere of Unrest, Eye of Urd, Star Rose Quartz"],
    ["obligation", "Words of Obligation", "tompi", "Globe of Fear, Eye of Jin, Jade"],
    ["acquisition-beza", "Words of Acquisition (Beza)", "tompi", "Fetid Skin, Scare Straw, Turmoil Warts, Pearl"],
  ];
  const givers: Record<string, string> = { tempi: tempiId, timpi: timpiId, tompi: tompiId };

  for (const [slug, label, sister, items] of words) {
    const id = `quest:necromancer-words-${slug}`;
    addNode({
      id, label: `Necromancer Words Quests: ${label}`, type: "quest", classes: ["necromancer"], minLevel: 25,
      description: `Turn in ${items} to ${sister === "tempi" ? "X\`Ta Tempi" : sister === "timpi" ? "X\`Ta Timpi" : "X\`Ta Tompi"} in Neriak Foreign Quarter for ${label}.`,
      steps: [`Gather ${items}`, `Turn in to ${sister === "tempi" ? "X\`Ta Tempi" : sister === "timpi" ? "X\`Ta Timpi" : "X\`Ta Tompi"}, Neriak Foreign Quarter, for ${label}`],
      wiki_title: sister === "tempi" ? "Necromancer Words - X`Ta Tempi" : sister === "timpi" ? "Necromancer Words - X`Ta Timpi" : "Necromancer Words - X`Ta Tompi",
    });
    addEdge(givers[sister], id, "starts");
    addEdge(id, neriakId, "starts_in");
    addEdge(id, groupId, "member_of");
  }
}

save();

console.log(
  "Migration 108 complete: modeled 3 more GitHub issue #26 questline entries -- Necromancer Epic Quest (7-stage requires-chain), Necromancer Skullcap Quests (7-rank requires-chain), Necromancer Words Quests (quest_group of 12 sibling turn-ins)."
);
