// <ingredient-card>, with `.setData({ item, usedIn, vendorGroups, sources })`
// set as one atomic call. One tradeskill ingredient as its own card -- the
// other half of tradeskill-dossier.js's split (issue #32's second pass, see
// recipe-card.js's own header comment and decisions/
// tradeskill-recipe-node-schema.md).
//
// `item` is any item a tradeskill recipe `uses` (an ItemSummary; trades.js
// resolves the distinct set straight off the same /api/recipes response
// recipe-card.js already renders -- no separate "ingredients" endpoint
// yet). `usedIn` is every recipe of the current tradeskill that consumes
// it: `{ recipeId, recipeLabel, quantity }[]`. `vendorGroups` is that same
// ingredient's own slice of /api/tradeskill-vendors, grouped by zoneLabel
// (already alphabetical -- same "walk in sorted order, break on zoneLabel
// change" grouping tradeskill-dossier.js's own vendorGroupsHtml() used).
// trades.js does this slicing/grouping client-side rather than adding a
// new per-item API route, since both source arrays are already fetched in
// full for the page's Leveling Guide. `sources` is /api/item-sources'
// per-item ItemSourceSummary (src/graph.ts's getItemSources, issue #55) --
// Foraged In/Fished From/Dropped By/Crafted In, every non-vendor way to
// obtain the ingredient.
//
// Sections render in order Crafted In, Foraged In, Fished From, Dropped
// By, Used In, Sold By -- roughly most- to least-actionable ("make it
// yourself" beats "walk to a zone" beats "kill something specific" beats
// "hand someone money"), all above Sold By per issue #55. Each of the four
// new sections only renders at all when non-empty (`section()` already
// no-ops on empty bodyHtml) -- most ingredients only have 1-2 of the four.
//
// Sold By used to be a <collapsible-section> (dark-stone styling, always
// collapsed by default). Issue #55 asked it to look like the other
// sections instead, just collapsed once its vendor list is long -- so it's
// now the same plain section() every other section uses, with the vendor
// list itself wrapped in a native <details> only when vendorCount > 10
// (open by default otherwise, matching every other section's "just show
// it" default).
import { CardBase, wikiLink } from "./card-base.js";
import { QUEST_CARD_CSS, section } from "./quest-shared.js";

// This button only ever renders inside an ingredient-card -- i.e. only for
// an item already established (by trades.js's own buildIngredientEntries())
// to be a genuine recipe ingredient, never for e.g. a quest reward or NPC
// drop item-chip elsewhere in the app. That's deliberate: "add to shopping
// list" is scoped to this one unambiguous context rather than bolted onto
// item-chip.js itself (the app's single shared item-rendering component),
// which renders items in plenty of contexts that aren't shopping-relevant.

function usedInBody(usedIn) {
  if (!usedIn.length) return `<div class="quest-section-body ingredient-empty">Not used by any catalogued recipe.</div>`;
  const chips = usedIn
    .map((u) => {
      const qty = u.quantity && u.quantity !== 1 ? `${u.quantity}x ` : "";
      return `<a class="spell-badge skill-badge ingredient-used-in-link" href="trades.html?type=recipes&search=${encodeURIComponent(u.recipeLabel)}">${qty}${u.recipeLabel}</a>`;
    })
    .join("");
  return `<div class="quest-section-body spell-badges">${chips}</div>`;
}

function vendorGroupsBody(vendorGroups) {
  return vendorGroups
    .map((g) => `
      <div class="ingredient-vendor-group">
        <div class="ingredient-vendor-zone"><a href="maps.html?to=${encodeURIComponent(g.zoneLabel)}">${g.zoneLabel}</a></div>
        ${g.vendors.map((v) => `<div class="ingredient-vendor-row">${v.label}</div>`).join("")}
      </div>
    `)
    .join("");
}

// Sold By, restyled to match Crafted In/Foraged In/Fished From/Dropped By
// (plain section(), not the dark-stone <collapsible-section>) but still
// collapsible once the list gets long -- a native <details> rather than
// the custom element, since all this needs is "hide it behind a click,"
// not collapsible-section's toggle-event/section-id machinery (nothing
// here persists collapse state the way faction/quest sidebar sections do).
function soldByBody(vendorGroups, vendorCount) {
  if (!vendorCount) return `<div class="ingredient-empty">No known vendor sells this.</div>`;
  const body = vendorGroupsBody(vendorGroups);
  if (vendorCount <= 10) return body;
  return `<details class="ingredient-collapse"><summary>${vendorCount} vendors -- click to expand</summary>${body}</details>`;
}

// Foraged In / Fished From -- a bare list of zones, same chip style as
// Used In's own recipe links (usedInBody above), just linking to Maps
// instead of a recipe search.
function zoneChipsBody(zones) {
  if (!zones.length) return "";
  const chips = zones
    .map((z) => `<a class="spell-badge skill-badge ingredient-used-in-link" href="maps.html?to=${encodeURIComponent(z.zoneLabel)}">${z.zoneLabel}</a>`)
    .join("");
  return `<div class="quest-section-body spell-badges">${chips}</div>`;
}

