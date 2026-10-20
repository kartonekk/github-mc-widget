import { BOLD_CHAR, FONT, REG_CHAR, esc, estWidth, fitText } from "./card";
import { cornerSquares, renderCornerSquares } from "./decor";
import { GITHUB_ICON_PATH } from "./icons";

export type OrgShowcase =
  | { kind: "mods"; art: string[]; icons: { title: string; iconDataUri?: string }[] } // art: data URIs, artSliceSize(n) each
  | { kind: "repos"; repos: string[] };

export interface OrgCardOptions {
  login: string;
  repoCount: number;
  subtitle?: string;
  accent: string;
  avatarDataUri?: string;
  showcase: OrgShowcase;
}

const W = 420;
const H = 150;
const PAD = 22;
const ART_X = 180; // promo art fills the card from here to the right edge

// Pixel size each of `n` art slices is drawn at (callers fetch at 2x).
export function artSliceSize(n: number): { width: number; height: number } {
  return { width: Math.ceil((W - ART_X) / Math.max(n, 1)), height: H };
}

// Faint commit-graph motif for orgs without art: a trunk with branches forking off.
function forkGraph(color: string): string {
  const y = 44;
  const branch = (x: number, dy: number) =>
    `<path d="M${x} ${y} C ${x + 22} ${y}, ${x + 18} ${y + dy}, ${x + 40} ${y + dy} H ${x + 90}" fill="none" stroke="${color}" stroke-opacity="0.22" stroke-width="2"/>
<circle cx="${x + 90}" cy="${y + dy}" r="4" fill="#0d1117" stroke="${color}" stroke-opacity="0.35" stroke-width="2"/>`;
  return `<line x1="230" y1="${y}" x2="${W + 10}" y2="${y}" stroke="${color}" stroke-opacity="0.22" stroke-width="2"/>
${branch(240, 26)}
${branch(300, 52)}
${[260, 330, 390].map((x) => `<circle cx="${x}" cy="${y}" r="4" fill="#0d1117" stroke="${color}" stroke-opacity="0.35" stroke-width="2"/>`).join("\n")}`;
}

