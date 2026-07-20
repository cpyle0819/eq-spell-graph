/**
 * Migration 065: 24 more quests off GitHub issue #26's checklist -- the
 * "Cromil's Remains" through "Gloves of Earthcrafting Quest" run. Researched
 * directly against eqlwiki.com, following decisions/eqlwiki-quest-research-method.md.
 * Uses the shared migrations/_lib.ts helpers.
 *
 * Not modeled as a quest node:
 * - Faction Quests -- not a quest, the wiki's own region-by-region index page
 *   of other already-listed faction quests ("Below is a list of quests which
 *   are commonly used to raise faction"). Checked off, no node, same
 *   treatment as migration 062's "All Positive Faction Quests".
 *
 * Deferred to the `## Quest Groups` section of GitHub issue #26 instead of
 * modeled here (per the issue's own guardrail):
 * - Crusader's Tests -- a real 8-stage sequential Shadow Knight progression
 *   (each stage requires the previous stage's reward weapon to advance,
 *   ending in a forged "Greenmist" weapon), not a sibling set. Same "real
 *   questline" shape as Plane of Sky Keys.
 * - Dozekar Tear Quests -- roughly 15 independent parallel turn-in chains
 *   (Temple of Veeshan, segregated by caster/melee/all class groups), each
 *   with its own unique tear+symbol turn-in and unique named item reward.
 *   A genuine `quest_group` shape, but far larger than a normal 6-8 piece
 *   armor/test set -- deserves its own dedicated research pass rather than
 *   folding 15 sub-quests into a 25-quest standalone batch.
 *
 * `Custom Plate Helms - Kael Drakkel / Skyshrine / Thurgadin` are modeled as
 * one quest node each, not a `quest_group` with per-helm item nodes: each
 * trades any of 7-8 different base plate helms for a "Custom" version with
 * *identical stats*, just a different in-game appearance model. Since the
 * reward carries no new stat block over the (already player-owned) base
 * item, no new `item` reward nodes are created -- see "Deliberately NOT
 * modeled" below.
 *
 * Deliberately NOT modeled (consistent with every migration so far):
 * - Negative faction changes throughout (decisions/quest-reward-modeling.md
 *   only models positive rewards): Crystal Caverns' Ancient Artifacts'
 *   Kromrif/Kromzek loss, Di'Zok Signet of Service's Goblins of Mountain
 *   Death loss, Dragon Scales Quest's Legion of Cabilis/Pirates of Gunthak
 *   loss, Emerald Dragonscale Quest's Ulthork loss, Essence Lens Quest's
 *   Kromzek loss, Fusibility Research's Shadowed Men loss, Gharin's Note
 *   (evil)'s Guards of Qeynos/Priests of Life/Jaggedpine Treefolk/Protectors
 *   of Pine/QRG Protected Animals loss, Giant Helmets' King Tormax loss,
 *   First Test of Kejaar's High Council/High Guard/Merchants of Erudin loss.
 * - Coin rewards throughout -- no coin field on `quest` nodes (Froglok Tad
 *   Tongues' 7 copper, Giant Helmets' 20pp per turn-in, Fusibility
 *   Research's 28pp, Gharin's Note (evil)'s silver).
 * - Custom Plate Helms (all three) -- no new `item` reward nodes, see above.
 * - Cromil's Remains' reward is quoted as "Hammer of Wrath" (spell, already
 *   in the graph) by the wiki's primary account; a second, unconfirmed
 *   account claims "Spook the Dead" instead. Only the primary, better-
 *   attested reward is modeled as a `rewards` edge; the discrepancy is
 *   noted in the quest's own description rather than asserting both.
 * - Deck of Spontaneous Generation Quest's card-combination sub-rewards
 *   (Armor of Distraction pieces, Plane of Mischief armor sets, Flowers of
 *   Functionality, assorted weapons) -- left prose-only in `steps`/
 *   `description`, not itemized: the wiki describes an open-ended
 *   card-combination minigame, not a fixed named reward list.
 * - Emberfold Exchange's "Chapter IV, Of Flame and Frost" and "Holiday
 *   Gift" -- a seasonal/holiday-event reward with no stat block quoted;
 *   left prose-only rather than fabricated as an `item` node.
 * - Entalon's Quest's reward -- the wiki itself flags missing info (exact
 *   NPC locations, full dialogue, faction changes); modeled with only what
 *   is confirmed (teleport + experience), no fabricated fields.
 * - Gloves of Earthcrafting Quest's race/deity restriction ("bound to
 *   Druids of Human, Elf, or Half-Elf race who worship Tunare") -- no
 *   race/deity field exists on `item` nodes (decisions/item-node-schema.md
 *   lists none), so this is folded into the item's `source` text instead.
 *
 * New zone stub: none needed this batch -- every giver's zone (North
 * Kaladim, Cobalt Scar, Thurgadin, Swamp of No Hope, Kael Drakkal,
 * Skyshrine, Chardok, Firiona Vie, Dreadlands, South Qeynos, Burning Woods,
 * Western Wastes, Kerra Island, Qeynos Aqueducts, Icewell Keep, Plane of
 * Growth, Plane of Mischief) already exists in the graph. Farming-only
 * locations that aren't a quest's own giver zone and aren't already in the
 * graph (Siren's Grotto, Crystal Caverns) are left as prose, per the
 * issue's zone-creation guardrail applying only to giver zones.
 *
 * Reused existing nodes: `npc:north-kaladim:gunlok-jure` and
 * `quest:bone-chips-kaladim` (Cromil's Remains is Gunlok Jure's own
 * follow-up quest after Bone Chips -- `requires` edge added);
 * `spell:hammer-of-wrath` (already in the graph); `npc:south-qeynos:gharin`
 * and `npc:surefall-glade:teanara` (Gharin's Note (evil) shares both
 * mid-chain NPCs with the already-modeled Gharin's Note (good));
 * `npc:south-qeynos:runethar-hamest` and `item:bonethunder-staff` (Enchant
 * Bonethunder is a direct follow-up to the already-modeled Bonethunder
 * Staff Quest -- same giver's referral, same staff traded back in for
 * itself, `requires` edge added).
 *
 * `requires` edges (decisions/quest-prerequisite-requires-edge.md):
 * `quest:bone-chips-kaladim` -> `quest:cromils-remains`;
 * `quest:bonethunder-staff-quest` -> `quest:enchant-bonethunder`.
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, slug, addFactionReward, addGiver, save } = loadGraph(import.meta.dir);

// ---------------------------------------------------------------------
// Cromil's Remains
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-kaladim";
  const giverId = "npc:north-kaladim:gunlok-jure";
  addGiver(giverId, "Gunlok Jure", zoneId);

  const questId = "quest:cromils-remains";
  addNode({
    id: questId,
    label: "Cromil's Remains",
    type: "quest",
    description: "Gunlok Jure in North Kaladim, after the Bone Chips (Kaladim) quest, sends the player after Dwarf Bones from a rare dwarf skeleton near Lord Grimrot's camp in Southern Karana. Returning the bones yields a Hammer of Wrath spell scroll (one unconfirmed account instead reports Spook the Dead). Amiable faction or better with the Clerics of Underfoot required.",
    minLevel: 7,
    steps: [
      "Complete the Bone Chips (Kaladim) quest with Gunlok Jure",
      "Defeat the rare dwarf skeleton near Lord Grimrot's camp in Southern Karana for Dwarf Bones",
      "Return the Dwarf Bones to Gunlok Jure",
    ],
    wiki_title: "Cromil's Remains",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:southern-karana", "located_in");
  addEdge("quest:bone-chips-kaladim", questId, "requires");
  addFactionReward(questId, "Clerics of Underfoot");
  addFactionReward(questId, "Kazon Stormhammer");
  addFactionReward(questId, "Miners Guild 249");
  addEdge(questId, "spell:hammer-of-wrath", "rewards");
}

// ---------------------------------------------------------------------
// Crustacean Shell Armor Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:cobalt-scar";
  const giverId = "npc:cobalt-scar:qarrgy-scallopgobbler";
  addGiver(giverId, "Qarrgy Scallopgobbler", zoneId);

  const questId = "quest:crustacean-shell-armor-quest";
  addNode({
    id: questId,
    label: "Crustacean Shell Armor Quest",
    type: "quest",
    description: "Qarrgy Scallopgobbler in Cobalt Scar explains the burning process for crustacean shell armor and trades 2 Barracuda Livers for a Bladder of Acidic Ooze.",
    minLevel: 50,
    steps: [
      "Speak with Qarrgy Scallopgobbler about crustacean shell armor and the burning process",
      "Gather 2 Barracuda Livers",
      "Deliver them to Qarrgy Scallopgobbler",
    ],
    wiki_title: "Crustacean Shell Armor Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const bladderId = "item:bladder-of-acidic-ooze";
  addNode({
    id: bladderId,
    label: "Bladder of Acidic Ooze",
    type: "item",
    magic: true,
    noTrade: true,
    weight: 0.1,
    size: "Tiny",
    source: "Crustacean Shell Armor Quest reward (Qarrgy Scallopgobbler, Cobalt Scar) -- also used in the Captain Nalot's Triple Strength Rum quest",
  });
  addEdge(questId, bladderId, "rewards");
}

// ---------------------------------------------------------------------
// Crystal Caverns' Ancient Artifacts
// ---------------------------------------------------------------------
{
  const zoneId = "zone:thurgadin";
  const giverId = "npc:thurgadin:erdarf-restil";
  addGiver(giverId, "Erdarf Restil", zoneId);

  const questId = "quest:crystal-cavernss-ancient-artifacts";
  addNode({
    id: questId,
    label: "Crystal Caverns' Ancient Artifacts",
    type: "quest",
    description: "Erdarf Restil in Thurgadin trades a Sceptre of the Coldain Ancients (from Queen Dracnia) or Bottle of Karsin Acid (from Crystal Caverns creatures) for a Gem of Persuasion. Combined with a Blood Wolf Harness (Drakkel Blood Wolf, Great Divide), the gem is traded to Vores the Hunter in Great Divide for a Harness of Control, turned in to Shardwurm Broodmother to draw out Fergul Frostsky, who must then be defeated for Kromrif Military Leggings.",
    minLevel: 40,
    steps: [
      "Obtain a Sceptre of the Coldain Ancients (Queen Dracnia) or Bottle of Karsin Acid (Crystal Caverns creatures)",
      "Turn it in to Erdarf Restil in Thurgadin for a Gem of Persuasion",
      "Obtain a Blood Wolf Harness from a Drakkel Blood Wolf in Great Divide",
      "Give the harness and gem to Vores the Hunter in Great Divide for a Harness of Control",
      "Turn in the Harness of Control to Shardwurm Broodmother",
      "Defeat Fergul Frostsky once he engages Gralk Dwarfkiller",
    ],
    wiki_title: "Crystal Caverns' Ancient Artifacts",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:great-divide", "located_in");

  const leggingsId = "item:kromrif-military-leggings";
  addNode({
    id: leggingsId,
    label: "Kromrif Military Leggings",
    type: "item",
    slots: ["Legs"],
    ac: 14,
    stats: { str: 6, wis: 5 },
    resists: { disease: 5, cold: 5 },
    source: "Crystal Caverns' Ancient Artifacts reward (Erdarf Restil, Thurgadin)",
  });
  addEdge(questId, leggingsId, "rewards");
}

// ---------------------------------------------------------------------
// Cures
// ---------------------------------------------------------------------
{
  const zoneId = "zone:swamp-of-no-hope";
  const giverId = "npc:swamp-of-no-hope:mystic-dovan";
  addGiver(giverId, "Mystic Dovan", zoneId);

  const questId = "quest:cures";
  addNode({
    id: questId,
    label: "Cures",
    type: "quest",
    description: "Mystic Dovan in the Swamp of No Hope trades a Giant Blood Sac (cure disease), two Brittle Iksar Skulls (heal), or a Watcher Signal Torch (purge toxins) for experience and faction. All classes.",
    minLevel: 1,
    steps: [
      "Gather a Giant Blood Sac, two Brittle Iksar Skulls, or a Watcher Signal Torch",
      "Deliver it to Mystic Dovan in the Swamp of No Hope",
    ],
    wiki_title: "Cures",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Scaled Mystics");
  addFactionReward(questId, "Legion of Cabilis");
}

// ---------------------------------------------------------------------
// Custom Plate Helms - Kael Drakkel
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const giverId = "npc:kael-drakkal:grand-armsmith-korin";
  addGiver(giverId, "Grand Armsmith Korin", zoneId);

  const questId = "quest:custom-plate-helms-kael-drakkel";
  addNode({
    id: questId,
    label: "Custom Plate Helms - Kael Drakkel",
    type: "quest",
    description: "Grand Armsmith Korin in Kael Drakkel trades any of 7 plate helms (Malevolent Crown, Shining Helm, Troubadour's Helm, Crown of the Kromzek Kings, Frostweaver's Velium Crown, Cowl of Mortality, Warlord's Crown) for a Custom-appearance version with identical stats -- a cosmetic reskin only, no new stats. No faction hits or experience.",
    minLevel: 1,
    steps: [
      "Bring one of the eligible plate helms to Grand Armsmith Korin in Kael Drakkel",
      "Receive its Custom-appearance version back, same stats",
    ],
    wiki_title: "Custom Plate Helms - Kael Drakkel",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Custom Plate Helms - Skyshrine
// ---------------------------------------------------------------------
{
  const zoneId = "zone:skyshrine";
  const giverId = "npc:skyshrine:supreme-laochsmith-psorin";
  addGiver(giverId, "Supreme Laochsmith Psorin", zoneId);

  const questId = "quest:custom-plate-helms-skyshrine";
  addNode({
    id: questId,
    label: "Custom Plate Helms - Skyshrine",
    type: "quest",
    description: "Supreme Laochsmith Psorin in Skyshrine trades any of 8 plate helms (Blood Lord's Crown, Scaled Knight's Helm, Helm of Twilight, Akkirus' Crown of the Risen, Cowl of Mortality, Frostreaver's Velium Crown, Crown of the Kromzek Kings, Crown of the Myrmidon) for a Custom-appearance version with identical stats, styled for pre-Luclin character models. Ally faction with Claws of Veeshan required. No faction hits or experience.",
    minLevel: 1,
    steps: [
      "Hail Supreme Laochsmith Psorin in Skyshrine and ask about the special helm",
      "Provide one of the eligible plate helms",
      "Receive its Custom-appearance version back, same stats",
    ],
    wiki_title: "Custom Plate Helms - Skyshrine",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Custom Plate Helms - Thurgadin
// ---------------------------------------------------------------------
{
  const zoneId = "zone:thurgadin";
  const giverId = "npc:thurgadin:royal-armorer-slade";
  addGiver(giverId, "Royal Armorer Slade", zoneId);

  const questId = "quest:custom-plate-helms-thurgadin";
  addNode({
    id: questId,
    label: "Custom Plate Helms - Thurgadin",
    type: "quest",
    classes: ["cleric", "warrior", "paladin", "shadow knight", "bard"],
    description: "Royal Armorer Slade, on the 3rd floor of Icewell Keep near Dain's spawn, trades any of 8 plate helms (Dark Runed Crown, Runed Protector's Helm, Resonant Helm, Crown of Forbidden Rites, Crown of the Kromzek Kings, Frostreaver's Velium Crown, Cowl of Mortality, Champions Crown) for a Custom-appearance version with identical stats, styled for pre-Luclin character models. Kindly faction with Coldain required.",
    minLevel: 1,
    steps: [
      "Hail Royal Armorer Slade and ask what services are offered",
      "Provide one of the eligible plate helms",
      "Receive its Custom-appearance version back, same stats",
    ],
    wiki_title: "Custom Plate Helms - Thurgadin",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:icewell-keep", "located_in");
}

// ---------------------------------------------------------------------
// Dain's Head
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const giverId = "npc:kael-drakkal:king-tormax";
  addGiver(giverId, "King Tormax", zoneId);

  const questId = "quest:dains-head";
  addNode({
    id: questId,
    label: "Dain's Head",
    type: "quest",
    description: "King Tormax in Kael Drakkel sends the player to slay Dain Frostreaver IV in Icewell Keep and return with his head, in exchange for a Belt of Dwarf Slaying. Indifferent faction or better required. All classes.",
    minLevel: 50,
    steps: [
      "Hail King Tormax in Kael Drakkel",
      "Travel to Icewell Keep and defeat Dain Frostreaver IV",
      "Return Dain Frostreaver's Head to King Tormax",
    ],
    wiki_title: "Dain's Head",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:icewell-keep", "located_in");
  addFactionReward(questId, "Kromzek");
  addFactionReward(questId, "King Tormax");

  const beltId = "item:belt-of-dwarf-slaying";
  addNode({
    id: beltId,
    label: "Belt of Dwarf Slaying",
    type: "item",
    slots: ["Waist"],
    ac: 20,
    stats: { str: 15, wis: 15, int: 15 },
    hp: 100,
    mana: 100,
    effect: "Aura of Battle",
    source: "Dain's Head reward (King Tormax, Kael Drakkel) -- also +5 to all resists",
  });
  addEdge(questId, beltId, "rewards");
}

// ---------------------------------------------------------------------
// Deck of Spontaneous Generation Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:plane-of-mischief";
  const giverId = "npc:plane-of-mischief:ferjeneror";
  addGiver(giverId, "Ferjeneror", zoneId);

  const questId = "quest:deck-of-spontaneous-generation-quest";
  addNode({
    id: questId,
    label: "Deck of Spontaneous Generation Quest",
    type: "quest",
    description: "Ferjeneror in the Plane of Mischief's flower maze trades a King Cod Card (from the ogre Dinner in the Dining Room) or four colored cod cards fished from the castle moat for a Deck of Spontaneous Generation, a container that generates rewards (armor, flowers, weapons, accessories) when playing cards looted from the zone's mobs are combined inside it.",
    minLevel: 46,
    steps: [
      "Obtain a King Cod Card from the ogre Dinner in the Dining Room, or fish Black/Blue/Red/White cod cards from the castle moat",
      "Turn the card(s) in to Ferjeneror in the flower maze for a Deck of Spontaneous Generation",
      "Collect playing cards dropped throughout the Plane of Mischief and combine them in the Deck for rewards",
    ],
    wiki_title: "Deck of Spontaneous Generation Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const deckId = "item:deck-of-spontaneous-generation";
  addNode({
    id: deckId,
    label: "Deck of Spontaneous Generation",
    type: "item",
    noTrade: true,
    weight: 1.0,
    capacity: 4,
    containerSize: "Small",
    source: "Deck of Spontaneous Generation Quest reward (Ferjeneror, Plane of Mischief)",
  });
  addEdge(questId, deckId, "rewards");
}

// ---------------------------------------------------------------------
// Di'Zok Signet of Service Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:chardok";
  const giverId = "npc:chardok:herald-telcha";
  addGiver(giverId, "Herald Telcha", zoneId);

  const questId = "quest:dizok-signet-of-service-quest";
  addNode({
    id: questId,
    label: "Di'Zok Signet of Service Quest",
    type: "quest",
    description: "Herald Telcha in Chardok repeatedly trades a Green Goblin Skin or 2 Mt. Death Mineral Salts for faction; once Warmly faction with the Brood of Di'Zok is reached, saying 'I serve the sarnak' yields a Di'Zok Signet of Service ring.",
    minLevel: 51,
    steps: [
      "Repeatedly trade Herald Telcha a Green Goblin Skin or 2 Mt. Death Mineral Salts until Warmly faction with the Brood of Di'Zok",
      "Say 'I serve the sarnak' to Herald Telcha",
    ],
    wiki_title: "Di'Zok Signet of Service Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Brood of Di'Zok");
  addFactionReward(questId, "Sarnak Collective");

  const ringId = "item:dizok-signet-of-service";
  addNode({
    id: ringId,
    label: "Di'Zok Signet of Service",
    type: "item",
    slots: ["Finger"],
    ac: 2,
    stats: { cha: 1, wis: 1, int: 1 },
    hp: 65,
    mana: 45,
    lore: true,
    noTrade: true,
    source: "Di'Zok Signet of Service Quest reward (Herald Telcha, Chardok)",
  });
  addEdge(questId, ringId, "rewards");
}

// ---------------------------------------------------------------------
// Dragon Scales Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:firiona-vie";
  const giverId = "npc:firiona-vie:squire-fuzzmin";
  addGiver(giverId, "Squire Fuzzmin", zoneId);

  const questId = "quest:dragon-scales-quest";
  addNode({
    id: questId,
    label: "Dragon Scales Quest",
    type: "quest",
    classes: ["warrior", "paladin", "ranger", "shadow knight"],
    description: "Squire Fuzzmin in Firiona Vie sends the player to trade 2 Carnelians to Tektite (a gargoyle in The Overthere), then a Peridot plus that item to Lord Lyfyx of Burwood in the Temple of Solusek Ro for Dragon Scales, then slay Azdalin and Gylton in Burning Wood for their scales. All three scales together yield the Wurmslayer.",
    minLevel: 45,
    steps: [
      "Obtain 2 Carnelians and trade them to Tektite in The Overthere",
      "Obtain a Peridot and trade it with Tektite's item to Lord Lyfyx of Burwood in the Temple of Solusek Ro for Dragon Scales",
      "Defeat Azdalin and Gylton in Burning Wood for their scales",
      "Deliver all three scales to Squire Fuzzmin",
    ],
    wiki_title: "Dragon Scales Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:the-overthere", "located_in");
  addEdge(questId, "zone:temple-of-solusek-ro", "located_in");
  addEdge(questId, "zone:burning-wood", "located_in");
  addFactionReward(questId, "Inhabitants of Firiona Vie");
  addFactionReward(questId, "Emerald Warriors");
  addFactionReward(questId, "Storm Guard");

  const swordId = "item:wurmslayer";
  addNode({
    id: swordId,
    label: "Wurmslayer",
    type: "item",
    slots: ["Primary"],
    skill: "1H Slashing",
    damage: 25,
    ac: 5,
    stats: { str: 5 },
    resists: { magic: 5 },
    source: "Dragon Scales Quest reward (Squire Fuzzmin, Firiona Vie)",
  });
  addEdge(questId, swordId, "rewards");
}

// ---------------------------------------------------------------------
// Emberfold Exchange
// ---------------------------------------------------------------------
{
  const zoneId = "zone:dreadlands";
  const giverId = "npc:dreadlands:frosti-bramblebrew";
  addGiver(giverId, "Frosti Bramblebrew", zoneId);

  const questId = "quest:emberfold-exchange";
  addNode({
    id: questId,
    label: "Emberfold Exchange",
    type: "quest",
    description: "Frosti Bramblebrew in Dreadlands trades a Frostbitten Hide (mammoths, Everfrost Peaks), Emberberry Cluster (goblins, Solusek's Eye), and Dew of First Light (willowisps) for a seasonal holiday reward, 'Chapter IV, Of Flame and Frost' plus a Holiday Gift.",
    minLevel: 1,
    steps: [
      "Obtain a Frostbitten Hide from mammoths in Everfrost Peaks",
      "Obtain an Emberberry Cluster from goblins in Solusek's Eye",
      "Obtain Dew of First Light from willowisps",
      "Deliver all three to Frosti Bramblebrew in Dreadlands",
    ],
    wiki_title: "Emberfold Exchange",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:everfrost-peaks", "located_in");
  addEdge(questId, "zone:solusek-s-eye", "located_in");
}

// ---------------------------------------------------------------------
// Emerald Dragonscale Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:cobalt-scar";
  const giverId = "npc:cobalt-scar:qarrgy-scallopgobbler";
  addGiver(giverId, "Qarrgy Scallopgobbler", zoneId);

  const questId = "quest:emerald-dragonscale-quest";
  addNode({
    id: questId,
    label: "Emerald Dragonscale Quest",
    type: "quest",
    classes: ["bard", "cleric", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"],
    description: "Qarrgy Scallopgobbler in Cobalt Scar trades Emerald Dragon Scales (from Wuoshi in The Wakening Land), Ulthork Tusks (ulthorks in Siren's Grotto and Eastern Wastes), and an unstained Fine Plate Breastplate for an Emerald Dragonscale Tunic.",
    minLevel: 50,
    steps: [
      "Obtain Emerald Dragon Scales from Wuoshi in The Wakening Land",
      "Obtain Ulthork Tusks from ulthorks in Siren's Grotto or Eastern Wastes",
      "Obtain an unstained Fine Plate Breastplate",
      "Deliver all three to Qarrgy Scallopgobbler in Cobalt Scar",
    ],
    wiki_title: "Emerald Dragonscale Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:the-wakening-land", "located_in");
  addEdge(questId, "zone:eastern-wastes", "located_in");
  addFactionReward(questId, "Othmir");

  const tunicId = "item:emerald-dragonscale-tunic";
  addNode({
    id: tunicId,
    label: "Emerald Dragonscale Tunic",
    type: "item",
    slots: ["Chest"],
    ac: 22,
    stats: { cha: 10, wis: 20 },
    resists: { disease: 10, magic: 10 },
    source: "Emerald Dragonscale Quest reward (Qarrgy Scallopgobbler, Cobalt Scar)",
  });
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Enchant Bonethunder
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:kasine-paegra";
  addGiver(giverId, "Kasine Paegra", zoneId);

  const questId = "quest:enchant-bonethunder";
  addNode({
    id: questId,
    label: "Enchant Bonethunder",
    type: "quest",
    classes: ["cleric", "paladin"],
    description: "After Runethar Hamest in South Qeynos points the way (a follow-up to the Bonethunder Staff Quest), Kasine Paegra will enchant an existing Bonethunder Staff in exchange for the staff itself plus 500 gold coins -- the wiki notes the item turned in and the reward it out are identical, making this quest functionally pointless as implemented.",
    minLevel: 20,
    steps: [
      "Speak with Runethar Hamest after obtaining a Bonethunder Staff",
      "Visit Kasine Paegra and ask her to enchant the staff",
      "Hand over the Bonethunder Staff and 500 gold coins",
    ],
    wiki_title: "Enchant Bonethunder",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge("quest:bonethunder-staff-quest", questId, "requires");
  addEdge(questId, "item:bonethunder-staff", "rewards");
}

// ---------------------------------------------------------------------
// Entalon's Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:burning-woods";
  const giverId = "npc:burning-woods:entalon";
  addGiver(giverId, "Entalon", zoneId);

  const questId = "quest:entalons-quest";
  addNode({
    id: questId,
    label: "Entalon's Quest",
    type: "quest",
    description: "Entalon in Burning Woods trades Sorcerer Scribblings (dropped by a rare wood elf pilgrim in Firiona Vie) and a Stoneleer Emerald Plume (dropped by a stoneleer cockatrice) for teleportation to meet Atheling Plague, plus experience. The wiki notes exact NPC locations, full dialogue, and faction changes for this quest are not yet documented. All classes.",
    minLevel: 1,
    steps: [
      "Obtain Sorcerer Scribblings from a rare wood elf pilgrim in Firiona Vie",
      "Obtain a Stoneleer Emerald Plume from a stoneleer cockatrice",
      "Deliver both to Entalon in Burning Woods",
    ],
    wiki_title: "Entalon's Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:firiona-vie", "located_in");
}

// ---------------------------------------------------------------------
// Essence Lens Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:western-wastes";
  const giverId = "npc:western-wastes:melalafen";
  addGiver(giverId, "Melalafen", zoneId);

  const questId = "quest:essence-lens-quest";
  addNode({
    id: questId,
    label: "Essence Lens Quest",
    type: "quest",
    description: "Melalafen in Western Wastes, available only after Kerafyrm has been awakened, trades a Prismatic Dragon Scale (rare drop, Sleeper's Tomb) and the Sleeper's Key for a choice of Essence Lens, Essence Blade, Essence Mace, Essence Pearl, or Essence Ring -- a trade cycle (Lens -> Mace -> Sword -> Earring -> Ring -> Lens) lets the reward be swapped later.",
    minLevel: 58,
    steps: [
      "Obtain a Prismatic Dragon Scale (rare drop in Sleeper's Tomb) and the Sleeper's Key",
      "Deliver both to Melalafen in Western Wastes",
      "Choose Essence Lens, Essence Blade, Essence Mace, Essence Pearl, or Essence Ring",
    ],
    wiki_title: "Essence Lens Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:sleepers-tomb", "located_in");
  addFactionReward(questId, "Disciples of Kerafyrm");
  addFactionReward(questId, "Claws of Veeshan");
  addFactionReward(questId, "Ring of Scale");

  const lensId = "item:essence-lens";
  addNode({
    id: lensId,
    label: "Essence Lens",
    type: "item",
    slots: ["Range"],
    ac: 15,
    hp: 75,
    mana: 75,
    resists: { fire: 15, cold: 15, disease: 15, poison: 15, magic: 15 },
    source: "Essence Lens Quest reward (Melalafen, Western Wastes)",
  });
  addEdge(questId, lensId, "rewards");

  const bladeId = "item:essence-blade";
  addNode({
    id: bladeId,
    label: "Essence Blade",
    type: "item",
    slots: ["Primary"],
    classes: ["paladin", "shadow knight"],
    source: "Essence Lens Quest reward (Melalafen, Western Wastes)",
  });
  addEdge(questId, bladeId, "rewards");

  const maceId = "item:essence-mace";
  addNode({
    id: maceId,
    label: "Essence Mace",
    type: "item",
    slots: ["Primary", "Secondary"],
    classes: ["warrior", "ranger", "monk", "bard", "rogue"],
    source: "Essence Lens Quest reward (Melalafen, Western Wastes)",
  });
  addEdge(questId, maceId, "rewards");

  const pearlId = "item:essence-pearl";
  addNode({
    id: pearlId,
    label: "Essence Pearl",
    type: "item",
    slots: ["Ear"],
    source: "Essence Lens Quest reward (Melalafen, Western Wastes)",
  });
  addEdge(questId, pearlId, "rewards");

  const ringId = "item:essence-ring";
  addNode({
    id: ringId,
    label: "Essence Ring",
    type: "item",
    slots: ["Finger"],
    source: "Essence Lens Quest reward (Melalafen, Western Wastes)",
  });
  addEdge(questId, ringId, "rewards");
}

// ---------------------------------------------------------------------
// Faction Quests -- not a real quest, wiki's own region-by-region index page
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// Feskr's Supplies
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kerra-island";
  const giverId = "npc:kerra-island:feskr-drinkmaker";
  addGiver(giverId, "Feskr Drinkmaker", zoneId);

  const questId = "quest:feskrs-supplies";
  addNode({
    id: questId,
    label: "Feskr's Supplies",
    type: "quest",
    description: "Feskr Drinkmaker on Kerra Island trades a Bottle of Tunare's Finest (purchased from Wela Muselender), a Thunderhoof Mushroom (foraged, Southern Karana), Tea Leaves (foraged, Eastern Karana), and a Hand Made Backpack for a Rough Leather Sack.",
    minLevel: 1,
    steps: [
      "Purchase a Bottle of Tunare's Finest from Wela Muselender",
      "Forage a Thunderhoof Mushroom in Southern Karana",
      "Forage Tea Leaves in Eastern Karana",
      "Craft or obtain a Hand Made Backpack",
      "Deliver all four items to Feskr Drinkmaker on Kerra Island",
    ],
    wiki_title: "Feskr's Supplies",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:southern-karana", "located_in");
  addEdge(questId, "zone:eastern-karana", "located_in");
  addFactionReward(questId, "Kerra Isle");

  const sackId = "item:rough-leather-sack";
  addNode({
    id: sackId,
    label: "Rough Leather Sack",
    type: "item",
    lore: true,
    noTrade: true,
    weight: 3.0,
    capacity: 6,
    containerSize: "Medium",
    source: "Feskr's Supplies reward (Feskr Drinkmaker, Kerra Island) -- reduces contained weight by 25%",
  });
  addEdge(questId, sackId, "rewards");
}

// ---------------------------------------------------------------------
// First Test of Kejaar
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kerra-island";
  const giverId = "npc:kerra-island:shazda-asad";
  addGiver(giverId, "Shazda Asad", zoneId);

  const questId = "quest:first-test-of-kejaar";
  addNode({
    id: questId,
    label: "First Test of Kejaar",
    type: "quest",
    description: "Shazda Asad on Kerra Island sends the player to kill an Erudin Emissary in Toxxulia Forest for its head, then obtain the head of Sentinel Creot, in exchange for a 5-charge Kejaar Totem (Spirit of Cat effect).",
    minLevel: 20,
    steps: [
      "Speak with Shazda Asad on Kerra Island",
      "Defeat an Erudin Emissary in Toxxulia Forest and loot its head",
      "Return the head to Shazda Asad",
      "Obtain the head of Sentinel Creot",
    ],
    wiki_title: "First Test of Kejaar",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:toxxulia-forest", "located_in");
  addFactionReward(questId, "Heretics");
  addFactionReward(questId, "Kerra Isle");

  const totemId = "item:kejaar-totem";
  addNode({
    id: totemId,
    label: "Kejaar Totem",
    type: "item",
    magic: true,
    effect: "Spirit of Cat (5 charges)",
    source: "First Test of Kejaar reward (Shazda Asad, Kerra Island)",
  });
  addEdge(questId, totemId, "rewards");
}

// ---------------------------------------------------------------------
// Fish Dinner
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kerra-island";
  const giverId = "npc:kerra-island:roary-fishpouncer";
  addGiver(giverId, "Roary Fishpouncer", zoneId);

  const questId = "quest:fish-dinner";
  addNode({
    id: questId,
    label: "Fish Dinner",
    type: "quest",
    classes: ["bard", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"],
    description: "Roary Fishpouncer on Kerra Island trades a Raw Darkwater Piranha (rare spawn, Nektulos Forest River) for a Kerran Fishing Spear.",
    minLevel: 13,
    steps: [
      "Defeat the rare darkwater piranha in the Nektulos Forest River for a Raw Darkwater Piranha",
      "Return it to Roary Fishpouncer on Kerra Island",
    ],
    wiki_title: "Fish Dinner",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:nektulos-forest", "located_in");
  addFactionReward(questId, "Kerra Isle");

  const spearId = "item:kerran-fishing-spear";
  addNode({
    id: spearId,
    label: "Kerran Fishing Spear",
    type: "item",
    slots: ["Primary"],
    skill: "Piercing",
    magic: true,
    lore: true,
    stats: { dex: 1, agi: 1 },
    effect: "Enduring Breath",
    source: "Fish Dinner reward (Roary Fishpouncer, Kerra Island)",
  });
  addEdge(questId, spearId, "rewards");
}

// ---------------------------------------------------------------------
// Froglok Tad Tongues
// ---------------------------------------------------------------------
{
  const zoneId = "zone:swamp-of-no-hope";
  const giverId = "npc:swamp-of-no-hope:captain-nedar";
  addGiver(giverId, "Captain Nedar", zoneId);

  const questId = "quest:froglok-tad-tongues";
  addNode({
    id: questId,
    label: "Froglok Tad Tongues",
    type: "quest",
    description: "Captain Nedar, on a second-floor balcony near Cabilis in the Swamp of No Hope (daytime only), trades 4 froglok tad tongues for coin, experience, and faction. Iksar only.",
    minLevel: 1,
    steps: [
      "Find Captain Nedar on a second-floor balcony near Cabilis, during the day",
      "Hunt froglok tads for 4 froglok tad tongues",
      "Return the tongues to Captain Nedar",
    ],
    wiki_title: "Froglok Tad Tongues",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Legion of Cabilis");
  addFactionReward(questId, "Cabilis Residents");
  addFactionReward(questId, "Scaled Mystics");
  addFactionReward(questId, "Crusaders Of Greenmist");
  addFactionReward(questId, "Swift Tails");
}

// ---------------------------------------------------------------------
// Fusibility Research
// ---------------------------------------------------------------------
{
  const zoneId = "zone:western-wastes";
  const giverId = "npc:western-wastes:makil-rargon";
  addGiver(giverId, "Makil Rargon", zoneId);

  const questId = "quest:fusibility-research";
  addNode({
    id: questId,
    label: "Fusibility Research",
    type: "quest",
    description: "Makil Rargon in Western Wastes hands out an Empty Fusible Ore Crate. Filling it with Fusible Coral Ore (Phinigel Autropos, Kedge Keep), Fusible Earthen Ore (Master Yael, The Hole), Fusible Igneous Ore (ground spawn, Skyfire Mountains), and Fusible Velium Ore (Guardian Kozzalym, Western Wastes) and returning it yields Strength of the Elements.",
    minLevel: 40,
    steps: [
      "Receive an Empty Fusible Ore Crate from Makil Rargon",
      "Obtain Fusible Coral Ore from Phinigel Autropos in Kedge Keep",
      "Obtain Fusible Earthen Ore from Master Yael in The Hole",
      "Obtain Fusible Igneous Ore as a ground spawn in Skyfire Mountains",
      "Obtain Fusible Velium Ore from Guardian Kozzalym in Western Wastes",
      "Combine all four ores in the crate and return the Full Crate of Fusible Ore to Makil Rargon",
    ],
    wiki_title: "Fusibility Research",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:kedge-keep", "located_in");
  addEdge(questId, "zone:the-hole", "located_in");
  addEdge(questId, "zone:skyfire-mountains", "located_in");
  addFactionReward(questId, "Temple of Sol Ro");

  const shoulderId = "item:strength-of-the-elements";
  addNode({
    id: shoulderId,
    label: "Strength of the Elements",
    type: "item",
    slots: ["Shoulders"],
    ac: 15,
    stats: { str: 15 },
    hp: 100,
    resists: { fire: 15, cold: 15 },
    source: "Fusibility Research reward (Makil Rargon, Western Wastes)",
  });
  addEdge(questId, shoulderId, "rewards");
}

// ---------------------------------------------------------------------
// Gharin's Note (evil)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:qeynos-aqueducts";
  const giverId = "npc:qeynos-aqueducts:nomaria-doseniar";
  addGiver(giverId, "Nomaria Doseniar", zoneId);
  const gharinId = "npc:south-qeynos:gharin";
  addGiver(gharinId, "Gharin", "zone:south-qeynos");

  const questId = "quest:gharins-note-evil";
  addNode({
    id: questId,
    label: "Gharin's Note (evil)",
    type: "quest",
    description: "Nomaria Doseniar in the Qeynos Aqueducts sends the player to trade 4 Crows Special Brew to Gharin in South Qeynos for a Sealed Letter, which is returned to Nomaria Doseniar and forged before delivery to Te'Anara in Surefall Glade -- the evil-aligned counterpart to Gharin's Note (good). All classes.",
    minLevel: 1,
    steps: [
      "Obtain 4 Crows Special Brew from Crow",
      "Trade the brew to Gharin in South Qeynos for A Sealed Letter",
      "Return the letter to Nomaria Doseniar in the Qeynos Aqueducts",
      "Deliver the forged note to Te'Anara in Surefall Glade",
    ],
    wiki_title: "Gharin's Note (evil)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:south-qeynos", "located_in");
  addEdge(questId, "zone:surefall-glade", "located_in");
  addFactionReward(questId, "Bloodsabers");
  addFactionReward(questId, "Opal Dark Briar");
  addFactionReward(questId, "Unkempt Druids");
}

// ---------------------------------------------------------------------
// Giant Helmets
// ---------------------------------------------------------------------
{
  const zoneId = "zone:icewell-keep";
  const giverId = "npc:icewell-keep:chamberlain-krystorf";
  addGiver(giverId, "Chamberlain Krystorf", zoneId);

  const questId = "quest:giant-helmets";
  addNode({
    id: questId,
    label: "Giant Helmets",
    type: "quest",
    description: "Chamberlain Krystorf in Icewell Keep repeatedly trades 4 Giant Warrior Helmets (dropped by giants in Kael Drakkel) at a time for platinum, experience, and faction with Dain Frostreaver IV and Coldain.",
    minLevel: 45,
    steps: [
      "Defeat giants in Kael Drakkel for Giant Warrior Helmets",
      "Turn in 4 helmets at a time to Chamberlain Krystorf in Icewell Keep",
    ],
    wiki_title: "Giant Helmets",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:kael-drakkal", "located_in");
  addFactionReward(questId, "Dain Frostreaver IV");
  addFactionReward(questId, "Coldain");
}

// ---------------------------------------------------------------------
// Gloves of Earthcrafting Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:plane-of-growth";
  const giverId = "npc:plane-of-growth:tunarean-earthmelder";
  addGiver(giverId, "Tunarean Earthmelder", zoneId);

  const questId = "quest:gloves-of-earthcrafting-quest";
  addNode({
    id: questId,
    label: "Gloves of Earthcrafting Quest",
    type: "quest",
    classes: ["druid"],
    description: "Tunarean Earthmelder in the Plane of Growth trades the heads of Priest Grenk, Priest Bjek, and Priest Delar (each wandering The Wakening Land, 24-hour respawn) plus Derakor the Vindicator (behind the ice wall near Kael's temple) for Gloves of Earthcrafting. Level 46+ Druids who worship Tunare only.",
    minLevel: 46,
    steps: [
      "Defeat Priest Grenk, Priest Bjek, and Priest Delar in The Wakening Land for their heads",
      "Defeat Derakor the Vindicator behind the ice wall near Kael's temple for his head",
      "Return all four heads to Tunarean Earthmelder in the Plane of Growth",
    ],
    wiki_title: "Gloves of Earthcrafting Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:the-wakening-land", "located_in");
  addEdge(questId, "zone:kael-drakkal", "located_in");

  const glovesId = "item:gloves-of-earthcrafting";
  addNode({
    id: glovesId,
    label: "Gloves of Earthcrafting",
    type: "item",
    slots: ["Hands"],
    classes: ["druid"],
    ac: 10,
    stats: { str: 5, wis: 12 },
    mana: 50,
    resists: { fire: 5, cold: 5, magic: 5 },
    effect: "Shield of Thorns",
    source: "Gloves of Earthcrafting Quest reward (Tunarean Earthmelder, Plane of Growth) -- bound to Druids of Human, Elf, or Half-Elf race who worship Tunare",
  });
  addEdge(questId, glovesId, "rewards");
}

save();
console.log("Migration 065 complete: added 24 more quests from GitHub issue #26's checklist");
