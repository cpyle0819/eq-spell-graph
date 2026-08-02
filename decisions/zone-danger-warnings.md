# Zone warnings: a plain-text caveat alongside `terrorRating`, not folded into it

`terrorRating` (migration 396, [[zone-terror-rating-heuristic]]) is a single 0-5 number, deliberately formula-driven (`zoneType` + a level nudge) so danger-aware routing can compare any two zones without hand-curation. That's the right shape for routing, but it can't express a zone whose danger swings sharply on an axis the formula doesn't model — Kithicor Forest's rating (2) is defensible against other open-world zones, but doesn't capture that eqlwiki.com describes it as a different, far more lethal place from 8PM-6AM (in-game): ordinary NPCs despawn and are replaced by "numerous highly aggressive level 35+ undead," with no guards nearby.

Rather than special-casing the formula for one zone (the exact anti-pattern [[zone-terror-rating-heuristic]] warns against — "hand-adjust `terrorRating` ... rather than reworking the formula's constants"), zone nodes now also carry an optional `warning` (plain text, hand-set per zone via a migration, `null` for the overwhelming majority with no such caveat). It's surfaced everywhere a zone shows up to a traveler:

- `<zone-dossier>` — a full warning banner with the message text, since a traveler looking at a zone's own page should read the whole caveat, not just get a hover hint.
- `<route-path>` — a small per-step indicator (mirroring the existing per-step `outOfEra` treatment) with the message as a tooltip, since a route can pass through a warned zone as a waypoint without either endpoint being the one with the caveat.

Both routes to it are backend fields already threaded per-zone through existing payloads (`ZoneVendorInfo.warning` for the dossier's destination lookup, `RouteStep.warning` for each hop) rather than a new endpoint.

Only Kithicor Forest has one so far (migration 397) — this is meant for the rare zone where a single number is actively misleading, not a general annotation field to fill in wherever curiosity strikes.
