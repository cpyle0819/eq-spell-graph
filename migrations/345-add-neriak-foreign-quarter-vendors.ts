/**
 * Migration 345: add missing npc nodes for zone:neriak-foreign-quarter --
 * see issue #41 (data-quality audit flagged this zone as having zero
 * vendors, despite already carrying 27 mobs/guards from an earlier pass).
 *
 * `Neriak Foreign Quarter` has no standalone eqlwiki page (it redirects to
 * `Neriak`, which covers all four Neriak sub-zones together) and its own
 * `{{Namedmobpage}}` category names no vendor NPCs at all -- same shape as
 * Highpass Hold (migration 344). The `Neriak` page's "Map" section lists
 * the Foreign Quarter's 17 numbered locations; 8 are given a proper shop
 * name (kept as their own vendor node), the rest are described only by
 * goods sold with no name at all (kept as "?" vendor nodes, same as Crystal
 * Caverns' unnamed-merchant precedent, migration 323). `sells` only set
 * where an existing item node genuinely matches a stated goods category
 * (item:mead for "Alcohol", item:ration for "Food(items)"); no edge
 * invented for vaguer categories (Weapons, Spells, Potions/Crystals,
 * Jewelry/Gems, Cloth Armor, Chainmail Patterns/Molds) with no matching
 * item in the graph.
 *
 * The category scrape also turned up "Guard V`Lask" (level 35, Warrior,
 * Dark Bargainers -2), a named guard missing from the earlier mob-only
 * pass; added alongside the vendor fix since it was already zone-confirmed
 * in the same fetch. "Guard S`Kor" excluded: its `level` field is a bare
 * `??` with no numeric endpoint anywhere, same "no lower bound at all
 * means excluded" precedent as prior zones.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:neriak-foreign-quarter";

let added = 0;

function addNpc(id: string, label: string, roles: string[], opts: { minLevel?: number; maxLevel?: number; sells?: string[] } = {}) {
  if (hasNode(id)) return;
  const node: Record<string, unknown> = { id, label, type: "npc", roles };
  if (opts.minLevel !== undefined) node.minLevel = opts.minLevel;
  if (opts.maxLevel !== undefined) node.maxLevel = opts.maxLevel;
  if (opts.sells) node.sells = opts.sells;
  addNode(node);
  addEdge(id, ZONE_ID, "located_in");
  if (opts.sells) {
    for (const itemId of opts.sells) addEdge(id, itemId, "sells");
  }
  added++;
}

// Named shops from the zone's own map key
addNpc(`npc:neriak-foreign-quarter:${slug("The Smugglers Inn")}`, "The Smugglers Inn", ["vendor"], { sells: ["item:mead", "item:ration"] });
addNpc(`npc:neriak-foreign-quarter:${slug("Silk Underground")}`, "Silk Underground", ["vendor"]);
addNpc(`npc:neriak-foreign-quarter:${slug("Dranas Bread and Butcher")}`, "Dranas Bread and Butcher", ["vendor"], { sells: ["item:ration"] });
addNpc(`npc:neriak-foreign-quarter:${slug("Slug's Tavern")}`, "Slug's Tavern", ["vendor"], { sells: ["item:mead", "item:ration"] });
addNpc(`npc:neriak-foreign-quarter:${slug("Gambel's Greens")}`, "Gambel's Greens", ["vendor"]);
addNpc(`npc:neriak-foreign-quarter:${slug("Pig Stickers")}`, "Pig Stickers", ["vendor"]);
addNpc(`npc:neriak-foreign-quarter:${slug("Bites n Pieces")}`, "Bites n Pieces", ["vendor"], { sells: ["item:ration"] });
addNpc(`npc:neriak-foreign-quarter:${slug("Shinie Tings")}`, "Shinie Tings", ["vendor"]);

// Unnamed shops -- map key gives goods sold but no shop/merchant name
addNpc("npc:neriak-foreign-quarter:merchant-tradeskill-goods", "?", ["vendor"]);
addNpc("npc:neriak-foreign-quarter:merchant-weapons-1", "?", ["vendor"]);
addNpc("npc:neriak-foreign-quarter:merchant-blacksmith-molds", "?", ["vendor"]);
addNpc("npc:neriak-foreign-quarter:merchant-armor", "?", ["vendor"]);
addNpc("npc:neriak-foreign-quarter:merchant-food-alcohol-1", "?", ["vendor"], { sells: ["item:mead", "item:ration"] });
addNpc("npc:neriak-foreign-quarter:merchant-spells", "?", ["vendor"]);
addNpc("npc:neriak-foreign-quarter:merchant-pvp-goods", "?", ["vendor"], { sells: ["item:mead", "item:ration"] });

// Named guard missed by the earlier mob-only pass
addNpc(`npc:neriak-foreign-quarter:${slug("Guard V`Lask")}`, "Guard V`Lask", ["guard"], { minLevel: 35, maxLevel: 35 });

save();
console.log(`Migration 345 complete: ${added} npc node(s) added for zone:neriak-foreign-quarter`);
