import { addSpell, addZone, addNpc, addSellsEdge, addConnectsTo, removeNode } from "./graph";
import { handleApi } from "./api";

const server = Bun.serve({
  port: 4321,
  async fetch(req) {
    const url = new URL(req.url);

    // --- API (read-only routes, shared with the Lambda deployment) ---

    const apiResult = await handleApi(url.pathname, url.searchParams);
    if (apiResult) return Response.json(apiResult.body, { status: apiResult.status });

    // --- Mutations (dev-only — never deployed to the public Lambda) ---

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
