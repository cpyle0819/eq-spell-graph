/**
 * Migration 441 (issue #46, batch 9/N): flag Alchemy's own "Skill
 * Progression" leveling path.
 *
 * eqlwiki's `Skill Alchemy` page gives a 5-step named path from trivial 1
 * through 255 (Potion of Accuracy -> Greater Potion of Accuracy -> Elixir
 * of Concentration -> Elixir of Greater Concentration -> Potion of
 * Mystical Aptitude), then a distinct "After Skill 255" section explicitly
 * framed as a free choice rather than one more named step: "Any of the
 * following recipes can take Alchemy up to skill 300" -- the 6 Distillate
 * IX potions (Alacrity/Celestial Healing/Clarity/Divine Healing/
 * Replenishment/Spirituality), all trivial 302. Unlike Jewelcrafting's own
 * leveling-guide derivation (decisions/tradeskill-recipe-node-schema.md),
 * there's no "least travel" tiebreak available to pick just one of the 6 --
 * every one of them shares the same non-vendor-sourced Deepwater Ink
 * (no `soldby` table on eqlwiki, added by migration 440 with no `sells`
 * edge) alongside a vendor-sourced Comfrey and flavor ingredient, so they
 * tie on sourceability exactly the way the wiki's own "any of" phrasing
 * implies. All 6 are flagged `levelingGuide: true` rather than picking one
 * arbitrarily.
 *
 * **A caught ingredient discrepancy, not applied**: the "After Skill 255"
 * table's own row for Distillate of Replenishment IX and Distillate of
 * Spirituality IX lists Clivers/Methysticum twice instead of once (with no
 * Deepwater Ink), breaking the uniform Comfrey + Deepwater Ink + flavor +
 * 5x Small Vial shape every other Distillate IX row (both in this table
 * and the main "Recipes listed by trivial" table) shares -- a wiki
 * transcription slip, not a second real recipe variant. Migration 440
 * already modeled all 6 using the uniform, main-table-sourced ingredient
 * list; this migration only adds the `levelingGuide` flag, no data change.
 */

import { loadGraph } from "./_lib";

const { graph, save } = loadGraph(import.meta.dir);

const LEVELING_GUIDE_RECIPES = [
  "recipe:potion-of-accuracy",
  "recipe:greater-potion-of-accuracy",
  "recipe:elixir-of-concentration",
  "recipe:elixir-of-greater-concentration",
  "recipe:potion-of-mystical-aptitude",
  "recipe:distillate-of-alacrity-ix",
  "recipe:distillate-of-celestial-healing-ix",
  "recipe:distillate-of-clarity-ix",
  "recipe:distillate-of-divine-healing-ix",
  "recipe:distillate-of-replenishment-ix",
  "recipe:distillate-of-spirituality-ix",
];

let flagged = 0;
for (const id of LEVELING_GUIDE_RECIPES) {
  const node = graph.nodes.find((n: { id: string }) => n.id === id);
  if (node) {
    node.levelingGuide = true;
    flagged++;
  }
}

save();
console.log(`Migration 441 complete: ${flagged} recipes flagged levelingGuide`);
