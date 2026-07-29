/**
 * Migration 364: Add portal-based zone entrances for Plane of Fear and
 * Plane of Sky, plus Wizard Port routes to Plane of Sky (issue #43).
 *
 * eqlwiki.com research (Plane_of_Fear, Plane_of_Sky pages) shows neither
 * zone is actually wizard-exclusive -- each has an ordinary portal object
 * any class can use (a one-way portal in The Feerrott's spectre caves for
 * Fear; an orb in East Freeport for Sky), plus a *separate*, redundant
 * Wizard-only group-teleport spell (Alter Plane: Sky, level 46, consumes a
 * Cloudy Stone of Veeshan -- see spell:alter-plane-sky). Plane of Hate has
 * the same pattern (portal in Oasis of Marr + Alter Plane: Hate) but isn't
 * in the graph at all yet (no NPCs/quests authored for it), so it's out of
 * scope here.
 *
 * This adds both kinds of edge -- see decisions/
 * wizard-port-transport-modeling.md for why they're modeled differently:
 *  - The ordinary portal routes (transport: "portal") always participate in
 *    pathfinding, same as any other connects_to edge -- these are what
 *    actually close the "missing routes" gap. Both are one-way in only
 *    (East Freeport -> Sky, Feerrott -> Fear) -- a two-way Sky<->East
 *    Freeport edge was tried and reverted: it let wizard_port + the return
 *    portal combine into a bogus "any zone -> East Freeport in 2 hops"
 *    shortcut through a raid zone, which isn't a real travel pattern
 *    (falling off an island is an accident-recovery mechanic, not a
 *    deliberate route back).
 *  - A wizard_port edge from every other zone straight to Plane of Sky
 *    (transport: "wizard_port"), modeling that a group with a Wizard can
 *    jump there in one hop from anywhere. Excluded from pathfinding unless
 *    a caller opts in (getZoneAdjacency's includeWizardPort flag / the
 *    UI's "Include Wizard Port" toggle), so a route can be compared with
 *    and without assuming wizard access.
 *
 * Plane of Fear has no equivalent Wizard spell (confirmed against its wiki
 * page and the spell data -- no "Alter Plane: Fear" exists), so it only
 * gets the ordinary portal edge.
 */

import { loadGraph } from "./_lib";

const { graph, addEdge, save } = loadGraph(import.meta.dir);

// Ordinary portal entrances -- always-on routes, same as any other
// connects_to edge. Both one-way in only: Fear's portal is explicitly
// one-way per its wiki page ("the only way out is either through
// gating/porting or through an exit portal deep inside the Temple"), and
// Sky's "fall off an island, zone to East Freeport's ocean" isn't a real
// return route either -- see the docblock above for why a two-way Sky<->
// East Freeport edge was reverted.
addEdge("zone:the-feerrott", "zone:plane-of-fear", "connects_to", { transport: "portal" });
addEdge("zone:east-freeport", "zone:plane-of-sky", "connects_to", { transport: "portal" });

// Wizard Port: any zone -> Plane of Sky, one-directional (a cast-in group
// teleport, not a two-way zone line). East Freeport is skipped since it
// already has the strictly-better ordinary portal edge added above.
let wizardPortCount = 0;
for (const node of graph.nodes) {
  if (node.type !== "zone") continue;
  if (node.id === "zone:plane-of-sky" || node.id === "zone:east-freeport") continue;
  addEdge(node.id, "zone:plane-of-sky", "connects_to", { transport: "wizard_port" });
  wizardPortCount++;
}

save();

console.log(`Migration 364 complete: 3 portal edges added, ${wizardPortCount} wizard_port edges added to Plane of Sky.`);
