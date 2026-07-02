import {
  getGraph, getSpellsForClass, getVendorsForSpell,
  rankZones, addSpell, addZone, addNpc, addSellsEdge,
  addConnectsTo, removeNode, stats
} from "./graph";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const server = Bun.serve({
  port: 4321,
  async fetch(req) {
    const url = new URL(req.url);

    // --- API ---

    if (url.pathname === "/api/graph") {
      return Response.json(getGraph());
    }

    if (url.pathname === "/api/stats") {
      return Response.json(stats());
    }

    // GET /api/spells?class=shaman&levels=9,10,11
    if (url.pathname === "/api/spells") {
      const cls = url.searchParams.get("class") || "shaman";
      const levelsParam = url.searchParams.get("levels");
      const levels = levelsParam ? levelsParam.split(",").map(Number) : undefined;
      return Response.json(getSpellsForClass(cls, levels));
    }

    // GET /api/spell/:id/vendors
    if (url.pathname.startsWith("/api/spell/") && url.pathname.endsWith("/vendors")) {
      const id = decodeURIComponent(url.pathname.slice("/api/spell/".length, -"/vendors".length));
      return Response.json(getVendorsForSpell(id));
    }

    // GET /api/plan?class=shaman&levels=9,10&from=halas&race=barbarian&primaryClass=shaman&deity=the+tribunal
    if (url.pathname === "/api/plan") {
      const cls = url.searchParams.get("class") || "shaman";
      const levelsParam = url.searchParams.get("levels") || "";
      const levels = levelsParam.split(",").map(Number).filter(Boolean);
      const from = url.searchParams.get("from") || "";
      const race = url.searchParams.get("race") || undefined;
      const primaryClass = url.searchParams.get("primaryClass") || undefined;
      const deity = url.searchParams.get("deity") || undefined;
      const fromId = `zone:${slugify(from)}`;
      if (!levels.length) return Response.json({ error: "levels required" }, { status: 400 });
      return Response.json(rankZones(cls, levels, fromId, race, primaryClass, deity));
    }

    // GET /api/classes — list classes that have spell data
    if (url.pathname === "/api/classes") {
      const graph = getGraph();
      const classes = new Set<string>();
      for (const n of graph.nodes) {
        if (n.data.type === "spell" && n.data.class_levels) {
          for (const cl of n.data.class_levels) {
            classes.add(cl.class);
          }
        }
      }
      return Response.json([...classes].sort());
    }

    // GET /api/zones — list all zone nodes
    if (url.pathname === "/api/zones") {
      const graph = getGraph();
      const zones = graph.nodes
        .filter((n) => n.data.type === "zone")
        .map((n) => ({ id: n.data.id, label: n.data.label }))
        .sort((a, b) => a.label.localeCompare(b.label));
      return Response.json(zones);
    }

    // --- Mutations ---

    if (req.method === "POST" && url.pathname === "/api/spell") {
      const body = await req.json();
      const node = addSpell(body.name, body.class_levels);
      return Response.json(node, { status: 201 });
    }

    if (req.method === "POST" && url.pathname === "/api/zone") {
      const body = await req.json();
      const node = addZone(body.name);
      return Response.json(node, { status: 201 });
    }

    if (req.method === "POST" && url.pathname === "/api/npc") {
      const body = await req.json();
      const node = addNpc(body.name, body.zone, body.roles);
      return Response.json(node, { status: 201 });
    }

    if (req.method === "POST" && url.pathname === "/api/sells") {
      const body = await req.json();
      const edge = addSellsEdge(body.npcId, body.spellId);
      return Response.json(edge, { status: 201 });
    }

    if (req.method === "POST" && url.pathname === "/api/connects") {
      const body = await req.json();
      addConnectsTo(body.zoneA, body.zoneB);
      return new Response(null, { status: 201 });
    }

    if (req.method === "DELETE" && url.pathname.startsWith("/api/node/")) {
      const id = decodeURIComponent(url.pathname.slice("/api/node/".length));
      const ok = removeNode(id);
      return ok ? new Response(null, { status: 204 }) : new Response("Not found", { status: 404 });
    }

    // --- Static files ---
    let path = url.pathname === "/" ? "/index.html" : url.pathname;
    const file = Bun.file(`./public${path}`);
    if (await file.exists()) return new Response(file);

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);
