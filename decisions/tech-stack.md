# Tech stack

- **TypeScript** — graph module and server
- **Cytoscape.js** — graph visualization (CDN, not bundled)
- **No framework** — vanilla HTML/JS frontend
- **data/graph.json** — flat file persistence, no database
- **Playwright** — devDependency used for ad hoc browser-based UI verification (not by any committed script — `scripts/scrape-spell-details.ts` uses plain `fetch()` against the MediaWiki API, no browser involved); not part of the running app. On this machine, Playwright's own driver subprocess only completes its handshake when invoked via plain `node`, not `bun run` — see `.claude/skills/verify/SKILL.md` for the full finding and working recipe.
