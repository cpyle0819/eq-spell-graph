/**
 * Migration 049: zone-level era tagging, prompted by an audit request --
 * quests were showing up in Firiona Vie, East/West Cabilis, etc. with no
 * indication those are Kunark/Velious content. Until now `era` only
 * existed on `quest`/`quest_line` nodes (decisions/quest-era-flagging.md);
 * this extends the same plain-label convention to `zone` nodes, verified
 * directly against each zone's own eqlwiki.com page (raw wikitext via
 * `action=raw`, not a WebFetch summary -- the summarizer briefly produced
 * a wrong grouping for Plane of Growth/Mischief on a first pass, resolved
 * by re-checking the raw `{{...Era}}` template on each page).
 *
 * Confirmed out-of-era zones already present in the graph:
 * - Kunark: Firiona Vie, East Cabilis, West Cabilis, Field of Bone,
 *   Emerald Jungle, Frontier Mountains, Lake of Ill Omen, The Overthere,
 *   Skyfire Mountains
 * - Velious: Kael Drakkal, Great Divide, Iceclad Ocean, Eastern Wastes,
 *   The Wakening Land, Skyshrine, Thurgadin
 *
 * New zones added (previously missing, which is why several quests got
 * deferred across migrations 045/047/048 -- Dain's Head, Di'Zok Signet of
 * Service Quest, Dozekar Tear Quests, Dragon Scales Quest, Emerald
 * Dragonscale Quest, Entalon's Quest, Essence Lens Quest, Froglok Tad
 * Tongues, Fusibility Research, Giant Helmets, Gloves of Earthcrafting
 * Quest -- all blocked on one of these):
 * - Kunark: Burning Wood (the actual page title; players commonly say
 *   "Burning Woods", per the page's own parenthetical), Swamp of No Hope
 * - Velious: Cobalt Scar, Temple of Veeshan, Western Wastes, Icewell Keep,
 *   Sleeper's Tomb, Plane of Growth, Plane of Mischief, and Chardok
 *
 * Chardok is a genuine wrinkle: the bare "Chardok" title redirects to
 * "Chardok (Post-Revamp)", which carries a one-off `{{Chardok Revamp
 * Era}}` template, not the standard `{{Kunark Era}}`/`{{Velious Era}}`
 * pair -- but that page's own text states "Chardok underwent a
 * significant Velious-era revamp." A separate, non-canonical "Chardok
 * (Pre-Revamp)" page still carries the plain `{{Kunark Era}}` tag. Since
 * the bare title (what every quest page actually links to) resolves to
 * Post-Revamp, this zone is modeled as Velious, matching the page the
 * wiki treats as current -- not the Kunark hub-page bucket, which turned
 * out to be a coarse simplification for this one zone.
 *
 * These 10 new zones intentionally have no `faction` table and no
 * `connects_to` edges yet -- every existing zone has a full race/class/
 * deity faction table, but sourcing that for 10 zones is a separate,
 * substantial research pass, and nothing here needs it yet (no vendor is
 * located_in any of them). Schema/data grows when real data demands it,
 * not speculatively -- same reasoning as item-node-schema.md's capacity/
 * containerSize fields.
 *
 * Not in scope for this migration: re-researching and un-deferring the
 * quests these new zones unblock. That's real follow-up work, tracked
 * separately, not bundled into an already-large zone/era audit.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

function hasNode(id: string): boolean {
  return graph.nodes.some((n: { data: { id: string } }) => n.data.id === id);
}

function addNode(data: Record<string, unknown>) {
  if (!hasNode(data.id as string)) graph.nodes.push({ data });
}

function setEra(zoneId: string, era: string) {
  const node = graph.nodes.find((n: { data: { id: string } }) => n.data.id === zoneId);
  if (!node) throw new Error(`Zone not found: ${zoneId}`);
  node.data.era = era;
}

// ---------------------------------------------------------------------
// Existing zones: backfill confirmed era
// ---------------------------------------------------------------------
const KUNARK_EXISTING = [
  "zone:firiona-vie", "zone:east-cabilis", "zone:west-cabilis", "zone:field-of-bone",
  "zone:emerald-jungle", "zone:frontier-mountains", "zone:lake-of-ill-omen",
  "zone:the-overthere", "zone:skyfire-mountains",
];
const VELIOUS_EXISTING = [
  "zone:kael-drakkal", "zone:great-divide", "zone:iceclad-ocean", "zone:eastern-wastes",
  "zone:the-wakening-land", "zone:skyshrine", "zone:thurgadin",
];
for (const zoneId of KUNARK_EXISTING) setEra(zoneId, "Kunark");
for (const zoneId of VELIOUS_EXISTING) setEra(zoneId, "Velious");

// ---------------------------------------------------------------------
// New zones (Kunark)
// ---------------------------------------------------------------------
addNode({
  id: "zone:burning-wood",
  label: "Burning Wood",
  type: "zone",
  era: "Kunark",
  lore: "The Burning Wood was once an ancient, beautiful forest. Now, however, its surface has been scarred by the fiery meteors that have stricken this area in the recent centuries, leaving its surface marred and aflame.",
  wiki_title: "Burning Wood",
});
addNode({
  id: "zone:swamp-of-no-hope",
  label: "Swamp of No Hope",
  type: "zone",
  era: "Kunark",
  lore: "The Swamp of No Hope is a vast marsh, extending from the southeast corner of Cabilis far to the east. After the fall of the Iksar empire, the frogloks, ancient enemies of the Iksar, retook the swamp and made it their home.",
  wiki_title: "Swamp of No Hope",
});

// ---------------------------------------------------------------------
// New zones (Velious)
// ---------------------------------------------------------------------
addNode({
  id: "zone:cobalt-scar",
  label: "Cobalt Scar",
  type: "zone",
  era: "Velious",
  lore: "Cobalt Scar is named after the scarring left by Veeshan as she clawed Norrath during the Dawn of Days. Large amounts of water has filled in the gouges she left behind, and now the sirens of the Siren's Grotto use its cover to lure unknowing ship crews into protruding rocks.",
  wiki_title: "Cobalt Scar",
});
addNode({
  id: "zone:chardok",
  label: "Chardok",
  type: "zone",
  era: "Velious",
  lore: "Chardok is the site of the ancient sarnak military fortress that has existed for centuries since the time of Emperor Atrebe, and is considered by the sarnaks to be their home.",
  wiki_title: "Chardok (Post-Revamp)",
});
addNode({
  id: "zone:temple-of-veeshan",
  label: "Temple of Veeshan",
  type: "zone",
  era: "Velious",
  lore: "In the second gorge made by Veeshan the dragons built the great Temple of Veeshan where they perpetually worship their mother who deposited the first brood there eons ago. This giant temple is home to some of the mightiest dragons of Velious.",
  wiki_title: "Temple of Veeshan",
});
addNode({
  id: "zone:western-wastes",
  label: "Western Wastes",
  type: "zone",
  era: "Velious",
  lore: "Long, long ago the great wurm Veeshan found the barren world of Norrath. She marked the lifeless void with her claw as a warning to all other deities that it now belonged to her. Her claws fell upon the continent of Velious marking the Western Wastes with two great gorges the dragons hold sacred.",
  wiki_title: "Western Wastes",
});
addNode({
  id: "zone:icewell-keep",
  label: "Icewell Keep",
  type: "zone",
  era: "Velious",
  lore: "Icewell Keep is the home of Dain, the lord of the Coldain. It is situated deeper in the mountains than Thurgadin for added protection.",
  wiki_title: "Icewell Keep",
});
addNode({
  id: "zone:sleepers-tomb",
  label: "Sleeper's Tomb",
  type: "zone",
  era: "Velious",
  lore: "Kerafyrm's Lair, also known as Sleeper's Tomb, is a dark dungeon located beneath the icy wastes of Velious, and was used by the First Brood to imprison the dragon Kerafym.",
  wiki_title: "Sleeper's Tomb",
});
addNode({
  id: "zone:plane-of-growth",
  label: "Plane of Growth",
  type: "zone",
  era: "Velious",
  lore: "This is the planar home of Tunare, the goddess of nature. It's entered via a portal at the top of the tower in the central part of the Wakening Land.",
  wiki_title: "Plane of Growth",
});
addNode({
  id: "zone:plane-of-mischief",
  label: "Plane of Mischief",
  type: "zone",
  era: "Velious",
  lore: "This plane is the domain of the god of mischief, Bristlebane Fizzlethrope. Full of invisible walls, one-sided doors, twisting halls, and plenty of peculiar inhabitants. The entrance is in the northern wing of the Temple of Veeshan.",
  wiki_title: "Plane of Mischief",
});

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 049 complete: 16 existing zones tagged with confirmed era, 10 new Kunark/Velious zones added");
