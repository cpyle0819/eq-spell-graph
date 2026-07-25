/**
 * Migration 261: add `maps` to zone:surefall-glade, in the array shape
 * from migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/surefall-glade.jpg` downloaded from eqlwiki.com's own
 * /images/7/70/Surefallglade.jpg. Legend transcribed verbatim from the
 * numbered list under the map -- these are the Ranger/Druid guild trainers
 * and guildmaster the map itself calls out, kept as map-legend content
 * (same call as Temple of Solusek Ro's quest-giver legend) rather than
 * bestiary entries, since the bestiary migration (262) excludes this
 * zone's guildmasters per CLAUDE.md.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:surefall-glade");
if (!zone) throw new Error("zone:surefall-glade not found");

zone.data.maps = [
  {
    label: null,
    image: "surefall-glade.jpg",
    legend: [
      { key: "1", label: "The Caves filled with Bears and Mammoth" },
      { key: "2", label: "Ranger Trainer" },
      { key: "3", label: "Archery Range with Ranger Trainer and Merchant who sells Arrow-making Supplies" },
      { key: "4", label: "Ranger Hall with Ranger Guildmaster and Bard" },
      { key: "5", label: "Shop with Ranger Trainer and Merchants who sell Bow-making Supplies, Bows, Throwing Weapons, Spells, Sharp Weapons, Food and Other Goods" },
      { key: "6", label: "Merchant selling Basic Smithing Molds" },
      { key: "7", label: "Jaggedpine Treefolk with Druid Trainer and Merchants who sell Arrow-making Supplies, Druid Weapons, Spells, Food and Other Goods" },
      { key: "8", label: "Druid Guildmaster and Surefall Druid Teleport destination" },
    ],
  },
];

save();
console.log("Migration 261 complete: maps set on zone:surefall-glade");
