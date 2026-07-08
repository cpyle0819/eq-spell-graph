// <nav-links current="index"></nav-links> — renders a macro-button per page
// other than `current`. One canonical page list instead of each page
// hand-duplicating "the other two."
import "./macro-button.js";

const PAGES = [
  { key: "index", label: "Spell Finder", href: "index.html" },
  { key: "route", label: "Route Finder", href: "route.html" },
  { key: "class-browser", label: "Class Browser", href: "class-browser.html" },
];

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
:host { display: flex; align-items: center; gap: 8px; margin-left: auto !important; }
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
  }

  attributeChangedCallback() {
    if (this.shadowRoot) this.render();
  }

  render() {
    const current = this.getAttribute("current");
    this.shadowRoot.innerHTML = PAGES.filter((p) => p.key !== current)
      .map((p) => `<macro-button href="${p.href}">${p.label}</macro-button>`)
      .join("");
  }
}

customElements.define("nav-links", NavLinks);
