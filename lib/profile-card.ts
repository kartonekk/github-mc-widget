import { esc, formatCard } from "./card";
import { cornerSquares, renderCornerSquares } from "./decor";

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
  seed: string;
}

const W = 420;
const H = 240;
const PAD = 24;

const ROW_X = 210;
const GAP = 8;
// Verdana advance widths for ASCII 32–126, in hundredths of an em (measured).
// Characters outside that range fall back to a wide default.
const BOLD_CHAR = [34,40,59,87,71,127,86,33,54,54,71,87,36,48,36,69,71,71,71,71,71,71,71,71,71,71,40,40,87,87,87,62,96,78,76,72,83,68,65,81,84,55,56,77,64,95,85,85,73,85,78,71,68,81,76,113,76,74,69,54,69,54,87,71,71,67,70,59,70,66,42,70,71,34,40,67,34,106,71,69,70,70,50,59,46,71,65,98,67,65,60,71,54,71,87];
const REG_CHAR = [35,39,46,82,64,108,73,27,45,45,64,82,36,45,36,45,64,64,64,64,64,64,64,64,64,64,45,45,82,82,82,55,100,68,69,70,77,63,57,78,75,42,45,69,56,84,75,79,60,79,70,68,62,73,68,99,69,62,69,45,45,45,82,64,64,60,62,52,62,60,35,62,63,27,34,59,27,97,63,61,62,62,43,52,39,63,59,82,59,59,53,63,45,63,82];
const ELLIPSIS_EM = 1;

function estWidth(s: string, fontSize: number, widths: number[]): number {
  let em = 0;
  for (const ch of s) {
    const code = ch.charCodeAt(0);
    em += (code >= 32 && code < 127 ? widths[code - 32] : 90) / 100;
  }
  return em * fontSize;
}

// Shrink through the given font sizes until the text fits, then truncate at the smallest.
function fitText(s: string, maxWidth: number, sizes: number[], widths: number[]): { text: string; size: number } {
  for (const size of sizes) {
    if (estWidth(s, size, widths) <= maxWidth) return { text: s, size };
  }
  const size = sizes[sizes.length - 1];
  const chars = [...s];
  while (chars.length > 1 && estWidth(chars.join(""), size, widths) + ELLIPSIS_EM * size > maxWidth) chars.pop();
  return { text: chars.join("").trimEnd() + "…", size };
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
      // Keep the left text clear of the right-aligned value/unit column.
      const valueLeft = W - PAD - estWidth(row.value, 19, BOLD_CHAR);
      const unitLeft = W - PAD - estWidth(row.unit, 10, REG_CHAR);
      const title = fitText(row.title, valueLeft - GAP - ROW_X, [13, 12, 11], BOLD_CHAR);
      const subtitle = fitText(row.subtitle, unitLeft - GAP - ROW_X, [10, 9], REG_CHAR);
      return `<text x="${ROW_X}" y="${titleY}" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="${title.size}" font-weight="700" fill="#c9d1d9">${esc(title.text)}</text>
<text x="${ROW_X}" y="${subtitleY}" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="${subtitle.size}" fill="#7d8590">${esc(subtitle.text)}</text>
<text x="${W - PAD}" y="${valueY}" text-anchor="end" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="19" font-weight="800" fill="${row.color}">${esc(row.value)}</text>
<text x="${W - PAD}" y="${unitY2}" text-anchor="end" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="10" fill="${row.color}" fill-opacity="0.8">${esc(row.unit)}</text>`;
    })
    .join("\n");

  const decor = renderCornerSquares(cornerSquares(opts.seed, W, H), "#c5ff4a");

  const iconChip = (x: number, path: string) =>
    `<circle cx="${x}" cy="${H - PAD - 10}" r="14" fill="#ffffff" fill-opacity="0.14"/>
<svg x="${x - 8}" y="${H - PAD - 18}" width="16" height="16" viewBox="0 0 24 24"><path fill="#ffffff" fill-opacity="0.9" d="${path}"/></svg>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Total downloads: ${value}">
<title>Total downloads: ${value}; best project: ${esc(opts.rows[0].title)}</title>
<defs>
<linearGradient id="pbg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#161b22"/>
<stop offset="1" stop-color="#0d1117"/>
</linearGradient>
<clipPath id="pcard-clip"><rect width="${W}" height="${H}" rx="28"/></clipPath>
</defs>
<g clip-path="url(#pcard-clip)">
<rect width="${W}" height="${H}" fill="url(#pbg)"/>
${decor}
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="27.5" fill="none" stroke="#3d444d"/>
</g>
<line x1="188" y1="${PAD}" x2="188" y2="${H - PAD}" stroke="#3d444d"/>
<text x="${PAD}" y="${PAD + 14}" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="14" font-weight="700" fill="#c9d1d9">Total Downloads</text>
<text x="${PAD}" y="${numberY}" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="${numberFontSize}" font-weight="800" fill="#c5ff4a">${esc(value)}</text>
<text x="${PAD}" y="${unitY}" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="13" fill="#7d8590">downloads</text>
${iconChip(PAD + 14, opts.modrinthIconPath)}
${iconChip(PAD + 46, opts.curseforgeIconPath)}
${rowsSvg}
</svg>`;
}
