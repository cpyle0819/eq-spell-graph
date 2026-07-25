/**
 * Migration 266: adds `zoneType: "city" | "dungeon" | "open_world"` to
 * every zone node -- a new key, distinct from the existing `type: "zone"`
 * node-type discriminator. Drives Maps' new grouped-Bestiary display order
 * (decisions/npc-mob-unification-and-zone-groups.md): city and open_world
 * render identically (guildmaster/vendor/quest_giver/guard/mob), dungeon
 * reverses it -- so the only classification that actually changes behavior
 * today is the dungeon/non-dungeon split; city vs. open_world is otherwise
 * descriptive.
 *
 * Classified from each zone's own `lore` field (migration 022) plus
 * standard EverQuest zone knowledge -- "dungeon" means an enclosed,
 * instance-like combat zone (a fortress/crypt/cavern/plane), "city" means
 * a named settlement with its own civic roster (guards/guildmasters/
 * vendors), "open_world" means an outdoor overland zone. A few zones read
 * as a hostile faction's home turf rather than a friendly hub but are
 * still structurally a city (their own lore calls them exactly that) --
 * kept as "city" rather than "dungeon": Kael Drakkal ("home city of the
 * giants"), Thurgadin ("home of the Coldain", Great Divide's dwarves),
 * Icewell Keep (Dain's dwarven keep). Also judgment calls worth a second
 * look later: Highpass Hold and Erudin Palace (small keeps with a civic
 * roster, treated as "city"); Gorge of King Xorbb and New Sebilis
 * Expedition (maze/instance-entrance zones with no civic roster, treated
 * as "dungeon"); the four Planes (Fear/Growth/Mischief/Sky) are hostile
 * instance-like zones, treated as "dungeon" despite not being literal
 * indoor dungeons.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const DUNGEON: string[] = [
  "befallen", "blackburrow", "chardok", "crushbone", "crystal-caverns",
  "dalnir", "dragon-necropolis", "gorge-of-king-xorbb", "kaesora",
  "karnor-s-castle", "kedge-keep", "kurn-s-tower", "lower-guk",
  "mistmoore-castle", "nagafen-s-lair", "najena", "new-sebilis-expedition",
  "old-sebilis", "permafrost", "plane-of-fear", "plane-of-growth",
  "plane-of-mischief", "plane-of-sky", "qeynos-catacombs",
  "runnyeye-citadel", "skyshrine", "sleeper-s-tomb", "solusek-s-eye",
  "splitpaw", "splitpaw-lair", "temple-of-cazic-thule",
  "temple-of-solusek-ro", "temple-of-veeshan", "the-estate-of-unrest",
  "the-hole", "the-warrens", "upper-guk",
];

const CITY: string[] = [
  "ak-anon", "east-cabilis", "east-freeport", "erudin", "erudin-palace",
  "grobb", "halas", "high-keep", "highpass-hold", "icewell-keep",
  "kael-drakkal", "neriak-3rd-gate", "neriak-commons",
  "neriak-foreign-quarter", "north-freeport", "north-kaladim",
  "north-qeynos", "northern-felwithe", "oggok", "paineel", "rivervale",
  "south-kaladim", "south-qeynos", "southern-felwithe", "thurgadin",
  "west-cabilis", "west-freeport",
];

// Everything else -- outdoor overland zones -- is open_world, checked
// below rather than listed (it's the majority of zones and the default).

const zoneNodes = graph.nodes.filter((n: any) => n.data.type === "zone");
let cityCount = 0, dungeonCount = 0, openWorldCount = 0;

for (const node of zoneNodes) {
  const slug = (node.data.id as string).slice("zone:".length);
  const zoneType = DUNGEON.includes(slug) ? "dungeon" : CITY.includes(slug) ? "city" : "open_world";
  node.data.zoneType = zoneType;
  if (zoneType === "dungeon") dungeonCount++;
  else if (zoneType === "city") cityCount++;
  else openWorldCount++;
}

save();

console.log(`Classified ${zoneNodes.length} zones: ${cityCount} city, ${dungeonCount} dungeon, ${openWorldCount} open_world.`);
