/**
 * Migration 130: add `maps` to zone:halas, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/halas.jpg` downloaded from eqlwiki.com's own
 * /images/e/ed/Zone_halas.jpg. Legend transcribed from the numbered
 * paragraph under the map on eqlwiki.com's Halas page, split into
 * individual entries.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:halas");
if (!zone) throw new Error("zone:halas not found");

zone.data.maps = [
  {
    label: null,
    image: "halas.jpg",
    legend: [
      { key: "1", label: "Pit of Doom - the Warrior guild w/ merchants selling adventuring supplies and weapons" },
      { key: "2", label: "Rose McDowell, the bags and boxes merchant" },
      { key: "3", label: "Temple of the Tribunal - Shaman guild w/ alchemy ingredient merchants and the Halas Soulbinder" },
      { key: "4", label: "Dok's Cigars - General supplies and pottery supply merchants" },
      { key: "5", label: "The Golden Torc - Tailoring supply merchant, armor merchant selling steel and iron torques, and a pottery wheel inside with a kiln out back" },
      { key: "6", label: "Rogue's guild behind the Bank" },
      { key: "7", label: "Bank, General goods merchant on ground floor w/ weapons merchant and Rogue trainers up top, and Constructed Potential outside" },
      { key: "8", label: "Mac's Kilts - Tailoring supplies merchants (including Cindl) selling cloth and leather armor w/ small sewing kits and patterns" },
      { key: "9", label: "McDaniels Smokes and Spirits - Merchants selling alcohol, baking supplies, smithing supplies, and a Warrior trainer; also a smithing supplies merchant and an oven out front" },
      { key: "10", label: "McDonald's Fire Cider - Merchants selling alcohol, brewing, and general supplies w/ a brewing barrel inside" },
      { key: "11", label: "McPherson's Bloody Blades - Merchants selling chain and plate armor, fletching supplies, and weapon molds w/ a forge outside" },
      { key: "12", label: "McQuaid's Dark Stout - Brewing Barrel w/ bartenders selling alcohol inside and a smithing supplies merchant out back" },
      { key: "13", label: "Yee Magik - Merchants selling alchemy supplies, blunt weapons, medicine bags, dufrenite, turquoise, and various potions and crystals" },
      { key: "14", label: "The Bonny Mermaid - Fishing supplies merchant" },
      { key: "15", label: "Baking and Pottery supplies merchants" },
      { key: "16", label: "The Kennels - Beastlord and Berserker guilds with pens housing sled dogs" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 130 complete: maps set on zone:halas");
