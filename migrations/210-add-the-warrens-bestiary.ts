/**
 * Migration 210: add mob nodes for zone:the-warrens, per the `mob` node
 * type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Sourced via the MediaWiki API technique
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md), with
 * per-mob levels read directly from each candidate's own `{{Namedmobpage}}`
 * wikitext (batch `prop=revisions` fetch). `Category:The Warrens` narrowed
 * to 46 `{{Namedmobpage}}`-tagged candidates, all with a `zone` field
 * naming The Warrens except "A Large Rat" (`zone = Various`), which is kept
 * anyway since the zone's own "Types of Monsters" prose names "Large Rat"
 * directly. "Aderius Rhenar" and "Koajin" aren't mentioned in the zone's
 * summary prose at all (both are imprisoned captives, not wandering
 * kobolds/rats), but both carry full AC/HP/damage stat blocks and a `zone`
 * field naming only The Warrens -- kept, same "stats over prose mention"
 * rule as prior batches' "guard"/"banker" edge cases.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:the-warrens";

const MOBS = [
  { slug: "the-mighty-bear-paw", label: "The Mighty Bear Paw", minLevel: 24, maxLevel: 24 },
  { slug: "cave-bat-lord", label: "Cave Bat Lord", minLevel: 22, maxLevel: 22 },
  { slug: "krode-the-diviner", label: "Krode the Diviner", minLevel: 18, maxLevel: 18 },
  { slug: "smithy-rrarrgin", label: "Smithy Rrarrgin", minLevel: 14, maxLevel: 14 },
  { slug: "aderius-rhenar", label: "Aderius Rhenar", minLevel: 10, maxLevel: 10 },
  { slug: "lorekeeper-roggik", label: "Lorekeeper Roggik", minLevel: 18, maxLevel: 18 },
  { slug: "a-kobold-guard", label: "A Kobold Guard", minLevel: 4, maxLevel: 6 },
  { slug: "a-large-kobold", label: "A Large Kobold", minLevel: 13, maxLevel: 13 },
  { slug: "a-rabid-kobold", label: "A Rabid Kobold", minLevel: 5, maxLevel: 7 },
  { slug: "a-fierce-kobold", label: "A Fierce Kobold", minLevel: 5, maxLevel: 7 },
  { slug: "a-kobold-protector", label: "A Kobold Protector", minLevel: 10, maxLevel: 10 },
  { slug: "foodmaster-rargnar", label: "Foodmaster Rargnar", minLevel: 13, maxLevel: 13 },
  { slug: "a-frothing-kobold", label: "A Frothing Kobold", minLevel: 15, maxLevel: 15 },
  { slug: "king-gragnar", label: "King Gragnar", minLevel: 24, maxLevel: 24 },
  { slug: "warlord-drrig", label: "Warlord Drrig", minLevel: 21, maxLevel: 21 },
  { slug: "high-shaman-drogik", label: "High Shaman Drogik", minLevel: 22, maxLevel: 23 },
  { slug: "a-kobold-pit-fighter", label: "A Kobold Pit Fighter", minLevel: 13, maxLevel: 15 },
  { slug: "a-kobold-outcast", label: "A Kobold Outcast", minLevel: 14, maxLevel: 14 },
  { slug: "a-huge-kobold", label: "A Huge Kobold", minLevel: 15, maxLevel: 15 },
  { slug: "a-kobold-archer", label: "A kobold archer", minLevel: 7, maxLevel: 7 },
  { slug: "a-kobold-sentinel", label: "A Kobold Sentinel", minLevel: 11, maxLevel: 12 },
  { slug: "a-training-kobold", label: "A Training Kobold", minLevel: 11, maxLevel: 11 },
  { slug: "a-kobold-fisherman", label: "A Kobold Fisherman", minLevel: 4, maxLevel: 4 },
  { slug: "an-elite-kobold", label: "An Elite Kobold", minLevel: 15, maxLevel: 15 },
  { slug: "a-large-rat", label: "A Large Rat", minLevel: 1, maxLevel: 1 },
  { slug: "a-kobold-warrens", label: "A kobold", minLevel: 7, maxLevel: 9 },
  { slug: "a-greater-shaman", label: "A greater shaman", minLevel: 18, maxLevel: 18 },
  { slug: "a-pack-leader", label: "A pack leader", minLevel: 16, maxLevel: 16 },
  { slug: "the-muglwump", label: "The Muglwump", minLevel: 25, maxLevel: 25 },
  { slug: "trainer-daxgrr", label: "Trainer Daxgrr", minLevel: 15, maxLevel: 15 },
  { slug: "huntmaster-furgrl", label: "Huntmaster Furgrl", minLevel: 20, maxLevel: 20 },
  { slug: "prince-bragnar", label: "Prince Bragnar", minLevel: 18, maxLevel: 18 },
  { slug: "koajin", label: "Koajin", minLevel: 15, maxLevel: 15 },
  { slug: "a-pack-elder", label: "A pack elder", minLevel: 14, maxLevel: 14 },
  { slug: "a-mischievious-batling", label: "A mischievious batling", minLevel: 15, maxLevel: 15 },
  { slug: "packmaster-dledsh", label: "Packmaster Dledsh", minLevel: 18, maxLevel: 18 },
  { slug: "jailer-mkrarrg", label: "Jailer Mkrarrg", minLevel: 15, maxLevel: 15 },
  { slug: "an-erudite-prisoner", label: "An Erudite Prisoner", minLevel: 6, maxLevel: 6 },
  { slug: "a-howler", label: "A howler", minLevel: 11, maxLevel: 11 },
  { slug: "a-giant-cave-bat", label: "A giant cave bat", minLevel: 14, maxLevel: 16 },
  { slug: "a-cave-bat", label: "A cave bat", minLevel: 15, maxLevel: 15 },
  { slug: "a-diseased-kobold", label: "A diseased kobold", minLevel: 15, maxLevel: 16 },
  { slug: "a-frenzied-rat", label: "A frenzied rat", minLevel: 8, maxLevel: 10 },
  { slug: "a-river-rat", label: "A river rat", minLevel: 3, maxLevel: 7 },
  { slug: "a-trained-rat", label: "A trained rat", minLevel: 5, maxLevel: 7 },
  { slug: "grodl-ripclaw", label: "Grodl Ripclaw", minLevel: 21, maxLevel: 22 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:the-warrens:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 210 complete: ${added} mob node(s) added for The Warrens`);
