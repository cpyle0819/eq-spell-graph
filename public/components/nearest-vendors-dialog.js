// <nearest-vendors-dialog>, with `.setData({ fromLabel, stops, notFound })`
// set as one atomic call (same reasoning as zone-card's setData -- a render
// should never see a partial mix of old and new state). `.show()` opens it.
// Tradeskills' "Find Near Me" result (shopping-list-panel.js's own
// `find-near-me` event, computed in trades.js): each `stop` is one vendor
// zone worth considering -- `{ zoneId, zoneLabel, hops, route, alternates, vendors:
// [{ id, label, notes?, items: [{id,label,quantity}] }] }` -- grouped by zone
// (not flattened per-item) so each entry reads as "here's what this zone has,"
// rather than repeating a zone name once per item. A vendor's `notes` is a
// free-text field-verified finding aid (e.g. which building to look for);
// omitted when there's none. `notFound` is
// shopping-list items (same {id,label,quantity} shape) no known vendor
// sells at all.
//
// These are the top 5 *candidate* zones ranked by how much of the shopping
// list each one covers (most items first, nearest as the tiebreak, see
// findNearMe() in trades.js) -- not a single prescribed trip. Items can
// legitimately repeat across more than one listed zone; this is "here are
// your best options," not a minimal covering route.
//
// A native <dialog> (showModal()/close(), ::backdrop, Escape-to-close, and
// focus trapping all come free from the platform -- no existing modal
// pattern elsewhere in the app to match, so this is free to just use the
// browser's own). Clicking the backdrop-adjacent padding around the visible
// frame (not a descendant of it) closes it too, since <dialog> doesn't do
// that on its own.
import { RESET_CSS } from "./reset.js";
import { itemChipTag } from "./item-chip.js";

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
${RESET_CSS}
:host { display: contents; }
/* An author stylesheet's plain "dialog { ... }" outranks the UA
   stylesheet's own "dialog:not([open]) { display: none }" regardless of
   the latter's higher selector specificity -- cascade origin (author beats
   user-agent) wins that fight first, before specificity is even compared.
   So "display: flex" has to be scoped to [open] itself, or this dialog
   never actually closes visually no matter what showModal()/close() do. */
dialog { display: none; }
dialog[open] {
  padding: 0; border: none; border-radius: 4px; margin: auto;
  width: min(640px, 92vw); max-height: 82vh;
  background: var(--marble-tex), linear-gradient(180deg, var(--stone-1), var(--stone-2));
  border: 4px solid;
  border-color: var(--edge-hi) var(--edge-hi) var(--edge-lo) var(--edge-lo);
  box-shadow: inset -1px 1px 0 rgba(255, 255, 255, 0.08), inset 1px -1px 0 rgba(0, 0, 0, 0.45), 0 8px 30px rgba(0, 0, 0, 0.6);
  color: var(--parchment);
  display: flex; flex-direction: column;
}
dialog::backdrop { background: rgba(0, 0, 0, 0.65); }
.dialog-header {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 16px 20px; border-bottom: 2px solid var(--edge-lo); flex-shrink: 0;
}
.dialog-title-group { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.dialog-title {
  font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--parchment);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8); letter-spacing: 0.02em;
}
.dialog-from { font-size: 11px; color: var(--ink-muted); letter-spacing: 0.08em; text-transform: uppercase; }
.dialog-close {
  flex-shrink: 0; background: none; border: none; color: var(--ink-muted);
  font-size: 18px; line-height: 1; padding: 4px; cursor: pointer;
}
.dialog-close:hover, .dialog-close:focus-visible { color: var(--gold); }
.dialog-close:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
.dialog-body { padding: 16px 20px 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }
.empty { color: var(--ink-muted); font-size: 13px; text-align: center; padding: 24px 0; }

.stop {
  background: var(--marble-tex), linear-gradient(180deg, var(--stone-1), var(--stone-2));
  border: 4px solid;
  border-color: var(--edge-hi) var(--edge-hi) var(--edge-lo) var(--edge-lo);
  border-radius: 3px;
  padding: 14px 18px !important;
}
.stop-header { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
.stop-zone {
  font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--parchment);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}
