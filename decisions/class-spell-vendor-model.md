# Class spell vendors: a `class` node type and `sells_spells_for` edge

A dedicated class spell vendor (e.g. Arrivae Valleren, Druid Guild) sells the full spell list for one class or a small, coherent set of classes, not a hand-picked subset. Modeling each vendor's inventory as individual `npc --sells--> spell` edges is both redundant (every Druid vendor sells the same ~194 spells) and unreadable in the UI (a single vendor's entry becomes a 190-row spell list). A `class` node (`class:druid`, `class:shaman`, etc.) and an `npc --sells_spells_for--> class` edge replace those per-spell edges for confirmed class vendors: "this vendor sells the class's spells" is the fact worth storing, not which specific spells happen to have a log-sourced offer record.

This is a deliberate exception to the graph's usual "classes are a plain string field" convention (`spell.class_levels[].class`, `item.classes[]`). See [Spell class/level model](spell-class-level-model.md). A vendor-to-class relationship reads as an edge, not an attribute, because the whole point is "which class(es) does this NPC serve," a first-class fact about the vendor.

## Classification rule: >=5 sold spells AND >=75% share

Per vendor, count how many of its currently-sold spells (`npc --sells--> spell`) include each class in their `class_levels`. A class qualifies if its count is at least 5 and at least 75% of the vendor's total sold-spell count. A vendor can qualify for more than one class (e.g. a Paladin Guild vendor also carries Cleric spells, a real hybrid-class pairing, not noise).

The 75% share exists because raw count alone over-attributes: a vendor selling only a handful of broadly-shared utility buffs (Endure Cold, Cure Poison, spells common to 5+ classes) would otherwise pick up every one of those classes even though it never stocks that class's actual spellbook. Requiring a class to dominate the vendor's own sold-spell list, not just co-occur in shared spells, filters that out. Verified against real vendor labels: the rule's output for "X Guild"-labeled vendors matches the labeled class every time it was checked.

Vendors below both thresholds keep their old per-spell `sells` edges rather than getting a class edge. Assume this is incomplete sourcing (the vendor's full sell-log was never fully captured), not evidence the vendor is a genuine small mixed-goods spell seller. A class vendor with too little logged data still needs more real spell records before it can be trusted with a class edge, not a permanent per-spell fallback. Revisit via eqlwiki.com and reclassify once more data exists (see "Follow-up research" below).

## Combined-coverage variant

The independent per-class rule above misses a real shape: a vendor whose complete inventory splits across two (or more) classes with little overlap, so no single class alone reaches 75%, even though the classes together account for nearly the whole list. Guardian Seacly's real, complete 17-spell inventory (eqlwiki.com) split Magician 53%/Enchanter 47%, zero missing spells, but neither class cleared 75% alone. The already-migrated dual/quad-class vendors all passed the simple rule because their classes *shared* the same spells (a spell tagged both cleric and paladin counts toward both simultaneously); this is the opposite case, mostly distinct spells that happen to sell from one vendor.

Fallback rule, applied only when no single class clears the primary threshold: take the vendor's classes by descending share; add them (largest first) until combined coverage reaches 90%; keep only classes whose own individual share is at least 20% (drops a class that's barely represented even though it nudges the total over 90%).

## Follow-up research: eqlwiki.com per-NPC pages can resolve a "too little data" vendor

A vendor's log-sourced `sells` edges can undercount its real inventory badly. Fetching `https://eqlwiki.com/<Name_With_Underscores>` for a specific NPC (not a zone or class summary page) often surfaces the vendor's real, complete "Items Sold" list, letting the classification rule run against real data instead of a handful of log-sourced spells. This resolved 7 of the original 31 vendors (Hendricks, Tempia Lauley, Zealot Zorshais, Zildainez, Guardian Seacly, Conjuror Matranak, Heretic Mkoriku).

Two failure modes surfaced doing this, both worth checking for before trusting a fetch:

- **The page has no spell-sale section at all.** Khensol Undesta and Caleah Herblender's eqlwiki pages list only potions/herbs, no spells, despite this graph already having real log-sourced spell edges for them. Don't let an empty wiki result override known-real data; it just means eqlwiki adds nothing here.
- **The vendor's real spells aren't in this graph's spell dataset.** Several vendors (Rushka Deklamoor, Lithrise Frizen, Finlay Kitoran, Shelae Wolfkin, Kuglaz Grot, Arial Fern, Nertith Gracon, Kelsi Q'Grinol, Brackin Nartoise, Vizra L'Nizlon, Selien Nartoise, Tyrin F'Linz, Qualtis Weslent, Stormy, Clarissa Heartweaver, Lissa T'Born) have real, complete eqlwiki inventories where 60-100% of the named spells have no matching `spell` node here at all, high-level (40-60) spells this graph never scraped, or (for the Portal-named spells specifically) spells [deliberately modeled as edge attributes, not nodes](wizard-port-transport-modeling.md). Classifying these needs the spell dataset filled in first, a separate problem from vendor classification. Xorbinasticalus Zimralicus/Loremaster Dorinan is the one confirmed exception: a complete, well-matched inventory that's a genuine one-spell-per-class assortment with no dominant class, correctly left unresolved.

## Downstream: spell -> class -> vendor, not spell -> vendor directly

Anywhere the graph used to answer "which vendors sell spell X" by walking `spell <--sells-- npc` now has to resolve it through the spell's `class_levels` classes and each class's `sells_spells_for` sellers instead, for any vendor that was migrated off per-spell edges. The unresolved vendors are the only ones still reachable via the old direct edge.

## Consequences for the Vendors page UI

A class vendor's inventory being the class's whole spellbook, not a specific hand-picked subset, changes two things beyond just how the graph stores it:

- **Level is a purely client-side display filter, not a ranking input.** Which zones/vendors are relevant to a Shopping For search never depends on level (a Druid vendor sells the whole Druid spellbook at every level), so `rankZones()` takes no `levels` parameter and `/api/plan` never receives one. `public/app.js`'s level-range slider re-filters the already-fetched spell pool for the status panel's checklist only; it never triggers a replan or touches the zone list.
- **A vendor's class badge shows its real, full `sells_spells_for` roster, never narrowed to the current search.** A Cleric vendor can legitimately surface in a Druid search (she sells Cure Poison, which both classes get), and her badge reads "Cleric," explaining why she's there, rather than a blank badge that's indistinguishable from a vendor this graph genuinely hasn't classified yet.
