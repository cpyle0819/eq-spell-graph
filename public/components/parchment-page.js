// <parchment-page> — a full-length hung parchment sheet, wood dowels top
// and bottom (rotated 90° from welcome-scroll's side dowels: this is a
// long vertical read, not a short horizontal banner). The shell for any
// page whose content is read, not operated — stone still frames the page
// (header/footer/backdrop), but the content itself is one continuous
// parchment surface, the same "readable ink" material this app already
// reserves for smaller inserts (tooltips, route results), just given the
// whole stage here instead of a corner of it.
//
// Slotted content: `.eyebrow`/`.title`/`.rule`/`.dek`/`.intro`/`.sources`
// classes on light-DOM children get this component's own typography (the
// same division of labor welcome-scroll uses for its slotted <p>s) — the
// page authoring a leveling guide or similar shouldn't need to redeclare
// this typography itself. Structural sub-sections (field-notes boxes,
// trail-stop/ledger-item lists) are separate concerns and just inherit
// spacing from the default slot; they bring their own look.
import { RESET_CSS } from "./reset.js";

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
${RESET_CSS}
:host {
  display: block;
  position: relative;
  max-width: 700px; width: 100%;
  padding: 44px clamp(24px, 6vw, 64px) 40px !important;
  background: var(--parch-tex), linear-gradient(180deg, #ece3c8, var(--parch-bg));
  border: 1px solid var(--parch-line);
  border-radius: 2px;
  box-shadow: inset 0 0 26px rgba(122, 96, 42, 0.28), 0 10px 34px rgba(0, 0, 0, 0.5);
  color: var(--parch-ink);
}
:host::before, :host::after {
  content: "";
  position: absolute; left: -3px; right: -3px; height: 11px;
  border-radius: 5px;
  background:
    radial-gradient(3px 3px at 9px 50%, rgba(0, 0, 0, 0.6), transparent 70%),
    radial-gradient(3px 3px at calc(100% - 9px) 50%, rgba(0, 0, 0, 0.6), transparent 70%),
    linear-gradient(180deg, var(--wood-2), var(--wood-1) 40%, var(--wood-1) 60%, var(--wood-2));
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.55);
}
:host::before { top: -11px; }
:host::after { bottom: -11px; }

/* Only margin/padding (properties theme.css's outer "* { margin: 0 }"
   reset touches) need !important here -- see reset.js. Everything else
   (font, color, border...) applies at normal priority just fine. */
::slotted(.eyebrow) {
  display: block; font-family: var(--font-display); font-size: 11px; font-weight: 600;
  letter-spacing: 0.28em; text-transform: uppercase; color: var(--parch-accent);
}
::slotted(.title) {
  display: block;
  font-family: var(--font-display); font-size: clamp(26px, 4vw, 34px); font-weight: 700;
  color: var(--parch-ink); letter-spacing: 0.02em; margin-top: 4px !important;
}
::slotted(.rule) {
  display: block;
  width: 100%; height: 1px; margin: 16px 0 !important; position: relative;
  background: linear-gradient(90deg,
    transparent, var(--parch-accent) 12%, var(--parch-accent) 45%, transparent 47%,
    transparent 53%, var(--parch-accent) 55%, var(--parch-accent) 88%, transparent);
  opacity: 0.55;
}
::slotted(.dek) { display: block; font-size: 13px; font-style: italic; color: var(--parch-ink-soft); line-height: 1.6; }
::slotted(.intro) { display: block; font-size: 14.5px; line-height: 1.75; margin-top: 22px !important; }
::slotted(.sources) {
  display: block;
  margin-top: 36px !important; padding-top: 14px !important; border-top: 1px solid var(--parch-line);
  font-size: 11px; font-style: italic; color: var(--parch-ink-soft); line-height: 1.7;
}
::slotted(.sources) a { color: var(--parch-accent); }
`);

class ParchmentPage extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
      this.shadowRoot.innerHTML = `<slot></slot>`;
    }
  }
}

customElements.define("parchment-page", ParchmentPage);
