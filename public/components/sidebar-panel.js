// <sidebar-panel>
//   <collapsible-section label="Faction" section="faction">...</collapsible-section>
//   <div class="control-sep" aria-hidden="true"></div>
//   ...
//   <button slot="actions" class="text-action">Reset filters</button>
// </sidebar-panel>
// The sticky, fixed-width filter/control column shared by the Spell
// Finder's, Class Browser's, Tradeskills', and Maps' left panels (Maps'
// route-chain/panel-buttons content is its own plain markup rather than
// collapsible-section/field-row, but still slots into this same shell).
// `.control-sep` dividers between sections are plain light-DOM markup
// (theme.css), not componentized -- a single ornamental rule with nothing
// to own.
import { RESET_CSS } from "./reset.js";

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
${RESET_CSS}
:host {
  display: block;
  flex-shrink: 0;
  overflow: hidden;
  background: var(--marble-tex), linear-gradient(180deg, var(--stone-1), var(--stone-2));
  border: 4px solid;
  border-color: var(--edge-hi) var(--edge-hi) var(--edge-lo) var(--edge-lo);
  border-radius: 3px;
  box-shadow: inset -1px 1px 0 rgba(255, 255, 255, 0.08), inset 1px -1px 0 rgba(0, 0, 0, 0.45), 0 2px 8px rgba(0, 0, 0, 0.4);
  outline: 1px solid rgba(232, 168, 42, 0.22);
  outline-offset: -5px;
}
.planner-controls { display: flex; flex-direction: column; gap: 8px; padding: 16px 20px; }
.panel-actions { display: flex; justify-content: flex-end; }
@media (min-width: 1100px) {
  :host { width: 300px; min-width: 300px; position: sticky; top: 0; }
}
@media (max-width: 700px) {
  .planner-controls { gap: 12px; padding: 14px 16px; }
}
`);

class SidebarPanel extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
      this.shadowRoot.innerHTML = `
        <div class="planner-controls">
          <slot></slot>
          <div class="panel-actions"><slot name="actions"></slot></div>
        </div>
      `;
    }
  }
}

customElements.define("sidebar-panel", SidebarPanel);
