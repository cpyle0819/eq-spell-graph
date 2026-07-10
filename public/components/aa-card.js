// <aa-card>, with `.setData(aa, selectedClasses)` set as one atomic call.
// Renders an Alternate Advancement entry: name, ranks/cost/class badges,
// description. No interactive behavior — AA entries aren't clickable,
// unlike spell-card's vendor-list toggle.
import { CardBase, classBadges, wikiLink } from "./card-base.js";

class AaCard extends CardBase {
  #aa = null;
  #selected = [];

  setData(aa, selected) {
    this.#aa = aa;
    this.#selected = selected;
    if (this.shadowRoot) this.render();
  }

  render() {
    const aa = this.#aa;
    if (!aa) return;
    const badges = [
      `<span class="spell-badge type-badge">${aa.ranks} rank${aa.ranks === 1 ? "" : "s"}</span>`,
      `<span class="spell-badge mana-badge">${aa.cost} pts</span>`,
      classBadges(aa.classes, this.#selected),
    ].join("");
    this.shadowRoot.innerHTML = `
      <div class="spell-header"><h3>${aa.name}</h3>${wikiLink("Alternate Advancement")}</div>
      <div class="spell-scroll">
        <div class="spell-badges">${badges}</div>
        <p class="spell-desc">${aa.description}</p>
      </div>
    `;
  }
}

customElements.define("aa-card", AaCard);
