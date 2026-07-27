/**
 * Migration 321: add npc nodes (roles: ["mob"]) for zone:old-sebilis,
 * per the unified `npc`/`roles` schema from migration 265
 * (decisions/npc-mob-unification-and-zone-groups.md) -- see issue #41
 * (data-quality audit flagged this zone as having zero NPCs at all).
 *
 * Sourced via the MediaWiki API technique
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md):
 * `Category:Old Sebilis`'s 204 pages narrowed to 69 `{{Namedmobpage}}`-
 * tagged candidates, each with a `zone` field naming only Old Sebilis (no
 * cross-zone reuse to split).
 *
 * "Skeletal champion" states "44 - 51?" -- a hedge on a real number, kept as
 * 44-51 per the standing "keep the numeric endpoints" rule. "Skeletal
 * guard" states "51 - ?" -- a fully missing endpoint (no upper bound
 * stated at all, not just hedged), excluded on the same basis as "An Evil
 * Eye Pet" (migration 173) and Kedge Keep's "A Gloomstalker Mermaid"
 * (migration 190), just mirrored to the upper side.
 *
 * "Froglok repairer (Old Sebilis)" is the wiki's own disambiguation
 * suffix (a same-named mob also exists in Swamp of No Hope) -- its actual
 * in-game name is just "Froglok repairer", used as the node label.
 *
 * "Trakanon" and "Trakanon (triggered)" are confirmed by the wiki as two
 * separate encounters, not one mob in two states: the triggered version is
 * a Bard Epic Quest spawn with its own limited loot pool, distinct from
 * the standard raid boss -- kept as separate nodes, same call as prior
 * zones' quest-triggered phase mobs.
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:old-sebilis";

const MOBS: { label: string; minLevel: number; maxLevel: number }[] = [
  { label: "Baron Yosig", minLevel: 55, maxLevel: 55 },
  { label: "Trakanon", minLevel: 65, maxLevel: 65 },
  { label: "Trakanon (Triggered)", minLevel: 65, maxLevel: 65 },
  { label: "Emperor Chottal", minLevel: 60, maxLevel: 60 },
  { label: "Sebilite protector", minLevel: 60, maxLevel: 60 },
  { label: "Blood of chottal", minLevel: 55, maxLevel: 55 },
  { label: "Hierophant Prime Grekal", minLevel: 55, maxLevel: 55 },
  { label: "Harbinger Freglor", minLevel: 55, maxLevel: 55 },
  { label: "Froglok commander", minLevel: 55, maxLevel: 55 },
  { label: "Brogg", minLevel: 55, maxLevel: 55 },
  { label: "Gruplinort", minLevel: 53, maxLevel: 53 },
  { label: "Froglok ostiary", minLevel: 50, maxLevel: 50 },
  { label: "Frenzied pox scarab", minLevel: 50, maxLevel: 50 },
  { label: "Tolapumj", minLevel: 60, maxLevel: 60 },
  { label: "Arch Duke Iatol", minLevel: 55, maxLevel: 55 },
  { label: "Froglok armorer", minLevel: 52, maxLevel: 52 },
  { label: "Gangrenous Scarab", minLevel: 52, maxLevel: 52 },
  { label: "Myconid priest", minLevel: 54, maxLevel: 54 },
  { label: "Krup Ghoul Knight", minLevel: 47, maxLevel: 47 },
  { label: "Sebilite Juggernaut", minLevel: 57, maxLevel: 57 },
  { label: "Froglok Reet Knight", minLevel: 55, maxLevel: 55 },
  { label: "Froglok Dar Knight", minLevel: 44, maxLevel: 50 },
  { label: "Froglok Reet Shaman", minLevel: 55, maxLevel: 55 },
  { label: "Froglok Reet Wizard", minLevel: 55, maxLevel: 55 },
  { label: "Froglok Krup Knight", minLevel: 49, maxLevel: 52 },
  { label: "Froglok Jin Wizard", minLevel: 45, maxLevel: 45 },
  { label: "Froglok Ilis Knight", minLevel: 53, maxLevel: 53 },
  { label: "Froglok Krup Shaman", minLevel: 50, maxLevel: 52 },
  { label: "Froglok Jin Shaman", minLevel: 41, maxLevel: 47 },
  { label: "Froglok Ilis Shaman", minLevel: 53, maxLevel: 53 },
  { label: "A Sebilite Golem", minLevel: 49, maxLevel: 51 },
  { label: "Froglok Krup Wizard", minLevel: 48, maxLevel: 51 },
  { label: "A Pox Scarab", minLevel: 47, maxLevel: 47 },
  { label: "Myconid Warrior", minLevel: 52, maxLevel: 52 },
  { label: "Myconid Reaver", minLevel: 52, maxLevel: 52 },
  { label: "Froglok Dar Wizard", minLevel: 48, maxLevel: 48 },
  { label: "Froglok Ilis Wizard", minLevel: 53, maxLevel: 53 },
  { label: "A Sepsis Scarab", minLevel: 50, maxLevel: 51 },
  { label: "Froglok Kor Shaman", minLevel: 42, maxLevel: 42 },
  { label: "Dar Ghoul Knight", minLevel: 47, maxLevel: 47 },
  { label: "A Leprous Scarab", minLevel: 47, maxLevel: 47 },
  { label: "Sebilite Guardian", minLevel: 53, maxLevel: 53 },
  { label: "Froglok Bok Shaman", minLevel: 46, maxLevel: 50 },
  { label: "Froglok Zol Knight", minLevel: 40, maxLevel: 40 },
  { label: "An Iksar Necromancer", minLevel: 50, maxLevel: 50 },
  { label: "Froglok Bok Wizard", minLevel: 47, maxLevel: 50 },
  { label: "A Necrosis Scarab", minLevel: 53, maxLevel: 53 },
  { label: "Froglok Bok Knight", minLevel: 47, maxLevel: 47 },
  { label: "Froggy", minLevel: 52, maxLevel: 52 },
  { label: "Crypt Caretaker", minLevel: 53, maxLevel: 53 },
  { label: "Froglok Bartender", minLevel: 52, maxLevel: 52 },
  { label: "Spectral Duke", minLevel: 49, maxLevel: 49 },
  { label: "Myconid Adept", minLevel: 54, maxLevel: 56 },
  { label: "Froglok Armsman", minLevel: 52, maxLevel: 52 },
  { label: "Froglok Chef", minLevel: 52, maxLevel: 52 },
  { label: "Myconid Spore King", minLevel: 56, maxLevel: 56 },
  { label: "Froglok Pickler", minLevel: 53, maxLevel: 53 },
  { label: "Imperial Crypt Guardian", minLevel: 53, maxLevel: 53 },
  { label: "Spectral harbinger", minLevel: 51, maxLevel: 54 },
  { label: "Froglok krup enchanter", minLevel: 48, maxLevel: 48 },
  { label: "Skeletal champion", minLevel: 44, maxLevel: 51 },
  { label: "Skeletal baron", minLevel: 51, maxLevel: 51 },
  { label: "Skeletal duke", minLevel: 51, maxLevel: 51 },
  { label: "Skeletal harbinger", minLevel: 51, maxLevel: 51 },
  { label: "Skeletal hierophant", minLevel: 51, maxLevel: 51 },
  { label: "Froglok ilis acolyte", minLevel: 46, maxLevel: 46 },
  { label: "Froglok repairer", minLevel: 52, maxLevel: 52 },
  { label: "Spectral revenant", minLevel: 51, maxLevel: 53 },
];

let added = 0;
let merged = 0;
for (const mob of MOBS) {
  const id = `npc:old-sebilis:${slug(mob.label)}`;

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

save();
console.log(`Migration 321 complete: ${added} npc node(s) added, ${merged} existing npc(s) merged with a mob role, for zone:old-sebilis`);
