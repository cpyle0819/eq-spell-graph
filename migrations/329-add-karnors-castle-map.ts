/**
 * Migration 329: add `maps` to zone:karnor-s-castle -- see issue #41 audit.
 *
 * Two floors sourced from eqlwiki.com's own Karnor's Castle page
 * (action=raw) under "Map": `File:map_karnor1.jpg` (Upper Level) and
 * `File:map_karnor2.jpg` (Catacombs) -- both resolve to live, non-broken
 * uploads. Legend transcribed from the page's own numbered walkthrough
 * for each floor.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { id: string }) => n.id === "zone:karnor-s-castle");
if (!zone) throw new Error("zone:karnor-s-castle not found");

zone.maps = [
  {
    label: "Upper Level",
    image: "karnors-castle-upper-level.jpg",
    legend: [
      { key: "1", label: "\"Left Corner\"" },
      { key: "2", label: "\"Right Corner\"" },
      { key: "3", label: "\"Moat\" where multiple random monsters spawn" },
      { key: "4", label: "\"Captain Room\" where a drolvarg captain spawns, who drops Drolvarg Mantle (Common), Cobalt Gauntlets (Uncommon), Jade Mace (Uncommon), Polyphenomenal Axe (Rare), and Lupine Dagger (Very Rare)" },
      { key: "5", label: "\"Left courtyard\" (\"lcy\") with Sentry of Sathir who drops Jarsath Scale Helm (Common), Jaundiced Bone Gauntlets (Rare), Bone Amulet of Blade Turning (Rare), and Swarmcaller (Very Rare); Caller of Sathir who drops Kunzar Cloak (Common), Nature's Wrath, Cobalt Boots (Rare) and Sionachie's Partisan (Very Rare); and Skeletal Berserker who drops Jarsath Scale Chestplate (Common), Band of Eternal Flame, Deathbringer's Rod (Very Rare), and Jaundiced Bone Gauntlets" },
      { key: "6", label: "\"Right courtyard\" (\"rcy\") with the same spawns as the left courtyard" },
      { key: "7", label: "\"Towers\" where Skeletal Captain spawns, who drops Sarnak-Hide Mask (Common), Tolan's Darkwood Gauntlets (Uncommon), Soul Binder (Very Rare) and Fist of Zek" },
      { key: "8", label: "\"Warlord Room\" where a Drolvarg warlord spawns, who drops Supple Scale Armband (Common), Harmonic Dagger (Rare), Noctivagant Blade (Rare), and Donal's Boots of Mourning (Very Rare); along with a Drolvarg Bodyguard, a drolvarg pawbuster who drops Metal Pipe (Zan Fi), and a Wulfwere Bodyguard" },
      { key: "9", label: "Rooms where Skeletal Berserker (drops as in area 5) and skeletal warlord spawn, the latter dropping Jarsath Scale Wrist Guards (Common), Deepwater Boots (Rare), Dwarven Sap (Rare), and Tranquil Staff (Very Rare)" },
      { key: "10", label: "\"Hand Room\" with a Construct; Construct of Sathir who drops Helm of Rile (Common), Polished Obsidian Great Axe, Blood Ember Gauntlets (Rare), Fang Amulet of Calling (Very Rare); a cursed hand who drops Donal's Gauntlets of Mourning (Rare); and Hangnail who drops Elder Spiritist's Gauntlets (Common)" },
      { key: "11", label: "\"Jail Cell\" where skeletal warlord (drops as in area 9), a human skeleton (second door on the right), and Undead Jailer spawn, the latter dropping Jarsath Scale Leggings (Common), Mrylokar's Boots (Rare), and Baton of Faith (Very Rare)" },
      { key: "12", label: "\"Box Room\"" },
      { key: "13", label: "\"Prep Room\", a multi-levelled room with multiple passages taking off here (colored numbers correspond to which level they take off on); Venril Sathir's Remains spawn here" },
      { key: "14", label: "Venril Sathir's Room where Venril Sathir spawns (see the raid encounter page for drops)" },
      { key: "C", label: "Leads to area C on the Catacombs map" },
    ],
  },
  {
    label: "Catacombs",
    image: "karnors-castle-catacombs.jpg",
    legend: [
      { key: "1", label: "Rooms with Skeletal Caretaker who drops Jarsath Scale Vambraces (Common), Mrylokar's Gift (Uncommon) and Tolan's Darkwood Boots (Rare); the easternmost area is also where Verix Kylox's Remains spawns, dropping Kylong Medallion" },
      { key: "2", label: "Rooms with Undead Jailer who drops Jarsath Scale Leggings (Common), Baton of Faith (Rare) and Mrylokar's Boots (Ultra Rare)" },
      { key: "3", label: "Area where moat monsters spawn and move west and south to the Moat, including Skeletal Scryer who drops Jarsath Scale Gauntlets (Common), Jarsath Trident (Rare), Deepwater Gauntlets (Rare), and Locustlure (Rare)" },
      { key: "4", label: "Rooms with Spectral Turnkey who drops Jarsath Scale Boots, Book of Obulus (Rare) and Mrylokar's Gauntlets (Ultra Rare)" },
      { key: "C", label: "Leads to the stairs marked C on the Upper Level map" },
      { key: "D", label: "Leads to the well marked D on the Upper Level map" },
      { key: "A", label: "The letter A sections connect to one another" },
    ],
  },
];

save();
console.log("Migration 329 complete: maps set on zone:karnor-s-castle");
