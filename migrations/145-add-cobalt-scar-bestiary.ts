/**
 * Migration 145: add mob nodes for zone:cobalt-scar, per the `mob` node
 * type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * eqlwiki.com's Cobalt Scar page itself has no per-creature level table --
 * only a "Types of Monsters" prose list and a "Notable NPCs" list, neither
 * with levels. Sourced instead from every individual creature page under
 * eqlwiki.com's Category:Cobalt Scar that carries the wiki's own
 * {{Namedmobpage}} combat-stats template (its `level` field is the
 * authoritative source here), which is how the wiki distinguishes a real
 * creature from a {{MerchantPage}} vendor -- no vendors or non-combat NPCs
 * turned up in this zone's category.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:cobalt-scar";

const MOBS = [
  { slug: "bulthar", label: "A Bulthar", minLevel: 44, maxLevel: 47 },
  { slug: "bulthar-herdleader", label: "A Bulthar Herdleader", minLevel: 52, maxLevel: 52 },
  { slug: "cobalt-drake", label: "A Cobalt Drake", minLevel: 38, maxLevel: 42 },
  { slug: "coldwater-barracuda", label: "A Coldwater Barracuda", minLevel: 21, maxLevel: 25 },
  { slug: "haunted-seachest", label: "A Haunted Seachest", minLevel: 40, maxLevel: 40 },
  { slug: "shellfish-collector", label: "A Shellfish Collector", minLevel: 34, maxLevel: 34 },
  { slug: "siren-enchantress", label: "A Siren Enchantress", minLevel: 45, maxLevel: 45 },
  { slug: "siren-enticer", label: "A Siren Enticer", minLevel: 37, maxLevel: 37 },
  { slug: "siren-seductress", label: "A Siren Seductress", minLevel: 38, maxLevel: 38 },
  { slug: "wyvern", label: "A Wyvern", minLevel: 38, maxLevel: 42 },
  { slug: "othmir-pup", label: "An Othmir Pup", minLevel: 30, maxLevel: 30 },
  { slug: "othmir-shaman", label: "An Othmir Shaman", minLevel: 42, maxLevel: 46 },
  { slug: "othmir-warrior", label: "An Othmir Warrior", minLevel: 42, maxLevel: 46 },
  { slug: "outcast-siren", label: "An Outcast Siren", minLevel: 47, maxLevel: 47 },
  { slug: "azureake", label: "Azureake", minLevel: 50, maxLevel: 50 },
  { slug: "bungre-crawcrusher", label: "Bungre Crawcrusher", minLevel: 45, maxLevel: 45 },
  { slug: "chief-kalan", label: "Chief Kalan", minLevel: 56, maxLevel: 56 },
  { slug: "kelorek-dar", label: "Kelorek`Dar", minLevel: 65, maxLevel: 65 },
  { slug: "qarrgy-scallopgobbler", label: "Qarrgy Scallopgobbler", minLevel: 47, maxLevel: 47 },
  { slug: "yvolcarn", label: "Yvolcarn", minLevel: 52, maxLevel: 52 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:cobalt-scar:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 145 complete: ${added} mob node(s) added for Cobalt Scar`);
