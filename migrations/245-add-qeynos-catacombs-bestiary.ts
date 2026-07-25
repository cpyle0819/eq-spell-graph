/**
 * Migration 245: add mob nodes for zone:qeynos-catacombs, per the `mob`
 * node type from migration 060 (decisions/mob-node-type.md) -- see issue
 * #36. Migration 239 merged zone:qeynos-aqueducts into this node as the
 * same zone under two names, so this is the only bestiary needed for
 * either name.
 *
 * `Category:Qeynos Aqueducts` (the wiki's own category name for this zone)
 * narrowed via the MediaWiki API method (decisions/eqlwiki-mediawiki-api-
 * for-messy-bestiary-categories.md) to 82 unique `{{Namedmobpage}}`
 * candidates: the tunnel-maze wildlife (rats, snakes, alligators, spiders,
 * skeletons, sewer sentinels) and the criminal underbelly the zone's own
 * prose describes (beggars, thugs, smugglers, a ring leader) plus several
 * mid-tier named fighters (the Whinstone/Redstepp/Darkson/Shatblack
 * families, Guard Helminth/Corrupt Guard Helminth, Banker Javen, Malka
 * Rale) with real stat blocks in the hundreds-to-low-thousands HP range.
 *
 * Excluded: 17 `GM <class>` guild-trainer candidates (Kurne Rextula,
 * Commander Kane, Garuc Anehm, etc. -- level 61, ~32000 HP, "None" loot,
 * descriptions like "Necromancer guildmaster in the Qeynos sewers") per
 * CLAUDE.md's "guildmasters... don't count" rule -- see migration 243's
 * South Qeynos batch for the same call and the Kaladim-precedent conflict
 * it resolves. Several of these (Kurne Rextula, Commander Kane, Garuc
 * Anehm, Nomaria Doseniar, Rihtur Fullome, Lyris Moonbane, Perkon Malok,
 * Reania Jukle, Rocthar Bekesna, Sragg Bloodheart, Trenon Callust, Xeture
 * Demiagar) already exist as `npc:qeynos-catacombs:*` quest-giver nodes for
 * their Guild Summons quests -- that role stays modeled, just not
 * duplicated into the bestiary. Also excluded: "An investigator" (level
 * "Unknown", no stated stats) and "A fish" (`zone` = "Various Zones", a
 * fishing catch not a zone creature, same call as Neriak's).
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const MOBS = [
  { slug: "an-injured-rat", label: "An injured rat", minLevel: 3, maxLevel: 3 },
  { slug: "cuburt", label: "Cuburt", minLevel: 4, maxLevel: 4 },
  { slug: "bloated-alligator", label: "Bloated Alligator", minLevel: 2, maxLevel: 2 },
  { slug: "a-skeleton", label: "A skeleton", minLevel: 4, maxLevel: 18 },
  { slug: "a-decaying-skeleton", label: "A Decaying Skeleton", minLevel: 1, maxLevel: 1 },
  { slug: "riggin-vix", label: "Riggin Vix", minLevel: 17, maxLevel: 17 },
  { slug: "lahn-whinstone", label: "Lahn Whinstone", minLevel: 30, maxLevel: 30 },
  { slug: "teydar", label: "Teydar", minLevel: 60, maxLevel: 60 },
  { slug: "a-gelatinous-cube", label: "A Gelatinous Cube", minLevel: 4, maxLevel: 6 },
  { slug: "a-rotting-sentry", label: "A Rotting Sentry", minLevel: 32, maxLevel: 36 },
  { slug: "chan-whinstone", label: "Chan Whinstone", minLevel: 30, maxLevel: 30 },
  { slug: "chou-whinstone", label: "Chou Whinstone", minLevel: 30, maxLevel: 30 },
  { slug: "krytn-redstepp", label: "Krytn Redstepp", minLevel: 30, maxLevel: 30 },
  { slug: "marn-darkson", label: "Marn Darkson", minLevel: 30, maxLevel: 30 },
  { slug: "neab", label: "Neab", minLevel: 10, maxLevel: 10 },
  { slug: "omorb", label: "Omorb", minLevel: 20, maxLevel: 20 },
  { slug: "vun-shatblack", label: "Vun Shatblack", minLevel: 30, maxLevel: 30 },
  { slug: "a-sepsis-rat", label: "A Sepsis Rat", minLevel: 33, maxLevel: 33 },
  { slug: "a-sewer-sentinel", label: "A Sewer Sentinel", minLevel: 8, maxLevel: 8 },
  { slug: "an-exhausted-guard", label: "An Exhausted Guard", minLevel: 4, maxLevel: 4 },
  { slug: "vin-moltor", label: "Vin Moltor", minLevel: 24, maxLevel: 24 },
  { slug: "a-fire-beetle", label: "A Fire Beetle", minLevel: 2, maxLevel: 2 },
  { slug: "a-giant-rat", label: "A Giant Rat", minLevel: 2, maxLevel: 4 },
  { slug: "a-giant-sewer-rat", label: "A Giant Sewer Rat", minLevel: 5, maxLevel: 5 },
  { slug: "a-nesting-rat", label: "A Nesting Rat", minLevel: 5, maxLevel: 5 },
  { slug: "ronn-castekin", label: "Ronn Castekin", minLevel: 2, maxLevel: 2 },
  { slug: "a-small-alligator", label: "A small alligator", minLevel: 1, maxLevel: 1 },
  { slug: "a-mercenary", label: "A mercenary", minLevel: 1, maxLevel: 2 },
  { slug: "a-shady-mercenary", label: "A shady mercenary", minLevel: 5, maxLevel: 7 },
  { slug: "beggar-wyllin", label: "Beggar Wyllin", minLevel: 5, maxLevel: 5 },
  { slug: "a-bat", label: "A bat", minLevel: 1, maxLevel: 1 },
  { slug: "a-large-snake", label: "A large snake", minLevel: 3, maxLevel: 5 },
  { slug: "a-large-spider", label: "A large spider", minLevel: 2, maxLevel: 4 },
  { slug: "a-large-rat", label: "A Large Rat", minLevel: 1, maxLevel: 1 },
  { slug: "malka-rale", label: "Malka Rale", minLevel: 48, maxLevel: 48 },
  { slug: "mon-sarna", label: "Mon`Sarna", minLevel: 5, maxLevel: 5 },
  { slug: "a-thug", label: "A thug", minLevel: 8, maxLevel: 8 },
  { slug: "a-thug-leader", label: "A thug leader", minLevel: 7, maxLevel: 7 },
  { slug: "a-ring-leader", label: "A ring leader", minLevel: 12, maxLevel: 12 },
  { slug: "a-piranha", label: "A piranha", minLevel: 2, maxLevel: 2 },
  { slug: "guard-helminth", label: "Guard Helminth", minLevel: 35, maxLevel: 35 },
  { slug: "azibelle-spavin", label: "Azibelle Spavin", minLevel: 45, maxLevel: 45 },
  { slug: "corrupt-guard-helminth", label: "Corrupt Guard Helminth", minLevel: 39, maxLevel: 39 },
  { slug: "drosco", label: "Drosco", minLevel: 8, maxLevel: 10 },
  { slug: "a-green-snake", label: "A green snake", minLevel: 1, maxLevel: 1 },
  { slug: "banker-javen", label: "Banker Javen", minLevel: 40, maxLevel: 40 },
  { slug: "a-beggar", label: "A beggar", minLevel: 5, maxLevel: 5 },
  { slug: "a-courier", label: "A courier", minLevel: 6, maxLevel: 6 },
  { slug: "a-dread-corpse", label: "A dread corpse", minLevel: 8, maxLevel: 10 },
  { slug: "a-froglok", label: "A froglok", minLevel: 4, maxLevel: 5 },
  { slug: "a-large-piranha", label: "A large piranha", minLevel: 4, maxLevel: 4 },
  { slug: "a-sewer-rat", label: "A sewer rat", minLevel: 1, maxLevel: 3 },
  { slug: "a-shark", label: "A Shark", minLevel: 13, maxLevel: 17 },
  { slug: "a-smuggler", label: "A smuggler", minLevel: 9, maxLevel: 10 },
  { slug: "a-snake", label: "A snake", minLevel: 1, maxLevel: 1 },
  { slug: "a-spectre", label: "A Spectre", minLevel: 33, maxLevel: 37 },
  { slug: "an-injured-brigand", label: "An injured brigand", minLevel: 6, maxLevel: 6 },
  { slug: "an-undead-knight", label: "An undead knight", minLevel: 4, maxLevel: 4 },
  { slug: "illie-roln", label: "Illie Roln", minLevel: 35, maxLevel: 35 },
  { slug: "kron-redstepp", label: "Kron Redstepp", minLevel: 30, maxLevel: 30 },
  { slug: "morn-darkson", label: "Morn Darkson", minLevel: 30, maxLevel: 30 },
  { slug: "thumpy", label: "Thumpy", minLevel: 9, maxLevel: 10 },
  { slug: "van-shatblack", label: "Van Shatblack", minLevel: 30, maxLevel: 30 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:qeynos-catacombs:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, "zone:qeynos-catacombs", "located_in");
}

save();
console.log(`Migration 245 complete: ${added} mob node(s) added to zone:qeynos-catacombs`);
