/**
 * Migration 199: add `maps` to zone:nagafen-s-lair, in the array shape
 * from migration 125 (decisions/zone-multi-floor-maps.md) -- see issue
 * #36.
 *
 * Nagafen's Lair is on the P1999-dungeon list (decisions/dungeon-zones-
 * use-p1999-not-eqlwiki.md) but, like the last several dungeon batches,
 * turned out to have a real eqlwiki.com page with a direct title match.
 * `public/maps/nagafens-lair.jpg` downloaded from eqlwiki's own
 * File:Nagafenslair.jpg -- the page's single "== Map ==" image, with a
 * legend transcribed verbatim (wiki markup stripped) from its numbered
 * list. The page's separate "== Alternate Map ==" image
 * (File:Map_nagafens_lair_2.jpg) has no numbered legend of its own and is
 * skipped as redundant with the primary labeled map already sourced.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:nagafen-s-lair");
if (!zone) throw new Error("zone:nagafen-s-lair not found");

zone.data.maps = [
  {
    label: null,
    image: "nagafens-lair.jpg",
    legend: [
      { key: "1", label: '"Pool Room"' },
      { key: "2", label: '"Window Room"' },
      { key: "3", label: '"Circle Room"' },
      { key: "4", label: '"Efreeti Room" with Efreeti Lord Djarn, who drops Golden Efreeti Boots (Common) and Djarn\'s Amethyst Ring (Rare)' },
      { key: "5", label: '"Noble Room" with kobold noble, who drops Staff of Writhing (Common) and Petrified Erudite Heart Amulet (Rare)' },
      { key: "6", label: '"King Room" with Solusek kobold king (drops Runed Mithril Bracer (Common), Fleshripper (Rare)) and Targin the Rock (drops Code of Zan Fi, part of "Royals")' },
      { key: "7", label: '"Priest Room" with kobold priest, who drops Carnal Pauldrons (Common) and Mithril Breastplate (Rare) (part of "Royals")' },
      { key: "8", label: '"Champion Room" with kobold champion, who drops Shield of the Slain Unicorn (Common) and Painbringer (Rare) (part of "Royals")' },
      { key: "9", label: "Block Crusher Trap" },
      { key: "10", label: '"Lily Pads" stepping stones across river of lava' },
      { key: "11", label: '"Death Beetle Room" with death beetle, who drops Black Chitin Leggings (Common) and Death Scarab Gland (Rare)' },
      { key: "12", label: '"Nox Corridor" with noxious spider, who drops Green Silken Drape (Common) and Golden Chitin Bracer (Rare)' },
      { key: "13", label: '"Stone Spider Room" with stone spider, who drops Crystalline Orb (Common) and Brown Chitin Protector (Rare)' },
      { key: "14", label: '"Collector\'s Room" with guano harvester (long wander path, invisible), who drops Large Soiled Bag (Common) and Cloak of Shadows (Rare)' },
      { key: "15", label: "Entrance to Fire Giant Castle -- many doors in the castle aren't marked on the map" },
      { key: "16", label: '"Throne Room" with King Tranix, who drops Polished Mithril Torque (Common) and Crown of King Tranix (Rare) (Raid Instance Only)' },
      { key: "17", label: '"Skarlon Room" with Warlord Skarlon, who drops Mithril Vambraces (Common), Mithril Greaves (Rare) and Razing Sword of Skarlon (ultra-rare) (Raid Instance Only)' },
      { key: "18", label: '"Drawbridge Room" with two levers to lower the drawbridge at the southern edge; bridge raises on its own after a period of time' },
      { key: "19", label: 'Nagafen\'s Lair proper, with Magus Rokyl (drops Polished Mithril Mask (Common), Rokyls Channelling Crystal (Rare)) and Lord Nagafen (Raid Instance Only)' },
      { key: "x", label: "Pit trap into lava" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 199 complete: maps set on zone:nagafen-s-lair");
