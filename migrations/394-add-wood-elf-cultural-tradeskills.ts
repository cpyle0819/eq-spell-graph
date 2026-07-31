/**
 * Wood Elf Cultural Tradeskills (issue #65) -- the first race here that's
 * primarily Tailoring, not Blacksmithing: two armor lines (Mithril Studded,
 * Mithril Reinforced), each Normal + Imbued (Tunare), crafted in a Feir'Dal
 * Sewing Kit, plus a handful of Blacksmithing basics/the Sewing Kit itself
 * and one Brewing recipe (Oak Bark Tannin). Source: eqlwiki.com's "Cultural
 * Tradeskills: Wood Elf" overview page plus its own item pages, batch-
 * fetched via the raw wikitext MediaWiki API, never the summarizing
 * WebFetch tool.
 *
 * Parser upgrade: every prior race's codegen hardcoded a default
 * `tradeskill` ("Blacksmithing") with a per-item override map for the rare
 * exception (Iksar's Scale Temper, one Brewing recipe among ~90
 * Blacksmithing ones). Wood Elf's own page mixes all three tradeskills
 * throughout, so the parser now captures the tradeskill name directly from
 * each recipe's own `* [[Tailoring]] (Trivial: ...)` line instead -- more
 * accurate and no longer needs a growing override map.
 *
 * Feir'Dal Sewing Kit is modeled as a real `container`-type node (not
 * `item`), matching decisions/tradeskill-recipe-node-schema.md's Mixing
 * Bowl/Spit/Pot/Smoker precedent: a genuinely portable, player-crafted
 * tradeskill container carries `weight`/`capacity`/`containerSize` like any
 * item, and both directions of the existing `produces`-can-target-a-
 * container extension apply here -- its own Blacksmithing recipe (crafted
 * at the generic Forge) `produces` it, and every Tailoring recipe above
 * `crafted_in`s it. `capacity`/`containerSize` extraction is new to the
 * parser (first sample since Baking's own containers); the item's own
 * "Weight Reduction: 0%" isn't modeled -- always zero here, no informative
 * value yet to justify a new field.
 *
 * Tailoring itself (issue #52) is still unmigrated -- this doesn't
 * conflict with that scope, it's the same "a prerequisite surfaces before
 * its own tradeskill is fully modeled" pattern every race's Blacksmithing
 * basics already established relative to issue #48.
 *
 * Reuses Small Brick of Mithril/Morning Dew (High Elf's own migration,
 * same metal) and Imbued Emerald (also High Elf, same Tunare deity).
 *
 * This migration also caught and fixed a real parser bug affecting *every*
 * prior race: the HP: field regex only allowed a leading "-", not "+" (STR/
 * STA/etc. already handled +/- correctly), so "HP: +8" on Ogre Bouncer
 * Shield parsed as no HP at all. Migration 393 fixed the regex going
 * forward and retroactively patched two already-committed Dwarf items that
 * had silently lost their own "HP: +5" the same way.
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

function addContainer(id: string, label: string, opts: Record<string, unknown> = {}) {
  if (hasNode(id)) return;
  addNode({ id, label, type: "container", ...opts });
  itemsAdded++;
}

interface Ingredient { id: string; quantity?: number; }

function addRecipe(id: string, label: string, trivial: number | undefined, uses: Ingredient[], produces: string, craftedIn: string[], tradeskill: string) {
  const node: Record<string, unknown> = { id, label, type: "recipe", tradeskill };
  if (trivial !== undefined) node.trivial = trivial;
  addNode(node);
  recipesAdded++;
  for (const ing of uses) addEdge(id, ing.id, "uses", ing.quantity && ing.quantity !== 1 ? { quantity: ing.quantity } : undefined);
  addEdge(id, produces, "produces");
  for (const c of craftedIn) addEdge(id, c, "crafted_in");
}

addItem("item:imbued-mithril-studded-belt", "Imbued Mithril Studded Belt", { slots: ["Waist"], ac: 5, stats: {"cha":2,"wis":1}, weight: 0.5, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-mithril-studded-belt", "Imbued Mithril Studded Belt", 122, [{ id: "item:belt-pattern" }, { id: "item:imbued-emerald" }, { id: "item:mithril-studs", quantity: 2 }, { id: "item:oak-bark-tannin" }, { id: "item:sabertooth-tiger-hide" }], "item:imbued-mithril-studded-belt", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:imbued-mithril-studded-boots", "Imbued Mithril Studded Boots", { slots: ["Feet"], ac: 6, stats: {"cha":2,"wis":2}, weight: 1.5, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-mithril-studded-boots", "Imbued Mithril Studded Boots", 122, [{ id: "item:boot-pattern" }, { id: "item:imbued-emerald" }, { id: "item:mithril-studs", quantity: 4 }, { id: "item:oak-bark-tannin" }, { id: "item:sabertooth-tiger-hide" }], "item:imbued-mithril-studded-boots", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:imbued-mithril-studded-bracer", "Imbued Mithril Studded Bracer", { slots: ["Wrist"], ac: 5, stats: {"cha":2,"wis":1}, weight: 0.5, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-mithril-studded-bracer", "Imbued Mithril Studded Bracer", 122, [{ id: "item:imbued-emerald" }, { id: "item:mithril-studs", quantity: 2 }, { id: "item:oak-bark-tannin" }, { id: "item:sabertooth-tiger-hide" }, { id: "item:wristband-pattern" }], "item:imbued-mithril-studded-bracer", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:imbued-mithril-studded-cloak", "Imbued Mithril Studded Cloak", { slots: ["Back"], ac: 6, stats: {"cha":3,"wis":2}, weight: 1, size: "Medium", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-mithril-studded-cloak", "Imbued Mithril Studded Cloak", 122, [{ id: "item:cloak-pattern" }, { id: "item:imbued-emerald" }, { id: "item:mithril-studs", quantity: 4 }, { id: "item:oak-bark-tannin" }, { id: "item:sabertooth-tiger-hide" }], "item:imbued-mithril-studded-cloak", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:imbued-mithril-studded-gloves", "Imbued Mithril Studded Gloves", { slots: ["Hands"], ac: 6, stats: {"cha":2,"wis":1}, weight: 1, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-mithril-studded-gloves", "Imbued Mithril Studded Gloves", 122, [{ id: "item:glove-pattern" }, { id: "item:imbued-emerald" }, { id: "item:mithril-studs", quantity: 4 }, { id: "item:oak-bark-tannin" }, { id: "item:sabertooth-tiger-hide" }], "item:imbued-mithril-studded-gloves", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:imbued-mithril-studded-gorget", "Imbued Mithril Studded Gorget", { slots: ["Neck"], ac: 5, stats: {"cha":1,"wis":1}, weight: 0.4, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-mithril-studded-gorget", "Imbued Mithril Studded Gorget", 122, [{ id: "item:gorget-pattern" }, { id: "item:imbued-emerald" }, { id: "item:mithril-studs", quantity: 2 }, { id: "item:oak-bark-tannin" }, { id: "item:sabertooth-tiger-hide" }], "item:imbued-mithril-studded-gorget", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:imbued-mithril-studded-leggings", "Imbued Mithril Studded Leggings", { slots: ["Legs"], ac: 7, stats: {"cha":3,"wis":2}, weight: 3, size: "Medium", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-mithril-studded-leggings", "Imbued Mithril Studded Leggings", 122, [{ id: "item:imbued-emerald" }, { id: "item:mithril-studs", quantity: 4 }, { id: "item:oak-bark-tannin" }, { id: "item:pant-pattern" }, { id: "item:sabertooth-tiger-hide" }], "item:imbued-mithril-studded-leggings", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:imbued-mithril-studded-mantle", "Imbued Mithril Studded Mantle", { slots: ["Shoulders"], ac: 5, stats: {"cha":2,"wis":1}, weight: 1, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-mithril-studded-mantle", "Imbued Mithril Studded Mantle", 122, [{ id: "item:imbued-emerald" }, { id: "item:mithril-studs", quantity: 3 }, { id: "item:oak-bark-tannin" }, { id: "item:sabertooth-tiger-hide" }, { id: "item:shoulderpad-pattern" }], "item:imbued-mithril-studded-mantle", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:imbued-mithril-studded-mask", "Imbued Mithril Studded Mask", { slots: ["Face"], ac: 4, stats: {"cha":1,"wis":1}, weight: 0.3, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-mithril-studded-mask", "Imbued Mithril Studded Mask", 122, [{ id: "item:imbued-emerald" }, { id: "item:mask-pattern" }, { id: "item:mithril-studs" }, { id: "item:oak-bark-tannin" }, { id: "item:sabertooth-tiger-hide" }], "item:imbued-mithril-studded-mask", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:imbued-mithril-studded-skullcap", "Imbued Mithril Studded Skullcap", { slots: ["Head"], ac: 6, stats: {"cha":2,"wis":1}, weight: 0.5, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-mithril-studded-skullcap", "Imbued Mithril Studded Skullcap", 122, [{ id: "item:cap-pattern" }, { id: "item:imbued-emerald" }, { id: "item:mithril-studs", quantity: 3 }, { id: "item:oak-bark-tannin" }, { id: "item:sabertooth-tiger-hide" }], "item:imbued-mithril-studded-skullcap", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:imbued-mithril-studded-sleeves", "Imbued Mithril Studded Sleeves", { slots: ["Arms"], ac: 6, stats: {"cha":2,"wis":2}, weight: 1, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-mithril-studded-sleeves", "Imbued Mithril Studded Sleeves", 122, [{ id: "item:imbued-emerald" }, { id: "item:mithril-studs", quantity: 3 }, { id: "item:oak-bark-tannin" }, { id: "item:sabertooth-tiger-hide" }, { id: "item:sleeve-pattern" }], "item:imbued-mithril-studded-sleeves", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:imbued-mithril-studded-tunic", "Imbued Mithril Studded Tunic", { slots: ["Chest"], ac: 10, stats: {"cha":3,"wis":2}, weight: 2.5, size: "Medium", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-mithril-studded-tunic", "Imbued Mithril Studded Tunic", 122, [{ id: "item:imbued-emerald" }, { id: "item:mithril-studs", quantity: 5 }, { id: "item:oak-bark-tannin" }, { id: "item:sabertooth-tiger-hide" }, { id: "item:tunic-pattern" }], "item:imbued-mithril-studded-tunic", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:mithril-bits", "Mithril Bits", { weight: 0.1, size: "Tiny" });
addRecipe("recipe:mithril-bits", "Mithril Bits", 43, [{ id: "item:morning-dew" }, { id: "item:small-piece-of-mithril", quantity: 2 }], "item:mithril-bits", ["container:forge"], "Blacksmithing");

addItem("item:mithril-boning", "Mithril Boning", { weight: 0.1, size: "Tiny" });
addRecipe("recipe:mithril-boning", "Mithril Boning", 68, [{ id: "item:file" }, { id: "item:morning-dew" }, { id: "item:small-brick-of-mithril" }], "item:mithril-boning", ["container:forge"], "Blacksmithing");

addItem("item:mithril-reinforced-belt", "Mithril Reinforced Belt", { slots: ["Waist"], ac: 6, weight: 0.5, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Shadow Knight","Warrior"] });
addRecipe("recipe:mithril-reinforced-belt", "Mithril Reinforced Belt", 215, [{ id: "item:belt-pattern" }, { id: "item:excellent-sabertooth-tiger-hide" }, { id: "item:mithril-boning", quantity: 2 }, { id: "item:oak-bark-tannin" }], "item:mithril-reinforced-belt", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:mithril-reinforced-boots", "Mithril Reinforced Boots", { slots: ["Feet"], ac: 7, weight: 1.5, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"] });
addRecipe("recipe:mithril-reinforced-boots", "Mithril Reinforced Boots", 215, [{ id: "item:boot-pattern" }, { id: "item:excellent-sabertooth-tiger-hide" }, { id: "item:mithril-boning", quantity: 3 }, { id: "item:oak-bark-tannin" }], "item:mithril-reinforced-boots", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:mithril-reinforced-cloak", "Mithril Reinforced Cloak", { slots: ["Back"], ac: 7, weight: 1, size: "Medium", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Shadow Knight","Warrior"] });
addRecipe("recipe:mithril-reinforced-cloak", "Mithril Reinforced Cloak", 215, [{ id: "item:cloak-pattern" }, { id: "item:excellent-sabertooth-tiger-hide" }, { id: "item:mithril-boning", quantity: 2 }, { id: "item:oak-bark-tannin" }], "item:mithril-reinforced-cloak", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:mithril-reinforced-gloves", "Mithril Reinforced Gloves", { slots: ["Hands"], ac: 7, weight: 1, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Shadow Knight","Warrior"] });
addRecipe("recipe:mithril-reinforced-gloves", "Mithril Reinforced Gloves", 215, [{ id: "item:excellent-sabertooth-tiger-hide" }, { id: "item:glove-pattern" }, { id: "item:mithril-boning", quantity: 2 }, { id: "item:oak-bark-tannin" }], "item:mithril-reinforced-gloves", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:mithril-reinforced-gorget", "Mithril Reinforced Gorget", { slots: ["Neck"], ac: 6, weight: 0.4, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Shadow Knight","Warrior"] });
addRecipe("recipe:mithril-reinforced-gorget", "Mithril Reinforced Gorget", 215, [{ id: "item:excellent-sabertooth-tiger-hide" }, { id: "item:gorget-pattern" }, { id: "item:mithril-boning" }, { id: "item:oak-bark-tannin" }], "item:mithril-reinforced-gorget", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:mithril-reinforced-mask", "Mithril Reinforced Mask", { slots: ["Face"], ac: 5, weight: 0.3, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Shadow Knight","Warrior"] });
addRecipe("recipe:mithril-reinforced-mask", "Mithril Reinforced Mask", 215, [{ id: "item:excellent-sabertooth-tiger-hide" }, { id: "item:mask-pattern" }, { id: "item:mithril-boning" }, { id: "item:oak-bark-tannin" }], "item:mithril-reinforced-mask", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:mithril-reinforced-shoulderpads", "Mithril Reinforced Shoulderpads", { slots: ["Shoulders"], ac: 6, weight: 1, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Shadow Knight","Warrior"] });
addRecipe("recipe:mithril-reinforced-shoulderpads", "Mithril Reinforced Shoulderpads", 215, [{ id: "item:excellent-sabertooth-tiger-hide" }, { id: "item:mithril-boning", quantity: 2 }, { id: "item:oak-bark-tannin" }, { id: "item:shoulderpad-pattern" }], "item:mithril-reinforced-shoulderpads", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:mithril-reinforced-skullcap", "Mithril Reinforced Skullcap", { slots: ["Head"], ac: 7, weight: 0.5, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Shadow Knight","Warrior"] });
addRecipe("recipe:mithril-reinforced-skullcap", "Mithril Reinforced Skullcap", 215, [{ id: "item:cap-pattern" }, { id: "item:excellent-sabertooth-tiger-hide" }, { id: "item:mithril-boning", quantity: 2 }, { id: "item:oak-bark-tannin" }], "item:mithril-reinforced-skullcap", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:mithril-reinforced-sleeves", "Mithril Reinforced Sleeves", { slots: ["Arms"], ac: 7, weight: 1, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Shadow Knight","Warrior"] });
addRecipe("recipe:mithril-reinforced-sleeves", "Mithril Reinforced Sleeves", 215, [{ id: "item:excellent-sabertooth-tiger-hide" }, { id: "item:mithril-boning", quantity: 2 }, { id: "item:oak-bark-tannin" }, { id: "item:sleeve-pattern" }], "item:mithril-reinforced-sleeves", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:mithril-reinforced-tunic", "Mithril Reinforced Tunic", { slots: ["Chest"], ac: 12, weight: 2.5, size: "Medium", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Shadow Knight","Warrior"] });
addRecipe("recipe:mithril-reinforced-tunic", "Mithril Reinforced Tunic", 215, [{ id: "item:excellent-sabertooth-tiger-hide" }, { id: "item:mithril-boning", quantity: 4 }, { id: "item:oak-bark-tannin" }, { id: "item:tunic-pattern" }], "item:mithril-reinforced-tunic", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:mithril-reinforced-wristbands", "Mithril Reinforced Wristbands", { slots: ["Wrist"], ac: 6, weight: 0.5, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Shadow Knight","Warrior"] });
addRecipe("recipe:mithril-reinforced-wristbands", "Mithril Reinforced Wristbands", 215, [{ id: "item:excellent-sabertooth-tiger-hide" }, { id: "item:mithril-boning" }, { id: "item:oak-bark-tannin" }, { id: "item:wristband-pattern" }], "item:mithril-reinforced-wristbands", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:mithril-studded-belt", "Mithril Studded Belt", { slots: ["Waist"], ac: 5, weight: 0.5, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"] });
addRecipe("recipe:mithril-studded-belt", "Mithril Studded Belt", 108, [{ id: "item:belt-pattern" }, { id: "item:mithril-studs", quantity: 2 }, { id: "item:oak-bark-tannin" }, { id: "item:sabertooth-tiger-hide" }], "item:mithril-studded-belt", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:mithril-studded-boots", "Mithril Studded Boots", { slots: ["Feet"], ac: 6, weight: 1.5, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"] });
addRecipe("recipe:mithril-studded-boots", "Mithril Studded Boots", 108, [{ id: "item:boot-pattern" }, { id: "item:mithril-studs", quantity: 4 }, { id: "item:oak-bark-tannin" }, { id: "item:sabertooth-tiger-hide" }], "item:mithril-studded-boots", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:mithril-studded-cloak", "Mithril Studded Cloak", { slots: ["Back"], ac: 6, weight: 1, size: "Medium", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"] });
addRecipe("recipe:mithril-studded-cloak", "Mithril Studded Cloak", 108, [{ id: "item:cloak-pattern" }, { id: "item:mithril-studs", quantity: 4 }, { id: "item:oak-bark-tannin" }, { id: "item:sabertooth-tiger-hide" }], "item:mithril-studded-cloak", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:mithril-studded-gloves", "Mithril Studded Gloves", { slots: ["Hands"], ac: 6, weight: 1, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"] });
addRecipe("recipe:mithril-studded-gloves", "Mithril Studded Gloves", 108, [{ id: "item:glove-pattern" }, { id: "item:mithril-studs", quantity: 4 }, { id: "item:oak-bark-tannin" }, { id: "item:sabertooth-tiger-hide" }], "item:mithril-studded-gloves", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:mithril-studded-gorget", "Mithril Studded Gorget", { slots: ["Neck"], ac: 5, weight: 0.4, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"] });
addRecipe("recipe:mithril-studded-gorget", "Mithril Studded Gorget", 108, [{ id: "item:gorget-pattern" }, { id: "item:mithril-studs", quantity: 2 }, { id: "item:oak-bark-tannin" }, { id: "item:sabertooth-tiger-hide" }], "item:mithril-studded-gorget", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:mithril-studded-leggings", "Mithril Studded Leggings", { slots: ["Legs"], ac: 7, weight: 3, size: "Medium", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"] });
addRecipe("recipe:mithril-studded-leggings", "Mithril Studded Leggings", 108, [{ id: "item:mithril-studs", quantity: 4 }, { id: "item:oak-bark-tannin" }, { id: "item:pant-pattern" }, { id: "item:sabertooth-tiger-hide" }], "item:mithril-studded-leggings", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:mithril-studded-mask", "Mithril Studded Mask", { slots: ["Face"], ac: 4, weight: 0.3, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"] });
addRecipe("recipe:mithril-studded-mask", "Mithril Studded Mask", 108, [{ id: "item:mask-pattern" }, { id: "item:mithril-studs" }, { id: "item:oak-bark-tannin" }, { id: "item:sabertooth-tiger-hide" }], "item:mithril-studded-mask", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:mithril-studded-shoulderpads", "Mithril Studded Shoulderpads", { slots: ["Shoulders"], ac: 5, weight: 1, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"] });
addRecipe("recipe:mithril-studded-shoulderpads", "Mithril Studded Shoulderpads", 108, [{ id: "item:mithril-studs", quantity: 3 }, { id: "item:oak-bark-tannin" }, { id: "item:sabertooth-tiger-hide" }, { id: "item:shoulderpad-pattern" }], "item:mithril-studded-shoulderpads", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:mithril-studded-skullcap", "Mithril Studded Skullcap", { slots: ["Head"], ac: 6, weight: 0.5, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"] });
addRecipe("recipe:mithril-studded-skullcap", "Mithril Studded Skullcap", 108, [{ id: "item:cap-pattern" }, { id: "item:mithril-studs", quantity: 3 }, { id: "item:oak-bark-tannin" }, { id: "item:sabertooth-tiger-hide" }], "item:mithril-studded-skullcap", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:mithril-studded-sleeves", "Mithril Studded Sleeves", { slots: ["Arms"], ac: 6, weight: 1, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"] });
addRecipe("recipe:mithril-studded-sleeves", "Mithril Studded Sleeves", 108, [{ id: "item:mithril-studs", quantity: 3 }, { id: "item:oak-bark-tannin" }, { id: "item:sabertooth-tiger-hide" }, { id: "item:sleeve-pattern" }], "item:mithril-studded-sleeves", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:mithril-studded-tunic", "Mithril Studded Tunic", { slots: ["Chest"], ac: 10, weight: 2.5, size: "Medium", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"] });
addRecipe("recipe:mithril-studded-tunic", "Mithril Studded Tunic", 108, [{ id: "item:mithril-studs", quantity: 5 }, { id: "item:oak-bark-tannin" }, { id: "item:sabertooth-tiger-hide" }, { id: "item:tunic-pattern" }], "item:mithril-studded-tunic", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:mithril-studded-wristbands", "Mithril Studded Wristbands", { slots: ["Wrist"], ac: 5, weight: 0.5, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"] });
addRecipe("recipe:mithril-studded-wristbands", "Mithril Studded Wristbands", 108, [{ id: "item:mithril-studs", quantity: 2 }, { id: "item:oak-bark-tannin" }, { id: "item:sabertooth-tiger-hide" }, { id: "item:wristband-pattern" }], "item:mithril-studded-wristbands", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:mithril-studs", "Mithril Studs", { weight: 0.1, size: "Tiny" });
addRecipe("recipe:mithril-studs", "Mithril Studs", 47, [{ id: "item:file" }, { id: "item:mithril-bits", quantity: 3 }, { id: "item:morning-dew" }], "item:mithril-studs", ["container:forge"], "Blacksmithing");

addItem("item:oak-bark-tannin", "Oak Bark Tannin", { weight: 0.1, size: "Small" });
addRecipe("recipe:oak-bark-tannin", "Oak Bark Tannin", 102, [{ id: "item:oak-bark" }, { id: "item:water-flask" }], "item:oak-bark-tannin", ["container:brew-barrel"], "Brewing");

addItem("item:small-piece-of-mithril", "Small Piece of Mithril", { weight: 0.5, size: "Small", source: "Sold by Tanalin Silverkale (Felwithe)" });

addItem("item:belt-pattern", "Belt Pattern", { weight: 0.1, size: "Tiny", source: "Sold by a clockwork tailor (Ak'Anon), Alga Bruntbuckler (Butcherblock Mountains), Klok Wartol (East Cabilis), Klok Stitch (East Cabilis), Gayle Weaven (Erudin), Seria O`Danos (Everfrost Peaks), Murga (The Feerrott), Erica Swiftweave (Firiona Vie), Dionin Needlespin (Firiona Vie), Winsa Tanner (East Freeport), Merchant Gaeadin (Greater Faydark), Dyona Rossook (Highpass Hold), Tipa Lighten (Misty Thicket), Spoolie Gee (Northern Desert of Ro), Gretamog (Oggok), Tin Merchant IX (The Overthere), Alysa (Western Plains of Karana), Freed Fimplefur (Steamfont Mountains)" });

addItem("item:boot-pattern", "Boot Pattern", { weight: 0.1, size: "Tiny", source: "Sold by a clockwork tanner (Ak'Anon), a clockwork tailor (Ak'Anon), Fugan Mumfur (Butcherblock Mountains), Klok Wartol (East Cabilis), Demicla Tanner (Erudin), Murga (The Feerrott), Merchant Tissan (Felwithe), Erica Swiftweave (Firiona Vie), Sissin Tanner (East Freeport), Sanhan Tanner (East Freeport), Winsa Tanner (East Freeport), Winlar Tanner (East Freeport), Merchant Aluwenae (Greater Faydark), Bimuk (Grobb), Jarlok (Grobb), Cindl (Halas), Sonsa Fromp (Misty Thicket), Jarvah (Neriak Foreign Quarter), Garren D`Vek (Neriak Commons), Medron Y`Lask (Neriak Third Gate), Juk Hidebeater (Oggok), Gretamog (Oggok), Fhara Semhart (South Qeynos), Chizzlik (Rathe Mountains), Twippie Diggs (Rivervale)" });

addItem("item:cap-pattern", "Cap Pattern", { weight: 0.1, size: "Tiny", source: "Sold by a clockwork tanner (Ak'Anon), a clockwork tailor (Ak'Anon), Fugan Mumfur (Butcherblock Mountains), Klok Wartol (East Cabilis), Demicla Tanner (Erudin), Murga (The Feerrott), Merchant Tissan (Northern Felwithe), Erica Swiftweave (Firiona Vie), Sissin Tanner (East Freeport), Sanhan Tanner (East Freeport), Winsa Tanner (East Freeport), Winlar Tanner (East Freeport), Merchant Aluwenae (Greater Faydark), Jarlok (Grobb), Cindl (Halas), Sonsa Fromp (Misty Thicket), Jarvah (Neriak Foreign Quarter), Garren D`Vek (Neriak Commons), Medron Y`Lask (Neriak Third Gate), Juk Hidebeater (Oggok), Gretamog (Oggok), Fhara Semhart (South Qeynos), Chizzlik (Rathe Mountains), Twippie Diggs (Rivervale)" });

addItem("item:cloak-pattern", "Cloak Pattern", { weight: 0.1, size: "Tiny", source: "Sold by a clockwork tailor (Ak'Anon), Alga Bruntbuckler (Butcherblock Mountains), Klok Wartol (East Cabilis), Klok Stitch (East Cabilis), Gayle Weaven (Erudin), Seria O`Danos (Everfrost Peaks), Murga (The Feerrott), Erica Swiftweave (Firiona Vie), Dionin Needlespin (Firiona Vie), Winsa Tanner (East Freeport), Merchant Gaeadin (Greater Faydark), Dyona Rossook (Highpass Hold), Tipa Lighten (Misty Thicket), Garren D`Vek (Neriak Commons), Hutyn L`Lozz (Neriak Third Gate), Spoolie Gee (Northern Desert of Ro), Gretamog (Oggok), Tin Merchant IX (The Overthere), Alysa (Western Plains of Karana), Freed Fimplefur (Steamfont Mountains)" });

addItem("item:glove-pattern", "Glove Pattern", { weight: 0.1, size: "Tiny", source: "Sold by a clockwork tanner (Ak'Anon), a clockwork tailor (Ak'Anon), Fugan Mumfur (Butcherblock Mountains), Klok Wartol (East Cabilis), Demicla Tanner (Erudin), Murga (The Feerrott), Merchant Tissan (Felwithe), Erica Swiftweave (Firiona Vie), Sissin Tanner (East Freeport), Sanhan Tanner (East Freeport), Winsa Tanner (East Freeport), Winlar Tanner (East Freeport), Merchant Aluwenae (Greater Faydark), Bimuk (Grobb), Jarlok (Grobb), Cindl (Halas), Kalameky Darkfoam (South Kaladim), Sonsa Fromp (Misty Thicket), Jarvah (Neriak Foreign Quarter), Medron Y`Lask (Neriak Third Gate), Juk Hidebeater (Oggok), Gretamog (Oggok), Fhara Semhart (South Qeynos), Chizzlik (Rathe Mountains), Twippie Diggs (Rivervale)" });

addItem("item:gorget-pattern", "Gorget Pattern", { weight: 0.1, size: "Tiny", source: "Sold by a clockwork tanner (Ak'Anon), a clockwork tailor (Ak'Anon), Alga Bruntbuckler (Butcherblock Mountains), Fugan Mumfur (Butcherblock Mountains), Klok Wartol (East Cabilis), Klok Stitch (East Cabilis), Gayle Weaven (Erudin), Demicla Tanner (Erudin), Seria O`Danos (Everfrost Peaks), Murga (The Feerrott), Merchant Tissan (Felwithe), Erica Swiftweave (Firiona Vie), Dionin Needlespin (Firiona Vie), Sissin Tanner (East Freeport), Sanhan Tanner (East Freeport), Winsa Tanner (East Freeport), Winlar Tanner (East Freeport), Merchant Aluwenae (Greater Faydark), Merchant Gaeadin (Greater Faydark), Bimuk (Grobb), Jarlok (Grobb), Cindl (Halas), Dyona Rossook (Highpass Hold), Kalameky Darkfoam (South Kaladim), Lena Leatherspinner (Kithicor Forest), Tipa Lighten (Misty Thicket), Sonsa Fromp (Misty Thicket), Jarvah (Neriak Foreign Quarter), Garren D`Vek (Neriak Commons), Hutyn L`Lozz (Neriak Third Gate), Medron Y`Lask (Neriak Third Gate), Spoolie Gee (Northern Desert of Ro), Juk Hidebeater (Oggok), Gretamog (Oggok), Tin Merchant IX (The Overthere), Alysa (Western Plains of Karana), Fhara Semhart (South Qeynos), Chizzlik (Rathe Mountains), Twippie Diggs (Rivervale), Freed Fimplefur (Steamfont Mountains)" });

addItem("item:mask-pattern", "Mask Pattern", { weight: 0.1, size: "Tiny", source: "Sold by a clockwork tailor (Ak'Anon), Alga Bruntbuckler (Butcherblock Mountains), Klok Wartol (East Cabilis), Gayle Weaven (Erudin), Seria O`Danos (Everfrost Peaks), Murga (The Feerrott), Erica Swiftweave (Firiona Vie), Dionin Needlespin (Firiona Vie), Winsa Tanner (East Freeport), Merchant Gaeadin (Greater Faydark), Dyona Rossook (Highpass Hold), Merchant Gaeadin (Kelethin), Tipa Lighten (Misty Thicket), Garren D`Vek (Neriak Commons), Hutyn L`Lozz (Neriak Third Gate), Spoolie Gee (Northern Desert of Ro), Nerissa Clothspinner (North Qeynos), Gretamog (Oggok), Tin Merchant IX (The Overthere), Freed Fimplefur (Steamfont Mountains), Rexx Frostweaver (Thurgadin), Betti Frostweaver (Thurgadin), Alysa (Western Plains of Karana)" });

addItem("item:pant-pattern", "Pant Pattern", { weight: 0.1, size: "Tiny", source: "Sold by a clockwork tanner (Ak'Anon), a clockwork tailor (Ak'Anon), Fugan Mumfur (Butcherblock Mountains), Klok Wartol (East Cabilis), Demicla Tanner (Erudin), Murga (The Feerrott), Merchant Tissan (Felwithe), Erica Swiftweave (Firiona Vie), Sissin Tanner (East Freeport), Sanhan Tanner (East Freeport), Winsa Tanner (East Freeport), Winlar Tanner (East Freeport), Merchant Aluwenae (Greater Faydark), Bimuk (Grobb), Jarlok (Grobb), Cindl (Halas), Kalameky Darkfoam (South Kaladim), Lena Leatherspinner (Kithicor Forest), Sonsa Fromp (Misty Thicket), Jarvah (Neriak Foreign Quarter), Garren D`Vek (Neriak Commons), Medron Y`Lask (Neriak Third Gate), Juk Hidebeater (Oggok), Gretamog (Oggok), Cleet Miller (Western Plains of Karana), Fhara Semhart (South Qeynos), Chizzlik (Rathe Mountains), Twippie Diggs (Rivervale)" });

addItem("item:shoulderpad-pattern", "Shoulderpad Pattern", { weight: 0.1, size: "Tiny", source: "Classic but may not be available right away at launch.; Sold by a clockwork tailor (Ak'Anon), Alga Bruntbuckler (Butcherblock Mountains), Klok Wartol (East Cabilis), Klok Stitch (East Cabilis), Gayle Weaven (Erudin), Seria O`Danos (Everfrost Peaks), Murga (The Feerrott), Erica Swiftweave (Firiona Vie), Dionin Needlespin (Firiona Vie), Winsa Tanner (East Freeport), Merchant Gaeadin (Greater Faydark), Dyona Rossook (Highpass Hold), Tipa Lighten (Misty Thicket), Garren D`Vek (Neriak Commons), Hutyn L`Lozz (Neriak Third Gate), Spoolie Gee (Northern Desert of Ro), Gretamog (Oggok), Tin Merchant IX (The Overthere), Alysa (Western Plains of Karana), Cleet Miller (Western Plains of Karana), Freed Fimplefur (Steamfont Mountains), Rexx Frostweaver (Thurgadin), Betti Frostweaver (Thurgadin)" });

addItem("item:sleeve-pattern", "Sleeve Pattern", { weight: 0.1, size: "Tiny", source: "Sold by a clockwork tanner (Ak'Anon), a clockwork tailor (Ak'Anon), Fugan Mumfur (Butcherblock Mountains), Klok Wartol (East Cabilis), Demicla Tanner (Erudin), Murga (The Feerrott), Merchant Tissan (Felwithe), Erica Swiftweave (Firiona Vie), Sissin Tanner (East Freeport), Sanhan Tanner (East Freeport), Winsa Tanner (East Freeport), Winlar Tanner (East Freeport), Merchant Aluwenae (Greater Faydark), Bimuk (Grobb), Jarlok (Grobb), Cindl (Halas), Kalameky Darkfoam (South Kaladim), Lena Leatherspinner (Kithicor Forest), Sonsa Fromp (Misty Thicket), Jarvah (Neriak Foreign Quarter), Garren D`Vek (Neriak Commons), Medron Y`Lask (Neriak Third Gate), Juk Hidebeater (Oggok), Gretamog (Oggok), Cleet Miller (Western Plains of Karana), Fhara Semhart (South Qeynos), Chizzlik (Rathe Mountains), Twippie Diggs (Rivervale)" });

addItem("item:wristband-pattern", "Wristband Pattern", { weight: 0.1, size: "Tiny", source: "Not available until Sep1999 on the EverQuest Timeline.; Sold by a clockwork tailor (Ak'Anon), Alga Bruntbuckler (Butcherblock Mountains), Klok Wartol (East Cabilis), Klok Stitch (East Cabilis), Gayle Weaven (Erudin), Seria O`Danos (Everfrost Peaks), Murga (The Feerrott), Erica Swiftweave (Firiona Vie), Dionin Needlespin (Firiona Vie), Winsa Tanner (East Freeport), Merchant Gaeadin (Greater Faydark), Dyona Rossook (Highpass Hold), Tipa Lighten (Misty Thicket), Garren D`Vek (Neriak Commons), Hutyn L`Lozz (Neriak Third Gate), Nerissa Clothspinner (North Qeynos), Spoolie Gee (Northern Desert of Ro), Gretamog (Oggok), Tin Merchant IX (The Overthere), Alysa (Western Plains of Karana), Cleet Miller (Western Plains of Karana), Freed Fimplefur (Steamfont Mountains), Rexx Frostweaver (Thurgadin), Betti Frostweaver (Thurgadin)" });

addItem("item:tunic-pattern", "Tunic Pattern", { weight: 0.1, size: "Tiny", source: "Sold by a clockwork tanner (Ak'Anon), a clockwork tailor (Ak'Anon), Fugan Mumfur (Butcherblock Mountains), Klok Wartol (East Cabilis), Demicla Tanner (Erudin), Murga (The Feerrott), Merchant Tissan (Felwithe), Erica Swiftweave (Firiona Vie), Sissin Tanner (East Freeport), Sanhan Tanner (East Freeport), Winsa Tanner (East Freeport), Winlar Tanner (East Freeport), Merchant Aluwenae (Greater Faydark), Bimuk (Grobb), Jarlok (Grobb), Cindl (Halas), Lena Leatherspinner (Kithicor Forest), Sonsa Fromp (Misty Thicket), Jarvah (Neriak Foreign Quarter), Garren D`Vek (Neriak Commons), Medron Y`Lask (Neriak Third Gate), Juk Hidebeater (Oggok), Gretamog (Oggok), Cleet Miller (Western Plains of Karana), Fhara Semhart (South Qeynos), Chizzlik (Rathe Mountains), Twippie Diggs (Rivervale)" });

addItem("item:excellent-sabertooth-tiger-hide", "Excellent Sabertooth Tiger Hide", { weight: 3.5, size: "Large" });

addItem("item:sabertooth-tiger-hide", "Sabertooth Tiger Hide", { weight: 3.5, size: "Large" });

addItem("item:flask-of-water", "Flask of Water", { weight: undefined, size: undefined });

addItem("item:imbued-mithril-reinforced-belt", "Imbued Mithril Reinforced Belt", { slots: ["Waist"], ac: 6, stats: {"cha":2,"wis":1}, weight: 0.5, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-mithril-reinforced-belt", "Imbued Mithril Reinforced Belt", 228, [{ id: "item:belt-pattern" }, { id: "item:excellent-sabertooth-tiger-hide" }, { id: "item:imbued-emerald" }, { id: "item:mithril-boning", quantity: 2 }, { id: "item:oak-bark-tannin" }], "item:imbued-mithril-reinforced-belt", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:imbued-mithril-reinforced-boots", "Imbued Mithril Reinforced Boots", { slots: ["Feet"], ac: 7, stats: {"cha":2,"wis":2}, weight: 1.5, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-mithril-reinforced-boots", "Imbued Mithril Reinforced Boots", 228, [{ id: "item:boot-pattern" }, { id: "item:excellent-sabertooth-tiger-hide" }, { id: "item:imbued-emerald" }, { id: "item:mithril-boning", quantity: 3 }, { id: "item:oak-bark-tannin" }], "item:imbued-mithril-reinforced-boots", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:imbued-mithril-reinforced-bracer", "Imbued Mithril Reinforced Bracer", { slots: ["Wrist"], ac: 6, stats: {"cha":2,"wis":1}, weight: 0.5, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-mithril-reinforced-bracer", "Imbued Mithril Reinforced Bracer", 228, [{ id: "item:excellent-sabertooth-tiger-hide" }, { id: "item:imbued-emerald" }, { id: "item:mithril-boning" }, { id: "item:oak-bark-tannin" }, { id: "item:wristband-pattern" }], "item:imbued-mithril-reinforced-bracer", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:imbued-mithril-reinforced-cloak", "Imbued Mithril Reinforced Cloak", { slots: ["Back"], ac: 7, stats: {"cha":3,"wis":2}, weight: 1, size: "Medium", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-mithril-reinforced-cloak", "Imbued Mithril Reinforced Cloak", 228, [{ id: "item:cloak-pattern" }, { id: "item:excellent-sabertooth-tiger-hide" }, { id: "item:imbued-emerald" }, { id: "item:mithril-boning", quantity: 2 }, { id: "item:oak-bark-tannin" }], "item:imbued-mithril-reinforced-cloak", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:imbued-mithril-reinforced-gloves", "Imbued Mithril Reinforced Gloves", { slots: ["Hands"], ac: 7, stats: {"cha":2,"wis":1}, weight: 1, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-mithril-reinforced-gloves", "Imbued Mithril Reinforced Gloves", 228, [{ id: "item:excellent-sabertooth-tiger-hide" }, { id: "item:glove-pattern" }, { id: "item:imbued-emerald" }, { id: "item:mithril-boning", quantity: 2 }, { id: "item:oak-bark-tannin" }], "item:imbued-mithril-reinforced-gloves", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:imbued-mithril-reinforced-gorget", "Imbued Mithril Reinforced Gorget", { slots: ["Neck"], ac: 6, stats: {"cha":1,"wis":1}, weight: 0.4, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-mithril-reinforced-gorget", "Imbued Mithril Reinforced Gorget", 228, [{ id: "item:excellent-sabertooth-tiger-hide" }, { id: "item:gorget-pattern" }, { id: "item:imbued-emerald" }, { id: "item:mithril-boning" }, { id: "item:oak-bark-tannin" }], "item:imbued-mithril-reinforced-gorget", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:imbued-mithril-reinforced-leggings", "Imbued Mithril Reinforced Leggings", { slots: ["Legs"], ac: 8, stats: {"cha":3,"wis":2}, weight: 3, size: "Medium", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-mithril-reinforced-leggings", "Imbued Mithril Reinforced Leggings", 228, [{ id: "item:excellent-sabertooth-tiger-hide" }, { id: "item:imbued-emerald" }, { id: "item:mithril-boning", quantity: 3 }, { id: "item:oak-bark-tannin" }, { id: "item:pant-pattern" }], "item:imbued-mithril-reinforced-leggings", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:imbued-mithril-reinforced-mantle", "Imbued Mithril Reinforced Mantle", { slots: ["Shoulders"], ac: 6, stats: {"cha":2,"wis":1}, weight: 1, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-mithril-reinforced-mantle", "Imbued Mithril Reinforced Mantle", 228, [{ id: "item:excellent-sabertooth-tiger-hide" }, { id: "item:imbued-emerald" }, { id: "item:mithril-boning", quantity: 2 }, { id: "item:oak-bark-tannin" }, { id: "item:shoulderpad-pattern" }], "item:imbued-mithril-reinforced-mantle", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:imbued-mithril-reinforced-mask", "Imbued Mithril Reinforced Mask", { slots: ["Face"], ac: 5, stats: {"cha":1,"wis":1}, weight: 0.3, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-mithril-reinforced-mask", "Imbued Mithril Reinforced Mask", 228, [{ id: "item:excellent-sabertooth-tiger-hide" }, { id: "item:imbued-emerald" }, { id: "item:mask-pattern" }, { id: "item:mithril-boning" }, { id: "item:oak-bark-tannin" }], "item:imbued-mithril-reinforced-mask", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:imbued-mithril-reinforced-skullcap", "Imbued Mithril Reinforced Skullcap", { slots: ["Head"], ac: 7, stats: {"cha":2,"wis":1}, weight: 0.5, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-mithril-reinforced-skullcap", "Imbued Mithril Reinforced Skullcap", 228, [{ id: "item:cap-pattern" }, { id: "item:excellent-sabertooth-tiger-hide" }, { id: "item:imbued-emerald" }, { id: "item:mithril-boning", quantity: 2 }, { id: "item:oak-bark-tannin" }], "item:imbued-mithril-reinforced-skullcap", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:imbued-mithril-reinforced-sleeves", "Imbued Mithril Reinforced Sleeves", { slots: ["Arms"], ac: 7, stats: {"cha":2,"wis":2}, weight: 1, size: "Small", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-mithril-reinforced-sleeves", "Imbued Mithril Reinforced Sleeves", 228, [{ id: "item:excellent-sabertooth-tiger-hide" }, { id: "item:imbued-emerald" }, { id: "item:mithril-boning", quantity: 2 }, { id: "item:oak-bark-tannin" }, { id: "item:sleeve-pattern" }], "item:imbued-mithril-reinforced-sleeves", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:imbued-mithril-reinforced-tunic", "Imbued Mithril Reinforced Tunic", { slots: ["Chest"], ac: 12, stats: {"cha":3,"wis":2}, weight: 2.5, size: "Medium", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Warrior"], deity: "Tunare", magic: true });
addRecipe("recipe:imbued-mithril-reinforced-tunic", "Imbued Mithril Reinforced Tunic", 228, [{ id: "item:excellent-sabertooth-tiger-hide" }, { id: "item:imbued-emerald" }, { id: "item:mithril-boning", quantity: 4 }, { id: "item:oak-bark-tannin" }, { id: "item:tunic-pattern" }], "item:imbued-mithril-reinforced-tunic", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:mithril-reinforced-leggings", "Mithril Reinforced Leggings", { slots: ["Legs"], ac: 8, weight: 3, size: "Medium", classes: ["Bard","Cleric","Druid","Paladin","Ranger","Rogue","Shadow Knight","Warrior"] });
addRecipe("recipe:mithril-reinforced-leggings", "Mithril Reinforced Leggings", 215, [{ id: "item:excellent-sabertooth-tiger-hide" }, { id: "item:mithril-boning", quantity: 3 }, { id: "item:oak-bark-tannin" }, { id: "item:pant-pattern" }], "item:mithril-reinforced-leggings", ["container:feirdal-sewing-kit"], "Tailoring");

addItem("item:oak-bark", "Oak Bark", { weight: 0.1, size: "Small", source: "Ground spawn in Butcherblock Mountains at -1748, -368 (? see below) by the goblin camp on road to Dagnors Cauldron.  Found it least aggravating on eyes to have wolf form, scroll out to look from above, strafe back and forth to grid out the area, and dusk/evening was easier with a light source - the spawns glowed slightly better." });


// Feir'Dal Sewing Kit: a real container node (Mixing Bowl/Spit precedent),
// not a plain item -- every Tailoring recipe above targets it via crafted_in,
// and its own Blacksmithing recipe below targets it via produces.
addContainer("container:feirdal-sewing-kit", "Feir'Dal Sewing Kit", { weight: 4, capacity: 10, containerSize: "Large" });
addRecipe("recipe:feirdal-sewing-kit", "Feir'Dal Sewing Kit", 162, [{ id: "item:mithril-bits" }, { id: "item:needle-mold" }, { id: "item:thimble-mold" }, { id: "item:water-flask" }], "container:feirdal-sewing-kit", ["container:forge"], "Blacksmithing");

save();
console.log(`Migration complete: ${recipesAdded} recipe(s), ${itemsAdded} item(s) added`);
