let availableClasses = [];

async function init() {
  availableClasses = await fetch("/api/classes").then((r) => r.json());
  populateClassSelect();
  populateLevelSelect();
  setupFilters();
  fetchSpells();
}

function populateClassSelect() {
  const select = document.getElementById("spell-class-select");
  for (const cls of availableClasses) {
    const opt = document.createElement("option");
    opt.value = cls;
    opt.textContent = cls.charAt(0).toUpperCase() + cls.slice(1);
    select.appendChild(opt);
  }
}

function populateLevelSelect() {
  const sel = document.getElementById("spell-level-select");
  for (let i = 1; i <= 60; i++) {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `Level ${i}`;
    sel.appendChild(opt);
  }
}

function setupFilters() {
  const run = () => fetchSpells();
  document.getElementById("spell-class-select").addEventListener("change", run);
  document.getElementById("spell-level-select").addEventListener("change", run);
  let debounce;
  document.getElementById("spell-search").addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(run, 200);
  });
}

async function fetchSpells() {
  const cls = document.getElementById("spell-class-select").value;
  const level = document.getElementById("spell-level-select").value;
  const search = document.getElementById("spell-search").value.toLowerCase().trim();

  document.getElementById("spell-results").innerHTML = '<div class="loading">Loading...</div>';

  const params = new URLSearchParams({ class: cls });
  if (level !== "all") params.set("levels", level);
  const spells = await fetch(`/api/spells?${params}`).then((r) => r.json());

  const filtered = search ? spells.filter((s) => s.label.toLowerCase().includes(search)) : spells;
  renderSpells(filtered, cls);
}

function fmtDuration(d) {
  if (!d) return null;
  if (/instant/i.test(d)) return "Instant";
  return d.replace(/\s+minutes?/i, "m").replace(/\s+seconds?/i, "s");
}

function fmtCast(t) {
  if (t == null) return null;
  return t % 1 === 0 ? `${t}s cast` : `${t.toFixed(1)}s cast`;
}

function renderSpells(spells, cls) {
  const el = document.getElementById("spell-results");
  if (!spells.length) {
    el.innerHTML = '<div class="no-results">No spells found.</div>';
    return;
  }

  el.innerHTML = "";
  for (const spell of spells) {
    const level = spell.class_levels.find((cl) => cl.class === cls)?.level ?? "?";
    const card = document.createElement("div");
    card.className = "spell-detail";

    const badges = [];
    if (spell.spellType) badges.push(`<span class="spell-badge type-badge">${spell.spellType}</span>`);
    if (spell.mana != null) badges.push(`<span class="spell-badge mana-badge">${spell.mana} mana</span>`);
    if (spell.skill) badges.push(`<span class="spell-badge skill-badge">${spell.skill}</span>`);

    const stats = [];
    if (spell.targetType) stats.push(`<span class="stat-tag">Target: ${spell.targetType}</span>`);
    const dur = fmtDuration(spell.duration);
    if (dur) stats.push(`<span class="stat-tag">Duration: ${dur}</span>`);
    const cast = fmtCast(spell.castTime);
    if (cast) stats.push(`<span class="stat-tag">${cast}</span>`);
    if (spell.resist && !/unresist/i.test(spell.resist)) stats.push(`<span class="stat-tag">Resist: ${spell.resist}</span>`);

    card.innerHTML = `
      <div class="spell-header">
        <h3>${spell.label}<span class="spell-level">Level ${level}</span></h3>
        ${badges.length ? `<div class="spell-badges">${badges.join("")}</div>` : ""}
      </div>
      ${spell.description ? `<p class="spell-desc">${spell.description}</p>` : ""}
      ${stats.length ? `<div class="spell-stats">${stats.join("")}</div>` : ""}
      <div class="vendor-hint">Click to show vendors</div>
    `;

    card.addEventListener("click", async () => {
      const existing = card.querySelector(".vendor-list");
      if (existing) {
        existing.remove();
        card.querySelector(".vendor-hint").textContent = "Click to show vendors";
        return;
      }
      card.querySelector(".vendor-hint").textContent = "Loading...";
      const vendors = await fetch(`/api/spell/${encodeURIComponent(spell.id)}/vendors`).then((r) => r.json());
      card.querySelector(".vendor-hint").textContent = "Click to hide vendors";
      const list = document.createElement("div");
      list.className = "vendor-list";
      list.innerHTML = vendors.length
        ? vendors.map((v) => `<div class="vendor-row"><span>${v.npc.label}</span><span class="zone-tag">— ${v.zone?.label ?? "unknown zone"}</span></div>`).join("")
        : '<div class="vendor-row" style="color:#5a4428;">No vendors found</div>';
      card.appendChild(list);
    });

    el.appendChild(card);
  }
}

init();
