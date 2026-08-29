// <status-panel>, with `.data = {totalGoods, goodsLabel, accessibleCount,
// levelText, warnings, ownedCount, showAllSpells, spells, owned}` set as one
// property. `warnings` is a pre-built array of HTML strings (app.js's own
// faction/ignored-dimension copy) -- this component just lays them out, it
// doesn't interpret planner results. `.data = null` clears the panel and
// hides it via the native `hidden` attribute: `:empty` only ever sees
// light-DOM children, and this component never has any (everything renders
// into its shadow root), so a CSS `:empty` rule can't detect "no data" here.
//
// `goodsLabel` ("spell"/"item") and `levelText` (a ready-made "level 9"/
// "levels 9-11" string, or null) generalize this for the Items page's own
// item-type results (Armor/Food/Tradeskill Materials/etc., src/graph.ts's
// classifyItemType()), which have no per-class level data the way spells
// do. `ownedCount` is spell-only -- items have no "owned" concept in this
// app -- so it's optional; when omitted, the mana-bar/owned-count/
// toggle-owned/clear-owned block doesn't render at all rather than showing
// a meaningless 0/N.
//
// `spells` (Type=Spell only, app.js's own spellChecklist built from
// src/graph.ts's rankGoods()) and `owned` (the full owned-id Set, not just
// its count) drive a checklist rendered below the toggle/clear buttons,
// inside this same panel: the one deduplicated, filter-driven place spell
// detail and owned-tracking checkboxes live, since a class vendor's
// inventory is the class's whole spell list (decisions/
// class-spell-vendor-model.md) and each result's own good-card carries a
// vendor+classes summary per offer instead (app.js hands this panel every
// matching, currently-accessible spell once). The panel widens
// (`:host([wide])`, keyed off `spells` being present) to give that
// checklist room.
//
// Renders the meta text + warnings, a nested <mana-bar>, the toggle/clear
// <macro-button>s, and (Spells only) the checklist, all inside its own
// shadow root (not slotted). Buttons and checkboxes in a shadow root aren't
// reachable by class match through a delegated listener outside it
// (retargeting), so this component dispatches composed
// `toggle-owned`/`clear-owned`/`spell-owned-change` CustomEvents for app.js
// to listen for. Hover-to-tooltip for a spell chip is handled entirely
// internally, calling #detail-tooltip's show()/hide() API directly -- this
// component already has full spell data via `.data.spells`, so it never
// needs to reach into app.js's own state. spellStats() below shapes a spell
// into <detail-tooltip>'s generic { name, description, stats } contract --
// that component itself has no spell-specific field knowledge (see
// public/components/detail-tooltip.js), so this is the one place spell
// fields become tooltip stat chips.
import { RESET_CSS } from "./reset.js";
import { wikiUrl } from "./card-base.js";

// Shapes a spell into <detail-tooltip>'s generic { text, highlight? }[]
// stat-chip contract. spellType is the one highlighted chip, everything
// else is plain.
function spellStats(spell) {
  const dur = spell.duration
    ? spell.duration.replace(/\s+minutes?/i, "m").replace(/\s+seconds?/i, "s").replace(/instant/i, "Instant")
    : null;
  const stats = [];
  if (spell.spellType) stats.push({ text: spell.spellType, highlight: true });
  if (spell.mana != null) stats.push({ text: `${spell.mana} mana` });
  if (spell.targetType) stats.push({ text: spell.targetType });
  if (dur) stats.push({ text: dur });
  if (spell.castTime != null) stats.push({ text: `${spell.castTime.toFixed(1)}s cast` });
  if (spell.resist && !/unresist/i.test(spell.resist)) stats.push({ text: `${spell.resist} resist` });
  if (spell.skill) stats.push({ text: spell.skill });
  if (spell.spellLine) stats.push({ text: spell.spellLine });
  return stats;
}

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
  /* Widened for the Spells checklist below the toggle/clear buttons --
     narrower than that and every spell's class/level pills wrap onto their
     own line, undermining the point of a compact checklist. */
  :host([wide]) { width: 340px; min-width: 340px; }
}

/* Spell checklist -- same spell-row/spell-chip/class-pill recipe as the
   rest of the app's spell listings (decisions/class-spell-vendor-model.md),
   scoped to this component's own shadow root. Its own scroll region rather
   than growing the sticky panel past the viewport. */
