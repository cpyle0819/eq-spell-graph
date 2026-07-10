# Transport is an edge attribute, not a node

`connects_to` edges may carry `transport: "boat" | "translocator"` (migrations 009, 013). `shortestPath()` tracks transport per hop rather than modeling boats/translocators as intermediate nodes, so a route can flag "this hop is a boat crossing" or "this hop is a translocator" without the graph needing dedicated node types for either.

