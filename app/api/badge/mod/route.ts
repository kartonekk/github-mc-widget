import { getAuthorStats } from "@/lib/stats";
import { BANNER_H, BANNER_W, renderModCard } from "@/lib/mod-card";
import { modArtSources } from "@/lib/mod-art";
import { imageDataUri } from "@/lib/images";
import { errorBadge } from "@/lib/svg";

export const dynamic = "force-dynamic";

function svgResponse(body: string, cacheSeconds: number) {
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": `public, max-age=0, s-maxage=${cacheSeconds}, stale-while-revalidate=86400`,
    },
  });
}

// GET /api/badge/mod?id=<id> — one mod from lib/projects.config.ts, drawn
// over its own promo art with its total downloads.
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return svgResponse(errorBadge("missing ?id="), 60);

  try {
    const stats = await getAuthorStats();
    const project = stats.projects.find((p) => p.entry.id === id);
    if (!project) return svgResponse(errorBadge(`unknown mod: ${id}`), 60);

    const art = modArtSources(project);
    const [bannerDataUri, iconDataUri] = await Promise.all([
      art.bannerUrl ? imageDataUri(art.bannerUrl, { width: BANNER_W * 2, height: BANNER_H * 2, fit: art.bannerFit }) : undefined,
      art.iconUrl ? imageDataUri(art.iconUrl, { width: 104, height: 104, format: "png", pixelated: true }) : undefined,
    ]);
    // No screenshot to show: blow the icon up into a soft backdrop instead.
    const backdropDataUri =
      !bannerDataUri && art.iconUrl
        ? await imageDataUri(art.iconUrl, { width: BANNER_W, height: BANNER_H, blur: 14, dim: 0.55 })
        : undefined;

    const svg = renderModCard({
      id,
      title: project.title,
      tagline: project.entry.tagline,
      accent: art.accent,
      modrinthDownloads: project.modrinthDownloads,
      curseforgeDownloads: project.curseforgeDownloads,
      bannerDataUri,
      backdropDataUri,
      iconDataUri,
    });
    return svgResponse(svg, 3600);
  } catch {
    return svgResponse(errorBadge("unavailable"), 60);
  }
}
