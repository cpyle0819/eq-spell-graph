/**
 * One-off: replace per-spell `npc --sells--> spell` edges with
 * `npc --sells_spells_for--> class` edges for confirmed class spell
 * vendors. See decisions/class-spell-vendor-model.md for the rule
 * (>=5 sold spells AND >=75% class share) and rationale.
 */
import { loadGraph } from "./graph-lib";

const { graph, addNode, addEdge, hasEdge, slug, save } = loadGraph(import.meta.dir);

const CLASS_NAMES = [
  "bard", "beastlord", "cleric", "druid", "enchanter", "magician",
  "necromancer", "paladin", "ranger", "shadow knight", "shaman", "wizard",
];
const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

for (const cls of CLASS_NAMES) {
  addNode({ id: `class:${slug(cls)}`, type: "class", label: titleCase(cls) });
}

const MIN_COUNT = 5;
const MIN_SHARE = 0.75;

const sellsEdges = graph.edges.filter((e: { type: string }) => e.type === "sells");
const spellById = new Map(graph.nodes.filter((n: { type: string }) => n.type === "spell").map((n: { id: string }) => [n.id, n]));

const byVendor = new Map<string, { edgeId: string; spell: any }[]>();
for (const e of sellsEdges) {
  const spell = spellById.get(e.target);
  if (!spell) continue;
  if (!byVendor.has(e.source)) byVendor.set(e.source, []);
  byVendor.get(e.source)!.push({ edgeId: e.id, spell });
}

let vendorsAssigned = 0;
let classEdgesAdded = 0;
let spellEdgesRemoved = 0;
const removedEdgeIds = new Set<string>();
const assignedSummary: { vendor: string; classes: string[] }[] = [];

for (const [vendorId, entries] of byVendor) {
  const counts = new Map<string, number>();
  for (const { spell } of entries) {
    for (const cl of spell.class_levels ?? []) {
      counts.set(cl.class, (counts.get(cl.class) ?? 0) + 1);
    }
  }
  const total = entries.length;
  const qualifying = [...counts.entries()]
    .filter(([, count]) => count >= MIN_COUNT && count / total >= MIN_SHARE)
    .map(([cls]) => cls);

  if (qualifying.length === 0) continue;

  vendorsAssigned++;
  for (const cls of qualifying) {
    const classId = `class:${slug(cls)}`;
    if (!hasEdge(vendorId, classId, "sells_spells_for")) {
      addEdge(vendorId, classId, "sells_spells_for");
      classEdgesAdded++;
    }
  }
  for (const { edgeId } of entries) removedEdgeIds.add(edgeId);
  spellEdgesRemoved += entries.length;

  const vendorNode = graph.nodes.find((n: { id: string }) => n.id === vendorId);
  assignedSummary.push({ vendor: vendorNode?.label ?? vendorId, classes: qualifying });
}

graph.edges = graph.edges.filter((e: { id: string }) => !removedEdgeIds.has(e.id));

console.log(`Vendors assigned a class edge: ${vendorsAssigned}`);
console.log(`sells_spells_for edges added: ${classEdgesAdded}`);
console.log(`Old sells->spell edges removed: ${spellEdgesRemoved}`);
console.log(`Vendors left on per-spell sells edges: ${byVendor.size - vendorsAssigned}`);

save();
