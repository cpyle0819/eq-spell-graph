/**
 * Migration 442 (issue #49, batch 1/N): Fletching's crafting container, the
 * Fletching Kit -- see decisions/tradeskill-recipe-node-schema.md for the
 * `container` node schema.
 *
 * eqlwiki.com's own `Fletching Kit` page gives it a real statsblock (WT 2.0,
 * Capacity 8, Size Capacity LARGE, merchant value 9g 2s 3c) and a 16-vendor
 * `soldby` table -- a portable, vendor-purchased container like
 * Jewelcrafting's Jeweler's Kit or Alchemy's Medicine Bag, not a
 * Brew-Barrel-style world fixture. Its own page's vendor table is used here
 * (not the broader Skill Fletching page's own Vendors table, which also
 * covers who separately sells finished Arrows/Bows) -- same "the item's own
 * page is the source for its own sells edges" precedent as every prior
 * container migration.
 *
 * 8 of 16 vendors already existed in this graph (Klok Gogon, Fugla, Jessica
 * Winter, Merchant Sylnis, Dianax C`Luzz, Tonsia -- all already `vendor`;
 * Argash was `quest_giver`-only, given the same role-fixup treatment as
 * Alchemy/Jewelcrafting's own pre-existing-NPC cases).
 *
 * **A caught wiki inconsistency**: the Fletching Kit page's own soldby table
 * lists "Tin Merchant X" in The Overthere, but this graph already has
 * "Tin Merchant XI" at the same zone (added by an earlier tradeskill,
 * matching coordinates) -- almost certainly the same generic clockwork
 * merchant, with the wiki's numbering off by one between pages. Reused the
 * existing node rather than creating a near-duplicate, same "individual page
 * can still be wrong" call as Tailoring's Ice Silk Robe / Alchemy's Guri
 * findings.
 *
 * Sourced from eqlwiki.com's raw wikitext via its MediaWiki API
 * (`action=query&prop=revisions`), not WebFetch's summarizer.
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

addNode({
  id: "container:fletching-kit",
  label: "Fletching Kit",
  type: "container",
  weight: 2.0,
  containerSize: "Large",
  capacity: 8,
  category: "Tradeskill Supplies",
});

let npcsAdded = 0;
let rolesFixed = 0;
let sellsEdgesAdded = 0;

function addVendor(id: string, label: string, zoneId: string | null, needsRoleFixup: boolean) {
  if (!hasNode(id)) {
    addNode({ id, label, type: "npc", roles: ["vendor"] });
    if (zoneId) addEdge(id, zoneId, "located_in");
    npcsAdded++;
  } else if (needsRoleFixup) {
    const node = graph.nodes.find((n: { id: string }) => n.id === id);
    if (node) {
      node.roles = [...(node.roles ?? []), "vendor"];
      rolesFixed++;
    }
  }
  addEdge(id, "container:fletching-kit", "sells");
  sellsEdgesAdded++;
}

addVendor("npc:east-cabilis:klok-gogon", "Klok Gogon", "zone:east-cabilis", false);
addVendor("npc:west-cabilis:zotalz", "Zotalz", "zone:west-cabilis", false);
addVendor("npc:the-feerrott:fugla", "Fugla", "zone:the-feerrott", false);
addVendor("npc:firiona-vie:jessica-winter", "Jessica Winter", "zone:firiona-vie", false);
addVendor("npc:firiona-vie:fleceal-summer", "Fleceal Summer", "zone:firiona-vie", false);
addVendor("npc:greater-faydark:merchant-lanin", "Merchant Lanin", "zone:greater-faydark", false);
addVendor("npc:greater-faydark:merchant-sylnis", "Merchant Sylnis", "zone:greater-faydark", false);
addVendor("npc:halas:rain", "Rain", "zone:halas", false);
addVendor("npc:neriak-commons:dianax-c-luzz", "Dianax C`Luzz", "zone:neriak-commons", false);
addVendor("npc:the-overthere:tin-merchant-xi", "Tin Merchant XI", "zone:the-overthere", false);
addVendor("npc:surefall-glade:tonsia", "Tonsia", "zone:surefall-glade", false);
addVendor("npc:surefall-glade:livam-t-lant", "Livam T`Lant", "zone:surefall-glade", false);
addVendor("npc:surefall-glade:jarse-kedison", "Jarse Kedison", "zone:surefall-glade", false);
addVendor("npc:steamfont-mountains:a-clockwork-fletcher", "a clockwork fletcher", "zone:steamfont-mountains", false);
addVendor("npc:thurgadin:tavir", "Tavir", "zone:thurgadin", false);
addVendor("npc:thurgadin:argash", "Argash", "zone:thurgadin", true);

save();
console.log(
  `Migration 442 complete: container:fletching-kit added, ${npcsAdded} new npc(s), ${rolesFixed} vendor role fixup(s), ${sellsEdgesAdded} sells edges`
);
