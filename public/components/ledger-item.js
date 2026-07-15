// <ledger-item>
//   <span slot="label"><a href="...">Soft Wicker armor</a></span>
//   <span slot="detail">The Warrens' own gear set, ...</span>
// </ledger-item>
// One row in a browsable list of distinct, unordered entries (loot, side
// activities) -- the Leveling Guide's "Notable Finds"/"Beyond the Kill
// Count" ledgers. Two named slots rather than one: `label` renders bold as
// the entry's own heading (often itself a link out to eqlwiki.com or a
// maps.html deep link), `detail` renders as the muted description
// trailing it, separated by a shadow-rendered dash so callers don't have
// to hand-author that punctuation themselves. Hairline divider between
// instances (`:host + :host`, not a per-instance border) so a run of
// ledger-items reads as one continuous list, not stacked boxes.
//
// `<ledger-item stacked>` puts detail on its own line below the label
// instead of flowing inline after it -- opt-in, since the Leveling Guide's
// own ledgers sit in a wide column where inline flow reads fine; Maps' zone
// dossier uses it for its narrower Quests Here column, where a long detail
// immediately after "Label — " had very little room left to wrap into.
import { RESET_CSS } from "./reset.js";

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
${RESET_CSS}
:host {
  display: block;
  padding: 10px 0 !important;
  font-size: 13px; line-height: 1.65;
}
:host(:not(:first-of-type)) { border-top: 1px solid var(--parch-line); }
::slotted([slot="label"]) { color: var(--parch-ink); font-weight: 700; }
::slotted([slot="detail"]) { color: var(--parch-ink-soft); }
.sep { color: var(--parch-ink-soft); }
:host([stacked]) .sep { display: none; }
:host([stacked]) ::slotted([slot="detail"]) { display: block; margin-top: 3px; }
`);

class LedgerItem extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
      this.shadowRoot.innerHTML = `
        <slot name="label"></slot><span class="sep"> — </span><slot name="detail"></slot>
      `;
    }
  }
}

customElements.define("ledger-item", LedgerItem);
