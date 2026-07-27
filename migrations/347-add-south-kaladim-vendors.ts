/**
 * Migration 347: add missing vendor npc nodes for zone:south-kaladim -- see
 * issue #41 (data-quality audit flagged this zone as having zero vendors,
 * despite already carrying ~30 quest-givers/guards/mobs).
 *
 * `Kaladim`'s "Map" section (South Kaladim half) names several shops and
 * individual merchants directly: Tanned Assets, Irontoe's Eats, Staff and
 * Spear (Didek Stormhammer selling Swords, Alanury Stormhammer selling
 * Fletching Supplies), Redfist's Metal, Pub Kal (Hanamaf Darkfoam & Dura
 * Darkfoam selling Alcohol), and Gurtha's Ware -- each becomes its own
 * named vendor node. Three remaining shops give no name at all (Warrior's
 * Guild weapon merchant, a Potions/Crystals merchant, a Bags merchant) --
 * kept as "?" vendor nodes (Crystal Caverns unnamed-merchant precedent,
 * migration 323). `sells` only set where an existing item node genuinely
 * matches a stated goods category (item:mead for "Alcohol", item:ration
 * for "Meat Pies"); no edge invented for vaguer categories (Swords,
 * Fletching Supplies, Small Leather/Cloth Armor, Small Shields, Pottery
 * Supplies, Potions/Crystals, Bags) with no matching item in the graph.
 *
 * "Didek Stormhammer" is a distinct NPC from the zone's existing
 * `mob:south-kaladim:guard-didek` (a guard, not a vendor) -- no merge.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:south-kaladim";

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

addNpc(`npc:south-kaladim:${slug("Tanned Assets")}`, "Tanned Assets", ["vendor"]);
addNpc(`npc:south-kaladim:${slug("Irontoe's Eats")}`, "Irontoe's Eats", ["vendor"], { sells: ["item:mead", "item:ration"] });
addNpc(`npc:south-kaladim:${slug("Didek Stormhammer")}`, "Didek Stormhammer", ["vendor"]);
addNpc(`npc:south-kaladim:${slug("Alanury Stormhammer")}`, "Alanury Stormhammer", ["vendor"]);
addNpc(`npc:south-kaladim:${slug("Redfist's Metal")}`, "Redfist's Metal", ["vendor"]);
addNpc(`npc:south-kaladim:${slug("Hanamaf Darkfoam")}`, "Hanamaf Darkfoam", ["vendor"], { sells: ["item:mead"] });
addNpc(`npc:south-kaladim:${slug("Dura Darkfoam")}`, "Dura Darkfoam", ["vendor"], { sells: ["item:mead"] });
addNpc(`npc:south-kaladim:${slug("Gurtha's Ware")}`, "Gurtha's Ware", ["vendor"]);

addNpc("npc:south-kaladim:merchant-various-weapons", "?", ["vendor"]);
addNpc("npc:south-kaladim:merchant-potions-crystals", "?", ["vendor"]);
addNpc("npc:south-kaladim:merchant-bags", "?", ["vendor"]);

save();
console.log(`Migration 347 complete: ${added} npc node(s) added for zone:south-kaladim`);
