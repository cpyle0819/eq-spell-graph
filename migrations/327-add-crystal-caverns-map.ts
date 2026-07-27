/**
 * Migration 327: add `maps` to zone:crystal-caverns -- see issue #41 audit.
 *
 * Three sections sourced from eqlwiki.com's own Crystal Caverns page
 * (action=raw) under "Map Location Key": `File:map_crystal_caverns1.jpg`
 * (The Crystal Caverns / orc tunnels), `File:map_crystal_caverns2.jpg`
 * (The Well), and `File:map_crystal_caverns3.jpg` (Froststone, the Coldain
 * town) -- all three resolve to live, non-broken uploads. Legend
 * transcribed from the page's own bulleted walkthrough for each section.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { id: string }) => n.id === "zone:crystal-caverns");
if (!zone) throw new Error("zone:crystal-caverns not found");

zone.maps = [
  {
    label: "The Crystal Caverns",
    image: "crystal-caverns-tunnels.jpg",
    legend: [
      { key: "1", label: "Orc Bridge" },
      { key: "2", label: "The Chasm" },
      { key: "3", label: "Broken Bridge with Stalag Terrors" },
      { key: "4", label: "Rib Bridge" },
      { key: "5", label: "Great Hall with Stalag Terrors" },
      { key: "6", label: "Room with a stalag terror who drops Crystal Fiber (Uncommon); a terror carver who drops Crystal Covered Shroud (Common); a hollow crystal who drops Crystal Fiber (Common) and Froststone Stein (Rare); outside, a life leech who drops Chipped Velium Amulet (Common) and Blackened Crystalline Robe (Ultra Rare), and a terror carver who drops Stalagterror Spine Spear (Common); and Ghost of Burdael who drops Onyxbrand (quest: The Spirit of Garzicor)" },
      { key: "7", label: "Geonid Tunnels with a gem collector and a focus gem" },
      { key: "8", label: "Room with Queen Dracnia who drops Sceptre of the Coldain Ancients (Always), Crystalline Robes (Uncommon), Messenger of the Queen (Rare); Crystal Purifier who drops Crystal Lined Slippers (Rare); a crystal lurker who drops Spider Fang Choker (Common); and nearby a drachnid retainer who drops Crystallized Two Handed Sword (Common), Crystallized Sword (Rare), Glowing Velium Axe (Rare), and Crystal Webshield (Rare), and a crystal grinder who drops Crystal Grinder (Common)" },
    ],
  },
  {
    label: "The Well",
    image: "crystal-caverns-well.jpg",
    legend: [
      { key: "1", label: "The Dead End" },
      { key: "2", label: "The Ice Hall" },
      { key: "3", label: "Bottom of the \"Well\" pull spot, nearby spawns Foreman Rixact" },
      { key: "4", label: "Orc Bridge" },
      { key: "*", label: "Lettered spots connect to their corresponding letter on the other section of the map" },
    ],
  },
  {
    label: "Froststone",
    image: "crystal-caverns-froststone.jpg",
    legend: [
      { key: "1", label: "Lower Room with a merchant who sells alcohol" },
      { key: "2", label: "Upper Room with banker Kramble Gemshard" },
      { key: "3", label: "Room with a merchant who sells alcohol" },
      { key: "4", label: "Upper Room with a merchant who sells food, water, bandages, and other goods; Lower Room with Captain Dunstan Coldheart" },
      { key: "5", label: "Lower Room with a merchant who sells food, water, bandages, and other goods" },
    ],
  },
];

save();
console.log("Migration 327 complete: maps set on zone:crystal-caverns");
