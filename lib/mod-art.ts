import { AUTHOR_CONFIG, repoFileUrl } from "./projects.config";
import { readableAccent } from "./card";
import type { ProjectStat } from "./stats";

export interface ModArtSources {
  bannerUrl?: string;
  bannerFit: "cover" | "contain";
  iconUrl?: string;
  accent: string;
}

// Direct image URLs from the config first, then promo art from the mod's own
// repo, else Modrinth's featured gallery screenshot and icon.
export function modArtSources(p: ProjectStat): ModArtSources {
  const art = p.entry.art;
  return {
    bannerUrl: p.entry.bannerUrl ?? (art?.banner ? repoFileUrl(art, art.banner) : p.modrinth?.featuredImageUrl),
    bannerFit: !p.entry.bannerUrl && art?.banner ? art.bannerFit ?? "cover" : "cover",
    iconUrl: p.entry.iconUrl ?? (art?.icon ? repoFileUrl(art, art.icon) : p.modrinth?.iconUrl),
    accent: readableAccent(p.entry.accent ?? p.modrinth?.color ?? AUTHOR_CONFIG.accent),
  };
}

// GitHub owner of the mod's source — from its art repo, else Modrinth's source link.
export function modRepoOwner(p: ProjectStat): string | undefined {
  if (p.entry.art) return p.entry.art.repo.split("/")[0];
  return p.modrinth?.sourceUrl?.match(/github\.com\/([^/]+)\//i)?.[1];
}
