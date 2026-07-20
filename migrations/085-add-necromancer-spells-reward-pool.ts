/**
 * Migration 085: fills the spell-corpus gap flagged in migrations 082/083 --
 * the Necromancer Spells / Necromancer Spells (Cabilis) quests both hand out
 * a random pick from the same 4-spell pool (Minion of Shadows, Sacrifice,
 * Scent of Terris, Shadowbond), none of which existed in the graph yet.
 *
 * Unlike the WebFetch-summary risk noted in
 * decisions/eqlwiki-quest-research-method.md ("summarizes through a small
 * model, risky for exact numbers"), these 4 spells were pulled the same way
 * scripts/scrape-spell-details.ts sources every other spell in the corpus:
 * raw wikitext straight from the MediaWiki API
 * (eqlwiki.com/api.php?action=query&prop=revisions), not a rendered/
 * summarized page -- so the field values below are direct infobox reads,
 * not a paraphrase. Each spell's own "Related Quests" section on the wiki
 * confirms both quests as its source.
 *
 * "Sacrifice" disambiguates on the wiki from "Sacrifice (item)"; the spell
 * node keeps the plain "Sacrifice" label (matching how both quest
 * descriptions already name it) since spell-card.js's wiki link derives
 * straight from `label` with no per-spell title override field (unlike
 * quests' `wikiTitle`, migration 030) -- adding that override is out of
 * scope for a single spell.
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, save } = loadGraph(import.meta.dir);

addNode({
  id: "spell:sacrifice",
  label: "Sacrifice",
  type: "spell",
  class_levels: [{ class: "necromancer", level: 51 }],
  description:
    "Consumes a willing target's soul and binds it within an Essence Emerald. Players (Level 46-59) killed in this manner cannot be resurrected. Consumes an emerald when cast. You cannot sacrifice yourself.",
  mana: 100,
  skill: "Alteration",
  castTime: 5.0,
  recastTime: 0.0,
  fizzleTime: 2.25,
  duration: "Instant",
  targetType: "Single",
  spellType: "Beneficial",
  resist: "Unresistable",
  range: 100,
  icon: "G",
});

addNode({
  id: "spell:scent-of-terris",
  label: "Scent of Terris",
  type: "spell",
  class_levels: [{ class: "necromancer", level: 52 }],
  description:
    "Surrounds your target in the scent of Terris, causing them to be more susceptible to fire, poison, and disease.",
  mana: 200,
  skill: "Alteration",
  castTime: 3.0,
  recastTime: 6.0,
  fizzleTime: 2.25,
  duration: "11.4 minutes @L52 to 13 minutes @L60",
  targetType: "Single",
  spellType: "Detrimental",
  resist: "Poison (0)",
  range: 200,
  icon: "G",
});

addNode({
  id: "spell:minion-of-shadows",
  label: "Minion of Shadows",
  type: "spell",
  class_levels: [{ class: "necromancer", level: 53 }],
  description:
    "Animates an undead servant from the remnants of the fallen. This pet is a rogue and will backstab but has less hit points than the level 49 pet which is a warrior. Consumes bone chips when cast.",
  mana: 525,
  skill: "Conjuration",
  castTime: 14.0,
  recastTime: 2.25,
  fizzleTime: 2.25,
  duration: "Instant",
  targetType: "Self",
  spellType: "Beneficial",
  resist: "Unresistable",
  icon: "L",
});

addNode({
  id: "spell:shadowbond",
  label: "Shadowbond",
  type: "spell",
  class_levels: [{ class: "necromancer", level: 54 }],
  description: "Transfers your own health to your target at a rate of 125 hit points every six seconds for 24 secs (4 ticks).",
  mana: 10,
  skill: "Alteration",
  castTime: 2.0,
  recastTime: 21.0,
  fizzleTime: 2.5,
  duration: "4 ticks",
  targetType: "Single",
  spellType: "Beneficial",
  resist: "Unresistable",
  range: 100,
  icon: "G",
});

const necromancerSpellsPool = [
  "spell:minion-of-shadows",
  "spell:sacrifice",
  "spell:scent-of-terris",
  "spell:shadowbond",
];

for (const id of necromancerSpellsPool) {
  addEdge("quest:necromancer-spells", id, "rewards", { randomGroup: "necromancer-spells-drop" });
  addEdge("quest:necromancer-spells-cabilis", id, "rewards", { randomGroup: "necromancer-spells-cabilis-drop" });
}

save();
console.log("Migration 085 complete: added Minion of Shadows, Sacrifice, Scent of Terris, and Shadowbond, and wired them as the reward pool for Necromancer Spells and Necromancer Spells (Cabilis)");
