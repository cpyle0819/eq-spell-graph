/**
 * Migration 244: add mob nodes for zone:qeynos-hills, per the `mob` node
 * type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * `Category:Qeynos Hills` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 61
 * unique `{{Namedmobpage}}` candidates. A straightforward overland zone --
 * generic wildlife (rats, wolves, bears, gnolls, skeletons) plus a farmable
 * named-NPC roster (guards, quest NPCs like Rephas/Konem Matse/Gnasher
 * Furgutt) the zone's own prose confirms are real encounters, not civic
 * flavor ("Gnasher also wanders through the zone randomly... if you hear
 * the cry 'Gnasher by BB' be sure to /con the gnoll you are attacking").
 *
 * Excluded: "A Boat" (a transportation object, not a creature, despite
 * carrying the `{{Namedmobpage}}` template) and "Rephas Pet"/"Tovax Vmar
 * Pet" (summoned pets that spawn alongside their already-listed owner, not
 * independently notable creatures).
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const MOBS = [
  { slug: "tol-nicelot", label: "Tol Nicelot", minLevel: 20, maxLevel: 20 },
  { slug: "a-skeleton", label: "A skeleton", minLevel: 4, maxLevel: 18 },
  { slug: "a-decaying-skeleton", label: "A Decaying Skeleton", minLevel: 1, maxLevel: 1 },
  { slug: "buzzlin-bornahm", label: "Buzzlin Bornahm", minLevel: 25, maxLevel: 25 },
  { slug: "gnasher-furgutt", label: "Gnasher Furgutt", minLevel: 10, maxLevel: 11 },
  { slug: "guard-cheslin", label: "Guard Cheslin", minLevel: 2, maxLevel: 5 },
  { slug: "guard-leopold", label: "Guard Leopold", minLevel: 38, maxLevel: 38 },
  { slug: "a-putrid-skeleton", label: "A Putrid Skeleton", minLevel: 5, maxLevel: 12 },
  { slug: "scruffy", label: "Scruffy", minLevel: 1, maxLevel: 2 },
  { slug: "baobob-miller", label: "Baobob Miller", minLevel: 25, maxLevel: 25 },
  { slug: "a-rabid-wolf", label: "A Rabid Wolf", minLevel: 4, maxLevel: 4 },
  { slug: "a-mangy-rat", label: "A Mangy Rat", minLevel: 1, maxLevel: 1 },
  { slug: "tovax-vmar", label: "Tovax Vmar", minLevel: 10, maxLevel: 10 },
  { slug: "neclo-rheslar", label: "Neclo Rheslar", minLevel: 16, maxLevel: 16 },
  { slug: "rephas", label: "Rephas", minLevel: 28, maxLevel: 28 },
  { slug: "guard-beris", label: "Guard Beris", minLevel: 15, maxLevel: 15 },
  { slug: "guard-sironan", label: "Guard Sironan", minLevel: 14, maxLevel: 14 },
  { slug: "guard-yalroen", label: "Guard Yalroen", minLevel: 12, maxLevel: 12 },
  { slug: "chanda-miller", label: "Chanda Miller", minLevel: 25, maxLevel: 25 },
  { slug: "guard-bixby", label: "Guard Bixby", minLevel: 22, maxLevel: 22 },
  { slug: "guard-nash", label: "Guard Nash", minLevel: 40, maxLevel: 40 },
  { slug: "guard-philbin", label: "Guard Philbin", minLevel: 25, maxLevel: 25 },
  { slug: "hadden", label: "Hadden", minLevel: 28, maxLevel: 28 },
  { slug: "hefax-tinmar", label: "Hefax Tinmar", minLevel: 20, maxLevel: 20 },
  { slug: "holly-windstalker", label: "Holly Windstalker", minLevel: 27, maxLevel: 27 },
  { slug: "a-willowisp", label: "A Willowisp", minLevel: 9, maxLevel: 11 },
  { slug: "a-gnoll-scout", label: "A Gnoll Scout", minLevel: 2, maxLevel: 4 },
  { slug: "a-gnoll-hunter", label: "A Gnoll Hunter", minLevel: 5, maxLevel: 7 },
  { slug: "a-gnoll-watcher", label: "A Gnoll Watcher", minLevel: 4, maxLevel: 4 },
  { slug: "varsoon-the-undying", label: "Varsoon the Undying", minLevel: 30, maxLevel: 30 },
  { slug: "niclaus-ressinn", label: "Niclaus Ressinn", minLevel: 33, maxLevel: 33 },
  { slug: "a-grizzly-bear", label: "A Grizzly Bear", minLevel: 9, maxLevel: 11 },
  { slug: "a-gnoll", label: "A Gnoll", minLevel: 5, maxLevel: 7 },
  { slug: "a-fire-beetle", label: "A Fire Beetle", minLevel: 2, maxLevel: 2 },
  { slug: "a-gray-wolf", label: "A Gray Wolf", minLevel: 2, maxLevel: 4 },
  { slug: "a-brown-bear", label: "A Brown Bear", minLevel: 3, maxLevel: 8 },
  { slug: "a-giant-rat", label: "A Giant Rat", minLevel: 2, maxLevel: 4 },
  { slug: "sir-edwin-motte", label: "Sir Edwin Motte", minLevel: 33, maxLevel: 33 },
  { slug: "konem-matse", label: "Konem Matse", minLevel: 28, maxLevel: 28 },
  { slug: "cros-treewind", label: "Cros Treewind", minLevel: 30, maxLevel: 30 },
  { slug: "a-bat", label: "A bat", minLevel: 1, maxLevel: 1 },
  { slug: "a-large-snake", label: "A large snake", minLevel: 3, maxLevel: 5 },
  { slug: "varsoon", label: "Varsoon", minLevel: 25, maxLevel: 25 },
  { slug: "a-large-rat", label: "A Large Rat", minLevel: 1, maxLevel: 1 },
  { slug: "a-large-bat", label: "A large bat", minLevel: 3, maxLevel: 5 },
  { slug: "a-rabid-grizzly", label: "A Rabid Grizzly", minLevel: 7, maxLevel: 10 },
  { slug: "a-dread-corpse", label: "A dread corpse", minLevel: 8, maxLevel: 10 },
  { slug: "a-gnoll-pup", label: "A gnoll pup", minLevel: 1, maxLevel: 1 },
  { slug: "a-restless-skeleton", label: "A Restless Skeleton", minLevel: 5, maxLevel: 7 },
  { slug: "a-snake", label: "A snake", minLevel: 1, maxLevel: 1 },
  { slug: "axe-broadsmith", label: "Axe Broadsmith", minLevel: 20, maxLevel: 20 },
  { slug: "barn-bloodstone", label: "Barn Bloodstone", minLevel: 20, maxLevel: 20 },
  { slug: "crumpy-irontoe", label: "Crumpy Irontoe", minLevel: 12, maxLevel: 13 },
  { slug: "erudite-traveler", label: "Erudite traveler", minLevel: 20, maxLevel: 20 },
  { slug: "guard-kellot", label: "Guard Kellot", minLevel: 20, maxLevel: 20 },
  { slug: "guard-lammel", label: "Guard Lammel", minLevel: 55, maxLevel: 55 },
  { slug: "guard-miles", label: "Guard Miles", minLevel: 38, maxLevel: 38 },
  { slug: "mogan-delfin", label: "Mogan Delfin", minLevel: 25, maxLevel: 25 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:qeynos-hills:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, "zone:qeynos-hills", "located_in");
}

save();
console.log(`Migration 244 complete: ${added} mob node(s) added to zone:qeynos-hills`);
