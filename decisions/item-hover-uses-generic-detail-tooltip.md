# Item hover uses the generic `<detail-tooltip>`, shaped per card type

When item-reward chips needed a hover detail card, the option considered was subclassing `<detail-tooltip>` (or building a sibling `<item-tooltip>`) with per-entity-type rendering logic baked into the component itself. Rejected: `<detail-tooltip>` (`public/components/detail-tooltip.js`) was already generalized to a domain-agnostic `{ name, description?, stats? }` renderer when it stopped being spell-only (see `decisions/quest-reward-modeling.md`'s hover-detail note and the commit that renamed it from `spell-tooltip`) — it has no knowledge of what kind of entity it's showing.

Instead, each card component that renders a hoverable chip owns a small `xStats(entity)` function turning its own entity type into that generic contract, and calls the shared `<detail-tooltip>` singleton directly:

- `zone-card.js`'s `spellStats(spell)` — spell fields (mana, cast time, resist, spell line, ...) → stat chips.
- `quest-card.js`'s `itemStats(item)` — item fields (`ItemDetails`, see `decisions/item-node-schema.md`) → stat chips.
- `zone-dossier.js`'s npc-drop badges — same `itemStats(item)` from `quest-shared.js` (an item is an item regardless of who links to it: quest reward or `npc --drops--> item`), just a new wiring site: hover targets are `.npc-drop-badge` chips inline in a Bestiary row's name cell, not reward chips in a quest's own Rewards section.

This keeps `<detail-tooltip>` itself simple and reusable (one component, one job: lay out a name/description/chip-list card near an anchor) while all per-entity-type knowledge — what counts as an interesting stat, how to format it — lives next to the data that produces it, not inside the shared component. A genuinely new entity type wanting hover detail (not just a new item-reward site) should follow the same pattern: write its own `xStats()` next to its card, not extend or fork `<detail-tooltip>`.
