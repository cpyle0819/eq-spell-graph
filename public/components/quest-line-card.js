// <quest-line-card>, with `.setData(questLine)` set as one atomic call.
// Renders a quest_line's shared frame (title, class/level badges,
// description, Starts In -- the same section markup quest-card.js uses,
// via quest-shared.js) plus a "Quests in This Line" roster of its member
// sub-quests, each an expandable <details>/<summary> row.
//
// Why this exists: a questline like Armor of Ro has 7 independent
// sub-quests (decisions/quest-line-node-type.md) that would otherwise
// clutter the Quests tab's flat results list as 7 near-identical cards
// differing only in NPC/faction/turn-in. quests.js renders one
// quest-line-card per line instead of its members' individual quest-cards;
// a standalone quest (no line) still renders as a plain quest-card.
//
// <details>/<summary> over reusing <collapsible-section> (public/
// components/collapsible-section.js): that component's header is
// `label` (a plain string attribute, textContent-only) -- a roster row
// needs rich inline content (a seal, the quest name, its giver, a reward
// preview), which collapsible-section's contract doesn't support, and
// widening it risks the sidebar-filter usage it already has. <details>
// gives the exact same disclosure semantics (keyboard-operable, no JS
// state to manage -- CSS reads the native `open` attribute) for free.
// The chevron marker matches collapsible-section's own convention (▾,
// rotated -90° when closed) for visual consistency, redrawn here since
// <summary>'s native marker is hidden.
//
// Wiki link (line.wikiTitle, migration 030) renders once, on the line
// itself, not per roster row -- every member here shares the exact same
// eqlwiki.com page (the shared-page pattern, decisions/
// wiki-links-per-entity-vs-shared-page.md), and a member no longer has its
// own top-level card to carry a redundant copy of the same link.
//
// Signature touch: each roster row's seal has NO numeral, unlike
// quest-card's Steps seals. Steps are numbered because order there is
// real (talk to the NPC before you can turn in the ore); a questline's
// members have no order between them -- David's turn-in and Nicholas's
// are both just "pick one" -- so numbering them would claim a sequence
// that doesn't exist. Same wax-seal material and construction, deliberately
// blank, so the *absence* of a number reads as a real structural signal,
// not an inconsistency.
import { CardBase, wikiLink } from "./card-base.js";
import { QUEST_CARD_CSS, section, headerBadges, startsInBody, stepsBody, rewardsBody, wireItemTooltips } from "./quest-shared.js";

const EXTRA_SHEET = new CSSStyleSheet();
EXTRA_SHEET.replaceSync(`
${QUEST_CARD_CSS}

.line-roster { display: flex; flex-direction: column; }
.line-member { border-top: 1px solid var(--parch-line); }
.line-member:first-child { border-top: none; }

.line-member > summary {
  list-style: none; cursor: pointer;
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  padding: 9px 2px;
}
.line-member > summary::-webkit-details-marker { display: none; }
.line-member > summary::before {
  content: "▾"; font-size: 9px; color: var(--parch-ink-soft); flex-shrink: 0;
  transition: transform 0.15s ease;
}
.line-member:not([open]) > summary::before { transform: rotate(-90deg); }
.line-member > summary:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; border-radius: 2px; }

/* Same wax-seal material as quest-card's numbered Steps seal (see that
   file's own comment), deliberately bearing no numeral -- these rows have
   no order between them, so nothing should read as a sequence marker. */
.line-roster-seal {
  width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0;
  background: radial-gradient(circle at 65% 30%, var(--parch-accent), #4a3004 70%);
  box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.35);
}
.line-member-name { font-weight: 700; color: var(--parch-ink); font-size: 13px; }
.line-member-giver { font-size: 11px; color: var(--parch-ink-soft); }
.line-member-preview {
  font-size: 11px; color: var(--parch-accent); font-style: italic;
  margin-left: auto; text-align: right;
}
.line-member-body { padding: 0 2px 16px 26px; }
`);

// Compact, non-fragile preview text for a collapsed row -- every reward
// name joined, not a guess at which one is "the real reward" (mold vs.
// finished piece are both real rewards; nothing in the data marks one
// primary -- see decisions/quest-line-node-type.md).
function memberPreview(member) {
  return [...member.itemRewards.map((i) => i.label), ...member.factionRewards.map((f) => f.label)].join(", ");
}

function memberRow(member) {
  const giver = member.questGivers.map((g) => g.label).join(", ");
  const preview = memberPreview(member);
  return `
    <details class="line-member">
      <summary>
        <span class="line-roster-seal"></span>
        <span class="line-member-name">${member.label}</span>
        ${giver ? `<span class="line-member-giver">${giver}</span>` : ""}
        ${preview ? `<span class="line-member-preview">${preview}</span>` : ""}
      </summary>
      <div class="line-member-body">
        ${section("Steps", stepsBody(member.steps))}
        ${section("Rewards", rewardsBody(member))}
      </div>
    </details>
  `;
}

class QuestLineCard extends CardBase {
  static extraSheet = EXTRA_SHEET;

  #line = null;

  setData(questLine) {
    this.#line = questLine;
    if (this.shadowRoot) this.render();
  }

  wireEvents() {
    wireItemTooltips(this.shadowRoot, (id) => {
      for (const member of this.#line?.members || []) {
        const found = member.itemRewards.find((i) => i.id === id);
        if (found) return found;
      }
      return undefined;
    });
  }

  render() {
    const line = this.#line;
    if (!line) return;

    const roster = line.members.map(memberRow).join("");

    this.shadowRoot.innerHTML = `
      <div class="spell-header"><h3>${line.label}</h3>${line.wikiTitle ? wikiLink(line.wikiTitle) : ""}</div>
      <div class="spell-scroll">
        <div class="spell-badges">${headerBadges(line.classes, line.minLevel, line.maxLevel)}</div>
        ${section("Description", line.description ? `<p class="spell-desc">${line.description}</p>` : "")}
        ${section("Starts In", startsInBody(line.zones, line.questGivers))}
        ${section(`Quests in This Line (${line.members.length})`, `<div class="line-roster">${roster}</div>`)}
      </div>
    `;
  }
}

customElements.define("quest-line-card", QuestLineCard);
