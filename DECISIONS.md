# Design Decisions

## Architecture

### Graph as source of truth
`data/graph.json` is canonical. All mutations go through `src/graph.ts`.

### Node types
Current: `spell`, `npc`, `zone`, `stance`, `invocation`. Future: `quest`, `item`. Generic typed nodes avoid schema changes when adding entity types.

### Stance/invocation nodes: single-page scrape, not per-entity
`stance` and `invocation` nodes (migration 016) carry `label`, `description`, and a `classes: string[]` array of full lowercase class names — no `level`, since both are granted at level 1 (unlike `spell.class_levels`, which pairs each class with a level). Unlike spell data (scraped per-spell, one wiki page per spell), all 18 stances/invocations live on a single eqlwiki.com page ("Stances & Invocations") as two summary wikitables. `scripts/scrape-stances.ts` fetches that one page via the MediaWiki API and parses both tables directly, rather than following per-ability links — there's only one page to fetch, so the batching/resume logic `scrape-spell-details.ts` needs doesn't apply here.

Table-cell parsing has to treat any wikitext line not starting with `|` as a continuation of the previous cell, not a new one — some descriptions (e.g. Divine, Empower, Offensive, Striker) wrap across multiple source lines inside a single cell, and a naive "keep lines starting with `|`" filter silently truncates them at the first line break.

### Stances/invocations cover a different, larger class roster than spells
The Stances & Invocations data includes **Berserker**, a class with no purchasable spells and no entry in migration 007's `ALL_CLASSES` or the spell-derived `/api/classes` roster (`scrape-spells.ts` already skips Monk/Warrior/Rogue for the same "no vendor spells" reason — Berserker is the same case, just not previously encountered since nothing referenced it). Rather than reconciling this into one shared class list, `/api/classes/abilities` derives its own roster directly from `stance`/`invocation`/`aa` node `classes` fields, independent of `/api/classes`. The two endpoints will keep diverging by design — don't unify them into a single "all classes" list.

### AA nodes: same single-page-scrape shape as stances/invocations, but with a `category`
Migration 017 adds an `aa` node type (Alternate Advancement) carrying `label`, `description`, `classes: string[]`, plus AA-specific `ranks` (number) and `cost` (a raw "N/N/N"-per-rank string — kept as text, not parsed into numbers, since some ranks are still unresearched "?" placeholders in the source wiki) and `category`: `"general" | "archetype" | "class" | "special"`, matching the eqlwiki.com "Alternate Advancement" page's own four sections. Like stances/invocations, this is one page covering every class (`scripts/scrape-aa.ts`), not a per-ability scrape.

The class roster embedded in `data/aa.json` is derived from the page's own "Class AAs" subsection headings (16 classes) rather than hardcoded, so General/Archetype/Special AA entries — which the wiki says apply to every class — stay in sync with whatever the wiki documents without a separate hardcoded list to drift out of date.

**Archetype AAs are tagged all-classes, not split by archetype group.** The wiki's Archetype AAs table has no per-class or per-archetype-group breakdown — its own prose says "every class ... has Archetype AAs, some classes have more than others" but doesn't say which classes get which entry, and there's no per-ability page (unlike spells) to find that detail elsewhere. Bucketing individual abilities into the classic EQ Warrior/Priest/Caster/Hybrid archetype groups would mean guessing which group grants each specific ability with no wiki evidence — so instead, all Archetype AAs get `classes` = every class, same as General/Special, and `category: "archetype"` is what keeps them visually separate in the Class Browser. This is an approximation in the same spirit as "Faction data is approximate" below — it can overstate what a given class actually has access to in-game. Revisit if eqlwiki.com ever documents the per-class breakdown.

A handful of class-specific AA names (e.g. "Quick Evacuation") are reused independently by more than one class with different tuning — migration 017 gives `category: "class"` nodes an id of `aa:{class}:{slug(name)}` rather than `aa:{slug(name)}`, so these don't collide.

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

