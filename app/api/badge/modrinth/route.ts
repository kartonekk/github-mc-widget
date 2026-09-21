import { NextRequest } from "next/server";
import { getModrinthDownloads } from "@/lib/modrinth";
import { renderBadge, errorBadge, BadgeStyle, BadgeTheme } from "@/lib/svg";
import { formatCount } from "@/lib/format";
import { MODRINTH_ICON_PATH, MODRINTH_COLOR } from "@/lib/icons";
import { NotFoundError } from "@/lib/types";

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
  const project = searchParams.get("project") ?? searchParams.get("slug");
  const label = searchParams.get("label") ?? "Modrinth";
  const style = (searchParams.get("style") as BadgeStyle) ?? undefined;
  const theme = (searchParams.get("theme") as BadgeTheme) ?? undefined;
  const color = searchParams.get("color");
  const noLogo = searchParams.get("logo") === "false";

  if (!project) {
    return svgResponse(errorBadge("missing ?project=", style, theme), 60);
  }

  try {
    const downloads = await getModrinthDownloads(project);
    const svg = renderBadge({
      label,
      value: `${formatCount(downloads)} downloads`,
      color: color ? `#${color.replace(/^#/, "")}` : MODRINTH_COLOR,
      style,
      theme,
      iconPath: noLogo ? undefined : MODRINTH_ICON_PATH,
    });
    return svgResponse(svg, 3600);
  } catch (err) {
    const message = err instanceof NotFoundError ? "not found" : "unavailable";
    return svgResponse(errorBadge(message, style, theme), err instanceof NotFoundError ? 3600 : 60);
  }
}
