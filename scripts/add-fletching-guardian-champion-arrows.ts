// Issue #68: the final "Guardian"/"Champion" arrow combines. eqlwiki.com's
// own Fletching page names these but calls them "mostly undocumented" (no
// trivial or ingredients). Confirmed still working live in EQL and modeled
// here from eqtraders.com (classic-EQ source), a deliberate, explicit
// exception to this repo's eqlwiki-only sourcing rule -- see
// decisions/eql-vs-classic-eq-zone-connectivity.md and issue #68.
//
// Two independent chains, each gated a different way (deity vs race):
//   Karana/Steel:    Steel Guardian Arrows, Blessed Guardian Arrows --
//                     reuses the Steel sub-component chain from
//                     add-surefall-fletching-steel-arrow-chain.ts
//   Wood Elf/Mithril: Mithril Champion Arrows, Blessed Champion Arrows --
//                     an entirely new Feir'Dal Fletching Kit sub-chain;
//                     eqlwiki's own Wood Elf Cultural Tradeskills page only
//                     covers Tailoring/Smithing armor, nothing Fletching
import { loadGraph } from "./graph-lib.ts";

const { addNode, addEdge, updateNode, save } = loadGraph(import.meta.dir);

// --- Karana/Steel side: Blessed Steel Arrowheads' Imbued Plains Pebble Shard sub-chain ---

addNode({ id: "item:plains-pebble", label: "Plains Pebble", type: "item", weight: 0.1, size: "Tiny" });

updateNode("item:imbued-plains-pebble", {
  weight: 0.1,
  size: "Tiny",
  source: "Created from a Plains Pebble with the Imbue Plains Pebble spell (Cleric/Druid L29, Karana-flavored, no-fail). A required ingredient for Imbued Plains Pebble Shard.",
});

addNode({ id: "item:imbued-plains-pebble-shard", label: "Imbued Plains Pebble Shard", type: "item" });
addNode({ id: "recipe:imbued-plains-pebble-shard", label: "Imbued Plains Pebble Shard", type: "recipe", tradeskill: "Blacksmithing", trivial: 96 });
for (const itemId of ["item:imbued-plains-pebble", "item:file"]) {
  addEdge("recipe:imbued-plains-pebble-shard", itemId, "uses");
}
addEdge("recipe:imbued-plains-pebble-shard", "item:imbued-plains-pebble-shard", "produces", { quantity: 4 });
addEdge("recipe:imbued-plains-pebble-shard", "container:forge", "crafted_in");

addNode({
  id: "item:blessed-steel-arrowheads",
  label: "Blessed Steel Arrowheads",
  type: "item",
  source: "Crafted via Blacksmithing (Trivial 188, Forge) -- Karana worshippers only.",
});
addNode({ id: "recipe:blessed-steel-arrowheads", label: "Blessed Steel Arrowheads", type: "recipe", tradeskill: "Blacksmithing", trivial: 188 });
for (const itemId of ["item:water-flask", "item:small-brick-of-steel", "item:mark-of-karana", "item:imbued-plains-pebble-shard", "item:file"]) {
  addEdge("recipe:blessed-steel-arrowheads", itemId, "uses");
}
addEdge("recipe:blessed-steel-arrowheads", "item:blessed-steel-arrowheads", "produces", { quantity: 2 });
addEdge("recipe:blessed-steel-arrowheads", "container:forge", "crafted_in");

// --- Karana/Steel side: the two final arrow combines ---

addNode({
  id: "item:steel-guardian-arrows",
  label: "Steel Guardian Arrows",
  type: "item",
  slots: ["Ammo"],
  damage: 11,
  effect: "Cold Damage: 3",
  weight: 0.1,
  size: "Small",
  classes: ["warrior", "paladin", "ranger", "rogue"],
  deity: "Karana",
});
addNode({ id: "recipe:steel-guardian-arrows", label: "Steel Guardian Arrows", type: "recipe", tradeskill: "Fletching", trivial: 335 });
for (const itemId of ["item:small-groove-nocks", "item:steel-arrowheads", "item:steel-arrowshafts", "item:steel-fletch"]) {
  addEdge("recipe:steel-guardian-arrows", itemId, "uses");
}
addEdge("recipe:steel-guardian-arrows", "item:steel-guardian-arrows", "produces", { quantity: 10 });
addEdge("recipe:steel-guardian-arrows", "container:surefall-fletching-kit", "crafted_in");

