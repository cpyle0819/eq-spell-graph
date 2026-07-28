// <item-chip item-id="item:xxx" label="Display Name" quantity="2">
// (or `.setData(item)` with a full ItemSummary, optionally carrying
// `quantity` -- the same shape a recipe's own resolved ingredient list
// already uses). The one rendering of "an item" used everywhere in this
// app: a yellow gem dot, its name, and a real link to the item's own
// eqlwiki.com page. Desktop hover shows the page's shared <detail-tooltip>
// singleton with the item's full stat block; touch has no hover, so a bare
// tap falls through to the wiki link instead.
//
// The `item-id`/`label`/`quantity` attributes alone are enough to render
// the visible chip and its link -- leveling-guide.html authors chips this
// way directly in static prose, before any stat data exists, then enriches
// them with `.setData()` once it fetches the matching items by id
// (hydrateItemChips() below is the shared version of that same "markup
// first, data after" step, for every card that builds its item chips as an
// HTML string rather than one at a time).
import { RESET_CSS } from "./reset.js";
import { wikiUrl } from "./card-base.js";

// Shapes an ItemSummary (decisions/item-node-schema.md) into
// <detail-tooltip>'s generic { text, highlight? }[] stat-chip contract --
// slots is the one highlighted chip, everything else plain. Every field is
// optional on the source data, so each line is independently skippable -- a
// container has weight/size and nothing else, a weapon has damage/delay/
// skill and usually no resists.
const STAT_LABELS = { str: "STR", sta: "STA", agi: "AGI", dex: "DEX", wis: "WIS", int: "INT", cha: "CHA" };
const RESIST_LABELS = { poison: "Poison", disease: "Disease", fire: "Fire", cold: "Cold", magic: "Magic" };

