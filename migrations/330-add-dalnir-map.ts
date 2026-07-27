/**
 * Migration 330: add `maps` to zone:dalnir -- see issue #41 audit.
 *
 * Three floors sourced from eqlwiki.com's own Dalnir page (action=raw)
 * under "Map": `File:map_dalnir1.jpg` (First Level), `File:map_dalnir2.jpg`
 * (Second Level), and `File:map_dalnir3.jpg` (Third Level) -- all three
 * resolve to live, non-broken uploads. Legend transcribed from the page's
 * own numbered walkthrough for each floor.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { id: string }) => n.id === "zone:dalnir");
if (!zone) throw new Error("zone:dalnir not found");

zone.maps = [
  {
    label: "First Level",
    image: "dalnir-first-level.jpg",
    legend: [
      { key: "1", label: "Entry Room" },
      { key: "2", label: "\"L Room\"" },
      { key: "3", label: "\"The Temple\"" },
      { key: "4", label: "Pit down to Area #4 on the Second Level" },
    ],
  },
  {
    label: "Second Level",
    image: "dalnir-second-level.jpg",
    legend: [
      { key: "1", label: "Teleporter to Warsliks Woods at the Dalnir entrance" },
      { key: "2", label: "\"Shackle Room\" with Kly Imprecator who drops Ancient Coin (Common), Dagger Hilt (Uncommon), Bo Stick (Uncommon), and Robe of Dalnir (Ultra Rare); a coerced crusader who drops Elliptical Veil (Uncommon), Bamboo Bo Stick (Uncommon) and Greenwood Bo Stick (Rare); and a coerced channeler who drops nothing" },
      { key: "3", label: "\"Bedrooms\"" },
      { key: "4", label: "\"Pool Room\" where the pit from Area #4 on the First Level drops to" },
      { key: "5", label: "Room with \"Thistle Lumpy\" (a lumpy goo) who drops Two Handed Practice Sword (Rare) and Grave Sandals (Rare)" },
      { key: "6", label: "Room with \"Carpet Lumpy\" (a lumpy goo) who drops Fighting Baton (Rare) and Worm-eaten Gloves (Rare)" },
      { key: "7", label: "Secret pit trap leading down to Area #7 on the Third Level" },
      { key: "8", label: "\"Checkerboard Room\"" },
    ],
  },
  {
    label: "Third Level",
    image: "dalnir-third-level.jpg",
    legend: [
      { key: "1", label: "\"BBQ Room\"" },
      { key: "2", label: "\"River\"" },
      { key: "3", label: "\"Church\" with Kly Imprecator who drops Sharp Metal Shard (Uncommon) and Bamboo Bo Stick" },
      { key: "4", label: "\"Crusader Room\" with a coerced revenant who drops Defiled Drape of the Brood, Wand of Pain, Rod Segment I, Serpentwood Staff (Rare) and Tattered Tomb Shroud (Rare); a coerced penkeeper who drops a Nickel Key, Sarnak Enforcer (Uncommon) and Robe of the Foci (Rare); and a spectral crusader who drops Bamboo Bo Stick (Rare) and Tattered Arm Wrappings (Rare); the static spawn here has roughly a 21-minute timer" },
      { key: "5", label: "\"Laboratory\" with Kly Imprecator who drops Jagged Metal Shard (Uncommon)" },
      { key: "6", label: "Broken Crypt with a secret one-way door" },
      { key: "7", label: "\"Crossroads\" where the pit from Area #7 on the Second Level drops to" },
      { key: "8", label: "\"Dining Room\" with many Kly" },
      { key: "9", label: "\"Statue Room\" with an undead blacksmith who drops Forge Hammer of Dalnir (Common), Sarnak Enforcer (Rare), and Tattered Leg Wrappings (Rare); and a coerced penkeeper who drops a Nickel Key, Sarnak Enforcer (Uncommon) and Robe of the Foci (Rare)" },
      { key: "10", label: "\"Forge Room\" with a coerced smith and the Always Works forge" },
      { key: "11", label: "\"Overseer Room\" with Kly Overseer and The Kly, who drops Sarnak Headguard" },
      { key: "12", label: "Teleport to Warsliks Woods at the Dalnir entrance" },
    ],
  },
];

save();
console.log("Migration 330 complete: maps set on zone:dalnir");
