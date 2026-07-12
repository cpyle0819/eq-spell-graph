// <quest-card>, with `.setData(quest)` set as one atomic call. Renders a
// quest entry as labeled sections (Description, Starts In, Steps, Rewards)
// rather than one flat chip row -- a badge-per-fact layout got unreadable
// once class/level/giver/zone/xp/item/faction all competed for the same
// spot. Starts In links the starting zone to Route Finder (same ?to=
// convention as spell-card's vendor zones); Rewards chips carry a `title`
// for hover detail (same cursor:help + title idiom as zone-card's
// faction-badge) -- item/faction nodes are label-only for now (see
// decisions/quest-reward-modeling.md), so the tooltip states the reward
// *kind*, and will show real detail once those nodes grow fields.
// No wiki link: quests aren't scraped from eqlwiki.com (no scraping yet at
// all — see CLAUDE.md), so there's no real page to point at.
//
// Item reward chips reuse the same <detail-tooltip> singleton the Spell
// Finder uses (public/components/detail-tooltip.js, one instance per page
// -- quests.html has its own) via the exact hover wiring zone-card.js uses
// for spell-chips: mouseover/mouseout on the shadow root, matched by a
// data-item-id, calling the tooltip's imperative .show()/.hide().
// detail-tooltip is a generic { name, description?, stats? } renderer with
// no field-level knowledge of any entity type -- fed only `{ name }` here
// since item nodes are label-only for now (see decisions/
// quest-reward-modeling.md), so today's popup is a bare name card. It'll
// show real detail for free once item nodes grow a description/stats, no
// changes needed here or in detail-tooltip.js itself. Faction/XP chips stay
// native-`title` tooltips — they're not graph entities, so there's nothing
// more to pop up.
//
// Design pass: reuses the app's existing hand-drawn "gem" motif (radial-
// gradient swatch, specular highlight biased top-right — same construction
// as zone-card's zone-name LED and spell-chip's gem) rather than inventing
// new iconography, applied here for the first time to a waypoint dot on
// Starts In and to reward chips (green=XP, amber=item, violet=faction) so
// Rewards reads as loot at a glance instead of flat text. The one bespoke
// touch is Steps: each is a wax-seal ink numeral instead of a browser list
// marker — order there is real information (talk to the NPC before you can
// turn in the ore), so it's marked, just in the scroll's own hand rather
// than a generic "1.".
import { CardBase, classBadges } from "./card-base.js";

const EXTRA_SHEET = new CSSStyleSheet();
EXTRA_SHEET.replaceSync(`
.quest-section { margin-top: 12px; }
.quest-section:first-of-type { margin-top: 0; }
.quest-section-label {
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em;
  color: var(--parch-ink-soft); font-weight: 700;
  padding-bottom: 3px; margin-bottom: 7px;
  border-bottom: 1px solid var(--parch-line);
}
.quest-section-body { font-size: 13px; color: #4a4232; line-height: 1.5; }

.quest-starts-in { display: flex; align-items: center; gap: 8px; }
.quest-waypoint {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  background: radial-gradient(circle at 65% 30%, #ffd97a, #c98f1f 55%, #6e4a0d);
  box-shadow: inset 0 0 1px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 0, 0, 0.55);
}
.quest-zone-link { color: var(--parch-accent); text-decoration: none; font-weight: 600; }
.quest-zone-link:hover, .quest-zone-link:focus-visible { text-decoration: underline; }
.quest-giver-note { color: var(--parch-ink-soft); }

.quest-steps { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; counter-reset: quest-step; }
.quest-steps li {
  counter-increment: quest-step;
  position: relative; padding-left: 27px; min-height: 18px;
  font-size: 13px; color: #4a4232; line-height: 1.5;
}
.quest-steps li::before {
  content: counter(quest-step);
  position: absolute; left: 0; top: 0;
  width: 18px; height: 18px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-size: 10px; font-weight: 700;
  color: var(--parch-bg);
  background: radial-gradient(circle at 65% 30%, var(--parch-accent), #4a3004 70%);
  box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.35);
}

.spell-badge.xp-badge, .spell-badge.item-badge, .spell-badge.faction-badge-reward {
  cursor: help; display: inline-flex; align-items: center; gap: 6px;
}
.spell-badge.xp-badge::before, .spell-badge.item-badge::before, .spell-badge.faction-badge-reward::before {
  content: ""; width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0;
  box-shadow: inset 0 0 1px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 0, 0, 0.4);
}
.xp-badge   { background: rgba(16, 122, 46, 0.1);  color: #157a3c; border: 1px solid rgba(16, 122, 46, 0.35); }
.xp-badge::before { background: radial-gradient(circle at 65% 30%, #7dffb0, #22c55e 60%, #157a3c); }
.item-badge { background: rgba(122, 77, 5, 0.1);   color: #6a4204; border: 1px solid rgba(122, 77, 5, 0.4); }
.item-badge::before { background: radial-gradient(circle at 65% 30%, #ffd97a, #c98f1f 55%, #6e4a0d); }
.faction-badge-reward { background: rgba(94, 42, 122, 0.1); color: #5e2a7a; border: 1px solid rgba(94, 42, 122, 0.4); }
.faction-badge-reward::before { background: radial-gradient(circle at 65% 30%, #d9a8ff, #9d5ec7 55%, #5e2a7a); }
`);

