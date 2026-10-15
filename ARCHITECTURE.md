# Launch & Defend — Architecture

A branching narrative cybersecurity quiz app built as a single-page static site, designed for a university open-house event. Players take the role of a developer responding to a security incident, making decisions that affect a simulated user base.

---

## File Map

```
QuizProject/
├── index.html                 Shell HTML — one <div id="app"> and one <script>
├── css/
│   └── style.css              All styles. Dark theme, CSS variables, Thai font (Noto Sans Thai)
├── js/
│   ├── script.js              Everything: game engine + UI renderer
│   ├── index.json             Path index (plain JSON, titles only — no answers)
│   └── paths/
│       ├── a.json             Path A source data  ┐
│       ├── b.json             Path B source data  │  edited by developer
│       ├── c.json             Path C source data  │
│       ├── d.json             Path D source data  ┘
│       ├── a.b64              Path A encoded       ┐
│       ├── b.b64              Path B encoded       │  generated, never edited
│       ├── c.b64              Path C encoded       │
│       └── d.b64              Path D encoded       ┘
├── encode.js                  One-shot encoder: reads *.json → writes *.b64
├── watch.js                   Dev watcher: auto-encodes on file save
├── .gitignore                 Excludes *.b64 (generated) and .claude/
├── .github/workflows/
│   └── deploy.yml             CI pipeline: encode → strip source → deploy to Pages
└── beginner-sources.md        Reference sheet mapping game questions to public sources
```

---

## How the App Runs (startup to finish)

```
Browser loads index.html
  └─ loads js/script.js
       └─ fetch('js/index.json')          ← plain JSON, just titles
            └─ PATHS = d.paths            ← array of {id, title}
                 └─ renderPathSelect()    ← screen 1: pick a storyline
                      └─ user clicks path
                           └─ loadPath(id)
                                └─ fetch('js/paths/${id}.b64')
                                     └─ decode base64 → JSON
                                          └─ NODES, ENDINGS, AXES loaded
                                               └─ toStart()  ← screen 2: intro
                                                    └─ begin()  ← screen 3: play loop
                                                         └─ finish()  ← screen 4: result
```

---

## Screens

| Screen | Trigger | Render function |
|---|---|---|
| `select` | app start / "กลับหน้าแรก" | `renderPathSelect()` |
| `start` | path loaded | `renderStart()` |
| `play` | begin() called | `renderPlay()` → `renderChoose()` or `renderConsequence()` |
| `result` | finish() called | `renderResult()` |

`UI.screen` holds the current screen. `render()` dispatches to the right function.

---

## Game Engine (script.js top half)

The engine is pure logic with no DOM access. It runs on a **state object `S`** and a loaded **node graph `NODES`**.

### State object `S`

Created fresh by `newState()` at the start of each run:

```js
{
  users: 1000,       // current simulated user count
  trust: 50,         // 0–100, affects score
  damage: 0,         // 0–100, affects score and ending
  rulesFixed: false, // flags set by specific choices
  serverMoney: false,
  mfa: false,
  disclosed: 'none',
  covered: false,
  rewrote: false,
  wrongDx: false,
  adminWeak: false,
  axes: { sec:0, speed:0, open:0, long:0 },  // style axes
  history: [],        // log of every decision made
  series: [1000],     // user count at each decision (for the graph)
  nodeId: null,
  enterFx: null,
  enterTotal: 0,
  dead: false,
  forcedEnding: null,
  lastNext: null
}
```

### Engine functions

| Function | What it does |
|---|---|
| `enterNode(S, id)` | Moves to a node, applies its `enter` effect, marks `S.dead` if users < DEAD |
| `pick(S, cid)` | Applies a choice's effects to S, logs to `S.history`, returns the record |
| `nextOf(S)` | Returns the next node id, or `'END'` (forces `collapse` ending if dead) |
| `endingOf(S)` | Reads flags on S, returns the ending id (e.g. `'root'`, `'cover'`, `'scarred'`) |
| `scoreOf(S, endId)` | Calculates 0–100 score from users, flags, trust, damage |
| `applyFx(S, fx)` | Applies an effect object `{u, trust, damage, set, axes}` to S |

### Special node overrides

Two nodes have behaviour that depends on state and can't live in static JSON. They're defined directly in `script.js`:

- **`NODE_ENTER`** — the `repeat` node's entry effect changes based on whether `S.rulesFixed` is true
- **`NODE_TEXT`** — the `repeat` node's display text changes based on `S.rulesFixed` and `S.wrongDx`

