# Planning and routing are separate concerns

`rankZones()` (shop planning: "where should I go?") and `getRoute()` (point-to-point: "how do I get from A to B?") are independent functions/endpoints even though both walk the same zone graph via `shortestPath()`. The Route Finder page (`public/route.html`) exists separately from the planner rather than folding routing into it, because "get me from A to B" is a distinct question from "where should I shop" and doesn't need faction or spell context.

