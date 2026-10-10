# ui-browser-check

Opens a Jarvis SPA from any checkout or git worktree in real Google Chrome (through Playwright)
and runs one check script against it. No bench and no site are needed: the check script answers
the Frappe API calls itself.

Standing rule (owner, 2026-10-10): every time UI is built, changed or reviewed, it is opened in
Chrome with Playwright and verified there. Reading the code and passing component tests is not
enough.

## Run

```sh
# once per tree
cd <tree>/frontend && npm ci
cd <tree>/wiki-graph-core && npm ci

sh tools/ui-browser-check/run.sh <tree>/frontend <check-script.mjs> [port]
SHOTS=/some/folder sh tools/ui-browser-check/run.sh <tree>/frontend <check-script.mjs>
```

It prints the script's `PASS` / `FAIL` / `RESULT` / `SHOT` / `PROBE` lines. Start a new check from
`example.mjs`.

## What a check must cover

1. Widths 1440, 1100, 375 and 320: no sideways scroll, measured on the document **and** inside
   every scroll area.
2. Realistic long content, many rows, the empty state and the error state.
3. The keyboard, with real key presses: Tab order, Enter, Escape, where focus lands when
   something opens and where it returns when it closes.
4. Accessible names of icon-only controls; no page errors.
5. Screenshots, taken and actually read.

## Things that went wrong before (why the runner is shaped this way)

- **Wrong server.** Another session was serving a different tree on the default port 8080, and a
  check passed against that. The runner uses its own port (8117) with `--strictPort` and stops if
  the port is taken. Look at one screenshot to confirm it is the tree you meant.
- **Wrong branch.** Evidence taken from a file copied onto another branch was rejected in review.
  Run against the branch that will merge.
- **The Playwright test runner hangs in a git worktree.** Use the library (`import { chromium }
  from "playwright"`) with `chromium.launch({ channel: "chrome" })`.
- **A worktree is not inside a bench**, so `src/socket.js` cannot import
  `sites/common_site_config.json`. `vite.wrapper.config.mjs` points that import at a stand-in.
- **Inner overflow is invisible in the page width.** A filter row was 525 px wide inside a 375 px
  phone screen while `document.scrollWidth` still said 375.
- **Unit tests cannot see transitions.** test-utils stubs `<transition>`; a focus bug that only
  happened while a dialog was animating out showed up only in Chrome.
- **frappe-ui `Dropdown` does not take keyboard focus in this app**, and its `Button` overwrites
  an `aria-label` attribute with its `label` prop. Both were found only by pressing real keys.
