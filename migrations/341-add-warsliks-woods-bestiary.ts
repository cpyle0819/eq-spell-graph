/**
 * Migration 341: add npc nodes (roles: ["mob"]) for zone:warsliks-woods,
 * per the unified `npc`/`roles` schema from migration 265
 * (decisions/npc-mob-unification-and-zone-groups.md) -- see issue #41
 * (data-quality audit flagged this zone as having zero NPCs of any kind).
 *
 * `Category:Warsliks Woods` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 57
 * `{{Namedmobpage}}` candidates. "A Goblin Warrior" excluded: its own zone
 * field names only Misty Thicket/Butcherblock Mountains, no corroboration
 * from this zone. The wiki spells the zone both "Warsliks Woods" and
 * "Warslik's Woods" across different candidate pages -- both accepted as
 * this zone. Parenthetical wiki disambiguators ("(Iksar)", "(Kunark)")
 * stripped from in-game labels; "A skeleton (Iksar)" and "Skeleton (Iksar)"
 * are two separate wiki pages (own stat blocks, both zone-confirmed) kept
 * as two distinct nodes despite the near-identical name.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:warsliks-woods";

const MOBS: { label: string; minLevel: number; maxLevel: number }[] = [
  { label: "A Goblin Soothsayer", minLevel: 20, maxLevel: 21 },
  { label: "A goblin battlemaster", minLevel: 14, maxLevel: 16 },
  { label: "A Forest Giant Evergreen", minLevel: 22, maxLevel: 27 },
  { label: "A Skulking Brute", minLevel: 22, maxLevel: 25 },
  { label: "A Forest Giant Greenwood", minLevel: 19, maxLevel: 23 },
  { label: "A Skulking Brutling", minLevel: 13, maxLevel: 13 },
  { label: "A Forest Giant Sapling", minLevel: 17, maxLevel: 19 },
  { label: "A Goblin Skirmisher", minLevel: 12, maxLevel: 12 },
  { label: "A Forest Giant", minLevel: 20, maxLevel: 20 },
  { label: "A Goblin Scout", minLevel: 2, maxLevel: 4 },
  { label: "A Goblin Witchdoctor", minLevel: 13, maxLevel: 15 },
  { label: "A Goblin Watcher", minLevel: 3, maxLevel: 5 },
  { label: "A Goblin Hextracer", minLevel: 7, maxLevel: 8 },
  { label: "A goblin bloodtracer", minLevel: 18, maxLevel: 18 },
  { label: "A goblin pit fighter", minLevel: 16, maxLevel: 16 },
  { label: "A goblin outrider", minLevel: 5, maxLevel: 6 },
  { label: "A scaled wolf cub", minLevel: 2, maxLevel: 4 },
  { label: "A scaled wolf pup", minLevel: 1, maxLevel: 1 },
  { label: "A pygmy skulking brute", minLevel: 18, maxLevel: 18 },
  { label: "A decaying skeleton", minLevel: 1, maxLevel: 1 },
  { label: "A skeleton", minLevel: 4, maxLevel: 4 },
  { label: "A Goblin Whelp", minLevel: 1, maxLevel: 1 },
  { label: "A goblin thief", minLevel: 4, maxLevel: 4 },
  { label: "A shady goblin", minLevel: 40, maxLevel: 40 },
  { label: "A scaled wolf elder", minLevel: 22, maxLevel: 22 },
  { label: "A goblin bonecaster", minLevel: 10, maxLevel: 10 },
  { label: "A goblin agressor", minLevel: 19, maxLevel: 19 },
  { label: "A goblin brawler", minLevel: 13, maxLevel: 15 },
  { label: "A Skulking runtling", minLevel: 7, maxLevel: 9 },
  { label: "Grachnist the Destroyer", minLevel: 32, maxLevel: 32 },
  { label: "Warlord Vyzer", minLevel: 51, maxLevel: 51 },
  { label: "Captain Gideen", minLevel: 50, maxLevel: 50 },
  { label: "An Iksar Bandit", minLevel: 8, maxLevel: 10 },
  { label: "An iksar marauder", minLevel: 14, maxLevel: 16 },
  { label: "Iksar Bandit Lord", minLevel: 31, maxLevel: 31 },
  { label: "Goblin Spirit Caller", minLevel: 22, maxLevel: 24 },
  { label: "Iksar Pariah", minLevel: 19, maxLevel: 19 },
  { label: "Crusader Eaxl", minLevel: 50, maxLevel: 50 },
  { label: "Crusader Myxl", minLevel: 50, maxLevel: 50 },
  { label: "An Iksar Manslayer", minLevel: 18, maxLevel: 19 },
  { label: "Pit Fighter Dob", minLevel: 33, maxLevel: 33 },
  { label: "Ssolet Dnaas", minLevel: 50, maxLevel: 50 },
  { label: "An iksar brigand", minLevel: 11, maxLevel: 13 },
  { label: "An iksar footpad", minLevel: 5, maxLevel: 5 },
  { label: "Iksar exile", minLevel: 22, maxLevel: 26 },
  { label: "Trooper Roklon", minLevel: 50, maxLevel: 50 },
  { label: "An iksar knight", minLevel: 21, maxLevel: 21 },
  { label: "Skeleton", minLevel: 4, maxLevel: 4 },
  { label: "Trooper Agash", minLevel: 50, maxLevel: 50 },
  { label: "Trooper Gepwyz", minLevel: 50, maxLevel: 50 },
  { label: "Trooper Kroniz", minLevel: 50, maxLevel: 50 },
  { label: "Trooper Lunmiz", minLevel: 50, maxLevel: 50 },
  { label: "Trooper Melzok", minLevel: 50, maxLevel: 50 },
  { label: "Trooper Olon", minLevel: 50, maxLevel: 50 },
  { label: "Trooper Syldon", minLevel: 50, maxLevel: 50 },
  { label: "Trooper Walrun", minLevel: 50, maxLevel: 50 },
];

let added = 0;
let merged = 0;
for (const mob of MOBS) {
  const id = `npc:warsliks-woods:${slug(mob.label)}`;
  if (hasNode(id)) {
    merged++;
    continue;
  }
  addNode({ id, label: mob.label, type: "npc", roles: ["mob"], minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
  added++;
}

save();
console.log(`Migration 341 complete: ${added} npc node(s) added, ${merged} already present, for zone:warsliks-woods`);
