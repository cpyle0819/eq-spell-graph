/**
 * Migration 283: add npc nodes (roles: ["mob"]) for zone:ocean-of-tears,
 * per the current unified `npc`/`roles` schema from migration 265
 * (decisions/npc-mob-unification-and-zone-groups.md) -- see issue #36.
 *
 * `Category:Ocean of Tears` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md, 2
 * `tlcontinue` pages) to 71 `{{Namedmobpage}}` candidates: the per-island
 * wildlife from the zone's own map legend (aqua goblins, aviaks, sharks,
 * cyclops, spectres/gargoyles, sisters of Erollisi), the pirate camp
 * (Capt Surestout/Toko Binlittle/Dixl Drool + rogues Dayle Jornin/Zyle
 * Bensmill on the Pirates of Gunthak faction), and a themed "boat
 * traveler" roster on the dock islands -- Qeynos Citizens, Kaladim
 * Citizens, and Wood Elf Faydark's Champions, all full stat-blocked
 * Namedmobpage entries matching the zone's own lore about travelers
 * passing through by boat.
 *
 * Three candidates already existed as `npc:ocean-of-tears:*` quest-giver
 * nodes (Oracle of K`Arnon, Denken Strongpick, Styria Fearnon) -- same
 * duplicate shape migration 265 fixed graph-wide, so this batch unions
 * `roles` and copies level data onto them. "Oracle of K`Arnon" needed an
 * explicit id override: `slug()` on the backtick produces
 * `oracle-of-k-arnon`, but the existing node (predating the current
 * `slug()` helper) is `npc:ocean-of-tears:oracle-of-karnon` -- without the
 * override this would have shipped a silent duplicate instead of a merge.
 *
 * Two exclusions: "A Boat" (blank zone, not a creature, same call as
 * Toxxulia's excluded "A Boat") and "A Shark (Qeynos Aqueducts)" (own
 * `zone` field names only Qeynos Aqueducts despite the category tag --
 * the zone's real shark entry is the separate "A Shark" page, whose own
 * level string's `13-17 (Qeynos Aqueducts)` breakout confirms the base
 * `3-17` is the value that actually applies here).
 *
 * One explicit per-zone level override: "A Cyclops"'s own level string is
 * `29-32 (40-42 only the ones that spawn in OOT)` -- the parenthetical is
 * this zone's own carve-out, so 40-42 was used instead of the base range,
 * the opposite of the usual "use the base value" default.
 *
 * One flagged edge case, not excluded: five of the "boat traveler" roster
 * (Donoven Blurr, Ran Aldorne, Lorna Shearsin, Zachariah Reigh, Dunvan
 * Mercwinn) have descriptions that volunteer "no coin, no loot" -- unlike
 * Southern Desert of Ro's excluded "Tran" (whose own description states
 * "Killing does not provide experience"), nothing here says they're
 * unkillable or non-XP, and they carry real distinct AC/HP/damage stats
 * like every other candidate in the cluster (some of which do drop
 * Purity Belt/Dwarven Blood/etc.) -- kept per "stats over reward
 * richness," but worth a second look if this pattern recurs elsewhere.
 */

import { loadGraph } from "./_lib";

const GUARD_RE = /^(A |An )?Guard /;
const ID_OVERRIDES: Record<string, string> = {
  "Oracle of K`Arnon": "npc:ocean-of-tears:oracle-of-karnon",
};

const { graph, hasNode, slug, save } = loadGraph(import.meta.dir);

