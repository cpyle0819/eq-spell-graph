/**
 * Migration 342: add npc nodes (roles: ["mob"]) for zone:the-wakening-land,
 * per the unified `npc`/`roles` schema from migration 265
 * (decisions/npc-mob-unification-and-zone-groups.md) -- see issue #41
 * (data-quality audit flagged this zone as having 0 mobs, only 2 vendors).
 *
 * `Category:The Wakening Land` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 57
 * `{{Namedmobpage}}` candidates, all confirmed by their own `zone` field
 * (some spelled "Wakening Land"/"Wakening Lands" without "The" -- same
 * zone). "A Geonid (WL)" -- wiki page title disambiguator stripped for the
 * in-game label.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:the-wakening-land";

const MOBS: { label: string; minLevel: number; maxLevel: number }[] = [
  { label: "A Geonid", minLevel: 44, maxLevel: 48 },
  { label: "A Tar Goo", minLevel: 40, maxLevel: 44 },
  { label: "A suit of sentient armor", minLevel: 43, maxLevel: 45 },
  { label: "A Holgresh Conjurer", minLevel: 35, maxLevel: 35 },
  { label: "A Frost Giant Laborer", minLevel: 38, maxLevel: 40 },
  { label: "A Drixie Thane", minLevel: 34, maxLevel: 36 },
  { label: "A geonid shaman", minLevel: 46, maxLevel: 47 },
  { label: "A Frost Giant Sentinel", minLevel: 36, maxLevel: 40 },
  { label: "A storm giant architect", minLevel: 45, maxLevel: 45 },
  { label: "A corrupted faun", minLevel: 55, maxLevel: 55 },
  { label: "A corrupted panther", minLevel: 55, maxLevel: 55 },
  { label: "A corrupted unicorn", minLevel: 60, maxLevel: 60 },
  { label: "A tigeraptor", minLevel: 33, maxLevel: 38 },
  { label: "A Storm Giant Foreman", minLevel: 45, maxLevel: 45 },
  { label: "A holgresh elementalist", minLevel: 34, maxLevel: 34 },
  { label: "A storm giant surveyor", minLevel: 45, maxLevel: 45 },
  { label: "A frost giant sentry", minLevel: 37, maxLevel: 39 },
  { label: "A holgresh raider", minLevel: 34, maxLevel: 34 },
  { label: "A panther", minLevel: 33, maxLevel: 37 },
  { label: "A haze panther", minLevel: 39, maxLevel: 41 },
  { label: "A unicorn", minLevel: 37, maxLevel: 37 },
  { label: "A wounded storm giant", minLevel: 44, maxLevel: 44 },
  { label: "A Sifaye Thane", minLevel: 36, maxLevel: 36 },
  { label: "A Sifaye troubadour", minLevel: 37, maxLevel: 37 },
  { label: "A sifaye knight", minLevel: 37, maxLevel: 37 },
  { label: "A tigesaurous", minLevel: 35, maxLevel: 40 },
  { label: "A Faun", minLevel: 48, maxLevel: 49 },
  { label: "Accolyte of Zek", minLevel: 50, maxLevel: 50 },
  { label: "A shimmering geonid", minLevel: 48, maxLevel: 48 },
  { label: "An elder holgresh", minLevel: 38, maxLevel: 38 },
  { label: "Mist Panther", minLevel: 60, maxLevel: 60 },
  { label: "Frostgiant Overseer", minLevel: 56, maxLevel: 56 },
  { label: "Priest Bjek", minLevel: 56, maxLevel: 56 },
  { label: "Priest Delar", minLevel: 56, maxLevel: 56 },
  { label: "Priest Grenk", minLevel: 56, maxLevel: 56 },
  { label: "Tomekeeper Bjordnessin", minLevel: 49, maxLevel: 49 },
  { label: "Eysa Florawhisper", minLevel: 48, maxLevel: 48 },
  { label: "Shamus Aghllsews", minLevel: 60, maxLevel: 60 },
  { label: "Korzak Stonehammer", minLevel: 37, maxLevel: 37 },
  { label: "Wuoshi", minLevel: 64, maxLevel: 64 },
  { label: "Grand Vizier Poolakacha`tei", minLevel: 45, maxLevel: 45 },
  { label: "Rapticor", minLevel: 42, maxLevel: 42 },
  { label: "Lieutenant Krofer", minLevel: 47, maxLevel: 47 },
  { label: "Lady Gelistial", minLevel: 55, maxLevel: 55 },
  { label: "Phenocryst", minLevel: 58, maxLevel: 58 },
  { label: "Lord Gossimerwind", minLevel: 42, maxLevel: 42 },
  { label: "Lord Prismwing", minLevel: 44, maxLevel: 44 },
  { label: "Teir`Dal Mercenary", minLevel: 38, maxLevel: 38 },
  { label: "Barbarian Mercenary", minLevel: 38, maxLevel: 38 },
  { label: "Troll Mercenary", minLevel: 37, maxLevel: 37 },
  { label: "Gnome Mercenary", minLevel: 38, maxLevel: 38 },
  { label: "Human Mercenary", minLevel: 37, maxLevel: 37 },
  { label: "Ogre Mercenary", minLevel: 38, maxLevel: 38 },
  { label: "Countess Silveana", minLevel: 46, maxLevel: 46 },
  { label: "Rolandal", minLevel: 60, maxLevel: 60 },
  { label: "Felisiana of Tunare", minLevel: 44, maxLevel: 46 },
  { label: "Toxonomist Drorjon", minLevel: 49, maxLevel: 49 },
];

let added = 0;
let merged = 0;
for (const mob of MOBS) {
  const id = `npc:the-wakening-land:${slug(mob.label)}`;
  if (hasNode(id)) {
    merged++;
    continue;
  }
  addNode({ id, label: mob.label, type: "npc", roles: ["mob"], minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
  added++;
}

save();
console.log(`Migration 342 complete: ${added} npc node(s) added, ${merged} already present, for zone:the-wakening-land`);
