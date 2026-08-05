/**
 * Migration 418 (issue #52, batch 6/N): `Skill Tailoring`'s Reinforced
 * Armor Set -- trivial 108, Tailoring Pattern + 1 High Quality Pelt + 1-4
 * Steel Boning, classes BRD CLR DRU MNK PAL RNG ROG SHD SHM WAR, combine
 * in Small Sewing Kit (first-listed of its own 4-station "Combine" line,
 * same call as migration 417).
 *
 * **A genuine 3-way size variant, not a substitute slot.** Unlike
 * Patchwork/Studded's own interchangeable pelt (migration 417), the
 * Reinforced Armor table gives each piece three distinct named items with
 * three distinct weights -- Small (High Quality Wolf Skin), plain/Medium
 * (High Quality Cat Pelt), Large (High Quality Bear Skin), matching the
 * page's own "Sizing Guide by Race" table (Wolf=Small, Cat=Medium,
 * Bear=Large). Boning count is identical across all 3 sizes of a given
 * slot -- only the pelt type and output weight change. 11 of the 12 slots
 * get 3 distinct item names (eqlwiki's own piped links: "Small Reinforced
 * X" / "Reinforced X" / "Large Reinforced X"); Wristbands is the one
 * exception -- the wiki's own table names all three sizes identically
 * ("Reinforced Wristbands"), so that slot is modeled as a same-output
 * `variant_of` family (medium as anchor) instead of 3 separate items,
 * per decisions/tradeskill-recipe-node-schema.md's variant-family pattern.
 *
 * "Reinforced Armor" is also one of the page's own Leveling Guide rows
 * (trivial 108, generic "1x * Pattern" not naming a specific slot) --
 * Reinforced Belt (medium) is flagged `levelingGuide: true` as the
 * representative, same "pick one representative" call already used
 * elsewhere in this migration series.
 *
 * AC/weight/boning-count sourced from the page's own Reinforced Armor
 * summary table (already captured during the initial `Skill Tailoring`
 * raw-wikitext fetch), not re-fetched per item page.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

let recipesAdded = 0;
let itemsAdded = 0;

const CLASSES = ["bard", "cleric", "druid", "monk", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"];
const SLOT_MAP: Record<string, string> = {
  belt: "Waist", boot: "Feet", cap: "Head", cloak: "Back", glove: "Hands",
  gorget: "Neck", mask: "Face", pant: "Legs", shoulderpad: "Shoulders",
  sleeve: "Arms", tunic: "Chest", wristband: "Wrist",
};

function addItem(id: string, label: string, opts: Record<string, unknown> = {}) {
  if (hasNode(id)) return;
  addNode({ id, label, type: "item", ...opts });
  itemsAdded++;
}

interface Ingredient { id: string; quantity?: number; }

function addRecipe(id: string, label: string, uses: Ingredient[], produces: string, opts: Record<string, unknown> = {}) {
  addNode({ id, label, type: "recipe", tradeskill: "Tailoring", trivial: 108, ...opts });
  recipesAdded++;
  for (const ing of uses) addEdge(id, ing.id, "uses", ing.quantity && ing.quantity !== 1 ? { quantity: ing.quantity } : undefined);
  addEdge(id, produces, "produces");
  addEdge(id, "container:small-sewing-kit", "crafted_in");
}

interface SizedPiece {
  pattern: keyof typeof SLOT_MAP;
  slug: string; // e.g. "belt"
  label: string; // e.g. "Reinforced Belt"
  boning: number;
  ac: number;
  wtSmall: number;
  wtMedium: number;
  wtLarge: number;
}

const PIECES: SizedPiece[] = [
  { pattern: "belt", slug: "belt", label: "Reinforced Belt", boning: 2, ac: 5, wtSmall: 0.8, wtMedium: 1.0, wtLarge: 1.3 },
  { pattern: "boot", slug: "boots", label: "Reinforced Boots", boning: 3, ac: 6, wtSmall: 1.9, wtMedium: 2.5, wtLarge: 3.1 },
  { pattern: "cap", slug: "skullcap", label: "Reinforced Skullcap", boning: 2, ac: 6, wtSmall: 0.5, wtMedium: 0.6, wtLarge: 0.8 },
  { pattern: "cloak", slug: "cloak", label: "Reinforced Cloak", boning: 2, ac: 6, wtSmall: 1.5, wtMedium: 2.0, wtLarge: 2.5 },
  { pattern: "glove", slug: "gloves", label: "Reinforced Gloves", boning: 2, ac: 6, wtSmall: 1.1, wtMedium: 1.5, wtLarge: 1.9 },
  { pattern: "gorget", slug: "gorget", label: "Reinforced Gorget", boning: 1, ac: 5, wtSmall: 0.4, wtMedium: 0.5, wtLarge: 0.6 },
  { pattern: "mask", slug: "mask", label: "Reinforced Mask", boning: 1, ac: 4, wtSmall: 0.4, wtMedium: 0.4, wtLarge: 0.5 },
  { pattern: "pant", slug: "leggings", label: "Reinforced Leggings", boning: 3, ac: 7, wtSmall: 3.0, wtMedium: 4.0, wtLarge: 5.0 },
  { pattern: "shoulderpad", slug: "shoulderpads", label: "Reinforced Shoulderpads", boning: 2, ac: 5, wtSmall: 1.1, wtMedium: 1.5, wtLarge: 1.9 },
  { pattern: "sleeve", slug: "sleeves", label: "Reinforced Sleeves", boning: 2, ac: 6, wtSmall: 1.1, wtMedium: 1.5, wtLarge: 1.9 },
  { pattern: "tunic", slug: "tunic", label: "Reinforced Tunic", boning: 4, ac: 11, wtSmall: 2.6, wtMedium: 3.5, wtLarge: 4.4 },
  { pattern: "wristband", slug: "wristbands", label: "Reinforced Wristbands", boning: 1, ac: 5, wtSmall: 0.8, wtMedium: 1.0, wtLarge: 1.3 },
];

const SIZE_PELT: Record<"small" | "medium" | "large", string> = {
  small: "item:high-quality-wolf-skin",
  medium: "item:high-quality-cat-pelt",
  large: "item:high-quality-bear-skin",
};

for (const piece of PIECES) {
  const slot = SLOT_MAP[piece.pattern];
  const patternIng = { id: `item:${piece.pattern}-pattern` };
  const boningIng = { id: "item:steel-boning", quantity: piece.boning !== 1 ? piece.boning : undefined };

  if (piece.slug === "wristbands") {
    // Wiki names all 3 sizes identically -- one item, 3-way variant family.
    addItem("item:reinforced-wristbands", piece.label, { slots: [slot], ac: piece.ac, weight: piece.wtMedium, classes: CLASSES });
    addRecipe("recipe:reinforced-wristbands-small", `${piece.label} (Small)`, [patternIng, { ...boningIng }, { id: SIZE_PELT.small }], "item:reinforced-wristbands");
    addRecipe("recipe:reinforced-wristbands-medium", `${piece.label} (Medium)`, [patternIng, { ...boningIng }, { id: SIZE_PELT.medium }], "item:reinforced-wristbands");
    addRecipe("recipe:reinforced-wristbands-large", `${piece.label} (Large)`, [patternIng, { ...boningIng }, { id: SIZE_PELT.large }], "item:reinforced-wristbands");
    addEdge("recipe:reinforced-wristbands-small", "recipe:reinforced-wristbands-medium", "variant_of");
    addEdge("recipe:reinforced-wristbands-large", "recipe:reinforced-wristbands-medium", "variant_of");
    continue;
  }

  const smallId = `item:small-reinforced-${piece.slug}`;
  const mediumId = `item:reinforced-${piece.slug}`;
  const largeId = `item:large-reinforced-${piece.slug}`;
  addItem(smallId, `Small ${piece.label}`, { slots: [slot], ac: piece.ac, weight: piece.wtSmall, classes: CLASSES });
  addItem(mediumId, piece.label, { slots: [slot], ac: piece.ac, weight: piece.wtMedium, classes: CLASSES });
  addItem(largeId, `Large ${piece.label}`, { slots: [slot], ac: piece.ac, weight: piece.wtLarge, classes: CLASSES });

  addRecipe(`recipe:small-reinforced-${piece.slug}`, `Small ${piece.label}`, [patternIng, { ...boningIng }, { id: SIZE_PELT.small }], smallId);
  addRecipe(`recipe:reinforced-${piece.slug}`, piece.label, [patternIng, { ...boningIng }, { id: SIZE_PELT.medium }], mediumId,
    piece.slug === "belt" ? { levelingGuide: true } : {});
  addRecipe(`recipe:large-reinforced-${piece.slug}`, `Large ${piece.label}`, [patternIng, { ...boningIng }, { id: SIZE_PELT.large }], largeId);
}

save();
console.log(`Migration 418 complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s) added for Tailoring Reinforced Armor`);
