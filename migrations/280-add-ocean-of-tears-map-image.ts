/**
 * Migration 280: add `maps` to zone:ocean-of-tears, in the array shape
 * from migration 125 (decisions/zone-multi-floor-maps.md) -- see issue #36.
 *
 * `public/maps/ocean-of-tears.jpg` downloaded from eqlwiki.com's own
 * `File:Ocean of Tears-edited.jpg`. Legend transcribed verbatim from the
 * numbered list under the map. eqlwiki also has an "Alternate Map"
 * (`Map_OOT.gif`) with no legend of its own -- the page's own text says
 * both maps show the same islands "labeled backwards," so it's a mirrored
 * duplicate of the same single-floor map, not a separate one.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:ocean-of-tears");
if (!zone) throw new Error("zone:ocean-of-tears not found");

zone.data.maps = [
  {
    label: null,
    image: "ocean-of-tears.jpg",
    legend: [
      { key: "1", label: "Several dozen small rocky outcroppings inhabited by Aqua Goblins, Alluring Sirens, and Nerbilik. Brawn also spawns here. There is no boat on these islands." },
      { key: "2", label: "Docking point for boats coming from Freeport. Inn sells food and other goods. Stone in southwestern corner of island. Two boats. Also docks coming from BB after Sisters (4.11.20)." },
      { key: "3", label: "Aviak Island. Three aviak towers and many roaming aviaks, as well as Gull Skytalon who drops Ingot of the Fervent and Soarin Brightfeather who drops Ebon War Spear." },
      { key: "4", label: "Two rocky spires inhabited by Aqua Goblins and Alluring Sirens. There is no boat here." },
      { key: "5", label: "Island inhabited by Aqua Goblins. Temple on hill in middle of island. The Allizewsaur (spawns at -3060, -660 with an aqua goblin placeholder) roams this island, spending most of its time on the hill near the temple. Two boats." },
      { key: "6", label: "Island inhabited by Seafury Cyclops (who are placeholders for Tainted/Corrupt Cyclops), a Buccaneer (who is place holder for Wiltin Windwalker), Gornit, Goob Mudtoe, Quag Maelstrom and a camp of less-than friendly pirates (Toko Binlittle and pet, Dixl Drool, Capt. Surestout). Two boats. Ruined stone ring in southeastern corner." },
      { key: "7", label: "Haunted island inhabited by Spectres and Gargoyles who worship at the dark tower. Sentry Xyrin spawns on the north side. Gargoyles share spawns with lower-level skeletons, but kill skeletons when their paths intersect. The island will often be full of gargoyles when no one has been killing them, but skeletons spawn quite frequently." },
      { key: "8", label: "Island with Boog Mudtoe and Pirate. Also has Temple on north side of hill and old ruined tower on top of hill inhabited by Elesseryl Terussar who sells Mage spells, mostly summoning spells. Pirate is placeholder for Ancient Cyclops, 1021, -7900." },
      { key: "9", label: "Island of Isle Goblins and A Goblin Headmaster and the Oracle of K`Arnon and his Guardian. North point by guardian." },
      { key: "10", label: "Island of the Sisters of Erollisi. Dock for boats coming from Antonica. One boat. Stone in northeastern corner. Dwarven smiths on western shore. Inn that sells goods and Kiola Nuts." },
    ],
  },
];

save();
console.log("Migration 280 complete: maps set on zone:ocean-of-tears");
