/**
 * Migration 438 (issue #46, batch 6/N): Alchemy recipes, trivial 116-162.
 * Awareness II line, the "Valerian Root" third-tier ("Greater")
 * stat/resist potions, and Distillate tier VI.
 *
 * Output items are Alchemy's own uniform shape (EXPENDABLE, Charges: 1,
 * WT 0.4, Size SMALL, Class/Race ALL per every sampled page) -- only the
 * fields that vary (`effect`, the clicky spell a potion casts) are set per
 * item. Recipes whose combine needs more than 6 ingredient slots (the
 * Distillate lines from tier II on: 2 flavor ingredients + 5x Small Vial)
 * are crafted in `container:reinforced-medicine-bag` instead of the plain
 * `container:medicine-bag` -- eqlwiki's own Alchemy page states the plain
 * bag caps out at 6 slots.
 *
 * Only 53 of Alchemy's 153 recipe outputs have their own eqlwiki page at
 * all (confirmed via the MediaWiki API, not a missing WebFetch summary --
 * a direct search for a page title like "Elixir of Concentration" or
 * "Distillate of Alacrity I" returns zero hits). Those without a page get
 * no `effect` field -- a real gap in eqlwiki's own coverage, not a lookup
 * that was skipped; the recipe table's own Func/Type/Effect-category
 * columns (Buff/Stat/"Stamina, Dexterity" etc.) describe the general shape
 * but not the exact clicky spell, so nothing is invented in their place.
 *
 * Sourced from eqlwiki.com's raw wikitext via its MediaWiki API
 * (`action=query&prop=revisions`, batched multi-title queries), not
 * WebFetch's summarizer.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

let itemsAdded = 0;
let recipesAdded = 0;

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
  trivial: number,
  uses: Ingredient[],
  produces: string,
  craftedIn: string,
  opts: Record<string, unknown> = {}
) {
  addNode({ id, label, type: "recipe", tradeskill: "Alchemy", trivial, ...opts });
  recipesAdded++;
  for (const ing of uses) {
    addEdge(id, ing.id, "uses", ing.quantity ? { quantity: ing.quantity } : undefined);
  }
  addEdge(id, produces, "produces");
  addEdge(id, craftedIn, "crafted_in");
}

addItem("item:benefit-awareness-ii", "Benefit Awareness II", { weight: 0.4, size: "Small" });
addItem("item:cold-awareness-ii", "Cold Awareness II", { weight: 0.4, size: "Small" });
addItem("item:disease-awareness-ii", "Disease Awareness II", { weight: 0.4, size: "Small" });
addItem("item:heat-awareness-ii", "Heat Awareness II", { weight: 0.4, size: "Small" });
addItem("item:magic-awareness-ii", "Magic Awareness II", { weight: 0.4, size: "Small" });
addItem("item:poison-awareness-ii", "Poison Awareness II", { weight: 0.4, size: "Small" });
addItem("item:potion-of-vampiric-spirit", "Potion of Vampiric Spirit", { weight: 0.4, size: "Small" });
addItem("item:greater-potion-of-negation", "Greater Potion of Negation", { weight: 0.4, size: "Small", effect: "Nullify Magic" });
addItem("item:potion-of-wrackbane", "Potion of Wrackbane", { weight: 0.4, size: "Small" });
addItem("item:kilva-s-skin-of-flame", "Kilva's Skin of Flame", { weight: 0.4, size: "Small", effect: "Kilva's Skin of Flame" });
addItem("item:potion-of-prince-s-root", "Potion of Prince's Root", { weight: 0.4, size: "Small" });
addItem("item:greater-potion-of-cohesion", "Greater Potion of Cohesion", { weight: 0.4, size: "Small", effect: "Cohesion" });
addItem("item:greater-potion-of-stability", "Greater Potion of Stability", { weight: 0.4, size: "Small", effect: "Stability" });
addItem("item:greater-potion-of-vigor", "Greater Potion of Vigor", { weight: 0.4, size: "Small", effect: "Vigor" });
addItem("item:greater-potion-of-accuracy", "Greater Potion of Accuracy", { weight: 0.4, size: "Small", effect: "Accuracy" });
addItem("item:greater-potion-of-adroitness", "Greater Potion of Adroitness", { weight: 0.4, size: "Small", effect: "Adroitness" });
addItem("item:greater-potion-of-power", "Greater Potion of Power", { weight: 0.4, size: "Small", effect: "Power" });
addItem("item:greater-null-potion", "Greater Null Potion", { weight: 0.4, size: "Small", effect: "Null Aura" });
addItem("item:greater-potion-of-antibody", "Greater Potion of Antibody", { weight: 0.4, size: "Small", effect: "Aura of Antibody" });
addItem("item:greater-potion-of-cold", "Greater Potion of Cold", { weight: 0.4, size: "Small", effect: "Aura of Cold" });
addItem("item:distillate-of-alacrity-vi", "Distillate of Alacrity VI", { weight: 0.4, size: "Small" });
addItem("item:distillate-of-celestial-healing-vi", "Distillate of Celestial Healing VI", { weight: 0.4, size: "Small" });
addItem("item:distillate-of-clarity-vi", "Distillate of Clarity VI", { weight: 0.4, size: "Small" });
addItem("item:distillate-of-divine-healing-vi", "Distillate of Divine Healing VI", { weight: 0.4, size: "Small" });
addItem("item:distillate-of-replenishment-vi", "Distillate of Replenishment VI", { weight: 0.4, size: "Small" });
addItem("item:distillate-of-spirituality-vi", "Distillate of Spirituality VI", { weight: 0.4, size: "Small" });

addRecipe("recipe:benefit-awareness-ii", "Benefit Awareness II", 116, [{ id: "item:sage-leaf" }, { id: "item:elderberry" }, { id: "item:aloe" }], "item:benefit-awareness-ii", "container:medicine-bag");
addRecipe("recipe:cold-awareness-ii", "Cold Awareness II", 116, [{ id: "item:benzoin" }, { id: "item:elderberry" }, { id: "item:aloe" }], "item:cold-awareness-ii", "container:medicine-bag");
addRecipe("recipe:disease-awareness-ii", "Disease Awareness II", 116, [{ id: "item:birthwort" }, { id: "item:elderberry" }, { id: "item:aloe" }], "item:disease-awareness-ii", "container:medicine-bag");
addRecipe("recipe:heat-awareness-ii", "Heat Awareness II", 116, [{ id: "item:lucerne" }, { id: "item:elderberry" }, { id: "item:aloe" }], "item:heat-awareness-ii", "container:medicine-bag");
addRecipe("recipe:magic-awareness-ii", "Magic Awareness II", 116, [{ id: "item:mandrake-root" }, { id: "item:elderberry" }, { id: "item:aloe" }], "item:magic-awareness-ii", "container:medicine-bag");
addRecipe("recipe:poison-awareness-ii", "Poison Awareness II", 116, [{ id: "item:night-shade" }, { id: "item:elderberry" }, { id: "item:aloe" }], "item:poison-awareness-ii", "container:medicine-bag");
addRecipe("recipe:potion-of-vampiric-spirit", "Potion of Vampiric Spirit", 116, [{ id: "item:feverfew" }, { id: "item:griffon-feathers" }], "item:potion-of-vampiric-spirit", "container:medicine-bag");
addRecipe("recipe:greater-potion-of-negation", "Greater Potion of Negation", 123, [{ id: "item:mercury" }, { id: "item:mystic-ash", quantity: 2 }], "item:greater-potion-of-negation", "container:medicine-bag");
addRecipe("recipe:potion-of-wrackbane", "Potion of Wrackbane", 123, [{ id: "item:mammoth-meat" }, { id: "item:woundwart" }], "item:potion-of-wrackbane", "container:medicine-bag");
addRecipe("recipe:kilva-s-skin-of-flame", "Kilva's Skin of Flame", 136, [{ id: "item:clubmoss" }, { id: "item:jatamasi" }, { id: "item:clover" }], "item:kilva-s-skin-of-flame", "container:medicine-bag");
addRecipe("recipe:potion-of-prince-s-root", "Potion of Prince's Root", 136, [{ id: "item:giant-wasp-venom-sac" }, { id: "item:elf-leaf" }], "item:potion-of-prince-s-root", "container:medicine-bag");
addRecipe("recipe:greater-potion-of-cohesion", "Greater Potion of Cohesion", 143, [{ id: "item:sage-leaf" }, { id: "item:fenugreek" }, { id: "item:valerian-root" }], "item:greater-potion-of-cohesion", "container:medicine-bag");
addRecipe("recipe:greater-potion-of-stability", "Greater Potion of Stability", 143, [{ id: "item:lucerne" }, { id: "item:sage-leaf" }, { id: "item:valerian-root" }], "item:greater-potion-of-stability", "container:medicine-bag");
addRecipe("recipe:greater-potion-of-vigor", "Greater Potion of Vigor", 143, [{ id: "item:lucerne" }, { id: "item:birthwort" }, { id: "item:valerian-root" }], "item:greater-potion-of-vigor", "container:medicine-bag");
addRecipe("recipe:greater-potion-of-accuracy", "Greater Potion of Accuracy", 150, [{ id: "item:birthwort" }, { id: "item:fenugreek" }, { id: "item:valerian-root" }], "item:greater-potion-of-accuracy", "container:medicine-bag");
addRecipe("recipe:greater-potion-of-adroitness", "Greater Potion of Adroitness", 150, [{ id: "item:sage-leaf" }, { id: "item:birthwort" }, { id: "item:valerian-root" }], "item:greater-potion-of-adroitness", "container:medicine-bag");
addRecipe("recipe:greater-potion-of-power", "Greater Potion of Power", 150, [{ id: "item:lucerne" }, { id: "item:fenugreek" }, { id: "item:valerian-root" }], "item:greater-potion-of-power", "container:medicine-bag");
addRecipe("recipe:greater-null-potion", "Greater Null Potion", 156, [{ id: "item:fenugreek" }, { id: "item:mandrake-root" }, { id: "item:valerian-root" }], "item:greater-null-potion", "container:medicine-bag");
addRecipe("recipe:greater-potion-of-antibody", "Greater Potion of Antibody", 156, [{ id: "item:maidenhair-fern" }, { id: "item:mullein" }, { id: "item:valerian-root" }], "item:greater-potion-of-antibody", "container:medicine-bag");
addRecipe("recipe:greater-potion-of-cold", "Greater Potion of Cold", 156, [{ id: "item:birthwort" }, { id: "item:allspice" }, { id: "item:valerian-root" }], "item:greater-potion-of-cold", "container:medicine-bag");
addRecipe("recipe:distillate-of-alacrity-vi", "Distillate of Alacrity VI", 162, [{ id: "item:mugwart" }, { id: "item:black-henbane" }, { id: "item:small-vial", quantity: 5 }, { id: "item:arnworth" }], "item:distillate-of-alacrity-vi", "container:reinforced-medicine-bag");
addRecipe("recipe:distillate-of-celestial-healing-vi", "Distillate of Celestial Healing VI", 162, [{ id: "item:mugwart" }, { id: "item:black-henbane" }, { id: "item:small-vial", quantity: 5 }, { id: "item:gerti-blossom" }], "item:distillate-of-celestial-healing-vi", "container:reinforced-medicine-bag");
addRecipe("recipe:distillate-of-clarity-vi", "Distillate of Clarity VI", 162, [{ id: "item:mugwart" }, { id: "item:black-henbane" }, { id: "item:small-vial", quantity: 5 }, { id: "item:katuka-bark" }], "item:distillate-of-clarity-vi", "container:reinforced-medicine-bag");
addRecipe("recipe:distillate-of-divine-healing-vi", "Distillate of Divine Healing VI", 162, [{ id: "item:mugwart" }, { id: "item:black-henbane" }, { id: "item:small-vial", quantity: 5 }, { id: "item:tregrum" }], "item:distillate-of-divine-healing-vi", "container:reinforced-medicine-bag");
addRecipe("recipe:distillate-of-replenishment-vi", "Distillate of Replenishment VI", 162, [{ id: "item:mugwart" }, { id: "item:black-henbane" }, { id: "item:clivers" }, { id: "item:small-vial", quantity: 5 }], "item:distillate-of-replenishment-vi", "container:reinforced-medicine-bag");
addRecipe("recipe:distillate-of-spirituality-vi", "Distillate of Spirituality VI", 162, [{ id: "item:mugwart" }, { id: "item:black-henbane" }, { id: "item:methysticum" }, { id: "item:small-vial", quantity: 5 }], "item:distillate-of-spirituality-vi", "container:reinforced-medicine-bag");

save();
console.log(`Migration 438 complete: ${itemsAdded} items added, ${recipesAdded} recipes added`);
