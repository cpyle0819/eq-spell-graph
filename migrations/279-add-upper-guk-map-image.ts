/**
 * Migration 279: add `maps` to zone:upper-guk, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/upper-guk.jpg` downloaded from eqlwiki.com's own
 * `File:Upperguk.jpg`. Legend transcribed verbatim from the numbered list
 * under the map. eqlwiki also has an "Alternate Map" (`Upperguk3.jpg`), a
 * zoomed-in crop of the entrance area re-numbering the same four rooms
 * (11-14) the main map already legends -- skipped as a redundant view of
 * the same floor, not a separate one.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:upper-guk");
if (!zone) throw new Error("zone:upper-guk not found");

zone.data.maps = [
  {
    label: null,
    image: "upper-guk.jpg",
    legend: [
      { key: "1", label: "Zoneline to Lower Guk, Dead Side" },
      { key: "2", label: "Croc Room with Ancient Crocodile who drops Gatorscale Leggings and Gatorscale Sleeves (PH is a saltwater croc, between one and five)" },
      { key: "3", label: "Room with a froglok nokta shaman who drops Globe of Shadow, placeholder Vis Shaman" },
      { key: "4", label: "Zoneline to Lower Guk, Live Side" },
      { key: "5", label: "Zoneline to Lower Guk, Dead Side" },
      { key: "6", label: "Room with A Froglok Summoner, A Froglok Priest, drops Golden Rod used for Enchanter quest (Rod of Insidious Glamour), and A Froglok Shin Knight" },
      { key: "7", label: "Zoneline to Lower Guk, Dead Side" },
      { key: "8", label: "Ladder down Pit" },
      { key: "9", label: "The Pits with Heart Spiders, Secret Room in Water to Dark Elf named Tempus and Skeletal Monk who drops Glowing Mask" },
      { key: "10", label: "Ramp Room with a froglok gaz squire who drops Collar of Undead Protection (common) and Runed Bone Fork (rare)" },
      { key: "11", label: "Mushroom Farm with Fungus Men, also A Fungus Mutant who drops Guk Bracket Mildew (common) and Degenerated Guk Weed (rare)" },
      { key: "12", label: "Room with a froglok idealist, who drops Vial of Egg Whites (common) and Moss Mask (rare), and A Froglok Tonta Knight, who drops Soiled Boots (common)" },
      { key: "13", label: "Room with the froglok warden who drops Elf-Hide Gloves (common) and Troll-Hide Belt (rare), room to north is safe underwater cove" },
      { key: "14", label: "Room with a froglok realist who drops Pouch of Ghoul Ash (common) and Reed Ring (rare)" },
      { key: "15", label: "Temple with a froglok scryer who drops Bracelet of Woven Grass (common) and Shimmering Orb (rare), also Glowing Mask" },
      { key: "16", label: "Room with a froglok necromancer" },
      { key: "17", label: "Barracks with the froglok shin lord who drops Silver-Plated Bracer (common) and Ghoulbane (rare)" },
      { key: "18", label: "Heart Spider Room with a giant heart spider who drops Chitin Shell Shield (common) and Chitin Shell Armor (rare)" },
    ],
  },
];

save();
console.log("Migration 279 complete: maps set on zone:upper-guk");
