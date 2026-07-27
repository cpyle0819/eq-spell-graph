/**
 * Migration 285: add `maps` to zone:new-sebilis-expedition -- see issue #36.
 *
 * `public/maps/new-sebilis-expedition.png` downloaded from eqlwiki.com's own
 * `File:New Sebilis Map Legend 3.0.png` (the page's actual numbered map,
 * distinct from its infobox photo `New_sebilis_expedition.webp`). Legend
 * transcribed verbatim from the numbered list under the map -- every item
 * is a spell/tradeskill vendor or guildmaster, plus one exit.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { id: string }) => n.id === "zone:new-sebilis-expedition");
if (!zone) throw new Error("zone:new-sebilis-expedition not found");

zone.maps = [
  {
    label: null,
    image: "new-sebilis-expedition.png",
    legend: [
      { key: "1", label: "Adventuring Supplies & Parcels (Klok Koglin)" },
      { key: "2", label: "Banker (Quartermaster Zevrex)" },
      { key: "3", label: "Bard Songs (Orator Zikorisy)" },
      { key: "4", label: "Beastlord Guildmaster (Patriarch Zevlex)" },
      { key: "5", label: "Beastlord Spells (Elder Jantiz)" },
      { key: "6", label: "Cleric Spells (Apostate Cakazu)" },
      { key: "7", label: "Druid Spells (Wanderer Rakshaazi)" },
      { key: "8", label: "Enchanter Spells (Manipulator Chasartiz)" },
      { key: "9", label: "Magician Spells (Conjuror Matranak)" },
      { key: "10", label: "Monk Guildmaster (Master Xalg)" },
      { key: "11", label: "Mote Exchange (Constructed Potential)" },
      { key: "12", label: "Necromancer Guildmaster (Mistress Drozlen)" },
      { key: "13", label: "Necromancer Spells (Heretic Mkoriku)" },
      { key: "14", label: "Paladin Spells (Zealot Zorshais)" },
      { key: "15", label: "Ranger Spells (Outrider Zarulm)" },
      { key: "16", label: "Shadowknight Guildmaster (Lady Zleka)" },
      { key: "17", label: "Shadowknight Spells (Crusader Silulika)" },
      { key: "18", label: "Shaman Guildmaster (Hierophant Oxyln)" },
      { key: "19", label: "Shaman Spells (Hierophant Sebanlea)" },
      { key: "20", label: "Smithing Supplies (Klok Lagnoz)" },
      { key: "21", label: "Smithing Supplies (Klok Rento)" },
      { key: "22", label: "Tailoring Supplies (Klok Qyzel)" },
      { key: "23", label: "Tailoring Supplies (Klok Walrot)" },
      { key: "24", label: "Warrior Guildmaster (Commander Riteb)" },
      { key: "25", label: "Wizard Spells (Defector Jabitzu)" },
      { key: "26", label: "Exit to North Ro" },
    ],
  },
];

save();
console.log("Migration 285 complete: maps set on zone:new-sebilis-expedition");
