// --- State ---
let zones = [];
let availableClasses = [];
let cy = null;

// --- Init ---
async function init() {
  [zones, availableClasses] = await Promise.all([
    fetch("/api/zones").then((r) => r.json()),
    fetch("/api/classes").then((r) => r.json()),
  ]);
  populateZoneList();
  populateShoppingClassSelects();
  setupLevelRange();
  populateSpellLevelSelect();
  setupTabs();
  setupPlanner();
  setupSpellsPanel();
}

function populateShoppingClassSelects() {
  const selects = [document.getElementById("class-select"), document.getElementById("spell-class-select")];
  for (const select of selects) {
    select.innerHTML = "";
    for (const cls of availableClasses) {
      const opt = document.createElement("option");
      opt.value = cls;
      opt.textContent = cls.charAt(0).toUpperCase() + cls.slice(1);
      select.appendChild(opt);
    }
  }
}

// --- Tabs ---
function setupTabs() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      const panel = document.getElementById(tab.dataset.panel);
      panel.classList.add("active");
      if (tab.dataset.panel === "graph-panel" && !cy) initGraph();
    });
  });
}

// --- Planner ---
function populateZoneList() {
  const select = document.getElementById("zone-input");
  zones.forEach((z) => {
    const opt = document.createElement("option");
    opt.value = z.label;
    opt.textContent = z.label;
    select.appendChild(opt);
  });
}

function setupLevelRange() {
  const minSlider = document.getElementById("level-min");
  const maxSlider = document.getElementById("level-max");
  const display = document.getElementById("range-display");

  function update() {
    let min = parseInt(minSlider.value);
    let max = parseInt(maxSlider.value);
    if (min > max) {
      // Swap if user drags min past max
      [minSlider.value, maxSlider.value] = [max, min];
      [min, max] = [max, min];
    }
    display.textContent = min === max ? `Level ${min}` : `${min} – ${max}`;
  }

  minSlider.addEventListener("input", update);
  maxSlider.addEventListener("input", update);
  update();
}

function getSelectedLevels() {
  const min = parseInt(document.getElementById("level-min").value);
  const max = parseInt(document.getElementById("level-max").value);
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  const levels = [];
  for (let i = lo; i <= hi; i++) levels.push(i);
  return levels;
}

function setupPlanner() {
  document.getElementById("plan-btn").addEventListener("click", runPlan);
}

async function runPlan() {
  const cls = document.getElementById("class-select").value;
  const race = document.getElementById("race-select").value;
  const primaryClass = document.getElementById("primary-class-select").value;
  const deity = document.getElementById("deity-select").value;
  const from = document.getElementById("zone-input").value;
  const levels = getSelectedLevels();

  if (!from) {
    document.getElementById("results").innerHTML =
      '<div class="no-results">Enter your current zone.</div>';
    return;
  }

  const params = new URLSearchParams({ class: cls, levels: levels.join(","), from, race, primaryClass, deity });
  const rankings = await fetch(`/api/plan?${params}`).then((r) => r.json());

  if (rankings.error) {
    document.getElementById("results").innerHTML =
      `<div class="no-results">${rankings.error}</div>`;
    return;
  }

  renderRankings(rankings, levels);
}

function renderRankings(rankings, levels) {
  const el = document.getElementById("results");
  if (!rankings.length) {
    el.innerHTML = '<div class="no-results">No vendors found for those levels.</div>';
    return;
  }

  const accessible = rankings.filter((r) => r.faction === "safe" || r.faction === "neutral");
  const wontSell = rankings.filter((r) => r.faction === "wont_sell");
  const kos = rankings.filter((r) => r.faction === "kos");
  const totalSpells = new Set(accessible.flatMap((r) => r.spells.map((s) => s.id))).size;

  const warnings = [];
  if (wontSell.length) warnings.push(`<span style="color:#f59e0b;">${wontSell.length} zone(s) won't sell to you</span>`);
  if (kos.length) warnings.push(`<span style="color:#f87171;">${kos.length} zone(s) KOS</span>`);

  el.innerHTML = `<div class="results-header">
    ${totalSpells} spell(s) across ${accessible.length} accessible zone(s) for levels ${levels.join(", ")}
    ${warnings.length ? " — " + warnings.join(", ") : ""}
  </div>`;

  const FACTION_LABELS = { safe: "safe", neutral: "neutral", wont_sell: "won't sell", kos: "kill on sight" };

  for (const r of rankings) {
    const hopsText = r.hops === null ? "unreachable" : r.hops === 0 ? "you are here" : `${r.hops} hop${r.hops > 1 ? "s" : ""}`;
    const card = document.createElement("div");
    card.className = `zone-card ${r.faction}`;

    const spellRows = r.spells.map((s) => `
      <div class="spell-row">
        <span class="spell-chip">${s.name}<span class="lvl">L${s.level}</span></span>
        <span class="vendor-names">${s.vendors.map((v) => `<span class="vendor-tag">${v}</span>`).join("")}</span>
      </div>
    `).join("");

    card.innerHTML = `
      <div class="zone-card-header">
        <span class="zone-name">${r.zoneName}</span>
        <span class="faction-badge ${r.faction}">${FACTION_LABELS[r.faction] || r.faction}</span>
        <span class="zone-badge">${r.spells.length} spell${r.spells.length > 1 ? "s" : ""}</span>
        <span class="zone-badge hops">${hopsText}</span>
      </div>
      <div class="spell-vendor-list">${spellRows}</div>
    `;
    el.appendChild(card);
  }
}

