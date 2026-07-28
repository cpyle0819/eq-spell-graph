// <app-header subtitle="Spell Finder"><nav-links slot="nav" current="index">
// </nav-links></app-header> — the stone title bar shared by every page.
// `home` (boolean attribute) renders the title as plain text instead of a
// link back to home.html, and omits the nav slot entirely — home.html has
// no nav-links of its own. `beta` (boolean attribute) renders a small badge
// next to the subtitle for pages still under active development.
import { RESET_CSS } from "./reset.js";

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
${RESET_CSS}
:host {
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  padding: 14px 28px !important;
  background: var(--marble-tex), linear-gradient(180deg, #524e61, #363242);
  border-bottom: 2px solid var(--edge-lo);
  box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.09), inset 0 -1px 0 rgba(0, 0, 0, 0.5), 0 3px 12px rgba(0, 0, 0, 0.55);
}
/* gold inlay fading at the edges, under the banner */
:host::after {
  content: "";
  position: absolute;
  left: 0; right: 0; bottom: -2px; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 168, 42, 0.55) 30%, rgba(232, 168, 42, 0.55) 70%, transparent);
  pointer-events: none;
}
@media (max-width: 700px) {
  :host { padding: 12px 16px !important; }
}
.header-title { display: flex; flex-direction: column; gap: 3px; }
h1 {
  font-family: var(--font-display);
  font-size: 25px;
  font-weight: 700;
  color: var(--gold);
  letter-spacing: 0.06em;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.9), 0 1px 0 rgba(255, 236, 180, 0.18), 0 0 22px rgba(232, 168, 42, 0.25);
}
h1 a { color: inherit; text-decoration: none; }
h1 a:hover { text-decoration: underline; }
h1 a:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; }
.header-sub { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--ink-muted); letter-spacing: 0.22em; text-transform: uppercase; }
.beta-badge {
  padding: 1px 6px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #2a1f0a;
  background: linear-gradient(180deg, #f0d492, var(--gold));
  border-radius: 3px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}
`);

class AppHeader extends HTMLElement {
  static get observedAttributes() { return ["subtitle", "home", "beta"]; }

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
    }
    this.render();
  }

  attributeChangedCallback() {
    if (this.shadowRoot) this.render();
  }

  render() {
    const subtitle = this.getAttribute("subtitle") || "";
    const home = this.hasAttribute("home");
    const beta = this.hasAttribute("beta");
    const titleHtml = home ? "Norraph" : `<a href="home.html">Norraph</a>`;
    this.shadowRoot.innerHTML = `
      <div class="header-title">
        <h1>${titleHtml}</h1>
        <p class="header-sub">${subtitle}${beta ? '<span class="beta-badge">Beta</span>' : ""}</p>
      </div>
      ${home ? "" : `<slot name="nav"></slot>`}
    `;
  }
}

customElements.define("app-header", AppHeader);
