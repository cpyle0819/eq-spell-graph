/**
 * Migration 282: add npc nodes (roles: ["mob"]) for zone:upper-guk, per
 * the current unified `npc`/`roles` schema from migration 265
 * (decisions/npc-mob-unification-and-zone-groups.md) -- see issue #36.
 *
 * `Category:Upper Guk` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md, 3
 * `tlcontinue` pages) to 50 `{{Namedmobpage}}` candidates: the froglok
 * clan ladder from the zone's own map legend (Tuk/Gaz/Ton/Shin tiers,
 * each with warrior/shaman/knight variants), the fungus-farm roster
 * (Soldier/Breeder/Ancient/Drone/Mutant), heart spiders, crocs (Ancient/
 * Saltwater/swampwater), and named standalones (Tempus, The Froglok
 * Warden, the froglok shin lord).
 *
 * One exclusion, a real eqlwiki data duplicate rather than a
 * miscategorization: "Froglok ton shaman" and "A Froglok Ton Shaman" share
 * the same `emu_id`/`illia_id` (65001/1443), identical name/AC/HP fields --
 * two pages for the same monster from different import passes. Kept the
 * title-cased page matching every other "A Froglok `<Tier>` `<Role>`" page
 * in this zone, dropped the duplicate.
 *
 * One near-miss the other way, confirmed as two distinct real mobs despite
 * sharing an `emu_id` (65104): "The Froglok Warden" (level 25, rogue,
 * 875 HP) and "A troll prisoner" (level 9-11, warrior, 200 HP) spawn at
 * the same points -- a placeholder relationship (the low-level troll pops
 * in the warden's spot most of the time), not a duplicate page. Both kept,
 * same "two real roles, one spawn" shape as Western Karana's placeholder
 * note in the Karana batch.
 *
 * "A froglok tsu shaman" is on this list too, the exact mob CLAUDE.md's
 * prior batches cite as *excluded* from Lower Guk's bestiary -- but that
 * exclusion was for a Lower-Guk-tagged page whose own `zone` field named
 * different zones. This Upper Guk page is a separate page entirely, with
 * `zone = [[Upper Guk]]` only -- not the same exclusion case recurring,
 * just a same-named mob with its own legitimate Upper Guk page.
 */

import { loadGraph } from "./_lib";

const GUARD_RE = /^(A |An )?Guard /;

const { graph, hasNode, slug, save } = loadGraph(import.meta.dir);

