/**
 * Fixes GitHub issue #37: `zone:burning-wood` and `zone:burning-woods` were
 * two nodes for the same real zone. Confirmed against eqlwiki.com directly
 * (https://eqlwiki.com/Burning_Wood) -- the page's own title is "Burning
 * Wood" and its text states players normally call it "Burning Woods".
 * `zone:burning-wood` survives (matches the real wiki page title/URL) and
 * its label is kept, but `zone:burning-woods`' lore text (the only one of
 * the two that actually quotes the "normally called Burning Woods by
 * players" line -- confirmed verbatim against the live wiki page) and its
 * richer faction table are both merged onto the survivor, and every
 * edge/NPC pointing at the `-woods` id is retargeted before that node is
 * deleted, per the issue's own merge guardrail.
 *
 * `zone:burning-woods` had a `connects_to` <-> Chardok pair `zone:burning-
 * wood` didn't have -- retargeted, not duplicated (surviving node had none
 * to begin with). The wiki page also lists Frontier Mountains, Dreadlands,
 * and Skyfire Mountains as adjacent, but those edges don't exist under
 * either id today -- out of scope here (that's map-completeness work,
 * issue #36), this migration only removes the duplicate.
 */
import { dirname } from "path";
import { fileURLToPath } from "url";
import { loadGraph } from "./_lib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const { graph, save } = loadGraph(__dirname);

const survivor = "zone:burning-wood";
const dupe = "zone:burning-woods";

const survivorNode = graph.nodes.find((n: any) => n.data.id === survivor);
const dupeNode = graph.nodes.find((n: any) => n.data.id === dupe);
if (!survivorNode || !dupeNode) {
  throw new Error("Expected both zone:burning-wood and zone:burning-woods to exist");
}

// Merge the richer faction table and the more complete lore text (the only
// one of the two that quotes "normally called Burning Woods by players")
// onto the surviving node; label/era/wiki_title already match.
survivorNode.data.faction = dupeNode.data.faction;
survivorNode.data.lore = dupeNode.data.lore;

// Rename the two NPCs housed in the duplicate zone to the survivor's id
// namespace.
const npcRenames: Record<string, string> = {
  "npc:burning-woods:slixin-klex": "npc:burning-wood:slixin-klex",
  "npc:burning-woods:entalon": "npc:burning-wood:entalon",
};
for (const node of graph.nodes) {
  if (node.data.id in npcRenames) {
    node.data.id = npcRenames[node.data.id];
  }
}

// Retarget every edge referencing the duplicate zone id or either renamed
// NPC id.
for (const edge of graph.edges) {
  if (edge.data.source === dupe) edge.data.source = survivor;
  if (edge.data.target === dupe) edge.data.target = survivor;
  if (edge.data.source in npcRenames) edge.data.source = npcRenames[edge.data.source];
  if (edge.data.target in npcRenames) edge.data.target = npcRenames[edge.data.target];
}

// Drop the now-orphaned duplicate zone node.
graph.nodes = graph.nodes.filter((n: any) => n.data.id !== dupe);

save();
console.log("Migration 066 complete: merged zone:burning-woods into zone:burning-wood (issue #37)");
