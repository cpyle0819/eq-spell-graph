/**
 * Migration 018: Add "ability" nodes — class-defining special combat
 * actions that are neither spells, stances/invocations, nor AAs.
 *
 * New node type (per DECISIONS.md's "node types are generic and
 * extensible" rule): "ability". Shape:
 *   { label, description, class_levels: [{class, level}], duration?,
 *     reuseTime?, category?: "combat" | "utility" | "special" }
 * Uses `class_levels` (the same shape spell nodes use), NOT a `classes`
 * array + single top-level `level` like stance/invocation/aa — several of
 * these abilities are granted to more than one class at *different* levels
 * each (e.g. Kick: Monk L1, Warrior L1, Ranger L5), so a single `level`
 * field (which would have been fine for Rogue-only disciplines alone)
 * doesn't hold once "usable skills" like Kick/Disarm/Hide/Sneak are in
 * scope. `duration`/`reuseTime` are omitted (not a fixed empty string)
 * when the wiki doesn't state one — several of these are non-combat
 * utility skills with no real cooldown, or the wiki page simply never
 * says, and guessing a number would be worse than leaving it out.
 *
 * Two sources:
 *
 * 1. Rogue poison disciplines — data/disciplines.json, scraped from the
 *    wiki's "Disciplines" page (scripts/scrape-disciplines.ts). Every
 *    other class's discipline table on that page is empty or entirely
 *    struck-through ("not yet on Legends"); Rogue is the only one with
 *    live rows. category is "combat" or "utility" per the wiki's own
 *    poison-type tag.
 *
 * 2. Hand-curated "usable skill" abilities — Lay Hands, Harm Touch, and a
 *    dozen-plus classic signature actions (Backstab, Bash, Kick, Taunt,
 *    Hide, Sneak, Mend, Disarm, Pick Lock, Pick Pocket, Disarm Traps, and
 *    Monk's Kick-family specials). Not scraped: each lives on its own
 *    free-text "Skill X" wiki page with no shared template — one page uses
 *    a bullet list with inline "(Max NNN)" notes, another an actual wiki
 *    table, another an inline abbreviation string, and level/cooldown data
 *    is stated inconsistently (sometimes absent entirely). Values below
 *    are read directly off each page (fetched via the MediaWiki API,
 *    2026-07-06) — see each entry's inline citation for exactly what the
 *    source said.
 *
 *    Deliberately excluded:
 *    - Generic weapon-proficiency/tradeskill/magic-school/musical skills
 *      (1H Slash, Blacksmithing, Evocation, Singing, etc.) — these are
 *      trainable numeric caps, not a single named activatable action, so
 *      they don't fit "ability" the way Kick or Backstab does.
 *    - Slam — restricted by *race* (Barbarian/Ogre/Troll), not class; it
 *      has no "== Classes ==" section on its wiki page at all. Doesn't fit
 *      a class_levels model or the Class Browser's per-class framing.
 *    - Racial rows on Hide (Dark Elf/Wood Elf/Halfling) and Sneak
 *      (Halfling) — same reason; only the class-granted rows are kept.
 *    - Flying Kick — in Kick's "shares a cooldown with" list but wasn't
 *      part of the approved scope; add later if wanted.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const DISCIPLINES_PATH = resolve(import.meta.dir, "../data/disciplines.json");

interface Discipline {
  name: string;
  level: number;
  description: string;
  duration: string;
  reuseTime: string;
  category: "combat" | "utility";
}

interface ClassLevel {
  class: string;
  level?: number;
}

interface AbilityNode {
  id: string;
  label: string;
  type: "ability";
  description: string;
  class_levels: ClassLevel[];
  duration?: string;
  reuseTime?: string;
  category?: "combat" | "utility" | "special";
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));
const disciplines: Discipline[] = JSON.parse(readFileSync(DISCIPLINES_PATH, "utf-8"));

const abilities: AbilityNode[] = [
  // --- Rogue poison disciplines (scraped) ---
  ...disciplines.map((d) => ({
    id: `ability:${slugify(d.name)}`,
    label: d.name,
    type: "ability" as const,
    description: d.description,
    class_levels: [{ class: "rogue", level: d.level }],
    duration: d.duration,
    reuseTime: d.reuseTime,
    category: d.category,
  })),

  // --- Hand-curated: single-class special abilities ---
  {
    id: "ability:lay-hands",
    label: "Lay Hands",
    type: "ability",
    description: "An instant heal equal to roughly 32x the paladin's level to a single target (1,728 HP at level 60).",
    class_levels: [{ class: "paladin", level: 1 }], // wiki calls it an "innate ability" but never states a number
    duration: "Instant",
    reuseTime: "72 Min",
    category: "special",
  },
  {
    id: "ability:harm-touch",
    label: "Harm Touch",
    type: "ability",
    description: "Deals a large amount of damage to a single target, scaling from 11 at level 1 to 1,001 at level 60.",
    class_levels: [{ class: "shadow knight", level: 1 }], // wiki: "Shadow Knight - Level 1 (Max:200 @ lv39)"
    duration: "Instant",
    reuseTime: "20 Min",
    category: "special",
  },
  {
    id: "ability:backstab",
    label: "Backstab",
    type: "ability",
    description: "Massive damage with a piercing weapon in the main hand, if the target's back (or side, within 180°) is exposed; otherwise lands as a normal hit. Damage scales with skill and the equipped dagger.",
    class_levels: [{ class: "rogue" }], // wiki gives no unlock level, just "Classes: Rogue"
    reuseTime: "10 Sec", // wiki: "a cooldown of around 10 seconds, without haste"
    category: "special",
  },
  {
    id: "ability:mend",
    label: "Mend",
    type: "ability",
    description: "Heals the user for 25% of their total health. Below 100 skill, a failed attempt can damage instead of heal.",
    class_levels: [{ class: "monk" }], // wiki gives no unlock level, just "Monk (Max 200)"
    reuseTime: "6 Min",
    category: "special",
  },

  // --- Hand-curated: multi-class special abilities (class_levels differ per class) ---
  {
    id: "ability:bash",
    label: "Bash",
    type: "ability",
    description: "Uses an equipped shield to bash the current target for a chance to stun; the shield's AC affects damage. Shares a cooldown with Slam.",
    class_levels: [{ class: "cleric" }, { class: "paladin" }, { class: "shadow knight" }, { class: "warrior" }], // wiki states no unlock levels
    category: "special",
  },
  {
    id: "ability:kick",
    label: "Kick",
    type: "ability",
    description: "A leg strike dealing direct damage. Shares a cooldown with Bash, Slam, and the Monk kick-family specials (Round Kick, Tiger Claw, Eagle Strike, Dragon Punch/Tail Rake).",
    class_levels: [{ class: "monk", level: 1 }, { class: "warrior", level: 1 }, { class: "ranger", level: 5 }],
    category: "special",
  },
  {
    id: "ability:taunt",
    label: "Taunt",
    type: "ability",
    description: "A small chance to move the user to the top of the target's aggro list. Has no effect on a target already attacking the user.",
    class_levels: [{ class: "warrior" }, { class: "shadow knight" }, { class: "paladin" }, { class: "ranger" }], // wiki states no unlock levels
    category: "special",
  },
  {
    id: "ability:hide",
    label: "Hide",
    type: "ability",
    description: "Grants an Invisibility-like effect as long as the user doesn't move; higher skill increases success chance. (Also granted to Dark Elves/Wood Elves/Halflings by race, capped at 50 — not shown here since the Class Browser is organized by class.)",
    class_levels: [{ class: "rogue", level: 3 }, { class: "ranger", level: 25 }, { class: "bard", level: 25 }, { class: "shadow knight", level: 35 }],
    reuseTime: "10 Sec",
    category: "special",
  },
  {
    id: "ability:sneak",
    label: "Sneak",
    type: "ability",
    description: "Moves silently and appears Indifferent to any NPC not facing the user. (Also granted to Halflings by race, capped at 50 — not shown here since the Class Browser is organized by class.)",
    class_levels: [{ class: "rogue", level: 1 }, { class: "monk", level: 8 }, { class: "ranger", level: 10 }, { class: "bard", level: 17 }],
    reuseTime: "10 Sec",
    category: "special",
  },
  {
    id: "ability:disarm",
    label: "Disarm",
    type: "ability",
    description: "Dislodges the target's wielded weapon, forcing it to fight hand-to-hand. Against NPCs the weapon becomes lootable rather than dropping to the ground.",
    class_levels: [{ class: "monk", level: 27 }, { class: "rogue", level: 27 }, { class: "warrior", level: 35 }, { class: "ranger", level: 35 }, { class: "paladin", level: 40 }, { class: "shadow knight", level: 40 }],
    category: "special",
  },
  {
    id: "ability:pick-lock",
    label: "Pick Lock",
    type: "ability",
    description: "Unlocks doors that normally require a key, for as long as the door stays open. Always succeeds if skill meets the door's minimum, always fails (no skill-up chance) if it doesn't.",
    class_levels: [{ class: "rogue", level: 6 }, { class: "bard", level: 40 }],
    category: "special",
  },
  {
    id: "ability:pick-pocket",
    label: "Pick Pocket",
    type: "ability",
    description: "Attempts to steal an item or coin from a humanoid enemy. Cannot be used while auto-attacking, and can't target magic or wielded items.",
    class_levels: [{ class: "rogue", level: 7 }],
    category: "special",
  },
  {
    id: "ability:disarm-traps",
    label: "Disarm Traps",
    type: "ability",
    description: "Disables environmental traps so a group can pass safely.",
    class_levels: [{ class: "rogue" }, { class: "bard" }], // wiki gives no unlock level for either
    category: "special",
  },

  // --- Monk kick-family specials (each supersedes the last at a higher level) ---
  {
    id: "ability:round-kick",
    label: "Round Kick",
    type: "ability",
    description: "A Monk special attack, superseded by Tiger Claw at level 10.",
    class_levels: [{ class: "monk", level: 5 }],
    category: "special",
  },
  {
    id: "ability:tiger-claw",
    label: "Tiger Claw",
    type: "ability",
    description: "A Monk special attack replacing Round Kick, superseded by Eagle Strike at level 20.",
    class_levels: [{ class: "monk", level: 10 }],
    reuseTime: "6 Sec",
    category: "special",
  },
  {
    id: "ability:eagle-strike",
    label: "Eagle Strike",
    type: "ability",
    description: "A Monk special attack replacing Tiger Claw, superseded by Dragon Punch/Tail Rake at level 25. Max damage at level 20 is 16.",
    class_levels: [{ class: "monk", level: 20 }],
    reuseTime: "6 Sec",
    category: "special",
  },
  {
    id: "ability:dragon-punch",
    label: "Dragon Punch",
    type: "ability",
    description: "A Monk special attack replacing Eagle Strike, for Human Monks (Iksar Monks get Tail Rake instead). Superseded by Flying Kick at level 30.",
    class_levels: [{ class: "monk", level: 25 }],
    category: "special",
  },
  {
    id: "ability:tail-rake",
    label: "Tail Rake",
    type: "ability",
    description: "A Monk special attack replacing Eagle Strike, for Iksar Monks (Human Monks get Dragon Punch instead). Superseded by Flying Kick at level 30.",
    class_levels: [{ class: "monk", level: 25 }],
    category: "special",
  },
];

let added = 0;
for (const ability of abilities) {
  if (graph.nodes.some((n: { data: { id: string } }) => n.data.id === ability.id)) continue;
  graph.nodes.push({ data: ability });
  added++;
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log(`Migration 018 complete: ${added} ability nodes added`);
