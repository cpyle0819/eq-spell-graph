# Planner state: single auto-saved snapshot, not named profiles

The planner persists one last-used state (race, class selections, deity, zone, level range, pinned spells/zones, owned spells) to `localStorage` and restores it on load — it does not support multiple named/saved characters. This replaces an earlier per-character profile system (named profiles, per-profile owned-spell tracking) with something simpler for the common case of planning for one character at a time. Revisit if multi-character support turns out to matter — the per-profile version demonstrated it's a straightforward layer to add back on top of `getState()`/`restoreState()`.

