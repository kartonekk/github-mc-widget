import { NotFoundError } from "./types";

const USER_AGENT = "github-mc-widget/1.0 (badge generator; +https://modrinth.com)";

export async function getModrinthDownloads(idOrSlug: string): Promise<number> {
  const res = await fetch(
    `https://api.modrinth.com/v2/project/${encodeURIComponent(idOrSlug)}`,
    { headers: { "User-Agent": USER_AGENT } }
  );

  if (res.status === 404) throw new NotFoundError(`Modrinth project not found: ${idOrSlug}`);
  if (!res.ok) throw new Error(`Modrinth API error (${res.status})`);

  const data = await res.json();
  return data.downloads as number;
}

export function modrinthProjectUrl(idOrSlug: string): string {
  return `https://modrinth.com/project/${encodeURIComponent(idOrSlug)}`;
}
