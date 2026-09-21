import { NextRequest } from "next/server";
import { getModrinthUserTotalDownloads } from "@/lib/modrinth";
import { getAllKnownCurseForgeProjects } from "@/lib/curseforge-data";
import { renderBadge, errorBadge, BadgeStyle, BadgeTheme } from "@/lib/svg";
import { renderCard } from "@/lib/card";
import { formatCount } from "@/lib/format";
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

// Aggregate badge: total downloads across every project by this author on
// both Modrinth (fetched live) and CurseForge (read from the pre-scraped
// data/curseforge-downloads.json — see scripts/scrape-curseforge.mjs).
// Driven by lib/projects.config.ts, no query params required.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const label = searchParams.get("label") ?? "Total Downloads";
  const style = (searchParams.get("style") as BadgeStyle) ?? undefined;
  const theme = (searchParams.get("theme") as BadgeTheme) ?? undefined;
  const color = searchParams.get("color");

  const cfTotal = getAllKnownCurseForgeProjects().reduce((sum, p) => sum + p.downloads, 0);

  let mrTotal = 0;
  try {
    mrTotal = await getModrinthUserTotalDownloads(AUTHOR_CONFIG.modrinthUser);
  } catch {
    if (cfTotal === 0) {
      return svgResponse(errorBadge("unavailable", style, theme), 60);
    }
    // Modrinth hiccup — still show what we have from CurseForge rather than failing outright.
  }

  const total = mrTotal + cfTotal;
  const svg =
    style === "card"
      ? renderCard({ label, count: total, colorFrom: "#5ec8ff", colorTo: "#3b6fd8" })
      : renderBadge({
          label,
          value: `${formatCount(total)} downloads`,
          color: color ? `#${color.replace(/^#/, "")}` : "#4c9fe8",
          style,
          theme,
        });
  return svgResponse(svg, 3600);
}
