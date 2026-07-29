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

- New node type: `container` (e.g. `container:brew-barrel`, label "Brew Barrel"). Brewing's own Brew Barrel is a pure world-fixture — not held in inventory, not sold by vendors, not consumed by anything — so migration 356 gave it none of `item`'s fields and no `sells`/`drops`/`located_in` edges.
- New edge type: `recipe --crafted_in--> container`, one per recipe (real per-recipe granularity even though every currently-modeled Brewing recipe points at the same Brew Barrel node — other trades' own container pages suggest a recipe-to-container relationship isn't always 1:1 per trade, e.g. Baking's Oven vs. Mixing Bowl vs. Spit). Deliberately not `requires` — that edge type already means "quest prerequisite chain" (decisions/quest-prerequisite-requires-edge.md), a real ordered dependency between two same-type nodes, not "the vessel this is made in."

**Update (Baking, issue #47): not every wiki "Tradeskill Container" is a Brew-Barrel-style world fixture.** Baking's own Oven matches Brew Barrel exactly (eqlwiki: "a stationary object with which the player may interact... available in major cities," no `soldby` table, no weight/capacity stat block). But Mixing Bowl and Spit — both filed under the same eqlwiki "Tradeskill Containers" category — are genuinely portable, vendor-purchased inventory items with a real weight/Capacity/Size-Capacity stat block, same shape as any other carryable item. They're still `container`-type nodes (they're what recipes' `crafted_in` edges point at, same functional role as Oven), but the earlier "none of item's fields, no sells edges" blanket claim only holds for the world-fixture kind. A `container` node gets `weight`/`source` (and `capacity`/`containerSize` per `item-node-schema.md`'s existing tradeskill-container fields) and `sells` edges whenever its own eqlwiki page actually shows them — Oven still gets none of that, Mixing Bowl and Spit do.

Ingredients and the crafted result are still edges, not fields — same "real entities get edges, not fields" reasoning as `quest --rewards--> item` (decisions/quest-reward-modeling.md):

- `recipe --uses--> item`: one edge per distinct ingredient, including the wiki's "Container" column vessel (Bottle/Cask/Shotglass — see above, this is not the same thing as a `container` node). `quantity` is an optional edge attribute (absent = 1), same "grows an attribute when real data needs it" precedent as `connects_to`'s `transport` and `rewards`' `randomGroup`.
- `recipe --produces--> item`: the crafted result. Also carries an optional `quantity` attribute for a >1 yield (absent = 1). This is an ordinary `item` node like any other real item — nothing stops it from also being a later recipe's ingredient (Short Beer and Gnomish Spirits are both mid-chain products and ingredients further up Brewing's own leveling path), the same way a quest reward item can also be a drop. **It renders through the same `<item-chip>` component as any other item in the UI** (public/components/item-chip.js, decisions/item-hover-uses-generic-detail-tooltip.md) — an earlier pass gave it a distinct green "reward" color, which read as a second kind of entity when it's really just an item like the rest; the only thing that should visually distinguish it is the → it follows in the recipe formula, not its color.

**Vendors selling tradeskill supplies reuse the existing `npc --sells--> item` edge** (decisions/edge-semantics.md), not a new edge type — `sellCategoryLabel()` in `src/graph.ts` already fell back to a generic plural label for any non-spell sell target before this, anticipating exactly this case. No `recipe`-to-`npc` edge at all: "where can I buy what I need" is answered by walking `recipe --uses--> item` to the ingredient set, then `item <--sells-- npc` for who sells them, not a direct link. Containers (the crafting-station kind) get no vendor edges at all — they're found in the world, not purchased.

## Success-chance thresholds are computed, not stored

`trivial` is the only skill-level fact sourced from eqlwiki itself. A player's actual success odds below that are a general tradeskill-mechanics formula (not Brewing-specific, not eqlwiki-sourced — supplied directly by the project owner, carried over from classic EQ's own well-known formula), so it's computed from `trivial` at read time (`recipeSuccessThresholds()` in `src/graph.ts`) rather than hand-entered per recipe in a migration — the same "don't store what's derivable" call as not giving `container` its own redundant `tradeskill` field (it's already derivable by walking `crafted_in` back to any recipe that points at it):

