/**
 * Migration 440 (issue #46, batch 8/N): Alchemy recipes, trivial 196-302.
 * Awareness III/IV's remainder, Essence of Froglok, the Mystical
 * Infusion / Elixir of Concentration leveling-path recipes, and Distillate
 * tier IX -- the trade's highest-trivial recipes (302).
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

addItem("item:disease-awareness-iii", "Disease Awareness III", { weight: 0.4, size: "Small" });
addItem("item:heat-awareness-iii", "Heat Awareness III", { weight: 0.4, size: "Small" });
addItem("item:magic-awareness-iii", "Magic Awareness III", { weight: 0.4, size: "Small" });
addItem("item:poison-awareness-iii", "Poison Awareness III", { weight: 0.4, size: "Small" });
addItem("item:essence-of-froglok", "Essence of Froglok", { weight: 0.4, size: "Small" });
addItem("item:mystical-infusion", "Mystical Infusion", { weight: 0.4, size: "Small" });
addItem("item:elixir-of-concentration", "Elixir of Concentration", { weight: 0.4, size: "Small" });
addItem("item:elixir-of-divine-endurance", "Elixir of Divine Endurance", { weight: 0.4, size: "Small" });
addItem("item:benefit-awareness-iv", "Benefit Awareness IV", { weight: 0.4, size: "Small" });
addItem("item:cold-awareness-iv", "Cold Awareness IV", { weight: 0.4, size: "Small" });
addItem("item:disease-awareness-iv", "Disease Awareness IV", { weight: 0.4, size: "Small" });
addItem("item:heat-awareness-iv", "Heat Awareness IV", { weight: 0.4, size: "Small" });
addItem("item:magic-awareness-iv", "Magic Awareness IV", { weight: 0.4, size: "Small" });
addItem("item:poison-awareness-iv", "Poison Awareness IV", { weight: 0.4, size: "Small" });
addItem("item:greater-mystical-infusion", "Greater Mystical Infusion", { weight: 0.4, size: "Small" });
addItem("item:elixir-of-greater-concentration", "Elixir of Greater Concentration", { weight: 0.4, size: "Small" });
addItem("item:potion-of-mystical-aptitude", "Potion of Mystical Aptitude", { weight: 0.4, size: "Small" });
addItem("item:distillate-of-alacrity-ix", "Distillate of Alacrity IX", { weight: 0.4, size: "Small" });
addItem("item:distillate-of-celestial-healing-ix", "Distillate of Celestial Healing IX", { weight: 0.4, size: "Small" });
addItem("item:distillate-of-clarity-ix", "Distillate of Clarity IX", { weight: 0.4, size: "Small" });
addItem("item:distillate-of-divine-healing-ix", "Distillate of Divine Healing IX", { weight: 0.4, size: "Small" });
addItem("item:distillate-of-replenishment-ix", "Distillate of Replenishment IX", { weight: 0.4, size: "Small" });
addItem("item:distillate-of-spirituality-ix", "Distillate of Spirituality IX", { weight: 0.4, size: "Small" });

addRecipe("recipe:disease-awareness-iii", "Disease Awareness III", 196, [{ id: "item:birthwort" }, { id: "item:figwort" }, { id: "item:briar-thistle" }], "item:disease-awareness-iii", "container:medicine-bag");
addRecipe("recipe:heat-awareness-iii", "Heat Awareness III", 196, [{ id: "item:lucerne" }, { id: "item:figwort" }, { id: "item:briar-thistle" }], "item:heat-awareness-iii", "container:medicine-bag");
addRecipe("recipe:magic-awareness-iii", "Magic Awareness III", 196, [{ id: "item:mandrake-root" }, { id: "item:figwort" }, { id: "item:briar-thistle" }], "item:magic-awareness-iii", "container:medicine-bag");
addRecipe("recipe:poison-awareness-iii", "Poison Awareness III", 196, [{ id: "item:night-shade" }, { id: "item:figwort" }, { id: "item:briar-thistle" }], "item:poison-awareness-iii", "container:medicine-bag");
addRecipe("recipe:essence-of-froglok", "Essence of Froglok", 202, [{ id: "item:wormwood" }, { id: "item:green-froglok-skin" }], "item:essence-of-froglok", "container:medicine-bag");
addRecipe("recipe:mystical-infusion", "Mystical Infusion", 202, [{ id: "item:sickle-leaf", quantity: 2 }], "item:mystical-infusion", "container:medicine-bag");
addRecipe("recipe:elixir-of-concentration", "Elixir of Concentration", 212, [{ id: "item:violet-tri-tube-sap" }, { id: "item:yerbhimba" }], "item:elixir-of-concentration", "container:medicine-bag");
addRecipe("recipe:elixir-of-divine-endurance", "Elixir of Divine Endurance", 223, [{ id: "item:betherium-bark" }, { id: "item:blade-leaf" }], "item:elixir-of-divine-endurance", "container:medicine-bag");
addRecipe("recipe:benefit-awareness-iv", "Benefit Awareness IV", 228, [{ id: "item:sage-leaf" }, { id: "item:dhea" }, { id: "item:agrimony" }, { id: "item:clover" }, { id: "item:briar-thistle" }], "item:benefit-awareness-iv", "container:medicine-bag");
addRecipe("recipe:cold-awareness-iv", "Cold Awareness IV", 228, [{ id: "item:benzoin" }, { id: "item:dhea" }, { id: "item:agrimony" }, { id: "item:clover" }, { id: "item:briar-thistle" }], "item:cold-awareness-iv", "container:medicine-bag");
addRecipe("recipe:disease-awareness-iv", "Disease Awareness IV", 228, [{ id: "item:birthwort" }, { id: "item:dhea" }, { id: "item:agrimony" }, { id: "item:clover" }, { id: "item:briar-thistle" }], "item:disease-awareness-iv", "container:medicine-bag");
addRecipe("recipe:heat-awareness-iv", "Heat Awareness IV", 228, [{ id: "item:lucerne" }, { id: "item:dhea" }, { id: "item:agrimony" }, { id: "item:clover" }, { id: "item:briar-thistle" }], "item:heat-awareness-iv", "container:medicine-bag");
addRecipe("recipe:magic-awareness-iv", "Magic Awareness IV", 228, [{ id: "item:mandrake-root" }, { id: "item:dhea" }, { id: "item:agrimony" }, { id: "item:clover" }, { id: "item:briar-thistle" }], "item:magic-awareness-iv", "container:medicine-bag");
addRecipe("recipe:poison-awareness-iv", "Poison Awareness IV", 228, [{ id: "item:night-shade" }, { id: "item:dhea" }, { id: "item:agrimony" }, { id: "item:clover" }, { id: "item:briar-thistle" }], "item:poison-awareness-iv", "container:medicine-bag");
addRecipe("recipe:greater-mystical-infusion", "Greater Mystical Infusion", 234, [{ id: "item:sickle-leaf" }, { id: "item:yerbhimba" }], "item:greater-mystical-infusion", "container:medicine-bag");
addRecipe("recipe:elixir-of-greater-concentration", "Elixir of Greater Concentration", 244, [{ id: "item:violet-tri-tube-sap" }, { id: "item:duskglow-vine" }], "item:elixir-of-greater-concentration", "container:medicine-bag");
addRecipe("recipe:potion-of-mystical-aptitude", "Potion of Mystical Aptitude", 255, [{ id: "item:yerbhimba" }, { id: "item:duskglow-vine" }], "item:potion-of-mystical-aptitude", "container:medicine-bag");
addRecipe("recipe:distillate-of-alacrity-ix", "Distillate of Alacrity IX", 302, [{ id: "item:comfrey" }, { id: "item:deepwater-ink" }, { id: "item:small-vial", quantity: 5 }, { id: "item:arnworth" }], "item:distillate-of-alacrity-ix", "container:reinforced-medicine-bag");
addRecipe("recipe:distillate-of-celestial-healing-ix", "Distillate of Celestial Healing IX", 302, [{ id: "item:comfrey" }, { id: "item:deepwater-ink" }, { id: "item:small-vial", quantity: 5 }, { id: "item:gerti-blossom" }], "item:distillate-of-celestial-healing-ix", "container:reinforced-medicine-bag");
addRecipe("recipe:distillate-of-clarity-ix", "Distillate of Clarity IX", 302, [{ id: "item:comfrey" }, { id: "item:deepwater-ink" }, { id: "item:small-vial", quantity: 5 }, { id: "item:katuka-bark" }], "item:distillate-of-clarity-ix", "container:reinforced-medicine-bag");
addRecipe("recipe:distillate-of-divine-healing-ix", "Distillate of Divine Healing IX", 302, [{ id: "item:comfrey" }, { id: "item:deepwater-ink" }, { id: "item:small-vial", quantity: 5 }, { id: "item:tregrum" }], "item:distillate-of-divine-healing-ix", "container:reinforced-medicine-bag");
addRecipe("recipe:distillate-of-replenishment-ix", "Distillate of Replenishment IX", 302, [{ id: "item:comfrey" }, { id: "item:deepwater-ink" }, { id: "item:clivers" }, { id: "item:small-vial", quantity: 5 }], "item:distillate-of-replenishment-ix", "container:reinforced-medicine-bag");
addRecipe("recipe:distillate-of-spirituality-ix", "Distillate of Spirituality IX", 302, [{ id: "item:comfrey" }, { id: "item:deepwater-ink" }, { id: "item:methysticum" }, { id: "item:small-vial", quantity: 5 }], "item:distillate-of-spirituality-ix", "container:reinforced-medicine-bag");

save();
console.log(`Migration 440 complete: ${itemsAdded} items added, ${recipesAdded} recipes added`);
