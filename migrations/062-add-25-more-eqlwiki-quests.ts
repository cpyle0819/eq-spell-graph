/**
 * Migration 062: 25 more quests off GitHub issue #26's checklist -- the
 * "10th Coldain Ring Quest" through "Burnished Wooden Staff Quest" run.
 * Researched directly against eqlwiki.com, following
 * decisions/eqlwiki-quest-research-method.md.
 *
 * Not modeled as a quest node:
 * - "All Positive Faction Quests" -- not a quest at all, it's the wiki's
 *   own category/index page listing many *other* quests (several of which,
 *   like Bladed Weapons, are on this same checklist and modeled on their
 *   own). Checked off since there's no quest entity here to add.
 *
 * Multi-stage chains modeled as one `quest` node with a long `steps` array
 * (same treatment as the existing Paladin/Cleric Epic Quests and Paw of
 * Opolla Quest -- a linear chain doesn't need `quest_group`/`requires`,
 * those exist for sibling sets and cross-quest prerequisites respectively):
 * - 10th Coldain Ring Quest (the whole Coldain Ring War progression)
 * - Bard Epic Quest (four-page-gathering chain)
 * - Brain Bite (Evil) / Brain Bite (Good) (bottle-delivery relay)
 *
 * `quest_group` (decisions/quest-group-node-type.md) for genuine sibling
 * sets -- one shared giver/zone/crafting mechanic, seven independent
 * per-armor-piece turn-ins, no ordering between them:
 * - Bard Kael Armor Quests, Bard Skyshrine Armor Quests, Bard Thurgadin
 *   Armor Quests
 *
 * Compressed to one quest node despite covering many NPCs/zones, because
 * eqlwiki.com itself presents them as one repeatable mechanic rather than
 * naming every city-specific giver/reward pairing:
 * - Bone Chips Quests (9 city variants, same "hand in 4 chips" mechanic)
 * - Bread Shipment Quests (~10 city variants, same "hand in a bread bag"
 *   mechanic)
 *
 * Deliberately NOT modeled (consistent with every migration so far):
 * - Negative faction changes throughout (decisions/quest-reward-modeling.md
 *   only models positive rewards): Aid the Dar Brood's Kromzek loss, Bard
 *   Kael/Thurgadin Armor Quests' Claws of Veeshan loss, Bard Lambent Gems'
 *   Shadowed Men loss, Bard Mail's Ring of Scale / Mayong Mistmoore loss,
 *   Blackburrow Stout Delivery's faction-hit alternate path, Blackburrow
 *   Stout Shipment's Merchants of Qeynos loss, Bulthar Trunks' Ulthork
 *   loss, Brain Bite (Good)'s Legion of Cabilis / Pirates of Gunthak loss.
 * - Coin rewards throughout -- no coin field on `quest` nodes.
 * - Random/choice rewards left undecided rather than picked arbitrarily:
 *   Bladed Weapons' Tarnished Scimitar-or-Worn Great Staff choice (both
 *   modeled as `rewards` -- a real choice, not a random draw, so both are
 *   legitimately "what you could end up with"), Bulthar Trunks' random
 *   rare-gem-or-vendor-jewelry reward for 2 regular trunks (no fixed item
 *   named, left prose-only in `steps`).
 * - Quests explicitly marked broken/unsolved by the wiki itself, where no
 *   reward is confirmed: Blood Ink (reward "unknown" as of the source
 *   page), Boysenberry Pie Quest (wiki states devs confirmed it was never
 *   implemented). Both still get a quest node (they're real, given-in-game
 *   quest hooks with givers/steps), just no `rewards` edges.
 * - Ancient Dragon Tome's exact hand-in dialogue/faction hits -- wiki page
 *   itself flags these as missing; the confirmed reward item is still
 *   modeled.
 *
 * New zone stubs added (giver's zone missing from the graph, per the
 * issue's zone-creation guardrail, bare nodes same as migration 028's
 * Plane of Fear): Dreadlands (Bard Epic Quest), Dragon Necropolis (Aid the
 * Dar Brood), Trakanon's Teeth, City of Mist, Karnor's Castle (all three
 * Brain Bite delivery stops), Warsliks Woods (Burnished Wooden Staff
 * Quest).
 *
 * New spell node: Brain Bite, reused as the shared reward of both the Evil
 * and Good Brain Bite quests (same spell, two alignment-gated quest paths
 * per eqlwiki.com).
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

function hasNode(id: string): boolean {
  return graph.nodes.some((n: { data: { id: string } }) => n.data.id === id);
}

function addNode(data: Record<string, unknown>) {
  if (!hasNode(data.id as string)) graph.nodes.push({ data });
}

function hasEdge(source: string, target: string, type: string): boolean {
  return graph.edges.some(
    (e: { data: { source: string; target: string; type: string } }) =>
      e.data.source === source && e.data.target === target && e.data.type === type
  );
}

function addEdge(source: string, target: string, type: string) {
  if (hasEdge(source, target, type)) return;
  graph.edges.push({ data: { id: `e-${type}-${graph.edges.length + 1}`, source, target, type } });
}

function slug(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function addFactionReward(questId: string, label: string) {
  const id = `faction:${slug(label)}`;
  addNode({ id, label, type: "faction" });
  addEdge(questId, id, "rewards");
}

function addGiver(id: string, label: string, zoneId: string) {
  addNode({ id, label, type: "npc", roles: ["quest_giver"] });
  addEdge(id, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// New zone stubs
// ---------------------------------------------------------------------
const dreadlandsId = "zone:dreadlands";
addNode({ id: dreadlandsId, label: "Dreadlands", type: "zone" });

const dragonNecropolisId = "zone:dragon-necropolis";
addNode({ id: dragonNecropolisId, label: "Dragon Necropolis", type: "zone" });
addEdge(dragonNecropolisId, "zone:western-wastes", "connects_to");
addEdge("zone:western-wastes", dragonNecropolisId, "connects_to");

const trakanonsTeethId = "zone:trakanons-teeth";
addNode({ id: trakanonsTeethId, label: "Trakanon's Teeth", type: "zone" });

const cityOfMistId = "zone:city-of-mist";
addNode({ id: cityOfMistId, label: "City of Mist", type: "zone" });

const karnorsCastleId = "zone:karnors-castle";
addNode({ id: karnorsCastleId, label: "Karnor's Castle", type: "zone" });

const warsliksWoodsId = "zone:warsliks-woods";
addNode({ id: warsliksWoodsId, label: "Warsliks Woods", type: "zone" });

// ---------------------------------------------------------------------
// New spell: Brain Bite (shared by both Brain Bite quests)
// ---------------------------------------------------------------------
const brainBiteSpellId = "spell:brain-bite";
addNode({
  id: brainBiteSpellId,
  label: "Brain Bite",
  type: "spell",
  class_levels: { wizard: 37 },
  wiki_title: "Brain Bite",
});

// ---------------------------------------------------------------------
// 10th Coldain Ring Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:thurgadin";
  const giverId = "npc:thurgadin:dain-frostreaver-iv";
  addGiver(giverId, "Dain Frostreaver IV", zoneId);

  const questId = "quest:10th-coldain-ring-quest";
  addNode({
    id: questId,
    label: "10th Coldain Ring Quest",
    type: "quest",
    description: "The final stage of the Coldain Ring War progression. Dain Frostreaver IV trades a Dirk of the Dain for a Declaration of War; combined with Ring 9 (Coldain Hero's Insignia Ring) it's handed to Sentry Badain, then Orders of Engagement trigger a three-round war against waves of giants ending in Narandi the Wretched. Ring 9 plus Narandi's head, turned in to Seneschal Aldikar, produces Ring 10; giving Ring 10 back to Dain Frostreaver IV (Ally faction required) yields the final blessing.",
    steps: [
      "Hand a Dirk of the Dain to Dain Frostreaver IV in Thurgadin, receive a Declaration of War",
      "Give the Declaration plus Ring 9 (Coldain Hero's Insignia Ring) to Sentry Badain at the tower",
      "Give Orders of Engagement to Zrelik the Scout to trigger the war",
      "Defeat three rounds of giant waves, then kill Narandi the Wretched",
      "Turn Ring 9 plus Narandi's head in to Seneschal Aldikar for Ring 10",
      "Turn a Shorn Head of Narandi in to each dwarf commander for additional rewards",
      "Give Ring 10 to Dain Frostreaver IV (Ally faction required) for the final blessing and Ring of Dain Frostreaver IV",
    ],
    wiki_title: "10th Coldain Ring Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:great-divide", "located_in");

  const ringItems = [
    "Ring of Dain Frostreaver IV",
    "Crown of Narandi",
    "Eye of Narandi",
    "Earring of the Frozen Skull",
    "Faceguard of Bentos the Hero",
    "Choker of the Wretched",
    "Protection of the Dain",
  ];
  for (const label of ringItems) {
    const id = `item:${slug(label)}`;
    addNode({
      id,
      label,
      type: "item",
      source: "10th Coldain Ring Quest reward (Dain Frostreaver IV / Seneschal Aldikar / dwarf commanders, Thurgadin)",
    });
    addEdge(questId, id, "rewards");
  }
}

// ---------------------------------------------------------------------
// Aid the Dar Brood
// ---------------------------------------------------------------------
{
  const zoneId = "zone:western-wastes";
  const giverId = "npc:western-wastes:harla-dar";
  addGiver(giverId, "Harla Dar", zoneId);

  const questId = "quest:aid-the-dar-brood";
  addNode({
    id: questId,
    label: "Aid the Dar Brood",
    type: "quest",
    description: "Harla Dar, wandering northeastern Western Wastes, asks for help with her missing whelp. Slaying Zlandicar in Dragon Necropolis and returning his Frakadar's Talisman to her yields the Shroud of the Dar Brood, faction with Claws of Veeshan and Yelinak, and experience. All classes.",
    minLevel: 60,
    steps: [
      "Find Harla Dar wandering northeastern Western Wastes and speak with her about her missing whelp",
      "Travel to Dragon Necropolis and slay Zlandicar for Frakadar's Talisman",
      "Return the talisman to Harla Dar",
    ],
    wiki_title: "Aid the Dar Brood",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, dragonNecropolisId, "located_in");
  addFactionReward(questId, "Claws of Veeshan");
  addFactionReward(questId, "Yelinak");

  const shroudId = "item:shroud-of-the-dar-brood";
  addNode({
    id: shroudId,
    label: "Shroud of the Dar Brood",
    type: "item",
    slots: ["Back", "Chest"],
    magic: true,
    ac: 14,
    effect: "Haste +34%",
    source: "Aid the Dar Brood reward (Harla Dar, Western Wastes)",
  });
  addEdge(questId, shroudId, "rewards");
}

// ---------------------------------------------------------------------
// All Positive Faction Quests -- not a real quest, wiki category/index page
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// Ancient Dragon Tome
// ---------------------------------------------------------------------
{
  const questId = "quest:ancient-dragon-tome";
  const giverId = "npc:kael-drakkal:evreth-menesez";
  addGiver(giverId, "Evreth Menesez", "zone:kael-drakkal");

  addNode({
    id: questId,
    label: "Ancient Dragon Tome",
    type: "quest",
    description: "Evreth Menesez gives a binding to collect four tome sections: one from a Kromzek sorcerer in Kael Drakkal, one from Fergul Frostsky or Gralk Dwarfkiller in Great Divide, one from a shadow beast necromancer or VhalSera in the Tower of Frozen Shadow, and one from a Haunted Seachest in Cobalt Scar. The eqlwiki.com page itself flags the exact hand-in dialogue and faction hits as missing/incomplete. Class unspecified. Reward: an Orb of Draconic Energy.",
    minLevel: 45,
    steps: [
      "Receive a binding from Evreth Menesez",
      "Recover a tome section from a Kromzek sorcerer in Kael Drakkal",
      "Recover a tome section from Fergul Frostsky or Gralk Dwarfkiller in Great Divide",
      "Recover a tome section from a shadow beast necromancer or VhalSera in the Tower of Frozen Shadow",
      "Recover a tome section from a Haunted Seachest in Cobalt Scar",
      "Return the four sections to Evreth Menesez",
    ],
    wiki_title: "Ancient Dragon Tome",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, "zone:kael-drakkal", "starts_in");
  addEdge(questId, "zone:kael-drakkal", "located_in");
  addEdge(questId, "zone:great-divide", "located_in");
  addEdge(questId, "zone:cobalt-scar", "located_in");

  const orbId = "item:orb-of-draconic-energy";
  addNode({
    id: orbId,
    label: "Orb of Draconic Energy",
    type: "item",
    slots: ["Secondary"],
    magic: true,
    ac: 15,
    stats: { mana: 50 },
    effect: "SV Fire +10, SV Cold +10",
    source: "Ancient Dragon Tome reward (Evreth Menesez, Kael Drakkal) -- all classes except Warrior, Monk, Rogue",
  });
  addEdge(questId, orbId, "rewards");
}

// ---------------------------------------------------------------------
// Armor Size
// ---------------------------------------------------------------------
{
  const zoneId = "zone:west-commonlands";
  const giverId = "npc:west-commonlands:timtok-tonsmith";
  addGiver(giverId, "Timtok Tonsmith", zoneId);
  const ranvigozId = "npc:west-commonlands:ranvigoz-tonsmith";
  addGiver(ranvigozId, "Ranvigoz Tonsmith", zoneId);

  const questId = "quest:armor-size";
  addNode({
    id: questId,
    label: "Armor Size",
    type: "quest",
    description: "Timtok Tonsmith or Ranvigoz Tonsmith, at the inn next to Befallen in West Commonlands, resize crafted plate armor (gauntlets, vambraces, bracers, helm, pauldrons, breastplate, greaves, or plate boots) down to a smaller size -- Amiable faction or better is required; at Indifferent they respond to hails but won't complete the resize. All classes.",
    minLevel: 1,
    steps: [
      "Bring a crafted armor piece to Timtok Tonsmith or Ranvigoz Tonsmith in West Commonlands",
      "Receive the piece back resized",
    ],
    wiki_title: "Armor Size",
  });
  addEdge(giverId, questId, "starts");
  addEdge(ranvigozId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Bard Epic Quest
// ---------------------------------------------------------------------
{
  const zoneId = dreadlandsId;
  const giverId = "npc:dreadlands:baldric-slezaf";
  addGiver(giverId, "Baldric Slezaf", zoneId);

  const questId = "quest:bard-epic-quest";
  addNode({
    id: questId,
    label: "Bard Epic Quest",
    type: "quest",
    description: "Baldric Slezaf, inside a pyramid in the Dreadlands, sends Bards after four pieces of the Maestro's Symphony and a Mystical Lute: Page 24 Top (a relay torch race through four zones), Page 24 Bottom (a chain involving a mechanical doll and Maligar's Enraged Doppleganger), Page 25 (three creature guts from specific dragons/wurms), and the Mystical Lute from Forpar Fizfla (dragon scales and defeating Trakanon). Turning everything in yields the Singing Short Sword. Bard only.",
    classes: ["bard"],
    minLevel: 46,
    steps: [
      "Obtain Maestro's Symphony Page 24 Top via a relay torch race through four zones",
      "Obtain Maestro's Symphony Page 24 Bottom via the mechanical doll chain and defeating Maligar's Enraged Doppleganger",
      "Obtain Maestro's Symphony Page 25 by collecting three creature guts from specific dragons/wurms",
      "Obtain a Mystical Lute from Forpar Fizfla by gathering rare dragon-scale components and defeating Trakanon",
      "Turn everything in to Baldric Slezaf in the Dreadlands",
    ],
    wiki_title: "Bard Epic Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const swordId = "item:singing-short-sword";
  addNode({
    id: swordId,
    label: "Singing Short Sword",
    type: "item",
    slots: ["Primary"],
    classes: ["bard"],
    magic: true,
    lore: true,
    skill: "1H Slashing",
    stats: { str: 15, cha: 20, hp: 100 },
    effect: "All elemental resistances; party haste 55%, song amplification 80%",
    source: "Bard Epic Quest reward (Baldric Slezaf, Dreadlands)",
  });
  addEdge(questId, swordId, "rewards");
}

// ---------------------------------------------------------------------
// Bard Kael Armor Quests (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kael-drakkal";
  const giverId = "npc:kael-drakkal:bygloirn-omorden";
  addGiver(giverId, "Bygloirn Omorden", zoneId);

  const groupId = "quest_group:bard-kael-armor-quests";
  addNode({
    id: groupId,
    label: "Bard Kael Armor Quests",
    type: "quest_group",
    description: "Bygloirn Omorden in Kael Drakkal trades an Ancient Tarnished armor piece plus 3 matching gems for its corresponding piece of Bard armor. Seven independent sub-quests, no ordering between them. Ally faction with Kromzek, Kromrif, and King Tormax required.",
    classes: ["bard"],
    wiki_title: "Bard Kael Armor Quests",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const pieces: Array<{ label: string; base: string; gem: string; reward: string }> = [
    { label: "Helm", base: "Ancient Tarnished Plate Helmet", gem: "3 Crushed Coral", reward: "Kael Bard Helm" },
    { label: "Breastplate", base: "Ancient Tarnished Breastplate", gem: "3 Flawless Diamonds", reward: "Kael Bard Breastplate" },
    { label: "Armplates", base: "Ancient Tarnished Vambraces", gem: "3 Flawed Emeralds", reward: "Kael Bard Vambraces" },
    { label: "Bracer", base: "Ancient Tarnished Plate Bracelet", gem: "3 Crushed Flame Emeralds", reward: "Kael Bard Bracer" },
    { label: "Gauntlets", base: "Ancient Tarnished Plate Gauntlets", gem: "3 Crushed Topaz", reward: "Kael Bard Gauntlets" },
    { label: "Greaves", base: "Ancient Tarnished Greaves", gem: "3 Flawed Sea Sapphires", reward: "Kael Bard Greaves" },
    { label: "Boots", base: "Ancient Tarnished Plate Boots", gem: "3 Crushed Black Marble", reward: "Kael Bard Boots" },
  ];
  for (const piece of pieces) {
    const questId = `quest:bard-kael-armor-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `Bard Kael Armor Quests: ${piece.label}`,
      type: "quest",
      classes: ["bard"],
      description: `Trade a ${piece.base} plus ${piece.gem} to Bygloirn Omorden in Kael Drakkal for the ${piece.reward}.`,
      steps: [`Gather a ${piece.base} and ${piece.gem}`, "Turn them in to Bygloirn Omorden in Kael Drakkal"],
      wiki_title: "Bard Kael Armor Quests",
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
      classes: ["bard"],
      source: `Bard Kael Armor Quests: ${piece.label} reward (Bygloirn Omorden, Kael Drakkal)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// ---------------------------------------------------------------------
// Bard Lambent Gems
// ---------------------------------------------------------------------
{
  const zoneId = "zone:temple-of-solusek-ro";
  const ostormId = "npc:temple-of-solusek-ro:ostorm";
  const genniId = "npc:temple-of-solusek-ro:genni";
  const gardernId = "npc:temple-of-solusek-ro:gardern";
  const vilissiaId = "npc:temple-of-solusek-ro:vilissia";
  addGiver(ostormId, "Ostorm", zoneId);
  addGiver(genniId, "Genni", zoneId);
  addGiver(gardernId, "Gardern", zoneId);
  addGiver(vilissiaId, "Vilissia", zoneId);

  const questId = "quest:bard-lambent-gems";
  addNode({
    id: questId,
    label: "Bard Lambent Gems",
    type: "quest",
    description: "Ostorm, Genni, Gardern, and Vilissia, in the Temple of Solusek Ro, each trade two matching gems plus a Lambent Stone (dropped by Antonican hill, ice, or sand giants) for a lambent version of that gem: Ostorm for fire opals, Genni for Star Rubies, Gardern for sapphires, Vilissia for rubies. Genni also sells a Fire Opal for 550 gold. Bard only.",
    classes: ["bard"],
    minLevel: 33,
    steps: [
      "Kill Antonican hill, ice, or sand giants for Lambent Stones",
      "Give two fire opals plus a Lambent Stone to Ostorm for a Lambent Fire Opal",
      "Give two Star Rubies plus a Lambent Stone to Genni for a Lambent Star Ruby",
      "Give two sapphires plus a Lambent Stone to Gardern for a Lambent Sapphire",
      "Give two rubies plus a Lambent Stone to Vilissia for a Lambent Ruby",
    ],
    wiki_title: "Bard Lambent Gems",
  });
  addEdge(ostormId, questId, "starts");
  addEdge(genniId, questId, "starts");
  addEdge(gardernId, questId, "starts");
  addEdge(vilissiaId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Temple Of Sol Ro");

  const gems = ["Lambent Fire Opal", "Lambent Star Ruby", "Lambent Sapphire", "Lambent Ruby"];
  for (const label of gems) {
    const id = `item:${slug(label)}`;
    addNode({
      id,
      label,
      type: "item",
      magic: true,
      lore: true,
      weight: 0.1,
      size: "Tiny",
      source: "Bard Lambent Gems reward (Temple of Solusek Ro)",
    });
    addEdge(questId, id, "rewards");
  }
}

// ---------------------------------------------------------------------
// Bard Mail
// ---------------------------------------------------------------------
{
  const zoneId = "zone:greater-faydark";
  const giverId = "npc:greater-faydark:tascar-tissleplay";
  addGiver(giverId, "Tascar Tissleplay", zoneId);

  const questId = "quest:bard-mail";
  addNode({
    id: questId,
    label: "Bard Mail",
    type: "quest",
    description: "Tascar Tissleplay in Felwithe (Greater Faydark) hands over a letter to be delivered to Jakum Webdancer at Kelethin's Bard's Guildhall; returning to Tascar afterward starts another loop. Repeatable, roughly 7.5 minutes per loop (4.5 with Summon of Speed). Rewards 1-16 gold, experience, and faction with League of Antonican Bards. All classes.",
    minLevel: 1,
    steps: [
      "Hail Tascar Tissleplay and agree to deliver to Kelethin",
      "Travel to Kelethin's Bard's Guildhall and hand the letter to Jakum Webdancer",
      "Return to Tascar Tissleplay for the next delivery",
    ],
    wiki_title: "Bard Mail",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "League of Antonican Bards");
}

// ---------------------------------------------------------------------
// Bard Skyshrine Armor Quests (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:skyshrine";
  const giverId = "npc:skyshrine:umykith-fedhar";
  addGiver(giverId, "Umykith Fe`Dhar", zoneId);

  const groupId = "quest_group:bard-skyshrine-armor-quests";
  addNode({
    id: groupId,
    label: "Bard Skyshrine Armor Quests",
    type: "quest_group",
    description: "Umykith Fe`Dhar, at Skyshrine's Tower Top, trades an Unadorned Plate armor piece plus 3 matching gems for its corresponding piece of Twilight armor. Seven independent sub-quests, no ordering between them. Ally faction required for all Skyshrine armor quests.",
    classes: ["bard"],
    wiki_title: "Bard Skyshrine Armor Quests",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");

  const pieces: Array<{ label: string; base: string; gem: string; reward: string }> = [
    { label: "Helm", base: "Unadorned Plate Helmet", gem: "3 Crushed Coral", reward: "Helm of Twilight" },
    { label: "Breastplate", base: "Unadorned Breastplate", gem: "3 Flawless Diamond", reward: "Breastplate of Twilight" },
    { label: "Armplates", base: "Unadorned Plate Vambraces", gem: "3 Flawed Emerald", reward: "Vambraces of Twilight" },
    { label: "Bracer", base: "Unadorned Plate Bracer", gem: "3 Crushed Flame Emerald", reward: "Bracer of Twilight" },
    { label: "Gauntlets", base: "Unadorned Plate Gauntlets", gem: "3 Crushed Topaz", reward: "Gauntlets of Twilight" },
    { label: "Greaves", base: "Unadorned Plate Greaves", gem: "3 Flawed Sea Sapphire", reward: "Greaves of Twilight" },
    { label: "Boots", base: "Unadorned Plate Boots", gem: "3 Crushed Black Marble", reward: "Boots of Twilight" },
  ];
  for (const piece of pieces) {
    const questId = `quest:bard-skyshrine-armor-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `Bard Skyshrine Armor Quests: ${piece.label}`,
      type: "quest",
      classes: ["bard"],
      description: `Trade an ${piece.base} plus ${piece.gem} to Umykith Fe\`Dhar at Skyshrine's Tower Top for the ${piece.reward}.`,
      steps: [`Gather an ${piece.base} and ${piece.gem}`, "Turn them in to Umykith Fe`Dhar at Skyshrine's Tower Top"],
      wiki_title: "Bard Skyshrine Armor Quests",
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
      classes: ["bard"],
      source: `Bard Skyshrine Armor Quests: ${piece.label} reward (Umykith Fe\`Dhar, Skyshrine)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
  addFactionReward("quest_group:bard-skyshrine-armor-quests", "Claws of Veeshan");
  addFactionReward("quest_group:bard-skyshrine-armor-quests", "Yelinak");
}

// ---------------------------------------------------------------------
// Bard Thurgadin Armor Quests (quest_group)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:thurgadin";
  const giverId = "npc:thurgadin:leifur";
  addGiver(giverId, "Leifur", zoneId);

  const groupId = "quest_group:bard-thurgadin-armor-quests";
  addNode({
    id: groupId,
    label: "Bard Thurgadin Armor Quests",
    type: "quest_group",
    description: "Leifur in Thurgadin trades a Corroded Plate armor piece plus 3 matching gems for its corresponding piece of Resonant armor. Seven independent sub-quests, no ordering between them.",
    classes: ["bard"],
    wiki_title: "Bard Thurgadin Armor Quests",
  });
  addEdge(giverId, groupId, "starts");
  addEdge(groupId, zoneId, "located_in");
  addFactionReward(groupId, "Coldain");
  addFactionReward(groupId, "Dain Frostreaver IV");

  const pieces: Array<{ label: string; base: string; gem: string; reward: string }> = [
    { label: "Helm", base: "Corroded Plate Helmet", gem: "3 Crushed Coral", reward: "Resonant Helm" },
    { label: "Breastplate", base: "Corroded Breastplate", gem: "3 Flawless Diamond", reward: "Resonant Breastplate" },
    { label: "Vambraces", base: "Corroded Plate Vambraces", gem: "3 Flawed Emerald", reward: "Resonant Vambraces" },
    { label: "Bracer", base: "Corroded Plate Bracer", gem: "3 Crushed Flame Emerald", reward: "Resonant Bracer" },
    { label: "Gauntlets", base: "Corroded Plate Gauntlets", gem: "3 Crushed Topaz", reward: "Resonant Gauntlets" },
    { label: "Greaves", base: "Corroded Plate Greaves", gem: "3 Flawed Sea Sapphire", reward: "Resonant Greaves" },
    { label: "Boots", base: "Corroded Plate Boots", gem: "3 Crushed Black Marble", reward: "Resonant Boots" },
  ];
  for (const piece of pieces) {
    const questId = `quest:bard-thurgadin-armor-${slug(piece.label)}`;
    addNode({
      id: questId,
      label: `Bard Thurgadin Armor Quests: ${piece.label}`,
      type: "quest",
      classes: ["bard"],
      description: `Trade a ${piece.base} plus ${piece.gem} to Leifur in Thurgadin for the ${piece.reward}.`,
      steps: [`Gather a ${piece.base} and ${piece.gem}`, "Turn them in to Leifur in Thurgadin"],
      wiki_title: "Bard Thurgadin Armor Quests",
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
      classes: ["bard"],
      source: `Bard Thurgadin Armor Quests: ${piece.label} reward (Leifur, Thurgadin)`,
    });
    addEdge(questId, rewardId, "rewards");
  }
}

// ---------------------------------------------------------------------
// Become PvP (Kaladim)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-kaladim";
  const giverId = "npc:south-kaladim:priest-of-discord";
  addGiver(giverId, "Priest of Discord", zoneId);

  const questId = "quest:become-pvp-kaladim";
  addNode({
    id: questId,
    label: "Become PvP (Kaladim)",
    type: "quest",
    description: "The Priest of Discord, outside South Kaladim's gate, trades a Tome of Order and Discord for PvP flagging -- the player's name renders red instead of blue and becomes vulnerable to other PvP players; beneficial spells from non-PvP players no longer apply. All classes.",
    minLevel: 1,
    steps: [
      "Hail the Priest of Discord outside South Kaladim",
      "Hand over a Tome of Order and Discord",
    ],
    wiki_title: "Become PvP (Kaladim)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const tomeId = "item:tome-of-order-and-discord";
  addNode({
    id: tomeId,
    label: "Tome of Order and Discord",
    type: "item",
    lore: true,
    weight: 0,
    size: "Tiny",
    source: "Become PvP (Kaladim) reward (Priest of Discord, South Kaladim)",
  });
  addEdge(questId, tomeId, "rewards");
}

// ---------------------------------------------------------------------
// Beta Neutral
// ---------------------------------------------------------------------
{
  const zoneId = "zone:neriak-3rd-gate";
  const giverId = "npc:neriak-3rd-gate:mizr-nmar";
  addGiver(giverId, "Mizr N`Mar", zoneId);

  const questId = "quest:beta-neutral";
  addNode({
    id: questId,
    label: "Beta Neutral",
    type: "quest",
    description: "Mizr N`Mar in Neriak Third Gate sells a Rune of Fortune for 50 gold, or Tarn Visilin accepts a cheaper Bloodstone, either way granting a Beta Neutral faction boost. Part of the Incandescent Mask quest chain. All classes.",
    minLevel: 1,
    steps: [
      "Buy a Rune of Fortune from Mizr N`Mar for 50 gold, or buy a Bloodstone near Merchant Edina and give it to Tarn Visilin",
    ],
    wiki_title: "Beta Neutral",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Beta Neutral");
}

// ---------------------------------------------------------------------
// Blackburrow Stout Delivery
// ---------------------------------------------------------------------
{
  const zoneId = "zone:qeynos-aqueducts";
  const highpassId = "zone:highpass-hold";
  const giverId = "npc:qeynos-aqueducts:commander-kane";
  addGiver(giverId, "Commander Kane", zoneId);
  const barnId = "npc:highpass-hold:barn-bloodstone";
  addGiver(barnId, "Barn Bloodstone", highpassId);

  const questId = "quest:blackburrow-stout-delivery";
  addNode({
    id: questId,
    label: "Blackburrow Stout Delivery",
    type: "quest",
    description: "Commander Kane, at the Shrine of Bertoxxulus in Qeynos Aqueducts, sends a Blackburrow Stout to Barn Bloodstone outside the Golden Rooster in Highpass Hold. Warmly faction with Barn Bloodstone is required (raisable via the Note for Janam and Note for Rebby quests); at lower standing he consumes the stout without paying out. Reward: Bayle List I. All classes.",
    minLevel: 1,
    steps: [
      "Receive a Blackburrow Stout from Commander Kane in Qeynos Aqueducts",
      "Deliver it to Barn Bloodstone outside the Golden Rooster in Highpass Hold",
    ],
    wiki_title: "Blackburrow Stout Delivery",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, highpassId, "located_in");

  const listId = "item:bayle-list-i";
  addNode({
    id: listId,
    label: "Bayle List I",
    type: "item",
    lore: true,
    weight: 0,
    size: "Tiny",
    source: "Blackburrow Stout Delivery reward (Barn Bloodstone, Highpass Hold)",
  });
  addEdge(questId, listId, "rewards");
}

// ---------------------------------------------------------------------
// Blackburrow Stout Shipment
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const qeynosHillsId = "zone:qeynos-hills";
  const giverId = "npc:south-qeynos:mcneal-jocub";
  addGiver(giverId, "McNeal Jocub", zoneId);

  const questId = "quest:blackburrow-stout-shipment";
  addNode({
    id: questId,
    label: "Blackburrow Stout Shipment",
    type: "quest",
    description: "McNeal Jocub, at Fish's Ale in South Qeynos, sends a tattered note to Gnasher Furgutt, a night-only gnoll spawn in Qeynos Hills; trading it for a Case of Blackburrow Stout and returning that to McNeal yields coin, double experience, a Black Burrow Stout, and faction with Circle of Unseen Hands, Corrupt Qeynos Guards, Kane Bayle, Karana Residents, Guards of Qeynos, Priests of Life, and Knights of Thunder. All classes.",
    minLevel: 1,
    steps: [
      "Speak with McNeal Jocub at Fish's Ale in South Qeynos",
      "Find Gnasher Furgutt in Qeynos Hills at night and present the tattered note",
      "Receive a Case of Blackburrow Stout",
      "Return the case to McNeal Jocub",
    ],
    wiki_title: "Blackburrow Stout Shipment",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, qeynosHillsId, "located_in");
  addFactionReward(questId, "Circle of Unseen Hands");
  addFactionReward(questId, "Corrupt Qeynos Guards");
  addFactionReward(questId, "Kane Bayle");
  addFactionReward(questId, "Karana Residents");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Priests of Life");
  addFactionReward(questId, "Knights of Thunder");

  const stoutId = "item:black-burrow-stout";
  addNode({
    id: stoutId,
    label: "Black Burrow Stout",
    type: "item",
    weight: 0.5,
    size: "Small",
    source: "Blackburrow Stout Shipment reward (McNeal Jocub, South Qeynos) -- a beverage",
  });
  addEdge(questId, stoutId, "rewards");
}

// ---------------------------------------------------------------------
// Bladed Weapons
// ---------------------------------------------------------------------
{
  const zoneId = "zone:greater-faydark";
  const giverId = "npc:greater-faydark:heartwood-master";
  addGiver(giverId, "The Heartwood Master", zoneId);

  const questId = "quest:bladed-weapons";
  addNode({
    id: questId,
    label: "Bladed Weapons",
    type: "quest",
    description: "The Heartwood Master in Kelethin (Greater Faydark), requiring Amiable faction or better, trades a Rusty Short Sword, Rusty Long Sword, Rusty Broad Sword, and Rusty Bastard Sword for a choice of a Tarnished Scimitar or a Worn Great Staff, 6 gold, faction with Soldiers of Tunare, King Tearis Thex, and Faydark's Champions, and experience. All classes.",
    minLevel: 1,
    steps: [
      "Gather a Rusty Short Sword, Rusty Long Sword, Rusty Broad Sword, and Rusty Bastard Sword",
      "Hand them to The Heartwood Master in Kelethin",
    ],
    wiki_title: "Bladed Weapons",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Soldiers of Tunare");
  addFactionReward(questId, "King Tearis Thex");
  addFactionReward(questId, "Faydark's Champions");
  addEdge(questId, "item:rusty-short-sword", "rewards");

  const scimitarId = "item:tarnished-scimitar";
  addNode({
    id: scimitarId,
    label: "Tarnished Scimitar",
    type: "item",
    slots: ["Primary"],
    skill: "1H Slashing",
    damage: 5,
    source: "Bladed Weapons reward choice (The Heartwood Master, Kelethin)",
  });
  addEdge(questId, scimitarId, "rewards");

  const staffId = "item:worn-great-staff";
  addNode({
    id: staffId,
    label: "Worn Great Staff",
    type: "item",
    slots: ["Primary"],
    skill: "2H Blunt",
    damage: 6,
    source: "Bladed Weapons reward choice (The Heartwood Master, Kelethin)",
  });
  addEdge(questId, staffId, "rewards");
}

// ---------------------------------------------------------------------
// Blood Ink (unsolved/broken -- no reward)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-cabilis";
  const giverId = "npc:east-cabilis:war-historian-kobl";
  addGiver(giverId, "War Historian Kobl", zoneId);

  const questId = "quest:blood-ink";
  addNode({
    id: questId,
    label: "Blood Ink",
    type: "quest",
    description: "War Historian Kobl, at the East Cabilis Warrior guild, asks for four blood globules -- from carnivorous plants, leeches, mosquitoes, and blood pit creatures in the Tower of Death -- to make Blood Ink. Faction gains with Legion of Cabilis, Cabilis Residents, Scaled Mystics, Crusaders of Greenmist, and Swift Tails are reported, but the exact reward remains unresolved/unsolved on eqlwiki.com as of the source page.",
    minLevel: 8,
    steps: [
      "Hail War Historian Kobl and ask about unique writing materials, then request Blood Ink",
      "Collect four blood globules from carnivorous plants, leeches, mosquitoes, and blood pit creatures in the Tower of Death",
      "Return the globules to War Historian Kobl",
    ],
    wiki_title: "Blood Ink",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:swamp-of-no-hope", "located_in");
  addFactionReward(questId, "Legion of Cabilis");
  addFactionReward(questId, "Cabilis Residents");
  addFactionReward(questId, "Scaled Mystics");
  addFactionReward(questId, "Crusaders of Greenmist");
  addFactionReward(questId, "Swift Tails");
}

// ---------------------------------------------------------------------
// Bloodboil Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:lesser-faydark";
  const giverId = "npc:lesser-faydark:talisyn-stormwing";
  addGiver(giverId, "Talisyn Stormwing", zoneId);

  const questId = "quest:bloodboil-quest";
  addNode({
    id: questId,
    label: "Bloodboil Quest",
    type: "quest",
    description: "Talisyn Stormwing in Lesser Faydark asks the player to pledge assistance, then bring proof of defeating Bloodboil, an undead sprite leader spawning in the mushroom area, for the Emerald Cloak of the Faydark. All classes.",
    minLevel: 20,
    steps: [
      "Speak with Talisyn Stormwing in Lesser Faydark and pledge assistance",
      "Kill Bloodboil in the mushroom area for his wing",
      "Return the wing to Talisyn Stormwing",
    ],
    wiki_title: "Bloodboil Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const cloakId = "item:emerald-cloak-of-the-faydark";
  addNode({
    id: cloakId,
    label: "Emerald Cloak of the Faydark",
    type: "item",
    slots: ["Back"],
    magic: true,
    lore: true,
    ac: 5,
    stats: { cha: 10, hp: 25, mana: 25 },
    effect: "SV Disease, SV Poison; Fay Gate",
    source: "Bloodboil Quest reward (Talisyn Stormwing, Lesser Faydark)",
  });
  addEdge(questId, cloakId, "rewards");
}

// ---------------------------------------------------------------------
// Bone Chips Quests (compressed -- 9 city variants, same mechanic)
// ---------------------------------------------------------------------
{
  const questId = "quest:bone-chips-quests";
  addNode({
    id: questId,
    label: "Bone Chips Quests",
    type: "quest",
    description: "A repeatable city/guard faction turn-in offered by multiple NPCs across many cities -- Cabilis, Erudin, Felwithe, Freeport, Grobb, Kaladim, Qeynos, and Neriak Commons -- each accepting four unstacked Bone Chips (Lashun Novashine in Qeynos accepts two; some use container-based systems) for faction, experience, and occasionally coin or a rusty weapon. eqlwiki.com presents this as one shared mechanic across nine NPC variants rather than nine independently detailed quest pages. All classes.",
    minLevel: 1,
    steps: [
      "Kill for Bone Chips",
      "Turn in four unstacked Bone Chips (two for Lashun Novashine in Qeynos) to a city's Bone Chips NPC for faction and experience",
    ],
    wiki_title: "Bone Chips Quests",
  });
  addEdge(questId, "zone:east-cabilis", "located_in");
  addEdge(questId, "zone:erudin", "located_in");
  addEdge(questId, "zone:felwithe", "located_in");
  addEdge(questId, "zone:grobb", "located_in");
  addEdge(questId, "zone:north-kaladim", "located_in");
  addEdge(questId, "zone:neriak-commons", "located_in");
}

// ---------------------------------------------------------------------
// Boysenberry Pie Quest (unsolved/broken -- no reward)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:skyshrine";
  const giverId = "npc:skyshrine:sentry-emil";
  addGiver(giverId, "Sentry Emil", zoneId);

  const questId = "quest:boysenberry-pie-quest";
  addNode({
    id: questId,
    label: "Boysenberry Pie Quest",
    type: "quest",
    description: "Sentry Emil in Skyshrine asks the player to prove their intentions by retrieving a boysenberry pie from Grudash the Baker (or Ruru the Cook) in the galley and returning it. eqlwiki.com states this quest was confirmed by the developers as never fully implemented -- no reward exists. All classes.",
    minLevel: 0,
    steps: [
      "Hail Sentry Emil in Skyshrine and offer to prove your intentions",
      "Visit Grudash the Baker in the galley and request a boysenberry pie",
      "Return the pie to Sentry Emil",
    ],
    wiki_title: "Boysenberry Pie Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Brain Bite (Evil)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:the-overthere";
  const giverId = "npc:the-overthere:dyth-xteria";
  addGiver(giverId, "Dyth X`Teria", zoneId);

  const questId = "quest:brain-bite-evil";
  addNode({
    id: questId,
    label: "Brain Bite (Evil)",
    type: "quest",
    classes: ["wizard"],
    description: "Dyth X`Teria, at the OT outpost's northern building in The Overthere, trades a Peridot, Onyx, and Star Rose Quartz for three ornate bottles (Hampton, Mardon, Ryla); each is delivered to a skeleton at a specific location -- Hampton's to Trakanon's Teeth, Mardon's to a reaver tower in City of Mist, Ryla's to a jail cell in Karnor's Castle. Returning three Bottles of Swirling Smoke yields the Scroll of Brain Bite and faction with Venril Sathir. Wizard only.",
    minLevel: 37,
    steps: [
      "Give a Peridot, Onyx, and Star Rose Quartz to Dyth X`Teria for three ornate bottles",
      "Deliver Hampton's bottle to a skeleton in Trakanon's Teeth",
      "Deliver Mardon's bottle to a skeleton in the City of Mist reaver tower",
      "Deliver Ryla's bottle to a skeleton in Karnor's Castle's jail cell",
      "Return three Bottles of Swirling Smoke to Dyth X`Teria",
    ],
    wiki_title: "Brain Bite (Evil)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, trakanonsTeethId, "located_in");
  addEdge(questId, cityOfMistId, "located_in");
  addEdge(questId, karnorsCastleId, "located_in");
  addFactionReward(questId, "Venril Sathir");
  addEdge(questId, brainBiteSpellId, "rewards");
}

// ---------------------------------------------------------------------
// Brain Bite (Good)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:firiona-vie";
  const giverId = "npc:firiona-vie:despondo";
  addGiver(giverId, "Despondo", zoneId);

  const questId = "quest:brain-bite-good";
  addNode({
    id: questId,
    label: "Brain Bite (Good)",
    type: "quest",
    classes: ["wizard"],
    description: "Despondo in Firiona Vie trades a Peridot, Onyx, and Star Rose Quartz for three bottles of entrapment, each delivered to a skeletal NPC across Kunark -- Hampton's to Trakanon's Teeth, Ryla's to Karnor's Castle's jail cell, Mardon's to City of Mist (both requiring a charm). Returning three soul bottles yields the Scroll of Brain Bite, faction with Inhabitants of Firiona Vie, Emerald Warriors, and Storm Guard. Wizard only.",
    minLevel: 37,
    steps: [
      "Give a Peridot, Onyx, and Star Rose Quartz to Despondo for three bottles of entrapment",
      "Deliver Hampton's bottle to Trakanon's Teeth",
      "Deliver Ryla's bottle to Karnor's Castle's jail cell (requires a charm)",
      "Deliver Mardon's bottle to City of Mist (requires a charm)",
      "Return three soul bottles to Despondo",
    ],
    wiki_title: "Brain Bite (Good)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, trakanonsTeethId, "located_in");
  addEdge(questId, cityOfMistId, "located_in");
  addEdge(questId, karnorsCastleId, "located_in");
  addFactionReward(questId, "Inhabitants of Firiona Vie");
  addFactionReward(questId, "Emerald Warriors");
  addFactionReward(questId, "Storm Guard");
  addEdge(questId, brainBiteSpellId, "rewards");
}

// ---------------------------------------------------------------------
// Bread Shipment Quests (compressed -- ~10 city variants, same mechanic)
// ---------------------------------------------------------------------
{
  const questId = "quest:bread-shipment-quests";
  addNode({
    id: questId,
    label: "Bread Shipment Quests",
    type: "quest",
    description: "A repeatable Velious-era faction turn-in: kill sporalis inside Runnyeye Citadel for a Bag of Bread Loaves, then hand it to an Innkeeper or Merchant in the city you're building faction with -- Karn Tassen in Qeynos, Sal Drana in Neriak, Innkeep Morpa in Oggok, and similar NPCs in the Feerrott, North/West Karana, Halas, Kaladim, Kelethin, and Erudin -- for experience, faction, and a small amount of coin. eqlwiki.com presents this as one shared mechanic across roughly ten city variants rather than independently detailed quest pages. All classes.",
    minLevel: 1,
    steps: [
      "Kill sporalis in Runnyeye Citadel for a Bag of Bread Loaves",
      "Hand the bag to that city's Innkeeper or Merchant for faction and experience",
    ],
    wiki_title: "Bread Shipment Quests",
  });
  addEdge(questId, "zone:runnyeye-citadel", "located_in");
  addEdge(questId, "zone:south-qeynos", "located_in");
  addEdge(questId, "zone:neriak-commons", "located_in");
  addEdge(questId, "zone:oggok", "located_in");
  addEdge(questId, "zone:the-feerrott", "located_in");
  addEdge(questId, "zone:halas", "located_in");
  addEdge(questId, "zone:north-kaladim", "located_in");
  addEdge(questId, "zone:greater-faydark", "located_in");
  addEdge(questId, "zone:erudin", "located_in");
}

// ---------------------------------------------------------------------
// Bulthar Trunks
// ---------------------------------------------------------------------
{
  const zoneId = "zone:cobalt-scar";
  const giverId = "npc:cobalt-scar:chief-kalan";
  addGiver(giverId, "Chief Kalan", zoneId);

  const questId = "quest:bulthar-trunks";
  addNode({
    id: questId,
    label: "Bulthar Trunks",
    type: "quest",
    description: "Chief Kalan in Cobalt Scar asks for help defending Othmir territory against the Bulthar. Two regular Bulthar Trunks trade for a random rare gem or vendor jewelry; a rare Bulthar Herdleader Trunk trades for the Runed Othmir Spear. Indifferent faction or better is required -- at Apprehensive he consumes the trunks without paying out. Ranger, Shadow Knight, Shaman, or Warrior.",
    classes: ["ranger", "shadow knight", "shaman", "warrior"],
    minLevel: 50,
    steps: [
      "Hail Chief Kalan and agree to aid the Othmir warriors against the Bulthar",
      "Kill Bulthar for regular Bulthar Trunks, or the herd leader for a Bulthar Herdleader Trunk",
      "Turn the trunks in to Chief Kalan",
    ],
    wiki_title: "Bulthar Trunks",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Othmir");

  const spearId = "item:runed-othmir-spear";
  addNode({
    id: spearId,
    label: "Runed Othmir Spear",
    type: "item",
    slots: ["Primary", "Secondary"],
    classes: ["ranger", "shadow knight", "shaman", "warrior"],
    magic: true,
    skill: "2H Piercing",
    stats: { int: 5, mana: 10 },
    source: "Bulthar Trunks reward (Chief Kalan, Cobalt Scar) -- for a Bulthar Herdleader Trunk",
  });
  addEdge(questId, spearId, "rewards");
}

// ---------------------------------------------------------------------
// Burnished Wooden Staff Quest
// ---------------------------------------------------------------------
{
  const zoneId = warsliksWoodsId;
  const giverId = "npc:warsliks-woods:ssolet-dnaas";
  addGiver(giverId, "Ssolet Dnaas", zoneId);

  const questId = "quest:burnished-wooden-staff-quest";
  addNode({
    id: questId,
    label: "Burnished Wooden Staff Quest",
    type: "quest",
    description: "Ssolet Dnaas, on a small island in Warsliks Woods, is searching for a burnished wooden staff dropped by sarnak reanimated mobs in Chardok. Trading him the Burnished Wooden Stave yields the Top Shard of the Obulus Medallion. Apprehensive faction or better works; Ssolet is aggro to non-Iksar races. All classes.",
    minLevel: 45,
    steps: [
      "Hail Ssolet Dnaas in Warsliks Woods and discuss his search for the burnished wooden staff",
      "Kill sarnak reanimated mobs in Chardok for a Burnished Wooden Stave",
      "Trade the stave to Ssolet Dnaas",
    ],
    wiki_title: "Burnished Wooden Staff Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "zone:chardok", "located_in");

  const shardId = "item:top-shard-of-the-obulus-medallion";
  addNode({
    id: shardId,
    label: "Top Shard of the Obulus Medallion",
    type: "item",
    lore: true,
    source: "Burnished Wooden Staff Quest reward (Ssolet Dnaas, Warsliks Woods)",
  });
  addEdge(questId, shardId, "rewards");
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 062 complete: added 25 more quests from GitHub issue #26's checklist");
