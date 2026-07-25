/**
 * Migration 259: add `maps` to zone:rathe-mountains, in the array shape
 * from migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/rathe-mountains.jpg` downloaded from eqlwiki.com's own
 * /images/e/e5/Zone_rathemtns.jpg. Legend transcribed verbatim from the
 * numbered list under the map.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:rathe-mountains");
if (!zone) throw new Error("zone:rathe-mountains not found");

zone.data.maps = [
  {
    label: null,
    image: "rathe-mountains.jpg",
    legend: [
      { key: "1", label: "Orc Camp" },
      { key: "2", label: "Rune Stone with Tabien the Goodly" },
      { key: "3", label: "Protected Stone Ring, surrounded by Unkempt Druids" },
      { key: "4", label: "Gypsies with Combine Weapons, Compass, Herbs and Food (Cynthia)" },
      { key: "5", label: "Inn, Hut with Merchant Darfumpel Zirubbel who sells Gems nearby" },
      { key: "6", label: "Hill with Stone Arms reaching to the sky, Bandit Camp on top, Giant Skeletons and Lizard Men on sides of Hill" },
      { key: "7", label: "Haunted Tower with Findlegrob" },
      { key: "8", label: "Altar protected by named beetles (Zaza)" },
      { key: "9", label: "Lizard Man Camp" },
      { key: "10", label: "Temple protected by Troll Shaman and Shadow Knight" },
      { key: "11", label: "Camp with Trolls and Ogres, selling Goods, Normal Weapons, and Leather and Small Sewing Kit and Patterns" },
      { key: "12", label: "Altar protected by named beetles (Ankh)" },
      { key: "13", label: "Inn" },
      { key: "14", label: "Orc Camp" },
      { key: "15", label: "Paladin Camp" },
      { key: "16", label: "Gypsy Camp selling Food" },
      { key: "17", label: "Ruined Town with Glaron the Wicked" },
      { key: "18", label: "Sphinx (Ankhefenmut)" },
      { key: "19", label: "Region filled with Hill Giants, Cyclops, and Giant Skeletons" },
      { key: "20", label: "Sphinx (Zazamoukh)" },
      { key: "21", label: "Lizard Man Camp" },
      { key: "22", label: "Lizard Man Camp" },
      { key: "23", label: "Orc Camp" },
      { key: "24", label: "Haunted Stone Ring. Kazzel D`Leryt roams between here and the hill between 22 and 23" },
      { key: "25", label: "Haunted Tower with Bindlegrob and Sindlegrob" },
    ],
  },
];

save();
console.log("Migration 259 complete: maps set on zone:rathe-mountains");
