# Class spell vendors: a `class` node type and `sells_spells_for` edge

A dedicated class spell vendor (e.g. Arrivae Valleren, Druid Guild) sells the full spell list for one class or a small, coherent set of classes, not a hand-picked subset. Modeling each vendor's inventory as individual `npc --sells--> spell` edges is both redundant (every Druid vendor sells the same ~194 spells) and unreadable in the UI (a single vendor's entry becomes a 190-row spell list). A `class` node (`class:druid`, `class:shaman`, etc.) and an `npc --sells_spells_for--> class` edge replace those per-spell edges for confirmed class vendors: "this vendor sells the class's spells" is the fact worth storing, not which specific spells happen to have a log-sourced offer record.

This is a deliberate exception to the graph's usual "classes are a plain string field" convention (`spell.class_levels[].class`, `item.classes[]`). See [Spell class/level model](spell-class-level-model.md). A vendor-to-class relationship reads as an edge, not an attribute, because the whole point is "which class(es) does this NPC serve," a first-class fact about the vendor.

## Classification rule: >=5 sold spells AND >=75% share

Per vendor, count how many of its currently-sold spells (`npc --sells--> spell`) include each class in their `class_levels`. A class qualifies if its count is at least 5 and at least 75% of the vendor's total sold-spell count. A vendor can qualify for more than one class (e.g. a Paladin Guild vendor also carries Cleric spells, a real hybrid-class pairing, not noise).

The 75% share exists because raw count alone over-attributes: a vendor selling only a handful of broadly-shared utility buffs (Endure Cold, Cure Poison, spells common to 5+ classes) would otherwise pick up every one of those classes even though it never stocks that class's actual spellbook. Requiring a class to dominate the vendor's own sold-spell list, not just co-occur in shared spells, filters that out. Verified against real vendor labels: the rule's output for "X Guild"-labeled vendors matches the labeled class every time it was checked.

Vendors below both thresholds (31 as of migration, every one with 5 or fewer total sold spells) keep their old per-spell `sells` edges rather than getting a class edge. Assume this is incomplete sourcing (the vendor's full sell-log was never fully captured), not evidence the vendor is a genuine small mixed-goods spell seller. A class vendor with too little logged data still needs more real spell records before it can be trusted with a class edge, not a permanent per-spell fallback. Revisit via eqlwiki.com and reclassify once more data exists.

## Downstream: spell -> class -> vendor, not spell -> vendor directly

Anywhere the graph used to answer "which vendors sell spell X" by walking `spell <--sells-- npc` now has to resolve it through the spell's `class_levels` classes and each class's `sells_spells_for` sellers instead, for any vendor that was migrated off per-spell edges. The 31 unresolved vendors are the only ones still reachable via the old direct edge.
