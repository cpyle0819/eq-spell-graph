# Browse's Item Type/Subtype filter: computed from real item fields, not a stored classification

Blacksmithing's Browse/Recipes view needed a way to narrow by what a recipe
actually produces — Armor vs. Weapon vs. Other, then a second level (armor
slot, or weapon skill). `item-node-schema.md`'s stat block already carries
everything needed (`slots`, `skill`, `ac`) — no new node field, no
`recipe.itemType`. `classifyItem()` (`public/trades.js`) derives `{ type,
subtype? }` at render time from those fields, same "don't store what's
derivable" call as `recipeSuccessThresholds()`/variant-family primary
(`tradeskill-recipe-node-schema.md`). This means the filter works for any
tradeskill's recipes, not just Blacksmithing's — a tradeskill whose recipes
mostly produce food/drink just reads as "Other" for everyone, which is
correct, not a gap.

Classification order matters: `skill` present wins first (Weapon), since a
weapon also carries `slots` (`Primary`/`Secondary` wield slots) that would
otherwise look armor-like. A **Shield** is the one real ambiguity: it only
ever carries `slots: ["Secondary"]` — identical to an offhand weapon's own
slot — but has `ac` and no `skill`. `classifyItem()` treats
`slots` = exactly `["Secondary"]` + `ac` present + no `skill` as Armor/Shield;
everything else exactly matching Primary/Secondary/Range/Ammo with neither
`ac` nor `skill` (a torch, a lantern) falls through to Other, correctly.

The Subtype `<select>`'s own options are populated from whichever values
actually occur in the current tradeskill's fetched recipes
(`distinctSubtypes()`), same "populate from real data" convention as
`populateTradeskillSelect()` — not a fixed enum, so a slot/skill this graph
hasn't modeled yet doesn't show a dead option.

## Backfill: migration 386

Every prior Blacksmithing migration (#48, #65) sourced item data from
eqlwiki's own recipe/component tables, which never carry the item's own
Slot/Skill line — that only lives on the item's own individual eqlwiki page.
313 of Blacksmithing's 323 produced items had neither `slots` nor `skill`
set as a result. Migration 386 backfilled them by batch-fetching all 313
items' own pages via the raw wikitext API (40 titles/request, same
technique as Brewing's ingredient data) and parsing each page's
`{{Itempage}}` statsblock directly — not inferred from item-name patterns
(a "Boots" being Feet is a near-certainty, but this graph's own sourcing bar
is "verify against eqlwiki," not "would probably guess right"). All 313
pages existed; 37 (raw ore/sheet-metal/tool/container intermediates — File,
Skewers, Pot, Smoker, etc.) genuinely have neither field on their own page
and were left untouched — that absence is itself the real fact, same
convention as an ingredient with no `sells` edge.

One sourced oddity kept verbatim rather than smoothed over: eqlwiki's own
infobox reads `Skill: Throwingv2` (not "Throwing") for every throwing
weapon in this batch, consistently — kept as-is rather than assumed to be a
wiki typo and silently cleaned up.
