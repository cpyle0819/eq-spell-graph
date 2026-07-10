# Norraph

Three tools for EverQuest Legends players, sharing one faction-aware zone/spell/class graph:

- **Spell Finder** — given your race, primary class, deity, current zone, and desired spell levels, ranks destinations by spells available vs. travel distance, filtering out zones where you'd be killed on sight or refused service.
- **Route Finder** — shortest path between any two zones, boat/translocator hops flagged.
- **Class Browser** — everything a class has access to (spells, class-defining abilities, stances, invocations, and Alternate Advancements), filterable by up to three classes at once.

<img width="1712" height="897" alt="Screenshot 2026-07-07 at 3 45 13 PM" src="https://github.com/user-attachments/assets/6d48a309-24ca-401a-8861-b27249d7bb5b" />

## Usage

Requires [Bun](https://bun.sh/) >= 1.0.

```bash
bun install
bun run dev        # → http://localhost:4321
bun run typecheck  # TypeScript validation
```

## How it works

Spell, NPC, zone, and class-ability data all live in a single graph (`data/graph.json`). Spell Finder (the planner):

1. Finds spells matching your selected class and level range
2. Traces which NPCs sell those spells and which zones those NPCs are in
3. Computes hop distance from your current zone via BFS over zone adjacency edges
4. Resolves faction standing from three dimensions (race, primary class, deity) — takes the worst
5. Ranks zones by `spells_available / hops`, with KOS and won't-sell zones sorted to the bottom

Route Finder walks the same zone adjacency graph via BFS for a plain point-to-point path, with no faction or spell context. Class Browser reads spell/stance/invocation/AA/ability nodes directly, filtered by whichever 1-3 classes are selected.

## Faction model

| Standing | Meaning | Cause |
|----------|---------|-------|
| `safe` | Welcome | Good race/class/deity alignment |
| `neutral` | No issues | Outdoor zones, neutral combos |
| `wont_sell` | Merchants refuse | Evil class or deity in a good city (or vice versa) |
| `kos` | Guards attack | Wrong race for that city |

"Primary Class" and "Shopping For" are separate inputs because secondary/tertiary classes don't carry faction penalties in EQ — only your primary identity matters for access.

## Data

1,064 spells across the 12 classes with purchasable spells, 89 zones (47 with vendors), full bidirectional zone connectivity, boat/translocator crossings flagged. Most spells also carry description/mana/cast-time/etc. detail. Class Browser adds 9 stances, 9 invocations, 131 Alternate Advancements, and 27 class-defining abilities (Rogue's poison disciplines, Backstab, Kick, Lay Hands, etc.) — this data covers 16 classes total, including 4 (Berserker, Monk, Rogue, Warrior) with no purchasable spells at all. See `decisions/` for why these are tracked as separate, independently-derived class rosters rather than one unified list.

**Updating the graph:** `data/graph.json` is never hand-edited or regenerated wholesale. Changes go through a numbered, run-once migration in `migrations/` (e.g. `bun run migrations/012-normalize-skill-names.ts`) that reads the current file, transforms it, and writes it back — see any existing migration for the pattern. `src/graph.ts` is the only code allowed to read/write it outside of migrations.

If this app is deployed as a Lambda (see "Deploying" below), **the deployment has its own bundled snapshot of `data/graph.json` — it does not read live from this repo.** Running a migration locally changes nothing for a live deployment until that deployment is rebuilt and redeployed.

## API (read-only, shared between local dev and any Lambda deployment)

The `levelMin`/`levelMax` params take a range; `class`/`spells`/`zones` take comma-separated lists.

| Endpoint | Purpose |
|----------|---------|
| `GET /api/plan?class=shaman,druid&levelMin=5&levelMax=7&from=Halas&race=barbarian&primaryClass=shaman&deity=the+tribunal` | Ranked zone recommendations |
| `GET /api/route?from=Halas&to=Kelethin` | Point-to-point route, boat hops flagged |
| `GET /api/spells?class=shaman&levels=9` | List spells for a class/level (omit `class` for every class) |
| `GET /api/spells/search?q=spirit` | Spell name autocomplete |
| `GET /api/spell/:id/vendors` | NPCs and zones selling a spell |
| `GET /api/zones` | All zones |
| `GET /api/classes` | Classes with purchasable spell data |
| `GET /api/classes/abilities` | Classes with stance/invocation/AA/ability data (a separate, broader roster — see `decisions/`) |
| `GET /api/stances-invocations?class=warrior,paladin` | Stances and invocations for the given classes |
| `GET /api/aa?class=warrior,paladin` | Alternate Advancements, grouped by category (general/archetype/class/special) |
| `GET /api/abilities?class=rogue,paladin` | Class-defining special abilities (Rogue poison disciplines, Backstab, Kick, Lay Hands, etc.) |
| `GET /api/graph` | Full Cytoscape-format graph |
| `GET /api/stats` | Node/edge counts |

## Mutation endpoints (local dev only — not in the Lambda build)

| Endpoint | Purpose |
|----------|---------|
| `POST /api/spell` | Add a spell |
| `POST /api/npc` | Add an NPC |
| `POST /api/zone` | Add a zone |
| `POST /api/sells` | Link NPC → spell |
| `POST /api/connects` | Link zone ↔ zone |
| `DELETE /api/node/:id` | Remove a node and its edges |

These have no auth and only exist in `src/server.ts` (the local Bun server) — see `decisions/` for why they're never bundled into the Lambda build.

## Deploying

This repo has no opinion on where or how it's hosted — no hardcoded domain, path prefix, or cloud-provider assumption anywhere in the code. It exposes two ways to run:

- `bun run dev` — the full app (API + static frontend) via Bun, for local use.
- `bun run build:lambda` — packages `src/lambda.ts` (a Lambda handler wrapping the same read-only route table `server.ts` uses) plus `data/graph.json` into `dist-lambda.zip`. Whatever infra deploys this app owns all routing/domain/path/CDN decisions — none of that lives here. `src/lambda.ts` expects to receive request paths already relative to its own root; stripping any external path prefix is the deploying infra's job.

The frontend (`public/*`) doesn't assume it's served from a domain root either — all API calls and inter-page links are relative paths, not `/api/...` absolutes, so the same static files work whether served from `/` or from underneath some path prefix.
