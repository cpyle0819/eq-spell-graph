/**
 * Migration 092: next standalone batch off GitHub issue #26's checklist --
 * "The Bread Shipment (Kelethin)" through "The Gift Box". Researched directly
 * against eqlwiki.com, following decisions/eqlwiki-quest-research-method.md.
 *
 * Skipped and tagged broken (not modeled, per the issue's own guardrail,
 * quoting the wiki's own disclaimer):
 * - The Bread Shipment -- wiki's own page: "The original (removed) quest
 *   follows:", describing Jarlen Meadowgreen's discontinued 2gp-for-a-bag
 *   trade in Southern Karana (still referenced as a live source step by every
 *   already-modeled "The Bread Shipment (City)" quest, just no longer its own
 *   turn-in).
 * - The Broodling -- wiki's own disclaimer: "This is an unsolved or broken
 *   quest" plus "MISSING INFO! Please expand the content," no confirmed
 *   reward.
 * - The Burning Dead -- wiki's own disclaimer: "This is an unsolved or broken
 *   quest. Note: It is widely presumed this quest is broken."
 *
 * Deferred, not modeled (new cluster discovery, per the issue's own
 * "a cluster can hide behind alphabetically unrelated names" guardrail):
 * - The First Arcane Test -- Gozzrem in the Temple of Veeshan runs a
 *   tear-turn-in mechanic (Poison Tear from Dozekar the Cursed, plus three
 *   named symbols) matching the Dozekar Tear Quests cluster's own shape, and
 *   the giver's own line -- "If this task is not hard enough for you, I have
 *   a second quest for you" -- confirms it chains into The Second Arcane Test
 *   (unchecked, T section) as an ordered pair rather than a flat standalone.
 *   Modeling a new ordered chain is disproportionate to a standalone batch
 *   (max 1 ordered chain per batch, and this one isn't even from the
 *   Questlines section yet); tracked as a new Questlines-section entry
 *   instead of two standalone checklist lines.
 *
 * Modeled as one quest (duplicate wiki pages, same shape as migration 090's
 * Soil of Underfoot):
 * - The Etched Stone / The Etched Stone (Spell: Life Leech) -- both pages
 *   describe the identical Kazzel D`Leryt turn-in chain in Rathe Mountains
 *   ending in the same Pulsating Hyacinth Telesm + Spell: Life Leech reward;
 *   modeled once under quest:the-etched-stone.
 *
 * Era-flagged directly from the quest's own page (not just zone
 * inheritance -- decisions/quest-era-flagging.md):
 * - The Family Chest Straps -- wiki's own page: "the quest is from the
 *   'Velious Era' and currently marked 'Out of Era'".
 * - The Four Idols -- wiki's own page: "This is a Velious Era quest and is
 *   currently out of era."
 *
 * Deliberately NOT modeled as `item` nodes (consistent with prior batches):
 * - Chapter III, When Stars Forget Their Light / Holiday Gift (The Four
 *   Fragments) -- no stat infobox, no linked item page; kept as prose lore
 *   rewards only, same treatment as untitled coin/note rewards throughout.
 * - The Clothspinner Sisters (evil)/(good) reward pools -- both pages give
 *   only a vague, non-exhaustive item list ("Patchwork armor, Rusty weapons,
 *   or Cleric spells, small chance of a Rat Shaped Ring" / "a decent item,"
 *   unresolved on the wiki itself) -- same non-exhaustive-pool carve-out as
 *   migration 090's Taskmaster Earring, no reward item edges modeled.
 * - Coin rewards throughout (The Crate (evil)/(good), The Fisherman, The
 *   Frikniller Family, etc).
 * - Negative faction changes throughout (all quests in this batch that hit
 *   an opposing faction on top of their positive rewards).
 * - Tower of Frozen Shadow (The Four Fragments' farm zone) -- confirmed via
 *   its own wiki page to be a real separate zone inside Iceclad Ocean
 *   ("located at loc 1700, 2850 in the Iceclad Ocean zone"), not a sub-spot
 *   of Great Divide as the quest page's own zone line implied; Iceclad Ocean
 *   itself already exists as a zone node and is used for the located_in
 *   edge instead of adding a new zone node for the dungeon landmark itself,
 *   consistent with migration 090's Erud's Crossing precedent (giver's own
 *   zone gets added if missing; a farm-only sub-location a level deeper does
 *   not, when its containing real zone already exists).
 * - Erud's Crossing (The Geologist's Purloined Tools' delivery stop) -- still
 *   has no zone node in this graph (same gap noted in migration 090's The
 *   Acolyte); giver Gans Paust's own zone (Erudin) already exists, so per the
 *   same precedent this stays prose-only rather than a located_in edge.
 * - Temple of Life (The Clothspinner Sisters (good) giver's named location)
 *   -- eqlwiki.com has no page for it as its own zone (404); treated as a
 *   named building inside North Qeynos, same as Temple of Thunder in
 *   migration 090's Temple Blankets Quest.
 * - Gift Box's 8 cosmetic color variants -- same clicky item with a
 *   color-varied "Open [Color] Box" effect per the wiki, not 8 distinct
 *   rewards; modeled as one item:gift-box node. Frostmaidens Idol (the
 *   wiki's own "occasionally" alternate outcome, with real stats) is
 *   modeled as a second node in a 2-outcome randomGroup.
 *
 * Reused existing nodes: zones (Erudin, Halas, Oggok, Rivervale, South
 * Qeynos, North Qeynos, North Freeport, East Freeport, North Kaladim,
 * Northern Felwithe, Paineel, Innothule Swamp, Steamfont Mountains, Rathe
 * Mountains, Crushbone, Toxxulia Forest, Great Divide, Kael Drakkal, High
 * Keep, Ocean of Tears, Kedge Keep, Temple of Veeshan (unused, deferred),
 * Plane of Mischief, Qeynos Aqueducts, Eastern Karana, Plane of Growth,
 * Iceclad Ocean, Greater Faydark, Southern Karana) all already exist. Reused
 * existing NPCs: Antus Shelbra, Weligon Steelherder, Astaed Wemor, Daedet
 * Losaren, Guardian of Takish, Gans Paust, and Marda (the last already
 * linked from migration 087's Marda's Secret Mission, which itself already
 * documents "after completing The Emissary" -- a `requires` edge is added
 * here now that The Emissary exists as a real node). Reused existing items:
 * item:rat-shaped-ring (mentioned in Clothspinner (evil) prose only, not as
 * a reward edge, per the non-exhaustive-pool carve-out above).
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, addFactionReward, addGiver, save } = loadGraph(import.meta.dir);

// ---------------------------------------------------------------------
// The Bread Shipment -- SKIPPED, broken/removed per the wiki's own text:
// "The original (removed) quest follows:" (Jarlen Meadowgreen's
// discontinued 2gp bread-loaves trade in Southern Karana).
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// The Bread Shipment (Kelethin)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:greater-faydark";
  const karanaId = "zone:southern-karana";
  const giverId = "npc:greater-faydark:innkeep-wuleran";
  addGiver(giverId, "Innkeep Wuleran", zoneId);

  const questId = "quest:the-bread-shipment-kelethin";
  addNode({
    id: questId,
    label: "The Bread Shipment (Kelethin)",
    type: "quest",
    minLevel: 1,
    description: "Innkeep Wuleran in Greater Faydark trades a Bag of Bread Loaves, purchased from Jarlen Meadowgreen in Southern Karana for 2 gold, for experience, coin, and faction.",
    steps: ["Purchase a Bag of Bread Loaves from Jarlen Meadowgreen in Southern Karana for 2 gold", "Deliver the bread to Innkeep Wuleran"],
    wiki_title: "The Bread Shipment (Kelethin)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, karanaId, "located_in");
  addFactionReward(questId, "Kelethin Merchants");
  addFactionReward(questId, "Faydarks Champions");
  addFactionReward(questId, "Emerald Warriors");
  addFactionReward(questId, "Anti-Mage");
}

// ---------------------------------------------------------------------
// The Bridge
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const qeynosId = "zone:south-qeynos";
  const keepId = "zone:high-keep";
  const steamfontId = "zone:steamfont-mountains";
  const kaladimId = "zone:north-kaladim";
  const giverId = "npc:erudin:weligon-steelherder";
  addGiver(giverId, "Weligon Steelherder", zoneId);

  const questId = "quest:the-bridge";
  addNode({
    id: questId,
    label: "The Bridge",
    type: "quest",
    classes: ["paladin"],
    minLevel: 30,
    description:
      "Weligon Steelherder in Erudin sends players for a sealed list from Hansl Bigroon in South Qeynos, then to slay three architects -- Purchin Oddsbot (High Keep), Jogl Doobraugh (Steamfont Mountains), and Trantor Everhot (North Kaladim) -- for the Deep Six Cutlass. Better than Indifferent faction, likely Amiable, is needed for the final turn-in.",
    steps: [
      "Get a sealed list from Hansl Bigroon in South Qeynos",
      "Kill Purchin Oddsbot in High Keep",
      "Kill Jogl Doobraugh in Steamfont Mountains",
      "Kill Trantor Everhot in North Kaladim",
      "Return to Weligon Steelherder in Erudin",
    ],
    wiki_title: "The Bridge",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, qeynosId, "located_in");
  addEdge(questId, keepId, "located_in");
  addEdge(questId, steamfontId, "located_in");
  addEdge(questId, kaladimId, "located_in");
  addFactionReward(questId, "Deepwater Knights");
  addFactionReward(questId, "High Council of Erudin");

  const cutlassId = "item:deep-six-cutlass";
  addNode({
    id: cutlassId,
    label: "Deep Six Cutlass",
    type: "item",
    slots: ["Primary"],
    classes: ["paladin"],
    race: ["human", "erudite", "high elf", "half elf", "dwarf", "halfling", "gnome"],
    skill: "1H Slashing",
    damage: 14,
    delay: 36,
    stats: { str: 5 },
    magic: true,
    lore: true,
    weight: 12.5,
    size: "Giant",
    effect: "Enduring Breath (Any Slot, instant cast)",
    source: "The Bridge reward (Weligon Steelherder, Erudin)",
  });
  addEdge(questId, cutlassId, "rewards");
}

// ---------------------------------------------------------------------
// The Broodling -- SKIPPED, broken/unfinished per the wiki's own
// disclaimers: "This is an unsolved or broken quest" and "MISSING INFO!
// Please expand the content," with no confirmed reward.
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// The Burning Dead -- SKIPPED, broken/unfinished per the wiki's own
// disclaimer: "This is an unsolved or broken quest. Note: It is widely
// presumed this quest is broken."
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// The Cigar
// ---------------------------------------------------------------------
{
  const zoneId = "zone:halas";
  const giverId = "npc:halas:dok";
  addGiver(giverId, "Dok", zoneId);

  const questId = "quest:the-cigar";
  addNode({
    id: questId,
    label: "The Cigar",
    type: "quest",
    minLevel: 3,
    description:
      "Dok in Halas has players collect six honeycombs from bixies and combine them in an Empty Jar into a Full Honeycomb Jar, traded for the Everburn Candle.",
    steps: ["Kill bixies for 6 honeycombs", "Combine them in an Empty Jar for a Full Honeycomb Jar", "Turn it in to Dok in Halas"],
    wiki_title: "The Cigar",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Merchants of Halas");
  addFactionReward(questId, "Wolves of the North");
  addFactionReward(questId, "Shamen of Justice");

  const candleId = "item:everburn-candle";
  addNode({
    id: candleId,
    label: "Everburn Candle",
    type: "item",
    slots: ["Secondary"],
    resists: { cold: 5, poison: 5 },
    magic: true,
    lore: true,
    noTrade: true,
    weight: 0.5,
    size: "Small",
    source: "The Cigar reward (Dok, Halas)",
  });
  addEdge(questId, candleId, "rewards");
}

// ---------------------------------------------------------------------
// The Clothspinner Sisters (evil)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:qeynos-aqueducts";
  const karanaId = "zone:eastern-karana";
  const giverId = "npc:qeynos-aqueducts:rihtur-fullome";
  addGiver(giverId, "Rihtur Fullome", zoneId);

  const questId = "quest:the-clothspinner-sisters-evil";
  addNode({
    id: questId,
    label: "The Clothspinner Sisters (evil)",
    type: "quest",
    minLevel: 1,
    description:
      "Rihtur Fullome in the Qeynos Aqueducts sends players to kill Milea Clothspinner in Eastern Karana and return with a Monogrammed Cloth as proof, for a minor item -- Patchwork armor, Rusty weapons, or Cleric spells per the wiki, with a small chance of a Rat Shaped Ring -- plus faction. Requires Amiable faction or better.",
    steps: ["Kill Milea Clothspinner in Eastern Karana for a Monogrammed Cloth", "Return it to Rihtur Fullome in the Qeynos Aqueducts"],
    wiki_title: "The Clothspinner Sisters (evil)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, karanaId, "located_in");
  addFactionReward(questId, "Bloodsabers");
  addFactionReward(questId, "Opal Dark Briar");
  addFactionReward(questId, "Corrupt Qeynos Guards");
}

// ---------------------------------------------------------------------
// The Clothspinner Sisters (good)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-qeynos";
  const karanaId = "zone:eastern-karana";
  const giverId = "npc:north-qeynos:astaed-wemor";
  addGiver(giverId, "Astaed Wemor", zoneId);

  const questId = "quest:the-clothspinner-sisters-good";
  addNode({
    id: questId,
    label: "The Clothspinner Sisters (good)",
    type: "quest",
    minLevel: 8,
    description:
      "Astaed Wemor at the Temple of Life in North Qeynos sends players with a Tattered Note from Nerissa Clothspinner to her sister Milea Clothspinner in an Eastern Karana cave; Milea's reply, a Monogrammed Cloth, is returned to Nerissa for a decent item (unnamed on the wiki) plus faction. Requires Amiable faction or better with Milea.",
    steps: [
      "Receive a Tattered Note from Nerissa Clothspinner",
      "Deliver it to Milea Clothspinner in an Eastern Karana cave",
      "Return her reply, a Monogrammed Cloth, to Nerissa Clothspinner",
    ],
    wiki_title: "The Clothspinner Sisters (good)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, karanaId, "located_in");
  addFactionReward(questId, "Steel Warriors");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Knights of Truth");
  addFactionReward(questId, "Merchants of Qeynos");
  addFactionReward(questId, "Priests of Life");
}

// ---------------------------------------------------------------------
// The Crate (evil)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-qeynos";
  const southId = "zone:south-qeynos";
  const giverId = "npc:north-qeynos:guard-weleth";
  addGiver(giverId, "Guard Weleth", zoneId);

  const questId = "quest:the-crate-evil";
  addNode({
    id: questId,
    label: "The Crate (evil)",
    type: "quest",
    minLevel: 1,
    description:
      "Guard Weleth in North Qeynos hands over a Crate of Defective Arrows to deliver to Nesiff Tallaherd in South Qeynos; the resulting invoice is returned to Lieutenant Dagarok in North Qeynos for coin, experience, and faction. Requires Amiable faction with Qeynos Guards.",
    steps: [
      "Receive a Crate of Defective Arrows from Guard Weleth in North Qeynos",
      "Deliver it to Nesiff Tallaherd in South Qeynos",
      "Return the invoice to Lieutenant Dagarok in North Qeynos",
    ],
    wiki_title: "The Crate (evil)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, southId, "located_in");
  addFactionReward(questId, "Merchants of Qeynos");
  addFactionReward(questId, "Antonius Bayle");
  addFactionReward(questId, "Coalition of Tradefolk");
  addFactionReward(questId, "Corrupt Qeynos Guards");
  addFactionReward(questId, "Kane Bayle");
  addFactionReward(questId, "Bloodsabers");
}

// ---------------------------------------------------------------------
// The Crate (good)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-qeynos";
  const southId = "zone:south-qeynos";
  const giverId = "npc:north-qeynos:guard-weleth";
  addGiver(giverId, "Guard Weleth", zoneId);

  const questId = "quest:the-crate-good";
  addNode({
    id: questId,
    label: "The Crate (good)",
    type: "quest",
    minLevel: 1,
    description:
      "Guard Weleth in North Qeynos hands over a Crate of Defective Arrows to deliver to Nesiff Tallaherd in South Qeynos; the resulting invoice is returned to Guard Weleth for coin, experience, and faction.",
    steps: [
      "Receive a Crate of Defective Arrows from Guard Weleth in North Qeynos",
      "Deliver it to Nesiff Tallaherd in South Qeynos",
      "Return the invoice to Guard Weleth in North Qeynos",
    ],
    wiki_title: "The Crate (good)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, southId, "located_in");
  addFactionReward(questId, "Merchants of Qeynos");
  addFactionReward(questId, "Antonius Bayle");
  addFactionReward(questId, "Coalition of Tradefolk");
  addFactionReward(questId, "Guards of Qeynos");
}

// ---------------------------------------------------------------------
// The Donations
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:daedet-losaren";
  addGiver(giverId, "Daedet Losaren", zoneId);

  const questId = "quest:the-donations";
  addNode({
    id: questId,
    label: "The Donations",
    type: "quest",
    minLevel: 1,
    race: ["barbarian", "dwarf", "erudite", "half elf", "halfling", "high elf", "human", "wood elf"],
    description:
      "Daedet Losaren at the Temple of Thunder in South Qeynos collects six donations -- from Lanhern Firepride (who first needs four ogre swills), Hansl Bigroon, Kane Bayle, Enic Ruklin, Guard Leopold, and Guard Cheslin -- for usually a spell scroll, plus faction with Knights of Thunder and Priests of Life. Requires better than Indifferent faction. Good races only.",
    steps: ["Collect one donation each from Lanhern Firepride, Hansl Bigroon, Kane Bayle, Enic Ruklin, Guard Leopold, and Guard Cheslin", "Return all six to Daedet Losaren in South Qeynos"],
    wiki_title: "The Donations",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Knights of Thunder");
  addFactionReward(questId, "Priests of Life");
  addFactionReward(questId, "Guards of Qeynos");
}

// ---------------------------------------------------------------------
// The Emissary
// ---------------------------------------------------------------------
{
  const zoneId = "zone:oggok";
  const swampId = "zone:innothule-swamp";
  const giverId = "npc:oggok:marda";
  addGiver(giverId, "Marda", zoneId);

  const questId = "quest:the-emissary";
  addNode({
    id: questId,
    label: "The Emissary",
    type: "quest",
    minLevel: 5,
    description:
      "Marda in Oggok directs players to Emissary Glib at the guard tower with the phrase \"The Greenblood Shaman sent me\"; hunting troll slayers in Innothule Swamp for Frog Eye Necklaces and turning them in to Glib grants 7 silver, experience, and Oggok Citizens faction per regular necklace, or 1 silver, more faction, and a random item -- one of Forager Bag, Hopper Spear, Rusty Halberd, or Short Sword -- for a captain's necklace.",
    steps: [
      "Ask Marda in Oggok about her secret mission",
      "Find Emissary Glib at the guard tower and say \"The Greenblood Shaman sent me\"",
      "Hunt troll slayers in Innothule Swamp for Frog Eye Necklaces",
      "Turn in necklaces to Emissary Glib",
    ],
    wiki_title: "The Emissary",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, swampId, "located_in");
  addFactionReward(questId, "Oggok Citizens");

  const bagId = "item:forager-bag";
  addNode({
    id: bagId,
    label: "Forager Bag",
    type: "item",
    lore: true,
    noTrade: true,
    weight: 1.0,
    size: "Medium",
    source: "The Emissary captain's-necklace random reward (Emissary Glib, Innothule Swamp guard tower)",
  });
  addEdge(questId, bagId, "rewards", { randomGroup: "the-emissary-captains-necklace" });

  const spearId = "item:hopper-spear";
  addNode({
    id: spearId,
    label: "Hopper Spear",
    type: "item",
    slots: ["Primary"],
    classes: ["warrior", "ranger", "shadow knight", "bard", "rogue", "shaman"],
    race: ["barbarian", "dark elf", "dwarf", "erudite", "gnome", "half elf", "halfling", "iksar", "ogre", "troll", "wood elf"],
    skill: "Piercing",
    damage: 5,
    delay: 31,
    stats: { str: 4 },
    magic: true,
    lore: true,
    weight: 5.0,
    size: "Medium",
    source: "The Emissary captain's-necklace random reward (Emissary Glib, Innothule Swamp guard tower)",
  });
  addEdge(questId, spearId, "rewards", { randomGroup: "the-emissary-captains-necklace" });

  const halberdId = "item:rusty-halberd";
  addNode({
    id: halberdId,
    label: "Rusty Halberd",
    type: "item",
    slots: ["Primary"],
    classes: ["warrior", "paladin", "ranger", "shadow knight"],
    skill: "2H Slashing",
    damage: 10,
    delay: 56,
    weight: 14.0,
    size: "Giant",
    source: "The Emissary captain's-necklace random reward (Emissary Glib, Innothule Swamp guard tower)",
  });
  addEdge(questId, halberdId, "rewards", { randomGroup: "the-emissary-captains-necklace" });

  const shortSwordId = "item:short-sword";
  addNode({
    id: shortSwordId,
    label: "Short Sword",
    type: "item",
    slots: ["Primary", "Secondary"],
    skill: "1H Slashing",
    damage: 3,
    delay: 19,
    weight: 1.5,
    size: "Small",
    source: "The Emissary captain's-necklace random reward (Emissary Glib, Innothule Swamp guard tower)",
  });
  addEdge(questId, shortSwordId, "rewards", { randomGroup: "the-emissary-captains-necklace" });

  addEdge("quest:mardas-secret-mission", questId, "requires");
}

// ---------------------------------------------------------------------
// The Etched Stone / The Etched Stone (Spell: Life Leech) -- one quest,
// two eqlwiki.com pages describing the identical turn-in chain.
// ---------------------------------------------------------------------
{
  const zoneId = "zone:rathe-mountains";
  const gukId = "zone:lower-guk";
  const nagafenId = "zone:nagafen-s-lair";
  const giverId = "npc:rathe-mountains:kazzel-dleryt";
  addGiver(giverId, "Kazzel D`Leryt", zoneId);

  const questId = "quest:the-etched-stone";
  addNode({
    id: questId,
    label: "The Etched Stone",
    type: "quest",
    classes: ["shadow knight"],
    minLevel: 46,
    description:
      "Kazzel D`Leryt in Rathe Mountains assembles a White Gold Necklace (froglok noble, Lower Guk), a Crystalline Orb (stone spider, Nagafen's Lair), a Bloodied Piece of Parchment (traded from a Prickly Pear to Xenyari Lisariel), and a Faceted Hyacinth (2,000pp to Kazzel plus 1,000pp to Darfumpel Zirubbel) into a Faceted Hyacinth Telesm, given to Xenyari Lisariel; her death transforms it into a Pulsating Hyacinth Telesm, which Kazzel then trades for Spell: Life Leech after players defeat the level 53 monstrous zombie it spawns and loot its Monstrous Zombie Heart. The Pulsating Hyacinth Telesm itself is also kept as a reward.",
    steps: [
      "Gather a White Gold Necklace, Crystalline Orb, Bloodied Piece of Parchment, and Faceted Hyacinth",
      "Turn in all four to Kazzel D`Leryt for a Faceted Hyacinth Telesm",
      "Give it to Xenyari Lisariel, who dies and transforms it into a Pulsating Hyacinth Telesm",
      "Return the Pulsating Hyacinth Telesm to Kazzel D`Leryt",
      "Defeat the monstrous zombie that spawns and loot the Monstrous Zombie Heart",
      "Turn in the heart to Kazzel D`Leryt for Spell: Life Leech",
    ],
    wiki_title: "The Etched Stone",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, gukId, "located_in");
  addEdge(questId, nagafenId, "located_in");

  const telesmId = "item:pulsating-hyacinth-telesm";
  addNode({
    id: telesmId,
    label: "Pulsating Hyacinth Telesm",
    type: "item",
    slots: ["Neck"],
    classes: ["shadow knight", "necromancer"],
    stats: { int: 7, agi: 7 },
    magic: true,
    lore: true,
    noTrade: true,
    weight: 0.3,
    size: "Small",
    source: "The Etched Stone reward (Kazzel D`Leryt, Rathe Mountains)",
  });
  addEdge(questId, telesmId, "rewards");
  addEdge(questId, "spell:life-leech", "rewards");
}

// ---------------------------------------------------------------------
// The Falchion
// ---------------------------------------------------------------------
{
  const zoneId = "zone:northern-felwithe";
  const crushboneId = "zone:crushbone";
  const oceanId = "zone:ocean-of-tears";
  const giverId = "npc:northern-felwithe:general-jyleel";
  addGiver(giverId, "General Jyleel", zoneId);

  const questId = "quest:the-falchion";
  addNode({
    id: questId,
    label: "The Falchion",
    type: "quest",
    classes: ["paladin"],
    minLevel: 22,
    description:
      "General Jyleel in Northern Felwithe trades the Black Heart of Ambassador Dvinn (Crushbone), a Blue Orc Head (Orc Prophet, Crushbone), and a Large Locked Crate (Brawn, Ocean of Tears) for the Falchion of the Koada'Vie. Requires Kindly faction or better.",
    steps: [
      "Kill Ambassador Dvinn in Crushbone for the Black Heart of Ambassador Dvinn",
      "Kill the Orc Prophet in Crushbone for a Blue Orc Head",
      "Kill Brawn in Ocean of Tears for a Large Locked Crate",
      "Turn in all three to General Jyleel in Northern Felwithe",
    ],
    wiki_title: "The Falchion",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, crushboneId, "located_in");
  addEdge(questId, oceanId, "located_in");
  addFactionReward(questId, "Clerics of Tunare");
  addFactionReward(questId, "King Tearis Thex");
  addFactionReward(questId, "Anti-Mage");

  const falchionId = "item:falchion-of-the-koadavie";
  addNode({
    id: falchionId,
    label: "Falchion of the Koada'Vie",
    type: "item",
    slots: ["Primary"],
    classes: ["paladin"],
    skill: "1H Slashing",
    damage: 6,
    delay: 24,
    magic: true,
    lore: true,
    noTrade: true,
    weight: 3.5,
    size: "Medium",
    source: "The Falchion reward (General Jyleel, Northern Felwithe)",
  });
  addEdge(questId, falchionId, "rewards");
}

// ---------------------------------------------------------------------
// The Family Chest Straps
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const kedgeId = "zone:kedge-keep";
  const giverId = "npc:kael-drakkal:bjoskhua-blackfist";
  addGiver(giverId, "Bjoskhua Blackfist", zoneId);

  const questId = "quest:the-family-chest-straps";
  addNode({
    id: questId,
    label: "The Family Chest Straps",
    type: "quest",
    classes: ["cleric", "druid", "enchanter", "magician", "necromancer", "shaman", "wizard"],
    minLevel: 50,
    era: "Velious",
    description:
      "Bjoskhua Blackfist in Kael Drakkel trades the backbone of Phinigel Autropos (Kedge Keep) for the Flayed Coldain-Skin Leggings. Velious Era content, currently out of era.",
    steps: ["Kill Phinigel Autropos in Kedge Keep for his backbone", "Turn it in to Bjoskhua Blackfist in Kael Drakkel"],
    wiki_title: "The Family Chest Straps",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, kedgeId, "located_in");

  const leggingsId = "item:flayed-coldain-skin-leggings";
  addNode({
    id: leggingsId,
    label: "Flayed Coldain-Skin Leggings",
    type: "item",
    slots: ["Legs"],
    classes: ["cleric", "druid", "enchanter", "magician", "necromancer", "shaman", "wizard"],
    ac: 5,
    stats: { int: 3, agi: -10 },
    hp: 15,
    magic: true,
    source: "The Family Chest Straps reward (Bjoskhua Blackfist, Kael Drakkel)",
  });
  addEdge(questId, leggingsId, "rewards");
}

// ---------------------------------------------------------------------
// The Fiery Avenger
// ---------------------------------------------------------------------
{
  const zoneId = "zone:plane-of-sky";
  const giverId = "npc:plane-of-sky:inte-akera";
  addGiver(giverId, "Inte Akera", zoneId);

  const questId = "quest:the-fiery-avenger";
  addNode({
    id: questId,
    label: "The Fiery Avenger",
    type: "quest",
    classes: ["paladin"],
    minLevel: 46,
    description:
      "Inte Akera in the Plane of Sky trades SoulFire alone for the Blessing of Nobility, Ghoulbane alone for the Blessing of Sacrifice, then Miragul's Head and Miragul's Robe together with both blessings for the Fiery Avenger. Requires Warmly or higher Deepwater Knights faction.",
    steps: [
      "Turn in SoulFire alone for the Blessing of Nobility",
      "Turn in Ghoulbane alone for the Blessing of Sacrifice",
      "Turn in Miragul's Head, Miragul's Robe, and both blessings together to Inte Akera",
    ],
    wiki_title: "The Fiery Avenger",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Deepwater Knights");

  const avengerId = "item:fiery-avenger";
  addNode({
    id: avengerId,
    label: "Fiery Avenger",
    type: "item",
    slots: ["Primary"],
    classes: ["paladin"],
    skill: "2H Slashing",
    damage: 33,
    delay: 44,
    stats: { str: 15, cha: 10, wis: 15 },
    hp: 25,
    mana: 25,
    resists: { fire: 5, disease: 5, cold: 5, magic: 5, poison: 5 },
    magic: true,
    lore: true,
    noTrade: true,
    weight: 0.1,
    size: "Large",
    effect: "Flame Shock (Combat, instant cast) at Level 45",
    source: "The Fiery Avenger reward (Inte Akera, Plane of Sky)",
  });
  addEdge(questId, avengerId, "rewards");
}

// ---------------------------------------------------------------------
// The First Arcane Test -- DEFERRED, new discovery: Gozzrem in the Temple
// of Veeshan runs a Dozekar-the-Cursed tear-turn-in mechanic matching the
// Dozekar Tear Quests cluster's shape, and his own line ("If this task is
// not hard enough for you, I have a second quest for you") confirms it
// chains into The Second Arcane Test as an ordered pair. Not modeled here
// -- tracked as a new Questlines-section entry instead.
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// The Fisherman
// ---------------------------------------------------------------------
{
  const zoneId = "zone:paineel";
  const toxxuliaId = "zone:toxxulia-forest";
  const giverId = "npc:paineel:antus-shelbra";
  addGiver(giverId, "Antus Shelbra", zoneId);

  const questId = "quest:the-fisherman";
  addNode({
    id: questId,
    label: "The Fisherman",
    type: "quest",
    classes: ["necromancer"],
    minLevel: 8,
    description: "Antus Shelbra in Paineel sends players to slay Aglthin Dasmore in Toxxulia Forest and return his fishing pole as proof, for the Staff of the Abattoir Initiate.",
    steps: ["Kill Aglthin Dasmore in Toxxulia Forest for his fishing pole", "Turn it in to Antus Shelbra in Paineel"],
    wiki_title: "The Fisherman",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, toxxuliaId, "located_in");
  addFactionReward(questId, "Heretics");

  const staffId = "item:staff-of-the-abattoir-initiate";
  addNode({
    id: staffId,
    label: "Staff of the Abattoir Initiate",
    type: "item",
    slots: ["Primary"],
    classes: ["necromancer"],
    race: ["erudite"],
    skill: "2H Blunt",
    damage: 6,
    delay: 32,
    stats: { int: 1 },
    lore: true,
    noTrade: true,
    weight: 7.0,
    size: "Medium",
    source: "The Fisherman reward (Antus Shelbra, Paineel)",
  });
  addEdge(questId, staffId, "rewards");
}

// ---------------------------------------------------------------------
// The Fishslayers
// ---------------------------------------------------------------------
{
  const zoneId = "zone:rivervale";
  const giverId = "npc:rivervale:marshal-lanena";
  addGiver(giverId, "Marshal Lanena", zoneId);

  const questId = "quest:the-fishslayers";
  addNode({
    id: questId,
    label: "The Fishslayers",
    type: "quest",
    classes: ["druid", "paladin", "rogue", "warrior"],
    minLevel: 4,
    description:
      "Marshal Lanena in Rivervale has players kill piranha in the lake for Piranha Teeth, combining 4 in a provided bag, for the Rantho Rapier.",
    steps: ["Kill piranha in the Rivervale lake for Piranha Teeth", "Combine 4 teeth in the provided bag", "Turn it in to Marshal Lanena in Rivervale"],
    wiki_title: "The Fishslayers",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Guardians of the Vale");
  addFactionReward(questId, "Mayor Gubbin");
  addFactionReward(questId, "Storm Reapers");
  addFactionReward(questId, "Merchants of Rivervale");

  const rapierId = "item:rantho-rapier";
  addNode({
    id: rapierId,
    label: "Rantho Rapier",
    type: "item",
    slots: ["Primary", "Secondary"],
    classes: ["warrior", "paladin", "rogue"],
    race: ["dwarf", "halfling", "gnome"],
    skill: "2H Slashing",
    damage: 4,
    delay: 24,
    weight: 4.0,
    size: "Medium",
    source: "The Fishslayers reward (Marshal Lanena, Rivervale)",
  });
  addEdge(questId, rapierId, "rewards");
}

// ---------------------------------------------------------------------
// The Four Fragments
// ---------------------------------------------------------------------
{
  const zoneId = "zone:great-divide";
  const iceclad = "zone:iceclad-ocean";
  const giverId = "npc:great-divide:windscribe-thaloria";
  addGiver(giverId, "Windscribe Thaloria", zoneId);

  const questId = "quest:the-four-fragments";
  addNode({
    id: questId,
    label: "The Four Fragments",
    type: "quest",
    minLevel: 1,
    description:
      "Windscribe Thaloria in Great Divide sends players to kill mobs across the four floors of the Tower of Frozen Shadow (Iceclad Ocean) for four Forgotten Pages, traded for Chapter III, When Stars Forget Their Light and a Holiday Gift -- both unnamed lore rewards with no stats on the wiki.",
    steps: ["Kill mobs on floors 1-4 of the Tower of Frozen Shadow for 4 Forgotten Pages", "Turn them in to Windscribe Thaloria in Great Divide"],
    wiki_title: "The Four Fragments",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, iceclad, "located_in");
}

// ---------------------------------------------------------------------
// The Four Idols
// ---------------------------------------------------------------------
{
  const zoneId = "zone:plane-of-growth";
  const kaelId = "zone:kael-drakkal";
  const giverId = "npc:plane-of-growth:guardian-of-takish";
  addGiver(giverId, "Guardian of Takish", zoneId);

  const questId = "quest:the-four-idols";
  addNode({
    id: questId,
    label: "The Four Idols",
    type: "quest",
    classes: ["cleric"],
    minLevel: 55,
    era: "Velious",
    description:
      "Guardian of Takish in the Plane of Growth trades an Idol of Corruption (Gkrean Prophet of Tallon), Idol of Decay (a cleric of Vallon/Tallon Zek), Idol of Disease (Semkak Prophet of Vallon), and Idol of Erosion (a priest of Tallon/Vallon Zek) -- all dropped by giants in the Kael Drakkel arena -- for the Symbol of Tunarian Worship. Velious Era content, currently out of era.",
    steps: ["Kill giants in the Kael Drakkel arena for the Idol of Corruption, Idol of Decay, Idol of Disease, and Idol of Erosion", "Turn in all four to Guardian of Takish in the Plane of Growth"],
    wiki_title: "The Four Idols",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, kaelId, "located_in");

  const symbolId = "item:symbol-of-tunarian-worship";
  addNode({
    id: symbolId,
    label: "Symbol of Tunarian Worship",
    type: "item",
    slots: ["Wrist"],
    classes: ["cleric"],
    race: ["high elf"],
    deity: ["Tunare"],
    ac: 15,
    stats: { str: 5, wis: 10 },
    mana: 50,
    resists: { disease: 10, magic: 10, poison: 10 },
    magic: true,
    lore: true,
    noTrade: true,
    weight: 3.0,
    size: "Small",
    source: "The Four Idols reward (Guardian of Takish, Plane of Growth)",
  });
  addEdge(questId, symbolId, "rewards");
}

// ---------------------------------------------------------------------
// The Frikniller Family
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-freeport";
  const northId = "zone:north-freeport";
  const giverId = "npc:east-freeport:gren-frikniller";
  addGiver(giverId, "Gren Frikniller", zoneId);

  const questId = "quest:the-frikniller-family";
  addNode({
    id: questId,
    label: "The Frikniller Family",
    type: "quest",
    minLevel: 1,
    description: "Gren Frikniller in East Freeport sends a letter to his sister Falia in North Freeport, whose reply -- a Broken Heirloom Necklace -- is returned to Gren for coin, experience, and faction.",
    steps: ["Deliver Gren's letter to Falia Frikniller in North Freeport", "Return her reply, a Broken Heirloom Necklace, to Gren in East Freeport"],
    wiki_title: "The Frikniller Family",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, northId, "located_in");
  addFactionReward(questId, "Coalition of Tradefolk Underground");
  addFactionReward(questId, "Coalition of Tradefolk");
  addFactionReward(questId, "Carson McCabe");
  addFactionReward(questId, "Corrupt Qeynos Guards");
  addFactionReward(questId, "The Freeport Militia");
}

// ---------------------------------------------------------------------
// The Geologist's Purloined Tools
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const giverId = "npc:erudin:gans-paust";
  addGiver(giverId, "Gans Paust", zoneId);

  const questId = "quest:the-geologists-purloined-tools";
  addNode({
    id: questId,
    label: "The Geologist's Purloined Tools",
    type: "quest",
    classes: ["cleric", "paladin"],
    race: ["erudite"],
    minLevel: 18,
    description:
      "Gans Paust in Erudin sends a note to Yelesom Paust in Erud's Crossing; recovering a Magnifying Glass, Geologist's Hammer, and Incomplete Tool Kit and combining them into Yelesom's Tools, then returning with Yelesom's Reports, earns the Midnight Sea Mail Sleeves.",
    steps: [
      "Deliver Gans Paust's note to Yelesom Paust in Erud's Crossing",
      "Recover a Magnifying Glass, Geologist's Hammer, and Incomplete Tool Kit",
      "Combine them into Yelesom's Tools and return them",
      "Bring Yelesom's Reports back to Gans Paust in Erudin",
    ],
    wiki_title: "The Geologist's Purloined Tools",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Deepwater Knights");
  addFactionReward(questId, "High Council of Erudin");

  const sleevesId = "item:midnight-sea-mail-sleeves";
  addNode({
    id: sleevesId,
    label: "Midnight Sea Mail Sleeves",
    type: "item",
    slots: ["Arms"],
    classes: ["cleric", "paladin"],
    race: ["erudite"],
    ac: 8,
    stats: { sta: 1 },
    mana: 20,
    resists: { cold: 3, magic: 3 },
    magic: true,
    lore: true,
    noTrade: true,
    weight: 3.4,
    size: "Tiny",
    source: "The Geologist's Purloined Tools reward (Gans Paust, Erudin)",
  });
  addEdge(questId, sleevesId, "rewards");
}

// ---------------------------------------------------------------------
// The Gift Box
// ---------------------------------------------------------------------
{
  const zoneId = "zone:plane-of-mischief";
  const giverId = "npc:plane-of-mischief:peachy-dvicci";
  addGiver(giverId, "Peachy D`Vicci", zoneId);

  const questId = "quest:the-gift-box";
  addNode({
    id: questId,
    label: "The Gift Box",
    type: "quest",
    minLevel: 55,
    description:
      "Peachy D`Vicci in the Plane of Mischief trades two unstacked Funny Money items (not multiquestable) for a colored Gift Box -- 5 charges, an \"Open [Color] Box\" effect that summons a class-specific doll -- or occasionally a Frostmaidens Idol.",
    steps: ["Gather two Funny Money items, given unstacked", "Turn them in to Peachy D`Vicci in the Plane of Mischief"],
    wiki_title: "The Gift Box",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const boxId = "item:gift-box";
  addNode({
    id: boxId,
    label: "Gift Box",
    type: "item",
    charges: 5,
    magic: true,
    effect: "Open [Color] Box (summons a class-specific doll) at Level 45",
    source: "The Gift Box reward (Peachy D`Vicci, Plane of Mischief); color is cosmetic, same item/effect across all 8 colors",
  });
  addEdge(questId, boxId, "rewards", { randomGroup: "the-gift-box" });

  const idolId = "item:frostmaidens-idol";
  addNode({
    id: idolId,
    label: "Frostmaidens Idol",
    type: "item",
    slots: ["Primary", "Secondary"],
    classes: ["wizard"],
    mana: 80,
    resists: { cold: 25 },
    magic: true,
    charges: 6,
    effect: "Lure of Frost (Must Equip, 12.0 sec cast)",
    source: "The Gift Box occasional random reward (Peachy D`Vicci, Plane of Mischief)",
  });
  addEdge(questId, idolId, "rewards", { randomGroup: "the-gift-box" });
}

save();
