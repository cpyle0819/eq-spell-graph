/**
 * Migration 187: add `maps` to zone:solusek-s-eye, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/solusek-s-eye.jpg` downloaded from eqlwiki.com's own
 * /images/6/6d/Solusekseye.jpg. The page's legend is an ordered HTML list
 * with no explicit numbers -- keys below are the list's own 1-based
 * position, matching how the wiki itself numbers it.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:solusek-s-eye");
if (!zone) throw new Error("zone:solusek-s-eye not found");

zone.data.maps = [
  {
    label: null,
    image: "solusek-s-eye.jpg",
    legend: [
      { key: "1", label: "Captain's Room with Inferno Goblin Captain, who drops Charred Boots (Common) and Charred Gauntlets (Rare)" },
      { key: "2", label: "Room with Kindle, who drops Obsidian Ring (Common) and Impskin Gloves (Rare)" },
      { key: "3", label: "Efreeti Pits with Blazing Elementals and Reckless Efreeti, who drops Platinum Armband (Common) and Obsidian Flamberge (Rare)" },
      { key: "4", label: "Lava Elemental Room with lava elemental, who drops Lava Potion (Common) and Runed Lava Pendant (Rare)" },
      { key: "5", label: "Doorway to gnome fort's upper level (not shown) with Captain Bipnubble, who drops Brick of Blue Ore (Common) and Gnomish Environment Suit (Rare)" },
      { key: "6", label: "Room that spawns the roaming Singe, who drops Obsidian Bead Hoop (Common) and Drakescale Belt (Rare)" },
      { key: "7", label: "Gnomish merchant Marfen Binkdirple, who sells Bag of the Tinkerers" },
      { key: "8", label: "Gabbie's Room with Gabbie Mardoddle, who drops Mithril Quill (Common) and Molten Cloak (Rare), and CWG Model CX, who drops Clockwork Oil Stout" },
      { key: "9", label: "Courtyard that spawns the roaming CWG Model EXG, who drops Charred Guardian Shield (Common) and Charred Guardian Breastplate (Rare)" },
      { key: "10", label: "Hallway with Kobold predator, who drops Kobold-Hide Boots (Common) and Obsidian Shard (Rare)" },
      { key: "11", label: "Foreman's Room with flame goblin foreman, who drops Foreman's Tunic (Common) and Obsidian Scimitar (Rare)" },
      { key: "12", label: "Window Room" },
      { key: "13", label: "The Pit" },
      { key: "14", label: "Room with Goblin Merchant" },
      { key: "15", label: "Bar with Fire Goblin Bartender, who drops Drake-Hide Leggings (Common) and Drake-Hide Sleeves (Rare)" },
      { key: "16", label: "Drunkard Room with Fire Goblin Drunkard, who drops Frothy Goblin Tonic (Common) and Fire Crystal Staff (Rare)" },
      { key: "17", label: "King Room (behind Throne Room) with Solusek Goblin King, who drops Ring of Goblin Lords (Common) and Scepter of Flame (Rare)" },
      { key: "18", label: "Jail Hallway leading to Inferno Goblin Torturer, who drops Turquoise Eyepatch (Common) and Memento Box (Rare)" },
      { key: "19", label: "Mage Room with Solusek Mage, who drops Firewalker Boots (Rare)" },
      { key: "20", label: "Lynada's Room with Lynada the Exiled, who drops Sparkle, and Goblin High Shaman, who drops Glowing Stone Band (Common) and Platinum Dragon Totem (Rare)" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 187 complete: maps set on zone:solusek-s-eye");
