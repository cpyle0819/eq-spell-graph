// <zone-dossier></zone-dossier>, with `.setData({ zoneLabel, wikiTitle,
// outOfEra, lore, levelRange, maps, npcs, zoneType, quests })` set as one
// atomic call (same contract shape as route-card/zone-card's own setters).
// Renders everything issue #28 asked Maps to surface about a *destination*
// once a traveler arrives: a map, a level range to judge the trip at a
// glance, who lives there, and what quests are running. Sits below
// route-card in maps.js's result column and, unlike route-card, renders
// whenever a destination is picked at all -- a zone has its own facts
// regardless of whether a route to it was ever computed (e.g. a spell
// vendor's zone link with no "from" set yet).
//
// The old single "Bestiary" mob roster is gone
// (decisions/npc-mob-unification-and-zone-groups.md) -- every entity in the
// graph is an `npc` now, tagged via `roles` (vendor/quest_giver/guard/
// guildmaster/mob), and this renders one labeled group per role actually
// present, not a flat list. An npc with more than one role (a vendor who
// also gives a quest) renders once per matching group -- intentional, not a
// dedup bug. Group order depends on `zoneType` ("city"/"open_world" share
// CITY_ROLE_ORDER; "dungeon" gets DUNGEON_ROLE_ORDER, the exact reverse --
// a dungeon's own hostile roster is what a visitor actually came for) -- an
// absent role's group is simply not rendered, per the same "if a group
// isn't present, it isn't displayed" rule this redesign was built around.
// This is still a plain name+level roster, not a danger rating -- an early
// pass here also
// colored/labeled each mob by threat tier, but that read as a real signal
// riding on data that was, at the time, entirely invented, so it was cut
// after a first look. Level range alone is the difficulty signal for now.
//
// `npcs` is `NpcSummary[]` straight from /api/npcs?zone= (getZoneNpcs() in
// src/graph.ts) -- every npc located_in the zone, real for the zones the
// issue #36 batches have covered so far, an empty array everywhere else,
// same as a genuinely uncatalogued zone would be; the empty-groups branch
// below is the ordinary case, not a fallback for missing data plumbing.
// `npc.name` doesn't exist -- it's `label`, matching every other summary
// shape in this app (QuestSummary, ZoneSummary, ...); `level` is
// `minLevel`/`maxLevel`, since eqlwiki.com reports most creatures as a
// range, present only for npcs with a guard/guildmaster/mob role.
//
// levelRange is maps.js's own min/max reduction over that same `npcs` array
// (npcsLevelRange() there) -- a real fact about this zone's roster, not
// zone-mock-data.js's old hash-based placeholder (deleted; it never agreed
// with the bestiary list right below it because it wasn't derived from
// anything). null for a zone with no leveled npcs catalogued yet, same
// shape as the no-vendors case elsewhere in this app. zoneLabel/wikiTitle/
// lore/maps/zoneType/quests are also real: wikiTitle/lore/maps/zoneType
// ride along on the existing /api/route destination payload (src/graph.ts's
// getZoneVendorInfo, the same one route-card already reads) rather than a
// separate lookup, and quests come straight from /api/quests?zone=, which
// already supports this filter with no new plumbing (issue #28's own
// Technical Notes).
//
// `maps` (migration 125, decisions/zone-multi-floor-maps.md) is one entry
// per floor: `{ label, image, legend }[]`. `image` is a filename under
// public/maps/ -- resolved to a full path here and handed to the nested
// <zone-map>, which collapses itself when there's no map yet (most zones,
// until sourcing catches up). A zone with more than one entry gets a row of
// floor tabs above the map (label falling back to "Floor N" when
// eqlwiki.com's own floor name wasn't captured); picking one switches both
// the image and that floor's own `.map-legend` together, since a dungeon
// floor's numbered key only makes sense next to its own map. Single-map
// zones (the common case) never show tabs at all.
//
// Layout: lore reads as the scroll's opening line, full width, before
// anything else -- it's a fact about the zone as a whole, not paired
// specifically with the map. Below that, `.map-block` (floor tabs, then a
// `.map-row` pairing the map image with its own Map Legend column) spans
// the full width of the scroll, but the row itself only takes the width
// the map+legend pair actually need and centers as a unit -- see
// decisions/zone-multi-floor-maps.md's later note for why this replaced
// the legend's brief stint living down with Bestiary/Quests instead.
// `.dossier-columns` sits below that as the npc groups + Quests Here,
// side by side, stacking full-width below ~640px. `.map-block` and the
// legend column each collapse via `hidden` when there's no map (or no
// legend for the current floor).
import { RESET_CSS } from "./reset.js";
import { WIKI_LINK_CSS, wikiLink } from "./card-base.js";
import { itemStats } from "./quest-shared.js";
import "./ledger-item.js";
import "./zone-map.js";

