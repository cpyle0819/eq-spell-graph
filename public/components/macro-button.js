// A MacroSocket (recessed cavity, :host) wrapping a MacroButton (raised
// button or link inside it). Every non-text button across all pages
// renders through this — nav links, Show all/Show remaining/Clear owned,
// home page tool-card buttons; .text-action links are a separate plain-text
// idiom and don't use this. See decisions/ for the bevel rationale.
//
// Usage: <macro-button href="index.html">Spell Finder</macro-button> or
// <macro-button square>Clear owned</macro-button>. Size fits the label by
// default; `square` fixes it to a 90x90 slot regardless of label length,
// shrinking the font further past 10 characters since a square box has
// nowhere else for a long label to go. `square small` instead fixes it to
// 37x37, for a square sitting flush next to a `.field select`/`.field
// input` of the same height (theme.css) instead of towering over it --
// currently unused (Maps' old inline "add a stop here" button, issue #63,
// used this before its route panel became a fixed-width vertical stack;
// left in as a sized option should a future inline square need it again).
// `full` instead stretches to its container's whole width, same bevel as
// the default nav-row button but block-shaped -- for a vertical stack of
// feature-toggle/action buttons (Maps' left panel) where a row of squares
// would waste horizontal space.
//
// `toggled` gives a plain button the same depressed look as `pressed`
// (current-nav-page) *without* `pressed`'s side effect of rendering as an
// inert <span> — `pressed` is for a state the user can't click their way
// out of (you're already on this page); `toggled` is for a real on/off
// control (Maps' Ports button) that has to stay clickable in
// both states. Caller owns the state — toggle the attribute on click.
import { RESET_CSS } from "./reset.js";

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
${RESET_CSS}
:host {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-image: var(--marble-tex), linear-gradient(180deg, var(--stone-1), var(--stone-2));
  border-width: 4px;
  border-style: solid;
  border-top-color: #362c5a;
  border-right-color: #362c5a;
  border-bottom-color: var(--edge-hi);
  border-left-color: var(--edge-hi);
  border-radius: 0;
  box-shadow: inset -2px -2px 3px rgba(255, 255, 255, 0.12), inset 2px 2px 3px rgba(0, 0, 0, 0.55);
  /* Chrome for Android has been observed leaving this inset shadow (and
     .btn's mix-blend-mode bevel below) unpainted until some later repaint
     forces it -- tapping (:active) was the only thing that triggered it,
     making the button flash from flat to beveled. Forcing its own
     compositor layer up front makes the first paint already include it. */
  transform: translateZ(0);
}
:host(.square) {
  flex-grow: 0; flex-shrink: 0; flex-basis: auto;
  width: 90px; height: 90px;
  border-width: 5px;
}
:host(.square.small) {
  width: 37px; height: 37px;
  border-width: 3px;
}
:host(.full) { display: flex; width: 100%; }
.btn.full { width: 100%; }
.btn {
  position: relative; isolation: isolate; overflow: hidden;
  transform: translateZ(0);
  display: inline-flex; align-items: center; justify-content: center;
  text-align: center;
  padding: 13px 23px;
  overflow-wrap: break-word;
  background-image: var(--bone-tex), var(--parch-tex), linear-gradient(180deg, var(--bone-1) 0%, #d9cead 55%, var(--bone-2) 100%);
  border: 0;
  border-radius: 0;
  color: var(--bone-ink);
  cursor: pointer;
  text-decoration: none;
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-family: var(--font-body);
  line-height: 1.3;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.4);
  box-shadow: none;
  transition: filter 150ms;
}
/* The global "button { min-height: 44px }" narrow-screen tap-target rule
   (theme.css) only ever matched .macro-btn when it rendered as a real
   button (not an anchor) -- replicated here scoped the same way, since
   Shadow DOM means that outer rule can no longer reach in. Excludes
   .small: its :host is hard-fixed to 37px to match an adjacent input's
   height, and a 44px min-height floor would overflow that fixed box. */
