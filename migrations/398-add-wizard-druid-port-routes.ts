/**
 * Migration 398: Model the rest of the Wizard/Druid teleport-to-fixed-zone
 * spells as fan-out routing edges (issue #64, "Flesh out wizard ports").
 *
 * Migration 364 modeled exactly one such spell (Alter Plane: Sky) as
 * `wizard_port` edges from every zone to Plane of Sky. This migration
 * extends the same idea to the rest of the Wizard-exclusive and
 * Druid-exclusive "teleport a fixed zone away" spell families:
 *
 *  - Wizard: Gate/Portal/Translocate/Evacuate (self, group, single-target,
 *    and emergency variants -- all lead to the same handful of zones per
 *    spell name) plus the two one-off "Relocation" spells.
 *  - Druid: Ring/Circle/Zephyr/Succor, same shape.
 *
 * Per-destination, per-spell-family reachability isn't tracked -- if *any*
 * spell in a class's family reaches a zone, that zone gets one fan-out edge
 * for that class. The specific spell (self vs. group, reagent or not) only
 * matters for the flavor text a player would look up, not for whether the
 * destination is reachable, so it isn't modeled at the edge level (same
 * choice migration 364 made for Alter Plane: Sky vs. its ordinary portal).
 *
 * Two classes can lead to the same zone (Northern Karana, Toxxulia Forest,
 * Stonebrunt Mountains, and Western Commonlands all have both a Wizard and
 * a Druid family reaching them) -- unlike 364's single-destination case,
 * this migration can't rely on the shared `addEdge` helper's source+target+
 * type dedup, since it ignores the `transport` attribute and would treat a
 * wizard_port edge as already covering the druid_port one to the same zone
 * (or vice versa) and silently drop it. `addPortEdge` below dedups on
 * source+target+transport instead, and separately skips adding a port edge
 * at all when the source already has *any* ordinary connects_to edge to
 * that destination -- same reasoning as 364 skipping East Freeport for
 * Plane of Sky: a zone that already borders the destination doesn't need a
 * redundant "assumes a Wizard/Druid" alternate to get there in the same one
 * hop. That's a per-destination check here (dozens of existing borders
 * across 23 destinations) rather than 364's one hardcoded skip.
 *
 * Tishan's Relocation (-> Skyfire Mountains) carries a wiki warning that
 * the port-in spot is usually lethal unless invisible -- noted here for
 * whoever next touches this data, not surfaced in the UI (no per-edge
 * caveat mechanism exists, and building one is out of scope for this
 * migration -- see decisions/zone-danger-warnings.md, which is a
 * *zone*-level mechanism, not an edge-level one).
 *
 * All 23 destination zones already exist in the graph, confirmed against
 * data/graph.json's zone node list -- no new zones added here.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

let edgeCounter = graph.edges.length;

function addPortEdge(source: string, target: string, transport: "wizard_port" | "druid_port") {
  if (source === target) return;
  const existing = graph.edges.filter(
    (e: { type: string; source: string; target: string; transport?: string }) =>
      e.type === "connects_to" && e.source === source && e.target === target
  );
  if (existing.some((e: { transport?: string }) => e.transport !== "wizard_port" && e.transport !== "druid_port")) return;
  if (existing.some((e: { transport?: string }) => e.transport === transport)) return;
  edgeCounter++;
  graph.edges.push({ id: `e-connects_to-${edgeCounter}`, source, target, type: "connects_to", transport });
}

// Wizard: Gate (self, ~18-23) / Portal (group, ~25-37) / Translocate
// (single-target-other, ~35-44) / Evacuate (group, unreliable, ~26-47) all
// reach these zones; Markar's Relocation (37) and Tishan's Relocation (36)
// are one-off group spells to their own destinations.
const wizardDestinations = [
  "zone:temple-of-cazic-thule",
  "zone:greater-faydark",
  "zone:nektulos-forest",
  "zone:northern-karana",
  "zone:northern-desert-of-ro",
  "zone:stonebrunt-mountains",
  "zone:toxxulia-forest",
  "zone:west-commonlands",
  "zone:western-karana",
  "zone:emerald-jungle",
  "zone:skyfire-mountains",
];

// Druid: Ring (self, ~15-25) / Circle (group, ~25-36) / Zephyr
// (single-target-other, ~32-47) all reach these zones; Succor (group,
// ~26-46) reaches the same set plus Eastern Karana, which nothing else
// covers.
const druidDestinations = [
  "zone:butcherblock-mountains",
  "zone:the-feerrott",
  "zone:lavastorm-mountains",
  "zone:misty-thicket",
  "zone:northern-karana",
  "zone:southern-desert-of-ro",
  "zone:steamfont-mountains",
  "zone:stonebrunt-mountains",
  "zone:surefall-glade",
  "zone:toxxulia-forest",
  "zone:west-commonlands",
  "zone:eastern-karana",
];

const zoneIds = graph.nodes.filter((n: { type: string }) => n.type === "zone").map((n: { id: string }) => n.id);

let wizardPortCount = 0;
for (const dest of wizardDestinations) {
  for (const zoneId of zoneIds) {
    const before = graph.edges.length;
    addPortEdge(zoneId, dest, "wizard_port");
    if (graph.edges.length > before) wizardPortCount++;
  }
}

let druidPortCount = 0;
for (const dest of druidDestinations) {
  for (const zoneId of zoneIds) {
    const before = graph.edges.length;
    addPortEdge(zoneId, dest, "druid_port");
    if (graph.edges.length > before) druidPortCount++;
  }
}

save();

console.log(`Migration 398 complete: ${wizardPortCount} wizard_port edges added, ${druidPortCount} druid_port edges added.`);
