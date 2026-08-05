/**
 * Migration 419 (issue #52, batch 7/N): `Skill Tailoring`'s Master Wu's
 * Fighting Armor Set -- Monk only, 11 slots (no Belt piece; the wiki's
 * own table has no Wu's Fighting Belt). Every piece shares Tailoring
 * Pattern + 4 Heady Kiola + 1 Vial of Viscous Mana + 1-3 Silk Swatch
 * (count varies per slot); Wu's Fighting Gauntlets alone adds 1 Greater
 * Lightstone (footnoted on the page itself: "require a Greater Lightstone
 * and act as an equivalent light source when worn"). Combine: Large/
 * Deluxe Sewing Kit or Loom (Cloak/Pantaloons/Shirt explicitly require
 * Loom per the page's own note) -- `container:loom` used for all 11,
 * consistent and valid for every piece per that same note.
 *
 * Vial of Viscous Mana has no `soldby` table -- eqlwiki's own notes
 * section says it's Enchanter-summoned (Thicken Mana spell, consuming a
 * pearl + a poison vial), not vendor-sold. Greater Lightstone likewise has
 * no soldby table (drop-only, Willowisps across many zones).
 *
 * Four of these eleven pieces are the page's own Leveling Guide rows
 * (Wristbands 135, Cap 142, Sleeves 151, Pantaloons 155, Shirt 158 --
 * five, not four) -- flagged `levelingGuide: true` here.
 *
 * AC/AGI/trivial/swatch-count sourced from the page's own Wu's Fighting
 * Armor summary table (captured during the initial `Skill Tailoring` raw
 * wikitext fetch), not re-fetched per item page. Vial of Viscous Mana and
 * Greater Lightstone sourced from their own item pages.
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

function addRecipe(id: string, label: string, trivial: number, uses: Ingredient[], produces: string, opts: Record<string, unknown> = {}) {
  addNode({ id, label, type: "recipe", tradeskill: "Tailoring", trivial, ...opts });
  recipesAdded++;
  for (const ing of uses) addEdge(id, ing.id, "uses", ing.quantity && ing.quantity !== 1 ? { quantity: ing.quantity } : undefined);
  addEdge(id, produces, "produces");
  addEdge(id, "container:loom", "crafted_in");
}

addItem("item:vial-of-viscous-mana", "Vial of Viscous Mana", {
  slots: ["Primary", "Secondary"], magic: true, weight: 0.1, size: "Tiny",
  source: "Summoned by Enchanters via the spell Thicken Mana, consuming a pearl and a poison vial -- not vendor-sold",
});
addItem("item:greater-lightstone", "Greater Lightstone", {
  slots: ["Primary", "Secondary"], magic: true, lightSource: true, weight: 0.1, size: "Tiny",
  source: "Dropped by willowisps across many zones",
});

interface Piece {
  pattern: keyof typeof SLOT_MAP;
  slug: string;
  label: string;
  swatches: number;
  trivial: number;
  ac: number;
  agi: number;
  levelingGuide?: boolean;
  extra?: Ingredient[];
}

const CLASSES = ["monk"];

const PIECES: Piece[] = [
  { pattern: "glove", slug: "gauntlets", label: "Wu's Fighting Gauntlets", swatches: 1, trivial: 88, ac: 4, agi: 0, extra: [{ id: "item:greater-lightstone" }] },
  { pattern: "gorget", slug: "collar", label: "Wu's Fighting Collar", swatches: 1, trivial: 124, ac: 4, agi: 2 },
  { pattern: "belt", slug: "sash", label: "Wu's Fighting Sash", swatches: 2, trivial: 128, ac: 4, agi: 2 },
  { pattern: "cloak", slug: "cloak", label: "Wu's Fighting Cloak", swatches: 3, trivial: 135, ac: 5, agi: 4 },
  { pattern: "mask", slug: "mask", label: "Wu's Fighting Mask", swatches: 1, trivial: 135, ac: 3, agi: 1 },
  { pattern: "wristband", slug: "wristbands", label: "Wu's Fighting Wristbands", swatches: 1, trivial: 135, ac: 4, agi: 1, levelingGuide: true },
  { pattern: "cap", slug: "cap", label: "Wu's Fighting Cap", swatches: 1, trivial: 142, ac: 5, agi: 3, levelingGuide: true },
  { pattern: "shoulderpad", slug: "mantle", label: "Wu's Fighting Mantle", swatches: 1, trivial: 142, ac: 4, agi: 3 },
  { pattern: "boot", slug: "slippers", label: "Wu's Fighting Slippers", swatches: 2, trivial: 142, ac: 5, agi: 2 },
  { pattern: "sleeve", slug: "sleeves", label: "Wu's Fighting Sleeves", swatches: 2, trivial: 151, ac: 5, agi: 3, levelingGuide: true },
  { pattern: "pant", slug: "pantaloons", label: "Wu's Fighting Pantaloons", swatches: 3, trivial: 155, ac: 6, agi: 4, levelingGuide: true },
  { pattern: "tunic", slug: "shirt", label: "Wu's Fighting Shirt", swatches: 3, trivial: 158, ac: 9, agi: 4, levelingGuide: true },
];

for (const piece of PIECES) {
  const itemId = `item:wus-fighting-${piece.slug}`;
  addItem(itemId, piece.label, {
    slots: [SLOT_MAP[piece.pattern]], ac: piece.ac,
    ...(piece.agi ? { stats: { agi: piece.agi } } : {}),
    weight: 0.1, classes: CLASSES,
  });
  addRecipe(`recipe:wus-fighting-${piece.slug}`, piece.label, piece.trivial,
    [{ id: `item:${piece.pattern}-pattern` }, { id: "item:silk-swatch", quantity: piece.swatches }, { id: "item:heady-kiola", quantity: 4 }, { id: "item:vial-of-viscous-mana" }, ...(piece.extra || [])],
    itemId,
    piece.levelingGuide ? { levelingGuide: true } : {});
}

save();
console.log(`Migration 419 complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s) added for Wu's Fighting Armor`);
