// <zone-dossier></zone-dossier>, with `.setData({ zoneLabel, wikiTitle,
// outOfEra, lore, levelRange, mapImage, mapLegend, mobs, quests })` set as
// one atomic call (same contract shape as route-card/zone-card's own
// setters). Renders
// everything issue #28 asked Maps to surface about a *destination* once a
// traveler arrives: a map, a level range to judge the trip at a glance, who
// lives there, and what quests are running. Sits below route-card in
// maps.js's result column and, unlike route-card, renders whenever a
// destination is picked at all -- a zone has its own facts regardless of
// whether a route to it was ever computed (e.g. a spell vendor's zone link
// with no "from" set yet).
//
// The bestiary is a plain name+level roster, not a danger rating -- an
// early pass here also colored/labeled each mob by threat tier, but that
// read as a real signal riding on data that was, at the time, entirely
// invented, so it was cut after a first look. Level range alone is the
// difficulty signal for now.
//
// `mobs` is `MobSummary[]` straight from /api/mobs?zone= (getMobs() in
// src/graph.ts, decisions/mob-node-type.md) -- real for zones migration 060
// has covered (Oasis of Marr so far), an empty array everywhere else, same
// as a genuinely uncatalogued zone would be; the empty-bestiary branch below
// is the ordinary case, not a fallback for missing data plumbing. `mob.name`
// doesn't exist -- it's `label`, matching every other summary shape in this
// app (QuestSummary, ZoneSummary, ...); `level` is `minLevel`/`maxLevel`,
// since eqlwiki.com reports most creatures as a range.
//
// levelRange is still stage-1 placeholder data (public/zone-mock-data.js) --
// see that file's own header for why: zone nodes carry no real level-range
// field yet, unlike mobs and mapImage, which now do. zoneLabel/wikiTitle/
// lore/mapImage/quests are real: wikiTitle/lore/mapImage ride along on the
// existing /api/route destination payload (src/graph.ts's
// getZoneVendorInfo, the same one route-card already reads) rather than a
// separate lookup, and quests come straight from /api/quests?zone=, which
// already supports this filter with no new plumbing (issue #28's own
// Technical Notes).
//
// `mapImage` is a filename under public/maps/ (migration 061 and its own
// header comment) -- resolved to a full path here and handed to the nested
// <zone-map>, which collapses itself when there's no map yet (most zones,
// until sourcing catches up). Its own file has the styling/hide logic.
// `mapLegend` (also migration 061) is this component's own `.map-legend`
// list, not <zone-map>'s -- a map's numbered key is short phrases, closer
// in shape to a third list column than to map decoration, so it gets its
// own place in the row layout beside Bestiary/Quests Here rather than being
// squeezed under the (deliberately narrow) map image.
//
// Layout: lore reads as the scroll's opening line, full width, before
// anything else -- it's a fact about the zone as a whole, not paired
// specifically with the map the way it first shipped (sitting directly
// under the map read as cramped, and the two aren't actually related).
// Below that, on wide layouts .dossier-body is three side-by-side tracks --
// .map-rail (the image, see zone-map.js for why it's capped at a fixed
// width rather than filling whatever space it's given), .map-legend (its
// key), then .dossier-columns (Bestiary/Quests Here, flexing to take
// whatever's left) -- using width a portrait map would otherwise leave
// empty on both sides of it. All three stack full-width, map image first,
// below ~900px ("pop back down" rather than staying cramped at three
// columns). .map-rail/.map-legend each collapse via `hidden` when there's
// no map (or no legend) so Bestiary/Quests aren't left indented into blank
// space that has nothing left to reserve it.
import { RESET_CSS } from "./reset.js";
import { WIKI_LINK_CSS, wikiLink } from "./card-base.js";
import "./ledger-item.js";
import "./zone-map.js";

function levelBadgeText(levelRange) {
  return levelRange ? `Levels ${levelRange.min}–${levelRange.max}` : "Level range unknown";
}

// "L33-37" for a real ranged mob, "L51" when eqlwiki.com only gave a single
// level (stored as minLevel === maxLevel, see decisions/mob-node-type.md --
// not a separate scalar field, so this is the one place that distinction
// collapses back into display text).
function mobLevelText({ minLevel, maxLevel }) {
  if (minLevel == null && maxLevel == null) return "";
  if (minLevel === maxLevel) return `L${minLevel}`;
  return `L${minLevel ?? "?"}-${maxLevel ?? "?"}`;
}

