// <stance-card>, with `.setData(item, selectedClasses)` set as one atomic
// call. Renders a Stances or Invocations entry (both tabs use the same
// shape: name, class badges, description — neither carries level data,
// since both are granted at level 1, unlike spell.class_levels).
import { CardBase, classBadges } from "./card-base.js";

class StanceCard extends CardBase {
  #item = null;
  #selected = [];

  setData(item, selected) {
    this.#item = item;
    this.#selected = selected;
    if (this.shadowRoot) this.render();
  }

  render() {
    const item = this.#item;
    if (!item) return;
    this.shadowRoot.innerHTML = `
      <div class="spell-header"><h3>${item.name}</h3></div>
      <div class="spell-scroll">
        <div class="spell-badges">${classBadges(item.classes, this.#selected)}</div>
        <p class="spell-desc">${item.description}</p>
      </div>
    `;
  }
}

customElements.define("stance-card", StanceCard);
