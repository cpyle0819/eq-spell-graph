// <route-path></route-path>, with `.steps = [{name, via}, ...]` and
// `.activeZone = "Zone Name"` set as properties (structured data, not
// attributes). Renders the "Route" label plus a chain of zone names
// separated by a plain arrow, a boat icon (⚓, title="Boat crossing"), a
// translocator icon (✨, title="Translocator (paid teleport)"), a portal
// icon (🌀, title="Portal (walk-through zone entrance)"), or a wizard port
// icon (🧙, title="Wizard Port (group teleport spell, Wizard class +
// reagent required)") depending on each step's `via`.
//
// Every step renders as a real <button>, not a plain span (issue #63) --
// clicking one dispatches a bubbling, composed "zone-select" CustomEvent
// with `detail: { name }` so an ancestor (maps.js) can swap <zone-dossier>
// to that zone's map/npcs/quests without recomputing the route itself. The
// step matching `activeZone` gets `.active` instead of a click handler's
// visible effect -- it's still a real button (same "every tab is a button,
// .active just styles it differently" pattern as zone-dossier.js's own
// floor-tabs) so clicking the already-active step is a harmless no-op
// re-render, not a dead element.
//
// Default look is the parchment scroll insert (with wood-dowel end caps)
// used by Maps' result. `variant="stone"` instead renders
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
     callers that need a different padding than the default (e.g. Maps'
     own inline style wants 14px 18px, tighter than the
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
/* Button reset -- visually this should still read as plain route text, not
   a UI control, until you hover/focus it (the whole point is "each zone in
   the route is an option" without the route reading as a toolbar). */
.route-zone-btn {
  font: inherit; color: var(--parch-ink); font-weight: 700;
  background: none; border: none; padding: 1px 4px; margin: -1px -4px;
  border-radius: 3px; cursor: pointer;
}
.route-zone-btn:hover:not(.active) { background: rgba(122, 96, 42, 0.12); text-decoration: underline; }
.route-zone-btn:focus-visible { outline: 2px solid var(--parch-accent); outline-offset: 1px; }
/* The currently-dossiered zone -- a filled pill, not just bold text, so
   "which map is active" reads at a glance the same way floor-tab.active
   does in zone-dossier.js. Not a hand cursor since clicking it is a no-op. */
.route-zone-btn.active {
  color: var(--parch-bg); cursor: default;
  background: radial-gradient(circle at 65% 30%, var(--parch-accent), #4a3004 70%);
  box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.35);
}
/* Same "warning, not metadata" dark red as quest-card's out-of-era badge
   and zone-card's own .era-badge -- a route can pass through an out-of-era
   zone as a mid-route waypoint even when neither endpoint is out of era
   (issue #35), so this has to be readable on any step, not just the last
   one. Dotted underline (not a separate badge chip) since a name inline in
   flowing route text has no room for a boxed badge the way a card header does. */
.route-zone-btn.out-of-era:not(.active) { color: #9c2b2b; text-decoration: underline dotted; text-underline-offset: 3px; }
.route-sep { color: var(--parch-accent); margin: 0 6px; font-weight: 700; }
.boat-sep, .translocator-sep, .portal-sep, .wizard-port-sep { cursor: help; }
.boat-sep { color: #1e40af; margin: 0 7px; font-size: 15px; }
.translocator-sep { color: #6d28d9; margin: 0 7px; font-size: 15px; }
.portal-sep { color: #0f766e; margin: 0 7px; font-size: 15px; }
.wizard-port-sep { color: #b45309; margin: 0 7px; font-size: 15px; }

/* Bold serif at small sizes reads cramped on the dark, busy marble texture
   behind a zone-card, so the stone variant bumps size back up to match the
   parchment version, adds letter-spacing and a wider flex gap so
   multi-word zone names don't run into their neighbors, and drops the
   weight from bold to 600 since true bold Georgia's tight counters were
   most of the cramped feeling. */
:host([variant="stone"]) { margin-bottom: 12px !important; }
:host([variant="stone"]) .route-label { color: var(--ink-muted); text-shadow: 0 1px 1px rgba(0, 0, 0, 0.6); }
:host([variant="stone"]) .route-steps { color: var(--parchment); font-size: 13px; line-height: 2; letter-spacing: 0.055em; gap: 6px; }
/* Zone-card's route is wayfinding detail, not an active control -- no
   dossier lives next to it to switch, so the stone variant neutralizes the
   button back into plain inline text (no hover fill, no pointer, no click
   effect) rather than adopting the parchment variant's clickable styling. */
:host([variant="stone"]) .route-zone-btn { pointer-events: none; padding: 0; margin: 0; background: none; box-shadow: none; color: var(--parchment); font-weight: 600; }
:host([variant="stone"]) .route-sep, :host([variant="stone"]) .boat-sep, :host([variant="stone"]) .translocator-sep, :host([variant="stone"]) .portal-sep, :host([variant="stone"]) .wizard-port-sep { margin: 0; }
:host([variant="stone"]) .route-sep { color: var(--gold); }
:host([variant="stone"]) .boat-sep { color: #7ba7f5; }
:host([variant="stone"]) .translocator-sep { color: #c4a3f7; }
:host([variant="stone"]) .portal-sep { color: #5eead4; }
:host([variant="stone"]) .wizard-port-sep { color: #fbbf24; }
:host([variant="stone"]) .route-zone-btn.out-of-era { color: #ff6b6b; }
`);

class RoutePath extends HTMLElement {
  #steps = [];
  #activeZone = null;

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
      this.shadowRoot.addEventListener("click", (e) => {
        const btn = e.target.closest(".route-zone-btn");
        if (!btn) return;
        this.dispatchEvent(new CustomEvent("zone-select", { bubbles: true, composed: true, detail: { name: btn.dataset.name } }));
      });
    }
    this.render();
  }

  get steps() { return this.#steps; }
  set steps(value) {
    this.#steps = value || [];
    if (this.shadowRoot) this.render();
  }

  get activeZone() { return this.#activeZone; }
  set activeZone(value) {
    this.#activeZone = value ?? null;
    if (this.shadowRoot) this.render();
  }

  render() {
    const stepsHtml = this.#steps.map((step, i) => {
      const active = step.name === this.#activeZone;
      const classes = ["route-zone-btn", step.outOfEra && "out-of-era", active && "active"].filter(Boolean).join(" ");
      const title = step.outOfEra ? "Out of era — not available in the current era yet" : active ? "" : "Show this zone's map";
      const zoneBtn = `<button type="button" class="${classes}" data-name="${step.name}"${title ? ` title="${title}"` : ""}>${step.name}</button>`;
      if (i === 0) return zoneBtn;
      if (step.via === "boat") return `<span class="boat-sep" title="Boat crossing">⚓</span>${zoneBtn}`;
      if (step.via === "translocator") return `<span class="translocator-sep" title="Translocator (paid teleport)">✨</span>${zoneBtn}`;
      if (step.via === "portal") return `<span class="portal-sep" title="Portal (walk-through zone entrance)">🌀</span>${zoneBtn}`;
      if (step.via === "wizard_port") return `<span class="wizard-port-sep" title="Wizard Port (group teleport spell, Wizard class + reagent required)">🧙</span>${zoneBtn}`;
      return `<span class="route-sep">›</span>${zoneBtn}`;
    }).join("");
    this.shadowRoot.innerHTML = `<span class="route-label">Route</span><div class="route-steps">${stepsHtml}</div>`;
  }
}

customElements.define("route-path", RoutePath);
