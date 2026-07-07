// Shared "macro button" component — a MacroSocket (recessed cavity) wrapping
// a MacroButton (raised button or link inside it). Every non-text button
// across all three pages renders through this (nav links, Show all/Show
// remaining/Clear owned); .text-action links are a separate, plain-text
// idiom and don't use this. See theme.css for the .macro-socket/.macro-btn
// rules and DECISIONS.md for the bevel rationale.
//
// Size is dynamic (fits the label) by default. Pass square: true for a
// fixed 90x90 slot instead (e.g. side-by-side action buttons that need to
// match each other's size regardless of label length).
function MacroButton({ label, tag = "button", href, id, className = "", square = false, longLabel } = {}) {
  const isLong = longLabel ?? label.length > 10;
  const btnClasses = ["macro-btn", square ? "square" : "", isLong ? "long-label" : "", className]
    .filter(Boolean)
    .join(" ");
  const socketClasses = ["macro-socket", square ? "square" : ""].filter(Boolean).join(" ");
  const idAttr = id ? ` id="${id}"` : "";
  const hrefAttr = tag === "a" ? ` href="${href}"` : "";
  const typeAttr = tag === "button" ? ` type="button"` : "";
  return `<div class="${socketClasses}"><${tag} class="${btnClasses}"${idAttr}${hrefAttr}${typeAttr}>${label}</${tag}></div>`;
}
