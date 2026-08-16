// <zone-card faction="safe|neutral|wont_sell|kos">, with `.setData(ranking)`.
// Renders the zone header (name + wiki link + faction LED dot, faction
// badge, goods-count badge, hops badge), an optional nested <route-path
// variant="stone">, and the scroll list: `ranking.vendors` (Spells) is a
// compact list of vendor name + the class(es) they cover, since a class
// vendor's inventory is the class's whole spell list, not a hand-picked
// subset (decisions/class-spell-vendor-model.md) -- the spell detail itself
// lives in status-panel.js's own deduplicated checklist, not here.
// `ranking.items` (Items/Armor/etc, grouped by vendor -- issue #45, plain
// item-chip, no owned concept) is the other shape a ranking can carry; the
// two are mutually exclusive, exactly one set per ranking (src/graph.ts's
// rankZones()/rankZonesByCategory() -- see #renderVendorScroll()/
// #renderItemScroll()). The header's wiki link uses `ranking.wikiTitle`
// (src/graph.ts's rankZones, from the zone node's migration-023
// `wiki_title` field) rather than deriving a URL from `zoneName` — several
// zone labels don't match their eqlwiki.com page title 1:1 (see decisions/
// zone-naming-mismatches.md).
import { RESET_CSS } from "./reset.js";
import { WIKI_LINK_CSS, wikiLink } from "./card-base.js";
import { itemChipTag, hydrateItemChips } from "./item-chip.js";

const FACTION_LABELS = { safe: "amiable", neutral: "indifferent", wont_sell: "dubious", kos: "scowls" };
// EQ /consider verbiage; the title attribute carries the practical meaning
const FACTION_TITLES = {
  safe: "Regards you as an ally — sells at normal prices",
  neutral: "Regards you indifferently — sells at normal prices",
  wont_sell: "Looks upon you dubiously — merchants won't sell to you",
  kos: "Scowls at you, ready to attack — kill on sight",
};
const DIMENSION_LABELS = { race: "race", class: "class", deity: "deity" };
const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

// Same text for the badge and the LED dot (zone-name's ::before — a
// pseudo-element can't carry its own title, so zone-name's covers it) —
// one tooltip, two hover targets. Appends *why* only for wont_sell/kos.
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
  position: relative;
  padding: 14px 20px !important;
  background: var(--marble-tex), linear-gradient(180deg, var(--stone-1), var(--stone-2));
  border: 4px solid;
  border-color: var(--edge-hi) var(--edge-hi) var(--edge-lo) var(--edge-lo);
  border-radius: 3px;
  box-shadow: inset -1px 1px 0 rgba(255, 255, 255, 0.08), inset 1px -1px 0 rgba(0, 0, 0, 0.45);
  transition: box-shadow 150ms;
}
/* Brighten via box-shadow, not filter -- filter forces its own compositing
   layer, which briefly desyncs the hovered card's own border from its
   layout position during the transition (visible as a flicker at the
   edges). box-shadow paints in the normal flow, so it doesn't. */
:host(:hover) {
  box-shadow: inset -1px 1px 0 rgba(255, 255, 255, 0.08), inset 1px -1px 0 rgba(0, 0, 0, 0.45), inset 0 0 0 999px rgba(255, 255, 255, 0.05);
}
:host([faction="wont_sell"]) { opacity: 0.6; }
:host([faction="kos"]) { opacity: 0.35; }

.zone-card-header { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; }
.zone-name {
  position: relative; padding-left: 17px;
  font-family: var(--font-display);
  font-size: 19px; font-weight: 700; color: var(--parchment);
  letter-spacing: 0.02em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}
/* LED dot's specular highlight biased top-right, matching the app's light
   source (same reasoning as the spell gem below). */
