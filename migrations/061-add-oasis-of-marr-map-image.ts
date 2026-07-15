/**
 * Migration 061: add `map_image` and `map_legend` fields to the Oasis of
 * Marr zone node -- the first real, self-hosted zone map (and its legend)
 * for Maps' zone dossier (issue #28).
 *
 * Self-hosted rather than hotlinked: eqlwiki.com's own map filenames follow
 * no consistent per-zone naming convention (confirmed across several zones:
 * "Map_oasisofmarr.jpg", "Akanon.jpg", "Zone_nqeynos.jpg"), so there's no
 * reliable pattern a live hotlink could reconstruct, and self-hosting means
 * the app doesn't depend on eqlwiki.com staying up or keeping the file at
 * that path. `public/maps/oasis-of-marr.jpg`, downloaded directly from
 * eqlwiki.com's own image (the same file the wiki page displays, not a
 * re-drawn copy).
 *
 * `map_image` holds just the filename under `public/maps/`, the same "plain
 * string fact on the zone node" shape `lore`/`wiki_title` already use
 * (migrations 022/023) -- not a separate lookup file, since this is a
 * one-to-one zone-to-image fact with no reuse to dedupe (unlike spell icons,
 * which are heavily shared across spells and so earned their own manifest,
 * see decisions/spell-icons-real-client-art-exception.md).
 *
 * Zones use eqlwiki.com's plainer coordinate-grid map style, not the more
 * polished illustrated style some zones also have (e.g. Ak'Anon's
 * "Akanon_full.png") -- picked for consistency across zones as this rolls
 * out to more of them, not per-zone visual quality.
 *
 * `map_legend` is the numbered key printed below the map on the wiki page --
 * transcribed verbatim (Oasis of Marr's own `<ul><li>N. ...` list), each
 * entry's `key` kept as the literal string printed on the map rather than
 * assumed to be a sequential integer: some zones' alternate map style keys
 * its legend with letters (Ak'Anon's "_full" map uses A-J), and the numbers
 * are drawn into the map artwork itself, not derivable from anything else
 * this repo has -- there's no coordinate to recover, only the text tied to
 * each marker.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:oasis-of-marr");
if (!zone) throw new Error("zone:oasis-of-marr not found");

zone.data.map_image = "oasis-of-marr.jpg";
zone.data.map_legend = [
  { key: "1", label: "Ogre Temple surrounded by Orcs" },
  { key: "2", label: "Abandoned Hut and Dock with boats to Kunark" },
  { key: "3", label: "Gypsy Camp with Combine Weapons, Food and Goods, Shaman Spells, and other Supplies" },
  { key: "4", label: "Temple surrounded by Spectres; one-way connection to Plane of Hate" },
  { key: "5", label: "Fishing Village" },
  { key: "6", label: "Cutthroat Dervish Camp" },
  { key: "7", label: "Cutthroat Dervish Camp" },
  { key: "8", label: "Inn selling Goods" },
  { key: "9", label: "Orc Camp" },
  { key: "10", label: "Aqua Goblin Tower" },
];

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 061 complete: map_image and map_legend set on zone:oasis-of-marr");
