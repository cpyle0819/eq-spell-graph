// <route-card></route-card>, with
// `.route = {from, to, hops, steps, destination, alternates}` set as a
// property. `alternates` (RouteStep[][], see getRoute() in src/graph.ts) is
// forwarded straight to the nested <route-path>, which owns the "up to 3
// routes total" picker UI itself.
// Renders the "From → To" title, an "N hop(s)" badge, and a nested
// <route-path> for the actual step-by-step directions.
//
// `destination` (from /api/route's `destination` field, see src/graph.ts's
// getZoneVendorInfo) is `{vendorCount, levelRange, lore, wikiTitle}`, but
// this card only reads `wikiTitle` for the header's wiki link -- the exact
// eqlwiki.com page title this zone was sourced from (migration 023's
// `wiki_title`, not always the same string as `to` -- see decisions/
// zone-naming-mismatches.md), reused here instead of re-deriving a URL from
// `to`, which would 404 for zones with a mismatched label. vendorCount/
// levelRange used to drive a second "dest-badge" here, but that number is a
// spell-shopping level range (every class_levels entry across every spell
// any vendor sells), a different concept from a zone's danger/mob level --
// showing it next to the hop count alongside <zone-dossier>'s own,
// bestiary-derived level badge below just read as two conflicting answers
// to the same question. The bestiary level range in <zone-dossier> is now
// the one place Maps answers "what level is this zone," so this card
// dropped back to just the hop count. `lore` itself isn't shown here either
// -- <zone-dossier> is the canonical place for it now (it renders
// unconditionally below this card), so repeating it here read as a
// straight duplicate.
import { RESET_CSS } from "./reset.js";
import { WIKI_LINK_CSS, wikiLink } from "./card-base.js";

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
${RESET_CSS}
${WIKI_LINK_CSS}
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
/* maps.html's own page-level route-path override can no longer reach this
   element now that it's nested inside this component's shadow root, so
   this component owns the override directly instead. */
route-path { --route-path-padding: 14px 18px; }
`);

class RouteCard extends HTMLElement {
  #from = ""; #to = ""; #hops = 0; #steps = []; #alternates = []; #destination = undefined; #activeZone = null;

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
      this.shadowRoot.innerHTML = `
        <div class="route-card-header">
          <span class="route-card-title"></span>
          <span class="wiki-link-holder"></span>
          <span class="hops-badge"></span>
        </div>
        <route-path></route-path>
      `;
    }
    this.render();
  }

  set route({ from, to, hops, steps, destination, alternates }) {
    this.#from = from;
    this.#to = to;
    this.#hops = hops;
    this.#steps = steps;
    this.#alternates = alternates || [];
    this.#destination = destination;
    if (this.shadowRoot) this.render();
  }

  // Which step's map maps.js currently has open in <zone-dossier> --
  // separate from `.route` itself since clicking a step (issue #63) swaps
  // this without recomputing the route, and re-setting the whole `.route`
  // object every time would be a needlessly roundabout way to update one
  // button's styling.
  set activeZone(value) {
    this.#activeZone = value ?? null;
    if (this.shadowRoot) this.render();
  }

  render() {
    this.shadowRoot.querySelector(".route-card-title").textContent = `${this.#from} → ${this.#to}`;
    this.shadowRoot.querySelector(".wiki-link-holder").innerHTML = this.#destination?.wikiTitle ? wikiLink(this.#destination.wikiTitle) : "";
    this.shadowRoot.querySelector(".hops-badge").textContent = this.#hops === 1 ? "1 hop" : `${this.#hops} hops`;
    const path = this.shadowRoot.querySelector("route-path");
    path.steps = this.#steps;
    path.alternates = this.#alternates;
    path.activeZone = this.#activeZone;
  }
}

customElements.define("route-card", RouteCard);
