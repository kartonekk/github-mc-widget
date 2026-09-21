export type BadgeStyle = "flat" | "flat-square" | "for-the-badge";
export type BadgeTheme = "light" | "dark";

export interface BadgeOptions {
  label: string;
  value: string;
  color: string; // hex, e.g. "#1bd96a"
  theme?: BadgeTheme;
  style?: BadgeStyle;
  iconPath?: string; // 24x24 viewBox path data, rendered in the label section
}

// Rough per-character width table for 11px Verdana/DejaVu Sans (px). Unknown
// characters fall back to AVG_CHAR_WIDTH. Good enough for badge sizing —
// SVG is vector, so a few px of slack never looks broken.
const CHAR_WIDTHS: Record<string, number> = {
  " ": 3.5, "!": 4.3, '"': 5.5, "#": 8.4, "$": 7.1, "%": 11.5, "&": 8.6,
  "'": 2.8, "(": 4.6, ")": 4.6, "*": 6.1, "+": 8.4, ",": 3.5, "-": 4.6,
  ".": 3.5, "/": 4.3, "0": 7.1, "1": 7.1, "2": 7.1, "3": 7.1, "4": 7.1,
  "5": 7.1, "6": 7.1, "7": 7.1, "8": 7.1, "9": 7.1, ":": 4.3, ";": 4.3,
  "<": 8.4, "=": 8.4, ">": 8.4, "?": 6.4, "@": 12.9,
};
const AVG_CHAR_WIDTH = 7.2;
const AVG_UPPER_WIDTH = 8.1;

function estimateTextWidth(text: string, fontSize: number, bold = false): number {
  const scale = fontSize / 11;
  let width = 0;
  for (const ch of text) {
    if (ch in CHAR_WIDTHS) width += CHAR_WIDTHS[ch];
    else if (ch >= "A" && ch <= "Z") width += AVG_UPPER_WIDTH;
    else width += AVG_CHAR_WIDTH;
  }
  return width * scale * (bold ? 1.08 : 1);
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function errorBadge(message: string, style?: BadgeStyle, theme?: BadgeTheme): string {
  return renderBadge({ label: "error", value: message, color: "#e05d44", style, theme });
}

export function renderBadge(opts: BadgeOptions): string {
  const style = opts.style ?? "flat";
  const theme = opts.theme ?? "light";
  const forTheBadge = style === "for-the-badge";
  const rx = style === "flat" ? 3 : 0;

  const label = forTheBadge ? opts.label.toUpperCase() : opts.label;
  const value = forTheBadge ? opts.value.toUpperCase() : opts.value;

  const height = forTheBadge ? 28 : 20;
  const fontSize = forTheBadge ? 12 : 11;
  const hPad = forTheBadge ? 12 : 8;
  const bold = forTheBadge;
  const letterSpacing = forTheBadge ? 0.6 : 0;

  const labelBg = theme === "dark" ? "#30363d" : "#555555";
  const labelText = theme === "dark" ? "#c9d1d9" : "#ffffff";
  const valueBg = opts.color;
  const valueText = "#ffffff";

  const iconSize = forTheBadge ? 16 : 14;
  const iconPad = opts.iconPath ? iconSize + hPad * 0.6 : 0;

  const labelTextWidth = estimateTextWidth(label, fontSize, bold) + letterSpacing * label.length;
  const valueTextWidth = estimateTextWidth(value, fontSize, bold) + letterSpacing * value.length;

  const labelWidth = Math.round(labelTextWidth + hPad * 2 + iconPad);
  const valueWidth = Math.round(valueTextWidth + hPad * 2);
  const totalWidth = labelWidth + valueWidth;

  const textY = Math.round(height / 2 + fontSize * 0.35);
  const shadowY = textY + 1;

  const iconX = hPad;
  const iconY = Math.round((height - iconSize) / 2);
  const labelTextX = iconPad ? hPad + iconPad + labelTextWidth / 2 - hPad * 0.6 : labelWidth / 2;
  const valueTextX = labelWidth + valueWidth / 2;

  const icon = opts.iconPath
    ? `<svg x="${iconX}" y="${iconY}" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24"><path fill="${labelText}" d="${opts.iconPath}"/></svg>`
    : "";

  const highlight =
    style === "flat"
      ? `<linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset=".1" stop-color="#aaa" stop-opacity=".1"/><stop offset=".9" stop-color="#000" stop-opacity=".07"/><stop offset="1" stop-color="#000" stop-opacity=".17"/></linearGradient><rect width="${totalWidth}" height="${height}" fill="url(#s)"/>`
      : "";

  const fontWeight = bold ? "bold" : "normal";
  const fontFamily = "Verdana,Geneva,DejaVu Sans,sans-serif";
  const spacingAttr = letterSpacing ? ` letter-spacing="${letterSpacing}"` : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}" role="img" aria-label="${esc(label)}: ${esc(value)}">
<title>${esc(label)}: ${esc(value)}</title>
<clipPath id="r"><rect width="${totalWidth}" height="${height}" rx="${rx}" fill="#fff"/></clipPath>
<g clip-path="url(#r)">
<rect width="${labelWidth}" height="${height}" fill="${labelBg}"/>
<rect x="${labelWidth}" width="${valueWidth}" height="${height}" fill="${valueBg}"/>
${highlight}
</g>
${icon}
<g fill="${labelText}" text-anchor="middle" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}"${spacingAttr}>
<text x="${labelTextX}" y="${shadowY}" fill="#000" fill-opacity=".25">${esc(label)}</text>
<text x="${labelTextX}" y="${textY}">${esc(label)}</text>
</g>
<g fill="${valueText}" text-anchor="middle" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}"${spacingAttr}>
<text x="${valueTextX}" y="${shadowY}" fill="#000" fill-opacity=".25">${esc(value)}</text>
<text x="${valueTextX}" y="${textY}">${esc(value)}</text>
</g>
</svg>`;
}
