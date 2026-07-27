/**
 * Migration 277: fix migrations 274-276 (Northern/Southern Desert of
 * Ro, Toxxulia Forest bestiaries) -- they copied the pre-265 `mob:<zone>:
 * <slug>` node shape (`type: "mob"`) instead of the current unified `npc`
 * schema (`type: "npc"`, `roles` array) that migration 265 established
 * (decisions/npc-mob-unification-and-zone-groups.md). The UI's Bestiary
 * groups only read `npc` nodes by `roles`, so all 106 mobs from that batch
 * were invisible -- each of the three zones showed only its handful of
 * pre-existing quest-givers.
 *
 * Same merge logic as migration 265 itself:
 * - "Ortallius" (southern-desert-of-ro) already existed as an
 *   `npc:...:ortallius` quest-giver -- union `roles`, copy `minLevel`/
 *   `maxLevel` onto it, drop the redundant `mob:` node.
 * - Every other `mob:` node in these three zones has no npc counterpart --
 *   convert in place to `type: "npc"`, `roles: ["guard"]` if the label
 *   matches `/^(A |An )?Guard /` (Guard Brendyl/Fintran/Stoutman), else
 *   `roles: ["mob"]`. No guildmaster-pattern overrides apply here.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const GUARD_RE = /^(A |An )?Guard /;
const ZONES = ["northern-desert-of-ro", "southern-desert-of-ro", "toxxulia-forest"];

function deriveRole(label: string): string {
  return GUARD_RE.test(label) ? "guard" : "mob";
}

const mobNodes = graph.nodes.filter(
  (n: any) => n.data.type === "mob" && ZONES.some((z) => n.data.id.startsWith(`mob:${z}:`))
);
const npcById = new Map(graph.nodes.filter((n: any) => n.data.type === "npc").map((n: any) => [n.data.id, n]));

const mobNodeIdsToDelete = new Set<string>();
let mergedCount = 0;
let convertedCount = 0;

for (const mobNode of mobNodes) {
  const { id, label, minLevel, maxLevel } = mobNode.data;
  const suffix = id.slice("mob:".length);
  const npcId = `npc:${suffix}`;
  const role = deriveRole(label);
  const npcCounterpart = npcById.get(npcId);

  if (npcCounterpart) {
    const roles: string[] = npcCounterpart.data.roles || [];
    if (!roles.includes(role)) roles.push(role);
    npcCounterpart.data.roles = roles;
    if (minLevel !== undefined) npcCounterpart.data.minLevel = minLevel;
    if (maxLevel !== undefined) npcCounterpart.data.maxLevel = maxLevel;
    mobNodeIdsToDelete.add(id);
    mergedCount++;
  } else {
    mobNode.data.type = "npc";
    mobNode.data.roles = [role];
    convertedCount++;
  }
}

graph.nodes = graph.nodes.filter((n: any) => !mobNodeIdsToDelete.has(n.data.id));
graph.edges = graph.edges.filter(
  (e: any) => !mobNodeIdsToDelete.has(e.data.source) && !mobNodeIdsToDelete.has(e.data.target)
);

save();

console.log(
  `Migration 277 complete: merged ${mergedCount} mob/npc duplicate pair(s), converted ${convertedCount} standalone mob(s) to npc, deleted ${mobNodeIdsToDelete.size} redundant node(s).`
);
