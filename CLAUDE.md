# CLAUDE.md

## Project

Spell shopping route planner for **EverQuest Legends** (EQL) — a separate, newer game from Daybreak, not classic EverQuest/Project 1999. Zone connectivity, NPCs, and content can diverge from classic EQ; verify against eqlwiki.com, not classic-EQ sources (see `decisions/eql-vs-classic-eq-zone-connectivity.md`). Graph-based, faction-aware. Bun + TypeScript backend, vanilla JS frontend.

## Commands

```bash
bun run dev          # Start server on :4321
bun run migrations/NNN-*.ts  # Run a specific migration
```

## Structure

- `data/graph.json` — source of truth (never regenerate from markdown; mutate through `src/graph.ts`, in practice via a migration — see below)
- `src/graph.ts` — data access layer, all reads and writes
- `src/api.ts` — read-only route table, shared by both entry points below
- `src/server.ts` — local Bun dev server: `src/api.ts` routes + dev-only mutation routes + static file serving
- `src/lambda.ts` — Lambda handler wrapping `src/api.ts`; no mutation routes, no knowledge of deployment domain/path
- `scripts/build-lambda.ts` — packages `src/lambda.ts` + `data/graph.json` into `dist-lambda.zip`
- `public/` — SPA (vanilla HTML/JS, no build step); all links/fetches are path-relative, not domain-root-absolute
- `migrations/` — historical, numbered, run-once transformations

## Updating the graph

Never hand-edit `data/graph.json` or regenerate it wholesale. Write a new numbered migration in `migrations/` following the pattern of any existing one (read the file, transform, write it back), run it once with `bun run migrations/NNN-*.ts`, and it stays applied.

**If this app is deployed as a Lambda, the deployment holds its own bundled snapshot of `data/graph.json` from whenever `bun run build:lambda` last ran.** It does not read live from this repo or fetch data at runtime. Running a migration locally has zero effect on a live deployment until someone rebuilds and redeploys — this repo has no hook that does that automatically, and doesn't know how deployment is done for whatever's consuming its Lambda build (see `README.md`'s "Deploying" section, and note that's a deliberate boundary — this repo has no code, comments, or docs describing a specific domain, path, or cloud setup; that lives entirely in whichever separate infra repo does the deploying).

The infra repo that actually owns deployment is **`coreypyle-infra`**, a sibling directory (`../coreypyle-infra`, i.e. both repos live directly under the same parent — see that repo's own README). It holds the Terraform for the S3/CloudFront/Lambda setup and documents the exact redeploy steps (`bun run build:lambda`, `terraform apply`, `aws s3 sync`, CloudFront invalidation). This repo deliberately stays ignorant of those details; look there, not here, for anything domain/path/cloud-specific.

## Delivery workflow

After a feature in this repo is implemented and verified, the default is to commit, push, and deploy (via `coreypyle-infra` — see above) as part of finishing the work, not as a separate follow-up step someone has to ask for. Ask first if a change seems risky to ship immediately (e.g. touches live data, is hard to reverse) — otherwise treat delivery as including deployment.

## Design Decisions

`decisions/` holds architecture choices and EQ domain knowledge that shaped the code — one file per decision, grouped by category in `decisions/INDEX.md`. Read `decisions/INDEX.md` before making changes (it's short — one line per decision); open the specific file(s) relevant to what you're touching for the full rationale rather than reading the whole folder.

When a proposed change conflicts with a decision, surface the conflict to the user before proceeding. Decisions can be updated — but deliberately, not accidentally.

**Bar for logging a new decision:** would this change how someone approaches a similar problem in the future — a reusable rule, a sourcing/scope boundary, a tradeoff someone could accidentally reverse, a footgun worth not re-hitting? If it's just "we found and fixed a bug" with no rule beyond the fix itself, it belongs in the commit message, not here — git history already has it permanently, and a working test/the code itself is the record that it's fixed. When something does clear that bar, add a new file to `decisions/` (slugified title as the filename — see any existing file for the format) and a line to `decisions/INDEX.md` under the right category.

## Conventions

- Edge types encode relationships (`sells`, `located_in`, `connects_to`), not containment hierarchy
- Node types are generic and extensible — add new `type` values, don't restructure
- `spell.class_levels` is the join between spells and classes — never put `level` or `class` as top-level spell properties
- Faction resolution: worst-of(race, primaryClass, deity). Never flatten to a single dimension.
- "Shopping For" class (what spells to find) is independent of "Primary Class" (what drives faction)
- API returns data; frontend renders. No server-side HTML.
- No framework. No build step for the frontend.
- Any distinct visual object (a panel, card, scroll shell, badge, list row) is a real Web Component (Custom Element + Shadow DOM) under `public/components/`, not a string-template helper or hand-rolled page-level markup+CSS — see `decisions/real-web-components-shadow-dom.md`. This app's whole frontend was deliberately converted to this pattern (issue #15); don't reintroduce a page's own `<style>` block hand-rolling a distinct visual element's look, even a one-off, non-repeating one — a static content page (e.g. a field-guide-style page) still componentizes its shell and repeated row/entry shapes the same as every other page does, not just interactive data-driven pages. What legitimately stays plain page CSS: generic layout containers with no visual identity of their own (flex/grid wrappers, `<main>`), and styling for elements nested *inside* a slotted node that a shadow `::slotted()` rule can't reach (single compound selector only, no combinators).
