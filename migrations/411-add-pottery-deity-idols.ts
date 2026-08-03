/**
 * Migration 411: Pottery's Deity Idols section (issue #51) -- the last
 * piece of the Basic/Deity Idol recipe lists on eqlwiki's own `Skill
 * Pottery` page. Same Wheel-then-Kiln shape as migrations 409/410, but the
 * ingredient chain reaches into three tradeskills/services this graph
 * doesn't model: Poison Making (White Lead), an Enchanter spell (Large
 * Block of Magic Clay, Vial of Clear Mana), and an NPC "Imbuer" service
 * (turning an Unimbued Gem into an Imbued Gem). Per explicit scope decision
 * for this migration: only the Pottery-side Wheel/Kiln steps are modeled as
 * real recipes; those cross-trade ingredients get plain `item` nodes with a
 * `source` note describing how they're actually made, same as Pot/Smoker's
 * unmodeled Pottery alternate noted Pottery itself before this migration
 * existed (migration 381).
 *
 * "Unfired Idol" is one wiki page/one conceptual item regardless of which
 * of the 15 deity-specific Imbued Gems goes into it -- same "OR substitute
 * ingredient" pattern as the Poison Vial family in migration 410 (one
 * representative ingredient item, full list on its own `source` field)
 * rather than 15 near-duplicate Wheel recipes, since the combo itself never
 * changes, only which gem is dropped in. The Kiln stage genuinely does
 * branch into 15 different outputs from the same Unfired Idol input, so
 * that's 15 independent Kiln recipes (not a `variant_of` family, since
 * `variant_of` means "same output," and these fifteen don't share one).
 *
 * Stat blocks for the 15 named idols come from the wiki's own "Fired Idols"
 * table (STR/STA/DEX/AGI/INT/WIS/CHA, Resists, Slots columns). Sourced from
 * eqlwiki.com's raw wikitext via its MediaWiki API, not a summarizer.
 */

import { loadGraph } from "./_lib";

const { hasNode, addNode, addEdge, save } = loadGraph(import.meta.dir);

let recipesAdded = 0;
let itemsAdded = 0;

function addItem(id: string, label: string, opts: Record<string, unknown> = {}) {
  if (hasNode(id)) return;
  addNode({ id, label, type: "item", ...opts });
  itemsAdded++;
}

interface Ingredient {
  id: string;
  quantity?: number;
}

function addRecipe(
  id: string,
  label: string,
  trivial: number,
  uses: Ingredient[],
  produces: string,
  station: "container:pottery-wheel" | "container:kiln",
  opts: Record<string, unknown> = {}
) {
  addNode({ id, label, type: "recipe", tradeskill: "Pottery", trivial, ...opts });
  recipesAdded++;
  for (const ing of uses) {
    addEdge(id, ing.id, "uses", ing.quantity && ing.quantity !== 1 ? { quantity: ing.quantity } : undefined);
  }
  addEdge(id, produces, "produces");
  addEdge(id, station, "crafted_in");
}

// ---------------------------------------------------------------------
// Cross-trade sourcing items -- not modeled as recipes in this graph.
// ---------------------------------------------------------------------
addItem("item:imbued-gem", "Imbued Gem", {
  weight: 0.1, size: "Tiny",
  source: "Any of 15 deity-specific Unimbued Gems (Black Sapphire, Ruby, Amber, Rose Quartz, Peridot, Sapphire, Plains Pebble, Diamond, Black Pearl, Topaz, Jade, Opal, Fire Opal, Ivory, Emerald), imbued by a level 29+ Cleric/Druid/Shaman/Wizard who worships the matching deity -- an NPC/class service, not a tradeskill combine, per eqlwiki's own Pottery page",
});
addItem("item:large-block-of-magic-clay", "Large Block of Magic Clay", {
  weight: 1.5, size: "Tiny",
  source: "Summoned via the Enchanter spell Enchant Clay (level 8) from a Large Block of Clay -- not a tradeskill combine",
});
addItem("item:vial-of-clear-mana", "Vial of Clear Mana", {
  weight: 0.1, size: "Tiny",
  source: "Crafted via the Enchanter spell Clarify Mana (level 29) from an Emerald and a Poison Vial -- not a tradeskill combine",
});
addItem("item:white-lead", "White Lead", {
  weight: 0.1, size: "Tiny",
  source: "Crafted via Poison Making (not modeled in this graph) using a Mortar and Pestle, from Lead Sulphide and Limestone",
});
addItem("item:divine-crystalline-glaze", "Divine Crystalline Glaze", {
  weight: 0.1, size: "Tiny",
  source: "Made in a Glaze Mortar (a non-tradeskill combine, not Pottery itself) from White Lead, Iron Oxide, Permafrost Crystals, and a Water Flask",
});

