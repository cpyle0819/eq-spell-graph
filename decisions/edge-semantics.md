# Edge semantics

- `npc --sells--> spell`
- `npc --located_in--> zone`
- `quest --located_in--> zone` (same edge type as above, reused — same relationship, different source type)
- `zone --connects_to--> zone` (bidirectional; enables BFS pathfinding)
- `npc --starts--> quest` / `npc --starts--> quest_group` (one edge type, disambiguated by the target node's `type`)
- `quest --rewards--> item` / `quest --rewards--> faction` (one edge type, disambiguated by the target node's `type` — see [quest-reward-modeling.md](quest-reward-modeling.md))
- `quest --member_of--> quest_group` (same edge type as `spell --member_of--> spell_line` — see [quest-group-node-type.md](quest-group-node-type.md))
- `quest --requires--> quest` (a real ordered prerequisite chain, distinct from `member_of`'s unordered siblings — see [quest-prerequisite-requires-edge.md](quest-prerequisite-requires-edge.md))
- `npc --drops--> item` (only when a source states the specific dropper — see [item-drops-edge-and-item-located-in.md](item-drops-edge-and-item-located-in.md))
- `item --located_in--> zone` (same edge type as above, reused again — see same doc)
- `recipe --uses--> item` / `recipe --produces--> item` (a tradeskill recipe's ingredients and crafted result, each an optional `quantity` attribute — see [tradeskill-recipe-node-schema.md](tradeskill-recipe-node-schema.md))
- `recipe --crafted_in--> container` (the stationary crafting station a recipe is made in, e.g. a Brew Barrel — distinct from `uses`, which covers consumed ingredients including any vessel-type item the wiki also happens to call a "container" — see same doc)
- `recipe --variant_of--> recipe` (an alternate ingredient combo producing the same output item as another recipe — see same doc's "Recipe variants" section)

Edges encode relationships, not containment. An NPC can be both vendor and quest giver without hierarchy conflicts.