The planner resolves the **worst** standing across all three: `kos > wont_sell > neutral > safe`. Race has one sentinel value, `"any"`, that opts out of this entirely rather than participating in it — see "'Any' race" under UI below for why and how the frontend has to treat that differently from a real `"safe"` result.

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

### EverQuest-themed skin lives in a shared `public/theme.css`
All three pages link one stylesheet for the classic-EQ (Velious-era stone UI) look, modeled on an original-UI screenshot: cool lavender-blue marble panels with SVG-turbulence veining, real two-tone bevels (4px panels, inverted on sunken wells), warm parchment inserts with dark ink (route paths, spell tooltip, Class Browser cards), bone/ivory button plates with dark serif caps sunk in a black groove, a five-bead mana-blue vitals bar for owned spells, Cinzel display serif via Google Fonts CDN, Georgia body text, and spell-gem chip bullets. Each page's inline `<style>` holds only its own layout. Textures are inline SVG data URIs (feTurbulence), not image assets — knobs documented in the CSS. Still no build step — it's a plain CSS file. Google Fonts is the only external dependency besides the Cytoscape CDN; the font stack falls back to Palatino/Georgia if it's unreachable. Faction badges use EQ /consider verbiage ("indifferent", "dubious", "scowls") with the practical meaning in a `title` tooltip — the header summary keeps plain language ("won't sell", "KOS") so nothing depends on knowing EQ slang. The reference screenshot lives at assets-cdn.daybreakgames.com/uploads/dcsclient/000/000/108/481.jpg.

### Scroll rollers: reserved for single-instance parchment, not the whole family
Fetched and inspected the actual reference screenshot (assets-cdn.daybreakgames.com/uploads/dcsclient/000/000/108/481.jpg) rather than working from memory of it — the real client's chat/scroll window has literal wooden dowel ends with metal ferrule caps at each side, a detail the original reskin hadn't captured. Added it (`--wood-1`/`--wood-2` tokens, `::before`/`::after` dowels) to `.route-path` and `#spell-tooltip` only — both are single-instance, transient surfaces (one route shown at a time, one tooltip on hover). Deliberately *not* applied to `.spell-detail` (Class Browser cards): those render dozens at once in a stacked list, and a wood dowel on every single one would read as repetitive clutter, not craft, undermining the "pages of a spellbook" metaphor those cards already have. Two different parchment idioms for two different real-world objects (an unrolled scroll vs. stacked book pages), not an inconsistency.

Also added, in the same pass: a slow, low-amplitude opacity animation (`body::before`, `torch-flicker` keyframes) on the warm overhead glow, meant to read as ambient torchlight rather than a UI transition — automatically disabled along with everything else by the existing `prefers-reduced-motion` rule, no separate opt-out needed. And the `.loading` state's text now has a spinning gem above it, reusing `.spell-chip`'s exact gem gradient rather than inventing a new spinner glyph — "the page is casting," not a generic loading spinner.

### Marble mottling raised from alpha slope 0.17 to 0.30
Fetched and zoomed into the reference client screenshot's stone panel (a flat, button-free strip, not the buttons or the scroll) and compared it side-by-side against a screenshot of our own `.controls-panel` at the same crop size: the reference shows clearly visible soft cloudy mottling even in plain stone areas, while 0.17 read as almost smooth at normal viewing size — the turbulence was present but too faint to register as "textured stone." Raised `--marble-tex`'s `feFuncA` slope to 0.30 (same turbulence shape/frequency/seed, just more visible), rather than changing `--stone-1`/`--stone-2` or the texture's frequency/type — this is one CSS variable shared by every stone surface (header, panels, cards, dropdowns, faction-tinted zone cards), so a single edit propagates everywhere with no risk of the family drifting out of sync. Deliberately kept the lavender-blue hue as-is; that's a documented, already-validated choice, not something this pass touched. Checked against real page content afterward (planner sidebar, header, Class Browser, mobile) — text stays fully legible against the busier texture since the average panel luminance is unchanged, only the local variance increased.

