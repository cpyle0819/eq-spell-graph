/**
 * Migration 353: backfill ItemDetails stat blocks for equipment nodes that
 * had a `slots` entry (i.e. are wearable/wieldable) but none of the
 * stat-bearing fields (ac/stats/resists/hp/mana/damage/effect) -- a
 * data-quality audit turned up 31 such nodes. 6 are genuinely stat-less
 * (light sources, containers) and untouched here. The remaining 25 are
 * backfilled from eqlwiki.com's own item pages, fetched directly (not
 * WebSearch summaries -- see decisions/eql-vs-classic-eq-zone-connectivity.md
 * on sourcing EQL facts from the wiki itself).
 *
 * A handful of items turned out to have no further stats on the wiki either
 * (Medallion of the Obulus, Copper Amulet) -- left alone, since "no stats"
 * is the correct model for them, not a gap.
 *
 * item:cinctured-whip's damage is omitted -- eqlwiki.com's own infobox
 * template throws a rendering error ("Expression error: Missing operand")
 * for that field, so there's no value to backfill from source.
 *
 * item:legionnaires-mancatcher carries a pre-existing `noDrop` field that
 * isn't part of ItemDetails (should be `noTrade`) -- out of scope here since
 * 16 other items share the same stray field; left untouched.
 */

import { loadGraph } from "./_lib";

const { updateNode, save } = loadGraph(import.meta.dir);

updateNode("item:silver-earring", { ac: 1 });

updateNode("item:copper-band", { value: "6s" });

updateNode("item:grizzly-hide-cloak", {
  ac: 6,
  hp: 5,
  weight: 3.5,
  size: "Large",
  classes: [
    "bard", "beastlord", "berserker", "cleric", "druid", "monk", "paladin",
    "ranger", "rogue", "shadow knight", "shaman", "warrior",
  ],
});

updateNode("item:medallion-of-the-jarsath", { lore: true });

updateNode("item:medallion-of-the-kylong", { lore: true, size: "Tiny" });

updateNode("item:bracelet-of-sacrifice", {
  ac: -5,
  stats: { str: -2, cha: 1, wis: 6 },
  hp: -20,
  weight: 0.5,
  size: "Medium",
  magic: true,
});

updateNode("item:gauntlets-of-iron-tactics", {
  ac: 2,
  stats: { str: 7, dex: 7, wis: 7, cha: -5 },
  weight: 1.0,
  size: "Small",
  magic: true,
  lore: true,
});

updateNode("item:essence-pearl", {
  stats: { sta: 10, wis: 10, int: 10 },
  hp: 65,
  resists: { fire: 7, disease: 7, cold: 7, magic: 7, poison: 7 },
  weight: 0,
  size: "Tiny",
  magic: true,
  lore: true,
  noTrade: true,
});

updateNode("item:essence-ring", {
  ac: 8,
  hp: 65,
  mana: 65,
  resists: { fire: 12, disease: 12, cold: 12, magic: 12, poison: 12 },
  weight: 0,
  size: "Tiny",
  magic: true,
  lore: true,
  noTrade: true,
});

updateNode("item:enchanted-velium-mask", {
  ac: 5,
  stats: { agi: 5 },
  resists: { cold: 5 },
  effect: "Everlasting Breath (Any Slot, Casting Time: 2.0)",
  weight: 1.4,
  size: "Small",
  magic: true,
  lore: true,
  noTrade: true,
});

updateNode("item:velium-studded-cloak", {
  ac: 12,
  hp: 25,
  resists: { fire: 5, cold: 5 },
  effect: "Superior Camouflage at Level 30 (Must Equip, Casting Time: 0.0)",
  weight: 6.5,
  size: "Large",
  magic: true,
  lore: true,
  value: "171p 3g 5s 9c",
  classes: ["warrior", "cleric", "paladin", "ranger", "shadow knight", "bard", "shaman"],
});

updateNode("item:zombie-flesh-bracer", {
  ac: 6,
  stats: { int: 5 },
  hp: 65,
  mana: 65,
  effect: "Breath of the Dead (Worn)",
  weight: 0,
  size: "Tiny",
  magic: true,
  lore: true,
  noTrade: true,
  classes: ["necromancer", "wizard", "magician", "enchanter"],
});

updateNode("item:cloak-of-confusion", {
  ac: 14,
  stats: { str: 10, sta: 15, cha: 15 },
  hp: 45,
  resists: { fire: 5, disease: 5, cold: 5, magic: 10, poison: 5 },
  weight: 0,
  size: "Tiny",
  magic: true,
  lore: true,
  noTrade: true,
});

updateNode("item:pauldrons-of-the-deep-flame", {
  ac: 35,
  stats: { sta: 15 },
  hp: 100,
  resists: { fire: 20, disease: 20, cold: 20, magic: 20, poison: 20 },
  weight: 0.5,
  size: "Tiny",
  magic: true,
  lore: true,
  noTrade: true,
});

