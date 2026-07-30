/**
 * Migration 384: Human Cultural Tradeskills (issue #65), armor sets --
 * Seafarer Ring Armor + Field Plate Armor (Freeport/Antonican Forge), and
 * Full Plate + Enchanted Full Plate across all four metal tiers (Qeynos/
 * Royal Qeynos Forge). Follows migration 383's forge/precursor setup.
 *
 * Sourced from eqlwiki.com's "Cultural Tradeskills: Human" page raw
 * wikitext, same as 383. Full Plate/Enchanted Full Plate are real tabular
 * data (Silver/Platinum have their own explicit component+trivial tables;
 * Electrum's table omits the "General Components" column but lists the
 * same trivials; Gold Full Plate has its own explicit table too) --
 * modeled per-tier, not collapsed, per issue #65's "full fidelity" scope
 * decision (every metal tier is a genuinely distinct output item).
 *
 * Gold Enchanted Full Plate is the one exception: the wiki page itself
 * only shows a {{Gear Set}} item-name list for Gold, no component table.
 * Each Gold item's own eqlwiki page confirms identical AC/WT to the
 * other three tiers but lists its own Trivial as "??" (unconfirmed by the
 * wiki itself) -- trivial is omitted for Gold Enchanted Full Plate rather
 * than guessed. Its Enchanted Folded Sheet Metal quantity-per-piece isn't
 * shown either; it's set to match the Silver/Electrum/Platinum tiers'
 * quantity for the same piece, which is identical across all three
 * confirmed tiers (a real structural pattern, not a guess at the number
 * itself) -- flagged in that item's own `source` note.
 *
 * Two of Platinum Full Plate's own trivial cells are blank on eqlwiki's
 * table itself (Collar, Splinted Cloak) -- left unset here too, same
 * "don't fabricate what the source doesn't have" rule.
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

const ANTONICAN_FORGE = "container:antonican-forge";
const ROYAL_QEYNOS_FORGE = "container:royal-qeynos-forge";

// ---------------------------------------------------------------------
// Seafarer Ring Armor (Freeport) -- Sea Temper + Smithy Hammer + N x
// Medium Quality Metal Rings + a Leather armor piece + a Pattern.
// ---------------------------------------------------------------------
addItem("item:medium-quality-metal-rings", "Medium Quality Metal Rings");

interface RingPiece {
  item: string;
  ringsQty: number;
  leather: string;
  pattern: string;
  trivial: number;
}

const RING_PIECES: RingPiece[] = [
  { item: "Seafarer Ring Mask", ringsQty: 1, leather: "Leather Mask", pattern: "Chainmail Veil Pattern", trivial: 116 },
  { item: "Seafarer Ring Gorget", ringsQty: 1, leather: "Leather Gorget", pattern: "Chainmail Neckguard Pattern", trivial: 119 },
  { item: "Seafarer Ring Bracer", ringsQty: 1, leather: "Leather Wristbands", pattern: "Chainmail Bracelet Pattern", trivial: 122 },
  { item: "Seafarer Ring Boots", ringsQty: 2, leather: "Leather Boots", pattern: "Chainmail Boot Pattern", trivial: 122 },
  { item: "Seafarer Ring Helm", ringsQty: 2, leather: "Leather Skullcap", pattern: "Chainmail Coif Pattern", trivial: 132 },
  { item: "Seafarer Ring Mantle", ringsQty: 2, leather: "Leather Shoulderpads", pattern: "Chainmail Mantle Pattern", trivial: 122 },
  { item: "Seafarer Ring Belt", ringsQty: 2, leather: "Leather Belt", pattern: "Chainmail Skirt Pattern", trivial: 122 },
  { item: "Seafarer Ring Sleeves", ringsQty: 2, leather: "Leather Sleeves", pattern: "Chainmail Sleeve Pattern", trivial: 128 },
  { item: "Seafarer Ring Gauntlets", ringsQty: 2, leather: "Leather Gloves", pattern: "Chainmail Glove Pattern", trivial: 128 },
  { item: "Seafarer Ring Mail", ringsQty: 3, leather: "Leather Tunic", pattern: "Chainmail Tunic Pattern", trivial: 142 },
  { item: "Seafarer Ring Cloak", ringsQty: 3, leather: "Leather Cloak", pattern: "Chainmail Cloak Pattern", trivial: 140 },
  { item: "Seafarer Ring Leggings", ringsQty: 3, leather: "Leather Leggings", pattern: "Chainmail Pant Pattern", trivial: 135 },
];

function slugify(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

for (const p of RING_PIECES) {
  const itemId = `item:${slugify(p.item)}`;
  const leatherId = `item:${slugify(p.leather)}`;
  const patternId = `item:${slugify(p.pattern)}`;
  addItem(itemId, p.item, { source: `Crafted via Blacksmithing (trivial ${p.trivial}) at the Antonican Forge` });
  addItem(leatherId, p.leather);
  addItem(patternId, p.pattern);
  addRecipe(`recipe:${slugify(p.item)}`, p.item, p.trivial,
    [
      { id: "item:sea-temper" },
      { id: "item:smithy-hammer" },
      { id: "item:medium-quality-metal-rings", quantity: p.ringsQty },
      { id: leatherId },
      { id: patternId },
    ],
    itemId, [ANTONICAN_FORGE]);
}

// ---------------------------------------------------------------------
// Field Plate Armor (Freeport) -- Leather Padding + Chain Jointing + Sea
// Temper + N x High Quality Folded Sheet Metal + Mold + Smithy Hammer.
// ---------------------------------------------------------------------
addItem("item:leather-padding", "Leather Padding");
addItem("item:chain-jointing", "Chain Jointing");

interface PlatePiece {
  slot: string;
  sheetQty: number;
  mold: string;
}

const FIELD_PLATE_PIECES: PlatePiece[] = [
  { slot: "Field Plate Visor", sheetQty: 1, mold: "Plate Visor Mold" },
  { slot: "Field Plate Collar", sheetQty: 1, mold: "Plate Gorget Mold" },
  { slot: "Field Plate Boots", sheetQty: 2, mold: "Plate Boot Mold" },
  { slot: "Field Plate Bracers", sheetQty: 1, mold: "Plate Bracer Mold" },
  { slot: "Field Plate Helm", sheetQty: 2, mold: "Plate Helm Mold" },
  { slot: "Field Plate Pauldron", sheetQty: 2, mold: "Plate Pauldron Mold" },
  { slot: "Field Plate Girdle", sheetQty: 2, mold: "Plate Belt Mold" },
  { slot: "Field Plate Vambraces", sheetQty: 2, mold: "Plate Vambrace Mold" },
  { slot: "Field Plate Gauntlets", sheetQty: 2, mold: "Plate Gauntlet Mold" },
  { slot: "Field Breastplate", sheetQty: 3, mold: "Breastplate Mold" },
  { slot: "Field Plate Cloak", sheetQty: 3, mold: "Field Splinted Cloak Mold" },
  { slot: "Field Plate Greaves", sheetQty: 3, mold: "Plate Greaves Mold" },
];
const FIELD_PLATE_TRIVIALS = [190, 192, 195, 195, 195, 195, 200, 198, 200, 215, 202, 215];

FIELD_PLATE_PIECES.forEach((p, i) => {
  const itemId = `item:${slugify(p.slot)}`;
  const moldId = `item:${slugify(p.mold)}`;
  const trivial = FIELD_PLATE_TRIVIALS[i];
  addItem(itemId, p.slot, { source: `Crafted via Blacksmithing (trivial ${trivial}) at the Antonican Forge` });
  addItem(moldId, p.mold);
  addRecipe(`recipe:${slugify(p.slot)}`, p.slot, trivial,
    [
      { id: "item:leather-padding" },
      { id: "item:chain-jointing" },
      { id: "item:sea-temper" },
      { id: "item:high-quality-folded-sheet-metal", quantity: p.sheetQty },
      { id: moldId },
      { id: "item:smithy-hammer" },
    ],
    itemId, [ANTONICAN_FORGE]);
});

// ---------------------------------------------------------------------
// Full Plate Armor (Qeynos), 4 metal tiers -- Leather Padding + Royal
// Temper + Chain Jointing + N x High Quality Folded Sheet Metal + Mold +
// Metal Bar + Smithy Hammer.
// ---------------------------------------------------------------------
interface FullPlatePiece {
  slot: string;
  sheetQty: number;
  mold: string;
}

const FULL_PLATE_PIECES: FullPlatePiece[] = [
  { slot: "Full Breastplate", sheetQty: 3, mold: "Full Breastplate Mold" },
  { slot: "Full Plate Boots", sheetQty: 2, mold: "Full Plate Boot Mold" },
  { slot: "Full Plate Bracer", sheetQty: 1, mold: "Full Plate Bracer Mold" },
  { slot: "Full Plate Collar", sheetQty: 1, mold: "Full Plate Gorget Mold" },
  { slot: "Full Plate Gauntlets", sheetQty: 2, mold: "Full Plate Gauntlet Mold" },
  { slot: "Full Plate Girdle", sheetQty: 2, mold: "Full Plate Belt Mold" },
  { slot: "Full Plate Greaves", sheetQty: 3, mold: "Full Plate Greaves Mold" },
  { slot: "Full Plate Helm", sheetQty: 2, mold: "Full Plate Helm Mold" },
  { slot: "Full Plate Pauldron", sheetQty: 2, mold: "Full Plate Pauldron Mold" },
  { slot: "Full Plate Vambraces", sheetQty: 2, mold: "Full Plate Vambrace Mold" },
  { slot: "Full Plate Visor", sheetQty: 1, mold: "Full Plate Visor Mold" },
  { slot: "Full Splinted Cloak", sheetQty: 3, mold: "Full Splinted Cloak Mold" },
];

interface MetalTier {
  name: string;
  barItemId: string;
  barLabel: string;
  trivials: (number | undefined)[];
}

const METAL_TIERS: MetalTier[] = [
  { name: "Silver", barItemId: "item:silver-bar", barLabel: "Silver Bar",
    trivials: [190, 190, 195, 190, 202, 195, 208, 206, 195, 202, 190, 202] },
  { name: "Electrum", barItemId: "item:electrum-bar", barLabel: "Electrum Bar",
    trivials: [222, 202, 202, 199, 208, 195, 215, 212, 195, 208, 196, 202] },
  { name: "Gold", barItemId: "item:gold-bar", barLabel: "Gold Bar",
    trivials: [224, 204, 204, 202, 211, 198, 218, 215, 198, 211, 199, 204] },
  { name: "Platinum", barItemId: "item:platinum-bar", barLabel: "Platinum Bar",
    trivials: [213, 207, 207, undefined, 214, 207, 220, 213, 200, 214, 202, undefined] },
];

for (const tier of METAL_TIERS) {
  addItem(tier.barItemId, tier.barLabel);
  FULL_PLATE_PIECES.forEach((p, i) => {
    const label = `${tier.name} ${p.slot}`;
    const itemId = `item:${slugify(label)}`;
    const moldId = `item:${slugify(p.mold)}`;
    const trivial = tier.trivials[i];
    addItem(itemId, label, {
      source: trivial !== undefined
        ? `Crafted via Blacksmithing (trivial ${trivial}) at the Royal Qeynos Forge`
        : `Crafted via Blacksmithing at the Royal Qeynos Forge (trivial not listed on eqlwiki)`,
    });
    addItem(moldId, p.mold);
    addRecipe(`recipe:${slugify(label)}`, label, trivial,
      [
        { id: "item:leather-padding" },
        { id: "item:royal-temper" },
        { id: "item:chain-jointing" },
        { id: "item:high-quality-folded-sheet-metal", quantity: p.sheetQty },
        { id: moldId },
        { id: tier.barItemId },
        { id: "item:smithy-hammer" },
      ],
      itemId, [ROYAL_QEYNOS_FORGE]);
  });
}

// ---------------------------------------------------------------------
// Enchanted Full Plate Armor (Qeynos), 4 metal tiers -- Leather Padding +
// Royal Temper + Enchanted Chain Jointing + N x Enchanted Folded Sheet
// Metal + Mold + Enchanted Metal Bar + Smithy Hammer. AC/WT identical
// across all four tiers per eqlwiki's own per-item pages; trivial varies
// (and is unconfirmed -- "??" -- for every Gold piece).
// ---------------------------------------------------------------------
interface EnchantedPlatePiece {
  slot: string; // matches FULL_PLATE_PIECES slot naming, "Enchanted " prefix added below
  sheetQty: number;
  mold: string;
  ac: number;
  weight: number;
}

const ENCHANTED_PLATE_PIECES: EnchantedPlatePiece[] = [
  { slot: "Full Breastplate", sheetQty: 3, mold: "Full Breastplate Mold", ac: 26, weight: 11.0 },
  { slot: "Full Plate Boots", sheetQty: 2, mold: "Full Plate Boot Mold", ac: 13, weight: 7.5 },
  { slot: "Full Plate Bracers", sheetQty: 1, mold: "Full Plate Bracer Mold", ac: 12, weight: 4.4 },
  { slot: "Full Plate Collar", sheetQty: 1, mold: "Full Plate Gorget Mold", ac: 9, weight: 4.5 },
  { slot: "Full Plate Gauntlets", sheetQty: 2, mold: "Full Plate Gauntlet Mold", ac: 14, weight: 5.5 },
  { slot: "Full Plate Girdle", sheetQty: 2, mold: "Full Plate Belt Mold", ac: 10, weight: 4.5 },
  { slot: "Full Plate Greaves", sheetQty: 2, mold: "Full Plate Greaves Mold", ac: 18, weight: 8.5 },
  { slot: "Full Plate Helm", sheetQty: 2, mold: "Full Plate Helm Mold", ac: 15, weight: 5.0 },
  { slot: "Full Plate Pauldron", sheetQty: 2, mold: "Full Plate Pauldron Mold", ac: 13, weight: 5.0 },
  { slot: "Full Plate Vambraces", sheetQty: 2, mold: "Full Plate Vambrace Mold", ac: 14, weight: 7.0 },
  { slot: "Full Plate Visor", sheetQty: 1, mold: "Full Plate Visor Mold", ac: 7, weight: 2.0 },
  { slot: "Full Splinted Cloak", sheetQty: 3, mold: "Full Splinted Cloak Mold", ac: 14, weight: 6.5 },
];

interface EnchantedTier {
  name: string;
  suffix: string; // "(silver)" etc, matches eqlwiki item naming
  barItemId: string;
  barLabel: string;
  trivials: (number | undefined)[];
  trivialConfirmed: boolean;
}

const ENCHANTED_TIERS: EnchantedTier[] = [
  { name: "Silver", suffix: "(silver)", barItemId: "item:enchanted-silver-bar", barLabel: "Enchanted Silver Bar",
    trivials: [235, 208, 209, 210, 225, 215, 228, 225, 215, 224, 210, 226], trivialConfirmed: true },
  { name: "Electrum", suffix: "(electrum)", barItemId: "item:enchanted-electrum-bar", barLabel: "Enchanted Electrum Bar",
    trivials: [236, 215, 210, 220, 228, 220, 232, 220, 220, 228, 215, 230], trivialConfirmed: true },
  { name: "Gold", suffix: "(gold)", barItemId: "item:enchanted-gold-bar", barLabel: "Enchanted Gold Bar",
    trivials: new Array(12).fill(undefined), trivialConfirmed: false },
  { name: "Platinum", suffix: "(platinum)", barItemId: "item:enchanted-platinum-bar", barLabel: "Enchanted Platinum Bar",
    trivials: [240, 230, 225, 230, 235, 235, 240, 230, 230, 236, 225, 238], trivialConfirmed: true },
];

for (const tier of ENCHANTED_TIERS) {
  addItem(tier.barItemId, tier.barLabel);
  ENCHANTED_PLATE_PIECES.forEach((p, i) => {
    const label = `Enchanted ${p.slot} ${tier.suffix}`;
    const itemId = `item:${slugify(label)}`;
    const moldId = `item:${slugify(p.mold)}`;
    const trivial = tier.trivials[i];
    addItem(itemId, label, {
      ac: p.ac,
      weight: p.weight,
      source: tier.trivialConfirmed
        ? `Crafted via Blacksmithing (trivial ${trivial}) at the Royal Qeynos Forge`
        : `Crafted via Blacksmithing at the Royal Qeynos Forge; trivial unconfirmed on eqlwiki ("??") -- Enchanted Folded Sheet Metal quantity inferred from the identical Silver/Electrum/Platinum tiers' pattern, since Gold's own page shows no component table`,
    });
    addItem(moldId, p.mold);
    addRecipe(`recipe:${slugify(label)}`, label, trivial,
      [
        { id: "item:leather-padding" },
        { id: "item:royal-temper" },
        { id: "item:enchanted-chain-jointing" },
        { id: "item:enchanted-folded-sheet-metal", quantity: p.sheetQty },
        { id: moldId },
        { id: tier.barItemId },
        { id: "item:smithy-hammer" },
      ],
      itemId, [ROYAL_QEYNOS_FORGE]);
  });
}

save();
console.log(`Migration 384 complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s) added for Human Cultural Tradeskills armor sets`);
