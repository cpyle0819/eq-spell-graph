// Shared rendering helpers for quest-card.js and quest-group-card.js -- pure
// functions producing the same section/badge/chip/tooltip markup both need
// (a quest group card's own overview uses the identical "Starts In"/"Steps"/
// "Rewards" treatment a standalone quest-card does, and each member row
// inside a group card re-renders a full quest's Steps/Rewards too).
// Kept separate from card-base.js (shared by every card type -- spell/aa/
// ability/stance/quest/quest-group) since these are quest/item-domain
// specific, not generic card-shell concerns.
//
// Also shared by the two *pages* that render quest results -- quests.js
// (the standalone Quests tab) and class-browser.js (the Classes page's
// Quests category, decisions/class-browser-quests-category.md) --
// buildQuestResultEntries() below, which neither is a card nor belongs in
// card-base.js, but both pages need identically.
import { classBadges } from "./card-base.js";

// Raw CSS text (not a constructed CSSStyleSheet), same convention as
// reset.js's RESET_CSS / card-base.js's WIKI_LINK_CSS -- CardBase's
// `static extraSheet` slot holds exactly one sheet per leaf, so a leaf that
// needs shared rules spliced together with its own (quest-group-card.js
// needs this text *plus* its own roster-specific rules) has to compose the
// text itself, not adopt a second constructed sheet object.
export const QUEST_CARD_CSS = `
.quest-section { margin-top: 12px; }
.quest-section:first-of-type { margin-top: 0; }
.quest-section-label {
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em;
  color: var(--parch-ink-soft); font-weight: 700;
  padding-bottom: 3px; margin-bottom: 7px;
  border-bottom: 1px solid var(--parch-line);
}
.quest-section-body { font-size: 13px; color: #4a4232; line-height: 1.5; }

.quest-group-note { font-size: 11px; color: var(--ink-muted); font-style: italic; }

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

.spell-badge.xp-badge, .spell-badge.item-badge, .spell-badge.faction-badge-reward, .spell-badge.spell-badge-reward {
  display: inline-flex; align-items: center; gap: 6px;
}
.spell-badge.xp-badge, .spell-badge.item-badge, .spell-badge.faction-badge-reward { cursor: help; }
.spell-badge.xp-badge::before, .spell-badge.item-badge::before, .spell-badge.faction-badge-reward::before, .spell-badge.spell-badge-reward::before {
  content: ""; width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0;
  box-shadow: inset 0 0 1px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 0, 0, 0.4);
}
.xp-badge   { background: rgba(16, 122, 46, 0.1);  color: #157a3c; border: 1px solid rgba(16, 122, 46, 0.35); }
.xp-badge::before { background: radial-gradient(circle at 65% 30%, #7dffb0, #22c55e 60%, #157a3c); }
.item-badge { background: rgba(122, 77, 5, 0.1);   color: #6a4204; border: 1px solid rgba(122, 77, 5, 0.4); }
.item-badge::before { background: radial-gradient(circle at 65% 30%, #ffd97a, #c98f1f 55%, #6e4a0d); }
.faction-badge-reward { background: rgba(94, 42, 122, 0.1); color: #5e2a7a; border: 1px solid rgba(94, 42, 122, 0.4); }
.faction-badge-reward::before { background: radial-gradient(circle at 65% 30%, #d9a8ff, #9d5ec7 55%, #5e2a7a); }

/* Same blue this app already uses for spell-card's own mana-badge -- the
   one existing "this is a spell" color, reused here rather than inventing
   a fourth reward hue. A real link (not a title-tooltip like the faction/
   XP/item chips) -- normal pointer cursor and no title text, since a link
   doesn't need "help" affordance the way a plain informational chip does;
   underlines on hover/focus like the app's other text links (quest-zone-
   link, wiki-link). */
.spell-badge-reward { background: rgba(30, 64, 175, 0.08); color: #1e40af; border: 1px solid rgba(30, 64, 175, 0.35); text-decoration: none; cursor: pointer; }
.spell-badge-reward::before { background: radial-gradient(circle at 65% 30%, #9db8ff, #3a5fd9 60%, #1e3a8a); }
.spell-badge-reward:hover, .spell-badge-reward:focus-visible { text-decoration: underline; }

/* Warning, not metadata -- deliberately a different register from the
   neutral class/level badges (dark red vs. their muted brown/tan), same
   "danger" language as zone-card's kos/wont_sell faction badges, adapted
   for this card's light parchment background rather than dark stone. */
.out-of-era-badge {
  background: rgba(156, 43, 43, 0.12); color: #9c2b2b; border: 1px solid rgba(156, 43, 43, 0.45);
  font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; cursor: help;
}
`;

const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());
const STAT_LABELS = { str: "STR", sta: "STA", dex: "DEX", agi: "AGI", wis: "WIS", int: "INT", cha: "CHA" };
const RESIST_LABELS = { fire: "Fire", cold: "Cold", disease: "Disease", poison: "Poison", magic: "Magic" };

