/**
 * Migration 357: backfill weight/size on Brewing's 11 produced items, and
 * add the wiki's own "QUEST ITEM" flag to items migration 355 missed it on
 * -- issue #32 asked to fully pull in Brewing's item data, including any
 * bonus stats/effects on output items.
 *
 * Re-fetched every produced item's own eqlwiki.com page (raw wikitext via
 * `action=query&prop=revisions`, same method as migration 355) rather than
 * trusting migration 355's item-adding pass, which only carried over each
 * item's `source` note and skipped its statsblock's own WT/Size line
 * entirely. **None of the 11 carry an `effect` line** -- confirmed by
 * reading each page's own statsblock, not assumed; Brewing's output items
 * are plain consumables/quest turn-ins, not clicky/proc items, so no
 * `effect` field is added here (see decisions/item-node-schema.md: don't
 * add a field the source data doesn't actually have).
 *
 * "QUEST ITEM" is its own literal statsblock line, distinct from the
 * NO DROP/NO TRADE flags `noTrade` already collapses (decisions/
 * item-node-schema.md) -- migration 355 already used a free-text
 * "-- Quest Item" `source` suffix for 3 items (Bog Juice, Ol'Tujim's Fierce
 * Brew, Minotaur Hero's Brew) based on the Quest Items wiki category; this
 * migration applies the same suffix to the remaining items whose page
 * literally states QUEST ITEM in its statsblock (a stronger, more direct
 * signal than category membership alone), which migration 355 missed:
 * Short Beer, Short Ale, Gnomish Spirits, Faydwer Shaker among produced
 * items, and Bottle, Barley, Hops, Malt, Snake Scales, Spider Legs among
 * base ingredients.
 */

import { loadGraph } from "./_lib";

const { updateNode, save } = loadGraph(import.meta.dir);

let updated = 0;

function backfill(id: string, updates: Record<string, unknown>) {
  updateNode(id, updates);
  updated++;
}

// Produced items -- weight/size straight off each item's own statsblock.
backfill("item:ale", { weight: 0.4, size: "Small" });
backfill("item:bog-juice", { weight: 0.4, size: "Small" });
backfill("item:heady-kiola", { weight: 0.2, size: "Small" });
backfill("item:fish-wine", { weight: 0.4, size: "Small" });
backfill("item:ginesh", { weight: 0.2, size: "Small" });
backfill("item:ol-tujims-fierce-brew", { weight: 0.5, size: "Small" });
backfill("item:minotaur-heros-brew", { weight: 0.4, size: "Small" });

// Produced items that also need the "QUEST ITEM" statsblock flag noted.
backfill("item:short-ale", { weight: 0.4, size: "Small", source: "Brewed via Brewing (trivial 51) -- Quest Item" });
backfill("item:short-beer", { weight: 0.4, size: "Small", source: "Brewed via Brewing (trivial 31) -- Quest Item" });
backfill("item:gnomish-spirits", { weight: 0.4, size: "Small", source: "Brewed via Brewing (trivial 102) -- Quest Item" });
backfill("item:faydwer-shaker", { weight: 0.4, size: "Small", source: "Brewed via Brewing (trivial 188) -- Quest Item" });

// Base ingredients that already had weight/size (migration 355) but were
// missing their own page's "QUEST ITEM" flag.
backfill("item:bottle", { source: "Quest Item" });
backfill("item:barley", { source: "Quest Item" });
backfill("item:hops", { source: "Quest Item" });
backfill("item:malt", { source: "Quest Item" });
backfill("item:snake-scales", { source: "Dropped by snakes across many zones -- Quest Item" });
backfill("item:spider-legs", { source: "Dropped by spiders across many zones -- Quest Item" });

save();
console.log(`Migration 357 complete: ${updated} item(s) backfilled for Brewing`);
