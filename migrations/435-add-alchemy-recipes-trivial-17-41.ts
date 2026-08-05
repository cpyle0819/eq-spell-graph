/**
 * Migration 435 (issue #46, batch 3/N): Alchemy recipes, trivial 17-41.
 * Stat/resist "Lesser"-tier potions, the Null/Antibody/Cold Minor
 * lines, and Distillate of Alacrity/Celestial Healing/Clarity/Divine
 * Healing/Replenishment/Spirituality tiers I-II.
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

addItem("item:potion-of-lesser-cohesion", "Potion of Lesser Cohesion", { weight: 0.4, size: "Small", effect: "Cohesion" });
addItem("item:potion-of-lesser-stability", "Potion of Lesser Stability", { weight: 0.4, size: "Small", effect: "Stability" });
addItem("item:potion-of-lesser-vigor", "Potion of Lesser Vigor", { weight: 0.4, size: "Small", effect: "Vigor" });
addItem("item:potion-of-charming-deceit", "Potion of Charming Deceit", { weight: 0.4, size: "Small" });
addItem("item:potion-of-lesser-accuracy", "Potion of Lesser Accuracy", { weight: 0.4, size: "Small", effect: "Accuracy" });
addItem("item:potion-of-lesser-adroitness", "Potion of Lesser Adroitness", { weight: 0.4, size: "Small", effect: "Adroitness" });
addItem("item:potion-of-lesser-power", "Potion of Lesser Power", { weight: 0.4, size: "Small", effect: "Power" });
addItem("item:minor-null-potion", "Minor Null Potion", { weight: 0.4, size: "Small", effect: "Null Aura" });
addItem("item:minor-potion-of-antibody", "Minor Potion of Antibody", { weight: 0.4, size: "Small", effect: "Aura of Antibody" });
addItem("item:minor-potion-of-cold", "Minor Potion of Cold", { weight: 0.4, size: "Small", effect: "Aura of Cold" });
addItem("item:distillate-of-alacrity-i", "Distillate of Alacrity I", { weight: 0.4, size: "Small" });
addItem("item:distillate-of-celestial-healing-i", "Distillate of Celestial Healing I", { weight: 0.4, size: "Small" });
addItem("item:distillate-of-clarity-i", "Distillate of Clarity I", { weight: 0.4, size: "Small" });
addItem("item:distillate-of-divine-healing-i", "Distillate of Divine Healing I", { weight: 0.4, size: "Small" });
addItem("item:distillate-of-replenishment-i", "Distillate of Replenishment I", { weight: 0.4, size: "Small" });
addItem("item:distillate-of-spirituality-i", "Distillate of Spirituality I", { weight: 0.4, size: "Small" });
addItem("item:minor-potion-of-heat", "Minor Potion of Heat", { weight: 0.4, size: "Small", effect: "Aura of Heat" });
addItem("item:minor-potion-of-purity", "Minor Potion of Purity", { weight: 0.4, size: "Small", effect: "Aura of Purity" });
addItem("item:blood-of-the-wolf", "Blood of the Wolf", { weight: 0.4, size: "Small", effect: "Spirit of Wolf" });
addItem("item:potion-of-lesser-rejuvenation", "Potion of Lesser Rejuvenation", { weight: 0.4, size: "Small", effect: "Rejuvenation" });
addItem("item:potion-of-wolves-blood", "Potion of Wolves Blood", { weight: 0.4, size: "Small" });
addItem("item:distillate-of-alacrity-ii", "Distillate of Alacrity II", { weight: 0.4, size: "Small" });
addItem("item:distillate-of-celestial-healing-ii", "Distillate of Celestial Healing II", { weight: 0.4, size: "Small" });
addItem("item:distillate-of-clarity-ii", "Distillate of Clarity II", { weight: 0.4, size: "Small" });
addItem("item:distillate-of-divine-healing-ii", "Distillate of Divine Healing II", { weight: 0.4, size: "Small" });
addItem("item:distillate-of-replenishment-ii", "Distillate of Replenishment II", { weight: 0.4, size: "Small" });

addRecipe("recipe:potion-of-lesser-cohesion", "Potion of Lesser Cohesion", 17, [{ id: "item:sage-leaf" }, { id: "item:fenugreek" }], "item:potion-of-lesser-cohesion", "container:medicine-bag");
addRecipe("recipe:potion-of-lesser-stability", "Potion of Lesser Stability", 17, [{ id: "item:lucerne" }, { id: "item:sage-leaf" }], "item:potion-of-lesser-stability", "container:medicine-bag");
addRecipe("recipe:potion-of-lesser-vigor", "Potion of Lesser Vigor", 17, [{ id: "item:lucerne" }, { id: "item:birthwort" }], "item:potion-of-lesser-vigor", "container:medicine-bag");
addRecipe("recipe:potion-of-charming-deceit", "Potion of Charming Deceit", 22, [{ id: "item:mugwart" }, { id: "item:undead-froglok-tongue" }], "item:potion-of-charming-deceit", "container:medicine-bag");
addRecipe("recipe:potion-of-lesser-accuracy", "Potion of Lesser Accuracy", 22, [{ id: "item:birthwort" }, { id: "item:fenugreek" }], "item:potion-of-lesser-accuracy", "container:medicine-bag");
addRecipe("recipe:potion-of-lesser-adroitness", "Potion of Lesser Adroitness", 22, [{ id: "item:sage-leaf" }, { id: "item:birthwort" }], "item:potion-of-lesser-adroitness", "container:medicine-bag");
addRecipe("recipe:potion-of-lesser-power", "Potion of Lesser Power", 22, [{ id: "item:lucerne" }, { id: "item:fenugreek" }], "item:potion-of-lesser-power", "container:medicine-bag");
addRecipe("recipe:minor-null-potion", "Minor Null Potion", 27, [{ id: "item:fenugreek" }, { id: "item:mandrake-root" }], "item:minor-null-potion", "container:medicine-bag");
addRecipe("recipe:minor-potion-of-antibody", "Minor Potion of Antibody", 27, [{ id: "item:maidenhair-fern" }, { id: "item:mullein" }], "item:minor-potion-of-antibody", "container:medicine-bag");
addRecipe("recipe:minor-potion-of-cold", "Minor Potion of Cold", 27, [{ id: "item:birthwort" }, { id: "item:allspice" }], "item:minor-potion-of-cold", "container:medicine-bag");
addRecipe("recipe:distillate-of-alacrity-i", "Distillate of Alacrity I", 31, [{ id: "item:small-vial", quantity: 5 }, { id: "item:arnworth" }], "item:distillate-of-alacrity-i", "container:medicine-bag");
addRecipe("recipe:distillate-of-celestial-healing-i", "Distillate of Celestial Healing I", 31, [{ id: "item:small-vial", quantity: 5 }, { id: "item:gerti-blossom" }], "item:distillate-of-celestial-healing-i", "container:medicine-bag");
addRecipe("recipe:distillate-of-clarity-i", "Distillate of Clarity I", 31, [{ id: "item:small-vial", quantity: 5 }, { id: "item:katuka-bark" }], "item:distillate-of-clarity-i", "container:medicine-bag");
addRecipe("recipe:distillate-of-divine-healing-i", "Distillate of Divine Healing I", 31, [{ id: "item:small-vial", quantity: 5 }, { id: "item:tregrum" }], "item:distillate-of-divine-healing-i", "container:medicine-bag");
addRecipe("recipe:distillate-of-replenishment-i", "Distillate of Replenishment I", 31, [{ id: "item:small-vial", quantity: 5 }, { id: "item:clivers" }], "item:distillate-of-replenishment-i", "container:medicine-bag");
addRecipe("recipe:distillate-of-spirituality-i", "Distillate of Spirituality I", 31, [{ id: "item:small-vial", quantity: 5 }, { id: "item:methysticum" }], "item:distillate-of-spirituality-i", "container:medicine-bag");
addRecipe("recipe:minor-potion-of-heat", "Minor Potion of Heat", 32, [{ id: "item:sage-leaf" }, { id: "item:benzoin" }], "item:minor-potion-of-heat", "container:medicine-bag");
addRecipe("recipe:minor-potion-of-purity", "Minor Potion of Purity", 32, [{ id: "item:lucerne" }, { id: "item:night-shade" }], "item:minor-potion-of-purity", "container:medicine-bag");
addRecipe("recipe:blood-of-the-wolf", "Blood of the Wolf", 37, [{ id: "item:birthwort" }, { id: "item:fenugreek" }, { id: "item:wolf-blood" }], "item:blood-of-the-wolf", "container:medicine-bag");
addRecipe("recipe:potion-of-lesser-rejuvenation", "Potion of Lesser Rejuvenation", 37, [{ id: "item:lucerne" }, { id: "item:sage-leaf" }, { id: "item:yarrow" }], "item:potion-of-lesser-rejuvenation", "container:medicine-bag");
addRecipe("recipe:potion-of-wolves-blood", "Potion of Wolves Blood", 37, [{ id: "item:high-quality-wolf-skin" }, { id: "item:sticklewort" }], "item:potion-of-wolves-blood", "container:medicine-bag");
addRecipe("recipe:distillate-of-alacrity-ii", "Distillate of Alacrity II", 41, [{ id: "item:pixie-dust" }, { id: "item:thorny-ergot" }, { id: "item:small-vial", quantity: 5 }, { id: "item:arnworth" }], "item:distillate-of-alacrity-ii", "container:reinforced-medicine-bag");
addRecipe("recipe:distillate-of-celestial-healing-ii", "Distillate of Celestial Healing II", 41, [{ id: "item:pixie-dust" }, { id: "item:thorny-ergot" }, { id: "item:small-vial", quantity: 5 }, { id: "item:gerti-blossom" }], "item:distillate-of-celestial-healing-ii", "container:reinforced-medicine-bag");
addRecipe("recipe:distillate-of-clarity-ii", "Distillate of Clarity II", 41, [{ id: "item:pixie-dust" }, { id: "item:thorny-ergot" }, { id: "item:small-vial", quantity: 5 }, { id: "item:katuka-bark" }], "item:distillate-of-clarity-ii", "container:reinforced-medicine-bag");
addRecipe("recipe:distillate-of-divine-healing-ii", "Distillate of Divine Healing II", 41, [{ id: "item:pixie-dust" }, { id: "item:thorny-ergot" }, { id: "item:small-vial", quantity: 5 }, { id: "item:tregrum" }], "item:distillate-of-divine-healing-ii", "container:reinforced-medicine-bag");
addRecipe("recipe:distillate-of-replenishment-ii", "Distillate of Replenishment II", 41, [{ id: "item:pixie-dust" }, { id: "item:thorny-ergot" }, { id: "item:clivers" }, { id: "item:small-vial", quantity: 5 }], "item:distillate-of-replenishment-ii", "container:reinforced-medicine-bag");

save();
console.log(`Migration 435 complete: ${itemsAdded} items added, ${recipesAdded} recipes added`);