### Mana bar: five beads with bright seams — the vitals bars, not the group-list bars
The reference client draws two visually different HP/mana bars: the character vitals bars (top-right, under your own name — HP/mana/stamina) are a chain of distinct beads with a bright seam between each; the group member list's HP bars are one smooth continuous tube with no segmentation. `.mana-bar` tracks a single "spells owned" stat for one character, so the vitals-bar idiom is the correct one to copy — an earlier pass in this same session zoomed into the group-list bars by mistake, concluded the beading was an invented detail, and flattened `.mana-bar` into a smooth tube. Re-zoomed into an actual WinEQ2 classic-client screenshot of the vitals bars (user-supplied) and confirmed the beading is real: five segments, each with its own top-left specular highlight, separated by a bright ridge line (not a dark pinch — a common wrong guess, since a seam between two convex beads could plausibly go either way; the zoomed capture shows it's lit). Restored the tiled five-bead structure (`background-size: 20% 100%; repeat-x` for the specular and seam layers) with the seam corrected to a bright ridge flanked by slight shadow, rather than the dark-edges version an earlier build had guessed at. Color stays mana-blue rather than the reference's HP-red — that reinterpretation (this bar tracks spells owned, not health) is a separate, already-settled choice this pass didn't revisit.

### Muted text must clear WCAG AA (4.5:1)
The pre-reskin palette's muted browns (#8a6838, #6a5438) sat at 2.6–3.6:1 against the dark background and failed WCAG AA. All muted text now uses `--ink-muted` (≥4.5:1 against the lightest stone surface it appears on — recheck if lightening `--stone-1`) — don't reintroduce darker browns for text. Dimmed zone cards (`wont_sell` 0.6, `kos` 0.35 opacity) are deliberate de-emphasis of inactive content, not a contrast bug; they were raised from 0.5/0.22 to stay identifiable.

### Zone picker uses `<select>`
`<datalist>` has a browser bug preventing re-selection after initial pick.

### Class Browser page (formerly "Stances & Invocations"): three `<select>` pickers, not a multi-select
"Pick 1-3 classes" is implemented as three independent class `<select>` dropdowns (Class 1/2/3, each with a "— None —" option) rather than a single multi-select control, consistent with the zone picker decision above. Each select disables any class already chosen by one of the other two, preventing duplicate picks. Results are the union of abilities available to any selected class; each ability card is badged with which of the *selected* classes grant it (not its full class list), so overlap between classes is visible at a glance.

`public/stances.html`/`stances.js` were renamed to `public/class-browser.html`/`class-browser.js` when AA data (migration 017) was added, since the page now covers more than stances/invocations and is meant to be the general "filter abilities by class" page going forward — any future class-scoped ability type belongs here rather than in a new standalone page (see below — spells followed this same logic next). Results are grouped by category — Spells, Stances, Invocations, General AAs, Archetype AAs, Class AAs, Special AAs — skipping any category that comes back empty, so each type's distinct shape (spells have level/mana/vendors; AAs have ranks/cost; stances/invocations have neither) stays legible.

### Spell Browser retired; spells are a Class Browser tab
`public/spells.html`/`spells.js` (a standalone page: one class, one level, free-text search, click-to-expand vendors) were deleted and folded into Class Browser as its first tab, once Class Browser already had a tab bar to put it in. The two pages' filter models don't actually match — Spell Browser is single-class + level-bound; Class Browser is up to three classes with no level filter, since stances/invocations/AAs are granted at level 1 and aren't leveled — so this isn't a straight merge:
- The **Level** field (`#level-field`, a plain `<select>` like Spell Browser's, not the planner's dual-range slider) only appears when the Spells tab is active; it's meaningless for the other six tabs and stays hidden for them.
- The **Search** field is generic and applies to whichever tab is currently active, filtering by name client-side — this works uniformly across all seven categories (Class AAs alone can run 30+ entries) rather than being a spells-only feature.
- `/api/spells?class=` now accepts a comma-separated class list (previously single-class only, since Spell Browser never needed more) and unions results by spell id, matching how `/api/plan` already handled multi-class. `getSpellsForClass()` itself stays single-class; the route handler loops and merges.
- Each spell card is badged per selected class with *that class's* level for the spell (e.g. "Shaman L9", "Druid L12") via an optional `levelLookup` callback on the shared `classBadges()` helper, rather than the old single `Level N` next to the spell name — necessary once a spell can be shown for more than one class at once.

