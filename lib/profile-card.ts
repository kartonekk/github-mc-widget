import { BOLD_CHAR, FONT, REG_CHAR, esc, estWidth, fitText, formatCard } from "./card";
import { cornerSquares, renderCornerSquares } from "./decor";
import { CURSEFORGE_COLOR, CURSEFORGE_ICON_PATH, MODRINTH_COLOR, MODRINTH_ICON_PATH } from "./icons";

export interface ProfileCardOptions {
  name: string;
  subtitle: string;
  accent: string;
  avatarDataUri?: string;
  totalDownloads: number;
  modrinthDownloads: number;
  curseforgeDownloads: number;
  seed: string;
}

// Wide enough to span a GitHub README at roughly 1:1.
const W = 840;
const PAD = 28;

export function renderProfileCard(opts: ProfileCardOptions): string {
  const value = formatCard(opts.totalDownloads);

  const shareY = PAD + 80;
  const footerY = shareY + 28;
  const H = footerY + 40;

  // Header: avatar, name, and the headline total on the right.
  const AV = 56;
  const avatar = opts.avatarDataUri
    ? `<clipPath id="pf-av-clip"><circle cx="${PAD + AV / 2}" cy="${PAD + AV / 2}" r="${AV / 2}"/></clipPath>
<image href="${opts.avatarDataUri}" x="${PAD}" y="${PAD}" width="${AV}" height="${AV}" clip-path="url(#pf-av-clip)"/>
<circle cx="${PAD + AV / 2}" cy="${PAD + AV / 2}" r="${AV / 2 + 1.5}" fill="none" stroke="${opts.accent}" stroke-width="2"/>`
    : `<circle cx="${PAD + AV / 2}" cy="${PAD + AV / 2}" r="${AV / 2}" fill="${opts.accent}" fill-opacity="0.18"/>
<text x="${PAD + AV / 2}" y="${PAD + AV / 2 + 7}" text-anchor="middle" font-family="${FONT}" font-size="20" font-weight="800" fill="${opts.accent}">${esc(opts.name.charAt(0))}</text>`;

  let numSize = 46;
  while (estWidth(value, numSize, BOLD_CHAR) > 260 && numSize > 30) numSize -= 2;
  const numLeft = W - PAD - estWidth(value, numSize, BOLD_CHAR);
  const textX = PAD + AV + 12;
  const name = fitText(opts.name, numLeft - 10 - textX, [22, 19, 16], BOLD_CHAR);
  const subtitle = fitText(opts.subtitle, numLeft - 10 - textX, [13, 12], REG_CHAR);

  // Split bar: Modrinth vs CurseForge share of the total.
  const barW = W - 2 * PAD;
  const mrW = opts.totalDownloads ? (opts.modrinthDownloads / opts.totalDownloads) * barW : 0;
  const cfW = opts.totalDownloads ? (opts.curseforgeDownloads / opts.totalDownloads) * barW : 0;
  const gap = mrW >= 1 && cfW >= 1 ? 2 : 0;
  const shares = [
    mrW >= 1 ? `<rect x="${PAD}" y="${shareY}" width="${(mrW - gap / 2).toFixed(1)}" height="10" fill="${MODRINTH_COLOR}"/>` : "",
    cfW >= 1 ? `<rect x="${(PAD + mrW + gap / 2).toFixed(1)}" y="${shareY}" width="${(cfW - gap / 2).toFixed(1)}" height="10" fill="${CURSEFORGE_COLOR}"/>` : "",
  ].join("\n");

  // Footer: per-platform totals.
  const fy = footerY + 22;
  const chip = (x: number, path: string, color: string, n: number, label: string) => {
    const num = formatCard(n);
    const numW = estWidth(num, 12, BOLD_CHAR);
    const w = 44 + numW + estWidth(label, 12, REG_CHAR);
    return {
      svg: `<rect x="${x}" y="${fy - 17}" width="${w}" height="26" rx="13" fill="${color}" fill-opacity="0.12"/>
<svg x="${x + 10}" y="${fy - 11}" width="14" height="14" viewBox="0 0 24 24"><path fill="${color}" d="${path}"/></svg>
<text x="${x + 30}" y="${fy}" font-family="${FONT}" font-size="12" font-weight="700" fill="${color}">${num}</text>
<text x="${x + 35 + numW}" y="${fy}" font-family="${FONT}" font-size="12" fill="${color}" fill-opacity="0.75">${label}</text>`,
      w,
    };
  };
  const mr = chip(PAD, MODRINTH_ICON_PATH, MODRINTH_COLOR, opts.modrinthDownloads, "Modrinth");
  const cf = chip(PAD + mr.w + 10, CURSEFORGE_ICON_PATH, CURSEFORGE_COLOR, opts.curseforgeDownloads, "CurseForge");

  const decor = renderCornerSquares(cornerSquares(opts.seed, W, H), opts.accent);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.name)}: ${value} total downloads">
<title>${esc(opts.name)}: ${value} total downloads</title>
<defs>
<linearGradient id="pbg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#161b22"/>
<stop offset="1" stop-color="#0d1117"/>
</linearGradient>
<clipPath id="pcard-clip"><rect width="${W}" height="${H}" rx="24"/></clipPath>
<clipPath id="pshare-clip"><rect x="${PAD}" y="${shareY}" width="${barW}" height="10" rx="5"/></clipPath>
</defs>
<g clip-path="url(#pcard-clip)">
<rect width="${W}" height="${H}" fill="url(#pbg)"/>
${decor}
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="23.5" fill="none" stroke="#3d444d"/>
</g>
${avatar}
<text x="${textX}" y="${PAD + 24}" font-family="${FONT}" font-size="${name.size}" font-weight="700" fill="#e6edf3">${esc(name.text)}</text>
<text x="${textX}" y="${PAD + 46}" font-family="${FONT}" font-size="${subtitle.size}" fill="#7d8590">${esc(subtitle.text)}</text>
<text x="${W - PAD}" y="${PAD + 40}" text-anchor="end" font-family="${FONT}" font-size="${numSize}" font-weight="800" fill="${opts.accent}">${esc(value)}</text>
<text x="${W - PAD}" y="${PAD + 58}" text-anchor="end" font-family="${FONT}" font-size="12" fill="#7d8590">total downloads</text>
<rect x="${PAD}" y="${shareY}" width="${barW}" height="10" rx="5" fill="#ffffff" fill-opacity="0.07"/>
<g clip-path="url(#pshare-clip)">
${shares}
</g>
${mr.svg}
${cf.svg}
</svg>`;
}
