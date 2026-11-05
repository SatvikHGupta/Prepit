# Prepit

Free interview practice you can search like a library. Prepit indexes **10,000+ AI-generated interview problems** and lets you slice them by keyword, topic, tag, role, company, difficulty and, most importantly, **how each problem was checked**.

No accounts, no tracking, no database. A static-ish Next.js site that reads a folder of JSON files.

> Every problem is AI-generated and original. None is copied from, or claimed to be asked by, any company. Company and role pages show aggregated numbers from publicly shared interview reports, never the problems themselves.

## What you can do on it

- **Search** every problem instantly in the browser: prefix matching, typo suggestions ("did you mean"), filters for difficulty, type, domain, topic, tag and verification level, three views (list, table, cards), grouping, sorting, and a random-problem button.
- **Start from your role.** Role pages show how interviews for that role usually run, which topics come up, and a practice set built from them.
- **Study a company.** Company pages are Chart.js dashboards: reports over time, how interviews ended, stages and levels, topics and question types, difficulty mix, roles, and a filterable practice set.
- **Browse by topic and domain** on the home page and the topics page.
- **Read honest labels.** Each problem says whether its answer was recomputed by code, passed hidden tests, or is a written answer that no code could check.
- **Save problems** locally (bookmarks live in your browser only).
- **Make it yours.** Light, dark or system mode plus 13 accent colours, all checked for readable contrast.

## Stack

| Piece | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19, plain JavaScript and JSX |
| Data | JSON files read on the server (local folder in development, a private host in production) |
| Charts | Chart.js, loaded only when a chart scrolls into view |
| Content | `marked` for markdown, KaTeX for math, Shiki for code highlighting |
| State | Zustand (bookmarks), URL query strings (search state) |
| Styling | Hand-written CSS with design tokens, no CSS framework |
| Fonts | Newsreader, Plus Jakarta Sans, JetBrains Mono via Fontsource (self-hosted) |

## Quick start

You need **Node 22 or newer** (see [`.nvmrc`](#nvmrc) below).

```bash
git clone https://github.com/SatvikHGupta/Prepit.git
cd Prepit
npm ci
cp .env.example .env.local     # on Windows PowerShell: Copy-Item .env.example .env.local
npm run dev                    # http://localhost:3000
```

In development the site reads the local `data/` folder, so put the exported data there first (see [Data](#data)). With `DATA_BASE_URL` empty it never makes a network request for data.

```bash
npm run build && npm start     # production build, served locally
```

`next build` reads the manifest while it prerenders, so data must be reachable (a local `data/` folder or the private host) before you build.

## Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public address of the site, used for canonical URLs, the sitemap and social cards |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Optional, shown on the About page |
| `DATA_BASE_URL` | Address of the private data host, no trailing slash. Empty means "read the local `data/` folder" |
| `DATA_KEY` | Shared secret the data host checks. **Server-only** |
| `DATA_DIR` | Optional path of a local data folder if it is not `./data` |

`DATA_BASE_URL` and `DATA_KEY` must never be prefixed with `NEXT_PUBLIC_`. That prefix would ship them to every visitor's browser.

## Data

The site is built on a folder produced by a separate monthly pipeline. It is not committed to this repository.

```
data/
  manifest.json            version, update date, counts
  index/all.json           the search index (about 2 MB)
  shard/<xx>.json          full problems, grouped by the first two characters of their id
  public/dims.json         domains, topics, companies, roles, question types
  public/tags.json         tag list
  public/search_entities.json
  public/company|role|topic|tag|combo/<id>.json
```

Problem ids look like `c` or `g` followed by 10 hex characters. Hidden tests are never part of what the site shows.

## How it fits together

```
Browser ──> Next.js server (Vercel) ──(secret key)──> private data host (Cloudflare Pages)
   │
   └──> /api/index  same-origin only, rate limited: the search index for the search page
```

- The browser never talks to the data host. Only the Next.js server does, with a secret key.
- The search page loads `/api/index` once and does all filtering locally. The route refuses requests that do not come from the site's own pages and rate limits each client.
- Pages are rendered on the server with incremental regeneration (`revalidate`). Problem pages are generated on first visit and cached.

## Project structure

```
src/
  app/            routes: home, search, problems, topics, tags, companies, roles, types, domains,
                  bookmarks, appearance, about, privacy, terms, sitemap, robots, api/*
  components/     ui (Dropdown, Segmented, Switch, Icon), layout, home, problem, entity, search, charts, theme
  lib/
    data/         server-side data access, related problems, SQL tables
    search/       filter engine, typo help, URL state (pure functions)
    render/       markdown, math, code highlighting, python repr, line diff
    charts/       Chart.js config builders and theme reader
    security/     request guard and rate limiter for the data routes
  theme/          the theme engine (mode + accent), CSS generator, browser store
  themes/         mode and accent definitions
  styles/         stylesheets
scripts/
  copy-katex.mjs  copies KaTeX fonts and CSS into public/vendor before dev and build
```

## Theming

A theme is two choices: a mode (light, dark or system) and an accent. Colours are defined once in `src/themes/`, validated at build time (an unreadable colour fails the build and prints the contrast ratio), and turned into a hashed, immutable `/theme.css`. A small inline script applies the saved choice before first paint, so nothing flashes. Components use CSS variables only, never hard-coded colours. Change it on the [Appearance](/appearance) page; the choice is saved in this browser only.

## Security and privacy

- The raw data host is private: every request needs a secret key, otherwise it answers 404. CORS is off.
- Strict headers: CSP (`connect-src 'self'`), HSTS, `X-Frame-Options: DENY`, `nosniff`.
- Markdown from the data is rendered without raw HTML, and every data path is validated.
- No cookies, no accounts, no analytics. Bookmarks and appearance live in `localStorage` on your device.
- Honest limit: pages a visitor can read can still be crawled one by one. The guard stops bulk downloads of the raw data and hot-linking, not patient scraping.

## Deploying

The site is built for Vercel (data on a private Cloudflare Pages project). In short:

1. Import this repository in Vercel; the framework is detected as Next.js and Node 22 is used.
2. Add `NEXT_PUBLIC_SITE_URL`, `DATA_BASE_URL` and `DATA_KEY` under Environment Variables.
3. Deploy, add your domain, then set `NEXT_PUBLIC_SITE_URL` to it and redeploy.
4. Submit `https://<your-domain>/sitemap.xml` in Google Search Console.

Redeploy (or wait for the revalidate window) after each monthly data update.

## nvmrc

`.nvmrc` is a one-line file containing `22`. Tools such as `nvm`, `fnm` and Volta read it to choose the Node.js version for the project, and Vercel and most CI systems honour it too. Run `nvm use` (or `fnm use`) in the project folder and you are on the right version without thinking about it. It is not required to run the site, but it prevents "works on my machine" problems.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build |
| `npm start` | Serve the production build |

## Known limits

- Search matches word prefixes in titles, tags and topic names. It does not search problem statements.
- SQL problems run on Node's experimental `node:sqlite`, which prints a warning. If it is unavailable, those pages show the data as code instead.
- Company and role numbers are counts of public reports, not probabilities, and small counts are shown as `<5` on purpose.

## License and credits

Add your license here. Problems are AI-generated for practice; interview report statistics come from publicly shared experiences and are aggregated, not reproduced.