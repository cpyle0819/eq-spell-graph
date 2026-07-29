/**
 * Migration 363: Add Froglok and Kerran to race faction data (issue #44).
 *
 * Both races were entirely absent from every zone's faction.race map --
 * not just the UI dropdown -- so the resolver was silently treating them
 * as "neutral" everywhere (src/graph.ts's `(race && zf.race?.[race]) ||
 * "neutral"` fallback).
 *
 * eqlwiki.com's race pages confirm both are Neutral-alignment races
 * (Froglok: Rathe Mountains, Kerran: Kerra Isle) -- but individual zone
 * pages don't publish a per-race faction table (confirmed by checking
 * Ak'Anon's page), so there's no wiki source more granular than what
 * migration 007 already used to build every other race's standings: a
 * good-city/evil-city/outdoor-zone template where non-evil-aligned races
 * (human, erudite, gnome, half elf, etc.) cluster on the same value in
 * all but a handful of zones with an explicit home-region bonus for one
 * specific race (e.g. barbarian+human "safe" in the Karana plains).
 *
 * Rather than guess which cluster to copy, this derives each zone's value
 * for the two new races from the *mode* (most common standing) of the 13
 * existing races in that same zone -- mechanically reconstructing what
 * the good/evil/outdoor template would have produced, without importing
 * a home-region bonus that belongs to a different race's homeland.
 * Verified there are no ties across any of the 93 zones with faction.race
 * data before relying on this. The 19 zones with no faction.race at all
 * yet (mostly newer Kunark/Velious dungeons) are unaffected -- that's a
 * separate, pre-existing gap, not specific to these two races.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

function mode(values: string[]): string {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) || 0) + 1);
  let best = values[0];
  let bestCount = 0;
  for (const [v, c] of counts) {
    if (c > bestCount) {
      best = v;
      bestCount = c;
    }
  }
  return best;
}

let updated = 0;
for (const node of graph.nodes) {
  if (node.type !== "zone" || !node.faction?.race) continue;
  const existing = Object.values(node.faction.race) as string[];
  const standing = mode(existing);
  node.faction.race.froglok = standing;
  node.faction.race.kerran = standing;
  updated++;
}

save();

console.log(`Migration 363 complete: froglok/kerran added to ${updated} zones' faction.race.`);
