/**
 * Migration 071: 25 more quests off GitHub issue #26's checklist -- a
 * second run into the ~90-entry "Guild Summons" cluster, continuing where
 * migration 070 left off (Dismal Rage Warrior/Wizard through Shrine of
 * Bertoxxulous Enchanter). Researched directly against eqlwiki.com,
 * following decisions/eqlwiki-quest-research-method.md and using
 * migrations/_lib.ts.
 *
 * Same shape as every other Guild Summons quest: a new character of a
 * given class/race/deity receives a tattered note (or letter) directing
 * them to their own guild's NPC, who trades it for a starter tunic/robe.
 *
 * Unlike migration 070, several of this batch's primary faction rewards
 * are NOT simply the guild's own name -- verified per-quest against each
 * page's own quoted "faction standing... got better" lines rather than
 * assumed, after Greenblood Rock's reward turned out to be "Shamen of
 * War" (not "Greenblood Rock") and Faydark's Champions' turned out to be
 * spelled "Faydarks Champions" (no apostrophe) on its own faction page --
 * both diverging from the quest-title-as-faction-name pattern migration
 * 070 used throughout:
 * - Gate Callers has no faction of its own name; its page lists Craft
 *   Keepers/High Council of Erudin/High Guard of Erudin improving instead
 *   (all three already existed as nodes -- reused directly).
 * - Paladins of the Underfoot's page lists Clerics of Underfoot/Kazon
 *   Stormhammer/Miners Guild 249 improving, no "Paladins of the
 *   Underfoot" faction of its own -- modeled as Clerics of Underfoot
 *   (already existed), which also explains why its reward item shares a
 *   name (see below) with Guild Summons - Church of Underfoot.
 * - Hall of the Ebon Mask's own page explicitly links a faction of that
 *   same name, distinct from the pre-existing (and differently-scoped)
 *   `faction:ebon-mask` node -- kept as its own separate faction node
 *   rather than conflated with it.
 *
 * Reused existing items across quests, discovered mid-batch:
 * - `item:faded-crimson-tunic` (Dismal Rage Warrior) and
 *   `item:dark-stained-robe` (Dismal Rage Wizard) were already modeled by
 *   migration 070 with classes lists that already cover these two.
 * - `item:dusty-tunic` (Guild Summons - Church of Underfoot, migration
 *   070) turns out to be the same reward Guild Summons - Paladins of the
 *   Underfoot's own page quotes ("Slot: CHEST | AC: 2 | WT: 0.8 | Size:
 *   MEDIUM | Class: CLR PAL"), not a same-named-but-distinct item --
 *   migration 070 only had the Cleric-only half of the picture. Its
 *   `classes` list is corrected here to add "paladin" (item schema has no
 *   race field, so the Dwarf-only restriction stays in `source` prose
 *   only, same as before).
 *
 * New shared reward items (same name/stats quoted on multiple pages in
 * this batch, modeled once, reused via `rewards` edges): `item:blue-
 * training-robe` (Hall of Sorcery Enchanter/Magician/Wizard -- Class: WIZ
 * MAG ENC, Race: HUM HIE HEF); `item:dirty-gold-felt-robe` (Library
 * Mechanimagica Enchanter/Magician/Wizard -- Class: WIZ MAG ENC, Race:
 * GNM, not following Bertoxxulous); `item:faded-purple-tunic` (Hall of
 * Truth Cleric/Paladin -- Class: CLR PAL, Race: HUM HEF).
 *
 * Guild Summons - Murdunk's Palace's Green Stained Skin Tunic is
 * explicitly the same "original guild tunic" migration 050's Greenblood
 * Shadowknight Tunic already requires as a turn-in -- added a `requires`
 * edge (`quest:greenblood-shadowknight-tunic` depends on
 * `quest:guild-summons-murdunks-palace`) per decisions/quest-
 * prerequisite-requires-edge.md.
 *
 * Reused existing NPCs (already in the graph as quest givers/named NPCs
 * elsewhere): `npc:oggok:guntrik`, `npc:oggok:zulort`, `npc:oggok:soonog`,
 * `npc:grobb:hukulk` -- `addGiver` just adds the missing `located_in`
 * edge where needed.
 *
 * Deliberately NOT modeled (consistent with every migration so far): coin
 * rewards, negative faction changes, and race/deity restrictions (folded
 * into `description`/item `source` prose instead) -- decisions/quest-
 * reward-modeling.md and decisions/item-node-schema.md.
 */

