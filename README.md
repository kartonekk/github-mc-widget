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
   free `cfwidget.com` proxy (see below).

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
| `style`   | no       | `flat` \| `flat-square` \| `for-the-badge`     |
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

## Data sources

- **Modrinth**: the public [Modrinth API](https://docs.modrinth.com/) — no
  key needed.
- **CurseForge**: by default, the free
  [`cfwidget.com`](https://cfwidget.com) proxy (no key needed, but can lag
  up to ~15 minutes and a project's very first lookup may show "warming
  up…" for a few seconds while it's indexed). For exact, real-time counts,
  get a free key from the
  [CurseForge Console](https://console.curseforge.com/), set it as
  `CURSEFORGE_API_KEY`, and pass the project's numeric `id` instead of
  `slug`.

Brand marks are sourced from [Simple Icons](https://simpleicons.org) (CC0).
