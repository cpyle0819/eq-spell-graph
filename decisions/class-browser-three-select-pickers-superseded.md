# Class Browser page (formerly "Stances & Invocations"): three `<select>` pickers, not a multi-select

"Pick 1-3 classes" was originally three independent class `<select>` dropdowns (Class 1/2/3, each with a "— None —" option), consistent with the zone picker decision above, each disabling any class already chosen by a sibling to prevent duplicate picks. Results are the union of abilities available to any selected class; each ability card is badged with which of the *selected* classes grant it (not its full class list), so overlap between classes is visible at a glance.

**Superseded** by a single tag box (see "Sidebar filter panel" below) — no fixed 1-3 cap anymore (that was a constraint of three side-by-side selects, not a real rule), and the union/badging behavior above carries over unchanged.

`public/stances.html`/`stances.js` were renamed to `public/class-browser.html`/`class-browser.js` when AA data (migration 017) was added, since the page now covers more than stances/invocations and is meant to be the general "filter abilities by class" page going forward — any future class-scoped ability type belongs here rather than in a new standalone page (see below — spells followed this same logic next). Results are grouped by category — Spells, Stances, Invocations, General AAs, Archetype AAs, Class AAs, Special AAs — skipping any category that comes back empty, so each type's distinct shape (spells have level/mana/vendors; AAs have ranks/cost; stances/invocations have neither) stays legible.

