/**
 * Migration 434 (issue #46, batch 2/N): Alchemy's 100 distinct reagent
 * items (of 103 total ingredient slots across the trade's recipes -- 3 are
 * pure Alchemy-recipe outputs used as ingredients further up the chain,
 * added alongside their own recipes in later batches instead of here) plus
 * every vendor eqlwiki lists selling them, per issue #46's own "no capped
 * subset" ask.
 *
 * 14 of these 100 items already existed as `item` nodes from other trades'
 * batches (Allspice, Dark Elf Parts, racial "Parts"/"Meat" illusion
 * ingredients, High Quality Wolf Skin, Pixie Dust) -- reused as-is via
 * `addItem`'s existing `hasNode` guard, no duplicate nodes.
 *
 * 28 of the 100 have no `soldby` table at all (racial parts/meats for the
 * Essence-of-<Race> illusion line, plus a handful of rare drops like
 * Lightstone, Fire Drake Scale, Pixie Dust) -- loot/drop only per the wiki,
 * so they get no `sells` edge; that absence is itself the real fact, same
 * precedent as Brewing's Rat Ears/Vegetables/Berries.
 *
 * **A caught wiki inconsistency, not modeled as-is**: Violet Tri-Tube Sap's
 * own page lists one of its three vendors as "Guri" in Halas, but the main
 * `Skill Alchemy` page's own Vendors section and two other ingredients'
 * pages (Blue Vervain Bulb, Arnworth) all place Guri in Everfrost Peaks
 * with no Halas presence anywhere else -- 3-to-1 evidence this one row is a
 * transcription error, so Guri's `sells` edge for Violet Tri-Tube Sap is
 * attached to the Everfrost Peaks node instead (same "individual page can
 * still be wrong, cross-check when sources disagree" lesson as Tailoring's
 * Ice Silk Robe finding).
 *
 * **6 vendors already existed in this graph without a `vendor` role**
 * (5 as `quest_giver` only, plus Innothule Swamp's Clork as a Troll `mob`)
 * -- `addVendor` appends `"vendor"` to their existing `roles` rather than
 * creating a second node, the same "friendly/vendor-capable NPC found
 * inside what's normally a hostile-mob zone" pattern documented in
 * decisions/friendly-town-npcs-inside-a-hostile-dungeon.md, extended here
 * to Innothule Swamp's own Troll shopkeepers.
 *
 * Sourced from each ingredient's own eqlwiki.com page via the MediaWiki
 * API's raw wikitext (`action=query&prop=revisions`, batched multi-title
 * queries), not WebFetch's summarizer -- same bar as every tradeskill
 * before this one. Zone name aliases (Neriak Third Gate -> Neriak 3rd Gate,
 * Western Plains of Karana -> Western Karana) reuse the exact map Brewing's
 * migration 358 and Tailoring's migration 415 already established; every
 * vendor's own zone is already a catalogued zone node in this graph, so
 * nothing was skipped for that reason.
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

let itemsAdded = 0;
let npcsAdded = 0;
let rolesFixed = 0;
let sellsEdgesAdded = 0;

function addItem(id: string, label: string, opts: Record<string, unknown> = {}) {
  if (hasNode(id)) return;
  addNode({ id, label, type: "item", ...opts });
  itemsAdded++;
}

function addVendor(
  id: string,
  label: string,
  zoneId: string,
  isNew: boolean,
  needsRoleFixup: boolean,
  sells: string[]
) {
  if (isNew) {
    addNode({ id, label, type: "npc", roles: ["vendor"] });
    addEdge(id, zoneId, "located_in");
    npcsAdded++;
  } else if (needsRoleFixup) {
    const node = graph.nodes.find((n: { id: string }) => n.id === id);
    if (node) {
      node.roles = [...(node.roles ?? []), "vendor"];
      rolesFixed++;
    }
  }
  for (const itemId of sells) {
    addEdge(id, itemId, "sells");
    sellsEdgesAdded++;
  }
}

// --- Reagent items -----------------------------------------------------
addItem("item:agrimony", "Agrimony", { weight: 0.1, size: "Small" });
addItem("item:allspice", "Allspice", { weight: 0.1, size: "Small" });
addItem("item:aloe", "Aloe", { weight: 0.1, size: "Small" });
addItem("item:amanita-phalloide", "Amanita Phalloide", { weight: 0.1, size: "Tiny" });
addItem("item:arnworth", "Arnworth", { weight: 0.1, size: "Small" });
addItem("item:barbarian-meat", "Barbarian Meat", { weight: 1, size: "Small" });
addItem("item:bat-fur", "Bat Fur", { weight: 0, size: "Small" });
addItem("item:benzoin", "Benzoin", { weight: 0.1, size: "Small" });
addItem("item:betherium-bark", "Betherium Bark", { weight: 0.1, size: "Small" });
addItem("item:birthwort", "Birthwort", { weight: 0.1, size: "Small" });
addItem("item:bistort", "Bistort", { weight: 0.1, size: "Small" });
addItem("item:black-henbane", "Black Henbane", { weight: 0.1, size: "Tiny" });
addItem("item:bladderwrack", "Bladderwrack", { weight: 0.1, size: "Small" });
addItem("item:blade-leaf", "Blade Leaf", { weight: 0.1, size: "Small" });
addItem("item:blue-vervain-bulb", "Blue Vervain Bulb", { weight: 0.1, size: "Small" });
addItem("item:boneset", "Boneset", { weight: 0.1, size: "Small" });
addItem("item:briar-thistle", "Briar Thistle", { weight: 0.1, size: "Small" });
addItem("item:burdock-root", "Burdock Root", { weight: 0.1, size: "Small" });
addItem("item:celandine-herb", "Celandine Herb", { weight: 0.1, size: "Small" });
addItem("item:clivers", "Clivers", { weight: 0.1, size: "Small" });
addItem("item:clover", "Clover", { weight: 0.1, size: "Small" });
addItem("item:clubmoss", "Clubmoss", { weight: 0.1, size: "Small" });
addItem("item:comfrey", "Comfrey", { weight: 0.1, size: "Small" });
addItem("item:dark-elf-parts", "Dark Elf Parts", { weight: 1, size: "Small" });
addItem("item:deepwater-ink", "Deepwater Ink", { weight: 0.1, size: "Tiny" });
addItem("item:dhea", "Dhea", { weight: 0.1, size: "Small" });
addItem("item:duskglow-vine", "Duskglow Vine", { weight: 0.1, size: "Small" });
addItem("item:dwarf-meat", "Dwarf Meat", { weight: 1, size: "Small" });
addItem("item:echinacea", "Echinacea", { weight: 0.1, size: "Small" });
addItem("item:elderberry", "Elderberry", { weight: 0.1, size: "Small" });
addItem("item:elf-leaf", "Elf Leaf", { weight: 0.1, size: "Small" });
addItem("item:erudite-meat", "Erudite Meat", { weight: 1, size: "Small" });
addItem("item:eucalyptus-leaf", "Eucalyptus Leaf", { weight: 0.1, size: "Small" });
addItem("item:evil-eye-eyestalk", "Evil Eye Eyestalk", { weight: 0.1, size: "Small" });
addItem("item:eyebright", "Eyebright", { weight: 0.1, size: "Small" });
addItem("item:fennel", "Fennel", { weight: 0.1, size: "Small" });
addItem("item:fenugreek", "Fenugreek", { weight: 0.1, size: "Small" });
addItem("item:feverfew", "Feverfew", { weight: 0.1, size: "Small" });
addItem("item:figwort", "Figwort", { weight: 0.1, size: "Small" });
addItem("item:fire-drake-scale", "Fire Drake Scale", { weight: 0.1, size: "Small" });
addItem("item:froglok-blood", "Froglok Blood", { weight: 0.1, size: "Tiny" });
addItem("item:froglok-leg", "Froglok Leg", { weight: 1, size: "Medium" });
addItem("item:gerti-blossom", "Gerti Blossom", { weight: 0.1, size: "Small" });
addItem("item:giant-wasp-venom-sac", "Giant Wasp Venom Sac", { weight: 0.1, size: "Small" });
addItem("item:gnome-meat", "Gnome Meat", { weight: 1, size: "Small" });
addItem("item:green-froglok-skin", "Green Froglok Skin", { weight: 1, size: "Tiny" });
addItem("item:griffon-feathers", "Griffon Feathers", { weight: 0.1, size: "Small" });
addItem("item:ground-figwort", "Ground Figwort", { weight: 0.1, size: "Small" });
addItem("item:halfling-parts", "Halfling Parts", { weight: 1, size: "Small" });
addItem("item:heliotrope", "Heliotrope", { weight: 0.1, size: "Small" });
addItem("item:high-elf-parts", "High Elf Parts", { weight: 1, size: "Small" });
addItem("item:high-quality-wolf-skin", "High Quality Wolf Skin", { weight: 3.5, size: "Large" });
addItem("item:horehound", "Horehound", { weight: 0.1, size: "Small" });
addItem("item:human-parts", "Human Parts", { weight: 1, size: "Small" });
addItem("item:hydrangea", "Hydrangea", { weight: 0.1, size: "Small" });
addItem("item:hyssop", "Hyssop", { weight: 0.1, size: "Small" });
addItem("item:jatamasi", "Jatamasi", { weight: 0.1, size: "Small" });
addItem("item:katuka-bark", "Katuka Bark", { weight: 0.1, size: "Small" });
addItem("item:lady-s-mantle", "Lady's Mantle", { weight: 0.1, size: "Small" });
addItem("item:larkspur", "Larkspur", { weight: 0.1, size: "Small" });
addItem("item:lightstone", "Lightstone", { weight: 0.1, size: "Tiny" });
addItem("item:lucerne", "Lucerne", { weight: 0.1, size: "Small" });
addItem("item:maidenhair-fern", "Maidenhair Fern", { weight: 0.1, size: "Small" });
addItem("item:maliak-leaf", "Maliak Leaf", { weight: 0.1, size: "Small" });
addItem("item:mammoth-meat", "Mammoth Meat", { weight: 1, size: "Small" });
addItem("item:mandrake-root", "Mandrake Root", { weight: 0.1, size: "Small" });
addItem("item:mercury", "Mercury", { weight: 0.1, size: "Small" });
addItem("item:methysticum", "Methysticum", { weight: 0.1, size: "Small" });
addItem("item:mugwart", "Mugwart", { weight: 0.1, size: "Small" });
addItem("item:mullein", "Mullein", { weight: 0.1, size: "Small" });
addItem("item:mystic-ash", "Mystic Ash", { weight: 0.1, size: "Small" });
addItem("item:night-shade", "Night Shade", { weight: 0.1, size: "Small" });
addItem("item:oakmoss", "Oakmoss", { weight: 0.1, size: "Small" });
addItem("item:pixie-dust", "Pixie Dust", { weight: 0.1, size: "Tiny" });
addItem("item:polar-bear-skin", "Polar Bear Skin", { weight: 5, size: "Large" });
addItem("item:red-hellebore", "Red Hellebore", { weight: 0.1, size: "Tiny" });
addItem("item:sage-leaf", "Sage Leaf", { weight: 0.1, size: "Small" });
addItem("item:sea-spirit", "Sea Spirit", { weight: 0.1, size: "Small" });
addItem("item:sickle-leaf", "Sickle Leaf", { weight: 0.1, size: "Small" });
addItem("item:small-vial", "Small Vial", { weight: 0.1, size: "Small" });
addItem("item:snakes-head-iris", "Snakes Head Iris", { weight: 0.1, size: "Tiny" });
addItem("item:star-reach-clover", "Star Reach Clover", { weight: 0.1, size: "Small" });
addItem("item:sticklewort", "Sticklewort", { weight: 0.1, size: "Small" });
addItem("item:sumbul", "Sumbul", { weight: 0.1, size: "Small" });
addItem("item:thorny-ergot", "Thorny Ergot", { weight: 0.1, size: "Tiny" });
addItem("item:tregrum", "Tregrum", { weight: 0.1, size: "Small" });
addItem("item:tri-fern-leaf", "Tri-Fern Leaf", { weight: 0.1, size: "Small" });
addItem("item:troll-parts", "Troll Parts", { weight: 1, size: "Small" });
addItem("item:undead-froglok-tongue", "Undead Froglok Tongue", { weight: 0.1, size: "Small" });
addItem("item:valerian-root", "Valerian Root", { weight: 0.1, size: "Small" });
addItem("item:violet-tri-tube-sap", "Violet Tri-Tube Sap", { weight: 0.1, size: "Small" });
addItem("item:vox-s-dust", "Vox's Dust", { weight: 0.1, size: "Small" });
addItem("item:white-hellebore", "White Hellebore", { weight: 0.1, size: "Tiny" });
addItem("item:white-wolf-skin", "White Wolf Skin", { weight: 3.5, size: "Large" });
addItem("item:wolf-blood", "Wolf Blood", { weight: 0.1, size: "Small" });
addItem("item:wood-elf-parts", "Wood Elf Parts", { weight: 1, size: "Small" });
addItem("item:wormwood", "Wormwood", { weight: 1, size: "Small" });
addItem("item:woundwart", "Woundwart", { weight: 0.1, size: "Small" });
addItem("item:yarrow", "Yarrow", { weight: 0.1, size: "Small" });
addItem("item:yerbhimba", "Yerbhimba", { weight: 0.1, size: "Small" });

// --- Vendors -------------------------------------------------------------
addVendor("mob:innothule-swamp:clork", "Clork", "zone:innothule-swamp", false, true, ["item:arnworth", "item:betherium-bark", "item:bistort", "item:blade-leaf", "item:blue-vervain-bulb", "item:larkspur", "item:mugwart", "item:sticklewort", "item:valerian-root", "item:violet-tri-tube-sap", "item:vox-s-dust", "item:wormwood"]);
addVendor("npc:ak-anon:a-clockwork-alchemist", "A Clockwork Alchemist", "zone:ak-anon", true, false, ["item:arnworth", "item:clivers", "item:gerti-blossom", "item:katuka-bark", "item:methysticum", "item:small-vial", "item:tregrum"]);
addVendor("npc:east-commonlands:katha-firespinner", "Katha Firespinner", "zone:east-commonlands", false, false, ["item:bat-fur"]);
addVendor("npc:erudin-palace:jeliala-glimmercharm", "Jeliala Glimmercharm", "zone:erudin-palace", false, false, ["item:bat-fur"]);
addVendor("npc:erudin-palace:tika-shockstep", "Tika Shockstep", "zone:erudin-palace", false, false, ["item:bat-fur"]);
addVendor("npc:everfrost-peaks:guri", "Guri", "zone:everfrost-peaks", true, false, ["item:arnworth", "item:blue-vervain-bulb", "item:violet-tri-tube-sap"]);
addVendor("npc:everfrost-peaks:sven-felligan", "Sven Felligan", "zone:everfrost-peaks", true, false, ["item:aloe", "item:briar-thistle", "item:clivers", "item:duskglow-vine", "item:gerti-blossom", "item:ground-figwort", "item:katuka-bark", "item:maliak-leaf", "item:methysticum", "item:sickle-leaf", "item:star-reach-clover", "item:tregrum", "item:tri-fern-leaf", "item:yerbhimba"]);
addVendor("npc:firiona-vie:marlyn-mcmerin", "Marlyn McMerin", "zone:firiona-vie", false, true, ["item:agrimony", "item:allspice", "item:aloe", "item:arnworth", "item:benzoin", "item:birthwort", "item:blue-vervain-bulb", "item:briar-thistle", "item:celandine-herb", "item:clivers", "item:duskglow-vine", "item:fenugreek", "item:figwort", "item:gerti-blossom", "item:ground-figwort", "item:katuka-bark", "item:lucerne", "item:maidenhair-fern", "item:maliak-leaf", "item:mandrake-root", "item:methysticum", "item:mullein", "item:night-shade", "item:sage-leaf", "item:sickle-leaf", "item:star-reach-clover", "item:tregrum", "item:tri-fern-leaf", "item:valerian-root", "item:wolf-blood", "item:yarrow", "item:yerbhimba"]);
addVendor("npc:grobb:blergagg", "Blergagg", "zone:grobb", false, false, ["item:agrimony", "item:allspice", "item:benzoin", "item:birthwort", "item:bladderwrack", "item:blue-vervain-bulb", "item:echinacea", "item:fenugreek", "item:feverfew", "item:figwort", "item:heliotrope", "item:horehound", "item:larkspur", "item:lucerne", "item:maidenhair-fern", "item:mandrake-root", "item:mugwart", "item:mullein", "item:mystic-ash", "item:night-shade", "item:oakmoss", "item:sage-leaf", "item:valerian-root", "item:wolf-blood", "item:woundwart", "item:yarrow"]);
addVendor("npc:grobb:grabah", "Grabah", "zone:grobb", false, false, ["item:bladderwrack", "item:celandine-herb", "item:comfrey", "item:dhea", "item:echinacea", "item:elderberry", "item:eucalyptus-leaf", "item:fennel", "item:heliotrope", "item:hyssop", "item:lady-s-mantle", "item:mercury", "item:mystic-ash", "item:oakmoss"]);
addVendor("npc:grobb:raztara", "Raztara", "zone:grobb", true, false, ["item:arnworth", "item:clivers", "item:gerti-blossom", "item:katuka-bark", "item:methysticum", "item:small-vial", "item:tregrum"]);
addVendor("npc:halas:dargon", "Dargon", "zone:halas", false, true, ["item:agrimony", "item:allspice", "item:benzoin", "item:birthwort", "item:bistort", "item:blue-vervain-bulb", "item:boneset", "item:burdock-root", "item:celandine-herb", "item:eyebright", "item:fenugreek", "item:feverfew", "item:figwort", "item:horehound", "item:lucerne", "item:maidenhair-fern", "item:mandrake-root", "item:mercury", "item:mugwart", "item:mullein", "item:night-shade", "item:sage-leaf", "item:sea-spirit", "item:sticklewort", "item:valerian-root", "item:vox-s-dust", "item:wolf-blood", "item:woundwart", "item:yarrow"]);
addVendor("npc:halas:murtog-macyee", "Murtog MacYee", "zone:halas", true, false, ["item:arnworth", "item:clivers", "item:gerti-blossom", "item:katuka-bark", "item:methysticum", "item:small-vial", "item:tregrum"]);
addVendor("npc:halas:spirita", "Spirita", "zone:halas", false, false, ["item:bladderwrack", "item:clover", "item:clubmoss", "item:comfrey", "item:dhea", "item:echinacea", "item:elderberry", "item:eucalyptus-leaf", "item:fennel", "item:heliotrope", "item:hydrangea", "item:hyssop", "item:jatamasi", "item:lady-s-mantle", "item:mercury", "item:mystic-ash", "item:oakmoss", "item:sumbul"]);
addVendor("npc:innothule-swamp:sithgok", "Sithgok", "zone:innothule-swamp", true, false, ["item:aloe", "item:briar-thistle", "item:clivers", "item:duskglow-vine", "item:gerti-blossom", "item:ground-figwort", "item:katuka-bark", "item:maliak-leaf", "item:methysticum", "item:sickle-leaf", "item:star-reach-clover", "item:tregrum", "item:tri-fern-leaf", "item:wolf-blood", "item:yerbhimba"]);
addVendor("npc:kerra-island:melixis", "Melixis", "zone:kerra-island", false, true, ["item:allspice", "item:aloe", "item:arnworth", "item:benzoin", "item:birthwort", "item:briar-thistle", "item:clivers", "item:duskglow-vine", "item:fenugreek", "item:gerti-blossom", "item:ground-figwort", "item:katuka-bark", "item:lucerne", "item:maidenhair-fern", "item:maliak-leaf", "item:mandrake-root", "item:methysticum", "item:mullein", "item:night-shade", "item:sage-leaf", "item:sickle-leaf", "item:star-reach-clover", "item:tregrum", "item:tri-fern-leaf", "item:yerbhimba"]);
addVendor("npc:kithicor-forest:elsbyth", "Elsbyth", "zone:kithicor-forest", false, false, ["item:elf-leaf", "item:larkspur"]);
addVendor("npc:lake-rathetear:dreana", "Dreana", "zone:lake-rathetear", false, false, ["item:elf-leaf", "item:larkspur"]);
addVendor("npc:lesser-faydark:anelia-thrywiel", "Anelia Thrywiel", "zone:lesser-faydark", false, false, ["item:snakes-head-iris"]);
addVendor("npc:neriak-3rd-gate:jerris-w-selo", "Jerris W`Selo", "zone:neriak-3rd-gate", false, false, ["item:red-hellebore"]);
addVendor("npc:neriak-3rd-gate:kanthu-m-rekkor", "Kanthu M`Rekkor", "zone:neriak-3rd-gate", false, false, ["item:red-hellebore"]);
addVendor("npc:northern-karana:romella", "Romella", "zone:northern-karana", false, false, ["item:elf-leaf", "item:larkspur"]);
addVendor("npc:oasis-of-marr:isslana", "Isslana", "zone:oasis-of-marr", false, false, ["item:elf-leaf", "item:larkspur"]);
addVendor("npc:oggok:garakbar", "Garakbar", "zone:oggok", false, false, ["item:agrimony", "item:allspice", "item:benzoin", "item:bladderwrack", "item:blue-vervain-bulb", "item:clover", "item:clubmoss", "item:comfrey", "item:dhea", "item:echinacea", "item:elderberry", "item:eucalyptus-leaf", "item:fennel", "item:figwort", "item:heliotrope", "item:hydrangea", "item:hyssop", "item:jatamasi", "item:lady-s-mantle", "item:maidenhair-fern", "item:mercury", "item:mullein", "item:mystic-ash", "item:oakmoss", "item:sumbul", "item:valerian-root", "item:wolf-blood", "item:yarrow"]);
addVendor("npc:oggok:hrak", "Hrak", "zone:oggok", false, false, ["item:bat-fur"]);
addVendor("npc:oggok:pordopa", "Pordopa", "zone:oggok", false, false, ["item:birthwort", "item:celandine-herb", "item:fenugreek", "item:lucerne", "item:mandrake-root", "item:mercury", "item:night-shade", "item:sage-leaf", "item:sea-spirit"]);
addVendor("npc:rathe-mountains:chandra-kali", "Chandra Kali", "zone:rathe-mountains", false, false, ["item:elf-leaf", "item:larkspur"]);
addVendor("npc:rathe-mountains:susanna", "Susanna", "zone:rathe-mountains", false, false, ["item:elf-leaf", "item:larkspur"]);
addVendor("npc:rathe-mountains:viira-bali", "Viira Bali", "zone:rathe-mountains", false, false, ["item:elf-leaf", "item:larkspur"]);
addVendor("npc:rathe-mountains:zok-ruppeta", "Zok Ruppeta", "zone:rathe-mountains", true, false, ["item:wolf-blood"]);
addVendor("npc:rivervale:kizzie-mintopp", "Kizzie Mintopp", "zone:rivervale", false, true, ["item:arnworth", "item:clivers", "item:gerti-blossom", "item:katuka-bark", "item:methysticum", "item:small-vial", "item:tregrum"]);
addVendor("npc:thurgadin:brynjar", "Brynjar", "zone:thurgadin", false, false, ["item:bladderwrack", "item:clover", "item:clubmoss", "item:comfrey", "item:dhea", "item:echinacea", "item:elderberry", "item:eucalyptus-leaf", "item:fennel", "item:heliotrope", "item:hydrangea", "item:hyssop", "item:jatamasi", "item:lady-s-mantle", "item:mercury", "item:mystic-ash", "item:oakmoss", "item:sumbul"]);
addVendor("npc:thurgadin:hulda", "Hulda", "zone:thurgadin", false, false, ["item:agrimony", "item:allspice", "item:aloe", "item:arnworth", "item:benzoin", "item:birthwort", "item:blue-vervain-bulb", "item:briar-thistle", "item:celandine-herb", "item:clivers", "item:duskglow-vine", "item:fenugreek", "item:figwort", "item:gerti-blossom", "item:ground-figwort", "item:katuka-bark", "item:lucerne", "item:maidenhair-fern", "item:maliak-leaf", "item:mandrake-root", "item:methysticum", "item:mullein", "item:night-shade", "item:sage-leaf", "item:sickle-leaf", "item:star-reach-clover", "item:tregrum", "item:tri-fern-leaf", "item:valerian-root", "item:wolf-blood", "item:yarrow", "item:yerbhimba"]);
addVendor("npc:west-cabilis:jaxxtz", "Jaxxtz", "zone:west-cabilis", false, false, ["item:bladderwrack", "item:clover", "item:clubmoss", "item:comfrey", "item:dhea", "item:echinacea", "item:elderberry", "item:eucalyptus-leaf", "item:fennel", "item:heliotrope", "item:hydrangea", "item:hyssop", "item:jatamasi", "item:lady-s-mantle", "item:mercury", "item:mystic-ash", "item:oakmoss", "item:sumbul"]);
addVendor("npc:west-cabilis:klok-greyscale", "Klok Greyscale", "zone:west-cabilis", true, false, ["item:betherium-bark", "item:bistort", "item:blade-leaf", "item:blue-vervain-bulb", "item:larkspur", "item:mugwart", "item:sticklewort", "item:valerian-root", "item:violet-tri-tube-sap", "item:vox-s-dust", "item:wolf-blood", "item:wormwood"]);
addVendor("npc:west-cabilis:klok-scaleroot", "Klok Scaleroot", "zone:west-cabilis", false, false, ["item:agrimony", "item:allspice", "item:aloe", "item:arnworth", "item:benzoin", "item:birthwort", "item:blue-vervain-bulb", "item:briar-thistle", "item:celandine-herb", "item:clivers", "item:duskglow-vine", "item:fenugreek", "item:figwort", "item:gerti-blossom", "item:ground-figwort", "item:katuka-bark", "item:lucerne", "item:maidenhair-fern", "item:maliak-leaf", "item:mandrake-root", "item:methysticum", "item:mullein", "item:night-shade", "item:sage-leaf", "item:sickle-leaf", "item:star-reach-clover", "item:tregrum", "item:tri-fern-leaf", "item:valerian-root", "item:wolf-blood", "item:yarrow", "item:yerbhimba"]);
addVendor("npc:west-freeport:lysa-truegreen", "Lysa Truegreen", "zone:west-freeport", false, false, ["item:bat-fur"]);
addVendor("npc:western-karana:gindlin-toxfodder", "Gindlin Toxfodder", "zone:western-karana", false, true, ["item:thorny-ergot"]);
addVendor("vendor:south-qeynos:caleah-herblender", "Caleah Herblender", "zone:south-qeynos", false, false, ["item:birthwort", "item:wolf-blood"]);

save();
console.log(
  `Migration 434 complete: ${itemsAdded} items added, ${npcsAdded} new npc(s), ${rolesFixed} vendor role fixup(s), ${sellsEdgesAdded} sells edges`
);
