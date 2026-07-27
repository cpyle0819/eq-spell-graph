/**
 * Migration 291: add `maps` to zone:timorous-deep -- see issue #36.
 *
 * `public/maps/timorous-deep.jpg` downloaded from eqlwiki.com's own
 * `File:Map timdeep.jpg`. Legend transcribed verbatim from the numbered
 * list under the map (items 1-14). The page's own general navigation note
 * about the invisible-wall boat lane in the zone's center isn't a
 * location marker like the rest of the list, so it wasn't given a legend
 * key, same call as The Overthere's un-keyed merchant-greed note.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { id: string }) => n.id === "zone:timorous-deep");
if (!zone) throw new Error("zone:timorous-deep not found");

zone.maps = [
  {
    label: null,
    image: "timorous-deep.jpg",
    legend: [
      { key: "1", label: "Ogre Camp with The Great Oowomp (drops Batfang Headband/Batskull Earring/Bone Armplates/Bone Legplates/Chipped Bone Bracelet/Chipped Bone Collar/Giant Snakespine Belt/Sheer Bone Mask/Turtleshell Helm) and Ugrak da Raider (drops Dark Rust Boots (Rare), Dark Rust Bracer (Very Rare)). The boat to Overthere is at the farthest west brown pier, not the lighter-colored pier with Ogres on it." },
      { key: "2", label: "Spiroc Aviary" },
      { key: "3", label: "Bandit Camp and Fallen Iksar" },
      { key: "4", label: "Bandit Camp" },
      { key: "5", label: "Ship Graveyard with Bandits (Level 14-20)" },
      { key: "6", label: "Underwater Ruins" },
      { key: "7", label: "Ruins with Xiblin Fizzlebik" },
      { key: "8", label: "Chessboard with Alrik Farsight (for Druid and Ranger epics) -- also a Succor point" },
      { key: "9", label: "Elven Outpost with Merchants" },
      { key: "10", label: "Abandoned Druid Ring" },
      { key: "11", label: "Raptor Islands (-8900, 2850)" },
      { key: "12", label: "Floating Iceberg with Halara (drops Grey Fur Cape (Common), Fur Lined Mask (Rare)), and a ground spawn of Crushed Diamonds for Shaman Cannibalize II (Good/Evil) at (-8850, -6040)" },
      { key: "13", label: "Combine Teleportation Towers with underwater tunnel to Teleportation Firepots (-12225, 4370)" },
      { key: "14", label: "Inn with quest NPCs and a Merchant -- Omat Vastsea (Cleric epic) and Dolgin Codslayer (Druid epic, triggers Faydedar)" },
    ],
  },
];

save();
console.log("Migration 291 complete: maps set on zone:timorous-deep");
