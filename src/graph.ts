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

export function getZoneAdjacency(): Map<string, string[]> {
  const graph = load();
  const adj = new Map<string, string[]>();
  for (const e of graph.edges) {
    if (e.data.type !== "connects_to") continue;
    if (!adj.has(e.data.source)) adj.set(e.data.source, []);
    adj.get(e.data.source)!.push(e.data.target);
  }
  return adj;
}

export function shortestPath(fromZoneId: string, toZoneId: string): number | null {
  if (fromZoneId === toZoneId) return 0;
  const adj = getZoneAdjacency();
  const visited = new Set<string>([fromZoneId]);
  let queue = [fromZoneId];
  let hops = 0;
  while (queue.length > 0) {
    hops++;
    const next: string[] = [];
    for (const z of queue) {
      for (const neighbor of adj.get(z) || []) {
        if (neighbor === toZoneId) return hops;
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          next.push(neighbor);
        }
      }
    }
    queue = next;
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

export interface SpellVendorInfo {
  id: string;
  name: string;
  level: number;
  vendors: string[];
}

export interface ZoneRanking {
  zoneId: string;
  zoneName: string;
  hops: number | null;
  faction: FactionStanding;
  spells: SpellVendorInfo[];
  score: number;
}

export function rankZones(
  className: string,
  levels: number[],
  currentZoneId: string,
  race?: string,
  primaryClass?: string,
  deity?: string
): ZoneRanking[] {
  const graph = load();

  // Find all spells needed
  const neededSpells = graph.nodes.filter((n) => {
    if (n.data.type !== "spell" || !n.data.class_levels) return false;
    return n.data.class_levels.some(
      (cl) => cl.class === className && levels.includes(cl.level)
    );
  });

  // For each spell, find which zones sell it and which vendors in that zone
  const zoneSpells = new Map<string, SpellVendorInfo[]>();
  for (const spell of neededSpells) {
    const sellers = graph.edges.filter(
      (e) => e.data.type === "sells" && e.data.target === spell.data.id
    );
    for (const seller of sellers) {
      const npcNode = graph.nodes.find((n) => n.data.id === seller.data.source);
      const locEdge = graph.edges.find(
        (e) => e.data.type === "located_in" && e.data.source === seller.data.source
      );
      if (!locEdge || !npcNode) continue;
      const zoneId = locEdge.data.target;
      if (!zoneSpells.has(zoneId)) zoneSpells.set(zoneId, []);
      const level = spell.data.class_levels!.find(
        (cl) => cl.class === className && levels.includes(cl.level)
      )!.level;
      const existing = zoneSpells.get(zoneId)!;
      const entry = existing.find((s) => s.id === spell.data.id);
      if (entry) {
        if (!entry.vendors.includes(npcNode.data.label)) {
          entry.vendors.push(npcNode.data.label);
        }
      } else {
        existing.push({ id: spell.data.id, name: spell.data.label, level, vendors: [npcNode.data.label] });
      }
    }
  }

  // Rank with split faction awareness
  const rankings: ZoneRanking[] = [];
  for (const [zoneId, spells] of zoneSpells) {
    const zoneNode = graph.nodes.find((n) => n.data.id === zoneId);
    const hops = shortestPath(currentZoneId, zoneId);

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
      faction,
      spells: spells.sort((a, b) => a.level - b.level),
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
