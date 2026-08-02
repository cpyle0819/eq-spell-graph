/**
 * Migration 399: fills gaps in `vendor:surefall-glade:arrivae-valleren`'s
 * (Druid Guild, zone:surefall-glade) `sells` edges, sourced from a real
 * purchase log -- scripts/parse-eq-log.ts now extracts "You purchased ..."
 * lines into structured records (see that script's docblock), run against
 * `eqlog_Hahl_rivervale.txt`. 56 unique spells were purchased from this
 * vendor; 20 already had a `sells` edge (one more, "Invisibility vs.
 * Animals", is already covered under the graph's existing label
 * "Invisibility versus Animals"), leaving the 45 below with no edge at all.
 */

import { loadGraph } from "./_lib";

const { graph, hasNode, hasEdge, addEdge, save } = loadGraph(import.meta.dir);

const VENDOR_ID = "vendor:surefall-glade:arrivae-valleren";

const MISSING_SPELL_IDS = [
  "spell:endure-fire",
  "spell:skin-like-wood",
  "spell:dance-of-the-fireflies",
  "spell:ward-summoned",
  "spell:whirling-wind",
  "spell:budding-heal",
  "spell:firefist",
  "spell:enduring-breath",
  "spell:strength-of-earth",
  "spell:thistlecoat",
  "spell:remove-minor-curse",
  "spell:starshine",
  "spell:endure-cold",
  "spell:protection-of-wood",
  "spell:stinging-swarm",
  "spell:sprouting-heal",
  "spell:summon-drink",
  "spell:halo-of-light",
  "spell:summon-food",
  "spell:bind-affinity",
  "spell:cascade-of-hail",
  "spell:levitate",
  "spell:careless-lightning",
  "spell:superior-camouflage",
  "spell:healing",
  "spell:skin-like-rock",
  "spell:barbcoat",
  "spell:cancel-magic",
  "spell:expulse-summoned",
  "spell:resist-fire",
  "spell:endure-poison",
  "spell:endure-disease",
  "spell:ring-of-surefall-glade",
  "spell:dizzying-wind",
  "spell:shield-of-barbs",
  "spell:ring-of-north-karana",
  "spell:ring-of-butcherblock",
  "spell:ring-of-toxxulia",
  "spell:ring-of-west-commons",
  "spell:flowering-heal",
  "spell:ring-of-south-ro",
  "spell:ring-of-stonebrunt",
  "spell:lesser-succor",
  "spell:protection-of-rock",
  "spell:tiny-companion",
];

if (!hasNode(VENDOR_ID)) throw new Error(`vendor not found: ${VENDOR_ID}`);

let added = 0;
for (const spellId of MISSING_SPELL_IDS) {
  if (!hasNode(spellId)) throw new Error(`spell not found: ${spellId}`);
  if (hasEdge(VENDOR_ID, spellId, "sells")) continue;
  addEdge(VENDOR_ID, spellId, "sells");
  added++;
}

save();
console.log(`Migration 399 complete: added ${added} sells edge(s) from ${VENDOR_ID}`);
console.log(`vendor now sells ${graph.edges.filter((e: { source: string; type: string }) => e.source === VENDOR_ID && e.type === "sells").length} spell(s) total`);