// Two sibling grid cells, not a wrapping row div -- .mob-list itself is the
// grid (see its own CSS comment for why), so every mob's name/level land in
// the same two columns and the level column aligns down the whole list
// without each row needing to know the longest name in the list.
function mobRow(mob) {
  return `
    <span class="mob-name">${mob.label}</span>
    <span class="mob-level">${mobLevelText(mob)}</span>
  `;
}

function questTeaser(quest) {
  if (quest.description) return quest.description.length > 90 ? `${quest.description.slice(0, 87)}…` : quest.description;
  return quest.steps?.[0] || "";
}

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
${RESET_CSS}
${WIKI_LINK_CSS}
:host {
  display: block;
  background: var(--marble-tex), linear-gradient(180deg, var(--stone-1), var(--stone-2));
  border: 4px solid;
  border-color: var(--edge-hi) var(--edge-hi) var(--edge-lo) var(--edge-lo);
  border-radius: 3px;
  box-shadow: inset -1px 1px 0 rgba(255, 255, 255, 0.08), inset 1px -1px 0 rgba(0, 0, 0, 0.45), 0 2px 8px rgba(0, 0, 0, 0.4);
  outline: 1px solid rgba(232, 168, 42, 0.22);
  outline-offset: -5px;
  border-top: 2px solid var(--gold);
  padding: 22px 26px !important;
}
.dossier-header { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-bottom: 18px; }
.zone-name {
  font-family: var(--font-display);
  font-size: 19px; font-weight: 700; color: var(--parchment);
  letter-spacing: 0.02em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}
.level-badge {
  font-size: 12px; padding: 3px 10px; border-radius: 3px;
  background: var(--panel-deep);
  border: 1px solid; border-color: var(--edge-lo) var(--edge-lo) #5a5570 #5a5570;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
  color: #c9a25e;
  font-variant-numeric: tabular-nums;
}
/* Same dark-backing-plus-red-tint language as zone-card's kos faction badge
   -- reused here as the one other "this isn't available to you" signal, on
   the same dark stone backdrop. */
.era-badge {
  font-size: 11px; padding: 3px 9px; border-radius: 3px;
  text-transform: uppercase; font-weight: 700; letter-spacing: 0.06em;
  cursor: help; text-shadow: 0 1px 1px rgba(0, 0, 0, 0.6);
  background: linear-gradient(rgba(239, 68, 68, 0.16), rgba(239, 68, 68, 0.16)), rgba(10, 9, 15, 0.6);
  color: #ff6b6b; border: 1px solid rgba(239, 68, 68, 0.4);
}
.era-badge[hidden] { display: none; }

.dossier-scroll {
  position: relative;
  padding: 16px 20px; border-radius: 2px;
  background: var(--parch-tex), linear-gradient(180deg, #ece3c8, var(--parch-bg));
  border: 1px solid var(--parch-line);
  box-shadow: inset 0 0 22px rgba(122, 96, 42, 0.3), 0 2px 6px rgba(0, 0, 0, 0.45);
  color: var(--parch-ink);
}
.dossier-scroll::before, .dossier-scroll::after {
  content: "";
  position: absolute; top: -3px; bottom: -3px; width: 11px;
  border-radius: 5px;
  background:
    radial-gradient(3px 3px at 50% 7px, rgba(0, 0, 0, 0.6), transparent 70%),
    radial-gradient(3px 3px at 50% calc(100% - 7px), rgba(0, 0, 0, 0.6), transparent 70%),
    linear-gradient(90deg, var(--wood-2), var(--wood-1) 40%, var(--wood-1) 60%, var(--wood-2));
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.55);
}
.dossier-scroll::before { left: -11px; }
.dossier-scroll::after { right: -11px; }

.dossier-lore {
  font-size: 14px; font-style: italic; color: #4a4232; line-height: 1.6;
  margin: 0 0 18px; padding-bottom: 18px;
  border-bottom: 1px solid var(--parch-line);
}
.dossier-lore[hidden] { display: none; }

.dossier-body { display: flex; flex-direction: column; gap: 22px; }
/* Unconstrained (full width, same as before the row layout existed) below
   the row breakpoint -- capping either one narrow there would strand it
   alone on its own row with blank space beside it, since Bestiary/Quests
   wraps to a separate row underneath rather than actually sharing this
   one. */
