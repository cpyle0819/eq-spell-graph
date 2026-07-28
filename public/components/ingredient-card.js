// <ingredient-card>, with `.setData({ item, usedIn, vendorGroups })` set as
// one atomic call. One tradeskill ingredient as its own card -- the other
// half of tradeskill-dossier.js's split (issue #32's second pass, see
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
// full for the page's Leveling Guide.
//
// Sold By is wrapped in a <collapsible-section>, collapsed by default --
// an ingredient can be sold across a dozen zones, and every ingredient on
// the page renders its own copy, so leaving all of them expanded by
// default would make the page enormous. Used In stays plain/always-visible
// -- it's usually 1-2 recipes, never long enough to need hiding.
// collapsible-section's own default styling (light text on dark stone) is
// built for exactly the context sidebar-panel already places it in; here
// it's nested inside this card's *light* parchment scroll instead, so
// `--parchment` is overridden inline to the parchment-appropriate ink
// color it already reads via ordinary CSS custom-property inheritance --
// no shadow-DOM styling hack, just handing it a different value for the
// one var that needs it (`--parch-line` is already the same color in both
// contexts, so only `--parchment` needs the override).
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
  if (!vendorGroups.length) return `<div class="ingredient-empty">No known vendor sells this.</div>`;
  return vendorGroups
    .map((g) => `
      <div class="ingredient-vendor-group">
        <div class="ingredient-vendor-zone"><a href="maps.html?to=${encodeURIComponent(g.zoneLabel)}">${g.zoneLabel}</a></div>
        ${g.vendors.map((v) => `<div class="ingredient-vendor-row">${v.label}</div>`).join("")}
      </div>
    `)
    .join("");
}

const EXTRA_SHEET = new CSSStyleSheet();
EXTRA_SHEET.replaceSync(`
${QUEST_CARD_CSS}
.ingredient-empty { font-style: italic; color: var(--parch-ink-soft); font-size: 12px; }
.ingredient-sold-by { margin-top: 12px; }
.ingredient-vendor-group + .ingredient-vendor-group { margin-top: 10px; }
.ingredient-vendor-zone { font-size: 11px; font-weight: 700; color: var(--parch-accent); margin-bottom: 4px; }
.ingredient-vendor-zone a { color: inherit; text-decoration: none; }
.ingredient-vendor-zone a:hover, .ingredient-vendor-zone a:focus-visible { text-decoration: underline; }
.ingredient-vendor-row { font-size: 13px; color: #4a4232; padding: 2px 0; }
.ingredient-used-in-link { text-decoration: none; cursor: pointer; }
.ingredient-used-in-link:hover, .ingredient-used-in-link:focus-visible { text-decoration: underline; background: rgba(0, 0, 0, 0.1); }
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
    const { item, usedIn, vendorGroups } = d;
    const vendorCount = vendorGroups.reduce((n, g) => n + g.vendors.length, 0);

    this.shadowRoot.innerHTML = `
      <div class="spell-header">
        <h3>${item.label}</h3>${wikiLink(item.label)}
        <button type="button" class="add-shopping-btn" data-item-id="${item.id}" data-item-label="${item.label}">+ Shopping List</button>
      </div>
      <div class="spell-scroll">
        ${section("Used In", usedInBody(usedIn))}
        <div class="ingredient-sold-by">
          <collapsible-section label="Sold By (${vendorCount})" section="sold-by" collapsed style="--parchment: var(--parch-ink); --header-text-shadow: none;">
            ${vendorGroupsBody(vendorGroups)}
          </collapsible-section>
        </div>
      </div>
    `;
  }
}

customElements.define("ingredient-card", IngredientCard);
