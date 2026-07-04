async function init() {
  const zones = await fetch("api/zones").then((r) => r.json());
  populateZones(zones);
  applyDefaults(zones);
  document.getElementById("route-from").addEventListener("change", runRoute);
  document.getElementById("route-to").addEventListener("change", runRoute);
  runRoute();
}

function applyDefaults(zones) {
  const labels = zones.map((z) => z.label);
  const pick = (preferred, fallbackIndex) =>
    labels.includes(preferred) ? preferred : zones[fallbackIndex]?.label ?? "";
  document.getElementById("route-from").value = pick("Halas", 0);
  document.getElementById("route-to").value = pick("West Freeport", Math.floor(zones.length / 2));
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
    if (step.via === "boat") return `<span class="boat-sep">⚓</span><span class="route-zone">${step.name}</span>`;
    if (step.via === "translocator") return `<span class="translocator-sep">✨</span><span class="route-zone">${step.name}</span>`;
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
