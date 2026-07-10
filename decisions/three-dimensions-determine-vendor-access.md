# Three dimensions determine vendor access

1. **Race** — determines guard kill-on-sight (`kos`). An Ogre is KOS in Kaladim for being an Ogre, regardless of deity.
2. **Primary class** — determines merchant refusal (`wont_sell`). Necromancer and Shadow Knight trigger this in good-aligned cities.
3. **Deity** — compounds with class. Evil deities (Innoruuk, Cazic-Thule, Bertoxxulous) cause `wont_sell` in good cities; good deities cause it in evil cities. Deity primarily affects religious-faction NPCs; race affects guard/civilian factions.

The planner resolves the **worst** standing across all three: `kos > wont_sell > neutral > safe`. Race and Deity each have a sentinel value, `"any"`, that removes just that one dimension from the computation — a real standing from the other two still applies normally. See "'Any' race and 'Any' deity" under UI below.