// --- Spells Panel ---
function populateSpellLevelSelect() {
  const sel = document.getElementById("spell-level-select");
  for (let i = 1; i <= 50; i++) {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `Level ${i}`;
    sel.appendChild(opt);
  }
}

function setupSpellsPanel() {
  const fetch_ = () => fetchSpells();
  document.getElementById("spell-class-select").addEventListener("change", fetch_);
  document.getElementById("spell-level-select").addEventListener("change", fetch_);
  let timeout;
  document.getElementById("spell-search").addEventListener("input", () => {
    clearTimeout(timeout);
    timeout = setTimeout(fetch_, 200);
  });
  fetchSpells();
}

async function fetchSpells() {
  const cls = document.getElementById("spell-class-select").value;
  const level = document.getElementById("spell-level-select").value;
  const search = document.getElementById("spell-search").value.toLowerCase().trim();

  const params = new URLSearchParams({ class: cls });
  if (level !== "all") params.set("levels", level);
  const spells = await fetch(`/api/spells?${params}`).then((r) => r.json());

  const filtered = search
    ? spells.filter((s) => s.label.toLowerCase().includes(search))
    : spells;

  renderSpellList(filtered, cls);
}

async function renderSpellList(spells, cls) {
  const el = document.getElementById("spell-results");
  if (!spells.length) {
    el.innerHTML = '<div class="no-results">No spells found.</div>';
    return;
  }

  el.innerHTML = "";
  for (const spell of spells) {
    const level = spell.class_levels.find((cl) => cl.class === cls)?.level || "?";
    const detail = document.createElement("div");
    detail.className = "spell-detail";
    detail.innerHTML = `<h3>${spell.label} <span style="font-size:12px;color:#888;">(Level ${level})</span></h3>
      <div class="vendor-loading" style="color:#666;font-size:12px;">Click to load vendors...</div>`;
    detail.style.cursor = "pointer";
    detail.addEventListener("click", async () => {
      const existing = detail.querySelector(".vendor-list");
      if (existing) { existing.remove(); return; }
      detail.querySelector(".vendor-loading")?.remove();
      const vendors = await fetch(`/api/spell/${encodeURIComponent(spell.id)}/vendors`).then((r) => r.json());
      const list = document.createElement("div");
      list.className = "vendor-list";
      if (!vendors.length) {
        list.innerHTML = '<div style="color:#666;font-size:12px;">No vendors found</div>';
      } else {
        list.innerHTML = vendors.map((v) =>
          `<div class="vendor-row"><span>${v.npc.label}</span><span class="zone-tag">— ${v.zone?.label || "unknown zone"}</span></div>`
        ).join("");
      }
      detail.appendChild(list);
    }, { once: false });
    el.appendChild(detail);
  }
}

// --- Graph (lazy loaded) ---
async function initGraph() {
  const graph = await fetch("/api/graph").then((r) => r.json());
  const elements = [
    ...graph.nodes.map((n) => ({ group: "nodes", data: n.data })),
    ...graph.edges
      .filter((e) => e.data.type !== "connects_to")
      .map((e) => ({ group: "edges", data: e.data })),
  ];

  cy = cytoscape({
    container: document.getElementById("cy"),
    elements,
    style: [
      {
        selector: "node",
        style: {
          label: "data(label)",
          "font-size": "7px",
          color: "#ddd",
          "text-valign": "bottom",
          "text-margin-y": 3,
          "background-color": (ele) => {
            const t = ele.data("type");
            if (t === "spell") return "#e94560";
            if (t === "zone") return "#0f3460";
            return "#533483";
          },
          width: (ele) => (ele.data("type") === "zone" ? 28 : ele.data("type") === "spell" ? 16 : 10),
          height: (ele) => (ele.data("type") === "zone" ? 28 : ele.data("type") === "spell" ? 16 : 10),
          shape: (ele) => {
            const t = ele.data("type");
            if (t === "spell") return "star";
            if (t === "zone") return "diamond";
            return "ellipse";
          },
        },
      },
      {
        selector: "edge",
        style: {
          width: 0.4,
          "line-color": "#333",
          "curve-style": "bezier",
          "target-arrow-shape": "triangle",
          "target-arrow-color": "#444",
          "arrow-scale": 0.4,
        },
      },
    ],
    layout: { name: "cose", animate: false, nodeRepulsion: 6000 },
    minZoom: 0.05,
    maxZoom: 5,
  });
}

init();
