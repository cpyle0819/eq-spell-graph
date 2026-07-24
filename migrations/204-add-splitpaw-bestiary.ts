/**
 * Migration 204: add mob nodes for zone:splitpaw, per the `mob` node type
 * from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Sourced via the MediaWiki API technique
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md), with
 * per-mob levels read directly from each candidate's own `{{Namedmobpage}}`
 * wikitext (batch `prop=revisions` fetch). `Category:Splitpaw Lair`
 * narrowed to 31 `{{Namedmobpage}}`-tagged candidates. "Brother Hayle",
 * "Brother Gruff", and "A Gnoll Prisoner" were kept despite flavor names
 * suggesting captives -- all three carry full AC/HP/damage stat blocks,
 * same "Namedmobpage + real stats = mob" rule as Runnyeye Citadel's
 * kept "A goblin banker".
 *
 * Two exclusion/inclusion edge cases:
 * - "An air elemental" excluded: its own `zone` field names only East
 *   Commonlands, and its description confirms it spawns there (southern
 *   wall, among pumas/beetles/snakes) -- unrelated to Splitpaw despite the
 *   category tag, same miscategorized-candidate pattern as Lower Guk's
 *   excluded "A froglok tsu shaman".
 * - "The Ishva Mal" kept despite its own `zone` field naming only South
 *   Karana: its description says it "seems likely to spawn at Splitpaw and
 *   then runs to the east", and Splitpaw's own zone page names it directly
 *   in the Map legend (#8) with loot matching its dedicated page exactly --
 *   the zone's own map treats it as one of Splitpaw's central bosses, which
 *   outweighs the single `zone` field on its own page.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:splitpaw";

const MOBS = [
  { slug: "the-ishva-mal", label: "The Ishva Mal", minLevel: 40, maxLevel: 40 },
  { slug: "brother-hayle", label: "Brother Hayle", minLevel: 24, maxLevel: 24 },
  { slug: "nisch-val-torash-mashk", label: "Nisch Val Torash Mashk", minLevel: 39, maxLevel: 39 },
  { slug: "brother-gruff", label: "Brother Gruff", minLevel: 16, maxLevel: 16 },
  { slug: "a-tesch-mas-gnoll", label: "A Tesch Mas Gnoll", minLevel: 25, maxLevel: 33 },
  { slug: "a-rosch-val-gnoll", label: "A Rosch Val Gnoll", minLevel: 35, maxLevel: 35 },
  { slug: "a-tesch-val-gnoll", label: "A Tesch Val Gnoll", minLevel: 34, maxLevel: 37 },
  { slug: "a-tesch-mal-gnoll", label: "A Tesch Mal Gnoll", minLevel: 31, maxLevel: 34 },
  { slug: "verishe-mal-executioner", label: "Verishe Mal Executioner", minLevel: 42, maxLevel: 42 },
  { slug: "a-gnoll-prisoner", label: "A Gnoll Prisoner", minLevel: 19, maxLevel: 21 },
  { slug: "a-rosch-mal-gnoll", label: "A Rosch Mal Gnoll", minLevel: 31, maxLevel: 31 },
  { slug: "a-lteth-mal-gnoll", label: "A Lteth Mal Gnoll", minLevel: 23, maxLevel: 23 },
  { slug: "a-lteth-val-gnoll", label: "A Lteth Val Gnoll", minLevel: 24, maxLevel: 24 },
  { slug: "a-rosch-mas-gnoll", label: "A Rosch Mas Gnoll", minLevel: 25, maxLevel: 25 },
  { slug: "a-lteth-mas-gnoll", label: "A Lteth Mas Gnoll", minLevel: 21, maxLevel: 21 },
  { slug: "verishe-mal-judge", label: "Verishe Mal Judge", minLevel: 34, maxLevel: 39 },
  { slug: "kurrpok-splitpaw", label: "Kurrpok Splitpaw", minLevel: 25, maxLevel: 25 },
  { slug: "rosch-val-lvlor", label: "Rosch Val L'Vlor", minLevel: 39, maxLevel: 39 },
  { slug: "tesch-val-devalnmak", label: "Tesch Val Deval`Nmak", minLevel: 39, maxLevel: 39 },
  { slug: "a-hiding-gnoll", label: "A hiding gnoll", minLevel: 19, maxLevel: 19 },
  { slug: "a-one-eyed-gnoll", label: "A one eyed gnoll", minLevel: 35, maxLevel: 35 },
  { slug: "a-lteth-val-scribe", label: "A Lteth Val Scribe", minLevel: 30, maxLevel: 30 },
  { slug: "tesch-val-kadvem", label: "Tesch Val Kadvem", minLevel: 39, maxLevel: 39 },
  { slug: "a-nisch-mas-gnoll", label: "A Nisch Mas Gnoll", minLevel: 29, maxLevel: 31 },
  { slug: "an-ishva-lteth-gnoll", label: "An Ishva Lteth gnoll", minLevel: 36, maxLevel: 37 },
  { slug: "a-gaduladian-widemouth", label: "A gaduladian widemouth", minLevel: 30, maxLevel: 33 },
  { slug: "a-nisch-val-gnoll", label: "A Nisch Val Gnoll", minLevel: 35, maxLevel: 38 },
  { slug: "a-nisch-val-guard", label: "A Nisch Val Guard", minLevel: 38, maxLevel: 39 },
  { slug: "a-tesch-val-guard", label: "A Tesch Val Guard", minLevel: 38, maxLevel: 39 },
  { slug: "a-tesch-val-brute", label: "A Tesch Val Brute", minLevel: 37, maxLevel: 37 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:splitpaw:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 204 complete: ${added} mob node(s) added for Splitpaw`);
