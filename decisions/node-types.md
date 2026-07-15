# Node types

Current: `spell`, `npc`, `zone`, `stance`, `invocation`, `ability`, `spell_line`, `quest`, `quest_group`, `item`, `faction`, `era`, `mob`. Generic typed nodes avoid schema changes when adding entity types.

Quest/item/faction shape: [Quest structure and reward modeling](quest-reward-modeling.md). Quest groups: [Quest groups: a `quest_group` node, reusing the `member_of` edge](quest-group-node-type.md). Quest prerequisite chains: [Quest prerequisites: a `requires` edge, and "questline" now means this](quest-prerequisite-requires-edge.md). Content-era gating: [Quest era flagging](quest-era-flagging.md). Mobs: [Mobs: a `mob` node type, reusing the `located_in` edge](mob-node-type.md).

