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
// Wiki link uses quest.wikiTitle (migration 030's wiki_title field, same
// convention as zone nodes -- decisions/wiki-links-per-entity-vs-shared-page.md),
// not a URL derived from the quest's own label: several real quests here
// share one page with no page of their own (all 7 Armor of Ro sub-quests
// point at the same "Armor of Ro Quests" page, same shared-page pattern as
// stances/invocations/AAs), and the fictional migration-026 test quest has
// no real page at all, so wikiTitle is simply absent for it -- no link
// renders rather than a guessed, likely-404 URL.
//
// quest.questLine (set when the quest is a member of a quest_line node --
// see decisions/quest-line-node-type.md) renders as a small muted caption
// next to the title, not its own section -- it's a fact about the quest's
// identity, not content on the same footing as Description/Steps/Rewards.
// A member quest also still renders as its own full quest-card when it
// shows up standalone (e.g. filtered results); quest-line-card.js renders
// the *same* Steps/Rewards markup again per member row (via quest-shared.js)
// rather than this component being reused/nested -- see that file's own
// header comment for why.
//
// Item reward chips reuse the same <detail-tooltip> singleton the Spell
// Finder uses (public/components/detail-tooltip.js, one instance per page
// -- quests.html has its own) via quest-shared.js's wireItemTooltips(),
// shared with quest-line-card.js. detail-tooltip itself has no field-level
// knowledge of any entity type -- quest-shared.js's itemStats() shapes an
// ItemSummary (full stat block per decisions/item-node-schema.md) into its
// generic { name, description?, stats? } contract, the same division of
// labor as zone-card.js's spellStats() for spells (see decisions/
// item-hover-uses-generic-detail-tooltip.md for why that split, not a
// tooltip subclass, is the pattern here). Faction/XP chips stay native-
// `title` tooltips — they're not graph entities, so there's nothing more to
// pop up. Spell reward chips are real links instead of a tooltip target —
// quest-shared.js's spellFinderPinUrl() sends them to the Spell Finder with
// that spell pre-filled, the same "Find in Spells" deep link spell-card.js
// already uses from the Class Browser.
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
// than a generic "1.". quest-line-card.js deliberately does NOT reuse this
// numeral for its own member roster (the 7 Armor of Ro pieces have no
// order between them) -- see that file for the plain-seal alternative.
import { CardBase, wikiLink } from "./card-base.js";
import { QUEST_CARD_CSS, section, headerBadges, outOfEraBadge, startsInBody, stepsBody, rewardsBody, wireItemTooltips } from "./quest-shared.js";

const EXTRA_SHEET = new CSSStyleSheet();
EXTRA_SHEET.replaceSync(QUEST_CARD_CSS);

class QuestCard extends CardBase {
  static extraSheet = EXTRA_SHEET;

  #quest = null;

  setData(quest) {
    this.#quest = quest;
    if (this.shadowRoot) this.render();
  }

  wireEvents() {
    wireItemTooltips(this.shadowRoot, (id) => this.#quest?.itemRewards.find((i) => i.id === id));
  }

  render() {
    const quest = this.#quest;
    if (!quest) return;

    const questLineNote = quest.questLine ? `<span class="quest-line-note">Part of the ${quest.questLine.label} questline</span>` : "";

    this.shadowRoot.innerHTML = `
      <div class="spell-header"><h3>${quest.label}</h3>${quest.wikiTitle ? wikiLink(quest.wikiTitle) : ""}${questLineNote}</div>
      <div class="spell-scroll">
        <div class="spell-badges">${outOfEraBadge(quest)}${headerBadges(quest.classes, quest.minLevel, quest.maxLevel)}</div>
        ${section("Description", quest.description ? `<p class="spell-desc">${quest.description}</p>` : "")}
        ${section("Starts In", startsInBody(quest.zones, quest.questGivers))}
        ${section("Steps", stepsBody(quest.steps))}
        ${section("Rewards", rewardsBody(quest))}
      </div>
    `;
  }
}

customElements.define("quest-card", QuestCard);
