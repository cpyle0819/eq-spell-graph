/**
 * Graph data access layer — Schema v2.
 *
 * Node types: spell, npc, zone (extensible: quest, item, etc.)
 * Edge types: sells, located_in, connects_to (extensible: starts_at, rewards, requires)
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

export interface ClassLevel {
  class: string;
  level: number;
}

export interface NodeData {
  id: string;
  label: string;
  type: string;
  class_levels?: ClassLevel[];
  roles?: string[];
  [key: string]: unknown;
}

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  type: string;
  transport?: "boat";
}

export interface SpellDetails {
  description?: string;
  mana?: number;
  skill?: string;
  castTime?: number;
  recastTime?: number;
  fizzleTime?: number;
  duration?: string;
  targetType?: string;
  spellType?: string;
  resist?: string;
  range?: number;
}

export interface GraphData {
  nodes: { data: NodeData }[];
  edges: { data: EdgeData }[];
}

const DATA_PATH = resolve(import.meta.dir, "../data/graph.json");

function load(): GraphData {
  return JSON.parse(readFileSync(DATA_PATH, "utf-8"));
}

function save(graph: GraphData): void {
  writeFileSync(DATA_PATH, JSON.stringify(graph, null, 2));
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function nextEdgeId(graph: GraphData, prefix: string): string {
  return `${prefix}-${graph.edges.length + 1}-${Date.now().toString(36)}`;
}

// --- Reads ---

export function getGraph(): GraphData {
  return load();
}

export function getNode(id: string): NodeData | undefined {
  return load().nodes.find((n) => n.data.id === id)?.data;
}

export function findNodes(filter: Record<string, unknown>): NodeData[] {
  const graph = load();
  return graph.nodes
    .filter((n) => Object.entries(filter).every(([k, v]) => n.data[k] === v))
    .map((n) => n.data);
}

export function getSpellsForClass(className: string, levels?: number[]): NodeData[] {
  const graph = load();
  return graph.nodes
    .filter((n) => {
      if (n.data.type !== "spell" || !n.data.class_levels) return false;
      return n.data.class_levels.some(
        (cl) => cl.class === className && (!levels || levels.includes(cl.level))
      );
    })
    .map((n) => n.data);
}

export function getVendorsForSpell(spellId: string): { npc: NodeData; zone: NodeData | undefined }[] {
  const graph = load();
  const sellsEdges = graph.edges.filter(
    (e) => e.data.type === "sells" && e.data.target === spellId
  );
  return sellsEdges.map((e) => {
    const npc = graph.nodes.find((n) => n.data.id === e.data.source)!.data;
    const locEdge = graph.edges.find(
      (le) => le.data.type === "located_in" && le.data.source === npc.id
    );
    const zone = locEdge
      ? graph.nodes.find((n) => n.data.id === locEdge.data.target)?.data
      : undefined;
    return { npc, zone };
  });
}

interface AdjEntry { zoneId: string; transport?: "boat"; }

export function getZoneAdjacency(): Map<string, AdjEntry[]> {
  const graph = load();
  const adj = new Map<string, AdjEntry[]>();
  for (const e of graph.edges) {
    if (e.data.type !== "connects_to") continue;
    if (!adj.has(e.data.source)) adj.set(e.data.source, []);
    const entry: AdjEntry = { zoneId: e.data.target };
    if (e.data.transport === "boat") entry.transport = "boat";
    adj.get(e.data.source)!.push(entry);
  }
  return adj;
}

interface PathStep { zoneId: string; via?: "boat"; }

export interface RouteStep { name: string; via?: "boat"; }

export function shortestPath(fromZoneId: string, toZoneId: string): PathStep[] | null {
  if (fromZoneId === toZoneId) return [{ zoneId: fromZoneId }];
  const adj = getZoneAdjacency();
  const parent = new Map<string, { from: string; via?: "boat" }>([[fromZoneId, { from: "" }]]);
  const queue = [fromZoneId];
  while (queue.length > 0) {
    const z = queue.shift()!;
    for (const { zoneId: neighbor, transport } of adj.get(z) || []) {
      if (!parent.has(neighbor)) {
        parent.set(neighbor, { from: z, via: transport });
        if (neighbor === toZoneId) {
          const path: PathStep[] = [];
          let cur: string = neighbor;
          while (cur !== "") {
            const p = parent.get(cur)!;
            path.unshift({ zoneId: cur, ...(p.via ? { via: p.via } : {}) });
            cur = p.from;
          }
          return path;
        }
        queue.push(neighbor);
      }
    }
  }
  return null;
}

export type FactionStanding = "safe" | "neutral" | "wont_sell" | "kos";

const STANDING_SEVERITY: Record<FactionStanding, number> = { safe: 0, neutral: 1, wont_sell: 2, kos: 3 };

function worstStanding(...standings: FactionStanding[]): FactionStanding {
  return standings.reduce((worst, s) =>
    STANDING_SEVERITY[s] > STANDING_SEVERITY[worst] ? s : worst
  , "safe");
}

export interface SpellVendorInfo extends SpellDetails {
  id: string;
  name: string;
  classes: { cls: string; level: number }[];
  vendors: string[];
}

export interface ZoneRanking {
  zoneId: string;
  zoneName: string;
  hops: number | null;
  route: RouteStep[];
  faction: FactionStanding;
  spells: SpellVendorInfo[];
  score: number;
}

export function rankZones(
  classNames: string[],
  levels: number[],
  currentZoneId: string,
  race?: string,
  primaryClass?: string,
  deity?: string,
  specificSpellIds?: string[],
  specificZoneIds?: string[]
): ZoneRanking[] {
  const graph = load();

  // Step 1 — start with all purchasable spells
  let candidates = graph.nodes.filter((n) => n.data.type === "spell" && n.data.class_levels);

  // Step 2 — narrow by class (if any selected)
  if (classNames.length > 0) {
    candidates = candidates.filter((n) =>
      n.data.class_levels!.some((cl) => classNames.includes(cl.class))
    );
  }

  // Step 3 — narrow to specific spells (if any pinned)
  if (specificSpellIds?.length) {
    const idSet = new Set(specificSpellIds);
    candidates = candidates.filter((n) => idSet.has(n.data.id));
  }

  const zoneSpells = new Map<string, SpellVendorInfo[]>();

  function addSpellToZones(spell: { data: NodeData }, matchingClasses: { cls: string; level: number }[]) {
    if (!matchingClasses.length) return;
    const sellers = graph.edges.filter((e) => e.data.type === "sells" && e.data.target === spell.data.id);
    for (const seller of sellers) {
      const npcNode = graph.nodes.find((n) => n.data.id === seller.data.source);
      const locEdge = graph.edges.find((e) => e.data.type === "located_in" && e.data.source === seller.data.source);
      if (!locEdge || !npcNode) continue;
      const zoneId = locEdge.data.target;
      if (!zoneSpells.has(zoneId)) zoneSpells.set(zoneId, []);
      const existing = zoneSpells.get(zoneId)!;
      const entry = existing.find((s) => s.id === spell.data.id);
      if (entry) {
        if (!entry.vendors.includes(npcNode.data.label)) entry.vendors.push(npcNode.data.label);
      } else {
        const d = spell.data;
        const details: SpellDetails = {};
        for (const k of ["description","mana","skill","castTime","recastTime","fizzleTime","duration","targetType","spellType","resist","range"] as const) {
          if (d[k] !== undefined) (details as Record<string, unknown>)[k] = d[k];
        }
        existing.push({ id: d.id, name: d.label, classes: matchingClasses, vendors: [npcNode.data.label], ...details });
      }
    }
  }

  // Step 4 — apply level filter per-spell and map to vendor zones
  for (const spell of candidates) {
    const matchingClasses = classNames.length > 0
      ? spell.data.class_levels!
          .filter((cl) => classNames.includes(cl.class) && levels.includes(cl.level))
          .map((cl) => ({ cls: cl.class, level: cl.level }))
      : spell.data.class_levels!
          .filter((cl) => levels.includes(cl.level))
          .map((cl) => ({ cls: cl.class, level: cl.level }));
    addSpellToZones(spell, matchingClasses);
  }

  // Step 5 — narrow to specific zones (if any pinned)
  if (specificZoneIds?.length) {
    const zoneSet = new Set(specificZoneIds);
    for (const zoneId of zoneSpells.keys()) {
      if (!zoneSet.has(zoneId)) zoneSpells.delete(zoneId);
    }
  }

  // Rank with split faction awareness
  const rankings: ZoneRanking[] = [];
  for (const [zoneId, spells] of zoneSpells) {
    const zoneNode = graph.nodes.find((n) => n.data.id === zoneId);
    const pathIds = shortestPath(currentZoneId, zoneId);
    const hops = pathIds ? pathIds.length - 1 : null;
    const route: RouteStep[] = pathIds
      ? pathIds.map((step) => {
          const n = graph.nodes.find((n) => n.data.id === step.zoneId);
          const entry: RouteStep = { name: n?.data.label || step.zoneId };
          if (step.via) entry.via = step.via;
          return entry;
        })
      : [];

    // Resolve faction from race, class, deity dimensions
    let faction: FactionStanding = "neutral";
    if (zoneNode?.data.faction) {
      const zf = zoneNode.data.faction as { race?: Record<string, FactionStanding>; class?: Record<string, FactionStanding>; deity?: Record<string, FactionStanding> };
      const raceStanding: FactionStanding = (race && zf.race?.[race]) || "neutral";
      const classStanding: FactionStanding = (primaryClass && zf.class?.[primaryClass]) || "safe";
      const deityStanding: FactionStanding = (deity && zf.deity?.[deity]) || "neutral";
      faction = worstStanding(raceStanding, classStanding, deityStanding);
    }

    let score: number;
    if (faction === "kos") {
      score = -2;
    } else if (faction === "wont_sell") {
      score = -1;
    } else {
      const factionMultiplier = faction === "safe" ? 1 : 0.5;
      score = hops !== null && hops > 0
        ? (spells.length / hops) * factionMultiplier
        : spells.length * 100 * factionMultiplier;
    }

    rankings.push({
      zoneId,
      zoneName: zoneNode?.data.label || zoneId,
      hops,
      route,
      faction,
      spells: spells.sort((a, b) => Math.min(...a.classes.map(c => c.level)) - Math.min(...b.classes.map(c => c.level))),
      score,
    });
  }

  return rankings.sort((a, b) => {
    if (STANDING_SEVERITY[a.faction] !== STANDING_SEVERITY[b.faction]) {
      return STANDING_SEVERITY[a.faction] - STANDING_SEVERITY[b.faction];
    }
    return b.score - a.score;
  });
}

// --- Writes ---

export function addSpell(name: string, classLevels: ClassLevel[]): NodeData {
  const graph = load();
  const id = `spell:${slugify(name)}`;
  if (graph.nodes.some((n) => n.data.id === id)) {
    throw new Error(`Spell already exists: ${id}`);
  }
  const data: NodeData = { id, label: name, type: "spell", class_levels: classLevels };
  graph.nodes.push({ data });
  save(graph);
  return data;
}

export function addZone(name: string): NodeData {
  const graph = load();
  const id = `zone:${slugify(name)}`;
  const existing = graph.nodes.find((n) => n.data.id === id);
  if (existing) return existing.data;
  const data: NodeData = { id, label: name, type: "zone" };
  graph.nodes.push({ data });
  save(graph);
  return data;
}

export function addNpc(name: string, zoneName: string, roles: string[] = ["vendor"]): NodeData {
  const graph = load();
  const zoneId = `zone:${slugify(zoneName)}`;
  const npcId = `npc:${slugify(zoneName)}:${slugify(name)}`;

  if (!graph.nodes.some((n) => n.data.id === zoneId)) {
    graph.nodes.push({ data: { id: zoneId, label: zoneName, type: "zone" } });
  }

  if (!graph.nodes.some((n) => n.data.id === npcId)) {
    const data: NodeData = { id: npcId, label: name, type: "npc", roles };
    graph.nodes.push({ data });
    graph.edges.push({
      data: { id: nextEdgeId(graph, "e-loc"), source: npcId, target: zoneId, type: "located_in" },
    });
    save(graph);
    return data;
  }

  return graph.nodes.find((n) => n.data.id === npcId)!.data;
}

export function addSellsEdge(npcId: string, spellId: string): EdgeData {
  const graph = load();
  if (!graph.nodes.some((n) => n.data.id === npcId)) throw new Error(`NPC not found: ${npcId}`);
  if (!graph.nodes.some((n) => n.data.id === spellId)) throw new Error(`Spell not found: ${spellId}`);

  const existing = graph.edges.find(
    (e) => e.data.source === npcId && e.data.target === spellId && e.data.type === "sells"
  );
  if (existing) return existing.data;

  const data: EdgeData = { id: nextEdgeId(graph, "e-sells"), source: npcId, target: spellId, type: "sells" };
  graph.edges.push({ data });
  save(graph);
  return data;
}

export function addConnectsTo(zoneA: string, zoneB: string): void {
  const graph = load();
  const idA = `zone:${slugify(zoneA)}`;
  const idB = `zone:${slugify(zoneB)}`;

  for (const id of [idA, idB]) {
    if (!graph.nodes.some((n) => n.data.id === id)) {
      const label = id === idA ? zoneA : zoneB;
      graph.nodes.push({ data: { id, label, type: "zone" } });
    }
  }

  const hasAB = graph.edges.some(
    (e) => e.data.type === "connects_to" && e.data.source === idA && e.data.target === idB
  );
  const hasBA = graph.edges.some(
    (e) => e.data.type === "connects_to" && e.data.source === idB && e.data.target === idA
  );

  if (!hasAB) graph.edges.push({ data: { id: nextEdgeId(graph, "e-conn"), source: idA, target: idB, type: "connects_to" } });
  if (!hasBA) graph.edges.push({ data: { id: nextEdgeId(graph, "e-conn"), source: idB, target: idA, type: "connects_to" } });
  save(graph);
}

export function removeNode(id: string): boolean {
  const graph = load();
  const idx = graph.nodes.findIndex((n) => n.data.id === id);
  if (idx === -1) return false;
  graph.nodes.splice(idx, 1);
  graph.edges = graph.edges.filter((e) => e.data.source !== id && e.data.target !== id);
  save(graph);
  return true;
}

export function updateNode(id: string, updates: Partial<NodeData>): NodeData | undefined {
  const graph = load();
  const node = graph.nodes.find((n) => n.data.id === id);
  if (!node) return undefined;
  Object.assign(node.data, updates);
  node.data.id = id;
  save(graph);
  return node.data;
}

export function stats() {
  const graph = load();
  const byType = (t: string) => graph.nodes.filter((n) => n.data.type === t).length;
  const edgeByType = (t: string) => graph.edges.filter((e) => e.data.type === t).length;
  return {
    nodes: { spells: byType("spell"), npcs: byType("npc"), zones: byType("zone") },
    edges: { sells: edgeByType("sells"), located_in: edgeByType("located_in"), connects_to: edgeByType("connects_to") },
  };
}
