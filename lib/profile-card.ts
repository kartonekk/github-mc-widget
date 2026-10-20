import { BOLD_CHAR, FONT, REG_CHAR, SERIES, esc, estWidth, fitText, formatCard } from "./card";
import { cornerSquares, renderCornerSquares } from "./decor";
import { CURSEFORGE_COLOR, CURSEFORGE_ICON_PATH, MODRINTH_COLOR, MODRINTH_ICON_PATH } from "./icons";

export interface ProfileMod {
  title: string;
  downloads: number;
  iconDataUri?: string;
}

export interface ProfileCardOptions {
  name: string;
  subtitle: string;
  accent: string;
  avatarDataUri?: string;
  totalDownloads: number;
  modrinthDownloads: number;
  curseforgeDownloads: number;
  mods: ProfileMod[]; // most downloaded first
  footnote: string; // right side of the footer, e.g. "5 projects · 600 days"
  seed: string;
}

const W = 420;
const PAD = 22;
const MAX_ROWS = 5;
const ROW_H = 30;

export function renderProfileCard(opts: ProfileCardOptions): string {
  const value = formatCard(opts.totalDownloads);
  const rows = opts.mods.slice(0, MAX_ROWS);

  const shareY = PAD + 64;
  const rowsTop = shareY + 22;
  const footerY = rowsTop + rows.length * ROW_H + 10;
  const H = footerY + 40;

  // Header: avatar, name, and the headline total on the right.
  const AV = 44;
  const avatar = opts.avatarDataUri
    ? `<clipPath id="pf-av-clip"><circle cx="${PAD + AV / 2}" cy="${PAD + AV / 2}" r="${AV / 2}"/></clipPath>
<image href="${opts.avatarDataUri}" x="${PAD}" y="${PAD}" width="${AV}" height="${AV}" clip-path="url(#pf-av-clip)"/>
<circle cx="${PAD + AV / 2}" cy="${PAD + AV / 2}" r="${AV / 2 + 1.5}" fill="none" stroke="${opts.accent}" stroke-width="2"/>`
    : `<circle cx="${PAD + AV / 2}" cy="${PAD + AV / 2}" r="${AV / 2}" fill="${opts.accent}" fill-opacity="0.18"/>
<text x="${PAD + AV / 2}" y="${PAD + AV / 2 + 7}" text-anchor="middle" font-family="${FONT}" font-size="20" font-weight="800" fill="${opts.accent}">${esc(opts.name.charAt(0))}</text>`;

  let numSize = 34;
  while (estWidth(value, numSize, BOLD_CHAR) > 150 && numSize > 22) numSize -= 2;
  const numLeft = W - PAD - estWidth(value, numSize, BOLD_CHAR);
  const textX = PAD + AV + 12;
  const name = fitText(opts.name, numLeft - 10 - textX, [17, 15, 13], BOLD_CHAR);
  const subtitle = fitText(opts.subtitle, numLeft - 10 - textX, [11, 10], REG_CHAR);

  // Share bar: every mod's slice of the total, in series colors.
  const barW = W - 2 * PAD;
  let sx = PAD;
  const shares = opts.mods
    .map((m, i) => {
      const w = opts.totalDownloads ? (m.downloads / opts.totalDownloads) * barW : 0;
      const seg = w >= 1 ? `<rect x="${sx.toFixed(1)}" y="${shareY}" width="${Math.max(w - 2, 1).toFixed(1)}" height="8" fill="${SERIES[i % SERIES.length]}"/>` : "";
      sx += w;
      return seg;
    })
    .join("\n");

  // Rows: icon, title, relative bar, count.
  const max = rows[0]?.downloads || 1;
  const rowsSvg = rows
    .map((m, i) => {
      const y = rowsTop + i * ROW_H;
      const color = SERIES[i % SERIES.length];
      const count = formatCard(m.downloads);
      const countLeft = W - PAD - estWidth(count, 13, BOLD_CHAR);
      const nameX = PAD + 32;
      const title = fitText(m.title, countLeft - 12 - nameX, [12, 11], BOLD_CHAR);
      const trackW = countLeft - 14 - nameX;
      const icon = m.iconDataUri
        ? `<clipPath id="pf-ic-${i}"><rect x="${PAD}" y="${y + 3}" width="22" height="22" rx="6"/></clipPath>
<image href="${m.iconDataUri}" x="${PAD}" y="${y + 3}" width="22" height="22" clip-path="url(#pf-ic-${i})" style="image-rendering:pixelated"/>`
        : `<rect x="${PAD}" y="${y + 3}" width="22" height="22" rx="6" fill="${color}" fill-opacity="0.18"/>
<text x="${PAD + 11}" y="${y + 18}" text-anchor="middle" font-family="${FONT}" font-size="11" font-weight="800" fill="${color}">${esc(m.title.replace(/[^A-Za-z0-9]/g, "").charAt(0) || "?")}</text>`;
      return `${icon}
<text x="${nameX}" y="${y + 13}" font-family="${FONT}" font-size="${title.size}" font-weight="700" fill="#e6edf3">${esc(title.text)}</text>
<rect x="${nameX}" y="${y + 19}" width="${trackW.toFixed(1)}" height="4" rx="2" fill="#ffffff" fill-opacity="0.07"/>
<rect x="${nameX}" y="${y + 19}" width="${Math.max((m.downloads / max) * trackW, 4).toFixed(1)}" height="4" rx="2" fill="${color}"/>
<text x="${W - PAD}" y="${y + 20}" text-anchor="end" font-family="${FONT}" font-size="13" font-weight="800" fill="${color}">${count}</text>`;
    })
    .join("\n");

  // Footer: per-platform totals and a footnote.
  const fy = footerY + 22;
  const chip = (x: number, path: string, color: string, n: number) => {
    const num = formatCard(n);
    const w = 32 + estWidth(num, 11, BOLD_CHAR);
    return {
      svg: `<rect x="${x}" y="${fy - 15}" width="${w}" height="22" rx="11" fill="${color}" fill-opacity="0.12"/>
<svg x="${x + 8}" y="${fy - 10}" width="12" height="12" viewBox="0 0 24 24"><path fill="${color}" d="${path}"/></svg>
<text x="${x + 25}" y="${fy}" font-family="${FONT}" font-size="11" font-weight="700" fill="${color}">${num}</text>`,
      w,
    };
  };
  const mr = chip(PAD, MODRINTH_ICON_PATH, MODRINTH_COLOR, opts.modrinthDownloads);
  const cf = chip(PAD + mr.w + 8, CURSEFORGE_ICON_PATH, CURSEFORGE_COLOR, opts.curseforgeDownloads);

  const decor = renderCornerSquares(cornerSquares(opts.seed, W, H), opts.accent);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.name)}: ${value} total downloads">