addNode({
  id: "item:blessed-guardian-arrows",
  label: "Blessed Guardian Arrows",
  type: "item",
  slots: ["Ammo"],
  damage: 11,
  effect: "Cold Damage: 4",
  weight: 0.1,
  size: "Small",
  classes: ["warrior", "paladin", "ranger", "rogue"],
  deity: "Karana",
});
addNode({ id: "recipe:blessed-guardian-arrows", label: "Blessed Guardian Arrows", type: "recipe", tradeskill: "Fletching", trivial: 335 });
for (const itemId of ["item:blessed-steel-arrowheads", "item:mark-of-karana", "item:small-groove-nocks", "item:steel-arrowshafts", "item:steel-fletch"]) {
  addEdge("recipe:blessed-guardian-arrows", itemId, "uses");
}
addEdge("recipe:blessed-guardian-arrows", "item:blessed-guardian-arrows", "produces", { quantity: 10 });
addEdge("recipe:blessed-guardian-arrows", "container:surefall-fletching-kit", "crafted_in");

// --- Wood Elf/Mithril side: Feir'Dal Fletching Kit and its sub-components ---

addNode({ id: "container:feirdal-fletching-kit", label: "Feir'Dal Fletching Kit", type: "container", weight: 1, capacity: 10, containerSize: "Large" });
addNode({ id: "recipe:feirdal-fletching-kit", label: "Feir'Dal Fletching Kit", type: "recipe", tradeskill: "Blacksmithing", trivial: 163 });
for (const itemId of ["item:container-base-mold", "item:container-lid-mold", "item:hinge-mold", "item:small-brick-of-mithril", "item:water-flask"]) {
  addEdge("recipe:feirdal-fletching-kit", itemId, "uses");
}
addEdge("recipe:feirdal-fletching-kit", "container:feirdal-fletching-kit", "produces");
addEdge("recipe:feirdal-fletching-kit", "container:forge", "crafted_in");

addNode({
  id: "item:mithril-working-knife",
  label: "Mithril Working Knife",
  type: "item",
  source: "Crafted via Blacksmithing (Trivial 42, Forge) -- Wood Elves only. A required ingredient for Mithril Fletchings.",
});
addNode({ id: "recipe:mithril-working-knife", label: "Mithril Working Knife", type: "recipe", tradeskill: "Blacksmithing", trivial: 42 });
for (const itemId of ["item:water-flask", "item:hilt-mold", "item:dagger-blade-mold", "item:small-brick-of-mithril"]) {
  addEdge("recipe:mithril-working-knife", itemId, "uses");
}
addEdge("recipe:mithril-working-knife", "item:mithril-working-knife", "produces");
addEdge("recipe:mithril-working-knife", "container:forge", "crafted_in");

addNode({
  id: "item:mithril-fletchings",
  label: "Mithril Fletchings",
  type: "item",
  source: "Crafted via Fletching (Trivial 34, Feir'Dal Fletching Kit) -- Wood Elves only.",
});
addNode({ id: "recipe:mithril-fletchings", label: "Mithril Fletchings", type: "recipe", tradeskill: "Fletching", trivial: 34 });
for (const itemId of ["item:mithril-working-knife", "item:small-brick-of-mithril"]) {
  addEdge("recipe:mithril-fletchings", itemId, "uses");
}
addEdge("recipe:mithril-fletchings", "item:mithril-fletchings", "produces");
addEdge("recipe:mithril-fletchings", "container:feirdal-fletching-kit", "crafted_in");

addNode({
  id: "item:mithril-arrow-heads",
  label: "Mithril Arrow Heads",
  type: "item",
  source: "Crafted via Blacksmithing (Trivial 42, Forge) -- Wood Elves only.",
});
addNode({ id: "recipe:mithril-arrow-heads", label: "Mithril Arrow Heads", type: "recipe", tradeskill: "Blacksmithing", trivial: 42 });
for (const itemId of ["item:file", "item:small-brick-of-mithril", "item:water-flask"]) {
  addEdge("recipe:mithril-arrow-heads", itemId, "uses");
}
addEdge("recipe:mithril-arrow-heads", "item:mithril-arrow-heads", "produces", { quantity: 2 });
addEdge("recipe:mithril-arrow-heads", "container:forge", "crafted_in");

