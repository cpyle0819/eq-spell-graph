/**
 * Graph data access layer — Schema v2.
 *
 * Node types: spell, npc, zone, quest, quest_line, item, faction, era (extensible: more as needed)
 * Edge types: sells, located_in, connects_to, starts, rewards, member_of (extensible: requires)
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

// Modeled on eqlwiki.com item pages (Small Scarab Helm, Abjurer's Earring,
// Acid Etched War Sword, Gnome Glow Rod) -- see decisions/item-node-schema.md.
// Everything is optional: a container has weight/size but no ac/damage, a
// weapon has damage/delay/skill but usually no resists, etc. classes follows
// the same "empty/absent = everyone" convention as quest.classes, resolved
// to an explicit allow-list at authoring time rather than an "all except X"
// exclusion list (the wiki's own Categories tag already states the resolved
// list for armor, so there's nothing to compute).
export interface ItemDetails {
  slots?: string[];
  classes?: string[];
  ac?: number;
  stats?: { str?: number; sta?: number; dex?: number; agi?: number; wis?: number; int?: number; cha?: number };
  resists?: { fire?: number; cold?: number; disease?: number; poison?: number; magic?: number };
  hp?: number;
  mana?: number;
  damage?: number;
  delay?: number;
  skill?: string;
  effect?: string;
  lightSource?: boolean;
  weight?: number;
  size?: string;
  magic?: boolean;
  lore?: boolean;
  noTrade?: boolean;
  value?: string;
  source?: string;
  // Tradeskill containers (e.g. Concordance of Research): how many items it
  // holds and the largest item size it accepts -- distinct from the item's
  // own `size` above (how big *this* item is to carry).
  capacity?: number;
  containerSize?: string;
}

export interface ItemSummary extends ItemDetails {
  id: string;
  label: string;
}

const ITEM_DETAIL_KEYS = [
  "slots", "classes", "ac", "stats", "resists", "hp", "mana", "damage", "delay",
  "skill", "effect", "lightSource", "weight", "size", "magic", "lore", "noTrade", "value", "source",
  "capacity", "containerSize",
] as const;

function toItemSummary(node: NodeData): ItemSummary {
  const summary: Record<string, unknown> = { id: node.id, label: node.label };
  for (const key of ITEM_DETAIL_KEYS) {
    if (node[key] !== undefined) summary[key] = node[key];
  }
  return summary as unknown as ItemSummary;
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
  lineBySpell: Map<string, { id: string; label: string }>;
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
  const lineBySpell = new Map<string, { id: string; label: string }>();
  for (const n of graph.nodes) nodeById.set(n.data.id, n.data);
  for (const e of graph.edges) {
    if (e.data.type === "sells") {
      if (!sellsByTarget.has(e.data.target)) sellsByTarget.set(e.data.target, []);
      sellsByTarget.get(e.data.target)!.push(e.data);
    } else if (e.data.type === "located_in") {
      locatedInBySource.set(e.data.source, e.data);
    } else if (e.data.type === "member_of") {
      const lineNode = nodeById.get(e.data.target);
      if (lineNode) lineBySpell.set(e.data.source, { id: lineNode.id, label: lineNode.label });
    }
  }
  cachedIndex = { nodeById, sellsByTarget, locatedInBySource, lineBySpell };
  return cachedIndex;
}

// Spells returned from the graph don't carry their spell_line membership
// directly (it's a separate node + member_of edge, not a node field) — this
// attaches it as a plain `spellLine` label for API consumers, without
// mutating the cached graph node itself (spread into a new object).
function withSpellLine(data: NodeData, index: GraphIndex): NodeData {
  const line = index.lineBySpell.get(data.id);
  return line ? { ...data, spellLine: line.label, spellLineId: line.id } : data;
}

export function getSpellLines(): { id: string; label: string }[] {
  const graph = load();
  return graph.nodes
    .filter((n) => n.data.type === "spell_line")
    .map((n) => ({ id: n.data.id, label: n.data.label }))
    .sort((a, b) => a.label.localeCompare(b.label));
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
  const index = getIndex();
  return graph.nodes
    .filter((n) => {
      if (n.data.type !== "spell" || !n.data.class_levels) return false;
      return n.data.class_levels.some(
        (cl) => cl.class === className && (!levels || levels.includes(cl.level))
      );
    })
    .map((n) => withSpellLine(n.data, index));
}

// No class filter — every purchasable spell, still narrowed by level if given.
export function getAllSpells(levels?: number[]): NodeData[] {
  const graph = load();
  const index = getIndex();
  return graph.nodes
    .filter((n) => {
      if (n.data.type !== "spell" || !n.data.class_levels) return false;
      return !levels || n.data.class_levels.some((cl) => levels.includes(cl.level));
    })
    .map((n) => withSpellLine(n.data, index));
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

export interface QuestSummary {
  id: string;
  label: string;
  description?: string;
  classes: string[];
  minLevel?: number;
  maxLevel?: number;
  steps: string[];
  total_experience?: number;
  zones: { id: string; label: string }[];
  questGivers: { id: string; label: string }[];
  itemRewards: ItemSummary[];
  factionRewards: { id: string; label: string }[];
  // `rewards` edges to a `spell` node -- id/label only (no class_levels/etc.)
  // since the Quests UI only ever uses these to deep-link into the Spell
  // Finder, not to render a full spell stat block the way itemRewards does.
  spellRewards: { id: string; label: string }[];
  // Resolved from a quest --member_of--> quest_line edge (same edge type
  // spell --member_of--> spell_line already uses for grouping -- see
  // decisions/quest-line-node-type.md). undefined for a standalone quest.
  questLine?: { id: string; label: string };
  // The real eqlwiki.com page title (migration 030), same wiki_title ->
  // wikiTitle convention as zone nodes (decisions/
  // wiki-links-per-entity-vs-shared-page.md) -- undefined for quests with
  // no real source page (the migration-026 test quest).
  wikiTitle?: string;
  // The quest's content era (a plain label like "Kunark", matched against
  // the era nodes' own order -- decisions/quest-era-flagging.md). Present
  // only when the source quest node actually states one; most imported
  // quests don't yet.
  era?: string;
  // true only when era is strictly later than the current era. Absent
  // (not false) when not out of era, matching this codebase's convention
  // of omitting a flag field rather than asserting a negative.
  outOfEra?: boolean;
}

// A quest_line's own zones/questGivers/classes/level fields describe the
// line's *shared* frame (e.g. Lord Searfire, Temple of Solusek Ro, "Paladin
// 30+" for every Armor of Ro piece) -- distinct from each member's own
// giver/zone (each Mold of Ro sub-quest has its own NPC in Rathe Mountains).
export interface QuestLineSummary {
  id: string;
  label: string;
  description?: string;
  classes: string[];
  minLevel?: number;
  maxLevel?: number;
  steps: string[];
  zones: { id: string; label: string }[];
  questGivers: { id: string; label: string }[];
  members: QuestSummary[];
  wikiTitle?: string;
  era?: string;
  outOfEra?: boolean;
}

// `era` nodes (migration 032): `order` is the position in the game's real
// content-release order (Classic=1, Kunark=2, Velious=3, ...), `current`
// marks the one era the live game is actually in right now (see
// decisions/quest-era-flagging.md). Exactly one node should have
// current=true; nothing here enforces that -- it's set once by the seeding
// migration and moved forward by a future one as EQL's own progression
// advances, not by app code.
export interface EraSummary {
  id: string;
  label: string;
  order: number;
  current: boolean;
}

export function getEras(): EraSummary[] {
  const graph = load();
  return graph.nodes
    .filter((n) => n.data.type === "era")
    .map((n) => ({ id: n.data.id, label: n.data.label, order: n.data.order as number, current: !!n.data.current }))
    .sort((a, b) => a.order - b.order);
}

interface GraphIndexHelpers {
  nodeById: (id: string) => NodeData | undefined;
  edgesFrom: (id: string, type: string) => EdgeData[];
  edgesTo: (id: string, type: string) => EdgeData[];
  // quest.era (a plain string, matching the class_levels.class precedent --
  // see decisions/quest-era-flagging.md) is matched by label against the
  // era nodes' own order, not stored as an edge.
  eraOrderByLabel: Map<string, number>;
  currentEraOrder: number | undefined;
}

function graphIndexHelpers(graph: GraphData): GraphIndexHelpers {
  const eraOrderByLabel = new Map<string, number>();
  let currentEraOrder: number | undefined;
  for (const n of graph.nodes) {
    if (n.data.type !== "era") continue;
    eraOrderByLabel.set(n.data.label, n.data.order as number);
    if (n.data.current) currentEraOrder = n.data.order as number;
  }
  return {
    nodeById: (id) => graph.nodes.find((n) => n.data.id === id)?.data,
    edgesFrom: (id, type) => graph.edges.filter((e) => e.data.type === type && e.data.source === id).map((e) => e.data),
    edgesTo: (id, type) => graph.edges.filter((e) => e.data.type === type && e.data.target === id).map((e) => e.data),
    eraOrderByLabel,
    currentEraOrder,
  };
}

// A quest with no era, or an era not found among the known era nodes,
// is never flagged -- "unknown" isn't the same as "confirmed later than
// current," and guessing would produce false positives. Only a strictly
// later order counts as out of era; same-or-earlier is the "do nothing"
// case (decisions/quest-era-flagging.md).
function isOutOfEra(era: string | undefined, helpers: GraphIndexHelpers): boolean {
  if (!era || helpers.currentEraOrder === undefined) return false;
  const order = helpers.eraOrderByLabel.get(era);
  return order !== undefined && order > helpers.currentEraOrder;
}

// Shared by getQuests() and getQuestLines() (for each line's members) --
// resolves one quest node's zones/giver/rewards/parent-line edges into the
// shape the Quests UI actually consumes. Kept private: callers only ever
// need the two exported entry points below.
function buildQuestSummary(node: NodeData, helpers: GraphIndexHelpers): QuestSummary {
  const { nodeById, edgesFrom, edgesTo } = helpers;
  const id = node.id;
  const zones = edgesFrom(id, "located_in")
    .map((e) => nodeById(e.target))
    .filter((z): z is NodeData => !!z)
    .map((z) => ({ id: z.id, label: z.label }));
  const questGivers = edgesTo(id, "starts")
    .map((e) => nodeById(e.source))
    .filter((g): g is NodeData => !!g)
    .map((g) => ({ id: g.id, label: g.label }));
  const rewardTargets = edgesFrom(id, "rewards")
    .map((e) => nodeById(e.target))
    .filter((r): r is NodeData => !!r);
  const questLineNode = edgesFrom(id, "member_of")
    .map((e) => nodeById(e.target))
    .find((n): n is NodeData => n?.type === "quest_line");
  return {
    id,
    label: node.label,
    description: node.description as string | undefined,
    classes: (node.classes as string[] | undefined) || [],
    minLevel: node.minLevel as number | undefined,
    maxLevel: node.maxLevel as number | undefined,
    steps: (node.steps as string[] | undefined) || [],
    total_experience: node.total_experience as number | undefined,
    zones,
    questGivers,
    itemRewards: rewardTargets.filter((r) => r.type === "item").map(toItemSummary),
    factionRewards: rewardTargets.filter((r) => r.type === "faction").map((r) => ({ id: r.id, label: r.label })),
    spellRewards: rewardTargets.filter((r) => r.type === "spell").map((r) => ({ id: r.id, label: r.label })),
    ...(questLineNode ? { questLine: { id: questLineNode.id, label: questLineNode.label } } : {}),
    ...(node.wiki_title ? { wikiTitle: node.wiki_title as string } : {}),
    ...(node.era ? { era: node.era as string } : {}),
    ...(isOutOfEra(node.era as string | undefined, helpers) ? { outOfEra: true } : {}),
  };
}

// classNames non-empty means "only quests restricted to (at least one of)
// these classes" -- deliberately excludes classless "anyone" quests, not a
// union with them, per decisions/quest-reward-modeling.md: picking a class
// here is "show me what's for my class," not "show me everything my class
// could also do." level, if given, is a single character level checked
// against each quest's minLevel/maxLevel (either bound absent = unbounded
// in that direction), not a class_levels-style per-class pairing -- see
// decisions/quest-reward-modeling.md for why quest level range isn't
// class-joined the way spell levels are. zoneId narrows to quests
// --located_in--> that zone.
function matchesFilters(node: NodeData, classNames?: string[], level?: number): boolean {
  if (classNames && classNames.length > 0) {
    const nodeClasses = (node.classes as string[] | undefined) || [];
    if (nodeClasses.length === 0 || !nodeClasses.some((c) => classNames.includes(c))) return false;
  }
  if (level !== undefined) {
    const min = node.minLevel as number | undefined;
    const max = node.maxLevel as number | undefined;
    if (!(min === undefined || level >= min) || !(max === undefined || level <= max)) return false;
  }
  return true;
}

export function getQuests(classNames?: string[], zoneId?: string, level?: number): QuestSummary[] {
  const graph = load();
  const helpers = graphIndexHelpers(graph);
  const results = graph.nodes
    .filter((n) => n.data.type === "quest" && matchesFilters(n.data, classNames, level))
    .map((n) => buildQuestSummary(n.data, helpers));

  return zoneId ? results.filter((q) => q.zones.some((z) => z.id === zoneId)) : results;
}

// Same filter semantics as getQuests() (see its comment), applied to
// quest_line nodes instead -- a line's own classes/minLevel/maxLevel
// describe its shared frame (decisions/quest-line-node-type.md), which is
// what's actually filterable; members are resolved unconditionally once
// their line passes the filter; zoneId only checks the line's own zone
// (e.g. Temple of Solusek Ro), not each member's individual zone.
export function getQuestLines(classNames?: string[], zoneId?: string, level?: number): QuestLineSummary[] {
  const graph = load();
  const helpers = graphIndexHelpers(graph);
  const { nodeById, edgesFrom, edgesTo } = helpers;

  const results = graph.nodes
    .filter((n) => n.data.type === "quest_line" && matchesFilters(n.data, classNames, level))
    .map((n): QuestLineSummary => {
      const id = n.data.id;
      const zones = edgesFrom(id, "located_in")
        .map((e) => nodeById(e.target))
        .filter((z): z is NodeData => !!z)
        .map((z) => ({ id: z.id, label: z.label }));
      const questGivers = edgesTo(id, "starts")
        .map((e) => nodeById(e.source))
        .filter((g): g is NodeData => !!g)
        .map((g) => ({ id: g.id, label: g.label }));
      const members = edgesTo(id, "member_of")
        .map((e) => nodeById(e.source))
        .filter((m): m is NodeData => m?.type === "quest")
        .map((m) => buildQuestSummary(m, helpers));
      return {
        id,
        label: n.data.label,
        description: n.data.description as string | undefined,
        classes: (n.data.classes as string[] | undefined) || [],
        minLevel: n.data.minLevel as number | undefined,
        maxLevel: n.data.maxLevel as number | undefined,
        steps: (n.data.steps as string[] | undefined) || [],
        zones,
        questGivers,
        members,
        ...(n.data.wiki_title ? { wikiTitle: n.data.wiki_title as string } : {}),
        ...(n.data.era ? { era: n.data.era as string } : {}),
        ...(isOutOfEra(n.data.era as string | undefined, helpers) ? { outOfEra: true } : {}),
      };
    });

  return zoneId ? results.filter((q) => q.zones.some((z) => z.id === zoneId)) : results;
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
  spellLine?: string;
}

export interface FactionReason {
  dimension: "race" | "class" | "deity";
  value: string;
}

export interface ZoneRanking {
  zoneId: string;
  zoneName: string;
  // Same resolved-page-title convention as ZoneVendorInfo.wikiTitle (see
  // above) — a zone-card wiki link uses this instead of re-deriving a URL
  // from zoneName, which would 404 for zones whose label differs from the
  // eqlwiki.com page that actually covers them.
  wikiTitle: string | null;
  hops: number | null;
  route: RouteStep[];
  faction: FactionStanding;
  factionReasons?: FactionReason[];
  raceIgnored?: boolean;
  classIgnored?: boolean;
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
  specificZoneIds?: string[],
  spellLineIds?: string[]
): ZoneRanking[] {
  const graph = load();
  const index = getIndex();

  // race="any"/primaryClass="any"/deity="any" each neutralize only their own
  // dimension in the worst-of computation below — contributing "safe" for
  // that slot, not forcing the whole result to "safe." Deity data does
  // affect real outcomes (confirmed against data/graph.json: 75 wont_sell
  // and 2 kos results, e.g. Paineel vs. Mithaniel Marr/Tunare worshippers),
  // so a real race-driven KOS or class-driven wont_sell still has to show
  // through even when deity is set to "any" (and vice versa) — "any" means
  // "don't let this dimension penalize the result," not "pretend nothing
  // here is real."
  const raceIgnored = race === "any";
  const classIgnored = primaryClass === "any";
  const deityIgnored = deity === "any";

  // Step 1 — start with all purchasable spells
  let candidates = graph.nodes.filter((n) => n.data.type === "spell" && n.data.class_levels);

  // Specific Spells is an *exclusive* override, not an addition: pinning any
  // spell means "show me only these, regardless of Shopping For classes" —
  // this is what lets you say "forget class browsing for a second, just
  // find this one spell." Pinned ids are checked here, before the class
  // filter below, so a pinned spell outside the current Shopping For
  // classes still shows up as-is rather than being filtered out twice.
  const pinnedIds = new Set(specificSpellIds || []);

  // Spell Line is an additional narrowing facet, same idea as class: start
  // from whatever's already been narrowed down, keep only spells whose line
  // is in the selected set. Multiple selected lines are additive with each
  // other (union within this facet — a spell only belongs to one line, so
  // "AND across lines" would always be empty), same as multi-class Shopping
  // For. Bypassed for pinned spells, same reasoning as the class bypass
  // below: Specific Spells is an exclusive "show me only these" override.
  const lineFilterIds = new Set(spellLineIds || []);

  // Step 2 — narrow to specific spells (if any pinned), else by class and/or spell line
  if (pinnedIds.size > 0) {
    candidates = candidates.filter((n) => pinnedIds.has(n.data.id));
  } else {
    if (classNames.length > 0) {
      candidates = candidates.filter((n) =>
        n.data.class_levels!.some((cl) => classNames.includes(cl.class))
      );
    }
    if (lineFilterIds.size > 0) {
      candidates = candidates.filter((n) => {
        const line = index.lineBySpell.get(n.data.id);
        return line !== undefined && lineFilterIds.has(line.id);
      });
    }
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
        const line = index.lineBySpell.get(d.id);
        existing.push({ id: d.id, name: d.label, classes: matchingClasses, vendors: [npcNode.label], ...(line ? { spellLine: line.label } : {}), ...details });
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
    // Which dimension(s) are actually responsible for a bad result — only
    // populated for wont_sell/kos, so the UI can explain *why* a zone is
    // dubious/KOS instead of just that it is. A dimension only counts as a
    // reason if it matches the overall (worst) standing; e.g. a wont_sell
    // result with class="safe" and deity="wont_sell" cites deity, not class.
    const factionReasons: FactionReason[] = [];
    if (zoneNode?.faction) {
      const zf = zoneNode.faction as { race?: Record<string, FactionStanding>; class?: Record<string, FactionStanding>; deity?: Record<string, FactionStanding> };
      const raceStanding: FactionStanding = raceIgnored ? "safe" : (race && zf.race?.[race]) || "neutral";
      const classStanding: FactionStanding = classIgnored ? "safe" : (primaryClass && zf.class?.[primaryClass]) || "safe";
      const deityStanding: FactionStanding = deityIgnored ? "safe" : (deity && zf.deity?.[deity]) || "neutral";
      faction = worstStanding(raceStanding, classStanding, deityStanding);
      if (faction === "wont_sell" || faction === "kos") {
        if (race && raceStanding === faction) factionReasons.push({ dimension: "race", value: race });
        if (primaryClass && classStanding === faction) factionReasons.push({ dimension: "class", value: primaryClass });
        if (deity && deityStanding === faction) factionReasons.push({ dimension: "deity", value: deity });
      }
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
      wikiTitle: (zoneNode?.wiki_title as string | undefined) ?? null,
      hops,
      route,
      faction,
      ...(factionReasons.length ? { factionReasons } : {}),
      ...(raceIgnored ? { raceIgnored: true } : {}),
      ...(classIgnored ? { classIgnored: true } : {}),
      ...(deityIgnored ? { deityIgnored: true } : {}),
      spells: spells.sort((a, b) =>
        Math.min(...a.classes.map(c => c.level)) - Math.min(...b.classes.map(c => c.level)) ||
        a.name.localeCompare(b.name)
      ),
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

export interface ZoneVendorInfo {
  vendorCount: number;
  levelRange: { min: number; max: number } | null;
  // Short guidebook-style blurb from the zone node's own `lore` field
  // (migration 022, sourced from eqlwiki.com — see decisions/
  // eql-vs-classic-eq-zone-connectivity.md). null for the small number of
  // zones with no findable eqlwiki.com page — never fabricated.
  lore: string | null;
  // The exact eqlwiki.com page title this zone's lore/wiki link resolve
  // to (migration 023's `wiki_title`) — not always the same as the zone's
  // own `label` (e.g. "East Cabilis" -> "Cabilis"; see decisions/
  // zone-naming-mismatches.md). null for the small number of zones with no
  // findable eqlwiki.com page.
  wikiTitle: string | null;
}

// A "real" vendor is an NPC located_in the zone with at least one sells
// edge (see decisions/three-dimensions-determine-vendor-access.md and
// CLAUDE.md — vendor presence isn't a zone field, it's derived from
// located_in + sells edges). levelRange spans every class_levels entry
// across every spell those vendors carry, so it reflects the actual
// spread of levels a shopper would find here, not just the zone's own
// data (there is no such field on zone nodes, and none should be
// invented — see the same CLAUDE.md note).
export function getZoneVendorInfo(zoneId: string): ZoneVendorInfo {
  const graph = load();
  const npcIds = new Set(
    graph.edges
      .filter((e) => e.data.type === "located_in" && e.data.target === zoneId)
      .map((e) => e.data.source)
  );
  const vendorIds = new Set<string>();
  const spellIds = new Set<string>();
  for (const e of graph.edges) {
    if (e.data.type === "sells" && npcIds.has(e.data.source)) {
      vendorIds.add(e.data.source);
      spellIds.add(e.data.target);
    }
  }
  let min = Infinity;
  let max = -Infinity;
  for (const spellId of spellIds) {
    const spell = graph.nodes.find((n) => n.data.id === spellId)?.data;
    for (const cl of spell?.class_levels || []) {
      if (cl.level < min) min = cl.level;
      if (cl.level > max) max = cl.level;
    }
  }
  const zone = graph.nodes.find((n) => n.data.id === zoneId)?.data;
  return {
    vendorCount: vendorIds.size,
    levelRange: Number.isFinite(min) ? { min, max } : null,
    lore: (zone?.lore as string | undefined) ?? null,
    wikiTitle: (zone?.wiki_title as string | undefined) ?? null,
  };
}

export function getRoute(fromZoneId: string, toZoneId: string): { hops: number | null; route: RouteStep[]; destination: ZoneVendorInfo } {
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
  return { hops, route, destination: getZoneVendorInfo(toZoneId) };
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
