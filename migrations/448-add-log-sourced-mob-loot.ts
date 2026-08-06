/**
 * Migration 448: log-sourced mob loot (Maps collapsible loot tables),
 * second batch.
 *
 * Applies migrations/fixtures/448-hahl-rivervale-log-loot.json -- the
 * mechanical output of `bun run scripts/extract-log-loot.ts` against
 * Corey's own eqlog_Hahl_rivervale.txt play session (Aug 5 2026, Runnyeye
 * Citadel), continuing from where migration 447 left off via that script's
 * cursor. See migrations/_log-loot-lib.ts for what this actually writes
 * (npc --drops--> item, item --located_in--> zone) and why.
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { loadGraph } from "./_lib";
import { applyLogLoot, type LogLootRecord } from "./_log-loot-lib";

const helpers = loadGraph(import.meta.dir);

const records: LogLootRecord[] = JSON.parse(
  readFileSync(resolve(import.meta.dir, "fixtures/448-hahl-rivervale-log-loot.json"), "utf-8")
);

const summary = applyLogLoot(helpers, records);
helpers.save();

console.log(`Migration 448 complete (${records.length} loot record(s) from eqlog_Hahl_rivervale.txt):`);
console.log(`  ${summary.recordsSkippedNoZone} skipped (no resolved zone)`);
console.log(`  mobs: ${summary.mobsCreated} created, ${summary.mobsReused} reused`);
console.log(`  items: ${summary.itemsCreated} created, ${summary.itemsReused} reused`);
console.log(`  drops edges added: ${summary.dropsEdgesAdded}`);
console.log(`  item located_in (method: drop) edges added: ${summary.locatedInEdgesAdded}`);
