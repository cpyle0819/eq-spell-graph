/**
 * Migration 161: add mob nodes for zone:west-cabilis, per the `mob` node
 * type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Same sourcing method as migration 160: eqlwiki.com's Category:West Cabilis,
 * filtered to {{Namedmobpage}}-tagged pages via the MediaWiki API technique
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md). All 26
 * candidates had a clean single numeric level and, unlike East Cabilis, none
 * carried a functional `class` (Banker/Merchant/etc) -- all included as-is.
 * "An iksar hermit" is a real level-61 raid-tier encounter (32000 HP) despite
 * its flavor description about granting faction, not a functional NPC.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:west-cabilis";

const MOBS = [
  { slug: "izarod-fristan", label: "Izarod Fristan", minLevel: 50, maxLevel: 50 },
  { slug: "crusader-axmo", label: "Crusader Axmo", minLevel: 50, maxLevel: 50 },
  { slug: "crusader-ezrogz", label: "Crusader Ezrogz", minLevel: 50, maxLevel: 50 },
  { slug: "crusader-mocdi", label: "Crusader Mocdi", minLevel: 50, maxLevel: 50 },
  { slug: "nihilist-yeegarn", label: "Nihilist Yeegarn", minLevel: 50, maxLevel: 50 },
  { slug: "nihilist-zeegarn", label: "Nihilist Zeegarn", minLevel: 50, maxLevel: 50 },
  { slug: "trooper-dagnav", label: "Trooper Dagnav", minLevel: 50, maxLevel: 50 },
  { slug: "trooper-eglo", label: "Trooper Eglo", minLevel: 50, maxLevel: 50 },
  { slug: "trooper-egrephit", label: "Trooper Egrephit", minLevel: 50, maxLevel: 50 },
  { slug: "trooper-gegren", label: "Trooper Gegren", minLevel: 50, maxLevel: 50 },
  { slug: "trooper-gryfkyz", label: "Trooper Gryfkyz", minLevel: 50, maxLevel: 50 },
  { slug: "trooper-hylpik", label: "Trooper Hylpik", minLevel: 50, maxLevel: 50 },
  { slug: "trooper-moggoz", label: "Trooper Moggoz", minLevel: 50, maxLevel: 50 },
  { slug: "trooper-ogmire", label: "Trooper Ogmire", minLevel: 50, maxLevel: 50 },
  { slug: "trooper-ozlot", label: "Trooper Ozlot", minLevel: 50, maxLevel: 50 },
  { slug: "trooper-ryzee", label: "Trooper Ryzee", minLevel: 50, maxLevel: 50 },
  { slug: "trooper-shyzin", label: "Trooper Shyzin", minLevel: 50, maxLevel: 50 },
  { slug: "trooper-tygar", label: "Trooper Tygar", minLevel: 50, maxLevel: 50 },
  { slug: "trooper-xaxxot", label: "Trooper Xaxxot", minLevel: 50, maxLevel: 50 },
  { slug: "trooper-yegmesh", label: "Trooper Yegmesh", minLevel: 50, maxLevel: 50 },
  { slug: "iksar-hermit", label: "An Iksar Hermit", minLevel: 61, maxLevel: 61 },
  { slug: "harbinger-glosk", label: "Harbinger Glosk", minLevel: 61, maxLevel: 61 },
  { slug: "master-kyvix", label: "Master Kyvix", minLevel: 61, maxLevel: 61 },
  { slug: "master-rixiz", label: "Master Rixiz", minLevel: 61, maxLevel: 61 },
  { slug: "master-xydoz", label: "Master Xydoz", minLevel: 61, maxLevel: 61 },
  { slug: "sartar-the-unrivaled", label: "Sartar the Unrivaled", minLevel: 61, maxLevel: 61 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:west-cabilis:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 161 complete: ${added} mob node(s) added for West Cabilis`);
