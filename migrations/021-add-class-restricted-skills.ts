/**
 * Migration 021: Add class-restricted trainable skills to the "ability"
 * node type — Forage, Tracking, Safe Fall, Sense Traps.
 *
 * Migration 018 deliberately excluded "generic weapon-proficiency/
 * tradeskill/magic-school/musical skills (not a discrete named action, just
 * a trainable number)" from the Abilities tab. Issue #19 asked for skills
 * like Forage to surface, which is exactly one of those "just a trainable
 * number" skills by that rule -- but discussion landed on a different line:
 * the real question is whether a skill is *restricted* to specific classes
 * (worth knowing "what can this class do that others can't") or *universal*
 * (Fishing, Alcohol Tolerance, Swimming, Begging, Bind Wound, Sense
 * Heading -- "which classes have this" isn't a meaningful question, so
 * these stay excluded). Verified per-skill against eqlwiki.com/Skills and
 * each skill's own page (2026-07-10), not assumed from classic-EQ memory:
 *
 * - Forage (eqlwiki.com/Skill_Forage): Bard L12 (max 55), Druid L5 (max
 *   200, level-capped at (Level*5)+5), Ranger L3 (max 200). Also granted to
 *   Iksar/Wood Elf by race, fixed at 50 -- omitted, same precedent as
 *   migration 018's Hide/Sneak racial rows (Class Browser is organized by
 *   class).
 * - Tracking (eqlwiki.com/Skill_Tracking): Ranger (max 200), Druid (max
 *   125), Bard (max 100). No unlock level stated on the page.
 * - Safe Fall (eqlwiki.com/Skill_Safe_Fall): Monk (max 200), Rogue (max
 *   94), Bard (max 40). No unlock level stated on the page.
 * - Sense Traps (eqlwiki.com/Skill_Sense_Traps): Rogue L10, Bard L20.
 *
 * category: "special" (no badge rendered), matching every other
 * hand-curated entry from migration 018 -- "combat"/"utility" are reserved
 * for the scraped Rogue poison-discipline data specifically.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");

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
  category?: "combat" | "utility" | "special";
}

const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const abilities: AbilityNode[] = [
  {
    id: "ability:forage",
    label: "Forage",
    type: "ability",
    description: "Finds food and other useful items from the local environment on a timer. Druid's cap scales with level ((Level×5)+5); also granted to Iksar/Wood Elf by race, fixed at 50 — not shown here since the Class Browser is organized by class.",
    class_levels: [{ class: "bard", level: 12 }, { class: "druid", level: 5 }, { class: "ranger", level: 3 }],
    category: "special",
  },
  {
    id: "ability:tracking",
    label: "Tracking",
    type: "ability",
    description: "Follows traces of other creatures over distance; higher skill and certain classes track farther (Ranger tracks best, then Druid, then Bard).",
    class_levels: [{ class: "ranger" }, { class: "druid" }, { class: "bard" }], // wiki states no unlock level, only max skill caps
    category: "special",
  },
  {
    id: "ability:safe-fall",
    label: "Safe Fall",
    type: "ability",
    description: "Reduces or prevents damage from long falls.",
    class_levels: [{ class: "monk" }, { class: "rogue" }, { class: "bard" }], // wiki states no unlock level, only max skill caps
    category: "special",
  },
  {
    id: "ability:sense-traps",
    label: "Sense Traps",
    type: "ability",
    description: "Detects traps on objects or in passageways before they trigger.",
    class_levels: [{ class: "rogue", level: 10 }, { class: "bard", level: 20 }],
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
console.log(`Migration 021 complete: ${added} ability nodes added`);
