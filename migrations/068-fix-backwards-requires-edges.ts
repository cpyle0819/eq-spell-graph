/**
 * Fixes 8 `requires` edges (migrations 063 and 065, both authored backwards)
 * whose source/target were swapped relative to the established convention
 * (migration 058's Cutthroat Rings --requires--> Orc Picks: source is the
 * *dependent* quest, target is the *prerequisite* -- "Complete Orc Picks
 * first"). Went unnoticed until issue #33 built a real "Requires" section
 * out of what used to be an easy-to-overlook plain-text caption -- with the
 * new prominent badge, "Bonethunder Staff Quest requires Enchant
 * Bonethunder" (backwards) reads as obviously wrong the moment it renders.
 *
 * Friend of the Tunarean Court's own description names the six Crest
 * quests as still-open sub-quests *after* completing it -- so each Crest
 * quest requires Friend of the Tunarean Court first, not the reverse.
 * Cromil's Remains' own steps say "Complete the Bone Chips (Kaladim) quest
 * first." Enchant Bonethunder's own steps say "after obtaining a
 * Bonethunder Staff" (i.e. after finishing Bonethunder Staff Quest).
 */
import { dirname } from "path";
import { fileURLToPath } from "url";
import { loadGraph } from "./_lib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const { graph, save } = loadGraph(__dirname);

const backwardsPairs: [string, string][] = [
  ["quest:friend-of-the-tunarean-court", "quest:crest-of-the-drixie-quest"],
  ["quest:friend-of-the-tunarean-court", "quest:crest-of-the-faerie-dragons-quest"],
  ["quest:friend-of-the-tunarean-court", "quest:crest-of-the-fauns-quest"],
  ["quest:friend-of-the-tunarean-court", "quest:crest-of-the-sifaye-quest"],
  ["quest:friend-of-the-tunarean-court", "quest:crest-of-the-unicorn-quest"],
  ["quest:friend-of-the-tunarean-court", "quest:crest-of-the-wood-nymphs-quest"],
  ["quest:bone-chips-kaladim", "quest:cromils-remains"],
  ["quest:bonethunder-staff-quest", "quest:enchant-bonethunder"],
];

let fixed = 0;
for (const [wrongSource, wrongTarget] of backwardsPairs) {
  const edge = graph.edges.find(
    (e: { data: { type: string; source: string; target: string } }) =>
      e.data.type === "requires" && e.data.source === wrongSource && e.data.target === wrongTarget
  );
  if (!edge) throw new Error(`Expected requires edge ${wrongSource} -> ${wrongTarget} to exist`);
  edge.data.source = wrongTarget;
  edge.data.target = wrongSource;
  fixed++;
}

if (fixed !== backwardsPairs.length) {
  throw new Error(`Expected to fix ${backwardsPairs.length} edges, fixed ${fixed}`);
}

save();
console.log(`Migration 068 complete: corrected direction on ${fixed} backwards requires edges`);
