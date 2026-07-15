// <zone-map>, with `.setData({ src, label })` set as one atomic call. A
// self-hosted zone map image (public/maps/ — see migration 061 and its own
// header comment for why self-hosted rather than hotlinked to eqlwiki.com),
// framed in the same stone/parchment plate language the rest of the app's
// cards use. `src` is the full path to render (e.g.
// "maps/oasis-of-marr.jpg"), already resolved by the caller — this
// component doesn't know about public/maps/ as a convention, just renders
// whatever URL it's given.
//
// Image only -- the map's numbered/lettered key used to render here too,
// but it moved out to zone-dossier.js's own `.map-legend` column, which
// sits beside Bestiary/Quests Here rather than crammed under a narrow
// image: legend entries are short phrases, closer in shape to a third list
// column than to map decoration, and giving them zone-dossier's wider
// layout room reads a lot better than stacking them under this component's
// deliberately narrow rail width. zone-dossier.js still gates the legend
// column on this component actually having a map to show.
//
// Collapses itself via the native `hidden` attribute (same convention as
// status-panel.js's own `:host([hidden])`) when `src` is unset — most zones
// don't have a sourced map yet, and the caller doesn't need its own
// conditional to skip rendering a placeholder for those.
import { RESET_CSS } from "./reset.js";

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
${RESET_CSS}
:host { display: block; }
:host([hidden]) { display: none !important; }

.plate {
  display: flex; justify-content: center;
  border-radius: 2px;
  overflow: hidden;
  border: 1px solid var(--parch-line);
  box-shadow: inset 0 0 26px rgba(0, 0, 0, 0.32), 0 2px 6px rgba(0, 0, 0, 0.4);
  background: var(--parch-tex), linear-gradient(180deg, #ece3c8, var(--parch-bg));
}
img { display: block; max-width: 100%; max-height: 560px; object-fit: contain; }
`);

class ZoneMap extends HTMLElement {
  #src = null;
  #label = "";

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
      this.shadowRoot.innerHTML = `<div class="plate"><img></div>`;
    }
    this.render();
  }

  setData({ src, label }) {
    this.#src = src || null;
    this.#label = label || "";
    if (this.shadowRoot) this.render();
  }

  render() {
    this.hidden = !this.#src;
    if (!this.#src) return;

    const img = this.shadowRoot.querySelector("img");
    img.src = this.#src;
    img.alt = `Map of ${this.#label}`;
  }
}

customElements.define("zone-map", ZoneMap);
