/**
 * Migration 247: add `maps` to zone:western-karana, in the array shape from
 * migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/western-karana.jpg` downloaded from eqlwiki.com's own
 * /images/f/fc/Zone_westkarana.jpg. Legend transcribed verbatim from the
 * numbered list under the map. Run after migration 246, which merged the
 * leftover `zone:west-karana` duplicate into this zone.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:western-karana");
if (!zone) throw new Error("zone:western-karana not found");

zone.data.maps = [
  {
    label: null,
    image: "western-karana.jpg",
    legend: [
      { key: "1", label: "Shops selling Cloth Armor, Cooking Supplies, Clay and Firing Sheets" },
      { key: "2", label: "Shops selling Throwing Daggers and Tailoring Patterns. Innkeep Rislarn selling Food" },
      { key: "3", label: "Bandit Camp (Bandits: Level 9-11). Note there is also a bandit camp (\"3 North\") just north and slightly east of Camp 3, near (890, -7050)" },
      { key: "4", label: "Guard Tower (\"Tower 1\")" },
      { key: "5", label: "Guard Tower (\"Tower 2\")" },
      { key: "6", label: "Farm taken over by Bandits and a Brigand (Bandits: Level 9-11)" },
      { key: "7", label: "Cleet Miller Farm" },
      { key: "8", label: "Empty farm" },
      { key: "9", label: "Corrupt Guard Tower" },
      { key: "10", label: "Fields with Scarecrows (Undead Level 12-17)" },
      { key: "11", label: "Henina Miller Farm with Furball, also sells items" },
      { key: "12", label: "Empty farm" },
      { key: "13", label: "Barbarian Village selling Large Blacksmithing Molds and Books, Shaman Summon Spells" },
      { key: "14", label: "Tiny Miller's House" },
      { key: "15", label: "Farm with ex-Druid, Linaya Sowlin" },
      { key: "16", label: "Mountains filled with Bandits (Bandits: Level 9-11; the map makes it look more to the West than it is; loc is closer to 900, -11500)" },
      { key: "17", label: "Caninel with Gnoll Allies" },
      { key: "18", label: "Ogre Shrine guarded by Ogre Guards, Ogre shamans (ph's for, An Ogre Priestess & Chief Goonda) (Ogres: Level 20-27 | Chief Level 34), respawns 22 minutes" },
      { key: "19", label: "Froon and Choon on a hill" },
      { key: "20", label: "Barbarian shop selling Fletching Kit, Arrows, Bows, and Nocks" },
      { key: "21", label: "Shops selling Blacksmithing Books and Molds, also Innkeep Danin selling Food" },
      { key: "22", label: "Farms" },
      { key: "23", label: "Farms" },
      { key: "24", label: "Bandit Camp" },
      { key: "25", label: "Farms with Poison Merchant" },
      { key: "26", label: "Pyramid (Wizard portal)" },
      { key: "27", label: "Undead Ruins" },
    ],
  },
];

save();
console.log("Migration 247 complete: maps set on zone:western-karana");
