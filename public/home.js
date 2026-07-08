// Square MacroButton — matches the status panel's Show all/Clear owned
// (app.js), not the plain nav-link variant used in header .nav-links, since
// these read as three parallel "choose your tool" doors rather than a
// secondary nav row. Labeled with the feature's own name, not "Open" — the
// cards have no separate heading, so the button doubles as the title.
document.getElementById("spell-finder-open").outerHTML = MacroButton({ label: "Spell Finder", tag: "a", href: "index.html", square: true });
document.getElementById("route-finder-open").outerHTML = MacroButton({ label: "Route Finder", tag: "a", href: "route.html", square: true });
document.getElementById("class-browser-open").outerHTML = MacroButton({ label: "Class Browser", tag: "a", href: "class-browser.html", square: true });
