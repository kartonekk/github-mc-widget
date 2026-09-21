import { esc } from "./card";
import { cornerSquares, renderCornerSquares } from "./decor";
import { GITHUB_ICON_PATH } from "./icons";

export interface OrgCardOptions {
  login: string;
  repoCount: number;
  subtitle?: string;
}

const W = 420;
const H = 120;
const PAD = 24;

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s;
}

export function renderOrgCard(opts: OrgCardOptions): string {
  const value = String(opts.repoCount);
  const maxNumberWidth = 130;
  const estCharWidth = 0.62;
  let numberFontSize = 44;
  while (value.length * numberFontSize * estCharWidth > maxNumberWidth && numberFontSize > 24) {
    numberFontSize -= 2;
  }

  const decor = renderCornerSquares(cornerSquares(opts.login, W, H), "#c5ff4a");
  const midY = H / 2;

  const nameY = opts.subtitle ? midY - 10 : midY;
  const subtitleSvg = opts.subtitle
    ? `<text x="${PAD + 48}" y="${midY + 11}" dominant-baseline="central" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="12" fill="#7d8590">${esc(truncate(opts.subtitle, 34))}</text>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.login)}: ${value} repositories">
<title>${esc(opts.login)}: ${value} repositories</title>
<defs>
<linearGradient id="orgbg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#161b22"/>
<stop offset="1" stop-color="#0d1117"/>
</linearGradient>
<clipPath id="org-clip"><rect width="${W}" height="${H}" rx="20"/></clipPath>
</defs>
<g clip-path="url(#org-clip)">
<rect width="${W}" height="${H}" fill="url(#orgbg)"/>
${decor}
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="19.5" fill="none" stroke="#3d444d"/>
</g>
<circle cx="${PAD + 18}" cy="${midY}" r="19" fill="#ffffff" fill-opacity="0.08"/>
<svg x="${PAD + 8}" y="${midY - 11}" width="22" height="22" viewBox="0 0 24 24"><path fill="#c9d1d9" d="${GITHUB_ICON_PATH}"/></svg>
<text x="${PAD + 48}" y="${nameY}" dominant-baseline="central" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="18" font-weight="700" fill="#c9d1d9">${esc(truncate(opts.login, 30))}</text>
${subtitleSvg}
<text x="${W - PAD}" y="${midY - 11}" dominant-baseline="central" text-anchor="end" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="${numberFontSize}" font-weight="800" fill="#c5ff4a">${esc(value)}</text>
<text x="${W - PAD}" y="${midY + 11}" dominant-baseline="central" text-anchor="end" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="12" fill="#7d8590">${value === "1" ? "repository" : "repositories"}</text>
</svg>`;
}