// "Level 5 – 15" / "Level 20+" / "Level ≤ 15" / "" (both bounds absent —
// no badge at all rather than a misleading "All Levels" chip cluttering
// every classless-and-levelless test quest).
export function questLevelLabel(minLevel, maxLevel) {
  if (minLevel == null && maxLevel == null) return "";
  if (minLevel != null && maxLevel != null) return minLevel === maxLevel ? `Level ${minLevel}` : `Level ${minLevel} – ${maxLevel}`;
  if (minLevel != null) return `Level ${minLevel}+`;
  return `Level ≤ ${maxLevel}`;
}

export function section(label, bodyHtml) {
  return bodyHtml ? `<div class="quest-section"><div class="quest-section-label">${label}</div>${bodyHtml}</div>` : "";
}

export function headerBadges(classes, minLevel, maxLevel) {
  const levelLabel = questLevelLabel(minLevel, maxLevel);
  return [
    classes.length ? classBadges(classes, []) : `<span class="spell-badge class-badge">Any Class</span>`,
    levelLabel ? `<span class="spell-badge skill-badge">${levelLabel}</span>` : "",
  ].join("");
}

// entity.outOfEra is only ever present (and true) when the quest's era is
// strictly later than the game's current era (src/graph.ts's isOutOfEra(),
// see decisions/quest-era-flagging.md) -- same-era or earlier renders
// nothing at all, not a reassuring badge, matching that spec's "do nothing"
// case literally. Composed separately from headerBadges() (not folded in)
// since this is a warning, not neutral metadata -- callers place it first.
export function outOfEraBadge(entity) {
  if (!entity.outOfEra) return "";
  const title = entity.era ? `${entity.era} content isn't available in the current era yet` : "Not available in the current era yet";
  return `<span class="spell-badge out-of-era-badge" title="${title}">Out of Era</span>`;
}

// Zone is the link target (per decisions/); giver is supporting detail in
// parens, since "Starts In" is fundamentally a place, not a person.
export function startsInBody(zones, questGivers) {
  const zoneLinks = zones
    .map((z) => `<a class="quest-zone-link" href="maps.html?to=${encodeURIComponent(z.label)}">${z.label}</a>`)
    .join(", ");
  const giverNames = questGivers.map((g) => g.label).join(", ");
  if (zoneLinks) {
    return `<div class="quest-section-body quest-starts-in"><span class="quest-waypoint"></span><span>${zoneLinks}${giverNames ? ` <span class="quest-giver-note">(from ${giverNames})</span>` : ""}</span></div>`;
  }
  return giverNames ? `<div class="quest-section-body">${giverNames}</div>` : "";
}

export function stepsBody(steps) {
  return steps.length ? `<ol class="quest-steps">${steps.map((s) => `<li>${s}</li>`).join("")}</ol>` : "";
}