### Spell cards link back to the planner
Class Browser's spell cards keep the "click to show vendors" inline list from the old Spell Browser (a flat list of NPCs/zones — no ranking, no route), but also add a **"Find in Spell Finder →"** link, since the planner is what actually answers "where should I go" (hop distance, faction, route) rather than just "who sells it." The link is a plain `<a href="index.html?pinSpell=<id>&pinName=<name>&levelMin=&levelMax=&classes=&race=any">` — no shared state store between pages, just a URL. `app.js`'s `consumePinnedSpellFromUrl()` reads those params on load, then strips the query string via `history.replaceState` so reloading or bookmarking the resulting planner URL doesn't re-trigger anything. Runs *after* `restoreState()` deliberately — that call fully overwrites `specificSpells`/level range/classes from localStorage, so applying the URL first would just get clobbered.

**Specific Spells is, and remains, an *exclusive* override — pin any spell and results narrow to only pinned spells, ignoring Shopping For classes entirely.** That part of the behavior was never the bug and a first attempt at this fix broke it: it changed pinning into a *union* with the Shopping For class list instead, so pinning a spell that Shopping For already covered had no visible effect at all — indistinguishable from the feature doing nothing. Reverted to the exclusive model.

What actually needed fixing: `rankZones()` used to narrow candidates by Shopping For class *first*, then narrow *again* to just the pinned ids — so a pinned spell outside the current class selection was already gone before the pin-narrowing step even ran, and its class/level pairs got filtered a second time on top of that by the level range. The fix reorders this: when any spell is pinned, candidates go straight to exactly the pinned ids (Shopping For classes are skipped, not intersected), and each pinned spell shows *all* of its real class/level pairs rather than only the ones that happen to satisfy `classNames`/`levels`. A pinned spell now always shows up correctly regardless of whatever Shopping For classes or level range happen to be saved — which is what actually matters for the Class Browser deep link, since Class Browser has no way to know what's currently saved in the planner's localStorage.

Since that fix makes the pin robust on its own, the URL's `levelMin`/`levelMax`/`classes` params are purely cosmetic — they keep the planner's *displayed* level range and Shopping For chips consistent with what you were just looking at in Class Browser (an empty/"All Levels" Class Browser filter maps to the full 1–`MAX_SPELL_LEVEL` range, not whatever narrow range happened to be saved), rather than being required for the spell to show up. Because pinning is exclusive, those chips end up inert once something is pinned (Shopping For plays no role in the results anymore) — that's an acceptable, honest side effect of an exclusive filter, not a bug: removing the pinned spell falls back to a Shopping For selection that actually matches what you were browsing, instead of a stale unrelated one.

### "Any" race: an escape hatch from faction entirely, not just from race
Class Browser has no race/primaryClass/deity fields at all — it can't, it's not planning a route. So the "Find in Spell Finder" link unconditionally sets `race=any`, since forwarding a stale race from whatever the planner last had saved could otherwise make a zone show as misleadingly KOS or won't-sell for a lookup that has nothing to do with that character. `race=any` is a sentinel `rankZones()` checks for (`factionIgnored`) that short-circuits *all three* faction dimensions — race, primaryClass, *and* deity — to `"safe"`, not just the race lookup; a leftover primaryClass or deity could otherwise still produce a wont_sell result even with race neutralized. The zone's actual faction data is never consulted in this mode.

