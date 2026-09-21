import { getOrgPublicRepoCount } from "@/lib/orgs";
import { renderOrgsCard } from "@/lib/orgs-card";
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

// Two-column card showing public repo counts for the two orgs configured in
// lib/orgs.config.ts. No query params required.
export async function GET() {
  try {
    const [a, b] = await Promise.all(ORGS_CONFIG.orgs.map(getOrgPublicRepoCount));

    const svg = renderOrgsCard({
      orgs: [
        { login: a.login, repoCount: a.publicRepos },
        { login: b.login, repoCount: b.publicRepos },
      ],
    });

    return svgResponse(svg, 3600);
  } catch {
    return svgResponse(errorBadge("unavailable"), 60);
  }
}
