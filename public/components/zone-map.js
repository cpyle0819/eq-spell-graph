// <zone-map>, with `.setData({ src, label })` set as one atomic call. A
// self-hosted zone map image (public/maps/ — see migration 061 and its own
// header comment for why self-hosted rather than hotlinked to eqlwiki.com),
// framed in the same stone/parchment plate language the rest of the app's
// cards use. `src` is the full path to render (e.g.
// "maps/oasis-of-marr.jpg"), already resolved by the caller — this
// component doesn't know about public/maps/ as a convention, just renders
// whatever URL it's given. When the caller has more than one floor to
// offer (decisions/zone-multi-floor-maps.md), it's zone-dossier.js's own
// floor tabs that swap `src` between calls -- this component only ever
// renders one image at a time and has no notion of "floors" itself.
//
// Image only -- the map's numbered/lettered key renders in zone-dossier.js's
// own `.map-legend` column instead, a sibling of this component inside its
// `.map-row`, not markup nested in here: legend entries are short phrases,
// closer in shape to a list than to map decoration, and zone-dossier.js
// swaps both together when floor tabs change. zone-dossier.js gates the
// legend column on this component actually having a map to show.
//
// No max-height cap on the image -- every map just renders at its own
// natural size, however tall that makes it; a 3-floor dungeon's portrait
// map and a wide outdoor zone's landscape map both look right without
// either being cropped or squeezed to match the other. Tried stretching a
// narrower source image to fill available width (`width: 100%`) instead --
// upscaled past its native resolution, every map just looked soft/blurry,
// so natural size stayed.
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
img { display: block; max-width: 100%; height: auto; }
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
