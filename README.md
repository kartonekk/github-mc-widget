# github-mc-widget

Dynamically generated SVG cards for a GitHub profile README:

- a profile card summarizing your Modrinth + CurseForge project stats —
  total downloads, best-selling project, and account age
- an organization card (one per org) showing its public repo count

```md
![Total Downloads](https://your-deployment.vercel.app/api/badge/profile)
![Karton-Modding](https://your-deployment.vercel.app/api/badge/org?login=Karton-Modding)
![Kart-Forks](https://your-deployment.vercel.app/api/badge/org?login=Kart-Forks)
```

Visit the deployed site's homepage for a live preview and copy/paste-ready
snippets.

## Deploy

1. Push this repo to GitHub.
2. Import it into [Vercel](https://vercel.com/new) — zero config needed.
3. GitHub Actions (already set up, see below) needs no extra config — it
   just needs `contents: write` on the default `GITHUB_TOKEN`, which is
   already granted in the workflow file.

## Local dev

```
npm install
npm run dev
```

Open http://localhost:3000 for a live preview.

## API

### `GET /api/badge/profile`

Dashboard-style card (420×240, dark gradient): total downloads front and
center, plus a 3-row breakdown — best-selling project, project count, and
account age since your Modrinth signup date. No query params; entirely
driven by `lib/projects.config.ts`.

### `GET /api/badge/org?login=<org>`

Compact card (280×100, dark gradient) with one GitHub organization's public
repo count. `login` is required and can be any public org — fetched live
from the public GitHub API (`GET /orgs/{login}`), no token needed. Add one
`<img>`/markdown line per org you want to show.

All badge responses are SVG (`image/svg+xml`) and are CDN-cached for one
hour (`s-maxage=3600`) so a busy GitHub profile doesn't hammer the upstream
APIs.

## Data sources

- **Modrinth**: the public [Modrinth API](https://docs.modrinth.com/) — no
  key needed. Used to sum every project's downloads plus fetch account
  creation date.
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
  - To track your own projects: edit `data/curseforge-projects.json`
    (`{ "slug": "...", "category": "mc-mods" }` per project — category is
    the URL segment, e.g. `mc-mods`, `texture-packs`, `modpacks`), then run
    `npm run scrape:curseforge` locally or trigger the workflow.
- Pair the same project across platforms in `lib/projects.config.ts`
  (slugs differ between Modrinth and CurseForge) so totals/"best project"
  can be computed correctly instead of guessing by name.

Brand marks are sourced from [Simple Icons](https://simpleicons.org) (CC0).
