/**
 * Migration 171: add mob nodes for zone:firiona-vie, per the `mob` node
 * type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Sourced via the MediaWiki API technique
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md):
 * Category:Firiona Vie's 204 pages narrowed to 105 {{Namedmobpage}}-tagged
 * candidates. Firiona Vie is a small elven outpost inside a hostile
 * wilderness, so unlike a full city its garrison (the ~50 candidates
 * carrying "Emerald Warriors"/"Storm Guard"/"Inhabitants of Firiona Vie"
 * as their own listed faction -- Guard-, Scout-, Sergeant-, Captain-,
 * Lieutenant-, General-, Commander-, Private-, Shieldbearer-, and
 * Fieldsurgeon-prefixed names, plus bankers/GM trainers/quest-turn-ins)
 * is excluded the same way North Qeynos's guards/guildmasters were
 * (migration 139), while the wilderness creatures around it are kept.
 *
 * The page's own "Types of Monsters" field is the primary signal for what
 * counts as a creature here, not just opposing-faction membership: Drolvarg
 * (Savage/Scavenger/Snarler/Growler), Froglok (Ton Knight/Warrior, Shin
 * Warrior/Knight, Tal/Nok/Tsu Shaman), Goblin (Battlemaster/Raider/Spirit
 * Caller/blightcaller/adept/pillager), Drachnid (Webspinner/Weblurker/
 * Webstrander/Silkspinner/Silkstrander/Silklurker/spy), Forest Giant Arbor,
 * and Firiona Drixie are all explicitly named there -- Firiona Drixie and
 * "A Pilgrim" are included as real creatures despite also carrying the
 * garrison's own faction tags, since the zone's own infobox classifies them
 * under "Types of Monsters" rather than as NPCs. Named individual hostiles
 * (Red Eye Jack, Vekis, the three pirates, An Ancient Jarsath, Mister
 * Fizzle, Alex McDarnin, Hero Goxnok) were confirmed via each page's own
 * description text ("This monster...", "ganked by the FV Outpost guards",
 * "Be careful!", a scripted Crusader's Test encounter) rather than faction
 * membership alone.
 *
 * Excluded for no resolvable numeric level: "Diseased forest giant",
 * "Dithgar Irongut" (both blank), "Luminare Pasinia" ("Unknown Blue con to
 * 60", one data point, same exclusion rule as migration 165's "Kromrif
 * Soldier"), and "A Goblin Warrior" (its only stated levels are for Misty
 * Thicket/Butcherblock Mountains, not Firiona Vie -- a shared template page
 * with no Firiona-specific number, unlike "a fish"/migration 167's
 * zone-agnostic level 1). "Maidens Voyage" is the zone's own ferry boat,
 * not a creature ("You can't consider that." is its stated level).
 * "Kwinn the Outlander" has its own eponymous quest and an explicit "No
 * faction hit" despite roaming near the Drolvarg camp -- treated as a
 * quest NPC, not a kill target.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:firiona-vie";

const MOBS = [
  { slug: "a-pilgrim", label: "A Pilgrim", minLevel: 27, maxLevel: 27 },
  { slug: "firiona-drixie", label: "Firiona Drixie", minLevel: 32, maxLevel: 32 },
  { slug: "a-forest-giant-arbor", label: "A Forest Giant Arbor", minLevel: 38, maxLevel: 38 },
  { slug: "a-drolvarg-snarler", label: "A Drolvarg Snarler", minLevel: 32, maxLevel: 36 },
  { slug: "a-drolvarg-growler", label: "A Drolvarg Growler", minLevel: 29, maxLevel: 33 },
  { slug: "a-drolvarg-savage", label: "A Drolvarg Savage", minLevel: 26, maxLevel: 26 },
  { slug: "a-drolvarg-scavenger", label: "A Drolvarg Scavenger", minLevel: 26, maxLevel: 26 },
  { slug: "froglok-tsu-shaman", label: "Froglok Tsu Shaman", minLevel: 31, maxLevel: 31 },
  { slug: "froglok-shin-warrior", label: "Froglok Shin Warrior", minLevel: 32, maxLevel: 32 },
  { slug: "froglok-shin-knight", label: "Froglok Shin Knight", minLevel: 35, maxLevel: 35 },
  { slug: "froglok-tal-shaman", label: "Froglok Tal Shaman", minLevel: 33, maxLevel: 33 },
  { slug: "froglok-ton-knight", label: "Froglok Ton Knight", minLevel: 32, maxLevel: 32 },
  { slug: "froglok-ton-warrior", label: "Froglok Ton Warrior", minLevel: 24, maxLevel: 24 },
  { slug: "froglok-nok-shaman", label: "Froglok Nok Shaman", minLevel: 26, maxLevel: 26 },
  { slug: "goblin-battlemaster", label: "Goblin Battlemaster", minLevel: 31, maxLevel: 31 },
  { slug: "goblin-raider", label: "Goblin Raider", minLevel: 28, maxLevel: 28 },
  { slug: "goblin-spirit-caller", label: "Goblin Spirit Caller", minLevel: 22, maxLevel: 24 },
  { slug: "a-goblin-blightcaller", label: "A Goblin Blightcaller", minLevel: 31, maxLevel: 33 },
  { slug: "goblin-adept", label: "Goblin Adept", minLevel: 37, maxLevel: 37 },
  { slug: "a-goblin-raider", label: "A Goblin Raider", minLevel: 28, maxLevel: 28 },
  { slug: "goblin-pillager", label: "Goblin Pillager", minLevel: 28, maxLevel: 31 },
  { slug: "a-drachnid-weblurker", label: "A Drachnid Weblurker", minLevel: 29, maxLevel: 29 },
  { slug: "a-drachnid-webspinner", label: "A Drachnid Webspinner", minLevel: 28, maxLevel: 28 },
  { slug: "a-drachnid-webstrander", label: "A Drachnid Webstrander", minLevel: 31, maxLevel: 31 },
  { slug: "a-drachnid-silkstrander", label: "A Drachnid Silkstrander", minLevel: 33, maxLevel: 33 },
  { slug: "a-drachnid-silklurker", label: "A Drachnid Silklurker", minLevel: 27, maxLevel: 27 },
  { slug: "a-drachnid-silkspinner", label: "A Drachnid Silkspinner", minLevel: 27, maxLevel: 27 },
  { slug: "a-drachnid-spy", label: "A Drachnid Spy", minLevel: 25, maxLevel: 25 },
  { slug: "red-eye-jack", label: "Red Eye Jack", minLevel: 31, maxLevel: 31 },
  { slug: "vekis", label: "Vekis", minLevel: 56, maxLevel: 56 },
  { slug: "a-pirate-cartographer", label: "A Pirate Cartographer", minLevel: 26, maxLevel: 29 },
  { slug: "a-pirate", label: "A Pirate", minLevel: 24, maxLevel: 30 },
  { slug: "a-pirate-destroyer", label: "A Pirate Destroyer", minLevel: 30, maxLevel: 31 },
  { slug: "an-ancient-jarsath", label: "An Ancient Jarsath", minLevel: 42, maxLevel: 42 },
  { slug: "mister-fizzle", label: "Mister Fizzle", minLevel: 30, maxLevel: 30 },
  { slug: "alex-mcdarnin", label: "Alex McDarnin", minLevel: 49, maxLevel: 49 },
  { slug: "hero-goxnok", label: "Hero Goxnok", minLevel: 25, maxLevel: 25 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:firiona-vie:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 171 complete: ${added} mob node(s) added for Firiona Vie`);
