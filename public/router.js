// Shared shell router — the single script every page loads (replacing each
// page's own <script type="module" src="app.js"> etc.). Keeps <app-header>/
// <app-footer> alive across same-origin navigations between this app's own
// pages instead of the browser doing a full document reload each time (see
// decisions/client-side-shell-router.md): intercepts a link click, fetches
// the target page's HTML, swaps the page-specific <style>, <title>,
// app-header's attributes/slotted nav, and the body's content region, then
// dynamically imports and calls that page's own init(). Falls back to a
// real navigation for anything it doesn't recognize (external links,
// modified clicks, fetch failures) — this never intercepts navigation it
// can't itself complete.
import "./components/index.js";

// Every page's own script now exports init() instead of self-invoking at
// its bottom (see app.js/route.js/class-browser.js) — a plain top-level
// call would only ever fire once per module per page load (ES modules
// execute their top level exactly once, cached by specifier), so a second
// soft-navigation back to an already-visited page would silently render
// nothing. The router calls init() itself, once per navigation, hard load
// or soft.
const PAGE_SCRIPTS = {
  "index.html": () => import("./app.js"),
  "route.html": () => import("./route.js"),
  "class-browser.html": () => import("./class-browser.js"),
  "quests.html": () => import("./quests.js"),
};
// home.html and leveling-guide.html are static content — no page script,
// nothing for the router to call after swapping them in.
const ALL_PAGES = new Set([...Object.keys(PAGE_SCRIPTS), "home.html", "leveling-guide.html"]);

// Mirrors src/server.ts's own "/" -> "/index.html" static-file rewrite —
// without this, a root visit's location.pathname is "/", which matches
// nothing below, so its own init() (and the first-time-visitor redirect
// inside it) would silently never run.
function pageKey(url) {
  return url.pathname === "/" ? "index.html" : url.pathname.split("/").pop();
}

async function runPageInit(url) {
  const loader = PAGE_SCRIPTS[pageKey(url)];
  if (loader) (await loader()).init();
}

// Everything in <body> except the persistent chrome (app-header/app-footer)
// and the router's own <script> tag is "content" — swapped wholesale on
// every navigation, the same as a hard reload would replace it.
function isChrome(el) {
  return el.tagName === "APP-HEADER" || el.tagName === "APP-FOOTER" || el.tagName === "SCRIPT";
}

function applySwap(newDoc) {
  document.title = newDoc.title;

  const oldStyle = document.getElementById("page-style");
  const newStyle = newDoc.getElementById("page-style");
  if (oldStyle && newStyle) oldStyle.textContent = newStyle.textContent;

  // app-header itself stays the same live node (and so never re-runs its
  // connectedCallback) — only its attributes (subtitle/home) and slotted
  // nav-links content change per page. innerHTML-replacing the slotted
  // content is safe: nav-links carries no state beyond its `current`
  // attribute, so recreating it is indistinguishable from updating it.
  const oldHeader = document.querySelector("app-header");
  const newHeader = newDoc.querySelector("app-header");
  if (oldHeader && newHeader) {
    for (const name of oldHeader.getAttributeNames()) {
      if (!newHeader.hasAttribute(name)) oldHeader.removeAttribute(name);
    }
    for (const name of newHeader.getAttributeNames()) {
      oldHeader.setAttribute(name, newHeader.getAttribute(name));
    }
    oldHeader.innerHTML = newHeader.innerHTML;
  }

  const footer = document.querySelector("app-footer");
  [...document.body.children].filter((el) => !isChrome(el)).forEach((el) => el.remove());
  [...newDoc.body.children].filter((el) => !isChrome(el)).forEach((el) => {
    document.body.insertBefore(document.adoptNode(el), footer);
  });
}

async function navigate(url, { push = true } = {}) {
  let html;
  try {
    const res = await fetch(url.href);
    if (!res.ok) throw new Error(`${res.status} ${url.href}`);
    html = await res.text();
  } catch {
    // Same-origin page the router doesn't have a good way to render (e.g.
    // offline, 404) — fall back to a real navigation rather than leaving
    // the click silently swallowed.
    location.href = url.href;
    return;
  }

  const newDoc = new DOMParser().parseFromString(html, "text/html");
  const doSwap = () => {
    applySwap(newDoc);
    if (push) history.pushState({}, "", url);
    window.scrollTo(0, 0);
  };
  // Feature-detected, Chromium-only progressive enhancement: crossfades the
  // swap instead of it happening as a hard cut. Reduced-motion is handled
  // in theme.css, not here. updateCallbackDone (not the transition's own
  // returned value) is what resolves once doSwap has actually run — the
  // callback isn't guaranteed to run synchronously just because
  // startViewTransition() itself returned (confirmed empirically: it
  // didn't, on this Chromium build), so runPageInit() below can't safely
  // follow doSwap() without awaiting this.
  if (document.startViewTransition) await document.startViewTransition(doSwap).updateCallbackDone;
  else doSwap();

  await runPageInit(url);
}

// e.composedPath() (not e.target) is required to find the actual <a>: every
// link in this app's chrome/cards renders inside a shadow root
// (macro-button, app-header's title, spell-card's "Find in Spell Finder"),
// and e.target is retargeted to the shadow host for a listener attached
// outside the shadow tree, same quirk documented in decisions/
// real-web-components-shadow-dom.md for shadow-internal event handling.
function findAnchor(e) {
  return e.composedPath().find((n) => n.tagName === "A");
}

function isRoutable(a) {
  if (!a?.href) return false;
  if (a.target && a.target !== "_self") return false; // e.g. target="_blank" wiki links
  if (a.hasAttribute("download")) return false;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return false;
  return ALL_PAGES.has(pageKey(url));
}

document.addEventListener("click", (e) => {
  if (e.defaultPrevented || e.button !== 0) return;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // let the browser open new tabs/windows normally
  const a = findAnchor(e);
  if (!isRoutable(a)) return;
  const url = new URL(a.href, location.href);
  if (url.href === location.href) return;
  e.preventDefault();
  navigate(url);
});

window.addEventListener("popstate", () => navigate(new URL(location.href), { push: false }));

// Initial load: the browser already parsed the correct document for this
// URL, so there's nothing to fetch/swap — just run this page's own init().
runPageInit(new URL(location.href));
