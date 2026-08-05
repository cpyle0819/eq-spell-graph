/**
 * Migration 437 (issue #46, batch 5/N): Alchemy recipes, trivial 63-110.
 * The "Blue Vervain Bulb" second-tier stat potions (Cohesion/
 * Stability/Vigor/Accuracy/Adroitness/Power), Distillate tier IV, and
 * Null/Antibody/Cold/Heat/Purity's own second tier.
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

addItem("item:vampire-dust", "Vampire Dust");

addItem("item:serpent-s-conviction", "Serpent's Conviction", { weight: 0.4, size: "Small", effect: "Serpent Sight" });
addItem("item:turtle-s-drink", "Turtle's Drink", { weight: 0.4, size: "Small" });
addItem("item:ant-s-potion", "Ant's Potion", { weight: 0.4, size: "Small", effect: "Ant Legs" });
addItem("item:vial-of-tamed-mercury", "Vial of Tamed Mercury", { weight: 0.4, size: "Small", effect: "Flurry" });
addItem("item:potion-of-cohesion", "Potion of Cohesion", { weight: 0.4, size: "Small", effect: "Cohesion" });
addItem("item:potion-of-stability", "Potion of Stability", { weight: 0.4, size: "Small", effect: "Stability" });
addItem("item:potion-of-vigor", "Potion of Vigor", { weight: 0.4, size: "Small", effect: "Vigor" });
addItem("item:potion-of-accuracy", "Potion of Accuracy", { weight: 0.4, size: "Small", effect: "Accuracy" });
addItem("item:potion-of-adroitness", "Potion of Adroitness", { weight: 0.4, size: "Small", effect: "Adroitness" });
addItem("item:potion-of-gulon-s-impunity", "Potion of Gulon's Impunity", { weight: 0.4, size: "Small" });
addItem("item:potion-of-power", "Potion of Power", { weight: 0.4, size: "Small", effect: "Power" });
addItem("item:distillate-of-alacrity-iv", "Distillate of Alacrity IV", { weight: 0.4, size: "Small" });
addItem("item:distillate-of-celestial-healing-iv", "Distillate of Celestial Healing IV", { weight: 0.4, size: "Small" });
addItem("item:distillate-of-clarity-iv", "Distillate of Clarity IV", { weight: 0.4, size: "Small" });
addItem("item:distillate-of-divine-healing-iv", "Distillate of Divine Healing IV", { weight: 0.4, size: "Small" });
addItem("item:distillate-of-replenishment-iv", "Distillate of Replenishment IV", { weight: 0.4, size: "Small" });
addItem("item:distillate-of-spirituality-iv", "Distillate of Spirituality IV", { weight: 0.4, size: "Small" });
addItem("item:null-potion", "Null Potion", { weight: 0.4, size: "Small", effect: "Null Aura" });
addItem("item:potion-of-antibody", "Potion of Antibody", { weight: 0.4, size: "Small", effect: "Aura of Antibody" });
addItem("item:potion-of-copal-s-demis", "Potion of Copal's Demis", { weight: 0.4, size: "Small" });
addItem("item:potion-of-cold", "Potion of Cold", { weight: 0.4, size: "Small", effect: "Aura of Cold" });
addItem("item:potion-of-heat", "Potion of Heat", { weight: 0.4, size: "Small", effect: "Aura of Heat" });
addItem("item:potion-of-purity", "Potion of Purity", { weight: 0.4, size: "Small", effect: "Aura of Purity" });
addItem("item:potion-of-rejuvenation", "Potion of Rejuvenation", { weight: 0.4, size: "Small", effect: "Rejuvenation" });
addItem("item:potion-of-shumar-s-breath", "Potion of Shumar's Breath", { weight: 0.4, size: "Small" });
addItem("item:potion-of-spirit-shield", "Potion of Spirit Shield", { weight: 0.4, size: "Small", effect: "Shifting Shield" });

addRecipe("recipe:serpent-s-conviction", "Serpent's Conviction", 63, [{ id: "item:fennel" }, { id: "item:eucalyptus-leaf" }], "item:serpent-s-conviction", "container:medicine-bag");
addRecipe("recipe:turtle-s-drink", "Turtle's Drink", 63, [{ id: "item:clubmoss" }, { id: "item:sumbul" }], "item:turtle-s-drink", "container:medicine-bag");
addRecipe("recipe:ant-s-potion", "Ant's Potion", 70, [{ id: "item:sumbul" }, { id: "item:celandine-herb" }], "item:ant-s-potion", "container:medicine-bag");
addRecipe("recipe:vial-of-tamed-mercury", "Vial of Tamed Mercury", 70, [{ id: "item:mercury" }, { id: "item:comfrey" }], "item:vial-of-tamed-mercury", "container:medicine-bag");
addRecipe("recipe:potion-of-cohesion", "Potion of Cohesion", 76, [{ id: "item:sage-leaf" }, { id: "item:fenugreek" }, { id: "item:blue-vervain-bulb" }], "item:potion-of-cohesion", "container:medicine-bag");
addRecipe("recipe:potion-of-stability", "Potion of Stability", 76, [{ id: "item:lucerne" }, { id: "item:sage-leaf" }, { id: "item:blue-vervain-bulb" }], "item:potion-of-stability", "container:medicine-bag");
addRecipe("recipe:potion-of-vigor", "Potion of Vigor", 76, [{ id: "item:lucerne" }, { id: "item:birthwort" }, { id: "item:blue-vervain-bulb" }], "item:potion-of-vigor", "container:medicine-bag");
addRecipe("recipe:potion-of-accuracy", "Potion of Accuracy", 83, [{ id: "item:birthwort" }, { id: "item:fenugreek" }, { id: "item:blue-vervain-bulb" }], "item:potion-of-accuracy", "container:medicine-bag");
addRecipe("recipe:potion-of-adroitness", "Potion of Adroitness", 83, [{ id: "item:sage-leaf" }, { id: "item:birthwort" }, { id: "item:blue-vervain-bulb" }], "item:potion-of-adroitness", "container:medicine-bag");
addRecipe("recipe:potion-of-gulon-s-impunity", "Potion of Gulon's Impunity", 83, [{ id: "item:lightstone" }, { id: "item:ground-figwort" }], "item:potion-of-gulon-s-impunity", "container:medicine-bag");
addRecipe("recipe:potion-of-power", "Potion of Power", 83, [{ id: "item:lucerne" }, { id: "item:fenugreek" }, { id: "item:blue-vervain-bulb" }], "item:potion-of-power", "container:medicine-bag");
addRecipe("recipe:distillate-of-alacrity-iv", "Distillate of Alacrity IV", 88, [{ id: "item:white-hellebore" }, { id: "item:snakes-head-iris" }, { id: "item:small-vial", quantity: 5 }, { id: "item:arnworth" }], "item:distillate-of-alacrity-iv", "container:reinforced-medicine-bag");
addRecipe("recipe:distillate-of-celestial-healing-iv", "Distillate of Celestial Healing IV", 88, [{ id: "item:white-hellebore" }, { id: "item:snakes-head-iris" }, { id: "item:small-vial", quantity: 5 }, { id: "item:gerti-blossom" }], "item:distillate-of-celestial-healing-iv", "container:reinforced-medicine-bag");
addRecipe("recipe:distillate-of-clarity-iv", "Distillate of Clarity IV", 88, [{ id: "item:white-hellebore" }, { id: "item:snakes-head-iris" }, { id: "item:small-vial", quantity: 5 }, { id: "item:katuka-bark" }], "item:distillate-of-clarity-iv", "container:reinforced-medicine-bag");
addRecipe("recipe:distillate-of-divine-healing-iv", "Distillate of Divine Healing IV", 88, [{ id: "item:white-hellebore" }, { id: "item:snakes-head-iris" }, { id: "item:small-vial", quantity: 5 }, { id: "item:tregrum" }], "item:distillate-of-divine-healing-iv", "container:reinforced-medicine-bag");
addRecipe("recipe:distillate-of-replenishment-iv", "Distillate of Replenishment IV", 88, [{ id: "item:white-hellebore" }, { id: "item:snakes-head-iris" }, { id: "item:clivers" }, { id: "item:small-vial", quantity: 5 }], "item:distillate-of-replenishment-iv", "container:reinforced-medicine-bag");
addRecipe("recipe:distillate-of-spirituality-iv", "Distillate of Spirituality IV", 88, [{ id: "item:white-hellebore" }, { id: "item:snakes-head-iris" }, { id: "item:methysticum" }, { id: "item:small-vial", quantity: 5 }], "item:distillate-of-spirituality-iv", "container:reinforced-medicine-bag");
addRecipe("recipe:null-potion", "Null Potion", 90, [{ id: "item:fenugreek" }, { id: "item:mandrake-root" }, { id: "item:blue-vervain-bulb" }], "item:null-potion", "container:medicine-bag");
addRecipe("recipe:potion-of-antibody", "Potion of Antibody", 90, [{ id: "item:maidenhair-fern" }, { id: "item:mullein" }, { id: "item:blue-vervain-bulb" }], "item:potion-of-antibody", "container:medicine-bag");
addRecipe("recipe:potion-of-copal-s-demis", "Potion of Copal's Demis", 90, [{ id: "item:horehound" }, { id: "item:evil-eye-eyestalk" }], "item:potion-of-copal-s-demis", "container:medicine-bag");
addRecipe("recipe:potion-of-cold", "Potion of Cold", 96, [{ id: "item:birthwort" }, { id: "item:allspice" }, { id: "item:blue-vervain-bulb" }], "item:potion-of-cold", "container:medicine-bag");
addRecipe("recipe:potion-of-heat", "Potion of Heat", 96, [{ id: "item:sage-leaf" }, { id: "item:benzoin" }, { id: "item:blue-vervain-bulb" }], "item:potion-of-heat", "container:medicine-bag");
addRecipe("recipe:potion-of-purity", "Potion of Purity", 103, [{ id: "item:lucerne" }, { id: "item:night-shade" }, { id: "item:blue-vervain-bulb" }], "item:potion-of-purity", "container:medicine-bag");
addRecipe("recipe:potion-of-rejuvenation", "Potion of Rejuvenation", 103, [{ id: "item:lucerne" }, { id: "item:sage-leaf" }, { id: "item:figwort" }], "item:potion-of-rejuvenation", "container:medicine-bag");
addRecipe("recipe:potion-of-shumar-s-breath", "Potion of Shumar's Breath", 103, [{ id: "item:horehound" }, { id: "item:vampire-dust" }], "item:potion-of-shumar-s-breath", "container:medicine-bag");
addRecipe("recipe:potion-of-spirit-shield", "Potion of Spirit Shield", 110, [{ id: "item:clubmoss" }, { id: "item:sumbul" }, { id: "item:clover" }], "item:potion-of-spirit-shield", "container:medicine-bag");

save();
console.log(`Migration 437 complete: ${itemsAdded} items added, ${recipesAdded} recipes added`);
