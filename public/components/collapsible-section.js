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
//
// `static` opts a use out of the toggle behavior entirely -- for a labeled
// group header that should never collapse (e.g. trades.js's own Recipes/
// Ingredients result groups, where "hide the whole list" isn't a real
// feature and a stray click on the header shouldn't do it by accident). No
// chevron, no role="button"/tabindex, no click/keydown wiring -- it's a
// plain heading that happens to share this component's label styling.
import { RESET_CSS } from "./reset.js";

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
${RESET_CSS}
:host {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
/* Same convention as field-row.js's own [hidden] rule -- a whole section
   can be irrelevant to the current context (Items' Level section when
   Type isn't Spell, since items have no per-class level data), not just
   collapsed. Without this the host's own display:flex above would win over
   the UA stylesheet's [hidden]{display:none}, since author CSS always
   outranks UA CSS regardless of specificity. */
:host([hidden]) { display: none; }
:host([collapsed]) ::slotted(*) { display: none; }
.header {
  font-size: 13px; color: var(--parchment); letter-spacing: 0.1em;
  font-weight: 600; text-transform: uppercase; margin-top: 6px;
  text-shadow: var(--header-text-shadow, 0 1px 1px rgba(0, 0, 0, 0.6));
  display: flex; align-items: center; gap: 6px; cursor: pointer;
}
.header[title] { cursor: help; }
.header::before {
  content: "▾"; display: inline-block; font-size: 9px; flex-shrink: 0;
  transition: transform 0.15s ease;
}
.header[aria-expanded="false"]::before { transform: rotate(-90deg); }
.header:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; }
:host([static]) .header { cursor: default; }
:host([static]) .header::before { display: none; }
`);

class CollapsibleSection extends HTMLElement {
  static get observedAttributes() { return ["label", "section-title", "collapsed"]; }

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
      const isStatic = this.hasAttribute("static");
      this.shadowRoot.innerHTML = `
        <div class="header"${isStatic ? "" : ' role="button" tabindex="0" aria-expanded="true"'}></div>
        <slot></slot>
      `;
      if (!isStatic) {
        const header = this.shadowRoot.querySelector(".header");
        header.addEventListener("click", () => this.toggle());
        header.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); this.toggle(); }
        });
      }
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
    if (!this.hasAttribute("static")) header.setAttribute("aria-expanded", String(!this.collapsed));
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
