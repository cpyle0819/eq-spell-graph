/**
 * Graph data access layer — Schema v2.
 *
 * Node types: spell, npc, zone (extensible: quest, item, etc.)
 * Edge types: sells, located_in, connects_to (extensible: starts_at, rewards, requires)
 */

import { readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

// import.meta.dir is Bun-specific; this equivalent works under both Bun and
// the Node.js runtime the Lambda deployment bundles against.
const __dirname = dirname(fileURLToPath(import.meta.url));

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

export type Transport = "boat" | "translocator";

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  type: string;
  transport?: Transport;
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

const DATA_PATH = resolve(__dirname, "../data/graph.json");

// graph.json is 2MB+, and load() gets called many times per request —
// once directly in rankZones(), then again inside shortestPath() for every
// candidate zone. Caching the parsed result for the life of the process
// keeps that at one disk read + parse per process instead of dozens per
// request. save() invalidates the cache (and the index below); mutation
// routes are local-dev-only, so staying in sync with a single writer is fine.
let cachedGraph: GraphData | null = null;

function load(): GraphData {
  if (!cachedGraph) {
    cachedGraph = JSON.parse(readFileSync(DATA_PATH, "utf-8")) as GraphData;
  }
  return cachedGraph;
}

interface GraphIndex {
  nodeById: Map<string, NodeData>;
  sellsByTarget: Map<string, EdgeData[]>;
  locatedInBySource: Map<string, EdgeData>;
}

let cachedIndex: GraphIndex | null = null;

// Precomputed lookups for the hot path in rankZones(): each candidate spell's
// sellers, each seller's zone, and each zone's display node, all O(1) instead
// of linear scans over every node/edge repeated per spell/seller.
function getIndex(): GraphIndex {
  if (cachedIndex) return cachedIndex;
  const graph = load();
  const nodeById = new Map<string, NodeData>();
  const sellsByTarget = new Map<string, EdgeData[]>();
  const locatedInBySource = new Map<string, EdgeData>();
  for (const n of graph.nodes) nodeById.set(n.data.id, n.data);
  for (const e of graph.edges) {
    if (e.data.type === "sells") {
      if (!sellsByTarget.has(e.data.target)) sellsByTarget.set(e.data.target, []);
      sellsByTarget.get(e.data.target)!.push(e.data);
    } else if (e.data.type === "located_in") {
      locatedInBySource.set(e.data.source, e.data);
    }
  }
  cachedIndex = { nodeById, sellsByTarget, locatedInBySource };
  return cachedIndex;
}

function save(graph: GraphData): void {
  writeFileSync(DATA_PATH, JSON.stringify(graph, null, 2));
  cachedGraph = graph;
  cachedIndex = null;
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

interface AdjEntry { zoneId: string; transport?: Transport; }

export function getZoneAdjacency(): Map<string, AdjEntry[]> {
  const graph = load();
  const adj = new Map<string, AdjEntry[]>();
  for (const e of graph.edges) {
    if (e.data.type !== "connects_to") continue;
    if (!adj.has(e.data.source)) adj.set(e.data.source, []);
    const entry: AdjEntry = { zoneId: e.data.target };
    if (e.data.transport) entry.transport = e.data.transport;
    adj.get(e.data.source)!.push(entry);
  }
  // shortestPath()'s BFS keeps the first route it finds to each zone and
  // ignores ties, so tie-breaking is really about which neighbor gets tried
  // first here. Translocators sort first so an equally-short alternative
  // via boat (or plain walking) never wins a tie against one.
  for (const entries of adj.values()) {
    entries.sort((a, b) => (a.transport === "translocator" ? -1 : 0) - (b.transport === "translocator" ? -1 : 0));
  }
  return adj;
}

interface PathStep { zoneId: string; via?: Transport; }

export interface RouteStep { name: string; via?: Transport; }

export function shortestPath(fromZoneId: string, toZoneId: string): PathStep[] | null {
  if (fromZoneId === toZoneId) return [{ zoneId: fromZoneId }];
  const adj = getZoneAdjacency();
  const parent = new Map<string, { from: string; via?: Transport }>([[fromZoneId, { from: "" }]]);
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
  raceIgnored?: boolean;
  deityIgnored?: boolean;
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
  const index = getIndex();

  // race="any"/deity="any" each neutralize only their own dimension in the
  // worst-of computation below — contributing "safe" for that slot, not
  // forcing the whole result to "safe." Deity data does affect real
  // outcomes (confirmed against data/graph.json: 75 wont_sell and 2 kos
  // results, e.g. Paineel vs. Mithaniel Marr/Tunare worshippers), so a real
  // race-driven KOS or class-driven wont_sell still has to show through
  // even when deity is set to "any" (and vice versa) — "any" means "don't
  // let this dimension penalize the result," not "pretend nothing here is
  // real."
  const raceIgnored = race === "any";
  const deityIgnored = deity === "any";

  // Step 1 — start with all purchasable spells
  let candidates = graph.nodes.filter((n) => n.data.type === "spell" && n.data.class_levels);

  // Specific Spells is an *exclusive* override, not an addition: pinning any
  // spell means "show me only these, regardless of Shopping For classes,"
  // the same as it always has — this is what lets you say "forget class
  // browsing for a second, just find this one spell." The bug was never
  // that this narrowing existed; it's that Step 2 used to narrow by class
  // *first*, so a pinned spell outside the current Shopping For classes was
  // already gone by the time this ran, and its class/level pairs got
  // filtered again below on top of that — so a pinned spell not matching
  // both filters vanished instead of showing up as-is.
  const pinnedIds = new Set(specificSpellIds || []);

  // Step 2 — narrow to specific spells (if any pinned), else by class
  if (pinnedIds.size > 0) {
    candidates = candidates.filter((n) => pinnedIds.has(n.data.id));
  } else if (classNames.length > 0) {
    candidates = candidates.filter((n) =>
      n.data.class_levels!.some((cl) => classNames.includes(cl.class))
    );
  }

  const zoneSpells = new Map<string, SpellVendorInfo[]>();

  function addSpellToZones(spell: { data: NodeData }, matchingClasses: { cls: string; level: number }[]) {
    if (!matchingClasses.length) return;
    const sellers = index.sellsByTarget.get(spell.data.id) || [];
    for (const seller of sellers) {
      const npcNode = index.nodeById.get(seller.source);
      const locEdge = index.locatedInBySource.get(seller.source);
      if (!locEdge || !npcNode) continue;
      const zoneId = locEdge.target;
      if (!zoneSpells.has(zoneId)) zoneSpells.set(zoneId, []);
      const existing = zoneSpells.get(zoneId)!;
      const entry = existing.find((s) => s.id === spell.data.id);
      if (entry) {
        if (!entry.vendors.includes(npcNode.label)) entry.vendors.push(npcNode.label);
      } else {
        const d = spell.data;
        const details: SpellDetails = {};
        for (const k of ["description","mana","skill","castTime","recastTime","fizzleTime","duration","targetType","spellType","resist","range"] as const) {
          if (d[k] !== undefined) (details as Record<string, unknown>)[k] = d[k];
        }
        existing.push({ id: d.id, name: d.label, classes: matchingClasses, vendors: [npcNode.label], ...details });
      }
    }
  }

  // Step 4 — apply level filter per-spell and map to vendor zones; pinned
  // spells bypass the level filter too and show all their real class/level
  // pairs, same reasoning as the class bypass above.
  for (const spell of candidates) {
    let matchingClasses: { cls: string; level: number }[];
    if (pinnedIds.has(spell.data.id)) {
      matchingClasses = spell.data.class_levels!.map((cl) => ({ cls: cl.class, level: cl.level }));
    } else if (classNames.length > 0) {
      matchingClasses = spell.data.class_levels!
        .filter((cl) => classNames.includes(cl.class) && levels.includes(cl.level))
        .map((cl) => ({ cls: cl.class, level: cl.level }));
    } else {
      matchingClasses = spell.data.class_levels!
        .filter((cl) => levels.includes(cl.level))
        .map((cl) => ({ cls: cl.class, level: cl.level }));
    }
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
    const zoneNode = index.nodeById.get(zoneId);
    const pathIds = shortestPath(currentZoneId, zoneId);
    const hops = pathIds ? pathIds.length - 1 : null;
    const route: RouteStep[] = pathIds
      ? pathIds.map((step) => {
          const n = index.nodeById.get(step.zoneId);
          const entry: RouteStep = { name: n?.label || step.zoneId };
          if (step.via) entry.via = step.via;
          return entry;
        })
      : [];

    // Resolve faction from race, class, deity dimensions
    let faction: FactionStanding = "neutral";
    if (zoneNode?.faction) {
      const zf = zoneNode.faction as { race?: Record<string, FactionStanding>; class?: Record<string, FactionStanding>; deity?: Record<string, FactionStanding> };
      const raceStanding: FactionStanding = raceIgnored ? "safe" : (race && zf.race?.[race]) || "neutral";
      const classStanding: FactionStanding = (primaryClass && zf.class?.[primaryClass]) || "safe";
      const deityStanding: FactionStanding = deityIgnored ? "safe" : (deity && zf.deity?.[deity]) || "neutral";
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
      zoneName: zoneNode?.label || zoneId,
      hops,
      route,
      faction,
      ...(raceIgnored ? { raceIgnored: true } : {}),
      ...(deityIgnored ? { deityIgnored: true } : {}),
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

export function getRoute(fromZoneId: string, toZoneId: string): { hops: number | null; route: RouteStep[] } {
  const graph = load();
  const pathIds = shortestPath(fromZoneId, toZoneId);
  const hops = pathIds ? pathIds.length - 1 : null;
  const route: RouteStep[] = pathIds
    ? pathIds.map((step) => {
        const n = graph.nodes.find((n) => n.data.id === step.zoneId);
        const entry: RouteStep = { name: n?.data.label || step.zoneId };
        if (step.via) entry.via = step.via;
        return entry;
      })
    : [];
  return { hops, route };
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
