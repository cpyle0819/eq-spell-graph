/**
 * Migration 072: 25 more quests off GitHub issue #26's checklist -- finishes
 * out the "Guild Summons" cluster (Shrine of Bertoxxulous Magician through
 * The Wind Spirit's Song) plus 2 standalone quests (Heretic Battle, Heretic
 * Heads) and a 3-quest dragon/prisoner cluster (Iksar Prisoner Quest, Key to
 * Jaled Dar's Lair (Neb) and (Zlandicar)). Researched directly against
 * eqlwiki.com, following decisions/eqlwiki-quest-research-method.md and
 * using migrations/_lib.ts.
 *
 * Skipped (wiki itself confirms broken/unfinished/non-quest, per the issue's
 * "only skip when the wiki confirms it" guardrail), left unchecked on the
 * issue for a future look if the wiki content ever changes:
 * - Hate Tail Guard Shield: "Appears this quest was never finished on live,
 *   perhaps no 'Giant Hate Tail Scorpions' exist."
 * - High Guard Battlestaff: "This is an unsolved or broken quest."
 * - Hopeless Love, Part 2: "I am told that this is not a quest, but merely a
 *   story line."
 *
 * New zone: Dalnir (aka "Crypt of Dalnir" per its own opening line), added
 * because Iksar Prisoner Quest's mid-quest turn-in stop is there and it had
 * no node -- only connection eqlwiki.com's own page states is Warsliks
 * Woods ("The entrance to Dalnir is located through an old, hidden tunnel
 * ... in Warsliks Woods"), so it gets the same uninhabited-dungeon
 * "wilderness" faction template as migration 020 (Stonebrunt Mountains) --
 * no vendors, safe for all classes, neutral race/deity.
 *
 * Reused existing items (same name *and* stat line as an already-modeled
 * reward, just a different quest handing it out):
 * - `item:dirty-purple-robe` (Shrine of Bertoxxulous Enchanter, migration
 *   071) for the Magician and Wizard versions of the same quest cluster.
 * - `item:dirty-training-tunic` (Hall of Steel, migration 071) for Shrine of
 *   Bertoxxulous Warrior -- identical name/AC/class/race, `source` prose
 *   updated to note both origins.
 * - `item:faded-purple-tunic` (Hall of Truth Paladin, migration 071) for
 *   Temple of Marr Paladin.
 * New shared reward items (same name/stats quoted on 2+ pages in this
 * batch): `item:ruined-training-tunic` (Shrine of Bertoxxulous Shadowknight
 * + Temple of Bertoxxulous Cleric -- Class: WAR CLR SHD, Race: HUM HEF);
 * `item:faded-silver-tunic` (Temple of Divine Light Cleric/Paladin -- Class:
 * CLR PAL, Race: ERU); `item:stained-red-robe` (The Spurned
 * Enchanter/Magician/Wizard -- Class: WIZ MAG ENC, Race: DEF); `item:jaled-
 * dars-tomb-key` (dropped by either Neb or Zlandicar, same lore key either
 * way).
 *
 * Neb's Warbone's wiki page states its class restriction as "ALL except NEC
 * WIZ MAG ENC" -- resolved to an explicit allow-list per decisions/item-
 * node-schema.md (no exclusion-list representation in this schema): bard,
 * beastlord, cleric, druid, monk, paladin, ranger, rogue, shadow knight,
 * shaman, warrior.
 *
 * Deliberately NOT modeled (consistent with every migration so far): coin
 * rewards, negative faction changes, race/deity restrictions and Haste%
 * (folded into `description`/item `source` prose instead) -- decisions/
 * quest-reward-modeling.md and decisions/item-node-schema.md.
 */

import { loadGraph } from "./_lib";

const { graph, addNode, addEdge, addFactionReward, addGiver, save } = loadGraph(import.meta.dir);

// ---------------------------------------------------------------------
// New zone: Dalnir (aka Crypt of Dalnir)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:dalnir";
  const WILDERNESS_FACTION = {
    race: {
      barbarian: "neutral", "dark elf": "neutral", dwarf: "neutral", erudite: "neutral",
      gnome: "neutral", "half elf": "neutral", halfling: "neutral", "high elf": "neutral",
      human: "neutral", iksar: "neutral", ogre: "neutral", troll: "neutral", "wood elf": "neutral",
    },
    class: {
      bard: "safe", beastlord: "safe", cleric: "safe", druid: "safe", enchanter: "safe",
      magician: "safe", monk: "safe", necromancer: "safe", paladin: "safe", ranger: "safe",
      rogue: "safe", "shadow knight": "safe", shaman: "safe", warrior: "safe", wizard: "safe",
    },
    deity: {
      agnostic: "neutral", bertoxxulous: "neutral", "brell serilis": "neutral", bristlebane: "neutral",
      "cazic-thule": "neutral", "erollisi marr": "neutral", innoruuk: "neutral", karana: "neutral",
      "mithaniel marr": "neutral", prexus: "neutral", quellious: "neutral", "rallos zek": "neutral",
      "rodcet nife": "neutral", "solusek ro": "neutral", "the tribunal": "neutral", tunare: "neutral",
      veeshan: "neutral",
    },
  };
  addNode({ id: zoneId, label: "Dalnir", type: "zone", faction: WILDERNESS_FACTION });
  addEdge(zoneId, "zone:warsliks-woods", "connects_to");
  addEdge("zone:warsliks-woods", zoneId, "connects_to");
}

