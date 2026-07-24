/**
 * Migration 195: add `maps` to zone:runnyeye-citadel, in the array shape
 * from migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * Runnyeye is on the P1999-dungeon list (decisions/dungeon-zones-use-
 * p1999-not-eqlwiki.md) but, like the last several dungeon batches, turned
 * out to have a real eqlwiki.com page (title "Runnyeye", reached via a
 * "Runnyeye Citadel" redirect). The zone was revamped (May 2001, per the
 * page's own patch-note quote) from "Clan RunnyEye" to "RunnyEye Citadel";
 * the graph's existing zone label already uses the post-revamp name, so
 * this migration and the bestiary migration alongside it both source
 * post-revamp content. Four `public/maps/runnyeye-citadel-*.jpg` images
 * downloaded from eqlwiki's own File:Runnyeye1-4.jpg, one per level the
 * page's "== Map ==" section breaks the dungeon into. Legend entries
 * transcribed verbatim (wiki markup stripped) from each level's list.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:runnyeye-citadel");
if (!zone) throw new Error("zone:runnyeye-citadel not found");

zone.data.maps = [
  {
    label: "Level One",
    image: "runnyeye-citadel-1.jpg",
    legend: [],
  },
  {
    label: "Level Two",
    image: "runnyeye-citadel-2.jpg",
    legend: [
      { key: "1", label: "A Slime Elemental spawns here, drops Ring of Slime and Orb of Slime (Rare), also Beaded Slime Necklace (Rare)" },
      { key: "2", label: "Giant Snakes" },
      { key: "3", label: 'An Evil Eye prisoner spawns here, drops Onyx Ring, Polished Bone Bracelet, Polished Bone Hoop, and Evil Eye Lens; also the "Door" to First Level' },
      { key: "4", label: "Blood Room -- An Evil Eye spawns here as well, casts a 150 direct-damage nuke, root, Malise, and a DOT" },
      { key: "5", label: "A Goblin Knight spawns here, drops Blackened Iron Bastard Sword (Common)" },
    ],
  },
  {
    label: "Level Three",
    image: "runnyeye-citadel-3.jpg",
    legend: [
      { key: "1", label: "Goblin Shaman Area" },
      { key: "2", label: "Goblin Overseer Area" },
    ],
  },
  {
    label: "Level Four",
    image: "runnyeye-citadel-4.jpg",
    legend: [
      { key: "1", label: "Bar with Goblin Merchants selling Baking Supplies and Alcohol; Goblin Bartender and Battlewizard Unak may spawn here" },
      { key: "2", label: "One possible spawn location of Lord Pickclaw, who drops Black Alloy Medallion and Blackened Alloy Coif and other loot" },
      { key: "3", label: "The Goblin King spawns here, drops Blackened Iron Armor or Black Iron Medallion (Common) and Blackened Iron Crown or Grotesque Mask (Rare); Battlelord Paluk (drops Blackened Alloy Bastard Sword) may also spawn here, as rarely does A Goblin Warlord and Borxx" },
      { key: "4", label: "Underwater Tunnel with A Gelatinous Cube (drops Cat Skull Cap, Common) and Sludge Dankmire (drops Icon of the Constant, Common, and Blackened Iron Eye Totem, Rare)" },
      { key: "5", label: "Bank" },
      { key: "6", label: "Jail" },
      { key: "7", label: "Wood Room" },
      { key: "8", label: "Goblin Warlord spawns here, drops Blackened Iron Armor (Common), Black Iron Medallion (Rare) or Sleek Black Cape (Rare)" },
    ],
  },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 195 complete: maps set on zone:runnyeye-citadel");
