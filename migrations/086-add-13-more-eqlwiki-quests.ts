/**
 * Migration 086: 13 more quests off GitHub issue #26's checklist -- the
 * "Red Dragonscale Armor Quest" through "Rognarog's Head" run (plus Spirit
 * Wracked Cord Quest, pulled forward from the S section since it's the
 * direct sequel to Regal Band of Bathezid Quest). Researched directly
 * against eqlwiki.com, following decisions/eqlwiki-quest-research-method.md.
 *
 * `quest --requires--> quest` (decisions/quest-prerequisite-requires-edge.md):
 * Spirit Wracked Cord Quest requires Regal Band of Bathezid Quest -- Queen
 * Velazul Di`zok's turn-in explicitly asks for the finished ring from the
 * earlier quest, not just its own ingredients. Just the two ordinary quest
 * nodes plus one edge, no new node type.
 *
 * Deferred, not modeled (per the issue's own guardrail: a standalone
 * checklist entry that turns out to be part of a bigger cluster gets
 * deferred, not modeled piecemeal):
 * - Request of the Arcane, Request of the Strong -- both are Lendiniara the
 *   Keeper's tear-turn-in offers in Temple of Veeshan (caster vs. melee
 *   split), the same mechanic the issue's own Questlines section already
 *   flags as "Dozekar Tear Quests (~15 independent parallel turn-in
 *   chains... segregated by caster/melee/all class groups)". Modeling just
 *   these 2 of ~15 sibling chains now would be a partial, inconsistent cut
 *   of a cluster that already has its own deferred-cluster entry awaiting a
 *   dedicated pass.
 *
 * Skipped and tagged broken (not modeled, per the issue's own guardrail):
 * - Respecialization -- eqlwiki.com's own page opens with "THIS QUEST HAS
 *   BEEN REMOVED FROM EQL, YOU CAN NOT DO THIS QUEST TO RE-SPECIALIZE."
 *
 * Deliberately NOT modeled (consistent with every migration so far):
 * - Negative faction changes throughout (decisions/quest-reward-modeling.md
 *   only models positive rewards): Red Wine to Lady Shae's Indigo
 *   Brotherhood loss, Red V Clockwork's Dark Reflection/Clan Grikbar loss,
 *   Reinforcements for The Tunarean Regiment's Claws of Veeshan/Coldain
 *   loss, Ridossan's Spirit's Kejek Village/Peace Keepers/Deepwater
 *   Knights/Gate Callers/Craftkeepers/Crimson Hands loss, Robe of the
 *   Elements' and Rod of Insidious Glamour's Shadowed Men loss, Reserve
 *   Militia's Knights of Truth/Priests of Marr loss.
 * - Coin rewards throughout (Red Dragonscale Armor Quest's 1000pp cost,
 *   Rognarog's Head and Reinforcements' minor-coin reward option) -- no
 *   coin field on `quest` nodes.
 * - Faction/level *requirements* modeled as rewards: Red Dragonscale Armor
 *   Quest's indifferent+ gate, Regal Band of Bathezid's Ally-with-Di'Zok
 *   gate, Spirit Wracked Cord's Ally gate, Reserve Militia's amiable+ gate,
 *   Ridossan's Spirit's amiable+ gate -- these are prerequisites, not
 *   rewards, and stay prose-only in `description`.
 * - Reebo's Carrots' unnamed vendor rewards, Red V Clockwork's "miscellaneous
 *   small patchwork armor or potions" -- no fixed item named to model.
 * - Reinforcements' "Militia Armory Token from Guard Valon's quest"
 *   dependency and Reserve Militia's identically-sourced token -- the exact
 *   Guard Valon quest isn't confirmed by name against an existing graph
 *   node, so no `requires` edge; stays prose-only.
 * - Rod of Insidious Glamour's Golden Rod source (a froglok priest in Upper
 *   Guk) and Renew Bones' Plains Pebble source ("Plains of Karana", which
 *   Karana zone isn't specified) -- Upper Guk gets a `located_in` edge since
 *   it's specifically named; the unspecified Karana zone doesn't.
 *
 * Random-choice reward (decisions/quest-reward-modeling.md's `randomGroup`):
 * - Red V Clockwork's Bull Smasher / Iony's Absorber ("Rewards (random)").
 * Real choice, not a random draw -- modeled as ordinary guaranteed
 * `rewards` edges, same treatment as migration 062's Bladed Weapons:
 * - Reinforcements' Collar of the Storm / Girdle of Reflection / Helssen's
 *   Prismatic Trinket, plus its Enchanted Velium Mask / Velium Studded
 *   Cloak intermediate rewards.
 * - Rognarog's Head's Titan Blessed Bokken / Tachi / Tanto.
 *
 * Reused existing node: Renew Bones Quest's reward is the spell
 * `spell:renew-bones`, already in the graph (no new spell node needed).
 *
 * No new zone stubs needed -- every zone touched (Rathe Mountains, Ak'Anon,
 * West Freeport, Rivervale, Chardok, Kael Drakkal, West Cabilis, Temple of
 * Solusek Ro, Stonebrunt Mountains, The Wakening Land, Iceclad Ocean,
 * Thurgadin, Dreadlands, The Overthere, Burning Wood, Dalnir, Upper Guk,
 * Neriak 3rd Gate, Temple of Cazic Thule) already exists in the graph.
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, addFactionReward, addGiver, slug, save } = loadGraph(import.meta.dir);

// ---------------------------------------------------------------------
// Red Dragonscale Armor Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:rathe-mountains";
  const giverId = "npc:rathe-mountains:karam-dragonforge";
  addGiver(giverId, "Karam Dragonforge", zoneId);

  const questId = "quest:red-dragonscale-armor-quest";
  addNode({
    id: questId,
    label: "Red Dragonscale Armor Quest",
    type: "quest",
    description:
      "Karam Dragonforge in Rathe Mountains trades Red Dragon Scales (from Lord Nagafen or Talendor), a vendor-bought Vial of Swirling Smoke, and 1000 platinum for a piece of Red Dragonscale Armor. Multiquestable. Indifferent faction or better required. All classes.",
    minLevel: 45,
    steps: [
      "Obtain Red Dragon Scales from Lord Nagafen or Talendor",
      "Buy a Vial of Swirling Smoke from a vendor",
      "Hand the scales, vial, and 1000 platinum to Karam Dragonforge in Rathe Mountains",
    ],
    wiki_title: "Red Dragonscale Armor Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const armorId = "item:red-dragonscale-armor";
  addNode({
    id: armorId,
    label: "Red Dragonscale Armor",
    type: "item",
    slots: ["Chest"],
    magic: true,
    ac: 21,
    stats: { str: 20 },
    resists: { fire: 1, magic: 1 },
    source: "Red Dragonscale Armor Quest reward (Karam Dragonforge, Rathe Mountains)",
  });
  addEdge(questId, armorId, "rewards");
}

// ---------------------------------------------------------------------
// Red V Clockwork
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ak-anon";
  const giverId = "npc:ak-anon:manik-compolten";
  addGiver(giverId, "Manik Compolten", zoneId);

  const questId = "quest:red-v-clockwork";
  addNode({
    id: questId,
    label: "Red V Clockwork",
    type: "quest",
    description:
      "Manik Compolten in Ak'Anon sends players after Red V and obsolete clockwork models in the Mines of Malfunction for 4 blackbox fragments, assembled into a Rusted Blackbox and turned in for a random reward. Faction gains with King Ak'Anon, Merchants of Ak'Anon, and Gem Choppers. All classes.",
    minLevel: 8,
    steps: [
      "Hunt Red V and obsolete clockwork models in the Mines of Malfunction for 4 blackbox fragments",
      "Assemble the fragments into a Rusted Blackbox",
      "Turn the Rusted Blackbox in to Manik Compolten in Ak'Anon",
    ],
    wiki_title: "Red V Clockwork",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "King AkAnon");
  addFactionReward(questId, "Merchants of AkAnon");
  addFactionReward(questId, "Gem Choppers");

  const smasherId = "item:bull-smasher";
  addNode({
    id: smasherId,
    label: "Bull Smasher",
    type: "item",
    slots: ["Primary"],
    source: "Red V Clockwork reward (Manik Compolten, Ak'Anon)",
  });
  addEdge(questId, smasherId, "rewards", { randomGroup: "red-v-clockwork-reward" });

  const absorberId = "item:ionys-absorber";
  addNode({
    id: absorberId,
    label: "Iony's Absorber",
    type: "item",
    slots: ["Secondary"],
    source: "Red V Clockwork reward (Manik Compolten, Ak'Anon)",
  });
  addEdge(questId, absorberId, "rewards", { randomGroup: "red-v-clockwork-reward" });
}

// ---------------------------------------------------------------------
// Red Wine to Lady Shae
// ---------------------------------------------------------------------
{
  const zoneId = "zone:west-freeport";
  const giverId = "npc:west-freeport:lady-shae";
  addGiver(giverId, "Lady Shae", zoneId);

  const questId = "quest:red-wine-to-lady-shae";
  addNode({
    id: questId,
    label: "Red Wine to Lady Shae",
    type: "quest",
    description:
      "Lady Shae in West Freeport takes four Red Wine, then a fifth turn-in of one White Wine, granting experience and faction with Emerald Warriors, Merchants of Felwithe, and Kelethin Merchants along the way. All classes.",
    minLevel: 1,
    steps: [
      "Deliver four Red Wine to Lady Shae in West Freeport",
      "Deliver one White Wine to Lady Shae",
    ],
    wiki_title: "Red Wine to Lady Shae",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Emerald Warriors");
  addFactionReward(questId, "Merchants of Felwithe");
  addFactionReward(questId, "Kelethin Merchants");
}

// ---------------------------------------------------------------------
// Reebo's Carrots
// ---------------------------------------------------------------------
{
  const zoneId = "zone:rivervale";
  const giverId = "npc:rivervale:reebo-leafsway";
  addGiver(giverId, "Reebo Leafsway", zoneId);

  const questId = "quest:reebos-carrots";
  addNode({
    id: questId,
    label: "Reebo's Carrots",
    type: "quest",
    description:
      "Reebo Leafsway in Rivervale hands over a Crate of Rotten Carrots for delivery to Blinza Toepopal; Reebo then offers a lesson in critical thinking with fresh carrots, and the final Crate of Carrots or Crate of Fine Carrots delivered back determines the exact faction split among Deeppockets, Circle of Unseen Hands, Merchants of Rivervale, Coalition of Tradefolk Underground, and Carson McCabe. Also rewards experience and small coin. All classes.",
    minLevel: 1,
    steps: [
      "Receive a Crate of Rotten Carrots from Reebo Leafsway in Rivervale",
      "Deliver the crate to Blinza Toepopal",
      "Receive fresh carrots back from Reebo and choose a Crate of Carrots or Crate of Fine Carrots",
      "Deliver the chosen crate back to complete the quest",
    ],
    wiki_title: "Reebo's Carrots",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Deeppockets");
  addFactionReward(questId, "Circle of Unseen Hands");
  addFactionReward(questId, "Merchants of Rivervale");
  addFactionReward(questId, "Coalition of Tradefolk Underground");
  addFactionReward(questId, "Carson McCabe");
}

// ---------------------------------------------------------------------
// Regal Band of Bathezid Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:chardok";
  const giverId = "npc:chardok:herald-telcha";
  addGiver(giverId, "Herald Telcha", zoneId);

  const questId = "quest:regal-band-of-bathezid-quest";
  addNode({
    id: questId,
    label: "Regal Band of Bathezid Quest",
    type: "quest",
    description:
      "Herald Telcha in Chardok trades a Di'Zok Signet of Service ring plus a Head of Skargus for the Regal Band of Bathezid ring. Ally faction with Di'Zok is required for the final turn-in. Continues into Spirit Wracked Cord Quest. All classes.",
    minLevel: 51,
    steps: [
      "Obtain a Di'Zok Signet of Service ring",
      "Slay Skargus for his head",
      "Turn both in to Herald Telcha in Chardok (Ally faction with Di'Zok required)",
    ],
    wiki_title: "Regal Band of Bathezid Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const ringId = "item:regal-band-of-bathezid";
  addNode({
    id: ringId,
    label: "Regal Band of Bathezid",
    type: "item",
    slots: ["Finger"],
    magic: true,
    lore: true,
    stats: { hp: 85, mana: 50 },
    effect: "Damage shield, usable at level 49",
    source: "Regal Band of Bathezid Quest reward (Herald Telcha, Chardok)",
  });
  addEdge(questId, ringId, "rewards");
}

// ---------------------------------------------------------------------
// Reinforcements for The Tunarean Regiment
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const giverId = "npc:kael-drakkal:staff-sergeant-drioc";
  addGiver(giverId, "Staff Sergeant Drioc", zoneId);

  const questId = "quest:reinforcements-for-the-tunarean-regiment";
  addNode({
    id: questId,
    label: "Reinforcements for The Tunarean Regiment",
    type: "quest",
    description:
      "Staff Sergeant Drioc in Kael Drakkal sends players through two phases -- first gathering an Arcanum of Rosh and Ancient Rusted Key around Wakening Land/Kael Drakkal for an Enchanted Velium Mask, then a second phase through Iceclad Ocean, Thurgadin, and the Tower of Frozen Shadow for an optional Velium Studded Cloak and a choice of Collar of the Storm, Girdle of Reflection, or Helssen's Prismatic Trinket. Faction gains with Kromrif, Kromzek, and King Tormax. All classes.",
    minLevel: 45,
    steps: [
      "Gather an Arcanum of Rosh and Ancient Rusted Key around Wakening Land/Kael Drakkal",
      "Turn them in to Staff Sergeant Drioc for an Enchanted Velium Mask",
      "Complete the second phase through Iceclad Ocean, Thurgadin, and the Tower of Frozen Shadow, optionally earning a Velium Studded Cloak",
      "Choose a final reward: Collar of the Storm, Girdle of Reflection, or Helssen's Prismatic Trinket",
    ],
    wiki_title: "Reinforcements for The Tunarean Regiment",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:the-wakening-land", "located_in");
  addEdge(questId, "zone:iceclad-ocean", "located_in");
  addEdge(questId, "zone:thurgadin", "located_in");
  addFactionReward(questId, "Kromrif");
  addFactionReward(questId, "Kromzek");
  addFactionReward(questId, "King Tormax");

  const maskId = "item:enchanted-velium-mask";
  addNode({
    id: maskId,
    label: "Enchanted Velium Mask",
    type: "item",
    slots: ["Face"],
    source: "Reinforcements for The Tunarean Regiment intermediate reward (Staff Sergeant Drioc, Kael Drakkal)",
  });
  addEdge(questId, maskId, "rewards");

  const cloakId = "item:velium-studded-cloak";
  addNode({
    id: cloakId,
    label: "Velium Studded Cloak",
    type: "item",
    slots: ["Back"],
    source: "Reinforcements for The Tunarean Regiment optional reward",
  });
  addEdge(questId, cloakId, "rewards");

  const collarId = "item:collar-of-the-storm";
  addNode({
    id: collarId,
    label: "Collar of the Storm",
    type: "item",
    slots: ["Neck"],
    magic: true,
    stats: { str: 6, sta: 7, hp: 15 },
    source: "Reinforcements for The Tunarean Regiment reward choice",
  });
  addEdge(questId, collarId, "rewards");

  const girdleId = "item:girdle-of-reflection";
  addNode({
    id: girdleId,
    label: "Girdle of Reflection",
    type: "item",
    slots: ["Waist"],
    magic: true,
    stats: { wis: 6, hp: 35 },
    source: "Reinforcements for The Tunarean Regiment reward choice",
  });
  addEdge(questId, girdleId, "rewards");

  const trinketId = "item:helssens-prismatic-trinket";
  addNode({
    id: trinketId,
    label: "Helssen's Prismatic Trinket",
    type: "item",
    slots: ["Ear"],
    magic: true,
    stats: { cha: 8, mana: 55 },
    source: "Reinforcements for The Tunarean Regiment reward choice",
  });
  addEdge(questId, trinketId, "rewards");
}

// ---------------------------------------------------------------------
// Renew Bones Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:west-cabilis";
  const giverId = "npc:west-cabilis:keeper-pain";
  addGiver(giverId, "Keeper Pain", zoneId);

  const questId = "quest:renew-bones-quest";
  addNode({
    id: questId,
    label: "Renew Bones Quest",
    type: "quest",
    classes: ["necromancer"],
    description:
      "Keeper Pain in West Cabilis sends Necromancers after four foraged items -- a Frost Crystal from the Dreadlands, a Plains Pebble from the Plains of Karana, a Cockatrice Egg from The Overthere, and a Giant Hornet Egg from Burning Wood -- to combine in a chest, plus a Wand of Pain retrieved from a coerced revenant in the Crypt of Dalnir. Reward: Spell: Renew Bones. Faction gains with Brood of Kotiz and Legion of Cabilis.",
    minLevel: 25,
    steps: [
      "Gather a Frost Crystal (Dreadlands), Plains Pebble (Plains of Karana), Cockatrice Egg (The Overthere), and Giant Hornet Egg (Burning Wood)",
      "Combine them in a chest",
      "Retrieve the Wand of Pain from a coerced revenant in the Crypt of Dalnir",
      "Return everything to Keeper Pain in West Cabilis",
    ],
    wiki_title: "Renew Bones Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:dreadlands", "located_in");
  addEdge(questId, "zone:the-overthere", "located_in");
  addEdge(questId, "zone:burning-wood", "located_in");
  addEdge(questId, "zone:dalnir", "located_in");
  addFactionReward(questId, "Brood of Kotiz");
  addFactionReward(questId, "Legion of Cabilis");
  addEdge(questId, "spell:renew-bones", "rewards");
}

// ---------------------------------------------------------------------
// Reserve Militia
// ---------------------------------------------------------------------
{
  const zoneId = "zone:west-freeport";
  const giverId = "npc:west-freeport:armorer-dellin";
  addGiver(giverId, "Armorer Dellin", zoneId);

  const questId = "quest:reserve-militia";
  addNode({
    id: questId,
    label: "Reserve Militia",
    type: "quest",
    classes: ["warrior", "paladin", "shadow knight", "ranger", "rogue", "monk", "bard"],
    description:
      "Armorer Dellin in West Freeport trades a Militia Armory Token (earned from a Guard Valon quest) for a Reserve Militia Tunic. Amiable faction or better with the Freeport Militia required. Faction gains with The Freeport Militia and Coalition of Tradefolk Underground.",
    minLevel: 10,
    steps: [
      "Earn a Militia Armory Token from Guard Valon's quest",
      "Turn the token in to Armorer Dellin in West Freeport",
    ],
    wiki_title: "Reserve Militia",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "The Freeport Militia");
  addFactionReward(questId, "Coalition of Tradefolk Underground");

  const tunicId = "item:reserve-militia-tunic";
  addNode({
    id: tunicId,
    label: "Reserve Militia Tunic",
    type: "item",
    slots: ["Chest"],
    ac: 9,
    stats: { dex: 3 },
    source: "Reserve Militia reward (Armorer Dellin, West Freeport)",
  });
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Respecialization -- broken/removed on eqlwiki.com, not modeled
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// Ridossan's Spirit
// ---------------------------------------------------------------------
{
  const zoneId = "zone:stonebrunt-mountains";
  const giverId = "npc:stonebrunt-mountains:a-spirit";
  addGiver(giverId, "a spirit", zoneId);

  const questId = "quest:ridossans-spirit";
  addNode({
    id: questId,
    label: "Ridossan's Spirit",
    type: "quest",
    classes: ["shadow knight"],
    description:
      "A spirit in Stonebrunt Mountains sends Shadow Knights after a Grimy Lance (dropped by a lizard ritualist in Temple of Cazic Thule); returning it grants the spirit corporeal form, leading to defeating Disciple Okarote and trading an Idol of Fear for the Soulfiend Lance. Amiable faction or better required. Faction gain with Heretics.",
    minLevel: 25,
    steps: [
      "Speak with the spirit in Stonebrunt Mountains",
      "Slay a lizard ritualist in Temple of Cazic Thule for a Grimy Lance",
      "Return the lance to the spirit to restore its corporeal form",
      "Defeat Disciple Okarote",
      "Trade the Idol of Fear for the Soulfiend Lance",
    ],
    wiki_title: "Ridossan's Spirit",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:temple-of-cazic-thule", "located_in");
  addFactionReward(questId, "Heretics");

  const lanceId = "item:soulfiend-lance";
  addNode({
    id: lanceId,
    label: "Soulfiend Lance",
    type: "item",
    slots: ["Primary"],
    magic: true,
    skill: "2H Piercing",
    damage: 20,
    ac: 5,
    stats: { int: 3 },
    effect: "Leech",
    source: "Ridossan's Spirit reward (Stonebrunt Mountains)",
  });
  addEdge(questId, lanceId, "rewards");
}

// ---------------------------------------------------------------------
// Robe of the Elements Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:temple-of-solusek-ro";
  const giverId = "npc:temple-of-solusek-ro:joyce";
  addGiver(giverId, "Joyce", zoneId);

  const questId = "quest:robe-of-the-elements-quest";
  addNode({
    id: questId,
    label: "Robe of the Elements Quest",
    type: "quest",
    classes: ["magician"],
    description:
      "Joyce in Temple of Solusek Ro trades a Fire Goblin Skin, Frost Goblin Skin, Twice-Woven Cloak, and Scroll of Elemental Armor for the Robe of the Elements. Faction gain with Temple Of Sol Ro.",
    minLevel: 25,
    steps: [
      "Gather a Fire Goblin Skin, Frost Goblin Skin, Twice-Woven Cloak, and Scroll of Elemental Armor",
      "Turn them in to Joyce in Temple of Solusek Ro",
    ],
    wiki_title: "Robe of the Elements Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Temple Of Sol Ro");

  const robeId = "item:robe-of-the-elements";
  addNode({
    id: robeId,
    label: "Robe of the Elements",
    type: "item",
    slots: ["Chest"],
    classes: ["magician"],
    magic: true,
    ac: 9,
    stats: { int: 4 },
    resists: { fire: 1, cold: 1 },
    effect: "Summoning haste focus",
    source: "Robe of the Elements Quest reward (Joyce, Temple of Solusek Ro)",
  });
  addEdge(questId, robeId, "rewards");
}

// ---------------------------------------------------------------------
// Rod of Insidious Glamour Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:temple-of-solusek-ro";
  const giverId = "npc:temple-of-solusek-ro:sultin";
  addGiver(giverId, "Sultin", zoneId);

  const questId = "quest:rod-of-insidious-glamour-quest";
  addNode({
    id: questId,
    label: "Rod of Insidious Glamour Quest",
    type: "quest",
    classes: ["enchanter"],
    description:
      "Sultin in Temple of Solusek Ro sends solo Enchanters after a Golden Rod (from a froglok priest in Upper Guk) and a Glowing Glamour Stone (obtained by trading through Cynthia and Tarn Visilin). Amiable faction with Temple Of Sol Ro is required before the final turn-in or both items are lost. Faction gain with Temple Of Sol Ro.",
    minLevel: 25,
    steps: [
      "Obtain a Golden Rod from a froglok priest in Upper Guk",
      "Trade through Cynthia and Tarn Visilin for a Glowing Glamour Stone",
      "Turn both in to Sultin in Temple of Solusek Ro (Amiable faction required)",
    ],
    wiki_title: "Rod of Insidious Glamour Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:upper-guk", "located_in");
  addEdge(questId, "zone:neriak-3rd-gate", "located_in");
  addFactionReward(questId, "Temple Of Sol Ro");

  const rodId = "item:rod-of-insidious-glamour";
  addNode({
    id: rodId,
    label: "Rod of Insidious Glamour",
    type: "item",
    slots: ["Secondary"],
    classes: ["enchanter"],
    magic: true,
    stats: { cha: 12 },
    effect: "Alliance, usable at level 30",
    source: "Rod of Insidious Glamour Quest reward (Sultin, Temple of Solusek Ro)",
  });
  addEdge(questId, rodId, "rewards");
}

// ---------------------------------------------------------------------
// Rognarog's Head
// ---------------------------------------------------------------------
{
  const zoneId = "zone:stonebrunt-mountains";
  const giverId = "npc:stonebrunt-mountains:shazda-kaekwon";
  addGiver(giverId, "Shazda Kaekwon", zoneId);

  const questId = "quest:rognarogs-head";
  addNode({
    id: questId,
    label: "Rognarog's Head",
    type: "quest",
    description:
      "Shazda Kaekwon in Stonebrunt Mountains trades a Kobold Head, looted from Rognarog the Infuriated, for a choice of the Titan Blessed Bokken, Titan Blessed Tachi, or Titan Blessed Tanto. Faction gains with Kejek Village and Peace Keepers.",
    minLevel: 28,
    steps: [
      "Slay Rognarog the Infuriated for a Kobold Head",
      "Turn the head in to Shazda Kaekwon and choose a weapon reward",
    ],
    wiki_title: "Rognarog's Head",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Kejek Village");
  addFactionReward(questId, "Peace Keepers");

  const bokkenId = "item:titan-blessed-bokken";
  addNode({
    id: bokkenId,
    label: "Titan Blessed Bokken",
    type: "item",
    slots: ["Primary"],
    skill: "2H Blunt",
    source: "Rognarog's Head reward choice (Shazda Kaekwon, Stonebrunt Mountains)",
  });
  addEdge(questId, bokkenId, "rewards");

  const tachiId = "item:titan-blessed-tachi";
  addNode({
    id: tachiId,
    label: "Titan Blessed Tachi",
    type: "item",
    slots: ["Primary"],
    skill: "1H Slashing",
    source: "Rognarog's Head reward choice (Shazda Kaekwon, Stonebrunt Mountains)",
  });
  addEdge(questId, tachiId, "rewards");

  const tantoId = "item:titan-blessed-tanto";
  addNode({
    id: tantoId,
    label: "Titan Blessed Tanto",
    type: "item",
    slots: ["Primary"],
    skill: "1H Piercing",
    source: "Rognarog's Head reward choice (Shazda Kaekwon, Stonebrunt Mountains)",
  });
  addEdge(questId, tantoId, "rewards");
}

// ---------------------------------------------------------------------
// Spirit Wracked Cord Quest (pulled forward from the S section -- direct
// sequel to Regal Band of Bathezid Quest)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:chardok";
  const giverId = "npc:chardok:queen-velazul-dizok";
  addGiver(giverId, "Queen Velazul Di`zok", zoneId);

  const questId = "quest:spirit-wracked-cord-quest";
  addNode({
    id: questId,
    label: "Spirit Wracked Cord Quest",
    type: "quest",
    description:
      "Queen Velazul Di`zok in Chardok trades an Undead Dragon Sinew, a Spirit Wracked Urn, and the finished Regal Band of Bathezid for the Spirit Wracked Cord (the ring is handed back). Ally faction required.",
    minLevel: 55,
    steps: [
      "Complete Regal Band of Bathezid Quest",
      "Gather an Undead Dragon Sinew and Spirit Wracked Urn",
      "Turn in the sinew, urn, and Regal Band of Bathezid to Queen Velazul Di`zok in Chardok (Ally faction required)",
    ],
    wiki_title: "Spirit Wracked Cord Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "quest:regal-band-of-bathezid-quest", "requires");

  const cordId = "item:spirit-wracked-cord";
  addNode({
    id: cordId,
    label: "Spirit Wracked Cord",
    type: "item",
    slots: ["Shoulders", "Arms", "Wrist"],
    magic: true,
    lore: true,
    ac: 12,
    stats: { sta: 5, hp: 100 },
    resists: { cold: 1, magic: 1 },
    effect: "Aura of Battle",
    source: "Spirit Wracked Cord Quest reward (Queen Velazul Di`zok, Chardok)",
  });
  addEdge(questId, cordId, "rewards");
}

save();
console.log(
  "Migration 086 complete: added 13 more quests from GitHub issue #26's checklist (Red Dragonscale Armor Quest through Rognarog's Head, plus Spirit Wracked Cord Quest); deferred Request of the Arcane/Strong to the Dozekar Tear Quests cluster; skipped broken Respecialization"
);
