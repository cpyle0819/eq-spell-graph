/**
 * Migration 337: add npc nodes (roles: ["mob"]) for zone:trakanon-s-teeth,
 * per the unified `npc`/`roles` schema from migration 265
 * (decisions/npc-mob-unification-and-zone-groups.md) -- see issue #41
 * (data-quality audit flagged this zone as having only 1 NPC total and 0
 * mobs).
 *
 * `Category:Trakanon's Teeth` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 59
 * `{{Namedmobpage}}` candidates. Two excluded for failing the own-`zone`-
 * field check with no corroborating in-zone signal: "Froglok Tsu Shaman"
 * (zone: Firiona Vie only) and "A trakanasaur" (zone: Emerald Jungle only,
 * despite the zone's own name) -- neither the zone's map legend nor any
 * quest text here mentions either one.
 *
 * "Kaiaren"'s own page states outright it covers "two different NPCs" --
 * Mad Kaiaren (near the Sebilis ruins) and Sane Kaiaren (west of the lake),
 * both quest-critical turn-ins for the Monk Epic Quest's final steps, both
 * carrying the page's one shared stat block (level 52). Split into two
 * nodes, same "separately named, separately encountered" call as Karnor's
 * Castle's Venril Sathir phases.
 *
 * "Emperor Ganak" already exists (roles: ["quest_giver"]) -- his own page
 * carries a full combat stat block (409 AC, 34000 HP, "Flee's at 14%"), so
 * this adds a `mob` role and level to the existing node rather than a
 * second one.
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:trakanon-s-teeth";

const MOBS: { label: string; minLevel: number; maxLevel: number }[] = [
  { label: "A human skeleton", minLevel: 39, maxLevel: 40 },
  { label: "A stonegazer cockatrice", minLevel: 33, maxLevel: 37 },
  { label: "A stoneleer cockatrice", minLevel: 29, maxLevel: 33 },
  { label: "Bloodeye", minLevel: 50, maxLevel: 50 },
  { label: "Champion Arlek", minLevel: 45, maxLevel: 45 },
  { label: "Champion Thenrin", minLevel: 50, maxLevel: 50 },
  { label: "Commander Sils", minLevel: 45, maxLevel: 45 },
  { label: "Crusader Zoglic", minLevel: 45, maxLevel: 45 },
  { label: "Doom", minLevel: 55, maxLevel: 55 },
  { label: "Dragontail", minLevel: 47, maxLevel: 47 },
  { label: "Dreadlord Fanrik", minLevel: 50, maxLevel: 50 },
  { label: "Ebon Lotus", minLevel: 50, maxLevel: 50 },
  { label: "Erollisi Mantrap", minLevel: 33, maxLevel: 33 },
  { label: "Fallen Iksar", minLevel: 34, maxLevel: 34 },
  { label: "Ffroaak", minLevel: 50, maxLevel: 50 },
  { label: "Flayhte", minLevel: 45, maxLevel: 45 },
  { label: "Froglok Forager", minLevel: 45, maxLevel: 45 },
  { label: "Froglok hunter", minLevel: 45, maxLevel: 45 },
  { label: "Froglok Shin Knight", minLevel: 35, maxLevel: 35 },
  { label: "Froglok Shin Warrior", minLevel: 32, maxLevel: 32 },
  { label: "Froglok Tal Shaman", minLevel: 33, maxLevel: 33 },
  { label: "Froglok urd shaman", minLevel: 34, maxLevel: 38 },
  { label: "Froglok Vis Knight", minLevel: 34, maxLevel: 38 },
  { label: "Froglok Wan Knight", minLevel: 37, maxLevel: 41 },
  { label: "Froglok yun shaman", minLevel: 37, maxLevel: 41 },
  { label: "Hangman", minLevel: 48, maxLevel: 48 },
  { label: "Harbinger Dronik", minLevel: 50, maxLevel: 50 },
  { label: "Harbinger Josk", minLevel: 48, maxLevel: 48 },
  { label: "Hierophant Ixyl", minLevel: 48, maxLevel: 48 },
  { label: "Iksar mercenary", minLevel: 36, maxLevel: 36 },
  { label: "Iksar treasure hunter", minLevel: 34, maxLevel: 34 },
  { label: "Mad Kaiaren", minLevel: 52, maxLevel: 52 },
  { label: "Sane Kaiaren", minLevel: 52, maxLevel: 52 },
  { label: "Keeper Lasnik", minLevel: 45, maxLevel: 45 },
  { label: "Keeper Sepsis", minLevel: 45, maxLevel: 45 },
  { label: "Klok Denris", minLevel: 48, maxLevel: 48 },
  { label: "Knight Dragol", minLevel: 45, maxLevel: 45 },
  { label: "Oracle Froskil", minLevel: 45, maxLevel: 45 },
  { label: "Pained Soul", minLevel: 43, maxLevel: 43 },
  { label: "Partisan Yinlen", minLevel: 45, maxLevel: 45 },
  { label: "Sabretooth Tigress", minLevel: 30, maxLevel: 34 },
  { label: "Sigra", minLevel: 49, maxLevel: 49 },
  { label: "Silvermane", minLevel: 50, maxLevel: 50 },
  { label: "Spectral Champion", minLevel: 39, maxLevel: 43 },
  { label: "Spectral Commander", minLevel: 44, maxLevel: 48 },
  { label: "Spectral footman", minLevel: 36, maxLevel: 36 },
  { label: "Spectral keeper", minLevel: 36, maxLevel: 40 },
  { label: "Spectral Legionnaire", minLevel: 33, maxLevel: 37 },
  { label: "Spectral partisan", minLevel: 31, maxLevel: 31 },
  { label: "Squire Glik", minLevel: 45, maxLevel: 45 },
  { label: "Stonebeak", minLevel: 47, maxLevel: 47 },
  { label: "Throkkok", minLevel: 48, maxLevel: 48 },
  { label: "Thruke", minLevel: 45, maxLevel: 45 },
  { label: "Titail Sinok", minLevel: 45, maxLevel: 45 },
  { label: "Trakanasaurus Rex", minLevel: 50, maxLevel: 50 },
  { label: "Undead keeper", minLevel: 36, maxLevel: 38 },
  { label: "Vessel Fryn", minLevel: 45, maxLevel: 45 },
];

let added = 0;
let merged = 0;
for (const mob of MOBS) {
  const id = `npc:trakanon-s-teeth:${slug(mob.label)}`;

  if (hasNode(id)) {
    const node = graph.nodes.find((n: { id: string }) => n.id === id);
    const roles: string[] = node.roles || [];
    if (!roles.includes("mob")) roles.push("mob");
    node.roles = roles;
    node.minLevel = mob.minLevel;
    node.maxLevel = mob.maxLevel;
    merged++;
    continue;
  }
  addNode({ id, label: mob.label, type: "npc", roles: ["mob"], minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
  added++;
}

// Emperor Ganak already exists as a quest_giver -- his own page carries a
// full combat stat block ("Flee's at 14%"), so add the mob role in place.
const ganakId = "npc:trakanon-s-teeth:emperor-ganak";
if (hasNode(ganakId)) {
  const ganak = graph.nodes.find((n: { id: string }) => n.id === ganakId);
  const roles: string[] = ganak.roles || [];
  if (!roles.includes("mob")) roles.push("mob");
  ganak.roles = roles;
  ganak.minLevel = 60;
  ganak.maxLevel = 60;
  merged++;
}

save();
console.log(`Migration 337 complete: ${added} npc node(s) added, ${merged} existing npc(s) merged with a mob role, for zone:trakanon-s-teeth`);
