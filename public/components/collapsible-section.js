// <collapsible-section label="Faction" section="faction" section-title="...">
//   <field-row label="Race">...</field-row>
//   ...
// </collapsible-section>
// A clickable header that shows/hides the field-rows nested inside it.
// `section` is a plain identifier a page can use to find a specific
// instance (e.g. for persisting which sections are collapsed) without
// needing an id on every one. `collapsed` reflects as an attribute so CSS
// and external code can both read/set it; setting it programmatically
// (restoring saved state, resetting to defaults) does NOT fire "toggle" --
// only an actual click/keydown does, so a page's "toggle" listener (saving
// state) only runs for real user interaction, matching how a native
// checkbox's "change" event doesn't fire when you set .checked in JS.
//
// role="button"/tabindex over a real <button> to avoid fighting this app's
// global bone-plate button styling (theme.css's `button {...}`) rather
// than fight it with overrides.
import { RESET_CSS } from "./reset.js";

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
${RESET_CSS}
:host {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
:host([collapsed]) ::slotted(*) { display: none; }
.header {
  font-size: 13px; color: var(--parchment); letter-spacing: 0.1em;
  font-weight: 600; text-transform: uppercase; margin-top: 6px;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.6);
  display: flex; align-items: center; gap: 6px; cursor: pointer;
}
.header[title] { cursor: help; }
.header::before {
  content: "▾"; display: inline-block; font-size: 9px; flex-shrink: 0;
  transition: transform 0.15s ease;
}
.header[aria-expanded="false"]::before { transform: rotate(-90deg); }
.header:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; }
`);

class CollapsibleSection extends HTMLElement {
  static get observedAttributes() { return ["label", "section-title", "collapsed"]; }

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
      this.shadowRoot.innerHTML = `
        <div class="header" role="button" tabindex="0" aria-expanded="true"></div>
        <slot></slot>
      `;
      const header = this.shadowRoot.querySelector(".header");
      header.addEventListener("click", () => this.toggle());
      header.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); this.toggle(); }
      });
    }
    this.render();
  }

  attributeChangedCallback() {
    if (this.shadowRoot) this.render();
  }

  render() {
    const header = this.shadowRoot.querySelector(".header");
    header.textContent = this.getAttribute("label") || "";
    const title = this.getAttribute("section-title");
    if (title) header.setAttribute("title", title);
    else header.removeAttribute("title");
    header.setAttribute("aria-expanded", String(!this.collapsed));
  }

  get collapsed() { return this.hasAttribute("collapsed"); }
  set collapsed(v) {
    if (v) this.setAttribute("collapsed", "");
    else this.removeAttribute("collapsed");
  }

  toggle() {
    const next = !this.collapsed;
    this.collapsed = next;
    this.dispatchEvent(new CustomEvent("toggle", { bubbles: true, detail: { section: this.getAttribute("section"), collapsed: next } }));
  }
}

customElements.define("collapsible-section", CollapsibleSection);
