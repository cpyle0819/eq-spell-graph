/**
 * Migration 243: add mob nodes for zone:south-qeynos, per the `mob` node
 * type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * `Category:South Qeynos` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to
 * 100 unique `{{Namedmobpage}}` candidates.
 *
 * South Qeynos turns out to be the same civil-war shape as West Freeport
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md's
 * North/West/East Freeport update) but with both sides still active rather
 * than one side having seized the city: the zone's own lore names Commander
 * Kane Bayle, the king's "shady younger brother," as plotting a coup with
 * "some of his most loyal guards." Every named guard candidate's own
 * `factions` field sorts cleanly along that line -- loyalist (Antonius
 * Bayle/Guards of Qeynos/Merchants of Qeynos) vs. Kane's conspiracy
 * (Bloodsabers/Circle of Unseen Hands/Corrupt Qeynos Guards/Kane Bayle) --
 * but *both* sides carry real stat blocks and confirmed drops (loyalist
 * "Guard Calik"/"Guard Phaeton" and corrupt "Guard Augos"/"Guard Cyrillian"
 * all drop the same "Rusty Long Sword"; "Dun," a bank-guard Banker, "Flees
 * at 20% health" and always drops a Fine Steel Two Handed Sword). Unlike
 * West Freeport, this isn't a captured-half-the-city split -- both guard
 * rosters are real farm targets, so both are kept, extending the Kaladim
 * batch's "stats (and loot) over name" rule rather than the West Freeport
 * "which faction owns this NPC" split.
 *
 * 27 `GM <class>` guild-trainer candidates (Captain Tillin, Chesgard Sydwen,
 * etc. -- level 61, 20000-32000 HP, "None" loot, e.g. "GM Paladin") were
 * excluded per CLAUDE.md's explicit "guildmasters... don't count" rule,
 * confirmed against a real conflict: Kaladim's own shipped bestiary
 * (migration 238) had included guildmasters under the stats-over-role
 * reading, but per user direction this batch follows CLAUDE.md literally
 * instead -- Kaladim's guildmaster entries are a separate, not-yet-fixed
 * inconsistency, not a precedent to extend further.
 *
 * "Cras Snyder" excluded (every stat field, including level, is "?").
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const MOBS = [
  { slug: "gharin", label: "Gharin", minLevel: 5, maxLevel: 5 },
  { slug: "gash-flockwalker", label: "Gash Flockwalker", minLevel: 8, maxLevel: 8 },
  { slug: "raffel-minnmorn", label: "Raffel Minnmorn", minLevel: 10, maxLevel: 10 },
  { slug: "marlin-bizmite", label: "Marlin Bizmite", minLevel: 25, maxLevel: 25 },
  { slug: "madame-serena", label: "Madame Serena", minLevel: 10, maxLevel: 10 },
  { slug: "guard-kwint", label: "Guard Kwint", minLevel: 8, maxLevel: 8 },
  { slug: "den-magason", label: "Den Magason", minLevel: 3, maxLevel: 3 },
  { slug: "dionna", label: "Dionna", minLevel: 25, maxLevel: 25 },
  { slug: "guard-jerith", label: "Guard Jerith", minLevel: 7, maxLevel: 7 },
  { slug: "guard-wenbie", label: "Guard Wenbie", minLevel: 6, maxLevel: 6 },
  { slug: "danaria-hollin", label: "Danaria Hollin", minLevel: 20, maxLevel: 20 },
  { slug: "hansl-bigroon", label: "Hansl Bigroon", minLevel: 25, maxLevel: 25 },
  { slug: "anehan-treol", label: "Anehan Treol", minLevel: 23, maxLevel: 23 },
  { slug: "behroe-dlexon", label: "Behroe Dlexon", minLevel: 18, maxLevel: 18 },
  { slug: "guard-beren", label: "Guard Beren", minLevel: 15, maxLevel: 15 },
  { slug: "faren", label: "Faren", minLevel: 3, maxLevel: 3 },
  { slug: "raz-the-rat-misk", label: "Raz The Rat Misk", minLevel: 5, maxLevel: 5 },
  { slug: "guard-lasen", label: "Guard Lasen", minLevel: 10, maxLevel: 10 },
  { slug: "guard-oleph", label: "Guard Oleph", minLevel: 9, maxLevel: 9 },
  { slug: "guard-perin", label: "Guard Perin", minLevel: 5, maxLevel: 5 },
  { slug: "guard-quedal", label: "Guard Quedal", minLevel: 10, maxLevel: 10 },
  { slug: "guard-tyrak", label: "Guard Tyrak", minLevel: 5, maxLevel: 5 },
  { slug: "klieb-torne", label: "Klieb Torne", minLevel: 10, maxLevel: 10 },
  { slug: "an-investigator", label: "An investigator", minLevel: 10, maxLevel: 10 },
  { slug: "endric", label: "Endric", minLevel: 10, maxLevel: 10 },
  { slug: "guard-corshin", label: "Guard Corshin", minLevel: 10, maxLevel: 10 },
  { slug: "guard-dunix", label: "Guard Dunix", minLevel: 6, maxLevel: 6 },
  { slug: "guard-naret", label: "Guard Naret", minLevel: 5, maxLevel: 5 },
  { slug: "guard-urius", label: "Guard Urius", minLevel: 7, maxLevel: 7 },
  { slug: "trumpy-irontoe", label: "Trumpy Irontoe", minLevel: 5, maxLevel: 5 },
  { slug: "lieutenant-arathur", label: "Lieutenant Arathur", minLevel: 50, maxLevel: 50 },
  { slug: "dun", label: "Dun", minLevel: 45, maxLevel: 45 },
  { slug: "vicus-nonad", label: "Vicus Nonad", minLevel: 26, maxLevel: 26 },
  { slug: "indaria", label: "Indaria", minLevel: 5, maxLevel: 5 },
  { slug: "eracon-krengon", label: "Eracon Krengon", minLevel: 45, maxLevel: 45 },
  { slug: "guard-mezzt", label: "Guard Mezzt", minLevel: 5, maxLevel: 5 },
  { slug: "menkes-tabolet", label: "Menkes Tabolet", minLevel: 14, maxLevel: 14 },
  { slug: "guard-augos", label: "Guard Augos", minLevel: 5, maxLevel: 5 },
  { slug: "tomas-zelnik", label: "Tomas Zelnik", minLevel: 35, maxLevel: 35 },
  { slug: "philip-tallman", label: "Philip Tallman", minLevel: 10, maxLevel: 10 },
  { slug: "lomarc", label: "Lomarc", minLevel: 3, maxLevel: 3 },
  { slug: "tralyn-marsinger", label: "Tralyn Marsinger", minLevel: 25, maxLevel: 25 },
  { slug: "zamel", label: "Zamel", minLevel: 10, maxLevel: 10 },
  { slug: "willie-garrote", label: "Willie Garrote", minLevel: 16, maxLevel: 16 },
  { slug: "donally-stultz", label: "Donally Stultz", minLevel: 25, maxLevel: 25 },
  { slug: "a-rodent", label: "A rodent", minLevel: 1, maxLevel: 1 },
  { slug: "riley-shplots", label: "Riley Shplots", minLevel: 10, maxLevel: 10 },
  { slug: "bruno-barstomper", label: "Bruno Barstomper", minLevel: 35, maxLevel: 35 },
  { slug: "micc-koter", label: "Micc Koter", minLevel: 10, maxLevel: 10 },
  { slug: "eve-marsinger", label: "Eve Marsinger", minLevel: 25, maxLevel: 25 },
  { slug: "kendall-copperhold", label: "Kendall Copperhold", minLevel: 45, maxLevel: 45 },
  { slug: "sorn-copperhold", label: "Sorn Copperhold", minLevel: 45, maxLevel: 45 },
  { slug: "a-rude-individual", label: "A rude individual", minLevel: 10, maxLevel: 12 },
  { slug: "a-sewer-rat", label: "A sewer rat", minLevel: 1, maxLevel: 3 },
  { slug: "adax-rhengst", label: "Adax Rhengst", minLevel: 30, maxLevel: 30 },
  { slug: "arthon-spiritsight", label: "Arthon Spiritsight", minLevel: 30, maxLevel: 30 },
  { slug: "brian-willman", label: "Brian Willman", minLevel: 10, maxLevel: 10 },
  { slug: "cassius-messus", label: "Cassius Messus", minLevel: 20, maxLevel: 21 },
  { slug: "edvard-tommels", label: "Edvard Tommels", minLevel: 35, maxLevel: 35 },
  { slug: "ellisha", label: "Ellisha", minLevel: 25, maxLevel: 25 },
  { slug: "executioner", label: "Executioner", minLevel: 30, maxLevel: 30 },
  { slug: "guard-calik", label: "Guard Calik", minLevel: 9, maxLevel: 9 },
  { slug: "guard-cyrillian", label: "Guard Cyrillian", minLevel: 5, maxLevel: 5 },
  { slug: "guard-forbly", label: "Guard Forbly", minLevel: 5, maxLevel: 5 },
  { slug: "guard-phaeton", label: "Guard Phaeton", minLevel: 5, maxLevel: 5 },
  { slug: "guard-relam", label: "Guard Relam", minLevel: 5, maxLevel: 5 },
  { slug: "karl-verhey", label: "Karl Verhey", minLevel: 10, maxLevel: 10 },
  { slug: "largon-welsh", label: "Largon Welsh", minLevel: 25, maxLevel: 25 },
  { slug: "lylanthian", label: "Lylanthian", minLevel: 25, maxLevel: 25 },
  { slug: "morty-prysmith", label: "Morty Prysmith", minLevel: 5, maxLevel: 5 },
  { slug: "wylin-dodmil", label: "Wylin Dodmil", minLevel: 35, maxLevel: 35 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:south-qeynos:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, "zone:south-qeynos", "located_in");
}

save();
console.log(`Migration 243 complete: ${added} mob node(s) added to zone:south-qeynos`);
