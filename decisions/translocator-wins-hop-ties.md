# Translocator wins hop-count ties over boat (or walking)

`shortestPath()`'s BFS keeps the first route it discovers to each zone and never revisits a tie, so the real tie-break is which neighbor `getZoneAdjacency()` hands it first. Each zone's neighbor list sorts translocator-linked entries to the front for exactly this reason — an equally-short alternative via boat or on foot should never beat a translocator hop by accident of edge insertion order in `graph.json`. No zone pair currently has more than one transport option between the same two zones, so this has no effect on today's routes; it's there for whenever one does.

