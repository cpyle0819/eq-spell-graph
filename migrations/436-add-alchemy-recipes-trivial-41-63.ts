/**
 * Migration 436 (issue #46, batch 4/N): Alchemy recipes, trivial 41-63.
 * Distillate tier II (remainder)/III, the Awareness I line
 * (Benefit/Cold/Disease/Magic/Poison/Heat), and mid-tier utility potions
 * (Antiweight, cure potions, Negation).
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

addItem("item:distillate-of-spirituality-ii", "Distillate of Spirituality II", { weight: 0.4, size: "Small" });
addItem("item:potion-of-frosty-insurgency", "Potion of Frosty Insurgency", { weight: 0.4, size: "Small" });
addItem("item:potion-of-unlife-awareness", "Potion of Unlife Awareness", { weight: 0.4, size: "Small" });
addItem("item:potion-of-aquatic-haunt", "Potion of Aquatic Haunt", { weight: 0.4, size: "Small", effect: "Everlasting Breath" });
addItem("item:potion-of-fleeting-languor", "Potion of Fleeting Languor", { weight: 0.4, size: "Small" });
addItem("item:potion-of-gorging-toxin", "Potion of Gorging Toxin", { weight: 0.4, size: "Small" });
addItem("item:potion-of-negation", "Potion of Negation", { weight: 0.4, size: "Small", effect: "Cancel Magic" });
addItem("item:benefit-awareness-i", "Benefit Awareness I", { weight: 0.4, size: "Small" });
addItem("item:cold-awareness-i", "Cold Awareness I", { weight: 0.4, size: "Small" });
addItem("item:disease-awareness-i", "Disease Awareness I", { weight: 0.4, size: "Small" });
addItem("item:magic-awareness-i", "Magic Awareness I", { weight: 0.4, size: "Small" });
addItem("item:poison-awareness-i", "Poison Awareness I", { weight: 0.4, size: "Small" });
addItem("item:heat-awareness-i", "Heat Awareness I", { weight: 0.4, size: "Small" });
addItem("item:kilva-s-blistering-flesh", "Kilva's Blistering Flesh", { weight: 0.4, size: "Small", effect: "Scorching Skin" });
addItem("item:potion-skin-of-ro", "Potion Skin of Ro", { weight: 0.4, size: "Small" });
addItem("item:potion-of-antiweight", "Potion of Antiweight", { weight: 0.4, size: "Small", effect: "Levitation" });
addItem("item:ethira-s-poison-antidote", "Ethira's Poison Antidote", { weight: 0.4, size: "Small", effect: "Counteract Poison" });
addItem("item:kithar-s-disease-treatment", "Kithar's Disease Treatment", { weight: 0.4, size: "Small", effect: "Counteract Disease" });
addItem("item:potion-of-gnomish-boils", "Potion of Gnomish Boils", { weight: 0.4, size: "Small" });
addItem("item:distillate-of-alacrity-iii", "Distillate of Alacrity III", { weight: 0.4, size: "Small" });
addItem("item:distillate-of-celestial-healing-iii", "Distillate of Celestial Healing III", { weight: 0.4, size: "Small" });
addItem("item:distillate-of-clarity-iii", "Distillate of Clarity III", { weight: 0.4, size: "Small" });
addItem("item:distillate-of-divine-healing-iii", "Distillate of Divine Healing III", { weight: 0.4, size: "Small" });
addItem("item:distillate-of-replenishment-iii", "Distillate of Replenishment III", { weight: 0.4, size: "Small" });
addItem("item:distillate-of-spirituality-iii", "Distillate of Spirituality III", { weight: 0.4, size: "Small" });
addItem("item:potion-of-vox-s-vitality", "Potion of Vox's Vitality", { weight: 0.4, size: "Small" });

addRecipe("recipe:distillate-of-spirituality-ii", "Distillate of Spirituality II", 41, [{ id: "item:pixie-dust" }, { id: "item:thorny-ergot" }, { id: "item:methysticum" }, { id: "item:small-vial", quantity: 5 }], "item:distillate-of-spirituality-ii", "container:reinforced-medicine-bag");
addRecipe("recipe:potion-of-frosty-insurgency", "Potion of Frosty Insurgency", 42, [{ id: "item:polar-bear-skin" }, { id: "item:bistort" }], "item:potion-of-frosty-insurgency", "container:medicine-bag");
addRecipe("recipe:potion-of-unlife-awareness", "Potion of Unlife Awareness", 42, [{ id: "item:elderberry" }, { id: "item:fennel" }], "item:potion-of-unlife-awareness", "container:medicine-bag");
addRecipe("recipe:potion-of-aquatic-haunt", "Potion of Aquatic Haunt", 47, [{ id: "item:jatamasi" }, { id: "item:hydrangea" }], "item:potion-of-aquatic-haunt", "container:medicine-bag");
addRecipe("recipe:potion-of-fleeting-languor", "Potion of Fleeting Languor", 47, [{ id: "item:white-wolf-skin" }, { id: "item:burdock-root" }], "item:potion-of-fleeting-languor", "container:medicine-bag");
addRecipe("recipe:potion-of-gorging-toxin", "Potion of Gorging Toxin", 47, [{ id: "item:giant-wasp-venom-sac" }, { id: "item:boneset" }], "item:potion-of-gorging-toxin", "container:medicine-bag");
addRecipe("recipe:potion-of-negation", "Potion of Negation", 47, [{ id: "item:mercury" }, { id: "item:mystic-ash" }], "item:potion-of-negation", "container:medicine-bag");
addRecipe("recipe:benefit-awareness-i", "Benefit Awareness I", 50, [{ id: "item:sage-leaf" }, { id: "item:sumbul" }, { id: "item:aloe" }], "item:benefit-awareness-i", "container:medicine-bag");
addRecipe("recipe:cold-awareness-i", "Cold Awareness I", 50, [{ id: "item:benzoin" }, { id: "item:sumbul" }, { id: "item:aloe" }], "item:cold-awareness-i", "container:medicine-bag");
addRecipe("recipe:disease-awareness-i", "Disease Awareness I", 50, [{ id: "item:birthwort" }, { id: "item:sumbul" }, { id: "item:aloe" }], "item:disease-awareness-i", "container:medicine-bag");
addRecipe("recipe:magic-awareness-i", "Magic Awareness I", 50, [{ id: "item:mandrake-root" }, { id: "item:sumbul" }, { id: "item:aloe" }], "item:magic-awareness-i", "container:medicine-bag");
addRecipe("recipe:poison-awareness-i", "Poison Awareness I", 50, [{ id: "item:night-shade" }, { id: "item:sumbul" }, { id: "item:aloe" }], "item:poison-awareness-i", "container:medicine-bag");
addRecipe("recipe:heat-awareness-i", "Heat Awareness I", 51, [{ id: "item:lucerne" }, { id: "item:sumbul" }, { id: "item:aloe" }], "item:heat-awareness-i", "container:medicine-bag");
addRecipe("recipe:kilva-s-blistering-flesh", "Kilva's Blistering Flesh", 52, [{ id: "item:clubmoss" }, { id: "item:jatamasi" }], "item:kilva-s-blistering-flesh", "container:medicine-bag");
addRecipe("recipe:potion-skin-of-ro", "Potion Skin of Ro", 52, [{ id: "item:vox-s-dust" }, { id: "item:fire-drake-scale" }], "item:potion-skin-of-ro", "container:medicine-bag");
addRecipe("recipe:potion-of-antiweight", "Potion of Antiweight", 52, [{ id: "item:sumbul" }, { id: "item:hydrangea" }], "item:potion-of-antiweight", "container:medicine-bag");
addRecipe("recipe:ethira-s-poison-antidote", "Ethira's Poison Antidote", 57, [{ id: "item:hyssop" }, { id: "item:lady-s-mantle" }], "item:ethira-s-poison-antidote", "container:medicine-bag");
addRecipe("recipe:kithar-s-disease-treatment", "Kithar's Disease Treatment", 57, [{ id: "item:echinacea" }, { id: "item:lady-s-mantle" }], "item:kithar-s-disease-treatment", "container:medicine-bag");
addRecipe("recipe:potion-of-gnomish-boils", "Potion of Gnomish Boils", 57, [{ id: "item:bat-fur" }, { id: "item:eyebright" }], "item:potion-of-gnomish-boils", "container:medicine-bag");
addRecipe("recipe:distillate-of-alacrity-iii", "Distillate of Alacrity III", 62, [{ id: "item:red-hellebore" }, { id: "item:amanita-phalloide" }, { id: "item:small-vial", quantity: 5 }, { id: "item:arnworth" }], "item:distillate-of-alacrity-iii", "container:reinforced-medicine-bag");
addRecipe("recipe:distillate-of-celestial-healing-iii", "Distillate of Celestial Healing III", 62, [{ id: "item:red-hellebore" }, { id: "item:amanita-phalloide" }, { id: "item:small-vial", quantity: 5 }, { id: "item:gerti-blossom" }], "item:distillate-of-celestial-healing-iii", "container:reinforced-medicine-bag");
addRecipe("recipe:distillate-of-clarity-iii", "Distillate of Clarity III", 62, [{ id: "item:red-hellebore" }, { id: "item:amanita-phalloide" }, { id: "item:small-vial", quantity: 5 }, { id: "item:katuka-bark" }], "item:distillate-of-clarity-iii", "container:reinforced-medicine-bag");
addRecipe("recipe:distillate-of-divine-healing-iii", "Distillate of Divine Healing III", 62, [{ id: "item:red-hellebore" }, { id: "item:amanita-phalloide" }, { id: "item:small-vial", quantity: 5 }, { id: "item:tregrum" }], "item:distillate-of-divine-healing-iii", "container:reinforced-medicine-bag");
addRecipe("recipe:distillate-of-replenishment-iii", "Distillate of Replenishment III", 62, [{ id: "item:red-hellebore" }, { id: "item:amanita-phalloide" }, { id: "item:clivers" }, { id: "item:small-vial", quantity: 5 }], "item:distillate-of-replenishment-iii", "container:reinforced-medicine-bag");
addRecipe("recipe:distillate-of-spirituality-iii", "Distillate of Spirituality III", 62, [{ id: "item:red-hellebore" }, { id: "item:amanita-phalloide" }, { id: "item:methysticum" }, { id: "item:small-vial", quantity: 5 }], "item:distillate-of-spirituality-iii", "container:reinforced-medicine-bag");
addRecipe("recipe:potion-of-vox-s-vitality", "Potion of Vox's Vitality", 63, [{ id: "item:froglok-leg" }, { id: "item:sea-spirit" }], "item:potion-of-vox-s-vitality", "container:medicine-bag");

save();
console.log(`Migration 436 complete: ${itemsAdded} items added, ${recipesAdded} recipes added`);
