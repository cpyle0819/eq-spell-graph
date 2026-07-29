// <shopping-list-panel>, with `.items = [{id, label, quantity}]` and
// `.zones = [{id, label}]` set as two properties. The Tradeskills page's own
// right-side panel (same bordered marble box + sticky-on-desktop treatment
// as status-panel.js, the Spell Finder's equivalent right panel) collecting
// ingredients added via the "+" drawer on any ingredient item-chip
// (recipe-card.js/leveling-guide-card.js's formula chips, ingredient-
// card.js's own header button).
//
// Unlike status-panel (which hides via `hidden` when there's nothing
// relevant to show), this stays visible even when empty -- it's this page's
// own persistent furniture, not a conditional planner result -- with a
// plain empty-state hint standing in until something's added. The actions
// cluster (Current Location + Find Near Me + Clear list) only appears once
// there's a list to act on, though -- same reasoning, nothing to find or
// clear yet.
//
// Each row renders the item through item-chip.js (itemChipTag) -- the app's
// one item-rendering component, same as everywhere else an item shows up --
// rather than a bespoke plain-text label, so it gets the same gem/name
// styling and click-through to that ingredient's own card (nav-href).
//
// This component only renders; it owns no state and does no persistence
// (including "Current Location" -- unlike the shopping list itself, that
// selection isn't saved, so it starts back at "-" on every fresh render of
// this component, same as every other Tradeskills filter resetting on a
// soft-navigation return). A quantity nudge, Clear list, or Find Near Me
// dispatches composed `change-shopping-quantity`/`clear-shopping-list`/
// `find-near-me` CustomEvents for trades.js to act on, same split as
// status-panel's own toggle-owned/clear-owned. Decrementing to 0 is how a
// single row is removed -- there's no separate remove button. Find Near Me
// is disabled (native `<button disabled>`, via macro-button.js's own
// `disabled` attribute) until a location is picked -- this component owns
// that enable/disable toggle itself since it only depends on this
// component's own dropdown, not on anything trades.js knows that this
// doesn't.
import { RESET_CSS } from "./reset.js";
import { itemChipTag } from "./item-chip.js";

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
${RESET_CSS}
:host {
  display: block;
  flex-shrink: 0;
  overflow: hidden;
  background: var(--marble-tex), linear-gradient(180deg, var(--stone-1), var(--stone-2));
  border: 4px solid;
  border-color: var(--edge-hi) var(--edge-hi) var(--edge-lo) var(--edge-lo);
  border-radius: 3px;
  box-shadow: inset -1px 1px 0 rgba(255, 255, 255, 0.08), inset 1px -1px 0 rgba(0, 0, 0, 0.45), 0 2px 8px rgba(0, 0, 0, 0.4);
}
.shopping-header {
  padding: 14px 20px; text-align: center; font-size: 13px; color: var(--parchment);
  letter-spacing: 0.1em; font-weight: 600; text-transform: uppercase;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.6);
  border-bottom: 2px solid var(--edge-lo);
}
.shopping-empty { padding: 16px 20px; text-align: center; font-size: 12px; color: var(--ink-muted); line-height: 1.5; }
.shopping-list { display: flex; flex-direction: column; padding: 6px 0; }
.shopping-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 7px 20px; font-size: 12px; color: var(--ink-muted); }
.shopping-row + .shopping-row { border-top: 1px solid rgba(0, 0, 0, 0.25); }
/* This panel's own dark stone/marble background, not the light parchment
   scroll item-chip's default palette assumes (recipe formulas, drops/
   rewards) -- same sunken-well treatment guide-count-badge and field-row's
   inputs already use on this exact background, handed to item-chip's own
   --chip-* override hooks rather than a second chip rendering. */
.shopping-row item-chip {
  min-width: 0;
  --chip-bg: var(--panel-deep);
  --chip-color: var(--gold);
  --chip-border: rgba(232, 168, 42, 0.35);
}
.shopping-qty-controls { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }
.qty-btn {
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
  width: 16px; height: 16px; padding: 0; border-radius: 3px;
  background: rgba(122, 77, 5, 0.15); color: var(--gold); border: 1px solid rgba(122, 77, 5, 0.4);
  font-size: 12px; line-height: 1; cursor: pointer;
}
.qty-btn:hover, .qty-btn:focus-visible { background: rgba(122, 77, 5, 0.3); }
.shopping-qty { flex-shrink: 0; min-width: 14px; text-align: center; font-variant-numeric: tabular-nums; color: var(--gold); font-weight: 700; }
.shopping-actions {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding: 14px 20px 16px; border-top: 2px solid var(--edge-lo);
}
.shopping-actions field-row { width: 100%; }
/* theme.css's own .text-action look (sidebar-panel's "Reset filters"),
   replicated locally -- that's a light-DOM class handed to a slotted
   element, and this panel has no slot to pass one through, it renders
   everything into its own shadow root. A full macro-button read as too
   heavy/deliberate (same "too busy for a secondary, infrequent toggle"
   theme.css already documents for text-action) for a one-line list-clearing
   link sitting right under the rows it clears. */
