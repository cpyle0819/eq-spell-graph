// <app-footer></app-footer> — the fan-made-tool disclaimer, byte-identical
// on every page.
import { RESET_CSS } from "./reset.js";

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
${RESET_CSS}
:host {
  display: block;
  padding: 10px 28px !important;
  border-top: 1px solid #26232e;
  flex-shrink: 0;
  font-size: 11px;
  color: var(--ink-muted);
  text-align: center;
  letter-spacing: 0.04em;
}
a { color: var(--gold-dim); text-decoration: none; }
a:hover { text-decoration: underline; color: var(--gold-bright); }
`);

class AppFooter extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
      this.shadowRoot.innerHTML = `Unofficial fan-made tool. EverQuest® and EverQuest Legends™ are trademarks of Daybreak Game Company LLC. Not affiliated with or endorsed by Daybreak. · <a href="https://github.com/cpyle0819/eq-spell-graph" target="_blank" rel="noopener">Contribute on GitHub</a>`;
    }
  }
}

customElements.define("app-footer", AppFooter);
