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

### Boat transport is an edge attribute, not a node
`connects_to` edges may carry `transport: "boat"` (migration 009). `shortestPath()` tracks transport per hop rather than modeling boats as intermediate nodes, so a route can flag "this hop is a boat crossing" without the graph needing a `boat` node type.

### Planning and routing are separate concerns
`rankZones()` (shop planning: "where should I go?") and `getRoute()` (point-to-point: "how do I get from A to B?") are independent functions/endpoints even though both walk the same zone graph via `shortestPath()`. The Route Finder page (`public/route.html`) exists separately from the planner rather than folding routing into it, because "get me from A to B" is a distinct question from "where should I shop" and doesn't need faction or spell context.

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
73 zones, 47 of which have spell vendors, all reachable via bidirectional BFS. Migration 010 fixed two vendor zones (Ocean of Tears, High Keep) that had `sells` edges but no `connects_to` edges, making them unreachable.

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
