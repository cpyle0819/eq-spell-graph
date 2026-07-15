/**
 * Migration 052: Add Kerra Island, a real EQL zone missing from the graph
 * entirely, and Health Potion -- the GitHub issue #26 checklist quest
 * skipped in migration 051 specifically because its giver and zone didn't
 * exist here yet.
 *
 * eqlwiki.com/Kerra_Island confirms it's a real zone page (distinct from
 * eqlwiki.com/Kerra_Isle, which is the *faction* page for the island's
 * inhabitants, not the zone -- that page's own banner says "Were you
 * looking for the zone Kerra Island?"): "Kerra Isle or Kerra Ridge is a
 * small island that lies just off the west coast of Odus... main
 * inhabitants are the Kerrans, a race of catlike people who are peaceful
 * until you make enemies of them," level range 15-25, Classic Era (no
 * `era` field needed, same as every other current-era zone). Its only
 * connection is "the tunnel on the east side of the bridge that spans the
 * river," to Toxxulia Forest -- one bidirectional `connects_to` edge, same
 * shape as migration 020's Stonebrunt Mountains. No known spell vendor, so
 * it gets that same migration's "uninhabited wilderness" faction template
 * (neutral race, safe class, neutral deity) rather than a guessed table --
 * the wiki documents no specific race/class faction gates for the zone
 * itself, only that killing Kerrans turns the Kerra Isle *faction*
 * against you, which is a quest-reward-level fact (Health Potion's own
 * positive tick), not a zone gate.
 *
 * Health Potion, quoted from its own page: Errrak Thickshank (-89, 273) in
 * Kerra Island trades a Giant Snake Fang, an Aviak Charm (aviaks in
 * Southern Karana), and a Tiger Skin (tigers in Emerald Jungle) for a Bone
 * Talisman -- "Slot: SECONDARY WIS: +4 SV MAGIC: +10 WT: 0.1 Size: TINY,"
 * magic and lore. Minimum level 20, all classes. "Your faction standing
 * with Kerra Isle got better" is the only reward beyond the item.
 *
 * The Tiger Skin's page-quoted alternate source, "the fighting pit on the
 * heretic island," isn't a zone this graph has under any name -- left as
 * prose only in `steps`, not a `located_in` edge, same treatment as every
 * unmatched-zone source in prior migrations. The Giant Snake Fang's
 * "various giant snakes" source names no zone at all, so it gets no edge
 * either.
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

function hasEdge(source: string, target: string, type: string): boolean {
  return graph.edges.some(
    (e: { data: { source: string; target: string; type: string } }) =>
      e.data.source === source && e.data.target === target && e.data.type === type
  );
}

function addEdge(source: string, target: string, type: string) {
  if (hasEdge(source, target, type)) return;
  graph.edges.push({ data: { id: `e-${type}-${graph.edges.length + 1}`, source, target, type } });
}

function slug(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function addFactionReward(questId: string, label: string) {
  const id = `faction:${slug(label)}`;
  addNode({ id, label, type: "faction" });
  addEdge(questId, id, "rewards");
}

function addGiver(id: string, label: string, zoneId: string) {
  addNode({ id, label, type: "npc", roles: ["quest_giver"] });
  addEdge(id, zoneId, "located_in");
}

// ---------------------------------------------------------------------
// Kerra Island (zone)
// ---------------------------------------------------------------------
const WILDERNESS_FACTION = {
  race: {
    barbarian: "neutral",
    "dark elf": "neutral",
    dwarf: "neutral",
    erudite: "neutral",
    gnome: "neutral",
    "half elf": "neutral",
    halfling: "neutral",
    "high elf": "neutral",
    human: "neutral",
    iksar: "neutral",
    ogre: "neutral",
    troll: "neutral",
    "wood elf": "neutral",
  },
  class: {
    bard: "safe",
    beastlord: "safe",
    cleric: "safe",
    druid: "safe",
    enchanter: "safe",
    magician: "safe",
    monk: "safe",
    necromancer: "safe",
    paladin: "safe",
    ranger: "safe",
    rogue: "safe",
    "shadow knight": "safe",
    shaman: "safe",
    warrior: "safe",
    wizard: "safe",
  },
  deity: {
    agnostic: "neutral",
    bertoxxulous: "neutral",
    "brell serilis": "neutral",
    bristlebane: "neutral",
    "cazic-thule": "neutral",
    "erollisi marr": "neutral",
    innoruuk: "neutral",
    karana: "neutral",
    "mithaniel marr": "neutral",
    prexus: "neutral",
    quellious: "neutral",
    "rallos zek": "neutral",
    "rodcet nife": "neutral",
    "solusek ro": "neutral",
    "the tribunal": "neutral",
    tunare: "neutral",
    veeshan: "neutral",
  },
};

const kerraIslandId = "zone:kerra-island";
addNode({
  id: kerraIslandId,
  label: "Kerra Island",
  type: "zone",
  faction: structuredClone(WILDERNESS_FACTION),
  lore: "Kerra Isle or Kerra Ridge is a small island that lies just off the west coast of Odus. This island's main inhabitants are the Kerrans, a race of catlike people who are peaceful until you make enemies of them.",
  wiki_title: "Kerra Island",
});
addEdge(kerraIslandId, "zone:toxxulia-forest", "connects_to");
addEdge("zone:toxxulia-forest", kerraIslandId, "connects_to");

// ---------------------------------------------------------------------
// Health Potion
// ---------------------------------------------------------------------
{
  const southernKaranaId = "zone:southern-karana";
  const emeraldJungleId = "zone:emerald-jungle";
  const giverId = "npc:kerra-island:errrak-thickshank";
  addGiver(giverId, "Errrak Thickshank", kerraIslandId);

  const questId = "quest:health-potion";
  addNode({
    id: questId,
    label: "Health Potion",
    type: "quest",
    description: "Errrak Thickshank on Kerra Island trades a Giant Snake Fang, an Aviak Charm (aviaks in Southern Karana), and a Tiger Skin (tigers in Emerald Jungle) for a Bone Talisman.",
    minLevel: 20,
    steps: [
      "Collect a Giant Snake Fang from a giant snake",
      "Collect an Aviak Charm from an aviak in Southern Karana",
      "Collect a Tiger Skin from a tiger in Emerald Jungle or the fighting pit on the heretic island",
      "Return all three to Errrak Thickshank on Kerra Island",
    ],
    wiki_title: "Health Potion",
  });
  addEdge(giverId, questId, "starts");
  addEdge(questId, kerraIslandId, "starts_in");
  addEdge(questId, kerraIslandId, "located_in");
  addEdge(questId, southernKaranaId, "located_in");
  addEdge(questId, emeraldJungleId, "located_in");

  const talismanId = "item:bone-talisman";
  addNode({
    id: talismanId,
    label: "Bone Talisman",
    type: "item",
    slots: ["Secondary"],
    stats: { wis: 4 },
    resists: { magic: 10 },
    weight: 0.1,
    size: "Tiny",
    magic: true,
    lore: true,
    source: "Health Potion reward (Errrak Thickshank, Kerra Island)",
  });
  addEdge(questId, talismanId, "rewards");
  addFactionReward(questId, "Kerra Isle");
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 052 complete: added Kerra Island zone and Health Potion quest");
