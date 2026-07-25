/**
 * Migration 265: retire the `mob` node type (migration 060,
 * decisions/mob-node-type.md) -- every entity is now an `npc`, tagged via
 * the existing `roles` array (previously just "vendor"/"quest_giver", now
 * also "guard"/"guildmaster"/"mob"). Driven by a Maps redesign: the
 * Bestiary section becomes grouped-by-role lists instead of one flat mob
 * roster, and a single `npc`/`mob` split had no room for "guard" as its
 * own group. See decisions/npc-mob-unification-and-zone-groups.md.
 *
 * This is a real merge, not a type-flip: 206 `mob:<zone>:<slug>` ids
 * collide with an existing `npc:<zone>:<slug>` id for the *same person* --
 * eqlwiki.com tags every named page with its combat-stat template
 * regardless of role, and separate bestiary migrations (060 on) added a
 * second node instead of recognizing the quest-giver/vendor already
 * there. Confirmed every `mob:` node's only edge is its own `located_in`
 * (nothing else references a mob id), so merging the level data into the
 * npc counterpart and dropping the mob node loses nothing.
 *
 * Role assigned to each former mob: "guard" if the label matches
 * /^(A |An )?Guard /, else "mob" -- except GUILDMASTER_OVERRIDES below,
 * which have no detectable label pattern (a guildmaster's name looks like
 * any other named mob) and were only found by cross-referencing
 * decisions/eqlwiki-mediawiki-api-for-messy-bestiary-categories.md's
 * "Kaladim's own guildmaster entries are a known, not-yet-fixed
 * inconsistency" note against the live graph.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const GUARD_RE = /^(A |An )?Guard /;

// These 3 are the exact bug this migration fixes, just pre-identified: eqlwiki
// gave North Kaladim's guild trainers full NPC stat blocks like any other
// named mob, so migration 238 added them a second time under a mob: id.
// Nothing in their label distinguishes "guildmaster" from "generic named
// mob" -- this override is the only reason they don't fall through to the
// "mob" default below.
const GUILDMASTER_OVERRIDES = new Set([
  "north-kaladim:gunlok-jure",
  "north-kaladim:datur-nightseer",
  "north-kaladim:priestess-ghalea",
]);

// A handful of npc-only Guard-named nodes have no mob: counterpart to merge
// with (no duplicate was ever created for them) -- they still need the
// "guard" role added directly so they show up in the new Guards group.
const NPC_ONLY_GUARDS = ["north-qeynos:guard-elron", "north-qeynos:guard-weleth"];

function deriveRole(id: string, label: string): string {
  const suffix = id.slice("mob:".length);
  if (GUILDMASTER_OVERRIDES.has(suffix)) return "guildmaster";
  return GUARD_RE.test(label) ? "guard" : "mob";
}

const mobNodes = graph.nodes.filter((n: any) => n.data.type === "mob");
const npcById = new Map(graph.nodes.filter((n: any) => n.data.type === "npc").map((n: any) => [n.data.id, n]));

const mobNodeIdsToDelete = new Set<string>();
let mergedCount = 0;
let convertedCount = 0;

for (const mobNode of mobNodes) {
  const { id, label, minLevel, maxLevel } = mobNode.data;
  const suffix = id.slice("mob:".length);
  const npcId = `npc:${suffix}`;
  const role = deriveRole(id, label);
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

for (const suffix of NPC_ONLY_GUARDS) {
  const npc = npcById.get(`npc:${suffix}`);
  if (!npc) throw new Error(`expected npc:${suffix} to exist`);
  const roles: string[] = npc.data.roles || [];
  if (!roles.includes("guard")) roles.push("guard");
  npc.data.roles = roles;
}

// Drop the now-redundant mob nodes and their sole edge (located_in) --
// npcById are still both zone-namespaced with the same zone target
graph.nodes = graph.nodes.filter((n: any) => !mobNodeIdsToDelete.has(n.data.id));
graph.edges = graph.edges.filter((e: any) => !mobNodeIdsToDelete.has(e.data.source) && !mobNodeIdsToDelete.has(e.data.target));

save();

console.log(`Merged ${mergedCount} mob/npc duplicate pairs, converted ${convertedCount} standalone mobs to npc, deleted ${mobNodeIdsToDelete.size} redundant nodes.`);
