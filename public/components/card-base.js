// Shared base class + CSS for the Class Browser's four card types
// (spell-card/aa-card/ability-card/stance-card): the console-row-plus-
// parchment-scroll shell (name on stone, like a zone-card, wrapping a
// parchment insert for badges/description/stats).
//
// Each leaf class extends CardBase, implements `setData(...)` + `render()`,
// and optionally a `wireEvents()` (called once, before the first render, if
// present) for delegated listeners on `this.shadowRoot`. A leaf with its
// own additional CSS sets `static extraSheet = <CSSStyleSheet>`; it's
// adopted alongside BASE_SHEET rather than folded into it, since most of
// the base rules (badges, .spell-scroll, stats) are shared by 2+ leaves but
// a few (spell-card's checkbox/vendor-list styling) are spell-card-only.
import { RESET_CSS } from "./reset.js";

// Shared with zone-card.js/route-card.js, which don't extend CardBase (and
// so don't adopt BASE_SHEET below) but still want the exact same look —
// spliced into their own stylesheets the same way RESET_CSS is. Styled for
// the dark stone/marble header context (--ink-muted, --gold) every current
// call site places it in (a card's name row), not the lighter parchment
// scroll below it — see leveling-guide.html's `.ledger-item a` for the
// parchment-appropriate sibling treatment (dotted underline on hover, same
// idea, different palette for its lighter background).
export const WIKI_LINK_CSS = `
.wiki-link {
  font-size: 11px; font-weight: 400; text-transform: none; letter-spacing: normal;
  color: var(--ink-muted); text-decoration: none;
  border-bottom: 1px dotted var(--ink-muted);
  white-space: nowrap;
}
.wiki-link:hover, .wiki-link:focus-visible { color: var(--gold); border-bottom-color: var(--gold); border-bottom-style: solid; }
`;

const WIKI_BASE = "https://eqlwiki.com/";

// eqlwiki.com URL for a page titled exactly `pageTitle` — the same
// title-to-URL convention already validated at scale by
// scripts/scrape-spell-details.ts (1,059/1,064 spells fetched this way)
// and scripts/scrape-zone-lore.ts (all 89 zones): spaces become
// underscores, then the whole thing is percent-encoded.
export function wikiUrl(pageTitle) {
  return WIKI_BASE + encodeURIComponent(pageTitle.replace(/ /g, "_"));
}

// A small, subtle external link to an eqlwiki.com page — metadata, not a
// card's primary action, so it's a quiet dotted-underline text link, not a
// button (see CLAUDE.md-referenced decisions/ on external-link styling).
// `pageTitle` must be the *exact* wiki page title: for spells and
// abilities that's the entry's own name (each has its own dedicated page —
// see decisions/abilities-tab-class-defining-actions.md), but for
// stances/invocations/AAs it's the one shared page title ("Stances &
// Invocations" / "Alternate Advancement") every entry of that type lives
// on, since those aren't individually paged (decisions/
// stance-invocation-nodes-single-page-scrape.md, decisions/
// aa-nodes-single-page-scrape-with-category.md) — a fabricated per-entity
// URL there would likely 404.
export function wikiLink(pageTitle) {
  return `<a class="wiki-link" href="${wikiUrl(pageTitle)}" target="_blank" rel="noopener" title="View on eqlwiki.com">wiki ↗</a>`;
}

