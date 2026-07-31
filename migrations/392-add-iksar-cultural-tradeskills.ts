/**
 * Iksar Cultural Tradeskills (issue #65) -- Blacksmithing only, crafted at
 * the Cabilis Forge (Fortress Talishan, East Cabilis). Source: eqlwiki.com's
 * "Cultural Tradeskills: Iksar" overview page plus its own item pages,
 * batch-fetched via the raw wikitext MediaWiki API, never the summarizing
 * WebFetch tool.
 *
 * Much smaller and differently-shaped than Human/Barbarian/Dark Elf/Dwarf/
 * High Elf: a single armor set (Cabilis Scale Mail) in just two tiers,
 * Normal and Imbued (Cazic Thule) -- no separate Enchanted tier, no dual-
 * deity split, no Ring/Field or Chain/Plate distinction. Matches the
 * issue's own scope note: take each race's page as it comes.
 *
 * Three of the page's own transcluded "basic tier" weapons (Forged Fer`Esh,
 * Forged Sheer Blade, Forged Shan`Tok) turned out to already exist in the
 * graph with an identical recipe -- added by Blacksmithing's own generic
 * "Forged Weapons" migration (#378), not Iksar-specific despite appearing
 * on this page. Confirmed by diffing this page's own table against the
 * existing item+recipe (same trivial, same ingredients, same Forge
 * container) before excluding, not assumed from the name. Skipped entirely
 * here.
 *
 * Nearly every mold this race's recipes call for (Belt/Boot/Bracer/Helm/
 * Cloak/Mail/Gauntlet/Gorget/Leggings/Mantle/Mask/Sleeves Sectional Mold,
 * the three weapon-blade molds, Targ Shield Mold) also turned out to
 * already exist -- generic Blacksmithing armor/weapon molds from earlier
 * migrations, not Iksar-race-named the way Dwarf/High Elf's own molds were.
 * Only the Skyiron ingot progression (Small/Large Brick, Block, Sheet,
 * Folded Sheet, Scales) and Scale Temper are genuinely new, race-specific
 * items.
 *
 * Scale Temper is the one recipe here that isn't Blacksmithing-at-a-Forge:
 * the wiki states it's brewed in a Brewing Barrel by anyone (not gated to
 * Iksar), just only ever used in Iksar cultural armor -- modeled as a real
 * Brewing recipe in container:brew-barrel, not folded into the Forge
 * default the rest of this migration uses.
 *
 * All 12 Imbued Cabilis Scale Mail pieces carry their Cazic Thule
 * restriction only via a "[[Category:Cazic Thule Worshiper Equipment]]"
 * wiki tag, not an explicit statsblock "Deity:" line the way every other
 * race's imbued items (and this same race's own Imbued Skyiron weapons)
 * do -- the parser was extended to fall back to that category tag when no
 * explicit Deity: line exists, rather than silently losing the
 * restriction. The weapons' own explicit "Deity: Cazic-Thule" line is also
 * hyphenated, inconsistent with the category tag's "Cazic Thule" and with
 * every existing item.deity value in this graph (always Title Case,
 * space-separated) -- both paths normalize hyphens to spaces so every item
 * in this migration ends up with the same "Cazic Thule" string.
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

interface Ingredient { id: string; quantity?: number; }

function addRecipe(id: string, label: string, trivial: number | undefined, uses: Ingredient[], produces: string, craftedIn: string[], tradeskill = "Blacksmithing") {
  const node: Record<string, unknown> = { id, label, type: "recipe", tradeskill };
  if (trivial !== undefined) node.trivial = trivial;
  addNode(node);
  recipesAdded++;
  for (const ing of uses) addEdge(id, ing.id, "uses", ing.quantity && ing.quantity !== 1 ? { quantity: ing.quantity } : undefined);
  addEdge(id, produces, "produces");
  for (const c of craftedIn) addEdge(id, c, "crafted_in");
}

const FORGE = "container:forge";

addItem("item:cabilis-scale-belt", "Cabilis Scale Belt", { slots: ["Waist"], ac: 7, weight: 1.9, size: "Small", classes: ["Shaman","Shadow Knight","Warrior"], source: "Iksar cultural blacksmithing.<br> Part of the Unimbued Cabilis Scale Armor set." });
addRecipe("recipe:cabilis-scale-belt", "Cabilis Scale Belt", 122, [{ id: "item:belt-sectional-mold" }, { id: "item:flask-of-bloodwater" }, { id: "item:skyiron-scales" }, { id: "item:skyiron-sheet" }], "item:cabilis-scale-belt", [FORGE]);

addItem("item:cabilis-scale-boots", "Cabilis Scale Boots", { slots: ["Feet"], ac: 8, weight: 3.8, size: "Medium", classes: ["Shaman","Shadow Knight","Warrior"], source: "Iksar cultural blacksmithing.<br> Part of the Unimbued Cabilis Scale Armor set." });
addRecipe("recipe:cabilis-scale-boots", "Cabilis Scale Boots", 122, [{ id: "item:boot-mold" }, { id: "item:flask-of-bloodwater" }, { id: "item:skyiron-scales" }, { id: "item:skyiron-sheet", quantity: 2 }], "item:cabilis-scale-boots", [FORGE]);

addItem("item:cabilis-scale-bracelet", "Cabilis Scale Bracelet", { slots: ["Wrist"], ac: 7, weight: 1.5, size: "Small", classes: ["Shaman","Shadow Knight","Warrior"], source: "Iksar cultural blacksmithing.<br> Part of the Unimbued Cabilis Scale Armor set." });
addRecipe("recipe:cabilis-scale-bracelet", "Cabilis Scale Bracelet", 122, [{ id: "item:bracer-sectional-mold" }, { id: "item:flask-of-bloodwater" }, { id: "item:skyiron-scales" }, { id: "item:skyiron-sheet" }], "item:cabilis-scale-bracelet", [FORGE]);

addItem("item:cabilis-scale-cap", "Cabilis Scale Cap", { slots: ["Head"], ac: 9, weight: 3.4, size: "Small", classes: ["Shaman","Shadow Knight","Warrior"], source: "Iksar cultural blacksmithing.<br> Part of the Unimbued Cabilis Scale Armor set." });
addRecipe("recipe:cabilis-scale-cap", "Cabilis Scale Cap", 132, [{ id: "item:flask-of-bloodwater" }, { id: "item:helm-mold" }, { id: "item:skyiron-scales" }, { id: "item:skyiron-sheet" }], "item:cabilis-scale-cap", [FORGE]);

addItem("item:cabilis-scale-cape", "Cabilis Scale Cape", { slots: ["Back"], ac: 8, weight: 3, size: "Large", classes: ["Shaman","Shadow Knight","Warrior"], source: "Iksar cultural blacksmithing.<br> Part of the Unimbued Cabilis Scale Armor set." });
addRecipe("recipe:cabilis-scale-cape", "Cabilis Scale Cape", 128, [{ id: "item:cloak-sectional-mold" }, { id: "item:flask-of-bloodwater" }, { id: "item:skyiron-scales", quantity: 2 }, { id: "item:skyiron-sheet", quantity: 3 }], "item:cabilis-scale-cape", [FORGE]);

addItem("item:cabilis-scale-coat", "Cabilis Scale Coat", { slots: ["Chest"], ac: 16, weight: 5.6, size: "Medium", classes: ["Shaman","Shadow Knight","Warrior"], source: "Iksar cultural blacksmithing.<br> Part of the Unimbued Cabilis Scale Armor set." });
addRecipe("recipe:cabilis-scale-coat", "Cabilis Scale Coat", 142, [{ id: "item:flask-of-bloodwater" }, { id: "item:mail-sectional-mold" }, { id: "item:skyiron-scales", quantity: 2 }, { id: "item:skyiron-sheet", quantity: 3 }], "item:cabilis-scale-coat", [FORGE]);

addItem("item:cabilis-scale-gloves", "Cabilis Scale Gloves", { slots: ["Hands"], ac: 8, weight: 3, size: "Small", classes: ["Shaman","Shadow Knight","Warrior"], source: "Iksar cultural blacksmithing.<br> Part of the Unimbued Cabilis Scale Armor set." });
addRecipe("recipe:cabilis-scale-gloves", "Cabilis Scale Gloves", 128, [{ id: "item:flask-of-bloodwater" }, { id: "item:gauntlet-mold" }, { id: "item:skyiron-scales" }, { id: "item:skyiron-sheet", quantity: 2 }], "item:cabilis-scale-gloves", [FORGE]);

addItem("item:cabilis-scale-gorget", "Cabilis Scale Gorget", { slots: ["Neck"], ac: 6, weight: 1.5, size: "Small", classes: ["Shaman","Shadow Knight","Warrior"], source: "Iksar cultural blacksmithing.<br> Part of the Unimbued Cabilis Scale Armor set." });
addRecipe("recipe:cabilis-scale-gorget", "Cabilis Scale Gorget", 119, [{ id: "item:flask-of-bloodwater" }, { id: "item:gorget-mold" }, { id: "item:skyiron-scales" }, { id: "item:skyiron-sheet" }], "item:cabilis-scale-gorget", [FORGE]);

addItem("item:cabilis-scale-leggings", "Cabilis Scale Leggings", { slots: ["Legs"], ac: 10, weight: 4.1, size: "Medium", classes: ["Shaman","Shadow Knight","Warrior"], source: "Iksar cultural blacksmithing.<br> Part of the Unimbued Cabilis Scale Armor set." });
addRecipe("recipe:cabilis-scale-leggings", "Cabilis Scale Leggings", 135, [{ id: "item:flask-of-bloodwater" }, { id: "item:leggings-sectional-mold" }, { id: "item:skyiron-scales", quantity: 2 }, { id: "item:skyiron-sheet", quantity: 3 }], "item:cabilis-scale-leggings", [FORGE]);

addItem("item:cabilis-scale-mantle", "Cabilis Scale Mantle", { slots: ["Shoulders"], ac: 7, weight: 2.6, size: "Small", classes: ["Shaman","Shadow Knight","Warrior"], source: "Iksar cultural blacksmithing.<br> Part of the Unimbued Cabilis Scale Armor set." });
addRecipe("recipe:cabilis-scale-mantle", "Cabilis Scale Mantle", 122, [{ id: "item:flask-of-bloodwater" }, { id: "item:mantle-sectional-mold" }, { id: "item:skyiron-scales" }, { id: "item:skyiron-sheet" }], "item:cabilis-scale-mantle", [FORGE]);

addItem("item:cabilis-scale-mask", "Cabilis Scale Mask", { slots: ["Face"], ac: 5, weight: 0.8, size: "Small", classes: ["Shaman","Shadow Knight","Warrior"], source: "Iksar cultural blacksmithing.<br> Part of the Unimbued Cabilis Scale Armor set." });
addRecipe("recipe:cabilis-scale-mask", "Cabilis Scale Mask", 116, [{ id: "item:flask-of-bloodwater" }, { id: "item:mask-mold" }, { id: "item:skyiron-scales" }, { id: "item:skyiron-sheet" }], "item:cabilis-scale-mask", [FORGE]);

addItem("item:cabilis-scale-sleeves", "Cabilis Scale Sleeves", { slots: ["Arms"], ac: 8, weight: 2.6, size: "Small", classes: ["Shaman","Shadow Knight","Warrior"], source: "Iksar cultural blacksmithing.<br> Part of the Unimbued Cabilis Scale Armor set." });
addRecipe("recipe:cabilis-scale-sleeves", "Cabilis Scale Sleeves", 128, [{ id: "item:flask-of-bloodwater" }, { id: "item:skyiron-scales", quantity: 2 }, { id: "item:skyiron-sheet", quantity: 2 }, { id: "item:sleeves-sectional-mold" }], "item:cabilis-scale-sleeves", [FORGE]);

addItem("item:imbued-cabilis-scale-belt", "Imbued Cabilis Scale Belt", { slots: ["Waist"], ac: 9, stats: {"str":2,"wis":2}, weight: 1.9, size: "Small", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Cazic Thule", magic: true });
addRecipe("recipe:imbued-cabilis-scale-belt", "Imbued Cabilis Scale Belt", 148, [{ id: "item:belt-sectional-mold" }, { id: "item:imbued-amber" }, { id: "item:scale-temper" }, { id: "item:skyiron-scales" }, { id: "item:skyiron-sheet" }], "item:imbued-cabilis-scale-belt", [FORGE]);

addItem("item:imbued-cabilis-scale-boots", "Imbued Cabilis Scale Boots", { slots: ["Feet"], ac: 11, stats: {"str":2,"wis":2}, weight: 3.8, size: "Medium", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Cazic Thule", magic: true });
addRecipe("recipe:imbued-cabilis-scale-boots", "Imbued Cabilis Scale Boots", 148, [{ id: "item:boot-mold" }, { id: "item:imbued-amber" }, { id: "item:scale-temper" }, { id: "item:skyiron-scales" }, { id: "item:skyiron-sheet", quantity: 2 }], "item:imbued-cabilis-scale-boots", [FORGE]);

addItem("item:imbued-cabilis-scale-bracelet", "Imbued Cabilis Scale Bracelet", { slots: ["Wrist"], ac: 9, stats: {"str":2,"wis":2}, weight: 1.5, size: "Small", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Cazic Thule", magic: true });
addRecipe("recipe:imbued-cabilis-scale-bracelet", "Imbued Cabilis Scale Bracelet", 148, [{ id: "item:bracer-sectional-mold" }, { id: "item:imbued-amber" }, { id: "item:scale-temper" }, { id: "item:skyiron-scales" }, { id: "item:skyiron-sheet" }], "item:imbued-cabilis-scale-bracelet", [FORGE]);

addItem("item:imbued-cabilis-scale-cap", "Imbued Cabilis Scale Cap", { slots: ["Head"], ac: 12, stats: {"str":2,"wis":2}, weight: 3.4, size: "Small", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Cazic Thule", magic: true });
addRecipe("recipe:imbued-cabilis-scale-cap", "Imbued Cabilis Scale Cap", 159, [{ id: "item:helm-mold" }, { id: "item:imbued-amber" }, { id: "item:scale-temper" }, { id: "item:skyiron-scales" }, { id: "item:skyiron-sheet" }], "item:imbued-cabilis-scale-cap", [FORGE]);

addItem("item:imbued-cabilis-scale-cape", "Imbued Cabilis Scale Cape", { slots: ["Back"], ac: 12, stats: {"str":4,"wis":2}, weight: 3, size: "Large", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Cazic Thule", magic: true });
addRecipe("recipe:imbued-cabilis-scale-cape", "Imbued Cabilis Scale Cape", 155, [{ id: "item:cloak-sectional-mold" }, { id: "item:imbued-amber" }, { id: "item:scale-temper" }, { id: "item:skyiron-scales", quantity: 2 }, { id: "item:skyiron-sheet", quantity: 3 }], "item:imbued-cabilis-scale-cape", [FORGE]);

addItem("item:imbued-cabilis-scale-coat", "Imbued Cabilis Scale Coat", { slots: ["Chest"], ac: 20, stats: {"str":4,"wis":2}, weight: 5.6, size: "Medium", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Cazic Thule", magic: true });
addRecipe("recipe:imbued-cabilis-scale-coat", "Imbued Cabilis Scale Coat", 168, [{ id: "item:imbued-amber" }, { id: "item:mail-sectional-mold" }, { id: "item:scale-temper" }, { id: "item:skyiron-scales", quantity: 2 }, { id: "item:skyiron-sheet", quantity: 3 }], "item:imbued-cabilis-scale-coat", [FORGE]);

addItem("item:imbued-cabilis-scale-gloves", "Imbued Cabilis Scale Gloves", { slots: ["Hands"], ac: 11, stats: {"str":2,"wis":2}, weight: 3, size: "Small", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Cazic Thule", magic: true });
addRecipe("recipe:imbued-cabilis-scale-gloves", "Imbued Cabilis Scale Gloves", 155, [{ id: "item:gauntlet-mold" }, { id: "item:imbued-amber" }, { id: "item:scale-temper" }, { id: "item:skyiron-scales" }, { id: "item:skyiron-sheet", quantity: 2 }], "item:imbued-cabilis-scale-gloves", [FORGE]);

addItem("item:imbued-cabilis-scale-gorget", "Imbued Cabilis Scale Gorget", { slots: ["Neck"], ac: 8, stats: {"str":2,"wis":2}, weight: 1.5, size: "Small", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Cazic Thule", magic: true });
addRecipe("recipe:imbued-cabilis-scale-gorget", "Imbued Cabilis Scale Gorget", 146, [{ id: "item:gorget-mold" }, { id: "item:imbued-amber" }, { id: "item:scale-temper" }, { id: "item:skyiron-scales" }, { id: "item:skyiron-sheet" }], "item:imbued-cabilis-scale-gorget", [FORGE]);

addItem("item:imbued-cabilis-scale-leggings", "Imbued Cabilis Scale Leggings", { slots: ["Legs"], ac: 14, stats: {"str":4,"wis":2}, weight: 4.1, size: "Medium", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Cazic Thule", magic: true });
addRecipe("recipe:imbued-cabilis-scale-leggings", "Imbued Cabilis Scale Leggings", 162, [{ id: "item:imbued-amber" }, { id: "item:leggings-sectional-mold" }, { id: "item:scale-temper" }, { id: "item:skyiron-scales", quantity: 2 }, { id: "item:skyiron-sheet", quantity: 3 }], "item:imbued-cabilis-scale-leggings", [FORGE]);

addItem("item:imbued-cabilis-scale-mantle", "Imbued Cabilis Scale Mantle", { slots: ["Shoulders"], ac: 10, stats: {"str":2,"wis":2}, weight: 2.6, size: "Small", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Cazic Thule", magic: true });
addRecipe("recipe:imbued-cabilis-scale-mantle", "Imbued Cabilis Scale Mantle", 148, [{ id: "item:imbued-amber" }, { id: "item:mantle-sectional-mold" }, { id: "item:scale-temper" }, { id: "item:skyiron-scales" }, { id: "item:skyiron-sheet" }], "item:imbued-cabilis-scale-mantle", [FORGE]);

addItem("item:imbued-cabilis-scale-mask", "Imbued Cabilis Scale Mask", { slots: ["Face"], ac: 6, stats: {"str":2,"wis":2}, weight: 0.8, size: "Small", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Cazic Thule", magic: true });
addRecipe("recipe:imbued-cabilis-scale-mask", "Imbued Cabilis Scale Mask", 147, [{ id: "item:imbued-amber" }, { id: "item:mask-mold" }, { id: "item:scale-temper" }, { id: "item:skyiron-scales" }, { id: "item:skyiron-sheet" }], "item:imbued-cabilis-scale-mask", [FORGE]);

addItem("item:imbued-cabilis-scale-sleeves", "Imbued Cabilis Scale Sleeves", { slots: ["Arms"], ac: 11, stats: {"str":2,"wis":2}, weight: 2.6, size: "Small", classes: ["Shaman","Shadow Knight","Warrior"], deity: "Cazic Thule", magic: true });
addRecipe("recipe:imbued-cabilis-scale-sleeves", "Imbued Cabilis Scale Sleeves", 155, [{ id: "item:imbued-amber" }, { id: "item:scale-temper" }, { id: "item:skyiron-scales", quantity: 2 }, { id: "item:skyiron-sheet", quantity: 2 }, { id: "item:sleeves-sectional-mold" }], "item:imbued-cabilis-scale-sleeves", [FORGE]);

addItem("item:iksar-blood", "Iksar Blood", { weight: 0.1, size: "Tiny", magic: true });

addItem("item:block-of-skyiron", "Block of Skyiron", { weight: 18, size: "Small", source: "Sold by Smithy Zern (East Cabilis), Smithy Xzatik (East Cabilis)" });

addItem("item:skyiron-sheet", "Skyiron Sheet", { weight: 15, size: "Small", source: "Sold by Smithy Xzatik (East Cabilis)" });
addRecipe("recipe:skyiron-sheet", "Skyiron Sheet", 37, [{ id: "item:flask-of-bloodwater" }, { id: "item:small-brick-of-skyiron", quantity: 2 }], "item:skyiron-sheet", [FORGE]);

addItem("item:small-brick-of-skyiron", "Small Brick of Skyiron", { weight: 7, size: "Small", source: "Sold by Smithy Zern (East Cabilis), Smithy Xzatik (East Cabilis)" });

addItem("item:froglok-blood", "Froglok Blood", { weight: 0.1, size: "Tiny", magic: true, source: "Used in Iksar Cultural Armor Making." });

addItem("item:sarnak-blood", "Sarnak Blood", { weight: 0.5, size: "Small" });

addItem("item:scale-temper", "Scale Temper", { weight: 0.1, size: "Tiny", magic: true });
addRecipe("recipe:scale-temper", "Scale Temper", 135, [{ id: "item:flask-of-bloodwater" }, { id: "item:froglok-blood" }, { id: "item:iksar-blood" }, { id: "item:sarnak-blood" }], "item:scale-temper", ["container:brew-barrel"], "Brewing");

addItem("item:folded-skyiron-sheet", "Folded Skyiron Sheet", { weight: 15, size: "Small" });
addRecipe("recipe:folded-skyiron-sheet", "Folded Skyiron Sheet", 39, [{ id: "item:block-of-skyiron" }, { id: "item:flask-of-bloodwater" }, { id: "item:forging-hammer" }], "item:folded-skyiron-sheet", [FORGE]);

addItem("item:iksar-skyiron-targ-shield", "Iksar Skyiron Targ Shield", { slots: ["Secondary"], ac: 10, resists: {"cold":2}, weight: 7.5, size: "Medium", classes: ["Shaman","Shadow Knight","Warrior"] });
addRecipe("recipe:iksar-skyiron-targ-shield", "Iksar Skyiron Targ Shield", 115, [{ id: "item:folded-skyiron-sheet" }, { id: "item:forging-hammer" }, { id: "item:scale-temper" }, { id: "item:targ-shield-mold" }], "item:iksar-skyiron-targ-shield", [FORGE]);

addItem("item:imbued-skyiron-feresh", "Imbued Skyiron Fer`Esh", { slots: ["Primary","Secondary"], skill: "1H Slashing", delay: 30, damage: 7, stats: {"sta":4,"wis":2}, resists: {"cold":1}, weight: 7.5, size: "Medium", classes: ["Bard","Druid","Paladin","Ranger","Rogue","Shadow Knight","Warrior"], deity: "Cazic Thule", magic: true });
addRecipe("recipe:imbued-skyiron-feresh", "Imbued Skyiron Fer`Esh", 108, [{ id: "item:fer-esh-blade-mold" }, { id: "item:folded-skyiron-sheet" }, { id: "item:hilt-mold" }, { id: "item:imbued-amber" }, { id: "item:pommel-mold" }, { id: "item:scale-temper" }], "item:imbued-skyiron-feresh", [FORGE]);

addItem("item:imbued-skyiron-shantok", "Imbued Skyiron Shan`Tok", { slots: ["Primary","Secondary"], skill: "1H Slashing", delay: 38, damage: 10, stats: {"sta":4,"wis":2}, resists: {"cold":1}, weight: 10, size: "Large", classes: ["Bard","Paladin","Ranger","Rogue","Shadow Knight","Warrior"], deity: "Cazic Thule", magic: true });
addRecipe("recipe:imbued-skyiron-shantok", "Imbued Skyiron Shan`Tok", 114, [{ id: "item:folded-skyiron-sheet" }, { id: "item:hilt-mold" }, { id: "item:imbued-amber" }, { id: "item:pommel-mold" }, { id: "item:scale-temper" }, { id: "item:shan-tok-blade-mold" }], "item:imbued-skyiron-shantok", [FORGE]);

addItem("item:imbued-skyiron-sheer-blade", "Imbued Skyiron Sheer Blade", { slots: ["Primary","Secondary"], skill: "1H Slashing", delay: 31, damage: 8, stats: {"sta":4,"wis":2}, resists: {"cold":1}, weight: 8.5, size: "Medium", classes: ["Bard","Paladin","Ranger","Rogue","Shadow Knight","Warrior"], deity: "Cazic Thule", magic: true });
addRecipe("recipe:imbued-skyiron-sheer-blade", "Imbued Skyiron Sheer Blade", 119, [{ id: "item:flask-of-bloodwater" }, { id: "item:folded-skyiron-sheet" }, { id: "item:hilt-mold" }, { id: "item:imbued-amber" }, { id: "item:pommel-mold" }, { id: "item:sheer-blade-mold" }], "item:imbued-skyiron-sheer-blade", [FORGE]);

addItem("item:skyiron-feresh", "Skyiron Fer`Esh", { slots: ["Primary","Secondary"], skill: "1H Slashing", delay: 30, damage: 6, weight: 7.5, size: "Medium", classes: ["Bard","Druid","Paladin","Ranger","Rogue","Shadow Knight","Warrior"] });
addRecipe("recipe:skyiron-feresh", "Skyiron Fer`Esh", 90, [{ id: "item:fer-esh-blade-mold" }, { id: "item:flask-of-bloodwater" }, { id: "item:folded-skyiron-sheet" }, { id: "item:hilt-mold" }, { id: "item:pommel-mold" }], "item:skyiron-feresh", [FORGE]);

addItem("item:skyiron-scales", "Skyiron Scales", { weight: 4, size: "Small" });
addRecipe("recipe:skyiron-scales", "Skyiron Scales", 89, [{ id: "item:file" }, { id: "item:flask-of-bloodwater" }, { id: "item:large-brick-of-skyiron" }], "item:skyiron-scales", [FORGE]);

addItem("item:skyiron-shantok", "Skyiron Shan`Tok", { slots: ["Primary","Secondary"], skill: "1H Slashing", delay: 38, damage: 9, weight: 10, size: "Large", classes: ["Bard","Paladin","Ranger","Rogue","Shadow Knight","Warrior"] });
addRecipe("recipe:skyiron-shantok", "Skyiron Shan`Tok", 136, [{ id: "item:flask-of-bloodwater" }, { id: "item:folded-skyiron-sheet" }, { id: "item:hilt-mold" }, { id: "item:pommel-mold" }, { id: "item:shan-tok-blade-mold" }], "item:skyiron-shantok", [FORGE]);

addItem("item:skyiron-sheer-blade", "Skyiron Sheer Blade", { slots: ["Primary","Secondary"], skill: "1H Slashing", delay: 31, damage: 7, weight: 8.5, size: "Medium", classes: ["Bard","Paladin","Ranger","Rogue","Shadow Knight","Warrior"] });
addRecipe("recipe:skyiron-sheer-blade", "Skyiron Sheer Blade", 136, [{ id: "item:flask-of-bloodwater" }, { id: "item:folded-skyiron-sheet" }, { id: "item:hilt-mold" }, { id: "item:pommel-mold" }, { id: "item:sheer-blade-mold" }], "item:skyiron-sheer-blade", [FORGE]);

addItem("item:large-brick-of-skyiron", "Large Brick of Skyiron", { weight: 14, size: "Small", source: "Used in Iksar cultural smithing.; Sold by Smithy Zern (East Cabilis), Smithy Xzatik (East Cabilis)" });

addItem("item:imbued-amber", "Imbued Amber", { weight: 0.1, size: "Tiny", source: "Created from a normal Amber with the Imbue Amber spell. Creates items that are diety restricted to Cazic Thule." });

save();
console.log(`Migration complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s) added`);