updateNode("item:boots-of-silent-striding", {
  ac: 35,
  stats: { sta: 10, wis: 15 },
  mana: 50,
  resists: { fire: 3, disease: 3, cold: 3, magic: 3, poison: 3 },
  effect: "Aura of Battle (Worn)",
  weight: 0,
  size: "Tiny",
  magic: true,
  lore: true,
  noTrade: true,
});

updateNode("item:dwarven-ringmail-tunic", {
  ac: 12,
  resists: { fire: 8, cold: 8, magic: 8 },
  weight: 4.5,
  size: "Medium",
  classes: ["warrior", "cleric", "paladin", "ranger", "shadow knight", "bard", "rogue"],
});

updateNode("item:flowing-black-robe", {
  ac: 8,
  stats: { sta: 5, int: 3 },
  effect: "Reanimation Efficiency I (Focus)",
  weight: 3.5,
  size: "Medium",
  classes: ["necromancer", "wizard", "magician", "enchanter"],
});

updateNode("item:cinctured-whip", {
  classes: ["shadow knight", "bard", "rogue"],
});

updateNode("item:warhammer", {
  damage: 6,
  delay: 32,
  weight: 7.5,
  size: "Medium",
  classes: [
    "bard", "beastlord", "berserker", "cleric", "druid", "monk", "paladin",
    "ranger", "rogue", "shadow knight", "shaman", "warrior",
  ],
});

updateNode("item:essence-blade", {
  skill: "1H Slashing",
  damage: 25,
  delay: 24,
  hp: 75,
  mana: 75,
  resists: { fire: 10, disease: 10, cold: 10, magic: 10, poison: 10 },
  effect: "Essence Drain (Combat, Casting Time: Instant)",
  weight: 5,
  size: "Medium",
  magic: true,
  lore: true,
  noTrade: true,
});

updateNode("item:essence-mace", {
  skill: "1H Blunt",
  damage: 13,
  delay: 18,
  hp: 50,
  mana: 50,
  resists: { fire: 10, disease: 10, cold: 10, magic: 10, poison: 10 },
  effect: "Essence Tap (Combat, Casting Time: Instant) at Level 55",
  weight: 3,
  size: "Small",
  magic: true,
  lore: true,
  noTrade: true,
});

updateNode("item:bull-smasher", {
  skill: "1H Blunt",
  damage: 6,
  delay: 20,
  stats: { str: 2, dex: 2, agi: 2 },
  weight: 4,
  size: "Medium",
  lore: true,
  classes: ["warrior", "cleric", "paladin"],
});

updateNode("item:ionys-absorber", {
  resists: { disease: 5, poison: 5 },
  weight: 0.1,
  size: "Tiny",
  magic: true,
  lore: true,
});

updateNode("item:titan-blessed-bokken", {
  ac: 4,
  hp: 10,
  damage: 7,
  delay: 32,
  weight: 5,
  size: "Medium",
  magic: true,
  classes: [
    "beastlord", "berserker", "cleric", "druid", "enchanter", "magician",
    "monk", "necromancer", "paladin", "ranger", "shadow knight", "shaman",
    "warrior", "wizard",
  ],
});

updateNode("item:titan-blessed-tachi", {
  ac: 2,
  hp: 5,
  damage: 6,
  delay: 24,
  weight: 8.5,
  size: "Medium",
  magic: true,
  classes: ["warrior", "paladin", "ranger", "shadow knight", "druid", "bard", "rogue"],
});

updateNode("item:titan-blessed-tanto", {
  ac: 2,
  hp: 5,
  damage: 4,
  delay: 19,
  weight: 3,
  size: "Small",
  magic: true,
  lore: true,
  classes: [
    "bard", "beastlord", "berserker", "enchanter", "magician", "necromancer",
    "ranger", "rogue", "shadow knight", "warrior", "wizard",
  ],
});

updateNode("item:legionnaires-mancatcher", {
  ac: 6,
  resists: { magic: 10 },
  damage: 12,
  delay: 40,
  weight: 12,
  size: "Giant",
});

updateNode("item:keg-mallet", {
  damage: 9,
  delay: 30,
  stats: { sta: 3, wis: 3 },
  weight: 1.5,
  size: "Small",
  value: "1p 1g 4s 3c",
  classes: [
    "warrior", "cleric", "paladin", "ranger", "shadow knight", "druid",
    "monk", "bard", "rogue", "shaman", "beastlord", "berserker",
  ],
});

updateNode("item:sabertooth-short-bow", {
  damage: 6,
  delay: 30,
  weight: 3.5,
  size: "Small",
  effect: "Knee Shot (Req Level 15)",
  classes: ["warrior", "ranger", "rogue"],
});

save();
console.log("Migration 353 complete: backfilled stats for 25 equipment item nodes");
