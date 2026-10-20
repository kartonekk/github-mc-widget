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

export const FONT = "Verdana,Geneva,DejaVu Sans,sans-serif";

// Verdana advance widths for ASCII 32–126, in hundredths of an em (measured).
// Characters outside that range fall back to a wide default.
export const BOLD_CHAR = [34,40,59,87,71,127,86,33,54,54,71,87,36,48,36,69,71,71,71,71,71,71,71,71,71,71,40,40,87,87,87,62,96,78,76,72,83,68,65,81,84,55,56,77,64,95,85,85,73,85,78,71,68,81,76,113,76,74,69,54,69,54,87,71,71,67,70,59,70,66,42,70,71,34,40,67,34,106,71,69,70,70,50,59,46,71,65,98,67,65,60,71,54,71,87];
export const REG_CHAR = [35,39,46,82,64,108,73,27,45,45,64,82,36,45,36,45,64,64,64,64,64,64,64,64,64,64,45,45,82,82,82,55,100,68,69,70,77,63,57,78,75,42,45,69,56,84,75,79,60,79,70,68,62,73,68,99,69,62,69,45,45,45,82,64,64,60,62,52,62,60,35,62,63,27,34,59,27,97,63,61,62,62,43,52,39,63,59,82,59,59,53,63,45,63,82];
const ELLIPSIS_EM = 1;

export function estWidth(s: string, fontSize: number, widths: number[]): number {
  let em = 0;
  for (const ch of s) {
    const code = ch.charCodeAt(0);
    em += (code >= 32 && code < 127 ? widths[code - 32] : 90) / 100;
  }
  return em * fontSize;
}

// Shrink through the given font sizes until the text fits, then truncate at the smallest.
export function fitText(s: string, maxWidth: number, sizes: number[], widths: number[]): { text: string; size: number } {
  for (const size of sizes) {
    if (estWidth(s, size, widths) <= maxWidth) return { text: s, size };
  }
  const size = sizes[sizes.length - 1];
  const chars = [...s];
  while (chars.length > 1 && estWidth(chars.join(""), size, widths) + ELLIPSIS_EM * size > maxWidth) chars.pop();
  return { text: chars.join("").trimEnd() + "…", size };
}

// Lift an accent toward white until it reads on the dark card background.
export function readableAccent(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  let [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const lum = () => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  for (let i = 0; i < 10 && lum() < 0.45; i++) {
    [r, g, b] = [r, g, b].map((c) => Math.round(c + (255 - c) * 0.15));
  }
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}
