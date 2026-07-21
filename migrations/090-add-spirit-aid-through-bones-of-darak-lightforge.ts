/**
 * Migration 090: next standalone batch off GitHub issue #26's checklist --
 * "Spirit Aid" through "The Bones of Darak Lightforge" -- plus 2 quest_group
 * clusters surfaced along the way. Researched directly against eqlwiki.com,
 * following decisions/eqlwiki-quest-research-method.md.
 *
 * `quest_group` (2 sibling-set clusters, no ordering between members):
 * - Strategies of the Ancient Dragons (2 independent turn-in tracks to one
 *   giver -- Golden Tablet of Draconic Strategy gives the confirmed Book of
 *   Strategy; Scroll of Scaled Tactics gives one of three named items, the
 *   wiki's own page saying "The reward may vary depending on which scroll
 *   you bring back or is random" without resolving which -- modeled as a
 *   randomGroup since the wiki confirms the three named outcomes but not a
 *   deterministic mapping)
 * - Strife to the Coldain (2 independent turn-in tracks to one giver -- Hand
 *   of Deaen Greyforge gives Mask of Malediction, Legs of Deaen Greyforge
 *   gives Dark Spear of Venom; same shape as migration 089's Slaggak's
 *   Bounty)
 *
 * New Dozekar Tear Quests cluster members (deferred to the Questlines
 * section per the issue's own guardrail, not modeled here -- see the issue
 * body for the updated 9-of-~15 tally): Test of Protection, Test of the Fire
 * Storm, Test of the Living Flame, Test of the Tooth (Telkorenar, melee
 * classes, Temple of Veeshan -- his own page names "four tests"); Test of
 * the Emerald Tear, Test of the Platinum Tear, Test of the Ruby Tear
 * (Lendiniara the Keeper, all classes, Temple of Veeshan -- her own page
 * names "three tasks"). Both givers and the shared Temple of Veeshan
 * location match the cluster's existing description (Request of the
 * Arcane/Strong, migration 089's header), confirming it spans both givers'
 * rosters, not just Lendiniara's.
 *
 * Skipped and tagged broken (not modeled, per the issue's own guardrail,
 * quoting the wiki's own disclaimer):
 * - Terrorantula Quest -- wiki's own walkthrough: "at no point has Blixkin
 *   ever mentioned the Terrorantula," and turning in Terrorantula legs
 *   produced no dialogue or acknowledgement; the quest is listed unsolved
 *   with an unknown/unconfirmed reward.
 *
 * Deliberately NOT modeled (consistent with every migration so far):
 * - Negative faction changes throughout (Storm Giant Toes to Sentry Kcor's
 *   Kromzek loss, Strategies of the Ancient Dragons' Claws of Veeshan loss,
 *   Strife to the Coldain's Coldain/Claws of Veeshan loss, Tayla Ironforge's
 *   Circle Of Unseen Hands loss, Teir`Dal Courier's Emerald
 *   Warriors/Steel Warriors/Primordial Malice losses, Taxes' Ring of
 *   Scale/Kane Bayle losses, Telescope Lenses' Dark Reflection/The Dead
 *   losses, Tergon's Spellbook Quest's own faction losses, The Acolyte's
 *   none stated, The Bind's Unkempt Druids loss, The Bones of Darak
 *   Lightforge's Freeport Militia loss).
 * - Coin rewards throughout (Storm Giant Toes' 2g1s4c, Talym Shoontar's
 *   Head's 11s/6g, The Bloody Shank's ~20c, The Bones of Darak Lightforge's
 *   Full Gem Bag platinum, etc).
 * - Taskmaster Earring's reward pool -- eqlwiki.com states the specific
 *   named token received ("A Tattered Cloth Note," "A Faded Wedding Cloth,"
 *   etc.) depends on which of several possible enslaved NPCs the player
 *   encounters, and the actual gear reward comes from a second, generically
 *   described "respective merchant" trade ("leather armor, axes, shields,
 *   robes, and rings") -- a non-exhaustive, non-named pool (same carve-out
 *   as migration 089's Sir Morgan's Armor), so no reward item edges are
 *   modeled, only the mechanic in prose.
 * - Tergon's Spellbook Quest's scroll reward -- the wiki itself only says
 *   "an item, usually a scroll," no specific spell/item named.
 * - Tayla Ironforge's Combine Short Sword -- eqlwiki.com's own item page for
 *   it returns no stat infobox (page not meaningfully populated beyond the
 *   name), so it's named in the quest's description only, no `item` node.
 * - The Bind's "minor coin"/"a minor item" -- wiki gives no specific item
 *   name.
 * - The Bones of Darak Lightforge's six-zone bone/sword/shield/gem gathering
 *   -- wiki says only "collected from various zones," no specific
 *   sole-sourced zone named, so no additional `located_in` edges beyond the
 *   giver's own Gorge of King Xorbb.
 * - The Acolyte's Erud's Crossing turn-in-item source (Algae Covered Flesh,
 *   from a zombie sailor) -- Erud's Crossing has no zone node in this graph
 *   yet, and it's one of three flavor-only farm zones for a level-14 newbie
 *   quest whose giver zone (Rivervale) already exists; disproportionate to
 *   add a full zone (lore, faction table, connects_to edge, per the issue's
 *   own zone-adding guardrail) for a non-giver farm stop on this one quest,
 *   so it stays prose-only in the description rather than a `located_in`
 *   edge. The Feerrott and West Freeport (the other two source zones) do
 *   get `located_in` edges since both already exist.
 * - The Bayle List's list-collection side quests (Blackburrow Stout
 *   delivery, Mammoth kill vs. The Regurgitonic quest, Dyllin Starshine) --
 *   kept as prose per decisions/quest-reward-modeling.md's steps field,
 *   not modeled as their own quest nodes.
 *
 * Reused existing nodes: no new zones needed -- every zone touched
 * (Stonebrunt Mountains, Temple of Solusek Ro, Kithicor Forest, South
 * Qeynos, Skyshrine, Kael Drakkel, Northern Desert of Ro, Kerra Island,
 * Surefall Glade, Everfrost Peaks, Crushbone, North Qeynos, Neriak Commons,
 * Ak'Anon, Rivervale, Plane of Growth, Qeynos Aqueducts, East Freeport, High
 * Keep, Gorge of King Xorbb) already exists. Reused existing NPCs: Vira
 * (Temple of Solusek Ro) and Pietro Zarn (East Freeport) already had `npc`
 * nodes from migration 089 and the Dismal Rage guild-summons quests,
 * respectively. Reused existing items: item:scouts-blade (The Bloody
 * Shank's rare bonus reward) already existed. Reused existing spells:
 * spell:ice-comet (Tarton's Wheel), spell:divine-might (The Bones of Darak
 * Lightforge), and spell:column-of-frost / spell:fire-bolt /
 * spell:shock-of-ice (Telescope Lenses' random wizard-spell pool, "any of
 * several wizard spells" per the wiki's own walkthrough) all already
 * existed as spell nodes -- no new spell nodes needed this batch.
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, addFactionReward, addGiver, slug, save } = loadGraph(import.meta.dir);

// ---------------------------------------------------------------------
// Spirit Aid
// ---------------------------------------------------------------------
{
  const zoneId = "zone:stonebrunt-mountains";
  const giverId = "npc:stonebrunt-mountains:saemey-wirewhisker";
  addGiver(giverId, "Saemey Wirewhisker", zoneId);

  const questId = "quest:spirit-aid";
  addNode({
    id: questId,
    label: "Spirit Aid",
    type: "quest",
    minLevel: 35,
    description:
      "Saemey Wirewhisker in Kejek Village, Stonebrunt Mountains, sends players to Emylie Steelclaws with a Large Brick of High Quality Ore and an Oak Shaft; Emylie's Kejekan Smithy Hammer is then given to Giang Yin, who returns a Soulforge Hammer. Combining the Soulforge Hammer at a forge unlocks its use as a repeatable tool to purify Fading/Crystallized weapons and armor into upgraded \"Purified\" versions -- the wiki notes the remainder of the quest past the hammer may be broken or incomplete, and the hammer alone can be kept and reused indefinitely.",
    steps: [
      "Speak with Saemey Wirewhisker in Kejek Village, Stonebrunt Mountains",
      "Give Emylie Steelclaws a Large Brick of High Quality Ore and an Oak Shaft",
      "Give the Kejekan Smithy Hammer to Giang Yin",
      "Receive and combine the Soulforge Hammer at a forge",
    ],
    wiki_title: "Spirit Aid",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Kejek Village");
  addFactionReward(questId, "Peace Keepers");

  const hammerId = "item:soulforge-hammer";
  addNode({
    id: hammerId,
    label: "Soulforge Hammer",
    type: "item",
    slots: ["Primary", "Secondary"],
    skill: "1H Blunt",
    damage: 6,
    delay: 40,
    magic: true,
    weight: 18.0,
    size: "Small",
    source: "Spirit Aid reward (Saemey Wirewhisker / Giang Yin, Stonebrunt Mountains); doubles as a repeatable tool for purifying Fading/Crystallized gear",
  });
  addEdge(questId, hammerId, "rewards");
}

// ---------------------------------------------------------------------
// Staff of Temperate Flux Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:temple-of-solusek-ro";
  const eyeZoneId = "zone:solusek-s-eye";
  const permafrostId = "zone:permafrost";
  const rathetearId = "zone:lake-rathetear";
  const giverId = "npc:temple-of-solusek-ro:gardern";
  addGiver(giverId, "Gardern", zoneId);

  const questId = "quest:staff-of-temperate-flux-quest";
  addNode({
    id: questId,
    label: "Staff of Temperate Flux Quest",
    type: "quest",
    classes: ["wizard"],
    minLevel: 25,
    description:
      "Gardern in the Temple of Solusek Ro trades a Darkwood Staff (from Romar Sunto via a Lambent Stone), a Heart of Fire (from an inferno goblin wizard in Solusek's Eye), a Heart of Frost (from a goblin wizard in Permafrost), and a Rod of Bone (from a stone skeleton in Lake Rathetear) for the Staff of Temperate Flux. Not clickable until level 20; recommended 30-35 solo, or 25 with friends.",
    steps: [
      "Trade a Lambent Stone to Romar Sunto for a Darkwood Staff",
      "Kill an inferno goblin wizard in Solusek's Eye for a Heart of Fire",
      "Kill a goblin wizard in Permafrost for a Heart of Frost",
      "Kill a stone skeleton in Lake Rathetear for a Rod of Bone",
      "Turn in all four items to Gardern in the Temple of Solusek Ro",
    ],
    wiki_title: "Staff of Temperate Flux Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, eyeZoneId, "located_in");
  addEdge(questId, permafrostId, "located_in");
  addEdge(questId, rathetearId, "located_in");

  const staffId = "item:staff-of-temperate-flux";
  addNode({
    id: staffId,
    label: "Staff of Temperate Flux",
    type: "item",
    slots: ["Primary"],
    classes: ["wizard"],
    skill: "1H Blunt",
    damage: 6,
    delay: 30,
    magic: true,
    resists: { fire: 5, cold: 5 },
    weight: 4.0,
    size: "Medium",
    source: "Staff of Temperate Flux Quest reward (Gardern, Temple of Solusek Ro)",
  });
  addEdge(questId, staffId, "rewards");
}

// ---------------------------------------------------------------------
// Stanos' Head
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kithicor-forest";
  const highpassId = "zone:high-keep";
  const giverId = "npc:kithicor-forest:general-vghera";
  addGiver(giverId, "General V`ghera", zoneId);

  const questId = "quest:stanos-head";
  addNode({
    id: questId,
    label: "Stanos' Head",
    type: "quest",
    classes: ["bard", "rogue"],
    minLevel: 50,
    description:
      "General V`ghera in Kithicor Forest trades the Head of Stanos (from killing Stanos Herkanor in Highpass Hold) for the Guise of the Coercer, and grants \"the blessing of Innoruuk.\"",
    steps: ["Kill Stanos Herkanor in Highpass Hold for the Head of Stanos", "Turn it in to General V`ghera in Kithicor Forest"],
    wiki_title: "Stanos' Head",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, highpassId, "located_in");

  const guiseId = "item:guise-of-the-coercer";
  addNode({
    id: guiseId,
    label: "Guise of the Coercer",
    type: "item",
    slots: ["Face"],
    classes: ["bard", "rogue"],
    magic: true,
    ac: 4,
    stats: { cha: 13 },
    resists: { magic: 7 },
    weight: 0.2,
    size: "Small",
    effect: "Illusion (usable at Level 15)",
    source: "Stanos' Head reward (General V`ghera, Kithicor Forest)",
  });
  addEdge(questId, guiseId, "rewards");
}

// ---------------------------------------------------------------------
// Steel Warrior Initiation
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:brin-stolunger";
  addGiver(giverId, "Brin Stolunger", zoneId);

  const questId = "quest:steel-warrior-initiation";
  addNode({
    id: questId,
    label: "Steel Warrior Initiation",
    type: "quest",
    classes: ["warrior"],
    minLevel: 6,
    description:
      "Brin Stolunger in South Qeynos sends players on an errand chain -- fill an Empty Arena Sack with 5 bat wings and 5 snake scales, deliver sealed letters to Axe Broadsmith and Grahan Rothkar, and loot a Skull and an Arena Lion Skin from combat -- for the Steel Warrior Bracer. Requires amiable faction with Steel Warriors to start.",
    steps: [
      "Fill an Empty Arena Sack with 5 bat wings and 5 snake scales for a Full Arena Sack",
      "Deliver a Sealed Letter from Brin to Axe Broadsmith and receive a Letter of Recommendation",
      "Loot a Skull from a defeated skeleton and an Arena Lion Skin from a defeated young lion",
      "Deliver a second Sealed Letter from Brin to Grahan Rothkar",
      "Return to Brin Stolunger in South Qeynos for the Steel Warrior Bracer",
    ],
    wiki_title: "Steel Warrior Initiation",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Steel Warriors");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Knights of Truth");

  const braceletId = "item:steel-warrior-bracer";
  addNode({
    id: braceletId,
    label: "Steel Warrior Bracer",
    type: "item",
    slots: ["Wrist"],
    classes: ["warrior"],
    magic: true,
    ac: 3,
    stats: { agi: 1 },
    source: "Steel Warrior Initiation reward (Brin Stolunger, South Qeynos)",
  });
  addEdge(questId, braceletId, "rewards");
}

// ---------------------------------------------------------------------
// Stein Of Ulissa Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:temple-of-solusek-ro";
  const najenaId = "zone:najena";
  const cazicId = "zone:temple-of-cazic-thule";
  const rathetearId = "zone:lake-rathetear";
  const everfrostId = "zone:everfrost-peaks";
  const permafrostId = "zone:permafrost";
  const giverId = "npc:temple-of-solusek-ro:vira";
  addGiver(giverId, "Vira", zoneId);

  const questId = "quest:stein-of-ulissa-quest";
  addNode({
    id: questId,
    label: "Stein Of Ulissa Quest",
    type: "quest",
    classes: ["magician"],
    minLevel: 33,
    description:
      "Vira in the Temple of Solusek Ro trades a Sapphire (bought from a jewelry merchant), a Mermaid Scale (from mermaids), a Stein of Water (from Najena magicians, Cazic Thule alligators, or Lake Rathetear creatures), and Ice Giant Toes (from ice giants in Everfrost, Permafrost, or Gornit) for the Stein of Ulissa.",
    steps: [
      "Buy a Sapphire from a jewelry merchant",
      "Kill a mermaid for a Mermaid Scale",
      "Kill a magician in Najena, an alligator in Temple of Cazic Thule, or a creature in Lake Rathetear for a Stein of Water",
      "Kill an ice giant in Everfrost Peaks or Permafrost for Ice Giant Toes",
      "Turn in all four items to Vira in the Temple of Solusek Ro",
    ],
    wiki_title: "Stein Of Ulissa Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, najenaId, "located_in");
  addEdge(questId, cazicId, "located_in");
  addEdge(questId, rathetearId, "located_in");
  addEdge(questId, everfrostId, "located_in");
  addEdge(questId, permafrostId, "located_in");
  addFactionReward(questId, "Temple Of Sol Ro");

  const steinId = "item:stein-of-ulissa";
  addNode({
    id: steinId,
    label: "Stein of Ulissa",
    type: "item",
    slots: ["Primary"],
    classes: ["magician"],
    skill: "1H Blunt",
    magic: true,
    stats: { int: 2 },
    resists: { cold: 5 },
    effect: "Reclaim Energy",
    source: "Stein Of Ulissa Quest reward (Vira, Temple of Solusek Ro)",
  });
  addEdge(questId, steinId, "rewards");
}

// ---------------------------------------------------------------------
// Storm Giant Toes to Sentry Kcor
// ---------------------------------------------------------------------
{
  const zoneId = "zone:skyshrine";
  const kaelId = "zone:kael-drakkal";
  const giverId = "npc:skyshrine:sentry-kcor";
  addGiver(giverId, "Sentry Kcor", zoneId);

  const questId = "quest:storm-giant-toes-to-sentry-kcor";
  addNode({
    id: questId,
    label: "Storm Giant Toes to Sentry Kcor",
    type: "quest",
    minLevel: 1,
    description: "Sentry Kcor in Skyshrine trades Storm Giant Toes (from storm giants in Kael Drakkel or Wakening Land, handed in one at a time) for faction, coin, and experience.",
    steps: ["Kill storm giants in Kael Drakkel or Wakening Land for Storm Giant Toes", "Turn them in one at a time to Sentry Kcor in Skyshrine"],
    wiki_title: "Storm Giant Toes to Sentry Kcor",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, kaelId, "located_in");
  addFactionReward(questId, "Claws of Veeshan");
  addFactionReward(questId, "Yelinak");
}

// ---------------------------------------------------------------------
// Strategies of the Ancient Dragons (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const necropolisId = "zone:dragon-necropolis";
  const giverId = "npc:kael-drakkal:semkak-prophet-of-vallon";
  addGiver(giverId, "Semkak Prophet of Vallon", zoneId);

  const groupId = "quest_group:strategies-of-the-ancient-dragons";
  addNode({
    id: groupId,
    label: "Strategies of the Ancient Dragons",
    type: "quest_group",
    minLevel: 50,
    description:
      "Semkak Prophet of Vallon in Kael Drakkel runs two independent turn-in tracks from Dragon Necropolis dragon-construct drops: a Golden Tablet of Draconic Strategy gives the Book of Strategy; a Scroll of Scaled Tactics gives one of Circlet of Vallon, Shield of Battle, or Steel Wristband of Strategy -- the wiki's own page says \"the reward may vary depending on which scroll you bring back or is random\" without resolving which.",
    wiki_title: "Strategies of the Ancient Dragons",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");
  addEdge(groupId, necropolisId, "located_in");
  addFactionReward(groupId, "Kromrif");
  addFactionReward(groupId, "Kromzek");
  addFactionReward(groupId, "King Tormax");

  const tabletQuestId = "quest:strategies-of-the-ancient-dragons-golden-tablet";
  addNode({
    id: tabletQuestId,
    label: "Strategies of the Ancient Dragons: Golden Tablet",
    type: "quest",
    minLevel: 50,
    description: "Turn in a Golden Tablet of Draconic Strategy (dropped by dragon constructs in Dragon Necropolis) to Semkak Prophet of Vallon in Kael Drakkel for the Book of Strategy.",
    steps: ["Kill a dragon construct in Dragon Necropolis for a Golden Tablet of Draconic Strategy", "Turn it in to Semkak Prophet of Vallon"],
    wiki_title: "Strategies of the Ancient Dragons",
  });
  addEdge(giverId, tabletQuestId, "starts");
  addEdge(tabletQuestId, zoneId, "starts_in");
  addEdge(tabletQuestId, zoneId, "located_in");
  addEdge(tabletQuestId, necropolisId, "located_in");
  addEdge(tabletQuestId, groupId, "member_of");

  const bookId = "item:book-of-strategy";
  addNode({
    id: bookId,
    label: "Book of Strategy",
    type: "item",
    slots: ["Range"],
    stats: { str: 6, wis: 6 },
    magic: true,
    lore: true,
    weight: 1.5,
    size: "Medium",
    source: "Strategies of the Ancient Dragons: Golden Tablet reward (Semkak Prophet of Vallon, Kael Drakkel)",
  });
  addEdge(tabletQuestId, bookId, "rewards");

  const scrollQuestId = "quest:strategies-of-the-ancient-dragons-scroll";
  addNode({
    id: scrollQuestId,
    label: "Strategies of the Ancient Dragons: Scroll of Scaled Tactics",
    type: "quest",
    minLevel: 50,
    description:
      "Turn in a Scroll of Scaled Tactics (dropped by dragon constructs in Dragon Necropolis) to Semkak Prophet of Vallon in Kael Drakkel for one of Circlet of Vallon, Shield of Battle, or Steel Wristband of Strategy -- the wiki does not resolve whether the outcome depends on the specific scroll variant or is fully random.",
    steps: ["Kill a dragon construct in Dragon Necropolis for a Scroll of Scaled Tactics", "Turn it in to Semkak Prophet of Vallon"],
    wiki_title: "Strategies of the Ancient Dragons",
  });
  addEdge(giverId, scrollQuestId, "starts");
  addEdge(scrollQuestId, zoneId, "starts_in");
  addEdge(scrollQuestId, zoneId, "located_in");
  addEdge(scrollQuestId, necropolisId, "located_in");
  addEdge(scrollQuestId, groupId, "member_of");

  const circletId = "item:circlet-of-vallon";
  addNode({
    id: circletId,
    label: "Circlet of Vallon",
    type: "item",
    slots: ["Head"],
    ac: 18,
    resists: { fire: 9, disease: 9, magic: 9 },
    magic: true,
    lore: true,
    weight: 0.6,
    size: "Small",
    source: "Strategies of the Ancient Dragons: Scroll of Scaled Tactics random reward (Semkak Prophet of Vallon, Kael Drakkel)",
  });
  addEdge(scrollQuestId, circletId, "rewards", { randomGroup: "strategies-of-the-ancient-dragons-scroll" });

  const shieldId = "item:shield-of-battle";
  addNode({
    id: shieldId,
    label: "Shield of Battle",
    type: "item",
    slots: ["Secondary"],
    classes: ["warrior", "cleric", "paladin", "ranger", "shadow knight", "druid", "bard", "shaman"],
    ac: 13,
    stats: { str: 2, wis: 9 },
    mana: 10,
    magic: true,
    lore: true,
    weight: 9.7,
    size: "Giant",
    source: "Strategies of the Ancient Dragons: Scroll of Scaled Tactics random reward (Semkak Prophet of Vallon, Kael Drakkel)",
  });
  addEdge(scrollQuestId, shieldId, "rewards", { randomGroup: "strategies-of-the-ancient-dragons-scroll" });

  const wristbandId = "item:steel-wristband-of-strategy";
  addNode({
    id: wristbandId,
    label: "Steel Wristband of Strategy",
    type: "item",
    slots: ["Wrist"],
    classes: ["necromancer", "wizard", "magician", "enchanter"],
    ac: 2,
    stats: { str: 7, dex: 7, cha: -5, int: 7 },
    magic: true,
    lore: true,
    weight: 1.0,
    size: "Small",
    source: "Strategies of the Ancient Dragons: Scroll of Scaled Tactics random reward (Semkak Prophet of Vallon, Kael Drakkel)",
  });
  addEdge(scrollQuestId, wristbandId, "rewards", { randomGroup: "strategies-of-the-ancient-dragons-scroll" });
}

// ---------------------------------------------------------------------
// Strife to the Coldain (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const wastesId = "zone:eastern-wastes";
  const giverId = "npc:kael-drakkal:clrakk-blackfist";
  addGiver(giverId, "Clrakk Blackfist", zoneId);

  const groupId = "quest_group:strife-to-the-coldain";
  addNode({
    id: groupId,
    label: "Strife to the Coldain",
    type: "quest_group",
    minLevel: 50,
    description:
      "Clrakk Blackfist in the Iceshard Manor of Kael Drakkel runs two independent turn-in tracks from Deaen Greyforge (Eastern Wastes) drops: the Hand of Deaen Greyforge gives the Mask of Malediction; the Legs of Deaen Greyforge gives the Dark Spear of Venom. Amiable faction is not high enough to complete either turn-in.",
    wiki_title: "Strife to the Coldain",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");
  addEdge(groupId, wastesId, "located_in");
  addFactionReward(groupId, "Kromrif");
  addFactionReward(groupId, "Kromzek");

  const handQuestId = "quest:strife-to-the-coldain-hand";
  addNode({
    id: handQuestId,
    label: "Strife to the Coldain: Hand of Deaen Greyforge",
    type: "quest",
    minLevel: 50,
    description: "Turn in the Hand of Deaen Greyforge (looted from Deaen Greyforge, Eastern Wastes) to Clrakk Blackfist in Kael Drakkel for the Mask of Malediction.",
    steps: ["Kill Deaen Greyforge in Eastern Wastes for the Hand of Deaen Greyforge", "Turn it in to Clrakk Blackfist"],
    wiki_title: "Strife to the Coldain",
  });
  addEdge(giverId, handQuestId, "starts");
  addEdge(handQuestId, zoneId, "starts_in");
  addEdge(handQuestId, zoneId, "located_in");
  addEdge(handQuestId, wastesId, "located_in");
  addEdge(handQuestId, groupId, "member_of");

  const maskId = "item:mask-of-malediction";
  addNode({
    id: maskId,
    label: "Mask of Malediction",
    type: "item",
    slots: ["Face"],
    stats: { wis: -4, int: 5 },
    mana: 10,
    resists: { fire: -5, cold: -5 },
    magic: true,
    lore: true,
    weight: 0.2,
    size: "Small",
    source: "Strife to the Coldain: Hand of Deaen Greyforge reward (Clrakk Blackfist, Kael Drakkel)",
  });
  addEdge(handQuestId, maskId, "rewards");

  const legsQuestId = "quest:strife-to-the-coldain-legs";
  addNode({
    id: legsQuestId,
    label: "Strife to the Coldain: Legs of Deaen Greyforge",
    type: "quest",
    classes: ["shadow knight"],
    minLevel: 50,
    description: "Turn in the Legs of Deaen Greyforge (looted from Deaen Greyforge, Eastern Wastes) to Clrakk Blackfist in Kael Drakkel for the Dark Spear of Venom.",
    steps: ["Kill Deaen Greyforge in Eastern Wastes for the Legs of Deaen Greyforge", "Turn it in to Clrakk Blackfist"],
    wiki_title: "Strife to the Coldain",
  });
  addEdge(giverId, legsQuestId, "starts");
  addEdge(legsQuestId, zoneId, "starts_in");
  addEdge(legsQuestId, zoneId, "located_in");
  addEdge(legsQuestId, wastesId, "located_in");
  addEdge(legsQuestId, groupId, "member_of");

  const spearId = "item:dark-spear-of-venom";
  addNode({
    id: spearId,
    label: "Dark Spear of Venom",
    type: "item",
    slots: ["Range", "Primary"],
    classes: ["shadow knight"],
    skill: "Piercing",
    damage: 17,
    delay: 27,
    stats: { int: 5 },
    hp: 20,
    resists: { magic: 5 },
    magic: true,
    noTrade: true,
    weight: 7.0,
    size: "Medium",
    effect: "Sicken (instant cast) at Level 45",
    source: "Strife to the Coldain: Legs of Deaen Greyforge reward (Clrakk Blackfist, Kael Drakkel)",
  });
  addEdge(legsQuestId, spearId, "rewards");
}

// ---------------------------------------------------------------------
// Supplies for the New Sebilisian Expedition
// ---------------------------------------------------------------------
{
  const zoneId = "zone:northern-desert-of-ro";
  const giverId = "npc:northern-desert-of-ro:crusader-iktra";
  addGiver(giverId, "Crusader Iktra", zoneId);

  const questId = "quest:supplies-for-the-new-sebilisian-expedition";
  addNode({
    id: questId,
    label: "Supplies for the New Sebilisian Expedition",
    type: "quest",
    minLevel: 1,
    description:
      "Crusader Iktra in the Northern Desert of Ro trades a Small Piece of High Quality Ore (drops from goblins in Permafrost, Solusek's Eye, or High Keep; or made via Blacksmithing) for 10 New Sebilisian Expedition faction, or a Small Brick of High Quality Ore (made via Blacksmithing by breaking down Fine Steel weapons) for 15 faction, repeatably.",
    steps: ["Gather a Small Piece or Small Brick of High Quality Ore", "Turn it in to Crusader Iktra in the Northern Desert of Ro"],
    wiki_title: "Supplies for the New Sebilisian Expedition",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "New Sebilisian Expedition");
}

// ---------------------------------------------------------------------
// Sylvani Leaf Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kerra-island";
  const faydarkId = "zone:lesser-faydark";
  const giverId = "npc:kerra-island:urkath-greyface";
  addGiver(giverId, "Urkath Greyface", zoneId);

  const questId = "quest:sylvani-leaf-quest";
  addNode({
    id: questId,
    label: "Sylvani Leaf Quest",
    type: "quest",
    minLevel: 20,
    description:
      "Urkath Greyface on Kerra Island trades a Sylvani Leaf (from killing Ivie Bramblefoot, a level 20 brownie druid in Lesser Faydark) for the Worn Leather Shoulderpads and improved Kerra Isle faction. Poor faction may prevent the NPC from accepting the turn-in.",
    steps: ["Kill Ivie Bramblefoot in Lesser Faydark for a Sylvani Leaf", "Turn it in to Urkath Greyface on Kerra Island"],
    wiki_title: "Sylvani Leaf Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, faydarkId, "located_in");
  addFactionReward(questId, "Kerra Isle");

  const shoulderpadsId = "item:worn-leather-shoulderpads";
  addNode({
    id: shoulderpadsId,
    label: "Worn Leather Shoulderpads",
    type: "item",
    slots: ["Shoulders"],
    race: ["barbarian", "dark elf", "half elf", "halfling", "high elf", "human", "iksar", "ogre", "troll", "wood elf"],
    magic: true,
    lore: true,
    noTrade: true,
    ac: 4,
    stats: { str: 4 },
    weight: 2.0,
    size: "Medium",
    source: "Sylvani Leaf Quest reward (Urkath Greyface, Kerra Island)",
  });
  addEdge(questId, shoulderpadsId, "rewards");
}

// ---------------------------------------------------------------------
// Talym Shoontar's Head
// ---------------------------------------------------------------------
{
  const zoneId = "zone:surefall-glade";
  const karanaId = "zone:northern-karana";
  const giverId = "npc:surefall-glade:hager-sureshot";
  addGiver(giverId, "Hager Sureshot", zoneId);

  const questId = "quest:talym-shoontars-head";
  addNode({
    id: questId,
    label: "Talym Shoontar's Head",
    type: "quest",
    minLevel: 20,
    description:
      "Hager Sureshot in Surefall Glade trades the head of Talym Shoontar (a poacher who spawns in the Plains of Karana tunnels) for a Hunting Bow, coin, and experience.",
    steps: ["Kill Talym Shoontar in the Plains of Karana tunnels for his head", "Turn it in to Hager Sureshot in Surefall Glade"],
    wiki_title: "Talym Shoontar's Head",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, karanaId, "located_in");
  addFactionReward(questId, "Protectors of Pine");
  addFactionReward(questId, "Jaggedpine Treefolk");

  const bowId = "item:hunting-bow";
  addNode({
    id: bowId,
    label: "Hunting Bow",
    type: "item",
    slots: ["Range"],
    classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"],
    skill: "Archery",
    damage: 5,
    delay: 43,
    weight: 3.5,
    size: "Medium",
    source: "Talym Shoontar's Head reward (Hager Sureshot, Surefall Glade)",
  });
  addEdge(questId, bowId, "rewards");
}

// ---------------------------------------------------------------------
// Tarton's Wheel
// ---------------------------------------------------------------------
{
  const zoneId = "zone:everfrost-peaks";
  const giverId = "npc:everfrost-peaks:sulgar";
  addGiver(giverId, "Sulgar", zoneId);

  const questId = "quest:tartons-wheel";
  addNode({
    id: questId,
    label: "Tarton's Wheel",
    type: "quest",
    classes: ["wizard"],
    minLevel: 35,
    description: "Sulgar in Everfrost Peaks trades a Staff of the Wheel and a Star of Eyes (crafted by combining ten rods in the Glowing Chest) for Spell: Ice Comet. Both turn-in items are consumed.",
    steps: ["Combine ten rods in the Glowing Chest to craft a Staff of the Wheel and a Star of Eyes", "Turn both in to Sulgar in Everfrost Peaks"],
    wiki_title: "Tarton's Wheel",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "spell:ice-comet", "rewards");
}

// ---------------------------------------------------------------------
// Taskmaster Earring
// ---------------------------------------------------------------------
{
  const zoneId = "zone:crushbone";
  const giverId = "npc:crushbone:elven-slave";
  addGiver(giverId, "an elven slave", zoneId);

  const questId = "quest:taskmaster-earring";
  addNode({
    id: questId,
    label: "Taskmaster Earring",
    type: "quest",
    minLevel: 14,
    description:
      "An enslaved elf in Crushbone trades a Brass Earring (dropped by an orc taskmaster) for a small named token, whose exact identity depends on which of several possible enslaved NPCs is present; the token can be redeemed with a matching merchant for gear (leather armor, axes, shields, robes, or rings per the wiki, not itemized further). Requires dubious faction or better.",
    steps: ["Kill an orc taskmaster in Crushbone for a Brass Earring", "Give it to an elven slave in Crushbone"],
    wiki_title: "Taskmaster Earring",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Taxes
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const northId = "zone:north-qeynos";
  const karanaId = "zone:northern-karana";
  const giverId = "npc:south-qeynos:vicus-nonad";
  addGiver(giverId, "Vicus Nonad", zoneId);

  const questId = "quest:taxes";
  addNode({
    id: questId,
    label: "Taxes",
    type: "quest",
    minLevel: 3,
    description:
      "Vicus Nonad in South Qeynos sends players to collect tax payments from 11 merchants across South Qeynos, North Qeynos, and Northern Karana, combine them into a Full Tax Collection Box with a List of Debtors, and turn both in for the Brass Ring, Copper Amulet, Turquoise, coin, and experience.",
    steps: [
      "Collect tax payments from 11 merchants in South Qeynos, North Qeynos, and Northern Karana",
      "Combine the payments into a Full Tax Collection Box",
      "Turn in the box and a List of Debtors to Vicus Nonad in South Qeynos",
    ],
    wiki_title: "Taxes",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, northId, "located_in");
  addEdge(questId, karanaId, "located_in");
  addFactionReward(questId, "Antonius Bayle");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Merchants of Qeynos");

  const ringId = "item:brass-ring";
  addNode({
    id: ringId,
    label: "Brass Ring",
    type: "item",
    slots: ["Finger"],
    stats: { cha: 1 },
    lore: true,
    noTrade: true,
    weight: 0.1,
    size: "Tiny",
    source: "Taxes reward (Vicus Nonad, South Qeynos)",
  });
  addEdge(questId, ringId, "rewards");

  const amuletId = "item:copper-amulet";
  addNode({
    id: amuletId,
    label: "Copper Amulet",
    type: "item",
    slots: ["Neck"],
    weight: 0.2,
    size: "Small",
    source: "Taxes reward (Vicus Nonad, South Qeynos)",
  });
  addEdge(questId, amuletId, "rewards");
}

// ---------------------------------------------------------------------
// Tayla Ironforge
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-qeynos";
  const giverId = "npc:north-qeynos:brohan-ironforge";
  addGiver(giverId, "Brohan Ironforge", zoneId);

  const questId = "quest:tayla-ironforge";
  addNode({
    id: questId,
    label: "Tayla Ironforge",
    type: "quest",
    minLevel: 1,
    description:
      "Brohan Ironforge in North Qeynos sends players to buy a Jasper for Mare X'Lottl, receive Klok's Seal in return, use a ground-spawn Key to unlock a door in front of Haggle Baron Klok, and deliver a sealed letter from a Half Elf Maiden, for a Combine Short Sword and improved faction.",
    steps: [
      "Buy a Jasper and give it to Mare X'Lottl",
      "Receive Klok's Seal from Mare X'Lottl",
      "Use the ground-spawn Key in front of Haggle Baron Klok to unlock the door",
      "Deliver the sealed letter from the Half Elf Maiden",
      "Return to Brohan Ironforge in North Qeynos for the Combine Short Sword",
    ],
    wiki_title: "Tayla Ironforge",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Merchants of Qeynos");
  addFactionReward(questId, "Antonius Bayle");
  addFactionReward(questId, "Coalition of Tradefolk");
  addFactionReward(questId, "Guards of Qeynos");
}

// ---------------------------------------------------------------------
// Teir`Dal Courier
// ---------------------------------------------------------------------
{
  const zoneId = "zone:neriak-commons";
  const giverId = "npc:neriak-commons:seloxia-punox";
  addGiver(giverId, "Seloxia Punox", zoneId);

  const questId = "quest:teirdal-courier";
  addNode({
    id: questId,
    label: "Teir`Dal Courier",
    type: "quest",
    minLevel: 1,
    description:
      "Seloxia Punox in Neriak Commons sends a Sealed Letter to Ambassador K'Rynn, who sends a reply Sealed Letter back to Seloxia, for the Bronze Short Sword, faction, and experience. Requires amiable faction or better.",
    steps: ["Deliver the Sealed Letter from Seloxia Punox to Ambassador K'Rynn", "Return K'Rynn's reply letter to Seloxia Punox for the Bronze Short Sword"],
    wiki_title: "Teir`Dal Courier",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Indigo Brotherhood");

  const swordId = "item:bronze-short-sword";
  addNode({
    id: swordId,
    label: "Bronze Short Sword",
    type: "item",
    slots: ["Primary", "Secondary"],
    skill: "1H Slashing",
    damage: 4,
    delay: 21,
    weight: 2.0,
    size: "Small",
    source: "Teir`Dal Courier reward (Seloxia Punox, Neriak Commons)",
  });
  addEdge(questId, swordId, "rewards");
}

// ---------------------------------------------------------------------
// Telescope Lenses
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ak-anon";
  const steamfontId = "zone:steamfont-mountains";
  const faydarkId = "zone:greater-faydark";
  const freeportId = "zone:east-freeport";
  const giverId = "npc:ak-anon:tobon-starpyre";
  addGiver(giverId, "Tobon Starpyre", zoneId);

  const questId = "quest:telescope-lenses";
  addNode({
    id: questId,
    label: "Telescope Lenses",
    type: "quest",
    classes: ["wizard"],
    minLevel: 1,
    description:
      "Tobon Starpyre in Ak'Anon trades four spare telescope lenses (from Fodin, Tindo, and Phiz Frugrin near Ak'Anon/Steamfont Mountains, and Bidl Frugrin in the Kelethin tavern at night) plus a lens recovered from Zenita D`Rin in East Freeport (by combat or a card game) for one of Spell: Column of Frost, Spell: Fire Bolt, or Spell: Shock of Ice, plus coin and experience. Requires amiable faction or better.",
    steps: [
      "Collect spare telescope lenses from Fodin, Tindo, Phiz, and Bidl Frugrin",
      "Recover the stolen lens from Zenita D`Rin in East Freeport",
      "Turn in all five lenses to Tobon Starpyre in Ak'Anon",
    ],
    wiki_title: "Telescope Lenses",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, steamfontId, "located_in");
  addEdge(questId, faydarkId, "located_in");
  addEdge(questId, freeportId, "located_in");
  addFactionReward(questId, "Eldritch Collective");
  addFactionReward(questId, "Gem Choppers");
  addFactionReward(questId, "King Ak'Anon");

  addEdge(questId, "spell:column-of-frost", "rewards", { randomGroup: "telescope-lenses-spell" });
  addEdge(questId, "spell:fire-bolt", "rewards", { randomGroup: "telescope-lenses-spell" });
  addEdge(questId, "spell:shock-of-ice", "rewards", { randomGroup: "telescope-lenses-spell" });
}

// ---------------------------------------------------------------------
// Temple Blankets Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const karanaId = "zone:west-karana";
  const giverId = "npc:south-qeynos:chesgard-sydwen";
  addGiver(giverId, "Chesgard Sydwen", zoneId);

  const questId = "quest:temple-blankets-quest";
  addNode({
    id: questId,
    label: "Temple Blankets Quest",
    type: "quest",
    minLevel: 1,
    description:
      "Chesgard Sydwen in South Qeynos, a member of the Temple of Thunder, hands over Temple Blankets to be delivered to Rongol (or Tukk) in West Karana, for improved faction. Requires membership in the Temple of Thunder to start.",
    steps: ["Receive Temple Blankets from Chesgard Sydwen in South Qeynos", "Deliver them to Rongol or Tukk in West Karana"],
    wiki_title: "Temple Blankets Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, karanaId, "located_in");
  addFactionReward(questId, "Karana Residents");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Priests of Life");
  addFactionReward(questId, "Knights of Thunder");
}

// ---------------------------------------------------------------------
// Tergon's Spellbook Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ak-anon";
  const crushboneId = "zone:crushbone";
  const giverId = "npc:ak-anon:tergon-brenclog";
  addGiver(giverId, "Tergon Brenclog", zoneId);

  const questId = "quest:tergons-spellbook-quest";
  addNode({
    id: questId,
    label: "Tergon's Spellbook Quest",
    type: "quest",
    classes: ["magician"],
    minLevel: 15,
    description: "Tergon Brenclog in Ak'Anon trades Tergon's Spellbook (from high-level orcs, or from D'Vinn in Crushbone) for faction, experience, and an item -- usually a scroll, unnamed on the wiki.",
    steps: ["Obtain Tergon's Spellbook from high-level orcs or D'Vinn in Crushbone", "Turn it in to Tergon Brenclog in Ak'Anon"],
    wiki_title: "Tergon's Spellbook Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, crushboneId, "located_in");
  addFactionReward(questId, "Eldritch Collective");
  addFactionReward(questId, "Gem Choppers");
  addFactionReward(questId, "King Ak'Anon");
}

// ---------------------------------------------------------------------
// Terrorantula Quest -- SKIPPED, broken per the wiki's own walkthrough:
// "at no point has Blixkin ever mentioned the Terrorantula," and turning
// in Terrorantula legs produced no dialogue or acknowledgement; listed
// unsolved with no confirmed reward.
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// Tesch Val Scrolls
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const karanaId = "zone:southern-karana";
  const splitpawId = "zone:splitpaw";
  const giverId = "npc:south-qeynos:edvard-tommels";
  addGiver(giverId, "Edvard Tommels", zoneId);

  const questId = "quest:tesch-val-scrolls";
  addNode({
    id: questId,
    label: "Tesch Val Scrolls",
    type: "quest",
    minLevel: 20,
    description:
      "Edvard Tommels in South Qeynos trades a Tanned Split Paw Skin (identifies as \"History of the Verishe Mal,\" from gnolls in Southern Karana and Splitpaw Lair) for Karana's Tear, faction, and experience.",
    steps: ["Kill gnolls in Southern Karana or Splitpaw Lair for a Tanned Split Paw Skin", "Turn it in to Edvard Tommels in South Qeynos"],
    wiki_title: "Tesch Val Scrolls",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, karanaId, "located_in");
  addEdge(questId, splitpawId, "located_in");
  addFactionReward(questId, "QeynosCitizen");

  const tearId = "item:karanas-tear";
  addNode({
    id: tearId,
    label: "Karana's Tear",
    type: "item",
    slots: ["Ear"],
    stats: { sta: 5 },
    magic: true,
    weight: 0.1,
    size: "Tiny",
    source: "Tesch Val Scrolls reward (Edvard Tommels, South Qeynos)",
  });
  addEdge(questId, tearId, "rewards");
}

// ---------------------------------------------------------------------
// The Acolyte
// ---------------------------------------------------------------------
{
  const zoneId = "zone:rivervale";
  const feerrottId = "zone:the-feerrott";
  const westFreeportId = "zone:west-freeport";
  const giverId = "npc:rivervale:gapeers-johhanis";
  addGiver(giverId, "Gapeers Johhanis", zoneId);

  const questId = "quest:the-acolyte";
  addNode({
    id: questId,
    label: "The Acolyte",
    type: "quest",
    classes: ["cleric", "druid"],
    minLevel: 14,
    description:
      "Gapeers Johhanis in Rivervale trades Algae Covered Flesh (from a zombie sailor in Erud's Crossing), Swollen Flesh (from a drowned caravan guard in The Feerrott), and Waterlogged Flesh (from a drowned citizen in the West Freeport sewers) for the Acolyte's Anklet. Requires amiable faction with Priests of Mischief.",
    steps: [
      "Kill a zombie sailor in Erud's Crossing for Algae Covered Flesh",
      "Kill a drowned caravan guard in The Feerrott for Swollen Flesh",
      "Kill a drowned citizen in the West Freeport sewers for Waterlogged Flesh",
      "Turn in all three to Gapeers Johhanis in Rivervale",
    ],
    wiki_title: "The Acolyte",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, feerrottId, "located_in");
  addEdge(questId, westFreeportId, "located_in");
  addFactionReward(questId, "Priests of Mischief");
  addFactionReward(questId, "Mayor Gubbin");
  addFactionReward(questId, "Guardians of the Vale");

  const ankletId = "item:acolytes-anklet";
  addNode({
    id: ankletId,
    label: "Acolyte's Anklet",
    type: "item",
    slots: ["Feet"],
    classes: ["cleric", "druid"],
    magic: true,
    lore: true,
    noTrade: true,
    ac: 3,
    stats: { cha: 3, wis: 2, agi: 2 },
    weight: 1.2,
    size: "Small",
    source: "The Acolyte reward (Gapeers Johhanis, Rivervale)",
  });
  addEdge(questId, ankletId, "rewards");
}

// ---------------------------------------------------------------------
// The Ancient Tomes
// ---------------------------------------------------------------------
{
  const zoneId = "zone:plane-of-growth";
  const wastesId = "zone:western-wastes";
  const giverId = "npc:plane-of-growth:gleaming-sphere-of-light";
  addGiver(giverId, "a gleaming sphere of light", zoneId);

  const questId = "quest:the-ancient-tomes";
  addNode({
    id: questId,
    label: "The Ancient Tomes",
    type: "quest",
    classes: ["enchanter"],
    race: ["high elf"],
    minLevel: 50,
    description:
      "A gleaming sphere of light in the Plane of Growth trades the First and Second Halves of Vin`Pekir's Tome (from random dragons and Sapara brood dragons in Western Wastes) and the First and Second Halves of Al`Tarlkal's Tome (from Harla Dar and Esorpa of the Ring) for the Wreath of Nature. Tunare-worshipping High Elf Enchanters only.",
    steps: [
      "Kill dragons in Western Wastes for both halves of Vin`Pekir's Tome",
      "Kill Harla Dar and Esorpa of the Ring for both halves of Al`Tarlkal's Tome",
      "Turn in all four tome halves to the gleaming sphere of light in the Plane of Growth",
    ],
    wiki_title: "The Ancient Tomes",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, wastesId, "located_in");

  const wreathId = "item:wreath-of-nature";
  addNode({
    id: wreathId,
    label: "Wreath of Nature",
    type: "item",
    slots: ["Head"],
    classes: ["enchanter"],
    race: ["high elf"],
    deity: ["Tunare"],
    magic: true,
    lore: true,
    noTrade: true,
    ac: 5,
    stats: { cha: 7, int: 10 },
    mana: 40,
    resists: { magic: 20 },
    weight: 0.5,
    size: "Small",
    source: "The Ancient Tomes reward (gleaming sphere of light, Plane of Growth)",
  });
  addEdge(questId, wreathId, "rewards");
}

// ---------------------------------------------------------------------
// The Bayle List
// ---------------------------------------------------------------------
{
  const zoneId = "zone:qeynos-aqueducts";
  const freeportId = "zone:east-freeport";
  const giverId = "npc:qeynos-aqueducts:commander-kane";
  addGiver(giverId, "Commander Kane", zoneId);

  const questId = "quest:the-bayle-list";
  addNode({
    id: questId,
    label: "The Bayle List",
    type: "quest",
    minLevel: 25,
    description:
      "Commander Kane in the Qeynos Aqueducts assembles Bayle List I (from delivering Blackburrow Stout to Barn Bloodstone, or killing Mutt Rootlit), Bayle List II (from killing a Mammoth, or completing The Regurgitonic quest), and Bayle List III (from Dyllin Starshine) plus 20 gold. Giving the assembled list to Pietro Zarn, the Shadow Knight guildmaster in the East Freeport sewers, usually yields the Rage War Maul -- the wiki notes very high faction with Zarn may be required.",
    steps: [
      "Gather Bayle List I, II, and III plus 20 gold",
      "Give the assembled list to Pietro Zarn in the East Freeport sewers for the Rage War Maul",
    ],
    wiki_title: "The Bayle List",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, freeportId, "located_in");

  const maulId = "item:rage-war-maul";
  addNode({
    id: maulId,
    label: "Rage War Maul",
    type: "item",
    slots: ["Primary"],
    classes: ["shadow knight"],
    race: ["human", "erudite", "troll", "ogre", "iksar", "gnome"],
    skill: "2H Blunt",
    damage: 16,
    delay: 46,
    resists: { magic: 15 },
    magic: true,
    lore: true,
    weight: 13.0,
    size: "Large",
    source: "The Bayle List reward (Pietro Zarn, East Freeport sewers)",
  });
  addEdge(questId, maulId, "rewards");
}

// ---------------------------------------------------------------------
// The Bind
// ---------------------------------------------------------------------
{
  const zoneId = "zone:rivervale";
  const giverId = "npc:rivervale:ilscent-tagglefoot";
  addGiver(giverId, "Ilscent Tagglefoot", zoneId);

  const questId = "quest:the-bind";
  addNode({
    id: questId,
    label: "The Bind",
    type: "quest",
    minLevel: 3,
    description:
      "Ilscent Tagglefoot in Rivervale hands over a Case of Jumjum Juice to be delivered onward; completing the delivery grants minor coin, a minor unnamed item, and improved faction with Storm Reapers, Mayor Gubbin, and Merchants of Rivervale.",
    steps: ["Receive a Case of Jumjum Juice from Ilscent Tagglefoot in Rivervale", "Deliver it as instructed"],
    wiki_title: "The Bind",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Storm Reapers");
  addFactionReward(questId, "Mayor Gubbin");
  addFactionReward(questId, "Merchants of Rivervale");
}

// ---------------------------------------------------------------------
// The Bloody Shank
// ---------------------------------------------------------------------
{
  const zoneId = "zone:high-keep";
  const rivervaleId = "zone:rivervale";
  const giverId = "npc:high-keep:captain-boshinko";
  addGiver(giverId, "Captain Boshinko", zoneId);

  const questId = "quest:the-bloody-shank";
  addNode({
    id: questId,
    label: "The Bloody Shank",
    type: "quest",
    classes: ["rogue"],
    minLevel: 18,
    description:
      "Captain Boshinko in High Keep hands over the Bloody Shank to be delivered to the escaped prisoner Bronin Higginsbot in Rivervale, who attacks on sight; killing him sometimes drops a Scouts Blade. Requires amiable faction or better to accept.",
    steps: ["Receive the Bloody Shank from Captain Boshinko in High Keep", "Deliver it to Bronin Higginsbot in Rivervale and kill him"],
    wiki_title: "The Bloody Shank",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, rivervaleId, "located_in");
  addFactionReward(questId, "Highpass Guards");
  addFactionReward(questId, "Carson McCabe");
  addFactionReward(questId, "Merchants of Highpass");

  addEdge(questId, "item:scouts-blade", "rewards");
}

// ---------------------------------------------------------------------
// The Bones of Darak Lightforge
// ---------------------------------------------------------------------
{
  const zoneId = "zone:gorge-of-king-xorbb";
  const giverId = "npc:gorge-of-king-xorbb:diggs-duggun";
  addGiver(giverId, "Diggs Duggun", zoneId);

  const questId = "quest:the-bones-of-darak-lightforge";
  addNode({
    id: questId,
    label: "The Bones of Darak Lightforge",
    type: "quest",
    classes: ["paladin"],
    minLevel: 49,
    description:
      "Diggs Duggun in the Gorge of King Xorbb (Beholder's Maze) assembles a Pick (bought from a Kaladim bank vendor), two unstacked Dwarven Ales, six dusty bones plus a sword and shield (collected from various zones), and a Full Gem Bag (seven gems and two enchanted platinum bars) for Spell: Divine Might.",
    steps: [
      "Buy a Pick from a Kaladim bank vendor and gather two unstacked Dwarven Ales",
      "Collect six dusty bones, a sword, and a shield",
      "Combine seven gems and two enchanted platinum bars into a Full Gem Bag",
      "Turn in all items to Diggs Duggun in the Gorge of King Xorbb",
    ],
    wiki_title: "The Bones of Darak Lightforge",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Priests of Marr");
  addFactionReward(questId, "Knights of Truth");

  addEdge(questId, "spell:divine-might", "rewards");
}

save();
