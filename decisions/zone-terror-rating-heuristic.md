# Zone terror rating: zoneType-driven, not raw mob level

Every zone node carries a `terrorRating` (0-5, migration 396), used by danger-aware routing to weigh a route's risk against its hop count.

Raw mob level data (`npc.maxLevel`/`minLevel` on `mob`-role NPCs) turned out to be a poor direct danger signal: it mostly tracks expansion era (a Velious zone reads "dangerous" purely because its level cap is 70, whether or not it's actually risky to walk through), and a large share of high-level `mob`-role NPCs inside cities are quest givers/authority figures with combat stats, not hostile threats — they carry no other role only because of how the scrape tagged them, not because they'll attack a passerby. Comparing `Gorge of King Xorbb` (P1999-sourced dungeon; see `dungeon-zones-use-p1999-not-eqlwiki.md`) against `Kithicor Forest` on raw average/max mob level ranked them roughly equal or even favored Kithicor as scarier, contradicting how both zones actually play.

The formula instead makes `zoneType` (already on every zone node) the dominant signal, with average level of *purely hostile* mobs (role array is exactly `["mob"]` — excludes any NPC that's also `vendor`/`quest_giver`/`guard`/`banker`) as a secondary nudge:

- `city`: always `0` — guarded safe hubs, no roaming hostiles.
- `open_world`: base `1`, +1 if avg pure-mob level > 20, +2 if > 40 (ceiling `3`).
- `dungeon`: base `3`, same +1/+2 nudge (ceiling `5`).

This keeps every `open_world` zone's ceiling (3) at or below every `dungeon`'s floor (3) — a dungeon is never rated safer than an open zone, matching that dungeons force fights in tight corridors while open zones can usually be skirted around.

**Validated against eqlwiki.com** (not classic-EQ memory — see `eql-vs-classic-eq-zone-connectivity.md`) for the motivating case: `Runnyeye` and `Gorge of King Xorbb` are both described as forcing combat ("every single one is aggressive," narrow terrain funnels fights), while `Kithicor Forest`'s danger is gated to nighttime and specific corners, with daytime main roads largely passable. The formula ranks Runnyeye/Xorbb (3) above Kithicor (2) without needing a manual override, so no zone-by-zone hand-curation was done beyond this spot check — if a specific zone's rating looks wrong later, re-check it against eqlwiki.com and hand-adjust `terrorRating` via a new migration rather than reworking the formula's constants.
