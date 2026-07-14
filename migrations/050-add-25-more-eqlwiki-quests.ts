/**
 * Migration 050: 25 more quests off GitHub issue #26's checklist -- the
 * rest of the G section (Goblin Caster Necklace, Goblin Raiders, Going
 * Postal, Going Postal (Felwithe to Kelethin), Going Postal (Kaladim to
 * Kelethin), Granite Pebbles, Greenblood Shadowknight Tunic, Greenblood
 * Tunics, Grim's Tiger Revenge, Groflah Steadirt's Death, Guard Shilster's
 * Stout), plus a first pass into the ~90-entry "Guild Summons" cluster
 * (Emerald Warriors, Jaggedpine Treefolk, Rogues of the White Rose, Wolves
 * of the North, Shamen of Justice, The Fell Blade, Gemchopper Hall, Temple
 * of Life Cleric/Paladin, Temple of Thunder Cleric/Paladin, Stormguard,
 * Priests of Innoruuk, Songweavers). Researched directly against
 * eqlwiki.com, following decisions/eqlwiki-quest-research-method.md.
 *
 * Every Guild Summons quest turns out to be the same shape: a new
 * character of a given class/race gets a tattered note (or receives one
 * from a starting guildmaster) directing them to their own guild's NPC,
 * who takes the note and hands back a starter tunic -- same mechanic
 * migration 040's "Abbey of Deep Musing Cleric/Rogue" already modeled.
 * Picked this batch's 14 entries for existing-zone coverage (several
 * guild names map to zones/NPCs already in the graph -- Regren/Emerald
 * Warriors and Baxok Curhunter/Gemchopper Hall are the *same* NPCs already
 * modeled as quest-givers elsewhere, reused directly). The other ~76
 * entries are left for a dedicated follow-up batch, not crammed in here
 * past the issue's 25-quest cap.
 *
 * Going Postal (Felwithe to Kelethin) states its own era directly on the
 * page ("Out of Era (Kunark Era)") -- unlike every zone-inherited outOfEra
 * flag added in migration 049, this one is a real quest.era value, same as
 * decisions/quest-era-flagging.md's original intent.
 *
 * Skipped this pass: Gretta's Baking Supplies Quest -- its own page states
 * "THIS QUEST IS NO LONGER IN GAME," matching the confirmed-non-functional
 * precedent (migration 040's Bloodboil Quest). Guard of Ik Quest -- one of
 * its two required turn-in items only drops in the City of Mist, which
 * doesn't exist in this graph; not just a farming stop, the same "core
 * requirement in a missing zone" bar as migration 045's Dain's Head.
 *
 * Deliberately NOT modeled:
 * - Every vague/unnamed reward (Goblin Raiders' "Minor Items", Greenblood
 *   Tunics' "Rusty Weapons") -- consistent with every migration so far.
 * - Guild Summons - Wolves of the North's faction rewards -- the page's
 *   own faction list (Rogues of the White Rose, Shadowed Men, Merchants of
 *   Halas, Steel Warriors) doesn't include the guild's own namesake
 *   faction and reads inconsistently with every other Guild Summons page
 *   checked this batch; left unmodeled rather than guess which are
 *   actually positive.
 * - Race requirements throughout (Black Shadow Tunic's Ogre-only, Blood
 *   Splattered Tunic's Erudite-only, etc.) -- no race field on `item`/
 *   `quest`, noted in `description` prose only where stated.
 * - Prerequisite quests still open on the issue's own checklist (Greenblood
 *   Tunics' "Guild Summons - Murdunk's Palace" x3) -- left as prose in
 *   `steps`, same reasoning as every earlier migration's open-prerequisite
 *   handling.
 * - Coin rewards and negative faction changes -- consistent with every
 *   migration so far (decisions/quest-reward-modeling.md).
 *
 * Guild Summons - Temple of Life Paladin/Temple of Thunder Cleric+Paladin
 * reuse the exact same reward item as their Cleric/Paladin counterpart
 * (same name, same stats, same page-quoted line) rather than creating a
 * near-duplicate node.
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
// Goblin Caster Necklace
// ---------------------------------------------------------------------
{
  const zoneId = "zone:halas";
  const everfrostId = "zone:everfrost-peaks";
  const giverId = "npc:halas:shamus-felligan";
  addGiver(giverId, "Shamus Felligan", zoneId);

  const questId = "quest:goblin-caster-necklace";
  addNode({
    id: questId,
    label: "Goblin Caster Necklace",
    type: "quest",
    description: "Shamus Felligan, outside the Shaman's guild in Halas, requiring Amiable or better faction, trades Caster Beads from Ice Goblin Casters in Everfrost Peaks for a weapon.",
    classes: ["shaman"],
    minLevel: 5,
    steps: ["Tell Shamus Felligan \"I will hunt the goblin casters\"", "Hunt Ice Goblin Casters in Everfrost Peaks for Caster Beads", "Return the beads to Shamus"],
    wiki_title: "Goblin Caster Necklace",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, everfrostId, "located_in");

  const gavelId = "item:gavel-of-justice";
  addNode({
    id: gavelId,
    label: "Gavel of Justice",
    type: "item",
    slots: ["Range", "Primary", "Secondary"],
    classes: ["shaman"],
    skill: "1H Blunt",
    damage: 5,
    delay: 34,
    mana: 5,
    weight: 7.5,
    magic: true,
    lore: true,
    source: "Goblin Caster Necklace reward (Shamus Felligan, Halas)",
  });
  addEdge(questId, gavelId, "rewards");
  addFactionReward(questId, "Merchants of Halas");
  addFactionReward(questId, "Shamen of Justice");
}

// ---------------------------------------------------------------------
// Goblin Raiders
// ---------------------------------------------------------------------
{
  const zoneId = "zone:firiona-vie";
  const giverId = "npc:firiona-vie:captain-keatar";
  addGiver(giverId, "Captain Keatar", zoneId);

  const questId = "quest:goblin-raiders";
  addNode({
    id: questId,
    label: "Goblin Raiders",
    type: "quest",
    description: "Captain Keatar, at the Ranger guild building in Firiona Vie, trades four Red Headbands from goblin raiders for minor rewards -- must be turned in all at once or he eats them. A prerequisite for Goblin Battlemasters.",
    minLevel: 25,
    steps: ["Hunt goblin raiders for Red Headbands", "Turn in all four Red Headbands to Captain Keatar at once"],
    wiki_title: "Goblin Raiders",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Inhabitants of Firiona Vie");
  addFactionReward(questId, "Emerald Warriors");
  addFactionReward(questId, "Storm Guard");
}

// ---------------------------------------------------------------------
// Going Postal / Going Postal (Felwithe to Kelethin) / Going Postal (Kaladim to Kelethin)
// (each delivers a Bardic Letter to Jakum Webdancer, Kelethin Bard Guild)
// ---------------------------------------------------------------------
{
  const kelethinId = "zone:greater-faydark";

  {
    const zoneId = "zone:ak-anon";
    const giverId = "npc:ak-anon:lyra-lyrestringer";
    addGiver(giverId, "Lyra Lyrestringer", zoneId);

    const questId = "quest:going-postal";
    addNode({
      id: questId,
      label: "Going Postal",
      type: "quest",
      description: "Lyra Lyrestringer in Ak'Anon hands out a Bardic Letter (Kelethin) to deliver to Jakum Webdancer at the Kelethin Bard Guild hall.",
      minLevel: 1,
      steps: ["Receive a Bardic Letter (Kelethin) from Lyra Lyrestringer", "Deliver it to Jakum Webdancer in Kelethin"],
      wiki_title: "Going Postal",
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, kelethinId, "located_in");
    addFactionReward(questId, "League of Antonican Bards");
    addFactionReward(questId, "Knights of Truth");
    addFactionReward(questId, "Guards of Qeynos");
  }

  {
    const zoneId = "zone:northern-felwithe";
    const giverId = "npc:northern-felwithe:tacar-tissleplay";
    addGiver(giverId, "Tacar Tissleplay", zoneId);

    const questId = "quest:going-postal-felwithe-to-kelethin";
    addNode({
      id: questId,
      label: "Going Postal (Felwithe to Kelethin)",
      type: "quest",
      description: "Tacar Tissleplay, outside Faydark's Bane in Northern Felwithe, hands out a Bardic Letter (Kelethin) to deliver to Jakum Webdancer at the Kelethin Bard Guild hall.",
      minLevel: 1,
      era: "Kunark",
      steps: ["Receive a Bardic Letter (Kelethin) from Tacar Tissleplay", "Deliver it to Jakum Webdancer in Kelethin"],
      wiki_title: "Going Postal (Felwithe to Kelethin)",
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, kelethinId, "located_in");
    addFactionReward(questId, "League of Antonican Bards");
    addFactionReward(questId, "Knights of Truth");
    addFactionReward(questId, "Guards of Qeynos");
  }

  {
    const zoneId = "zone:south-kaladim";
    const giverId = "npc:south-kaladim:kilam-oresinger";
    addGiver(giverId, "Kilam Oresinger", zoneId);

    const questId = "quest:going-postal-kaladim-to-kelethin";
    addNode({
      id: questId,
      label: "Going Postal (Kaladim to Kelethin)",
      type: "quest",
      description: "Kilam Oresinger, outside Pub Kal in South Kaladim, hands out a Bardic Letter (Kelethin) to deliver to Jakum Webdancer at the Kelethin Bard Guild hall.",
      minLevel: 1,
      steps: ["Receive a Bardic Letter (Kelethin) from Kilam Oresinger", "Deliver it to Jakum Webdancer in Kelethin"],
      wiki_title: "Going Postal (Kaladim to Kelethin)",
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, kelethinId, "located_in");
    addFactionReward(questId, "League of Antonican Bards");
    addFactionReward(questId, "Knights of Truth");
    addFactionReward(questId, "Guards of Qeynos");
  }
}

// ---------------------------------------------------------------------
// Granite Pebbles
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-cabilis";
  const swampId = "zone:swamp-of-no-hope";
  const giverId = "npc:east-cabilis:the-toilmaster";
  addGiver(giverId, "The Toilmaster", zoneId);

  const questId = "quest:granite-pebbles";
  addNode({
    id: questId,
    label: "Granite Pebbles",
    type: "quest",
    description: "The Toilmaster in East Cabilis trades 2 Busted Shackles, dropped by escaped frogloks in the Swamp of No Hope, for a curio.",
    minLevel: 3,
    steps: ["Collect 2 Busted Shackles from escaped frogloks in the Swamp of No Hope", "Hand them to The Toilmaster"],
    wiki_title: "Granite Pebbles",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, swampId, "located_in");

  const pebblesId = "item:pile-of-granite-pebbles";
  addNode({ id: pebblesId, label: "Pile of Granite Pebbles", type: "item", weight: 0.1, size: "Tiny", source: "Granite Pebbles reward (The Toilmaster, East Cabilis)" });
  addEdge(questId, pebblesId, "rewards");
  addFactionReward(questId, "Legion of Cabilis");
  addFactionReward(questId, "Cabilis Residents");
  addFactionReward(questId, "Scaled Mystics");
  addFactionReward(questId, "Crusaders Of Greenmist");
  addFactionReward(questId, "Swift Tails");
}

// ---------------------------------------------------------------------
// Greenblood Shadowknight Tunic / Greenblood Tunics
// ---------------------------------------------------------------------
{
  const oggokId = "zone:oggok";
  const feerrottId = "zone:the-feerrott";
  const giverId = "npc:oggok:bonlarg";
  addGiver(giverId, "Bonlarg", oggokId);

  const questId = "quest:greenblood-shadowknight-tunic";
  addNode({
    id: questId,
    label: "Greenblood Shadowknight Tunic",
    type: "quest",
    description: "Bonlarg, at the Greenblood Shadow Knight Guild in Oggok, requiring Amiable or better faction, trades 3 Lizardman Scout Fife (from Lizard Scouts in The Feerrott) and your original guild tunic for a Black Shadow Tunic. Multiquestable.",
    classes: ["shadow knight"],
    minLevel: 3,
    steps: ["Collect 3 Lizardman Scout Fife from Lizard Scouts in The Feerrott", "Give them and your original guild tunic to Bonlarg"],
    wiki_title: "Greenblood Shadowknight Tunic",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, oggokId, "starts_in");
  addEdge(questId, oggokId, "located_in");
  addEdge(questId, feerrottId, "located_in");

  const tunicId = "item:black-shadow-tunic";
  addNode({
    id: tunicId,
    label: "Black Shadow Tunic",
    type: "item",
    slots: ["Chest"],
    classes: ["shadow knight"],
    ac: 6,
    stats: { int: 1 },
    resists: { poison: 1 },
    weight: 9.0,
    size: "Medium",
    magic: true,
    source: "Greenblood Shadowknight Tunic reward (Bonlarg, Oggok)",
  });
  addEdge(questId, tunicId, "rewards");

  const grobbId = "zone:grobb";
  const treskarId = "npc:grobb:treskar";
  addGiver(treskarId, "Treskar", grobbId);

  const tunicsQuestId = "quest:greenblood-tunics";
  addNode({
    id: tunicsQuestId,
    label: "Greenblood Tunics",
    type: "quest",
    description: "Treskar, in the Shadowknights Guild in Grobb, wants 3 Black Shadow Tunics -- each obtained by completing the Guild Summons - Murdunk's Palace quest on a different Ogre, then finishing Greenblood Shadowknight Tunic.",
    classes: ["warrior", "cleric", "shadow knight", "rogue", "shaman", "wizard", "necromancer", "magician", "enchanter"],
    minLevel: 10,
    steps: [
      "Complete the Guild Summons - Murdunk's Palace quest on 3 different Ogres",
      "Complete Greenblood Shadowknight Tunic 3 times to obtain 3 Black Shadow Tunics",
      "Deliver all 3 tunics to Treskar",
    ],
    wiki_title: "Greenblood Tunics",
  });
  addEdge(treskarId, tunicsQuestId, "starts");
  addEdge(tunicsQuestId, grobbId, "starts_in");
  addEdge(tunicsQuestId, grobbId, "located_in");
  addFactionReward(tunicsQuestId, "Shadowknights of Night Keep");
  addFactionReward(tunicsQuestId, "DaBashers");
}

// ---------------------------------------------------------------------
// Grim's Tiger Revenge
// ---------------------------------------------------------------------
{
  const zoneId = "zone:kithicor-forest";
  const giverId = "npc:kithicor-forest:grim-oakfist";
  addGiver(giverId, "Grim Oakfist", zoneId);

  const questId = "quest:grims-tiger-revenge";
  addNode({
    id: questId,
    label: "Grim's Tiger Revenge",
    type: "quest",
    description: "Grim Oakfist, at the first inn on the path into Kithicor Forest, requiring Amiable or better faction, trades three named tigers' pelts (from Eenot, Reggit, and Kobb) for a necklace.",
    classes: ["monk"],
    minLevel: 25,
    steps: ["Collect an Unusual Tiger Pelt from Eenot, a Peculiar Tiger Pelt from Reggit, and a Strange Tiger Pelt from Kobb", "Return all three pelts to Grim Oakfist"],
    wiki_title: "Grim's Tiger Revenge",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const collarId = "item:collar-of-neshika";
  addNode({
    id: collarId,
    label: "Collar of Neshika",
    type: "item",
    slots: ["Neck"],
    classes: ["monk"],
    ac: 4,
    stats: { sta: 9 },
    weight: 1.5,
    size: "Small",
    source: "Grim's Tiger Revenge reward (Grim Oakfist, Kithicor Forest)",
  });
  addEdge(questId, collarId, "rewards");
}

// ---------------------------------------------------------------------
// Groflah Steadirt's Death
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-freeport";
  const giverId = "npc:east-freeport:netuk-phenzon";
  addGiver(giverId, "Netuk Phenzon", zoneId);

  const questId = "quest:groflah-steadirts-death";
  addNode({
    id: questId,
    label: "Groflah Steadirt's Death",
    type: "quest",
    description: "Netuk Phenzon in East Freeport sends players after Groflah for a Tattered Flier, rewarding the Siphon Strength spell.",
    minLevel: 15,
    steps: ["Kill Groflah and loot the Tattered Flier from his corpse", "Return the flier to Netuk Phenzon in East Freeport"],
    wiki_title: "Groflah Steadirt's Death",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "spell:siphon-strength", "rewards");
  addFactionReward(questId, "Dismal Rage");
  addFactionReward(questId, "Opal Dark Briar");
}

// ---------------------------------------------------------------------
// Guard Shilster's Stout
// ---------------------------------------------------------------------
{
  const zoneId = "zone:northern-karana";
  const giverId = "npc:northern-karana:guard-shilster";
  addGiver(giverId, "Guard Shilster", zoneId);

  const questId = "quest:guard-shilsters-stout";
  addNode({
    id: questId,
    label: "Guard Shilster's Stout",
    type: "quest",
    description: "Guard Shilster, in the northeast corner of Northern Karana, trades 5 gold pieces for a stout.",
    minLevel: 1,
    steps: ["Hail Guard Shilster in northeast Northern Karana", "Hand him 5 gold pieces"],
    wiki_title: "Guard Shilster's Stout",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const stoutId = "item:black-burrow-stout";
  addNode({ id: stoutId, label: "Black Burrow Stout", type: "item", weight: 0.4, size: "Small", source: "Guard Shilster's Stout reward (Guard Shilster, Northern Karana)" });
  addEdge(questId, stoutId, "rewards");
  addFactionReward(questId, "Bloodsabers");
  addFactionReward(questId, "Corrupt Qeynos Guards");
  addFactionReward(questId, "Kane Bayle");
  addFactionReward(questId, "Circle Of Unseen Hands");
}

// ---------------------------------------------------------------------
// Guild Summons - Emerald Warriors
// ---------------------------------------------------------------------
{
  const zoneId = "zone:greater-faydark";
  const giverId = "npc:greater-faydark:regren";
  addGiver(giverId, "Regren", zoneId);

  const questId = "quest:guild-summons-emerald-warriors";
  addNode({
    id: questId,
    label: "Guild Summons - Emerald Warriors",
    type: "quest",
    description: "A new Warrior of the Emerald Warriors Guild in Kelethin hands a Recruitment Letter to Regren for a guild tunic.",
    classes: ["warrior"],
    minLevel: 1,
    steps: ["Receive a Recruitment Letter", "Hand the letter to Regren at the Emerald Warriors Guild Hall"],
    wiki_title: "Guild Summons - Emerald Warriors",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const tunicId = "item:old-green-tunic";
  addNode({ id: tunicId, label: "Old Green Tunic", type: "item", slots: ["Chest"], classes: ["warrior"], ac: 3, weight: 1.5, source: "Guild Summons - Emerald Warriors reward (Regren, Kelethin)" });
  addEdge(questId, tunicId, "rewards");
  addFactionReward(questId, "Emerald Warriors");
}

// ---------------------------------------------------------------------
// Guild Summons - Jaggedpine Treefolk
// ---------------------------------------------------------------------
{
  const zoneId = "zone:surefall-glade";
  const giverId = "npc:surefall-glade:teanara";
  addGiver(giverId, "Te`Anara", zoneId);

  const questId = "quest:guild-summons-jaggedpine-treefolk";
  addNode({
    id: questId,
    label: "Guild Summons - Jaggedpine Treefolk",
    type: "quest",
    description: "A new Druid of the Jaggedpine Treefolk Guild hands a tattered note to Te`Anara at the Guild Tree in Surefall Glade.",
    classes: ["druid"],
    minLevel: 1,
    steps: ["Hail Te`Anara at the Jaggedpine Treefolk Guild Tree", "Hand her a tattered note"],
    wiki_title: "Guild Summons - Jaggedpine Treefolk",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const tunicId = "item:dried-grass-tunic";
  addNode({ id: tunicId, label: "Dried Grass Tunic", type: "item", slots: ["Chest"], classes: ["druid"], ac: 2, weight: 0.7, size: "Medium", lore: true, source: "Guild Summons - Jaggedpine Treefolk reward (Te`Anara, Surefall Glade)" });
  addEdge(questId, tunicId, "rewards");
  addFactionReward(questId, "Jaggedpine Treefolk");
}

// ---------------------------------------------------------------------
// Guild Summons - Rogues of the White Rose
// ---------------------------------------------------------------------
{
  const zoneId = "zone:halas";
  const giverId = "npc:halas:dun-mcdowell";
  addGiver(giverId, "Dun McDowell", zoneId);

  const questId = "quest:guild-summons-rogues-of-the-white-rose";
  addNode({
    id: questId,
    label: "Guild Summons - Rogues of the White Rose",
    type: "quest",
    description: "A new Barbarian Rogue receives a tattered note directing them to Dun McDowell, behind Cappi's near the Halas docks.",
    classes: ["rogue"],
    minLevel: 1,
    steps: ["Find Dun McDowell behind Cappi's near the docks", "Hand him the tattered note"],
    wiki_title: "Guild Summons - Rogues of the White Rose",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const tunicId = "item:torn-white-tunic";
  addNode({ id: tunicId, label: "Torn White Tunic", type: "item", slots: ["Chest"], classes: ["rogue"], ac: 2, weight: 0.8, size: "Medium", source: "Guild Summons - Rogues of the White Rose reward (Dun McDowell, Halas)" });
  addEdge(questId, tunicId, "rewards");
  addFactionReward(questId, "Rogues of the White Rose");
}

// ---------------------------------------------------------------------
// Guild Summons - Wolves of the North
// ---------------------------------------------------------------------
{
  const zoneId = "zone:halas";
  const giverId = "npc:halas:kylan-odanos";
  addGiver(giverId, "Kylan O'Danos", zoneId);

  const questId = "quest:guild-summons-wolves-of-the-north";
  addNode({
    id: questId,
    label: "Guild Summons - Wolves of the North",
    type: "quest",
    description: "A new Barbarian Warrior receives a tattered note directing them to Kylan O'Danos at the Pit of Doom in Halas.",
    classes: ["warrior"],
    minLevel: 1,
    steps: ["Take the tattered note to Kylan O'Danos at the Pit of Doom", "Hand him the note"],
    wiki_title: "Guild Summons - Wolves of the North",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const tunicId = "item:patched-fur-tunic";
  addNode({ id: tunicId, label: "Patched Fur Tunic", type: "item", slots: ["Chest"], classes: ["warrior"], ac: 3, weight: 1.0, source: "Guild Summons - Wolves of the North reward (Kylan O'Danos, Halas)" });
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Shamen of Justice
// ---------------------------------------------------------------------
{
  const zoneId = "zone:halas";
  const giverId = "npc:halas:margyn-mccann";
  addGiver(giverId, "Margyn McCann", zoneId);

  const questId = "quest:guild-summons-shamen-of-justice";
  addNode({
    id: questId,
    label: "Guild Summons - Shamen of Justice",
    type: "quest",
    description: "A new Barbarian Shaman receives a tattered note directing them to High Priestess Margyn McCann at the Church of the Tribunal in Halas.",
    classes: ["shaman"],
    minLevel: 1,
    steps: ["Find High Priestess Margyn McCann at the Church of the Tribunal", "Hand her the tattered note"],
    wiki_title: "Guild Summons - Shamen of Justice",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const tunicId = "item:faded-blue-tunic";
  addNode({ id: tunicId, label: "Faded Blue Tunic", type: "item", slots: ["Chest"], classes: ["shaman"], ac: 2, weight: 0.8, size: "Medium", lore: true, source: "Guild Summons - Shamen of Justice reward (Margyn McCann, Halas)" });
  addEdge(questId, tunicId, "rewards");
  addFactionReward(questId, "Shamen of Justice");
}

// ---------------------------------------------------------------------
// Guild Summons - The Fell Blade
// ---------------------------------------------------------------------
{
  const zoneId = "zone:paineel";
  const giverId = "npc:paineel:mandaril-dark-knife";
  addGiver(giverId, "Mandaril Dark Knife", zoneId);

  const questId = "quest:guild-summons-the-fell-blade";
  addNode({
    id: questId,
    label: "Guild Summons - The Fell Blade",
    type: "quest",
    description: "A new Shadow Knight of The Fell Blade guild in Paineel receives a Fell Blade Guild Note, routed through Sern Adolia at the Tabernacle of Terror, to hand to Mandaril Dark Knife.",
    classes: ["shadow knight"],
    minLevel: 1,
    steps: ["Receive the Fell Blade Guild Note", "Take it to Sern Adolia at the Tabernacle of Terror", "Hail and hand the note to Mandaril Dark Knife"],
    wiki_title: "Guild Summons - The Fell Blade",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const tunicId = "item:blood-splattered-tunic";
  addNode({ id: tunicId, label: "Blood Splattered Tunic", type: "item", slots: ["Chest"], classes: ["cleric", "shadow knight"], ac: 3, weight: 1.0, lore: true, noTrade: true, source: "Guild Summons - The Fell Blade reward (Mandaril Dark Knife, Paineel)" });
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Gemchopper Hall
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ak-anon";
  const giverId = "npc:ak-anon:baxok-curhunter";
  addGiver(giverId, "Baxok Curhunter", zoneId);

  const questId = "quest:guild-summons-gemchopper-hall";
  addNode({
    id: questId,
    label: "Guild Summons - Gemchopper Hall",
    type: "quest",
    description: "A new good-aligned Gnome Warrior receives a Recruitment Summons to hand to Master Warrior Baxok Curhunter at Gemchopper Hall in Ak'Anon.",
    classes: ["warrior"],
    minLevel: 1,
    steps: ["Hand the Recruitment Summons to Baxok Curhunter at Gemchopper Hall"],
    wiki_title: "Guild Summons - Gemchopper Hall",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const tunicId = "item:torn-and-ripped-tunic";
  addNode({ id: tunicId, label: "Torn and Ripped Tunic", type: "item", slots: ["Chest"], classes: ["warrior"], ac: 3, weight: 1.0, source: "Guild Summons - Gemchopper Hall reward (Baxok Curhunter, Ak'Anon)" });
  addEdge(questId, tunicId, "rewards");
  addFactionReward(questId, "Gem Choppers");
  addFactionReward(questId, "Merchants of Ak'Anon");
  addFactionReward(questId, "King Ak'Anon");
}

// ---------------------------------------------------------------------
// Guild Summons - Temple of Life Cleric / Temple of Life Paladin
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-qeynos";
  const fadedTunicId = "item:faded-tunic";
  addNode({ id: fadedTunicId, label: "Faded Tunic", type: "item", slots: ["Chest"], classes: ["cleric", "paladin"], ac: 2, weight: 0.7, lore: true, source: "Guild Summons - Temple of Life reward (North Qeynos)" });

  {
    const giverId = "npc:north-qeynos:priestess-jahnda";
    addGiver(giverId, "Priestess Jahnda", zoneId);
    const questId = "quest:guild-summons-temple-of-life-cleric";
    addNode({
      id: questId,
      label: "Guild Summons - Temple of Life Cleric",
      type: "quest",
      description: "A new Cleric of the Temple of Life Guild Hall in North Qeynos hands a tattered note to Priestess Jahnda.",
      classes: ["cleric"],
      minLevel: 1,
      steps: ["Hail Priestess Jahnda at the Temple of Life Guild Hall", "Hand her a tattered note"],
      wiki_title: "Guild Summons - Temple of Life Cleric",
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, fadedTunicId, "rewards");
    addFactionReward(questId, "Priests of Life");
    addFactionReward(questId, "Knights of Thunder");
    addFactionReward(questId, "Guards of Qeynos");
    addFactionReward(questId, "Antonius Bayle");
  }
  {
    const giverId = "npc:north-qeynos:camlend-serbold";
    addGiver(giverId, "Camlend Serbold", zoneId);
    const questId = "quest:guild-summons-temple-of-life-paladin";
    addNode({
      id: questId,
      label: "Guild Summons - Temple of Life Paladin",
      type: "quest",
      description: "A new Paladin of the Temple of Life Guild Hall in North Qeynos hands a tattered note to Camlend Serbold.",
      classes: ["paladin"],
      minLevel: 1,
      steps: ["Hail Camlend Serbold at the Temple of Life Guild Hall", "Hand him a tattered note"],
      wiki_title: "Guild Summons - Temple of Life Paladin",
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, fadedTunicId, "rewards");
    addFactionReward(questId, "Knights of Thunder");
    addFactionReward(questId, "Priests of Life");
    addFactionReward(questId, "Guards of Qeynos");
  }
}

// ---------------------------------------------------------------------
// Guild Summons - Temple of Thunder Cleric / Temple of Thunder Paladin
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const grayTunicId = "item:old-gray-tunic";
  addNode({ id: grayTunicId, label: "Old Gray Tunic", type: "item", slots: ["Chest"], classes: ["cleric", "paladin"], ac: 2, weight: 0.7, lore: true, source: "Guild Summons - Temple of Thunder reward (South Qeynos)" });

  {
    const giverId = "npc:south-qeynos:renic-losaren";
    addGiver(giverId, "Renic Losaren", zoneId);
    const questId = "quest:guild-summons-temple-of-thunder-cleric";
    addNode({
      id: questId,
      label: "Guild Summons - Temple of Thunder Cleric",
      type: "quest",
      description: "A new Cleric of the Temple of Thunder in South Qeynos hands a tattered note to Renic Losaren.",
      classes: ["cleric"],
      minLevel: 1,
      steps: ["Hail Renic Losaren at the Temple of Thunder", "Hand him a tattered note"],
      wiki_title: "Guild Summons - Temple of Thunder Cleric",
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, grayTunicId, "rewards");
    addFactionReward(questId, "Priests of Life");
    addFactionReward(questId, "Knights of Thunder");
    addFactionReward(questId, "Guards of Qeynos");
  }
  {
    const giverId = "npc:south-qeynos:runethar-hamest";
    addGiver(giverId, "Runethar Hamest", zoneId);
    const questId = "quest:guild-summons-temple-of-thunder-paladin";
    addNode({
      id: questId,
      label: "Guild Summons - Temple of Thunder Paladin",
      type: "quest",
      description: "A new Paladin of the Temple of Thunder in South Qeynos hands a tattered note to Runethar Hamest.",
      classes: ["paladin"],
      minLevel: 1,
      steps: ["Hail Runethar Hamest at the Temple of Thunder", "Hand him a tattered note"],
      wiki_title: "Guild Summons - Temple of Thunder Paladin",
    });
    addEdge(giverId, questId, "starts");
    addEdge(questId, zoneId, "starts_in");
    addEdge(questId, zoneId, "located_in");
    addEdge(questId, grayTunicId, "rewards");
    addFactionReward(questId, "Priests of Life");
    addFactionReward(questId, "Knights of Thunder");
    addFactionReward(questId, "Guards of Qeynos");
  }
}

// ---------------------------------------------------------------------
// Guild Summons - Stormguard
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-kaladim";
  const giverId = "npc:south-kaladim:furtog-ogrebane";
  addGiver(giverId, "Furtog Ogrebane", zoneId);

  const questId = "quest:guild-summons-stormguard";
  addNode({
    id: questId,
    label: "Guild Summons - Stormguard",
    type: "quest",
    description: "A new Warrior receives a Recruitment Letter to hand to Furtog Ogrebane, in the skybox above the Kaladim Warrior's Guild arena.",
    classes: ["warrior"],
    minLevel: 1,
    steps: ["Hail Furtog Ogrebane above the Kaladim Warrior's Guild arena", "Hand him the Recruitment Letter"],
    wiki_title: "Guild Summons - Stormguard",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const tunicId = "item:dirt-stained-tunic";
  addNode({ id: tunicId, label: "Dirt Stained Tunic", type: "item", slots: ["Chest"], classes: ["warrior"], ac: 4, weight: 1.6, lore: true, source: "Guild Summons - Stormguard reward (Furtog Ogrebane, South Kaladim)" });
  addEdge(questId, tunicId, "rewards");
  addFactionReward(questId, "Storm Guard");
  addFactionReward(questId, "Kazon Stormhammer");
  addFactionReward(questId, "Miners Guild 249");
  addFactionReward(questId, "Merchants of Kaladim");
}

// ---------------------------------------------------------------------
// Guild Summons - Priests of Innoruuk
// ---------------------------------------------------------------------
{
  const zoneId = "zone:neriak-3rd-gate";
  const giverId = "npc:neriak-3rd-gate:perrir-zexus";
  addGiver(giverId, "Perrir Zexus", zoneId);

  const questId = "quest:guild-summons-priests-of-innoruuk";
  addNode({
    id: questId,
    label: "Guild Summons - Priests of Innoruuk",
    type: "quest",
    description: "A new Dark Elf Cleric receives a tattered note to hand to Perrir Zexus in Neriak Third Gate.",
    classes: ["cleric"],
    minLevel: 1,
    steps: ["Hand the tattered note to Perrir Zexus"],
    wiki_title: "Guild Summons - Priests of Innoruuk",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const tunicId = "item:crimson-training-tunic";
  addNode({ id: tunicId, label: "Crimson Training Tunic", type: "item", slots: ["Chest"], classes: ["cleric"], ac: 2, weight: 0.8, size: "Medium", lore: true, source: "Guild Summons - Priests of Innoruuk reward (Perrir Zexus, Neriak Third Gate)" });
  addEdge(questId, tunicId, "rewards");
  addFactionReward(questId, "Priests of Innoruuk");
  addFactionReward(questId, "King Aythox Thex");
}

// ---------------------------------------------------------------------
// Guild Summons - Songweavers
// ---------------------------------------------------------------------
{
  const zoneId = "zone:greater-faydark";
  const giverId = "npc:greater-faydark:sylia-windlehands";
  addGiver(giverId, "Sylia Windlehands", zoneId);

  const questId = "quest:guild-summons-songweavers";
  addNode({
    id: questId,
    label: "Guild Summons - Songweavers",
    type: "quest",
    description: "A new Bard receives a tattered note to hand to Sylia Windlehands at the Songweavers Guild Hall in Kelethin.",
    classes: ["bard"],
    minLevel: 1,
    steps: ["Hail Sylia Windlehands at the Songweavers Guild Hall", "Hand her a tattered note"],
    wiki_title: "Guild Summons - Songweavers",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");

  const tunicId = "item:faded-brown-tunic";
  addNode({ id: tunicId, label: "Faded Brown Tunic", type: "item", slots: ["Chest"], classes: ["bard"], ac: 2, weight: 1.0, size: "Medium", lore: true, source: "Guild Summons - Songweavers reward (Sylia Windlehands, Kelethin)" });
  addEdge(questId, tunicId, "rewards");
  addFactionReward(questId, "Songweavers");
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 050 complete: added 25 more quests from GitHub issue #26's checklist");
