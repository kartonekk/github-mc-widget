import { AUTHOR_CONFIG, type ProjectEntry } from "./projects.config";
import { getModrinthUserProjectsMap, getModrinthUserCreated, type ModrinthProjectSummary } from "./modrinth";
import { getKnownCurseForgeProject } from "./curseforge-data";

export interface ProjectStat {
  entry: ProjectEntry;
  title: string;
  downloads: number;
  modrinthDownloads: number;
  curseforgeDownloads: number;
  modrinth?: ModrinthProjectSummary;
}

export interface AuthorStats {
  totalDownloads: number;
  modrinthDownloads: number;
  curseforgeDownloads: number;
  projectCount: number;
  bestProject: ProjectStat;
  projects: ProjectStat[]; // most downloaded first
  memberSince: string; // ISO date, from Modrinth account creation
}

export async function getAuthorStats(): Promise<AuthorStats> {
  const [mrMap, memberSince] = await Promise.all([
    getModrinthUserProjectsMap(AUTHOR_CONFIG.modrinthUser),
    getModrinthUserCreated(AUTHOR_CONFIG.modrinthUser),
  ]);

  const projects: ProjectStat[] = AUTHOR_CONFIG.projects.map((p) => {
    const mr = p.modrinthSlug ? mrMap[p.modrinthSlug] : undefined;
    const cf = p.curseforge ? getKnownCurseForgeProject(p.curseforge.slug, p.curseforge.category) : null;
    const modrinthDownloads = mr?.downloads ?? 0;
    const curseforgeDownloads = cf?.downloads ?? 0;
    return {
      entry: p,
      title: p.title,
      downloads: modrinthDownloads + curseforgeDownloads,
      modrinthDownloads,
      curseforgeDownloads,
      modrinth: mr,
    };
  });
  projects.sort((a, b) => b.downloads - a.downloads);

  const sum = (f: (p: ProjectStat) => number) => projects.reduce((s, p) => s + f(p), 0);

  return {
    totalDownloads: sum((p) => p.downloads),
    modrinthDownloads: sum((p) => p.modrinthDownloads),
    curseforgeDownloads: sum((p) => p.curseforgeDownloads),
    projectCount: projects.length,
    bestProject: projects[0],
    projects,
    memberSince,
  };
}
