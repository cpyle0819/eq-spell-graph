/**
 * Migration 335: add `maps` to zone:warsliks-woods -- see issue #41 audit.
 *
 * Two sections sourced from eqlwiki.com's own Warsliks Woods page
 * (action=raw) under "Map": `File:map_warslikswood.jpg` (the main zone)
 * and `File:map_warwoodstunels.jpg` (the tunnels) -- both resolve to live,
 * non-broken uploads. Legend transcribed from the page's own list for
 * each section.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { id: string }) => n.id === "zone:warsliks-woods");
if (!zone) throw new Error("zone:warsliks-woods not found");

zone.maps = [
  {
    label: "Warslik's Wood",
    image: "warsliks-woods.jpg",
    legend: [
      { key: "1", label: "Goblin Fort with Pit Fighter Dob and Grachnist the Destroyer" },
      { key: "2", label: "Hut with Goblins (the island to the northwest is where Ssolet Dnaas is located)" },
      { key: "3", label: "Hut with outcast Iksar" },
      { key: "4", label: "Hut with outcast Iksar" },
      { key: "5", label: "Hut with Goblins" },
      { key: "6", label: "Hut with Goblins" },
      { key: "7", label: "Hut with Goblins" },
      { key: "8", label: "Forest Giant Hut" },
      { key: "9", label: "Hut with outcast Iksar and Iksar Bandit Lord who drops Bracer of Scavenging" },
      { key: "10", label: "\"Bandit Lake\" -- lake surrounded by outcast Iksar" },
      { key: "11", label: "Hut with outcast Iksar" },
      { key: "12", label: "Forest Giant Fort" },
      { key: "13", label: "Cabilis Outpost Ruins -- merchants selling patch hide armor, newbie weapons, food items, and survival gear" },
    ],
  },
  {
    label: "Tunnels",
    image: "warsliks-woods-tunnels.jpg",
    legend: [
      { key: "A", label: "Tunnels to Dalnir (with Brute caves)" },
      { key: "B", label: "Iksar Tunnels to Lake of Ill Omen" },
    ],
  },
];

save();
console.log("Migration 335 complete: maps set on zone:warsliks-woods");
