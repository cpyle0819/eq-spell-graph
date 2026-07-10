// <mana-bar>, with `.value`/`.max` set as properties. Renders the 5-bead
// vitals-bar progress fill (see decisions/ for the reference-client
// bead styling) and sets role="progressbar" plus the aria-value*/
// aria-label/title attributes on itself from value/max.
//
// Default width is 150px; status-panel (its only current consumer) needs
// full-width instead -- exposed via --mana-bar-width, the same
// custom-property escape hatch route-path uses for its padding, since a
// plain outer "mana-bar { width: ... }" rule from a parent's shadow
// stylesheet would otherwise be fighting this component's own :host rule
// (see reset.js for why the outer rule usually just wins anyway, but the
// custom-property indirection is the established, guaranteed-safe pattern
// in this codebase).
import { RESET_CSS } from "./reset.js";

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
${RESET_CSS}
:host {
  position: relative;
  display: inline-block;
  width: var(--mana-bar-width, 150px) !important;
  height: 15px; flex-shrink: 0;
  background: #0b0a12;
  border: 2px solid; border-color: var(--edge-lo) var(--edge-lo) #615b72 #615b72;
  border-radius: 7px / 6px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.7);
}
.mana-fill {
  display: block; height: 100%;
  background: linear-gradient(180deg, #8fb3ff, #3054d8 40%, #14267c);
  transition: width 300ms ease-out;
}
/* glasswork overlay: end knobs, five beaded segments with bright seams,
   per-bead specular, overall glass shading -- reverse-engineered
   pixel-for-pixel from the reference client's vitals bar (see
   decisions/), so it stays exactly as observed. */
:host::after {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(90deg, #05050a 0, #05050a 2px, #8e8ba1 2px, #8e8ba1 3px, rgba(0, 0, 0, 0) 3px),
    linear-gradient(270deg, #05050a 0, #05050a 2px, #8e8ba1 2px, #8e8ba1 3px, rgba(0, 0, 0, 0) 3px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.3) 0 1px, rgba(255, 255, 255, 0.65) 1px 2px, rgba(0, 0, 0, 0.22) 2px 3px, transparent 3px),
    radial-gradient(45% 55% at 36% 22%, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0) 60%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0 10%, rgba(0, 0, 0, 0) 30% 55%, rgba(0, 0, 0, 0.5) 90% 100%);
  background-size:
    100% 100%, 100% 100%,
    20% 100%,
    20% 100%,
    100% 100%;
  background-repeat: no-repeat, no-repeat, repeat-x, repeat-x, no-repeat;
}
`);

class ManaBar extends HTMLElement {
  #value = 0;
  #max = 0;

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
      this.shadowRoot.innerHTML = `<span class="mana-fill"></span>`;
    }
    this.render();
  }

  get value() { return this.#value; }
  set value(v) { this.#value = v; if (this.shadowRoot) this.render(); }
  get max() { return this.#max; }
  set max(v) { this.#max = v; if (this.shadowRoot) this.render(); }

  render() {
    const pct = this.#max ? Math.round((this.#value / this.#max) * 100) : 0;
    this.shadowRoot.querySelector(".mana-fill").style.width = `${pct}%`;
    const label = `Spells owned: ${this.#value} of ${this.#max}`;
    this.setAttribute("role", "progressbar");
    this.setAttribute("aria-valuemin", "0");
    this.setAttribute("aria-valuemax", String(this.#max));
    this.setAttribute("aria-valuenow", String(this.#value));
    this.setAttribute("aria-label", label);
    this.setAttribute("title", label);
  }
}

customElements.define("mana-bar", ManaBar);
