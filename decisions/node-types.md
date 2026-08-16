# Node types

Current: `spell`, `npc`, `zone`, `stance`, `invocation`, `ability`, `spell_line`, `quest`, `quest_group`, `item`, `faction`, `era`, `recipe`, `container`, `class`. Generic typed nodes avoid schema changes when adding entity types.

`class` (`class:druid`, `class:shaman`, etc.) is a deliberate exception to classes normally being a plain string field (`spell.class_levels[].class`, `item.classes[]`). See [Class spell vendors: a `class` node type and `sells_spells_for` edge](class-spell-vendor-model.md).

There is no separate `mob` type anymore (migration 265 retired it) — every entity, hostile or friendly, is an `npc`, distinguished by its `roles` array (`vendor`/`quest_giver`/`guard`/`guildmaster`/`mob`; an npc can carry more than one). See [npc/mob unification and zone-type-ordered groups](npc-mob-unification-and-zone-groups.md), which supersedes [the original `mob` node type](mob-node-type.md) (kept for its sourcing-method history).

Quest/item/faction shape: [Quest structure and reward modeling](quest-reward-modeling.md). Quest groups: [Quest groups: a `quest_group` node, reusing the `member_of` edge](quest-group-node-type.md). Quest prerequisite chains: [Quest prerequisites: a `requires` edge, and "questline" now means this](quest-prerequisite-requires-edge.md). Content-era gating: [Quest era flagging](quest-era-flagging.md). Tradeskills: [`recipe`/`container` node types, `uses`/`produces`/`crafted_in` edges](tradeskill-recipe-node-schema.md).

