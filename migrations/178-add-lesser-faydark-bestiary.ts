/**
 * Migration 178: add mob nodes for zone:lesser-faydark, per the `mob` node
 * type from migration 060 (decisions/mob-node-type.md) -- see issue #36.
 *
 * Sourced via the MediaWiki API technique
 * (decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md):
 * Category:Lesser Faydark's 165 pages narrowed to 72 {{Namedmobpage}}-
 * tagged candidates. Unlike its neighbor Greater Faydark, this zone has no
 * real city -- only a small Wood Elf Ranger Outpost (map location #10) --
 * so most of the 72 are real creatures rather than vendors/guards. The 10
 * excluded as that outpost's own garrison (Bryn Fynndel, Cylas Delbrin,
 * Faril Elvebryn, Galwyn Geldin, Glyndur Tindel, Gundel Elorion, Mywyn
 * Tinendel, Sarawyn Amorfin, Vynn Thrildur, Glidara Myllar) all share the
 * "Emerald Warriors"/"Kelethin Merchants" faction tag from Greater
 * Faydark's own garrison (migration 176) and the same level-25 stat block.
 *
 * Several ambiguous "Description needed" candidates were confirmed as real
 * farmable mobs via their own page prose rather than faction alone: Bin
 * Fiddlekins/Saben Tucross/Trudo Frugrin (a gnome-faction camp -- Saben's
 * page: "kill her... she's back", a known solo-farming camp), Kalayia
 * Woodwhisper (explicitly one of several placeholder spawns alongside "a
 * fae drake, a faerie maiden, a giant spider..." on a shared spawn cycle),
 * Queen Nasheeji ("designer...confirmed he created this rare spawn...
 * spawns from a spiderling"), Ivie Bramblefoot (a wandering mob with its
 * own patrol path and spawn cycle), and Happ Dremblenod ("Gnome Magician,
 * will summon a random Elemental pet... Perfect for AFK XP"). "A skeleton"
 * states "4-18 / 4-6 (Befallen) / 1-6 (Qeynos Aqueducts)" -- only the
 * unqualified 4-18 figure is used, not the other zones' numbers.
 *
 * Excluded for no resolvable numeric level: Talisyn Stormwing, Lady Nidra
 * the Escaped, and Ytharisth Nerishar (all blank "?").
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:lesser-faydark";

const MOBS = [
  { slug: "crookstinger", label: "Crookstinger", minLevel: 8, maxLevel: 8 },
  { slug: "a-skeleton", label: "A Skeleton", minLevel: 4, maxLevel: 18 },
  { slug: "orc-legionnaire", label: "Orc Legionnaire", minLevel: 12, maxLevel: 13 },
  { slug: "dragoon-szorn", label: "Dragoon Szorn", minLevel: 45, maxLevel: 45 },
  { slug: "teir-dal-elite", label: "Teir`Dal Elite", minLevel: 30, maxLevel: 30 },
  { slug: "shadowman-leader", label: "Shadowman Leader", minLevel: 31, maxLevel: 35 },
  { slug: "ghoul-boss", label: "Ghoul Boss", minLevel: 32, maxLevel: 32 },
  { slug: "gearheart", label: "Gearheart", minLevel: 26, maxLevel: 26 },
  { slug: "a-rancorous-ghast", label: "A Rancorous Ghast", minLevel: 12, maxLevel: 12 },
  { slug: "a-brownie-outcast", label: "A Brownie Outcast", minLevel: 32, maxLevel: 32 },
  { slug: "bin-fiddlekins", label: "Bin Fiddlekins", minLevel: 30, maxLevel: 30 },
  { slug: "saben-tucross", label: "Saben Tucross", minLevel: 22, maxLevel: 22 },
  { slug: "trudo-frugrin", label: "Trudo Frugrin", minLevel: 21, maxLevel: 21 },
  { slug: "kalayia-woodwhisper", label: "Kalayia Woodwhisper", minLevel: 22, maxLevel: 22 },
  { slug: "bracken-underbrush", label: "Bracken Underbrush", minLevel: 18, maxLevel: 18 },
  { slug: "jayla-nybright", label: "Jayla Nybright", minLevel: 12, maxLevel: 12 },
  { slug: "kayla-nybright", label: "Kayla Nybright", minLevel: 12, maxLevel: 12 },
  { slug: "thistle-underbrush", label: "Thistle Underbrush", minLevel: 25, maxLevel: 25 },
  { slug: "princess-joleena", label: "Princess Joleena", minLevel: 24, maxLevel: 24 },
  { slug: "shayla-nybright", label: "Shayla Nybright", minLevel: 12, maxLevel: 12 },
  { slug: "tayla-nybright", label: "Tayla Nybright", minLevel: 12, maxLevel: 12 },
  { slug: "larik-z-vole", label: "Larik Z`Vole", minLevel: 17, maxLevel: 17 },
  { slug: "a-brownie", label: "A Brownie", minLevel: 15, maxLevel: 15 },
  { slug: "a-brownie-farmer", label: "A Brownie Farmer", minLevel: 15, maxLevel: 15 },
  { slug: "a-brownie-guard", label: "A Brownie Guard", minLevel: 45, maxLevel: 45 },
  { slug: "a-faerie", label: "A Faerie", minLevel: 17, maxLevel: 17 },
  { slug: "a-faerie-maiden", label: "A Faerie Maiden", minLevel: 8, maxLevel: 8 },
  { slug: "a-fairy-guard", label: "A Fairy Guard", minLevel: 25, maxLevel: 25 },
  { slug: "cognoggin", label: "Cognoggin", minLevel: 13, maxLevel: 13 },
  { slug: "priestess-llandra", label: "Priestess Llandra", minLevel: 45, maxLevel: 45 },
  { slug: "teir-dal-prophet", label: "Teir`Dal Prophet", minLevel: 30, maxLevel: 30 },
  { slug: "queen-nasheeji", label: "Queen Nasheeji", minLevel: 10, maxLevel: 10 },
  { slug: "whimsy-larktwitter", label: "Whimsy Larktwitter", minLevel: 16, maxLevel: 16 },
  { slug: "orc-centurion", label: "Orc Centurion", minLevel: 3, maxLevel: 10 },
  { slug: "orc-chief", label: "Orc Chief", minLevel: 18, maxLevel: 22 },
  { slug: "a-pixie-trickster", label: "A Pixie Trickster", minLevel: 2, maxLevel: 2 },
  { slug: "a-pixie-prankster", label: "A Pixie Prankster", minLevel: 4, maxLevel: 4 },
  { slug: "old-dimshimmer", label: "Old Dimshimmer", minLevel: 12, maxLevel: 12 },
  { slug: "equestrielle-the-corrupted", label: "Equestrielle the Corrupted", minLevel: 40, maxLevel: 40 },
  { slug: "a-fae-drake", label: "A Fae Drake", minLevel: 5, maxLevel: 5 },
  { slug: "brownie-scout", label: "Brownie Scout", minLevel: 38, maxLevel: 42 },
  { slug: "a-giant-spider", label: "A Giant Spider", minLevel: 7, maxLevel: 9 },
  { slug: "ivie-bramblefoot", label: "Ivie Bramblefoot", minLevel: 20, maxLevel: 20 },
  { slug: "mina-glimmerwing", label: "Mina Glimmerwing", minLevel: 20, maxLevel: 20 },
  { slug: "corrupted-brownie", label: "Corrupted Brownie", minLevel: 51, maxLevel: 51 },
  { slug: "equestrielle", label: "Equestrielle", minLevel: 40, maxLevel: 40 },
  { slug: "a-pixie-jongleur", label: "A Pixie Jongleur", minLevel: 17, maxLevel: 17 },
  { slug: "a-monarch-fae-drake", label: "A Monarch Fae Drake", minLevel: 11, maxLevel: 11 },
  { slug: "tainted-brownie", label: "Tainted Brownie", minLevel: 45, maxLevel: 45 },
  { slug: "happ-dremblenod", label: "Happ Dremblenod", minLevel: 35, maxLevel: 35 },
  { slug: "a-dark-elf-courier", label: "A Dark Elf Courier", minLevel: 16, maxLevel: 16 },
  { slug: "a-bandit", label: "A Bandit", minLevel: 9, maxLevel: 12 },
  { slug: "a-faerie-guard", label: "A Faerie Guard", minLevel: 24, maxLevel: 26 },
  { slug: "a-shadowed-man", label: "A Shadowed Man", minLevel: 24, maxLevel: 26 },
  { slug: "a-wasp-sentinel", label: "A Wasp Sentinel", minLevel: 4, maxLevel: 4 },
  { slug: "a-wasp-soldier", label: "A Wasp Soldier", minLevel: 3, maxLevel: 3 },
  { slug: "an-emporer-fae-drake", label: "An Emporer Fae Drake", minLevel: 14, maxLevel: 16 },
  { slug: "grynnaf-einoom", label: "Grynnaf Einoom", minLevel: 14, maxLevel: 14 },
  { slug: "pained-unicorn", label: "Pained Unicorn", minLevel: 60, maxLevel: 60 },
];

let added = 0;
for (const mob of MOBS) {
  const id = `mob:lesser-faydark:${mob.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: mob.label, type: "mob", minLevel: mob.minLevel, maxLevel: mob.maxLevel });
  addEdge(id, ZONE_ID, "located_in");
}

save();
console.log(`Migration 178 complete: ${added} mob node(s) added for Lesser Faydark`);
