/**
 * Migration 231: add mob nodes for zone:paineel, per the `mob` node type
 * from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * `Category:Paineel` narrowed via the MediaWiki API method
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md) to 78
 * `{{Namedmobpage}}`-tagged candidates. Paineel is an evil Erudite
 * necromancer/shadow knight/cleric city, same shape as Grobb/Felwithe/High
 * Keep/Oggok -- every stat-blocked candidate was kept regardless of role
 * (guards, bankers, library staff, guild leadership), same precedent, since
 * an evil city's own citizenry reads as hostile/KOS to this app's assumed
 * good/neutral player, not as friendly civic NPCs the way Freeport/North
 * Qeynos's roster does (see migration 227's writeup for that split and why
 * it doesn't apply here). "Marsa Folor" and "Nadara Reloclen" (Banker
 * class) and "Librarian Kesler"/"Library assistant" (civilian-sounding
 * names, full Warrior stat blocks) were kept on that same "stats over
 * name" basis.
 *
 * Excluded: "A Decaying Skeleton" and "A Fire Beetle", whose own `zone`
 * field reads "Various" with no Paineel-specific mention in either page's
 * description -- same "must confirm zone" call as West Freeport's shared-
 * name creature exclusions (migration 227). "Avatar of Dread" and "Avatar
 * of Fright" -- the summoned bosses of the zone's own `The Summoning of
 * Dread`/`The Summoning of Fright` quests -- were excluded for a different
 * reason: every combat field on both pages is a bare "?", so there's no
 * stated level to record, consistent with the sourced-facts-only policy
 * (decisions/mob-node-type.md) that already excluded Grobb's stat-blank
 * "Basher Ganbaku" rather than guess one.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:paineel";

const MOBS = [
  { slug: "dzan-amo", label: "Dzan Amo", minLevel: 35, maxLevel: 35 },
  { slug: "sern-adolia", label: "Sern Adolia", minLevel: 61, maxLevel: 61 },
  { slug: "nivold-predd", label: "Nivold Predd", minLevel: 61, maxLevel: 61 },
  { slug: "azzar-habbib", label: "Azzar Habbib", minLevel: 25, maxLevel: 25 },
  { slug: "royal-guard-sheltuin", label: "Royal Guard Sheltuin", minLevel: 50, maxLevel: 50 },
  { slug: "royal-guard-lilkus", label: "Royal Guard Lilkus", minLevel: 50, maxLevel: 50 },
  { slug: "shevra-kollintar", label: "Shevra Kollintar", minLevel: 61, maxLevel: 61 },
  { slug: "guard-korlack", label: "Guard Korlack", minLevel: 16, maxLevel: 16 },
  { slug: "guard-menbuknar", label: "Guard Menbuknar", minLevel: 10, maxLevel: 10 },
  { slug: "noclin-saah", label: "Noclin Saah", minLevel: 15, maxLevel: 15 },
  { slug: "gerot-kastane", label: "Gerot Kastane", minLevel: 50, maxLevel: 50 },
  { slug: "a-kobold-runt", label: "A Kobold Runt", minLevel: 1, maxLevel: 1 },
  { slug: "davorre-bloodthorn", label: "Davorre Bloodthorn", minLevel: 61, maxLevel: 61 },
  { slug: "auhrik-sietka", label: "Auhrik Siet'ka", minLevel: 61, maxLevel: 61 },
  { slug: "duriek-bloodpool", label: "Duriek Bloodpool", minLevel: 55, maxLevel: 55 },
  { slug: "atdehim-sqonci", label: "Atdehim Sqonci", minLevel: 45, maxLevel: 45 },
  { slug: "miadera-shadowfyre", label: "Miadera Shadowfyre", minLevel: 50, maxLevel: 50 },
  { slug: "noclins-pet", label: "Noclin's Pet", minLevel: 4, maxLevel: 4 },
  { slug: "sejako-mujan", label: "Sejako Mujan", minLevel: 40, maxLevel: 40 },
  { slug: "ernax-the-scholar", label: "Ernax the Scholar", minLevel: 35, maxLevel: 35 },
  { slug: "tormented-soul", label: "Tormented Soul", minLevel: 50, maxLevel: 50 },
  { slug: "coriante-verisue", label: "Coriante Verisue", minLevel: 61, maxLevel: 61 },
  { slug: "medoris-flalzm", label: "Medoris Flalzm", minLevel: 35, maxLevel: 35 },
  { slug: "guard-lesunra", label: "Guard Lesunra", minLevel: 15, maxLevel: 15 },
  { slug: "guard-perelin", label: "Guard Perelin", minLevel: 14, maxLevel: 15 },
  { slug: "guard-lehlufa", label: "Guard Lehlufa", minLevel: 15, maxLevel: 16 },
  { slug: "guard-pomnares", label: "Guard Pomnares", minLevel: 15, maxLevel: 15 },
  { slug: "guard-lomanres", label: "Guard Lomanres", minLevel: 14, maxLevel: 15 },
  { slug: "guard-heridion", label: "Guard Heridion", minLevel: 10, maxLevel: 10 },
  { slug: "marsa-folor", label: "Marsa Folor", minLevel: 50, maxLevel: 50 },
  { slug: "nadara-reloclen", label: "Nadara Reloclen", minLevel: 50, maxLevel: 50 },
  { slug: "a-black-bat", label: "A black bat", minLevel: 1, maxLevel: 1 },
  { slug: "a-pack-rat", label: "A pack rat", minLevel: 1, maxLevel: 1 },
  { slug: "a-spirit-chanter", label: "A spirit chanter", minLevel: 45, maxLevel: 45 },
  { slug: "alaria-mujan", label: "Alaria Mujan", minLevel: 40, maxLevel: 40 },
  { slug: "an-undead-rat", label: "An undead rat", minLevel: 4, maxLevel: 4 },
  { slug: "antus-shelbra", label: "Antus Shelbra", minLevel: 61, maxLevel: 61 },
  { slug: "derena-leflor", label: "Derena Leflor", minLevel: 11, maxLevel: 11 },
  { slug: "elia-athrex", label: "Elia Athrex", minLevel: 5, maxLevel: 5 },
  { slug: "guard-abbilash", label: "Guard Abbilash", minLevel: 18, maxLevel: 18 },
  { slug: "guard-abrebla", label: "Guard Abrebla", minLevel: 34, maxLevel: 35 },
  { slug: "guard-ackin", label: "Guard Ackin", minLevel: 36, maxLevel: 36 },
  { slug: "guard-buldoral", label: "Guard Buldoral", minLevel: 23, maxLevel: 23 },
  { slug: "guard-captain-latorl", label: "Guard Captain Latorl", minLevel: 40, maxLevel: 40 },
  { slug: "guard-exclorpt", label: "Guard Exclorpt", minLevel: 24, maxLevel: 24 },
  { slug: "guard-ezrothe", label: "Guard Ezrothe", minLevel: 25, maxLevel: 25 },
  { slug: "guard-hetorzuz", label: "Guard Hetorzuz", minLevel: 27, maxLevel: 27 },
  { slug: "guard-ishvlor", label: "Guard Ishvlor", minLevel: 35, maxLevel: 35 },
  { slug: "guard-kellolonren", label: "Guard Kellolonren", minLevel: 15, maxLevel: 15 },
  { slug: "guard-lecknar", label: "Guard Lecknar", minLevel: 16, maxLevel: 16 },
  { slug: "guard-lelton", label: "Guard Lelton", minLevel: 18, maxLevel: 18 },
  { slug: "guard-lidozarnn", label: "Guard Lidozarnn", minLevel: 27, maxLevel: 27 },
  { slug: "guard-mertanor", label: "Guard Mertanor", minLevel: 37, maxLevel: 37 },
  { slug: "guard-nextloxtl", label: "Guard Nextloxtl", minLevel: 24, maxLevel: 26 },
  { slug: "guard-notzxatl", label: "Guard Notzxatl", minLevel: 24, maxLevel: 24 },
  { slug: "guard-pendleir", label: "Guard Pendleir", minLevel: 22, maxLevel: 26 },
  { slug: "guard-polzdurn", label: "Guard Polzdurn", minLevel: 23, maxLevel: 24 },
  { slug: "guard-potren", label: "Guard Potren", minLevel: 37, maxLevel: 37 },
  { slug: "guard-rireboln", label: "Guard Rireboln", minLevel: 15, maxLevel: 15 },
  { slug: "guard-sheltuin", label: "Guard Sheltuin", minLevel: 37, maxLevel: 37 },
  { slug: "guard-tynaryn", label: "Guard Tynaryn", minLevel: 24, maxLevel: 25 },
  { slug: "guard-yerlash", label: "Guard Yerlash", minLevel: 23, maxLevel: 28 },
  { slug: "keeshla-levlora", label: "Keeshla Levlora", minLevel: 14, maxLevel: 14 },
  { slug: "librarian-kesler", label: "Librarian Kesler", minLevel: 50, maxLevel: 50 },
  { slug: "library-assistant", label: "Library assistant", minLevel: 24, maxLevel: 24 },
  { slug: "mandaril-dark-knife", label: "Mandaril Dark Knife", minLevel: 61, maxLevel: 61 },
  { slug: "ninna-flalzm", label: "Ninna Flalzm", minLevel: 35, maxLevel: 35 },
  { slug: "overlord-virate-manaar", label: "Overlord Virate Manaar", minLevel: 55, maxLevel: 55 },
  { slug: "shwara-volerno", label: "Shwara Volerno", minLevel: 61, maxLevel: 61 },
  { slug: "talloth-vara", label: "Talloth Vara", minLevel: 50, maxLevel: 50 },
  { slug: "tatalros-the-cruel", label: "Tatalros the Cruel", minLevel: 61, maxLevel: 61 },
  { slug: "telan-buvare", label: "Telan Buvare", minLevel: 13, maxLevel: 13 },
  { slug: "velana-kelmuza", label: "Velana Kelmuza", minLevel: 12, maxLevel: 12 },
  { slug: "verolk-kishneal", label: "Verolk Kishneal", minLevel: 11, maxLevel: 11 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:paineel:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 231 complete: ${added} mob node(s) added for Paineel`);
