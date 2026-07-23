/**
 * Migration 147: add mob nodes for zone:kurns-tower, per the `mob` node
 * type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Same sourcing method as migration 145/146: each entry is sourced from
 * that creature's own page under Category:Kurn's Tower carrying the
 * {{Namedmobpage}} template, using its `level` field. "Burynai Forage" and
 * "Burynai Forager" are the same creature under two page titles (identical
 * `name`/`level`/`zone` fields) -- folded into one entry.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:kurns-tower";

const MOBS = [
  { slug: "skeletal-cook", label: "A Skeletal Cook", minLevel: 14, maxLevel: 14 },
  { slug: "odd-mole", label: "An Odd Mole", minLevel: 20, maxLevel: 20 },
  { slug: "undead-jester", label: "An Undead Jester", minLevel: 14, maxLevel: 14 },
  { slug: "bargynn", label: "Bargynn", minLevel: 20, maxLevel: 20 },
  { slug: "burynai-burrower", label: "A Burynai Burrower", minLevel: 10, maxLevel: 12 },
  { slug: "burynai-excavator", label: "A Burynai Excavator", minLevel: 12, maxLevel: 16 },
  { slug: "burynai-forager", label: "Burynai Forager", minLevel: 18, maxLevel: 20 },
  { slug: "burynai-sapper", label: "A Burynai Sapper", minLevel: 16, maxLevel: 18 },
  { slug: "diggory", label: "Diggory", minLevel: 22, maxLevel: 22 },
  { slug: "fingered-skeleton", label: "Fingered Skeleton", minLevel: 11, maxLevel: 11 },
  { slug: "greater-scalebone", label: "Greater Scalebone", minLevel: 14, maxLevel: 15 },
  { slug: "greater-skeleton", label: "Greater Skeleton", minLevel: 11, maxLevel: 13 },
  { slug: "lesser-charbone-skeleton", label: "A Lesser Charbone Skeleton", minLevel: 17, maxLevel: 19 },
  { slug: "lesser-icebone-skeleton", label: "Lesser Icebone Skeleton", minLevel: 17, maxLevel: 18 },
  { slug: "scalebone-skeleton", label: "Scalebone Skeleton", minLevel: 9, maxLevel: 9 },
  { slug: "thick-boned-skeleton", label: "Thick Boned Skeleton", minLevel: 15, maxLevel: 15 },
  { slug: "undead-crusader", label: "Undead Crusader", minLevel: 16, maxLevel: 16 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:kurns-tower:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 147 complete: ${added} mob node(s) added for Kurn's Tower`);
