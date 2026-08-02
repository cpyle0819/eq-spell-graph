/**
 * Adds a hand-set `warning` (plain text) to Kithicor Forest, the first zone
 * to use the new zone-warning feature. See decisions/zone-danger-warnings.md
 * for why this exists alongside `terrorRating` (migration 396) rather than
 * folding into it: terrorRating is a single 0-5 number meant to compare
 * zones against each other for routing, and can't express a zone whose
 * danger swings sharply by time of day the way Kithicor's does.
 *
 * Quoted from eqlwiki.com/index.php/Kithicor_Forest: ordinary NPCs despawn
 * from 8PM-6AM (in-game) and are replaced by "numerous highly aggressive
 * level 35+ undead", with "no guards to save you"; even by day, goblin
 * workers, will-o-wisps, and Shadowed Men roam and "can be difficult to see
 * until close, and are powerful."
 */
import { dirname } from "path";
import { fileURLToPath } from "url";
import { loadGraph } from "./_lib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const { updateNode, save } = loadGraph(__dirname);

updateNode("zone:kithicor-forest", {
  warning:
    "From 8PM-6AM (in-game), ordinary NPCs here despawn and are replaced by numerous highly aggressive level 35+ undead, with no guards nearby. Even by day, goblin workers, will-o-wisps, and Shadowed Men roam and can be hard to spot until close.",
});

save();
console.log("Migration 397 complete: set warning on zone:kithicor-forest");