function titleCase(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function itemStats(item) {
  const stats = [];
  if (item.slots?.length) stats.push({ text: item.slots.join("/"), highlight: true });
  if (item.ac != null) stats.push({ text: `${item.ac} AC` });
  if (item.damage != null) stats.push({ text: `${item.damage} dmg` });
  if (item.delay != null) stats.push({ text: `${item.delay} delay` });
  if (item.skill) stats.push({ text: item.skill });
  for (const [key, label] of Object.entries(STAT_LABELS)) {
    const v = item.stats?.[key];
    if (v) stats.push({ text: `${v > 0 ? "+" : ""}${v} ${label}` });
  }
  if (item.hp != null) stats.push({ text: `+${item.hp} HP` });
  if (item.mana != null) stats.push({ text: `+${item.mana} Mana` });
  for (const [key, label] of Object.entries(RESIST_LABELS)) {
    const v = item.resists?.[key];
    if (v) stats.push({ text: `${v > 0 ? "+" : ""}${v} SV ${label}` });
  }
  if (item.effect) stats.push({ text: `Effect: ${item.effect}` });
  if (item.lightSource) stats.push({ text: "Light Source" });
  if (item.weight != null) stats.push({ text: `WT ${item.weight}` });
  if (item.size) stats.push({ text: item.size });
  if (item.capacity != null) stats.push({ text: `${item.capacity} slots${item.containerSize ? ` (${item.containerSize} max)` : ""}` });
  if (item.classes?.length) stats.push({ text: item.classes.map(titleCase).join(", ") });
  if (item.magic) stats.push({ text: "Magic" });
  if (item.lore) stats.push({ text: "Lore" });
  if (item.noTrade) stats.push({ text: "No Trade" });
  if (item.value) stats.push({ text: item.value });
  return stats;
}

// Every card that builds its item chips as one HTML string (quest rewards,
// npc drops, recipe formulas) emits this tag, then calls hydrateItemChips()
// once that markup is in the DOM to attach each chip's full data.
//
// `navHref`, when given, points the chip at an in-app destination (e.g.
// recipe-card.js's own formula ingredients deep-linking to that item's own
// ingredient-card on the Tradeskills page) instead of this item's eqlwiki.com
// page -- the one case where "click" means "go see this specific thing here
// in this app" rather than "go read about it on the wiki." The gem-dot/name/
// hover-tooltip rendering itself never changes; only the click destination
// does, so this stays the one item component (decisions/
// item-hover-uses-generic-detail-tooltip.md), not a second rendering.
export function itemChipTag(item, { navHref } = {}) {
  const attrs = [`item-id="${item.id}"`, `label="${item.label}"`];
  if (item.quantity && item.quantity !== 1) attrs.push(`quantity="${item.quantity}"`);
  if (navHref) attrs.push(`nav-href="${navHref}"`);
  return `<item-chip ${attrs.join(" ")}></item-chip>`;
}

// findItem(id) resolves an already-rendered chip's item-id to its full
// ItemSummary -- the same lookup shape every call site already builds for
// its own drops/rewards/ingredients.
export function hydrateItemChips(root, findItem) {
  for (const chip of root.querySelectorAll("item-chip[item-id]")) {
    const item = findItem(chip.itemId);
    if (item) chip.hydrate(item);
  }
}

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
${RESET_CSS}
:host { display: inline-flex; }
.chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 1px 7px 1px 5px; border-radius: 3px;
  font-size: 11px; cursor: help; text-decoration: none;
  background: rgba(122, 77, 5, 0.1); color: #6a4204; border: 1px solid rgba(122, 77, 5, 0.4);
}
.gem {
  width: 7px; height: 7px; border-radius: 2px; flex-shrink: 0;
  background: radial-gradient(circle at 65% 30%, #ffd97a, #c98f1f 55%, #6e4a0d);
  box-shadow: inset 0 0 1px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 0, 0, 0.4);
}
@media (pointer: coarse) { .chip { cursor: pointer; } }
:host([nav-href]) .chip { cursor: pointer; }
`);

class ItemChip extends HTMLElement {
  #item = null; // full ItemSummary once .setData() supplies it; tooltip shows nothing to enrich until then

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
      this.shadowRoot.innerHTML = `<a class="chip" target="_blank" rel="noopener"><span class="gem" aria-hidden="true"></span><span class="label"></span></a>`;
      this.#wireEvents();
    }
    this.render();
  }

  get itemId() { return this.getAttribute("item-id"); }

  // For a caller that has the full, correct-for-this-one-occurrence item in
  // hand already (id, label, and quantity all belonging together) -- sets
  // every attribute, including quantity.
  setData(item) {
    this.#item = item;
    if (item.id) this.setAttribute("item-id", item.id);
    if (item.label) this.setAttribute("label", item.label);
    if (item.quantity != null) this.setAttribute("quantity", String(item.quantity));
    if (this.shadowRoot) this.render();
  }

  // For hydrateItemChips()'s "markup first, data after" path: attaches an
  // item's stat data for the tooltip only, without touching label/quantity.
  // findItem(id) is keyed by item id, deduped across every recipe/reward
  // that references it -- fine for stats (the same item has the same
  // stats everywhere), wrong for quantity (how many *this* chip's own
  // recipe/reward uses, which the same item can differ on between
  // occurrences). itemChipTag() already baked the correct quantity into
  // this chip's own attribute at markup time; hydrate() must not overwrite
  // it with whatever quantity a different occurrence of the same item id
  // happens to carry.
  hydrate(item) {
    this.#item = item;
  }

  render() {
    const label = this.getAttribute("label") || "";
    const quantity = Number(this.getAttribute("quantity"));
    const qtyPrefix = quantity && quantity !== 1 ? `${quantity}x ` : "";
    const navHref = this.getAttribute("nav-href");
    const a = this.shadowRoot.querySelector("a");
    a.href = navHref || wikiUrl(label);
    if (navHref) a.removeAttribute("target"); // in-app link -- same tab, router-handled, not a new wiki tab
    this.shadowRoot.querySelector(".label").textContent = `${qtyPrefix}${label}`;
  }

  #wireEvents() {
    const a = this.shadowRoot.querySelector("a");
    a.addEventListener("mouseenter", () => {
      if (!this.#item || !window.matchMedia("(pointer: fine)").matches) return;
      document.getElementById("detail-tooltip")?.show({ name: this.#item.label, description: this.#item.source, stats: itemStats(this.#item) }, a);
    });
    a.addEventListener("mouseleave", () => document.getElementById("detail-tooltip")?.hide());
    // A plain item chip has no real click destination on desktop -- hover
    // already shows everything, and only touch's bare tap should fall
    // through to the wiki link. `nav-href` is the one exception: it's a real
    // in-app destination, so it should navigate on click same as any other
    // link, on desktop as well as touch (the router intercepts it either
    // way, same as any other same-origin link -- decisions/
    // client-side-shell-router.md).
    a.addEventListener("click", (e) => {
      if (!this.hasAttribute("nav-href") && window.matchMedia("(pointer: fine)").matches) e.preventDefault();
    });
  }
}

customElements.define("item-chip", ItemChip);
