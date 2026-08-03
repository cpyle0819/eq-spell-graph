/**
 * Migration 402: adds a `cityGroup` field to the 16 city zones that are
 * really one real-world city split across multiple playable sub-zones
 * (Freeport, Neriak, Qeynos, Felwithe, Kaladim, Cabilis, Erudin) -- every
 * other city zone (Ak'Anon, Halas, Oggok, Rivervale, Paineel, Thurgadin,
 * Highpass Hold, Kael Drakkal, High Keep, Icewell Keep) is already its own
 * single zone and needs no grouping, so it's left without the field
 * (callers fall back to the zone's own label, see
 * decisions/city-alignment-good-evil.md).
 *
 * Follow-up to migration 401: getTradeskillLevelingCities() was scoring
 * Freeport's three sub-zones as three unrelated evil cities, so none of
 * them individually beat South Qeynos even though Freeport as a whole
 * (15/21 Brewing leveling-guide ingredients) does. Grouping by real city
 * fixes both that recommendation and findNearMe()'s own "closest vendors"
 * ranking (public/trades.js), which had the identical per-zone-fragmentation
 * problem.
 */

import { loadGraph } from "./_lib";

const { updateNode, save } = loadGraph(import.meta.dir);

const GROUPS: Record<string, string[]> = {
  Freeport: ["zone:west-freeport", "zone:east-freeport", "zone:north-freeport"],
  Neriak: ["zone:neriak-foreign-quarter", "zone:neriak-commons", "zone:neriak-3rd-gate"],
  Qeynos: ["zone:south-qeynos", "zone:north-qeynos"],
  Felwithe: ["zone:southern-felwithe", "zone:northern-felwithe"],
  Kaladim: ["zone:north-kaladim", "zone:south-kaladim"],
  Cabilis: ["zone:east-cabilis", "zone:west-cabilis"],
  Erudin: ["zone:erudin", "zone:erudin-palace"],
};

let count = 0;
for (const [cityGroup, zoneIds] of Object.entries(GROUPS)) {
  for (const id of zoneIds) {
    updateNode(id, { cityGroup });
    count++;
  }
}

save();

console.log(`Tagged ${count} zones across ${Object.keys(GROUPS).length} city groups.`);
