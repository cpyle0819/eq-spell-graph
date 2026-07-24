/**
 * Migration 209: add `maps` to zone:the-warrens, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * The Warrens is on the P1999-dungeon list (decisions/dungeon-zones-use-
 * p1999-not-eqlwiki.md) but, like the last several dungeon batches, turned
 * out to have a real eqlwiki.com page with a direct title match.
 * `public/maps/the-warrens.jpg` downloaded from eqlwiki's own
 * File:Warrens.jpg -- the page's single "== Map ==" image, with a legend
 * transcribed verbatim (wiki markup stripped) from its numbered list.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:the-warrens");
if (!zone) throw new Error("zone:the-warrens not found");

zone.data.maps = [
  {
    label: null,
    image: "the-warrens.jpg",
    legend: [
      { key: "1", label: "Diseased Room with Muglwump who drops (all with equal chance) Cast Iron Stein, Midnight Sea Mail Coat, Uliorn's Fishing Pole, Soiled Evoker's Robe, Etched Chitin Shield, Helm of Ridossan, and Violet Flame Lantern, and Grodl Ripclaw" },
      { key: "2", label: "Kitchen with Foodmaster Rargnar who drops Barbequed Erudite (Common) and Smithy Rrarrgin who drops Large Empty Crate (Uncommon) and Ye Auld Ball Peen Hammer (Rare)" },
      { key: "3", label: "Batling Caves with Krode the Diviner who drops Krode's Shawl (Rare)" },
      { key: "4", label: "Room with Lorekeeper Roggik who drops Globe of the Everburning Flame (Uncommon)" },
      { key: "5", label: "Room with Warlord Drrig who drops Blood Crusted Two-Handed Sword (Common), secret one-way pit to Batling Caves" },
      { key: "6", label: "Prince's Room with Prince Bragnar who drops Bracer of the Forlorn (Rare), Shield of the Forlorn (Rare), Cloak of the Forlorn (Rare), and Bamboo Splint Coat (Rare)" },
      { key: "7", label: "Training Room with Trainer Daxgrr" },
      { key: "8", label: "Hallway with Jailer Mkrarrg who drops Bronze Shackle Key (Common)" },
      { key: "9", label: "Rat Room with Packmaster Dledsh who drops Packmaster's Lash (Uncommon) and Filth Covered Boots (Rare)" },
      { key: "10", label: "Prison Area" },
      { key: "11", label: "Throne Room with High Shaman Drogik who drops Runed Bokken (Common), Globe of the Everburning Flame (Uncommon), and Odd Cold Iron Necklace (Uncommon), and King Gragnar who drops Forlorn Naginata (Rare), Scepter of the Forlorn (Rare), Crown of the Forlorn (Rare), and Cold Iron Armor (Rare)" },
      { key: "12", label: "Room with Huntmaster Furgrl who drops Forlorn Arrow (Common) and Forlorn Bow (Rare)" },
      { key: "13", label: "Bat Room with Cave Bat Lord who drops Azzar's Dreadful Hat (Uncommon)" },
      { key: "14", label: "Room with The Mighty Bear Paw who drops Bear Paw's Pelt (Rare)" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 209 complete: maps set on zone:the-warrens");
