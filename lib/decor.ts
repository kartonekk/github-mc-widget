// Deterministic per-name layout for the two decorative corner squares that
// texture each card's background — same seed always renders the same
// squares (cacheable SVG output), different seeds (e.g. different org
// names) get a visually distinct arrangement so cards don't all look
// identical.

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface CornerSquare {
  x: number;
  y: number;
  size: number;
  radius: number;
  rotation: number;
  opacity: number;
}

// Top-right square lives around (w, 0), bottom-left around (0, h) — the
// randomization only jitters position/size/rotation within each corner, it
// never relocates a square to a different part of the card.
export function cornerSquares(seed: string, w: number, h: number): [CornerSquare, CornerSquare] {
  const rand = mulberry32(hashSeed(seed));
  const pick = (min: number, max: number) => min + rand() * (max - min);

  const trSize = pick(50, 80);
  const topRight: CornerSquare = {
    size: trSize,
    radius: pick(14, 20),
    rotation: pick(0, 36),
    opacity: pick(0.035, 0.065),
    x: w - pick(60, 110),
    y: pick(-30, 10) - trSize * 0.3,
  };

  const blSize = pick(40, 66);
  const bottomLeft: CornerSquare = {
    size: blSize,
    radius: pick(10, 18),
    rotation: pick(0, 36),
    opacity: pick(0.03, 0.055),
    x: pick(-30, 10) - blSize * 0.2,
    y: h - pick(60, 100),
  };

  return [topRight, bottomLeft];
}

export function renderCornerSquares(squares: [CornerSquare, CornerSquare], color: string): string {
  return squares
    .map((s) => {
      const cx = s.x + s.size / 2;
      const cy = s.y + s.size / 2;
      return `<rect x="${s.x.toFixed(1)}" y="${s.y.toFixed(1)}" width="${s.size.toFixed(1)}" height="${s.size.toFixed(1)}" rx="${s.radius.toFixed(1)}" fill="${color}" fill-opacity="${s.opacity.toFixed(3)}" transform="rotate(${s.rotation.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)})"/>`;
    })
    .join("\n");
}