.status-spell-list {
  border-top: 2px solid var(--edge-lo);
  padding: 12px 16px 16px;
  max-height: 60vh;
  overflow-y: auto;
  display: flex; flex-direction: column; gap: 6px;
}
.spell-row { display: grid; grid-template-columns: 15px 1fr; column-gap: 8px; row-gap: 4px; }
.spell-check { padding-top: 3px; }
.spell-check input { cursor: pointer; accent-color: var(--gold); width: 15px; height: 15px; }
.spell-content { display: flex; flex-wrap: wrap; align-items: center; gap: 5px 8px; }
.spell-owned { opacity: 0.4; }
.spell-owned .spell-chip { text-decoration: line-through; }
.spell-owned .spell-chip::before { filter: grayscale(1) brightness(0.6); }
.spell-chip {
  font-size: 13px; padding: 3px 10px 3px 7px; border-radius: 3px;
  background: rgba(232, 168, 42, 0.1);
  border: 1px solid rgba(232, 168, 42, 0.35);
  color: var(--parchment);
  overflow-wrap: break-word; text-decoration: none;
  display: inline-flex; align-items: center; min-width: 0;
}
.spell-chip::before {
  content: ""; width: 9px; height: 9px; border-radius: 2px; margin-right: 7px; flex-shrink: 0;
  background: radial-gradient(circle at 65% 30%, #ffd97a, #c98f1f 55%, #6e4a0d);
  box-shadow: inset 0 0 1px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 0, 0, 0.55);
}
@media (pointer: coarse) { .spell-chip { cursor: pointer; } }
.class-pill {
  font-size: 11px; padding: 2px 7px; border-radius: 3px;
  background: rgba(232, 168, 42, 0.08); border: 1px solid rgba(232, 168, 42, 0.25); color: var(--ink-muted);
  white-space: nowrap;
}
`);

class StatusPanel extends HTMLElement {
  #data = null;
  #isMouseDevice = window.matchMedia("(pointer: fine)").matches;

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
      this.#wireEvents();
    }
    this.render();
  }

  get data() { return this.#data; }
  set data(value) {
    this.#data = value;
    this.hidden = !value;
    this.toggleAttribute("wide", !!value?.spells);
    if (this.shadowRoot) this.render();
  }

  // Listening on shadowRoot itself (not `this`/the host) sees the real
  // internal e.target/e.relatedTarget directly -- event retargeting to the
  // host only applies to listeners outside the shadow tree (see
  // tag-input.js).
  #wireEvents() {
    this.shadowRoot.addEventListener("change", (e) => {
      const cb = e.target.closest("input[data-spell-id]");
      if (!cb) return;
      this.dispatchEvent(new CustomEvent("spell-owned-change", {
        detail: { spellId: cb.dataset.spellId, checked: cb.checked },
        bubbles: true, composed: true,
      }));
    });

    if (!this.#isMouseDevice) return; // touch devices: tap navigates to wiki, no hover needed

    this.shadowRoot.addEventListener("mouseover", (e) => {
      const chip = e.target.closest(".spell-chip[data-spell-id]");
      if (!chip) return;
      const spell = this.#data?.spells?.find((s) => s.id === chip.dataset.spellId);
      if (spell) document.getElementById("detail-tooltip")?.show({ name: spell.name, description: spell.description, stats: spellStats(spell) }, chip);
    });
    this.shadowRoot.addEventListener("mouseout", (e) => {
      if (!e.relatedTarget?.closest?.(".spell-chip[data-spell-id]")) {
        document.getElementById("detail-tooltip")?.hide();
      }
    });
    this.shadowRoot.addEventListener("click", (e) => {
      const chip = e.target.closest(".spell-chip[data-spell-id]");
      if (chip) e.preventDefault(); // hover is sufficient on desktop
    });
  }

  #renderSpellList() {
    const { spells, owned, showAllSpells } = this.#data;
    const visible = showAllSpells ? spells : spells.filter((s) => !owned.has(s.id));
    if (!visible.length) return "";
    const rows = visible.map((s) => {
      const isOwned = owned.has(s.id);
      return `
        <div class="spell-row${isOwned ? " spell-owned" : ""}">
          <label class="spell-check"><input type="checkbox" data-spell-id="${s.id}"${isOwned ? " checked" : ""}></label>
          <div class="spell-content">
            <a class="spell-chip" data-spell-id="${s.id}" href="${wikiUrl(s.name)}" target="_blank" rel="noopener">${s.name}</a>
            ${s.classes.map((c) => `<span class="class-pill">${c.cls.charAt(0).toUpperCase() + c.cls.slice(1)} L${c.level}</span>`).join("")}
          </div>
        </div>
      `;
    }).join("");
    return `<div class="status-spell-list">${rows}</div>`;
  }

  render() {
    if (!this.#data) {
      this.shadowRoot.replaceChildren();
      return;
    }
    const { totalGoods, goodsLabel, accessibleCount, levelText, warnings, ownedCount, showAllSpells, spells } = this.#data;
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
      ${spells ? this.#renderSpellList() : ""}
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
