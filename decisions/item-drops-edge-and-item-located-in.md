# `npc --drops--> item`, and `item --located_in--> zone`

Until migration 267, an `item` node's only provenance edge was `quest --rewards--> item` — there was no way to say a named mob drops a piece of gear directly, outside a quest. Two additions:

- `npc --drops--> item`: added only when eqlwiki.com's own zone page states the specific NPC that drops the item (e.g. Shiny Brass Shield from Crushbone's Orc Trainer). Not backfilled onto items whose page only lists them as "zone drops" with no named source.
- `item --located_in--> zone`: reuses the existing edge type for a new source-node type, the same way `quest --located_in--> zone` already reuses it alongside `npc --located_in--> zone` (see [edge-semantics.md](edge-semantics.md)). Every item gets this even when it also has a `drops` edge, so "what's in this zone" queries don't need to join through an npc.
