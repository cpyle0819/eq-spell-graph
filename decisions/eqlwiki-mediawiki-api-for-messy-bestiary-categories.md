# Messy bestiary categories: query eqlwiki's MediaWiki API, don't hand-check every page

Migrations 145-149/152/154/156's bestiary method (see `decisions/mob-node-type.md`) sources a zone's creature list from every page under `Category:<Zone>` that carries the wiki's `{{Namedmobpage}}` combat-stats template — established because a zone's own "Types of Monsters" prose list has no per-creature level data, only names. That method assumes the category is small and mostly creatures. It breaks down for a zone like Chardok, whose `Category:Chardok` mixes 287 pages of items, quests, and mobs with no way to tell them apart except opening each one — not worth doing by hand (see issue #36; Chardok was skipped for this reason in the Burning Wood/Innothule Swamp/Frontier Mountains batch).

**Fix:** hit eqlwiki.com's raw MediaWiki API (`/api.php`), not the rendered page through `WebFetch`'s summarizer. One request tells you, for every page in the category, which templates it transcludes — the exact signal the hand-check method was already looking for, just sourced mechanically for the whole category at once:

```
https://eqlwiki.com/api.php?action=query&generator=categorymembers&gcmtitle=Category:Chardok&gcmlimit=500&prop=templates&tllimit=500&format=json
```

Filter the response client-side for pages whose `templates` array contains `Template:Namedmobpage`. Fetch with `curl`/`fetch`, not `WebFetch` — this is exact JSON, and `WebFetch`'s small-model summarization is both unnecessary and risky at this volume (`decisions/eqlwiki-quest-research-method.md` already flags summarization as lossy for exact data).

**Pagination is required, not optional.** `prop=templates` has its own internal limit independent of `gcmlimit`; if the total template-listings across the batch exceed `tllimit`, the response includes a `continue` object (e.g. `{ tlcontinue: "40442|10|Namedmobpage" }`). Merge that into the next request's params and repeat until `continue` is absent — Chardok's 291 category pages took 4 rounds to fully enumerate, narrowing to 151 `Namedmobpage`-tagged candidates.

**Validated, not just assumed:** two of the 151 candidates with NPC-sounding names ("An Imperial Courier", "A droopy slave") were spot-checked with `WebFetch` and both turned out to be real leveled combat mobs (46-47 and 1 respectively) — consistent with migration 145's precedent that `{{Namedmobpage}}` membership alone reliably distinguishes a mob from a vendor/quest-giver/trainer page, even at this scale.

**What this doesn't solve:** the API's `prop=templates` only reports which templates a page transcludes, not the template's own parameters — so it can't hand back each mob's actual level. Getting the level still means fetching each of the 151 pages individually (via `WebFetch`, per the existing method), just against a precise, complete, mechanically-sourced list instead of 287 pages of guesswork. Chardok's own bestiary is still unstarted (issue #36) — this removes the blocker on *which* pages are worth fetching, not the fetching itself.