// Dropped By -- needs the specific mob name(s) per zone (when eqlwiki's
// own page named one), so it reuses the zone-group/row shape Sold By
// already has rather than zoneChipsBody's plain link list.
function droppedByBody(dropped) {
  if (!dropped.length) return "";
  const body = dropped
    .map((d) => `
      <div class="ingredient-vendor-group">
        <div class="ingredient-vendor-zone"><a href="maps.html?to=${encodeURIComponent(d.zoneLabel)}">${d.zoneLabel}</a></div>
        ${d.mobs.length ? `<div class="ingredient-vendor-row">${d.mobs.join(", ")}</div>` : ""}
      </div>
    `)
    .join("");
  return `<div class="quest-section-body">${body}</div>`;
}

// Crafted In -- recipes (any tradeskill, not just the one currently being
// browsed -- e.g. Baking's own Beer Braised Mammoth calls for Short Beer,
// a Brewing product) that `produces` this ingredient, so a player can make
// it instead of buying/foraging/fishing/killing for it. Cross-tradeskill
// entries carry a "(Tradeskill)" note since that context isn't otherwise
// visible on this card.
function craftedInBody(craftedIn) {
  if (!craftedIn.length) return "";
  const chips = craftedIn
    .map((r) => `<a class="spell-badge skill-badge ingredient-used-in-link" href="trades.html?type=recipes&search=${encodeURIComponent(r.recipeLabel)}">${r.recipeLabel} <span class="ingredient-tradeskill-note">(${r.tradeskill})</span></a>`)
    .join("");
  return `<div class="quest-section-body spell-badges">${chips}</div>`;
}

const EXTRA_SHEET = new CSSStyleSheet();
EXTRA_SHEET.replaceSync(`
${QUEST_CARD_CSS}
.ingredient-empty { font-style: italic; color: var(--parch-ink-soft); font-size: 12px; }
.ingredient-vendor-group + .ingredient-vendor-group { margin-top: 10px; }
.ingredient-vendor-zone { font-size: 11px; font-weight: 700; color: var(--parch-accent); margin-bottom: 4px; }
.ingredient-vendor-zone a { color: inherit; text-decoration: none; }
.ingredient-vendor-zone a:hover, .ingredient-vendor-zone a:focus-visible { text-decoration: underline; }
.ingredient-vendor-row { font-size: 13px; color: #4a4232; padding: 2px 0; }
.ingredient-used-in-link { text-decoration: none; cursor: pointer; }
.ingredient-used-in-link:hover, .ingredient-used-in-link:focus-visible { text-decoration: underline; background: rgba(0, 0, 0, 0.1); }
.ingredient-tradeskill-note { opacity: 0.7; }
/* Native <details>, not collapsible-section -- see soldByBody()'s own
   comment for why this card doesn't need the custom element here. */
.ingredient-collapse > summary {
  list-style: none; cursor: pointer; font-size: 12px; color: var(--parch-accent);
  padding: 2px 0;
}
.ingredient-collapse > summary::-webkit-details-marker { display: none; }
.ingredient-collapse > summary::before {
  content: "▾"; display: inline-block; font-size: 9px; margin-right: 6px;
  transition: transform 0.15s ease;
}
.ingredient-collapse:not([open]) > summary::before { transform: rotate(-90deg); }
.ingredient-collapse[open] > summary { margin-bottom: 6px; }
.add-shopping-btn {
  margin-left: auto; font-size: 11px; color: var(--gold); background: none; border: none;
  padding: 0; cursor: pointer; text-decoration: none; white-space: nowrap; font-family: var(--font-body);
}
.add-shopping-btn:hover, .add-shopping-btn:focus-visible { text-decoration: underline; }
`);

class IngredientCard extends CardBase {
  static extraSheet = EXTRA_SHEET;

  #data = null;

  setData(data) {
    this.#data = data;
    if (this.shadowRoot) this.render();
  }

  // Delegated on shadowRoot (not a specific button) so it keeps working
  // across render() rebuilding the header's innerHTML -- same pattern as
  // spell-card.js's own wireEvents().
  wireEvents() {
    this.shadowRoot.addEventListener("click", (e) => {
      const btn = e.target.closest(".add-shopping-btn");
      if (!btn) return;
      this.dispatchEvent(new CustomEvent("add-shopping-item", {
        bubbles: true, composed: true,
        detail: { id: btn.dataset.itemId, label: btn.dataset.itemLabel },
      }));
    });
  }

  render() {
    const d = this.#data;
    if (!d) return;
    const { item, usedIn, vendorGroups, sources } = d;
    const vendorCount = vendorGroups.reduce((n, g) => n + g.vendors.length, 0);

    this.shadowRoot.innerHTML = `
      <div class="spell-header">
        <h3>${item.label}</h3>${wikiLink(item.label)}
        <button type="button" class="add-shopping-btn" data-item-id="${item.id}" data-item-label="${item.label}">+ Shopping List</button>
      </div>
      <div class="spell-scroll">
        ${section("Crafted In", craftedInBody(sources.craftedIn))}
        ${section("Foraged In", zoneChipsBody(sources.foraged))}
        ${section("Fished From", zoneChipsBody(sources.fished))}
        ${section("Dropped By", droppedByBody(sources.dropped))}
        ${section("Used In", usedInBody(usedIn))}
        ${section(`Sold By (${vendorCount})`, soldByBody(vendorGroups, vendorCount))}
      </div>
    `;
  }
}

customElements.define("ingredient-card", IngredientCard);
