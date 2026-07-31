/**
 * Graph data access layer — Schema v2.
 *
 * Node types: spell, npc, zone, quest, quest_group, item, faction, era, recipe, container (extensible: more as needed)
 * Edge types: sells, located_in, connects_to, starts, starts_in, rewards, member_of, requires, drops, uses, produces, crafted_in
 *
 * `located_in` means different things by source type: npc --located_in--> zone
 * is "physically stands here" (unchanged). quest/quest_group --located_in--> zone
 * is broader -- "this quest's steps involve this zone" (giver's zone plus any
 * zone a required step sends the player to, e.g. a farmed reagent with no
 * substitute) -- see decisions/quest-reward-modeling.md. quest --starts_in-->
 * zone is the narrower "this is where the quest giver actually is," used for
 * the Quests UI's "Starts In" card section; falls back to located_in for
 * quests authored before this edge existed (no backfill, same precedent as
 * era flagging).
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

// "portal" (a walk-through zone entrance any class can use, e.g. the orb
// into Plane of Sky) and "wizard_port" (a Wizard-only group teleport spell,
// e.g. Alter Plane: Sky -- see migration 364 and decisions/
// wizard-port-transport-modeling.md) are both narrower than "boat"/
// "translocator": those two are always part of ordinary pathfinding,
// while wizard_port edges are excluded by getZoneAdjacency() unless the
// caller opts in (the UI's "Include Wizard Port" toggle), since assuming
// a Wizard is in the group isn't a safe default for a general route.
export type Transport = "boat" | "translocator" | "portal" | "wizard_port";

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  type: string;
  transport?: Transport;
  // quest --rewards--> item or spell (decisions/quest-reward-modeling.md).
  // Every reward edge sharing the same randomGroup value on the same quest
  // is one slot in a random-choice table -- the player gets one of them,
  // not all -- as opposed to two ordinary reward edges, which are both
  // guaranteed. A group can mix item and spell targets (a quest's random
  // pool isn't guaranteed to be all one kind). Absent (the default) means
  // guaranteed, same "no flag = normal case" convention as outOfEra.
  randomGroup?: string;
  // recipe --uses--> item / recipe --produces--> item (decisions/
  // tradeskill-recipe-node-schema.md). Absent means 1, same "no flag = the
  // common case" convention as randomGroup above.
  quantity?: number;
  // item --located_in--> zone (decisions/item-drops-edge-and-item-located-in.md):
  // how the item is obtained at that zone, not just that it's present there.
  // Required whenever the edge's source is an item (an npc/quest
  // --located_in--> zone edge never sets this -- see that doc's "method"
  // section for why the overload needs disambiguating this way).
  method?: "drop" | "forage" | "fish";
  // Only set on a `method: "drop"` edge -- the specific creature name(s)
  // eqlwiki's own item page lists under that zone (e.g. ["a bat", "a giant
  // bat"]). Absent/empty means the wiki names the zone but not a specific
  // mob.
  mobs?: string[];
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
  // Restricts the item to worshipers of one deity (e.g. Blacksmithing's
  // Imbued Field Plate armor, one set per deity) -- directly relevant to
  // this app's own faction system (worst-of race/class/deity), not just
  // flavor text. Sourced from eqlwiki's own `Deity:` statsblock line;
  // absent means no deity restriction, same "absent = unrestricted"
  // convention as `classes`.
  deity?: string;
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
  "slots", "classes", "deity", "ac", "stats", "resists", "hp", "mana", "damage", "delay",
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
  nodes: NodeData[];
  edges: EdgeData[];
}

const DATA_PATH = resolve(__dirname, "../data/graph.json");

// graph.json is 2MB+, and load() gets called many times per request —
// once directly in rankZones(), then again inside shortestPath() for every
// candidate zone. Caching the parsed result for the life of the process
// keeps that at one disk read + parse per process instead of dozens per
// request. save() invalidates the cache (and graphIndexHelpers()'s own
// derived cache below); mutation routes are local-dev-only, so staying in
// sync with a single writer is fine.
let cachedGraph: GraphData | null = null;

function load(): GraphData {
  if (!cachedGraph) {
    cachedGraph = JSON.parse(readFileSync(DATA_PATH, "utf-8")) as GraphData;
  }
  return cachedGraph;
}

// A spell's spell_line membership isn't a node field, it's a separate node +
// member_of edge -- resolved through graphIndexHelpers()'s generic edge
// index (member_of is scoped to spells here purely by which id is passed
// in; a quest's own member_of points at a quest_group instead, but nothing
// here ever looks that up by a spell id). Shared by withSpellLine() and
// rankZones()'s own per-spell lookup below.
function spellLineOf(spellId: string, helpers: GraphIndexHelpers): { id: string; label: string } | undefined {
  const lineNode = helpers.edgesFrom(spellId, "member_of")
    .map((e) => helpers.nodeById(e.target))
    .find((n): n is NodeData => !!n);
  return lineNode ? { id: lineNode.id, label: lineNode.label } : undefined;
}

// Spells returned from the graph don't carry their spell_line membership
// directly -- this attaches it as a plain `spellLine` label for API
// consumers, without mutating the cached graph node itself (spread into a
// new object).
function withSpellLine(data: NodeData, helpers: GraphIndexHelpers): NodeData {
  const line = spellLineOf(data.id, helpers);
  return line ? { ...data, spellLine: line.label, spellLineId: line.id } : data;
}

export function getSpellLines(): { id: string; label: string }[] {
  const graph = load();
  return graph.nodes
    .filter((n) => n.type === "spell_line")
    .map((n) => ({ id: n.id, label: n.label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function save(graph: GraphData): void {
  writeFileSync(DATA_PATH, JSON.stringify(graph, null, 2));
  cachedGraph = graph;
  cachedHelpers = null;
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
  return load().nodes.find((n) => n.id === id);
}

export function findNodes(filter: Record<string, unknown>): NodeData[] {
  const graph = load();
  return graph.nodes
    .filter((n) => Object.entries(filter).every(([k, v]) => n[k] === v));
}

export function getSpellsForClass(className: string, levels?: number[]): NodeData[] {
  const graph = load();
  const helpers = graphIndexHelpers(graph);
  return graph.nodes
    .filter((n) => {
      if (n.type !== "spell" || !n.class_levels) return false;
      return n.class_levels.some(
        (cl) => cl.class === className && (!levels || levels.includes(cl.level))
      );
    })
    .map((n) => withSpellLine(n, helpers));
}

// No class filter — every purchasable spell, still narrowed by level if given.
export function getAllSpells(levels?: number[]): NodeData[] {
  const graph = load();
  const helpers = graphIndexHelpers(graph);
  return graph.nodes
    .filter((n) => {
      if (n.type !== "spell" || !n.class_levels) return false;
      return !levels || n.class_levels.some((cl) => levels.includes(cl.level));
    })
    .map((n) => withSpellLine(n, helpers));
}

export function getVendorsForSpell(spellId: string): { npc: NodeData; zone: NodeData | undefined }[] {
  const graph = load();
  const sellsEdges = graph.edges.filter(
    (e) => e.type === "sells" && e.target === spellId
  );
  return sellsEdges.map((e) => {
    const npc = graph.nodes.find((n) => n.id === e.source)!;
    const locEdge = graph.edges.find(
      (le) => le.type === "located_in" && le.source === npc.id
    );
    const zone = locEdge
      ? graph.nodes.find((n) => n.id === locEdge.target)
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
  // randomGroup (see EdgeData) is folded onto the summary here, not left as
  // a separate lookup, since the Quests UI renders items and their
  // random-choice grouping in the same pass.
  itemRewards: (ItemSummary & { randomGroup?: string })[];
  factionRewards: { id: string; label: string }[];
  // `rewards` edges to a `spell` node -- id/label only (no class_levels/etc.)
  // since the Quests UI only ever uses these to deep-link into the Spell
  // Finder, not to render a full spell stat block the way itemRewards does.
  // randomGroup carried through the same way as itemRewards' -- a random
  // pool can mix item and spell targets, so both arrays need it.
  spellRewards: { id: string; label: string; randomGroup?: string }[];
  // Resolved from a quest --member_of--> quest_group edge (same edge type
  // spell --member_of--> spell_line already uses for grouping -- see
  // decisions/quest-group-node-type.md). undefined for a standalone quest.
  questGroup?: { id: string; label: string };
  // Resolved from quest --requires--> quest edges: other quests that must be
  // completed first (decisions/quest-prerequisite-requires-edge.md). This is
  // the actual prerequisite-chain relationship -- distinct from quest_group,
  // which groups independent siblings with no ordering between them.
  requires?: { id: string; label: string }[];
  // The real eqlwiki.com page title (migration 030), same wiki_title ->
  // wikiTitle convention as zone nodes (decisions/
  // wiki-links-per-entity-vs-shared-page.md) -- undefined for quests with
  // no real source page (the migration-026 test quest).
  wikiTitle?: string;
  // The quest's content era (a plain label like "Kunark", matched against
  // the era nodes' own order -- decisions/quest-era-flagging.md). This is
  // either the quest's own stated era, or -- if the quest doesn't state
  // one -- inherited from a zone it touches that's confirmed out-of-era
  // (resolveEra() in this file). Present only when one of those two
  // sources actually supplies a value.
  era?: string;
  // true only when era is strictly later than the current era, whether
  // from the quest's own era or a touched zone's. Absent (not false) when
  // not out of era, matching this codebase's convention of omitting a
  // flag field rather than asserting a negative.
  outOfEra?: boolean;
  // true when this quest was sourced from a real player log rather than a
  // finished eqlwiki.com page (decisions/eqlwiki-quest-research-method.md's
  // log-sourcing exception) and some real detail -- an exact location, the
  // final reward, whether steps are even fully ordered -- is still
  // unconfirmed. incompleteNote states what's actually missing. Same
  // "absent = normal case, no reassuring badge" convention as outOfEra.
  incomplete?: boolean;
  incompleteNote?: string;
}

// A quest_group's own zones/questGivers/classes/level fields describe the
// group's *shared* frame (e.g. Lord Searfire, Temple of Solusek Ro, "Paladin
// 30+" for every Armor of Ro piece) -- distinct from each member's own
// giver/zone (each Mold of Ro sub-quest has its own NPC in Rathe Mountains).
export interface QuestGroupSummary {
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
    .filter((n) => n.type === "era")
    .map((n) => ({ id: n.id, label: n.label, order: n.order as number, current: !!n.current }))
    .sort((a, b) => a.order - b.order);
}

export interface ZoneSummary {
  id: string;
  label: string;
  // Same era/outOfEra convention as QuestSummary (see resolveEra() below) --
  // present only when this zone node itself carries a confirmed era.
  era?: string;
  outOfEra?: boolean;
}

export function getZones(): ZoneSummary[] {
  const graph = load();
  const helpers = graphIndexHelpers(graph);
  return graph.nodes
    .filter((n) => n.type === "zone")
    .map((n) => ({
      id: n.id,
      label: n.label,
      ...resolveEra(n.era as string | undefined, [], helpers),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export interface NpcSummary {
  id: string;
  label: string;
  // "vendor"/"quest_giver"/"guard"/"guildmaster"/"mob"/"banker" -- every
  // entity in the graph is an npc now (decisions/
  // npc-mob-unification-and-zone-groups.md retired the separate `mob` node
  // type), roles is what distinguishes a shopkeeper from a hostile creature.
  // "banker" (decisions/friendly-town-npcs-inside-a-hostile-dungeon.md) is a
  // non-selling service NPC, distinct from "vendor" because it carries no
  // `sells` edges. An npc can carry more than one role (a vendor who also
  // gives a quest) -- callers group by role and render the npc once per
  // matching group, not once overall. An npc can also carry zero roles at
  // all (a named resident with no known function beyond presence) --
  // callers must not assume every npc lands in at least one group.
  roles: string[];
  // Same optional-bound shape as QuestSummary's own minLevel/maxLevel --
  // most eqlwiki.com creature entries are a level *range*, not one number;
  // a single-level mob (a named/unique) just has minLevel === maxLevel
  // rather than a separate scalar field, so callers check one shape either
  // way. Usually set for npcs with a "mob"/"guard"/"guildmaster"/"banker"
  // role and omitted for "vendor"/"quest_giver" -- but a "guard" (or a
  // roleless resident) with no stated wiki level is kept without one rather
  // than excluded, so absence here never implies the role doesn't carry
  // levels in general.
  minLevel?: number;
  maxLevel?: number;
  // Resolved `npc --drops--> item` edges (decisions/
  // item-drops-edge-and-item-located-in.md) -- full ItemSummary, same as
  // getQuests()'s itemRewards, so a hover card can show real stats without
  // a second lookup. Omitted (not empty array) for the common case of no
  // drops edge at all, same optional-field convention as minLevel/maxLevel.
  drops?: ItemSummary[];
  // What a vendor role npc actually sells, derived from `sells` edges'
  // target node type (SELL_CATEGORY_LABELS below), not hand-tagged -- every
  // sells edge in the graph targets a spell node today, so this is "Spells"
  // for every vendor right now, but it's read off the real target type
  // rather than hardcoded so a future `npc --sells--> item` (tailoring
  // supplies, armor, etc.) shows up here with no dossier changes needed.
  // Omitted for non-vendor npcs, same convention as drops/minLevel.
  sellCategories?: string[];
}

// Only "spell" exists as a sells target today; the fallback plural covers
// any future target type without needing a matching label added here first.
const SELL_CATEGORY_LABELS: Record<string, string> = { spell: "Spells" };
function sellCategoryLabel(nodeType: string): string {
  return SELL_CATEGORY_LABELS[nodeType] ?? `${nodeType.charAt(0).toUpperCase()}${nodeType.slice(1)}s`;
}

// Resolves item ids straight to full ItemSummary data, no zone/quest/npc
// scoping -- for a page like leveling-guide.html that names specific items
// in hand-authored prose rather than rendering a graph query's results, so
// there's no existing per-quest/per-npc summary object to pull `drops`/
// `itemRewards` from. Unknown ids are silently skipped, same as
// getZoneNpcs() silently returning nothing for a zone with no npcs.
export function getItemsByIds(ids: string[]): ItemSummary[] {
  const graph = load();
  const helpers = graphIndexHelpers(graph);
  return ids
    .map((id) => helpers.nodeById(id))
    .filter((node): node is NodeData => node !== undefined && node.type === "item")
    .map(toItemSummary);
}

// zoneId is required, not optional like getQuests()'s -- there's no current
// UI need for "every npc across every zone" the way Quests' own unfiltered
// list is a real browsable tab, so this only supports the one query shape
// Maps' zone dossier actually makes.
export function getZoneNpcs(zoneId: string): NpcSummary[] {
  const graph = load();
  const helpers = graphIndexHelpers(graph);
  return graph.nodes
    .filter((n) => n.type === "npc" && helpers.edgesFrom(n.id, "located_in").some((e) => e.target === zoneId))
    .map((n) => {
      const drops = helpers
        .edgesFrom(n.id, "drops")
        .map((e) => helpers.nodeById(e.target))
        .filter((node): node is NodeData => node !== undefined)
        .map(toItemSummary);
      const sellCategories = [
        ...new Set(
          helpers
            .edgesFrom(n.id, "sells")
            .map((e) => helpers.nodeById(e.target)?.type)
            .filter((type): type is string => type !== undefined)
            .map(sellCategoryLabel)
        ),
      ].sort();
      return {
        id: n.id,
        label: n.label,
        roles: (n.roles as string[] | undefined) ?? [],
        minLevel: n.minLevel as number | undefined,
        maxLevel: n.maxLevel as number | undefined,
        ...(drops.length ? { drops } : {}),
        ...(sellCategories.length ? { sellCategories } : {}),
      };
    })
    .sort((a, b) => (a.minLevel ?? 0) - (b.minLevel ?? 0));
}

// decisions/tradeskill-recipe-node-schema.md. quantity rides on the
// resolved ItemSummary rather than a parallel array so a caller never has
// to zip two lists back together -- same "resolve straight to the shape
// the UI wants" precedent as getQuests()'s itemRewards.
export interface RecipeIngredient extends ItemSummary {
  quantity: number;
}

export interface ContainerSummary {
  id: string;
  label: string;
}

// Skill-success thresholds for attempting a recipe, computed from `trivial`
// rather than stored -- a general tradeskill-mechanics formula (not
// Brewing-specific, not eqlwiki-sourced -- see decisions/
// tradeskill-recipe-node-schema.md for its provenance), so it's derived at
// read time the same way a `container`'s own tradeskill is derived by
// walking `crafted_in` rather than stored redundantly. 95% success is
// capped at `trivial` itself, not a fourth linear formula.
export function recipeSuccessThresholds(trivial: number): { p25: number; p50: number; p75: number; p95: number } {
  const clamp = (n: number) => Math.max(0, n);
  return {
    p25: clamp(Math.ceil(0.75 * trivial - 26.5)),
    p50: clamp(Math.ceil(0.75 * trivial - 1.5)),
    p75: clamp(Math.ceil(0.75 * trivial + 23.5)),
    p95: trivial,
  };
}

export interface RecipeSummary {
  id: string;
  label: string;
  tradeskill: string;
  trivial: number;
  success: { p25: number; p50: number; p75: number; p95: number };
  uses: RecipeIngredient[];
  // Absent only if a recipe node somehow has no `produces` edge -- every
  // recipe this migration batch added has exactly one.
  produces?: RecipeIngredient;
  // Every container the recipe's own source lists as valid -- usually one
  // (migration 356's Brewing recipes all point at the same Brew Barrel),
  // but not always: Baking's Batwing Crunchies genuinely allows either an
  // Oven or a Spit (migration 366), so this stays an array rather than
  // silently keeping only the first and dropping the real alternative.
  // Empty only if a recipe node somehow has no `crafted_in` edge at all.
  containers: ContainerSummary[];
  // True only for a tradeskill's own hand-picked leveling-path recipes
  // (migration 355's 11-recipe "Antonica Biased Brewers" path, flagged via
  // migration 359) -- absent/false for every other recipe of that same
  // tradeskill (migration 358's broader recipe-book coverage). The
  // Tradeskills page's Leveling Guide filters on this so it stays exactly
  // that original path regardless of how many more recipes a tradeskill
  // later accumulates.
  levelingGuide: boolean;
  // Alternate ingredient combos that produce this same recipe's `produces`
  // item (decisions/tradeskill-recipe-node-schema.md's "Recipe variants" --
  // e.g. Baking's classic vs. Velious Beer Braised Mammoth). This recipe is
  // already the family's most-vendor-sourceable combo (see getRecipes());
  // each entry here is a full RecipeSummary in its own right (recursing one
  // level -- an alternate's own `variants` is always left empty so the
  // nesting can't go deeper than one level, since a family only ever needs
  // one "primary" and the rest are flat siblings of it, never their own
  // sub-families). Absent/empty when this recipe has no known alternates.
  variants: RecipeSummary[];
}

// Distinct `recipe.tradeskill` values across the graph, for the Tradeskills
// page's own select box -- no separate "tradeskill" node/lookup table (see
// decisions/tradeskill-recipe-node-schema.md).
export function getTradeskills(): string[] {
  const graph = load();
  return [...new Set(graph.nodes.filter((n) => n.type === "recipe").map((n) => n.tradeskill as string))].sort();
}

// How many of a recipe's `uses` ingredients have at least one vendor --
// the "most vendor-sourceable" tiebreak a variant family's primary combo is
// picked by (decisions/tradeskill-recipe-node-schema.md's "Recipe
// variants"). Computed at read time, same as recipeSuccessThresholds, so it
// tracks vendor data as it grows rather than needing a migration to re-flag
// which combo is primary.
function vendorSourceableCount(uses: RecipeIngredient[], helpers: GraphIndexHelpers): number {
  return uses.filter((ing) => helpers.edgesTo(ing.id, "sells").length > 0).length;
}

function buildRecipeSummary(n: NodeData, helpers: GraphIndexHelpers): Omit<RecipeSummary, "variants"> {
  const uses = helpers
    .edgesFrom(n.id, "uses")
    .map((e) => {
      const item = helpers.nodeById(e.target);
      return item ? { ...toItemSummary(item), quantity: (e.quantity as number) ?? 1 } : undefined;
    })
    .filter((ing): ing is RecipeIngredient => ing !== undefined);
  const producesEdge = helpers.edgesFrom(n.id, "produces")[0];
  const producesNode = producesEdge ? helpers.nodeById(producesEdge.target) : undefined;
  const produces = producesNode
    ? { ...toItemSummary(producesNode), quantity: (producesEdge.quantity as number) ?? 1 }
    : undefined;
  const containers = helpers
    .edgesFrom(n.id, "crafted_in")
    .map((e) => helpers.nodeById(e.target))
    .filter((c): c is NodeData => c !== undefined)
    .map((c) => ({ id: c.id, label: c.label }));
  const trivial = n.trivial as number;
  return {
    id: n.id,
    label: n.label,
    tradeskill: n.tradeskill as string,
    trivial,
    success: recipeSuccessThresholds(trivial),
    uses,
    produces,
    containers,
    levelingGuide: !!n.levelingGuide,
  };
}

export function getRecipes(tradeskill: string): RecipeSummary[] {
  const graph = load();
  const helpers = graphIndexHelpers(graph);
  const recipeNodes = graph.nodes.filter((n) => n.type === "recipe" && n.tradeskill === tradeskill);

  // Group each recipe with its variant_of siblings (decisions/
  // tradeskill-recipe-node-schema.md) -- a node with an outgoing variant_of
  // edge joins its target's family instead of appearing as its own
  // top-level entry; a node with none is a family of one.
  const families = new Map<string, NodeData[]>();
  for (const n of recipeNodes) {
    const anchorId = helpers.edgesFrom(n.id, "variant_of")[0]?.target ?? n.id;
    if (!families.has(anchorId)) families.set(anchorId, []);
    families.get(anchorId)!.push(n);
  }

  const results: RecipeSummary[] = [];
  for (const members of families.values()) {
    const scored = members
      .map((n) => ({ n, summary: buildRecipeSummary(n, helpers) }))
      .sort((a, b) => {
        const scoreDiff = vendorSourceableCount(b.summary.uses, helpers) - vendorSourceableCount(a.summary.uses, helpers);
        return scoreDiff !== 0 ? scoreDiff : a.summary.trivial - b.summary.trivial;
      });
    const [primary, ...alternates] = scored;
    results.push({ ...primary.summary, variants: alternates.map((a) => ({ ...a.summary, variants: [] })) });
  }

  return results.sort((a, b) => a.trivial - b.trivial);
}

export interface TradeskillVendorSummary {
  id: string;
  label: string;
  zoneId: string;
  zoneLabel: string;
  // Only the items this vendor sells that a `tradeskill` recipe actually
  // uses -- a vendor's other, unrelated stock (a general goods vendor who
  // happens to also sell a Brewing ingredient) doesn't get listed here.
  sells: ItemSummary[];
}

// zoneId is optional (unlike getZoneNpcs' required one) -- the Tradeskills
// page's own zone filter defaults to "any zone, show all" per issue #32,
// the opposite default from Maps' zone dossier.
export function getTradeskillVendors(tradeskill: string, zoneId?: string): TradeskillVendorSummary[] {
  const graph = load();
  const helpers = graphIndexHelpers(graph);
  const ingredientIds = new Set(
    graph.nodes
      .filter((n) => n.type === "recipe" && n.tradeskill === tradeskill)
      .flatMap((n) => helpers.edgesFrom(n.id, "uses").map((e) => e.target))
  );
  const vendors: TradeskillVendorSummary[] = [];
  for (const npc of graph.nodes) {
    if (npc.type !== "npc" || !(npc.roles as string[] | undefined)?.includes("vendor")) continue;
    const sells = helpers
      .edgesFrom(npc.id, "sells")
      .map((e) => helpers.nodeById(e.target))
      .filter((item): item is NodeData => item !== undefined && item.type === "item" && ingredientIds.has(item.id))
      .map(toItemSummary);
    if (!sells.length) continue;
    const zoneEdge = helpers.edgesFrom(npc.id, "located_in")[0];
    if (!zoneEdge || (zoneId && zoneEdge.target !== zoneId)) continue;
    const zoneNode = helpers.nodeById(zoneEdge.target);
    vendors.push({ id: npc.id, label: npc.label, zoneId: zoneEdge.target, zoneLabel: zoneNode?.label ?? zoneEdge.target, sells });
  }
  return vendors.sort((a, b) => a.zoneLabel.localeCompare(b.zoneLabel) || a.label.localeCompare(b.label));
}

export interface ItemSourceZone {
  zoneId: string;
  zoneLabel: string;
}

export interface ItemSourceDrop extends ItemSourceZone {
  mobs: string[];
}

export interface ItemSourceRecipe {
  recipeId: string;
  recipeLabel: string;
  tradeskill: string;
}

// The "how do I get this ingredient besides buying it" facts ingredient-
// card.js's Foraged In/Fished From/Dropped By/Crafted In sections render
// (issue #55) -- everything but craftedIn comes from `item --located_in-->
// zone` edges tagged with a `method` (migration 370, decisions/
// item-drops-edge-and-item-located-in.md's "method" section). craftedIn
// needs no migration at all: it's the reverse of the `recipe --produces-->
// item` edge every recipe already has, so it tracks new recipes
// automatically as they're added, the same "don't store what's derivable"
// reasoning as recipeSuccessThresholds().
export interface ItemSourceSummary {
  id: string;
  foraged: ItemSourceZone[];
  fished: ItemSourceZone[];
  dropped: ItemSourceDrop[];
  craftedIn: ItemSourceRecipe[];
  // The item's own free-text `source` field (ItemDetails.source, already
  // shown in item-chip.js's hover tooltip everywhere else in the app) --
  // covers one-off/arbitrary acquisition methods the four structured
  // categories above can't express (issue #58, e.g. Flaming Pungla: handed
  // over by an NPC for gold, not foraged/fished/dropped/crafted). No
  // migration needed, same "don't store what's derivable" reasoning as
  // craftedIn -- this is already-authored data, just not surfaced here
  // before. null when the item has no `source` note at all.
  other: string | null;
}

export function getItemSources(ids: string[]): ItemSourceSummary[] {
  const graph = load();
  const helpers = graphIndexHelpers(graph);
  const zoneRef = (e: EdgeData): ItemSourceZone => ({ zoneId: e.target, zoneLabel: helpers.nodeById(e.target)?.label ?? e.target });
  return ids
    .filter((id) => !!helpers.nodeById(id))
    .map((id) => {
      const locEdges = helpers.edgesFrom(id, "located_in");
      const craftedIn = helpers
        .edgesTo(id, "produces")
        .map((e) => helpers.nodeById(e.source))
        .filter((r): r is NodeData => r?.type === "recipe")
        .map((r) => ({ recipeId: r.id, recipeLabel: r.label, tradeskill: r.tradeskill as string }));
      return {
        id,
        foraged: locEdges.filter((e) => e.method === "forage").map(zoneRef),
        fished: locEdges.filter((e) => e.method === "fish").map(zoneRef),
        dropped: locEdges.filter((e) => e.method === "drop").map((e) => ({ ...zoneRef(e), mobs: e.mobs ?? [] })),
        craftedIn,
        other: (helpers.nodeById(id)?.source as string | undefined) ?? null,
      };
    });
}

export interface GraphIndexHelpers {
  nodeById: (id: string) => NodeData | undefined;
  edgesFrom: (id: string, type: string) => EdgeData[];
  edgesTo: (id: string, type: string) => EdgeData[];
  // quest.era (a plain string, matching the class_levels.class precedent --
  // see decisions/quest-era-flagging.md) is matched by label against the
  // era nodes' own order, not stored as an edge.
  eraOrderByLabel: Map<string, number>;
  currentEraOrder: number | undefined;
}

// graph.json's node/edge counts grow with every content batch (issue #36
// alone took it from ~2MB to 7MB+) -- a linear .find()/.filter() per call
// here, times the ~7 calls buildQuestSummary() makes per quest, times
// hundreds of quests, had grown slow enough to blow the Lambda's 10s
// timeout on the unfiltered /api/quests route (502s in production).
// Building real Maps once per graphIndexHelpers() call keeps every lookup
// O(1) regardless of how large the graph gets. This is the graph's only
// edge index -- rankZones() (the other hot path) resolves through it too,
// rather than keeping a second, narrower index of its own.
let cachedHelpers: { graph: GraphData; helpers: GraphIndexHelpers } | null = null;

function graphIndexHelpers(graph: GraphData): GraphIndexHelpers {
  if (cachedHelpers?.graph === graph) return cachedHelpers.helpers;

  const nodesById = new Map<string, NodeData>();
  for (const n of graph.nodes) nodesById.set(n.id, n);

  const edgesFromIndex = new Map<string, EdgeData[]>();
  const edgesToIndex = new Map<string, EdgeData[]>();
  for (const e of graph.edges) {
    const fromKey = `${e.type}:${e.source}`;
    if (!edgesFromIndex.has(fromKey)) edgesFromIndex.set(fromKey, []);
    edgesFromIndex.get(fromKey)!.push(e);

    const toKey = `${e.type}:${e.target}`;
    if (!edgesToIndex.has(toKey)) edgesToIndex.set(toKey, []);
    edgesToIndex.get(toKey)!.push(e);
  }

  const eraOrderByLabel = new Map<string, number>();
  let currentEraOrder: number | undefined;
  for (const n of graph.nodes) {
    if (n.type !== "era") continue;
    eraOrderByLabel.set(n.label, n.order as number);
    if (n.current) currentEraOrder = n.order as number;
  }

  const helpers: GraphIndexHelpers = {
    nodeById: (id) => nodesById.get(id),
    edgesFrom: (id, type) => edgesFromIndex.get(`${type}:${id}`) || [],
    edgesTo: (id, type) => edgesToIndex.get(`${type}:${id}`) || [],
    eraOrderByLabel,
    currentEraOrder,
  };
  cachedHelpers = { graph, helpers };
  return helpers;
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

// zone.era (migration 049) is the same plain-label convention as
// quest.era, verified against each zone's own eqlwiki.com page rather than
// guessed from classic-EQ expansion history (see CLAUDE.md and
// decisions/quest-era-flagging.md). A quest/quest_group's outOfEra is the
// worse of its own stated era and any zone it touches (located_in/
// starts_in) being confirmed out-of-era -- a quest physically set in a
// zone the wiki confirms is Kunark/Velious can't itself be earlier era
// than that zone, even when the quest's own page never restates it. This
// is deliberately *not* the same "never infer" rule quest-era-flagging.md
// sets for a quest's own era value -- that rule is about not guessing an
// era from nothing; this is reading a hard fact (the zone's confirmed era)
// through an edge that already exists, not guessing anything.
function resolveEra(
  ownEra: string | undefined,
  zoneIds: Iterable<string>,
  helpers: GraphIndexHelpers
): { era?: string; outOfEra?: boolean } {
  let effectiveEra = ownEra;
  let outOfEra = isOutOfEra(ownEra, helpers);
  if (!outOfEra) {
    for (const zid of zoneIds) {
      const zoneEra = helpers.nodeById(zid)?.era as string | undefined;
      if (zoneEra && isOutOfEra(zoneEra, helpers)) {
        effectiveEra = zoneEra;
        outOfEra = true;
        break;
      }
    }
  }
  return { ...(effectiveEra ? { era: effectiveEra } : {}), ...(outOfEra ? { outOfEra: true } : {}) };
}

// Shared by getQuests() and getQuestGroups() (for each group's members) --
// resolves one quest node's zones/giver/rewards/parent-group edges into the
// shape the Quests UI actually consumes. Kept private: callers only ever
// need the two exported entry points below.
function buildQuestSummary(node: NodeData, helpers: GraphIndexHelpers): QuestSummary {
  const { nodeById, edgesFrom, edgesTo } = helpers;
  const id = node.id;
  const startsInEdges = edgesFrom(id, "starts_in");
  const zones = (startsInEdges.length > 0 ? startsInEdges : edgesFrom(id, "located_in"))
    .map((e) => nodeById(e.target))
    .filter((z): z is NodeData => !!z)
    .map((z) => ({ id: z.id, label: z.label }));
  const questGivers = edgesTo(id, "starts")
    .map((e) => nodeById(e.source))
    .filter((g): g is NodeData => !!g)
    .map((g) => ({ id: g.id, label: g.label }));
  const rewardEdges = edgesFrom(id, "rewards")
    .map((e) => ({ edge: e, node: nodeById(e.target) }))
    .filter((r): r is { edge: EdgeData; node: NodeData } => !!r.node);
  const rewardTargets = rewardEdges.map((r) => r.node);
  const questGroupNode = edgesFrom(id, "member_of")
    .map((e) => nodeById(e.target))
    .find((n): n is NodeData => n?.type === "quest_group");
  const requiresNodes = edgesFrom(id, "requires")
    .map((e) => nodeById(e.target))
    .filter((n): n is NodeData => !!n);
  const touchedZoneIds = new Set([
    ...edgesFrom(id, "located_in").map((e) => e.target),
    ...edgesFrom(id, "starts_in").map((e) => e.target),
  ]);
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
    itemRewards: rewardEdges
      .filter((r) => r.node.type === "item")
      .map((r) => ({ ...toItemSummary(r.node), ...(r.edge.randomGroup ? { randomGroup: r.edge.randomGroup } : {}) })),
    factionRewards: rewardTargets.filter((r) => r.type === "faction").map((r) => ({ id: r.id, label: r.label })),
    spellRewards: rewardEdges
      .filter((r) => r.node.type === "spell")
      .map((r) => ({ id: r.node.id, label: r.node.label, ...(r.edge.randomGroup ? { randomGroup: r.edge.randomGroup } : {}) })),
    ...(questGroupNode ? { questGroup: { id: questGroupNode.id, label: questGroupNode.label } } : {}),
    ...(requiresNodes.length ? { requires: requiresNodes.map((n) => ({ id: n.id, label: n.label })) } : {}),
    ...(node.wiki_title ? { wikiTitle: node.wiki_title as string } : {}),
    ...resolveEra(node.era as string | undefined, touchedZoneIds, helpers),
    ...(node.incomplete ? { incomplete: true as const, ...(node.incompleteNote ? { incompleteNote: node.incompleteNote as string } : {}) } : {}),
  };
}

// classNames non-empty means "only quests restricted to (at least one of)
// these classes" -- deliberately excludes classless "anyone" quests, not a
// union with them, per decisions/quest-reward-modeling.md: picking a class
// here is "show me what's for my class," not "show me everything my class
// could also do." levelMin/levelMax (if given) bound the quest's own start
// level (minLevel), not a character's current level -- a quest is kept if
// its minLevel falls within [levelMin, levelMax], not a class_levels-style
// per-class pairing -- see decisions/quest-reward-modeling.md for why quest
// level range isn't class-joined the way spell levels are. Quests with no
// minLevel at all (undocumented start level -- always paired with no
// maxLevel either, never a partial bound) pass regardless of range, same
// "absent = unbounded" convention as everywhere else, rather than
// disappearing the moment any range narrower than the full slider is
// picked. zoneId narrows to quests --located_in--> that zone.
function matchesFilters(node: NodeData, classNames?: string[], levelMin?: number, levelMax?: number): boolean {
  if (classNames && classNames.length > 0) {
    const nodeClasses = (node.classes as string[] | undefined) || [];
    if (nodeClasses.length === 0 || !nodeClasses.some((c) => classNames.includes(c))) return false;
  }
  const questStart = node.minLevel as number | undefined;
  if (questStart !== undefined) {
    if (levelMin !== undefined && questStart < levelMin) return false;
    if (levelMax !== undefined && questStart > levelMax) return false;
  }
  return true;
}

// A quest matches a zone if it starts there OR any step involves it there --
// checked against raw edges (not the resolved QuestSummary.zones, which only
// ever shows the *starting* zone) so a farmed-reagent zone like Estate of
// Unrest still surfaces the quest on that zone's own Quests tab.
function touchesZone(id: string, zoneId: string, helpers: GraphIndexHelpers): boolean {
  return (
    helpers.edgesFrom(id, "located_in").some((e) => e.target === zoneId) ||
    helpers.edgesFrom(id, "starts_in").some((e) => e.target === zoneId)
  );
}

export function getQuests(classNames?: string[], zoneId?: string, levelMin?: number, levelMax?: number): QuestSummary[] {
  const graph = load();
  const helpers = graphIndexHelpers(graph);
  const results = graph.nodes
    .filter(
      (n) =>
        n.type === "quest" &&
        matchesFilters(n, classNames, levelMin, levelMax) &&
        (!zoneId || touchesZone(n.id, zoneId, helpers))
    )
    .map((n) => buildQuestSummary(n, helpers));

  return results;
}

// Same filter semantics as getQuests() (see its comment), applied to
// quest_group nodes instead -- a group's own classes/minLevel/maxLevel
// describe its shared frame (decisions/quest-group-node-type.md), which is
// what's actually filterable; members are resolved unconditionally once
// their group passes the filter; zoneId only checks the group's own zone
// (e.g. Temple of Solusek Ro), not each member's individual zone.
export function getQuestGroups(classNames?: string[], zoneId?: string, levelMin?: number, levelMax?: number): QuestGroupSummary[] {
  const graph = load();
  const helpers = graphIndexHelpers(graph);
  const { nodeById, edgesFrom, edgesTo } = helpers;

  const results = graph.nodes
    .filter((n) => n.type === "quest_group" && matchesFilters(n, classNames, levelMin, levelMax))
    .map((n): QuestGroupSummary => {
      const id = n.id;
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
        label: n.label,
        description: n.description as string | undefined,
        classes: (n.classes as string[] | undefined) || [],
        minLevel: n.minLevel as number | undefined,
        maxLevel: n.maxLevel as number | undefined,
        steps: (n.steps as string[] | undefined) || [],
        zones,
        questGivers,
        members,
        ...(n.wiki_title ? { wikiTitle: n.wiki_title as string } : {}),
        ...resolveEra(n.era as string | undefined, zones.map((z) => z.id), helpers),
      };
    });

  return zoneId ? results.filter((q) => q.zones.some((z) => z.id === zoneId)) : results;
}

interface AdjEntry { zoneId: string; transport?: Transport; }

export function getZoneAdjacency(includeWizardPort = false): Map<string, AdjEntry[]> {
  const graph = load();
  const adj = new Map<string, AdjEntry[]>();
  for (const e of graph.edges) {
    if (e.type !== "connects_to") continue;
    if (e.transport === "wizard_port" && !includeWizardPort) continue;
    if (!adj.has(e.source)) adj.set(e.source, []);
    const entry: AdjEntry = { zoneId: e.target };
    if (e.transport) entry.transport = e.transport;
    adj.get(e.source)!.push(entry);
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

export interface RouteStep {
  name: string;
  via?: Transport;
  // Same era/outOfEra convention as ZoneSummary (resolveEra() below) --
  // present only when this *hop* (not necessarily the route's final
  // destination) is itself a confirmed out-of-era zone. A route can pass
  // through an out-of-era zone as a waypoint even when neither endpoint is
  // out of era (issue #35 -- Firiona Vie showing up unflagged mid-route),
  // so this has to be resolved per step, not just once for the destination.
  outOfEra?: boolean;
}

// Shared by getRoute() and rankZones() -- both turn a shortestPath() result
// into the same RouteStep[] shape that route-path.js renders (that
// component is itself shared between Maps' route-card and Spell Finder's
// zone-card), so the era badge only needs to be computed in one place for
// both surfaces to pick it up.
function buildRouteSteps(
  pathIds: PathStep[],
  nodeById: (id: string) => NodeData | undefined,
  helpers: GraphIndexHelpers
): RouteStep[] {
  return pathIds.map((step) => {
    const n = nodeById(step.zoneId);
    const entry: RouteStep = { name: n?.label || step.zoneId };
    if (step.via) entry.via = step.via;
    if (isOutOfEra(n?.era as string | undefined, helpers)) entry.outOfEra = true;
    return entry;
  });
}

function bfsPath(
  fromZoneId: string,
  toZoneId: string,
  adj: Map<string, AdjEntry[]>,
  skip: (zoneId: string) => boolean
): PathStep[] | null {
  const parent = new Map<string, { from: string; via?: Transport }>([[fromZoneId, { from: "" }]]);
  const queue = [fromZoneId];
  while (queue.length > 0) {
    const z = queue.shift()!;
    for (const { zoneId: neighbor, transport } of adj.get(z) || []) {
      if (parent.has(neighbor)) continue;
      if (neighbor !== toZoneId && skip(neighbor)) continue;
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
  return null;
}

// Out-of-era zones are disregarded as pure waypoints (issue #38) -- a route
// that could reach its destination via an in-era detour shouldn't walk
// straight through e.g. Firiona Vie just because that happens to be the
// shortest hop count. This reverses the "flag it, don't reroute" call
// documented for issue #35 in decisions/quest-era-flagging.md: that
// decision predates this issue and is superseded by it for waypoints
// specifically. The *destination* itself is still reachable even when it's
// out of era (that's a valid, intentional target, same as
// ZoneSummary/QuestSummary/ZoneRanking elsewhere), and `skip` never applies
// to it. If avoiding out-of-era zones leaves no route at all, fall back to
// the plain (era-blind) BFS rather than reporting the destination
// unreachable -- buildRouteSteps() still flags whichever out-of-era hops
// end up in that fallback route.
export function shortestPath(
  fromZoneId: string,
  toZoneId: string,
  helpers?: GraphIndexHelpers,
  includeWizardPort = false
): PathStep[] | null {
  if (fromZoneId === toZoneId) return [{ zoneId: fromZoneId }];
  const adj = getZoneAdjacency(includeWizardPort);
  const h = helpers ?? graphIndexHelpers(load());
  const isWaypointOutOfEra = (zoneId: string) => isOutOfEra(h.nodeById(zoneId)?.era as string | undefined, h);
  const avoidingOutOfEra = bfsPath(fromZoneId, toZoneId, adj, isWaypointOutOfEra);
  if (avoidingOutOfEra) return avoidingOutOfEra;
  return bfsPath(fromZoneId, toZoneId, adj, () => false);
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
  // Same era/outOfEra convention as ZoneSummary/QuestSummary (see
  // resolveEra() below) -- present only when this zone is itself confirmed
  // out-of-era. Spell Finder results include out-of-era zones (unlike
  // Quests/Maps, this list isn't otherwise filterable to just what's
  // reachable) so the UI needs this to warn rather than silently recommend
  // a zone the player can't actually reach yet.
  era?: string;
  outOfEra?: boolean;
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
  spellLineIds?: string[],
  includeWizardPort = false
): ZoneRanking[] {
  const graph = load();
  const helpers = graphIndexHelpers(graph);

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
  let candidates = graph.nodes.filter((n) => n.type === "spell" && n.class_levels);

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
    candidates = candidates.filter((n) => pinnedIds.has(n.id));
  } else {
    if (classNames.length > 0) {
      candidates = candidates.filter((n) =>
        n.class_levels!.some((cl) => classNames.includes(cl.class))
      );
    }
    if (lineFilterIds.size > 0) {
      candidates = candidates.filter((n) => {
        const line = spellLineOf(n.id, helpers);
        return line !== undefined && lineFilterIds.has(line.id);
      });
    }
  }

  const zoneSpells = new Map<string, SpellVendorInfo[]>();

  function addSpellToZones(spell: NodeData, matchingClasses: { cls: string; level: number }[]) {
    if (!matchingClasses.length) return;
    const sellers = helpers.edgesTo(spell.id, "sells");
    for (const seller of sellers) {
      const npcNode = helpers.nodeById(seller.source);
      const locEdge = helpers.edgesFrom(seller.source, "located_in")[0];
      if (!locEdge || !npcNode) continue;
      const zoneId = locEdge.target;
      if (!zoneSpells.has(zoneId)) zoneSpells.set(zoneId, []);
      const existing = zoneSpells.get(zoneId)!;
      const entry = existing.find((s) => s.id === spell.id);
      if (entry) {
        if (!entry.vendors.includes(npcNode.label)) entry.vendors.push(npcNode.label);
      } else {
        const d = spell;
        const details: SpellDetails = {};
        for (const k of ["description","mana","skill","castTime","recastTime","fizzleTime","duration","targetType","spellType","resist","range"] as const) {
          if (d[k] !== undefined) (details as Record<string, unknown>)[k] = d[k];
        }
        const line = spellLineOf(d.id, helpers);
        existing.push({ id: d.id, name: d.label, classes: matchingClasses, vendors: [npcNode.label], ...(line ? { spellLine: line.label } : {}), ...details });
      }
    }
  }

  // Step 4 — apply level filter per-spell and map to vendor zones; pinned
  // spells bypass the level filter too and show all their real class/level
  // pairs, same reasoning as the class bypass above.
  for (const spell of candidates) {
    let matchingClasses: { cls: string; level: number }[];
    if (pinnedIds.has(spell.id)) {
      matchingClasses = spell.class_levels!.map((cl) => ({ cls: cl.class, level: cl.level }));
    } else if (classNames.length > 0) {
      matchingClasses = spell.class_levels!
        .filter((cl) => classNames.includes(cl.class) && levels.includes(cl.level))
        .map((cl) => ({ cls: cl.class, level: cl.level }));
    } else {
      matchingClasses = spell.class_levels!
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
    const zoneNode = helpers.nodeById(zoneId);
    const pathIds = shortestPath(currentZoneId, zoneId, helpers, includeWizardPort);
    const hops = pathIds ? pathIds.length - 1 : null;
    const route: RouteStep[] = pathIds ? buildRouteSteps(pathIds, (id) => helpers.nodeById(id), helpers) : [];

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
      ...resolveEra(zoneNode?.era as string | undefined, [], helpers),
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
  // One entry per floor/level (the zone node's own `maps` field, migration
  // 125 — see decisions/zone-multi-floor-maps.md for why this replaced the
  // old flat map_image/map_legend pair). `image` is a filename under
  // public/maps/ — a self-hosted copy of eqlwiki.com's own zone map, not a
  // URL to eqlwiki.com itself. `label` is the floor name as eqlwiki.com
  // names it ("Levels One and Two", "Floor Three"), or null for the
  // ordinary single-map zone. `legend.key` is the literal string printed
  // on that floor's map (not assumed numeric; some zones' maps key with
  // letters instead), since the marker's position is drawn into the image
  // itself and isn't recoverable as a coordinate. Empty array for the many
  // zones with no map sourced yet.
  maps: { label: string | null; image: string; legend: { key: string; label: string }[] }[];
  // The zone node's own `zoneType` field (migration 266,
  // decisions/npc-mob-unification-and-zone-groups.md) -- drives Maps'
  // grouped-Bestiary display order client-side. Every zone got classified
  // by that migration; null is just defensive typing for a future zone
  // node that forgets to set one, same as this interface's other
  // possibly-missing fields.
  zoneType: "city" | "dungeon" | "open_world" | null;
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
      .filter((e) => e.type === "located_in" && e.target === zoneId)
      .map((e) => e.source)
  );
  const vendorIds = new Set<string>();
  const spellIds = new Set<string>();
  for (const e of graph.edges) {
    if (e.type === "sells" && npcIds.has(e.source)) {
      vendorIds.add(e.source);
      spellIds.add(e.target);
    }
  }
  let min = Infinity;
  let max = -Infinity;
  for (const spellId of spellIds) {
    const spell = graph.nodes.find((n) => n.id === spellId);
    for (const cl of spell?.class_levels || []) {
      if (cl.level < min) min = cl.level;
      if (cl.level > max) max = cl.level;
    }
  }
  const zone = graph.nodes.find((n) => n.id === zoneId);
  return {
    vendorCount: vendorIds.size,
    levelRange: Number.isFinite(min) ? { min, max } : null,
    lore: (zone?.lore as string | undefined) ?? null,
    wikiTitle: (zone?.wiki_title as string | undefined) ?? null,
    maps: (zone?.maps as ZoneVendorInfo["maps"] | undefined) ?? [],
    zoneType: (zone?.zoneType as ZoneVendorInfo["zoneType"]) ?? null,
  };
}

// stopZoneIds (issue #63's "add stop") are visited in order between from and
// to -- each consecutive pair (from→stop1, stop1→stop2, ..., stopN→to) is its
// own independent shortestPath() call, stitched into one continuous path
// rather than a single BFS that happens to pass through every stop, since
// the visitor is asking for specific waypoints, not "the shortest route that
// merely touches these zones somewhere." A leg's own start entry is dropped
// when concatenating (except the very first leg's) so a stop zone doesn't
// appear twice in a row -- it carries no `via` of its own anyway (that's on
// the entry after it), so nothing is lost by dropping it. If a stop equals
// its own neighbor (or from===to with no stops), shortestPath's own
// from===to short-circuit yields a redundant single-entry leg that
// contributes nothing once its start entry is dropped -- a harmless no-op,
// not a real route through nothing. Any unreachable leg fails the whole
// route (null hops, empty steps) rather than silently skipping a stop the
// visitor explicitly asked to pass through.
export function getRoute(
  fromZoneId: string,
  toZoneId: string,
  includeWizardPort = false,
  stopZoneIds: string[] = []
): { hops: number | null; route: RouteStep[]; destination: ZoneVendorInfo } {
  const graph = load();
  const helpers = graphIndexHelpers(graph);
  const waypoints = [fromZoneId, ...stopZoneIds, toZoneId];
  const pathIds: PathStep[] = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const leg = shortestPath(waypoints[i], waypoints[i + 1], helpers, includeWizardPort);
    if (!leg) return { hops: null, route: [], destination: getZoneVendorInfo(toZoneId) };
    pathIds.push(...(i === 0 ? leg : leg.slice(1)));
  }
  const hops = pathIds.length - 1;
  const route: RouteStep[] = buildRouteSteps(pathIds, (id) => graph.nodes.find((n) => n.id === id), helpers);
  return { hops, route, destination: getZoneVendorInfo(toZoneId) };
}

export interface ZoneDistance { hops: number; route: RouteStep[]; }

// Batched sibling of getRoute() -- same shortestPath()/buildRouteSteps()
// machinery, one call from a single origin to several target zones instead
// of one pair, for callers ranking multiple destinations against one
// starting point (Tradeskills' own "Find Near Me": several vendor zones
// against one shopping trip's starting zone) without a round trip per
// target. null means genuinely unreachable, same as getRoute()'s hops.
export function getZoneDistances(
  fromZoneId: string,
  targetZoneIds: string[],
  includeWizardPort = false
): Record<string, ZoneDistance | null> {
  const graph = load();
  const helpers = graphIndexHelpers(graph);
  const result: Record<string, ZoneDistance | null> = {};
  for (const zoneId of new Set(targetZoneIds)) {
    const pathIds = shortestPath(fromZoneId, zoneId, helpers, includeWizardPort);
    result[zoneId] = pathIds
      ? { hops: pathIds.length - 1, route: buildRouteSteps(pathIds, (id) => helpers.nodeById(id), helpers) }
      : null;
  }
  return result;
}

// --- Writes ---

export function addSpell(name: string, classLevels: ClassLevel[]): NodeData {
  const graph = load();
  const id = `spell:${slugify(name)}`;
  if (graph.nodes.some((n) => n.id === id)) {
    throw new Error(`Spell already exists: ${id}`);
  }
  const data: NodeData = { id, label: name, type: "spell", class_levels: classLevels };
  graph.nodes.push(data);
  save(graph);
  return data;
}

export function addZone(name: string): NodeData {
  const graph = load();
  const id = `zone:${slugify(name)}`;
  const existing = graph.nodes.find((n) => n.id === id);
  if (existing) return existing;
  const data: NodeData = { id, label: name, type: "zone" };
  graph.nodes.push(data);
  save(graph);
  return data;
}

export function addNpc(name: string, zoneName: string, roles: string[] = ["vendor"]): NodeData {
  const graph = load();
  const zoneId = `zone:${slugify(zoneName)}`;
  const npcId = `npc:${slugify(zoneName)}:${slugify(name)}`;

  if (!graph.nodes.some((n) => n.id === zoneId)) {
    graph.nodes.push({ id: zoneId, label: zoneName, type: "zone" });
  }

  if (!graph.nodes.some((n) => n.id === npcId)) {
    const data: NodeData = { id: npcId, label: name, type: "npc", roles };
    graph.nodes.push(data);
    graph.edges.push(
      { id: nextEdgeId(graph, "e-loc"), source: npcId, target: zoneId, type: "located_in" }
    );
    save(graph);
    return data;
  }

  return graph.nodes.find((n) => n.id === npcId)!;
}

export function addSellsEdge(npcId: string, spellId: string): EdgeData {
  const graph = load();
  if (!graph.nodes.some((n) => n.id === npcId)) throw new Error(`NPC not found: ${npcId}`);
  if (!graph.nodes.some((n) => n.id === spellId)) throw new Error(`Spell not found: ${spellId}`);

  const existing = graph.edges.find(
    (e) => e.source === npcId && e.target === spellId && e.type === "sells"
  );
  if (existing) return existing;

  const data: EdgeData = { id: nextEdgeId(graph, "e-sells"), source: npcId, target: spellId, type: "sells" };
  graph.edges.push(data);
  save(graph);
  return data;
}

export function addConnectsTo(zoneA: string, zoneB: string): void {
  const graph = load();
  const idA = `zone:${slugify(zoneA)}`;
  const idB = `zone:${slugify(zoneB)}`;

  for (const id of [idA, idB]) {
    if (!graph.nodes.some((n) => n.id === id)) {
      const label = id === idA ? zoneA : zoneB;
      graph.nodes.push({ id, label, type: "zone" });
    }
  }

  const hasAB = graph.edges.some(
    (e) => e.type === "connects_to" && e.source === idA && e.target === idB
  );
  const hasBA = graph.edges.some(
    (e) => e.type === "connects_to" && e.source === idB && e.target === idA
  );

  if (!hasAB) graph.edges.push({ id: nextEdgeId(graph, "e-conn"), source: idA, target: idB, type: "connects_to" });
  if (!hasBA) graph.edges.push({ id: nextEdgeId(graph, "e-conn"), source: idB, target: idA, type: "connects_to" });
  save(graph);
}

export function removeNode(id: string): boolean {
  const graph = load();
  const idx = graph.nodes.findIndex((n) => n.id === id);
  if (idx === -1) return false;
  graph.nodes.splice(idx, 1);
  graph.edges = graph.edges.filter((e) => e.source !== id && e.target !== id);
  save(graph);
  return true;
}

export function updateNode(id: string, updates: Partial<NodeData>): NodeData | undefined {
  const graph = load();
  const node = graph.nodes.find((n) => n.id === id);
  if (!node) return undefined;
  Object.assign(node, updates);
  node.id = id;
  save(graph);
  return node;
}

export function stats() {
  const graph = load();
  const byType = (t: string) => graph.nodes.filter((n) => n.type === t).length;
  const edgeByType = (t: string) => graph.edges.filter((e) => e.type === t).length;
  return {
    nodes: { spells: byType("spell"), npcs: byType("npc"), zones: byType("zone") },
    edges: { sells: edgeByType("sells"), located_in: edgeByType("located_in"), connects_to: edgeByType("connects_to") },
  };
}
