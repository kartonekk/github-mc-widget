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

// Fetches an avatar and inlines it as a data URI — GitHub's image proxy won't let an
// SVG load external images, so it has to be embedded. Returns undefined on any failure.
export async function getAvatarDataUri(avatarUrl: string, size = 80): Promise<string | undefined> {
  try {
    const url = new URL(avatarUrl);
    url.searchParams.set("s", String(size));
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) return undefined;
    const type = res.headers.get("content-type")?.split(";")[0] || "image/png";
    if (!type.startsWith("image/")) return undefined;
    const buf = Buffer.from(await res.arrayBuffer());
    return `data:${type};base64,${buf.toString("base64")}`;
  } catch {
    return undefined;
  }
}
