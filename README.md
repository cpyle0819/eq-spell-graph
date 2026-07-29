# Norraph

An interactive wiki for EverQuest Legends (EQL). Six tools share one faction-aware graph of zones, spells, classes, quests, items, and tradeskills, each surfacing a direct, filtered answer instead of a wiki page you'd have to read in full.

- **Spell Vendors**: given your race, primary class, deity, current zone, and desired spell levels, ranks destinations by spells available vs. travel distance, filtering out zones where you'd be killed on sight or refused service.
- **Maps**: shortest path between any two zones (boat/translocator hops flagged), plus the destination's own map and mob levels.
- **Classes**: everything a class has access to (spells, class-defining abilities, stances, invocations, Alternate Advancements, and relevant quests), filterable by up to three classes at once.
- **Quests**: quest lines worth running, their rewards, and the factions they shift.
- **Leveling Guide**: milestones worth knowing before you hit them.
- **Tradeskills**: a trade's leveling recipes and who sells the supplies.

<img width="1712" height="897" alt="Screenshot 2026-07-07 at 3 45 13 PM" src="https://github.com/user-attachments/assets/6d48a309-24ca-401a-8861-b27249d7bb5b" />

## Tenets

1. **Norraph is a reference, not a tool.** The interactive planning and filtering exist to surface existing EQL content, not to be an end in themselves.
2. **Accuracy over user experience and completeness.** Both matter, but when they conflict, correctness wins.
3. **The data is the product.** A well-structured, shareable dataset (`data/graph.json`) is what Norraph ships; the frontend is a byproduct of that data being useful.

## Usage