import { loadGraph } from "./_lib";

const { graph, addNode, addEdge, addFactionReward, addGiver, save } = loadGraph(import.meta.dir);

// ---------------------------------------------------------------------
// Guild Summons - Dismal Rage Warrior
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-freeport";
  const giverId = "npc:east-freeport:brutol-rhaksen";
  addGiver(giverId, "Brutol Rhaksen", zoneId);

  const questId = "quest:guild-summons-dismal-rage-warrior";
  addNode({
    id: questId,
    label: "Guild Summons - Dismal Rage Warrior",
    type: "quest",
    description: "A new Human or Half-Elf Warrior of Innoruuk, in the Dismal Rage Guild, receives a tattered note directing them to Brutol Rhaksen in East Freeport's basement slums, who trades it for a guild tunic.",
    classes: ["warrior"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Brutol Rhaksen in East Freeport's basement slums"],
    wiki_title: "Guild Summons - Dismal Rage Warrior",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Dismal Rage");
  addEdge(questId, "item:faded-crimson-tunic", "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Dismal Rage Wizard
// ---------------------------------------------------------------------
{
  const zoneId = "zone:east-freeport";
  const giverId = "npc:east-freeport:nexvok-thirod";
  addGiver(giverId, "Nexvok Thirod", zoneId);

  const questId = "quest:guild-summons-dismal-rage-wizard";
  addNode({
    id: questId,
    label: "Guild Summons - Dismal Rage Wizard",
    type: "quest",
    description: "A new Human Wizard of the Dismal Rage Guild receives a tattered note directing them to Nexvok Thirod in the Sewers of East Freeport, who trades it for a guild robe.",
    classes: ["wizard"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Nexvok Thirod in the Sewers of East Freeport"],
    wiki_title: "Guild Summons - Dismal Rage Wizard",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Dismal Rage");
  addEdge(questId, "item:dark-stained-robe", "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Faydark's Champions
// ---------------------------------------------------------------------
{
  const zoneId = "zone:greater-faydark";
  const giverId = "npc:greater-faydark:maesyn-trueshot";
  addGiver(giverId, "Maesyn Trueshot", zoneId);

  const questId = "quest:guild-summons-faydarks-champions";
  addNode({
    id: questId,
    label: "Guild Summons - Faydark's Champions",
    type: "quest",
    description: "A new Elf or Half-Elf Ranger of the Faydark's Champions Guild receives a tattered note directing them to Maesyn Trueshot at the guild hall in Kelethin, who trades it for a guild tunic.",
    classes: ["ranger"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Maesyn Trueshot at the Faydark's Champions guild hall in Kelethin"],
    wiki_title: "Guild Summons - Faydark's Champions",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Faydarks Champions");

  const tunicId = "item:dirty-green-tunic";
  addNode({ id: tunicId, label: "Dirty Green Tunic", type: "item", slots: ["Chest"], classes: ["ranger"], ac: 2, weight: 1.0, size: "Medium", lore: true, source: "Guild Summons - Faydark's Champions reward (Maesyn Trueshot, Kelethin) -- restricted to Rangers of Elf or Half-Elf race" });
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Fortress Craknek
// ---------------------------------------------------------------------
{
  const zoneId = "zone:oggok";
  const giverId = "npc:oggok:guntrik";
  addGiver(giverId, "Guntrik", zoneId);

  const questId = "quest:guild-summons-fortress-craknek";
  addNode({
    id: questId,
    label: "Guild Summons - Fortress Craknek",
    type: "quest",
    description: "A new Ogre Warrior of the Craknek Warriors Guild receives a tattered note directing them to Guntrik in Oggok, who trades it for a guild tunic.",
    classes: ["warrior"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Guntrik in Oggok"],
    wiki_title: "Guild Summons - Fortress Craknek",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Craknek Warriors");

  const tunicId = "item:mud-stained-skin-tunic";
  addNode({ id: tunicId, label: "Mud Stained Skin Tunic", type: "item", slots: ["Chest"], classes: ["warrior"], ac: 4, weight: 1.6, size: "Medium", lore: true, source: "Guild Summons - Fortress Craknek reward (Guntrik, Oggok) -- restricted to Warriors of Ogre race" });
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Gate Callers
// ---------------------------------------------------------------------
{
  const zoneId = "zone:erudin";
  const giverId = "npc:erudin:markus-jaevins";
  addGiver(giverId, "Markus Jaevins", zoneId);

  const questId = "quest:guild-summons-gate-callers";
  addNode({
    id: questId,
    label: "Guild Summons - Gate Callers",
    type: "quest",
    description: "A new Erudite Magician of the Gate Callers Guild receives a tattered note directing them to Markus Jaevins at the guild tower in Erudin Palace, who trades it for a guild robe.",
    classes: ["magician"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Markus Jaevins at the Gate Callers guild tower in Erudin Palace"],
    wiki_title: "Guild Summons - Gate Callers",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Craft Keepers");
  addFactionReward(questId, "High Council of Erudin");
  addFactionReward(questId, "High Guard of Erudin");

  const robeId = "item:old-torn-robe";
  addNode({ id: robeId, label: "Old Torn Robe", type: "item", slots: ["Chest"], classes: ["magician"], ac: 2, weight: 0.7, size: "Medium", lore: true, noTrade: true, source: "Guild Summons - Gate Callers reward (Markus Jaevins, Erudin) -- restricted to Magicians of Erudite race" });
  addEdge(questId, robeId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Greenblood Rock
// ---------------------------------------------------------------------
{
  const zoneId = "zone:oggok";
  const giverId = "npc:oggok:zulort";
  addGiver(giverId, "Zulort", zoneId);

  const questId = "quest:guild-summons-greenblood-rock";
  addNode({
    id: questId,
    label: "Guild Summons - Greenblood Rock",
    type: "quest",
    description: "A new Ogre Shaman receives a tattered note directing them to Zulort in Oggok, who trades it for a guild tunic.",
    classes: ["shaman"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Zulort in Oggok"],
    wiki_title: "Guild Summons - Greenblood Rock",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Shamen of War");

  const tunicId = "item:dirty-patched-fur-tunic";
  addNode({ id: tunicId, label: "Dirty Patched Fur Tunic", type: "item", slots: ["Chest"], classes: ["shaman"], ac: 2, weight: 1.2, size: "Medium", lore: true, source: "Guild Summons - Greenblood Rock reward (Zulort, Oggok) -- restricted to Shamans of Ogre race" });
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Hall of Sorcery Enchanter
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:mespha-tevalian";
  addGiver(giverId, "Mespha Tevalian", zoneId);

  const robeId = "item:blue-training-robe";
  addNode({ id: robeId, label: "Blue Training Robe", type: "item", slots: ["Chest"], classes: ["wizard", "magician", "enchanter"], ac: 2, weight: 0.7, size: "Medium", lore: true, source: "Guild Summons - Hall of Sorcery Enchanter/Magician/Wizard reward (South Qeynos) -- restricted to Human, High Elf, or Half-Elf race" });

  const questId = "quest:guild-summons-hall-of-sorcery-enchanter";
  addNode({
    id: questId,
    label: "Guild Summons - Hall of Sorcery Enchanter",
    type: "quest",
    description: "A new Human, High Elf, or Half-Elf Enchanter of the Order of Three Guild receives a tattered note directing them to Mespha Tevalian at the Hall of Sorcery in South Qeynos, who trades it for a guild robe.",
    classes: ["enchanter"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Mespha Tevalian at the Hall of Sorcery"],
    wiki_title: "Guild Summons - Hall of Sorcery Enchanter",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Order of Three");
  addEdge(questId, robeId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Hall of Sorcery Magician
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:kinloc-flamepaw";
  addGiver(giverId, "Kinloc Flamepaw", zoneId);

  const questId = "quest:guild-summons-hall-of-sorcery-magician";
  addNode({
    id: questId,
    label: "Guild Summons - Hall of Sorcery Magician",
    type: "quest",
    description: "A new Human, High Elf, or Half-Elf Magician of the Order of Three Guild receives a tattered note directing them to Kinloc Flamepaw at the Hall of Sorcery in South Qeynos, who trades it for a guild robe.",
    classes: ["magician"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Kinloc Flamepaw at the Hall of Sorcery"],
    wiki_title: "Guild Summons - Hall of Sorcery Magician",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Order of Three");
  addEdge(questId, "item:blue-training-robe", "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Hall of Sorcery Wizard
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:gahlith-wrannstad";
  addGiver(giverId, "Gahlith Wrannstad", zoneId);

  const questId = "quest:guild-summons-hall-of-sorcery-wizard";
  addNode({
    id: questId,
    label: "Guild Summons - Hall of Sorcery Wizard",
    type: "quest",
    description: "A new Human, High Elf, or Half-Elf Wizard of the Order of Three Guild receives a tattered note directing them to Gahlith Wrannstad at the Hall of Sorcery in South Qeynos, who trades it for a guild robe.",
    classes: ["wizard"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Gahlith Wrannstad at the Hall of Sorcery"],
    wiki_title: "Guild Summons - Hall of Sorcery Wizard",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Order of Three");
  addEdge(questId, "item:blue-training-robe", "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Hall of Steel
// ---------------------------------------------------------------------
{
  const zoneId = "zone:south-qeynos";
  const giverId = "npc:south-qeynos:ebon-strongbear";
  addGiver(giverId, "Ebon Strongbear", zoneId);

  const questId = "quest:guild-summons-hall-of-steel";
  addNode({
    id: questId,
    label: "Guild Summons - Hall of Steel",
    type: "quest",
    description: "A new Human or Half-Elf Warrior of the Steel Warriors Guild receives a recruitment flyer directing them to Ebon Strongbear at the Hall of Steel in South Qeynos, who trades it for a guild tunic.",
    classes: ["warrior"],
    minLevel: 1,
    steps: ["Receive a Recruitment Flyer", "Hand the flyer to Ebon Strongbear at the Hall of Steel"],
    wiki_title: "Guild Summons - Hall of Steel",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Steel Warriors");

  const tunicId = "item:dirty-training-tunic";
  addNode({ id: tunicId, label: "Dirty Training Tunic", type: "item", slots: ["Chest"], classes: ["warrior"], ac: 3, weight: 1.0, size: "Medium", lore: true, source: "Guild Summons - Hall of Steel reward (Ebon Strongbear, South Qeynos) -- restricted to Warriors of Human or Half-Elf race" });
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Hall of the Ebon Mask
// ---------------------------------------------------------------------
{
  const zoneId = "zone:neriak-3rd-gate";
  const giverId = "npc:neriak-3rd-gate:eolorn-jaxx";
  addGiver(giverId, "Eolorn J`Axx", zoneId);

  const questId = "quest:guild-summons-hall-of-the-ebon-mask";
  addNode({
    id: questId,
    label: "Guild Summons - Hall of the Ebon Mask",
    type: "quest",
    description: "A new Dark Elf Rogue receives a tattered note directing them to Eolorn J`Axx at the Hall of the Ebon Mask in Neriak Third Gate, who trades it for a guild tunic.",
    classes: ["rogue"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Eolorn J`Axx at the Hall of the Ebon Mask"],
    wiki_title: "Guild Summons - Hall of the Ebon Mask",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Hall of the Ebon Mask");

  const tunicId = "item:old-black-tunic";
  addNode({ id: tunicId, label: "Old Black Tunic", type: "item", slots: ["Chest"], classes: ["rogue"], ac: 2, weight: 0.7, size: "Medium", lore: true, source: "Guild Summons - Hall of the Ebon Mask reward (Eolorn J`Axx, Neriak Third Gate) -- restricted to Rogues of Dark Elf race" });
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Hall of Truth Cleric
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-freeport";
  const giverId = "npc:north-freeport:eestyana-naestra";
  addGiver(giverId, "Eestyana Naestra", zoneId);

  const tunicId = "item:faded-purple-tunic";
  addNode({ id: tunicId, label: "Faded Purple Tunic", type: "item", slots: ["Chest"], classes: ["cleric", "paladin"], ac: 2, weight: 1.0, size: "Medium", lore: true, source: "Guild Summons - Hall of Truth Cleric/Paladin reward (North Freeport) -- restricted to Human or Half-Elf race" });

  const questId = "quest:guild-summons-hall-of-truth-cleric";
  addNode({
    id: questId,
    label: "Guild Summons - Hall of Truth Cleric",
    type: "quest",
    description: "A new Human or Half-Elf Cleric of the Knights of Truth Guild receives a tattered note directing them to Eestyana Naestra at the Hall of Truth in North Freeport, who trades it for a guild tunic.",
    classes: ["cleric"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Cross the river in North Freeport to the Hall of Truth", "Hand the note to Eestyana Naestra"],
    wiki_title: "Guild Summons - Hall of Truth Cleric",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Knights of Truth");
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Hall of Truth Paladin
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-freeport";
  const giverId = "npc:north-freeport:valeron-dushire";
  addGiver(giverId, "Valeron Dushire", zoneId);

  const questId = "quest:guild-summons-hall-of-truth-paladin";
  addNode({
    id: questId,
    label: "Guild Summons - Hall of Truth Paladin",
    type: "quest",
    description: "A new Human or Half-Elf Paladin of the Knights of Truth Guild receives a tattered note directing them to Valeron Dushire at the Hall of Truth in North Freeport, who trades it for a guild tunic.",
    classes: ["paladin"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Cross the river in North Freeport to the Hall of Truth", "Hand the note to Valeron Dushire"],
    wiki_title: "Guild Summons - Hall of Truth Paladin",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Knights of Truth");
  addEdge(questId, "item:faded-purple-tunic", "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Libary Mechanimagica Enchanter
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ak-anon";
  const giverId = "npc:ak-anon:juline-urncaller";
  addGiver(giverId, "Juline Urncaller", zoneId);

  const robeId = "item:dirty-gold-felt-robe";
  addNode({ id: robeId, label: "Dirty Gold Felt Robe", type: "item", slots: ["Chest"], classes: ["wizard", "magician", "enchanter"], ac: 2, weight: 0.8, size: "Small", lore: true, source: "Guild Summons - Library Mechanimagica Enchanter/Magician/Wizard reward (Ak'Anon) -- restricted to Gnomes not following Bertoxxulous" });

  const questId = "quest:guild-summons-libary-mechanimagica-enchanter";
  addNode({
    id: questId,
    label: "Guild Summons - Libary Mechanimagica Enchanter",
    type: "quest",
    description: "A new Gnome Enchanter of the Eldritch Collective Guild, not following Bertoxxulous, receives a Registration Letter directing them to Juline Urncaller at the Library Mechanimagica in Ak'Anon, who trades it for a guild robe.",
    classes: ["enchanter"],
    minLevel: 1,
    steps: ["Receive a Registration Letter", "Hand the letter to Juline Urncaller at the Library Mechanimagica"],
    wiki_title: "Guild Summons - Libary Mechanimagica Enchanter",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Eldritch Collective");
  addEdge(questId, robeId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Libary Mechanimagica Magician
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ak-anon";
  const giverId = "npc:ak-anon:wuggan-azusphere";
  addGiver(giverId, "Wuggan Azusphere", zoneId);

  const questId = "quest:guild-summons-libary-mechanimagica-magician";
  addNode({
    id: questId,
    label: "Guild Summons - Libary Mechanimagica Magician",
    type: "quest",
    description: "A new Gnome Magician of the Eldritch Collective Guild, not following Bertoxxulous, receives a Registration Letter directing them to Wuggan Azusphere at the Library Mechanimagica in Ak'Anon, who trades it for a guild robe.",
    classes: ["magician"],
    minLevel: 1,
    steps: ["Receive a Registration Letter", "Hand the letter to Wuggan Azusphere at the Library Mechanimagica"],
    wiki_title: "Guild Summons - Libary Mechanimagica Magician",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Eldritch Collective");
  addEdge(questId, "item:dirty-gold-felt-robe", "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Libary Mechanimagica Wizard
// ---------------------------------------------------------------------
{
  const zoneId = "zone:ak-anon";
  const giverId = "npc:ak-anon:tobon-starpyre";
  addGiver(giverId, "Tobon Starpyre", zoneId);

  const questId = "quest:guild-summons-libary-mechanimagica-wizard";
  addNode({
    id: questId,
    label: "Guild Summons - Libary Mechanimagica Wizard",
    type: "quest",
    description: "A new Gnome Wizard of the Eldritch Collective Guild, not following Bertoxxulous, receives a Registration Letter directing them to Tobon Starpyre at the Library Mechanimagica in Ak'Anon, who trades it for a guild robe.",
    classes: ["wizard"],
    minLevel: 1,
    steps: ["Receive a Registration Letter", "Hand the letter to Tobon Starpyre at the Library Mechanimagica"],
    wiki_title: "Guild Summons - Libary Mechanimagica Wizard",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Eldritch Collective");
  addEdge(questId, "item:dirty-gold-felt-robe", "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Marsheart's Chords
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-freeport";
  const giverId = "npc:north-freeport:caskin-marsheart";
  addGiver(giverId, "Caskin Marsheart", zoneId);

  const questId = "quest:guild-summons-marshearts-chords";
  addNode({
    id: questId,
    label: "Guild Summons - Marsheart's Chords",
    type: "quest",
    description: "A new Human or Half-Elf Bard of the League of Antonican Bards receives a tattered note directing them to Caskin Marsheart at Marsheart's Chords guild hall in North Freeport, who trades it for a guild tunic.",
    classes: ["bard"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Caskin Marsheart at Marsheart's Chords"],
    wiki_title: "Guild Summons - Marsheart's Chords",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "League of Antonican Bards");

  const tunicId = "item:colorfully-patched-tunic";
  addNode({ id: tunicId, label: "Colorfully Patched Tunic", type: "item", slots: ["Chest"], classes: ["bard"], ac: 2, weight: 1.0, size: "Medium", lore: true, source: "Guild Summons - Marsheart's Chords reward (Caskin Marsheart, North Freeport) -- restricted to Bards of Human or Half-Elf race" });
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Miners Guild 628
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-kaladim";
  const giverId = "npc:north-kaladim:mater";
  addGiver(giverId, "Mater", zoneId);

  const questId = "quest:guild-summons-miners-guild-628";
  addNode({
    id: questId,
    label: "Guild Summons - Miners Guild 628",
    type: "quest",
    description: "A new Dwarf Rogue receives a Small, Folded Note directing them to Mater outside the Ratsbone Treasury & Assay Office in North Kaladim, who trades it for a guild tunic.",
    classes: ["rogue"],
    minLevel: 1,
    steps: ["Receive a Small, Folded Note", "Hand the note to Mater outside the Ratsbone Treasury & Assay Office"],
    wiki_title: "Guild Summons - Miners Guild 628",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Miners Guild 628");

  const tunicId = "item:ruined-miners-tunic";
  addNode({ id: tunicId, label: "Ruined Miner's Tunic", type: "item", slots: ["Chest"], classes: ["rogue"], ac: 2, weight: 0.8, size: "Medium", lore: true, source: "Guild Summons - Miners Guild 628 reward (Mater, North Kaladim) -- restricted to Rogues of Dwarf race" });
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Murdunk's Palace
// ---------------------------------------------------------------------
{
  const zoneId = "zone:oggok";
  const giverId = "npc:oggok:soonog";
  addGiver(giverId, "Soonog", zoneId);

  const questId = "quest:guild-summons-murdunks-palace";
  addNode({
    id: questId,
    label: "Guild Summons - Murdunk's Palace",
    type: "quest",
    description: "A new Ogre Shadow Knight of the Green Blood Knights Guild receives a tattered note directing them to Soonog in Oggok, who trades it for a guild tunic. This tunic is later required as a turn-in for the Greenblood Shadowknight Tunic quest.",
    classes: ["shadow knight"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Soonog in Oggok"],
    wiki_title: "Guild Summons - Murdunk's Palace",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Green Blood Knights");

  const tunicId = "item:green-stained-skin-tunic";
  addNode({ id: tunicId, label: "Green Stained Skin Tunic", type: "item", slots: ["Chest"], classes: ["shadow knight"], ac: 3, weight: 1.4, size: "Medium", lore: true, source: "Guild Summons - Murdunk's Palace reward (Soonog, Oggok) -- restricted to Shadow Knights of Ogre race" });
  addEdge(questId, tunicId, "rewards");

  addEdge("quest:greenblood-shadowknight-tunic", questId, "requires");
}

// ---------------------------------------------------------------------
// Guild Summons - Night Keep
// ---------------------------------------------------------------------
{
  const zoneId = "zone:grobb";
  const giverId = "npc:grobb:hukulk";
  addGiver(giverId, "Hukulk", zoneId);

  const questId = "quest:guild-summons-night-keep";
  addNode({
    id: questId,
    label: "Guild Summons - Night Keep",
    type: "quest",
    description: "A new Troll Shadow Knight of the Shadowknights of Night Keep Guild receives a tattered note directing them to Hukulk in Grobb, who trades it for a guild tunic.",
    classes: ["shadow knight"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Hukulk in Grobb"],
    wiki_title: "Guild Summons - Night Keep",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Shadowknights of Night Keep");

  const tunicId = "item:black-and-green-tunic";
  addNode({ id: tunicId, label: "Black and Green Tunic", type: "item", slots: ["Chest"], classes: ["shadow knight"], ac: 3, weight: 1.4, size: "Medium", lore: true, source: "Guild Summons - Night Keep reward (Hukulk, Grobb) -- restricted to Shadow Knights of Troll race" });
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Order of the Silent Fist
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-qeynos";
  const giverId = "npc:north-qeynos:lusun";
  addGiver(giverId, "LuSun", zoneId);

  const questId = "quest:guild-summons-order-of-the-silent-fist";
  addNode({
    id: questId,
    label: "Guild Summons - Order of the Silent Fist",
    type: "quest",
    description: "A new Human or Iksar Monk of the Silent Fist Clan Guild receives a Note with Fist Insignia directing them to LuSun at the guild hall in North Qeynos, who trades it for a guild tunic.",
    classes: ["monk"],
    minLevel: 1,
    steps: ["Receive a Note with Fist Insignia", "Hand the note to LuSun at the Order of the Silent Fist guild hall"],
    wiki_title: "Guild Summons - Order of the Silent Fist",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Silent Fist Clan");

  const tunicId = "item:torn-cloth-tunic";
  addNode({ id: tunicId, label: "Torn Cloth Tunic", type: "item", slots: ["Chest"], classes: ["monk"], ac: 2, weight: 0.4, size: "Medium", lore: true, source: "Guild Summons - Order of the Silent Fist reward (LuSun, North Qeynos) -- restricted to Monks of Human or Iksar race" });
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Paladins of the Underfoot
// ---------------------------------------------------------------------
{
  const zoneId = "zone:north-kaladim";
  const giverId = "npc:north-kaladim:datur-nightseer";
  addGiver(giverId, "Datur Nightseer", zoneId);

  const questId = "quest:guild-summons-paladins-of-the-underfoot";
  addNode({
    id: questId,
    label: "Guild Summons - Paladins of the Underfoot",
    type: "quest",
    description: "A new Dwarf Paladin receives a Folded Parchment directing them to Datur Nightseer, leader of the Paladins of the Underfoot, in North Kaladim, who trades it for a guild tunic.",
    classes: ["paladin"],
    minLevel: 1,
    steps: ["Receive a Folded Parchment", "Hand the parchment to Datur Nightseer in North Kaladim"],
    wiki_title: "Guild Summons - Paladins of the Underfoot",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Clerics of Underfoot");

  const dustyTunic = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "item:dusty-tunic");
  if (dustyTunic && !dustyTunic.data.classes.includes("paladin")) {
    dustyTunic.data.classes.push("paladin");
    dustyTunic.data.source = "Guild Summons - Church of Underfoot/Paladins of the Underfoot reward (North Kaladim) -- restricted to Clerics/Paladins of Dwarf race";
  }
  addEdge(questId, "item:dusty-tunic", "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Protectors of the Pine
// ---------------------------------------------------------------------
{
  const zoneId = "zone:surefall-glade";
  const giverId = "npc:surefall-glade:hager-sureshot";
  addGiver(giverId, "Hager Sureshot", zoneId);

  const questId = "quest:guild-summons-protectors-of-the-pine";
  addNode({
    id: questId,
    label: "Guild Summons - Protectors of the Pine",
    type: "quest",
    description: "A new Human, Elf, or Half-Elf Ranger of the Protectors of the Pine Guild receives a tattered note directing them to Hager Sureshot at the guild's shooting range in Surefall Glade, who trades it for a guild tunic.",
    classes: ["ranger"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Hager Sureshot at the Protectors of the Pine shooting range"],
    wiki_title: "Guild Summons - Protectors of the Pine",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Protectors of the Pine");

  const tunicId = "item:mud-stained-tunic";
  addNode({ id: tunicId, label: "Mud Stained Tunic", type: "item", slots: ["Chest"], classes: ["ranger"], ac: 3, weight: 1.0, size: "Medium", lore: true, source: "Guild Summons - Protectors of the Pine reward (Hager Sureshot, Surefall Glade) -- restricted to Rangers of Human, Elf, or Half-Elf race" });
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Scouts of Tunare
// ---------------------------------------------------------------------
{
  const zoneId = "zone:greater-faydark";
  const giverId = "npc:greater-faydark:tylfon";
  addGiver(giverId, "Tylfon", zoneId);

  const questId = "quest:guild-summons-scouts-of-tunare";
  addNode({
    id: questId,
    label: "Guild Summons - Scouts of Tunare",
    type: "quest",
    description: "A new Elf or Half-Elf Rogue of the Tunare's Scouts Guild receives a tattered note directing them to Tylfon at the guild hall in Kelethin, who trades it for a guild tunic.",
    classes: ["rogue"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Tylfon at the Scouts of Tunare guild hall in Kelethin"],
    wiki_title: "Guild Summons - Scouts of Tunare",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Tunare's Scouts");

  const tunicId = "item:old-worn-gray-tunic";
  addNode({ id: tunicId, label: "Old Worn Gray Tunic", type: "item", slots: ["Chest"], classes: ["rogue"], ac: 2, weight: 0.8, size: "Medium", lore: true, source: "Guild Summons - Scouts of Tunare reward (Tylfon, Kelethin) -- restricted to Rogues of Elf or Half-Elf race" });
  addEdge(questId, tunicId, "rewards");
}

// ---------------------------------------------------------------------
// Guild Summons - Shrine of Bertoxxulous Enchanter
// ---------------------------------------------------------------------
{
  const zoneId = "zone:qeynos-catacombs";
  const giverId = "npc:qeynos-catacombs:reania-jukle";
  addGiver(giverId, "Reania Jukle", zoneId);

  const questId = "quest:guild-summons-shrine-of-bertoxxulous-enchanter";
  addNode({
    id: questId,
    label: "Guild Summons - Shrine of Bertoxxulous Enchanter",
    type: "quest",
    description: "A new Human or Half-Elf Enchanter of the Bloodsabers Guild receives a tattered note directing them to Reania Jukle at the Shrine of Bertoxxulous guild hall in the Qeynos Catacombs, who trades it for a guild robe.",
    classes: ["enchanter"],
    minLevel: 1,
    steps: ["Receive a tattered note", "Hand the note to Reania Jukle at the Shrine of Bertoxxulous guild hall"],
    wiki_title: "Guild Summons - Shrine of Bertoxxulous Enchanter",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, zoneId, "starts_in");
  addEdge(questId, zoneId, "located_in");
  addFactionReward(questId, "Bloodsabers");

  const robeId = "item:dirty-purple-robe";
  addNode({ id: robeId, label: "Dirty Purple Robe", type: "item", slots: ["Chest"], classes: ["enchanter", "magician", "wizard"], ac: 2, weight: 0.7, size: "Medium", lore: true, source: "Guild Summons - Shrine of Bertoxxulous Enchanter reward (Reania Jukle, Qeynos Catacombs) -- restricted to Human or Half-Elf race" });
  addEdge(questId, robeId, "rewards");
}

save();
console.log("Migration 071 complete: added 25 more quests from GitHub issue #26's checklist");
