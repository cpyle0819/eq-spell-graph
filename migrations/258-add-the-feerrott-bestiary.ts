/**
 * Migration 258: add mob nodes for zone:the-feerrott, per the `mob` node
 * type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * `Category:The Feerrott` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 37
 * unique `{{Namedmobpage}}` candidates: the zone's lizard man camps (a full
 * broodling/hatchling/scout/forager/watcher/mystic roster, three near-
 * identical "lizard man mystic" spellings each a distinct mob per the
 * page's own note), the Clurg-faction ogre "Bouncer" foursome (Flerb/Fug/
 * Hurd/Prud), wildlife (marsh bears, jungle spiders, snakes, bats, a
 * gorilla), Ogguk Residents' Duga/Grak, and several standalone named NPCs
 * (Roror the zone's own high priest of Cazic-Thule, Cyndreela, Oknoggin
 * Stonesmacker, Drizda Tunesinger, Aqaar Aluram, Annaelia Wylassi, Eleann
 * Morkul, Spanner Scrapsnatcher).
 *
 * One exclusion: "A snake" carries the zone's category tag, but its own
 * `zone` field names only Butcherblock Mountains/Qeynos Hills/Innothule
 * Swamp/North Qeynos -- no mention of The Feerrott at all -- same
 * miscategorized-candidate pattern as Lower Guk's excluded "A froglok tsu
 * shaman".
 *
 * Two cross-zone reads needed the mob's own description, not just its
 * `level` string, to pick the right segment: "a lizard man mystic" lists
 * `level = 9-11 / 3-11` for `zone = Rathe Mountains / The Feerrott`, and its
 * own description spells out "In The Feerrott, there is a low level version
 * of this monster" -- so this zone uses 3-11, not the first (Rathe-only)
 * segment. "A Spectre" lists Feerrott among four zones with one combined
 * `33-37` (no per-zone breakout), but its own page has a dedicated "The
 * Feerrott" subsection ("In the maze of tunnels near the portal to Plane of
 * Fear") confirming it's a real fight here -- also directly corroborated by
 * the zone's own map legend (item 9).
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const MOBS = [
  { slug: "a-skeleton", label: "A skeleton", minLevel: 4, maxLevel: 18 },
  { slug: "roror", label: "Roror", minLevel: 49, maxLevel: 49 },
  { slug: "a-decaying-skeleton", label: "A Decaying Skeleton", minLevel: 1, maxLevel: 10 },
  { slug: "a-froglok-tad", label: "A froglok tad", minLevel: 1, maxLevel: 5 },
  { slug: "bouncer-flerb", label: "Bouncer Flerb", minLevel: 37, maxLevel: 37 },
  { slug: "bouncer-fug", label: "Bouncer Fug", minLevel: 50, maxLevel: 50 },
  { slug: "bouncer-hurd", label: "Bouncer Hurd", minLevel: 37, maxLevel: 37 },
  { slug: "bouncer-prud", label: "Bouncer Prud", minLevel: 50, maxLevel: 50 },
  { slug: "drizda-tunesinger", label: "Drizda Tunesinger", minLevel: 25, maxLevel: 25 },
  { slug: "cyndreela", label: "Cyndreela", minLevel: 40, maxLevel: 40 },
  { slug: "a-marsh-bear", label: "A Marsh Bear", minLevel: 11, maxLevel: 11 },
  { slug: "aqaar-aluram", label: "Aqaar Aluram", minLevel: 25, maxLevel: 25 },
  { slug: "a-drowned-caravan-guard", label: "A drowned caravan guard", minLevel: 11, maxLevel: 11 },
  { slug: "a-giant-bat", label: "A giant bat", minLevel: 5, maxLevel: 7 },
  { slug: "a-bat", label: "A bat", minLevel: 1, maxLevel: 1 },
  { slug: "oknoggin-stonesmacker", label: "Oknoggin Stonesmacker", minLevel: 55, maxLevel: 55 },
  { slug: "a-lizardman-scout", label: "A lizardman scout", minLevel: 3, maxLevel: 3 },
  { slug: "a-marsh-bear-cub", label: "A marsh bear cub", minLevel: 3, maxLevel: 3 },
  { slug: "lizard-man-broodling", label: "Lizard man broodling", minLevel: 1, maxLevel: 1 },
  { slug: "lizardman-mystic", label: "Lizardman mystic", minLevel: 3, maxLevel: 11 },
  { slug: "a-lizardman-watcher", label: "A lizardman watcher", minLevel: 5, maxLevel: 5 },
  { slug: "a-lizardman-forager", label: "A lizardman forager", minLevel: 4, maxLevel: 4 },
  { slug: "a-hatchling", label: "A Hatchling", minLevel: 8, maxLevel: 8 },
  { slug: "a-lizard-man-scout", label: "A lizard man scout", minLevel: 3, maxLevel: 3 },
  { slug: "annaelia-wylassi", label: "Annaelia Wylassi", minLevel: 61, maxLevel: 61 },
  { slug: "eleann-morkul", label: "Eleann Morkul", minLevel: 25, maxLevel: 25 },
  { slug: "spanner-scrapsnatcher", label: "Spanner Scrapsnatcher", minLevel: 25, maxLevel: 25 },
  { slug: "a-green-snake", label: "A green snake", minLevel: 1, maxLevel: 1 },
  { slug: "duga", label: "Duga", minLevel: 5, maxLevel: 5 },
  { slug: "grak", label: "Grak", minLevel: 5, maxLevel: 5 },
  { slug: "a-gorilla", label: "A gorilla", minLevel: 19, maxLevel: 19 },
  { slug: "a-jungle-spider", label: "A jungle spider", minLevel: 3, maxLevel: 5 },
  { slug: "a-jungle-spiderling", label: "A jungle spiderling", minLevel: 1, maxLevel: 3 },
  { slug: "a-lizard-man-mystic", label: "A lizard man mystic", minLevel: 3, maxLevel: 11 },
  { slug: "a-minor-scarab", label: "A minor scarab", minLevel: 4, maxLevel: 4 },
  { slug: "a-spectre", label: "A Spectre", minLevel: 33, maxLevel: 37 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:the-feerrott:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, "zone:the-feerrott", "located_in");
}

save();
console.log(`Migration 258 complete: ${added} mob node(s) added to zone:the-feerrott`);
