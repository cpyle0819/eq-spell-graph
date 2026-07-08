// <route-card></route-card>, with `.route = {from, to, hops, steps}` set as
// a property. Renders the "From → To" title, an "N hop(s)" badge, and a
// nested <route-path> for the actual step-by-step directions.
import { RESET_CSS } from "./reset.js";

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
${RESET_CSS}
:host {
  display: block;
  background: var(--marble-tex), linear-gradient(180deg, var(--stone-1), var(--stone-2));
  border: 4px solid;
  border-color: var(--edge-hi) var(--edge-hi) var(--edge-lo) var(--edge-lo);
  border-radius: 3px;
  box-shadow: inset -1px 1px 0 rgba(255, 255, 255, 0.08), inset 1px -1px 0 rgba(0, 0, 0, 0.45), 0 2px 8px rgba(0, 0, 0, 0.4);
  outline: 1px solid rgba(232, 168, 42, 0.22);
  outline-offset: -5px;
  border-top: 2px solid var(--gold);
  padding: 22px 26px !important;
}
.route-card-header { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-bottom: 18px; }
.route-card-title {
  font-family: var(--font-display);
  font-size: 19px; font-weight: 700; color: var(--parchment);
  letter-spacing: 0.02em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}
.hops-badge {
  font-size: 12px; padding: 3px 10px; border-radius: 3px;
  background: var(--panel-deep);
  border: 1px solid; border-color: var(--edge-lo) var(--edge-lo) #5a5570 #5a5570;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
  color: #c9a25e;
  font-variant-numeric: tabular-nums;
}
/* route.html's own page-level route-path override can no longer reach this
   element now that it's nested inside this component's shadow root, so
   this component owns the override directly instead. */
route-path { --route-path-padding: 14px 18px; }
`);

class RouteCard extends HTMLElement {
  #from = ""; #to = ""; #hops = 0; #steps = [];

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
      this.shadowRoot.innerHTML = `
        <div class="route-card-header">
          <span class="route-card-title"></span>
          <span class="hops-badge"></span>
        </div>
        <route-path></route-path>
      `;
    }
    this.render();
  }

  set route({ from, to, hops, steps }) {
    this.#from = from;
    this.#to = to;
    this.#hops = hops;
    this.#steps = steps;
    if (this.shadowRoot) this.render();
  }

  render() {
    this.shadowRoot.querySelector(".route-card-title").textContent = `${this.#from} → ${this.#to}`;
    this.shadowRoot.querySelector(".hops-badge").textContent = this.#hops === 1 ? "1 hop" : `${this.#hops} hops`;
    this.shadowRoot.querySelector("route-path").steps = this.#steps;
  }
}

customElements.define("route-card", RouteCard);
