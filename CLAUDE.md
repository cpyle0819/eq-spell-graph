# CLAUDE.md

## Project

Spell shopping route planner for **EverQuest Legends** (EQL) — a separate, newer game from Daybreak, not classic EverQuest/Project 1999. Zone connectivity, NPCs, and content can diverge from classic EQ; verify against eqlwiki.com, not classic-EQ sources (see `decisions/eql-vs-classic-eq-zone-connectivity.md`). Graph-based, faction-aware. Bun + TypeScript backend, vanilla JS frontend.

## Tenets

`README.md`'s Tenets section (reference over tool, accuracy over UX/completeness, the data is the product) governs everything in this repo — read it before starting work. If a proposed change would conflict with a tenet, surface the conflict to the user before proceeding rather than resolving it silently.

## Commands

```bash
bun run dev          # Start server on :4321
```

## Structure

- `data/graph.json` — source of truth (never regenerate from markdown; mutate through `src/graph.ts`, in practice via a one-off script — see below)
- `src/graph.ts` — data access layer, all reads and writes
- `src/api.ts` — read-only route table, shared by both entry points below
- `src/server.ts` — local Bun dev server: `src/api.ts` routes + dev-only mutation routes + static file serving
- `src/lambda.ts` — Lambda handler wrapping `src/api.ts`; no mutation routes, no knowledge of deployment domain/path
- `scripts/` — one-off graph-mutation scripts plus reusable tooling they build on (`build-lambda.ts`, `graph-lib.ts`, `log-loot-lib.ts`, extractors like `extract-log-loot.ts`)
- `public/` — SPA (vanilla HTML/JS, no build step); all links/fetches are path-relative, not domain-root-absolute
- `.github/workflows/deploy.yml` — fires a `repository_dispatch` to `coreypyle-infra` on every push to `main`; carries no AWS/cloud specifics of its own (see "Updating the graph" below)

## Updating the graph

Never hand-edit `data/graph.json` or regenerate it wholesale. Write a one-off script in `scripts/` that reads the current file, transforms it, and writes it back (reuse `scripts/graph-lib.ts`'s helpers rather than re-deriving node/edge mutation logic); run it once with `bun run scripts/<name>.ts`, verify the diff, then commit `data/graph.json`. Git history is the record of how the graph got here — there's no separate `migrations/` archive to keep in sync with it, so a one-off script can be deleted once it's been run and committed (git still has it if it's ever needed again). Reusable helpers (`graph-lib.ts`, `log-loot-lib.ts`, extractors) stay in `scripts/` since other scripts import them; one-off transform scripts don't need to stick around.

**If this app is deployed as a Lambda, the deployment holds its own bundled snapshot of `data/graph.json` from whenever it was last rebuilt.** It does not read live from this repo or fetch data at runtime. Running a migration locally has zero effect until it's committed and pushed — a push to `main` now triggers an automatic redeploy (see below), so an uncommitted or unpushed migration is the only way local and live can drift. This repo still has no code, comments, or docs describing a specific domain, path, or cloud setup; that lives entirely in whichever separate infra repo does the deploying.

The infra repo that actually owns deployment is **`coreypyle-infra`**, a sibling directory (`../coreypyle-infra`, i.e. both repos live directly under the same parent — see that repo's own README). It holds the Terraform for the S3/CloudFront/Lambda setup and, as of the `norraph-github-actions-deploy` OIDC role, a GitHub Actions workflow that runs the full redeploy (rebuild the Lambda zip, `aws lambda update-function-code`, sync both S3 buckets, invalidate both CloudFront distributions) whenever this repo's `.github/workflows/deploy.yml` dispatches to it. This repo's own workflow carries no AWS account IDs, resource names, or region — it only sends a generic `repository_dispatch` event; every domain/path/cloud-specific detail, including the manual fallback steps, lives in `coreypyle-infra`, not here.

## Delivery workflow

After a feature in this repo is implemented and verified, the default is to commit and push to `main` as part of finishing the work, not as a separate follow-up step someone has to ask for — pushing to `main` **is** deploying now, since it automatically triggers `coreypyle-infra`'s deploy pipeline with no manual steps in between. Ask first if a change seems risky to ship immediately (e.g. touches live data, is hard to reverse) — otherwise treat a push as already including deployment, and don't propose a separate manual deploy step afterward.

**Big, multi-step features work on a feature branch instead** (e.g. `issue-32-tradeskills-brewing`): commit and push each incremental step to that branch as it's finished, not to `main`, so nothing half-built auto-deploys mid-feature. Merge to `main` (and get the deploy) once the feature is actually done, not after every step.

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
