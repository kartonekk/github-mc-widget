import sharp from "sharp";

// GitHub's image proxy won't let an SVG load external images, so every
// picture on a card has to be inlined as a data URI. Promo art is often a
// ~1MB PNG, so it's resized/cropped to exactly the size it's drawn at (2x
// for retina) and re-encoded before embedding — keeps each card well under
// GitHub's SVG size limit.

const USER_AGENT = "github-mc-widget/1.0 (badge generator; +https://github.com)";

export interface ImageOptions {
  width: number; // output px (already 2x if wanted)
  height: number;
  format?: "jpeg" | "png"; // png for icons/avatars (alpha, pixel art), jpeg for art
  pixelated?: boolean; // nearest-neighbour scaling, for pixel-art icons
  // "attention" crops to the most salient region — handy when a wide banner
  // has to fill a narrow slice. Defaults to centre.
  position?: "centre" | "attention";
  // "contain" letterboxes onto the card background instead of cropping.
  fit?: "cover" | "contain";
  dim?: number; // 0–1 brightness multiplier, for art drawn behind text
  blur?: number; // gaussian sigma, for turning an icon into a soft backdrop
}

// Warm serverless instances reuse fetched art across requests.
const cache = new Map<string, Promise<string | undefined>>();

export function imageDataUri(url: string, opts: ImageOptions): Promise<string | undefined> {
  const key = `${url}|${JSON.stringify(opts)}`;
  let hit = cache.get(key);
  if (!hit) {
    hit = load(url, opts);
    cache.set(key, hit);
    // Don't pin failures — the next request gets a fresh try.
    hit.then((v) => v ?? cache.delete(key));
  }
  return hit;
}

async function load(url: string, opts: ImageOptions): Promise<string | undefined> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) return undefined;
    const type = res.headers.get("content-type")?.split(";")[0] ?? "";
    if (type && !type.startsWith("image/") && type !== "application/octet-stream") return undefined;

    const format = opts.format ?? "jpeg";
    let img = sharp(Buffer.from(await res.arrayBuffer())).resize(opts.width, opts.height, {
      fit: opts.fit ?? "cover",
      background: "#0d1117",
      // Contained art hugs the top so the letterbox lands in the card's bottom fade.
      position: opts.position === "attention" ? sharp.strategy.attention : opts.fit === "contain" ? "north" : "centre",
      kernel: opts.pixelated ? "nearest" : "lanczos3",
    });
    if (opts.blur) img = img.blur(opts.blur);
    if (opts.dim !== undefined) img = img.modulate({ brightness: opts.dim });
    const out = format === "png" ? await img.png({ compressionLevel: 9 }).toBuffer() : await img.flatten({ background: "#0d1117" }).jpeg({ quality: 72, mozjpeg: true }).toBuffer();
    return `data:image/${format};base64,${out.toString("base64")}`;
  } catch {
    return undefined;
  }
}
