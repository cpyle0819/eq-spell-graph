/**
 * Migration 269: add a map and the 8 named island bosses to zone:plane-of-sky.
 *
 * Plane of Sky isn't on issue #36's own checklist -- it's a raid instance
 * (8 progressively-keyed islands, not an overland/dungeon zone with a
 * MediaWiki `{{Namedmobpage}}` bestiary category), so this is a smaller,
 * curated addition rather than that issue's usual exhaustive census: just
 * the zone's own named island bosses (eqlwiki.com/Plane_of_Sky's own
 * numbered progression), not a full per-island trash roster. None of the 8
 * carry a stated combat level on their own page (only "Level of Monsters:
 * 50+" for the zone as a whole) -- left unset rather than borrowed from the
 * unrelated `quest:plane-of-sky-key-*` nodes' own minLevel (that's the
 * *quest's* start level, 46, a different fact from the boss's own combat
 * level).
 *
 * `public/maps/plane-of-sky.jpg` downloaded from eqlwiki.com's own
 * /images/7/73/Planeofsky3.jpg ("Plane of Sky island progression map").
 * Legend keys match the map's own island numbers; island 1a (a quest room,
 * no boss) and island 0 (GM-only, not real gameplay content) are omitted.
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const BOSSES = [
  { label: "Thunder Spirit Princess", slug: "thunder-spirit-princess" },
  { label: "Protector of Sky", slug: "protector-of-sky" },
  { label: "Gorgalosk", slug: "gorgalosk" },
  { label: "Keeper of Souls", slug: "keeper-of-souls" },
  { label: "The Spiroc Lord", slug: "the-spiroc-lord" },
  { label: "Bazzt Zzzt", slug: "bazzt-zzzt" },
  { label: "Sister of the Spire", slug: "sister-of-the-spire" },
  { label: "Eye of Veeshan", slug: "eye-of-veeshan" },
];

let added = 0;
for (const boss of BOSSES) {
  const id = `npc:plane-of-sky:${boss.slug}`;
  if (!hasNode(id)) added++;
  addNode({ id, label: boss.label, type: "npc", roles: ["mob"] });
  addEdge(id, "zone:plane-of-sky", "located_in");
}

const zone = graph.nodes.find((n: { data: { id: string } }) => n.data.id === "zone:plane-of-sky");
if (!zone) throw new Error("zone:plane-of-sky not found");

zone.data.maps = [
  {
    label: null,
    image: "plane-of-sky.jpg",
    legend: [
      { key: "1", label: "Isle of Thunder Spirits, arrival island -- Thunder Spirit Princess" },
      { key: "1.5", label: "Noble Dojorn's isle, reachable from Isle 1" },
      { key: "2", label: "Isle of Azaracks -- Protector of Sky" },
      { key: "3", label: "Isle of Gorgalosk -- Gorgalosk" },
      { key: "4", label: "Isle of Pegasi -- Keeper of Souls" },
      { key: "5", label: "Isle of Spirocs -- The Spiroc Lord" },
      { key: "6", label: "Isle of Wasps -- Bazzt Zzzt (Queen Bee)" },
      { key: "7", label: "Isle of Drakes -- Sister of the Spire" },
      { key: "8", label: "Isle of Veeshan, final island -- Eye of Veeshan" },
    ],
  },
];

save();
console.log(`Migration 269 complete: ${added} boss npc node(s) added, map set on zone:plane-of-sky`);
