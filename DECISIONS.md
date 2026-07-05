# Design Decisions

## Architecture

### Graph as source of truth
`data/graph.json` is canonical. All mutations go through `src/graph.ts`.

### Node types
Current: `spell`, `npc`, `zone`. Future: `quest`, `item`. Generic typed nodes avoid schema changes when adding entity types.

### Edge semantics
- `npc --sells--> spell`
- `npc --located_in--> zone`
- `zone --connects_to--> zone` (bidirectional; enables BFS pathfinding)

Edges encode relationships, not containment. An NPC can be both vendor and quest giver without hierarchy conflicts.

### Spell class/level model
`spell.class_levels: [{class: "shaman", level: 9}, ...]` — an array because the same spell can be available to multiple classes at different levels.

### Transport is an edge attribute, not a node
`connects_to` edges may carry `transport: "boat" | "translocator"` (migrations 009, 013). `shortestPath()` tracks transport per hop rather than modeling boats/translocators as intermediate nodes, so a route can flag "this hop is a boat crossing" or "this hop is a translocator" without the graph needing dedicated node types for either.

### Translocator wins hop-count ties over boat (or walking)
`shortestPath()`'s BFS keeps the first route it discovers to each zone and never revisits a tie, so the real tie-break is which neighbor `getZoneAdjacency()` hands it first. Each zone's neighbor list sorts translocator-linked entries to the front for exactly this reason — an equally-short alternative via boat or on foot should never beat a translocator hop by accident of edge insertion order in `graph.json`. No zone pair currently has more than one transport option between the same two zones, so this has no effect on today's routes; it's there for whenever one does.

### Hop count is a proxy for travel effort, not real-world time
`shortestPath()` minimizes hop count, treating every `connects_to` edge as equally "costly" regardless of transport. In reality a boat hop takes real minutes (per eqlwiki.com, ~15 min dock-to-dock for Butcherblock<->Ocean of Tears<->Freeport) while a translocator hop is instant, so a route with more hops but more translocators can be faster in practice than a shorter one that's all boats or walking. Not modeled — would need per-edge time weights and a shortest-time search (Dijkstra) instead of plain BFS. Fine for now since most planner routes are short and boat-heavy detours are rare; revisit if that stops being true.

### This game (EverQuest Legends) has different zone connectivity than classic EverQuest
Don't assume classic-EQ knowledge (Project 1999, Allakhazam, etc.) applies here — verify against eqlwiki.com specifically. Case in point: classic EQ has no Qeynos-side translocator, but EQL added one between East Freeport and South Qeynos in a May 28, 2026 patch (1pp/level fee, not modeled — the planner optimizes for hops, not cost). Zone names, connectivity, and NPC services can all diverge from classic EQ, sometimes recently and without the wiki being fully caught up yet — cross-check multiple pages (individual zone pages *and* patch notes) when something seems off, since new content can lag its own zone-page documentation.

### Planning and routing are separate concerns
`rankZones()` (shop planning: "where should I go?") and `getRoute()` (point-to-point: "how do I get from A to B?") are independent functions/endpoints even though both walk the same zone graph via `shortestPath()`. The Route Finder page (`public/route.html`) exists separately from the planner rather than folding routing into it, because "get me from A to B" is a distinct question from "where should I shop" and doesn't need faction or spell context.

### Read-only routes are shared; mutation routes are Bun-server-only
`src/api.ts` holds the GET route table (`/api/plan`, `/api/route`, `/api/spells`, etc.) and is imported by both `src/server.ts` (local Bun dev server) and `src/lambda.ts` (a Lambda entry point for whichever infra deploys this app) — one route table, no drift between the two entry points. The POST/DELETE mutation routes (`/api/spell`, `/api/npc`, `/api/node/:id`, ...) stay in `server.ts` only and are never bundled into the Lambda build: they have no auth, and a typical Lambda's filesystem is read-only at runtime anyway, so `graph.ts`'s `writeFileSync` would just fail there. Data changes go through migrations, run locally, redeployed as part of the next Lambda package — not through live mutation calls.

### This repo has no opinion on where it's deployed
`src/lambda.ts` takes `rawPath` as already relative to its own root — no hardcoded path prefix, domain, or any other deployment detail. Whatever sits in front of it (CloudFront, API Gateway, a reverse proxy) is responsible for path rewriting and routing; that's infra's job, tracked in whatever separate infra repo owns the actual deployment, not here. See `scripts/build-lambda.ts` for the packaging step this repo does own.

`graph.ts` resolves `data/graph.json`'s path via `fileURLToPath(import.meta.url)` rather than Bun's `import.meta.dir`, since the Lambda bundle runs under the Node.js runtime, not Bun.

## Faction System (EQ Domain)

### Three dimensions determine vendor access
1. **Race** — determines guard kill-on-sight (`kos`). An Ogre is KOS in Kaladim for being an Ogre, regardless of deity.
2. **Primary class** — determines merchant refusal (`wont_sell`). Necromancer and Shadow Knight trigger this in good-aligned cities.
3. **Deity** — compounds with class. Evil deities (Innoruuk, Cazic-Thule, Bertoxxulous) cause `wont_sell` in good cities; good deities cause it in evil cities. Deity primarily affects religious-faction NPCs; race affects guard/civilian factions.

The planner resolves the **worst** standing across all three: `kos > wont_sell > neutral > safe`.

