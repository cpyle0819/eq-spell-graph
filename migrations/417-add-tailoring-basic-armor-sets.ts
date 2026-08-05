/**
 * Migration 417 (issue #52, batch 5/N): `Skill Tailoring`'s four basic
 * armor sets -- Patchwork/Tattered Leather, Raw Silk, Studded Leather,
 * Cured Silk (Monk only). Each is 12 slot pieces sharing one of the 12
 * generic Pattern items already in this graph (Belt/Boot/Cap/Cloak/Glove/
 * Gorget/Mask/Pant/Shoulderpad/Sleeve/Tunic/Wristband Pattern, all added
 * by migration 394's Wood Elf cultural work and reused here as-is).
 *
 * **Pelt/skin substitutes stay a single representative ingredient, not a
 * variant family.** Patchwork/Tattered's own intro says "1 Ruined Pelt"
 * covering Wolf/Cat/Bear interchangeably (drop info: "Cats, Bears and
 * Wolves"); Studded's own intro says "1 Medium Quality Pelt" the same way.
 * Same call as Pottery's Poison Vial pelt slot (decisions/tradeskill-
 * recipe-node-schema.md's "OR substitute ingredients" section) -- the
 * combo's shape never changes, only which animal's pelt goes in. Ruined
 * Wolf Pelt / Medium Quality Wolf Skin are the representatives (wolf is
 * first-listed in the page's own "Pelts and Skins" intro paragraph).
 *
 * **Slot mapping** follows the pattern already established by migration
 * 394's own Mithril sets: Belt->Waist, Boot->Feet, Cap->Head, Cloak->Back,
 * Glove->Hands, Gorget->Neck, Mask->Face, Pant->Legs, Shoulderpad->
 * Shoulders, Sleeve->Arms, Tunic->Chest, Wristband->Wrist -- the same
 * mapping applies regardless of a set's own display name for the slot
 * (Raw Silk's "Sash"/"Collar"/"Headband"/"Leggings"/"Mantle"/"Robe" are
 * the same Belt/Gorget/Cap/Pant/Shoulderpad/Tunic patterns under a
 * flavor name).
 *
 * **Container**: each set's own "Combine" line lists 3-4 valid stations;
 * the first-listed is used as the single `crafted_in` representative
 * (same call migration 415 made) -- Small Sewing Kit for Patchwork/Raw
 * Silk/Cured Silk, Large Sewing Kit for Studded (whose own line omits
 * Small Sewing Kit).
 *
 * Raw Silk Headband (trivial 36) and Cured Silk Mask (trivial 82) are two
 * of the page's own Leveling Guide rows -- flagged `levelingGuide: true`
 * here, the batch that actually creates them.
 *
 * AC/weight/ingredient-count sourced from the page's own per-set summary
 * tables (already captured verbatim during the initial fetch of `Skill
 * Tailoring`'s raw wikitext); not re-fetched per individual item page.
 * Patchwork and Studded's own tables give no per-piece weight column, so
 * `weight` is left unset for those two sets rather than guessed.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

let recipesAdded = 0;
let itemsAdded = 0;

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

interface Ingredient {
  id: string;
  quantity?: number;
}

function addRecipe(id: string, label: string, trivial: number, uses: Ingredient[], produces: string, craftedIn: string, opts: Record<string, unknown> = {}) {
  addNode({ id, label, type: "recipe", tradeskill: "Tailoring", trivial, ...opts });
  recipesAdded++;
  for (const ing of uses) addEdge(id, ing.id, "uses", ing.quantity && ing.quantity !== 1 ? { quantity: ing.quantity } : undefined);
  addEdge(id, produces, "produces");
  addEdge(id, craftedIn, "crafted_in");
}

interface Piece {
  pattern: keyof typeof SLOT_MAP;
  itemId: string;
  label: string;
  ac: number;
  weight?: number;
  levelingGuide?: boolean;
}

function addArmorSet(setName: string, trivial: number, classes: string[], craftedIn: string, extraUses: (piece: Piece) => Ingredient[], pieces: Piece[]) {
  for (const piece of pieces) {
    addItem(piece.itemId, piece.label, {
      slots: [SLOT_MAP[piece.pattern]], ac: piece.ac,
      ...(piece.weight !== undefined ? { weight: piece.weight } : {}),
      classes,
    });
    const recipeId = `recipe:${piece.itemId.replace("item:", "")}`;
    addRecipe(recipeId, piece.label, trivial,
      [{ id: `item:${piece.pattern}-pattern` }, ...extraUses(piece)],
      piece.itemId, craftedIn,
      piece.levelingGuide ? { levelingGuide: true } : {});
  }
  void setName;
}

// ---------------------------------------------------------------------
// Patchwork / Tattered Leather Armor -- trivial 26, 1 Ruined Wolf Pelt.
// ---------------------------------------------------------------------
const PATCHWORK_CLASSES = ["bard", "cleric", "druid", "monk", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"];
addArmorSet("Patchwork/Tattered Leather Armor", 26, PATCHWORK_CLASSES, "container:small-sewing-kit",
  () => [{ id: "item:ruined-wolf-pelt" }],
  [
    { pattern: "belt", itemId: "item:tattered-belt", label: "Tattered Belt", ac: 2 },
    { pattern: "boot", itemId: "item:patchwork-boots", label: "Patchwork Boots", ac: 3 },
    { pattern: "cap", itemId: "item:tattered-skullcap", label: "Tattered Skullcap", ac: 3 },
    { pattern: "cloak", itemId: "item:patchwork-cloak", label: "Patchwork Cloak", ac: 3 },
    { pattern: "glove", itemId: "item:tattered-gloves", label: "Tattered Gloves", ac: 3 },
    { pattern: "gorget", itemId: "item:tattered-gorget", label: "Tattered Gorget", ac: 2 },
    { pattern: "mask", itemId: "item:tattered-mask", label: "Tattered Mask", ac: 2 },
    { pattern: "pant", itemId: "item:patchwork-pants", label: "Patchwork Pants", ac: 4 },
    { pattern: "shoulderpad", itemId: "item:tattered-shoulderpads", label: "Tattered Shoulderpads", ac: 2 },
    { pattern: "sleeve", itemId: "item:patchwork-sleeves", label: "Patchwork Sleeves", ac: 3 },
    { pattern: "tunic", itemId: "item:patchwork-tunic", label: "Patchwork Tunic", ac: 6 },
    { pattern: "wristband", itemId: "item:tattered-wristbands", label: "Tattered Wristbands", ac: 2 },
  ]);

// ---------------------------------------------------------------------
// Raw Silk Armor -- trivial 36, 1-2 Silk Swatches.
// ---------------------------------------------------------------------
const RAW_SILK_CLASSES = ["monk", "magician", "necromancer", "wizard", "enchanter"];
addArmorSet("Raw Silk Armor", 36, RAW_SILK_CLASSES, "container:small-sewing-kit",
  (piece) => [{ id: "item:silk-swatch", quantity: piece.label === "Raw Silk Leggings" || piece.label === "Raw Silk Robe" ? 2 : 1 }],
  [
    { pattern: "belt", itemId: "item:raw-silk-sash", label: "Raw Silk Sash", ac: 2, weight: 0.4 },
    { pattern: "boot", itemId: "item:raw-silk-sandals", label: "Raw Silk Sandals", ac: 3, weight: 0.4 },
    { pattern: "cap", itemId: "item:raw-silk-headband", label: "Raw Silk Headband", ac: 3, weight: 0.4, levelingGuide: true },
    { pattern: "cloak", itemId: "item:raw-silk-cloak", label: "Raw Silk Cloak", ac: 3, weight: 0.4 },
    { pattern: "glove", itemId: "item:raw-silk-gloves", label: "Raw Silk Gloves", ac: 3, weight: 0.4 },
    { pattern: "gorget", itemId: "item:raw-silk-collar", label: "Raw Silk Collar", ac: 2, weight: 0.4 },
    { pattern: "mask", itemId: "item:raw-silk-mask", label: "Raw Silk Mask", ac: 2, weight: 0.4 },
    { pattern: "pant", itemId: "item:raw-silk-leggings", label: "Raw Silk Leggings", ac: 4, weight: 0.4 },
    { pattern: "shoulderpad", itemId: "item:raw-silk-mantle", label: "Raw Silk Mantle", ac: 2, weight: 0.4 },
    { pattern: "sleeve", itemId: "item:raw-silk-sleeves", label: "Raw Silk Sleeves", ac: 3, weight: 0.4 },
    { pattern: "tunic", itemId: "item:raw-silk-robe", label: "Raw Silk Robe", ac: 6, weight: 0.4 },
    { pattern: "wristband", itemId: "item:raw-silk-wristbands", label: "Raw Silk Wristbands", ac: 2, weight: 0.4 },
  ]);

// ---------------------------------------------------------------------
// Studded Leather Armor -- trivial 56, 1 Medium Quality Wolf Skin + Studs.
// ---------------------------------------------------------------------
const STUDDED_CLASSES = ["warrior", "cleric", "paladin", "ranger", "shadow knight", "druid", "monk", "bard", "rogue", "shaman"];
const STUDDED_STUDS: Record<string, number> = {
  "Studded Belt": 2, "Studded Boots": 4, "Studded Skullcap": 3, "Studded Cloak": 4, "Studded Gloves": 4,
  "Studded Gorget": 2, "Studded Mask": 1, "Studded Leggings": 4, "Studded Shoulderpads": 3, "Studded Sleeves": 3,
  "Studded Tunic": 5, "Studded Wristbands": 2,
};
addArmorSet("Studded Leather Armor", 56, STUDDED_CLASSES, "container:large-sewing-kit",
  (piece) => [{ id: "item:medium-quality-wolf-skin" }, { id: "item:studs", quantity: STUDDED_STUDS[piece.label] }],
  [
    { pattern: "belt", itemId: "item:studded-belt", label: "Studded Belt", ac: 4 },
    { pattern: "boot", itemId: "item:studded-boots", label: "Studded Boots", ac: 5 },
    { pattern: "cap", itemId: "item:studded-skullcap", label: "Studded Skullcap", ac: 5 },
    { pattern: "cloak", itemId: "item:studded-cloak", label: "Studded Cloak", ac: 5 },
    { pattern: "glove", itemId: "item:studded-gloves", label: "Studded Gloves", ac: 5 },
    { pattern: "gorget", itemId: "item:studded-gorget", label: "Studded Gorget", ac: 4 },
    { pattern: "mask", itemId: "item:studded-mask", label: "Studded Mask", ac: 3 },
    { pattern: "pant", itemId: "item:studded-leggings", label: "Studded Leggings", ac: 6 },
    { pattern: "shoulderpad", itemId: "item:studded-shoulderpads", label: "Studded Shoulderpads", ac: 4 },
    { pattern: "sleeve", itemId: "item:studded-sleeves", label: "Studded Sleeves", ac: 5 },
    { pattern: "tunic", itemId: "item:studded-tunic", label: "Studded Tunic", ac: 9 },
    { pattern: "wristband", itemId: "item:studded-wristbands", label: "Studded Wristbands", ac: 4 },
  ]);

// ---------------------------------------------------------------------
// Cured Silk Armor -- Monk only, trivial 82, 1-3 Silk Swatches + Heady Kiolas.
// ---------------------------------------------------------------------
const CURED_SILK_COUNTS: Record<string, [number, number]> = {
  "Cured Silk Sash": [1, 2], "Cured Silk Sandals": [1, 2], "Cured Silk Headband": [1, 3], "Cured Silk Cloak": [2, 2],
  "Cured Silk Handwraps": [2, 2], "Cured Silk Collar": [1, 2], "Cured Silk Mask": [1, 1], "Cured Silk Leggings": [2, 3],
  "Cured Silk Mantle": [2, 2], "Cured Silk Sleeves": [2, 2], "Cured Silk Gi": [3, 2], "Cured Silk Wristbands": [1, 2],
};
addArmorSet("Cured Silk Armor", 82, ["monk"], "container:small-sewing-kit",
  (piece) => {
    const [swatches, kiolas] = CURED_SILK_COUNTS[piece.label];
    return [{ id: "item:silk-swatch", quantity: swatches }, { id: "item:heady-kiola", quantity: kiolas }];
  },
  [
    { pattern: "belt", itemId: "item:cured-silk-sash", label: "Cured Silk Sash", ac: 3, weight: 0.1 },
    { pattern: "boot", itemId: "item:cured-silk-sandals", label: "Cured Silk Sandals", ac: 4, weight: 0.1 },
    { pattern: "cap", itemId: "item:cured-silk-headband", label: "Cured Silk Headband", ac: 4, weight: 0.1 },
    { pattern: "cloak", itemId: "item:cured-silk-cloak", label: "Cured Silk Cloak", ac: 4, weight: 0.1 },
    { pattern: "glove", itemId: "item:cured-silk-handwraps", label: "Cured Silk Handwraps", ac: 4, weight: 0.1 },
    { pattern: "gorget", itemId: "item:cured-silk-collar", label: "Cured Silk Collar", ac: 3, weight: 0.1 },
    { pattern: "mask", itemId: "item:cured-silk-mask", label: "Cured Silk Mask", ac: 2, weight: 0.1, levelingGuide: true },
    { pattern: "pant", itemId: "item:cured-silk-leggings", label: "Cured Silk Leggings", ac: 5, weight: 0.1 },
    { pattern: "shoulderpad", itemId: "item:cured-silk-mantle", label: "Cured Silk Mantle", ac: 3, weight: 0.1 },
    { pattern: "sleeve", itemId: "item:cured-silk-sleeves", label: "Cured Silk Sleeves", ac: 4, weight: 0.1 },
    { pattern: "tunic", itemId: "item:cured-silk-gi", label: "Cured Silk Gi", ac: 8, weight: 0.1 },
    { pattern: "wristband", itemId: "item:cured-silk-wristbands", label: "Cured Silk Wristbands", ac: 3, weight: 0.1 },
  ]);

save();
console.log(`Migration 417 complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s) added for Tailoring's 4 basic armor sets`);
