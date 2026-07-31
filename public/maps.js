// Imported first so every custom element is registered before this file
// creates or configures one -- see app.js's identical import for why order
// here is load bearing, not just tidiness.
import "./components/index.js";

const STATE_KEY = "eq-route-state";
// One less than this many gap-add-btn squares can ever exist (from-through-to
// has stops.length + 1 gaps) -- an arbitrary but concrete ceiling so the
// finder-bar can't be grown into an unreadable, near-endless chain.
const MAX_STOPS = 5;

let zonesByLabel = new Map();
let allZones = [];
// Ordered zone labels to route through between "from" and "to" (issue #63's
// "add stop" -- an empty string is a stop row the visitor added but hasn't
// picked a zone for yet, kept in the array so its position/remove button
// survive a re-render rather than being silently dropped).
let stops = [];

export async function init() {
  const zones = await fetch("api/zones").then((r) => r.json());
  allZones = zones;
  zonesByLabel = new Map(zones.map((z) => [z.label, z]));
  populateZoneSelect(document.getElementById("route-from"));
  populateZoneSelect(document.getElementById("route-to"));
  restoreState();
  // Unconditional (not folded into restoreState() itself) -- a first-ever
  // visit has no saved state to restore at all, but the chain still needs
  // its one From-to-To gap-add-btn drawn, not just a stop list that
  // happens to be empty.
  renderStops();
  applyQueryParams();
  document.getElementById("route-from").addEventListener("change", () => { saveState(); runRoute(); });
  document.getElementById("route-to").addEventListener("change", () => { saveState(); runRoute(); });
  document.getElementById("wizard-port-btn").addEventListener("click", (e) => {
    e.currentTarget.toggleAttribute("toggled");
    saveState();
    runRoute();
  });
  document.getElementById("reset-route-btn").addEventListener("click", resetRoute);
  document.getElementById("add-stop-btn").addEventListener("click", () => insertStop(stops.length));
  window.addEventListener("resize", checkOverflow);
  // Delegated once here rather than re-attached per runRoute() -- #route-result
  // itself is never replaced, only its children (route-card/zone-dossier),
  // and the event bubbles+composes out of both their shadow roots (issue
  // #63: clicking any stop in the route swaps <zone-dossier> to that zone
  // without recomputing the route).
  document.getElementById("route-result").addEventListener("zone-select", (e) => showZoneDossier(e.detail.name));
  runRoute();
}

// Inserting at `index` = "insert before whatever stop currently sits at that
// position" (stops.length itself means "append after the last stop, right
// before To") -- shared by both ways of adding a stop: a gap-add-btn between
// two specific fields (issue #63's own click-in-the-gap spec) and the
// vertical view's fallback #add-stop-btn, which only ever appends.
function insertStop(index) {
  if (stops.length >= MAX_STOPS) return;
  stops.splice(index, 0, "");
  renderStops();
  saveState();
  // No runRoute() -- an added-but-unpicked stop can't change the route yet.
}

function gapAddButtonHtml(index) {
  const disabled = stops.length >= MAX_STOPS;
  return `<macro-button square small class="gap-add-btn" data-index="${index}" title="Add a stop here"${disabled ? " disabled" : ""}>+</macro-button>`;
}

function stopFieldHtml(i) {
  return `
    <div class="field stop-field" data-index="${i}">
      <div class="field-label-row">
        <label>Stop ${i + 1}</label>
        <button type="button" class="text-action remove-stop-btn" data-index="${i}" title="Remove this stop">×</button>
      </div>
      <select class="stop-select" data-index="${i}"><option value="">— Select Zone —</option></select>
    </div>
  `;
}

// One gap-add-btn before every stop plus one final one before To -- N stops
// means N+1 gaps, each identified by the insertion index it would splice a
// new stop at (issue #63: "between every pair of stops," which includes the
// From/first-stop and last-stop/To gaps, not just between two stops).
function renderStops() {
  const container = document.getElementById("chain-middle");
  const parts = [];
  for (let i = 0; i < stops.length; i++) {
    parts.push(gapAddButtonHtml(i), stopFieldHtml(i));
  }
  parts.push(gapAddButtonHtml(stops.length));
  container.innerHTML = parts.join("");

  for (const select of container.querySelectorAll(".stop-select")) {
    populateZoneSelect(select);
    select.value = stops[Number(select.dataset.index)];
    select.addEventListener("change", () => {
      stops[Number(select.dataset.index)] = select.value;
      saveState();
      runRoute();
    });
  }
  for (const btn of container.querySelectorAll(".remove-stop-btn")) {
    btn.addEventListener("click", () => {
      stops.splice(Number(btn.dataset.index), 1);
      renderStops();
      saveState();
      runRoute();
    });
  }
  for (const btn of container.querySelectorAll(".gap-add-btn")) {
    btn.addEventListener("click", () => insertStop(Number(btn.dataset.index)));
  }

  document.getElementById("add-stop-btn").disabled = stops.length >= MAX_STOPS;
  checkOverflow();
}

