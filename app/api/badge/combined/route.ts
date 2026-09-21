import { NextRequest } from "next/server";
import { getModrinthDownloads } from "@/lib/modrinth";
import { getCurseForgeDownloads } from "@/lib/curseforge";
import { renderBadge, errorBadge, BadgeStyle, BadgeTheme } from "@/lib/svg";
import { formatCount } from "@/lib/format";

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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const modrinth = searchParams.get("modrinth") ?? undefined;
  const cfSlug = searchParams.get("curseforge") ?? undefined;
  const cfId = searchParams.get("curseforgeId") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const label = searchParams.get("label") ?? "Downloads";
  const style = (searchParams.get("style") as BadgeStyle) ?? undefined;
  const theme = (searchParams.get("theme") as BadgeTheme) ?? undefined;
  const color = searchParams.get("color");

  if (!modrinth && !cfSlug && !cfId) {
    return svgResponse(errorBadge("missing ?modrinth= / ?curseforge=", style, theme), 60);
  }

  const results = await Promise.allSettled([
    modrinth ? getModrinthDownloads(modrinth) : Promise.resolve(0),
    cfSlug || cfId ? getCurseForgeDownloads({ slug: cfSlug, id: cfId, category }) : Promise.resolve(0),
  ]);

  const values = results.map((r) => (r.status === "fulfilled" ? r.value : null));
  if (values.every((v) => v === null)) {
    return svgResponse(errorBadge("unavailable", style, theme), 60);
  }

  const total = values.reduce((sum: number, v) => sum + (v ?? 0), 0);
  const svg = renderBadge({
    label,
    value: `${formatCount(total)} downloads`,
    color: color ? `#${color.replace(/^#/, "")}` : "#4c9fe8",
    style,
    theme,
  });
  return svgResponse(svg, 3600);
}
