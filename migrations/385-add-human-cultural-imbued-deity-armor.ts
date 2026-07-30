/**
 * Migration 385: Human Cultural Tradeskills (issue #65), Imbued Field
 * Plate armor -- one full 12-piece set per deity (Freeport/Antonican
 * Forge), for the 7 deities Human's own eqlwiki page lists (Bertoxxulous,
 * Erollisi Marr, Innoruuk, Karana, Mithaniel Marr, Rallos Zek, Rodcet
 * Nife -- Human-eligible-class deities only, not all 16 in the game).
 *
 * Ingredients/molds/HQ Folded Sheet Metal-per-piece are identical to
 * migration 384's plain Field Plate Armor set, plus a deity-specific
 * imbued gemstone -- confirmed directly from one sample item's own page
 * (Imbued Field Breastplate (Bertoxxulous): Smithy Hammer, Sea Temper,
 * Chain Jointing, 3x High Quality Folded Sheet Metal, Imbued Black
 * Sapphire, Leather Padding, Breastplate Mold -- matches Field
 * Breastplate's own 3x/Breastplate Mold exactly). Deity gem names come
 * from the Human page's own per-deity section headers.
 *
 * Trivial values: only Rallos Zek has an explicit page table (used
 * as-is below) -- every other deity's item pages (confirmed by fetching
 * Bertoxxulous's) list Trivial as "??", eqlwiki's own placeholder for
 * unconfirmed data. Left unset here rather than assumed equal to Rallos
 * Zek's numbers (different deities' items also carry different secondary
 * stat bonuses, so there's no basis to assume trivial matches too). Even
 * Rallos Zek's own table has no Visor row -- that one piece is added with
 * trivial unset as well, same reasoning.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

let recipesAdded = 0;
let itemsAdded = 0;

function addItem(id: string, label: string, opts: Record<string, unknown> = {}) {
  if (hasNode(id)) return;
  addNode({ id, label, type: "item", ...opts });
  itemsAdded++;
}

interface Ingredient {
  id: string;
  quantity?: number;
}

function addRecipe(
  id: string,
  label: string,
  trivial: number | undefined,
  uses: Ingredient[],
  produces: string,
  craftedIn: string[]
) {
  const node: Record<string, unknown> = { id, label, type: "recipe", tradeskill: "Blacksmithing" };
  if (trivial !== undefined) node.trivial = trivial;
  addNode(node);
  recipesAdded++;
  for (const ing of uses) {
    addEdge(id, ing.id, "uses", ing.quantity && ing.quantity !== 1 ? { quantity: ing.quantity } : undefined);
  }
  addEdge(id, produces, "produces");
  for (const c of craftedIn) addEdge(id, c, "crafted_in");
}

function slugify(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const ANTONICAN_FORGE = "container:antonican-forge";

interface ImbuedPiece {
  itemLabel: string; // without " (Deity)" suffix
  sheetQty: number;
  mold: string;
  rallosZekTrivial?: number;
}

const IMBUED_PIECES: ImbuedPiece[] = [
  { itemLabel: "Imbued Field Breastplate", sheetQty: 3, mold: "Breastplate Mold", rallosZekTrivial: 245 },
  { itemLabel: "Imbued Field Plate Pauldron", sheetQty: 2, mold: "Plate Pauldron Mold", rallosZekTrivial: 223 },
  { itemLabel: "Imbued Field Plate Vambraces", sheetQty: 2, mold: "Plate Vambrace Mold", rallosZekTrivial: 228 },
  { itemLabel: "Imbued Field Plate Visor", sheetQty: 1, mold: "Plate Visor Mold" }, // no row in Rallos Zek's own table
  { itemLabel: "Imbued Field Plate Helm", sheetQty: 2, mold: "Plate Helm Mold", rallosZekTrivial: 229 },
  { itemLabel: "Imbued Field Plate Greaves", sheetQty: 3, mold: "Plate Greaves Mold", rallosZekTrivial: 236 },
  { itemLabel: "Imbued Field Plate Girdle", sheetQty: 2, mold: "Plate Belt Mold", rallosZekTrivial: 223 },
  { itemLabel: "Imbued Field Plate Gauntlets", sheetQty: 2, mold: "Plate Gauntlet Mold", rallosZekTrivial: 228 },
  { itemLabel: "Imbued Field Plate Collar", sheetQty: 1, mold: "Plate Gorget Mold", rallosZekTrivial: 228 },
  { itemLabel: "Imbued Field Plate Cloak", sheetQty: 3, mold: "Field Splinted Cloak Mold", rallosZekTrivial: 228 },
  { itemLabel: "Imbued Field Plate Bracers", sheetQty: 1, mold: "Plate Bracer Mold", rallosZekTrivial: 222 },
  { itemLabel: "Imbued Field Plate Boots", sheetQty: 2, mold: "Plate Boot Mold", rallosZekTrivial: 222 },
];

interface Deity {
  name: string;
  gemLabel: string;
}

const DEITIES: Deity[] = [
  { name: "Bertoxxulous", gemLabel: "Imbued Black Sapphire" },
  { name: "Erollisi Marr", gemLabel: "Imbued Rose Quartz" },
  { name: "Innoruuk", gemLabel: "Imbued Sapphire" },
  { name: "Karana", gemLabel: "Imbued Plains Pebble" },
  { name: "Mithaniel Marr", gemLabel: "Imbued Diamond" },
  { name: "Rallos Zek", gemLabel: "Imbued Jade" },
  { name: "Rodcet Nife", gemLabel: "Imbued Opal" },
];

for (const deity of DEITIES) {
  const gemId = `item:${slugify(deity.gemLabel)}`;
  addItem(gemId, deity.gemLabel);

  for (const piece of IMBUED_PIECES) {
    const label = `${piece.itemLabel} (${deity.name})`;
    const itemId = `item:${slugify(label)}`;
    const moldId = `item:${slugify(piece.mold)}`;
    const trivial = deity.name === "Rallos Zek" ? piece.rallosZekTrivial : undefined;

    addItem(itemId, label, {
      source: trivial !== undefined
        ? `Crafted via Blacksmithing (trivial ${trivial}) at the Antonican Forge`
        : `Crafted via Blacksmithing at the Antonican Forge; trivial unconfirmed on eqlwiki ("??")`,
    });
    addItem(moldId, piece.mold);

    addRecipe(`recipe:${slugify(label)}`, label, trivial,
      [
        { id: "item:smithy-hammer" },
        { id: "item:sea-temper" },
        { id: "item:chain-jointing" },
        { id: "item:high-quality-folded-sheet-metal", quantity: piece.sheetQty },
        { id: gemId },
        { id: "item:leather-padding" },
        { id: moldId },
      ],
      itemId, [ANTONICAN_FORGE]);
  }
}

save();
console.log(`Migration 385 complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s) added for Human Cultural Tradeskills imbued deity armor`);
