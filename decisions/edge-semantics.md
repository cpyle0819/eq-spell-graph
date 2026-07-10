# Edge semantics

- `npc --sells--> spell`
- `npc --located_in--> zone`
- `zone --connects_to--> zone` (bidirectional; enables BFS pathfinding)

Edges encode relationships, not containment. An NPC can be both vendor and quest giver without hierarchy conflicts.

