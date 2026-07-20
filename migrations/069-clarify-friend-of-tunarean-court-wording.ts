/**
 * Clarifies Friend of the Tunarean Court's own description/steps so they
 * stop reading as a mirror-image `requires` claim against the six Crest
 * quests, which each correctly `requires` Friend of the Tunarean Court
 * (migration 068). This quest's old step 2 -- "Complete the six crest
 * sub-quests... and combine all crests in the empty case" -- was worded as
 * a direct imperative step of *this* quest, which reads like "this quest
 * requires those six" when placed next to each Crest quest's own "Requires:
 * Friend of the Tunarean Court" badge (issue #33 made this visible/reported).
 *
 * No edges changed here -- they're already correct. Confirmed against
 * eqlwiki.com/Crest_of_the_Wood_Nymphs_Quest: "After getting the case for
 * the crests (see the Friend of the Tunarean Court Quest), you can do this
 * one" -- the case (from this quest's own first step) is what actually
 * gates the six Crest quests, not full completion of this quest. This
 * quest's own final step (combining crests already earned elsewhere and
 * turning the case back in) is what depends on those six being done, not a
 * separate `requires` relationship in the other direction -- reworded to
 * say that explicitly instead of leaving it implicit and easy to misread.
 */
import { dirname } from "path";
import { fileURLToPath } from "url";
import { loadGraph } from "./_lib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const { graph, save } = loadGraph(__dirname);

const quest = graph.nodes.find((n: any) => n.data.id === "quest:friend-of-the-tunarean-court");
if (!quest) throw new Error("Expected quest:friend-of-the-tunarean-court to exist");

quest.data.description =
  "Shamus Aghllsews in The Wakening Land trades four Kromrif Laborer picks for an empty Case of Tunarean Crests -- the case that unlocks six separate crest sub-quests (Wood Nymphs, Unicorn, Sifaye, Fauns, Drixie, Faerie Dragons, each its own tracked quest). Once all six crests are earned and combined in the case, returning it to Shamus completes this quest.";
quest.data.steps = [
  "Bring Shamus Aghllsews four picks used by the Kromrif Laborers for an empty Case of Tunarean Crests",
  "Using the case, complete each of the six crest sub-quests (Wood Nymphs, Unicorn, Sifaye, Fauns, Drixie, Faerie Dragons -- tracked separately) and combine all six crests in it",
  "Return the completed Case of Tunarean Crests to Shamus Aghllsews",
];

save();
console.log("Migration 069 complete: clarified Friend of the Tunarean Court's description/steps");
