/**
 * Migration 401: adds an `alignment` field ("good" | "evil") to city zone
 * nodes -- issue: the Tradeskills Leveling Guide needs to recommend a good
 * city and an evil city to shop a trade's leveling-guide ingredients in
 * (getTradeskillLevelingCities(), src/graph.ts).
 *
 * Sourced from classic EQ's well-known starting-city alignment convention,
 * NOT verified against eqlwiki.com yet -- a deliberate, flagged exception to
 * this repo's usual "verify against eqlwiki, not classic EQ" tenet (CLAUDE.md,
 * decisions/eql-vs-classic-eq-zone-connectivity.md), made to ship this
 * feature now rather than block it on a full per-city eqlwiki pass. See
 * decisions/city-alignment-good-evil.md.
 *
 * Every other city zone (Highpass Hold, Kael Drakkal, High Keep, Icewell
 * Keep -- none are classic single-race starting cities) is left with no
 * `alignment` field at all, same "absence is the real fact, not a gap"
 * convention as an ingredient with no `sells` edge -- they're simply not
 * counted for either recommendation.
 */

import { loadGraph } from "./_lib";

const { graph, updateNode, save } = loadGraph(import.meta.dir);

const GOOD = [
  "zone:ak-anon", // Gnome
  "zone:erudin", // Erudite
  "zone:erudin-palace", // Erudite
  "zone:halas", // Barbarian
  "zone:north-kaladim", // Dwarf
  "zone:south-kaladim", // Dwarf
  "zone:north-qeynos", // Human (Qeynos)
  "zone:south-qeynos", // Human (Qeynos)
  "zone:northern-felwithe", // High Elf
  "zone:southern-felwithe", // High Elf
  "zone:rivervale", // Halfling
  "zone:thurgadin", // Dwarf (Coldain)
];

const EVIL = [
  "zone:west-freeport", // Human (Freeport)
  "zone:east-freeport", // Human (Freeport)
  "zone:north-freeport", // Human (Freeport)
  "zone:neriak-foreign-quarter", // Dark Elf
  "zone:neriak-commons", // Dark Elf
  "zone:neriak-3rd-gate", // Dark Elf
  "zone:grobb", // Troll
  "zone:oggok", // Ogre
  "zone:east-cabilis", // Iksar
  "zone:west-cabilis", // Iksar
  "zone:paineel", // Erudite (Circle of Unseen Hands)
];

for (const id of GOOD) updateNode(id, { alignment: "good" });
for (const id of EVIL) updateNode(id, { alignment: "evil" });

save();

console.log(`Tagged ${GOOD.length} good-aligned and ${EVIL.length} evil-aligned city zones.`);
