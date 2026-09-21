# github-mc-widget

Dynamically generated SVG download-count badges for Minecraft projects on
Modrinth and CurseForge — gitascii-style, meant to be dropped into a GitHub
profile README. Each badge carries the platform's official logo and links
straight to that project's page when clicked.

Two separate badges, two separate links — the way GitHub-flavored Markdown
actually supports clickable images (a single `<img>` can only point at one
URL, so this avoids the impossible "one image, two destinations" trap).

```md
[![Modrinth Downloads](https://your-deployment.vercel.app/api/badge/modrinth?project=sodium)](https://modrinth.com/project/sodium)
[![CurseForge Downloads](https://your-deployment.vercel.app/api/badge/curseforge?slug=sodium)](https://www.curseforge.com/minecraft/mc-mods/sodium)
```

Visit the deployed site's homepage for a live form that generates this
snippet for you (slug, theme, style, category — copy/paste ready).

## Deploy

1. Push this repo to GitHub.
2. Import it into [Vercel](https://vercel.com/new) — zero config needed.
3. (Optional) set `CURSEFORGE_API_KEY` in the Vercel project's environment
   variables if you want exact, real-time CurseForge numbers instead of the
   free `cfwidget.com` proxy (see below) for projects *not* listed in
   `data/curseforge-projects.json`.
4. GitHub Actions (already set up, see below) needs no extra config — it
   just needs `contents: write` on the default `GITHUB_TOKEN`, which is
   already granted in the workflow file.

## Local dev

```
npm install
npm run dev
```

Open http://localhost:3000 for the badge generator UI.

## API

### `GET /api/badge/modrinth`

| param     | required | description                                   |
|-----------|----------|------------------------------------------------|
| `project` | yes      | Modrinth project slug or ID                    |
| `label`   | no       | left-side text, default `Modrinth`             |
| `color`   | no       | hex color (no `#`) for the value section       |
| `theme`   | no       | `light` \| `dark` (default `light`)            |
| `style`   | no       | `flat` \| `flat-square` \| `for-the-badge` \| `card` (260×260 gradient square) |
| `logo`    | no       | `false` to hide the Modrinth icon              |

### `GET /api/badge/curseforge`

| param      | required | description                                                        |
|------------|----------|----------------------------------------------------------------------|
| `slug`     | yes*     | CurseForge project slug, e.g. `jei`                                  |
| `category` | no       | `mc-mods` (default) \| `modpacks` \| `texture-packs` \| `shaders` \| `worlds` |
| `id`       | yes*     | numeric mod ID — use instead of `slug` for the official API path     |
| `label`, `color`, `theme`, `style`, `logo` | no | same as above |

\* one of `slug` or `id` is required.

### `GET /api/badge/combined`

Sums Modrinth + CurseForge downloads into a single badge (not individually
clickable to two destinations — link it wherever makes sense for you, e.g.
your own site).

| param         | description                          |
|---------------|----------------------------------------|
| `modrinth`    | Modrinth slug/ID                       |
| `curseforge`  | CurseForge slug                        |
| `curseforgeId`| CurseForge numeric ID (alternative)    |
| `category`    | CurseForge category, default `mc-mods` |
| `label`, `color`, `theme`, `style` | same as above     |

All badge responses are SVG (`image/svg+xml`) and are CDN-cached for one
hour (`s-maxage=3600`) so a busy GitHub profile doesn't hammer the upstream
APIs.

### `GET /api/badge/author`

Aggregate badge: total downloads summed across *every* project configured
in `lib/projects.config.ts` — your whole Modrinth account plus every
CurseForge project in `data/curseforge-projects.json`. No query params
required; same `label`/`color`/`theme`/`style` options as the others.

### `GET /api/badge/profile`

Dashboard-style card (420×240, dark gradient): total downloads front and
center, plus a 3-row breakdown — best-selling project, project count, and
account age since your Modrinth signup date. No query params; entirely
driven by `lib/projects.config.ts`.

## Data sources

- **Modrinth**: the public [Modrinth API](https://docs.modrinth.com/) — no
  key needed. `/api/badge/author` sums every project returned by
  `GET /v2/user/{username}/projects`.
- **CurseForge**: curseforge.com blocks plain HTTP requests (Cloudflare
  returns a `403` to `curl`/`fetch`), so this repo scrapes it with a real
  headless browser instead:
  - `scripts/scrape-curseforge.mjs` (Playwright) visits each project listed
    in `data/curseforge-projects.json` and reads the "Downloads" stat
    straight off the page, writing the result to
    `data/curseforge-downloads.json`.
  - `.github/workflows/scrape-curseforge.yml` runs that script every 6
    hours (and on manual dispatch) and commits the updated JSON back to
    the repo — Vercel then auto-redeploys with fresh numbers baked in, no
    scraping happens on the request path.
  - `/api/badge/curseforge` uses this scraped data for any project listed
    in `data/curseforge-projects.json`; for anything else it falls back to
    the free [`cfwidget.com`](https://cfwidget.com) proxy (no key needed,
    but can lag up to ~15 minutes, and a project's very first lookup may
    show "warming up…" while it gets indexed), or the official API if
    `CURSEFORGE_API_KEY` + a numeric `id` are given.
  - To track your own projects: edit `data/curseforge-projects.json`
    (`{ "slug": "...", "category": "mc-mods" }` per project — category is
    the URL segment, e.g. `mc-mods`, `texture-packs`, `modpacks`), then run
    `npm run scrape:curseforge` locally or trigger the workflow.

Brand marks are sourced from [Simple Icons](https://simpleicons.org) (CC0).
