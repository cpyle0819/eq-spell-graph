/**
 * Migration 109: fifth batch of GitHub issue #26's "Questlines" section.
 * Researched against eqlwiki.com per decisions/eqlwiki-quest-research-method.md.
 *
 * Covers: Coldain Prayer Shawl Quests (requires-chain, 7 tiers) and Coldain Ring
 * Quests rings 1-9 (requires-chain; ring 10 was already modeled standalone as
 * quest:10th-coldain-ring-quest in migration 062).
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, addGiver, save } = loadGraph(import.meta.dir);

// ---------------------------------------------------------------------
// Coldain Prayer Shawl Quests
// ---------------------------------------------------------------------
{
  const thurgadinId = "zone:thurgadin";
  const eWastesId = "zone:eastern-wastes";
  const crystalId = "zone:crystal-caverns";
  const greatDivideId = "zone:great-divide";
  const cobaltId = "zone:cobalt-scar";
  const kaelId = "zone:kael-drakkal";
  const iceclad = "zone:iceclad-ocean";

  const borannnId = "npc:thurgadin:loremaster-borannin";
  addGiver(borannnId, "Loremaster Borannin", thurgadinId);
  const rexxId = "npc:thurgadin:rexx-frostweaver";
  addGiver(rexxId, "Rexx Frostweaver", thurgadinId);
  const bettiId = "npc:thurgadin:betti-frostweaver";
  addGiver(bettiId, "Betti Frostweaver", thurgadinId);
  const gilthanId = "npc:thurgadin:gilthan-brittleblade";
  addGiver(gilthanId, "Gilthan Brittleblade", thurgadinId);

  const shawl1Id = "quest:coldain-shawl-1-burlap";
  addNode({
    id: shawl1Id, label: "Coldain Prayer Shawl 1: Burlap", type: "quest",
    description: "Turn in 4 Frost Giant Toes to Loremaster Borannin in the Thurgadin chapel for the Burlap Coldain Prayer Shawl.",
    steps: ["Gather 4 Frost Giant Toes", "Turn in to Loremaster Borannin, Thurgadin chapel"], wiki_title: "Coldain Prayer Shawl Quests",
  });
  addEdge(borannnId, shawl1Id, "starts");
  addEdge(shawl1Id, thurgadinId, "starts_in");

  const shawl2Id = "quest:coldain-shawl-2-cloth";
  addNode({
    id: shawl2Id, label: "Coldain Prayer Shawl 2: Cloth", type: "quest",
    description: "Combine 10 Kromrif Heads in a Preservationists Box and turn in to Loremaster Borannin for the Cloth Coldain Prayer Shawl.",
    steps: ["Gather 10 Kromrif Heads", "Combine in Preservationists Box", "Turn in to Loremaster Borannin, Thurgadin"], wiki_title: "Coldain Prayer Shawl Quests",
  });
  addEdge(borannnId, shawl2Id, "starts");
  addEdge(shawl2Id, thurgadinId, "starts_in");
  addEdge(shawl2Id, shawl1Id, "requires");

  const shawl3Id = "quest:coldain-shawl-3-woven";
  addNode({
    id: shawl3Id, label: "Coldain Prayer Shawl 3: Woven", type: "quest",
    description: "Chain through Mordin Frostcleaver, Guard Leif, Trita Coldheart, Lorekeeper Brita, and Grand Historian Thoridain in Thurgadin, gathering Tundra Kodiak Meat, Snow Bunny Meat, Ulthork Meat, and Snow Griffin Eggs, then bake the final combine (Baking trivial 122) and turn in to Loremaster Borannin for the Woven Coldain Prayer Shawl.",
    steps: ["Chain through Mordin Frostcleaver, Guard Leif, Trita Coldheart, Lorekeeper Brita, Grand Historian Thoridain, Thurgadin", "Gather Tundra Kodiak Meat, Snow Bunny Meat, Ulthork Meat, Snow Griffin Eggs", "Bake final combine (Baking trivial 122)", "Turn in to Loremaster Borannin"], wiki_title: "Coldain Prayer Shawl Quests",
  });
  addEdge(borannnId, shawl3Id, "starts");
  addEdge(shawl3Id, thurgadinId, "starts_in");
  addEdge(shawl3Id, shawl2Id, "requires");

  const shawl4Id = "quest:coldain-shawl-4-fur-lined";
  addNode({
    id: shawl4Id, label: "Coldain Prayer Shawl 4: Fur-Lined", type: "quest",
    description: "Chain through Loremaster Borannin and Frundle Frenkler, rescue Tanik Greskil in Eastern Wastes, gather Crystalline Silk, a Small Brick of Velium, Small Pieces of Velium, and Glass Shards, craft a vial (Pottery trivial 122) in Crystal Caverns, for the Fur-Lined Coldain Prayer Shawl.",
    steps: ["Chain through Loremaster Borannin, Frundle Frenkler, Thurgadin", "Rescue Tanik Greskil, Eastern Wastes", "Gather Crystalline Silk, Small Brick of Velium, Small Pieces of Velium, Glass Shards", "Craft vial (Pottery trivial 122)"], wiki_title: "Coldain Prayer Shawl Quests",
  });
  addEdge(borannnId, shawl4Id, "starts");
  addEdge(shawl4Id, thurgadinId, "starts_in");
  addEdge(shawl4Id, eWastesId, "located_in");
  addEdge(shawl4Id, crystalId, "located_in");
  addEdge(shawl4Id, shawl3Id, "requires");

  const shawl5Id = "quest:coldain-shawl-5-silk";
  addNode({
    id: shawl5Id, label: "Coldain Prayer Shawl 5: Silk", type: "quest",
    description: "Combine 75 Crystalline Silk Thread (5 at a time in a sewing kit for Crystalline Silk Fiber) and gather 5 Glowing Worm Bile, then turn in to Rexx Frostweaver in the Thurgadin Exchange (Tailoring trivial 115) for the Silk Coldain Prayer Shawl.",
    steps: ["Gather 75 Crystalline Silk Thread, combine 5 at a time into Crystalline Silk Fiber", "Gather 5 Glowing Worm Bile", "Turn in to Rexx Frostweaver, Thurgadin Exchange (Tailoring trivial 115)"], wiki_title: "Coldain Prayer Shawl Quests",
  });
  addEdge(rexxId, shawl5Id, "starts");
  addEdge(shawl5Id, thurgadinId, "starts_in");
  addEdge(shawl5Id, shawl4Id, "requires");

  const shawl6Id = "quest:coldain-shawl-6-embroidered";
  addNode({
    id: shawl6Id, label: "Coldain Prayer Shawl 6: Embroidered", type: "quest",
    description: "Gather 2 Drakkel Wolf Whiskers (Great Divide), 2 Manticore Manes (Eastern Wastes), 2 Siren Hairs (Cobalt Scar), and a Woven Frost Giant Beard, then turn in to Betti Frostweaver in Thurgadin (Tailoring trivial 208) for the Embroidered Coldain Prayer Shawl.",
    steps: ["Gather 2 Drakkel Wolf Whiskers, Great Divide", "Gather 2 Manticore Manes, Eastern Wastes", "Gather 2 Siren Hairs, Cobalt Scar", "Gather Woven Frost Giant Beard", "Turn in to Betti Frostweaver, Thurgadin (Tailoring trivial 208)"], wiki_title: "Coldain Prayer Shawl Quests",
  });
  addEdge(bettiId, shawl6Id, "starts");
  addEdge(shawl6Id, thurgadinId, "starts_in");
  addEdge(shawl6Id, greatDivideId, "located_in");
  addEdge(shawl6Id, eWastesId, "located_in");
  addEdge(shawl6Id, cobaltId, "located_in");
  addEdge(shawl6Id, shawl5Id, "requires");

  const shawl7Id = "quest:coldain-shawl-7-runed";
  addNode({
    id: shawl7Id, label: "Coldain Prayer Shawl 7: Runed", type: "quest",
    description: "Chain through Gilthan Brittleblade, Trademaster Kroven, the Grand Historian, Grimthor Brewbeard, and Talem Tucter, gathering a Runed Sea Shell, Small Brick of Velium, Ulthork Tusks, Swordfish Tooth, Molkor Hide, Royal Kromrif Blood, and Iceclad Cutlassfish, crafting across Baking/Pottery/Brewing/Fletching/Jewelcrafting/Tailoring, then recite a prayer in the Thurgadin chapel and turn in to Loremaster Borannin for the Runed Coldain Prayer Shawl.",
    steps: ["Chain through Gilthan Brittleblade, Trademaster Kroven, Grand Historian, Grimthor Brewbeard, Talem Tucter", "Gather Runed Sea Shell, Small Brick of Velium, Ulthork Tusks, Swordfish Tooth, Molkor Hide, Royal Kromrif Blood, 3x Iceclad Cutlassfish", "Craft via Baking, Pottery, Brewing, Fletching, Jewelcrafting, Tailoring", "Recite the prayer in the Thurgadin chapel", "Turn in to Loremaster Borannin"], wiki_title: "Coldain Prayer Shawl Quests",
  });
  addEdge(gilthanId, shawl7Id, "starts");
  addEdge(shawl7Id, thurgadinId, "starts_in");
  addEdge(shawl7Id, kaelId, "located_in");
  addEdge(shawl7Id, iceclad, "located_in");
  addEdge(shawl7Id, eWastesId, "located_in");
  addEdge(shawl7Id, shawl6Id, "requires");
}

// ---------------------------------------------------------------------
// Coldain Ring Quests (rings 1-9; ring 10 already modeled in migration 062)
// ---------------------------------------------------------------------
{
  const eWastesId = "zone:eastern-wastes";
  const greatDivideId = "zone:great-divide";
  const icewellId = "zone:icewell-keep";

  const garadainId = "npc:eastern-wastes:garadain-glacierbane";
  addGiver(garadainId, "Garadain Glacierbane", eWastesId);
  const tainId = "npc:eastern-wastes:tain-hammerfrost";
  addGiver(tainId, "Tain Hammerfrost", eWastesId);
  const korrigainId = "npc:great-divide:korrigain";
  addGiver(korrigainId, "Korrigain", greatDivideId);
  const seneschalId = "npc:icewell-keep:seneschal-aldikar";
  addGiver(seneschalId, "Seneschal Aldikar", icewellId);

  const ring1Id = "quest:coldain-ring-1-copper";
  addNode({
    id: ring1Id, label: "Coldain Ring 1: Copper Coldain Insignia Ring", type: "quest",
    description: "Gather 2 High Quality Cougarskin and 2 High Quality Tundra Kodiak Pelt, tailor them into a Coldain Hunting Blanket (Sewing Kit, trivial 41), and turn it in to Garadain Glacierbane in Eastern Wastes.",
    steps: ["Gather 2 High Quality Cougarskin, 2 High Quality Tundra Kodiak Pelt", "Tailor into Coldain Hunting Blanket (trivial 41)", "Turn in to Garadain Glacierbane, Eastern Wastes"], wiki_title: "Coldain Ring Quests",
  });
  addEdge(garadainId, ring1Id, "starts");
  addEdge(ring1Id, eWastesId, "starts_in");

  const ring2Id = "quest:coldain-ring-2-silver";
  addNode({
    id: ring2Id, label: "Coldain Ring 2: Silver Coldain Insignia Ring", type: "quest",
    description: "Take a Dull Bladed Axe from Garadain to Boridain Glacierbane and escort him while hunting a Rabid Tundra Kodiak; loot Rabid Kodiak Skin and give it to Boridain for a Broken Axe; turn the axe in with Ring 1 to Garadain.",
    steps: ["Get Dull Bladed Axe from Garadain, escort Boridain Glacierbane", "Kill Rabid Tundra Kodiak for Rabid Kodiak Skin", "Give skin to Boridain for Broken Axe", "Turn in Broken Axe and Ring 1 to Garadain"], wiki_title: "Coldain Ring Quests",
  });
  addEdge(garadainId, ring2Id, "starts");
  addEdge(ring2Id, eWastesId, "starts_in");
  addEdge(ring2Id, ring1Id, "requires");

  const ring3Id = "quest:coldain-ring-3-gold";
  addNode({
    id: ring3Id, label: "Coldain Ring 3: Gold Coldain Insignia Ring", type: "quest",
    description: "Gather a Skinning Rock, Wooly Rhino Horn, and High Quality Walrus Hide, smith them into a Coldain Hunting Knife (Forge, trivial 41), and turn it in with Ring 2 to Garadain.",
    steps: ["Gather Skinning Rock, Wooly Rhino Horn, High Quality Walrus Hide", "Smith into Coldain Hunting Knife (trivial 41)", "Turn in with Ring 2 to Garadain"], wiki_title: "Coldain Ring Quests",
  });
  addEdge(garadainId, ring3Id, "starts");
  addEdge(ring3Id, eWastesId, "starts_in");
  addEdge(ring3Id, ring2Id, "requires");

  const ring4Id = "quest:coldain-ring-4-platinum";
  addNode({
    id: ring4Id, label: "Coldain Ring 4: Platinum Coldain Insignia Ring", type: "quest",
    description: "Kill Ghrek Squatnot and frost giants for a Frozen Elixir, get a Coldain Smithing Hammer from Tain Hammerfrost, and turn it in with Ring 3 to Garadain.",
    steps: ["Kill Ghrek Squatnot and frost giants for Frozen Elixir", "Get Coldain Smithing Hammer from Tain Hammerfrost", "Turn in hammer and Ring 3 to Garadain"], wiki_title: "Coldain Ring Quests",
  });
  addEdge(tainId, ring4Id, "starts");
  addEdge(ring4Id, eWastesId, "starts_in");
  addEdge(ring4Id, ring3Id, "requires");

  const ring5Id = "quest:coldain-ring-5-obsidian";
  addNode({
    id: ring5Id, label: "Coldain Ring 5: Obsidian Coldain Insignia Ring", type: "quest",
    description: "Kill a Ry'Gorr Messenger for Invasion Plans, give the plans to a coldain lookout to trigger an orc invasion, kill Scarbrow Ga'Hruk for his head, and turn it in with Ring 4 to Garadain.",
    steps: ["Kill Ry'Gorr Messenger for Invasion Plans", "Give plans to coldain lookout to trigger orc invasion", "Kill Scarbrow Ga'Hruk for Head of Scarbrow", "Turn in head and Ring 4 to Garadain"], wiki_title: "Coldain Ring Quests",
  });
  addEdge(garadainId, ring5Id, "starts");
  addEdge(ring5Id, eWastesId, "starts_in");
  addEdge(ring5Id, ring4Id, "requires");

  const ring6Id = "quest:coldain-ring-6-mithril";
  addNode({
    id: ring6Id, label: "Coldain Ring 6: Mithril Coldain Insignia Ring", type: "quest",
    description: "Give Ring 5 to Korrigain (who spawns 9pm-6am in the southwestern corner of Great Divide) and follow Icefang; kill Poxbreath Yellowfang for a Note from Kromrif and Rodrick Tardok for his head; turn in the note and head with Ring 5 to Garadain.",
    steps: ["Give Ring 5 to Korrigain, Great Divide, follow Icefang", "Kill Poxbreath Yellowfang for Note from Kromrif", "Kill Rodrick Tardok for his head", "Turn in note, head, and Ring 5 to Garadain"], wiki_title: "Coldain Ring Quests",
  });
  addEdge(korrigainId, ring6Id, "starts");
  addEdge(ring6Id, greatDivideId, "starts_in");
  addEdge(ring6Id, eWastesId, "located_in");
  addEdge(ring6Id, ring5Id, "requires");

  const ring7Id = "quest:coldain-ring-7-adamantium";
  addNode({
    id: ring7Id, label: "Coldain Ring 7: Adamantium Coldain Insignia Ring", type: "quest",
    description: "Kill Warden Bruke for a Shackle Key, free Corbin Blackwell and escort him to Dobbin Crossaxe, give Dobbin the Mithril Coldain Insignia Ring, and turn in Corbin's note to Garadain.",
    steps: ["Kill Warden Bruke for Shackle Key", "Free Corbin Blackwell, escort to Dobbin Crossaxe", "Give Dobbin Crossaxe the Mithril Coldain Insignia Ring", "Turn in note from Corbin to Garadain"], wiki_title: "Coldain Ring Quests",
  });
  addEdge(garadainId, ring7Id, "starts");
  addEdge(ring7Id, eWastesId, "starts_in");
  addEdge(ring7Id, ring6Id, "requires");

  const ring8Id = "quest:coldain-ring-8-velium";
  addNode({
    id: ring8Id, label: "Coldain Ring 8: Velium Coldain Insignia Ring", type: "quest",
    description: "Give Ring 7 to Garadain for Marching Orders, deliver them to Gloradin Coldheart to trigger the war, kill Chief Ry'Gorr and loot his head, then deliver it to Garadain after the 'CHARGE!' shout.",
    steps: ["Give Ring 7 to Garadain for Marching Orders", "Deliver orders to Gloradin Coldheart to trigger the war", "Kill Chief Ry'Gorr, loot head", "Deliver head to Garadain after the 'CHARGE!' shout"], wiki_title: "Coldain Ring Quests",
  });
  addEdge(garadainId, ring8Id, "starts");
  addEdge(ring8Id, eWastesId, "starts_in");
  addEdge(ring8Id, ring7Id, "requires");

  const ring9Id = "quest:coldain-ring-9-heros-insignia";
  addNode({
    id: ring9Id, label: "Coldain Ring 9: Coldain Hero's Insignia Ring", type: "quest",
    description: "During a Royal Court session in the Icewell Keep throne room, Seneschal Aldikar sends you to collect 5 heads and a Dirk of the Traitor -- Rodrick Tardok's dirk, Murdrick Tardok's head, Berradin's head, Peffin Ambersnow's head, and Juliash Lockheart's head -- combine them in a Traitor's Bane Box for a Box of the Guilty, and turn it in with Ring 8 to Dain Frostreaver IV.",
    steps: ["Attend Royal Court session, Icewell Keep throne room, ~8am", "Collect Rodrick Tardok's dirk, Murdrick Tardok's head, Berradin's head, Peffin Ambersnow's head, Juliash Lockheart's head", "Combine in Traitor's Bane Box for Box of the Guilty", "Turn in box and Ring 8 to Dain Frostreaver IV, Icewell Keep"], wiki_title: "Coldain Ring Quests",
  });
  addEdge(seneschalId, ring9Id, "starts");
  addEdge(ring9Id, icewellId, "starts_in");
  addEdge(ring9Id, ring8Id, "requires");

  addEdge("quest:10th-coldain-ring-quest", ring9Id, "requires");
}

save();

console.log(
  "Migration 109 complete: modeled 2 more GitHub issue #26 questline entries -- Coldain Prayer Shawl Quests (7-tier requires-chain), Coldain Ring Quests rings 1-9 (requires-chain, linked into the already-modeled ring 10)."
);
