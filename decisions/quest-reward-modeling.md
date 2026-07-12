# Quest structure and reward modeling

`quest` node shape: `label`, `description`, `classes` (empty/absent = anyone, same "no selection = all" convention as elsewhere), `minLevel`/`maxLevel` (each independently optional; absent = no bound in that direction), `steps` (plain ordered array of strings — a step has no identity beyond belonging to this quest, so it's not its own node type), `total_experience` (the quest's whole XP total, tracked as one flat number even if individual steps notionally reward XP along the way — no per-step breakdown).

Item and faction rewards are edges, not fields — a quest can have any number of them:

- `quest --rewards--> item`
- `quest --rewards--> faction`

One `rewards` edge type covers both; the target node's own `type` disambiguates which kind of reward it is, rather than splitting into `rewards_item`/`rewards_faction`. Reasoning: items and factions are real entities (things other quests/vendors could eventually also point at), so they get the same edges-not-fields treatment as `sells`/`located_in`; experience isn't an entity, so it stays a scalar field. No quantity/amount attribute on `rewards` edges yet (e.g. "3x Sturdy Ore Sack" or "+250 faction") — deferred until real data needs it, same way `connects_to` only grew a `transport` attribute when boats/translocators required one.

Quest location and quest giver are also edges: `npc --starts--> quest`, and `quest --located_in--> zone` (reusing the existing `located_in` edge type — same relationship as `npc --located_in--> zone`, just a different source type). A quest can have more than one `starts` or `located_in` edge for free if a real quest needs multiple quest-givers or spans multiple zones.
