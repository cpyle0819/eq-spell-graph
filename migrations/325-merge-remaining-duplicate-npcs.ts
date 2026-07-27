/**
 * Migration 325: clears the remaining "duplicate NPC labels" flags from
 * issue #41 (the ones migration 324 didn't cover).
 *
 * Three root causes, same fix shape (merge onto a canonical node, repoint
 * every non-`located_in` edge, drop the duplicate's `located_in` edge, then
 * delete the duplicate node):
 *
 * 1. Vendor split across two node ids using different zone-slug conventions
 *    for the same zone (e.g. `vendor:kelethin:*` vs `vendor:greater-faydark:*`
 *    -- "kelethin" etc. never exist as zone nodes, see decisions/zone-naming-mismatches.md).
 *    Each half sold a different slice of the same vendor's spell list.
 * 2. An attackable quest-giver got a `mob:`/`npc:` node for combat stats and
 *    a separate `npc:` node for its `quest_giver` role instead of one node
 *    with both roles (Narex T`Vem and Noxhil V`Sek already show the correct
 *    merged shape elsewhere in the graph -- this brings the rest in line).
 * 3. Innothule Swamp's Stragak: a `vendor:` node and a `mob:` node for the
 *    same named mob-that-also-sells-spells.
 *
 * Verified each pair's alternate zone-slug doesn't exist as a real zone node,
 * and that no edge in the graph targets any duplicate id, before merging.
 * Plane of Mischief's two "Lithiniath" nodes and Crystal Caverns' four "?"
 * vendor nodes were checked too and are NOT duplicates (confirmed against
 * eqlwiki.com: Lithiniath has genuine distinct black/white versions; the "?"
 * NPCs are four distinct unnamed merchants), so they're left alone.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

type GNode = { id: string; roles?: string[]; minLevel?: number; maxLevel?: number; [k: string]: unknown };
type GEdge = { id: string; source: string; target: string; type: string; [k: string]: unknown };

const nodeById = new Map<string, GNode>((graph.nodes as GNode[]).map((n) => [n.id, n]));

const MERGES: Array<{ canonical: string; duplicate: string }> = [
  // Vendor/vendor split-spell-list pairs (stale zone-slug convention)
  { canonical: "vendor:greater-faydark:beleth-streamfoot", duplicate: "vendor:kelethin:beleth-streamfoot" },
  { canonical: "vendor:greater-faydark:zelli-starsfire", duplicate: "vendor:kelethin:zelli-starsfire" },
  { canonical: "vendor:south-qeynos:corrao-duperame", duplicate: "vendor:qeynos-south:corrao-duperame" },
  { canonical: "vendor:southern-felwithe:seren-the-swift", duplicate: "vendor:felwithe-south:seren-the-swift" },
  { canonical: "vendor:west-freeport:lasiris-oncre", duplicate: "vendor:freeport-west:lasiris-oncre" },
  { canonical: "vendor:north-kaladim:zeffan-holdsman", duplicate: "vendor:northern-kaladim:zeffan-holdsman" },
  { canonical: "vendor:north-kaladim:duppa-pickstone", duplicate: "vendor:kaladim:duppa-pickstone" },
  { canonical: "vendor:north-kaladim:dorlita-splitshield", duplicate: "vendor:kaladim:dorlita-splitshield" },
  { canonical: "vendor:north-kaladim:poriss-splitrock", duplicate: "vendor:kaladim:poriss-splitrock" },
  { canonical: "vendor:the-overthere:kuglaz-grot", duplicate: "vendor:overthere:kuglaz-grot" },

  // Attackable quest-giver: mob/npc node + separate quest_giver-only node
  { canonical: "npc:the-overthere:slicia-j-singe", duplicate: "npc:the-overthere:slicia-jsinge" },
  { canonical: "npc:the-overthere:siladdarae-n-riese", duplicate: "npc:the-overthere:siladdarae-nriese" },
  { canonical: "mob:neriak-foreign-quarter:x-ta-tempi", duplicate: "npc:neriak-foreign-quarter:xta-tempi" },
  { canonical: "mob:neriak-foreign-quarter:x-ta-timpi", duplicate: "npc:neriak-foreign-quarter:xta-timpi" },
  { canonical: "mob:neriak-foreign-quarter:x-ta-tompi", duplicate: "npc:neriak-foreign-quarter:xta-tompi" },
  { canonical: "npc:neriak-commons:narex-t-vem", duplicate: "npc:neriak-commons:narex-tvem" },
  { canonical: "mob:neriak-commons:trizam-n-tan", duplicate: "npc:neriak-commons:trizam-ntan" },
  { canonical: "mob:neriak-commons:gath-n-mare", duplicate: "npc:neriak-commons:gath-nmare" },
  { canonical: "mob:neriak-commons:vexia-d-ynth", duplicate: "npc:neriak-commons:vexia-dynth" },
  { canonical: "mob:neriak-commons:yegek-b-larin", duplicate: "npc:neriak-commons:yegek-blarin" },
  { canonical: "npc:neriak-3rd-gate:noxhil-v-sek", duplicate: "npc:neriak-3rd-gate:noxhil-vsek" },
  { canonical: "mob:neriak-3rd-gate:hekzin-g-zule", duplicate: "npc:neriak-3rd-gate:hekzin-gzule" },
  { canonical: "mob:neriak-3rd-gate:eolorn-j-axx", duplicate: "npc:neriak-3rd-gate:eolorn-jaxx" },
  { canonical: "mob:neriak-3rd-gate:loveal-s-nez", duplicate: "npc:neriak-3rd-gate:loveal-snez" },
  { canonical: "mob:rathe-mountains:kazzel-d-leryt", duplicate: "npc:rathe-mountains:kazzel-dleryt" },
  { canonical: "npc:skyshrine:umykith-fe-dhar", duplicate: "npc:skyshrine:umykith-fedhar" },
  { canonical: "npc:skyshrine:fardonad-fe-dhar", duplicate: "npc:skyshrine:fardonad-fedhar" },
  { canonical: "npc:skyshrine:crendatha-fe-dhar", duplicate: "npc:skyshrine:crendatha-fedhar" },
  { canonical: "npc:skyshrine:onerind-fe-dhar", duplicate: "npc:skyshrine:onerind-fedhar" },
  { canonical: "npc:skyshrine:asteinnon-fe-dhar", duplicate: "npc:skyshrine:asteinnon-fedhar" },
  { canonical: "npc:skyshrine:jendavudd-fe-dhar", duplicate: "npc:skyshrine:jendavudd-fedhar" },
  { canonical: "npc:skyshrine:elaend-fe-dhar", duplicate: "npc:skyshrine:elaend-fedhar" },
  { canonical: "npc:skyshrine:qynydd-fe-dhar", duplicate: "npc:skyshrine:qynydd-fedhar" },
  { canonical: "npc:skyshrine:lothieder-fe-dhar", duplicate: "npc:skyshrine:lothieder-fedhar" },
  { canonical: "npc:skyshrine:ocoenydd-fe-dhar", duplicate: "npc:skyshrine:ocoenydd-fedhar" },
  { canonical: "npc:skyshrine:nalelin-fe-dhar", duplicate: "npc:skyshrine:nalelin-fedhar" },
  { canonical: "npc:skyshrine:abudan-fe-dhar", duplicate: "npc:skyshrine:abudan-fedhar" },
  { canonical: "mob:chardok:queen-velazul-di-zok", duplicate: "npc:chardok:queen-velazul-dizok" },
  { canonical: "npc:icewell-keep:seneschal-aldikar-icewell-keep", duplicate: "npc:icewell-keep:seneschal-aldikar" },
  { canonical: "npc:plane-of-mischief:peachy-d-vicci", duplicate: "npc:plane-of-mischief:peachy-dvicci" },

  // Named mob that's also a spell vendor
  { canonical: "vendor:innothule-swamp:stragak", duplicate: "mob:innothule-swamp:stragak" },
];

let mergedNodes = 0;
let repointedEdges = 0;
let droppedDupeEdges = 0;
let droppedLocatedInEdges = 0;

for (const { canonical, duplicate } of MERGES) {
  const canonicalNode = nodeById.get(canonical);
  const duplicateNode = nodeById.get(duplicate);
  if (!canonicalNode) throw new Error(`missing canonical node: ${canonical}`);
  if (!duplicateNode) throw new Error(`missing duplicate node: ${duplicate}`);

  const roles = new Set(canonicalNode.roles ?? []);
  for (const role of duplicateNode.roles ?? []) roles.add(role);
  canonicalNode.roles = [...roles];

  if (canonicalNode.minLevel === undefined && duplicateNode.minLevel !== undefined) {
    canonicalNode.minLevel = duplicateNode.minLevel;
    canonicalNode.maxLevel = duplicateNode.maxLevel;
  }

  for (const edge of graph.edges as GEdge[]) {
    if (edge.source !== duplicate) continue;
    if (edge.type === "located_in") {
      edge._drop = true;
      droppedLocatedInEdges++;
    } else if (
      (graph.edges as GEdge[]).some(
        (e) => e !== edge && e.source === canonical && e.type === edge.type && e.target === edge.target
      )
    ) {
      edge._drop = true;
      droppedDupeEdges++;
    } else {
      edge.source = canonical;
      repointedEdges++;
    }
  }

  graph.edges = (graph.edges as GEdge[]).filter((e) => !e._drop);
  graph.nodes = (graph.nodes as GNode[]).filter((n) => n.id !== duplicate);
  mergedNodes++;
}

save();
console.log(
  `Migration 325 complete: merged ${mergedNodes} duplicate node pairs, repointed ${repointedEdges} edges, ` +
    `dropped ${droppedDupeEdges} redundant duplicate edges, dropped ${droppedLocatedInEdges} redundant located_in edges`
);
