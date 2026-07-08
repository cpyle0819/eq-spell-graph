// <spell-tooltip role="tooltip" aria-hidden="true"></spell-tooltip> — a
// page torn from the spellbook (parchment), shown on hover over a spell
// chip in the Spell Finder's results. One instance per page (Spell Finder
// only). Imperative API instead of attributes/properties since it's driven
// by hover timing, not declarative state: `.show(spell, anchorEl)` renders
// spell details and positions itself near anchorEl (flipping above if it
// would overflow the viewport bottom); `.hide()` fades it out.
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

class SpellTooltip extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
    }
  }

  show(spell, anchorEl) {
    const dur = spell.duration
      ? spell.duration.replace(/\s+minutes?/i, "m").replace(/\s+seconds?/i, "s").replace(/instant/i, "Instant")
      : null;

    const stats = [];
    if (spell.spellType) stats.push({ text: spell.spellType, hi: true });
    if (spell.mana != null) stats.push({ text: `${spell.mana} mana` });
    if (spell.targetType) stats.push({ text: spell.targetType });
    if (dur) stats.push({ text: dur });
    if (spell.castTime != null) stats.push({ text: `${spell.castTime.toFixed(1)}s cast` });
    if (spell.resist && !/unresist/i.test(spell.resist)) stats.push({ text: `${spell.resist} resist` });
    if (spell.skill) stats.push({ text: spell.skill });
    if (spell.spellLine) stats.push({ text: spell.spellLine });

    this.shadowRoot.innerHTML = `
      <div class="tt-name">${spell.name}</div>
      ${spell.description ? `<div class="tt-desc">${spell.description}</div>` : ""}
      ${stats.length ? `<div class="tt-stats">${stats.map((s) => `<span class="tt-stat${s.hi ? " highlight" : ""}">${s.text}</span>`).join("")}</div>` : ""}
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

customElements.define("spell-tooltip", SpellTooltip);
