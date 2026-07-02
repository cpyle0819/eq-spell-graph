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

### Spell data: shaman only (levels 1-50)
159 spells with full vendor associations. No other classes have data. The "Shopping For" dropdown filters to classes with loaded data.

### Zone connectivity
71 zones with full bidirectional BFS connectivity. All 39 vendor zones are reachable from every shaman starting city.

### Naming mismatches
Some vendor data uses different zone names than adjacency data (e.g., "Neriak" vs "Neriak 3rd Gate"). Migration 005 bridges these with extra `connects_to` edges rather than renaming nodes (which would break existing edge references).

## UI

### Planner-first
Primary use case: "where should I go to buy spells?" — a planning/table problem. Cytoscape graph view is a secondary exploration tab.

### Zone picker uses `<select>`
`<datalist>` has a browser bug preventing re-selection after initial pick.

### Level picker is a dual range slider
Covers the common case: "I leveled from X to Y, what spells do I need?"

## Tech Stack

- **Bun** — runtime, bundler, dev server
- **TypeScript** — graph module and server
- **Cytoscape.js** — graph visualization (CDN, not bundled)
- **No framework** — vanilla HTML/JS frontend
- **data/graph.json** — flat file persistence, no database
