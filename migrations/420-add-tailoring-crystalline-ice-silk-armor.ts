/**
 * Migration 420 (issue #52, batch 8/N): `Skill Tailoring`'s two Velious
 * silk-caster sets -- Crystalline Silk (trivial 102-131, all classes) and
 * Ice Silk (trivial 275-335, ENC MAG NEC WIZ only). Both combine in
 * Coldain Tanners Kit, Large/Deluxe Sewing Kit, or Loom -- Coldain Tanners
 * Kit used as the representative `crafted_in` (first-listed, and the
 * Velious-tier station these two sets are themselves associated with).
 *
 * Ice Silk Swatch (trivial 15, 2x Ice Burrower Silk, Coldain Tanners Kit)
 * isn't on the page's own Bags/Miscellaneous table -- it's sourced from
 * its own item page instead, alongside Silver/Platinum Thread and Vial of
 * Purified Mana (Enchanter-summoned via Purify Mana, no soldby table).
 *
 * Four Crystalline Silk pieces are the page's own Leveling Guide rows
 * (Mask 108, Cap 115, Gloves 124, Shirt 131) -- flagged here.
 *
 * AC/resist/stat/trivial/swatch-count values sourced from the page's own
 * Crystalline Silk Armor and Ice Silk Armor summary tables (captured
 * during the initial `Skill Tailoring` raw wikitext fetch); Silver
 * Thread/Platinum Thread/Vial of Purified Mana/Ice Silk Swatch sourced
 * from their own item pages via the same MediaWiki raw-wikitext API, not
 * a summarizer.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

let recipesAdded = 0;
let itemsAdded = 0;
let vendorsAdded = 0;
let sellsEdgesAdded = 0;
const skippedVendors: string[] = [];

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

function addRecipe(id: string, label: string, trivial: number, uses: Ingredient[], produces: string, opts: Record<string, unknown> = {}) {
  addNode({ id, label, type: "recipe", tradeskill: "Tailoring", trivial, ...opts });
  recipesAdded++;
  for (const ing of uses) addEdge(id, ing.id, "uses", ing.quantity && ing.quantity !== 1 ? { quantity: ing.quantity } : undefined);
  addEdge(id, produces, "produces");
  addEdge(id, "container:coldain-tanners-kit", "crafted_in");
}

function addVendor(vendorLabel: string, zoneLabel: string, sells: string[]) {
  const zoneId = `zone:${slug(zoneLabel)}`;
  if (!hasNode(zoneId)) {
    skippedVendors.push(`${vendorLabel} (${zoneLabel}) -- zone not catalogued in this graph`);
    return;
  }
  const vendorId = `npc:${slug(zoneLabel)}:${slug(vendorLabel)}`;
  if (!hasNode(vendorId)) {
    addNode({ id: vendorId, label: vendorLabel, type: "npc", roles: ["vendor"] });
    addEdge(vendorId, zoneId, "located_in");
    vendorsAdded++;
  }
  for (const itemId of sells) {
    addEdge(vendorId, itemId, "sells");
    sellsEdgesAdded++;
  }
}

// ---------------------------------------------------------------------
// Shared thread/mana-vial ingredients.
// ---------------------------------------------------------------------
addItem("item:silver-thread", "Silver Thread", { weight: 0.1, size: "Small" });
addItem("item:platinum-thread", "Platinum Thread", { weight: 0.1, size: "Small" });
addItem("item:vial-of-purified-mana", "Vial of Purified Mana", {
  slots: ["Primary", "Secondary"], magic: true, weight: 0.1, size: "Tiny",
  source: "Created by Enchanters via the spell Purify Mana, consuming a poison vial and 4 rubies -- not vendor-sold",
});
addItem("item:ice-burrower-silk", "Ice Burrower Silk", { size: "Small", source: "Dropped by an ice burrower (Western Wastes)" });
addItem("item:ice-silk-swatch", "Ice Silk Swatch", { weight: 0.1, size: "Small" });
addRecipe("recipe:ice-silk-swatch", "Ice Silk Swatch", 15, [{ id: "item:ice-burrower-silk", quantity: 2 }], "item:ice-silk-swatch");

for (const [vendor, zone] of [["Kamzar", "West Cabilis"], ["Galbasi Weaver", "Erudin"], ["Pardas Nalue", "Paineel"], ["Kyla Frostbeard", "Thurgadin"], ["Cobi Frostbeard", "Thurgadin"]] as const) {
  addVendor(vendor, zone, ["item:silver-thread", "item:platinum-thread"]);
}

// ---------------------------------------------------------------------
// Crystalline Silk Armor -- trivial 102-131, all classes.
// ---------------------------------------------------------------------
interface CrystallinePiece { pattern: keyof typeof SLOT_MAP; slug: string; label: string; swatches: number; trivial: number; ac: number; svMagic: number; levelingGuide?: boolean; }
const CRYSTALLINE_PIECES: CrystallinePiece[] = [
  { pattern: "gorget", slug: "collar", label: "Crystalline Silk Collar", swatches: 1, trivial: 102, ac: 2, svMagic: 1 },
  { pattern: "belt", slug: "sash", label: "Crystalline Silk Sash", swatches: 2, trivial: 102, ac: 2, svMagic: 2 },
  { pattern: "cloak", slug: "cloak", label: "Crystalline Silk Cloak", swatches: 3, trivial: 108, ac: 4, svMagic: 2 },
  { pattern: "mask", slug: "mask", label: "Crystalline Silk Mask", swatches: 1, trivial: 108, ac: 2, svMagic: 1, levelingGuide: true },
  { pattern: "wristband", slug: "wristbands", label: "Crystalline Silk Wristbands", swatches: 1, trivial: 108, ac: 2, svMagic: 2 },
  { pattern: "cap", slug: "cap", label: "Crystalline Silk Cap", swatches: 1, trivial: 115, ac: 4, svMagic: 2, levelingGuide: true },
  { pattern: "boot", slug: "slippers", label: "Crystalline Silk Slippers", swatches: 2, trivial: 115, ac: 3, svMagic: 2 },
  { pattern: "shoulderpad", slug: "mantle", label: "Crystalline Silk Mantle", swatches: 1, trivial: 118, ac: 2, svMagic: 2 },
  { pattern: "glove", slug: "gloves", label: "Crystalline Silk Gloves", swatches: 2, trivial: 124, ac: 3, svMagic: 2, levelingGuide: true },
  { pattern: "sleeve", slug: "sleeves", label: "Crystalline Silk Sleeves", swatches: 2, trivial: 124, ac: 4, svMagic: 2 },
  { pattern: "pant", slug: "pantaloons", label: "Crystalline Silk Pantaloons", swatches: 3, trivial: 128, ac: 4, svMagic: 3 },
  { pattern: "tunic", slug: "shirt", label: "Crystalline Silk Shirt", swatches: 3, trivial: 131, ac: 7, svMagic: 4, levelingGuide: true },
];
for (const p of CRYSTALLINE_PIECES) {
  const itemId = `item:crystalline-silk-${p.slug}`;
  addItem(itemId, p.label, { slots: [SLOT_MAP[p.pattern]], ac: p.ac, resists: { magic: p.svMagic }, weight: 0.1, classes: [] });
  addRecipe(`recipe:crystalline-silk-${p.slug}`, p.label, p.trivial,
    [{ id: `item:${p.pattern}-pattern` }, { id: "item:silver-thread" }, { id: "item:crystalline-silk-swatch", quantity: p.swatches }],
    itemId, p.levelingGuide ? { levelingGuide: true } : {});
}

// ---------------------------------------------------------------------
// Ice Silk Armor -- trivial 275-335, ENC MAG NEC WIZ.
// ---------------------------------------------------------------------
const ICE_SILK_CLASSES = ["enchanter", "magician", "necromancer", "wizard"];
interface IceSilkPiece { pattern: keyof typeof SLOT_MAP; slug: string; label: string; swatches: number; trivial: number; ac: number; weight: number; stats: Record<string, number>; hp?: number; mana?: number; resists?: Record<string, number>; }
const ICE_SILK_PIECES: IceSilkPiece[] = [
  { pattern: "gorget", slug: "choker", label: "Ice Silk Choker", swatches: 1, trivial: 275, ac: 4, weight: 0.2, stats: { int: 4, cha: 5 }, hp: 5, mana: 10, resists: { magic: 5, cold: 5 } },
  { pattern: "mask", slug: "veil", label: "Ice Silk Veil", swatches: 1, trivial: 282, ac: 3, weight: 0.2, stats: { int: 4, cha: 4 }, hp: 5, mana: 10, resists: { magic: 5, cold: 5 } },
  { pattern: "belt", slug: "sash", label: "Ice Silk Sash", swatches: 2, trivial: 288, ac: 4, weight: 0.2, stats: { cha: 1, wis: 1, int: 3 }, hp: 5, mana: 10, resists: { magic: 5, cold: 5 } },
  { pattern: "wristband", slug: "bracelet", label: "Ice Silk Bracelet", swatches: 1, trivial: 295, ac: 3, weight: 0.3, stats: { sta: 5, cha: 3 }, hp: 5, mana: 15, resists: { cold: 5 } },
  { pattern: "shoulderpad", slug: "amice", label: "Ice Silk Amice", swatches: 1, trivial: 302, ac: 4, weight: 0.3, stats: { int: 3, cha: 5 }, hp: 5, mana: 10 },
  { pattern: "cap", slug: "cap", label: "Ice Silk Cap", swatches: 1, trivial: 308, ac: 5, weight: 0.3, stats: { int: 10, wis: 8, cha: 11 }, mana: 20, resists: { magic: 5, cold: 5 } },
  { pattern: "boot", slug: "lined-shoes", label: "Ice Silk Lined Shoes", swatches: 2, trivial: 315, ac: 4, weight: 0.7, stats: { dex: 5, cha: 4, agi: 4 }, hp: 20, mana: 8, resists: { cold: 10 } },
  { pattern: "cloak", slug: "cloak", label: "Ice Silk Cloak", swatches: 3, trivial: 322, ac: 6, weight: 0.6, stats: { int: 8, cha: 6 }, hp: 5, mana: 10, resists: { cold: 10, magic: 10 } },
  { pattern: "glove", slug: "gloves", label: "Ice Silk Gloves", swatches: 2, trivial: 328, ac: 4, weight: 0.4, stats: { int: 7, cha: 3, agi: 10 }, hp: 10, mana: 10 },
  { pattern: "sleeve", slug: "sleeves", label: "Ice Silk Sleeves", swatches: 2, trivial: 328, ac: 4, weight: 0.4, stats: { cha: 1, int: 8 }, hp: 10, mana: 10, resists: { cold: 9 } },
  { pattern: "pant", slug: "pantaloons", label: "Ice Silk Pantaloons", swatches: 3, trivial: 335, ac: 5, weight: 0.7, stats: { int: 5, cha: 6 }, hp: 20, mana: 5, resists: { cold: 9 } },
  { pattern: "tunic", slug: "robe", label: "Ice Silk Robe", swatches: 3, trivial: 335, ac: 12, weight: 1.0, stats: { int: 14, dex: 11, cha: 10 }, hp: 15, mana: 25, resists: { cold: 10 } },
];
for (const p of ICE_SILK_PIECES) {
  const itemId = `item:ice-silk-${p.slug}`;
  addItem(itemId, p.label, {
    slots: [SLOT_MAP[p.pattern]], ac: p.ac, stats: p.stats,
    ...(p.hp ? { hp: p.hp } : {}), ...(p.mana ? { mana: p.mana } : {}), ...(p.resists ? { resists: p.resists } : {}),
    weight: p.weight, magic: true, classes: ICE_SILK_CLASSES,
  });
  addRecipe(`recipe:ice-silk-${p.slug}`, p.label, p.trivial,
    [{ id: `item:${p.pattern}-pattern` }, { id: "item:platinum-thread" }, { id: "item:vial-of-purified-mana" }, { id: "item:ice-silk-swatch", quantity: p.swatches }],
    itemId);
}

save();
console.log(`Migration 420 complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s), ${vendorsAdded} new vendor npc(s), ${sellsEdgesAdded} sells edge(s) added for Crystalline Silk + Ice Silk Armor`);
if (skippedVendors.length) {
  console.log(`Skipped ${skippedVendors.length} vendor row(s) (zone not catalogued):`);
  for (const s of skippedVendors) console.log(`  - ${s}`);
}
