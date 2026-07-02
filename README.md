# EQ Spell Planner

Faction-aware spell shopping route planner for EverQuest. Given your race, primary class, deity, current zone, and desired spell levels, ranks destinations by spells available vs. travel distance — filtering out zones where you'd be killed on sight or refused service.

## Usage

Requires [Bun](https://bun.sh/) >= 1.0.

```bash
bun install
bun run dev        # → http://localhost:4321
bun run typecheck  # TypeScript validation
```

## How it works

Spell, NPC, and zone data lives in a single graph (`data/graph.json`). The planner:

1. Finds spells matching your selected class and level range
2. Traces which NPCs sell those spells and which zones those NPCs are in
3. Computes hop distance from your current zone via BFS over zone adjacency edges
4. Resolves faction standing from three dimensions (race, primary class, deity) — takes the worst
5. Ranks zones by `spells_available / hops`, with KOS and won't-sell zones sorted to the bottom

## Faction model

| Standing | Meaning | Cause |
|----------|---------|-------|
| `safe` | Welcome | Good race/class/deity alignment |
| `neutral` | No issues | Outdoor zones, neutral combos |
| `wont_sell` | Merchants refuse | Evil class or deity in a good city (or vice versa) |
| `kos` | Guards attack | Wrong race for that city |

"Primary Class" and "Shopping For" are separate inputs because secondary/tertiary classes don't carry faction penalties in EQ — only your primary identity matters for access.

## Data

Currently loaded: **Shaman** (159 spells, levels 1–50, full vendor mappings). Other classes can be added by extending `spell.class_levels` on existing nodes or importing new spells.

71 zones with full bidirectional connectivity. 251 NPCs with zone and spell associations.

## API

The `levels` parameter takes discrete values, not a range. `levels=5,6,7` returns spells at those three levels. The frontend sends every level in the selected range.

| Endpoint | Purpose |
|----------|---------|
| `GET /api/plan?class=shaman&levels=5,6,7&from=Halas&race=barbarian&primaryClass=shaman&deity=the+tribunal` | Ranked zone recommendations |
| `GET /api/spells?class=shaman&levels=9` | List spells for a class/level |
| `GET /api/spell/:id/vendors` | NPCs and zones selling a spell |
| `GET /api/zones` | All zones |
| `GET /api/classes` | Classes with loaded spell data |
| `GET /api/graph` | Full Cytoscape-format graph |
| `GET /api/stats` | Node/edge counts |
| `POST /api/spell` | Add a spell |
| `POST /api/npc` | Add an NPC |
| `POST /api/zone` | Add a zone |
| `POST /api/sells` | Link NPC → spell |
| `POST /api/connects` | Link zone ↔ zone |
| `DELETE /api/node/:id` | Remove a node and its edges |
