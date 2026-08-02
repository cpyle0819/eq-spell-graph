# Alternate routes: reuse the danger-routing hop-budget DFS, cap at 3 total

Every surface that shows a route (`<route-card>` in Maps, `<route-path variant="stone">` in Spell Finder's `<zone-card>` and Tradeskills' `<nearest-vendors-dialog>`) now offers up to 2 alternate routes alongside the primary one — 3 total, picked via a small pill row inside `<route-path>` itself (`public/components/route-path.js`).

Two choices worth recording:

- **Reused `boundedPaths()`, not a new k-shortest-paths algorithm.** `danger-aware-routing-bounded-hop-budget.md` already established that this zone graph (avg degree ~3) is sparse enough that a hop-budget-bounded DFS is cheap. `routeAlternates()` in `src/graph.ts` calls the same `boundedPaths()` with its own budget (`ALTERNATE_HOP_BUDGET = 2`), dedupes against the primary route by exact zone sequence, and keeps up to `MAX_ALTERNATE_ROUTES` (2). No separate algorithm needed.
- **Ordering matches whatever picked the primary.** When "Avoid Danger" is on, alternates are sorted by worst-single-zone terror (same metric `safestPath()` uses), so they read as "next safest" — consistent with why the primary route won. When it's off, alternates sort by hop count.
- **`<route-path>` owns the picker, not its callers.** All three surfaces pass `.steps` (primary) and `.alternates` (RouteStep[][]) straight through; the component renders the pill row and swaps its own displayed step list. This means the feature landed with a one-line wiring change per caller instead of duplicated tab UI in `route-card.js`/`zone-card.js`/`nearest-vendors-dialog.js`.
- **No alternates when routing through stops.** `getRoute()`'s `stopZoneIds` (issue #63) stitches one independent `shortestPath()` leg per waypoint pair; combining per-leg alternates into whole-trip alternates would multiply out combinatorially for a feature nobody asked to route through waypoints, so alternates are only computed for a plain from→to hop.
