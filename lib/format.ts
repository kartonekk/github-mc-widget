export function formatCount(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return trim(n / 1_000_000_000) + "B";
  if (abs >= 1_000_000) return trim(n / 1_000_000) + "M";
  if (abs >= 1_000) return trim(n / 1_000) + "k";
  return String(Math.round(n));
}

function trim(n: number): string {
  return (Math.round(n * 10) / 10).toFixed(1).replace(/\.0$/, "");
}
