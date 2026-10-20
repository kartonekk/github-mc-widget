import { imageDataUri } from "./images";
import { NotFoundError } from "./types";

const USER_AGENT = "github-mc-widget/1.0 (badge generator; +https://github.com)";

export interface OrgSummary {
  login: string;
  publicRepos: number;
  avatarUrl?: string;
}

export async function getOrgPublicRepoCount(login: string): Promise<OrgSummary> {
  const res = await fetch(`https://api.github.com/orgs/${encodeURIComponent(login)}`, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/vnd.github+json" },
  });

  if (res.status === 404) throw new NotFoundError(`GitHub org not found: ${login}`);
  if (!res.ok) throw new Error(`GitHub API error (${res.status})`);

  const data = await res.json();
  return {
    login: data.login as string,
    publicRepos: data.public_repos as number,
    avatarUrl: data.avatar_url as string | undefined,
  };
}

export interface OrgRepo {
  name: string;
  stars: number;
  fork: boolean;
}

// Most recently pushed public repos, for the org card's "repos" showcase.
export async function getOrgRecentRepos(login: string, count = 6): Promise<OrgRepo[]> {
  try {
    const res = await fetch(
      `https://api.github.com/orgs/${encodeURIComponent(login)}/repos?sort=pushed&per_page=${count}`,
      { headers: { "User-Agent": USER_AGENT, Accept: "application/vnd.github+json" } }
    );
    if (!res.ok) return [];
    const data: { name: string; stargazers_count: number; fork: boolean }[] = await res.json();
    return data.map((r) => ({ name: r.name, stars: r.stargazers_count, fork: r.fork }));
  } catch {
    return [];
  }
}

// Square avatar, inlined as a data URI (see lib/images.ts). Returns undefined on any failure.
export async function getAvatarDataUri(avatarUrl: string, size = 80): Promise<string | undefined> {
  try {
    const url = new URL(avatarUrl);
    url.searchParams.set("s", String(size));
    return await imageDataUri(url.toString(), { width: size, height: size, format: "png" });
  } catch {
    return undefined;
  }
}
