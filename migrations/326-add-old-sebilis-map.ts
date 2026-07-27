/**
 * Migration 326: add `maps` to zone:old-sebilis -- see issue #41 audit.
 *
 * Two floors sourced from eqlwiki.com's own Old Sebilis page (action=raw),
 * `File:Map_sebilis1.jpg` (First Level) and `File:Map_sebilis2.jpg`
 * (Second Level) -- both resolve to live, non-broken uploads. Legend
 * transcribed from the page's own numbered `<ul>` walkthrough, including
 * item drops as the source lists them (same fidelity as the existing
 * Guk migrations). Sub-numbered stops in the Crypt (17a-17d) kept as
 * separate legend entries since the source itself numbers them that way.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { id: string }) => n.id === "zone:old-sebilis");
if (!zone) throw new Error("zone:old-sebilis not found");

zone.maps = [
  {
    label: "First Level",
    image: "old-sebilis-first-level.jpg",
    legend: [
      { key: "1", label: "Entry Room" },
      { key: "2", label: "Exit Teleport" },
      { key: "3", label: "\"Prison\" with Gangrenous scarab who drops Elder Spiritist's Helm, Gangrenous Beetle Mask, Staff of the Waterwalker" },
      { key: "4", label: "\"NG\" a necrosis scarab who drops Cane of the Tranquil, Crystalline Short Sword, Jaundiced Bone Vambraces" },
      { key: "5", label: "Armory with froglok armorer who drops Singing Steel Bracer" },
      { key: "6", label: "Bar with froglok bartender who drops Dark Scale Greaves, Mrylokar's Vambraces, Sebilite Scale Cape, Sebilite Scale Gloves" },
      { key: "7", label: "Froggy who drops Sebilite Scale Cap, Singing Steel Helm" },
      { key: "8", label: "froglok armsman who drops Mrylokar's Helm, Sebilite Scale Bracelet, Sebilite Scale Leggings, Truncheon of Doom" },
      { key: "9", label: "\"Pyramid\" with sebilite guardians who drop Lamentation, Larrikan's Mask, Wind Saber, and a locked door inside" },
      { key: "10", label: "frenzied pox scarab who drops Beetle Stinger, Deepwater Bracer, Imbued Fighters Staff" },
      { key: "11", label: "\"Disco One\" with froglok ostiary who drops Arbitor's Combine Greatsword, Donal's Vambraces of Mourning, Sebilite Scale Mantle, Sebilite Scale Neckguard; and Gruplinort who drops Elder Spiritist's Bracer, Froglok Bonecaster's Robe, and Sarnak Warhammer" },
      { key: "12", label: "froglok chef who drops Fayguard Bladecatcher, Mrylokar's Bracer, Sebilite Scale Cap, Sebilite Scale Vambraces; and froglok repairer who drops Singing Steel Vambraces, Sebilite Scale Leggings" },
      { key: "13", label: "\"Library\" with secret door to 14" },
      { key: "14", label: "Laboratory with Brogg who drops Clay Guardian Shield, Ebon Mace, Tolan's Darkwood Bracer" },
      { key: "15", label: "\"Disco Two\" with froglok commander who drops Donal's Helm of Mourning, Granite Face Grinder (?), Green Jade Halberd, Sebilite Scale Boots, Sebilite Scale Mask" },
      { key: "16", label: "froglok pickler who drops Donal's Bracer of Mourning, Sebilite Scale Belt, Sebilite Scale Coat, Zealot's Incarnadine Sword" },
      { key: "17", label: "\"The Crypt\" with crypt caretaker who drops Deepwater Helm, Obulus Mantle, and Imperial Crypt Guards" },
      { key: "17a", label: "Arch Duke Iatol who drops Jaundiced Bone Bracer, Silken Whip of Ensnaring, Ykeshan War Club" },
      { key: "17b", label: "Harbinger Freglor who drops Box of Nil Space, Cane of Harmony, Knuckle Dusters" },
      { key: "17c", label: "Hierophant Prime Grekal who drops Hierophant's Cloak, Sword of Skyfire, Sword of the Morning" },
      { key: "17d", label: "Baron Yosig who drops Journeyman's Walking Stick, Luminescent Staff, Tolan's Darkwood Helm" },
      { key: "18", label: "blood of chottal who drops Breath of Harmony, Cone of the Mystics, Tolan's Darkwood Vambraces" },
      { key: "19", label: "Emperor Chottal who drops Deepwater Vambraces, Nathsar Greatsword, Rod of Lamentation, Rod of Mourning; and Spectral Harbinger (a placeholder for Emperor) who drops Granite Face Grinder" },
      { key: "A", label: "Underwater tunnel to point A on the Second Level map" },
    ],
  },
  {
    label: "Second Level",
    image: "old-sebilis-second-level.jpg",
    legend: [
      { key: "1", label: "Exit Teleporter" },
      { key: "2", label: "myconid spore king who drops Fungi Covered Great Staff, Fungus Covered Scale Tunic, and Robe of Living Fungus" },
      { key: "3", label: "Entry Hall with a locked door at the entrance and a secret door at the rear; the front door can't be opened from the other side but can be opened from the front with the turning fire pot" },
      { key: "4", label: "Open Cavern with sebilite protector who drops Hardened Clay Bracelet, Staff of Battle, and Poison Wind Censer; Tolapumj who drops Cap of the Insubstantial, Peacebringer, and Tolapumj's Robe; and Trakanon (see the raid encounter page for drops)" },
      { key: "A", label: "Underwater tunnel to point A on the First Level map" },
    ],
  },
];

save();
console.log("Migration 326 complete: maps set on zone:old-sebilis");