.map-rail[hidden] { display: none; }
.map-legend[hidden] { display: none; }
/* Same hidden state as .map-rail (see render()) -- nothing to divide once
   there's no map group on the left at all, so Bestiary/Quests just starts
   the row. A plain horizontal rule below the row breakpoint (matching
   .dossier-lore's own divider language) separating the stacked map+legend
   block from the stacked Bestiary/Quests block underneath; the media query
   below turns it into a full-height vertical rule between the two groups
   once they're actually side by side. */
.dossier-divider[hidden] { display: none; }
.dossier-divider { border-top: 1px solid var(--parch-line); }
@media (min-width: 900px) {
  .dossier-body { flex-direction: row; align-items: flex-start; gap: 24px; }
  /* Fixed, not just a minimum -- readability is the priority here (a
     portrait zone map is mostly wasted at a phone-thumbnail size), and
     moving the legend into its own track (below) plus the mob-list grid
     fix (further below) means Bestiary/Quests no longer need the width
     they used to just to keep a comfortable gap in front of the level
     column. Legend is wide enough that its own longer entries (a full
     sentence, not just a place name) don't wrap on nearly every line. */
  .map-rail { flex: 0 0 300px; }
  .map-legend { flex: 0 0 260px; }
  .dossier-divider { align-self: stretch; width: 0; border-top: none; border-left: 1px solid var(--parch-line); }
  .dossier-columns { flex: 1; min-width: 0; }
}

.map-legend {
  list-style: none; margin: 0; padding: 0;
  display: flex; flex-direction: column; gap: 8px;
  font-size: 13px;
}
.map-legend li { display: flex; align-items: flex-start; gap: 8px; color: var(--parch-ink); line-height: 1.4; }
.legend-key {
  flex-shrink: 0; width: 18px; height: 18px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-size: 10px; font-weight: 700;
  color: var(--parch-bg);
  background: radial-gradient(circle at 65% 30%, var(--parch-accent), #4a3004 70%);
  box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.35);
}

.dossier-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; }
@media (max-width: 640px) {
  .dossier-columns { grid-template-columns: 1fr; }
}
/* Display face + accent underline, not just a smaller/muted label -- at
   the same weight of muted-uppercase-10px this collapsed visually into the
   list content below it (a 3px size gap barely reads once the list content
   is itself bold/uppercase-adjacent). The type-family switch is what
   actually separates "heading" from "content" here, the same job
   .zone-name's display face does one level up. */
.dossier-col-label {
  font-family: var(--font-display);
  font-size: 13px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--parch-accent);
  padding-bottom: 5px; margin-bottom: 11px;
  border-bottom: 2px solid var(--parch-accent);
}
/* grid-column spans both of .mob-list's columns when this renders inside
   it (a no-op in .quest-ledger, which isn't a grid) -- otherwise a single
   grid item with no explicit span sizes column 1 (max-content) to this
   message's own long text, which is exactly the "column too wide" problem
   the grid fix above exists to avoid. */
.dossier-empty { grid-column: 1 / -1; font-size: 12px; font-style: italic; color: var(--parch-ink-soft); }

/* Grid, not flex rows with justify-content: space-between -- the old flex
   version stretched .mob-name/.mob-level to the column's full width every
   row, leaving a huge, inconsistent gap between a short name and its level
   (the gap was however wide the column happened to be, not how wide the
   name actually was). A shared grid instead sizes column 1 to the single
   longest name in the whole list (max-content) and starts column 2 right
   after it -- the level column still lines up top to bottom like a real
   table column, but the list itself no longer needs to be wide enough to
   justify that gap, which is what actually freed up the room to widen the
   map (see decisions/ or this file's own layout comment above). */
.mob-list { display: grid; grid-template-columns: max-content 1fr; column-gap: 16px; font-size: 13px; }
.mob-name, .mob-level { padding: 5px 0; }
.mob-name:nth-child(-n+2), .mob-level:nth-child(-n+2) { padding-top: 0; }
.mob-name:not(:nth-child(-n+2)), .mob-level:not(:nth-child(-n+2)) { border-top: 1px solid var(--parch-line); }
.mob-level { text-align: right; font-size: 11px; color: var(--parch-ink-soft); font-variant-numeric: tabular-nums; }

