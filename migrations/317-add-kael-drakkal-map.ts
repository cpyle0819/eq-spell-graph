/**
 * Migration 317: add `maps` to zone:kael-drakkal -- see issue #36.
 *
 * eqlwiki.com's own File:Map kael drakkal.jpg upload is broken (also, the
 * live eqlwiki page itself is a redirect to "Kael Drakkel", a different
 * spelling from this repo's zone label); same user-approved P1999
 * exception as migration 315 (decisions/eqlwiki-broken-map-images.md).
 * `public/maps/kael-drakkal.jpg` downloaded from wiki.project1999.com's
 * own File:Map_kael_drakkal.jpg. Legend transcribed verbatim (wiki markup
 * stripped) from that page's own "Map Location Key" section; sub-key "1a"
 * kept as its own row rather than folded into "1", matching the source.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { id: string }) => n.id === "zone:kael-drakkal");
if (!zone) throw new Error("zone:kael-drakkal not found");

zone.maps = [
  {
    label: null,
    image: "kael-drakkal.jpg",
    legend: [
      { key: "1", label: "Temple of Rallos Zek with Statue of Rallos Zek" },
      { key: "1a", label: "Derakor the Vindicator, who drops Boots of the Vindicator, Chestplate of Vindication, Living Thunder Earring" },
      { key: "2", label: "Protectors of Zek" },
      { key: "3", label: "Arena; Avatar of War appears here when Statue of Rallos Zek dies; Merchant selling tickets and Food" },
      { key: "4", label: "Noble Building -- Merchants selling Food and Drink and Alcohol, also Wenglawks Kkeak and Noble Helssen" },
      { key: "5", label: "Slaggak the Trainer" },
      { key: "6", label: "Merchants selling Othmir Hide Armor, Drakkel Weapons, Frozen Flower, and Dwarf Bone Toothpick" },
      { key: "7", label: "Commoner Building" },
      { key: "8", label: "Ramp Area" },
      { key: "9", label: "Commoner Building" },
      { key: "10", label: "Bank; Staff Sergeant Drioc and Captain Bvellos, who roams outside" },
      { key: "11", label: 'Iceshard Keep "Plate House", Doldigun Steinwielder (9th Coldain Ring Quests)' },
      { key: "12", label: "King Tormax's Throne Room with King Tormax" },
      { key: "13", label: "Bank; Merchant selling Spell Components; Bard Quest NPC" },
      { key: "14", label: "Keldor Dek`Torek, who drops Orb of the Infinite Void; Shaman and Helm Quest NPCs" },
    ],
  },
];

save();
console.log("Migration 317 complete: maps set on zone:kael-drakkal");
