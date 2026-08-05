/**
 * Migration 443 (issue #49, batch 2/N): Fletching's 16 arrow components --
 * 3 arrowheads, 4 shafts, 6 fletch classes (round/parabolic/shield cut in
 * wood/bone/ceramic material, per eqlwiki's own "CLASS 1-6" naming), 3
 * nocks -- plus every vendor eqlwiki lists selling each, per issue #49's own
 * "no capped subset" ask.
 *
 * All 16 share the same uniform WT 0.1 / Size SMALL / Class ALL / Race ALL
 * shape per eqlwiki's own per-item statsblocks; Silver Tipped Arrowheads is
 * the one MAGIC ITEM among them.
 *
 * The vendor roster is near-identical across all 16 items (the same ~20-24
 * general fletching-supply merchants scattered across Norrath), but not
 * exactly -- each item's own `soldby` table was fetched and transcribed
 * individually rather than assumed, since a handful of vendors carry only
 * some tiers (e.g. only the higher-tier Bone/Ceramic/Steel/Hooked/Silvertip
 * components are sold by Rivervale's Joana Jinklebelly; only Nocks are sold
 * by Field of Bone's Klok Acet or Thurgadin's Argash).
 *
 * 2 vendors already existed in this graph (Adinel Jailbar, Alanury
 * Stormhammer, both already `vendor`); the rest are new. `container:
 * fletching-kit`'s own vendor set (migration 442) already added 8 of the
 * shared roster (Zotalz, Fugla, Jessica Winter, Fleceal Summer, Merchant
 * Lanin, Merchant Sylnis, Rain, Dianax C`Luzz, Tonsia, Livam T`Lant, Jarse
 * Kedison, a clockwork fletcher, Tavir, Argash, Tin Merchant XI) -- reused
 * via `hasNode`'s existing-node guard, no duplicates.
 *
 * Sourced from each component's own eqlwiki.com page via the MediaWiki
 * API's raw wikitext (`action=query&prop=revisions`, batched multi-title
 * queries), not WebFetch's summarizer -- same bar as every tradeskill
 * before this one.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

let itemsAdded = 0;
let npcsAdded = 0;
let sellsEdgesAdded = 0;

function addItem(id: string, label: string, opts: Record<string, unknown> = {}) {
  if (hasNode(id)) return;
  addNode({ id, label, type: "item", weight: 0.1, size: "Small", ...opts });
  itemsAdded++;
}

function addItemVendors(itemId: string, vendors: [string, string, string][]) {
  for (const [id, label, zoneId] of vendors) {
    if (!hasNode(id)) {
      addNode({ id, label, type: "npc", roles: ["vendor"] });
      addEdge(id, zoneId, "located_in");
      npcsAdded++;
    }
    addEdge(id, itemId, "sells");
    sellsEdgesAdded++;
  }
}

addItem("item:field-point-arrowheads", "Field Point Arrowheads");
addItem("item:hooked-arrowheads", "Hooked Arrowheads");
addItem("item:silver-tipped-arrowheads", "Silver Tipped Arrowheads", { magic: true });
addItem("item:bundled-wooden-arrow-shafts", "Bundled Wooden Arrow Shafts");
addItem("item:bundled-bone-arrow-shafts", "Bundled Bone Arrow Shafts");
addItem("item:bundled-ceramic-arrow-shafts", "Bundled Ceramic Arrow Shafts");
addItem("item:bundled-steel-arrow-shafts", "Bundled Steel Arrow Shafts");
addItem("item:several-round-cut-fletchings", "Several Round Cut Fletchings");
addItem("item:several-parabolic-cut-fletchings", "Several Parabolic Cut Fletchings");
addItem("item:several-shield-cut-fletchings", "Several Shield Cut Fletchings");
addItem("item:set-of-wooden-arrow-vanes", "Set of Wooden Arrow Vanes");
addItem("item:set-of-bone-arrow-vanes", "Set of Bone Arrow Vanes");
addItem("item:set-of-ceramic-arrow-vanes", "Set of Ceramic Arrow Vanes");
addItem("item:large-groove-nocks", "Large Groove Nocks");
addItem("item:medium-groove-nocks", "Medium Groove Nocks");
addItem("item:small-groove-nocks", "Small Groove Nocks");

addItemVendors("item:field-point-arrowheads", [
  ["npc:ak-anon:a-clockwork-bowyer", "a clockwork bowyer", "zone:ak-anon"],
  ["npc:west-cabilis:zotalz", "Zotalz", "zone:west-cabilis"],
  ["npc:east-commonlands:joryd-longarms", "Joryd Longarms", "zone:east-commonlands"],
  ["npc:eastern-karana:bryan", "Bryan", "zone:eastern-karana"],
  ["npc:northern-felwithe:merchant-longarrow", "Merchant Longarrow", "zone:northern-felwithe"],
  ["npc:firiona-vie:fleceal-summer", "Fleceal Summer", "zone:firiona-vie"],
  ["npc:greater-faydark:merchant-lanin", "Merchant Lanin", "zone:greater-faydark"],
  ["npc:greater-faydark:merchant-tiladinya", "Merchant Tiladinya", "zone:greater-faydark"],
  ["npc:greater-faydark:merchant-neaien", "Merchant Neaien", "zone:greater-faydark"],
  ["npc:grobb:zazhar", "Zazhar", "zone:grobb"],
  ["npc:halas:rain", "Rain", "zone:halas"],
  ["npc:iceclad-ocean:adinel-jailbar", "Adinel Jailbar", "zone:iceclad-ocean"],
  ["npc:south-kaladim:alanury-stormhammer", "Alanury Stormhammer", "zone:south-kaladim"],
  ["npc:kithicor-forest:krile-arrowsmith", "Krile Arrowsmith", "zone:kithicor-forest"],
  ["npc:neriak-commons:andara-c-luzz", "Andara C`Luzz", "zone:neriak-commons"],
  ["npc:oggok:praak", "Praak", "zone:oggok"],
  ["npc:the-overthere:tin-merchant-xi", "Tin Merchant XI", "zone:the-overthere"],
  ["npc:western-karana:brenzl-mcmannus", "Brenzl McMannus", "zone:western-karana"],
  ["npc:south-qeynos:danon-fletcher", "Danon Fletcher", "zone:south-qeynos"],
  ["npc:surefall-glade:livam-t-lant", "Livam T`Lant", "zone:surefall-glade"],
  ["npc:surefall-glade:jarse-kedison", "Jarse Kedison", "zone:surefall-glade"],
  ["npc:steamfont-mountains:a-clockwork-fletcher", "a clockwork fletcher", "zone:steamfont-mountains"],
  ["npc:thurgadin:tavir", "Tavir", "zone:thurgadin"],
]);
addItemVendors("item:hooked-arrowheads", [
  ["npc:ak-anon:a-clockwork-bowyer", "a clockwork bowyer", "zone:ak-anon"],
  ["npc:west-cabilis:zotalz", "Zotalz", "zone:west-cabilis"],
  ["npc:east-commonlands:joryd-longarms", "Joryd Longarms", "zone:east-commonlands"],
  ["npc:eastern-karana:bryan", "Bryan", "zone:eastern-karana"],
  ["npc:northern-felwithe:merchant-longarrow", "Merchant Longarrow", "zone:northern-felwithe"],
  ["npc:firiona-vie:fleceal-summer", "Fleceal Summer", "zone:firiona-vie"],
  ["npc:greater-faydark:merchant-lanin", "Merchant Lanin", "zone:greater-faydark"],
  ["npc:greater-faydark:merchant-tiladinya", "Merchant Tiladinya", "zone:greater-faydark"],
  ["npc:greater-faydark:merchant-neaien", "Merchant Neaien", "zone:greater-faydark"],
  ["npc:grobb:zazhar", "Zazhar", "zone:grobb"],
  ["npc:halas:rain", "Rain", "zone:halas"],
  ["npc:south-kaladim:alanury-stormhammer", "Alanury Stormhammer", "zone:south-kaladim"],
  ["npc:kithicor-forest:krile-arrowsmith", "Krile Arrowsmith", "zone:kithicor-forest"],
  ["npc:neriak-commons:andara-c-luzz", "Andara C`Luzz", "zone:neriak-commons"],
  ["npc:oggok:praak", "Praak", "zone:oggok"],
  ["npc:the-overthere:tin-merchant-xi", "Tin Merchant XI", "zone:the-overthere"],
  ["npc:western-karana:brenzl-mcmannus", "Brenzl McMannus", "zone:western-karana"],
  ["npc:south-qeynos:danon-fletcher", "Danon Fletcher", "zone:south-qeynos"],
  ["npc:surefall-glade:livam-t-lant", "Livam T`Lant", "zone:surefall-glade"],
  ["npc:surefall-glade:jarse-kedison", "Jarse Kedison", "zone:surefall-glade"],
  ["npc:rivervale:joana-jinklebelly", "Joana Jinklebelly", "zone:rivervale"],
  ["npc:steamfont-mountains:a-clockwork-fletcher", "a clockwork fletcher", "zone:steamfont-mountains"],
  ["npc:thurgadin:tavir", "Tavir", "zone:thurgadin"],
]);
addItemVendors("item:silver-tipped-arrowheads", [
  ["npc:ak-anon:a-clockwork-bowyer", "a clockwork bowyer", "zone:ak-anon"],
  ["npc:west-cabilis:zotalz", "Zotalz", "zone:west-cabilis"],
  ["npc:east-commonlands:joryd-longarms", "Joryd Longarms", "zone:east-commonlands"],
  ["npc:eastern-karana:bryan", "Bryan", "zone:eastern-karana"],
  ["npc:northern-felwithe:merchant-longarrow", "Merchant Longarrow", "zone:northern-felwithe"],
  ["npc:firiona-vie:fleceal-summer", "Fleceal Summer", "zone:firiona-vie"],
  ["npc:greater-faydark:merchant-lanin", "Merchant Lanin", "zone:greater-faydark"],
  ["npc:greater-faydark:merchant-tiladinya", "Merchant Tiladinya", "zone:greater-faydark"],
  ["npc:greater-faydark:merchant-neaien", "Merchant Neaien", "zone:greater-faydark"],
  ["npc:grobb:zazhar", "Zazhar", "zone:grobb"],
  ["npc:halas:rain", "Rain", "zone:halas"],
  ["npc:iceclad-ocean:adinel-jailbar", "Adinel Jailbar", "zone:iceclad-ocean"],
  ["npc:south-kaladim:alanury-stormhammer", "Alanury Stormhammer", "zone:south-kaladim"],
  ["npc:kithicor-forest:krile-arrowsmith", "Krile Arrowsmith", "zone:kithicor-forest"],
  ["npc:neriak-commons:andara-c-luzz", "Andara C`Luzz", "zone:neriak-commons"],
  ["npc:oggok:praak", "Praak", "zone:oggok"],
  ["npc:the-overthere:tin-merchant-xi", "Tin Merchant XI", "zone:the-overthere"],
  ["npc:western-karana:brenzl-mcmannus", "Brenzl McMannus", "zone:western-karana"],
  ["npc:south-qeynos:danon-fletcher", "Danon Fletcher", "zone:south-qeynos"],
  ["npc:surefall-glade:livam-t-lant", "Livam T`Lant", "zone:surefall-glade"],
  ["npc:surefall-glade:jarse-kedison", "Jarse Kedison", "zone:surefall-glade"],
  ["npc:rivervale:joana-jinklebelly", "Joana Jinklebelly", "zone:rivervale"],
  ["npc:steamfont-mountains:a-clockwork-fletcher", "a clockwork fletcher", "zone:steamfont-mountains"],
  ["npc:thurgadin:tavir", "Tavir", "zone:thurgadin"],
]);
addItemVendors("item:bundled-wooden-arrow-shafts", [
  ["npc:ak-anon:a-clockwork-bowyer", "a clockwork bowyer", "zone:ak-anon"],
  ["npc:west-cabilis:zotalz", "Zotalz", "zone:west-cabilis"],
  ["npc:east-commonlands:joryd-longarms", "Joryd Longarms", "zone:east-commonlands"],
  ["npc:eastern-karana:bryan", "Bryan", "zone:eastern-karana"],
  ["npc:northern-felwithe:merchant-longarrow", "Merchant Longarrow", "zone:northern-felwithe"],
  ["npc:firiona-vie:fleceal-summer", "Fleceal Summer", "zone:firiona-vie"],
  ["npc:greater-faydark:merchant-lanin", "Merchant Lanin", "zone:greater-faydark"],
  ["npc:greater-faydark:merchant-tiladinya", "Merchant Tiladinya", "zone:greater-faydark"],
  ["npc:greater-faydark:merchant-neaien", "Merchant Neaien", "zone:greater-faydark"],
  ["npc:grobb:zazhar", "Zazhar", "zone:grobb"],
  ["npc:halas:rain", "Rain", "zone:halas"],
  ["npc:iceclad-ocean:adinel-jailbar", "Adinel Jailbar", "zone:iceclad-ocean"],
  ["npc:south-kaladim:alanury-stormhammer", "Alanury Stormhammer", "zone:south-kaladim"],
  ["npc:kithicor-forest:krile-arrowsmith", "Krile Arrowsmith", "zone:kithicor-forest"],
  ["npc:oggok:praak", "Praak", "zone:oggok"],
  ["npc:the-overthere:tin-merchant-xi", "Tin Merchant XI", "zone:the-overthere"],
  ["npc:western-karana:brenzl-mcmannus", "Brenzl McMannus", "zone:western-karana"],
  ["npc:south-qeynos:danon-fletcher", "Danon Fletcher", "zone:south-qeynos"],
  ["npc:surefall-glade:livam-t-lant", "Livam T`Lant", "zone:surefall-glade"],
  ["npc:surefall-glade:jarse-kedison", "Jarse Kedison", "zone:surefall-glade"],
  ["npc:steamfont-mountains:a-clockwork-fletcher", "a clockwork fletcher", "zone:steamfont-mountains"],
  ["npc:thurgadin:tavir", "Tavir", "zone:thurgadin"],
]);
addItemVendors("item:bundled-bone-arrow-shafts", [
  ["npc:ak-anon:a-clockwork-bowyer", "a clockwork bowyer", "zone:ak-anon"],
  ["npc:west-cabilis:zotalz", "Zotalz", "zone:west-cabilis"],
  ["npc:east-commonlands:joryd-longarms", "Joryd Longarms", "zone:east-commonlands"],
  ["npc:eastern-karana:bryan", "Bryan", "zone:eastern-karana"],
  ["npc:northern-felwithe:merchant-longarrow", "Merchant Longarrow", "zone:northern-felwithe"],
  ["npc:firiona-vie:fleceal-summer", "Fleceal Summer", "zone:firiona-vie"],
  ["npc:greater-faydark:merchant-lanin", "Merchant Lanin", "zone:greater-faydark"],
  ["npc:greater-faydark:merchant-tiladinya", "Merchant Tiladinya", "zone:greater-faydark"],
  ["npc:greater-faydark:merchant-neaien", "Merchant Neaien", "zone:greater-faydark"],
  ["npc:grobb:zazhar", "Zazhar", "zone:grobb"],
  ["npc:halas:rain", "Rain", "zone:halas"],
  ["npc:iceclad-ocean:adinel-jailbar", "Adinel Jailbar", "zone:iceclad-ocean"],
  ["npc:south-kaladim:alanury-stormhammer", "Alanury Stormhammer", "zone:south-kaladim"],
  ["npc:kithicor-forest:krile-arrowsmith", "Krile Arrowsmith", "zone:kithicor-forest"],
  ["npc:oggok:praak", "Praak", "zone:oggok"],
  ["npc:the-overthere:tin-merchant-xi", "Tin Merchant XI", "zone:the-overthere"],
  ["npc:western-karana:brenzl-mcmannus", "Brenzl McMannus", "zone:western-karana"],
  ["npc:south-qeynos:danon-fletcher", "Danon Fletcher", "zone:south-qeynos"],
  ["npc:surefall-glade:livam-t-lant", "Livam T`Lant", "zone:surefall-glade"],
  ["npc:surefall-glade:jarse-kedison", "Jarse Kedison", "zone:surefall-glade"],
  ["npc:rivervale:joana-jinklebelly", "Joana Jinklebelly", "zone:rivervale"],
  ["npc:steamfont-mountains:a-clockwork-fletcher", "a clockwork fletcher", "zone:steamfont-mountains"],
  ["npc:thurgadin:tavir", "Tavir", "zone:thurgadin"],
]);
addItemVendors("item:bundled-ceramic-arrow-shafts", [
  ["npc:ak-anon:a-clockwork-bowyer", "a clockwork bowyer", "zone:ak-anon"],
  ["npc:west-cabilis:zotalz", "Zotalz", "zone:west-cabilis"],
  ["npc:east-commonlands:joryd-longarms", "Joryd Longarms", "zone:east-commonlands"],
  ["npc:eastern-karana:bryan", "Bryan", "zone:eastern-karana"],
  ["npc:northern-felwithe:merchant-longarrow", "Merchant Longarrow", "zone:northern-felwithe"],
  ["npc:firiona-vie:fleceal-summer", "Fleceal Summer", "zone:firiona-vie"],
  ["npc:greater-faydark:merchant-lanin", "Merchant Lanin", "zone:greater-faydark"],
  ["npc:greater-faydark:merchant-tiladinya", "Merchant Tiladinya", "zone:greater-faydark"],
  ["npc:greater-faydark:merchant-neaien", "Merchant Neaien", "zone:greater-faydark"],
  ["npc:grobb:zazhar", "Zazhar", "zone:grobb"],
  ["npc:halas:rain", "Rain", "zone:halas"],
  ["npc:iceclad-ocean:adinel-jailbar", "Adinel Jailbar", "zone:iceclad-ocean"],
  ["npc:south-kaladim:alanury-stormhammer", "Alanury Stormhammer", "zone:south-kaladim"],
  ["npc:kithicor-forest:krile-arrowsmith", "Krile Arrowsmith", "zone:kithicor-forest"],
  ["npc:neriak-commons:andara-c-luzz", "Andara C`Luzz", "zone:neriak-commons"],
  ["npc:oggok:praak", "Praak", "zone:oggok"],
  ["npc:the-overthere:tin-merchant-xi", "Tin Merchant XI", "zone:the-overthere"],
  ["npc:western-karana:brenzl-mcmannus", "Brenzl McMannus", "zone:western-karana"],
  ["npc:south-qeynos:danon-fletcher", "Danon Fletcher", "zone:south-qeynos"],
  ["npc:surefall-glade:livam-t-lant", "Livam T`Lant", "zone:surefall-glade"],
  ["npc:surefall-glade:jarse-kedison", "Jarse Kedison", "zone:surefall-glade"],
  ["npc:rivervale:joana-jinklebelly", "Joana Jinklebelly", "zone:rivervale"],
  ["npc:steamfont-mountains:a-clockwork-fletcher", "a clockwork fletcher", "zone:steamfont-mountains"],
  ["npc:thurgadin:tavir", "Tavir", "zone:thurgadin"],
]);
addItemVendors("item:bundled-steel-arrow-shafts", [
  ["npc:ak-anon:a-clockwork-bowyer", "a clockwork bowyer", "zone:ak-anon"],
  ["npc:west-cabilis:zotalz", "Zotalz", "zone:west-cabilis"],
  ["npc:east-commonlands:joryd-longarms", "Joryd Longarms", "zone:east-commonlands"],
  ["npc:eastern-karana:bryan", "Bryan", "zone:eastern-karana"],
  ["npc:northern-felwithe:merchant-longarrow", "Merchant Longarrow", "zone:northern-felwithe"],
  ["npc:firiona-vie:fleceal-summer", "Fleceal Summer", "zone:firiona-vie"],
  ["npc:greater-faydark:merchant-lanin", "Merchant Lanin", "zone:greater-faydark"],
  ["npc:greater-faydark:merchant-tiladinya", "Merchant Tiladinya", "zone:greater-faydark"],
  ["npc:greater-faydark:merchant-neaien", "Merchant Neaien", "zone:greater-faydark"],
  ["npc:grobb:zazhar", "Zazhar", "zone:grobb"],
  ["npc:halas:rain", "Rain", "zone:halas"],
  ["npc:iceclad-ocean:adinel-jailbar", "Adinel Jailbar", "zone:iceclad-ocean"],
  ["npc:south-kaladim:alanury-stormhammer", "Alanury Stormhammer", "zone:south-kaladim"],
  ["npc:kithicor-forest:krile-arrowsmith", "Krile Arrowsmith", "zone:kithicor-forest"],
  ["npc:neriak-commons:andara-c-luzz", "Andara C`Luzz", "zone:neriak-commons"],
  ["npc:oggok:praak", "Praak", "zone:oggok"],
  ["npc:the-overthere:tin-merchant-xi", "Tin Merchant XI", "zone:the-overthere"],
  ["npc:western-karana:brenzl-mcmannus", "Brenzl McMannus", "zone:western-karana"],
  ["npc:south-qeynos:danon-fletcher", "Danon Fletcher", "zone:south-qeynos"],
  ["npc:surefall-glade:livam-t-lant", "Livam T`Lant", "zone:surefall-glade"],
  ["npc:surefall-glade:jarse-kedison", "Jarse Kedison", "zone:surefall-glade"],
  ["npc:rivervale:joana-jinklebelly", "Joana Jinklebelly", "zone:rivervale"],
  ["npc:steamfont-mountains:a-clockwork-fletcher", "a clockwork fletcher", "zone:steamfont-mountains"],
  ["npc:thurgadin:tavir", "Tavir", "zone:thurgadin"],
]);
addItemVendors("item:several-round-cut-fletchings", [
  ["npc:ak-anon:a-clockwork-bowyer", "a clockwork bowyer", "zone:ak-anon"],
  ["npc:west-cabilis:zotalz", "Zotalz", "zone:west-cabilis"],
  ["npc:east-commonlands:joryd-longarms", "Joryd Longarms", "zone:east-commonlands"],
  ["npc:eastern-karana:bryan", "Bryan", "zone:eastern-karana"],
  ["npc:northern-felwithe:merchant-longarrow", "Merchant Longarrow", "zone:northern-felwithe"],
  ["npc:firiona-vie:fleceal-summer", "Fleceal Summer", "zone:firiona-vie"],
  ["npc:greater-faydark:merchant-lanin", "Merchant Lanin", "zone:greater-faydark"],
  ["npc:greater-faydark:merchant-tiladinya", "Merchant Tiladinya", "zone:greater-faydark"],
  ["npc:greater-faydark:merchant-neaien", "Merchant Neaien", "zone:greater-faydark"],
  ["npc:grobb:zazhar", "Zazhar", "zone:grobb"],
  ["npc:halas:rain", "Rain", "zone:halas"],
  ["npc:iceclad-ocean:adinel-jailbar", "Adinel Jailbar", "zone:iceclad-ocean"],
  ["npc:south-kaladim:alanury-stormhammer", "Alanury Stormhammer", "zone:south-kaladim"],
  ["npc:kithicor-forest:krile-arrowsmith", "Krile Arrowsmith", "zone:kithicor-forest"],
  ["npc:neriak-commons:andara-c-luzz", "Andara C`Luzz", "zone:neriak-commons"],
  ["npc:oggok:praak", "Praak", "zone:oggok"],
  ["npc:the-overthere:tin-merchant-xi", "Tin Merchant XI", "zone:the-overthere"],
  ["npc:western-karana:brenzl-mcmannus", "Brenzl McMannus", "zone:western-karana"],
  ["npc:south-qeynos:danon-fletcher", "Danon Fletcher", "zone:south-qeynos"],
  ["npc:surefall-glade:livam-t-lant", "Livam T`Lant", "zone:surefall-glade"],
  ["npc:surefall-glade:jarse-kedison", "Jarse Kedison", "zone:surefall-glade"],
  ["npc:rivervale:joana-jinklebelly", "Joana Jinklebelly", "zone:rivervale"],
  ["npc:steamfont-mountains:a-clockwork-fletcher", "a clockwork fletcher", "zone:steamfont-mountains"],
  ["npc:thurgadin:tavir", "Tavir", "zone:thurgadin"],
]);
addItemVendors("item:several-parabolic-cut-fletchings", [
  ["npc:ak-anon:a-clockwork-bowyer", "a clockwork bowyer", "zone:ak-anon"],
  ["npc:west-cabilis:zotalz", "Zotalz", "zone:west-cabilis"],
  ["npc:east-commonlands:joryd-longarms", "Joryd Longarms", "zone:east-commonlands"],
  ["npc:eastern-karana:bryan", "Bryan", "zone:eastern-karana"],
  ["npc:northern-felwithe:merchant-longarrow", "Merchant Longarrow", "zone:northern-felwithe"],
  ["npc:firiona-vie:fleceal-summer", "Fleceal Summer", "zone:firiona-vie"],
  ["npc:greater-faydark:merchant-lanin", "Merchant Lanin", "zone:greater-faydark"],
  ["npc:greater-faydark:merchant-tiladinya", "Merchant Tiladinya", "zone:greater-faydark"],
  ["npc:greater-faydark:merchant-neaien", "Merchant Neaien", "zone:greater-faydark"],
  ["npc:grobb:zazhar", "Zazhar", "zone:grobb"],
  ["npc:halas:rain", "Rain", "zone:halas"],
  ["npc:iceclad-ocean:adinel-jailbar", "Adinel Jailbar", "zone:iceclad-ocean"],
  ["npc:south-kaladim:alanury-stormhammer", "Alanury Stormhammer", "zone:south-kaladim"],
  ["npc:kithicor-forest:krile-arrowsmith", "Krile Arrowsmith", "zone:kithicor-forest"],
  ["npc:neriak-commons:andara-c-luzz", "Andara C`Luzz", "zone:neriak-commons"],
  ["npc:oggok:praak", "Praak", "zone:oggok"],
  ["npc:the-overthere:tin-merchant-xi", "Tin Merchant XI", "zone:the-overthere"],
  ["npc:western-karana:brenzl-mcmannus", "Brenzl McMannus", "zone:western-karana"],
  ["npc:south-qeynos:danon-fletcher", "Danon Fletcher", "zone:south-qeynos"],
  ["npc:surefall-glade:livam-t-lant", "Livam T`Lant", "zone:surefall-glade"],
  ["npc:surefall-glade:jarse-kedison", "Jarse Kedison", "zone:surefall-glade"],
  ["npc:rivervale:joana-jinklebelly", "Joana Jinklebelly", "zone:rivervale"],
  ["npc:steamfont-mountains:a-clockwork-fletcher", "a clockwork fletcher", "zone:steamfont-mountains"],
  ["npc:thurgadin:tavir", "Tavir", "zone:thurgadin"],
]);
addItemVendors("item:several-shield-cut-fletchings", [
  ["npc:ak-anon:a-clockwork-bowyer", "a clockwork bowyer", "zone:ak-anon"],
  ["npc:west-cabilis:zotalz", "Zotalz", "zone:west-cabilis"],
  ["npc:east-commonlands:joryd-longarms", "Joryd Longarms", "zone:east-commonlands"],
  ["npc:eastern-karana:bryan", "Bryan", "zone:eastern-karana"],
  ["npc:northern-felwithe:merchant-longarrow", "Merchant Longarrow", "zone:northern-felwithe"],
  ["npc:firiona-vie:fleceal-summer", "Fleceal Summer", "zone:firiona-vie"],
  ["npc:greater-faydark:merchant-lanin", "Merchant Lanin", "zone:greater-faydark"],
  ["npc:greater-faydark:merchant-tiladinya", "Merchant Tiladinya", "zone:greater-faydark"],
  ["npc:greater-faydark:merchant-neaien", "Merchant Neaien", "zone:greater-faydark"],
  ["npc:grobb:zazhar", "Zazhar", "zone:grobb"],
  ["npc:halas:rain", "Rain", "zone:halas"],
  ["npc:iceclad-ocean:adinel-jailbar", "Adinel Jailbar", "zone:iceclad-ocean"],
  ["npc:south-kaladim:alanury-stormhammer", "Alanury Stormhammer", "zone:south-kaladim"],
  ["npc:kithicor-forest:krile-arrowsmith", "Krile Arrowsmith", "zone:kithicor-forest"],
  ["npc:neriak-commons:andara-c-luzz", "Andara C`Luzz", "zone:neriak-commons"],
  ["npc:oggok:praak", "Praak", "zone:oggok"],
  ["npc:the-overthere:tin-merchant-xi", "Tin Merchant XI", "zone:the-overthere"],
  ["npc:western-karana:brenzl-mcmannus", "Brenzl McMannus", "zone:western-karana"],
  ["npc:south-qeynos:danon-fletcher", "Danon Fletcher", "zone:south-qeynos"],
  ["npc:surefall-glade:livam-t-lant", "Livam T`Lant", "zone:surefall-glade"],
  ["npc:surefall-glade:jarse-kedison", "Jarse Kedison", "zone:surefall-glade"],
  ["npc:rivervale:joana-jinklebelly", "Joana Jinklebelly", "zone:rivervale"],
  ["npc:steamfont-mountains:a-clockwork-fletcher", "a clockwork fletcher", "zone:steamfont-mountains"],
  ["npc:thurgadin:tavir", "Tavir", "zone:thurgadin"],
]);
addItemVendors("item:set-of-wooden-arrow-vanes", [
  ["npc:ak-anon:a-clockwork-bowyer", "a clockwork bowyer", "zone:ak-anon"],
  ["npc:west-cabilis:zotalz", "Zotalz", "zone:west-cabilis"],
  ["npc:east-commonlands:joryd-longarms", "Joryd Longarms", "zone:east-commonlands"],
  ["npc:eastern-karana:bryan", "Bryan", "zone:eastern-karana"],
  ["npc:northern-felwithe:merchant-longarrow", "Merchant Longarrow", "zone:northern-felwithe"],
  ["npc:firiona-vie:fleceal-summer", "Fleceal Summer", "zone:firiona-vie"],
  ["npc:north-freeport:ping-fuzzlecutter", "Ping Fuzzlecutter", "zone:north-freeport"],
  ["npc:greater-faydark:merchant-lanin", "Merchant Lanin", "zone:greater-faydark"],
  ["npc:greater-faydark:merchant-tiladinya", "Merchant Tiladinya", "zone:greater-faydark"],
  ["npc:greater-faydark:merchant-neaien", "Merchant Neaien", "zone:greater-faydark"],
  ["npc:grobb:zazhar", "Zazhar", "zone:grobb"],
  ["npc:halas:rain", "Rain", "zone:halas"],
  ["npc:iceclad-ocean:adinel-jailbar", "Adinel Jailbar", "zone:iceclad-ocean"],
  ["npc:south-kaladim:alanury-stormhammer", "Alanury Stormhammer", "zone:south-kaladim"],
  ["npc:kithicor-forest:krile-arrowsmith", "Krile Arrowsmith", "zone:kithicor-forest"],
  ["npc:neriak-commons:andara-c-luzz", "Andara C`Luzz", "zone:neriak-commons"],
  ["npc:oggok:praak", "Praak", "zone:oggok"],
  ["npc:the-overthere:tin-merchant-xi", "Tin Merchant XI", "zone:the-overthere"],
  ["npc:western-karana:brenzl-mcmannus", "Brenzl McMannus", "zone:western-karana"],
  ["npc:south-qeynos:danon-fletcher", "Danon Fletcher", "zone:south-qeynos"],
  ["npc:surefall-glade:livam-t-lant", "Livam T`Lant", "zone:surefall-glade"],
  ["npc:surefall-glade:jarse-kedison", "Jarse Kedison", "zone:surefall-glade"],
  ["npc:rivervale:joana-jinklebelly", "Joana Jinklebelly", "zone:rivervale"],
  ["npc:steamfont-mountains:a-clockwork-fletcher", "a clockwork fletcher", "zone:steamfont-mountains"],
  ["npc:thurgadin:tavir", "Tavir", "zone:thurgadin"],
]);
addItemVendors("item:set-of-bone-arrow-vanes", [
  ["npc:ak-anon:a-clockwork-bowyer", "a clockwork bowyer", "zone:ak-anon"],
  ["npc:west-cabilis:zotalz", "Zotalz", "zone:west-cabilis"],
  ["npc:east-commonlands:joryd-longarms", "Joryd Longarms", "zone:east-commonlands"],
  ["npc:eastern-karana:bryan", "Bryan", "zone:eastern-karana"],
  ["npc:northern-felwithe:merchant-longarrow", "Merchant Longarrow", "zone:northern-felwithe"],
  ["npc:firiona-vie:fleceal-summer", "Fleceal Summer", "zone:firiona-vie"],
  ["npc:greater-faydark:merchant-lanin", "Merchant Lanin", "zone:greater-faydark"],
  ["npc:greater-faydark:merchant-tiladinya", "Merchant Tiladinya", "zone:greater-faydark"],
  ["npc:greater-faydark:merchant-neaien", "Merchant Neaien", "zone:greater-faydark"],
  ["npc:grobb:zazhar", "Zazhar", "zone:grobb"],
  ["npc:halas:rain", "Rain", "zone:halas"],
  ["npc:iceclad-ocean:adinel-jailbar", "Adinel Jailbar", "zone:iceclad-ocean"],
  ["npc:south-kaladim:alanury-stormhammer", "Alanury Stormhammer", "zone:south-kaladim"],
  ["npc:kithicor-forest:krile-arrowsmith", "Krile Arrowsmith", "zone:kithicor-forest"],
  ["npc:oggok:praak", "Praak", "zone:oggok"],
  ["npc:the-overthere:tin-merchant-xi", "Tin Merchant XI", "zone:the-overthere"],
  ["npc:western-karana:brenzl-mcmannus", "Brenzl McMannus", "zone:western-karana"],
  ["npc:south-qeynos:danon-fletcher", "Danon Fletcher", "zone:south-qeynos"],
  ["npc:surefall-glade:jarse-kedison", "Jarse Kedison", "zone:surefall-glade"],
  ["npc:rivervale:joana-jinklebelly", "Joana Jinklebelly", "zone:rivervale"],
  ["npc:steamfont-mountains:a-clockwork-fletcher", "a clockwork fletcher", "zone:steamfont-mountains"],
  ["npc:thurgadin:tavir", "Tavir", "zone:thurgadin"],
]);
addItemVendors("item:set-of-ceramic-arrow-vanes", [
  ["npc:ak-anon:a-clockwork-bowyer", "a clockwork bowyer", "zone:ak-anon"],
  ["npc:west-cabilis:zotalz", "Zotalz", "zone:west-cabilis"],
  ["npc:east-commonlands:joryd-longarms", "Joryd Longarms", "zone:east-commonlands"],
  ["npc:eastern-karana:bryan", "Bryan", "zone:eastern-karana"],
  ["npc:northern-felwithe:merchant-longarrow", "Merchant Longarrow", "zone:northern-felwithe"],
  ["npc:firiona-vie:fleceal-summer", "Fleceal Summer", "zone:firiona-vie"],
  ["npc:greater-faydark:merchant-lanin", "Merchant Lanin", "zone:greater-faydark"],
  ["npc:greater-faydark:merchant-tiladinya", "Merchant Tiladinya", "zone:greater-faydark"],
  ["npc:greater-faydark:merchant-neaien", "Merchant Neaien", "zone:greater-faydark"],
  ["npc:grobb:zazhar", "Zazhar", "zone:grobb"],
  ["npc:halas:rain", "Rain", "zone:halas"],
  ["npc:iceclad-ocean:adinel-jailbar", "Adinel Jailbar", "zone:iceclad-ocean"],
  ["npc:south-kaladim:alanury-stormhammer", "Alanury Stormhammer", "zone:south-kaladim"],
  ["npc:kithicor-forest:krile-arrowsmith", "Krile Arrowsmith", "zone:kithicor-forest"],
  ["npc:neriak-commons:andara-c-luzz", "Andara C`Luzz", "zone:neriak-commons"],
  ["npc:oggok:praak", "Praak", "zone:oggok"],
  ["npc:the-overthere:tin-merchant-xi", "Tin Merchant XI", "zone:the-overthere"],
  ["npc:western-karana:brenzl-mcmannus", "Brenzl McMannus", "zone:western-karana"],
  ["npc:south-qeynos:danon-fletcher", "Danon Fletcher", "zone:south-qeynos"],
  ["npc:surefall-glade:jarse-kedison", "Jarse Kedison", "zone:surefall-glade"],
  ["npc:rivervale:joana-jinklebelly", "Joana Jinklebelly", "zone:rivervale"],
  ["npc:steamfont-mountains:a-clockwork-fletcher", "a clockwork fletcher", "zone:steamfont-mountains"],
  ["npc:thurgadin:tavir", "Tavir", "zone:thurgadin"],
]);
addItemVendors("item:large-groove-nocks", [
  ["npc:ak-anon:a-clockwork-bowyer", "a clockwork bowyer", "zone:ak-anon"],
  ["npc:west-cabilis:zotalz", "Zotalz", "zone:west-cabilis"],
  ["npc:east-commonlands:joryd-longarms", "Joryd Longarms", "zone:east-commonlands"],
  ["npc:eastern-karana:bryan", "Bryan", "zone:eastern-karana"],
  ["npc:northern-felwithe:merchant-longarrow", "Merchant Longarrow", "zone:northern-felwithe"],
  ["npc:firiona-vie:fleceal-summer", "Fleceal Summer", "zone:firiona-vie"],
  ["npc:greater-faydark:merchant-lanin", "Merchant Lanin", "zone:greater-faydark"],
  ["npc:greater-faydark:merchant-tiladinya", "Merchant Tiladinya", "zone:greater-faydark"],
  ["npc:greater-faydark:merchant-neaien", "Merchant Neaien", "zone:greater-faydark"],
  ["npc:grobb:zazhar", "Zazhar", "zone:grobb"],
  ["npc:halas:rain", "Rain", "zone:halas"],
  ["npc:iceclad-ocean:adinel-jailbar", "Adinel Jailbar", "zone:iceclad-ocean"],
  ["npc:south-kaladim:alanury-stormhammer", "Alanury Stormhammer", "zone:south-kaladim"],
  ["npc:kithicor-forest:krile-arrowsmith", "Krile Arrowsmith", "zone:kithicor-forest"],
  ["npc:neriak-commons:andara-c-luzz", "Andara C`Luzz", "zone:neriak-commons"],
  ["npc:oggok:praak", "Praak", "zone:oggok"],
  ["npc:the-overthere:tin-merchant-xi", "Tin Merchant XI", "zone:the-overthere"],
  ["npc:western-karana:brenzl-mcmannus", "Brenzl McMannus", "zone:western-karana"],
  ["npc:south-qeynos:danon-fletcher", "Danon Fletcher", "zone:south-qeynos"],
  ["npc:surefall-glade:livam-t-lant", "Livam T`Lant", "zone:surefall-glade"],
  ["npc:surefall-glade:jarse-kedison", "Jarse Kedison", "zone:surefall-glade"],
  ["npc:rivervale:joana-jinklebelly", "Joana Jinklebelly", "zone:rivervale"],
  ["npc:steamfont-mountains:a-clockwork-fletcher", "a clockwork fletcher", "zone:steamfont-mountains"],
  ["npc:thurgadin:tavir", "Tavir", "zone:thurgadin"],
  ["npc:thurgadin:argash", "Argash", "zone:thurgadin"],
]);
addItemVendors("item:medium-groove-nocks", [
  ["npc:ak-anon:a-clockwork-bowyer", "a clockwork bowyer", "zone:ak-anon"],
  ["npc:west-cabilis:zotalz", "Zotalz", "zone:west-cabilis"],
  ["npc:east-commonlands:joryd-longarms", "Joryd Longarms", "zone:east-commonlands"],
  ["npc:eastern-karana:bryan", "Bryan", "zone:eastern-karana"],
  ["npc:northern-felwithe:merchant-longarrow", "Merchant Longarrow", "zone:northern-felwithe"],
  ["npc:field-of-bone:klok-acet", "Klok Acet", "zone:field-of-bone"],
  ["npc:firiona-vie:fleceal-summer", "Fleceal Summer", "zone:firiona-vie"],
  ["npc:greater-faydark:merchant-lanin", "Merchant Lanin", "zone:greater-faydark"],
  ["npc:greater-faydark:merchant-tiladinya", "Merchant Tiladinya", "zone:greater-faydark"],
  ["npc:greater-faydark:merchant-neaien", "Merchant Neaien", "zone:greater-faydark"],
  ["npc:grobb:zazhar", "Zazhar", "zone:grobb"],
  ["npc:halas:rain", "Rain", "zone:halas"],
  ["npc:iceclad-ocean:adinel-jailbar", "Adinel Jailbar", "zone:iceclad-ocean"],
  ["npc:south-kaladim:alanury-stormhammer", "Alanury Stormhammer", "zone:south-kaladim"],
  ["npc:kithicor-forest:krile-arrowsmith", "Krile Arrowsmith", "zone:kithicor-forest"],
  ["npc:neriak-commons:andara-c-luzz", "Andara C`Luzz", "zone:neriak-commons"],
  ["npc:oggok:praak", "Praak", "zone:oggok"],
  ["npc:the-overthere:tin-merchant-xi", "Tin Merchant XI", "zone:the-overthere"],
  ["npc:western-karana:brenzl-mcmannus", "Brenzl McMannus", "zone:western-karana"],
  ["npc:south-qeynos:danon-fletcher", "Danon Fletcher", "zone:south-qeynos"],
  ["npc:surefall-glade:livam-t-lant", "Livam T`Lant", "zone:surefall-glade"],
  ["npc:surefall-glade:jarse-kedison", "Jarse Kedison", "zone:surefall-glade"],
  ["npc:rivervale:joana-jinklebelly", "Joana Jinklebelly", "zone:rivervale"],
  ["npc:steamfont-mountains:a-clockwork-fletcher", "a clockwork fletcher", "zone:steamfont-mountains"],
  ["npc:thurgadin:tavir", "Tavir", "zone:thurgadin"],
  ["npc:thurgadin:argash", "Argash", "zone:thurgadin"],
]);
addItemVendors("item:small-groove-nocks", [
  ["npc:ak-anon:a-clockwork-bowyer", "a clockwork bowyer", "zone:ak-anon"],
  ["npc:west-cabilis:zotalz", "Zotalz", "zone:west-cabilis"],
  ["npc:east-commonlands:joryd-longarms", "Joryd Longarms", "zone:east-commonlands"],
  ["npc:eastern-karana:bryan", "Bryan", "zone:eastern-karana"],
  ["npc:northern-felwithe:merchant-longarrow", "Merchant Longarrow", "zone:northern-felwithe"],
  ["npc:firiona-vie:fleceal-summer", "Fleceal Summer", "zone:firiona-vie"],
  ["npc:greater-faydark:merchant-lanin", "Merchant Lanin", "zone:greater-faydark"],
  ["npc:greater-faydark:merchant-tiladinya", "Merchant Tiladinya", "zone:greater-faydark"],
  ["npc:greater-faydark:merchant-neaien", "Merchant Neaien", "zone:greater-faydark"],
  ["npc:grobb:zazhar", "Zazhar", "zone:grobb"],
  ["npc:halas:rain", "Rain", "zone:halas"],
  ["npc:south-kaladim:alanury-stormhammer", "Alanury Stormhammer", "zone:south-kaladim"],
  ["npc:kithicor-forest:krile-arrowsmith", "Krile Arrowsmith", "zone:kithicor-forest"],
  ["npc:oggok:praak", "Praak", "zone:oggok"],
  ["npc:the-overthere:tin-merchant-xi", "Tin Merchant XI", "zone:the-overthere"],
  ["npc:western-karana:brenzl-mcmannus", "Brenzl McMannus", "zone:western-karana"],
  ["npc:south-qeynos:danon-fletcher", "Danon Fletcher", "zone:south-qeynos"],
  ["npc:surefall-glade:livam-t-lant", "Livam T`Lant", "zone:surefall-glade"],
  ["npc:surefall-glade:jarse-kedison", "Jarse Kedison", "zone:surefall-glade"],
  ["npc:rivervale:joana-jinklebelly", "Joana Jinklebelly", "zone:rivervale"],
  ["npc:steamfont-mountains:a-clockwork-fletcher", "a clockwork fletcher", "zone:steamfont-mountains"],
  ["npc:thurgadin:tavir", "Tavir", "zone:thurgadin"],
  ["npc:thurgadin:argash", "Argash", "zone:thurgadin"],
]);

save();
console.log(
  `Migration 443 complete: ${itemsAdded} items added, ${npcsAdded} new npc(s), ${sellsEdgesAdded} sells edges`
);