addNode({
  id: "item:mithril-bundled-arrow-shafts",
  label: "Mithril Bundled Arrow Shafts",
  type: "item",
  source: "Crafted via Blacksmithing (Trivial 42, Forge) -- Wood Elves only.",
});
addNode({ id: "recipe:mithril-bundled-arrow-shafts", label: "Mithril Bundled Arrow Shafts", type: "recipe", tradeskill: "Blacksmithing", trivial: 42 });
for (const itemId of ["item:arrow-shaft-mold", "item:file", "item:large-brick-of-mithril", "item:water-flask"]) {
  addEdge("recipe:mithril-bundled-arrow-shafts", itemId, "uses");
}
addEdge("recipe:mithril-bundled-arrow-shafts", "item:mithril-bundled-arrow-shafts", "produces", { quantity: 2 });
addEdge("recipe:mithril-bundled-arrow-shafts", "container:forge", "crafted_in");

// --- Wood Elf/Mithril side: Blessed Arrow Heads' Imbued Emerald Shards sub-chain ---

addNode({ id: "item:imbued-emerald-shards", label: "Imbued Emerald Shards", type: "item", source: "Crafted via Blacksmithing (Trivial 96, Forge) -- Wood Elves only." });
addNode({ id: "recipe:imbued-emerald-shards", label: "Imbued Emerald Shards", type: "recipe", tradeskill: "Blacksmithing", trivial: 96 });
for (const itemId of ["item:file", "item:imbued-emerald"]) {
  addEdge("recipe:imbued-emerald-shards", itemId, "uses");
}
addEdge("recipe:imbued-emerald-shards", "item:imbued-emerald-shards", "produces", { quantity: 4 });
addEdge("recipe:imbued-emerald-shards", "container:forge", "crafted_in");

addNode({
  id: "item:blessed-arrow-heads",
  label: "Blessed Arrow Heads",
  type: "item",
  source: "Crafted via Blacksmithing (Trivial 57, Forge) -- Wood Elves only.",
});
addNode({ id: "recipe:blessed-arrow-heads", label: "Blessed Arrow Heads", type: "recipe", tradeskill: "Blacksmithing", trivial: 57 });
for (const itemId of ["item:file", "item:imbued-emerald-shards", "item:small-brick-of-mithril", "item:water-flask"]) {
  addEdge("recipe:blessed-arrow-heads", itemId, "uses");
}
addEdge("recipe:blessed-arrow-heads", "item:blessed-arrow-heads", "produces", { quantity: 2 });
addEdge("recipe:blessed-arrow-heads", "container:forge", "crafted_in");

// --- Wood Elf/Mithril side: the two final arrow combines ---

addNode({
  id: "item:mithril-champion-arrows",
  label: "Mithril Champion Arrows",
  type: "item",
  slots: ["Ammo"],
  damage: 11,
  effect: "Fire Damage: 3",
  weight: 0.1,
  size: "Small",
  classes: ["warrior", "paladin", "ranger", "shadow knight"],
  source: "Crafted via Fletching -- Wood Elves only.",
});
addNode({ id: "recipe:mithril-champion-arrows", label: "Mithril Champion Arrows", type: "recipe", tradeskill: "Fletching", trivial: 335 });
for (const itemId of ["item:mithril-arrow-heads", "item:mithril-bundled-arrow-shafts", "item:mithril-fletchings", "item:small-groove-nocks"]) {
  addEdge("recipe:mithril-champion-arrows", itemId, "uses");
}
addEdge("recipe:mithril-champion-arrows", "item:mithril-champion-arrows", "produces", { quantity: 10 });
addEdge("recipe:mithril-champion-arrows", "container:feirdal-fletching-kit", "crafted_in");

addNode({
  id: "item:blessed-champion-arrows",
  label: "Blessed Champion Arrows",
  type: "item",
  slots: ["Ammo"],
  damage: 11,
  effect: "Fire Damage: 4",
  weight: 0.1,
  size: "Small",
  classes: ["warrior", "paladin", "ranger"],
  deity: "Tunare",
  source: "Crafted via Fletching -- Wood Elves only.",
});
addNode({ id: "recipe:blessed-champion-arrows", label: "Blessed Champion Arrows", type: "recipe", tradeskill: "Fletching", trivial: 335 });
for (const itemId of ["item:blessed-arrow-heads", "item:mithril-bundled-arrow-shafts", "item:mithril-fletchings", "item:small-groove-nocks"]) {
  addEdge("recipe:blessed-champion-arrows", itemId, "uses");
}
addEdge("recipe:blessed-champion-arrows", "item:blessed-champion-arrows", "produces", { quantity: 10 });
addEdge("recipe:blessed-champion-arrows", "container:feirdal-fletching-kit", "crafted_in");

save();
console.log("Added Steel Guardian/Blessed Guardian/Mithril Champion/Blessed Champion Arrows and their sub-chains (issue #68).");
