# Class Browser's level range was 1–60; real data tops out at 50

A leftover from the old `spells.js`, which had the same off-by-ten cap. The planner's own level slider (`public/index.html` `#level-max`) was already correctly bounded to 50 — matching data, not guessing. Consolidated to a `MAX_SPELL_LEVEL = 50` constant in `class-browser.js`, used both for populating the level `<select>` and for building the "All Levels" case of the Spell Finder link's level range.

