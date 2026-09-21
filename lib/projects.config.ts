// Personal config — edit this to match your own accounts and projects.
// Each entry pairs the same project across platforms (slugs differ between
// Modrinth and CurseForge) so totals/"best project" can be computed
// correctly instead of guessing by name.
//
// The CurseForge side here must match data/curseforge-projects.json (that
// file drives the scraper; this one is what the app reads at runtime).

export interface CurseForgeRef {
  slug: string;
  category: string; // e.g. "mc-mods", "texture-packs", "modpacks"
}

export interface ProjectEntry {
  title: string;
  modrinthSlug?: string;
  curseforge?: CurseForgeRef;
}

export const AUTHOR_CONFIG = {
  modrinthUser: "Kartonek",

  projects: [
    { title: "Head Locator", modrinthSlug: "headlocator", curseforge: { slug: "head-locator", category: "mc-mods" } },
    { title: "Tiny", modrinthSlug: "tiny", curseforge: { slug: "tiny-players", category: "mc-mods" } },
    { title: "Spoty Widget", modrinthSlug: "spoty-widget", curseforge: { slug: "spoty-widget", category: "mc-mods" } },
    { title: "[HMI] Tiny Items", modrinthSlug: "hmi-tiny-items", curseforge: { slug: "hmi-tiny-items", category: "texture-packs" } },
    { title: "Kart's Chaotic Kit", modrinthSlug: "kck" }, // not published on CurseForge
  ] as ProjectEntry[],
};
