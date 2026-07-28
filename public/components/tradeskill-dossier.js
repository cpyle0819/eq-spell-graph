// <tradeskill-dossier>, with `.setData({ tradeskillLabel, recipes, vendors })`
// set as one atomic call (same contract shape as zone-dossier's own setter).
// The Tradeskills page's (trades.html/trades.js) dossier for issue #32's
// first pass — see decisions/tradeskill-recipe-node-schema.md for the
// `recipe` node / `uses`/`produces` edge shapes this renders. Visually the
// same beveled-panel + parchment-scroll shell as zone-dossier, but a
// distinct file (not a shared base class) since the two dossiers show
// unrelated content shapes — same "duplicate the small shared shell rather
// than force a common base" call zone-dossier's own npc-drop-badge already
// made against quest-shared.js's item-badge.
//
// `recipes` is RecipeSummary[] (src/graph.ts's getRecipes()), already sorted
// by `trivial` ascending — rendered as-is as the leveling guide, one row per
// recipe: a Craftable/Trivial skill-badge pair (trivial is sourced fact;
// craftable is `success.p25`, a computed estimate — see recipeSuccessThresholds()
// in src/graph.ts and decisions/tradeskill-recipe-node-schema.md for the
// formula's own provenance), the recipe name plus which `container` it's
// crafted in, then its full ingredient list (quantity prefixed only when
// >1, same "absent = 1" convention as the underlying edge attribute)
// arrow-ing into the produced item. Every ingredient/produced chip is a
// real link (same reasoning as quest-shared's itemChip: desktop hover shows
// <detail-tooltip> via #itemsById below, touch gets a bare wiki-page tap)
// since a recipe row is exactly the place a player wants to check an
// ingredient's own stats/source without leaving the guide.
//
// `vendors` is TradeskillVendorSummary[] (getTradeskillVendors()), already
// sorted by zoneLabel then label — grouped here by zoneLabel into its own
// subheading per zone (trades.js's zone-select filter already narrowed this
// to one zone when set, so the common multi-zone case is "any zone", not a
// rare fallback). Items sold render as plain text, not chips — the
// ingredient list above already gives every item its own hoverable chip, so
// repeating that here would just be the same tooltip reachable two ways.
import { RESET_CSS } from "./reset.js";
import { wikiUrl } from "./card-base.js";
import { itemStats } from "./quest-shared.js";

// A real link out to the item's own eqlwiki.com page, not "#" -- same
// reasoning as zone-dossier's npc-drop-badge: desktop hover shows the
// <detail-tooltip> and click is suppressed in #wireItemTooltips() below,
// but touch has no hover, so a bare tap needs somewhere real to go.
//
// The produced item uses this exact same badge, unstyled by any "reward"
// color -- it's an ordinary item like any ingredient (decisions/
// tradeskill-recipe-node-schema.md), and the → it follows already says
// "this is the output," so giving it its own color on top of that read as a
// second kind of entity that doesn't actually exist in the data.
function ingredientChip(item) {
  const qtyPrefix = item.quantity && item.quantity !== 1 ? `${item.quantity}x ` : "";
  return `<a class="ingredient-badge" data-item-id="${item.id}" href="${wikiUrl(item.label)}" target="_blank" rel="noopener">${qtyPrefix}${item.label}</a>`;
}

function recipeRow(recipe) {
  const uses = recipe.uses.map(ingredientChip).join("");
  const produces = recipe.produces ? ingredientChip(recipe.produces) : "";
  const containerNote = recipe.container ? ` — Crafted in ${recipe.container.label}` : "";
  return `
    <div class="recipe-row">
      <span class="skill-badges">
        <span class="craftable-badge" title="Skill level at which this recipe becomes reasonably attemptable (~25% success)">Craftable ${recipe.success.p25}+</span>
        <span class="trivial-badge" title="Skill level at which this recipe stops reliably granting skill-ups">Triv ${recipe.trivial}</span>
      </span>
      <span class="recipe-body">
        <span class="recipe-name">${recipe.label}<span class="recipe-container">${containerNote}</span></span>
        <span class="recipe-formula">${uses}${produces ? `<span class="recipe-arrow">→</span>${produces}` : ""}</span>
      </span>
    </div>
  `;
}

