/**
 * Migration 188: add mob nodes for zone:solusek-s-eye, per the `mob` node
 * type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Sourced via the MediaWiki API technique
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md), with
 * per-mob levels read directly from each candidate's own `{{Namedmobpage}}`
 * wikitext (batch `prop=revisions` fetch, same approach as migration 186)
 * rather than one `WebFetch` per page: `Category:Solusek's Eye`'s 116 pages
 * narrowed to 52 `{{Namedmobpage}}`-tagged candidates, all with a clean
 * Solusek's Eye `zone` field and a single numeric level or range -- no
 * multi-zone or ambiguous entries this time. "Marfen Binkdirple" (a
 * merchant, map legend #7) and "Goblin Merchant" (#14) are named on the
 * zone's own map but aren't `{{Namedmobpage}}`-tagged and don't appear in
 * this list, consistent with the wiki using a separate vendor template for
 * them. The map's "Fire Goblin Drunkard" (#16) is a redirect to this list's
 * "Goblin Drunkard" -- same mob, not a separate entry.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:solusek-s-eye";

const MOBS = [
  { slug: "cwg-model-ca", label: "CWG Model CA", minLevel: 28, maxLevel: 28 },
  { slug: "cwg-model-cb", label: "CWG Model CB", minLevel: 28, maxLevel: 28 },
  { slug: "cwg-model-cc", label: "CWG Model CC", minLevel: 29, maxLevel: 29 },
  { slug: "cwg-model-cx", label: "CWG Model CX", minLevel: 31, maxLevel: 31 },
  { slug: "cwg-model-exg", label: "CWG Model EXG", minLevel: 30, maxLevel: 30 },
  { slug: "cwg-model-ma", label: "CWG Model MA", minLevel: 30, maxLevel: 30 },
  { slug: "cwg-model-mb", label: "CWG Model MB", minLevel: 30, maxLevel: 30 },
  { slug: "cwg-model-mc", label: "CWG Model MC", minLevel: 31, maxLevel: 31 },
  { slug: "cwg-model-xa", label: "CWG Model XA", minLevel: 33, maxLevel: 33 },
  { slug: "cwg-model-xb", label: "CWG Model XB", minLevel: 32, maxLevel: 32 },
  { slug: "cwg-model-xc", label: "CWG Model XC", minLevel: 34, maxLevel: 34 },
  { slug: "cwg-model-sx", label: "CWG Model SX", minLevel: 31, maxLevel: 31 },
  { slug: "cinder-goblin", label: "Cinder Goblin", minLevel: 19, maxLevel: 20 },
  { slug: "blazing-elemental", label: "Blazing Elemental", minLevel: 25, maxLevel: 25 },
  { slug: "fire-goblin-bartender", label: "Fire Goblin Bartender", minLevel: 25, maxLevel: 25 },
  { slug: "fire-goblin", label: "Fire Goblin", minLevel: 25, maxLevel: 26 },
  { slug: "captain-bipnubble", label: "Captain Bipnubble", minLevel: 40, maxLevel: 40 },
  { slug: "fire-goblin-shaman", label: "Fire goblin shaman", minLevel: 24, maxLevel: 24 },
  { slug: "cinder-goblin-wizard", label: "Cinder goblin wizard", minLevel: 22, maxLevel: 22 },
  { slug: "cinder-goblin-shaman", label: "Cinder goblin shaman", minLevel: 21, maxLevel: 21 },
  { slug: "gabbie-mardoddle", label: "Gabbie Mardoddle", minLevel: 32, maxLevel: 32 },
  { slug: "gnomish-conjurer", label: "Gnomish Conjurer", minLevel: 29, maxLevel: 29 },
  { slug: "gnomish-curator", label: "Gnomish Curator", minLevel: 32, maxLevel: 32 },
  { slug: "gnomish-miner", label: "Gnomish Miner", minLevel: 29, maxLevel: 29 },
  { slug: "flame-goblin-foreman", label: "Flame Goblin Foreman", minLevel: 24, maxLevel: 24 },
  { slug: "lava-elemental", label: "Lava elemental", minLevel: 35, maxLevel: 35 },
  { slug: "inferno-goblin-wizard", label: "Inferno goblin wizard", minLevel: 27, maxLevel: 28 },
  { slug: "kindle", label: "Kindle", minLevel: 26, maxLevel: 26 },
  { slug: "goblin-high-shaman", label: "Goblin High Shaman", minLevel: 29, maxLevel: 29 },
  { slug: "inferno-goblin", label: "Inferno Goblin", minLevel: 27, maxLevel: 28 },
  { slug: "flame-goblin", label: "Flame Goblin", minLevel: 22, maxLevel: 22 },
  { slug: "inferno-goblin-captain", label: "Inferno Goblin Captain", minLevel: 29, maxLevel: 29 },
  { slug: "goblin-drunkard", label: "Goblin Drunkard", minLevel: 26, maxLevel: 26 },
  { slug: "kobold-predator", label: "Kobold predator", minLevel: 25, maxLevel: 25 },
  { slug: "inferno-goblin-torturer", label: "Inferno Goblin Torturer", minLevel: 27, maxLevel: 28 },
  { slug: "inferno-goblin-shaman", label: "Inferno goblin shaman", minLevel: 28, maxLevel: 28 },
  { slug: "flame-goblin-shaman", label: "Flame goblin shaman", minLevel: 22, maxLevel: 22 },
  { slug: "flame-goblin-wizard", label: "Flame goblin wizard", minLevel: 24, maxLevel: 24 },
  { slug: "large-fire-goblin", label: "Large fire goblin", minLevel: 26, maxLevel: 26 },
  { slug: "fire-goblin-wizard", label: "Fire goblin wizard", minLevel: 24, maxLevel: 26 },
  { slug: "singe", label: "Singe", minLevel: 28, maxLevel: 28 },
  { slug: "lynada-the-exiled", label: "Lynada the Exiled", minLevel: 29, maxLevel: 29 },
  { slug: "solusek-goblin-king", label: "Solusek Goblin King", minLevel: 30, maxLevel: 30 },
  { slug: "young-goblin", label: "Young Goblin", minLevel: 20, maxLevel: 20 },
  { slug: "solusek-mage", label: "Solusek Mage", minLevel: 30, maxLevel: 30 },
  { slug: "solusek-champion", label: "Solusek Champion", minLevel: 28, maxLevel: 30 },
  { slug: "solusek-priest", label: "Solusek Priest", minLevel: 28, maxLevel: 29 },
  { slug: "solusek-goblin", label: "Solusek Goblin", minLevel: 29, maxLevel: 30 },
  { slug: "reckless-efreeti", label: "Reckless efreeti", minLevel: 26, maxLevel: 26 },
  { slug: "young-goblin-shaman", label: "Young goblin shaman", minLevel: 18, maxLevel: 18 },
  { slug: "young-goblin-wizard", label: "Young goblin wizard", minLevel: 19, maxLevel: 19 },
  { slug: "lord-gimblox", label: "Lord Gimblox", minLevel: 30, maxLevel: 30 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:solusek-s-eye:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 188 complete: ${added} mob node(s) added for Solusek's Eye`);
