/**
 * Migration 447: log-sourced mob loot (Maps collapsible loot tables).
 *
 * Applies migrations/fixtures/447-hahl-rivervale-log-loot.json -- the
 * mechanical output of `bun run scripts/extract-log-loot.ts` against
 * Corey's own eqlog_Hahl_rivervale.txt play session (Jul 29-30 2026),
 * zone-tracked via that log's own "You have entered <Zone>." lines. See
 * migrations/_log-loot-lib.ts for what this actually writes (npc --drops-->
 * item, item --located_in--> zone) and why.
 *
 * A future log follows the same two steps: extract, then a new thin
 * migration like this one pointing at the new fixture -- no re-deriving the
 * apply logic.
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { loadGraph } from "./_lib";
import { applyLogLoot, type LogLootRecord } from "./_log-loot-lib";

const helpers = loadGraph(import.meta.dir);

const records: LogLootRecord[] = JSON.parse(
  readFileSync(resolve(import.meta.dir, "fixtures/447-hahl-rivervale-log-loot.json"), "utf-8")
);

const summary = applyLogLoot(helpers, records);
helpers.save();

console.log(`Migration 447 complete (${records.length} loot record(s) from eqlog_Hahl_rivervale.txt):`);
console.log(`  ${summary.recordsSkippedNoZone} skipped (no resolved zone)`);
console.log(`  mobs: ${summary.mobsCreated} created, ${summary.mobsReused} reused`);
console.log(`  items: ${summary.itemsCreated} created, ${summary.itemsReused} reused`);
console.log(`  drops edges added: ${summary.dropsEdgesAdded}`);
console.log(`  item located_in (method: drop) edges added: ${summary.locatedInEdgesAdded}`);
