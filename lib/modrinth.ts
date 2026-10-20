import { NotFoundError } from "./types";

const USER_AGENT = "github-mc-widget/1.0 (badge generator; +https://modrinth.com)";

export interface ModrinthProjectSummary {
  title: string;
  downloads: number;
  iconUrl?: string;
  featuredImageUrl?: string; // featured gallery image, else the first one
  color?: string; // hex, Modrinth's color sampled from the icon
  sourceUrl?: string;
}

interface ModrinthApiProject {
  slug: string;
  title: string;
  downloads: number;
  icon_url?: string | null;
  color?: number | null;
  source_url?: string | null;
  gallery?: { url: string; featured: boolean; ordering?: number }[];
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

  const projects: ModrinthApiProject[] = await res.json();
  const map: Record<string, ModrinthProjectSummary> = {};
  for (const p of projects) {
    const gallery = [...(p.gallery ?? [])].sort((a, b) => (a.ordering ?? 0) - (b.ordering ?? 0));
    map[p.slug] = {
      title: p.title,
      downloads: p.downloads,
      iconUrl: p.icon_url ?? undefined,
      featuredImageUrl: (gallery.find((g) => g.featured) ?? gallery[0])?.url,
      color: typeof p.color === "number" ? "#" + p.color.toString(16).padStart(6, "0") : undefined,
      sourceUrl: p.source_url ?? undefined,
    };
  }
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
