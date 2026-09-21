// Reads the pre-scraped CurseForge data (see scripts/scrape-curseforge.mjs
// and .github/workflows/scrape-curseforge.yml). This file is committed to
// the repo and updated on a schedule, so reading it here is just a plain
// import — no live scraping happens on the request path.

import downloads from "@/data/curseforge-downloads.json";

export interface ScrapedCurseForgeProject {
  slug: string;
  category: string;
  downloads: number;
  updatedAt: string;
}

const DATA = downloads as Record<string, ScrapedCurseForgeProject>;

export function getKnownCurseForgeProject(slug: string, category = "mc-mods"): ScrapedCurseForgeProject | null {
  return DATA[`${category}/${slug}`] ?? null;
}

export function getAllKnownCurseForgeProjects(): ScrapedCurseForgeProject[] {
  return Object.values(DATA);
}
