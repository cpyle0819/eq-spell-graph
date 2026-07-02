/**
 * Migration 006: Expand faction data to cover all playable races.
 *
 * Races: barbarian, dark elf, dwarf, erudite, gnome, half elf, halfling,
 *        high elf, human, iksar, ogre, troll, wood elf
 *
 * Alignment groupings:
 * - Good: barbarian, dwarf, gnome, half elf, halfling, high elf, wood elf
 * - Neutral-Good: human, erudite (welcome most places, some exceptions)
 * - Evil: dark elf, ogre, troll
 * - Outcast: iksar (KOS nearly everywhere)
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const DATA_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(DATA_PATH, "utf-8"));

type S = "safe" | "neutral" | "unsafe";

interface FullFaction {
  barbarian: S; "dark elf": S; dwarf: S; erudite: S; gnome: S;
  "half elf": S; halfling: S; "high elf": S; human: S;
  iksar: S; ogre: S; troll: S; "wood elf": S;
}

function good(override?: Partial<FullFaction>): FullFaction {
  return {
    barbarian: "safe", dwarf: "safe", gnome: "safe", "half elf": "safe",
    halfling: "safe", "high elf": "safe", "wood elf": "safe",
    human: "safe", erudite: "safe",
    "dark elf": "unsafe", ogre: "unsafe", troll: "unsafe",
    iksar: "unsafe",
    ...override,
  };
}

function evil(override?: Partial<FullFaction>): FullFaction {
  return {
    barbarian: "unsafe", dwarf: "unsafe", gnome: "unsafe", "half elf": "unsafe",
    halfling: "unsafe", "high elf": "unsafe", "wood elf": "unsafe",
    human: "unsafe", erudite: "unsafe",
    "dark elf": "safe", ogre: "safe", troll: "safe",
    iksar: "unsafe",
    ...override,
  };
}

function outdoor(override?: Partial<FullFaction>): FullFaction {
  return {
    barbarian: "neutral", dwarf: "neutral", gnome: "neutral", "half elf": "neutral",
    halfling: "neutral", "high elf": "neutral", "wood elf": "neutral",
    human: "neutral", erudite: "neutral",
    "dark elf": "neutral", ogre: "neutral", troll: "neutral",
    iksar: "neutral",
    ...override,
  };
}

const ZONE_FACTIONS: Record<string, FullFaction> = {
  // --- Good cities ---
  "halas": good({ erudite: "neutral" }),
  "surefall-glade": good(),
  "north-qeynos": good(),
  "south-qeynos": good(),
  "qeynos-catacombs": good({ "dark elf": "neutral", troll: "neutral", ogre: "neutral" }),
  "north-freeport": good(),
  "east-freeport": good({ "dark elf": "neutral" }),
  "west-freeport": good({ "dark elf": "neutral" }),
  "north-kaladim": good(),
  "rivervale": good(),
  "northern-felwithe": good(),
  "southern-felwithe": good(),
  "felwithe": good(),
  "south-felwithe": good(),
  "ak-anon": good(),
  "greater-faydark": good({ "dark elf": "unsafe" }),
  "erudin": good({ barbarian: "neutral", "dark elf": "unsafe" }),
  "thurgadin": good({ iksar: "safe" }),

  // --- Evil cities ---
  "grobb": evil(),
  "oggok": evil(),
  "neriak": evil(),
  "neriak-foreign-quarter": evil({ human: "neutral", "half elf": "neutral" }),
  "neriak-commons": evil(),
  "neriak-3rd-gate": evil(),
  "paineel": evil({ "dark elf": "safe", erudite: "neutral", human: "neutral", ogre: "neutral", troll: "neutral", barbarian: "unsafe" }),

  // --- Kunark (Iksar territory) ---
  "east-cabilis": { ...outdoor(), iksar: "safe", barbarian: "unsafe", dwarf: "unsafe", gnome: "unsafe", "half elf": "unsafe", halfling: "unsafe", "high elf": "unsafe", "wood elf": "unsafe", human: "unsafe", erudite: "unsafe", "dark elf": "unsafe", ogre: "unsafe", troll: "unsafe" },
  "west-cabilis": { ...outdoor(), iksar: "safe", barbarian: "unsafe", dwarf: "unsafe", gnome: "unsafe", "half elf": "unsafe", halfling: "unsafe", "high elf": "unsafe", "wood elf": "unsafe", human: "unsafe", erudite: "unsafe", "dark elf": "unsafe", ogre: "unsafe", troll: "unsafe" },
  "field-of-bone": outdoor({ iksar: "safe" }),
  "lake-of-ill-omen": outdoor({ iksar: "safe" }),
  "new-sebilis-expedition": outdoor({ iksar: "safe" }),
  "firiona-vie": good({ iksar: "unsafe" }),
  "the-overthere": outdoor(),

  // --- Velious ---
  "the-wakening-land": outdoor(),

  // --- Outdoor/transit zones ---
  "everfrost-peaks": outdoor({ barbarian: "safe" }),
  "oasis-of-marr": outdoor({ barbarian: "safe", human: "safe" }),
  "innothule-swamp": outdoor({ troll: "safe", ogre: "safe" }),
  "the-feerrott": outdoor({ ogre: "safe", troll: "safe" }),
  "butcherblock-mountains": outdoor({ dwarf: "safe", gnome: "safe", barbarian: "safe", "high elf": "safe", "wood elf": "safe", "half elf": "safe", human: "safe" }),
  "steamfont-mountains": outdoor({ gnome: "safe", dwarf: "safe", barbarian: "safe", human: "safe" }),
  "northern-karana": outdoor({ barbarian: "safe", human: "safe" }),
  "western-karana": outdoor({ barbarian: "safe", human: "safe" }),
  "west-karana": outdoor({ barbarian: "safe", human: "safe" }),
  "west-commonlands": outdoor(),
  "east-commonlands": outdoor(),
  "lavastorm-mountains": outdoor(),
};

let updated = 0;
for (const node of graph.nodes) {
  if (node.data.type !== "zone") continue;
  const slug = node.data.id.replace("zone:", "");
  const faction = ZONE_FACTIONS[slug];
  if (faction) {
    node.data.faction = faction;
    updated++;
  } else if (!node.data.faction || Object.keys(node.data.faction).length <= 4) {
    // Zones without explicit data get outdoor defaults
    node.data.faction = outdoor();
    updated++;
  }
}

writeFileSync(DATA_PATH, JSON.stringify(graph, null, 2));
console.log(`Migration 006 complete: updated faction data for ${updated} zones to cover all 13 races`);
