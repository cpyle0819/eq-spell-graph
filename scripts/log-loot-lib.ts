/**
 * Shared apply logic for log-sourced mob loot (issue: Maps collapsible loot
 * tables, sourced from real chat logs -- see
 * decisions/quest-log-sourcing-and-incomplete-flag.md for the precedent of
 * treating a real log as a valid EQL source, extended here to mobs/drops
 * rather than just quest dialogue).
 *
 * Input is the raw per-record output of `scripts/extract-log-loot.ts`
 * (`{ zoneId, zoneLabel, mob, item, quantity, timestamp }[]`, one entry per
 * loot line) -- not pre-grouped, so this function is the only place that
 * dedupes. This keeps the pipeline fully mechanical for the next log: run
 * the extractor, save its output to a scratch JSON file, write a thin
 * one-off script that reads it and calls `applyLogLoot()` -- no
 * hand-transcription or re-derivation of data needed.
 *
 * Every mob observed in a log gets an npc node (role: "mob") if one doesn't
 * already exist for that zone/name -- not filtered by any judgment call
 * about which mobs are "worth" modeling; a mob the player actually saw drop
 * something is as real as any eqlwiki-catalogued one. Reuses an existing
 * node under either the current `npc:<zone>:<slug>` id or the legacy
 * `mob:<zone>:<slug>` id (decisions/npc-mob-unification-and-zone-groups.md)
 * rather than creating a duplicate.
 *
 * Two edges per (zone, mob, item) triple, per
 * decisions/item-drops-edge-and-item-located-in.md:
 *   - `npc --drops--> item`: the edge Maps' Bestiary already renders
 *     (zone-dossier.js's npc.drops).
 *   - `item --located_in--> zone` with `method: "drop"` and `mobs: [...]`
 *     (every mob name observed dropping that item in that zone, accumulated
 *     across the whole input before the edge is written -- `graph-lib.ts`'s
 *     generic `addEdge` dedupes on source/target/type alone, so writing this
 *     edge once per mob would silently drop every mob after the first).
 *     Same edge item detail pages already resolve for "Dropped By" sourcing.
 */
import type { loadGraph } from "./graph-lib";

export type LogLootRecord = {
  timestamp: string;
  zoneId: string | null;
  zoneLabel: string;
  mob: string;
  item: string;
  quantity: number;
};

type GraphHelpers = ReturnType<typeof loadGraph>;

export type ApplyLogLootSummary = {
  recordsSkippedNoZone: number;
  mobsCreated: number;
  mobsReused: number;
  itemsCreated: number;
  itemsReused: number;
  dropsEdgesAdded: number;
  locatedInEdgesAdded: number;
};

export function applyLogLoot(helpers: GraphHelpers, records: LogLootRecord[]): ApplyLogLootSummary {
  const { hasNode, addNode, hasEdge, addEdge, slug, graph } = helpers;

  function resolveMobId(zoneId: string, mobLabel: string): { id: string; created: boolean } {
    const zoneSlug = zoneId.replace(/^zone:/, "");
    const mobSlug = slug(mobLabel);
    const npcId = `npc:${zoneSlug}:${mobSlug}`;
    const legacyId = `mob:${zoneSlug}:${mobSlug}`;
    if (hasNode(npcId)) return { id: npcId, created: false };
    if (hasNode(legacyId)) return { id: legacyId, created: false };
    addNode({ id: npcId, label: mobLabel, type: "npc", roles: ["mob"] });
    addEdge(npcId, zoneId, "located_in");
    return { id: npcId, created: true };
  }

  function resolveItemId(itemLabel: string): { id: string; created: boolean } {
    const id = `item:${slug(itemLabel)}`;
    const created = !hasNode(id);
    if (created) addNode({ id, label: itemLabel, type: "item" });
    return { id, created };
  }

  const summary: ApplyLogLootSummary = {
    recordsSkippedNoZone: 0,
    mobsCreated: 0,
    mobsReused: 0,
    itemsCreated: 0,
    itemsReused: 0,
    dropsEdgesAdded: 0,
    locatedInEdgesAdded: 0,
  };

  // (zoneId, itemId) -> every mob label observed dropping it there, gathered
  // up front so the located_in edge below carries the complete list.
  const itemZoneMobs = new Map<string, { itemId: string; zoneId: string; mobs: Set<string> }>();

  for (const rec of records) {
    if (!rec.zoneId) {
      summary.recordsSkippedNoZone++;
      continue;
    }

    const mobResult = resolveMobId(rec.zoneId, rec.mob);
    if (mobResult.created) summary.mobsCreated++;
    else summary.mobsReused++;

    const itemResult = resolveItemId(rec.item);
    if (itemResult.created) summary.itemsCreated++;
    else summary.itemsReused++;

    if (!hasEdge(mobResult.id, itemResult.id, "drops")) {
      addEdge(mobResult.id, itemResult.id, "drops");
      summary.dropsEdgesAdded++;
    }

    const key = `${rec.zoneId}::${itemResult.id}`;
    if (!itemZoneMobs.has(key)) itemZoneMobs.set(key, { itemId: itemResult.id, zoneId: rec.zoneId, mobs: new Set() });
    itemZoneMobs.get(key)!.mobs.add(rec.mob);
  }

  for (const { itemId, zoneId, mobs } of itemZoneMobs.values()) {
    if (!hasEdge(itemId, zoneId, "located_in")) {
      addEdge(itemId, zoneId, "located_in", { method: "drop", mobs: [...mobs] });
      summary.locatedInEdgesAdded++;
    }
  }

  return summary;
}
