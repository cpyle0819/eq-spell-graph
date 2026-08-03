/**
 * Migration 407: reconciles Backpack's own eqlwiki "Sold by" table (114
 * entries) against the graph -- it was only ever wired to the 17
 * "Adventuring Supply Merchant" archetype vendors (migration 404), never
 * cross-referenced against the broader general-goods vendor population the
 * way the other 18 items were in migration 405.
 *
 * Surfaced by spot-checking Celanie Xtoria (East Freeport): her real
 * eqlwiki page lists Backpack and Bandages alongside a run of blunt
 * weapons (Club, Flail, Great Staff, Mace, Morning Star, Round Shield,
 * Staff, Two Handed Hammer, Warhammer) -- she's actually a weapons/shield
 * vendor who also happens to carry a Backpack, same shape as Tanlok
 * Harson's Dagger in migration 405. The weapons stay out of scope (same
 * "separate, much larger vendor economy" boundary as migration 405's
 * Dagger exclusion); only Backpack is in scope here.
 *
 * Same zone-resolution and existing-npc-vs-new-npc reconciliation approach
 * as migration 405, scoped to this one item.
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);
const g = graph;

const ZONE_OVERRIDES: Record<string, string | null> = {
  "highpass keep": "zone:high-keep",
  "neriak third gate": "zone:neriak-3rd-gate",
  "felwithe": "zone:northern-felwithe",
};
const zoneByLabel = new Map(
  g.nodes.filter((n: { type: string }) => n.type === "zone").map((n: { id: string; label: string }) => [n.label.toLowerCase(), n.id])
);
function resolveZone(rawZoneLabel: string): string | null | undefined {
  const key = rawZoneLabel.trim().toLowerCase();
  if (key in ZONE_OVERRIDES) return ZONE_OVERRIDES[key];
  if (zoneByLabel.has(key)) return zoneByLabel.get(key);
  return undefined;
}

function slug(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function normName(s: string): string {
  return s.toLowerCase().replace(/[`']/g, "'").trim();
}

const RAW = `
a clockwork merchant - Ak'Anon
Drekon Vebnebber - Ak'Anon
a clockwork priest - Ak'Anon
Rastok - East Cabilis
Klok Vednir - East Cabilis
Lybar - West Cabilis
Ruby Boxcrafter - West Commonlands
Ponila Quickfingers - East Commonlands
Merra Clayfinger - East Commonlands
Ayth Niphiria - Erudin
Stella Breezemoon - Erudin
Fhania Aserdon - Erudin
Nerth Sailwind - Erudin
Ghemna Nyjuss - Erudin
Luren Renthalis - Erudin
Reihan Wilhemson - Erudin
Kisrin Breezeshadow - Erudin
Reko Saltamer - Erudin
Rem Knarjon - Erudin
Vall Stonewisp - Erudin Palace
Tan Monosty - Erudin Palace
Judge Monosty - Erudin Palace
Merchant Issynal - Felwithe
Tylar Windspirit - Felwithe
Isyna Firspanyl - Felwithe
Dran Hieth - Firiona Vie
Broawn Goshart - Firiona Vie
Dom Pathfinder - Firiona Vie
Ralfson Gerositan - East Freeport
Celanie Xtoria - East Freeport
Prasen Rusgor - East Freeport
Tenni Kohern - East Freeport
Mevah Toklius - North Freeport
Hulos Ghenar - North Freeport
Jekel Enhied - North Freeport
Jusia Vapious - North Freeport
Asnod Marnoc - West Freeport
Fania Esruc - West Freeport
Tyeg Envil - West Freeport
Innkeep Wuleran - Greater Faydark
Merchant Aildien - Greater Faydark
Merchant Aluuvila - Greater Faydark
Merchant Tilluen - Greater Faydark
Merchant Tenra - Greater Faydark
Merchant Gililya - Greater Faydark
Merchant Tuluvdar - Greater Faydark
Merchant Milania - Greater Faydark
Merchant Muvien - Greater Faydark
Gluku - Grobb
Graktak - Grobb
Kagbkek - Grobb
Zumzal - Grobb
Holana Oleary - Halas
Rose McDowell - Halas
Kar O'Dansin - Halas
Elona McMahon - Halas
Merchant Dominik - Highpass Keep
Treasurer Lynn - Highpass Keep
Vacto Molunel - South Kaladim
Aarina Ratsbone - South Kaladim
Handaaf Orcslicer - South Kaladim
Kafia Ratsbone - North Kaladim
Darthur Nightseer - North Kaladim
Baleki Nightseer - North Kaladim
Eithne Walker - Kithicor Forest
Srynda - Lake Rathetear
Palais Derekor - Neriak Foreign Quarter
Relgor - Neriak Foreign Quarter
Namarg - Neriak Foreign Quarter
Issva H\`Rugla - Neriak Commons
Cazum N\`Tan - Neriak Third Gate
Jerris W\`Selo - Neriak Third Gate
Kanthu M\`Rekkor - Neriak Third Gate
Tzanso S\`Tai - Neriak Third Gate
Mrysila - Northern Karana
Synthan - Oasis of Marr
Brokk Boxtripper - Oggok
Rora Dirtstamp - Oggok
Iksob Darkchaser - Oggok
Snarg Bonesmacker - Oggok
Tin Merchant II - The Overthere
Tenralus Brackmar - Paineel
Rallia Hapera - Paineel
Geomar Hapera - Paineel
Felia Milltorn - Qeynos Catacombs
Bassanio Weekin - South Qeynos
Fellesha Varshen - South Qeynos
Raheim Varshen - South Qeynos
Gahna Salbeen - South Qeynos
Sansa Nusk - South Qeynos
Bisdlo Ravtahm - South Qeynos
Rabley Trumend - South Qeynos
Tubal Weaver - North Qeynos
Shenro Kazpur - North Qeynos
Sequea Erthinon - Surefall Glade
Grathin Nilm - Surefall Glade
Ukla - Rathe Mountains
Roshmael - Rathe Mountains
Lianna Ferasa - Rathe Mountains
Gaffin Deeppockets - Rivervale
Crista Tagglefoot - Rivervale
Pipple Purpleroot - Rivervale
bag merchant - Rivervale
Rantho Goobler - Rivervale
Raelrik - Skyshrine
Tulgadin - Skyshrine
goblin merchant - Solusek's Eye
Brigam - Thurgadin
Mordin Frostcleaver - Thurgadin
Agar - Thurgadin
Coldain Outcast - Icewell Keep
Coldain Outcast - Icewell Keep
Stylla Parsini - Toxxulia Forest
Emil Parsini - Toxxulia Forest
`;

const rows = RAW.trim()
  .split("\n")
  .map((l) => l.trim())
  .filter(Boolean)
  .map((line) => {
    const idx = line.lastIndexOf(" - ");
    return { name: line.slice(0, idx).trim(), zoneLabel: line.slice(idx + 3).trim() };
  });

const npcsByZoneAndName = new Map<string, { id: string }>();
for (const n of g.nodes as { id: string; type: string; label: string }[]) {
  if (n.type !== "npc") continue;
  const zoneId = "zone:" + n.id.split(":")[1];
  npcsByZoneAndName.set(`${zoneId}::${normName(n.label)}`, n);
}
const existingSells = new Set(
  g.edges
    .filter((e: { type: string }) => e.type === "sells")
    .map((e: { source: string; target: string }) => `${e.source}::${e.target}`)
);

const itemId = "item:backpack";
let addedToExisting = 0;
let newNpcCount = 0;
const unresolvedZones = new Set<string>();

for (const { name, zoneLabel } of rows) {
  const zoneId = resolveZone(zoneLabel);
  if (zoneId === undefined) {
    unresolvedZones.add(zoneLabel);
    continue;
  }
  if (zoneId === null) continue;

  const key = `${zoneId}::${normName(name)}`;
  const existingNpc = npcsByZoneAndName.get(key);
  if (existingNpc) {
    const edgeKey = `${existingNpc.id}::${itemId}`;
    if (!existingSells.has(edgeKey)) {
      addEdge(existingNpc.id, itemId, "sells");
      existingSells.add(edgeKey);
      addedToExisting++;
    }
  } else {
    const npcId = `npc:${zoneId.slice("zone:".length)}:${slug(name)}`;
    if (!hasNode(npcId)) {
      addNode({ id: npcId, label: name, type: "npc", roles: ["vendor"] });
      addEdge(npcId, zoneId, "located_in");
      newNpcCount++;
      npcsByZoneAndName.set(key, { id: npcId });
    }
    const edgeKey = `${npcId}::${itemId}`;
    if (!existingSells.has(edgeKey)) {
      addEdge(npcId, itemId, "sells");
      existingSells.add(edgeKey);
    }
  }
}

if (unresolvedZones.size > 0) {
  throw new Error(`unresolved zone labels: ${[...unresolvedZones].join(", ")}`);
}

save();
console.log(
  `Migration 407 complete: added Backpack sells edge to ${addedToExisting} existing vendors and created ${newNpcCount} new vendor NPCs.`
);
