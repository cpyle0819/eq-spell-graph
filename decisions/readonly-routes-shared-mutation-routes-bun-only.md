# Read-only routes are shared; mutation routes are Bun-server-only

`src/api.ts` holds the GET route table (`/api/plan`, `/api/route`, `/api/spells`, etc.) and is imported by both `src/server.ts` (local Bun dev server) and `src/lambda.ts` (a Lambda entry point for whichever infra deploys this app) — one route table, no drift between the two entry points. The POST/DELETE mutation routes (`/api/spell`, `/api/npc`, `/api/node/:id`, ...) stay in `server.ts` only and are never bundled into the Lambda build: they have no auth, and a typical Lambda's filesystem is read-only at runtime anyway, so `graph.ts`'s `writeFileSync` would just fail there. Data changes go through migrations, run locally, redeployed as part of the next Lambda package — not through live mutation calls.

