# Muted text must clear WCAG AA (4.5:1)

The pre-reskin palette's muted browns (#8a6838, #6a5438) sat at 2.6–3.6:1 against the dark background and failed WCAG AA. All muted text now uses `--ink-muted` (≥4.5:1 against the lightest stone surface it appears on — recheck if lightening `--stone-1`) — don't reintroduce darker browns for text. Dimmed zone cards (`wont_sell` 0.6, `kos` 0.35 opacity) are deliberate de-emphasis of inactive content, not a contrast bug; they were raised from 0.5/0.22 to stay identifiable.

