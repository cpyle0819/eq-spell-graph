/**
 * Migration 422 (issue #52, batch 10/N): `Skill Tailoring`'s four
 * class-restricted Velious sets under "Class Specific Armor" -- Black
 * Pantherskin (Monk), Tigeraptor (Ranger), Haze Panther (Rogue), Arctic
 * Wyvern (Shaman). All combine in Coldain Tanners Kit, all trivial 335
 * (one value per set, no per-piece column -- same "section header's
 * stated trivial applies uniformly" call as Cobalt Drake, batch 9).
 *
 * Arctic Wyvern Mask is the page's own final Leveling Guide row (trivial
 * 335, matching this set's own uniform trivial) -- flagged here, closing
 * out every Leveling Guide row this migration series covers.
 *
 * Ingredient hides/skins/studs (Black Panther Skin, Tigeraptor Hide, Haze
 * Panther Skin, Arctic Wyvern Hide, Velium Studs) have no `soldby` table
 * on eqlwiki -- drop-only Velious ingredients. Yew Leaf Tannin, Cod Oil,
 * and Drake Egg Oil are reused from their own pre-existing recipe nodes.
 *
 * Tigeraptor Boots' own table row gives no weight (the only piece across
 * all four sets missing one) -- left unset rather than guessed, same
 * "don't fabricate a field the source doesn't give" call used throughout
 * this migration series.
 *
 * AC/resist/stat/weight values sourced from the page's own four
 * "Class Specific Armor" summary tables (captured during the initial
 * `Skill Tailoring` raw wikitext fetch).
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

interface Ingredient { id: string; quantity?: number; }

function addRecipe(id: string, label: string, uses: Ingredient[], produces: string, opts: Record<string, unknown> = {}) {
  addNode({ id, label, type: "recipe", tradeskill: "Tailoring", trivial: 335, ...opts });
  recipesAdded++;
  for (const ing of uses) addEdge(id, ing.id, "uses", ing.quantity && ing.quantity !== 1 ? { quantity: ing.quantity } : undefined);
  addEdge(id, produces, "produces");
  addEdge(id, "container:coldain-tanners-kit", "crafted_in");
}

interface Piece {
  pattern: keyof typeof SLOT_MAP;
  slug: string;
  label: string;
  count: number; // hide/skin/boning/stud count
  ac: number;
  weight?: number;
  stats?: Record<string, number>;
  hp?: number;
  mana?: number;
  resists?: Record<string, number>;
  levelingGuide?: boolean;
}

function addClassSet(setSlug: string, mainIngredient: string, secondaryIngredient: string, countLabel: string, classes: string[], pieces: Piece[]) {
  for (const p of pieces) {
    const itemId = `item:${setSlug}-${p.slug}`;
    addItem(itemId, p.label, {
      slots: [SLOT_MAP[p.pattern]], ac: p.ac,
      ...(p.stats ? { stats: p.stats } : {}), ...(p.hp ? { hp: p.hp } : {}), ...(p.mana ? { mana: p.mana } : {}), ...(p.resists ? { resists: p.resists } : {}),
      ...(p.weight !== undefined ? { weight: p.weight } : {}), classes,
    });
    const uses: Ingredient[] = [{ id: `item:${p.pattern}-pattern` }, { id: mainIngredient }, { id: secondaryIngredient }, { id: `item:${countLabel}`, quantity: p.count }];
    addRecipe(`recipe:${setSlug}-${p.slug}`, p.label, uses, itemId, p.levelingGuide ? { levelingGuide: true } : {});
  }
}

// ---------------------------------------------------------------------
// Black Pantherskin -- Monk.
// ---------------------------------------------------------------------
addItem("item:black-panther-skin", "Black Panther Skin", { size: "Large", source: "Dropped (Velious)" });
addClassSet("black-pantherskin", "item:black-panther-skin", "item:yew-leaf-tannin", "velium-boning", ["monk"], [
  { pattern: "belt", slug: "belt", label: "Black Pantherskin Belt", count: 2, ac: 6, weight: 0.3, stats: { sta: 4, dex: 4 }, hp: 5 },
  { pattern: "boot", slug: "boots", label: "Black Pantherskin Boots", count: 3, ac: 7, weight: 0.5, stats: { str: 9, agi: 5, dex: 5 } },
  { pattern: "cap", slug: "skullcap", label: "Black Pantherskin Skullcap", count: 2, ac: 7, weight: 0.4, stats: { dex: 8 }, hp: 20 },
  { pattern: "cloak", slug: "cloak", label: "Black Pantherskin Cloak", count: 2, ac: 7, weight: 0.6, stats: { sta: 5, agi: 5, dex: 5 }, hp: 25 },
  { pattern: "glove", slug: "gloves", label: "Black Pantherskin Gloves", count: 2, ac: 7, weight: 0.3, stats: { str: 7, agi: 7 } },
  { pattern: "gorget", slug: "gorget", label: "Black Pantherskin Gorget", count: 1, ac: 6, weight: 0.3, stats: { sta: 5 }, hp: 10 },
  { pattern: "mask", slug: "mask", label: "Black Pantherskin Mask", count: 1, ac: 5, weight: 0.2, stats: { cha: 5 }, hp: 15 },
  { pattern: "pant", slug: "leggings", label: "Black Pantherskin Leggings", count: 3, ac: 8, weight: 0.4, stats: { str: 4, sta: 5, dex: 5 } },
  { pattern: "shoulderpad", slug: "shoulderpads", label: "Black Pantherskin Shoulderpads", count: 2, ac: 6, weight: 0.4, stats: { str: 4, dex: 4 } },
  { pattern: "sleeve", slug: "sleeves", label: "Black Pantherskin Sleeves", count: 2, ac: 7, weight: 0.4, stats: { str: 4, sta: 5, agi: 5, dex: 5 } },
  { pattern: "tunic", slug: "tunic", label: "Black Pantherskin Tunic", count: 4, ac: 11, weight: 0.5, stats: { str: 10, sta: 10, dex: 10 } },
  { pattern: "wristband", slug: "wristbands", label: "Black Pantherskin Wristbands", count: 1, ac: 6, weight: 0.1, stats: { str: 3, cha: 3 }, hp: 10 },
]);

// ---------------------------------------------------------------------
// Tigeraptor -- Ranger.
// ---------------------------------------------------------------------
addItem("item:tigeraptor-hide", "Tigeraptor Hide", { size: "Large", source: "Dropped by a tigeraptor / a tigesaurous (The Wakening Land)" });
addItem("item:velium-studs", "Velium Studs", { size: "Small", source: "Dropped/crafted (Velious)" });
addClassSet("tigeraptor", "item:tigeraptor-hide", "item:drake-egg-oil", "velium-studs", ["ranger"], [
  { pattern: "belt", slug: "belt", label: "Tigeraptor Belt", count: 2, ac: 8, weight: 1.0, stats: { str: 4, agi: 8 }, hp: 10 },
  { pattern: "boot", slug: "boots", label: "Tigeraptor Boots", count: 4, ac: 8, stats: { str: 5, dex: 8, wis: 6, agi: 8 } },
  { pattern: "cap", slug: "skullcap", label: "Tigeraptor Skullcap", count: 3, ac: 9, weight: 0.6, stats: { str: 4, dex: 4, wis: 8 } },
  { pattern: "cloak", slug: "cloak", label: "Tigeraptor Cloak", count: 4, ac: 9, weight: 2.0, stats: { str: 8, dex: 10, sta: 6, wis: 6 } },
  { pattern: "glove", slug: "gloves", label: "Tigeraptor Gloves", count: 4, ac: 8, weight: 1.5, stats: { str: 4, dex: 4, wis: 4 }, resists: { disease: 3 } },
  { pattern: "gorget", slug: "gorget", label: "Tigeraptor Gorget", count: 2, ac: 7, weight: 0.5, stats: { str: 4, wis: 4, agi: 6 } },
  { pattern: "mask", slug: "mask", label: "Tigeraptor Mask", count: 1, ac: 6, weight: 0.4, stats: { sta: 6, cha: 6 } },
  { pattern: "pant", slug: "leggings", label: "Tigeraptor Leggings", count: 4, ac: 9, weight: 4.0, stats: { str: 5, dex: 5, agi: 5 }, hp: 10 },
  { pattern: "shoulderpad", slug: "shoulderpads", label: "Tigeraptor Shoulderpads", count: 3, ac: 7, weight: 1.5, stats: { cha: 5 }, hp: 15, mana: 15 },
  { pattern: "sleeve", slug: "sleeves", label: "Tigeraptor Sleeves", count: 3, ac: 8, weight: 1.5, stats: { dex: 4, agi: 4 }, hp: 5 },
  { pattern: "tunic", slug: "tunic", label: "Tigeraptor Tunic", count: 5, ac: 14, weight: 3.5, stats: { str: 6, dex: 6, sta: 10, wis: 8 } },
  { pattern: "wristband", slug: "wristbands", label: "Tigeraptor Wristbands", count: 2, ac: 7, weight: 1.0, stats: { str: 4, sta: 2, cha: 2, agi: 4 } },
]);

// ---------------------------------------------------------------------
// Haze Panther -- Rogue.
// ---------------------------------------------------------------------
addItem("item:haze-panther-skin", "Haze Panther Skin", { size: "Large", source: "Dropped by a haze panther (The Wakening Land)" });
addClassSet("haze-panther", "item:haze-panther-skin", "item:yew-leaf-tannin", "velium-boning", ["rogue"], [
  { pattern: "belt", slug: "belt", label: "Haze Panther Belt", count: 2, ac: 8, weight: 1.0, stats: { dex: 8, agi: 10 } },
  { pattern: "boot", slug: "boots", label: "Haze Panther Boots", count: 3, ac: 8, weight: 2.5, stats: { str: 8, dex: 10, agi: 10 }, hp: 10 },
  { pattern: "cap", slug: "skullcap", label: "Haze Panther Skullcap", count: 2, ac: 9, weight: 0.6, stats: { str: 10, sta: 10, agi: 10 } },
  { pattern: "cloak", slug: "cloak", label: "Haze Panther Cloak", count: 2, ac: 9, weight: 2.0, stats: { dex: 14, agi: 14 }, hp: 25 },
  { pattern: "glove", slug: "gloves", label: "Haze Panther Gloves", count: 2, ac: 8, weight: 1.5, stats: { str: 8, dex: 10, sta: 10 } },
  { pattern: "gorget", slug: "gorget", label: "Haze Panther Gorget", count: 1, ac: 7, weight: 0.5, stats: { str: 6, agi: 8 } },
  { pattern: "mask", slug: "mask", label: "Haze Panther Mask", count: 1, ac: 6, weight: 0.4, stats: { agi: 5, cha: 3 }, hp: 15 },
  { pattern: "pant", slug: "leggings", label: "Haze Panther Leggings", count: 3, ac: 9, weight: 4.0, stats: { str: 5, dex: 8, sta: 8, agi: 8 } },
  { pattern: "shoulderpad", slug: "shoulderpads", label: "Haze Panther Shoulderpads", count: 2, ac: 7, weight: 1.5, stats: { str: 7, dex: 10 } },
  { pattern: "sleeve", slug: "sleeves", label: "Haze Panther Sleeves", count: 2, ac: 8, weight: 1.5, stats: { str: 5, sta: 10, agi: 10 }, resists: { magic: 5 } },
  { pattern: "tunic", slug: "tunic", label: "Haze Panther Tunic", count: 4, ac: 14, weight: 3.5, stats: { str: 14, dex: 10, sta: 10, agi: 20 }, resists: { fire: 5, cold: 5, magic: 5, poison: 5, disease: 5 } },
  { pattern: "wristband", slug: "wristbands", label: "Haze Panther Wristbands", count: 1, ac: 7, weight: 1.0, stats: { str: 5, sta: 4, agi: 8 } },
]);

// ---------------------------------------------------------------------
// Arctic Wyvern -- Shaman.
// ---------------------------------------------------------------------
addItem("item:arctic-wyvern-hide", "Arctic Wyvern Hide", { size: "Large", source: "Dropped by wyverns (Cobalt Scar)" });
addClassSet("arctic-wyvern", "item:arctic-wyvern-hide", "item:cod-oil", "velium-studs", ["shaman"], [
  { pattern: "belt", slug: "belt", label: "Arctic Wyvern Belt", count: 2, ac: 8, weight: 1.0, stats: { dex: 12, wis: 4 }, resists: { cold: 4 } },
  { pattern: "boot", slug: "boots", label: "Arctic Wyvern Boots", count: 4, ac: 8, weight: 2.5, stats: { str: 8, dex: 7 }, resists: { cold: 5, magic: 5 } },
  { pattern: "cap", slug: "skullcap", label: "Arctic Wyvern Skullcap", count: 3, ac: 9, weight: 0.6, stats: { wis: 10 }, resists: { cold: 5 } },
  { pattern: "cloak", slug: "cloak", label: "Arctic Wyvern Cloak", count: 4, ac: 9, weight: 2.0, stats: { str: 5, sta: 8, cha: 6, wis: 8 }, resists: { cold: 8 } },
  { pattern: "glove", slug: "gloves", label: "Arctic Wyvern Gloves", count: 4, ac: 8, weight: 1.5, stats: { dex: 5, wis: 5 }, resists: { cold: 5, magic: 5 } },
  { pattern: "gorget", slug: "gorget", label: "Arctic Wyvern Gorget", count: 2, ac: 7, weight: 0.5, stats: { sta: 8, wis: 5 }, resists: { cold: 4 } },
  { pattern: "mask", slug: "mask", label: "Arctic Wyvern Mask", count: 1, ac: 6, weight: 0.4, stats: { cha: 6, wis: 5 }, resists: { cold: 3 }, levelingGuide: true },
  { pattern: "pant", slug: "leggings", label: "Arctic Wyvern Leggings", count: 4, ac: 9, weight: 4.0, stats: { str: 6, dex: 8, wis: 5 }, resists: { cold: 8 } },
  { pattern: "shoulderpad", slug: "shoulderpads", label: "Arctic Wyvern Shoulderpads", count: 3, ac: 7, weight: 1.5, stats: { str: 2, sta: 6, cha: 8 }, resists: { cold: 5 } },
  { pattern: "sleeve", slug: "sleeves", label: "Arctic Wyvern Sleeves", count: 3, ac: 8, weight: 1.5, stats: { str: 8, sta: 6 }, resists: { cold: 6, magic: 3 } },
  { pattern: "tunic", slug: "tunic", label: "Arctic Wyvern Tunic", count: 5, ac: 14, weight: 3.5, stats: { str: 10, dex: 8, wis: 10 }, resists: { cold: 10 } },
  { pattern: "wristband", slug: "wristbands", label: "Arctic Wyvern Wristbands", count: 2, ac: 7, weight: 1.0, stats: { str: 6, sta: 5, wis: 5 }, resists: { cold: 3 } },
]);

save();
console.log(`Migration 422 complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s) added for Tailoring's 4 class-restricted Velious sets`);
