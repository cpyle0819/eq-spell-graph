// <route-card></route-card>, with
// `.route = {from, to, hops, steps, destination}` set as a property.
// Renders the "From → To" title, an "N hop(s)" badge, a destination-vendor
// badge, and a nested <route-path> for the actual step-by-step directions.
//
// `destination` (from /api/route's `destination` field, see src/graph.ts's
// getZoneVendorInfo) is `{vendorCount, levelRange, lore}` describing the
// *destination* zone -- vendorCount/levelRange are spell vendors actually
// present there (not a faction/danger judgment, since Route Finder has no
// race/class/deity context to resolve one, unlike Spell Finder's
// zone-card), kept to a single small badge alongside the hops badge, not a
// data dump. `lore` is a short eqlwiki.com guidebook-style blurb, passed
// straight through to the nested <route-path>, which renders it on the
// parchment scroll -- the hop-by-hop path stays the card's main content.
import { RESET_CSS } from "./reset.js";

function destinationBadgeText({ vendorCount, levelRange } = {}) {
  if (!vendorCount) return "No vendors here";
  const noun = vendorCount === 1 ? "vendor" : "vendors";
  return levelRange ? `${vendorCount} ${noun} · Lvl ${levelRange.min}–${levelRange.max}` : `${vendorCount} ${noun}`;
}

function destinationBadgeTitle(to, { vendorCount, levelRange } = {}) {
  if (!vendorCount) return `No known spell vendors in ${to}.`;
  const noun = vendorCount === 1 ? "vendor sells" : "vendors sell";
  const levels = levelRange ? ` spells for levels ${levelRange.min}–${levelRange.max}` : "spells";
  return `${vendorCount} ${noun}${levels} in ${to}.`;
}

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
/* Same sunken-badge language as .hops-badge, but --ink-muted rather than
   gold -- this is a neutral fact about the destination, not the card's
   headline stat (that's still the hop count). */
.dest-badge {
  font-size: 12px; padding: 3px 10px; border-radius: 3px;
  background: var(--panel-deep);
  border: 1px solid; border-color: var(--edge-lo) var(--edge-lo) #5a5570 #5a5570;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
  color: var(--ink-muted);
  font-variant-numeric: tabular-nums;
  cursor: help;
}
.dest-badge.is-empty { font-style: italic; opacity: 0.85; }
/* route.html's own page-level route-path override can no longer reach this
   element now that it's nested inside this component's shadow root, so
   this component owns the override directly instead. */
route-path { --route-path-padding: 14px 18px; }
`);

class RouteCard extends HTMLElement {
  #from = ""; #to = ""; #hops = 0; #steps = []; #destination = undefined;

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
      this.shadowRoot.innerHTML = `
        <div class="route-card-header">
          <span class="route-card-title"></span>
          <span class="hops-badge"></span>
          <span class="dest-badge"></span>
        </div>
        <route-path></route-path>
      `;
    }
    this.render();
  }

  set route({ from, to, hops, steps, destination }) {
    this.#from = from;
    this.#to = to;
    this.#hops = hops;
    this.#steps = steps;
    this.#destination = destination;
    if (this.shadowRoot) this.render();
  }

  render() {
    this.shadowRoot.querySelector(".route-card-title").textContent = `${this.#from} → ${this.#to}`;
    this.shadowRoot.querySelector(".hops-badge").textContent = this.#hops === 1 ? "1 hop" : `${this.#hops} hops`;
    const destBadge = this.shadowRoot.querySelector(".dest-badge");
    destBadge.textContent = destinationBadgeText(this.#destination);
    destBadge.title = destinationBadgeTitle(this.#to, this.#destination);
    destBadge.classList.toggle("is-empty", !this.#destination?.vendorCount);
    const routePath = this.shadowRoot.querySelector("route-path");
    routePath.steps = this.#steps;
    routePath.lore = this.#destination?.lore || "";
  }
}

customElements.define("route-card", RouteCard);
