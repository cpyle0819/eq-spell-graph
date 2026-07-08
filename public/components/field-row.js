// <field-row label="Race"><select>...</select></field-row> — a label +
// control row. Shared by the Spell Finder's and Class Browser's sidebars
// (adding a tag chip grows its own field downward, never reflows a
// neighboring field, which only a stacked layout gives — Route Finder's
// horizontal .finder-bar has a deliberately different field of its own and
// doesn't use this).
import { RESET_CSS } from "./reset.js";

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
${RESET_CSS}
:host {
  display: flex;
  align-items: center;
  gap: 10px;
}
:host([hidden]) { display: none; }
label {
  font-size: 11px; color: var(--ink-muted); white-space: nowrap;
  letter-spacing: 0.1em; text-transform: uppercase;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.6);
  min-width: 100px;
}
/* the sunken-well look for a slotted native <select>/<input> -- matches
   tag-input's own :host styling (public/components/tag-input.js) for the
   same well, since a plain outer ".field select"-style selector can no
   longer reach either. */
::slotted(select), ::slotted(input) {
  flex: 1;
  min-width: 0;
  background: var(--panel-deep);
  border: 4px solid;
  border-color: var(--edge-lo) var(--edge-lo) #615b72 #615b72;
  color: var(--parchment);
  border-radius: 3px;
  font-size: 13px;
  font-family: var(--font-body);
  box-shadow: inset 0 3px 7px rgba(0, 0, 0, 0.8), inset 0 0 0 1px rgba(0, 0, 0, 0.35);
  transition: border-color 150ms, box-shadow 150ms;
  padding: 6px 12px;
}
::slotted(select:hover), ::slotted(input:hover) { border-color: var(--edge-lo) var(--edge-lo) #837c9d #837c9d; }
::slotted(select:focus), ::slotted(input:focus) {
  border-color: var(--gold);
  box-shadow: inset 0 3px 7px rgba(0, 0, 0, 0.8), inset 0 0 0 1px rgba(0, 0, 0, 0.35), 0 0 0 3px rgba(232, 168, 42, 0.18);
  outline: none;
}
@media (min-width: 1100px) {
  :host { flex-direction: column; align-items: stretch; gap: 4px; }
  label { min-width: 0; width: 100%; }
}
`);

class FieldRow extends HTMLElement {
  static get observedAttributes() { return ["label"]; }

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
      this.shadowRoot.innerHTML = `<label></label><slot></slot>`;
    }
    this.render();
  }

  attributeChangedCallback() {
    if (this.shadowRoot) this.render();
  }

  render() {
    this.shadowRoot.querySelector("label").textContent = this.getAttribute("label") || "";
  }
}

customElements.define("field-row", FieldRow);