export function renderOrgCard(opts: OrgCardOptions): string {
  const value = String(opts.repoCount);
  const { showcase } = opts;
  const hasArt = showcase.kind === "mods" && showcase.art.length > 0;

  // Backdrop: promo art slices on the right, fading into the card toward the text.
  let backdrop: string;
  if (hasArt) {
    const { width } = artSliceSize(showcase.art.length);
    backdrop = `${showcase.art
      .map((uri, i) => `<image href="${uri}" x="${ART_X + i * width}" y="0" width="${width}" height="${H}" preserveAspectRatio="xMidYMid slice"/>`)
      .join("\n")}
${showcase.art
  .slice(1)
  .map((_, i) => `<rect x="${ART_X + (i + 1) * width - 1}" y="0" width="2" height="${H}" fill="#0d1117" fill-opacity="0.6"/>`)
  .join("\n")}
<rect x="${ART_X}" width="${W - ART_X}" height="${H}" fill="url(#org-art-fade)"/>
<rect width="${W}" height="${H}" fill="url(#org-art-bottom)"/>`;
  } else if (showcase.kind === "repos") {
    backdrop = `${renderCornerSquares(cornerSquares(opts.login, W, H), opts.accent)}\n${forkGraph(opts.accent)}`;
  } else {
    backdrop = renderCornerSquares(cornerSquares(opts.login, W, H), opts.accent);
  }

  // Header: avatar, name, subtitle.
  const AV = 44;
  const avatarSvg = opts.avatarDataUri
    ? `<clipPath id="org-av-clip"><rect x="${PAD}" y="${PAD}" width="${AV}" height="${AV}" rx="11"/></clipPath>
<image href="${opts.avatarDataUri}" x="${PAD}" y="${PAD}" width="${AV}" height="${AV}" preserveAspectRatio="xMidYMid slice" clip-path="url(#org-av-clip)"/>
<rect x="${PAD - 1.5}" y="${PAD - 1.5}" width="${AV + 3}" height="${AV + 3}" rx="12.5" fill="none" stroke="${opts.accent}" stroke-width="2"/>`
    : `<rect x="${PAD}" y="${PAD}" width="${AV}" height="${AV}" rx="11" fill="#ffffff" fill-opacity="0.08"/>
<svg x="${PAD + 10}" y="${PAD + 10}" width="24" height="24" viewBox="0 0 24 24"><path fill="#c9d1d9" d="${GITHUB_ICON_PATH}"/></svg>`;
  const textX = PAD + AV + 12;
  const textMax = (hasArt ? ART_X + 70 : W - PAD) - textX;
  const name = fitText(opts.login, textMax, [18, 16, 14], BOLD_CHAR);
  const subtitle = opts.subtitle ? fitText(opts.subtitle, textMax, [11, 10], REG_CHAR) : undefined;

  // Stat: repo count, bottom-left.
  const statY = H - PAD - 2;
  const numW = estWidth(value, 30, BOLD_CHAR);
  const unit = value === "1" ? "repository" : "repositories";
  const statRight = PAD + numW + 6 + estWidth(unit, 11, REG_CHAR);

  // Showcase, bottom-right: mod icons, or recently pushed repo chips.
  let showcaseSvg = "";
  if (showcase.kind === "mods") {
    const S = 30;
    const icons = showcase.icons.slice(0, 6);
    icons.forEach((m, i) => {
      const x = W - PAD - S - (icons.length - 1 - i) * (S + 6);
      const y = statY - S + 4;
      showcaseSvg += m.iconDataUri
        ? `<rect x="${x - 2}" y="${y - 2}" width="${S + 4}" height="${S + 4}" rx="10" fill="#0d1117"/>
<clipPath id="org-ic-${i}"><rect x="${x}" y="${y}" width="${S}" height="${S}" rx="8"/></clipPath>
<image href="${m.iconDataUri}" x="${x}" y="${y}" width="${S}" height="${S}" clip-path="url(#org-ic-${i})" style="image-rendering:pixelated"><title>${esc(m.title)}</title></image>
<rect x="${x + 0.5}" y="${y + 0.5}" width="${S - 1}" height="${S - 1}" rx="7.5" fill="none" stroke="#ffffff" stroke-opacity="0.18"/>\n`
        : `<rect x="${x - 2}" y="${y - 2}" width="${S + 4}" height="${S + 4}" rx="10" fill="#0d1117"/>
<rect x="${x}" y="${y}" width="${S}" height="${S}" rx="8" fill="${opts.accent}" fill-opacity="0.18"/>
<text x="${x + S / 2}" y="${y + S / 2 + 5}" text-anchor="middle" font-family="${FONT}" font-size="13" font-weight="800" fill="${opts.accent}">${esc(m.title.replace(/[^A-Za-z0-9]/g, "").charAt(0) || "?")}</text>\n`;
    });
  } else {
    // Right-aligned chips, as many as fit beside the stat.
    let right = W - PAD;
    for (const repo of showcase.repos) {
      const label = fitText(repo, 110, [10], REG_CHAR).text;
      const w = 18 + estWidth(label, 10, REG_CHAR);
      if (right - w < statRight + 12) break;
      const x = right - w;
      showcaseSvg += `<rect x="${x.toFixed(1)}" y="${statY - 16}" width="${w.toFixed(1)}" height="20" rx="10" fill="${opts.accent}" fill-opacity="0.1" stroke="${opts.accent}" stroke-opacity="0.3"/>
<text x="${(x + 9).toFixed(1)}" y="${statY - 2}" font-family="${FONT}" font-size="10" fill="#c9d1d9">${esc(label)}</text>\n`;
      right = x - 6;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.login)}: ${value} ${unit}">
<title>${esc(opts.login)}: ${value} ${unit}</title>
<defs>
<linearGradient id="orgbg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#161b22"/>
<stop offset="1" stop-color="#0d1117"/>
</linearGradient>
<linearGradient id="org-art-fade" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="#141a21"/>
<stop offset="0.3" stop-color="#141a21" stop-opacity="0.8"/>
<stop offset="0.6" stop-color="#141a21" stop-opacity="0.3"/>
<stop offset="1" stop-color="#141a21" stop-opacity="0.05"/>
</linearGradient>
<linearGradient id="org-art-bottom" x1="0" y1="0" x2="0" y2="1">
<stop offset="0.5" stop-color="#0d1117" stop-opacity="0"/>
<stop offset="1" stop-color="#0d1117" stop-opacity="0.7"/>
</linearGradient>
<clipPath id="org-clip"><rect width="${W}" height="${H}" rx="20"/></clipPath>
</defs>
<g clip-path="url(#org-clip)">
<rect width="${W}" height="${H}" fill="url(#orgbg)"/>
${backdrop}
<rect width="4" height="${H}" fill="${opts.accent}"/>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="19.5" fill="none" stroke="#3d444d"/>
</g>
${avatarSvg}
<text x="${textX}" y="${PAD + (subtitle ? 19 : 28)}" font-family="${FONT}" font-size="${name.size}" font-weight="700" fill="#e6edf3">${esc(name.text)}</text>
${subtitle ? `<text x="${textX}" y="${PAD + 37}" font-family="${FONT}" font-size="${subtitle.size}" fill="#8b949e">${esc(subtitle.text)}</text>` : ""}
<text x="${PAD}" y="${statY}" font-family="${FONT}" font-size="30" font-weight="800" fill="${opts.accent}">${esc(value)}</text>
<text x="${PAD + numW + 6}" y="${statY}" font-family="${FONT}" font-size="11" fill="#8b949e">${unit}</text>
${showcaseSvg}</svg>`;
}
