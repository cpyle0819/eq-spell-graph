/**
 * Migration 160: add mob nodes for zone:east-cabilis, per the `mob` node
 * type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Same sourcing method as migrations 145-149, 152, 154, 156: each entry is
 * sourced from that creature's own page under eqlwiki.com's Category:East
 * Cabilis carrying the {{Namedmobpage}} combat-stats template, using its
 * `level` field (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md's
 * API technique, applied here even though the category wasn't especially
 * messy). All 60 Namedmobpage-tagged pages in the category had a clean
 * single numeric level -- no ranges or missing values to resolve.
 *
 * "Klok Margar" and "Klok Rakra" are excluded: both carry the template and a
 * level, but their own `class` field is Banker and their description reads
 * simply "Banker" -- the same functional-NPC exclusion as Oasis of Marr's
 * innkeeps/merchants (mob-node-type.md) and Innothule Swamp's Sithgok
 * (migration 154), despite passing the Namedmobpage heuristic. Others with
 * guild/rank-sounding names ("Haggle Baron Klok", "Grand Master Glox",
 * "Master Bain", etc.) were individually checked and are real combat
 * encounters (no sell/train function, have AC/HP/loot) -- included.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:east-cabilis";

const MOBS = [
  { slug: "froglok-slave", label: "A Froglok Slave", minLevel: 2, maxLevel: 2 },
  { slug: "pygmy-barracuda", label: "A Pygmy Barracuda", minLevel: 2, maxLevel: 2 },
  { slug: "iksar-outcast", label: "An Iksar Outcast", minLevel: 3, maxLevel: 3 },
  { slug: "bugrin-the-gatherer", label: "Bugrin the Gatherer", minLevel: 3, maxLevel: 3 },
  { slug: "frizazz", label: "Frizazz", minLevel: 15, maxLevel: 15 },
  { slug: "jozter", label: "Jozter", minLevel: 15, maxLevel: 15 },
  { slug: "half-elf-maiden", label: "Half Elf Maiden", minLevel: 25, maxLevel: 25 },
  { slug: "haggle-baron-klok", label: "Haggle Baron Klok", minLevel: 30, maxLevel: 30 },
  { slug: "an-iksar-crusader", label: "An Iksar Crusader", minLevel: 30, maxLevel: 30 },
  { slug: "clerk-doval", label: "Clerk Doval", minLevel: 30, maxLevel: 30 },
  { slug: "grype", label: "Grype", minLevel: 30, maxLevel: 30 },
  { slug: "the-toilmaster", label: "The Toilmaster", minLevel: 40, maxLevel: 40 },
  { slug: "bloodgill-barracuda", label: "A Bloodgill Barracuda", minLevel: 41, maxLevel: 41 },
  { slug: "crusader-cotat", label: "Crusader Cotat", minLevel: 50, maxLevel: 50 },
  { slug: "crusader-daehod", label: "Crusader Daehod", minLevel: 50, maxLevel: 50 },
  { slug: "crusader-golia", label: "Crusader Golia", minLevel: 50, maxLevel: 50 },
  { slug: "crusader-hitol", label: "Crusader Hitol", minLevel: 50, maxLevel: 50 },
  { slug: "crusader-olos", label: "Crusader Olos", minLevel: 50, maxLevel: 50 },
  { slug: "crusader-reidak", label: "Crusader Reidak", minLevel: 50, maxLevel: 50 },
  { slug: "crusader-wonku", label: "Crusader Wonku", minLevel: 50, maxLevel: 50 },
  { slug: "crusader-zixo", label: "Crusader Zixo", minLevel: 50, maxLevel: 50 },
  { slug: "himart-kichith", label: "Himart Kichith", minLevel: 50, maxLevel: 50 },
  { slug: "sarth-scarscale", label: "Sarth Scarscale", minLevel: 50, maxLevel: 50 },
  { slug: "shezlie-furscale", label: "Shezlie Furscale", minLevel: 50, maxLevel: 50 },
  { slug: "sirtha-scarscale", label: "Sirtha Scarscale", minLevel: 50, maxLevel: 50 },
  { slug: "zazlan-furscale", label: "Zazlan Furscale", minLevel: 50, maxLevel: 50 },
  { slug: "trooper-azalin", label: "Trooper Azalin", minLevel: 50, maxLevel: 50 },
  { slug: "trooper-begzei", label: "Trooper Begzei", minLevel: 50, maxLevel: 50 },
  { slug: "trooper-byzin", label: "Trooper Byzin", minLevel: 50, maxLevel: 50 },
  { slug: "trooper-feglesh", label: "Trooper Feglesh", minLevel: 50, maxLevel: 50 },
  { slug: "trooper-fryp", label: "Trooper Fryp", minLevel: 50, maxLevel: 50 },
  { slug: "trooper-googin", label: "Trooper Googin", minLevel: 50, maxLevel: 50 },
  { slug: "trooper-iggmin", label: "Trooper Iggmin", minLevel: 50, maxLevel: 50 },
  { slug: "trooper-ishlin", label: "Trooper Ishlin", minLevel: 50, maxLevel: 50 },
  { slug: "trooper-keplar", label: "Trooper Keplar", minLevel: 50, maxLevel: 50 },
  { slug: "trooper-nagraz", label: "Trooper Nagraz", minLevel: 50, maxLevel: 50 },
  { slug: "trooper-nishnish", label: "Trooper Nishnish", minLevel: 50, maxLevel: 50 },
  { slug: "trooper-rofylin", label: "Trooper Rofylin", minLevel: 50, maxLevel: 50 },
  { slug: "trooper-shestar", label: "Trooper Shestar", minLevel: 50, maxLevel: 50 },
  { slug: "trooper-zishrin", label: "Trooper Zishrin", minLevel: 50, maxLevel: 50 },
  { slug: "vessel-drozlin", label: "Vessel Drozlin", minLevel: 60, maxLevel: 60 },
  { slug: "arch-duke-xog", label: "Arch Duke Xog", minLevel: 61, maxLevel: 61 },
  { slug: "drill-master-dal", label: "Drill Master Dal", minLevel: 61, maxLevel: 61 },
  { slug: "drill-master-kyg", label: "Drill Master Kyg", minLevel: 61, maxLevel: 61 },
  { slug: "drill-master-vygan", label: "Drill Master Vygan", minLevel: 61, maxLevel: 61 },
  { slug: "grand-master-glox", label: "Grand Master Glox", minLevel: 61, maxLevel: 61 },
  { slug: "hierophant-dexl", label: "Hierophant Dexl", minLevel: 61, maxLevel: 61 },
  { slug: "hierophant-oxyn", label: "Hierophant Oxyn", minLevel: 61, maxLevel: 61 },
  { slug: "hierophant-zand", label: "Hierophant Zand", minLevel: 61, maxLevel: 61 },
  { slug: "librarian-zimor", label: "Librarian Zimor", minLevel: 61, maxLevel: 61 },
  { slug: "lord-gikzic", label: "Lord Gikzic", minLevel: 61, maxLevel: 61 },
  { slug: "lord-korzin", label: "Lord Korzin", minLevel: 61, maxLevel: 61 },
  { slug: "lord-qyzar", label: "Lord Qyzar", minLevel: 61, maxLevel: 61 },
  { slug: "master-bain", label: "Master Bain", minLevel: 61, maxLevel: 61 },
  { slug: "master-niska", label: "Master Niska", minLevel: 61, maxLevel: 61 },
  { slug: "master-raska", label: "Master Raska", minLevel: 61, maxLevel: 61 },
  { slug: "prime-hierophant-vek", label: "Prime Hierophant Vek", minLevel: 61, maxLevel: 61 },
  { slug: "war-baron-eator", label: "War Baron Eator", minLevel: 61, maxLevel: 61 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:east-cabilis:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 160 complete: ${added} mob node(s) added for East Cabilis`);
