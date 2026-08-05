/**
 * Migration 439 (issue #46, batch 7/N): Alchemy recipes, trivial 162-196.
 * The Essence of <Race> (Wormwood) illusion line (12 of 14 races
 * -- Froglok and remaining two land in the final batch), teleport potions
 * (Frost/Swamp/Gate), and Awareness III's opening rows.
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

addItem("item:ogre-meat", "Ogre Meat");
addItem("item:half-elf-meat", "Half Elf Meat");

addItem("item:essence-of-barbarian-wormwood", "Essence of Barbarian (Wormwood)", { weight: 0.4, size: "Small" });
addItem("item:essence-of-erudite-wormwood", "Essence of Erudite (Wormwood)", { weight: 0.4, size: "Small" });
addItem("item:essence-of-human-wormwood", "Essence of Human (Wormwood)", { weight: 0.4, size: "Small" });
addItem("item:greater-potion-of-heat", "Greater Potion of Heat", { weight: 0.4, size: "Small", effect: "Aura of Heat" });
addItem("item:greater-potion-of-purity", "Greater Potion of Purity", { weight: 0.4, size: "Small", effect: "Aura of Purity" });
addItem("item:potion-of-greater-rejuvenation", "Potion of Greater Rejuvenation", { weight: 0.4, size: "Small", effect: "Rejuvenation" });
addItem("item:potion-of-hathcoat-s-spirit", "Potion of Hathcoat's Spirit", { weight: 0.4, size: "Small" });
addItem("item:essence-of-dark-elf-wormwood", "Essence of Dark Elf (Wormwood)", { weight: 0.4, size: "Small" });
addItem("item:essence-of-ogre-wormwood", "Essence of Ogre (Wormwood)", { weight: 0.4, size: "Small" });
addItem("item:essence-of-wood-elf-wormwood", "Essence of Wood Elf (Wormwood)", { weight: 0.4, size: "Small" });
addItem("item:essence-of-half-elf-wormwood", "Essence of Half Elf (Wormwood)", { weight: 0.4, size: "Small" });
addItem("item:essence-of-gukta-wormwood", "Essence of Gukta (Wormwood)", { weight: 0.4, size: "Small" });
addItem("item:essence-of-high-elf-wormwood", "Essence of High Elf (Wormwood)", { weight: 0.4, size: "Small" });
addItem("item:adrenaline-tap", "Adrenaline Tap", { weight: 0.4, size: "Small", effect: "Flurry" });
addItem("item:essence-of-halfling-wormwood", "Essence of Halfling (Wormwood)", { weight: 0.4, size: "Small" });
addItem("item:potion-of-the-frost", "Potion of the Frost", { weight: 0.4, size: "Small", effect: "Frost Port" });
addItem("item:potion-of-the-swamp", "Potion of the Swamp", { weight: 0.4, size: "Small", effect: "Swamp Port" });
addItem("item:essence-of-dwarf-wormwood", "Essence of Dwarf (Wormwood)", { weight: 0.4, size: "Small" });
addItem("item:essence-of-gnome-wormwood", "Essence of Gnome (Wormwood)", { weight: 0.4, size: "Small" });
addItem("item:essence-of-troll-wormwood", "Essence of Troll (Wormwood)", { weight: 0.4, size: "Small" });
addItem("item:gate-potion", "Gate Potion", { weight: 0.4, size: "Small" });
addItem("item:titan-potion", "Titan Potion", { weight: 0.4, size: "Small" });
addItem("item:army-ant-potion", "Army Ant Potion", { weight: 0.4, size: "Small" });
addItem("item:hawks-eye-tonic", "Hawks Eye Tonic", { weight: 0.4, size: "Small" });
addItem("item:benefit-awareness-iii", "Benefit Awareness III", { weight: 0.4, size: "Small" });
addItem("item:cold-awareness-iii", "Cold Awareness III", { weight: 0.4, size: "Small" });

addRecipe("recipe:essence-of-barbarian-wormwood", "Essence of Barbarian (Wormwood)", 162, [{ id: "item:barbarian-meat" }, { id: "item:wormwood" }], "item:essence-of-barbarian-wormwood", "container:medicine-bag");
addRecipe("recipe:essence-of-erudite-wormwood", "Essence of Erudite (Wormwood)", 162, [{ id: "item:erudite-meat" }, { id: "item:wormwood" }], "item:essence-of-erudite-wormwood", "container:medicine-bag");
addRecipe("recipe:essence-of-human-wormwood", "Essence of Human (Wormwood)", 162, [{ id: "item:wormwood" }, { id: "item:human-parts" }], "item:essence-of-human-wormwood", "container:medicine-bag");
addRecipe("recipe:greater-potion-of-heat", "Greater Potion of Heat", 163, [{ id: "item:sage-leaf" }, { id: "item:benzoin" }, { id: "item:valerian-root" }], "item:greater-potion-of-heat", "container:medicine-bag");
addRecipe("recipe:greater-potion-of-purity", "Greater Potion of Purity", 163, [{ id: "item:lucerne" }, { id: "item:night-shade" }, { id: "item:valerian-root" }], "item:greater-potion-of-purity", "container:medicine-bag");
addRecipe("recipe:potion-of-greater-rejuvenation", "Potion of Greater Rejuvenation", 163, [{ id: "item:lucerne" }, { id: "item:sage-leaf" }, { id: "item:agrimony" }], "item:potion-of-greater-rejuvenation", "container:medicine-bag");
addRecipe("recipe:potion-of-hathcoat-s-spirit", "Potion of Hathcoat's Spirit", 163, [{ id: "item:larkspur" }, { id: "item:evil-eye-eyestalk" }], "item:potion-of-hathcoat-s-spirit", "container:medicine-bag");
addRecipe("recipe:essence-of-dark-elf-wormwood", "Essence of Dark Elf (Wormwood)", 164, [{ id: "item:dark-elf-parts" }, { id: "item:wormwood" }], "item:essence-of-dark-elf-wormwood", "container:medicine-bag");
addRecipe("recipe:essence-of-ogre-wormwood", "Essence of Ogre (Wormwood)", 164, [{ id: "item:ogre-meat" }, { id: "item:wormwood" }], "item:essence-of-ogre-wormwood", "container:medicine-bag");
addRecipe("recipe:essence-of-wood-elf-wormwood", "Essence of Wood Elf (Wormwood)", 164, [{ id: "item:wood-elf-parts" }, { id: "item:wormwood" }], "item:essence-of-wood-elf-wormwood", "container:medicine-bag");
addRecipe("recipe:essence-of-half-elf-wormwood", "Essence of Half Elf (Wormwood)", 166, [{ id: "item:half-elf-meat" }, { id: "item:wormwood" }], "item:essence-of-half-elf-wormwood", "container:medicine-bag");
addRecipe("recipe:essence-of-gukta-wormwood", "Essence of Gukta (Wormwood)", 167, [{ id: "item:wormwood" }, { id: "item:froglok-blood" }], "item:essence-of-gukta-wormwood", "container:medicine-bag");
addRecipe("recipe:essence-of-high-elf-wormwood", "Essence of High Elf (Wormwood)", 168, [{ id: "item:high-elf-parts" }, { id: "item:wormwood" }], "item:essence-of-high-elf-wormwood", "container:medicine-bag");
addRecipe("recipe:adrenaline-tap", "Adrenaline Tap", 170, [{ id: "item:dhea" }, { id: "item:comfrey" }], "item:adrenaline-tap", "container:medicine-bag");
addRecipe("recipe:essence-of-halfling-wormwood", "Essence of Halfling (Wormwood)", 170, [{ id: "item:halfling-parts" }, { id: "item:wormwood" }], "item:essence-of-halfling-wormwood", "container:medicine-bag");
addRecipe("recipe:potion-of-the-frost", "Potion of the Frost", 170, [{ id: "item:heliotrope" }, { id: "item:oakmoss" }], "item:potion-of-the-frost", "container:medicine-bag");
addRecipe("recipe:potion-of-the-swamp", "Potion of the Swamp", 170, [{ id: "item:heliotrope" }, { id: "item:bladderwrack" }], "item:potion-of-the-swamp", "container:medicine-bag");
addRecipe("recipe:essence-of-dwarf-wormwood", "Essence of Dwarf (Wormwood)", 171, [{ id: "item:dwarf-meat" }, { id: "item:wormwood" }], "item:essence-of-dwarf-wormwood", "container:medicine-bag");
addRecipe("recipe:essence-of-gnome-wormwood", "Essence of Gnome (Wormwood)", 172, [{ id: "item:gnome-meat" }, { id: "item:wormwood" }], "item:essence-of-gnome-wormwood", "container:medicine-bag");
addRecipe("recipe:essence-of-troll-wormwood", "Essence of Troll (Wormwood)", 174, [{ id: "item:troll-parts" }, { id: "item:wormwood" }], "item:essence-of-troll-wormwood", "container:medicine-bag");
addRecipe("recipe:gate-potion", "Gate Potion", 176, [{ id: "item:heliotrope", quantity: 3 }], "item:gate-potion", "container:medicine-bag");
addRecipe("recipe:titan-potion", "Titan Potion", 180, [{ id: "item:tri-fern-leaf" }, { id: "item:maliak-leaf" }], "item:titan-potion", "container:medicine-bag");
addRecipe("recipe:army-ant-potion", "Army Ant Potion", 187, [{ id: "item:valerian-root" }, { id: "item:sumbul" }, { id: "item:celandine-herb" }, { id: "item:feverfew" }], "item:army-ant-potion", "container:medicine-bag");
addRecipe("recipe:hawks-eye-tonic", "Hawks Eye Tonic", 191, [{ id: "item:tri-fern-leaf" }, { id: "item:star-reach-clover" }], "item:hawks-eye-tonic", "container:medicine-bag");
addRecipe("recipe:benefit-awareness-iii", "Benefit Awareness III", 196, [{ id: "item:sage-leaf" }, { id: "item:figwort" }, { id: "item:briar-thistle" }], "item:benefit-awareness-iii", "container:medicine-bag");
addRecipe("recipe:cold-awareness-iii", "Cold Awareness III", 196, [{ id: "item:benzoin" }, { id: "item:figwort" }, { id: "item:briar-thistle" }], "item:cold-awareness-iii", "container:medicine-bag");

save();
console.log(`Migration 439 complete: ${itemsAdded} items added, ${recipesAdded} recipes added`);
