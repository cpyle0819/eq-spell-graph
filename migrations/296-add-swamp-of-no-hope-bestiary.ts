/**
 * Migration 296: add npc nodes (roles: ["mob"]) for
 * zone:swamp-of-no-hope, per the unified `npc`/`roles` schema from
 * migration 265 (decisions/npc-mob-unification-and-zone-groups.md) -- see
 * issue #36.
 *
 * `Category:Swamp of No Hope` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 97
 * `{{Namedmobpage}}` candidates: froglok camps of every rank (tad through
 * berserker/impaler/knight), banished-Iksar outcasts, skeletons of several
 * grades, leeches/mosquitoes/man-eating plants, the Froglok Berserker
 * Cycle roster, and a Cabilis trooper/captain patrol.
 *
 * Two exclusions:
 * - "Lesser Icebone Skeleton" (title-cased page) is Kurn's Tower's own
 *   mob -- its own description explicitly says "not to be confused with
 *   [[a lesser icebone skeleton]] in the Field of Bone and Swamp of No
 *   Hope," which is a separate lowercase page kept in this batch instead.
 *   Same miscategorized-candidate pattern as Lower Guk's excluded "A
 *   froglok tsu shaman".
 * - "Froszik the Impaler" has no numeric level at all (a bare `?`) despite
 *   being part of the Froglok Berserker Cycle roster -- same no-lower-bound
 *   exclusion rule as "An Evil Eye Pet" before it.
 *
 * "Captain Nedar"/"Dugroz"/"Mystic Dovan"/"Ssessthrass" already existed as
 * `npc:` quest-giver nodes -- same both-roles-legitimate shape as The
 * Warrens' Aderius Rhenar/Koajin, so this batch unions the `mob` role and
 * level data onto them rather than skipping. Several candidates share a
 * combined level string across multiple zones (An iksar marauder, A
 * froglok tad, Greater Scalebone, Iksar exile, etc.) -- all confirmed via
 * their own `zone` field explicitly co-listing Swamp of No Hope, same
 * both-zones-real pattern as Rathe/Steamfont's shared "A Decaying
 * Skeleton".
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const MOBS: { label: string; minLevel: number; maxLevel: number }[] = [
  { label: "Captain Nedar", minLevel: 50, maxLevel: 50 },
  { label: "Warlord Hikyg", minLevel: 51, maxLevel: 51 },
  { label: "An iksar marauder", minLevel: 14, maxLevel: 16 },
  { label: "A froglok tad", minLevel: 1, maxLevel: 5 },
  { label: "A froglok repairer (Swamp of No Hope)", minLevel: 20, maxLevel: 20 },
  { label: "Dugroz", minLevel: 30, maxLevel: 30 },
  { label: "Mystic Dovan", minLevel: 35, maxLevel: 35 },
  { label: "Ulump Pujluk", minLevel: 55, maxLevel: 55 },
  { label: "Froglok Gaz Knight", minLevel: 20, maxLevel: 22 },
  { label: "Froglok Gaz Warrior", minLevel: 17, maxLevel: 17 },
  { label: "Froglok Shin Shaman", minLevel: 21, maxLevel: 21 },
  { label: "A Swamp Leech", minLevel: 1, maxLevel: 1 },
  { label: "Charbone Skeleton", minLevel: 24, maxLevel: 27 },
  { label: "Icebone Skeleton", minLevel: 22, maxLevel: 24 },
  { label: "Froglok Raider", minLevel: 11, maxLevel: 11 },
  { label: "Froglok Krup Guard", minLevel: 22, maxLevel: 22 },
  { label: "Froglok Ton Warrior", minLevel: 24, maxLevel: 24 },
  { label: "Crusader Litia", minLevel: 50, maxLevel: 50 },
  { label: "Crusader Savot", minLevel: 50, maxLevel: 50 },
  { label: "Bloodgorge", minLevel: 23, maxLevel: 23 },
  { label: "Frayk", minLevel: 25, maxLevel: 25 },
  { label: "Man Eating Plant", minLevel: 20, maxLevel: 20 },
  { label: "Man Eating Shrub", minLevel: 6, maxLevel: 6 },
  { label: "Greater Scalebone", minLevel: 14, maxLevel: 15 },
  { label: "Weeping Mantrap", minLevel: 25, maxLevel: 27 },
  { label: "Man Eating Vine", minLevel: 25, maxLevel: 25 },
  { label: "A Froglok Bounder", minLevel: 8, maxLevel: 8 },
  { label: "A Marsh Leech", minLevel: 6, maxLevel: 6 },
  { label: "Fangor", minLevel: 31, maxLevel: 33 },
  { label: "A Mosquito", minLevel: 1, maxLevel: 1 },
  { label: "A giant swamp leech", minLevel: 3, maxLevel: 3 },
  { label: "An iksar brigand", minLevel: 11, maxLevel: 13 },
  { label: "A froglok outlander", minLevel: 18, maxLevel: 18 },
  { label: "Footman Moglok", minLevel: 12, maxLevel: 12 },
  { label: "War boned skeleton", minLevel: 20, maxLevel: 22 },
  { label: "Soblohg", minLevel: 25, maxLevel: 25 },
  { label: "A decaying skeleton (Iksar)", minLevel: 1, maxLevel: 1 },
  { label: "A skeleton (Iksar)", minLevel: 4, maxLevel: 4 },
  { label: "An iksar footpad", minLevel: 5, maxLevel: 5 },
  { label: "A froglok skipper", minLevel: 4, maxLevel: 4 },
  { label: "Decaying skeleton", minLevel: 1, maxLevel: 1 },
  { label: "A large mosquito", minLevel: 3, maxLevel: 3 },
  { label: "Froglok Escort", minLevel: 5, maxLevel: 5 },
  { label: "An escaped froglok", minLevel: 5, maxLevel: 5 },
  { label: "Escaped froglok slave", minLevel: 4, maxLevel: 4 },
  { label: "Iksar exile", minLevel: 22, maxLevel: 26 },
  { label: "An Iksar pariah", minLevel: 21, maxLevel: 21 },
  { label: "Man eating creeper", minLevel: 14, maxLevel: 14 },
  { label: "Venomous lamprey", minLevel: 22, maxLevel: 26 },
  { label: "Trooper Inkin", minLevel: 50, maxLevel: 50 },
  { label: "Man eating fern", minLevel: 10, maxLevel: 10 },
  { label: "Fakraa the Forsaken", minLevel: 25, maxLevel: 25 },
  { label: "Froglok tuk warder", minLevel: 15, maxLevel: 15 },
  { label: "Froglok tuk shaman", minLevel: 13, maxLevel: 13 },
  { label: "Froglok tuk warrior", minLevel: 11, maxLevel: 11 },
  { label: "Froglok tuk knight", minLevel: 15, maxLevel: 15 },
  { label: "A froglok fisher", minLevel: 5, maxLevel: 5 },
  { label: "Ssessthrass", minLevel: 55, maxLevel: 55 },
  { label: "Dreesix Ghoultongue", minLevel: 25, maxLevel: 25 },
  { label: "Venomwing", minLevel: 25, maxLevel: 25 },
  { label: "Two Tails", minLevel: 25, maxLevel: 25 },
  { label: "Grimewurm", minLevel: 22, maxLevel: 22 },
  { label: "Grizshnok", minLevel: 22, maxLevel: 22 },
  { label: "A giant marsh leech", minLevel: 9, maxLevel: 9 },
  { label: "Zagran the Mad", minLevel: 25, maxLevel: 25 },
  { label: "A scourgewing mosquito", minLevel: 22, maxLevel: 22 },
  { label: "An insatiable devourer", minLevel: 25, maxLevel: 25 },
  { label: "A bloodvein mosquito", minLevel: 13, maxLevel: 13 },
  { label: "A giant morass leech", minLevel: 22, maxLevel: 22 },
  { label: "A giant mosquito", minLevel: 7, maxLevel: 7 },
  { label: "A lesser icebone skeleton", minLevel: 17, maxLevel: 17 },
  { label: "A mire leech", minLevel: 11, maxLevel: 13 },
  { label: "A morass leech", minLevel: 18, maxLevel: 18 },
  { label: "An insatiable nibbler", minLevel: 13, maxLevel: 15 },
  { label: "Blackbone", minLevel: 25, maxLevel: 25 },
  { label: "Bloodskull", minLevel: 25, maxLevel: 25 },
  { label: "Bloodvein", minLevel: 25, maxLevel: 25 },
  { label: "Bulsgor", minLevel: 26, maxLevel: 26 },
  { label: "Deadeye (NPC)", minLevel: 29, maxLevel: 29 },
  { label: "Ebon Bloodrose", minLevel: 25, maxLevel: 25 },
  { label: "Farik the Vile", minLevel: 25, maxLevel: 25 },
  { label: "Froglok Berserker", minLevel: 25, maxLevel: 25 },
  { label: "Froglok Impaler", minLevel: 25, maxLevel: 25 },
  { label: "Giant bloodvein mosquito", minLevel: 22, maxLevel: 22 },
  { label: "Gorge", minLevel: 24, maxLevel: 26 },
  { label: "Greater Skeleton", minLevel: 7, maxLevel: 20 },
  { label: "Grik the Exile", minLevel: 45, maxLevel: 45 },
  { label: "Heartblood Fern", minLevel: 25, maxLevel: 25 },
  { label: "Lesser Charbone Skeleton", minLevel: 17, maxLevel: 19 },
  { label: "Skeleton (Iksar)", minLevel: 4, maxLevel: 4 },
  { label: "Trooper Harkee", minLevel: 50, maxLevel: 50 },
  { label: "Trooper Keat", minLevel: 50, maxLevel: 50 },
  { label: "Trooper Lorgen", minLevel: 50, maxLevel: 50 },
  { label: "Trooper Nilzik", minLevel: 50, maxLevel: 50 },
  { label: "Trooper Nodfod", minLevel: 50, maxLevel: 50 },
];

let added = 0;
let merged = 0;
for (const mob of MOBS) {
  const id = `npc:swamp-of-no-hope:${slug(mob.label)}`;
  const label = mob.label.replace(/ \(Swamp of No Hope\)| \(NPC\)/, "");

  if (hasNode(id)) {
    const node = graph.nodes.find((n: { id: string }) => n.id === id);
    const roles: string[] = node.roles || [];
    if (!roles.includes("mob")) roles.push("mob");
    node.roles = roles;
    node.minLevel = mob.minLevel;
    node.maxLevel = mob.maxLevel;
    merged++;
    continue;
  }
  addNode({ id, label, type: "npc", roles: ["mob"], minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, "zone:swamp-of-no-hope", "located_in");
  added++;
}

save();
console.log(`Migration 296 complete: ${added} npc node(s) added, ${merged} existing npc(s) merged with a mob role, for zone:swamp-of-no-hope`);
