import { NextRequest } from "next/server";
import { getCurseForgeDownloads } from "@/lib/curseforge";
import { renderBadge, errorBadge, BadgeStyle, BadgeTheme } from "@/lib/svg";
import { formatCount } from "@/lib/format";
import { CURSEFORGE_ICON_PATH, CURSEFORGE_COLOR } from "@/lib/icons";
import { NotFoundError, PendingError } from "@/lib/types";

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
  const id = searchParams.get("id") ?? undefined;
  const slug = searchParams.get("slug") ?? searchParams.get("project") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const label = searchParams.get("label") ?? "CurseForge";
  const style = (searchParams.get("style") as BadgeStyle) ?? undefined;
  const theme = (searchParams.get("theme") as BadgeTheme) ?? undefined;
  const color = searchParams.get("color");
  const noLogo = searchParams.get("logo") === "false";

  if (!id && !slug) {
    return svgResponse(errorBadge("missing ?slug= or ?id=", style, theme), 60);
  }

  try {
    const downloads = await getCurseForgeDownloads({ id, slug, category });
    const svg = renderBadge({
      label,
      value: `${formatCount(downloads)} downloads`,
      color: color ? `#${color.replace(/^#/, "")}` : CURSEFORGE_COLOR,
      style,
      theme,
      iconPath: noLogo ? undefined : CURSEFORGE_ICON_PATH,
    });
    return svgResponse(svg, 3600);
  } catch (err) {
    if (err instanceof PendingError) {
      return svgResponse(renderBadge({ label, value: "warming up…", color: "#9f9f9f", style, theme }), 15);
    }
    const message = err instanceof NotFoundError ? "not found" : "unavailable";
    return svgResponse(errorBadge(message, style, theme), err instanceof NotFoundError ? 3600 : 60);
  }
}
