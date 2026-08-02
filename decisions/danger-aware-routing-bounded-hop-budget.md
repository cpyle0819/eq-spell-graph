# Danger-aware routing: bounded hop budget, worst-single-zone scoring

The "Avoid Danger" toggle (gated off by default, same opt-in shape as `wizard-port-transport-modeling.md`) changes `shortestPath()` from plain BFS to a two-step search:

1. Run the existing BFS to find the true minimum hop count for the pair (still respecting the out-of-era waypoint skip — see `hop-count-is-proxy-not-real-time.md`).
2. Enumerate every simple path between the two zones whose length is at most `minHops + 2` (`DANGER_HOP_BUDGET` in `src/graph.ts`), and pick whichever has the lowest **worst single zone** `terrorRating` (see `zone-terror-rating-heuristic.md`), tie-breaking by fewest hops.

Two choices worth recording:

- **Fixed hop budget, not a blended cost function.** The feature request was explicit: "shortest number of hops wins if nothing is terrifying... a hop or two more and less scary wins." A single `hops + λ·terror` Dijkstra cost would bury that rule behind an opaque weight; a hop-budget-bounded search makes it literal and keeps the plain-BFS behavior exactly intact when the toggle is off.
- **Worst zone, not summed terror.** A route is only as safe as its scariest zone — passing through two mildly-risky zones isn't worse than passing through one very risky zone. This was a direct user call against summing, made when this was implemented.

The zone graph is sparse (avg degree ~3 among its `connects_to` edges), so bounding the DFS enumeration by hop count is cheap — no k-shortest-paths algorithm or memoization was needed.
