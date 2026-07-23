# A zone node's id must equal `zone:slugify(label)` exactly

`/api/route` and `/api/plan`'s `from=` (src/api.ts) resolve a zone from a
plain-text label by recomputing `zone:${slugify(label)}` rather than
looking it up — there's no stored label-to-id index, just this recomputed
guess. That only works if every zone node's own `id` was created with the
exact same `slugify()` (lowercase, every run of non-alphanumeric chars
collapsed to one `-`, trimmed) as the one `src/api.ts`/`src/graph.ts` both
still use at request time.

Found via migration 142 (Kurn's Tower map/bestiary, issue #36): a full-graph
scan turned up exactly 4 zone nodes whose `id` didn't match
`slugify(label)` — `zone:sleepers-tomb`, `zone:trakanons-teeth`,
`zone:karnors-castle`, `zone:kurns-tower` — all possessive zone names
("Kurn's Tower" etc.) created at some earlier point by a slug step that
just stripped the apostrophe (`"kurns-tower"`) instead of turning it into
its own `-` like the current `slugify()` does (`"kurn-s-tower"`). Every
other zone in the graph already matched exactly; these 4 were silent dead
ends for `/api/route`/`/api/plan` — a zone-dossier lookup or route plan
through any of them resolved to a nonexistent node and came back empty,
with no error, which is what made it easy to ship without noticing.

Migration 150 renamed all 4 zone ids (plus every node namespaced under one,
e.g. `mob:kurns-tower:*` -> `mob:kurn-s-tower:*`) to match, rather than
teaching `/api/route`/`/api/plan` to look zones up by label. Keeping the
"id = zone:slugify(label)" invariant true unconditionally, with zero
special-casing in the shared read-only API layer (`src/api.ts`, deployed
to both the Bun dev server and the Lambda), was judged simpler than adding
a label-to-id lookup path that only 4 zones would ever exercise.

**Any new zone node must be created with `id: zone:${slugify(label)}`**
using the *current* `slugify()` in `src/api.ts`/`src/graph.ts` (or by
literal inspection matching its behavior), not a hand-picked slug —
apostrophes in particular become their own `-`, not nothing.
