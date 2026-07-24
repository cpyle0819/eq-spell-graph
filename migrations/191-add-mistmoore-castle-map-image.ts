/**
 * Migration 191: add `maps` to zone:mistmoore-castle, in the array shape
 * from migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/mistmoore-castle.jpg` downloaded from eqlwiki.com's own
 * File:Mistmoore.jpg. Legend transcribed verbatim from the numbered list
 * under the map, including "19a" as its own sub-entry the same way the
 * wiki numbers it. The page's "Not marked on map" notes (Castle Entrance,
 * the graveyard/pond connecting path) describe areas with no map position
 * to anchor a legend key to, so they're omitted rather than force-numbered.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:mistmoore-castle");
if (!zone) throw new Error("zone:mistmoore-castle not found");

zone.data.maps = [
  {
    label: null,
    image: "mistmoore-castle.jpg",
    legend: [
      { key: "1", label: '"Graveyard" (GY) where an imp familiar spawns, who drops Sacrificial Dagger (Common) and Bloodstone Eyepatch (Rare), and a glyphed ghoul, who drops Vial of Vampire Blood (Common) and Crested Mistmoore Shield (Rare)' },
      { key: "2", label: "Tomb with Coffin; behind it is Ssynthi who drops Robe of the Keeper, and a Secret Entrance leading one way to the Jail" },
      { key: "3", label: '"The Pit"' },
      { key: "4", label: '"The Canyon" where Black Dire spawns, as well as Enynti, who drops Rune of Fortune (Rare)' },
      { key: "5", label: '"Jail" where a deathly usher spawns, who drops Black Silk Gloves; secret door has a trap that strips off invisibility spells; Stairs is where an avenging caitiff spawns, who drops Crested Spaulders (Common) and Crested Helm (Rare). A ground spawn for the Cleric quest Caduceus of Sacrament is here' },
      { key: "6", label: '"Courtyard" (CY) where A Hemo Enologist spawns, drops Blood Spirit' },
      { key: "7", label: "Fountain where a cloaked dhampyre spawns, drops Blood of the Dhampyre (Common) and Hooded Black Cloak (Rare); spawn location of A Fallen Noble, who drops Noble's Robes (Uncommon) and Vial of Noble's Blood (Uncommon)" },
      { key: "8", label: "Entry Hall" },
      { key: "9", label: '"Piano"' },
      { key: "10", label: '"Ballroom" where gypsies and Mynthi Davissi spawn, drops Lute of the Gypsy Princess (Common) and Mistmoore Battle Drums (Rare)' },
      { key: "11", label: '"Ambassador Room" where Negotiator and Gypsy Ambassador spawn' },
      { key: "12", label: '"The Corner"' },
      { key: "13", label: '"The Tower" where Garton Viswin spawns, drops Glowing Iron Pike (Common) and Chestplate of the Dark Flame (Rare)' },
      { key: "14", label: "Torture Chamber" },
      { key: "15", label: "Mayong Mistmoore's Coffin Room" },
      { key: "16", label: "Kitchen" },
      { key: "17", label: "Servant Room where Maid Issis spawns, drops Nightshade Wreath (Common) and Maid Issis Fang (Rare)" },
      { key: "18", label: "Servant Room where Butler Syncall spawns, drops Cape of Midnight Mist (Common) and Butler Syncalls Fang (Rare)" },
      { key: "19", label: "Library" },
      { key: "19a", label: "Advisor room (inside the Library) where an advisor spawns, drops Advisor Robe" },
      { key: "20", label: "Throne Room where Princess Cherista spawns, drops Gem-Encrusted Scepter (Uncommon) and Diamondine Earring (Rare)" },
      { key: "21", label: '"The Bath" where Lasna Cheroon spawns, who drops Diamondine Earring (Common) and Platinum Skull Ring (Rare), and Xicotl, who drops Hilt of Soulfire' },
      { key: "22", label: "Bedroom" },
      { key: "23", label: "A dark ass`t librarian spawns, drops Illegible Scroll (\"Vok Na Zov XI\")" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 191 complete: maps set on zone:mistmoore-castle");
