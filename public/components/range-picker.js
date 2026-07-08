// <range-picker min="1" max="50" value-min="1" value-max="10">
// A dual-thumb level range slider with a live "N – M" (or "Level N" when
// both thumbs match) display between the two thumbs. `min`/`max` set the
// slider bounds (observed live); `value-min`/`value-max` only seed the
// initial position -- read/write current values via the `.valueMin`/
// `.valueMax` properties instead, since those change far more often than
// once. Re-dispatches plain "input" (per drag tick) and "change" (on
// release) events on itself, bubbling, so callers can listen the same way
// they would on a single native range input.
import { RESET_CSS } from "./reset.js";

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
${RESET_CSS}
:host {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}
input[type="range"] {
  -webkit-appearance: none; appearance: none; width: 90px; height: 3px;
  background: var(--line); border-radius: 2px; cursor: pointer;
  border: none; box-shadow: none; padding: 0;
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none; width: 16px; height: 16px;
  background: radial-gradient(circle at 65% 30%, #ffd97a, #c98f1f 60%, #8a5f10);
  border-radius: 50%; cursor: pointer;
}
input[type="range"]:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; }
.range-display { font-size: 14px; color: var(--gold); font-weight: 700; white-space: nowrap; min-width: 58px; text-align: center; font-variant-numeric: tabular-nums; }
`);

class RangePicker extends HTMLElement {
  static get observedAttributes() { return ["min", "max"]; }

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
      const min = this.getAttribute("min") || "1";
      const max = this.getAttribute("max") || "50";
      const valueMin = this.getAttribute("value-min") || min;
      const valueMax = this.getAttribute("value-max") || max;
      this.shadowRoot.innerHTML = `
        <input type="range" class="min-slider" min="${min}" max="${max}" value="${valueMin}">
        <span class="range-display"></span>
        <input type="range" class="max-slider" min="${min}" max="${max}" value="${valueMax}">
      `;
      this.#wireEvents();
    }
    this.#updateDisplay();
  }

  attributeChangedCallback(name, oldV, newV) {
    if (!this.shadowRoot) return;
    if (name === "min" || name === "max") {
      this.shadowRoot.querySelector(".min-slider").setAttribute(name, newV);
      this.shadowRoot.querySelector(".max-slider").setAttribute(name, newV);
    }
  }

  get valueMin() { return this.shadowRoot.querySelector(".min-slider").value; }
  set valueMin(v) { this.shadowRoot.querySelector(".min-slider").value = v; this.#updateDisplay(); }
  get valueMax() { return this.shadowRoot.querySelector(".max-slider").value; }
  set valueMax(v) { this.shadowRoot.querySelector(".max-slider").value = v; this.#updateDisplay(); }

  #updateDisplay() {
    const minSlider = this.shadowRoot.querySelector(".min-slider");
    const maxSlider = this.shadowRoot.querySelector(".max-slider");
    const min = parseInt(minSlider.value);
    const max = parseInt(maxSlider.value);
    this.shadowRoot.querySelector(".range-display").textContent = min === max ? `Level ${min}` : `${min} – ${max}`;
  }

  #wireEvents() {
    const minSlider = this.shadowRoot.querySelector(".min-slider");
    const maxSlider = this.shadowRoot.querySelector(".max-slider");

    minSlider.addEventListener("input", () => {
      if (parseInt(minSlider.value) > parseInt(maxSlider.value)) minSlider.value = maxSlider.value;
      this.#updateDisplay();
      this.dispatchEvent(new Event("input", { bubbles: true }));
    });
    maxSlider.addEventListener("input", () => {
      if (parseInt(maxSlider.value) < parseInt(minSlider.value)) maxSlider.value = minSlider.value;
      this.#updateDisplay();
      this.dispatchEvent(new Event("input", { bubbles: true }));
    });
    minSlider.addEventListener("change", () => this.dispatchEvent(new Event("change", { bubbles: true })));
    maxSlider.addEventListener("change", () => this.dispatchEvent(new Event("change", { bubbles: true })));
  }
}

customElements.define("range-picker", RangePicker);
