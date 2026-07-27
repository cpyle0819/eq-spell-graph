/**
 * Migration 278: add `maps` to zone:lake-of-ill-omen, in the array shape
 * from migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * Three images from eqlwiki.com's own Lake of Ill Omen page: the main
 * outdoor zone (`File:map_lakeofillomen.jpg`), and a "Sarnak Fortress/
 * Goblin Fortress" section pairing two more images -- the fortress
 * interior (`File:map_loio_sarnakfortress.jpg`, with a 2-item legend) and
 * the goblin tunnels (`File:map_loio_gobtunnels.jpg`, no numbered legend of
 * its own on the page). Main map's legend transcribed verbatim from its
 * numbered list; the lettered items (A/B/C, tunnel/astral-projection notes)
 * and the zone-line coordinate aside are omitted, same as Steamfont
 * Mountains' precedent for non-numbered asides.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:lake-of-ill-omen");
if (!zone) throw new Error("zone:lake-of-ill-omen not found");

zone.data.maps = [
  {
    label: null,
    image: "lake-of-ill-omen.jpg",
    legend: [
      { key: "1", label: "Cabilis Outpost Ruins - Merchants selling Patch Hide Armor, Newbie Weapons, Survival Gear, and Food Items" },
      { key: "2", label: "Goblin Hunter Outpost" },
      { key: "3", label: "Haunted Ruins" },
      { key: "4", label: "Hut with outcast Iksar" },
      { key: "5", label: "Empty Hut" },
      { key: "6", label: "Goblin Ruins" },
      { key: "7", label: "Tower with Explorers" },
      { key: "8", label: "Sunken Temple of Veksar" },
      { key: "9", label: "Goblin Ruins" },
      { key: "10", label: "Sarnak Fortress" },
      { key: "11", label: "Goblin-Infested Tower" },
      { key: "12", label: "Haunted Ruins" },
      { key: "13", label: "\"The Windmill\" - Tower with Professor Akabao and Merchant who sells Poison Supplies" },
    ],
  },
  {
    label: "Sarnak Fortress",
    image: "lake-of-ill-omen-sarnak-fortress.jpg",
    legend: [
      { key: "1", label: "Weaponsmith Ko`Zirr and Imperial Escorts" },
      { key: "2", label: "Chancellor Di'Zok's Hall with Chancellor of Di`Zok who drops Jade Chokidai Prod" },
    ],
  },
  {
    label: "Goblin Tunnels",
    image: "lake-of-ill-omen-goblin-tunnels.jpg",
    legend: [],
  },
];

save();
console.log("Migration 278 complete: maps set on zone:lake-of-ill-omen");
