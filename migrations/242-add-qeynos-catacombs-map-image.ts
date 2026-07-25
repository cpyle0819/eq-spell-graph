/**
 * Migration 242: add `maps` to zone:qeynos-catacombs, in the array shape
 * from migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/qeynos-catacombs.jpg` downloaded from eqlwiki.com's own
 * /images/1/1a/QeynosCats1.jpg (the "Qeynos Aqueducts" page -- migration
 * 239 merged zone:qeynos-aqueducts into this node as the same zone under
 * two names). Legend transcribed verbatim, exit letters (A-G) then
 * numbered points (1-17) as the page presents them.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:qeynos-catacombs");
if (!zone) throw new Error("zone:qeynos-catacombs not found");

zone.data.maps = [
  {
    label: null,
    image: "qeynos-catacombs.jpg",
    legend: [
      { key: "A", label: "Exit to Secret Entrance in Newbie Area of North Qeynos" },
      { key: "B", label: "Exit to Pool between Crow's Nest and Monk Guild in North Qeynos" },
      { key: "C", label: "Exit to Rogue's Guild in North Qeynos, Pits fall into Area #14" },
      { key: "D", label: "Exit to Water by Magic Users Guild Halls in South Qeynos" },
      { key: "E", label: "Exit to Hidden Entrance beneath Grounds of Fate" },
      { key: "F", label: "Exit to Water near to the Bank" },
      { key: "G", label: "Exit to Water in the Bay near Docks" },
      { key: "1", label: "Spawn Area for Vin Moltor and an investigator" },
      { key: "2", label: "Various NPCs appear here" },
      { key: "3", label: "An undead knight who drops Limestone Ring" },
      { key: "4", label: "Bloated Alligator who drops Alligator Egg" },
      { key: "5", label: "An injured rat who drops Alligator Tooth Earring" },
      { key: "6", label: "Mercenaries with a shady mercenary who drops Thick Black Cape" },
      { key: "7", label: "Drosco and A Nesting Rat who drops Golden Locket" },
      { key: "8", label: "Temple of Bertoxxulous - 8a: Enchanter, Magician, and Shadow Knight Trainers, Banker, Merchants selling Spells and Weapons; 8b: Warrior, Wizard, and Necromancer Trainers, Merchants selling Necromancer Spells and Equipment; 8c: Shadow Knight and Cleric Trainers" },
      { key: "9", label: "Sewer Sentinels" },
      { key: "10", label: "Cuburt spawn area" },
      { key: "11", label: "Frogloks" },
      { key: "12", label: "An injured brigand" },
      { key: "13", label: "An exhausted guard" },
      { key: "14", label: "Shark Pool with two lvl 17 a shark" },
      { key: "15", label: "Smuggler Camps with a smuggler, a courier and Malka Rale" },
      { key: "16", label: "Various NPCs and Beggar Wyllin spawn here" },
      { key: "17", label: "Thug Camp with a thug" },
    ],
  },
];

save();
console.log("Migration 242 complete: maps set on zone:qeynos-catacombs");
