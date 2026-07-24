/**
 * Migration 219: add mob nodes for zone:southern-felwithe, per the `mob`
 * node type from migration 060 (decisions/mob-node-type.md) -- see issue
 * #36.
 *
 * `Category:Southern Felwithe` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 12
 * `{{Namedmobpage}}`-tagged candidates, all carrying full stat blocks (real
 * AC/HP/damage) -- same "stats over name" call as Northern Felwithe's batch
 * (migration 217), which this zone shares its combined eqlwiki.com page and
 * KOS race-faction table with. "Tarker Blazetoss" and "Niola Impholder"
 * already exist as `npc:southern-felwithe:...` quest-giver nodes; both get
 * a `mob:` counterpart too, same established "can legitimately be both"
 * overlap as The Warrens' Aderius Rhenar/Koajin (migration 210).
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:southern-felwithe";

const MOBS = [
  { slug: "joren-nobleheart", label: "Joren Nobleheart", minLevel: 60, maxLevel: 60 },
  { slug: "kinool-goldsinger", label: "Kinool Goldsinger", minLevel: 61, maxLevel: 61 },
  { slug: "tarker-blazetoss", label: "Tarker Blazetoss", minLevel: 61, maxLevel: 61 },
  { slug: "niola-impholder", label: "Niola Impholder", minLevel: 61, maxLevel: 61 },
  { slug: "farios-elianos", label: "Farios Elianos", minLevel: 50, maxLevel: 50 },
  { slug: "guard-golyn", label: "Guard Golyn", minLevel: 41, maxLevel: 41 },
  { slug: "guard-mystan", label: "Guard Mystan", minLevel: 40, maxLevel: 40 },
  { slug: "guard-plage", label: "Guard Plage", minLevel: 41, maxLevel: 41 },
  { slug: "guard-psape", label: "Guard Psape", minLevel: 39, maxLevel: 39 },
  { slug: "guard-spioko", label: "Guard Spioko", minLevel: 41, maxLevel: 41 },
  { slug: "guard-tistan", label: "Guard Tistan", minLevel: 40, maxLevel: 40 },
  { slug: "guard-tynthal", label: "Guard Tynthal", minLevel: 40, maxLevel: 40 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:southern-felwithe:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 219 complete: ${added} mob node(s) added for Southern Felwithe`);
