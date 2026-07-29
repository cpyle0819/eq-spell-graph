/**
 * Issue #58: Flaming Pungla's `source` read "Grobb Cleaver quest ingredient"
 * -- copy-pasted from Human/Erudite (Chunk of) Meat, its siblings in
 * recipe:hehe-meat's own ingredient list, but wrong for this item.
 * https://eqlwiki.com/Flaming_Pungla states plainly: "Obtained by giving 3
 * gold to Pungla. May be related to HEHE Meat in some way?" and "This item
 * has no related quests." Corrected to match the wiki.
 */

import { loadGraph } from "./_lib";

const { updateNode, save } = loadGraph(import.meta.dir);

updateNode("item:flaming-pungla", {
  source: "Obtained by giving 3 gold to an NPC named Pungla -- not a quest reward, drop, forage, fish, or craft",
});

save();
console.log("Migration 371 complete: corrected Flaming Pungla's source note");
