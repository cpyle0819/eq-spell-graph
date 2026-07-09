// <welcome-scroll> wraps home.html's intro copy in a parchment-scroll
// insert with wood-dowel end caps -- the same look as route-path's default
// (non-stone) variant, but its own standalone component since its content
// is static editorial copy (slotted <p> children written directly in
// home.html), not data pushed in via a property.
//
// Slotted light-DOM children (the <p> tags here) aren't reachable by plain
// selectors from inside a shadow root -- only `::slotted(...)` can style
// them, and only as a single compound selector, no combinators. `p + p`'s
// "every paragraph but the first gets a top margin" becomes `::slotted(p)`
// plus a `::slotted(p:first-child)` override instead. Margin isn't zeroed
// here the way component-internal elements need RESET_CSS for: slotted
// content is genuinely still light DOM, so it already gets `margin: 0`
// from theme.css's own page-level `* { margin: 0 }` reset, the same as any
// other paragraph on the page -- no shadow-side reset needed.
import { RESET_CSS } from "./reset.js";

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
${RESET_CSS}
:host {
  display: block;
  position: relative;
  max-width: 640px;
  width: 100%;
  padding: 20px 28px !important;
  border-radius: 2px;
  background: var(--parch-tex), linear-gradient(180deg, #ece3c8, var(--parch-bg));
  border: 1px solid var(--parch-line);
  box-shadow: inset 0 0 22px rgba(122, 96, 42, 0.3), 0 2px 6px rgba(0, 0, 0, 0.45);
  color: var(--parch-ink);
}
:host::before, :host::after {
  content: "";
  position: absolute; top: -3px; bottom: -3px; width: 11px;
  border-radius: 5px;
  background:
    radial-gradient(3px 3px at 50% 7px, rgba(0, 0, 0, 0.6), transparent 70%),
    radial-gradient(3px 3px at 50% calc(100% - 7px), rgba(0, 0, 0, 0.6), transparent 70%),
    linear-gradient(90deg, var(--wood-2), var(--wood-1) 40%, var(--wood-1) 60%, var(--wood-2));
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.55);
}
:host::before { left: -11px; }
:host::after { right: -11px; }

/* !important: theme.css's page-level "* { margin: 0 }" reset targets these
   slotted <p> elements directly too (they're real light-DOM nodes) and, per
   the same rule documented in DECISIONS.md for :host, wins over a shadow-
   tree rule at normal priority regardless of specificity -- without
   !important here every paragraph just sat at margin-top: 0. */
::slotted(p) { font-size: 14px; line-height: 1.7; margin-top: 10px !important; }
::slotted(p:first-child) { margin-top: 0 !important; }
`);

class WelcomeScroll extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
      this.shadowRoot.innerHTML = `<slot></slot>`;
    }
  }
}

customElements.define("welcome-scroll", WelcomeScroll);
