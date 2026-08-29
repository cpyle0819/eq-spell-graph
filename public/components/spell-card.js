// <spell-card>, with `.setData(spell, selectedClasses, pinUrl)` set as one
// atomic call. Renders a spell entry: name + owned checkbox, badges (type/
// mana/skill/class), description, stats, and a footer with a vendor-list
// toggle (fetches api/spell/{id}/vendors on first expand, grouped by zone
// via vendorGroupsHtml() below, same "heading + list" visual language as
// the Items page's own good-card.js; collapsing and re-expanding always
// refetches) plus a "Find in Spell Finder" link. Shares
// the same localStorage-backed owned set as the Spell Finder
// (components.js) —
// marking a spell owned here shows up there and vice versa. `pinUrl` is
// built by class-browser.js (it depends on the page's own level-range),
// not computed here.
import { CardBase, classBadges, fmtDuration, fmtCast, wikiLink } from "./card-base.js";
import { getOwnedSpells, setSpellOwned } from "../components.js";
import { ICON_SHEET_MANIFEST, ICON_CELL_SIZE } from "./icon-sheet-manifest.js";

const EXTRA_SHEET = new CSSStyleSheet();
EXTRA_SHEET.replaceSync(`
/* Quieter than the Spell Finder's checkbox: a small muted text label, not
   just a bare unlabeled checkbox, and pushed to the row's far edge so it
   reads as a secondary control instead of competing with the spell name
   for attention. Brightens on hover/checked the same way .text-action
   does. --ink-muted, not --parch-ink-soft: .spell-header sits on the dark
   stone panel (same as the gold h3 above it), not the parchment scroll
   below. */
/* card-base.js's shared .spell-header is align-items: baseline (right for
   text-only headers, the other three card types) -- overridden to center
   here so the fixed-size icon sits level with the name instead of pinned to
   its text baseline. */
.spell-header { align-items: center; }

/* Spell gem — real per-spell icon art cropped from eqlwiki.com (see
   decisions/spell-icons-real-client-art-exception.md), packed into one
   shared sheet (public/icons/spell-icons.png, built by
   scripts/build-icon-sheet.ts) and positioned via background-position
   rather than one <img> per icon. Falls back to the same decorative
   radial-gradient square zone-card.js's spell-chip uses when a spell has
   no icon key, or its key isn't in the sheet (shouldn't happen day-to-day,
   but the sheet and the graph's icon field are built by separate script
   runs, so a stale sheet is a real possibility, not just theoretical).
   Native sheet-cell size (see icon-sheet-manifest.js's ICON_CELL_SIZE),
   framed with the same two-tone bevel language as the rest of the app's
   raised elements rather than floating unframed. */
.spell-icon, .spell-icon-fallback {
  width: ${ICON_CELL_SIZE}px; height: ${ICON_CELL_SIZE}px; flex-shrink: 0;
  border-radius: 3px;
}
.spell-icon {
  /* Resolved against the *document* that adopted this constructed
     stylesheet, not this module's own file location -- every page lives
     flat under public/ alongside icons/, so "icons/..." (no leading "../")
     is correct here, same as the plain <img src="icons/..."> it replaced. */
  background-image: url("icons/spell-icons.png");
  background-repeat: no-repeat;
  border: 2px solid; border-color: var(--bone-edge-hi) var(--bone-edge-hi) var(--bone-edge-lo) var(--bone-edge-lo);
  box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.5);
}
.spell-icon-fallback {
  background: radial-gradient(circle at 65% 30%, #ffd97a, #c98f1f 55%, #6e4a0d);
  box-shadow: inset 0 0 1px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 0, 0, 0.55);
}
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

.vendor-list { margin-top: 10px; border-top: 1px solid #b5a77e; padding-top: 10px; display: flex; flex-direction: column; gap: 10px; }
.vendor-group + .vendor-group { margin-top: 0; }
/* Zone name as a heading once per zone, vendor names listed underneath --
   same "heading + list" recipe as the Items page's own good-card.js
   (.offer-heading there groups offers under a good; here it groups
   vendors under a zone -- the pivot a spell's own vendor list needs, since
   it spans zones rather than living inside one already-fixed zone). */
.vendor-heading {
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--parch-accent);
  padding-bottom: 3px; margin-bottom: 4px;
  border-bottom: 1px solid var(--parch-accent);
}
.vendor-heading a { color: inherit; text-decoration: none; }
.vendor-heading a:hover, .vendor-heading a:focus-visible { text-decoration: underline; }
.vendor-row { font-size: 13px; color: #4a4232; padding: 2px 0; }
.vendor-hint { font-size: 12px; color: var(--parch-ink-soft); margin-top: 6px; }

.spell-card-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 6px; }
.spell-card-actions .vendor-hint { margin-top: 0; }
.spell-finder-link {
  font-size: 12px; color: var(--parch-accent); text-decoration: none;
  white-space: nowrap; flex-shrink: 0;
}
.spell-finder-link:hover { text-decoration: underline; }
`);

// Same grouped-by-zone shape as the Items page's own good-card.js
// (heading + list underneath) and ingredient-card.js's Sold By section --
// a zone heading (unknown zones grouped together, sorted last) with its
// vendor names listed below, so a spell sold in three zones reads as three
// trips rather than a flat wall of NPC names. `?to=<zone label>` deep-links
// Maps (maps.js's applyQueryParams) straight to that destination.
function vendorGroupsHtml(vendors) {
  const groups = new Map();
  for (const v of vendors) {
    const key = v.zone ? v.zone.label : null;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(v.npc.label);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => (a === null ? 1 : b === null ? -1 : a.localeCompare(b)))
    .map(([zoneLabel, npcLabels]) => `
      <div class="vendor-group">
        <div class="vendor-heading">${zoneLabel ? `<a href="maps.html?to=${encodeURIComponent(zoneLabel)}">${zoneLabel}</a>` : "Unknown Zone"}</div>
        ${npcLabels.map((label) => `<div class="vendor-row">${label}</div>`).join("")}
      </div>
    `)
    .join("");
}

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
      if (e.target.closest(".vendor-heading a")) return; // let the Maps link navigate normally, same as the other two
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
      list.innerHTML = vendors.length ? vendorGroupsHtml(vendors) : '<div class="vendor-row" style="color:#5a4428;">No vendors found</div>';
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

    const iconPos = spell.icon ? ICON_SHEET_MANIFEST[spell.icon] : null;
    const iconHtml = iconPos
      ? `<span class="spell-icon" style="background-position: -${iconPos.x}px -${iconPos.y}px;"></span>`
      : `<span class="spell-icon-fallback"></span>`;

    this.shadowRoot.innerHTML = `
      <div class="spell-header">
        ${iconHtml}
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
          <a class="spell-finder-link" href="${this.#pinUrl}">Find in Spells →</a>
        </div>
      </div>
    `;
  }
}

customElements.define("spell-card", SpellCard);
