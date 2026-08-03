/**
 * Migration 404: adds the "Adventuring Supply Merchant" vendor archetype --
 * a single named merchant per major city, all sharing one fixed 13-item
 * catalog (confirmed directly on eqlwiki.com, both from item "Sold by"
 * tables and cross-checked against several individual merchant pages, e.g.
 * https://eqlwiki.com/Klok_Koglin, https://eqlwiki.com/A.S.A._VI,
 * https://eqlwiki.com/Beka, https://eqlwiki.com/Danloc_Starn -- identical
 * item list and prices on every one).
 *
 * Our own map data already referenced one of these ("Adventuring Supplies &
 * Parcels (Klok Koglin)", migration 285; "Agar's Adventuring Supplies",
 * migration 301) but no NPC node was ever created for them -- the Vendors
 * page's "Adventuring Supplies" Type filter (migration 400) was built from
 * whatever 8 items happened to already be scraped onto other vendors
 * (mostly food/drink merchants), not from this dedicated archetype.
 *
 * 16 of the 17 wiki-listed merchants have a home zone in this graph. The
 * 17th, Tuloline (Kelethin), is skipped: Kelethin isn't a modeled zone here
 * (only Greater/Lesser Faydark) -- adding a whole new zone is out of scope
 * for a vendor-gap fix.
 *
 * Of the 13 items, Backpack, Iron Ration, and Malachite already existed
 * (quest-reward sourced, never categorized nor vendor-linked); the other 5
 * (Boots of the Long Road, Fishing Pole, Large Harness, Tiny Dagger, Trinket
 * Pouch) are new nodes. Categorized per migration 400's taxonomy: general
 * adventuring tools/containers/food -> Adventuring Supplies; Boots of the
 * Long Road has real AC/HP/a slot -> Armor; Malachite (jewelcrafting gem)
 * and Tiny Dagger (Enchanter pet-summoning reagent, not an actual weapon --
 * no damage/skill on its wiki page) -> Tradeskill Supplies, the closest
 * existing bucket for a consumed-by-a-class-ability material.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, updateNode, slug, save } = loadGraph(import.meta.dir);

const NEW_ITEMS: Record<string, Record<string, unknown>> = {
  "item:fishing-pole": {
    label: "Fishing Pole",
    type: "item",
    slots: ["Primary"],
    weight: 1,
    size: "Tiny",
    source: "Sold by the Adventuring Supply Merchant archetype across many zones",
    category: "Adventuring Supplies",
  },
  "item:large-harness": {
    label: "Large Harness",
    type: "item",
    weight: 2,
    capacity: 4,
    containerSize: "Giant",
    source:
      "Container for giant-sized items; sold by the Adventuring Supply Merchant archetype across many zones",
    category: "Adventuring Supplies",
  },
  "item:trinket-pouch": {
    label: "Trinket Pouch",
    type: "item",
    weight: 1.5,
    size: "Small",
    capacity: 12,
    containerSize: "Tiny",
    source: "Sold by the Adventuring Supply Merchant archetype across many zones",
    category: "Adventuring Supplies",
  },
  "item:tiny-dagger": {
    label: "Tiny Dagger",
    type: "item",
    weight: 0.1,
    size: "Small",
    classes: ["enchanter"],
    source:
      "Reagent for Enchanter pet-summoning spells; sold by the Adventuring Supply Merchant archetype across many zones",
    category: "Tradeskill Supplies",
  },
  "item:boots-of-the-long-road": {
    label: "Boots of the Long Road",
    type: "item",
    slots: ["Feet"],
    ac: 4,
    hp: 5,
    weight: 1.5,
    size: "Small",
    magic: true,
    effect: "Spirit of the Traveler (Must Equip, Instant cast, 10s recast)",
    source: "Sold by the Adventuring Supply Merchant archetype across many zones",
    category: "Armor",
  },
};

for (const [id, data] of Object.entries(NEW_ITEMS)) {
  if (hasNode(id)) throw new Error(`node already exists: ${id}`);
  addNode({ id, ...data });
}

// Backpack, Iron Ration, and Malachite already existed as quest-reward-only
// nodes -- just add the category, keep their existing `source`.
if (!hasNode("item:backpack")) throw new Error("item:backpack missing");
updateNode("item:backpack", { category: "Adventuring Supplies" });
if (!hasNode("item:iron-ration")) throw new Error("item:iron-ration missing");
updateNode("item:iron-ration", { category: "Adventuring Supplies" });
if (!hasNode("item:malachite")) throw new Error("item:malachite missing");
updateNode("item:malachite", { category: "Tradeskill Supplies" });

const CATALOG = [
  "item:backpack",
  "item:bandages",
  "item:boots-of-the-long-road",
  "item:bottle-of-milk",
  "item:fishing-bait",
  "item:fishing-pole",
  "item:iron-ration",
  "item:large-harness",
  "item:malachite",
  "item:ration",
  "item:tiny-dagger",
  "item:trinket-pouch",
  "item:water-flask",
];

const MERCHANTS: { name: string; zoneId: string }[] = [
  { name: "A.S.A. VI", zoneId: "zone:ak-anon" },
  { name: "Otumar", zoneId: "zone:erudin" },
  { name: "Otumar", zoneId: "zone:paineel" },
  { name: "Lanadin", zoneId: "zone:northern-felwithe" },
  { name: "Pietro Drast", zoneId: "zone:east-freeport" },
  { name: "Lheron Drast", zoneId: "zone:west-freeport" },
  { name: "Beka", zoneId: "zone:grobb" },
  { name: "Waldadar", zoneId: "zone:halas" },
  { name: "Haneka Irontoe", zoneId: "zone:south-kaladim" },
  { name: "Neuven", zoneId: "zone:neriak-foreign-quarter" },
  { name: "Klok Koglin", zoneId: "zone:new-sebilis-expedition" },
  { name: "Rlabok", zoneId: "zone:oggok" },
  { name: "Danloc Starn", zoneId: "zone:north-qeynos" },
  { name: "Elgahn Starn", zoneId: "zone:south-qeynos" },
  { name: "Sasie Rambleroot", zoneId: "zone:rivervale" },
  { name: "Colnro Cedar", zoneId: "zone:surefall-glade" },
];

for (const { name, zoneId } of MERCHANTS) {
  if (!hasNode(zoneId)) throw new Error(`zone not found: ${zoneId}`);
  const npcId = `npc:${zoneId.slice("zone:".length)}:${slug(name)}`;
  if (hasNode(npcId)) throw new Error(`npc already exists: ${npcId}`);
  addNode({ id: npcId, label: name, type: "npc", roles: ["vendor"] });
  addEdge(npcId, zoneId, "located_in");
  for (const itemId of CATALOG) {
    if (!hasNode(itemId)) throw new Error(`item not found: ${itemId}`);
    addEdge(npcId, itemId, "sells");
  }
}

save();
console.log(
  `Migration 404 complete: added ${Object.keys(NEW_ITEMS).length} new items, categorized Backpack, and added ${MERCHANTS.length} Adventuring Supply Merchant NPCs (${MERCHANTS.length * CATALOG.length} sells edges).`
);
