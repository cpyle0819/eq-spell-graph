/**
 * Migration 014: Remove the phantom direct Butcherblock<->East Freeport boat edge
 *
 * Per eqlwiki.com/Ocean_of_Tears: the boat between Butcherblock and Freeport
 * makes real stops at two islands inside Ocean of Tears (Zachariah Reigh
 * Isle, then Sister Isle) — "real zone transitions with actual docking
 * events," not a pass-through. There is no non-stop Butcherblock<->Freeport
 * boat in-game. The direct edge predates migration 010's correct addition
 * of Ocean of Tears as the required midpoint and was never removed, giving
 * the route planner a shortcut that doesn't actually exist.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const DATA_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(DATA_PATH, "utf-8"));

const before = graph.edges.length;
graph.edges = graph.edges.filter(
  (e: { data: { type: string; source: string; target: string } }) =>
    !(
      e.data.type === "connects_to" &&
      ((e.data.source === "zone:butcherblock-mountains" && e.data.target === "zone:east-freeport") ||
        (e.data.source === "zone:east-freeport" && e.data.target === "zone:butcherblock-mountains"))
    )
);

writeFileSync(DATA_PATH, JSON.stringify(graph, null, 2));
console.log(`Migration 014 complete: removed ${before - graph.edges.length} phantom edge(s)`);