// Switches the finder-bar between the horizontal from/gaps/stops/to chain
// and a stacked vertical layout (issue #63) once that chain's natural,
// unshrunk width (route-chain's children are flex-shrink: 0, see maps.html)
// no longer fits -- the one condition covers both a narrow viewport and a
// wide one with enough stops added to overflow it anyway, rather than a
// separate width media query plus a hardcoded stop-count threshold.
function checkOverflow() {
  const finderBar = document.querySelector(".finder-bar");
  const chain = document.getElementById("route-chain");
  finderBar.classList.remove("vertical");
  const overflowing = chain.scrollWidth > chain.clientWidth;
  finderBar.classList.toggle("vertical", overflowing);
}

// ?to=<zone label> deep-links here (e.g. from the Leveling Guide) preset the
// destination, letting the visitor just pick where they're coming from.
// Takes priority over restored localStorage state, but only for a "to" value
// that actually matches a real zone option -- a stale/mistyped link falls
// back to whatever was already restored rather than clearing the field.
function applyQueryParams() {
  const to = new URLSearchParams(location.search).get("to");
  if (!to) return;
  const select = document.getElementById("route-to");
  if ([...select.options].some((o) => o.value === to)) {
    select.value = to;
    saveState();
  }
}

function resetRoute() {
  document.getElementById("route-from").value = "";
  document.getElementById("route-to").value = "";
  document.getElementById("wizard-port-btn").removeAttribute("toggled");
  stops = [];
  renderStops();
  saveState();
  runRoute();
}

function restoreState() {
  try {
    const s = JSON.parse(localStorage.getItem(STATE_KEY) || "null");
    if (!s) return;
    if (s.from) document.getElementById("route-from").value = s.from;
    if (s.to) document.getElementById("route-to").value = s.to;
    if (s.wizardPort) document.getElementById("wizard-port-btn").setAttribute("toggled", "");
    if (Array.isArray(s.stops)) stops = s.stops;
  } catch { /* ignore malformed state */ }
}

function saveState() {
  const from = document.getElementById("route-from").value;
  const to = document.getElementById("route-to").value;
  const wizardPort = document.getElementById("wizard-port-btn").hasAttribute("toggled");
  localStorage.setItem(STATE_KEY, JSON.stringify({ from, to, wizardPort, stops }));
}

function populateZoneSelect(select) {
  for (const z of allZones) {
    const opt = document.createElement("option");
    opt.value = z.label;
    opt.textContent = z.label;
    select.appendChild(opt);
  }
}

// A zone has its own facts (map, level range, quests, npcs) whether or not
// a route to it was ever computed -- e.g. a spell vendor's zone link lands
// here with only "to" set. destination.wikiTitle/lore/maps/zoneType ride
// along on /api/route's existing payload (src/graph.ts's getZoneVendorInfo)
// rather than a second lookup: calling it with from===to still resolves (0
// hops, see shortestPath's own from===to short-circuit) without implying a
// real route exists. `maps` (migration 125, decisions/
// zone-multi-floor-maps.md) is a one-entry-per-floor array; each entry's
// `image` is a bare filename under public/maps/ -- resolved to a real path
// in zone-dossier itself, since getZoneVendorInfo only knows the filename,
// not the app's own static-asset layout. npcs comes from /api/npcs?zone=
// (getZoneNpcs() in src/graph.ts, decisions/
// npc-mob-unification-and-zone-groups.md) -- every entity located_in the
// zone (vendors, quest-givers, guards, guildmasters, bankers, mobs alike,
// plus roleless residents), grouped
// and ordered by <zone-dossier> itself based on zoneType. levelRange is
// derived from that same npcs array (min/max across every entry with a
// known level) rather than a second lookup. null (not 1-Infinity or some
// other sentinel) for a zone with no leveled npcs yet, same "unknown" shape
// getZoneVendorInfo already uses for its own levelRange.
function npcsLevelRange(npcs) {
  const levels = npcs.flatMap((n) => [n.minLevel, n.maxLevel]).filter((n) => n != null);
  return levels.length ? { min: Math.min(...levels), max: Math.max(...levels) } : null;
}

