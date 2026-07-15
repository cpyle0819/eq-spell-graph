# Edge semantics

- `npc --sells--> spell`
- `npc --located_in--> zone`
- `quest --located_in--> zone` (same edge type as above, reused — same relationship, different source type)
- `zone --connects_to--> zone` (bidirectional; enables BFS pathfinding)
- `npc --starts--> quest` / `npc --starts--> quest_group` (one edge type, disambiguated by the target node's `type`)
- `quest --rewards--> item` / `quest --rewards--> faction` (one edge type, disambiguated by the target node's `type` — see [quest-reward-modeling.md](quest-reward-modeling.md))
- `quest --member_of--> quest_group` (same edge type as `spell --member_of--> spell_line` — see [quest-group-node-type.md](quest-group-node-type.md))
- `quest --requires--> quest` (a real ordered prerequisite chain, distinct from `member_of`'s unordered siblings — see [quest-prerequisite-requires-edge.md](quest-prerequisite-requires-edge.md))

Edges encode relationships, not containment. An NPC can be both vendor and quest giver without hierarchy conflicts.

