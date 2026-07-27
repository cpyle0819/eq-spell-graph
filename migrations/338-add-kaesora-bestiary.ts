/**
 * Migration 338: add npc nodes (roles: ["mob"]) for zone:kaesora, per the
 * unified `npc`/`roles` schema from migration 265
 * (decisions/npc-mob-unification-and-zone-groups.md) -- see issue #41
 * (data-quality audit flagged this zone as having only 1 NPC total and 0
 * mobs).
 *
 * `Category:Kaesora` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 25
 * distinct `{{Namedmobpage}}` candidates, every one confirmed by its own
 * `zone` field as belonging here. "Skeletal Guardian"'s level field is a
 * combined cross-zone string ("34 / KC: 41 - 46 ?") -- the `34` segment is
 * this zone's, the `KC:` segment is Karnor's Castle's own (already sourced
 * separately in migration 319).
 *
 * "Tortured librarian" already exists (roles: ["quest_giver"], the audit's
 * lone pre-existing NPC) -- its own page carries a full combat stat block
 * (level 35, Brood of Kotiz -30 faction hit), so this adds a `mob` role and
 * level to the existing node rather than a second one.
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:kaesora";

const MOBS: { label: string; minLevel: number; maxLevel: number }[] = [
  { label: "Spectral librarian", minLevel: 33, maxLevel: 35 },
  { label: "Hungered Ravener", minLevel: 35, maxLevel: 35 },
  { label: "Failed crypt raider", minLevel: 34, maxLevel: 34 },
  { label: "Reaver of Xalgoz", minLevel: 39, maxLevel: 40 },
  { label: "Warder of Xalgoz", minLevel: 34, maxLevel: 36 },
  { label: "Xalgoz", minLevel: 40, maxLevel: 40 },
  { label: "Strathbone Runelord", minLevel: 35, maxLevel: 37 },
  { label: "Frenzied Strathbone", minLevel: 36, maxLevel: 36 },
  { label: "Guardian Of Xalgoz", minLevel: 33, maxLevel: 38 },
  { label: "Spectral Guardian", minLevel: 30, maxLevel: 35 },
  { label: "Skeletal Guardian", minLevel: 34, maxLevel: 34 },
  { label: "Bristleweb Spider", minLevel: 29, maxLevel: 32 },
  { label: "Strathbone Healer", minLevel: 30, maxLevel: 30 },
  { label: "Skeletal Warder", minLevel: 29, maxLevel: 33 },
  { label: "Skeletal Minion", minLevel: 29, maxLevel: 33 },
  { label: "Minion of Xalgoz", minLevel: 31, maxLevel: 35 },
  { label: "Famished ravener", minLevel: 36, maxLevel: 36 },
  { label: "Ravener", minLevel: 33, maxLevel: 33 },
  { label: "A frenzied gnawer", minLevel: 37, maxLevel: 37 },
  { label: "Gorged ravener", minLevel: 32, maxLevel: 32 },
  { label: "Enraged ravener", minLevel: 36, maxLevel: 36 },
  { label: "Enraged spectral librarian", minLevel: 35, maxLevel: 35 },
  { label: "A Freed Soul", minLevel: 1, maxLevel: 1 },
  { label: "Briarweb spider", minLevel: 32, maxLevel: 35 },
  { label: "Strathbone spider", minLevel: 30, maxLevel: 34 },
];

let added = 0;
let merged = 0;
for (const mob of MOBS) {
  const id = `npc:kaesora:${slug(mob.label)}`;
  if (hasNode(id)) {
    merged++;
    continue;
  }
  addNode({ id, label: mob.label, type: "npc", roles: ["mob"], minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
  added++;
}

const librarianId = "npc:kaesora:tortured-librarian";
if (hasNode(librarianId)) {
  const librarian = graph.nodes.find((n: { id: string }) => n.id === librarianId);
  const roles: string[] = librarian.roles || [];
  if (!roles.includes("mob")) roles.push("mob");
  librarian.roles = roles;
  librarian.minLevel = 35;
  librarian.maxLevel = 35;
  merged++;
}

save();
console.log(`Migration 338 complete: ${added} npc node(s) added, ${merged} existing npc(s) merged/already present, for zone:kaesora`);
