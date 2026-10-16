# Launch & Defend

A branching narrative cybersecurity quiz built for a university open-house event. Players respond to a simulated security incident as a developer, making decisions that affect a live user count. Each choice has consequences — there's no free lunch.

Built as a zero-dependency static site (HTML + CSS + vanilla JS), deployed via GitHub Pages.

## Features

- Multiple storylines (paths), each with its own scenario and node graph
- Branching choices with scored outcomes and cybersecurity lessons after each decision
- Score + style breakdown at the end (axes: Security/Business, Fast/Careful, etc.)
- Endings tracker across sessions (localStorage)
- Kiosk mode for unattended booth demos (`?kiosk=1`)
- Path data encoded as base64 at deploy time — intentional easter egg for a cybersecurity audience

## Running Locally

No install required.

```bash
node encode.js              # generate .b64 files from source JSON
npx http-server . -c-1      # serve at http://localhost:8080
```

To auto-encode while editing path files:

```bash
node watch.js               # leave running in one terminal
npx http-server . -c-1      # serve in a second terminal
```

## Project Structure

```
index.html          shell page
css/style.css       all styles
js/script.js        game engine + UI
js/index.json       path list (titles only)
js/paths/*.json     per-path story data  (source, not committed as .b64)
encode.js           one-shot encoder
watch.js            dev auto-encoder
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for a full breakdown of how the engine works, the data format, and how to add a new path.

## Deployment

Push to `main`. GitHub Actions encodes the path data, removes the source JSON, and deploys to GitHub Pages automatically.

## Adding a New Path

1. Create `js/paths/e.json` following the structure of an existing path
2. Add an entry to `js/index.json`
3. Run `node encode.js`
4. Push — CI handles the rest

See ARCHITECTURE.md for the full node/choice/ending data format.
