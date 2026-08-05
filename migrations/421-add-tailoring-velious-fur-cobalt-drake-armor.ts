/**
 * Migration 421 (issue #52, batch 9/N): `Skill Tailoring`'s Velious Fur
 * Armor (3 partial sets -- Othmir/Silver Thread/Clear Mana, Holgresh/Gold
 * Thread/Distilled Mana, Velium Hound/Platinum Thread/Purified Mana, each
 * only Boot/Cap/Cloak -- plus a standalone Velium Mastodon Fur Cloak) and
 * Cobalt Drake Armor (full 12-slot set). All combine in Coldain Tanners
 * Kit, all classes.
 *
 * Othmir Fur Cap (trivial 262) is the page's own final Leveling Guide row
 * -- flagged here. Cobalt Drake's own table gives one trivial (335) for
 * the whole set, not per-piece -- same "section header's stated trivial
 * applies uniformly" call as Arctic Wyvern (batch 10).
 *
 * Fur/hide/boning ingredients (Othmir/Holgresh/Velium Hound/Velium
 * Mastodon Fur, Cobalt Drake Hide, Velium Boning) have no `soldby` table
 * on eqlwiki -- drop-only Velious ingredients, no vendor edges. Drake Egg
 * Oil is reused from its own pre-existing recipe node.
 *
 * AC/resist/stat/weight/fur-count values sourced from the page's own
 * Velious Fur Armor and Cobalt Drake Armor summary tables (captured
 * during the initial `Skill Tailoring` raw wikitext fetch).
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
  addEdge(id, "container:coldain-tanners-kit", "crafted_in");
}

// ---------------------------------------------------------------------
// Velious Fur ingredients.
// ---------------------------------------------------------------------
addItem("item:othmir-fur", "Othmir Fur", { size: "Small", source: "Dropped (Velious)" });
addItem("item:holgresh-fur", "Holgresh Fur", { size: "Small", source: "Dropped (Velious)" });
addItem("item:velium-hound-fur", "Velium Hound Fur", { size: "Small", source: "Dropped (Velious)" });
addItem("item:velium-mastodon-fur", "Velium Mastodon Fur", { size: "Small", source: "Dropped (Velious)" });
addItem("item:gold-thread", "Gold Thread", { weight: 0.1, size: "Small" });

interface FurPiece { pattern: keyof typeof SLOT_MAP; slug: string; label: string; furs: number; trivial: number; ac: number; weight: number; stats?: Record<string, number>; hp?: number; mana?: number; resists?: Record<string, number>; levelingGuide?: boolean; }

function addFurSet(setSlug: string, thread: string, manaVial: string, fur: string, pieces: FurPiece[]) {
  for (const p of pieces) {
    const itemId = `item:${setSlug}-${p.slug}`;
    addItem(itemId, p.label, {
      slots: [SLOT_MAP[p.pattern]], ac: p.ac,
      ...(p.stats ? { stats: p.stats } : {}), ...(p.hp ? { hp: p.hp } : {}), ...(p.mana ? { mana: p.mana } : {}), ...(p.resists ? { resists: p.resists } : {}),
      weight: p.weight, classes: [],
    });
    addRecipe(`recipe:${setSlug}-${p.slug}`, p.label, p.trivial,
      [{ id: `item:${p.pattern}-pattern` }, { id: thread }, { id: manaVial }, { id: fur, quantity: p.furs }],
      itemId, p.levelingGuide ? { levelingGuide: true } : {});
  }
}

addFurSet("othmir-fur", "item:silver-thread", "item:vial-of-clear-mana", "item:othmir-fur", [
  { pattern: "boot", slug: "moccasins", label: "Othmir Fur Moccasins", furs: 3, trivial: 268, ac: 4, weight: 0.8, stats: { dex: 3, cha: 3, agi: 3 }, hp: 20, mana: 5, resists: { cold: 10 } },
  { pattern: "cap", slug: "cap", label: "Othmir Fur Cap", furs: 2, trivial: 262, ac: 3, weight: 0.4, stats: { agi: 2, dex: 3, wis: 6 }, hp: 7, resists: { cold: 4 }, levelingGuide: true },
  { pattern: "cloak", slug: "cloak", label: "Othmir Fur Cloak", furs: 4, trivial: 295, ac: 6, weight: 1.6, stats: { sta: 6, wis: 4, cha: 2 }, hp: 5, resists: { magic: 2, disease: 4 } },
]);

addFurSet("holgresh-fur", "item:gold-thread", "item:vial-of-distilled-mana", "item:holgresh-fur", [
  { pattern: "boot", slug: "moccasins", label: "Holgresh Fur Moccasins", furs: 3, trivial: 282, ac: 4, weight: 0.9, stats: { dex: 3, cha: 3 }, mana: 15, resists: { fire: 5, cold: 5, magic: 5 } },
  { pattern: "cap", slug: "cap", label: "Holgresh Fur Cap", furs: 2, trivial: 268, ac: 3, weight: 0.5, stats: { dex: 3, int: 3, agi: 3 }, mana: 5, resists: { fire: 2, cold: 2, magic: 2 } },
  { pattern: "cloak", slug: "cloak", label: "Holgresh Fur Cloak", furs: 4, trivial: 322, ac: 6, weight: 1.8, stats: { dex: 5, int: 4 }, resists: { magic: 6 } },
]);

addFurSet("velium-hound-fur", "item:platinum-thread", "item:vial-of-purified-mana", "item:velium-hound-fur", [
  { pattern: "boot", slug: "moccasins", label: "Velium Hound Fur Moccasins", furs: 3, trivial: 275, ac: 4, weight: 1.0, stats: { str: 4, sta: 8, agi: 4 }, mana: 10, resists: { fire: 10 } },
  { pattern: "cap", slug: "cap", label: "Velium Hound Fur Cap", furs: 2, trivial: 268, ac: 5, weight: 0.5, stats: { str: 6, sta: 6 }, resists: { fire: 10 } },
  { pattern: "cloak", slug: "cloak", label: "Velium Hound Fur Cloak", furs: 4, trivial: 322, ac: 8, weight: 1.9, stats: { str: 8, sta: 10 }, resists: { fire: 5, cold: 5 } },
]);

addItem("item:velium-mastodon-fur-cloak", "Velium Mastodon Fur Cloak", { slots: ["Back"], ac: 10, stats: { str: 10, sta: 10 }, resists: { cold: 10 }, weight: 4.0, classes: [] });
addRecipe("recipe:velium-mastodon-fur-cloak", "Velium Mastodon Fur Cloak", 322,
  [{ id: "item:cloak-pattern" }, { id: "item:platinum-thread" }, { id: "item:vial-of-purified-mana" }, { id: "item:velium-mastodon-fur", quantity: 4 }],
  "item:velium-mastodon-fur-cloak");

// ---------------------------------------------------------------------
// Cobalt Drake Armor -- trivial 335 (one value for the whole set).
// ---------------------------------------------------------------------
addItem("item:cobalt-drake-hide", "Cobalt Drake Hide", { size: "Large", source: "Dropped (Velious)" });
addItem("item:velium-boning", "Velium Boning", { size: "Small", source: "Dropped/crafted (Velious)" });

const COBALT_CLASSES = ["bard", "cleric", "druid", "paladin", "ranger", "rogue", "shadow knight", "shaman", "warrior"];
interface CobaltPiece { pattern: keyof typeof SLOT_MAP; slug: string; label: string; boning: number; ac: number; weight: number; stats?: Record<string, number>; mana?: number; resists?: Record<string, number>; }
const COBALT_PIECES: CobaltPiece[] = [
  { pattern: "belt", slug: "belt", label: "Cobalt Drake Belt", boning: 2, ac: 8, weight: 1.0, stats: { sta: 5, wis: 8 }, mana: 5, resists: { cold: 4 } },
  { pattern: "boot", slug: "boots", label: "Cobalt Drake Boots", boning: 3, ac: 8, weight: 2.5, stats: { sta: 4, cha: 5 }, mana: 10, resists: { cold: 5 } },
  { pattern: "cap", slug: "skullcap", label: "Cobalt Drake Skullcap", boning: 2, ac: 9, weight: 0.6, mana: 8, resists: { cold: 5 } },
  { pattern: "cloak", slug: "cloak", label: "Cobalt Drake Cloak", boning: 2, ac: 9, weight: 2.0, stats: { str: 8, wis: 4 }, mana: 23, resists: { cold: 8 } },
  { pattern: "glove", slug: "gloves", label: "Cobalt Drake Gloves", boning: 2, ac: 8, weight: 1.5, mana: 10, resists: { cold: 5 } },
  { pattern: "gorget", slug: "gorget", label: "Cobalt Drake Gorget", boning: 1, ac: 7, weight: 0.5, stats: { sta: 5 }, mana: 5, resists: { cold: 4 } },
  { pattern: "mask", slug: "mask", label: "Cobalt Drake Mask", boning: 1, ac: 6, weight: 0.4, stats: { cha: 5 }, mana: 5, resists: { cold: 3 } },
  { pattern: "pant", slug: "leggings", label: "Cobalt Drake Leggings", boning: 3, ac: 9, weight: 4.0, stats: { cha: 3 }, mana: 25, resists: { cold: 8 } },
  { pattern: "shoulderpad", slug: "shoulderpads", label: "Cobalt Drake Shoulderpads", boning: 2, ac: 7, weight: 1.5, stats: { str: 8 }, mana: 10, resists: { cold: 5 } },
  { pattern: "sleeve", slug: "sleeves", label: "Cobalt Drake Sleeves", boning: 2, ac: 8, weight: 1.5, stats: { cha: 8 }, mana: 22, resists: { cold: 6 } },
  { pattern: "tunic", slug: "tunic", label: "Cobalt Drake Tunic", boning: 4, ac: 14, weight: 3.5, stats: { sta: 8, cha: 12 }, mana: 27, resists: { cold: 10 } },
  { pattern: "wristband", slug: "wristbands", label: "Cobalt Drake Wristbands", boning: 1, ac: 7, weight: 1.0, stats: { str: 3, wis: 3 }, mana: 5, resists: { cold: 3 } },
];
for (const p of COBALT_PIECES) {
  const itemId = `item:cobalt-drake-${p.slug}`;
  addItem(itemId, p.label, {
    slots: [SLOT_MAP[p.pattern]], ac: p.ac,
    ...(p.stats ? { stats: p.stats } : {}), ...(p.mana ? { mana: p.mana } : {}), ...(p.resists ? { resists: p.resists } : {}),
    weight: p.weight, classes: COBALT_CLASSES,
  });
  addRecipe(`recipe:cobalt-drake-${p.slug}`, p.label, 335,
    [{ id: `item:${p.pattern}-pattern` }, { id: "item:cobalt-drake-hide" }, { id: "item:drake-egg-oil" }, { id: "item:velium-boning", quantity: p.boning }],
    itemId);
}

save();
console.log(`Migration 421 complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s) added for Velious Fur + Cobalt Drake Armor`);
