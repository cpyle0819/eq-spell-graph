/**
 * Migration 309: add `maps` to zone:plane-of-mischief -- see issue #36.
 *
 * Two entries, same multi-floor shape as The Estate of Unrest/Steamfont
 * Mountains before it (decisions/zone-multi-floor-maps.md): the main
 * castle overview (`public/maps/plane-of-mischief.png`, from eqlwiki.com's
 * own `File:Map plane of mischief 750px.png`) and the Rat Maze
 * (`public/maps/plane-of-mischief-rat-maze.png`, from
 * `File:POM Rats Maze 7.png`), the only sub-area with its own numbered
 * legend.
 *
 * This is the most sprawling single zone sourced in this issue -- the
 * source page itself calls the main map "abbreviated" and links out to a
 * dozen more prose-narrated sub-area maps (Forest, Chest Room, East/West
 * Wing, Dining Room, Hedge Maze, Upside-Down Wing, Puppets Theater,
 * Chessboard, Alice in Wonderland), none of which carry a numbered POI
 * legend -- they're walkthrough narratives with inline images, not
 * legend-keyed maps like every other zone sourced so far. Only the main
 * castle overview and the Rat Maze (which does have real numbered pit-trap
 * markers) were added; the rest are out of scope for this pass.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { id: string }) => n.id === "zone:plane-of-mischief");
if (!zone) throw new Error("zone:plane-of-mischief not found");

zone.maps = [
  {
    label: "Castle",
    image: "plane-of-mischief.png",
    legend: [],
  },
  {
    label: "Rat Maze",
    image: "plane-of-mischief-rat-maze.png",
    legend: [
      { key: "1", label: "Castle Entrance trap" },
      { key: "2", label: "Lava tunnel false exit trap (A)" },
      { key: "3", label: "East Wing: near a signpost (170, -550)" },
      { key: "4", label: "East Wing: east of Library (180, -1075)" },
      { key: "5", label: "East Wing: east of Pinky (60, -940)" },
      { key: "6", label: "East Wing: west of Library (230, -870)" },
      { key: "7", label: "East Wing: near a signpost (280, -540)" },
      { key: "8", label: "Chessboard trap (905, -922)" },
      { key: "9", label: "Chessboard trap (839, -974)" },
      { key: "10", label: "Chessboard trap (785, -906)" },
      { key: "11", label: "Chessboard trap (751, -1037)" },
      { key: "12", label: "Back Hall: western trap to 4-way (500, -75)" },
      { key: "13", label: "Back Hall: short-cut pit (880, -220)" },
      { key: "14", label: "Back Hall: east dead end (500, -775)" },
      { key: "15", label: "West Wing: 2nd deck dead end (25, -215)" },
      { key: "16", label: "West Wing: dead end near Jumbo (50, 115)" },
      { key: "17", label: "West Wing: unreachable trap (350, 260)" },
      { key: "18", label: "West Wing: theater stage stairway (580, 100)" },
      { key: "19", label: "Trap from Upside-Down area (also a vendor)" },
    ],
  },
];

save();
console.log("Migration 309 complete: maps set on zone:plane-of-mischief");