const MOBS: { label: string; minLevel: number; maxLevel: number }[] = [
  { label: "Quag Maelstrom", minLevel: 45, maxLevel: 45 },
  { label: "Oracle of K`Arnon", minLevel: 36, maxLevel: 36 },
  { label: "Allizewsaur", minLevel: 50, maxLevel: 50 },
  { label: "Gull Skytalon", minLevel: 35, maxLevel: 35 },
  { label: "An alluring siren", minLevel: 12, maxLevel: 13 },
  { label: "A Greater Skeleton", minLevel: 7, maxLevel: 20 },
  { label: "A Goblin Headmaster", minLevel: 24, maxLevel: 26 },
  { label: "Capt Surestout", minLevel: 21, maxLevel: 21 },
  { label: "Dayle Jornin", minLevel: 14, maxLevel: 14 },
  { label: "Gornit", minLevel: 34, maxLevel: 36 },
  { label: "Dixl Drool", minLevel: 20, maxLevel: 20 },
  { label: "Toko Binlittle", minLevel: 17, maxLevel: 17 },
  { label: "Valaryn Elben", minLevel: 25, maxLevel: 25 },
  { label: "Brawn", minLevel: 22, maxLevel: 22 },
  { label: "Styria Fearnon", minLevel: 61, maxLevel: 61 },
  { label: "Antinime", minLevel: 22, maxLevel: 24 },
  { label: "Ascania Halvbin", minLevel: 23, maxLevel: 25 },
  { label: "Euboea Delewyn", minLevel: 25, maxLevel: 25 },
  { label: "Larisa Gelrith", minLevel: 25, maxLevel: 25 },
  { label: "Paeonia Purnn", minLevel: 25, maxLevel: 25 },
  { label: "Sister of Erollisi", minLevel: 7, maxLevel: 13 },
  { label: "Boog Mudtoe", minLevel: 18, maxLevel: 18 },
  { label: "Goob Mudtoe", minLevel: 22, maxLevel: 22 },
  { label: "An Aqua Goblin", minLevel: 9, maxLevel: 11 },
  { label: "A Seafury Cyclops", minLevel: 38, maxLevel: 42 },
  { label: "A Cyclops", minLevel: 40, maxLevel: 42 },
  { label: "Tegea Prendyn", minLevel: 25, maxLevel: 25 },
  { label: "Phocaea Hapspenn", minLevel: 25, maxLevel: 25 },
  { label: "A Shark", minLevel: 3, maxLevel: 17 },
  { label: "Sentry Xyrin", minLevel: 19, maxLevel: 19 },
  { label: "A Gargoyle", minLevel: 19, maxLevel: 19 },
  { label: "Soarin Brightfeather", minLevel: 33, maxLevel: 37 },
  { label: "Dragoon Artellin", minLevel: 21, maxLevel: 21 },
  { label: "Dragoon Darl", minLevel: 20, maxLevel: 20 },
  { label: "Denken Strongpick", minLevel: 55, maxLevel: 55 },
  { label: "Nerbilik", minLevel: 20, maxLevel: 20 },
  { label: "Tainted seafury cyclops", minLevel: 46, maxLevel: 46 },
  { label: "Corrupted seafury cyclops", minLevel: 52, maxLevel: 52 },
  { label: "Wiltin Windwalker", minLevel: 32, maxLevel: 32 },
  { label: "An isle goblin wizard", minLevel: 16, maxLevel: 16 },
  { label: "An isle goblin chieftan", minLevel: 23, maxLevel: 25 },
  { label: "An isle goblin warrior", minLevel: 22, maxLevel: 22 },
  { label: "An isle goblin shaman", minLevel: 11, maxLevel: 11 },
  { label: "An isle goblin headhunter", minLevel: 22, maxLevel: 22 },
  { label: "An isle goblin", minLevel: 16, maxLevel: 19 },
  { label: "Guardian of K`Arnon", minLevel: 42, maxLevel: 42 },
  { label: "A reef shark", minLevel: 4, maxLevel: 4 },
  { label: "A pirate", minLevel: 22, maxLevel: 22 },
  { label: "A buccaneer", minLevel: 27, maxLevel: 27 },
  { label: "Aqua goblin sacrifice", minLevel: 9, maxLevel: 9 },
  { label: "Raotin Teawel", minLevel: 15, maxLevel: 15 },
  { label: "An island goblin headhunter", minLevel: 23, maxLevel: 23 },
  { label: "A Spectre", minLevel: 33, maxLevel: 37 },
  { label: "An aviak quetzel", minLevel: 21, maxLevel: 23 },
  { label: "An aviak starling", minLevel: 9, maxLevel: 11 },
  { label: "An aviak tanager", minLevel: 17, maxLevel: 18 },
  { label: "An aviak turaco", minLevel: 13, maxLevel: 15 },
  { label: "Donoven Blurr", minLevel: 25, maxLevel: 25 },
  { label: "Dunvan Mercwinn", minLevel: 25, maxLevel: 25 },
  { label: "Elona Tunbrin", minLevel: 24, maxLevel: 24 },
  { label: "Fendlemend Figlefop", minLevel: 55, maxLevel: 55 },
  { label: "Glendl Vargnus", minLevel: 25, maxLevel: 25 },
  { label: "Hugan Tunbrin", minLevel: 25, maxLevel: 25 },
  { label: "Lorna Shearsin", minLevel: 25, maxLevel: 25 },
  { label: "Naya Driftwood", minLevel: 15, maxLevel: 15 },
  { label: "Ran Aldorne", minLevel: 25, maxLevel: 25 },
  { label: "Seplawishinl Bladeblight", minLevel: 60, maxLevel: 60 },
  { label: "Zachariah Reigh", minLevel: 25, maxLevel: 25 },
  { label: "Zyle Bensmill", minLevel: 14, maxLevel: 14 },
];

let added = 0;
let merged = 0;
for (const mob of MOBS) {
  const id = ID_OVERRIDES[mob.label] ?? `npc:ocean-of-tears:${slug(mob.label)}`;
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
      data: { id: `e-located_in-${graph.edges.length + 1}`, source: id, target: "zone:ocean-of-tears", type: "located_in" },
    });
    added++;
  }
}

save();
console.log(`Migration 283 complete: ${added} npc node(s) added, ${merged} existing npc(s) merged with a mob role, for zone:ocean-of-tears`);
