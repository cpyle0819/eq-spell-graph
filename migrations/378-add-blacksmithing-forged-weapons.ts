/**
 * Migration 378: Blacksmithing's Forged weapon catalog, Classic + Kunark
 * (issue #48 follow-up) -- 18 Classic weapons (Sheet Metal + Water Flask,
 * plus an Oak Shaft for hafted weapons) and 3 Kunark weapons (Fer`Esh,
 * Shan`Tok, Sheer Blade -- Folded Sheet Metal + Flask of Bloodwater instead).
 *
 * Molds are sourced from each mold's own eqlwiki page (raw wikitext via the
 * MediaWiki API, not a summarizer) for vendor data; Dagger Blade Mold and
 * Hilt Mold already exist from migration 375's Skinning Knife work and are
 * reused as-is. Weapon output items themselves are modeled at the same
 * level of detail as migration 375's Tools and Implements outputs (plain
 * item + source note, no combat stats) rather than migration 376's
 * Shields-tier treatment (ac/weight/slots) -- fetching all 21 weapons' own
 * pages for damage/delay wasn't warranted given this is a shopping-route
 * planner, not a combat simulator, and no other weapon item in this graph
 * carries those stats either.
 *
 * Silvered weapons are NOT part of this catalog: their own "Enchanted Silver
 * Bar" precursor is created by an Enchanter casting Enchant Silver on a
 * plain Silver Bar (a spell effect, not a tradeskill combine), and Enchanted
 * Sheet Metal must first be made by a Human smith in a Human cultural forge
 * per the wiki's own note -- both genuinely outside pure Blacksmithing's
 * scope, not just deferred for size. Velium weapons are migration 380.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

let recipesAdded = 0;
let itemsAdded = 0;
let vendorsAdded = 0;
let sellsEdgesAdded = 0;
const skippedVendors: string[] = [];

function addItem(id: string, label: string, opts: Record<string, unknown> = {}) {
  if (hasNode(id)) return;
  addNode({ id, label, type: "item", ...opts });
  itemsAdded++;
}

interface Ingredient {
  id: string;
  quantity?: number;
}

function addRecipe(id: string, label: string, trivial: number, uses: Ingredient[], produces: string, produceQty?: number) {
  addNode({ id, label, type: "recipe", tradeskill: "Blacksmithing", trivial });
  recipesAdded++;
  for (const ing of uses) {
    addEdge(id, ing.id, "uses", ing.quantity && ing.quantity !== 1 ? { quantity: ing.quantity } : undefined);
  }
  addEdge(id, produces, "produces", produceQty && produceQty !== 1 ? { quantity: produceQty } : undefined);
  addEdge(id, "container:forge", "crafted_in");
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

// --- Molds ---
const molds = [
  "axe-head-mold", "curved-blade-mold", "halberd-head-mold", "hammer-head-mold",
  "long-blade-mold", "mace-head-mold", "pick-head-mold", "short-blade-mold",
  "shuriken-mold", "spear-head-mold", "thin-blade-mold", "throwing-axe-mold",
  "throwing-knife-mold", "pommel-mold", "spiked-ball-mold", "dual-edged-blade-mold",
  "heavy-steel-blade-mold", "sheer-blade-mold", "fer-esh-blade-mold", "shan-tok-blade-mold",
] as const;
const moldLabels: Record<string, string> = {
  "axe-head-mold": "Axe Head Mold", "curved-blade-mold": "Curved Blade Mold",
  "halberd-head-mold": "Halberd Head Mold", "hammer-head-mold": "Hammer Head Mold",
  "long-blade-mold": "Long Blade Mold", "mace-head-mold": "Mace Head Mold",
  "pick-head-mold": "Pick Head Mold", "short-blade-mold": "Short Blade Mold",
  "shuriken-mold": "Shuriken Mold", "spear-head-mold": "Spear Head Mold",
  "thin-blade-mold": "Thin Blade Mold", "throwing-axe-mold": "Throwing Axe Mold",
  "throwing-knife-mold": "Throwing Knife Mold", "pommel-mold": "Pommel Mold",
  "spiked-ball-mold": "Spiked Ball Mold", "dual-edged-blade-mold": "Dual-Edged Blade Mold",
  "heavy-steel-blade-mold": "Heavy Steel Blade Mold", "sheer-blade-mold": "Sheer Blade Mold",
  "fer-esh-blade-mold": "Fer`Esh Blade Mold", "shan-tok-blade-mold": "Shan`Tok Blade Mold",
};
for (const m of molds) addItem(`item:${m}`, moldLabels[m]);

// Common vendor set shared by most Classic weapon-head/blade molds.
const AK_CABILIS_FEERROTT_FELWITHE_FREEPORT_HALAS_KALADIM_NERIAK_QEYNOS_RIVERVALE = [
  ["Clockwork SmithXIII", "Ak'Anon"], ["Smithy Krikt", "East Cabilis"], ["Murg", "The Feerrott"],
  ["Opal Leganyn", "Northern Felwithe"], ["Jenna Smith", "East Freeport"], ["April", "Halas"],
  ["Bndainy Everhot", "North Kaladim"], ["Sivy G`Noir", "Neriak Commons"], ["Dren Ironforge", "North Qeynos"],
  ["Bipdo Hargin", "Rivervale"], ["Kalaaro Steelclaws", "Stonebrunt Mountains"],
] as const;

for (const mold of ["axe-head-mold", "curved-blade-mold", "halberd-head-mold", "hammer-head-mold"]) {
  for (const [vendor, zone] of AK_CABILIS_FEERROTT_FELWITHE_FREEPORT_HALAS_KALADIM_NERIAK_QEYNOS_RIVERVALE) {
    addVendor(vendor, zone, [`item:${mold}`]);
  }
  addVendor("Jillian Dayson", "East Freeport", [`item:${mold}`]);
}

for (const mold of ["long-blade-mold", "mace-head-mold", "pick-head-mold", "short-blade-mold", "throwing-knife-mold"]) {
  for (const [vendor, zone] of AK_CABILIS_FEERROTT_FELWITHE_FREEPORT_HALAS_KALADIM_NERIAK_QEYNOS_RIVERVALE) {
    addVendor(vendor, zone, [`item:${mold}`]);
  }
  addVendor("Jillian Dayson", "East Freeport", [`item:${mold}`]);
  addVendor("Olyna Midel", "West Freeport", [`item:${mold}`]);
  addVendor("Grudash the Baker", "Skyshrine", [`item:${mold}`]);
}

for (const mold of ["shuriken-mold", "spear-head-mold", "thin-blade-mold", "throwing-axe-mold"]) {
  for (const [vendor, zone] of AK_CABILIS_FEERROTT_FELWITHE_FREEPORT_HALAS_KALADIM_NERIAK_QEYNOS_RIVERVALE) {
    addVendor(vendor, zone, [`item:${mold}`]);
  }
  addVendor("Olyna Midel", "West Freeport", [`item:${mold}`]);
  addVendor("Grudash the Baker", "Skyshrine", [`item:${mold}`]);
}

addVendor("Clockwork SmithXIII", "Ak'Anon", ["item:pommel-mold"]);
addVendor("Kaila Rucksack", "Butcherblock Mountains", ["item:pommel-mold", "item:spiked-ball-mold", "item:dual-edged-blade-mold", "item:heavy-steel-blade-mold"]);
addVendor("Smithy Vyx", "East Cabilis", ["item:pommel-mold", "item:spiked-ball-mold", "item:dual-edged-blade-mold", "item:heavy-steel-blade-mold"]);
addVendor("Jillian Dayson", "East Freeport", ["item:pommel-mold", "item:spiked-ball-mold", "item:dual-edged-blade-mold", "item:heavy-steel-blade-mold"]);
addVendor("Merchant Nluolian", "Greater Faydark", ["item:pommel-mold", "item:spiked-ball-mold", "item:dual-edged-blade-mold", "item:heavy-steel-blade-mold"]);
addVendor("Tortuk Everhot", "North Kaladim", ["item:pommel-mold"]);
addVendor("Sivy G`Noir", "Neriak Commons", ["item:pommel-mold"]);
addVendor("Ungia", "Neriak Foreign Quarter", ["item:pommel-mold", "item:spiked-ball-mold", "item:dual-edged-blade-mold", "item:heavy-steel-blade-mold"]);
addVendor("Dren Ironforge", "North Qeynos", ["item:pommel-mold", "item:dual-edged-blade-mold"]);
addVendor("Bipdo Hargin", "Rivervale", ["item:pommel-mold", "item:dual-edged-blade-mold"]);
addVendor("Grudash the Baker", "Skyshrine", ["item:pommel-mold"]);
addVendor("Olyna Midel", "West Freeport", ["item:spiked-ball-mold"]);
addVendor("Spinner", "Western Karana", ["item:spiked-ball-mold"]);

addVendor("Smithy Krikt", "East Cabilis", ["item:sheer-blade-mold", "item:fer-esh-blade-mold", "item:shan-tok-blade-mold"]);

// --- Weapon outputs (plain items, per header note) ---
const forgedClassic: Array<[string, string, number, Ingredient[]]> = [
  ["forged-bastard-sword", "Forged Bastard Sword", 72, [{ id: "item:dual-edged-blade-mold" }, { id: "item:hilt-mold" }, { id: "item:pommel-mold" }, { id: "item:sheet-metal" }, { id: "item:water-flask" }]],
  ["forged-battle-axe", "Forged Battle Axe", 73, [{ id: "item:axe-head-mold" }, { id: "item:oak-shaft" }, { id: "item:sheet-metal" }, { id: "item:water-flask" }]],
  ["forged-dagger", "Forged Dagger", 48, [{ id: "item:dagger-blade-mold" }, { id: "item:hilt-mold" }, { id: "item:pommel-mold" }, { id: "item:sheet-metal" }, { id: "item:water-flask" }]],
  ["forged-halberd", "Forged Halberd", 82, [{ id: "item:halberd-head-mold" }, { id: "item:oak-shaft" }, { id: "item:sheet-metal" }, { id: "item:water-flask" }]],
  ["forged-long-sword", "Forged Long Sword", 68, [{ id: "item:long-blade-mold" }, { id: "item:hilt-mold" }, { id: "item:pommel-mold" }, { id: "item:sheet-metal" }, { id: "item:water-flask" }]],
  ["forged-mace", "Forged Mace", 68, [{ id: "item:mace-head-mold" }, { id: "item:oak-shaft" }, { id: "item:sheet-metal" }, { id: "item:water-flask" }]],
  ["forged-morning-star", "Forged Morning Star", 68, [{ id: "item:spiked-ball-mold" }, { id: "item:hilt-mold" }, { id: "item:sheet-metal" }, { id: "item:water-flask" }]],
  ["forged-pick", "Forged Pick", 49, [{ id: "item:pick-head-mold" }, { id: "item:oak-shaft" }, { id: "item:sheet-metal" }, { id: "item:water-flask" }]],
  ["forged-rapier", "Forged Rapier", 72, [{ id: "item:thin-blade-mold" }, { id: "item:hilt-mold" }, { id: "item:pommel-mold" }, { id: "item:sheet-metal" }, { id: "item:water-flask" }]],
  ["forged-scimitar", "Forged Scimitar", 68, [{ id: "item:curved-blade-mold" }, { id: "item:hilt-mold" }, { id: "item:pommel-mold" }, { id: "item:sheet-metal" }, { id: "item:water-flask" }]],
  ["forged-short-sword", "Forged Short Sword", 62, [{ id: "item:short-blade-mold" }, { id: "item:hilt-mold" }, { id: "item:pommel-mold" }, { id: "item:sheet-metal" }, { id: "item:water-flask" }]],
  ["forged-spear", "Forged Spear", 66, [{ id: "item:spear-head-mold" }, { id: "item:oak-shaft" }, { id: "item:sheet-metal" }, { id: "item:water-flask" }]],
  ["forged-two-handed-sword", "Forged Two Handed Sword", 73, [{ id: "item:heavy-steel-blade-mold" }, { id: "item:hilt-mold" }, { id: "item:pommel-mold" }, { id: "item:sheet-metal" }, { id: "item:water-flask" }]],
  ["forged-warhammer", "Forged Warhammer", 58, [{ id: "item:hammer-head-mold" }, { id: "item:oak-shaft" }, { id: "item:sheet-metal" }, { id: "item:water-flask" }]],
];
const forgedClassicYielding: Array<[string, string, number, Ingredient[], number]> = [
  ["forged-javelin", "Forged Javelin", 60, [{ id: "item:javelin-mold" }, { id: "item:sheet-metal" }, { id: "item:water-flask" }], 2],
  ["forged-shuriken", "Forged Shuriken", 58, [{ id: "item:shuriken-mold" }, { id: "item:sheet-metal" }, { id: "item:water-flask" }], 10],
  ["forged-throwing-axe", "Forged Throwing Axe", 56, [{ id: "item:throwing-axe-mold" }, { id: "item:sheet-metal" }, { id: "item:water-flask" }], 5],
  ["forged-throwing-knife", "Forged Throwing Knife", 53, [{ id: "item:throwing-knife-mold" }, { id: "item:sheet-metal" }, { id: "item:water-flask" }], 10],
];
const forgedKunark: Array<[string, string, number, Ingredient[]]> = [
  ["forged-fer-esh", "Forged Fer`Esh", 115, [{ id: "item:fer-esh-blade-mold" }, { id: "item:hilt-mold" }, { id: "item:pommel-mold" }, { id: "item:folded-sheet-metal" }, { id: "item:flask-of-bloodwater" }]],
  ["forged-shan-tok", "Forged Shan`Tok", 82, [{ id: "item:shan-tok-blade-mold" }, { id: "item:hilt-mold" }, { id: "item:pommel-mold" }, { id: "item:folded-sheet-metal" }, { id: "item:flask-of-bloodwater" }]],
  ["forged-sheer-blade", "Forged Sheer Blade", 115, [{ id: "item:sheer-blade-mold" }, { id: "item:hilt-mold" }, { id: "item:pommel-mold" }, { id: "item:folded-sheet-metal" }, { id: "item:flask-of-bloodwater" }]],
];

for (const [id, label, trivial, uses] of forgedClassic) {
  addItem(`item:${id}`, label, { source: `Crafted via Blacksmithing (trivial ${trivial})` });
  addRecipe(`recipe:${id}`, label, trivial, uses, `item:${id}`);
}
for (const [id, label, trivial, uses, yield_] of forgedClassicYielding) {
  addItem(`item:${id}`, label, { source: `Crafted via Blacksmithing (trivial ${trivial}, yield ${yield_})` });
  addRecipe(`recipe:${id}`, label, trivial, uses, `item:${id}`, yield_);
}
for (const [id, label, trivial, uses] of forgedKunark) {
  addItem(`item:${id}`, label, { source: `Crafted via Blacksmithing (trivial ${trivial})` });
  addRecipe(`recipe:${id}`, label, trivial, uses, `item:${id}`);
}

save();
console.log(`Migration 378 complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s), ${vendorsAdded} new vendor npc(s), ${sellsEdgesAdded} sells edge(s) added for Blacksmithing's Forged weapon catalog`);
if (skippedVendors.length) {
  console.log(`Skipped ${skippedVendors.length} vendor(s) (zone not catalogued):`);
  for (const s of skippedVendors) console.log(`  - ${s}`);
}
