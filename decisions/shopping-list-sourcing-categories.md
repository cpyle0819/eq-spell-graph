# Shopping list rows group by sourcing category, not one flat list

`shopping-list-panel.js`'s rows now render under one of four subheaders —
Sold By Vendors, Crafted, Foraged / Fished / Dropped, Unknown Source — since
"how do I actually get this" is a different question per bucket, and a flat
list buries that distinction (surfaced by the same Baking investigation as
`city-alignment-good-evil.md`'s denominator fix: a shopping list built from
an ingredient-heavy tradeskill can be more crafted/foraged items than
vendor-buyable ones).

Categorization (`categorizeShoppingItem()`, `public/trades.js`) is computed
client-side from data the page already has loaded for the current tradeskill
— `rawVendors` (does any vendor sell this id) and `rawItemSources` (`/api/
item-sources`'s `foraged`/`fished`/`dropped`/`craftedIn`/`other`) — not a
stored fact on the shopping-list entry itself. Priority order when an item
qualifies for more than one bucket (Baking's own Bat Wing is both
vendor-sold and mob-dropped): vendor beats crafted beats gathered, since
that's the simplest real option a player would actually take. An item left
over from a previously-selected tradeskill (whose vendor/source data isn't
loaded anymore, since both fetches are scoped to the current tradeskill's
own ingredient set) falls into "Unknown Source" rather than a guess — same
"absence isn't a gap, don't fabricate" convention the rest of this app's
sourcing data follows.
