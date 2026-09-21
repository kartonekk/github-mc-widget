import { esc, formatCard } from "./card";

export interface ProfileRow {
  title: string;
  subtitle: string;
  value: string;
  unit: string;
  color: string;
}

export interface ProfileCardOptions {
  totalDownloads: number;
  rows: [ProfileRow, ProfileRow, ProfileRow];
  modrinthIconPath: string;
  curseforgeIconPath: string;
}

const W = 420;
const H = 240;
const PAD = 24;

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s;
}

export function renderProfileCard(opts: ProfileCardOptions): string {
  const value = formatCard(opts.totalDownloads);

  const leftColWidth = 150;
  const estCharWidth = 0.62;
  let numberFontSize = 56;
  while (value.length * numberFontSize * estCharWidth > leftColWidth && numberFontSize > 28) {
    numberFontSize -= 4;
  }

  const numberY = 118;
  const unitY = numberY + 22;

  const rowTop = PAD;
  const rowBottom = H - PAD;
  const rowH = (rowBottom - rowTop) / 3;
  const rowsSvg = opts.rows
    .map((row, i) => {
      const centerY = rowTop + rowH * i + rowH / 2;
      const titleY = centerY - 6;
      const subtitleY = centerY + 12;
      const valueY = centerY - 4;
      const unitY2 = centerY + 13;
      return `<text x="210" y="${titleY}" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="13" font-weight="700" fill="#ffffff">${esc(truncate(row.title, 22))}</text>
<text x="210" y="${subtitleY}" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="10" fill="#ffffff" fill-opacity="0.55">${esc(truncate(row.subtitle, 26))}</text>
<text x="${W - PAD}" y="${valueY}" text-anchor="end" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="19" font-weight="800" fill="${row.color}">${esc(row.value)}</text>
<text x="${W - PAD}" y="${unitY2}" text-anchor="end" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="10" fill="${row.color}" fill-opacity="0.8">${esc(row.unit)}</text>`;
    })
    .join("\n");

  const iconChip = (x: number, path: string) =>
    `<circle cx="${x}" cy="${H - PAD - 10}" r="14" fill="#ffffff" fill-opacity="0.14"/>
<svg x="${x - 8}" y="${H - PAD - 18}" width="16" height="16" viewBox="0 0 24 24"><path fill="#ffffff" fill-opacity="0.9" d="${path}"/></svg>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Total downloads: ${value}">
<title>Total downloads: ${value}; best project: ${esc(opts.rows[0].title)}</title>
<defs>
<linearGradient id="pbg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#1b2540"/>
<stop offset="1" stop-color="#05060d"/>
</linearGradient>
<clipPath id="pcard-clip"><rect width="${W}" height="${H}" rx="28"/></clipPath>
</defs>
<g clip-path="url(#pcard-clip)">
<rect width="${W}" height="${H}" fill="url(#pbg)"/>
<rect x="330" y="-20" width="70" height="70" rx="18" fill="#ffffff" fill-opacity="0.05" transform="rotate(18 365 15)"/>
<rect x="-16" y="150" width="56" height="56" rx="16" fill="#ffffff" fill-opacity="0.04" transform="rotate(18 12 178)"/>
</g>
<line x1="188" y1="${PAD}" x2="188" y2="${H - PAD}" stroke="#ffffff" stroke-opacity="0.12"/>
<text x="${PAD}" y="${PAD + 14}" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="14" font-weight="700" fill="#ffffff">Total Downloads</text>
<text x="${PAD}" y="${numberY}" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="${numberFontSize}" font-weight="800" fill="#4dd8c0">${esc(value)}</text>
<text x="${PAD}" y="${unitY}" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="13" fill="#ffffff" fill-opacity="0.6">downloads</text>
${iconChip(PAD + 14, opts.modrinthIconPath)}
${iconChip(PAD + 46, opts.curseforgeIconPath)}
${rowsSvg}
</svg>`;
}
