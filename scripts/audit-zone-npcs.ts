/**
 * Audit zone <-> npc data for shape anomalies -- ad hoc script, not a migration.
 * Run: bun run scripts/audit-zone-npcs.ts
 */

import graph from "../data/graph.json";

type Node = { id: string; type: string; label: string; zoneType?: string; roles?: string[] };
type Edge = { id: string; source: string; target: string; type: string };

const nodes = graph.nodes as Node[];
const edges = graph.edges as Edge[];

const zones = nodes.filter((n) => n.type === "zone");
const npcById = new Map(nodes.filter((n) => n.type === "npc").map((n) => [n.id, n]));

const npcsByZone = new Map<string, Node[]>();
for (const e of edges) {
  if (e.type !== "located_in") continue;
  const npc = npcById.get(e.source);
  if (!npc) continue;
  const list = npcsByZone.get(e.target) ?? [];
  list.push(npc);
  npcsByZone.set(e.target, list);
}

function roleCounts(npcs: Node[]) {
  const counts = { mob: 0, vendor: 0, quest_giver: 0, guard: 0, guildmaster: 0, banker: 0 };
  for (const n of npcs) {
    for (const r of n.roles ?? []) {
      if (r in counts) (counts as any)[r]++;
    }
  }
  return counts;
}

type Flag = { zone: string; zoneType: string; severity: "high" | "med"; message: string };
const flags: Flag[] = [];

for (const zone of zones) {
  const npcs = npcsByZone.get(zone.id) ?? [];
  const total = npcs.length;
  const c = roleCounts(npcs);
  const zt = zone.zoneType ?? "(unknown)";

  // No NPCs at all
  if (total === 0) {
    flags.push({ zone: zone.label, zoneType: zt, severity: "high", message: "0 NPCs of any kind" });
    continue;
  }

  // Only 1 NPC for the whole zone
  if (total === 1) {
    flags.push({ zone: zone.label, zoneType: zt, severity: "high", message: `only 1 NPC total (${npcs[0].label})` });
  }

  // Dungeons with no mobs
  if (zt === "dungeon" && c.mob === 0) {
    flags.push({ zone: zone.label, zoneType: zt, severity: "high", message: "dungeon with 0 mobs" });
  }

  // Open world zones with no mobs
  if (zt === "open_world" && c.mob === 0) {
    flags.push({ zone: zone.label, zoneType: zt, severity: "high", message: "open-world zone with 0 mobs" });
  }

  // Cities with an unusually large mob count (cities should be mostly safe)
  if (zt === "city" && c.mob > 15) {
    flags.push({ zone: zone.label, zoneType: zt, severity: "med", message: `city with ${c.mob} mobs (expected mostly vendors/guards)` });
  }

  // Cities with zero vendors -- suspicious, cities exist to sell things
  if (zt === "city" && c.vendor === 0) {
    flags.push({ zone: zone.label, zoneType: zt, severity: "high", message: "city with 0 vendors" });
  }

  // Dungeons/open-world with a suspiciously low mob count relative to total NPC count
  if ((zt === "dungeon" || zt === "open_world") && total >= 5 && c.mob > 0 && c.mob / total < 0.2) {
    flags.push({
      zone: zone.label,
      zoneType: zt,
      severity: "med",
      message: `low mob ratio: ${c.mob}/${total} NPCs are mobs`,
    });
  }

  // Any zone with zero guards and zero mobs but has vendors (possible missing hostile data)
  if (c.mob === 0 && c.guard === 0 && c.vendor > 0 && zt !== "city") {
    flags.push({
      zone: zone.label,
      zoneType: zt,
      severity: "med",
      message: `no mobs or guards, only vendors (${c.vendor})`,
    });
  }

  // Duplicate-looking NPC labels within the same zone (possible dupe data entry)
  const labelCounts = new Map<string, number>();
  for (const n of npcs) labelCounts.set(n.label, (labelCounts.get(n.label) ?? 0) + 1);
  for (const [label, count] of labelCounts) {
    if (count > 1) {
      flags.push({ zone: zone.label, zoneType: zt, severity: "med", message: `duplicate NPC label "${label}" appears ${count} times` });
    }
  }
}

// Zones with no `located_in` edges pointing at them at all vs zones missing from graph entirely
const zoneIds = new Set(zones.map((z) => z.id));
const referencedZoneIds = new Set(edges.filter((e) => e.type === "located_in").map((e) => e.target));
for (const id of zoneIds) {
  if (!referencedZoneIds.has(id)) {
    const z = zones.find((z) => z.id === id)!;
    // already caught by the total === 0 check above, skip duplicate reporting
  }
}

flags.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "high" ? -1 : 1));

console.log(`Audited ${zones.length} zones, ${npcById.size} npcs, ${edges.filter((e) => e.type === "located_in").length} located_in edges\n`);
console.log(`${flags.length} flags:\n`);
for (const f of flags) {
  console.log(`[${f.severity.toUpperCase()}] ${f.zone} (${f.zoneType}): ${f.message}`);
}
