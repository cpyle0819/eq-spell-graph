/**
 * Migration 088: 9 more standalone quests off GitHub issue #26's checklist
 * -- the "Screaming Mace Quest" through "Shaman's Velium Sleeves" run --
 * plus 10 quest_group clusters and 6 new spell nodes surfaced along the way.
 * Researched directly against eqlwiki.com, following
 * decisions/eqlwiki-quest-research-method.md.
 *
 * New zone (per the issue's own zone-creation guardrail -- confirmed a real
 * separate zone, not a sub-location): Old Sebilis. Its own eqlwiki.com page
 * confirms a standalone zone-line ("Sebilis can be reached through
 * Trakanon's Teeth, through a portal buried under the ruins of the city
 * above"), reached only via a key-gated portal from Trakanon's Teeth, with
 * two independent dungeon levels of its own. No faction table quoted on the
 * page, so it gets the same "uninhabited wilderness" template migrations
 * 020/052/087 use when eqlwiki.com documents no specific race/class/deity
 * gate. Required because Trakanon's Tooth -- one of the Key to Veeshan's
 * Peak sub-quest's turn-in items -- drops from Trakanon himself there
 * (decisions/quest-reward-modeling.md's broadened `located_in`).
 *
 * `quest_group` (10 sibling-set clusters, no ordering between members):
 * - Sebilis and Veeshan's Peak Key Quest (2 independent key turn-ins, one
 *   giver, same shape as Armor of Ro)
 * - Shadow Knight Plane of Sky Tests, Shaman Plane of Sky Tests (director
 *   NPC hands off to one of two sub-administrators, same shape as migration
 *   087's Rogue Plane of Sky Tests)
 * - ShadowBound Armor Quests (3 independent piece turn-ins, one giver,
 *   Necromancer-only)
 * - Shadowknight Kael/Skyshrine/Thurgadin Armor Quests, Shaman
 *   Kael/Skyshrine/Thurgadin Armor Quests (7 independent piece turn-ins
 *   each, one giver per zone, same shape as migration 087's Rogue armor
 *   quest groups)
 *
 * Deferred, not modeled (per the issue's own guardrail: a standalone
 * checklist entry that turns out to be a genuine multi-stage questline gets
 * deferred to the Questlines section for a dedicated pass, not modeled
 * piecemeal -- added as new bullets there in this same pass):
 * - Shadowknight Epic Quest -- eqlwiki.com confirms a 5-stage ordered chain
 *   (Letter to Duriek -> Dusty Tome -> Corrupted Ghoulbane -> Dark Shroud ->
 *   Lhranc's Coin) ending in Innoruuk's Curse.
 * - Shaman Epic Quest -- eqlwiki.com confirms a 14-stage ordered chain
 *   (lesser spirit gem turn-ins through Lord Rak'Ashiir's Iksar Scale)
 *   ending in Spear of Fate.
 * - Shaman Skull Quests -- eqlwiki.com confirms 5 sequential turn-ins to
 *   Hierophant Oxyn in East Cabilis where each stage's reward Iron Cudgel
 *   is itself required as the next stage's turn-in (Clairvoyant -> Seer ->
 *   Mystic -> Prophet -> Channeler), a genuine ordered `requires` chain, not
 *   an unordered group like the armor quest sets above.
 *
 * Skipped and tagged broken (not modeled, per the issue's own guardrail,
 * quoting the wiki's own disclaimer):
 * - Scroll of G'han -- "This is an unsolved or broken quest."
 * - Shakey the Scarecrow's Head -- "This is a broken quest, as it was
 *   unfinished as implemented in classic EverQuest."
 *
 * Not a new node -- reuses an existing sub-quest (per
 * decisions/eqlwiki-quest-research-method.md's "a 'quest' name isn't always
 * its own authoritative page" gotcha):
 * - Shaman's Velium Sleeves -- same giver (Terman Underbelly, Thurgadin),
 *   same turn-in (Corroded Chain Sleeves + 3 Jaundice Gems), and same
 *   reward (Rune Crafter's Vambraces) as the Vambraces sub-quest already
 *   modeled under Shaman Thurgadin Armor Quests below -- just the wiki's
 *   colloquial name for that one piece, not a separate quest.
 *
 * New spell nodes (Shaman Spells (Evil - Iksar)/(Evil)/(Good) all share the
 * same 4-spell random reward pool -- verified as genuinely identical across
 * all three near-identical pages, not a WebFetch cross-contamination
 * artifact per decisions/eqlwiki-quest-research-method.md's summarizer
 * gotcha, by re-fetching each page's own title/NPC-dialogue quote
 * independently): Cripple, Insidious Decay, Shroud of the Spirits, Spirit
 * of Scale, Talisman of Shadoo, Torrent of Poison. Pulled from the
 * MediaWiki API's raw wikitext (action=query&prop=revisions), not a
 * rendered/summarized page, same precision precedent as migration 085.
 *
 * Deliberately NOT modeled (consistent with every migration so far):
 * - Negative faction changes throughout (decisions/quest-reward-modeling.md
 *   only models positive rewards): Second Test of Kejaar's High
 *   Council/Guard/Merchants of Erudin loss, Sentry Xyrin Quest's Freeport
 *   Militia loss, Series C Black Boxes' Dark Reflection/Clan Grikbar loss,
 *   Shakey's Stuffing's Unkempt Druids loss.
 * - Coin rewards throughout (Series C Black Boxes' 6 copper).
 * - Screaming Mace Quest's intermediate turn-in rewards (Unfinished Blade
 *   Mold, Unfinished Sledge Mold, Dwarven Mace, Prayer Cloth of Tunare) --
 *   each consumed toward the final Screaming Mace turn-in, same "pass-
 *   through trade goods rather than a kept reward" treatment migration 087
 *   gave Rogue Redemption's intermediate items; only the final Screaming
 *   Mace gets a `rewards` edge.
 * - Visage of Life's "Deity: Tunare" restriction (Scrolls of the Ancient
 *   Totem's reward) -- `item` has no deity field (decisions/item-node-
 *   schema.md); noted in the item's own `source` prose instead of adding
 *   a one-off field.
 * - Sebilis and Veeshan's Peak Key Quest's three "(quest)" turn-in
 *   medallions (Jarsath/Obulus/Kylong) -- each is itself another quest's
 *   reward, out of scope for this pass; left as prose in `steps`, not
 *   chased down as separate quest research (consistent with not fabricating
 *   a page that wasn't the one requested).
 * - Series C Black Boxes' "Amiable or better faction with King Ak'Anon"
 *   prerequisite -- no field for quest prerequisites-by-faction, prose only.
 *
 * Random-choice reward (decisions/quest-reward-modeling.md's `randomGroup`):
 * Shakey's Stuffing ("You receive... either the Wee Harvester or Belt of
 * the River" -- confirmed not a player choice); Shaman Spells (Evil -
 * Iksar)/(Evil)/(Good), each with its own `randomGroup` key even though all
 * three share the same 4-spell pool, since the pool is drawn independently
 * per quest/giver.
 *
 * Reused existing nodes: none needed new zones beyond Old Sebilis -- every
 * other zone touched (Crushbone, Plane of Growth, Trakanon's Teeth, Kerra
 * Island, Toxxulia Forest, Ocean of Tears, North Freeport, Ak'Anon,
 * Rivervale, West Karana, The Feerrott, Temple of Solusek Ro, Kael Drakkal,
 * Skyshrine, Thurgadin, Plane of Sky, East Cabilis, The Overthere, Firiona
 * Vie) already exists in the graph.
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, addFactionReward, addGiver, slug, save } = loadGraph(import.meta.dir);

const ALL_BUT_CASTERS = [
  "warrior",
  "cleric",
  "paladin",
  "ranger",
  "shadow knight",
  "druid",
  "monk",
  "bard",
  "rogue",
  "shaman",
  "beastlord",
];

// ---------------------------------------------------------------------
// Old Sebilis (zone) -- new, real separate zone, no documented faction
// table, so it gets the "uninhabited wilderness" default
// ---------------------------------------------------------------------
const WILDERNESS_FACTION = {
  race: {
    barbarian: "neutral",
    "dark elf": "neutral",
    dwarf: "neutral",
    erudite: "neutral",
    gnome: "neutral",
    "half elf": "neutral",
    halfling: "neutral",
    "high elf": "neutral",
    human: "neutral",
    iksar: "neutral",
    ogre: "neutral",
    troll: "neutral",
    "wood elf": "neutral",
  },
  class: {
    bard: "safe",
    beastlord: "safe",
    cleric: "safe",
    druid: "safe",
    enchanter: "safe",
    magician: "safe",
    monk: "safe",
    necromancer: "safe",
    paladin: "safe",
    ranger: "safe",
    rogue: "safe",
    "shadow knight": "safe",
    shaman: "safe",
    warrior: "safe",
    wizard: "safe",
  },
  deity: {
    agnostic: "neutral",
    bertoxxulous: "neutral",
    "brell serilis": "neutral",
    bristlebane: "neutral",
    "cazic-thule": "neutral",
    "erollisi marr": "neutral",
    innoruuk: "neutral",
    karana: "neutral",
    "mithaniel marr": "neutral",
    prexus: "neutral",
    quellious: "neutral",
    "rallos zek": "neutral",
    "rodcet nife": "neutral",
    "solusek ro": "neutral",
    "the tribunal": "neutral",
    tunare: "neutral",
    veeshan: "neutral",
  },
};

const oldSebilisId = "zone:old-sebilis";
addNode({ id: oldSebilisId, label: "Old Sebilis", type: "zone", faction: structuredClone(WILDERNESS_FACTION) });
addEdge(oldSebilisId, "zone:trakanons-teeth", "connects_to", { transport: "portal" });
addEdge("zone:trakanons-teeth", oldSebilisId, "connects_to", { transport: "portal" });

// ---------------------------------------------------------------------
// Screaming Mace Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:crushbone";
  const smithId = "npc:crushbone:dwarven-smith";
  const priestId = "npc:crushbone:elven-priest";
  addGiver(smithId, "Dwarven Smith", zoneId);
  addGiver(priestId, "Elven Priest", zoneId);

  const questId = "quest:screaming-mace-quest";
  addNode({
    id: questId,
    label: "Screaming Mace Quest",
    type: "quest",
    classes: ALL_BUT_CASTERS,
    description:
      "A dwarven smith in the slaver cabin at Crushbone trades a Brass Earring, Shiny Brass Shield, and Dwarven Ringmail Tunic (dropped by orc taskmasters, trainers, and Emperor Crush) in sequence for mold pieces and a Dwarven Mace. An elven priest in the same cabin trades Bracers of Battle (dropped by an orc warlord), or the password \"The king is dead,\" for a Prayer Cloth of Tunare. Handing the elven priest both the Dwarven Mace and Prayer Cloth of Tunare completes the quest for the Screaming Mace.",
    minLevel: 18,
    steps: [
      "Kill an orc taskmaster in Crushbone for a Brass Earring and hand it to the dwarven smith for an Unfinished Blade Mold",
      "Kill an orc trainer for a Shiny Brass Shield and hand it to the dwarven smith for an Unfinished Sledge Mold",
      "Kill Emperor Crush for a Dwarven Ringmail Tunic and hand it to the dwarven smith for the Dwarven Mace",
      "Kill an orc warlord for Bracers of Battle, or say \"The king is dead\" to the elven priest, for a Prayer Cloth of Tunare",
      "Hand the elven priest both the Dwarven Mace and Prayer Cloth of Tunare for the Screaming Mace",
    ],
    wiki_title: "Screaming Mace Quest",
  });
  addEdge(smithId, questId, "starts");
  addEdge(priestId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const maceId = "item:screaming-mace";
  addNode({
    id: maceId,
    label: "Screaming Mace",
    type: "item",
    slots: ["Primary", "Secondary"],
    classes: ALL_BUT_CASTERS,
    skill: "1H Blunt",
    damage: 8,
    delay: 35,
    weight: 8.0,
    size: "Medium",
    magic: true,
    effect: "Screaming Mace (combat proc, instant cast) at Level 10",
    source: "Screaming Mace Quest reward (elven priest, Crushbone)",
  });
  addEdge(questId, maceId, "rewards");
}

// ---------------------------------------------------------------------
// Scrolls of the Ancient Totem
// ---------------------------------------------------------------------
{
  const zoneId = "zone:plane-of-growth";
  const giverId = "npc:plane-of-growth:ancient-totem";
  addGiver(giverId, "Ancient Totem", zoneId);

  const questId = "quest:scrolls-of-the-ancient-totem";
  addNode({
    id: questId,
    label: "Scrolls of the Ancient Totem",
    type: "quest",
    classes: ["wizard"],
    description:
      "The Ancient Totem in the Plane of Growth trades four scrolls (Scroll of Power, Scroll of Enlightenment, Scroll of Insight, Scroll of Knowledge), looted from level 60 named rats in Dragon Necropolis, for the Visage of Life.",
    minLevel: 55,
    steps: [
      "Kill named level 60 rats in Dragon Necropolis for Scroll of Power, Scroll of Enlightenment, Scroll of Insight, and Scroll of Knowledge",
      "Turn in all four scrolls to the Ancient Totem in the Plane of Growth",
    ],
    wiki_title: "Scrolls of the Ancient Totem",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:dragon-necropolis", "located_in");

  const visageId = "item:visage-of-life";
  addNode({
    id: visageId,
    label: "Visage of Life",
    type: "item",
    slots: ["Face"],
    classes: ["wizard"],
    race: ["high elf"],
    magic: true,
    lore: true,
    noTrade: true,
    ac: 8,
    stats: { sta: 5, int: 10 },
    mana: 40,
    resists: { fire: 10, cold: 10, magic: 5 },
    weight: 2.0,
    size: "Small",
    source: "Scrolls of the Ancient Totem reward (Ancient Totem, Plane of Growth); also restricted to Tunare worshippers per eqlwiki.com's \"Deity: Tunare\" line",
  });
  addEdge(questId, visageId, "rewards");
}

// ---------------------------------------------------------------------
// Second Test of Kejaar
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kerra-island";
  const giverId = "npc:kerra-island:shazda-asad";
  addGiver(giverId, "Shazda Asad", zoneId);

  const questId = "quest:second-test-of-kejaar";
  addNode({
    id: questId,
    label: "Second Test of Kejaar",
    type: "quest",
    classes: ["bard", "cleric", "druid", "monk", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"],
    description:
      "Shazda Asad on Kerra Island sends players to defeat Sentinel Creot, a level 30 Paladin who wanders the shore of Toxxulia Forest between the Wizard Hut and the Western Dock, for his head. Faction gains with Kerra Isle and Heretics.",
    minLevel: 30,
    steps: [
      "Speak with Shazda Asad on Kerra Island",
      "Defeat Sentinel Creot along the shore of Toxxulia Forest",
      "Loot Sentinel Creot's Head and return it to Shazda Asad",
    ],
    wiki_title: "Second Test of Kejaar",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:toxxulia-forest", "located_in");
  addFactionReward(questId, "Kerra Isle");
  addFactionReward(questId, "Heretics");

  const bracerId = "item:sejah-ghulam-bracer";
  addNode({
    id: bracerId,
    label: "Sejah Ghulam Bracer",
    type: "item",
    slots: ["Wrist"],
    lore: true,
    noTrade: true,
    ac: 5,
    stats: { dex: 5, sta: 3 },
    weight: 0.2,
    source: "Second Test of Kejaar reward (Shazda Asad, Kerra Island)",
  });
  addEdge(questId, bracerId, "rewards");
}

// ---------------------------------------------------------------------
// Sentry Xyrin Quest
// ---------------------------------------------------------------------
{
  const startZoneId = "zone:north-freeport";
  const oceanZoneId = "zone:ocean-of-tears";
  const giverId = "npc:north-freeport:serna-tasknon";
  addGiver(giverId, "Serna Tasknon", startZoneId);

  const questId = "quest:sentry-xyrin-quest";
  addNode({
    id: questId,
    label: "Sentry Xyrin Quest",
    type: "quest",
    classes: ["paladin"],
    description:
      "Serna Tasknon at the Temple of Marr in North Freeport hands Paladins a Potion of Marr, delivered to eight sentries (Andlin through Warren) at the Temple in alphabetical order, then refilled and given to Sentry Xyrin on the undead island in Ocean of Tears for the Deepwater Harpoon. Faction gains with Priests of Marr and Knights of Truth per sentry.",
    minLevel: 40,
    steps: [
      "Receive a Potion of Marr from Serna Tasknon at the Temple of Marr in North Freeport",
      "Deliver the potion to all eight sentries (Andlin through Warren) at the Temple, in alphabetical order",
      "Refill the potion and carry it to Sentry Xyrin on the undead island in Ocean of Tears",
    ],
    wiki_title: "Sentry Xyrin Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, startZoneId, "starts_in");
  addEdge(questId, startZoneId, "located_in");
  addEdge(questId, oceanZoneId, "located_in");
  addFactionReward(questId, "Priests of Marr");
  addFactionReward(questId, "Knights of Truth");

  const harpoonId = "item:deepwater-harpoon";
  addNode({
    id: harpoonId,
    label: "Deepwater Harpoon",
    type: "item",
    slots: ["Primary", "Secondary"],
    classes: ["paladin"],
    skill: "2H Slashing",
    damage: 18,
    delay: 40,
    weight: 13.0,
    magic: true,
    stats: { sta: 5, wis: 5 },
    source: "Sentry Xyrin Quest reward (Sentry Xyrin, Ocean of Tears)",
  });
  addEdge(questId, harpoonId, "rewards");
}

// ---------------------------------------------------------------------
// Series C Black Boxes
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ak-anon";
  const giverId = "npc:ak-anon:manik-compolten";
  addGiver(giverId, "Manik Compolten", zoneId);

  const questId = "quest:series-c-black-boxes";
  addNode({
    id: questId,
    label: "Series C Black Boxes",
    type: "quest",
    description:
      "Manik Compolten in the Gem Choppers hall in Ak'Anon (requires Amiable or better faction with King Ak'Anon) sends players to give a Shiny Card to four roaming clockwork spiders (Clockwork XIIC, XVIIC, XXVIC, XXVIIC) for their blackboxes, turned in together for experience, then relayed through Jogl Doobraugh and Drekon Vebnebber for a Daily Log and further experience. Faction gains with Gem Choppers, Merchants of AkAnon, and King AkAnon.",
    minLevel: 1,
    steps: [
      "Give a Shiny Card to each of the four clockwork spiders (XIIC, XVIIC, XXVIC, XXVIIC) around Ak'Anon for their blackboxes",
      "Turn in all four blackboxes to Manik Compolten",
      "Give the returned blackbox to Jogl Doobraugh for a Daily Log",
      "Give the Daily Log to Drekon Vebnebber",
    ],
    wiki_title: "Series C Black Boxes",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Gem Choppers");
  addFactionReward(questId, "Merchants of AkAnon");
  addFactionReward(questId, "King AkAnon");
}

// ---------------------------------------------------------------------
// Shakey's Stuffing
// ---------------------------------------------------------------------
{
  const zoneId = "zone:rivervale";
  const giverId = "npc:rivervale:shakey-scarecrow";
  addGiver(giverId, "Shakey Scarecrow", zoneId);

  const questId = "quest:shakeys-stuffing";
  addNode({
    id: questId,
    label: "Shakey's Stuffing",
    type: "quest",
    description:
      "Shakey Scarecrow in Rivervale trades a Sack of Cursed Hay combined with Blessed Oil (a Sack of Hay from West Karana, turned cursed by Roror in The Feerrott for 66 gold, combined with a Blessed Oil Flask from Nomsoe Jusagta at the Temple of Life in North Qeynos) for a random reward: either the Wee Harvester or the Belt of the River. Faction gains with Storm Reapers, Mayor Gubbin, and Merchants of Rivervale.",
    minLevel: 1,
    steps: [
      "Buy a Sack of Hay from Cleet Miller's farm in West Karana",
      "Trade the Sack of Hay plus 66 gold to Roror in The Feerrott for a Sack of Cursed Hay",
      "Get a Blessed Oil Flask from Nomsoe Jusagta at the Temple of Life in North Qeynos",
      "Combine the cursed hay and blessed oil in any non-cultural forge",
      "Turn in the combined item to Shakey Scarecrow in Rivervale for a random reward",
    ],
    wiki_title: "Shakey's Stuffing",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:west-karana", "located_in");
  addEdge(questId, "zone:the-feerrott", "located_in");
  addEdge(questId, "zone:north-qeynos", "located_in");
  addFactionReward(questId, "Storm Reapers");
  addFactionReward(questId, "Mayor Gubbin");
  addFactionReward(questId, "Merchants of Rivervale");

  const harvesterId = "item:wee-harvester";
  addNode({
    id: harvesterId,
    label: "Wee Harvester",
    type: "item",
    slots: ["Primary"],
    classes: ["druid"],
    race: ["human", "wood elf", "half elf", "halfling"],
    skill: "2H Blunt",
    damage: 10,
    magic: true,
    stats: { str: 1, sta: 1, wis: 3 },
    effect: "Summon Food",
    source: "Shakey's Stuffing random reward (Shakey Scarecrow, Rivervale)",
  });
  addEdge(questId, harvesterId, "rewards", { randomGroup: "shakeys-stuffing-drop" });

  const beltId = "item:belt-of-the-river";
  addNode({
    id: beltId,
    label: "Belt of the River",
    type: "item",
    slots: ["Waist"],
    classes: ["warrior", "cleric", "paladin", "ranger", "druid", "rogue"],
    race: ["halfling"],
    magic: true,
    ac: 5,
    stats: { str: 5, sta: 5 },
    resists: { cold: -10 },
    effect: "Summon Drink",
    source: "Shakey's Stuffing random reward (Shakey Scarecrow, Rivervale)",
  });
  addEdge(questId, beltId, "rewards", { randomGroup: "shakeys-stuffing-drop" });
}

// ---------------------------------------------------------------------
// Sebilis and Veeshan's Peak Key Quest (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:trakanons-teeth";
  const giverId = "npc:trakanons-teeth:emperor-ganak";
  addGiver(giverId, "Emperor Ganak", zoneId);

  const groupId = "quest_group:sebilis-and-veeshans-peak-key-quest";
  addNode({
    id: groupId,
    label: "Sebilis and Veeshan's Peak Key Quest",
    type: "quest_group",
    description:
      "Emperor Ganak in Trakanon's Teeth silently accepts two independent medallion turn-ins for dungeon keys: a pair of froglok medallions for the Key to Old Sebilis, and three quest medallions plus Trakanon's Tooth for the Key to Veeshan's Peak.",
    wiki_title: "Sebilis and Veeshan's Peak Key Quest",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const oldSebilisQuestId = "quest:key-to-old-sebilis";
  addNode({
    id: oldSebilisQuestId,
    label: "Sebilis and Veeshan's Peak Key Quest: Key to Old Sebilis",
    type: "quest",
    description:
      "Hand Emperor Ganak a Medallion of the Kunzar (dropped by a froglok forager in Trakanon's Teeth) and a Medallion of the Nathsar (dropped by a froglok hunter in Trakanon's Teeth) for the Trakanon Idol, which unlocks Old Sebilis.",
    steps: [
      "Kill a froglok forager in Trakanon's Teeth for a Medallion of the Kunzar",
      "Kill a froglok hunter in Trakanon's Teeth for a Medallion of the Nathsar",
      "Turn in both medallions to Emperor Ganak",
    ],
    wiki_title: "Sebilis and Veeshan's Peak Key Quest",
  });
  addEdge(giverId, oldSebilisQuestId, "starts");
  addEdge(oldSebilisQuestId, zoneId, "starts_in");
  addEdge(oldSebilisQuestId, zoneId, "located_in");
  addEdge(oldSebilisQuestId, groupId, "member_of");

  const idolId = "item:trakanon-idol";
  addNode({
    id: idolId,
    label: "Trakanon Idol",
    type: "item",
    noTrade: true,
    weight: 1.0,
    size: "Small",
    source: "Key to Old Sebilis reward (Emperor Ganak, Trakanon's Teeth) -- unlocks Old Sebilis",
  });
  addEdge(oldSebilisQuestId, idolId, "rewards");

  const veeshansPeakQuestId = "quest:key-to-veeshans-peak";
  addNode({
    id: veeshansPeakQuestId,
    label: "Sebilis and Veeshan's Peak Key Quest: Key to Veeshan's Peak",
    type: "quest",
    description:
      "Hand Emperor Ganak a Medallion of the Jarsath, Medallion of the Obulus, and Medallion of the Kylong (each earned from a separate quest) plus Trakanon's Tooth (dropped by Trakanon himself in Old Sebilis) for the Key of Veeshan, which unlocks Veeshan's Peak.",
    steps: [
      "Earn a Medallion of the Jarsath, Medallion of the Obulus, and Medallion of the Kylong from their respective quests",
      "Kill Trakanon in Old Sebilis for Trakanon's Tooth",
      "Turn in all four items to Emperor Ganak",
    ],
    wiki_title: "Sebilis and Veeshan's Peak Key Quest",
  });
  addEdge(giverId, veeshansPeakQuestId, "starts");
  addEdge(veeshansPeakQuestId, zoneId, "starts_in");
  addEdge(veeshansPeakQuestId, zoneId, "located_in");
  addEdge(veeshansPeakQuestId, oldSebilisId, "located_in");
  addEdge(veeshansPeakQuestId, groupId, "member_of");

  const keyId = "item:key-of-veeshan";
  addNode({
    id: keyId,
    label: "Key of Veeshan",
    type: "item",
    noTrade: true,
    weight: 1.0,
    size: "Small",
    source: "Key to Veeshan's Peak reward (Emperor Ganak, Trakanon's Teeth) -- unlocks Veeshan's Peak",
  });
  addEdge(veeshansPeakQuestId, keyId, "rewards");
}

// ---------------------------------------------------------------------
// Shadow Knight Plane of Sky Tests (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:plane-of-sky";
  const sarkisId = "npc:plane-of-sky:sarkis-ebonblade";
  const gragrotId = "npc:plane-of-sky:gragrot";
  const tyniconId = "npc:plane-of-sky:tynicon-dlin";
  addGiver(sarkisId, "Sarkis Ebonblade", zoneId);
  addGiver(gragrotId, "Gragrot", zoneId);
  addGiver(tyniconId, "Tynicon DLin", zoneId);

  const groupId = "quest_group:shadow-knight-plane-of-sky-tests";
  addNode({
    id: groupId,
    label: "Shadow Knight Plane of Sky Tests",
    type: "quest_group",
    description:
      "Sarkis Ebonblade in the Plane of Sky directs Shadow Knights to choose between two apprentices, Gragrot or Tynicon DLin, each offering independent item-turn-in tests for a named reward. Seven independent sub-quests, no ordering between them.",
    classes: ["shadow knight"],
    wiki_title: "Shadow Knight Plane of Sky Tests",
  });
  addEdge(sarkisId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const tests: Array<{
    label: string;
    giverId: string;
    giverLabel: string;
    items: string;
    reward: string;
    ac: number;
    stats: Record<string, number>;
    resists?: Record<string, number>;
    mana?: number;
    effect?: string;
    slots?: string[];
    skill?: string;
    damage?: number;
    delay?: number;
  }> = [
    { label: "Test of Bash", giverId: gragrotId, giverLabel: "Gragrot", items: "an Ebon Tessera, Sphinx Eye Opal, and Finely Crafted Amulet", reward: "Amulet of the Sphinx Eye", slots: ["Neck"], ac: 15, stats: { str: 7, cha: 3, wis: 3, int: 14 }, mana: 25, effect: "Ultravision" },
    { label: "Test of Smash", giverId: gragrotId, giverLabel: "Gragrot", items: "a Copper Disc, Small Sapphire, and Silvery Ring", reward: "Crimson Ring of the Djinni", slots: ["Finger"], ac: 8, stats: { str: 7, dex: 7, int: 5 }, resists: { magic: 5 } },
    { label: "Test of Slash", giverId: gragrotId, giverLabel: "Gragrot", items: "a Diaphanous Globe, Dried Leather, and Finely Woven Cloth Belt", reward: "Pegasus-Hide Belt", slots: ["Waist"], ac: 8, stats: { str: 6, int: 6, agi: 6 }, effect: "Haste +41%" },
    { label: "Test of Disempowerment", giverId: tyniconId, giverLabel: "Tynicon DLin", items: "a Griffon Statuette, Blood Sky Emerald, and Rusted Pauldrons", reward: "Blood Sky Face Plate", slots: ["Face"], ac: 9, stats: { str: 10, dex: 12 }, mana: 60, resists: { disease: 10 } },
    { label: "Test of Envenoming", giverId: tyniconId, giverLabel: "Tynicon DLin", items: "a Dark Spiroc Feather, Obsidian Shard, and Efreeti War Shield", reward: "Obtenebrate Mithril Guard", slots: ["Secondary"], ac: 35, stats: { str: 15 }, resists: { fire: 15 } },
    { label: "Test of Raising of the Dead", giverId: tyniconId, giverLabel: "Tynicon DLin", items: "a Large Sky Pearl, Jar of Honey, Sphinxian Ring, and Fae Pauldrons", reward: "Pearlescent Pauldrons", slots: ["Shoulders"], ac: 10, stats: { str: 10, dex: 15, int: 15 }, mana: 50 },
    { label: "Test of Necropotence", giverId: tyniconId, giverLabel: "Tynicon DLin", items: "an Efreeti War Axe, Dulcet Nectar, Bloodstained Hilt, and Blood Sky Ruby", reward: "Khyldorn the Blood Drinker", slots: ["Primary"], skill: "2H Slashing", damage: 36, delay: 43, ac: 0, stats: { str: 10, int: 7 }, effect: "Siphon at Level 50" },
  ];
  for (const test of tests) {
    const questId = `quest:shadow-knight-plane-of-sky-${slug(test.label)}`;
    addNode({
      id: questId,
      label: `Shadow Knight Plane of Sky Tests: ${test.label}`,
      type: "quest",
      classes: ["shadow knight"],
      description: `Bring ${test.items} to ${test.giverLabel} in the Plane of Sky for the ${test.reward}.`,
      steps: [`Gather ${test.items}`, `Turn them in to ${test.giverLabel} in the Plane of Sky`],
      wiki_title: "Shadow Knight Plane of Sky Tests",
    });
    addEdge(test.giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, groupId, "member_of");

    const rewardId = `item:${slug(test.reward)}`;
    addNode({
      id: rewardId,
      label: test.reward,
      type: "item",
      classes: ["shadow knight"],
      magic: true,
      ...(test.slots ? { slots: test.slots } : {}),
      ...(test.skill ? { skill: test.skill } : {}),
      ...(test.damage !== undefined ? { damage: test.damage } : {}),
      ...(test.delay !== undefined ? { delay: test.delay } : {}),
      ...(test.ac ? { ac: test.ac } : {}),
      stats: test.stats,
      ...(test.mana !== undefined ? { mana: test.mana } : {}),
      ...(test.resists ? { resists: test.resists } : {}),
      ...(test.effect ? { effect: test.effect } : {}),
      source: `Shadow Knight Plane of Sky Tests: ${test.label} reward (${test.giverLabel}, Plane of Sky)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// ---------------------------------------------------------------------
// ShadowBound Armor Quests (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:temple-of-solusek-ro";
  const giverId = "npc:temple-of-solusek-ro:syllina";
  addGiver(giverId, "Syllina", zoneId);

  const groupId = "quest_group:shadowbound-armor-quests";
  addNode({
    id: groupId,
    label: "ShadowBound Armor Quests",
    type: "quest_group",
    description:
      "Syllina in Temple of Solusek Ro trades sets of named reagents for ShadowBound armor pieces. Three independent sub-quests, no ordering between them.",
    classes: ["necromancer"],
    wiki_title: "ShadowBound Armor Quests",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const pieces: Array<{
    label: string;
    base: string;
    reward: string;
    slots: string[];
    ac: number;
    stats?: Record<string, number>;
    mana?: number;
    hp?: number;
    resists?: Record<string, number>;
    weight: number;
    effect?: string;
  }> = [
    { label: "Boots", base: "a Shadow Silk, Scepter of Sorrow, Eye of Shadow, and Skeletal Toe", reward: "ShadowBound Boots", slots: ["Feet"], ac: 5, hp: 15, mana: 15, weight: 1.2 },
    { label: "Gloves", base: "an Inky Shadow Silk, Scepter of Tears, Hand of Shadow, and Skeletal Finger", reward: "ShadowBound Gloves", slots: ["Hands"], ac: 6, stats: { str: 3, dex: 3, int: 3 }, mana: 3, weight: 0.7 },
    { label: "Robe", base: "a Large Shadow Silk, Werebat Wing, Mask of Shadow, and Globe of Shadow", reward: "Robe of Enshroudment", slots: ["Chest"], ac: 9, stats: { int: 4, agi: 4 }, resists: { fire: 4, cold: 4 }, weight: 3.5, effect: "Focus: Reanimation Haste II" },
  ];
  for (const piece of pieces) {
    const questId = `quest:shadowbound-armor-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `ShadowBound Armor Quests: ${piece.label}`,
      type: "quest",
      classes: ["necromancer"],
      description: `Trade ${piece.base} to Syllina in Temple of Solusek Ro for the ${piece.reward}.`,
      minLevel: 24,
      steps: [`Gather ${piece.base}`, "Turn them in to Syllina in Temple of Solusek Ro"],
      wiki_title: "ShadowBound Armor Quests",
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, groupId, "member_of");

    const rewardId = `item:${slug(piece.reward)}`;
    addNode({
      id: rewardId,
      label: piece.reward,
      type: "item",
      classes: ["necromancer"],
      magic: true,
      slots: piece.slots,
      ac: piece.ac,
      ...(piece.stats ? { stats: piece.stats } : {}),
      ...(piece.mana !== undefined ? { mana: piece.mana } : {}),
      ...(piece.hp !== undefined ? { hp: piece.hp } : {}),
      ...(piece.resists ? { resists: piece.resists } : {}),
      weight: piece.weight,
      ...(piece.effect ? { effect: piece.effect } : {}),
      source: `ShadowBound Armor Quests: ${piece.label} reward (Syllina, Temple of Solusek Ro)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// ---------------------------------------------------------------------
// Shadowknight Kael Armor Quests (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const giverId = "npc:kael-drakkal:veldern-blackhammer";
  addGiver(giverId, "Veldern Blackhammer", zoneId);

  const groupId = "quest_group:shadowknight-kael-armor-quests";
  addNode({
    id: groupId,
    label: "Shadowknight Kael Armor Quests",
    type: "quest_group",
    description:
      "Veldern Blackhammer in Kael Drakkel trades an Ancient Tarnished Plate armor piece plus 3 matching gems for its corresponding piece of Malevolent armor. Seven independent sub-quests, no ordering between them. Requires ALLY faction with Kromzek.",
    classes: ["shadow knight"],
    wiki_title: "Shadowknight Kael Armor Quests",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const pieces = [
    { label: "Helm", base: "Ancient Tarnished Plate Helmet", gem: "3 Crushed Coral", reward: "Malevolent Crown", ac: 25, stats: { dex: 6, int: 6 }, hp: 30 },
    { label: "Breastplate", base: "Ancient Tarnished Breastplate", gem: "3 Flawless Diamond", reward: "Malevolent Breastplate", ac: 54, stats: { str: 15 }, hp: 40, mana: 60, effect: "Invigorate" },
    { label: "Vambraces", base: "Ancient Tarnished Vambraces", gem: "3 Flawed Emerald", reward: "Malevolent Vambraces", ac: 29, stats: { str: 4, int: 7 }, mana: 30 },
    { label: "Bracer", base: "Ancient Tarnished Plate Bracelet", gem: "3 Crushed Flame Emerald", reward: "Malevolent Bracer", ac: 21, stats: { dex: 3, int: 3 }, hp: 10, mana: 10 },
    { label: "Gauntlets", base: "Ancient Tarnished Plate Gauntlets", gem: "3 Crushed Topaz", reward: "Malevolent Gauntlets", ac: 21, stats: { str: 3, int: 3 }, mana: 10 },
    { label: "Greaves", base: "Ancient Tarnished Greaves", gem: "3 Flawed Sea Sapphire", reward: "Malevolent Greaves", ac: 36, stats: { str: 10 }, hp: 60 },
    { label: "Boots", base: "Ancient Tarnished Plate Boots", gem: "3 Crushed Black Marble", reward: "Malevolent Boots", ac: 28, stats: { str: 5, int: 3 } },
  ] as const;
  for (const piece of pieces) {
    const questId = `quest:shadowknight-kael-armor-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `Shadowknight Kael Armor Quests: ${piece.label}`,
      type: "quest",
      classes: ["shadow knight"],
      description: `Trade a ${piece.base} plus ${piece.gem} to Veldern Blackhammer in Kael Drakkel for the ${piece.reward}.`,
      steps: [`Gather a ${piece.base} and ${piece.gem}`, "Turn them in to Veldern Blackhammer in Kael Drakkel"],
      wiki_title: "Shadowknight Kael Armor Quests",
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, groupId, "member_of");

    const rewardId = `item:${slug(piece.reward)}`;
    addNode({
      id: rewardId,
      label: piece.reward,
      type: "item",
      classes: ["shadow knight"],
      magic: true,
      ac: piece.ac,
      stats: piece.stats,
      ...("hp" in piece ? { hp: piece.hp } : {}),
      ...("mana" in piece ? { mana: piece.mana } : {}),
      ...("effect" in piece ? { effect: piece.effect } : {}),
      source: `Shadowknight Kael Armor Quests: ${piece.label} reward (Veldern Blackhammer, Kael Drakkal)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// ---------------------------------------------------------------------
// Shadowknight Skyshrine Armor Quests (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:skyshrine";
  const giverId = "npc:skyshrine:onerind-fedhar";
  addGiver(giverId, "Onerind Fe`Dhar", zoneId);

  const groupId = "quest_group:shadowknight-skyshrine-armor-quests";
  addNode({
    id: groupId,
    label: "Shadowknight Skyshrine Armor Quests",
    type: "quest_group",
    description:
      "Onerind Fe`Dhar in Skyshrine trades an Unadorned Plate armor piece plus 3 matching gems for its corresponding piece of Blood Lord's armor. Seven independent sub-quests, no ordering between them. Requires ALLY faction with Claws of Veeshan.",
    classes: ["shadow knight"],
    wiki_title: "Shadowknight Skyshrine Armor Quests",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const pieces = [
    { label: "Helm", base: "Unadorned Plate Helmet", gem: "3 Crushed Coral", reward: "Blood Lord's Crown", ac: 22, stats: { str: 6, sta: 6, dex: 3 }, mana: 40, resists: { magic: 4, fire: 4 } },
    { label: "Breastplate", base: "Unadorned Breastplate", gem: "3 Flawless Diamond", reward: "Blood Lord's Breastplate", ac: 50, stats: { str: 9, dex: 9, int: 9, agi: 9, sta: 8 }, hp: 70, mana: 70, effect: "Invigorate" },
    { label: "Vambraces", base: "Unadorned Plate Vambraces", gem: "3 Flawed Emerald", reward: "Blood Lord's Vambraces", ac: 25, stats: { dex: 10 }, hp: 50, mana: 20 },
    { label: "Bracer", base: "Unadorned Plate Bracer", gem: "3 Crushed Flame Emerald", reward: "Blood Lord's Bracer", ac: 18, stats: { str: 4, int: 2 }, hp: 20, mana: 10 },
    { label: "Gauntlets", base: "Unadorned Plate Gauntlets", gem: "3 Crushed Topaz", reward: "Blood Lord's Gauntlets", ac: 18, stats: { str: 5, dex: 3, sta: 3, int: 3, agi: 3 }, mana: 10 },
    { label: "Greaves", base: "Unadorned Plate Greaves", gem: "3 Flawed Sea Sapphire", reward: "Blood Lord's Greaves", ac: 31, stats: { str: 6, sta: 9, int: 9 }, hp: 70, mana: 30, resists: { fire: 3, cold: 3, disease: 3, poison: 3, magic: 3 } },
    { label: "Boots", base: "Unadorned Plate Boots", gem: "3 Crushed Black Marble", reward: "Blood Lord's Boots", ac: 24, stats: { str: 4, sta: 6, int: 3 }, resists: { disease: 1, cold: 1, poison: 1 } },
  ] as const;
  for (const piece of pieces) {
    const questId = `quest:shadowknight-skyshrine-armor-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `Shadowknight Skyshrine Armor Quests: ${piece.label}`,
      type: "quest",
      classes: ["shadow knight"],
      description: `Trade an ${piece.base} plus ${piece.gem} to Onerind Fe\`Dhar in Skyshrine for the ${piece.reward}.`,
      steps: [`Gather an ${piece.base} and ${piece.gem}`, "Turn them in to Onerind Fe`Dhar in Skyshrine"],
      wiki_title: "Shadowknight Skyshrine Armor Quests",
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, groupId, "member_of");

    const rewardId = `item:${slug(piece.reward)}`;
    addNode({
      id: rewardId,
      label: piece.reward,
      type: "item",
      classes: ["shadow knight"],
      magic: true,
      ac: piece.ac,
      stats: piece.stats,
      ...("hp" in piece ? { hp: piece.hp } : {}),
      ...("mana" in piece ? { mana: piece.mana } : {}),
      ...("resists" in piece ? { resists: piece.resists } : {}),
      ...("effect" in piece ? { effect: piece.effect } : {}),
      source: `Shadowknight Skyshrine Armor Quests: ${piece.label} reward (Onerind Fe\`Dhar, Skyshrine)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// ---------------------------------------------------------------------
// Shadowknight Thurgadin Armor Quests (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:thurgadin";
  const giverId = "npc:thurgadin:dalgrim-underbelly";
  addGiver(giverId, "Dalgrim Underbelly", zoneId);

  const groupId = "quest_group:shadowknight-thurgadin-armor-quests";
  addNode({
    id: groupId,
    label: "Shadowknight Thurgadin Armor Quests",
    type: "quest_group",
    description:
      "Dalgrim Underbelly in Thurgadin trades a Corroded Plate armor piece plus 3 matching gems for its corresponding piece of Dark Runed armor. Seven independent sub-quests, no ordering between them. Requires Kindly faction.",
    classes: ["shadow knight"],
    wiki_title: "Shadowknight Thurgadin Armor Quests",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const pieces = [
    { label: "Helm", base: "Corroded Plate Helmet", gem: "3 Crushed Coral", reward: "Dark Runed Crown", ac: 19 },
    { label: "Breastplate", base: "Corroded Breastplate", gem: "3 Flawless Diamond", reward: "Dark Runed Breastplate", ac: 42 },
    { label: "Vambraces", base: "Corroded Plate Vambraces", gem: "3 Flawed Emerald", reward: "Dark Runed Vambraces", ac: 19 },
    { label: "Bracer", base: "Corroded Plate Bracer", gem: "3 Crushed Flame Emerald", reward: "Dark Runed Bracer", ac: 15 },
    { label: "Gauntlets", base: "Corroded Plate Gauntlets", gem: "3 Crushed Topaz", reward: "Dark Runed Gauntlets", ac: 15 },
    { label: "Greaves", base: "Corroded Plate Greaves", gem: "3 Flawed Sea Sapphire", reward: "Dark Runed Greaves", ac: 24 },
    { label: "Boots", base: "Corroded Plate Boots", gem: "3 Crushed Black Marble", reward: "Dark Runed Boots", ac: 21 },
  ];
  for (const piece of pieces) {
    const questId = `quest:shadowknight-thurgadin-armor-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `Shadowknight Thurgadin Armor Quests: ${piece.label}`,
      type: "quest",
      classes: ["shadow knight"],
      description: `Trade a ${piece.base} plus ${piece.gem} to Dalgrim Underbelly in Thurgadin for the ${piece.reward}.`,
      minLevel: 45,
      steps: [`Gather a ${piece.base} and ${piece.gem}`, "Turn them in to Dalgrim Underbelly in Thurgadin"],
      wiki_title: "Shadowknight Thurgadin Armor Quests",
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, groupId, "member_of");

    const rewardId = `item:${slug(piece.reward)}`;
    addNode({
      id: rewardId,
      label: piece.reward,
      type: "item",
      classes: ["shadow knight"],
      magic: true,
      ac: piece.ac,
      source: `Shadowknight Thurgadin Armor Quests: ${piece.label} reward (Dalgrim Underbelly, Thurgadin)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// ---------------------------------------------------------------------
// Shaman Kael Armor Quests (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const giverId = "npc:kael-drakkal:yeeldan-spiritcaller";
  addGiver(giverId, "Yeeldan Spiritcaller", zoneId);

  const groupId = "quest_group:shaman-kael-armor-quests";
  addNode({
    id: groupId,
    label: "Shaman Kael Armor Quests",
    type: "quest_group",
    description:
      "Yeeldan Spiritcaller in Kael Drakkel trades an Ancient Tarnished Chain armor piece plus 3 matching gems for its corresponding piece of Spirit Caller's armor. Seven independent sub-quests, no ordering between them. Requires ALLY faction.",
    classes: ["shaman"],
    race: ["barbarian", "troll", "ogre", "iksar"],
    wiki_title: "Shaman Kael Armor Quests",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const pieces = [
    { label: "Helm", base: "Ancient Tarnished Chain Coif", gem: "3 Crushed Onyx Sapphire", reward: "Spirit Caller's Helm", ac: 22, stats: { wis: 6, agi: 6 }, mana: 20 },
    { label: "Breastplate", base: "Ancient Tarnished Chain Tunic", gem: "3 Black Marble", reward: "Spirit Caller's Breastplate", ac: 48, stats: { wis: 15 }, effect: "Riotous Health" },
    { label: "Vambraces", base: "Ancient Tarnished Chain Sleeves", gem: "3 Jaundice Gem", reward: "Spirit Caller's Vambraces", ac: 24, stats: { wis: 3 } },
    { label: "Bracer", base: "Ancient Tarnished Chain Bracer", gem: "3 Crushed Opal", reward: "Spirit Caller's Bracer", ac: 17, effect: "Ultravision" },
    { label: "Gauntlets", base: "Ancient Tarnished Chain Gauntlets", gem: "3 Crushed Lava Ruby", reward: "Spirit Caller's Gauntlets", ac: 16, stats: { wis: 3 } },
    { label: "Greaves", base: "Ancient Tarnished Chain Leggings", gem: "3 Chipped Onyx Sapphire", reward: "Spirit Caller's Greaves", ac: 32, effect: "Abolish Disease" },
    { label: "Boots", base: "Ancient Tarnished Chain Boots", gem: "3 Crushed Flame Emerald", reward: "Spirit Caller's Boots", ac: 24, effect: "Extinguish Fatigue" },
  ] as const;
  for (const piece of pieces) {
    const questId = `quest:shaman-kael-armor-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `Shaman Kael Armor Quests: ${piece.label}`,
      type: "quest",
      classes: ["shaman"],
      race: ["barbarian", "troll", "ogre", "iksar"],
      description: `Trade a ${piece.base} plus ${piece.gem} to Yeeldan Spiritcaller in Kael Drakkel for the ${piece.reward}.`,
      minLevel: 50,
      steps: [`Gather a ${piece.base} and ${piece.gem}`, "Turn them in to Yeeldan Spiritcaller in Kael Drakkel"],
      wiki_title: "Shaman Kael Armor Quests",
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, groupId, "member_of");

    const rewardId = `item:${slug(piece.reward)}`;
    addNode({
      id: rewardId,
      label: piece.reward,
      type: "item",
      classes: ["shaman"],
      race: ["barbarian", "troll", "ogre", "iksar"],
      magic: true,
      ac: piece.ac,
      ...("stats" in piece ? { stats: piece.stats } : {}),
      ...("mana" in piece ? { mana: piece.mana } : {}),
      ...("effect" in piece ? { effect: piece.effect } : {}),
      source: `Shaman Kael Armor Quests: ${piece.label} reward (Yeeldan Spiritcaller, Kael Drakkal)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// ---------------------------------------------------------------------
// Shaman Plane of Sky Tests (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:plane-of-sky";
  const veetraId = "npc:plane-of-sky:medicine-man-veetra";
  const ginaId = "npc:plane-of-sky:gina-macstargan";
  const oogaId = "npc:plane-of-sky:ooga";
  addGiver(veetraId, "Medicine Man Veetra", zoneId);
  addGiver(ginaId, "Gina MacStargan", zoneId);
  addGiver(oogaId, "Ooga", zoneId);

  const groupId = "quest_group:shaman-plane-of-sky-tests";
  addNode({
    id: groupId,
    label: "Shaman Plane of Sky Tests",
    type: "quest_group",
    description:
      "Medicine Man Veetra in the Plane of Sky directs Shamans to choose between two apprentices, Gina MacStargan or Ooga, each offering independent item-turn-in tests for a named reward. Six independent sub-quests, no ordering between them.",
    classes: ["shaman"],
    wiki_title: "Shaman Plane of Sky Tests",
  });
  addEdge(veetraId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const tests: Array<{
    label: string;
    giverId: string;
    giverLabel: string;
    items: string;
    reward: string;
    slots?: string[];
    skill?: string;
    damage?: number;
    ac?: number;
    stats: Record<string, number>;
    hp?: number;
    mana?: number;
    effect?: string;
  }> = [
    { label: "Test of Might", giverId: ginaId, giverLabel: "Gina MacStargan", items: "an Auburn Tessera, Drake Fang, and Leather Cord", reward: "Amulet of the Fang", slots: ["Neck"], ac: 8, stats: { wis: 8 }, mana: 10, effect: "SV FIRE +10" },
    { label: "Test of Health", giverId: ginaId, giverLabel: "Gina MacStargan", items: "a Platinum Disc, Ethereal Amber, Shimmering Amber, and Ceremonial Belt", reward: "Bracelet of the Spirits", slots: ["Wrist", "Waist"], ac: 5, stats: { str: 5, dex: 5, wis: 5, agi: 5 }, mana: 50, effect: "Alacrity" },
    { label: "Test of Sight", giverId: ginaId, giverLabel: "Gina MacStargan", items: "a Phosphoric Globe, Sphinx Hide, and Light Damask Mantle", reward: "Fairy-Hide Mantle", slots: ["Shoulders"], ac: 9, stats: { str: 5, wis: 12 }, effect: "Guardian Spirit" },
    { label: "Test of Shrink", giverId: oogaId, giverLabel: "Ooga", items: "an Efreeti War Club, Djinni Statuette, Corrosive Venom, and Wooden Bands", reward: "Warhammer of the Wind", slots: ["Primary"], skill: "1H Blunt", damage: 12, stats: { wis: 14 }, hp: 50, mana: 50 },
    { label: "Test of Snake", giverId: oogaId, giverLabel: "Ooga", items: "an Emerald Spiroc Feather, Bixie Essence, and Spiritualist's Ring", reward: "Vermilion Sky Ring", slots: ["Finger"], ac: 5, stats: { dex: 3, wis: 7 }, effect: "Feign Death" },
    { label: "Test of Witch Doctor", giverId: oogaId, giverLabel: "Ooga", items: "an Efreeti War Maul, Thickened Nectar, Fire Sky Ruby, and Symbol of Veeshan", reward: "Garduk", slots: ["Primary"], skill: "Piercing", damage: 23, stats: { wis: 15 }, mana: 75, effect: "Tagar's Insects" },
  ];
  for (const test of tests) {
    const questId = `quest:shaman-plane-of-sky-${slug(test.label)}`;
    addNode({
      id: questId,
      label: `Shaman Plane of Sky Tests: ${test.label}`,
      type: "quest",
      classes: ["shaman"],
      description: `Bring ${test.items} to ${test.giverLabel} in the Plane of Sky for the ${test.reward}.`,
      steps: [`Gather ${test.items}`, `Turn them in to ${test.giverLabel} in the Plane of Sky`],
      wiki_title: "Shaman Plane of Sky Tests",
    });
    addEdge(test.giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, groupId, "member_of");

    const rewardId = `item:${slug(test.reward)}`;
    addNode({
      id: rewardId,
      label: test.reward,
      type: "item",
      classes: ["shaman"],
      magic: true,
      ...(test.slots ? { slots: test.slots } : {}),
      ...(test.skill ? { skill: test.skill } : {}),
      ...(test.damage !== undefined ? { damage: test.damage } : {}),
      ...(test.ac !== undefined ? { ac: test.ac } : {}),
      stats: test.stats,
      ...(test.hp !== undefined ? { hp: test.hp } : {}),
      ...(test.mana !== undefined ? { mana: test.mana } : {}),
      ...(test.effect ? { effect: test.effect } : {}),
      source: `Shaman Plane of Sky Tests: ${test.label} reward (${test.giverLabel}, Plane of Sky)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// ---------------------------------------------------------------------
// Shaman Skyshrine Armor Quests (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:skyshrine";
  const giverId = "npc:skyshrine:asteinnon-fedhar";
  addGiver(giverId, "Asteinnon Fe`Dhar", zoneId);

  const groupId = "quest_group:shaman-skyshrine-armor-quests";
  addNode({
    id: groupId,
    label: "Shaman Skyshrine Armor Quests",
    type: "quest_group",
    description:
      "Asteinnon Fe`Dhar in Skyshrine trades an Unadorned Chain armor piece plus 3 matching gems for its corresponding piece of Wolf Caller's armor. Seven independent sub-quests, no ordering between them.",
    classes: ["shaman"],
    race: ["barbarian", "troll", "ogre", "iksar"],
    wiki_title: "Shaman Skyshrine Armor Quests",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const pieces = [
    { label: "Helm", base: "Unadorned Chain Coif", gem: "3 Crushed Onyx Sapphires", reward: "Wolf Caller's Helm", ac: 19, stats: { str: 6, wis: 7 }, mana: 25 },
    { label: "Breastplate", base: "Unadorned Chain Tunic", gem: "3 Black Marble", reward: "Wolf Caller's Breastplate", ac: 43, stats: { str: 6, dex: 6, sta: 8, wis: 15 }, hp: 45, mana: 90, effect: "Riotous Health" },
    { label: "Vambraces", base: "Unadorned Chain Sleeves", gem: "3 Jaundice Gems", reward: "Wolf Caller's Vambraces", ac: 19, stats: { str: 3, dex: 3, sta: 3, wis: 3 }, hp: 10, mana: 15 },
    { label: "Bracer", base: "Unadorned Chain Bracer", gem: "3 Crushed Opals", reward: "Wolf Caller's Bracer", ac: 16, stats: { wis: 7, dex: 2 }, hp: 20, mana: 15, effect: "Ultravision" },
    { label: "Gauntlets", base: "Unadorned Chain Gauntlets", gem: "3 Crushed Lava Rubies", reward: "Wolf Caller's Gauntlets", ac: 16, stats: { str: 2, cha: 2, wis: 3 }, mana: 20 },
    { label: "Greaves", base: "Unadorned Chain Leggings", gem: "3 Chipped Onyx Sapphires", reward: "Wolf Caller's Greaves", ac: 26, stats: { dex: 5, agi: 5, wis: 12 }, hp: 50, mana: 80, effect: "Abolish Disease" },
    { label: "Boots", base: "Unadorned Chain Boots", gem: "3 Crushed Flame Emeralds", reward: "Wolf Caller's Boots", ac: 21, stats: { sta: 6, wis: 5 }, hp: 20, mana: 25, effect: "Extinguish Fatigue" },
  ];
  for (const piece of pieces) {
    const questId = `quest:shaman-skyshrine-armor-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `Shaman Skyshrine Armor Quests: ${piece.label}`,
      type: "quest",
      classes: ["shaman"],
      race: ["barbarian", "troll", "ogre", "iksar"],
      description: `Trade an ${piece.base} plus ${piece.gem} to Asteinnon Fe\`Dhar in Skyshrine for the ${piece.reward}.`,
      minLevel: 50,
      steps: [`Gather an ${piece.base} and ${piece.gem}`, "Turn them in to Asteinnon Fe`Dhar in Skyshrine"],
      wiki_title: "Shaman Skyshrine Armor Quests",
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, groupId, "member_of");

    const rewardId = `item:${slug(piece.reward)}`;
    addNode({
      id: rewardId,
      label: piece.reward,
      type: "item",
      classes: ["shaman"],
      race: ["barbarian", "troll", "ogre", "iksar"],
      magic: true,
      ac: piece.ac,
      stats: piece.stats,
      ...("hp" in piece ? { hp: piece.hp } : {}),
      ...("mana" in piece ? { mana: piece.mana } : {}),
      ...("effect" in piece ? { effect: piece.effect } : {}),
      source: `Shaman Skyshrine Armor Quests: ${piece.label} reward (Asteinnon Fe\`Dhar, Skyshrine)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// ---------------------------------------------------------------------
// Shaman Thurgadin Armor Quests (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:thurgadin";
  const giverId = "npc:thurgadin:terman-underbelly";
  addGiver(giverId, "Terman Underbelly", zoneId);

  const groupId = "quest_group:shaman-thurgadin-armor-quests";
  addNode({
    id: groupId,
    label: "Shaman Thurgadin Armor Quests",
    type: "quest_group",
    description:
      "Terman Underbelly in Thurgadin trades a Corroded Chain armor piece plus 3 matching gems for its corresponding piece of Rune Crafter's armor. Seven independent sub-quests, no ordering between them. Requires Kindly faction with Coldain. The Vambraces sub-quest is also known on eqlwiki.com as \"Shaman's Velium Sleeves.\"",
    classes: ["shaman"],
    race: ["barbarian", "troll", "ogre", "iksar"],
    wiki_title: "Shaman Thurgadin Armor Quests",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const pieces = [
    { label: "Helm", base: "Corroded Chain Coif", gem: "3 Crushed Onyx Sapphire", reward: "Rune Crafter's Helm", ac: 16, stats: { sta: 5, wis: 5 }, mana: 15 },
    { label: "Breastplate", base: "Corroded Chain Tunic", gem: "3 Black Marble", reward: "Rune Crafter's Breastplate", ac: 37, stats: { str: 3, dex: 3, sta: 6, wis: 14, agi: 3 }, hp: 30, mana: 80, effect: "Riotous Health" },
    { label: "Vambraces", base: "Corroded Chain Sleeves", gem: "3 Jaundice Gem", reward: "Rune Crafter's Vambraces", ac: 16, stats: { str: 1, dex: 1, sta: 1, wis: 3 }, hp: 10, mana: 15 },
    { label: "Bracer", base: "Corroded Chain Bracer", gem: "3 Crushed Opal", reward: "Rune Crafter's Bracer", ac: 13, stats: { str: 2, wis: 3 }, mana: 15, effect: "Ultravision" },
    { label: "Gauntlets", base: "Corroded Chain Gauntlets", gem: "3 Crushed Lava Ruby", reward: "Rune Crafter's Gauntlets", ac: 13, stats: { str: 1, cha: 2, wis: 2 }, mana: 10 },
    { label: "Greaves", base: "Corroded Chain Leggings", gem: "3 Chipped Onyx Sapphire", reward: "Rune Crafter's Greaves", ac: 22, stats: { sta: 5, wis: 10, agi: 3 }, hp: 30, mana: 80, effect: "Abolish Disease" },
    { label: "Boots", base: "Corroded Chain Boots", gem: "3 Crushed Flame Emerald", reward: "Rune Crafter's Boots", ac: 18, stats: { sta: 5, wis: 3 }, effect: "Extinguish Fatigue" },
  ];
  for (const piece of pieces) {
    const questId = `quest:shaman-thurgadin-armor-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `Shaman Thurgadin Armor Quests: ${piece.label}`,
      type: "quest",
      classes: ["shaman"],
      race: ["barbarian", "troll", "ogre", "iksar"],
      description: `Trade a ${piece.base} plus ${piece.gem} to Terman Underbelly in Thurgadin for the ${piece.reward}.`,
      minLevel: 45,
      steps: [`Gather a ${piece.base} and ${piece.gem}`, "Turn them in to Terman Underbelly in Thurgadin"],
      wiki_title: piece.label === "Vambraces" ? "Shaman Thurgadin Armor Quests / Shaman's Velium Sleeves" : "Shaman Thurgadin Armor Quests",
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, groupId, "member_of");

    const rewardId = `item:${slug(piece.reward)}`;
    addNode({
      id: rewardId,
      label: piece.reward,
      type: "item",
      classes: ["shaman"],
      race: ["barbarian", "troll", "ogre", "iksar"],
      magic: true,
      ac: piece.ac,
      stats: piece.stats,
      ...("hp" in piece ? { hp: piece.hp } : {}),
      ...("mana" in piece ? { mana: piece.mana } : {}),
      ...("effect" in piece ? { effect: piece.effect } : {}),
      source: `Shaman Thurgadin Armor Quests: ${piece.label} reward (Terman Underbelly, Thurgadin)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// ---------------------------------------------------------------------
// Shaman Spells (Evil - Iksar) / (Evil) / (Good) -- share one 4-spell pool
// ---------------------------------------------------------------------
const sharedSpellPool = [
  "spell:insidious-decay",
  "spell:shroud-of-the-spirits",
  "spell:talisman-of-shadoo",
  "spell:torrent-of-poison",
];

addNode({
  id: "spell:cripple",
  label: "Cripple",
  type: "spell",
  class_levels: [
    { class: "shaman", level: 53 },
    { class: "enchanter", level: 53 },
  ],
  description:
    "Saps your target's power, decreasing their agility, dexterity, strength, and armor class for 6.3 mins @L53 to 7.0 mins @L60.",
  mana: 225,
  skill: "Alteration",
  castTime: 2.5,
  recastTime: 2.25,
  fizzleTime: 2.25,
  duration: "6.3 minutes @L53 to 7.0 minutes @L60",
  targetType: "Single",
  spellType: "Detrimental",
  resist: "Magic (0)",
  range: 200,
  icon: "I",
});

addNode({
  id: "spell:insidious-decay",
  label: "Insidious Decay",
  type: "spell",
  class_levels: [{ class: "shaman", level: 52 }],
  description: "Infects your target with a fever, causing them to become more susceptible to other diseases.",
  mana: 100,
  skill: "Conjuration",
  castTime: 1.0,
  recastTime: 5.0,
  fizzleTime: 2.5,
  duration: "11.4 minutes @L52 to 14 minutes @L60",
  targetType: "Single",
  spellType: "Detrimental",
  resist: "Unresistable",
  range: 200,
  icon: "E",
});

addNode({
  id: "spell:shroud-of-the-spirits",
  label: "Shroud of the Spirits",
  type: "spell",
  class_levels: [{ class: "shaman", level: 54 }],
  description: "Places a shroud of spirits on your target, increasing their armor class for 1 hour 12.0 minutes.",
  mana: 200,
  skill: "Abjuration",
  castTime: 6.0,
  recastTime: 12.0,
  fizzleTime: 2.25,
  duration: "1 hour 12 minutes",
  targetType: "Single",
  spellType: "Beneficial",
  resist: "Unresistable",
  range: 100,
  icon: "K",
});

addNode({
  id: "spell:spirit-of-scale",
  label: "Spirit of Scale",
  type: "spell",
  class_levels: [
    { class: "druid", level: 53 },
    { class: "shaman", level: 52 },
  ],
  description: "Imbues your group with the spirit of a scaled wolf, increasing their movement speed for 1 hour 12.0 minutes.",
  mana: 150,
  skill: "Alteration",
  castTime: 6.5,
  recastTime: 12.0,
  fizzleTime: 2.25,
  duration: "1 hour 12 minutes",
  targetType: "Group v2",
  spellType: "Beneficial",
  resist: "Magic (-10)",
  range: 100,
  icon: "A",
});

addNode({
  id: "spell:talisman-of-shadoo",
  label: "Talisman of Shadoo",
  type: "spell",
  class_levels: [{ class: "shaman", level: 53 }],
  description: "Protects your group with the talisman of Shadoo, shielding them from poison for 36.0 minutes.",
  mana: 150,
  skill: "Abjuration",
  castTime: 4.5,
  recastTime: 2.25,
  fizzleTime: 2.25,
  duration: "36 minutes",
  targetType: "Group v2",
  spellType: "Beneficial",
  resist: "Unresistable",
  range: 0,
  icon: "N",
});

addNode({
  id: "spell:torrent-of-poison",
  label: "Torrent of Poison",
  type: "spell",
  class_levels: [{ class: "shaman", level: 55 }],
  description: "Creates a rain of poison, causing 1-3 waves of 540 damage to 1-4 creatures in a small radius around your target.",
  mana: 380,
  skill: "Evocation",
  castTime: 6.0,
  recastTime: 12.0,
  fizzleTime: 2.5,
  duration: "Instant",
  targetType: "Targeted AE",
  spellType: "Detrimental",
  resist: "Poison (0)",
  range: 150,
  icon: "N",
});

{
  const zoneId = "zone:east-cabilis";
  const giverId = "npc:east-cabilis:himart-kichith";
  addGiver(giverId, "Himart Kichith", zoneId);

  const questId = "quest:shaman-spells-evil-iksar";
  addNode({
    id: questId,
    label: "Shaman Spells (Evil - Iksar)",
    type: "quest",
    classes: ["shaman"],
    description:
      "Himart Kichith, in the catacombs beneath the Temple of Terror's eastern tower in East Cabilis, trades any one of Cannibalize III, Cripple, Spirit of Scale, or Talisman of Jasinth for a random spell scroll from Insidious Decay, Shroud of the Spirits, Talisman of Shadoo, or Torrent of Poison.",
    minLevel: 51,
    steps: [
      "Find Himart Kichith in the catacombs beneath East Cabilis's Temple of Terror eastern tower",
      "Hand over a Cannibalize III, Cripple, Spirit of Scale, or Talisman of Jasinth spell scroll",
      "Receive a random spell scroll in return",
    ],
    wiki_title: "Shaman Spells (Evil - Iksar)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  for (const id of sharedSpellPool) {
    addEdge(questId, id, "rewards", { randomGroup: "shaman-spells-evil-iksar-drop" });
  }
}

{
  const zoneId = "zone:the-overthere";
  const giverId = "npc:the-overthere:bukuku-wolffeetz";
  addGiver(giverId, "Bukuku Wolffeetz", zoneId);

  const questId = "quest:shaman-spells-evil";
  addNode({
    id: questId,
    label: "Shaman Spells (Evil)",
    type: "quest",
    classes: ["shaman"],
    description:
      "Bukuku Wolffeetz in The Overthere trades any one of Cannibalize III, Cripple, Spirit of Scale, or Talisman of Jasinth for a random spell scroll from Insidious Decay, Shroud of the Spirits, Talisman of Shadoo, or Torrent of Poison.",
    minLevel: 51,
    steps: [
      "Find Bukuku Wolffeetz in The Overthere",
      "Hand over a Cannibalize III, Cripple, Spirit of Scale, or Talisman of Jasinth spell scroll",
      "Receive a random spell scroll in return",
    ],
    wiki_title: "Shaman Spells (Evil)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  for (const id of sharedSpellPool) {
    addEdge(questId, id, "rewards", { randomGroup: "shaman-spells-evil-drop" });
  }
}

{
  const zoneId = "zone:firiona-vie";
  const giverId = "npc:firiona-vie:alex-mcdarnin";
  addGiver(giverId, "Alex McDarnin", zoneId);

  const questId = "quest:shaman-spells-good";
  addNode({
    id: questId,
    label: "Shaman Spells (Good)",
    type: "quest",
    classes: ["shaman"],
    description:
      "Alex McDarnin, on the docks in Firiona Vie, trades any one of Cannibalize III, Cripple, Spirit of Scale, or Talisman of Jasinth for a random spell scroll from Insidious Decay, Shroud of the Spirits, Talisman of Shadoo, or Torrent of Poison.",
    minLevel: 51,
    steps: [
      "Find Alex McDarnin on the docks in Firiona Vie",
      "Hand over a Cannibalize III, Cripple, Spirit of Scale, or Talisman of Jasinth spell scroll",
      "Receive a random spell scroll in return",
    ],
    wiki_title: "Shaman Spells (Good)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  for (const id of sharedSpellPool) {
    addEdge(questId, id, "rewards", { randomGroup: "shaman-spells-good-drop" });
  }
}

save();
console.log(
  "Migration 088 complete: added Old Sebilis zone; 6 new spell nodes (Cripple, Insidious Decay, Shroud of the Spirits, Spirit of Scale, Talisman of Shadoo, Torrent of Poison); 9 more standalone quests from GitHub issue #26's checklist (Screaming Mace Quest through Shaman Spells (Good)); 10 quest_group clusters; deferred Shadowknight Epic Quest, Shaman Epic Quest, and Shaman Skull Quests to the Questlines section; skipped broken Scroll of G'han and Shakey the Scarecrow's Head; reused the Shaman Thurgadin Armor Quests Vambraces sub-quest for Shaman's Velium Sleeves"
);