// "Level 5 – 15" / "Level 20+" / "Level ≤ 15" / "" (both bounds absent —
// no badge at all rather than a misleading "All Levels" chip cluttering
// every classless-and-levelless test quest).
function questLevelLabel(minLevel, maxLevel) {
  if (minLevel == null && maxLevel == null) return "";
  if (minLevel != null && maxLevel != null) return minLevel === maxLevel ? `Level ${minLevel}` : `Level ${minLevel} – ${maxLevel}`;
  if (minLevel != null) return `Level ${minLevel}+`;
  return `Level ≤ ${maxLevel}`;
}

function section(label, bodyHtml) {
  return bodyHtml ? `<div class="quest-section"><div class="quest-section-label">${label}</div>${bodyHtml}</div>` : "";
}

class QuestCard extends CardBase {
  static extraSheet = EXTRA_SHEET;

  #quest = null;
  #isMouseDevice = window.matchMedia("(pointer: fine)").matches;

  setData(quest) {
    this.#quest = quest;
    if (this.shadowRoot) this.render();
  }

  // Listening on shadowRoot itself (not `this`/the host) sees the real
  // internal e.target/e.relatedTarget directly -- event retargeting to the
  // host only applies to listeners outside the shadow tree (see
  // tag-input.js / zone-card.js's identical comment).
  wireEvents() {
    if (!this.#isMouseDevice) return; // touch devices: no hover tooltip, same as zone-card's spell-chip

    this.shadowRoot.addEventListener("mouseover", (e) => {
      const chip = e.target.closest(".item-badge[data-item-id]");
      if (!chip) return;
      const item = this.#quest?.itemRewards.find((i) => i.id === chip.dataset.itemId);
      if (item) document.getElementById("detail-tooltip")?.show({ name: item.label }, chip);
    });
    this.shadowRoot.addEventListener("mouseout", (e) => {
      if (!e.relatedTarget?.closest?.(".item-badge[data-item-id]")) {
        document.getElementById("detail-tooltip")?.hide();
      }
    });
  }

  render() {
    const quest = this.#quest;
    if (!quest) return;

    const levelLabel = questLevelLabel(quest.minLevel, quest.maxLevel);
    const headerBadges = [
      quest.classes.length ? classBadges(quest.classes, []) : `<span class="spell-badge class-badge">Any Class</span>`,
      levelLabel ? `<span class="spell-badge skill-badge">${levelLabel}</span>` : "",
    ].join("");

    const zoneLinks = quest.zones
      .map((z) => `<a class="quest-zone-link" href="route.html?to=${encodeURIComponent(z.label)}">${z.label}</a>`)
      .join(", ");
    const giverNames = quest.questGivers.map((g) => g.label).join(", ");
    const startsInBody = zoneLinks
      ? `<div class="quest-section-body quest-starts-in"><span class="quest-waypoint"></span><span>${zoneLinks}${giverNames ? ` <span class="quest-giver-note">(from ${giverNames})</span>` : ""}</span></div>`
      : giverNames
      ? `<div class="quest-section-body">${giverNames}</div>`
      : "";

    const descriptionBody = quest.description ? `<p class="spell-desc">${quest.description}</p>` : "";

    const stepsBody = quest.steps.length
      ? `<ol class="quest-steps">${quest.steps.map((s) => `<li>${s}</li>`).join("")}</ol>`
      : "";

    const rewardChips = [
      quest.total_experience ? `<span class="spell-badge xp-badge" title="Experience reward">${quest.total_experience} XP</span>` : "",
      ...quest.itemRewards.map((i) => `<span class="spell-badge item-badge" data-item-id="${i.id}">${i.label}</span>`),
      ...quest.factionRewards.map((f) => `<span class="spell-badge faction-badge-reward" title="Faction reward: ${f.label}">${f.label}</span>`),
    ].join("");
    const rewardsBody = rewardChips ? `<div class="spell-badges">${rewardChips}</div>` : "";

    this.shadowRoot.innerHTML = `
      <div class="spell-header"><h3>${quest.label}</h3></div>
      <div class="spell-scroll">
        <div class="spell-badges">${headerBadges}</div>
        ${section("Description", descriptionBody)}
        ${section("Starts In", startsInBody)}
        ${section("Steps", stepsBody)}
        ${section("Rewards", rewardsBody)}
      </div>
    `;
  }
}

customElements.define("quest-card", QuestCard);