@media (max-width: 700px) {
  .btn.as-button:not(.small) { min-height: 44px; }
}
.btn::before, .btn::after { content: ""; position: absolute; inset: 0; pointer-events: none; }
.btn::before {
  background-image: var(--bone-tex), linear-gradient(to bottom, white, transparent 5px), linear-gradient(to left, white, transparent 5px);
  mix-blend-mode: lighten;
  clip-path: polygon(0 0, 100% 0, 100% 100%, calc(100% - 5px) calc(100% - 5px), calc(100% - 5px) 5px, 5px 5px);
}
.btn::after {
  background-image: var(--bone-tex), linear-gradient(to top, black, transparent 5px), linear-gradient(to right, black, transparent 5px);
  mix-blend-mode: darken;
  clip-path: polygon(0 0, 0 100%, 100% 100%, calc(100% - 5px) calc(100% - 5px), 5px calc(100% - 5px), 5px 5px);
}
.btn.square {
  width: 100%; height: 100%;
  padding: 9px;
  font-size: 10.5px;
}
.btn.square::before {
  background-image: var(--bone-tex), linear-gradient(to bottom, white, transparent 6px), linear-gradient(to left, white, transparent 6px);
  clip-path: polygon(0 0, 100% 0, 100% 100%, calc(100% - 6px) calc(100% - 6px), calc(100% - 6px) 6px, 6px 6px);
}
.btn.square::after {
  background-image: var(--bone-tex), linear-gradient(to top, black, transparent 6px), linear-gradient(to right, black, transparent 6px);
  clip-path: polygon(0 0, 0 100%, 100% 100%, calc(100% - 6px) calc(100% - 6px), 6px calc(100% - 6px), 6px 6px);
}
/* A 3px inset (not the regular square's 6px) -- the small square's own
   border is 3px, so the highlight/shadow falloff scales down to match,
   same reasoning as the regular square's 6px matching its 5px border. The
   "+" glyph is a single bold character, not a wrapped label, so this drops
   the label-oriented padding/word-wrap entirely rather than inheriting
   .btn.square's. */
.btn.square.small {
  padding: 0;
  font-size: 20px;
  font-weight: 700;
  overflow-wrap: normal;
}
.btn.square.small::before {
  background-image: var(--bone-tex), linear-gradient(to bottom, white, transparent 3px), linear-gradient(to left, white, transparent 3px);
  clip-path: polygon(0 0, 100% 0, 100% 100%, calc(100% - 3px) calc(100% - 3px), calc(100% - 3px) 3px, 3px 3px);
}
.btn.square.small::after {
  background-image: var(--bone-tex), linear-gradient(to top, black, transparent 3px), linear-gradient(to right, black, transparent 3px);
  clip-path: polygon(0 0, 0 100%, 100% 100%, calc(100% - 3px) calc(100% - 3px), 3px calc(100% - 3px), 3px 3px);
}
.btn.long-label { font-size: 8.5px; }
.btn:hover { filter: brightness(1.05); }
.btn:active {
  box-shadow: inset 2px -2px 3px rgba(255, 255, 255, 0.3), inset -2px 2px 3px rgba(0, 0, 0, 0.35);
  filter: brightness(0.96);
}
.btn:active::before {
  background-image: var(--bone-tex), linear-gradient(to top, black, transparent 5px), linear-gradient(to right, black, transparent 5px);
  mix-blend-mode: darken;
}
.btn:active::after {
  background-image: var(--bone-tex), linear-gradient(to bottom, white, transparent 5px), linear-gradient(to left, white, transparent 5px);
  mix-blend-mode: lighten;
}
.btn.square:active::before {
  background-image: var(--bone-tex), linear-gradient(to top, black, transparent 6px), linear-gradient(to right, black, transparent 6px);
}
.btn.square:active::after {
  background-image: var(--bone-tex), linear-gradient(to bottom, white, transparent 6px), linear-gradient(to left, white, transparent 6px);
}
.btn:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
/* Permanently "depressed" look for e.g. the current-page nav button --
   same treatment as .btn:active, but held rather than momentary. Disabled
   reuses this exact same look rather than a separate grayscale/dimmed
   treatment -- "can't press this yet" reads as already-pushed-in, the same
   physical metaphor as a held-down button, not as broken or missing
   artwork. */