```
25% success: max(0, ceil(0.75 × trivial − 26.5))
50% success: max(0, ceil(0.75 × trivial − 1.5))
75% success: max(0, ceil(0.75 × trivial + 23.5))
95% success: trivial itself (capped there, not a fifth linear formula)
```

**Sourcing bar, same as `item-node-schema.md`'s**: Brewing's recipes came from eqlwiki.com's `Skill Brewing` page's raw wikitext (`action=query&prop=revisions`, not `WebFetch`'s summarizer — exact ingredient/trivial/container/yield data, no lossy paraphrase, fetched in batched multi-title queries for the ingredient items' own weight/size/vendor data too); the Brew Barrel container fact came the same way from its own page. Migration 355 modeled only the wiki's own "Antonica Biased Brewers" 11-recipe leveling path (triv 21 through 248) as a first pass; migration 358 later added the full remaining ~67 recipes from that same page's "Recipe List" table (78 total), so Recipes/Ingredients browsing covers the whole trade, not just the leveling spine. `recipe.levelingGuide` (migration 359) flags exactly those original 11 — the Leveling Guide UI filters on this field rather than "every recipe of the tradeskill," so it stays that same hand-picked path regardless of how much broader recipe-book coverage grows around it. Ingredients with no `soldby` table at all (Rat Ears, Vegetables, Berries, Fruit, and others — loot/forage only per the wiki) get no `sells` edge; that absence is itself the real fact, not a gap to fill in later. A vendor is only added when its own zone already exists as a `zone` node in this graph — a handful of wiki-listed zones (Kelethin, Erud's Crossing, Highpass Keep) aren't catalogued here yet and are skipped rather than guessed at; two zone names eqlwiki's vendor tables use for the same real place as this graph's own zone nodes (Eastern/Western "Plains of Karana" vs Eastern/Western Karana, "Neriak Third Gate" vs Neriak 3rd Gate) are resolved via a small alias map in migration 358, not treated as new zones.

## Recipe variants: same output item, different ingredient combos

Baking (issue #47) surfaced something Brewing never had: multiple distinct ingredient combos that produce the *same* output item — a classic-era combo and a Velious-era combo of the same food (e.g. Beer Braised Mammoth: Short Beer in one, Othmir Algae Ale + Algae Spices in the other), or the wiki's own explicit "**OR**" alternate ingredient lists (Frost Giant Steak, Storm Giant Steaks, Yakman Steak). Each combo is a real, independently craftable recipe — collapsing them into one node would silently drop whichever combo didn't get picked.

Each combo stays its own `recipe` node (same shape as any other recipe, including its own `produces` edge to the shared output item). A new edge links them as a family:

```
recipe --variant_of--> recipe
```

One recipe per family is the **anchor** (whichever combo a migration happens to add first — the choice has no semantic weight, it's just bookkeeping so the edge has somewhere to point); every sibling combo gets a `variant_of` edge pointing at it. This is a distinct edge from `produces` (which already, incidentally, links same-output recipes too) because relying on "shared `produces` target" alone would mean the read layer has to scan every recipe in a tradeskill and group by target on every request — an explicit edge makes a variant family a single edge-walk instead.

**Which variant is "primary" is computed at read time, not stored.** `getRecipes()` (`src/graph.ts`) groups each family (anchor + its `variant_of` siblings), scores every member by how many of its `uses` ingredients have at least one `sells` edge from any vendor, and surfaces the highest-scoring combo as the card's main formula — same "don't store what's derivable" reasoning as `trivial`'s success-threshold math above. This can flip which combo shows as primary if vendor data changes later (e.g. a new vendor batch makes the Velious combo's ingredients sourceable where before only the classic combo's were) without needing a migration to re-flag anything. The rest of the family ships on `RecipeSummary` as `variants: RecipeSummary[]` and renders in `recipe-card.js` as an expandable list (same `<details>`/`<summary>` pattern `quest-group-card.js` uses for its own member roster), not a second badge-cluttered card.

The ~10 near-duplicate "Fillets" combos on Baking's own page (Fish/Carp/Chub/Pike/Salmon/Trout fillet, differing only by which fished raw fish replaces Fresh Fish) are modeled the same way: each is its own recipe+item pair (a Carp Fillet is a different real item from a Fish Fillet), not a variant family of each other — "variant" means *same output item*, not "same category of food."
