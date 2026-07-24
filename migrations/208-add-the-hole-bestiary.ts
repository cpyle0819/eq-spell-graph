/**
 * Migration 208: add mob nodes for zone:the-hole, per the `mob` node type
 * from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Sourced via the MediaWiki API technique
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md), with
 * per-mob levels read directly from each candidate's own `{{Namedmobpage}}`
 * wikitext (batch `prop=revisions` fetch). `Category:The Hole` narrowed to
 * 44 `{{Namedmobpage}}`-tagged candidates, all with a clean numeric level
 * or range and a `zone` field naming only The Hole. "A ratman guard" was
 * kept despite the "guard" name -- its own page carries full AC/HP/damage
 * stats (517 AC, 13750 HP) and reads as a dungeon boss ("significantly
 * more difficult than the surrounding A Ratman Warrior... don't pull this
 * mob without a well rounded group or trio"), the same "Namedmobpage +
 * real stats = mob" rule as Runnyeye Citadel's kept "A goblin banker".
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:the-hole";

const MOBS = [
  { slug: "the-ghost-of-kindle", label: "The Ghost of Kindle", minLevel: 52, maxLevel: 52 },
  { slug: "high-scale-kirn", label: "High Scale Kirn", minLevel: 53, maxLevel: 53 },
  { slug: "commander-yarik", label: "Commander Yarik", minLevel: 53, maxLevel: 53 },
  { slug: "kejar-the-mighty", label: "Kejar the Mighty", minLevel: 41, maxLevel: 42 },
  { slug: "polzin-mrid", label: "Polzin Mrid", minLevel: 55, maxLevel: 55 },
  { slug: "slizik-the-mighty", label: "Slizik the Mighty", minLevel: 54, maxLevel: 54 },
  { slug: "caradon", label: "Caradon", minLevel: 55, maxLevel: 55 },
  { slug: "keeper-of-the-tombs", label: "Keeper of the Tombs", minLevel: 55, maxLevel: 55 },
  { slug: "ghost-of-glohnor", label: "Ghost of Glohnor", minLevel: 49, maxLevel: 50 },
  { slug: "ulrik-the-devout", label: "Ulrik the Devout", minLevel: 51, maxLevel: 51 },
  { slug: "jaeil-the-wretched", label: "Jaeil the Wretched", minLevel: 55, maxLevel: 55 },
  { slug: "stonesoul-the-unmoving", label: "Stonesoul the Unmoving", minLevel: 44, maxLevel: 46 },
  { slug: "master-yael", label: "Master Yael", minLevel: 56, maxLevel: 56 },
  { slug: "niltoth-the-unholy", label: "Niltoth the Unholy", minLevel: 51, maxLevel: 51 },
  { slug: "stonegrinder-minion", label: "Stonegrinder Minion", minLevel: 49, maxLevel: 49 },
  { slug: "schnozz-the-flighty", label: "Schnozz the Flighty", minLevel: 41, maxLevel: 41 },
  { slug: "rocksoul", label: "Rocksoul", minLevel: 49, maxLevel: 49 },
  { slug: "gibartik", label: "Gibartik", minLevel: 48, maxLevel: 49 },
  { slug: "bejeweled-elemental", label: "Bejeweled elemental", minLevel: 49, maxLevel: 49 },
  { slug: "dartain-the-lost", label: "Dartain the Lost", minLevel: 55, maxLevel: 56 },
  { slug: "an-elemental-warrior", label: "An Elemental Warrior", minLevel: 38, maxLevel: 42 },
  { slug: "irslak-the-wretched", label: "Irslak the Wretched", minLevel: 50, maxLevel: 50 },
  { slug: "kyrenna", label: "Kyrenna", minLevel: 55, maxLevel: 55 },
  { slug: "mummy-of-glohnor", label: "Mummy of Glohnor", minLevel: 56, maxLevel: 56 },
  { slug: "an-elemental-crusader", label: "An Elemental Crusader", minLevel: 40, maxLevel: 44 },
  { slug: "nortlav-the-scalekeeper", label: "Nortlav the Scalekeeper", minLevel: 52, maxLevel: 52 },
  { slug: "muck-covered-elemental", label: "Muck covered elemental", minLevel: 49, maxLevel: 50 },
  { slug: "a-ratman-guard", label: "A ratman guard", minLevel: 55, maxLevel: 55 },
  { slug: "a-rock-golem", label: "A rock golem", minLevel: 48, maxLevel: 54 },
  { slug: "a-flighty-fiend", label: "A flighty fiend", minLevel: 42, maxLevel: 44 },
  { slug: "initiate-sirlis", label: "Initiate Sirlis", minLevel: 55, maxLevel: 55 },
  { slug: "an-elemental-deceiver", label: "An elemental deceiver", minLevel: 39, maxLevel: 44 },
  { slug: "a-mimic", label: "A mimic", minLevel: 43, maxLevel: 47 },
  { slug: "a-ratman-warrior", label: "A Ratman Warrior", minLevel: 45, maxLevel: 50 },
  { slug: "jaeil-the-insane", label: "Jaeil the Insane", minLevel: 55, maxLevel: 55 },
  { slug: "an-elemental-channeler", label: "An elemental channeler", minLevel: 40, maxLevel: 44 },
  { slug: "an-elemental-wizard", label: "An elemental wizard", minLevel: 43, maxLevel: 46 },
  { slug: "an-elemental-visier", label: "An elemental visier", minLevel: 38, maxLevel: 45 },
  { slug: "an-elemental-capturer", label: "An elemental capturer", minLevel: 43, maxLevel: 47 },
  { slug: "an-elemental-harvester", label: "An elemental harvester", minLevel: 43, maxLevel: 47 },
  { slug: "a-fallen-erudite", label: "A fallen erudite", minLevel: 43, maxLevel: 47 },
  { slug: "a-revenant", label: "A revenant", minLevel: 49, maxLevel: 54 },
  { slug: "a-wanderer", label: "A wanderer", minLevel: 51, maxLevel: 54 },
  { slug: "the-stone-caller", label: "The Stone Caller", minLevel: 50, maxLevel: 50 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:the-hole:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 208 complete: ${added} mob node(s) added for The Hole`);
