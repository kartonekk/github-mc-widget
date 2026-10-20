import { getAvatarDataUri, getOrgPublicRepoCount, getOrgRecentRepos } from "@/lib/orgs";
import { artSliceSize, renderOrgCard, type OrgShowcase } from "@/lib/org-card";
import { getAuthorStats } from "@/lib/stats";
import { modArtSources, modRepoOwner } from "@/lib/mod-art";
import { imageDataUri } from "@/lib/images";
import { errorBadge } from "@/lib/svg";
import { ORGS_CONFIG } from "@/lib/orgs.config";
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

// The configured mods whose source lives in this org, with their art.
async function modsShowcase(login: string): Promise<OrgShowcase> {
  const stats = await getAuthorStats().catch(() => null);
  const mods = (stats?.projects ?? []).filter((p) => modRepoOwner(p)?.toLowerCase() === login.toLowerCase());
  const sources = mods.map(modArtSources);
  const withArt = sources.filter((s) => s.bannerUrl).slice(0, 3);
  const slice = artSliceSize(withArt.length);

  const [art, icons] = await Promise.all([
    Promise.all(withArt.map((s) => imageDataUri(s.bannerUrl!, { width: slice.width * 2, height: slice.height * 2, position: "attention", dim: 0.8 }))),
    Promise.all(sources.map((s) => (s.iconUrl ? imageDataUri(s.iconUrl, { width: 60, height: 60, format: "png", pixelated: true }) : undefined))),
  ]);
  return {
    kind: "mods",
    art: art.filter((a): a is string => !!a),
    icons: mods.map((m, i) => ({ title: m.title, iconDataUri: icons[i] })),
  };
}

// GET /api/badge/org?login=<org> — that single org's public repo count,
// styled per lib/orgs.config.ts (accent + mods/repos showcase).
export async function GET(req: Request) {
  const login = new URL(req.url).searchParams.get("login");
  if (!login) return svgResponse(errorBadge("missing ?login="), 60);

  try {
    const org = await getOrgPublicRepoCount(login);
    const config = ORGS_CONFIG.orgs.find((o) => o.login.toLowerCase() === org.login.toLowerCase());
    const [avatarDataUri, showcase] = await Promise.all([
      org.avatarUrl ? getAvatarDataUri(org.avatarUrl, 96) : undefined,
      config?.showcase === "mods"
        ? modsShowcase(org.login)
        : getOrgRecentRepos(org.login).then((repos): OrgShowcase => ({ kind: "repos", repos: repos.map((r) => r.name) })),
    ]);
    const svg = renderOrgCard({
      login: org.login,
      repoCount: org.publicRepos,
      subtitle: config?.subtitle,
      accent: config?.accent ?? AUTHOR_CONFIG.accent,
      avatarDataUri,
      showcase,
    });
    return svgResponse(svg, 3600);
  } catch {
    return svgResponse(errorBadge("unavailable"), 60);
  }
}
