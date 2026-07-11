// Shared "owned spells" persistence — one localStorage set of spell ids,
// used by both the Spell Finder (checkbox per spell row, Show all/Clear
// owned in the status panel) and the Class Browser (checkbox per spell
// card, see class-browser.js's renderSpellCard). Both pages need the exact
// same key/shape so marking a spell owned in one place is reflected in the
// other.
const OWNED_KEY = "eq-planner-owned";

function getOwnedSpells() {
  try { return new Set(JSON.parse(localStorage.getItem(OWNED_KEY) || "[]")); }
  catch { return new Set(); }
}

function setSpellOwned(spellId, owned) {
  const set = getOwnedSpells();
  owned ? set.add(spellId) : set.delete(spellId);
  localStorage.setItem(OWNED_KEY, JSON.stringify([...set]));
}

function clearOwnedSpells() {
  localStorage.removeItem(OWNED_KEY);
}

// --- Lazy list rendering ---
// Shared incremental-append helper for Spell Finder's zone-card list
// (public/app.js renderRankings) and Class Browser's per-tab card list
// (public/class-browser.js render) -- both build a flat array of items to
// render 1:1 into a container via a per-item factory, and both can have
// thousands of entries with no filters applied. Renders one batch
// synchronously, then grows the list via an IntersectionObserver on a
// trailing sentinel as it scrolls into view, instead of creating every
// card up front.
//
// root:null (viewport-relative) is deliberate, not an oversight: #results
// and #browser-content scroll internally on wide layouts, but the
// *document* scrolls instead below each page's sidebar breakpoint (see
// index.html/class-browser.html's own `@media (max-width: 1099.98px)`
// blocks). A sentinel's viewport intersection is what matters either way,
// so this needs no per-page knowledge of which ancestor is the actual
// scroll container.
//
// Callers are expected to have already cleared `container` (both call
// sites do via innerHTML = "" before deciding whether to show an empty
// state or call this). This function still always tears down any
// IntersectionObserver left over from a previous call on the same
// container before starting -- container._lazyObserver survives an
// innerHTML clear (it's a JS property on the node, not a child), so
// without this a filter change / tab switch / re-render would otherwise
// leak one observer per call.
const LAZY_BATCH_SIZE = 40;

function lazyRenderList(container, items, renderItem, batchSize = LAZY_BATCH_SIZE) {
  container._lazyObserver?.disconnect();

  let index = 0;
  let sentinel = null;

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) renderNextBatch();
  }, { root: null, rootMargin: "600px" });

  function renderNextBatch() {
    const end = Math.min(index + batchSize, items.length);
    for (; index < end; index++) container.appendChild(renderItem(items[index]));

    sentinel?.remove();
    if (index < items.length) {
      sentinel = document.createElement("div");
      sentinel.className = "lazy-sentinel";
      sentinel.setAttribute("aria-hidden", "true");
      container.appendChild(sentinel);
      observer.observe(sentinel);
    } else {
      sentinel = null;
      container._lazyObserver = null;
      observer.disconnect();
    }
  }

  container._lazyObserver = observer;
  renderNextBatch();
}