.stop-badge {
  font-size: 11px; padding: 2px 8px; border-radius: 3px;
  background: var(--panel-deep);
  border: 1px solid; border-color: var(--edge-lo) var(--edge-lo) #5a5570 #5a5570;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
  color: #c9a25e; font-variant-numeric: tabular-nums;
}
route-path { margin-bottom: 10px !important; }
.stop-vendors { display: flex; flex-direction: column; gap: 8px; }
.stop-vendor-row { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; font-size: 12px; }
.stop-vendor-name { color: var(--gold); font-weight: 600; }
.stop-vendor-notes { flex-basis: 100%; color: var(--ink-muted); font-size: 11px; font-style: italic; }
/* This panel's own dark stone/marble background, not the light parchment
   scroll item-chip's default palette assumes -- same override hooks
   shopping-list-panel.js already hands them on the same background. */
.stop-vendor-row item-chip, .not-found-items item-chip {
  --chip-bg: var(--panel-deep);
  --chip-color: var(--gold);
  --chip-border: rgba(232, 168, 42, 0.35);
}

.not-found {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: 3px;
  padding: 12px 16px;
}
.not-found h3 {
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;
  color: #ff6b6b; margin-bottom: 8px;
}
.not-found-items { display: flex; flex-wrap: wrap; gap: 6px; }
`);

class NearestVendorsDialog extends HTMLElement {
  #data = null;

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
      this.shadowRoot.innerHTML = `
        <dialog>
          <div class="dialog-header">
            <div class="dialog-title-group">
              <span class="dialog-title">Nearest Vendors</span>
              <span class="dialog-from"></span>
            </div>
            <button type="button" class="dialog-close" aria-label="Close">✕</button>
          </div>
          <div class="dialog-body"></div>
        </dialog>
      `;
      const dialog = this.shadowRoot.querySelector("dialog");
      this.shadowRoot.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
      // <dialog> has no built-in click-outside-to-close -- a click that lands
      // directly on the dialog element itself (its own backdrop-adjacent
      // padding box, not a descendant) is exactly that case.
      dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
    }
    this.render();
  }

  setData(data) {
    this.#data = data;
    if (this.shadowRoot) this.render();
  }

  show() {
    this.shadowRoot.querySelector("dialog").showModal();
  }

  render() {
    const d = this.#data;
    this.shadowRoot.querySelector(".dialog-from").textContent = d?.fromLabel ? `From ${d.fromLabel}` : "";
    if (!d) return;

    const body = this.shadowRoot.querySelector(".dialog-body");
    if (!d.stops.length && !d.notFound.length) {
      body.innerHTML = `<div class="empty">Your shopping list is empty.</div>`;
      return;
    }

    const stopsHtml = d.stops
      .map((stop) => {
        const hopsText = stop.hops === 0 ? "you are here" : `${stop.hops} hop${stop.hops > 1 ? "s" : ""}`;
        const vendorsHtml = stop.vendors
          .map(
            (v) => `
          <div class="stop-vendor-row">
            <span class="stop-vendor-name">${v.label}</span>
            ${v.items.map((it) => itemChipTag(it)).join("")}
            ${v.notes ? `<span class="stop-vendor-notes">${v.notes}</span>` : ""}
          </div>`
          )
          .join("");
        return `
        <div class="stop">
          <div class="stop-header">
            <span class="stop-zone">${stop.zoneLabel}</span>
            <span class="stop-badge">${hopsText}</span>
          </div>
          ${stop.hops > 0 ? `<route-path variant="stone"></route-path>` : ""}
          <div class="stop-vendors">${vendorsHtml}</div>
        </div>`;
      })
      .join("");

    const notFoundHtml = d.notFound.length
      ? `
      <div class="not-found">
        <h3>Not sold by any known vendor</h3>
        <div class="not-found-items">${d.notFound.map((it) => itemChipTag(it)).join("")}</div>
      </div>`
      : "";

    body.innerHTML = stopsHtml + notFoundHtml;
    body.querySelectorAll(".stop").forEach((el, i) => {
      const routePath = el.querySelector("route-path");
      if (routePath) {
        routePath.steps = d.stops[i].route;
        routePath.alternates = d.stops[i].alternates;
      }
    });
  }
}

customElements.define("nearest-vendors-dialog", NearestVendorsDialog);
