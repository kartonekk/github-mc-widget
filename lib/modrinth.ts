import { NotFoundError } from "./types";

const USER_AGENT = "github-mc-widget/1.0 (badge generator; +https://modrinth.com)";

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
