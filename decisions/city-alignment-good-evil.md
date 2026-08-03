# City alignment (good/evil): classic-EQ convention, not yet eqlwiki-verified

The Tradeskills Leveling Guide recommends a good city and an evil city to
shop a trade's leveling-guide ingredients in (`getTradeskillLevelingCities()`,
`src/graph.ts`), scored by how many distinct leveling-guide ingredients each
city's vendors cover. That needed a good/evil classification for city zones,
which nothing in the graph carried before — `zone.faction` only holds
per-race/class/deity standing tables, not a single alignment label.

Migration 401 added `zone.alignment: "good" | "evil"` to 23 of the 27 `city`
zones, using classic EQ's well-known starting-city/race alignment convention
(Qeynos/Felwithe/Kaladim/Halas/Rivervale/Ak'Anon/Erudin/Thurgadin = good;
Freeport/Neriak/Grobb/Oggok/Cabilis/Paineel = evil) rather than a real
eqlwiki.com per-city pass. **This is a deliberate, flagged exception to this
repo's usual sourcing bar** (CLAUDE.md: verify EQL facts against eqlwiki.com,
not classic-EQ sources — see `eql-vs-classic-eq-zone-connectivity.md`), made
to ship the feature now instead of blocking it on 23 individual city
lookups. If EQL's own faction/alignment lore turns out to diverge from
classic EQ here the same way zone connectivity did, this migration's list is
the thing to revisit first.

Four city zones got no `alignment` at all — Highpass Hold, Kael Drakkal, High
Keep, Icewell Keep — because none of them are a classic single-race starting
city with an obvious alignment to borrow; absence here means "not counted for
either recommendation," not an oversight, same convention as an ingredient
with no `sells` edge.

## Recommendation heuristic

For a given tradeskill, `getTradeskillLevelingCities()` collects the distinct
ingredient set across only that tradeskill's `levelingGuide` recipes (the
same fixed reference path `leveling-guide-card.js` renders, not the full
recipe book), then for every `alignment`-tagged city sums how many of those
distinct ingredients at least one vendor there sells. The highest-scoring
good city and highest-scoring evil city are surfaced independently — a tie
or an alignment with no covering vendor at all resolves to `null` (the UI
just omits that side) rather than guessing.
