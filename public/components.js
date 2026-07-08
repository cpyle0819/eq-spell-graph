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
