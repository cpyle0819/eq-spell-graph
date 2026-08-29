import { getGraph, getSpellsForClass, getAllSpells, getVendorsForSpell, rankGoods, getItemTypes, getItemType, SPELL_TYPE, ANY_TYPE, getRoute, getZoneDistances, stats, getSpellLines, getQuests, getQuestGroups, getZones, getZoneNpcs, getItemsByIds, getTradeskills, getRecipes, getTradeskillVendors, getItemSources, getTradeskillLevelingCities, getTradeskillCompatibility, getRecipeTree, type NodeData } from "./graph";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export interface ApiResult {
  status: number;
  body: unknown;
}

/**
 * Read-only API routes, shared between the local Bun dev server
 * (src/server.ts) and the production Lambda (src/lambda.ts). Mutation
 * routes (POST/DELETE) are intentionally not here — they're dev-only,
 * handled directly in server.ts, and never deployed to the public Lambda.
 */
export async function handleApi(pathname: string, searchParams: URLSearchParams): Promise<ApiResult | null> {
  if (pathname === "/api/graph") {
    return { status: 200, body: getGraph() };
  }

  if (pathname === "/api/stats") {
    return { status: 200, body: stats() };
  }

  // GET /api/spells/search?q=spirit
  if (pathname === "/api/spells/search") {
    const q = (searchParams.get("q") || "").toLowerCase().trim();
    if (q.length < 2) return { status: 200, body: [] };
    const graph = getGraph();
    const matches = graph.nodes
      .filter((n) => n.type === "spell" && n.label.toLowerCase().includes(q))
      .map((n) => ({ id: n.id, label: n.label }))
      .sort((a, b) => {
        const ai = a.label.toLowerCase().indexOf(q), bi = b.label.toLowerCase().indexOf(q);
        return ai !== bi ? ai - bi : a.label.localeCompare(b.label);
      })
      .slice(0, 12);
    return { status: 200, body: matches };
  }

  // GET /api/spells?class=shaman,druid&levels=9,10,11 — omitting class (or
  // passing an empty value) returns spells for every class, matching the
  // "no filter = everything" convention /api/stances-invocations and /api/aa
  // already use for an empty classNames list.
  if (pathname === "/api/spells") {
    const classes = (searchParams.get("class") || "").split(",").filter(Boolean);
    const levelsParam = searchParams.get("levels");
    const levels = levelsParam ? levelsParam.split(",").map(Number) : undefined;
    const byId = new Map<string, NodeData>();
    const spells = classes.length > 0
      ? classes.flatMap((cls) => getSpellsForClass(cls, levels))
      : getAllSpells(levels);
    for (const spell of spells) byId.set(spell.id, spell);
    return { status: 200, body: [...byId.values()] };
  }

  // GET /api/spell/:id/vendors
  if (pathname.startsWith("/api/spell/") && pathname.endsWith("/vendors")) {
    const id = decodeURIComponent(pathname.slice("/api/spell/".length, -"/vendors".length));
    return { status: 200, body: getVendorsForSpell(id) };
  }

  // GET /api/plan?class=shaman,druid&from=halas&race=barbarian&primaryClass=shaman&deity=the+tribunal&type=Spell
  // type (default SPELL_TYPE, so an old saved state/URL with no type param
  // still plans spells) selects which good to find: SPELL_TYPE ranks spells
  // (class+spell-line matching against spell.class_levels; no level here,
  // see below), ANY_TYPE ranks every item/container regardless of computed
  // type, anything else ranks items/containers whose computed type
  // (classifyItemType(), src/graph.ts) matches -- a real value from
  // /api/item-types. Either way returns { goods, ... } (rankGoods(),
  // src/graph.ts): one entry per matching spell/item, each carrying every
  // zone/vendor that actually sells it as `offers` (possibly empty, for an
  // item with no vendor at all) -- "find the item, vendor is a byproduct of
  // that." Level stays a purely client-side display filter over the
  // returned spell pool (public/app.js), never sent here, since a class
  // vendor sells its class's whole spellbook regardless of level.
  if (pathname === "/api/plan") {
    const type = searchParams.get("type") || SPELL_TYPE;
    const classNames = (searchParams.get("class") || "").split(",").filter(Boolean);
    const from = searchParams.get("from") || "";
    const race = searchParams.get("race") || undefined;
    const primaryClass = searchParams.get("primaryClass") || undefined;
    const deity = searchParams.get("deity") || undefined;
    // Empty rather than a bogus `zone:` id when no zone was picked --
    // buildZoneRankingBase() (src/graph.ts) treats a falsy currentZoneId as
    // "no origin, skip routing" instead of trying to path from a zone that
    // doesn't exist.
    const fromId = from ? `zone:${slugify(from)}` : "";
    const specificZoneIds = (searchParams.get("zones") || "").split(",").filter(Boolean);
    const includePorts = searchParams.get("ports") === "1";

    if (type !== SPELL_TYPE) {
      const extraItemIds = (searchParams.get("items") || "").split(",").filter(Boolean);
      return {
        status: 200,
        body: rankGoods(type, classNames, fromId, race, primaryClass, deity, extraItemIds, specificZoneIds, undefined, includePorts),
      };
    }

    const extraSpellIds = (searchParams.get("spells") || "").split(",").filter(Boolean);
    const spellLineIds = (searchParams.get("lines") || "").split(",").filter(Boolean);
    return { status: 200, body: rankGoods(SPELL_TYPE, classNames, fromId, race, primaryClass, deity, extraSpellIds, specificZoneIds, spellLineIds, includePorts) };
  }

  // GET /api/route?from=Halas&to=Kelethin&ports=1&avoidDanger=1&stops=West
  // Commonlands,East Freeport — ports opts into wizard_port/druid_port edges
  // (Wizard- or Druid-only teleport spells, e.g. to Plane of Sky or Circle
  // of Toxxulia) being part of the route; omitted/not "1" means ordinary
  // pathfinding only, same default as rankZones/getZoneDistances below.
  // avoidDanger opts into terror-aware routing (decisions/
  // danger-aware-routing-bounded-hop-budget.md), same opt-in shape as
  // ports. era opts into allowing a route through a confirmed out-of-era
  // zone (waypoint or destination) -- omitted/not "1" means such a route
  // is blocked (blockedByEra: true in the response) rather than silently
  // returned. stops (issue #63's "add stop") is a comma-separated, ordered
  // list of zone names to route through between from and to.
  if (pathname === "/api/route") {
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";
    if (!from || !to) return { status: 400, body: { error: "from and to required" } };
    const includePorts = searchParams.get("ports") === "1";
    const avoidDanger = searchParams.get("avoidDanger") === "1";
    const allowOutOfEra = searchParams.get("era") === "1";
    const stops = (searchParams.get("stops") || "").split(",").filter(Boolean).map((s) => `zone:${slugify(s)}`);
    return { status: 200, body: getRoute(`zone:${slugify(from)}`, `zone:${slugify(to)}`, includePorts, stops, avoidDanger, allowOutOfEra) };
  }

  // GET /api/zone-distances?from=zone:east-freeport&zones=zone:a,zone:b —
  // hops + route (getRoute()'s own shape) from one zone to each of several
  // target zones in one call, e.g. Tradeskills' "Find Near Me" ranking
  // several vendor zones against one shopping trip's starting zone.
  if (pathname === "/api/zone-distances") {
    const from = searchParams.get("from") || "";
    const zones = (searchParams.get("zones") || "").split(",").filter(Boolean);
    if (!from || !zones.length) return { status: 200, body: {} };
    const includePorts = searchParams.get("ports") === "1";
    const avoidDanger = searchParams.get("avoidDanger") === "1";
    return { status: 200, body: getZoneDistances(from, zones, includePorts, avoidDanger) };
  }

  // GET /api/classes — list classes that have spell data
  if (pathname === "/api/classes") {
    const graph = getGraph();
    const classes = new Set<string>();
    for (const n of graph.nodes) {
      if (n.type === "spell" && n.class_levels) {
        for (const cl of n.class_levels) {
          classes.add(cl.class);
        }
      }
    }
    return { status: 200, body: [...classes].sort() };
  }

  // GET /api/classes/abilities — list classes that have stance/invocation/AA/
  // ability data. A separate roster from /api/classes: it includes classes
  // with no purchasable spells (e.g. berserker) — see decisions/. Powers
  // the Class Browser page's class pickers.
  if (pathname === "/api/classes/abilities") {
    const graph = getGraph();
    const classes = new Set<string>();
    for (const n of graph.nodes) {
      if ((n.type === "stance" || n.type === "invocation" || n.type === "aa") && n.classes) {
        for (const cls of n.classes as string[]) classes.add(cls);
      }
      if (n.type === "ability" && n.class_levels) {
        for (const cl of n.class_levels as { class: string }[]) classes.add(cl.class);
      }
    }
    return { status: 200, body: [...classes].sort() };
  }

  // GET /api/stances-invocations?class=warrior,paladin — stances/invocations
  // available to any of the given classes (1-3 expected from the UI, but
  // not enforced server-side).
  if (pathname === "/api/stances-invocations") {
    const classNames = (searchParams.get("class") || "").split(",").filter(Boolean);
    const graph = getGraph();
    const matches = (type: "stance" | "invocation") =>
      graph.nodes
        .filter((n) => n.type === type && n.classes &&
          (classNames.length === 0 || (n.classes as string[]).some((c) => classNames.includes(c))))
        .map((n) => ({
          id: n.id,
          name: n.label,
          description: n.description,
          classes: n.classes,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    return { status: 200, body: { stances: matches("stance"), invocations: matches("invocation") } };
  }

  // GET /api/aa?class=warrior,paladin — Alternate Advancement entries
  // available to any of the given classes, grouped by wiki category
  // (general/archetype/class/special — general/archetype/special apply to
  // every class, so they show up regardless of which classes are selected).
  if (pathname === "/api/aa") {
    const classNames = (searchParams.get("class") || "").split(",").filter(Boolean);
    const graph = getGraph();
    const categories = ["general", "archetype", "class", "special"] as const;
    const matches = (category: (typeof categories)[number]) =>
      graph.nodes
        .filter((n) => n.type === "aa" && n.category === category && n.classes &&
          (classNames.length === 0 || (n.classes as string[]).some((c) => classNames.includes(c))))
        .map((n) => ({
          id: n.id,
          name: n.label,
          description: n.description,
          ranks: n.ranks,
          cost: n.cost,
          classes: n.classes,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    const body: Record<string, unknown> = {};
    for (const category of categories) body[category] = matches(category);
    return { status: 200, body };
  }

  // GET /api/abilities?class=rogue,paladin — class-defining special combat
  // actions that aren't spells/stances/invocations/AAs (Rogue poison
  // disciplines, Backstab, Kick, Taunt, etc. — see migration 018 and
  // decisions/). Uses class_levels like spells (not a flat classes
  // array) since several of these are granted to multiple classes at
  // different levels each.
  //
  // Sorted by whether the ability has a visible poison-type tag at all
  // (Combat/Utility), then by that category, then by name. "special" (i.e.
  // no Combat/Utility badge rendered — see renderAbilityCard in
  // class-browser.js) counts as zero categories and sorts first — Backstab,
  // Kick, Disarm, etc. come before any Rogue poison. Category is still the
  // tie-breaker within that, so poisons sharing a category (Combat vs.
  // Utility) end up adjacent without a dedicated section header for it —
  // generic on purpose, groups by whatever `category` values happen to
  // exist rather than special-casing poison names.
  if (pathname === "/api/abilities") {
    const classNames = (searchParams.get("class") || "").split(",").filter(Boolean);
    const graph = getGraph();
    const hasPoisonTag = (category: unknown) => category === "combat" || category === "utility" ? 1 : 0;
    return {
      status: 200,
      body: graph.nodes
        .filter((n) => n.type === "ability" && n.class_levels &&
          (classNames.length === 0 || (n.class_levels as { class: string }[]).some((cl) => classNames.includes(cl.class))))
        .map((n) => ({
          id: n.id,
          name: n.label,
          description: n.description,
          class_levels: n.class_levels,
          duration: n.duration,
          reuseTime: n.reuseTime,
          category: n.category,
        }))
        .sort((a, b) =>
          hasPoisonTag(a.category) - hasPoisonTag(b.category) ||
          ((a.category as string) || "").localeCompare((b.category as string) || "") ||
          a.name.localeCompare(b.name)
        ),
    };
  }

  // GET /api/spell-lines — list all spell_line nodes (id+label), for the
  // Spell Finder's Spell Line tag filter's suggestions.
  if (pathname === "/api/spell-lines") {
    return { status: 200, body: getSpellLines() };
  }

  // GET /api/item-types -- every distinct good type, for the Items page's
  // Type filter. SPELL_TYPE is always first and always present (src/graph.ts);
  // the rest are whatever classifyItemType() values actually occur among
  // today's item/container nodes, sorted alphabetically after it -- computed
  // over every item, not just ones with a real `sells` edge, since an item
  // with no vendor at all is still findable. Same "let types drive the
  // filters" convention migration 400's category list used.
  if (pathname === "/api/item-types") {
    return { status: 200, body: getItemTypes() };
  }

  // GET /api/items/search?q=flask&type=Armor -- item name search for the
  // Items page's Specific Items tag input, same shape/contract as
  // /api/spells/search. type (optional) scopes to one computed item type so
  // the suggestions match whatever Type is currently selected, same idea as
  // /api/npcs' required zone scoping.
  if (pathname === "/api/items/search") {
    const q = (searchParams.get("q") || "").toLowerCase().trim();
    const rawType = searchParams.get("type") || undefined;
    const type = rawType === ANY_TYPE ? undefined : rawType;
    if (q.length < 2) return { status: 200, body: [] };
    const graph = getGraph();
    const matches = graph.nodes
      .filter((n) =>
        (n.type === "item" || n.type === "container") &&
        n.label.toLowerCase().includes(q) &&
        (!type || getItemType(n.id) === type)
      )
      .map((n) => ({ id: n.id, label: n.label }))
      .sort((a, b) => {
        const ai = a.label.toLowerCase().indexOf(q), bi = b.label.toLowerCase().indexOf(q);
        return ai !== bi ? ai - bi : a.label.localeCompare(b.label);
      })
      .slice(0, 12);
    return { status: 200, body: matches };
  }

  // GET /api/quests?class=warrior,paladin&zone=zone:ak-anon&levelMin=9&levelMax=11
  // — class (if given) excludes classless "anyone" quests rather than
  // unioning with them, zone narrows to quests located in that zone,
  // levelMin/levelMax keep quests whose own minLevel (start level) falls in
  // that range. See getQuests() in src/graph.ts.
  if (pathname === "/api/quests") {
    const classes = (searchParams.get("class") || "").split(",").filter(Boolean);
    const zone = searchParams.get("zone") || undefined;
    const levelMinParam = searchParams.get("levelMin");
    const levelMaxParam = searchParams.get("levelMax");
    const levelMin = levelMinParam ? Number(levelMinParam) : undefined;
    const levelMax = levelMaxParam ? Number(levelMaxParam) : undefined;
    return { status: 200, body: getQuests(classes, zone, levelMin, levelMax) };
  }

  // GET /api/quest-groups?class=paladin&zone=...&levelMin=...&levelMax=... —
  // same filter semantics as /api/quests, applied to quest_group nodes; each
  // result carries its resolved `members` (full QuestSummary per sub-quest).
  // See getQuestGroups() in src/graph.ts and decisions/quest-group-node-type.md.
  if (pathname === "/api/quest-groups") {
    const classes = (searchParams.get("class") || "").split(",").filter(Boolean);
    const zone = searchParams.get("zone") || undefined;
    const levelMinParam = searchParams.get("levelMin");
    const levelMaxParam = searchParams.get("levelMax");
    const levelMin = levelMinParam ? Number(levelMinParam) : undefined;
    const levelMax = levelMaxParam ? Number(levelMaxParam) : undefined;
    return { status: 200, body: getQuestGroups(classes, zone, levelMin, levelMax) };
  }

  // GET /api/zones — list all zone nodes
  if (pathname === "/api/zones") {
    return { status: 200, body: getZones() };
  }

  // GET /api/npcs?zone=zone:oasis-of-marr — every npc located_in that zone
  // (vendors, quest-givers, guards, guildmasters, mobs alike — see
  // decisions/npc-mob-unification-and-zone-groups.md). zone is required
  // (unlike /api/quests' optional one); see getZoneNpcs()'s own comment in
  // src/graph.ts for why. Empty zone param -> empty result, not every npc
  // in the graph.
  if (pathname === "/api/npcs") {
    const zone = searchParams.get("zone") || "";
    return { status: 200, body: zone ? getZoneNpcs(zone) : [] };
  }

  // GET /api/items?ids=item:a,item:b — full ItemSummary per id, for a page
  // (leveling-guide.html) that names specific items in hand-authored prose
  // rather than rendering a quest/npc query's own resolved item fields.
  if (pathname === "/api/items") {
    const ids = (searchParams.get("ids") || "").split(",").filter(Boolean);
    return { status: 200, body: ids.length ? getItemsByIds(ids) : [] };
  }

  // GET /api/tradeskills — distinct recipe.tradeskill values, for the
  // Tradeskills page's own select box.
  if (pathname === "/api/tradeskills") {
    return { status: 200, body: getTradeskills() };
  }

  // GET /api/recipes?tradeskill=Brewing — every recipe for that trade,
  // sorted by trivial (the leveling-guide order).
  if (pathname === "/api/recipes") {
    const tradeskill = searchParams.get("tradeskill") || "";
    return { status: 200, body: tradeskill ? getRecipes(tradeskill) : [] };
  }

  // GET /api/tradeskill-vendors?tradeskill=Brewing&zone=zone:east-freeport —
  // vendor npcs selling that trade's recipe ingredients. zone is optional —
  // omitted means every zone (the Tradeskills page's own default), unlike
  // /api/npcs' required one.
  if (pathname === "/api/tradeskill-vendors") {
    const tradeskill = searchParams.get("tradeskill") || "";
    const zone = searchParams.get("zone") || undefined;
    return { status: 200, body: tradeskill ? getTradeskillVendors(tradeskill, zone) : [] };
  }

  // GET /api/tradeskill-leveling-cities?tradeskill=Brewing — the top 3
  // cities by ingredient coverage to shop that trade's leveling-guide
  // ingredients in (decisions/city-alignment-good-evil.md).
  if (pathname === "/api/tradeskill-leveling-cities") {
    const tradeskill = searchParams.get("tradeskill") || "";
    return { status: 200, body: tradeskill ? getTradeskillLevelingCities(tradeskill) : { totalIngredients: 0, topCities: [] } };
  }

  // GET /api/tradeskill-compatibility?tradeskill=Baking — the other
  // tradeskill that pairs best with this one, by combined cross-trade
  // ingredient/tool dependency in both directions (decisions/
  // tradeskill-compatibility-cross-trade-dependency.md).
  if (pathname === "/api/tradeskill-compatibility") {
    const tradeskill = searchParams.get("tradeskill") || "";
    return { status: 200, body: tradeskill ? getTradeskillCompatibility(tradeskill) : { mostCompatible: null } };
  }

  // GET /api/recipe-tree?id=recipe:pot — the full recursive ingredient tree
  // for one specific recipe (decisions/recipe-ingredient-tree.md), fetched
  // on demand when a card's own "Show Ingredient Tree" toggle is first
  // opened. Not scoped to any tradeskill -- a crafted ingredient can be
  // produced by a recipe belonging to a different one entirely.
  if (pathname === "/api/recipe-tree") {
    const id = searchParams.get("id") || "";
    const tree = id ? getRecipeTree(id) : undefined;
    return { status: 200, body: tree ?? null };
  }

  // GET /api/item-sources?ids=item:a,item:b — Foraged In/Fished From/
  // Dropped By/Crafted In facts for ingredient-card.js (issue #55), same
  // comma-separated-ids convention as /api/items.
  if (pathname === "/api/item-sources") {
    const ids = (searchParams.get("ids") || "").split(",").filter(Boolean);
    return { status: 200, body: ids.length ? getItemSources(ids) : [] };
  }

  return null;
}
