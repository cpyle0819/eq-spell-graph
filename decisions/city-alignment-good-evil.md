# City alignment (good/evil/neutral): derived from this graph's own faction data

The Tradeskills Leveling Guide recommends a good city, an evil city, and a
neutral city to shop a trade's leveling-guide ingredients in
(`getTradeskillLevelingCities()`, `src/graph.ts`), scored by how many
distinct leveling-guide ingredients each city's vendors cover. That needed a
good/evil/neutral classification for cities.

**First version (migration 401, superseded): hand-guessed from classic EQ.**
Tagged 23 of the 27 `city` zones with a stored `zone.alignment` field, using
classic EQ's well-known starting-city convention (Freeport = evil, alongside
Neriak/Grobb/Oggok/Cabilis/Paineel). This turned out wrong: Freeport's own
`zone.faction.deity` table (already sourced independently, same data
`rankZones()`'s faction resolution reads) treats good- and evil-deity
worshippers exactly like Qeynos/Kaladim/Felwithe/etc. do — safe vs.
wont_sell — the same pattern as every other *good* city, not evil. Classic
EQ trivia isn't a reliable stand-in for this graph's own EQL-specific facts
(CLAUDE.md: verify against eqlwiki.com, not classic-EQ sources), and in this
case the graph already had a better answer sitting in data it had already
sourced for something else.

**Current version: `deriveCityAlignment()` (`src/graph.ts`), computed, not
stored.** For each zone, compares the worst standing its own `faction.deity`
table gives good-aligned deities (Mithaniel Marr, Tunare, Erollisi Marr,
Rodcet Nife, Quellious, Karana, The Tribunal, Brell Serilis) against the
worst it gives evil-aligned ones (Innoruuk, Cazic-Thule, Bertoxxulous, Rallos
Zek, Solusek Ro) — matching `app.js`'s own Deity select; Agnostic/Prexus/
Bristlebane/Veeshan sit in neither bucket, same as this graph's faction data
never singling them out. Whichever side gets treated worse there (wont_sell/
kos vs. safe) tells you which alignment the *other* side belongs to: evil
worshippers treated worse → good city, and vice versa. **Not restricted to
`zoneType === "city"`** — Kelethin (the Wood Elf good city) has no zone node
of its own in this graph at all; its vendors are `located_in` "Greater
Faydark" (zoneType `open_world`), so a city-only filter would silently drop
a real, correctly-scored good city. The real-vendor + real-deity-table
requirements already keep genuinely irrelevant zones (most dungeons/
wilderness, which carry neither) out.

Every zone that doesn't clearly favor one side is `"neutral"`, not excluded
— two different reasons land there, treated the same:
- **No signal either way**: no `faction.deity` table at all, or one that
  doesn't discriminate by deity (Cabilis's own faction data is neutral
  across every deity — Iksar culture isn't deity-driven the way the
  good/evil split is elsewhere).
- **Explicitly documented as mixed**: `KNOWN_MIXED_CITY_GROUPS` currently
  holds just Freeport, sourced from eqlwiki.com's own Freeport page —
  *"Freeport is a city of many layers, both good and bad... The good races
  travel its streets... and the dark races travel through the sewers to
  reach most of the same destinations."* That overrides whatever Freeport's
  own in-graph deity table alone would compute (which reads as strongly
  good — see above), since that table is flagged approximate
  (`faction-data-is-approximate.md`) and an explicit eqlwiki statement about
  the city itself beats an inference from adjacent data.

Migration 403 removed the now-dead stored `alignment` field the first
version wrote — same "don't store what's derivable" call as
`recipeSuccessThresholds()`.

## Recommendation heuristic

For a given tradeskill, `getTradeskillLevelingCities()` collects the distinct
ingredient set across only that tradeskill's `levelingGuide` recipes (the
same fixed reference path `leveling-guide-card.js` renders, not the full
recipe book), then for every alignment-derived city sums how many of those
distinct ingredients at least one vendor there sells. The highest-scoring
good city, evil city, and neutral city are surfaced independently — a tie or
an alignment with no covering vendor at all resolves to `null` (the UI just
omits that badge) rather than guessing. Neutral renders as a real third
badge in `leveling-guide-card.js`, not folded into or hidden behind
good/evil — Freeport routinely covers more of a tradeskill's ingredients
than either single-alignment city (its three sub-zones combined beat every
alternative for Brewing/Baking/Blacksmithing alike), so treating it as a
lesser option would bury the actually best answer.

**The denominator only counts vendor-purchasable ingredients.** Baking's own
leveling guide surfaced why: 8 of its 13 distinct ingredients (Clump of
Dough, Pie Tin, Cake Round, White Chocolate, Winter Chocolate, Dragon Meat,
Cinnamon Sticks, Pixie Dust) are crafted-via-another-recipe, foraged, or
mob-dropped only — each one's own `source`/`located_in` data already says so,
sourced the same as everything else in `tradeskill-recipe-node-schema.md` —
and no vendor sells any of them anywhere in the graph. Counting those against
every city's score made even a city with perfect vendor coverage of the
*actually purchasable* set (Freeport covers all 5 of Baking's vendor-sold
ingredients) read as if it were falling short ("5/13" looks like a gap;
"5 of 5" is what it actually is). `totalIngredients` is scoped to ingredients
with at least one `sells` edge anywhere before the per-city count ever runs,
so a perfect score always reads as N of N. `leveling-guide-card.js`'s own
caption spells out "vendor-sourceable" explicitly and its badge text reads
"N of M ingredients," not a bare "(N/M)", so the count doesn't read as a
magic number.

## Scored by real-world city, not by playable sub-zone

The first version of this scored each `zone` node independently, and Brewing
immediately surfaced why that's wrong: Freeport is modeled as three separate
playable zones (West/East/North Freeport), and eqlwiki's own named vendor
NPCs for Brewing ingredients are genuinely spread across specific ones —
South Qeynos alone covers 13/21 leveling-guide ingredients, but no single
Freeport zone tops 10/21, even though Freeport as a whole covers 15/21. The
vendor→zone data itself is correct (each ingredient really is sold by a
specific named NPC in a specific sub-zone per eqlwiki); the bug was scoring
sub-zones as if they were unrelated cities.

Migration 402 added `zone.cityGroup` to the 16 zones belonging to one of the
7 real-world cities split across multiple playable sub-zones (Freeport,
Neriak, Qeynos, Felwithe, Kaladim, Cabilis, Erudin). Every other city zone
has no `cityGroup` at all — it's already its own single zone, so callers
(`cityGroupLabel()`, `src/graph.ts`) fall back to the zone's own label, same
"absence is the default" convention `deriveCityAlignment()` also uses.
`getTradeskillLevelingCities()` sums ingredient coverage per `cityGroup`
rather than per zone, then picks whichever sub-zone within the winning city
covers the most on its own as the actual deep-link target (`zoneId`/
`zoneLabel` on `CityRecommendation`) — `maps.html` still routes to a real
zone, not a city name, so the recommendation shows "Freeport" but links to
whichever of its three sub-zones is the best single stop.

`findNearMe()` (`public/trades.js`) had the identical fragmentation bug for
its own "closest vendors" ranking and got the same fix: candidate stops are
grouped by `cityGroup` (now exposed on every `TradeskillVendorSummary`
entry), with the nearest reachable sub-zone in the group standing in for the
whole city's hops/route — once you've walked into one of a city's sub-zones,
reaching its others is a short in-city walk, not a second trip worth
routing separately.
