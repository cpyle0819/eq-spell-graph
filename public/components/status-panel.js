// <status-panel>, with `.data = {totalGoods, goodsLabel, accessibleCount,
// levelText, warnings, ownedCount, showAllSpells}` set as one property.
// `warnings` is a pre-built array of HTML strings (app.js's own faction/
// ignored-dimension copy) -- this component just lays them out, it doesn't
// interpret planner results. `.data = null` clears the panel and hides it
// via the native `hidden` attribute: `:empty` only ever sees light-DOM
// children, and this component never has any (everything renders into its
// shadow root), so a CSS `:empty` rule can't detect "no data" here.
//
// `goodsLabel` ("spell"/"item") and `levelText` (a ready-made "level 9"/
// "levels 9–11" string, or null) generalize this for Vendors' item-category
// results (Armor/Adventuring Supplies/Tradeskill Supplies), which have no
// per-class level data the way spells do. `ownedCount` is spell-only --
// items have no "owned" concept in this app -- so it's optional; when
// omitted, the mana-bar/owned-count/toggle-owned/clear-owned block doesn't
// render at all rather than showing a meaningless 0/N.
//
// Renders the meta text + warnings, a nested <mana-bar>, and the toggle/
// clear <macro-button>s, all inside its own shadow root (not slotted).
// Buttons in a shadow root aren't reachable by class match through a
// delegated listener outside it (retargeting), so this component
// dispatches composed `toggle-owned`/`clear-owned` CustomEvents for app.js
// to listen for.
import { RESET_CSS } from "./reset.js";

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
${RESET_CSS}
:host([hidden]) { display: none !important; }
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
.status-meta {
  padding: 14px 20px; text-align: center; font-size: 12px; color: var(--ink-muted);
  line-height: 1.5; border-bottom: 2px solid var(--edge-lo);
}
.status-warnings { margin-top: 4px; font-size: 11px; }
.status-summary { padding: 16px 20px 12px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.status-summary mana-bar { --mana-bar-width: 100%; }
.status-owned-count { font-size: 12px; color: var(--ink-muted); letter-spacing: 0.06em; font-variant-numeric: tabular-nums; }
.status-actions {
  display: flex; justify-content: center;
  padding: 12px 20px 16px; border-top: 2px solid var(--edge-lo);
}
@media (min-width: 1100px) {
  :host { width: 220px; min-width: 220px; position: sticky; top: 0; }
}
`);

class StatusPanel extends HTMLElement {
  #data = null;

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
    }
    this.render();
  }

  get data() { return this.#data; }
  set data(value) {
    this.#data = value;
    this.hidden = !value;
    if (this.shadowRoot) this.render();
  }

  render() {
    if (!this.#data) {
      this.shadowRoot.replaceChildren();
      return;
    }
    const { totalGoods, goodsLabel, accessibleCount, levelText, warnings, ownedCount, showAllSpells } = this.#data;
    const hasOwned = ownedCount != null;
    const toggleLabel = showAllSpells ? "Show remaining" : "Show all";
    const clearBtn = hasOwned && ownedCount > 0 ? `<macro-button square id="clear-owned-btn">Clear owned</macro-button>` : "";

    this.shadowRoot.innerHTML = `
      <div class="status-meta">
        ${totalGoods} ${goodsLabel}(s) across ${accessibleCount} zone(s)${levelText ? ` for ${levelText}` : ""}
        ${warnings.length ? `<div class="status-warnings">${warnings.join(" · ")}</div>` : ""}
      </div>
      ${hasOwned ? `
      <div class="status-summary">
        <mana-bar></mana-bar>
        <span class="status-owned-count">${ownedCount} / ${totalGoods} owned</span>
      </div>
      <div class="status-actions">
        <macro-button square id="toggle-owned-btn">${toggleLabel}</macro-button>
        ${clearBtn}
      </div>` : ""}
    `;

    if (hasOwned) {
      const manaBar = this.shadowRoot.querySelector("mana-bar");
      manaBar.value = ownedCount;
      manaBar.max = totalGoods;

      this.shadowRoot.getElementById("toggle-owned-btn").addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("toggle-owned", { bubbles: true, composed: true }));
      });
      this.shadowRoot.getElementById("clear-owned-btn")?.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("clear-owned", { bubbles: true, composed: true }));
      });
    }
  }
}

customElements.define("status-panel", StatusPanel);
