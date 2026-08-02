/**
 * Adds a `terrorRating` (0-5) to every zone node, so route-finding can weigh
 * safety against hop count instead of always taking the shortest path
 * through a gauntlet. See decisions/zone-terror-rating-heuristic.md for the
 * full methodology and the eqlwiki research backing it.
 *
 * Summary: terrorRating is driven primarily by zoneType, not raw mob level.
 * Raw max/avg mob level alone is a poor danger signal here -- it mostly
 * tracks expansion era (a Velious zone is "high level" whether or not it's
 * actually risky to walk through), and many high-level "mob"-role NPCs in
 * cities are just quest givers/authority figures with combat stats, not
 * hostile threats. So:
 *   - city zones are always 0 (guarded safe hubs; no roaming hostiles)
 *   - open_world zones: base 1, +1/+2 nudge from the average level of
 *     *purely hostile* mobs (role === ["mob"] only, excluding any NPC that
 *     is also a vendor/quest_giver/guard/banker)
 *   - dungeon zones: base 3, same +1/+2 nudge
 * This keeps every open_world zone's ceiling (3) at or below every
 * dungeon's floor (3): a dungeon is never rated safer than an open zone,
 * matching that dungeons force fights in tight corridors while open zones
 * can usually be skirted around.
 */
import { dirname } from "path";
import { fileURLToPath } from "url";
import { loadGraph } from "./_lib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const { graph, save } = loadGraph(__dirname);

function pureMobLevels(zoneId: string): number[] {
  const mobIds = new Set(
    graph.edges
      .filter((e: any) => e.type === "located_in" && e.target === zoneId)
      .map((e: any) => e.source)
  );
  return graph.nodes
    .filter(
      (n: any) =>
        n.type === "npc" &&
        mobIds.has(n.id) &&
        Array.isArray(n.roles) &&
        n.roles.length === 1 &&
        n.roles[0] === "mob" &&
        typeof n.maxLevel === "number"
    )
    .map((n: any) => n.maxLevel);
}

function levelFactor(levels: number[]): number {
  if (!levels.length) return 0;
  const avg = levels.reduce((a, b) => a + b, 0) / levels.length;
  if (avg > 40) return 2;
  if (avg > 20) return 1;
  return 0;
}

let updated = 0;
for (const zone of graph.nodes.filter((n: any) => n.type === "zone")) {
  let rating: number;
  if (zone.zoneType === "city") {
    rating = 0;
  } else {
    const base = zone.zoneType === "dungeon" ? 3 : 1;
    rating = Math.min(5, base + levelFactor(pureMobLevels(zone.id)));
  }
  zone.terrorRating = rating;
  updated++;
}

save();
console.log(`Migration 396 complete: set terrorRating on ${updated} zone nodes`);
