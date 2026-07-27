/**
 * Migration 348: add missing vendor npc node for zone:icewell-keep -- see
 * issue #41 (data-quality audit flagged this zone as having zero vendors,
 * despite already carrying 43 mob/quest-giver NPCs).
 *
 * `Icewell Keep`'s "Map" section names exactly one vendor spot: location 2,
 * "Coldain Outcasts selling Coldain Weapons and Armor, Lantern Molds,
 * Jeweler's Kit and Gems" -- kept as its own named vendor node (the page
 * treats "Coldain Outcasts" as a proper name for the spot, same as other
 * collective-name shops elsewhere, e.g. migration 345's "Silk Underground").
 * No `sells` edge added -- Weapons/Armor/Molds/Jeweler's Kit/Gems are all
 * vague categories with no genuinely matching item node in the graph
 * (consistent with the conservative-sells-edge rule used in migrations
 * 344-347).
 *
 * The zone's separate "43 mobs, expected mostly vendors/guards" flag (many
 * Royal Guardsman/Sentinel/Watcher/Councilor NPCs currently labeled plain
 * `mob`) is left untouched here -- that's issue #41's high-mob-count-city
 * verification pass, a distinct task from this zone's vendor gap.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:icewell-keep";

let added = 0;

function addNpc(id: string, label: string, roles: string[]) {
  if (hasNode(id)) return;
  addNode({ id, label, type: "npc", roles });
  addEdge(id, ZONE_ID, "located_in");
  added++;
}

addNpc("npc:icewell-keep:coldain-outcasts", "Coldain Outcasts", ["vendor"]);

save();
console.log(`Migration 348 complete: ${added} npc node(s) added for zone:icewell-keep`);
