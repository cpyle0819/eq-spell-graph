/**
 * Migration 007: Split faction standings into kos / wont_sell / safe / neutral.
 *
 * New model on zone nodes:
 *   faction: {
 *     race: { barbarian: "safe"|"kos"|"neutral", ... }
 *     class: { necromancer: "wont_sell"|"safe"|"neutral", ... }
 *     deity: { innoruuk: "kos"|"wont_sell"|"safe"|"neutral", ... }
 *   }
 *
 * The planner resolves the worst standing across all three dimensions:
 *   kos > wont_sell > neutral > safe
 *
 * Race determines if guards kill you (kos).
 * Class/deity determine if merchants refuse (wont_sell).
 * Some combos can be kos (e.g. necro + evil deity in certain cities).
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const DATA_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(DATA_PATH, "utf-8"));

type S = "safe" | "neutral" | "wont_sell" | "kos";

interface FactionV2 {
  race: Record<string, S>;
  class: Record<string, S>;
  deity: Record<string, S>;
}

const ALL_RACES = ["barbarian", "dark elf", "dwarf", "erudite", "gnome", "half elf", "halfling", "high elf", "human", "iksar", "ogre", "troll", "wood elf"];
const ALL_CLASSES = ["bard", "beastlord", "cleric", "druid", "enchanter", "magician", "monk", "necromancer", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior", "wizard"];
const ALL_DEITIES = ["agnostic", "bertoxxulous", "brell serilis", "bristlebane", "cazic-thule", "erollisi marr", "innoruuk", "karana", "mithaniel marr", "prexus", "quellious", "rallos zek", "rodcet nife", "solusek ro", "the tribunal", "tunare", "veeshan"];

function allSafe(list: string[]): Record<string, S> {
  return Object.fromEntries(list.map((k) => [k, "safe"]));
}
function allNeutral(list: string[]): Record<string, S> {
  return Object.fromEntries(list.map((k) => [k, "neutral"]));
}

function goodCity(overrides?: { race?: Record<string, S>; class?: Record<string, S>; deity?: Record<string, S> }): FactionV2 {
  return {
    race: {
      ...allSafe(ALL_RACES),
      "dark elf": "kos", ogre: "kos", troll: "kos", iksar: "kos",
      ...overrides?.race,
    },
    class: {
      ...allSafe(ALL_CLASSES),
      necromancer: "wont_sell", "shadow knight": "wont_sell",
      ...overrides?.class,
    },
    deity: {
      ...allSafe(ALL_DEITIES),
      innoruuk: "wont_sell", "cazic-thule": "wont_sell", bertoxxulous: "wont_sell", "rallos zek": "neutral",
      ...overrides?.deity,
    },
  };
}

function evilCity(overrides?: { race?: Record<string, S>; class?: Record<string, S>; deity?: Record<string, S> }): FactionV2 {
  return {
    race: {
      ...Object.fromEntries(ALL_RACES.map((r) => [r, "kos" as S])),
      "dark elf": "safe", ogre: "safe", troll: "safe",
      ...overrides?.race,
    },
    class: {
      ...allSafe(ALL_CLASSES),
      paladin: "wont_sell",
      ...overrides?.class,
    },
    deity: {
      ...allNeutral(ALL_DEITIES),
      innoruuk: "safe", "cazic-thule": "safe", bertoxxulous: "safe", "rallos zek": "safe",
      tunare: "wont_sell", "mithaniel marr": "wont_sell", "erollisi marr": "wont_sell",
      ...overrides?.deity,
    },
  };
}

function outdoorZone(overrides?: { race?: Record<string, S>; class?: Record<string, S>; deity?: Record<string, S> }): FactionV2 {
  return {
    race: { ...allNeutral(ALL_RACES), ...overrides?.race },
    class: { ...allSafe(ALL_CLASSES), ...overrides?.class },
    deity: { ...allNeutral(ALL_DEITIES), ...overrides?.deity },
  };
}

function iksarCity(): FactionV2 {
  return {
    race: {
      ...Object.fromEntries(ALL_RACES.map((r) => [r, "kos" as S])),
      iksar: "safe",
    },
    class: allSafe(ALL_CLASSES),
    deity: allNeutral(ALL_DEITIES),
  };
}

const ZONE_FACTIONS: Record<string, FactionV2> = {
  // === Good cities ===
  "halas": goodCity(),
  "surefall-glade": goodCity(),
  "north-qeynos": goodCity(),
  "south-qeynos": goodCity(),
  "qeynos-catacombs": goodCity({ race: { "dark elf": "neutral", ogre: "neutral", troll: "neutral", iksar: "kos" } }),
  "north-freeport": goodCity({ race: { "dark elf": "neutral" } }),
  "east-freeport": goodCity({ race: { "dark elf": "neutral" } }),
  "west-freeport": goodCity({ race: { "dark elf": "neutral" } }),
  "north-kaladim": goodCity(),
  "rivervale": goodCity(),
  "northern-felwithe": goodCity(),
  "southern-felwithe": goodCity(),
  "felwithe": goodCity(),
  "south-felwithe": goodCity(),
  "ak-anon": goodCity(),
  "erudin": goodCity({ race: { barbarian: "neutral" }, deity: { "cazic-thule": "wont_sell" } }),
  "thurgadin": goodCity({ race: { iksar: "safe" } }),
  "greater-faydark": goodCity({ race: { "dark elf": "kos" } }),

  // === Evil cities ===
  "grobb": evilCity({ race: { human: "kos", barbarian: "kos", dwarf: "kos", gnome: "kos", halfling: "kos", "high elf": "kos", "wood elf": "kos", "half elf": "kos", erudite: "kos", iksar: "kos" } }),
  "oggok": evilCity({ race: { human: "kos", barbarian: "kos", dwarf: "kos", gnome: "kos", halfling: "kos", "high elf": "kos", "wood elf": "kos", "half elf": "kos", erudite: "kos", iksar: "kos" } }),
  "neriak": evilCity({ race: { human: "kos", barbarian: "kos", dwarf: "kos", gnome: "kos", halfling: "kos", "high elf": "kos", "wood elf": "kos", "half elf": "kos", erudite: "kos", iksar: "kos" } }),
  "neriak-foreign-quarter": evilCity({ race: { human: "neutral", "half elf": "neutral" } }),
  "neriak-commons": evilCity(),
  "neriak-3rd-gate": evilCity(),
  "paineel": {
    race: {
      ...Object.fromEntries(ALL_RACES.map((r) => [r, "kos" as S])),
      erudite: "safe", "dark elf": "neutral", ogre: "neutral", troll: "neutral",
    },
    class: {
      ...allSafe(ALL_CLASSES),
      paladin: "kos",
    },
    deity: {
      ...allNeutral(ALL_DEITIES),
      "cazic-thule": "safe", bertoxxulous: "safe",
      tunare: "kos", "mithaniel marr": "kos",
    },
  },

  // === Iksar cities ===
  "east-cabilis": iksarCity(),
  "west-cabilis": iksarCity(),
  "new-sebilis-expedition": outdoorZone({ race: { iksar: "safe" } }),

  // === Kunark outdoor ===
  "field-of-bone": outdoorZone({ race: { iksar: "safe" } }),
  "lake-of-ill-omen": outdoorZone({ race: { iksar: "safe" } }),
  "firiona-vie": goodCity({ race: { iksar: "kos", "dark elf": "kos" } }),
  "the-overthere": outdoorZone(),

  // === Velious ===
  "the-wakening-land": outdoorZone(),

  // === Outdoor/transit ===
  "everfrost-peaks": outdoorZone({ race: { barbarian: "safe" } }),
  "oasis-of-marr": outdoorZone({ race: { barbarian: "safe", human: "safe" } }),
  "innothule-swamp": outdoorZone({ race: { troll: "safe", ogre: "safe" } }),
  "the-feerrott": outdoorZone({ race: { ogre: "safe", troll: "safe" } }),
  "butcherblock-mountains": outdoorZone({ race: { dwarf: "safe", gnome: "safe", barbarian: "safe", "high elf": "safe", "wood elf": "safe", "half elf": "safe", human: "safe" } }),
  "steamfont-mountains": outdoorZone({ race: { gnome: "safe", dwarf: "safe", barbarian: "safe", human: "safe" } }),
  "northern-karana": outdoorZone({ race: { barbarian: "safe", human: "safe" } }),
  "western-karana": outdoorZone({ race: { barbarian: "safe", human: "safe" } }),
  "west-karana": outdoorZone({ race: { barbarian: "safe", human: "safe" } }),
  "west-commonlands": outdoorZone(),
  "east-commonlands": outdoorZone(),
  "lavastorm-mountains": outdoorZone(),
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
    node.data.faction = outdoorZone();
    updated++;
  }
}

writeFileSync(DATA_PATH, JSON.stringify(graph, null, 2));
console.log(`Migration 007 complete: ${updated} zones updated with split faction (race/class/deity)`);
