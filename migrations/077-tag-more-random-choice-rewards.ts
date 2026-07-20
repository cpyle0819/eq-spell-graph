/**
 * Migration 077: tags `randomGroup` (decisions/quest-reward-modeling.md) on
 * the remaining pre-existing quests whose description says the reward is a
 * random pick and which already have 2+ item/spell reward edges modeled --
 * found by sweeping every quest node for "random" in its description/steps
 * after migrations 074-076 fixed the first three. Of the 55 quests that
 * matched that sweep, most (~41) don't get a change here: many only have
 * faction reward edges because the actual random item/spell was never
 * modeled as a node (fixing that means new research against eqlwiki.com,
 * not just tagging existing edges -- out of scope for this migration, left
 * for a future pass), a few "random" hits describe the *turn-in* material's
 * drop rate rather than the reward (Crushbone Shoulderpads Quest), and a
 * couple describe a fixed 1:1 mapping per specific item turned in rather
 * than a pick-one-from-a-set pool (Coldain Books of Tactics: each specific
 * book always yields its own specific item, not a random draw across all
 * four).
 *
 * Black Wolf Skin Quest's pool mixes item and spell targets (3 items, 1
 * spell) -- the one real case so far of decisions/quest-reward-modeling.md's
 * "a group can mix item and spell targets" clause. The Quests UI renders
 * Items and Spells as separate subsections, so this one pool shows up as
 * two same-captioned random blocks (one per subsection) rather than a
 * single combined block -- still an accurate "pick one from this specific
 * set" per subsection, just split visually; documented as a known
 * simplification in quest-shared.js since no other quest needs it yet.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const GRAPH_PATH = resolve(import.meta.dir, "../data/graph.json");
const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

function tagRandomGroup(questId: string, targetIds: string[], group: string) {
  for (const e of graph.edges) {
    if (e.data.source === questId && e.data.type === "rewards" && targetIds.includes(e.data.target)) {
      e.data.randomGroup = group;
    }
  }
}

tagRandomGroup("quest:a-job-for-nanrum", ["item:brass-earring", "item:silver-earring"], "a-job-for-nanrum-drop");
tagRandomGroup(
  "quest:bug-collection",
  ["item:bracelet-of-beetlekind", "item:potion-of-poison-warding", "item:silver-bracelet", "item:spider-venom", "item:stalking-probe"],
  "bug-collection-drop"
);
tagRandomGroup(
  "quest:aviak-chicks",
  ["item:small-patchwork-boots", "item:small-patchwork-cloak", "item:small-patchwork-pants", "item:small-patchwork-sleeves", "item:small-patchwork-tunic"],
  "aviak-chicks-drop"
);
tagRandomGroup("quest:bandit-spectacles", ["spell:center", "spell:endure-poison"], "bandit-spectacles-drop");
tagRandomGroup(
  "quest:basilisk-tongues",
  ["spell:burst-of-flame", "spell:elementaling-water", "spell:elementalkin-earth", "spell:fire-flux", "spell:gate", "spell:true-north"],
  "basilisk-tongues-drop"
);
tagRandomGroup("quest:blessed-oil-quest", ["spell:inspire-fear", "spell:ward-summoned"], "blessed-oil-quest-drop");
tagRandomGroup("quest:blurred-map-quest", ["item:cast-iron-long-sword", "item:cast-iron-mace"], "blurred-map-quest-drop");
tagRandomGroup(
  "quest:behead-the-freeport-militia",
  ["spell:abundant-food", "spell:atone", "spell:word-of-health"],
  "behead-the-freeport-militia-drop"
);
tagRandomGroup(
  "quest:black-wolf-skin-quest",
  ["item:copper-band", "item:rusty-dagger", "item:worn-great-staff", "spell:numbing-cold"],
  "black-wolf-skin-quest-drop"
);
tagRandomGroup(
  "quest:cleanse-the-ocean",
  ["item:small-patchwork-boots", "item:small-patchwork-cloak", "item:small-patchwork-pants", "item:small-patchwork-sleeves", "item:small-patchwork-tunic"],
  "cleanse-the-ocean-drop"
);
tagRandomGroup(
  "quest:cleric-spells-evil",
  ["spell:heroic-bond", "spell:sunskin", "spell:unswerving-hammer-of-faith", "spell:word-of-vigor"],
  "cleric-spells-evil-drop"
);
tagRandomGroup(
  "quest:cleric-spells-good",
  ["spell:heroic-bond", "spell:sunskin", "spell:unswerving-hammer-of-faith", "spell:word-of-vigor"],
  "cleric-spells-good-drop"
);

writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
console.log("Migration 077 complete: tagged randomGroup on 12 more pre-existing quests");
