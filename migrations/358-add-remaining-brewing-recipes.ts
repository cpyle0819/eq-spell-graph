/**
 * Migration 358: add the rest of eqlwiki.com's "Skill Brewing" recipe table
 * (issue #32) -- migration 355 modeled only the "Antonica Biased Brewers"
 * 11-recipe leveling path; this adds the remaining 56 recipes from that same
 * page's full "Recipe List" table (67 rows total), so Brewing's Recipes/
 * Ingredients browse view covers the whole trade, not just the leveling
 * spine. The Leveling Guide itself is unchanged -- it's still just those
 * original 11 recipes, in the same order.
 *
 * Sourced the same way as migration 355: eqlwiki.com's raw wikitext via its
 * MediaWiki API (batched multi-title queries), not WebFetch's summarizer.
 * Two entries have no clean numeric trivial on the wiki itself: "Boot Beer"
 * is wiki-marked as an uncertain range ("158 < ? <= 168") -- modeled here at
 * 168, the range's own upper bound; "Blackburrow Swig" is marked "no fail"
 * (always succeeds) -- modeled at trivial 0. "Flask of Water" is a wiki
 * redirect to "Water Flask" (confirmed directly), not a distinct item --
 * every recipe using it points at the existing item:water-flask.
 *
 * Vendor sourcing: every vendor eqlwiki.com's own soldby table lists, not a
 * capped/representative subset -- some ingredients (Bottle of Milk,
 * Frosting, Spices, Vinegar, Fishing Bait) are sold in 30-70+ towns. A
 * vendor is only added when its own zone already exists as a `zone` node in
 * this graph (a `located_in` edge needs a real target) -- a handful of
 * wiki-listed zones aren't catalogued here yet (Kelethin, Erud's Crossing,
 * Highpass Keep -- distinct from the already-catalogued Highpass Hold, and
 * a few ambiguous bare "Felwithe" vendor entries the wiki itself doesn't
 * disambiguate between Northern/Southern) and are skipped, logged at the
 * end rather than guessed at.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, updateNode, slug, save } = loadGraph(import.meta.dir);

let recipesAdded = 0;
let itemsAdded = 0;
let vendorsAdded = 0;
let sellsEdgesAdded = 0;
const skippedVendors: string[] = [];

function addItem(id: string, label: string, opts: { weight?: number; size?: string; source?: string; stats?: Record<string, number>; resists?: Record<string, number> } = {}) {
  if (hasNode(id)) return;
  addNode({ id, label, type: "item", ...opts });
  itemsAdded++;
}

interface Ingredient {
  id: string;
  quantity?: number;
}

function addRecipe(id: string, label: string, trivial: number, uses: Ingredient[], produces: string, produceQty?: number) {
  addNode({ id, label, type: "recipe", tradeskill: "Brewing", trivial });
  recipesAdded++;
  for (const ing of uses) {
    addEdge(id, ing.id, "uses", ing.quantity && ing.quantity !== 1 ? { quantity: ing.quantity } : undefined);
  }
  addEdge(id, produces, "produces", produceQty && produceQty !== 1 ? { quantity: produceQty } : undefined);
  addEdge(id, "container:brew-barrel", "crafted_in");
}

// ---------------------------------------------------------------------
// New base ingredients (not already in the graph). Weight/size from each
// item's own eqlwiki.com stat block.
// ---------------------------------------------------------------------
addItem("item:berries", "Berries", { weight: 0.8, size: "Small" });
addItem("item:pod-of-water", "Pod of Water", { weight: 0.5, size: "Small" });
addItem("item:fruit", "Fruit", { weight: 0.8, size: "Small" });
addItem("item:rathe-berries", "Rathe Berries", { weight: 0.6, size: "Small" });
addItem("item:sylvan-berries", "Sylvan Berries", { weight: 0.6, size: "Small", source: "Foraged" });
addItem("item:bottle-of-milk", "Bottle of Milk", { weight: 0.4, size: "Small" });
addItem("item:tea-leaves", "Tea Leaves", { weight: 0.6, size: "Small", source: "Foraged" });
addItem("item:white-algae", "White Algae", { weight: 0.1, size: "Small" });
addItem("item:azure-algae", "Azure Algae", { weight: 0.2, size: "Small" });
addItem("item:ochre-algae", "Ochre Algae", { weight: 0.2, size: "Small" });
addItem("item:brown-algae", "Brown Algae", { weight: 0.2, size: "Small" });
addItem("item:chunk-of-ice", "Chunk of Ice", { weight: 1.0, size: "Small" });
addItem("item:frosting", "Frosting", { weight: 0.1, size: "Small" });
addItem("item:roots", "Roots", { weight: 1.0, size: "Small", source: "Foraged" });
addItem("item:spices", "Spices", { weight: 0.1, size: "Small" });
addItem("item:emerald-orange", "Emerald Orange", { weight: 0.8, size: "Small", source: "Foraged" });
addItem("item:deadbone-barley", "Deadbone Barley", { weight: 0.2, size: "Small" });
addItem("item:flask-of-bloodwater", "Flask of Bloodwater", { weight: 0.4, size: "Small" });
addItem("item:a-giant-blood-sac", "A Giant Blood Sac", { weight: 1.0, size: "Small" });
addItem("item:bag-of-caynar-nuts", "Bag of Caynar Nuts", { weight: 0.6, size: "Small" });
addItem("item:royal-jelly", "Royal Jelly", { weight: 0.1, size: "Small" });
addItem("item:brackish-water", "Brackish Water", { weight: 0.5, size: "Small" });
addItem("item:froglok-meat", "Froglok Meat", { weight: 1.0, size: "Small", source: "Dropped by frogloks" });
addItem("item:aviak-eggs", "Aviak Eggs", { weight: 0.6, size: "Small", source: "Dropped by aviaks" });
addItem("item:cobalt-cod", "Cobalt Cod", { weight: 1.0, size: "Small" });
addItem("item:drake-egg", "Drake Egg", { weight: 0.6, size: "Small", source: "Foraged in Skyshrine; rare drop off named drakes there" });
addItem("item:fish-eggs", "Fish Eggs", { weight: 0.1, size: "Small" });
addItem("item:wine-yeast", "Wine Yeast", { weight: 0.2, size: "Small" });
addItem("item:fire-beetle-eye", "Fire Beetle Eye", { weight: 0.2, size: "Tiny", source: "Dropped by fire beetles" });
addItem("item:snake-egg", "Snake Egg", { weight: 0.2, size: "Tiny", source: "Dropped by snakes" });
addItem("item:strange-dark-fungus", "Strange Dark Fungus", { weight: 0.1, size: "Tiny" });
addItem("item:yew-leaf", "Yew Leaf", { weight: 0.1, size: "Tiny", source: "Ground spawn in Wakening Land" });
addItem("item:morning-dew", "Morning Dew", { weight: 0.1, size: "Small", source: "Foraged in Greater/Lesser Faydark" });
addItem("item:elven-blood", "Elven Blood", { weight: 0.1, size: "Tiny", source: "Dropped by elves" });
addItem("item:human-blood", "Human Blood", { weight: 0.1, size: "Tiny", source: "Dropped by humans" });
addItem("item:dwarven-blood", "Dwarven Blood", { weight: 0.1, size: "Tiny", source: "Dropped by dwarves" });
addItem("item:lava-rock", "Lava Rock", { weight: 0.1, size: "Tiny", source: "Dropped by fire elementals/giants" });
addItem("item:drop-of-mercury", "Drop of Mercury", { weight: 0.1, size: "Tiny", source: "Dropped by various elementals" });
addItem("item:essence-of-winter", "Essence of Winter", { weight: 0.1, size: "Tiny", source: "Dropped by ice giants/yeti" });
addItem("item:ice-goblin-blood", "Ice Goblin Blood", { weight: 0.1, size: "Tiny", source: "Dropped by ice goblins" });
addItem("item:rubbing-alcohol", "Rubbing Alcohol", { weight: 0.4, size: "Small" });
addItem("item:small-piece-of-velium", "Small Piece of Velium", { weight: 0.5, size: "Small" });
addItem("item:swirling-mist", "Swirling Mist", { weight: 0.1, size: "Tiny", source: "Dropped by steam/mist elementals" });
addItem("item:essence-of-moonlight", "Essence of Moonlight", { weight: 0.1, size: "Tiny", source: "Dropped by vampires/dread wolves" });
addItem("item:rain-water", "Rain Water", { weight: 0.1, size: "Small", source: "Dropped by escaped Splitpaw gnolls" });
addItem("item:griffenne-blood", "Griffenne Blood", { weight: 0.1, size: "Small" });
addItem("item:essence-of-sunlight", "Essence of Sunlight", { weight: 0.1, size: "Tiny", source: "Dropped by sand giants/chromadracs" });
addItem("item:sarnak-blood", "Sarnak Blood", { weight: 0.5, size: "Small", source: "Dropped by sarnaks" });
addItem("item:froglok-blood", "Froglok Blood", { weight: 0.1, size: "Tiny", source: "Dropped by frogloks" });
addItem("item:iksar-blood", "Iksar Blood", { weight: 0.1, size: "Tiny", source: "Dropped by iksar" });
addItem("item:mug-of-sea-foam", "Mug of Sea Foam", { weight: 0.1, size: "Small", source: "Dropped by seafury cyclops" });
addItem("item:saltwater-seaweed", "Saltwater Seaweed", { weight: 0.3, size: "Tiny", source: "Fished -- No Trade" });
addItem("item:neriak-nectar", "Neriak Nectar", { weight: 0.4, size: "Small" });
addItem("item:essence-of-shadow", "Essence of Shadow", { weight: 0.1, size: "Tiny", source: "Dropped by shadowed men" });
addItem("item:kiola-nut", "Kiola nut", { weight: 0.5, size: "Small" });
addItem("item:lizard-tail", "Lizard Tail", { weight: 2.0, size: "Medium" });
addItem("item:vinegar", "Vinegar", { weight: 0.1, size: "Small" });
addItem("item:brimstone", "Brimstone", { weight: 2.0, size: "Small" });
addItem("item:bundle-of-wormwood", "Bundle of Wormwood", { weight: 0.1, size: "Tiny" });
addItem("item:armadillo-meat", "Armadillo Meat", { weight: 1.0, size: "Small", source: "Dropped by armadillos" });
addItem("item:armadillo-husk", "Armadillo Husk", { weight: 0.4, size: "Tiny" });
addItem("item:steamfont-spring-water", "Steamfont Spring Water", { weight: 0.6, size: "Small" });
addItem("item:dragon-bay-snapper", "Dragon Bay Snapper", { weight: 1.0, size: "Small" });
addItem("item:cyclops-skull", "Cyclops skull", { weight: 10.0, size: "Giant", source: "Dropped by An undead cyclops; returned to inventory whether Skull Ale succeeds or fails" });
addItem("item:fishing-bait", "Fishing Bait", { weight: 0.1, size: "Tiny" });
addItem("item:skunk-scent-gland", "Skunk Scent Gland", { weight: 0.2, size: "Small", source: "Dropped by skunks" });
addItem("item:allspice", "Allspice", { weight: 0.1, size: "Small" });
addItem("item:cutlassfish-oil", "Cutlassfish Oil", { weight: 0.1, size: "Small" });
addItem("item:royal-kromrif-blood", "Royal Kromrif blood", { weight: 0.1, size: "Tiny" });
addItem("item:underfoot-mushroom", "Underfoot Mushroom", { weight: 0.1, size: "Tiny" });
addItem("item:arctic-mussels", "Arctic Mussels", { weight: 0.5, size: "Small" });
addItem("item:ice-wyvern-stinger", "Ice Wyvern Stinger", { weight: 0.1, size: "Tiny", source: "Dropped by ice wyverns" });
addItem("item:iceball", "Iceball", { weight: 0.5, size: "Tiny" });
addItem("item:mind-melt", "Mind Melt", { weight: 0.2, size: "Small" });
addItem("item:runed-sea-shell-cloud", "Runed Sea Shell (Cloud)", { weight: 0.2, size: "Small" });
addItem("item:seahorse-scales", "Seahorse Scales", { weight: 0.1, size: "Small" });
addItem("item:swamp-vegetables", "Swamp Vegetables", { weight: 0.6, size: "Small", source: "Foraged" });
addItem("item:innothule-mushroom", "Innothule Mushroom", { weight: 0.1, size: "Tiny", source: "Foraged in Innothule Swamp" });
addItem("item:large-leather-boots", "Large Leather Boots", { weight: 3.1, size: "Small" });
addItem("item:blackburrow-gnoll-skin", "Blackburrow Gnoll Skin", { weight: 4.5, size: "Large", source: "Dropped by Blackburrow gnolls" });
addItem("item:gnoll-pup-scalp", "Gnoll Pup Scalp", { weight: 0.3, size: "Small", source: "Dropped by Blackburrow gnoll pups" });
addItem("item:blackburrow-cask", "Blackburrow Cask", { weight: 2.0, size: "Large" });

// ---------------------------------------------------------------------
// New produced items. Water Flask/Mead/Elven Wine already exist (reused
// below, own recipe added, item node untouched here beyond a source note).
// ---------------------------------------------------------------------
addItem("item:flask-of-berry-juice", "Flask of Berry Juice", { source: "Brewed via Brewing (trivial 21)" });
addItem("item:flask-of-fruit-juice", "Flask of Fruit Juice", { source: "Brewed via Brewing (trivial 24)" });
addItem("item:flask-of-rathe-berry-juice", "Flask of Rathe Berry Juice", { source: "Brewed via Brewing (trivial 26)" });
addItem("item:flask-of-sylvan-berry-juice", "Flask of Sylvan Berry Juice", { source: "Brewed via Brewing (trivial 26)", stats: { agi: 1 } });
addItem("item:malted-milk", "Malted Milk", { source: "Brewed via Brewing (trivial 26) -- Whistle Wetter; also an ingredient in Egg Nog" });
addItem("item:flask-of-karana-brown-tea", "Flask of Karana Brown Tea", { source: "Brewed via Brewing (trivial 29)", resists: { poison: 1 } });
addItem("item:bottle-of-kalish", "Bottle of Kalish", { source: "Brewed via Brewing (trivial 31) -- Quest Item" });
addItem("item:othmir-algae-ale", "Othmir Algae Ale", { source: "Brewed via Brewing (trivial 31)" });
addItem("item:othmir-short-beer", "Othmir Short Beer", { source: "Brewed via Brewing (trivial 31)" });
addItem("item:root-beer-float", "Root Beer Float", { source: "Brewed via Brewing (trivial 31)" });
addItem("item:stormguard-root-beer", "Stormguard Root Beer", { source: "Brewed via Brewing (trivial 31); also an ingredient in Root Beer Float" });
addItem("item:flask-of-orange-juice", "Flask of Orange Juice", { source: "Brewed via Brewing (trivial 35)", resists: { disease: 1 } });
addItem("item:legion-lager", "Legion Lager", { source: "Brewed via Brewing (trivial 36)" });
addItem("item:caynar-nut-brown-ale", "Caynar Nut Brown Ale", { source: "Brewed via Brewing (trivial 41)" });
addItem("item:honey-mead", "Honey Mead", { source: "Brewed via Brewing (trivial 41)" });
addItem("item:brackish-othmir-ale", "Brackish Othmir Ale", { source: "Brewed via Brewing (trivial 51)" });
addItem("item:ogre-swill", "Ogre Swill", { source: "Brewed via Brewing (trivial 51); also an ingredient in Blood Temper and Armadillo Simmer Ale. Also sold at some booze merchants in Oggok and Freeport" });
addItem("item:egg-nog", "Egg Nog", { source: "Brewed via Brewing (trivial 55); also an ingredient in Egg Nog XXX" });
addItem("item:egg-nog-xxx", "Egg Nog XXX", { source: "Brewed via Brewing (trivial 56)" });
addItem("item:cod-oil", "Cod Oil", { source: "Brewed via Brewing (trivial 68) -- used in Velious Tailoring" });
addItem("item:drake-egg-oil", "Drake Egg Oil", { source: "Brewed via Brewing (trivial 68) -- used in Velious Tailoring" });
addItem("item:faydwer-porter", "Faydwer Porter", { source: "Brewed via Brewing (trivial 68)" });
addItem("item:fish-oil", "Fish Oil", { source: "Brewed via Brewing (trivial 68) -- not drinkable" });
addItem("item:gypsy-porter", "Gypsy Porter", { source: "Brewed via Brewing (trivial 68)" });
addItem("item:gypsy-wine", "Gypsy Wine", { source: "Brewed via Brewing (trivial 68); also an ingredient in Gypsy Porter" });
addItem("item:red-porter", "Red Porter", { source: "Brewed via Brewing (trivial 68)" });
addItem("item:ro-porter", "Ro Porter", { source: "Brewed via Brewing (trivial 68)" });
addItem("item:snake-egg-oil", "Snake Egg Oil", { source: "Brewed via Brewing (trivial 68) -- not drinkable" });
addItem("item:thubrs-darkened-ale", "Thubr's Darkened Ale", { source: "Brewed via Brewing (trivial 68)" });
addItem("item:yew-leaf-tannin", "Yew Leaf Tannin", { source: "Brewed via Brewing (trivial 68) -- used for Black Pantherskin Armor and Haze Panther Armor" });
addItem("item:white-wine", "White Wine", { source: "Brewed via Brewing (trivial 82); also an ingredient in Faydwer Porter" });
addItem("item:red-wine", "Red Wine", { source: "Brewed via Brewing (trivial 95); also an ingredient in Faydwer/Red/Ro Porter and Brandy" });
addItem("item:aviak-egg-oil", "Aviak Egg Oil", { source: "Brewed via Brewing (trivial 102) -- not drinkable" });
addItem("item:brandy", "Brandy", { source: "Brewed via Brewing (trivial 122); also an ingredient in Egg Nog XXX, Frost Temper, and Lothran's Ancient Absinthe" });
addItem("item:blood-temper", "Blood Temper", { source: "Brewed via Brewing (trivial 135) -- Ogre cultural Smithing" });
addItem("item:earthen-temper", "Earthen Temper", { source: "Brewed via Brewing (trivial 135) -- Dwarven cultural Smithing" });
addItem("item:frost-temper", "Frost Temper", { source: "Brewed via Brewing (trivial 135) -- Barbarian cultural Smithing" });
addItem("item:halas-heater", "Halas Heater", { source: "Brewed via Brewing (trivial 135)" });
addItem("item:halfling-stouters", "Halfling Stouters", { source: "Brewed via Brewing (trivial 135)" });
addItem("item:liquid-velium", "Liquid Velium", { source: "Brewed via Brewing (trivial 135) -- Quest Item; also an ingredient in Sacred Velium Ink" });
addItem("item:moonlight-temper", "Moonlight Temper", { source: "Brewed via Brewing (trivial 135) -- High Elf cultural Smithing" });
addItem("item:royal-temper", "Royal Temper", { source: "Brewed via Brewing (trivial 135) -- Human (Qeynos) cultural Smithing" });
addItem("item:scale-temper", "Scale Temper", { source: "Brewed via Brewing (trivial 135) -- Iksar cultural Smithing" });
addItem("item:sea-temper", "Sea Temper", { source: "Brewed via Brewing (trivial 135) -- Human (Freeport) cultural Smithing" });
addItem("item:shadow-temper", "Shadow Temper", { source: "Brewed via Brewing (trivial 135) -- Dark Elf cultural Smithing" });
addItem("item:tumpy-tonic", "Tumpy Tonic", { source: "Brewed via Brewing (trivial 135)" });
addItem("item:vodka", "Vodka", { source: "Brewed via Brewing (trivial 135); also an ingredient in Halas Heater, Halfling Stouters, Bleeding Brain, and Hulgarsh" });
addItem("item:2x-brewed-2x-stout-dwarven-ale", "2x Brewed 2x Stout Dwarven Ale", { source: "Brewed via Brewing (trivial 142)" });
addItem("item:tail-kicker-lager", "Tail Kicker Lager", { source: "Brewed via Brewing (trivial 142)" });
addItem("item:lothrans-ancient-absinthe", "Lothran's Ancient Absinthe", { source: "Brewed via Brewing (trivial 143)" });
addItem("item:armadillo-simmer-ale", "Armadillo Simmer Ale", { source: "Brewed via Brewing (trivial 148)" });
addItem("item:emerald-orange-schnapps", "Emerald Orange Schnapps", { source: "Brewed via Brewing (trivial 148)" });
addItem("item:faydwer-schnapps", "Faydwer Schnapps", { source: "Brewed via Brewing (trivial 148)" });
addItem("item:snapper-oil", "Snapper Oil", { source: "Brewed via Brewing (trivial 150) -- used in Baking" });
addItem("item:skull-ale", "Skull Ale", { source: "Brewed via Brewing (trivial 151); the fastest known leveling path from skill 2-151" });
addItem("item:hulgarsh", "Hulgarsh", { source: "Brewed via Brewing (trivial 155)" });
addItem("item:skunk-breath-ale", "Skunk Breath Ale", { source: "Brewed via Brewing (trivial 155)" });
addItem("item:coldain-heater", "Coldain Heater", { source: "Brewed via Brewing (trivial 158)" });
addItem("item:bleeding-brain", "Bleeding Brain", { source: "Brewed via Brewing (trivial 168)" });
addItem("item:sacred-velium-ink", "Sacred Velium Ink", { source: "Brewed via Brewing (trivial 168) -- Quest Item" });
addItem("item:underfoot-brown", "Underfoot Brown", { source: "Brewed via Brewing (trivial 168)" });
addItem("item:tainted-avalanche-ale", "Tainted Avalanche Ale", { source: "Brewed via Brewing (trivial 248) -- Quest Item" });
addItem("item:boot-beer", "Boot Beer", { source: "Brewed via Brewing (wiki lists trivial as an uncertain 158 < ? <= 168; modeled here at the range's own upper bound, 168)" });
addItem("item:blackburrow-swig", "Blackburrow Swig", { source: "Brewed via Brewing -- wiki-marked \"no fail\" (always succeeds); modeled here at trivial 0. Quest Item" });

if (hasNode("item:water-flask")) updateNode("item:water-flask", { source: "Note for Konem reward (Phin Esrinap, North Qeynos); also sold by merchants across many zones; also brewed via Brewing (trivial 21, from 4x Pod of Water)" });
if (hasNode("item:mead")) updateNode("item:mead", { source: "Brewed via Brewing (trivial 41); also sold at some booze merchants in Neriak and Freeport; also an ingredient in Faydwer Shaker" });
if (hasNode("item:elven-wine")) updateNode("item:elven-wine", { source: "Brewed via Brewing (trivial 115); also sold at some booze merchants; also an ingredient in Faydwer Shaker, Faydwer Porter, and Ro Porter" });

// ---------------------------------------------------------------------
// Recipes. Container column ingredients (Bottle/Cask/Shotglass/Armadillo
// Husk/Blackburrow Cask/Large Leather Boots) are `uses` edges like any
// other ingredient (decisions/tradeskill-recipe-node-schema.md) -- "none"
// means no container ingredient at all, not an omission.
// ---------------------------------------------------------------------
addRecipe("recipe:flask-of-berry-juice", "Flask of Berry Juice", 21,
  [{ id: "item:berries", quantity: 2 }, { id: "item:water-flask" }], "item:flask-of-berry-juice", 5);
addRecipe("recipe:water-flask", "Water Flask", 21,
  [{ id: "item:pod-of-water", quantity: 4 }, { id: "item:bottle" }], "item:water-flask");
addRecipe("recipe:flask-of-fruit-juice", "Flask of Fruit Juice", 24,
  [{ id: "item:fruit", quantity: 2 }, { id: "item:water-flask" }], "item:flask-of-fruit-juice", 5);
addRecipe("recipe:flask-of-rathe-berry-juice", "Flask of Rathe Berry Juice", 26,
  [{ id: "item:rathe-berries", quantity: 2 }, { id: "item:water-flask" }], "item:flask-of-rathe-berry-juice", 5);
addRecipe("recipe:flask-of-sylvan-berry-juice", "Flask of Sylvan Berry Juice", 26,
  [{ id: "item:sylvan-berries", quantity: 2 }, { id: "item:water-flask" }], "item:flask-of-sylvan-berry-juice", 5);
addRecipe("recipe:malted-milk", "Malted Milk", 26,
  [{ id: "item:malt" }, { id: "item:bottle-of-milk" }, { id: "item:bottle" }], "item:malted-milk");
addRecipe("recipe:flask-of-karana-brown-tea", "Flask of Karana Brown Tea", 29,
  [{ id: "item:tea-leaves", quantity: 2 }, { id: "item:water-flask" }], "item:flask-of-karana-brown-tea", 5);
addRecipe("recipe:bottle-of-kalish", "Bottle of Kalish", 31,
  [{ id: "item:fruit" }, { id: "item:vegetables" }, { id: "item:water-flask" }, { id: "item:bottle" }], "item:bottle-of-kalish");
addRecipe("recipe:othmir-algae-ale", "Othmir Algae Ale", 31,
  [{ id: "item:white-algae" }, { id: "item:azure-algae" }, { id: "item:ochre-algae" }, { id: "item:cask" }], "item:othmir-algae-ale");
addRecipe("recipe:othmir-short-beer", "Othmir Short Beer", 31,
  [{ id: "item:white-algae" }, { id: "item:azure-algae" }, { id: "item:ochre-algae" }, { id: "item:bottle" }], "item:othmir-short-beer");
addRecipe("recipe:root-beer-float", "Root Beer Float", 31,
  [{ id: "item:stormguard-root-beer" }, { id: "item:chunk-of-ice" }, { id: "item:frosting" }], "item:root-beer-float");
addRecipe("recipe:stormguard-root-beer", "Stormguard Root Beer", 31,
  [{ id: "item:roots", quantity: 2 }, { id: "item:spices" }, { id: "item:yeast" }, { id: "item:water-flask" }, { id: "item:bottle" }], "item:stormguard-root-beer");
addRecipe("recipe:flask-of-orange-juice", "Flask of Orange Juice", 35,
  [{ id: "item:emerald-orange", quantity: 2 }, { id: "item:water-flask" }], "item:flask-of-orange-juice", 5);
addRecipe("recipe:legion-lager", "Legion Lager", 36,
  [{ id: "item:deadbone-barley" }, { id: "item:flask-of-bloodwater" }, { id: "item:a-giant-blood-sac" }, { id: "item:bottle" }], "item:legion-lager");
addRecipe("recipe:caynar-nut-brown-ale", "Caynar Nut Brown Ale", 41,
  [{ id: "item:bag-of-caynar-nuts" }, { id: "item:barley" }, { id: "item:hops" }, { id: "item:malt" }, { id: "item:cask" }], "item:caynar-nut-brown-ale");
addRecipe("recipe:honey-mead", "Honey Mead", 41,
  [{ id: "item:hops" }, { id: "item:royal-jelly" }, { id: "item:water-flask" }, { id: "item:cask" }], "item:honey-mead");
addRecipe("recipe:mead", "Mead", 41,
  [{ id: "item:yeast" }, { id: "item:hops" }, { id: "item:malt" }, { id: "item:cask" }], "item:mead");
addRecipe("recipe:brackish-othmir-ale", "Brackish Othmir Ale", 51,
  [{ id: "item:brackish-water" }, { id: "item:azure-algae" }, { id: "item:ochre-algae" }, { id: "item:cask" }], "item:brackish-othmir-ale");
addRecipe("recipe:ogre-swill", "Ogre Swill", 51,
  [{ id: "item:malt" }, { id: "item:yeast" }, { id: "item:froglok-meat" }, { id: "item:cask" }], "item:ogre-swill");
addRecipe("recipe:egg-nog", "Egg Nog", 55,
  [{ id: "item:spices" }, { id: "item:malted-milk" }, { id: "item:aviak-eggs", quantity: 2 }, { id: "item:bottle" }], "item:egg-nog");
addRecipe("recipe:egg-nog-xxx", "Egg Nog XXX", 56,
  [{ id: "item:brandy" }, { id: "item:egg-nog" }, { id: "item:bottle" }], "item:egg-nog-xxx");
addRecipe("recipe:cod-oil", "Cod Oil", 68,
  [{ id: "item:cobalt-cod" }, { id: "item:water-flask" }], "item:cod-oil");
addRecipe("recipe:drake-egg-oil", "Drake Egg Oil", 68,
  [{ id: "item:drake-egg" }, { id: "item:water-flask" }], "item:drake-egg-oil");
addRecipe("recipe:faydwer-porter", "Faydwer Porter", 68,
  [{ id: "item:elven-wine", quantity: 2 }, { id: "item:red-wine" }, { id: "item:white-wine" }, { id: "item:cask" }], "item:faydwer-porter");
addRecipe("recipe:fish-oil", "Fish Oil", 68,
  [{ id: "item:fish-eggs" }, { id: "item:water-flask" }], "item:fish-oil");
addRecipe("recipe:gypsy-porter", "Gypsy Porter", 68,
  [{ id: "item:gypsy-wine", quantity: 4 }, { id: "item:cask" }], "item:gypsy-porter");
addRecipe("recipe:gypsy-wine", "Gypsy Wine", 68,
  [{ id: "item:grapes" }, { id: "item:wine-yeast" }, { id: "item:fire-beetle-eye" }, { id: "item:bottle" }], "item:gypsy-wine");
addRecipe("recipe:red-porter", "Red Porter", 68,
  [{ id: "item:red-wine", quantity: 4 }, { id: "item:cask" }], "item:red-porter");
addRecipe("recipe:ro-porter", "Ro Porter", 68,
  [{ id: "item:red-wine", quantity: 2 }, { id: "item:elven-wine", quantity: 2 }, { id: "item:cask" }], "item:ro-porter");
addRecipe("recipe:snake-egg-oil", "Snake Egg Oil", 68,
  [{ id: "item:snake-egg" }, { id: "item:water-flask" }], "item:snake-egg-oil");
addRecipe("recipe:thubrs-darkened-ale", "Thubr's Darkened Ale", 68,
  [{ id: "item:barley" }, { id: "item:malt" }, { id: "item:strange-dark-fungus" }, { id: "item:yeast" }, { id: "item:cask" }], "item:thubrs-darkened-ale");
addRecipe("recipe:yew-leaf-tannin", "Yew Leaf Tannin", 68,
  [{ id: "item:yew-leaf" }, { id: "item:water-flask" }], "item:yew-leaf-tannin");
addRecipe("recipe:white-wine", "White Wine", 82,
  [{ id: "item:grapes" }, { id: "item:wine-yeast" }, { id: "item:fruit" }, { id: "item:bottle" }], "item:white-wine");
addRecipe("recipe:red-wine", "Red Wine", 95,
  [{ id: "item:grapes" }, { id: "item:wine-yeast" }, { id: "item:berries" }, { id: "item:bottle" }], "item:red-wine");
addRecipe("recipe:aviak-egg-oil", "Aviak Egg Oil", 102,
  [{ id: "item:aviak-eggs" }, { id: "item:water-flask" }], "item:aviak-egg-oil");
addRecipe("recipe:elven-wine", "Elven Wine", 115,
  [{ id: "item:morning-dew" }, { id: "item:berries" }, { id: "item:wine-yeast" }, { id: "item:bottle" }], "item:elven-wine");
addRecipe("recipe:brandy", "Brandy", 122,
  [{ id: "item:red-wine", quantity: 2 }, { id: "item:spices" }, { id: "item:vegetables" }, { id: "item:shotglass" }], "item:brandy");
addRecipe("recipe:blood-temper", "Blood Temper", 135,
  [{ id: "item:ogre-swill" }, { id: "item:elven-blood" }, { id: "item:human-blood" }, { id: "item:dwarven-blood" }], "item:blood-temper");
addRecipe("recipe:earthen-temper", "Earthen Temper", 135,
  [{ id: "item:dwarven-ale" }, { id: "item:lava-rock" }, { id: "item:drop-of-mercury", quantity: 2 }], "item:earthen-temper");
addRecipe("recipe:frost-temper", "Frost Temper", 135,
  [{ id: "item:brandy" }, { id: "item:essence-of-winter", quantity: 2 }, { id: "item:ice-goblin-blood" }], "item:frost-temper");
addRecipe("recipe:halas-heater", "Halas Heater", 135,
  [{ id: "item:spider-legs" }, { id: "item:vodka" }, { id: "item:cask" }], "item:halas-heater");
addRecipe("recipe:halfling-stouters", "Halfling Stouters", 135,
  [{ id: "item:berries" }, { id: "item:spices" }, { id: "item:vodka" }, { id: "item:shotglass" }], "item:halfling-stouters");
addRecipe("recipe:liquid-velium", "Liquid Velium", 135,
  [{ id: "item:rubbing-alcohol" }, { id: "item:small-piece-of-velium" }], "item:liquid-velium");
addRecipe("recipe:moonlight-temper", "Moonlight Temper", 135,
  [{ id: "item:morning-dew" }, { id: "item:swirling-mist" }, { id: "item:essence-of-moonlight", quantity: 2 }], "item:moonlight-temper");
addRecipe("recipe:royal-temper", "Royal Temper", 135,
  [{ id: "item:rain-water" }, { id: "item:griffenne-blood" }, { id: "item:essence-of-sunlight", quantity: 2 }], "item:royal-temper");
addRecipe("recipe:scale-temper", "Scale Temper", 135,
  [{ id: "item:sarnak-blood" }, { id: "item:froglok-blood" }, { id: "item:iksar-blood" }, { id: "item:flask-of-bloodwater" }], "item:scale-temper");
addRecipe("recipe:sea-temper", "Sea Temper", 135,
  [{ id: "item:mug-of-sea-foam", quantity: 2 }, { id: "item:saltwater-seaweed" }, { id: "item:fish-wine" }], "item:sea-temper");
addRecipe("recipe:shadow-temper", "Shadow Temper", 135,
  [{ id: "item:elven-blood" }, { id: "item:neriak-nectar" }, { id: "item:essence-of-shadow", quantity: 2 }], "item:shadow-temper");
addRecipe("recipe:tumpy-tonic", "Tumpy Tonic", 135,
  [{ id: "item:kiola-nut" }, { id: "item:water-flask" }], "item:tumpy-tonic");
addRecipe("recipe:vodka", "Vodka", 135,
  [{ id: "item:short-beer", quantity: 2 }, { id: "item:water-flask" }, { id: "item:vegetables" }, { id: "item:bottle" }], "item:vodka");
addRecipe("recipe:2x-brewed-2x-stout-dwarven-ale", "2x Brewed 2x Stout Dwarven Ale", 142,
  [{ id: "item:dwarven-ale", quantity: 2 }, { id: "item:short-beer", quantity: 2 }, { id: "item:cask" }], "item:2x-brewed-2x-stout-dwarven-ale");
addRecipe("recipe:tail-kicker-lager", "Tail Kicker Lager", 142,
  [{ id: "item:lizard-tail", quantity: 2 }, { id: "item:malt" }, { id: "item:vinegar" }, { id: "item:water-flask" }, { id: "item:yeast" }], "item:tail-kicker-lager");
addRecipe("recipe:lothrans-ancient-absinthe", "Lothran's Ancient Absinthe", 143,
  [{ id: "item:brandy" }, { id: "item:brimstone" }, { id: "item:bundle-of-wormwood" }], "item:lothrans-ancient-absinthe");
addRecipe("recipe:armadillo-simmer-ale", "Armadillo Simmer Ale", 148,
  [{ id: "item:armadillo-meat" }, { id: "item:ogre-swill" }, { id: "item:vinegar" }, { id: "item:malt" }, { id: "item:yeast" }, { id: "item:armadillo-husk" }], "item:armadillo-simmer-ale");
addRecipe("recipe:emerald-orange-schnapps", "Emerald Orange Schnapps", 148,
  [{ id: "item:emerald-orange", quantity: 2 }, { id: "item:steamfont-spring-water" }, { id: "item:wine-yeast" }, { id: "item:bottle" }], "item:emerald-orange-schnapps");
addRecipe("recipe:faydwer-schnapps", "Faydwer Schnapps", 148,
  [{ id: "item:sylvan-berries", quantity: 2 }, { id: "item:steamfont-spring-water" }, { id: "item:wine-yeast" }, { id: "item:bottle" }], "item:faydwer-schnapps");
addRecipe("recipe:snapper-oil", "Snapper Oil", 150,
  [{ id: "item:dragon-bay-snapper" }, { id: "item:water-flask" }], "item:snapper-oil");
addRecipe("recipe:skull-ale", "Skull Ale", 151,
  [{ id: "item:cyclops-skull" }, { id: "item:short-beer" }, { id: "item:vinegar" }, { id: "item:spices" }], "item:skull-ale");
addRecipe("recipe:hulgarsh", "Hulgarsh", 155,
  [{ id: "item:vodka", quantity: 2 }, { id: "item:water-flask" }, { id: "item:fishing-bait" }, { id: "item:cask" }], "item:hulgarsh", 3);
addRecipe("recipe:skunk-breath-ale", "Skunk Breath Ale", 155,
  [{ id: "item:skunk-scent-gland", quantity: 2 }, { id: "item:short-beer" }, { id: "item:gnomish-spirits" }, { id: "item:malt" }, { id: "item:yeast" }, { id: "item:cask" }], "item:skunk-breath-ale");
addRecipe("recipe:coldain-heater", "Coldain Heater", 158,
  [{ id: "item:brown-algae" }, { id: "item:allspice" }, { id: "item:water-flask" }, { id: "item:shotglass" }], "item:coldain-heater");
addRecipe("recipe:bleeding-brain", "Bleeding Brain", 168,
  [{ id: "item:vodka" }, { id: "item:spices" }, { id: "item:fire-beetle-eye" }, { id: "item:shotglass" }], "item:bleeding-brain");
addRecipe("recipe:sacred-velium-ink", "Sacred Velium Ink", 168,
  [{ id: "item:liquid-velium" }, { id: "item:cutlassfish-oil" }, { id: "item:royal-kromrif-blood" }], "item:sacred-velium-ink");
addRecipe("recipe:underfoot-brown", "Underfoot Brown", 168,
  [{ id: "item:underfoot-mushroom", quantity: 4 }, { id: "item:malt" }, { id: "item:short-beer" }, { id: "item:water-flask" }, { id: "item:cask" }], "item:underfoot-brown");
addRecipe("recipe:tainted-avalanche-ale", "Tainted Avalanche Ale", 248,
  [{ id: "item:arctic-mussels" }, { id: "item:ice-wyvern-stinger" }, { id: "item:iceball" }, { id: "item:mind-melt" }, { id: "item:runed-sea-shell-cloud" }, { id: "item:seahorse-scales" }, { id: "item:bottle" }], "item:tainted-avalanche-ale");
addRecipe("recipe:boot-beer", "Boot Beer", 168,
  [{ id: "item:swamp-vegetables" }, { id: "item:innothule-mushroom" }, { id: "item:malt" }, { id: "item:water-flask" }, { id: "item:bottle-of-milk" }, { id: "item:large-leather-boots" }], "item:boot-beer");
addRecipe("recipe:blackburrow-swig", "Blackburrow Swig", 0,
  [{ id: "item:blackburrow-gnoll-skin", quantity: 4 }, { id: "item:gnoll-pup-scalp", quantity: 2 }, { id: "item:ol-tujims-fierce-brew", quantity: 2 }, { id: "item:blackburrow-cask" }], "item:blackburrow-swig");

// ---------------------------------------------------------------------
// Vendors. Every vendor eqlwiki.com's own soldby table lists, not a capped
// subset -- see this file's own header for why some are skipped (their
// zone doesn't exist in this graph yet). A vendor already added by
// migration 355 (matched by id) just gets additional `sells` edges here,
// not a duplicate node.
// ---------------------------------------------------------------------

// Zone names eqlwiki.com's own vendor tables use that differ from this
// graph's own zone labels for the same real place (decisions/
// zone-naming-mismatches.md) -- resolved before slugifying to a zone id.
// Bare "Felwithe" (the wiki's own soldby tables don't consistently say
// Northern/Southern) is resolved to Northern Felwithe, where several of
// the same named vendors are already unambiguously placed elsewhere on
// these same pages.
const ZONE_ALIASES: Record<string, string> = {
  "Eastern Plains of Karana": "Eastern Karana",
  "Western Plains of Karana": "Western Karana",
  "Neriak Third Gate": "Neriak 3rd Gate",
  "Kael Drakkel": "Kael Drakkal",
  "Felwithe": "Northern Felwithe",
};

function addVendor(vendorLabel: string, zoneLabel: string, sells: string[]) {
  const resolvedZone = ZONE_ALIASES[zoneLabel] ?? zoneLabel;
  const zoneId = `zone:${slug(resolvedZone)}`;
  if (!hasNode(zoneId)) {
    skippedVendors.push(`${vendorLabel} (${zoneLabel}) -- zone not catalogued in this graph`);
    return;
  }
  const vendorId = `npc:${slug(resolvedZone)}:${slug(vendorLabel)}`;
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

// Existing quest_giver/vendor npcs from migration 355 that also sell one of
// this batch's items -- given via their existing id so no duplicate lands.
function extendExistingVendor(vendorId: string, sells: string[]) {
  if (!hasNode(vendorId)) return;
  for (const itemId of sells) {
    addEdge(vendorId, itemId, "sells");
    sellsEdgesAdded++;
  }
}

addVendor("Blumblum Swigwater", "Cobalt Scar", ["item:white-algae", "item:azure-algae", "item:ochre-algae", "item:brown-algae"]);

const BAKERY_VENDORS: [string, string][] = [
  ["a clockwork baker", "Ak'Anon"],
  ["Urazun Thranon", "Butcherblock Mountains"],
  ["Klok Sweetzie", "East Cabilis"],
  ["Praps Gemshard", "Crystal Caverns"],
  ["Parthar", "East Commonlands"],
  ["Bup", "The Feerrott"],
  ["Pincia Brownloe", "West Freeport"],
  ["Sissia", "Halas"],
  ["Bim Buskin", "Misty Thicket"],
  ["Niz L`Crit", "Neriak Commons"],
  ["Tin Merchant XI", "The Overthere"],
  ["Chrislin Baker", "Western Plains of Karana"],
  ["Chef Kollof", "Skyshrine"],
  ["Finkel Rardobaen", "Steamfont Mountains"],
  ["Chef Stead", "Stonebrunt Mountains"],
  ["Perkins Doughbeard", "Thurgadin"],
  ["Quana Rainsparkle", "Toxxulia Forest"],
];
for (const [name, zone] of BAKERY_VENDORS) addVendor(name, zone, ["item:frosting", "item:spices", "item:vinegar"]);
// Only Spices/Vinegar (not Frosting) for these two, per eqlwiki's own tables.
addVendor("Cleet Miller Jr", "Western Plains of Karana", ["item:spices", "item:vinegar"]);

addVendor("a clockwork baker", "Ak'Anon", ["item:bottle-of-milk"]);
const BOTTLE_OF_MILK_VENDORS: [string, string][] = [
  ["a clockwork merchant", "Ak'Anon"],
  ["Urazun Thranon", "Butcherblock Mountains"],
  ["Gamin Griststone", "Butcherblock Mountains"],
  ["Parn Gylwyn", "Butcherblock Mountains"],
  ["Felen Razdal", "Butcherblock Mountains"],
  ["Klok Sweetzie", "East Cabilis"],
  ["Milliace Gemshard", "Crystal Caverns"],
  ["Praps Gemshard", "Crystal Caverns"],
  ["Bradly", "Eastern Plains of Karana"],
  ["Stace", "Eastern Plains of Karana"],
  ["Sorn", "Eastern Plains of Karana"],
  ["Tanrak", "Eastern Plains of Karana"],
  ["Parthar", "East Commonlands"],
  ["Teria Finleather", "Erudin"],
  ["Borge Finleather", "Erudin"],
  ["Bup", "The Feerrott"],
  ["Rolyn Longwalker", "Northern Felwithe"],
  ["Merchant Sorintal", "Northern Felwithe"],
  ["Ralfson Gerositan", "East Freeport"],
  ["Gibbon Morfield", "North Freeport"],
  ["Yellus Gravien", "North Freeport"],
  ["Tradesman Lyna", "North Freeport"],
  ["Tradesman Tulan", "North Freeport"],
  ["Bran Greenglade", "North Freeport"],
  ["Alec Greenglade", "North Freeport"],
  ["Pincia Brownloe", "West Freeport"],
  ["Merchant Aianya", "Greater Faydark"],
  ["Merchant Iludarae", "Greater Faydark"],
  ["Merchant Kwein", "Greater Faydark"],
  ["Ootok", "Grobb"],
  ["Sissia", "Halas"],
  ["Dok", "Halas"],
  ["Greta Terrilon", "Halas"],
  ["Leopok Terrilon", "Halas"],
  ["Maigin Greyeagle", "Highpass Hold"],
  ["Sernn Rossook", "Highpass Hold"],
  ["Doramafi Ratsbone", "North Kaladim"],
  ["Melixis", "Kerra Island"],
  ["Turga", "Lake Rathetear"],
  ["Bim Buskin", "Misty Thicket"],
  ["Smaka", "Neriak Foreign Quarter"],
  ["Vala Tanbor", "Neriak Foreign Quarter"],
  ["The Gobbler", "Neriak Foreign Quarter"],
  ["Dran `slug` Rembor", "Neriak Foreign Quarter"],
  ["Niz L`Crit", "Neriak Commons"],
  ["Angrog", "Oggok"],
  ["Sinsaal", "Oggok"],
  ["Endan Halson", "Ocean of Tears"],
  ["Tin Merchant XI", "The Overthere"],
  ["Chrislin Baker", "Western Plains of Karana"],
  ["Cleet Miller Jr", "Western Plains of Karana"],
  ["Tanlyn Galliway", "North Qeynos"],
  ["Sneed Galliway", "North Qeynos"],
  ["Ghil Starn", "North Qeynos"],
  ["Guzzla", "Rathe Mountains"],
  ["Wibble Bramblebush", "Rivervale"],
  ["Chef Kollof", "Skyshrine"],
  ["Finkel Rardobaen", "Steamfont Mountains"],
  ["Glen Garginburr", "Steamfont Mountains"],
  ["Chef Stead", "Stonebrunt Mountains"],
  ["Petcas Coldbeard", "Thurgadin"],
  ["Perkins Doughbeard", "Thurgadin"],
  ["Seloris Windweaver", "Timorous Deep"],
  ["Quana Rainsparkle", "Toxxulia Forest"],
];
for (const [name, zone] of BOTTLE_OF_MILK_VENDORS) addVendor(name, zone, ["item:bottle-of-milk"]);

const FLASK_OF_BLOODWATER_VENDORS: [string, string][] = [
  ["Klok Ephmir", "East Cabilis"],
  ["Klok Wyga", "East Cabilis"],
  ["Klok Naman", "Field of Bone"],
  ["Klok Vydl", "Lake of Ill Omen"],
  ["Klok Roshin", "Swamp of No Hope"],
  ["Klok Kogrin", "Warsliks Woods"],
];
for (const [name, zone] of FLASK_OF_BLOODWATER_VENDORS) addVendor(name, zone, ["item:flask-of-bloodwater"]);

addVendor("Pardor the Blessed", "East Commonlands", ["item:royal-jelly"]);
addVendor("Merchant Weaolanae", "Greater Faydark", ["item:royal-jelly"]);
addVendor("Merchant Kanoldar", "Greater Faydark", ["item:royal-jelly"]);

const WINE_YEAST_VENDORS: [string, string][] = [
  ["a clockwork brewmaster", "Ak'Anon"],
  ["Inudul Dumirgun", "Butcherblock Mountains"],
  ["Brewer Prixal", "East Cabilis"],
  ["Frothy", "Firiona Vie"],
  ["Gartonka", "Grobb"],
  ["Becka McGuzzlin", "Halas"],
  ["Lyn Tarburner", "Highpass Hold"],
  ["Hanamaf Darkfoam", "South Kaladim"],
  ["Wiska", "Neriak Foreign Quarter"],
  ["Ghrag", "Neriak Foreign Quarter"],
  ["Korgarg Swillchugger", "Oggok"],
  ["Cleet Miller", "Western Plains of Karana"],
  ["Burtle Barrelbelly", "Rivervale"],
  ["Tobart Dirkins", "Thurgadin"],
];
for (const [name, zone] of WINE_YEAST_VENDORS) addVendor(name, zone, ["item:wine-yeast"]);
extendExistingVendor("npc:west-freeport:krystin-charcoal", ["item:wine-yeast"]);
extendExistingVendor("npc:south-qeynos:heidi-grainsifter", ["item:wine-yeast"]);
skippedVendors.push("a clerk (Highpass Keep) -- zone not catalogued (distinct from the already-catalogued Highpass Hold)");
skippedVendors.push("a dealer (Highpass Keep) -- zone not catalogued (distinct from the already-catalogued Highpass Hold)");

addVendor("a mortician", "West Cabilis", ["item:rubbing-alcohol"]);
addVendor("Cleonae Kalen", "Ocean of Tears", ["item:kiola-nut", "item:fishing-bait"]);
addVendor("Belyea K`Jartan", "Neriak Third Gate", ["item:neriak-nectar"]);
addVendor("Cecile K`Jartan", "Neriak Third Gate", ["item:neriak-nectar"]);
addVendor("Ennixy Frennor", "Steamfont Mountains", ["item:brimstone", "item:bundle-of-wormwood"]);

const FISHING_BAIT_VENDORS: [string, string][] = [
  ["a clockwork merchant", "Ak'Anon"],
  ["Gamin Griststone", "Butcherblock Mountains"],
  ["Parn Gylwyn", "Butcherblock Mountains"],
  ["Felen Razdal", "Butcherblock Mountains"],
  ["Klok Foxmyr", "East Cabilis"],
  ["Klok Dytar", "East Cabilis"],
  ["Maula Fishcatcher", "West Commonlands"],
  ["Milliace Gemshard", "Crystal Caverns"],
  ["Bradly", "Eastern Plains of Karana"],
  ["Stace", "Eastern Plains of Karana"],
  ["Sorn", "Eastern Plains of Karana"],
  ["Tanrak", "Eastern Plains of Karana"],
  ["Germe Threadspinner", "East Commonlands"],
  ["Teria Finleather", "Erudin"],
  ["Borge Finleather", "Erudin"],
  ["Kogg", "The Feerrott"],
  ["Elytan Rantas", "Felwithe"],
  ["Tam Slyspan", "Felwithe"],
  ["Fishmonger Jassa", "Felwithe"],
  ["Rolyn Longwalker", "Felwithe"],
  ["Merchant Sorintal", "Felwithe"],
  ["Dorg McMerin", "Firiona Vie"],
  ["Leala Swiftarrow", "Firiona Vie"],
  ["Tanlok Harson", "East Freeport"],
  ["Iseba Gargurd", "East Freeport"],
  ["Tarker Gargurd", "East Freeport"],
  ["Lysric Loresinger", "North Freeport"],
  ["Gibbon Morfield", "North Freeport"],
  ["Yellus Gravien", "North Freeport"],
  ["Tradesman Lyna", "North Freeport"],
  ["Tradesman Tulan", "North Freeport"],
  ["Bran Greenglade", "North Freeport"],
  ["Alec Greenglade", "North Freeport"],
  ["Merchant Aianya", "Greater Faydark"],
  ["Merchant Iludarae", "Greater Faydark"],
  ["Merchant Kwein", "Greater Faydark"],
  ["Merchant Tuluvdar", "Greater Faydark"],
  ["Dok", "Halas"],
  ["Greta Terrilon", "Halas"],
  ["Leopok Terrilon", "Halas"],
  ["Quillion O'Zinn", "Halas"],
  ["Maigin Greyeagle", "Highpass Hold"],
  ["Sernn Rossook", "Highpass Hold"],
  ["Treasurer Lynn", "High Keep"],
  ["Bendad the Trader", "Kael Drakkel"],
  ["Doramafi Ratsbone", "North Kaladim"],
  ["Roary Fishpouncer", "Kerra Island"],
  ["Klok Gnask", "Lake of Ill Omen"],
  ["Turga", "Lake Rathetear"],
  ["Smaka", "Neriak Foreign Quarter"],
  ["Vala Tanbor", "Neriak Foreign Quarter"],
  ["The Gobbler", "Neriak Foreign Quarter"],
  ["Dran 'slug' Rembor", "Neriak Foreign Quarter"],
  ["Mariz Ixtaz", "Neriak Commons"],
  ["Sinsaal", "Oggok"],
  ["Craven Jonsbrow", "Ocean of Tears"],
  ["Sanian Shearsin", "Ocean of Tears"],
  ["Misla McMannus", "Western Plains of Karana"],
  ["Tubal Weaver", "North Qeynos"],
  ["Tanlyn Galliway", "North Qeynos"],
  ["Sneed Galliway", "North Qeynos"],
  ["Ghil Starn", "North Qeynos"],
  ["Grathin Nilm", "Surefall Glade"],
  ["Guzzla", "Rathe Mountains"],
  ["Wibble Bramblebush", "Rivervale"],
  ["dock merchant", "Rivervale"],
  ["Fiddy Bobick", "Rivervale"],
  ["Glen Garginburr", "Steamfont Mountains"],
  ["Klok Migo", "Swamp of No Hope"],
  ["Brigam", "Thurgadin"],
  ["Seloris Windweaver", "Timorous Deep"],
  ["Klok Gragin", "Warsliks Woods"],
  ["Klok Rogalin", "Warsliks Woods"],
];
for (const [name, zone] of FISHING_BAIT_VENDORS) addVendor(name, zone, ["item:fishing-bait"]);
extendExistingVendor("npc:field-of-bone:klok-acet", ["item:fishing-bait"]);
extendExistingVendor("npc:east-freeport:rolfic-gohar", ["item:fishing-bait"]);
extendExistingVendor("npc:south-qeynos:captain-rohand", ["item:fishing-bait"]);
extendExistingVendor("npc:east-freeport:cloud-alemaker", ["item:fishing-bait"]);
skippedVendors.push("Renna (Erud's Crossing) -- zone not catalogued in this graph");
skippedVendors.push("Ootok (Neriak Foreign Quarter, Fishing Bait) -- already added via Grobb; wiki lists a same-named npc in both zones, kept distinct per-zone above");

const ALLSPICE_VENDORS: [string, string][] = [
  ["Blergagg", "Grobb"],
  ["Klok Scaleroot", "West Cabilis"],
  ["Marlyn McMerin", "Firiona Vie"],
  ["Dargon", "Halas"],
  ["Garakbar", "Oggok"],
  ["Hulda", "Thurgadin"],
];
for (const [name, zone] of ALLSPICE_VENDORS) addVendor(name, zone, ["item:allspice"]);
addVendor("Melixis", "Kerra Island", ["item:allspice"]);

const LARGE_LEATHER_BOOTS_VENDORS: [string, string][] = [
  ["Iskopa", "Grobb"],
  ["Cindl", "Halas"],
  ["Farlain Stonethrower", "Neriak Foreign Quarter"],
  ["Uoola", "Oggok"],
  ["Wrin Liltin", "South Qeynos"],
];
for (const [name, zone] of LARGE_LEATHER_BOOTS_VENDORS) addVendor(name, zone, ["item:large-leather-boots"]);

skippedVendors.push("Merchant Kwein (Kelethin, Bottle of Milk) -- zone not catalogued in this graph");
skippedVendors.push("Chenori Berinal (Felwithe, Royal Jelly) -- wiki gives no Northern/Southern disambiguation and no other page ties this npc to a specific one, so left out rather than guessed");

save();
console.log(`Migration 358 complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s), ${vendorsAdded} new vendor npc(s), ${sellsEdgesAdded} sells edge(s) added for Brewing`);
if (skippedVendors.length) {
  console.log(`Skipped ${skippedVendors.length} vendor(s) (zone not catalogued or genuinely ambiguous):`);
  for (const s of skippedVendors) console.log(`  - ${s}`);
}
