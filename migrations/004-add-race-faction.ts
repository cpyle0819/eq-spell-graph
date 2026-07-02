/**
 * Migration 004: Add race-faction data to zone nodes.
 *
 * Adds a `faction` property to zone nodes indicating which races are welcome/KOS.
 * Uses three tiers: "safe" (welcome), "unsafe" (KOS/hostile), "neutral" (cautious but doable).
 *
 * Shaman races: Barbarian, Troll, Ogre, Iksar
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const DATA_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(DATA_PATH, "utf-8"));

type Standing = "safe" | "neutral" | "unsafe";

interface RaceFaction {
  barbarian: Standing;
  troll: Standing;
  ogre: Standing;
  iksar: Standing;
}

// Zone faction standings for shaman races
// Based on race alignment research:
// - Barbarian (good): welcome in good cities, KOS in evil
// - Troll (evil): welcome in evil cities, KOS in good
// - Ogre (evil): welcome in evil cities, KOS in good
// - Iksar (independent): KOS everywhere except Cabilis & Thurgadin
const ZONE_FACTIONS: Record<string, RaceFaction> = {
  // Good-aligned cities
  "halas":              { barbarian: "safe",   troll: "unsafe", ogre: "unsafe", iksar: "unsafe" },
  "everfrost-peaks":    { barbarian: "safe",   troll: "neutral", ogre: "neutral", iksar: "unsafe" },
  "surefall-glade":     { barbarian: "safe",   troll: "unsafe", ogre: "unsafe", iksar: "unsafe" },
  "north-qeynos":       { barbarian: "safe",   troll: "unsafe", ogre: "unsafe", iksar: "unsafe" },
  "south-qeynos":       { barbarian: "safe",   troll: "unsafe", ogre: "unsafe", iksar: "unsafe" },
  "qeynos-catacombs":   { barbarian: "safe",   troll: "neutral", ogre: "neutral", iksar: "unsafe" },
  "north-freeport":     { barbarian: "safe",   troll: "unsafe", ogre: "unsafe", iksar: "unsafe" },
  "east-freeport":      { barbarian: "safe",   troll: "unsafe", ogre: "unsafe", iksar: "unsafe" },
  "west-freeport":      { barbarian: "safe",   troll: "unsafe", ogre: "unsafe", iksar: "unsafe" },
  "north-kaladim":      { barbarian: "safe",   troll: "unsafe", ogre: "unsafe", iksar: "unsafe" },
  "rivervale":          { barbarian: "safe",   troll: "unsafe", ogre: "unsafe", iksar: "unsafe" },
  "northern-felwithe":  { barbarian: "safe",   troll: "unsafe", ogre: "unsafe", iksar: "unsafe" },
  "southern-felwithe":  { barbarian: "safe",   troll: "unsafe", ogre: "unsafe", iksar: "unsafe" },
  "ak-anon":            { barbarian: "safe",   troll: "unsafe", ogre: "unsafe", iksar: "unsafe" },
  "erudin":             { barbarian: "neutral", troll: "unsafe", ogre: "unsafe", iksar: "unsafe" },
  "paineel":            { barbarian: "unsafe",  troll: "neutral", ogre: "neutral", iksar: "unsafe" },

  // Evil-aligned cities
  "grobb":              { barbarian: "unsafe", troll: "safe",   ogre: "safe",   iksar: "unsafe" },
  "oggok":              { barbarian: "unsafe", troll: "safe",   ogre: "safe",   iksar: "unsafe" },
  "neriak-foreign-quarter": { barbarian: "unsafe", troll: "safe", ogre: "safe", iksar: "unsafe" },
  "neriak-commons":     { barbarian: "unsafe", troll: "safe",   ogre: "safe",   iksar: "unsafe" },
  "neriak-3rd-gate":    { barbarian: "unsafe", troll: "safe",   ogre: "safe",   iksar: "unsafe" },
  // "neriak" slug used in vendor data
  "neriak":             { barbarian: "unsafe", troll: "safe",   ogre: "safe",   iksar: "unsafe" },

  // Kunark (Iksar territory)
  "east-cabilis":       { barbarian: "unsafe", troll: "unsafe", ogre: "unsafe", iksar: "safe" },
  "west-cabilis":       { barbarian: "unsafe", troll: "unsafe", ogre: "unsafe", iksar: "safe" },
  "field-of-bone":      { barbarian: "neutral", troll: "neutral", ogre: "neutral", iksar: "safe" },
  "lake-of-ill-omen":   { barbarian: "neutral", troll: "neutral", ogre: "neutral", iksar: "safe" },
  "firiona-vie":        { barbarian: "safe",   troll: "unsafe", ogre: "unsafe", iksar: "unsafe" },
  "the-overthere":      { barbarian: "neutral", troll: "neutral", ogre: "neutral", iksar: "neutral" },
  "new-sebilis-expedition": { barbarian: "neutral", troll: "neutral", ogre: "neutral", iksar: "safe" },

  // Velious
  "thurgadin":          { barbarian: "safe",   troll: "unsafe", ogre: "unsafe", iksar: "safe" },
  "the-wakening-land":  { barbarian: "neutral", troll: "neutral", ogre: "neutral", iksar: "neutral" },

  // Outdoor/neutral zones (generally safe for travel, no guards)
  "oasis-of-marr":      { barbarian: "safe",   troll: "safe",   ogre: "safe",   iksar: "neutral" },
  "innothule-swamp":    { barbarian: "neutral", troll: "safe",   ogre: "safe",   iksar: "neutral" },
  "greater-faydark":    { barbarian: "safe",   troll: "unsafe", ogre: "unsafe", iksar: "unsafe" },
  "butcherblock-mountains": { barbarian: "safe", troll: "neutral", ogre: "neutral", iksar: "unsafe" },
  "steamfont-mountains": { barbarian: "safe",  troll: "neutral", ogre: "neutral", iksar: "unsafe" },
  "northern-karana":    { barbarian: "safe",   troll: "neutral", ogre: "neutral", iksar: "neutral" },
  "western-karana":     { barbarian: "safe",   troll: "neutral", ogre: "neutral", iksar: "neutral" },
  "west-commonlands":   { barbarian: "safe",   troll: "neutral", ogre: "neutral", iksar: "neutral" },
  "east-commonlands":   { barbarian: "safe",   troll: "neutral", ogre: "neutral", iksar: "neutral" },
  "lavastorm-mountains": { barbarian: "safe",  troll: "safe",   ogre: "safe",   iksar: "neutral" },
  "the-feerrott":       { barbarian: "neutral", troll: "safe",  ogre: "safe",   iksar: "neutral" },
  "west-karana":        { barbarian: "safe",   troll: "neutral", ogre: "neutral", iksar: "neutral" },
};

let updated = 0;
for (const node of graph.nodes) {
  if (node.data.type !== "zone") continue;
  const slug = node.data.id.replace("zone:", "");
  const faction = ZONE_FACTIONS[slug];
  if (faction) {
    node.data.faction = faction;
    updated++;
  } else {
    // Default: outdoor/unknown zones are neutral for everyone
    node.data.faction = { barbarian: "neutral", troll: "neutral", ogre: "neutral", iksar: "neutral" };
  }
}

writeFileSync(DATA_PATH, JSON.stringify(graph, null, 2));
console.log(`Migration 004 complete: added faction data to ${updated} zones (${graph.nodes.filter((n: any) => n.data.type === "zone").length} total zones have faction info)`);
