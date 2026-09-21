import { NotFoundError, PendingError } from "./types";

export interface CurseForgeParams {
  /** Numeric project ID. Used with the official API when CURSEFORGE_API_KEY is set. */
  id?: string;
  /** Project slug, e.g. "jei". Assumes the "mc-mods" category unless `category` is given. */
  slug?: string;
  /** cfwidget category segment, default "mc-mods". Ignored when `id` is used. */
  category?: string;
}

// Official CurseForge API — exact, real-time, requires a free API key from
// https://console.curseforge.com/. Used only when `id` (numeric mod id) and
// CURSEFORGE_API_KEY are both present.
async function getViaOfficialApi(id: string, apiKey: string): Promise<number> {
  const res = await fetch(`https://api.curseforge.com/v1/mods/${encodeURIComponent(id)}`, {
    headers: { "x-api-key": apiKey, Accept: "application/json" },
  });
  if (res.status === 404) throw new NotFoundError(`CurseForge mod not found: ${id}`);
  if (!res.ok) throw new Error(`CurseForge API error (${res.status})`);
  const data = await res.json();
  return data.data.downloadCount as number;
}

// cfwidget.com — free, no API key needed, resolves by slug. Data can lag by
// up to ~15 minutes and a first-ever lookup may return 202 while it warms up.
async function getViaCfWidget(path: string): Promise<number> {
  const res = await fetch(`https://api.cfwidget.com/${path}`);
  if (res.status === 202) throw new PendingError(`CurseForge data warming up for: ${path}`);
  if (res.status === 404) throw new NotFoundError(`CurseForge project not found: ${path}`);
  if (!res.ok) throw new Error(`cfwidget error (${res.status})`);
  const data = await res.json();
  return data.downloads.total as number;
}

export async function getCurseForgeDownloads(params: CurseForgeParams): Promise<number> {
  const apiKey = process.env.CURSEFORGE_API_KEY;
  if (params.id && apiKey) {
    return getViaOfficialApi(params.id, apiKey);
  }
  if (params.id) {
    // No API key configured — fall back to cfwidget using the id as the path.
    return getViaCfWidget(params.id);
  }
  const category = params.category ?? "mc-mods";
  return getViaCfWidget(`minecraft/${category}/${params.slug}`);
}

export function curseforgeProjectUrl(params: CurseForgeParams): string {
  if (params.id) return `https://www.curseforge.com/projects/${params.id}`;
  const category = params.category ?? "mc-mods";
  return `https://www.curseforge.com/minecraft/${category}/${params.slug}`;
}