.btn.pressed, .btn.pressed:hover, .btn:disabled, .btn:disabled:hover, .btn:disabled:active {
  cursor: default;
  box-shadow: inset 2px -2px 3px rgba(255, 255, 255, 0.3), inset -2px 2px 3px rgba(0, 0, 0, 0.35);
  filter: brightness(0.96);
}
.btn.pressed::before, .btn:disabled::before {
  background-image: var(--bone-tex), linear-gradient(to top, black, transparent 5px), linear-gradient(to right, black, transparent 5px);
  mix-blend-mode: darken;
}
.btn.pressed::after, .btn:disabled::after {
  background-image: var(--bone-tex), linear-gradient(to bottom, white, transparent 5px), linear-gradient(to left, white, transparent 5px);
  mix-blend-mode: lighten;
}
/* Same square-specific 6px inset as .btn.square:active's own -- the
   thicker square border needs a wider gradient falloff than the default
   button's, same reasoning as that rule. .pressed never needed this
   (nothing square uses it today), but disabled does (Find Near Me). */
.btn.square:disabled::before {
  background-image: var(--bone-tex), linear-gradient(to top, black, transparent 6px), linear-gradient(to right, black, transparent 6px);
}
.btn.square:disabled::after {
  background-image: var(--bone-tex), linear-gradient(to bottom, white, transparent 6px), linear-gradient(to left, white, transparent 6px);
}
.btn.square.small:disabled::before {
  background-image: var(--bone-tex), linear-gradient(to top, black, transparent 3px), linear-gradient(to right, black, transparent 3px);
}
.btn.square.small:disabled::after {
  background-image: var(--bone-tex), linear-gradient(to bottom, white, transparent 3px), linear-gradient(to left, white, transparent 3px);
}
`);

class MacroButton extends HTMLElement {
  static get observedAttributes() { return ["href", "square", "small", "full", "pressed", "toggled", "disabled"]; }

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
    }
    this.render();
  }

  attributeChangedCallback() {
    if (this.shadowRoot) this.render();
  }

  render() {
    const href = this.getAttribute("href");
    const square = this.hasAttribute("square");
    const small = this.hasAttribute("small");
    const full = this.hasAttribute("full");
    const pressed = this.hasAttribute("pressed");
    const toggled = this.hasAttribute("toggled");
    // Only meaningful for the plain-button case below -- a "disabled" link
    // or permanently-"pressed" (current-page) button isn't a usage this app
    // has, so there's no established look for either combination.
    const disabled = this.hasAttribute("disabled") && !pressed && !href;
    this.classList.toggle("square", square);
    this.classList.toggle("small", small);
    this.classList.toggle("full", full);

    const label = this.textContent.trim();
    const isLong = square && !small && label.length > 10;

    const btn = document.createElement(pressed ? "span" : href ? "a" : "button");
    btn.className = [
      "btn",
      square ? "square" : "",
      small ? "small" : "",
      full ? "full" : "",
      isLong ? "long-label" : "",
      pressed || toggled ? "pressed" : "",
      !pressed && !href ? "as-button" : "",
    ].filter(Boolean).join(" ");
    if (pressed) {
      btn.setAttribute("aria-current", "page");
    } else if (href) {
      btn.setAttribute("href", href);
    } else {
      btn.setAttribute("type", "button");
      if (toggled) btn.setAttribute("aria-pressed", "true");
    }
    if (disabled) btn.disabled = true;
    btn.appendChild(document.createElement("slot"));

    this.shadowRoot.replaceChildren(btn);
  }
}

customElements.define("macro-button", MacroButton);
