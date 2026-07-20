/**
 * Migration 089: 25 more standalone quests off GitHub issue #26's checklist
 * -- the "Shark Hunting" through "Spiderling Silks" run -- plus Toolset
 * Delivery (pulled in early per the issue's own guardrail: Spear Delivery's
 * own page names it as a same-series quest) and 2 quest_group clusters
 * surfaced along the way. Researched directly against eqlwiki.com, following
 * decisions/eqlwiki-quest-research-method.md.
 *
 * `quest_group` (2 sibling-set clusters, no ordering between members):
 * - Shiny Rings (3 independent turn-in tracks to one giver -- each specific
 *   reagent gives a specific, different ring tier, not a random choice;
 *   same shape as Armor of Ro)
 * - Slaggak's Bounty (2 independent turn-in tracks to one giver -- 4x Shard
 *   Wurm Fang gives Cerulean Greaves, 4x Ice Wyvern Stinger gives Cerulean
 *   Vambraces; confirmed via the NPC's own two separate dialogue lines, not
 *   a single random reward)
 *
 * Two checklist entries, one quest (per the issue's own guardrail, same
 * treatment as migration 088's Shaman's Velium Sleeves): "Soil of Underfoot"
 * and "Soil of Underfoot Quest" are two separate, non-redirecting eqlwiki.com
 * pages describing the identical NPC (Priestess Ghalea, North Kaladim),
 * identical turn-in (4 Fairy Dust), and identical reward/faction -- but with
 * conflicting Minimum Level (35 vs 8) and Classes (Paladin vs All). The raw
 * wikitext of "Soil of Underfoot" (fetched via the MediaWiki API, not a
 * summarized render) is the more detailed page -- it carries the full item
 * infobox and a "Related Quests" list of other Paladin/Ranger content
 * (Chalice of Conquest, Armor of Ro, Ivy Etched Boots), which corroborates
 * a real class restriction rather than a generic template fallback. Modeled
 * once, using that page's numbers; "Soil of Underfoot Quest" is the stale
 * duplicate, not modeled separately.
 *
 * Skipped and tagged broken (not modeled, per the issue's own guardrail,
 * quoting the wiki's own disclaimer):
 * - Souvenir Mugs -- "This is an unsolved or broken quest" / "It's possible
 *   this is only a storyline rather than a quest."
 *
 * New race-abbreviation footgun (add to the issue's guardrail list): the
 * wiki's infobox "Race:" line sometimes prints a bare "ELF" instead of the
 * usual HIE/WEL/DEF/HEF codes, and nothing on the page disambiguates which
 * elf subtype is meant:
 * - Shield of the Devout ("ALL except BAR ELF TRL OGR IKS") -- no class-race
 *   compatibility clue available (Clerics can be any race in this game), so
 *   `race` is left unset entirely on that item rather than guessing.
 * - Solvedi Scimitar ("HUM ELF HEF HFL" for a Druid-only weapon) -- here the
 *   class restriction itself resolves the ambiguity: of the four elf
 *   subtypes, only Wood Elf can be a Druid, so "ELF" is confidently Wood
 *   Elf by elimination, not a guess.
 *
 * Deliberately NOT modeled (consistent with every migration so far):
 * - Negative faction changes throughout (decisions/quest-reward-modeling.md
 *   only models positive rewards): Sir Lindeal's Testimony's Knights of
 *   Thunder/Primordial Malice loss, Shondo and the Tonic's Dark
 *   Reflection/Clan Grikbar loss, Shovel Of Ponz's Shadowed Men loss,
 *   Solusek's Flower's Shadowed Men loss, Skunk Hunting/Soil of Underfoot's
 *   implicit losses, Slaggak's Bounty's Coldain/Claws of Veeshan loss,
 *   Sneed's Rat Infestation's Circle Of Unseen Hands loss.
 * - Coin rewards throughout (Sneed's Rat Infestation's 4 copper, Slave
 *   Keys' per-key coin, Solusek's Flower's platinum, etc).
 * - Sir Morgan's Armor's full reward pool -- eqlwiki.com lists it as
 *   "Random item, including: Patchwork Cloak; Patchwork Boots; Rusty
 *   Weapons; Silver Earring; Bloodstone; Halfling Knife; 1st level spell
 *   scroll; Bronze Dagger; Belt Pouch; Damask Cap; Mountain Lion Cape;
 *   Highkeep Flask; Snakeskin Mask; Drom's Champagne" -- two entries
 *   ("Rusty Weapons", "1st level spell scroll") are themselves generic
 *   categories, not named items, making this a non-exhaustive pool
 *   (decisions/quest-reward-modeling.md's "and others" case) even though
 *   most named items are individually real pages; kept as prose in the
 *   quest's `description` rather than chasing 12 individual item infoboxes
 *   for a 5-gold newbie trinket quest.
 * - Sparring Armor's Granite Pebbles turn-in requirement -- itself another
 *   quest's reward, out of scope for this pass (same treatment as migration
 *   088's Sebilis medallions).
 * - Shovel Of Ponz's Ruby (purchased for coin, no vendor zone stated) and
 *   Gargoyle Eye/Hill Giant Toes (drop "from various gargoyles/hill giants
 *   around the world" per the wiki itself, no sole-sourced zone) -- no
 *   `located_in` edge added for either, consistent with
 *   decisions/quest-reward-modeling.md's purchased-component and
 *   non-sole-sourced-drop carve-outs.
 *
 * Random-choice item reward (decisions/quest-reward-modeling.md's
 * `randomGroup`):
 * - Sparring Armor ("a random piece of Sparring Armor" -- 10 named pieces,
 *   one random turn-in reward, confirmed not a player choice)
 * - Shiny Robe of the Underfoot Quest (Shining Metallic Robe turn-in gives
 *   either the common Shiny Hunk of Metal or the rare Shiny Robe of the
 *   Underfoot)
 * - Sneed's Rat Infestation ("Dagger, Water Flask, or Torch" -- reuses the
 *   existing item:water-flask and item:torch nodes)
 *
 * Reused existing nodes: no new zones needed -- every zone touched (North
 * Freeport, Greater Faydark/Kelethin, East Cabilis, Temple of Solusek Ro,
 * Kerra Island, Upper Guk, The Hole, Lower Guk, Erudin Palace, Najena,
 * Temple of Cazic Thule, Kael Drakkal, Neriak 3rd Gate, Lavastorm
 * Mountains, Eastern Karana, North Kaladim, Butcherblock Mountains, Cobalt
 * Scar, Great Divide, Crushbone, South Qeynos, North Qeynos, Rathe
 * Mountains, Northern Karana, Southern Karana, Swamp of No Hope, Skyshrine,
 * Mistmoore Castle, Lesser Faydark, Iceclad Ocean) already exists. Reused
 * existing NPCs: Wenglawks Kkeak and Slaggak the Trainer (both Kael
 * Drakkal) already had `npc` nodes from migration 088's Shaman/Shadowknight
 * armor quest_groups. Skunk Hunting's random spell-scroll pool (Cure
 * Poison, Divine Aura, Fear, Flash of Light, Furor, Gate, Holy Armor, Lull,
 * Stun) reuses 9 already-existing `spell` nodes -- no new spell nodes
 * needed this batch.
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, addFactionReward, addGiver, slug, save } = loadGraph(import.meta.dir);

// ---------------------------------------------------------------------
// Shark Hunting
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-freeport";
  const giverId = "npc:north-freeport:theron-rolius";
  addGiver(giverId, "Theron Rolius", zoneId);

  const questId = "quest:shark-hunting";
  addNode({
    id: questId,
    label: "Shark Hunting",
    type: "quest",
    classes: ["bard", "beastlord", "berserker", "cleric", "druid", "monk", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"],
    description:
      "Theron Rolius in North Freeport trades a Sack of Sharkskins (two Shark Skin, from any shark, combined in a sack) for the Sharkskin Shield. No experience or coin reward.",
    minLevel: 5,
    steps: ["Kill sharks for two Shark Skin", "Combine both in a sack for a Sack of Sharkskins", "Turn in the sack to Theron Rolius in North Freeport"],
    wiki_title: "Shark Hunting",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const shieldId = "item:sharkskin-shield";
  addNode({
    id: shieldId,
    label: "Sharkskin Shield",
    type: "item",
    slots: ["Secondary"],
    classes: ["bard", "beastlord", "berserker", "cleric", "druid", "monk", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"],
    race: ["barbarian", "dark elf", "erudite", "half elf", "high elf", "human", "iksar", "ogre", "troll", "wood elf"],
    magic: true,
    ac: 3,
    weight: 3.0,
    size: "Small",
    source: "Shark Hunting reward (Theron Rolius, North Freeport)",
  });
  addEdge(questId, shieldId, "rewards");
}

// ---------------------------------------------------------------------
// Shark Meat Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:greater-faydark";
  const oceanZoneId = "zone:ocean-of-tears";
  const giverId = "npc:greater-faydark:gallin-woodwind";
  addGiver(giverId, "Gallin Woodwind", zoneId);

  const questId = "quest:shark-meat-quest";
  addNode({
    id: questId,
    label: "Shark Meat Quest",
    type: "quest",
    classes: ["bard", "ranger", "rogue", "shadow knight", "warrior"],
    description:
      "Gallin Woodwind in Kelethin trades 4 Shark Meat (from sharks in Ocean of Tears, combined in a provided pack) for the Cast-Iron Rapier, coin, and experience.",
    minLevel: 5,
    steps: ["Kill sharks in Ocean of Tears for 4 Shark Meat", "Combine the meat in the provided pack", "Turn in the pack to Gallin Woodwind in Kelethin"],
    wiki_title: "Shark Meat Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, oceanZoneId, "located_in");
  addFactionReward(questId, "Emerald Warriors");
  addFactionReward(questId, "Merchants of Felwithe");
  addFactionReward(questId, "Kelethin Merchants");

  const rapierId = "item:cast-iron-rapier";
  addNode({
    id: rapierId,
    label: "Cast-Iron Rapier",
    type: "item",
    slots: ["Primary", "Secondary"],
    classes: ["warrior", "ranger", "shadow knight", "bard", "rogue"],
    skill: "Piercing",
    damage: 4,
    delay: 23,
    weight: 5.0,
    size: "Medium",
    source: "Shark Meat Quest reward (Gallin Woodwind, Kelethin)",
  });
  addEdge(questId, rapierId, "rewards");
}

// ---------------------------------------------------------------------
// Shestar's Scaled Coif Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-cabilis";
  const giverId = "npc:east-cabilis:trooper-shestar";
  addGiver(giverId, "Trooper Shestar", zoneId);

  const questId = "quest:shestars-scaled-coif-quest";
  addNode({
    id: questId,
    label: "Shestar's Scaled Coif Quest",
    type: "quest",
    classes: ["bard", "beastlord", "berserker", "cleric", "druid", "monk", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"],
    description:
      "Trooper Shestar in East Cabilis trades 3 Loose Scales plus 5 gold for an unfinished coif, which is then combined with 3 more Loose Scales at a forge (Blacksmithing) to complete Shestar's Scaled Coif.",
    minLevel: 8,
    steps: [
      "Gather 3 Loose Scales and trade them plus 5 gold to Trooper Shestar for an unfinished coif",
      "Combine the unfinished coif with 3 more Loose Scales at a forge to complete Shestar's Scaled Coif",
    ],
    wiki_title: "Shestar's Scaled Coif Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const coifId = "item:shestars-scaled-coif";
  addNode({
    id: coifId,
    label: "Shestar's Scaled Coif",
    type: "item",
    slots: ["Head"],
    classes: ["bard", "beastlord", "berserker", "cleric", "druid", "monk", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"],
    magic: true,
    lore: true,
    noTrade: true,
    ac: 4,
    weight: 0.8,
    size: "Small",
    source: "Shestar's Scaled Coif Quest reward (Trooper Shestar, East Cabilis, via Blacksmithing)",
  });
  addEdge(questId, coifId, "rewards");
}

// ---------------------------------------------------------------------
// Shield of the Devout Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:temple-of-solusek-ro";
  const steamfontId = "zone:steamfont-mountains";
  const everfrostId = "zone:everfrost-peaks";
  const giverId = "npc:temple-of-solusek-ro:gavel-the-temperant";
  addGiver(giverId, "Gavel the Temperant", zoneId);

  const questId = "quest:shield-of-the-devout-quest";
  addNode({
    id: questId,
    label: "Shield of the Devout Quest",
    type: "quest",
    classes: ["cleric"],
    description:
      "Gavel the Temperant in the Temple of Solusek Ro trades an Icon of the Devout (from a Minotaur Sentry in Steamfont Mountains), an Ingot of the Devout (from a Glacier Bear in Everfrost Peaks), and 2 Vulcanized Platinum Bars (from Vilissia) for the Shield of the Devout. Multiquestable.",
    minLevel: 30,
    steps: [
      "Kill a Minotaur Sentry in Steamfont Mountains for an Icon of the Devout",
      "Kill a Glacier Bear in Everfrost Peaks for an Ingot of the Devout",
      "Trade enchanted platinum to Vilissia for 2 Vulcanized Platinum Bars",
      "Turn in all three items to Gavel the Temperant in the Temple of Solusek Ro",
    ],
    wiki_title: "Shield of the Devout Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, steamfontId, "located_in");
  addEdge(questId, everfrostId, "located_in");

  const shieldId = "item:shield-of-the-devout";
  addNode({
    id: shieldId,
    label: "Shield of the Devout",
    type: "item",
    slots: ["Secondary"],
    classes: ["cleric"],
    magic: true,
    ac: 15,
    stats: { str: 5 },
    hp: 25,
    mana: 25,
    source: "Shield of the Devout Quest reward (Gavel the Temperant, Temple of Solusek Ro) -- race restricted (\"ALL except BAR ELF TRL OGR IKS\") but the specific elf subtype excluded isn't disambiguated on eqlwiki.com, so `race` is left unset here rather than guessed",
  });
  addEdge(questId, shieldId, "rewards");
}

// ---------------------------------------------------------------------
// Shiny Rings (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kerra-island";
  const gukZoneId = "zone:upper-guk";
  const giverId = "npc:kerra-island:melixis";
  addGiver(giverId, "Melixis", zoneId);

  const groupId = "quest_group:shiny-rings";
  addNode({
    id: groupId,
    label: "Shiny Rings",
    type: "quest_group",
    description:
      "Melixis on Kerra Island trades three different Fungus Mutant drops (Upper Guk) for three different named rings -- Guk Bracket Mildew for the Copper Ring, Faerix Spores for the Silver Ring, Degenerated Guk Weed for the Gold Ring. Each turn-in gives a specific, predetermined reward; three independent sub-quests, no ordering between them.",
    minLevel: 25,
    wiki_title: "Shiny Rings",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");
  addEdge(groupId, gukZoneId, "located_in");

  const rings: Array<{ label: string; turnIn: string; reward: string; slug: string; stats: Record<string, number> }> = [
    { label: "Copper Ring", turnIn: "Guk Bracket Mildew", reward: "Copper Ring (Ring of Opolla)", slug: "copper-ring", stats: { sta: 1, cha: -1 } },
    { label: "Silver Ring", turnIn: "Faerix Spores", reward: "Silver Ring (Ring of Opolla)", slug: "silver-ring", stats: { wis: 1, cha: -1 } },
    { label: "Gold Ring", turnIn: "Degenerated Guk Weed", reward: "Gold Ring (Ring of Opolla)", slug: "gold-ring", stats: { dex: 1, cha: -1 } },
  ];
  for (const ring of rings) {
    const questId = `quest:shiny-rings-${ring.slug}`;
    addNode({
      id: questId,
      label: `Shiny Rings: ${ring.label}`,
      type: "quest",
      minLevel: 25,
      description: `Turn in ${ring.turnIn} (drops from a Fungus Mutant in Upper Guk) to Melixis on Kerra Island for the ${ring.reward}.`,
      steps: [`Kill a Fungus Mutant in Upper Guk for ${ring.turnIn}`, "Turn it in to Melixis on Kerra Island"],
      wiki_title: "Shiny Rings",
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, gukZoneId, "located_in");
    addEdge(questId, groupId, "member_of");

    const rewardId = `item:${slug(ring.reward)}`;
    addNode({
      id: rewardId,
      label: ring.reward,
      type: "item",
      slots: ["Finger"],
      stats: ring.stats,
      weight: 0.1,
      size: "Tiny",
      source: `Shiny Rings: ${ring.label} reward (Melixis, Kerra Island)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// ---------------------------------------------------------------------
// Shiny Robe of the Underfoot Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:the-hole";
  const gukZoneId = "zone:lower-guk";
  const giverId = "npc:the-hole:kejar-the-mighty";
  addGiver(giverId, "Kejar the Mighty", zoneId);

  const questId = "quest:shiny-robe-of-the-underfoot-quest";
  addNode({
    id: questId,
    label: "Shiny Robe of the Underfoot Quest",
    type: "quest",
    minLevel: 45,
    description:
      "Kejar the Mighty in The Hole (must be charmed to turn in) trades a Shining Metallic Robe (rare drop from a ghoul arch magi in Lower Guk's dead side) for a random reward: the common Shiny Hunk of Metal, or the rare Shiny Robe of the Underfoot.",
    steps: [
      "Kill a ghoul arch magi in Lower Guk's dead side for a Shining Metallic Robe",
      "Charm Kejar the Mighty in The Hole and turn in the robe for a random reward",
    ],
    wiki_title: "Shiny Robe of the Underfoot Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, gukZoneId, "located_in");

  const hunkId = "item:shiny-hunk-of-metal";
  addNode({
    id: hunkId,
    label: "Shiny Hunk of Metal",
    type: "item",
    weight: 2.0,
    size: "Small",
    source: "Shiny Robe of the Underfoot Quest common random reward (Kejar the Mighty, The Hole) -- no combat stats, wiki notes it as \"completely useless\"",
  });
  addEdge(questId, hunkId, "rewards", { randomGroup: "shiny-robe-of-the-underfoot-drop" });

  const robeId = "item:shiny-robe-of-the-underfoot";
  addNode({
    id: robeId,
    label: "Shiny Robe of the Underfoot",
    type: "item",
    slots: ["Chest"],
    classes: ["necromancer", "wizard", "magician", "enchanter"],
    magic: true,
    lore: true,
    ac: 12,
    stats: { str: 3, int: 7 },
    mana: 30,
    resists: { fire: 10, cold: 10, magic: 10 },
    weight: 3.5,
    size: "Medium",
    effect: "Focus: Spell Haste II",
    source: "Shiny Robe of the Underfoot Quest rare random reward (Kejar the Mighty, The Hole)",
  });
  addEdge(questId, robeId, "rewards", { randomGroup: "shiny-robe-of-the-underfoot-drop" });
}

// ---------------------------------------------------------------------
// Shondo and the Tonic
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin-palace";
  const giverId = "npc:erudin-palace:shondo-billin";
  addGiver(giverId, "Shondo Billin", zoneId);

  const questId = "quest:shondo-and-the-tonic";
  addNode({
    id: questId,
    label: "Shondo and the Tonic",
    type: "quest",
    minLevel: 1,
    description: "Shondo Billin in Erudin Palace asks for a Vasty Deep Ale; giving him one grants faction and experience.",
    steps: ["Obtain a Vasty Deep Ale", "Give it to Shondo Billin in Erudin Palace"],
    wiki_title: "Shondo and the Tonic",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Gem Choppers");
  addFactionReward(questId, "Merchants of AkAnon");
  addFactionReward(questId, "King AkAnon");
}

// ---------------------------------------------------------------------
// Shovel Of Ponz Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:temple-of-solusek-ro";
  const najenaId = "zone:najena";
  const cazicId = "zone:temple-of-cazic-thule";
  const giverId = "npc:temple-of-solusek-ro:vira";
  addGiver(giverId, "Vira", zoneId);

  const questId = "quest:shovel-of-ponz-quest";
  addNode({
    id: questId,
    label: "Shovel Of Ponz Quest",
    type: "quest",
    classes: ["magician"],
    description:
      "Vira in the Temple of Solusek Ro trades a Ruby (bought from a jewelry merchant), a Gargoyle Eye (drops from gargoyles), a Shovel (drops from magicians in Najena or alligators in Temple of Cazic Thule), and Hill Giant Toes (drop from hill giants) for the Shovel of Ponz.",
    minLevel: 33,
    steps: [
      "Buy a Ruby from a jewelry merchant",
      "Kill a gargoyle for a Gargoyle Eye",
      "Kill a magician in Najena, or an alligator in Temple of Cazic Thule, for a Shovel",
      "Kill a hill giant for Hill Giant Toes",
      "Turn in all four items to Vira in the Temple of Solusek Ro",
    ],
    wiki_title: "Shovel Of Ponz Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, najenaId, "located_in");
  addEdge(questId, cazicId, "located_in");
  addFactionReward(questId, "Temple Of Sol Ro");

  const shovelId = "item:shovel-of-ponz";
  addNode({
    id: shovelId,
    label: "Shovel of Ponz",
    type: "item",
    slots: ["Primary"],
    classes: ["magician"],
    race: ["human", "erudite", "high elf", "dark elf", "gnome"],
    skill: "1H Blunt",
    damage: 6,
    delay: 25,
    magic: true,
    stats: { str: 3, int: 2 },
    weight: 3.5,
    size: "Large",
    effect: "Focus: Minion of Earth; Reclaim Energy (instant cast) at Level 20",
    source: "Shovel Of Ponz Quest reward (Vira, Temple of Solusek Ro)",
  });
  addEdge(questId, shovelId, "rewards");
}

// ---------------------------------------------------------------------
// Sifaye Abominations
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const giverId = "npc:kael-drakkal:nojas-blackfist";
  addGiver(giverId, "Nojas Blackfist", zoneId);

  const questId = "quest:sifaye-abominations";
  addNode({
    id: questId,
    label: "Sifaye Abominations",
    type: "quest",
    minLevel: 50,
    description:
      "Nojas Blackfist in Kael Drakkel trades a Wing of a Sifaye Knight (rare drop, not the common \"A Sifaye Wing\") plus three heads from Sifaye Thanes and Troubadours for the Silver Dragon Tattoo.",
    steps: [
      "Kill a Sifaye Knight for a rare Wing of a Sifaye Knight (not the common wing drop)",
      "Kill three Sifaye Thanes or Troubadours for their heads",
      "Turn in the wing and three heads to Nojas Blackfist in Kael Drakkel",
    ],
    wiki_title: "Sifaye Abominations",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const tattooId = "item:silver-dragon-tattoo";
  addNode({
    id: tattooId,
    label: "Silver Dragon Tattoo",
    type: "item",
    slots: ["Face", "Shoulders", "Arms", "Wrist"],
    magic: true,
    lore: true,
    noTrade: true,
    ac: 2,
    stats: { str: 4, wis: 4 },
    weight: 0.1,
    size: "Small",
    source: "Sifaye Abominations reward (Nojas Blackfist, Kael Drakkel)",
  });
  addEdge(questId, tattooId, "rewards");
}

// ---------------------------------------------------------------------
// Sir Lindeal's Testimony
// ---------------------------------------------------------------------
{
  const zoneId = "zone:neriak-3rd-gate";
  const lavastormId = "zone:lavastorm-mountains";
  const giverId = "npc:neriak-3rd-gate:loveal-snez";
  addGiver(giverId, "Loveal S`Nez", zoneId);

  const questId = "quest:sir-lindeals-testimony";
  addNode({
    id: questId,
    label: "Sir Lindeal's Testimony",
    type: "quest",
    classes: ["cleric", "shadow knight", "necromancer"],
    description:
      "Loveal S`Nez in Neriak 3rd Gate sends players to slay Sir Lindeal in Lavastorm Mountains and retrieve his Testimony, for the Cloak of the Undead Eye. Requires at least dubious faction with Loveal S`Nez -- indifferent or worse fails the turn-in.",
    minLevel: 15,
    steps: ["Speak with Loveal S`Nez in Neriak 3rd Gate", "Slay Sir Lindeal in Lavastorm Mountains", "Loot his Testimony and return it to Loveal S`Nez"],
    wiki_title: "Sir Lindeal's Testimony",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, lavastormId, "located_in");
  addFactionReward(questId, "Bloodsabers");
  addFactionReward(questId, "The Dead");

  const cloakId = "item:cloak-of-the-undead-eye";
  addNode({
    id: cloakId,
    label: "Cloak of the Undead Eye",
    type: "item",
    slots: ["Back"],
    classes: ["cleric", "shadow knight", "necromancer"],
    race: ["dark elf"],
    magic: true,
    lore: true,
    ac: 4,
    weight: 3.5,
    size: "Medium",
    effect: "Invisibility versus Undead (2 charges, instant cast)",
    source: "Sir Lindeal's Testimony reward (Loveal S`Nez, Neriak 3rd Gate)",
  });
  addEdge(questId, cloakId, "rewards");
}

// ---------------------------------------------------------------------
// Sir Morgan's Armor
// ---------------------------------------------------------------------
{
  const zoneId = "zone:eastern-karana";
  const giverId = "npc:eastern-karana:sir-morgan";
  addGiver(giverId, "Sir Morgan", zoneId);

  const questId = "quest:sir-morgans-armor";
  addNode({
    id: questId,
    label: "Sir Morgan's Armor",
    type: "quest",
    minLevel: 1,
    description:
      "Sir Morgan in the Eastern Plains of Karana trades 5 gold for a random piece of patchwork or tattered gear he says he \"found lying on the highway to Highkeep Hold.\" eqlwiki.com lists the pool as: Patchwork Cloak, Patchwork Boots, Rusty Weapons, Silver Earring, Bloodstone, Halfling Knife, a 1st level spell scroll, Bronze Dagger, Belt Pouch, Damask Cap, Mountain Lion Cape, Highkeep Flask, Snakeskin Mask, and Drom's Champagne -- several of those (\"Rusty Weapons\", \"a 1st level spell scroll\") are generic categories rather than single named items, so no individual `rewards` edges are modeled for this pool.",
    steps: ["Give Sir Morgan 5 gold", "Receive a random piece of patchwork/tattered gear"],
    wiki_title: "Sir Morgan's Armor",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Skunk Hunting
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-kaladim";
  const butcherblockId = "zone:butcherblock-mountains";
  const giverId = "npc:north-kaladim:nultal-malfoot";
  addGiver(giverId, "Nultal Malfoot", zoneId);

  const questId = "quest:skunk-hunting";
  addNode({
    id: questId,
    label: "Skunk Hunting",
    type: "quest",
    classes: ["cleric", "druid", "enchanter", "magician", "necromancer", "paladin", "ranger", "shadow knight", "shaman", "wizard"],
    description:
      "Nultal Malfoot in North Kaladim trades 4 Skunk Scent Glands (from a large skunk in Butcherblock Mountains) for a random spell scroll (Cure Poison, Divine Aura, Fear, Flash of Light, Furor, Gate, Holy Armor, Lull, or Stun), faction, coin, and experience. Requires Amiable faction with Clerics of Underfoot.",
    minLevel: 2,
    steps: ["Kill a large skunk in Butcherblock Mountains for 4 Skunk Scent Glands", "Turn them in to Nultal Malfoot in North Kaladim"],
    wiki_title: "Skunk Hunting",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, butcherblockId, "located_in");
  addFactionReward(questId, "Clerics of Underfoot");
  addFactionReward(questId, "Kazon Stormhammer");
  addFactionReward(questId, "Miners Guild 249");

  const spellRewards = ["cure-poison", "divine-aura", "fear", "flash-of-light", "furor", "gate", "holy-armor", "lull", "stun"];
  for (const s of spellRewards) {
    addEdge(questId, `spell:${s}`, "rewards", { randomGroup: "skunk-hunting-scroll" });
  }
}

// ---------------------------------------------------------------------
// Slaggak's Bounty (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const cobaltScarId = "zone:cobalt-scar";
  const greatDivideId = "zone:great-divide";
  const giverId = "npc:kael-drakkal:slaggak-the-trainer";
  addGiver(giverId, "Slaggak the Trainer", zoneId);

  const groupId = "quest_group:slaggaks-bounty";
  addNode({
    id: groupId,
    label: "Slaggak's Bounty",
    type: "quest_group",
    description:
      "Slaggak the Trainer in Kael Drakkel runs two independent turn-in tracks: \"For every four shard wurm fang you bring me, I am authorized to reward you with a pair of cerulean greaves\" and \"Every fourth ice wyvern stinger will grant you a pair of vambraces.\" Two independent sub-quests, no ordering between them. Velious-era content (Out of Era).",
    classes: ["warrior", "cleric", "paladin", "shadow knight", "bard"],
    minLevel: 40,
    wiki_title: "Slaggak's Bounty",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");
  addEdge(groupId, cobaltScarId, "located_in");
  addEdge(groupId, greatDivideId, "located_in");

  const greavesQuestId = "quest:slaggaks-bounty-cerulean-greaves";
  addNode({
    id: greavesQuestId,
    label: "Slaggak's Bounty: Cerulean Greaves",
    type: "quest",
    classes: ["warrior", "cleric", "paladin", "shadow knight", "bard"],
    minLevel: 40,
    description: "Turn in 4x Shard Wurm Fang (Cobalt Scar/Great Divide) to Slaggak the Trainer in Kael Drakkel for a pair of Cerulean Greaves.",
    steps: ["Kill shard wurms in Cobalt Scar or Great Divide for 4 Shard Wurm Fang", "Turn them in to Slaggak the Trainer"],
    wiki_title: "Slaggak's Bounty",
  });
  addEdge(giverId, greavesQuestId, "starts");
  addEdge(greavesQuestId, zoneId, "starts_in");
  addEdge(greavesQuestId, zoneId, "located_in");
  addEdge(greavesQuestId, cobaltScarId, "located_in");
  addEdge(greavesQuestId, greatDivideId, "located_in");
  addEdge(greavesQuestId, groupId, "member_of");
  addFactionReward(greavesQuestId, "Kromrif");
  addFactionReward(greavesQuestId, "Kromzek");

  const greavesId = "item:cerulean-greaves";
  addNode({
    id: greavesId,
    label: "Cerulean Greaves",
    type: "item",
    slots: ["Legs"],
    classes: ["warrior", "cleric", "paladin", "shadow knight", "bard"],
    magic: true,
    ac: 9,
    stats: { dex: 1, agi: 1 },
    source: "Slaggak's Bounty: Cerulean Greaves reward (Slaggak the Trainer, Kael Drakkel)",
  });
  addEdge(greavesQuestId, greavesId, "rewards");

  const vambracesQuestId = "quest:slaggaks-bounty-cerulean-vambraces";
  addNode({
    id: vambracesQuestId,
    label: "Slaggak's Bounty: Cerulean Vambraces",
    type: "quest",
    classes: ["warrior", "cleric", "paladin", "shadow knight", "bard"],
    minLevel: 40,
    description: "Turn in 4x Ice Wyvern Stinger (Cobalt Scar/Great Divide) to Slaggak the Trainer in Kael Drakkel for a pair of Cerulean Vambraces.",
    steps: ["Kill ice wyverns in Cobalt Scar or Great Divide for 4 Ice Wyvern Stinger", "Turn them in to Slaggak the Trainer"],
    wiki_title: "Slaggak's Bounty",
  });
  addEdge(giverId, vambracesQuestId, "starts");
  addEdge(vambracesQuestId, zoneId, "starts_in");
  addEdge(vambracesQuestId, zoneId, "located_in");
  addEdge(vambracesQuestId, cobaltScarId, "located_in");
  addEdge(vambracesQuestId, greatDivideId, "located_in");
  addEdge(vambracesQuestId, groupId, "member_of");
  addFactionReward(vambracesQuestId, "Kromrif");
  addFactionReward(vambracesQuestId, "Kromzek");

  const vambracesId = "item:cerulean-vambraces";
  addNode({
    id: vambracesId,
    label: "Cerulean Vambraces",
    type: "item",
    slots: ["Arms"],
    classes: ["warrior", "cleric", "paladin", "shadow knight", "bard"],
    magic: true,
    ac: 11,
    stats: { str: 2 },
    source: "Slaggak's Bounty: Cerulean Vambraces reward (Slaggak the Trainer, Kael Drakkel)",
  });
  addEdge(vambracesQuestId, vambracesId, "rewards");
}

// ---------------------------------------------------------------------
// Slave Keys
// ---------------------------------------------------------------------
{
  const zoneId = "zone:crushbone";
  const giverId = "npc:crushbone:retlon-brenclog";
  addGiver(giverId, "Retlon Brenclog", zoneId);

  const questId = "quest:slave-keys";
  addNode({
    id: questId,
    label: "Slave Keys",
    type: "quest",
    minLevel: 1,
    description:
      "Retlon Brenclog and the enslaved dwarves/elves in Crushbone trade Shackle Keys 15-21 (looted from Orc Slavers) for coin and experience. Must be at least dubious faction to receive rewards.",
    steps: ["Kill Orc Slavers in Crushbone for Shackle Keys 15-21", "Turn each key in to the matching enslaved NPC"],
    wiki_title: "Slave Keys",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Snake Fang Necklace Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:menkes-tabolet";
  addGiver(giverId, "Menkes Tabolet", zoneId);

  const questId = "quest:snake-fang-necklace-quest";
  addNode({
    id: questId,
    label: "Snake Fang Necklace Quest",
    type: "quest",
    minLevel: 1,
    description: "Menkes Tabolet in South Qeynos trades 3 snake fangs and 2 gold for the Snake Fang Necklace.",
    steps: ["Gather 3 snake fangs", "Give them plus 2 gold to Menkes Tabolet in South Qeynos"],
    wiki_title: "Snake Fang Necklace Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const necklaceId = "item:snake-fang-necklace";
  addNode({
    id: necklaceId,
    label: "Snake Fang Necklace",
    type: "item",
    slots: ["Neck"],
    resists: { poison: 2 },
    weight: 0.1,
    size: "Tiny",
    source: "Snake Fang Necklace Quest reward (Menkes Tabolet, South Qeynos)",
  });
  addEdge(questId, necklaceId, "rewards");
}

// ---------------------------------------------------------------------
// Sneed's Rat Infestation
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-qeynos";
  const giverId = "npc:north-qeynos:sneed-galliway";
  addGiver(giverId, "Sneed Galliway", zoneId);

  const questId = "quest:sneeds-rat-infestation";
  addNode({
    id: questId,
    label: "Sneed's Rat Infestation",
    type: "quest",
    minLevel: 2,
    description: "Sneed Galliway in North Qeynos sends players to kill a mangy rat and bring back its head, for a random minor item (Dagger, Water Flask, or Torch), faction, coin, and experience.",
    steps: ["Kill a mangy rat", "Bring its head to Sneed Galliway in North Qeynos"],
    wiki_title: "Sneed's Rat Infestation",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Merchants of Qeynos");
  addFactionReward(questId, "Antonius Bayle");
  addFactionReward(questId, "Coalition of Tradefolk");
  addFactionReward(questId, "Guards of Qeynos");

  const daggerId = "item:dagger";
  addNode({
    id: daggerId,
    label: "Dagger",
    type: "item",
    slots: ["Primary", "Secondary"],
    classes: ["bard", "beastlord", "berserker", "enchanter", "magician", "necromancer", "ranger", "rogue", "shadow knight", "warrior", "wizard"],
    skill: "Piercing",
    damage: 3,
    delay: 20,
    weight: 2.5,
    size: "Small",
    source: "Sneed's Rat Infestation random reward (Sneed Galliway, North Qeynos); also sold by merchants across many zones",
  });
  addEdge(questId, daggerId, "rewards", { randomGroup: "sneeds-rat-infestation-drop" });
  addEdge(questId, "item:water-flask", "rewards", { randomGroup: "sneeds-rat-infestation-drop" });
  addEdge(questId, "item:torch", "rewards", { randomGroup: "sneeds-rat-infestation-drop" });
}

// ---------------------------------------------------------------------
// Soil of Underfoot (covers both "Soil of Underfoot" and "Soil of
// Underfoot Quest" checklist entries -- same NPC/turn-in/reward, two
// conflicting wiki pages, see header comment)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-kaladim";
  const faydarkGreaterId = "zone:greater-faydark";
  const faydarkLesserId = "zone:lesser-faydark";
  const giverId = "npc:north-kaladim:priestess-ghalea";
  addGiver(giverId, "Priestess Ghalea", zoneId);

  const questId = "quest:soil-of-underfoot";
  addNode({
    id: questId,
    label: "Soil of Underfoot",
    type: "quest",
    classes: ["paladin"],
    minLevel: 35,
    description:
      "Priestess Ghalea in North Kaladim trades four portions of Fairy Dust (from faeries in Greater/Lesser Faydark) for a pouch of Soil of Underfoot, plus faction, gold, and platinum. Requires high amiable faction with Clerics of Underfoot (confirmed at 453, failed at 403).",
    steps: ["Gather 4 unstacked Fairy Dust from faeries in Greater or Lesser Faydark", "Turn them in to Priestess Ghalea in North Kaladim"],
    wiki_title: "Soil of Underfoot",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, faydarkGreaterId, "located_in");
  addEdge(questId, faydarkLesserId, "located_in");
  addFactionReward(questId, "Clerics of Underfoot");
  addFactionReward(questId, "Kazon Stormhammer");
  addFactionReward(questId, "Miners Guild 249");

  const soilId = "item:soil-of-underfoot";
  addNode({
    id: soilId,
    label: "Soil of Underfoot",
    type: "item",
    lore: true,
    noTrade: true,
    weight: 0.5,
    size: "Tiny",
    source: "Soil of Underfoot reward (Priestess Ghalea, North Kaladim)",
  });
  addEdge(questId, soilId, "rewards");
}

// ---------------------------------------------------------------------
// Solusek's Flower
// ---------------------------------------------------------------------
{
  const zoneId = "zone:mistmoore-castle";
  const giverId = "npc:mistmoore-castle:ssynthi";
  addGiver(giverId, "Ssynthi", zoneId);

  const questId = "quest:soluseks-flower";
  addNode({
    id: questId,
    label: "Solusek's Flower",
    type: "quest",
    minLevel: 1,
    description:
      "Ssynthi in Mistmoore Castle trades a flower (ground spawn atop a coffin inside a tomb, 1-minute respawn) for the Scepter of Sorrow. Avoid stepping to either side of the coffin -- pit traps drop you into Mistmoore's basement.",
    steps: ["Pick the flower spawn atop the coffin in the tomb", "Turn it in to Ssynthi in Mistmoore Castle"],
    wiki_title: "Solusek's Flower",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Temple Of Sol Ro");

  const scepterId = "item:scepter-of-sorrow";
  addNode({
    id: scepterId,
    label: "Scepter of Sorrow",
    type: "item",
    classes: ["necromancer"],
    race: ["human", "erudite", "dark elf", "gnome", "iksar"],
    weight: 0.1,
    size: "Small",
    source: "Solusek's Flower reward (Ssynthi, Mistmoore Castle)",
  });
  addEdge(questId, scepterId, "rewards");
}

// ---------------------------------------------------------------------
// Solvedi Scimitar Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:rathe-mountains";
  const northernKaranaId = "zone:northern-karana";
  const southernKaranaId = "zone:southern-karana";
  const giverId = "npc:rathe-mountains:solvedi-aldeberan";
  addGiver(giverId, "Solvedi Aldeberan", zoneId);

  const questId = "quest:solvedi-scimitar-quest";
  addNode({
    id: questId,
    label: "Solvedi Scimitar Quest",
    type: "quest",
    classes: ["druid"],
    description:
      "Solvedi Aldeberan in Rathe Mountains trades a Giant Laceless Sandal (from Timbur the Tiny, Northern Karana) and a Lionhide Backpack (from Groi Gutblade, Southern Karana) for the Solvedi Scimitar. Must hail him and follow the full dialogue before turning in items, or they're lost with no reward.",
    minLevel: 25,
    steps: [
      "Kill Timbur the Tiny in Northern Karana for a Giant Laceless Sandal",
      "Kill Groi Gutblade in Southern Karana for a Lionhide Backpack",
      "Hail Solvedi Aldeberan in Rathe Mountains and follow his dialogue before turning in both items",
    ],
    wiki_title: "Solvedi Scimitar Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, northernKaranaId, "located_in");
  addEdge(questId, southernKaranaId, "located_in");

  const scimitarId = "item:solvedi-scimitar";
  addNode({
    id: scimitarId,
    label: "Solvedi Scimitar",
    type: "item",
    slots: ["Primary"],
    classes: ["druid"],
    race: ["human", "wood elf", "half elf", "halfling"],
    skill: "1H Slashing",
    damage: 6,
    delay: 22,
    magic: true,
    weight: 3.0,
    size: "Medium",
    source: "Solvedi Scimitar Quest reward (Solvedi Aldeberan, Rathe Mountains) -- wiki's infobox race line reads \"HUM ELF HEF HFL\"; resolved to Wood Elf since it's the only elf subtype eligible for Druid",
  });
  addEdge(questId, scimitarId, "rewards");
}

// ---------------------------------------------------------------------
// Sparring Armor
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-cabilis";
  const swampZoneId = "zone:swamp-of-no-hope";
  const giverId = "npc:east-cabilis:master-bain";
  addGiver(giverId, "Master Bain", zoneId);

  const questId = "quest:sparring-armor";
  addNode({
    id: questId,
    label: "Sparring Armor",
    type: "quest",
    classes: ["monk"],
    race: ["iksar"],
    minLevel: 4,
    description:
      "Master Bain in East Cabilis fills a Monk Training Bag with 4 Leech Husks (from swamp leeches in the Swamp of No Hope) and 3 Piles of Granite Pebbles (from completing the Granite Pebbles quest three times), then trades the filled bag for a random piece of Sparring Armor (one of 10 named pieces) plus faction and 1 gold. Can be done at indifferent faction via sneak. Most pieces are Iksar-only; the Sparring Headgear is also usable by Humans.",
    steps: [
      "Gather 4 Leech Husks from swamp leeches in the Swamp of No Hope",
      "Complete the Granite Pebbles quest three times for 3 Piles of Granite Pebbles",
      "Fill a Monk Training Bag with both and hand it to Master Bain for a random Sparring Armor piece",
    ],
    wiki_title: "Sparring Armor",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, swampZoneId, "located_in");
  addFactionReward(questId, "Swift Tails");
  addFactionReward(questId, "Legion of Cabilis");

  const pieces: Array<{ label: string; slot: string; ac: number; stats?: Record<string, number>; hp?: number; resists?: Record<string, number>; weight: number; size: string; race?: string[] }> = [
    { label: "Sparring Arm Guards", slot: "Arms", ac: 3, stats: { sta: 2 }, weight: 0.4, size: "Small" },
    { label: "Sparring Clogs", slot: "Feet", ac: 3, stats: { agi: 2 }, weight: 0.5, size: "Small" },
    { label: "Sparring Collar", slot: "Neck", ac: 2, resists: { cold: 2 }, weight: 0.2, size: "Small" },
    { label: "Sparring Facemask", slot: "Face", ac: 2, resists: { disease: 3 }, weight: 0.2, size: "Small" },
    { label: "Sparring Grappler Gloves", slot: "Hands", ac: 3, resists: { poison: 3 }, weight: 0.4, size: "Small" },
    { label: "Sparring Harness", slot: "Chest", ac: 5, hp: 2, resists: { fire: 3 }, weight: 1.0, size: "Medium" },
    { label: "Sparring Headgear", slot: "Head", ac: 3, stats: { agi: 1 }, weight: 0.2, size: "Small", race: ["human", "iksar"] },
    { label: "Sparring Rib Pad", slot: "Waist", ac: 4, stats: { str: 1 }, hp: 5, weight: 0.2, size: "Small" },
    { label: "Sparring Shin Guards", slot: "Legs", ac: 4, stats: { cha: 2 }, resists: { cold: 2 }, weight: 0.7, size: "Medium" },
    { label: "Sparring Shoulder Pads", slot: "Shoulders", ac: 2, stats: { dex: 1 }, hp: 2, weight: 0.3, size: "Small" },
  ];
  for (const piece of pieces) {
    const rewardId = `item:${slug(piece.label)}`;
    addNode({
      id: rewardId,
      label: piece.label,
      type: "item",
      slots: [piece.slot],
      classes: ["monk"],
      race: piece.race ?? ["iksar"],
      ac: piece.ac,
      ...(piece.stats ? { stats: piece.stats } : {}),
      ...(piece.hp !== undefined ? { hp: piece.hp } : {}),
      ...(piece.resists ? { resists: piece.resists } : {}),
      weight: piece.weight,
      size: piece.size,
      source: "Sparring Armor random reward (Master Bain, East Cabilis)",
    });
    addEdge(questId, rewardId, "rewards", { randomGroup: "sparring-armor-drop" });
  }
}

// ---------------------------------------------------------------------
// Toolset Delivery (pulled in early -- Spear Delivery's own page names
// it as part of the same series, per the issue's own guardrail)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const iceZoneId = "zone:iceclad-ocean";
  const giverId = "npc:kael-drakkal:wenglawks-kkeak";
  addGiver(giverId, "Wenglawks Kkeak", zoneId);

  const questId = "quest:toolset-delivery";
  addNode({
    id: questId,
    label: "Toolset Delivery",
    type: "quest",
    minLevel: 50,
    description:
      "Wenglawks Kkeak in Kael Drakkel trades a Coldain Toolset (from Kellek Felhammer) delivered to Sojan the Sleepless in Iceclad Ocean for the Engraved Bone Pauldrons. First of three optional, independently-startable quests (Spear Delivery, Mechanical Net Delivery); the wiki notes each can be skipped and any of the three started on its own.",
    steps: ["Trade a voucher to Kellek Felhammer for a Coldain Toolset", "Deliver the toolset to Sojan the Sleepless in Iceclad Ocean"],
    wiki_title: "Toolset Delivery",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, iceZoneId, "located_in");

  const pauldronsId = "item:engraved-bone-pauldrons";
  addNode({
    id: pauldronsId,
    label: "Engraved Bone Pauldrons",
    type: "item",
    slots: ["Shoulders"],
    magic: true,
    ac: 12,
    stats: { dex: 3, agi: 5, cha: -20 },
    source: "Toolset Delivery reward (Wenglawks Kkeak, Kael Drakkel)",
  });
  addEdge(questId, pauldronsId, "rewards");
}

// ---------------------------------------------------------------------
// Spear Delivery
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const cobaltScarId = "zone:cobalt-scar";
  const greatDivideId = "zone:great-divide";
  const giverId = "npc:kael-drakkal:wenglawks-kkeak";
  addGiver(giverId, "Wenglawks Kkeak", zoneId);

  const questId = "quest:spear-delivery";
  addNode({
    id: questId,
    label: "Spear Delivery",
    type: "quest",
    classes: ["rogue"],
    minLevel: 45,
    description:
      "Wenglawks Kkeak in Kael Drakkel trades a Hunting Spear (from Kellek Felhammer) and a Giant Shard Wurm Tooth (from an angry shardwurm, Cobalt Scar/Great Divide) for the Bracer of Midnight. Second of three optional, independently-startable quests (Toolset Delivery, Mechanical Net Delivery).",
    steps: [
      "Trade a voucher to Kellek Felhammer for a Hunting Spear",
      "Kill an angry shardwurm for a Giant Shard Wurm Tooth",
      "Turn in both items to Wenglawks Kkeak in Kael Drakkel",
    ],
    wiki_title: "Spear Delivery",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, cobaltScarId, "located_in");
  addEdge(questId, greatDivideId, "located_in");

  const bracerId = "item:bracer-of-midnight";
  addNode({
    id: bracerId,
    label: "Bracer of Midnight",
    type: "item",
    slots: ["Wrist"],
    classes: ["rogue"],
    magic: true,
    ac: 9,
    stats: { str: 5, agi: 5 },
    hp: 10,
    weight: 0.5,
    size: "Medium",
    source: "Spear Delivery reward (Wenglawks Kkeak, Kael Drakkel)",
  });
  addEdge(questId, bracerId, "rewards");
}

// ---------------------------------------------------------------------
// Spider Legs Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:skyshrine";
  const giverId = "npc:skyshrine:sentry-kale";
  addGiver(giverId, "Sentry Kale", zoneId);

  const questId = "quest:spider-legs-quest";
  addNode({
    id: questId,
    label: "Spider Legs Quest",
    type: "quest",
    minLevel: 45,
    description:
      "Sentry Kale in Skyshrine trades 4 Velium Spider Legs (from invisible crystal spiders) for a reward of 0-4 platinum plus, not always, the Ring of the Chameleon.",
    steps: ["Kill four invisible crystal spiders in Skyshrine for 4 Velium Spider Legs", "Turn them in to Sentry Kale"],
    wiki_title: "Spider Legs Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const ringId = "item:ring-of-the-chameleon";
  addNode({
    id: ringId,
    label: "Ring of the Chameleon",
    type: "item",
    slots: ["Finger"],
    magic: true,
    ac: 3,
    stats: { dex: 4, wis: 4, int: 4 },
    weight: 0,
    size: "Tiny",
    source: "Spider Legs Quest reward (Sentry Kale, Skyshrine) -- not a guaranteed drop each completion",
  });
  addEdge(questId, ringId, "rewards");
}

// ---------------------------------------------------------------------
// Spiderling Silks
// ---------------------------------------------------------------------
{
  const zoneId = "zone:greater-faydark";
  const giverId = "npc:greater-faydark:sylia-windlehands";
  addGiver(giverId, "Sylia Windlehands", zoneId);

  const questId = "quest:spiderling-silks";
  addNode({
    id: questId,
    label: "Spiderling Silks",
    type: "quest",
    classes: ["bard"],
    minLevel: 1,
    description:
      "Sylia Windlehands at the Songweavers Guild Hall in Kelethin trades 4 unstacked Spiderling Silks (from a widow hatchling in Greater Faydark) for a Hand Drum, faction, and 1 gold. Requires Amiable or better faction with Songweavers.",
    steps: ["Kill a widow hatchling in Greater Faydark for 4 unstacked Spiderling Silks", "Turn them in to Sylia Windlehands in Kelethin"],
    wiki_title: "Spiderling Silks",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Songweavers");

  const drumId = "item:hand-drum";
  addNode({
    id: drumId,
    label: "Hand Drum",
    type: "item",
    slots: ["Secondary"],
    classes: ["bard"],
    weight: 0.5,
    size: "Small",
    effect: "Percussion Resonance: 8",
    source: "Spiderling Silks reward (Sylia Windlehands, Kelethin)",
  });
  addEdge(questId, drumId, "rewards");
}

save();