function levelBadgeText(levelRange) {
  return levelRange ? `Levels ${levelRange.min}–${levelRange.max}` : "Level range unknown";
}

// "L33-37" for a real ranged npc, "L51" when eqlwiki.com only gave a single
// level (stored as minLevel === maxLevel, see decisions/mob-node-type.md --
// not a separate scalar field, so this is the one place that distinction
// collapses back into display text). "" for a plain vendor/quest-giver with
// no known level at all.
function npcLevelText({ minLevel, maxLevel }) {
  if (minLevel == null && maxLevel == null) return "";
  if (minLevel === maxLevel) return `L${minLevel}`;
  return `L${minLevel ?? "?"}-${maxLevel ?? "?"}`;
}

// Drop chips render inline inside .npc-name (not as a third grid cell) so
// the existing 2-column max-content/1fr grid (name, level) doesn't need a
// third track -- an npc row with drops just has a wider first cell. Hover
// wiring is in connectedCallback, same event-delegation shape as
// quest-shared.js's wireItemTooltips(), reading item data back out of
// #dropsById (rebuilt each render()) via data-item-id.
function npcDropBadges(npc) {
  if (!npc.drops?.length) return "";
  return npc.drops.map((item) => `<span class="npc-drop-badge" data-item-id="${item.id}">${item.label}</span>`).join("");
}

// Two sibling grid cells, not a wrapping row div -- .npc-list itself is the
// grid (see its own CSS comment for why), so every npc's name/level land in
// the same two columns and the level column aligns down the whole list
// without each row needing to know the longest name in the list.
//
// The right-hand cell's content depends on which role group this row is
// rendering for (an npc with more than one role gets called once per
// group, see this file's header): vendors never carry a level at all
// (src/graph.ts's NpcSummary comment), so that group shows what they sell
// (NpcSummary.sellCategories) instead of an always-empty level column;
// every other role keeps the level text.
function npcRow(npc, role) {
  const rightText = role === "vendor" ? (npc.sellCategories || []).join(", ") : npcLevelText(npc);
  return `
    <span class="npc-name">${npc.label}${npcDropBadges(npc)}</span>
    <span class="npc-level">${rightText}</span>
  `;
}

const ROLE_LABELS = { guildmaster: "Guildmasters", vendor: "Vendors", quest_giver: "Quest Givers", guard: "Guards", mob: "Mobs" };
const CITY_ROLE_ORDER = ["guildmaster", "vendor", "quest_giver", "guard", "mob"];
const DUNGEON_ROLE_ORDER = [...CITY_ROLE_ORDER].reverse();

