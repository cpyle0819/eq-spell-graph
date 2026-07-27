/**
 * Migration 299: add `maps` to zone:icewell-keep -- see issue #36.
 *
 * `public/maps/icewell-keep.jpg` downloaded from eqlwiki.com's own
 * `File:Map icewell keep.jpg`. Legend transcribed verbatim from the
 * numbered list under the map (items 1-13).
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { id: string }) => n.id === "zone:icewell-keep");
if (!zone) throw new Error("zone:icewell-keep not found");

zone.maps = [
  {
    label: null,
    image: "icewell-keep.jpg",
    legend: [
      { key: "1", label: "Grizznot's Cave with Grizznot, who drops Cloak of the Cave Bear" },
      { key: "2", label: "Coldain Outcasts selling Coldain Weapons and Armor, Lantern Molds, Jeweler's Kit and Gems" },
      { key: "3", label: "Underwater tunnel with Glucose, who drops Incandescent Bracer" },
      { key: "4", label: "Dain's Bedroom with Dain Frostreaver IV (at night)" },
      { key: "5", label: "Trophy Room with Grand Huntsman Darral and Royal Armorer Slade" },
      { key: "6", label: "Throne with Dain Frostreaver IV, Seneschal Aldikar, and Chamberlain Krystorf (during day)" },
      { key: "7", label: "Library with Royal Scribe Kaavin" },
      { key: "8", label: "The Pit" },
      { key: "9", label: "Councillor Gallery" },
      { key: "10", label: "Seneschal Aldikar's Bedroom with Seneschal Aldikar (at night)" },
      { key: "11", label: "Barracks" },
      { key: "12", label: "Meeting Hall with Sentry Ellison" },
      { key: "13", label: "Hall of Ancestors with Loremaster Solstrin" },
    ],
  },
];

save();
console.log("Migration 299 complete: maps set on zone:icewell-keep");
