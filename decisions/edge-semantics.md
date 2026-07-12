# Edge semantics

- `npc --sells--> spell`
- `npc --located_in--> zone`
- `quest --located_in--> zone` (same edge type as above, reused — same relationship, different source type)
- `zone --connects_to--> zone` (bidirectional; enables BFS pathfinding)
- `npc --starts--> quest`
- `quest --rewards--> item` / `quest --rewards--> faction` (one edge type, disambiguated by the target node's `type` — see [quest-reward-modeling.md](quest-reward-modeling.md))

Edges encode relationships, not containment. An NPC can be both vendor and quest giver without hierarchy conflicts.

