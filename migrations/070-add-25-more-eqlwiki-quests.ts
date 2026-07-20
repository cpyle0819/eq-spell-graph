/**
 * Migration 070: 25 more quests off GitHub issue #26's checklist -- Gnomish
 * Toy, Guard of Ik Quest, and a 23-entry run into the ~90-entry "Guild
 * Summons" cluster (Cathedral of Fortitude through Dismal Rage
 * Shadowknight). Researched directly against eqlwiki.com, following
 * decisions/eqlwiki-quest-research-method.md and using migrations/_lib.ts.
 *
 * Every Guild Summons quest is the same shape already established by
 * migration 050: a new character of a given class/race receives a tattered
 * note (or recruitment letter) directing them to their own guild's NPC, who
 * takes the note and hands back a starter tunic/robe -- same mechanic, new
 * roster of 23 guildmasters/rewards. Faction reward is the guild's own name
 * (inferred, not always explicitly quoted on the page, same convention
 * migration 050 used for Emerald Warriors/Jaggedpine Treefolk/etc.) except
 * where noted below. Every reward item's wiki name carries a trailing `*`
 * (eqlwiki's Lore Item marker); several pages this batch explicitly
 * confirmed "LORE ITEM"/"Lore item" for that same asterisked name, so
 * `lore: true` is set on all of them and the `*` itself is stripped from
 * the modeled label, consistent with migration 050's Old Green
 * Tunic/Torn White Tunic/etc.
 *
 * Guard of Ik Quest was skipped in migration 050 for requiring City of
 * Mist, "a zone that doesn't exist in this graph" at the time -- it exists
 * now (added in an intervening migration), so it's modeled here instead of
 * re-deferred.
 *
 * Not modeled as a quest node:
 * - Guild Summons (bare) -- not a quest, the wiki's own disambiguation/
 *   index page ("intended to disambiguate articles with similar names")
 *   pointing to the individual per-guild pages, same treatment as migration
 *   062's "All Positive Faction Quests" and migration 065's "Faction
 *   Quests".
 * - Gretta's Baking Supplies Quest -- its own page states "NOTE: THIS QUEST
 *   IS NO LONGER IN GAME," matching the confirmed-non-functional precedent
 *   (migration 040's Bloodboil Quest, migration 037's Cabilis Pale Ale
 *   (Firiona Vie)).
 *
 * Deliberately NOT modeled (consistent with every migration so far):
 * - Coin rewards (Gretta's Baking Supplies' 7 gold, had it been modeled)
 *   and negative faction changes throughout (Gretta's Baking Supplies'
 *   Miners Guild 628 loss, Guard of Ik's Legion of Cabilis/Pirates of
 *   Gunthak loss) -- decisions/quest-reward-modeling.md only models
 *   positive rewards.
 * - Race/deity restrictions throughout (Cathedral of Fortitude's High
 *   Elf/Half-Elf-only, Cauldron of Hate's Dark Elf-only, Church of
 *   Underfoot's Dwarf-only, Circle of Unseen Hands/Coalition of Tradefolk
 *   Underground's Human/Half-Elf-only, Craft Keepers/Crimson Hands'
 *   Erudite-only, Da Bashers/Dark Ones' Troll-only, the Dark Reflection
 *   cluster's Gnome-of-Bertoxxulous-only, Deepwater cluster's Erudite-only,
 *   Dismal Rage cluster's Human-only) -- no race/deity field on `item`/
 *   `quest` (decisions/item-node-schema.md lists none); folded into
 *   `description` prose instead, same as migration 065's Gloves of
 *   Earthcrafting.
 * - Guild Summons - Dismal Rage Cleric/Shadowknight's item class list
 *   (WAR CLR SHD) implies a third, Warrior-specific Dismal Rage guild page
 *   may exist -- not on this batch's checklist run, left for later.
 *
 * Reused existing nodes: `npc:ak-anon:evah-xokez`, `npc:erudin:weligon-
 * steelherder`, `npc:grobb:kaglari`, `npc:grobb:ranjor`, and `npc:northern-
 * felwithe:tynkale` were already in the graph as quest givers elsewhere;
 * `addGiver` just adds the missing `located_in` edge where needed.
 * `faction:da-bashers`, `faction:dark-ones`, `faction:dark-reflection`,
 * `faction:deepwater-knights`, `faction:dismal-rage`, and `faction:circle-
 * of-unseen-hands` already existed from earlier migrations and are reused
 * as-is.
 *
 * Shared reward items (same name/stats quoted on multiple guild pages,
 * modeled once and reused via `rewards` edges from each quest, same
 * pattern as migration 050's Temple of Life/Temple of Thunder pairs):
 * `item:tin-patched-tunic` (Dark Reflection Cleric/Rogue/Warrior --
 * Class: CLR ROG WAR, Race: GNM); `item:dark-gold-felt-robe` (Dark
 * Reflection Enchanter/Magician/Necromancer/Wizard -- Class: NEC WIZ MAG
 * ENC, Race: GNM); `item:old-blue-tunic` (Deepwater Cleric/Paladin --
 * Class: CLR PAL, Race: ERU); `item:old-stained-robe` (Dismal Rage
 * Enchanter/Magician -- Class: NEC WIZ MAG ENC, Race: HUM);
 * `item:faded-crimson-tunic` (Dismal Rage Cleric/Shadowknight -- Class:
 * WAR CLR SHD, Race: HUM HEF). Dismal Rage Necromancer's reward is a
 * distinct, separately-named item (Dark Stained Robe, not Old Stained
 * Robe) despite the identical stat block -- modeled as its own node rather
 * than assumed to be the same item under a different label.
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, addFactionReward, addGiver, save } = loadGraph(import.meta.dir);

// ---------------------------------------------------------------------
// Gnomish Toy
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kerra-island";
  const giverId = "npc:kerra-island:kerran-tseq";
  addGiver(giverId, "Kerran tseq", zoneId);

  const questId = "quest:gnomish-toy";
  addNode({
    id: questId,
    label: "Gnomish Toy",
    type: "quest",
    description: "Kerran tseq on Kerra Island sends the player to Steamfont Mountains to defeat Nilit's contraption (summoned by Nilit Druzlit) for a Gnome Tinkered Toy, traded back for a Kerran Toy. All classes.",
    minLevel: 21,
    steps: [
      "Speak with Kerran tseq on Kerra Island",
      "Travel to Steamfont Mountains and defeat Nilit's contraption for a Gnome Tinkered Toy",
      "Return the toy to Kerran tseq",
    ],
    wiki_title: "Gnomish Toy",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:steamfont-mountains", "located_in");
  addFactionReward(questId, "Kerra Isle");

  const toyId = "item:kerran-toy";
  addNode({
    id: toyId,
    label: "Kerran Toy",
    type: "item",
    slots: ["Range"],
    ac: 3,
    stats: { agi: 2 },
    weight: 0.1,
    size: "Tiny",
    source: "Gnomish Toy reward (Kerran tseq, Kerra Island)",
  });
  addEdge(questId, toyId, "rewards");
}

// ---------------------------------------------------------------------
// Guard of Ik Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:firiona-vie";
  const giverId = "npc:firiona-vie:gearin-gaxx";
  addGiver(giverId, "Gearin Gaxx", zoneId);

  const questId = "quest:guard-of-ik-quest";
  addNode({
    id: questId,
    label: "Guard of Ik Quest",
    type: "quest",
    classes: ["warrior", "cleric", "paladin", "ranger", "shadow knight", "bard", "rogue", "shaman"],
    description: "Gearin Gaxx in Firiona Vie sends the player to defeat the Captain of the Guard in City of Mist twice for two Trooper Shields, and to obtain a Scribbled Note from A Pirate Cartographer in Firiona Vie, in exchange for the Guard of Ik shield.",
    minLevel: 36,
    steps: [
      "Defeat the Captain of the Guard in City of Mist twice for two Trooper Shields",
      "Obtain a Scribbled Note from A Pirate Cartographer in Firiona Vie",
      "Deliver both Trooper Shields and the Scribbled Note to Gearin Gaxx",
    ],
    wiki_title: "Guard of Ik Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:city-of-mist", "located_in");
  addFactionReward(questId, "Inhabitants of Firiona Vie");
  addFactionReward(questId, "Emerald Warriors");
  addFactionReward(questId, "Storm Guard");

  const shieldId = "item:guard-of-ik";
  addNode({
    id: shieldId,
    label: "Guard of Ik",
    type: "item",
    slots: ["Secondary"],
    ac: 10,
    resists: { magic: 5 },
    weight: 10.0,
    source: "Guard of Ik Quest reward (Gearin Gaxx, Firiona Vie)",
  });
  addEdge(questId, shieldId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Cathedral of Fortitude
// ---------------------------------------------------------------------
{
  const zoneId = "zone:northern-felwithe";
  const giverId = "npc:northern-felwithe:tynkale";
  addGiver(giverId, "Tynkale", zoneId);

  const questId = "quest:guild-summons-cathedral-of-fortitude";
  addNode({
    id: questId,
    label: "Guild Summons - Cathedral of Fortitude",
    type: "quest",
    description: "A new High Elf or Half-Elf Paladin of the Cathedral of Fortitude Guild receives a note directing them to Tynkale in Northern Felwithe, who trades it for a guild tunic.",
    classes: ["paladin"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Tynkale in the Cathedral of Fortitude"],
    wiki_title: "Guild Summons - Cathedral of Fortitude",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Cathedral of Fortitude");

  const tunicId = "item:used-gold-training-tunic";
  addNode({ id: tunicId, label: "Used Gold Training Tunic", type: "item", slots: ["Chest"], classes: ["paladin"], ac: 3, weight: 1.0, size: "Medium", lore: true, source: "Guild Summons - Cathedral of Fortitude reward (Tynkale, Northern Felwithe) -- restricted to Paladins of High Elf or Half-Elf race" });
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Cauldron of Hate
// ---------------------------------------------------------------------
{
  const zoneId = "zone:neriak-commons";
  const giverId = "npc:neriak-commons:seloxia-punox";
  addGiver(giverId, "Seloxia Punox", zoneId);

  const questId = "quest:guild-summons-cauldron-of-hate";
  addNode({
    id: questId,
    label: "Guild Summons - Cauldron of Hate",
    type: "quest",
    description: "A new Dark Elf Warrior of the Cauldron of Hate Guild receives a note directing them to Seloxia Punox in Neriak Commons, who trades it for a guild tunic.",
    classes: ["warrior"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Seloxia Punox at the Cauldron of Hate"],
    wiki_title: "Guild Summons - Cauldron of Hate",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Cauldron of Hate");

  const tunicId = "item:old-training-tunic";
  addNode({ id: tunicId, label: "Old Training Tunic", type: "item", slots: ["Chest"], classes: ["warrior"], ac: 3, weight: 1.0, size: "Medium", lore: true, source: "Guild Summons - Cauldron of Hate reward (Seloxia Punox, Neriak Commons) -- restricted to Warriors of Dark Elf race" });
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Church of Underfoot
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-kaladim";
  const giverId = "npc:north-kaladim:priestess-ghalea";
  addGiver(giverId, "Priestess Ghalea", zoneId);

  const questId = "quest:guild-summons-church-of-underfoot";
  addNode({
    id: questId,
    label: "Guild Summons - Church of Underfoot",
    type: "quest",
    description: "A new Dwarf Cleric of the Church of Underfoot Guild receives a note directing them to Priestess Ghalea in North Kaladim, who trades it for a guild tunic.",
    classes: ["cleric"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Priestess Ghalea at the Church of Underfoot"],
    wiki_title: "Guild Summons - Church of Underfoot",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Church of Underfoot");

  const tunicId = "item:dusty-tunic";
  addNode({ id: tunicId, label: "Dusty Tunic", type: "item", slots: ["Chest"], classes: ["cleric"], ac: 2, weight: 0.8, lore: true, source: "Guild Summons - Church of Underfoot reward (Priestess Ghalea, North Kaladim) -- restricted to Clerics of Dwarf race" });
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Circle of Unseen Hands
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-qeynos";
  const giverId = "npc:north-qeynos:hanns-krieghor";
  addGiver(giverId, "Hanns Krieghor", zoneId);

  const questId = "quest:guild-summons-circle-of-unseen-hands";
  addNode({
    id: questId,
    label: "Guild Summons - Circle of Unseen Hands",
    type: "quest",
    description: "A new Human or Half-Elf Rogue of the Circle of Unseen Hands Guild receives a note directing them to Hanns Krieghor in North Qeynos, who trades it for a guild tunic.",
    classes: ["rogue"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Hanns Krieghor at the Circle of Unseen Hands"],
    wiki_title: "Guild Summons - Circle of Unseen Hands",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Circle of Unseen Hands");

  const tunicId = "item:second-hand-tunic";
  addNode({ id: tunicId, label: "Second Hand Tunic", type: "item", slots: ["Chest"], classes: ["rogue"], ac: 2, weight: 0.7, lore: true, source: "Guild Summons - Circle of Unseen Hands reward (Hanns Krieghor, North Qeynos) -- restricted to Rogues of Human or Half-Elf race" });
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Coalition of Tradefolk Underground
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-freeport";
  const giverId = "npc:east-freeport:elisi-nasin";
  addGiver(giverId, "Elisi Nasin", zoneId);

  const questId = "quest:guild-summons-coalition-of-tradefolk-underground";
  addNode({
    id: questId,
    label: "Guild Summons - Coalition of Tradefolk Underground",
    type: "quest",
    description: "A new Human or Half-Elf Rogue of the Coalition of Tradefolk Underground Guild receives a note directing them to Elisi Nasin, beneath the docks in East Freeport, who trades it for a guild tunic.",
    classes: ["rogue"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Elisi Nasin beneath the East Freeport docks"],
    wiki_title: "Guild Summons - Coalition of Tradefolk Underground",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Coalition of Tradefolk Underground");

  const tunicId = "item:brown-faded-tunic";
  addNode({ id: tunicId, label: "Brown Faded Tunic", type: "item", slots: ["Chest"], classes: ["rogue"], ac: 2, weight: 0.7, lore: true, source: "Guild Summons - Coalition of Tradefolk Underground reward (Elisi Nasin, East Freeport) -- restricted to Rogues of Human or Half-Elf race" });
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Craft Keepers
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const giverId = "npc:erudin:lanken-rjarn";
  addGiver(giverId, "Lanken Rjarn", zoneId);

  const questId = "quest:guild-summons-craft-keepers";
  addNode({
    id: questId,
    label: "Guild Summons - Craft Keepers",
    type: "quest",
    description: "A new Erudite Enchanter of the Craft Keepers Guild receives a note directing them to Lanken Rjarn in Erudin Palace, who trades it for a guild robe.",
    classes: ["enchanter"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Lanken Rjarn at the Craft Keepers guild hall"],
    wiki_title: "Guild Summons - Craft Keepers",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Craft Keepers");

  const robeId = "item:old-patched-robe";
  addNode({ id: robeId, label: "Old Patched Robe", type: "item", slots: ["Chest"], classes: ["enchanter"], ac: 2, weight: 0.7, size: "Medium", lore: true, source: "Guild Summons - Craft Keepers reward (Lanken Rjarn, Erudin) -- restricted to Enchanters of Erudite race" });
  addEdge(questId, robeId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Crimson Hands
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const giverId = "npc:erudin:ghanlin-skyphire";
  addGiver(giverId, "Ghanlin Skyphire", zoneId);

  const questId = "quest:guild-summons-crimson-hands";
  addNode({
    id: questId,
    label: "Guild Summons - Crimson Hands",
    type: "quest",
    description: "A new Erudite Wizard of the Crimson Hands Guild receives a note directing them to Ghanlin Skyphire, Master Wizard of the Crimson Hands, in the Erudin Palace guild tower, who trades it for a guild robe.",
    classes: ["wizard"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Ghanlin Skyphire at the Tower of the Crimson Hands"],
    wiki_title: "Guild Summons - Crimson Hands",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Crimson Hands");

  const robeId = "item:old-used-robe";
  addNode({ id: robeId, label: "Old Used Robe", type: "item", slots: ["Chest"], classes: ["wizard"], ac: 2, weight: 0.7, size: "Medium", lore: true, noTrade: true, source: "Guild Summons - Crimson Hands reward (Ghanlin Skyphire, Erudin) -- restricted to Wizards of Erudite race" });
  addEdge(questId, robeId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Da Bashers
// ---------------------------------------------------------------------
{
  const zoneId = "zone:grobb";
  const giverId = "npc:grobb:ranjor";
  addGiver(giverId, "Ranjor", zoneId);

  const questId = "quest:guild-summons-da-bashers";
  addNode({
    id: questId,
    label: "Guild Summons - Da Bashers",
    type: "quest",
    description: "A new Troll Warrior of the Da Bashers Guild receives a note directing them to Ranjor in Grobb, who trades it for a guild tunic.",
    classes: ["warrior"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Ranjor at the Da Bashers guild hall"],
    wiki_title: "Guild Summons - Da Bashers",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Da Bashers");

  const tunicId = "item:mud-covered-tunic";
  addNode({ id: tunicId, label: "Mud Covered Tunic", type: "item", slots: ["Chest"], classes: ["warrior"], ac: 4, weight: 1.6, size: "Medium", lore: true, source: "Guild Summons - Da Bashers reward (Ranjor, Grobb) -- restricted to Warriors of Troll race" });
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Dark Ones
// ---------------------------------------------------------------------
{
  const zoneId = "zone:grobb";
  const giverId = "npc:grobb:kaglari";
  addGiver(giverId, "Kaglari", zoneId);

  const questId = "quest:guild-summons-dark-ones";
  addNode({
    id: questId,
    label: "Guild Summons - Dark Ones",
    type: "quest",
    description: "A new Troll Shaman of the Dark Ones Guild receives a note directing them to Kaglari in Grobb, who trades it for a guild tunic.",
    classes: ["shaman"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Kaglari at the Dark Ones guild hall"],
    wiki_title: "Guild Summons - Dark Ones",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Dark Ones");

  const tunicId = "item:muck-stained-tunic";
  addNode({ id: tunicId, label: "Muck Stained Tunic", type: "item", slots: ["Chest"], classes: ["shaman"], ac: 2, weight: 1.2, lore: true, source: "Guild Summons - Dark Ones reward (Kaglari, Grobb) -- restricted to Shamans of Troll race" });
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Dark Reflection Cleric
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ak-anon";
  const giverId = "npc:ak-anon:evah-xokez";
  addGiver(giverId, "Evah Xokez", zoneId);

  const tunicId = "item:tin-patched-tunic";
  addNode({ id: tunicId, label: "Tin Patched Tunic", type: "item", slots: ["Chest"], classes: ["cleric", "rogue", "warrior"], ac: 2, weight: 0.8, size: "Small", lore: true, source: "Guild Summons - Dark Reflection Cleric/Rogue/Warrior reward (Ak'Anon) -- restricted to Gnomes of Bertoxxulous" });

  const questId = "quest:guild-summons-dark-reflection-cleric";
  addNode({
    id: questId,
    label: "Guild Summons - Dark Reflection Cleric",
    type: "quest",
    description: "A new Gnome Cleric of Bertoxxulous, in the Dark Reflection Guild, receives a note directing them to Evah Xokez in Ak'Anon, who trades it for a guild tunic.",
    classes: ["cleric"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Evah Xokez in the Mines of Malfunction beneath Ak'Anon"],
    wiki_title: "Guild Summons - Dark Reflection Cleric",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Dark Reflection");
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Dark Reflection Enchanter
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ak-anon";
  const giverId = "npc:ak-anon:rilgor-plegnog";
  addGiver(giverId, "Rilgor Plegnog", zoneId);

  const robeId = "item:dark-gold-felt-robe";
  addNode({ id: robeId, label: "Dark Gold Felt Robe", type: "item", slots: ["Chest"], classes: ["necromancer", "wizard", "magician", "enchanter"], ac: 2, weight: 0.8, size: "Small", lore: true, source: "Guild Summons - Dark Reflection Enchanter/Magician/Necromancer/Wizard reward (Ak'Anon) -- restricted to Gnomes of Bertoxxulous" });

  const questId = "quest:guild-summons-dark-reflection-enchanter";
  addNode({
    id: questId,
    label: "Guild Summons - Dark Reflection Enchanter",
    type: "quest",
    description: "A new Gnome Enchanter of Bertoxxulous, in the Dark Reflection Guild, receives a note directing them to Rilgor Plegnog in the Mines of Malfunction beneath Ak'Anon, who trades it for a guild robe.",
    classes: ["enchanter"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Rilgor Plegnog in the Mines of Malfunction beneath Ak'Anon"],
    wiki_title: "Guild Summons - Dark Reflection Enchanter",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Dark Reflection");
  addEdge(questId, robeId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Dark Reflection Magician
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ak-anon";
  const giverId = "npc:ak-anon:vaenor-husga";
  addGiver(giverId, "Vaenor Husga", zoneId);

  const questId = "quest:guild-summons-dark-reflection-magician";
  addNode({
    id: questId,
    label: "Guild Summons - Dark Reflection Magician",
    type: "quest",
    description: "A new Gnome Magician of Bertoxxulous, in the Dark Reflection Guild, receives a note directing them to Vaenor Husga in the Mines of Malfunction beneath Ak'Anon, who trades it for a guild robe.",
    classes: ["magician"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Vaenor Husga in the Mines of Malfunction beneath Ak'Anon"],
    wiki_title: "Guild Summons - Dark Reflection Magician",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Dark Reflection");
  addEdge(questId, "item:dark-gold-felt-robe", "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Dark Reflection Necromancer
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ak-anon";
  const giverId = "npc:ak-anon:eonis-mournunder";
  addGiver(giverId, "Eonis Mournunder", zoneId);

  const questId = "quest:guild-summons-dark-reflection-necromancer";
  addNode({
    id: questId,
    label: "Guild Summons - Dark Reflection Necromancer",
    type: "quest",
    description: "A new Gnome Necromancer of Bertoxxulous, in the Dark Reflection Guild, receives a note directing them to Eonis Mournunder in Ak'Anon, who trades it for a guild robe.",
    classes: ["necromancer"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Eonis Mournunder in the Mines of Malfunction beneath Ak'Anon"],
    wiki_title: "Guild Summons - Dark Reflection Necromancer",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Dark Reflection");
  addEdge(questId, "item:dark-gold-felt-robe", "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Dark Reflection Rogue
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ak-anon";
  const giverId = "npc:ak-anon:kaxon-frennor";
  addGiver(giverId, "Kaxon Frennor", zoneId);

  const questId = "quest:guild-summons-dark-reflection-rogue";
  addNode({
    id: questId,
    label: "Guild Summons - Dark Reflection Rogue",
    type: "quest",
    description: "A new Gnome Rogue of Bertoxxulous, in the Dark Reflection Guild, receives a note directing them to Kaxon Frennor in the Mines of Malfunction beneath Ak'Anon, who trades it for a guild tunic.",
    classes: ["rogue"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Kaxon Frennor in the Mines of Malfunction beneath Ak'Anon"],
    wiki_title: "Guild Summons - Dark Reflection Rogue",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Dark Reflection");
  addEdge(questId, "item:tin-patched-tunic", "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Dark Reflection Warrior
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ak-anon";
  const giverId = "npc:ak-anon:naygog-mitope";
  addGiver(giverId, "Naygog Mitope", zoneId);

  const questId = "quest:guild-summons-dark-reflection-warrior";
  addNode({
    id: questId,
    label: "Guild Summons - Dark Reflection Warrior",
    type: "quest",
    description: "A new Gnome Warrior of Bertoxxulous, in the Dark Reflection Guild, receives a note directing them to Naygog Mitope in the Mines of Malfunction beneath Ak'Anon, who trades it for a guild tunic.",
    classes: ["warrior"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Naygog Mitope in the Mines of Malfunction beneath Ak'Anon"],
    wiki_title: "Guild Summons - Dark Reflection Warrior",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Dark Reflection");
  addEdge(questId, "item:tin-patched-tunic", "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Dark Reflection Wizard
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ak-anon";
  const giverId = "npc:ak-anon:velena-corgtec";
  addGiver(giverId, "Velena Corgtec", zoneId);

  const questId = "quest:guild-summons-dark-reflection-wizard";
  addNode({
    id: questId,
    label: "Guild Summons - Dark Reflection Wizard",
    type: "quest",
    description: "A new Gnome Wizard of Bertoxxulous, in the Dark Reflection Guild, receives a note directing them to Velena Corgtec in Ak'Anon, who trades it for a guild robe.",
    classes: ["wizard"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Velena Corgtec in the Mines of Malfunction beneath Ak'Anon"],
    wiki_title: "Guild Summons - Dark Reflection Wizard",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Dark Reflection");
  addEdge(questId, "item:dark-gold-felt-robe", "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Deepwater Cleric
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const giverId = "npc:erudin:gans-paust";
  addGiver(giverId, "Gans Paust", zoneId);

  const tunicId = "item:old-blue-tunic";
  addNode({ id: tunicId, label: "Old Blue Tunic", type: "item", slots: ["Chest"], classes: ["cleric", "paladin"], ac: 2, weight: 1.0, size: "Medium", lore: true, source: "Guild Summons - Deepwater Cleric/Paladin reward (Erudin) -- restricted to Clerics/Paladins of Erudite race" });

  const questId = "quest:guild-summons-deepwater-cleric";
  addNode({
    id: questId,
    label: "Guild Summons - Deepwater Cleric",
    type: "quest",
    description: "A new Erudite Cleric of the Deepwater Knights Guild receives a note directing them to Gans Paust in the Deepwater Knights guild hall in Erudin, who trades it for a guild tunic.",
    classes: ["cleric"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Gans Paust at the Deepwater Knights guild hall"],
    wiki_title: "Guild Summons - Deepwater Cleric",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Deepwater Knights");
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Deepwater Paladin
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const giverId = "npc:erudin:weligon-steelherder";
  addGiver(giverId, "Weligon Steelherder", zoneId);

  const questId = "quest:guild-summons-deepwater-paladin";
  addNode({
    id: questId,
    label: "Guild Summons - Deepwater Paladin",
    type: "quest",
    description: "A new Erudite Paladin of the Deepwater Knights Guild receives a note directing them to Weligon Steelherder in Erudin, who trades it for a guild tunic.",
    classes: ["paladin"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Weligon Steelherder at the Deepwater Knights guild hall"],
    wiki_title: "Guild Summons - Deepwater Paladin",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Deepwater Knights");
  addEdge(questId, "item:old-blue-tunic", "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Dismal Rage Cleric
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-freeport";
  const giverId = "npc:east-freeport:venox-tarkog";
  addGiver(giverId, "Venox Tarkog", zoneId);

  const tunicId = "item:faded-crimson-tunic";
  addNode({ id: tunicId, label: "Faded Crimson Tunic", type: "item", slots: ["Chest"], classes: ["warrior", "cleric", "shadow knight"], ac: 2, weight: 1.0, lore: true, source: "Guild Summons - Dismal Rage Cleric/Shadowknight reward (East Freeport) -- restricted to Human or Half-Elf race" });

  const questId = "quest:guild-summons-dismal-rage-cleric";
  addNode({
    id: questId,
    label: "Guild Summons - Dismal Rage Cleric",
    type: "quest",
    description: "A new Human or Half-Elf Cleric of the Dismal Rage Guild receives a note directing them to Venox Tarkog in the Sewers of East Freeport, who trades it for a guild tunic.",
    classes: ["cleric"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Venox Tarkog in the Sewers of East Freeport"],
    wiki_title: "Guild Summons - Dismal Rage Cleric",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Dismal Rage");
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Dismal Rage Enchanter
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-freeport";
  const giverId = "npc:east-freeport:konious-eranon";
  addGiver(giverId, "Konious Eranon", zoneId);

  const robeId = "item:old-stained-robe";
  addNode({ id: robeId, label: "Old Stained Robe", type: "item", slots: ["Chest"], classes: ["necromancer", "wizard", "magician", "enchanter"], ac: 2, weight: 0.7, size: "Medium", lore: true, source: "Guild Summons - Dismal Rage Enchanter/Magician reward (East Freeport) -- restricted to Human race" });

  const questId = "quest:guild-summons-dismal-rage-enchanter";
  addNode({
    id: questId,
    label: "Guild Summons - Dismal Rage Enchanter",
    type: "quest",
    description: "A new Human Enchanter of the Dismal Rage Guild receives a note directing them to Konious Eranon in the Sewers of East Freeport, who trades it for a guild robe.",
    classes: ["enchanter"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Konious Eranon in the Sewers of East Freeport"],
    wiki_title: "Guild Summons - Dismal Rage Enchanter",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Dismal Rage");
  addEdge(questId, robeId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Dismal Rage Magician
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-freeport";
  const giverId = "npc:east-freeport:heneva-jexsped";
  addGiver(giverId, "Heneva Jexsped", zoneId);

  const questId = "quest:guild-summons-dismal-rage-magician";
  addNode({
    id: questId,
    label: "Guild Summons - Dismal Rage Magician",
    type: "quest",
    description: "A new Human Magician of the Dismal Rage Guild receives a note directing them to Heneva Jexsped in the Sewers of East Freeport, who trades it for a guild robe.",
    classes: ["magician"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Heneva Jexsped in the Sewers of East Freeport"],
    wiki_title: "Guild Summons - Dismal Rage Magician",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Dismal Rage");
  addEdge(questId, "item:old-stained-robe", "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Dismal Rage Necromancer
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-freeport";
  const giverId = "npc:east-freeport:opal-darkbriar";
  addGiver(giverId, "Opal Darkbriar", zoneId);

  const questId = "quest:guild-summons-dismal-rage-necromancer";
  addNode({
    id: questId,
    label: "Guild Summons - Dismal Rage Necromancer",
    type: "quest",
    description: "A new Human Necromancer of the Dismal Rage Guild receives a note directing them to Opal Darkbriar in the Sewers of East Freeport, who trades it for a guild robe.",
    classes: ["necromancer"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Opal Darkbriar in the Sewers of East Freeport"],
    wiki_title: "Guild Summons - Dismal Rage Necromancer",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Dismal Rage");

  const robeId = "item:dark-stained-robe";
  addNode({ id: robeId, label: "Dark Stained Robe", type: "item", slots: ["Chest"], classes: ["necromancer", "wizard", "magician", "enchanter"], ac: 2, weight: 0.7, size: "Medium", lore: true, source: "Guild Summons - Dismal Rage Necromancer reward (Opal Darkbriar, East Freeport) -- restricted to Human race" });
  addEdge(questId, robeId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Dismal Rage Shadowknight
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-freeport";
  const giverId = "npc:east-freeport:pietro-zarn";
  addGiver(giverId, "Pietro Zarn", zoneId);

  const questId = "quest:guild-summons-dismal-rage-shadowknight";
  addNode({
    id: questId,
    label: "Guild Summons - Dismal Rage Shadowknight",
    type: "quest",
    description: "A new Human or Half-Elf Shadow Knight of the Dismal Rage Guild receives a note directing them to Pietro Zarn in the Sewers of East Freeport, who trades it for a guild tunic.",
    classes: ["shadow knight"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Pietro Zarn in the Sewers of East Freeport"],
    wiki_title: "Guild Summons - Dismal Rage Shadowknight",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Dismal Rage");
  addEdge(questId, "item:faded-crimson-tunic", "rewards");
}

save();
console.log("Migration 070 complete: added 25 more quests from GitHub issue #26's checklist");
