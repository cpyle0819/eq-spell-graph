/**
 * Migration 095: next standalone batch off GitHub issue #26's checklist --
 * "Thex Dagger Quest" through "Tumpy Tonics". Researched directly against
 * eqlwiki.com, following decisions/eqlwiki-quest-research-method.md.
 *
 * Skipped and tagged (not modeled, per the issue's own guardrail, quoting
 * the wiki's own disclaimer):
 * - Thex Dagger Quest -- wiki's own disclaimer: "THE ARTICLE CONTAINS
 *   NON-LEGENDS CONTENT" / "This quest is 'removed' with the Temple Era
 *   (October 1999)."
 *
 * Trooper Scale Armor turned out to be an 8-piece Warrior armor set with two
 * givers (Xlixinar Arcut: Breastplate/Helm/Pauldron/Vambraces; Drixiv Arcut:
 * Boots/Bracers/Gauntlets/Greaves), each piece its own independent
 * NPC-recommendation-letter turn-in with no ordering between pieces --
 * modeled as a `quest_group` with 8 member sub-quests, same shape as
 * migration 088's Shaman Kael Armor Quests (decisions/quest-group-node-type.md).
 * Doesn't count against the batch's standalone cap per the issue's own
 * guardrail.
 *
 * No new zones needed -- every giver's zone (Rathe Mountains, Ak'Anon, West
 * Commonlands, Befallen, Kael Drakkal, Icewell Keep, Northern Karana, Temple
 * of Solusek Ro, Upper Guk, Paineel, Erudin, West Freeport, Neriak Commons,
 * Halas, South Qeynos, East Freeport, The Overthere, North Kaladim, South
 * Kaladim, Qeynos Aqueducts, Southern Karana, Greater Faydark, Steamfont
 * Mountains, Skyshrine) already exists in the graph.
 *
 * Reused existing item nodes rather than duplicating:
 * - Tinmizer's Fabulous Compactor Quest's reward, Lapis Lazuli, is an exact
 *   stat match (weight 0.1, tiny, no class/race) for the existing
 *   item:lapis-lazuli node (Magic Elixir for the Warriors) -- same reuse
 *   pattern as migration 090/094's other generic-gem/cape reuses.
 *
 * Deliberately NOT modeled as `item` nodes (consistent with prior batches):
 * - Toxdil's Poison's "Snake Venom" reward -- no stat infobox on the page,
 *   described only as a crafted poison reagent.
 *
 * Exclusion-list class/race restrictions resolved to explicit allow-lists
 * per decisions/item-node-schema.md (the wiki states some as "ALL except
 * X"): Watchman Boots (Tiny Skeletons) is race "ALL except IKS"; Bloodforge
 * Hammer (Trumpy Irontoe) is class "ALL except BRD ROG NEC WIZ MAG ENC".
 *
 * Titan Samples (good) has three independent turn-in paths (cat hides,
 * gorilla/panda hides, snake skin) each yielding a different reward --
 * modeled as one quest with three `rewards` edges, same non-random
 * multiple-outcome pattern as migration 094's The Spirit of Garzicor.
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, addFactionReward, addGiver, save, slug } = loadGraph(import.meta.dir);

// ---------------------------------------------------------------------
// Thex Dagger Quest -- SKIPPED, wiki's own disclaimer: "THE ARTICLE
// CONTAINS NON-LEGENDS CONTENT" / "This quest is 'removed' with the
// Temple Era (October 1999)."
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// Thex Mallet Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:neriak-3rd-gate";
  const commonlandsId = "zone:west-commonlands";
  const befallenId = "zone:befallen";
  const giverId = "npc:neriak-3rd-gate:loveal-snez";
  addGiver(giverId, "Loveal S`Nez", zoneId);

  const questId = "quest:thex-mallet-quest";
  addNode({
    id: questId,
    label: "Thex Mallet Quest",
    type: "quest",
    classes: ["shadow knight"],
    minLevel: 1,
    description:
      "Loveal S`Nez in Neriak Third Gate gives a password for Kizdean Gix in West Commonlands, who gives a note for Skeleton Lrodd in Befallen; giving the note spawns Commander Windstream (Mallet Stem) and an Elf Skeleton (Mallet Head, Mallet Hilt), combined into the Reaper of the Dead.",
    steps: [
      "Receive a password from Loveal S`Nez in Neriak Third Gate",
      "Deliver the password to Kizdean Gix in West Commonlands for a note",
      "Give the note to Skeleton Lrodd in Befallen to spawn Commander Windstream",
      "Defeat Commander Windstream for the Mallet Stem",
      "Defeat An Elf Skeleton for the Mallet Head and Mallet Hilt",
      "Combine the three pieces and return the mallet to Loveal S`Nez",
    ],
    wiki_title: "Thex Mallet Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, commonlandsId, "located_in");
  addEdge(questId, befallenId, "located_in");
  addFactionReward(questId, "The Dead");
  addFactionReward(questId, "Queen Cristanos Thex");

  const mallet = "item:reaper-of-the-dead";
  addNode({
    id: mallet,
    label: "Reaper of the Dead",
    type: "item",
    slots: ["Primary"],
    classes: ["shadow knight"],
    race: ["human", "erudite", "dark elf", "troll", "ogre", "gnome", "iksar"],
    skill: "2H Slashing",
    damage: 12,
    delay: 40,
    stats: { str: 4 },
    magic: true,
    lore: true,
    weight: 13.0,
    size: "Large",
    effect: "Promised Renewal (Any Slot, unlimited charges, 2.0 sec cast, 1200 sec cooldown) at Level 45",
    source: "Thex Mallet Quest reward (Loveal S`Nez, Neriak Third Gate)",
  });
  addEdge(questId, mallet, "rewards");
}

// ---------------------------------------------------------------------
// Tibrinn's Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:rathe-mountains";
  const gorgeId = "zone:gorge-of-king-xorbb";
  const giverId = "npc:rathe-mountains:tibrinn-ember";
  addGiver(giverId, "Tibrinn Ember", zoneId);

  const questId = "quest:tibrinns-quest";
  addNode({
    id: questId,
    label: "Tibrinn's Quest",
    type: "quest",
    classes: ["druid"],
    minLevel: 35,
    description:
      "Tibrinn Ember in Rathe Mountains trades a Mithril Plated Girth (Grazhak the Berzerker) and a Slime Crystal Staff (King Xorbb, Gorge of King Xorbb) for the Sap Sheen Staff.",
    steps: [
      "Obtain a Mithril Plated Girth from Grazhak the Berzerker",
      "Obtain a Slime Crystal Staff from King Xorbb in Gorge of King Xorbb",
      "Deliver both items to Tibrinn Ember in Rathe Mountains",
    ],
    wiki_title: "Tibrinn's Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, gorgeId, "located_in");

  const staffId = "item:sap-sheen-staff";
  addNode({
    id: staffId,
    label: "Sap Sheen Staff",
    type: "item",
    slots: ["Primary"],
    classes: ["druid"],
    race: ["human", "wood elf", "half elf", "halfling"],
    skill: "2H Blunt",
    damage: 10,
    delay: 34,
    magic: true,
    lore: true,
    weight: 7.5,
    size: "Large",
    effect: "Root (Combat, instant cast) at Level 18",
    source: "Tibrinn's Quest reward (Tibrinn Ember, Rathe Mountains)",
  });
  addEdge(questId, staffId, "rewards");
}

// ---------------------------------------------------------------------
// Tinmizer's Fabulous Compactor Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ak-anon";
  const giverId = "npc:ak-anon:kozyn-gigglephizz";
  addGiver(giverId, "Kozyn Gigglephizz", zoneId);

  const questId = "quest:tinmizers-fabulous-compactor-quest";
  addNode({
    id: questId,
    label: "Tinmizer's Fabulous Compactor Quest",
    type: "quest",
    minLevel: 7,
    description:
      "Kozyn Gigglephizz at Ak'Anon's entrance takes the defective Tinmizer's Fabulous Compactor (sometimes awarded by the Scrap Metal Quest) off players' hands for a Lapis Lazuli.",
    steps: [
      "Obtain a Tinmizer's Fabulous Compactor (a possible Scrap Metal Quest reward)",
      "Deliver it to Kozyn Gigglephizz at Ak'Anon's entrance",
    ],
    wiki_title: "Tinmizer's Fabulous Compactor (Quest)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "item:lapis-lazuli", "rewards");
}

// ---------------------------------------------------------------------
// Tiny Savages
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const icewellId = "zone:icewell-keep";
  const giverId = "npc:kael-drakkal:yetarr";
  addGiver(giverId, "Yetarr", zoneId);

  const questId = "quest:tiny-savages";
  addNode({
    id: questId,
    label: "Tiny Savages",
    type: "quest",
    minLevel: 1,
    description:
      "Yetarr in Kael Drakkal collects the Head of the Royal Scribe and the Head of the Huntsman from NPCs in Icewell Keep for a choice of Coldain Skin Gloves or Coldain Skin Boots.",
    steps: [
      "Obtain the Head of the Royal Scribe and the Head of the Huntsman in Icewell Keep",
      "Return both heads to Yetarr in Kael Drakkal",
    ],
    wiki_title: "Tiny Savages",
    era: "Velious",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, icewellId, "located_in");
  addFactionReward(questId, "Kromzek");
  addFactionReward(questId, "Kromrif");
  addFactionReward(questId, "King Tormax");
  addFactionReward(questId, "Claws of Veeshan");

  const glovesId = "item:coldain-skin-gloves";
  addNode({
    id: glovesId,
    label: "Coldain Skin Gloves",
    type: "item",
    slots: ["Hands"],
    ac: 12,
    stats: { sta: 9, wis: 6, int: 6 },
    hp: 20,
    mana: 20,
    magic: true,
    weight: 1.5,
    size: "Small",
    source: "Tiny Savages reward (Yetarr, Kael Drakkal)",
  });
  addEdge(questId, glovesId, "rewards");

  const bootsId = "item:coldain-skin-boots";
  addNode({
    id: bootsId,
    label: "Coldain Skin Boots",
    type: "item",
    slots: ["Feet"],
    ac: 3,
    stats: { wis: 8, int: 8 },
    mana: 35,
    magic: true,
    weight: 2.5,
    size: "Small",
    source: "Tiny Savages reward (Yetarr, Kael Drakkal)",
  });
  addEdge(questId, bootsId, "rewards");
}

// ---------------------------------------------------------------------
// Tiny Skeletons
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ak-anon";
  const karanaId = "zone:northern-karana";
  const giverId = "npc:ak-anon:narron-jenork";
  addGiver(giverId, "Narron Jenork", zoneId);

  const questId = "quest:tiny-skeletons";
  addNode({
    id: questId,
    label: "Tiny Skeletons",
    type: "quest",
    minLevel: 1,
    description:
      "Watchman Dexlin, a rare spawn at the bridge tower in Northern Karana, gives a collection box for four Very Tiny Crumpled Skeleton drops (from a tiny skeleton), combined into a Box Full Of Tiny Bones and traded for a Box of Undead Brownie Bones; delivering it to Narron Jenork in Ak'Anon completes the quest.",
    steps: [
      "Hail Watchman Dexlin at the bridge tower in Northern Karana for a collection box",
      "Hunt four \"a tiny skeleton\" for their Very Tiny Crumpled Skeleton drops",
      "Combine the four drops in the box for a Box Full Of Tiny Bones",
      "Return the box to Watchman Dexlin for a Box of Undead Brownie Bones",
      "Deliver the final box to Narron Jenork in Ak'Anon",
    ],
    wiki_title: "Tiny Skeletons",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, karanaId, "located_in");
  addFactionReward(questId, "Gem Choppers");
  addFactionReward(questId, "Merchants of AkAnon");
  addFactionReward(questId, "King AkAnon");
  addFactionReward(questId, "Dark Reflection");

  const bootsId = "item:watchman-boots";
  addNode({
    id: bootsId,
    label: "Watchman Boots",
    type: "item",
    slots: ["Feet"],
    classes: ["warrior", "cleric", "paladin", "ranger", "shadow knight", "bard", "rogue", "shaman"],
    race: ["barbarian", "dark elf", "dwarf", "erudite", "gnome", "half elf", "halfling", "high elf", "human", "ogre", "troll", "wood elf"],
    charges: 1,
    ac: 5,
    stats: { sta: 5 },
    magic: true,
    lore: true,
    weight: 6.5,
    size: "Medium",
    effect: "Spirit of Wolf (Must Equip, instant cast) at Level 10",
    source: "Tiny Skeletons reward (Watchman Dexlin, Northern Karana)",
  });
  addEdge(questId, bootsId, "rewards");
}

// ---------------------------------------------------------------------
// Tishan's Kilt Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:temple-of-solusek-ro";
  const everfrostId = "zone:everfrost-peaks";
  const upperGukId = "zone:upper-guk";
  const giverId = "npc:temple-of-solusek-ro:vilissia";
  addGiver(giverId, "Vilissia", zoneId);

  const questId = "quest:tishans-kilt-quest";
  addNode({
    id: questId,
    label: "Tishan's Kilt Quest",
    type: "quest",
    minLevel: 1,
    description:
      "Vilissia in the Temple of Solusek Ro sends a shadowed ball (from Shadowed Men) to Trankia in Everfrost Mountains, a Barbarian Head (from a froglok shinta warrior, Upper Guk) also to Trankia, and finally requires Martar IceBear's warthread kilt and Trankia's two reminder notes, all returned for Tishan's Kilt.",
    steps: [
      "Take a shadowed ball from Shadowed Men to Trankia in Everfrost Mountains",
      "Obtain a Barbarian Head from a froglok shinta warrior in Upper Guk and return it to Trankia",
      "Kill Martar IceBear for the warthread kilt and Trankia's two reminder notes",
      "Return everything to Vilissia in the Temple of Solusek Ro",
    ],
    wiki_title: "Tishan's Kilt Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, everfrostId, "located_in");
  addEdge(questId, upperGukId, "located_in");

  const kiltId = "item:tishans-kilt";
  addNode({
    id: kiltId,
    label: "Tishan's Kilt",
    type: "item",
    slots: ["Legs"],
    ac: 5,
    stats: { str: 4, sta: 4 },
    hp: 20,
    magic: true,
    lore: true,
    source: "Tishan's Kilt Quest reward (Vilissia, Temple of Solusek Ro)",
  });
  addEdge(questId, kiltId, "rewards");
}

// ---------------------------------------------------------------------
// Titan Samples (evil)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:paineel";
  const giverId = "npc:paineel:sejako-mujan";
  addGiver(giverId, "Sejako Mujan", zoneId);

  const questId = "quest:titan-samples-evil";
  addNode({
    id: questId,
    label: "Titan Samples (evil)",
    type: "quest",
    classes: ["shadow knight", "necromancer"],
    minLevel: 1,
    description:
      "Sejako Mujan in Paineel trades a Gigantic Gorilla Fang, Giant Leopard Fang, Giant Sabertooth Fang, and Ancient Snake Rattle for the Staff of the Moribund Spirits. No coin or faction change.",
    steps: [
      "Collect a Gigantic Gorilla Fang, Giant Leopard Fang, Giant Sabertooth Fang, and Ancient Snake Rattle",
      "Turn them in to Sejako Mujan in Paineel",
    ],
    wiki_title: "Titan Samples (evil)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const staffId = "item:staff-of-the-moribund-spirits";
  addNode({
    id: staffId,
    label: "Staff of the Moribund Spirits",
    type: "item",
    slots: ["Primary"],
    classes: ["shadow knight", "necromancer"],
    skill: "2H Blunt",
    damage: 10,
    delay: 22,
    magic: true,
    lore: true,
    weight: 4.6,
    size: "Large",
    source: "Titan Samples (evil) reward (Sejako Mujan, Paineel)",
  });
  addEdge(questId, staffId, "rewards");
}

// ---------------------------------------------------------------------
// Titan Samples (good)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const giverId = "npc:erudin:akbaq-salid";
  addGiver(giverId, "Akbaq Salid", zoneId);

  const questId = "quest:titan-samples-good";
  addNode({
    id: questId,
    label: "Titan Samples (good)",
    type: "quest",
    minLevel: 1,
    description:
      "Akbaq Salid in the Erudin Wizard guild (requires at least Indifferent faction) offers three independent turn-ins: a Giant White Sabertooth Hide and Giant Leopard Hide for the Astral Cloak of the Titans; a Gigantic Gorilla Hide and Gargantuan Panda Pelt for the Astral Leggings of the Titans; or the Ancient Snake Skin of Slyder the Ancient plus a piece of Platinum Thread for the Scaled Robe of the Elder Serpent.",
    steps: [
      "Reach at least Indifferent faction with Akbaq Salid",
      "Turn in a Giant White Sabertooth Hide and Giant Leopard Hide for the Astral Cloak of the Titans, OR",
      "Turn in a Gigantic Gorilla Hide and Gargantuan Panda Pelt for the Astral Leggings of the Titans, OR",
      "Turn in the Ancient Snake Skin of Slyder the Ancient and a piece of Platinum Thread for the Scaled Robe of the Elder Serpent",
    ],
    wiki_title: "Titan Samples (good)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Crimson Hands");
  addFactionReward(questId, "High Council of Erudin");
  addFactionReward(questId, "Heretics");
  addFactionReward(questId, "High Guard of Erudin");

  const cloakId = "item:astral-cloak-of-the-titans";
  addNode({
    id: cloakId,
    label: "Astral Cloak of the Titans",
    type: "item",
    slots: ["Back"],
    ac: 4,
    stats: { str: -3, int: 9, agi: 6 },
    resists: { magic: -5 },
    magic: true,
    lore: true,
    weight: 1.5,
    size: "Large",
    source: "Titan Samples (good) reward (Akbaq Salid, Erudin)",
  });
  addEdge(questId, cloakId, "rewards");

  const leggingsId = "item:astral-leggings-of-the-titans";
  addNode({
    id: leggingsId,
    label: "Astral Leggings of the Titans",
    type: "item",
    slots: ["Legs"],
    classes: ["necromancer", "wizard", "magician", "enchanter"],
    ac: 5,
    stats: { int: 10, agi: 8 },
    resists: { magic: -5 },
    magic: true,
    lore: true,
    weight: 3.0,
    size: "Medium",
    source: "Titan Samples (good) reward (Akbaq Salid, Erudin)",
  });
  addEdge(questId, leggingsId, "rewards");

  const robeId = "item:scaled-robe-of-the-elder-serpent";
  addNode({
    id: robeId,
    label: "Scaled Robe of the Elder Serpent",
    type: "item",
    slots: ["Chest"],
    classes: ["necromancer", "wizard", "magician", "enchanter"],
    race: ["human", "erudite", "high elf", "dark elf", "gnome", "iksar"],
    ac: 8,
    stats: { str: 4, cha: 9, int: 3 },
    resists: { poison: 15 },
    magic: true,
    lore: true,
    weight: 3.5,
    size: "Medium",
    source: "Titan Samples (good) reward (Akbaq Salid, Erudin)",
  });
  addEdge(questId, robeId, "rewards");
}

// ---------------------------------------------------------------------
// Toko's Head
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ak-anon";
  const oceanId = "zone:ocean-of-tears";
  const giverId = "npc:ak-anon:tergon-brenclog";
  addGiver(giverId, "Tergon Brenclog", zoneId);

  const questId = "quest:tokos-head";
  addNode({
    id: questId,
    label: "Toko's Head",
    type: "quest",
    minLevel: 1,
    description:
      "Tergon Brenclog in Ak'Anon sends players to Seafury Island in the Ocean of Tears to defeat Toko Binlittle, a gnome magician defector, and retrieve his head for the Elemental Grimoire.",
    steps: [
      "Travel to Seafury Island in the Ocean of Tears",
      "Defeat Toko Binlittle and loot his head",
      "Return the head to Tergon Brenclog in Ak'Anon",
    ],
    wiki_title: "Toko's Head",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, oceanId, "located_in");
  addFactionReward(questId, "Eldritch Collective");
  addFactionReward(questId, "Gem Choppers");
  addFactionReward(questId, "King AkAnon");
  addFactionReward(questId, "Dark Reflection");
  addFactionReward(questId, "The Dead");

  const grimoireId = "item:elemental-grimoire";
  addNode({
    id: grimoireId,
    label: "Elemental Grimoire",
    type: "item",
    weight: 0.4,
    capacity: 4,
    containerSize: "Large",
    source: "Toko's Head reward (Tergon Brenclog, Ak'Anon)",
  });
  addEdge(questId, grimoireId, "rewards");
}

// ---------------------------------------------------------------------
// Tome of Ages
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ocean-of-tears";
  const giverId = "npc:ocean-of-tears:oracle-of-karnon";
  addGiver(giverId, "Oracle of K`Arnon", zoneId);

  const questId = "quest:tome-of-ages";
  addNode({
    id: questId,
    label: "Tome of Ages",
    type: "quest",
    minLevel: 1,
    description:
      "The Oracle of K`Arnon in the Ocean of Tears trades a Book of Scale for Miragul's Phylactery.",
    steps: [
      "Obtain a Book of Scale",
      "Deliver it to the Oracle of K`Arnon in the Ocean of Tears",
    ],
    wiki_title: "Tome of Ages",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Oracle Of Karnon");
  addFactionReward(questId, "Oracle Of Marud");

  const phylacteryId = "item:miraguls-phylactery";
  addNode({
    id: phylacteryId,
    label: "Miragul's Phylactery",
    type: "item",
    lore: true,
    noTrade: true,
    weight: 0.5,
    size: "Tiny",
    source: "Tome of Ages reward (Oracle of K`Arnon, Ocean of Tears)",
  });
  addEdge(questId, phylacteryId, "rewards");
}

// ---------------------------------------------------------------------
// Tomer's Rescue
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-qeynos";
  const giverId = "npc:north-qeynos:tomer-instogle";
  addGiver(giverId, "Tomer Instogle", zoneId);

  const questId = "quest:tomers-rescue";
  addNode({
    id: questId,
    label: "Tomer's Rescue",
    type: "quest",
    minLevel: 1,
    description:
      "Tomer Instogle, an injured monk outside Qeynos's western walls, gives players his Ruined Backpack and asks to be led to Seta Bakindo at the Silent Fist Clan guildhouse in North Qeynos; the backpack is returned to Tomer afterward. Not available at Indifferent faction or worse.",
    steps: [
      "Speak to Tomer Instogle outside Qeynos's western walls and receive his Ruined Backpack",
      "Lead Tomer to Seta Bakindo at the Silent Fist Clan guildhouse",
      "Return the backpack to Tomer",
    ],
    wiki_title: "Tomer's Rescue",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Silent Fist Clan");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Ashen Order");
}

// ---------------------------------------------------------------------
// Tonics for Groflah
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-freeport";
  const giverId = "npc:east-freeport:groflah-steadirt";
  addGiver(giverId, "Groflah Steadirt", zoneId);

  const questId = "quest:tonics-for-groflah";
  addNode({
    id: questId,
    label: "Tonics for Groflah",
    type: "quest",
    minLevel: 1,
    description:
      "Groflah Steadirt appears at the Seafarers Roost bar in East Freeport between 9 PM and 9 AM game time and buys Tumpy Tonics (craftable via brewing) for coin.",
    steps: [
      "Craft or obtain Tumpy Tonics",
      "Find Groflah Steadirt at the Seafarers Roost bar (9 PM - 9 AM) in East Freeport",
      "Deliver the tonics for 1-3 gold",
    ],
    wiki_title: "Tonics for Groflah",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Coalition of Tradefolk");
  addFactionReward(questId, "Coalition of Tradefolk Underground");
  addFactionReward(questId, "Knights of Truth");
  addFactionReward(questId, "Merchants of Qeynos");
}

// ---------------------------------------------------------------------
// Torch Of Alna Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:temple-of-solusek-ro";
  const lavastormId = "zone:lavastorm-mountains";
  const solusekEyeId = "zone:solusek-s-eye";
  const najenaId = "zone:najena";
  const giverId = "npc:temple-of-solusek-ro:vira";
  addGiver(giverId, "Vira", zoneId);

  const questId = "quest:torch-of-alna-quest";
  addNode({
    id: questId,
    label: "Torch Of Alna Quest",
    type: "quest",
    classes: ["magician"],
    minLevel: 1,
    description:
      "Vira in the Temple of Solusek Ro collects a Fire Emerald (jewelry merchant), a Fire Drake Scale (fire drakes, Lavastorm Mountains or Solusek's Eye), A Torch (Najena magicians or other creatures), and Fire Giant Toes (fire giants) for the Torch of Alna.",
    steps: [
      "Buy a Fire Emerald from a jewelry merchant",
      "Obtain a Fire Drake Scale from fire drakes in Lavastorm Mountains or Solusek's Eye",
      "Obtain A Torch from Najena magicians or other creatures",
      "Obtain Fire Giant Toes from fire giants",
      "Turn in all four items to Vira in the Temple of Solusek Ro",
    ],
    wiki_title: "Torch Of Alna Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, lavastormId, "located_in");
  addEdge(questId, solusekEyeId, "located_in");
  addEdge(questId, najenaId, "located_in");
  addFactionReward(questId, "Temple Of Sol Ro");
  addFactionReward(questId, "Shadowed Men");

  const torchId = "item:torch-of-alna";
  addNode({
    id: torchId,
    label: "Torch of Alna",
    type: "item",
    slots: ["Primary"],
    classes: ["magician"],
    race: ["human", "erudite", "high elf", "dark elf", "gnome"],
    skill: "1H Blunt",
    damage: 6,
    delay: 25,
    stats: { int: 2 },
    resists: { fire: 5 },
    magic: true,
    lore: true,
    noTrade: true,
    weight: 3.5,
    size: "Large",
    effect: "Reclaim Energy (Any Slot, instant cast) at Level 20; Focus: Minion of Fire",
    source: "Torch Of Alna Quest reward (Vira, Temple of Solusek Ro)",
  });
  addEdge(questId, torchId, "rewards");
}

// ---------------------------------------------------------------------
// Tormax's Head - Dragons
// ---------------------------------------------------------------------
{
  const zoneId = "zone:skyshrine";
  const kaelId = "zone:kael-drakkal";
  const giverId = "npc:skyshrine:lord-yelinak";
  addGiver(giverId, "Lord Yelinak", zoneId);

  const questId = "quest:tormaxs-head-dragons";
  addNode({
    id: questId,
    label: "Tormax's Head - Dragons",
    type: "quest",
    minLevel: 1,
    description:
      "Lord Yelinak in Skyshrine trades King Tormax's Head (Kael Drakkal), at Amiable or better faction, for a choice of the Clawed Griffin Sword, White Dragonscale Boots, or White Dragon Helm.",
    steps: [
      "Reach at least Amiable faction with Lord Yelinak",
      "Obtain King Tormax's Head from Kael Drakkal",
      "Hand it to Lord Yelinak in Skyshrine for a choice of reward",
    ],
    wiki_title: "Tormax's Head - Dragons",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, kaelId, "located_in");
  addFactionReward(questId, "Claws of Veeshan");
  addFactionReward(questId, "Yelinak");
  addFactionReward(questId, "King Tormax");

  const swordId = "item:clawed-griffin-sword";
  addNode({
    id: swordId,
    label: "Clawed Griffin Sword",
    type: "item",
    slots: ["Primary"],
    classes: ["warrior", "paladin", "ranger", "shadow knight"],
    stats: { str: 10, dex: 15 },
    hp: 70,
    magic: true,
    lore: true,
    noTrade: true,
    weight: 1.5,
    size: "Medium",
    source: "Tormax's Head - Dragons reward (Lord Yelinak, Skyshrine)",
  });
  addEdge(questId, swordId, "rewards");

  const bootsId = "item:white-dragonscale-boots";
  addNode({
    id: bootsId,
    label: "White Dragonscale Boots",
    type: "item",
    slots: ["Feet"],
    classes: ["cleric", "druid", "shaman", "necromancer", "wizard", "magician", "enchanter"],
    stats: { wis: 17, int: 17 },
    hp: 85,
    mana: 110,
    magic: true,
    lore: true,
    noTrade: true,
    weight: 1.5,
    size: "Small",
    source: "Tormax's Head - Dragons reward (Lord Yelinak, Skyshrine)",
  });
  addEdge(questId, bootsId, "rewards");

  const helmId = "item:white-dragon-helm";
  addNode({
    id: helmId,
    label: "White Dragon Helm",
    type: "item",
    slots: ["Head"],
    stats: { str: 10, dex: 15, sta: 12 },
    hp: 100,
    magic: true,
    lore: true,
    weight: 1.5,
    size: "Small",
    source: "Tormax's Head - Dragons reward (Lord Yelinak, Skyshrine)",
  });
  addEdge(questId, helmId, "rewards");
}

// ---------------------------------------------------------------------
// Tormax's Head - Dwarves
// ---------------------------------------------------------------------
{
  const zoneId = "zone:icewell-keep";
  const kaelId = "zone:kael-drakkal";
  const giverId = "npc:icewell-keep:dain-frostreaver-iv";
  addGiver(giverId, "Dain Frostreaver IV", zoneId);

  const questId = "quest:tormaxs-head-dwarves";
  addNode({
    id: questId,
    label: "Tormax's Head - Dwarves",
    type: "quest",
    minLevel: 1,
    description:
      "Dain Frostreaver IV in Icewell Keep trades King Tormax's Head (Kael Drakkal), at Kindly or better faction, for the Tri-Plated Golden Hackle Hammer.",
    steps: [
      "Reach at least Kindly faction with Dain Frostreaver IV",
      "Obtain King Tormax's Head from Kael Drakkal",
      "Hand it to Dain Frostreaver IV in Icewell Keep",
    ],
    wiki_title: "Tormax's Head - Dwarves",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, kaelId, "located_in");
  addFactionReward(questId, "Dain Frostreaver IV");
  addFactionReward(questId, "Coldain");
  addFactionReward(questId, "King Tormax");

  const hammerId = "item:tri-plated-golden-hackle-hammer";
  addNode({
    id: hammerId,
    label: "Tri-Plated Golden Hackle Hammer",
    type: "item",
    slots: ["Primary", "Secondary"],
    classes: [
      "warrior", "cleric", "paladin", "ranger", "shadow knight", "druid",
      "monk", "bard", "rogue", "shaman", "necromancer", "wizard", "magician", "enchanter",
    ],
    skill: "1H Blunt",
    damage: 14,
    delay: 24,
    stats: { str: 10, wis: 13, int: 13 },
    mana: 25,
    resists: { fire: 5, disease: 5, cold: 5, magic: 5, poison: 5 },
    magic: true,
    lore: true,
    noTrade: true,
    weight: 2.0,
    size: "Tiny",
    effect: "Arch Shielding (Any Slot, 0.1 sec cast) at Level 50",
    source: "Tormax's Head - Dwarves reward (Dain Frostreaver IV, Icewell Keep)",
  });
  addEdge(questId, hammerId, "rewards");
}

// ---------------------------------------------------------------------
// Toxdil's Poison
// ---------------------------------------------------------------------
{
  const zoneId = "zone:west-freeport";
  const commonlandsId = "zone:east-commonlands";
  const giverId = "npc:west-freeport:toxdil";
  addGiver(giverId, "Toxdil", zoneId);

  const questId = "quest:toxdils-poison";
  addNode({
    id: questId,
    label: "Toxdil's Poison",
    type: "quest",
    minLevel: 1,
    description:
      "Toxdil, a Teir`Dal poison vendor in West Freeport, crafts two snake venom sacs (from giant snakes in the Commonlands) plus a 20 gold fee into Snake Venom. No faction hits.",
    steps: [
      "Collect two snake venom sacs from giant snakes in the Commonlands",
      "Give the sacs and 20 gold to Toxdil in West Freeport",
    ],
    wiki_title: "Toxdil's Poison",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, commonlandsId, "located_in");
}

// ---------------------------------------------------------------------
// Track, Stalk, Hunt
// ---------------------------------------------------------------------
{
  const zoneId = "zone:neriak-commons";
  const giverId = "npc:neriak-commons:vexia-dynth";
  addGiver(giverId, "Vexia D`Ynth", zoneId);

  const questId = "quest:track-stalk-hunt";
  addNode({
    id: questId,
    label: "Track, Stalk, Hunt",
    type: "quest",
    minLevel: 1,
    description:
      "Vexia D`Ynth in Neriak Commons collects four each of Garter Snake Tongue, Spider Venom Sac, Wolf Meat, Bone Chips, and Giant Bat Fur; individual turn-ins can be completed separately rather than all at once.",
    steps: [
      "Collect four each of Garter Snake Tongue, Spider Venom Sac, Wolf Meat, Bone Chips, and Giant Bat Fur",
      "Turn in each set to Vexia D`Ynth in Neriak Commons",
    ],
    wiki_title: "Track, Stalk, Hunt",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Dread Slayers");
  addFactionReward(questId, "Indigo Brotherhood");
  addFactionReward(questId, "Dreadguard Outer");
  addFactionReward(questId, "Dreadguard Inner");
  addFactionReward(questId, "Guardians of the Vale");
  addFactionReward(questId, "Wolves of the North");
}

// ---------------------------------------------------------------------
// Tribunal Healing
// ---------------------------------------------------------------------
{
  const zoneId = "zone:halas";
  const giverId = "npc:halas:waltor-felligan";
  addGiver(giverId, "Waltor Felligan", zoneId);

  const questId = "quest:tribunal-healing";
  addNode({
    id: questId,
    label: "Tribunal Healing",
    type: "quest",
    minLevel: 1,
    description:
      "Waltor Felligan in Halas heals players for 10 gold coins on request; no faction change.",
    steps: ["Pay Waltor Felligan 10 gold and ask to be healed"],
    wiki_title: "Tribunal Healing",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Tribunal Initiate
// ---------------------------------------------------------------------
{
  const zoneId = "zone:halas";
  const southQeynosId = "zone:south-qeynos";
  const giverId = "npc:halas:jinkus-felligan";
  addGiver(giverId, "Jinkus Felligan", zoneId);

  const questId = "quest:tribunal-initiate";
  addNode({
    id: questId,
    label: "Tribunal Initiate",
    type: "quest",
    classes: ["shaman"],
    race: ["barbarian"],
    minLevel: 1,
    description:
      "Jinkus Felligan in Halas collects a Mammoth Hide Parchment (Cindl at Mac's Kilts) and Vial of Datura Ink (Greta Terrilon near McDaniels Smokes & Spirits), then a Wanted Poster delivered to Dun at the South Qeynos bank returns as a List of Qeynos Most Wanted, for the Initiate Symbol of the Tribunal.",
    steps: [
      "Obtain a Mammoth Hide Parchment from Cindl at Mac's Kilts",
      "Obtain a Vial of Datura Ink from Greta Terrilon near McDaniels Smokes & Spirits",
      "Return both items to Jinkus Felligan",
      "Deliver a Wanted Poster to Dun at the bank in South Qeynos",
      "Return the List of Qeynos Most Wanted to Jinkus Felligan",
    ],
    wiki_title: "Tribunal Initiate",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, southQeynosId, "located_in");
  addFactionReward(questId, "Shamen of Justice");
  addFactionReward(questId, "Merchants of Halas");
  addFactionReward(questId, "Wolves of the North");
  addFactionReward(questId, "Steel Warriors");
  addFactionReward(questId, "Circle Of Unseen Hands");
  addFactionReward(questId, "Coalition of Tradefolk Underground");
  addFactionReward(questId, "Ebon Mask");
  addFactionReward(questId, "Rogues of the White Rose");

  const symbolId = "item:initiate-symbol-of-the-tribunal";
  addNode({
    id: symbolId,
    label: "Initiate Symbol of the Tribunal",
    type: "item",
    slots: ["Neck"],
    classes: ["shaman"],
    race: ["barbarian"],
    deity: ["The Tribunal"],
    ac: 3,
    stats: { wis: 1 },
    mana: 3,
    magic: true,
    lore: true,
    noTrade: true,
    weight: 0.1,
    size: "Tiny",
    effect: "Hammer of Wrath (Must Equip, 6.0 sec cast)",
    source: "Tribunal Initiate reward (Jinkus Felligan, Halas)",
  });
  addEdge(questId, symbolId, "rewards");
}

// ---------------------------------------------------------------------
// Trooper Scale Armor (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:the-overthere";
  const drixivId = "npc:the-overthere:drixiv-arcut";
  const xlixinarId = "npc:the-overthere:xlixinar-arcut";
  addGiver(drixivId, "Drixiv Arcut", zoneId);
  addGiver(xlixinarId, "Xlixinar Arcut", zoneId);

  const groupId = "quest_group:trooper-scale-armor";
  addNode({
    id: groupId,
    label: "Trooper Scale Armor",
    type: "quest_group",
    classes: ["warrior"],
    description:
      "Xlixinar Arcut and Drixiv Arcut, on Legion of Cabilis faction at the southeast tip of The Overthere's chasm, trade a Banded armor piece plus a helper NPC's recommendation letter (itself earned by delivering specific items/gemstones to that helper) for its Trooper Scale Armor counterpart. Eight independent sub-quests, no ordering between them; full set bonus 105 AC, +13 STA, +16 STR, +8 DEX, +8 AGI, +5 CHA, +5 WIS, +4 INT, +45 HP, +5 SV DISEASE, +5 SV POISON, +9 SV MAGIC, +2 SV COLD, +2 SV FIRE. Stated minimum level range 20-45.",
    minLevel: 20,
    wiki_title: "Trooper Scale Armor",
  });
  addEdge(drixivId, groupId, "starts");
  addEdge(xlixinarId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const pieces = [
    {
      label: "Boots", giver: drixivId, base: "Banded Boots",
      recommendation: "Master Rixiz (give him Snaorf's Medallion and 2 Fire Emeralds)",
      reward: "Trooper Scale Boots", slots: ["Feet"],
      ac: 11, stats: { cha: 5, agi: 5 }, resists: { disease: 3, poison: 3 }, weight: 4.0,
    },
    {
      label: "Bracers", giver: drixivId, base: "Banded Bracer",
      recommendation: "Arch Duke Xog (give him Traitor's Heart and 2 Sapphires)",
      reward: "Trooper Scale Bracers", slots: ["Wrist"],
      ac: 9, stats: { dex: 2, sta: 4, int: 2 }, weight: 1.5,
    },
    {
      label: "Gauntlets", giver: drixivId, base: "Banded Gauntlets",
      recommendation: "Arch Duke Xog (give him Head of Blackhand and 2 Star Rubies)",
      reward: "Trooper Scale Gauntlets", slots: ["Hands"],
      ac: 11, stats: { str: 5, dex: 2 }, weight: 2.5,
    },
    {
      label: "Greaves", giver: drixivId, base: "Banded Leggings",
      recommendation: "Master Xydoz (give him Iron Bound Tome and 2 Star Rubies)",
      reward: "Trooper Scale Greaves", slots: ["Legs"],
      ac: 12, stats: { str: 2, agi: 3 }, resists: { fire: 2, cold: 2 }, weight: 5.0,
    },
    {
      label: "Breastplate", giver: xlixinarId, base: "Banded Mail",
      recommendation: "Grik the Exile (give him Straeven's Head and 3 Rubies, after triggering Straeven's appearance via Vekis and Daelione's Implant)",
      reward: "Trooper Scale Breastplate", slots: ["Chest"],
      ac: 20, stats: { sta: 5 }, hp: 25, resists: { magic: 5 }, weight: 7.0,
    },
    {
      label: "Helm", giver: xlixinarId, base: "Banded Helm",
      recommendation: "Master Glox (give him a tiny collar and 2 Star Rubies)",
      reward: "Trooper Scale Helm", slots: ["Head"],
      ac: 12, stats: { str: 5, wis: 5 }, resists: { magic: 2 }, weight: 3.5,
    },
    {
      label: "Pauldron", giver: xlixinarId, base: "Banded Mantle",
      recommendation: "Prime Hierophant Vek (give him Froglok Goo and 2 Fire Emeralds)",
      reward: "Trooper Scale Pauldron", slots: ["Shoulders"],
      ac: 10, stats: { str: 2 }, hp: 20, resists: { magic: 2 }, weight: 3.0,
    },
    {
      label: "Vambraces", giver: xlixinarId, base: "Banded Sleeves",
      recommendation: "Prime Hierophant Vek (give him a Diseased Tongue, Sapphire, Opal, and Hierophant's Knife)",
      reward: "Trooper Scale Vambraces", slots: ["Arms"],
      ac: 11, stats: { str: 2, dex: 2 }, resists: { disease: 2, poison: 2 }, weight: 3.0,
    },
  ] as const;

  for (const piece of pieces) {
    const questId = `quest:trooper-scale-armor-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `Trooper Scale Armor: ${piece.label}`,
      type: "quest",
      classes: ["warrior"],
      minLevel: 20,
      description: `Earn a recommendation from ${piece.recommendation}, then trade it with a ${piece.base} to ${piece.giver === drixivId ? "Drixiv Arcut" : "Xlixinar Arcut"} at The Overthere for the ${piece.reward}.`,
      steps: [`Earn a recommendation from ${piece.recommendation}`, `Turn in the recommendation and a ${piece.base} to ${piece.giver === drixivId ? "Drixiv Arcut" : "Xlixinar Arcut"}`],
      wiki_title: "Trooper Scale Armor",
    });
    addEdge(piece.giver, questId, "starts");
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
      lore: piece.label !== "Bracers",
      ac: piece.ac,
      ...("stats" in piece ? { stats: piece.stats } : {}),
      ...("hp" in piece ? { hp: piece.hp } : {}),
      ...("resists" in piece ? { resists: piece.resists } : {}),
      weight: piece.weight,
      source: `Trooper Scale Armor: ${piece.label} reward (${piece.giver === drixivId ? "Drixiv Arcut" : "Xlixinar Arcut"}, The Overthere)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// ---------------------------------------------------------------------
// Trueshot Longbow Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:greater-faydark";
  const northKaladimId = "zone:north-kaladim";
  const westFreeportId = "zone:west-freeport";
  const steamfontId = "zone:steamfont-mountains";
  const giverId = "npc:greater-faydark:maesyn-trueshot";
  addGiver(giverId, "Maesyn Trueshot", zoneId);

  const questId = "quest:trueshot-longbow-quest";
  addNode({
    id: questId,
    label: "Trueshot Longbow Quest",
    type: "quest",
    classes: ["ranger"],
    minLevel: 8,
    description:
      "Maesyn Trueshot in Kelethin sends players to trade Tumpy Tonics to Trantor Everhot (North Kaladim) for Dwarven Wire, a Small Lantern to Jyle Windshot (West Freeport) for Treant Wood, Spiderling Silk from spiderlings, and Micro Servos from Rogue Clockworks (Steamfont Mountains); the gathered materials combine into a Material Pack, returned for a Pack of Materials, then fletched into the Trueshot Longbow.",
    steps: [
      "Trade Tumpy Tonics to Trantor Everhot in North Kaladim for Dwarven Wire (repeat for a second wire)",
      "Buy a Small Lantern and trade it to Jyle Windshot in West Freeport for Treant Wood",
      "Collect Spiderling Silk from spiderlings",
      "Collect Micro Servos from Rogue Clockworks in Steamfont Mountains",
      "Combine the Dwarven Wire, Wooden Shards, Spiderling Silk, and Micro Servo in a Material Pack",
      "Return the Pack of Materials to Maesyn Trueshot",
      "Use a Fletching Kit to combine Treant Bow Staff, Micro Servo, Dwarven Wire, and Planing Tool",
    ],
    wiki_title: "Trueshot Longbow Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, northKaladimId, "located_in");
  addEdge(questId, westFreeportId, "located_in");
  addEdge(questId, steamfontId, "located_in");
  addFactionReward(questId, "Faydarks Champions");
  addFactionReward(questId, "King Tearis Thex");
  addFactionReward(questId, "Clerics of Tunare");
  addFactionReward(questId, "Soldiers of Tunare");

  const bowId = "item:trueshot-longbow";
  addNode({
    id: bowId,
    label: "Trueshot Longbow",
    type: "item",
    slots: ["Range"],
    classes: ["ranger"],
    race: ["human", "wood elf", "half elf", "halfling"],
    skill: "Archery",
    damage: 20,
    delay: 45,
    lore: true,
    weight: 3.0,
    size: "Large",
    source: "Trueshot Longbow Quest reward (Maesyn Trueshot, Greater Faydark)",
  });
  addEdge(questId, bowId, "rewards");
}

// ---------------------------------------------------------------------
// Trumpy Irontoe
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-kaladim";
  const southQeynosId = "zone:south-qeynos";
  const giverId = "npc:south-kaladim:byzar-bloodforge";
  addGiver(giverId, "Byzar Bloodforge", zoneId);

  const questId = "quest:trumpy-irontoe";
  addNode({
    id: questId,
    label: "Trumpy Irontoe",
    type: "quest",
    minLevel: 10,
    description:
      "Byzar Bloodforge in South Kaladim, at Amiable or better faction, sends players to South Qeynos to find Trumpy Irontoe at the Fish's Ale, provoke him with mention of Sragg, defeat him, and return his head for the Bloodforge Hammer.",
    steps: [
      "Reach at least Amiable faction with Byzar Bloodforge",
      "Travel to the Fish's Ale in South Qeynos and speak to Trumpy Irontoe about Sragg",
      "Defeat Trumpy Irontoe",
      "Return his head to Byzar Bloodforge in South Kaladim",
    ],
    wiki_title: "Trumpy Irontoe",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, southQeynosId, "located_in");
  addFactionReward(questId, "Citizens of Qeynos");
  addFactionReward(questId, "Merchants of Qeynos");
  addFactionReward(questId, "Storm Guard");
  addFactionReward(questId, "Kazon Stormhammer");
  addFactionReward(questId, "Miners Guild 249");
  addFactionReward(questId, "Merchants of Kaladim");
  addFactionReward(questId, "Circle Of Unseen Hands");
  addFactionReward(questId, "Corrupt Qeynos Guards");
  addFactionReward(questId, "Kane Bayle");
  addFactionReward(questId, "Craknek Warriors");

  const hammerId = "item:bloodforge-hammer";
  addNode({
    id: hammerId,
    label: "Bloodforge Hammer",
    type: "item",
    slots: ["Primary"],
    classes: [
      "warrior", "cleric", "paladin", "ranger", "shadow knight", "druid",
      "monk", "shaman", "beastlord", "berserker",
    ],
    skill: "2H Blunt",
    damage: 13,
    delay: 50,
    resists: { magic: 10 },
    magic: true,
    lore: true,
    weight: 10.0,
    size: "Large",
    source: "Trumpy Irontoe reward (Byzar Bloodforge, South Kaladim)",
  });
  addEdge(questId, hammerId, "rewards");
}

// ---------------------------------------------------------------------
// Trumpy's Head
// ---------------------------------------------------------------------
{
  const zoneId = "zone:qeynos-aqueducts";
  const southQeynosId = "zone:south-qeynos";
  const southernKaranaId = "zone:southern-karana";
  const giverId = "npc:qeynos-aqueducts:kurne-rextula";
  addGiver(giverId, "Kurne Rextula", zoneId);

  const questId = "quest:trumpys-head";
  addNode({
    id: questId,
    label: "Trumpy's Head",
    type: "quest",
    minLevel: 1,
    description:
      "Kurne Rextula in Qeynos Aqueducts sends players to defeat Trumpy Irontoe (Fish's Ale, South Qeynos) and deliver his head to Lord Grimrot in Southern Karana for the resulting skull, coin, and an occasional nice item.",
    steps: [
      "Defeat Trumpy Irontoe at the Fish's Ale in South Qeynos and loot his head",
      "Deliver the head to Lord Grimrot in Southern Karana for a skull",
      "Return the skull to Kurne Rextula in Qeynos Aqueducts",
    ],
    wiki_title: "Trumpy's Head",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, southQeynosId, "located_in");
  addEdge(questId, southernKaranaId, "located_in");
  addFactionReward(questId, "Bloodsabers");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Opal Dark Briar");
  addFactionReward(questId, "Priests of Life");
  addFactionReward(questId, "Corrupt Qeynos Guards");
  addFactionReward(questId, "Merchants of Qeynos");
  addFactionReward(questId, "Circle Of Unseen Hands");
  addFactionReward(questId, "Kane Bayle");
}

// ---------------------------------------------------------------------
// Tumpy Tonics
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-kaladim";
  const giverId = "npc:north-kaladim:trantor-everhot";
  addGiver(giverId, "Trantor Everhot", zoneId);

  const questId = "quest:tumpy-tonics";
  addNode({
    id: questId,
    label: "Tumpy Tonics",
    type: "quest",
    minLevel: 1,
    description:
      "Trantor Everhot in North Kaladim needs 2 Tumpy Tonics -- each made by trading a Kiola Nut (bought from Cleonae Kalen) and a Water Flask to Tumpy Irontoe -- for a piece of Dwarven Wire.",
    steps: [
      "Buy a Kiola Nut from Cleonae Kalen",
      "Trade the Kiola Nut and a Water Flask to Tumpy Irontoe for a Tumpy Tonic",
      "Repeat to obtain 2 unstacked Tumpy Tonics",
      "Hand both tonics to Trantor Everhot in North Kaladim",
    ],
    wiki_title: "Tumpy Tonics",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Storm Guard");
  addFactionReward(questId, "Kazon Stormhammer");
  addFactionReward(questId, "Miners Guild 249");
  addFactionReward(questId, "Merchants of Kaladim");
  addFactionReward(questId, "Craknek Warriors");

  const wireId = "item:dwarven-wire";
  addNode({
    id: wireId,
    label: "Dwarven Wire",
    type: "item",
    noTrade: true,
    weight: 1.0,
    size: "Tiny",
    source: "Tumpy Tonics reward (Trantor Everhot, North Kaladim)",
  });
  addEdge(questId, wireId, "rewards");
}

save();

console.log(
  "Migration 095 complete: added 23 standalone quests from GitHub issue #26's checklist (Thex Mallet Quest through Tumpy Tonics); modeled Trooper Scale Armor as an 8-piece quest_group; reused item:lapis-lazuli for Tinmizer's Fabulous Compactor Quest; skipped Thex Dagger Quest (non-Legends content)."
);
