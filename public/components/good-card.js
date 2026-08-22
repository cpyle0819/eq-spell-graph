// <good-card>, with `.setData(good, { selectedClasses, showOutOfEra })` set
// as one atomic call. The Items page's one result card (issue: Items page
// rework, "find the item, vendor is a byproduct of that") -- one card per
// spell or item (src/graph.ts's rankGoods(), a `GoodResult`), with every
// zone/vendor that actually sells it rendered as an "offer" underneath, best
// (safe faction, fewest hops) first.
//
// An item with no vendor at all (drop/quest/craft-only) still renders --
// `offers` is just empty, and the card says so plainly instead of hiding the
// item, since finding it doesn't depend on having a seller.
import { RESET_CSS } from "./reset.js";
import { WIKI_LINK_CSS, wikiLink, classBadges, fmtDuration, fmtCast } from "./card-base.js";
import { itemStats } from "./item-chip.js";
import { getOwnedSpells, setSpellOwned } from "../components.js";

const FACTION_LABELS = { safe: "amiable", neutral: "indifferent", wont_sell: "dubious", kos: "scowls" };
// EQ /consider verbiage; the title attribute carries the practical meaning
const FACTION_TITLES = {
  safe: "Regards you as an ally -- sells at normal prices",
  neutral: "Regards you indifferently -- sells at normal prices",
  wont_sell: "Looks upon you dubiously -- merchants won't sell to you",
  kos: "Scowls at you, ready to attack -- kill on sight",
};
const DIMENSION_LABELS = { race: "race", class: "class", deity: "deity" };
const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

// Same text for the badge and the LED dot, one tooltip two hover targets.
// Appends *why* only for wont_sell/kos -- same convention as zone-card.js's
// own factionTooltip(), duplicated here since each component's shadow root
// owns its own stylesheet/markup.
function factionTooltip(faction, factionReasons) {
  const base = FACTION_TITLES[faction] || "";
  if (!factionReasons?.length) return base;
  const reasons = factionReasons
    .map((fr) => `your ${titleCase(fr.value)} ${DIMENSION_LABELS[fr.dimension]}`)
    .join(" and ");
  return `${base} (${reasons} ${factionReasons.length > 1 ? "are" : "is"} disliked here)`;
}

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
${RESET_CSS}
${WIKI_LINK_CSS}
:host {
  display: block;
  padding: 14px 20px !important;
  background: var(--marble-tex), linear-gradient(180deg, var(--stone-1), var(--stone-2));
  border: 4px solid;
  border-color: var(--edge-hi) var(--edge-hi) var(--edge-lo) var(--edge-lo);
  border-radius: 3px;
  box-shadow: inset -1px 1px 0 rgba(255, 255, 255, 0.08), inset 1px -1px 0 rgba(0, 0, 0, 0.45);
  transition: box-shadow 150ms;
}
:host(:hover) {
  box-shadow: inset -1px 1px 0 rgba(255, 255, 255, 0.08), inset 1px -1px 0 rgba(0, 0, 0, 0.45), inset 0 0 0 999px rgba(255, 255, 255, 0.05);
}