// Shapes an ItemSummary (src/graph.ts's ItemDetails, see decisions/
// item-node-schema.md) into <detail-tooltip>'s generic { text, highlight? }
// stat-chip contract -- slots is the one highlighted chip (mirrors
// zone-card's spellStats() highlighting spellType), everything else plain.
// Every field is optional on the source data, so each line is independently
// skippable -- a container has weight/size and nothing else, a weapon has
// damage/delay/skill and usually no resists.
export function itemStats(item) {
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

// Matches class-browser.js's / quests.js's own MAX_QUEST_LEVEL bound -- the
// data tops out at level 50 (see decisions/). Only used as a fallback when
// the rewarding quest itself has no minLevel/maxLevel to carry over.
const MAX_SPELL_LEVEL = 50;

// Builds the same "Find in Spell Finder" deep link class-browser.js's
// buildPinUrl() does (index.html?pinSpell=...&pinName=...), reusing the
// quest's own classes/minLevel/maxLevel as the range/Shopping-For context
// to carry over -- there's no per-class level for a quest-reward spell the
// way class-browser has a level-select, so the quest's own gate is the
// closest real substitute. race=any/deity=any for the same reason
// class-browser always sets them: a leftover race/deity from whatever was
// last open in the Spell Finder could otherwise produce a misleading
// KOS/won't-sell result that has nothing to do with this quest.
export function spellFinderPinUrl(spell, quest) {
  const params = new URLSearchParams({
    pinSpell: spell.id,
    pinName: spell.label,
    levelMin: String(quest.minLevel ?? 1),
    levelMax: String(quest.maxLevel ?? MAX_SPELL_LEVEL),
    race: "any",
    deity: "any",
  });
  if (quest.classes?.length) params.set("classes", quest.classes.join(","));
  return `index.html?${params}`;
}

export function rewardsBody(quest) {
  const chips = [
    quest.total_experience ? `<span class="spell-badge xp-badge" title="Experience reward">${quest.total_experience} XP</span>` : "",
    ...quest.itemRewards.map((i) => `<span class="spell-badge item-badge" data-item-id="${i.id}">${i.label}</span>`),
    ...quest.spellRewards.map((s) => `<a class="spell-badge spell-badge-reward" href="${spellFinderPinUrl(s, quest)}">${s.label}</a>`),
    ...quest.factionRewards.map((f) => `<span class="spell-badge faction-badge-reward" title="Faction reward: ${f.label}">${f.label}</span>`),
  ].join("");
  return chips ? `<div class="spell-badges">${chips}</div>` : "";
}

// Wires item-reward-chip hover -> <detail-tooltip>, shared by quest-card.js
// (one quest's own itemRewards) and quest-group-card.js (the union of every
// member's itemRewards) -- only the lookup scope differs, so findItem(id)
// is supplied by the caller. Listening on shadowRoot itself (not `this`/
// the host) sees the real internal e.target/e.relatedTarget directly --
// event retargeting to the host only applies to listeners outside the
// shadow tree (see tag-input.js / zone-card.js's identical comment).
export function wireItemTooltips(shadowRoot, findItem) {
  if (!window.matchMedia("(pointer: fine)").matches) return; // touch devices: no hover tooltip, same as zone-card's spell-chip

  shadowRoot.addEventListener("mouseover", (e) => {
    const chip = e.target.closest(".item-badge[data-item-id]");
    if (!chip) return;
    const item = findItem(chip.dataset.itemId);
    if (item) document.getElementById("detail-tooltip")?.show({ name: item.label, description: item.source, stats: itemStats(item) }, chip);
  });
  shadowRoot.addEventListener("mouseout", (e) => {
    if (!e.relatedTarget?.closest?.(".item-badge[data-item-id]")) {
      document.getElementById("detail-tooltip")?.hide();
    }
  });
}

// A quest group matches search if its own name does, or any member's does --
// searching "bracer" should still surface the Armor of Ro group, since its
// quest-group-card is the only place that member's card renders.
// Matches on more than just the title -- a quest's description/steps text is
// often the only place a turn-in item is mentioned at all (e.g. "Fire Beetle
// Eyes" isn't a rewards edge, just prose -- see decisions/
// quest-reward-modeling.md), so title-only search could never find it.
function questMatchesSearch(quest, q) {
  if (!q) return true;
  if (quest.label.toLowerCase().includes(q)) return true;
  if (quest.description && quest.description.toLowerCase().includes(q)) return true;
  return quest.steps.some((step) => step.toLowerCase().includes(q));
}

function questGroupMatchesSearch(group, q) {
  if (!q) return true;
  if (group.label.toLowerCase().includes(q)) return true;
  if (group.description && group.description.toLowerCase().includes(q)) return true;
  return group.members.some((m) => questMatchesSearch(m, q));
}

// One quest-group-card per group (never its members' individual quest-cards
// -- that's the whole point of quest_group, see decisions/
// quest-group-node-type.md) interleaved alphabetically with standalone
// quest-cards (quests with no questGroup, or whose group isn't in the
// `questGroups` list passed in). Sorting by label rather than "groups first"
// reads as one unified list, not two stacked sections. Callers decide which
// quests/questGroups to pass in (e.g. class-browser.js's own class-narrowing
// rule, decisions/class-browser-quests-category.md) -- this function only
// combines and sorts, it doesn't filter by class.
// includeOutOfEra defaults to false -- out-of-era content (Kunark/Velious
// zones and anything located_in them, decisions/quest-era-flagging.md)
// isn't actually reachable in the game's current era yet, so it's hidden
// by default rather than cluttering results a player can't act on. A
// quest_group is filtered on its own outOfEra (the shared frame's zone),
// not each member's -- same "group's own fields describe the shared frame"
// precedent as classes/minLevel (decisions/quest-group-node-type.md).
export function buildQuestResultEntries(quests, questGroups, searchQuery, includeOutOfEra = false) {
  const q = (searchQuery || "").trim().toLowerCase();
  const visibleQuestGroups = includeOutOfEra ? questGroups : questGroups.filter((group) => !group.outOfEra);
  const visibleQuests = includeOutOfEra ? quests : quests.filter((quest) => !quest.outOfEra);
  const groupIds = new Set(visibleQuestGroups.map((g) => g.id));
  const entries = [
    ...visibleQuestGroups.filter((group) => questGroupMatchesSearch(group, q)).map((group) => ({ label: group.label, tag: "quest-group-card", data: group })),
    ...visibleQuests
      .filter((quest) => !quest.questGroup || !groupIds.has(quest.questGroup.id))
      .filter((quest) => questMatchesSearch(quest, q))
      .map((quest) => ({ label: quest.label, tag: "quest-card", data: quest })),
  ];
  entries.sort((a, b) => a.label.localeCompare(b.label));
  return entries;
}