`enterNode` and `renderChoose` check these objects first before falling back to the JSON data.

---

## Data Format (path JSON files)

Each `js/paths/*.json` has this top-level shape:

```json
{
  "title": "...",
  "START_USERS": 1000,
  "DEAD": 200,
  "MAXU": 1200,
  "NODES": { ... },
  "ENDINGS": { ... },
  "AXES": [ ... ]
}
```

### Node shape

```json
"nodeId": {
  "title": "...",
  "tag": "...",
  "text": "...",
  "best": "choiceId",
  "bestWhy": "...",
  "enter": { "u": [[-100, "reason"]], "trust": -5, "damage": 10 },
  "choices": [ ... ]
}
```

`enter` is optional — only nodes that fire an automatic effect on arrival have it.

### Choice shape

```json
{
  "id": "a",
  "label": "...",
  "q": "good",          // "good" | "mid" | "bad"  — shown as colour-coded badge
  "out": "...",         // consequence text shown after picking
  "u": [[-60, "..."]],  // user delta + reason chips
  "trust": 5,           // optional trust delta
  "damage": 0,          // optional damage delta
  "set": { "rulesFixed": true },  // optional flags to set on S
  "axes": { "sec": 1, "speed": -1 },
  "lesson": "...",      // cybersecurity takeaway shown in the consequence screen
  "next": "nodeId"      // or "END" or "END:endingId"
}
```

### Ending shape

```json
"endingId": {
  "title": "...",
  "desc": "...",
  "tone": "good"   // "good" | "mid" | "bad" — controls colour scheme
}
```

### Axes shape

```json
[
  { "k": "sec",   "L": "ความปลอดภัย", "R": "ธุรกิจ", "letL": "S", "letR": "B",
    "dL": "...", "dM": "...", "dR": "..." }
]
```

`k` matches a key in `S.axes`. The axis bar on the result screen shows where the player landed between the two poles.

---

## Encoding Pipeline (the base64 "easter egg")

Path JSON files contain the questions, answers, and lesson text. To prevent the full answer tree from sitting as plain-readable text in the browser's Network tab:

1. **Source files** (`js/paths/*.json`) — human-readable, used during development, excluded from git by `.gitignore`
2. **Encoded files** (`js/paths/*.b64`) — base64 strings, served to the browser, also excluded from git
3. **GitHub Actions** encodes on the fly during deploy, then **deletes the source JSON** before uploading

The browser decodes like this:

```js
JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(text), c => c.charCodeAt(0))))
```

The `Uint8Array` step is necessary because `atob()` returns Latin-1 bytes, which would corrupt multi-byte Thai characters. `TextDecoder` interprets the bytes as UTF-8 correctly.

This is intentionally reversible — it's a friction layer and an easter egg, not encryption.

---

## Development Workflow

### First time / after editing a JSON file

```bash
node encode.js          # regenerates all .b64 files
npx http-server . -c-1  # serves locally, -c-1 disables cache
```

### While actively editing JSON files

```bash
node watch.js           # auto-encodes on save, leave running
npx http-server . -c-1  # in a second terminal
```

`watch.js` uses Node's built-in `fs.watch()` — no npm install needed.

### Deploying

Push to `main`. GitHub Actions will:
1. Run `node encode.js`
2. Delete `js/paths/*.json`
3. Deploy the remaining files to GitHub Pages

---

## Adding a New Path

1. Create `js/paths/e.json` following the existing path structure
2. Add an entry to `js/index.json`:
   ```json
   { "id": "e", "title": "ชื่อเรื่อง" }
   ```
3. If any nodes need state-dependent text or entry effects, add them to `NODE_TEXT` / `NODE_ENTER` in `script.js`
4. Run `node encode.js` (or let `watch.js` do it)
5. Test locally, then push — CI handles deployment

---

## Kiosk Mode

Append `?kiosk=1` to the URL. After 50 seconds of inactivity a 10-second countdown appears. At 60 seconds the app resets to the start screen. Designed for unattended booth demos.

---

## CSS Notes

- CSS custom properties (`--bg`, `--purple`, etc.) control the full colour scheme
- Supports both dark mode (default) and light mode via `prefers-color-scheme` + `[data-theme]` override
- Thai body font: Noto Sans Thai (Google Fonts). Title font: Orbitron (Google Fonts)
- Fully responsive — single-column layout, no breakpoints needed
