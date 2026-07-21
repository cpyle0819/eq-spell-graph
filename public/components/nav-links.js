// <nav-links current="index"></nav-links> — renders a macro-button per page
// other than `current`. One canonical page list instead of each page
// hand-duplicating "the other two."
//
// Below ~860px there isn't room for the title plus four macro-buttons in
// one row (measured: ~500-560px of buttons alone, depending on which page
// is current) — the row wrapped and pushed "Leveling Guide" onto a doubled-
// height second line. Below that width the row is replaced by a single
// hamburger trigger that drops a menu, styled after the app's existing
// dark-stone dropdown (see .tag-dropdown/.suggestion-item in theme.css)
// rather than inventing a new surface.
import "./macro-button.js";
import { RESET_CSS } from "./reset.js";

const PAGES = [
  { key: "index", label: "Spell Vendors", href: "index.html" },
  { key: "maps", label: "Maps", href: "maps.html" },
  { key: "class-browser", label: "Classes", href: "class-browser.html" },
  { key: "quests", label: "Quests", href: "quests.html" },
  { key: "leveling-guide", label: "Leveling Guide", href: "leveling-guide.html" },
];

const BREAKPOINT = 860;

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
${RESET_CSS}
:host {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto !important;
}
.nav-row { display: flex; align-items: center; gap: 8px; }

.nav-toggle {
  display: none;
  width: 44px; height: 44px;
  align-items: center; justify-content: center;
  flex-direction: column; gap: 5px;
  background-image: var(--marble-tex), linear-gradient(180deg, var(--stone-1), var(--stone-2));
  border-width: 4px; border-style: solid;
  border-color: var(--edge-hi) var(--edge-hi) var(--edge-lo) var(--edge-lo);
  border-radius: 3px;
  box-shadow: inset -1px 1px 0 rgba(255, 255, 255, 0.08), inset 1px -1px 0 rgba(0, 0, 0, 0.45), 0 2px 8px rgba(0, 0, 0, 0.4);
  cursor: pointer;
}
.nav-toggle:hover { filter: brightness(1.08); }
.nav-toggle:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
.nav-toggle .bar {
  width: 20px; height: 2px; background: var(--ink-muted);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.5);
  transition: transform 150ms ease, opacity 150ms ease;
}
:host([open]) .nav-toggle .bar:nth-child(1) { transform: translateY(7px) rotate(45deg); }
:host([open]) .nav-toggle .bar:nth-child(2) { opacity: 0; }
:host([open]) .nav-toggle .bar:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

.nav-dropdown {
  display: none;
  position: absolute; top: calc(100% + 10px); right: 0;
  z-index: 200;
  min-width: 190px;
  flex-direction: column;
  background: var(--marble-tex), linear-gradient(180deg, var(--stone-1), var(--stone-2));
  border: 4px solid;
  border-color: var(--edge-hi) var(--edge-hi) var(--edge-lo) var(--edge-lo);
  border-radius: 3px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
  overflow: hidden;
}
:host([open]) .nav-dropdown { display: flex; }
.nav-dropdown a {
  padding: 12px 16px; min-height: 44px;
  display: flex; align-items: center;
  font-family: var(--font-body); font-size: 13px;
  letter-spacing: 0.04em;
  color: #d8bd7c; text-decoration: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.35);
}
.nav-dropdown a:last-child, .nav-dropdown span.current:last-child { border-bottom: none; }
.nav-dropdown a:hover, .nav-dropdown a:focus-visible { background: rgba(232, 168, 42, 0.12); color: #f0d492; }
.nav-dropdown a:focus-visible { outline: 2px solid var(--gold); outline-offset: -2px; }
.nav-dropdown span.current {
  padding: 12px 16px; min-height: 44px;
  display: flex; align-items: center;
  font-family: var(--font-body); font-size: 13px;
  letter-spacing: 0.04em;
  color: #f0d492;
  background: rgba(0, 0, 0, 0.3);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
  border-bottom: 1px solid rgba(0, 0, 0, 0.35);
}

@media (max-width: ${BREAKPOINT}px) {
  .nav-row { display: none; }
  .nav-toggle { display: inline-flex; }
}
@media (prefers-reduced-motion: reduce) {
  .nav-toggle .bar { transition: none; }
}
`);

class NavLinks extends HTMLElement {
  static get observedAttributes() { return ["current"]; }

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
      this.setAttribute("role", "navigation");
    }
    this.render();
    this._onDocClick = (e) => {
      if (this.hasAttribute("open") && !e.composedPath().includes(this)) this.close();
    };
    this._onKeydown = (e) => {
      if (e.key === "Escape" && this.hasAttribute("open")) this.close();
    };
    document.addEventListener("click", this._onDocClick);
    document.addEventListener("keydown", this._onKeydown);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this._onDocClick);
    document.removeEventListener("keydown", this._onKeydown);
  }

  attributeChangedCallback() {
    if (this.shadowRoot) this.render();
  }

  close() {
    this.removeAttribute("open");
    const toggle = this.shadowRoot.querySelector(".nav-toggle");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }

  render() {
    const current = this.getAttribute("current");

    this.shadowRoot.innerHTML = `
      <div class="nav-row">
        ${PAGES.map((p) => (p.key === current
          ? `<macro-button pressed>${p.label}</macro-button>`
          : `<macro-button href="${p.href}">${p.label}</macro-button>`
        )).join("")}
      </div>
      <button type="button" class="nav-toggle" aria-label="Menu" aria-haspopup="true" aria-expanded="false" aria-controls="nav-dropdown">
        <span class="bar"></span><span class="bar"></span><span class="bar"></span>
      </button>
      <div class="nav-dropdown" id="nav-dropdown">
        ${PAGES.map((p) => (p.key === current
          ? `<span class="current" aria-current="page">${p.label}</span>`
          : `<a href="${p.href}">${p.label}</a>`
        )).join("")}
      </div>
    `;

    const toggle = this.shadowRoot.querySelector(".nav-toggle");
    toggle.addEventListener("click", () => {
      const open = this.hasAttribute("open");
      this.toggleAttribute("open", !open);
      toggle.setAttribute("aria-expanded", String(!open));
    });
    this.shadowRoot.querySelectorAll(".nav-dropdown a").forEach((a) => {
      a.addEventListener("click", () => this.close());
    });
  }
}

customElements.define("nav-links", NavLinks);
