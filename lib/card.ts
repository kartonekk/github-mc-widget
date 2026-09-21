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