// Groups npcs by role (one npc can land in more than one group -- see this
// file's own header) and orders the groups per zoneType. "city" and
// "open_world" render identically; only "dungeon" differs
// (decisions/npc-mob-unification-and-zone-groups.md), so anything else
// (including a missing zoneType) falls back to the city/open_world order.
function npcGroupsHtml(npcs, zoneType) {
  const groups = {};
  for (const npc of npcs || []) {
    for (const role of npc.roles) (groups[role] ??= []).push(npc);
  }
  const order = zoneType === "dungeon" ? DUNGEON_ROLE_ORDER : CITY_ROLE_ORDER;
  const blocks = order
    .filter((role) => groups[role]?.length)
    .map((role) => `
      <div class="npc-group">
        <div class="dossier-col-label">${ROLE_LABELS[role]}</div>
        <div class="npc-list">${groups[role].map((npc) => npcRow(npc, role)).join("")}</div>
      </div>
    `);
  return blocks.length ? blocks.join("") : `<div class="dossier-empty">No npcs catalogued yet for this zone.</div>`;
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

.map-block[hidden] { display: none; }
.map-block { margin-bottom: 4px; }

.floor-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
.floor-tabs[hidden] { display: none; }
.floor-tab {
  font-family: var(--font-display); font-size: 12px; font-weight: 700;
  letter-spacing: 0.03em;
  padding: 7px 16px; border-radius: 4px 4px 0 0; cursor: pointer;
  /* --wood-2 (dark brown, scroll-roller color) instead of --panel-deep --
     the near-black cool stone well read as too dark against the parchment
     scroll. --ink-muted/--parchment (not --parch-ink-soft/--parch-ink,
     tuned for dark-on-light parchment) keep contrast readable on this
     dark-on-dark surface. */
  background: var(--wood-2); color: var(--ink-muted);
  border: 1px solid var(--parch-line); border-bottom: none;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);
}
.floor-tab:hover:not(.active) { color: var(--parchment); }
.floor-tab:focus-visible { outline: 2px solid var(--parch-accent); outline-offset: 2px; }
.floor-tab.active {
  background: var(--parch-tex), linear-gradient(180deg, #ece3c8, var(--parch-bg));
  color: var(--parch-accent);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

/* The map and its legend as one centered unit -- neither stretches to fill
   the row, so a modest map (every source image so far tops out around
   640px wide) plus a legend sized to its own text just sit side by side in
   the middle of the scroll, not pinned to the left edge. Stacks (map on
   top, legend below, both full width) under 760px, same breakpoint
   .dossier-columns already used for its own collapse. */
.map-row { display: flex; justify-content: center; align-items: flex-start; gap: 24px; flex-wrap: wrap; }
.map-row .map-legend-col { flex: 0 1 320px; min-width: 220px; }
.map-row .map-legend-col[hidden] { display: none; }
@media (max-width: 760px) {
  .map-row { flex-direction: column; align-items: stretch; }
  .map-row .map-legend-col { flex: none; }
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
/* grid-column spans both of .npc-list's columns when this renders inside
   it (a no-op in .quest-ledger, which isn't a grid) -- otherwise a single
   grid item with no explicit span sizes column 1 (max-content) to this
   message's own long text, which is exactly the "column too wide" problem
   the grid fix above exists to avoid. */
.dossier-empty { grid-column: 1 / -1; font-size: 12px; font-style: italic; color: var(--parch-ink-soft); }

/* One or more stacked npc-groups (Guildmasters/Vendors/Quest Givers/Guards/
   Mobs, whichever are actually present) replace the old single "Bestiary"
   list -- each reuses .dossier-col-label for its own heading, so a group
   reads with the same visual weight "Bestiary" used to, just repeated per
   role. Margin only between groups, not before the first, so the stack
   doesn't add extra space under "Quests Here" next to it. */
.npc-group + .npc-group { margin-top: 16px; }

/* Grid, not flex rows with justify-content: space-between -- the old flex
   version stretched .npc-name/.npc-level to the column's full width every
   row, leaving a huge, inconsistent gap between a short name and its level
   (the gap was however wide the column happened to be, not how wide the
   name actually was). A shared grid instead sizes column 1 to the single
   longest name in the whole list (max-content) and starts column 2 right
   after it -- the level column still lines up top to bottom like a real
   table column, but the list itself no longer needs to be wide enough to
   justify that gap, which is what actually freed up the room to widen the
   map (see decisions/ or this file's own layout comment above). */
.npc-list { display: grid; grid-template-columns: max-content 1fr; column-gap: 16px; font-size: 13px; }
.npc-name, .npc-level { padding: 5px 0; }
.npc-name:nth-child(-n+2), .npc-level:nth-child(-n+2) { padding-top: 0; }
.npc-name:not(:nth-child(-n+2)), .npc-level:not(:nth-child(-n+2)) { border-top: 1px solid var(--parch-line); }
.npc-level { text-align: right; font-size: 11px; color: var(--parch-ink-soft); font-variant-numeric: tabular-nums; }

/* Same amber "item" gem language as quest-shared.js's own .item-badge
   (decisions/item-hover-uses-generic-detail-tooltip.md) -- a different file
   since this card has no reason to import that one's full CSS blob, but the
   color says "this is loot" the same way across both pages. */
.npc-drop-badge {
  display: inline-flex; align-items: center; gap: 5px;
  margin-left: 8px; padding: 1px 7px 1px 5px; border-radius: 3px;
  font-size: 11px; cursor: help;
  background: rgba(122, 77, 5, 0.1); color: #6a4204; border: 1px solid rgba(122, 77, 5, 0.4);
}
.npc-drop-badge::before {
  content: ""; width: 7px; height: 7px; border-radius: 2px; flex-shrink: 0;
  background: radial-gradient(circle at 65% 30%, #ffd97a, #c98f1f 55%, #6e4a0d);
  box-shadow: inset 0 0 1px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 0, 0, 0.4);
}

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
  #activeFloor = 0;
  #dropsById = new Map();

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
            <div class="map-block" hidden>
              <div class="floor-tabs" hidden></div>
              <div class="map-row">
                <zone-map></zone-map>
                <div class="dossier-col map-legend-col" hidden>
                  <div class="dossier-col-label">Map Legend</div>
                  <ol class="map-legend"></ol>
                </div>
              </div>
            </div>
            <div class="dossier-columns">
              <div class="dossier-col npc-groups"></div>
              <div class="dossier-col">
                <div class="dossier-col-label">Quests Here</div>
                <div class="quest-ledger"></div>
              </div>
            </div>
          </div>
        </div>
      `;
      this.shadowRoot.querySelector(".floor-tabs").addEventListener("click", (e) => {
        const btn = e.target.closest(".floor-tab");
        if (!btn) return;
        this.#activeFloor = Number(btn.dataset.index);
        this.render();
      });
      this.#wireDropTooltips();
    }
    this.render();
  }

  // Same event-delegation shape as quest-shared.js's wireItemTooltips() --
  // listens on shadowRoot itself so retargeting doesn't apply (see that
  // file's own comment) -- but reads from #dropsById instead of taking a
  // findItem callback, since this component owns its own npc/item data
  // rather than a parent page's.
  #wireDropTooltips() {
    if (!window.matchMedia("(pointer: fine)").matches) return; // touch devices: no hover tooltip, same as quest-shared.js
    this.shadowRoot.addEventListener("mouseover", (e) => {
      const chip = e.target.closest(".npc-drop-badge[data-item-id]");
      if (!chip) return;
      const item = this.#dropsById.get(chip.dataset.itemId);
      if (item) document.getElementById("detail-tooltip")?.show({ name: item.label, description: item.source, stats: itemStats(item) }, chip);
    });
    this.shadowRoot.addEventListener("mouseout", (e) => {
      if (!e.relatedTarget?.closest?.(".npc-drop-badge[data-item-id]")) {
        document.getElementById("detail-tooltip")?.hide();
      }
    });
  }

  setData(data) {
    this.#data = data;
    this.#activeFloor = 0;
    if (this.shadowRoot) this.render();
  }

  render() {
    const d = this.#data;
    if (!d) return;
    const { zoneLabel, wikiTitle, outOfEra, lore, levelRange, maps, npcs, zoneType, quests } = d;

    this.shadowRoot.querySelector(".zone-name").textContent = zoneLabel;
    this.shadowRoot.querySelector(".wiki-link-holder").innerHTML = wikiTitle ? wikiLink(wikiTitle) : "";
    this.shadowRoot.querySelector(".era-badge").hidden = !outOfEra;
    const levelBadge = this.shadowRoot.querySelector(".level-badge");
    levelBadge.textContent = levelBadgeText(levelRange);
    levelBadge.title = "Level range across every npc catalogued in this zone.";

    const loreEl = this.shadowRoot.querySelector(".dossier-lore");
    loreEl.hidden = !lore;
    loreEl.textContent = lore || "";

    const floors = maps || [];
    const floor = floors[this.#activeFloor];

    this.shadowRoot.querySelector(".map-block").hidden = floors.length === 0;

    const tabsEl = this.shadowRoot.querySelector(".floor-tabs");
    tabsEl.hidden = floors.length <= 1;
    tabsEl.innerHTML = floors
      .map((f, i) => `<button type="button" class="floor-tab${i === this.#activeFloor ? " active" : ""}" data-index="${i}">${f.label || `Floor ${i + 1}`}</button>`)
      .join("");

    this.shadowRoot.querySelector("zone-map").setData({ src: floor ? `maps/${floor.image}` : null, label: zoneLabel });

    const legendColEl = this.shadowRoot.querySelector(".map-legend-col");
    legendColEl.hidden = !floor?.legend?.length;
    this.shadowRoot.querySelector(".map-legend").innerHTML = (floor?.legend || [])
      .map((entry) => `<li><span class="legend-key">${entry.key}</span><span>${entry.label}</span></li>`)
      .join("");

    this.#dropsById = new Map((npcs || []).flatMap((n) => n.drops || []).map((item) => [item.id, item]));
    this.shadowRoot.querySelector(".npc-groups").innerHTML = npcGroupsHtml(npcs, zoneType);

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
