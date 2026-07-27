/**
 * Migration 349: fixes issue #41's "0 vendors" flag for zone:erudin-palace.
 *
 * Root cause: 15 spell-vendor npc nodes already exist with ids prefixed
 * `vendor:erudin-palace:*` (correctly reflecting their real location -- the
 * Magician/Enchanter guild towers on Level Two of Erudin Palace, per this
 * zone's own `maps` legend), but every one of them has a `located_in` edge
 * pointing at `zone:erudin` instead of `zone:erudin-palace`. Of those 15,
 * 9 also have a redundant duplicate node under `vendor:erudin:*-palace-
 * *-guild` (same NPC, subset of the same `sells` list, same roles, no other
 * edges) -- likely created by an earlier partial import before the fuller
 * `vendor:erudin-palace:*` versions were added, per the
 * duplicate-vendor/quest-giver-node pattern already fixed elsewhere for this
 * issue (migration 324).
 *
 * Fix: drop the 9 redundant `vendor:erudin:*` duplicates outright (no data
 * to preserve -- verified their `sells` edges are strict subsets of the
 * `vendor:erudin-palace:*` counterpart's), then repoint all 15
 * `vendor:erudin-palace:*` nodes' `located_in` edge from `zone:erudin` to
 * `zone:erudin-palace`.
 *
 * The zone's Basement-level named shops (Erudin City Office, Sothure's Fine
 * Gems, Vials of Vitality) and the Wizard Guild's Tower of the Crimson Hands
 * (no individually-named vendor NPCs exist for it, unlike Magician/Enchanter)
 * get new vendor nodes -- named per the map's own text, same as other
 * collective-name-shop precedent (migration 323's Coldain Outcasts). No
 * `sells` edges added: "gems, metals, jewelry supplies, potions, magic
 * stones, bags, spells" are all vague categories with no genuinely matching
 * item node in the graph (spells aren't attributable to a specific unnamed
 * vendor without a wiki-sourced list).
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const OLD_ZONE = "zone:erudin";
const NEW_ZONE = "zone:erudin-palace";

const DUPLICATE_PAIRS = [
  ["vendor:erudin-palace:killi-frillep", "vendor:erudin:killi-frillep-palace-magician-guild"],
  ["vendor:erudin-palace:vellenon-harrance", "vendor:erudin:vellenon-harrance-palace-enchanter-guild"],
  ["vendor:erudin-palace:telor-beteria", "vendor:erudin:telor-beteria-palace-magician-guild"],
  ["vendor:erudin-palace:danilla-delucic", "vendor:erudin:danilla-delucic-palace-enchanter-guild"],
  ["vendor:erudin-palace:kestall-tulenci", "vendor:erudin:kestall-tulenci-palace-magician-guild"],
  ["vendor:erudin-palace:estra-nancer", "vendor:erudin:estra-nancer-palace-enchanter-guild"],
  ["vendor:erudin-palace:horacia-garnellia", "vendor:erudin:horacia-garnellia-palace-enchanter-guild"],
  ["vendor:erudin-palace:wistcona", "vendor:erudin:wistcona-palace"],
  ["vendor:erudin-palace:elentar-bealtarik", "vendor:erudin:elentar-bealtarik-palace-enchanter-guild"],
];

const ALL_PALACE_VENDOR_IDS = [
  "vendor:erudin-palace:vellenon-harrance",
  "vendor:erudin-palace:danilla-delucic",
  "vendor:erudin-palace:killi-frillep",
  "vendor:erudin-palace:telor-beteria",
  "vendor:erudin-palace:horacia-garnellia",
  "vendor:erudin-palace:estra-nancer",
  "vendor:erudin-palace:onyssa-vroce",
  "vendor:erudin-palace:tuballi-stellari",
  "vendor:erudin-palace:wistcona",
  "vendor:erudin-palace:pinilla",
  "vendor:erudin-palace:effunic-korett",
  "vendor:erudin-palace:elentar-bealtarik",
  "vendor:erudin-palace:kestall-tulenci",
  "vendor:erudin-palace:gissa-brist",
  "vendor:erudin-palace:barstall-methinon",
];

let droppedDuplicates = 0;
let repointed = 0;
let added = 0;

for (const [, dupId] of DUPLICATE_PAIRS) {
  graph.edges = graph.edges.filter((e: { source: string }) => e.source !== dupId);
  graph.nodes = graph.nodes.filter((n: { id: string }) => n.id !== dupId);
  droppedDuplicates++;
}

for (const id of ALL_PALACE_VENDOR_IDS) {
  const edge = graph.edges.find(
    (e: { source: string; type: string; target: string }) =>
      e.source === id && e.type === "located_in" && e.target === OLD_ZONE
  );
  if (!edge) throw new Error(`expected located_in edge from ${id} to ${OLD_ZONE}`);
  edge.target = NEW_ZONE;
  repointed++;
}

function addNpc(id: string, label: string, roles: string[]) {
  if (hasNode(id)) return;
  addNode({ id, label, type: "npc", roles });
  addEdge(id, NEW_ZONE, "located_in");
  added++;
}

addNpc("npc:erudin-palace:erudin-city-office", "Erudin City Office", ["vendor"]);
addNpc("npc:erudin-palace:sothures-fine-gems", "Sothure's Fine Gems", ["vendor"]);
addNpc("npc:erudin-palace:vials-of-vitality", "Vials of Vitality", ["vendor"]);
addNpc("npc:erudin-palace:tower-of-the-crimson-hands", "Tower of the Crimson Hands", ["vendor"]);

save();
console.log(
  `Migration 349 complete: dropped ${droppedDuplicates} duplicate npc node(s), repointed ${repointed} located_in edge(s) to zone:erudin-palace, added ${added} new npc node(s)`
);
