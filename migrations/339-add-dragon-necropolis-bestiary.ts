/**
 * Migration 339: add npc nodes (roles: ["mob"]) for zone:dragon-necropolis,
 * per the unified `npc`/`roles` schema from migration 265
 * (decisions/npc-mob-unification-and-zone-groups.md) -- see issue #41
 * (data-quality audit flagged this zone as having zero NPCs of any kind).
 *
 * `Category:Dragon Necropolis` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 47
 * `{{Namedmobpage}}` candidates, all confirmed by their own `zone` field.
 * "Ghostly Presence" excluded: its `level` field is a bare `?` with no
 * numeric endpoint anywhere (unlike a hedged-but-numeric range), the same
 * "no lower bound at all means excluded" precedent as prior zones' "An Evil
 * Eye Pet" call.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:dragon-necropolis";

const MOBS: { label: string; minLevel: number; maxLevel: number }[] = [
  { label: "A Carrion Bat", minLevel: 50, maxLevel: 55 },
  { label: "A Chelaki", minLevel: 53, maxLevel: 53 },
  { label: "A Chetari adolescent", minLevel: 46, maxLevel: 46 },
  { label: "A Chetari darkling", minLevel: 55, maxLevel: 55 },
  { label: "A Chetari Deathbinder", minLevel: 48, maxLevel: 50 },
  { label: "A Chetari Deathshaper", minLevel: 57, maxLevel: 57 },
  { label: "A Chetari Dominator", minLevel: 55, maxLevel: 56 },
  { label: "A Chetari dustshaper", minLevel: 57, maxLevel: 57 },
  { label: "A Chetari Guard", minLevel: 49, maxLevel: 58 },
  { label: "A Chetari Hoarder", minLevel: 60, maxLevel: 62 },
  { label: "A Chetari Hunter", minLevel: 49, maxLevel: 49 },
  { label: "A Chetari Master", minLevel: 55, maxLevel: 56 },
  { label: "A Chetari neophyte", minLevel: 49, maxLevel: 52 },
  { label: "A Chetari Packrat", minLevel: 62, maxLevel: 62 },
  { label: "A Chetari runemage", minLevel: 50, maxLevel: 50 },
  { label: "A Chetari Scavenger", minLevel: 47, maxLevel: 47 },
  { label: "A Chetari seeker", minLevel: 56, maxLevel: 59 },
  { label: "A Chetari Servant", minLevel: 47, maxLevel: 47 },
  { label: "A Chetari Warrior", minLevel: 58, maxLevel: 58 },
  { label: "A Chetari Worker", minLevel: 49, maxLevel: 49 },
  { label: "A Dragon Construct", minLevel: 56, maxLevel: 56 },
  { label: "A lava keeper", minLevel: 55, maxLevel: 55 },
  { label: "A Paebala Rebel", minLevel: 55, maxLevel: 56 },
  { label: "A Paebala Spirit Talker", minLevel: 54, maxLevel: 58 },
  { label: "A Paebala Warrior", minLevel: 47, maxLevel: 47 },
  { label: "A phase spider", minLevel: 47, maxLevel: 51 },
  { label: "A swarming beetle", minLevel: 49, maxLevel: 49 },
  { label: "A voracious hatchling", minLevel: 45, maxLevel: 49 },
  { label: "An Amorphous Mass", minLevel: 48, maxLevel: 48 },
  { label: "An Entropy Serpent", minLevel: 54, maxLevel: 56 },
  { label: "An escaped worker", minLevel: 47, maxLevel: 47 },
  { label: "Chetari Courier", minLevel: 48, maxLevel: 48 },
  { label: "Dominator Yisaki", minLevel: 60, maxLevel: 60 },
  { label: "Dralliw`tar", minLevel: 59, maxLevel: 59 },
  { label: "Dustbinder Grakina", minLevel: 60, maxLevel: 60 },
  { label: "Garzicor's Corpse", minLevel: 55, maxLevel: 55 },
  { label: "Garzicor's Wraith", minLevel: 60, maxLevel: 60 },
  { label: "Jaled Dar`s Shade", minLevel: 70, maxLevel: 70 },
  { label: "Neb", minLevel: 66, maxLevel: 66 },
  { label: "Pierre", minLevel: 60, maxLevel: 60 },
  { label: "Queen Raltaas", minLevel: 66, maxLevel: 66 },
  { label: "Seeker Bulava", minLevel: 60, maxLevel: 60 },
  { label: "Vaniki", minLevel: 66, maxLevel: 66 },
  { label: "Vilefang", minLevel: 60, maxLevel: 60 },
  { label: "Warmaster Utvara", minLevel: 60, maxLevel: 60 },
  { label: "Zlandicar", minLevel: 70, maxLevel: 70 },
];

let added = 0;
let merged = 0;
for (const mob of MOBS) {
  const id = `npc:dragon-necropolis:${slug(mob.label)}`;
  if (hasNode(id)) {
    merged++;
    continue;
  }
  addNode({ id, label: mob.label, type: "npc", roles: ["mob"], minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
  added++;
}

save();
console.log(`Migration 339 complete: ${added} npc node(s) added, ${merged} already present, for zone:dragon-necropolis`);
