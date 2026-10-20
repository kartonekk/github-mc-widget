import { BOLD_CHAR, FONT, REG_CHAR, esc, estWidth, fitText, formatCard } from "./card";
import { cornerSquares, renderCornerSquares } from "./decor";
import { CURSEFORGE_COLOR, CURSEFORGE_ICON_PATH, LOADER_COLORS, MODRINTH_COLOR, MODRINTH_ICON_PATH } from "./icons";

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
  loaders: string[];
  versions?: string; // e.g. "1.21.6 → 26.3"
}

const W = 420;
const H = 280;
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

  // Platform split bar.
  const barY = BANNER_H + 64;
  const barW = W - 2 * PAD;
  const mrW = total ? Math.round((opts.modrinthDownloads / total) * barW) : 0;
  const cfW = total ? barW - mrW : 0;
  const gap = mrW && cfW ? 2 : 0;
  const bar = total
    ? `<clipPath id="mod-bar-clip"><rect x="${PAD}" y="${barY}" width="${barW}" height="6" rx="3"/></clipPath>
<g clip-path="url(#mod-bar-clip)">
${mrW ? `<rect x="${PAD}" y="${barY}" width="${mrW - gap / 2}" height="6" fill="${MODRINTH_COLOR}"/>` : ""}
${cfW ? `<rect x="${PAD + mrW + gap / 2}" y="${barY}" width="${cfW - gap / 2}" height="6" fill="${CURSEFORGE_COLOR}"/>` : ""}
</g>`
    : `<rect x="${PAD}" y="${barY}" width="${barW}" height="6" rx="3" fill="#ffffff" fill-opacity="0.08"/>`;

  const legendY = barY + 24;
  const legendItem = (x: number, path: string, color: string, n: number, label: string) => {
    const num = formatCard(n);
    const numW = estWidth(num, 11, BOLD_CHAR);
    return {
      svg: `<svg x="${x}" y="${legendY - 10}" width="12" height="12" viewBox="0 0 24 24"><path fill="${color}" d="${path}"/></svg>
<text x="${x + 17}" y="${legendY}" font-family="${FONT}" font-size="11" font-weight="700" fill="#e6edf3">${num}</text>
<text x="${x + 21 + numW}" y="${legendY}" font-family="${FONT}" font-size="10" fill="#7d8590">${label}</text>`,
      width: 21 + numW + estWidth(label, 10, REG_CHAR),
    };
  };
  const legend: string[] = [];
  let lx = PAD;
  for (const [n, path, color, label] of [
    [opts.modrinthDownloads, MODRINTH_ICON_PATH, MODRINTH_COLOR, "Modrinth"],
    [opts.curseforgeDownloads, CURSEFORGE_ICON_PATH, CURSEFORGE_COLOR, "CurseForge"],
  ] as const) {
    if (!n) continue;
    const item = legendItem(lx, path, color, n, label);
    legend.push(item.svg);
    lx += item.width + 16;
  }
  const versions = opts.versions
    ? `<text x="${W - PAD}" y="${legendY}" text-anchor="end" font-family="${FONT}" font-size="10" fill="#7d8590">MC ${esc(opts.versions)}</text>`
    : "";

  // Loader pills, same dot colors as the README shields.
  const pillY = legendY + 12;
  let px = PAD;
  const pills: string[] = [];
  for (const loader of opts.loaders) {
    const label = loader === "neoforge" ? "NeoForge" : loader.charAt(0).toUpperCase() + loader.slice(1);
    const w = 22 + estWidth(label, 10, REG_CHAR);
    if (px + w > W - PAD) break;
    pills.push(`<rect x="${px}" y="${pillY}" width="${w}" height="18" rx="9" fill="#ffffff" fill-opacity="0.06" stroke="#ffffff" stroke-opacity="0.1"/>
<circle cx="${px + 10}" cy="${pillY + 9}" r="3" fill="${LOADER_COLORS[loader] ?? "#8b949e"}"/>
<text x="${px + 17}" y="${pillY + 13}" font-family="${FONT}" font-size="10" fill="#c9d1d9">${esc(label)}</text>`);
    px += w + 6;
  }

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
${bar}
${legend.join("\n")}
${versions}
${pills.join("\n")}
</svg>`;
}