// ---------------------------------------------------------------------
// Unfired Idol -- levelingGuide (188 to 250 step, the wiki's own leveling
// guide's final entry).
// ---------------------------------------------------------------------
addItem("item:unfired-idol", "Unfired Idol", { weight: 0.1, size: "Tiny" });
addRecipe("recipe:unfired-idol", "Unfired Idol", 255,
  [
    { id: "item:imbued-gem" },
    { id: "item:idol-sketch" },
    { id: "item:large-block-of-magic-clay" },
    { id: "item:sculpting-tools" },
    { id: "item:vial-of-clear-mana" },
  ],
  "item:unfired-idol", "container:pottery-wheel", { levelingGuide: true });

// ---------------------------------------------------------------------
// Fired Idols -- 15 independent Kiln recipes sharing the same Unfired Idol
// input, each producing its own named idol with the wiki's own stat block.
// ---------------------------------------------------------------------
interface Idol {
  key: string;
  label: string;
  gem: string;
  trivial: number;
  stats?: Record<string, number>;
  resists?: Record<string, number>;
  slots: string[];
}

const IDOLS: Idol[] = [
  { key: "bertoxxulous", label: "Idol of Bertoxxulous", gem: "Black Sapphire", trivial: 282, stats: { wis: 3, cha: 3 }, resists: { disease: 2 }, slots: ["Primary", "Secondary", "Range"] },
  { key: "brell-serilis", label: "Idol of Brell Serilis", gem: "Ruby", trivial: 282, stats: { str: 3, sta: 4 }, slots: ["Primary", "Secondary"] },
  { key: "cazic-thule", label: "Idol of Cazic Thule", gem: "Amber", trivial: 248, stats: { str: 2, wis: 3 }, slots: ["Primary", "Secondary"] },
  { key: "erollisi-marr", label: "Idol of Erollisi Marr", gem: "Rose Quartz", trivial: 255, stats: { wis: 3, cha: 3 }, slots: ["Primary", "Secondary", "Range"] },
  { key: "fizzlethorpe-bristlebane", label: "Idol of Fizzlethorpe Bristlebane", gem: "Peridot", trivial: 248, stats: { dex: 3, agi: 4 }, slots: ["Primary", "Secondary", "Range"] },
  { key: "innoruuk", label: "Idol of Innoruuk", gem: "Sapphire", trivial: 282, stats: { int: 4 }, resists: { magic: 3 }, slots: ["Primary", "Secondary"] },
  { key: "karana", label: "Idol of Karana", gem: "Plains Pebble", trivial: 242, stats: { cha: 3 }, resists: { magic: 2 }, slots: ["Primary", "Secondary"] },
  { key: "mithaniel-marr", label: "Idol of Mithaniel Marr", gem: "Diamond", trivial: 288, stats: { sta: 10 }, slots: ["Primary", "Secondary", "Range"] },
  { key: "prexus", label: "Idol of Prexus", gem: "Black Pearl", trivial: 255, stats: { wis: 2, cha: 3 }, slots: ["Primary", "Secondary", "Range"] },
  { key: "quellious", label: "Idol of Quellious", gem: "Topaz", trivial: 252, stats: { wis: 2, cha: 3 }, slots: ["Primary", "Secondary"] },
  { key: "rallos-zek", label: "Idol of Rallos Zek", gem: "Jade", trivial: 248, stats: { str: 5 }, slots: ["Primary", "Secondary", "Range"] },
  { key: "rodcet-nife", label: "Idol of Rodcet Nife", gem: "Opal", trivial: 255, stats: { sta: 2, cha: 3 }, slots: ["Primary", "Secondary"] },
  { key: "solusek-ro", label: "Idol of Solusek Ro", gem: "Fire Opal", trivial: 262, stats: { int: 4 }, resists: { fire: 2 }, slots: ["Primary", "Secondary", "Range"] },
  { key: "the-tribunal", label: "Idol of the Tribunal", gem: "Ivory", trivial: 252, stats: { str: 2, cha: 3 }, slots: ["Primary", "Secondary", "Range"] },
  { key: "tunare", label: "Idol of Tunare", gem: "Emerald", trivial: 282, stats: { cha: 3 }, resists: { disease: 2, poison: 2 }, slots: ["Primary", "Secondary", "Range"] },
];

for (const idol of IDOLS) {
  const itemId = `item:idol-of-${idol.key}`;
  addItem(itemId, idol.label, {
    weight: 0.1, size: "Tiny",
    slots: idol.slots,
    ...(idol.stats ? { stats: idol.stats } : {}),
    ...(idol.resists ? { resists: idol.resists } : {}),
    source: `Requires an Imbued ${idol.gem} in the preceding Unfired Idol combine`,
  });
  addRecipe(`recipe:idol-of-${idol.key}`, idol.label, idol.trivial,
    [{ id: "item:unfired-idol" }, { id: "item:high-quality-firing-sheet" }, { id: "item:divine-crystalline-glaze" }],
    itemId, "container:kiln");
}

save();
console.log(`Migration 411 complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s) added for Pottery's Deity Idols`);
