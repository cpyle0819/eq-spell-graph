// <zone-card faction="safe|neutral|wont_sell|kos">, with
// `.setData(ranking, ownedSet, showAllSpells)` set as one atomic call (not
// three separate setters) so a render never sees a partial mix of old and
// new state. Renders the zone header (name + wiki link + faction LED dot,
// faction badge, spell-count badge, hops badge), an optional nested
// <route-path variant="stone">, and the spell-scroll list of spell-rows
// (owned checkbox + spell-chip + vendor-tags). The header's wiki link uses
// `ranking.wikiTitle` (src/graph.ts's rankZones, from the zone node's
// migration-023 `wiki_title` field) rather than deriving a URL from
// `zoneName` — several zone labels don't match their eqlwiki.com page
// title 1:1 (see decisions/zone-naming-mismatches.md), so a naive
// label-to-URL guess would 404 for those. Each spell-chip already linked
// to its own dedicated per-spell wiki page (card-base.js's `wikiUrl`, same
// convention).
//
// Owns its own checkbox-change and hover-to-tooltip wiring rather than
// delegating through app.js: once spell-chips/checkboxes live inside this
// component's shadow root, a delegated listener on #results outside the
// shadow tree can't class-match e.target (retargeting) or read
// e.relatedTarget across the boundary at all. Checkbox changes dispatch a
// composed `spell-owned-change` CustomEvent for app.js to react to (a
// single change can affect *other* cards' visibility when showAllSpells is
// false, so app.js re-renders the whole list rather than this card
// patching itself). Hover/click-suppress for the wiki-link tooltip is
// handled entirely internally, calling #detail-tooltip's show()/hide() API
// directly -- this component already has full spell data via `ranking`, so
// it never needs to reach into app.js's own state. spellStats() below
// shapes a spell into <detail-tooltip>'s generic { name, description,
// stats } contract -- that component itself has no spell-specific field
// knowledge (see public/components/detail-tooltip.js), so this is the one
// place spell fields become tooltip stat chips.
import { RESET_CSS } from "./reset.js";
import { WIKI_LINK_CSS, wikiUrl, wikiLink } from "./card-base.js";

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

// Shapes a spell into <detail-tooltip>'s generic { text, highlight? }[]
// stat-chip contract -- spellType is the one highlighted chip (matches the
// old spell-tooltip's hardcoded behavior), everything else is plain.
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
   layer, and these cards share a seam with their neighbor via a
   negative-margin overlap (index.html), so layer promotion would visibly
   desync the shared border during the hover transition. */
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

.spell-vendor-list { display: flex; flex-direction: column; gap: 8px; }
/* Checkbox is a fixed grid column; the name chip + class pills + vendor
   tags all live in the second column as one flex-wrap flow. A short entry
   (one class, one vendor) sits entirely on a single line -- no line is
   spent on structure the content doesn't need. A long one (many classes,
   several vendors) wraps, and because everything is confined to column 2,
   every wrapped line lands at the same left edge as the spell name for
   free, reading as "belongs to this spell" without a manual indent hack.
   This also fixes the original bug: the class/level list used to be
   concatenated as unbreakable text inside the name's own nowrap chip, so a
   spell with several classes ran straight off the card with no wrap point
   at all -- each class is now its own wrappable pill instead. */
.spell-row { display: grid; grid-template-columns: 15px 1fr; column-gap: 8px; row-gap: 4px; }
.spell-check { padding-top: 3px; }
.spell-check input { cursor: pointer; accent-color: var(--gold); width: 15px; height: 15px; }
.spell-content { display: flex; flex-wrap: wrap; align-items: center; gap: 5px 8px; }
.spell-owned { opacity: 0.4; }
.spell-owned .spell-chip { text-decoration: line-through; }
.spell-owned .spell-chip::before { filter: grayscale(1) brightness(0.6); }

.spell-chip {
  font-size: 13px; padding: 3px 10px 3px 7px; border-radius: 3px;
  background: rgba(122, 77, 5, 0.1);
  border: 1px solid rgba(122, 77, 5, 0.35);
  color: #5a3c14;
  overflow-wrap: break-word; text-decoration: none;
  display: inline-flex; align-items: center; min-width: 0;
}
/* spell gem — specular highlight biased top-right, matching the app's
   light source. */
.spell-chip::before {
  content: ""; width: 9px; height: 9px; border-radius: 2px; margin-right: 7px; flex-shrink: 0;
  background: radial-gradient(circle at 65% 30%, #ffd97a, #c98f1f 55%, #6e4a0d);
  box-shadow: inset 0 0 1px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 0, 0, 0.55);
}
@media (pointer: coarse) { .spell-chip { cursor: pointer; } }

