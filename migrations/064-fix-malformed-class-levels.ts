/**
 * Migrations 062 and 063 wrote `class_levels` as a plain `{ class: level }`
 * object on six spell nodes instead of the `[{ class, level }]` array shape
 * every other node uses (see src/graph.ts's ClassLevel type). Every reader
 * does `for (const cl of class_levels)` / `.some(...)`, so the object shape
 * throws "not iterable" at request time -- this is what took the deployed
 * /api/classes endpoint down with 502s.
 */
import { dirname } from "path";
import { fileURLToPath } from "url";
import { loadGraph } from "./_lib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const { graph, save } = loadGraph(__dirname);

const badIds = [
  "spell:brain-bite",
  "spell:mcmerins-feast",
  "spell:heroic-bond",
  "spell:sunskin",
  "spell:unswerving-hammer-of-faith",
  "spell:word-of-vigor",
];

let fixed = 0;
for (const node of graph.nodes) {
  if (!badIds.includes(node.data.id)) continue;
  const cl = node.data.class_levels;
  if (Array.isArray(cl)) continue; // already fixed
  node.data.class_levels = Object.entries(cl as Record<string, number>).map(
    ([cls, level]) => ({ class: cls, level })
  );
  fixed++;
}

if (fixed !== badIds.length) {
  throw new Error(`Expected to fix ${badIds.length} nodes, fixed ${fixed}`);
}

save();
console.log(`Migration 064 complete: fixed class_levels shape on ${fixed} spell nodes`);
