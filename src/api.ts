import { getGraph, getSpellsForClass, getVendorsForSpell, rankZones, getRoute, stats, type NodeData } from "./graph";

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
      .filter((n) => n.data.type === "spell" && n.data.label.toLowerCase().includes(q))
      .map((n) => ({ id: n.data.id, label: n.data.label }))
      .sort((a, b) => {
        const ai = a.label.toLowerCase().indexOf(q), bi = b.label.toLowerCase().indexOf(q);
        return ai !== bi ? ai - bi : a.label.localeCompare(b.label);
      })
      .slice(0, 12);
    return { status: 200, body: matches };
  }

  // GET /api/spells?class=shaman,druid&levels=9,10,11
  if (pathname === "/api/spells") {
    const classes = (searchParams.get("class") || "shaman").split(",").filter(Boolean);
    const levelsParam = searchParams.get("levels");
    const levels = levelsParam ? levelsParam.split(",").map(Number) : undefined;
    const byId = new Map<string, NodeData>();
    for (const cls of classes) {
      for (const spell of getSpellsForClass(cls, levels)) byId.set(spell.id, spell);
    }
    return { status: 200, body: [...byId.values()] };
  }

  // GET /api/spell/:id/vendors
  if (pathname.startsWith("/api/spell/") && pathname.endsWith("/vendors")) {
    const id = decodeURIComponent(pathname.slice("/api/spell/".length, -"/vendors".length));
    return { status: 200, body: getVendorsForSpell(id) };
  }

  // GET /api/plan?class=shaman,druid&levels=9,10&from=halas&race=barbarian&primaryClass=shaman&deity=the+tribunal
  if (pathname === "/api/plan") {
    const classNames = (searchParams.get("class") || "").split(",").filter(Boolean);
    const levelMin = parseInt(searchParams.get("levelMin") || "1");
    const levelMax = parseInt(searchParams.get("levelMax") || "1");
    const levels: number[] = [];
    for (let i = levelMin; i <= levelMax; i++) levels.push(i);
    const from = searchParams.get("from") || "";
    const race = searchParams.get("race") || undefined;
    const primaryClass = searchParams.get("primaryClass") || undefined;
    const deity = searchParams.get("deity") || undefined;
    const fromId = `zone:${slugify(from)}`;
    const extraSpellIds = (searchParams.get("spells") || "").split(",").filter(Boolean);
    const specificZoneIds = (searchParams.get("zones") || "").split(",").filter(Boolean);
    return { status: 200, body: rankZones(classNames, levels, fromId, race, primaryClass, deity, extraSpellIds, specificZoneIds) };
  }

  // GET /api/route?from=Halas&to=Kelethin
  if (pathname === "/api/route") {
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";
    if (!from || !to) return { status: 400, body: { error: "from and to required" } };
    return { status: 200, body: getRoute(`zone:${slugify(from)}`, `zone:${slugify(to)}`) };
  }

  // GET /api/classes — list classes that have spell data
  if (pathname === "/api/classes") {
    const graph = getGraph();
    const classes = new Set<string>();
    for (const n of graph.nodes) {
      if (n.data.type === "spell" && n.data.class_levels) {
        for (const cl of n.data.class_levels) {
          classes.add(cl.class);
        }
      }
    }
    return { status: 200, body: [...classes].sort() };
  }

  // GET /api/classes/abilities — list classes that have stance/invocation/AA
  // data. A separate roster from /api/classes: it includes classes with no
  // purchasable spells (e.g. berserker) — see DECISIONS.md. Powers the Class
  // Browser page's class pickers.
  if (pathname === "/api/classes/abilities") {
    const graph = getGraph();
    const classes = new Set<string>();
    for (const n of graph.nodes) {
      if ((n.data.type === "stance" || n.data.type === "invocation" || n.data.type === "aa") && n.data.classes) {
        for (const cls of n.data.classes as string[]) classes.add(cls);
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
        .filter((n) => n.data.type === type && n.data.classes &&
          (classNames.length === 0 || (n.data.classes as string[]).some((c) => classNames.includes(c))))
        .map((n) => ({
          id: n.data.id,
          name: n.data.label,
          description: n.data.description,
          classes: n.data.classes,
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
        .filter((n) => n.data.type === "aa" && n.data.category === category && n.data.classes &&
          (classNames.length === 0 || (n.data.classes as string[]).some((c) => classNames.includes(c))))
        .map((n) => ({
          id: n.data.id,
          name: n.data.label,
          description: n.data.description,
          ranks: n.data.ranks,
          cost: n.data.cost,
          classes: n.data.classes,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    const body: Record<string, unknown> = {};
    for (const category of categories) body[category] = matches(category);
    return { status: 200, body };
  }

  // GET /api/zones — list all zone nodes
  if (pathname === "/api/zones") {
    const graph = getGraph();
    const zones = graph.nodes
      .filter((n) => n.data.type === "zone")
      .map((n) => ({ id: n.data.id, label: n.data.label }))
      .sort((a, b) => a.label.localeCompare(b.label));
    return { status: 200, body: zones };
  }

  return null;
}
