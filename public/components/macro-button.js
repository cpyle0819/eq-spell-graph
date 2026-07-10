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
// nowhere else for a long label to go.
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
}
:host(.square) {
  flex-grow: 0; flex-shrink: 0; flex-basis: auto;
  width: 90px; height: 90px;
  border-width: 5px;
}
.btn {
  position: relative; isolation: isolate; overflow: hidden;
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
   Shadow DOM means that outer rule can no longer reach in. */
@media (max-width: 700px) {
  .btn.as-button { min-height: 44px; }
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
`);

class MacroButton extends HTMLElement {
  static get observedAttributes() { return ["href", "square"]; }

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
    this.classList.toggle("square", square);

    const label = this.textContent.trim();
    const isLong = square && label.length > 10;

    const btn = document.createElement(href ? "a" : "button");
    btn.className = ["btn", square ? "square" : "", isLong ? "long-label" : "", href ? "" : "as-button"].filter(Boolean).join(" ");
    if (href) btn.setAttribute("href", href);
    else btn.setAttribute("type", "button");
    btn.appendChild(document.createElement("slot"));

    this.shadowRoot.replaceChildren(btn);
  }
}

customElements.define("macro-button", MacroButton);
