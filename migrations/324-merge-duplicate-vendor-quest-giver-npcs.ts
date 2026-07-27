/**
 * Migration 324: fixes issue #41's "duplicate NPC labels" flags for Erudin,
 * Rivervale, Thurgadin, and West Cabilis. Each is the same root cause: a
 * vendor NPC (`vendor:<zone>:<slug>`) later got a quest role added via a
 * *new* `npc:<zone>:<slug>` node instead of a `quest_giver` role merged onto
 * the existing vendor node -- same physical NPC, two graph nodes.
 *
 * Fix: merge `quest_giver` into the vendor node's `roles`, repoint every
 * `starts` edge from the `npc:` node onto the `vendor:` node, drop the
 * `npc:` node's redundant `located_in` edge, then delete the `npc:` node.
 */

import { loadGraph } from "./_lib";

const { graph, updateNode, save } = loadGraph(import.meta.dir);

const PAIRS = [
  ["vendor:west-cabilis:keeper-bile", "npc:west-cabilis:keeper-bile"],
  ["vendor:west-cabilis:keeper-rott", "npc:west-cabilis:keeper-rott"],
  ["vendor:west-cabilis:keeper-pain", "npc:west-cabilis:keeper-pain"],
  ["vendor:rivervale:ilscent-tagglefoot", "npc:rivervale:ilscent-tagglefoot"],
  ["vendor:thurgadin:lorekeeper-brita", "npc:thurgadin:lorekeeper-brita"],
  ["vendor:thurgadin:lorekeeper-zorik", "npc:thurgadin:lorekeeper-zorik"],
  ["vendor:thurgadin:loremaster-dorinan", "npc:thurgadin:loremaster-dorinan"],
  ["vendor:erudin:weltria-ostriss", "npc:erudin:weltria-ostriss"],
];

let mergedNodes = 0;
let repointedEdges = 0;
let droppedEdges = 0;

for (const [vendorId, npcId] of PAIRS) {
  const vendorNode = graph.nodes.find((n: { id: string }) => n.id === vendorId);
  if (!vendorNode) throw new Error(`missing vendor node: ${vendorId}`);

  if (!vendorNode.roles.includes("quest_giver")) {
    updateNode(vendorId, { roles: [...vendorNode.roles, "quest_giver"] });
  }

  for (const edge of graph.edges) {
    if (edge.source !== npcId) continue;
    if (edge.type === "located_in") {
      edge._drop = true;
      droppedEdges++;
    } else {
      edge.source = vendorId;
      repointedEdges++;
    }
  }

  graph.edges = graph.edges.filter((e: { _drop?: boolean }) => !e._drop);
  graph.nodes = graph.nodes.filter((n: { id: string }) => n.id !== npcId);
  mergedNodes++;
}

save();
console.log(
  `Migration 324 complete: merged ${mergedNodes} duplicate npc/vendor pairs, repointed ${repointedEdges} edges, dropped ${droppedEdges} redundant located_in edges`
);
