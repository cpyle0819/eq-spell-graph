/**
 * Migration 197: add `maps` to zone:lower-guk, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * Lower Guk is on the P1999-dungeon list (decisions/dungeon-zones-use-
 * p1999-not-eqlwiki.md) but, like the last several dungeon batches, turned
 * out to have a real eqlwiki.com page with a direct title match (no
 * redirect). The page splits the dungeon into "Map of Live Side" and "Map
 * of Dead Side", each with its own image and numbered legend list --
 * `public/maps/lower-guk-live.jpg`/`lower-guk-dead.jpg` downloaded from
 * eqlwiki's own File:Lguklive.jpg/Lgukdead.jpg. Legend entries transcribed
 * verbatim (wiki markup stripped) from each side's list. The page's
 * separate "Alternate Maps and Zone Guide (Quester of Norrath)" section
 * (4 more images, a continuous 1-30 legend spanning all of them with no
 * clean per-image split) is skipped as redundant with the two primary,
 * per-image-labeled maps already sourced.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:lower-guk");
if (!zone) throw new Error("zone:lower-guk not found");

zone.data.maps = [
  {
    label: "Live Side",
    image: "lower-guk-live.jpg",
    legend: [
      { key: "A", label: "Zone line to Upper Guk" },
      { key: "1", label: "Shin Knight Room" },
      { key: "2", label: '"Elder Room" with a minotaur elder, who drops Chrysoberyl Talisman (Common) and Carved Ivory Mask (Rare), as well as Brother Raster, who drops Idol of Zan Fi; pit in tunnel to south leads into room with the Elder' },
      { key: "3", label: "The Maze" },
      { key: "4", label: "Live Side Setup Area, relatively safe area to set up at and pull to" },
      { key: "5", label: '"Three Mino Room" with two Minotaurs' },
      { key: "6", label: "Room with a minotaur patriarch, who drops Azure Sleeves (Common) and Ebony Bladed Sword (Rare)" },
      { key: "7", label: '"Jail Room". Slaythe the Slayer spawns in a dead end just north of this room and drops Broken Bow Part B; does not spawn in the Jail Room itself' },
      { key: "8", label: "Ledge with an evil eye, who drops Bag of Sewn Evil-Eye (and formerly Manastone)" },
      { key: "9", label: '"Noble Room" with a froglok noble, who drops White Gold Necklace (Rare) and Gilded Cloth (Common)' },
      { key: "10", label: '"Live Keep" with three floors: middle floor with A Froglok Yun Priest (drops Silver-Plated Leggings (Common), Amethyst Bracelet (Rare)), bottom floor with a froglok crusader (drops Runed Falchion (Common), Mithril-Runed Tunic (Rare))' },
      { key: "11", label: '"Huge Elemental Room" with a huge water elemental' },
      { key: "12", label: '"King Prep Room"' },
      { key: "13", label: '"Herbalist Room" with a froglok herbalist, who drops Mithril Frog Totem (Common) and Shimmering White Shroud (Rare)' },
      { key: "14", label: '"King Room" -- the froglok king, who drops Crown of the Froglok Kings (Common) and Mithril Two-Handed Sword (Rare); a froglok tactician, who drops Black Tome with Silver Runes (Common) and Platinum Tiara (Rare). Note: this room has a one-way exit to Innothule Swamp, right outside the entrance to Upper Guk.' },
    ],
  },
  {
    label: "Dead Side",
    image: "lower-guk-dead.jpg",
    legend: [
      { key: "A/B/C", label: "Zone lines to Upper Guk" },
      { key: "D", label: "Underground tunnel to D on Level Three" },
      { key: "1", label: '"Waterfall Room" with Scepter of Tears on the ground' },
      { key: "2", label: "Waterfall" },
      { key: "3", label: "Room with the ghoul lord, who drops Skull-shaped Barbute (Common) and Short Sword of the Ykesha (Rare)" },
      { key: "4", label: '"Hand Room" with a reanimated hand, who drops Serpentine Bracer (Common) and Adamantite Band (Rare), plus a Wizard Rod on the ground' },
      { key: "5", label: '"Archmagi Room" with the ghoul arch magus, who drops Silversilk Leggings (Common) and Shining Metallic Robes (Rare)' },
      { key: "6", label: '"Bedroom" or "BR"' },
      { key: "7", label: '"Frenzied Room" with a frenzied ghoul, who drops Moonstone Ring (Common) and Flowing Black Silk Sash (Rare)' },
      { key: "8", label: '"Spider Room"' },
      { key: "9", label: '"Slave Room"' },
      { key: "10", label: '"GIB Room" with Greater Ice Bone Skeletons; tunnel on lower level beneath this room is considered "Safe Hall"' },
      { key: "11", label: '"Sentinel Spawn" with a ghoul sentinel, who drops Dark Mail Gauntlets (Common) and Brigandine Tunic (Rare)' },
      { key: "12", label: "Area with a basalt gargoyle(s), who drop Basalt Carapace -- one of them can see invis" },
      { key: "13", label: '"Ritualist Spawn" -- a ghoul ritualist, who drops Embroidered Black Cape (Common) and Embroidered Black Sleeves (Rare)' },
      { key: "14", label: '"Store Room" or "SR" or "Ass Sup Room" with a ghoul assassin (drops Mask of Deception (Common), Serrated Bone Dirk (Rare)) and a ghoul supplier (drops Light Burlap Sack (Common), Thick Banded Belt (Rare))' },
      { key: "15", label: '"Savant Room" with a ghoul savant, who drops Enameled Black Mace (Common) and Enameled Black Chestplate (Rare)' },
      { key: "16", label: '"Cavalier Room" with a ghoul cavalier, who drops Adamantite Epaulets (Common) and Dark Reaver (Rare)' },
      { key: "17", label: '"Sage Room" with a ghoul sage (drops Braided Cinch Cord (Common), Runed Cowl (Rare)) and a ghoul scribe (drops Parchment of Flayed Skin (Common), Gorgon Feather Quill (Rare))' },
      { key: "18", label: '"Executioner Room" with a ghoul executioner, who drops Executioners Hood (Common) and An Executioners Axe (Rare)' },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 197 complete: maps set on zone:lower-guk");