.class-pill {
  font-size: 11px; padding: 2px 7px; border-radius: 3px;
  background: rgba(90, 60, 20, 0.08); border: 1px solid rgba(90, 60, 20, 0.3); color: #5a3c14;
  white-space: nowrap;
}

.vendor-tag {
  font-size: 12px; padding: 3px 8px; border-radius: 3px;
  background: rgba(30, 64, 175, 0.08); border: 1px solid rgba(30, 64, 175, 0.3); color: #1e40af;
  white-space: nowrap;
}
`);

class ZoneCard extends HTMLElement {
  #ranking = null;
  #owned = new Set();
  #showAll = false;
  #isMouseDevice = window.matchMedia("(pointer: fine)").matches;

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
      this.#wireEvents();
    }
    this.render();
  }

  setData(ranking, owned, showAllSpells) {
    this.#ranking = ranking;
    this.#owned = owned;
    this.#showAll = showAllSpells;
    this.setAttribute("faction", ranking.faction);
    if (this.shadowRoot) this.render();
  }

  // Listening on shadowRoot itself (not `this`/the host) sees the real
  // internal e.target/e.relatedTarget directly -- event retargeting to the
  // host only applies to listeners outside the shadow tree (see tag-input.js).
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
      const spell = this.#ranking?.spells.find((s) => s.id === chip.dataset.spellId);
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

  render() {
    const r = this.#ranking;
    if (!r) return;
    const owned = this.#owned;
    const showAllSpells = this.#showAll;

    const visibleSpells = showAllSpells ? r.spells : r.spells.filter((s) => !owned.has(s.id));
    const hopsText = r.hops === null ? "unreachable" : r.hops === 0 ? "you are here" : `${r.hops} hop${r.hops > 1 ? "s" : ""}`;

    const spellRows = r.spells.map((s) => {
      const isOwned = owned.has(s.id);
      if (!showAllSpells && isOwned) return "";
      const vendors = s.vendors.filter((v, _, arr) => !arr.some((o) => o !== v && o.startsWith(v + ",")));
      return `
        <div class="spell-row${isOwned ? " spell-owned" : ""}">
          <label class="spell-check"><input type="checkbox" data-spell-id="${s.id}"${isOwned ? " checked" : ""}></label>
          <div class="spell-content">
            <a class="spell-chip" data-spell-id="${s.id}" href="${wikiUrl(s.name)}" target="_blank" rel="noopener">${s.name}</a>
            ${s.classes.map((c) => `<span class="class-pill">${c.cls.charAt(0).toUpperCase() + c.cls.slice(1)} L${c.level}</span>`).join("")}
            ${vendors.map((v) => `<span class="vendor-tag">${v}</span>`).join("")}
          </div>
        </div>
      `;
    }).join("");

    const hasRoute = r.route && r.route.length > 1;
    const routeHtml = hasRoute ? `<route-path variant="stone"></route-path>` : "";

    const spellCount = visibleSpells.length;
    const ownedHere = r.spells.length - visibleSpells.length;
    const spellBadge = spellCount + (ownedHere > 0 && !showAllSpells ? ` <span style="color:#4ade80;font-size:10px;">(${ownedHere} owned)</span>` : "");

    const tooltip = factionTooltip(r.faction, r.factionReasons);
    const eraTitle = r.era ? `${r.era} content isn't available in the current era yet` : "Not available in the current era yet";
    this.shadowRoot.innerHTML = `
      <div class="zone-card-header">
        <span class="zone-name" title="${tooltip}">${r.zoneName}</span>
        ${r.wikiTitle ? wikiLink(r.wikiTitle) : ""}
        ${r.outOfEra ? `<span class="era-badge" title="${eraTitle}">Out of Era</span>` : ""}
        ${r.faction !== "safe" ? `<span class="faction-badge ${r.faction}" title="${tooltip}">${FACTION_LABELS[r.faction] || r.faction}</span>` : ""}
        <span class="zone-badge">${spellBadge} spell${spellCount !== 1 ? "s" : ""}</span>
        <span class="zone-badge hops">${hopsText}</span>
      </div>
      ${routeHtml}
      <div class="spell-scroll">
        <div class="spell-vendor-list">${spellRows}</div>
      </div>
    `;
    if (hasRoute) this.shadowRoot.querySelector("route-path").steps = r.route;
  }
}

customElements.define("zone-card", ZoneCard);
