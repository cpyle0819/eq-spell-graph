/**
 * Migration 344: add missing npc nodes for zone:highpass-hold -- see issue
 * #41 (data-quality audit flagged this city as having zero vendors, despite
 * already carrying 4 quest-givers and 38 mobs from an earlier pass).
 *
 * The zone's own page names no individual vendor NPCs -- its "Map" section
 * lists six buildings by their own name instead: The Golden Rooster
 * (Brewing Supplies/Alcohol/Misc), an unnamed pottery shop (Kiln/Pottery
 * Wheel/Goods/Food/Pottery Sketches), Tiger's Roar (Alcohol/Brew Barrel/
 * Oven/Brewing Supplies), Serpent Supply (Kiln/Pottery Wheel/Food/Forge/
 * Tailoring Supplies), Greenbanes' Weapons (Weapons/Clay/Firing Sheets/
 * Forge), and The Lumberyard (Brew Barrel/Alcohol). Each becomes its own
 * vendor node under the shop's own name (or "?" for the one the page never
 * names, same as Crystal Caverns' unnamed-merchant precedent) -- `sells`
 * only set where an existing item node genuinely matches what the page
 * states the shop carries (item:mead for "Alcohol", item:ration for
 * "Food"); no `sells` edge invented for vaguer categories like "Weapons" or
 * "Pottery Sketches" with no matching item in the graph.
 *
 * The zone's `{{Namedmobpage}}` category also turned up NPCs the earlier
 * mob-only pass missed entirely:
 * - "Anson McBale" (level 61, class "GM Rogue") and "Cyrla Shadowstepper"
 *   (level 61, class "Rogue Trainer") -- both guildmasters, per the zone's
 *   own map key naming Cyrla as the "Rogue Trainer" in the smuggler's-area
 *   room.
 * - "A Guard"/"Guard Becker"/"Guard Stald" -- match the `/^(A |An )?Guard /`
 *   guard-role pattern (decisions/npc-mob-unification-and-zone-groups.md).
 * - "Dyllin Starsine" (Bloodsabers faction), "A Highpass Citizen", "A
 *   Smuggler", "Volunteer Renlor", "Volunteer Delharn", "Commander Thafer",
 *   "Gublink Furnhorn", "Malik Zaren", "Jovan", "Alhareen the Just" -- all
 *   carry full combat stat blocks despite civilian-sounding names; the
 *   zone's own text describes a hostile smuggler/bandit camp operating
 *   alongside the legitimate town (all of these share the "Carson McCabe"
 *   faction hit except the last three, which read as unaffiliated wandering
 *   named mobs) -- kept as `mob`, same "stats over role" call as prior
 *   friendly-city batches.
 *
 * Two candidates excluded for failing the own-`zone`-field check with no
 * corroborating signal: "Sir Edwin Motte" (zone: Qeynos Hills) and "Lydl
 * the Great" (zone: Freeport) -- neither appears anywhere on Highpass
 * Hold's own zone page.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, slug, save } = loadGraph(import.meta.dir);

const ZONE_ID = "zone:highpass-hold";

let added = 0;

function addNpc(label: string, roles: string[], opts: { minLevel?: number; maxLevel?: number; sells?: string[] } = {}) {
  const id = `npc:highpass-hold:${slug(label)}`;
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

// Shops named by the zone's own map key
addNpc("The Golden Rooster", ["vendor"], { sells: ["item:mead"] });
addNpc("Tiger's Roar", ["vendor"], { sells: ["item:mead"] });
addNpc("Serpent Supply", ["vendor"], { sells: ["item:ration"] });
addNpc("Greenbanes' Weapons", ["vendor"]);
addNpc("The Lumberyard", ["vendor"], { sells: ["item:mead"] });
addNpc("?", ["vendor"], { sells: ["item:ration"] }); // the pottery shop the zone page never names

// Guildmasters
addNpc("Anson McBale", ["guildmaster"], { minLevel: 61, maxLevel: 61 });
addNpc("Cyrla Shadowstepper", ["guildmaster"], { minLevel: 61, maxLevel: 61 });

// Guards (name pattern per decisions/npc-mob-unification-and-zone-groups.md)
addNpc("A Guard", ["guard"], { minLevel: 20, maxLevel: 36 });
addNpc("Guard Becker", ["guard"], { minLevel: 23, maxLevel: 23 });
addNpc("Guard Stald", ["guard"], { minLevel: 14, maxLevel: 14 });

// Mobs (full combat stat blocks despite civilian-sounding names)
addNpc("Dyllin Starsine", ["mob"], { minLevel: 16, maxLevel: 16 });
addNpc("A Highpass Citizen", ["mob"], { minLevel: 20, maxLevel: 20 });
addNpc("A Smuggler", ["mob"], { minLevel: 12, maxLevel: 18 });
addNpc("Volunteer Renlor", ["mob"], { minLevel: 5, maxLevel: 5 });
addNpc("Volunteer Delharn", ["mob"], { minLevel: 4, maxLevel: 4 });
addNpc("Commander Thafer", ["mob"], { minLevel: 37, maxLevel: 37 });
addNpc("Gublink Furnhorn", ["mob"], { minLevel: 35, maxLevel: 35 });
addNpc("Malik Zaren", ["mob"], { minLevel: 16, maxLevel: 16 });
addNpc("Jovan", ["mob"], { minLevel: 35, maxLevel: 35 });
addNpc("Alhareen the Just", ["mob"], { minLevel: 61, maxLevel: 61 });

save();
console.log(`Migration 344 complete: ${added} npc node(s) added for zone:highpass-hold`);
