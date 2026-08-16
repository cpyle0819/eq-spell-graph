/**
 * One-off: resolve 7 of the 31 vendors migrate-vendor-class-spells.ts left
 * on per-spell sells edges. Their real, complete inventories (eqlwiki.com
 * per-NPC pages) weren't reflected in this graph's log-sourced sells
 * edges -- fetching the real lists and cross-checking against this
 * repo's own spell nodes resolves each cleanly. See decisions/
 * class-spell-vendor-model.md for the classification rule (including the
 * combined-coverage variant Guardian Seacly needed).
 */
import { loadGraph } from "./graph-lib";

const { graph, addEdge, hasEdge, slug, save } = loadGraph(import.meta.dir);

const RESOLUTIONS: Record<string, string[]> = {
  "vendor:greater-faydark:hendricks": ["druid", "ranger"],
  "vendor:north-kaladim:tempia-lauley": ["cleric", "paladin"],
  "vendor:new-sebilis-expedition:zealot-zorshais": ["cleric", "paladin"],
  "vendor:skyshrine:zildainez": ["enchanter"],
  "vendor:skyshrine:guardian-seacly": ["magician", "enchanter"],
  "vendor:new-sebilis-expedition:conjuror-matranak": ["magician"],
  "vendor:new-sebilis-expedition:heretic-mkoriku": ["necromancer"],
};

let edgesAdded = 0;
let spellEdgesRemoved = 0;
const removedEdgeIds = new Set<string>();

for (const [vendorId, classes] of Object.entries(RESOLUTIONS)) {
  for (const cls of classes) {
    const classId = `class:${slug(cls)}`;
    if (!hasEdge(vendorId, classId, "sells_spells_for")) {
      addEdge(vendorId, classId, "sells_spells_for");
      edgesAdded++;
    }
  }
  const oldSells = graph.edges.filter(
    (e: { source: string; type: string }) => e.source === vendorId && e.type === "sells"
  );
  for (const e of oldSells) removedEdgeIds.add(e.id);
  spellEdgesRemoved += oldSells.length;
}

graph.edges = graph.edges.filter((e: { id: string }) => !removedEdgeIds.has(e.id));

console.log(`Vendors resolved: ${Object.keys(RESOLUTIONS).length}`);
console.log(`sells_spells_for edges added: ${edgesAdded}`);
console.log(`Old sells->spell edges removed: ${spellEdgesRemoved}`);

save();
