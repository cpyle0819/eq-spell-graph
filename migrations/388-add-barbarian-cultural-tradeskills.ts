/**
 * Migration 388: Barbarian Cultural Tradeskills (issue #65), full pass --
 * Northman weapons, Northman Ring chain armor, and their Imbued
 * counterparts. Second race after Human (migrations 383-385).
 *
 * Sourced from eqlwiki.com's "Cultural Tradeskills: Barbarian" page raw
 * wikitext, cross-checked against every individual produced item's own
 * page (batched MediaWiki API fetch, 35 pages, zero missing) for exact
 * stat blocks (slots/ac/damage/delay/skill/weight/size/classes/deity/
 * stats/resists/magic) and ingredient lists -- full fidelity in one pass
 * rather than the recipe-only-then-backfill-stats split that Blacksmithing
 * needed (migrations 373-381 then 386-387); this race is small enough
 * (35 recipes vs Human's 225) to do both at once.
 *
 * Where an item's own page disagreed with the summary table's trivial
 * value, the item's own page won (it's the more specific source):
 * Northman Mace (table 104 -> page 119), Northman Ring Mail (table
 * "162 (130?)" -> page 130), Northman Ring Leggings (table "155 (120?)"
 * -> page 120), Imbued Northman Ring Sleeves (table 147 -> page 149),
 * Imbued Northman Battle Axe (table's ambiguous "<=122 (150?)" -> page's
 * confirmed 150). Northman Ring Gorget's own page lists Trivial as "?"
 * (unconfirmed) despite the summary table's "<=180" guess -- left unset
 * here, same "don't fabricate what the source doesn't have" rule as
 * migration 384's blank Platinum Full Plate cells.
 *
 * No "Northman Forge" container: the summary page's own top-of-page text
 * says "Use a [[Northman Forge]]", but that link (and every individual
 * item page's own "In [[Forge|Northman Forge]]" reference) redirects to
 * eqlwiki's generic "Forge" article -- no dedicated page, no zone. Unlike
 * Human's Antonican/Royal Qeynos forges (383, real distinct pages with
 * real locations), there's nothing here to model as its own container, so
 * these recipes are crafted_in the existing generic container:forge.
 *
 * Deity-imbued weapons (Long Dagger, Claymore, Battle Axe) each have two
 * real variants per their own item pages' explicit notes ("two identically
 * named items, diety restricted to either The Tribunal (if made with
 * Imbued Ivory) or Rallos Zek (if made with Imbued Jade)") -- modeled as
 * two item/recipe node pairs each, linked with variant_of, same pattern as
 * 383's Enchanted Antonian Long Sword. Imbued Mace and Imbued Kite Shield
 * are the opposite case: each item's own page explicitly doubts whether a
 * Rallos Zek/Imbued Jade version exists ("Unsure if the other version...
 * exists?") -- only the confirmed Tribunal version is modeled, flagged in
 * its own source note rather than speculatively adding an unconfirmed
 * variant.
 *
 * classes derived from each item's own [[Category:X Equipment]] tags
 * (explicit allow-list, decisions/item-node-schema.md), not parsed from
 * the abbreviated "Class: WAR BRD ROG SHM" statsblock line.
 *
 * Ring-armor precursors (Chainmail *Pattern, Large Leather *) are new
 * items here; eqlwiki's own "Large Chainmail X Pattern" links all redirect
 * to "Chainmail X Pattern" (no "Large" in the real title) -- used the
 * redirect target as the canonical label, same convention as reusing
 * "Water Flask" for Barbarian page's "Flask of Water" links.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, updateNode, save } = loadGraph(import.meta.dir);

let recipesAdded = 0;
let itemsAdded = 0;
let itemsBackfilled = 0;

function addItem(id: string, label: string, opts: Record<string, unknown> = {}) {
  if (hasNode(id)) return;
  addNode({ id, label, type: "item", ...opts });
  itemsAdded++;
}

// addItem() no-ops if the id already exists (e.g. these 12 Chainmail *
// Pattern items were already bare nodes from an earlier migration) --
// this backfills weight/size onto those pre-existing nodes instead of
// silently leaving them incomplete now that this pass has real data.
function backfillItem(id: string, opts: Record<string, unknown>) {
  if (!hasNode(id)) return;
  updateNode(id, opts);
  itemsBackfilled++;
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

const FORGE = "container:forge";

// ---------------------------------------------------------------------
// New precursor items (molds/patterns/leather pieces already covered by
// migrations 373-381/383 are reused directly, not redeclared here).
// ---------------------------------------------------------------------
addItem("item:imbued-ivory", "Imbued Ivory", {
  weight: 0.1, size: "Tiny",
  source: "Created from Ivory via the Imbue Ivory spell; deity-restricted to The Tribunal",
});
addItem("item:chainmail-veil-pattern", "Chainmail Veil Pattern", { weight: 0.1, size: "Tiny" });
addItem("item:chainmail-neckguard-pattern", "Chainmail Neckguard Pattern", { weight: 0.1, size: "Tiny" });
addItem("item:chainmail-bracelet-pattern", "Chainmail Bracelet Pattern", { weight: 0.1, size: "Tiny" });
addItem("item:chainmail-boot-pattern", "Chainmail Boot Pattern", { weight: 0.1, size: "Tiny" });
addItem("item:chainmail-coif-pattern", "Chainmail Coif Pattern", { weight: 0.1, size: "Tiny" });
addItem("item:chainmail-mantle-pattern", "Chainmail Mantle Pattern", { weight: 0.1, size: "Tiny" });
addItem("item:chainmail-skirt-pattern", "Chainmail Skirt Pattern", { weight: 0.1, size: "Tiny" });
addItem("item:chainmail-sleeve-pattern", "Chainmail Sleeve Pattern", { weight: 0.1, size: "Tiny" });
addItem("item:chainmail-glove-pattern", "Chainmail Glove Pattern", { weight: 0.1, size: "Tiny" });
addItem("item:chainmail-tunic-pattern", "Chainmail Tunic Pattern", { weight: 0.1, size: "Tiny" });
addItem("item:chainmail-cloak-pattern", "Chainmail Cloak Pattern", { weight: 0.1, size: "Tiny" });
addItem("item:chainmail-pant-pattern", "Chainmail Pant Pattern", { weight: 0.1, size: "Tiny" });
for (const id of [
  "item:chainmail-veil-pattern", "item:chainmail-neckguard-pattern", "item:chainmail-bracelet-pattern",
  "item:chainmail-boot-pattern", "item:chainmail-coif-pattern", "item:chainmail-mantle-pattern",
  "item:chainmail-skirt-pattern", "item:chainmail-sleeve-pattern", "item:chainmail-glove-pattern",
  "item:chainmail-tunic-pattern", "item:chainmail-cloak-pattern", "item:chainmail-pant-pattern",
]) {
  backfillItem(id, { weight: 0.1, size: "Tiny" });
}
addItem("item:large-leather-mask", "Large Leather Mask", { weight: 0.5, size: "Small" });
addItem("item:large-leather-gorget", "Large Leather Gorget", { weight: 0.6, size: "Small" });
addItem("item:large-leather-wristbands", "Large Leather Wristbands", { weight: 1.3, size: "Small" });
addItem("item:large-leather-skullcap", "Large Leather Skullcap", { weight: 0.8, size: "Small" });
addItem("item:large-leather-shoulderpads", "Large Leather Shoulderpads", { weight: 1.9, size: "Small" });
addItem("item:large-leather-belt", "Large Leather Belt", { weight: 1.3, size: "Small" });
addItem("item:large-leather-sleeves", "Large Leather Sleeves", { weight: 1.9, size: "Small" });
addItem("item:large-leather-gloves", "Large Leather Gloves", { weight: 1.9, size: "Small" });
addItem("item:large-leather-tunic", "Large Leather Tunic", { weight: 4.4, size: "Medium" });
addItem("item:large-leather-cloak", "Large Leather Cloak", { weight: 2.5, size: "Medium" });
addItem("item:large-leather-leggings", "Large Leather Leggings", { weight: 5.0, size: "Medium" });

// ---------------------------------------------------------------------
// Weapons and Northman Kite Shield
// ---------------------------------------------------------------------
const LONG_DAGGER_CLASSES = ["Bard", "Enchanter", "Magician", "Necromancer", "Ranger", "Rogue", "Shadow Knight", "Warrior", "Wizard"];
addItem("item:northman-long-dagger", "Northman Long Dagger", {
  slots: ["Primary", "Secondary"], skill: "Piercing", delay: 24, damage: 6, weight: 3.0, size: "Small",
  classes: LONG_DAGGER_CLASSES,
});
addRecipe("recipe:northman-long-dagger", "Northman Long Dagger", 114,
  [{ id: "item:dagger-blade-mold" }, { id: "item:hilt-mold" }, { id: "item:medium-quality-sheet-metal" }, { id: "item:pommel-mold" }, { id: "item:water-flask" }],
  "item:northman-long-dagger", [FORGE]);

addItem("item:imbued-northman-long-dagger-the-tribunal", "Imbued Northman Long Dagger (The Tribunal)", {
  slots: ["Primary", "Secondary"], skill: "Piercing", delay: 24, damage: 6, weight: 3.0, size: "Small",
  classes: ["Bard", "Rogue", "Warrior"], stats: { sta: 4 }, resists: { cold: 2 }, deity: "The Tribunal", magic: true,
});
addItem("item:imbued-northman-long-dagger-rallos-zek", "Imbued Northman Long Dagger (Rallos Zek)", {
  slots: ["Primary", "Secondary"], skill: "Piercing", delay: 24, damage: 6, weight: 3.0, size: "Small",
  classes: ["Bard", "Rogue", "Warrior"], stats: { sta: 4 }, resists: { cold: 2 }, deity: "Rallos Zek", magic: true,
});
addRecipe("recipe:imbued-northman-long-dagger-the-tribunal", "Imbued Northman Long Dagger (The Tribunal)", 97,
  [{ id: "item:dagger-blade-mold" }, { id: "item:frost-temper" }, { id: "item:hilt-mold" }, { id: "item:imbued-ivory" }, { id: "item:medium-quality-sheet-metal" }, { id: "item:pommel-mold" }],
  "item:imbued-northman-long-dagger-the-tribunal", [FORGE]);
addRecipe("recipe:imbued-northman-long-dagger-rallos-zek", "Imbued Northman Long Dagger (Rallos Zek)", 97,
  [{ id: "item:dagger-blade-mold" }, { id: "item:frost-temper" }, { id: "item:hilt-mold" }, { id: "item:imbued-jade" }, { id: "item:medium-quality-sheet-metal" }, { id: "item:pommel-mold" }],
  "item:imbued-northman-long-dagger-rallos-zek", [FORGE]);
addEdge("recipe:imbued-northman-long-dagger-the-tribunal", "recipe:imbued-northman-long-dagger-rallos-zek", "variant_of");

const CLAYMORE_BATTLEAXE_CLASSES = ["Paladin", "Ranger", "Shadow Knight", "Warrior"];
addItem("item:northman-claymore", "Northman Claymore", {
  slots: ["Primary"], skill: "2H Slashing", delay: 44, damage: 14, weight: 11.5, size: "Giant",
  classes: CLAYMORE_BATTLEAXE_CLASSES,
});
addRecipe("recipe:northman-claymore", "Northman Claymore", 118,
  [{ id: "item:heavy-steel-blade-mold" }, { id: "item:hilt-mold" }, { id: "item:medium-quality-folded-sheet-metal" }, { id: "item:pommel-mold" }, { id: "item:water-flask" }],
  "item:northman-claymore", [FORGE]);

addItem("item:imbued-northman-claymore-the-tribunal", "Imbued Northman Claymore (The Tribunal)", {
  slots: ["Primary"], skill: "2H Slashing", delay: 44, damage: 14, weight: 11.5, size: "Large",
  classes: ["Warrior"], stats: { sta: 4 }, resists: { cold: 2 }, deity: "The Tribunal", magic: true,
});
addItem("item:imbued-northman-claymore-rallos-zek", "Imbued Northman Claymore (Rallos Zek)", {
  slots: ["Primary"], skill: "2H Slashing", delay: 44, damage: 14, weight: 11.5, size: "Large",
  classes: ["Warrior"], stats: { sta: 4 }, resists: { cold: 2 }, deity: "Rallos Zek", magic: true,
});
addRecipe("recipe:imbued-northman-claymore-the-tribunal", "Imbued Northman Claymore (The Tribunal)", 142,
  [{ id: "item:frost-temper" }, { id: "item:heavy-steel-blade-mold" }, { id: "item:hilt-mold" }, { id: "item:imbued-ivory" }, { id: "item:medium-quality-folded-sheet-metal" }, { id: "item:pommel-mold" }],
  "item:imbued-northman-claymore-the-tribunal", [FORGE]);
addRecipe("recipe:imbued-northman-claymore-rallos-zek", "Imbued Northman Claymore (Rallos Zek)", 142,
  [{ id: "item:frost-temper" }, { id: "item:heavy-steel-blade-mold" }, { id: "item:hilt-mold" }, { id: "item:imbued-jade" }, { id: "item:medium-quality-folded-sheet-metal" }, { id: "item:pommel-mold" }],
  "item:imbued-northman-claymore-rallos-zek", [FORGE]);
addEdge("recipe:imbued-northman-claymore-the-tribunal", "recipe:imbued-northman-claymore-rallos-zek", "variant_of");

addItem("item:northman-throwing-axe", "Northman Throwing Axe", {
  slots: ["Range"], skill: "Throwingv1", delay: 30, damage: 8, weight: 1.5, size: "Medium",
  classes: ["Bard", "Monk", "Ranger", "Rogue", "Warrior"],
});
addRecipe("recipe:northman-throwing-axe", "Northman Throwing Axe", 94,
  [{ id: "item:medium-quality-sheet-metal" }, { id: "item:throwing-axe-mold" }, { id: "item:water-flask" }],
  "item:northman-throwing-axe", [FORGE]);

addItem("item:northman-battle-axe", "Northman Battle Axe", {
  slots: ["Primary"], skill: "2H Slashing", delay: 48, damage: 16, weight: 15.0, size: "Giant",
  classes: CLAYMORE_BATTLEAXE_CLASSES,
});
addRecipe("recipe:northman-battle-axe", "Northman Battle Axe", 110,
  [{ id: "item:axe-head-mold" }, { id: "item:medium-quality-folded-sheet-metal" }, { id: "item:oak-shaft" }, { id: "item:water-flask" }],
  "item:northman-battle-axe", [FORGE]);

addItem("item:imbued-northman-battle-axe-the-tribunal", "Imbued Northman Battle Axe (The Tribunal)", {
  slots: ["Primary"], skill: "2H Slashing", delay: 48, damage: 16, weight: 15.0, size: "Giant",
  classes: ["Warrior"], stats: { sta: 4 }, resists: { cold: 2 }, deity: "The Tribunal", magic: true,
});
addItem("item:imbued-northman-battle-axe-rallos-zek", "Imbued Northman Battle Axe (Rallos Zek)", {
  slots: ["Primary"], skill: "2H Slashing", delay: 48, damage: 16, weight: 15.0, size: "Giant",
  classes: ["Warrior"], stats: { sta: 4 }, resists: { cold: 2 }, deity: "Rallos Zek", magic: true,
});
addRecipe("recipe:imbued-northman-battle-axe-the-tribunal", "Imbued Northman Battle Axe (The Tribunal)", 150,
  [{ id: "item:axe-head-mold" }, { id: "item:frost-temper" }, { id: "item:imbued-ivory" }, { id: "item:medium-quality-folded-sheet-metal" }, { id: "item:oak-shaft" }],
  "item:imbued-northman-battle-axe-the-tribunal", [FORGE]);
addRecipe("recipe:imbued-northman-battle-axe-rallos-zek", "Imbued Northman Battle Axe (Rallos Zek)", 150,
  [{ id: "item:axe-head-mold" }, { id: "item:frost-temper" }, { id: "item:imbued-jade" }, { id: "item:medium-quality-folded-sheet-metal" }, { id: "item:oak-shaft" }],
  "item:imbued-northman-battle-axe-rallos-zek", [FORGE]);
addEdge("recipe:imbued-northman-battle-axe-the-tribunal", "recipe:imbued-northman-battle-axe-rallos-zek", "variant_of");

addItem("item:northman-mace", "Northman Mace", {
  slots: ["Primary", "Secondary"], skill: "1H Blunt", delay: 36, damage: 9, weight: 8.5, size: "Medium",
  classes: ["Bard", "Cleric", "Druid", "Monk", "Paladin", "Ranger", "Rogue", "Shaman", "Shadow Knight", "Warrior"],
});
addRecipe("recipe:northman-mace", "Northman Mace", 119,
  [{ id: "item:mace-head-mold" }, { id: "item:medium-quality-sheet-metal" }, { id: "item:oak-shaft" }, { id: "item:water-flask" }],
  "item:northman-mace", [FORGE]);

addItem("item:imbued-northman-mace", "Imbued Northman Mace", {
  slots: ["Primary", "Secondary"], skill: "1H Blunt", delay: 36, damage: 9, weight: 8.5, size: "Medium",
  classes: ["Bard", "Rogue", "Shaman", "Warrior"], stats: { sta: 4, wis: 2 }, deity: "The Tribunal", magic: true,
  source: "eqlwiki's own page notes it's unsure whether a Rallos Zek (Imbued Jade) version also exists -- only this Tribunal (Imbued Ivory) version is confirmed",
});
addRecipe("recipe:imbued-northman-mace", "Imbued Northman Mace", 115,
  [{ id: "item:frost-temper" }, { id: "item:imbued-ivory" }, { id: "item:mace-head-mold" }, { id: "item:medium-quality-sheet-metal" }, { id: "item:oak-shaft" }],
  "item:imbued-northman-mace", [FORGE]);

const KITE_SHIELD_CLASSES = ["Bard", "Cleric", "Paladin", "Ranger", "Rogue", "Shaman", "Shadow Knight", "Warrior"];
addItem("item:northman-kite-shield", "Northman Kite Shield", {
  slots: ["Secondary"], ac: 10, hp: 4, resists: { cold: 5 }, weight: 10.0, size: "Large",
  classes: KITE_SHIELD_CLASSES,
});
addRecipe("recipe:northman-kite-shield", "Northman Kite Shield", 114,
  [{ id: "item:kite-shield-mold" }, { id: "item:medium-quality-sheet-metal" }, { id: "item:smithy-hammer" }, { id: "item:water-flask" }],
  "item:northman-kite-shield", [FORGE]);

addItem("item:imbued-northman-kite-shield", "Imbued Northman Kite Shield", {
  slots: ["Secondary"], ac: 10, stats: { wis: 3 }, hp: 4, resists: { cold: 5 }, weight: 10.0, size: "Large",
  classes: KITE_SHIELD_CLASSES, deity: "The Tribunal", magic: true,
  source: "eqlwiki's own page notes it's unsure whether a Rallos Zek (Imbued Jade) version also exists -- only this Tribunal (Imbued Ivory) version is confirmed",
});
addRecipe("recipe:imbued-northman-kite-shield", "Imbued Northman Kite Shield", 115,
  [{ id: "item:frost-temper" }, { id: "item:imbued-ivory" }, { id: "item:kite-shield-mold" }, { id: "item:medium-quality-folded-sheet-metal" }, { id: "item:smithy-hammer" }],
  "item:imbued-northman-kite-shield", [FORGE]);

// ---------------------------------------------------------------------
// Northman Ring armor (12 pieces) and Imbued Northman Ring armor (12
// pieces) -- both share the same per-piece slot/ac/weight/size, differing
// only in classes/deity/stats/resists/trivial/ingredients (Imbued Ivory).
// ---------------------------------------------------------------------
const RING_CLASSES = ["Bard", "Cleric", "Paladin", "Ranger", "Rogue", "Shaman", "Shadow Knight", "Warrior"];
const IMBUED_RING_CLASSES = ["Bard", "Rogue", "Shaman", "Warrior"];

interface RingPiece {
  key: string;
  label: string;
  slot: string;
  ac: number;
  weight: number;
  size: string;
  ringsQty: number;
  pattern: string;
  leather: string;
  plainTrivial?: number;
  imbuedTrivial: number;
  imbuedPattern?: string; // when the imbued table lists a different pattern than the plain table
}

const RING_PIECES: RingPiece[] = [
  { key: "mask", label: "Mask", slot: "Face", ac: 6, weight: 2.0, size: "Small", ringsQty: 1, pattern: "item:chainmail-veil-pattern", leather: "item:large-leather-mask", plainTrivial: 120, imbuedTrivial: 146 },
  { key: "gorget", label: "Gorget", slot: "Neck", ac: 7, weight: 3.0, size: "Small", ringsQty: 1, pattern: "item:chainmail-neckguard-pattern", leather: "item:large-leather-gorget", imbuedTrivial: 139 }, // plainTrivial unset: item's own page lists "?"
  { key: "bracer", label: "Bracer", slot: "Wrist", ac: 8, weight: 3.0, size: "Small", ringsQty: 1, pattern: "item:chainmail-bracelet-pattern", leather: "item:large-leather-wristbands", plainTrivial: 120, imbuedTrivial: 147 },
  { key: "boots", label: "Boots", slot: "Feet", ac: 9, weight: 6.0, size: "Medium", ringsQty: 2, pattern: "item:chainmail-boot-pattern", leather: "item:large-leather-boots", plainTrivial: 120, imbuedTrivial: 147 },
  { key: "helm", label: "Helm", slot: "Head", ac: 10, weight: 5.5, size: "Small", ringsQty: 2, pattern: "item:chainmail-coif-pattern", leather: "item:large-leather-skullcap", plainTrivial: 120, imbuedTrivial: 147 },
  { key: "mantle", label: "Mantle", slot: "Shoulders", ac: 8, weight: 4.5, size: "Small", ringsQty: 2, pattern: "item:chainmail-mantle-pattern", leather: "item:large-leather-shoulderpads", plainTrivial: 120, imbuedTrivial: 147 },
  { key: "belt", label: "Belt", slot: "Waist", ac: 8, weight: 3.5, size: "Small", ringsQty: 2, pattern: "item:chainmail-skirt-pattern", leather: "item:large-leather-belt", plainTrivial: 124, imbuedTrivial: 143 },
  { key: "sleeves", label: "Sleeves", slot: "Arms", ac: 10, weight: 4.5, size: "Small", ringsQty: 2, pattern: "item:chainmail-sleeve-pattern", leather: "item:large-leather-sleeves", plainTrivial: 120, imbuedTrivial: 149 },
  { key: "gauntlets", label: "Gauntlets", slot: "Hands", ac: 9, weight: 5.0, size: "Small", ringsQty: 2, pattern: "item:chainmail-glove-pattern", leather: "item:large-leather-gloves", plainTrivial: 120, imbuedTrivial: 147 },
  { key: "mail", label: "Mail", slot: "Chest", ac: 18, weight: 8.5, size: "Medium", ringsQty: 3, pattern: "item:chainmail-tunic-pattern", leather: "item:large-leather-tunic", plainTrivial: 130, imbuedTrivial: 155 },
  { key: "cloak", label: "Cloak", slot: "Back", ac: 9, weight: 5.0, size: "Large", ringsQty: 3, pattern: "item:chainmail-cloak-pattern", leather: "item:large-leather-cloak", plainTrivial: 120, imbuedTrivial: 150 },
  // Non-imbued Leggings uses the same Chainmail Skirt Pattern as Belt (both tables list it that way); the
  // Imbued table lists Chainmail Pant Pattern for Leggings instead -- a real difference between the two
  // tables, kept as each table states it rather than forced to match.
  { key: "leggings", label: "Leggings", slot: "Legs", ac: 12, weight: 6.5, size: "Medium", ringsQty: 3, pattern: "item:chainmail-skirt-pattern", leather: "item:large-leather-leggings", plainTrivial: 120, imbuedTrivial: 155, imbuedPattern: "item:chainmail-pant-pattern" },
];

for (const piece of RING_PIECES) {
  const plainId = `item:northman-ring-${piece.key}`;
  const plainLabel = `Northman Ring ${piece.label}`;
  addItem(plainId, plainLabel, {
    slots: [piece.slot], ac: piece.ac, weight: piece.weight, size: piece.size, classes: RING_CLASSES,
  });
  addRecipe(`recipe:northman-ring-${piece.key}`, plainLabel, piece.plainTrivial,
    [
      { id: "item:frost-temper" },
      { id: piece.pattern },
      { id: piece.leather },
      { id: "item:medium-quality-metal-rings", quantity: piece.ringsQty },
      { id: "item:smithy-hammer" },
    ],
    plainId, [FORGE]);

  const imbuedId = `item:imbued-northman-ring-${piece.key}`;
  const imbuedLabel = `Imbued Northman Ring ${piece.label}`;
  addItem(imbuedId, imbuedLabel, {
    slots: [piece.slot], ac: piece.ac, stats: { str: 1, wis: 2 }, resists: { cold: 2 }, weight: piece.weight, size: piece.size,
    classes: IMBUED_RING_CLASSES, deity: "The Tribunal",
  });
  addRecipe(`recipe:imbued-northman-ring-${piece.key}`, imbuedLabel, piece.imbuedTrivial,
    [
      { id: "item:frost-temper" },
      { id: "item:imbued-ivory" },
      { id: piece.imbuedPattern ?? piece.pattern },
      { id: piece.leather },
      { id: "item:medium-quality-metal-rings", quantity: piece.ringsQty },
      { id: "item:smithy-hammer" },
    ],
    imbuedId, [FORGE]);
}

save();
console.log(
  `Migration 388 complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s) added, ` +
  `${itemsBackfilled} pre-existing item(s) backfilled for Barbarian Cultural Tradeskills`
);
