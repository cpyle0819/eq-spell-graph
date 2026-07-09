// <tool-card> — one of the three link cards on home.html's tool grid
// (Spell Finder/Route Finder/Class Browser). Wraps a slotted description
// <p> and <macro-button>, styled as a stone console panel — the same base
// look as the Class Browser card family's shell (card-base.js), but
// duplicated here rather than shared: home.html isn't part of that
// family, and unlike them this card is never clickable itself (the
// macro-button inside is the only actionable control, so cursor stays the
// browser default rather than a pointer).
import { RESET_CSS } from "./reset.js";

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
${RESET_CSS}
:host {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 20px !important;
  background: var(--marble-tex), linear-gradient(180deg, var(--stone-1), var(--stone-2));
  border: 4px solid;
  border-color: var(--edge-hi) var(--edge-hi) var(--edge-lo) var(--edge-lo);
  border-radius: 3px;
  box-shadow: inset -1px 1px 0 rgba(255, 255, 255, 0.08), inset 1px -1px 0 rgba(0, 0, 0, 0.45);
}
::slotted(p) { font-size: 14px; color: var(--ink-muted); line-height: 1.55; flex: 1; }
::slotted(macro-button) { align-self: center; }
`);

class ToolCard extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
      this.shadowRoot.innerHTML = `<slot></slot>`;
    }
  }
}

customElements.define("tool-card", ToolCard);
