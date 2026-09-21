import { NotFoundError } from "./types";

const USER_AGENT = "github-mc-widget/1.0 (badge generator; +https://github.com)";

export interface OrgSummary {
  login: string;
  publicRepos: number;
}

export async function getOrgPublicRepoCount(login: string): Promise<OrgSummary> {
  const res = await fetch(`https://api.github.com/orgs/${encodeURIComponent(login)}`, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/vnd.github+json" },
  });

  if (res.status === 404) throw new NotFoundError(`GitHub org not found: ${login}`);
  if (!res.ok) throw new Error(`GitHub API error (${res.status})`);

  const data = await res.json();
  return { login: data.login as string, publicRepos: data.public_repos as number };
}
