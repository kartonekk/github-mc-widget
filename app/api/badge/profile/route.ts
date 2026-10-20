import { getAuthorStats } from "@/lib/stats";
import { renderProfileCard } from "@/lib/profile-card";
import { modArtSources } from "@/lib/mod-art";
import { imageDataUri } from "@/lib/images";
import { errorBadge } from "@/lib/svg";
import { AUTHOR_CONFIG } from "@/lib/projects.config";

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

function formatMonth(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

// Profile card: total downloads with a per-mod breakdown (icons, share bar,
// per-platform totals), all config-driven (see lib/projects.config.ts) — no
// query params required.
export async function GET() {
  try {
    const stats = await getAuthorStats();

    const [avatarDataUri, ...icons] = await Promise.all([
      imageDataUri(`https://github.com/${AUTHOR_CONFIG.githubUser}.png?size=96`, { width: 96, height: 96, format: "png" }),
      ...stats.projects.slice(0, 5).map((p) => {
        const url = modArtSources(p).iconUrl;
        return url ? imageDataUri(url, { width: 44, height: 44, format: "png", pixelated: true }) : undefined;
      }),
    ]);

    const svg = renderProfileCard({
      name: AUTHOR_CONFIG.displayName,
      subtitle: `Minecraft mods · since ${formatMonth(stats.memberSince)}`,
      accent: AUTHOR_CONFIG.accent,
      avatarDataUri,
      totalDownloads: stats.totalDownloads,
      modrinthDownloads: stats.modrinthDownloads,
      curseforgeDownloads: stats.curseforgeDownloads,
      mods: stats.projects.map((p, i) => ({ title: p.title, downloads: p.downloads, iconDataUri: icons[i] })),
      footnote: `${stats.projectCount} projects · ${daysSince(stats.memberSince)} days`,
      seed: AUTHOR_CONFIG.modrinthUser,
    });

    return svgResponse(svg, 3600);
  } catch {
    return svgResponse(errorBadge("unavailable"), 60);
  }
}
