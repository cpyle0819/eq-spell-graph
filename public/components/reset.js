// theme.css's "* { margin: 0; padding: 0; box-sizing: border-box; }" reset
// (a universal selector) can't reach inside Shadow DOM. Prepend this to
// every component's own CSS text before replaceSync(), or default
// user-agent margins (e.g. <h1>, <p>) show up inside the shadow root.
//
// That same outer "*" rule also matches the custom element itself (a real
// light-DOM element) at normal cascade priority, and beats a same-target
// ":host" declaration of equal-or-higher specificity from the component's
// own shadow tree regardless of specificity -- outer-document rules always
// win this particular fight unless the shadow rule uses !important. So any
// ":host" rule setting margin/padding/box-sizing (the properties this
// reset touches) needs !important on those declarations specifically, or
// they're silently overridden. Properties the reset doesn't touch
// (display, gap, background, border, width/height, ...) are unaffected.
export const RESET_CSS = `* { margin: 0; padding: 0; box-sizing: border-box; }`;
