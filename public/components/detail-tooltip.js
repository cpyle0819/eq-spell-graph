// <detail-tooltip role="tooltip" aria-hidden="true"></detail-tooltip> — a
// page torn from a parchment scroll, shown near any hovered chip that wants
// to show more than fits inline. Generic on purpose: renders whatever
// `{ name, description?, stats? }` shape it's given, with zero knowledge of
// what kind of entity it's showing. Callers own deciding what counts as an
// interesting "stat" for their own entity type and pre-build the `stats`
// array themselves (zone-card.js's spellStats() for spells, e.g.) — this
// component only lays out name/description/chips. Previously named
// spell-tooltip and hardcoded spell-field extraction internally; renamed
// and that extraction moved out to zone-card.js once quest-card.js also
// needed it for item rewards, where "spell tooltip" was semantically wrong.
//
// One instance per page (each page that wants hover detail includes its
// own <detail-tooltip id="detail-tooltip">). Imperative API instead of
// attributes/properties since it's driven by hover timing, not declarative
// state: `.show(entity, anchorEl)` renders and positions itself near
// anchorEl (flipping above if it would overflow the viewport bottom);
// `.hide()` fades it out.
import { RESET_CSS } from "./reset.js";

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
${RESET_CSS}
:host {
  display: block;
  position: fixed;
  z-index: 1000;
  background: var(--parch-tex), linear-gradient(180deg, #ece3c8, var(--parch-bg));
  border: 1px solid var(--parch-line);
  border-radius: 2px;
  padding: 14px 18px !important;
  max-width: 320px;
  min-width: 220px;
  box-shadow: inset 0 0 22px rgba(122, 96, 42, 0.3), 0 10px 34px rgba(0, 0, 0, 0.75);
  pointer-events: none;
  opacity: 0;
  transition: opacity 100ms ease-out;
}
:host(.visible) { opacity: 1; }
:host::before, :host::after {
  content: "";
  position: absolute; top: -3px; bottom: -3px; width: 11px;
  border-radius: 5px;
  background:
    radial-gradient(3px 3px at 50% 7px, rgba(0, 0, 0, 0.6), transparent 70%),
    radial-gradient(3px 3px at 50% calc(100% - 7px), rgba(0, 0, 0, 0.6), transparent 70%),
    linear-gradient(90deg, var(--wood-2), var(--wood-1) 40%, var(--wood-1) 60%, var(--wood-2));
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.55);
}
:host::before { left: -11px; }
:host::after { right: -11px; }
.tt-name { font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--parch-accent); margin-bottom: 6px; }
.tt-desc { font-size: 12px; color: var(--parch-ink); font-style: italic; line-height: 1.45; margin-bottom: 8px; }
.tt-stats { display: flex; flex-wrap: wrap; gap: 4px; }
.tt-stat { font-size: 11px; padding: 2px 7px; border-radius: 3px; background: rgba(0, 0, 0, 0.06); border: 1px solid #b5a77e; color: #4a4232; }
.tt-stat.highlight { color: var(--parch-accent); border-color: var(--parch-accent); }
`);

class DetailTooltip extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
    }
  }

  // entity: { name: string, description?: string, stats?: { text, highlight? }[] }
  // -- the caller has already shaped this from whatever domain object it
  // actually holds (a spell, an item, ...); this method has no field-level
  // knowledge of any entity type.
  show(entity, anchorEl) {
    const stats = entity.stats || [];
    this.shadowRoot.innerHTML = `
      <div class="tt-name">${entity.name}</div>
      ${entity.description ? `<div class="tt-desc">${entity.description}</div>` : ""}
      ${stats.length ? `<div class="tt-stats">${stats.map((s) => `<span class="tt-stat${s.highlight ? " highlight" : ""}">${s.text}</span>`).join("")}</div>` : ""}
    `;

    this.positionNear(anchorEl);
    this.setAttribute("aria-hidden", "false");
    this.classList.add("visible");
  }

  hide() {
    this.classList.remove("visible");
    this.setAttribute("aria-hidden", "true");
  }

  positionNear(el) {
    const r = el.getBoundingClientRect();
    const tw = 320, th = this.offsetHeight || 120;
    const vw = window.innerWidth, vh = window.innerHeight;
    let left = r.left;
    let top = r.bottom + 8;
    if (left + tw > vw - 12) left = vw - tw - 12;
    if (top + th > vh - 12) top = r.top - th - 8;
    this.style.left = `${Math.max(8, left)}px`;
    this.style.top = `${Math.max(8, top)}px`;
  }
}

customElements.define("detail-tooltip", DetailTooltip);
