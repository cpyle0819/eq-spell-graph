# Tradeskills: `recipe`/`container` node types, `uses`/`produces`/`crafted_in` edges

Issue #32 asked for tradeskill support (recipe lookup, ingredient lookup, per-trade leveling guides), starting with Brewing as the first modeled trade. No new "tradeskill" node — `tradeskill` is a plain string field on `recipe` (e.g. `"Brewing"`), the same "no node type for a fact that's just a string" call as `spell.class_levels`' `class` field or `quest.classes`. The Tradeskills page's own select box is populated from the distinct `tradeskill` values across `recipe` nodes, not a separate lookup table.

`recipe` node shape:

```ts
{
  id: "recipe:short-beer",
  label: "Short Beer",
  type: "recipe",
  tradeskill: "Brewing",
  trivial: 31,   // skill level at which this recipe stops reliably granting skill-ups
}
```

## Two different things eqlwiki calls a "container" — only one is a `container` node

The wiki's own Brewing recipe table has a "Container" column (Bottle/Cask/Shotglass/none) that reads as tradeskill-container terminology but is actually just another **consumed ingredient** — a recipe that fails still returns it, but a successful one uses it up the same as any other listed ingredient. This stays modeled exactly as any other ingredient: a `recipe --uses--> item` edge, no special casing.

The wiki also has a real, separate concept it groups under its own "Tradeskill Containers" category (Brew Barrel, Forge, Kiln, Pottery Wheel, Loom, Sewing Kit, Fletching Kit, Oven, Jeweler's Kit, Tackle Box, Medicine Bag, and several tomes/lexicons for Scribing) — the **stationary crafting station** a recipe is made *in*, never consumed, and normally the same one for every recipe in a given trade. eqlwiki's own Brew Barrel page: "A brew barrel is a stationary object with which players can interact in order to attempt a Brewing recipe. They are available in many locations around Norrath." And Skill Brewing's own basics section: "All combines are made in a brew barrel which can be found in most towns." *This* is what gets the new node type and edge:

- New node type: `container` (e.g. `container:brew-barrel`, label "Brew Barrel"). Not folded into `item` — a crafting station isn't held in inventory, isn't sold by vendors, and isn't itself consumed by anything, so none of `item`'s fields or the `sells`/`drops`/`located_in` conventions built around a carryable thing actually apply to it.
- New edge type: `recipe --crafted_in--> container`, one per recipe (real per-recipe granularity even though every currently-modeled Brewing recipe points at the same Brew Barrel node — other trades' own container pages suggest a recipe-to-container relationship isn't always 1:1 per trade, e.g. Baking's Oven vs. Mixing Bowl vs. Spit). Deliberately not `requires` — that edge type already means "quest prerequisite chain" (decisions/quest-prerequisite-requires-edge.md), a real ordered dependency between two same-type nodes, not "the vessel this is made in."

Ingredients and the crafted result are still edges, not fields — same "real entities get edges, not fields" reasoning as `quest --rewards--> item` (decisions/quest-reward-modeling.md):

- `recipe --uses--> item`: one edge per distinct ingredient, including the wiki's "Container" column vessel (Bottle/Cask/Shotglass — see above, this is not the same thing as a `container` node). `quantity` is an optional edge attribute (absent = 1), same "grows an attribute when real data needs it" precedent as `connects_to`'s `transport` and `rewards`' `randomGroup`.
- `recipe --produces--> item`: the crafted result. Also carries an optional `quantity` attribute for a >1 yield (absent = 1). This is an ordinary `item` node like any other real item — nothing stops it from also being a later recipe's ingredient (Short Beer and Gnomish Spirits are both mid-chain products and ingredients further up Brewing's own leveling path), the same way a quest reward item can also be a drop. **It renders with the same item-badge styling as any other item chip in the UI** (public/components/tradeskill-dossier.js) — an earlier pass gave it a distinct green "reward" color, which read as a second kind of entity when it's really just an item like the rest; the only thing that should visually distinguish it is the → it follows in the recipe formula, not its color.

**Vendors selling tradeskill supplies reuse the existing `npc --sells--> item` edge** (decisions/edge-semantics.md), not a new edge type — `sellCategoryLabel()` in `src/graph.ts` already fell back to a generic plural label for any non-spell sell target before this, anticipating exactly this case. No `recipe`-to-`npc` edge at all: "where can I buy what I need" is answered by walking `recipe --uses--> item` to the ingredient set, then `item <--sells-- npc` for who sells them, not a direct link. Containers (the crafting-station kind) get no vendor edges at all — they're found in the world, not purchased.

## Success-chance thresholds are computed, not stored

`trivial` is the only skill-level fact sourced from eqlwiki itself. A player's actual success odds below that are a general tradeskill-mechanics formula (not Brewing-specific, not eqlwiki-sourced — supplied directly by the project owner, carried over from classic EQ's own well-known formula), so it's computed from `trivial` at read time (`recipeSuccessThresholds()` in `src/graph.ts`) rather than hand-entered per recipe in a migration — the same "don't store what's derivable" call as not giving `container` its own redundant `tradeskill` field (it's already derivable by walking `crafted_in` back to any recipe that points at it):

```
25% success: max(0, ceil(0.75 × trivial − 26.5))
50% success: max(0, ceil(0.75 × trivial − 1.5))
75% success: max(0, ceil(0.75 × trivial + 23.5))
95% success: trivial itself (capped there, not a fifth linear formula)
```

**Sourcing bar, same as `item-node-schema.md`'s**: Brewing's recipe list and leveling-guide path came from eqlwiki.com's `Skill Brewing` page's raw wikitext (`action=query&prop=revisions`, not `WebFetch`'s summarizer — exact ingredient/trivial/container/yield data, no lossy paraphrase); the Brew Barrel container fact came the same way from its own page. Ingredient vendor/zone pairs came the same way, from each ingredient item's own page's `soldby` table. Only the wiki's own "Antonica Biased Brewers" 11-recipe path (triv 21 through 248) was modeled, not the full ~70-recipe table on that page — a representative leveling spine, not full recipe-book coverage; the rest of the table is there to pull from when the Tradeskills page's ingredient/recipe search grows past this first pass. Ingredients with no `soldby` table at all (Rat Ears, Vegetables — loot/forage only per the wiki) get no `sells` edge; that absence is itself the real fact, not a gap to fill in later.
