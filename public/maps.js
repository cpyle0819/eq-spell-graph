// Imported first so every custom element is registered before this file
// creates or configures one -- see app.js's identical import for why order
// here is load bearing, not just tidiness.
import "./components/index.js";

const STATE_KEY = "eq-route-state";

let zonesByLabel = new Map();

export async function init() {
  const zones = await fetch("api/zones").then((r) => r.json());
  zonesByLabel = new Map(zones.map((z) => [z.label, z]));
  populateZones(zones);
  restoreState();
  applyQueryParams();
  document.getElementById("route-from").addEventListener("change", () => { saveState(); runRoute(); });
  document.getElementById("route-to").addEventListener("change", () => { saveState(); runRoute(); });
  document.getElementById("reset-route-btn").addEventListener("click", resetRoute);
  runRoute();
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
  saveState();
  runRoute();
}

function restoreState() {
  try {
    const s = JSON.parse(localStorage.getItem(STATE_KEY) || "null");
    if (!s) return;
    if (s.from) document.getElementById("route-from").value = s.from;
    if (s.to) document.getElementById("route-to").value = s.to;
  } catch { /* ignore malformed state */ }
}

function saveState() {
  const from = document.getElementById("route-from").value;
  const to = document.getElementById("route-to").value;
  localStorage.setItem(STATE_KEY, JSON.stringify({ from, to }));
}

function populateZones(zones) {
  for (const id of ["route-from", "route-to"]) {
    const select = document.getElementById(id);
    for (const z of zones) {
      const opt = document.createElement("option");
      opt.value = z.label;
      opt.textContent = z.label;
      select.appendChild(opt);
    }
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

// Bumped on every from/to change so a slower, now-superseded fetch can't
// clobber a newer selection's result (same guard as quests.js's fetchToken).
let fetchToken = 0;

async function runRoute() {
  const token = ++fetchToken;
  const from = document.getElementById("route-from").value;
  const to = document.getElementById("route-to").value;
  const el = document.getElementById("route-result");

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
    const result = await fetch(`api/route?${new URLSearchParams({ from, to })}`).then((r) => r.json());
    if (token !== fetchToken) return;
    if (!result.route || result.route.length === 0) {
      noticeHtml = `<div class="no-results compact">No route found from ${from} to ${to}.</div>`;
    } else {
      routeCard = document.createElement("route-card");
      routeCard.route = { from, to, hops: result.hops, steps: result.route, destination: result.destination };
    }
  }

  const dossierData = await buildDossierData(to);
  if (token !== fetchToken) return;

  el.innerHTML = noticeHtml;
  if (routeCard) el.appendChild(routeCard);
  const dossier = document.createElement("zone-dossier");
  dossier.setData(dossierData);
  el.appendChild(dossier);
}
