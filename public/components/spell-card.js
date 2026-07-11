// <spell-card>, with `.setData(spell, selectedClasses, pinUrl)` set as one
// atomic call. Renders a spell entry: name + owned checkbox, badges (type/
// mana/skill/class), description, stats, and a footer with a vendor-list
// toggle (fetches api/spell/{id}/vendors on first expand; collapsing and
// re-expanding refetches, same as before) plus a "Find in Spell Finder"
// link. Shares the same localStorage-backed owned set as the Spell Finder
// (components.js) —
// marking a spell owned here shows up there and vice versa. `pinUrl` is
// built by class-browser.js (it depends on the page's own level-select),
// not computed here.
import { CardBase, classBadges, fmtDuration, fmtCast, wikiLink } from "./card-base.js";
import { getOwnedSpells, setSpellOwned } from "../components.js";

const EXTRA_SHEET = new CSSStyleSheet();
EXTRA_SHEET.replaceSync(`
/* Quieter than the Spell Finder's checkbox: a small muted text label, not
   just a bare unlabeled checkbox, and pushed to the row's far edge so it
   reads as a secondary control instead of competing with the spell name
   for attention. Brightens on hover/checked the same way .text-action
   does. --ink-muted, not --parch-ink-soft: .spell-header sits on the dark
   stone panel (same as the gold h3 above it), not the parchment scroll
   below. */
.spell-check { display: flex; align-items: center; }
.spell-check input { cursor: pointer; accent-color: var(--gold); width: 15px; height: 15px; }
.spell-check-labeled {
  margin-left: auto; gap: 6px; font-size: 11px; color: var(--ink-muted);
  text-transform: uppercase; letter-spacing: 0.06em; cursor: pointer;
  flex-shrink: 0;
}
.spell-check-labeled input { width: 12px; height: 12px; accent-color: var(--ink-muted); }
.spell-check-labeled:hover { color: var(--gold); }
.spell-check-labeled:has(input:checked) { color: var(--gold); }
.spell-check-labeled:has(input:checked) input { accent-color: var(--gold); }

.vendor-list { margin-top: 10px; border-top: 1px solid #b5a77e; padding-top: 10px; display: flex; flex-direction: column; gap: 4px; }
.vendor-row { display: flex; gap: 8px; font-size: 13px; color: #4a4232; padding: 2px 0; }
.zone-tag { color: var(--parch-accent); }
.vendor-hint { font-size: 12px; color: var(--parch-ink-soft); margin-top: 6px; }

.spell-card-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 6px; }
.spell-card-actions .vendor-hint { margin-top: 0; }
.spell-finder-link {
  font-size: 12px; color: var(--parch-accent); text-decoration: none;
  white-space: nowrap; flex-shrink: 0;
}
.spell-finder-link:hover { text-decoration: underline; }
`);

class SpellCard extends CardBase {
  static extraSheet = EXTRA_SHEET;

  #spell = null;
  #selected = [];
  #pinUrl = "";

  setData(spell, selected, pinUrl) {
    this.#spell = spell;
    this.#selected = selected;
    this.#pinUrl = pinUrl;
    if (this.shadowRoot) this.render();
  }

  // Listening on shadowRoot itself (not `this`/the host) sees the real
  // internal e.target directly -- event retargeting to the host only
  // applies to listeners outside the shadow tree (see tag-input.js).
  wireEvents() {
    this.shadowRoot.addEventListener("change", (e) => {
      const cb = e.target.closest(".spell-check input");
      if (!cb) return;
      setSpellOwned(this.#spell.id, cb.checked);
    });

    this.shadowRoot.addEventListener("click", async (e) => {
      if (e.target.closest(".spell-finder-link")) return; // let the link navigate normally
      if (e.target.closest(".wiki-link")) return; // let the link navigate normally, not a vendor-toggle click
      if (e.target.closest(".spell-check")) return; // checkbox has its own handler, not a vendor-toggle click
      const scroll = this.shadowRoot.querySelector(".spell-scroll");
      const existing = scroll.querySelector(".vendor-list");
      if (existing) {
        existing.remove();
        this.shadowRoot.querySelector(".vendor-hint").textContent = "Click to show vendors";
        return;
      }
      this.shadowRoot.querySelector(".vendor-hint").textContent = "Loading...";
      const vendors = await fetch(`api/spell/${encodeURIComponent(this.#spell.id)}/vendors`).then((r) => r.json());
      this.shadowRoot.querySelector(".vendor-hint").textContent = "Click to hide vendors";
      const list = document.createElement("div");
      list.className = "vendor-list";
      list.innerHTML = vendors.length
        ? vendors.map((v) => `<div class="vendor-row"><span>${v.npc.label}</span><span class="zone-tag">— ${v.zone?.label ?? "unknown zone"}</span></div>`).join("")
        : '<div class="vendor-row" style="color:#5a4428;">No vendors found</div>';
      scroll.appendChild(list);
    });
  }

  render() {
    const spell = this.#spell;
    if (!spell) return;
    const selected = this.#selected;

    const levelLookup = (c) => spell.class_levels.find((cl) => cl.class === c)?.level;
    const badges = [];
    if (spell.spellType) badges.push(`<span class="spell-badge type-badge">${spell.spellType}</span>`);
    if (spell.mana != null) badges.push(`<span class="spell-badge mana-badge">${spell.mana} mana</span>`);
    if (spell.skill) badges.push(`<span class="spell-badge skill-badge">${spell.skill}</span>`);
    badges.push(classBadges(spell.class_levels.map((cl) => cl.class), selected, levelLookup));

    const stats = [];
    if (spell.targetType) stats.push(`<span class="stat-tag">Target: ${spell.targetType}</span>`);
    const dur = fmtDuration(spell.duration);
    if (dur) stats.push(`<span class="stat-tag">Duration: ${dur}</span>`);
    const cast = fmtCast(spell.castTime);
    if (cast) stats.push(`<span class="stat-tag">${cast}</span>`);
    if (spell.resist && !/unresist/i.test(spell.resist)) stats.push(`<span class="stat-tag">Resist: ${spell.resist}</span>`);
    if (spell.spellLine) stats.push(`<span class="stat-tag">Line: ${spell.spellLine}</span>`);

    const isOwned = getOwnedSpells().has(spell.id);

    this.shadowRoot.innerHTML = `
      <div class="spell-header">
        <h3>${spell.label}</h3>
        ${wikiLink(spell.label)}
        <label class="spell-check spell-check-labeled"><input type="checkbox" data-spell-id="${spell.id}"${isOwned ? " checked" : ""}> Owned</label>
      </div>
      <div class="spell-scroll">
        <div class="spell-badges">${badges.join("")}</div>
        ${spell.description ? `<p class="spell-desc">${spell.description}</p>` : ""}
        ${stats.length ? `<div class="spell-stats">${stats.join("")}</div>` : ""}
        <div class="spell-card-actions">
          <span class="vendor-hint">Click to show vendors</span>
          <a class="spell-finder-link" href="${this.#pinUrl}">Find in Spell Finder →</a>
        </div>
      </div>
    `;
  }
}

customElements.define("spell-card", SpellCard);
