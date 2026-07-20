/**
 * Migration 082: fifth batch of the "random-reward followup" sweep
 * (random-reward-followup.md). Each reward pool re-verified against the
 * quest's own eqlwiki.com page (and each new item's own page) per
 * decisions/eqlwiki-quest-research-method.md.
 *
 * - Lizard Tails: "A piece of Raw-Hide Armor Set" -- the same 12-piece set
 *   already fully modeled in migrations 080/081 (Help Hergor Get Fatter /
 *   Kobold Killing). No new nodes, just reward edges.
 * - Lynuga's Gem Collection: unhedged 3-item pool, all confirmed via each
 *   item's own page (Midnight Mallet, Brutechopper, Ivandyr's Hoop) -- 3 new
 *   nodes, no `races` field since that isn't part of this repo's item
 *   schema (decisions/item-node-schema.md only tracks `classes`).
 * - Magic Elixir for the Warriors: unhedged 7-item pool named on the quest's
 *   own page. 4 already modeled (Copper Band, Turquoise, Large Patchwork
 *   Pants, Rusty Axe); 3 new nodes (Lapis Lazuli, Tattered Cloth Sandal,
 *   Leather Boots) added from their own item pages.
 *
 * Not modeled this batch:
 * - Lizard Tails No 2: wiki states only generic "Piece of Tattered armor,"
 *   with no hyperlink or other signal distinguishing Small Tattered Armor
 *   Set (Rat Patrol/Bone Chips/Crushbone Belts) from Large Tattered Armor
 *   Set (Cindl's Polar Bear Collection/Help Hergor Get Fatter) -- neither
 *   set's own eqlwiki page lists its quest sources either. Left unresolved
 *   rather than guess.
 * - Magician Spells (Good) and (Evil): both confirmed as real, fully-statted
 *   spells on eqlwiki.com (Boon of Immolation, Scintillation, Vocarate: Air,
 *   Vocarate: Fire) -- not a corpus-wide Magician gap (157 other Magician
 *   spells already exist). But per decisions/eqlwiki-quest-research-method.md
 *   ("WebFetch summarizes through a small model, risky for exact numbers")
 *   and this project's spell nodes carrying fields (fizzleTime, targetType,
 *   resist, range, icon) no WebFetch summary reliably supplies, hand-authoring
 *   these 4 from a summarized fetch risks a spell node with fabricated or
 *   wrong fields. Left for the actual spell-scrape pipeline
 *   (scripts/scrape-spell-details.ts) rather than patched here.
 */

import { loadGraph } from "./_lib";

const { addNode, addEdge, save } = loadGraph(import.meta.dir);

// -- Lizard Tails: same Raw-Hide Armor Set as migrations 080/081 --
const rawHidePool = [
  "item:raw-hide-belt",
  "item:raw-hide-boots",
  "item:raw-hide-cloak",
  "item:raw-hide-gloves",
  "item:raw-hide-gorget",
  "item:raw-hide-mask",
  "item:raw-hide-shoulderpads",
  "item:raw-hide-skullcap",
  "item:raw-hide-sleeves",
  "item:raw-hide-tunic",
  "item:raw-hide-wristbands",
  "item:raw-hide-leggings",
];
for (const id of rawHidePool) {
  addEdge("quest:lizard-tails", id, "rewards", { randomGroup: "lizard-tails-drop" });
}

// -- Lynuga's Gem Collection: unhedged 3-item pool --
addNode({
  id: "item:midnight-mallet",
  label: "Midnight Mallet",
  type: "item",
  slots: ["Primary"],
  skill: "2H Blunt",
  delay: 44,
  damage: 14,
  effect: "Walking Sleep",
  classes: ["cleric", "shaman", "beastlord", "berserker"],
  weight: 11.0,
  size: "Giant",
  magic: true,
  lore: true,
  source: "Lynuga's Gem Collection reward (Lynuga, near the Guk entrance, Innothule Swamp) -- rare pick",
});
addNode({
  id: "item:brutechopper",
  label: "Brutechopper",
  type: "item",
  slots: ["Primary"],
  skill: "2H Slashing",
  delay: 50,
  damage: 16,
  classes: ["warrior", "paladin", "shadow knight", "rogue"],
  weight: 11.0,
  size: "Giant",
  magic: true,
  lore: true,
  source: "Lynuga's Gem Collection reward (Lynuga, near the Guk entrance, Innothule Swamp) -- common pick",
});
addNode({
  id: "item:ivandyrs-hoop",
  label: "Ivandyr's Hoop",
  type: "item",
  slots: ["Ear"],
  ac: 6,
  stats: { wis: 6, int: 6 },
  hp: 6,
  effect: "Spirit Tap",
  weight: 0.1,
  size: "Tiny",
  magic: true,
  lore: true,
  source: "Lynuga's Gem Collection reward (Lynuga, near the Guk entrance, Innothule Swamp) -- ultra-rare pick",
});

const lynugasPool = ["item:midnight-mallet", "item:brutechopper", "item:ivandyrs-hoop"];
for (const id of lynugasPool) {
  addEdge("quest:lynugas-gem-collection", id, "rewards", { randomGroup: "lynugas-gem-collection-drop" });
}

// -- Magic Elixir for the Warriors: unhedged 7-item pool, 3 new nodes --
addNode({
  id: "item:lapis-lazuli",
  label: "Lapis Lazuli",
  type: "item",
  weight: 0.1,
  size: "Tiny",
  source: "Magic Elixir for the Warriors reward (Dargon McPherson, Halas); also a common tradeskill/jewelcrafting ingredient",
});
addNode({
  id: "item:tattered-cloth-sandal",
  label: "Tattered Cloth Sandal",
  type: "item",
  slots: ["Feet"],
  ac: 1,
  weight: 0.3,
  size: "Small",
  source: "Magic Elixir for the Warriors reward (Dargon McPherson, Halas)",
});
addNode({
  id: "item:leather-boots",
  label: "Leather Boots",
  type: "item",
  slots: ["Feet"],
  ac: 4,
  classes: ["warrior", "cleric", "paladin", "ranger", "shadow knight", "druid", "monk", "bard", "rogue", "shaman", "beastlord", "berserker"],
  weight: 2.5,
  size: "Small",
  source: "Magic Elixir for the Warriors reward (Dargon McPherson, Halas); part of the Leather Armor Set",
});

const magicElixirPool = [
  "item:copper-band",
  "item:lapis-lazuli",
  "item:tattered-cloth-sandal",
  "item:turquoise",
  "item:large-patchwork-pants",
  "item:leather-boots",
  "item:rusty-axe",
];
for (const id of magicElixirPool) {
  addEdge("quest:magic-elixir-for-the-warriors", id, "rewards", { randomGroup: "magic-elixir-for-the-warriors-drop" });
}

save();
console.log("Migration 082 complete: modeled random-reward pools for Lizard Tails, Lynuga's Gem Collection, and Magic Elixir for the Warriors");
