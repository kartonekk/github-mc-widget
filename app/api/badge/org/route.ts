import { getOrgPublicRepoCount } from "@/lib/orgs";
import { renderOrgCard } from "@/lib/org-card";
import { errorBadge } from "@/lib/svg";
import { ORGS_CONFIG } from "@/lib/orgs.config";

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

// GET /api/badge/org?login=<org> — that single org's public repo count.
export async function GET(req: Request) {
  const login = new URL(req.url).searchParams.get("login");
  if (!login) return svgResponse(errorBadge("missing ?login="), 60);

  try {
    const org = await getOrgPublicRepoCount(login);
    const subtitle = ORGS_CONFIG.orgs.find((o) => o.login.toLowerCase() === org.login.toLowerCase())?.subtitle;
    return svgResponse(renderOrgCard({ login: org.login, repoCount: org.publicRepos, subtitle }), 3600);
  } catch {
    return svgResponse(errorBadge("unavailable"), 60);
  }
}