async function buildDossierData(to) {
  const zone = zonesByLabel.get(to);
  const [{ destination }, quests, npcs] = await Promise.all([
    fetch(`api/route?${new URLSearchParams({ from: to, to })}`).then((r) => r.json()),
    zone ? fetch(`api/quests?${new URLSearchParams({ zone: zone.id })}`).then((r) => r.json()) : Promise.resolve([]),
    zone ? fetch(`api/npcs?${new URLSearchParams({ zone: zone.id })}`).then((r) => r.json()) : Promise.resolve([]),
  ]);
  return {
    zoneLabel: to,
    wikiTitle: destination?.wikiTitle,
    outOfEra: zone?.outOfEra,
    lore: destination?.lore,
    maps: destination?.maps,
    zoneType: destination?.zoneType,
    levelRange: npcsLevelRange(npcs),
    npcs,
    quests,
  };
}

// Bumped on every from/to change (and every zone-select click, which is its
// own lighter-weight fetch outside runRoute() -- see showZoneDossier()) so a
// slower, now-superseded fetch of either kind can't clobber a newer
// selection's result (same guard as quests.js's fetchToken).
let fetchToken = 0;

// The live <route-card>/<zone-dossier> instances currently in #route-result,
// so a step click (showZoneDossier) can update them in place instead of
// re-running the whole route computation just to change which zone's map is
// showing (issue #63).
let currentRouteCard = null;
let currentDossier = null;

async function runRoute() {
  const token = ++fetchToken;
  const from = document.getElementById("route-from").value;
  const to = document.getElementById("route-to").value;
  const el = document.getElementById("route-result");
  currentRouteCard = null;
  currentDossier = null;

  if (!to) {
    el.innerHTML = '<div class="no-results">Select a destination to see its map, quests, and dangers.</div>';
    return;
  }

  el.innerHTML = '<div class="loading">Charting course...</div>';

  let noticeHtml = "";
  let routeCard = null;

  if (from && from === to) {
    noticeHtml = '<div class="no-results compact">You\'re already there.</div>';
  } else if (from) {
    const wizardPort = document.getElementById("wizard-port-btn").hasAttribute("toggled");
    const stopsParam = stops.filter(Boolean).join(",");
    const params = { from, to, ...(wizardPort ? { wizardPort: "1" } : {}), ...(stopsParam ? { stops: stopsParam } : {}) };
    const result = await fetch(`api/route?${new URLSearchParams(params)}`).then((r) => r.json());
    if (token !== fetchToken) return;
    if (!result.route || result.route.length === 0) {
      noticeHtml = stopsParam
        ? `<div class="no-results compact">No route found from ${from} to ${to} through ${stops.filter(Boolean).join(", ")}.</div>`
        : `<div class="no-results compact">No route found from ${from} to ${to}.</div>`;
    } else {
      routeCard = document.createElement("route-card");
      routeCard.route = { from, to, hops: result.hops, steps: result.route, destination: result.destination };
      routeCard.activeZone = to;
    }
  }

  const dossierData = await buildDossierData(to);
  if (token !== fetchToken) return;

  el.innerHTML = noticeHtml;
  if (routeCard) el.appendChild(routeCard);
  const dossier = document.createElement("zone-dossier");
  dossier.setData(dossierData);
  el.appendChild(dossier);
  currentRouteCard = routeCard;
  currentDossier = dossier;
}

// A route's own steps (route-path.js, issue #63) are each a clickable
// "zone-select" button -- picking one swaps <zone-dossier> to that zone's
// map/npcs/quests without touching the "from"/"to" fields or recomputing
// the route itself, since the route the traveler asked for hasn't changed,
// only which of its stops they want to look at right now.
async function showZoneDossier(zoneLabel) {
  const token = ++fetchToken;
  if (currentRouteCard) currentRouteCard.activeZone = zoneLabel;
  const dossierData = await buildDossierData(zoneLabel);
  if (token !== fetchToken || !currentDossier) return;
  currentDossier.setData(dossierData);
}