/* quest-ledger's <ledger-item>s live in this component's own shadow tree
   (nested the same way route-card nests route-path -- see this file's own
   header), but the <a> inside each one's slot="label" is light-DOM content
   of ledger-item itself, one level past what ledger-item's own ::slotted()
   rule can reach (single compound selector, no combinators -- same
   constraint documented in leveling-guide.html's near-identical
   "ledger-item a" rule for its own, page-level ledger-items). Un-styled,
   that <a> falls through to the browser's default link color, which read
   too pale against the parchment -- same fix leveling-guide.html already
   applies at the page level, just scoped to this shadow root instead. */
.quest-ledger a { color: inherit; text-decoration: none; border-bottom: 1px dotted var(--parch-accent); }
.quest-ledger a:hover, .quest-ledger a:focus-visible { color: var(--parch-accent); border-bottom-style: solid; }
.quest-ledger a:focus-visible { outline: 2px solid var(--parch-accent); outline-offset: 2px; border-radius: 1px; }
`);

class ZoneDossier extends HTMLElement {
  #data = null;

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
      this.shadowRoot.innerHTML = `
        <div class="dossier-header">
          <span class="zone-name"></span>
          <span class="wiki-link-holder"></span>
          <span class="era-badge" hidden title="Kunark/Velious content isn't reachable in the current era yet">Out of Era</span>
          <span class="level-badge"></span>
        </div>
        <div class="dossier-scroll">
          <p class="dossier-lore" hidden></p>
          <div class="dossier-body">
            <div class="map-rail"><zone-map></zone-map></div>
            <ol class="map-legend" hidden></ol>
            <div class="dossier-divider" hidden></div>
            <div class="dossier-columns">
              <div class="dossier-col">
                <div class="dossier-col-label">Bestiary</div>
                <div class="mob-list"></div>
              </div>
              <div class="dossier-col">
                <div class="dossier-col-label">Quests Here</div>
                <div class="quest-ledger"></div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
    this.render();
  }

  setData(data) {
    this.#data = data;
    if (this.shadowRoot) this.render();
  }

  render() {
    const d = this.#data;
    if (!d) return;
    const { zoneLabel, wikiTitle, outOfEra, lore, levelRange, mapImage, mapLegend, mobs, quests } = d;

    this.shadowRoot.querySelector(".zone-name").textContent = zoneLabel;
    this.shadowRoot.querySelector(".wiki-link-holder").innerHTML = wikiTitle ? wikiLink(wikiTitle) : "";
    this.shadowRoot.querySelector(".era-badge").hidden = !outOfEra;
    this.shadowRoot.querySelector(".level-badge").textContent = levelBadgeText(levelRange);

    const loreEl = this.shadowRoot.querySelector(".dossier-lore");
    loreEl.hidden = !lore;
    loreEl.textContent = lore || "";

    this.shadowRoot.querySelector(".map-rail").hidden = !mapImage;
    this.shadowRoot.querySelector(".dossier-divider").hidden = !mapImage;
    this.shadowRoot.querySelector("zone-map").setData({ src: mapImage ? `maps/${mapImage}` : null, label: zoneLabel });

    const legendEl = this.shadowRoot.querySelector(".map-legend");
    legendEl.hidden = !mapLegend?.length;
    legendEl.innerHTML = (mapLegend || [])
      .map((entry) => `<li><span class="legend-key">${entry.key}</span><span>${entry.label}</span></li>`)
      .join("");

    const mobList = this.shadowRoot.querySelector(".mob-list");
    mobList.innerHTML = mobs?.length
      ? mobs.map(mobRow).join("")
      : `<div class="dossier-empty">No bestiary data yet — nothing catalogued for this zone.</div>`;

    const ledger = this.shadowRoot.querySelector(".quest-ledger");
    if (quests?.length) {
      ledger.innerHTML = quests.map((q) => `
        <ledger-item stacked>
          <span slot="label"><a href="quests.html?search=${encodeURIComponent(q.label)}">${q.label}</a></span>
          <span slot="detail">${questTeaser(q)}</span>
        </ledger-item>
      `).join("");
    } else {
      ledger.innerHTML = `<div class="dossier-empty">No quests currently tracked in this zone.</div>`;
    }
  }
}

customElements.define("zone-dossier", ZoneDossier);
