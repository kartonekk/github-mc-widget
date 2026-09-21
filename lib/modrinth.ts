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

export async function getModrinthUserTotalDownloads(username: string): Promise<number> {
  const res = await fetch(
    `https://api.modrinth.com/v2/user/${encodeURIComponent(username)}/projects`,
    { headers: { "User-Agent": USER_AGENT } }
  );

  if (res.status === 404) throw new NotFoundError(`Modrinth user not found: ${username}`);
  if (!res.ok) throw new Error(`Modrinth API error (${res.status})`);

  const projects: { downloads: number }[] = await res.json();
  return projects.reduce((sum, p) => sum + p.downloads, 0);
}

export interface ModrinthProjectSummary {
  title: string;
  downloads: number;
}

export async function getModrinthUserProjectsMap(
  username: string
): Promise<Record<string, ModrinthProjectSummary>> {
  const res = await fetch(
    `https://api.modrinth.com/v2/user/${encodeURIComponent(username)}/projects`,
    { headers: { "User-Agent": USER_AGENT } }
  );

  if (res.status === 404) throw new NotFoundError(`Modrinth user not found: ${username}`);
  if (!res.ok) throw new Error(`Modrinth API error (${res.status})`);

  const projects: { slug: string; title: string; downloads: number }[] = await res.json();
  const map: Record<string, ModrinthProjectSummary> = {};
  for (const p of projects) map[p.slug] = { title: p.title, downloads: p.downloads };
  return map;
}

export async function getModrinthUserCreated(username: string): Promise<string> {
  const res = await fetch(`https://api.modrinth.com/v2/user/${encodeURIComponent(username)}`, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (res.status === 404) throw new NotFoundError(`Modrinth user not found: ${username}`);
  if (!res.ok) throw new Error(`Modrinth API error (${res.status})`);

  const data = await res.json();
  return data.created as string;
}
