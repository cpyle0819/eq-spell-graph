/**
 * Migration 212: add mob nodes for zone:the-estate-of-unrest, per the
 * `mob` node type from migration 060 (decisions/mob-node-type.md) -- see
 * issue #36.
 *
 * Sourced via the MediaWiki API technique
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md), with
 * per-mob levels read directly from each candidate's own `{{Namedmobpage}}`
 * wikitext (batch `prop=revisions` fetch). `Category:The Estate of Unrest`
 * narrowed to 35 `{{Namedmobpage}}`-tagged candidates, all with a `zone`
 * field naming Estate/Unrest.
 *
 * Cross-zone level strings, same "pick the segment for the target zone"
 * rule as the Najena batch's precedent:
 * - "A Greater Skeleton" (`level = 7-20 / 11-13 (Befallen / Najena)`,
 *   zone lists 8 zones including Unrest): neither slot names Unrest
 *   explicitly, so used the base 7-20 range, consistent with how migration
 *   127 read this same string for Befallen (also not one of the two named
 *   slots at the time).
 * - "A Dry Bone Skeleton" (`level = 15-19 (Rathe Mtns. Oasis) 20-22
 *   (Unrest / Lake Rathe)`): Unrest is explicitly named in the second
 *   slot, so used 20-22.
 * - "A ghoul", "A barbed bone skeleton", "A Skeletal Monk", "A large
 *   skeleton": each gives one flat range with no per-zone breakdown despite
 *   listing multiple zones -- used as-is.
 *
 * "Serra" (a scripted Bard Epic Quest trigger, race Zombie, most combat
 * stats unfilled) is kept as a mob despite the missing stat block -- it's a
 * killable creature the wiki itself tags with `{{Namedmobpage}}`, not a
 * vendor/guard/guildmaster.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:the-estate-of-unrest";

const MOBS = [
  { slug: "an-undead-barkeep", label: "An undead barkeep", minLevel: 25, maxLevel: 25 },
  { slug: "a-reanimated-hand", label: "A reanimated hand", minLevel: 21, maxLevel: 21 },
  { slug: "a-priest-of-najena", label: "A priest of najena", minLevel: 29, maxLevel: 31 },
  { slug: "an-undead-knight-of-unrest", label: "An undead knight of Unrest", minLevel: 28, maxLevel: 28 },
  { slug: "garanel-rucksif", label: "Garanel Rucksif", minLevel: 35, maxLevel: 35 },
  { slug: "torklar-battlemaster", label: "Torklar Battlemaster", minLevel: 20, maxLevel: 20 },
  { slug: "reclusive-ghoul-magus", label: "Reclusive ghoul magus", minLevel: 23, maxLevel: 23 },
  { slug: "a-ghoul", label: "A ghoul", minLevel: 13, maxLevel: 17 },
  { slug: "a-greater-skeleton", label: "A Greater Skeleton", minLevel: 7, maxLevel: 20 },
  { slug: "mortuary-fungus", label: "Mortuary Fungus", minLevel: 26, maxLevel: 28 },
  { slug: "an-undead-brewer", label: "An Undead Brewer", minLevel: 18, maxLevel: 18 },
  { slug: "khrix-fritchoff", label: "Khrix Fritchoff", minLevel: 35, maxLevel: 35 },
  { slug: "khrix-abomination", label: "Khrix Abomination", minLevel: 38, maxLevel: 40 },
  { slug: "a-werebat", label: "A werebat", minLevel: 24, maxLevel: 28 },
  { slug: "a-carrion-ghoul", label: "A carrion ghoul", minLevel: 20, maxLevel: 24 },
  { slug: "a-greater-dark-bone", label: "A Greater Dark Bone", minLevel: 26, maxLevel: 30 },
  { slug: "dark-boned-skeleton", label: "Dark Boned Skeleton", minLevel: 15, maxLevel: 19 },
  { slug: "a-lurking-mummy", label: "A Lurking Mummy", minLevel: 18, maxLevel: 20 },
  { slug: "a-dark-terror", label: "A Dark Terror", minLevel: 29, maxLevel: 33 },
  { slug: "a-barbed-bone-skeleton", label: "A barbed bone skeleton", minLevel: 24, maxLevel: 26 },
  { slug: "a-festering-hag", label: "A Festering Hag", minLevel: 28, maxLevel: 30 },
  { slug: "a-skeletal-monk", label: "A Skeletal Monk", minLevel: 23, maxLevel: 25 },
  { slug: "tormented-dead", label: "Tormented Dead", minLevel: 10, maxLevel: 14 },
  { slug: "a-dusty-werebat", label: "A Dusty Werebat", minLevel: 24, maxLevel: 28 },
  { slug: "zombie-of-an-unrest-noble", label: "Zombie of an Unrest Noble", minLevel: 24, maxLevel: 26 },
  { slug: "a-dry-bone-skeleton", label: "A Dry Bone Skeleton", minLevel: 20, maxLevel: 22 },
  { slug: "a-death-beetle", label: "A Death Beetle", minLevel: 10, maxLevel: 12 },
  { slug: "a-crazed-ghoul", label: "A crazed ghoul", minLevel: 25, maxLevel: 26 },
  { slug: "lesser-blade-fiend", label: "Lesser Blade Fiend", minLevel: 19, maxLevel: 19 },
  { slug: "a-jack-o-lantern", label: "A jack o lantern", minLevel: 12, maxLevel: 14 },
  { slug: "shadowpincer", label: "Shadowpincer", minLevel: 15, maxLevel: 17 },
  { slug: "a-gnomish-spelunker", label: "A gnomish spelunker", minLevel: 20, maxLevel: 20 },
  { slug: "a-large-skeleton", label: "A large skeleton", minLevel: 8, maxLevel: 10 },
  { slug: "a-tentacle-terror", label: "A tentacle terror", minLevel: 30, maxLevel: 30 },
  { slug: "serra", label: "Serra", minLevel: 4, maxLevel: 4 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:the-estate-of-unrest:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 212 complete: ${added} mob node(s) added for The Estate of Unrest`);
