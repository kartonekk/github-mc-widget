import { esc } from "./card";
import { cornerSquares, renderCornerSquares } from "./decor";
import { GITHUB_ICON_PATH } from "./icons";

export interface OrgCardOptions {
  login: string;
  repoCount: number;
}

const W = 280;
const H = 100;
const PAD = 20;

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s;
}

export function renderOrgCard(opts: OrgCardOptions): string {
  const value = String(opts.repoCount);
  const maxNumberWidth = 90;
  const estCharWidth = 0.62;
  let numberFontSize = 34;
  while (value.length * numberFontSize * estCharWidth > maxNumberWidth && numberFontSize > 20) {
    numberFontSize -= 2;
  }

  const decor = renderCornerSquares(cornerSquares(opts.login, W, H), "#c5ff4a");
  const midY = H / 2;

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
<circle cx="${PAD + 16}" cy="${midY}" r="16" fill="#ffffff" fill-opacity="0.08"/>
<svg x="${PAD + 7}" y="${midY - 9}" width="18" height="18" viewBox="0 0 24 24"><path fill="#c9d1d9" d="${GITHUB_ICON_PATH}"/></svg>
<text x="${PAD + 42}" y="${midY + 5}" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="15" font-weight="700" fill="#c9d1d9">${esc(truncate(opts.login, 20))}</text>
<text x="${W - PAD}" y="${midY - 2}" text-anchor="end" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="${numberFontSize}" font-weight="800" fill="#c5ff4a">${esc(value)}</text>
<text x="${W - PAD}" y="${midY + 16}" text-anchor="end" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="10" fill="#7d8590">${value === "1" ? "repository" : "repositories"}</text>
</svg>`;
}
