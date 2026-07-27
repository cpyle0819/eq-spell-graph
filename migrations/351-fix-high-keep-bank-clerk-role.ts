/**
 * Migration 351: fixes issue #41's high-mob-count flag for zone:high-keep by
 * reclassifying one obviously non-combat NPC out of the `mob` role.
 *
 * `mob:high-keep:bank-clerk-jaylin` ("Bank Clerk Jaylin") is self-descriptively
 * a bank employee, not a creature -- same reasoning as the `banker` role added
 * for Crystal Caverns (migration 323). High Keep's own map text lists a "Bank"
 * location; this is that bank's clerk.
 *
 * The rest of High Keep's ~47 mob-role NPCs (goblin raiders, named citizens/
 * captives with levels, the "Guard <name>" roster already correctly tagged
 * `guard`) were checked against eqlwiki and are real leveled NPCs kept
 * deliberately, consistent with the "stats over name" rule used for Thurgadin
 * (migration 302) and Icewell Keep -- left untouched.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const node = graph.nodes.find((n: { id: string }) => n.id === "mob:high-keep:bank-clerk-jaylin");
if (!node) throw new Error("expected mob:high-keep:bank-clerk-jaylin to exist");

node.roles = (node.roles || []).filter((r: string) => r !== "mob").concat("banker");

save();
console.log("Migration 351 complete: Bank Clerk Jaylin converted from mob to banker role");