const MOBS: { label: string; minLevel: number; maxLevel: number }[] = [
  { label: "A froglok tad", minLevel: 1, maxLevel: 5 },
  { label: "A Froglok Shin Knight", minLevel: 27, maxLevel: 31 },
  { label: "An Ancient Croc", minLevel: 30, maxLevel: 30 },
  { label: "A Saltwater Croc", minLevel: 27, maxLevel: 30 },
  { label: "A Fungus Mutant", minLevel: 23, maxLevel: 23 },
  { label: "A Froglok Ton Warrior", minLevel: 21, maxLevel: 21 },
  { label: "A Froglok Ton Shaman", minLevel: 19, maxLevel: 19 },
  { label: "A Froglok Ton Knight", minLevel: 23, maxLevel: 25 },
  { label: "A Froglok Tuk Knight", minLevel: 15, maxLevel: 15 },
  { label: "A Froglok Tuk Shaman", minLevel: 13, maxLevel: 13 },
  { label: "A Froglok Tuk Warrior", minLevel: 11, maxLevel: 13 },
  { label: "A Froglok Sentinel", minLevel: 8, maxLevel: 8 },
  { label: "A Froglok Guard", minLevel: 4, maxLevel: 12 },
  { label: "A Froglok Novice", minLevel: 9, maxLevel: 9 },
  { label: "A Froglok Neophyte", minLevel: 10, maxLevel: 10 },
  { label: "A Froglok Sentry", minLevel: 6, maxLevel: 6 },
  { label: "A Froglok Shin Shaman", minLevel: 19, maxLevel: 19 },
  { label: "The froglok shin lord", minLevel: 30, maxLevel: 30 },
  { label: "A Froglok Gaz Knight", minLevel: 18, maxLevel: 18 },
  { label: "A Froglok Gaz Shaman", minLevel: 16, maxLevel: 16 },
  { label: "A Skeletal Monk", minLevel: 23, maxLevel: 25 },
  { label: "A Froglok Gaz Warrior", minLevel: 15, maxLevel: 17 },
  { label: "A Froglok Apprentice", minLevel: 6, maxLevel: 6 },
  { label: "A Froglok Scryer", minLevel: 21, maxLevel: 21 },
  { label: "A Froglok Gaz Squire", minLevel: 17, maxLevel: 17 },
  { label: "A Giant Heart Spider", minLevel: 15, maxLevel: 21 },
  { label: "A Froglok Tal Shaman", minLevel: 33, maxLevel: 34 },
  { label: "The Froglok Warden", minLevel: 25, maxLevel: 25 },
  { label: "A Froglok Summoner", minLevel: 28, maxLevel: 28 },
  { label: "A Froglok Shinta Warrior", minLevel: 26, maxLevel: 26 },
  { label: "A Fungus Drone", minLevel: 21, maxLevel: 24 },
  { label: "A Froglok Tonta Knight", minLevel: 28, maxLevel: 28 },
  { label: "A Froglok Realist", minLevel: 22, maxLevel: 22 },
  { label: "A Froglok Necromancer", minLevel: 10, maxLevel: 10 },
  { label: "A Fungus Breeder", minLevel: 22, maxLevel: 22 },
  { label: "A Froglok Priest", minLevel: 24, maxLevel: 24 },
  { label: "A Froglok Nokta Shaman", minLevel: 27, maxLevel: 27 },
  { label: "A Fungus Soldier", minLevel: 18, maxLevel: 24 },
  { label: "A Froglok Idealist", minLevel: 20, maxLevel: 20 },
  { label: "A Fungus Ancient", minLevel: 25, maxLevel: 26 },
  { label: "Tempus", minLevel: 25, maxLevel: 26 },
  { label: "A large heart spider", minLevel: 17, maxLevel: 21 },
  { label: "A heart spider", minLevel: 11, maxLevel: 16 },
  { label: "A swampwater crocodile", minLevel: 8, maxLevel: 15 },
  { label: "A froglok witch doctor", minLevel: 11, maxLevel: 11 },
  { label: "A froglok vis shaman", minLevel: 24, maxLevel: 24 },
  { label: "A froglok tsu shaman", minLevel: 27, maxLevel: 31 },
  { label: "A skeleton monk", minLevel: 28, maxLevel: 28 },
  { label: "A troll prisoner", minLevel: 9, maxLevel: 11 },
];

let added = 0;
let merged = 0;
for (const mob of MOBS) {
  const id = `npc:upper-guk:${slug(mob.label)}`;
  const role = GUARD_RE.test(mob.label) ? "guard" : "mob";

  if (hasNode(id)) {
    const node = graph.nodes.find((n: { data: { id: string } }) => n.data.id === id);
    const roles: string[] = node.data.roles || [];
    if (!roles.includes(role)) roles.push(role);
    node.data.roles = roles;
    node.data.minLevel = mob.minLevel;
    node.data.maxLevel = mob.maxLevel;
    merged++;
  } else {
    graph.nodes.push({
      data: { id, label: mob.label, type: "npc", roles: [role], minLevel: mob.minLevel, maxLevel: mob.maxLevel },
    });
    graph.edges.push({
      data: { id: `e-located_in-${graph.edges.length + 1}`, source: id, target: "zone:upper-guk", type: "located_in" },
    });
    added++;
  }
}

save();
console.log(`Migration 282 complete: ${added} npc node(s) added, ${merged} existing npc(s) merged with a mob role, for zone:upper-guk`);
