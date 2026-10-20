import { BOLD_CHAR, FONT, REG_CHAR, esc, estWidth, fitText, formatCard } from "./card";
import { cornerSquares, renderCornerSquares } from "./decor";

export interface ModCardOptions {
  id: string;
  title: string;
  tagline?: string;
  accent: string;
  modrinthDownloads: number;
  curseforgeDownloads: number;
  bannerDataUri?: string; // BANNER_W x BANNER_H (cover-cropped)
  backdropDataUri?: string; // used without a banner: blurred icon behind the title
  iconDataUri?: string;
}

const W = 420;
const H = 217;
const PAD = 20;
export const BANNER_W = W;
export const BANNER_H = 147; // 1600x560 promo banners fit exactly
const ICON = 52;

export function renderModCard(opts: ModCardOptions): string {
  const total = opts.modrinthDownloads + opts.curseforgeDownloads;
  const value = formatCard(total);

  // Banner: the mod's promo art, masked so it fades into the card toward its bottom edge.
  const banner = opts.bannerDataUri
    ? `<image href="${opts.bannerDataUri}" width="${BANNER_W}" height="${BANNER_H}" preserveAspectRatio="xMidYMid slice"/>`
    : `${opts.backdropDataUri ? `<image href="${opts.backdropDataUri}" width="${BANNER_W}" height="${BANNER_H}" preserveAspectRatio="xMidYMid slice"/>` : `<rect width="${BANNER_W}" height="${BANNER_H}" fill="url(#mod-fallback)"/>`}
${renderCornerSquares(cornerSquares(opts.id, W, BANNER_H), opts.accent)}
<text x="${W / 2}" y="${BANNER_H / 2 + 12}" text-anchor="middle" font-family="${FONT}" font-size="34" font-weight="800" fill="#ffffff" fill-opacity="0.9">${esc(fitText(opts.title, W - 2 * PAD, [34, 28, 22], BOLD_CHAR).text)}</text>`;

  // Icon straddles the banner's bottom edge, ringed in the card background.
  const iconX = PAD;
  const iconY = BANNER_H - ICON / 2 - 4;
  const icon = opts.iconDataUri
    ? `<rect x="${iconX - 3}" y="${iconY - 3}" width="${ICON + 6}" height="${ICON + 6}" rx="15" fill="#0d1117"/>
<clipPath id="mod-icon-clip"><rect x="${iconX}" y="${iconY}" width="${ICON}" height="${ICON}" rx="12"/></clipPath>
<image href="${opts.iconDataUri}" x="${iconX}" y="${iconY}" width="${ICON}" height="${ICON}" preserveAspectRatio="xMidYMid slice" clip-path="url(#mod-icon-clip)" style="image-rendering:pixelated"/>
<rect x="${iconX + 0.5}" y="${iconY + 0.5}" width="${ICON - 1}" height="${ICON - 1}" rx="11.5" fill="none" stroke="#ffffff" stroke-opacity="0.15"/>`
    : `<rect x="${iconX - 3}" y="${iconY - 3}" width="${ICON + 6}" height="${ICON + 6}" rx="15" fill="#0d1117"/>
<rect x="${iconX}" y="${iconY}" width="${ICON}" height="${ICON}" rx="12" fill="${opts.accent}" fill-opacity="0.18"/>
<text x="${iconX + ICON / 2}" y="${iconY + ICON / 2 + 8}" text-anchor="middle" font-family="${FONT}" font-size="22" font-weight="800" fill="${opts.accent}">${esc(opts.title.replace(/[^A-Za-z0-9]/g, "").charAt(0) || "?")}</text>`;

  // Headline: total downloads, right-aligned under the banner.
  let numSize = 28;
  while (estWidth(value, numSize, BOLD_CHAR) > 120 && numSize > 18) numSize -= 2;
  const numY = BANNER_H + 34;
  const numLeft = W - PAD - Math.max(estWidth(value, numSize, BOLD_CHAR), estWidth("downloads", 10, REG_CHAR));

  const textX = iconX + ICON + 14;
  const title = fitText(opts.title, numLeft - 12 - textX, [17, 15, 13], BOLD_CHAR);
  const tagline = opts.tagline ? fitText(opts.tagline, numLeft - 12 - textX, [11, 10], REG_CHAR) : undefined;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.title)}: ${value} downloads">
<title>${esc(opts.title)}: ${value} downloads</title>
<defs>
<linearGradient id="mod-bg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#161b22"/>
<stop offset="1" stop-color="#0d1117"/>
</linearGradient>
<linearGradient id="mod-fallback" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="${opts.accent}" stop-opacity="0.35"/>
<stop offset="1" stop-color="#161b22"/>
</linearGradient>
<linearGradient id="mod-fade" x1="0" y1="0" x2="0" y2="1">
<stop offset="0.45" stop-color="#ffffff"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<mask id="mod-banner-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${BANNER_H}"><rect width="${W}" height="${BANNER_H}" fill="url(#mod-fade)"/></mask>
<clipPath id="mod-clip"><rect width="${W}" height="${H}" rx="20"/></clipPath>
</defs>
<g clip-path="url(#mod-clip)">
<rect width="${W}" height="${H}" fill="url(#mod-bg)"/>
<g mask="url(#mod-banner-mask)">
${banner}
</g>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="19.5" fill="none" stroke="#3d444d"/>
</g>
${icon}
<text x="${textX}" y="${BANNER_H + (tagline ? 22 : 30)}" font-family="${FONT}" font-size="${title.size}" font-weight="700" fill="#e6edf3">${esc(title.text)}</text>
${tagline ? `<text x="${textX}" y="${BANNER_H + 40}" font-family="${FONT}" font-size="${tagline.size}" fill="#7d8590">${esc(tagline.text)}</text>` : ""}
<text x="${W - PAD}" y="${numY}" text-anchor="end" font-family="${FONT}" font-size="${numSize}" font-weight="800" fill="${opts.accent}">${esc(value)}</text>
<text x="${W - PAD}" y="${numY + 15}" text-anchor="end" font-family="${FONT}" font-size="10" fill="#7d8590">downloads</text>
</svg>`;
}