.good-header { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
.good-name {
  font-family: var(--font-display); color: var(--parchment); font-size: 16px; font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}
.type-badge {
  font-size: 11px; padding: 2px 9px; border-radius: 3px;
  background: var(--panel-deep);
  border: 1px solid; border-color: var(--edge-lo) var(--edge-lo) #5a5570 #5a5570;
  color: var(--ink-muted);
}
.good-check { margin-left: auto; display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.06em; cursor: pointer; }
.good-check input { cursor: pointer; accent-color: var(--gold); width: 15px; height: 15px; }
.good-check:hover, .good-check:has(input:checked) { color: var(--gold); }
.good-check:has(input:checked) input { accent-color: var(--gold); }

.good-scroll {
  position: relative;
  padding: 12px 20px; border-radius: 2px;
  background: var(--parch-tex), linear-gradient(180deg, #ece3c8, var(--parch-bg));
  border: 1px solid var(--parch-line);
  box-shadow: inset 0 0 22px rgba(122, 96, 42, 0.3), 0 2px 6px rgba(0, 0, 0, 0.45);
  color: var(--parch-ink);
}
.good-scroll::before, .good-scroll::after {
  content: "";
  position: absolute; top: -3px; bottom: -3px; width: 11px;
  border-radius: 5px;
  background:
    radial-gradient(3px 3px at 50% 7px, rgba(0, 0, 0, 0.6), transparent 70%),
    radial-gradient(3px 3px at 50% calc(100% - 7px), rgba(0, 0, 0, 0.6), transparent 70%),
    linear-gradient(90deg, var(--wood-2), var(--wood-1) 40%, var(--wood-1) 60%, var(--wood-2));
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.55);
}
.good-scroll::before { left: -11px; }
.good-scroll::after { right: -11px; }

.good-badges { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 6px; }
.good-badge { font-size: 11px; padding: 2px 7px; border-radius: 3px; }
.mana-badge  { background: rgba(30, 64, 175, 0.08); color: #1e40af; border: 1px solid rgba(30, 64, 175, 0.35); }
.skill-badge { background: rgba(0, 0, 0, 0.05);     color: #4a4232; border: 1px solid var(--parch-line); }
.class-badge { background: rgba(90, 60, 20, 0.08); color: #5a3c14; border: 1px solid rgba(90, 60, 20, 0.3); }
.good-desc { font-size: 13px; color: #4a4232; margin: 0 0 8px; line-height: 1.5; font-style: italic; }
.good-stats { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
.stat-tag {
  font-size: 11px; color: #4a4232; background: rgba(0, 0, 0, 0.05);
  border: 1px solid #b5a77e;
  padding: 2px 8px; border-radius: 3px;
}
.stat-tag.highlight { background: rgba(90, 60, 20, 0.1); font-weight: 700; }

.no-offers { font-size: 12px; color: var(--parch-ink-soft); font-style: italic; }

.offer-list { display: flex; flex-direction: column; gap: 10px; }
.offer-block + .offer-block { margin-top: 0; }
.offer-heading { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding-bottom: 5px; margin-bottom: 6px; border-bottom: 2px solid var(--parch-accent); }
.offer-zone-name { position: relative; padding-left: 15px; font-size: 13px; font-weight: 700; color: #4a4232; }
.offer-zone-name::before {
  content: ""; position: absolute; left: 0; top: 50%; transform: translateY(-50%);
  width: 8px; height: 8px; border-radius: 50%;
  background: radial-gradient(circle at 65% 30%, #b8b4c8, #6e6885 65%, #4a4658);
}
.offer-block[data-faction="safe"]      .offer-zone-name::before { background: radial-gradient(circle at 65% 30%, #7dffb0, #22c55e 60%, #157a3c); }
.offer-block[data-faction="neutral"]   .offer-zone-name::before { background: radial-gradient(circle at 65% 30%, #ffd97a, #f59e0b 60%, #9a5f05); }
.offer-block[data-faction="wont_sell"] .offer-zone-name::before { background: radial-gradient(circle at 65% 30%, #ffb37a, #f97316 60%, #9a3f05); }
.offer-block[data-faction="kos"]       .offer-zone-name::before { background: radial-gradient(circle at 65% 30%, #ff8a8a, #ef4444 60%, #7a1515); }
.offer-block[data-faction="wont_sell"] { opacity: 0.7; }
.offer-block[data-faction="kos"] { opacity: 0.5; }
.offer-block[data-era-hidden] { display: none; }

.offer-tag {
  font-size: 10px; padding: 2px 7px; border-radius: 3px;
  text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;
  cursor: help;
}
.offer-tag.hops { background: rgba(0, 0, 0, 0.06); color: #6a5c3c; text-transform: none; font-weight: 400; letter-spacing: normal; }
.offer-tag.faction.wont_sell { background: rgba(249, 115, 22, 0.15); color: #b3540f; }
.offer-tag.faction.kos       { background: rgba(239, 68, 68, 0.15); color: #b3271f; }
.offer-tag.era { background: rgba(239, 68, 68, 0.15); color: #b3271f; }

.offer-vendors { display: flex; flex-wrap: wrap; gap: 5px 8px; }
.offer-vendor-entry { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 6px; font-size: 12px; color: #4a4232; }
.offer-class-pill {
  font-size: 10px; padding: 1px 6px; border-radius: 3px;
  background: rgba(90, 60, 20, 0.08); border: 1px solid rgba(90, 60, 20, 0.3); color: #5a3c14;
}
.offers-toggle { margin-top: 8px; font-size: 12px; color: var(--parch-accent); background: none; border: none; cursor: pointer; padding: 0; text-decoration: underline; }
`);

class GoodCard extends HTMLElement {
  #good = null;
  #selectedClasses = [];
  #showOutOfEra = false;
  #expanded = false;

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
      this.#wireEvents();
    }
    this.render();
  }

  setData(good, { selectedClasses = [], showOutOfEra = false } = {}) {
    this.#good = good;
    this.#selectedClasses = selectedClasses;
    this.#showOutOfEra = showOutOfEra;
    if (this.shadowRoot) this.render();
  }

  #wireEvents() {
    this.shadowRoot.addEventListener("change", (e) => {
      const cb = e.target.closest(".good-check input");
      if (!cb) return;
      setSpellOwned(this.#good.id, cb.checked);
      this.dispatchEvent(new CustomEvent("good-owned-change", {
        detail: { goodId: this.#good.id, checked: cb.checked }, bubbles: true, composed: true,
      }));
    });
    this.shadowRoot.addEventListener("click", (e) => {
      if (e.target.closest(".offers-toggle")) {
        this.#expanded = !this.#expanded;
        this.render();
      }
    });
  }

  #renderOffer(offer) {
    const hopsText = offer.noOrigin ? "" : offer.hops === null ? "unreachable" : offer.hops === 0 ? "you are here" : `${offer.hops} hop${offer.hops > 1 ? "s" : ""}`;
    const tooltip = factionTooltip(offer.faction, offer.factionReasons);
    const eraTitle = offer.era ? `${offer.era} content isn't available in the current era yet` : "Not available in the current era yet";
    const vendorsHtml = offer.vendors.map((v) => `
      <span class="offer-vendor-entry">${v.name}${v.classes.map((c) => `<span class="offer-class-pill">${c}</span>`).join("")}</span>
    `).join("");
    return `
      <div class="offer-block" data-faction="${offer.faction}"${offer.outOfEra && !this.#showOutOfEra ? " data-era-hidden" : ""}>
        <div class="offer-heading">
          <span class="offer-zone-name">${offer.zoneName}</span>
          ${offer.wikiTitle ? wikiLink(offer.wikiTitle) : ""}
          ${offer.outOfEra ? `<span class="offer-tag era" title="${eraTitle}">Out of Era</span>` : ""}
          ${offer.faction !== "safe" ? `<span class="offer-tag faction ${offer.faction}" title="${tooltip}">${FACTION_LABELS[offer.faction] || offer.faction}</span>` : ""}
          ${hopsText ? `<span class="offer-tag hops">${hopsText}</span>` : ""}
        </div>
        <div class="offer-vendors">${vendorsHtml}</div>
      </div>
    `;
  }

  render() {
    const g = this.#good;
    if (!g) return;
    const isSpell = g.kind === "spell";

    const badges = [];
    if (g.mana != null) badges.push(`<span class="good-badge mana-badge">${g.mana} mana</span>`);
    if (g.skill) badges.push(`<span class="good-badge skill-badge">${g.skill}</span>`);
    if (isSpell) {
      const levelLookup = (c) => g.spellClasses.find((cl) => cl.cls === c)?.level;
      badges.push(classBadges(g.spellClasses.map((cl) => cl.cls), this.#selectedClasses, levelLookup));
    }

    const stats = [];
    if (isSpell) {
      if (g.targetType) stats.push({ text: `Target: ${g.targetType}` });
      const dur = fmtDuration(g.duration);
      if (dur) stats.push({ text: `Duration: ${dur}` });
      const cast = fmtCast(g.castTime);
      if (cast) stats.push({ text: cast });
      if (g.resist && !/unresist/i.test(g.resist)) stats.push({ text: `Resist: ${g.resist}` });
      if (g.spellLine) stats.push({ text: `Line: ${g.spellLine}` });
    } else {
      for (const s of itemStats(g)) stats.push(s);
    }

    const isOwned = isSpell && getOwnedSpells().has(g.id);
    const checkHtml = isSpell
      ? `<label class="good-check"><input type="checkbox" data-good-id="${g.id}"${isOwned ? " checked" : ""}> Owned</label>`
      : "";

    const visibleOffers = this.#showOutOfEra ? g.offers : g.offers.filter((o) => !o.outOfEra);
    const shown = this.#expanded ? g.offers : g.offers.slice(0, 3);
    const hiddenCount = g.offers.length - shown.length;
    let offersHtml;
    if (!g.offers.length) {
      offersHtml = `<div class="no-offers">No known vendor${g.source ? ` -- ${g.source}` : "."}</div>`;
    } else if (!visibleOffers.length) {
      offersHtml = `<div class="no-offers">Only sold in out-of-era zones right now.</div>`;
    } else {
      offersHtml = `
        <div class="offer-list">${shown.map((o) => this.#renderOffer(o)).join("")}</div>
        ${hiddenCount > 0 ? `<button type="button" class="offers-toggle">Show ${hiddenCount} more location${hiddenCount > 1 ? "s" : ""}</button>` : ""}
      `;
    }

    this.shadowRoot.innerHTML = `
      <div class="good-header">
        <span class="good-name">${g.name}</span>
        ${wikiLink(g.name)}
        <span class="type-badge">${g.type}</span>
        ${checkHtml}
      </div>
      <div class="good-scroll">
        ${badges.length ? `<div class="good-badges">${badges.join("")}</div>` : ""}
        ${isSpell && g.description ? `<p class="good-desc">${g.description}</p>` : ""}
        ${stats.length ? `<div class="good-stats">${stats.map((s) => `<span class="stat-tag${s.highlight ? " highlight" : ""}">${s.text}</span>`).join("")}</div>` : ""}
        ${offersHtml}
      </div>
    `;
  }
}

customElements.define("good-card", GoodCard);
