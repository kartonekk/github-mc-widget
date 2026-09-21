import { AUTHOR_CONFIG } from "./projects.config";
import { getModrinthUserProjectsMap, getModrinthUserCreated } from "./modrinth";
import { getKnownCurseForgeProject } from "./curseforge-data";

export interface ProjectStat {
  title: string;
  downloads: number;
}

export interface AuthorStats {
  totalDownloads: number;
  projectCount: number;
  bestProject: ProjectStat;
  memberSince: string; // ISO date, from Modrinth account creation
}

export async function getAuthorStats(): Promise<AuthorStats> {
  const [mrMap, memberSince] = await Promise.all([
    getModrinthUserProjectsMap(AUTHOR_CONFIG.modrinthUser),
    getModrinthUserCreated(AUTHOR_CONFIG.modrinthUser),
  ]);

  const stats: ProjectStat[] = AUTHOR_CONFIG.projects.map((p) => {
    const mr = p.modrinthSlug ? mrMap[p.modrinthSlug] : undefined;
    const cf = p.curseforge ? getKnownCurseForgeProject(p.curseforge.slug, p.curseforge.category) : null;
    const downloads = (mr?.downloads ?? 0) + (cf?.downloads ?? 0);
    return { title: p.title, downloads };
  });

  const totalDownloads = stats.reduce((sum, p) => sum + p.downloads, 0);
  const bestProject = stats.reduce((best, p) => (p.downloads > best.downloads ? p : best), stats[0]);

  return { totalDownloads, projectCount: stats.length, bestProject, memberSince };
}
