import { esc } from "./card";
import { cornerSquares, renderCornerSquares } from "./decor";
import { GITHUB_ICON_PATH } from "./icons";

export interface OrgColumn {
  login: string;
  repoCount: number;
}

export interface OrgsCardOptions {
  orgs: [OrgColumn, OrgColumn];
}

const W = 420;
const H = 200;
const PAD = 24;

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s;
}

function renderColumn(org: OrgColumn, cx: number): string {
  const value = String(org.repoCount);
  const colWidth = W / 2 - PAD * 2;
  const estCharWidth = 0.62;
  let numberFontSize = 44;
  while (value.length * numberFontSize * estCharWidth > colWidth && numberFontSize > 26) {
    numberFontSize -= 4;
  }

  const iconY = 46;
  const nameY = 86;
  const numberY = nameY + 44;
  const labelY = numberY + 22;

  return `<circle cx="${cx}" cy="${iconY}" r="16" fill="#ffffff" fill-opacity="0.08"/>
<svg x="${cx - 9}" y="${iconY - 9}" width="18" height="18" viewBox="0 0 24 24"><path fill="#c9d1d9" d="${GITHUB_ICON_PATH}"/></svg>
<text x="${cx}" y="${nameY}" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="14" font-weight="700" fill="#c9d1d9">${esc(truncate(org.login, 20))}</text>
<text x="${cx}" y="${numberY}" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="${numberFontSize}" font-weight="800" fill="#c5ff4a">${esc(value)}</text>
<text x="${cx}" y="${labelY}" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="12" fill="#7d8590">${value === "1" ? "repository" : "repositories"}</text>`;
}

export function renderOrgsCard(opts: OrgsCardOptions): string {
  const [left, right] = opts.orgs;
  const label = `${esc(left.login)}: ${left.repoCount} repositories; ${esc(right.login)}: ${right.repoCount} repositories`;
  const decor = renderCornerSquares(cornerSquares(`${left.login}|${right.login}`, W, H), "#c5ff4a");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}">
<title>${label}</title>
<defs>
<linearGradient id="obg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#161b22"/>
<stop offset="1" stop-color="#0d1117"/>
</linearGradient>
<clipPath id="ocard-clip"><rect width="${W}" height="${H}" rx="28"/></clipPath>
</defs>
<g clip-path="url(#ocard-clip)">
<rect width="${W}" height="${H}" fill="url(#obg)"/>
${decor}
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="27.5" fill="none" stroke="#3d444d"/>
</g>
<line x1="${W / 2}" y1="${PAD}" x2="${W / 2}" y2="${H - PAD}" stroke="#3d444d"/>
${renderColumn(left, W / 4)}
${renderColumn(right, (W / 4) * 3)}
</svg>`;
}
