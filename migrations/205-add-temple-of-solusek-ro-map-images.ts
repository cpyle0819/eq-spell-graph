/**
 * Migration 205: add `maps` to zone:temple-of-solusek-ro, in the array
 * shape from migration 125 (decisions/zone-multi-floor-maps.md) -- see
 * issue #36.
 *
 * Temple of Solusek Ro is on the P1999-dungeon list (decisions/dungeon-
 * zones-use-p1999-not-eqlwiki.md) but, like the last several dungeon
 * batches, turned out to have a real eqlwiki.com page -- under "The Temple
 * of Solusek Ro" ("Temple of Solusek Ro" itself is a `#REDIRECT`). The
 * page's own framing: "not for adventuring and hunting, killing monsters
 * or selling goods, but for interacting with the inhabitants... to give
 * out quests" ("Level of Monsters: Quest Only"). Its numbered "Inhabitants
 * and Quests" table is therefore quest-giver NPC placement, not a
 * bestiary -- kept here as the map legend content anyway since that's what
 * the map's numbered dots actually mark, same descriptive role a
 * dungeon's numbered rooms/mobs legend normally plays.
 *
 * Two map images (`public/maps/temple-of-solusek-ro-ground.jpg` /
 * `-upstairs.jpg`, from eqlwiki's File:Templesro1.jpg / Templesro2.jpg)
 * cover two floors, but the source table doesn't tag every entry with a
 * floor. Split conservatively: only entries whose own page states "Level
 * 2" / "2nd floor" (or, for "An Undead Knight," whose table row says "near
 * 6 & 13" -- both confirmed Level 2 -- placing it there by that explicit
 * cross-reference) went to the Upstairs legend; every entry with no floor
 * marker stayed on Ground rather than being guessed from raw coordinates
 * (several unmarked entries have coordinates close to confirmed-upstairs
 * ones, too unreliable to split on alone). "Lon the Redeemed" is excluded
 * from both legends -- its own row says "not on map".
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:temple-of-solusek-ro");
if (!zone) throw new Error("zone:temple-of-solusek-ro not found");

zone.data.maps = [
  {
    label: "Ground Floor",
    image: "temple-of-solusek-ro-ground.jpg",
    legend: [
      { key: "1", label: "Tazgar the Efreeti -- hailing him LOSES faction with Temple of Solusek Ro inhabitants" },
      { key: "2", label: "Gavel the Temperant (Cleric) -- Armor of the Priest quest" },
      { key: "3", label: "Blaize the Radiant (Cleric) -- Armor of the Priest quest" },
      { key: "4", label: "Cryssia Stardreamer (Bard) -- Lambent Armor quest" },
      { key: "5", label: "Walthin Fireweaver (Bard) -- Lambent Armor quest" },
      { key: "11", label: "Ostorm -- resets specialization in a spell skill" },
      { key: "12", label: "Sultin (Enchanter) -- Incandescent Armor and Rod of Insidious Glamour quests" },
      { key: "14", label: "Vurgo (Necromancer) -- Harvester and Words of Darkness quests" },
      { key: "15", label: "Syllina (Necromancer) -- Shadowbound Armor / Robe of Enshroudment quests, Shadow Silk" },
    ],
  },
  {
    label: "Upstairs",
    image: "temple-of-solusek-ro-upstairs.jpg",
    legend: [
      { key: "6", label: "Lord Searfire (Paladin) -- Armor of Ro quest" },
      { key: "7", label: "Joyce (Magician) -- Robe of the Elements, Clay Bracelet, Earthen Boots, Circlet of Mist quests; Vira (Magician, pet casters) -- Shovel of Ponz, Stein of Ulissa, Broom of Trilon, Torch of Alna quests; Lord Lyfyx of Burwood (Paladin) -- Wurmslayer quest (Kunark)" },
      { key: "8", label: "Gardern (Wizard/Bard) -- Lambent Armor, Staff of Temperate Flux, Weeping Wand quests" },
      { key: "8-9", label: "Terblyn Zelbus (merchant) -- sells Wizard Translocation and Combine Gate spells (Velious)" },
      { key: "9", label: "Vilissia (Wizard/Cleric) -- Runescale Cloak, Tishan's Kilt, Acumen Mask, Shield of the Devout quests" },
      { key: "10", label: "Genni (Bard and others) -- Bard Lambent Gems quest; gives Fire Opal for 550g" },
      { key: "13", label: "Romar Sunto (Enchanter/Wizard) -- Coin of Tash (Tashania), Darkwood Staff quests" },
      { key: "6-13", label: "An Undead Knight (Shadow Knight) -- Darkforge Armor quest" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 205 complete: maps set on zone:temple-of-solusek-ro");
