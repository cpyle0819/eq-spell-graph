// <toggle-checkbox label="Show Out of Era"></toggle-checkbox> — a themed
// checkbox + label for sidebar filter rows, matching the app's existing
// gold-accent checkbox look (spell-card.js's owned-checkbox) but given its
// own Shadow DOM per decisions/real-web-components-shadow-dom.md rather
// than a light-DOM class, since no page still hand-rolls that look
// directly. Read/write current state via `.checked`; re-dispatches a plain
// "change" event on itself, bubbling, the same way range-picker.js does,
// so callers listen exactly as they would on a native checkbox.
import { RESET_CSS } from "./reset.js";

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
${RESET_CSS}
:host { display: inline-flex; }
label {
  display: flex; align-items: center; gap: 8px; cursor: pointer;
  font-size: 13px; color: var(--parchment);
  transition: color 150ms;
}
label:hover { color: var(--gold); }
label:has(input:checked) { color: var(--gold); }
input {
  cursor: pointer; accent-color: var(--gold); width: 15px; height: 15px;
}
`);

class ToggleCheckbox extends HTMLElement {
  static get observedAttributes() { return ["label"]; }

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
      this.shadowRoot.innerHTML = `<label><input type="checkbox"><span></span></label>`;
      this.shadowRoot.querySelector("input").addEventListener("change", () => {
        this.dispatchEvent(new Event("change", { bubbles: true }));
      });
    }
    this.render();
  }

  attributeChangedCallback() {
    if (this.shadowRoot) this.render();
  }

  get checked() { return this.shadowRoot.querySelector("input").checked; }
  set checked(v) { this.shadowRoot.querySelector("input").checked = !!v; }

  render() {
    this.shadowRoot.querySelector("span").textContent = this.getAttribute("label") || "";
  }
}

customElements.define("toggle-checkbox", ToggleCheckbox);
