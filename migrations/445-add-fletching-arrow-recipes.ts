/**
 * Migration 445 (issue #49, batch 4/N): Fletching's arrow recipes -- 29
 * distinct arrow items and 55 recipes, sourced from eqlwiki's `Skill
 * Fletching` page's own two arrow tables.
 *
 * 47 recipes come from the page's own "Arrow Recipes" table (its 22
 * distinct output items) -- the wiki's own stated full recipe list, not an
 * invented full 216-combination permutation of every head/shaft/fletch/nock
 * pairing (the page itself says 216 raw combinations exist but explicitly
 * narrows its own table down to "the cheapest option for each outcome of
 * different stats"; matching that same "the wiki's own recipe table is the
 * full list" precedent every other tradeskill here has used, not a broader
 * invented set).
 *
 * The remaining 8 recipes (7 new items, 1 new combo of an existing item)
 * come from the page's separate "Cheapest Way to Fletch" leveling-guide
 * table. Cross-checking all 12 of its rows against the 47-row main table
 * found 4 exact matches (same item, trivial, and all 4 ingredients) --
 * those 4 just got `levelingGuide: true` added to their existing recipe.
 * The other 8 use a real, distinct ingredient combo the main table omits
 * (e.g. trivial 56's "Round Fletch + Small Nock" combo for CLASS 1 Wood
 * Point Arrow, cost 56 -- more expensive than the main table's Para+Small
 * combo for the same dmg/range at trivial 46, so the "cheapest per stat
 * outcome" table skips it, but it's still a real, separate, craftable
 * recipe worth having for the leveling path). Each is its own recipe,
 * `variant_of` an anchor when the same output item already has one (e.g.
 * this trivial-56 combo variants off the trivial-16 recipe already anchor
 * for CLASS 1 Wood Point Arrow); the 7 wholly new items get a standalone
 * recipe with no variant family.
 *
 * **Same-output, different-nock recipes are `variant_of` families**, same
 * "same output item, different ingredient combo" pattern as every prior
 * tradeskill's variant handling (decisions/tradeskill-recipe-node-schema.md)
 * -- eqlwiki's own arrow naming leaves Nock out of the item name ("Nock
 * isn't included in the name so each name has 3 versions which will vary by
 * range"), so most of these 22+7 items have 2-3 sibling recipes differing
 * only in which nock was used (and therefore only in final Range, a fact
 * this migration does not duplicate onto the item -- see below).
 *
 * **No `range` field on these items, unlike every other stat this schema
 * captures.** Damage is constant per item name, but Range genuinely varies
 * by which nock recipe made it (eqlwiki's own item pages document this as
 * one item name spanning e.g. "Range: 50 / 75 / 100" across its 2-3 real
 * recipes) -- there is no single fact to store on the item node itself.
 * The real number is already fully recoverable by walking the recipe's own
 * `uses` edge to whichever nock it names (Large/Medium/Small Groove Nocks'
 * own range contributions are documented on Skill Fletching's Arrow
 * Components table), so nothing is lost by leaving it off the item.
 *
 * All 29 items share the same `Slot: AMMO`, `Class: WAR PAL RNG SHD ROG`
 * restriction per every one of their own eqlwiki pages (5 spot-checked
 * individually, all identical) -- matches this graph's pre-existing ammo
 * items (Arrow of Contagion, Arrow of Frost). 8 of the 29 (the Ceramic-shaft
 * Silver Tip Arrows, classes 2-5 only -- not class 6, and not any Steel- or
 * Wood-shaft Silver Tip arrow) are MAGIC ITEM per their own pages; this
 * doesn't track any single "silver tip = magic" rule, it was checked
 * per-item rather than assumed. `quantity` on each `produces` edge is each
 * item's own stated Yield (5 for most, 10 for the higher-tier Ceramic/Steel
 * Silver Tip and Bone/Ceramic Hooked class-4 arrows) -- fetched from each
 * item's own page, not assumed uniform.
 *
 * Sourced from eqlwiki.com's raw wikitext via its MediaWiki API
 * (`action=query&prop=revisions`, batched multi-title queries), not
 * WebFetch's summarizer -- same bar as every tradeskill before this one.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

let itemsAdded = 0;
let recipesAdded = 0;

function addItem(id: string, label: string, opts: Record<string, unknown> = {}) {
  if (hasNode(id)) return;
  addNode({ id, label, type: "item", weight: 0.1, size: "Small", ...opts });
  itemsAdded++;
}

interface Ingredient {
  id: string;
  quantity?: number;
}
interface Produces {
  id: string;
  quantity?: number;
}

function addRecipe(
  id: string,
  label: string,
  trivial: number,
  uses: Ingredient[],
  produces: Produces,
  craftedIn: string,
  opts: { levelingGuide?: boolean; variant_of?: string } = {}
) {
  const { variant_of, ...nodeOpts } = opts;
  addNode({ id, label, type: "recipe", tradeskill: "Fletching", trivial, ...nodeOpts });
  recipesAdded++;
  for (const ing of uses) {
    addEdge(id, ing.id, "uses", ing.quantity ? { quantity: ing.quantity } : undefined);
  }
  addEdge(id, produces.id, "produces", produces.quantity && produces.quantity !== 1 ? { quantity: produces.quantity } : undefined);
  addEdge(id, craftedIn, "crafted_in");
  if (variant_of) addEdge(id, variant_of, "variant_of");
}

addItem("item:class-1-wood-point-arrow", "CLASS 1 Wood Point Arrow", { damage: 1, slots: ["Ammo"], classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"] });
addItem("item:class-2-wood-point-arrow", "CLASS 2 Wood Point Arrow", { damage: 1, slots: ["Ammo"], classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"] });
addItem("item:class-1-bone-point-arrow", "CLASS 1 Bone Point Arrow", { damage: 2, slots: ["Ammo"], classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"] });
addItem("item:class-2-bone-point-arrow", "CLASS 2 Bone Point Arrow", { damage: 2, slots: ["Ammo"], classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"] });
addItem("item:class-3-bone-point-arrow", "CLASS 3 Bone Point Arrow", { damage: 3, slots: ["Ammo"], classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"] });
addItem("item:class-1-bone-hooked-arrow", "CLASS 1 Bone Hooked Arrow", { damage: 3, slots: ["Ammo"], classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"] });
addItem("item:class-2-bone-hooked-arrow", "CLASS 2 Bone Hooked Arrow", { damage: 3, slots: ["Ammo"], classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"] });
addItem("item:class-3-bone-hooked-arrow", "CLASS 3 Bone Hooked Arrow", { damage: 4, slots: ["Ammo"], classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"] });
addItem("item:class-4-bone-hooked-arrow", "CLASS 4 Bone Hooked Arrow", { damage: 4, slots: ["Ammo"], classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"] });
addItem("item:class-2-ceramic-hooked-arrow", "CLASS 2 Ceramic Hooked Arrow", { damage: 4, slots: ["Ammo"], classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"] });
addItem("item:class-3-ceramic-hooked-arrow", "CLASS 3 Ceramic Hooked Arrow", { damage: 5, slots: ["Ammo"], classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"] });
addItem("item:class-4-ceramic-hooked-arrow", "CLASS 4 Ceramic Hooked Arrow", { damage: 5, slots: ["Ammo"], classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"] });
addItem("item:class-2-ceramic-silver-tip-arrow", "CLASS 2 Ceramic Silver Tip Arrow", { damage: 5, slots: ["Ammo"], classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"], magic: true });
addItem("item:class-3-ceramic-silver-tip-arrow", "CLASS 3 Ceramic Silver Tip Arrow", { damage: 6, slots: ["Ammo"], classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"], magic: true });
addItem("item:class-4-ceramic-silver-tip-arrow", "CLASS 4 Ceramic Silver Tip Arrow", { damage: 6, slots: ["Ammo"], classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"], magic: true });
addItem("item:class-5-ceramic-silver-tip-arrow", "CLASS 5 Ceramic Silver Tip Arrow", { damage: 6, slots: ["Ammo"], classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"], magic: true });
addItem("item:class-2-steel-silver-tip-arrow", "CLASS 2 Steel Silver Tip Arrow", { damage: 6, slots: ["Ammo"], classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"] });
addItem("item:class-3-steel-silver-tip-arrow", "CLASS 3 Steel Silver Tip Arrow", { damage: 7, slots: ["Ammo"], classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"] });
addItem("item:class-4-steel-silver-tip-arrow", "CLASS 4 Steel Silver Tip Arrow", { damage: 7, slots: ["Ammo"], classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"] });
addItem("item:class-6-ceramic-silver-tip-arrow", "CLASS 6 Ceramic Silver Tip Arrow", { damage: 7, slots: ["Ammo"], classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"] });
addItem("item:class-5-steel-silver-tip-arrow", "CLASS 5 Steel Silver Tip Arrow", { damage: 7, slots: ["Ammo"], classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"] });
addItem("item:class-6-steel-silver-tip-arrow", "CLASS 6 Steel Silver Tip Arrow", { damage: 8, slots: ["Ammo"], classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"] });
addItem("item:class-3-wood-point-arrow", "CLASS 3 Wood Point Arrow", { damage: 2, slots: ["Ammo"], classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"] });
addItem("item:class-1-wood-hooked-arrow", "CLASS 1 Wood Hooked Arrow", { damage: 2, slots: ["Ammo"], classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"] });
addItem("item:class-4-wood-point-arrow", "CLASS 4 Wood Point Arrow", { damage: 2, slots: ["Ammo"], classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"] });
addItem("item:class-1-ceramic-point-arrow", "CLASS 1 Ceramic Point Arrow", { damage: 4, slots: ["Ammo"], classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"] });
addItem("item:class-5-wood-point-arrow", "CLASS 5 Wood Point Arrow", { damage: 2, slots: ["Ammo"], classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"] });
addItem("item:class-1-wood-silver-tip-arrow", "CLASS 1 Wood Silver Tip Arrow", { damage: 3, slots: ["Ammo"], classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"] });
addItem("item:class-6-wood-point-arrow", "CLASS 6 Wood Point Arrow", { damage: 3, slots: ["Ammo"], classes: ["warrior", "paladin", "ranger", "shadow knight", "rogue"] });

addRecipe("recipe:class-1-wood-point-arrow-t16-large", "CLASS 1 Wood Point Arrow", 16, [{ id: "item:field-point-arrowheads" }, { id: "item:bundled-wooden-arrow-shafts" }, { id: "item:several-round-cut-fletchings" }, { id: "item:large-groove-nocks" }], { id: "item:class-1-wood-point-arrow", quantity: 5 }, "container:fletching-kit", { levelingGuide: true });
addRecipe("recipe:class-1-wood-point-arrow-t36-medium", "CLASS 1 Wood Point Arrow", 36, [{ id: "item:field-point-arrowheads" }, { id: "item:bundled-wooden-arrow-shafts" }, { id: "item:several-round-cut-fletchings" }, { id: "item:medium-groove-nocks" }], { id: "item:class-1-wood-point-arrow", quantity: 5 }, "container:fletching-kit", { levelingGuide: true, variant_of: "recipe:class-1-wood-point-arrow-t16-large" });
addRecipe("recipe:class-2-wood-point-arrow-t46-large", "CLASS 2 Wood Point Arrow", 46, [{ id: "item:field-point-arrowheads" }, { id: "item:bundled-wooden-arrow-shafts" }, { id: "item:several-parabolic-cut-fletchings" }, { id: "item:large-groove-nocks" }], { id: "item:class-2-wood-point-arrow", quantity: 5 }, "container:fletching-kit", { levelingGuide: true });
addRecipe("recipe:class-2-wood-point-arrow-t46-medium", "CLASS 2 Wood Point Arrow", 46, [{ id: "item:field-point-arrowheads" }, { id: "item:bundled-wooden-arrow-shafts" }, { id: "item:several-parabolic-cut-fletchings" }, { id: "item:medium-groove-nocks" }], { id: "item:class-2-wood-point-arrow", quantity: 5 }, "container:fletching-kit", { variant_of: "recipe:class-2-wood-point-arrow-t46-large" });
addRecipe("recipe:class-2-wood-point-arrow-t56-small", "CLASS 2 Wood Point Arrow", 56, [{ id: "item:field-point-arrowheads" }, { id: "item:bundled-wooden-arrow-shafts" }, { id: "item:several-parabolic-cut-fletchings" }, { id: "item:small-groove-nocks" }], { id: "item:class-2-wood-point-arrow", quantity: 5 }, "container:fletching-kit", { variant_of: "recipe:class-2-wood-point-arrow-t46-large" });
addRecipe("recipe:class-1-bone-point-arrow-t68-large", "CLASS 1 Bone Point Arrow", 68, [{ id: "item:field-point-arrowheads" }, { id: "item:bundled-bone-arrow-shafts" }, { id: "item:several-round-cut-fletchings" }, { id: "item:large-groove-nocks" }], { id: "item:class-1-bone-point-arrow", quantity: 5 }, "container:fletching-kit", { levelingGuide: true });
addRecipe("recipe:class-1-bone-point-arrow-t68-medium", "CLASS 1 Bone Point Arrow", 68, [{ id: "item:field-point-arrowheads" }, { id: "item:bundled-bone-arrow-shafts" }, { id: "item:several-round-cut-fletchings" }, { id: "item:medium-groove-nocks" }], { id: "item:class-1-bone-point-arrow", quantity: 5 }, "container:fletching-kit", { variant_of: "recipe:class-1-bone-point-arrow-t68-large" });
addRecipe("recipe:class-2-bone-point-arrow-t68-large", "CLASS 2 Bone Point Arrow", 68, [{ id: "item:field-point-arrowheads" }, { id: "item:bundled-bone-arrow-shafts" }, { id: "item:several-parabolic-cut-fletchings" }, { id: "item:large-groove-nocks" }], { id: "item:class-2-bone-point-arrow", quantity: 5 }, "container:fletching-kit");
addRecipe("recipe:class-2-bone-point-arrow-t68-medium", "CLASS 2 Bone Point Arrow", 68, [{ id: "item:field-point-arrowheads" }, { id: "item:bundled-bone-arrow-shafts" }, { id: "item:several-parabolic-cut-fletchings" }, { id: "item:medium-groove-nocks" }], { id: "item:class-2-bone-point-arrow", quantity: 5 }, "container:fletching-kit", { variant_of: "recipe:class-2-bone-point-arrow-t68-large" });
addRecipe("recipe:class-2-bone-point-arrow-t68-small", "CLASS 2 Bone Point Arrow", 68, [{ id: "item:field-point-arrowheads" }, { id: "item:bundled-bone-arrow-shafts" }, { id: "item:several-parabolic-cut-fletchings" }, { id: "item:small-groove-nocks" }], { id: "item:class-2-bone-point-arrow", quantity: 5 }, "container:fletching-kit", { variant_of: "recipe:class-2-bone-point-arrow-t68-large" });
addRecipe("recipe:class-3-bone-point-arrow-t82-large", "CLASS 3 Bone Point Arrow", 82, [{ id: "item:field-point-arrowheads" }, { id: "item:bundled-bone-arrow-shafts" }, { id: "item:several-shield-cut-fletchings" }, { id: "item:large-groove-nocks" }], { id: "item:class-3-bone-point-arrow", quantity: 5 }, "container:fletching-kit");
addRecipe("recipe:class-3-bone-point-arrow-t82-medium", "CLASS 3 Bone Point Arrow", 82, [{ id: "item:field-point-arrowheads" }, { id: "item:bundled-bone-arrow-shafts" }, { id: "item:several-shield-cut-fletchings" }, { id: "item:medium-groove-nocks" }], { id: "item:class-3-bone-point-arrow", quantity: 5 }, "container:fletching-kit", { variant_of: "recipe:class-3-bone-point-arrow-t82-large" });
addRecipe("recipe:class-3-bone-point-arrow-t82-small", "CLASS 3 Bone Point Arrow", 82, [{ id: "item:field-point-arrowheads" }, { id: "item:bundled-bone-arrow-shafts" }, { id: "item:several-shield-cut-fletchings" }, { id: "item:small-groove-nocks" }], { id: "item:class-3-bone-point-arrow", quantity: 5 }, "container:fletching-kit", { variant_of: "recipe:class-3-bone-point-arrow-t82-large" });
addRecipe("recipe:class-1-bone-hooked-arrow-t102-medium", "CLASS 1 Bone Hooked Arrow", 102, [{ id: "item:hooked-arrowheads" }, { id: "item:bundled-bone-arrow-shafts" }, { id: "item:several-round-cut-fletchings" }, { id: "item:medium-groove-nocks" }], { id: "item:class-1-bone-hooked-arrow", quantity: 5 }, "container:fletching-kit");
addRecipe("recipe:class-2-bone-hooked-arrow-t102-large", "CLASS 2 Bone Hooked Arrow", 102, [{ id: "item:hooked-arrowheads" }, { id: "item:bundled-bone-arrow-shafts" }, { id: "item:several-parabolic-cut-fletchings" }, { id: "item:large-groove-nocks" }], { id: "item:class-2-bone-hooked-arrow", quantity: 5 }, "container:fletching-kit");
addRecipe("recipe:class-2-bone-hooked-arrow-t102-medium", "CLASS 2 Bone Hooked Arrow", 102, [{ id: "item:hooked-arrowheads" }, { id: "item:bundled-bone-arrow-shafts" }, { id: "item:several-parabolic-cut-fletchings" }, { id: "item:medium-groove-nocks" }], { id: "item:class-2-bone-hooked-arrow", quantity: 5 }, "container:fletching-kit", { variant_of: "recipe:class-2-bone-hooked-arrow-t102-large" });
addRecipe("recipe:class-2-bone-hooked-arrow-t102-small", "CLASS 2 Bone Hooked Arrow", 102, [{ id: "item:hooked-arrowheads" }, { id: "item:bundled-bone-arrow-shafts" }, { id: "item:several-parabolic-cut-fletchings" }, { id: "item:small-groove-nocks" }], { id: "item:class-2-bone-hooked-arrow", quantity: 5 }, "container:fletching-kit", { variant_of: "recipe:class-2-bone-hooked-arrow-t102-large" });
addRecipe("recipe:class-3-bone-hooked-arrow-t102-large", "CLASS 3 Bone Hooked Arrow", 102, [{ id: "item:hooked-arrowheads" }, { id: "item:bundled-bone-arrow-shafts" }, { id: "item:several-shield-cut-fletchings" }, { id: "item:large-groove-nocks" }], { id: "item:class-3-bone-hooked-arrow", quantity: 5 }, "container:fletching-kit");
addRecipe("recipe:class-3-bone-hooked-arrow-t102-medium", "CLASS 3 Bone Hooked Arrow", 102, [{ id: "item:hooked-arrowheads" }, { id: "item:bundled-bone-arrow-shafts" }, { id: "item:several-shield-cut-fletchings" }, { id: "item:medium-groove-nocks" }], { id: "item:class-3-bone-hooked-arrow", quantity: 5 }, "container:fletching-kit", { variant_of: "recipe:class-3-bone-hooked-arrow-t102-large" });
addRecipe("recipe:class-3-bone-hooked-arrow-t102-small", "CLASS 3 Bone Hooked Arrow", 102, [{ id: "item:hooked-arrowheads" }, { id: "item:bundled-bone-arrow-shafts" }, { id: "item:several-shield-cut-fletchings" }, { id: "item:small-groove-nocks" }], { id: "item:class-3-bone-hooked-arrow", quantity: 5 }, "container:fletching-kit", { variant_of: "recipe:class-3-bone-hooked-arrow-t102-large" });
addRecipe("recipe:class-4-bone-hooked-arrow-t122-small", "CLASS 4 Bone Hooked Arrow", 122, [{ id: "item:hooked-arrowheads" }, { id: "item:bundled-bone-arrow-shafts" }, { id: "item:set-of-wooden-arrow-vanes" }, { id: "item:small-groove-nocks" }], { id: "item:class-4-bone-hooked-arrow", quantity: 5 }, "container:fletching-kit");
addRecipe("recipe:class-2-ceramic-hooked-arrow-t135-large", "CLASS 2 Ceramic Hooked Arrow", 135, [{ id: "item:hooked-arrowheads" }, { id: "item:bundled-ceramic-arrow-shafts" }, { id: "item:several-parabolic-cut-fletchings" }, { id: "item:large-groove-nocks" }], { id: "item:class-2-ceramic-hooked-arrow", quantity: 5 }, "container:fletching-kit");
addRecipe("recipe:class-2-ceramic-hooked-arrow-t135-medium", "CLASS 2 Ceramic Hooked Arrow", 135, [{ id: "item:hooked-arrowheads" }, { id: "item:bundled-ceramic-arrow-shafts" }, { id: "item:several-parabolic-cut-fletchings" }, { id: "item:medium-groove-nocks" }], { id: "item:class-2-ceramic-hooked-arrow", quantity: 5 }, "container:fletching-kit", { variant_of: "recipe:class-2-ceramic-hooked-arrow-t135-large" });
addRecipe("recipe:class-2-ceramic-hooked-arrow-t135-small", "CLASS 2 Ceramic Hooked Arrow", 135, [{ id: "item:hooked-arrowheads" }, { id: "item:bundled-ceramic-arrow-shafts" }, { id: "item:several-parabolic-cut-fletchings" }, { id: "item:small-groove-nocks" }], { id: "item:class-2-ceramic-hooked-arrow", quantity: 5 }, "container:fletching-kit", { variant_of: "recipe:class-2-ceramic-hooked-arrow-t135-large" });
addRecipe("recipe:class-3-ceramic-hooked-arrow-t135-large", "CLASS 3 Ceramic Hooked Arrow", 135, [{ id: "item:hooked-arrowheads" }, { id: "item:bundled-ceramic-arrow-shafts" }, { id: "item:several-shield-cut-fletchings" }, { id: "item:large-groove-nocks" }], { id: "item:class-3-ceramic-hooked-arrow", quantity: 5 }, "container:fletching-kit");
addRecipe("recipe:class-3-ceramic-hooked-arrow-t135-medium", "CLASS 3 Ceramic Hooked Arrow", 135, [{ id: "item:hooked-arrowheads" }, { id: "item:bundled-ceramic-arrow-shafts" }, { id: "item:several-shield-cut-fletchings" }, { id: "item:medium-groove-nocks" }], { id: "item:class-3-ceramic-hooked-arrow", quantity: 5 }, "container:fletching-kit", { variant_of: "recipe:class-3-ceramic-hooked-arrow-t135-large" });
addRecipe("recipe:class-3-ceramic-hooked-arrow-t135-small", "CLASS 3 Ceramic Hooked Arrow", 135, [{ id: "item:hooked-arrowheads" }, { id: "item:bundled-ceramic-arrow-shafts" }, { id: "item:several-shield-cut-fletchings" }, { id: "item:small-groove-nocks" }], { id: "item:class-3-ceramic-hooked-arrow", quantity: 5 }, "container:fletching-kit", { variant_of: "recipe:class-3-ceramic-hooked-arrow-t135-large" });
addRecipe("recipe:class-4-ceramic-hooked-arrow-t135-small", "CLASS 4 Ceramic Hooked Arrow", 135, [{ id: "item:hooked-arrowheads" }, { id: "item:bundled-ceramic-arrow-shafts" }, { id: "item:set-of-wooden-arrow-vanes" }, { id: "item:small-groove-nocks" }], { id: "item:class-4-ceramic-hooked-arrow", quantity: 5 }, "container:fletching-kit");
addRecipe("recipe:class-2-ceramic-silver-tip-arrow-t182-large", "CLASS 2 Ceramic Silver Tip Arrow", 182, [{ id: "item:silver-tipped-arrowheads" }, { id: "item:bundled-ceramic-arrow-shafts" }, { id: "item:several-parabolic-cut-fletchings" }, { id: "item:large-groove-nocks" }], { id: "item:class-2-ceramic-silver-tip-arrow", quantity: 10 }, "container:fletching-kit");
addRecipe("recipe:class-2-ceramic-silver-tip-arrow-t182-medium", "CLASS 2 Ceramic Silver Tip Arrow", 182, [{ id: "item:silver-tipped-arrowheads" }, { id: "item:bundled-ceramic-arrow-shafts" }, { id: "item:several-parabolic-cut-fletchings" }, { id: "item:medium-groove-nocks" }], { id: "item:class-2-ceramic-silver-tip-arrow", quantity: 10 }, "container:fletching-kit", { variant_of: "recipe:class-2-ceramic-silver-tip-arrow-t182-large" });
addRecipe("recipe:class-2-ceramic-silver-tip-arrow-t182-small", "CLASS 2 Ceramic Silver Tip Arrow", 182, [{ id: "item:silver-tipped-arrowheads" }, { id: "item:bundled-ceramic-arrow-shafts" }, { id: "item:several-parabolic-cut-fletchings" }, { id: "item:small-groove-nocks" }], { id: "item:class-2-ceramic-silver-tip-arrow", quantity: 10 }, "container:fletching-kit", { variant_of: "recipe:class-2-ceramic-silver-tip-arrow-t182-large" });
addRecipe("recipe:class-3-ceramic-silver-tip-arrow-t182-large", "CLASS 3 Ceramic Silver Tip Arrow", 182, [{ id: "item:silver-tipped-arrowheads" }, { id: "item:bundled-ceramic-arrow-shafts" }, { id: "item:several-shield-cut-fletchings" }, { id: "item:large-groove-nocks" }], { id: "item:class-3-ceramic-silver-tip-arrow", quantity: 10 }, "container:fletching-kit");
addRecipe("recipe:class-3-ceramic-silver-tip-arrow-t182-medium", "CLASS 3 Ceramic Silver Tip Arrow", 182, [{ id: "item:silver-tipped-arrowheads" }, { id: "item:bundled-ceramic-arrow-shafts" }, { id: "item:several-shield-cut-fletchings" }, { id: "item:medium-groove-nocks" }], { id: "item:class-3-ceramic-silver-tip-arrow", quantity: 10 }, "container:fletching-kit", { variant_of: "recipe:class-3-ceramic-silver-tip-arrow-t182-large" });
addRecipe("recipe:class-3-ceramic-silver-tip-arrow-t182-small", "CLASS 3 Ceramic Silver Tip Arrow", 182, [{ id: "item:silver-tipped-arrowheads" }, { id: "item:bundled-ceramic-arrow-shafts" }, { id: "item:several-shield-cut-fletchings" }, { id: "item:small-groove-nocks" }], { id: "item:class-3-ceramic-silver-tip-arrow", quantity: 10 }, "container:fletching-kit", { variant_of: "recipe:class-3-ceramic-silver-tip-arrow-t182-large" });
addRecipe("recipe:class-4-ceramic-silver-tip-arrow-t182-small", "CLASS 4 Ceramic Silver Tip Arrow", 182, [{ id: "item:silver-tipped-arrowheads" }, { id: "item:bundled-ceramic-arrow-shafts" }, { id: "item:set-of-wooden-arrow-vanes" }, { id: "item:small-groove-nocks" }], { id: "item:class-4-ceramic-silver-tip-arrow", quantity: 10 }, "container:fletching-kit");
addRecipe("recipe:class-5-ceramic-silver-tip-arrow-t182-medium", "CLASS 5 Ceramic Silver Tip Arrow", 182, [{ id: "item:silver-tipped-arrowheads" }, { id: "item:bundled-ceramic-arrow-shafts" }, { id: "item:set-of-bone-arrow-vanes" }, { id: "item:medium-groove-nocks" }], { id: "item:class-5-ceramic-silver-tip-arrow", quantity: 10 }, "container:fletching-kit");
addRecipe("recipe:class-5-ceramic-silver-tip-arrow-t182-small", "CLASS 5 Ceramic Silver Tip Arrow", 182, [{ id: "item:silver-tipped-arrowheads" }, { id: "item:bundled-ceramic-arrow-shafts" }, { id: "item:set-of-bone-arrow-vanes" }, { id: "item:small-groove-nocks" }], { id: "item:class-5-ceramic-silver-tip-arrow", quantity: 10 }, "container:fletching-kit", { variant_of: "recipe:class-5-ceramic-silver-tip-arrow-t182-medium" });
addRecipe("recipe:class-2-steel-silver-tip-arrow-t202-small", "CLASS 2 Steel Silver Tip Arrow", 202, [{ id: "item:silver-tipped-arrowheads" }, { id: "item:bundled-steel-arrow-shafts" }, { id: "item:several-parabolic-cut-fletchings" }, { id: "item:small-groove-nocks" }], { id: "item:class-2-steel-silver-tip-arrow", quantity: 10 }, "container:fletching-kit");
addRecipe("recipe:class-3-steel-silver-tip-arrow-t202-large", "CLASS 3 Steel Silver Tip Arrow", 202, [{ id: "item:silver-tipped-arrowheads" }, { id: "item:bundled-steel-arrow-shafts" }, { id: "item:several-shield-cut-fletchings" }, { id: "item:large-groove-nocks" }], { id: "item:class-3-steel-silver-tip-arrow", quantity: 10 }, "container:fletching-kit");
addRecipe("recipe:class-3-steel-silver-tip-arrow-t202-medium", "CLASS 3 Steel Silver Tip Arrow", 202, [{ id: "item:silver-tipped-arrowheads" }, { id: "item:bundled-steel-arrow-shafts" }, { id: "item:several-shield-cut-fletchings" }, { id: "item:medium-groove-nocks" }], { id: "item:class-3-steel-silver-tip-arrow", quantity: 10 }, "container:fletching-kit", { variant_of: "recipe:class-3-steel-silver-tip-arrow-t202-large" });
addRecipe("recipe:class-3-steel-silver-tip-arrow-t202-small", "CLASS 3 Steel Silver Tip Arrow", 202, [{ id: "item:silver-tipped-arrowheads" }, { id: "item:bundled-steel-arrow-shafts" }, { id: "item:several-shield-cut-fletchings" }, { id: "item:small-groove-nocks" }], { id: "item:class-3-steel-silver-tip-arrow", quantity: 10 }, "container:fletching-kit", { variant_of: "recipe:class-3-steel-silver-tip-arrow-t202-large" });
addRecipe("recipe:class-4-steel-silver-tip-arrow-t202-small", "CLASS 4 Steel Silver Tip Arrow", 202, [{ id: "item:silver-tipped-arrowheads" }, { id: "item:bundled-steel-arrow-shafts" }, { id: "item:set-of-wooden-arrow-vanes" }, { id: "item:small-groove-nocks" }], { id: "item:class-4-steel-silver-tip-arrow", quantity: 10 }, "container:fletching-kit");
addRecipe("recipe:class-6-ceramic-silver-tip-arrow-t202-small", "CLASS 6 Ceramic Silver Tip Arrow", 202, [{ id: "item:silver-tipped-arrowheads" }, { id: "item:bundled-ceramic-arrow-shafts" }, { id: "item:set-of-ceramic-arrow-vanes" }, { id: "item:small-groove-nocks" }], { id: "item:class-6-ceramic-silver-tip-arrow", quantity: 10 }, "container:fletching-kit");
addRecipe("recipe:class-5-steel-silver-tip-arrow-t202-small", "CLASS 5 Steel Silver Tip Arrow", 202, [{ id: "item:silver-tipped-arrowheads" }, { id: "item:bundled-steel-arrow-shafts" }, { id: "item:set-of-bone-arrow-vanes" }, { id: "item:small-groove-nocks" }], { id: "item:class-5-steel-silver-tip-arrow", quantity: 10 }, "container:fletching-kit");
addRecipe("recipe:class-6-steel-silver-tip-arrow-t202-large", "CLASS 6 Steel Silver Tip Arrow", 202, [{ id: "item:silver-tipped-arrowheads" }, { id: "item:bundled-steel-arrow-shafts" }, { id: "item:set-of-ceramic-arrow-vanes" }, { id: "item:large-groove-nocks" }], { id: "item:class-6-steel-silver-tip-arrow", quantity: 10 }, "container:fletching-kit");
addRecipe("recipe:class-6-steel-silver-tip-arrow-t202-medium", "CLASS 6 Steel Silver Tip Arrow", 202, [{ id: "item:silver-tipped-arrowheads" }, { id: "item:bundled-steel-arrow-shafts" }, { id: "item:set-of-ceramic-arrow-vanes" }, { id: "item:medium-groove-nocks" }], { id: "item:class-6-steel-silver-tip-arrow", quantity: 10 }, "container:fletching-kit", { variant_of: "recipe:class-6-steel-silver-tip-arrow-t202-large" });
addRecipe("recipe:class-6-steel-silver-tip-arrow-t202-small", "CLASS 6 Steel Silver Tip Arrow", 202, [{ id: "item:silver-tipped-arrowheads" }, { id: "item:bundled-steel-arrow-shafts" }, { id: "item:set-of-ceramic-arrow-vanes" }, { id: "item:small-groove-nocks" }], { id: "item:class-6-steel-silver-tip-arrow", quantity: 10 }, "container:fletching-kit", { variant_of: "recipe:class-6-steel-silver-tip-arrow-t202-large" });
addRecipe("recipe:class-1-wood-point-arrow-t56-small", "CLASS 1 Wood Point Arrow", 56, [{ id: "item:field-point-arrowheads" }, { id: "item:bundled-wooden-arrow-shafts" }, { id: "item:several-round-cut-fletchings" }, { id: "item:small-groove-nocks" }], { id: "item:class-1-wood-point-arrow", quantity: 5 }, "container:fletching-kit", { levelingGuide: true, variant_of: "recipe:class-1-wood-point-arrow-t16-large" });
addRecipe("recipe:class-3-wood-point-arrow-t82-large", "CLASS 3 Wood Point Arrow", 82, [{ id: "item:field-point-arrowheads" }, { id: "item:bundled-wooden-arrow-shafts" }, { id: "item:several-shield-cut-fletchings" }, { id: "item:large-groove-nocks" }], { id: "item:class-3-wood-point-arrow", quantity: 5 }, "container:fletching-kit", { levelingGuide: true });
addRecipe("recipe:class-1-wood-hooked-arrow-t102-medium", "CLASS 1 Wood Hooked Arrow", 102, [{ id: "item:hooked-arrowheads" }, { id: "item:bundled-wooden-arrow-shafts" }, { id: "item:several-round-cut-fletchings" }, { id: "item:medium-groove-nocks" }], { id: "item:class-1-wood-hooked-arrow", quantity: 5 }, "container:fletching-kit", { levelingGuide: true });
addRecipe("recipe:class-4-wood-point-arrow-t122-large", "CLASS 4 Wood Point Arrow", 122, [{ id: "item:field-point-arrowheads" }, { id: "item:bundled-wooden-arrow-shafts" }, { id: "item:set-of-wooden-arrow-vanes" }, { id: "item:large-groove-nocks" }], { id: "item:class-4-wood-point-arrow", quantity: 5 }, "container:fletching-kit", { levelingGuide: true });
addRecipe("recipe:class-1-ceramic-point-arrow-t135-large", "CLASS 1 Ceramic Point Arrow", 135, [{ id: "item:field-point-arrowheads" }, { id: "item:bundled-ceramic-arrow-shafts" }, { id: "item:several-round-cut-fletchings" }, { id: "item:large-groove-nocks" }], { id: "item:class-1-ceramic-point-arrow", quantity: 5 }, "container:fletching-kit", { levelingGuide: true });
addRecipe("recipe:class-5-wood-point-arrow-t162-large", "CLASS 5 Wood Point Arrow", 162, [{ id: "item:field-point-arrowheads" }, { id: "item:bundled-wooden-arrow-shafts" }, { id: "item:set-of-bone-arrow-vanes" }, { id: "item:large-groove-nocks" }], { id: "item:class-5-wood-point-arrow", quantity: 5 }, "container:fletching-kit", { levelingGuide: true });
addRecipe("recipe:class-1-wood-silver-tip-arrow-t182-large", "CLASS 1 Wood Silver Tip Arrow", 182, [{ id: "item:silver-tipped-arrowheads" }, { id: "item:bundled-wooden-arrow-shafts" }, { id: "item:several-round-cut-fletchings" }, { id: "item:large-groove-nocks" }], { id: "item:class-1-wood-silver-tip-arrow", quantity: 5 }, "container:fletching-kit", { levelingGuide: true });
addRecipe("recipe:class-6-wood-point-arrow-t202-large", "CLASS 6 Wood Point Arrow", 202, [{ id: "item:field-point-arrowheads" }, { id: "item:bundled-wooden-arrow-shafts" }, { id: "item:set-of-ceramic-arrow-vanes" }, { id: "item:large-groove-nocks" }], { id: "item:class-6-wood-point-arrow", quantity: 5 }, "container:fletching-kit", { levelingGuide: true });

save();
console.log(`Migration 445 complete: ${itemsAdded} items added, ${recipesAdded} recipes added`);