function vendorRow(vendor) {
  const sells = vendor.sells.map((i) => i.label).join(", ");
  return `
    <div class="vendor-row">
      <span class="vendor-name">${vendor.label}</span>
      <span class="vendor-sells">${sells}</span>
    </div>
  `;
}

// One subheading per zone, in the order vendors already arrives sorted by
// (zoneLabel, label) — no separate re-grouping/sorting pass needed here.
function vendorGroupsHtml(vendors) {
  if (!vendors.length) return `<div class="dossier-empty">No vendors found for this zone.</div>`;
  const groups = [];
  let current = null;
  for (const v of vendors) {
    if (!current || current.zoneLabel !== v.zoneLabel) {
      current = { zoneLabel: v.zoneLabel, vendors: [] };
      groups.push(current);
    }
    current.vendors.push(v);
  }
  return groups
    .map((g) => `
      <div class="vendor-group">
        <div class="vendor-zone-label">${g.zoneLabel}</div>
        <div class="vendor-list">${g.vendors.map(vendorRow).join("")}</div>
      </div>
    `)
    .join("");
}

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
${RESET_CSS}
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
.tradeskill-name {
  font-family: var(--font-display);
  font-size: 19px; font-weight: 700; color: var(--parchment);
  letter-spacing: 0.02em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}
.recipe-count-badge {
  font-size: 12px; padding: 3px 10px; border-radius: 3px;
  background: var(--panel-deep);
  border: 1px solid; border-color: var(--edge-lo) var(--edge-lo) #5a5570 #5a5570;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
  color: #c9a25e;
  font-variant-numeric: tabular-nums;
}

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

.dossier-body { display: flex; flex-direction: column; gap: 22px; }

.dossier-section-label {
  font-family: var(--font-display);
  font-size: 13px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--parch-accent);
  padding-bottom: 5px; margin-bottom: 11px;
  border-bottom: 2px solid var(--parch-accent);
}
.dossier-empty { font-size: 12px; font-style: italic; color: var(--parch-ink-soft); }

.recipe-list { display: flex; flex-direction: column; }
.recipe-row { display: flex; align-items: flex-start; gap: 12px; flex-wrap: wrap; padding: 10px 0; }
.recipe-row:not(:first-child) { border-top: 1px solid var(--parch-line); }
.skill-badges { display: flex; flex-direction: column; gap: 4px; flex-shrink: 0; }
.trivial-badge {
  font-family: var(--font-display); font-size: 11px; font-weight: 700;
  color: var(--parch-bg);
  background: radial-gradient(circle at 65% 30%, var(--parch-accent), #4a3004 70%);
  border-radius: 3px; padding: 3px 8px;
  box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.35);
  font-variant-numeric: tabular-nums;
  text-align: center;
}
/* Muted/outline where .trivial-badge is solid/filled -- "trivial" is the
   hard fact (sourced straight off eqlwiki), "craftable" is a computed
   estimate (recipeSuccessThresholds() in src/graph.ts), and the two
   shouldn't read as equally authoritative. */