Requires [Bun](https://bun.sh/) >= 1.0.

```bash
bun install
bun run dev        # → http://localhost:4321
bun run typecheck  # TypeScript validation
```

## How it works

Zone, spell, class-ability, quest, item, and recipe data all live in one graph (`data/graph.json`). Spell Vendors (the planner):

1. Finds spells matching your selected class and level range
2. Traces which NPCs sell those spells and which zones those NPCs are in
3. Computes hop distance from your current zone via BFS over zone adjacency edges
4. Resolves faction standing from three dimensions (race, primary class, deity), taking the worst of the three
5. Ranks zones by `spells_available / hops`, with KOS and won't-sell zones sorted to the bottom

Maps walks the same zone adjacency graph via BFS for a plain point-to-point path, with no faction or spell context. Classes reads spell/stance/invocation/AA/ability/quest nodes directly, filtered by whichever 1-3 classes are selected. Quests and Tradeskills read quest and recipe nodes directly, filterable by class, zone, and level.

## Faction model

| Standing | Meaning | Cause |
|----------|---------|-------|
| `safe` | Welcome | Good race/class/deity alignment |
| `neutral` | No issues | Outdoor zones, neutral combos |
| `wont_sell` | Merchants refuse | Evil class or deity in a good city (or vice versa) |
| `kos` | Guards attack | Wrong race for that city |

"Primary Class" and "Shopping For" are separate inputs because secondary/tertiary classes don't carry faction penalties in EQ; only your primary identity matters for access.

## Data

1,082 spells, 112 zones, 131 Alternate Advancements, 78 tradeskill recipes, 1,363 quests (across 69 quest groups), 1,318 items, 202 spell lines, 31 class-defining abilities, 9 stances, and 9 invocations, all cross-linked to the 6,380 NPCs and zones that carry them. See `decisions/` for how each of these was scraped or derived, and why stances/invocations/AAs cover a broader class roster than spells do.

**Updating the graph:** `data/graph.json` is never hand-edited or regenerated wholesale. Changes go through a numbered, run-once migration in `migrations/` (e.g. `bun run migrations/012-normalize-skill-names.ts`) that reads the current file, transforms it, and writes it back; see any existing migration for the pattern. `src/graph.ts` is the only code allowed to read/write it outside of migrations.

If this app is deployed as a Lambda (see "Deploying" below), **the deployment has its own bundled snapshot of `data/graph.json`; it does not read live from this repo.** Running a migration locally changes nothing for a live deployment until that deployment is rebuilt and redeployed.

## API (read-only, shared between local dev and any Lambda deployment)

The `levelMin`/`levelMax` params take a range; `class`/`spells`/`zones` take comma-separated lists.

| Endpoint | Purpose |
|----------|---------|
| `GET /api/plan?class=shaman,druid&levelMin=5&levelMax=7&from=Halas&race=barbarian&primaryClass=shaman&deity=the+tribunal` | Ranked zone recommendations |
| `GET /api/route?from=Halas&to=Kelethin` | Point-to-point route, boat hops flagged |
| `GET /api/zone-distances?from=zone:east-freeport&zones=zone:a,zone:b` | Hop distance from one zone to several |
| `GET /api/spells?class=shaman&levels=9` | List spells for a class/level (omit `class` for every class) |
| `GET /api/spells/search?q=spirit` | Spell name autocomplete |
| `GET /api/spell/:id/vendors` | NPCs and zones selling a spell |
| `GET /api/spell-lines` | All spell lines |
| `GET /api/zones` | All zones |
| `GET /api/npcs?zone=zone:oasis-of-marr` | NPCs located in a zone |
| `GET /api/items?ids=item:a,item:b` | Item details for the given ids |
| `GET /api/classes` | Classes with purchasable spell data |
| `GET /api/classes/abilities` | Classes with stance/invocation/AA/ability data (a separate, broader roster; see `decisions/`) |
| `GET /api/stances-invocations?class=warrior,paladin` | Stances and invocations for the given classes |
| `GET /api/aa?class=warrior,paladin` | Alternate Advancements, grouped by category (general/archetype/class/special) |
| `GET /api/abilities?class=rogue,paladin` | Class-defining special abilities (Rogue poison disciplines, Backstab, Kick, Lay Hands, etc.) |
| `GET /api/quests?class=warrior,paladin&zone=zone:ak-anon&levelMin=9&levelMax=11` | Quests matching the given filters |
| `GET /api/quest-groups?class=paladin&zone=...&levelMin=...&levelMax=...` | Quest groups matching the given filters |
| `GET /api/tradeskills` | Distinct tradeskill names |
| `GET /api/recipes?tradeskill=Brewing` | Recipes for a tradeskill |
| `GET /api/tradeskill-vendors?tradeskill=Brewing&zone=zone:east-freeport` | NPCs selling that trade's ingredients |
| `GET /api/graph` | Full Cytoscape-format graph |
| `GET /api/stats` | Node/edge counts |

## Mutation endpoints (local dev only, not in the Lambda build)

| Endpoint | Purpose |
|----------|---------|
| `POST /api/spell` | Add a spell |
| `POST /api/npc` | Add an NPC |
| `POST /api/zone` | Add a zone |
| `POST /api/sells` | Link NPC → spell |
| `POST /api/connects` | Link zone ↔ zone |
| `DELETE /api/node/:id` | Remove a node and its edges |

These have no auth and only exist in `src/server.ts` (the local Bun server); see `decisions/` for why they're never bundled into the Lambda build.

## Deploying

This repo has no opinion on where or how it's hosted: no hardcoded domain, path prefix, or cloud-provider assumption anywhere in the code. It exposes two ways to run:

- `bun run dev`: the full app (API + static frontend) via Bun, for local use.
- `bun run build:lambda`: packages `src/lambda.ts` (a Lambda handler wrapping the same read-only route table `server.ts` uses) plus `data/graph.json` into `dist-lambda.zip`. Whatever infra deploys this app owns all routing/domain/path/CDN decisions; none of that lives here. `src/lambda.ts` expects to receive request paths already relative to its own root; stripping any external path prefix is the deploying infra's job.

The frontend (`public/*`) doesn't assume it's served from a domain root either: all API calls and inter-page links are relative paths, not `/api/...` absolutes, so the same static files work whether served from `/` or from underneath some path prefix.
