// Shared "macro button" component — a MacroSocket (recessed cavity) wrapping
// a MacroButton (raised button or link inside it). Every non-text button
// across all three pages renders through this (nav links, Show all/Show
// remaining/Clear owned); .text-action links are a separate, plain-text
// idiom and don't use this. See theme.css for the .macro-socket/.macro-btn
// rules and DECISIONS.md for the bevel rationale.
//
// Size is dynamic (fits the label) by default. Pass square: true for a
// fixed 90x90 slot instead (e.g. side-by-side action buttons that need to
// match each other's size regardless of label length).
//
// The over-10-characters .long-label font shrink only makes sense for
// .square: that variant is a fixed 90x90 box, so a long label genuinely has
// nowhere to go but a smaller font. Dynamic (non-square) buttons — nav
// links like "Route Finder"/"Class Browser" — have no such constraint,
// their box just grows to fit the label at the normal size; shrinking their
// font too was an unintended side effect of one shared length check, not a
// deliberate choice, and made nav text hard to read.
function MacroButton({ label, tag = "button", href, id, className = "", square = false, longLabel } = {}) {
  const isLong = square && (longLabel ?? label.length > 10);
  const btnClasses = ["macro-btn", square ? "square" : "", isLong ? "long-label" : "", className]
    .filter(Boolean)
    .join(" ");
  const socketClasses = ["macro-socket", square ? "square" : ""].filter(Boolean).join(" ");
  const idAttr = id ? ` id="${id}"` : "";
  const hrefAttr = tag === "a" ? ` href="${href}"` : "";
  const typeAttr = tag === "button" ? ` type="button"` : "";
  return `<div class="${socketClasses}"><${tag} class="${btnClasses}"${idAttr}${hrefAttr}${typeAttr}>${label}</${tag}></div>`;
}

// Shared sidebar filter panel — the .controls-panel > .planner-controls >
// .field* > .panel-actions wrapper both the Spell Finder and Class Browser
// use for their filter sidebar (see theme.css's "Sidebar filter panel" rule
// for the shared CSS this markup relies on). Each field's *inner* control
// (a <select>, a tag-wrap, a range-picker) is still supplied by the caller
// as ready-made HTML — those vary too much to usefully generalize further,
// unlike MacroButton/setupTagInput which fully own their markup — this
// component only builds the repeated wrapper/label/actions shell so that
// structure lives in one place instead of being hand-copied per page.
//
// A field entry is either { label, html, id?, hidden? } (label + control,
// wrapped in a .field div) or { raw } (arbitrary markup with no label/field
// wrapper at all, e.g. Spell Finder's .control-sep divider).
function SidebarPanel({ fields, actions = [] }) {
  const fieldsHtml = fields.map((f) => {
    if (f.raw !== undefined) return f.raw;
    const idAttr = f.id ? ` id="${f.id}"` : "";
    const hiddenAttr = f.hidden ? " hidden" : "";
    return `<div class="field"${idAttr}${hiddenAttr}>
      <label>${f.label}</label>
      ${f.html}
    </div>`;
  }).join("");
  const actionsHtml = actions.length ? `<div class="panel-actions">${actions.join("")}</div>` : "";
  return `<div class="controls-panel"><div class="planner-controls">${fieldsHtml}${actionsHtml}</div></div>`;
}

// The tag-wrap markup every setupTagInput() instance needs (chip list +
// search input), keyed by id prefix — e.g. tagWrapHtml("class") produces
// #class-tag-wrap/#class-tags/#class-search-input, matching what
// setupTagInput's wrapId/tagsId/inputId options expect. Shared since both
// the Spell Finder's and Class Browser's sidebars build several of these.
function tagWrapHtml(prefix) {
  return `<div class="tag-wrap" id="${prefix}-tag-wrap">
    <div class="tag-list" id="${prefix}-tags"></div>
    <input type="text" id="${prefix}-search-input" class="tag-search-input" placeholder="Search to add..." autocomplete="off" spellcheck="false">
  </div>`;
}

