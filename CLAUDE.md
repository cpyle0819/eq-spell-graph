# CLAUDE.md

## Project

EverQuest spell shopping route planner. Graph-based, faction-aware. Bun + TypeScript backend, vanilla JS frontend.

## Commands

```bash
bun run dev          # Start server on :4321
bun run migrations/NNN-*.ts  # Run a specific migration
```

## Structure

- `data/graph.json` — source of truth (never regenerate from markdown; mutate through `src/graph.ts`)
- `src/graph.ts` — data access layer, all reads and writes
- `src/server.ts` — HTTP API + static file serving
- `public/` — SPA (vanilla HTML/JS, no build step)
- `migrations/` — historical, numbered, run-once transformations

## Design Decisions

Read `DECISIONS.md` before making changes. It contains architecture choices and EQ domain knowledge that shaped the code.

When a proposed change conflicts with a decision in that file, surface the conflict to the user before proceeding. Decisions can be updated — but deliberately, not accidentally.

When a new non-obvious decision is made during development, add it to `DECISIONS.md`.

## Conventions

- Edge types encode relationships (`sells`, `located_in`, `connects_to`), not containment hierarchy
- Node types are generic and extensible — add new `type` values, don't restructure
- `spell.class_levels` is the join between spells and classes — never put `level` or `class` as top-level spell properties
- Faction resolution: worst-of(race, primaryClass, deity). Never flatten to a single dimension.
- "Shopping For" class (what spells to find) is independent of "Primary Class" (what drives faction)
- API returns data; frontend renders. No server-side HTML.
- No framework. No build step for the frontend.
