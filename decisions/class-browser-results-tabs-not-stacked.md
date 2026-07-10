# Class Browser results: tabs, not a stacked scroll

Originally all categories rendered as stacked sections in one scrolling column, which meant paging through everything above to reach e.g. Special AAs. Replaced with a tab bar showing only the categories present for the current class selection, each labeled with its count; switching category swaps the results pane without refetching, persists across class-filter changes, and falls back to the first available category if the active one has no items for the new selection.

**Superseded** by a `<select id="category-select">` in the sidebar, right after Classes (see "Sidebar filter panel" below) — the underlying state/fallback logic (`activeTab` in `class-browser.js`) is unchanged, only the picker UI is. `.tab-bar`/`.tab-button` (theme.css) and `#browser-tabs` are removed entirely, not just hidden — they had no other caller.

