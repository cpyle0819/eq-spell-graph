// Issue #68: models the Blacksmithing sub-component chain of "Surefall
// Fletching" (Skill Fletching's own "Surefall Fletching for Everquest Live
// by Jokon" section) -- a Karana-deity-locked recipe line built around
// Qaelin Hailstorm (Surefall Glade, Plains of Karana) that produces Steel
// arrow components. Does NOT add a final "Steel Arrow" recipe/item -- the
// wiki's own guide walks through crafting all four components (nock,
// arrowhead, shaft, fletch) but never states the assembled arrow's own
// trivial, and recipe.trivial is a required field with no "unknown" path.
// See issue #68's own comment thread for the open questions (the arrow's
// real trivial, and the still-unsourced Mithril/Wood-Elf side of the
// original report).
import { loadGraph } from "./graph-lib.ts";

const { addNode, addEdge, save } = loadGraph(import.meta.dir);

addNode({ id: "npc:surefall-glade:qaelin-hailstorm", label: "Qaelin Hailstorm", type: "npc", roles: ["vendor", "quest_giver"] });
addEdge("npc:surefall-glade:qaelin-hailstorm", "zone:surefall-glade", "located_in");

addNode({
  id: "item:mark-of-karana",
  label: "Mark of Karana",
  type: "item",
  source: "Quested from Qaelin Hailstorm (Surefall Glade, Plains of Karana | Loc: +180, +140) -- say \"I need a mark\" while near him, not targeting him. Karana worshippers only. Returns on combine; a required ingredient for every Surefall Fletching combine.",
});

addNode({ id: "item:small-brick-of-steel", label: "Small Brick of Steel", type: "item" });
addEdge("npc:surefall-glade:qaelin-hailstorm", "item:small-brick-of-steel", "sells");

addNode({ id: "item:large-brick-of-steel", label: "Large Brick of Steel", type: "item" });
addEdge("npc:surefall-glade:qaelin-hailstorm", "item:large-brick-of-steel", "sells");

addNode({ id: "item:arrow-shaft-mold", label: "Arrow Shaft Mold", type: "item", weight: 0.1, size: "Tiny" });
for (const npcId of [
  "npc:west-cabilis:zotalz",
  "npc:firiona-vie:fleceal-summer",
  "npc:greater-faydark:merchant-lanin",
  "npc:halas:rain",
  "npc:iceclad-ocean:adinel-jailbar",
  "npc:neriak-commons:andara-c-luzz",
  "npc:the-overthere:tin-merchant-xi", // wiki lists "Tin Merchant X" -- same off-by-one numbering already resolved for Fletching Kit, see decisions/tradeskill-recipe-node-schema.md
  "npc:steamfont-mountains:a-clockwork-fletcher",
  "npc:surefall-glade:jarse-kedison",
]) {
  addEdge(npcId, "item:arrow-shaft-mold", "sells");
}

addNode({ id: "container:surefall-fletching-kit", label: "Surefall Fletching Kit", type: "container" });
addNode({ id: "recipe:surefall-fletching-kit", label: "Surefall Fletching Kit", type: "recipe", tradeskill: "Blacksmithing", trivial: 162 });
for (const itemId of ["item:water-flask", "item:hinge-mold", "item:container-base-mold", "item:container-lid-mold", "item:mark-of-karana", "item:small-brick-of-steel"]) {
  addEdge("recipe:surefall-fletching-kit", itemId, "uses");
}
addEdge("recipe:surefall-fletching-kit", "container:surefall-fletching-kit", "produces");
addEdge("recipe:surefall-fletching-kit", "container:forge", "crafted_in");

addNode({
  id: "item:steel-working-knife",
  label: "Steel Working Knife",
  type: "item",
  source: "Crafted via Blacksmithing (Trivial 42, Forge) -- requires Karana as active deity to craft. Returns on combine; a required ingredient for Steel Fletch.",
});
addNode({ id: "recipe:steel-working-knife", label: "Steel Working Knife", type: "recipe", tradeskill: "Blacksmithing", trivial: 42 });
for (const itemId of ["item:water-flask", "item:hilt-mold", "item:dagger-blade-mold", "item:mark-of-karana", "item:small-brick-of-steel"]) {
  addEdge("recipe:steel-working-knife", itemId, "uses");
}
addEdge("recipe:steel-working-knife", "item:steel-working-knife", "produces");
addEdge("recipe:steel-working-knife", "container:forge", "crafted_in");

addNode({ id: "item:steel-arrowheads", label: "Steel Arrowheads", type: "item" });
addNode({ id: "recipe:steel-arrowheads", label: "Steel Arrowheads", type: "recipe", tradeskill: "Blacksmithing", trivial: 188 });
for (const itemId of ["item:water-flask", "item:mark-of-karana", "item:small-brick-of-steel", "item:file"]) {
  addEdge("recipe:steel-arrowheads", itemId, "uses");
}
addEdge("recipe:steel-arrowheads", "item:steel-arrowheads", "produces", { quantity: 2 });
addEdge("recipe:steel-arrowheads", "container:forge", "crafted_in");

addNode({ id: "item:steel-arrowshafts", label: "Steel Arrowshafts", type: "item" });
addNode({ id: "recipe:steel-arrowshafts", label: "Steel Arrowshafts", type: "recipe", tradeskill: "Blacksmithing", trivial: 42 });
for (const itemId of ["item:water-flask", "item:mark-of-karana", "item:large-brick-of-steel", "item:arrow-shaft-mold", "item:file"]) {
  addEdge("recipe:steel-arrowshafts", itemId, "uses");
}
addEdge("recipe:steel-arrowshafts", "item:steel-arrowshafts", "produces", { quantity: 2 });
addEdge("recipe:steel-arrowshafts", "container:forge", "crafted_in");

addNode({ id: "item:steel-fletch", label: "Steel Fletch", type: "item" });
addNode({ id: "recipe:steel-fletch", label: "Steel Fletch", type: "recipe", tradeskill: "Blacksmithing", trivial: 42 });
for (const itemId of ["item:mark-of-karana", "item:small-brick-of-steel", "item:steel-working-knife"]) {
  addEdge("recipe:steel-fletch", itemId, "uses");
}
addEdge("recipe:steel-fletch", "item:steel-fletch", "produces", { quantity: 2 });
addEdge("recipe:steel-fletch", "container:forge", "crafted_in");

save();
console.log("Added Surefall Fletching Steel-arrow sub-component chain (issue #68).");
