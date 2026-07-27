/**
 * Migration 328: add `maps` to zone:kaesora -- see issue #41 audit.
 *
 * Two floors sourced from eqlwiki.com's own Kaesora page (action=raw)
 * under "Map Location Key": `File:map_kaesora1.jpg` (Main Level) and
 * `File:map_kaesora23.jpg` (Five Towers) -- both resolve to live,
 * non-broken uploads. Legend transcribed from the page's own numbered
 * walkthrough for each section.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { id: string }) => n.id === "zone:kaesora");
if (!zone) throw new Error("zone:kaesora not found");

zone.maps = [
  {
    label: "Main Level",
    image: "kaesora-main-level.jpg",
    legend: [
      { key: "1", label: "Room with Reaver of Xalgoz who drops Rod of Battle, Deathwatch Sword, Truesilver Armor" },
      { key: "2", label: "\"Runelord Room\" with spiders and Strathbone Runelord who drops Kylong War Dagger, Blade of Fiery Lamentations (Common), and Dagger of Frost (Rare)" },
      { key: "3", label: "\"Frenzied Room\" with Frenzied Strathbone who drops Mask of the Eight Eyes (Common) and Cryptrobber's Knife (Rare)" },
      { key: "4", label: "\"Backyard\" with Warder of Xalgoz who drops Spine Piercer (Uncommon) and Deadwood Stave" },
      { key: "5", label: "\"Library\" with spectral librarian who drops Spectral Shroud (Common) and Spirit Tome (Uncommon); tortured librarian who drops Kunzar Mantle (Common), Spirit Tome (Uncommon) and Sage's Battle Staff (Rare); Spectral Guardian who drops Shield of Spectral Essence (Rare); failed crypt raider who drops Terraz Ton Coin, Spear of Mortification (Uncommon) and Kylong Hunting Knife (Rare); and a piece of a medallion ground spawn for the Key of Veeshan on the second floor of the library" },
      { key: "6", label: "Hut with Hungered Ravener who drops Icy Blade (Common) and Luminary Two Handed Sword" },
      { key: "7", label: "Broken Floor Room; dropping down leads to a pathway to the exit and also to the Church area" },
    ],
  },
  {
    label: "Five Towers",
    image: "kaesora-five-towers.jpg",
    legend: [
      { key: "1", label: "\"Church\" with Xalgoz who drops Xalgozian Fang (Common), Blade of Xalgoz (Common), Staff of the Dreaded Gaze (Ultra Super Duper Rare)" },
      { key: "A", label: "Tunnels labeled A connect together" },
    ],
  },
];

save();
console.log("Migration 328 complete: maps set on zone:kaesora");
