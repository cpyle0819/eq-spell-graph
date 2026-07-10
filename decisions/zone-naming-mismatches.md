# Naming mismatches

Some vendor data uses different zone names than adjacency data (e.g., "Neriak" vs "Neriak 3rd Gate"). Migration 005 bridges these with extra `connects_to` edges rather than renaming nodes (which would break existing edge references).

