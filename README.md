# Launch & Defend

A branching narrative cybersecurity quiz built for a university open-house event. Players respond to a simulated security incident as a developer, making decisions that affect a live user count. Each choice has consequences — there's no free lunch.

Built on **Cloudflare Workers + Assets**, with Google OAuth, a D1 database for score storage, and a bilingual Thai/English interface.

## Features

- Multiple storylines (paths), each a distinct cybersecurity scenario
- Branching choices with scored outcomes and a cybersecurity lesson after each decision
- Score + decision-style breakdown at the end (axes: Security/Business, Fast/Careful, etc.)
- Multiple endings per path, tracked across sessions (localStorage)
- Google OAuth login — scores and player profiles saved to Cloudflare D1
- Player profile questionnaire (school, age, referral source) on first sign-in
- Bilingual UI — Thai and English, switchable at any time
- Terminal/CRT aesthetic with animated boot screen and background CLI text
- Kiosk mode for unattended booth demos (`?kiosk=1`)
- Path data encoded as base64 at deploy time — intentional easter egg for a cybersecurity audience

## Running Locally

```bash
npm install
node encode.js          # generate .b64 files from source JSON
npx wrangler dev        # serve at http://localhost:8787
```

To auto-encode while editing path files, run in a separate terminal:

```bash
node watch.js
```

## Project Structure

```
index.html                  shell page
css/style.css               all styles (dark terminal theme)
js/
  script.js                 game engine + UI renderer + i18n
  index.json                path list — {id, title: {th, en}}
  i18n.json                 all UI strings in Thai and English
  paths/
    th/  *.json             Thai path source data    (source, committed)
    th/  *.b64              Thai path encoded data   (generated, gitignored)
    en/  *.json             English path source data (source, committed)
    en/  *.b64              English path encoded     (generated, gitignored)
worker.js                   Cloudflare Worker — Hono routes (OAuth, scores, profile)
schema.sql                  D1 database schema
wrangler.toml               Cloudflare configuration
encode.js                   one-shot encoder: *.json → *.b64
watch.js                    dev auto-encoder
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for a full breakdown of the engine, data format, auth flow, and how to add a new path.

## Deployment

Push to `main`. Cloudflare automatically builds and deploys:

1. Runs `npm run build` (which runs `node encode.js`)
2. Uploads all assets (path source JSON is excluded via `.assetsignore`)
3. Deploys the Worker alongside the assets

The D1 database and OAuth credentials are configured in the Cloudflare dashboard.

## Database

Schema is in `schema.sql`. The `users` table stores profile data; `scores` stores each completed run.

To run migrations on the production D1:

```bash
npx wrangler d1 execute openhouse_quizz --remote --file=schema.sql
```

## Adding a New Path

1. Create `js/paths/th/e.json` and `js/paths/en/e.json` following the structure of an existing path
2. Add an entry to `js/index.json`:
   ```json
   { "id": "e", "title": { "th": "ชื่อเรื่อง", "en": "Scenario title" } }
   ```
3. Run `node encode.js`
4. Push — Cloudflare handles the rest

See ARCHITECTURE.md for the full node/choice/ending data format.
