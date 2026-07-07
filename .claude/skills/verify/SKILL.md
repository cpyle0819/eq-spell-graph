---
name: verify
description: How to drive eq-spell-graph's actual UI in a browser for verification on this machine (Windows). Read before attempting Playwright here.
---

# Verifying eq-spell-graph in a browser

## Dev server

```bash
bun run dev   # http://localhost:4321, --hot reload, run in background
```

## Playwright: must run under `node`, not `bun run`

**`bun run script.mjs` hangs forever on any Playwright browser launch/connect
on this machine** — confirmed twice: `chromium.launch()` times out at the
pipe-transport handshake (chrome.exe starts, `pid=` logged, but the
`--remote-debugging-pipe` connection never completes), and even manually
launching Chrome with `--remote-debugging-port` and using
`chromium.connectOverCDP()` still hangs — at the WebSocket step this time,
even though a raw `new WebSocket(...)` to the exact same debugger URL from
the same bun process connects instantly. That isolates it to Playwright's
own internal driver subprocess (which `playwright-core` spawns to mediate
everything, even in "connect" mode) not completing its handshake when
*its parent* was started via `bun run` — not a sandbox/network permission
issue (raw WS and plain `curl` to the same port both work fine), not a
`--no-sandbox`/`dangerouslyDisableSandbox` issue (tried, no difference).

**Fix: invoke the exact same script with plain `node`, not `bun run`.**
Confirmed working end-to-end (launch, page, goto, screenshot, click,
console-error capture) once switched.

```bash
# Script needs to physically live under the repo (ESM resolves
# node_modules by walking up from the script's own path, not cwd) —
# a script in a scratchpad/temp dir won't find `playwright`.
cp /path/to/verify-script.mjs "$(pwd)/.verify-tmp.mjs"
timeout 90 node .verify-tmp.mjs   # NOT `bun run` — see above
rm .verify-tmp.mjs                # clean up before finishing
```

Always wrap in `timeout N` — a `bun run`-parented hang is otherwise
silent (no error, no output, just sits there) and easy to mistake for "still
loading."

If a Bash call needs to launch a browser process at all (even the initial
diagnosis before you know it needs `node`), pass
`dangerouslyDisableSandbox: true` — otherwise the classifier may block the
launch outright. This did **not** end up being the fix for the hang itself,
just needed once independently.

## Gotcha: don't `taskkill /IM chrome.exe`

Kills every Chrome process on the machine by name, not just a
Playwright-launched instance — including the user's own open browser
windows/tabs. If a stray debugging-port Chrome needs cleanup, kill it by
PID (`taskkill /F /PID <pid>`), not by image name.

## What's been verified this way

- Spell Finder (`index.html`): tag inputs (Spell Class/Spell Line/Specific
  Spells/Specific Zones), result narrowing, tooltip content, localStorage
  persistence across reload.
- Class Browser (`class-browser.html`): tag input for classes, tab
  switching, spell card badges.
- Nav button (`MacroButton`) rendering/font-size across all three pages.
