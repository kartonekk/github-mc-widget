import { getAuthorStats } from "@/lib/stats";
import { renderProfileCard } from "@/lib/profile-card";
import { errorBadge } from "@/lib/svg";
import { MODRINTH_ICON_PATH, CURSEFORGE_ICON_PATH } from "@/lib/icons";
import { formatCard } from "@/lib/card";

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

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

// Dashboard-style profile card: total downloads, best project, and account
// age, all config-driven (see lib/projects.config.ts) — no query params
// required.
export async function GET() {
  try {
    const stats = await getAuthorStats();

    const svg = renderProfileCard({
      totalDownloads: stats.totalDownloads,
      modrinthIconPath: MODRINTH_ICON_PATH,
      curseforgeIconPath: CURSEFORGE_ICON_PATH,
      rows: [
        {
          title: stats.bestProject.title,
          subtitle: "most downloaded",
          value: formatCard(stats.bestProject.downloads),
          unit: "downloads",
          color: "#f2c744",
        },
        {
          title: "Projects",
          subtitle: "published",
          value: String(stats.projectCount),
          unit: "total",
          color: "#4dd8c0",
        },
        {
          title: "Member since",
          subtitle: formatDate(stats.memberSince),
          value: String(daysSince(stats.memberSince)),
          unit: "days",
          color: "#b98cf2",
        },
      ],
    });

    return svgResponse(svg, 3600);
  } catch {
    return svgResponse(errorBadge("unavailable"), 60);
  }
}
