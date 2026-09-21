export interface CardOptions {
  label: string; // small top-left text, e.g. "Modrinth"
  count: number; // raw download count — formatted internally
  caption?: string; // small line under "downloads", e.g. exact count
  colorFrom: string;
  colorTo: string;
  iconPath?: string; // 24x24 viewBox brand mark, shown in the corner chip
  iconColor?: string; // fill for the icon inside the corner chip
}

const SIZE = 260;
const PAD = 22;

export function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function formatCard(n: number): string {
  const abs = Math.abs(n);
  const trim = (x: number) => (Math.round(x * 10) / 10).toFixed(1).replace(/\.0$/, "");
  if (abs >= 1_000_000_000) return trim(n / 1_000_000_000) + "B";
  if (abs >= 1_000_000) return trim(n / 1_000_000) + "M";
  if (abs >= 1_000) return trim(n / 1_000) + "K";
  return String(Math.round(n));
}

// Decorative, low-opacity floating squares for background texture — fixed
// positions so output is deterministic.
const DECOR = [
  { x: 200, y: -14, s: 60, r: 18, o: 0.1 },
  { x: 226, y: 34, s: 34, r: 10, o: 0.14 },
  { x: -18, y: 190, s: 56, r: 16, o: 0.09 },
  { x: 20, y: 226, s: 30, r: 9, o: 0.13 },
  { x: -10, y: -8, s: 40, r: 12, o: 0.08 },
];

export function renderCard(opts: CardOptions): string {
  const value = formatCard(opts.count);

  // Shrink the big number if it would overrun the card width.
  const maxNumberWidth = SIZE - PAD * 2;
  const estCharWidth = 0.62; // fraction of font-size, bold digits
  let numberFontSize = 72;
  const estWidth = () => value.length * numberFontSize * estCharWidth;
  while (estWidth() > maxNumberWidth && numberFontSize > 32) numberFontSize -= 4;

  const numberY = PAD + 30 + numberFontSize * 0.78;
  const unitY = numberY + 26;
  const captionY = unitY + 22;

  const decor = DECOR.map(
    (d) =>
      `<rect x="${d.x}" y="${d.y}" width="${d.s}" height="${d.s}" rx="${d.r}" fill="#ffffff" fill-opacity="${d.o}" transform="rotate(18 ${d.x + d.s / 2} ${d.y + d.s / 2})"/>`
  ).join("");

  const chipCx = SIZE - 46;
  const chipCy = SIZE - 46;
  const icon = opts.iconPath
    ? `<circle cx="${chipCx}" cy="${chipCy}" r="26" fill="#ffffff" fill-opacity="0.95"/>
<svg x="${chipCx - 13}" y="${chipCy - 13}" width="26" height="26" viewBox="0 0 24 24"><path fill="${opts.iconColor ?? opts.colorTo}" d="${opts.iconPath}"/></svg>`
    : "";

  const caption = opts.caption
    ? `<text x="${PAD}" y="${captionY}" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="12" fill="#ffffff" fill-opacity="0.7">${esc(opts.caption)}</text>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" role="img" aria-label="${esc(opts.label)}: ${esc(value)} downloads">
<title>${esc(opts.label)}: ${value} downloads</title>
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="${opts.colorFrom}"/>
<stop offset="1" stop-color="${opts.colorTo}"/>
</linearGradient>
<clipPath id="card-clip"><rect width="${SIZE}" height="${SIZE}" rx="28"/></clipPath>
</defs>
<g clip-path="url(#card-clip)">
<rect width="${SIZE}" height="${SIZE}" fill="url(#bg)"/>
${decor}
</g>
<text x="${PAD}" y="${PAD + 14}" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="15" font-weight="700" fill="#ffffff">${esc(opts.label)}</text>
<text x="${PAD}" y="${numberY}" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="${numberFontSize}" font-weight="800" fill="#ffffff">${esc(value)}</text>
<text x="${PAD}" y="${unitY}" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="15" fill="#ffffff" fill-opacity="0.85">downloads</text>
${caption}
${icon}
</svg>`;
}
