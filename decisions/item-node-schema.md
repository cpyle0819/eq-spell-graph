# Item node schema

`item` nodes carry an optional stat block (`ItemDetails` in `src/graph.ts`), modeled on real eqlwiki.com item pages fetched directly (Small Scarab Helm, Abjurer's Earring, Acid Etched War Sword, Gnome Glow Rod) rather than invented:

```ts
{
  slots?: string[];        // e.g. ["Head"], ["Primary","Secondary"] -- wiki's "Slot" field is
                            // space-separated for multi-slot items (esp. weapons)
  classes?: string[];      // empty/absent = everyone -- same convention as quest.classes
  deity?: string;          // absent = no deity restriction -- e.g. Blacksmithing's Imbued
                            // Field Plate armor (migration 387), one set per deity
  ac?: number;
  stats?: { str?, sta?, dex?, agi?, wis?, int?, cha?: number };
  resists?: { fire?, cold?, disease?, poison?, magic?: number };
  hp?: number;
  mana?: number;
  damage?: number;         // weapons
  delay?: number;          // weapons -- attack delay
  skill?: string;          // weapons -- e.g. "1H Slashing", "1H Blunt"
  effect?: string;         // clicky/proc, e.g. "Ykesha (Combat) at Level 37"
  lightSource?: boolean;
  weight?: number;
  size?: string;           // Tiny/Small/Medium/Large/Giant
  magic?: boolean;
  lore?: boolean;
  noTrade?: boolean;
  value?: string;          // resale price as shown, e.g. "30pp" -- not normalized to copper
  source?: string;         // where it's obtained (drop, quest reward, ...)
  capacity?: number;       // tradeskill containers -- how many items it holds
  containerSize?: string;  // tradeskill containers -- largest item size it accepts
                            // (distinct from this item's own `size` above)
}
```

Every field is optional — a container has `weight`/`size` (and, if it's a tradeskill container, `capacity`/`containerSize`) but no `ac`/`damage`; a weapon has `damage`/`delay`/`skill` but usually no `resists`. Don't require a field just because one sample item happened to have it. `capacity`/`containerSize` were added once a real sample (Concordance of Research, a tradeskill research container) needed them — the schema grows when real data demands a field, not speculatively.

`noTrade` collapses two distinct classic-EQ flags the wiki sometimes shows separately (NO DROP: can't leave your inventory at all; NO TRADE: can't hand to another player, but can still drop on death) into one boolean. Close enough for "can I give this away," not precise enough to ever resurrect the NO DROP/NO TRADE distinction from — if that distinction matters later, it needs its own field, not a finer reading of this one.

`classes` is resolved to an explicit allow-list at authoring time, not stored as an "all except X" exclusion — the wiki's own Categories tag already states the resolved list for armor (e.g. Small Scarab Helm's category line lists the exact 10 classes it's usable by), so there's nothing to compute, and an exclusion-list would be a second representation of the same fact that could drift from `classes`' "empty = everyone" convention used everywhere else in this graph.

`getQuests()` (`src/graph.ts`) resolves `rewards` edges to `item` nodes into a full `ItemSummary` (id + label + every `ItemDetails` field present), not just `{id, label}` — the Quests UI's item-reward hover tooltip needs the real stat block, not just a name. `quest-card.js`'s `itemStats()` shapes that into `<detail-tooltip>`'s generic `{ name, description?, stats? }` contract, the same way `zone-card.js`'s `spellStats()` does for spells — see [Item hover uses the generic detail-tooltip, shaped per card type](item-hover-uses-generic-detail-tooltip.md).
