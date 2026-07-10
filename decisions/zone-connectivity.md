# Zone connectivity

89 zones (73 original + 15 classic dungeons added in migration 015 + Stonebrunt Mountains added in migration 020), 47 of which have spell vendors, all reachable via bidirectional BFS. Migration 010 fixed two vendor zones (Ocean of Tears, High Keep) that had `sells` edges but no `connects_to` edges, making them unreachable.

Migration 020 added Stonebrunt Mountains, an overland zone that was simply missing — surfaced when the Leveling Guide linked to it and Route Finder had nothing to route to. Its single `connects_to` edge (to The Warrens) is sourced from eqlwiki.com/Stonebrunt_Mountains directly, per the "verify against eqlwiki.com" rule above — no P1999 exception here since this is an overland zone, not one of migration 015's classic dungeons.

