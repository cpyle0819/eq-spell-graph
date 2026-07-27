/**
 * Migration 318: add `maps` to zone:the-wakening-land -- see issue #36.
 *
 * eqlwiki.com's own File:Map wakening lands.jpg upload is broken; same
 * user-approved P1999 exception as migration 315 (decisions/eqlwiki-
 * broken-map-images.md). `public/maps/wakening-land.jpg` downloaded from
 * wiki.project1999.com's own File:Map_wakening_lands.jpg. Legend
 * transcribed verbatim (wiki markup stripped) from that page's own "Map
 * Location Key" section.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { id: string }) => n.id === "zone:the-wakening-land");
if (!zone) throw new Error("zone:the-wakening-land not found");

zone.maps = [
  {
    label: null,
    image: "wakening-land.jpg",
    legend: [
      { key: "1", label: "Unicorn Valley" },
      { key: "2", label: "Sifaye Town with Countess Silveana" },
      { key: "3", label: "Tower with portal to the Plane of Growth and Merchant who sells Velious Druid Portal spells" },
      { key: "4", label: "Two ruins with A suit of sentient armor" },
      { key: "5", label: "Empty Building" },
      { key: "6", label: "Giant Building Site" },
      { key: "7", label: "Geonid Caverns with Phenocryst" },
      { key: "8", label: "Dragon Circle with Wuoshi" },
      { key: "9", label: "Cavern with Holgresh and Grand Vizier Poolakacha`tei" },
    ],
  },
];

save();
console.log("Migration 318 complete: maps set on zone:the-wakening-land");