.zone-name::before {
  content: ""; position: absolute; left: 0; top: 50%; transform: translateY(-50%);
  width: 9px; height: 9px; border-radius: 50%;
  background: radial-gradient(circle at 65% 30%, #b8b4c8, #6e6885 65%, #4a4658);
  box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.5);
}
:host([faction="safe"])      .zone-name::before { background: radial-gradient(circle at 65% 30%, #7dffb0, #22c55e 60%, #157a3c); box-shadow: 0 0 6px rgba(34, 197, 94, 0.75), inset 0 0 2px rgba(0, 0, 0, 0.4); }
:host([faction="neutral"])   .zone-name::before { background: radial-gradient(circle at 65% 30%, #ffd97a, #f59e0b 60%, #9a5f05); box-shadow: 0 0 6px rgba(245, 158, 11, 0.75), inset 0 0 2px rgba(0, 0, 0, 0.4); }
:host([faction="wont_sell"]) .zone-name::before { background: radial-gradient(circle at 65% 30%, #ffb37a, #f97316 60%, #9a3f05); box-shadow: 0 0 6px rgba(249, 115, 22, 0.75), inset 0 0 2px rgba(0, 0, 0, 0.4); }
:host([faction="kos"])       .zone-name::before { background: radial-gradient(circle at 65% 30%, #ff8a8a, #ef4444 60%, #7a1515); box-shadow: 0 0 6px rgba(239, 68, 68, 0.9), inset 0 0 2px rgba(0, 0, 0, 0.4); }

.zone-badge {
  font-size: 12px; padding: 3px 10px; border-radius: 3px;
  background: var(--panel-deep);
  border: 1px solid; border-color: var(--edge-lo) var(--edge-lo) #5a5570 #5a5570;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
  color: var(--ink-muted);
  font-variant-numeric: tabular-nums;
}
.zone-badge.hops { color: #c9a25e; }

/* Faction badges — worded like EQ /consider results. Dark backing under
   the tint keeps badge text ≥4.5:1 on the light stone. */
.faction-badge {
  font-size: 11px; padding: 3px 9px; border-radius: 3px;
  text-transform: uppercase; font-weight: 700; letter-spacing: 0.06em;
  cursor: help;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.6);
}
.faction-badge.safe      { background: linear-gradient(rgba(34, 197, 94, 0.16), rgba(34, 197, 94, 0.16)), rgba(10, 9, 15, 0.6);  color: #43dd81; border: 1px solid rgba(34, 197, 94, 0.4); }
.faction-badge.neutral   { background: linear-gradient(rgba(245, 158, 11, 0.16), rgba(245, 158, 11, 0.16)), rgba(10, 9, 15, 0.6); color: #fbaf1e; border: 1px solid rgba(245, 158, 11, 0.4); }
.faction-badge.wont_sell { background: linear-gradient(rgba(249, 115, 22, 0.16), rgba(249, 115, 22, 0.16)), rgba(10, 9, 15, 0.6); color: #fb8534; border: 1px solid rgba(249, 115, 22, 0.4); }
.faction-badge.kos       { background: linear-gradient(rgba(239, 68, 68, 0.16), rgba(239, 68, 68, 0.16)), rgba(10, 9, 15, 0.6);  color: #ff6b6b; border: 1px solid rgba(239, 68, 68, 0.4); }

/* Same dark-red "warning, not metadata" register as quest-card's own
   out-of-era badge (decisions/quest-era-flagging.md), adapted to this
   card's dark stone background the way the faction badges above already
   are -- reuses the kos badge's exact palette since both mean "you can't
   actually use this result right now." */
.era-badge {
  font-size: 11px; padding: 3px 9px; border-radius: 3px;
  text-transform: uppercase; font-weight: 700; letter-spacing: 0.06em;
  cursor: help; text-shadow: 0 1px 1px rgba(0, 0, 0, 0.6);
  background: linear-gradient(rgba(239, 68, 68, 0.16), rgba(239, 68, 68, 0.16)), rgba(10, 9, 15, 0.6);
  color: #ff6b6b; border: 1px solid rgba(239, 68, 68, 0.4);
}

/* route-path's own stone-variant margin-bottom (public/components/
   route-path.js) already supplies the gap above .spell-scroll when a
   route is present -- this margin-top covers the header-directly-to-
   spell-scroll case when there's no route. */
.spell-scroll {
  position: relative;
  margin-top: 12px;
  padding: 12px 20px; border-radius: 2px;
  background: var(--parch-tex), linear-gradient(180deg, #ece3c8, var(--parch-bg));
  border: 1px solid var(--parch-line);
  box-shadow: inset 0 0 22px rgba(122, 96, 42, 0.3), 0 2px 6px rgba(0, 0, 0, 0.45);
  color: var(--parch-ink);
}
.spell-scroll::before, .spell-scroll::after {
  content: "";
  position: absolute; top: -3px; bottom: -3px; width: 11px;
  border-radius: 5px;
  background:
    radial-gradient(3px 3px at 50% 7px, rgba(0, 0, 0, 0.6), transparent 70%),
    radial-gradient(3px 3px at 50% calc(100% - 7px), rgba(0, 0, 0, 0.6), transparent 70%),
    linear-gradient(90deg, var(--wood-2), var(--wood-1) 40%, var(--wood-1) 60%, var(--wood-2));
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.55);
}
.spell-scroll::before { left: -11px; }
.spell-scroll::after { right: -11px; }

.spell-vendor-list { display: flex; flex-direction: column; gap: 14px; }
/* Vendor name as a heading once per vendor (issue #45), goods they sell
   listed underneath. Items only -- Spells' own vendor list (.vendor-entry
   below) is flat, one row per vendor, since there is no per-vendor spell
   list left to head (decisions/class-spell-vendor-model.md). Same
   "heading + content" recipe as zone-dossier's .dossier-col-label, re-
   declared here rather than shared since each component's shadow root has
   its own stylesheet. */
.vendor-heading {
  font-family: var(--font-display);
  font-size: 13px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--parch-accent);
  padding-bottom: 5px; margin-bottom: 8px;
  border-bottom: 2px solid var(--parch-accent);
}
/* Item results (Armor/Adventuring Supplies/Tradeskill Supplies) have no
   owned/checkbox tracking and no class/level pills. item-chip's own hover
   tooltip already carries the full stat block, so item-chip is inline-flex
   sized-to-content and a wrapping flex row is the natural layout. */
.vendor-item-list { display: flex; flex-wrap: wrap; gap: 6px 10px; }

/* Spells: one row per vendor, name plus the class(es) it covers that match
   the current search. No nested spell list: every vendor of a given class
   carries the same full spellbook (decisions/class-spell-vendor-model.md),
   so the matching spell detail itself renders once, in status-panel.js's
   own deduplicated checklist, not repeated per vendor here. */
.vendor-entry { display: flex; flex-wrap: wrap; align-items: center; gap: 5px 8px; padding: 3px 0; }
.vendor-entry-name { font-size: 13px; color: #4a4232; }

.class-pill {
  font-size: 11px; padding: 2px 7px; border-radius: 3px;
  background: rgba(90, 60, 20, 0.08); border: 1px solid rgba(90, 60, 20, 0.3); color: #5a3c14;
  white-space: nowrap;
}
`);

class ZoneCard extends HTMLElement {
  #ranking = null;

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
    }
    this.render();
  }

  setData(ranking) {
    this.#ranking = ranking;
    this.setAttribute("faction", ranking.faction);
    if (this.shadowRoot) this.render();
  }

  // One row per vendor: name plus the class(es) it sells that match this
  // search. Empty for a vendor still on per-spell sells edges (decisions/
  // class-spell-vendor-model.md), so it renders with no badge rather than
  // a wrong or guessed one.
  #renderVendorScroll(r) {
    const body = r.vendors.map((v) => `
      <div class="vendor-entry">
        <span class="vendor-entry-name">${v.name}</span>
        ${v.classes.map((c) => `<span class="class-pill">${c.charAt(0).toUpperCase() + c.slice(1)}</span>`).join("")}
      </div>
    `).join("");
    const count = r.spellIds.length;
    return { body, count, badgeText: String(count), noun: "spell" };
  }

  // Item results (Armor/Adventuring Supplies/Tradeskill Supplies), grouped
  // by vendor (issue #45). item-chip's own hover tooltip already carries
  // the full stat block (ac/damage/classes/etc.), same component every
  // other item listing in this app uses.
  #renderItemScroll(r) {
    const vendorGroups = new Map();
    for (const it of r.items) {
      for (const v of it.vendors) {
        if (!vendorGroups.has(v)) vendorGroups.set(v, []);
        vendorGroups.get(v).push(it);
      }
    }
    const body = [...vendorGroups.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([vendor, vendorItems]) => `
        <div class="vendor-group">
          <div class="vendor-heading">${vendor}</div>
          <div class="vendor-item-list">${vendorItems.map((it) => itemChipTag({ ...it, label: it.name })).join("")}</div>
        </div>
      `).join("");
    return { body, count: r.items.length, badgeText: String(r.items.length), noun: "item" };
  }

  render() {
    const r = this.#ranking;
    if (!r) return;

    const { body, count, badgeText, noun } = r.vendors ? this.#renderVendorScroll(r) : this.#renderItemScroll(r);
    const hopsText = r.hops === null ? "unreachable" : r.hops === 0 ? "you are here" : `${r.hops} hop${r.hops > 1 ? "s" : ""}`;
    const hasRoute = r.route && r.route.length > 1;
    const routeHtml = hasRoute ? `<route-path variant="stone"></route-path>` : "";
    // No current zone selected -- there's no "unreachable" to report, so
    // omit the hops badge and any route entirely rather than showing a
    // result that reads like the zone genuinely can't be reached.
    const hopsHtml = r.noOrigin ? "" : `<span class="zone-badge hops">${hopsText}</span>`;

    const tooltip = factionTooltip(r.faction, r.factionReasons);
    const eraTitle = r.era ? `${r.era} content isn't available in the current era yet` : "Not available in the current era yet";
    this.shadowRoot.innerHTML = `
      <div class="zone-card-header">
        <span class="zone-name" title="${tooltip}">${r.zoneName}</span>
        ${r.wikiTitle ? wikiLink(r.wikiTitle) : ""}
        ${r.outOfEra ? `<span class="era-badge" title="${eraTitle}">Out of Era</span>` : ""}
        ${r.faction !== "safe" ? `<span class="faction-badge ${r.faction}" title="${tooltip}">${FACTION_LABELS[r.faction] || r.faction}</span>` : ""}
        <span class="zone-badge">${badgeText} ${noun}${count !== 1 ? "s" : ""}</span>
        ${hopsHtml}
      </div>
      ${r.noOrigin ? "" : routeHtml}
      <div class="spell-scroll">
        <div class="spell-vendor-list">${body}</div>
      </div>
    `;
    if (hasRoute) {
      const path = this.shadowRoot.querySelector("route-path");
      path.steps = r.route;
      path.alternates = r.alternates;
    }
    if (r.items) {
      const itemsById = new Map(r.items.map((it) => [it.id, { ...it, label: it.name }]));
      hydrateItemChips(this.shadowRoot, (id) => itemsById.get(id));
    }
  }
}

customElements.define("zone-card", ZoneCard);
