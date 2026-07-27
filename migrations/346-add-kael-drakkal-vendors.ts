/**
 * Migration 346: add missing vendor npc nodes for zone:kael-drakkal -- see
 * issue #41 (data-quality audit flagged this zone as having zero vendors,
 * despite already carrying ~90 quest-giver NPCs).
 *
 * `Kael Drakkel`'s "Map Location Key" names no individual shop by a proper
 * name anywhere -- every merchant is described only by location number and
 * goods sold (same shape as Neriak Foreign Quarter, migration 345), so all
 * four become "?" vendor nodes (Crystal Caverns unnamed-merchant
 * precedent, migration 323). `sells` only set where an existing item node
 * genuinely matches a stated goods category (item:ration for "Food"/
 * "tickets and Food", item:mead for "Alcohol"); no edge invented for
 * vaguer categories (Othmir Hide Armor, Drakkel Weapons, Frozen Flower,
 * Dwarf Bone Toothpick, Spell Components) with no matching item in the
 * graph.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:kael-drakkal";

let added = 0;

function addNpc(id: string, label: string, roles: string[], opts: { sells?: string[] } = {}) {
  if (hasNode(id)) return;
  const node: Record<string, unknown> = { id, label, type: "npc", roles };
  if (opts.sells) node.sells = opts.sells;
  addNode(node);
  addEdge(id, ZONE_ID, "located_in");
  if (opts.sells) {
    for (const itemId of opts.sells) addEdge(id, itemId, "sells");
  }
  added++;
}

addNpc("npc:kael-drakkal:merchant-arena-tickets-food", "?", ["vendor"], { sells: ["item:ration"] });
addNpc("npc:kael-drakkal:merchant-food-drink-alcohol", "?", ["vendor"], { sells: ["item:ration", "item:mead"] });
addNpc("npc:kael-drakkal:merchant-hide-armor-weapons", "?", ["vendor"]);
addNpc("npc:kael-drakkal:merchant-spell-components", "?", ["vendor"]);

save();
console.log(`Migration 346 complete: ${added} npc node(s) added for zone:kael-drakkal`);
