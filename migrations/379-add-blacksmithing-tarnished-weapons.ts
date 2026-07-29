/**
 * Migration 379: Blacksmithing's Tarnished weapon conversions (issue #48
 * follow-up) -- a repair/polish combine, not a from-raw-materials recipe:
 * take a common Rusty Weapon (starter-tier loot/newbie gear, undocumented
 * on eqlwiki beyond its name -- no vendor or drop source given, so none is
 * fabricated here) and a Sharpening Stone, and it becomes a Tarnished
 * Weapon worth more to vendors. This is literally step one of the
 * Blacksmithing leveling guide's own suggested starting method ("offer to
 * sharpen the rusty weapons of those adventurers around you").
 *
 * Sharpening Stone's own eqlwiki page confirms "Rusty to Tarnished Weapon
 * Conversions" as one of its two uses (the other, Sharp Cutting Disk, isn't
 * otherwise documented and is out of scope here) and lists its own vendors.
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

function addRecipe(id: string, label: string, trivial: number, rustyId: string, tarnishedId: string) {
  addNode({ id, label, type: "recipe", tradeskill: "Blacksmithing", trivial });
  recipesAdded++;
  addEdge(id, rustyId, "uses");
  addEdge(id, "item:sharpening-stone", "uses");
  addEdge(id, tarnishedId, "produces");
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

addItem("item:sharpening-stone", "Sharpening Stone", { weight: 0.1, size: "Tiny" });

const conversions: Array<[string, number]> = [
  ["Dagger", 18], ["Mining Pick", 19], ["Shortened Spear", 19], ["Rapier", 20],
  ["Short Sword", 20], ["Warhammer", 20], ["Flail", 21], ["Mace", 21], ["Spear", 21],
  ["Axe", 22], ["Broad Sword", 22], ["Long Sword", 23], ["Scimitar", 23],
  ["Battle Axe", 24], ["Halberd", 24], ["Morning Star", 24], ["Bastard Sword", 25],
  ["Scythe", 25], ["Two Handed Sword", 25], ["Two Handed Battle Axe", 26],
];

for (const [weapon, trivial] of conversions) {
  const slugged = slug(weapon);
  const rustyId = `item:rusty-${slugged}`;
  const tarnishedId = `item:tarnished-${slugged}`;
  addItem(rustyId, `Rusty ${weapon}`, { source: "Common low-level loot/newbie weapon; eqlwiki does not document a specific vendor or drop source for this generic starter tier" });
  addItem(tarnishedId, `Tarnished ${weapon}`, { source: `Made by sharpening a Rusty ${weapon} with a Sharpening Stone via Blacksmithing (trivial ${trivial}); sells to vendors for more than the rusty original` });
  addRecipe(`recipe:tarnished-${slugged}`, `Tarnished ${weapon}`, trivial, rustyId, tarnishedId);
}

addVendor("a clockwork miner", "Ak'Anon", ["item:sharpening-stone"]);
addVendor("Klok Toren", "East Cabilis", ["item:sharpening-stone"]);
addVendor("Shinan Orefinder", "Erudin", ["item:sharpening-stone"]);
addVendor("Kyrin Steelbone", "North Freeport", ["item:sharpening-stone"]);
addVendor("Okun", "Grobb", ["item:sharpening-stone"]);
addVendor("Greta O`Reilly", "Halas", ["item:sharpening-stone"]);
addVendor("Miner Harton", "High Keep", ["item:sharpening-stone"]);
addVendor("Bloarn Norkhitter", "North Kaladim", ["item:sharpening-stone"]);
addVendor("Glazn D`Unnar", "Neriak Commons", ["item:sharpening-stone"]);
addVendor("Blergerda", "Oggok", ["item:sharpening-stone"]);
addVendor("Tentus Brackmar", "Paineel", ["item:sharpening-stone"]);
addVendor("Godbin Strumharp", "Steamfont Mountains", ["item:sharpening-stone"]);
addVendor("Kevar Claypaws", "Stonebrunt Mountains", ["item:sharpening-stone"]);
addVendor("Nimren Stonecutter", "Thurgadin", ["item:sharpening-stone"]);
// Rivervale's Bodbin Gimple row on Sharpening Stone's own page is marked "*NPC DOESN'T EXIST" -- skipped.

save();
console.log(`Migration 379 complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s), ${vendorsAdded} new vendor npc(s), ${sellsEdgesAdded} sells edge(s) added for Blacksmithing's Tarnished weapon conversions`);
if (skippedVendors.length) {
  console.log(`Skipped ${skippedVendors.length} vendor(s) (zone not catalogued):`);
  for (const s of skippedVendors) console.log(`  - ${s}`);
}
