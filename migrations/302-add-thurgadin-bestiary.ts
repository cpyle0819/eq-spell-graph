/**
 * Migration 302: add npc nodes (roles: ["mob"]) for zone:thurgadin, per
 * the unified `npc`/`roles` schema from migration 265
 * (decisions/npc-mob-unification-and-zone-groups.md) -- see issue #36.
 *
 * `Category:Thurgadin` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to
 * 119 real `{{Namedmobpage}}` candidates (a 120th, "Template:Coldain
 * Crossbow Guard", is the shared template itself, not a mob page).
 *
 * New template wrinkle this batch: several "Guard `<name>`" candidates
 * (Clorn, Valdis, Bjorn, Pert, Dobbs, Elin, Gord, Mason, Enre, Fjola) use
 * `{{Coldain Crossbow Guard}}` rather than transcluding `{{Namedmobpage}}`
 * directly -- their own page only fills in name/location/image params, so
 * the naive per-page wikitext regex for `| level = ` finds nothing. The
 * shared level (35-39), full stat block, and confirmed drops (Coldain
 * Crossbow, Velium Bolt, both "Always") live on the template page itself
 * (`Template:Coldain Crossbow Guard`) -- worth checking a template's own
 * page when a batch of otherwise-identical candidates return null level
 * data. The remaining "Guard `<name>`" candidates transclude
 * `{{Namedmobpage}}` directly with their own individual level (35-40).
 *
 * Two guildmaster exclusions, per CLAUDE.md:
 * - "Loremaster Borannin" has no `GM` tag in its `class` field (plain
 *   `[[Warrior]]`), but its own description reads "Cleric Guild Master"
 *   -- same role-caught-by-description precedent as Southern Karana's
 *   excluded "Brother Qwinn".
 * - "Nargl Stonecutter" is `GM [[Rogue]]`, the ordinary mechanical tell.
 *
 * One reversed guildmaster call: "Warpriest Penatain"'s `class` field
 * still reads `GM [[Paladin]]`, but its own description has a struck-out
 * correction -- "not a GM as of 3/6/2026" -- so the wiki's own text
 * overrides its stale class field; kept as a real fight using both levels
 * its description hedges between (42 or 46).
 *
 * This is a friendly Coldain city with no civil-war-style faction split
 * (unlike West Freeport/South Qeynos) -- every named Guard/Lieutenant/
 * Initiate/Templar/tavern patron carries a full stated level with no
 * guildmaster tell, so all were kept per the established "stats over
 * name/role" rule, consistent with Kaladim's precedent for a friendly
 * city with a real, farmable guard roster.
 *
 * "Normon Stonetooth", "Erdarf Restil", "Battlepriest Daragor", "Captain
 * Njall", "Leifur", "Foreman Felspar", and "Ungdin" already existed as
 * `npc:` quest-giver nodes -- same both-roles-legitimate shape as The
 * Warrens' Aderius Rhenar/Koajin, so this batch unions the `mob` role and
 * level data onto them rather than skipping. "Avalanche (NPC)" carries a
 * disambiguating suffix in its own page title; label stored without it.
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const MOBS: { label: string; minLevel: number; maxLevel: number }[] = [
  { label: "Pythic Urson", minLevel: 60, maxLevel: 60 },
  { label: "Normon Stonetooth", minLevel: 40, maxLevel: 40 },
  { label: "Erdarf Restil", minLevel: 35, maxLevel: 35 },
  { label: "A Crystal Spider", minLevel: 27, maxLevel: 31 },
  { label: "Guard Leif", minLevel: 39, maxLevel: 39 },
  { label: "Guard Royt", minLevel: 36, maxLevel: 36 },
  { label: "Battlepriest Daragor", minLevel: 43, maxLevel: 43 },
  { label: "Captain Njall", minLevel: 46, maxLevel: 46 },
  { label: "Trita Coldheart", minLevel: 31, maxLevel: 31 },
  { label: "Lorekeeper Einar", minLevel: 40, maxLevel: 40 },
  { label: "Leifur", minLevel: 33, maxLevel: 33 },
  { label: "Foreman Felspar", minLevel: 61, maxLevel: 61 },
  { label: "Ungdin", minLevel: 36, maxLevel: 36 },
  { label: "Guard Karl", minLevel: 39, maxLevel: 39 },
  { label: "Guard Dagur", minLevel: 36, maxLevel: 36 },
  { label: "Zrelik the Scout", minLevel: 45, maxLevel: 45 },
  { label: "Pearce Icefang", minLevel: 42, maxLevel: 42 },
  { label: "Guard Teitur", minLevel: 36, maxLevel: 36 },
  { label: "Guard Bergur", minLevel: 37, maxLevel: 37 },
  { label: "Guard Clorn", minLevel: 35, maxLevel: 39 },
  { label: "Guard Tinna", minLevel: 36, maxLevel: 36 },
  { label: "Loremaster Sarl", minLevel: 44, maxLevel: 44 },
  { label: "Thermin Wandereye", minLevel: 32, maxLevel: 32 },
  { label: "Gage", minLevel: 30, maxLevel: 30 },
  { label: "Guard Valdis", minLevel: 35, maxLevel: 39 },
  { label: "Darts O`Gavin", minLevel: 34, maxLevel: 34 },
  { label: "Wolfmaster Finnur", minLevel: 38, maxLevel: 38 },
  { label: "Alpine", minLevel: 37, maxLevel: 37 },
  { label: "Guard Iris", minLevel: 35, maxLevel: 35 },
  { label: "Trademaster Kroven", minLevel: 37, maxLevel: 37 },
  { label: "Guard Kilandur", minLevel: 39, maxLevel: 39 },
  { label: "Guard Baldvin", minLevel: 38, maxLevel: 38 },
  { label: "Guard Bjorn", minLevel: 35, maxLevel: 39 },
  { label: "Guard Pert", minLevel: 35, maxLevel: 39 },
  { label: "Guard Dobbs", minLevel: 35, maxLevel: 39 },
  { label: "Guard Eirikur", minLevel: 38, maxLevel: 38 },
  { label: "Guard Suuna", minLevel: 38, maxLevel: 38 },
  { label: "Guard Rakel", minLevel: 36, maxLevel: 36 },
  { label: "Guard Elin", minLevel: 35, maxLevel: 39 },
  { label: "Guard Thorbin", minLevel: 40, maxLevel: 40 },
  { label: "Guard Kristrun", minLevel: 35, maxLevel: 35 },
  { label: "Guard Larus", minLevel: 37, maxLevel: 37 },
  { label: "Guard Halldor", minLevel: 39, maxLevel: 39 },
  { label: "Guard Oskar", minLevel: 38, maxLevel: 38 },
  { label: "Guard Audun", minLevel: 36, maxLevel: 36 },
  { label: "Guard Sigrun", minLevel: 38, maxLevel: 38 },
  { label: "Guard Gord", minLevel: 35, maxLevel: 39 },
  { label: "Guard Mason", minLevel: 35, maxLevel: 39 },
  { label: "Guard Enre", minLevel: 35, maxLevel: 39 },
  { label: "Guard Eyvindur", minLevel: 37, maxLevel: 37 },
  { label: "Guard Fjola", minLevel: 35, maxLevel: 39 },
  { label: "A scuttle rat", minLevel: 28, maxLevel: 32 },
  { label: "A scuttle bat", minLevel: 28, maxLevel: 30 },
  { label: "A lesser tar goo", minLevel: 28, maxLevel: 28 },
  { label: "Grimthor Brewbeard", minLevel: 43, maxLevel: 43 },
  { label: "Guard Jonas", minLevel: 37, maxLevel: 37 },
  { label: "Rumagur", minLevel: 39, maxLevel: 39 },
  { label: "Jorumin", minLevel: 38, maxLevel: 38 },
  { label: "Saramor", minLevel: 40, maxLevel: 40 },
  { label: "Girk Glacierbane", minLevel: 40, maxLevel: 40 },
  { label: "Kargin the Archer", minLevel: 45, maxLevel: 45 },
  { label: "Churn the Axeman", minLevel: 45, maxLevel: 45 },
  { label: "Belinda", minLevel: 36, maxLevel: 36 },
  { label: "Loremaster Kels", minLevel: 43, maxLevel: 43 },
  { label: "Schmit Icepike", minLevel: 41, maxLevel: 41 },
  { label: "Fradin", minLevel: 34, maxLevel: 34 },
  { label: "Hason Klolp", minLevel: 36, maxLevel: 36 },
  { label: "Jinx", minLevel: 34, maxLevel: 34 },
  { label: "Kier", minLevel: 32, maxLevel: 32 },
  { label: "Denise", minLevel: 36, maxLevel: 36 },
  { label: "Gissur", minLevel: 31, maxLevel: 31 },
  { label: "Hunter Tarvin", minLevel: 36, maxLevel: 36 },
  { label: "Travit Conwil", minLevel: 32, maxLevel: 32 },
  { label: "Mort", minLevel: 30, maxLevel: 30 },
  { label: "A direwolf pup", minLevel: 24, maxLevel: 24 },
  { label: "Arikain", minLevel: 41, maxLevel: 41 },
  { label: "Avalanche (NPC)", minLevel: 37, maxLevel: 37 },
  { label: "Bintain", minLevel: 41, maxLevel: 41 },
  { label: "Boris", minLevel: 45, maxLevel: 45 },
  { label: "Clifus", minLevel: 32, maxLevel: 32 },
  { label: "Doriggan", minLevel: 39, maxLevel: 39 },
  { label: "Dorin Amberfeld", minLevel: 37, maxLevel: 37 },
  { label: "Drundain", minLevel: 37, maxLevel: 37 },
  { label: "Duradum", minLevel: 38, maxLevel: 38 },
  { label: "Durfa", minLevel: 40, maxLevel: 40 },
  { label: "Elder Reevis", minLevel: 39, maxLevel: 39 },
  { label: "Flendun", minLevel: 38, maxLevel: 38 },
  { label: "Flonts", minLevel: 36, maxLevel: 36 },
  { label: "Freyja Wintershade", minLevel: 31, maxLevel: 31 },
  { label: "Frostpaw", minLevel: 37, maxLevel: 37 },
  { label: "Glungin", minLevel: 33, maxLevel: 33 },
  { label: "Heragin", minLevel: 38, maxLevel: 38 },
  { label: "Hopkins Coldheart", minLevel: 33, maxLevel: 33 },
  { label: "Horasug", minLevel: 41, maxLevel: 41 },
  { label: "Huldin", minLevel: 33, maxLevel: 33 },
  { label: "Initiate Corrith", minLevel: 35, maxLevel: 35 },
  { label: "Initiate Goridam", minLevel: 31, maxLevel: 31 },
  { label: "Initiate Halagin", minLevel: 32, maxLevel: 32 },
  { label: "Initiate Kroskain", minLevel: 33, maxLevel: 33 },
  { label: "Initiate Sircthain", minLevel: 34, maxLevel: 34 },
  { label: "Katrin", minLevel: 32, maxLevel: 32 },
  { label: "Kirvil Snowstring", minLevel: 55, maxLevel: 55 },
  { label: "Lieutenant Bythgar", minLevel: 43, maxLevel: 43 },
  { label: "Lieutenant Dagur", minLevel: 42, maxLevel: 42 },
  { label: "Lieutenant Grimur", minLevel: 42, maxLevel: 42 },
  { label: "Lieutenant Ulfur", minLevel: 42, maxLevel: 42 },
  { label: "Lorekeeper Gundlt", minLevel: 38, maxLevel: 38 },
  { label: "Lorran", minLevel: 41, maxLevel: 41 },
  { label: "Mandla Klolp", minLevel: 34, maxLevel: 34 },
  { label: "Polladun", minLevel: 36, maxLevel: 36 },
  { label: "Ronodun", minLevel: 41, maxLevel: 41 },
  { label: "Shelton Wintershade", minLevel: 31, maxLevel: 31 },
  { label: "Templar Franchus", minLevel: 40, maxLevel: 40 },
  { label: "Templar Tingar", minLevel: 39, maxLevel: 39 },
  { label: "Valdicar Shadowfrost", minLevel: 37, maxLevel: 37 },
  { label: "Warpriest Penatain", minLevel: 42, maxLevel: 46 },
  { label: "Yates the Butler", minLevel: 31, maxLevel: 31 },
];

let added = 0;
let merged = 0;
for (const mob of MOBS) {
  const id = `npc:thurgadin:${slug(mob.label)}`;
  const label = mob.label.replace(/ \([^)]*\)$/, "");

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
  addNode({ id, label, type: "npc", roles: ["mob"], minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, "zone:thurgadin", "located_in");
  added++;
}

save();
console.log(`Migration 302 complete: ${added} npc node(s) added, ${merged} existing npc(s) merged with a mob role, for zone:thurgadin`);
