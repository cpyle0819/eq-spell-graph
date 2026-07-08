// <tag-input placeholder="Search to add..." aria-label="Class suggestions">
// — a search box that adds chips to a list, with a positioned dropdown of
// suggestions (keyboard nav, click-to-add, click-outside-to-close). Backs
// every multi-select "tag" filter in the app (Spell Finder's Spell Class/
// Spell Line/Specific Spells/Specific Zones, Class Browser's Classes/Spell
// Line) over different item shapes (plain strings, {id,label} zones/spell
// lines, spell search results) via caller-supplied accessor functions
// (properties, not attributes, since they're functions):
//
//   tagInput.getMatches = (q) => [...] | Promise<[...]>
//   tagInput.itemId = (item) => string
//   tagInput.itemLabel = (item) => string
//   tagInput.emptyMessage = "No matching classes"
//   tagInput.minQueryLength = 0   // 0 = show everything on focus; 2 = don't
//                                 // search an empty/near-empty box
//   tagInput.debounceMs = 0       // only the server-backed Specific Spells
//                                 // search debounces
//   tagInput.reopenOnFocus = true // whether refocusing after a blur reopens
//                                 // the dropdown without retyping
//   tagInput.closeOnScroll = false
//   tagInput.selected = [...]     // set externally (e.g. restoring saved
//                                 // state); read via the getter anytime
//
// Fires a "change" CustomEvent (detail: { selected }) after every add/
// remove. The component owns add/remove and always de-dupes by itemId, so
// callers never need their own guard against re-adding an already-selected
// item.
//
// The suggestion dropdown is a plain element appended to `document.body`
// (position: fixed, styled by theme.css's existing .tag-dropdown/
// .suggestion-item/.suggestion-empty rules) rather than living in this
// component's shadow root -- position: fixed already escapes the sidebar's
// `overflow: hidden`, and keeping the dropdown as a body-level light-DOM
// node avoids any risk from an intervening stacking context that shadow
// nesting could introduce.
import { RESET_CSS } from "./reset.js";

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
${RESET_CSS}
:host {
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: text;
  padding: 5px 8px !important;
  background: var(--panel-deep);
  border: 4px solid;
  border-color: var(--edge-lo) var(--edge-lo) #615b72 #615b72;
  border-radius: 3px;
  box-shadow: inset 0 3px 7px rgba(0, 0, 0, 0.8), inset 0 0 0 1px rgba(0, 0, 0, 0.35);
  transition: border-color 150ms, box-shadow 150ms;
}
:host(:hover) { border-color: var(--edge-lo) var(--edge-lo) #837c9d #837c9d; }
:host(:focus-within) {
  border-color: var(--gold);
  box-shadow: inset 0 3px 7px rgba(0, 0, 0, 0.8), inset 0 0 0 1px rgba(0, 0, 0, 0.35), 0 0 0 3px rgba(232, 168, 42, 0.18);
  outline: none;
}
.tag-list { display: flex; flex-wrap: wrap; gap: 4px; }
.tag-list:empty { display: none; }
.tag-item {
  display: inline-flex; align-items: center; gap: 3px;
  background: rgba(232, 168, 42, 0.14); border: 1px solid rgba(232, 168, 42, 0.35);
  border-radius: 3px; padding: 2px 4px 2px 8px; font-size: 11px; color: #d4ad59;
  white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis;
}
.tag-item-name { overflow: hidden; text-overflow: ellipsis; }
.tag-item-remove {
  flex-shrink: 0; width: 16px; height: 16px; border-radius: 3px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--ink-muted); font-size: 12px; line-height: 1;
  background: transparent; border: none; padding: 0; font-weight: 400;
  box-shadow: none; text-shadow: none; text-transform: none; letter-spacing: 0;
  font-family: var(--font-body);
}
.tag-item-remove:hover { background: rgba(239, 68, 68, 0.18); color: #f26b6b; }
input {
  background: transparent; border: none; box-shadow: none; outline: none;
  color: var(--parchment); font-size: 13px; font-family: var(--font-body);
  width: 100%; padding: 1px 0; min-width: 80px;
}
@media (max-width: 700px) {
  .tag-item-remove { min-height: 0; }
}
`);

class TagInput extends HTMLElement {
  #selected = [];
  #getMatches = () => [];
  #itemId = (x) => x;
  #itemLabel = (x) => String(x);
  #emptyMessage = "No matches";
  #minQueryLength = 0;
  #debounceMs = 0;
  #reopenOnFocus = true;
  #closeOnScroll = false;
  #activeIndex = -1;
  #currentItems = [];
  #searchDebounce;
  #dropdown;

  static get observedAttributes() { return ["placeholder"]; }

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
      this.shadowRoot.innerHTML = `
        <div class="tag-list"></div>
        <input type="text" class="tag-search-input" autocomplete="off" spellcheck="false">
      `;
      this.#dropdown = document.createElement("div");
      this.#dropdown.className = "tag-dropdown";
      this.#dropdown.setAttribute("role", "listbox");
      // Ties the anonymous body-appended dropdown back to its owning
      // tag-input for anyone inspecting the DOM (devtools, tests) -- with
      // several tag-inputs on one page, an unlabeled floating dropdown is
      // otherwise indistinguishable from any other.
      if (this.id) this.#dropdown.id = `${this.id}-dropdown`;
      const label = this.getAttribute("aria-label");
      if (label) this.#dropdown.setAttribute("aria-label", label);
      this.#wireEvents();
    }
    document.body.appendChild(this.#dropdown);
    this.renderTags();
    this.#updatePlaceholder();
  }

  disconnectedCallback() {
    this.#dropdown?.remove();
  }

  attributeChangedCallback() {
    if (this.shadowRoot) this.#updatePlaceholder();
  }

  #updatePlaceholder() {
    this.shadowRoot.querySelector(".tag-search-input").placeholder = this.getAttribute("placeholder") || "Search to add...";
  }

  set getMatches(fn) { this.#getMatches = fn; }
  set itemId(fn) { this.#itemId = fn; }
  set itemLabel(fn) { this.#itemLabel = fn; }
  set emptyMessage(v) { this.#emptyMessage = v; }
  set minQueryLength(v) { this.#minQueryLength = v; }
  set debounceMs(v) { this.#debounceMs = v; }
  set reopenOnFocus(v) { this.#reopenOnFocus = v; }
  set closeOnScroll(v) { this.#closeOnScroll = v; }

  get selected() { return this.#selected; }
  set selected(arr) {
    this.#selected = arr || [];
    if (this.shadowRoot) this.renderTags();
  }

  renderTags() {
    const tagsEl = this.shadowRoot.querySelector(".tag-list");
    tagsEl.innerHTML = this.#selected.map((item) => {
      const id = this.#itemId(item), label = this.#itemLabel(item);
      return `<span class="tag-item" data-id="${id}">
        <span class="tag-item-name">${label}</span>
        <button class="tag-item-remove" data-id="${id}" aria-label="Remove ${label}">&times;</button>
      </span>`;
    }).join("");
  }

  #positionDropdown() {
    const r = this.getBoundingClientRect();
    this.#dropdown.style.left = `${r.left}px`;
    this.#dropdown.style.width = `${r.width}px`;
    this.#dropdown.style.top = `${r.bottom + 4}px`;
  }

  #openDropdown(items) {
    this.#activeIndex = -1;
    this.#currentItems = items;
    this.#dropdown.innerHTML = items.length
      ? items.map((item) => `<div class="suggestion-item" role="option" data-id="${this.#itemId(item)}">${this.#itemLabel(item)}</div>`).join("")
      : `<div class="suggestion-empty">${this.#emptyMessage}</div>`;
    this.#positionDropdown();
    this.#dropdown.classList.add("open");
  }

  #closeDropdown() {
    this.#dropdown.classList.remove("open");
    this.#activeIndex = -1;
  }

  async #runSearch() {
    const input = this.shadowRoot.querySelector(".tag-search-input");
    const q = input.value.trim();
    if (q.length < this.#minQueryLength) { this.#closeDropdown(); return; }
    this.#openDropdown(await this.#getMatches(q));
  }

  #add(item) {
    const id = this.#itemId(item);
    if (this.#selected.some((x) => this.#itemId(x) === id)) return;
    this.#selected.push(item);
    this.renderTags();
    const input = this.shadowRoot.querySelector(".tag-search-input");
    input.value = "";
    this.#closeDropdown();
    input.focus();
    this.dispatchEvent(new CustomEvent("change", { detail: { selected: this.#selected } }));
  }

  #remove(id) {
    this.#selected = this.#selected.filter((item) => this.#itemId(item) !== id);
    this.renderTags();
    this.dispatchEvent(new CustomEvent("change", { detail: { selected: this.#selected } }));
  }

  #wireEvents() {
    const input = this.shadowRoot.querySelector(".tag-search-input");
    const tagsEl = this.shadowRoot.querySelector(".tag-list");

    input.addEventListener("input", () => {
      if (this.#debounceMs > 0) {
        clearTimeout(this.#searchDebounce);
        this.#searchDebounce = setTimeout(() => this.#runSearch(), this.#debounceMs);
      } else {
        this.#runSearch();
      }
    });

    input.addEventListener("focus", () => {
      if (!this.#reopenOnFocus) return;
      if (input.value.trim().length >= this.#minQueryLength) this.#runSearch();
    });

    input.addEventListener("keydown", (e) => {
      if (!this.#dropdown.classList.contains("open")) return;
      const items = this.#dropdown.querySelectorAll(".suggestion-item");
      if (e.key === "ArrowDown") {
        e.preventDefault();
        this.#activeIndex = Math.min(this.#activeIndex + 1, items.length - 1);
        items.forEach((el, i) => el.classList.toggle("active", i === this.#activeIndex));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this.#activeIndex = Math.max(this.#activeIndex - 1, 0);
        items.forEach((el, i) => el.classList.toggle("active", i === this.#activeIndex));
      } else if (e.key === "Enter" && this.#activeIndex >= 0) {
        e.preventDefault();
        const found = this.#currentItems[this.#activeIndex];
        if (found) this.#add(found);
      } else if (e.key === "Escape") {
        this.#closeDropdown();
      }
    });

    input.addEventListener("blur", () => { setTimeout(() => this.#closeDropdown(), 150); });

    this.#dropdown.addEventListener("mousedown", (e) => {
      const el = e.target.closest(".suggestion-item");
      if (!el) return;
      e.preventDefault();
      const idx = [...this.#dropdown.querySelectorAll(".suggestion-item")].indexOf(el);
      const found = this.#currentItems[idx];
      if (found) this.#add(found);
    });

    tagsEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".tag-item-remove");
      if (btn) this.#remove(btn.dataset.id);
    });

    // Listening on shadowRoot itself (not `this`/the host) sees the real
    // internal e.target directly -- event retargeting to the host only
    // applies to listeners outside the shadow tree.
    this.shadowRoot.addEventListener("click", (e) => {
      if (!e.target.closest(".tag-item-remove")) input.focus();
    });

    window.addEventListener("resize", () => { if (this.#dropdown.classList.contains("open")) this.#positionDropdown(); });
    if (this.#closeOnScroll) {
      window.addEventListener("scroll", () => this.#closeDropdown(), { passive: true });
    }
  }
}

customElements.define("tag-input", TagInput);