// Generic multi-select "tag" input: a search box that adds chips to a list,
// with a positioned dropdown of suggestions (keyboard nav, click-to-add,
// click-outside-to-close). Backs the Spell Finder's Spell Class/Specific
// Spells/Specific Zones/Spell Line filters and the Class Browser's Classes
// filter — all five need the same add/remove/dropdown wiring, just over
// different item shapes (plain class-name strings, {id, label} zones/spell
// lines, spell search results), so this takes plain accessor functions
// instead of assuming one shape.
//
// getMatches may return an array directly or a Promise of one (for a
// server-backed search like Specific Spells); minQueryLength gates when it's
// even called (0 = show everything not yet selected on focus, like the
// class/zone/spell-line filters do; 2 = Specific Spells' server search,
// which doesn't want to fire on every keystroke from an empty box).
function setupTagInput({
  wrapId, tagsId, inputId, dropdownId,
  getSelected, addItem, removeItem,
  getMatches, itemId, itemLabel,
  emptyMessage = "No matches",
  minQueryLength = 0,
  debounceMs = 0,
  onChange,
}) {
  const wrap = document.getElementById(wrapId);
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(dropdownId);
  const tagsEl = document.getElementById(tagsId);
  let activeIndex = -1;
  let currentItems = [];
  let searchDebounce;

  function renderTags() {
    tagsEl.innerHTML = getSelected().map((item) => {
      const id = itemId(item), label = itemLabel(item);
      return `<span class="tag-item" data-id="${id}">
        <span class="tag-item-name">${label}</span>
        <button class="tag-item-remove" data-id="${id}" aria-label="Remove ${label}">&times;</button>
      </span>`;
    }).join("");
  }

  function positionDropdown() {
    const r = wrap.getBoundingClientRect();
    dropdown.style.left = `${r.left}px`;
    dropdown.style.width = `${r.width}px`;
    dropdown.style.top = `${r.bottom + 4}px`;
  }

  function openDropdown(items) {
    activeIndex = -1;
    currentItems = items;
    dropdown.innerHTML = items.length
      ? items.map((item) => `<div class="suggestion-item" role="option" data-id="${itemId(item)}">${itemLabel(item)}</div>`).join("")
      : `<div class="suggestion-empty">${emptyMessage}</div>`;
    positionDropdown();
    dropdown.classList.add("open");
  }

  function closeDropdown() {
    dropdown.classList.remove("open");
    activeIndex = -1;
  }

  async function runSearch() {
    const q = input.value.trim();
    if (q.length < minQueryLength) { closeDropdown(); return; }
    openDropdown(await getMatches(q));
  }

  function add(item) {
    addItem(item);
    renderTags();
    input.value = "";
    closeDropdown();
    input.focus();
    onChange?.();
  }

  function remove(id) {
    removeItem(id);
    renderTags();
    onChange?.();
  }

  input.addEventListener("input", () => {
    if (debounceMs > 0) {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(runSearch, debounceMs);
    } else {
      runSearch();
    }
  });

  input.addEventListener("focus", () => { if (input.value.trim().length >= minQueryLength) runSearch(); });

  input.addEventListener("keydown", (e) => {
    if (!dropdown.classList.contains("open")) return;
    const items = dropdown.querySelectorAll(".suggestion-item");
    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      items.forEach((el, i) => el.classList.toggle("active", i === activeIndex));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      items.forEach((el, i) => el.classList.toggle("active", i === activeIndex));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const found = currentItems[activeIndex];
      if (found) add(found);
    } else if (e.key === "Escape") {
      closeDropdown();
    }
  });

  input.addEventListener("blur", () => { setTimeout(closeDropdown, 150); });

  dropdown.addEventListener("mousedown", (e) => {
    const el = e.target.closest(".suggestion-item");
    if (!el) return;
    e.preventDefault();
    const idx = [...dropdown.querySelectorAll(".suggestion-item")].indexOf(el);
    const found = currentItems[idx];
    if (found) add(found);
  });

  tagsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".tag-item-remove");
    if (btn) remove(btn.dataset.id);
  });

  wrap.addEventListener("click", (e) => {
    if (!e.target.closest(".tag-item-remove")) input.focus();
  });

  window.addEventListener("resize", () => { if (dropdown.classList.contains("open")) positionDropdown(); });

  renderTags();
  return { renderTags };
}
