/**
 * Migration 192: add mob nodes for zone:mistmoore-castle, per the `mob`
 * node type from migration 060 (decisions/mob-node-type.md) -- see issue
 * #36.
 *
 * Sourced via the MediaWiki API technique
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md), with
 * per-mob levels read directly from each candidate's own `{{Namedmobpage}}`
 * wikitext (batch `prop=revisions` fetch, same approach as migration 186):
 * `Category:Mistmoore Castle`'s 114 pages narrowed to 72
 * `{{Namedmobpage}}`-tagged candidates, every one with a clean Mistmoore
 * Castle `zone` field and a single numeric level or range. Nothing was
 * excluded as a functional NPC -- this dungeon's own "gypsy" and "ancille"
 * ranks (Negotiator, Ambassador, Cook, etc.) are all hostile members of
 * Mayong Mistmoore's household, each with combat stats, not a town's
 * vendors or guards.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:mistmoore-castle";

const MOBS = [
  { slug: "a-dark-librarian", label: "A Dark Librarian", minLevel: 31, maxLevel: 31 },
  { slug: "a-glyphed-guard", label: "A Glyphed Guard", minLevel: 26, maxLevel: 26 },
  { slug: "a-glyphed-aegis", label: "A Glyphed Aegis", minLevel: 29, maxLevel: 29 },
  { slug: "a-deathly-herald", label: "A Deathly Herald", minLevel: 31, maxLevel: 31 },
  { slug: "a-hemo-enologist", label: "A Hemo Enologist", minLevel: 33, maxLevel: 33 },
  { slug: "a-ghoulish-ancille", label: "A Ghoulish Ancille", minLevel: 29, maxLevel: 29 },
  { slug: "a-ghastish-ancille", label: "A Ghastish Ancille", minLevel: 33, maxLevel: 33 },
  { slug: "a-deathly-harbinger", label: "A Deathly Harbinger", minLevel: 35, maxLevel: 35 },
  { slug: "a-glyphed-sentry", label: "A Glyphed Sentry", minLevel: 27, maxLevel: 29 },
  { slug: "a-glyphed-familiar", label: "A Glyphed Familiar", minLevel: 25, maxLevel: 25 },
  { slug: "a-glyphed-custodian", label: "A Glyphed Custodian", minLevel: 28, maxLevel: 28 },
  { slug: "a-glyphed-warder", label: "A Glyphed Warder", minLevel: 27, maxLevel: 27 },
  { slug: "a-dark-sacrificer", label: "A Dark Sacrificer", minLevel: 31, maxLevel: 31 },
  { slug: "a-dark-ritualist", label: "A Dark Ritualist", minLevel: 34, maxLevel: 34 },
  { slug: "a-dark-offerer", label: "A Dark Offerer", minLevel: 29, maxLevel: 29 },
  { slug: "a-ghostly-ancille", label: "A Ghostly Ancille", minLevel: 34, maxLevel: 34 },
  { slug: "a-fallen-noble", label: "A Fallen Noble", minLevel: 28, maxLevel: 28 },
  { slug: "a-flouting-gargoyle", label: "A Flouting Gargoyle", minLevel: 33, maxLevel: 33 },
  { slug: "a-grinning-gargoyle", label: "A Grinning Gargoyle", minLevel: 24, maxLevel: 24 },
  { slug: "a-blood-wolf", label: "A Blood Wolf", minLevel: 38, maxLevel: 38 },
  { slug: "a-pledge-familiar", label: "A Pledge Familiar", minLevel: 19, maxLevel: 21 },
  { slug: "a-vampiric-ancille", label: "A Vampiric Ancille", minLevel: 35, maxLevel: 35 },
  { slug: "a-mistmoore-guard", label: "A Mistmoore Guard", minLevel: 15, maxLevel: 15 },
  { slug: "a-shadowy-sage", label: "A Shadowy Sage", minLevel: 35, maxLevel: 35 },
  { slug: "a-thought-spoiler", label: "A Thought Spoiler", minLevel: 30, maxLevel: 30 },
  { slug: "a-shadowy-scribe", label: "A Shadowy Scribe", minLevel: 33, maxLevel: 33 },
  { slug: "a-thought-defiler", label: "A Thought Defiler", minLevel: 33, maxLevel: 33 },
  { slug: "a-shadowy-scrivener", label: "A Shadowy Scrivener", minLevel: 30, maxLevel: 30 },
  { slug: "a-spiritish-ancille", label: "A Spiritish Ancille", minLevel: 30, maxLevel: 30 },
  { slug: "a-spectral-ancille", label: "A Spectral Ancille", minLevel: 31, maxLevel: 31 },
  { slug: "a-soul-seductress", label: "A Soul Seductress", minLevel: 33, maxLevel: 33 },
  { slug: "a-soul-inveigling", label: "A Soul Inveigling", minLevel: 34, maxLevel: 34 },
  { slug: "a-negotiator", label: "A Negotiator", minLevel: 31, maxLevel: 31 },
  { slug: "a-vampire-oracle", label: "A Vampire Oracle", minLevel: 33, maxLevel: 33 },
  { slug: "a-soul-temptress", label: "A Soul Temptress", minLevel: 30, maxLevel: 30 },
  { slug: "a-leering-gargoyle", label: "A Leering Gargoyle", minLevel: 34, maxLevel: 34 },
  { slug: "a-vampire-noble", label: "A Vampire Noble", minLevel: 33, maxLevel: 33 },
  { slug: "a-jeering-gargoyle", label: "A Jeering Gargoyle", minLevel: 27, maxLevel: 32 },
  { slug: "a-werewolf", label: "A Werewolf", minLevel: 22, maxLevel: 32 },
  { slug: "a-sneering-gargoyle", label: "A Sneering Gargoyle", minLevel: 25, maxLevel: 25 },
  { slug: "an-avenging-caitiff", label: "An avenging caitiff", minLevel: 30, maxLevel: 30 },
  { slug: "an-advisor", label: "An advisor", minLevel: 35, maxLevel: 35 },
  { slug: "a-cloaked-dhampyre", label: "A cloaked dhampyre", minLevel: 33, maxLevel: 33 },
  { slug: "an-imp-familiar", label: "An imp familiar", minLevel: 29, maxLevel: 35 },
  { slug: "a-glyphed-ghoul", label: "A glyphed ghoul", minLevel: 27, maxLevel: 27 },
  { slug: "a-deathly-usher", label: "A deathly usher", minLevel: 30, maxLevel: 32 },
  { slug: "a-dark-elf-noble", label: "A dark elf noble", minLevel: 31, maxLevel: 31 },
  { slug: "an-initiate-familiar", label: "An Initiate Familiar", minLevel: 22, maxLevel: 22 },
  { slug: "a-will-pillager", label: "A Will Pillager", minLevel: 31, maxLevel: 31 },
  { slug: "an-ancille-cook", label: "An Ancille Cook", minLevel: 35, maxLevel: 35 },
  { slug: "a-will-sapper", label: "A Will Sapper", minLevel: 31, maxLevel: 31 },
  { slug: "a-glyphed-forbidder", label: "A glyphed forbidder", minLevel: 29, maxLevel: 31 },
  { slug: "a-will-ravisher", label: "A Will Ravisher", minLevel: 35, maxLevel: 35 },
  { slug: "a-wightish-ancille", label: "A Wightish Ancille", minLevel: 30, maxLevel: 30 },
  { slug: "a-gypsy-dancer", label: "A gypsy dancer", minLevel: 25, maxLevel: 25 },
  { slug: "a-gypsy-musician", label: "A gypsy musician", minLevel: 29, maxLevel: 29 },
  { slug: "a-thought-corruptor", label: "A thought corruptor", minLevel: 32, maxLevel: 32 },
  { slug: "a-gypsy-ambassador", label: "A gypsy ambassador", minLevel: 29, maxLevel: 29 },
  { slug: "a-dark-ass-t-librarian", label: "A dark ass`t librarian", minLevel: 33, maxLevel: 33 },
  { slug: "an-undead-knight-mistmoore", label: "An undead knight (Mistmoore)", minLevel: 40, maxLevel: 40 },
  { slug: "maid-issis", label: "Maid Issis", minLevel: 35, maxLevel: 35 },
  { slug: "butler-syncall", label: "Butler Syncall", minLevel: 35, maxLevel: 35 },
  { slug: "ssynthi", label: "Ssynthi", minLevel: 24, maxLevel: 25 },
  { slug: "mynthi-davissi", label: "Mynthi Davissi", minLevel: 32, maxLevel: 32 },
  { slug: "garton-viswin", label: "Garton Viswin", minLevel: 35, maxLevel: 37 },
  { slug: "lasna-cheroon", label: "Lasna Cheroon", minLevel: 36, maxLevel: 36 },
  { slug: "enynti", label: "Enynti", minLevel: 27, maxLevel: 27 },
  { slug: "princess-cherista", label: "Princess Cherista", minLevel: 35, maxLevel: 35 },
  { slug: "black-dire", label: "Black Dire", minLevel: 45, maxLevel: 45 },
  { slug: "xicotl", label: "Xicotl", minLevel: 40, maxLevel: 40 },
  { slug: "mayong-mistmoore", label: "Mayong Mistmoore", minLevel: 53, maxLevel: 53 },
  { slug: "dark-huntress", label: "Dark Huntress", minLevel: 50, maxLevel: 50 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:mistmoore-castle:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 192 complete: ${added} mob node(s) added for Mistmoore Castle`);
