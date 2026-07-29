/**
 * Migration 369: fixes migration 366's own mistake, not a new data source.
 * Mixing Bowl's soldby table lists "a goblin merchant" in RunnyEye Citadel;
 * migration 366 hardcoded that vendor as skipped ("zone not catalogued in
 * this graph") without actually checking -- Runnyeye Citadel (zone:
 * runnyeye-citadel) and its "a goblin merchant" npc (npc:runnyeye-citadel:
 * a-goblin-merchant) both already existed. Adds the missing sells edge.
 */

import { loadGraph } from "./_lib";

const { addEdge, save } = loadGraph(import.meta.dir);

addEdge("npc:runnyeye-citadel:a-goblin-merchant", "container:mixing-bowl", "sells");

save();
console.log("Migration 369 complete: added Mixing Bowl sells edge for RunnyEye Citadel's goblin merchant");
