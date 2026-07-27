/**
 * Migration 336: add `maps` to zone:erudin-palace -- see issue #41 audit.
 *
 * eqlwiki.com has no separate Erudin Palace page (`Erudin_Palace` is a
 * `#REDIRECT[[Erudin]]`) -- the palace's three floors are a "Map" subsection
 * on the Erudin page itself: `File:erudinpalace_0.png` (Basement),
 * `File:erudinpalace_1.png` (Level One), `File:erudinpalace_2.png`
 * (Level Two), all resolving to live, non-broken uploads. The page gives
 * one shared numbered list (1-9) for all three images with no per-floor
 * split in the prose, so which item belongs to which floor was read
 * directly off each downloaded image instead of guessed: Basement is
 * numbered 2/3/4/5, Level One only has "1", Level Two is numbered 6/7/8/9.
 * Lettered stairs (A/B/C) connect the floors and appear on whichever
 * images they physically link.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { id: string }) => n.id === "zone:erudin-palace");
if (!zone) throw new Error("zone:erudin-palace not found");

zone.maps = [
  {
    label: "Basement",
    image: "erudin-palace-basement.png",
    legend: [
      { key: "2", label: "Bank of Erudin" },
      { key: "3", label: "Erudin City Office -- merchants selling bags, prison downstairs" },
      { key: "4", label: "Sothure's Fine Gems -- merchants selling gems, metals, and all jewelry supplies" },
      { key: "5", label: "Vials of Vitality -- merchants selling jewelry supplies (all except metal), potions, magic stones" },
      { key: "A", label: "Stairs to the corresponding A on Level One" },
      { key: "B", label: "Stairs to the corresponding B on Level One" },
    ],
  },
  {
    label: "Level One",
    image: "erudin-palace-level-one.png",
    legend: [
      { key: "1", label: "Upper is the Teleporter Arrival Platform; the teleporter down to Erudin is on the Basement level" },
      { key: "A", label: "Stairs to the corresponding A on the Basement" },
      { key: "B", label: "Stairs to the corresponding B on the Basement" },
      { key: "C", label: "Stairs to the corresponding C on Level Two" },
    ],
  },
  {
    label: "Level Two",
    image: "erudin-palace-level-two.png",
    legend: [
      { key: "6", label: "Tower of the Crimson Hands -- Wizard Guild, merchants selling spells, Crimson Robes, wizard books, gems (assorted)" },
      { key: "7", label: "Tower of the Gate Callers -- Magician Guild, merchants selling spells, Blue Robes, gems (many), magician equipment" },
      { key: "8", label: "Tower of the Craft Keepers -- Enchanter Guild, merchants selling spells, Gold Robes, gems (assorted), and various spell components" },
      { key: "9", label: "Merchant selling common spells" },
      { key: "C", label: "Stairs to the corresponding C on Level One" },
    ],
  },
];

save();
console.log("Migration 336 complete: maps set on zone:erudin-palace");
