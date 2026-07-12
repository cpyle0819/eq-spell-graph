// Imported first so every custom element is registered before this file
// sets properties on one -- see app.js's identical import for why order
// here is load bearing, not just tidiness.
import "./components/index.js";
import { lazyRenderList } from "./components.js";

// Matches class-browser.js's own MAX_SPELL_LEVEL bound -- the data tops out
// at level 50 (see decisions/).
const MAX_QUEST_LEVEL = 50;

let availableClasses = [];
let availableZones = [];

// Same "empty selection = everyone" tag-box idiom as Class Browser's Classes
// filter -- except here a non-empty selection also EXCLUDES classless
// "anyone" quests rather than unioning with them (see getQuests() in
// src/graph.ts and decisions/quest-reward-modeling.md): picking a class is
// "show me what's for my class," not "show me everything my class could
// also do."
let classTagInput;
let selectedClassNames = [];

let rawQuests = [];
let rawQuestLines = [];

function renderSidebar() {
  const html = `
    <sidebar-panel>
      <field-row label="Classes"><tag-input id="quest-class-tag-input" aria-label="Class suggestions"></tag-input></field-row>
      <field-row label="Zone"><select id="quest-zone-select"><option value="">All Zones</option></select></field-row>
      <field-row label="Level"><select id="quest-level-select"><option value="all">All Levels</option></select></field-row>
      <field-row label="Search"><input type="text" id="quest-search" placeholder="Name..."></field-row>
      <button slot="actions" type="button" class="text-action" id="reset-quest-filters-btn">Reset filters</button>
    </sidebar-panel>
  `;
  document.getElementById("controls-panel-slot").outerHTML = html;
}

export async function init() {
  renderSidebar();
  [availableClasses, availableZones] = await Promise.all([
    fetch("api/classes/abilities").then((r) => r.json()),
    fetch("api/zones").then((r) => r.json()),
  ]);
  setupClassTagInput();
  populateZoneSelect();
  populateLevelSelect();
  setupFilters();
  applyQueryParams();
  fetchQuests();
}

// ?search=<quest or questline name> deep-links here (e.g. from the Leveling
// Guide) straight to one entry, reusing the existing search box rather than
// a separate highlight/scroll mechanism -- buildResultEntries()'s search
// already matches a questline by its own name or any member's, so a link
// naming one Armor of Ro piece still lands on the Armor of Ro line card,
// not a 404 for a member with no card of its own (decisions/
// quest-line-card-ui.md).
function applyQueryParams() {
  const search = new URLSearchParams(location.search).get("search");
  if (search) document.getElementById("quest-search").value = search;
}

function setupClassTagInput() {
  classTagInput = document.getElementById("quest-class-tag-input");
  classTagInput.itemId = (c) => c;
  classTagInput.itemLabel = (c) => c.charAt(0).toUpperCase() + c.slice(1);
  classTagInput.emptyMessage = "No matching classes";
  classTagInput.getMatches = (q) => {
    const lower = q.toLowerCase();
    return availableClasses.filter((c) => !selectedClassNames.includes(c) && c.includes(lower));
  };
  classTagInput.addEventListener("change", (e) => {
    selectedClassNames = e.detail.selected;
    fetchQuests();
  });
}

function populateZoneSelect() {
  const sel = document.getElementById("quest-zone-select");
  for (const z of availableZones) {
    const opt = document.createElement("option");
    opt.value = z.id;
    opt.textContent = z.label;
    sel.appendChild(opt);
  }
}

function populateLevelSelect() {
  const sel = document.getElementById("quest-level-select");
  for (let i = 1; i <= MAX_QUEST_LEVEL; i++) {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `Level ${i}`;
    sel.appendChild(opt);
  }
}

function setupFilters() {
  document.getElementById("quest-zone-select").addEventListener("change", fetchQuests);
  document.getElementById("quest-level-select").addEventListener("change", fetchQuests);

  let searchDebounce;
  document.getElementById("quest-search").addEventListener("input", () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(render, 150);
  });

  document.getElementById("reset-quest-filters-btn").addEventListener("click", resetFilters);
}

// Restores HTML defaults rather than blanking the form (see decisions/).
function resetFilters() {
  selectedClassNames = [];
  classTagInput.selected = selectedClassNames;
  document.getElementById("quest-zone-select").value = "";
  document.getElementById("quest-level-select").value = "all";
  document.getElementById("quest-search").value = "";
  fetchQuests();
}

// Bumped on every filter change so a slower, now-stale request can't
// overwrite the results of a filter change that happened after it (same
// guard as class-browser.js's fetchAbilities).
let fetchToken = 0;

async function fetchQuests() {
  const token = ++fetchToken;
  const resultsEl = document.getElementById("quests-results");
  resultsEl.innerHTML = '<div class="loading">Loading, please wait...</div>';

  const params = new URLSearchParams();
  if (selectedClassNames.length) params.set("class", selectedClassNames.join(","));
  const zone = document.getElementById("quest-zone-select").value;
  if (zone) params.set("zone", zone);
  const level = document.getElementById("quest-level-select").value;
  if (level !== "all") params.set("level", level);

  // Same filter params against both endpoints -- a questline's own
  // classes/minLevel mirror its members' (decisions/quest-line-node-type.md),
  // so both respond to the same picker state.
  const [quests, questLines] = await Promise.all([
    fetch(`api/quests?${params}`).then((r) => r.json()),
    fetch(`api/quest-lines?${params}`).then((r) => r.json()),
  ]);
  if (token !== fetchToken) return; // a newer filter change superseded this request
  rawQuests = quests;
  rawQuestLines = questLines;
  render();
}

// A questline matches search if its own name does, or any member's does --
// searching "bracer" should still surface the Armor of Ro line, since its
// quest-line-card is the only place that member's card renders (see
// buildResultEntries()).
function questLineMatches(line, q) {
  if (!q) return true;
  if (line.label.toLowerCase().includes(q)) return true;
  return line.members.some((m) => m.label.toLowerCase().includes(q));
}

// One quest-line-card per line (never its members' individual quest-cards
// -- that's the whole point of quest_line, see decisions/
// quest-line-node-type.md) interleaved alphabetically with standalone
// quest-cards (quests with no questLine). Sorting by label rather than
// "lines first" reads as one unified list, not two stacked sections.
function buildResultEntries(searchQuery) {
  const q = searchQuery.trim().toLowerCase();
  const lineIds = new Set(rawQuestLines.map((l) => l.id));
  const entries = [
    ...rawQuestLines.filter((line) => questLineMatches(line, q)).map((line) => ({ label: line.label, tag: "quest-line-card", data: line })),
    ...rawQuests
      .filter((quest) => !quest.questLine || !lineIds.has(quest.questLine.id))
      .filter((quest) => !q || quest.label.toLowerCase().includes(q))
      .map((quest) => ({ label: quest.label, tag: "quest-card", data: quest })),
  ];
  entries.sort((a, b) => a.label.localeCompare(b.label));
  return entries;
}

function render() {
  const resultsEl = document.getElementById("quests-results");
  const searchQuery = document.getElementById("quest-search").value;
  const entries = buildResultEntries(searchQuery);

  resultsEl.innerHTML = "";
  if (!entries.length) {
    resultsEl.innerHTML = '<div class="no-results">No quests match your filters.</div>';
    return;
  }
  lazyRenderList(resultsEl, entries, (entry) => {
    const el = document.createElement(entry.tag);
    el.setData(entry.data);
    return el;
  });
}