export const BASE_SHEET = new CSSStyleSheet();
BASE_SHEET.replaceSync(`
${RESET_CSS}
${WIKI_LINK_CSS}
:host {
  display: block;
  cursor: pointer;
  transition: box-shadow 150ms;
  padding: 14px 20px !important;
  background: var(--marble-tex), linear-gradient(180deg, var(--stone-1), var(--stone-2));
  border: 4px solid;
  border-color: var(--edge-hi) var(--edge-hi) var(--edge-lo) var(--edge-lo);
  border-radius: 3px;
  box-shadow: inset -1px 1px 0 rgba(255, 255, 255, 0.08), inset 1px -1px 0 rgba(0, 0, 0, 0.45);
}
/* box-shadow, not filter — see zone-card's own :host(:hover) comment
   (public/components/zone-card.js) for why. */
:host(:hover) {
  box-shadow: inset -1px 1px 0 rgba(255, 255, 255, 0.08), inset 1px -1px 0 rgba(0, 0, 0, 0.45), inset 0 0 0 999px rgba(255, 255, 255, 0.05);
}

.spell-header { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; margin-bottom: 10px; }
.spell-header h3 {
  margin: 0;
  font-family: var(--font-display); color: var(--parchment); font-size: 16px; font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.spell-scroll {
  position: relative;
  padding: 12px 20px; border-radius: 2px;
  background: var(--parch-tex), linear-gradient(180deg, #ece3c8, var(--parch-bg));
  border: 1px solid var(--parch-line);
  box-shadow: inset 0 0 22px rgba(122, 96, 42, 0.3), 0 2px 6px rgba(0, 0, 0, 0.45);
  color: var(--parch-ink);
}
.spell-scroll::before, .spell-scroll::after {
  content: "";
  position: absolute; top: -3px; bottom: -3px; width: 11px;
  border-radius: 5px;
  background:
    radial-gradient(3px 3px at 50% 7px, rgba(0, 0, 0, 0.6), transparent 70%),
    radial-gradient(3px 3px at 50% calc(100% - 7px), rgba(0, 0, 0, 0.6), transparent 70%),
    linear-gradient(90deg, var(--wood-2), var(--wood-1) 40%, var(--wood-1) 60%, var(--wood-2));
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.55);
}
.spell-scroll::before { left: -11px; }
.spell-scroll::after { right: -11px; }

.spell-badges { display: flex; gap: 5px; flex-wrap: wrap; }
.spell-badge { font-size: 11px; padding: 2px 7px; border-radius: 3px; }
.type-badge  { background: rgba(122, 77, 5, 0.1);   color: #6a4204; border: 1px solid rgba(122, 77, 5, 0.4); }
.mana-badge  { background: rgba(30, 64, 175, 0.08); color: #1e40af; border: 1px solid rgba(30, 64, 175, 0.35); }
.skill-badge { background: rgba(0, 0, 0, 0.05);     color: #4a4232; border: 1px solid var(--parch-line); }
.class-badge { background: rgba(90, 60, 20, 0.08); color: #5a3c14; border: 1px solid rgba(90, 60, 20, 0.3); }

.spell-desc { font-size: 13px; color: #4a4232; margin: 5px 0 6px; line-height: 1.5; font-style: italic; }
.spell-stats { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 6px; }
.stat-tag {
  font-size: 11px; color: #4a4232; background: rgba(0, 0, 0, 0.05);
  border: 1px solid #b5a77e;
  padding: 2px 8px; border-radius: 3px;
}
`);

export class CardBase extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = this.constructor.extraSheet
        ? [BASE_SHEET, this.constructor.extraSheet]
        : [BASE_SHEET];
      this.wireEvents?.();
    }
    this.render();
  }
}

// Class + (for spells/abilities) per-class level badges — badged with only
// the *selected* classes, not an entry's full class list, so overlap
// between selections is visible at a glance. An empty selection means
// "browsing every class" (see decisions/), so it shows every class the
// entry actually has rather than filtering down to nothing.
export function classBadges(entryClasses, selected, levelLookup) {
  const granting = selected.length ? entryClasses.filter((c) => selected.includes(c)) : entryClasses;
  return granting
    .map((c) => {
      const label = c.charAt(0).toUpperCase() + c.slice(1);
      const level = levelLookup ? levelLookup(c) : null;
      return `<span class="spell-badge class-badge">${label}${level != null ? ` L${level}` : ""}</span>`;
    })
    .join("");
}

export function fmtDuration(d) {
  if (!d) return null;
  if (/instant/i.test(d)) return "Instant";
  return d.replace(/\s+minutes?/i, "m").replace(/\s+seconds?/i, "s");
}

export function fmtCast(t) {
  if (t == null) return null;
  return t % 1 === 0 ? `${t}s cast` : `${t.toFixed(1)}s cast`;
}
