/**
 * Merges duplicate vendor NPC nodes whose only difference is a location
 * suffix on the label, e.g. `vendor:ak-anon:clockwork-merchant-lg-17-library`
 * ("Clockwork Merchant (LG-17), Library") vs.
 * `vendor:ak-anon:clockwork-merchant-lg-17` ("Clockwork Merchant (LG-17)").
 * Audited all 197 such pairs in the graph before writing this: every one
 * is located in the same zone, every location-suffixed node's `sells` set
 * is a subset of (or equal to) its bare-label counterpart's, the 4 pairs
 * with differing roles all have the bare-label node carrying *more* roles
 * (quest_giver/mob) never fewer, and no location-suffixed node has any
 * edge besides `sells`/`located_in` -- consistent with the same physical
 * vendor having been scraped twice under two label conventions rather than
 * two distinct entities.
 *
 * The location-suffixed *label* wins (the guild/building it names is real,
 * actionable detail for finding the vendor in-zone -- zone-card.js's own
 * "Fixes vendor deduplication" commit (21f40c9) already established this
 * preference for a same-vendor display-string collision, just as a
 * client-side string filter rather than a real node merge), but the
 * bare-label *node* survives as the id (it's always the more, or equally,
 * complete one edge-wise) with its label overwritten to the descriptive
 * form. The location-suffixed node's own edges are retargeted onto the
 * survivor (skipped if that exact edge already exists there, since `sells`
 * sets overlap) and the now-orphaned node is dropped.
 *
 * 5 bare labels (Orex Nolus, Geep Tresoj, Amata D'Lavi, Grazik
 * Plaguebringer, Alysa Eltern) each have *two* location-suffixed dupes
 * naming different sub-locations of the same zone -- there's no live-wiki
 * lookup here to arbitrate which is current, so the dupe with the larger
 * `sells` set (the more completely-scraped of the two, and so the more
 * likely to be the up-to-date page instance) wins the label.
 */
import { dirname } from "path";
import { fileURLToPath } from "url";
import { loadGraph } from "./_lib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const { graph, save } = loadGraph(__dirname);

const npcs = graph.nodes.filter((n: any) => n.type === "npc");
const byLabel = new Map(npcs.map((n: any) => [n.label, n]));

const pairs: { dupe: any; survivor: any }[] = [];
for (const n of npcs as any[]) {
  const idx = n.label.indexOf(", ");
  if (idx === -1) continue;
  const survivor = byLabel.get(n.label.slice(0, idx));
  if (survivor) pairs.push({ dupe: n, survivor });
}

// Computed before any edges move, so a survivor with two dupes picks its
// label from whichever had the larger `sells` set at the start, not
// whichever happens to be processed last.
const sellsCount = (npcId: string) => graph.edges.filter((e: any) => e.type === "sells" && e.source === npcId).length;

let edgesRetargeted = 0;
let edgesDropped = 0;

const bestDupeBySurvivor = new Map<any, any>();
for (const { dupe, survivor } of pairs) {
  const current = bestDupeBySurvivor.get(survivor);
  if (!current || sellsCount(dupe.id) > sellsCount(current.id)) bestDupeBySurvivor.set(survivor, dupe);
}

for (const { dupe, survivor } of pairs) {
  const hasEquivalent = (edge: any, side: "source" | "target") =>
    graph.edges.some(
      (e: any) =>
        e !== edge &&
        e.type === edge.type &&
        e[side] === survivor.id &&
        e[side === "source" ? "target" : "source"] === edge[side === "source" ? "target" : "source"]
    );

  for (const edge of graph.edges) {
    if (edge.source === dupe.id) {
      if (hasEquivalent(edge, "source")) edgesDropped++;
      else { edge.source = survivor.id; edgesRetargeted++; }
    } else if (edge.target === dupe.id) {
      if (hasEquivalent(edge, "target")) edgesDropped++;
      else { edge.target = survivor.id; edgesRetargeted++; }
    }
  }
  graph.edges = graph.edges.filter((e: any) => e.source !== dupe.id && e.target !== dupe.id);
}

for (const [survivor, dupe] of bestDupeBySurvivor) survivor.label = dupe.label;

const dupeIds = new Set(pairs.map((p) => p.dupe.id));
graph.nodes = graph.nodes.filter((n: any) => !dupeIds.has(n.id));

save();
console.log(
  `Migration 395 complete: merged ${pairs.length} location-suffixed duplicate vendor nodes ` +
  `(${edgesRetargeted} edges retargeted, ${edgesDropped} redundant edges dropped)`
);