// ---------------------------------------------------------------------
// Guild Summons - Shrine of Bertoxxulous Magician
// ---------------------------------------------------------------------
{
  const zoneId = "zone:qeynos-catacombs";
  const giverId = "npc:qeynos-catacombs:perkon-malok";
  addGiver(giverId, "Perkon Malok", zoneId);

  const robeId = "item:dirty-purple-robe";
  const questId = "quest:guild-summons-shrine-of-bertoxxulous-magician";
  addNode({
    id: questId,
    label: "Guild Summons - Shrine of Bertoxxulous Magician",
    type: "quest",
    description: "A new Human or Half-Elf Magician of the Bloodsabers Guild receives a Blood Stained Note directing them to Perkon Malok at the Shrine of Bertoxxulous Guild Hall in the Qeynos Catacombs, who trades it for a guild robe.",
    classes: ["magician"],
    minLevel: 1,
    steps: ["Receive a Blood Stained Note (Guild Summons)", "Hand the note to Perkon Malok at the Shrine of Bertoxxulous Guild Hall"],
    wiki_title: "Guild Summons - Shrine of Bertoxxulous Magician",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Bloodsabers");
  addFactionReward(questId, "Opal Dark Briar");
  addFactionReward(questId, "Corrupt Qeynos Guards");
  addEdge(questId, robeId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Shrine of Bertoxxulous Necromancer
// ---------------------------------------------------------------------
{
  const zoneId = "zone:qeynos-catacombs";
  const giverId = "npc:qeynos-catacombs:lyris-moonbane";
  addGiver(giverId, "Lyris Moonbane", zoneId);

  const robeId = "item:dark-stained-purple-robe";
  addNode({ id: robeId, label: "Dark Stained Purple Robe", type: "item", slots: ["Chest"], classes: ["necromancer"], ac: 2, weight: 0.7, size: "Medium", lore: true, source: "Guild Summons - Shrine of Bertoxxulous Necromancer reward (Lyris Moonbane, Qeynos Catacombs) -- restricted to Necromancers of Human race" });

  const questId = "quest:guild-summons-shrine-of-bertoxxulous-necromancer";
  addNode({
    id: questId,
    label: "Guild Summons - Shrine of Bertoxxulous Necromancer",
    type: "quest",
    description: "A new Human Necromancer of the Bloodsabers Guild receives a Blood Stained Note directing them to Lyris Moonbane at the Shrine of Bertoxxulous Guild Hall in the Qeynos Catacombs, who trades it for a guild robe.",
    classes: ["necromancer"],
    minLevel: 1,
    steps: ["Receive a Blood Stained Note (Guild Summons)", "Hand the note to Lyris Moonbane at the Shrine of Bertoxxulous Guild Hall"],
    wiki_title: "Guild Summons - Shrine of Bertoxxulous Necromancer",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Bloodsabers");
  addFactionReward(questId, "Opal Dark Briar");
  addFactionReward(questId, "Corrupt Qeynos Guards");
  addEdge(questId, robeId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Shrine of Bertoxxulous Shadowknight
// ---------------------------------------------------------------------
{
  const zoneId = "zone:qeynos-catacombs";
  const giverId = "npc:qeynos-catacombs:sragg-bloodheart";
  addGiver(giverId, "Sragg Bloodheart", zoneId);

  const tunicId = "item:ruined-training-tunic";
  addNode({ id: tunicId, label: "Ruined Training Tunic", type: "item", slots: ["Chest"], classes: ["warrior", "cleric", "shadow knight"], ac: 3, weight: 1.0, size: "Medium", lore: true, source: "Guild Summons - Shrine of Bertoxxulous Shadowknight / Temple of Bertoxxulous Cleric reward (Qeynos Catacombs) -- restricted to Human or Half-Elf race" });

  const questId = "quest:guild-summons-shrine-of-bertoxxulous-shadowknight";
  addNode({
    id: questId,
    label: "Guild Summons - Shrine of Bertoxxulous Shadowknight",
    type: "quest",
    description: "A new Human or Half-Elf Shadow Knight of the Bloodsabers Guild receives a Stained Cloth Note directing them to Sragg Bloodheart at the Shrine of Bertoxxulous Guild Hall in the Qeynos Catacombs, who trades it for a guild tunic.",
    classes: ["shadow knight"],
    minLevel: 1,
    steps: ["Receive a Stained Cloth Note", "Hand the note to Sragg Bloodheart at the Shrine of Bertoxxulous Guild Hall"],
    wiki_title: "Guild Summons - Shrine of Bertoxxulous Shadowknight",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Bloodsabers");
  addFactionReward(questId, "Opal Dark Briar");
  addFactionReward(questId, "Corrupt Qeynos Guards");
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Shrine of Bertoxxulous Warrior
// ---------------------------------------------------------------------
{
  const zoneId = "zone:qeynos-catacombs";
  const giverId = "npc:qeynos-catacombs:rocthar-bekesna";
  addGiver(giverId, "Rocthar Bekesna", zoneId);

  const tunicId = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "item:dirty-training-tunic");
  if (tunicId) {
    tunicId.data.source = "Guild Summons - Hall of Steel (South Qeynos) / Shrine of Bertoxxulous Warrior (Qeynos Catacombs) reward -- restricted to Warriors of Human or Half-Elf race";
  }

  const questId = "quest:guild-summons-shrine-of-bertoxxulous-warrior";
  addNode({
    id: questId,
    label: "Guild Summons - Shrine of Bertoxxulous Warrior",
    type: "quest",
    description: "A new Human or Half-Elf Warrior of the Bloodsabers Guild receives a Blood Stained Note directing them to Rocthar Bekesna at the Shrine of Bertoxxulous Guild Hall in the Qeynos Catacombs, who trades it for a guild tunic. Faction standing with Guards of Qeynos and Priests of Life worsens.",
    classes: ["warrior"],
    minLevel: 1,
    steps: ["Receive a Blood Stained Note (Guild Summons)", "Hand the note to Rocthar Bekesna at the Shrine of Bertoxxulous Guild Hall"],
    wiki_title: "Guild Summons - Shrine of Bertoxxulous Warrior",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Bloodsabers");
  addFactionReward(questId, "Opal Dark Briar");
  addFactionReward(questId, "Corrupt Qeynos Guards");
  addEdge(questId, "item:dirty-training-tunic", "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Shrine of Bertoxxulous Wizard
// ---------------------------------------------------------------------
{
  const zoneId = "zone:qeynos-catacombs";
  const giverId = "npc:qeynos-catacombs:trenon-callust";
  addGiver(giverId, "Trenon Callust", zoneId);

  const questId = "quest:guild-summons-shrine-of-bertoxxulous-wizard";
  addNode({
    id: questId,
    label: "Guild Summons - Shrine of Bertoxxulous Wizard",
    type: "quest",
    description: "A new Human or Half-Elf Wizard of the Bloodsabers Guild receives a Blood Stained Note directing them to Trenon Callust at the Shrine of Bertoxxulous Guild Hall in the Qeynos Catacombs, who trades it for a guild robe.",
    classes: ["wizard"],
    minLevel: 1,
    steps: ["Receive a Blood Stained Note (Guild Summons)", "Hand the note to Trenon Callust at the Shrine of Bertoxxulous Guild Hall"],
    wiki_title: "Guild Summons - Shrine of Bertoxxulous Wizard",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Bloodsabers");
  addFactionReward(questId, "Opal Dark Briar");
  addFactionReward(questId, "Corrupt Qeynos Guards");
  addEdge(questId, "item:dirty-purple-robe", "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Soldiers of Tunare
// ---------------------------------------------------------------------
{
  const zoneId = "zone:greater-faydark";
  const giverId = "npc:greater-faydark:heartwood-master";
  addGiver(giverId, "Heartwood Master", zoneId);

  const tunicId = "item:green-and-tan-tunic";
  addNode({ id: tunicId, label: "Green and Tan Tunic", type: "item", slots: ["Chest"], classes: ["druid"], ac: 2, weight: 1.0, size: "Medium", lore: true, source: "Guild Summons - Soldiers of Tunare reward (Heartwood Master, Kelethin) -- restricted to Druids of Elf or Half-Elf race" });

  const questId = "quest:guild-summons-soldiers-of-tunare";
  addNode({
    id: questId,
    label: "Guild Summons - Soldiers of Tunare",
    type: "quest",
    description: "A new Elf or Half-Elf Druid of the Soldiers of Tunare Guild receives a tattered note directing them to the Heartwood Master at the guild hall in Kelethin, who trades it for a guild tunic.",
    classes: ["druid"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to the Heartwood Master at the Soldiers of Tunare guild hall in Kelethin"],
    wiki_title: "Guild Summons - Soldiers of Tunare",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Soldiers of Tunare");
  addFactionReward(questId, "King Tearis Thex");
  addFactionReward(questId, "Faydarks Champions");
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Tabernacle of Terror
// ---------------------------------------------------------------------
{
  const zoneId = "zone:paineel";
  const giverId = "npc:paineel:sern-adolia";
  addGiver(giverId, "Sern Adolia", zoneId);

  const robeId = "item:harbingers-of-fear-robe";
  addNode({ id: robeId, label: "Harbingers of Fear Robe", type: "item", slots: ["Chest"], classes: ["cleric", "shadow knight"], ac: 3, weight: 1.0, size: "Medium", lore: true, source: "Guild Summons - Tabernacle of Terror reward (Sern Adolia, Paineel) -- restricted to Erudites" });

  const questId = "quest:guild-summons-tabernacle-of-terror";
  addNode({
    id: questId,
    label: "Guild Summons - Tabernacle of Terror",
    type: "quest",
    description: "A new Erudite Cleric or Shadow Knight of the Harbingers of Fear Guild receives a Harbingers of Fear Guild Note directing them to Sern Adolia in the Tabernacle of Terror in Paineel, who trades it for a guild robe. Faction standing with Deepwater Knights, Gate Callers, Craftkeepers, and Crimson Hands worsens.",
    classes: ["cleric", "shadow knight"],
    minLevel: 1,
    steps: ["Receive a Harbingers of Fear Guild Note", "Hand the note to Sern Adolia in the Tabernacle of Terror"],
    wiki_title: "Guild Summons - Tabernacle of Terror",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Heretics");
  addEdge(questId, robeId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Temple of Bertoxxulous Cleric
// ---------------------------------------------------------------------
{
  const zoneId = "zone:qeynos-catacombs";
  const giverId = "npc:qeynos-catacombs:xeture-demiagar";
  addGiver(giverId, "Xeture Demiagar", zoneId);

  const questId = "quest:guild-summons-temple-of-bertoxxulous-cleric";
  addNode({
    id: questId,
    label: "Guild Summons - Temple of Bertoxxulous Cleric",
    type: "quest",
    description: "A new Human or Half-Elf Cleric of the Bloodsabers Guild receives a tattered note directing them to Xeture Demiagar at the Shrine of Bertoxxulous Guild Hall in the Qeynos Catacombs, who trades it for a guild tunic. Faction standing with Guards of Qeynos, Priests of Life, and Knights of Thunder worsens.",
    classes: ["cleric"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Xeture Demiagar at the Shrine of Bertoxxulous Guild Hall"],
    wiki_title: "Guild Summons - Temple of Bertoxxulous Cleric",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Bloodsabers");
  addFactionReward(questId, "Opal Dark Briar");
  addFactionReward(questId, "Corrupt Qeynos Guards");
  addEdge(questId, "item:ruined-training-tunic", "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Temple of Divine Light Cleric
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const giverId = "npc:erudin:leraena-shelyrak";
  addGiver(giverId, "Leraena Shelyrak", zoneId);

  const tunicId = "item:faded-silver-tunic";
  addNode({ id: tunicId, label: "Faded Silver Tunic", type: "item", slots: ["Chest"], classes: ["cleric", "paladin"], ac: 2, weight: 1.0, size: "Medium", lore: true, source: "Guild Summons - Temple of Divine Light Cleric/Paladin reward (Erudin) -- restricted to Erudites" });

  const questId = "quest:guild-summons-temple-of-divine-light-cleric";
  addNode({
    id: questId,
    label: "Guild Summons - Temple of Divine Light Cleric",
    type: "quest",
    description: "A new Erudite Cleric of the Temple of Divine Light Guild receives a tattered note directing them to Leraena Shelyrak at the Temple of Light Guild Hall in Erudin, who trades it for a guild tunic. Faction standing with Heretics worsens.",
    classes: ["cleric"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Leraena Shelyrak at the Temple of Light Guild Hall"],
    wiki_title: "Guild Summons - Temple of Divine Light Cleric",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Peace Keepers");
  addFactionReward(questId, "High Council of Erudin");
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Temple of Divine Light Paladin
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const giverId = "npc:erudin:depnar-bulrious";
  addGiver(giverId, "Depnar Bulrious", zoneId);

  const questId = "quest:guild-summons-temple-of-divine-light-paladin";
  addNode({
    id: questId,
    label: "Guild Summons - Temple of Divine Light Paladin",
    type: "quest",
    description: "A new Erudite Paladin of the Temple of Divine Light Guild receives a tattered note directing them to Depnar Bulrious at the Temple of Divine Light in Erudin, who trades it for a guild tunic.",
    classes: ["paladin"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Depnar Bulrious at the Temple of Divine Light"],
    wiki_title: "Guild Summons - Temple of Divine Light Paladin",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Peace Keepers");
  addFactionReward(questId, "High Council of Erudin");
  addEdge(questId, "item:faded-silver-tunic", "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Temple of Marr Cleric
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-freeport";
  const giverId = "npc:north-freeport:tholius-quey";
  addGiver(giverId, "Tholius Quey", zoneId);

  const tunicId = "item:white-and-blue-tunic";
  addNode({ id: tunicId, label: "White and Blue Tunic", type: "item", slots: ["Chest"], classes: ["cleric", "paladin"], ac: 2, weight: 1.0, size: "Medium", lore: true, source: "Guild Summons - Temple of Marr Cleric reward (Tholius Quey, North Freeport) -- restricted to Human or Half-Elf race" });

  const questId = "quest:guild-summons-temple-of-marr-cleric";
  addNode({
    id: questId,
    label: "Guild Summons - Temple of Marr Cleric",
    type: "quest",
    description: "A new Human or Half-Elf Cleric of the Temple of Marr Guild receives a tattered note directing them to Tholius Quey at the Temple of Marr in North Freeport, who trades it for a guild tunic.",
    classes: ["cleric"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Tholius Quey at the Temple of Marr"],
    wiki_title: "Guild Summons - Temple of Marr Cleric",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Priests of Marr");
  addFactionReward(questId, "Knights of Truth");
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Temple of Marr Paladin
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-freeport";
  const giverId = "npc:north-freeport:gygus-remnara";
  addGiver(giverId, "Gygus Remnara", zoneId);

  const questId = "quest:guild-summons-temple-of-marr-paladin";
  addNode({
    id: questId,
    label: "Guild Summons - Temple of Marr Paladin",
    type: "quest",
    description: "A new Human or Half-Elf Paladin of the Temple of Marr Guild receives a tattered note directing them to Gygus Remnara at the Temple of Marr in North Freeport, who trades it for a guild tunic.",
    classes: ["paladin"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Gygus Remnara at the Temple of Marr"],
    wiki_title: "Guild Summons - Temple of Marr Paladin",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Priests of Marr");
  addFactionReward(questId, "Knights of Truth");
  addEdge(questId, "item:faded-purple-tunic", "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - The Abbatoir
// ---------------------------------------------------------------------
{
  const zoneId = "zone:paineel";
  const giverId = "npc:paineel:coriante-verisue";
  addGiver(giverId, "Coriante Verisue", zoneId);

  const robeId = "item:dirt-soiled-robe";
  addNode({ id: robeId, label: "Dirt Soiled Robe", type: "item", slots: ["Chest"], classes: ["necromancer"], ac: 2, weight: 0.7, size: "Medium", lore: true, source: "Guild Summons - The Abbatoir reward (Coriante Verisue, Paineel) -- restricted to Necromancers of Erudite race" });

  const questId = "quest:guild-summons-the-abbatoir";
  addNode({
    id: questId,
    label: "Guild Summons - The Abbatoir",
    type: "quest",
    description: "A new Erudite Necromancer of the Harbingers of Fear Guild receives a Dark Truth Guild Note directing them to Coriante Verisue at the Tabernacle of Terror in Paineel, who trades it for a guild robe.",
    classes: ["necromancer"],
    minLevel: 1,
    steps: ["Receive a Dark Truth Guild Note", "Hand the note to Coriante Verisue in the Tabernacle of Terror"],
    wiki_title: "Guild Summons - The Abbatoir",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Heretics");
  addEdge(questId, robeId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - The Amethyst Palace
// ---------------------------------------------------------------------
{
  const zoneId = "zone:southern-felwithe";
  const giverId = "npc:southern-felwithe:tarker-blazetoss";
  addGiver(giverId, "Tarker Blazetoss", zoneId);

  const robeId = "item:faded-blue-robe";
  addNode({ id: robeId, label: "Faded Blue Robe", type: "item", slots: ["Chest"], classes: ["wizard", "magician", "enchanter"], ac: 2, weight: 0.7, size: "Medium", lore: true, source: "Guild Summons - The Amethyst Palace reward (Tarker Blazetoss, Southern Felwithe) -- restricted to Human, High Elf, or Half-Elf race" });

  const questId = "quest:guild-summons-the-amethyst-palace";
  addNode({
    id: questId,
    label: "Guild Summons - The Amethyst Palace",
    type: "quest",
    description: "A new Human, High Elf, or Half-Elf Wizard of the Amethyst Palace Guild receives an Enrollment Letter directing them to Tarker Blazetoss at the Amethyst Palace Wizard Guild Hall in Southern Felwithe, who trades it for a guild robe. Faction standing with The Dead worsens.",
    classes: ["wizard"],
    minLevel: 1,
    steps: ["Receive an Enrollment Letter", "Hand the letter to Tarker Blazetoss at the Amethyst Palace"],
    wiki_title: "Guild Summons - The Amethyst Palace",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Keepers of the Art");
  addFactionReward(questId, "King Tearis Thex");
  addFactionReward(questId, "Faydarks Champions");
  addEdge(questId, robeId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - The Dead Necromancer
// ---------------------------------------------------------------------
{
  const zoneId = "zone:neriak-3rd-gate";
  const giverId = "npc:neriak-3rd-gate:xon-quexill";
  addGiver(giverId, "Xon Quexill", zoneId);

  const robeId = "item:dark-stained-training-robe";
  addNode({ id: robeId, label: "Dark Stained Training Robe", type: "item", slots: ["Chest"], classes: ["necromancer"], ac: 2, weight: 0.7, size: "Medium", lore: true, source: "Guild Summons - The Dead Necromancer reward (Xon Quexill, Neriak Third Gate) -- restricted to Necromancers of Dark Elf race" });

  const questId = "quest:guild-summons-the-dead-necromancer";
  addNode({
    id: questId,
    label: "Guild Summons - The Dead Necromancer",
    type: "quest",
    description: "A new Dark Elf Necromancer receives a tattered note directing them to Xon Quexill in Neriak Third Gate, who trades it for a guild robe.",
    classes: ["necromancer"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Xon Quexill in Neriak Third Gate"],
    wiki_title: "Guild Summons - The Dead Necromancer",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "The Dead");
  addEdge(questId, robeId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - The Dead Shadowknight
// ---------------------------------------------------------------------
{
  const zoneId = "zone:neriak-3rd-gate";
  const giverId = "npc:neriak-3rd-gate:nezzka-tolax";
  addGiver(giverId, "Nezzka Tolax", zoneId);

  const tunicId = "item:black-training-tunic";
  addNode({ id: tunicId, label: "Black Training Tunic", type: "item", slots: ["Chest"], classes: ["shadow knight"], ac: 3, weight: 1.0, size: "Medium", lore: true, source: "Guild Summons - The Dead Shadowknight reward (Nezzka Tolax, Neriak Third Gate) -- restricted to Shadow Knights of Dark Elf race" });

  const questId = "quest:guild-summons-the-dead-shadowknight";
  addNode({
    id: questId,
    label: "Guild Summons - The Dead Shadowknight",
    type: "quest",
    description: "A new Dark Elf Shadow Knight receives a tattered note directing them to Nezzka Tolax in Neriak Third Gate, who trades it for a guild tunic.",
    classes: ["shadow knight"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Nezzka Tolax in Neriak Third Gate"],
    wiki_title: "Guild Summons - The Dead Shadowknight",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "The Dead");
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - The Spurned Enchanter
// ---------------------------------------------------------------------
{
  const zoneId = "zone:neriak-commons";
  const giverId = "npc:neriak-commons:camia-vretta";
  addGiver(giverId, "Camia V'Retta", zoneId);

  const robeId = "item:stained-red-robe";
  addNode({ id: robeId, label: "Stained Red Robe", type: "item", slots: ["Chest"], classes: ["wizard", "magician", "enchanter"], ac: 2, weight: 0.7, size: "Medium", lore: true, source: "Guild Summons - The Spurned Enchanter/Magician/Wizard reward (Neriak Commons) -- restricted to Dark Elves" });

  const questId = "quest:guild-summons-the-spurned-enchanter";
  addNode({
    id: questId,
    label: "Guild Summons - The Spurned Enchanter",
    type: "quest",
    description: "A new Dark Elf Enchanter receives a tattered note directing them to Camia V'Retta at the Tower of the Spurned in Neriak Commons, who trades it for a guild robe.",
    classes: ["enchanter"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Camia V'Retta at the Tower of the Spurned"],
    wiki_title: "Guild Summons - The Spurned Enchanter",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "The Spurned");
  addEdge(questId, robeId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - The Spurned Magician
// ---------------------------------------------------------------------
{
  const zoneId = "zone:neriak-commons";
  const giverId = "npc:neriak-commons:jayna-dbious";
  addGiver(giverId, "Jayna D'Bious", zoneId);

  const questId = "quest:guild-summons-the-spurned-magician";
  addNode({
    id: questId,
    label: "Guild Summons - The Spurned Magician",
    type: "quest",
    description: "A new Dark Elf Magician receives a tattered note directing them to seek out Jayna D'Bious, master magician of the Spurned, at the Tower of the Spurned in Neriak Commons, who trades it for a guild robe. Faction standing with The Dead worsens.",
    classes: ["magician"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Jayna D'Bious at the Tower of the Spurned"],
    wiki_title: "Guild Summons - The Spurned Magician",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "The Spurned");
  addEdge(questId, "item:stained-red-robe", "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - The Spurned Wizard
// ---------------------------------------------------------------------
{
  const zoneId = "zone:neriak-commons";
  const giverId = "npc:neriak-commons:gath-nmare";
  addGiver(giverId, "Gath N`Mare", zoneId);

  const questId = "quest:guild-summons-the-spurned-wizard";
  addNode({
    id: questId,
    label: "Guild Summons - The Spurned Wizard",
    type: "quest",
    description: "A new Dark Elf Wizard receives a tattered note directing them to Gath N`Mare at the Tower of the Spurned in Neriak Commons, who trades it for a guild robe.",
    classes: ["wizard"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Gath N`Mare at the Tower of the Spurned"],
    wiki_title: "Guild Summons - The Spurned Wizard",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "The Spurned");
  addEdge(questId, "item:stained-red-robe", "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - The Wind Spirit's Song
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:belious-naliedin";
  addGiver(giverId, "Belious Naliedin", zoneId);

  const tunicId = "item:brown-tunic";
  addNode({ id: tunicId, label: "Brown Tunic", type: "item", slots: ["Chest"], classes: ["bard"], ac: 2, weight: 1.0, size: "Medium", lore: true, source: "Guild Summons - The Wind Spirit's Song reward (Belious Naliedin, South Qeynos) -- restricted to Bards of Human or Half-Elf race" });

  const questId = "quest:guild-summons-the-wind-spirits-song";
  addNode({
    id: questId,
    label: "Guild Summons - The Wind Spirit's Song",
    type: "quest",
    description: "A new Human or Half-Elf Bard receives a tattered note directing them to Belious Naliedin at The Wind Spirit's Song Bard Guild Hall in South Qeynos, who trades it for a guild tunic.",
    classes: ["bard"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Belious Naliedin at The Wind Spirit's Song"],
    wiki_title: "Guild Summons - The Wind Spirit's Song",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Guards of Qeynos");
  addFactionReward(questId, "Knights of Truth");
  addFactionReward(questId, "League of Antonican Bards");
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Heretic Battle
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const giverId = "npc:erudin:markus-jaevins";
  addGiver(giverId, "Markus Jaevins", zoneId);

  const toxxuliaId = "zone:toxxulia-forest";

  const questId = "quest:heretic-battle";
  addNode({
    id: questId,
    label: "Heretic Battle",
    type: "quest",
    description: "Defeat Elial Brook in Toxxulia Forest and bring his Bones to Markus Jaevins atop the Tower of the Gate Callers in Erudin Palace. Faction standing with Heretics worsens.",
    minLevel: 6,
    steps: ["Defeat Elial Brook in Toxxulia Forest for Bones", "Hand the Bones to Markus Jaevins atop the Tower of the Gate Callers"],
    wiki_title: "Heretic Battle",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, toxxuliaId, "located_in");
  addFactionReward(questId, "Gate Callers");
  addFactionReward(questId, "High Guard of Erudin");
  addFactionReward(questId, "High Council of Erudin");
  addFactionReward(questId, "Deepwater Knights");
  addFactionReward(questId, "Craftkeepers");
  addFactionReward(questId, "Crimson Hands");
}

// ---------------------------------------------------------------------
// Heretic Heads
// ---------------------------------------------------------------------
{
  const zoneId = "zone:stonebrunt-mountains";
  const giverId = "npc:stonebrunt-mountains:shazda-kaekwon";
  addGiver(giverId, "Shazda Kaekwon", zoneId);

  const headbandId = "item:kejekan-tribal-headband";
  addNode({ id: headbandId, label: "Kejekan Tribal Headband", type: "item", slots: ["Head"], ac: 1, stats: { wis: 3, int: 3 }, mana: 12, weight: 0.2, size: "Small", source: "Heretic Heads reward (Shazda Kaekwon, Stonebrunt Mountains) -- common outcome, roughly 90% of the time" });

  const sashId = "item:swiftclaw-sash";
  addNode({ id: sashId, label: "Swiftclaw Sash", type: "item", slots: ["Waist"], ac: 2, stats: { agi: 2 }, weight: 0.1, size: "Small", magic: true, lore: true, source: "Heretic Heads reward (Shazda Kaekwon, Stonebrunt Mountains) -- rare outcome, roughly 10% of the time; also grants Haste +15%" });

  const questId = "quest:heretic-heads";
  addNode({
    id: questId,
    label: "Heretic Heads",
    type: "quest",
    description: "Collect four Heretic Heads (male or female) into a Burlap Satchel to make a Satchel of Heretic Heads, then hand it to Shazda Kaekwon in Stonebrunt Mountains for coin, experience, and a chance at one of two rewards: a Kejekan Tribal Headband (common) or a rare Swiftclaw Sash.",
    minLevel: 25,
    steps: ["Collect 4 Heretic Heads and combine them in a Burlap Satchel", "Hand the Satchel of Heretic Heads to Shazda Kaekwon"],
    wiki_title: "Heretic Heads",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Kejek Village");
  addFactionReward(questId, "Peace Keepers");
  addEdge(questId, headbandId, "rewards");
  addEdge(questId, sashId, "rewards");
}

// ---------------------------------------------------------------------
// Iksar Prisoner Quest
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-cabilis";
  const dalnirId = "zone:dalnir";
  const giverId = "npc:east-cabilis:iksar-prisoner";
  addGiver(giverId, "an Iksar prisoner", zoneId);

  const iconId = "item:greenmist-icon";
  addNode({ id: iconId, label: "Greenmist Icon", type: "item", stats: { cha: 5 }, weight: 0.2, size: "Small", magic: true, lore: true, noTrade: true, source: "Iksar Prisoner Quest reward (East Cabilis / Dalnir) -- usable by any class or race" });

  const questId = "quest:iksar-prisoner-quest";
  addNode({
    id: questId,
    label: "Iksar Prisoner Quest",
    type: "quest",
    description: "An Iksar prisoner in East Cabilis hands over Drixiv Arcut's note; giving it to Arch Duke Xog at the Shaman/Shadowknight Guild sends the player to find a captured Crusader (an Iksar prisoner) on the second floor of Dalnir. Killing coerced dwarves there for a rare Serrated Wire and freeing the prisoner earns a Greenmist Icon, which Xog reluctantly accepts back in East Cabilis -- worsening faction standing with the Crusaders of Greenmist and Legion of Cabilis.",
    minLevel: 25,
    steps: [
      "Hail an Iksar prisoner in East Cabilis to receive Drixiv Arcut's note",
      "Hand the note to Arch Duke Xog at the Shaman/Shadowknight Guild",
      "Find and hail the captured prisoner on the second floor of Dalnir",
      "Kill coerced dwarves in Dalnir for a rare Serrated Wire",
      "Hand the Serrated Wire to the prisoner to free him and receive a Greenmist Icon",
      "Return the Greenmist Icon to Arch Duke Xog",
    ],
    wiki_title: "Iksar Prisoner Quest",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, dalnirId, "located_in");
  addEdge(questId, iconId, "rewards");
}

// ---------------------------------------------------------------------
// Key to Jaled Dar's Lair (Neb)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:dragon-necropolis";
  const giverId = "npc:dragon-necropolis:neb";
  addGiver(giverId, "Neb", zoneId);

  const keyId = "item:jaled-dars-tomb-key";
  addNode({ id: keyId, label: "Jaled Dar's Tomb Key", type: "item", weight: 0.1, size: "Tiny", lore: true, source: "Key to Jaled Dar's Lair reward, dropped by either Neb or Zlandicar in Dragon Necropolis -- opens the door to Jaled Dar's shade (a Rogue with 210+ lockpick skill can bypass it)" });

  const warboneId = "item:nebs-warbone";
  addNode({
    id: warboneId,
    label: "Neb's Warbone",
    type: "item",
    slots: ["Primary", "Secondary"],
    classes: ["bard", "beastlord", "cleric", "druid", "monk", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"],
    skill: "1H Blunt",
    delay: 23,
    damage: 15,
    stats: { str: 10 },
    resists: { fire: 15 },
    weight: 7.0,
    size: "Medium",
    magic: true,
    lore: true,
    noTrade: true,
    source: "Key to Jaled Dar's Lair (Neb) reward (Dragon Necropolis) -- excludes Necromancers, Wizards, Magicians, and Enchanters; special ability triggers at level 50",
  });

  const questId = "quest:key-to-jaled-dars-lair-neb";
  addNode({
    id: questId,
    label: "Key to Jaled Dar's Lair (Neb)",
    type: "quest",
    description: "Turn in Vaniki's Heart (dropped by Vaniki in the Chetari tunnels) and Zlandicar's Heart (dropped by Zlandicar) to Neb in Dragon Necropolis for Jaled Dar's Tomb Key and Neb's Warbone. Requires dubious faction standing or better with the Paebala to start; worsens standing with Zlandicar and Chetari.",
    minLevel: 55,
    steps: ["Obtain Vaniki's Heart from Vaniki in the Chetari tunnels", "Obtain Zlandicar's Heart from Zlandicar", "Turn in both hearts to Neb in Dragon Necropolis"],
    wiki_title: "Key to Jaled Dar's Lair (Neb)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Paebala");
  addEdge(questId, keyId, "rewards");
  addEdge(questId, warboneId, "rewards");
}

// ---------------------------------------------------------------------
// Key to Jaled Dar's Lair (Zlandicar)
// ---------------------------------------------------------------------
{
  const zoneId = "zone:dragon-necropolis";
  const giverId = "npc:dragon-necropolis:zlandicar";
  addGiver(giverId, "Zlandicar", zoneId);

  const questId = "quest:key-to-jaled-dars-lair-zlandicar";
  addNode({
    id: questId,
    label: "Key to Jaled Dar's Lair (Zlandicar)",
    type: "quest",
    description: "Turn in Neb's head to Zlandicar in Dragon Necropolis for Jaled Dar's Tomb Key. Requires apprehensive faction standing or better with Zlandicar to start; sneak turn-ins work.",
    minLevel: 55,
    steps: ["Obtain Neb's head", "Turn in Neb's head to Zlandicar in Dragon Necropolis"],
    wiki_title: "Key to Jaled Dar's Lair (Zlandicar)",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addEdge(questId, "item:jaled-dars-tomb-key", "rewards");
}

save();
console.log("Migration 072 complete: added 25 more quests from GitHub issue #26's checklist, plus 1 new zone (Dalnir)");