<title>${esc(opts.name)}: ${value} total downloads; top mod: ${esc(rows[0]?.title ?? "none")}</title>
<defs>
<linearGradient id="pbg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#161b22"/>
<stop offset="1" stop-color="#0d1117"/>
</linearGradient>
<clipPath id="pcard-clip"><rect width="${W}" height="${H}" rx="24"/></clipPath>
<clipPath id="pshare-clip"><rect x="${PAD}" y="${shareY}" width="${barW}" height="8" rx="4"/></clipPath>
</defs>
<g clip-path="url(#pcard-clip)">
<rect width="${W}" height="${H}" fill="url(#pbg)"/>
${decor}
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="23.5" fill="none" stroke="#3d444d"/>
</g>
${avatar}
<text x="${textX}" y="${PAD + 20}" font-family="${FONT}" font-size="${name.size}" font-weight="700" fill="#e6edf3">${esc(name.text)}</text>
<text x="${textX}" y="${PAD + 38}" font-family="${FONT}" font-size="${subtitle.size}" fill="#7d8590">${esc(subtitle.text)}</text>
<text x="${W - PAD}" y="${PAD + 28}" text-anchor="end" font-family="${FONT}" font-size="${numSize}" font-weight="800" fill="${opts.accent}">${esc(value)}</text>
<text x="${W - PAD}" y="${PAD + 44}" text-anchor="end" font-family="${FONT}" font-size="10" fill="#7d8590">total downloads</text>
<rect x="${PAD}" y="${shareY}" width="${barW}" height="8" rx="4" fill="#ffffff" fill-opacity="0.07"/>
<g clip-path="url(#pshare-clip)">
${shares}
</g>
${rowsSvg}
<line x1="${PAD}" y1="${footerY}" x2="${W - PAD}" y2="${footerY}" stroke="#3d444d"/>
${mr.svg}
${cf.svg}
<text x="${W - PAD}" y="${fy}" text-anchor="end" font-family="${FONT}" font-size="10" fill="#7d8590">${esc(opts.footnote)}</text>
</svg>`;
}
