const STATE_KEY = "eq-route-state";

async function init() {
  document.getElementById("nav-links").innerHTML = [
    MacroButton({ label: "Spell Finder", tag: "a", href: "index.html" }),
    MacroButton({ label: "Class Browser", tag: "a", href: "class-browser.html" }),
  ].join("");
  const zones = await fetch("api/zones").then((r) => r.json());
  populateZones(zones);
  restoreState();
  document.getElementById("route-from").addEventListener("change", () => { saveState(); runRoute(); });
  document.getElementById("route-to").addEventListener("change", () => { saveState(); runRoute(); });
  document.getElementById("reset-route-btn").addEventListener("click", resetRoute);
  runRoute();
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

  const hopsText = result.hops === 1 ? "1 hop" : `${result.hops} hops`;
  const stepsHtml = result.route.map((step, i) => {
    if (i === 0) return `<span class="route-zone">${step.name}</span>`;
    if (step.via === "boat") return `<span class="boat-sep" title="Boat crossing">⚓</span><span class="route-zone">${step.name}</span>`;
    if (step.via === "translocator") return `<span class="translocator-sep" title="Translocator (paid teleport)">✨</span><span class="route-zone">${step.name}</span>`;
    return `<span class="route-sep">›</span><span class="route-zone">${step.name}</span>`;
  }).join("");

  el.innerHTML = `
    <div class="route-card">
      <div class="route-card-header">
        <span class="route-card-title">${from} → ${to}</span>
        <span class="hops-badge">${hopsText}</span>
      </div>
      <div class="route-path">
        <span class="route-label">Route</span>
        <div class="route-steps">${stepsHtml}</div>
      </div>
    </div>
  `;
}

init();