### Secondary class does NOT affect faction
In EQ, only primary class restricts deity selection, and only deity + race drive faction hits. Taking Necromancer as a secondary class avoids the faction penalty because deity choice remains unrestricted. This is why the UI has separate "Primary Class" and "Shopping For" dropdowns.

### Standing thresholds (eqlwiki Faction page)
| Standing | Range | Effect |
|----------|-------|--------|
| Scowls | -2000 to -751 | KOS |
| Threatening | -750 to -501 | KOS |
| Dubious | -500 to -101 | Won't sell |
| Apprehensive | -100 to -1 | Sells at bad prices |
| Indifferent+ | 0+ | Normal |

### Faction data is approximate
Standings are inferred from wiki research, not exact numerical values. Sufficient for route planning; not authoritative for edge cases like specific deity+race combinations.

## Data Coverage

### Spell data: all 12 classes
1,064 spells across bard, beastlord, cleric, druid, enchanter, magician, necromancer, paladin, ranger, shadow knight, shaman, and wizard (migration 008), superseding the original shaman-only (159-spell) dataset. The planner's "Shopping For" control is a multi-select — `rankZones()` takes a list of class names (plus optional pinned specific spells/zones) rather than a single class, so you can plan a shopping trip for more than one character's spell list at once.

### Spell detail enrichment
Migration 011 scrapes description, mana cost, cast/recast/fizzle time, duration, target type, spell type, resist, and range from the EQL wiki via Playwright (`scripts/scrape-spell-details.ts`) and merges them onto spell nodes; migration 012 cleans up a leftover "Skill:" prefix on the `skill` field from wikitext parsing. 1,059 of 1,064 spells have detail data (a handful of wiki pages didn't parse). Powers the spell tooltip in the planner and the detail cards on the spell browser page — cosmetic/informational only, not used in ranking logic.

### Zone connectivity
88 zones (73 original + 15 classic dungeons added in migration 015), 47 of which have spell vendors, all reachable via bidirectional BFS. Migration 010 fixed two vendor zones (Ocean of Tears, High Keep) that had `sells` edges but no `connects_to` edges, making them unreachable.

### There is no non-stop Butcherblock<->Freeport boat
Migration 014 removed a direct `connects_to` edge between Butcherblock Mountains and East Freeport. Per eqlwiki.com/Ocean_of_Tears, that boat makes real stops at two islands inside Ocean of Tears (Zachariah Reigh Isle, then Sister Isle) — actual zone transitions, not a pass-through. The only route between them is via Ocean of Tears (two boat hops), which migration 010 already models. Worth remembering when auditing other "direct" boat edges: a boat connecting two named zones doesn't necessarily mean the trip is non-stop — check the wiki's actual route description, not just whether an edge exists.

### Dungeon zones use Project 1999 (classic EQ) data, not eqlwiki.com
Migration 015 added 15 missing classic dungeons (Befallen, Temple of Cazic Thule, Runnyeye Citadel, Lower Guk, Nagafen's Lair, Najena, Permafrost, Solusek's Eye, Splitpaw, Temple of Solusek Ro, The Hole, The Warrens, Kedge Keep, Mistmoore Castle, The Estate of Unrest), sourced from wiki.project1999.com instead of eqlwiki.com. This is a deliberate, user-approved exception to the "verify against eqlwiki.com specifically" rule above: the game is currently pre-Kunark, and classic dungeon geography/connectivity is assumed to match P1999 until eqlwiki.com coverage of these zones exists or proves otherwise. Kunark/Velious dungeons were intentionally excluded as out of scope for the current game era, even though some Kunark/Velious overland zones already exist in the graph. New dungeon zones carry no vendor data (classic dungeons are mob camps, not merchant hubs) and use the same "uninhabited wilderness" faction template as vendor-less overland zones (neutral race/deity standing, safe for all classes) rather than a scraped faction table.

### Naming mismatches
Some vendor data uses different zone names than adjacency data (e.g., "Neriak" vs "Neriak 3rd Gate"). Migration 005 bridges these with extra `connects_to` edges rather than renaming nodes (which would break existing edge references).

## UI

### Planner-first
Primary use case: "where should I go to buy spells?" — a planning/table problem. Cytoscape graph view is a secondary exploration tab.

### Zone picker uses `<select>`
`<datalist>` has a browser bug preventing re-selection after initial pick.

### Level picker is a dual range slider
Covers the common case: "I leveled from X to Y, what spells do I need?"

### Planner state: single auto-saved snapshot, not named profiles
The planner persists one last-used state (race, class selections, deity, zone, level range, pinned spells/zones, owned spells) to `localStorage` and restores it on load — it does not support multiple named/saved characters. This replaces an earlier per-character profile system (named profiles, per-profile owned-spell tracking) with something simpler for the common case of planning for one character at a time. Revisit if multi-character support turns out to matter — the per-profile version demonstrated it's a straightforward layer to add back on top of `getState()`/`restoreState()`.

## Tech Stack

- **Bun** — runtime, bundler, dev server
- **TypeScript** — graph module and server
- **Cytoscape.js** — graph visualization (CDN, not bundled)
- **No framework** — vanilla HTML/JS frontend
- **data/graph.json** — flat file persistence, no database
- **Playwright** — devDependency used only offline by `scripts/scrape-spell-details.ts` to scrape the EQL wiki; not part of the running app
