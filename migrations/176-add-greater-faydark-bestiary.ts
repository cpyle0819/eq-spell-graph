/**
 * Migration 176: add mob nodes for zone:greater-faydark, per the `mob`
 * node type from migration 060 (decisions/mob-node-type.md) -- see issue
 * #36.
 *
 * Sourced via the MediaWiki API technique
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md):
 * Category:Greater Faydark's 184 pages narrowed to 93 {{Namedmobpage}}-
 * tagged candidates. Greater Faydark wraps the wood-elf city of Kelethin,
 * so most candidates are its guards ("Guard <ElvenName>", ~30 of them),
 * vendors/bankers/innkeeps, and level-61 "GM <Class>" trainers -- all
 * excluded the same way North Qeynos's were (migration 139). The zone's
 * own "Types of Monsters" field (bandits, bats, black wolves, brownie
 * scouts, decaying skeletons, fae drake hatchlings, faeries, giant wasp
 * drones, orc pawns/centurions/oracles/shamans, pixie tricksters,
 * spiderlings, will-o'-wisps) drove which generic creatures to keep.
 *
 * "Orc Pawn (Crushbone)", "Orc Oracle (Crushbone)", and "Orc Centurion
 * (Crushbone)" each explicitly list Greater Faydark among their own
 * `zone` field despite the "(Crushbone)" disambiguation in their title --
 * included; "Orc scoutsman (Crushbone)" lists only Crushbone and is
 * excluded from this zone's bestiary. "Centurion Relgle" is a named orc
 * (Crushbone Orcs faction, not a Kelethin garrison title) -- included.
 * "A Decaying Skeleton" states "1, 7-10 (Steamfont Mountains)" -- only the
 * unqualified 1 applies here. "A Drunkard" (level 9, no Kelethin-garrison
 * faction) is a real low-level trash mob despite the flavor name, same
 * "A fish"-style generic-mob naming as migration 167.
 *
 * Faelin Bloodbriar, Salani Tunfar, and Kindl Lunsight are the three
 * possible rare-spawn bosses for the same Druid/Ranger epic encounter
 * (Faelin's own page: "Either the orc pawn PH or Faelin will spawn...";
 * Salani's: "The other possible spawn besides Salani and Faelin is
 * Kindle") -- all three real kill targets, included despite Kindl's own
 * page reading like a throwaway location note.
 *
 * Excluded for insufficient evidence of being a creature rather than a
 * Kelethin citizen (blank "Description needed" pages, no monster-faction
 * tie, professional-sounding names/classes): Devin Ashwood, Lily Ashwood,
 * Alania Peaceheart, Nylianne the True (level 61, matching this zone's
 * GM-trainer level tier), Idia and Jakum Webdancer (confirmed by Jakum's
 * own description as the city's mail clerks), Ran Sunfire/Aleena
 * Lightleaf/Cerila Windrider/Maesyn Trueshot (confirmed vendors/trainers
 * via their own description text), and Bidl Frugrin (an unexplained
 * day/night despawn cycle and an Ak'Anon-themed faction with no tie to
 * this zone's own content).
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:greater-faydark";

const MOBS = [
  { slug: "a-decaying-skeleton", label: "A Decaying Skeleton", minLevel: 1, maxLevel: 1 },
  { slug: "a-willowisp", label: "A Willowisp", minLevel: 9, maxLevel: 11 },
  { slug: "a-pixie-trickster", label: "A Pixie Trickster", minLevel: 2, maxLevel: 2 },
  { slug: "a-brownie-scout", label: "A Brownie Scout", minLevel: 3, maxLevel: 3 },
  { slug: "a-black-wolf", label: "A Black Wolf", minLevel: 1, maxLevel: 1 },
  { slug: "orc-hatchetman", label: "Orc Hatchetman", minLevel: 1, maxLevel: 1 },
  { slug: "a-fae-drake-hatchling", label: "A Fae Drake Hatchling", minLevel: 2, maxLevel: 2 },
  { slug: "an-orc-witchdoctor", label: "An Orc Witchdoctor", minLevel: 6, maxLevel: 6 },
  { slug: "an-orc-footman", label: "An Orc Footman", minLevel: 8, maxLevel: 8 },
  { slug: "orc-shaman", label: "Orc Shaman", minLevel: 4, maxLevel: 5 },
  { slug: "an-orc-seer", label: "An Orc Seer", minLevel: 8, maxLevel: 8 },
  { slug: "a-widow-hatchling", label: "A Widow Hatchling", minLevel: 2, maxLevel: 2 },
  { slug: "a-bat", label: "A Bat", minLevel: 1, maxLevel: 1 },
  { slug: "an-orc-arsonist", label: "An Orc Arsonist", minLevel: 12, maxLevel: 12 },
  { slug: "a-giant-wasp-drone", label: "A Giant Wasp Drone", minLevel: 1, maxLevel: 1 },
  { slug: "a-giant-wasp-worker", label: "A Giant Wasp Worker", minLevel: 5, maxLevel: 5 },
  { slug: "a-giant-wasp-warrior", label: "A Giant Wasp Warrior", minLevel: 7, maxLevel: 7 },
  { slug: "a-bandit", label: "A Bandit", minLevel: 5, maxLevel: 7 },
  { slug: "a-faerie-courtier", label: "A Faerie Courtier", minLevel: 11, maxLevel: 11 },
  { slug: "a-faerie-duchess", label: "A Faerie Duchess", minLevel: 19, maxLevel: 19 },
  { slug: "a-faerie-maiden", label: "A Faerie Maiden", minLevel: 8, maxLevel: 8 },
  { slug: "a-faerie-noble", label: "A Faerie Noble", minLevel: 13, maxLevel: 13 },
  { slug: "a-faerie-royal-guard", label: "A Faerie Royal Guard", minLevel: 21, maxLevel: 21 },
  { slug: "a-faerie-guard", label: "A Faerie Guard", minLevel: 24, maxLevel: 26 },
  { slug: "orc-pawn", label: "Orc Pawn", minLevel: 1, maxLevel: 2 },
  { slug: "orc-oracle", label: "Orc Oracle", minLevel: 9, maxLevel: 9 },
  { slug: "orc-centurion", label: "Orc Centurion", minLevel: 3, maxLevel: 10 },
  { slug: "centurion-relgle", label: "Centurion Relgle", minLevel: 10, maxLevel: 10 },
  { slug: "faelin-bloodbriar", label: "Faelin Bloodbriar", minLevel: 55, maxLevel: 55 },
  { slug: "salani-tunfar", label: "Salani Tunfar", minLevel: 30, maxLevel: 30 },
  { slug: "kindl-lunsight", label: "Kindl Lunsight", minLevel: 20, maxLevel: 20 },
  { slug: "a-drunkard", label: "A Drunkard", minLevel: 9, maxLevel: 9 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:greater-faydark:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 176 complete: ${added} mob node(s) added for Greater Faydark`);
