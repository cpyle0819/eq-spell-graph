/**
 * Migration 315: add `maps` to zone:chardok -- see issue #36.
 *
 * eqlwiki.com's own map uploads for Chardok (Post-Revamp) are broken on
 * both floors (decisions/eqlwiki-broken-map-images.md); user-approved
 * exception to that decision (which otherwise says not to substitute a
 * classic-EQ map for a missing eqlwiki one) -- see the amended decision
 * doc. `public/maps/chardok-upper.png`/`chardok-lower.gif` downloaded from
 * wiki.project1999.com's own File:Chardok_top.png/Chardok_b_draelon.gif,
 * the same two floors the eqlwiki page itself references (thumb captions
 * "Map of Chardok" / "Map of Chardok (lower sections)"). No numbered
 * legend on the source page for either floor.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { id: string }) => n.id === "zone:chardok");
if (!zone) throw new Error("zone:chardok not found");

zone.maps = [
  { label: "Upper", image: "chardok-upper.png", legend: [] },
  { label: "Lower", image: "chardok-lower.gif", legend: [] },
];

save();
console.log("Migration 315 complete: maps set on zone:chardok");
