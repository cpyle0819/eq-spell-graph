# Stance/invocation nodes: single-page scrape, not per-entity

`stance` and `invocation` nodes (migration 016) carry `label`, `description`, and a `classes: string[]` array of full lowercase class names — no `level`, since both are granted at level 1 (unlike `spell.class_levels`, which pairs each class with a level). Unlike spell data (scraped per-spell, one wiki page per spell), all 18 stances/invocations live on a single eqlwiki.com page ("Stances & Invocations") as two summary wikitables. `scripts/scrape-stances.ts` fetches that one page via the MediaWiki API and parses both tables directly, rather than following per-ability links — there's only one page to fetch, so the batching/resume logic `scrape-spell-details.ts` needs doesn't apply here.

Table-cell parsing has to treat any wikitext line not starting with `|` as a continuation of the previous cell, not a new one — some descriptions (e.g. Divine, Empower, Offensive, Striker) wrap across multiple source lines inside a single cell, and a naive "keep lines starting with `|`" filter silently truncates them at the first line break.

