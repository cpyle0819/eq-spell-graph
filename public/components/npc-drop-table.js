// <npc-drop-table></npc-drop-table>, `.setData(items)` with an
// ItemSummary[] (same shape zone-dossier.js's npc.drops already carries).
// A collapsible loot table for a single npc/mob row: a toggle line
// ("▸ N Drops") that expands into a stacked list of item-chips. Closed by
// default -- a mob with a dozen+ drops (real ones, once log-sourced loot
// started getting attached -- migrations/_log-loot-lib.ts) would otherwise
// blow out the Bestiary's compact name/level grid.
//
// Lives as its own grid item inside zone-dossier.js's `.npc-list` (`grid-
// column: 1 / -1` there, same span-both-columns technique its own
// `.dossier-empty` rule already uses), directly below the npc's name/level
// row rather than crammed inline into the name cell the way a single-item
// drop badge used to be.
import { RESET_CSS } from "./reset.js";
import { itemChipTag, hydrateItemChips } from "./item-chip.js";

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
${RESET_CSS}
:host { display: block; }
:host([hidden]) { display: none; }
.toggle {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; color: var(--parch-ink-soft);
  background: none; border: none; padding: 2px 0; margin: 0;
  cursor: pointer; text-align: left;
}
.toggle:hover, .toggle:focus-visible { color: var(--parch-accent); }
.toggle:focus-visible { outline: 2px solid var(--parch-accent); outline-offset: 2px; }
.toggle::before {
  content: "▸"; display: inline-block; font-size: 9px; flex-shrink: 0;
  transition: transform 0.15s ease;
}
.toggle[aria-expanded="true"]::before { transform: rotate(90deg); }
.drop-list {
  list-style: none; margin: 4px 0 6px; padding: 6px 0 0 14px;
  display: flex; flex-direction: column; gap: 5px;
  border-top: 1px dashed var(--parch-line);
}
.drop-list[hidden] { display: none; }
`);

class NpcDropTable extends HTMLElement {
  #items = [];

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
      this.shadowRoot.innerHTML = `
        <button type="button" class="toggle" aria-expanded="false"></button>
        <ul class="drop-list" hidden></ul>
      `;
      this.shadowRoot.querySelector(".toggle").addEventListener("click", () => this.#toggle());
    }
    this.render();
  }

  setData(items) {
    this.#items = items || [];
    if (this.shadowRoot) this.render();
  }

  render() {
    const toggle = this.shadowRoot.querySelector(".toggle");
    const list = this.shadowRoot.querySelector(".drop-list");
    this.hidden = !this.#items.length;
    if (!this.#items.length) {
      toggle.hidden = true;
      list.hidden = true;
      return;
    }
    toggle.hidden = false;
    toggle.textContent = `${this.#items.length} Drop${this.#items.length === 1 ? "" : "s"}`;
    list.innerHTML = this.#items.map((item) => `<li>${itemChipTag(item)}</li>`).join("");
    hydrateItemChips(list, (id) => this.#items.find((i) => i.id === id));
  }

  #toggle() {
    const toggle = this.shadowRoot.querySelector(".toggle");
    const list = this.shadowRoot.querySelector(".drop-list");
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    list.hidden = expanded;
  }
}

customElements.define("npc-drop-table", NpcDropTable);
