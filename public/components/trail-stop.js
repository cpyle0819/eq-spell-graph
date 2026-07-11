// <trail-stop range="Lv 1–10">...copy, as light-DOM HTML (links/<strong>
// allowed)...</trail-stop> — one waypoint in a chronological, ordered
// sequence (a level bracket in the Leveling Guide's "Road to Fifty"). The
// range label, diamond marker glyph, and copy column are this component's
// own internal shadow grid; the connecting dashed line behind a run of
// stops is drawn by the *parent* (e.g. .trail-path::before, page-level),
// the same cross-instance-coordination split zone-card's shared-seam
// negative margin uses -- each instance owns its own rendering, the page
// owns how instances relate to each other.
//
// `range` is a plain attribute (short, static display text); the copy body
// stays light-DOM (slotted), not a property, since it's hand-authored rich
// text with inline links -- those links are real light-DOM <a> elements a
// shadow-scoped ::slotted() rule can't reach past its own slotted node, so
// their styling lives in the page's own CSS (leveling-guide.html), same as
// any other slotted-content descendant elsewhere in this app.
import { RESET_CSS } from "./reset.js";

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
${RESET_CSS}
:host {
  display: grid;
  grid-template-columns: 96px 30px 1fr; column-gap: 12px;
  padding: 14px 0 !important;
}
.trail-range {
  font-family: var(--font-display); font-size: 12.5px; font-weight: 700;
  color: var(--parch-accent); text-align: right; padding-top: 2px !important; white-space: nowrap;
}
.trail-marker { display: flex; justify-content: center; font-size: 15px; color: var(--parch-accent); line-height: 1.3; }
/* Baseline typography for the directly-slotted <p> only -- the <strong>/
   <a> tags a caller nests inside it are descendants, not themselves
   slotted, so ::slotted() can't reach them (single compound selector, no
   combinators -- see decisions/real-web-components-shadow-dom.md). Their
   styling lives in the page's own CSS instead, same as any other light-DOM
   content nested inside slotted markup. */
::slotted(p) { font-size: 14px; line-height: 1.7; }

@media (max-width: 600px) {
  :host { grid-template-columns: 30px 1fr; row-gap: 4px !important; }
  .trail-range { grid-column: 2; text-align: left; order: -1; }
  .trail-marker { grid-row: 1; }
  ::slotted(p) { grid-column: 2; }
}
`);

class TrailStop extends HTMLElement {
  static get observedAttributes() { return ["range"]; }

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
      this.shadowRoot.innerHTML = `
        <div class="trail-range"></div>
        <div class="trail-marker">◆</div>
        <slot></slot>
      `;
    }
    this.render();
  }

  attributeChangedCallback() {
    if (this.shadowRoot) this.render();
  }

  render() {
    this.shadowRoot.querySelector(".trail-range").textContent = this.getAttribute("range") || "";
  }
}

customElements.define("trail-stop", TrailStop);
