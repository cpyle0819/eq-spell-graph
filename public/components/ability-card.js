// <ability-card>, with `.setData(ability, selectedClasses)` set as one
// atomic call. Renders Rogue poison disciplines, Backstab, Kick, Taunt,
// etc. — class-defining special combat actions that aren't spells/
// stances/invocations/AAs (see migration 018 in DECISIONS.md). The
// class_levels shape/lookup mirrors spell-card's, since several of these
// grant to multiple classes at different levels.
import { CardBase, classBadges, fmtDuration } from "./card-base.js";

class AbilityCard extends CardBase {
  #ability = null;
  #selected = [];

  setData(ability, selected) {
    this.#ability = ability;
    this.#selected = selected;
    if (this.shadowRoot) this.render();
  }

  render() {
    const ability = this.#ability;
    if (!ability) return;
    const levelLookup = (c) => ability.class_levels.find((cl) => cl.class === c)?.level;
    // "Combat"/"Utility" is a poison-specific classification (Rogue
    // disciplines only) — labeled "X Poison" rather than a bare "Combat"/
    // "Utility" so it doesn't read as a general ability taxonomy that only
    // some entries happen to have. "special" (everything else hand-curated)
    // gets no badge at all; there's nothing informative to say.
    const badges = [
      ability.category && ability.category !== "special" ? `<span class="spell-badge type-badge">${ability.category.charAt(0).toUpperCase() + ability.category.slice(1)} Poison</span>` : "",
      ability.reuseTime ? `<span class="spell-badge mana-badge">${ability.reuseTime} reuse</span>` : "",
      classBadges(ability.class_levels.map((cl) => cl.class), this.#selected, levelLookup),
    ].join("");
    const duration = fmtDuration(ability.duration);
    this.shadowRoot.innerHTML = `
      <div class="spell-header"><h3>${ability.name}</h3></div>
      <div class="spell-scroll">
        <div class="spell-badges">${badges}</div>
        <p class="spell-desc">${ability.description}</p>
        ${duration ? `<div class="spell-stats"><span class="stat-tag">Duration: ${duration}</span></div>` : ""}
      </div>
    `;
  }
}

customElements.define("ability-card", AbilityCard);
