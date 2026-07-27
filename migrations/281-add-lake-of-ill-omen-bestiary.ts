/**
 * Migration 281: add npc nodes (roles: ["mob"]) for zone:lake-of-ill-omen,
 * per the current unified `npc`/`roles` schema from migration 265
 * (decisions/npc-mob-unification-and-zone-groups.md) -- see issue #36.
 *
 * `Category:Lake of Ill Omen` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md, 3
 * `tlcontinue` pages) to 73 `{{Namedmobpage}}` candidates: the sarnak
 * fortress roster (courier through gem oracle, Weaponsmith Ko`Zirr, an
 * Imperial Escort, the Chancellor/Advisor/Lord/Warlord standalones), the
 * goblin camps (scout/watcher/hunter/brawler/battlemaster/whelp), the
 * skeleton variants (decaying/charbone/icebone/greater, several Iksar-
 * flavored), sabertooth cats (kitten through tigress), barracuda variants,
 * and a 9-member "Trooper `<name>`" cluster (all level 50, all zone =
 * Lake of Ill Omen) matching the zone's own lore about the Brood of
 * Kotiz's trainees hunting sarnak.
 *
 * Three candidates already existed as `npc:lake-of-ill-omen:*` quest-giver
 * nodes (Trooper Vaurk, Professor Akabao, Warlord Geot) -- same duplicate
 * shape migration 265 fixed graph-wide, so this batch unions `roles` and
 * copies level data onto them rather than creating a second node.
 *
 * Two exclusions: "A Goblin Warrior" and "Scalebone skeleton" both carry
 * the category tag but their own `zone` fields name only Misty Thicket/
 * Butcherblock Mountains and Field of Bone/Kurn's Tower respectively, no
 * Lake of Ill Omen at all -- same miscategorized-candidate pattern as
 * Lower Guk's excluded "A froglok tsu shaman". One near-miss the other
 * way: "An Explorer"'s wikitext has two separate `| zone = ...` template
 * instances (a duplicate-key quirk, not a per-zone level breakout) --
 * Firiona Vie *and* Lake of Ill Omen, the latter matching the zone's own
 * map legend item 7 ("Tower with Explorers") -- kept.
 */

import { loadGraph } from "./_lib";

const GUARD_RE = /^(A |An )?Guard /;

const { graph, hasNode, slug, save } = loadGraph(import.meta.dir);