.craftable-badge {
  font-size: 10px; font-weight: 700;
  color: var(--parch-ink-soft);
  background: rgba(122, 96, 42, 0.08);
  border: 1px solid var(--parch-line);
  border-radius: 3px; padding: 2px 7px;
  font-variant-numeric: tabular-nums;
  text-align: center; cursor: help;
  white-space: nowrap;
}
.recipe-body { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.recipe-name { font-weight: 700; color: var(--parch-ink); font-size: 13px; }
.recipe-container { font-weight: 400; font-style: italic; font-size: 11px; color: var(--parch-ink-soft); }
.recipe-formula { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.recipe-arrow { color: var(--parch-accent); font-weight: 700; }

/* Same amber "item" gem language as zone-dossier's own .npc-drop-badge --
   a different file since this card has no reason to import that one's full
   CSS blob, but the color says "this is loot" the same way across both
   pages (see that file's own comment for the origin of this language). Used
   for both ingredients and the produced item alike -- both are ordinary
   items (decisions/tradeskill-recipe-node-schema.md), so both get the same
   treatment; only the → in .recipe-formula marks which one is the output. */
.ingredient-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 1px 7px 1px 5px; border-radius: 3px;
  font-size: 11px; cursor: help; text-decoration: none;
  background: rgba(122, 77, 5, 0.1); color: #6a4204; border: 1px solid rgba(122, 77, 5, 0.4);
}
.ingredient-badge::before {
  content: ""; width: 7px; height: 7px; border-radius: 2px; flex-shrink: 0;
  background: radial-gradient(circle at 65% 30%, #ffd97a, #c98f1f 55%, #6e4a0d);
  box-shadow: inset 0 0 1px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 0, 0, 0.4);
}
@media (pointer: coarse) { .ingredient-badge { cursor: pointer; } }

.vendor-group + .vendor-group { margin-top: 16px; }
.vendor-zone-label { font-size: 12px; font-weight: 700; color: var(--parch-accent); margin-bottom: 6px; }
.vendor-list { display: flex; flex-direction: column; }
.vendor-row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; padding: 6px 0; font-size: 13px; }
.vendor-row:not(:first-child) { border-top: 1px solid var(--parch-line); }
.vendor-name { font-weight: 700; color: var(--parch-ink); flex-shrink: 0; }
.vendor-sells { color: var(--parch-ink-soft); font-size: 12px; text-align: right; }
`);

class TradeskillDossier extends HTMLElement {
  #data = null;
  #itemsById = new Map();

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
      this.shadowRoot.innerHTML = `
        <div class="dossier-header">
          <span class="tradeskill-name"></span>
          <span class="recipe-count-badge"></span>
        </div>
        <div class="dossier-scroll">
          <div class="dossier-body">
            <div>
              <div class="dossier-section-label">Leveling Guide</div>
              <div class="recipe-list"></div>
            </div>
            <div>
              <div class="dossier-section-label">Vendors</div>
              <div class="vendor-groups"></div>
            </div>
          </div>
        </div>
      `;
      this.#wireItemTooltips();
    }
    this.render();
  }

  // Same event-delegation shape as zone-dossier's #wireDropTooltips -- reads
  // from #itemsById (rebuilt each render()) rather than a parent-supplied
  // findItem callback, since this component owns its own recipe/item data.
  #wireItemTooltips() {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    this.shadowRoot.addEventListener("mouseover", (e) => {
      const chip = e.target.closest(".ingredient-badge[data-item-id]");
      if (!chip) return;
      const item = this.#itemsById.get(chip.dataset.itemId);
      if (item) document.getElementById("detail-tooltip")?.show({ name: item.label, description: item.source, stats: itemStats(item) }, chip);
    });
    this.shadowRoot.addEventListener("mouseout", (e) => {
      if (!e.relatedTarget?.closest?.(".ingredient-badge[data-item-id]")) {
        document.getElementById("detail-tooltip")?.hide();
      }
    });
    this.shadowRoot.addEventListener("click", (e) => {
      if (e.target.closest(".ingredient-badge[data-item-id]")) e.preventDefault(); // hover is sufficient on desktop; no wiki page to send a tap to
    });
  }

  setData(data) {
    this.#data = data;
    if (this.shadowRoot) this.render();
  }

  render() {
    const d = this.#data;
    if (!d) return;
    const { tradeskillLabel, recipes, vendors } = d;

    this.shadowRoot.querySelector(".tradeskill-name").textContent = tradeskillLabel;
    this.shadowRoot.querySelector(".recipe-count-badge").textContent = `${recipes.length} Recipe${recipes.length === 1 ? "" : "s"}`;

    this.#itemsById = new Map(recipes.flatMap((r) => [...r.uses, ...(r.produces ? [r.produces] : [])]).map((i) => [i.id, i]));

    const recipeListEl = this.shadowRoot.querySelector(".recipe-list");
    recipeListEl.innerHTML = recipes.length
      ? recipes.map(recipeRow).join("")
      : `<div class="dossier-empty">No recipes catalogued yet for this tradeskill.</div>`;

    this.shadowRoot.querySelector(".vendor-groups").innerHTML = vendorGroupsHtml(vendors);
  }
}

customElements.define("tradeskill-dossier", TradeskillDossier);
