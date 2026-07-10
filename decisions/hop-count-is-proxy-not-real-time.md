# Hop count is a proxy for travel effort, not real-world time

`shortestPath()` minimizes hop count, treating every `connects_to` edge as equally "costly" regardless of transport. In reality a boat hop takes real minutes (per eqlwiki.com, ~15 min dock-to-dock for Butcherblock<->Ocean of Tears<->Freeport) while a translocator hop is instant, so a route with more hops but more translocators can be faster in practice than a shorter one that's all boats or walking. Not modeled — would need per-edge time weights and a shortest-time search (Dijkstra) instead of plain BFS. Fine for now since most planner routes are short and boat-heavy detours are rare; revisit if that stops being true.

