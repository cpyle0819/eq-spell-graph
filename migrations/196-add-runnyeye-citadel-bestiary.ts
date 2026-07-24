/**
 * Migration 196: add mob nodes for zone:runnyeye-citadel, per the `mob`
 * node type from migration 060 (decisions/mob-node-type.md) -- see issue
 * #36.
 *
 * Sourced via the MediaWiki API technique
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md), with
 * per-mob levels read directly from each candidate's own `{{Namedmobpage}}`
 * wikitext (batch `prop=revisions` fetch). `Category:RunnyEye Citadel`'s
 * pages narrowed to 41 `{{Namedmobpage}}`-tagged candidates (post-revamp
 * only -- the pre-revamp "Clan RunnyEye" category is a separate, older era
 * per the page's own revamp note, and the graph's existing zone label is
 * already the post-revamp name).
 *
 * "A goblin neophyte" and "A Runnyeye Conscript" are excluded: both state
 * level as a bare "?" with no numeric value anywhere, unlike this batch's
 * other hedged-but-numeric entries ("22?", "10?", etc.) which keep their
 * number per the Kedge Keep/Mistmoore batch's precedent
 * (eqlwiki-mediawiki-api-for-messy-bestiary-categories.md).
 *
 * "A goblin banker" is included despite its `class = Banker` and
 * `Category:Banker` tag: unlike East Cabilis's excluded Klok Margar/Klok
 * Rakra (description reads simply "Banker", no combat stats), this page
 * has a full stat block (AC 74, HP 459, 1-38 damage) and opposing
 * factions, and the zone's own prose confirms it's killable ("Bank will
 * Bank with Max KOS") -- a real, attackable creature that happens to also
 * bank, not a pure functional NPC.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:runnyeye-citadel";

const MOBS = [
  { slug: "an-evil-eye-prisoner", label: "An Evil Eye prisoner", minLevel: 31, maxLevel: 31 },
  { slug: "sludge-dankmire", label: "Sludge Dankmire", minLevel: 25, maxLevel: 25 },
  { slug: "the-sporali-moldmaster", label: "The Sporali Moldmaster", minLevel: 25, maxLevel: 25 },
  { slug: "goblin-janitor", label: "Goblin Janitor", minLevel: 6, maxLevel: 6 },
  { slug: "a-slime-elemental", label: "A slime elemental", minLevel: 24, maxLevel: 26 },
  { slug: "a-pickclaw-arroweater", label: "A Pickclaw Arroweater", minLevel: 15, maxLevel: 15 },
  { slug: "a-pickclaw-bladestopper", label: "A Pickclaw Bladestopper", minLevel: 13, maxLevel: 15 },
  { slug: "lord-pickclaw", label: "Lord Pickclaw", minLevel: 32, maxLevel: 32 },
  { slug: "battlelord-paluk", label: "Battlelord Paluk", minLevel: 28, maxLevel: 28 },
  { slug: "a-pickclaw-slayspell", label: "A Pickclaw Slayspell", minLevel: 22, maxLevel: 22 },
  { slug: "battlewizard-unak", label: "Battlewizard Unak", minLevel: 32, maxLevel: 33 },
  { slug: "a-sporali-miner", label: "A Sporali Miner", minLevel: 20, maxLevel: 20 },
  { slug: "a-pickclaw-foeseeker", label: "A Pickclaw Foeseeker", minLevel: 22, maxLevel: 22 },
  { slug: "a-pickclaw-veteran", label: "A Pickclaw veteran", minLevel: 21, maxLevel: 21 },
  { slug: "a-goblin-runt", label: "A goblin runt", minLevel: 10, maxLevel: 10 },
  { slug: "a-goblin-peon", label: "A goblin peon", minLevel: 11, maxLevel: 12 },
  { slug: "a-goblin-trainee", label: "A goblin trainee", minLevel: 10, maxLevel: 10 },
  { slug: "a-pickclaw-ambushbaiter", label: "A Pickclaw Ambushbaiter", minLevel: 18, maxLevel: 18 },
  { slug: "a-pickclaw-foeslicer", label: "A Pickclaw Foeslicer", minLevel: 21, maxLevel: 21 },
  { slug: "a-pickclaw-bonemender", label: "A Pickclaw bonemender", minLevel: 17, maxLevel: 17 },
  { slug: "a-pickclaw-thoughtshaper", label: "A Pickclaw Thoughtshaper", minLevel: 11, maxLevel: 11 },
  { slug: "a-pickclaw-fleshburner", label: "A Pickclaw Fleshburner", minLevel: 16, maxLevel: 16 },
  { slug: "a-runnyeye-trustee", label: "A Runnyeye Trustee", minLevel: 10, maxLevel: 10 },
  { slug: "a-sporali-defender", label: "A Sporali Defender", minLevel: 22, maxLevel: 22 },
  { slug: "a-pickclaw-destroyer", label: "A Pickclaw Destroyer", minLevel: 19, maxLevel: 22 },
  { slug: "a-mimic-clan-runnyeye", label: "A mimic (Clan RunnyEye)", minLevel: 1, maxLevel: 1 },
  { slug: "a-pickclaw-zekspeaker", label: "A Pickclaw Zekspeaker", minLevel: 22, maxLevel: 22 },
  { slug: "a-pickclaw-foechopper", label: "A Pickclaw Foechopper", minLevel: 20, maxLevel: 20 },
  { slug: "a-pickclaw-crusader", label: "A Pickclaw Crusader", minLevel: 25, maxLevel: 25 },
  { slug: "a-sporali-scavenger", label: "A Sporali Scavenger", minLevel: 21, maxLevel: 21 },
  { slug: "a-sporali-worker", label: "A Sporali worker", minLevel: 21, maxLevel: 21 },
  { slug: "a-sporali-gatherer", label: "A Sporali Gatherer", minLevel: 17, maxLevel: 17 },
  { slug: "a-sporeling", label: "A sporeling", minLevel: 20, maxLevel: 20 },
  { slug: "a-goblin-banker", label: "A goblin banker", minLevel: 17, maxLevel: 17 },
  { slug: "a-gelatinous-cube-runnyeye-citadel", label: "A Gelatinous Cube (Runnyeye Citadel)", minLevel: 5, maxLevel: 5 },
  { slug: "a-goblin-overseer", label: "A Goblin Overseer", minLevel: 10, maxLevel: 10 },
  { slug: "a-pickclaw-mindripper", label: "A Pickclaw Mindripper", minLevel: 16, maxLevel: 16 },
  { slug: "an-evil-eye-runnyeye", label: "An Evil Eye (Runnyeye)", minLevel: 32, maxLevel: 46 },
  { slug: "an-ooze-crawler", label: "An ooze crawler", minLevel: 22, maxLevel: 24 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:runnyeye-citadel:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 196 complete: ${added} mob node(s) added for Runnyeye Citadel`);
