# Vendors' Type filter: a stored `category` on sold items, not a computed classification

Spell Vendors became Vendors (issue: type filter) — a Type select (Spells plus whatever item categories are actually sold right now) that narrows results to one flavor of vendor-sold good, with the surrounding Location/Level/Faction/Travel filters shared across every type. See decisions/spell-finder-sidebar-four-sections.md for the resulting sidebar reorder.

## Category is a stored field, scoped only to sold goods — and that's a deliberate exception to `recipe-item-type-subtype-filter.md`

That earlier decision established Weapon/Armor/Other classification should be *computed* from real item stat fields (`skill`/`ac`/`slots`), never stored, because it's genuinely derivable — a weapon has `skill`+`damage`, a shield has `ac`+`slots:["Secondary"]`+no `skill`, etc.

Vendors' categories (Armor, Adventuring Supplies, Tradeskill Supplies — migration 400) don't have that property for two of the three buckets. Nothing in `ItemDetails` distinguishes a Water Flask (Adventuring Supplies) from a bag of Barley (Tradeskill Supplies) — both carry only `weight`/`size`. The split is about the item's role in the game's economy (a general-purpose adventuring consumable vs. a trade-specific raw material/tool), not a fact recoverable from its stat block. Where a real computable signal *does* exist (Armor: `ac` + `slots` + no `skill`, the same shield-detection `classifyItem()` already uses), migration 400 still hand-assigned it rather than importing `classifyItem()`, because the two features classify different things for different purposes — `classifyItem()`'s "Other" bucket includes plenty of goods (food, drink, quest items) this feature needed split further, and `category` only ever needs to exist on nodes that actually have a `sells` edge.

Scope is intentionally narrow: only the ~127 item/container nodes with a real `sells` edge got a `category` (migration 400) — not all ~2,515 item nodes. This answers "what can a vendor's Type filter offer," not "what kind of item is this in general"; drop-only/quest-only items have no bearing on that question. A category with nothing currently sold in it (e.g. "Weapons" — nothing sellable has `skill`/`damage` yet) simply never appears as a Type option, computed live from `/api/vendor-categories` rather than a fixed list — "let types drive the filters."

A vendor's "Spells" category comes from either a direct `sells` edge to a spell node, or a `sells_spells_for` edge to a class (a confirmed class vendor, see [class-spell-vendor-model.md](class-spell-vendor-model.md)) with no per-spell `sells` edges at all.

## Backend: `rankZonesByCategory()` alongside `rankZones()`, sharing everything but candidate gathering

`buildZoneRankingBase()` (`src/graph.ts`) extracts the route/faction/era/scoring machinery `rankZones()` (spells) already had — `rankZonesByCategory()` (any other type) calls the same function, differing only in how it gathers candidates:

- **Class filtering** reuses the item's own existing `classes` field with the established "empty/absent = everyone" convention (decisions/no-classes-selected-means-all-classes.md, decisions/item-node-schema.md) — a Water Flask with no `classes` set matches any Shopping For class selection, same as a quest with no `classes` set. No new data needed for this half of parity.
- **No level filter for items.** Spells have `class_levels` (a level *per class*); items have nothing equivalent (`minLevel`, where present at all, is a single global floor, and none of the 127 sold items currently set it). Rather than show a Level control that can never filter anything for a non-Spells type, the frontend hides the whole Level section whenever Type isn't Spells.

`ZoneRanking.spells`/`.items` are mutually exclusive optional fields — exactly one is populated per ranking, never both, since a single plan request ranks by one type at a time. Two distinct typed arrays (not one generic "goods" shape) so each side keeps its own real fields (spell class/level pairs vs. item stat block) instead of a lowest-common-denominator type.

## Frontend: item results reuse `<item-chip>`, no owned-tracking

Item results render through the same `<item-chip>` component used everywhere else in the app (quest rewards, recipe ingredients) — full hover stat tooltip, no new rendering invented. Unlike spells, items have no "owned" concept in this app: `zone-card` renders them as plain vendor-grouped chips with no checkbox, and `status-panel`'s mana-bar/toggle-owned/clear-owned block simply doesn't render when `ownedCount` is omitted from its `.data`.
