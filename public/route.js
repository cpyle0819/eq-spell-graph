// Imported first so every custom element is registered before this file
// creates or configures one -- see app.js's identical import for why order
// here is load bearing, not just tidiness.
import "./components/index.js";

const STATE_KEY = "eq-route-state";

export async function init() {
  const zones = await fetch("api/zones").then((r) => r.json());
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

async function runRoute() {
  const from = document.getElementById("route-from").value;
  const to = document.getElementById("route-to").value;
  const el = document.getElementById("route-result");

  if (!from || !to) {
    el.innerHTML = '<div class="no-results">Select both a starting zone and a destination.</div>';
    return;
  }
  if (from === to) {
    el.innerHTML = '<div class="no-results">You\'re already there.</div>';
    return;
  }

  el.innerHTML = '<div class="loading">Charting course...</div>';

  const result = await fetch(`api/route?${new URLSearchParams({ from, to })}`).then((r) => r.json());

  if (!result.route || result.route.length === 0) {
    el.innerHTML = `<div class="no-results">No route found from ${from} to ${to}.</div>`;
    return;
  }

  el.innerHTML = "";
  const card = document.createElement("route-card");
  card.route = { from, to, hops: result.hops, steps: result.route, destination: result.destination };
  el.appendChild(card);
}
