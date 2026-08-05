# Tradeskill compatibility: scored by combined cross-trade ingredient/tool dependency

The Leveling Guide already recommends a best good/evil/neutral city to shop a
trade's own ingredients in ([[city-alignment-good-evil]]). Alongside that,
`getTradeskillCompatibility()` (`src/graph.ts`) recommends the single other
tradeskill that pairs best with this one — the answer to "if I'm leveling
Baking, is Blacksmithing or Brewing more useful to also pick up?"

## What counts as a dependency

`tradeskillDependencyCounts()` walks one tradeskill's own leveling path
(`recipe.levelingGuide === true`, the same fixed set the city recommendation
uses, not the whole recipe book) and tallies, per *other* tradeskill, how
many distinct ingredients/tools it needs that trade to craft:

- **Ingredients** (`uses` edges) that are themselves craftable, resolved to
  whichever recipe actually produces them via `pickPrimaryProducer()` — the
  same vendor-sourceable/trivial tiebreak `getRecipeTree()` already uses to
  pick a producer when more than one recipe makes the same item.
- **Crafting-station tools** (`crafted_in` edges) — normally a world fixture
  with no producer at all, but [[tradeskill-recipe-node-schema]]'s "produces
  can target a container" section means some are genuinely player-crafted:
  Baking's own Pot/Smoker/Mixing Bowl are `produces` targets of Blacksmithing
  and Pottery recipes. A tradeskill whose leveling recipes lean on one of
  these needs that *other* trade just to get the tool in hand, which is as
  real a dependency as an ingredient, and none of it would show up if only
  `uses` were scored.

Both walks recurse through the resolved producer's own `uses` ingredients
(depth-capped at `RECIPE_TREE_DEPTH_BUDGET`, same backstop
`getRecipeTree()` uses), so a multi-hop dependency — this trade needs an
ingredient that's itself crafted from an ingredient a third trade produces —
still counts toward whichever trade actually produces the leaf, not just the
one hop directly visible on the root recipe. A dependency whose producer
turns out to belong to the *same* tradeskill doesn't count. Each id is
counted at most once per tradeskill (a `visited` set shared across every
leveling recipe, not reset per-recipe), matching
`getTradeskillLevelingCities()`'s own "distinct ingredients" scoring rather
than double-counting a container fifteen recipes all happen to share.

## Scored by both directions combined, not one trade's own count alone

**First version (superseded): picked whichever other trade this tradeskill's
own guide depended on most.** This surfaced a real bug from actual data:
Baking's own guide leans on Pottery hard (7 distinct dependencies, mostly
the Pot/Mixing Bowl containers) so Pottery was correctly Baking's top pick —
but Pottery's own leveling guide barely depends on anything (its only
directional dependency is a single Brewing ingredient), so scoring Pottery's
side in isolation picked *Brewing* instead of reciprocating Baking. The two
halves of what should be one relationship disagreed with each other, which
reads as broken to anyone comparing both trades' badges side by side.

**Current version: `getTradeskillCompatibility()` sums both directions for
each candidate pair.** For tradeskill A considering candidate B, the score is
`tradeskillDependencyCounts(A)[B] + tradeskillDependencyCounts(B)[A]` — A's
own dependency on B, plus B's own dependency back on A. Baking↔Pottery's
combined score (7 + 0 = 7) dominates any pairing either trade has in
isolation, so both sides now land on the same partner; Blacksmithing↔Tinkering
(0 + 4 = 4) is the graph's other mutual pair for the same reason. This
doesn't *guarantee* mutuality in general — Brewing's own top pick is
Tinkering (combined 2), but Tinkering's own top pick is Blacksmithing
(combined 4, higher than its 2 with Brewing) — that's the correct, expected
shape when a trade has a stronger pairing elsewhere, not a bug: "my best
match's best match isn't necessarily me" is just what asymmetric relationship
strengths look like once you're picking a single best answer per side, the
same way it does for people. It only fully disagrees with itself (like the
first version did) when one side's dependency dominates the combined score
enough to flip its partner's own pick, which is exactly the case this
version fixes. Highest combined score wins; a tie resolves to `null` (the UI
renders no badge) rather than guessing, same convention
`getTradeskillLevelingCities()`'s `pickBest()` already uses for a tied or
uncovered alignment.

The returned shape keeps both halves visible (`fromThisGuide`/
`fromPartnerGuide`) rather than collapsing straight to the combined number —
`leveling-guide-card.js`'s badge shows the combined count but its tooltip
spells out the (often one-sided, e.g. Baking 7 / Pottery 0) breakdown, so a
0 on one side reads as a real fact about the relationship rather than a
rounding artifact.

`leveling-guide-card.js` renders this the same way as a city badge — a
small supplementary badge under the header, linking to
`trades.html?tradeskill=` (the same deep-link param `applyQueryParams()` in
`public/trades.js` already restores from `ingredient-card.js`'s own
cross-trade "Crafted In" links).