const MOBS: { label: string; minLevel: number; maxLevel: number }[] = [
  { label: "Chancellor of Di`Zok", minLevel: 40, maxLevel: 40 },
  { label: "A sarnak courier", minLevel: 14, maxLevel: 14 },
  { label: "Lord Gorelik", minLevel: 40, maxLevel: 40 },
  { label: "Advisor Sh'Orok", minLevel: 30, maxLevel: 35 },
  { label: "Warlord Geot", minLevel: 51, maxLevel: 51 },
  { label: "An Iksar footpad", minLevel: 5, maxLevel: 7 },
  { label: "Professor Akabao", minLevel: 59, maxLevel: 59 },
  { label: "A Sarnak legionnaire", minLevel: 22, maxLevel: 24 },
  { label: "A sarnak recruit", minLevel: 21, maxLevel: 25 },
  { label: "A goblin battlemaster", minLevel: 14, maxLevel: 16 },
  { label: "Charbone Skeleton", minLevel: 24, maxLevel: 27 },
  { label: "A Sarnak Flunkie", minLevel: 16, maxLevel: 16 },
  { label: "Icebone Skeleton", minLevel: 22, maxLevel: 24 },
  { label: "A Sarnak Hatchling", minLevel: 3, maxLevel: 4 },
  { label: "Crusader Deezin", minLevel: 50, maxLevel: 50 },
  { label: "Crusader Swype", minLevel: 50, maxLevel: 50 },
  { label: "A Sabertooth Tiger", minLevel: 18, maxLevel: 21 },
  { label: "A Sabertooth Cat", minLevel: 10, maxLevel: 12 },
  { label: "A Sabertooth Tigress", minLevel: 14, maxLevel: 16 },
  { label: "A Goblin Scout", minLevel: 2, maxLevel: 4 },
  { label: "A Sarnak gem oracle", minLevel: 27, maxLevel: 27 },
  { label: "An Explorer", minLevel: 26, maxLevel: 26 },
  { label: "Trooper Vaurk", minLevel: 40, maxLevel: 40 },
  { label: "A Sarnak Dragoon", minLevel: 27, maxLevel: 28 },
  { label: "A Bloodgill Goblin", minLevel: 35, maxLevel: 39 },
  { label: "A Sabertooth Grimalkin", minLevel: 22, maxLevel: 25 },
  { label: "Greater Scalebone", minLevel: 14, maxLevel: 15 },
  { label: "A sarnak adherent", minLevel: 14, maxLevel: 25 },
  { label: "A sarnak revenant", minLevel: 25, maxLevel: 25 },
  { label: "A Goblin Watcher", minLevel: 3, maxLevel: 5 },
  { label: "A Bloodgill Marauder", minLevel: 40, maxLevel: 40 },
  { label: "Xenevorash", minLevel: 65, maxLevel: 65 },
  { label: "Astral Projection (LOIO)", minLevel: 50, maxLevel: 50 },
  { label: "A sabertooth kitten", minLevel: 2, maxLevel: 2 },
  { label: "A deepwater barracuda", minLevel: 34, maxLevel: 38 },
  { label: "A lesser charbone skeleton", minLevel: 17, maxLevel: 17 },
  { label: "A goblin hunter", minLevel: 8, maxLevel: 10 },
  { label: "War boned skeleton", minLevel: 20, maxLevel: 22 },
  { label: "A decaying skeleton (Iksar)", minLevel: 1, maxLevel: 1 },
  { label: "A skeleton (Iksar)", minLevel: 4, maxLevel: 4 },
  { label: "Trooper Larrin", minLevel: 50, maxLevel: 50 },
  { label: "Trooper Selbat", minLevel: 50, maxLevel: 50 },
  { label: "Decaying skeleton", minLevel: 1, maxLevel: 1 },
  { label: "A sabertooth cub", minLevel: 3, maxLevel: 5 },
  { label: "A Goblin Whelp (Kunark)", minLevel: 1, maxLevel: 1 },
  { label: "Corrupted barracuda", minLevel: 43, maxLevel: 46 },
  { label: "Tainted barracuda", minLevel: 35, maxLevel: 36 },
  { label: "Vorash", minLevel: 59, maxLevel: 59 },
  { label: "Weaponsmith Ko`Zirr", minLevel: 45, maxLevel: 45 },
  { label: "Iksar exile", minLevel: 22, maxLevel: 26 },
  { label: "A Sarnak youth", minLevel: 10, maxLevel: 10 },
  { label: "A Sarnak revealer", minLevel: 25, maxLevel: 29 },
  { label: "A Sarnak conscript", minLevel: 19, maxLevel: 19 },
  { label: "A stuffed barracuda", minLevel: 10, maxLevel: 10 },
  { label: "Trooper Frogzin", minLevel: 50, maxLevel: 50 },
  { label: "A Sarnak broodling", minLevel: 8, maxLevel: 8 },
  { label: "Sarnak crypt raider", minLevel: 10, maxLevel: 10 },
  { label: "A sabertooth kit", minLevel: 8, maxLevel: 8 },
  { label: "A goblin brawler", minLevel: 13, maxLevel: 15 },
  { label: "A lead explorer", minLevel: 20, maxLevel: 25 },
  { label: "An imperial Escort", minLevel: 39, maxLevel: 40 },
  { label: "Goblin Warlord (Lake of Ill Omen)", minLevel: 23, maxLevel: 25 },
  { label: "Greater icebone", minLevel: 29, maxLevel: 33 },
  { label: "Greater Skeleton", minLevel: 7, maxLevel: 20 },
  { label: "Greater skeleton (Iksar)", minLevel: 11, maxLevel: 13 },
  { label: "Pond Sturgeon", minLevel: 14, maxLevel: 18 },
  { label: "Trooper Curlish", minLevel: 50, maxLevel: 50 },
  { label: "Trooper Digdul", minLevel: 50, maxLevel: 50 },
  { label: "Trooper Eshzik", minLevel: 50, maxLevel: 50 },
  { label: "Trooper Hegwez", minLevel: 50, maxLevel: 50 },
  { label: "Trooper Kylpog", minLevel: 50, maxLevel: 50 },
];

let added = 0;
let merged = 0;
for (const mob of MOBS) {
  const id = `npc:lake-of-ill-omen:${slug(mob.label)}`;
  const role = GUARD_RE.test(mob.label) ? "guard" : "mob";

  if (hasNode(id)) {
    const node = graph.nodes.find((n: { data: { id: string } }) => n.data.id === id);
    const roles: string[] = node.data.roles || [];
    if (!roles.includes(role)) roles.push(role);
    node.data.roles = roles;
    node.data.minLevel = mob.minLevel;
    node.data.maxLevel = mob.maxLevel;
    merged++;
  } else {
    graph.nodes.push({
      data: { id, label: mob.label, type: "npc", roles: [role], minLevel: mob.minLevel, maxLevel: mob.maxLevel },
    });
    graph.edges.push({
      data: { id: `e-located_in-${graph.edges.length + 1}`, source: id, target: "zone:lake-of-ill-omen", type: "located_in" },
    });
    added++;
  }
}

save();
console.log(`Migration 281 complete: ${added} npc node(s) added, ${merged} existing npc(s) merged with a mob role, for zone:lake-of-ill-omen`);
