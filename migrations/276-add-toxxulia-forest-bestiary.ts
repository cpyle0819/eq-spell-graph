/**
 * Migration 276: add mob nodes for zone:toxxulia-forest, per the `mob`
 * node type from migration 060 (decisions/mob-node-type.md) -- see issue
 * #36.
 *
 * `Category:Toxxulia Forest` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 52
 * `{{Namedmobpage}}` candidates across two `tlcontinue` pages: the kobold
 * camps (runts/scouts/watchers/shamans/sentries/casters), a snake cluster
 * (thistle/briar variants at increasing sizes, plus generic large/giant
 * snakes), the Poacher gang (Dell/Shelli/Topi/Willa/Hill), a set of
 * high-level named Erudin-citizen patrols tied to the Shadow Knight Epic
 * Quest (Sentinel Creot/Drom/Flavius, Knarthenne Skurl, Jalen Goldsinger,
 * Lanivon Baxer, Marzus Demsion) -- all carry full stat blocks despite
 * reading as functional-sounding "Sentinel"/"Emissary" names, same "stats
 * over name" rule as prior batches -- and standalone named creatures
 * (Rungupp, Talrigar Eklorin, the zone's own "good aligned Erudites should
 * be aware of" warning NPC).
 *
 * Three exclusions:
 * - "A Boat" -- blank `zone` field, not a creature at all (a boat-pathing
 *   utility entity, not something a player fights per CLAUDE.md's
 *   bestiary definition).
 * - "A fish" -- `zone = Various Zones`, a fishing catch rather than a zone
 *   creature, same exclusion as the Neriak batch's "A fish".
 * - "A Giant Snake (Blackburrow)" -- carries the Toxxulia Forest category
 *   tag (likely from sharing infrastructure with this zone's own "A Giant
 *   Snake (Toxxulia Forest)" page) but its own `zone` field names only
 *   Blackburrow -- same miscategorized-candidate pattern as Lower Guk's
 *   excluded "A froglok tsu shaman".
 *
 * Level-string notes, same rules as the Desert of Ro batch (migrations
 * 274-275) this pairs with: "A skeleton", "A Decaying Skeleton", "A
 * Spiderling", "A Willowisp", "A Fire Beetle", and "A Large Rat" all report
 * `zone = Various` with no zone-specific breakout -- kept via their base
 * level span, category membership being the sufficient signal for this
 * kind of generic multi-zone creature.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const MOBS = [
  { label: "A skeleton", minLevel: 4, maxLevel: 18 },
  { label: "A Decaying Skeleton", minLevel: 1, maxLevel: 1 },
  { label: "Rungupp", minLevel: 5, maxLevel: 5 },
  { label: "Aglthin Dasmore", minLevel: 8, maxLevel: 8 },
  { label: "Ilanics Skeleton", minLevel: 7, maxLevel: 7 },
  { label: "Poacher Dell", minLevel: 4, maxLevel: 4 },
  { label: "Poacher Shelli", minLevel: 3, maxLevel: 3 },
  { label: "Poacher Topi", minLevel: 3, maxLevel: 3 },
  { label: "Poacher Willa", minLevel: 5, maxLevel: 5 },
  { label: "Elial Brook", minLevel: 7, maxLevel: 7 },
  { label: "A Large Skunk", minLevel: 2, maxLevel: 2 },
  { label: "A Spiderling", minLevel: 1, maxLevel: 4 },
  { label: "A Willowisp", minLevel: 9, maxLevel: 11 },
  { label: "A Kobold Runt", minLevel: 1, maxLevel: 1 },
  { label: "Phaeril Nightshire", minLevel: 25, maxLevel: 25 },
  { label: "Veisha Fathomwalker", minLevel: 25, maxLevel: 25 },
  { label: "Knarthenne Skurl", minLevel: 50, maxLevel: 50 },
  { label: "A Kobold Watcher", minLevel: 3, maxLevel: 4 },
  { label: "A Kobold Shaman", minLevel: 3, maxLevel: 5 },
  { label: "A Kobold Sentry", minLevel: 3, maxLevel: 3 },
  { label: "A Fire Beetle", minLevel: 2, maxLevel: 2 },
  { label: "A Kobold Caster", minLevel: 5, maxLevel: 5 },
  { label: "A Giant Snake (Toxxulia Forest)", minLevel: 7, maxLevel: 11 },
  { label: "Sentinel Creot", minLevel: 30, maxLevel: 30 },
  { label: "Sentinel Drom", minLevel: 50, maxLevel: 50 },
  { label: "Sentinel Flavius", minLevel: 50, maxLevel: 50 },
  { label: "Shintar Vinlail", minLevel: 4, maxLevel: 4 },
  { label: "A large snake", minLevel: 3, maxLevel: 5 },
  { label: "A Large Rat", minLevel: 1, maxLevel: 1 },
  { label: "A kobold scout (Toxxulia)", minLevel: 2, maxLevel: 2 },
  { label: "A large wood spider", minLevel: 3, maxLevel: 5 },
  { label: "A pixie", minLevel: 14, maxLevel: 17 },
  { label: "Jalen Goldsinger", minLevel: 40, maxLevel: 40 },
  { label: "An Erudin Emissary", minLevel: 22, maxLevel: 22 },
  { label: "Poacher Hill", minLevel: 4, maxLevel: 4 },
  { label: "An infected rat", minLevel: 2, maxLevel: 2 },
  { label: "A thistle snake", minLevel: 1, maxLevel: 1 },
  { label: "A briar snake", minLevel: 3, maxLevel: 3 },
  { label: "A large briar snake", minLevel: 7, maxLevel: 7 },
  { label: "A large thistle snake", minLevel: 6, maxLevel: 6 },
  { label: "A giant briar snake", minLevel: 7, maxLevel: 7 },
  { label: "A giant thistle snake", minLevel: 9, maxLevel: 9 },
  { label: "A heretic prophet", minLevel: 5, maxLevel: 5 },
  { label: "A skunk", minLevel: 2, maxLevel: 2 },
  { label: "A Widow Hatchling (Toxxulia Forest)", minLevel: 2, maxLevel: 2 },
  { label: "Abandoned heretic pet", minLevel: 8, maxLevel: 10 },
  { label: "Lanivon Baxer", minLevel: 50, maxLevel: 50 },
  { label: "Marzus Demsion", minLevel: 45, maxLevel: 45 },
  { label: "Talrigar Eklorin", minLevel: 34, maxLevel: 34 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:toxxulia-forest:${slug(mob.label)}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, "zone:toxxulia-forest", "located_in");
}

save();
console.log(`Migration 276 complete: ${added} mob node(s) added to zone:toxxulia-forest`);
