// Stage-1 UX prototype fixture for Maps (GitHub issue #28). Zone level range
// has no real source yet -- there's no level-range field on zone nodes, and
// none should be invented at the graph layer (src/graph.ts's
// getZoneVendorInfo has the same note for its own, differently-scoped
// levelRange). This file exists so Maps' zone dossier has something in that
// one slot; it is not graph data and nothing here is written to
// data/graph.json. Delete it once a real zone level range is sourced and
// wired through src/graph.ts instead.
//
// Mob data (the dossier's other placeholder, formerly also mocked here) is
// real now -- see decisions/mob-node-type.md and getMobs() in src/graph.ts.

function hashLabel(label) {
  let h = 0;
  for (let i = 0; i < label.length; i++) h = (Math.imul(h, 31) + label.charCodeAt(i)) >>> 0;
  return h;
}

// Deterministic per zone label (a hash, not Math.random) so the same zone
// always renders the same placeholder across visits and re-renders, rather
// than reshuffling every time.
export function mockLevelRange(zoneLabel) {
  const h = hashLabel(zoneLabel);
  const min = 1 + (h % 45);
  const max = Math.min(50, min + 3 + ((h >>> 8) % 12));
  return { min, max };
}
