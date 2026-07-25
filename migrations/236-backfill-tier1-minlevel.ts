/**
 * Migration 236: Follow-up to 235. That pass rejected 9 multi-tier
 * progression questlines outright because their wiki page only states one
 * range/minimum for the whole series, not a number per tier -- but for
 * several of them, that series-wide number is explicitly framed (or, for a
 * plain "X-Y" range, conventionally means) as the level to *begin* the
 * chain, which is a real, defensible number for the FIRST tier specifically
 * (not the later ones -- see decisions/eqlwiki-quest-research-method.md).
 * This migration applies that number to the first quest in each chain only,
 * plus two incidental tier-specific asides found buried in walkthrough
 * prose during the migration-235 research pass. Every other tier in these
 * 9 series stays unset -- still genuinely unknown, not guessed at.
 *
 * - Coldain Ring Quests: "Minimum Level: 30+ (to start)" -> ring 1 (Copper)
 * - Coldain Prayer Shawl Quests: "Minimum Level: 35-55+" -> shawl 1 (Burlap), using the low end as the start
 * - Monk Sash Quests: "Minimum Level: 1-25 (progresses)" -> White Training sash
 * - Monk Headband Quests: "Minimum Level: 1-30 (progresses)" -> White headband
 * - Monk Shackle Quests: "Minimum Level: 1+" -> shackle 1 (Clay)
 * - Shaman Skull Quests: "Minimum Level: 5+" -> Clairvoyant (tier 1; two duplicate node-id schemes both get it)
 * - Necromancer Skullcap Quests: "Minimum Level: 4+" -> Rank 1; plus "you have to be at least level 20 to finish this part" -> Rank 5 specifically
 * - Warrior Pike Quests: "Minimum Level: 1+" -> Partisan's Pike (tier 0; two duplicate node-id schemes both get it)
 * - Crusader's Tests: "Minimum Level: 1+" -> Test of the Pawn; plus "this quest is doable at level 9 onwards" -> Test of Pain specifically
 *
 * Scaled Mystic Armor Quests is deliberately still untouched -- its per-piece
 * numbers on the wiki are mob kill-levels for farmed reagents, not a stated
 * quest level, so assigning from them would be an inference the wiki never
 * actually makes (see decisions/ note).
 */

import { loadGraph } from "./_lib";

const { updateNode, save } = loadGraph(import.meta.dir);

const UPDATES: Record<string, number> = {
  "quest:coldain-ring-1-copper": 30,
  "quest:coldain-shawl-1-burlap": 35,
  "quest:monk-sash-white-training": 1,
  "quest:monk-headband-white": 1,
  "quest:monk-shackle-1-clay": 1,
  "quest:shaman-skull-clairvoyant-quest": 5,
  "quest:shaman-skull-clairvoyant": 5,
  "quest:necromancer-skullcap-rank1": 4,
  "quest:necromancer-skullcap-rank5": 20,
  "quest:partisans-pike-quest": 1,
  "quest:warrior-pike-0-partisans": 1,
  "quest:crusaders-test-of-the-pawn": 1,
  "quest:crusaders-test-of-pain": 9,
};

for (const [id, minLevel] of Object.entries(UPDATES)) {
  updateNode(id, { minLevel });
}

save();
console.log(`Backfilled minLevel on ${Object.keys(UPDATES).length} tier-1/incidental quest nodes.`);
