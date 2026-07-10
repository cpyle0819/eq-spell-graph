# Spell Line: a new filterable/surfaceable dimension, from migration 019's `spell_line` nodes

Three places: a tag-input filter on the Spell Finder (`#spellline-tag-wrap`), the same filter plus a passive badge on Class Browser's spell cards, and a line item in the Spell Finder's hover tooltip. All three read `spellLine`/`spellLineId`, attached to spell data server-side by `src/graph.ts`'s `withSpellLine()` (via the `member_of` edge index) — `getAllSpells`/`getSpellsForClass` attach it to every spell they return, and `rankZones()` attaches it per zone-ranking spell entry and accepts a `spellLineIds` filter param (`GET /api/plan?lines=...`).

**Filter semantics**: same as the existing multi-class "Shopping For" filter — an *additive* (union) facet layered onto whatever class/level narrowing already produced, not a per-tag AND (a spell belongs to at most one line, so requiring all selected lines to match would always be empty). Bypassed entirely when a specific spell is pinned, same reasoning as the class filter bypass: Specific Spells is an exclusive override.

**Class Browser's Spell Line field is conditionally hidden**: only shown when the Category select is on "Spells" *and* the current class selection's spells actually have line data (`rawSpells.some(s => s.spellLineId)`) — checked against the pre-line-filter set, not the already-filtered one, since checking the filtered set would be self-referential once a line is picked.

