/**
 * Migration 002: Flip edge directions to hierarchical flow.
 *
 * Before: vendor --sells--> spell, vendor --located_in--> zone
 * After:  zone --has_vendor--> vendor, vendor --has_spell--> spell
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const DATA_PATH = resolve(import.meta.dir, "../data/graph.json");

const raw = readFileSync(DATA_PATH, "utf-8");
const graph = JSON.parse(raw);

let flipped = 0;

graph.edges = graph.edges.map((e: any, i: number) => {
  if (e.data.type === "sells") {
    // vendor --sells--> spell  =>  vendor --has_spell--> spell (same direction, rename)
    flipped++;
    return {
      data: {
        id: `e-has-spell-${i}`,
        source: e.data.source,
        target: e.data.target,
        type: "has_spell",
      },
    };
  }
  if (e.data.type === "located_in") {
    // vendor --located_in--> zone  =>  zone --has_vendor--> vendor (flip direction)
    flipped++;
    return {
      data: {
        id: `e-has-vendor-${i}`,
        source: e.data.target, // zone is now source
        target: e.data.source, // vendor is now target
        type: "has_vendor",
      },
    };
  }
  return e;
});

writeFileSync(DATA_PATH, JSON.stringify(graph, null, 2));
console.log(`Migration 002 complete: flipped/renamed ${flipped} edges`);
console.log(`  Hierarchy: zone --has_vendor--> vendor --has_spell--> spell`);