Forcing `faction: "safe"` server-side keeps the existing scoring/sorting math working unchanged (no faction penalty), but the frontend does *not* reuse the normal `.zone-card.safe` treatment (green top-accent, tinted background) for this case — that visual specifically means "checked and confirmed friendly," and showing it for every single zone when nothing was actually checked would be a false signal, not a convenience. `ZoneRanking.factionIgnored` (set only when true, otherwise omitted) tells the frontend to render a plain, uncolored `.zone-card` instead, and the results header gets an explicit "faction ignored (Any race)" note rather than silently showing no badges — the goal is to make it obvious faction wasn't evaluated, not to make everything look safe.

**`<option value="any">` goes last in the Race `<select>`, not first.** A first pass added it as the first option, which — since `applyDefaults()` never explicitly sets `race-select`'s value, it just relies on the browser selecting whatever option is first — silently made "Any (ignore faction)" the default race for every first-time visitor, hiding real KOS/won't-sell warnings by default. Caught by a screenshot showing "Barbarian" wasn't selected when it should have been on a clean run. Any new option added to a `<select>` that has no explicit default assignment needs the same check: does skipping the explicit-default code path change what a fresh visitor sees?

### Class Browser's level range was 1–60; real data tops out at 50
A leftover from the old `spells.js`, which had the same off-by-ten cap. The planner's own level slider (`public/index.html` `#level-max`) was already correctly bounded to 50 — matching data, not guessing. Consolidated to a `MAX_SPELL_LEVEL = 50` constant in `class-browser.js`, used both for populating the level `<select>` and for building the "All Levels" case of the Spell Finder link's level range.

### Class Browser results: tabs, not a stacked scroll
Originally all categories rendered as stacked sections in one scrolling column, which meant paging through everything above to reach e.g. Special AAs. Replaced with a tab bar (`.tab-bar`/`.tab-button` in `theme.css`, reusable by future pages) showing only the categories present for the current class selection, each labeled with its count; clicking a tab swaps the results pane without refetching. The active tab is kept in JS state and persists across class-filter changes (switching classes doesn't bounce you back to the first tab) but falls back to the first available category if the active one has no items for the new selection. The tab bar hides itself entirely when zero or one category has results, since there's nothing to switch between. On narrow viewports the bar scrolls horizontally instead of wrapping, so it stays one row.

### Level picker is a dual range slider
Covers the common case: "I leveled from X to Y, what spells do I need?"

### Planner state: single auto-saved snapshot, not named profiles
The planner persists one last-used state (race, class selections, deity, zone, level range, pinned spells/zones, owned spells) to `localStorage` and restores it on load — it does not support multiple named/saved characters. This replaces an earlier per-character profile system (named profiles, per-profile owned-spell tracking) with something simpler for the common case of planning for one character at a time. Revisit if multi-character support turns out to matter — the per-profile version demonstrated it's a straightforward layer to add back on top of `getState()`/`restoreState()`.

### "All owned" needs its own empty state, distinct from "no results"
`renderRankings()`'s zone loop silently `continue`s past any zone where every spell is already marked owned (when `showAllSpells` is off) — correct, since there's nothing left to show there. But nothing checked whether *every* zone got skipped that way: the results header (built from pre-filter counts) would still say "9 spell(s) across 20 zone(s)," and the area below it would just be empty, with no visible reason why. Tracked a `renderedZones` counter through the loop; if it's still zero afterward, append a `.no-results` message ("All matching spells are marked owned.") with a `Show all` button. That button reuses the header's own toggle rather than a one-off — `#toggle-owned-btn`'s unique id was changed to a `.toggle-owned-btn` class so the same delegated click handler (matched by class now, not id) fires from either location, since two elements can't share one id on the same page.

- **Bun** — runtime, bundler, dev server
- **TypeScript** — graph module and server
- **Cytoscape.js** — graph visualization (CDN, not bundled)
- **No framework** — vanilla HTML/JS frontend
- **data/graph.json** — flat file persistence, no database
- **Playwright** — devDependency used only offline by `scripts/scrape-spell-details.ts` to scrape the EQL wiki; not part of the running app
