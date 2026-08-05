/**
 * Migration 424: model Jewelcrafting's crafting station (issue #50), via the
 * `container` node type -- see decisions/tradeskill-recipe-node-schema.md
 * for the schema.
 *
 * eqlwiki.com's `Jeweler's Kit` page gives it a real statsblock (WT 0.4,
 * Capacity 4, Size Capacity LARGE) and a `soldby` table of ~30 vendors --
 * a portable, vendor-purchased container like Baking's Mixing Bowl/Spit,
 * not a Brew-Barrel-style world fixture. One representative vendor per zone
 * already catalogued in this graph (17 of the wiki's 18 zones; Felwithe
 * isn't a zone node here yet and North Freeport's own "Amber" vendor isn't
 * a modeled npc, so both are skipped rather than guessed at). Sourced from
 * the page's raw wikitext via eqlwiki's MediaWiki API, not WebFetch's
 * summarizer.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

addNode({
  id: "container:jewelers-kit",
  label: "Jeweler's Kit",
  type: "container",
  weight: 0.4,
  containerSize: "Large",
  capacity: 4,
});

const vendors: [string, string][] = [
  ["npc:ak-anon:a-clockwork-jeweler", "zone:ak-anon"],
  ["npc:east-cabilis:klok-oxmod", "zone:east-cabilis"],
  ["npc:west-commonlands:noresa-sparkle", "zone:west-commonlands"],
  ["npc:erudin-palace:sothure-gemcutter", "zone:erudin-palace"],
  ["npc:firiona-vie:brisha-fyrestone", "zone:firiona-vie"],
  ["npc:greater-faydark:merchant-kweili", "zone:greater-faydark"],
  ["npc:icewell-keep:coldain-outcast", "zone:icewell-keep"],
  ["npc:north-kaladim:banaf-norkhitter", "zone:north-kaladim"],
  ["npc:neriak-commons:zartox-ru-soe", "zone:neriak-commons"],
  ["npc:neriak-3rd-gate:telnor-d-unnar", "zone:neriak-3rd-gate"],
  ["npc:the-overthere:tin-merchant-iii", "zone:the-overthere"],
  ["npc:paineel:dannis-faleet", "zone:paineel"],
  ["npc:north-qeynos:svena-ironforge", "zone:north-qeynos"],
  ["npc:rathe-mountains:darfumpel-zirubbel", "zone:rathe-mountains"],
  ["npc:steamfont-mountains:torodrane-frompwaddle", "zone:steamfont-mountains"],
  ["npc:thurgadin:meg-tucter", "zone:thurgadin"],
];

let npcsAdded = 0;
for (const [id, zoneId] of vendors) {
  if (!hasNode(id)) {
    // All 16 already exist as npcs from prior tradeskill/quest batches --
    // this branch is a safety net, not the expected path.
    addNode({ id, label: id, type: "npc", roles: ["vendor"] });
    addEdge(id, zoneId, "located_in");
    npcsAdded++;
  }
  addEdge(id, "container:jewelers-kit", "sells");
}

save();
console.log(`Migration 424 complete: container:jewelers-kit added, ${vendors.length} vendor sells edges (${npcsAdded} new npc(s))`);