.clear-link {
  background: none; border: none; box-shadow: none; border-radius: 0;
  padding: 0; min-height: 0;
  font-family: var(--font-body); font-size: 12px; font-weight: 400;
  letter-spacing: normal; text-transform: none; text-shadow: none;
  color: var(--ink-muted); text-decoration: none; cursor: pointer;
}
.clear-link:hover { text-decoration: underline; color: var(--gold-bright); }
.clear-link:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
@media (min-width: 1100px) {
  :host { width: 220px; min-width: 220px; position: sticky; top: 0; }
}
`);

class ShoppingListPanel extends HTMLElement {
  #items = [];
  #zones = [];

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
    }
    this.render();
  }

  get items() { return this.#items; }
  set items(value) {
    this.#items = value || [];
    if (this.shadowRoot) this.render();
  }

  get zones() { return this.#zones; }
  set zones(value) {
    this.#zones = value || [];
    if (this.shadowRoot) this.render();
  }

  render() {
    const items = this.#items;
    const bodyHtml = items.length
      ? `<div class="shopping-list">${items
          .map(
            (i) => `
        <div class="shopping-row">
          ${itemChipTag({ id: i.id, label: i.label }, { navHref: `trades.html?type=ingredients&search=${encodeURIComponent(i.label)}` })}
          <span class="shopping-qty-controls">
            <button type="button" class="qty-btn qty-dec" data-id="${i.id}" aria-label="Decrease ${i.label} quantity">−</button>
            <span class="shopping-qty">${i.quantity}</span>
            <button type="button" class="qty-btn qty-inc" data-id="${i.id}" aria-label="Increase ${i.label} quantity">+</button>
          </span>
        </div>`
          )
          .join("")}</div>`
      : `<div class="shopping-empty">No ingredients added yet. Look for the "+" on an ingredient.</div>`;

    const zoneOptions = this.#zones.map((z) => `<option value="${z.id}">${z.label}</option>`).join("");
    const actionsHtml = items.length
      ? `
      <div class="shopping-actions">
        <field-row label="Current Location">
          <select id="location-select">
            <option value="">-</option>
            ${zoneOptions}
          </select>
        </field-row>
        <macro-button square id="find-near-me-btn" disabled>Find Near Me</macro-button>
        <button type="button" class="clear-link" id="clear-shopping-btn">Clear list</button>
      </div>`
      : "";

    this.shadowRoot.innerHTML = `
      <div class="shopping-header">Shopping List</div>
      ${bodyHtml}
      ${actionsHtml}
    `;

    const changeQty = (id, delta) => {
      this.dispatchEvent(new CustomEvent("change-shopping-quantity", { bubbles: true, composed: true, detail: { id, delta } }));
    };
    this.shadowRoot.querySelectorAll(".qty-dec").forEach((btn) => btn.addEventListener("click", () => changeQty(btn.dataset.id, -1)));
    this.shadowRoot.querySelectorAll(".qty-inc").forEach((btn) => btn.addEventListener("click", () => changeQty(btn.dataset.id, 1)));
    this.shadowRoot.getElementById("clear-shopping-btn")?.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("clear-shopping-list", { bubbles: true, composed: true }));
    });
    this.shadowRoot.getElementById("location-select")?.addEventListener("change", (e) => {
      this.shadowRoot.getElementById("find-near-me-btn").toggleAttribute("disabled", !e.target.value);
    });
    this.shadowRoot.getElementById("find-near-me-btn")?.addEventListener("click", () => {
      const zoneId = this.shadowRoot.getElementById("location-select").value;
      this.dispatchEvent(new CustomEvent("find-near-me", { bubbles: true, composed: true, detail: { zoneId } }));
    });
  }
}

customElements.define("shopping-list-panel", ShoppingListPanel);
