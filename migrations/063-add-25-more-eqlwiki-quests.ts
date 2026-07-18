/**
 * Migration 063: 25 more quests off GitHub issue #26's checklist -- the
 * "Burynai Bundt Cake" through "Crest of the Wood Nymphs Quest" run.
 * Researched directly against eqlwiki.com, following
 * decisions/eqlwiki-quest-research-method.md. Uses the shared migrations/_lib.ts
 * helpers instead of a copy-pasted local copy (new convention as of the
 * "Add shared migration helper module" commit).
 *
 * Not modeled as a quest node:
 * - Burynai Bundt Cake -- the wiki page itself states "It has been confirmed
 *   that this is not a quest at this time, but is simply a storyline," with
 *   reward "None." No real quest entity to add, same treatment as migration
 *   062's "All Positive Faction Quests" index page. Checked off regardless.
 * - Class Race Quest List -- not a quest, the wiki's own cross-class index
 *   page ("A listing of quests by class or deity"). Checked off, no node.
 *
 * `quest_group` (decisions/quest-group-node-type.md) for genuine sibling
 * armor-piece sets, same shape as migration 062's Bard armor quests:
 * - Cleric Kael Armor Quests, Cleric Skyshrine Armor Quests, Cleric
 *   Thurgadin Armor Quests (7 independent piece turn-ins each)
 * - Cleric Plane of Sky Tests (6 independent tests, 2 givers x 3 each --
 *   same "sibling set sharing one page, no ordering" shape as an armor
 *   quest group, just gated by trade-in items instead of gems)
 *
 * Compressed to one quest node because eqlwiki.com itself presents multiple
 * turn-in variants as one repeatable mechanic rather than naming every
 * variant as its own page (same treatment as migration 062's Bone Chips /
 * Bread Shipment Quests):
 * - Coldain Books of Tactics (multiple book types, each with its own fixed
 *   reward -- unlike Bone Chips/Bread Shipment, the rewards here are named
 *   and fixed, so all four are modeled as `rewards` edges on one quest)
 *
 * Deferred to the `## Quest Groups` section of GitHub issue #26 instead of
 * modeled here (per the issue's own guardrail -- a standalone checklist
 * entry that turns out to be multi-part gets deferred, not modeled, and
 * doesn't count against the 25-standalone cap):
 * - Coldain Prayer Shawl Quests -- a real ordered progression (each of the
 *   7 shawl tiers requires finishing the previous one first, multiple
 *   tradeskills up to skill 208), not a sibling set. Same "real questline"
 *   shape as Plane of Sky Keys (decisions/quest-prerequisite-requires-edge.md),
 *   deserving its own dedicated research pass.
 * - Coldain Ring Quests -- the 10-ring Coldain Ring War progression's own
 *   index/strategy-guide page. Ring 10 (the final stage) is already modeled
 *   standalone as `quest:10th-coldain-ring-quest` (migration 062); rings 1-9
 *   are not yet modeled and are a real ordered chain, not a sibling set.
 * - Crafted Armor Quests -- an 8-piece Warrior armor set split across two
 *   givers (Shakrn Meadowgreen: Vambraces/Boots/Gauntlets/Helmet; Ulan
 *   Meadowgreen: Pauldron/Greaves/Bracer/Breastplate), the same two-giver
 *   split shape as Ivy Etched Armor Quests, already deferred in migration 062.
 *
 * Deliberately NOT modeled (consistent with every migration so far):
 * - Negative faction changes throughout (decisions/quest-reward-modeling.md
 *   only models positive rewards): Clurg's Revenge's Dark Bargainers loss,
 *   Coldain Skulls' Coldain/Claws of Veeshan loss, Corrupt Guards' Dismal
 *   Rage/Freeport Militia loss, Crest of the Drixie's Claws of
 *   Veeshan/Yelinak loss.
 * - Coin rewards throughout -- no coin field on `quest` nodes (Corrupt
 *   Guards (Paladin Version)'s 1-3pp, Cleric Supplies' 13s23c).
 * - Random/unnamed rewards left prose-only rather than picked arbitrarily:
 *   Cleric Supplies' and Corrupt Guards (Cleric version)'s "random low-level
 *   cleric spell scroll," Coldain Skulls' "random piece of Giant Scalemail
 *   Armor" (no fixed item named for either).
 * - Cabilis Pale Ale (Firiona Vie)'s reward -- the wiki explicitly flags it
 *   "UNKNOWN! Please correct." Still gets a quest node (real, given-in-game
 *   quest hook with a giver/steps), same treatment as migration 062's Blood
 *   Ink, just no `rewards` edges.
 *
 * New zone stub added (giver's zone missing from the graph, per the issue's
 * zone-creation guardrail, bare node same as migration 062's Dreadlands):
 * Plane of Sky (Cleric Plane of Sky Tests).
 *
 * New spell nodes: McMerin's Feast (Cannibalize II (Evil)'s reward), and
 * Heroic Bond / Sunskin / Unswerving Hammer (of Faith) / Word of Vigor
 * (Cleric Spells (Evil) and Cleric Spells (Good) share the same four-spell
 * reward pool -- both quests trade a duplicate scroll of Death Pact,
 * Reckoning, Upheaval, or Yaulp IV for a random one of these four; modeled
 * as `rewards` edges to all four on both quest nodes, same "real choice
 * set, not an arbitrary pick" treatment as migration 062's Bladed Weapons).
 * `spell:upheaval` already existed (migration 011) and is only referenced
 * in prose as a turn-in item, not a new node.
 *
 * Reused existing nodes: `item:a-crude-stein` and `item:ogre-war-maul`
 * (Clurg's Revenge's reward pool overlaps with the already-modeled Crude
 * Stein Quest and an existing ogre weapon item).
 *
 * `requires` edges (decisions/quest-prerequisite-requires-edge.md) added
 * from the pre-existing `quest:friend-of-the-tunarean-court` (migration
 * unknown -- already in the graph) to all six Crest quests it names as
 * still-open sub-quests in its own description; that description is now
 * stale (all six are modeled) but is left as-is since it still accurately
 * describes the quest's own mechanic.
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, slug, addFactionReward, addGiver, save } = loadGraph(import.meta.dir);

// ---------------------------------------------------------------------
// New zone stub
// ---------------------------------------------------------------------
const planeOfSkyId = "zone:plane-of-sky";
addNode({ id: planeOfSkyId, label: "Plane of Sky", type: "zone" });

// ---------------------------------------------------------------------
// Burynai Bundt Cake -- not a real quest, wiki confirms "simply a storyline"
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// Cabilis Pale Ale (Firiona Vie)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:firiona-vie";
  const giverId = "npc:firiona-vie:lenka-stoutheart";
  addGiver(giverId, "Lenka Stoutheart", zoneId);

  const questId = "quest:cabilis-pale-ale-firiona-vie";
  addNode({
    id: questId,
    label: "Cabilis Pale Ale (Firiona Vie)",
    type: "quest",
    description: "Lenka Stoutheart in Firiona Vie discusses Cabilis Pale Ale (purchasable from vendors in Field of Bones, Cabilis, and Neriak) with Bronto Thudfoot, but giving the ale to either NPC yields no confirmed reward -- the wiki flags this quest's reward as unknown and marks it out of era.",
    minLevel: 1,
    steps: [
      "Buy a Cabilis Pale Ale from a vendor in Field of Bones, Cabilis, or Neriak",
      "Speak with Lenka Stoutheart and Bronto Thudfoot in Firiona Vie about the ale",
    ],
    wiki_title: "Cabilis Pale Ale (Firiona Vie)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Cannibalize II (Evil)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:timorous-deep";
  const giverId = "npc:timorous-deep:the-great-oowomp";
  addGiver(giverId, "The Great Oowomp", zoneId);

  const questId = "quest:cannibalize-ii-evil";
  addNode({
    id: questId,
    label: "Cannibalize II (Evil)",
    type: "quest",
    classes: ["shaman"],
    description: "The Great Oowomp in Timorous Deep trades four items for a McMerin's Feast spell scroll: Strange Ochre Clay (army behemoth, City of Mist), Crushed Diamonds (ground spawn in Timorous Deep, or via a gem cutter skeleton trade), Yun Shaman Powder (froglok yun shaman, Trakanon's Teeth), and Greyish Bone Chips (skeletal warlord, Karnor's Castle). Shaman only.",
    minLevel: 40,
    steps: [
      "Obtain Strange Ochre Clay from an army behemoth in City of Mist",
      "Obtain Crushed Diamonds as a ground spawn in Timorous Deep, or via a gem cutter skeleton trade",
      "Obtain Yun Shaman Powder from a froglok yun shaman in Trakanon's Teeth",
      "Obtain Greyish Bone Chips from a skeletal warlord in Karnor's Castle",
      "Return all 4 items to The Great Oowomp for the spell scroll",
    ],
    wiki_title: "Cannibalize II (Evil)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:city-of-mist", "located_in");
  addEdge(questId, "zone:trakanons-teeth", "located_in");
  addEdge(questId, "zone:karnors-castle", "located_in");

  const spellId = "spell:mcmerins-feast";
  addNode({
    id: spellId,
    label: "McMerin's Feast",
    type: "spell",
    class_levels: { shaman: 40 },
    wiki_title: "McMerin's Feast",
  });
  addEdge(questId, spellId, "rewards");
}

// ---------------------------------------------------------------------
// Class Race Quest List -- not a real quest, wiki's own cross-class index page
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// Cleaner Clockwork
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-kaladim";
  const giverId = "npc:south-kaladim:beno-targnarle";
  addGiver(giverId, "Beno Targnarle", zoneId);

  const questId = "quest:cleaner-clockwork";
  addNode({
    id: questId,
    label: "Cleaner Clockwork",
    type: "quest",
    description: "Beno Targnarle, in the north turret of the Kaladim Warrior's Guild in South Kaladim, sends the player after Scrap Metal from Cleaner VII, a clockwork rat spawning in the mines beneath North Kaladim's bank. Amiable faction or better required. All classes.",
    minLevel: 4,
    steps: [
      "Speak with Beno Targnarle in the north turret of the Kaladim Warrior's Guild",
      "Defeat Cleaner VII, a clockwork rat in the mines beneath North Kaladim's bank, for Scrap Metal",
      "Return the Scrap Metal to Beno Targnarle",
    ],
    wiki_title: "Cleaner Clockwork",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:north-kaladim", "located_in");
  addFactionReward(questId, "Storm Guard");
  addFactionReward(questId, "Kazon Stormhammer");
  addFactionReward(questId, "Miners Guild 249");
  addFactionReward(questId, "Merchants of Kaladim");

  const cardId = "item:knight-card";
  addNode({
    id: cardId,
    label: "Knight Card",
    type: "item",
    magic: true,
    weight: 0.1,
    size: "Medium",
    source: "Cleaner Clockwork reward (Beno Targnarle, South Kaladim)",
  });
  addEdge(questId, cardId, "rewards");
}

// ---------------------------------------------------------------------
// Clear Water Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const giverId = "npc:erudin:agryn-moonfield";
  addGiver(giverId, "Agryn Moonfield", zoneId);
  const leraenaId = "npc:erudin:leraena-shelyrak";
  addGiver(leraenaId, "Leraena Shelyrak", zoneId);

  const questId = "quest:clear-water-quest";
  addNode({
    id: questId,
    label: "Clear Water Quest",
    type: "quest",
    description: "Agryn Moonfield, at the Bank of Erudin, sends the player to Leraena Shelyrak at the Temple of Divine Light in Erudin for a Peacekeeper Token; returning it to Agryn Moonfield yields Clear Water. All classes.",
    minLevel: 1,
    steps: [
      "Hail Agryn Moonfield at the Bank of Erudin",
      "Visit Leraena Shelyrak at the Temple of Divine Light in Erudin for a Peacekeeper Token",
      "Return the Peacekeeper Token to Agryn Moonfield",
    ],
    wiki_title: "Clear Water Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const waterId = "item:clear-water";
  addNode({
    id: waterId,
    label: "Clear Water",
    type: "item",
    source: "Clear Water Quest reward (Agryn Moonfield, Erudin)",
  });
  addEdge(questId, waterId, "rewards");
}

// ---------------------------------------------------------------------
// Cleric Kael Armor Quests (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const giverId = "npc:kael-drakkal:vylleam-vyaeltor";
  addGiver(giverId, "Vylleam Vyaeltor", zoneId);

  const groupId = "quest_group:cleric-kael-armor-quests";
  addNode({
    id: groupId,
    label: "Cleric Kael Armor Quests",
    type: "quest_group",
    description: "Vylleam Vyaeltor, in the room behind King Tormax's throne room in Kael Drakkal, trades an Ancient Tarnished armor piece plus 3 matching gems for its corresponding piece of Templar armor. Seven independent sub-quests, no ordering between them. Ally faction required for all Kael armor quests.",
    classes: ["cleric"],
    wiki_title: "Cleric Kael Armor Quests",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const pieces: Array<{ label: string; base: string; gem: string; reward: string }> = [
    { label: "Helm", base: "Ancient Tarnished Plate Helmet", gem: "3 Crushed Onyx Sapphires", reward: "Templar's Crown" },
    { label: "Chestplate", base: "Ancient Tarnished Breastplate", gem: "3 Black Marbles", reward: "Templar's Chestplate" },
    { label: "Vambraces", base: "Ancient Tarnished Vambraces", gem: "3 Jaundice Gems", reward: "Templar's Vambraces" },
    { label: "Bracer", base: "Ancient Tarnished Plate Bracelet", gem: "3 Crushed Opals", reward: "Templar's Bracer" },
    { label: "Gauntlets", base: "Ancient Tarnished Plate Gauntlets", gem: "3 Crushed Lava Rubies", reward: "Templar's Gauntlets" },
    { label: "Greaves", base: "Ancient Tarnished Greaves", gem: "3 Chipped Onyx Sapphires", reward: "Templar's Leggings" },
    { label: "Boots", base: "Ancient Tarnished Plate Boots", gem: "3 Crushed Flame Emeralds", reward: "Templar's Boots" },
  ];
  for (const piece of pieces) {
    const questId = `quest:cleric-kael-armor-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `Cleric Kael Armor Quests: ${piece.label}`,
      type: "quest",
      classes: ["cleric"],
      description: `Trade a ${piece.base} plus ${piece.gem} to Vylleam Vyaeltor in Kael Drakkal for the ${piece.reward}.`,
      steps: [`Gather a ${piece.base} and ${piece.gem}`, "Turn them in to Vylleam Vyaeltor in Kael Drakkal"],
      wiki_title: "Cleric Kael Armor Quests",
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
      classes: ["cleric"],
      source: `Cleric Kael Armor Quests: ${piece.label} reward (Vylleam Vyaeltor, Kael Drakkal)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// ---------------------------------------------------------------------
// Cleric Plane of Sky Tests (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = planeOfSkyId;
  const alanId = "npc:plane-of-sky:alan-harten";
  addGiver(alanId, "Alan Harten", zoneId);
  const dericId = "npc:plane-of-sky:deric-lennox";
  addGiver(dericId, "Deric Lennox", zoneId);

  const groupId = "quest_group:cleric-plane-of-sky-tests";
  addNode({
    id: groupId,
    label: "Cleric Plane of Sky Tests",
    type: "quest_group",
    description: "Six independent Cleric tests in the Plane of Sky, three offered by Alan Harten and three by Deric Lennox, each trading a specific set of turn-in items for its own named reward. No ordering between them.",
    classes: ["cleric"],
    wiki_title: "Cleric Plane of Sky Tests",
  });
  addEdge(alanId, groupId, "starts");
  addEdge(dericId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const tests: Array<{ label: string; giverId: string; giverLabel: string; items: string; reward: string }> = [
    { label: "Test of Courage", giverId: alanId, giverLabel: "Alan Harten", items: "an ochre tessera, a sky emerald, and a silver hoop", reward: "Truewind Earring" },
    { label: "Test of Skill", giverId: alanId, giverLabel: "Alan Harten", items: "a golden disc, a piece of dark wood, and a small shield", reward: "Aegis of the Wind" },
    { label: "Test of Protection", giverId: alanId, giverLabel: "Alan Harten", items: "an adumbrate globe, a glowing diamond, and some shiny pauldrons", reward: "Pauldrons of Piety" },
    { label: "Test of Resolution", giverId: dericId, giverLabel: "Deric Lennox", items: "a spiroc statuette, a spiroc healing totem, and a silvered spiroc necklace", reward: "Necklace of Resolution" },
    { label: "Test of Theurgy", giverId: dericId, giverLabel: "Deric Lennox", items: "an efreeti mace, a saffron spiroc feather, a glowing sapphire, and djinni aura", reward: "Theurgist's Star" },
    { label: "Test of The Weak", giverId: dericId, giverLabel: "Deric Lennox", items: "an efreeti standard, manna nectar, mithril bands, and a shimmering topaz", reward: "Truwian Baton" },
  ];
  for (const test of tests) {
    const questId = `quest:cleric-plane-of-sky-${slug(test.label)}`;
    addNode({
      id: questId,
      label: `Cleric Plane of Sky Tests: ${test.label}`,
      type: "quest",
      classes: ["cleric"],
      description: `Bring ${test.items} to ${test.giverLabel} in the Plane of Sky for the ${test.reward}.`,
      steps: [`Gather ${test.items}`, `Turn them in to ${test.giverLabel} in the Plane of Sky`],
      wiki_title: "Cleric Plane of Sky Tests",
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
      classes: ["cleric"],
      source: `Cleric Plane of Sky Tests: ${test.label} reward (${test.giverLabel}, Plane of Sky)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// ---------------------------------------------------------------------
// Cleric Skyshrine Armor Quests (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:skyshrine";
  const giverId = "npc:skyshrine:fardonad-fedhar";
  addGiver(giverId, "Fardonad Fe`Dhar", zoneId);

  const groupId = "quest_group:cleric-skyshrine-armor-quests";
  addNode({
    id: groupId,
    label: "Cleric Skyshrine Armor Quests",
    type: "quest_group",
    description: "Fardonad Fe`Dhar in Skyshrine trades an unadorned plate armor piece plus 3 matching gems for its corresponding piece of Akkirus armor. Seven independent sub-quests, no ordering between them. Ally faction required for all Skyshrine armor quests.",
    classes: ["cleric"],
    wiki_title: "Cleric Skyshrine Armor Quests",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const pieces: Array<{ label: string; base: string; gem: string; reward: string }> = [
    { label: "Helmet", base: "unadorned plate helmet", gem: "3 crushed onyx sapphires", reward: "Akkirus' Crown of the Risen" },
    { label: "Chestplate", base: "unadorned breastplate", gem: "3 black marble", reward: "Akkirus' Chestplate of the Risen" },
    { label: "Vambraces", base: "unadorned plate vambraces", gem: "3 jaundice gems", reward: "Akkirus' Vambraces of the Risen" },
    { label: "Bracers", base: "unadorned plate bracer", gem: "3 crushed opals", reward: "Akkirus' Bracelet of the Risen" },
    { label: "Gauntlets", base: "unadorned plate gauntlets", gem: "3 crushed lava rubies", reward: "Akkirus' Gauntlets of the Risen" },
    { label: "Greaves", base: "unadorned plate greaves", gem: "3 chipped onyx sapphires", reward: "Akkirus' Greaves of the Risen" },
    { label: "Boots", base: "unadorned plate boots", gem: "3 crushed flame emeralds", reward: "Akkirus' Boots of the Risen" },
  ];
  for (const piece of pieces) {
    const questId = `quest:cleric-skyshrine-armor-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `Cleric Skyshrine Armor Quests: ${piece.label}`,
      type: "quest",
      classes: ["cleric"],
      description: `Trade an ${piece.base} plus ${piece.gem} to Fardonad Fe\`Dhar in Skyshrine for the ${piece.reward}.`,
      steps: [`Gather an ${piece.base} and ${piece.gem}`, "Turn them in to Fardonad Fe`Dhar in Skyshrine"],
      wiki_title: "Cleric Skyshrine Armor Quests",
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
      classes: ["cleric"],
      source: `Cleric Skyshrine Armor Quests: ${piece.label} reward (Fardonad Fe\`Dhar, Skyshrine)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// ---------------------------------------------------------------------
// Cleric Spells (Evil) / Cleric Spells (Good) -- shared reward pool
// ---------------------------------------------------------------------
const clericSpellRewards = ["Heroic Bond", "Sunskin", "Unswerving Hammer (of Faith)", "Word of Vigor"];
{
  const zoneId = "zone:the-overthere";
  const giverId = "npc:the-overthere:brinaa-darkpact";
  addGiver(giverId, "Brinaa Darkpact", zoneId);

  const questId = "quest:cleric-spells-evil";
  addNode({
    id: questId,
    label: "Cleric Spells (Evil)",
    type: "quest",
    classes: ["cleric"],
    description: "Brinaa Darkpact in The Overthere trades a duplicate spell scroll (Death Pact, Reckoning, Upheaval, or Yaulp IV) for a random spell scroll from Heroic Bond, Sunskin, Unswerving Hammer (of Faith), or Word of Vigor.",
    minLevel: 51,
    steps: [
      "Locate Brinaa Darkpact in The Overthere",
      "Hand over a duplicate scroll of Death Pact, Reckoning, Upheaval, or Yaulp IV",
      "Receive a random scroll from Heroic Bond, Sunskin, Unswerving Hammer (of Faith), or Word of Vigor",
    ],
    wiki_title: "Cleric Spells (Evil)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  for (const label of clericSpellRewards) {
    const id = `spell:${slug(label)}`;
    addNode({ id, label, type: "spell", class_levels: { cleric: 51 } });
    addEdge(questId, id, "rewards");
  }
}
{
  const zoneId = "zone:firiona-vie";
  const giverId = "npc:firiona-vie:frist-furtun";
  addGiver(giverId, "Frist Furtun", zoneId);

  const questId = "quest:cleric-spells-good";
  addNode({
    id: questId,
    label: "Cleric Spells (Good)",
    type: "quest",
    classes: ["cleric"],
    description: "Frist Furtun in Firiona Vie trades a duplicate spell scroll (Death Pact, Reckoning, Upheaval, or Yaulp IV) for a random spell scroll from Heroic Bond, Sunskin, Unswerving Hammer (of Faith), or Word of Vigor.",
    minLevel: 51,
    steps: [
      "Locate Frist Furtun in Firiona Vie",
      "Hand over a duplicate scroll of Death Pact, Reckoning, Upheaval, or Yaulp IV",
      "Receive a random scroll from Heroic Bond, Sunskin, Unswerving Hammer (of Faith), or Word of Vigor",
    ],
    wiki_title: "Cleric Spells (Good)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  for (const label of clericSpellRewards) {
    const id = `spell:${slug(label)}`;
    addEdge(questId, id, "rewards");
  }
}

// ---------------------------------------------------------------------
// Cleric Supplies
// ---------------------------------------------------------------------
{
  const zoneId = "zone:rivervale";
  const giverId = "npc:rivervale:beek-guinders";
  addGiver(giverId, "Beek Guinders", zoneId);

  const questId = "quest:cleric-supplies";
  addNode({
    id: questId,
    label: "Cleric Supplies",
    type: "quest",
    description: "Beek Guinders in Rivervale trades 2 Ruined Wolf Pelts, 1 Black Wolf Skin, and Berries (from Misty Thicket's canyon area) for a random low-level cleric spell, coin, and faction. All classes.",
    minLevel: 1,
    steps: [
      "Gather 2 Ruined Wolf Pelts, 1 Black Wolf Skin, and Berries from Misty Thicket's canyon area",
      "Return them to Beek Guinders in Rivervale",
    ],
    wiki_title: "Cleric Supplies",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:misty-thicket", "located_in");
  addFactionReward(questId, "Priests of Mischief");
  addFactionReward(questId, "Mayor Gubbin");
  addFactionReward(questId, "Guardians of the Vale");
}

// ---------------------------------------------------------------------
// Cleric Thurgadin Armor Quests (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:thurgadin";
  const giverId = "npc:thurgadin:loremaster-dorinan";
  addGiver(giverId, "Loremaster Dorinan", zoneId);

  const groupId = "quest_group:cleric-thurgadin-armor-quests";
  addNode({
    id: groupId,
    label: "Cleric Thurgadin Armor Quests",
    type: "quest_group",
    description: "Loremaster Dorinan in Thurgadin trades a Corroded Plate armor piece plus 3 matching gems for its corresponding piece of Forbidden Rites armor. Seven independent sub-quests, no ordering between them. Kindly faction required for all Thurgadin armor quests.",
    classes: ["cleric"],
    wiki_title: "Cleric Thurgadin Armor Quests",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const pieces: Array<{ label: string; base: string; gem: string; reward: string }> = [
    { label: "Helm", base: "Corroded Plate Helmet", gem: "3 Crushed Onyx Sapphire", reward: "Crown of Forbidden Rites" },
    { label: "Breastplate", base: "Corroded Breastplate", gem: "3 Black Marble", reward: "Breastplate of Forbidden Rites" },
    { label: "Vambraces", base: "Corroded Plate Vambraces", gem: "3 Jaundice Gem", reward: "Vambraces of Forbidden Rites" },
    { label: "Bracers", base: "Corroded Plate Bracer", gem: "3 Crushed Opal", reward: "Bracers of Forbidden Rites" },
    { label: "Gauntlets", base: "Corroded Plate Gauntlets", gem: "3 Crushed Lava Ruby", reward: "Gauntlets of Forbidden Rites" },
    { label: "Greaves", base: "Corroded Plate Greaves", gem: "3 Chipped Onyx Sapphire", reward: "Greaves of Forbidden Rites" },
    { label: "Boots", base: "Corroded Plate Boots", gem: "3 Crushed Flame Emerald", reward: "Boots of Forbidden Rites" },
  ];
  for (const piece of pieces) {
    const questId = `quest:cleric-thurgadin-armor-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `Cleric Thurgadin Armor Quests: ${piece.label}`,
      type: "quest",
      classes: ["cleric"],
      description: `Trade a ${piece.base} plus ${piece.gem} to Loremaster Dorinan in Thurgadin for the ${piece.reward}.`,
      steps: [`Gather a ${piece.base} and ${piece.gem}`, "Turn them in to Loremaster Dorinan in Thurgadin"],
      wiki_title: "Cleric Thurgadin Armor Quests",
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
      classes: ["cleric"],
      source: `Cleric Thurgadin Armor Quests: ${piece.label} reward (Loremaster Dorinan, Thurgadin)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// ---------------------------------------------------------------------
// Clurg's Revenge
// ---------------------------------------------------------------------
{
  const zoneId = "zone:oggok";
  const giverId = "npc:oggok:clurg-the-bartender";
  addGiver(giverId, "Clurg the Bartender", zoneId);

  const questId = "quest:clurgs-revenge";
  addNode({
    id: questId,
    label: "Clurg's Revenge",
    type: "quest",
    description: "Clurg the Bartender in Oggok, after faction is raised with Craknek Warriors, Green Blood Knights, and Chef Dooga via prerequisite quests, sends the player to Neriak Foreign Quarter's PvP area to defeat Pungla at the bar. Returning her head yields a Crude Stein, Ogre War Maul, Pearl, or Warhammer. All classes.",
    minLevel: 14,
    steps: [
      "Raise faction with Craknek Warriors, Green Blood Knights, and Chef Dooga via prerequisite quests",
      "Travel to Neriak Foreign Quarter's PvP area and defeat Pungla at the bar",
      "Return her head to Clurg the Bartender",
    ],
    wiki_title: "Clurg's Revenge",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:neriak-foreign-quarter", "located_in");
  addEdge(questId, "item:a-crude-stein", "rewards");
  addEdge(questId, "item:ogre-war-maul", "rewards");

  const pearlId = "item:pearl";
  addNode({ id: pearlId, label: "Pearl", type: "item", source: "Clurg's Revenge reward (Clurg the Bartender, Oggok)" });
  addEdge(questId, pearlId, "rewards");

  const warhammerId = "item:warhammer";
  addNode({
    id: warhammerId,
    label: "Warhammer",
    type: "item",
    slots: ["Primary"],
    skill: "1H Blunt",
    source: "Clurg's Revenge reward (Clurg the Bartender, Oggok)",
  });
  addEdge(questId, warhammerId, "rewards");
}

// ---------------------------------------------------------------------
// Coldain Books of Tactics (compressed -- multiple book types, fixed rewards)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const giverId = "npc:kael-drakkal:gkrean-prophet-of-tallon";
  addGiver(giverId, "Gkrean Prophet of Tallon", zoneId);

  const questId = "quest:coldain-books-of-tactics";
  addNode({
    id: questId,
    label: "Coldain Books of Tactics",
    type: "quest",
    description: "Gkrean Prophet of Tallon in Kael Drakkal trades Coldain tactical books -- which drop randomly from Coldain enemies (known titles include Brell's Divine Strategy and War Tactics of the Frostreavers) -- for a fixed reward per book: Book of Tactics, Bracelet of Sacrifice, Circlet of Tallon, or Gauntlets of Iron Tactics. All classes.",
    minLevel: 50,
    steps: [
      "Kill Coldain enemies for a random tactical book (Brell's Divine Strategy, War Tactics of the Frostreavers, or others)",
      "Turn a book in to Gkrean Prophet of Tallon for its corresponding reward",
    ],
    wiki_title: "Coldain Books of Tactics",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Kromrif");
  addFactionReward(questId, "Kromzek");
  addFactionReward(questId, "King Tormax");

  const bookId = "item:book-of-tactics";
  addNode({
    id: bookId,
    label: "Book of Tactics",
    type: "item",
    slots: ["Range"],
    stats: { dex: 6, int: 6 },
    source: "Coldain Books of Tactics reward (Gkrean Prophet of Tallon, Kael Drakkal)",
  });
  addEdge(questId, bookId, "rewards");

  const braceletId = "item:bracelet-of-sacrifice";
  addNode({
    id: braceletId,
    label: "Bracelet of Sacrifice",
    type: "item",
    slots: ["Wrist"],
    source: "Coldain Books of Tactics reward (Gkrean Prophet of Tallon, Kael Drakkal)",
  });
  addEdge(questId, braceletId, "rewards");

  const circletId = "item:circlet-of-tallon";
  addNode({
    id: circletId,
    label: "Circlet of Tallon",
    type: "item",
    slots: ["Head"],
    resists: { cold: 9, magic: 9, poison: 9 },
    source: "Coldain Books of Tactics reward (Gkrean Prophet of Tallon, Kael Drakkal)",
  });
  addEdge(questId, circletId, "rewards");

  const gauntletsId = "item:gauntlets-of-iron-tactics";
  addNode({
    id: gauntletsId,
    label: "Gauntlets of Iron Tactics",
    type: "item",
    slots: ["Hands"],
    classes: ["cleric", "druid", "shaman"],
    source: "Coldain Books of Tactics reward (Gkrean Prophet of Tallon, Kael Drakkal)",
  });
  addEdge(questId, gauntletsId, "rewards");
}

// ---------------------------------------------------------------------
// Coldain Skulls
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const giverId = "npc:kael-drakkal:slaggak-the-trainer";
  addGiver(giverId, "Slaggak the Trainer", zoneId);

  const questId = "quest:coldain-skulls";
  addNode({
    id: questId,
    label: "Coldain Skulls",
    type: "quest",
    description: "Slaggak the Trainer in Kael Drakkal trades 4 Coldain Heads (slain throughout Eastern Wastes, Great Divide, and Thurgadin) for a random piece of Giant Scalemail Armor. All four heads must be turned in together -- individual heads yield no experience, faction, or items. All classes.",
    minLevel: 45,
    steps: [
      "Slay Coldain throughout Eastern Wastes, Great Divide, and Thurgadin for 4 Coldain Heads",
      "Turn all 4 heads in together to Slaggak the Trainer",
    ],
    wiki_title: "Coldain Skulls",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:eastern-wastes", "located_in");
  addEdge(questId, "zone:great-divide", "located_in");
  addEdge(questId, "zone:thurgadin", "located_in");
  addFactionReward(questId, "Kromrif");
  addFactionReward(questId, "Kromzek");
}

// ---------------------------------------------------------------------
// Collier's Weapon Treatment
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const giverId = "npc:erudin:collier";
  addGiver(giverId, "Collier", zoneId);

  const questId = "quest:colliers-weapon-treatment";
  addNode({
    id: questId,
    label: "Collier's Weapon Treatment",
    type: "quest",
    description: "Collier, on the top floor of the Vasty Deep Inn in Erudin, trades an Ancient Snake Fang and Ancient Venom Sack (Slyder the Ancient), a Venomous Spikefish Poison Sac (rare drop from venomous spikefish), and Necromancer Blood (Heretic Invaders) for a Thick Caustic Liquid -- applied to a standard forged weapon at a forge to produce a Bloodclaw variant (battle axe, dagger, long sword, mace, rapier, or scimitar, depending on the base weapon chosen). Circle of Unseen Hands faction required. All classes.",
    minLevel: 20,
    steps: [
      "Obtain an Ancient Snake Fang and Ancient Venom Sack from Slyder the Ancient",
      "Obtain a Venomous Spikefish Poison Sac (rare drop) from a venomous spikefish",
      "Obtain Necromancer Blood from Heretic Invaders",
      "Turn everything in to Collier in Erudin for a Thick Caustic Liquid",
      "Apply the Thick Caustic Liquid to a standard forged weapon at a forge for its Bloodclaw variant",
    ],
    wiki_title: "Collier's Weapon Treatment",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Circle of Unseen Hands");

  const liquidId = "item:thick-caustic-liquid";
  addNode({
    id: liquidId,
    label: "Thick Caustic Liquid",
    type: "item",
    source: "Collier's Weapon Treatment reward (Collier, Erudin) -- combine with a forged weapon at a forge for a Bloodclaw variant",
  });
  addEdge(questId, liquidId, "rewards");
}

// ---------------------------------------------------------------------
// Corrupt Guards (Cleric version)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-freeport";
  const giverId = "npc:north-freeport:jemoz-lerkarson";
  addGiver(giverId, "Jemoz Lerkarson", zoneId);

  const questId = "quest:corrupt-guards-cleric";
  addNode({
    id: questId,
    label: "Corrupt Guards (Cleric version)",
    type: "quest",
    classes: ["cleric"],
    description: "Jemoz Lerkarson in North Freeport sends Clerics after a Damaged Militia Helm from militia guards in West Freeport, in exchange for a random cleric spell scroll and a cast of minor healing.",
    minLevel: 10,
    steps: [
      "Hail Jemoz Lerkarson and express devotion to truth",
      "Defeat militia guards in West Freeport for a Damaged Militia Helm",
      "Return the helm to Jemoz Lerkarson",
    ],
    wiki_title: "Corrupt Guards (Cleric version)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:west-freeport", "located_in");
  addFactionReward(questId, "Knights of Truth");
  addFactionReward(questId, "Priests of Marr");
  addFactionReward(questId, "Steel Warriors");
}

// ---------------------------------------------------------------------
// Corrupt Guards (Paladin Version)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-freeport";
  const giverId = "npc:north-freeport:theron-rolius";
  addGiver(giverId, "Theron Rolius", zoneId);

  const questId = "quest:corrupt-guards-paladin";
  addNode({
    id: questId,
    label: "Corrupt Guards (Paladin Version)",
    type: "quest",
    classes: ["paladin"],
    description: "Theron Rolius, at the Hall of Truth in North Freeport, sends the player on a crusade against the Freeport Militia -- defeat militia guards in East Freeport and return their Damaged Militia Helm drops one at a time for coin, experience, and faction.",
    minLevel: 15,
    steps: [
      "Hail Theron Rolius at the Hall of Truth and accept the crusade against the Freeport Militia",
      "Defeat militia guards in East Freeport for Damaged Militia Helm drops",
      "Return the helmets one at a time to Theron Rolius",
    ],
    wiki_title: "Corrupt Guards (Paladin Version)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:east-freeport", "located_in");
  addFactionReward(questId, "Knights of Truth");
  addFactionReward(questId, "Priests of Marr");
  addFactionReward(questId, "Steel Warriors");
}

// ---------------------------------------------------------------------
// Crest of the Drixie Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:the-wakening-land";
  const giverId = "npc:the-wakening-land:lord-prismwing";
  addGiver(giverId, "Lord Prismwing", zoneId);

  const questId = "quest:crest-of-the-drixie-quest";
  addNode({
    id: questId,
    label: "Crest of the Drixie Quest",
    type: "quest",
    classes: ["ranger", "druid"],
    description: "Lord Prismwing in The Wakening Land sends the player to Cobalt Scar to defeat Yvolcarn and return with Drixie Remains, in exchange for a Crest of the Drixie.",
    minLevel: 50,
    steps: [
      "Hail Lord Prismwing and agree to help locate his missing herald",
      "Travel to Cobalt Scar and defeat Yvolcarn",
      "Loot the Drixie Remains and return them to Lord Prismwing",
    ],
    wiki_title: "Crest of the Drixie Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:cobalt-scar", "located_in");
  addFactionReward(questId, "Tunarean Court");
  addEdge("quest:friend-of-the-tunarean-court", questId, "requires");

  const crestId = "item:crest-of-the-drixie";
  addNode({
    id: crestId,
    label: "Crest of the Drixie",
    type: "item",
    magic: true,
    lore: true,
    noTrade: true,
    weight: 0.1,
    source: "Crest of the Drixie Quest reward (Lord Prismwing, The Wakening Land)",
  });
  addEdge(questId, crestId, "rewards");
}

// ---------------------------------------------------------------------
// Crest of the Faerie Dragons Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:the-wakening-land";
  const giverId = "npc:the-wakening-land:lord-gossimerwind";
  addGiver(giverId, "Lord Gossimerwind", zoneId);

  const questId = "quest:crest-of-the-faerie-dragons-quest";
  addNode({
    id: questId,
    label: "Crest of the Faerie Dragons Quest",
    type: "quest",
    classes: ["ranger", "druid"],
    description: "Lord Gossimerwind in The Wakening Land sends the player to defeat a Storm Giant Foreman and return his helm as proof, in exchange for a Crest of the Faerie Dragons.",
    minLevel: 50,
    steps: [
      "Hail Lord Gossimerwind",
      "Defeat a Storm Giant Foreman and loot his helm",
      "Return the helm to Lord Gossimerwind",
    ],
    wiki_title: "Crest of the Faerie Dragons Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Tunarean Court");
  addEdge("quest:friend-of-the-tunarean-court", questId, "requires");

  const crestId = "item:crest-of-the-faerie-dragons";
  addNode({
    id: crestId,
    label: "Crest of the Faerie Dragons",
    type: "item",
    magic: true,
    noTrade: true,
    weight: 0.1,
    source: "Crest of the Faerie Dragons Quest reward (Lord Gossimerwind, The Wakening Land)",
  });
  addEdge(questId, crestId, "rewards");
}

// ---------------------------------------------------------------------
// Crest of the Fauns Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:the-wakening-land";
  const giverId = "npc:the-wakening-land:shamus-aghllsews";
  addGiver(giverId, "Shamus Aghllsews", zoneId);

  const questId = "quest:crest-of-the-fauns-quest";
  addNode({
    id: questId,
    label: "Crest of the Fauns Quest",
    type: "quest",
    classes: ["ranger", "druid"],
    description: "Shamus Aghllsews in The Wakening Land, after the Friend of the Tunarean Court case is obtained, sends the player to kill a storm giant architect for kromzek architect blueprints, then fill a container with crystallized sulfur and combine it with a bag of crushed herbs, then trade both bags into a bag of building supplies at destroyed building platforms in Kael Drakkel (an explosion deals roughly 1000 fire damage), and return the resulting pile of rubble for a Crest of the Fauns.",
    minLevel: 50,
    steps: [
      "Obtain the case from the Friend of the Tunarean Court prerequisite",
      "Kill a storm giant architect and collect kromzek architect blueprints",
      "Return the blueprints to Shamus for a container and a bag of crushed herbs",
      "Fill the container with crystallized sulfur and combine it with the herb bag",
      "Travel to Kael Drakkel's destroyed building platforms and trade both bags into a bag of building supplies (triggers an explosion, ~1000 fire damage)",
      "Collect the resulting pile of rubble and return it to Shamus",
    ],
    wiki_title: "Crest of the Fauns Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:kael-drakkal", "located_in");
  addFactionReward(questId, "Tunarean Court");
  addEdge("quest:friend-of-the-tunarean-court", questId, "requires");

  const crestId = "item:crest-of-the-fauns";
  addNode({
    id: crestId,
    label: "Crest of the Fauns",
    type: "item",
    magic: true,
    noTrade: true,
    source: "Crest of the Fauns Quest reward (Shamus Aghllsews, The Wakening Land)",
  });
  addEdge(questId, crestId, "rewards");
}

// ---------------------------------------------------------------------
// Crest of the Sifaye Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:the-wakening-land";
  const giverId = "npc:the-wakening-land:countess-silveana";
  addGiver(giverId, "Countess Silveana", zoneId);

  const questId = "quest:crest-of-the-sifaye-quest";
  addNode({
    id: questId,
    label: "Crest of the Sifaye Quest",
    type: "quest",
    classes: ["ranger", "druid"],
    description: "Countess Silveana in The Wakening Land trades a Kromzek Surveyor Scope (looted from a storm giant surveyor) for a Crest of the Sifaye.",
    minLevel: 50,
    steps: [
      "Kill a storm giant surveyor for a Kromzek Surveyor Scope",
      "Hand the scope to Countess Silveana",
    ],
    wiki_title: "Crest of the Sifaye Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Tunarean Court");
  addEdge("quest:friend-of-the-tunarean-court", questId, "requires");

  const crestId = "item:crest-of-the-sifaye";
  addNode({
    id: crestId,
    label: "Crest of the Sifaye",
    type: "item",
    magic: true,
    lore: true,
    noTrade: true,
    weight: 0,
    source: "Crest of the Sifaye Quest reward (Countess Silveana, The Wakening Land)",
  });
  addEdge(questId, crestId, "rewards");
}

// ---------------------------------------------------------------------
// Crest of the Unicorn Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:the-wakening-land";
  const giverId = "npc:the-wakening-land:lady-gelistial";
  addGiver(giverId, "Lady Gelistial", zoneId);

  const questId = "quest:crest-of-the-unicorn-quest";
  addNode({
    id: questId,
    label: "Crest of the Unicorn Quest",
    type: "quest",
    classes: ["ranger", "druid"],
    description: "Lady Gelistial in The Wakening Land tells of the cursed black unicorn Lithiniath; Prince Thirneg at the bottom of Tunare's Tree in Plane of Growth gives instructions to kill Lithiniath in the Plane of Mischief. Looting his horn and giving it to a nearby white stallion yields the Crest of the Unicorn.",
    minLevel: 55,
    steps: [
      "Speak with Lady Gelistial about the cursed black unicorn Lithiniath",
      "Find Prince Thirneg at the bottom of Tunare's Tree in Plane of Growth",
      "Travel to the Plane of Mischief and defeat Lithiniath, in a room off the dining hall's right side",
      "Loot his horn and give it to a nearby white stallion",
    ],
    wiki_title: "Crest of the Unicorn Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:plane-of-growth", "located_in");
  addEdge(questId, "zone:plane-of-mischief", "located_in");
  addEdge("quest:friend-of-the-tunarean-court", questId, "requires");

  const crestId = "item:crest-of-the-unicorn";
  addNode({
    id: crestId,
    label: "Crest of the Unicorn",
    type: "item",
    magic: true,
    lore: true,
    noTrade: true,
    source: "Crest of the Unicorn Quest reward (Lady Gelistial, The Wakening Land)",
  });
  addEdge(questId, crestId, "rewards");
}

// ---------------------------------------------------------------------
// Crest of the Wood Nymphs Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:the-wakening-land";
  const giverId = "npc:the-wakening-land:eysa-florawhisper";
  addGiver(giverId, "Eysa Florawhisper", zoneId);

  const questId = "quest:crest-of-the-wood-nymphs-quest";
  addNode({
    id: questId,
    label: "Crest of the Wood Nymphs Quest",
    type: "quest",
    classes: ["ranger", "druid"],
    description: "Eysa Florawhisper in The Wakening Land, after the Friend of the Tunarean Court quest, sends the player to collect eight seeds across the world -- Misty Acorn (Misty Thicket), Emerald Orange (Emerald Jungle), Bag of Caynar Nuts (Toxxulia Forest), Vineclinger Berries (Butcherblock Mountains), Ripened Heartfruit (Greater Faydark), Rathe Berries (Lake Rathetear), Marr Cherries (Ocean of Tears), Flarefire Seeds (Field of Bone) -- combined in a provided seed pack for the Crest of the Wood Nymphs.",
    minLevel: 45,
    steps: [
      "Complete the Friend of the Tunarean Court quest first",
      "Collect a Misty Acorn (Misty Thicket), Emerald Orange (Emerald Jungle), Bag of Caynar Nuts (Toxxulia Forest), Vineclinger Berries (Butcherblock Mountains), Ripened Heartfruit (Greater Faydark), Rathe Berries (Lake Rathetear), Marr Cherries (Ocean of Tears), and Flarefire Seeds (Field of Bone)",
      "Combine all eight seeds in the provided seed pack and return it to Eysa Florawhisper",
    ],
    wiki_title: "Crest of the Wood Nymphs Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:misty-thicket", "located_in");
  addEdge(questId, "zone:emerald-jungle", "located_in");
  addEdge(questId, "zone:toxxulia-forest", "located_in");
  addEdge(questId, "zone:butcherblock-mountains", "located_in");
  addEdge(questId, "zone:greater-faydark", "located_in");
  addEdge(questId, "zone:lake-rathetear", "located_in");
  addEdge(questId, "zone:ocean-of-tears", "located_in");
  addEdge(questId, "zone:field-of-bone", "located_in");
  addFactionReward(questId, "Tunarean Court");
  addEdge("quest:friend-of-the-tunarean-court", questId, "requires");

  const crestId = "item:crest-of-the-wood-nymphs";
  addNode({
    id: crestId,
    label: "Crest of the Wood Nymphs",
    type: "item",
    magic: true,
    noTrade: true,
    source: "Crest of the Wood Nymphs Quest reward (Eysa Florawhisper, The Wakening Land)",
  });
  addEdge(questId, crestId, "rewards");
}

save();
console.log("Migration 063 complete: added 25 more quests from GitHub issue #26's checklist");
