# Quest era flagging

Quest nodes carry an optional `era?: string` — a plain content-era label like `"Kunark"` — matched by name against a new `era` node type (migration 032), not stored as an edge. Same reasoning as `class_levels.class` being a plain string rather than a forced edge to a (nonexistent) class node: an era, like a class, is a small, mostly-static taxonomy value a quest points at by name, not a rich entity a quest needs a graph relationship to.

`era` nodes hold the real ordering:

```ts
{ id: "era:classic", label: "Classic", order: 1, current: true, type: "era" }
{ id: "era:kunark",  label: "Kunark",  order: 2, current: false, type: "era" }
{ id: "era:velious", label: "Velious", order: 3, current: false, type: "era" }
```

Confirmed directly against eqlwiki.com (the Zones hub page lists "Classic", "Kunark (Out of Era)", "Velious (Out of Era)"; the wiki's own site-wide Era Filter / `{{Classic Era}}` template system confirms Classic is the one currently live) — not assumed from classic-EQ's real expansion history, which EQL doesn't necessarily follow (see CLAUDE.md). No era after Velious is documented on the wiki yet; the list grows by migration as EQL's progression actually advances and the wiki documents it, not ahead of it.

**Flagging rule** (`isOutOfEra()` in `src/graph.ts`): a quest's era is looked up against the era nodes' `order`; if it's strictly later than whichever era node has `current: true`, the quest is `outOfEra: true`. Same era or earlier is the explicit "do nothing" case — no field, no badge, nothing rendered. A quest with no `era` at all, or an era label that doesn't match any known era node, is also never flagged: unknown isn't evidence of "confirmed later than current," and guessing would produce false positives on quests nobody's actually verified yet.

**`outOfEra` is a real, live game mechanic**, not a data-quality warning invented for this app — eqlwiki.com already gates content this way (see the `{{Whichever Era}}` template note on the wiki's own main page: "Out of Era items or monsters or entries should not be removed! Utilize the Out of Era filter"). This app is just surfacing the same signal EQL's own wiki already tracks.

**No backfill.** None of the 11 real quests already in the graph got an `era` value in migration 032 — confirming a quest's real era requires checking that quest's own wiki page for its era tag, which is exactly the per-page verification work the "add all quests" GitHub issue tracks, not something to bulk-guess.

**Zones carry `era` too (migration 049), and quests inherit it.** An audit turned up quests sitting in confirmed-out-of-era zones (Firiona Vie, East/West Cabilis, Kael Drakkal, ...) with no `outOfEra` badge, because those zones weren't tagged and the quests' own pages didn't restate the era either. `zone.era` is the same plain-label convention as `quest.era`, verified against each zone's own page (`{{Kunark Era}}`/`{{Velious Era}}` template, fetched as raw wikitext — a summarized `WebFetch` briefly misgrouped Plane of Growth/Mischief on a first pass, which raw wikitext resolved). `resolveEra()` in `src/graph.ts` now computes a quest/quest_line's `era`/`outOfEra` as the worse of its own stated era and any zone it touches (`located_in`/`starts_in`) being confirmed out-of-era.

This is deliberately *not* the same "never infer" rule the paragraph above sets for a quest's own era — that rule is about not guessing an era from nothing. Inheriting from a zone's confirmed era isn't guessing; the zone's era is a hard, individually-verified fact, and a quest physically set there can't be earlier era than the zone itself. **Still no backfill of a quest's own `era` field** — inheritance is computed live in `resolveEra()`, not written onto quest nodes, so a quest's own `era` field still only ever reflects what that quest's own page actually states.

**UI**: `quest-shared.js`'s `outOfEraBadge()` renders a warning-styled badge (dark red, distinct from the neutral class/level badges — same "this is a caution, not metadata" register as `zone-card`'s kos/wont_sell faction badges, adapted for quest-card's light parchment background) only when `outOfEra` is true, composed alongside `headerBadges()` in both `quest-card` and `quest-line-card`.
