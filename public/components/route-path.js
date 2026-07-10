// <route-path></route-path>, with `.steps = [{name, via}, ...]` set as a
// property (structured data, not an attribute). Renders the "Route" label
// plus a chain of zone names separated by a plain arrow, a boat icon
// (⚓, title="Boat crossing"), or a translocator icon (✨, title=
// "Translocator (paid teleport)") depending on each step's `via`.
//
// Default look is the parchment scroll insert (with wood-dowel end caps)
// used by the Route Finder's result. `variant="stone"` instead renders
// plain dark-stone text with no box or dowels, matching the Spell Finder's
// zone-card, where the route is wayfinding detail rather than the page's
// focus content (see decisions/) — same label/steps markup and logic,
// just a different palette/box for a different surface.
import { RESET_CSS } from "./reset.js";

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
${RESET_CSS}
:host {
  display: block;
  position: relative;
}
:host(:not([variant="stone"])) {
  /* --route-path-padding is this component's customization point for
     callers that need a different padding than the default (e.g. the
     Route Finder's own inline style wants 14px 18px, tighter than the
     Class Browser/Spell Finder default) -- a plain outer "route-path {
     padding: ... }" rule can't win this fight (see reset.js for why a
     normal-priority outer rule always loses to this !important), but a
     custom property assignment inherits through the shadow boundary
     normally and isn't subject to that rule at all. */
  padding: var(--route-path-padding, 12px 20px) !important;
  border-radius: 2px;
  background: var(--parch-tex), linear-gradient(180deg, #ece3c8, var(--parch-bg));
  border: 1px solid var(--parch-line);
  box-shadow: inset 0 0 22px rgba(122, 96, 42, 0.3), 0 2px 6px rgba(0, 0, 0, 0.45);
  color: var(--parch-ink);
}
:host(:not([variant="stone"]))::before, :host(:not([variant="stone"]))::after {
  content: "";
  position: absolute; top: -3px; bottom: -3px; width: 11px;
  border-radius: 5px;
  background:
    radial-gradient(3px 3px at 50% 7px, rgba(0, 0, 0, 0.6), transparent 70%),
    radial-gradient(3px 3px at 50% calc(100% - 7px), rgba(0, 0, 0, 0.6), transparent 70%),
    linear-gradient(90deg, var(--wood-2), var(--wood-1) 40%, var(--wood-1) 60%, var(--wood-2));
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.55);
}
:host(:not([variant="stone"]))::before { left: -11px; }
:host(:not([variant="stone"]))::after { right: -11px; }

.route-label { display: block; font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 8px; text-shadow: none; color: var(--parch-ink-soft); }
.route-steps { display: flex; align-items: center; flex-wrap: wrap; gap: 2px; font-size: 13px; line-height: 2.1; color: var(--parch-ink); }
.route-zone { color: var(--parch-ink); font-weight: 700; }
.route-sep { color: var(--parch-accent); margin: 0 6px; font-weight: 700; }
.boat-sep, .translocator-sep { cursor: help; }
.boat-sep { color: #1e40af; margin: 0 7px; font-size: 15px; }
.translocator-sep { color: #6d28d9; margin: 0 7px; font-size: 15px; }

/* Bold serif at small sizes reads cramped on the dark, busy marble texture
   behind a zone-card, so the stone variant bumps size back up to match the
   parchment version, adds letter-spacing and a wider flex gap so
   multi-word zone names don't run into their neighbors, and drops the
   weight from bold to 600 since true bold Georgia's tight counters were
   most of the cramped feeling. */
:host([variant="stone"]) { margin-bottom: 12px !important; }
:host([variant="stone"]) .route-label { color: var(--ink-muted); text-shadow: 0 1px 1px rgba(0, 0, 0, 0.6); }
:host([variant="stone"]) .route-steps { color: var(--parchment); font-size: 13px; line-height: 2; letter-spacing: 0.055em; gap: 6px; }
:host([variant="stone"]) .route-zone { color: var(--parchment); font-weight: 600; }
:host([variant="stone"]) .route-sep, :host([variant="stone"]) .boat-sep, :host([variant="stone"]) .translocator-sep { margin: 0; }
:host([variant="stone"]) .route-sep { color: var(--gold); }
:host([variant="stone"]) .boat-sep { color: #7ba7f5; }
:host([variant="stone"]) .translocator-sep { color: #c4a3f7; }
`);

class RoutePath extends HTMLElement {
  #steps = [];

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
    }
    this.render();
  }

  get steps() { return this.#steps; }
  set steps(value) {
    this.#steps = value || [];
    if (this.shadowRoot) this.render();
  }

  render() {
    const stepsHtml = this.#steps.map((step, i) => {
      if (i === 0) return `<span class="route-zone">${step.name}</span>`;
      if (step.via === "boat") return `<span class="boat-sep" title="Boat crossing">⚓</span><span class="route-zone">${step.name}</span>`;
      if (step.via === "translocator") return `<span class="translocator-sep" title="Translocator (paid teleport)">✨</span><span class="route-zone">${step.name}</span>`;
      return `<span class="route-sep">›</span><span class="route-zone">${step.name}</span>`;
    }).join("");
    this.shadowRoot.innerHTML = `<span class="route-label">Route</span><div class="route-steps">${stepsHtml}</div>`;
  }
}

customElements.define("route-path", RoutePath);
