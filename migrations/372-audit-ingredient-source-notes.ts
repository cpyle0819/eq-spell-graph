/**
 * Issue #58 follow-up: audits the free-text `source` note on every
 * Brewing/Baking ingredient migration 370 didn't backfill with structured
 * sourcing (no findable zone/vendor at the time). Each correction below was
 * checked directly against eqlwiki.com (not reused from the existing prose
 * -- same reasoning as migration 370's own sourcing note in decisions/
 * item-drops-edge-and-item-located-in.md).
 *
 * Bottle/Barley/Hops/Malt: were "Quest Item" -- eqlwiki confirms all four
 * are plain vendor purchases (Bottle also craftable via Brewing), with no
 * related quest at all.
 *
 * Neriak Nectar/Kiola Nut: named a specific NPC+quest reward
 * ("Trizam N`Tan"/"Bracers of Erollisi Quest", "Styria Fearnon"/"Pirate
 * Earrings") that eqlwiki doesn't corroborate -- the wiki shows a
 * different real vendor for each (Cecile K`Jartan in Neriak Third Gate;
 * Cleonae Kalen on Erollisi Isle) and no confirmation of the claimed
 * reward. Corrected to the vendor eqlwiki actually documents.
 *
 * Baking Spirits: was "Found in South Qeynos -- Paw of Opolla quest
 * ingredient" (implying forage). eqlwiki says it's vendor-sold by Karn
 * Tassen in South Qeynos, and the real quest tie is "Rat Ear Pie Quest,"
 * not "Paw of Opolla." Karn Tassen already exists as a real vendor NPC
 * here (sells Water Flask/Mixing Bowl/Cup of Flour) -- adds the missing
 * `sells` edge alongside the text fix, not just the text.
 *
 * Human (Chunk of) Meat/Erudite Meat: both carried a "...Grobb Cleaver
 * quest ingredient" suffix -- the same copy-pasted claim already proven
 * wrong on their recipe:hehe-meat sibling Flaming Pungla (migration 371).
 * eqlwiki explicitly states Erudite Meat has no related quests; Human Meat
 * has no findable wiki page at all (migration 370's own note) but shares
 * the identical suspect suffix, so it's trimmed too. The "Dropped by X"
 * prefix on both stays -- eqlwiki's pages for these are simply blank/
 * unfilled on acquisition, not contradicting, same "keep the best
 * available guess" precedent the decision doc already set for Boar
 * Carp/Highland Pike's "Fished" note.
 *
 * Algae Spices/Jug of Oyster Sauces/Plankton Frosting/Seaweed Vinegar:
 * were accurate but stated only the item's *role* ("Velious-era X
 * substitute"), not how to get it -- all four already have real `sells`
 * edges in this graph (so the ingredient card's own Sold By section
 * already covers this), but the free-text note is also what item-chip.js's
 * hover tooltip shows everywhere else these items appear, so it's enriched
 * with the vendor eqlwiki names (Bloogy Shellcracker, Cobalt Scar; also an
 * Innkeep in Rivervale for Plankton Frosting) rather than left silent on it.
 *
 * Swamp Vegetables: was generic "Foraged" with no zone, but eqlwiki names
 * an exact, already-catalogued zone ("Innothule Swamp, near Grobb
 * entrance") -- this is the same shape of fact migration 370 backfilled as
 * a real `located_in` edge for 173 other ingredients, just missed for this
 * one. Adds the edge instead of only improving the text.
 *
 * Everything else audited alongside these (Dwarven Ale, Saltwater Seaweed,
 * Jug of Sauces, Pie Tin/Cake Round/Bread Tin/Muffin Tin/Skewers, the raw
 * fish's generic "Fished," and Sarnak Blood/Unicorn Meat/Sifaye Parts'
 * generic "Dropped by X") already matched eqlwiki or fell under the same
 * "wiki page exists but is blank on acquisition" precedent -- left as is.
 */

import { loadGraph } from "./_lib";

const { updateNode, addEdge, save } = loadGraph(import.meta.dir);

updateNode("item:bottle", {
  source: "Sold by merchants across many zones; also craftable via Brewing. Not dropped by mobs, no related quest.",
});
updateNode("item:barley", {
  source: "Sold by merchants across many zones. Not dropped by mobs, no related quest.",
});
updateNode("item:hops", {
  source: "Sold by merchants across many zones. Not dropped by mobs, no related quest.",
});
updateNode("item:malt", {
  source: "Sold by merchants across many zones. Not dropped by mobs, not player-crafted.",
});
updateNode("item:neriak-nectar", {
  source: "Sold by Cecile K`Jartan (Neriak Third Gate); a drink. Not dropped by mobs, not player-crafted.",
});
updateNode("item:kiola-nut", {
  source: "Sold by Cleonae Kalen (Erollisi Isle, Ocean of Tears); also appears in several Ocean of Tears-area quests (Exotic Drinks, Pirate Earrings, Tumpy Tonics, Trueshot Longbow). Not dropped by mobs, not player-crafted.",
});
updateNode("item:baking-spirits", {
  source: "Sold by Karn Tassen (South Qeynos); ingredient for the Rat Ear Pie Quest's Uncooked Rat Ear Pie. Not dropped by mobs, not player-crafted.",
});
updateNode("item:human-meat", { source: "Dropped by humans" });
updateNode("item:erudite-meat", { source: "Dropped by erudites" });
updateNode("item:algae-spices", {
  source: "Sold by Bloogy Shellcracker (Cobalt Scar); the Velious-era substitute for Spices",
});
updateNode("item:jug-of-oyster-sauces", {
  source: "Sold by Bloogy Shellcracker (Cobalt Scar); the Velious-era substitute for Jug of Sauces",
});
updateNode("item:plankton-frosting", {
  source: "Sold by Bloogy Shellcracker (Cobalt Scar) or the Innkeep (Rivervale); the Velious-era substitute for Frosting",
});
updateNode("item:seaweed-vinegar", {
  source: "Sold by Bloogy Shellcracker (Cobalt Scar); the Velious-era substitute for Vinegar",
});

addEdge("item:swamp-vegetables", "zone:innothule-swamp", "located_in", { method: "forage" });
addEdge("npc:south-qeynos:karn-tassen", "item:baking-spirits", "sells");

save();
console.log("Migration 372 complete: corrected 13 ingredient source notes, added Swamp Vegetables forage edge and Baking Spirits vendor edge");
